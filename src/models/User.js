import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
	email: {
		type: String,
		unique: true,
		require: true,
	},
	username: {
		type: String,
		unique: true,
		require: true,
	},
	nickname: {
		type: String,
		require: true,
	},
	biography: {
		type: String,
		default: "",
		require: true,
	},
	picture: {
		type: String,
		default: "",
		require: true,
	},
	isPrivate: {
		type: Boolean,
		default: false,
		require: true,
	},
	createdAt: {
		type: Date,
		require: true,
	},
	postCount: {
		type: Number,
		default: 0,
		require: true,
	},
	followerCount: {
		type: Number,
		default: 0,
		require: true,
	},
	followingCount: {
		type: Number,
		default: 0,
		require: true,
	},
});

const User = models.User || model("User", UserSchema);

export default User;
