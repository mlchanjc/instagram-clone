import Posts from "./Posts";

export default function MainPage() {
	return (
		<main className="flex items-center justify-center space-x-6 w-full h-full">
			<section className="flex flex-col items-center w-full md:w-[630px] h-full">
				<Posts />
			</section>
			<section className="hidden lg:flex md:w-[319px] pl-16"></section>
		</main>
	);
}
