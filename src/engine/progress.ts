import { useCallback, useEffect, useState } from 'react'
import type { Lang, Status } from '../types'

// 個人複習進度,存在 localStorage。只有自己用,不需要後端。

const KEY = 'lcv:progress:v1'

export interface Record_ {
  status: Status
  at: number // 最後標記時間 (ms)
  first?: number // 第一次標記時間 (ms);舊資料沒有,視同 at
}

type Store = Record<number, Record_>

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

// 作答紀錄:每標記一次記一筆,刷題節奏頁靠它算熱力圖、連續天數、複習準時率
const LOG_KEY = 'lcv:log:v1'

export interface LogEntry {
  id: number
  s: Status
  at: number
}

/** 舊資料只有「第一次」與「最後一次」,各補一筆;第一次的狀態不可考,沿用最後狀態 */
export function backfill(store: Store): LogEntry[] {
  const log: LogEntry[] = []
  for (const [k, r] of Object.entries(store)) {
    const id = Number(k)
    const first = r.first ?? r.at
    log.push({ id, s: r.status, at: first })
    if (r.at !== first) log.push({ id, s: r.status, at: r.at })
  }
  return log.sort((a, b) => a.at - b.at)
}

export function loadLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    if (raw) return JSON.parse(raw)
    const log = backfill(load())
    localStorage.setItem(LOG_KEY, JSON.stringify(log))
    return log
  } catch {
    return []
  }
}

function appendLog(e: LogEntry) {
  try {
    const log = loadLog()
    log.push(e)
    localStorage.setItem(LOG_KEY, JSON.stringify(log))
  } catch {
    /* 儲存失敗就不記 */
  }
}

const listeners = new Set<() => void>()

export function useProgress() {
  const [store, setStore] = useState<Store>(load)

  useEffect(() => {
    const sync = () => setStore(load())
    listeners.add(sync)
    return () => {
      listeners.delete(sync)
    }
  }, [])

  const mark = useCallback((id: number, status: Status | null) => {
    // 先確保舊資料已補成紀錄,再改進度,否則這次標記會被補成兩筆
    loadLog()
    const next = load()
    const prev = next[id]
    if (status) next[id] = { status, at: Date.now(), first: prev ? (prev.first ?? prev.at) : Date.now() }
    else delete next[id]
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* 儲存失敗就只在這次瀏覽有效 */
    }
    if (status) appendLog({ id, s: status, at: Date.now() })
    listeners.forEach((f) => f())
  }, [])

  return { store, mark }
}

// 語言偏好:同一頁有好幾個程式碼框時,切一個就全部一起切
let langNow: Lang = (() => {
  try {
    return (localStorage.getItem('lcv:lang') as Lang) || 'python'
  } catch {
    return 'python'
  }
})()
const langListeners = new Set<(l: Lang) => void>()

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(langNow)

  useEffect(() => {
    langListeners.add(setLang)
    return () => {
      langListeners.delete(setLang)
    }
  }, [])

  const set = useCallback((l: Lang) => {
    langNow = l
    try {
      localStorage.setItem('lcv:lang', l)
    } catch {
      /* ignore */
    }
    langListeners.forEach((f) => f(l))
  }, [])
  return [lang, set]
}
