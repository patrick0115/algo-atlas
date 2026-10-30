import type { Problem, Status } from '../types'
import type { LogEntry, Record_ } from './progress'
import { INTERVAL_DAYS } from './review'
import { weekStart } from './plan'
import { CATEGORIES } from '../data/categories'

// 刷題節奏:全部從作答紀錄(log)算出來,只做計算、不碰畫面。

const DAY = 86_400_000

/** 本地時間的日期鍵,例:2026-10-24 */
export function dayKey(t: number): string {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayStart(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** 每天寫了幾題(同一天同一題只算一次);id 可以是 LeetCode 題號或 HackerRank slug */
export function dailyCounts(log: { id: number | string; at: number }[]): Map<string, number> {
  const seen = new Map<string, Set<number | string>>()
  for (const e of log) {
    const k = dayKey(e.at)
    if (!seen.has(k)) seen.set(k, new Set())
    seen.get(k)!.add(e.id)
  }
  return new Map([...seen].map(([k, s]) => [k, s.size]))
}

export interface Streak {
  current: number
  longest: number
  /** 最長那段的第一天 */
  longestStart: number | null
}

/** 連續天數;今天還沒寫不算斷,從昨天往回數 */
export function streak(daily: Map<string, number>, now: number): Streak {
  let current = 0
  let t = dayStart(now)
  if (!daily.has(dayKey(t))) t -= DAY
  while (daily.has(dayKey(t))) {
    current++
    t = dayStart(t - DAY / 2)
  }

  const days = [...daily.keys()].sort()
  let longest = 0
  let longestStart: number | null = null
  let run = 0
  let runStart = 0
  let prev = 0
  for (const k of days) {
    const [y, m, d] = k.split('-').map(Number)
    const ts = new Date(y, m - 1, d).getTime()
    if (run && dayStart(prev + DAY + DAY / 2) === ts) run++
    else {
      run = 1
      runStart = ts
    }
    if (run > longest) {
      longest = run
      longestStart = runStart
    }
    prev = ts
  }
  return { current, longest, longestStart }
}

/** 近 n 週每週寫了幾題(第一次寫的新題,不含複習);最後一個是本週 */
export function weekly(log: LogEntry[], now: number, n: number): { start: number; count: number }[] {
  const firstAt = new Map<number, number>()
  for (const e of log) if (!firstAt.has(e.id) || e.at < firstAt.get(e.id)!) firstAt.set(e.id, e.at)
  const ws = weekStart(now)
  const weeks = Array.from({ length: n }, (_, i) => ({ start: weekStart(ws - (n - 1 - i) * 7 * DAY + DAY), count: 0 }))
  for (const t of firstAt.values()) {
    const w = weeks.find((x) => x.start === weekStart(t))
    if (w) w.count++
  }
  return weeks
}

export interface CategoryProgress {
  id: string
  name: string
  /** 標成「會」的 */
  ok: number
  /** 寫過的(任何狀態) */
  done: number
  /** 分母:NeetCode 清單裡屬於這一類的題目,加上清單外但寫過的 */
  total: number
}

export function categoryProgress(problems: Problem[], store: Record<number, Record_>): CategoryProgress[] {
  return CATEGORIES.map((c) => {
    const ids = new Set(c.patterns.map((p) => p.id))
    const pool = problems.filter((p) => p.patterns.some((x) => ids.has(x)) && (p.lists.length > 0 || store[p.id]))
    return {
      id: c.id,
      name: c.name,
      ok: pool.filter((p) => store[p.id]?.status === 'ok').length,
      done: pool.filter((p) => store[p.id]).length,
      total: pool.length,
    }
  }).filter((c) => c.total > 0)
}

export function statusCounts(store: Record<number, Record_>): Record<Status, number> {
  const out: Record<Status, number> = { ok: 0, fuzzy: 0, no: 0 }
  for (const r of Object.values(store)) out[r.status]++
  return out
}

function byProblem(log: LogEntry[]): Map<number, LogEntry[]> {
  const m = new Map<number, LogEntry[]>()
  for (const e of [...log].sort((a, b) => a.at - b.at)) {
    if (!m.has(e.id)) m.set(e.id, [])
    m.get(e.id)!.push(e)
  }
  return m
}

/** 曾經標過「不會 / 模糊」的題目,後來變成「會」的比例 */
export function conversion(log: LogEntry[]): { from: number; turned: number } {
  let from = 0
  let turned = 0
  for (const es of byProblem(log).values()) {
    const i = es.findIndex((e) => e.s !== 'ok')
    if (i < 0) continue
    from++
    if (es.slice(i + 1).some((e) => e.s === 'ok')) turned++
  }
  return { from, turned }
}

/** 複習準時率:同一題相鄰兩筆紀錄,後一筆落在到期日後一天以內算準時 */
export function punctuality(log: LogEntry[]): { total: number; onTime: number } {
  let total = 0
  let onTime = 0
  for (const es of byProblem(log).values()) {
    for (let i = 1; i < es.length; i++) {
      const due = es[i - 1].at + INTERVAL_DAYS[es[i - 1].s] * DAY
      total++
      if (es[i].at <= due + DAY) onTime++
    }
  }
  return { total, onTime }
}

export interface Recent {
  entry: LogEntry
  /** 這題上一筆的狀態;沒有就是新題 */
  prev: Status | null
}

export function recent(log: LogEntry[], n: number): Recent[] {
  const sorted = [...log].sort((a, b) => a.at - b.at)
  const last = new Map<number, Status>()
  const out: Recent[] = []
  for (const e of sorted) {
    out.push({ entry: e, prev: last.get(e.id) ?? null })
    last.set(e.id, e.s)
  }
  return out.slice(-n).reverse()
}
