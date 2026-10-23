import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 64. Minimum Path Sum

const G = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1],
]

function dpFig(): FigStep[] {
  const R = G.length
  const C = G[0].length
  const dp = G.map((row) => [...row])
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (r === 0 && c === 0) continue
      const up = r > 0 ? dp[r - 1][c] : Infinity
      const left = c > 0 ? dp[r][c - 1] : Infinity
      dp[r][c] += Math.min(up, left)
    }
  const view = (label: string, cells: number[][], path: [number, number][] = []): GridViewData => ({ kind: 'grid', label, cells, marks: { done: path } })
  return [
    { note: '從左上走到右下,只能往右或往下,路上的數字加總要最小', views: [view('grid', G)] },
    { note: '`dp[r][c]` = 走到 (r, c) 的最小總和。只能從上面或左邊來:`dp[r][c] = grid[r][c] + min(上, 左)`;第一列、第一欄只有一個方向', views: [view('dp', dp)] },
    { note: `最佳路徑 1 → 3 → 1 → 1 → 1,總和 ${dp[R - 1][C - 1]}`, views: [view('最佳路徑', G, [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]), arr([dp[R - 1][C - 1]], { label: '答案', done: [0] })] },
  ]
}

function rollFig(): FigStep[] {
  return [
    { note: '一列一列算時,只需要上一列 → 一維陣列 `dp[c]`:更新前的 dp[c] 是「上面」,dp[c−1] 是「左邊」(已經更新過)', views: [arr([1, 4, 5], { label: '第 0 列後' })] },
    { note: '第 1 列:[2, 7, 6];第 2 列:[6, 8, 7]。答案 7', views: [arr([6, 8, 7], { label: '第 2 列後', done: [2] })] },
  ]
}

export const q0064: Solution = {
  id: 64,
  plain: '一個填滿非負數字的方格,從左上角走到右下角,每次只能往右或往下。怎麼走讓路上經過的數字總和最小?',
  statement: '給 `m × n` 的非負整數網格 `grid`,找出從左上角到右下角、路徑上數字總和最小的路徑(每次只能向下或向右移動一步),回傳該最小總和。',
  examples: [
    { input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]', output: '7', note: '1 → 3 → 1 → 1 → 1' },
    { input: 'grid = [[1,2,3],[4,5,6]]', output: '12' },
  ],
  constraints: ['m, n ≤ 200'],
  insight: ['每格只能從上或左來 → [[p:dp-grid]]', '`dp[r][c] = grid[r][c] + min(dp[r−1][c], dp[r][c−1])`', '和 [62](#/q/62) 不同路徑同一個結構,只是從「加總」變「取最小」'],
  approaches: [
    {
      name: '二維 DP',
      idea: '`dp[0][0] = grid[0][0]`;第一列、第一欄累加;其他格 `grid + min(上, 左)`。',
      steps: ['`dp = grid` 的拷貝', '第一列:`dp[0][c] += dp[0][c−1]`;第一欄:`dp[r][0] += dp[r−1][0]`', '其餘:`dp[r][c] += min(dp[r−1][c], dp[r][c−1])`', '回傳 `dp[m−1][n−1]`'],
      figure: { title: 'grid(3 × 3)', steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格 O(1)。可以直接在 grid 上改。' },
      verdict: '最推薦,網格 DP 的入門題。',
      code: {
        python: `def minPathSum(grid):
    R, C = len(grid), len(grid[0])
    dp = [row[:] for row in grid]
    for r in range(R):
        for c in range(C):
            if r == 0 and c == 0:
                continue
            up = dp[r - 1][c] if r else float('inf')
            left = dp[r][c - 1] if c else float('inf')
            dp[r][c] += min(up, left)         # 從上或從左來,選小的
    return dp[R - 1][C - 1]`,
        c: `int minPathSum(int **grid, int gridSize, int *gridColSize) {
    int R = gridSize, C = gridColSize[0];
    int *dp = malloc(R * C * sizeof(int));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            int v = grid[r][c];
            if (r == 0 && c == 0) dp[0] = v;
            else if (r == 0) dp[c] = dp[c - 1] + v;
            else if (c == 0) dp[r * C] = dp[(r - 1) * C] + v;
            else dp[r * C + c] = v + (dp[(r - 1) * C + c] < dp[r * C + c - 1] ? dp[(r - 1) * C + c] : dp[r * C + c - 1]);
        }
    int ans = dp[R * C - 1];
    free(dp);
    return ans;
}`,
        cpp: `int minPathSum(vector<vector<int>>& grid) {
    int R = grid.size(), C = grid[0].size();
    vector<vector<int>> dp = grid;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (!r && !c) continue;
            int up = r ? dp[r - 1][c] : INT_MAX, left = c ? dp[r][c - 1] : INT_MAX;
            dp[r][c] += min(up, left);
        }
    return dp[R - 1][C - 1];
}`,
        java: `int minPathSum(int[][] grid) {
    int R = grid.length, C = grid[0].length;
    int[][] dp = new int[R][C];
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            dp[r][c] = grid[r][c];
            if (r == 0 && c == 0) continue;
            int up = r > 0 ? dp[r - 1][c] : Integer.MAX_VALUE, left = c > 0 ? dp[r][c - 1] : Integer.MAX_VALUE;
            dp[r][c] += Math.min(up, left);
        }
    return dp[R - 1][C - 1];
}`,
        javascript: `function minPathSum(grid) {
  const R = grid.length, C = grid[0].length, dp = grid.map((row) => [...row]);
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (!r && !c) continue;
      dp[r][c] += Math.min(r ? dp[r - 1][c] : Infinity, c ? dp[r][c - 1] : Infinity);
    }
  return dp[R - 1][C - 1];
}`,
      },
    },
    {
      name: '一維滾動',
      idea: '`dp[c]` 代表目前這一列;`dp[c] = grid[r][c] + min(dp[c](上), dp[c−1](左))`。',
      steps: ['`dp = [∞] * n`、`dp[0] = 0`', '`for r`:`for c`:`dp[c] = grid[r][c] + min(dp[c], dp[c−1] if c else ∞)`', '回傳 `dp[n−1]`'],
      figure: { title: 'grid(3 × 3)', steps: rollFig() },
      complexity: { time: 'O(m · n)', space: 'O(n)', why: '只存一列。' },
      verdict: '網格 DP 的標準空間壓縮。',
      code: {
        python: `def minPathSum(grid):
    C = len(grid[0])
    dp = [float('inf')] * C
    dp[0] = 0
    for row in grid:
        for c in range(C):
            left = dp[c - 1] if c else float('inf')
            dp[c] = row[c] + min(dp[c], left)  # dp[c] 舊值 = 上面
    return dp[-1]`,
        c: `int minPathSum(int **grid, int gridSize, int *gridColSize) {
    int C = gridColSize[0], *dp = malloc(C * sizeof(int));
    for (int c = 0; c < C; c++) dp[c] = INT_MAX;
    dp[0] = 0;
    for (int r = 0; r < gridSize; r++)
        for (int c = 0; c < C; c++) {
            int best = dp[c];
            if (c && dp[c - 1] < best) best = dp[c - 1];
            dp[c] = grid[r][c] + best;
        }
    int ans = dp[C - 1];
    free(dp);
    return ans;
}`,
        cpp: `int minPathSum(vector<vector<int>>& grid) {
    int C = grid[0].size();
    vector<int> dp(C, INT_MAX);
    dp[0] = 0;
    for (auto &row : grid)
        for (int c = 0; c < C; c++) dp[c] = row[c] + min(dp[c], c ? dp[c - 1] : INT_MAX);
    return dp[C - 1];
}`,
        java: `int minPathSum(int[][] grid) {
    int C = grid[0].length;
    int[] dp = new int[C];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int[] row : grid)
        for (int c = 0; c < C; c++) dp[c] = row[c] + Math.min(dp[c], c > 0 ? dp[c - 1] : Integer.MAX_VALUE);
    return dp[C - 1];
}`,
        javascript: `function minPathSum(grid) {
  const C = grid[0].length, dp = new Array(C).fill(Infinity);
  dp[0] = 0;
  for (const row of grid) for (let c = 0; c < C; c++) dp[c] = row[c] + Math.min(dp[c], c ? dp[c - 1] : Infinity);
  return dp[C - 1];
}`,
      },
    },
  ],
  pitfalls: ['第一列、第一欄沒有特別處理:會用到不存在的格子', '用 BFS / Dijkstra:可以但沒必要,只能往右、往下時 DP 就夠'],
  check: {
    kind: 'fn',
    fn: 'minPathSum',
    cases: [
      { args: [G], out: 7 },
      { args: [[[1, 2, 3], [4, 5, 6]]], out: 12 },
      { args: [[[5]]], out: 5 },
      { args: [[[1, 2], [1, 1]]], out: 3 },
    ],
  },
}
