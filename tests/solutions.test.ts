import { describe, expect, it } from 'vitest'
import { CONCEPTS } from '../src/concepts'
import { CATEGORIES } from '../src/data/categories'
import { PROBLEMS } from '../src/data/problems'
import { SOLUTIONS } from '../src/solutions'
import type { Check } from '../src/solutions/types'
import { LANGS } from '../src/types'

const byId = new Map(PROBLEMS.map((p) => [p.id, p]))
const patternIds = new Set(CATEGORIES.flatMap((c) => c.patterns.map((p) => p.id)))

/** 把題解裡所有文字欄位攤平(程式碼除外),檢查行內連結用 */
function texts(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(texts)
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => (k === 'code' || k === 'views' ? [] : texts(x)))
  return []
}

const clone = <T,>(x: T): T => structuredClone(x)

function normalize(x: unknown, compare: 'exact' | 'sorted' | 'groups'): unknown {
  if (compare === 'sorted') return [...(x as unknown[])].sort()
  if (compare === 'groups') return (x as unknown[][]).map((g) => [...g].sort()).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  return x
}

/** 照 LeetCode 的方式跑 JavaScript 版:函式題直接呼叫,設計題依 ops 依序呼叫方法 */
function run(code: string, check: Check) {
  if (check.kind === 'fn') {
    const fn = new Function(`${code}\nreturn ${check.fn};`)() as (...a: unknown[]) => unknown
    for (const c of check.cases) {
      expect(normalize(fn(...clone(c.args)), check.compare ?? 'exact'), JSON.stringify(c.args)).toEqual(normalize(c.out, check.compare ?? 'exact'))
    }
    return
  }
  const Cls = new Function(`${code}\nreturn ${check.cls};`)() as new (...a: unknown[]) => Record<string, (...a: unknown[]) => unknown>
  for (const c of check.cases) {
    const obj = new Cls(...clone(c.args[0]))
    const got = c.ops.map((op, i) => (i === 0 ? null : (obj[op](...clone(c.args[i])) ?? null)))
    expect(got, c.ops.join(',')).toEqual(c.out)
  }
}

describe('題解', () => {
  for (const sol of Object.values(SOLUTIONS)) {
    describe(`${sol.id}`, () => {
      it('題號存在於題庫', () => {
        expect(byId.has(sol.id)).toBe(true)
      })

      it('欄位齊全:至少兩種解法,每種都有圖示、複雜度與五種語言的程式碼', () => {
        expect(sol.statement.length).toBeGreaterThan(10)
        expect(sol.examples.length).toBeGreaterThan(0)
        expect(sol.insight.length).toBeGreaterThan(0)
        expect(sol.pitfalls.length).toBeGreaterThan(0)
        expect(sol.approaches.length).toBeGreaterThanOrEqual(2)
        expect(new Set(sol.approaches.map((a) => a.name)).size).toBe(sol.approaches.length)
        for (const a of sol.approaches) {
          expect(a.steps.length, a.name).toBeGreaterThan(0)
          expect(a.figure.steps.length, a.name).toBeGreaterThanOrEqual(2)
          for (const s of a.figure.steps) expect(s.views.length, `${a.name}: ${s.note}`).toBeGreaterThan(0)
          expect(a.complexity.time && a.complexity.space && a.complexity.why, a.name).toBeTruthy()
          for (const l of LANGS) expect(a.code[l.id]?.trim(), `${a.name} 缺 ${l.label}`).toBeTruthy()
        }
      })

      it('行內連結都指向存在的頁面', () => {
        for (const t of texts(sol)) {
          for (const [, kind, id] of t.matchAll(/\[\[([cp]):([\w-]+)\]\]/g)) {
            expect(kind === 'c' ? id in CONCEPTS : patternIds.has(id), id).toBe(true)
          }
          for (const [, path] of t.matchAll(/\]\(#\/(\w+)\/([\w-]+)\)/g).map((m) => [m[0], `${m[1]}/${m[2]}`])) {
            const [kind, id] = path.split('/')
            if (kind === 'p') expect(patternIds.has(id), path).toBe(true)
            else if (kind === 'q') expect(byId.has(Number(id)), path).toBe(true)
            else if (kind === 'c') expect(id in CONCEPTS, path).toBe(true)
          }
        }
      })

      for (const a of sol.approaches) {
        it(`JavaScript 版通過測資:${a.name}`, () => {
          run(a.code.javascript, sol.check)
        })
      }
    })
  }
})
