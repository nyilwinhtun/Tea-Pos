import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Enable the generated service worker in local development so PWA
      // installation behavior can be tested on localhost as well as production.
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'T POS - Tea Shop Point of Sale',
        short_name: 'T POS',
        description: 'Offline-first Tea Shop POS System',
        theme_color: '#2563eb',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: { port: 5175, strictPort: true },
});
