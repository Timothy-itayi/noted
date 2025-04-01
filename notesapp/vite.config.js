import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import json from "@rollup/plugin-json";

export default defineConfig({
  plugins: [react(), json()],
  build: {
    outDir: "dist", // Explicitly set the output directory
    assetsInlineLimit: 0, // Ensures files are not inlined as base64
    rollupOptions: {
      input: "src/main.jsx",
      external: ["./amplify_outputs.json"], // Explicitly mark it as an external file
    },
  },
  server: {
    fs: {
      allow: [".", "/src"], // Allow access to the entire project & src folder
    },
  },
  resolve: {
    alias: {
      "@": "/src", // Allows cleaner imports like "@/components/MyComponent"
    },
  },
  optimizeDeps: {
    include: ["@aws-amplify/ui-react"], // Pre-bundles dependencies for faster dev server
  },
});
