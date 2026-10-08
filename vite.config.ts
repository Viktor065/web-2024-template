import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Прокси для DashScope API (обход CORS) — запускать server/qwen-proxy.mjs
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
