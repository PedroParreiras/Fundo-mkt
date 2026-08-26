import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Served under /system/fundo-mkt/ behind nginx in production; root in dev.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/system/fundo-mkt/' : '/',
  server: {
    // Dev: backend Flask do HRM (auth) roda em :5000.
    proxy: { '/api': 'http://localhost:5000' },
  },
}))
