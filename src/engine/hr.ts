import { useState } from 'react'
import type { Status } from '../types'
import { addDays } from './plan'

// HackerRank 衝刺的進度與作答紀錄。用 slug 當鍵,和 LeetCode 的複習進度分開存,不進複習排程。

const KEY = 'lcv:hr:v1'
const LOG_KEY = 'lcv:hr:log:v1'
const DAY = 86_400_000

export type HrStore = Record<string, { status: Status; at: number }>

export interface HrLogEntry {
  slug: string
  s: Status
  at: number
}

export function loadHr(): HrStore {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

/** 每標記一次記一筆;舊資料沒有紀錄,用最後標記時間補一筆 */
export function loadHrLog(): HrLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    if (raw) return JSON.parse(raw)
    const log = Object.entries(loadHr())
      .map(([slug, r]) => ({ slug, s: r.status, at: r.at }))
      .sort((a, b) => a.at - b.at)
    localStorage.setItem(LOG_KEY, JSON.stringify(log))
    return log
  } catch {
    return []
  }
}

export function useHrProgress() {
  const [store, setStore] = useState<HrStore>(loadHr)
  const mark = (slug: string, status: Status | null) => {
    // 先讀紀錄:沒有紀錄時會從舊進度補,要在寫入新進度之前
    const log = loadHrLog()
    const next = { ...loadHr() }
    const at = Date.now()
    if (status) next[slug] = { status, at }
    else delete next[slug]
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      if (status) localStorage.setItem(LOG_KEY, JSON.stringify([...log, { slug, s: status, at }]))
    } catch {
      /* 儲存失敗就只留在畫面上 */
    }
    setStore(next)
  }
  return { store, mark }
}

/** 每題第一次標記的時間 */
export function firstMarks(log: HrLogEntry[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const e of log) if (!m.has(e.slug) || e.at < m.get(e.slug)!) m.set(e.slug, e.at)
  return m
}

function dayStart(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export interface HrDay {
  start: number
  slugs: string[]
}

export interface HrSchedule {
  /** 今天(含)到測驗前一天還有幾天,至少 1 */
  daysLeft: number
  perDay: number
  /** days[0] 是今天:今天第一次寫的 + 補滿到 perDay 的下一批 */
  days: HrDay[]
}

/** 寫過的不動,沒寫的照 order 從今天平均排到測驗前一天;落後或超前都會自動重排 */
export function hrSchedule(order: string[], store: HrStore, first: Map<string, number>, now: number, exam: number): HrSchedule {
  const today = dayStart(now)
  const doneToday = order.filter((s) => store[s] && (first.get(s) ?? store[s].at) >= today)
  const todo = order.filter((s) => !store[s])
  const daysLeft = Math.max(1, Math.round((dayStart(exam) - today) / DAY))
  // 今天寫過的也算進分母,今天的份量才不會越寫越少
  const perDay = Math.ceil((todo.length + doneToday.length) / daysLeft)
  const fill = Math.max(0, perDay - doneToday.length)
  const days: HrDay[] = [{ start: today, slugs: [...doneToday, ...todo.slice(0, fill)] }]
  for (let i = fill, d = 1; i < todo.length; i += perDay, d++) {
    days.push({ start: addDays(today, d), slugs: todo.slice(i, i + perDay) })
  }
  return { daysLeft, perDay, days }
}
