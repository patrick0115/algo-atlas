import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 367. Valid Perfect Square

const N = 49

function bsFig(): FigStep[] {
  let lo = 1
  let hi = N
  const out: FigStep[] = [{ note: `不用 sqrt:在 1..${N} 二分搜尋一個 m,使 m × m == ${N}。m 越大,m² 越大 → 可以二分`, views: [arr([lo, hi], { label: '範圍 [lo, hi]' })] }]
  while (lo <= hi) {
    const m = (lo + hi) >> 1
    const sq = m * m
    out.push({ note: `m = ${m}:${m}² = ${sq} ${sq === N ? `= ${N} → 是完全平方數!` : sq < N ? `< ${N} → lo = ${m + 1}` : `> ${N} → hi = ${m - 1}`}`, views: [arr([lo, m, hi], { label: 'lo / m / hi', highlight: [1], done: sq === N ? [1] : [] })] })
    if (sq === N) break
    if (sq < N) lo = m + 1
    else hi = m - 1
  }
  return out
}

function newtonFig(): FigStep[] {
  const xs: number[] = []
  let x = N
  while (x * x > N) {
    xs.push(x)
    x = Math.floor((x + N / x) / 2)
  }
  xs.push(x)
  return [
    { note: `牛頓法:從 x = ${N} 開始,不斷用 x = (x + n/x) / 2 更新(取整數)。這是在逼近 √n,每一步都會大幅靠近`, views: [arr(xs, { label: 'x 的變化', highlight: [0] })] },
    { note: `${xs.join(' → ')}:x² ≤ n 時停下。${x}² = ${x * x} ${x * x === N ? `= ${N} → true` : `≠ ${N} → false`}`, views: [arr(xs, { label: 'x 的變化', done: [xs.length - 1] })] },
  ]
}

export const q0367: Solution = {
  id: 367,
  plain: '判斷一個正整數是不是「某個整數的平方」(1、4、9、16、25……),不能用內建的開根號。',
  statement: '給正整數 `num`,若它是**完全平方數**回傳 true,否則 false。不可以使用內建的 `sqrt` 之類函式。',
  examples: [
    { input: 'num = 16', output: 'true' },
    { input: 'num = 14', output: 'false' },
  ],
  constraints: ['1 ≤ num ≤ 2³¹ − 1 → m² 要用 64 位元'],
  insight: ['m² 隨 m 遞增 → 在 1..num 二分找 m² == num', '或用牛頓法快速逼近 √num,再檢查', '也可以一直減奇數:1 + 3 + 5 + … + (2k−1) = k²'],
  approaches: [
    {
      name: '二分搜尋',
      idea: '`lo = 1`、`hi = num`;`m² == num` → true;`m² < num` → 往右;否則往左。',
      steps: ['`lo, hi = 1, num`', '`m = (lo + hi) // 2`;比較 `m * m` 和 num', '相等 → true;小於 → `lo = m + 1`;大於 → `hi = m − 1`', '跑完 → false'],
      figure: { title: `num = ${N}`, steps: bsFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次範圍砍半。' },
      verdict: '最推薦,穩定好寫。乘法用 64 位元避免溢位。',
      code: {
        python: `def isPerfectSquare(num):
    lo, hi = 1, num
    while lo <= hi:
        m = (lo + hi) // 2
        sq = m * m
        if sq == num:
            return True
        if sq < num:
            lo = m + 1
        else:
            hi = m - 1
    return False`,
        c: `bool isPerfectSquare(int num) {
    long long lo = 1, hi = num;
    while (lo <= hi) {
        long long m = (lo + hi) / 2, sq = m * m;   // m 可到 2³⁰,m² 要用 64 位元
        if (sq == num) return true;
        if (sq < num) lo = m + 1;
        else hi = m - 1;
    }
    return false;
}`,
        cpp: `bool isPerfectSquare(int num) {
    long long lo = 1, hi = num;
    while (lo <= hi) {
        long long m = (lo + hi) / 2, sq = m * m;
        if (sq == num) return true;
        if (sq < num) lo = m + 1;
        else hi = m - 1;
    }
    return false;
}`,
        java: `boolean isPerfectSquare(int num) {
    long lo = 1, hi = num;
    while (lo <= hi) {
        long m = (lo + hi) / 2, sq = m * m;
        if (sq == num) return true;
        if (sq < num) lo = m + 1;
        else hi = m - 1;
    }
    return false;
}`,
        javascript: `function isPerfectSquare(num) {
  let lo = 1, hi = num;
  while (lo <= hi) {
    const m = Math.floor((lo + hi) / 2), sq = m * m;
    if (sq === num) return true;
    if (sq < num) lo = m + 1;
    else hi = m - 1;
  }
  return false;
}`,
      },
    },
    {
      name: '牛頓法',
      idea: '`x = num`;`while x * x > num`:`x = (x + num // x) // 2`。最後檢查 `x * x == num`。',
      steps: ['`x = num`', '`while x * x > num`:`x = (x + num // x) // 2`', '回傳 `x * x == num`'],
      figure: { title: `num = ${N}`, steps: newtonFig() },
      complexity: { time: 'O(log n)(實際上收斂非常快)', space: 'O(1)', why: '牛頓法每一步大約讓正確的位數加倍。' },
      verdict: '比二分更快收斂;整數版的牛頓法從上方逼近,會停在 ⌊√num⌋。',
      code: {
        python: `def isPerfectSquare(num):
    x = num
    while x * x > num:
        x = (x + num // x) // 2               # 牛頓法:往 √num 逼近
    return x * x == num`,
        c: `bool isPerfectSquare(int num) {
    long long x = num;
    while (x * x > num) x = (x + num / x) / 2;
    return x * x == num;
}`,
        cpp: `bool isPerfectSquare(int num) {
    long long x = num;
    while (x * x > num) x = (x + num / x) / 2;
    return x * x == num;
}`,
        java: `boolean isPerfectSquare(int num) {
    long x = num;
    while (x * x > num) x = (x + num / x) / 2;
    return x * x == num;
}`,
        javascript: `function isPerfectSquare(num) {
  let x = num;
  while (x * x > num) x = Math.floor((x + Math.floor(num / x)) / 2);
  return x * x === num;
}`,
      },
    },
  ],
  pitfalls: ['`m * m` 用 int:m 到 46341 以上就溢位', '用浮點數 `sqrt` 再取整數:題目不允許,而且大數時可能有誤差'],
  check: {
    kind: 'fn',
    fn: 'isPerfectSquare',
    cases: [
      { args: [16], out: true },
      { args: [14], out: false },
      { args: [1], out: true },
      { args: [N], out: true },
      { args: [2147395600], out: true },
      { args: [2147483647], out: false },
    ],
  },
}
