import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";

export const POST = async (req) => {
	return new Response("done reset", { status: 200 });
	await connectToDB();
	try {
		const collections = mongoose.connection.db.listCollections();

		// Drop each collection
		collections.forEach((collection) => {
			mongoose.connection.db
				.dropCollection(collection.name)
				.then(() => console.log("Dropped collection:", collection.name))
				.catch((err) => console.error("Error dropping collection:", err));
		});

		return new Response("done reset", { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response("Failed to get user", { status: 500 });
	}
};
