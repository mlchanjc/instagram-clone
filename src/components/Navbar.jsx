"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { GoHome } from "react-icons/go";
import { GoHomeFill } from "react-icons/go";
import { IoSearchOutline } from "react-icons/io5";
import { IoSearchSharp } from "react-icons/io5";
import { IoCompassOutline, IoCompass } from "react-icons/io5";
import { FaInstagram } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import { useState, memo } from "react";
import CreatePost from "./EditPostModal";
import { CgAddR } from "react-icons/cg";
import { PiList, PiListBold } from "react-icons/pi";

const Navbar = memo(() => {
	const { data: session, status } = useSession();
	const [isSearching, setIsSearching] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [showMoreList, setShowMoreList] = useState(false);

	return (
		<nav className="sticky top-0 flex flex-col border-r h-screen p-6 3xl:w-[335px] xl:w-64 w-[76px] flex-shrink-0 select-none outline-none z-10 text-sm">
			{showModal && <CreatePost setShowModal={setShowModal} />}
			<div className={`h-full ${isSearching ? "w-[28px]" : "w-full"} duration-300 overflow-visible`}>
				<Link href={"/"}>
					<button className="w-[150px] h-[50px] relative">
						<Image
							src="/assets/logo.svg"
							fill
							className={`object-contain ${isSearching ? "opacity-0" : "xl:opacity-100 opacity-0"} duration-150`}
							alt="Logo"
							priority
						/>
						<FaInstagram className={` ${isSearching ? "scale-100" : "xl:scale-0 scale-100"} duration-300`} size={25} />
					</button>
				</Link>
				<div className="flex flex-col w-full gap-y-3 mt-8">
					<Link href={"/"}>
						<button className="group flex items-center gap-x-3 py-2 active:opacity-50 w-full">
							{usePathname() === "/" && !isSearching ? (
								<>
									<GoHomeFill size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
									<span className={`${isSearching ? "hidden" : "xl:inline hidden font-bold"}`}>Home</span>
								</>
							) : (
								<>
									<GoHome size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
									<span className={`${isSearching ? "hidden" : "xl:inline hidden"}`}>Home</span>
								</>
							)}
						</button>
					</Link>

					<button className="group flex items-center gap-x-3 py-2 active:opacity-50 w-full" onClick={() => setIsSearching((prev) => !prev)}>
						{isSearching ? (
							<>
								<IoSearchSharp size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
								<span className={`${isSearching ? "hidden" : "xl:inline hidden"}`}>Search</span>
							</>
						) : (
							<>
								<IoSearchOutline size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
								<span className={`${isSearching ? "hidden" : "xl:inline hidden"}`}>Search</span>
							</>
						)}
					</button>

					<Link href={"/explore"}>
						<button className="group flex items-center gap-x-3 py-2 active:opacity-50 w-full">
							{usePathname() === "/explore" && !isSearching ? (
								<>
									<IoCompass size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
									<span className={`${isSearching ? "hidden" : "xl:inline hidden font-bold"}`}>Explore</span>
								</>
							) : (
								<>
									<IoCompassOutline size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
									<span className={`${isSearching ? "hidden" : "xl:inline hidden"}`}>Explore</span>
								</>
							)}
						</button>
					</Link>

					<button className="group flex items-center gap-x-3 py-2 active:opacity-50 w-full" onClick={() => setShowModal(true)}>
						<CgAddR size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
						<span className={`${isSearching ? "hidden" : "xl:inline hidden"}`}>Create</span>
					</button>
					{session && (
						<Link href={`/${session?.user.username}`}>
							<button className="group flex items-center gap-x-3 py-2 active:opacity-50 w-full">
								<div className="relative w-7 h-7 rounded-full overflow-hidden group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0">
									<Image src={session?.user.picture} fill className="object-contain" alt="picture" sizes="10vw" />
								</div>
								<span className={`${isSearching ? "hidden" : "xl:inline hidden"}`}>Profile</span>
							</button>
						</Link>
					)}
				</div>
				<SearchBar isSearching={isSearching} setIsSearching={setIsSearching} />
			</div>
			<div className="relative">
				<button className="group flex items-center gap-x-3 py-2 active:opacity-50 w-full" onClick={() => setShowMoreList((prev) => !prev)}>
					{showMoreList ? (
						<>
							<PiListBold size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
							<span className={`${isSearching ? "hidden" : "xl:inline hidden font-bold"}`}>More</span>
						</>
					) : (
						<>
							<PiList size={28} className="group-hover:scale-105 group-active:scale-95 duration-100 flex-shrink-0" />
							<span className={`${isSearching ? "hidden" : "xl:inline hidden"}`}>More</span>
						</>
					)}
				</button>
				{showMoreList && (
					<div className="absolute bottom-12 w-full border rounded-md">
						<ul>
							<li>
								<button onClick={signOut} className="w-full p-4 text-left active:opacity-60">
									Log out
								</button>
							</li>
						</ul>
					</div>
				)}
			</div>
		</nav>
	);
});

export default Navbar;
