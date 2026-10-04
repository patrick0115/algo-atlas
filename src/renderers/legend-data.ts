import type { View } from '../types'

// 圖例:只列出「這一幀真的出現的」狀態,看到什麼就解釋什麼。
// key 對應 CSS 的 .sw-<key>,外觀和各渲染器的同名狀態一致。

export const LABEL: Record<string, string> = {
  hl: '本步焦點',
  cmp: '正在比較',
  done: '已定案 / 已處理',
  dim: '已排除',
  range: '目前區間',
  queued: '排隊中',
  path: '路徑',
  land: '陸地',
  wall: '牆 / 障礙',
  dep: '這格依賴的格子',
  edge: '正在走的邊',
  'edge-done': '已選的邊',
  ptr: '指標',
}

const ORDER = Object.keys(LABEL)

// 渲染器裡的同義 class 合併成一個圖例項
const ALIAS: Record<string, string> = { cur: 'hl', visited: 'done' }

export function legendOf(views: View[]): string[] {
  const seen = new Set<string>()
  const add = (k: string | undefined) => {
    if (!k) return
    const key = ALIAS[k] ?? k
    if (LABEL[key]) seen.add(key)
  }
  for (const v of views) {
    if (v.kind === 'array') {
      if (v.highlight?.length) add('hl')
      if (v.compare?.length) add('cmp')
      if (v.done?.length) add('done')
      if (v.dim?.length) add('dim')
      if (v.range && v.range[1] >= v.range[0]) add('range')
      if (v.pointers?.length) add('ptr')
    } else if (v.kind === 'grid') {
      for (const [k, cells] of Object.entries(v.marks ?? {})) if (cells.length) add(k)
    } else if (v.kind === 'graph') {
      for (const n of v.nodes) n.cls?.split(/\s+/).forEach(add)
      for (const e of v.edges) {
        if (e.cls === 'hl') add('edge')
        else if (e.cls === 'done') add('edge-done')
        else if (e.cls === 'dim') add('dim')
      }
    } else if (v.kind === 'kv') {
      if (v.highlight?.length) add('hl')
    }
  }
  return ORDER.filter((k) => seen.has(k))
}
