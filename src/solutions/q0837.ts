import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 837. New 21 Game

const N = 6
const K = 1
const W = 10

function dpFig(): FigStep[] {
  const n = 21
  const k = 17
  const w = 10
  return [
    { note: `dp[x] = 分數剛好走到 x 的機率。分數 < k 時才會繼續抽,每次抽 1..maxPts 機率各 1/maxPts。所以 dp[x] = (dp[x−1] + … + dp[x−maxPts]) / maxPts,但只算「還在抽」的那些前一步(< k)`, views: [arr(['dp[0] = 1'], { label: '起點' })] },
    { note: `每次都把 maxPts 個加起來太慢:用一個**滑動視窗的和** s,維護「最近 maxPts 個、而且 < k 的 dp」的總和。dp[x] = s / maxPts`, views: [arr(['s = dp[x−w] + … + dp[x−1](只算 < k 的)'], { label: '視窗和' })] },
    { note: `算出 dp 後,答案 = 停在 k..n 之間的機率總和 = Σ dp[k..n]。例 n = ${n}、k = ${k}、maxPts = ${w} → 0.73278`, views: [arr([0.73278], { label: '答案', done: [0] })] },
  ]
}

function naiveFig(): FigStep[] {
  return [
    { note: `直接照定義:dp[x] = Σ dp[x − i] / maxPts,i = 1..maxPts,且 x − i < k。例 n = ${N}、k = ${K}、maxPts = ${W}:只抽一次,1..10 各 1/10`, views: [arr(Array.from({ length: W + 1 }, (_, i) => (i === 0 ? 1 : 0.1)), { label: 'dp[0..10]' })] },
    { note: `停在 1..${N} 的機率 = 6 × 0.1 = 0.6。每格要加 maxPts 個 → O(n · maxPts)`, views: [arr(Array.from({ length: W + 1 }, (_, i) => (i === 0 ? 1 : 0.1)), { label: 'dp', done: [1, 2, 3, 4, 5, 6] })] },
  ]
}

export const q0837: Solution = {
  id: 837,
  plain: 'Alice 從 0 分開始玩抽牌:只要分數還小於 k,就再抽一張,每張是 1 到 maxPts 分(機率一樣)。分數到 k 以上就停。問最後分數不超過 n 的機率是多少?',
  statement: 'Alice 從 0 分開始,當分數 < `k` 時,從 [1, maxPts] 中**等機率**隨機抽一個整數加到分數上;分數 ≥ k 時停止。回傳最終分數 ≤ `n` 的機率(誤差 10⁻⁵ 內)。',
  examples: [
    { input: 'n = 10, k = 1, maxPts = 10', output: '1.00000' },
    { input: 'n = 6, k = 1, maxPts = 10', output: '0.60000' },
    { input: 'n = 21, k = 17, maxPts = 10', output: '0.73278' },
  ],
  constraints: ['0 ≤ k ≤ n ≤ 10⁴', 'maxPts ≤ 10⁴ → O(n · maxPts) 可能到 10⁸,要優化'],
  insight: ['dp[x] = 分數曾經剛好是 x 的機率;只有 < k 的分數會往下抽', 'dp[x] = (所有 x − maxPts ≤ y < x 且 y < k 的 dp[y]) / maxPts', '這是一段連續區間的和 → 用滑動視窗維護,O(1) 更新', '答案 = Σ dp[x],x 從 k 到 n'],
  approaches: [
    {
      name: '機率 DP + 滑動視窗和',
      idea: '`dp[0] = 1`、`s = 1`(視窗和);`dp[x] = s / W`;`x < k` 時把 dp[x] 加進 s;`x − W ≥ 0` 且 `< k` 時把 dp[x − W] 移出 s。',
      steps: ['`k == 0 or n >= k − 1 + W` → 回傳 1(一定不會超過)', '`dp[0] = 1`、`s = 1`、`ans = 0`', '`for x in 1..n`:`dp[x] = s / W`;`x < k` → `s += dp[x]`,否則 `ans += dp[x]`', '`x − W >= 0 and x − W < k` → `s -= dp[x − W]`'],
      figure: { title: 'n = 21,k = 17,maxPts = 10', steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每格 O(1)。' },
      verdict: '最推薦。「dp 轉移是前面連續 W 格的和」→ 用[[p:sliding-window]]把 O(W) 降成 O(1)。',
      code: {
        python: `def new21Game(n, k, maxPts):
    if k == 0 or n >= k - 1 + maxPts:
        return 1.0                            # 最大可能分數 k−1+maxPts 都 ≤ n
    dp = [0.0] * (n + 1)
    dp[0] = 1.0
    s, ans = 1.0, 0.0                         # s:最近 maxPts 個、還會繼續抽的 dp 總和
    for x in range(1, n + 1):
        dp[x] = s / maxPts
        if x < k:
            s += dp[x]                        # x 還會繼續抽
        else:
            ans += dp[x]                      # 停在 x(k ≤ x ≤ n)
        if x - maxPts >= 0 and x - maxPts < k:
            s -= dp[x - maxPts]               # 離開視窗
    return ans`,
        c: `double new21Game(int n, int k, int maxPts) {
    if (k == 0 || n >= k - 1 + maxPts) return 1.0;
    double *dp = calloc(n + 1, sizeof(double)), s = 1.0, ans = 0.0;
    dp[0] = 1.0;
    for (int x = 1; x <= n; x++) {
        dp[x] = s / maxPts;
        if (x < k) s += dp[x];
        else ans += dp[x];
        if (x - maxPts >= 0 && x - maxPts < k) s -= dp[x - maxPts];
    }
    free(dp);
    return ans;
}`,
        cpp: `double new21Game(int n, int k, int maxPts) {
    if (k == 0 || n >= k - 1 + maxPts) return 1.0;
    vector<double> dp(n + 1, 0.0);
    dp[0] = 1.0;
    double s = 1.0, ans = 0.0;
    for (int x = 1; x <= n; x++) {
        dp[x] = s / maxPts;
        if (x < k) s += dp[x];
        else ans += dp[x];
        if (x - maxPts >= 0 && x - maxPts < k) s -= dp[x - maxPts];
    }
    return ans;
}`,
        java: `double new21Game(int n, int k, int maxPts) {
    if (k == 0 || n >= k - 1 + maxPts) return 1.0;
    double[] dp = new double[n + 1];
    dp[0] = 1.0;
    double s = 1.0, ans = 0.0;
    for (int x = 1; x <= n; x++) {
        dp[x] = s / maxPts;
        if (x < k) s += dp[x];
        else ans += dp[x];
        if (x - maxPts >= 0 && x - maxPts < k) s -= dp[x - maxPts];
    }
    return ans;
}`,
        javascript: `function new21Game(n, k, maxPts) {
  if (k === 0 || n >= k - 1 + maxPts) return 1;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  let s = 1, ans = 0;
  for (let x = 1; x <= n; x++) {
    dp[x] = s / maxPts;
    if (x < k) s += dp[x];
    else ans += dp[x];
    if (x - maxPts >= 0 && x - maxPts < k) s -= dp[x - maxPts];
  }
  return ans;
}`,
      },
    },
    {
      name: '直接加總的機率 DP',
      idea: '`dp[x] = Σ dp[x − i] / W`,i = 1..W,只加 `0 ≤ x − i < k` 的。',
      steps: ['`dp[0] = 1`', '`for x in 1..n`:`for i in 1..W`:`y = x − i`,`0 ≤ y < k` → `dp[x] += dp[y] / W`', '回傳 `sum(dp[k..n])`'],
      figure: { title: `n = ${N},k = ${K},maxPts = ${W}`, steps: naiveFig() },
      complexity: { time: 'O(n · W)', space: 'O(n)', why: '每格加 W 個。' },
      verdict: '轉移式最直白,用來理解「dp 是前面一段的和」;n、W 都是 10⁴ 時要 10⁸ 次,太慢。',
      code: {
        python: `def new21Game(n, k, maxPts):
    if k == 0:
        return 1.0
    dp = [0.0] * (n + 1)
    dp[0] = 1.0
    for x in range(1, n + 1):
        for i in range(1, maxPts + 1):
            y = x - i
            if 0 <= y < k:                    # 只有 < k 的分數會繼續抽
                dp[x] += dp[y] / maxPts
    return sum(dp[k:n + 1])`,
        c: `double new21Game(int n, int k, int maxPts) {
    if (k == 0) return 1.0;
    double *dp = calloc(n + 1, sizeof(double)), ans = 0;
    dp[0] = 1.0;
    for (int x = 1; x <= n; x++)
        for (int i = 1; i <= maxPts; i++) {
            int y = x - i;
            if (y >= 0 && y < k) dp[x] += dp[y] / maxPts;
        }
    for (int x = k; x <= n; x++) ans += dp[x];
    free(dp);
    return ans;
}`,
        cpp: `double new21Game(int n, int k, int maxPts) {
    if (k == 0) return 1.0;
    vector<double> dp(n + 1, 0.0);
    dp[0] = 1.0;
    for (int x = 1; x <= n; x++)
        for (int i = 1; i <= maxPts; i++) {
            int y = x - i;
            if (y >= 0 && y < k) dp[x] += dp[y] / maxPts;
        }
    double ans = 0;
    for (int x = k; x <= n; x++) ans += dp[x];
    return ans;
}`,
        java: `double new21Game(int n, int k, int maxPts) {
    if (k == 0) return 1.0;
    double[] dp = new double[n + 1];
    dp[0] = 1.0;
    for (int x = 1; x <= n; x++)
        for (int i = 1; i <= maxPts; i++) {
            int y = x - i;
            if (y >= 0 && y < k) dp[x] += dp[y] / maxPts;
        }
    double ans = 0;
    for (int x = k; x <= n; x++) ans += dp[x];
    return ans;
}`,
        javascript: `function new21Game(n, k, maxPts) {
  if (k === 0) return 1;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let x = 1; x <= n; x++)
    for (let i = 1; i <= maxPts; i++) {
      const y = x - i;
      if (y >= 0 && y < k) dp[x] += dp[y] / maxPts;
    }
  let ans = 0;
  for (let x = k; x <= n; x++) ans += dp[x];
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['把 ≥ k 的分數也算進視窗:分數到 k 就停了,不會再往後抽', 'k = 0 時一張都不抽,分數 0 ≤ n,答案是 1', '用整數除法算機率'],
  check: {
    kind: 'fn',
    fn: 'new21Game',
    compare: 'close',
    cases: [
      { args: [10, 1, 10], out: 1.0 },
      { args: [N, K, W], out: 0.6 },
      { args: [21, 17, 10], out: 0.7327777870686083 },
      { args: [0, 0, 1], out: 1.0 },
      { args: [5, 3, 2], out: 1.0 },
    ],
  },
}
