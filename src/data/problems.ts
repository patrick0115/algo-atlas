import type { Difficulty, ListId, Problem } from '../types'
import catalog from './catalog.json'
import { CURATED } from './curated'
import { autoPatterns } from './categories'

// catalog.json 由 scripts/fetch-catalog.mjs 從 LeetCode 官方抓取(只有中繼資料,不含題目內文)。
// 每列:[id, title, slug, 難度 E/M/H, paidOnly, tag 索引[], 清單[], NeetCode 分類]
type Row = [number, string, string, 'E' | 'M' | 'H', number, number[], string[], string]

const DIFF: Record<string, Difficulty> = { E: 'Easy', M: 'Medium', H: 'Hard' }

export const CATALOG_DATE: string = catalog.fetchedAt

export const PROBLEMS: Problem[] = (catalog.problems as Row[]).map(([id, title, slug, d, paid, tagIdx, lists]) => {
  const tags = tagIdx.map((i) => catalog.tags[i])
  const c = CURATED[id]
  return {
    id,
    title,
    slug,
    difficulty: DIFF[d],
    paid: paid === 1,
    tags,
    lists: lists as ListId[],
    patterns: c ? c.p : autoPatterns(tags),
    curated: !!c,
    key: c?.k,
  }
})

const byPattern = new Map<string, Problem[]>()
for (const p of PROBLEMS) {
  for (const id of p.patterns) {
    if (!byPattern.has(id)) byPattern.set(id, [])
    byPattern.get(id)!.push(p)
  }
}

export function problemsOf(patternId: string): Problem[] {
  return byPattern.get(patternId) ?? []
}
