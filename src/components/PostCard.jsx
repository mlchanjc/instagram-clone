import Image from "next/image";
import Link from "next/link";
import { BsChatFill, BsFillHeartFill } from "react-icons/bs";
import { TbBoxMultiple } from "react-icons/tb";

const PostCard = ({ post, index, setCurrentPost, setShowPostModal }) => {
	return (
		<Link href={`/p/${post._id}`}>
			<div
				className="relative w-full h-full aspect-square group"
				onClick={(e) => {
					e.preventDefault();
					setCurrentPost(index);
					setShowPostModal(true);
				}}
			>
				<Image alt="PostCard" src={post.photos[0].photo} className="object-cover" fill sizes="30vw" priority />
				{post.photoCount > 1 && (
					<div className="absolute top-2 right-2">
						<TbBoxMultiple color="white" size={20} />
					</div>
				)}

				<div className="absolute w-full h-full inset-0 bg-black bg-opacity-25 group-hover:flex hidden justify-center items-center font-bold text-white gap-x-8">
					{(!post.likeHidden || post.isOwner) && (
						<div className="flex space-x-2 justify-center items-center">
							<BsFillHeartFill color="white" />
							<span>{post.likeCount}</span>
						</div>
					)}
					<div className="flex space-x-2 justify-center items-center">
						<BsChatFill color="white" />
						<span>{post.commentCount}</span>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default PostCard;
