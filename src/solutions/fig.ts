import type { GraphEdge, GraphNode, GraphViewData, GridViewData, KVViewData } from '../types'

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
