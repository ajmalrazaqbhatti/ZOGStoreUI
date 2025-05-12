import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get the repository name from package.json or environment variables
const repoName = 'ZOGStoreUI';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: import.meta.env.MODE === 'production' ? `/${repoName}/` : '/',
});
