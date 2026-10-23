import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 96. Unique Binary Search Trees

const N = 4

function dpFig(): FigStep[] {
  const dp = [1, 1]
  for (let k = 2; k <= N; k++) {
    let s = 0
    for (let r = 1; r <= k; r++) s += dp[r - 1] * dp[k - r]
    dp.push(s)
  }
  return [
    { note: '用 1..n 建 BST:選 r 當根,左子樹一定是 1..r−1(r − 1 個數)、右子樹是 r+1..n(n − r 個數)。棵數只跟「幾個數」有關,跟數值無關', views: [arr([1, 2, 3, 4], { label: '選 2 當根:左 [1]、右 [3, 4]', highlight: [1] })] },
    { note: 'dp[k] = k 個數能組成幾種 BST = Σ dp[左邊個數] × dp[右邊個數]。dp[0] = dp[1] = 1', views: [arr([1, 1], { label: 'dp[0..1]' })] },
    { note: `dp[2] = dp[0]·dp[1] + dp[1]·dp[0] = 2;dp[3] = 1·2 + 1·1 + 2·1 = 5;dp[4] = ${dp[4]}`, views: [arr(dp, { label: `dp[0..${N}]`, done: [N] })] },
  ]
}

function catFig(): FigStep[] {
  return [
    { note: '這個數列就是卡塔蘭數:Cₙ = C(2n, n) / (n + 1)。也可以用遞推 C₀ = 1、Cₙ₊₁ = Cₙ × 2(2n + 1) / (n + 2)', views: [arr([1, 1, 2, 5, 14, 42], { label: 'C₀..C₅' })] },
    { note: '一路乘上去,每一步都是整數(先乘再除就不會有小數)。O(n)、O(1) 空間', views: [arr([1, 1, 2, 5, 14], { label: '答案 C₄ = 14', done: [4] })] },
  ]
}

export const q0096: Solution = {
  id: 96,
  plain: '用 1 到 n 這 n 個數字,總共能組出幾種「長得不一樣」的二元搜尋樹?',
  statement: '給整數 `n`,回傳由 1..n 這 n 個節點組成、結構不同的**二元搜尋樹**的數量。',
  examples: [
    { input: 'n = 3', output: '5' },
    { input: 'n = 1', output: '1' },
  ],
  constraints: ['1 ≤ n ≤ 19(答案在 32 位元內)'],
  insight: ['選 r 當根 → 左子樹由 1..r−1 組成,右子樹由 r+1..n 組成', '左右子樹的種類數只跟「數字個數」有關 → dp[k] = Σ dp[r−1] × dp[k−r]', '這就是卡塔蘭數,有封閉公式'],
  approaches: [
    {
      name: 'DP:枚舉根',
      idea: '`dp[0] = dp[1] = 1`;`dp[k] = Σ_{r=1..k} dp[r−1] × dp[k−r]`。',
      steps: ['`dp = [0] * (n + 1)`、`dp[0] = dp[1] = 1`', '`for k in 2..n`:`for r in 1..k`:`dp[k] += dp[r − 1] * dp[k − r]`', '回傳 `dp[n]`'],
      figure: { title: `n = ${N}`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個 k 試 k 種根。' },
      verdict: '最推薦。「選一個當根,左右各自是子問題,方法數相乘」是樹的計數題通用套路。',
      code: {
        python: `def numTrees(n):
    dp = [0] * (n + 1)
    dp[0] = dp[1] = 1
    for k in range(2, n + 1):
        for r in range(1, k + 1):             # r 當根:左 r−1 個、右 k−r 個
            dp[k] += dp[r - 1] * dp[k - r]
    return dp[n]`,
        c: `int numTrees(int n) {
    long long dp[20] = {1, 1};
    for (int k = 2; k <= n; k++)
        for (int r = 1; r <= k; r++) dp[k] += dp[r - 1] * dp[k - r];
    return (int)dp[n];
}`,
        cpp: `int numTrees(int n) {
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;
    if (n >= 1) dp[1] = 1;
    for (int k = 2; k <= n; k++)
        for (int r = 1; r <= k; r++) dp[k] += dp[r - 1] * dp[k - r];
    return dp[n];
}`,
        java: `int numTrees(int n) {
    long[] dp = new long[n + 2];
    dp[0] = dp[1] = 1;
    for (int k = 2; k <= n; k++)
        for (int r = 1; r <= k; r++) dp[k] += dp[r - 1] * dp[k - r];
    return (int) dp[n];
}`,
        javascript: `function numTrees(n) {
  const dp = new Array(n + 2).fill(0);
  dp[0] = dp[1] = 1;
  for (let k = 2; k <= n; k++) for (let r = 1; r <= k; r++) dp[k] += dp[r - 1] * dp[k - r];
  return dp[n];
}`,
      },
    },
    {
      name: '卡塔蘭數公式',
      idea: '`C = 1`;`for i in 0..n−1`:`C = C × 2(2i + 1) / (i + 2)`。',
      steps: ['`c = 1`', '`for i in 0..n−1`:`c = c * 2 * (2 * i + 1) // (i + 2)`', '回傳 c'],
      figure: { title: `n = ${N}`, steps: catFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一個迴圈。' },
      verdict: '最快,但要先知道答案是卡塔蘭數。乘法用 64 位元,先乘再除才不會出現小數。',
      code: {
        python: `def numTrees(n):
    c = 1
    for i in range(n):
        c = c * 2 * (2 * i + 1) // (i + 2)    # C(i+1) = C(i) · 2(2i+1) / (i+2)
    return c`,
        c: `int numTrees(int n) {
    long long c = 1;
    for (int i = 0; i < n; i++) c = c * 2 * (2 * i + 1) / (i + 2);
    return (int)c;
}`,
        cpp: `int numTrees(int n) {
    long long c = 1;
    for (int i = 0; i < n; i++) c = c * 2 * (2 * i + 1) / (i + 2);
    return c;
}`,
        java: `int numTrees(int n) {
    long c = 1;
    for (int i = 0; i < n; i++) c = c * 2 * (2 * i + 1) / (i + 2);
    return (int) c;
}`,
        javascript: `function numTrees(n) {
  let c = 1;
  for (let i = 0; i < n; i++) c = (c * 2 * (2 * i + 1)) / (i + 2);
  return c;
}`,
      },
    },
  ],
  pitfalls: ['dp[0] 設成 0:空子樹也算一種(只有一種「什麼都沒有」),設 0 會讓所有乘積變 0', '公式先除再乘:會出現小數,整數除法就錯了'],
  check: {
    kind: 'fn',
    fn: 'numTrees',
    cases: [
      { args: [3], out: 5 },
      { args: [1], out: 1 },
      { args: [N], out: 14 },
      { args: [19], out: 1767263190 },
    ],
  },
}
