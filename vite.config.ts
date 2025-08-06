import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Temporarily disable componentTagger to fix __WS_TOKEN__ error
    // mode === 'development' && componentTagger(),
    // Sentry source map upload disabled for Netlify deployment
    // mode === 'production' && sentryVitePlugin({
    //   org: "melon-36",
    //   project: "javascript-react",
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    // }),
  ].filter(Boolean),
  build: {
    sourcemap: true, // Generate source maps for production
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
