import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 69. Sqrt(x)

const X = 8

function bsFig(): FigStep[] {
  let lo = 0
  let hi = X
  const out: FigStep[] = [{ note: `要找最大的 m 使 m² ≤ ${X}(平方根無條件捨去)。m² 隨 m 遞增 → 在 [0, ${X}] 二分搜尋「最後一個 m² ≤ x」`, views: [arr([lo, hi], { label: '範圍 [lo, hi]' })] }]
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1
    const ok = m * m <= X
    out.push({ note: `m = ${m}:${m}² = ${m * m} ${ok ? `≤ ${X} → 答案至少 ${m},lo = ${m}` : `> ${X} → hi = ${m - 1}`}`, views: [arr([lo, m, hi], { label: 'lo / m / hi', highlight: [1] })] })
    if (ok) lo = m
    else hi = m - 1
  }
  out.push({ note: `答案 ${lo}(√8 ≈ 2.83,捨去小數)`, views: [arr([lo], { label: '答案', done: [0] })] })
  return out
}

function newtonFig(): FigStep[] {
  return [
    { note: '牛頓法:從 r = x 開始,反覆 r = (r + x / r) / 2(整數除法),r 會從上方快速逼近 √x', views: [arr([8, 4, 3, 2], { label: 'r 的變化' })] },
    { note: '8 → (8 + 1)/2 = 4 → (4 + 2)/2 = 3 → (3 + 2)/2 = 2,這時 2² ≤ 8 → 停。答案 2', views: [arr([8, 4, 3, 2], { label: 'r 的變化', done: [3] })] },
  ]
}

export const q0069: Solution = {
  id: 69,
  plain: '算一個非負整數的平方根,但只要整數部分(小數直接捨去)。不能用內建的開根號或次方函式。',
  statement: '給非負整數 `x`,回傳 x 的平方根**無條件捨去**後的整數。不可使用內建的指數函式或運算子(如 `pow`、`x ** 0.5`)。',
  examples: [
    { input: 'x = 4', output: '2' },
    { input: 'x = 8', output: '2', note: '√8 ≈ 2.828' },
  ],
  constraints: ['0 ≤ x ≤ 2³¹ − 1 → m² 要用 64 位元'],
  insight: ['答案 = 最大的 m 使 m² ≤ x', 'm² 單調遞增 → [[p:binary-search-answer]]', '或用牛頓法:整數版會從上方逼近並停在 ⌊√x⌋'],
  approaches: [
    {
      name: '二分搜尋最後一個 m² ≤ x',
      idea: '`lo = 0`、`hi = x`;取上中位數 m,`m² ≤ x` → `lo = m`,否則 `hi = m − 1`。',
      steps: ['`lo, hi = 0, x`', '`while lo < hi`:`m = (lo + hi + 1) // 2`', '`m * m <= x` → `lo = m`;否則 `hi = m − 1`', '回傳 lo'],
      figure: { title: `x = ${X}`, steps: bsFig() },
      complexity: { time: 'O(log x)', space: 'O(1)', why: '每次範圍砍半。' },
      verdict: '最推薦。找「最後一個滿足」的位置,記得用上中位數避免死迴圈。',
      code: {
        python: `def mySqrt(x):
    lo, hi = 0, x
    while lo < hi:
        m = (lo + hi + 1) // 2                # 上中位數
        if m * m <= x:
            lo = m                            # m 可能就是答案
        else:
            hi = m - 1
    return lo`,
        c: `int mySqrt(int x) {
    long long lo = 0, hi = x;
    while (lo < hi) {
        long long m = (lo + hi + 1) / 2;
        if (m * m <= x) lo = m;               // m 到 2³¹ 時 m² 需要 64 位元
        else hi = m - 1;
    }
    return (int)lo;
}`,
        cpp: `int mySqrt(int x) {
    long long lo = 0, hi = x;
    while (lo < hi) {
        long long m = (lo + hi + 1) / 2;
        if (m * m <= x) lo = m;
        else hi = m - 1;
    }
    return lo;
}`,
        java: `int mySqrt(int x) {
    long lo = 0, hi = x;
    while (lo < hi) {
        long m = (lo + hi + 1) / 2;
        if (m * m <= x) lo = m;
        else hi = m - 1;
    }
    return (int) lo;
}`,
        javascript: `function mySqrt(x) {
  let lo = 0, hi = x;
  while (lo < hi) {
    const m = Math.floor((lo + hi + 1) / 2);
    if (m * m <= x) lo = m;
    else hi = m - 1;
  }
  return lo;
}`,
      },
    },
    {
      name: '牛頓法(整數版)',
      idea: '`r = x`;`while r * r > x`:`r = (r + x // r) // 2`;回傳 r。',
      steps: ['`r = x`', '`while r * r > x`:`r = (r + x // r) // 2`', '回傳 r'],
      figure: { title: `x = ${X}`, steps: newtonFig() },
      complexity: { time: 'O(log x)(實際上收斂非常快)', space: 'O(1)', why: '牛頓法每一步大約讓正確位數加倍。' },
      verdict: '收斂最快。整數版從上方逼近,停下時剛好是 ⌊√x⌋。',
      code: {
        python: `def mySqrt(x):
    r = x
    while r * r > x:
        r = (r + x // r) // 2                 # 往 √x 逼近
    return r`,
        c: `int mySqrt(int x) {
    long long r = x;
    while (r * r > x) r = (r + x / r) / 2;
    return (int)r;
}`,
        cpp: `int mySqrt(int x) {
    long long r = x;
    while (r * r > x) r = (r + x / r) / 2;
    return r;
}`,
        java: `int mySqrt(int x) {
    long r = x;
    while (r * r > x) r = (r + x / r) / 2;
    return (int) r;
}`,
        javascript: `function mySqrt(x) {
  let r = x;
  while (r * r > x) r = Math.floor((r + Math.floor(x / r)) / 2);
  return r;
}`,
      },
    },
  ],
  pitfalls: ['`m * m` 用 int:m 到 46341 以上就溢位', '用下中位數配 `lo = m`:lo、hi 相差 1 時會無限迴圈', 'x = 0 或 1 時答案就是自己'],
  check: {
    kind: 'fn',
    fn: 'mySqrt',
    cases: [
      { args: [4], out: 2 },
      { args: [X], out: 2 },
      { args: [0], out: 0 },
      { args: [1], out: 1 },
      { args: [2147395599], out: 46339 },
      { args: [2147483647], out: 46340 },
    ],
  },
}
