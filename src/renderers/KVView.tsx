import type { KVViewData } from '../types'

export function KVView({ data }: { data: KVViewData }) {
  const hl = new Set(data.highlight ?? [])
  return (
    <div className="kv-view">
      {data.label && <div className="view-label">{data.label}</div>}
      <div className="kv-list">
        {data.entries.length === 0 && <span className="muted">(空)</span>}
        {data.entries.map(([k, v]) => (
          <div key={k} className={`kv${hl.has(k) ? ' is-hl' : ''}`}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
