import { describe, expect, it } from 'vitest'
import { PROBLEMS } from '../src/data/problems'
import { CATEGORIES } from '../src/data/categories'
import { PRO } from '../src/data/pro'
import { addDays, buildPlan, extraPool, extrasFor, nextUp, schedule, STAGES, weekStart, weeksLeft } from '../src/engine/plan'
import type { Record_ } from '../src/engine/progress'

const full = buildPlan(PROBLEMS, { skipPaid: false })
const free = buildPlan(PROBLEMS, { skipPaid: true })
const stagePatterns = STAGES.flatMap((s) => s.patterns)
const DIFF = { Easy: 0, Medium: 1, Hard: 2 }

describe('路線', () => {
  it('收齊 NeetCode 150,跳過付費題時只少付費題', () => {
    expect(full).toHaveLength(150)
    expect(new Set(full.map((it) => it.problem.id)).size).toBe(150)
    expect(free).toHaveLength(150 - PROBLEMS.filter((p) => p.lists.includes('neetcode150') && p.paid).length)
    expect(free.every((it) => !it.problem.paid)).toBe(true)
  })

  it('每一題的主要演算法都排進了某個階段', () => {
    const missing = full.filter((it) => !stagePatterns.includes(it.problem.patterns[0])).map((it) => `${it.problem.id}:${it.problem.patterns[0]}`)
    expect(missing).toEqual([])
  })

  it('階段裡的演算法 id 都存在,且不重複', () => {
    const ids = new Set(CATEGORIES.flatMap((c) => c.patterns.map((p) => p.id)))
    expect(stagePatterns.filter((id) => !ids.has(id))).toEqual([])
    expect(new Set(stagePatterns).size).toBe(stagePatterns.length)
  })

  it('先修的演算法排在前面', () => {
    const bad = stagePatterns.flatMap((id, i) =>
      (PRO[id]?.prereq ?? []).filter((pre) => stagePatterns.includes(pre) && stagePatterns.indexOf(pre) > i).map((pre) => `${pre} 應在 ${id} 前`),
    )
    expect(bad).toEqual([])
  })

  it('Hard 全部在最後;前面同一個演算法內 Easy 在 Medium 前', () => {
    const firstHard = full.findIndex((it) => it.problem.difficulty === 'Hard')
    expect(full.slice(firstHard).every((it) => it.problem.difficulty === 'Hard')).toBe(true)
    expect(full.slice(firstHard).every((it) => it.stage.id === 'hard')).toBe(true)
    for (let i = 1; i < firstHard; i++) {
      const [a, b] = [full[i - 1].problem, full[i].problem]
      if (a.patterns[0] === b.patterns[0]) expect(DIFF[a.difficulty]).toBeLessThanOrEqual(DIFF[b.difficulty])
    }
  })
})

// 2026-10-14(三)中午;那週星期一是 10/12
const NOW = new Date(2026, 9, 14, 12).getTime()
const MON = new Date(2026, 9, 12).getTime()
const rec = (t: number): Record_ => ({ status: 'ok', at: t, first: t })

describe('每週排程', () => {
  it('weekStart 回到星期一 00:00', () => {
    expect(weekStart(NOW)).toBe(MON)
    expect(weekStart(MON)).toBe(MON)
    expect(weekStart(new Date(2026, 9, 18, 23).getTime())).toBe(MON) // 星期日還算同一週
  })

  it('什麼都沒寫:每週切 perWeek 題,週數 = ceil(題數 / perWeek)', () => {
    const s = schedule(full, {}, NOW, 7)
    expect(s.weeks).toHaveLength(Math.ceil(150 / 7))
    expect(s.weeks.slice(0, -1).every((w) => w.items.length === 7)).toBe(true)
    expect(s.weeks[0].start).toBe(MON)
    expect(s.weeks[1].start).toBe(addDays(MON, 7))
    expect(s.done).toBe(0)
  })

  it('本週寫過的算進本週額度,上週寫過的歸到「之前」', () => {
    const lastWeek = addDays(MON, -3)
    const store = {
      [full[0].problem.id]: rec(lastWeek),
      [full[5].problem.id]: rec(MON + 3600_000),
      [full[6].problem.id]: rec(NOW),
    }
    const s = schedule(full, store, NOW, 7)
    expect(s.earlier.map((it) => it.problem.id)).toEqual([full[0].problem.id])
    expect(s.doneThisWeek).toBe(2)
    expect(s.done).toBe(3)
    expect(s.weeks[0].items).toHaveLength(7)
    // 本週 = 寫過的 2 題 + 路線上下一批沒寫的 5 題
    expect(s.weeks[0].items.slice(2).map((it) => it.problem.id)).toEqual([1, 2, 3, 4, 7].map((i) => full[i].problem.id))
  })

  it('舊紀錄沒有 first 時用 at', () => {
    const store = { [full[0].problem.id]: { status: 'no' as const, at: NOW } }
    expect(schedule(full, store, NOW, 7).doneThisWeek).toBe(1)
  })

  it('本週已超額:本週只放寫過的,下週照常', () => {
    const store = Object.fromEntries(full.slice(0, 9).map((it) => [it.problem.id, rec(NOW)]))
    const s = schedule(full, store, NOW, 7)
    expect(s.weeks[0].items).toHaveLength(9)
    expect(s.weeks[1].items[0].problem.id).toBe(full[9].problem.id)
  })

  it('weeksLeft 含本週與目標那週', () => {
    expect(weeksLeft(NOW, NOW)).toBe(1)
    expect(weeksLeft(NOW, new Date(2026, 9, 19).getTime())).toBe(2)
    expect(weeksLeft(NOW, new Date(2025, 0, 1).getTime())).toBe(0)
  })

  it('nextUp 跳過寫過的和已經排進今天的', () => {
    const store = { [full[0].problem.id]: rec(NOW) }
    const ids = nextUp(full, store, [full[1].problem.id], 2).map((it) => it.problem.id)
    expect(ids).toEqual([full[2].problem.id, full[3].problem.id])
  })
})

describe('加練', () => {
  const pool = extraPool(PROBLEMS, { skipPaid: true })
  const sch = schedule(free, {}, NOW, 7)

  it('題池不含 NeetCode 150、不含付費題', () => {
    expect(pool.length).toBeGreaterThan(100)
    expect(pool.some((p) => p.lists.includes('neetcode150') || p.paid)).toBe(false)
  })

  it('每週的加練都跟那週核心題同演算法,同一題不會出現兩次', () => {
    const ex = extrasFor(sch.weeks, pool, {}, NOW)
    const seen = new Set<number>()
    ex.forEach((list, i) => {
      const pats = new Set(sch.weeks[i].items.map((it) => it.problem.patterns[0]))
      for (const it of list) {
        expect(pats.has(it.problem.patterns[0])).toBe(true)
        expect(seen.has(it.problem.id)).toBe(false)
        seen.add(it.problem.id)
      }
      expect(list.length).toBeLessThanOrEqual(5)
    })
    expect(ex[0]).toHaveLength(5)
  })

  it('本週寫過的加練留在本週,再補到至少 2 題可選;更早寫過的不再出現', () => {
    const ex0 = extrasFor(sch.weeks, pool, {}, NOW)[0]
    const store = {
      ...Object.fromEntries(ex0.slice(0, 4).map((it) => [it.problem.id, rec(NOW)])),
      [ex0[4].problem.id]: rec(addDays(MON, -2)),
    }
    const now0 = extrasFor(sch.weeks, pool, store, NOW)[0]
    expect(now0.slice(0, 4).map((it) => it.problem.id)).toEqual(ex0.slice(0, 4).map((it) => it.problem.id))
    expect(now0.slice(4).every((it) => !store[it.problem.id])).toBe(true)
    expect(now0.length).toBe(6)
    expect(now0.some((it) => it.problem.id === ex0[4].problem.id)).toBe(false)
  })
})
