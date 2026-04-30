import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Carga .env.local sin prefijo VITE_ — la key NUNCA se compila al bundle
  const env = loadEnv(mode, process.cwd(), '');

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'FreedomOS Demographic Engine',
        short_name: 'Demographics',
        description: 'Motor ontológico para migraciones sociales',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/hermes': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: () => '/v1/messages',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-api-key', env.ANTHROPIC_KEY ?? '');
            proxyReq.setHeader('anthropic-version', '2023-06-01');
            proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true');
          });
        },
      },
    },
  },
  };
});
