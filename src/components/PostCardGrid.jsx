import { useEffect, useState, useRef, memo } from "react";
import PostCard from "@/components/PostCard";
import BottomModal from "@/components/BottomModal";
import PostContent from "@/components/PostContent";
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
import LoadingPostCardGrid from "@/components/LoadingPostCardGrid";
import { usePathname } from "next/navigation";

//handleFetchMore(startIndex) return array of posts
const PostCardGrid = memo(({ initData, handleFetchMore }) => {
	const originalUrl = useRef(usePathname());
	const fetchedAll = useRef(false);
	const currentPostCount = useRef(0);
	const isFetching = useRef(false);
	const observerTarget = useRef(null);
	const [postData, setPostData] = useState(null);
	const [currentPost, setCurrentPost] = useState(0);
	const [showPostModal, setShowPostModal] = useState(false);

	const handleFetch = async () => {
		if (currentPostCount.current !== undefined && !isFetching.current) {
			isFetching.current = true;
			const data = await handleFetchMore(currentPostCount.current);
			if (data.length < 12) fetchedAll.current = true;
			currentPostCount.current += data.length;
			setPostData((prev) => (prev ? [...prev, ...data] : data));
			isFetching.current = false;
		}
	};

	const deletePostEffect = () => {
		setShowPostModal(false);
		setPostData((prev) => {
			let temp = [...prev];
			temp.splice(currentPost, 1);
			return temp;
		});
	};

	useEffect(() => {
		// change url when click in or exit post
		if (showPostModal) window.history.replaceState("", "", `/p/${postData[currentPost]._id}`);
		else window.history.replaceState("", "", `${originalUrl.current}`);

		// fetch more posts when viewing the second last posts
		if (!fetchedAll.current && currentPost + 2 > postData?.length) {
			handleFetch();
		}
	}, [showPostModal, currentPost]);

	useEffect(() => {
		setPostData(initData);
		currentPostCount.current = initData?.length ?? undefined;
		if (initData?.length < 12) fetchedAll.current = true;
		else fetchedAll.current = false;

		// observe the loading svg, fetch posts if enter screen
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
	}, [initData]);

	return (
		<div className="flex flex-col w-full h-fit items-center">
			{!postData ? (
				<LoadingPostCardGrid />
			) : (
				<>
					{showPostModal && (
						<BottomModal onClick={() => setShowPostModal(false)}>
							{postData.length > 1 && currentPost > 0 && (
								<button
									className="fixed left-3 rounded-full bg-white p-2"
									onClick={(e) => {
										e.stopPropagation();
										setCurrentPost((prev) => prev - 1);
									}}
								>
									<MdOutlineArrowBackIos />
								</button>
							)}
							<PostContent post={postData[currentPost]} postId={postData[currentPost]._id} deletePostEffect={deletePostEffect} />
							{postData.length > 1 && currentPost < postData.length - 1 && (
								<button
									className="fixed right-3 rounded-full bg-white p-2"
									onClick={(e) => {
										e.stopPropagation();
										setCurrentPost((prev) => prev + 1);
									}}
								>
									<MdOutlineArrowForwardIos />
								</button>
							)}
						</BottomModal>
					)}
					<div className="w-full grid grid-flow-row grid-cols-3 gap-1 select-none">
						{postData.map((post, i) => {
							return <PostCard key={`PostCard-${post._id}`} post={post} index={i} setCurrentPost={setCurrentPost} setShowPostModal={setShowPostModal} />;
						})}
					</div>
				</>
			)}
			<div ref={observerTarget} className={`relative select-none ${!fetchedAll.current ? "block" : "hidden"}`}>
				<img src="/assets/loading.svg" width={100} height={100} />
			</div>
		</div>
	);
});

export default PostCardGrid;
