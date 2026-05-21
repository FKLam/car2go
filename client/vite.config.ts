import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
        configure: (proxy: any) => {
          const ignoreSocketCloseError = (err: any) => {
            if (err.code === 'EPIPE' || err.code === 'ECONNRESET') return;
            console.error('[ws proxy]', err.message);
          };
          proxy.on('error', ignoreSocketCloseError);
          proxy.on('proxyReqWs', (proxyReq: any) => {
            proxyReq.on('error', ignoreSocketCloseError);
          });
          proxy.on('open', (proxySocket: any) => {
            proxySocket.on('error', ignoreSocketCloseError);
          });
        },
      },
    },
  },
});
