// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { ViteImageOptimizer } from "file:///home/project/node_modules/vite-plugin-image-optimizer/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80
      },
      jpg: {
        quality: 80
      },
      webp: {
        quality: 80
      },
      avif: {
        quality: 80
      }
    })
  ],
  optimizeDeps: {
    exclude: ["lucide-react", "framer-motion"]
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "framer-motion",
            "react-intersection-observer"
          ],
          animations: [
            "react-type-animation"
          ],
          ui: [
            "lucide-react",
            "react-countup"
          ]
        }
      }
    }
  },
  server: {
    hmr: {
      timeout: 12e4
      // Increase timeout for HMR
    },
    watch: {
      // Reduce the number of file system events that Vite processes
      usePolling: false,
      ignored: ["**/node_modules/**", "**/dist/**"]
    },
    strictPort: false
    // Allow Vite to try different ports if default is occupied
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlSW1hZ2VPcHRpbWl6ZXIgfSBmcm9tICd2aXRlLXBsdWdpbi1pbWFnZS1vcHRpbWl6ZXInO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZUltYWdlT3B0aW1pemVyKHtcbiAgICAgIHBuZzoge1xuICAgICAgICBxdWFsaXR5OiA4MCxcbiAgICAgIH0sXG4gICAgICBqcGc6IHtcbiAgICAgICAgcXVhbGl0eTogODAsXG4gICAgICB9LFxuICAgICAgd2VicDoge1xuICAgICAgICBxdWFsaXR5OiA4MCxcbiAgICAgIH0sXG4gICAgICBhdmlmOiB7XG4gICAgICAgIHF1YWxpdHk6IDgwLFxuICAgICAgfVxuICAgIH0pLFxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCcsICdmcmFtZXItbW90aW9uJ10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbXG4gICAgICAgICAgICAncmVhY3QnLCBcbiAgICAgICAgICAgICdyZWFjdC1kb20nLCBcbiAgICAgICAgICAgICdmcmFtZXItbW90aW9uJywgXG4gICAgICAgICAgICAncmVhY3QtaW50ZXJzZWN0aW9uLW9ic2VydmVyJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgYW5pbWF0aW9uczogW1xuICAgICAgICAgICAgJ3JlYWN0LXR5cGUtYW5pbWF0aW9uJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgdWk6IFtcbiAgICAgICAgICAgICdsdWNpZGUtcmVhY3QnLFxuICAgICAgICAgICAgJ3JlYWN0LWNvdW50dXAnXG4gICAgICAgICAgXSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG1yOiB7XG4gICAgICB0aW1lb3V0OiAxMjAwMDAsIC8vIEluY3JlYXNlIHRpbWVvdXQgZm9yIEhNUlxuICAgIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIC8vIFJlZHVjZSB0aGUgbnVtYmVyIG9mIGZpbGUgc3lzdGVtIGV2ZW50cyB0aGF0IFZpdGUgcHJvY2Vzc2VzXG4gICAgICB1c2VQb2xsaW5nOiBmYWxzZSxcbiAgICAgIGlnbm9yZWQ6IFsnKiovbm9kZV9tb2R1bGVzLyoqJywgJyoqL2Rpc3QvKionXSxcbiAgICB9LFxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLCAvLyBBbGxvdyBWaXRlIHRvIHRyeSBkaWZmZXJlbnQgcG9ydHMgaWYgZGVmYXVsdCBpcyBvY2N1cGllZFxuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLDBCQUEwQjtBQUduQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixtQkFBbUI7QUFBQSxNQUNqQixLQUFLO0FBQUEsUUFDSCxTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsS0FBSztBQUFBLFFBQ0gsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxNQUFNO0FBQUEsUUFDSixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxnQkFBZ0IsZUFBZTtBQUFBLEVBQzNDO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRO0FBQUEsWUFDTjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLFlBQVk7QUFBQSxZQUNWO0FBQUEsVUFDRjtBQUFBLFVBQ0EsSUFBSTtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQTtBQUFBLElBQ1g7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBLE1BRUwsWUFBWTtBQUFBLE1BQ1osU0FBUyxDQUFDLHNCQUFzQixZQUFZO0FBQUEsSUFDOUM7QUFBQSxJQUNBLFlBQVk7QUFBQTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
