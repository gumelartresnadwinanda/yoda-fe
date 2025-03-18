import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue()],
    server: {
      port: 3004,
      proxy: {
        "/emails": env.VITE_API_BASE_URL,
        "/fetch-emails": env.VITE_API_BASE_URL,
      },
    },
  };
});
