import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../src/data/categories'
import { PROBLEMS } from '../src/data/problems'
import { SUMMARIES } from '../src/data/summaries'
import { collectFrames } from '../src/engine/frames'
import { PATTERNS } from '../src/patterns'
import { LANGS } from '../src/types'

const problemIds = new Set(PROBLEMS.map((p) => p.id))

describe('分類總結章', () => {
  for (const [catId, s] of Object.entries(SUMMARIES)) {
    const cat = CATEGORIES.find((c) => c.id === catId)
    const own = new Set(cat?.patterns.map((p) => p.id))

    it(`${catId}:對應到存在的分類`, () => expect(cat).toBeDefined())

    it(`${catId}:總表涵蓋分類裡每個演算法,欄數一致`, () => {
      expect(s.table.rows.map((r) => r.id).sort()).toEqual([...own].sort())
      for (const r of s.table.rows) expect(r.cells.length, r.id).toBe(s.table.cols.length)
    })

    it(`${catId}:引用的演算法都屬於這個分類`, () => {
      const refs = [...s.decide.flatMap((d) => (d.id ? [d.id] : [])), ...s.families.flatMap((f) => f.ids), ...s.quiz.map((q) => q.a)]
      expect(refs.filter((id) => !own.has(id))).toEqual([])
    })

    it(`${catId}:題號都在題庫裡`, () => {
      expect(s.uses.flatMap((u) => u.problems).filter((n) => !problemIds.has(n))).toEqual([])
    })

    it(`${catId}:五種語言都有內建說明與範例`, () => {
      for (const l of LANGS) {
        expect(s.builtins.some((b) => b.lang === l.id), l.id).toBe(true)
        expect(s.example.code[l.id]?.trim().length, l.id).toBeGreaterThan(20)
      }
    })

    it(`${catId}:決策最後一步是「以上都不是」的兜底`, () => {
      expect(s.decide.at(-1)?.id).toBeNull()
    })
  }
})

describe('總結章的動畫比較', () => {
  for (const [catId, s] of Object.entries(SUMMARIES)) {
    if (!s.race) continue
    const cat = CATEGORIES.find((c) => c.id === catId)!
    const ps = cat.patterns.flatMap((c) => (PATTERNS[c.id] ? [PATTERNS[c.id]] : []))

    it(`${catId}:分類裡每個動畫都吃同一種輸入,才能並排比`, () => {
      const keys = ps.map((p) => p.demo.inputs.map((x) => x.key).join(','))
      expect(new Set(keys).size).toBe(1)
    })

    for (const preset of s.race.presets) {
      it(`${catId}:情境「${preset.label}」每個動畫都跑得出答案`, () => {
        for (const p of ps) {
          const { frames, error } = collectFrames(p.demo, preset.values)
          expect(error, p.id).toBeUndefined()
          expect(frames.length, p.id).toBeGreaterThan(1)
          if (p.demo.reference) expect(String(frames.at(-1)?.vars?.answer), p.id).toBe(String(p.demo.reference(preset.values)))
        }
      })
    }
  }
})
