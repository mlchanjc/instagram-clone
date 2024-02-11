import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Comment, Follow, Like, Post, SavedPost, User } from "@/models";
import mongoose from "mongoose";

export const DELETE = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		let savedPosts = await SavedPost.find({ user: new mongoose.Types.ObjectId(user._id) }, { post: 1, _id: 0 }).lean();
		savedPosts = savedPosts.map((post) => post.post);

		await SavedPost.deleteMany({ user: new mongoose.Types.ObjectId(user._id) }, { session });
		await Post.updateMany({ _id: { $in: savedPosts } }, { $inc: { savedcount: -1 } }, { session });

		let likedPosts = await Like.find({ user: new mongoose.Types.ObjectId(user._id), post: { $exists: true } }, { post: 1, _id: 0 }).lean();
		likedPosts = likedPosts.map((post) => post.post);

		await Like.deleteMany({ user: new mongoose.Types.ObjectId(user._id), post: { $exists: true } }, { session });
		await Post.updateMany({ _id: { $in: likedPosts } }, { $inc: { likeCount: -1 } }, { session });

		let likedComments = await Like.find({ user: new mongoose.Types.ObjectId(user._id), comment: { $exists: true } }, { comment: 1, _id: 0 }).lean();
		likedComments = likedComments.map((comment) => comment.comment);

		await Like.deleteMany({ user: new mongoose.Types.ObjectId(user._id), comment: { $exists: true } }, { session });
		await Comment.updateMany({ _id: { $in: likedComments } }, { $inc: { likeCount: -1 } }, { session });

		let followings = await Follow.find({ follower: new mongoose.Types.ObjectId(user._id) }, { following: 1, _id: 0 }).lean();
		followings = followings.map((following) => following.following);

		await Follow.deleteMany({ follower: new mongoose.Types.ObjectId(user._id) }, { session });
		await User.updateMany({ _id: { $in: followings } }, { $inc: { followerCount: -1 } }, { session });

		let followers = await Follow.find({ following: new mongoose.Types.ObjectId(user._id) }, { follower: 1, _id: 0 }).lean();
		followers = followers.map((follower) => follower.follower);

		await Follow.deleteMany({ following: new mongoose.Types.ObjectId(user._id) }, { session });
		await User.updateMany({ _id: { $in: followers } }, { $inc: { followingCount: -1 } }, { session });

		// Delete all user's parent comments and their child comments
		let comments = await Comment.find({ user: new mongoose.Types.ObjectId(user._id), parentComment: null }, { _id: 1 }).lean();
		comments = comments.map((comment) => comment._id);

		await Comment.deleteMany({ user: new mongoose.Types.ObjectId(user._id) }, { session });
		await Comment.deleteMany({ parentComment: { $in: comments } }, { session });

		// Delete all user's child comments
		await Comment.deleteMany({ user: new mongoose.Types.ObjectId(user._id), parentComment: { $ne: null } }, { session });

		await Post.deleteMany({ user: new mongoose.Types.ObjectId(user._id) }, { session });
		await User.deleteOne({ _id: new mongoose.Types.ObjectId(user._id) }, { session });

		await session.commitTransaction();

		return new Response(JSON.stringify({ message: "Successfully deleted account" }), { status: 200 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to edit account, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
