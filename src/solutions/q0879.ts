import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 879. Profitable Schemes

const N = 5
const MINP = 3
const GROUP = [2, 2]
const PROFIT = [2, 3]

function knapFig(): FigStep[] {
  const dp = Array.from({ length: N + 1 }, () => Array(MINP + 1).fill(0))
  dp[0][0] = 1
  const snaps: number[][][] = [dp.map((r) => [...r])]
  for (let c = 0; c < GROUP.length; c++) {
    for (let g = N; g >= GROUP[c]; g--)
      for (let p = MINP; p >= 0; p--) dp[g][Math.min(MINP, p + PROFIT[c])] += dp[g - GROUP[c]][p]
    snaps.push(dp.map((r) => [...r]))
  }
  const grid = (m: number[][], label: string): GridViewData => ({ kind: 'grid', label, cells: m, marks: {} })
  const total = dp.reduce((s, r) => s + r[MINP], 0)
  return [
    { note: `${N} 個人,每個犯罪計畫需要 group[i] 人、帶來 profit[i] 收益。選一些計畫,總人數 ≤ ${N}、總收益 ≥ ${MINP},有幾種選法?`, views: [arr(GROUP, { label: 'group' }), arr(PROFIT, { label: 'profit' })] },
    { note: '0/1 背包,兩個維度:`dp[g][p]` = 用了 g 個人、收益為 p 的選法數。關鍵:收益超過 minProfit 之後就**壓到 minProfit**(反正都算達標),狀態才不會爆', views: [grid(snaps[0], 'dp(列 = 人數 g,欄 = 收益 p,p 上限 3)')] },
    { note: '加入計畫 0(2 人,收益 2):dp[2][2] += dp[0][0]', views: [grid(snaps[1], '加入計畫 0 後')] },
    { note: '加入計畫 1(2 人,收益 3):收益 0 + 3、2 + 3 都壓到 3', views: [grid(snaps[2], '加入計畫 1 後')] },
    { note: `答案 = 所有 dp[g][${MINP}] 的和 = ${total}:{計畫 1}、{計畫 0, 1}`, views: [arr([total], { label: '答案', done: [0] })] },
  ]
}

function threeFig(): FigStep[] {
  return [
    { note: '還沒壓縮前的版本:`f[i][g][p]` = 只看前 i 個計畫的情況。不選第 i 個 → f[i−1][g][p];選 → f[i−1][g − group][max(0, p − profit)]', views: [arr(['f[i][g][p]', '= f[i−1][g][p]', '+ f[i−1][g−group[i]][max(0, p−profit[i])]'], { label: '三維轉移' })] },
    { note: '這裡 p 的意思是「還需要多少收益」,用 max(0, …) 截斷。答案 f[m][n][minProfit](「至多 n 人」的含義已經包含在 g 維度)', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}

export const q0879: Solution = {
  id: 879,
  plain: '一個幫派有 n 個成員,有一些犯罪計畫,每個計畫需要固定人數、帶來一定收益,而且一個人只能參加一個計畫。總收益至少 minProfit 的計畫組合有幾種?答案取餘 10⁹ + 7。',
  statement: 'n 名成員、`group[i]` 為第 i 項計畫所需人數、`profit[i]` 為其收益。一名成員最多參與一項計畫。**盈利計畫**是總收益 ≥ minProfit 且總人數 ≤ n 的計畫子集。回傳盈利計畫數,對 10⁹ + 7 取餘。',
  examples: [
    { input: 'n = 5, minProfit = 3, group = [2,2], profit = [2,3]', output: '2' },
    { input: 'n = 10, minProfit = 5, group = [2,3,5], profit = [6,7,8]', output: '7' },
  ],
  constraints: ['n、minProfit ≤ 100,計畫 ≤ 100'],
  insight: ['每個計畫選或不選 → 0/1 [[p:knapsack]],有兩個容量維度(人數、收益)', '收益只要 ≥ minProfit 就好 → 超過的部分壓到 minProfit', '倒著更新即可壓成二維'],
  approaches: [
    {
      name: '二維背包(收益封頂)',
      idea: '`dp[0][0] = 1`;每個計畫 (g, pr):`for used in n..g`、`for p in minP..0`:`dp[used][min(minP, p + pr)] += dp[used − g][p]`;答案 `Σ dp[*][minP]`。',
      steps: ['`dp = (n+1) × (minP+1)`、`dp[0][0] = 1`', '每個計畫:人數倒著、收益倒著更新', '收益 `min(minP, p + pr)` 封頂', '加總 `dp[g][minP]`,g = 0..n'],
      figure: { title: `n = ${N},minProfit = ${MINP}`, steps: knapFig() },
      complexity: { time: 'O(m · n · minP)', space: 'O(n · minP)', why: '10⁶ 次更新。' },
      verdict: '最推薦;「超過目標就封頂」是把無界維度變有限的關鍵技巧。',
      code: {
        python: `def profitableSchemes(n, minProfit, group, profit):
    MOD = 10 ** 9 + 7
    dp = [[0] * (minProfit + 1) for _ in range(n + 1)]
    dp[0][0] = 1                              # 什麼都不選
    for g, pr in zip(group, profit):
        for used in range(n, g - 1, -1):      # 0/1 背包:倒著更新
            for p in range(minProfit, -1, -1):
                q = min(minProfit, p + pr)    # 收益封頂
                dp[used][q] = (dp[used][q] + dp[used - g][p]) % MOD
    return sum(dp[used][minProfit] for used in range(n + 1)) % MOD`,
        c: `int profitableSchemes(int n, int minProfit, int *group, int groupSize, int *profit, int profitSize) {
    const long long MOD = 1000000007;
    long long dp[101][101] = {{0}};
    dp[0][0] = 1;
    for (int c = 0; c < groupSize; c++) {
        int g = group[c], pr = profit[c];
        for (int used = n; used >= g; used--)
            for (int p = minProfit; p >= 0; p--) {
                int q = p + pr < minProfit ? p + pr : minProfit;
                dp[used][q] = (dp[used][q] + dp[used - g][p]) % MOD;
            }
    }
    long long ans = 0;
    for (int used = 0; used <= n; used++) ans = (ans + dp[used][minProfit]) % MOD;
    return (int)ans;
}`,
        cpp: `int profitableSchemes(int n, int minProfit, vector<int>& group, vector<int>& profit) {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> dp(n + 1, vector<long long>(minProfit + 1, 0));
    dp[0][0] = 1;
    for (int c = 0; c < (int)group.size(); c++) {
        int g = group[c], pr = profit[c];
        for (int used = n; used >= g; used--)
            for (int p = minProfit; p >= 0; p--) {
                int q = min(minProfit, p + pr);
                dp[used][q] = (dp[used][q] + dp[used - g][p]) % MOD;
            }
    }
    long long ans = 0;
    for (int used = 0; used <= n; used++) ans = (ans + dp[used][minProfit]) % MOD;
    return ans;
}`,
        java: `int profitableSchemes(int n, int minProfit, int[] group, int[] profit) {
    final long MOD = 1_000_000_007;
    long[][] dp = new long[n + 1][minProfit + 1];
    dp[0][0] = 1;
    for (int c = 0; c < group.length; c++) {
        int g = group[c], pr = profit[c];
        for (int used = n; used >= g; used--)
            for (int p = minProfit; p >= 0; p--) {
                int q = Math.min(minProfit, p + pr);
                dp[used][q] = (dp[used][q] + dp[used - g][p]) % MOD;
            }
    }
    long ans = 0;
    for (int used = 0; used <= n; used++) ans = (ans + dp[used][minProfit]) % MOD;
    return (int) ans;
}`,
        javascript: `function profitableSchemes(n, minProfit, group, profit) {
  const MOD = 1e9 + 7;
  const dp = Array.from({ length: n + 1 }, () => new Array(minProfit + 1).fill(0));
  dp[0][0] = 1;
  group.forEach((g, c) => {
    for (let used = n; used >= g; used--)
      for (let p = minProfit; p >= 0; p--) {
        const q = Math.min(minProfit, p + profit[c]);
        dp[used][q] = (dp[used][q] + dp[used - g][p]) % MOD;
      }
  });
  let ans = 0;
  for (let used = 0; used <= n; used++) ans = (ans + dp[used][minProfit]) % MOD;
  return ans;
}`,
      },
    },
    {
      name: '三維 DP(還需要的收益)',
      idea: '`f[i][g][p]` = 前 i 個計畫、可用人數 ≤ g、還需要收益 p 時的方法數;`f[0][g][0] = 1`;`f[i][g][p] = f[i−1][g][p] + f[i−1][g − gi][max(0, p − pi)]`。',
      steps: ['`f[0][g][0] = 1`(g = 0..n)', '`for i`、`for g`、`for p`:不選 + 選(人數夠才選)', '回傳 `f[m][n][minProfit]`'],
      figure: { title: `n = ${N},minProfit = ${MINP}`, steps: threeFig() },
      complexity: { time: 'O(m · n · minP)', space: 'O(m · n · minP)', why: '三維表;可以滾動成兩層。' },
      verdict: '定義成「人數上限」與「還需要的收益」,答案直接是一格,不用最後再加總。',
      code: {
        python: `def profitableSchemes(n, minProfit, group, profit):
    MOD = 10 ** 9 + 7
    # prev[g][p]:可用 ≤ g 人、還需要 p 收益的方法數
    prev = [[1 if p == 0 else 0 for p in range(minProfit + 1)] for _ in range(n + 1)]
    for gi, pi in zip(group, profit):
        cur = [row[:] for row in prev]        # 不選這個計畫
        for g in range(gi, n + 1):
            for p in range(minProfit + 1):
                cur[g][p] = (cur[g][p] + prev[g - gi][max(0, p - pi)]) % MOD
        prev = cur
    return prev[n][minProfit]`,
        c: `int profitableSchemes(int n, int minProfit, int *group, int groupSize, int *profit, int profitSize) {
    const long long MOD = 1000000007;
    static long long prev[101][101], cur[101][101];
    for (int g = 0; g <= n; g++) for (int p = 0; p <= minProfit; p++) prev[g][p] = p == 0;
    for (int c = 0; c < groupSize; c++) {
        int gi = group[c], pi = profit[c];
        for (int g = 0; g <= n; g++)
            for (int p = 0; p <= minProfit; p++) {
                long long v = prev[g][p];
                if (g >= gi) v += prev[g - gi][p - pi > 0 ? p - pi : 0];
                cur[g][p] = v % MOD;
            }
        memcpy(prev, cur, sizeof prev);
    }
    return (int)prev[n][minProfit];
}`,
        cpp: `int profitableSchemes(int n, int minProfit, vector<int>& group, vector<int>& profit) {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> prev(n + 1, vector<long long>(minProfit + 1, 0));
    for (int g = 0; g <= n; g++) prev[g][0] = 1;
    for (int c = 0; c < (int)group.size(); c++) {
        auto cur = prev;
        for (int g = group[c]; g <= n; g++)
            for (int p = 0; p <= minProfit; p++)
                cur[g][p] = (cur[g][p] + prev[g - group[c]][max(0, p - profit[c])]) % MOD;
        prev = cur;
    }
    return prev[n][minProfit];
}`,
        java: `int profitableSchemes(int n, int minProfit, int[] group, int[] profit) {
    final long MOD = 1_000_000_007;
    long[][] prev = new long[n + 1][minProfit + 1];
    for (int g = 0; g <= n; g++) prev[g][0] = 1;
    for (int c = 0; c < group.length; c++) {
        long[][] cur = new long[n + 1][];
        for (int g = 0; g <= n; g++) cur[g] = prev[g].clone();
        for (int g = group[c]; g <= n; g++)
            for (int p = 0; p <= minProfit; p++)
                cur[g][p] = (cur[g][p] + prev[g - group[c]][Math.max(0, p - profit[c])]) % MOD;
        prev = cur;
    }
    return (int) prev[n][minProfit];
}`,
        javascript: `function profitableSchemes(n, minProfit, group, profit) {
  const MOD = 1e9 + 7;
  let prev = Array.from({ length: n + 1 }, () => Array.from({ length: minProfit + 1 }, (_, p) => (p === 0 ? 1 : 0)));
  group.forEach((gi, c) => {
    const cur = prev.map((row) => [...row]);
    for (let g = gi; g <= n; g++)
      for (let p = 0; p <= minProfit; p++) cur[g][p] = (cur[g][p] + prev[g - gi][Math.max(0, p - profit[c])]) % MOD;
    prev = cur;
  });
  return prev[n][minProfit];
}`,
      },
    },
  ],
  pitfalls: ['收益維度開到總收益:最多 100 × 100,狀態暴增;封頂到 minProfit 即可', '二維寫法順著更新人數:同一個計畫會被選兩次', '忘了「什麼都不選」:minProfit = 0 時空集合也算一種'],
  check: {
    kind: 'fn',
    fn: 'profitableSchemes',
    cases: [
      { args: [N, MINP, GROUP, PROFIT], out: 2 },
      { args: [10, 5, [2, 3, 5], [6, 7, 8]], out: 7 },
      { args: [1, 1, [1, 1, 1, 1, 2, 2, 1, 2, 1, 1], [0, 1, 0, 0, 1, 1, 1, 0, 2, 2]], out: 4 },
      { args: [5, 0, [1, 2], [0, 0]], out: 4 },
    ],
  },
}
