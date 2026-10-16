import { useMemo, useState, type ReactNode } from 'react'
import { CONCEPTS, unitOf } from '../concepts'
import type { Concept } from '../concepts/types'
import { findStub } from '../data/categories'
import { LEVEL_NAME } from '../data/pro'
import { PATTERNS } from '../patterns'
import { Blocks, rich } from './Blocks'
import { Toc } from './Toc'

export function ConceptPage({ c, pager }: { c: Concept; pager: ReactNode }) {
  const unit = unitOf(c.id)
  const sections = useMemo(
    () => [
      ...c.sections.map((s, i) => ({ id: `cs-${i}`, label: s.title })),
      { id: 'cs-pit', label: '常見錯誤' },
      { id: 'cs-quiz', label: '自我測驗' },
    ],
    [c],
  )

  return (
    <div className="page concept">
      <div className="crumb">
        基礎篇 · {unit?.name} <span className={`lv lv-${c.level}`}>{LEVEL_NAME[c.level]}</span>
      </div>
      <h1>{c.name}</h1>
      {c.prereq.length > 0 && (
        <p className="prereq">
          先讀過會更好懂:
          {c.prereq.map((p) => (
            <a key={p} href={`#/c/${p}`} className="chip">
              {CONCEPTS[p]?.name ?? p}
            </a>
          ))}
        </p>
      )}
      <Toc sections={sections} />

      <p className="lead">{rich(c.lead)}</p>
      {c.analogy && (
        <p className="analogy">
          <b>生活比喻</b>
          {rich(c.analogy)}
        </p>
      )}

      {c.sections.map((s, i) => (
        <section key={s.title} id={`cs-${i}`} className="sec c-sec">
          <h2>{s.title}</h2>
          <Blocks blocks={s.blocks} />
        </section>
      ))}

      <section id="cs-pit" className="sec c-sec">
        <h2>常見錯誤</h2>
        <ul className="c-list">
          {c.pitfalls.map((t, i) => (
            <li key={i}>{rich(t)}</li>
          ))}
        </ul>
      </section>

      <section id="cs-quiz" className="sec c-sec">
        <h2>自我測驗</h2>
        <Quiz c={c} />
      </section>

      {c.next.length > 0 && (
        <section className="sec">
          <h2>學完可以接著讀</h2>
          <p className="prereq">
            {c.next.map((id) => (
              <a key={id} href={`#/p/${id}`} className={`chip${PATTERNS[id] ? '' : ' todo'}`}>
                {findStub(id)?.stub.name ?? id}
              </a>
            ))}
          </p>
        </section>
      )}

      {pager}
    </div>
  )
}

function Quiz({ c }: { c: Concept }) {
  const [picked, setPicked] = useState<Record<number, number>>({})
  const answered = Object.keys(picked).length
  const right = c.quiz.filter((q, i) => picked[i] === q.a).length
  return (
    <>
      <p className="muted">
        每題點一個答案就會揭曉。已答 {answered} / {c.quiz.length},答對 {right} 題
        {answered > 0 && (
          <button className="ghost small" onClick={() => setPicked({})}>
            重來
          </button>
        )}
      </p>
      <ol className="sum-quiz">
        {c.quiz.map((q, i) => {
          const mine = picked[i]
          const done = mine !== undefined
          return (
            <li key={i}>
              <div className="sq-q">{rich(q.q)}</div>
              <div className="sq-opts">
                {q.options.map((o, j) => (
                  <button
                    key={j}
                    disabled={done}
                    className={done && j === q.a ? 'primary' : mine === j ? 'wrong' : ''}
                    onClick={() => setPicked({ ...picked, [i]: j })}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {done && (
                <p className="sq-why">
                  <b>{mine === q.a ? '答對 ✓' : '答錯 ✗'}</b> {rich(q.why)}
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}
