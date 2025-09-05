import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
      avif: {
        quality: 80,
      }
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react', 'framer-motion'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'framer-motion', 
            'react-intersection-observer'
          ],
          animations: [
            'react-type-animation'
          ],
          ui: [
            'lucide-react',
            'react-countup'
          ],
        }
      }
    }
  },
  server: {
    hmr: {
      timeout: 120000, // Increase timeout for HMR
    },
    watch: {
      // Reduce the number of file system events that Vite processes
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
    strictPort: false, // Allow Vite to try different ports if default is occupied
  }
});