import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the static build run from any path (e.g. GitHub Pages project sites). NFR-01.
export default defineConfig({ base: "./", plugins: [react()] });
