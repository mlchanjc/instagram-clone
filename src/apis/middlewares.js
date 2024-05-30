export const useMiddlewares = (api) => {
	api.interceptors.response.use(
		(response) => {
			return response;
		},
		(error) => {
			throw new Error(error.response?.data?.message ?? "An unknown error has occurred");
		}
	);
};
