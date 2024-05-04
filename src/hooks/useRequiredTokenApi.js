// helper function to block api call that required token
import { useSession } from "next-auth/react";

export default function useRequiredTokenApi() {
	const { data: session, status } = useSession();
	const requiredTokenApi = (api) => {
		if (status === "unauthenticated") return () => (window.location.href = "/auth");
		else return api;
	};
	return requiredTokenApi;
}
