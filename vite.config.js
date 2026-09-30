import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const contentSecurityPolicy = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://www.themealdb.com; connect-src 'self' https://www.themealdb.com https://api.mymemory.translated.net https://translate.googleapis.com;"

const productionSecurityPlugin = {
  name: 'production-security-meta',
  transformIndexHtml() {
    return [{
      tag: 'meta',
      injectTo: 'head',
      attrs: {
        'http-equiv': 'Content-Security-Policy',
        content: contentSecurityPolicy,
      },
    }]
  },
}

export default defineConfig(({ command }) => ({
  plugins: [react(), ...(command === 'build' ? [productionSecurityPlugin] : [])],
}))
