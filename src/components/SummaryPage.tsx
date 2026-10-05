import { useState, type ReactNode } from 'react'
import type { Category } from '../data/categories'
import { PROBLEMS } from '../data/problems'
import { LEVEL_NAME, PRO } from '../data/pro'
import type { Summary } from '../data/summaries'
import { highlight } from '../engine/code'
import { useLang } from '../engine/progress'
import { LANGS } from '../types'
import { PATTERNS } from '../patterns'
import { Race } from './Race'
import { Toc } from './Toc'

const SECTIONS = [
  { id: 'sum-table', label: '① 總表' },
  { id: 'sum-race', label: '② 動畫比較' },
  { id: 'sum-decide', label: '③ 怎麼選' },
  { id: 'sum-family', label: '④ 家族' },
  { id: 'sum-insight', label: '⑤ 觀念' },
  { id: 'sum-builtin', label: '⑥ 內建排序' },
  { id: 'sum-uses', label: '⑦ 怎麼考' },
  { id: 'sum-quiz', label: '⑧ 自我測驗' },
]

/** 能放在一起比的動畫:輸入欄位和分類第一個演算法完全相同 */
function racers(cat: Category) {
  const ps = cat.patterns.flatMap((c) => (PATTERNS[c.id] ? [PATTERNS[c.id]] : []))
  const keys = (i: number) => ps[i].demo.inputs.map((x) => x.key).join(',')
  return ps.filter((_, i) => keys(i) === keys(0))
}

const byId = new Map(PROBLEMS.map((p) => [p.id, p]))

export function SummaryPage({ cat, sum, pager }: { cat: Category; sum: Summary; pager: ReactNode }) {
  const nameOf = (id: string) => cat.patterns.find((p) => p.id === id)?.name ?? id
  const Chip = ({ id }: { id: string }) => (
    <a href={`#/p/${id}`} className="chip">
      {nameOf(id)}
    </a>
  )

  return (
    <div className="page">
      <div className="crumb">{cat.name} · 總結</div>
      <h1>{cat.name}總結</h1>
      <Toc sections={SECTIONS.filter((s) => s.id !== 'sum-race' || sum.race)} />

      <p className="lead">{sum.lead}</p>

      <section id="sum-table" className="sec">
        <h2>一張表看完</h2>
        <div className="table-scroll">
          <table className="sum-table">
            <thead>
              <tr>
                <th>演算法</th>
                {sum.table.cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sum.table.rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <a href={`#/p/${r.id}`}>{nameOf(r.id)}</a>
                    {PRO[r.id] && <span className={`lv lv-${PRO[r.id].level}`}>{LEVEL_NAME[PRO[r.id].level]}</span>}
                  </td>
                  {r.cells.map((c, i) => (
                    <td key={i} className={c.startsWith('不') ? 'neg' : ''}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small-note">{sum.table.note}</p>
      </section>

      {sum.race && (
        <section id="sum-race" className="sec">
          <h2>動畫比較:同一組輸入一起跑</h2>
          <p className="lead small-lead">{sum.race.intro}</p>
          <Race
            patterns={racers(cat)}
            names={Object.fromEntries(cat.patterns.map((c) => [c.id, c.name]))}
            presets={sum.race.presets}
          />
        </section>
      )}

      <section id="sum-decide" className="sec">
        <h2>拿到題目,照順序問自己</h2>
        <ol className="decide">
          {sum.decide.map((d) => (
            <li key={d.q}>
              <div className="decide-q">{d.q}</div>
              <div className="decide-a">
                <span className="muted">是 →</span> {d.id ? <Chip id={d.id} /> : <b>語言內建 sort</b>}
              </div>
              <div className="decide-why muted">{d.why}</div>
            </li>
          ))}
        </ol>
      </section>

      <section id="sum-family" className="sec">
        <h2>其實是同一個想法</h2>
        <div className="family-grid">
          {sum.families.map((f) => (
            <div key={f.name} className="family">
              <h3>{f.name}</h3>
              <div className="family-ids">
                {f.ids.map((id, i) => (
                  <span key={id}>
                    {i > 0 && <span className="muted"> → </span>}
                    <Chip id={id} />
                  </span>
                ))}
              </div>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="sum-insight" className="sec">
        <h2>學完整章才看得到的觀念</h2>
        {sum.insights.map((t) => (
          <div key={t.title} className="pro-block">
            <h3>{t.title}</h3>
            <p>{t.body}</p>
          </div>
        ))}
      </section>

      <section id="sum-builtin" className="sec">
        <h2>內建排序:實際寫題時用的是它</h2>
        <Builtins sum={sum} />
      </section>

      <section id="sum-uses" className="sec">
        <h2>LeetCode 怎麼考{cat.name}</h2>
        <div className="family-grid">
          {sum.uses.map((u) => (
            <div key={u.title} className="family">
              <h3>{u.title}</h3>
              <p>{u.desc}</p>
              <ul className="use-problems">
                {u.problems.map((n) => {
                  const p = byId.get(n)
                  if (!p) return null
                  return (
                    <li key={n}>
                      <a href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noreferrer">
                        {p.id}. {p.title}
                      </a>{' '}
                      <span className={`diff diff-${p.difficulty}`}>{p.difficulty}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="sum-quiz" className="sec">
        <h2>自我測驗:這個情境該用哪一種?</h2>
        <Quiz sum={sum} cat={cat} />
      </section>

      <section className="sec">
        <h2>面試時怎麼講</h2>
        <ul className="sum-interview">
          {sum.interview.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      {pager}
    </div>
  )
}

function Builtins({ sum }: { sum: Summary }) {
  const [lang, setLang] = useLang()
  const b = sum.builtins.find((x) => x.lang === lang)
  return (
    <>
      <div className="table-scroll">
        <table className="sum-table">
          <thead>
            <tr>
              <th>語言</th>
              <th>怎麼呼叫</th>
              <th>背後的演算法</th>
              <th>要注意</th>
            </tr>
          </thead>
          <tbody>
            {sum.builtins.map((x) => (
              <tr key={x.lang} className={x.lang === lang ? 'on' : ''}>
                <td>{LANGS.find((l) => l.id === x.lang)?.label}</td>
                <td>
                  <code>{x.api}</code>
                </td>
                <td>{x.algo}</td>
                <td className="wrap">{x.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pro-block">
        <h3>
          範例 <span className="muted">{sum.example.title}</span>
        </h3>
        <div className="code-panel">
          <div className="tabs">
            {LANGS.map((l) => (
              <button key={l.id} className={l.id === lang ? 'active' : ''} onClick={() => setLang(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
          <pre className="tpl">
            {sum.example.code[lang].split('\n').map((l, i) => (
              <div key={i}>{l ? highlight(l, lang) : ' '}</div>
            ))}
          </pre>
        </div>
        {b && <p className="muted small-note">{b.note}</p>}
      </div>
    </>
  )
}

function Quiz({ sum, cat }: { sum: Summary; cat: Category }) {
  const [picked, setPicked] = useState<Record<number, string>>({})
  const answered = Object.keys(picked).length
  const right = sum.quiz.filter((q, i) => picked[i] === q.a).length

  return (
    <>
      <p className="muted">
        每題點一個答案就會揭曉。已答 {answered} / {sum.quiz.length},答對 {right} 題
        {answered > 0 && (
          <button className="ghost small" onClick={() => setPicked({})}>
            重來
          </button>
        )}
      </p>
      <ol className="sum-quiz">
        {sum.quiz.map((q, i) => {
          const mine = picked[i]
          return (
            <li key={q.q}>
              <div className="sq-q">{q.q}</div>
              <div className="sq-opts">
                {cat.patterns.map((p) => (
                  <button
                    key={p.id}
                    disabled={!!mine}
                    className={mine && p.id === q.a ? 'primary' : mine === p.id ? 'wrong' : ''}
                    onClick={() => setPicked({ ...picked, [i]: p.id })}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              {mine && (
                <p className="sq-why">
                  <b>{mine === q.a ? '答對 ✓' : '答錯 ✗'}</b> {q.why}
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}
