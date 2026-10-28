import type { HrSolution } from '../types'
import { hrAlternatingCharacters } from './alternating-characters'
import { hrBearAndSteadyGene } from './bear-and-steady-gene'
import { hrCaesarCipher1 } from './caesar-cipher-1'
import { hrCamelcase } from './camelcase'
import { hrCountingValleys } from './counting-valleys'
import { hrCtciMakingAnagrams } from './ctci-making-anagrams'
import { hrPangrams } from './pangrams'
import { hrReducedString } from './reduced-string'
import { hrSherlockAndValidString } from './sherlock-and-valid-string'
import { hrSpecialPalindromeAgain } from './special-palindrome-again'
import { hrStrongPassword } from './strong-password'

const ALL: HrSolution[] = [
  hrAlternatingCharacters, hrBearAndSteadyGene, hrCaesarCipher1, hrCamelcase, hrCountingValleys, hrCtciMakingAnagrams, hrPangrams, hrReducedString, hrSherlockAndValidString, hrSpecialPalindromeAgain, hrStrongPassword,
]

export const HR_SOLUTIONS: Record<string, HrSolution> = Object.fromEntries(ALL.map((s) => [s.slug, s]))
