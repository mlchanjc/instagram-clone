import { memo, useState } from "react";
import { TbBoxMultiple } from "react-icons/tb";
import PreviewBar from "./PreviewBar";
import PreviewOverlay from "./PreviewOverlay";

const PhotosPreview = memo(() => {
	const [showPreviewBar, setShowPreviewBar] = useState(null); //init as null to not show animation at first time

	return (
		<div className="flex items-center w-full lg:w-[764px] h-full">
			<div className="flex relative justify-center items-center h-full w-full outline-none bg-gray-500">
				<PreviewOverlay />

				{/* Toggle preview bar button */}
				<button
					className={`absolute right-4 bottom-4 rounded-full p-2 duration-200 outline-none ${showPreviewBar ? "bg-gray-200" : "bg-gray-700 hover:opacity-70"}`}
					onClick={() => setShowPreviewBar((prev) => !prev)}
				>
					<TbBoxMultiple color={`${showPreviewBar ? "black" : "white"}`} />
				</button>

				{/* Preview bar */}
				<div
					className={`${
						showPreviewBar !== null ? (showPreviewBar ? "animate-slideIn" : "animate-slideOut") : "hidden"
					} flex absolute right-4 bottom-14 rounded-lg bg-gray-700 p-1 outline-none space-x-2 xl:max-w-[732px] max-w-[95%]`}
				>
					<PreviewBar />
				</div>
			</div>
		</div>
	);
});

export default PhotosPreview;
