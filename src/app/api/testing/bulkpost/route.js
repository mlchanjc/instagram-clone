import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/database";
import { User, Post, Hashtag } from "@/models";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

export const POST = async (req) => {
	await connectToDB();
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const users = await User.find({}, { _id: 1, username: 1, isPrivate: 1 });

		const fakePosts = [];

		const categories = ["abstract", "animals", "business", "cats", "city", "food", "nature", "people", "sports", "technics", "transport"];

		let a = performance.now();
		for (let i = 0; i < 1000; i++) {
			const randomIndex = Math.floor(Math.random() * users.length);

			const photos = [];
			const taggedUsers = [];
			for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
				const tags = [];
				for (let k = 0; k < Math.floor(Math.random() * 4) + 2; k++) {
					let idd = users[Math.floor(Math.random() * users.length)]._id;
					if (!taggedUsers.includes(idd)) taggedUsers.push(idd);
					const tag = {
						x: Math.random() * 80 + 10,
						y: 30 + Math.random() * 40,
						user: idd,
					};
					tags.push(tag);
				}

				const photo = {
					photo:
						faker.image.urlLoremFlickr({ category: categories[Math.floor(Math.random() * categories.length)] }) + `&random=${Math.floor(Math.random() * 2000000000)}`,
					tags,
				};
				photos.push(photo);
			}

			let tag = "";
			Array.from({ length: Math.floor(Math.random() * 5) + 3 }).forEach((_, i) => {
				const ts = [faker.word.noun(), faker.vehicle.color(), faker.word.adjective()];
				const t = ts[Math.floor(Math.random() * 3)].replace(" ", "").replace("-", "").replace(",", "").replace("'", "");
				tag += ` #${t}`;
			});

			const description = faker.lorem.paragraphs({ min: 1, max: 3 }) + tag;
			// extract Hashtags from description
			const hashtags = [];

			let startIndex = 0;
			const text = description.trim();
			const len = text.length;

			// require trimmed text
			for (let i = 0; i < len; i++) {
				if (i < startIndex) continue;
				if (text[i] === "#") {
					for (let j = i + 1; j < len; j++) {
						if (["#", " ", "\n"].includes(text[j]) || j === len - 1) {
							const hashtagContent = text.slice(i + 1, j === len - 1 ? (text[j] !== "#" ? undefined : j) : j);

							if (/^[\p{L}\p{N}_\p{Emoji}!?\*]+$/u.test(hashtagContent)) {
								if (!hashtags.includes(hashtagContent)) hashtags.push(hashtagContent);
							}
							startIndex = j;
							break;
						}
					}
				}
			}

			const fakePost = {
				user: users[randomIndex]._id,
				photos,
				photoCount: photos.length,
				description,
				likeHidden: Math.random() < 0.2,
				isPrivate: users[randomIndex].isPrivate,
				commentDisabled: Math.random() < 0.2,
				createdAt: faker.date.past({ years: 4 }),
				taggedUsers,
				hashtags,
			};
			fakePosts.push(fakePost);
		}

		let b = performance.now();
		console.log(b - a);

		const bulkOperations = fakePosts.map((post) => ({
			insertOne: {
				document: post,
			},
		}));
		await Post.bulkWrite(bulkOperations, { session });

		// update hashtags
		let bulkOperations2 = fakePosts.map((post, i) => {
			return post.hashtags.map((hashtag) => ({
				updateOne: {
					filter: { name: hashtag },
					update: { $inc: { postCount: 1 } },
					upsert: true,
				},
			}));
		});

		bulkOperations2 = bulkOperations2.flat();
		await Hashtag.bulkWrite(bulkOperations2, { session });

		// update hashtags
		let bulkOperations3 = fakePosts.map((post, i) => {
			return {
				updateOne: {
					filter: { _id: new mongoose.Types.ObjectId(post.user) },
					update: { $inc: { postCount: 1 } },
					upsert: true,
				},
			};
		});

		await User.bulkWrite(bulkOperations3, { session });

		await session.commitTransaction();

		return new Response("done bulk post", { status: 200 });
	} catch (error) {
		console.log(error);
		await session.abortTransaction();
		return new Response("Failed to create a new prompt", { status: 500 });
	} finally {
		session.endSession();
	}
};
