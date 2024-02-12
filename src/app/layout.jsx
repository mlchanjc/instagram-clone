"use client";

import ProgressBar from "@/components/ProgressBar";
import Navbar from "@/components/Navbar";
import Provider from "@/components/Providers";
import "./globals.css";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
	const pathname = usePathname();

	return (
		<html lang="en">
			<body>
				<Provider>
					<div className="flex flex-col md:flex-row w-full h-fit mb-16 md:mb-0">
						{pathname !== "/auth" && (
							<>
								<ProgressBar />
								<Navbar />
							</>
						)}
						{children}
					</div>
				</Provider>
			</body>
		</html>
	);
}
