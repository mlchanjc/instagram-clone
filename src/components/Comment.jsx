import { getTimePassed } from "@/utils/dateHelper";
import Image from "next/image";
import { useState, memo, useContext } from "react";
import { BsFillHeartFill, BsHeart } from "react-icons/bs";
import { getChildComments, likeComment } from "@/apis/comments";
import FormattedText from "./FormattedText";
import UserPreview from "./UserPreview";
import { CommentContext } from "@/contexts/CommentContext";
import useRequiredTokenApi from "@/hooks/useRequiredTokenApi";

const Comment = memo(({ comment }) => {
	const requiredTokenApi = useRequiredTokenApi();
	const { setComments, setRespondingComment } = useContext(CommentContext);
	const [liked, setLiked] = useState(comment.hasLiked);
	const [isShowingChild, setIsShowingChild] = useState(false);

	const handleFetchChildComments = async () => {
		setIsShowingChild((prev) => !prev);

		const data = await getChildComments(comment._id);
		setComments((prev) => {
			let temp = [...prev];
			for (let i = 0; i < temp.length; i++) {
				if (temp[i]._id === comment._id) {
					temp[i].childComments = data;
					break;
				}
			}
			return [...temp];
		});
	};

	const handleLikeComment = requiredTokenApi(async (parentComment) => {
		setLiked((prev) => !prev);
		const { liked: newLiked } = await likeComment(comment._id);
		setComments((prev) => {
			let temp = [...prev];
			if (parentComment) {
				for (let i = 0; i < temp.length; i++) {
					if (temp[i]._id === parentComment) {
						for (let j = 0; j < temp[i].childComments.length; j++) {
							if (temp[i].childComments[j]._id === comment._id) {
								temp[i].childComments[j].likeCount = temp[i].childComments[j].likeCount + (newLiked ? 1 : -1);
								break;
							}
						}
						break;
					}
				}
			} else {
				for (let i = 0; i < temp.length; i++) {
					if (temp[i]._id === comment._id) {
						temp[i].likeCount = temp[i].likeCount + (newLiked ? 1 : -1);
						break;
					}
				}
			}

			return [...temp];
		});
		setLiked(newLiked);
	});

	const handleOnClickRespond = async () => {
		setRespondingComment({ username: comment.user.username, _id: comment.parentComment ?? comment._id });
	};

	return (
		<div className="flex gap-x-2">
			<div className="flex-shrink-0 relative w-8 h-8 select-none">
				<Image alt="picture" className="rounded-full object-contain" src={comment.user.picture} fill sizes="10vw" />
			</div>
			<div className="flex flex-col w-full overflow-auto">
				<div className="flex overflow-auto">
					<div className="flex flex-col gap-y-2 w-full overflow-auto">
						<span className="whitespace-pre-wrap break-words">
							<span className="font-bold mr-1 select-none">
								<UserPreview username={comment.user.username} />
							</span>
							<FormattedText text={comment.content} />
						</span>

						<div className="flex text-gray-500 text-xs space-x-2">
							<span>{getTimePassed(comment.createdAt)}</span>
							{comment.likeCount > -1 && <span className="font-bold">{`${comment.likeCount} like${comment.likeCount > 1 ? "s" : ""}`}</span>}
							<button onClick={handleOnClickRespond} className="font-bold">
								respond
							</button>
						</div>
						{comment.childCommentCount > 0 && (
							<button onClick={handleFetchChildComments}>
								<div className="flex items-center text-gray-500 text-xs mt-3 font-bold select-none">
									<div className="border-b border-gray-500 w-6 mr-4"></div>
									{isShowingChild ? <div>Hide response</div> : <div>{`see response ( ${comment.childCommentCount} )`}</div>}
								</div>
							</button>
						)}
					</div>
					<div className="mt-2 ml-2">
						<button className={`${!liked && "hover:opacity-60"} active:opacity-30`} onClick={() => handleLikeComment(comment.parentComment)}>
							{liked ? <BsFillHeartFill size={12} color="red" /> : <BsHeart size={12} />}
						</button>
					</div>
				</div>

				{comment.childComments?.length > 0 && (
					<div className={`flex flex-col gap-y-3 mt-5 ${isShowingChild ? "" : "hidden"}`}>
						{comment.childComments.map((child) => {
							return <Comment key={child._id} comment={child} />;
						})}
					</div>
				)}
			</div>
		</div>
	);
});

export default Comment;
