import type { GridViewData } from '../types'

export function GridView({ data }: { data: GridViewData }) {
  const { cells, rowLabels, colLabels, marks = {} } = data
  const clsAt = new Map<string, string[]>()
  for (const [cls, list] of Object.entries(marks)) {
    for (const [r, c] of list) {
      const k = `${r},${c}`
      clsAt.set(k, [...(clsAt.get(k) ?? []), cls])
    }
  }
  return (
    <div className="grid-view">
      {data.label && <div className="view-label">{data.label}</div>}
      <table className="grid">
        {colLabels && (
          <thead>
            <tr>
              {rowLabels && <th />}
              {colLabels.map((c, j) => (
                <th key={j}>{c}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {cells.map((row, i) => (
            <tr key={i}>
              {rowLabels && <th>{rowLabels[i]}</th>}
              {row.map((v, j) => (
                <td key={j} className={(clsAt.get(`${i},${j}`) ?? []).map((c) => `g-${c}`).join(' ')}>
                  {v ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
