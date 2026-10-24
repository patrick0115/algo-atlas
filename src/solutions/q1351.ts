import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1351. Count Negative Numbers in a Sorted Matrix
const G = [[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]]
const grid = (cells: number[][], opt: { label: string; marks?: Record<string, [number, number][]> }) => ({ kind: 'grid' as const, cells, ...opt })

function stairFig(): FigStep[] {
  return [
    { note: '每列從左到右遞減，每行從上到下也遞減。從右上角開始，右邊沒有別的數。', views: [grid(G, { label: 'grid', marks: { hl: [[0, 3]] } })] },
    { note: '(0,3) 是 -1；它下面同一行的 4 格都不大於 -1，所以一次計入 4 格，往左走。', views: [grid(G, { label: '已算右欄', marks: { done: [[0, 3], [1, 3], [2, 3], [3, 3]], hl: [[0, 2]] } }), arr([4], { label: '計數' })] },
    { note: '(0,2) 是 2，不是負數；這一格往左只會更大，因此往下走。接著 (1,2) 是 1，也往下。', views: [grid(G, { label: '往下尋找負數邊界', marks: { hl: [[2, 2]], dim: [[0, 2], [1, 2]] } })] },
    { note: '(2,2) 是 -1；同一行從第 2 列到最後都為負數，新計入 2 格，往左走。', views: [grid(G, { label: '再算一欄', marks: { done: [[2, 2], [3, 2]], hl: [[2, 1]] } }), arr([6], { label: '計數' })] },
    { note: '往下看到 (3,1) = -1，計入 1 格；再往左看到 (3,0) = -1，計入 1 格。總共 8 格。', views: [grid(G, { label: '完成', marks: { done: [[0, 3], [1, 3], [2, 3], [3, 3], [2, 2], [3, 2], [3, 1], [3, 0]] } }), arr([8], { label: '答案', done: [0] })] },
  ]
}

function binaryFig(): FigStep[] {
  return [
    { note: '每一列都有「非負數在左、負數在右」的邊界，對每列各做一次二分搜尋。', views: [grid(G, { label: 'grid' })] },
    { note: '第 0 列 [4,3,2,-1] 的第一個負數在索引 3，所以這列有 4−3 = 1 個。', views: [arr(G[0], { label: '第 0 列', highlight: [3] }), arr([1], { label: '累計' })] },
    { note: '第 1 列的邊界也在 3；第 2 列的邊界在 2，累計變成 4。', views: [arr(G[2], { label: '第 2 列', highlight: [2], done: [2, 3] }), arr([4], { label: '累計' })] },
    { note: '最後一列從索引 0 就是負數，加 4 個，答案為 8。', views: [arr(G[3], { label: '第 3 列', done: [0, 1, 2, 3] }), arr([8], { label: '答案', done: [0] })] },
  ]
}

export const q1351: Solution = {
  id: 1351,
  plain: '矩陣的每列、每行都由大到小排列，要數出其中有幾個負數。',
  statement: '給定 `m × n` 矩陣 `grid`，每列從左到右、每行從上到下均為非遞增順序。回傳負數的數量。',
  examples: [
    { input: 'grid = [[4,3,2,-1],[3,2,1,-1],[1,1,-1,-2],[-1,-1,-2,-3]]', output: '8' },
    { input: 'grid = [[3,2],[1,0]]', output: '0' },
  ],
  constraints: ['1 ≤ m,n ≤ 100', '−100 ≤ grid[i][j] ≤ 100'],
  insight: ['若某格為負數，該格下方同一行的數也必定為負。', '從右上角出發：遇負數就整欄計入並左移；遇非負數就下移。', '也可只利用每列排序，找每列第一個負數的位置。'],
  approaches: [
    {
      name: '從右上角走階梯',
      idea: '目前位置 `(r,c)`；負數代表這欄從 r 到底都為負，計入 `m-r` 並左移；否則下移。',
      steps: ['設 `r=0`、`c=n-1`、`ans=0`', '若 `grid[r][c] < 0`，加上 `m-r`，然後 `c--`', '否則 `r++`', '越過左邊或底邊時回傳 ans'],
      figure: { title: '4 × 4 矩陣', steps: stairFig() },
      complexity: { time: 'O(m+n)', space: 'O(1)', why: '每一步必定往左或往下，最多 m+n 步。' },
      verdict: '充分利用兩個方向的排序，是這題最俐落的解法。',
      code: {
        python: `def countNegatives(grid):
    rows, cols = len(grid), len(grid[0])
    r, c, ans = 0, cols - 1, 0
    while r < rows and c >= 0:
        if grid[r][c] < 0:
            ans += rows - r               # 下方整欄都為負
            c -= 1                        # 換左邊一欄
        else:
            r += 1                        # 往下找負數
    return ans`,
        c: `int countNegatives(int **grid, int gridSize, int *gridColSize) {
    int rows = gridSize;
    int r = 0;
    int c = gridColSize[0] - 1;
    int ans = 0;
    while (r < rows && c >= 0) {
        if (grid[r][c] < 0) {
            ans += rows - r;
            c--;
        } else {
            r++;
        }
    }
    return ans;
}`,
        cpp: `int countNegatives(vector<vector<int>>& grid) {
    int rows = grid.size();
    int r = 0;
    int c = grid[0].size() - 1;
    int ans = 0;
    while (r < rows && c >= 0) {
        if (grid[r][c] < 0) {
            ans += rows - r;
            c--;
        } else {
            r++;
        }
    }
    return ans;
}`,
        java: `int countNegatives(int[][] grid) {
    int rows = grid.length;
    int r = 0;
    int c = grid[0].length - 1;
    int ans = 0;
    while (r < rows && c >= 0) {
        if (grid[r][c] < 0) {
            ans += rows - r;
            c--;
        } else {
            r++;
        }
    }
    return ans;
}`,
        javascript: `function countNegatives(grid) {
  const rows = grid.length;
  let r = 0;
  let c = grid[0].length - 1;
  let ans = 0;
  while (r < rows && c >= 0) {
    if (grid[r][c] < 0) {
      ans += rows - r;
      c--;
    } else {
      r++;
    }
  }
  return ans;
}`,
      },
    },
    {
      name: '每列各做一次二分搜尋',
      idea: '每列找第一個 `< 0` 的位置 p；這列有 `n-p` 個負數。',
      steps: ['對每一列設 `lo=0`、`hi=n`', '若中點是負數，邊界在中點或更左邊，令 `hi=mid`', '否則令 `lo=mid+1`', '答案累加 `n-lo`'],
      figure: { title: '逐列尋找第一個負數', steps: binaryFig() },
      complexity: { time: 'O(m log n)', space: 'O(1)', why: '每列用二分搜尋長度 n 的陣列。' },
      verdict: '若只保證各列排序，這個 [[p:binary-search]] 解法仍可使用。',
      code: {
        python: `def countNegatives(grid):
    ans = 0
    for row in grid:
        lo, hi = 0, len(row)
        while lo < hi:
            mid = (lo + hi) // 2
            if row[mid] < 0:
                hi = mid                 # 第一個負數在左半邊
            else:
                lo = mid + 1
        ans += len(row) - lo             # 邊界右邊都為負
    return ans`,
        c: `int countNegatives(int **grid, int gridSize, int *gridColSize) {
    int ans = 0;
    for (int r = 0; r < gridSize; r++) {
        int lo = 0;
        int hi = gridColSize[r];
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (grid[r][mid] < 0) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        ans += gridColSize[r] - lo;
    }
    return ans;
}`,
        cpp: `int countNegatives(vector<vector<int>>& grid) {
    int ans = 0;
    for (const auto& row : grid) {
        int lo = 0;
        int hi = row.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (row[mid] < 0) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        ans += row.size() - lo;
    }
    return ans;
}`,
        java: `int countNegatives(int[][] grid) {
    int ans = 0;
    for (int[] row : grid) {
        int lo = 0;
        int hi = row.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (row[mid] < 0) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        ans += row.length - lo;
    }
    return ans;
}`,
        javascript: `function countNegatives(grid) {
  let ans = 0;
  for (const row of grid) {
    let lo = 0;
    let hi = row.length;
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (row[mid] < 0) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    ans += row.length - lo;
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['0 不是負數，判斷必須是 `< 0`。', '階梯法負數時計入的是從當前列到最底部，不是整個矩陣高度。', '二分搜尋若整列沒有負數，邊界會是 n，貢獻 0。'],
  check: {
    kind: 'fn', fn: 'countNegatives',
    cases: [
      { args: [G], out: 8 },
      { args: [[[3, 2], [1, 0]]], out: 0 },
      { args: [[[-1]]], out: 1 },
      { args: [[[0]]], out: 0 },
      { args: [[[5, -1, -2]]], out: 2 },
    ],
  },
}
