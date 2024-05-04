import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import ApiResponse from "@/utils/ApiResponse";
import { User, Follow, Post, SavedPost, Like } from "@/models";
import mongoose from "mongoose";

export const GET = async (req, { params }) => {
	await connectToDB();
	try {
		const username = params.username;

		const searchParams = req.nextUrl.searchParams;
		const postType = searchParams.get("post_type");
		const startIndex = parseInt(searchParams.get("start_index"));
		const limit = parseInt(searchParams.get("limit"));

		const token = await getToken({ req });
		const user = token?.user;

		if (!["posts", "taggedPosts", "savedPosts", "likedPosts"].includes(postType)) {
			return new Response(JSON.stringify({ message: "Invalid post type" }), { status: 400 });
		}

		let posts = [];
		let hasPermission = true;
		const targetUser = await User.findOne({ username }, { isPrivate: 1 });
		if (!targetUser) return new Response(JSON.stringify({ message: "User not found" }), { status: 400 });
		const isOwner = user?._id === targetUser._id.toString();

		if (!isOwner) {
			if (!["savedPosts", "likedPosts"].includes(postType)) {
				const isPrivate = targetUser.isPrivate;
				if (isPrivate) {
					const isFollowing = user
						? await Follow.findOne({ follower: new mongoose.Types.ObjectId(user._id), following: new mongoose.Types.ObjectId(targetUser._id) }, { _id: 1 })
						: false;

					if (!isFollowing) hasPermission = false;
				}
			} else hasPermission = false;
		}

		if (hasPermission) {
			switch (postType) {
				case "posts":
					posts = await Post.find({ user: new mongoose.Types.ObjectId(targetUser._id) }, { photos: { $slice: 1 } })
						.sort({ _id: -1 })
						.skip(startIndex)
						.limit(limit)
						.populate({
							path: "user",
							select: "username picture",
						})
						.lean();

					break;
				case "taggedPosts":
					posts = await Post.aggregate([
						{
							$match: { taggedUsers: { $in: [new mongoose.Types.ObjectId(targetUser._id)] } },
						},
						{
							$match: {
								$or: [
									{ isPrivate: false },
									{
										$and: [{ isPrivate: true }, { user: new mongoose.Types.ObjectId(user._id) }],
									},
								],
							},
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
					break;
				case "savedPosts":
					posts = await SavedPost.find({ user: new mongoose.Types.ObjectId(targetUser._id) }, { post: 1, _id: 0 })
						.sort({ _id: -1 })
						.skip(startIndex)
						.limit(limit)
						.populate({
							path: "post",
							populate: {
								path: "user",
								select: "username picture",
							},
						})
						.lean();

					break;
				case "likedPosts":
					posts = await Like.find({ user: new mongoose.Types.ObjectId(targetUser._id) }, { post: 1, _id: 0 })
						.sort({ _id: -1 })
						.skip(startIndex)
						.limit(limit)
						.populate({
							path: "post",
							populate: {
								path: "user",
								select: "username picture",
							},
						})
						.lean();
					break;
				default:
					break;
			}

			// remove the posts if private and is not owner
			if (["savedPosts", "likedPosts"].includes(postType)) {
				posts.forEach((post, i) => (posts[i] = post.post));
				posts = posts.filter((post) => {
					let keep = true;
					if (post.isPrivate) {
						if (post.user._id.toString() !== user?._id) {
							keep = false;
						}
					}
					return keep;
				});
			}

			// dont return likeCount if likeHidden unless is owner
			posts.forEach((post) => {
				const isPostOwner = post.user._id.toString() === user?._id;
				post.isOwner = isPostOwner;
				if (post.likeHidden && !isPostOwner) post.likeCount = null;
			});
		}

		return ApiResponse(posts);
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get posts, try again later" }), { status: 500 });
	}
};
