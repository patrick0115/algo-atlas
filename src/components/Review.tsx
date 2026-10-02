import { useState } from 'react'
import type { ListId, Problem, Status } from '../types'
import { PROBLEMS } from '../data/problems'
import { findStub } from '../data/categories'
import { useProgress } from '../engine/progress'
import { dueProblems, INTERVAL_DAYS, makeQuiz, type Quiz } from '../engine/review'

const STATUS: { id: Status; label: string }[] = [
  { id: 'ok', label: '會' },
  { id: 'fuzzy', label: '模糊' },
  { id: 'no', label: '不會' },
]

const nameOf = (id: string) => findStub(id)?.stub.name ?? id

function MarkButtons({ id, current, onMark }: { id: number; current?: Status; onMark: (id: number, s: Status) => void }) {
  return (
    <span className="mark-buttons">
      {STATUS.map((s) => (
        <button key={s.id} className={current === s.id ? 'primary' : ''} onClick={() => onMark(id, s.id)}>
          {s.label}
        </button>
      ))}
    </span>
  )
}

function ProblemLink({ p }: { p: Problem }) {
  return (
    <a href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noreferrer">
      {p.id}. {p.title}
    </a>
  )
}

type Scope = 'curated' | ListId

export function Review() {
  const { store, mark } = useProgress()
  const [scope, setScope] = useState<Scope>('curated')
  const pool = PROBLEMS.filter((p) => p.curated && (scope === 'curated' || p.lists.includes(scope)))
  const [quiz, setQuiz] = useState<Quiz | null>(() => makeQuiz(pool))
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const [now] = useState(() => Date.now())
  const due = dueProblems(PROBLEMS, store, now)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const next = (s: Scope = scope) => {
    setQuiz(makeQuiz(PROBLEMS.filter((p) => p.curated && (s === 'curated' || p.lists.includes(s)))))
    setPicked(null)
  }
  const choose = (id: string) => {
    if (picked || !quiz) return
    setPicked(id)
    setScore((sc) => ({ right: sc.right + (quiz.problem.patterns.includes(id) ? 1 : 0), total: sc.total + 1 }))
  }

  return (
    <div className="page">
      <h1>複習</h1>
      <p className="lead">
        面試真正考的是「看到題目,想得到要用哪個演算法」。下面的測驗只給你題目名稱,先選演算法,再看答案和解題關鍵。
      </p>

      <h2>模式辨識測驗</h2>
      <div className="filters">
        <select
          value={scope}
          onChange={(e) => {
            const s = e.target.value as Scope
            setScope(s)
            next(s)
          }}
        >
          <option value="curated">全部精選題</option>
          <option value="blind75">Blind 75</option>
          <option value="neetcode150">NeetCode 150</option>
        </select>
        <span className="muted">
          本次答對 {score.right} / {score.total}
        </span>
      </div>
      {quiz && (
        <div className="quiz">
          <div className="quiz-q">
            <ProblemLink p={quiz.problem} /> <span className={`diff diff-${quiz.problem.difficulty}`}>{quiz.problem.difficulty}</span>
          </div>
          <div className="muted">這題主要用什麼演算法?</div>
          <div className="quiz-options">
            {quiz.options.map((id) => {
              const correct = quiz.problem.patterns.includes(id)
              const cls = picked ? (correct ? 'primary' : id === picked ? 'wrong' : 'ghost') : ''
              return (
                <button key={id} className={cls} onClick={() => choose(id)}>
                  {nameOf(id)}
                </button>
              )
            })}
          </div>
          {picked && (
            <div className="quiz-answer">
              <p>
                <b>{quiz.problem.patterns.includes(picked) ? '答對了。' : '答錯了。'}</b>
                這題用到:
                {quiz.problem.patterns.map((id, i) => (
                  <span key={id}>
                    {i > 0 && '、'}
                    <a href={`#/p/${id}`}>{nameOf(id)}</a>
                  </span>
                ))}
              </p>
              <p>
                <b>解題關鍵</b> {quiz.problem.key}
              </p>
              <p className="quiz-actions">
                <span className="muted">我對這題:</span>
                <MarkButtons id={quiz.problem.id} current={store[quiz.problem.id]?.status} onMark={(id, s) => mark(id, s)} />
                <button className="primary" onClick={() => next()}>
                  下一題 →
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      <h2>今天該複習的題目({due.length})</h2>
      <p className="muted">
        在任何題目清單標記狀態後,會自動排程:不會 → {INTERVAL_DAYS.no} 天後、模糊 → {INTERVAL_DAYS.fuzzy} 天後、會 → {INTERVAL_DAYS.ok} 天後再出現在這裡。重新標記就會往後排。
      </p>
      {due.length === 0 ? (
        <p className="muted">目前沒有到期的題目。</p>
      ) : (
        <div className="problem-list">
          <table>
            <tbody>
              {due.map((p) => (
                <tr key={p.id}>
                  <td>
                    <ProblemLink p={p} />
                    <div className="tags">
                      {p.patterns.map((id) => (
                        <a key={id} className="tag" href={`#/p/${id}`}>
                          {nameOf(id)}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td
                    className={`key${revealed.has(p.id) ? '' : ' hidden'}`}
                    onClick={() => setRevealed(new Set(revealed).add(p.id))}
                  >
                    {revealed.has(p.id) ? (p.key ?? '依官方標籤歸類') : '· · ·'}
                  </td>
                  <td className="status">
                    <MarkButtons id={p.id} current={store[p.id]?.status} onMark={(id, s) => mark(id, s)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
