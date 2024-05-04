import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Post } from "@/models";
import mongoose from "mongoose";
import ApiResponse from "@/utils/ApiResponse";

export const GET = async (req) => {
	await connectToDB();
	try {
		const searchParams = req.nextUrl.searchParams;
		const limit = parseInt(searchParams.get("limit"));

		if (Number.isNaN(limit)) {
			return new Response(JSON.stringify({ message: "Invalid params" }), { status: 400 });
		}

		const token = await getToken({ req });

		const user = token?.user;

		const posts = await Post.aggregate([
			{
				$match: { user: { $ne: user ? new mongoose.Types.ObjectId(user._id) : null }, isPrivate: false },
			},
			{
				$sort: {
					_id: -1,
				},
			},
			{
				$sample: { size: limit },
			},
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user",
					pipeline: [
						{
							$project: {
								username: "$username",
								picture: "$picture",
							},
						},
					],
				},
			},
			{
				$addFields: {
					user: { $arrayElemAt: ["$user", 0] },
					photos: [{ $arrayElemAt: ["$photos", 0] }],
				},
			},
		]);

		// dont return likeCount if likeHidden
		posts.forEach((post) => {
			if (post.likeHidden) post.likeCount = null;
		});

		return ApiResponse({ posts });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get posts, try again later" }), { status: 500 });
	}
};
