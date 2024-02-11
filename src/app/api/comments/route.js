import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Post, Comment } from "@/models";
import mongoose from "mongoose";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { comment, postId, commentId } = await req.json();

		// check if the post has disabled comment
		const { commentDisabled } = await Post.findById(new mongoose.Types.ObjectId(postId), { commentDisabled: 1 }, { session });

		if (commentDisabled) return new Response(JSON.stringify({ message: "Commenting has been disabled for this post" }), { status: 403 });

		// create the comment
		let newComment = await Comment.create(
			[
				{
					user: user._id,
					content: comment.trim(),
					post: postId,
					parentComment: commentId, // null if is parent comment
					createdAt: Date.now(),
				},
			],
			{ session }
		);

		newComment = await Comment.populate(newComment[0], { path: "user", select: "username picture" });

		// update post's commentCount
		const commentCount = await Comment.countDocuments({ post: new mongoose.Types.ObjectId(postId) });
		await Post.findByIdAndUpdate(new mongoose.Types.ObjectId(postId), { commentCount: commentCount + 1 }, { session });

		// update parent comment's childCommentCount if exists
		if (commentId) {
			const childCount = await Comment.countDocuments({ parentComment: new mongoose.Types.ObjectId(commentId) });
			await Comment.findByIdAndUpdate(new mongoose.Types.ObjectId(commentId), { childCommentCount: childCount + 1 }, { session });
		}

		await session.commitTransaction();

		return new Response(JSON.stringify({ newComment, message: "Comment posted" }), { status: 201 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response(JSON.stringify({ message: "Failed to post comment, try again later" }), { status: 500 });
	} finally {
		session.endSession();
	}
};
