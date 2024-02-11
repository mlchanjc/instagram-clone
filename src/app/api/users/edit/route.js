import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { User } from "@/models";

export const POST = async (req) => {
	await connectToDB();
	try {
		const token = await getToken({ req });
		const user = token.user;

		const { username, nickname, biography } = await req.json();

		if (!/^[a-z0-9_]+$/.test(username)) return new Response(JSON.stringify({ message: "Username contains invalid characters" }), { status: 400 });
		if (username.length > 16) return new Response(JSON.stringify({ message: "Username is too long" }), { status: 400 });
		if (nickname.length > 30) return new Response(JSON.stringify({ message: "Nickname is too long" }), { status: 400 });
		if (biography.length > 150) return new Response(JSON.stringify({ message: "Biography is too long" }), { status: 400 });

		await User.updateOne({ _id: user._id }, { username, nickname, biography });

		return new Response(JSON.stringify({ message: "Successfully edited account" }), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ message: "Failed to edit account, try again later" }), { status: 500 });
	}
};
