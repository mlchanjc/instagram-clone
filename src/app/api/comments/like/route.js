import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Like, Comment } from "@/models";
import mongoose from "mongoose";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { commentId } = await req.json();

		// check if the user has liked the post
		const liked = await Like.findOne({ user: new mongoose.Types.ObjectId(user._id), comment: new mongoose.Types.ObjectId(commentId) }, { _id: 1 });

		// update comment's likeCount and create/delete like record
		if (liked) {
			await Comment.findByIdAndUpdate(new mongoose.Types.ObjectId(commentId), { $inc: { likeCount: -1 } }, { session });
			await Like.findByIdAndDelete(liked, { session });
		} else {
			await Comment.findByIdAndUpdate(new mongoose.Types.ObjectId(commentId), { $inc: { likeCount: 1 } }, { session });
			await Like.create(
				[
					{
						user: user._id,
						comment: commentId,
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
		return new Response(JSON.stringify({ message: "Failed to like comment, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
