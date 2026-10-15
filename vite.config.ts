import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'
import cloudflareAdapter from '@hono/vite-dev-server/cloudflare'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [
    react(),
    devServer({
      entry: 'api/index.ts',
      adapter: cloudflareAdapter,
      exclude: [
        /^(?!\/api).*/
      ],
      injectClientScript: false,
    })
  ]
})
