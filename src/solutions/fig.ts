import type { GraphEdge, GraphNode, GraphViewData, GridViewData, KVViewData } from '../types'
import { circleLayout, treeLayout } from '../engine/helpers'

// 題解圖示的小工具。陣列用 engine/helpers 的 arr()。

export function kv(entries: Iterable<[string | number, string | number]>, label?: string, highlight: (string | number)[] = []): KVViewData {
  return { kind: 'kv', label, entries: [...entries], highlight }
}

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

/** 26 格計數陣列畫成一列表格,欄位標字母 */
export function count26(cnt: number[], label: string, hl: number[] = []): GridViewData {
  return {
    kind: 'grid',
    label,
    cells: [cnt.slice()],
    colLabels: LETTERS,
    marks: { hl: hl.map((c) => [0, c] as [number, number]), dim: cnt.flatMap((v, c) => (v === 0 && !hl.includes(c) ? [[0, c] as [number, number]] : [])) },
  }
}

/** 字母 → 0..25 */
export const idx = (ch: string) => ch.charCodeAt(0) - 97

export interface ChainOpt {
  label?: string
  /** 節點下方的小字(通常是指標名稱),key 是節點索引;-1 是右邊的 null,-2 是左邊的 null */
  subs?: Record<number, string>
  /** 節點的 class(hl cur done dim visited queued),key 是節點索引 */
  cls?: Record<number, string>
  /** 自訂箭頭 [從, 到, class?];不給就是 0→1→2… 的串列。到 -1 指向右邊的 null,-2 指向左邊的 null */
  edges?: [number, number, string?][]
  /** 最後畫一個 null 節點 */
  tail?: boolean
}

/** 鏈結串列畫成一排節點 + 箭頭。反轉時「指回 null」的箭頭用 -2(左邊的 null),才不會穿過其他節點 */
export function chain(vals: (number | string)[], opt: ChainOpt = {}): GraphViewData {
  const nodes: GraphNode[] = vals.map((v, i) => ({ id: i, label: v, x: i * 1.3, y: 0, sub: opt.subs?.[i], cls: opt.cls?.[i] }))
  const nullId = (b: number) => (b === -1 ? 'nullR' : 'nullL')
  const edges: GraphEdge[] = (opt.edges ?? vals.slice(1).map((_, i) => [i, i + 1] as [number, number, string?])).map(([a, b, c]) => ({
    from: a,
    to: b < 0 ? nullId(b) : b,
    directed: true,
    cls: c,
  }))
  if (opt.tail && !opt.edges && vals.length) edges.push({ from: vals.length - 1, to: 'nullR', directed: true })
  const used = new Set(edges.map((e) => e.to))
  if (used.has('nullR') || opt.subs?.[-1]) nodes.push({ id: 'nullR', label: '∅', x: vals.length * 1.3, y: 0, cls: 'dim', sub: opt.subs?.[-1] })
  if (used.has('nullL') || opt.subs?.[-2]) nodes.push({ id: 'nullL', label: '∅', x: -1.3, y: 0, cls: 'dim', sub: opt.subs?.[-2] })
  return { kind: 'graph', label: opt.label, nodes, edges }
}

/** 有環的串列:環之前的節點排成一排,環上的節點排成一圈,尾巴接回第 pos 個 */
export function loopChain(vals: (number | string)[], pos: number, opt: Pick<ChainOpt, 'label' | 'subs' | 'cls'> = {}): GraphViewData {
  const k = vals.length - pos
  const r = Math.max(0.9, (k * 1.3) / (2 * Math.PI))
  const cx = pos * 1.3 + r
  const nodes: GraphNode[] = vals.map((v, i) => {
    if (i < pos) return { id: i, label: v, x: i * 1.3, y: r, sub: opt.subs?.[i], cls: opt.cls?.[i] }
    const a = Math.PI - (2 * Math.PI * (i - pos)) / k
    return { id: i, label: v, x: cx + r * Math.cos(a), y: r - r * Math.sin(a), sub: opt.subs?.[i], cls: opt.cls?.[i] }
  })
  const edges: GraphEdge[] = vals.slice(1).map((_, i) => ({ from: i, to: i + 1, directed: true }))
  edges.push({ from: vals.length - 1, to: pos, directed: true, cls: 'hl' })
  return { kind: 'graph', label: opt.label, nodes, edges }
}

/** 圖示用的樹節點:i 是它在層序陣列裡的位置,畫圖時用來標顏色 */
export interface FNode {
  i: number
  val: number
  left: FNode | null
  right: FNode | null
}

/** LeetCode 層序陣列(null 表示空)→ 樹;每個節點記住自己在陣列裡的位置 */
export function buildTree(level: (number | null)[]): FNode | null {
  if (!level.length || level[0] === null) return null
  const root: FNode = { i: 0, val: level[0], left: null, right: null }
  const q = [root]
  for (let k = 1, h = 0; k < level.length; h++) {
    const n = q[h]
    if (level[k] !== null && level[k] !== undefined) q.push((n.left = { i: k, val: level[k]!, left: null, right: null }))
    k++
    if (k < level.length && level[k] !== null) q.push((n.right = { i: k, val: level[k]!, left: null, right: null }))
    k++
  }
  return root
}

export interface TreeOpt {
  label?: string
  /** key 是節點的 i(建樹時在層序陣列裡的位置,節點被搬動也不會變) */
  cls?: Record<number, string>
  subs?: Record<number, string | number>
  /** 指向某個節點的那條邊的 class,key 是子節點的 i */
  edgeCls?: Record<number, string>
}

/** 把樹畫出來(層序陣列版) */
export function tree(level: (number | null)[], opt: TreeOpt = {}): GraphViewData {
  return treeOf(buildTree(level), opt)
}

/** 把樹畫出來(節點版,樹的形狀改過之後用這個) */
export function treeOf(root: FNode | null, opt: TreeOpt = {}): GraphViewData {
  // treeLayout 用「完整二元樹」的索引排位置(i 的孩子是 2i+1、2i+2)
  const full: (number | null)[] = []
  const idAt = new Map<number, number>()
  const walk = (n: FNode | null, at: number) => {
    if (!n) return
    while (full.length <= at) full.push(null)
    full[at] = n.val
    idAt.set(at, n.i)
    walk(n.left, 2 * at + 1)
    walk(n.right, 2 * at + 2)
  }
  walk(root, 0)
  const { nodes, edges } = treeLayout(full)
  return {
    kind: 'graph',
    label: opt.label,
    nodes: nodes.map((n) => {
      const i = idAt.get(Number(n.id))!
      return { ...n, id: i, cls: opt.cls?.[i], sub: opt.subs?.[i] }
    }),
    edges: edges.map((e) => {
      const to = idAt.get(Number(e.to))!
      return { from: idAt.get(Number(e.from))!, to, cls: opt.edgeCls?.[to] }
    }),
  }
}

/** 複製一棵圖示用的樹 */
export function cloneTree(n: FNode | null): FNode | null {
  return n ? { i: n.i, val: n.val, left: cloneTree(n.left), right: cloneTree(n.right) } : null
}

/** 遞迴 / 回溯的決策樹節點:parent = -1 是根;依「被走到的順序」放進陣列 */
export interface RNode {
  parent: number
  label: string | number
  /** 節點下方的小字(例如目前選了什麼) */
  sub?: string
  /** 這個節點的結果:ok = 找到答案、cut = 被剪掉 */
  kind?: 'ok' | 'cut'
}

/** 先用整棵樹算好位置(葉子由左到右排),之後每一步只畫出已經走到的節點,位置不會跳動 */
export function recLayout(nodes: RNode[]): { x: number; y: number }[] {
  const kids = nodes.map(() => [] as number[])
  nodes.forEach((n, i) => n.parent >= 0 && kids[n.parent].push(i))
  const pos = nodes.map(() => ({ x: 0, y: 0 }))
  let leaf = 0
  const place = (i: number, d: number): number => {
    let x: number
    if (kids[i].length) {
      const xs = kids[i].map((k) => place(k, d + 1))
      x = (xs[0] + xs[xs.length - 1]) / 2
    } else x = leaf++
    pos[i] = { x, y: d }
    return x
  }
  nodes.forEach((n, i) => n.parent < 0 && place(i, 0))
  return pos
}

export function recView(nodes: RNode[], pos: { x: number; y: number }[], upto: number, label = '決策樹(綠色 = 找到答案,淡色 = 剪掉)'): GraphViewData {
  const shown = nodes.slice(0, upto + 1)
  return {
    kind: 'graph',
    label,
    nodes: shown.map((n, i) => ({
      id: i,
      label: n.label,
      x: pos[i].x * 1.05,
      y: pos[i].y * 1.25,
      sub: n.sub,
      cls: i === upto ? 'hl' : n.kind === 'ok' ? 'done' : n.kind === 'cut' ? 'dim' : undefined,
    })),
    edges: shown.flatMap((n, i) => (n.parent >= 0 ? [{ from: n.parent, to: i, cls: n.kind === 'cut' ? 'dim' : undefined }] : [])),
  }
}

/** 區間畫成時間軸:每個區間一列,[a, b] 範圍的格子塗色。cls 的 key 是區間在陣列裡的位置 */
export function intervalsView(iv: number[][], opt: { label?: string; cls?: Record<number, 'hl' | 'done' | 'dim' | 'cmp'>; rowLabels?: string[] } = {}): GridViewData {
  const lo = Math.min(0, ...iv.map((x) => x[0]))
  const hi = Math.max(...iv.map((x) => x[1]))
  const cols = hi - lo + 1
  const marks: Record<string, [number, number][]> = { path: [], hl: [], done: [], dim: [], cmp: [] }
  iv.forEach(([a, b], r) => {
    const cls = opt.cls?.[r] ?? 'path'
    for (let x = a; x <= b; x++) marks[cls].push([r, x - lo])
  })
  return {
    kind: 'grid',
    label: opt.label ?? '區間(每列一個,塗色的是它涵蓋的範圍)',
    cells: iv.map(([a, b]) => Array.from({ length: cols }, (_, k) => (k + lo === a || k + lo === b ? k + lo : ''))),
    rowLabels: opt.rowLabels ?? iv.map(([a, b]) => `[${a},${b}]`),
    colLabels: Array.from({ length: cols }, (_, k) => String(k + lo)),
    marks,
  }
}

export interface GraphOpt {
  label?: string
  /** 節點編號從幾開始(0 或 1) */
  base?: number
  directed?: boolean
  /** 節點的 class / 下方小字,key 是節點編號 */
  cls?: Record<number, string>
  subs?: Record<number, string | number>
  /** 邊的 class,key 是邊在陣列裡的位置 */
  edgeCls?: Record<number, string>
  /** 自訂座標(節點編號 → x, y);不給就排成一圈 */
  pos?: Record<number, { x: number; y: number }>
}

/** 一般的圖:edges 是 [u, v] 或 [u, v, 權重] */
export function graphView(n: number, edges: number[][], opt: GraphOpt = {}): GraphViewData {
  const base = opt.base ?? 0
  const circle = circleLayout(n, Math.max(1.2, n * 0.32))
  return {
    kind: 'graph',
    label: opt.label,
    nodes: Array.from({ length: n }, (_, i) => {
      const id = i + base
      const p = opt.pos?.[id] ?? circle[i]
      return { id, label: id, x: p.x, y: p.y, cls: opt.cls?.[id], sub: opt.subs?.[id] }
    }),
    edges: edges.map((e, k) => ({ from: e[0], to: e[1], label: e[2], directed: opt.directed, cls: opt.edgeCls?.[k] })),
  }
}
