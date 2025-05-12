import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Development configuration only
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
