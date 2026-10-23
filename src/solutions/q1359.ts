import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1359. Count All Valid Pickup and Delivery Options

function insertFig(): FigStep[] {
  return [
    { note: 'n 筆訂單,每筆要先取貨 P 再送貨 D。n = 1 只有 "P1 D1" 一種', views: [arr(['P1', 'D1'], { label: 'n = 1' })] },
    { note: '已經排好 n − 1 筆(2n − 2 個位置)後,插入第 n 筆:P、D 放進 2n 個空位,共 C(2n, 2) 種,而 P 必須在 D 前面 → 恰好一種順序', views: [arr(['_', 'P1', '_', 'D1', '_'], { label: '3 個空隙可以放 P2 / D2' })] },
    { note: '新增倍數 = 2n × (2n − 1) / 2 = n × (2n − 1)。n = 2:1 × 3 × 2 = 6;n = 3:6 × 3 × 5 = 90', views: [arr([1, 6, 90], { label: 'n = 1, 2, 3', done: [2] })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: 'DP 觀點:狀態 (p, d) = 還有 p 筆沒取、d 筆已取未送。下一步可以取任一筆未取的(p 種),或送任一筆已取的(d 種)', views: [arr(['(p, d) → (p − 1, d + 1):p 種', '(p, d) → (p, d − 1):d 種'], { label: '轉移' })] },
    { note: '`f(p, d) = p × f(p−1, d+1) + d × f(p, d−1)`,`f(0, 0) = 1`;答案 f(n, 0)', views: [arr([6], { label: 'f(2, 0)', done: [0] })] },
  ]
}

export const q1359: Solution = {
  id: 1359,
  plain: '有 n 筆外送訂單,每筆都要先取貨再送貨。把所有 2n 個動作排成一個順序,有幾種合法的排法?答案很大要取餘 10⁹ + 7。',
  statement: '給 n 筆訂單,每筆包含取貨 P 與送貨 D。計算所有合法的取 / 送順序數(對每筆訂單 i,`Pi` 必須在 `Di` 之前)。回傳答案對 10⁹ + 7 取餘。',
  examples: [
    { input: 'n = 1', output: '1' },
    { input: 'n = 2', output: '6' },
    { input: 'n = 3', output: '90' },
  ],
  constraints: ['1 ≤ n ≤ 500'],
  insight: ['一筆一筆插入:第 n 筆有 n(2n − 1) 種插法 → 連乘', '也可以想成 (2n)! / 2ⁿ(每筆的 P、D 順序固定)', 'DP 狀態:還沒取的數量、已取未送的數量'],
  approaches: [
    {
      name: '逐筆插入的連乘公式',
      idea: '`ans = Π_{i=1..n} i × (2i − 1)`(取餘)。',
      steps: ['`ans = 1`', '`for i in 1..n`:`ans = ans * i * (2i − 1) % MOD`', '回傳 ans'],
      figure: { title: 'n = 3', steps: insertFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一個迴圈。' },
      verdict: '最推薦;組合數學的「插空法」。',
      code: {
        python: `def countOrders(n):
    MOD = 10 ** 9 + 7
    ans = 1
    for i in range(1, n + 1):
        ans = ans * i * (2 * i - 1) % MOD     # 第 i 筆的 P、D 插進 2i 個位置
    return ans`,
        c: `int countOrders(int n) {
    const long long MOD = 1000000007;
    long long ans = 1;
    for (long long i = 1; i <= n; i++) ans = ans * i % MOD * (2 * i - 1) % MOD;
    return (int)ans;
}`,
        cpp: `int countOrders(int n) {
    const long long MOD = 1e9 + 7;
    long long ans = 1;
    for (long long i = 1; i <= n; i++) ans = ans * i % MOD * (2 * i - 1) % MOD;
    return ans;
}`,
        java: `int countOrders(int n) {
    final long MOD = 1_000_000_007;
    long ans = 1;
    for (long i = 1; i <= n; i++) ans = ans * i % MOD * (2 * i - 1) % MOD;
    return (int) ans;
}`,
        javascript: `function countOrders(n) {
  const MOD = 1000000007n;
  let ans = 1n;
  for (let i = 1n; i <= BigInt(n); i++) ans = (ans * i * (2n * i - 1n)) % MOD;
  return Number(ans);
}`,
      },
    },
    {
      name: '二維 DP(未取 / 未送)',
      idea: '`f[p][d]` = 剩 p 筆未取、d 筆待送時的排法數;`f[p][d] = p × f[p−1][d+1] + d × f[p][d−1]`。',
      steps: ['`f[0][0] = 1`', '依 p 由小到大、d 由小到大(p + d ≤ n)', '套轉移式並取餘', '回傳 `f[n][0]`'],
      figure: { title: 'n = 2', steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '約 n² / 2 個狀態。' },
      verdict: '不需要看出公式;「下一步做什麼」的狀態 DP 是通用武器。',
      code: {
        python: `def countOrders(n):
    MOD = 10 ** 9 + 7
    f = [[0] * (n + 2) for _ in range(n + 2)]
    f[0][0] = 1
    for p in range(n + 1):
        for d in range(n + 1 - p):
            if p == 0 and d == 0:
                continue
            v = 0
            if p:
                v += p * f[p - 1][d + 1]      # 取一筆還沒取的
            if d:
                v += d * f[p][d - 1]          # 送一筆已取的
            f[p][d] = v % MOD
    return f[n][0]`,
        c: `int countOrders(int n) {
    const long long MOD = 1000000007;
    long long (*f)[502] = calloc(n + 2, sizeof *f);
    f[0][0] = 1;
    for (int p = 0; p <= n; p++)
        for (int d = 0; p + d <= n; d++) {
            if (!p && !d) continue;
            long long v = 0;
            if (p) v += p * f[p - 1][d + 1] % MOD;
            if (d) v += d * f[p][d - 1] % MOD;
            f[p][d] = v % MOD;
        }
    int ans = (int)f[n][0];
    free(f);
    return ans;
}`,
        cpp: `int countOrders(int n) {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> f(n + 2, vector<long long>(n + 2, 0));
    f[0][0] = 1;
    for (int p = 0; p <= n; p++)
        for (int d = 0; p + d <= n; d++) {
            if (!p && !d) continue;
            long long v = 0;
            if (p) v += p * f[p - 1][d + 1] % MOD;
            if (d) v += d * f[p][d - 1] % MOD;
            f[p][d] = v % MOD;
        }
    return f[n][0];
}`,
        java: `int countOrders(int n) {
    final long MOD = 1_000_000_007;
    long[][] f = new long[n + 2][n + 2];
    f[0][0] = 1;
    for (int p = 0; p <= n; p++)
        for (int d = 0; p + d <= n; d++) {
            if (p == 0 && d == 0) continue;
            long v = 0;
            if (p > 0) v += p * f[p - 1][d + 1] % MOD;
            if (d > 0) v += d * f[p][d - 1] % MOD;
            f[p][d] = v % MOD;
        }
    return (int) f[n][0];
}`,
        javascript: `function countOrders(n) {
  const MOD = 1000000007n;
  const f = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0n));
  f[0][0] = 1n;
  for (let p = 0; p <= n; p++)
    for (let d = 0; p + d <= n; d++) {
      if (!p && !d) continue;
      let v = 0n;
      if (p) v += BigInt(p) * f[p - 1][d + 1];
      if (d) v += BigInt(d) * f[p][d - 1];
      f[p][d] = v % MOD;
    }
  return Number(f[n][0]);
}`,
      },
    },
  ],
  pitfalls: ['連乘時沒有每步取餘:很快就溢位', 'JavaScript 的 Number 乘到 10¹⁸ 會失去精度:用 BigInt', 'DP 的計算順序:f[p][d] 依賴 f[p−1][d+1],p 要由小到大'],
  check: {
    kind: 'fn',
    fn: 'countOrders',
    cases: [
      { args: [1], out: 1 },
      { args: [2], out: 6 },
      { args: [3], out: 90 },
      { args: [8], out: 729647433 },
      { args: [500], out: 764678010 },
    ],
  },
}
