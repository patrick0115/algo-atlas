import type { View } from '../types'
import { LABEL, legendOf } from './legend-data'

export function Legend({ views }: { views: View[] }) {
  const keys = legendOf(views)
  if (!keys.length) return null
  return (
    <div className="legend-row" aria-label="圖例">
      {keys.map((k) => (
        <span key={k} className="legend-item">
          <i className={`sw sw-${k}`} />
          {LABEL[k]}
        </span>
      ))}
    </div>
  )
}
