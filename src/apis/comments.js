import axios from "axios";
import { useMiddlewares } from "./middlewares";

const api = axios.create({
	baseURL: `${process.env.API_URL}/api/comments`,
});

useMiddlewares(api);

export const createComment = async (comment, postId, commentId) => {
	const { data } = await api.post("/", { comment, postId, commentId });

	return data;
};

export const getChildComments = async (commentId) => {
	const { data } = await api.get(`${commentId}/child`);

	return data;
};

export const likeComment = async (commentId) => {
	const { data } = await api.post("/like", { commentId });

	return data;
};
