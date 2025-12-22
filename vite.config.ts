import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Re-enable the PWA (remove selfDestroying)
      injectRegister: 'auto',
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
      },
      workbox: {
        // This is the fix: It tells the PWA to always check the network 
        // for the main page so it sees your login cookie immediately.
        navigateFallbackDenylist: [/^\/api/], // Never handle API calls via PWA cache
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst', // Always try network first for the HTML shell
            options: {
              cacheName: 'html-cache',
            },
          },
        ],
      }
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788', 
        changeOrigin: true,
      },
    },
  },
})