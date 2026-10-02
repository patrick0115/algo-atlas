import type { GraphViewData } from '../types'

// 節點座標用抽象單位(1 單位 = 一個節點間距),這裡換算成像素。
const UNIT = 64
const R = 20
const PAD = 34

export function GraphView({ data }: { data: GraphViewData }) {
  const { nodes, edges } = data
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(0, ...xs)
  const minY = Math.min(0, ...ys)
  const w = (Math.max(0, ...xs) - minX) * UNIT + PAD * 2
  const h = (Math.max(0, ...ys) - minY) * UNIT + PAD * 2 + 10
  const pos = new Map(nodes.map((n) => [n.id, { x: (n.x - minX) * UNIT + PAD, y: (n.y - minY) * UNIT + PAD }]))

  return (
    <div className="graph-view">
      {data.label && <div className="view-label">{data.label}</div>}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          {['', 'hl', 'done', 'dim'].map((c) => (
            <marker key={c} id={`arrow-${c || 'base'}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={`arrowhead ${c}`} />
            </marker>
          ))}
        </defs>
        {edges.map((e, i) => {
          const a = pos.get(e.from)
          const b = pos.get(e.to)
          if (!a || !b) return null
          const dx = b.x - a.x
          const dy = b.y - a.y
          const len = Math.hypot(dx, dy) || 1
          // 縮短線段,不要畫進圓裡
          const x1 = a.x + (dx / len) * R
          const y1 = a.y + (dy / len) * R
          const x2 = b.x - (dx / len) * (R + (e.directed ? 3 : 0))
          const y2 = b.y - (dy / len) * (R + (e.directed ? 3 : 0))
          return (
            <g key={i} className={`edge ${e.cls ?? ''}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={e.directed ? `url(#arrow-${e.cls || 'base'})` : undefined} />
              {e.label !== undefined && (
                <text x={(a.x + b.x) / 2 - (dy / len) * 10} y={(a.y + b.y) / 2 + (dx / len) * 10 + 4} className="edge-label">
                  {e.label}
                </text>
              )}
            </g>
          )
        })}
        {nodes.map((n) => {
          const p = pos.get(n.id)!
          return (
            <g key={n.id} className={`node ${n.cls ?? ''}`} transform={`translate(${p.x},${p.y})`}>
              <circle r={R} />
              <text y={5}>{n.label}</text>
              {n.sub !== undefined && n.sub !== '' && (
                <text y={R + 14} className="node-sub">
                  {n.sub}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
