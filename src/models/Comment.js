import { Schema, model, models } from "mongoose";
import User from "./User";

const CommentSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: User,
		require: true,
	},
	content: {
		type: String,
		require: true,
	},
	post: {
		type: Schema.Types.ObjectId,
		ref: "Post",
		require: true,
		index: true,
	},
	parentComment: {
		type: Schema.Types.ObjectId,
		ref: "Comment",
		require: true,
		index: true,
	},
	createdAt: {
		type: Date,
		require: true,
	},
	likeCount: {
		type: Number,
		default: 0,
		require: true,
	},
	childCommentCount: {
		type: Number,
		default: 0,
		require: true,
	},
});

CommentSchema.indexes([{ post: 1, parentComment: 1 }]);

const Comment = models.Comment || model("Comment", CommentSchema);

export default Comment;
