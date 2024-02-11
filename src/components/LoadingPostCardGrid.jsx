import React from "react";

const LoadingPostCardGrid = () => {
	return (
		<div className="w-full grid grid-flow-row grid-cols-3 gap-1">
			{Array.from({ length: 9 }).map((_, i) => {
				return <div key={`LoadingPostCard${i}`} className="relative w-full h-full aspect-square animate-pulse bg-gray-300"></div>;
			})}
		</div>
	);
};

export default LoadingPostCardGrid;
