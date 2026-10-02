import { describe, expect, it } from 'vitest'
import { PROBLEMS } from '../src/data/problems'
import { dueProblems, makeQuiz } from '../src/engine/review'

const DAY = 86_400_000

describe('複習排程', () => {
  it('不會 1 天後到期、會 14 天後到期', () => {
    const now = 100 * DAY
    const store = {
      1: { status: 'no' as const, at: now - 2 * DAY },
      2: { status: 'ok' as const, at: now - 2 * DAY },
      3: { status: 'fuzzy' as const, at: now - 5 * DAY },
    }
    expect(dueProblems(PROBLEMS, store, now).map((p) => p.id)).toEqual([3, 1])
  })
})

describe('模式辨識測驗', () => {
  it('4 個不重複選項,恰好一個是這題的演算法', () => {
    for (let k = 0; k < 200; k++) {
      const q = makeQuiz(PROBLEMS)!
      expect(new Set(q.options).size).toBe(4)
      expect(q.options.filter((o) => q.problem.patterns.includes(o))).toEqual([q.answer])
      expect(q.problem.curated).toBe(true)
    }
  })
})
