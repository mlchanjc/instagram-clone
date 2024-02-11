import axios from "axios";

const api = axios.create({
	baseURL: `http://localhost:3000/api/search`,
});

export const searchUsersAndHashtags = async (searchTerm, searchType, limit) => {
	const { data } = await api.get(`/?search_term=${searchTerm}&search_type=${searchType}&limit=${limit}`);
	return data;
};
