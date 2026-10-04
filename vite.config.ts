import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 網站版(GitHub Pages)才加的 PWA 標籤:主畫面圖示、全螢幕、manifest。離線單檔用不到
const pwaTags: Plugin = {
  name: 'pwa-tags',
  transformIndexHtml: () => [
    { tag: 'link', attrs: { rel: 'manifest', href: 'manifest.webmanifest' }, injectTo: 'head' },
    { tag: 'link', attrs: { rel: 'apple-touch-icon', href: 'icon-180.png' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'theme-color', content: '#111111' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'mobile-web-app-capable', content: 'yes' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: '演算法圖鑑' }, injectTo: 'head' },
  ],
}

// `vite build --mode offline`:把 JS / CSS 全部內嵌成單一 HTML,可直接雙擊離線開啟
// base './':網站放在 GitHub Pages 的子路徑(/<repo>/)也能用,不必寫死 repo 名稱
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'offline' ? [react(), viteSingleFile()] : [react(), pwaTags],
  build: mode === 'offline' ? { outDir: 'dist-offline' } : {},
}))
