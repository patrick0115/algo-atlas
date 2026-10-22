import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 48. Rotate Image

const M = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]

function grid(m: number[][], label: string, hl: Cell[] = [], cmp: Cell[] = []): GridViewData {
  return { kind: 'grid', label, cells: m.map((r) => [...r]), marks: { hl, cmp } }
}

function flipFig(): FigStep[] {
  const m = M.map((r) => [...r])
  const n = m.length
  const out: FigStep[] = [{ note: '順時針轉 90°:原本的第 0 列 [1,2,3] 要變成最右邊那一行。直接搬很亂 → 拆成兩個簡單動作', views: [grid(m, 'matrix')] }]
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      ;[m[i][j], m[j][i]] = [m[j][i], m[i][j]]
      out.push({ note: `① 轉置(沿左上→右下的對角線翻):交換 (${i},${j}) 和 (${j},${i})`, views: [grid(m, '轉置中', [[i, j], [j, i]], Array.from({ length: n }, (_, k) => [k, k] as Cell))] })
    }
  for (const row of m) row.reverse()
  out.push({ note: '② 每一列左右翻轉 → 完成順時針 90°。第 0 列 [1,2,3] 現在在最右邊一行', views: [grid(m, '答案', m.map((_, r) => [r, n - 1] as Cell))] })
  return out
}

function ringFig(): FigStep[] {
  const m = M.map((r) => [...r])
  const n = m.length
  const out: FigStep[] = [{ note: '另一種想法:四個角落的格子會「轉一圈」互換位置。(i,j) → (j, n−1−i) → (n−1−i, n−1−j) → (n−1−j, i) → 回到 (i,j)', views: [grid(m, 'matrix')] }]
  for (let i = 0; i < Math.floor(n / 2); i++)
    for (let j = i; j < n - 1 - i; j++) {
      const cells: Cell[] = [[i, j], [j, n - 1 - i], [n - 1 - i, n - 1 - j], [n - 1 - j, i]]
      const tmp = m[i][j]
      m[i][j] = m[n - 1 - j][i]
      m[n - 1 - j][i] = m[n - 1 - i][n - 1 - j]
      m[n - 1 - i][n - 1 - j] = m[j][n - 1 - i]
      m[j][n - 1 - i] = tmp
      out.push({ note: `這四格一起轉:左上的值去右上、右上去右下、右下去左下、左下回左上`, views: [grid(m, `第 ${i} 圈`, cells)] })
    }
  out.push({ note: '外圈轉完,中間的 5 不用動', views: [grid(m, '答案', [], [[1, 1]])] })
  return out
}

export const q0048: Solution = {
  id: 48,
  plain: '一張 n × n 的正方形圖片(數字矩陣),把它**順時針轉 90 度**。規定不能開一張新的矩陣,要直接在原本的上面改。',
  statement: '給 n × n 的二維矩陣 `matrix`,將它**原地**順時針旋轉 90°。不可以另外配置一個二維矩陣。',
  examples: [
    { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' },
    { input: 'matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]', output: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]' },
  ],
  constraints: ['`1 ≤ n ≤ 20`', '原地修改,不回傳'],
  insight: [
    '旋轉後:原本 `(r, c)` 的值,會跑到 `(c, n−1−r)`。第 0 列變成最後一行',
    '開一張新矩陣照公式搬很簡單,但題目要原地',
    '技巧:順時針 90° = **轉置**(r, c 互換)+ **每列左右翻轉**。兩步都很容易原地做',
    '或是四格一組直接轉:每一圈的 4 個對應位置互相輪換',
  ],
  approaches: [
    {
      name: '轉置 + 每列反轉',
      idea: '先沿主對角線交換 `m[i][j]` ↔ `m[j][i]`(只換 j > i 的一半),再把每一列 reverse。',
      steps: ['`for i`:`for j in i+1..n−1`:交換 `m[i][j]`、`m[j][i]`', '每一列 `reverse()`'],
      figure: { title: '3 × 3', steps: flipFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每格最多被動兩次。' },
      verdict: '最推薦:兩個步驟都不會寫錯。逆時針就換成「轉置 + 每行上下翻」。',
      code: {
        python: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):                    # ① 轉置:只換對角線右上那一半
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:                    # ② 每一列左右翻
        row.reverse()`,
        c: `void rotate(int **matrix, int matrixSize, int *matrixColSize) {
    int n = matrixSize;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            int t = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = t;
        }
    for (int i = 0; i < n; i++)
        for (int l = 0, r = n - 1; l < r; l++, r--) {
            int t = matrix[i][l]; matrix[i][l] = matrix[i][r]; matrix[i][r] = t;
        }
}`,
        cpp: `void rotate(vector<vector<int>>& matrix) {
    int n = matrix.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) swap(matrix[i][j], matrix[j][i]);
    for (auto& row : matrix) reverse(row.begin(), row.end());
}`,
        java: `void rotate(int[][] matrix) {
    int n = matrix.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            int t = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = t;
        }
    for (int[] row : matrix)
        for (int l = 0, r = n - 1; l < r; l++, r--) {
            int t = row[l]; row[l] = row[r]; row[r] = t;
        }
}`,
        javascript: `function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
  for (const row of matrix) row.reverse();
}`,
      },
    },
    {
      name: '一圈一圈,四格輪換',
      idea: '由外往內處理每一圈。圈上每個位置 `(i, j)` 和它轉 90°、180°、270° 的位置組成 4 格,用一個 tmp 把它們輪轉一次。',
      steps: ['`for i in 0..n/2−1`(圈)', '`for j in i..n−2−i`', 'tmp = 左上;左上 ← 左下;左下 ← 右下;右下 ← 右上;右上 ← tmp'],
      figure: { title: '3 × 3', steps: ringFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每格剛好被移動一次。' },
      verdict: '每格只動一次,但四個座標很容易寫錯,建議畫圖確認。',
      code: {
        python: `def rotate(matrix):
    n = len(matrix)
    for i in range(n // 2):
        for j in range(i, n - 1 - i):
            tmp = matrix[i][j]
            matrix[i][j] = matrix[n - 1 - j][i]                   # 左下 → 左上
            matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j]   # 右下 → 左下
            matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i]   # 右上 → 右下
            matrix[j][n - 1 - i] = tmp                            # 左上 → 右上`,
        c: `void rotate(int **matrix, int matrixSize, int *matrixColSize) {
    int n = matrixSize;
    for (int i = 0; i < n / 2; i++)
        for (int j = i; j < n - 1 - i; j++) {
            int tmp = matrix[i][j];
            matrix[i][j] = matrix[n - 1 - j][i];
            matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];
            matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];
            matrix[j][n - 1 - i] = tmp;
        }
}`,
        cpp: `void rotate(vector<vector<int>>& matrix) {
    int n = matrix.size();
    for (int i = 0; i < n / 2; i++)
        for (int j = i; j < n - 1 - i; j++) {
            int tmp = matrix[i][j];
            matrix[i][j] = matrix[n - 1 - j][i];
            matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];
            matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];
            matrix[j][n - 1 - i] = tmp;
        }
}`,
        java: `void rotate(int[][] matrix) {
    int n = matrix.length;
    for (int i = 0; i < n / 2; i++)
        for (int j = i; j < n - 1 - i; j++) {
            int tmp = matrix[i][j];
            matrix[i][j] = matrix[n - 1 - j][i];
            matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];
            matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];
            matrix[j][n - 1 - i] = tmp;
        }
}`,
        javascript: `function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n >> 1; i++)
    for (let j = i; j < n - 1 - i; j++) {
      const tmp = matrix[i][j];
      matrix[i][j] = matrix[n - 1 - j][i];
      matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];
      matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];
      matrix[j][n - 1 - i] = tmp;
    }
}`,
      },
    },
  ],
  pitfalls: [
    '轉置時 j 從 0 開始:每一對會被換兩次,等於沒換',
    '轉置後翻「行」(上下)而不是翻「列」(左右):會變成逆時針',
    '四格輪換時 j 的範圍寫成 `i..n−1−i`(多一格):角落會被轉兩次',
  ],
  followUp: [{ q: '逆時針 90°?轉 180°?', a: '逆時針:轉置 + 上下翻(或先每列反轉再轉置)。180°:上下翻 + 左右翻。' }],
  check: {
    kind: 'fn',
    fn: 'rotate',
    inplace: 0,
    cases: [
      { args: [M.map((r) => [...r])], out: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], out: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      { args: [[[1]]], out: [[1]] },
      { args: [[[1, 2], [3, 4]]], out: [[3, 1], [4, 2]] },
    ],
  },
}
