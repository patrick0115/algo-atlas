import { describe, expect, it } from 'vitest'
import { CURATED } from '../src/data/curated'
import { CATEGORIES, isNonAlgo } from '../src/data/categories'
import { PROBLEMS } from '../src/data/problems'

const patternIds = new Set(CATEGORIES.flatMap((c) => c.patterns.map((p) => p.id)))
const byId = new Map(PROBLEMS.map((p) => [p.id, p]))

describe('精標資料', () => {
  it('題號存在且標題和官方一致', () => {
    const bad = Object.entries(CURATED)
      .map(([id, c]) => ({ id: Number(id), want: c.t, got: byId.get(Number(id))?.title }))
      .filter((x) => x.want !== x.got)
    expect(bad).toEqual([])
  })

  it('演算法 id 都存在於 categories', () => {
    const bad = Object.entries(CURATED).flatMap(([id, c]) => c.p.filter((p) => !patternIds.has(p)).map((p) => `${id}:${p}`))
    expect(bad).toEqual([])
  })

  it('NeetCode 150 全部精標', () => {
    const missing = PROBLEMS.filter((p) => p.lists.includes('neetcode150') && !p.curated).map((p) => `${p.id} ${p.title}`)
    expect(missing).toEqual([])
  })

  it('涵蓋率報告', () => {
    const free = PROBLEMS.filter((p) => !p.paid && !isNonAlgo(p.tags))
    const covered = free.filter((p) => p.patterns.length > 0)
    console.log(`未歸類範例:${free.filter((p) => !p.patterns.length).slice(0, 15).map((p) => p.id + ' ' + p.tags.join('/')).join(' | ')}`)
    console.log(`題目 ${PROBLEMS.length}(免費 ${free.length}),免費題有歸類 ${covered.length}(${((covered.length / free.length) * 100).toFixed(1)}%),精標 ${Object.keys(CURATED).length}`)
    for (const id of patternIds) {
      const n = PROBLEMS.filter((p) => p.patterns.includes(id)).length
      if (n === 0) console.log(`  ⚠ ${id} 沒有題目`)
    }
  })
})
