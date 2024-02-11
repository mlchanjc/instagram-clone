import { useContext } from "react";
import BottomModal from "../BottomModal";
import UploadPhotoModal from "./UploadPhotoModal";
import { PhotoContext, PostContext } from "../../contexts/PostInfoContexts";
import EditPostModal from "./EditPostModal";

export default function CreatePost({ setShowModal }) {
	const { photos, setPhotos, setCurrentPhoto, setTags } = useContext(PhotoContext);
	const { setLikeHidden, setCommentDisabled, setDescription } = useContext(PostContext);

	const handleLeave = () => {
		if (photos.length > 0 && !window.confirm("Are you sure to leave?\nYour edits won't be saved.")) {
			return;
		}

		setPhotos([]);
		setCurrentPhoto(0);
		setTags([]);
		setLikeHidden(false);
		setCommentDisabled(false);
		setDescription("");
		setShowModal(false);
	};

	return (
		<BottomModal onClick={handleLeave}>
			<div className={`relative h-fit w-[92vw] lg:w-[800px] ${photos.length > 0 && "xl:w-[1104px]"} duration-300 select-none`}>
				{photos.length === 0 ? <UploadPhotoModal /> : <EditPostModal />}
			</div>
		</BottomModal>
	);
}
