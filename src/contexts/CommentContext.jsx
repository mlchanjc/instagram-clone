import { createContext, useState } from "react";

export const CommentContext = createContext();

export const CommentContextProvider = ({ children }) => {
	const [comments, setComments] = useState([]);
	const [respondingComment, setRespondingComment] = useState({ username: "", _id: null });

	const contextValue = {
		comments,
		setComments,
		respondingComment,
		setRespondingComment,
	};

	return <CommentContext.Provider value={contextValue}>{children}</CommentContext.Provider>;
};
