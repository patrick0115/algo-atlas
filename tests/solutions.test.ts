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

// LeetCode 的 JavaScript 環境內建 ListNode / TreeNode,題解程式碼直接拿來用
const PRELUDE = `
function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
function TreeNode(val, left, right) { this.val = val === undefined ? 0 : val; this.left = left === undefined ? null : left; this.right = right === undefined ? null : right; }
`
type LNode = { val: number; next: LNode | null }
type TNode = { val: number; left: TNode | null; right: TNode | null }
const { ListNode, TreeNode } = new Function(`${PRELUDE}
return { ListNode, TreeNode };`)() as {
  ListNode: new (v: number, n?: LNode | null) => LNode
  TreeNode: new (v: number) => TNode
}

function toList(a: number[]): LNode | null {
  let head: LNode | null = null
  for (let i = a.length - 1; i >= 0; i--) head = new ListNode(a[i], head)
  return head
}
function fromList(h: LNode | null): number[] {
  const out: number[] = []
  for (let n = h, k = 0; n && k < 10000; n = n.next, k++) out.push(n.val)
  return out
}
/** 層序陣列(LeetCode 格式,null 表示空)→ 樹 */
function toTree(a: (number | null)[]): TNode | null {
  if (!a.length || a[0] === null) return null
  const root = new TreeNode(a[0])
  const q = [root]
  for (let i = 1, h = 0; i < a.length; h++) {
    const n = q[h]
    if (a[i] !== null && a[i] !== undefined) q.push((n.left = new TreeNode(a[i]!)))
    i++
    if (i < a.length && a[i] !== null) q.push((n.right = new TreeNode(a[i]!)))
    i++
  }
  return root
}
/** 樹 → 層序陣列,去掉結尾的 null */
function fromTree(root: TNode | null): (number | null)[] {
  const out: (number | null)[] = []
  const q: (TNode | null)[] = [root]
  for (let h = 0; h < q.length; h++) {
    const n = q[h]
    out.push(n ? n.val : null)
    if (n) q.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}
const toNode = (v: unknown, kind: string | null | undefined) =>
  kind === 'list' ? toList(v as number[]) : kind === 'tree' ? toTree(v as (number | null)[]) : v
const fromNode = (v: unknown, kind: string | null | undefined) =>
  kind === 'list' ? fromList(v as LNode | null) : kind === 'tree' ? fromTree(v as TNode | null) : v

function round(x: unknown): unknown {
  if (typeof x === 'number') return Math.round(x * 1e5) / 1e5
  if (Array.isArray(x)) return x.map(round)
  return x
}

function normalize(v: unknown, compare: 'exact' | 'sorted' | 'groups' | 'close'): unknown {
  // JSON 來回一次:-0 變 0、undefined 變 null,和 LeetCode 輸出答案的方式一樣
  const x: unknown = v === undefined ? null : JSON.parse(JSON.stringify(v))
  if (compare === 'sorted') return [...(x as unknown[])].sort()
  if (compare === 'groups') return (x as unknown[][]).map((g) => [...g].sort()).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  if (compare === 'close') return round(x)
  return x
}

/** 照 LeetCode 的方式跑 JavaScript 版:函式題直接呼叫,設計題依 ops 依序呼叫方法 */
function run(code: string, check: Check) {
  if (check.kind === 'fn') {
    const fn = new Function(`${PRELUDE}
${code}
return ${check.fn};`)() as (...a: unknown[]) => unknown
    const cmp = check.compare ?? 'exact'
    for (const c of check.cases) {
      const args = clone(c.args).map((a, i) => toNode(a, check.argKinds?.[i]))
      const ret = fn(...args)
      const got = check.inplace !== undefined ? fromNode(args[check.inplace], check.argKinds?.[check.inplace]) : fromNode(ret, check.ret)
      expect(normalize(got, cmp), JSON.stringify(c.args)).toEqual(normalize(c.out, cmp))
    }
    return
  }
  const Cls = new Function(`${PRELUDE}
${code}
return ${check.cls};`)() as new (...a: unknown[]) => Record<string, (...a: unknown[]) => unknown>
  const cmp = check.compare ?? 'exact'
  for (const c of check.cases) {
    const obj = new Cls(...clone(c.args[0]))
    const got = c.ops.map((op, i) => (i === 0 ? null : (obj[op](...clone(c.args[i])) ?? null)))
    expect(normalize(got, cmp), c.ops.join(',')).toEqual(normalize(c.out, cmp))
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
