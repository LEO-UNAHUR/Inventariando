import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Determine base path based on build mode
  // 'pages' mode: for GitHub Pages deployment with '/Inventariando/' base
  // 'development'/'production': default modes for Android/local with '/' base
  const isGitHubPagesMode = mode === 'pages';
  const basePath = isGitHubPagesMode ? '/Inventariando/' : '/';

  return {
    // Base path configuration:
    // - Android & PWA (localhost): '/'
    // - GitHub Pages deployment: '/Inventariando/'
    // Build with: npm run build:web (default) or npm run build:web:pages (for GitHub Pages)
    base: basePath,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Inventariando',
          short_name: 'Inventariando',
          description: 'Gestión de inventario y POS inteligente para PyMEs argentinas',
          theme_color: '#1e40af',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: isGitHubPagesMode ? '/Inventariando/' : '/',
          scope: isGitHubPagesMode ? '/Inventariando/' : '/',
          icons: [
            { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
            {
              src: '/icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
          categories: ['business', 'productivity', 'finance'],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@features': path.resolve(__dirname, 'src/features'),
      },
    },
    build: {
      // Improve chunking to avoid very large main bundle
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor_react';
              if (id.includes('html2canvas')) return 'vendor_html2canvas';
              if (id.includes('recharts')) return 'vendor_recharts';
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 800, // KB - increase limit slightly after splitting
    },
  };
});
