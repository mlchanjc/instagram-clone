import { Schema, model, models } from "mongoose";
import User from "./User";

const FollowSchema = new Schema({
	follower: {
		type: Schema.Types.ObjectId,
		ref: User,
		require: true,
		index: true,
	},
	following: {
		type: Schema.Types.ObjectId,
		ref: User,
		require: true,
		index: true,
	},
});

FollowSchema.indexes([{ follower: 1, following: 1 }]);

const Follow = models.Follow || model("Follow", FollowSchema);

export default Follow;
