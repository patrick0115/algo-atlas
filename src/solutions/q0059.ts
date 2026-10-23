import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 59. Spiral Matrix II
const M = [[1, 2, 3], [8, 9, 4], [7, 6, 5]]
const grid = (cells: number[][], label: string): GridViewData => ({ kind: 'grid', label, cells })
const boundsFig: FigStep[] = [
  { note: '從左上角開始,依序填上邊、右邊、下邊、左邊,再把四個邊界往內縮。', views: [grid([[1, 2, 3], [8, 0, 4], [7, 6, 5]], '外圈') ] },
  { note: '外圈填完後只剩中央,填入 9,得到完整螺旋。', views: [grid(M, 'n = 3 的答案'), arr([9], { label: '最後填入', done: [0] })] },
]
const walkFig: FigStep[] = [
  { note: '另一種做法是像機器人走格子:右、下、左、上循環。下一格出界或已填過時就轉彎。', views: [grid([[1, 2, 3], [0, 0, 4], [0, 0, 5]], '走到 5') ] },
  { note: '繼續左、上、右直到填滿 n² 格。', views: [grid(M, '完整螺旋')] },
]

export const q0059: Solution = {
  id: 59,
  plain: '建立一個 n × n 方格,把 1 到 n² 像畫螺旋一樣從外圈往內圈填進去。',
  statement: '給正整數 n,產生 n × n 矩陣,把 1 到 n² 按順時針螺旋順序填入。',
  examples: [{ input: 'n = 3', output: '[[1,2,3],[8,9,4],[7,6,5]]' }, { input: 'n = 1', output: '[[1]]' }],
  constraints: ['1 ≤ n ≤ 20'],
  insight: ['和 [54](#/q/54) 走訪螺旋矩陣相反,這題要從空矩陣開始填。', '可以用四個邊界控制每一圈,每走完一邊就縮小範圍。', '也可以維持方向,遇到邊界或已填位置才轉彎。'],
  approaches: [
    {
      name: '四邊界逐圈填入',
      idea: '依上、右、下、左填每一圈;完成一邊就縮小對應邊界。',
      steps: ['建立 n × n 的 0 矩陣,設 top、bottom、left、right', '從左到右填上邊,top 加 1;從上到下填右邊,right 減 1', '若還有列,從右到左填下邊;若還有欄,從下到上填左邊', '直到邊界交錯'],
      figure: { title: 'n = 3 的外圈與中心', steps: boundsFig },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每格恰好填一次;空間就是輸出矩陣。' },
      verdict: '與螺旋走訪題型共用同一套邊界模板。',
      code: {
        python: `def generateMatrix(n):
    a = [[0] * n for _ in range(n)]
    top, bottom, left, right, value = 0, n - 1, 0, n - 1, 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            a[top][c] = value; value += 1
        top += 1
        for r in range(top, bottom + 1):
            a[r][right] = value; value += 1
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                a[bottom][c] = value; value += 1
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                a[r][left] = value; value += 1
            left += 1
    return a`,
        c: `int **generateMatrix(int n, int *returnSize, int **returnColumnSizes) {
    int **a = malloc(n * sizeof(int *));
    *returnColumnSizes = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        a[i] = calloc(n, sizeof(int));
        (*returnColumnSizes)[i] = n;
    }
    *returnSize = n;
    int top = 0, bottom = n - 1, left = 0, right = n - 1, value = 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) a[top][c] = value++;
        top++;
        for (int r = top; r <= bottom; r++) a[r][right] = value++;
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) a[bottom][c] = value++;
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) a[r][left] = value++;
            left++;
        }
    }
    return a;
}`,
        cpp: `vector<vector<int>> generateMatrix(int n) {
    vector<vector<int>> a(n, vector<int>(n));
    int top = 0, bottom = n - 1, left = 0, right = n - 1, value = 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) a[top][c] = value++;
        top++;
        for (int r = top; r <= bottom; r++) a[r][right] = value++;
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) a[bottom][c] = value++;
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) a[r][left] = value++;
            left++;
        }
    }
    return a;
}`,
        java: `int[][] generateMatrix(int n) {
    int[][] a = new int[n][n];
    int top = 0, bottom = n - 1, left = 0, right = n - 1, value = 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) a[top][c] = value++;
        top++;
        for (int r = top; r <= bottom; r++) a[r][right] = value++;
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) a[bottom][c] = value++;
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) a[r][left] = value++;
            left++;
        }
    }
    return a;
}`,
        javascript: `function generateMatrix(n) {
  const a = Array.from({ length: n }, () => Array(n).fill(0));
  let top = 0, bottom = n - 1, left = 0, right = n - 1, value = 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) a[top][c] = value++;
    top++;
    for (let r = top; r <= bottom; r++) a[r][right] = value++;
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) a[bottom][c] = value++;
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) a[r][left] = value++;
      left++;
    }
  }
  return a;
}`,
      },
    },
    {
      name: '方向模擬',
      idea: '每次填一格,如果下一格出界或已填過就順時針轉向。',
      steps: ['建立 n × n 的 0 矩陣,起點 (0,0),方向向右', '填入當前值後計算下一格', '若下一格出界或非 0,方向改成下一個', '重複直到填完 n² 個數'],
      figure: { title: '碰壁就轉彎', steps: walkFig },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每個格子填一次,用輸出矩陣判斷是否已走過。' },
      verdict: '和實際走迷宮的感覺很接近,但要小心轉彎檢查。',
      code: {
        python: `def generateMatrix(n):
    a = [[0] * n for _ in range(n)]
    dr, dc = [0, 1, 0, -1], [1, 0, -1, 0]
    r = c = d = 0
    for value in range(1, n * n + 1):
        a[r][c] = value
        nr, nc = r + dr[d], c + dc[d]
        if not (0 <= nr < n and 0 <= nc < n) or a[nr][nc]:
            d = (d + 1) % 4
        r, c = r + dr[d], c + dc[d]
    return a`,
        c: `int **generateMatrix(int n, int *returnSize, int **returnColumnSizes) {
    int **a = malloc(n * sizeof(int *));
    *returnColumnSizes = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        a[i] = calloc(n, sizeof(int));
        (*returnColumnSizes)[i] = n;
    }
    *returnSize = n;
    int dr[] = {0, 1, 0, -1}, dc[] = {1, 0, -1, 0};
    int r = 0, c = 0, d = 0;
    for (int value = 1; value <= n * n; value++) {
        a[r][c] = value;
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= n || nc < 0 || nc >= n || a[nr][nc]) d = (d + 1) % 4;
        r += dr[d]; c += dc[d];
    }
    return a;
}`,
        cpp: `vector<vector<int>> generateMatrix(int n) {
    vector<vector<int>> a(n, vector<int>(n));
    int dr[] = {0, 1, 0, -1}, dc[] = {1, 0, -1, 0};
    int r = 0, c = 0, d = 0;
    for (int value = 1; value <= n * n; value++) {
        a[r][c] = value;
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= n || nc < 0 || nc >= n || a[nr][nc]) d = (d + 1) % 4;
        r += dr[d]; c += dc[d];
    }
    return a;
}`,
        java: `int[][] generateMatrix(int n) {
    int[][] a = new int[n][n];
    int[] dr = {0, 1, 0, -1}, dc = {1, 0, -1, 0};
    int r = 0, c = 0, d = 0;
    for (int value = 1; value <= n * n; value++) {
        a[r][c] = value;
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= n || nc < 0 || nc >= n || a[nr][nc] != 0) d = (d + 1) % 4;
        r += dr[d]; c += dc[d];
    }
    return a;
}`,
        javascript: `function generateMatrix(n) {
  const a = Array.from({ length: n }, () => Array(n).fill(0));
  const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
  let r = 0, c = 0, d = 0;
  for (let value = 1; value <= n * n; value++) {
    a[r][c] = value;
    const nr = r + dr[d], nc = c + dc[d];
    if (nr < 0 || nr >= n || nc < 0 || nc >= n || a[nr][nc]) d = (d + 1) % 4;
    r += dr[d]; c += dc[d];
  }
  return a;
}`,
      },
    },
  ],
  pitfalls: ['填完一條邊要縮小對應邊界,避免重複填同一格。', '方向模擬中,下一格是否已填過可直接檢查矩陣是否為 0。', 'n = 1 時應得到 [[1]]。'],
  check: { kind: 'fn', fn: 'generateMatrix', cases: [
    { args: [3], out: M }, { args: [1], out: [[1]] },
    { args: [2], out: [[1, 2], [4, 3]] },
  ] },
}
