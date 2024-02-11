import { Schema, model, models } from "mongoose";

const HashtagSchema = new Schema({
	name: {
		type: String,
		unique: true,
		require: true,
	},
	postCount: {
		type: Number,
		require: true,
	},
});

const Hashtag = models.Hashtag || model("Hashtag", HashtagSchema);

export default Hashtag;
