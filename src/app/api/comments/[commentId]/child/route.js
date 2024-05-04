import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Like, Comment } from "@/models";
import mongoose from "mongoose";

export const GET = async (req, { params }) => {
	await connectToDB();
	try {
		const token = await getToken({ req });

		const commentId = params.commentId;

		const childComments = await Comment.find({ parentComment: new mongoose.Types.ObjectId(commentId) })
			.populate({
				path: "user",
				select: "username picture",
			})
			.lean();

		if (token) {
			const user = token.user;

			// get all the liked comments
			const commentIds = childComments.map((comment) => new mongoose.Types.ObjectId(comment._id));

			let likedComments = await Like.find(
				{
					comment: { $in: commentIds },
					user: new mongoose.Types.ObjectId(user._id),
				},
				{ _id: 0, comment: 1 }
			).lean();

			likedComments.forEach((comment) => (comment = comment.comment.toString()));

			childComments.forEach((comment) => {
				comment.hasLiked = likedComments.includes(comment._id.toString());
			});
		} else {
			childComments.forEach((comment) => {
				comment.hasLiked = false;
			});
		}

		return new Response(JSON.stringify(childComments), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get child comments, try again later" }), { status: 500 });
	}
};
