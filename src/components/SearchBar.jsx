import { useEffect, useState, useRef, useCallback } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import _ from "lodash";
import { searchUsersAndHashtags } from "@/apis/search";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import Link from "next/link";
import useCallApi from "@/hooks/useCallApi";

const SearchBar = ({ isSearching, setIsSearching }) => {
	const router = useRouter();
	const searchBarRef = useRef(null);
	const [isFocusing, setIsFocusing] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResult, setSearchResult] = useState(null);
	const [recentSearch, setRecentSearch] = useState([]);
	const callApi = useCallApi();

	const handleSearchRef = useRef();
	handleSearchRef.current = async (searchTerm) => {
		if (searchTerm !== "") {
			const data = await callApi(searchUsersAndHashtags(searchTerm, "all", 50));
			setSearchResult(data);
		}
	};

	// search after stop inputting for 0.5s
	const handleSearch = useCallback(
		_.debounce((searchTerm) => handleSearchRef.current(searchTerm), 500),
		[]
	);

	useEffect(() => {
		if (searchTerm === "") setSearchResult(null);
		handleSearch(searchTerm);
	}, [searchTerm]);

	useEffect(() => {
		setRecentSearch(localStorage.getItem("recent_search") ? JSON.parse(localStorage.getItem("recent_search")) : []);
	}, [searchResult]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
				setIsSearching(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleClick = (insertingItem) => {
		const recentSearchArray = localStorage.getItem("recent_search") ? JSON.parse(localStorage.getItem("recent_search")) : [];
		const exist = recentSearchArray.some((item) => item._id === insertingItem._id);
		if (!exist) {
			recentSearchArray.push(insertingItem);
			localStorage.setItem("recent_search", JSON.stringify(recentSearchArray));
		}

		if (insertingItem.type === "user") {
			router.push(`/${insertingItem.username}`);
		} else if (insertingItem.type === "hashtag") {
			router.push(`/explore/tags/${insertingItem.name}`);
		}
	};

	const handleClearAll = () => {
		localStorage.removeItem("recent_search");
		setRecentSearch([]);
	};

	const handleRemove = (removingItem) => {
		let recentSearchArray = localStorage.getItem("recent_search") ? JSON.parse(localStorage.getItem("recent_search")) : [];
		recentSearchArray = recentSearchArray.filter((item) => item._id !== removingItem._id);
		localStorage.setItem("recent_search", JSON.stringify(recentSearchArray));
		setRecentSearch(recentSearchArray);
	};

	return (
		<div
			ref={searchBarRef}
			className={`fixed flex flex-col top-0 left-[76px] h-screen bg-white rounded-r-xl shadow-[5px_0px_15px_-5px_rgba(0,0,0,0.5)] ${
				isSearching ? "w-[400px] opacity-100" : "w-0 opacity-0"
			} overflow-hidden duration-300`}
		>
			<div className="p-6 text-xl font-bold">Search</div>
			<div className="p-4">
				<div className="flex items-center px-4 py-2 rounded-lg outline-none bg-yellow-50 group gap-x-2">
					{!isFocusing && <IoSearchOutline size={19} className="group-focus:hidden text-gray-400" />}
					<input
						placeholder="search"
						value={searchTerm}
						className="outline-none bg-yellow-50 w-full"
						onFocus={() => setIsFocusing(true)}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					{isFocusing && (
						<button
							className="w-4"
							onClick={() => {
								setIsFocusing(false);
								setSearchTerm("");
								setSearchResult(null);
							}}
						>
							<MdCancel size={18} className="group-focus:hidden text-gray-400" />
						</button>
					)}
				</div>
			</div>
			{!searchResult && <hr />}
			<div className="flex flex-col items-center h-full">
				{searchResult ? (
					searchResult.length > 0 ? (
						<ul className="w-full overflow-hidden mb-7">
							{searchResult.map((item) => {
								return (
									<li key={item._id} className="w-full px-6 py-2 hover:bg-yellow-50 group">
										{item.type === "user" && (
											<Link href={`/${item.username}`} className="w-full">
												<button
													className="flex gap-x-3 items-center active:opacity-60 w-full"
													onClick={(e) => {
														e.preventDefault();
														handleClick(item);
													}}
												>
													<div className="relative rounded-full overflow-hidden w-[44px] h-[44px] flex-shrink-0">
														<Image src={item.picture} width={44} height={44} alt="picture" className="filter group-hover:brightness-90" />
													</div>
													<div className="flex flex-col text-sm items-start flex-shrink-0">
														<p className="font-bold">{item.username}</p>
														<p className="text-gray-500">{item.nickname}</p>
													</div>
												</button>
											</Link>
										)}
										{item.type === "hashtag" && (
											<Link href={`/explore/tags/${item.name}`} className="w-full">
												<button
													className="flex gap-x-3 items-center active:opacity-60 w-full"
													onClick={(e) => {
														e.preventDefault();
														handleClick(item);
													}}
												>
													<div className="flex items-center justify-center rounded-full overflow-hidden w-[44px] h-[44px] text-2xl font-bold border flex-shrink-0 group-hover:border-gray-400">
														#
													</div>
													<div className="flex flex-col text-sm items-start flex-shrink-0">
														<p className="font-bold">{"#" + item.name}</p>
														<p className="text-gray-500">{item.postCount + ` post${item.postCount > 1 ? "s" : ""}`}</p>
													</div>
												</button>
											</Link>
										)}
									</li>
								);
							})}
						</ul>
					) : (
						<div className="flex items-center h-full text-gray-500">No results found.</div>
					)
				) : (
					<div className="flex flex-col w-full h-full">
						<div className="flex justify-between items-center w-full text-sm font-bold p-6 pb-4">
							<p>Recent</p>
							{recentSearch.length > 0 && (
								<button className="text-blue-500 truncate" onClick={handleClearAll}>
									Clear all
								</button>
							)}
						</div>

						{recentSearch.length > 0 ? (
							<ul className="w-full overflow-hidden mb-7">
								{recentSearch.map((item) => {
									return (
										<li key={item._id} className="w-full px-6 py-2 hover:bg-yellow-50 group">
											<div className="flex">
												{item.type === "user" && (
													<Link href={`/${item.username}`} className="w-full">
														<button
															className="flex gap-x-3 items-center w-full active:opacity-60"
															onClick={(e) => {
																e.preventDefault();
																handleClick(item);
															}}
														>
															<div className="relative rounded-full overflow-hidden w-[44px] h-[44px] flex-shrink-0">
																<Image src={item.picture} width={44} height={44} alt="picture" className="filter group-hover:brightness-90" />
															</div>
															<div className="flex flex-col flex-shrink-0 text-sm items-start">
																<p className="font-bold">{item.username}</p>
																<p className="text-gray-500">{item.nickname}</p>
															</div>
														</button>
													</Link>
												)}
												{item.type === "hashtag" && (
													<Link href={`/explore/tags/${item.name}`} className="w-full">
														<button
															className="flex gap-x-3 items-center w-full active:opacity-60"
															onClick={(e) => {
																e.preventDefault();
																handleClick(item);
															}}
														>
															<div className="flex items-center justify-center rounded-full overflow-hidden w-[44px] h-[44px] text-2xl font-bold border flex-shrink-0 group-hover:border-gray-400">
																#
															</div>
															<p className="font-bold flex-shrink-0">{"#" + item.name}</p>
														</button>
													</Link>
												)}
												<button
													className="p-2 text-gray-600 active:opacity-50 active:scale-95 hover:scale-105 duration-100"
													onClick={() => handleRemove(item)}
												>
													<RxCross2 size={22} />
												</button>
											</div>
										</li>
									);
								})}
							</ul>
						) : (
							<strong className="flex items-center justify-center text-gray-500 h-full w-full">No recent searches.</strong>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchBar;
