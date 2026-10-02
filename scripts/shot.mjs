// 用本機 Chrome 截圖檢查畫面:node scripts/shot.mjs <hash 不含開頭斜線,例 p/sliding-window> <out.png> [按右鍵次數] [page|player]
import { chromium } from 'playwright-core'
const [hash = "", out = 'shot.png', steps = '0', part = 'page'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto(`http://localhost:4173/#/${hash}`)
await page.waitForTimeout(300)
for (let i = 0; i < Number(steps); i++) await page.keyboard.press('ArrowRight')
await page.waitForTimeout(500)
if (part === 'player') await page.locator('.player').screenshot({ path: out })
else await page.screenshot({ path: out, fullPage: true })
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors')
await browser.close()
