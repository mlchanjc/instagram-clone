import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import ApiResponse from "@/utils/ApiResponse";
import { User, Follow, Post, SavedPost, Like } from "@/models";
import mongoose from "mongoose";

export const GET = async (req, { params }) => {
	await connectToDB();
	try {
		const username = params.username;

		const token = await getToken({ req });
		const user = token.user;

		const response = await User.findOne({ username }, { email: 0 }).lean();
		if (!response) return new Response(JSON.stringify({ message: "User not found" }), { status: 400 });

		const isOwner = user._id === response._id.toString();

		// check if the user has followed
		const isFollowing = await Follow.findOne({ follower: new mongoose.Types.ObjectId(user._id), following: new mongoose.Types.ObjectId(response._id) }, { _id: 1 });

		response.isOwner = isOwner;
		response.isFollowing = isFollowing ? true : false;

		let posts = [];
		if (!(response.isPrivate && !isFollowing && !isOwner)) {
			posts = await Post.find({ user: new mongoose.Types.ObjectId(response._id) }, { photos: { $slice: 1 } })
				.sort({ _id: -1 })
				.limit(3)
				.lean();
		}

		// dont return likeCount if likeHidden unless is owner

		posts.forEach((post) => {
			const isPostOwner = post.user._id.toString() === user._id;
			post.isOwner = isPostOwner;
			if (post.likeHidden && !isOwner) post.likeCount = null;
		});

		return ApiResponse({ user: response, posts });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get posts, try again later" }), { status: 500 });
	}
};
