"use client";

import PostContent from "@/components/PostContent";

const PostPage = ({ params }) => {
	const postId = params.postId;

	return (
		<main className="flex justify-center w-full">
			<div className="flex flex-col justify-center items-center px-5 w-full">
				<PostContent postId={postId} deletePostEffect={() => (window.location.href = "/")} />
			</div>
		</main>
	);
};

export default PostPage;
