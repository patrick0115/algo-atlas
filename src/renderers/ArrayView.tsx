import type { ArrayViewData } from '../types'

const CELL = 52 // px,和 CSS 的 --cell 一致
const BAR_H = 150

export function ArrayView({ data }: { data: ArrayViewData }) {
  const { values, pointers = [], range, highlight = [], compare = [], done = [], dim = [], mode = 'cells' } = data
  const ids = data.ids ?? values.map((_, i) => i)
  const hasRange = range && range[1] >= range[0]
  const bars = mode === 'bars'
  const nums = values.map((v) => (typeof v === 'number' ? v : 0))
  const max = Math.max(1, ...nums.map(Math.abs))

  // 同一格有多個指標時往下疊
  const stackAt = new Map<number, number>()
  const placed = pointers.map((p) => {
    const level = stackAt.get(p.index) ?? 0
    stackAt.set(p.index, level + 1)
    return { ...p, level }
  })
  const maxLevel = Math.max(0, ...placed.map((p) => p.level + 1))
  const width = Math.max(values.length, 1) * CELL

  // 依 id 排序後渲染,讓 React 保留同一個 DOM 節點 → left 變化會有 transition
  const order = values.map((v, i) => ({ v, i, id: ids[i] })).sort((a, b) => String(a.id).localeCompare(String(b.id)))

  return (
    <div className="array-view">
      {data.label && <div className="view-label">{data.label}</div>}
      <div className={`array-track${bars ? ' bars' : ''}`} style={{ width, height: bars ? BAR_H + 4 : undefined }}>
        {hasRange && (
          <div className="array-range" style={{ left: range[0] * CELL, width: (range[1] - range[0] + 1) * CELL }} />
        )}
        {order.map(({ v, i, id }) => {
          const cls = [
            'array-cell',
            done.includes(i) && 'is-done',
            compare.includes(i) && 'is-cmp',
            highlight.includes(i) && 'is-hl',
            dim.includes(i) && 'is-dim',
            hasRange && i >= range[0] && i <= range[1] && 'in-range',
          ]
            .filter(Boolean)
            .join(' ')
          if (bars) {
            const h = 18 + (Math.abs(nums[i]) / max) * (BAR_H - 18)
            return (
              <div key={id} className={`${cls} bar`} style={{ left: i * CELL, height: h, top: BAR_H - h }}>
                {v}
              </div>
            )
          }
          return (
            <div key={id} className={cls} style={{ left: i * CELL }}>
              {v}
            </div>
          )
        })}
      </div>
      <div className="array-index" style={{ width }}>
        {values.map((_, i) => (
          <span key={i} style={{ left: i * CELL }}>
            {i}
          </span>
        ))}
      </div>
      {placed.length > 0 && (
        <div className="array-pointers" style={{ width, height: maxLevel * 22 + 4 }}>
          {placed.map((p) => (
            <div
              key={p.name}
              className={`pointer ptr-${p.color ?? 'a'}`}
              style={{ transform: `translate(${p.index * CELL}px, ${p.level * 22}px)` }}
            >
              ▲ {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
