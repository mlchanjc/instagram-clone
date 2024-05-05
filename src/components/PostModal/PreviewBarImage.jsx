import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import { PhotoContext } from "../../contexts/PostInfoContexts";
import { useContext } from "react";

const PreviewBarImage = ({ id, photo, deletePhoto }) => {
	const { setCurrentPhoto } = useContext(PhotoContext);

	if (!photo) return;

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id,
		animateLayoutChanges: () => false, //"fix" double animation on dragEnd
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="min-w-[6rem] h-full relative bg-transparent group" onClick={() => setCurrentPhoto(id - 1)}>
			<button
				className="absolute right-0.5 top-0.5 bg-gray-700 p-px hover:opacity-70 rounded-full z-10 group-hover:block hidden"
				onClick={(e) => {
					e.stopPropagation();
					deletePhoto(id - 1);
				}}
			>
				<MdClose size={16} color="white" />
			</button>
			<Image className="select-none pointer-events-none object-contain" alt={`photo`} src={photo} fill />
		</div>
	);
};

export default PreviewBarImage;
