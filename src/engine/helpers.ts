import type { ArrayViewData, GraphEdge, GraphNode } from '../types'

// ---- 輸入解析 ----

export function parseInts(s: string, name: string, opt: { min?: number; max?: number; minLen?: number; maxLen?: number } = {}): number[] {
  const { min = -999, max = 999, minLen = 1, maxLen = 16 } = opt
  const nums = s
    .split(/[\s,\[\]]+/)
    .filter(Boolean)
    .map(Number)
  if (nums.some((n) => !Number.isInteger(n))) throw new Error(`${name} 只能是整數,用逗號分隔`)
  if (nums.length < minLen) throw new Error(`${name} 至少要 ${minLen} 個數`)
  if (nums.length > maxLen) throw new Error(`示範用,${name} 最多 ${maxLen} 個數`)
  if (nums.some((n) => n < min || n > max)) throw new Error(`${name} 的每個數要介於 ${min} ~ ${max}`)
  return nums
}

export function parseInt_(s: string, name: string, min = -999, max = 999): number {
  const n = Number(s.trim())
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} 必須是 ${min} ~ ${max} 的整數`)
  return n
}

export function parseStr(s: string, name: string, opt: { minLen?: number; maxLen?: number; charset?: RegExp } = {}): string {
  const { minLen = 1, maxLen = 16, charset = /^[a-z]*$/ } = opt
  const t = s.trim()
  if (t.length < minLen || t.length > maxLen) throw new Error(`${name} 長度要介於 ${minLen} ~ ${maxLen}`)
  if (!charset.test(t)) throw new Error(`${name} 含有不支援的字元`)
  return t
}

/** "0-1:4, 1-2:3" 或 "0-1, 1-2" 形式的邊列表 */
export function parseEdges(s: string, n: number, weighted: boolean): [number, number, number][] {
  const out: [number, number, number][] = []
  for (const part of s.split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-+>?\s*(\d+)(?:\s*:\s*(-?\d+))?$/)
    if (!m) throw new Error(`看不懂「${part}」,邊要寫成 0-1${weighted ? ':5' : ''}`)
    const [a, b] = [Number(m[1]), Number(m[2])]
    if (a >= n || b >= n) throw new Error(`節點編號要小於 n=${n}`)
    if (weighted && m[3] === undefined) throw new Error(`「${part}」缺少權重,寫成 ${a}-${b}:5`)
    out.push([a, b, weighted ? Number(m[3]) : 1])
  }
  if (out.length > 30) throw new Error('示範用,最多 30 條邊')
  return out
}

/** 網格:每列一行或用 / 分隔,例如 "110/010/011" */
export function parseGrid(s: string, name: string, charset = /^[01]+$/): string[][] {
  const rows = s
    .split(/[\/\n]+/)
    .map((r) => r.trim().replace(/[\s,]/g, ''))
    .filter(Boolean)
  if (!rows.length || rows.some((r) => !charset.test(r))) throw new Error(`${name} 格式錯誤,例如 110/010/011`)
  if (rows.some((r) => r.length !== rows[0].length)) throw new Error(`${name} 每列長度要一樣`)
  if (rows.length > 10 || rows[0].length > 12) throw new Error('示範用,最多 10 列 × 12 行')
  return rows.map((r) => r.split(''))
}

// ---- 隨機輸入(測試用) ----

export const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))
export const randInts = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => randInt(lo, hi))
export const randStr = (n: number, chars = 'abc') => Array.from({ length: n }, () => chars[randInt(0, chars.length - 1)]).join('')

// ---- 視圖輔助 ----

export const range = (a: number, b: number) => (b < a ? [] : Array.from({ length: b - a + 1 }, (_, i) => a + i))

export function arr(values: (number | string)[], opt: Omit<ArrayViewData, 'kind' | 'values'> = {}): ArrayViewData {
  return { kind: 'array', values: [...values], ...opt, ids: opt.ids ? [...opt.ids] : undefined }
}

/** 由層序陣列(null 表示空)排出二元樹座標 */
export function treeLayout(level: (number | null)[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const depth = Math.floor(Math.log2(Math.max(level.length, 1))) + 1
  const width = 2 ** (depth - 1)
  level.forEach((v, i) => {
    if (v === null) return
    const d = Math.floor(Math.log2(i + 1))
    const pos = i + 1 - 2 ** d
    const span = width / 2 ** d
    nodes.push({ id: i, label: v, x: (pos + 0.5) * span * 0.9, y: d * 1.15 })
    if (i > 0 && level[Math.floor((i - 1) / 2)] !== null) edges.push({ from: Math.floor((i - 1) / 2), to: i })
  })
  return { nodes, edges }
}

/** 把 n 個節點排成圓形 */
export function circleLayout(n: number, r = 2): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: r + r * Math.cos(a), y: r + r * Math.sin(a) }
  })
}
