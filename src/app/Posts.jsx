"use client";
import { useState, useRef, useEffect } from "react";
import { getPosts } from "@/apis/posts";
import Post from "./Post";
import useCallApi from "@/hooks/useCallApi";

const Posts = () => {
	const callApi = useCallApi();
	const fetchedAll = useRef(false);
	const isFetching = useRef(false);
	const observerTarget = useRef(null);
	const currentPostCount = useRef(0);
	const [posts, setPosts] = useState([]);

	const handleFetch = async () => {
		if (!isFetching.current) {
			isFetching.current = true;
			const data = await callApi(getPosts(currentPostCount.current));
			if (data.length < 6) fetchedAll.current = true;
			currentPostCount.current += data.length;
			setPosts((prev) => (prev ? [...prev, ...data] : data));
			isFetching.current = false;
		}
	};

	useEffect(() => {
		handleFetch();

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					if (!fetchedAll.current) handleFetch();
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => {
			if (observerTarget.current) {
				observer.unobserve(observerTarget.current);
				observer.disconnect();
			}
		};
	}, []);

	return (
		<div className="flex flex-col items-center w-full sm:w-[470px]">
			{posts?.map((post) => {
				return <Post key={post._id} post={post} />;
			})}
			<div ref={observerTarget} className={`relative select-none ${!fetchedAll.current ? "block" : "hidden"}`}>
				<img src="/assets/loading.svg" width={100} height={100} />
			</div>
		</div>
	);
};

export default Posts;
