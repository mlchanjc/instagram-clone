// helper function to include content length in header

export default function ApiResponse(response, status) {
	const stringifiedResp = JSON.stringify(response);

	const contentLength = Buffer.byteLength(stringifiedResp, "utf-8");

	return new Response(stringifiedResp, {
		status: status ?? 200,
		headers: {
			"Content-Length": contentLength,
		},
	});
}
