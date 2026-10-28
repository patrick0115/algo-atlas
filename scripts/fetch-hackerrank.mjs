// 抓 src/data/tsmc.ts 列出的 HackerRank 題目中繼資料(不含題目內文),輸出 src/data/hackerrank.json。
// 用法:node scripts/fetch-hackerrank.mjs
// 用的是 HackerRank 網站自己的 REST 介面(非官方文件),沒有帶瀏覽器 User-Agent 會被擋。
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/tsmc.ts', import.meta.url), 'utf8')
const slugs = [...src.matchAll(/^\s*\['([\w-]+)',/gm)].map((m) => m[1])

const DIFF = { Easy: 'E', Medium: 'M', Hard: 'H', Advanced: 'H', Expert: 'H' }
const problems = []
for (const slug of slugs) {
  const res = await fetch(`https://www.hackerrank.com/rest/contests/master/challenges/${slug}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`${slug}: HackerRank ${res.status}`)
  const m = (await res.json()).model
  // 每列:[slug, 英文題名, 難度 E/M/H, 分類, 成功率 %, 解題人數]
  problems.push([slug, m.name.trim(), DIFF[m.difficulty_name], m.track?.name ?? '', Math.round((m.success_ratio ?? 0) * 1000) / 10, m.solved_count ?? 0])
}

const out = { fetchedAt: new Date().toISOString().slice(0, 10), problems }
writeFileSync(new URL('../src/data/hackerrank.json', import.meta.url), JSON.stringify(out) + '\n')
console.log(`${problems.length} 題`)
