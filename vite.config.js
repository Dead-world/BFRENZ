import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Fixed Vite config for Vercel deployment
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // ensures Vercel serves the right folder
  },
  base: '/', // ensures assets load correctly at root
})
