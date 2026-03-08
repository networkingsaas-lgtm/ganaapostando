import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 80,
    allowedHosts: ['lov-eat.es', 'www.lov-eat.es'],
  },
  preview: {
    host: '0.0.0.0',
    port: 80,
    allowedHosts: ['lov-eat.es', 'www.lov-eat.es'],
  },
})
