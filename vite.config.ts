import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const DEFAULT_API = "http://localhost:8080";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		resolve: { tsconfigPaths: true },
		server: {
			port: 3000,
			// Keeps the app and the API on one origin, so the SameSite=Strict session
			// cookie survives and no CORS preflight is needed.
			proxy: {
				"/api": {
					target: env.API_PROXY_TARGET || DEFAULT_API,
					changeOrigin: true,
				},
			},
		},
		plugins: [
			devtools(),
			tailwindcss(),
			tanstackStart({ spa: { enabled: true } }),
			viteReact(),
		],
	};
});
