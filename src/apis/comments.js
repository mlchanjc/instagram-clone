import axios from "axios";

const api = axios.create({
	baseURL: `http://localhost:3000/api/comments`,
});

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
