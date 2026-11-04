import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { blogPlugin } from './scripts/blog-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [blogPlugin(), react()],
})
