import type { Pattern } from '../types'
import { SORTING } from './sorting'
import { ARRAYS } from './arrays'
import { slidingWindow } from './sliding-window'
import { TREES } from './trees'
import { LISTS } from './lists'
import { GRAPHS } from './graphs'

// 新增演算法:寫好 Pattern 後加進這個陣列(id 要和 data/categories.ts 一致)。
const ALL: Pattern[] = [...SORTING, ...ARRAYS, slidingWindow, ...LISTS, ...TREES, ...GRAPHS]

export const PATTERNS: Record<string, Pattern> = Object.fromEntries(ALL.map((p) => [p.id, p]))
