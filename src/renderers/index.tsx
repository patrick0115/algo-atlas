import type { View } from '../types'
import { ArrayView } from './ArrayView'
import { GridView } from './GridView'
import { GraphView } from './GraphView'
import { KVView } from './KVView'

// 新增渲染器:在 types.ts 的 View 加一種 kind,這裡加一個 case。
export function renderView(v: View, key: number) {
  switch (v.kind) {
    case 'array':
      return <ArrayView key={key} data={v} />
    case 'grid':
      return <GridView key={key} data={v} />
    case 'graph':
      return <GraphView key={key} data={v} />
    case 'kv':
      return <KVView key={key} data={v} />
  }
}
