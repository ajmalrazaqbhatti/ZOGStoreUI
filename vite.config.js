import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite configuration for the ZOG Store UI application
export default defineConfig({
  plugins: [
    react(), // React support
    tailwindcss(), // TailwindCSS integration
  ],
});
