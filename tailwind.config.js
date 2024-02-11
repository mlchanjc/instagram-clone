/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			screens: {
				"2xl": "1440px",
				"3xl": "1780px",
			},
			animation: {
				slideIn: "slideIn 0.3s forwards",
				slideOut: "slideOut 0.3s forwards",
				heart: "heart 0.3s forwards",
				bigHeart: "bigHeart 0.9s forwards",
				tagBubble: "tagBubble 0.3s forwards",
				zoomOut: "zoomOut 0.1s forwards",
			},
			keyframes: {
				slideIn: {
					"0%": { transform: "translateY(20px)", opacity: 0 },
					"100%": { transform: "translateY(0px)", opacity: 1 },
				},
				slideOut: {
					"0%": { opacity: 1 },
					"100%": { transform: "translateY(20px)", display: "none", opacity: 0 },
				},
				heart: {
					"0%": { transform: "scale(0.8)" },
					"50%": { transform: "scale(1.2)" },
					"100%": { transform: "scale(1)" },
				},
				bigHeart: {
					"0%": { transform: "rotate(45deg) scale(0)", opacity: 0 },
					"40%": { transform: "rotate(-15deg) scale(1.2)", opacity: 0.9 },
					"70%": { transform: "rotate(0deg) scale(1)", opacity: 1 },
					"100%": { transform: "translateY(-250px)", opacity: 0 },
				},
				tagBubble: {
					"0%": { transform: "scale(0)" },
					"100%": { transform: "scale(1)" },
				},
				zoomOut: {
					"0%": { transform: "scale(1.2)" },
					"100%": { transform: "scale(1)" },
				},
			},
		},
	},
	plugins: [],
};
