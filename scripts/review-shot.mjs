// 檢查複習頁:先在題目清單標記幾題,再到複習頁作答
import { chromium } from 'playwright-core'
const out = process.argv[2] ?? 'review.png'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
// 模擬 5 天前標記過的紀錄,讓「今天該複習」有內容
await page.goto('http://localhost:4173/')
await page.evaluate(() => {
  const t = Date.now() - 5 * 86400000
  localStorage.setItem('lcv:progress:v1', JSON.stringify({ 1: { status: 'no', at: t }, 15: { status: 'fuzzy', at: t }, 70: { status: 'ok', at: t } }))
})
await page.goto('http://localhost:4173/#/review')
await page.waitForTimeout(300)
await page.locator('.quiz-options button').first().click()
await page.waitForTimeout(300)
await page.screenshot({ path: out, fullPage: true })
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors')
await browser.close()
