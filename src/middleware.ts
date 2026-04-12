import { defineMiddleware } from "astro:middleware";

// The S3 host we need to allow in CSP (e.g. s3.codeandcafe.com)
const S3_HOST = process.env.S3_ENDPOINT
	? new URL(process.env.S3_ENDPOINT).host
	: null;

export const onRequest = defineMiddleware(async (context, next) => {
	// Let EmDash (and all other handlers) process the request first
	const response = await next();

	// Only patch when S3 is configured in production
	if (!S3_HOST) return response;

	// Only patch HTML responses — don't touch API JSON, images, etc.
	const contentType = response.headers.get("content-type") ?? "";
	if (!contentType.includes("text/html")) return response;

	const existingCsp = response.headers.get("content-security-policy");
	if (!existingCsp) return response;

	// Patch connect-src 'self' → connect-src 'self' https://<S3_HOST>
	const patchedCsp = existingCsp.replace(
		/(connect-src\s+)([^;]+)/,
		(_, directive, sources) => `${directive}${sources.trim()} https://${S3_HOST}`,
	);

	if (patchedCsp === existingCsp) return response; // nothing changed, skip clone

	const headers = new Headers(response.headers);
	headers.set("content-security-policy", patchedCsp);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
});

