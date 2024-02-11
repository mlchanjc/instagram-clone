import Link from "next/link";

const TagBubble = ({ tag }) => {
	return (
		<Link href={`/${tag.user.username}`}>
			{tag.y > 80 ? (
				<div
					className="absolute w-0 h-0 border-l-4 border-r-4 border-transparent animate-tagBubble -bottom-2 border-t-8 border-t-gray-800 active:opacity-80 group"
					style={{ top: `${tag.y - 1}%`, left: `${tag.x - 0.4}%` }}
				>
					<button className="absolute -top-10 -left-3 px-3 py-1.5 w-fit h-fit bg-gray-800 text-sm rounded-sm group-active:opacity-80 font-bold text-white">
						{tag.user.username}
					</button>
				</div>
			) : (
				<div
					className="absolute w-0 h-0 border-l-4 border-r-4 border-transparent animate-tagBubble -bottom-2 border-b-8 border-b-gray-800 active:opacity-80 group"
					style={{ top: `${tag.y - 0.3}%`, left: `${tag.x - 0.4}%` }}
				>
					<button className="absolute top-2 -left-3 px-3 py-1.5 w-fit h-fit bg-gray-800 text-sm rounded-sm group-active:opacity-80 font-bold text-white">
						{tag.user.username}
					</button>
				</div>
			)}
		</Link>
	);
};

export default TagBubble;
