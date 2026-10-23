import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1162. As Far from Land as Possible

const G = [
  [1, 0, 1],
  [0, 0, 0],
  [1, 0, 1],
]

const cellsOf = (v: number): Cell[] => G.flatMap((row, r) => row.flatMap((x, c) => (x === v ? [[r, c] as Cell] : [])))

function view(label: string, cells: (string | number)[][], extra: Record<string, Cell[]> = {}): GridViewData {
  return { kind: 'grid', label, cells, marks: { land: cellsOf(1), water: cellsOf(0), ...extra } }
}

function bfsFig(): FigStep[] {
  return [
    { note: '對每個海洋格,找最近陸地的曼哈頓距離;要回傳其中**最大**的。反過來想:從所有陸地同時出發往外擴(多源 BFS)', views: [view('grid(1 = 陸地)', G.map((row) => row.map((v) => (v ? 1 : ''))))] },
    { note: '第 1 圈:四個陸地的鄰居 (0,1)、(1,0)、(1,2)、(2,1) 距離 1', views: [view('距離', [[0, 1, 0], [1, '', 1], [0, 1, 0]], { hl: [[0, 1], [1, 0], [1, 2], [2, 1]] })] },
    { note: '第 2 圈:(1,1) 距離 2。BFS 最後擴到的那一圈就是最遠的距離', views: [view('距離', [[0, 1, 0], [1, 2, 1], [0, 1, 0]], { hl: [[1, 1]] }), arr([2], { label: '答案', done: [0] })] },
    { note: '全是陸地或全是海洋時,沒有「海到陸」的距離 → 回傳 −1', views: [arr([-1], { label: '特例' })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: 'DP 版:曼哈頓距離可以拆成兩個方向。第一次由左上往右下掃:`d[r][c] = min(d[r−1][c], d[r][c−1]) + 1`(只考慮來自左、上的陸地)', views: [view('左上 → 右下', [[0, 1, 0], [1, 2, 1], [0, 1, 0]])] },
    { note: '第二次由右下往左上掃:`d[r][c] = min(d[r][c], d[r+1][c] + 1, d[r][c+1] + 1)`。兩次合起來就是到最近陸地的距離', views: [view('右下 → 左上', [[0, 1, 0], [1, 2, 1], [0, 1, 0]], { done: [[1, 1]] })] },
  ]
}

export const q1162: Solution = {
  id: 1162,
  plain: '方格地圖上有海(0)也有陸地(1)。找一格海,讓它離最近的陸地越遠越好,回傳這個距離(上下左右走的步數)。沒有海或沒有陸地時回傳 −1。',
  statement: '給 `n × n` 的 0/1 網格(0 = 海洋、1 = 陸地),找一個海洋格,使它到最近陸地格的**曼哈頓距離**最大,回傳該距離。若網格中只有陸地或只有海洋,回傳 −1。',
  examples: [
    { input: 'grid = [[1,0,1],[0,0,0],[1,0,1]]', output: '2', note: '中間那格' },
    { input: 'grid = [[1,0,0],[0,0,0],[0,0,0]]', output: '4', note: '右下角' },
  ],
  constraints: ['n ≤ 100'],
  insight: ['「每格到最近陸地的距離」→ 所有陸地一起當起點的多源 BFS', 'BFS 擴到的最後一層就是最遠距離', '沒有障礙物時曼哈頓距離也能用兩次方向掃描的 DP'],
  approaches: [
    {
      name: '多源 BFS',
      idea: '所有陸地入佇列;一層一層擴散到海洋,記錄層數;最後一層的層數就是答案。',
      steps: ['所有 1 入佇列', '佇列空或全滿(全陸地)→ −1', 'BFS:鄰居是 0 → 改成 1、入佇列', '回傳擴散的層數 − 1(最後一層沒有再擴出去)'],
      figure: { title: 'grid(3 × 3)', steps: bfsFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每格入佇列一次。' },
      verdict: '最推薦,多源 BFS 的模板題,和 [994](#/q/994)、[542](#/q/542) 同一類。',
      code: {
        python: `from collections import deque

def maxDistance(grid):
    n = len(grid)
    q = deque((r, c) for r in range(n) for c in range(n) if grid[r][c])
    if len(q) in (0, n * n):
        return -1                             # 全海或全陸
    d = -1
    while q:
        d += 1                                # 目前這一層的距離
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n and not grid[nr][nc]:
                    grid[nr][nc] = 1
                    q.append((nr, nc))
    return d`,
        c: `int maxDistance(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize, h = 0, t = 0;
    int *qr = malloc(n * n * sizeof(int)), *qc = malloc(n * n * sizeof(int));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (grid[r][c]) { qr[t] = r; qc[t++] = c; }
    if (t == 0 || t == n * n) { free(qr); free(qc); return -1; }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1}, d = -1;
    while (h < t) {
        d++;
        for (int end = t; h < end; h++)
            for (int k = 0; k < 4; k++) {
                int nr = qr[h] + dr[k], nc = qc[h] + dc[k];
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && !grid[nr][nc]) { grid[nr][nc] = 1; qr[t] = nr; qc[t++] = nc; }
            }
    }
    free(qr); free(qc);
    return d;
}`,
        cpp: `int maxDistance(vector<vector<int>>& grid) {
    int n = grid.size();
    queue<pair<int, int>> q;
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (grid[r][c]) q.push({r, c});
    if (q.empty() || (int)q.size() == n * n) return -1;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1}, d = -1;
    while (!q.empty()) {
        d++;
        for (int sz = q.size(); sz > 0; sz--) {
            auto [r, c] = q.front();
            q.pop();
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && !grid[nr][nc]) { grid[nr][nc] = 1; q.push({nr, nc}); }
            }
        }
    }
    return d;
}`,
        java: `int maxDistance(int[][] grid) {
    int n = grid.length;
    Deque<int[]> q = new ArrayDeque<>();
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (grid[r][c] == 1) q.offer(new int[]{r, c});
    if (q.isEmpty() || q.size() == n * n) return -1;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    int d = -1;
    while (!q.isEmpty()) {
        d++;
        for (int sz = q.size(); sz > 0; sz--) {
            int[] p = q.poll();
            for (int k = 0; k < 4; k++) {
                int nr = p[0] + dr[k], nc = p[1] + dc[k];
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && grid[nr][nc] == 0) { grid[nr][nc] = 1; q.offer(new int[]{nr, nc}); }
            }
        }
    }
    return d;
}`,
        javascript: `function maxDistance(grid) {
  const n = grid.length;
  let q = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (grid[r][c]) q.push([r, c]);
  if (q.length === 0 || q.length === n * n) return -1;
  let d = -1;
  while (q.length) {
    d++;
    const nxt = [];
    for (const [r, c] of q)
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
        if (nr >= 0 && nc >= 0 && nr < n && nc < n && !grid[nr][nc]) {
          grid[nr][nc] = 1;
          nxt.push([nr, nc]);
        }
    q = nxt;
  }
  return d;
}`,
      },
    },
    {
      name: '兩次方向掃描 DP',
      idea: '`d[r][c]` 陸地為 0、海洋為 ∞;左上 → 右下取 `min(上, 左) + 1`,右下 → 左上取 `min(下, 右) + 1`;答案是海洋格的最大 d。',
      steps: ['陸地 0、海洋 INF', '正向:`d[r][c] = min(d[r][c], d[r−1][c] + 1, d[r][c−1] + 1)`', '反向:`d[r][c] = min(d[r][c], d[r+1][c] + 1, d[r][c+1] + 1)`', '取海洋格最大值;它 ≥ INF 或沒有海洋 → −1'],
      figure: { title: 'grid(3 × 3)', steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '兩次掃描。' },
      verdict: '不需要佇列;曼哈頓距離可以拆成「從左上來」和「從右下來」兩部分。',
      code: {
        python: `def maxDistance(grid):
    n, INF = len(grid), 10 ** 9
    d = [[0 if grid[r][c] else INF for c in range(n)] for r in range(n)]
    for r in range(n):
        for c in range(n):
            if r:
                d[r][c] = min(d[r][c], d[r - 1][c] + 1)
            if c:
                d[r][c] = min(d[r][c], d[r][c - 1] + 1)
    for r in range(n - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            if r < n - 1:
                d[r][c] = min(d[r][c], d[r + 1][c] + 1)
            if c < n - 1:
                d[r][c] = min(d[r][c], d[r][c + 1] + 1)
    ans = -1
    for r in range(n):
        for c in range(n):
            if not grid[r][c]:
                ans = max(ans, d[r][c])       # 海洋格到最近陸地的距離
    return -1 if ans >= INF else ans          # 全陸地 → −1;全海洋 → 都是 INF`,
        c: `int maxDistance(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize, INF = 1000000, ans = -1;
    int *d = malloc(n * n * sizeof(int));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) d[r * n + c] = grid[r][c] ? 0 : INF;
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++) {
            if (r && d[(r - 1) * n + c] + 1 < d[r * n + c]) d[r * n + c] = d[(r - 1) * n + c] + 1;
            if (c && d[r * n + c - 1] + 1 < d[r * n + c]) d[r * n + c] = d[r * n + c - 1] + 1;
        }
    for (int r = n - 1; r >= 0; r--)
        for (int c = n - 1; c >= 0; c--) {
            if (r < n - 1 && d[(r + 1) * n + c] + 1 < d[r * n + c]) d[r * n + c] = d[(r + 1) * n + c] + 1;
            if (c < n - 1 && d[r * n + c + 1] + 1 < d[r * n + c]) d[r * n + c] = d[r * n + c + 1] + 1;
        }
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (!grid[r][c] && d[r * n + c] > ans) ans = d[r * n + c];
    free(d);
    return ans >= INF ? -1 : ans;
}`,
        cpp: `int maxDistance(vector<vector<int>>& grid) {
    int n = grid.size(), INF = 1000000, ans = -1;
    vector<vector<int>> d(n, vector<int>(n));
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) d[r][c] = grid[r][c] ? 0 : INF;
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++) {
            if (r) d[r][c] = min(d[r][c], d[r - 1][c] + 1);
            if (c) d[r][c] = min(d[r][c], d[r][c - 1] + 1);
        }
    for (int r = n - 1; r >= 0; r--)
        for (int c = n - 1; c >= 0; c--) {
            if (r < n - 1) d[r][c] = min(d[r][c], d[r + 1][c] + 1);
            if (c < n - 1) d[r][c] = min(d[r][c], d[r][c + 1] + 1);
        }
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (!grid[r][c]) ans = max(ans, d[r][c]);
    return ans >= INF ? -1 : ans;
}`,
        java: `int maxDistance(int[][] grid) {
    int n = grid.length, INF = 1000000, ans = -1;
    int[][] d = new int[n][n];
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) d[r][c] = grid[r][c] == 1 ? 0 : INF;
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++) {
            if (r > 0) d[r][c] = Math.min(d[r][c], d[r - 1][c] + 1);
            if (c > 0) d[r][c] = Math.min(d[r][c], d[r][c - 1] + 1);
        }
    for (int r = n - 1; r >= 0; r--)
        for (int c = n - 1; c >= 0; c--) {
            if (r < n - 1) d[r][c] = Math.min(d[r][c], d[r + 1][c] + 1);
            if (c < n - 1) d[r][c] = Math.min(d[r][c], d[r][c + 1] + 1);
        }
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (grid[r][c] == 0) ans = Math.max(ans, d[r][c]);
    return ans >= INF ? -1 : ans;
}`,
        javascript: `function maxDistance(grid) {
  const n = grid.length, INF = 1e6;
  const d = grid.map((row) => row.map((v) => (v ? 0 : INF)));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (r) d[r][c] = Math.min(d[r][c], d[r - 1][c] + 1);
      if (c) d[r][c] = Math.min(d[r][c], d[r][c - 1] + 1);
    }
  for (let r = n - 1; r >= 0; r--)
    for (let c = n - 1; c >= 0; c--) {
      if (r < n - 1) d[r][c] = Math.min(d[r][c], d[r + 1][c] + 1);
      if (c < n - 1) d[r][c] = Math.min(d[r][c], d[r][c + 1] + 1);
    }
  let ans = -1;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!grid[r][c]) ans = Math.max(ans, d[r][c]);
  return ans >= INF ? -1 : ans;
}`,
      },
    },
  ],
  pitfalls: ['對每個海洋格各自 BFS 找最近陸地:O(n⁴) 會超時', '全海洋或全陸地沒有回傳 −1', '層數多算 1:最後一輪沒有擴出新格子'],
  check: {
    kind: 'fn',
    fn: 'maxDistance',
    cases: [
      { args: [G], out: 2 },
      { args: [[[1, 0, 0], [0, 0, 0], [0, 0, 0]]], out: 4 },
      { args: [[[1, 1], [1, 1]]], out: -1 },
      { args: [[[0, 0], [0, 0]]], out: -1 },
    ],
  },
}
