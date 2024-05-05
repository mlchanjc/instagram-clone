import { useState, useEffect, useRef, memo } from "react";
import { likePost } from "@/apis/posts";
import TagBubble from "@/components/TagBubble";
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import useRequiredTokenApi from "@/hooks/useRequiredTokenApi";

const PhotoCarousel = memo(({ photos, setLiked, postId }) => {
	const requiredTokenApi = useRequiredTokenApi();
	const [isShowingAnimation, setIsShowingAnimation] = useState(false);
	const [showTags, setShowTags] = useState(false);
	const [currentPhoto, setCurrentPhoto] = useState(0);
	const timeout = useRef(null);

	useEffect(() => {
		if (isShowingAnimation)
			setTimeout(() => {
				setIsShowingAnimation(false);
			}, 1000);
	}, [isShowingAnimation]);

	const handleSingleClick = () => {
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			setShowTags((prev) => !prev);
		}, 200);
	};

	const handleDoubleClick = requiredTokenApi(async () => {
		clearTimeout(timeout.current);
		if (!isShowingAnimation) {
			setLiked((prev) => !prev);
			const { liked: newLiked } = await likePost(postId);
			setLiked(newLiked);
			setIsShowingAnimation(newLiked);
		}
	});

	return (
		photos && (
			<div className="w-full h-full relative flex justify-center items-center aspect-square select-none outline-none cursor-pointer bg-black overflow-hidden">
				<ul className="w-full h-full flex overflow-hidden">
					{photos.map((photo, i) => {
						return (
							<li className="flex-shrink-0 relative w-full h-full duration-300" key={`CarouselPhoto${i}`} style={{ translate: `-${currentPhoto * 100}%` }}>
								<Image
									src={photo.photo}
									alt={`picture`}
									className="object-contain bg-black"
									draggable={false}
									fill
									sizes="30vw"
									onClick={handleSingleClick}
									onDoubleClick={handleDoubleClick}
									priority
								/>
							</li>
						);
					})}
				</ul>
				{photos[currentPhoto].tags.length > 0 && (
					<button className="absolute left-2 bottom-2 bg-black rounded-full p-2 group" onClick={handleSingleClick}>
						<FaUser color="white" size={12} className="group-active:opacity-50" />
					</button>
				)}
				{showTags &&
					photos[currentPhoto].tags.map((tag, i) => {
						return <TagBubble key={`tag${i}`} tag={tag} />;
					})}
				{photos.length > 1 && currentPhoto > 0 && (
					// Previous photo button

					<button
						className="absolute left-2 rounded-full bg-white p-1 opacity-50 hover:opacity-30 duration-200 outline-none"
						onClick={(e) => {
							e.stopPropagation();
							setCurrentPhoto((prev) => prev - 1);
						}}
					>
						<MdOutlineArrowBackIos color="gray" size={14} />
					</button>
				)}

				{photos.length > 1 && currentPhoto < photos.length - 1 && (
					// Next photo button

					<button
						className="absolute right-2 rounded-full bg-white p-1 opacity-50 hover:opacity-30 duration-200 outline-none"
						onClick={(e) => {
							e.stopPropagation();
							setCurrentPhoto((prev) => prev + 1);
						}}
					>
						<MdOutlineArrowForwardIos color="gray" size={14} />
					</button>
				)}

				{isShowingAnimation && (
					<div className="absolute inset-auto flex justify-center items-center pointer-events-none w-1/3 h-1/3">
						<Image className="animate-bigHeart" alt="ig_heart" src="/assets/ig_heart.svg" fill />
					</div>
				)}
				{photos.length > 1 && (
					<div className="flex absolute bottom-6 gap-x-1">
						{[...Array(photos.length)].map((_, index) => (
							<div
								key={`indicator${index}`}
								className={`rounded-full w-[6px] h-[6px] ${currentPhoto === index ? "opacity-100" : "opacity-50"} duration-300 bg-white`}
							></div>
						))}
					</div>
				)}
			</div>
		)
	);
});

export default PhotoCarousel;
