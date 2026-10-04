// 由 favicon 的長條圖案產生 PWA / iOS 主畫面圖示:node scripts/make-icons.mjs
import { chromium } from 'playwright-core'
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16"><rect width="16" height="16" fill="#111"/><path d="M3.5 12V8M6.5 12V5M9.5 12V9M12.5 12V3.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`
const browser = await chromium.launch({ channel: 'chrome' })
for (const size of [180, 192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(`<body style="margin:0">${svg(size)}</body>`)
  await page.screenshot({ path: `public/icon-${size}.png` })
  await page.close()
}
await browser.close()
console.log('圖示已寫入 public/icon-{180,192,512}.png')
