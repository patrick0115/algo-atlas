import type { HrSolution } from '../types'
import { hrCountingValleys } from './counting-valleys'

const ALL: HrSolution[] = [
  hrCountingValleys,
]

export const HR_SOLUTIONS: Record<string, HrSolution> = Object.fromEntries(ALL.map((s) => [s.slug, s]))
