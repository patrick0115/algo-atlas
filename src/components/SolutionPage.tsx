import { useMemo, useState } from 'react'
import { PROBLEMS } from '../data/problems'
import { findStub } from '../data/categories'
import { buildPlan } from '../engine/plan'
import { useProgress } from '../engine/progress'
import { maxArrayLen, renderView } from '../renderers'
import { SOLUTIONS } from '../solutions'
import type { Approach, FigStep, HrSolution, Solution } from '../solutions/types'
import type { Problem, Status } from '../types'
import { MultiCode, rich } from './Blocks'
import { Toc } from './Toc'

// 單題題解頁(#/q/<題號>):題意 → 怎麼想 → 每個解法(想法、圖示、複雜度、五語言程式碼)→ 比較 → 常見錯誤。

export const STATUS: { id: Status; label: string }[] = [
  { id: 'ok', label: '會' },
  { id: 'fuzzy', label: '模糊' },
  { id: 'no', label: '不會' },
]
const NUM = ['一', '二', '三', '四', '五', '六']
const BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]))
export const nameOf = (id: string) => findStub(id)?.stub.name ?? id

/** 有題解的題目,依刷題藍圖的順序排(上一題 / 下一題用);不在藍圖裡的接在後面 */
export const SOLVED_ORDER: Problem[] = (() => {
  const plan = buildPlan(PROBLEMS, { skipPaid: false }).map((it) => it.problem)
  const inPlan = plan.filter((p) => SOLUTIONS[p.id])
  const rest = Object.keys(SOLUTIONS)
    .map(Number)
    .filter((id) => !inPlan.some((p) => p.id === id))
    .sort((a, b) => a - b)
    .flatMap((id) => (BY_ID.get(id) ? [BY_ID.get(id)!] : []))
  return [...inPlan, ...rest]
})()

function Figure({ fig }: { fig: { title: string; steps: FigStep[] } }) {
  const [i, setI] = useState(0)
  const s = fig.steps[i]
  return (
    <div className="q-fig">
      <div className="q-fig-title">圖示:{fig.title}</div>
      <div className="stage-views">{s.views.map((v, k) => renderView(v, k, maxArrayLen(s.views)))}</div>
      <div className="stage-note">
        <span className="note-step">
          {i + 1}/{fig.steps.length}
        </span>
        {rich(s.note)}
      </div>
      <div className="controls">
        <button onClick={() => setI(0)} disabled={i === 0}>
          ⏮
        </button>
        <button onClick={() => setI(i - 1)} disabled={i === 0}>
          ◀ 上一步
        </button>
        <button className="primary" onClick={() => setI(i + 1)} disabled={i === fig.steps.length - 1}>
          下一步 ▶
        </button>
        <input type="range" min={0} max={fig.steps.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-label="步驟" />
      </div>
    </div>
  )
}

function ApproachView({ a, n }: { a: Approach; n: number }) {
  return (
    <section id={`qa-${n}`} className="sec q-sec">
      <h2>
        方法{NUM[n]}:{a.name}
        <span className="q-cx">
          時間 {a.complexity.time} · 空間 {a.complexity.space}
        </span>
      </h2>
      <p className="c-p">{rich(a.idea)}</p>
      <div className="notes">
        <section>
          <h3>做法</h3>
          <ol>
            {a.steps.map((t, i) => (
              <li key={i}>{rich(t)}</li>
            ))}
          </ol>
        </section>
        <section className="complexity">
          <h3>複雜度</h3>
          <p>
            <b>時間</b>
            {a.complexity.time}
            <br />
            <b>空間</b>
            {a.complexity.space}
          </p>
          <p className="muted">{rich(a.complexity.why)}</p>
        </section>
      </div>
      <Figure fig={a.figure} />
      <MultiCode code={a.code} />
      <div className="c-note c-note-key">
        <b>評價 · 什麼時候選它</b>
        <p>{rich(a.verdict)}</p>
      </div>
    </section>
  )
}

/** SolutionBody 各段的目錄 */
export const bodySections = (sol: Solution | HrSolution) => [
  { id: 'qs-desc', label: '題意' },
  { id: 'qs-think', label: '怎麼想' },
  ...sol.approaches.map((_, i) => ({ id: `qa-${i}`, label: `方法${NUM[i]}` })),
  { id: 'qs-cmp', label: '比較' },
  { id: 'qs-pit', label: '常見錯誤' },
]

/** 題解內文:題意 → 怎麼想 → 每個解法 → 比較 → 常見錯誤。LeetCode 與 HackerRank 題解頁共用;self 是本頁網址 */
export function SolutionBody({ sol, self }: { sol: Solution | HrSolution; self: string }) {
  return (
    <>
      <section id="qs-desc" className="sec q-sec">
        <h2>題意</h2>
        <p className="lead">{rich(sol.statement)}</p>
        <div className="q-examples">
          {sol.examples.map((e, i) => (
            <div key={i} className="q-ex">
              <div>
                <span className="muted">輸入</span> <code>{e.input}</code>
              </div>
              <div>
                <span className="muted">輸出</span> <code>{e.output}</code>
              </div>
              {e.note && <div className="muted">{rich(e.note)}</div>}
            </div>
          ))}
        </div>
        <h3>限制條件告訴我們什麼</h3>
        <ul className="c-list">
          {sol.constraints.map((t, i) => (
            <li key={i}>{rich(t)}</li>
          ))}
        </ul>
      </section>

      <section id="qs-think" className="sec q-sec">
        <h2>怎麼想到解法</h2>
        <div className="c-note c-note-tip">
          <b>建議 · 先自己想 15 分鐘</b>
          <p>讀完題意先別往下捲,自己想一個暴力解、算它的複雜度,再看下面怎麼一步步優化。</p>
        </div>
        <ol className="c-list">
          {sol.insight.map((t, i) => (
            <li key={i}>{rich(t)}</li>
          ))}
        </ol>
      </section>

      {sol.approaches.map((a, i) => (
        <ApproachView key={a.name} a={a} n={i} />
      ))}

      <section id="qs-cmp" className="sec q-sec">
        <h2>方法比較</h2>
        <div className="table-scroll">
          <table className="sum-table">
            <thead>
              <tr>
                <th>方法</th>
                <th>時間</th>
                <th>空間</th>
                <th>什麼時候選它</th>
              </tr>
            </thead>
            <tbody>
              {sol.approaches.map((a, i) => (
                <tr key={a.name}>
                  <td>
                    <a href={self} onClick={(e) => { e.preventDefault(); document.getElementById(`qa-${i}`)?.scrollIntoView({ behavior: 'smooth' }) }}>
                      {NUM[i]}、{a.name}
                    </a>
                  </td>
                  <td>{a.complexity.time}</td>
                  <td>{a.complexity.space}</td>
                  <td>{rich(a.verdict)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="qs-pit" className="sec q-sec">
        <h2>常見錯誤</h2>
        <ul className="c-list">
          {sol.pitfalls.map((t, i) => (
            <li key={i}>{rich(t)}</li>
          ))}
        </ul>
        {sol.followUp && (
          <>
            <h3>延伸問題</h3>
            <dl className="variants">
              {sol.followUp.map((f, i) => (
                <div key={i}>
                  <dt>{rich(f.q)}</dt>
                  <dd>{rich(f.a)}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>
    </>
  )
}

export function SolutionPage({ sol }: { sol: Solution }) {
  const p = BY_ID.get(sol.id)
  const { store, mark } = useProgress()
  const st = store[sol.id]?.status
  const sections = useMemo(() => bodySections(sol), [sol])
  const at = SOLVED_ORDER.findIndex((x) => x.id === sol.id)
  const prev = SOLVED_ORDER[at - 1]
  const next = SOLVED_ORDER[at + 1]

  return (
    <div className="page q-page">
      <div className="crumb">
        <a href={`#/plan/${sol.id}`}>刷題藍圖</a>
        {' · '}
        <a href="#/q">題解</a>
        {p && (
          <>
            {' · '}
            <span className={`diff diff-${p.difficulty}`}>{p.difficulty}</span>
            {p.patterns.map((id) => (
              <a key={id} className="tag" href={`#/p/${id}`}>
                {nameOf(id)}
              </a>
            ))}
          </>
        )}
      </div>
      <h1 className="q-title">
        {sol.id}. {p?.title ?? ''}
        {p?.titleZh && <span className="q-zh">{p.titleZh}</span>}
      </h1>
      <p className="analogy">
        <b>白話</b>
        {rich(sol.plain)}
      </p>
      <div className="q-head">
        {p && (
          <a className="q-lc" href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noreferrer">
            到 LeetCode 寫 ↗
          </a>
        )}
        <span className="muted">寫完標記:</span>
        <span className="mark-buttons">
          {STATUS.map((s) => (
            <button key={s.id} className={st === s.id ? 'primary' : ''} onClick={() => mark(sol.id, st === s.id ? null : s.id)}>
              {s.label}
            </button>
          ))}
        </span>
      </div>
      <Toc sections={sections} back={{ href: `#/plan/${sol.id}`, label: '← 藍圖' }} />

      <SolutionBody sol={sol} self={`#/q/${sol.id}`} />

      <nav className="pager">
        {prev ? (
          <a href={`#/q/${prev.id}`}>
            <span className="muted">← 上一題</span>
            {prev.id}. {prev.title}
            {prev.titleZh && <span className="zh">{prev.titleZh}</span>}
          </a>
        ) : (
          <span />
        )}
        <a href={`#/plan/${sol.id}`} className="pager-plan">
          回到刷題藍圖
        </a>
        {next && (
          <a href={`#/q/${next.id}`} className="next">
            <span className="muted">下一題 →</span>
            {next.id}. {next.title}
            {next.titleZh && <span className="zh">{next.titleZh}</span>}
          </a>
        )}
      </nav>
    </div>
  )
}

/** 題解總覽(#/q):依刷題藍圖順序列出已經寫好題解的題目 */
export function SolutionIndex() {
  const { store } = useProgress()
  const total = PROBLEMS.filter((p) => p.lists.includes('neetcode150')).length
  const in150 = SOLVED_ORDER.filter((p) => p.lists.includes('neetcode150')).length
  return (
    <div className="page">
      <h1>題解</h1>
      <p>
        <a className="back-plan" href="#/plan">
          ← 回到刷題藍圖
        </a>
      </p>
      <p className="lead">
        每題都有:用自己的話重述的題意、從限制條件反推複雜度、怎麼一步步想到解法,以及多個解法 ——
        每個解法附逐步圖示、時間 / 空間複雜度與原因、五種語言的程式碼。依<a href="#/plan">刷題藍圖</a>的順序陸續補上。
      </p>
      <p className="legend">
        NeetCode 150 已完成 {in150} / {total} 題
      </p>
      <ol className="q-index">
        {SOLVED_ORDER.map((p) => {
          const s = SOLUTIONS[p.id]
          const st = store[p.id]?.status
          return (
            <li key={p.id}>
              <a href={`#/q/${p.id}`}>
                {p.id}. {p.title}
              </a>
              {p.titleZh && <span className="zh">{p.titleZh}</span>}
              <span className="plan-meta">
                <span className={`diff diff-${p.difficulty}`}>{p.difficulty}</span>
                <span className="muted">{s.approaches.length} 種解法 · 最佳 {s.approaches.at(-1)!.complexity.time}</span>
                {st && <span className={`plan-status st-${st}`}>✓ {STATUS.find((x) => x.id === st)!.label}</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
