// create-arkitect/templates/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: path.resolve("react/main.jsx"),
      output: {
        entryFileNames: "main.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
      inlineDynamicImports: true,
    },
  },
  css: {
    extract: true,
  },
  resolve: {
    alias: {
      "../src/_data": path.resolve(__dirname, "src/_data"),
      "../react/components": path.resolve(__dirname, "react/components"),
    },
  },
});