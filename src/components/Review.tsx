import { useState } from 'react'
import type { Status } from '../types'
import { PROBLEMS } from '../data/problems'
import { TSMC } from '../data/tsmc'
import { findStub } from '../data/categories'
import { useProgress } from '../engine/progress'
import { useHrProgress } from '../engine/hr'
import { dueAt, dueFilter, dueProblems, INTERVAL_DAYS, makeMixedQuiz, type MixedQuiz, type QuizItem } from '../engine/review'

// 複習:模式辨識測驗 + 間隔複習到期清單。LeetCode 和 HackerRank 放在一起,各自寫回自己的進度。

const STATUS: { id: Status; label: string }[] = [
  { id: 'ok', label: '會' },
  { id: 'fuzzy', label: '模糊' },
  { id: 'no', label: '不會' },
]

const nameOf = (id: string) => findStub(id)?.stub.name ?? id

const lcHref = (slug: string) => `https://leetcode.com/problems/${slug}/`
const hrHref = (slug: string) => `https://www.hackerrank.com/challenges/${slug}/problem`

/** 把 LeetCode 精選題抹平成 QuizItem */
function lcItems(scope: Exclude<Scope, 'all' | 'tsmc'>): QuizItem[] {
  return PROBLEMS.filter((p) => p.curated && (scope === 'curated' || p.lists.includes(scope)))
    .map((p) => ({ platform: 'lc', id: p.id, title: p.title, titleZh: p.titleZh, difficulty: p.difficulty, patterns: p.patterns, reviewKey: p.key, href: lcHref(p.slug) }))
}
/** 台積電 HackerRank 題抹平成 QuizItem */
function hrItems(): QuizItem[] {
  return TSMC.map((e) => ({ platform: 'hr', id: e.slug, title: e.title, titleZh: e.titleZh, difficulty: e.difficulty, patterns: e.patterns, reviewKey: e.key, href: hrHref(e.slug) }))
}

type Scope = 'all' | 'curated' | 'blind75' | 'neetcode150' | 'tsmc'
const SCOPES: { id: Scope; label: string }[] = [
  { id: 'all', label: '全部(LeetCode＋HackerRank)' },
  { id: 'curated', label: 'LeetCode 精選題' },
  { id: 'blind75', label: 'Blind 75' },
  { id: 'neetcode150', label: 'NeetCode 150' },
  { id: 'tsmc', label: '台積電 HackerRank' },
]

function poolOf(scope: Scope): QuizItem[] {
  if (scope === 'tsmc') return hrItems()
  if (scope === 'all') return [...lcItems('curated'), ...hrItems()]
  return lcItems(scope)
}

function MarkButtons({ current, onMark }: { current?: Status; onMark: (s: Status) => void }) {
  return (
    <span className="mark-buttons">
      {STATUS.map((s) => (
        <button key={s.id} className={current === s.id ? 'primary' : ''} onClick={() => onMark(s.id)}>
          {s.label}
        </button>
      ))}
    </span>
  )
}

function ItemLink({ item }: { item: QuizItem }) {
  return (
    <a href={item.href} target="_blank" rel="noreferrer">
      {item.platform === 'lc' ? `${item.id}. ` : ''}
      {item.title}
      {item.titleZh && <span className="zh">{item.titleZh}</span>}
      {item.platform === 'hr' && <span className="muted"> · HackerRank</span>}
    </a>
  )
}

interface DueRow extends QuizItem {
  status: Status
  due: number
}

export function Review() {
  const { store, mark } = useProgress()
  const { store: hrStore, mark: hrMark } = useHrProgress()
  const [scope, setScope] = useState<Scope>('all')
  const [quiz, setQuiz] = useState<MixedQuiz | null>(() => makeMixedQuiz(poolOf('all')))
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const [now] = useState(() => Date.now())
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  /** 標記:照平台寫回各自的進度 */
  const markItem = (item: QuizItem, s: Status) => {
    if (item.platform === 'lc') mark(item.id as number, s)
    else hrMark(item.id as string, s)
  }
  const statusOf = (item: QuizItem): Status | undefined =>
    item.platform === 'lc' ? store[item.id as number]?.status : hrStore[item.id as string]?.status

  // 到期複習:兩個平台合起來,最早到期排前面
  const lcDue: DueRow[] = dueProblems(PROBLEMS, store, now).map((p) => ({
    platform: 'lc', id: p.id, title: p.title, titleZh: p.titleZh, difficulty: p.difficulty, patterns: p.patterns, reviewKey: p.key, href: lcHref(p.slug),
    status: store[p.id].status, due: dueAt(store[p.id]),
  }))
  const hrDue: DueRow[] = dueFilter(TSMC, (e) => hrStore[e.slug], now).map((e) => ({
    platform: 'hr', id: e.slug, title: e.title, titleZh: e.titleZh, difficulty: e.difficulty, patterns: e.patterns, reviewKey: e.key, href: hrHref(e.slug),
    status: hrStore[e.slug].status, due: dueAt(hrStore[e.slug]),
  }))
  const due = [...lcDue, ...hrDue].sort((a, b) => a.due - b.due)

  const next = (s: Scope = scope) => {
    setQuiz(makeMixedQuiz(poolOf(s)))
    setPicked(null)
  }
  const choose = (id: string) => {
    if (picked || !quiz) return
    setPicked(id)
    setScore((sc) => ({ right: sc.right + (quiz.item.patterns.includes(id) ? 1 : 0), total: sc.total + 1 }))
  }
  const toggle = (key: string) => {
    const nx = new Set(revealed)
    if (nx.has(key)) nx.delete(key)
    else nx.add(key)
    setRevealed(nx)
  }
  const rowKey = (r: QuizItem) => `${r.platform}:${r.id}`

  return (
    <div className="page">
      <h1>複習</h1>
      <p className="lead">
        面試真正考的是「看到題目,想得到要用哪個演算法」。下面的測驗只給你題目名稱,先選演算法,再看答案和解題關鍵。
        LeetCode 和 HackerRank 的題目放在一起複習。
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
          {SCOPES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="muted">
          本次答對 {score.right} / {score.total}
        </span>
      </div>
      {quiz && (
        <div className="quiz">
          <div className="quiz-q">
            <ItemLink item={quiz.item} /> <span className={`diff diff-${quiz.item.difficulty}`}>{quiz.item.difficulty}</span>
          </div>
          <div className="muted">這題主要用什麼演算法?</div>
          <div className="quiz-options">
            {quiz.options.map((id) => {
              const correct = quiz.item.patterns.includes(id)
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
                <b>{quiz.item.patterns.includes(picked) ? '答對了。' : '答錯了。'}</b>
                這題用到:
                {quiz.item.patterns.map((id, i) => (
                  <span key={id}>
                    {i > 0 && '、'}
                    <a href={`#/p/${id}`}>{nameOf(id)}</a>
                  </span>
                ))}
              </p>
              {quiz.item.reviewKey && (
                <p>
                  <b>解題關鍵</b> {quiz.item.reviewKey}
                </p>
              )}
              <p className="quiz-actions">
                <span className="muted">我對這題:</span>
                <MarkButtons current={statusOf(quiz.item)} onMark={(s) => markItem(quiz.item, s)} />
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
        在任何題目清單標記狀態後,會自動排程:不會 → {INTERVAL_DAYS.no} 天後、模糊 → {INTERVAL_DAYS.fuzzy} 天後、會 → {INTERVAL_DAYS.ok} 天後再出現在這裡。重新標記就會往後排。LeetCode 和 HackerRank 一起排。
      </p>
      {due.length === 0 ? (
        <p className="muted">目前沒有到期的題目。</p>
      ) : (
        <div className="problem-list">
          <table>
            <tbody>
              {due.map((r) => {
                const key = rowKey(r)
                return (
                  <tr key={key}>
                    <td>
                      <ItemLink item={r} />
                      <div className="tags">
                        {r.patterns.map((id) => (
                          <a key={id} className="tag" href={`#/p/${id}`}>
                            {nameOf(id)}
                          </a>
                        ))}
                      </div>
                    </td>
                    <td className={`key${revealed.has(key) ? '' : ' hidden'}`} onClick={() => toggle(key)}>
                      {revealed.has(key) ? (r.reviewKey ?? '依官方標籤歸類') : '· · ·'}
                    </td>
                    <td className="status">
                      <MarkButtons current={statusOf(r)} onMark={(s) => markItem(r, s)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
