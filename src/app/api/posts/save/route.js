import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { SavedPost, Post } from "@/models";
import mongoose from "mongoose";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { postId } = await req.json();

		// check if the user has saved the post
		const saved = await SavedPost.findOne({ user: new mongoose.Types.ObjectId(user._id), post: new mongoose.Types.ObjectId(postId) }, { _id: 1 });

		// update post's savedCount and create/delete SavedPost record
		if (saved) {
			await Post.findByIdAndUpdate(new mongoose.Types.ObjectId(postId), { $inc: { savedCount: -1 } }, { session });
			await SavedPost.findByIdAndDelete(saved._id, { session });
		} else {
			await Post.findByIdAndUpdate(new mongoose.Types.ObjectId(postId), { $inc: { savedCount: 1 } }, { session });
			await SavedPost.create(
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

		return new Response(JSON.stringify({ saved: !saved }), { status: 201 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to save post, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
