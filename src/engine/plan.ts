import type { Difficulty, Problem } from '../types'
import type { Record_ } from './progress'

// 刷題藍圖:NeetCode 150 依「階段 → 演算法(先修在前)→ 難度」排成一條路線,再每週切 N 題。
// Hard 題第一輪先跳過,全部收到最後的「Hard 衝刺」,先把廣度鋪滿再啃硬題。

export interface Stage {
  id: string
  name: string
  /** 演算法 id;題目依「第一個(主要)演算法」歸到這裡。順序已照 pro.ts 的先修排好 */
  patterns: string[]
}

export const STAGES: Stage[] = [
  {
    id: 'basics',
    name: '基本功',
    patterns: ['hash-map', 'two-pointers', 'prefix-sum', 'string-ops', 'stack', 'binary-search', 'sliding-window', 'linked-list', 'fast-slow', 'merge-sort'],
  },
  {
    id: 'tree-heap',
    name: '樹、Heap 與單調結構',
    patterns: ['tree-dfs', 'tree-bfs', 'bst', 'lca', 'trie', 'heap', 'quick-sort', 'two-heaps', 'monotonic-stack', 'monotonic-queue', 'binary-search-answer'],
  },
  {
    id: 'search',
    name: '回溯、貪心與圖',
    patterns: ['backtracking', 'greedy', 'interval-scheduling', 'graph-traversal', 'topological-sort', 'union-find', 'dijkstra', 'mst'],
  },
  {
    id: 'dp',
    name: '動態規劃',
    patterns: ['dp-general', 'dp-1d', 'dp-grid', 'knapsack', 'lis', 'lcs', 'state-machine-dp', 'interval-dp'],
  },
  {
    id: 'misc',
    name: '數學與位元',
    patterns: ['math', 'bit-manipulation'],
  },
]

export const HARD_STAGE = { id: 'hard', name: 'Hard 衝刺' }

const PATTERN_RANK = new Map(STAGES.flatMap((s) => s.patterns).map((id, i) => [id, i]))
const STAGE_OF = new Map(STAGES.flatMap((s) => s.patterns.map((id) => [id, s])))
const DIFF_RANK: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 }

export interface PlanItem {
  problem: Problem
  stage: { id: string; name: string }
}

const rankOf = (p: Problem) => PATTERN_RANK.get(p.patterns[0]) ?? PATTERN_RANK.size

/** 同一個演算法內:Easy → Medium,同難度通過率高(較簡單)的先 */
const byEase = (a: Problem, b: Problem) =>
  DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || b.acRate - a.acRate || a.id - b.id

/** 整條路線。skipPaid 時拿掉付費題 */
export function buildPlan(problems: Problem[], { skipPaid }: { skipPaid: boolean }): PlanItem[] {
  const pool = problems.filter((p) => p.lists.includes('neetcode150') && !(skipPaid && p.paid))
  const main = pool
    .filter((p) => p.difficulty !== 'Hard')
    .sort((a, b) => rankOf(a) - rankOf(b) || byEase(a, b))
    .map((problem) => {
      const s = STAGE_OF.get(problem.patterns[0])
      return { problem, stage: s ? { id: s.id, name: s.name } : HARD_STAGE }
    })
  const hard = pool
    .filter((p) => p.difficulty === 'Hard')
    .sort((a, b) => rankOf(a) - rankOf(b) || byEase(a, b))
    .map((problem) => ({ problem, stage: HARD_STAGE }))
  return [...main, ...hard]
}

// ---- 每週排程 ----

const DAY = 86_400_000

/** 那一週的星期一 00:00(本地時間) */
export function weekStart(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.getTime()
}

export interface Week {
  start: number
  items: PlanItem[]
}

export interface Schedule {
  /** 本週以前就寫過的 */
  earlier: PlanItem[]
  /** weeks[0] 是本週:本週寫過的 + 補滿到 perWeek 的下一批 */
  weeks: Week[]
  doneThisWeek: number
  done: number
  /** 照 perWeek 走,最後一題落在哪天(那週的星期日) */
  finish: number
}

export const isDone = (store: Record<number, Record_>, id: number) => !!store[id]
const firstAt = (r: Record_) => r.first ?? r.at

/** 已經寫過的不動,沒寫的從本週起每週排 perWeek 題;落後或超前都會自動重排 */
export function schedule(plan: PlanItem[], store: Record<number, Record_>, now: number, perWeek: number): Schedule {
  const ws = weekStart(now)
  const earlier = plan.filter((it) => store[it.problem.id] && firstAt(store[it.problem.id]) < ws)
  const thisWeek = plan.filter((it) => store[it.problem.id] && firstAt(store[it.problem.id]) >= ws)
  const todo = plan.filter((it) => !store[it.problem.id])

  const n = Math.max(1, Math.floor(perWeek))
  const fill = Math.max(0, n - thisWeek.length)
  const weeks: Week[] = [{ start: ws, items: [...thisWeek, ...todo.slice(0, fill)] }]
  for (let i = fill, w = 1; i < todo.length; i += n, w++) {
    weeks.push({ start: addDays(ws, 7 * w), items: todo.slice(i, i + n) })
  }
  const last = weeks[weeks.length - 1]
  return {
    earlier,
    weeks,
    doneThisWeek: thisWeek.length,
    done: earlier.length + thisWeek.length,
    finish: addDays(last.start, 6),
  }
}

/** 用日曆加天數,避開日光節約時間造成的 23 / 25 小時 */
export function addDays(t: number, days: number): number {
  const d = new Date(t)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

/** 從本週(含)到目標日那週,還剩幾週 */
export function weeksLeft(now: number, target: number): number {
  return Math.max(0, Math.round((weekStart(target) - weekStart(now)) / (7 * DAY)) + 1)
}

// ---- 加練(選寫) ----

export const EXTRA_STAGE = { id: 'extra', name: '加練' }

/** 加練題池:NeetCode 450 裡不在 150 的題目,主要演算法有排進路線 */
export function extraPool(problems: Problem[], { skipPaid }: { skipPaid: boolean }): Problem[] {
  return problems
    .filter((p) => p.lists.includes('neetcode450') && !p.lists.includes('neetcode150') && !(skipPaid && p.paid))
    .filter((p) => PATTERN_RANK.has(p.patterns[0]))
    .sort((a, b) => rankOf(a) - rankOf(b) || byEase(a, b))
}

/**
 * 每週配 perWeek 題同主題加練,依那週核心題的演算法挑,先易後難,同一題只出現在一週。
 * 本週寫過的加練留在本週;更早寫過的不再出現。寫不寫都不影響核心進度。
 */
export function extrasFor(weeks: Week[], pool: Problem[], store: Record<number, Record_>, now: number, perWeek = 5): PlanItem[][] {
  const ws = weekStart(now)
  const used = new Set<number>()
  return weeks.map((w, i) => {
    const done = i === 0 ? pool.filter((p) => store[p.id] && firstAt(store[p.id]) >= ws) : []
    // 寫過幾題就少排幾題,但至少留 2 題可選
    const want = Math.max(perWeek - done.length, 2)
    // 那週每個演算法輪流出一題,不要全被排第一的演算法吃掉
    const queues = [...new Set(w.items.map((it) => it.problem.patterns[0]))].map((pat) =>
      pool.filter((p) => p.patterns[0] === pat && !store[p.id] && !used.has(p.id)),
    )
    const fresh: Problem[] = []
    for (let k = 0; fresh.length < want && queues.some((q) => k < q.length); k++) {
      for (const q of queues) if (k < q.length && fresh.length < want) fresh.push(q[k])
    }
    const out = [...done, ...fresh]
    out.forEach((p) => used.add(p.id))
    return out.map((problem) => ({ problem, stage: EXTRA_STAGE }))
  })
}

/** 今天的「下一題」:路線上還沒寫、也還沒排進今天的,依序取 n 題 */
export function nextUp(plan: PlanItem[], store: Record<number, Record_>, exclude: number[], n: number): PlanItem[] {
  return plan.filter((it) => !store[it.problem.id] && !exclude.includes(it.problem.id)).slice(0, n)
}
