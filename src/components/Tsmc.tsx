import { useMemo, useState } from 'react'
import { TSMC, TSMC_DATE, TSMC_TOPICS, type TsmcEntry } from '../data/tsmc'
import { SOLUTIONS } from '../solutions'
import { HR_SOLUTIONS } from '../solutions/hr'
import type { HrSolution } from '../solutions/types'
import type { Status } from '../types'
import { rich } from './Blocks'
import { STATUS, SolutionBody, bodySections, nameOf } from './SolutionPage'
import { Toc } from './Toc'

// 台積電 HackerRank 衝刺(#/tsmc)與 HackerRank 單題題解頁(#/h/<slug>)。
// 進度用 slug 當鍵,和 LeetCode 的複習進度分開存,不進複習排程。

const KEY = 'lcv:hr:v1'
type HrStore = Record<string, { status: Status; at: number }>

function load(): HrStore {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

function useHrProgress() {
  const [store, setStore] = useState<HrStore>(load)
  const mark = (slug: string, status: Status | null) => {
    const next = { ...load() }
    if (status) next[slug] = { status, at: Date.now() }
    else delete next[slug]
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* 儲存失敗就只留在畫面上 */
    }
    setStore(next)
  }
  return { store, mark }
}

const hrUrl = (slug: string) => `https://www.hackerrank.com/challenges/${slug}/problem`
const BY_SLUG = new Map(TSMC.map((e) => [e.slug, e]))
/** 有題解的題目,照衝刺清單順序(上一題 / 下一題用) */
const SOLVED = TSMC.filter((e) => HR_SOLUTIONS[e.slug])

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

export function TsmcPage() {
  const { store } = useHrProgress()
  const done = TSMC.filter((e) => store[e.slug]?.status === 'ok').length
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
        已標「會」{done} / {TSMC.length} 題 · 已有題解 {SOLVED.length} 題
      </p>

      <h2>比例分配</h2>
      <div className="table-scroll">
        <table className="sum-table">
          <thead>
            <tr>
              <th>主題</th>
              <th>比重</th>
              <th>題數</th>
              <th>為什麼</th>
            </tr>
          </thead>
          <tbody>
            {TSMC_TOPICS.map((t) => (
              <tr key={t.id}>
                <td>
                  <a href={`#/tsmc`} onClick={(ev) => { ev.preventDefault(); document.getElementById(`tsmc-${t.id}`)?.scrollIntoView({ behavior: 'smooth' }) }}>
                    {t.name}
                  </a>
                </td>
                <td>{t.weight}%</td>
                <td>{TSMC.filter((e) => e.topic === t.id).length}</td>
                <td>{t.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {TSMC_TOPICS.map((t) => (
        <section key={t.id} id={`tsmc-${t.id}`} className="sec">
          <h2>{t.name}</h2>
          <ol className="q-index">
            {TSMC.filter((e) => e.topic === t.id).map((e) => {
              const st = store[e.slug]?.status
              return (
                <li key={e.slug}>
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
                    {st && <span className={`plan-status st-${st}`}>✓ {STATUS.find((x) => x.id === st)!.label}</span>}
                  </span>
                </li>
              )
            })}
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
