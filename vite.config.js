import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@sirat/ui": fileURLToPath(new URL("./src/lib/ui/index.js", import.meta.url)),
      "@sirat/api": fileURLToPath(new URL("./src/api/index.js", import.meta.url))
    }
  }
});
