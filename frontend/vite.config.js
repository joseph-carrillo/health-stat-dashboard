import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Bind 0.0.0.0 so the dev server is reachable from outside the container.
    host: true,
    // Docker on Windows: inotify file events don't cross the bind mount, so HMR
    // never fires. Poll for changes instead so edits hot-reload without a restart.
    watch: { usePolling: true, interval: 300 },
    proxy: {
      // In Docker, point at the backend service (VITE_PROXY_TARGET=http://backend:8000).
      // Falls back to localhost for plain `npm run dev` on the host.
      '/api': process.env.VITE_PROXY_TARGET || 'http://localhost:8000'
    }
  }
})