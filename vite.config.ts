import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/algorithm-board/',
  build: {
    outDir: 'excalidrawPro',
  },
  plugins: [react()],
  define: {
    'process.env.IS_PREACT': JSON.stringify('false'),
  }
})
