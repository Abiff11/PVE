import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['pve-frontend.onrender.com', 'pve-backend-latest.onrender.com'],
  },
})
