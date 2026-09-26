import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Rutas relativas en el build para que funcione detrás del proxy inverso.
  base: './',
  server: {
    // Proxy solo para desarrollo: reenvía /api al servidor Express local.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
