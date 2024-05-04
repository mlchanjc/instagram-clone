"use client";
import { getPostsByHashtag } from "@/apis/posts";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PostCardGrid from "@/components/PostCardGrid";

const HashtagPage = () => {
	const { hashtag } = useParams();
	const [data, setData] = useState(null);

	const fetchPosts = async (startIndex) => {
		const response = await getPostsByHashtag(hashtag, startIndex);

		if (!data) setData(response);
		return response.posts;
	};

	useEffect(() => {
		fetchPosts(0);
	}, []);

	return (
		data && (
			<main className="flex items-center justify-center w-full h-full">
				{data?.posts.length > 0 ? (
					<div className="flex flex-col items-center w-full lg:w-[935px] h-full md:mx-10">
						<header className="flex w-full h-[70px] md:h-[152px] m-4 md:m-8 px-4 md:px-0">
							<div className="relative h-full w-auto aspect-square">
								<Image alt="HashtagPreview" src={data.posts?.[0].photos[0].photo} className="object-cover rounded-full" fill />
							</div>
							<div className="flex flex-col flex-grow ml-12">
								<p className="font-bold md:text-2xl">{`#${hashtag}`}</p>
								<p className="font-bold text-xs md:text-sm">{`${data.postCount} post${data.postCount > 1 ? "s" : ""}`}</p>
							</div>
						</header>
						<PostCardGrid initData={data.posts} handleFetchMore={fetchPosts} />
					</div>
				) : (
					<div className="flex flex-col items-center w-full lg:w-[935px] h-full md:mx-10">
						<header className="flex w-full h-[152px] m-8">
							<div className="relative h-full w-auto aspect-square bg-gray-300 rounded-full"></div>
							<div className="flex flex-col flex-grow ml-12">
								<p className="font-bold md:text-2xl">{`#${hashtag}`}</p>
							</div>
						</header>
						<div className="text-xl">
							There are no public posts with the hashtag <strong>{hashtag}</strong>
						</div>
					</div>
				)}
			</main>
		)
	);
};

export default HashtagPage;
