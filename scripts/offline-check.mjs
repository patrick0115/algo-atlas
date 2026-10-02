// 用 file:// 直接開離線檔:換頁、播放、標記進度後重新整理,確認全部正常
import { chromium } from 'playwright-core'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const url = pathToFileURL(resolve('LeetCode演算法圖鑑.html')).href
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('requestfailed', (r) => errors.push(`載入失敗 ${r.url()}`))
await page.goto(url)
console.log('首頁標題:', await page.locator('h1').textContent())
for (const id of ['bubble-sort', 'dijkstra', 'knapsack', 'trie']) {
  await page.goto(`${url}#/p/${id}`)
  await page.waitForSelector('.player')
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
  console.log(`${id}:`, await page.locator('.step-count').textContent())
}
await page.locator('td.status button', { hasText: '模糊' }).first().click()
await page.reload()
await page.waitForSelector('.problem-list')
console.log('重新整理後仍標記為模糊的按鈕數:', await page.locator('td.status button.on').count())
await page.screenshot({ path: process.argv[2] ?? 'offline.png' })
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : '沒有任何錯誤')
await browser.close()
