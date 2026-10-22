import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 329. Longest Increasing Path in a Matrix

const M = [
  [9, 9, 4],
  [6, 6, 8],
  [2, 1, 1],
]

function view(memo: (number | string)[][], hl: Cell[], label: string, path: Cell[] = []): GridViewData {
  return { kind: 'grid', label, cells: M.map((r, i) => r.map((v, j) => (memo[i][j] === '' ? `${v}` : `${v}→${memo[i][j]}`))), marks: { hl, path } }
}

function memoFig(): FigStep[] {
  const m = M.length
  const n = M[0].length
  const memo: (number | string)[][] = M.map((r) => r.map(() => ''))
  const out: FigStep[] = [{ note: 'f(r, c) = 從 (r, c) 出發、一路往**更大**的鄰居走,最長能走幾格。格子裡「值→f」', views: [view(memo, [], 'matrix')] }]
  const f = (r: number, c: number): number => {
    if (memo[r][c] !== '') return memo[r][c] as number
    let best = 1
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nc >= 0 && nr < m && nc < n && M[nr][nc] > M[r][c]) best = Math.max(best, 1 + f(nr, nc))
    }
    memo[r][c] = best
    const bigger = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dr, dc]) => [r + dr, c + dc] as Cell).filter(([a, b]) => a >= 0 && b >= 0 && a < m && b < n && M[a][b] > M[r][c])
    out.push({ note: bigger.length ? `(${r},${c}) 值 ${M[r][c]}:比它大的鄰居是 ${bigger.map(([a, b]) => `${M[a][b]}(f=${memo[a][b]})`).join('、')} → f = 1 + 最大的 = ${best}` : `(${r},${c}) 值 ${M[r][c]}:四周沒有更大的 → f = 1`, views: [view(memo, [[r, c]], 'memo')] })
    return best
  }
  let best = 0
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) best = Math.max(best, f(r, c))
  out.push({ note: `所有 f 的最大值 = ${best}:1 → 2 → 6 → 9`, views: [view(memo, [], '答案', [[2, 1], [2, 0], [1, 0], [0, 0]])] })
  return out.slice(0, 7).concat(out.slice(-1))
}

function topoFig(): FigStep[] {
  return [
    { note: '把「小 → 大」的相鄰關係看成有向邊,這是一張**沒有環**的圖(嚴格遞增不可能繞回來)。最長路徑 = 拓撲排序的層數', views: [view(M.map((r) => r.map(() => '')), [[2, 1], [2, 2], [0, 2]], '沒有更小鄰居的格子(1、1、4):第 1 層')] },
    { note: '從「沒有更小鄰居」的格子開始 BFS,一層一層剝:每剝一層長度 +1。剝了幾層就是答案', views: [view(M.map((r) => r.map(() => '')), [[0, 0]], '最後一層:左上角的 9 = 第 4 層')] },
  ]
}

export const q0329: Solution = {
  id: 329,
  plain: '在數字表格裡走一條路,每一步往上下左右走,而且下一格一定要**比現在大**。最長能走幾格?',
  statement: '給 m × n 整數矩陣,回傳最長**嚴格遞增路徑**的長度。每一步只能往上、下、左、右移動,不能斜走或超出邊界。',
  examples: [
    { input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]', output: '4', note: '1 → 2 → 6 → 9' },
    { input: 'matrix = [[3,4,5],[3,2,6],[2,2,1]]', output: '4', note: '3 → 4 → 5 → 6' },
  ],
  constraints: ['m, n ≤ 200 → 4 萬格'],
  insight: [
    '從每一格都 DFS 一次會重複很多:同一格出發的最長路徑被算很多次',
    '因為路徑**嚴格遞增**,不會繞回走過的格子 → 不需要 visited,而且「從 (r, c) 出發的最長長度」是固定的,可以**記憶化**',
    '`f(r, c) = 1 + max(f(鄰居))`,只看比它大的鄰居。每格只算一次 → O(m·n)',
    '也可以用拓撲排序:從「沒有更小鄰居」的格子開始一層一層 BFS',
  ],
  approaches: [
    {
      name: 'DFS + 記憶化',
      idea: '`f(r, c)`:看四個方向中比它大的鄰居,取 `1 + f(鄰居)` 的最大值;沒有就是 1。所有格子的 f 取最大。',
      steps: ['`memo[r][c]` 算過就直接回傳', '`best = 1`;對每個比它大的鄰居:`best = max(best, 1 + f(nr, nc))`', '答案 = `max(f(r, c))`'],
      figure: { title: `matrix = ${JSON.stringify(M)}`, steps: memoFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格算一次,每次看 4 個鄰居;遞迴深度最壞 m·n。' },
      verdict: '最推薦,[[p:dp-grid]]裡少見「不是由左上往右下」的 DP:順序由大小關係決定,所以用記憶化遞迴最自然。',
      code: {
        python: `from functools import lru_cache

def longestIncreasingPath(matrix):
    m, n = len(matrix), len(matrix[0])

    @lru_cache(maxsize=None)
    def f(r, c):                              # 從 (r, c) 出發的最長遞增路徑
        best = 1
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + f(nr, nc))
        return best

    return max(f(r, c) for r in range(m) for c in range(n))`,
        c: `static int **Mx, Mm, Nn, *MEMO;

static int f(int r, int c) {
    if (MEMO[r * Nn + c]) return MEMO[r * Nn + c];
    int best = 1, dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int d = 0; d < 4; d++) {
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nc < 0 || nr >= Mm || nc >= Nn || Mx[nr][nc] <= Mx[r][c]) continue;
        int v = 1 + f(nr, nc);
        if (v > best) best = v;
    }
    return MEMO[r * Nn + c] = best;
}

int longestIncreasingPath(int **matrix, int matrixSize, int *matrixColSize) {
    Mx = matrix; Mm = matrixSize; Nn = matrixColSize[0];
    MEMO = calloc(Mm * Nn, sizeof(int));
    int best = 0;
    for (int r = 0; r < Mm; r++)
        for (int c = 0; c < Nn; c++) { int v = f(r, c); if (v > best) best = v; }
    free(MEMO);
    return best;
}`,
        cpp: `int longestIncreasingPath(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size(), best = 0;
    vector<vector<int>> memo(m, vector<int>(n, 0));
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    function<int(int, int)> f = [&](int r, int c) -> int {
        if (memo[r][c]) return memo[r][c];
        int res = 1;
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nc < 0 || nr >= m || nc >= n || matrix[nr][nc] <= matrix[r][c]) continue;
            res = max(res, 1 + f(nr, nc));
        }
        return memo[r][c] = res;
    };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) best = max(best, f(r, c));
    return best;
}`,
        java: `private int[][] mx, memo;
private int m, n;
private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

int longestIncreasingPath(int[][] matrix) {
    mx = matrix; m = matrix.length; n = matrix[0].length;
    memo = new int[m][n];
    int best = 0;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) best = Math.max(best, f(r, c));
    return best;
}

private int f(int r, int c) {
    if (memo[r][c] != 0) return memo[r][c];
    int res = 1;
    for (int[] d : DIRS) {
        int nr = r + d[0], nc = c + d[1];
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || mx[nr][nc] <= mx[r][c]) continue;
        res = Math.max(res, 1 + f(nr, nc));
    }
    return memo[r][c] = res;
}`,
        javascript: `function longestIncreasingPath(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const memo = Array.from({ length: m }, () => new Array(n).fill(0));
  const f = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let res = 1;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
      if (nr >= 0 && nc >= 0 && nr < m && nc < n && matrix[nr][nc] > matrix[r][c]) res = Math.max(res, 1 + f(nr, nc));
    return (memo[r][c] = res);
  };
  let best = 0;
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) best = Math.max(best, f(r, c));
  return best;
}`,
      },
    },
    {
      name: '拓撲排序(一層一層剝)',
      idea: '每格的「入度」= 比它小的鄰居數。入度 0 的先進佇列;BFS 一層一層處理,處理一格就把比它大的鄰居入度 −1,變 0 就進下一層。層數就是答案。',
      steps: ['算每格入度(比它小的鄰居個數)', '入度 0 的格子放進佇列', '一層一層 BFS:每層 `layers += 1`,處理完把大鄰居的入度減 1', '回傳 layers'],
      figure: { title: `matrix = ${JSON.stringify(M)}`, steps: topoFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格進出佇列一次。不需要遞迴,不怕堆疊太深。' },
      verdict: '和 [207. Course Schedule](#/q/207) 是同一個 Kahn 演算法,[[p:topological-sort]]的應用。',
      code: {
        python: `from collections import deque

def longestIncreasingPath(matrix):
    m, n = len(matrix), len(matrix[0])
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    indeg = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] < matrix[r][c]:
                    indeg[r][c] += 1          # 有一個比它小的鄰居
    q = deque((r, c) for r in range(m) for c in range(n) if indeg[r][c] == 0)
    layers = 0
    while q:
        layers += 1
        for _ in range(len(q)):
            r, c = q.popleft()
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:
                    indeg[nr][nc] -= 1
                    if indeg[nr][nc] == 0:
                        q.append((nr, nc))
    return layers`,
        c: `int longestIncreasingPath(int **matrix, int matrixSize, int *matrixColSize) {
    int m = matrixSize, n = matrixColSize[0];
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    int *indeg = calloc(m * n, sizeof(int)), *q = malloc(m * n * sizeof(int)), h = 0, t = 0;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && matrix[nr][nc] < matrix[r][c]) indeg[r * n + c]++;
            }
    for (int i = 0; i < m * n; i++) if (!indeg[i]) q[t++] = i;
    int layers = 0;
    while (h < t) {
        layers++;
        for (int end = t; h < end; h++) {
            int r = q[h] / n, c = q[h] % n;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && matrix[nr][nc] > matrix[r][c] && --indeg[nr * n + nc] == 0) q[t++] = nr * n + nc;
            }
        }
    }
    free(indeg); free(q);
    return layers;
}`,
        cpp: `int longestIncreasingPath(vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    vector<vector<int>> indeg(m, vector<int>(n, 0));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && matrix[nr][nc] < matrix[r][c]) indeg[r][c]++;
            }
    queue<pair<int, int>> q;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) if (!indeg[r][c]) q.push({r, c});
    int layers = 0;
    while (!q.empty()) {
        layers++;
        for (int size = q.size(); size > 0; size--) {
            auto [r, c] = q.front(); q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && matrix[nr][nc] > matrix[r][c] && --indeg[nr][nc] == 0) q.push({nr, nc});
            }
        }
    }
    return layers;
}`,
        java: `int longestIncreasingPath(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    int[][] indeg = new int[m][n];
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && matrix[nr][nc] < matrix[r][c]) indeg[r][c]++;
            }
    Deque<int[]> q = new ArrayDeque<>();
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) if (indeg[r][c] == 0) q.add(new int[]{r, c});
    int layers = 0;
    while (!q.isEmpty()) {
        layers++;
        for (int size = q.size(); size > 0; size--) {
            int[] cur = q.poll();
            for (int[] d : dirs) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && matrix[nr][nc] > matrix[cur[0]][cur[1]] && --indeg[nr][nc] == 0)
                    q.add(new int[]{nr, nc});
            }
        }
    }
    return layers;
}`,
        javascript: `function longestIncreasingPath(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const inside = (r, c) => r >= 0 && c >= 0 && r < m && c < n;
  const indeg = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      for (const [dr, dc] of dirs) if (inside(r + dr, c + dc) && matrix[r + dr][c + dc] < matrix[r][c]) indeg[r][c]++;
  let q = [];
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (!indeg[r][c]) q.push([r, c]);
  let layers = 0;
  while (q.length) {
    layers++;
    const next = [];
    for (const [r, c] of q)
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (inside(nr, nc) && matrix[nr][nc] > matrix[r][c] && --indeg[nr][nc] === 0) next.push([nr, nc]);
      }
    q = next;
  }
  return layers;
}`,
      },
    },
  ],
  pitfalls: [
    '加了 visited 陣列做回溯:嚴格遞增本來就不會走回頭,而且 visited 會讓記憶化的結果錯誤',
    '把「≥」當成可以走:題目要求嚴格遞增,相等不能走(否則可能繞圈)',
    '只從最小值的格子開始:最長路徑的起點不一定是全域最小值',
  ],
  check: {
    kind: 'fn',
    fn: 'longestIncreasingPath',
    cases: [
      { args: [M], out: 4 },
      { args: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], out: 4 },
      { args: [[[1]]], out: 1 },
      { args: [[[7, 7], [7, 7]]], out: 1 },
      { args: [[[1, 2, 3], [6, 5, 4], [7, 8, 9]]], out: 9 },
    ],
  },
}
