import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 343. Integer Break

const N = 10

function dpFig(): FigStep[] {
  const dp = Array(N + 1).fill(0)
  dp[1] = 1
  for (let i = 2; i <= N; i++) for (let j = 1; j < i; j++) dp[i] = Math.max(dp[i], j * (i - j), j * dp[i - j])
  return [
    { note: `把 ${N} 拆成至少兩個正整數的和,讓它們的乘積最大。dp[i] = i 拆開後的最大乘積`, views: [arr([N], { label: 'n' })] },
    { note: '先切下第一塊 j,剩下的 i − j 可以「不再拆」(乘 i − j)或「繼續拆」(乘 dp[i − j]),取較大者:`dp[i] = max(j × (i−j), j × dp[i−j])`', views: [arr(dp.slice(1), { label: 'dp[1..10]', mode: 'bars' })] },
    { note: `dp[10] = ${dp[N]}:10 = 3 + 3 + 4 → 3 × 3 × 4 = 36`, views: [arr([3, 3, 4], { label: '拆法', done: [0, 1, 2] }), arr([dp[N]], { label: '答案', done: [0] })] },
  ]
}

function mathFig(): FigStep[] {
  return [
    { note: '數學觀察:拆出 ≥ 5 的數不划算(例如 5 拆成 2 + 3 → 6 > 5);4 = 2 + 2 一樣;所以只會用 2 和 3。而 3 × 3 > 2 × 2 × 2 → 盡量用 3', views: [arr([2, 3], { label: '只用這兩種' })] },
    { note: 'n % 3 == 0 → 3^(n/3);餘 1 → 把一個 3 + 1 換成 2 + 2:3^(n/3 − 1) × 4;餘 2 → 3^(n/3) × 2。特例 n = 2、3 必須拆開,答案是 1、2', views: [arr([36], { label: '10 = 3 + 3 + 4 → 36', done: [0] })] },
  ]
}

export const q0343: Solution = {
  id: 343,
  plain: '把一個正整數 n 拆成至少兩個正整數相加,讓這些數相乘的結果最大。最大是多少?',
  statement: '給正整數 n,將其拆分為 **k ≥ 2** 個正整數的和,使這些整數的乘積最大,回傳最大乘積。',
  examples: [
    { input: 'n = 2', output: '1', note: '1 + 1' },
    { input: 'n = 10', output: '36', note: '3 + 3 + 4' },
  ],
  constraints: ['2 ≤ n ≤ 58'],
  insight: ['切下第一塊 j,剩下的拆或不拆 → [[p:dp-1d]]', '`dp[i] = max over j of max(j × (i−j), j × dp[i−j])`', '數學上:盡量拆成 3,餘 1 時改成兩個 2'],
  approaches: [
    {
      name: '動態規劃',
      idea: '`dp[i] = max(j × (i − j), j × dp[i − j])`,j 從 1 到 i − 1。',
      steps: ['`dp = [0] * (n + 1)`、`dp[1] = 1`', '`for i in 2..n`、`for j in 1..i−1`', '`dp[i] = max(dp[i], j * (i − j), j * dp[i − j])`', '回傳 `dp[n]`'],
      figure: { title: `n = ${N}`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '雙層迴圈。' },
      verdict: '最推薦先學:「剩下的部分拆或不拆」兩種情況要都考慮。',
      code: {
        python: `def integerBreak(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        for j in range(1, i):
            dp[i] = max(dp[i], j * (i - j), j * dp[i - j])   # 剩下的不拆 / 繼續拆
    return dp[n]`,
        c: `int integerBreak(int n) {
    int dp[59] = {0};
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        for (int j = 1; j < i; j++) {
            int a = j * (i - j), b = j * dp[i - j];
            if (a > dp[i]) dp[i] = a;
            if (b > dp[i]) dp[i] = b;
        }
    return dp[n];
}`,
        cpp: `int integerBreak(int n) {
    vector<int> dp(n + 1, 0);
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        for (int j = 1; j < i; j++) dp[i] = max({dp[i], j * (i - j), j * dp[i - j]});
    return dp[n];
}`,
        java: `int integerBreak(int n) {
    int[] dp = new int[n + 1];
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        for (int j = 1; j < i; j++) dp[i] = Math.max(dp[i], Math.max(j * (i - j), j * dp[i - j]));
    return dp[n];
}`,
        javascript: `function integerBreak(n) {
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) for (let j = 1; j < i; j++) dp[i] = Math.max(dp[i], j * (i - j), j * dp[i - j]);
  return dp[n];
}`,
      },
    },
    {
      name: '數學:盡量拆成 3',
      idea: 'n ≤ 3 → n − 1;否則依 n % 3:0 → 3^q、1 → 3^(q−1) × 4、2 → 3^q × 2。',
      steps: ['`n <= 3` → `n − 1`', '`q, r = divmod(n, 3)`', '`r == 0` → `3**q`;`r == 1` → `3**(q−1) * 4`;`r == 2` → `3**q * 2`'],
      figure: { title: `n = ${N}`, steps: mathFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '迴圈乘 n/3 次(n ≤ 58,實際上可視為常數);若改用快速冪可降到 O(log n)。' },
      verdict: '最快;背後是「e ≈ 2.718,最接近的整數是 3」的直覺。',
      code: {
        python: `def integerBreak(n):
    if n <= 3:
        return n - 1                          # 必須拆開:2 = 1+1、3 = 1+2
    q, r = divmod(n, 3)
    if r == 0:
        return 3 ** q
    if r == 1:
        return 3 ** (q - 1) * 4               # 3 + 1 → 2 + 2
    return 3 ** q * 2`,
        c: `int integerBreak(int n) {
    if (n <= 3) return n - 1;
    int q = n / 3, r = n % 3, p = 1;
    if (r == 1) { q--; r = 4; }
    else if (r == 0) r = 1;
    for (int i = 0; i < q; i++) p *= 3;
    return p * r;
}`,
        cpp: `int integerBreak(int n) {
    if (n <= 3) return n - 1;
    int q = n / 3, r = n % 3, p = 1;
    if (r == 1) { q--; r = 4; }
    else if (r == 0) r = 1;
    for (int i = 0; i < q; i++) p *= 3;
    return p * r;
}`,
        java: `int integerBreak(int n) {
    if (n <= 3) return n - 1;
    int q = n / 3, r = n % 3, p = 1;
    if (r == 1) { q--; r = 4; }
    else if (r == 0) r = 1;
    for (int i = 0; i < q; i++) p *= 3;
    return p * r;
}`,
        javascript: `function integerBreak(n) {
  if (n <= 3) return n - 1;
  let q = Math.floor(n / 3), r = n % 3;
  if (r === 1) {
    q--;
    r = 4;
  } else if (r === 0) r = 1;
  return 3 ** q * r;
}`,
      },
    },
  ],
  pitfalls: ['DP 只考慮 `j × dp[i−j]`:dp[2] = 1、dp[3] = 2 比不拆還小,會錯過「剩下的不拆」', 'n = 2、3 時至少要拆成兩個數'],
  check: {
    kind: 'fn',
    fn: 'integerBreak',
    cases: [
      { args: [2], out: 1 },
      { args: [3], out: 2 },
      { args: [4], out: 4 },
      { args: [N], out: 36 },
      { args: [58], out: 1549681956 },
    ],
  },
}
