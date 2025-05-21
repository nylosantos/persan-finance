import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Family Finance & Docs',
        short_name: 'FinDocs',
        description: 'Controle financeiro e documentos familiares',
        theme_color: '#16A34A',
        background_color: '#F0F9FF',
        display: 'standalone',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'CacheFirst',
            options: { cacheName: 'documents-cache' }
          },
          {
            urlPattern: ({ url }) => url.origin.includes('api.exchangerate.host'),
            handler: 'NetworkFirst',
            options: { cacheName: 'exchange-cache', expiration: { maxEntries: 30 } }
          }
        ]
      }
    })
  ],
})
