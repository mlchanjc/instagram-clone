import axios from "axios";
import onDownloadProgress from "@/utils/onDownloadProgress";

const api = axios.create({
	baseURL: `${process.env.API_URL}/api/users`,
});

export const getUserInfo = async (username) => {
	const { data } = await api.get(`/${username}`);
	return data;
};

export const getUserPost = async (username, postType, startIndex) => {
	const { data } = await api.get(`/${username}/posts?post_type=${postType}&start_index=${startIndex}&limit=12`, { onDownloadProgress });
	return data;
};

export const followUser = async (targetUserId) => {
	const { data } = await api.post("/follow", { targetUserId });
	return data;
};

export const getUserPreview = async (username) => {
	const { data } = await api.get(`/preview/${username}`);
	return data;
};

export const editUser = async (newData) => {
	const { data } = await api.post("/edit", newData);
	return data;
};

export const editUserVisibility = async (isPrivate) => {
	const { data } = await api.post("/edit/visibility", { isPrivate });
	return data;
};

export const deleteUser = async () => {
	const { data } = await api.delete("/delete");
	return data;
};
