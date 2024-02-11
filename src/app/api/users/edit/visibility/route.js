import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Post, User } from "@/models";
import mongoose from "mongoose";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { isPrivate } = await req.json();

		await User.updateOne({ _id: new mongoose.Types.ObjectId(user._id) }, { isPrivate }, { session });

		await Post.updateMany({ user: new mongoose.Types.ObjectId(user._id) }, { isPrivate }, { session });

		await session.commitTransaction();

		return new Response(JSON.stringify({ message: "Successfully changed visibility" }), { status: 200 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to edit account, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
