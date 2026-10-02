// 逐頁檢查:每個演算法頁跑完所有步驟、切換所有語言,收集主控台錯誤
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
const ids = [...readFileSync('src/data/categories.ts', 'utf8').matchAll(/\{ id: '([\w-]+)', name:/g)].map((m) => m[1])
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(`${page.url()} ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`${page.url()} ${m.text()}`))
for (const id of ids) {
  await page.goto(`http://localhost:4173/#/p/${id}`)
  await page.waitForSelector('.player')
  const total = Number((await page.locator('.step-count').textContent()).split('/')[1])
  await page.locator('.controls input[type=range]').fill(String(total - 1))
  for (const tab of await page.locator('.tabs button').all()) await tab.click()
  await page.keyboard.press('Home')
  const err = await page.locator('.player-error').count()
  if (err) errors.push(`${id}: 預設輸入顯示錯誤`)
  process.stdout.write(`${id}(${total}) `)
}
await page.goto('http://localhost:4173/#/problems')
await page.waitForSelector('.problem-list')
await page.selectOption('.filters select >> nth=0', 'all')
await page.waitForTimeout(300)
console.log('\n全部題目頁(全部):', await page.locator('.filters .muted').textContent())
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : '沒有任何錯誤')
await browser.close()
