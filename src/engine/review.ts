import type { Problem, Status } from '../types'
import type { Record_ } from './progress'
import { CATEGORIES } from '../data/categories'

const DAY = 86_400_000

/** 標記後隔幾天再複習:不會的明天再看,會的兩週後確認一次 */
export const INTERVAL_DAYS: Record<Status, number> = { no: 1, fuzzy: 3, ok: 14 }

export function dueAt(r: Record_): number {
  return r.at + INTERVAL_DAYS[r.status] * DAY
}

/** 到期該複習的題目,最早到期的排前面 */
export function dueProblems(problems: Problem[], store: Record<number, Record_>, now: number): Problem[] {
  return problems
    .filter((p) => store[p.id] && dueAt(store[p.id]) <= now)
    .sort((a, b) => dueAt(store[a.id]) - dueAt(store[b.id]))
}

export interface Quiz {
  problem: Problem
  /** 選項(演算法 id),已打亂 */
  options: string[]
  /** 正確答案:題目的第一個(主要)演算法 */
  answer: string
}

const ALL_PATTERNS = CATEGORIES.flatMap((c) => c.patterns.map((p) => p.id))

/** 出一題「這題用什麼演算法?」;干擾選項不會是這題的任何一個演算法 */
export function makeQuiz(pool: Problem[], rand: () => number = Math.random): Quiz | null {
  const candidates = pool.filter((p) => p.curated && p.patterns.length > 0)
  if (!candidates.length) return null
  const problem = candidates[Math.floor(rand() * candidates.length)]
  const answer = problem.patterns[0]
  const others = ALL_PATTERNS.filter((id) => !problem.patterns.includes(id))
  const picks: string[] = []
  while (picks.length < 3 && others.length) picks.push(others.splice(Math.floor(rand() * others.length), 1)[0])
  const options = [answer, ...picks]
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  return { problem, options, answer }
}
