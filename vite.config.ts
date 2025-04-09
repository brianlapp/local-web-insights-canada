import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Forward all requests to /api/scraper to the Railway-hosted scraper service
      '/api/scraper': {
        target: 'https://local-web-scraper-production.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scraper/, '/api'),
        secure: true,
      },
    },
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
}));
