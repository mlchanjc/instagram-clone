"use client";

import { useState, useEffect } from "react";
import { followUser, getUserInfo } from "@/apis/users";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import FormattedText from "@/components/FormattedText";
import useRequiredTokenApi from "@/hooks/useRequiredTokenApi";
import PostArea from "./PostArea";
import useAsyncError from "@/hooks/useAsyncError";

const UserPage = () => {
	const requiredTokenApi = useRequiredTokenApi();
	const { username } = useParams();
	const [userData, setUserData] = useState(null);
	const throwError = useAsyncError();

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const data = await getUserInfo(username);
				setUserData(data);
			} catch (error) {
				throwError(error);
			}
		};

		fetchUserInfo();
	}, []);

	const handleFollow = requiredTokenApi(async () => {
		try {
			const { isFollowing } = await followUser(userData._id);
			setUserData((prev) => {
				return { ...prev, isFollowing, followerCount: prev.followerCount + (isFollowing ? 1 : -1) };
			});
		} catch (error) {
			throwError(error);
		}
	});

	return (
		userData && (
			<main className="w-full flex justify-center">
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
					<PostArea userData={userData} />
				</div>
			</main>
		)
	);
};

export default UserPage;
