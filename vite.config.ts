import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode offline`:把 JS / CSS 全部內嵌成單一 HTML,可直接雙擊離線開啟
export default defineConfig(({ mode }) => ({
  plugins: mode === 'offline' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'offline' ? { outDir: 'dist-offline' } : {},
}))
