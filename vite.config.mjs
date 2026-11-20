import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const { VITE_API_BASE_URL } = loadEnv(mode, ".", "VITE_");
  if (VITE_API_BASE_URL || command === "build") {
    const url = URL.parse(VITE_API_BASE_URL || "");
    const loopback = url && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (!url || (url.protocol !== "https:" && !(loopback && url.protocol === "http:")) ||
        url.username || url.password || url.search || url.hash) {
      throw new Error("Set VITE_API_BASE_URL to the HTTPS API URL or a local HTTP API URL.");
    }
  }
  return { build: { outDir: "build" } };
});
