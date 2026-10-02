// 抓 LeetCode 全部題目的中繼資料(不含題目內文)與 NeetCode 清單,輸出 src/data/catalog.json。
// 用法:node scripts/fetch-catalog.mjs
import { writeFileSync } from 'node:fs'

const Q = `query q($skip:Int,$limit:Int){ questionList(categorySlug:"", limit:$limit, skip:$skip, filters:{}){
  total: totalNum data { id: questionFrontendId title titleSlug difficulty isPaidOnly topicTags { slug } } } }`

async function page(skip, limit) {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com/problemset/' },
    body: JSON.stringify({ query: Q, variables: { skip, limit } }),
  })
  if (!res.ok) throw new Error(`LeetCode ${res.status}`)
  return (await res.json()).data.questionList
}

const all = []
let total = Infinity
for (let skip = 0; skip < total; ) {
  const r = await page(skip, 100)
  total = r.total
  all.push(...r.data)
  skip += r.data.length
  if (!r.data.length) break
  if (all.length % 1000 < 100) console.log(`  ${all.length}/${total}`)
}

const nc = await (await fetch('https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json')).json()
const ncBySlug = new Map(nc.map((p) => [p.link.replace(/\/$/, ''), p]))

const D = { Easy: 'E', Medium: 'M', Hard: 'H' }
const tags = [...new Set(all.flatMap((q) => q.topicTags.map((t) => t.slug)))].sort()
const problems = all
  .filter((q) => /^\d+$/.test(q.id))
  .map((q) => {
    const n = ncBySlug.get(q.titleSlug)
    const lists = []
    if (n?.neetcode150) lists.push('neetcode150')
    if (n?.blind75) lists.push('blind75')
    if (n) lists.push('neetcode450')
    return [Number(q.id), q.title, q.titleSlug, D[q.difficulty], q.isPaidOnly ? 1 : 0, q.topicTags.map((t) => tags.indexOf(t.slug)), lists, n?.pattern ?? '']
  })
  .sort((a, b) => a[0] - b[0])

writeFileSync('src/data/catalog.json', JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), tags, problems }))
console.log(`寫入 ${problems.length} 題,${tags.length} 個 tag;NeetCode 對上 ${problems.filter((p) => p[6].length).length} 題`)
