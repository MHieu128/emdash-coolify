import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash, { local, s3 } from "emdash/astro";
import { sqlite } from "emdash/db";

const storage = process.env.S3_ENDPOINT
	? s3({
			endpoint: process.env.S3_ENDPOINT,
			bucket: process.env.S3_BUCKET,
			accessKeyId: process.env.S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			publicUrl: process.env.S3_PUBLIC_URL,
		})
	: local({
			directory: "./uploads",
			baseUrl: "/_emdash/api/media/file",
		});

export default defineConfig({
	site: "https://emdash.codeandcafe.com",
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: "file:./data.db" }),
			storage,
			passkeyPublicOrigin: "https://emdash.codeandcafe.com",
		}),
	],
	devToolbar: { enabled: false },
	security: {
		allowedDomains: [
			{ hostname: "emdash.codeandcafe.com", protocol: "https" },
		],
	},
});
