import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

const G = [[3, 1, 1], [2, 5, 1], [1, 5, 5], [2, 1, 1]]

function board(row: number, left: number, right: number): GridViewData {
  return {
    kind: 'grid',
    label: '實心是左機器人，外框是右機器人，變淡列不屬於當前狀態',
    cells: G,
    marks: {
      hl: [[row, left]],
      cmp: left === right ? [] : [[row, right]],
      dim: G.flatMap((values, r) => r < row ? values.map((_, c) => [r, c] as [number, number]) : []),
    },
  }
}

function memoFig(): FigStep[] {
  return [
    { note: '兩台機器人從頂列兩端出發，先拿到 3 + 1 = 4 顆。狀態是（列 0、左欄 0、右欄 2）。', views: [board(0, 0, 2), arr([4], { label: '累計' })] },
    { note: '下一列可各自往左、直走或往右。選左欄 0 的 2 與右欄 1 的 5，累計變 11。', views: [board(1, 0, 1), arr([11], { label: '累計' })] },
    { note: '第 2 列選欄 1 與欄 2，各得 5 顆，累計 21。', views: [board(2, 1, 2), arr([21], { label: '累計' })] },
    { note: '最後一列選欄 0 與欄 1，再得 2 + 1，總數 24。', views: [board(3, 0, 1), arr([24], { label: '答案', done: [0] })] },
  ]
}

function bottomFig(): FigStep[] {
  return [
    { note: '先看最後一列：如果兩人站在欄 0、1，這一列能得 2 + 1 = 3。', views: [board(3, 0, 1), arr([3], { label: '狀態值' })] },
    { note: '往上算第 2 列的欄 1、2：本列 5 + 5，再接最佳下一列 3，狀態值為 13。', views: [board(2, 1, 2), arr([13], { label: '狀態值' })] },
    { note: '第 1 列欄 0、1：本列 2 + 5，加上之後最佳的 13，得到 20。', views: [board(1, 0, 1), arr([20], { label: '狀態值' })] },
    { note: '起點欄 0、2：本列 3 + 1，加上下一列最佳值 20，答案為 24。', views: [board(0, 0, 2), arr([24], { label: '答案', done: [0] })] },
  ]
}

export const q1463: Solution = {
  id: 1463,
  plain: '兩台機器人從網格頂端兩側一起往下走，盡量蒐集更多櫻桃；同一格只能拿一次。',
  statement: '兩機器人分別從 (0,0) 與 (0,cols−1) 出發。每往下一列，欄可保持或左右移一格，不能越界。求走到最後一列時最多能拿幾顆櫻桃；同格只算一次。',
  examples: [
    { input: 'grid = [[3,1,1],[2,5,1],[1,5,5],[2,1,1]]', output: '24' },
    { input: 'grid = [[1,0,0,0,0,0,1],[2,0,0,0,0,3,0],[2,0,9,0,0,0,0],[0,3,0,5,4,0,0],[1,0,2,3,0,0,6]]', output: '28' },
  ],
  constraints: ['列數與欄數各為 2 到 70；格子櫻桃數為 0 到 100。'],
  insight: ['每走一列，兩人的位置由「列、左欄、右欄」完全決定。', '每人下一列可選三個方向，兩人合計最多 9 種轉移。'],
  approaches: [
    {
      name: '由上往下 DFS 加記憶化',
      idea: '記住每個（列、兩欄）狀態之後最多還能拿多少，避免重算。',
      steps: ['欄越界時回傳不可行。', '先計算本列兩格的櫻桃，同欄只加一次。', '若未到最後一列，試兩人共 9 種下一步，選最佳值加上本列收穫。'],
      figure: { title: '兩機器人的一條最佳路線', steps: memoFig() },
      complexity: { time: 'O(rows × cols²)', space: 'O(rows × cols²)', why: '每個三維狀態只算一次，每次最多試 9 個固定轉移。' },
      verdict: '狀態與移動規則最容易對應。',
      code: {
        python: `from functools import lru_cache

def cherryPickup(grid):
    rows, cols = len(grid), len(grid[0])

    @lru_cache(None)
    def search(row, left, right):
        if left < 0 or left >= cols or right < 0 or right >= cols:
            return -10**9
        gain = grid[row][left]
        if left != right:
            gain += grid[row][right]       # 同格只計一次
        if row == rows - 1:
            return gain
        best = max(search(row + 1, left + a, right + b)
                   for a in (-1, 0, 1) for b in (-1, 0, 1))
        return gain + best

    return search(0, 0, cols - 1)`,
        c: `static int robotSearch(int **grid, int rows, int cols, int row, int left, int right, int *memo) {
    if (left < 0 || left >= cols || right < 0 || right >= cols) {
        return -100000000;
    }
    int index = (row * cols + left) * cols + right;
    if (memo[index] != INT_MIN) {
        return memo[index];
    }
    int gain = grid[row][left];
    if (left != right) {
        gain += grid[row][right];
    }
    if (row == rows - 1) {
        return memo[index] = gain;
    }
    int best = -100000000;
    for (int a = -1; a <= 1; a++) {
        for (int b = -1; b <= 1; b++) {
            int candidate = robotSearch(grid, rows, cols, row + 1, left + a, right + b, memo);
            if (candidate > best) {
                best = candidate;
            }
        }
    }
    return memo[index] = gain + best;
}

int cherryPickup(int **grid, int gridSize, int *gridColSize) {
    int rows = gridSize, cols = gridColSize[0];
    int size = rows * cols * cols;
    int *memo = malloc(size * sizeof(int));
    for (int i = 0; i < size; i++) {
        memo[i] = INT_MIN;
    }
    int answer = robotSearch(grid, rows, cols, 0, 0, cols - 1, memo);
    free(memo);
    return answer;
}`,
        cpp: `int cherryPickup(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    vector<vector<vector<int>>> memo(rows, vector<vector<int>>(cols, vector<int>(cols, INT_MIN)));
    function<int(int, int, int)> search = [&](int row, int left, int right) {
        if (left < 0 || left >= cols || right < 0 || right >= cols) {
            return -100000000;
        }
        int& result = memo[row][left][right];
        if (result != INT_MIN) {
            return result;
        }
        int gain = grid[row][left];
        if (left != right) {
            gain += grid[row][right];
        }
        if (row == rows - 1) {
            return result = gain;
        }
        int best = -100000000;
        for (int a = -1; a <= 1; a++) {
            for (int b = -1; b <= 1; b++) {
                best = max(best, search(row + 1, left + a, right + b));
            }
        }
        return result = gain + best;
    };
    return search(0, 0, cols - 1);
}`,
        java: `int[][] grid;
int[][][] memo;
int rows, cols;

int search(int row, int left, int right) {
    if (left < 0 || left >= cols || right < 0 || right >= cols) {
        return -100000000;
    }
    if (memo[row][left][right] != Integer.MIN_VALUE) {
        return memo[row][left][right];
    }
    int gain = grid[row][left];
    if (left != right) {
        gain += grid[row][right];
    }
    if (row == rows - 1) {
        return memo[row][left][right] = gain;
    }
    int best = -100000000;
    for (int a = -1; a <= 1; a++) {
        for (int b = -1; b <= 1; b++) {
            best = Math.max(best, search(row + 1, left + a, right + b));
        }
    }
    return memo[row][left][right] = gain + best;
}

int cherryPickup(int[][] grid) {
    this.grid = grid;
    rows = grid.length;
    cols = grid[0].length;
    memo = new int[rows][cols][cols];
    for (int[][] layer : memo) {
        for (int[] row : layer) {
            Arrays.fill(row, Integer.MIN_VALUE);
        }
    }
    return search(0, 0, cols - 1);
}`,
        javascript: `function cherryPickup(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const memo = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Array(cols).fill(null)));
  function search(row, left, right) {
    if (left < 0 || left >= cols || right < 0 || right >= cols) {
      return -100000000;
    }
    if (memo[row][left][right] !== null) {
      return memo[row][left][right];
    }
    let gain = grid[row][left];
    if (left !== right) {
      gain += grid[row][right];
    }
    if (row === rows - 1) {
      return (memo[row][left][right] = gain);
    }
    let best = -100000000;
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        best = Math.max(best, search(row + 1, left + a, right + b));
      }
    }
    return (memo[row][left][right] = gain + best);
  }
  return search(0, 0, cols - 1);
}`,
      },
    },
    {
      name: '由下往上三維 DP',
      idea: '最後一列先算好；每往上一列，從 9 種下一列位置取得最佳值。',
      steps: ['最後一列每組欄位的答案是當列兩格櫻桃數。', '從倒數第二列往上，枚舉兩個欄位。', '目前兩格收穫加上 9 種下一列狀態的最大值。', '回傳頂列兩端的狀態。'],
      figure: { title: '從底列倒推最佳收穫', steps: bottomFig() },
      complexity: { time: 'O(rows × cols²)', space: 'O(cols²)', why: '每列處理所有欄位對，只保留下一列的表。' },
      verdict: '與記憶化版相同轉移，可把額外空間降到 O(cols²)。',
      code: {
        python: `def cherryPickup(grid):
    rows, cols = len(grid), len(grid[0])
    next_row = [[0] * cols for _ in range(cols)]
    for row in range(rows - 1, -1, -1):
        current = [[0] * cols for _ in range(cols)]
        for left in range(cols):
            for right in range(cols):
                gain = grid[row][left]
                if left != right:
                    gain += grid[row][right]  # 同格只計一次
                best = 0
                if row < rows - 1:
                    for a in (-1, 0, 1):
                        for b in (-1, 0, 1):
                            x, y = left + a, right + b
                            if 0 <= x < cols and 0 <= y < cols:
                                best = max(best, next_row[x][y])
                current[left][right] = gain + best
        next_row = current
    return next_row[0][cols - 1]`,
        c: `int cherryPickup(int **grid, int gridSize, int *gridColSize) {
    int rows = gridSize, cols = gridColSize[0];
    int *nextRow = calloc(cols * cols, sizeof(int));
    int *current = malloc(cols * cols * sizeof(int));
    for (int row = rows - 1; row >= 0; row--) {
        for (int left = 0; left < cols; left++) {
            for (int right = 0; right < cols; right++) {
                int gain = grid[row][left];
                if (left != right) {
                    gain += grid[row][right];
                }
                int best = 0;
                if (row < rows - 1) {
                    for (int a = -1; a <= 1; a++) {
                        for (int b = -1; b <= 1; b++) {
                            int x = left + a, y = right + b;
                            if (x >= 0 && x < cols && y >= 0 && y < cols && nextRow[x * cols + y] > best) {
                                best = nextRow[x * cols + y];
                            }
                        }
                    }
                }
                current[left * cols + right] = gain + best;
            }
        }
        int *temporary = nextRow;
        nextRow = current;
        current = temporary;
    }
    int answer = nextRow[cols - 1];
    free(nextRow);
    free(current);
    return answer;
}`,
        cpp: `int cherryPickup(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    vector<vector<int>> nextRow(cols, vector<int>(cols, 0));
    for (int row = rows - 1; row >= 0; row--) {
        vector<vector<int>> current(cols, vector<int>(cols, 0));
        for (int left = 0; left < cols; left++) {
            for (int right = 0; right < cols; right++) {
                int gain = grid[row][left];
                if (left != right) {
                    gain += grid[row][right];
                }
                int best = 0;
                if (row < rows - 1) {
                    for (int a = -1; a <= 1; a++) {
                        for (int b = -1; b <= 1; b++) {
                            int x = left + a, y = right + b;
                            if (x >= 0 && x < cols && y >= 0 && y < cols) {
                                best = max(best, nextRow[x][y]);
                            }
                        }
                    }
                }
                current[left][right] = gain + best;
            }
        }
        nextRow.swap(current);
    }
    return nextRow[0][cols - 1];
}`,
        java: `int cherryPickup(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    int[][] nextRow = new int[cols][cols];
    for (int row = rows - 1; row >= 0; row--) {
        int[][] current = new int[cols][cols];
        for (int left = 0; left < cols; left++) {
            for (int right = 0; right < cols; right++) {
                int gain = grid[row][left];
                if (left != right) {
                    gain += grid[row][right];
                }
                int best = 0;
                if (row < rows - 1) {
                    for (int a = -1; a <= 1; a++) {
                        for (int b = -1; b <= 1; b++) {
                            int x = left + a, y = right + b;
                            if (x >= 0 && x < cols && y >= 0 && y < cols) {
                                best = Math.max(best, nextRow[x][y]);
                            }
                        }
                    }
                }
                current[left][right] = gain + best;
            }
        }
        nextRow = current;
    }
    return nextRow[0][cols - 1];
}`,
        javascript: `function cherryPickup(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let nextRow = Array.from({ length: cols }, () => new Array(cols).fill(0));
  for (let row = rows - 1; row >= 0; row--) {
    const current = Array.from({ length: cols }, () => new Array(cols).fill(0));
    for (let left = 0; left < cols; left++) {
      for (let right = 0; right < cols; right++) {
        let gain = grid[row][left];
        if (left !== right) {
          gain += grid[row][right];
        }
        let best = 0;
        if (row < rows - 1) {
          for (let a = -1; a <= 1; a++) {
            for (let b = -1; b <= 1; b++) {
              const x = left + a;
              const y = right + b;
              if (x >= 0 && x < cols && y >= 0 && y < cols) {
                best = Math.max(best, nextRow[x][y]);
              }
            }
          }
        }
        current[left][right] = gain + best;
      }
    }
    nextRow = current;
  }
  return nextRow[0][cols - 1];
}`,
      },
    },
  ],
  pitfalls: ['兩人站在同一格時櫻桃只算一次。', '每次都必須往下一列，不能停在原列。', '出界轉移不可行，不能把欄位繞到另一端。'],
  check: {
    kind: 'fn',
    fn: 'cherryPickup',
    cases: [
      { args: [G], out: 24 },
      { args: [[[1, 0, 0, 0, 0, 0, 1], [2, 0, 0, 0, 0, 3, 0], [2, 0, 9, 0, 0, 0, 0], [0, 3, 0, 5, 4, 0, 0], [1, 0, 2, 3, 0, 0, 6]]], out: 28 },
      { args: [[[1, 1], [1, 1]]], out: 4 },
    ],
  },
}
