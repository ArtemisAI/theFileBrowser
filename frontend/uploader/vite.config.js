import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Expose env vars starting with VITE_
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: false,
  },
});
