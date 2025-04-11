
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Create a base configuration
  const config = {
    server: {
      host: "::",
      port: 8080,
      proxy: {} // Default to empty object
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };

  // Add proxy configuration only in development mode
  if (mode === 'development') {
    config.server.proxy = {
      // Forward all requests to /api/scraper to the Railway-hosted scraper service
      // This is only used during local development
      '/api/scraper': {
        target: 'https://local-web-scraper-production.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scraper/, '/api'),
        secure: true,
        // Add verbose logging for debugging
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      },
    };
  }

  return config;
});
