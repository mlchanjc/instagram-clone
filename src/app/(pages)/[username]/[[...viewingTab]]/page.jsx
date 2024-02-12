"use client";

import { useState, useEffect } from "react";
import { followUser, getUserPost, getUserInfo } from "@/apis/users";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { BsGrid3X3 } from "react-icons/bs";
import { HiOutlineBookmark } from "react-icons/hi2";
import { PiUserSquareLight } from "react-icons/pi";
import PostCardGrid from "@/components/PostCardGrid";
import FormattedText from "@/components/FormattedText";
import useCallApi from "@/hooks/useCallApi";
import { CiCamera, CiLock } from "react-icons/ci";
import CreatePost from "@/components/EditPostModal";

const UserPage = () => {
	const router = useRouter();
	const { username } = useParams();
	const [userData, setUserData] = useState(null);
	const [initPostData, setInitPostData] = useState(null);
	const [viewingTab, setViewingTab] = useState(useParams().viewingTab?.[0] ?? "posts"); // posts / saved / tagged
	const [showModal, setShowModal] = useState(false);
	const callApi = useCallApi();

	const fetchData = async (startIndex, init) => {
		let postType;
		if (viewingTab === "posts") {
			postType = "posts";
		} else if (viewingTab === "saved") {
			postType = "savedPosts";
		} else if (viewingTab === "tagged") {
			postType = "taggedPosts";
		}

		const data = await callApi(getUserPost(username, postType, startIndex));
		if (init) setInitPostData(data);
		return data;
	};

	const fetchUserInfo = async () => {
		const data = await callApi(getUserInfo(username));
		if (!data.isOwner && viewingTab === "saved") router.push(`/${username}`);
		setUserData(data);
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
		if (!userData) fetchUserInfo();
	}, [viewingTab]);

	const handleFollow = async () => {
		const { isFollowing } = await callApi(followUser(userData._id));
		setUserData((prev) => {
			return { ...prev, isFollowing, followerCount: prev.followerCount + (isFollowing ? 1 : -1) };
		});
		if (isFollowing && userData.isPrivate && !userData.isOwner && initPostData.length === 0) {
			fetchData(0, true);
		}
	};

	return (
		userData && (
			<main className="w-full flex justify-center">
				{showModal && <CreatePost setShowTopModal={setShowModal} />}
				<div className="flex flex-col w-full lg:w-[975px] md:px-5">
					<div className="flex min-h-fit my-4 md:my-10">
						<div className="flex items-center px-6 md:px-20 h-full mr-4">
							<div className="flex-shrink-0 aspect-square relative w-[80px] h-[80px] md:w-[150px] md:h-[150px]">
								<Image alt="picture" src={userData.picture} className="object-contain rounded-full" fill sizes="50vw" />
							</div>
						</div>
						<div className="flex flex-col gap-y-3">
							<div className="flex items-center mb-1 gap-x-8">
								<p className="text-lg">{userData.username}</p>
								{userData.isOwner ? (
									<Link href={"/accounts/edit"}>
										<button className={`px-4 py-1.5 rounded-lg font-bold text-sm active:opacity-70 select-none bg-blue-500 text-white hover:bg-blue-600`}>
											Edit profile
										</button>
									</Link>
								) : (
									<button
										onClick={handleFollow}
										className={`px-4 py-1.5 rounded-lg font-bold text-sm active:opacity-70 select-none ${
											userData.isFollowing ? "bg-stone-200 hover:bg-stone-300" : "bg-blue-500 text-white hover:bg-blue-600"
										}`}
									>
										{userData.isFollowing ? "Following" : "Follow"}
									</button>
								)}
							</div>
							<div className="flex gap-x-1 md:space-x-10 my-1 text-sm md:text-base">
								<strong>{userData.postCount}</strong> {`post${userData.postCount > 1 ? "s" : ""}`}
								<strong>{userData.followerCount}</strong> {`follower${userData.followerCount > 1 ? "s" : ""}`}
								<strong>{userData.followingCount}</strong> {"following"}
							</div>
							<div className="hidden md:block text-sm">
								<p className="text-sm font-bold">{userData.nickname}</p>
								<FormattedText text={userData.biography} textSize={"sm"} />
							</div>
						</div>
					</div>
					<div className="block md:hidden px-8 mb-4 text-sm">
						<p className="text-sm font-bold">{userData.nickname}</p>
						<FormattedText text={userData.biography} />
					</div>
					<div className="border-t flex flex-col items-center h-full">
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
				</div>
			</main>
		)
	);
};

export default UserPage;
