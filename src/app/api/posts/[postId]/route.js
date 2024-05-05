import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import ApiResponse from "@/utils/ApiResponse";
import { Post, Like, SavedPost, Follow, Comment, User, Hashtag } from "@/models";
import mongoose from "mongoose";

export const GET = async (req, { params }) => {
	await connectToDB();
	try {
		const token = await getToken({ req });
		const user = token?.user;

		const isValid = mongoose.Types.ObjectId.isValid(params.postId);
		if (!isValid) return new Response(JSON.stringify({ message: "Post not found" }), { status: 400 });

		const postId = new mongoose.Types.ObjectId(params.postId);

		const response = await Post.findById(postId)
			.populate({
				path: "user",
				select: "username picture",
			})
			.populate({
				path: "photos.tags.user",
				select: "username nickname picture",
			})
			.lean();

		if (!response) return new Response(JSON.stringify({ message: "Post not found" }), { status: 400 });

		const isPrivate = response.isPrivate;
		const likeHidden = response.likeHidden;

		if (token) {
			const hasLiked = await Like.findOne({ user: new mongoose.Types.ObjectId(user._id), post: new mongoose.Types.ObjectId(postId) }, { _id: 1 });
			response.hasLiked = hasLiked ? true : false;

			const hasSaved = await SavedPost.findOne({ user: new mongoose.Types.ObjectId(user._id), post: new mongoose.Types.ObjectId(postId) }, { _id: 1 });
			response.hasSaved = hasSaved ? true : false;

			const isFollowing = await Follow.findOne({ follower: new mongoose.Types.ObjectId(user._id), following: new mongoose.Types.ObjectId(response.user._id) }, { _id: 1 });
			response.isFollowing = isFollowing ? true : false;
		} else {
			response.hasLiked = false;
			response.hasSaved = false;
			response.isFollowing = false;
		}

		const isOwner = response.user.username === user?.username;
		response.isOwner = isOwner;

		// only return to followers or owner if private
		if (isPrivate && !isOwner && !response.isFollowing) {
			return new Response(JSON.stringify({ message: "No permission" }), { status: 403 });
		}

		// hide likes if hidden unless is owner
		if (likeHidden && !isOwner) {
			response.likeCount = null;
		}

		// dont fetch comments if disabled comment
		if (!response.commentDisabled) {
			// get parent comments and check has liked
			const comments = await Comment.find({ post: new mongoose.Types.ObjectId(postId), parentComment: null })
				.populate({
					path: "user",
					select: "username picture",
				})
				.lean();

			if (token) {
				// get all the liked comments
				const commentIds = comments.map((comment) => comment._id);

				let likedComments = await Like.find(
					{
						comment: { $in: commentIds },
						user: new mongoose.Types.ObjectId(user._id),
					},
					{ _id: 0, comment: 1 }
				).lean();

				likedComments.forEach((comment) => (comment = comment.comment.toString()));

				comments.forEach((comment) => {
					comment.hasLiked = likedComments.includes(comment._id.toString());
				});
			} else {
				comments.forEach((comment) => {
					comment.hasLiked = false;
				});
			}

			response.comments = comments;
		} else {
			response.comments = [];
		}

		return ApiResponse(response);
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get post, try again later" }), { status: 500 });
	}
};

export const POST = async (req, { params }) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const isValid = mongoose.Types.ObjectId.isValid(params.postId);
		if (!isValid) return new Response(JSON.stringify({ message: "Post not found" }), { status: 400 });

		const postId = new mongoose.Types.ObjectId(params.postId);

		let editedFields = await req.json();

		const objKeys = Object.keys(editedFields);
		const allowedFields = ["photos", "description", "likeHidden", "commentDisabled"];

		const hasInvalidKey = objKeys.some((key) => {
			return !allowedFields.includes(key);
		});

		if (hasInvalidKey) {
			return new Response(JSON.stringify({ message: "Cannot modify some fields" }), { status: 401 });
		}

		const oldPost = await Post.findOne({ _id: postId, user: new mongoose.Types.ObjectId(user._id) }).lean();
		if (!oldPost) return new Response(JSON.stringify({ message: "No permission" }), { status: 403 });

		// handle taggedUsers / hashtags

		if (editedFields.description) {
			// extract Hashtags from description
			const hashtags = [];

			let startIndex = 0;
			const text = editedFields.description.trim();
			const len = text.length;

			// require trimmed text
			for (let i = 0; i < len; i++) {
				if (i < startIndex) continue;
				if (text[i] === "#") {
					for (let j = i + 1; j < len; j++) {
						if (["#", " ", "\n"].includes(text[j]) || j === len - 1) {
							const hashtagContent = text.slice(i + 1, j === len - 1 ? (text[j] !== "#" ? undefined : j) : j);

							if (/^[\p{L}\p{N}_\p{Emoji}!?\*]+$/u.test(hashtagContent)) {
								if (!hashtags.includes(hashtagContent)) hashtags.push(hashtagContent);
							}
							startIndex = j;
							break;
						}
					}
				}
			}

			editedFields = { ...editedFields, hashtags };

			let deletedHashtags = [];
			let newHashtags = [];

			for (let i = 0; i < oldPost.hashtags.length; i++) {
				if (!hashtags.includes(oldPost.hashtags[i])) {
					deletedHashtags.push(oldPost.hashtags[i]);
				}
			}

			for (let i = 0; i < hashtags.length; i++) {
				if (!oldPost.hashtags.includes(hashtags[i])) {
					newHashtags.push(hashtags[i]);
				}
			}

			if (deletedHashtags.length > 0) {
				let bulkOperation = deletedHashtags.map((hashtag) => ({
					updateOne: {
						filter: { name: hashtag },
						update: { $inc: { postCount: -1 } },
					},
				}));
				await Hashtag.bulkWrite(bulkOperation, { session });
			}

			if (newHashtags.length > 0) {
				let bulkOperation = newHashtags.map((hashtag) => ({
					updateOne: {
						filter: { name: hashtag },
						update: { $inc: { postCount: 1 } },
						upsert: true,
					},
				}));
				await Hashtag.bulkWrite(bulkOperation, { session });
			}
		}

		if (editedFields.photos) {
			const taggedUsers = [];

			editedFields.photos.forEach((photo) => {
				photo.tags.forEach((tag) => {
					if (!taggedUsers.includes(tag.user)) taggedUsers.push(tag.user);
				});
			});

			editedFields = { ...editedFields, taggedUsers };
		}

		const newPost = await Post.findByIdAndUpdate(postId, editedFields, { session, new: true })
			.populate({
				path: "user",
				select: "username picture",
			})
			.populate({
				path: "photos.tags.user",
				select: "username picture",
			})
			.lean();

		await session.commitTransaction();

		return new Response(JSON.stringify({ message: "Edited post", newPost }), { status: 201 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to edit post, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};

export const DELETE = async (req, { params }) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const isValid = mongoose.Types.ObjectId.isValid(params.postId);
		if (!isValid) return new Response(JSON.stringify({ message: "Post not found" }), { status: 400 });

		const postId = new mongoose.Types.ObjectId(params.postId);

		const post = await Post.findOne({ _id: postId, user: new mongoose.Types.ObjectId(user._id) }, { _id: 0, hashtags: 1 });
		if (!post) return new Response(JSON.stringify({ message: "No permission" }), { status: 403 });

		await Post.deleteOne({ _id: postId }, { session });

		await Comment.deleteMany({ post: postId }, { session });

		await Like.deleteMany({ post: postId }, { session });

		await SavedPost.deleteMany({ post: postId }, { session });

		await User.updateOne({ _id: new mongoose.Types.ObjectId(user._id) }, { $inc: { postCount: -1 } }, { session });

		await Hashtag.updateMany({ name: { $in: post.hashtags } }, { $inc: { postCount: -1 } }, { session });

		await session.commitTransaction();

		return new Response(JSON.stringify({ message: "Deleted post" }), { status: 201 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to delete post, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
