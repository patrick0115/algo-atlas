import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1866. Number of Ways to Rearrange Sticks With K Sticks Visible

const N = 5
const K = 2

function dpFig(): FigStep[] {
  const dp = Array.from({ length: N + 1 }, () => Array(N + 1).fill(0))
  dp[0][0] = 1
  for (let i = 1; i <= N; i++) for (let j = 1; j <= i; j++) dp[i][j] = dp[i - 1][j - 1] + (i - 1) * dp[i - 1][j]
  const grid: GridViewData = { kind: 'grid', label: 'dp[i][j](列 i 根棍子、欄 j 根看得到)', cells: dp.map((row, i) => row.map((v, j) => (j <= i ? v : ''))), marks: { hl: [[N, K]] } }
  return [
    { note: '長度 1..n 的棍子排一排,從左邊看,一根棍子看得到 ⇔ 它左邊沒有比它長的。要剛好看到 k 根', views: [arr([1, 3, 2, 5, 4], { label: '例:[1,3,2,5,4] 看得到 1、3、5', mode: 'bars', highlight: [0, 1, 3] })] },
    { note: '關鍵:考慮**最短的那根**(長度 1)放哪。放最左邊 → 一定看得到,剩下 i − 1 根要看到 j − 1 根;放其他 i − 1 個位置 → 一定被擋住,剩下仍要看到 j 根', views: [arr(['放最左:dp[i−1][j−1]', '放別處:(i−1) × dp[i−1][j]'], { label: '兩種情況' })] },
    { note: `dp[i][j] = dp[i−1][j−1] + (i−1) × dp[i−1][j](第一類 Stirling 數)。dp[${N}][${K}] = ${dp[N][K]}`, views: [grid] },
  ]
}

function rollFig(): FigStep[] {
  return [
    { note: 'dp[i] 只依賴 dp[i−1] → 一維陣列,j 由大到小更新,避免覆蓋還要用的舊值', views: [arr(['dp[j] = dp[j−1] + (i−1) × dp[j]'], { label: 'j 由 k 往 1' })] },
    { note: '空間從 O(nk) 降到 O(k)', views: [arr([50], { label: '答案', done: [0] })] },
  ]
}

export const q1866: Solution = {
  id: 1866,
  plain: '有長度 1 到 n 的 n 根棍子要排成一排。從左邊看過去,被前面更長的棍子擋住的就看不到。要剛好看得到 k 根,有幾種排法?答案取餘 10⁹ + 7。',
  statement: '有 n 根長度為 1..n 的木棍,將其排列使得從左側恰好能看到 k 根木棍(一根木棍可見,若它左側沒有更長的木棍)。回傳排列數,對 10⁹ + 7 取餘。',
  examples: [
    { input: 'n = 3, k = 2', output: '3', note: '[1,3,2]、[2,3,1]、[2,1,3]' },
    { input: 'n = 5, k = 5', output: '1' },
    { input: 'n = 20, k = 11', output: '647427950' },
  ],
  constraints: ['1 ≤ k ≤ n ≤ 1000'],
  insight: ['盯著最短的棍子看:它只有放最左邊才看得到', '放最左 → `dp[i−1][j−1]`;放其他 i − 1 個位置 → `(i−1) × dp[i−1][j]`', '這正是第一類 Stirling 數([[p:dp-general]])'],
  approaches: [
    {
      name: '二維 DP',
      idea: '`dp[0][0] = 1`;`dp[i][j] = dp[i−1][j−1] + (i−1) × dp[i−1][j]`。',
      steps: ['`dp = (n+1) × (k+1)` 的 0,`dp[0][0] = 1`', '`for i in 1..n`、`for j in 1..min(i, k)`', '套轉移式並取餘', '回傳 `dp[n][k]`'],
      figure: { title: `n = ${N},k = ${K}`, steps: dpFig() },
      complexity: { time: 'O(n · k)', space: 'O(n · k)', why: '10⁶ 個狀態。' },
      verdict: '最推薦;「看最小(或最大)的那個元素放哪」是排列計數的常見切入點。',
      code: {
        python: `def rearrangeSticks(n, k):
    MOD = 10 ** 9 + 7
    dp = [[0] * (k + 1) for _ in range(n + 1)]
    dp[0][0] = 1
    for i in range(1, n + 1):
        for j in range(1, min(i, k) + 1):
            # 最短的放最左(看得到)+ 放其他 i-1 個位置(被擋住)
            dp[i][j] = (dp[i - 1][j - 1] + (i - 1) * dp[i - 1][j]) % MOD
    return dp[n][k]`,
        c: `int rearrangeSticks(int n, int k) {
    const long long MOD = 1000000007;
    long long *dp = calloc((size_t)(n + 1) * (k + 1), sizeof(long long));
    dp[0] = 1;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= k && j <= i; j++)
            dp[i * (k + 1) + j] = (dp[(i - 1) * (k + 1) + j - 1] + (long long)(i - 1) * dp[(i - 1) * (k + 1) + j]) % MOD;
    int ans = (int)dp[n * (k + 1) + k];
    free(dp);
    return ans;
}`,
        cpp: `int rearrangeSticks(int n, int k) {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> dp(n + 1, vector<long long>(k + 1, 0));
    dp[0][0] = 1;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= min(i, k); j++)
            dp[i][j] = (dp[i - 1][j - 1] + (long long)(i - 1) * dp[i - 1][j]) % MOD;
    return dp[n][k];
}`,
        java: `int rearrangeSticks(int n, int k) {
    final long MOD = 1_000_000_007;
    long[][] dp = new long[n + 1][k + 1];
    dp[0][0] = 1;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= Math.min(i, k); j++)
            dp[i][j] = (dp[i - 1][j - 1] + (long) (i - 1) * dp[i - 1][j]) % MOD;
    return (int) dp[n][k];
}`,
        javascript: `function rearrangeSticks(n, k) {
  const MOD = 1000000007n;
  const dp = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0n));
  dp[0][0] = 1n;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= Math.min(i, k); j++) dp[i][j] = (dp[i - 1][j - 1] + BigInt(i - 1) * dp[i - 1][j]) % MOD;
  return Number(dp[n][k]);
}`,
      },
    },
    {
      name: '一維滾動',
      idea: '`dp[j]` 由大到小更新:`dp[j] = dp[j−1] + (i−1) × dp[j]`;每輪結束後把 `dp[0]` 設為 0(i ≥ 1 時看到 0 根不可能)。',
      steps: ['`dp = [1] + [0] * k`', '`for i in 1..n`:`for j in min(i, k)..1`', '`dp[j] = (dp[j−1] + (i−1) * dp[j]) % MOD`', '`dp[0] = 0`;回傳 `dp[k]`'],
      figure: { title: `n = ${N},k = ${K}`, steps: rollFig() },
      complexity: { time: 'O(n · k)', space: 'O(k)', why: '一維陣列。' },
      verdict: '和 0/1 背包一樣「倒著更新」的空間壓縮。',
      code: {
        python: `def rearrangeSticks(n, k):
    MOD = 10 ** 9 + 7
    dp = [1] + [0] * k
    for i in range(1, n + 1):
        for j in range(min(i, k), 0, -1):     # 倒著更新,dp[j-1] 還是舊值
            dp[j] = (dp[j - 1] + (i - 1) * dp[j]) % MOD
        dp[0] = 0
    return dp[k]`,
        c: `int rearrangeSticks(int n, int k) {
    const long long MOD = 1000000007;
    long long *dp = calloc(k + 1, sizeof(long long));
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = i < k ? i : k; j >= 1; j--) dp[j] = (dp[j - 1] + (long long)(i - 1) * dp[j]) % MOD;
        dp[0] = 0;
    }
    int ans = (int)dp[k];
    free(dp);
    return ans;
}`,
        cpp: `int rearrangeSticks(int n, int k) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(k + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = min(i, k); j >= 1; j--) dp[j] = (dp[j - 1] + (long long)(i - 1) * dp[j]) % MOD;
        dp[0] = 0;
    }
    return dp[k];
}`,
        java: `int rearrangeSticks(int n, int k) {
    final long MOD = 1_000_000_007;
    long[] dp = new long[k + 1];
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = Math.min(i, k); j >= 1; j--) dp[j] = (dp[j - 1] + (long) (i - 1) * dp[j]) % MOD;
        dp[0] = 0;
    }
    return (int) dp[k];
}`,
        javascript: `function rearrangeSticks(n, k) {
  const MOD = 1000000007n, dp = new Array(k + 1).fill(0n);
  dp[0] = 1n;
  for (let i = 1; i <= n; i++) {
    for (let j = Math.min(i, k); j >= 1; j--) dp[j] = (dp[j - 1] + BigInt(i - 1) * dp[j]) % MOD;
    dp[0] = 0n;
  }
  return Number(dp[k]);
}`,
      },
    },
  ],
  pitfalls: ['從最長的棍子思考:它一定看得到,但會牽動左邊所有棍子,轉移變複雜', '一維滾動時 j 由小到大更新:會用到這一輪已經改過的 dp[j−1]', '`(i − 1) × dp` 在 int 中溢位'],
  check: {
    kind: 'fn',
    fn: 'rearrangeSticks',
    cases: [
      { args: [3, 2], out: 3 },
      { args: [5, 5], out: 1 },
      { args: [20, 11], out: 647427950 },
      { args: [N, K], out: 50 },
      { args: [1000, 1], out: 756641425 },
    ],
  },
}
