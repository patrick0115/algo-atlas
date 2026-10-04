import { describe, expect, it } from 'vitest'
import { PRO } from '../src/data/pro'
import { CATEGORIES } from '../src/data/categories'
import { PATTERNS } from '../src/patterns'
import { legendOf } from '../src/renderers/legend-data'
import { collectFrames } from '../src/engine/frames'

const ids = CATEGORIES.flatMap((c) => c.patterns.map((p) => p.id))
const known = new Set(ids)

describe('專業層講義', () => {
  it('地圖上每個演算法都有一筆,而且沒有多餘的', () => {
    expect(ids.filter((id) => !PRO[id])).toEqual([])
    expect(Object.keys(PRO).filter((id) => !known.has(id))).toEqual([])
  })

  it('欄位齊全', () => {
    for (const [id, p] of Object.entries(PRO)) {
      expect(p.invariant.length, id).toBeGreaterThan(20)
      expect(p.template.trim().length, id).toBeGreaterThan(20)
      expect(p.variants.length, id).toBeGreaterThanOrEqual(2)
      expect(p.compare.length, id).toBeGreaterThanOrEqual(1)
      expect(p.interview.length, id).toBeGreaterThanOrEqual(2)
    }
  })

  it('先修與比較只指向存在的演算法、不指向自己', () => {
    const bad: string[] = []
    for (const [id, p] of Object.entries(PRO)) {
      for (const r of [...p.prereq, ...p.compare.map((c) => c.id)]) if (!known.has(r) || r === id) bad.push(`${id} → ${r}`)
    }
    expect(bad).toEqual([])
  })

  it('先修關係沒有循環', () => {
    const state = new Map<string, 1 | 2>()
    const cycle: string[] = []
    const visit = (id: string, path: string[]) => {
      if (state.get(id) === 2) return
      if (state.get(id) === 1) {
        cycle.push([...path, id].join(' → '))
        return
      }
      state.set(id, 1)
      for (const r of PRO[id].prereq) visit(r, [...path, id])
      state.set(id, 2)
    }
    ids.forEach((id) => visit(id, []))
    expect(cycle).toEqual([])
  })
})

describe('圖例', () => {
  it('每個演算法的動畫至少有一幀能產生圖例', () => {
    const empty = Object.values(PATTERNS).filter((p) => {
      const defaults = Object.fromEntries(p.demo.inputs.map((i) => [i.key, i.default]))
      return collectFrames(p.demo, defaults).frames.every((f) => legendOf(f.views).length === 0)
    })
    expect(empty.map((p) => p.id)).toEqual([])
  })
})
