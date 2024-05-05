import { useState, useRef, useEffect, useCallback, useContext, memo } from "react";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import EmojiPicker from "emoji-picker-react";
import _ from "lodash";
import { searchUsersAndHashtags } from "@/apis/search";
import Image from "next/image";
import { createComment } from "@/apis/comments";
import { CommentContext } from "@/contexts/CommentContext";
import useRequiredTokenApi from "@/hooks/useRequiredTokenApi";

const CommentInput = memo(({ inPostContent, postId }) => {
	const requiredTokenApi = useRequiredTokenApi();
	const { setComments, respondingComment, setRespondingComment } = useContext(CommentContext);
	const inputRef = useRef(null);
	const emojiPickerRef = useRef(null);
	const caretPos = useRef(0); // remember the current caret position for inputting emojis/tags
	const [comment, setComment] = useState("");
	const [isShowingEmoji, setIsShowingEmoji] = useState(false);
	const [searchResult, setSearchResult] = useState([]);

	const onEmojiClick = (e) => {
		const pos = caretPos.current;
		setComment((prev) => prev.slice(0, pos) + e.emoji + prev.slice(pos));
		caretPos.current = pos + e.emoji.length;
		inputRef.current.focus();
		setTimeout(() => {
			inputRef.current.setSelectionRange(caretPos.current, caretPos.current);
		}, 0); // it only works with setTimeout bruh
	};

	const handleSearchRef = useRef();
	handleSearchRef.current = async (searchTerm) => {
		if (searchTerm.startsWith("@")) {
			const data = await searchUsersAndHashtags(searchTerm.slice(1), "user", 12);
			setSearchResult([...data]);
		} else if (searchTerm.startsWith("#")) {
			const data = await searchUsersAndHashtags(searchTerm.slice(1), "hashtag", 12);
			setSearchResult([...data]);
		}
	};

	// search after stop inputting for 0.5s
	const handleSearch = useCallback(
		_.debounce((searchTerm) => handleSearchRef.current(searchTerm), 500),
		[]
	);

	useEffect(() => {
		// auto resize of textarea
		inputRef.current.style.height = "auto";
		inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;

		if (comment === "" && setRespondingComment) setRespondingComment({ username: "", _id: null });
	}, [comment]);

	useEffect(() => {
		if (respondingComment?._id && inPostContent) {
			setComment("@" + respondingComment.username + " ");
			setSearchResult([]);
			caretPos.current = respondingComment.username.length + 2;
			inputRef.current.focus();
		}
	}, [respondingComment]);

	const handleOnChange = (e) => {
		const newComment = e.target.value;
		setComment(newComment);

		// auto search hashtags/users if current typing word starts with #/@
		const index = inputRef.current.selectionStart;
		let startIndex = index;
		while (startIndex > 0 && !/\s/.test(newComment[startIndex - 1])) {
			startIndex--;
		}

		let endIndex = index;
		while (endIndex < newComment.length && !/\s/.test(newComment[endIndex])) {
			endIndex++;
		}

		const word = newComment.substring(startIndex, endIndex);

		if ((word.startsWith("#") || word.startsWith("@")) && word.length > 1) handleSearch(word);
	};

	const handleOnSelect = (selectedItem, prefix) => {
		const index = inputRef.current.selectionStart;
		let startIndex = index;
		while (startIndex > 0 && !/\s/.test(comment[startIndex - 1])) {
			startIndex--;
		}

		let endIndex = index;
		while (endIndex < comment.length && !/\s/.test(comment[endIndex])) {
			endIndex++;
		}
		caretPos.current = endIndex + selectedItem.length + 1;
		setComment((prev) => prev.slice(0, startIndex) + prefix + selectedItem + prev.slice(endIndex));
		setSearchResult([]);
		inputRef.current.focus();
	};

	const handleSubmit = requiredTokenApi(async () => {
		const { newComment } = await createComment(comment, postId, respondingComment?._id ?? null);
		if (!newComment.parentComment) {
			setComments((prev) => {
				return [...prev, newComment];
			});
		} else {
			setComments((prev) => {
				let temp = [...prev];
				for (let i = 0; i < temp.length; i++) {
					if (temp[i]._id === newComment.parentComment) {
						temp[i].childCommentCount++;
						temp[i].childComments = [...(temp[i].childComments ?? []), newComment];
						break;
					}
				}
				return [...temp];
			});
		}

		setComment("");
		setSearchResult([]);
	});

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				console.log("Wd");
				setIsShowingEmoji(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="flex w-full gap-x-2 items-center text-sm relative">
			{inPostContent && (
				<button onClick={() => setIsShowingEmoji((prev) => !prev)} className="relative" ref={emojiPickerRef}>
					<HiOutlineEmojiHappy size={26} />
					<div className="absolute -top-2 left-0 -translate-y-full select-none" onClick={(e) => e.stopPropagation()}>
						{isShowingEmoji && (
							<EmojiPicker
								onEmojiClick={onEmojiClick}
								autoFocusSearch={false}
								Theme={"auto"}
								lazyLoadEmojis={true}
								previewConfig={{
									showPreview: false,
								}}
							/>
						)}
					</div>
				</button>
			)}
			{searchResult.length > 0 && (
				<ul className={`absolute top-0 left-0 -translate-y-full bg-white min-w-[50%] max-w-full w-fit border divide-y max-h-[196px] overflow-auto`}>
					{searchResult.map((result) => {
						return (
							<>
								{result.type === "user" && (
									<li className="cursor-pointer" onClick={() => handleOnSelect(result.username, "@")}>
										<div className={`flex items-center space-x-2 px-2 py-1`}>
											<div className="relative rounded-full w-7 h-7">
												<Image alt="picture" src={result.picture} fill className="object-contain rounded-full" />
											</div>
											<div className="flex flex-col text-sm line-clamp-1">
												<p className="font-bold">{result.username}</p>
												<p className="text-gray-500">{result.nickname}</p>
											</div>
										</div>
									</li>
								)}
								{result.type === "hashtag" && (
									<li className="cursor-pointer" onClick={() => handleOnSelect(result.name, "#")}>
										<div className={`flex items-center space-x-2 px-2 py-1`}>
											<div className="flex items-center justify-center rounded-full overflow-hidden w-[44px] h-[44px] text-2xl font-bold border flex-shrink-0">
												#
											</div>
											<div className="flex flex-col text-sm line-clamp-1">
												<p className="font-bold">{"#" + result.name}</p>
												<p className="text-gray-500">{result.postCount + ` post${result.postCount > 1 ? "s" : ""}`}</p>
											</div>
										</div>
									</li>
								)}
							</>
						);
					})}
				</ul>
			)}
			<textarea
				ref={inputRef}
				value={comment}
				onClick={() => {
					caretPos.current = inputRef.current.selectionStart;
					setSearchResult([]);
				}}
				onInput={() => (caretPos.current = inputRef.current.selectionStart)}
				onChange={handleOnChange}
				placeholder="Comment..."
				className="outline-none w-full resize-none max-h-24"
				rows={1}
			/>
			{comment.length > 0 && (
				<button className="text-blue-500 hover:text-blue-800 active:text-blue-400" onClick={handleSubmit}>
					<strong>Send</strong>
				</button>
			)}

			{!inPostContent && (
				<div className="relative flex items-center">
					<button onClick={() => setIsShowingEmoji((prev) => !prev)} ref={emojiPickerRef}>
						<HiOutlineEmojiHappy />
						<div className="absolute -top-4 left-4 -translate-y-full select-none -translate-x-full lg:translate-x-0" onClick={(e) => e.stopPropagation()}>
							{isShowingEmoji && (
								<EmojiPicker
									onEmojiClick={onEmojiClick}
									autoFocusSearch={false}
									Theme={"auto"}
									lazyLoadEmojis={true}
									previewConfig={{
										showPreview: false,
									}}
								/>
							)}
						</div>
					</button>
				</div>
			)}
		</div>
	);
});

export default CommentInput;
