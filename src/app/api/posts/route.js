import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Post, User, Hashtag, Follow, Like, SavedPost } from "@/models";
import mongoose from "mongoose";
import sharp from "sharp";
import ApiResponse from "@/utils/ApiResponse";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { photos, description, likeHidden, commentDisabled } = await req.json();

		// extract Hashtags from description
		const hashtags = [];

		let startIndex = 0;
		const text = description.trim();
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

		// create/update hashtags
		const bulkOperations = hashtags.map((hashtag) => {
			return {
				updateOne: {
					filter: { name: hashtag },
					update: { $inc: { postCount: 1 } },
					upsert: true,
				},
			};
		});

		await Hashtag.bulkWrite(bulkOperations, { session });

		// create the post

		// compress the images and change format to webp
		for (let i = 0; i < photos.length; i++) {
			const buffer = Buffer.from(photos[i].photo.replace(/^data:image\/\w+;base64,/, ""), "base64");
			const compressedPhoto = await sharp(buffer).webp({ quality: 10 }).toBuffer();

			photos[i].photo = "data:image/webp;base64," + compressedPhoto.toString("base64");
		}

		// get if user is private
		const { isPrivate } = await User.findById(new mongoose.Types.ObjectId(user._id), { isPrivate: 1 }, { session });

		// get all tagged users
		const taggedUsers = [];
		for (let i = 0; i < photos.length; i++) {
			for (let j = 0; j < photos[i].tags.length; j++) {
				const id = photos[i].tags[j].user;
				if (!taggedUsers.includes(id)) taggedUsers.push(id);
			}
		}

		await Post.create(
			[
				{
					user: user._id,
					photos,
					photoCount: photos.length,
					description: description.trim(),
					likeHidden,
					commentDisabled,
					isPrivate,
					createdAt: Date.now(),
					taggedUsers,
					hashtags,
				},
			],
			{ session }
		);

		// update user's postCount
		await User.findByIdAndUpdate(new mongoose.Types.ObjectId(user._id), { $inc: { postCount: 1 } }, { session });

		await session.commitTransaction();

		return new Response(JSON.stringify(null), { status: 201 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to create a new post" }), { status: 500 });
	} finally {
		session.endSession();
	}
};

export const GET = async (req) => {
	await connectToDB();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const searchParams = req.nextUrl.searchParams;
		const startIndex = parseInt(searchParams.get("start_index"));
		const limit = parseInt(searchParams.get("limit"));

		if (Number.isNaN(startIndex) || Number.isNaN(limit)) {
			return new Response(JSON.stringify({ message: "Invalid params" }), { status: 400 });
		}

		const followingIds = await Follow.aggregate([
			{
				$match: { follower: new mongoose.Types.ObjectId(user._id) },
			},
			{
				$sample: { size: 10 },
			},
			{
				$project: {
					following: 1,
					_id: 0,
				},
			},
		]);

		followingIds.forEach((following, i) => (followingIds[i] = following.following));

		let posts = await Post.aggregate([
			{
				$match: { user: { $in: followingIds } },
			},
			{
				$sort: {
					_id: -1,
				},
			},
			{
				$skip: startIndex,
			},
			{
				$limit: limit,
			},
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user",
					pipeline: [
						{
							$project: {
								username: "$username",
								picture: "$picture",
							},
						},
					],
				},
			},
			{
				$addFields: {
					user: { $arrayElemAt: ["$user", 0] },
				},
			},
		]);

		posts = await Post.populate(posts, { path: "photos.tags.user", select: "username picture" });

		posts.forEach((post) => (post.isFollowing = true));

		if (posts.length < limit) {
			let additionalPosts = await Post.aggregate([
				{
					$match: { user: { $nin: followingIds }, isPrivate: false, user: { $ne: new mongoose.Types.ObjectId(user._id) } },
				},
				{
					$sort: {
						_id: -1,
					},
				},
				{
					$sample: { size: limit - posts.length },
				},
				{
					$lookup: {
						from: "users",
						localField: "user",
						foreignField: "_id",
						as: "user",
						pipeline: [
							{
								$project: {
									username: "$username",
									picture: "$picture",
								},
							},
						],
					},
				},
				{
					$addFields: {
						user: { $arrayElemAt: ["$user", 0] },
					},
				},
			]);

			additionalPosts = await Post.populate(additionalPosts, { path: "photos.tags.user", select: "username picture" });

			additionalPosts.forEach((post) => (post.isFollowing = false));

			posts = [...posts, ...additionalPosts];
		}

		// get all the liked posts
		const postIds = posts.map((post) => new mongoose.Types.ObjectId(post._id));

		let likedPosts = await Like.find(
			{
				post: { $in: postIds },
				user: new mongoose.Types.ObjectId(user._id),
			},
			{ _id: 0, post: 1 }
		).lean();

		likedPosts.forEach((post, i) => (likedPosts[i] = post.post.toString()));

		posts.forEach((post, i) => {
			posts[i].hasLiked = likedPosts.includes(post._id.toString());
		});

		// get all the saved posts
		let savedPosts = await SavedPost.find(
			{
				post: { $in: postIds },
				user: new mongoose.Types.ObjectId(user._id),
			},
			{ _id: 0, post: 1 }
		).lean();

		savedPosts.forEach((post, i) => (savedPosts[i] = post.post.toString()));

		posts.forEach((post, i) => {
			posts[i].hasSaved = savedPosts.includes(post._id.toString());
		});

		// dont return likeCount if likeHidden
		posts.forEach((post) => {
			if (post.likeHidden) post.likeCount = null;
		});

		return ApiResponse(posts);
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get posts with hashtag, try again later" }), { status: 500 });
	}
};
