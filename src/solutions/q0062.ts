import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 62. Unique Paths

const M = 3
const N = 5

function grid(dp: (number | string)[][], hl: Cell[] = [], cmp: Cell[] = []): GridViewData {
  return { kind: 'grid', label: 'dp[r][c] = 走到這格的路線數(左上角出發、右下角是終點)', cells: dp.map((r) => [...r]), marks: { hl, cmp } }
}

function dpFig(): FigStep[] {
  const dp: (number | string)[][] = Array.from({ length: M }, () => Array(N).fill(''))
  const out: FigStep[] = [{ note: '只能往右或往下走 → 走到 (r, c) 的最後一步,一定是從上面 (r−1, c) 或左邊 (r, c−1) 來的。路線數 = 兩邊的路線數相加', views: [grid(dp)] }]
  for (let r = 0; r < M; r++)
    for (let c = 0; c < N; c++) {
      if (r === 0 || c === 0) {
        dp[r][c] = 1
        if (r === 0 && c === N - 1) out.push({ note: '第一列、第一行只有一種走法(一直往右 / 一直往下)→ 全部是 1', views: [grid(dp, Array.from({ length: N }, (_, k) => [0, k] as Cell))] })
        continue
      }
      dp[r][c] = (dp[r - 1][c] as number) + (dp[r][c - 1] as number)
      out.push({ note: `dp[${r}][${c}] = 上面 ${dp[r - 1][c]} + 左邊 ${dp[r][c - 1]} = ${dp[r][c]}`, views: [grid(dp, [[r, c]], [[r - 1, c], [r, c - 1]])] })
    }
  out.push({ note: `右下角 = ${dp[M - 1][N - 1]}`, views: [grid(dp, [[M - 1, N - 1]])] })
  return out
}

function rowFig(): FigStep[] {
  const row = Array(N).fill(1)
  const out: FigStep[] = [{ note: '每一格只用到「上面」和「左邊」。用一列陣列就夠:更新前 row[c] 是上一列的值(上面),row[c−1] 已經是這一列的新值(左邊)', views: [arr(row, { label: '第 0 列' })] }]
  for (let r = 1; r < M; r++) {
    for (let c = 1; c < N; c++) row[c] += row[c - 1]
    out.push({ note: `第 ${r} 列:row[c] += row[c−1](由左到右)`, views: [arr([...row], { label: `第 ${r} 列` })] })
  }
  return out
}

function mathFig(): FigStep[] {
  return [
    { note: `另一個角度:從左上走到右下,一定剛好往下走 ${M - 1} 步、往右走 ${N - 1} 步,共 ${M + N - 2} 步。不同的路線 = 在這 ${M + N - 2} 步裡挑哪 ${M - 1} 步是「往下」`, views: [arr([...Array(M - 1).fill('↓'), ...Array(N - 1).fill('→')], { label: '一條路線 = 這些箭頭的一種排列' })] },
    { note: `答案 = C(${M + N - 2}, ${M - 1}) = ${comb(M + N - 2, M - 1)}`, views: [arr(['→', '↓', '→', '→', '↓', '→'], { label: '例如這一種' })] },
  ]
}

function comb(n: number, k: number): number {
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

export const q0062: Solution = {
  id: 62,
  plain: '機器人在一個 m × n 的方格左上角,每次只能往右或往下走一格,要走到右下角。總共有幾種不同的路線?',
  statement: '在 m × n 的網格上,從左上角走到右下角,每次只能向右或向下移動一格。回傳不同路徑的數量。',
  examples: [
    { input: 'm = 3, n = 7', output: '28' },
    { input: 'm = 3, n = 2', output: '3', note: '右下下、下右下、下下右' },
  ],
  constraints: ['`1 ≤ m, n ≤ 100`,答案 ≤ 2·10⁹'],
  insight: [
    '走到 (r, c) 的最後一步只能從上面或左邊來 → `dp[r][c] = dp[r−1][c] + dp[r][c−1]`',
    '第一列、第一行都只有一種走法(一路直走),是 1',
    '每格只看上面和左邊 → 只要一列陣列就夠(O(n) 空間)',
    '數學:總共要往下 m−1 步、往右 n−1 步,路線數就是「從 m+n−2 步裡挑 m−1 步往下」= C(m+n−2, m−1)',
  ],
  approaches: [
    {
      name: '二維 DP 表',
      idea: '`dp[r][c] = dp[r−1][c] + dp[r][c−1]`,第一列、第一行都是 1。',
      steps: ['`dp = m × n 全是 1`', '`for r in 1..m−1`、`for c in 1..n−1`:`dp[r][c] = dp[r−1][c] + dp[r][c−1]`', '回傳 `dp[m−1][n−1]`'],
      figure: { title: `m = ${M}, n = ${N}`, steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格算一次。' },
      verdict: '[[p:dp-grid]]最基本的題目:格子 DP 的轉移就是「從哪幾個方向過來」。',
      code: {
        python: `def uniquePaths(m, n):
    dp = [[1] * n for _ in range(m)]      # 第一列、第一行都只有一種走法
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # 從上面來 + 從左邊來
    return dp[m - 1][n - 1]`,
        c: `int uniquePaths(int m, int n) {
    int dp[100][100];
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            dp[r][c] = (r == 0 || c == 0) ? 1 : dp[r - 1][c] + dp[r][c - 1];
    return dp[m - 1][n - 1];
}`,
        cpp: `int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 1));
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
    return dp[m - 1][n - 1];
}`,
        java: `int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            dp[r][c] = (r == 0 || c == 0) ? 1 : dp[r - 1][c] + dp[r][c - 1];
    return dp[m - 1][n - 1];
}`,
        javascript: `function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
  return dp[m - 1][n - 1];
}`,
      },
    },
    {
      name: '一列陣列滾動',
      idea: '`row[c]` 更新前是「上面」,`row[c−1]` 是「左邊」(已經更新過)。所以 `row[c] += row[c−1]`。',
      steps: ['`row = [1] * n`', '重複 m − 1 次:`for c in 1..n−1`:`row[c] += row[c−1]`', '回傳 `row[n−1]`'],
      figure: { title: `m = ${M}, n = ${N}`, steps: rowFig() },
      complexity: { time: 'O(m · n)', space: 'O(n)', why: '只留一列。' },
      verdict: '格子 DP 的標準空間優化:只依賴上一列和同列左邊的,都可以壓成一維。',
      code: {
        python: `def uniquePaths(m, n):
    row = [1] * n
    for _ in range(m - 1):
        for c in range(1, n):
            row[c] += row[c - 1]          # 舊的 row[c] 是上面,row[c-1] 是左邊
    return row[-1]`,
        c: `int uniquePaths(int m, int n) {
    int row[100];
    for (int c = 0; c < n; c++) row[c] = 1;
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++) row[c] += row[c - 1];
    return row[n - 1];
}`,
        cpp: `int uniquePaths(int m, int n) {
    vector<int> row(n, 1);
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++) row[c] += row[c - 1];
    return row[n - 1];
}`,
        java: `int uniquePaths(int m, int n) {
    int[] row = new int[n];
    Arrays.fill(row, 1);
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++) row[c] += row[c - 1];
    return row[n - 1];
}`,
        javascript: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) row[c] += row[c - 1];
  return row[n - 1];
}`,
      },
    },
    {
      name: '組合數學',
      idea: '答案 = C(m + n − 2, m − 1)。一邊乘一邊除:`res = res · (n − 1 + i) / i`,i 從 1 到 m − 1,每一步都是整數。',
      steps: ['`res = 1`', '`for i in 1..m−1`:`res = res · (n − 1 + i) / i`', '回傳 res'],
      figure: { title: `m = ${M}, n = ${N}`, steps: mathFig() },
      complexity: { time: 'O(min(m, n))', space: 'O(1)', why: '只做 m − 1 次乘除。' },
      verdict: '最快,但要知道組合數的意義,而且中間值要用 64 位元避免溢位。',
      code: {
        python: `from math import comb

def uniquePaths(m, n):
    return comb(m + n - 2, m - 1)         # 從 m+n-2 步裡挑 m-1 步往下`,
        c: `int uniquePaths(int m, int n) {
    long long res = 1;
    for (int i = 1; i < m; i++) res = res * (n - 1 + i) / i;   // 每一步都是整數
    return (int)res;
}`,
        cpp: `int uniquePaths(int m, int n) {
    long long res = 1;
    for (int i = 1; i < m; i++) res = res * (n - 1 + i) / i;
    return (int)res;
}`,
        java: `int uniquePaths(int m, int n) {
    long res = 1;
    for (int i = 1; i < m; i++) res = res * (n - 1 + i) / i;
    return (int) res;
}`,
        javascript: `function uniquePaths(m, n) {
  let res = 1;
  for (let i = 1; i < m; i++) res = (res * (n - 1 + i)) / i;
  return Math.round(res);
}`,
      },
    },
  ],
  pitfalls: [
    '第一列、第一行沒有初始化成 1:它們沒有「上面」或「左邊」,要特別處理',
    '組合數直接算階乘:100! 遠超過任何整數型別,要邊乘邊除',
    '邊乘邊除的順序:要先乘再除(`res * x / i`),先除會有小數',
  ],
  followUp: [
    { q: '網格裡有障礙物?', a: '63. Unique Paths II:障礙格的 dp 設成 0,其他照舊。' },
    { q: '每格有數字,要路徑和最小?', a: '64. Minimum Path Sum:把「相加」換成「取 min 再加自己」。' },
  ],
  check: {
    kind: 'fn',
    fn: 'uniquePaths',
    cases: [
      { args: [3, 7], out: 28 },
      { args: [3, 2], out: 3 },
      { args: [1, 1], out: 1 },
      { args: [M, N], out: 15 },
      { args: [10, 10], out: 48620 },
      { args: [23, 12], out: 193536720 },
    ],
  },
}
