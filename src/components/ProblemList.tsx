import { useState } from 'react'
import type { Difficulty, ListId, Problem, Status } from '../types'
import { useProgress } from '../engine/progress'
import { findStub } from '../data/categories'

const DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard']
const LIST_LABEL: Record<ListId, string> = { blind75: 'Blind 75', neetcode150: 'NeetCode 150', neetcode450: 'NeetCode 450' }
const STATUS: { id: Status; label: string }[] = [
  { id: 'ok', label: '會' },
  { id: 'fuzzy', label: '模糊' },
  { id: 'no', label: '不會' },
]
const PAGE = 60

type Scope = 'focus' | 'curated' | ListId | 'all'
type StatusFilter = 'all' | Status | 'none'

export function ProblemList({ problems, showPatterns = false, defaultScope = 'focus' }: { problems: Problem[]; showPatterns?: boolean; defaultScope?: Scope }) {
  const { store, mark } = useProgress()
  const [diff, setDiff] = useState<Difficulty | 'all'>('all')
  const [scope, setScope] = useState<Scope>(defaultScope)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [hidePaid, setHidePaid] = useState(true)
  const [hideKeys, setHideKeys] = useState(true)
  const [q, setQ] = useState('')
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [limit, setLimit] = useState(PAGE)

  const query = q.trim().toLowerCase()
  const shown = problems
    .filter((p) => !hidePaid || !p.paid)
    .filter((p) => diff === 'all' || p.difficulty === diff)
    .filter((p) => {
      if (scope === 'all') return true
      if (scope === 'focus') return p.curated || p.lists.length > 0
      if (scope === 'curated') return p.curated
      return p.lists.includes(scope)
    })
    .filter((p) => {
      const s = store[p.id]?.status
      return status === 'all' || (status === 'none' ? !s : s === status)
    })
    .filter((p) => !query || String(p.id) === query || p.title.toLowerCase().includes(query))
    // 精標的排前面,再依題號
    .sort((a, b) => Number(b.curated) - Number(a.curated) || a.id - b.id)

  const toggleReveal = (id: number) => {
    const next = new Set(revealed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setRevealed(next)
  }

  return (
    <div className="problem-list">
      <div className="filters">
        <select value={scope} onChange={(e) => { setScope(e.target.value as Scope); setLimit(PAGE) }}>
          <option value="focus">精選 + 高頻清單</option>
          <option value="curated">只看精選(有解題關鍵)</option>
          {Object.entries(LIST_LABEL).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
          <option value="all">全部題目</option>
        </select>
        <select value={diff} onChange={(e) => setDiff(e.target.value as Difficulty | 'all')}>
          <option value="all">全部難度</option>
          {DIFFS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="all">全部狀態</option>
          <option value="none">還沒標記</option>
          {STATUS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input type="search" placeholder="搜尋題號或標題" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={hideKeys} onChange={(e) => setHideKeys(e.target.checked)} />
          遮住解題關鍵
        </label>
        <label className="check">
          <input type="checkbox" checked={hidePaid} onChange={(e) => setHidePaid(e.target.checked)} />
          隱藏付費題
        </label>
        <span className="muted">{shown.length} 題</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>題目</th>
            <th>難度</th>
            <th>解題關鍵(點一下顯示)</th>
            <th>我的狀態</th>
          </tr>
        </thead>
        <tbody>
          {shown.slice(0, limit).map((p) => {
            const s = store[p.id]?.status
            const hidden = hideKeys && !revealed.has(p.id)
            return (
              <tr key={p.id}>
                <td className="num">{p.id}</td>
                <td>
                  <a href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noreferrer">
                    {p.title}
                  </a>
                  {p.paid && <span className="muted"> 🔒</span>}
                  <div className="tags">
                    {p.lists
                      .filter((l) => l !== 'neetcode450' || p.lists.length === 1)
                      .map((l) => (
                        <span key={l} className="tag">
                          {LIST_LABEL[l]}
                        </span>
                      ))}
                    {showPatterns &&
                      p.patterns.map((id) => (
                        <a key={id} className="tag" href={`#/p/${id}`}>
                          {findStub(id)?.stub.name ?? id}
                        </a>
                      ))}
                  </div>
                </td>
                <td>
                  <span className={`diff diff-${p.difficulty}`}>{p.difficulty}</span>
                </td>
                {p.key ? (
                  <td className={`key${hidden ? ' hidden' : ''}`} onClick={() => toggleReveal(p.id)}>
                    {hidden ? '· · ·' : p.key}
                  </td>
                ) : (
                  <td className="key hidden">依官方標籤歸類</td>
                )}
                <td className="status">
                  {STATUS.map((st) => (
                    <button key={st.id} className={s === st.id ? 'on' : ''} onClick={() => mark(p.id, s === st.id ? null : st.id)}>
                      {st.label}
                    </button>
                  ))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {shown.length > limit && (
        <button className="more" onClick={() => setLimit(limit + PAGE * 2)}>
          再顯示更多(還有 {shown.length - limit} 題)
        </button>
      )}
      {shown.length === 0 && <p className="muted">沒有符合條件的題目。試試把範圍改成「全部題目」。</p>}
    </div>
  )
}
