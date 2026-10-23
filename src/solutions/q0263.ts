import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 263. Ugly Number
const divideFig: FigStep[] = [
  { note: '醜數的質因數只能有 2、3、5。6 = 2 × 3,把允許的因數都除掉後會剩 1。', views: [arr([6, 3, 1], { label: '6 ÷ 2 ÷ 3', done: [2] })] },
  { note: '14 ÷ 2 = 7,剩下 7 不能再除以 2、3、5,因此不是醜數。', views: [arr([14, 7], { label: '14 ÷ 2', highlight: [1] })] },
]
const recursionFig: FigStep[] = [
  { note: '也可遞迴:若目前 n 能被 2、3、5 中任一個整除,去判斷除完的商。', views: [arr([30, 15, 5, 1], { label: '30 → 15 → 5 → 1', done: [3] })] },
  { note: '遞迴走到 1 就成功;走到不能被這三個數整除的其他數就失敗。', views: [arr(['1: 是', '7: 否'], { label: '終點' })] },
]

export const q0263: Solution = {
  id: 263,
  plain: '一個正整數如果拆成質因數後,只會用到 2、3、5,就叫醜數。例如 6 是,14 含有 7 所以不是。',
  statement: '判斷整數 n 是否為醜數。醜數必須是正整數,且所有質因數只屬於 2、3、5;1 也算醜數。',
  examples: [{ input: 'n = 6', output: 'true' }, { input: 'n = 1', output: 'true' }, { input: 'n = 14', output: 'false' }],
  constraints: ['n 是 32 位元帶符號整數'],
  insight: ['直接反覆除以允許的 2、3、5;若最後為 1,就沒有其他質因數。', 'n ≤ 0 一律不是醜數。', '順序不影響答案,因為最後都要把每個允許因數除乾淨。'],
  approaches: [
    {
      name: '逐個除去 2、3、5',
      idea: '每個允許的因數都除到不能再除,最後檢查是否剩 1。',
      steps: ['若 n ≤ 0,回傳 false', '對 p = 2、3、5,只要 n 可被 p 整除就除以 p', '回傳 n == 1'],
      figure: { title: '6 與 14 的因數', steps: divideFig },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次成功相除都讓 n 至少減半。' },
      verdict: '最簡潔,也不需要真正列出所有質因數。',
      code: {
        python: `def isUgly(n):
    if n <= 0:
        return False
    for p in (2, 3, 5):
        while n % p == 0:
            n //= p
    return n == 1`,
        c: `bool isUgly(int n) {
    if (n <= 0) return false;
    int primes[] = {2, 3, 5};
    for (int i = 0; i < 3; i++)
        while (n % primes[i] == 0) n /= primes[i];
    return n == 1;
}`,
        cpp: `bool isUgly(int n) {
    if (n <= 0) return false;
    for (int p : {2, 3, 5})
        while (n % p == 0) n /= p;
    return n == 1;
}`,
        java: `boolean isUgly(int n) {
    if (n <= 0) return false;
    for (int p : new int[]{2, 3, 5})
        while (n % p == 0) n /= p;
    return n == 1;
}`,
        javascript: `function isUgly(n) {
  if (n <= 0) return false;
  for (const p of [2, 3, 5])
    while (n % p === 0) n /= p;
  return n === 1;
}`,
      },
    },
    {
      name: '遞迴拆因數',
      idea: '每次找到一個允許因數就除掉並遞迴;走到 1 代表成功。',
      steps: ['n ≤ 0 為 false;n = 1 為 true', '若 n 可被 2、3、5 之一整除,遞迴判斷 n/p', '都不能整除且 n > 1,回傳 false'],
      figure: { title: '一路拆到 1', steps: recursionFig },
      complexity: { time: 'O(log n)', space: 'O(log n)', why: '每層至少除以 2,遞迴堆疊最多與位數同階。' },
      verdict: '讓「質因數只可來自這三種」的定義更直觀。',
      code: {
        python: `def isUgly(n):
    if n <= 0:
        return False
    if n == 1:
        return True
    for p in (2, 3, 5):
        if n % p == 0:
            return isUgly(n // p)
    return False`,
        c: `bool isUgly(int n) {
    if (n <= 0) return false;
    if (n == 1) return true;
    if (n % 2 == 0) return isUgly(n / 2);
    if (n % 3 == 0) return isUgly(n / 3);
    if (n % 5 == 0) return isUgly(n / 5);
    return false;
}`,
        cpp: `bool isUgly(int n) {
    if (n <= 0) return false;
    if (n == 1) return true;
    for (int p : {2, 3, 5})
        if (n % p == 0) return isUgly(n / p);
    return false;
}`,
        java: `boolean isUgly(int n) {
    if (n <= 0) return false;
    if (n == 1) return true;
    for (int p : new int[]{2, 3, 5})
        if (n % p == 0) return isUgly(n / p);
    return false;
}`,
        javascript: `function isUgly(n) {
  if (n <= 0) return false;
  if (n === 1) return true;
  for (const p of [2, 3, 5])
    if (n % p === 0) return isUgly(n / p);
  return false;
}`,
      },
    },
  ],
  pitfalls: ['1 是醜數,雖然它沒有質因數。', '0 和負數都不是醜數。', '只檢查「可被 2、3、5 整除」不夠;14 可被 2 整除,但還含有 7。'],
  check: { kind: 'fn', fn: 'isUgly', cases: [
    { args: [6], out: true }, { args: [1], out: true }, { args: [14], out: false },
    { args: [0], out: false }, { args: [-6], out: false }, { args: [30], out: true },
  ] },
}
