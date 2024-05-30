"use client";

import { deleteUser, editUser, editUserVisibility, getUserInfo } from "@/apis/users";
import useAsyncError from "@/hooks/useAsyncError";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";

const EditAccountPage = () => {
	const { data: session, status, update } = useSession();
	const username = session?.user.username;
	const [userData, setUserData] = useState(null);
	const [newData, setNewData] = useState({ username: "", nickname: "", biography: "" });
	const throwError = useAsyncError();

	const fetchUserInfo = async () => {
		try {
			const data = await getUserInfo(username);
			setUserData(data);
			setNewData({ username: data.username, nickname: data.nickname, biography: data.biography });
		} catch (error) {
			throwError(error);
		}
	};

	useEffect(() => {
		if (username) fetchUserInfo(username);
	}, [session]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await editUser(newData);
			update();
			window.alert("User info updated");
		} catch (error) {
			throwError(error);
		}
	};

	const handleChangeVisibility = async (e) => {
		if (window.confirm(`Are you sure to change the visibility of your account to ${userData.isPrivate ? "public" : "private"}?`)) {
			try {
				await editUserVisibility(!userData.isPrivate);
				setUserData((prev) => ({ ...prev, isPrivate: !prev.isPrivate }));
				window.alert("Visibility updated");
			} catch (error) {
				throwError(error);
			}
		}
	};

	const handleDeleteAccount = async (e) => {
		if (window.confirm("Are you sure to delete your account?")) {
			try {
				await deleteUser();
				await signOut();
			} catch (error) {
				throwError(error);
			}
		}
	};

	return (
		<div className="w-full flex justify-center">
			{userData && (
				<div className="flex flex-col lg:w-[975px] px-5 gap-y-8">
					<header className="mt-8">
						<strong className="text-xl">Edit account</strong>
					</header>
					<section className="flex items-center gap-x-4 p-4">
						<Image src={userData.picture} width={56} height={56} className="rounded-full" />
						<div className="flex flex-col">
							<strong>{userData.username}</strong>
							<span className="text-sm text-gray-500">{userData.nickname}</span>
						</div>
					</section>
					<form className="flex flex-col gap-y-5" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-y-2">
							<strong>Username</strong>
							<input
								maxLength={16}
								className="border rounded-lg px-4 py-2"
								value={newData.username}
								onChange={(e) => {
									const newUsername = e.target.value;
									const pattern = /^[a-z0-9_]+$/;
									if (pattern.test(newUsername) || newUsername === "") {
										setNewData((prev) => ({ ...prev, username: newUsername }));
									}
								}}
							/>
						</div>
						<div className="flex flex-col gap-y-2">
							<strong>Nickname</strong>
							<input
								maxLength={30}
								className="border rounded-lg px-4 py-2"
								value={newData.nickname}
								onChange={(e) => {
									const newNickname = e.target.value;
									setNewData((prev) => ({ ...prev, nickname: newNickname }));
								}}
							/>
						</div>
						<div className="flex flex-col gap-y-2 relative">
							<strong>Biography</strong>
							<textarea
								maxLength={150}
								className="border rounded-lg px-4 py-2 resize-none h-36 w-full"
								value={newData.biography}
								onChange={(e) => {
									const newBiography = e.target.value;
									setNewData((prev) => ({ ...prev, biography: newBiography }));
								}}
							/>
							<span className="absolute bottom-3 right-4 text-gray-400 text-xs">{`${newData.biography.length}/150`}</span>
						</div>
						<div className="flex items-center justify-end">
							<button className="w-1/3 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 rounded-lg py-3 text-white">
								<strong>Submit</strong>
							</button>
						</div>
					</form>
					<div className="flex flex-col border border-red-500 rounded-lg p-8 gap-y-4 w-full lg:w-2/3 text-sm md:text-base">
						<div className="flex items-center justify-between gap-x-2">
							<strong>{`Change the visibility of your account to ${userData.isPrivate ? "public" : "private"}`}</strong>
							<button className="text-sm text-white bg-red-500 hover:bg-red-600 active:bg-red-400 py-2 px-4 rounded-md" onClick={handleChangeVisibility}>
								<strong>Change</strong>
							</button>
						</div>
						<div className="flex items-center justify-between gap-x-2">
							<strong>Delete your account permanently</strong>
							<button className="text-sm text-white bg-red-500 hover:bg-red-600 active:bg-red-400 py-2 px-4 rounded-md" onClick={handleDeleteAccount}>
								<strong>Delete</strong>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EditAccountPage;
