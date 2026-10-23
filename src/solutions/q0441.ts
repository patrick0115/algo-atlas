import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 441. Arranging Coins

const N = 8

function stairs(rows: number, label: string): GridViewData {
  const cells: string[][] = []
  let left = N
  const full: [number, number][] = []
  for (let r = 0; r < rows + 1 && left > 0; r++) {
    const row = Array(rows + 1).fill('')
    for (let c = 0; c <= r && left > 0; c++, left--) {
      row[c] = '●'
      if (r < rows) full.push([r, c])
    }
    cells.push(row)
  }
  return { kind: 'grid', label, cells, rowLabels: cells.map((_, r) => `第 ${r + 1} 列`), marks: { done: full } }
}

function bsFig(): FigStep[] {
  let lo = 0
  let hi = N
  const out: FigStep[] = [{ note: `前 k 列總共要 1 + 2 + … + k = k(k+1)/2 個硬幣。要找最大的 k,使 k(k+1)/2 ≤ n = ${N}。k 越大需要越多 → 單調 → 二分搜尋 k`, views: [stairs(3, `${N} 個硬幣排成階梯`)] }]
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1
    const need = (m * (m + 1)) / 2
    out.push({ note: `試 k = ${m}:需要 ${need} 個 ${need <= N ? `≤ ${N} → 可以,lo = ${m}` : `> ${N} → 不夠,hi = ${m - 1}`}`, views: [arr(Array.from({ length: N + 1 }, (_, k) => k), { label: 'k 的範圍', range: [lo, hi], highlight: [m] })] })
    if (need <= N) lo = m
    else hi = m - 1
  }
  out.push({ note: `答案 k = ${lo}:前 ${lo} 列用掉 ${(lo * (lo + 1)) / 2} 個,剩下 ${N - (lo * (lo + 1)) / 2} 個不夠排滿第 ${lo + 1} 列`, views: [stairs(lo, '完整的列(實心)')] })
  return out
}

function mathFig(): FigStep[] {
  const k = Math.floor((Math.sqrt(8 * N + 1) - 1) / 2)
  return [
    { note: '直接解不等式 k(k+1)/2 ≤ n:k² + k − 2n ≤ 0 → k ≤ (−1 + √(8n + 1)) / 2', views: [arr([`8·${N}+1 = ${8 * N + 1}`, `√ = ${Math.sqrt(8 * N + 1).toFixed(3)}`], { label: '代入' })] },
    { note: `(−1 + ${Math.sqrt(8 * N + 1).toFixed(3)}) / 2 = ${((Math.sqrt(8 * N + 1) - 1) / 2).toFixed(3)},取整數 → ${k}。O(1),但要注意浮點誤差(n 很大時用 64 位元整數驗證一下)`, views: [arr([k], { label: '答案', done: [0] })] },
  ]
}

export const q0441: Solution = {
  id: 441,
  plain: '用 n 個硬幣排階梯:第 1 列 1 個、第 2 列 2 個、第 3 列 3 個……最後一列可能排不滿。問有幾列是完整排滿的?',
  statement: '有 n 枚硬幣要排成階梯,第 i 列恰好 i 枚。最後一列可能不完整。回傳**完整**的列數。',
  examples: [
    { input: 'n = 5', output: '2', note: '1 + 2 = 3,剩 2 個排不滿第 3 列' },
    { input: 'n = 8', output: '3', note: '1 + 2 + 3 = 6,剩 2 個' },
  ],
  constraints: ['1 ≤ n ≤ 2³¹ − 1 → k(k+1)/2 的計算要用 64 位元'],
  insight: ['前 k 列需要 k(k+1)/2 個 → 找最大的 k 使 k(k+1)/2 ≤ n', 'k 越大需要越多 → 單調 → [[p:binary-search-answer]]', '也可以直接用一元二次公式解'],
  approaches: [
    {
      name: '二分搜尋 k',
      idea: '在 [0, n] 二分找最大的 k 使 `k(k+1)/2 ≤ n`(取上中位數)。',
      steps: ['`lo, hi = 0, n`', '`m = (lo + hi + 1) // 2`;`m(m+1)/2 ≤ n` → `lo = m`,否則 `hi = m − 1`', '回傳 lo'],
      figure: { title: `n = ${N}`, steps: bsFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '二分 log n 次。' },
      verdict: '最推薦(穩、不怕浮點誤差)。找「最大的可行值」時記得取上中位數。',
      code: {
        python: `def arrangeCoins(n):
    lo, hi = 0, n
    while lo < hi:
        m = (lo + hi + 1) // 2                # 上中位數:lo = m 時才會前進
        if m * (m + 1) // 2 <= n:
            lo = m                            # 排得出 m 列
        else:
            hi = m - 1
    return lo`,
        c: `int arrangeCoins(int n) {
    long long lo = 0, hi = n;
    while (lo < hi) {
        long long m = (lo + hi + 1) / 2;
        if (m * (m + 1) / 2 <= n) lo = m;    // m 到 2³¹ 時 m(m+1) 超過 int,用 long long
        else hi = m - 1;
    }
    return (int)lo;
}`,
        cpp: `int arrangeCoins(int n) {
    long long lo = 0, hi = n;
    while (lo < hi) {
        long long m = (lo + hi + 1) / 2;
        if (m * (m + 1) / 2 <= n) lo = m;
        else hi = m - 1;
    }
    return lo;
}`,
        java: `int arrangeCoins(int n) {
    long lo = 0, hi = n;
    while (lo < hi) {
        long m = (lo + hi + 1) / 2;
        if (m * (m + 1) / 2 <= n) lo = m;
        else hi = m - 1;
    }
    return (int) lo;
}`,
        javascript: `function arrangeCoins(n) {
  let lo = 0, hi = n;
  while (lo < hi) {
    const m = Math.floor((lo + hi + 1) / 2);
    if ((m * (m + 1)) / 2 <= n) lo = m;
    else hi = m - 1;
  }
  return lo;
}`,
      },
    },
    {
      name: '一元二次公式',
      idea: '`k = ⌊(√(8n + 1) − 1) / 2⌋`。',
      steps: ['`k = int((sqrt(8 * n + 1) − 1) / 2)`', '(保險起見)若 `(k+1)(k+2)/2 ≤ n` 就 `k += 1`;若 `k(k+1)/2 > n` 就 `k −= 1`', '回傳 k'],
      figure: { title: `n = ${N}`, steps: mathFig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '一次開根號。' },
      verdict: '最快,但浮點數開根號在 n 很大時可能差一點點,所以加上整數的修正。',
      code: {
        python: `from math import isqrt

def arrangeCoins(n):
    return (isqrt(8 * n + 1) - 1) // 2        # isqrt 是整數開根號,沒有浮點誤差`,
        c: `int arrangeCoins(int n) {
    long long k = (long long)((sqrt(8.0 * n + 1) - 1) / 2);
    while ((k + 1) * (k + 2) / 2 <= n) k++;  // 修正浮點誤差
    while (k * (k + 1) / 2 > n) k--;
    return (int)k;
}`,
        cpp: `int arrangeCoins(int n) {
    long long k = (long long)((sqrt(8.0 * n + 1) - 1) / 2);
    while ((k + 1) * (k + 2) / 2 <= n) k++;
    while (k * (k + 1) / 2 > n) k--;
    return k;
}`,
        java: `int arrangeCoins(int n) {
    long k = (long) ((Math.sqrt(8.0 * n + 1) - 1) / 2);
    while ((k + 1) * (k + 2) / 2 <= n) k++;
    while (k * (k + 1) / 2 > n) k--;
    return (int) k;
}`,
        javascript: `function arrangeCoins(n) {
  let k = Math.floor((Math.sqrt(8 * n + 1) - 1) / 2);
  while (((k + 1) * (k + 2)) / 2 <= n) k++;
  while ((k * (k + 1)) / 2 > n) k--;
  return k;
}`,
      },
    },
  ],
  pitfalls: ['`m * (m + 1)` 用 int:m 接近 2³¹ 時溢位', '`8 * n` 在 C/Java 用 int 也會溢位,先轉成 64 位元或 double', '二分取下中位數配 `lo = m`:會無限迴圈'],
  check: {
    kind: 'fn',
    fn: 'arrangeCoins',
    cases: [
      { args: [5], out: 2 },
      { args: [N], out: 3 },
      { args: [1], out: 1 },
      { args: [3], out: 2 },
      { args: [2147483647], out: 65535 },
    ],
  },
}
