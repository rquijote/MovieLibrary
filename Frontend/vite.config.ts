import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function offlineWorker(): Plugin {
  let base = '/'
  return {
    name: 'movie-library-offline',
    apply: 'build',
    configResolved(config) { base = config.base },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const version = createHash('sha256')
        for (const file of Object.values(bundle)) {
          version.update(file.type === 'asset' ? file.source : file.code)
        }
        const urls = [...Object.keys(bundle), 'favicon.svg', 'icons.svg'].map((file) => `${base}${file}`)
        const source = readFileSync(new URL('./offline-worker.js', import.meta.url), 'utf8')
          .replace('__VERSION__', version.digest('hex').slice(0, 12))
          .replace('__PRECACHE__', JSON.stringify(urls))
        this.emitFile({ type: 'asset', fileName: 'service-worker.js', source })
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), offlineWorker()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7141',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'https://localhost:7141',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
