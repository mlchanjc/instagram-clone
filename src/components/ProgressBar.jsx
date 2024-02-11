"use client";

let hasInited = false;

export const useProgress = () => {
	const initStyle = () => {
		const progressBar = document.getElementById("progress-bar");

		if (progressBar && !hasInited) {
			const styleSheet = document.styleSheets[0];

			const keyframes = `@keyframes changingColor {
                0% {
                    background-position: 0% 50%;
                }
                100% {
                    background-position: 100% 50%;
                }
            }`;

			styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

			progressBar.style.display = "none";
			progressBar.style.width = "0%";
			progressBar.style.background = "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)";
			progressBar.style.backgroundSize = "400% 400%";
			progressBar.style.animation = "changingColor 1s ease alternate infinite";

			hasInited = true;
		}
	};
	initStyle();

	const setProgress = (width) => {
		const progressBar = document.getElementById("progress-bar");

		if (progressBar) {
			progressBar.style.display = "block";
			progressBar.style.transition = "width 0.1s";
			progressBar.style.width = `${width * 100}vw`;

			if (width === 1) {
				setTimeout(() => {
					progressBar.style.display = "none";
					progressBar.style.width = "0%";
				}, 500);
			}
		}
	};

	return { setProgress };
};

export default function ProgressBar() {
	// for displaying fetching progress

	return <div id="progress-bar" className="fixed top-0 h-1 z-[69420]"></div>;
}
