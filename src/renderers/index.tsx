import type { View } from '../types'
import { ArrayView } from './ArrayView'
import { GridView } from './GridView'
import { GraphView } from './GraphView'
import { KVView } from './KVView'

/** 同一幀所有陣列中最長的長度,讓多排陣列用同樣的格子大小 */
export function maxArrayLen(views: View[]): number {
  return Math.max(0, ...views.map((v) => (v.kind === 'array' ? v.values.length : 0)))
}

// 新增渲染器:在 types.ts 的 View 加一種 kind,這裡加一個 case。
export function renderView(v: View, key: number, maxLen: number) {
  switch (v.kind) {
    case 'array':
      return <ArrayView key={key} data={v} maxLen={maxLen} />
    case 'grid':
      return <GridView key={key} data={v} />
    case 'graph':
      return <GraphView key={key} data={v} />
    case 'kv':
      return <KVView key={key} data={v} />
  }
}
