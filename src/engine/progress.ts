import { useCallback, useEffect, useState } from 'react'
import type { Lang, Status } from '../types'

// 個人複習進度,存在 localStorage。只有自己用,不需要後端。

const KEY = 'lcv:progress:v1'

export interface Record_ {
  status: Status
  at: number // 最後標記時間 (ms)
}

type Store = Record<number, Record_>

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
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
    const next = load()
    if (status) next[id] = { status, at: Date.now() }
    else delete next[id]
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* 儲存失敗就只在這次瀏覽有效 */
    }
    listeners.forEach((f) => f())
  }, [])

  return { store, mark }
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('lcv:lang') as Lang) || 'python'
    } catch {
      return 'python'
    }
  })
  const set = (l: Lang) => {
    setLang(l)
    try {
      localStorage.setItem('lcv:lang', l)
    } catch {
      /* ignore */
    }
  }
  return [lang, set]
}
