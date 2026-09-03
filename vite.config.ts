import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl =
    env.VITE_API_BASE_URL ??
    env.API_BASE_URL ??
    'http://localhost:8089'

  return {
  plugins: [react()],
  server: {
    proxy: {
      '/api': apiBaseUrl,
      '/naver-api': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/naver-api/, ''),
        headers: {
          'X-Naver-Client-Id': env.NAVER_CLIENT_ID ?? '',
          'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET ?? '',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  }
})
