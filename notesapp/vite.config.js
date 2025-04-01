import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Explicitly set the output directory
  }, 
   server: {
    fs: {
      allow: ['.'], // Allows access to the entire project directory
    },
  },
});
