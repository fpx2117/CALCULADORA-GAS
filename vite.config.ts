import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
