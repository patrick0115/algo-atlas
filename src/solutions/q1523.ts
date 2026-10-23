import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1523. Count Odd Numbers in an Interval Range
const prefixFig: FigStep[] = [
  { note: '從 0 到 x 的奇數有 floor((x+1)/2) 個。區間 [3,7] = [0,7] 的 4 個減掉 [0,2] 的 1 個。', views: [arr([0, 1, 2, 3, 4, 5, 6, 7], { label: '0..7', done: [1, 3, 5, 7] })] },
  { note: '4 − 1 = 3,所以 [3,7] 有 3、5、7 共三個奇數。', views: [arr([3, 5, 7], { label: '區間奇數', done: [0, 1, 2] })] },
]
const pairFig: FigStep[] = [
  { note: '連續兩個整數必有一個奇數。區間 [3,7] 長 5,先配成兩組,剩下開頭 3 是奇數。', views: [arr([3, 4, 5, 6, 7], { label: '兩組加一個', done: [0, 2, 4] })] },
  { note: '因此是 floor(5/2) + 1 = 3。長度為奇數時,只看起點是否是奇數。', views: [arr([3], { label: '答案', done: [0] })] },
]

export const q1523: Solution = {
  id: 1523,
  plain: '給一段連續的整數範圍,不用一個個數,直接算其中有幾個奇數。',
  statement: '給非負整數 low、high,計算包含兩端的區間 [low,high] 中奇數的數量。',
  examples: [{ input: 'low = 3, high = 7', output: '3' }, { input: 'low = 8, high = 10', output: '1' }],
  constraints: ['0 ≤ low ≤ high ≤ 10⁹', '區間可能很長,不能逐一走訪'],
  insight: ['每連續兩個整數恰好有一個奇數。', '也能用前綴計數:從 0 到 x 的奇數數量為 floor((x+1)/2)。', '記得區間包含 low 和 high 兩個端點。'],
  approaches: [
    {
      name: '前綴奇數數量相減',
      idea: '[low,high] 的奇數數量 = [0,high] 的數量 − [0,low−1] 的數量。',
      steps: ['F(x) = floor((x+1)/2)', '回傳 F(high) − F(low−1)', '化簡為 floor((high+1)/2) − floor(low/2)'],
      figure: { title: 'low = 3,high = 7', steps: prefixFig },
      complexity: { time: 'O(1)', space: 'O(1)', why: '只做常數次整數運算。' },
      verdict: '公式短,邊界 low = 0 也能直接處理。',
      code: {
        python: `def countOdds(low, high):
    return (high + 1) // 2 - low // 2`,
        c: `int countOdds(int low, int high) {
    return (high + 1) / 2 - low / 2;
}`,
        cpp: `int countOdds(int low, int high) {
    return (high + 1) / 2 - low / 2;
}`,
        java: `int countOdds(int low, int high) {
    return (high + 1) / 2 - low / 2;
}`,
        javascript: `function countOdds(low, high) {
  return Math.floor((high + 1) / 2) - Math.floor(low / 2);
}`,
      },
    },
    {
      name: '兩兩配對',
      idea: '區間長度每兩個數貢獻一個奇數;若剩一個,它的奇偶與起點相同。',
      steps: ['len = high−low+1', '先取 floor(len/2)', '若 len 是奇數且 low 是奇數,再加 1'],
      figure: { title: '區間配對', steps: pairFig },
      complexity: { time: 'O(1)', space: 'O(1)', why: '只看區間長度和起點奇偶。' },
      verdict: '從連續數字成對出發,比較容易推導公式。',
      code: {
        python: `def countOdds(low, high):
    length = high - low + 1
    return length // 2 + (1 if length % 2 and low % 2 else 0)`,
        c: `int countOdds(int low, int high) {
    int length = high - low + 1;
    return length / 2 + (length % 2 && low % 2 ? 1 : 0);
}`,
        cpp: `int countOdds(int low, int high) {
    int length = high - low + 1;
    return length / 2 + (length % 2 && low % 2 ? 1 : 0);
}`,
        java: `int countOdds(int low, int high) {
    int length = high - low + 1;
    return length / 2 + (length % 2 == 1 && low % 2 == 1 ? 1 : 0);
}`,
        javascript: `function countOdds(low, high) {
  const length = high - low + 1;
  return Math.floor(length / 2) + (length % 2 && low % 2 ? 1 : 0);
}`,
      },
    },
  ],
  pitfalls: ['這是閉區間,長度為 high−low+1。', '兩端都可能是奇數;單純用區間長度除以 2 會漏掉多出的那一個。'],
  check: { kind: 'fn', fn: 'countOdds', cases: [
    { args: [3, 7], out: 3 }, { args: [8, 10], out: 1 },
    { args: [0, 0], out: 0 }, { args: [1, 1], out: 1 },
    { args: [0, 1000000000], out: 500000000 },
  ] },
}
