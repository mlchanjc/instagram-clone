import { useState, useContext, useRef, useCallback } from "react";
import { PhotoContext } from "../../contexts/PostInfoContexts";
import Image from "next/image";
import _ from "lodash";
import useCallApi from "@/hooks/useCallApi";
import { searchUsersAndHashtags } from "@/apis/search";
import { MdCancel } from "react-icons/md";

const UserTagSearchBox = ({ tagSearchX, tagSearchY, showTagSearch, mousePos, setShowTagSearch }) => {
	const searchBarRef = useRef(null);
	const [searchResult, setSearchResult] = useState([]);
	const { currentPhoto, tags, setTags } = useContext(PhotoContext);
	const callApi = useCallApi();

	const handleSearchRef = useRef();
	handleSearchRef.current = async (searchTerm) => {
		if (searchTerm !== "") {
			const data = await callApi(searchUsersAndHashtags(searchTerm, "user", 12));
			let i = 0;
			while (i < data.length) {
				const isInTagList = tags[currentPhoto].some((tag) => tag.user._id === data[i]._id);
				if (isInTagList) data.splice(i, 1);
				else i++;
			}

			setSearchResult([...data]);
		}
	};

	// search after stop inputting for 0.5s
	const handleSearch = useCallback(
		_.debounce((searchTerm) => handleSearchRef.current(searchTerm), 500),
		[]
	);

	const handleOnChange = (e) => {
		handleSearch(e.target.value);
	};

	const handleSelectUser = (i) => {
		const newTags = [...tags[currentPhoto], { x: mousePos.x, y: mousePos.y, user: searchResult[i] }];
		setSearchResult((prev) => {
			let temp = [...prev];
			temp.splice(i, 1);
			return temp;
		});
		setShowTagSearch(false);
		setTags((prev) => {
			let temp = [...prev];
			temp[currentPhoto] = newTags;
			return temp;
		});
	};

	return (
		<>
			<div
				className={`fixed flex flex-col z-20 w-80 duration-100 overflow-hidden rounded-lg bg-white ${showTagSearch ? "h-64 border" : "h-0"}`}
				style={{
					top: `${tagSearchY}px`,
					left: `${tagSearchX - 20}px`,
					translate: `${tagSearchY < window.innerHeight / 2 ? "0% 5%" : "0% -105%"}`,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex p-3 gap-x-3 justify-between border-b items-center">
					<strong>Tag:</strong>
					<div className="flex items-center w-full">
						<input ref={searchBarRef} className="outline-none text-xs w-full" placeholder="Search" onChange={handleOnChange}></input>
						{searchBarRef.current?.value !== "" && (
							<button
								onClick={() => {
									if (searchBarRef.current) searchBarRef.current.value = "";
									setSearchResult([]);
								}}
							>
								<MdCancel color="gray" />
							</button>
						)}
					</div>
				</div>
				<ul className="p-2 space-y-2 overflow-auto">
					{searchResult.map((user, i) => {
						return (
							<li>
								<button className="flex items-center space-x-2 px-2 py-1 hover:bg-yellow-50" onClick={() => handleSelectUser(i)}>
									<div className="relative rounded-full w-7 h-7">
										<Image alt="picture" src={user.picture} fill className="object-contain rounded-full" />
									</div>
									<div className="flex flex-col text-sm line-clamp-1 items-start">
										<p className="font-bold">{user.username}</p>
										<p className="text-gray-500">{user.nickname}</p>
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			</div>
			<div
				className={`fixed w-0 h-0 border-l-8 border-r-8 border-transparent -bottom-4 border-t-[16px] z-20 duration-100 ${
					showTagSearch ? "border-t-white" : "border-t-transparent"
				}`}
				style={{
					top: `${tagSearchY + (tagSearchY < window.innerHeight / 2 ? 0 : -15)}px`,
					left: `${tagSearchX - 7}px`,
					rotate: `${tagSearchY < window.innerHeight / 2 ? "180deg" : "0deg"}`,
				}}
			></div>
		</>
	);
};

export default UserTagSearchBox;
