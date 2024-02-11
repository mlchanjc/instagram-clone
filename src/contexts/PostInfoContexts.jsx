import { createContext, useState } from "react";

export const PhotoContext = createContext();

export const PhotoContextProvider = ({ children }) => {
	const [photos, setPhotos] = useState([]);
	const [currentPhoto, setCurrentPhoto] = useState(0);
	const [tags, setTags] = useState([]);

	const contextValue = {
		photos,
		setPhotos,
		currentPhoto,
		setCurrentPhoto,
		tags,
		setTags,
	};

	return <PhotoContext.Provider value={contextValue}>{children}</PhotoContext.Provider>;
};

export const PostContext = createContext();

export const PostContextProvider = ({ children }) => {
	const [likeHidden, setLikeHidden] = useState(false);
	const [commentDisabled, setCommentDisabled] = useState(false);
	const [description, setDescription] = useState("");

	const contextValue = {
		likeHidden,
		setLikeHidden,
		commentDisabled,
		setCommentDisabled,
		description,
		setDescription,
	};

	return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
};
