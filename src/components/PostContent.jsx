import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { savePost, getPostById, likePost, deletePost, updatePost } from "@/apis/posts";
import { getTimePassed } from "@/utils/dateHelper";
import CommentInput from "./CommentInput";
import { BsFillHeartFill, BsHeart, BsChat, BsSend } from "react-icons/bs";
import { GoBookmark, GoBookmarkFill } from "react-icons/go";
import Comment from "./Comment";
import PhotoCarousel from "./PhotoCarousel";
import FormattedText from "./FormattedText";
import UserPreview from "./UserPreview";
import { CommentContext } from "@/contexts/CommentContext";
import { followUser } from "@/apis/users";
import { TfiMoreAlt } from "react-icons/tfi";
import TopModal from "./TopModal";
import EditPostModal from "./PostModal/EditPostModal";
import useRequiredTokenApi from "@/hooks/useRequiredTokenApi";
import useAsyncError from "@/hooks/useAsyncError";

const PostContent = ({ post, postId, deletePostEffect }) => {
	const requiredTokenApi = useRequiredTokenApi();
	const { comments, setComments } = useContext(CommentContext);
	const [postData, setPostData] = useState(post ?? null);
	const [liked, setLiked] = useState(false);
	const [saved, setSaved] = useState(false);
	const [isShowingOptionModal, setIsShowingOptionModal] = useState(false);
	const [isShowingEditModal, setIsShowingEditModal] = useState(false);
	const throwError = useAsyncError();

	const fetchPostData = async () => {
		try {
			const data = await getPostById(postId);
			if (data) {
				setPostData(data);
				setComments(data.comments);
				setLiked(data.hasLiked);
				setSaved(data.hasSaved);
			}
		} catch (error) {
			throwError(error);
		}
	};

	const handleLikePost = requiredTokenApi(async () => {
		try {
			setLiked((prev) => !prev);
			const { liked: newLiked } = await likePost(postData._id);
			setLiked(newLiked);
		} catch (error) {
			throwError(error);
		}
	});

	const handleSavePost = requiredTokenApi(async () => {
		try {
			setSaved((prev) => !prev);
			const { saved: newSaved } = await savePost(postData._id);
			setSaved(newSaved);
		} catch (error) {
			throwError(error);
		}
	});

	const handleUpdatePost = async (editedFields) => {
		try {
			const { newPost } = await updatePost(postData._id, editedFields);
			setPostData((prev) => ({ ...prev, ...newPost }));
			setIsShowingOptionModal(false);
			setIsShowingEditModal(false);
		} catch (error) {
			throwError(error);
		}
	};

	const handleFollow = requiredTokenApi(async () => {
		try {
			const { isFollowing } = await followUser(postData.user._id);
			setPostData((prev) => ({ ...prev, isFollowing }));
		} catch (error) {
			throwError(error);
		}
	});

	const handleDeletePost = async () => {
		try {
			if (window.confirm("Are you sure to delete this post?")) {
				await deletePost(postData._id);
				setIsShowingOptionModal(false);
				deletePostEffect();
			}
		} catch (error) {
			throwError(error);
		}
	};

	const handleCopyLink = () => {
		const currentUrl = window.location.href;
		navigator.clipboard.writeText(currentUrl);
		const button = document.getElementById("copy-link-button");
		if (button) button.innerHTML = "Link copied";
	};

	useEffect(() => {
		setPostData(post);
		fetchPostData();
		setComments([]);
	}, [post]);

	return (
		postData && (
			<div className="w-[92vw] max-w-[1270px] flex md:flex-row flex-col h-[85vh] md:h-auto md:aspect-[4/3] text-sm outline-none">
				<div className="w-full md:w-[63%] h-1/2 md:h-full">
					<PhotoCarousel photos={postData.photos} setLiked={setLiked} postId={postData._id} />
				</div>
				<div className="w-full md:w-[37%] px-4 py-3 flex flex-col bg-white gap-y-3 border border-gray-300 h-1/2 md:h-full">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className="relative w-8 h-8">
								<Image alt="picture" className="rounded-full object-contain" src={postData.user?.picture} fill sizes="10vw" />
							</div>
							<span className="font-bold mr-1">
								<UserPreview username={postData.user?.username} />
							</span>

							{!postData.isFollowing && !postData.isOwner && (
								<>
									<span className="text-gray-500 mr-2">•</span>
									<button onClick={handleFollow} className="text-blue-400 hover:text-blue-500 active:opacity-60">
										<strong>Follow</strong>
									</button>
								</>
							)}
						</div>

						{postData.isOwner && (
							<button className="active:opacity-50" onClick={() => setIsShowingOptionModal(true)}>
								<TfiMoreAlt size={16} />
							</button>
						)}
					</div>
					<div className="flex flex-col py-4 h-full overflow-auto gap-y-5 hidden-scrollbar">
						<div className="flex gap-x-2">
							<div className="relative w-8 h-8 flex-shrink-0">
								<Image alt="picture" className="rounded-full object-contain" src={postData.user?.picture} fill sizes="10vw" />
							</div>

							<div className="flex flex-col gap-y-2 flex-grow overflow-auto">
								<span className="whitespace-pre-wrap break-words">
									<span className="font-bold mr-1">
										<UserPreview username={postData.user?.username} />
									</span>
									<FormattedText text={postData.description} />
								</span>

								<div className="flex text-gray-500 text-xs">
									<span>{getTimePassed(postData.createdAt)}</span>
								</div>
							</div>
						</div>
						{comments.map((comment) => {
							return <Comment key={comment._id} comment={comment} />;
						})}
					</div>
					<div className="flex items-center justify-between pt-1">
						<div className="flex items-center gap-x-3">
							<button className={`${!liked && "hover:opacity-60"} active:opacity-30`} onClick={handleLikePost}>
								{liked ? <BsFillHeartFill size={24} color="red" className="animate-heart" /> : <BsHeart size={24} />}
							</button>
							<button
								className="hover:opacity-60 active:opacity-30 -translate-y-[2px] ml-[5px]"
								onClick={() => {
									const container = document.getElementById("PostContent-CommentInput-Container");
									container.childNodes[0].childNodes[1].focus();
								}}
							>
								<BsChat size={24} />
							</button>
							<button className="hover:opacity-60 active:opacity-30 ml-1" onClick={handleCopyLink}>
								<BsSend size={22} />
							</button>
						</div>

						<button className={`${!saved && "hover:opacity-60"} active:opacity-30`} onClick={handleSavePost}>
							{saved ? <GoBookmarkFill size={24} /> : <GoBookmark size={24} />}
						</button>
					</div>
					<div className="flex flex-col pb-2">
						{!postData.likeHidden && (
							<div>
								<button className="font-bold">{`${postData.likeCount} like${postData.likeCount > 1 ? "s" : ""}`}</button>
							</div>
						)}
						<p className="text-xs text-gray-400">{getTimePassed(postData.createdAt)}</p>
					</div>
					{!postData.commentDisabled && (
						<div id="PostContent-CommentInput-Container">
							<CommentInput inPostContent={true} postId={postData._id} />
						</div>
					)}
				</div>
				{isShowingOptionModal && (
					<TopModal onClick={() => setIsShowingOptionModal(false)}>
						<div className="h-fit w-[80vw] sm:w-[400px]">
							<div className="rounded-lg shadow-lg flex flex-col items-center w-full h-full bg-white">
								<div className="flex flex-col w-full h-full divide-y divide-gray-300">
									<button className="py-4 text-red-500 font-semibold" onClick={handleDeletePost}>
										Delete
									</button>
									<button className="py-4" onClick={() => setIsShowingEditModal(true)}>
										Edit
									</button>
									<button className="py-4" onClick={() => handleUpdatePost({ likeHidden: !postData.likeHidden })}>
										{`${postData.likeHidden ? "Show likes" : "Hide likes"}`}
									</button>
									<button className="py-4" onClick={() => handleUpdatePost({ commentDisabled: !postData.commentDisabled })}>
										{`${postData.commentDisabled ? "Enable comment" : "Disable comment"}`}
									</button>
									<button className="py-4" onClick={handleCopyLink} id="copy-link-button">
										Copy link
									</button>
									<button className="py-4" onClick={() => setIsShowingOptionModal(false)}>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</TopModal>
				)}
				{isShowingEditModal && (
					<TopModal onClick={() => window.confirm("Are you sure to leave?\nYour edits won't be saved.") && setIsShowingEditModal(false)}>
						<EditPostModal editingPost={postData} setIsShowingEditModal={setIsShowingEditModal} updatePost={handleUpdatePost} />
					</TopModal>
				)}
			</div>
		)
	);
};

export default PostContent;
