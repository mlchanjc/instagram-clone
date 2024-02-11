import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { User, Follow } from "@/models";
import mongoose from "mongoose";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { targetUserId } = await req.json();

		if (user._id === targetUserId) return new Response(JSON.stringify({ message: "Cannot follow yourself" }), { status: 400 });

		// check if the user has followed
		const isFollowing = await Follow.findOne({ follower: new mongoose.Types.ObjectId(user._id), following: new mongoose.Types.ObjectId(targetUserId) }, { _id: 1 });

		// update followingCount/followerCount and delete/create follow record
		if (isFollowing) {
			await User.bulkWrite(
				[
					{
						updateOne: {
							filter: { _id: new mongoose.Types.ObjectId(user._id) },
							update: { $inc: { followingCount: -1 } },
						},
					},
					{
						updateOne: {
							filter: { _id: new mongoose.Types.ObjectId(targetUserId) },
							update: { $inc: { followerCount: -1 } },
						},
					},
				],
				{ session }
			);

			await Follow.findByIdAndDelete(isFollowing, { session });
		} else {
			await User.bulkWrite(
				[
					{
						updateOne: {
							filter: { _id: new mongoose.Types.ObjectId(user._id) },
							update: { $inc: { followingCount: 1 } },
						},
					},
					{
						updateOne: {
							filter: { _id: new mongoose.Types.ObjectId(targetUserId) },
							update: { $inc: { followerCount: 1 } },
						},
					},
				],
				{ session }
			);
			await Follow.create(
				[
					{
						follower: user._id,
						following: targetUserId,
					},
				],
				{ session }
			);
		}

		await session.commitTransaction();

		return new Response(JSON.stringify({ isFollowing: !isFollowing }), { status: 200 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to follow user, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
