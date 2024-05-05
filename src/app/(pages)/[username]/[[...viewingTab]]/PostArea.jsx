"use client";

import { useState, useEffect } from "react";
import { getUserPost } from "@/apis/users";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { BsGrid3X3 } from "react-icons/bs";
import { HiOutlineBookmark } from "react-icons/hi2";
import { PiUserSquareLight } from "react-icons/pi";
import PostCardGrid from "@/components/PostCardGrid";
import { CiCamera, CiLock } from "react-icons/ci";
import CreatePost from "@/components/PostModal";

const PostArea = ({ userData }) => {
	const router = useRouter();
	const { username } = useParams();
	const [viewingTab, setViewingTab] = useState(useParams().viewingTab?.[0] ?? "posts"); // posts / saved / tagged
	const [initPostData, setInitPostData] = useState(null);
	const [showModal, setShowModal] = useState(false);

	if (!userData?.isOwner && viewingTab === "saved") router.push(`/${username}`);

	const fetchData = async (startIndex, init) => {
		let postType;
		if (viewingTab === "posts") {
			postType = "posts";
		} else if (viewingTab === "saved") {
			postType = "savedPosts";
		} else if (viewingTab === "tagged") {
			postType = "taggedPosts";
		}

		const data = await getUserPost(username, postType, startIndex);
		if (init) setInitPostData(data);
		return data;
	};

	useEffect(() => {
		setInitPostData(null);
		if (viewingTab === "posts") {
			window.history.replaceState("", "", `/${username}`);
			fetchData(0, true);
		} else if (viewingTab === "saved") {
			window.history.replaceState("", "", `/${username}/saved`);
			fetchData(0, true);
		} else if (viewingTab === "tagged") {
			window.history.replaceState("", "", `/${username}/tagged`);
			fetchData(0, true);
		} else router.push(`/${username}`);
	}, [viewingTab]);

	useEffect(() => {
		// fetch posts if followed a private account
		if (userData.isFollowing && userData.isPrivate && !userData.isOwner) {
			fetchData(0, true);
		}
	}, [userData]);

	return (
		<div className="border-t flex flex-col items-center h-full">
			{showModal && <CreatePost setShowModal={setShowModal} />}
			<div className="flex gap-x-14 text-xs text-gray-500 h-12">
				<Link href={`/${username}`}>
					<button
						className={`${viewingTab === "posts" && " border-black text-black"} border-t -translate-y-px h-full flex items-center gap-x-2`}
						onClick={(e) => {
							e.preventDefault();
							setViewingTab("posts");
						}}
					>
						<BsGrid3X3 size={10} />
						{viewingTab === "posts" ? <strong>POSTS</strong> : "POSTS"}
					</button>
				</Link>
				{userData.isOwner && (
					<Link href={`/${username}/saved`}>
						<button
							className={`${viewingTab === "saved" && " border-black text-black"} border-t -translate-y-px h-full flex items-center gap-x-2`}
							onClick={(e) => {
								e.preventDefault();
								setViewingTab("saved");
							}}
						>
							<HiOutlineBookmark size={14} />
							{viewingTab === "saved" ? <strong>SAVED</strong> : "SAVED"}
						</button>
					</Link>
				)}

				<Link href={`/${username}/tagged`}>
					<button
						className={`${viewingTab === "tagged" && " border-black text-black"} border-t -translate-y-px h-full flex items-center gap-x-2`}
						onClick={(e) => {
							e.preventDefault();
							setViewingTab("tagged");
						}}
					>
						<PiUserSquareLight size={14} />
						{viewingTab === "tagged" ? <strong>TAGGED</strong> : "TAGGED"}
					</button>
				</Link>
			</div>
			<PostCardGrid initData={initPostData} handleFetchMore={fetchData} />
			{initPostData?.length === 0 && (
				<div className="flex flex-col justify-center items-center w-full h-full gap-y-4">
					{!userData.isOwner && !userData.isFollowing && userData.isPrivate ? (
						<>
							<div className="border rounded-full p-4">
								<CiLock size={36} />
							</div>
							<strong className="text-2xl">This account is private</strong>
						</>
					) : (
						<>
							<div className="border rounded-full p-4">
								<CiCamera size={36} />
							</div>
							<strong className="text-2xl">No posts</strong>
							{userData.isOwner && viewingTab === "posts" && (
								<button className="text-blue-500 text-sm" onClick={() => setShowModal(true)}>
									<strong>Create your first post</strong>
								</button>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default PostArea;
