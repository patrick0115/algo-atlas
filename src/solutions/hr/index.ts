import type { HrSolution } from '../types'
import { hr2dArray } from './2d-array'
import { hrAlternatingCharacters } from './alternating-characters'
import { hrBearAndSteadyGene } from './bear-and-steady-gene'
import { hrCaesarCipher1 } from './caesar-cipher-1'
import { hrCamelcase } from './camelcase'
import { hrCountingValleys } from './counting-valleys'
import { hrCtciArrayLeftRotation } from './ctci-array-left-rotation'
import { hrCtciMakingAnagrams } from './ctci-making-anagrams'
import { hrHackerrankInAString } from './hackerrank-in-a-string'
import { hrJumpingOnTheClouds } from './jumping-on-the-clouds'
import { hrPalindromeIndex } from './palindrome-index'
import { hrPangrams } from './pangrams'
import { hrReducedString } from './reduced-string'
import { hrRepeatedString } from './repeated-string'
import { hrRichieRich } from './richie-rich'
import { hrSeparateTheNumbers } from './separate-the-numbers'
import { hrSherlockAndValidString } from './sherlock-and-valid-string'
import { hrSockMerchant } from './sock-merchant'
import { hrSpecialPalindromeAgain } from './special-palindrome-again'
import { hrStrongPassword } from './strong-password'
import { hrWeightedUniformString } from './weighted-uniform-string'

const ALL: HrSolution[] = [
  hr2dArray, hrAlternatingCharacters, hrBearAndSteadyGene, hrCaesarCipher1, hrCamelcase, hrCountingValleys, hrCtciArrayLeftRotation, hrCtciMakingAnagrams, hrHackerrankInAString, hrJumpingOnTheClouds, hrPalindromeIndex, hrPangrams, hrReducedString, hrRepeatedString, hrRichieRich, hrSeparateTheNumbers, hrSherlockAndValidString, hrSockMerchant, hrSpecialPalindromeAgain, hrStrongPassword, hrWeightedUniformString,
]

export const HR_SOLUTIONS: Record<string, HrSolution> = Object.fromEntries(ALL.map((s) => [s.slug, s]))
