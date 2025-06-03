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
        name: "Persan Finance & Docs",
        short_name: "Persan Finance",
        description: "Controle financeiro e documentos familiares",
        start_url: "/",
        display: "standalone",
        theme_color: "rgba(0,0,0,0)",
        background_color: "#F0F9FF",
        display_override: ["window-controls-overlay"],
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
