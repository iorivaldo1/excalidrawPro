import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'

  return {
    base: '/algorithm-board/',
    build: {
      outDir: 'excalidrawPro',
    },
    plugins: [react()],
    define: {
      'process.env.IS_PREACT': JSON.stringify('false'),
    },
    server: {
      proxy: {
        '/get_geo_pg': {
          target: proxyTarget,
          changeOrigin: true
        }
      }
    }
  }
})
