import { useState } from 'react'
import type { Difficulty, Status } from '../types'
import { PROBLEMS } from '../data/problems'
import { TSMC, type TsmcEntry } from '../data/tsmc'
import { findStub } from '../data/categories'
import { useProgress } from '../engine/progress'
import { useHrProgress } from '../engine/hr'
import { hasSolution } from '../solutions'
import { HR_SOLUTIONS } from '../solutions/hr'

// 今天刷什麼:每天推 2 題 LeetCode + 2 題 HackerRank,都從 Easy 開始、寫過的跳過。
// 寫完標「會 / 模糊 / 不會」,四題都寫完就「再來四題」。只存在本機。

const KEY = 'lcv:today:v1'
const PER = 2 // 每個平台每批幾題

const STATUS: { id: Status; label: string }[] = [
  { id: 'ok', label: '會' },
  { id: 'fuzzy', label: '模糊' },
  { id: 'no', label: '不會' },
]
const STATUS_LABEL = Object.fromEntries(STATUS.map((s) => [s.id, s.label])) as Record<Status, string>
const DIFF_RANK: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 }
const nameOf = (id: string) => findStub(id)?.stub.name ?? id

const BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]))
const BY_SLUG = new Map(TSMC.map((e) => [e.slug, e]))

// LeetCode 題庫:NeetCode 150、非付費,Easy → Medium → Hard,同難度通過率高(較簡單)的先
const LC_POOL = PROBLEMS.filter((p) => p.lists.includes('neetcode150') && !p.paid).sort(
  (a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || b.acRate - a.acRate || a.id - b.id,
)
// HackerRank 題庫:台積電 60 題,Easy → Medium → Hard,同難度成功率高的先
const HR_POOL = [...TSMC].sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || b.success - a.success)

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface Today {
  date: string
  lc: number[]
  hr: string[]
}

function loadToday(): Today {
  try {
    const t = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { date: t.date ?? '', lc: Array.isArray(t.lc) ? t.lc : [], hr: Array.isArray(t.hr) ? t.hr : [] }
  } catch {
    return { date: '', lc: [], hr: [] }
  }
}
function saveToday(t: Today) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t))
  } catch {
    /* 儲存失敗就只在這次瀏覽有效 */
  }
}

export function Plan() {
  const { store, mark } = useProgress()
  const { store: hrStore, mark: hrMark } = useHrProgress()
  const [now] = useState(() => Date.now())
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const todayStr = ymd(now)

  const lcDone = (id: number) => !!store[id]
  const hrDone = (slug: string) => !!hrStore[slug]
  const nextLc = (have: number[], n: number) => LC_POOL.filter((p) => !lcDone(p.id) && !have.includes(p.id)).slice(0, n).map((p) => p.id)
  const nextHr = (have: string[], n: number) => HR_POOL.filter((e) => !hrDone(e.slug) && !have.includes(e.slug)).slice(0, n).map((e) => e.slug)

  // 進頁時:換日把昨天寫完的拿掉,再補到各 2 題還沒寫的
  const [today, setToday] = useState<Today>(() => {
    const s = loadToday()
    let lc = s.date === todayStr ? [...s.lc] : s.lc.filter((id) => !lcDone(id))
    let hr = s.date === todayStr ? [...s.hr] : s.hr.filter((slug) => !hrDone(slug))
    const needLc = PER - lc.filter((id) => !lcDone(id)).length
    if (needLc > 0) lc = [...lc, ...nextLc(lc, needLc)]
    const needHr = PER - hr.filter((slug) => !hrDone(slug)).length
    if (needHr > 0) hr = [...hr, ...nextHr(hr, needHr)]
    const t: Today = { date: todayStr, lc, hr }
    saveToday(t)
    return t
  })

  const update = (t: Today) => {
    setToday(t)
    saveToday(t)
  }
  const more = () => update({ date: todayStr, lc: [...today.lc, ...nextLc(today.lc, PER)], hr: [...today.hr, ...nextHr(today.hr, PER)] })
  const toggle = (key: string) => {
    const nx = new Set(revealed)
    if (nx.has(key)) nx.delete(key)
    else nx.add(key)
    setRevealed(nx)
  }

  const allDone = today.lc.every(lcDone) && today.hr.every(hrDone)
  const total = today.lc.length + today.hr.length
  const done = today.lc.filter(lcDone).length + today.hr.filter(hrDone).length

  const lcRow = (id: number) => {
    const p = BY_ID.get(id)
    if (!p) return null
    const s = store[id]?.status
    const key = `lc:${id}`
    const hidden = !revealed.has(key)
    return (
      <li key={key} className={s ? 'done' : ''}>
        <div className="plan-today-head">
          <span className="plan-title">
            {hasSolution(id) ? (
              <a className="plan-solution" href={`#/q/${id}`} title="查看本站題解">
                {id}. {p.title}
              </a>
            ) : (
              <span>{id}. {p.title}</span>
            )}
            {p.titleZh && <span className="zh">{p.titleZh}</span>}
            <a className="plan-leetcode" href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noreferrer" title="在 LeetCode 開啟題目">
              LeetCode ↗
            </a>
          </span>
        </div>
        <div className="plan-today-body">
          <span className="plan-meta">
            <span className={`diff diff-${p.difficulty}`}>{p.difficulty}</span>
            {p.patterns[0] && (
              <a className="tag" href={`#/p/${p.patterns[0]}`} title="先看這個演算法的講義">
                {nameOf(p.patterns[0])}
              </a>
            )}
          </span>
          {p.key && (
            <button className={`plan-key${hidden ? ' hidden' : ''}`} onClick={() => toggle(key)}>
              {hidden ? '提示 · · ·' : p.key}
            </button>
          )}
        </div>
        <div className="plan-today-mark">
          <span className="muted">寫完標記:</span>
          <span className="mark-buttons">
            {STATUS.map((st) => (
              <button key={st.id} className={s === st.id ? 'primary' : ''} onClick={() => mark(id, s === st.id ? null : st.id)}>
                {st.label}
              </button>
            ))}
          </span>
        </div>
      </li>
    )
  }

  const hrRow = (slug: string) => {
    const e: TsmcEntry | undefined = BY_SLUG.get(slug)
    if (!e) return null
    const s = hrStore[slug]?.status
    const key = `hr:${slug}`
    const hidden = !revealed.has(key)
    return (
      <li key={key} className={s ? 'done' : ''}>
        <div className="plan-today-head">
          <span className="plan-title">
            {HR_SOLUTIONS[slug] ? (
              <a className="plan-solution" href={`#/h/${slug}`} title="查看本站題解">
                {e.title}
              </a>
            ) : (
              <span>{e.title}</span>
            )}
            {e.titleZh && <span className="zh">{e.titleZh}</span>}
            <a className="plan-leetcode" href={`https://www.hackerrank.com/challenges/${slug}/problem`} target="_blank" rel="noreferrer" title="在 HackerRank 開啟題目">
              HackerRank ↗
            </a>
          </span>
        </div>
        <div className="plan-today-body">
          <span className="plan-meta">
            <span className={`diff diff-${e.difficulty}`}>{e.difficulty}</span>
            {e.patterns[0] && (
              <a className="tag" href={`#/p/${e.patterns[0]}`} title="先看這個演算法的講義">
                {nameOf(e.patterns[0])}
              </a>
            )}
          </span>
          {e.key && (
            <button className={`plan-key${hidden ? ' hidden' : ''}`} onClick={() => toggle(key)}>
              {hidden ? '提示 · · ·' : e.key}
            </button>
          )}
        </div>
        <div className="plan-today-mark">
          <span className="muted">寫完標記:</span>
          <span className="mark-buttons">
            {STATUS.map((st) => (
              <button key={st.id} className={s === st.id ? 'primary' : ''} onClick={() => hrMark(slug, s === st.id ? null : st.id)}>
                {st.label}
              </button>
            ))}
          </span>
        </div>
      </li>
    )
  }

  return (
    <div className="page plan">
      <h1>今天刷什麼</h1>
      <p className="lead">
        每天四題:2 題 LeetCode + 2 題 HackerRank,都從 Easy 開始、寫過的自動跳過。寫完標「會 / 模糊 / 不會」,四題都寫完就再來四題。
      </p>

      <div className="plan-stats">
        <div>
          <b>
            {done}/{total}
          </b>
          <span>今天這批({STATUS_LABEL.ok}的不再出現)</span>
        </div>
      </div>

      <section className="plan-today">
        <h2>LeetCode</h2>
        {today.lc.length === 0 ? (
          <p className="muted">NeetCode 150 的題目都寫過了。</p>
        ) : (
          <ol className="plan-today-list">{today.lc.map(lcRow)}</ol>
        )}
      </section>

      <section className="plan-today">
        <h2>HackerRank</h2>
        {today.hr.length === 0 ? (
          <p className="muted">台積電 60 題都寫過了。</p>
        ) : (
          <ol className="plan-today-list">{today.hr.map(hrRow)}</ol>
        )}
      </section>

      <p className="plan-today-foot">
        {allDone && (today.lc.length > 0 || today.hr.length > 0) ? (
          <button className="primary" onClick={more}>
            再來四題 →
          </button>
        ) : (
          <button className="small" onClick={more}>
            ＋ 再加四題
          </button>
        )}
        <a href="#/rhythm" className="muted">
          看進度統計 →
        </a>
      </p>
    </div>
  )
}
