import { describe, expect, it } from 'vitest'
import { backfill, type LogEntry } from '../src/engine/progress'
import { conversion, dailyCounts, punctuality, recent, streak, weekly } from '../src/engine/rhythm'

const DAY = 86_400_000
/** 本地時間某天中午,避開時區與夏令時間的邊界 */
const at = (m: number, d: number) => new Date(2026, m - 1, d, 12).getTime()

describe('作答紀錄', () => {
  it('舊資料補成紀錄:第一次和最後一次各一筆,同一時間只補一筆', () => {
    const log = backfill({
      1: { status: 'ok', at: at(10, 5), first: at(10, 1) },
      2: { status: 'no', at: at(10, 3) },
    })
    expect(log.map((e) => [e.id, e.at])).toEqual([
      [1, at(10, 1)],
      [2, at(10, 3)],
      [1, at(10, 5)],
    ])
  })
})

describe('刷題節奏', () => {
  const log: LogEntry[] = [
    { id: 1, s: 'no', at: at(10, 20) },
    { id: 2, s: 'ok', at: at(10, 21) },
    { id: 2, s: 'ok', at: at(10, 21) + 1000 },
    { id: 3, s: 'fuzzy', at: at(10, 22) },
    { id: 1, s: 'ok', at: at(10, 21) },
    { id: 4, s: 'ok', at: at(10, 10) },
  ]

  it('同一天同一題只算一次', () => {
    expect(dailyCounts(log).get('2026-10-21')).toBe(2)
  })

  it('今天還沒寫不算斷;最長連續找得到起點', () => {
    const s = streak(dailyCounts(log), at(10, 23))
    expect(s.current).toBe(3)
    expect(s.longest).toBe(3)
    expect(s.longestStart).toBe(new Date(2026, 9, 20).getTime())
    expect(streak(dailyCounts(log), at(10, 25)).current).toBe(0)
  })

  it('每週只算第一次寫的題目', () => {
    const w = weekly(log, at(10, 23), 3)
    expect(w.map((x) => x.count)).toEqual([1, 0, 3])
  })

  it('不會 → 會 的轉換', () => {
    expect(conversion(log)).toEqual({ from: 2, turned: 1 })
  })

  it('複習準時:不會隔 1 天重寫算準時,拖到 5 天不算', () => {
    expect(punctuality([{ id: 1, s: 'no', at: at(10, 1) }, { id: 1, s: 'ok', at: at(10, 2) }])).toEqual({ total: 1, onTime: 1 })
    expect(punctuality([{ id: 1, s: 'no', at: at(10, 1) }, { id: 1, s: 'ok', at: at(10, 6) }])).toEqual({ total: 1, onTime: 0 })
  })

  it('最近紀錄附上前一個狀態,新的排前面', () => {
    const r = recent(log, 2)
    expect(r[0].entry.id).toBe(3)
    expect(r[1]).toMatchObject({ entry: { id: 2 }, prev: 'ok' })
    expect(recent(log, 10).find((x) => x.entry.id === 1 && x.entry.s === 'ok')?.prev).toBe('no')
  })
})
