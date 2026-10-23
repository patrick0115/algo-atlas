import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 920. Number of Music Playlists

const N = 2
const GOAL = 3
const K = 0

function dpFig(): FigStep[] {
  const dp = Array.from({ length: GOAL + 1 }, () => Array(N + 1).fill(0))
  dp[0][0] = 1
  for (let i = 1; i <= GOAL; i++)
    for (let j = 1; j <= N; j++) dp[i][j] = dp[i - 1][j - 1] * (N - j + 1) + dp[i - 1][j] * Math.max(j - K, 0)
  const grid: GridViewData = { kind: 'grid', label: 'dp[i][j](列 = 歌單長度 i,欄 = 用了 j 首不同的歌)', cells: dp, marks: { hl: [[GOAL, N]] } }
  return [
    { note: `有 ${N} 首歌,要排出長度 ${GOAL} 的歌單:每首至少出現一次,而且同一首歌重播之前,中間至少要隔 ${K} 首別的歌`, views: [arr(['1 1 2', '1 2 1', '1 2 2', '2 1 1', '2 1 2', '2 2 1'], { label: 'n = 2、goal = 3、k = 0 的所有歌單' })] },
    { note: '`dp[i][j]` = 長度 i、恰好用了 j 首不同歌的歌單數。第 i 首是**新歌** → 從沒聽過的 n − (j−1) 首挑:`dp[i−1][j−1] × (n − j + 1)`', views: [arr(['新歌:dp[i−1][j−1] × (n − j + 1)'], { label: '情況 ①' })] },
    { note: '第 i 首是**舊歌** → 已聽過的 j 首中,最近 k 首不能選:`dp[i−1][j] × max(j − k, 0)`', views: [arr(['舊歌:dp[i−1][j] × (j − k)'], { label: '情況 ②' })] },
    { note: `答案 dp[${GOAL}][${N}] = ${dp[GOAL][N]}`, views: [grid] },
  ]
}

function memoFig(): FigStep[] {
  return [
    { note: '由上往下的記憶化寫法:`f(i, j)` 直接照兩種情況遞迴,`f(0, 0) = 1`,`f(0, j>0) = f(i>0, 0) = 0`', views: [arr(['f(i, j) = f(i−1, j−1)(n−j+1) + f(i−1, j) max(j−k, 0)'], { label: '遞迴式' })] },
    { note: '狀態 goal × n ≤ 10⁴,每個 O(1)', views: [arr([6], { label: '答案', done: [0] })] },
  ]
}

export const q0920: Solution = {
  id: 920,
  plain: '手機裡有 n 首不同的歌,要排一張長度 goal 的播放清單:每首歌至少要出現一次,而且同一首歌要再播之前,中間至少要隔 k 首別的歌。有幾種排法?答案取餘 10⁹ + 7。',
  statement: '有 n 首不同的歌,要建立長度為 `goal` 的播放清單(歌曲可重複),要求:每首歌至少播放一次;一首歌只有在其他 k 首歌播放過之後才能再次播放。回傳可能的播放清單數量,對 10⁹ + 7 取餘。',
  examples: [
    { input: 'n = 3, goal = 3, k = 1', output: '6' },
    { input: 'n = 2, goal = 3, k = 0', output: '6' },
    { input: 'n = 2, goal = 3, k = 1', output: '2', note: '[1,2,1]、[2,1,2]' },
  ],
  constraints: ['0 ≤ k < n ≤ goal ≤ 100'],
  insight: ['狀態:目前長度 i、已經用過 j 首不同的歌', '下一首要嘛是新歌(n − j 種),要嘛是舊歌(j − k 種,避開最近 k 首)', '[[p:dp-general]] 的二維計數'],
  approaches: [
    {
      name: '二維 DP',
      idea: '`dp[i][j] = dp[i−1][j−1] × (n − j + 1) + dp[i−1][j] × max(j − k, 0)`;答案 `dp[goal][n]`。',
      steps: ['`dp[0][0] = 1`', '`for i in 1..goal`、`for j in 1..min(i, n)`', '新歌 + 舊歌兩項相加取餘', '回傳 `dp[goal][n]`'],
      figure: { title: `n = ${N},goal = ${GOAL},k = ${K}`, steps: dpFig() },
      complexity: { time: 'O(goal · n)', space: 'O(goal · n)', why: '每個狀態 O(1)。' },
      verdict: '最推薦;「新的還是舊的」是計數 DP 很常見的切法。',
      code: {
        python: `def numMusicPlaylists(n, goal, k):
    MOD = 10 ** 9 + 7
    dp = [[0] * (n + 1) for _ in range(goal + 1)]
    dp[0][0] = 1
    for i in range(1, goal + 1):
        for j in range(1, min(i, n) + 1):
            dp[i][j] = (dp[i - 1][j - 1] * (n - j + 1)       # 第 i 首放新歌
                        + dp[i - 1][j] * max(j - k, 0)) % MOD  # 放舊歌,避開最近 k 首
    return dp[goal][n]`,
        c: `int numMusicPlaylists(int n, int goal, int k) {
    const long long MOD = 1000000007;
    long long dp[101][101] = {{0}};
    dp[0][0] = 1;
    for (int i = 1; i <= goal; i++)
        for (int j = 1; j <= n && j <= i; j++) {
            long long v = dp[i - 1][j - 1] * (n - j + 1) % MOD;
            if (j > k) v += dp[i - 1][j] * (j - k) % MOD;
            dp[i][j] = v % MOD;
        }
    return (int)dp[goal][n];
}`,
        cpp: `int numMusicPlaylists(int n, int goal, int k) {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> dp(goal + 1, vector<long long>(n + 1, 0));
    dp[0][0] = 1;
    for (int i = 1; i <= goal; i++)
        for (int j = 1; j <= min(i, n); j++)
            dp[i][j] = (dp[i - 1][j - 1] * (n - j + 1) + dp[i - 1][j] * max(j - k, 0)) % MOD;
    return dp[goal][n];
}`,
        java: `int numMusicPlaylists(int n, int goal, int k) {
    final long MOD = 1_000_000_007;
    long[][] dp = new long[goal + 1][n + 1];
    dp[0][0] = 1;
    for (int i = 1; i <= goal; i++)
        for (int j = 1; j <= Math.min(i, n); j++)
            dp[i][j] = (dp[i - 1][j - 1] * (n - j + 1) + dp[i - 1][j] * Math.max(j - k, 0)) % MOD;
    return (int) dp[goal][n];
}`,
        javascript: `function numMusicPlaylists(n, goal, k) {
  const MOD = 1000000007n;
  const dp = Array.from({ length: goal + 1 }, () => new Array(n + 1).fill(0n));
  dp[0][0] = 1n;
  for (let i = 1; i <= goal; i++)
    for (let j = 1; j <= Math.min(i, n); j++)
      dp[i][j] = (dp[i - 1][j - 1] * BigInt(n - j + 1) + dp[i - 1][j] * BigInt(Math.max(j - k, 0))) % MOD;
  return Number(dp[goal][n]);
}`,
      },
    },
    {
      name: '記憶化遞迴',
      idea: '`f(i, j)`:`i == 0` → `j == 0 ? 1 : 0`;`j == 0` → 0;否則照兩種情況遞迴並記憶化。',
      steps: ['`f(0, 0) = 1`,其他邊界為 0', '`f(i, j) = f(i−1, j−1) × (n − j + 1) + f(i−1, j) × max(j − k, 0)`', '回傳 `f(goal, n)`'],
      figure: { title: `n = ${N},goal = ${GOAL},k = ${K}`, steps: memoFig() },
      complexity: { time: 'O(goal · n)', space: 'O(goal · n)', why: '每個狀態算一次。' },
      verdict: '從「最後一首放什麼」往回推,和題目描述的思路最接近。',
      code: {
        python: `from functools import lru_cache

def numMusicPlaylists(n, goal, k):
    MOD = 10 ** 9 + 7

    @lru_cache(None)
    def f(i, j):                              # 長度 i、用了 j 首不同的歌
        if i == 0:
            return 1 if j == 0 else 0
        if j == 0:
            return 0
        return (f(i - 1, j - 1) * (n - j + 1) + f(i - 1, j) * max(j - k, 0)) % MOD

    return f(goal, n)`,
        c: `static long long memo[101][101];
static int Nn, Kk;

static long long f(int i, int j) {
    if (i == 0) return j == 0;
    if (j == 0) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    long long v = f(i - 1, j - 1) * (Nn - j + 1) % 1000000007;
    if (j > Kk) v += f(i - 1, j) * (j - Kk) % 1000000007;
    return memo[i][j] = v % 1000000007;
}

int numMusicPlaylists(int n, int goal, int k) {
    Nn = n; Kk = k;
    for (int i = 0; i <= goal; i++) for (int j = 0; j <= n; j++) memo[i][j] = -1;
    return (int)f(goal, n);
}`,
        cpp: `int numMusicPlaylists(int n, int goal, int k) {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> memo(goal + 1, vector<long long>(n + 1, -1));
    function<long long(int, int)> f = [&](int i, int j) -> long long {
        if (i == 0) return j == 0;
        if (j == 0) return 0;
        if (memo[i][j] >= 0) return memo[i][j];
        return memo[i][j] = (f(i - 1, j - 1) * (n - j + 1) + f(i - 1, j) * max(j - k, 0)) % MOD;
    };
    return f(goal, n);
}`,
        java: `long[][] memo;
int Nn, Kk;

long f(int i, int j) {
    if (i == 0) return j == 0 ? 1 : 0;
    if (j == 0) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    return memo[i][j] = (f(i - 1, j - 1) * (Nn - j + 1) + f(i - 1, j) * Math.max(j - Kk, 0)) % 1_000_000_007;
}

int numMusicPlaylists(int n, int goal, int k) {
    Nn = n; Kk = k;
    memo = new long[goal + 1][n + 1];
    for (long[] row : memo) Arrays.fill(row, -1);
    return (int) f(goal, n);
}`,
        javascript: `function numMusicPlaylists(n, goal, k) {
  const MOD = 1000000007n, memo = new Map();
  const f = (i, j) => {
    if (i === 0) return j === 0 ? 1n : 0n;
    if (j === 0) return 0n;
    const key = i * 101 + j;
    if (memo.has(key)) return memo.get(key);
    const v = (f(i - 1, j - 1) * BigInt(n - j + 1) + f(i - 1, j) * BigInt(Math.max(j - k, 0))) % MOD;
    memo.set(key, v);
    return v;
  };
  return Number(f(goal, n));
}`,
      },
    },
  ],
  pitfalls: ['舊歌的可選數寫成 j:最近 k 首不能重播,要 j − k(且不小於 0)', '答案取 dp[goal][任意 j]:題目要求每首歌都要出現,必須 j = n', '乘法沒有取餘就相加:中間值會溢位'],
  check: {
    kind: 'fn',
    fn: 'numMusicPlaylists',
    cases: [
      { args: [3, 3, 1], out: 6 },
      { args: [N, GOAL, K], out: 6 },
      { args: [2, 3, 1], out: 2 },
      { args: [16, 32, 4], out: 322517545 },
    ],
  },
}
