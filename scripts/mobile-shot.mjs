// 手機直放 / 橫放檢查:找出撐破螢幕寬度的元素並截圖。
// 先 npm run build && npx vite preview --port 4173,再 node scripts/mobile-shot.mjs <輸出資料夾> [hash...]
import { chromium, devices } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const [outDir = 'mobile-shots', ...args] = process.argv.slice(2)
const hashes = args.length ? args : ['', 'p/sliding-window', 'p/bubble-sort', 'p/tree-dfs', 'p/graph-traversal', 'p/dp-grid', 'p/lcs', 'p/hash-map', 'problems', 'review']
mkdirSync(outDir, { recursive: true })
const phone = devices['iPhone 13']
const sizes = { portrait: phone.viewport, landscape: { width: 844, height: 340 } }
const browser = await chromium.launch({ channel: 'chrome' })
let bad = 0
for (const [name, viewport] of Object.entries(sizes)) {
  const page = await browser.newPage({ ...phone, viewport })
  for (const hash of hashes) {
    await page.goto(`http://localhost:4173/#/${hash}`)
    await page.waitForTimeout(500)
    // 頁面本身可以橫向捲動 = 版面被撐破;列出最外層的肇事元素
    const res = await page.evaluate(() => {
      const w = document.documentElement.clientWidth
      const over = document.documentElement.scrollWidth - w
      const culprits = []
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.right > w + 1 && r.width > 0) {
          let p = el.parentElement, inScroller = false
          while (p) { const s = getComputedStyle(p).overflowX; if (s === 'auto' || s === 'scroll' || s === 'hidden') { inScroller = true; break } p = p.parentElement }
          if (!inScroller) culprits.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)}`)
        }
      }
      return { over, culprits: culprits.slice(0, 5) }
    })
    const tag = `${name} #/${hash}`
    if (res.over > 0) { bad++; console.log(`✗ ${tag} 多出 ${res.over}px`, res.culprits) } else console.log(`✓ ${tag}`)
    const file = `${outDir}/${name}-${hash.replace(/\W+/g, '_') || 'home'}`
    await page.screenshot({ path: `${file}.png` })
    // 演算法頁:另外截播放器那一屏(先按兩下「下一步」,讓畫面有狀態)
    const player = page.locator('.player').first()
    if (await player.count()) {
      await player.evaluate((el) => el.scrollIntoView())
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${file}-player.png` })
    }
  }
  await page.close()
}
await browser.close()
process.exitCode = bad ? 1 : 0
