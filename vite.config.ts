
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ConfigEnv, ProxyOptions, UserConfig } from "vite";
import type { ServerResponse, IncomingMessage } from "http";

// Define types for the proxy parameters
interface ProxyInstance {
  on(event: string, callback: (...args: any[]) => void): void;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  // Create a base configuration
  const config: UserConfig = {
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
    // Ensure server property exists before accessing proxy
    if (config.server) {
      config.server.proxy = {
        // Forward all requests to /api/scraper to the Railway-hosted scraper service
        // This is only used during local development
        '/api/scraper': {
          target: 'https://local-web-scraper-production.up.railway.app',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/scraper/, '/api'),
          secure: true,
          // Add verbose logging for debugging
          configure: (proxy: ProxyInstance) => {
            proxy.on('error', (err: Error, req: IncomingMessage, res: ServerResponse) => {
              console.error('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
              console.log('Proxy request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: ServerResponse, req: IncomingMessage, res: ServerResponse) => {
              console.log('Proxy response:', proxyRes.statusCode, req.url);
            });
          }
        },
      };
    }
  }

  return config;
});
