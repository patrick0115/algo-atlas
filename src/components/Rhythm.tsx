import { useEffect, useMemo, useRef } from 'react'
import type { Status } from '../types'
import { PROBLEMS } from '../data/problems'
import { TSMC, TSMC_TOPICS } from '../data/tsmc'
import { SOLUTIONS } from '../solutions'
import { HR_SOLUTIONS } from '../solutions/hr'
import { loadLog, useProgress, type LogEntry } from '../engine/progress'
import { dueFilter, dueProblems } from '../engine/review'
import { loadHr, loadHrLog, type HrLogEntry, type HrStore } from '../engine/hr'
import { categoryProgress, conversion, dailyCounts, dayKey, punctuality, recent, statusCounts, streak, weekly, type AnyEntry } from '../engine/rhythm'

// 統計:熱力圖、每週題數、連續天數、各分類完成度、狀態分布、複習準時率、最近紀錄。
// LeetCode 和 HackerRank 全部合併算。

const DAY = 86_400_000
const LABEL: Record<Status, string> = { ok: '會', fuzzy: '模糊', no: '不會' }
const BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]))
const BY_SLUG = new Map(TSMC.map((e) => [e.slug, e]))

/** 一筆最近紀錄要連到哪、顯示什麼;數字是 LeetCode 題號,字串是 HackerRank slug */
function recentHref(id: number | string): string {
  if (typeof id === 'number') return SOLUTIONS[id] ? `#/q/${id}` : `https://leetcode.com/problems/${BY_ID.get(id)?.slug ?? ''}/`
  return Object.hasOwn(HR_SOLUTIONS, id) ? `#/h/${id}` : `https://www.hackerrank.com/challenges/${id}/problem`
}
function recentLabel(id: number | string): { num: string; title: string; zh?: string } {
  if (typeof id === 'number') {
    const p = BY_ID.get(id)
    return { num: `${id}. `, title: p?.title ?? String(id), zh: p?.titleZh }
  }
  const e = BY_SLUG.get(id)
  return { num: '', title: e?.title ?? String(id), zh: e?.titleZh }
}

/** 刷題進度設定的每週題數,當成每週目標線 */
function perWeek(): number {
  try {
    return JSON.parse(localStorage.getItem('lcv:plan:v1') ?? '{}').perWeek ?? 7
  } catch {
    return 7
  }
}

const md = (t: number) => {
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—')

/** HackerRank 紀錄轉成和 LeetCode 一樣形狀的紀錄(id 改用 slug) */
const hrAsEntries = (hrLog: HrLogEntry[]): AnyEntry[] => hrLog.map((e) => ({ id: e.slug, s: e.s, at: e.at }))

/** 熱力圖與連續天數:LeetCode 和 HackerRank 合併算,任一邊有寫那天就算有寫 */
export const mergedDaily = (log: LogEntry[], hrLog: HrLogEntry[]) => dailyCounts([...log, ...hrAsEntries(hrLog)])

/** 兩個平台的作答紀錄接成一條,給每週 / 轉化率 / 準時率 / 最近紀錄用 */
const mergedLog = (log: LogEntry[], hrLog: HrLogEntry[]): AnyEntry[] => [...log, ...hrAsEntries(hrLog)]

function useRhythm() {
  const { store } = useProgress()
  const log: LogEntry[] = useMemo(() => loadLog(), [store])
  const hrLog = useMemo(() => loadHrLog(), [])
  const hrStore: HrStore = useMemo(() => loadHr(), [])
  const now = Date.now()
  const daily = mergedDaily(log, hrLog)
  const merged = mergedLog(log, hrLog)
  return { store, hrStore, log, merged, now, daily, st: streak(daily, now) }
}

/** 所有狀態紀錄合起來(兩個平台) */
const allStatus = (store: Record<number, { status: Status }>, hrStore: HrStore) => [...Object.values(store), ...Object.values(hrStore)]
/** 今天到期的複習,兩個平台合計 */
const dueCount = (store: Record<number, { status: Status; at: number; first?: number }>, hrStore: HrStore, now: number) =>
  dueProblems(PROBLEMS, store, now).length + dueFilter(TSMC, (e) => hrStore[e.slug], now).length

/** 首頁頂端的摘要卡 */
export function RhythmCard() {
  const { store, hrStore, merged, now, st } = useRhythm()
  const target = perWeek()
  const weeks = weekly(merged, now, 12)
  const thisWeek = weeks[weeks.length - 1].count
  const sc = statusCounts(allStatus(store, hrStore))
  const due = dueCount(store, hrStore, now)
  const max = Math.max(target, ...weeks.map((w) => w.count))
  return (
    <section className="rhythm-card">
      <h2>
        統計 <a href="#/rhythm">看完整 →</a>
      </h2>
      <div className="plan-stats">
        <div>
          <b>{st.current} 天</b>
          <span>連續 · 最長 {st.longest} 天</span>
        </div>
        <div>
          <b>
            {thisWeek}/{target}
          </b>
          <span>本週新題</span>
        </div>
        <div>
          <b>
            {sc.ok} <small>模糊 {sc.fuzzy} · 不會 {sc.no}</small>
          </b>
          <span>標成「會」的題目</span>
        </div>
        <div>
          <b>{due}</b>
          <span>
            <a href="#/review">今天到期的複習</a>
          </span>
        </div>
      </div>
      <div className="spark" title="近 12 週每週新題數">
        {weeks.map((w) => (
          <i key={w.start} style={{ height: `${(w.count / Math.max(1, max)) * 100}%` }} title={`${md(w.start)} 那週 ${w.count} 題`} />
        ))}
      </div>
    </section>
  )
}

export function Heatmap({ daily, now }: { daily: Map<string, number>; now: number }) {
  // 53 週 × 7 天,最右一欄是本週;週一在最上面
  const end = new Date(now)
  end.setHours(0, 0, 0, 0)
  const todayIdx = (end.getDay() + 6) % 7
  const start = end.getTime() - (52 * 7 + todayIdx) * DAY
  const cols: { t: number; n: number }[][] = []
  for (let w = 0; w < 53; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const t = new Date(start + (w * 7 + d) * DAY + DAY / 2).getTime()
      col.push({ t, n: t > now ? -1 : (daily.get(dayKey(t)) ?? 0) })
    }
    cols.push(col)
  }
  // 手機上放不下一整年:預設捲到最右邊,先看到最近的日子
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (wrap.current) wrap.current.scrollLeft = wrap.current.scrollWidth
  }, [])
  const lv = (n: number) => (n < 0 ? 'out' : n === 0 ? 'h0' : n === 1 ? 'h1' : n <= 2 ? 'h2' : n <= 4 ? 'h3' : 'h4')
  return (
    <div className="heat-wrap" ref={wrap}>
      <div className="heat">
        {cols.map((col, i) => (
          <div key={i}>
            {col.map((c) => (
              <i key={c.t} className={lv(c.n)} title={c.n >= 0 ? `${dayKey(c.t)}:${c.n} 題` : ''} />
            ))}
          </div>
        ))}
      </div>
      <p className="muted small">
        近一年每天寫了幾題(含 HackerRank,同一題一天只算一次)。由淺到深:0、1、2、3–4、5 題以上。
      </p>
    </div>
  )
}

/** 一個平台的完成度表(各分類 / 各主題) */
function ProgressTable({ rows }: { rows: { id: string; name: string; ok: number; done: number; total: number }[] }) {
  return (
    <table className="cat-progress">
      <tbody>
        {rows.map((c) => (
          <tr key={c.id}>
            <th>{c.name}</th>
            <td>
              <div className="plan-bar" title={`會 ${c.ok} · 寫過 ${c.done} · 共 ${c.total}`}>
                <i style={{ width: `${(c.ok / c.total) * 100}%` }} />
                <i className="mid" style={{ width: `${((c.done - c.ok) / c.total) * 100}%` }} />
              </div>
            </td>
            <td className="num">
              {c.done}/{c.total}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Rhythm() {
  const { store, hrStore, merged, now, daily, st } = useRhythm()
  const target = perWeek()
  const weeks = weekly(merged, now, 12)
  const max = Math.max(target, ...weeks.map((w) => w.count), 1)
  const sc = statusCounts(allStatus(store, hrStore))
  const total = sc.ok + sc.fuzzy + sc.no
  const conv = conversion(merged)
  const pun = punctuality(merged)
  const cats = categoryProgress(PROBLEMS, store)
  const hrTopics = TSMC_TOPICS.map((t) => {
    const es = TSMC.filter((e) => e.topic === t.id)
    return {
      id: t.id,
      name: t.name,
      ok: es.filter((e) => hrStore[e.slug]?.status === 'ok').length,
      done: es.filter((e) => hrStore[e.slug]).length,
      total: es.length,
    }
  }).filter((t) => t.total > 0)
  const monthStart = new Date(now)
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthDays = [...daily.keys()].filter((k) => k >= dayKey(monthStart.getTime())).length
  const recents = recent(merged, 30)

  return (
    <div className="page rhythm">
      <h1>統計</h1>
      <p className="lead">
        每次在題目上標「會 / 模糊 / 不會」都會記一筆(LeetCode 和 HackerRank 都算)。這頁把紀錄整理成進度:哪幾天有寫、每週寫多少、哪一類還弱、複習有沒有準時。
        紀錄存在這個瀏覽器裡,換裝置會分開記。
      </p>

      {merged.length === 0 && daily.size === 0 ? (
        <p className="muted">
          還沒有紀錄。到<a href="#/plan">今天刷什麼</a>挑一題,寫完標記之後這裡就會開始累積。
        </p>
      ) : (
        <>
          <section className="sec">
            <h2>每天</h2>
            <Heatmap daily={daily} now={now} />
          </section>

          <div className="rhythm-two">
            <section>
              <h2>每週新題</h2>
              <div className="week-bars">
                <span className="goal" style={{ bottom: `${(target / max) * 100}%` }} title={`目標每週 ${target} 題`} />
                {weeks.map((w) => (
                  <div key={w.start} title={`${md(w.start)} 那週 ${w.count} 題`}>
                    <small>{w.count}</small>
                    <i style={{ height: `${(w.count / max) * 100}%` }} />
                  </div>
                ))}
              </div>
              <p className="muted small">
                近 12 週,只算第一次寫的題目(兩個平台合計)。橫線是目標(今天刷什麼設定每週 {target} 題)。
              </p>
            </section>
            <section>
              <h2>連續天數</h2>
              <div className="plan-stats one">
                <div>
                  <b>{st.current} 天</b>
                  <span>目前連續(今天還沒寫不算斷)</span>
                </div>
                <div>
                  <b>{st.longest} 天</b>
                  <span>最長連續{st.longestStart ? `,${dayKey(st.longestStart)} 起` : ''}</span>
                </div>
                <div>
                  <b>{monthDays} 天</b>
                  <span>這個月有寫的天數</span>
                </div>
              </div>
            </section>
          </div>

          <div className="rhythm-two">
            <section>
              <h2>各分類完成度</h2>
              <h3 className="muted small">LeetCode(NeetCode 清單)</h3>
              <ProgressTable rows={cats} />
              {hrTopics.length > 0 && (
                <>
                  <h3 className="muted small">台積電 HackerRank 主題</h3>
                  <ProgressTable rows={hrTopics} />
                </>
              )}
              <p className="muted small">實心是「會」,灰色是寫過但還沒標「會」。</p>
            </section>
            <section>
              <h2>狀態</h2>
              <table className="cat-progress">
                <tbody>
                  {(['ok', 'fuzzy', 'no'] as Status[]).map((s) => (
                    <tr key={s}>
                      <th>{LABEL[s]}</th>
                      <td>
                        <div className="plan-bar">
                          <i style={{ width: `${(sc[s] / Math.max(1, total)) * 100}%` }} />
                        </div>
                      </td>
                      <td className="num">{sc[s]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="plan-stats one">
                <div>
                  <b>{pct(conv.turned, conv.from)}</b>
                  <span>
                    不會 / 模糊 → 會({conv.turned}/{conv.from} 題)
                  </span>
                </div>
                <div>
                  <b>{pct(pun.onTime, pun.total)}</b>
                  <span>
                    複習準時率(到期後一天內重寫,{pun.onTime}/{pun.total} 次)
                  </span>
                </div>
              </div>
            </section>
          </div>

          <section className="sec">
            <h2>最近紀錄</h2>
            <ol className="recent">
              {recents.map(({ entry: e, prev }) => {
                const lb = recentLabel(e.id)
                return (
                  <li key={`${e.id}-${e.at}`}>
                    <span className="muted">{md(e.at)}</span>
                    <a href={recentHref(e.id)}>
                      {lb.num}
                      {lb.title}
                      {lb.zh && <span className="zh">{lb.zh}</span>}
                    </a>
                    <span>{prev ? `${LABEL[prev]} → ${LABEL[e.s]}` : `新 · ${LABEL[e.s]}`}</span>
                  </li>
                )
              })}
            </ol>
          </section>
        </>
      )}
    </div>
  )
}
