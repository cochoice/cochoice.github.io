import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// Multi-pages : chaque fichier HTML = une page buildée dans dist/
export default defineConfig({
  base: './', // chemins relatifs (compatible GitHub Pages)
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        accueil: resolve(__dirname, 'index.html'),
        aPropos: resolve(__dirname, 'a-propos.html'),
        contact: resolve(__dirname, 'contact.html'),
        landing: resolve(__dirname, 'landing.html'),
        mvp: resolve(__dirname, 'mvp.html'),
        mentionsLegales: resolve(__dirname, 'mentions-legales.html'),
      },
    },
  },
})
