import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useContext } from "react";
import { PhotoContext } from "../../contexts/PostInfoContexts";

export default function UploadPhotoModal() {
	const { setPhotos, setTags } = useContext(PhotoContext);

	const { getRootProps } = useDropzone({
		multiple: true,
		maxFiles: 10,
		accept: {
			"image/jpeg": [".jpeg", ".png"],
		},
		maxSize: 20 * 1024 * 1024, //20MB
		onDrop: (acceptedFile) => {
			if (acceptedFile) {
				acceptedFile.forEach(async (file) => {
					try {
						const reader = new FileReader();

						reader.onload = function () {
							setPhotos((prev) => [...prev, reader.result]);
							setTags((prev) => {
								return [...prev, []];
							});
						};
						reader.readAsDataURL(file);
					} catch (error) {
						console.log(error);
					}
				});
			}
		},
		onDropRejected: (files) => {
			if (files.length > 10) {
				window.alert("You cannot upload more than 10 photos");
			} else {
				window.alert("Some photos are too large (Max 20MB)");
			}
		},
	});

	return (
		<div className="rounded-lg shadow-lg flex flex-col items-center w-full bg-white">
			<h3 className="flex p-2 rounded-t text-xl font-semibold justify-center">Create new post</h3>

			<div className="flex flex-col justify-center items-center h-[70vh] md:h-[764px] w-full border-t outline-none gap-y-3" {...getRootProps()}>
				<Image className="select-none" src="/assets/dropzone.svg" width={120} height={120} alt="DropzoneImage" priority />
				<strong>Drag and drop photos here, or click to select</strong>
			</div>
		</div>
	);
}
