import { useState } from "react";
import { useRouter } from "next/navigation";

const useCallApi = () => {
	const router = useRouter();
	const [, setError] = useState(null);

	const callApi = async (data) => {
		try {
			const result = await data;
			return result;
		} catch (error) {
			if (error.response?.data?.redirectUrl) {
				router.push(error.response?.data?.redirectUrl);
			} else {
				if (error.name == "AxiosError") {
					setError(() => {
						throw new Error(error.response?.data?.message ?? "Something went wrong");
					});
				} else {
					console.log(error);
					setError(() => {
						throw new Error("Something went wrong");
					});
				}
			}
		}
	};

	return callApi;
};

export default useCallApi;
