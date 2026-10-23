import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 63. Unique Paths II

const G = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
]

function dpFig(): FigStep[] {
  const R = G.length
  const C = G[0].length
  const dp = G.map((row) => row.map(() => 0))
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (G[r][c]) continue
      dp[r][c] = r === 0 && c === 0 ? 1 : (r ? dp[r - 1][c] : 0) + (c ? dp[r][c - 1] : 0)
    }
  const view = (label: string, cells: (string | number)[][]): GridViewData => ({ kind: 'grid', label, cells, marks: { wall: G.flatMap((row, r) => row.flatMap((v, c) => (v ? [[r, c] as [number, number]] : []))) } })
  return [
    { note: '和 [62](#/q/62) 一樣只能往右、往下走,但有些格子是障礙物(深色),不能經過。從左上到右下有幾條路?', views: [view('grid(深色 = 障礙)', G.map((row) => row.map(() => '')))] },
    { note: '`dp[r][c]` = 到 (r, c) 的路徑數 = 上 + 左;障礙物格子 dp = 0(沒有路能經過它)', views: [view('dp', dp)] },
    { note: `右下角 ${dp[R - 1][C - 1]} 條:繞上面或繞左邊`, views: [arr([dp[R - 1][C - 1]], { label: '答案', done: [0] })] },
  ]
}

function rollFig(): FigStep[] {
  return [
    { note: '一維版:`dp[c]` 先保留上一列的值(= 上),再加上 `dp[c−1]`(= 左,已經是這一列的);障礙物直接設成 0', views: [arr([1, 1, 1], { label: '第 0 列' }), arr([1, 0, 1], { label: '第 1 列' }), arr([1, 1, 2], { label: '第 2 列' })] },
    { note: '空間從 O(mn) 降到 O(n)', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}

export const q0063: Solution = {
  id: 63,
  plain: '一個方格地圖有些格子是障礙物。機器人從左上角出發,每次只能往右或往下走,不能踩到障礙物。走到右下角共有幾種走法?',
  statement: '給 `m × n` 的網格 `obstacleGrid`,1 代表障礙物、0 代表空地。機器人從左上角出發,每次只能向下或向右移動,回傳到達右下角的不同路徑數。',
  examples: [
    { input: 'obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]', output: '2' },
    { input: 'obstacleGrid = [[0,1],[0,0]]', output: '1' },
  ],
  constraints: ['m, n ≤ 100,答案 ≤ 2·10⁹'],
  insight: ['[[p:dp-grid]]:`dp[r][c] = dp[r−1][c] + dp[r][c−1]`', '障礙物格 dp = 0', '起點本身是障礙物 → 答案 0'],
  approaches: [
    {
      name: '二維 DP',
      idea: '起點非障礙 → `dp[0][0] = 1`;其餘非障礙格 `dp = 上 + 左`;障礙格 0。',
      steps: ['`dp = m × n` 的 0', '`for r, c`:障礙 → 0', '起點 → 1;否則 `dp[r][c] = (上) + (左)`', '回傳右下角'],
      figure: { title: 'obstacleGrid(3 × 3)', steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格 O(1)。' },
      verdict: '最推薦,62 題加上一個 if。',
      code: {
        python: `def uniquePathsWithObstacles(obstacleGrid):
    R, C = len(obstacleGrid), len(obstacleGrid[0])
    dp = [[0] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            if obstacleGrid[r][c]:
                continue                      # 障礙物:沒有路經過
            if r == 0 and c == 0:
                dp[r][c] = 1
            else:
                dp[r][c] = (dp[r - 1][c] if r else 0) + (dp[r][c - 1] if c else 0)
    return dp[R - 1][C - 1]`,
        c: `int uniquePathsWithObstacles(int **obstacleGrid, int obstacleGridSize, int *obstacleGridColSize) {
    int R = obstacleGridSize, C = obstacleGridColSize[0];
    long long *dp = calloc(R * C, sizeof(long long));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (obstacleGrid[r][c]) continue;
            if (!r && !c) { dp[0] = 1; continue; }
            dp[r * C + c] = (r ? dp[(r - 1) * C + c] : 0) + (c ? dp[r * C + c - 1] : 0);
        }
    int ans = (int)dp[R * C - 1];
    free(dp);
    return ans;
}`,
        cpp: `int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
    int R = obstacleGrid.size(), C = obstacleGrid[0].size();
    vector<vector<long long>> dp(R, vector<long long>(C, 0));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (obstacleGrid[r][c]) continue;
            if (!r && !c) { dp[0][0] = 1; continue; }
            dp[r][c] = (r ? dp[r - 1][c] : 0) + (c ? dp[r][c - 1] : 0);
        }
    return dp[R - 1][C - 1];
}`,
        java: `int uniquePathsWithObstacles(int[][] obstacleGrid) {
    int R = obstacleGrid.length, C = obstacleGrid[0].length;
    long[][] dp = new long[R][C];
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (obstacleGrid[r][c] == 1) continue;
            if (r == 0 && c == 0) { dp[0][0] = 1; continue; }
            dp[r][c] = (r > 0 ? dp[r - 1][c] : 0) + (c > 0 ? dp[r][c - 1] : 0);
        }
    return (int) dp[R - 1][C - 1];
}`,
        javascript: `function uniquePathsWithObstacles(obstacleGrid) {
  const R = obstacleGrid.length, C = obstacleGrid[0].length, dp = Array.from({ length: R }, () => new Array(C).fill(0));
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (obstacleGrid[r][c]) continue;
      dp[r][c] = !r && !c ? 1 : (r ? dp[r - 1][c] : 0) + (c ? dp[r][c - 1] : 0);
    }
  return dp[R - 1][C - 1];
}`,
      },
    },
    {
      name: '一維滾動',
      idea: '`dp[c]`:障礙 → 0;否則 `dp[c] += dp[c−1]`(c > 0)。起始 `dp[0] = 1`(起點非障礙時)。',
      steps: ['`dp = [0] * n`、`dp[0] = 1`', '`for row`:`for c`:障礙 → `dp[c] = 0`;否則 c > 0 時 `dp[c] += dp[c−1]`', '回傳 `dp[n−1]`'],
      figure: { title: 'obstacleGrid(3 × 3)', steps: rollFig() },
      complexity: { time: 'O(m · n)', space: 'O(n)', why: '只存一列。' },
      verdict: '起點若是障礙物,第一格就會被設成 0,不需要特判。',
      code: {
        python: `def uniquePathsWithObstacles(obstacleGrid):
    C = len(obstacleGrid[0])
    dp = [0] * C
    dp[0] = 1
    for row in obstacleGrid:
        for c in range(C):
            if row[c]:
                dp[c] = 0                     # 障礙物
            elif c:
                dp[c] += dp[c - 1]            # 上(舊值)+ 左(新值)
    return dp[-1]`,
        c: `int uniquePathsWithObstacles(int **obstacleGrid, int obstacleGridSize, int *obstacleGridColSize) {
    int C = obstacleGridColSize[0];
    long long *dp = calloc(C, sizeof(long long));
    dp[0] = 1;
    for (int r = 0; r < obstacleGridSize; r++)
        for (int c = 0; c < C; c++) {
            if (obstacleGrid[r][c]) dp[c] = 0;
            else if (c) dp[c] += dp[c - 1];
        }
    int ans = (int)dp[C - 1];
    free(dp);
    return ans;
}`,
        cpp: `int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
    int C = obstacleGrid[0].size();
    vector<long long> dp(C, 0);
    dp[0] = 1;
    for (auto &row : obstacleGrid)
        for (int c = 0; c < C; c++) {
            if (row[c]) dp[c] = 0;
            else if (c) dp[c] += dp[c - 1];
        }
    return dp[C - 1];
}`,
        java: `int uniquePathsWithObstacles(int[][] obstacleGrid) {
    int C = obstacleGrid[0].length;
    long[] dp = new long[C];
    dp[0] = 1;
    for (int[] row : obstacleGrid)
        for (int c = 0; c < C; c++) {
            if (row[c] == 1) dp[c] = 0;
            else if (c > 0) dp[c] += dp[c - 1];
        }
    return (int) dp[C - 1];
}`,
        javascript: `function uniquePathsWithObstacles(obstacleGrid) {
  const C = obstacleGrid[0].length, dp = new Array(C).fill(0);
  dp[0] = 1;
  for (const row of obstacleGrid)
    for (let c = 0; c < C; c++) {
      if (row[c]) dp[c] = 0;
      else if (c) dp[c] += dp[c - 1];
    }
  return dp[C - 1];
}`,
      },
    },
  ],
  pitfalls: ['起點或終點是障礙物:答案 0', '第一列 / 第一欄遇到障礙物後,後面全部是 0(初始化時不能全部設 1)'],
  check: {
    kind: 'fn',
    fn: 'uniquePathsWithObstacles',
    cases: [
      { args: [G], out: 2 },
      { args: [[[0, 1], [0, 0]]], out: 1 },
      { args: [[[1]]], out: 0 },
      { args: [[[0, 0], [0, 1]]], out: 0 },
      { args: [[[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0]]], out: 3 },
    ],
  },
}
