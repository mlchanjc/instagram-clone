import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Post, Like } from "@/models";
import mongoose from "mongoose";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { postId } = await req.json();

		// check if the user has liked the post
		const liked = await Like.findOne({ user: new mongoose.Types.ObjectId(user._id), post: new mongoose.Types.ObjectId(postId) }, { _id: 1 });

		// update post's likeCount and create/delete like record
		if (liked) {
			await Post.findByIdAndUpdate(new mongoose.Types.ObjectId(postId), { $inc: { likeCount: -1 } }, { session });
			await Like.findByIdAndDelete(liked, { session });
		} else {
			await Post.findByIdAndUpdate(new mongoose.Types.ObjectId(postId), { $inc: { likeCount: 1 } }, { session });
			await Like.create(
				[
					{
						user: user._id,
						post: postId,
					},
				],
				{ session }
			);
		}

		await session.commitTransaction();

		return new Response(JSON.stringify({ liked: !liked }), { status: 201 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to like post, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
