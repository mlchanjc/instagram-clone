"use client";
import { PhotoContextProvider, PostContextProvider } from "../contexts/PostInfoContexts";
import { CommentContextProvider } from "@/contexts/CommentContext";
import { SessionProvider } from "next-auth/react";

const Provider = ({ children, session }) => (
	<SessionProvider session={session} refetchOnWindowFocus={false}>
		<CommentContextProvider>
			<PostContextProvider>
				<PhotoContextProvider>{children}</PhotoContextProvider>
			</PostContextProvider>
		</CommentContextProvider>
	</SessionProvider>
);

export default Provider;
