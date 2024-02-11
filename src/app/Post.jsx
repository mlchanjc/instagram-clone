import { getTimePassed } from "@/utils/dateHelper";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { BsFillHeartFill, BsHeart, BsChat, BsSend } from "react-icons/bs";
import { GoBookmark, GoBookmarkFill } from "react-icons/go";
import { likePost, savePost } from "@/apis/posts";
import CommentInput from "@/components/CommentInput";
import BottomModal from "@/components/BottomModal";
import PostContent from "@/components/PostContent";
import PhotoCarousel from "@/components/PhotoCarousel";
import FormattedText from "@/components/FormattedText";
import useCallApi from "@/hooks/useCallApi";
import UserPreview from "@/components/UserPreview";

const Post = ({ post }) => {
	const callApi = useCallApi();
	const descriptionRef = useRef(null);
	const [readMore, setReadMore] = useState(null); // init null to disable read more button if not clamped
	const [liked, setLiked] = useState(post.hasLiked);
	const [saved, setSaved] = useState(post.hasSaved);
	const [showPostModal, setShowPostModal] = useState(false);

	const handleLikePost = async () => {
		const { liked } = await callApi(likePost(post._id));
		setLiked(liked);
	};

	const handleSavePost = async () => {
		const { saved } = await callApi(savePost(post._id));
		setSaved(saved);
	};

	useEffect(() => {
		// check if clamped, if yes, enable read more button
		if (descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight) setReadMore(false);
	}, []);

	useEffect(() => {
		if (showPostModal) window.history.replaceState("", "", `/p/${post._id}`);
		else window.history.replaceState("", "", "/");
	}, [showPostModal]);

	return (
		<>
			<div className="flex flex-col w-full space-y-1.5 pb-3 border-b text-sm">
				<div className="flex items-center space-x-2 mt-4 mb-2">
					<div className="relative w-7 h-7">
						<Image src={post.user?.picture} alt={`avatar`} className="object-contain rounded-full" fill sizes="28px" />
					</div>

					<UserPreview username={post.user.username} />
					<span className="text-gray-500">•</span>
					<p className=" text-gray-500">{getTimePassed(post.createdAt)}</p>
				</div>

				<div className="w-full h-full rounded-[3px] overflow-auto">
					<PhotoCarousel photos={post.photos} setLiked={setLiked} postId={post._id} />
				</div>

				<div className="flex items-center justify-between pt-2">
					<div className="flex items-center gap-x-3">
						<button className={`${!liked && "hover:opacity-60"} active:opacity-30`} onClick={handleLikePost}>
							{liked ? <BsFillHeartFill size={24} color="red" className="animate-heart" /> : <BsHeart size={24} />}
						</button>
						<button className="hover:opacity-60 active:opacity-30 -translate-y-[2px] ml-[5px]" onClick={() => setShowPostModal(true)}>
							<BsChat size={24} />
						</button>
						<button className="hover:opacity-60 active:opacity-30 ml-1">
							<BsSend size={22} />
						</button>
					</div>

					<button className={`${!saved && "hover:opacity-60"} active:opacity-30`} onClick={handleSavePost}>
						{saved ? <GoBookmarkFill size={24} /> : <GoBookmark size={24} />}
					</button>
				</div>
				{!post.likeHidden && (
					<div>
						<button className="font-bold">{`${post.likeCount} like${post.likeCount > 1 ? "s" : ""}`}</button>
					</div>
				)}

				<div className="flex">
					<span className={`${readMore ? "" : "line-clamp-1"} break-words whitespace-pre-wrap max-w-[85%] w-fit`} ref={descriptionRef}>
						<UserPreview username={post.user.username} />
						<span className="mx-0.5"></span>
						<FormattedText text={post.description} />
					</span>
					{readMore !== null && !readMore && (
						<button onClick={() => setReadMore(true)} className="text-gray-500">
							more
						</button>
					)}
				</div>

				{post.commentCount > 0 && (
					<div>
						<button className="text-gray-400" onClick={() => setShowPostModal(true)}>{`Read all ${post.commentCount} comment${
							post.commentCount > 1 ? "s" : ""
						}`}</button>
					</div>
				)}
				{!post.commentDisabled && <CommentInput inPostContent={false} postId={post._id} />}
			</div>
			{showPostModal && (
				<BottomModal onClick={() => setShowPostModal(false)}>
					<PostContent post={post} postId={post._id} />
				</BottomModal>
			)}
		</>
	);
};

export default Post;
