import Image from "next/image";
import { PhotoContext } from "../../contexts/PostInfoContexts";
import { useState, useContext } from "react";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { MdCancel } from "react-icons/md";

export default function TagList() {
	const { currentPhoto, tags, setTags } = useContext(PhotoContext);
	const [isExpanded, setIsExpanded] = useState(false);

	const handleDeleteTag = (i) => {
		let temp = tags[currentPhoto];
		temp.splice(i, 1);
		setTags((prev) => {
			let newTags = [...prev];
			newTags[currentPhoto] = temp;
			return newTags;
		});
	};

	return (
		tags[currentPhoto]?.length > 0 && (
			<div className="flex flex-col p-0.5">
				<div className={`flex justify-between items-center p-2 ${isExpanded && "font-extrabold"}`}>
					Tag list:
					<button onClick={() => setIsExpanded((prev) => !prev)} className={`${isExpanded ? "rotate-90" : "-rotate-90"} duration-200`}>
						<MdOutlineArrowBackIos />
					</button>
				</div>
				<div className={`${isExpanded ? "h-full overflow-auto" : "h-0 overflow-hidden"} custom-scrollbar border-b`}>
					<ul>
						{tags[currentPhoto].map((tag, i) => {
							return (
								<li key={`TagListItem${tag.user._id}`}>
									<div className="flex items-center space-x-2 p-2 text-sm">
										<div className="relative rounded-full w-7 h-7 flex-shrink-0">
											<Image alt="picture" src={tag.user.picture} fill className="object-contain rounded-full" />
										</div>
										<div className="flex flex-col w-full">
											<strong>{tag.user.username}</strong>
											<span className="text-gray-500">{tag.user.nickname}</span>
										</div>
										<button onClick={() => handleDeleteTag(i)}>
											<MdCancel color="gray" />
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		)
	);
}
