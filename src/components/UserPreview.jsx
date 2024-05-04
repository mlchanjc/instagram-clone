import { followUser, getUserPreview } from "@/apis/users";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback, memo } from "react";
import _ from "lodash";
import { CiCamera, CiLock } from "react-icons/ci";
import useRequiredTokenApi from "@/hooks/useRequiredTokenApi";

const UserPreview = memo(({ username }) => {
	const requiredTokenApi = useRequiredTokenApi();
	const isFetching = useRef(false);
	const buttonRef = useRef(null);
	const userPreviewRef = useRef(null);
	const [data, setData] = useState(null);
	const [isHovering, setIsHovering] = useState(false);

	const handleOnMouseLeaveRef = useRef();
	handleOnMouseLeaveRef.current = async () => {
		if (!userPreviewRef.current?.matches(":hover") && !buttonRef.current?.matches(":hover")) setIsHovering(false);
	};

	const handleOnMouseLeave = useCallback(
		_.debounce(() => handleOnMouseLeaveRef.current(), 100),
		[]
	);

	const handleOnMouseHover = () => {
		setTimeout(async () => {
			if (userPreviewRef.current?.matches(":hover") || buttonRef.current?.matches(":hover")) {
				setIsHovering(true);
				if (!isFetching.current && !data) {
					isFetching.current = true;
					const data = await getUserPreview(username);
					setData(data);
				}
			}
		}, 300);
	};

	const handleFollow = requiredTokenApi(async () => {
		const { isFollowing } = await followUser(data.user._id);
		setData((prev) => {
			return { ...prev, user: { ...prev.user, isFollowing, followerCount: prev.user.followerCount + (isFollowing ? 1 : -1) } };
		});
	});

	return (
		<span>
			<Link href={`/${username}`}>
				<button className="font-bold" onMouseOver={handleOnMouseHover} onMouseLeave={handleOnMouseLeave} ref={buttonRef}>
					{username}
				</button>
			</Link>

			<div
				className={`fixed flex flex-col bg-white w-80 shadow-[0px_3px_10px_0px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden z-10 duration-300 transition-opacity ${
					data && isHovering ? "opacity-100" : "h-0 opacity-0"
				}`}
				style={{
					translate: `${userPreviewRef?.current?.getBoundingClientRect().top < window.innerHeight / 2 ? "0% 10%" : "0% -105%"}`,
					top: `${buttonRef?.current?.getBoundingClientRect().top}px`,
				}}
				ref={userPreviewRef}
				onMouseOver={handleOnMouseHover}
				onMouseLeave={handleOnMouseLeave}
			>
				<div className="flex w-full px-4 pt-4 items-center">
					{data?.user.picture && (
						<div className="relative rounded-full overflow-hidden w-fit h-fit flex-shrink-0">
							<Image src={data.user.picture} width={44} height={44} alt="picture" />
						</div>
					)}

					<div className="flex flex-col flex-shrink-0 text-sm items-start ml-4">
						<Link href={`/${username}`}>
							<p className="font-bold">{data?.user.username}</p>
						</Link>
						<p className="text-gray-500">{data?.user.nickname}</p>
					</div>
				</div>
				<div className="w-full grid grid-flow-row grid-cols-3 gap-1 select-none p-4">
					<div className="flex flex-col items-center">
						<p className="font-bold">{data?.user.postCount}</p>
						<p className="text-gray-600 font-normal">{`post${data?.user.postCount > 1 ? "s" : ""}`}</p>
					</div>
					<div className="flex flex-col items-center">
						<p className="font-bold">{data?.user.followerCount}</p>
						<p className="text-gray-600 font-normal">{`follower${data?.user.followerCount > 1 ? "s" : ""}`}</p>
					</div>
					<div className="flex flex-col items-center">
						<p className="font-bold">{data?.user.followingCount}</p>
						<p className="text-gray-600 font-normal">{"following"}</p>
					</div>
				</div>

				{data?.posts.length > 0 && (
					<div className="w-full grid grid-flow-row grid-cols-3 gap-1 select-none">
						{data?.posts.map((post, i) => {
							return (
								<Link href={`/p/${post._id}`} key={`PreviewCard${i}`}>
									<div className="relative w-full h-full aspect-square group">
										<Image alt="PostCard" src={post.photos[0].photo} className="object-cover" fill sizes="30vw" priority />
									</div>
								</Link>
							);
						})}
					</div>
				)}

				{data?.posts.length === 0 && (
					<div className="w-full flex flex-col items-center justify-center">
						{data?.user.isPrivate ? (
							<>
								<div className="p-2 border border-black rounded-full">
									<CiLock size={30} />
								</div>
								<p>This account is private</p>
							</>
						) : (
							<>
								<div className="p-2 border border-black rounded-full">
									<CiCamera size={30} />
								</div>
								<p>No post</p>
							</>
						)}
					</div>
				)}
				<div className="w-full p-4">
					{data?.user.isFollowing && (
						<button className="w-full bg-stone-200 hover:bg-stone-300 rounded-lg p-2" onClick={handleFollow}>
							Following
						</button>
					)}
					{!data?.user.isFollowing && !data?.user.isOwner && (
						<button className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-lg p-2" onClick={handleFollow}>
							Follow
						</button>
					)}
				</div>
			</div>
		</span>
	);
});

export default UserPreview;
