import type { Solution } from './types'
import { q0001 } from './q0001'
import { q0011 } from './q0011'
import { q0015 } from './q0015'
import { q0020 } from './q0020'
import { q0036 } from './q0036'
import { q0049 } from './q0049'
import { q0125 } from './q0125'
import { q0128 } from './q0128'
import { q0167 } from './q0167'
import { q0217 } from './q0217'
import { q0238 } from './q0238'
import { q0242 } from './q0242'
import { q0347 } from './q0347'
import { q2013 } from './q2013'

// 新增一題:寫 src/solutions/q<四位題號>.ts,匯出一個 Solution,加進 ALL。

const ALL: Solution[] = [
  q0001, q0011, q0015, q0020, q0036, q0049, q0125, q0128, q0167, q0217, q0238, q0242, q0347, q2013,
]

export const SOLUTIONS: Record<number, Solution> = Object.fromEntries(ALL.map((s) => [s.id, s]))

export const hasSolution = (id: number) => id in SOLUTIONS
