import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'offline.html', 'icons/soundlink-logo.svg', 'icons/soundlink-icon.svg?v=2'],
      manifest: {
        name: 'SoundLink',
        short_name: 'SoundLink',
        description: 'A music streaming platform',
        theme_color: '#a855f7',
        icons: [
          {
            src: '/icons/icon-72x72.svg?v=2',
            sizes: '72x72',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon-96x96.svg?v=2',
            sizes: '96x96',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon-128x128.svg?v=2',
            sizes: '128x128',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon-144x144.svg?v=2',
            sizes: '144x144',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon-152x152.svg?v=2',
            sizes: '152x152',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon-192x192.svg?v=2',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon-384x384.svg?v=2',
            sizes: '384x384',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon-512x512.svg?v=2',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:svg)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'svg-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.soundlink\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api/, /^\/admin/]
      }
    })
  ],
  server: {
    historyApiFallback: true, // 👈 this is the fix for white screen on refresh
  },
})
