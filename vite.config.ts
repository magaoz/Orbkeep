import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Orbkeep/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Orbkeep',
        short_name: 'Orbkeep',
        description: 'Place keepers. Pop the orbs. Knowledge lasts forever.',
        theme_color: '#2d8a3e',
        background_color: '#87CEEB',
        display: 'standalone',
        orientation: 'any',
        start_url: '/Orbkeep/',
        scope: '/Orbkeep/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache-bust stamp — bump with each ship so clients drop stale precache.
        cacheId: 'orbkeep-v1.0.4',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // HTML navigations: always prefer network so players get updates.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'orbkeep-html-v1.0.4',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'document' ||
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'orbkeep-pages-v1.0.4',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image' || request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'orbkeep-assets-v1.0.4',
              expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: { host: true, port: 5173 },
})
