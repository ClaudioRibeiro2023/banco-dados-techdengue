import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Otimização de bundle
    rollupOptions: {
      output: {
        // Code splitting para melhor performance
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // React Query
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-table'],
          // UI Components
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          // Charts
          'vendor-charts': ['recharts'],
          // HTTP client
          'vendor-http': ['axios'],
        },
      },
    },
    // Reduzir tamanho do bundle
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    // Warning threshold
    chunkSizeWarningLimit: 500,
  },
  // Otimizações de desenvolvimento
  server: {
    port: 5173,
    host: true,
  },
  // Preview server
  preview: {
    port: 4173,
  },
})
