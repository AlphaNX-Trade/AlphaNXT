import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.BASE_PATH || "/",

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },

  root: __dirname,

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },

  server: {
    port: Number(process.env.PORT || 5173),
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },

  preview: {
    port: Number(process.env.PORT || 4173),
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
