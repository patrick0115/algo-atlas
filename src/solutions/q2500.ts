import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2500. Delete Greatest Value in Each Row

export const q2500: Solution = {
  id: 2500,
  plain: '一張數字表格,每回合把每一列的最大數各抽掉一個,這批被抽掉的數裡挑最大的記下來加進分數;重複到表格清空。',
  statement: '給一個 `m x n` 的矩陣 `grid`。每回合:每一列各刪掉目前的最大值,把這一批刪掉的值裡最大的那個加到答案。重複直到矩陣清空,回傳答案總和。',
  examples: [
    { input: 'grid = [[1,2,4],[3,3,1]]', output: '8', note: '第 1 回合刪 4 和 3,加 4;第 2 回合刪 2 和 3,加 3;第 3 回合刪 1 和 1,加 1。4+3+1 = 8' },
    { input: 'grid = [[10]]', output: '10' },
  ],
  constraints: ['1 ≤ m, n ≤ 50', '1 ≤ grid[i][j] ≤ 100'],
  insight: [
    '每一列刪的順序就是「由大到小」,等於把每列排序後,從右邊往左一欄一欄配對',
    '第 k 回合刪的是每列第 k 大的數;這一回合貢獻 = 各列第 k 大裡的最大值',
    '所以把每列排好,第 j 欄取各列那一欄的最大值,全部加起來就是答案',
  ],
  approaches: [
    {
      name: '每列排序後逐欄取最大',
      idea: '每一列先由小到大排好,對齊之後同一欄就是「同一回合刪的那批」,每欄取最大再全部加總。',
      steps: [
        '每一列 `sort`(由小到大)',
        '`ans = 0`,`for j in 每一欄`:`ans += 這一欄所有列的最大值`',
        '回傳 `ans`',
      ],
      figure: {
        title: 'grid = [[1,2,4],[3,3,1]]',
        steps: [
          {
            note: '每一列各自由小到大排好',
            line: 2,
            views: [
              arr([1, 2, 4], { label: '列 0(已排)' }),
              arr([1, 3, 3], { label: '列 1(已排)' }),
            ],
          },
          {
            note: '對齊後逐欄看:第 0 欄 max(1,1)=1、第 1 欄 max(2,3)=3、第 2 欄 max(4,3)=4',
            line: 6,
            views: [
              arr([1, 2, 4], { label: '列 0', compare: [0, 1, 2] }),
              arr([1, 3, 3], { label: '列 1', compare: [0, 1, 2] }),
            ],
          },
          {
            note: '每欄最大相加:1 + 3 + 4 = 8',
            line: 7,
            views: [
              arr([1, 3, 4], { label: '各欄最大', done: [0, 1, 2] }),
            ],
          },
        ],
      },
      complexity: { time: 'O(m·n log n)', space: 'O(1)', why: 'm 列各排一次,再掃過每格一次。' },
      verdict: '最乾淨,先排序把問題變成逐欄取最大。',
      code: {
        python: `def deleteGreatestValue(grid):
    for row in grid:
        row.sort()
    ans = 0
    for j in range(len(grid[0])):
        ans += max(grid[i][j] for i in range(len(grid)))
    return ans`,
        c: `int cmp(const void* a, const void* b) { return *(int*)a - *(int*)b; }

int deleteGreatestValue(int** grid, int gridSize, int* gridColSize) {
    int cols = gridColSize[0];
    for (int i = 0; i < gridSize; i++) qsort(grid[i], cols, sizeof(int), cmp);
    int ans = 0;
    for (int j = 0; j < cols; j++) {
        int mx = 0;
        for (int i = 0; i < gridSize; i++)
            if (grid[i][j] > mx) mx = grid[i][j];
        ans += mx;
    }
    return ans;
}`,
        cpp: `int deleteGreatestValue(vector<vector<int>>& grid) {
    for (auto& row : grid) sort(row.begin(), row.end());
    int ans = 0;
    for (int j = 0; j < (int)grid[0].size(); j++) {
        int mx = 0;
        for (int i = 0; i < (int)grid.size(); i++) mx = max(mx, grid[i][j]);
        ans += mx;
    }
    return ans;
}`,
        java: `int deleteGreatestValue(int[][] grid) {
    for (int[] row : grid) Arrays.sort(row);
    int ans = 0;
    for (int j = 0; j < grid[0].length; j++) {
        int mx = 0;
        for (int i = 0; i < grid.length; i++) mx = Math.max(mx, grid[i][j]);
        ans += mx;
    }
    return ans;
}`,
        javascript: `function deleteGreatestValue(grid) {
  for (const row of grid) row.sort((a, b) => a - b);
  let ans = 0;
  for (let j = 0; j < grid[0].length; j++) {
    let mx = 0;
    for (let i = 0; i < grid.length; i++) mx = Math.max(mx, grid[i][j]);
    ans += mx;
  }
  return ans;
}`,
      },
    },
    {
      name: '選擇排序模擬',
      idea: '不排序,老老實實照題目做:每回合掃每一列找最大值刪掉(標成 −1),記下這批的最大,直到所有格都刪完。',
      steps: [
        '`ans = 0`,做 n 回合(n = 欄數)',
        '每回合:每一列掃一遍找最大值的位置,標成 −1,記下這批最大 `batchMax`',
        '`ans += batchMax`',
        '回傳 `ans`',
      ],
      figure: {
        title: 'grid = [[1,2,4],[3,3,1]]',
        steps: [
          {
            note: '第 1 回合:列 0 最大是 4、列 1 最大是 3,各刪掉(標 −1),這批最大是 4',
            line: 7,
            views: [
              arr([1, 2, -1], { label: '列 0(刪 4)', dim: [2] }),
              arr([-1, 3, 1], { label: '列 1(刪 3)', dim: [0] }),
            ],
          },
          {
            note: '第 2 回合:剩下的最大,列 0 是 2、列 1 是 3,這批最大是 3,累計 4+3=7',
            line: 7,
            views: [
              arr([1, -1, -1], { label: '列 0(刪 2)', dim: [1, 2] }),
              arr([-1, -1, 1], { label: '列 1(刪 3)', dim: [0, 1] }),
            ],
          },
          {
            note: '第 3 回合:剩 1 和 1,這批最大 1,累計 7+1=8',
            line: 9,
            views: [
              arr([-1, -1, -1], { label: '列 0(刪 1)', dim: [0, 1, 2] }),
              arr([-1, -1, -1], { label: '列 1(刪 1)', dim: [0, 1, 2] }),
            ],
          },
        ],
      },
      complexity: { time: 'O(n·m·n)', space: 'O(1)', why: 'n 回合,每回合掃過整張表一次找最大。' },
      verdict: '[[p:selection-sort]] 的 [[p:simulation]],照題意直接做,不排序也能通。',
      code: {
        python: `def deleteGreatestValue(grid):
    rows, cols = len(grid), len(grid[0])
    ans = 0
    for _ in range(cols):
        batch_max = 0
        for i in range(rows):
            mi = 0
            for j in range(1, cols):
                if grid[i][j] > grid[i][mi]:
                    mi = j
            batch_max = max(batch_max, grid[i][mi])
            grid[i][mi] = -1
        ans += batch_max
    return ans`,
        c: `int deleteGreatestValue(int** grid, int gridSize, int* gridColSize) {
    int cols = gridColSize[0], ans = 0;
    for (int t = 0; t < cols; t++) {
        int batchMax = 0;
        for (int i = 0; i < gridSize; i++) {
            int mi = 0;
            for (int j = 1; j < cols; j++)
                if (grid[i][j] > grid[i][mi]) mi = j;
            if (grid[i][mi] > batchMax) batchMax = grid[i][mi];
            grid[i][mi] = -1;
        }
        ans += batchMax;
    }
    return ans;
}`,
        cpp: `int deleteGreatestValue(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size(), ans = 0;
    for (int t = 0; t < cols; t++) {
        int batchMax = 0;
        for (int i = 0; i < rows; i++) {
            int mi = 0;
            for (int j = 1; j < cols; j++)
                if (grid[i][j] > grid[i][mi]) mi = j;
            batchMax = max(batchMax, grid[i][mi]);
            grid[i][mi] = -1;
        }
        ans += batchMax;
    }
    return ans;
}`,
        java: `int deleteGreatestValue(int[][] grid) {
    int rows = grid.length, cols = grid[0].length, ans = 0;
    for (int t = 0; t < cols; t++) {
        int batchMax = 0;
        for (int i = 0; i < rows; i++) {
            int mi = 0;
            for (int j = 1; j < cols; j++)
                if (grid[i][j] > grid[i][mi]) mi = j;
            batchMax = Math.max(batchMax, grid[i][mi]);
            grid[i][mi] = -1;
        }
        ans += batchMax;
    }
    return ans;
}`,
        javascript: `function deleteGreatestValue(grid) {
  const rows = grid.length, cols = grid[0].length;
  let ans = 0;
  for (let t = 0; t < cols; t++) {
    let batchMax = 0;
    for (let i = 0; i < rows; i++) {
      let mi = 0;
      for (let j = 1; j < cols; j++) if (grid[i][j] > grid[i][mi]) mi = j;
      batchMax = Math.max(batchMax, grid[i][mi]);
      grid[i][mi] = -1;
    }
    ans += batchMax;
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '每一列的長度一樣(矩陣),回合數就是欄數',
    '模擬版用 −1 標記已刪,是因為值保證 ≥ 1;若值可能是負數要另外標記',
    'JS 的 `sort` 要帶 `(a, b) => a - b`,否則按字典序排錯',
  ],
  check: {
    kind: 'fn',
    fn: 'deleteGreatestValue',
    cases: [
      { args: [[[1, 2, 4], [3, 3, 1]]], out: 8 },
      { args: [[[10]]], out: 10 },
      { args: [[[1, 2, 3], [4, 5, 6]]], out: 15 },
    ],
  },
}
