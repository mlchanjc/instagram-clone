import { useState, useRef, memo, useContext, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import EmojiPicker from "emoji-picker-react";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import TagList from "./TagList";
import { PostContext } from "../../contexts/PostInfoContexts";
import AdvancedSettings from "./AdvancedSettings";
import FormattedText from "../FormattedText";

const DescriptionText = memo(({ description }) => {
	if (description === "") {
		return <span className="text-gray-400">Type your thoughts...</span>;
	}

	return <FormattedText text={description} />;
});

const EditPostInfo = memo(() => {
	const { data: session } = useSession();
	const div1Ref = useRef(null); //hidden div, for inputting text
	const div2Ref = useRef(null); //div for displaying
	const emojiButtonRef = useRef(null);
	const caretPos = useRef(0);
	const { description, setDescription } = useContext(PostContext);
	const [isShowingEmoji, setIsShowingEmoji] = useState(false);

	// ensure same scroll position
	const handleScroll = (e) => {
		const { scrollTop } = e.target;
		div2Ref.current.scrollTop = scrollTop;
	};

	const handleSetCaretPos = () => {
		let caretPosition = 0;

		const textarea = div1Ref.current;
		if (textarea.selectionStart || textarea.selectionStart === 0) {
			caretPosition = textarea.selectionStart;
		}
		caretPos.current = caretPosition;
	};

	const handleChange = (e) => {
		setDescription(e.target.value);
		handleSetCaretPos();
	};

	const onEmojiClick = (e) => {
		const textarea = div1Ref.current;
		const pos = caretPos.current;

		const currentValue = textarea.value;
		const newValue = currentValue.slice(0, pos) + e.emoji + currentValue.slice(pos);

		textarea.value = newValue;
		setDescription(newValue);
		caretPos.current = pos + e.emoji.length;

		// Auto focus back on textarea
		textarea.focus();
		textarea.setSelectionRange(caretPos.current, caretPos.current);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (emojiButtonRef.current) {
				if (!emojiButtonRef.current.contains(event.target)) {
					setIsShowingEmoji(false);
				}
			}
		};

		const handleResize = (event) => {
			setIsShowingEmoji(false);
		};

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("resize", handleResize);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className="border-l flex flex-col xl:w-[340px] lg:w-[235px] w-full h-full duration-300">
			<div className="flex flex-col h-1/2 py-2 border-b">
				<div className="flex h-12 p-3 space-x-3 items-center border-t lg:border-0">
					<div className="relative w-7 h-7">
						<Image src={session.user.picture} alt={`picture`} className="object-contain rounded-full" fill />
					</div>
					<p className="text-sm font-semibold">{session.user.username}</p>
				</div>
				<div className="h-full outline-none p-3 overflow-auto relative text-blue">
					<textarea
						maxLength={2200}
						ref={div1Ref}
						value={description}
						onChange={handleChange}
						onClick={handleSetCaretPos}
						onScroll={handleScroll}
						className="absolute inset-0 outline-none p-3 overflow-auto text-transparent caret-black z-10 whitespace-pre-wrap text-sm bg-transparent resize-none"
					></textarea>
					<div ref={div2Ref} className="absolute inset-0 outline-none p-3 overflow-auto opacity-100 whitespace-pre-wrap break-words select-none text-sm">
						<DescriptionText description={description} />
					</div>
				</div>
				<div className="p-3 flex justify-between items-center">
					<div className="flex items-center" ref={emojiButtonRef}>
						<button className="outline-none" onClick={() => setIsShowingEmoji((prev) => !prev)}>
							<HiOutlineEmojiHappy size={20} color="gray" />
						</button>
						{isShowingEmoji && (
							<div className="fixed select-none" style={{ top: `${emojiButtonRef.current?.getBoundingClientRect().top + 20}px` }}>
								<EmojiPicker
									onEmojiClick={onEmojiClick}
									autoFocusSearch={false}
									Theme={"auto"}
									lazyLoadEmojis={true}
									previewConfig={{
										showPreview: false,
									}}
								/>
							</div>
						)}
					</div>
					<div className="text-gray-400 text-xs">{description.length + "/2200"}</div>
				</div>
			</div>
			<div className="flex flex-col h-1/2 overflow-auto">
				<TagList />
				<AdvancedSettings />
			</div>
		</div>
	);
});

export default EditPostInfo;
