// 從力扣中國站抓每題的官方中文題名,用 OpenCC 轉成台灣用語的繁體。回傳 Map<slug, 中文題名>。
// 單獨執行(node scripts/titles-cn.mjs)會把中文題名補進現有 catalog.json 的第 12 欄,其他欄不動。
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import * as OpenCC from 'opencc-js'

const Q = `query q($skip:Int,$limit:Int){ problemsetQuestionList(categorySlug:"", limit:$limit, skip:$skip, filters:{}){
  total questions { titleCn titleSlug } } }`

// Node 的 fetch 會被 Cloudflare 擋(403),curl 帶瀏覽器標頭才過得去
const HEADERS = [
  'Content-Type: application/json',
  'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  'Origin: https://leetcode.cn',
  'Referer: https://leetcode.cn/problemset/',
]

function post(body) {
  const out = execFileSync('curl', ['-sf', 'https://leetcode.cn/graphql', ...HEADERS.flatMap((h) => ['-H', h]), '--data-binary', '@-'], { input: body, maxBuffer: 1 << 26 })
  return JSON.parse(out.toString('utf8'))
}

// OpenCC 沒轉到、或跟本站用詞不同的,統一成本站講義的說法
const TERMS = [
  ['二叉', '二元'],
  ['連結串列', '鏈結串列'],
  ['單鏈表', '單向鏈結串列'],
  ['雙鏈錶', '雙向鏈結串列'],
  ['數組', '陣列'],
  ['字首', '前綴'],
  ['字尾', '後綴'],
  ['實現', '實作'],
]

export async function fetchTitlesCn() {
  const toTw = OpenCC.Converter({ from: 'cn', to: 'twp' })
  const map = new Map()
  let total = Infinity
  for (let skip = 0; skip < total; ) {
    const r = post(JSON.stringify({ query: Q, variables: { skip, limit: 100 } })).data.problemsetQuestionList
    total = r.total
    for (const q of r.questions) if (q.titleCn) map.set(q.titleSlug, TERMS.reduce((t, [a, b]) => t.replaceAll(a, b), toTw(q.titleCn)))
    skip += r.questions.length
    if (!r.questions.length) break
  }
  return map
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const path = 'src/data/catalog.json'
  const catalog = JSON.parse(readFileSync(path, 'utf8'))
  const cn = await fetchTitlesCn()
  for (const row of catalog.problems) {
    while (row.length < 11) row.push(0)
    row[11] = cn.get(row[2]) ?? ''
  }
  writeFileSync(path, JSON.stringify(catalog))
  console.log(`中文題名 ${catalog.problems.filter((r) => r[11]).length}/${catalog.problems.length} 題`)
}
