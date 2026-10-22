import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 54. Spiral Matrix

const M = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]

function grid(done: Cell[], hl: Cell[], label: string): GridViewData {
  return { kind: 'grid', label, cells: M.map((r) => [...r]), marks: { done, hl } }
}

function boundFig(): FigStep[] {
  let top = 0
  let bottom = M.length - 1
  let left = 0
  let right = M[0].length - 1
  const res: number[] = []
  const done: Cell[] = []
  const out: FigStep[] = [{ note: '用四條邊界 top、bottom、left、right 圍住「還沒走過」的區域。每走完一條邊,就把那條邊界往內縮', views: [grid([], [], `top=${top} bottom=${bottom} left=${left} right=${right}`), arr(res, { label: '答案' })] }]
  const push = (cells: Cell[], what: string) => {
    if (!cells.length) return
    for (const [i, j] of cells) res.push(M[i][j])
    out.push({ note: what, views: [grid([...done], cells, `top=${top} bottom=${bottom} left=${left} right=${right}`), arr([...res], { label: '答案' })] })
    done.push(...cells)
  }
  while (top <= bottom && left <= right) {
    let c: Cell[] = []
    for (let j = left; j <= right; j++) c.push([top, j])
    top++
    push(c, `往右走完第 ${top - 1} 列 → top 下移`)
    c = []
    for (let i = top; i <= bottom; i++) c.push([i, right])
    right--
    push(c, `往下走完第 ${right + 1} 行 → right 左移`)
    if (top <= bottom) {
      c = []
      for (let j = right; j >= left; j--) c.push([bottom, j])
      bottom--
      push(c, `往左走完第 ${bottom + 1} 列 → bottom 上移`)
    }
    if (left <= right) {
      c = []
      for (let i = bottom; i >= top; i--) c.push([i, left])
      left++
      push(c, `往上走完第 ${left - 1} 行 → left 右移`)
    }
  }
  out.push({ note: '邊界交錯(top > bottom 或 left > right)→ 全部走完', views: [grid(done, [], '完成'), arr(res, { label: '答案', done: res.map((_, i) => i) })] })
  return out
}

function dirFig(): FigStep[] {
  return [
    { note: '另一種想法:像機器人一樣照「右、下、左、上」的順序走,撞到邊界或走過的格子就右轉', views: [arr(['→ (0,1)', '↓ (1,0)', '← (0,−1)', '↑ (−1,0)'], { label: '方向陣列' })] },
    { note: '走到 4 撞牆 → 轉向下;走到 12 撞牆 → 轉向左;走到 5 的上面是走過的 1 → 轉向右', views: [grid([[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [2, 2], [2, 1], [2, 0], [1, 0]], [[1, 1], [1, 2]], '最後走 6、7')] },
  ]
}

export const q0054: Solution = {
  id: 54,
  plain: '把一張表格裡的數字,從左上角開始**順時針繞圈**讀出來:先往右、再往下、再往左、再往上,一圈一圈往內縮。',
  statement: '給 m × n 的矩陣,以**螺旋順序**(順時針,由外而內)回傳所有元素。',
  examples: [
    { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' },
    { input: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]', output: '[1,2,3,4,8,12,11,10,9,5,6,7]' },
  ],
  constraints: ['m, n ≤ 10'],
  insight: [
    '這是模擬題,沒有特殊演算法,難在**邊界不要多走也不要少走**',
    '四條邊界圍住還沒走的區域:走完上面一列 → top + 1;走完右邊一行 → right − 1;依此類推',
    '往左、往上之前要再檢查一次邊界還有沒有交錯(只剩一列或一行時,不檢查就會重複走)',
  ],
  approaches: [
    {
      name: '四條邊界往內縮',
      idea: '`top, bottom, left, right`。迴圈:右(top 列)→ 下(right 行)→ 左(bottom 列,要檢查 top ≤ bottom)→ 上(left 行,要檢查 left ≤ right)。',
      steps: ['`while top <= bottom and left <= right`', '往右走 top 列,`top += 1`;往下走 right 行,`right −= 1`', '`if top <= bottom`:往左走 bottom 列,`bottom −= 1`', '`if left <= right`:往上走 left 行,`left += 1`'],
      figure: { title: '3 × 4', steps: boundFig() },
      complexity: { time: 'O(m · n)', space: 'O(1)', why: '每格走一次;不算答案陣列。' },
      verdict: '最推薦:不需要額外的 visited。記得兩個 if 檢查。',
      code: {
        python: `def spiralOrder(matrix):
    res = []
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for j in range(left, right + 1):          # →
            res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):          # ↓
            res.append(matrix[i][right])
        right -= 1
        if top <= bottom:                         # ←(還有列才走)
            for j in range(right, left - 1, -1):
                res.append(matrix[bottom][j])
            bottom -= 1
        if left <= right:                         # ↑(還有行才走)
            for i in range(bottom, top - 1, -1):
                res.append(matrix[i][left])
            left += 1
    return res`,
        c: `int *spiralOrder(int **matrix, int matrixSize, int *matrixColSize, int *returnSize) {
    int m = matrixSize, n = matrixColSize[0], k = 0;
    int *res = malloc(m * n * sizeof(int));
    int top = 0, bottom = m - 1, left = 0, right = n - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res[k++] = matrix[top][j];
        top++;
        for (int i = top; i <= bottom; i++) res[k++] = matrix[i][right];
        right--;
        if (top <= bottom) { for (int j = right; j >= left; j--) res[k++] = matrix[bottom][j]; bottom--; }
        if (left <= right) { for (int i = bottom; i >= top; i--) res[k++] = matrix[i][left]; left++; }
    }
    *returnSize = k;
    return res;
}`,
        cpp: `vector<int> spiralOrder(vector<vector<int>>& matrix) {
    vector<int> res;
    int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res.push_back(matrix[top][j]);
        top++;
        for (int i = top; i <= bottom; i++) res.push_back(matrix[i][right]);
        right--;
        if (top <= bottom) { for (int j = right; j >= left; j--) res.push_back(matrix[bottom][j]); bottom--; }
        if (left <= right) { for (int i = bottom; i >= top; i--) res.push_back(matrix[i][left]); left++; }
    }
    return res;
}`,
        java: `List<Integer> spiralOrder(int[][] matrix) {
    List<Integer> res = new ArrayList<>();
    int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res.add(matrix[top][j]);
        top++;
        for (int i = top; i <= bottom; i++) res.add(matrix[i][right]);
        right--;
        if (top <= bottom) { for (int j = right; j >= left; j--) res.add(matrix[bottom][j]); bottom--; }
        if (left <= right) { for (int i = bottom; i >= top; i--) res.add(matrix[i][left]); left++; }
    }
    return res;
}`,
        javascript: `function spiralOrder(matrix) {
  const res = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) res.push(matrix[top][j]);
    top++;
    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);
    right--;
    if (top <= bottom) { for (let j = right; j >= left; j--) res.push(matrix[bottom][j]); bottom--; }
    if (left <= right) { for (let i = bottom; i >= top; i--) res.push(matrix[i][left]); left++; }
  }
  return res;
}`,
      },
    },
    {
      name: '方向陣列 + 撞牆右轉',
      idea: '方向依序是右、下、左、上。每一步先試著往目前方向走;出界或走過 → 右轉(方向 +1)。走滿 m·n 步結束。',
      steps: ['`dirs = [(0,1),(1,0),(0,−1),(−1,0)]`,`d = 0`', '重複 m·n 次:記下目前格子、標記走過', '下一格不合法 → `d = (d + 1) % 4`;前進'],
      figure: { title: '3 × 4', steps: dirFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '需要 visited 陣列(也可以把走過的格子改成特殊值來省空間,但會破壞輸入)。' },
      verdict: '不用想邊界的細節,很適合「螺旋填數」(59. Spiral Matrix II 這類)的題目。',
      code: {
        python: `def spiralOrder(matrix):
    m, n = len(matrix), len(matrix[0])
    seen = [[False] * n for _ in range(m)]
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]   # 右、下、左、上
    res, r, c, d = [], 0, 0, 0
    for _ in range(m * n):
        res.append(matrix[r][c])
        seen[r][c] = True
        nr, nc = r + dirs[d][0], c + dirs[d][1]
        if not (0 <= nr < m and 0 <= nc < n) or seen[nr][nc]:
            d = (d + 1) % 4                     # 撞牆或走過:右轉
            nr, nc = r + dirs[d][0], c + dirs[d][1]
        r, c = nr, nc
    return res`,
        c: `int *spiralOrder(int **matrix, int matrixSize, int *matrixColSize, int *returnSize) {
    int m = matrixSize, n = matrixColSize[0];
    int dr[4] = {0, 1, 0, -1}, dc[4] = {1, 0, -1, 0};
    bool *seen = calloc(m * n, sizeof(bool));
    int *res = malloc(m * n * sizeof(int)), r = 0, c = 0, d = 0;
    for (int k = 0; k < m * n; k++) {
        res[k] = matrix[r][c];
        seen[r * n + c] = true;
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr * n + nc]) {
            d = (d + 1) % 4;
            nr = r + dr[d]; nc = c + dc[d];
        }
        r = nr; c = nc;
    }
    free(seen);
    *returnSize = m * n;
    return res;
}`,
        cpp: `vector<int> spiralOrder(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    int dr[4] = {0, 1, 0, -1}, dc[4] = {1, 0, -1, 0};
    vector<vector<bool>> seen(m, vector<bool>(n, false));
    vector<int> res;
    int r = 0, c = 0, d = 0;
    for (int k = 0; k < m * n; k++) {
        res.push_back(matrix[r][c]);
        seen[r][c] = true;
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) {
            d = (d + 1) % 4;
            nr = r + dr[d]; nc = c + dc[d];
        }
        r = nr; c = nc;
    }
    return res;
}`,
        java: `List<Integer> spiralOrder(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    int[] dr = {0, 1, 0, -1}, dc = {1, 0, -1, 0};
    boolean[][] seen = new boolean[m][n];
    List<Integer> res = new ArrayList<>();
    int r = 0, c = 0, d = 0;
    for (int k = 0; k < m * n; k++) {
        res.add(matrix[r][c]);
        seen[r][c] = true;
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) {
            d = (d + 1) % 4;
            nr = r + dr[d]; nc = c + dc[d];
        }
        r = nr; c = nc;
    }
    return res;
}`,
        javascript: `function spiralOrder(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
  const seen = Array.from({ length: m }, () => new Array(n).fill(false));
  const res = [];
  let r = 0, c = 0, d = 0;
  for (let k = 0; k < m * n; k++) {
    res.push(matrix[r][c]);
    seen[r][c] = true;
    let nr = r + dr[d], nc = c + dc[d];
    if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) {
      d = (d + 1) % 4;
      nr = r + dr[d]; nc = c + dc[d];
    }
    r = nr; c = nc;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '少了往左、往上前的 `if` 檢查:只剩一列(例如 1 × 3)時,會往回再走一次',
    '用 `while len(res) < m * n` 但每條邊沒檢查:最後一圈會多加元素',
    '方向陣列的順序寫錯(右、下、左、上才是順時針)',
  ],
  followUp: [{ q: '反過來,把 1..n² 螺旋填進 n × n 矩陣?', a: '59. Spiral Matrix II:同樣的四條邊界,只是從「讀」變成「寫」。' }],
  check: {
    kind: 'fn',
    fn: 'spiralOrder',
    cases: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], out: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [M], out: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { args: [[[1, 2, 3]]], out: [1, 2, 3] },
      { args: [[[1], [2], [3]]], out: [1, 2, 3] },
      { args: [[[7]]], out: [7] },
      { args: [[[1, 2], [3, 4], [5, 6]]], out: [1, 2, 4, 6, 5, 3] },
    ],
  },
}
