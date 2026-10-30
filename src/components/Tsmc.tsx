import { useMemo, useState } from 'react'
import { TSMC, TSMC_DATE, TSMC_TOPICS, type TsmcEntry } from '../data/tsmc'
import { SOLUTIONS } from '../solutions'
import { HR_SOLUTIONS } from '../solutions/hr'
import type { HrSolution } from '../solutions/types'
import type { Difficulty, Status } from '../types'
import { firstMarks, hrSchedule, loadHrLog, useHrProgress, type HrStore } from '../engine/hr'
import { loadLog } from '../engine/progress'
import { dayKey, streak } from '../engine/rhythm'
import { rich } from './Blocks'
import { Heatmap, mergedDaily } from './Rhythm'
import { STATUS, SolutionBody, bodySections, nameOf } from './SolutionPage'
import { Toc } from './Toc'

// 台積電 HackerRank 衝刺(#/tsmc)與 HackerRank 單題題解頁(#/h/<slug>)。
// 衝刺頁上半是倒數到測驗日的每天進度與節奏,下半是照主題分的題目清單。

const PLAN_KEY = 'lcv:hr:plan:v1'

const hrUrl = (slug: string) => `https://www.hackerrank.com/challenges/${slug}/problem`
const BY_SLUG = new Map(TSMC.map((e) => [e.slug, e]))
/** 有題解的題目,照衝刺清單順序(上一題 / 下一題用) */
const SOLVED = TSMC.filter((e) => HR_SOLUTIONS[e.slug])

const DIFF_RANK: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 }
/** 每天進度的出題順序:主題照比重(TSMC_TOPICS 已照比重排),同主題 Easy 在前 */
const ORDER = TSMC_TOPICS.flatMap((t) =>
  TSMC.filter((e) => e.topic === t.id).sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty]),
).map((e) => e.slug)

const md = (t: number) => {
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

/** 測驗日期 YYYY-MM-DD;空字串是還沒填 */
function useExamDate(): [string, (v: string) => void] {
  const [exam, setExam] = useState<string>(() => {
    try {
      return JSON.parse(localStorage.getItem(PLAN_KEY) ?? '{}').exam ?? ''
    } catch {
      return ''
    }
  })
  const update = (v: string) => {
    setExam(v)
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify({ exam: v }))
    } catch {
      /* 儲存失敗就只在這次瀏覽有效 */
    }
  }
  return [exam, update]
}

function Similar({ e }: { e: TsmcEntry }) {
  if (!e.lc) return null
  return SOLUTIONS[e.lc] ? (
    <a className="tag" href={`#/q/${e.lc}`}>
      類似 LC {e.lc}
    </a>
  ) : (
    <span className="tag">類似 LC {e.lc}</span>
  )
}

function Row({ e, store, mark }: { e: TsmcEntry; store: HrStore; mark?: (slug: string, s: Status | null) => void }) {
  const st = store[e.slug]?.status
  return (
    <li>
      <span>
        {HR_SOLUTIONS[e.slug] ? <a href={`#/h/${e.slug}`}>{e.title}</a> : <b>{e.title}</b>}
        <span className="zh">{e.titleZh}</span>
        <br />
        <span className="muted">{e.key}</span>
      </span>
      <span className="plan-meta">
        <span className={`diff diff-${e.difficulty}`}>{e.difficulty}</span>
        <Similar e={e} />
        <a className="tag" href={hrUrl(e.slug)} target="_blank" rel="noreferrer">
          HackerRank ↗
        </a>
        {mark ? (
          <span className="mark-buttons">
            {STATUS.map((s) => (
              <button key={s.id} className={st === s.id ? 'primary small' : 'small'} onClick={() => mark(e.slug, st === s.id ? null : s.id)}>
                {s.label}
              </button>
            ))}
          </span>
        ) : (
          st && <span className={`plan-status st-${st}`}>✓ {STATUS.find((x) => x.id === st)!.label}</span>
        )}
      </span>
    </li>
  )
}

export function TsmcPage() {
  const { store, mark } = useHrProgress()
  const [exam, setExam] = useExamDate()
  const [now] = useState(() => Date.now())
  const hrLog = useMemo(() => loadHrLog(), [store])
  const daily = useMemo(() => mergedDaily(loadLog(), hrLog), [hrLog])
  const st = streak(daily, now)
  const ok = TSMC.filter((e) => store[e.slug]?.status === 'ok').length
  const done = TSMC.filter((e) => store[e.slug]).length
  const sch = exam ? hrSchedule(ORDER, store, firstMarks(hrLog), now, parseYmd(exam)) : null
  const today = sch?.days[0].slugs ?? []
  const todayDone = today.filter((s) => store[s]).length

  return (
    <div className="page">
      <h1>台積電 HackerRank 衝刺</h1>
      <p className="lead">
        台積電軟體、IT 職缺的第一關常是 HackerRank 線上測驗:3 題、90 分鐘,難度多半是 Easy / Easy / Medium 或 Easy / Medium / Medium,
        題目偏陣列和字串處理,要顧很多邊界情況。下面 60 題照常考比例分配,大部分來自 HackerRank 面試準備題組(Interview Preparation Kit)。
      </p>
      <div className="c-note c-note-tip">
        <b>注意 · 比例是估計</b>
        <p>比例依網路面試心得整理,不是官方資料;每年題目和及格線都會變。題目資料抓取日期 {TSMC_DATE}。</p>
      </div>
      <p className="legend">
        已標「會」{ok} / {TSMC.length} 題 · 已有題解 {SOLVED.length} 題
      </p>

      <h2>每天進度</h2>
      <div className="plan-settings">
        <label>
          測驗日期 <input type="date" value={exam} min={dayKey(now)} onChange={(ev) => setExam(ev.target.value)} />
        </label>
      </div>
      {!sch ? (
        <p className="muted">填上測驗日期,還沒寫的題目會從今天平均排到測驗前一天:先排常考的字串、陣列,同主題 Easy 在前。</p>
      ) : (
        <>
          <div className="plan-stats">
            <div>
              <b>{sch.daysLeft} 天</b>
              <span>測驗前還能寫的天數(含今天)</span>
            </div>
            <div>
              <b>
                {todayDone}/{today.length}
              </b>
              <span>今天(每天 {sch.perDay} 題就寫得完)</span>
            </div>
            <div>
              <b>
                {done}/{TSMC.length}
              </b>
              <span>寫過的題目</span>
            </div>
            <div>
              <b>{st.current} 天</b>
              <span>連續 · 最長 {st.longest} 天(含 LeetCode)</span>
            </div>
          </div>
          <div className="plan-bar" title={`${done}/${TSMC.length}`}>
            <i style={{ width: `${(done / TSMC.length) * 100}%` }} />
          </div>

          <section className="plan-today">
            <h2>今天寫這些</h2>
            {today.length === 0 ? (
              <p className="muted">60 題都寫過了。剩下的時間拿來重寫標「模糊 / 不會」的題目。</p>
            ) : (
              <ol className="q-index">
                {today.map((s) => (
                  <Row key={s} e={BY_SLUG.get(s)!} store={store} mark={mark} />
                ))}
              </ol>
            )}
          </section>

          {sch.days.length > 1 && (
            <details className="plan-later">
              <summary>之後每天({sch.days.length - 1} 天)</summary>
              {sch.days.slice(1).map((d) => (
                <section key={d.start} className="plan-week">
                  <header>
                    <b>{md(d.start)}</b>
                    <span className="plan-count">{d.slugs.length} 題</span>
                  </header>
                  <ol className="q-index">
                    {d.slugs.map((s) => (
                      <Row key={s} e={BY_SLUG.get(s)!} store={store} />
                    ))}
                  </ol>
                </section>
              ))}
            </details>
          )}
        </>
      )}

      <h2>節奏</h2>
      <Heatmap daily={daily} now={now} />
      <p className="muted small">
        和 LeetCode 合併算。完整統計在<a href="#/rhythm">刷題節奏</a>。
      </p>

      <h2>比例分配</h2>
      <div className="table-scroll">
        <table className="sum-table">
          <thead>
            <tr>
              <th>主題</th>
              <th>比重</th>
              <th>題數</th>
              <th>寫過</th>
              <th>為什麼</th>
            </tr>
          </thead>
          <tbody>
            {TSMC_TOPICS.map((t) => {
              const es = TSMC.filter((e) => e.topic === t.id)
              return (
                <tr key={t.id}>
                  <td>
                    <a href={`#/tsmc`} onClick={(ev) => { ev.preventDefault(); document.getElementById(`tsmc-${t.id}`)?.scrollIntoView({ behavior: 'smooth' }) }}>
                      {t.name}
                    </a>
                  </td>
                  <td>{t.weight}%</td>
                  <td>{es.length}</td>
                  <td>{es.filter((e) => store[e.slug]).length}</td>
                  <td>{t.why}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {TSMC_TOPICS.map((t) => (
        <section key={t.id} id={`tsmc-${t.id}`} className="sec">
          <h2>{t.name}</h2>
          <ol className="q-index">
            {TSMC.filter((e) => e.topic === t.id).map((e) => (
              <Row key={e.slug} e={e} store={store} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

export function HrSolutionPage({ sol }: { sol: HrSolution }) {
  const e = BY_SLUG.get(sol.slug)
  const { store, mark } = useHrProgress()
  const st = store[sol.slug]?.status
  const sections = useMemo(() => bodySections(sol), [sol])
  const at = SOLVED.findIndex((x) => x.slug === sol.slug)
  const prev = SOLVED[at - 1]
  const next = SOLVED[at + 1]

  return (
    <div className="page q-page">
      <div className="crumb">
        <a href="#/tsmc">台積電 HackerRank 衝刺</a>
        {e && (
          <>
            {' · '}
            <span className={`diff diff-${e.difficulty}`}>{e.difficulty}</span>
            {e.patterns.map((id) => (
              <a key={id} className="tag" href={`#/p/${id}`}>
                {nameOf(id)}
              </a>
            ))}
          </>
        )}
      </div>
      <h1 className="q-title">
        {e?.title ?? sol.slug}
        {e?.titleZh && <span className="q-zh">{e.titleZh}</span>}
      </h1>
      <p className="analogy">
        <b>白話</b>
        {rich(sol.plain)}
      </p>
      <div className="q-head">
        <a className="q-lc" href={hrUrl(sol.slug)} target="_blank" rel="noreferrer">
          到 HackerRank 寫 ↗
        </a>
        {e && <Similar e={e} />}
        <span className="muted">寫完標記:</span>
        <span className="mark-buttons">
          {STATUS.map((s) => (
            <button key={s.id} className={st === s.id ? 'primary' : ''} onClick={() => mark(sol.slug, st === s.id ? null : s.id)}>
              {s.label}
            </button>
          ))}
        </span>
      </div>
      <Toc sections={sections} back={{ href: '#/tsmc', label: '← 衝刺清單' }} />

      <SolutionBody sol={sol} self={`#/h/${sol.slug}`} />

      <nav className="pager">
        {prev ? (
          <a href={`#/h/${prev.slug}`}>
            <span className="muted">← 上一題</span>
            {prev.title}
            <span className="zh">{prev.titleZh}</span>
          </a>
        ) : (
          <span />
        )}
        <a href="#/tsmc" className="pager-plan">
          回到衝刺清單
        </a>
        {next && (
          <a href={`#/h/${next.slug}`} className="next">
            <span className="muted">下一題 →</span>
            {next.title}
            <span className="zh">{next.titleZh}</span>
          </a>
        )}
      </nav>
    </div>
  )
}
