import { Schema, model, models } from "mongoose";
import User from "./User";

const SavedPostSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: User,
		require: true,
		index: true,
	},
	post: {
		type: Schema.Types.ObjectId,
		ref: "Post",
		require: true,
		index: true,
	},
});

SavedPostSchema.indexes([{ user: 1, post: 1 }]);

const SavedPost = models.SavedPost || model("SavedPost", SavedPostSchema);

export default SavedPost;
