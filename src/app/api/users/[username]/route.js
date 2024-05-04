import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import ApiResponse from "@/utils/ApiResponse";
import { User, Follow } from "@/models";
import mongoose from "mongoose";

export const GET = async (req, { params }) => {
	await connectToDB();
	try {
		const username = params.username;

		const token = await getToken({ req });
		const user = token?.user;

		const response = await User.findOne({ username }, { email: 0 }).lean();

		if (!response) return new Response(JSON.stringify({ message: "User not found" }), { status: 400 });

		const isOwner = user?._id === response._id.toString();

		// check if the user has followed
		const isFollowing = user
			? await Follow.findOne({ follower: new mongoose.Types.ObjectId(user._id), following: new mongoose.Types.ObjectId(response._id) }, { _id: 1 })
			: false;

		response.isOwner = isOwner;
		response.isFollowing = isFollowing ? true : false;

		return ApiResponse(response);
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get user" }), { status: 500 });
	}
};
