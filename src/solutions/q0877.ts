import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 877. Stone Game

const P = [5, 3, 4, 5]

function dpFig(): FigStep[] {
  const n = P.length
  const dp = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) dp[i][i] = P[i]
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      dp[i][j] = Math.max(P[i] - dp[i + 1][j], P[j] - dp[i][j - 1])
    }
  const grid = (upto: number): GridViewData => ({
    kind: 'grid',
    label: 'dp[i][j](列 i、欄 j)',
    cells: dp.map((row, i) => row.map((v, j) => (j >= i && j - i < upto ? v : ''))),
    marks: { hl: upto === n ? [[0, n - 1]] : [] },
  })
  return [
    { note: '兩人輪流從頭或尾拿一堆石頭,都採最佳策略。`dp[i][j]` = 只剩 piles[i..j] 時,**輪到的人**最多能比對手多拿幾顆', views: [arr(P, { label: 'piles' })] },
    { note: '只剩一堆:dp[i][i] = piles[i](直接拿走)', views: [grid(1)] },
    { note: '拿左邊:得到 piles[i],之後對手在 [i+1, j] 領先 dp[i+1][j] → 淨賺 piles[i] − dp[i+1][j];拿右邊同理。取較大者', views: [grid(2)] },
    { note: `由短區間算到長區間。dp[0][${n - 1}] = ${dp[0][n - 1]} > 0 → Alice 贏`, views: [grid(n)] },
  ]
}

function mathFig(): FigStep[] {
  return [
    { note: '數學觀察:堆數是偶數。把位置分成奇數號、偶數號兩組,Alice 可以**決定**自己全拿奇數組或全拿偶數組', views: [arr(P, { label: 'piles', highlight: [0, 2], compare: [1, 3] })] },
    { note: '總數是奇數(不會平手),兩組必有一組比較多 → Alice 選那組就必勝。所以答案永遠是 true', views: [arr(['true'], { label: '答案', done: [0] })] },
  ]
}

export const q0877: Solution = {
  id: 877,
  plain: 'Alice 和 Bob 面前有一排石頭堆(偶數堆,總數是奇數)。兩人輪流從最左或最右拿走一整堆,Alice 先拿。兩人都很聰明,Alice 會不會贏?',
  statement: '偶數堆石頭排成一列,`piles[i]` 為正整數,總和為奇數。Alice 先手,兩人輪流從**頭或尾**取走一整堆,最後石頭多者勝。假設兩人都採最佳策略,若 Alice 獲勝回傳 true。',
  examples: [
    { input: 'piles = [5,3,4,5]', output: 'true' },
    { input: 'piles = [3,7,2,3]', output: 'true' },
  ],
  constraints: ['2 ≤ n ≤ 500,n 為偶數'],
  insight: ['區間 DP:`dp[i][j]` = 輪到的人在 [i, j] 上能領先多少([[p:interval-dp]])', '對手的最佳結果要「減掉」:`piles[i] − dp[i+1][j]`', '偶數堆 + 總數奇數 → 先手必勝(奇偶位置策略)'],
  approaches: [
    {
      name: '區間 DP(分差)',
      idea: '`dp[i][j] = max(piles[i] − dp[i+1][j], piles[j] − dp[i][j−1])`;回傳 `dp[0][n−1] > 0`。',
      steps: ['`dp[i][i] = piles[i]`', '區間長度由 2 到 n', '`dp[i][j] = max(piles[i] − dp[i+1][j], piles[j] − dp[i][j−1])`', '回傳 `dp[0][n−1] > 0`'],
      figure: { title: `piles = [${P}]`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: 'n² / 2 個區間,每個 O(1)。可以壓成一維。' },
      verdict: '最推薦學會的寫法:「分差 DP」適用於所有這類兩人取數博弈(例如 486 題)。',
      code: {
        python: `def stoneGame(piles):
    n = len(piles)
    dp = [[0] * n for _ in range(n)]          # dp[i][j]:輪到的人在 [i, j] 領先幾顆
    for i in range(n):
        dp[i][i] = piles[i]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = max(piles[i] - dp[i + 1][j],   # 拿左邊
                           piles[j] - dp[i][j - 1])   # 拿右邊
    return dp[0][n - 1] > 0`,
        c: `bool stoneGame(int *piles, int pilesSize) {
    int n = pilesSize;
    int *dp = malloc(n * sizeof(int));        // 壓成一維:dp[i] 代表 dp[i][j]
    for (int i = 0; i < n; i++) dp[i] = piles[i];
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1, a = piles[i] - dp[i + 1], b = piles[j] - dp[i];
            dp[i] = a > b ? a : b;
        }
    bool win = dp[0] > 0;
    free(dp);
    return win;
}`,
        cpp: `bool stoneGame(vector<int>& piles) {
    int n = piles.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = piles[i];
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1]);
        }
    return dp[0][n - 1] > 0;
}`,
        java: `boolean stoneGame(int[] piles) {
    int n = piles.length;
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = piles[i];
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = Math.max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1]);
        }
    return dp[0][n - 1] > 0;
}`,
        javascript: `function stoneGame(piles) {
  const n = piles.length, dp = Array.from({ length: n }, (_, i) => {
    const row = new Array(n).fill(0);
    row[i] = piles[i];
    return row;
  });
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      dp[i][j] = Math.max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1]);
    }
  return dp[0][n - 1] > 0;
}`,
      },
    },
    {
      name: '數學:先手必勝',
      idea: '偶數堆時,先手能保證拿到全部奇數位或全部偶數位;總數奇數 → 兩組不相等 → 選大的那組必勝。',
      steps: ['算奇數位總和與偶數位總和(其實不用算)', '先手選較大的那組,每一步都拿那組的端點', '回傳 true'],
      figure: { title: `piles = [${P}]`, steps: mathFig() },
      complexity: { time: 'O(1)', space: 'O(1)', why: '直接回傳。' },
      verdict: '漂亮但只適用這題的特殊條件;條件一改(奇數堆、可以拿多堆…)就要回到 DP。',
      code: {
        python: `def stoneGame(piles):
    # 偶數堆:先手可以鎖定「全部奇數位」或「全部偶數位」,總和奇數不會平手
    return True`,
        c: `bool stoneGame(int *piles, int pilesSize) {
    return true;                              // 先手必勝
}`,
        cpp: `bool stoneGame(vector<int>& piles) {
    return true;
}`,
        java: `boolean stoneGame(int[] piles) {
    return true;
}`,
        javascript: `function stoneGame(piles) {
  return true;
}`,
      },
    },
  ],
  pitfalls: ['DP 只算「自己能拿多少」卻沒考慮對手也會最佳化', '貪心每次拿較大的端點:不保證最佳(雖然這題結果剛好還是 true)'],
  check: {
    kind: 'fn',
    fn: 'stoneGame',
    cases: [
      { args: [P], out: true },
      { args: [[3, 7, 2, 3]], out: true },
      { args: [[1, 100, 2, 3]], out: true },
    ],
  },
}
