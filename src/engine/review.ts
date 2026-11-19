import type { Difficulty, Problem, Status } from '../types'
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

/**
 * 通用版到期篩選:給一串題目與「怎麼拿到它的進度紀錄」,挑出到期的、最早到期排前面。
 * LeetCode 和 HackerRank 共用這個(兩邊的進度紀錄都是 { status, at })。
 */
export function dueFilter<T>(items: T[], rec: (t: T) => Record_ | undefined, now: number): T[] {
  return items
    .filter((t) => { const r = rec(t); return !!r && dueAt(r) <= now })
    .sort((a, b) => dueAt(rec(a)!) - dueAt(rec(b)!))
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

// ---- 混合測驗:LeetCode 與 HackerRank 放在一起 ----

/** 測驗 / 複習共用的題目,兩個平台抹平成同一種形狀 */
export interface QuizItem {
  platform: 'lc' | 'hr'
  /** 原本的 id:LeetCode 數字題號、HackerRank slug */
  id: number | string
  title: string
  titleZh: string
  difficulty: Difficulty
  patterns: string[]
  /** 解題關鍵 */
  reviewKey?: string
  /** 本站連結(題解頁,沒有題解就是外站) */
  href: string
}

export interface MixedQuiz {
  item: QuizItem
  options: string[]
  answer: string
}

/** 和 makeQuiz 同邏輯,但吃抹平後的 QuizItem(可混兩個平台) */
export function makeMixedQuiz(pool: QuizItem[], rand: () => number = Math.random): MixedQuiz | null {
  const candidates = pool.filter((p) => p.patterns.length > 0)
  if (!candidates.length) return null
  const item = candidates[Math.floor(rand() * candidates.length)]
  const answer = item.patterns[0]
  const others = ALL_PATTERNS.filter((id) => !item.patterns.includes(id))
  const picks: string[] = []
  while (picks.length < 3 && others.length) picks.push(others.splice(Math.floor(rand() * others.length), 1)[0])
  const options = [answer, ...picks]
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  return { item, options, answer }
}
