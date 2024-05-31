import { connectToDB } from "@/utils/database";
import { User } from "@/models";
import { faker } from "@faker-js/faker";

export const POST = async (req) => {
	return new Response("done bulk post", { status: 200 });
	await connectToDB();
	try {
		const fakeUsers = [];

		for (let i = 0; i < 200; i++) {
			const sex = faker.person.sex();
			const firstName = faker.person.firstName(sex);
			const lastName = faker.person.lastName(sex);

			const fakeUser = {
				email: faker.internet.email(),
				username: faker.internet.displayName({ firstName, lastName }).toLowerCase().replace(" ", "_").replace(",", ""),
				nickname: faker.person.fullName({ firstName, lastName, sex }),
				biography: faker.lorem.paragraphs({ min: 1, max: 3 }),
				picture: faker.internet.avatar(),
				createdAt: Date.now(),
				isPrivate: Math.random() < 0.3,
			};
			fakeUsers.push(fakeUser);
		}

		const bulkOperations = fakeUsers.map((user) => ({
			insertOne: {
				document: user,
			},
		}));
		await User.bulkWrite(bulkOperations);

		return new Response("done bulk post", { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response("Failed to get user", { status: 500 });
	}
};
