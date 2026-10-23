import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 221. Maximal Square

const M = [
  ['1', '0', '1', '0', '0'],
  ['1', '0', '1', '1', '1'],
  ['1', '1', '1', '1', '1'],
  ['1', '0', '0', '1', '0'],
]

function dpFig(): FigStep[] {
  const R = M.length
  const C = M[0].length
  const dp = M.map((row) => row.map(() => 0))
  let best = 0
  let at: [number, number] = [0, 0]
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (M[r][c] !== '1') continue
      dp[r][c] = r && c ? Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]) + 1 : 1
      if (dp[r][c] > best) {
        best = dp[r][c]
        at = [r, c]
      }
    }
  const sq: [number, number][] = []
  for (let r = at[0] - best + 1; r <= at[0]; r++) for (let c = at[1] - best + 1; c <= at[1]; c++) sq.push([r, c])
  const view = (label: string, cells: (string | number)[][], done: [number, number][] = []): GridViewData => ({ kind: 'grid', label, cells, marks: { done } })
  return [
    { note: '在 0/1 矩陣中找出全部是 1 的最大正方形', views: [view('matrix', M)] },
    { note: '`dp[r][c]` = 以 (r, c) 為**右下角**的最大正方形邊長。要擴大成 k × k,上、左、左上三個方向都要至少有 k − 1 → `dp = min(上, 左, 左上) + 1`', views: [view('dp', dp)] },
    { note: `最大邊長 ${best} → 面積 ${best * best}`, views: [view('最大正方形', M, sq), arr([best * best], { label: '答案(面積)', done: [0] })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:以每個 1 為左上角,邊長 k 一路往外擴,每次只檢查新增的那一行和一列', views: [arr(['k = 1', 'k = 2:檢查新的一列 + 一行', '…遇到 0 就停'], { label: '擴張' })] },
    { note: '最壞 O((mn) · min(m, n)²),在全是 1 的大矩陣會很慢', views: [arr([4], { label: '答案', done: [0] })] },
  ]
}

export const q0221: Solution = {
  id: 221,
  plain: '一個只有 0 和 1 的方格表,找出完全由 1 組成的最大正方形,回傳它的面積。',
  statement: '給 `m × n` 的二元矩陣(元素為字元 `"0"` 或 `"1"`),找出只包含 `"1"` 的最大正方形並回傳其面積。',
  examples: [
    { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: '4' },
    { input: 'matrix = [["0","1"],["1","0"]]', output: '1' },
    { input: 'matrix = [["0"]]', output: '0' },
  ],
  constraints: ['m, n ≤ 300'],
  insight: ['以某格為右下角的正方形,受限於上、左、左上三個方向最短的那個', '[[p:dp-grid]]:`dp[r][c] = min(dp[r−1][c], dp[r][c−1], dp[r−1][c−1]) + 1`', '答案是最大邊長的平方'],
  approaches: [
    {
      name: '二維 DP(右下角)',
      idea: '`matrix[r][c] == "1"` → `dp[r][c] = min(上, 左, 左上) + 1`(第一列 / 第一欄為 1);追蹤最大邊長。',
      steps: ['`dp = m × n` 的 0、`best = 0`', '每個 "1":邊界 → 1;否則 min(三方向) + 1', '`best = max(best, dp[r][c])`', '回傳 `best²`'],
      figure: { title: 'matrix(4 × 5)', steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格 O(1);可以壓成一維。' },
      verdict: '最推薦;「三個方向取 min」的直覺要想通:任何一邊短了,正方形就長不大。',
      code: {
        python: `def maximalSquare(matrix):
    R, C = len(matrix), len(matrix[0])
    dp = [[0] * C for _ in range(R)]
    best = 0
    for r in range(R):
        for c in range(C):
            if matrix[r][c] == '1':
                if r == 0 or c == 0:
                    dp[r][c] = 1
                else:
                    dp[r][c] = min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]) + 1
                best = max(best, dp[r][c])
    return best * best`,
        c: `int maximalSquare(char **matrix, int matrixSize, int *matrixColSize) {
    int R = matrixSize, C = matrixColSize[0], best = 0;
    int *dp = calloc(R * C, sizeof(int));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (matrix[r][c] != '1') continue;
            int v = 1;
            if (r && c) {
                int a = dp[(r - 1) * C + c], b = dp[r * C + c - 1], d = dp[(r - 1) * C + c - 1];
                int m = a < b ? a : b;
                v = (m < d ? m : d) + 1;
            }
            dp[r * C + c] = v;
            if (v > best) best = v;
        }
    free(dp);
    return best * best;
}`,
        cpp: `int maximalSquare(vector<vector<char>>& matrix) {
    int R = matrix.size(), C = matrix[0].size(), best = 0;
    vector<vector<int>> dp(R, vector<int>(C, 0));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (matrix[r][c] != '1') continue;
            dp[r][c] = (r && c) ? min({dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]}) + 1 : 1;
            best = max(best, dp[r][c]);
        }
    return best * best;
}`,
        java: `int maximalSquare(char[][] matrix) {
    int R = matrix.length, C = matrix[0].length, best = 0;
    int[][] dp = new int[R][C];
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (matrix[r][c] != '1') continue;
            dp[r][c] = (r > 0 && c > 0) ? Math.min(dp[r - 1][c], Math.min(dp[r][c - 1], dp[r - 1][c - 1])) + 1 : 1;
            best = Math.max(best, dp[r][c]);
        }
    return best * best;
}`,
        javascript: `function maximalSquare(matrix) {
  const R = matrix.length, C = matrix[0].length, dp = Array.from({ length: R }, () => new Array(C).fill(0));
  let best = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (matrix[r][c] !== '1') continue;
      dp[r][c] = r && c ? Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]) + 1 : 1;
      best = Math.max(best, dp[r][c]);
    }
  return best * best;
}`,
      },
    },
    {
      name: '暴力擴張',
      idea: '以每個 "1" 為左上角,邊長 k 逐步加大,每次檢查新增的最下一列與最右一行是否全為 "1"。',
      steps: ['`for` 每個 (r, c) 是 "1"', '`k = 1`;`while` 還在範圍內:檢查第 r + k 列與第 c + k 行的新格子', '全是 1 → `k += 1`,否則停', '`best = max(best, k)`'],
      figure: { title: 'matrix(4 × 5)', steps: bruteFig() },
      complexity: { time: 'O(m · n · min(m, n)²)', space: 'O(1)', why: '每個起點最多擴 min(m, n) 次,每次檢查 O(k)。' },
      verdict: '最直觀,用來對照 DP 省下了什麼:DP 把「往外檢查」變成重複利用鄰居的答案。',
      code: {
        python: `def maximalSquare(matrix):
    R, C = len(matrix), len(matrix[0])
    best = 0
    for r in range(R):
        for c in range(C):
            if matrix[r][c] != '1':
                continue
            k = 1
            while r + k < R and c + k < C:
                ok = (all(matrix[r + k][c + j] == '1' for j in range(k + 1)) and
                      all(matrix[r + i][c + k] == '1' for i in range(k + 1)))
                if not ok:
                    break                     # 新增的一列或一行有 0
                k += 1
            best = max(best, k)
    return best * best`,
        c: `int maximalSquare(char **matrix, int matrixSize, int *matrixColSize) {
    int R = matrixSize, C = matrixColSize[0], best = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (matrix[r][c] != '1') continue;
            int k = 1;
            while (r + k < R && c + k < C) {
                bool ok = true;
                for (int j = 0; j <= k && ok; j++) if (matrix[r + k][c + j] != '1') ok = false;
                for (int i = 0; i <= k && ok; i++) if (matrix[r + i][c + k] != '1') ok = false;
                if (!ok) break;
                k++;
            }
            if (k > best) best = k;
        }
    return best * best;
}`,
        cpp: `int maximalSquare(vector<vector<char>>& matrix) {
    int R = matrix.size(), C = matrix[0].size(), best = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (matrix[r][c] != '1') continue;
            int k = 1;
            while (r + k < R && c + k < C) {
                bool ok = true;
                for (int j = 0; j <= k && ok; j++) if (matrix[r + k][c + j] != '1') ok = false;
                for (int i = 0; i <= k && ok; i++) if (matrix[r + i][c + k] != '1') ok = false;
                if (!ok) break;
                k++;
            }
            best = max(best, k);
        }
    return best * best;
}`,
        java: `int maximalSquare(char[][] matrix) {
    int R = matrix.length, C = matrix[0].length, best = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (matrix[r][c] != '1') continue;
            int k = 1;
            while (r + k < R && c + k < C) {
                boolean ok = true;
                for (int j = 0; j <= k && ok; j++) if (matrix[r + k][c + j] != '1') ok = false;
                for (int i = 0; i <= k && ok; i++) if (matrix[r + i][c + k] != '1') ok = false;
                if (!ok) break;
                k++;
            }
            best = Math.max(best, k);
        }
    return best * best;
}`,
        javascript: `function maximalSquare(matrix) {
  const R = matrix.length, C = matrix[0].length;
  let best = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (matrix[r][c] !== '1') continue;
      let k = 1;
      while (r + k < R && c + k < C) {
        let ok = true;
        for (let j = 0; j <= k && ok; j++) if (matrix[r + k][c + j] !== '1') ok = false;
        for (let i = 0; i <= k && ok; i++) if (matrix[r + i][c + k] !== '1') ok = false;
        if (!ok) break;
        k++;
      }
      best = Math.max(best, k);
    }
  return best * best;
}`,
      },
    },
  ],
  pitfalls: ['回傳邊長而不是面積', '只取上、左的 min 沒看左上:左上角那格可能是 0', '矩陣元素是字元 "1",不是數字 1'],
  check: {
    kind: 'fn',
    fn: 'maximalSquare',
    cases: [
      { args: [M], out: 4 },
      { args: [[['0', '1'], ['1', '0']]], out: 1 },
      { args: [[['0']]], out: 0 },
      { args: [[['1', '1', '1'], ['1', '1', '1'], ['1', '1', '1']]], out: 9 },
    ],
  },
}
