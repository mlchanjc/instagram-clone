import axios from "axios";
import { useMiddlewares } from "./middlewares";

const api = axios.create({
	baseURL: `${process.env.API_URL}/api/search`,
});

useMiddlewares(api);

export const searchUsersAndHashtags = async (searchTerm, searchType, limit) => {
	const { data } = await api.get(`/?search_term=${searchTerm}&search_type=${searchType}&limit=${limit}`);
	return data;
};
