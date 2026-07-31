import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Rutas relativas para despliegue estático 100% gratuito en GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
