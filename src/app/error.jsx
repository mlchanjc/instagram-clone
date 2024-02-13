"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
	return (
		<div className="w-full h-screen flex flex-col gap-y-6 items-center justify-center">
			<strong className="text-4xl">{error.message}</strong>
			<Link href="/" className="hover:scale-105 duration-200 text-gray-500">
				Return Home
			</Link>
		</div>
	);
}
