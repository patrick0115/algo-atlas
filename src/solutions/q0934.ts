import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 934. Shortest Bridge

const G = [
  [0, 1, 0],
  [0, 0, 0],
  [0, 0, 1],
]

const cellsOf = (v: number): Cell[] => G.flatMap((row, r) => row.flatMap((x, c) => (x === v ? [[r, c] as Cell] : [])))

function view(label: string, cells: (string | number)[][], extra: Record<string, Cell[]> = {}): GridViewData {
  return { kind: 'grid', label, cells, marks: { land: cellsOf(1), water: cellsOf(0), ...extra } }
}

function bfsFig(): FigStep[] {
  const base = G.map((row) => row.map((v) => (v ? 1 : '')))
  return [
    { note: '網格裡剛好有兩座島,要把最少的水格填成陸地,讓兩座島連起來。答案 = 兩座島之間最短的「水路」長度', views: [view('grid', base)] },
    { note: '① 先用 DFS 找出第一座島的所有格子,全部當作 BFS 的起點(多源 BFS)', views: [view('第一座島', base, { done: [[0, 1]] })] },
    { note: '② 一圈一圈往外擴:第 1 圈到達 (0,0)、(0,2)、(1,1);第 2 圈到達 (1,0)、(1,2)、(2,1)…', views: [view('距離', [[1, 0, 1], [2, 1, 2], ['', 2, '']], { done: [[0, 1]] })] },
    { note: '第 2 圈擴到 (1,2)、(2,1) 時,它們的鄰居 (2,2) 是第二座島 → 中間經過的水格數 = 2', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}

function pairFig(): FigStep[] {
  return [
    { note: '暴力:分別收集兩座島的所有格子。兩格之間要填的水格數至少是 曼哈頓距離 − 1,而且一定可以做到(沿著 L 形走)', views: [view('兩座島', G.map((row) => row.map((v) => (v ? 1 : ''))), { done: [[0, 1]], hl: [[2, 2]] })] },
    { note: '(0,1) 和 (2,2):|0 − 2| + |1 − 2| − 1 = 2。取所有配對的最小值', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}

export const q0934: Solution = {
  id: 934,
  plain: '方格地圖上剛好有兩座島(1 是陸地、0 是水)。最少要把幾格水填成陸地,才能把兩座島連成一座?',
  statement: '給 `n × n` 的 0/1 矩陣 `grid`,恰有兩座島(四方向相連的 1)。可以把 0 改成 1,回傳讓兩座島相連所需改變的**最少**格數。',
  examples: [
    { input: 'grid = [[0,1],[1,0]]', output: '1' },
    { input: 'grid = [[0,1,0],[0,0,0],[0,0,1]]', output: '2' },
    { input: 'grid = [[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]]', output: '1' },
  ],
  constraints: ['n ≤ 100'],
  insight: ['「最少填幾格」= 從第一座島出發的最短距離 → BFS', '整座島一起當起點(多源 BFS),一圈一圈擴', '先用 DFS 把第一座島找出來並標記'],
  approaches: [
    {
      name: 'DFS 標島 + 多源 BFS',
      idea: '找到第一個 1,DFS 把整座島改成 2 並放進佇列;BFS 一層一層擴,碰到 1 時回傳層數。',
      steps: ['找第一個 1,DFS 把整座島標成 2,全部入佇列', '`step = 0`', 'BFS 每層:鄰居是 1 → 回傳 step;是 0 → 改成 2 入佇列', '一層結束 `step += 1`'],
      figure: { title: 'grid(3 × 3)', steps: bfsFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每格最多被標記一次。' },
      verdict: '最推薦,DFS + BFS 的組合技;多源 BFS 和 [994](#/q/994) 腐爛的橘子同一招。',
      code: {
        python: `import sys
from collections import deque

def shortestBridge(grid):
    sys.setrecursionlimit(1 << 20)
    n = len(grid)
    q = deque()

    def dfs(r, c):                            # 把第一座島標成 2
        if not (0 <= r < n and 0 <= c < n) or grid[r][c] != 1:
            return
        grid[r][c] = 2
        q.append((r, c))
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            dfs(nr, nc)

    r0, c0 = next((r, c) for r in range(n) for c in range(n) if grid[r][c])
    dfs(r0, c0)
    step = 0
    while q:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n:
                    if grid[nr][nc] == 1:
                        return step           # 碰到第二座島
                    if grid[nr][nc] == 0:
                        grid[nr][nc] = 2
                        q.append((nr, nc))
        step += 1
    return -1`,
        c: `static int N, *qr, *qc, qt;

static void dfs(int **g, int r, int c) {
    if (r < 0 || c < 0 || r >= N || c >= N || g[r][c] != 1) return;
    g[r][c] = 2; qr[qt] = r; qc[qt++] = c;
    dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
}

int shortestBridge(int **grid, int gridSize, int *gridColSize) {
    N = gridSize; qt = 0;
    qr = malloc(N * N * sizeof(int)); qc = malloc(N * N * sizeof(int));
    int found = 0;
    for (int r = 0; r < N && !found; r++)
        for (int c = 0; c < N && !found; c++)
            if (grid[r][c]) { dfs(grid, r, c); found = 1; }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1}, h = 0, ans = -1;
    for (int step = 0; h < qt && ans < 0; step++) {
        int end = qt;
        for (; h < end && ans < 0; h++)
            for (int k = 0; k < 4; k++) {
                int nr = qr[h] + dr[k], nc = qc[h] + dc[k];
                if (nr < 0 || nc < 0 || nr >= N || nc >= N) continue;
                if (grid[nr][nc] == 1) { ans = step; break; }
                if (grid[nr][nc] == 0) { grid[nr][nc] = 2; qr[qt] = nr; qc[qt++] = nc; }
            }
    }
    free(qr); free(qc);
    return ans;
}`,
        cpp: `int shortestBridge(vector<vector<int>>& grid) {
    int n = grid.size();
    queue<pair<int, int>> q;
    function<void(int, int)> dfs = [&](int r, int c) {
        if (r < 0 || c < 0 || r >= n || c >= n || grid[r][c] != 1) return;
        grid[r][c] = 2;
        q.push({r, c});
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    };
    bool found = false;
    for (int r = 0; r < n && !found; r++)
        for (int c = 0; c < n && !found; c++)
            if (grid[r][c]) { dfs(r, c); found = true; }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int step = 0; !q.empty(); step++)
        for (int sz = q.size(); sz > 0; sz--) {
            auto [r, c] = q.front();
            q.pop();
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
                if (grid[nr][nc] == 1) return step;
                if (grid[nr][nc] == 0) { grid[nr][nc] = 2; q.push({nr, nc}); }
            }
        }
    return -1;
}`,
        java: `Deque<int[]> q = new ArrayDeque<>();

void dfs(int[][] g, int r, int c) {
    int n = g.length;
    if (r < 0 || c < 0 || r >= n || c >= n || g[r][c] != 1) return;
    g[r][c] = 2;
    q.offer(new int[]{r, c});
    dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
}

int shortestBridge(int[][] grid) {
    int n = grid.length;
    q.clear();
    outer:
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            if (grid[r][c] == 1) { dfs(grid, r, c); break outer; }
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    for (int step = 0; !q.isEmpty(); step++)
        for (int sz = q.size(); sz > 0; sz--) {
            int[] p = q.poll();
            for (int k = 0; k < 4; k++) {
                int nr = p[0] + dr[k], nc = p[1] + dc[k];
                if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
                if (grid[nr][nc] == 1) return step;
                if (grid[nr][nc] == 0) { grid[nr][nc] = 2; q.offer(new int[]{nr, nc}); }
            }
        }
    return -1;
}`,
        javascript: `function shortestBridge(grid) {
  const n = grid.length;
  let q = [];
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= n || c >= n || grid[r][c] !== 1) return;
    grid[r][c] = 2;
    q.push([r, c]);
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  outer: for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (grid[r][c]) {
        dfs(r, c);
        break outer;
      }
  for (let step = 0; q.length; step++) {
    const nxt = [];
    for (const [r, c] of q)
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
        if (grid[nr][nc] === 1) return step;
        if (grid[nr][nc] === 0) {
          grid[nr][nc] = 2;
          nxt.push([nr, nc]);
        }
      }
    q = nxt;
  }
  return -1;
}`,
      },
    },
    {
      name: '兩座島的格子兩兩比曼哈頓距離',
      idea: '用 DFS 分別收集兩座島的格子 A、B;答案 = `min(|r1 − r2| + |c1 − c2| − 1)`。',
      steps: ['DFS 收集第一座島 A(標成 2)', '剩下的 1 就是第二座島 B', '`min(|ra − rb| + |ca − cb|) − 1`'],
      figure: { title: 'grid(3 × 3)', steps: pairFig() },
      complexity: { time: 'O(|A| · |B|)', space: 'O(n²)', why: '最壞 (n² / 2)² ≈ 2.5·10⁷。' },
      verdict: '沒有障礙物時,最短水路就是曼哈頓距離 − 1;比 BFS 好想,但大圖會慢。',
      code: {
        python: `import sys

def shortestBridge(grid):
    sys.setrecursionlimit(1 << 20)
    n = len(grid)
    A = []

    def dfs(r, c):
        if not (0 <= r < n and 0 <= c < n) or grid[r][c] != 1:
            return
        grid[r][c] = 2
        A.append((r, c))
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            dfs(nr, nc)

    r0, c0 = next((r, c) for r in range(n) for c in range(n) if grid[r][c])
    dfs(r0, c0)
    B = [(r, c) for r in range(n) for c in range(n) if grid[r][c] == 1]
    return min(abs(ra - rb) + abs(ca - cb) for ra, ca in A for rb, cb in B) - 1`,
        c: `static int N2, *ar, *ac, na;

static void mark(int **g, int r, int c) {
    if (r < 0 || c < 0 || r >= N2 || c >= N2 || g[r][c] != 1) return;
    g[r][c] = 2; ar[na] = r; ac[na++] = c;
    mark(g, r + 1, c); mark(g, r - 1, c); mark(g, r, c + 1); mark(g, r, c - 1);
}

int shortestBridge(int **grid, int gridSize, int *gridColSize) {
    N2 = gridSize; na = 0;
    ar = malloc(N2 * N2 * sizeof(int)); ac = malloc(N2 * N2 * sizeof(int));
    int found = 0, best = INT_MAX;
    for (int r = 0; r < N2 && !found; r++)
        for (int c = 0; c < N2 && !found; c++)
            if (grid[r][c]) { mark(grid, r, c); found = 1; }
    for (int r = 0; r < N2; r++)
        for (int c = 0; c < N2; c++)
            if (grid[r][c] == 1)
                for (int i = 0; i < na; i++) {
                    int d = abs(ar[i] - r) + abs(ac[i] - c);
                    if (d < best) best = d;
                }
    free(ar); free(ac);
    return best - 1;
}`,
        cpp: `int shortestBridge(vector<vector<int>>& grid) {
    int n = grid.size(), best = INT_MAX;
    vector<pair<int, int>> A;
    function<void(int, int)> dfs = [&](int r, int c) {
        if (r < 0 || c < 0 || r >= n || c >= n || grid[r][c] != 1) return;
        grid[r][c] = 2;
        A.push_back({r, c});
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    };
    bool found = false;
    for (int r = 0; r < n && !found; r++)
        for (int c = 0; c < n && !found; c++)
            if (grid[r][c]) { dfs(r, c); found = true; }
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            if (grid[r][c] == 1)
                for (auto [ra, ca] : A) best = min(best, abs(ra - r) + abs(ca - c));
    return best - 1;
}`,
        java: `List<int[]> A = new ArrayList<>();

void mark(int[][] g, int r, int c) {
    int n = g.length;
    if (r < 0 || c < 0 || r >= n || c >= n || g[r][c] != 1) return;
    g[r][c] = 2;
    A.add(new int[]{r, c});
    mark(g, r + 1, c); mark(g, r - 1, c); mark(g, r, c + 1); mark(g, r, c - 1);
}

int shortestBridge(int[][] grid) {
    int n = grid.length, best = Integer.MAX_VALUE;
    A.clear();
    outer:
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            if (grid[r][c] == 1) { mark(grid, r, c); break outer; }
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            if (grid[r][c] == 1)
                for (int[] a : A) best = Math.min(best, Math.abs(a[0] - r) + Math.abs(a[1] - c));
    return best - 1;
}`,
        javascript: `function shortestBridge(grid) {
  const n = grid.length, A = [];
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= n || c >= n || grid[r][c] !== 1) return;
    grid[r][c] = 2;
    A.push([r, c]);
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  outer: for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (grid[r][c]) {
        dfs(r, c);
        break outer;
      }
  let best = Infinity;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (grid[r][c] === 1) for (const [ra, ca] of A) best = Math.min(best, Math.abs(ra - r) + Math.abs(ca - c));
  return best - 1;
}`,
      },
    },
  ],
  pitfalls: ['只從第一座島的某一格開始 BFS:要整座島一起當起點', '回傳時多算或少算 1:層數代表「中間填了幾格水」', '第一座島沒先標記:BFS 會把自己島上的格子當成第二座島'],
  check: {
    kind: 'fn',
    fn: 'shortestBridge',
    cases: [
      { args: [[[0, 1], [1, 0]]], out: 1 },
      { args: [G], out: 2 },
      { args: [[[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]], out: 1 },
      { args: [[[1, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 1]]], out: 7 },
    ],
  },
}
