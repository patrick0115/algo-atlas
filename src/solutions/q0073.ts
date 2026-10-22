import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 73. Set Matrix Zeroes

const M = [
  [1, 2, 3, 4],
  [5, 0, 7, 8],
  [9, 10, 11, 0],
]

const zeros = (m: number[][]) => m.flatMap((r, i) => r.flatMap((v, j) => (v === 0 ? [[i, j] as Cell] : [])))

function grid(m: number[][], label: string, hl: Cell[] = [], cmp: Cell[] = []): GridViewData {
  return { kind: 'grid', label, cells: m.map((r) => [...r]), marks: { hl, cmp } }
}

function setFig(): FigStep[] {
  const m = M.map((r) => [...r])
  const rows = new Set<number>()
  const cols = new Set<number>()
  for (let i = 0; i < m.length; i++) for (let j = 0; j < m[0].length; j++) if (m[i][j] === 0) (rows.add(i), cols.add(j))
  const out: FigStep[] = [
    { note: '陷阱:一邊掃一邊把整列整行改成 0,新出現的 0 會被誤認成「原本的 0」,最後整張表都變 0。所以要**先記下來,再一起改**', views: [grid(m, 'matrix', zeros(m))] },
    { note: `第一輪:記下哪些列、哪些行有 0`, views: [arr([...rows], { label: '要清空的列' }), arr([...cols], { label: '要清空的行' })] },
  ]
  for (let i = 0; i < m.length; i++) for (let j = 0; j < m[0].length; j++) if (rows.has(i) || cols.has(j)) m[i][j] = 0
  out.push({ note: '第二輪:格子所在的列或行在名單裡 → 改成 0', views: [grid(m, '答案', [], zeros(m))] })
  return out
}

function markerFig(): FigStep[] {
  const m = M.map((r) => [...r])
  const R = m.length
  const C = m[0].length
  const firstRow = m[0].includes(0)
  const firstCol = m.some((r) => r[0] === 0)
  const out: FigStep[] = [{ note: `想要 O(1) 空間:把「名單」直接寫在**第 0 列和第 0 行**上。但它們自己原本有沒有 0 要先另外記:第 0 列有 0?${firstRow ? '有' : '沒有'};第 0 行有 0?${firstCol ? '有' : '沒有'}`, views: [grid(m, 'matrix', [...Array(C).keys()].map((j) => [0, j] as Cell).concat([...Array(R).keys()].slice(1).map((i) => [i, 0] as Cell)))] }]
  const marks: Cell[] = []
  for (let i = 1; i < R; i++)
    for (let j = 1; j < C; j++)
      if (m[i][j] === 0) {
        m[i][0] = 0
        m[0][j] = 0
        marks.push([i, 0], [0, j])
      }
  out.push({ note: '掃內部:(i, j) 是 0 → 在 m[i][0] 和 m[0][j] 寫 0 當記號', views: [grid(m, '在第 0 列 / 行做記號', marks)] })
  const filled: Cell[] = []
  for (let i = 1; i < R; i++)
    for (let j = 1; j < C; j++)
      if (m[i][0] === 0 || m[0][j] === 0) {
        if (m[i][j] !== 0) filled.push([i, j])
        m[i][j] = 0
      }
  out.push({ note: '再掃內部:看第 0 列 / 行的記號,把對應的格子清成 0', views: [grid(m, '清內部', filled)] })
  if (firstRow) for (let j = 0; j < C; j++) m[0][j] = 0
  if (firstCol) for (let i = 0; i < R; i++) m[i][0] = 0
  out.push({ note: `最後才處理第 0 列和第 0 行本身(${firstRow || firstCol ? '依照一開始記下的' : '它們原本沒有 0,所以不用整排清掉'})。先處理它們的話,記號會把整張表清光`, views: [grid(m, '答案', [], zeros(m))] })
  return out
}

export const q0073: Solution = {
  id: 73,
  plain: '一張數字表格裡,只要某格是 0,就把它**整列和整行**都改成 0。要直接在原本的表格上改。難的地方是:改出來的新 0 不能再「傳染」下去。',
  statement: '給 m × n 的整數矩陣,如果某個元素是 0,就把它所在的整列與整行都設為 0。請**原地**修改。',
  examples: [
    { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' },
    { input: 'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]', output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]' },
  ],
  constraints: ['m, n ≤ 200', 'Follow-up:O(m·n) 空間很直接,O(m + n) 好一點,能不能 O(1)?'],
  insight: [
    '不能邊掃邊改:改出來的 0 會被當成原本的 0,一路擴散',
    '解法是兩輪:**先記下**哪些列、哪些行要清,**再清**。用兩個集合就是 O(m + n) 空間',
    'O(1) 空間的技巧:拿第 0 列、第 0 行當記號區。它們本身原本有沒有 0,用兩個布林值另外記',
  ],
  approaches: [
    {
      name: '記下要清的列和行',
      idea: '第一輪把有 0 的列號、行號放進兩個集合;第二輪只要 `i in rows or j in cols` 就設 0。',
      steps: ['掃一次:`m[i][j] == 0` → `rows.add(i)`、`cols.add(j)`', '再掃一次:`i in rows or j in cols` → `m[i][j] = 0`'],
      figure: { title: '3 × 4', steps: setFig() },
      complexity: { time: 'O(m · n)', space: 'O(m + n)', why: '掃兩次;集合最多 m + n 個。' },
      verdict: '最清楚,面試先寫這個,再提 O(1) 的優化。',
      code: {
        python: `def setZeroes(matrix):
    rows, cols = set(), set()
    for i, row in enumerate(matrix):          # 第一輪:只記錄,不修改
        for j, v in enumerate(row):
            if v == 0:
                rows.add(i)
                cols.add(j)
    for i, row in enumerate(matrix):          # 第二輪:統一清成 0
        for j in range(len(row)):
            if i in rows or j in cols:
                row[j] = 0`,
        c: `void setZeroes(int **matrix, int matrixSize, int *matrixColSize) {
    int m = matrixSize, n = matrixColSize[0];
    bool *rows = calloc(m, sizeof(bool)), *cols = calloc(n, sizeof(bool));
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (matrix[i][j] == 0) rows[i] = cols[j] = true;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (rows[i] || cols[j]) matrix[i][j] = 0;
    free(rows); free(cols);
}`,
        cpp: `void setZeroes(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<bool> rows(m, false), cols(n, false);
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (matrix[i][j] == 0) rows[i] = cols[j] = true;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (rows[i] || cols[j]) matrix[i][j] = 0;
}`,
        java: `void setZeroes(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    boolean[] rows = new boolean[m], cols = new boolean[n];
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (matrix[i][j] == 0) rows[i] = cols[j] = true;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (rows[i] || cols[j]) matrix[i][j] = 0;
}`,
        javascript: `function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const rows = new Array(m).fill(false), cols = new Array(n).fill(false);
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) if (matrix[i][j] === 0) rows[i] = cols[j] = true;
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) if (rows[i] || cols[j]) matrix[i][j] = 0;
}`,
      },
    },
    {
      name: '用第 0 列 / 第 0 行當記號',
      idea: '先記住第 0 列、第 0 行本身有沒有 0;內部的 0 把記號寫在 `m[i][0]`、`m[0][j]`;依記號清內部;最後才清第 0 列 / 行。',
      steps: ['`firstRow = 0 in m[0]`、`firstCol = any(r[0] == 0)`', '`i, j ≥ 1` 且是 0 → `m[i][0] = m[0][j] = 0`', '`i, j ≥ 1`:`m[i][0] == 0 or m[0][j] == 0` → 設 0', '依 firstRow / firstCol 清第 0 列 / 行'],
      figure: { title: '3 × 4', steps: markerFig() },
      complexity: { time: 'O(m · n)', space: 'O(1)', why: '只多兩個布林值。' },
      verdict: 'Follow-up 的答案。順序很重要:第 0 列 / 行一定要**最後**才清。',
      code: {
        python: `def setZeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    first_row = any(v == 0 for v in matrix[0])
    first_col = any(matrix[i][0] == 0 for i in range(m))
    for i in range(1, m):                     # 記號寫在第 0 列 / 第 0 行
        for j in range(1, n):
            if matrix[i][j] == 0:
                matrix[i][0] = matrix[0][j] = 0
    for i in range(1, m):                     # 依記號清內部
        for j in range(1, n):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    if first_row:                             # 最後才處理記號區本身
        for j in range(n):
            matrix[0][j] = 0
    if first_col:
        for i in range(m):
            matrix[i][0] = 0`,
        c: `void setZeroes(int **matrix, int matrixSize, int *matrixColSize) {
    int m = matrixSize, n = matrixColSize[0];
    bool firstRow = false, firstCol = false;
    for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRow = true;
    for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstCol = true;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            if (matrix[i][j] == 0) matrix[i][0] = matrix[0][j] = 0;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
    if (firstRow) for (int j = 0; j < n; j++) matrix[0][j] = 0;
    if (firstCol) for (int i = 0; i < m; i++) matrix[i][0] = 0;
}`,
        cpp: `void setZeroes(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    bool firstRow = false, firstCol = false;
    for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRow = true;
    for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstCol = true;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            if (matrix[i][j] == 0) matrix[i][0] = matrix[0][j] = 0;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
    if (firstRow) for (int j = 0; j < n; j++) matrix[0][j] = 0;
    if (firstCol) for (int i = 0; i < m; i++) matrix[i][0] = 0;
}`,
        java: `void setZeroes(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    boolean firstRow = false, firstCol = false;
    for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRow = true;
    for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstCol = true;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            if (matrix[i][j] == 0) matrix[i][0] = matrix[0][j] = 0;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
    if (firstRow) for (int j = 0; j < n; j++) matrix[0][j] = 0;
    if (firstCol) for (int i = 0; i < m; i++) matrix[i][0] = 0;
}`,
        javascript: `function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const firstRow = matrix[0].includes(0), firstCol = matrix.some((r) => r[0] === 0);
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++) if (matrix[i][j] === 0) matrix[i][0] = matrix[0][j] = 0;
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++) if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
  if (firstRow) for (let j = 0; j < n; j++) matrix[0][j] = 0;
  if (firstCol) for (let i = 0; i < m; i++) matrix[i][0] = 0;
}`,
      },
    },
  ],
  pitfalls: [
    '邊掃邊清:新的 0 會繼續觸發清除,最後全變 0',
    'O(1) 版本先清第 0 列 / 行:記號區被全部寫成 0,整張表跟著清光',
    'O(1) 版本只用一個變數記「第 0 列或第 0 行有 0」:兩者要分開記',
  ],
  check: {
    kind: 'fn',
    fn: 'setZeroes',
    inplace: 0,
    cases: [
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], out: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
      { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], out: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
      { args: [M.map((r) => [...r])], out: [[1, 0, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]] },
      { args: [[[1]]], out: [[1]] },
      { args: [[[1, 0], [1, 1]]], out: [[0, 0], [1, 0]] },
      { args: [[[1, 2], [0, 3]]], out: [[0, 2], [0, 0]] },
    ],
  },
}
