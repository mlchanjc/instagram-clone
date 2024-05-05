import { memo } from "react";
import Link from "next/link";

const FormattedText = memo(({ text }) => {
	if (!text) return;
	if (text.length === 1) return <span className="whitespace-pre-wrap break-words">{text}</span>;
	const elements = [];
	let startIndex = 0;

	const originalLen = text.length;

	text = text.trim();

	const len = text.length;

	// require trimmed text
	for (let i = 0; i < len; i++) {
		if (i < startIndex) continue;
		if (text[i] === "#") {
			for (let j = i + 1; j < len; j++) {
				if (["#", " ", "\n"].includes(text[j]) || j === len - 1) {
					if (startIndex !== i) elements.push(<span key={`text${elements.length}`}>{text.slice(startIndex, i)}</span>);

					const hashtag = text.slice(i, j === len - 1 ? (text[j] !== "#" ? undefined : j) : j);
					const hashtagContent = text.slice(i + 1, j === len - 1 ? (text[j] !== "#" ? undefined : j) : j);

					if (/^[\p{L}\p{N}_\p{Emoji}!?\*]+$/u.test(hashtagContent)) {
						elements.push(
							<Link key={`text${elements.length}`} className="text-blue-700 cursor-pointer" href={`/explore/tags/${hashtagContent}`}>
								{hashtag}
							</Link>
						);
					} else {
						elements.push(<span key={`text${elements.length}`}>{hashtag}</span>);
					}
					startIndex = j;
					if (j === len - 1 && text[j] === "#") elements.push(<span key={`text${elements.length}`}>#</span>);
					break;
				}
			}
		} else if (text[i] === "@") {
			for (let j = i + 1; j < len; j++) {
				if ([" ", "\n"].includes(text[j]) || j === len - 1) {
					if (startIndex !== i) elements.push(<span key={`text${elements.length}`}>{text.slice(startIndex, i)}</span>);

					const taggedUser = text.slice(i, j === len - 1 ? undefined : j);
					const taggedUserContent = text.slice(i + 1, j === len - 1 ? undefined : j);

					if (/^[\w.]+$/.test(taggedUserContent)) {
						elements.push(
							<Link key={`text${elements.length}`} className="text-blue-700 cursor-pointer" href={`/${taggedUserContent}`}>
								{taggedUser}
							</Link>
						);
					} else {
						elements.push(<span key={`text${elements.length}`}>{taggedUser}</span>);
					}
					startIndex = j;
					break;
				} else if (text[j] === "#" || j === len - 1) {
					if (startIndex !== i) elements.push(<span key={`text${elements.length}`}>{text.slice(startIndex, i)}</span>);

					const word = text.slice(i, j === len - 1 ? undefined : j);

					elements.push(<span key={`text${elements.length}`}>{word}</span>);

					startIndex = j;
					break;
				}
			}
		}
	}

	if (startIndex < len - 1) elements.push(<span key={`text${elements.length}`}>{text.slice(startIndex)}</span>);

	elements.push(<span key={`text${elements.length}`}>{" ".repeat(originalLen - len)}</span>);

	return <span className="whitespace-pre-wrap break-words">{elements}</span>;
});

export default FormattedText;
