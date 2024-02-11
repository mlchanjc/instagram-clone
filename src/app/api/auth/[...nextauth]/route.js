import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/models";
import { connectToDB } from "@/utils/database";

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],

	callbacks: {
		async jwt({ token, user, account }) {
			if (account && user) {
				const result = await User.findOne({ email: user?.email }, { _id: 1, username: 1, nickname: 1, picture: 1 }).lean();
				token.user = result;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = token.user;
			return session;
		},
		async signIn({ profile }) {
			try {
				await connectToDB();

				// check if user already exists
				const userExists = await User.findOne({ email: profile.email }, { _id: 1 }).lean();

				// if not, create a new document and save user in MongoDB
				if (!userExists) {
					await User.create({
						email: profile.email,
						username: profile.name.replace(" ", "_").toLowerCase().trim(),
						nickname: profile.name,
						picture: profile.picture,
						createdAt: Date.now(),
					});
				}

				return true;
			} catch (error) {
				console.log("Error checking if user exists: ", error.message);
				return false;
			}
		},
	},
});

export { handler as GET, handler as POST };
