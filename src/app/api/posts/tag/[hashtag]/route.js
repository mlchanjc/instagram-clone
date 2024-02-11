import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { Post, Hashtag } from "@/models";
import ApiResponse from "@/utils/ApiResponse";

export const GET = async (req, { params }) => {
	await connectToDB();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const hashtag = params.hashtag;

		const searchParams = req.nextUrl.searchParams;
		const startIndex = parseInt(searchParams.get("start_index"));
		const limit = parseInt(searchParams.get("limit"));

		if (Number.isNaN(startIndex) || Number.isNaN(limit)) {
			return new Response(JSON.stringify({ message: "Invalid params" }), { status: 400 });
		}

		const tag = await Hashtag.findOne({ name: hashtag }).lean();
		const postCount = tag?.postCount ?? 0;

		const posts = await Post.find({ hashtags: { $in: [hashtag] }, isPrivate: false }, { photos: { $slice: 1 } })
			.skip(startIndex)
			.limit(limit)
			.populate({
				path: "user",
				select: "username picture",
			})
			.lean();

		// dont return likeCount if likeHidden unless is owner
		posts.forEach((post) => {
			const isOwner = user._id === post.user._id.toString();
			post.isOwner = isOwner;

			if (post.likeHidden && !isOwner) post.likeCount = null;
		});

		const response = {
			posts,
			postCount,
		};

		return ApiResponse(response);
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to get posts with hashtag, try again later" }), { status: 500 });
	}
};
