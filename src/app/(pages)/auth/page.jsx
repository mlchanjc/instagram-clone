"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

const page = () => {
	const { data: session, status } = useSession();

	if (status === "authenticated") {
		window.location.href = "/";
	}

	return (
		<div className="w-screen h-screen flex justify-center items-center select-none">
			<div className="flex flex-col items-center justify-center w-[500px] h-[700px] rounded-sm border">
				<div className="w-full h-1/2">
					<div className="relative w-full mt-8 h-[50px]">
						<Image src="/assets/logo.svg" fill className="object-contain duration-150" alt="Logo" priority sizes="80vw" />
					</div>
				</div>
				<div className="h-1/2">
					<button onClick={() => signIn(null, { callbackUrl: "/", redirect: true })} className="flex items-center rounded-sm bg-blue-500 text-white w-64">
						<div className="p-3 bg-white m-0.5">
							<FcGoogle size={20} />
						</div>
						<strong className="flex-grow">Sign in with Google</strong>
					</button>
				</div>
			</div>
		</div>
	);
};

export default page;
