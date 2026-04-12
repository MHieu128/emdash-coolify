import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

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
			storage: local({
				directory: "./uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
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
