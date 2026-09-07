import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const defaultApiTarget = mode !== 'production'
    ? 'https://enablr-gch2agdgfme6fedr.centralus-01.azurewebsites.net'
    : 'http://localhost:44327';
  const apiTarget = env.VITE_API_BASE_URL || defaultApiTarget;

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        /* All /api/v1/* requests are proxied to the backend.
           This avoids CORS errors and handles HTTP/HTTPS differences. */
        '/api': {
          target:      apiTarget,
          changeOrigin: true,
          secure:       false,   // allow self-signed certs on localhost
        },
      },
    },
  };
});
