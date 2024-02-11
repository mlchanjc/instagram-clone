import { Schema, model, models } from "mongoose";
import User from "./User";

const LikeSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: User,
		require: true,
		index: true,
	},
	post: {
		type: Schema.Types.ObjectId,
		ref: "Post",
		index: true,
		sparse: true,
	},
	comment: {
		type: Schema.Types.ObjectId,
		ref: "Comment",
		index: true,
		sparse: true,
	},
});

LikeSchema.index({ user: 1 });
LikeSchema.indexes([{ post: 1, comment: 1 }], { sparse: true });

const Like = models.Like || model("Like", LikeSchema);

export default Like;
