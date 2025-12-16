import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@features': path.resolve(__dirname, 'src/features'),
        }
      }
    };
});
