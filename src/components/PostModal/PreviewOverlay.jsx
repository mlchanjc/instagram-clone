import { useState, useContext, useRef, useEffect } from "react";
import { PhotoContext } from "../../contexts/PostInfoContexts";
import Image from "next/image";
import TagBubble from "../TagBubble";
import _ from "lodash";
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
import UserTagSearchBox from "./UserTagSearchBox";

export default function PreviewOverlay() {
	const tagSearchRef = useRef(null);
	const photoRef = useRef(null);
	const [showTagSearch, setShowTagSearch] = useState(false);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const { photos, currentPhoto, tags, setCurrentPhoto } = useContext(PhotoContext);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (tagSearchRef.current && photoRef.current) {
				if (!tagSearchRef.current.contains(event.target) && !photoRef.current.contains(event.target)) {
					setShowTagSearch(false);
				}
			}
		};

		const handleResize = (event) => {
			setShowTagSearch(false);
		};

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("resize", handleResize);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const handleClick = (e) => {
		// only allow tags in photo area
		const clickX = e.clientX - e.target.getBoundingClientRect().left;
		const clickY = e.clientY - e.target.getBoundingClientRect().top;

		const originalPhotoWidth = e.target.naturalWidth;
		const originalPhotoHeight = e.target.naturalHeight;

		const renderedPhotoWidth = e.target.offsetWidth;
		const renderedPhotoHeight = e.target.offsetHeight;

		let ratio = 0;
		if (originalPhotoWidth > originalPhotoHeight) ratio = originalPhotoWidth / renderedPhotoWidth;
		else ratio = originalPhotoHeight / renderedPhotoHeight;

		const isClickedOnPhoto =
			Math.abs(renderedPhotoWidth / 2 - clickX) < originalPhotoWidth / ratio / 2 && Math.abs(renderedPhotoHeight / 2 - clickY) < originalPhotoHeight / ratio / 2;

		if (isClickedOnPhoto) {
			const relativeX = (clickX / renderedPhotoWidth) * 100;
			const relativeY = (clickY / renderedPhotoHeight) * 100;
			setMousePos({ x: relativeX, y: relativeY });
			setShowTagSearch(true);
		} else {
			setShowTagSearch(false);
		}
	};

	const tagSearchX = photoRef.current?.getBoundingClientRect().left + photoRef.current?.getBoundingClientRect().width * (mousePos.x / 100);
	const tagSearchY = photoRef.current?.getBoundingClientRect().top + photoRef.current?.getBoundingClientRect().height * (mousePos.y / 100);

	return (
		<div className="h-full w-full flex items-center justify-center lg:aspect-square bg-white">
			<div className="aspect-square h-full relative">
				<Image
					ref={photoRef}
					alt="UploadedPhoto"
					draggable={false}
					className="select-none object-contain"
					src={photos[currentPhoto]}
					fill
					onClick={handleClick}
					sizes="100vw"
				/>
				<div className="absolute w-full h-full pointer-events-none">
					{tags[currentPhoto]?.map((tag, i) => {
						return <TagBubble key={`tag${i}`} tag={tag} />;
					})}
				</div>
			</div>
			<div ref={tagSearchRef}>
				<UserTagSearchBox tagSearchX={tagSearchX} tagSearchY={tagSearchY} showTagSearch={showTagSearch} setShowTagSearch={setShowTagSearch} mousePos={mousePos} />
			</div>

			{photos.length > 1 && currentPhoto > 0 && (
				// Previous photo button

				<button className="absolute left-2 rounded-full bg-gray-700 p-2 hover:opacity-70 duration-200 outline-none" onClick={() => setCurrentPhoto((prev) => prev - 1)}>
					<MdOutlineArrowBackIos color="white" />
				</button>
			)}

			{photos.length > 1 && currentPhoto < photos.length - 1 && (
				// Next photo button

				<button className="absolute right-2 rounded-full bg-gray-700 p-2 hover:opacity-70 duration-200 outline-none" onClick={() => setCurrentPhoto((prev) => prev + 1)}>
					<MdOutlineArrowForwardIos color="white" />
				</button>
			)}

			{/* Current photo indicator */}
			{photos.length > 1 && (
				<div className="flex absolute bottom-6 space-x-1">
					{[...Array(photos.length)].map((_, index) => (
						<div key={`indicator${index}`} className={`rounded-full w-[6px] h-[6px] ${currentPhoto === index ? "bg-blue-500" : "bg-gray-400"} duration-300`}></div>
					))}
				</div>
			)}
		</div>
	);
}
