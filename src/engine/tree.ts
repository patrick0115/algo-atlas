import type { GraphEdge, GraphNode, GraphViewData } from '../types'
import { randInt } from './helpers'

export interface TNode {
  id: number
  val: number
  left: TNode | null
  right: TNode | null
}

/** 解析 LeetCode 層序格式:"3,9,20,null,null,15,7" */
export function parseTree(s: string, maxNodes = 15): TNode | null {
  const parts = s
    .replace(/[\[\]\s]/g, '')
    .split(',')
    .filter((x) => x !== '')
  if (!parts.length || parts[0] === 'null') return null
  const vals = parts.map((p) => {
    if (p === 'null' || p === '#') return null
    const n = Number(p)
    if (!Number.isInteger(n) || Math.abs(n) > 999) throw new Error(`看不懂「${p}」,樹的格式例如 3,9,20,null,null,15,7`)
    return n
  })
  if (vals.filter((v) => v !== null).length > maxNodes) throw new Error(`示範用,最多 ${maxNodes} 個節點`)
  let id = 0
  const root: TNode = { id: id++, val: vals[0]!, left: null, right: null }
  const q = [root]
  let i = 1
  while (q.length && i < vals.length) {
    const cur = q.shift()!
    for (const side of ['left', 'right'] as const) {
      if (i >= vals.length) break
      const v = vals[i++]
      if (v !== null) {
        cur[side] = { id: id++, val: v, left: null, right: null }
        q.push(cur[side]!)
      }
    }
  }
  if (depth(root) > 5) throw new Error('示範用,樹的高度最多 5 層')
  return root
}

export function depth(n: TNode | null): number {
  return n ? 1 + Math.max(depth(n.left), depth(n.right)) : 0
}

export function serialize(root: TNode | null): string {
  const out: (number | null)[] = []
  const q: (TNode | null)[] = [root]
  while (q.length) {
    const n = q.shift()!
    out.push(n ? n.val : null)
    if (n) q.push(n.left, n.right)
  }
  while (out.length && out.at(-1) === null) out.pop()
  return out.map((v) => (v === null ? 'null' : v)).join(',')
}

/** 隨機二元樹(測試用),回傳層序字串 */
export function randomTree(n: number, lo = 0, hi = 20, maxDepth = 5): string {
  if (n === 0) return ''
  let id = 0
  const root: TNode = { id: id++, val: randInt(lo, hi), left: null, right: null }
  const slots: [TNode, 'left' | 'right', number][] = [[root, 'left', 2], [root, 'right', 2]]
  for (let k = 1; k < n && slots.length; k++) {
    const [p, side, d] = slots.splice(randInt(0, slots.length - 1), 1)[0]
    const node: TNode = { id: id++, val: randInt(lo, hi), left: null, right: null }
    p[side] = node
    if (d < maxDepth) slots.push([node, 'left', d + 1], [node, 'right', d + 1])
  }
  return serialize(root)
}

/** 中序排版:x = 中序名次,y = 深度。保證不重疊。 */
export function treeView(
  root: TNode | null,
  opt: { label?: string; cls?: Map<number, string>; sub?: Map<number, string | number>; edgeCls?: Map<number, string> } = {},
): GraphViewData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let x = 0
  const walk = (n: TNode | null, d: number) => {
    if (!n) return
    walk(n.left, d + 1)
    nodes.push({ id: n.id, label: n.val, x: x++ * 0.75, y: d * 1.1, cls: opt.cls?.get(n.id), sub: opt.sub?.get(n.id) })
    walk(n.right, d + 1)
    for (const c of [n.left, n.right]) if (c) edges.push({ from: n.id, to: c.id, cls: opt.edgeCls?.get(c.id) })
  }
  walk(root, 0)
  return { kind: 'graph', label: opt.label, nodes, edges }
}

/** 一般(多叉)樹的排版:葉子依序排,父節點置中 */
export interface GNode {
  id: number
  label: string
  children: GNode[]
}

export function forestView(root: GNode, opt: { label?: string; cls?: Map<number, string>; sub?: Map<number, string> } = {}): GraphViewData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let leaf = 0
  const place = (n: GNode, d: number): number => {
    let x: number
    if (!n.children.length) x = leaf++
    else {
      const xs = n.children.map((c) => place(c, d + 1))
      x = (xs[0] + xs[xs.length - 1]) / 2
    }
    nodes.push({ id: n.id, label: n.label, x: x * 0.8, y: d * 1.05, cls: opt.cls?.get(n.id), sub: opt.sub?.get(n.id) })
    for (const c of n.children) edges.push({ from: n.id, to: c.id })
    return x
  }
  place(root, 0)
  return { kind: 'graph', label: opt.label, nodes, edges }
}
