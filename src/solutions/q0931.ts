import type { GridViewData } from '../types'
import { arr } from '../engine/helpers'
import type { Solution } from './types'

const M = [[2, 1, 3], [6, 5, 4], [7, 8, 9]]
const grid = (marks: [number, number][]): GridViewData => ({ kind: 'grid', label: 'matrix', cells: M, marks: { hl: marks } })

export const q0931: Solution = {
  id: 931,
  plain: '從方格最上排一路走到最下排，每步可往正下、左下或右下；找最便宜的路。',
  statement: '給 n×n 整數矩陣，路徑從第一列任一格出發，每步走到下一列同欄或相鄰欄；回傳路徑元素總和的最小值。',
  examples: [{ input: 'matrix = [[2,1,3],[6,5,4],[7,8,9]]', output: '13', note: '1→5→7 或 1→4→8。' }, { input: 'matrix = [[-19,57],[-40,-5]]', output: '-59' }],
  constraints: ['`1 ≤ n ≤ 100`，元素可為負數；不能用 0 當作「尚未算過」的記號。'],
  insight: ['走到某格後，只需知道從它往下的最低代價。', '三種下一步取最小，再加目前格值；這是 [[p:dp-grid]]。', '也可以從上往下填表，每格取上一列三個可能來源中的最小值。'],
  approaches: [
    {
      name: '自上而下記憶化',
      idea: '`dfs(r,c)` 是從此格走到底部的最低總和，三個孩子選最小。',
      steps: ['越界回傳無限大；到最後一列回傳格值', '其他格回傳目前值加三個下方選擇的最小值', '記憶每格結果；第一列所有起點取最小'],
      figure: { title: 'matrix = [[2,1,3],[6,5,4],[7,8,9]]', steps: [
        { note: '最後一列已在終點，三格代價分別是 7、8、9。', views: [grid([[2, 0], [2, 1], [2, 2]]), arr([7, 8, 9], { label: '底列代價' })] },
        { note: '中間的 5 可接 7、8、9；選 7，從 5 開始代價為 12。', views: [grid([[1, 1], [2, 0]]), arr([12], { label: '從 5 出發' })] },
        { note: '上方的 1 可接 6、5、4；經 5 到 7 得 1+5+7=13。', views: [grid([[0, 1], [1, 1], [2, 0]]), arr([13], { label: '從 1 出發' })] },
        { note: '比較第一列所有起點，最小總和是 13。', views: [grid([[0, 1], [1, 1], [2, 0]]), arr([13], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每格只計算一次，記憶表與遞迴共 O(n²)。' },
      verdict: '直接對應「從這格往下走」的問題定義。',
      code: {
        python: `from functools import cache

def minFallingPathSum(matrix):
    n = len(matrix)

    @cache
    def dfs(r, c):
        if c < 0 or c >= n:
            return float('inf')
        if r == n - 1:
            return matrix[r][c]
        return matrix[r][c] + min(dfs(r + 1, c - 1), dfs(r + 1, c), dfs(r + 1, c + 1))  # 三個方向選最低

    return min(dfs(0, c) for c in range(n))`,
        c: `static int fallingDfs(int **a, int n, int r, int c, int *memo, char *seen) {
    if (c < 0 || c >= n) return INT_MAX / 4;
    if (r == n - 1) return a[r][c];
    int k = r * n + c;
    if (seen[k]) return memo[k];
    int x = fallingDfs(a, n, r + 1, c - 1, memo, seen);
    int y = fallingDfs(a, n, r + 1, c, memo, seen);
    int z = fallingDfs(a, n, r + 1, c + 1, memo, seen);
    int best = x < y ? x : y;
    if (z < best) best = z;
    seen[k] = 1;
    return memo[k] = a[r][c] + best;
}

int minFallingPathSum(int **matrix, int matrixSize, int *matrixColSize) {
    int n = matrixSize, ans = INT_MAX;
    int *memo = calloc(n * n, sizeof(int));
    char *seen = calloc(n * n, 1);
    for (int c = 0; c < n; c++) {
        int v = fallingDfs(matrix, n, 0, c, memo, seen);
        if (v < ans) ans = v;
    }
    free(memo);
    free(seen);
    return ans;
}`,
        cpp: `int minFallingPathSum(vector<vector<int>>& matrix) {
    int n = matrix.size();
    vector<vector<int>> memo(n, vector<int>(n, INT_MAX));
    function<int(int, int)> dfs = [&](int r, int c) {
        if (c < 0 || c >= n) return INT_MAX / 4;
        if (r == n - 1) return matrix[r][c];
        if (memo[r][c] != INT_MAX) return memo[r][c];
        return memo[r][c] = matrix[r][c] + min({dfs(r + 1, c - 1), dfs(r + 1, c), dfs(r + 1, c + 1)});
    };
    int ans = INT_MAX;
    for (int c = 0; c < n; c++) ans = min(ans, dfs(0, c));
    return ans;
}`,
        java: `int minFallingPathSum(int[][] matrix) {
    int n = matrix.length;
    int[][] memo = new int[n][n];
    boolean[][] seen = new boolean[n][n];
    int ans = Integer.MAX_VALUE;
    for (int c = 0; c < n; c++) ans = Math.min(ans, fallingDfs(matrix, 0, c, memo, seen));
    return ans;
}

int fallingDfs(int[][] a, int r, int c, int[][] memo, boolean[][] seen) {
    int n = a.length;
    if (c < 0 || c >= n) return Integer.MAX_VALUE / 4;
    if (r == n - 1) return a[r][c];
    if (seen[r][c]) return memo[r][c];
    int best = Math.min(fallingDfs(a, r + 1, c - 1, memo, seen), fallingDfs(a, r + 1, c, memo, seen));
    best = Math.min(best, fallingDfs(a, r + 1, c + 1, memo, seen));
    seen[r][c] = true;
    return memo[r][c] = a[r][c] + best;
}`,
        javascript: `function minFallingPathSum(matrix) {
  const n = matrix.length;
  const memo = Array.from({ length: n }, () => new Array(n));
  function dfs(r, c) {
    if (c < 0 || c >= n) return Infinity;
    if (r === n - 1) return matrix[r][c];
    if (memo[r][c] !== undefined) return memo[r][c];
    memo[r][c] = matrix[r][c] + Math.min(dfs(r + 1, c - 1), dfs(r + 1, c), dfs(r + 1, c + 1));
    return memo[r][c];
  }
  return Math.min(...matrix[0].map((_, c) => dfs(0, c)));
}`,
      },
    },
    {
      name: '逐列滾動陣列',
      idea: '只保留上一列各欄的最低總和，算完本列再取代它。',
      steps: ['第一列直接當作 prev', '本列每格加上上一列三個合法來源的最小值', '到最後一列取最小'],
      figure: { title: 'matrix = [[2,1,3],[6,5,4],[7,8,9]]', steps: [
        { note: '第一列起點代價就是 [2,1,3]。', views: [grid([[0, 0], [0, 1], [0, 2]]), arr([2, 1, 3], { label: 'prev' })] },
        { note: '第二列的 6 可接 2 或 1，選 1，得到 7。', views: [grid([[1, 0], [0, 1]]), arr([7], { label: '目前格' })] },
        { note: '第二列算完為 [7,6,5]；每格只依賴上一列。', views: [grid([[1, 0], [1, 1], [1, 2]]), arr([7, 6, 5], { label: 'prev' })] },
        { note: '第三列得到 [13,13,14]，其中最小值 13 即答案。', views: [grid([[2, 0], [2, 1], [2, 2]]), arr([13, 13, 14], { label: '末列', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每列掃 n 格，僅保存前後兩列。' },
      verdict: '推薦；省記憶體且不會碰到遞迴深度問題。',
      code: {
        python: `def minFallingPathSum(matrix):
    n = len(matrix)
    prev = matrix[0][:]
    for r in range(1, n):
        cur = [0] * n
        for c in range(n):
            cur[c] = matrix[r][c] + min(prev[k] for k in (c - 1, c, c + 1) if 0 <= k < n)  # 合法來源
        prev = cur
    return min(prev)`,
        c: `int minFallingPathSum(int **matrix, int matrixSize, int *matrixColSize) {
    int n = matrixSize;
    int *prev = malloc(n * sizeof(int));
    int *cur = malloc(n * sizeof(int));
    for (int c = 0; c < n; c++) prev[c] = matrix[0][c];
    for (int r = 1; r < n; r++) {
        for (int c = 0; c < n; c++) {
            int best = prev[c];
            if (c > 0 && prev[c - 1] < best) best = prev[c - 1];
            if (c + 1 < n && prev[c + 1] < best) best = prev[c + 1];
            cur[c] = matrix[r][c] + best;
        }
        int *swap = prev;
        prev = cur;
        cur = swap;
    }
    int ans = prev[0];
    for (int c = 1; c < n; c++) if (prev[c] < ans) ans = prev[c];
    free(prev);
    free(cur);
    return ans;
}`,
        cpp: `int minFallingPathSum(vector<vector<int>>& matrix) {
    int n = matrix.size();
    vector<int> prev = matrix[0];
    for (int r = 1; r < n; r++) {
        vector<int> cur(n);
        for (int c = 0; c < n; c++) {
            int best = prev[c];
            if (c > 0) best = min(best, prev[c - 1]);
            if (c + 1 < n) best = min(best, prev[c + 1]);
            cur[c] = matrix[r][c] + best;
        }
        prev = move(cur);
    }
    return *min_element(prev.begin(), prev.end());
}`,
        java: `int minFallingPathSum(int[][] matrix) {
    int n = matrix.length;
    int[] prev = matrix[0].clone();
    for (int r = 1; r < n; r++) {
        int[] cur = new int[n];
        for (int c = 0; c < n; c++) {
            int best = prev[c];
            if (c > 0) best = Math.min(best, prev[c - 1]);
            if (c + 1 < n) best = Math.min(best, prev[c + 1]);
            cur[c] = matrix[r][c] + best;
        }
        prev = cur;
    }
    int ans = prev[0];
    for (int x : prev) ans = Math.min(ans, x);
    return ans;
}`,
        javascript: `function minFallingPathSum(matrix) {
  const n = matrix.length;
  let prev = [...matrix[0]];
  for (let r = 1; r < n; r++) {
    const cur = new Array(n);
    for (let c = 0; c < n; c++) {
      let best = prev[c];
      if (c > 0) best = Math.min(best, prev[c - 1]);
      if (c + 1 < n) best = Math.min(best, prev[c + 1]);
      cur[c] = matrix[r][c] + best;
    }
    prev = cur;
  }
  return Math.min(...prev);
}`,
      },
    },
  ],
  pitfalls: ['邊界格只有兩個合法來源，不能讀出界。', '每列要用完整的上一列；若直接覆寫同一陣列，會混入本列新值。'],
  check: { kind: 'fn', fn: 'minFallingPathSum', cases: [
    { args: [M], out: 13 },
    { args: [[[-19, 57], [-40, -5]]], out: -59 },
    { args: [[[5]]], out: 5 },
  ] },
}
