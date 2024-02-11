import { Schema, model, models } from "mongoose";

const TagSchema = new Schema(
	{
		x: {
			type: Number,
			require: true,
		},
		y: {
			type: Number,
			require: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
	},
	{ _id: false }
);

const PhotoSchema = new Schema(
	{
		photo: {
			type: String,
			require: true,
		},
		tags: {
			type: [TagSchema],
			require: true,
		},
	},
	{ _id: false }
);

const PostSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		require: true,
		index: true,
	},
	photos: {
		type: [PhotoSchema],
		require: true,
	},
	photoCount: {
		type: Number,
		require: true,
	},
	createdAt: {
		type: Date,
		require: true,
	},
	description: {
		type: String,
		require: true,
	},
	likeHidden: {
		type: Boolean,
		require: true,
	},
	commentDisabled: {
		type: Boolean,
		require: true,
	},
	isPrivate: {
		type: Boolean,
		require: true,
	},
	likeCount: {
		type: Number,
		default: 0,
		require: true,
	},
	commentCount: {
		type: Number,
		default: 0,
		require: true,
	},
	savedCount: {
		type: Number,
		default: 0,
		require: true,
	},
	taggedUsers: {
		type: [Schema.Types.ObjectId],
		ref: "User",
		require: true,
		index: true,
	},
	hashtags: {
		type: [String],
		require: true,
		index: true,
	},
});

PostSchema.indexes([{ user: 1, taggedUsers: 1, hashtags: 1 }]);

const Post = models.Post || model("Post", PostSchema);

export default Post;
