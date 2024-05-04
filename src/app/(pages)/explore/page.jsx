"use client";
import { getExplorePosts } from "@/apis/posts";
import { useState, useEffect } from "react";
import PostCardGrid from "@/components/PostCardGrid";

const ExplorePage = () => {
	const [initPostData, setInitPostData] = useState(null);

	const fetchPosts = async (startIndex) => {
		const response = await getExplorePosts();
		if (!initPostData) setInitPostData(response.posts);
		return response.posts;
	};

	useEffect(() => {
		fetchPosts();
	}, []);

	return (
		<main className="flex items-center justify-center w-full h-full">
			<div className="flex items-center w-full lg:w-[935px] h-full lg:mx-10 md:mt-7">
				<PostCardGrid initData={initPostData} handleFetchMore={fetchPosts} />
			</div>
		</main>
	);
};

export default ExplorePage;
