import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Resolve the current commit SHA without the `git` binary: the frontend runs
// Vite inside a container that has neither git nor the repo history on PATH.
// We read it straight from the .git directory — mounted read-only at /git in
// Docker (see docker-compose.yml), or ../.git when running `npm run dev` on the
// host. Order: VITE_APP_VERSION env (CI/prod) -> .git files -> "dev".
function readGitSha() {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION
  const dirs = ['/git', resolve(process.cwd(), '../.git'), resolve(process.cwd(), '.git')]
  for (const gitDir of dirs) {
    try {
      const headPath = resolve(gitDir, 'HEAD')
      if (!existsSync(headPath)) continue
      const head = readFileSync(headPath, 'utf8').trim()
      if (!head.startsWith('ref:')) return head.slice(0, 7) // detached HEAD = raw SHA
      const ref = head.slice(4).trim()
      const refPath = resolve(gitDir, ref)
      if (existsSync(refPath)) return readFileSync(refPath, 'utf8').trim().slice(0, 7)
      // Loose ref absent (refs packed by `git gc`): fall back to packed-refs.
      const packed = resolve(gitDir, 'packed-refs')
      if (existsSync(packed)) {
        const line = readFileSync(packed, 'utf8')
          .split('\n')
          .find((l) => l.endsWith(' ' + ref))
        if (line) return line.split(/\s/)[0].slice(0, 7)
      }
    } catch {
      // unreadable candidate — try the next one
    }
  }
  return 'dev'
}

// Stamp the build at config-eval time (dev-server start / build); updates on
// restart. Exposed two ways: as VITE_-prefixed env (reliable in dev via
// import.meta.env) and via define (applied by esbuild in prod builds).
const APP_VERSION = process.env.VITE_APP_VERSION || readGitSha()
const BUILD_TIME = new Date().toISOString()
// Human SemVer (source of truth: package.json "version"; kept in sync with CHANGELOG.md).
// Read from disk so it works in the container without extra build args.
const APP_SEMVER = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
).version
process.env.VITE_APP_VERSION = APP_VERSION
process.env.VITE_BUILD_TIME = BUILD_TIME
process.env.VITE_APP_SEMVER = APP_SEMVER

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    __APP_SEMVER__: JSON.stringify(APP_SEMVER),
  },
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
