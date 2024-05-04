import { connectToDB } from "@/utils/database";
import { Hashtag, User } from "@/models";

export const GET = async (req) => {
	await connectToDB();
	try {
		const searchParams = req.nextUrl.searchParams;
		const searchTerm = searchParams.get("search_term");
		const searchType = searchParams.get("search_type");
		const limit = parseInt(searchParams.get("limit"));

		if (Number.isNaN(limit)) {
			return new Response(JSON.stringify({ message: "Invalid params" }), { status: 400 });
		}

		if (!["all", "hashtag", "user"].includes(searchType)) {
			return new Response(JSON.stringify({ message: "Invalid search type" }), { status: 400 });
		}

		let users = [];
		let hashtags = [];
		if (searchType !== "hashtag") {
			users = await User.aggregate([
				{
					$search: {
						index: "search_users",
						text: {
							path: ["nickname", "username"],
							query: searchTerm,
							fuzzy: {},
						},
					},
				},
				{
					$limit: limit,
				},
				{
					$project: {
						username: 1,
						nickname: 1,
						picture: 1,
						score: { $meta: "searchScore" },
					},
				},
			]);
		}

		if (searchType !== "user") {
			hashtags = await Hashtag.aggregate([
				{
					$search: {
						index: "search_hashtags",
						text: {
							path: "name",
							query: searchTerm,
							fuzzy: {},
						},
					},
				},
				{
					$limit: limit,
				},
				{
					$project: {
						name: 1,
						postCount: 1,
						score: { $meta: "searchScore" },
					},
				},
			]);
		}

		users.forEach((_, i) => (users[i].type = "user"));
		hashtags.forEach((_, i) => (hashtags[i].type = "hashtag"));

		let response = [...users, ...hashtags];

		response.sort((a, b) => b.score - a.score);

		if (response.length > limit) response = response.slice(0, limit);

		response.forEach((_, i) => delete response[i].score);

		return new Response(JSON.stringify(response), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to search, try again later" }), { status: 500 });
	}
};
