import { useState, useContext } from "react";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { PostContext } from "../../contexts/PostInfoContexts";
import ToggleSwitch from "../ToggleSwitch";

const AdvancedSettings = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { likeHidden, setLikeHidden, commentDisabled, setCommentDisabled } = useContext(PostContext);

	return (
		<div className="flex flex-col p-0.5">
			<div className={`flex justify-between items-center p-2 ${isExpanded && "font-extrabold"}`}>
				Advanced settings:
				<button onClick={() => setIsExpanded((prev) => !prev)} className={`${isExpanded ? "rotate-90" : "-rotate-90"} duration-200`}>
					<MdOutlineArrowBackIos />
				</button>
			</div>
			<div className={`${isExpanded ? "h-full overflow-auto" : "h-0 overflow-hidden"} custom-scrollbar border-b`}>
				<ul>
					<li>
						<div className="flex flex-col gap-y-2 p-2">
							<div className="flex items-center justify-between w-full">
								Hide like counts on this post
								<ToggleSwitch checked={likeHidden} onChange={(e) => setLikeHidden(e.target.checked)} />
							</div>
							<span className="text-xs text-gray-500">
								Only you will see the total number of likes and views on this post. You can change this later by going to the ··· menu at the top of the post.
							</span>
						</div>
					</li>
					<li>
						<div className="flex flex-col gap-y-2 p-2">
							<div className="flex items-center justify-between w-full">
								Turn off commenting
								<ToggleSwitch checked={commentDisabled} onChange={(e) => setCommentDisabled(e.target.checked)} />
							</div>
							<span className="text-xs text-gray-500">You can change this later by going to the ··· menu at the top of your post.</span>
						</div>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default AdvancedSettings;
