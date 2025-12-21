import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { cloudflare } from '@cloudflare/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // cloudflare(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'ShipFast QA: Gherkin-to-Playwright',
        short_name: 'ShipFast QA',
        description: 'AI-powered Gherkin to Playwright converter',
        theme_color: '#4f46e5',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ],
  server: {
    proxy: {
      // Directs all /api calls to the Wrangler/Pages Functions local server
      '/api': {
        target: 'http://127.0.0.1:8788', 
        changeOrigin: true,
      },
    },
  },
})