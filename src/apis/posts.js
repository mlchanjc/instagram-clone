import axios from "axios";
import onDownloadProgress from "@/utils/onDownloadProgress";

const api = axios.create({
	baseURL: `${process.env.API_URL}/api/posts`,
});

export const createPost = async (photos, description, likeHidden, commentDisabled) => {
	const { data } = await api.post("/", {
		photos,
		description,
		likeHidden,
		commentDisabled,
	});
	return data;
};

export const getPosts = async (startIndex) => {
	const { data } = await api.get(`?start_index=${startIndex}&limit=6`);
	return data;
};

export const likePost = async (postId) => {
	const { data } = await api.post("/like", { postId });
	return data;
};

export const savePost = async (postId) => {
	const { data } = await api.post("/save", { postId });
	return data;
};

export const getPostsByHashtag = async (hashtag, startIndex) => {
	const { data } = await api.get(`/tag/${hashtag}?start_index=${startIndex}&limit=12`, { onDownloadProgress });
	return data;
};

export const getExplorePosts = async () => {
	const { data } = await api.get(`/explore?limit=12`, { onDownloadProgress });
	return data;
};

export const getPostById = async (postId) => {
	const { data } = await api.get(`/${postId}`, { onDownloadProgress });
	return data;
};

export const updatePost = async (postId, editedFields) => {
	const { data } = await api.post(`/${postId}`, editedFields);
	return data;
};

export const deletePost = async (postId) => {
	const { data } = await api.delete(`/${postId}`);
	return data;
};
