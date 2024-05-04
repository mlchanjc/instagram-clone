import { useContext, useEffect } from "react";
import { MdOutlineArrowBack } from "react-icons/md";
import EditPostInfo from "./EditPostInfo";
import PhotosPreview from "./PhotosPreview";
import { PhotoContext, PostContext } from "../../contexts/PostInfoContexts";
import { createPost } from "@/apis/posts";

const EditPostModal = ({ editingPost, setIsShowingEditModal, updatePost }) => {
	const { tags, photos, setPhotos, setCurrentPhoto, setTags } = useContext(PhotoContext);
	const { description, likeHidden, commentDisabled, setLikeHidden, setCommentDisabled, setDescription } = useContext(PostContext);

	const handleLeave = () => {
		setPhotos([]);
		setCurrentPhoto(0);
		setTags([]);
		setLikeHidden(false);
		setCommentDisabled(false);
		setDescription("");
		if (setIsShowingEditModal) setIsShowingEditModal();
	};

	useEffect(() => {
		if (editingPost) {
			setTags(editingPost.photos.map((photo) => photo.tags));
			setPhotos(editingPost.photos.map((photo) => photo.photo));
			setLikeHidden(editingPost.likeHidden);
			setCommentDisabled(editingPost.commentDisabled);
			setDescription(editingPost.description);
		}

		return () => {
			handleLeave();
		};
	}, []);

	const handleCreatePost = async () => {
		let photoArray = [];
		for (let i = 0; i < photos.length; i++) {
			for (let j = 0; j < tags[i].length; j++) {
				tags[i][j].user = tags[i][j].user._id;
			}
			const photo = {
				photo: photos[i],
				tags: tags[i],
			};
			photoArray.push(photo);
		}

		await createPost(photoArray, description, likeHidden, commentDisabled);
		setPhotos([]);
		setCurrentPhoto(0);
		setTags([]);
		setLikeHidden(false);
		setCommentDisabled(false);
		setDescription("");
		window.alert("Post uploaded");
	};

	const handleUpdatePost = async () => {
		let photoArray = [];
		for (let i = 0; i < photos.length; i++) {
			for (let j = 0; j < tags[i].length; j++) {
				tags[i][j].user = tags[i][j].user._id;
			}
			const photo = {
				photo: photos[i],
				tags: tags[i],
			};
			photoArray.push(photo);
		}

		await updatePost({ photos: photoArray, description, likeHidden, commentDisabled });
		window.alert("Post updated");
	};

	return (
		<div className="rounded-lg shadow-lg flex flex-col items-center w-full h-[80vh] md:h-[808.8px] bg-white">
			<div className="flex items-center justify-between w-full px-4 border-b">
				<button
					onClick={() => {
						if (window.confirm("Are you sure to leave?\nYour edits won't be saved.")) handleLeave();
					}}
				>
					<MdOutlineArrowBack size={26} />
				</button>
				<h3 className="flex p-2 text-xl font-semibold justify-center">Edit</h3>
				<button className="text-blue-500 hover:text-black" onClick={editingPost ? handleUpdatePost : handleCreatePost}>
					{editingPost ? "Done" : "Upload"}
				</button>
			</div>
			<div className="flex w-full flex-col lg:flex-row lg:h-[764px] flex-grow">
				<PhotosPreview />
				<EditPostInfo />
			</div>
		</div>
	);
};

export default EditPostModal;
