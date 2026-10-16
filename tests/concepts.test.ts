import { describe, expect, it } from 'vitest'
import { CONCEPT_ORDER, CONCEPTS, UNITS } from '../src/concepts'
import type { Block } from '../src/concepts/types'
import { CATEGORIES } from '../src/data/categories'
import { parseN, suggest, verdict, CLASSES } from '../src/components/widgets'
import { LANGS } from '../src/types'

const patternIds = new Set(CATEGORIES.flatMap((c) => c.patterns.map((p) => p.id)))
const langIds = new Set(LANGS.map((l) => l.id as string))

/** 把一章裡所有文字欄位攤平,檢查行內連結用 */
function texts(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(texts)
  if (v && typeof v === 'object') return Object.values(v).flatMap(texts)
  return []
}

describe('基礎篇觀念章', () => {
  it('id 不重複,也不和演算法 id 撞名', () => {
    const ids = CONCEPT_ORDER.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.filter((id) => patternIds.has(id))).toEqual([])
  })

  it('每個單元至少一章', () => {
    for (const u of UNITS) expect(u.concepts.length, u.id).toBeGreaterThan(0)
  })

  for (const [i, c] of CONCEPT_ORDER.entries()) {
    describe(c.id, () => {
      it('先修存在,而且排在這章前面', () => {
        for (const p of c.prereq) {
          const at = CONCEPT_ORDER.findIndex((x) => x.id === p)
          expect(at, p).toBeGreaterThanOrEqual(0)
          expect(at, p).toBeLessThan(i)
        }
      })

      it('欄位齊全', () => {
        expect(c.lead.length).toBeGreaterThan(30)
        expect(c.sections.length).toBeGreaterThanOrEqual(2)
        for (const s of c.sections) expect(s.blocks.length, s.title).toBeGreaterThan(0)
        expect(c.pitfalls.length).toBeGreaterThanOrEqual(3)
        expect(c.quiz.length).toBeGreaterThanOrEqual(3)
      })

      it('測驗的答案索引合法', () => {
        for (const q of c.quiz) {
          expect(q.options.length, q.q).toBeGreaterThanOrEqual(2)
          expect(q.a, q.q).toBeGreaterThanOrEqual(0)
          expect(q.a, q.q).toBeLessThan(q.options.length)
        }
      })

      it('「接著讀」都是存在的演算法', () => {
        expect(c.next.filter((id) => !patternIds.has(id))).toEqual([])
      })

      it('行內連結都指到存在的章', () => {
        const bad = texts(c)
          .flatMap((t) => [...t.matchAll(/\[\[([cp]):([\w-]+)\]\]/g)])
          .filter(([, k, id]) => (k === 'c' ? !CONCEPTS[id] : !patternIds.has(id)))
          .map((m) => m[0])
        expect(bad).toEqual([])
      })

      it('行內標記成對(反引號、粗體)', () => {
        const bad = texts(c.sections.flatMap((s) => s.blocks.filter((b) => b.t !== 'code' && b.t !== 'memory' && b.t !== 'pre')))
          .concat(texts([c.lead, c.pitfalls, c.quiz]))
          .filter((t) => (t.match(/`/g)?.length ?? 0) % 2 === 1 || (t.replace(/`[^`]*`/g, '').match(/\*\*/g)?.length ?? 0) % 2 === 1)
        expect(bad).toEqual([])
      })

      const blocks: Block[] = c.sections.flatMap((s) => s.blocks)

      it('程式碼區塊只用支援的語言,內容不空', () => {
        for (const b of blocks) {
          if (b.t !== 'code') continue
          const ls = Object.keys(b.code)
          expect(ls.length).toBeGreaterThan(0)
          for (const l of ls) {
            expect(langIds.has(l), l).toBe(true)
            expect(b.code[l as keyof typeof b.code]!.trim().length, `${b.title} ${l}`).toBeGreaterThan(0)
          }
        }
      })

      it('表格每列欄數一致', () => {
        for (const b of blocks) if (b.t === 'table') for (const r of b.rows) expect(r.length, r[0]).toBe(b.cols.length)
      })

      it('記憶體圖:行號在程式碼範圍內,指標指到同一步存在的格子', () => {
        for (const b of blocks) {
          if (b.t !== 'memory') continue
          const lines = b.code.split('\n').length
          expect(b.steps.length, b.title).toBeGreaterThan(1)
          for (const [k, s] of b.steps.entries()) {
            expect(s.line, `${b.title} #${k + 1}`).toBeGreaterThanOrEqual(1)
            expect(s.line, `${b.title} #${k + 1}`).toBeLessThanOrEqual(lines)
            const names = s.cells.map((x) => x.name)
            const keys = s.cells.map((x) => `${x.region}/${x.name}`)
            expect(new Set(keys).size, `${b.title} #${k + 1} 同一區域裡格子名稱重複`).toBe(keys.length)
            for (const x of s.cells) if (x.ref) expect(names, `${b.title} #${k + 1} ${x.name}`).toContain(x.ref)
          }
        }
      })
    })
  }
})

describe('時間預算計算機', () => {
  it('看得懂各種寫法', () => {
    expect(parseN('100000')).toBe(1e5)
    expect(parseN('1e5')).toBe(1e5)
    expect(parseN('10^5')).toBe(1e5)
    expect(parseN('2*10^5')).toBe(2e5)
    expect(parseN('2 * 10**4')).toBe(2e4)
    expect(parseN('1,000')).toBe(1000)
    expect(parseN('abc')).toBeNull()
  })

  it('經典對照表:資料範圍 → 最慢可用的複雜度', () => {
    expect(suggest(10).name).toBe('O(n!)')
    expect(suggest(20).name).toBe('O(2ⁿ)')
    expect(suggest(500).name).toBe('O(n³)')
    expect(suggest(5000).name).toBe('O(n²)')
    expect(suggest(1e5).name).toBe('O(n log n)')
    expect(suggest(1e9).name).toBe('O(√n)')
  })

  it('越慢的等級在大 n 時運算量越大', () => {
    const n = 1e4
    const ops = CLASSES.map((c) => c.f(n))
    for (let i = 1; i < ops.length; i++) expect(ops[i]).toBeGreaterThanOrEqual(ops[i - 1])
    expect(verdict(1)).toBe('ok')
    expect(verdict(1e12)).toBe('no')
  })
})
