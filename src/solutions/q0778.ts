import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 778. Swim in Rising Water

const G = [
  [0, 1, 2, 3, 4],
  [24, 23, 22, 21, 5],
  [12, 13, 14, 15, 16],
  [11, 17, 18, 19, 20],
  [10, 9, 8, 7, 6],
]

function grid(done: Cell[], hl: Cell[], label: string): GridViewData {
  return { kind: 'grid', label, cells: G.map((r) => [...r]), marks: { water: done, hl } }
}

function dijkstraFig(): FigStep[] {
  const n = G.length
  const seen = Array.from({ length: n }, () => Array(n).fill(false))
  const heap: [number, number, number][] = [[G[0][0], 0, 0]]
  const order: Cell[] = []
  let t = 0
  const out: FigStep[] = [{ note: '時間 t 時,高度 ≤ t 的格子都能游。從左上角出發,每次**先去「最低」的邊界格子**(像 Dijkstra,只是路徑的代價是「沿途最高的那格」而不是總和)', views: [grid([], [[0, 0]], 'grid')] }]
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0])
    const [h, r, c] = heap.shift()!
    if (seen[r][c]) continue
    seen[r][c] = true
    t = Math.max(t, h)
    order.push([r, c])
    if (r === n - 1 && c === n - 1) break
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nc >= 0 && nr < n && nc < n && !seen[nr][nc]) heap.push([G[nr][nc], nr, nc])
    }
    if ([1, 5, 6, 9, 13].includes(order.length)) out.push({ note: `取出高度 ${h} 的格子 (${r},${c}),目前需要的時間 t = max(沿途) = ${t}`, views: [grid([...order], [[r, c]], `已走 ${order.length} 格`)] })
  }
  out.push({ note: `到達右下角時 t = ${t}:沿途最高的格子是 ${t},這就是最早能游到的時間`, views: [grid(order, [[n - 1, n - 1]], '完成')] })
  return out
}

function bsFig(): FigStep[] {
  return [
    { note: '另一種想法:答案 t 越大越容易到。猜一個 t,用 BFS 只走高度 ≤ t 的格子,看能不能到右下角 → 可以就試更小,不行就試更大', views: [arr([0, '…', 15, '…', 24], { label: 't 的範圍', highlight: [2] })] },
    { note: 't = 15:從 (0,0) 走到 5 之後,16 以上的都不能走 → 到不了。t = 16:可以 → 答案在 16', views: [grid([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [2, 3], [2, 2], [2, 1], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3]], [[2, 4]], 't = 16 能走的格子')] },
  ]
}

export const q0778: Solution = {
  id: 778,
  plain: '一個方格游泳池,每格有不同的高度。時間 t 時水位是 t,只有高度 ≤ t 的格子淹在水裡、可以游。從左上角游到右下角,最早要等到時間多少?',
  statement: '`grid[i][j]` 是 n × n 平台各格的高度(0..n²−1 各不相同)。時間 t 時,可以在高度 ≤ t 的相鄰格子間瞬間游動。從 (0,0) 出發,回傳最早能到達 (n−1, n−1) 的時間。',
  examples: [
    { input: 'grid = [[0,2],[1,3]]', output: '3' },
    { input: 'grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]', output: '16' },
  ],
  constraints: ['`n ≤ 50`'],
  insight: [
    '一條路線需要的時間 = 沿途**最高**的格子。要找「最高點最低」的路線(minimax 路徑)',
    'Dijkstra 的變形:優先處理「到達它所需的時間最小」的格子;代價從「加總」換成「取 max」',
    '也可以二分答案:猜 t,BFS / DFS 只走 ≤ t 的格子能否到終點。t 越大越容易 → 單調 → 二分',
  ],
  approaches: [
    {
      name: '二分答案 + BFS',
      idea: '`lo = grid[0][0]`、`hi = n² − 1`。`can(t)`:BFS 只走高度 ≤ t 的格子。`can(mid)` → `hi = mid`,否則 `lo = mid + 1`。',
      steps: ['`can(t)`:起點高度 > t → False;BFS 只走 ≤ t 的鄰居', '二分找最小的 t 使 `can(t)` 為真'],
      figure: { title: '5 × 5 的範例', steps: bsFig() },
      complexity: { time: 'O(n² log n²)', space: 'O(n²)', why: '二分 log(n²) 次,每次 BFS O(n²)。' },
      verdict: '[[p:binary-search-answer]]的典型應用:「最小化最大值」幾乎都可以二分答案。',
      code: {
        python: `from collections import deque

def swimInWater(grid):
    n = len(grid)

    def can(t):                               # 水位 t 時能不能游到右下角
        if grid[0][0] > t:
            return False
        seen, q = {(0, 0)}, deque([(0, 0)])
        while q:
            r, c = q.popleft()
            if (r, c) == (n - 1, n - 1):
                return True
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen and grid[nr][nc] <= t:
                    seen.add((nr, nc))
                    q.append((nr, nc))
        return False

    lo, hi = grid[0][0], n * n - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if can(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        c: `static int **Gr, Nn;

static bool can(int t) {
    if (Gr[0][0] > t) return false;
    bool *seen = calloc(Nn * Nn, sizeof(bool));
    int *q = malloc(Nn * Nn * sizeof(int)), h = 0, tl = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    q[tl++] = 0; seen[0] = true;
    bool ok = false;
    while (h < tl) {
        int cur = q[h++], r = cur / Nn, c = cur % Nn;
        if (r == Nn - 1 && c == Nn - 1) { ok = true; break; }
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nc < 0 || nr >= Nn || nc >= Nn || seen[nr * Nn + nc] || Gr[nr][nc] > t) continue;
            seen[nr * Nn + nc] = true;
            q[tl++] = nr * Nn + nc;
        }
    }
    free(seen); free(q);
    return ok;
}

int swimInWater(int **grid, int gridSize, int *gridColSize) {
    Gr = grid; Nn = gridSize;
    int lo = grid[0][0], hi = Nn * Nn - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (can(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        cpp: `int swimInWater(vector<vector<int>>& grid) {
    int n = grid.size();
    auto can = [&](int t) {
        if (grid[0][0] > t) return false;
        vector<vector<bool>> seen(n, vector<bool>(n, false));
        queue<pair<int, int>> q;
        q.push({0, 0});
        seen[0][0] = true;
        int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            if (r == n - 1 && c == n - 1) return true;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc] || grid[nr][nc] > t) continue;
                seen[nr][nc] = true;
                q.push({nr, nc});
            }
        }
        return false;
    };
    int lo = grid[0][0], hi = n * n - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (can(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        java: `private int[][] g;
private int n;

int swimInWater(int[][] grid) {
    g = grid; n = grid.length;
    int lo = grid[0][0], hi = n * n - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (can(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

private boolean can(int t) {
    if (g[0][0] > t) return false;
    boolean[][] seen = new boolean[n][n];
    Deque<int[]> q = new ArrayDeque<>();
    q.add(new int[]{0, 0});
    seen[0][0] = true;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!q.isEmpty()) {
        int[] cur = q.poll();
        if (cur[0] == n - 1 && cur[1] == n - 1) return true;
        for (int[] d : dirs) {
            int nr = cur[0] + d[0], nc = cur[1] + d[1];
            if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc] || g[nr][nc] > t) continue;
            seen[nr][nc] = true;
            q.add(new int[]{nr, nc});
        }
    }
    return false;
}`,
        javascript: `function swimInWater(grid) {
  const n = grid.length;
  const can = (t) => {
    if (grid[0][0] > t) return false;
    const seen = Array.from({ length: n }, () => new Array(n).fill(false));
    const q = [[0, 0]];
    seen[0][0] = true;
    for (let h = 0; h < q.length; h++) {
      const [r, c] = q[h];
      if (r === n - 1 && c === n - 1) return true;
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc] || grid[nr][nc] > t) continue;
        seen[nr][nc] = true;
        q.push([nr, nc]);
      }
    }
    return false;
  };
  let lo = grid[0][0], hi = n * n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (can(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      },
    },
    {
      name: 'Dijkstra(代價取 max)',
      idea: '最小堆放 `(到達這格需要的時間, r, c)`。每次取出最小的,鄰居的時間 = `max(目前時間, 鄰居高度)`。第一次取出右下角時就是答案。',
      steps: ['`heap = [(grid[0][0], 0, 0)]`', '取出 `(t, r, c)`;看過就跳過;是終點 → 回傳 t', '鄰居:push `(max(t, grid[nr][nc]), nr, nc)`'],
      figure: { title: '5 × 5 的範例', steps: dijkstraFig() },
      complexity: { time: 'O(n² log n)', space: 'O(n²)', why: 'n² 個格子,每個進出堆一次 O(log n²)。' },
      verdict: '最推薦,[[p:dijkstra]]的變形。和 [743. Network Delay Time](#/q/743) 同一個模板,只是「加總」換成「取 max」。',
      code: {
        python: `import heapq

def swimInWater(grid):
    n = len(grid)
    heap, seen = [(grid[0][0], 0, 0)], set()
    while heap:
        t, r, c = heapq.heappop(heap)         # 目前「需要時間」最小的格子
        if (r, c) in seen:
            continue
        seen.add((r, c))
        if (r, c) == (n - 1, n - 1):
            return t
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))   # 路線的代價是沿途最大值`,
        c: `// 最小堆:元素 = 時間 * 2500 + 格子編號
static int *H, hn;
static void hpush(int x) {
    int i = hn++;
    H[i] = x;
    while (i && H[(i - 1) / 2] > H[i]) { int t = H[i]; H[i] = H[(i - 1) / 2]; H[(i - 1) / 2] = t; i = (i - 1) / 2; }
}
static int hpop(void) {
    int top = H[0];
    H[0] = H[--hn];
    for (int i = 0;;) {
        int s = i, l = 2 * i + 1, r = l + 1;
        if (l < hn && H[l] < H[s]) s = l;
        if (r < hn && H[r] < H[s]) s = r;
        if (s == i) break;
        int t = H[s]; H[s] = H[i]; H[i] = t; i = s;
    }
    return top;
}

int swimInWater(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize, K = 2500;
    H = malloc(4 * n * n * sizeof(int) + 16); hn = 0;
    bool *seen = calloc(n * n, sizeof(bool));
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    hpush(grid[0][0] * K);
    while (hn) {
        int x = hpop(), t = x / K, cell = x % K, r = cell / n, c = cell % n;
        if (seen[cell]) continue;
        seen[cell] = true;
        if (r == n - 1 && c == n - 1) { free(H); free(seen); return t; }
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr * n + nc]) continue;
            int nt = t > grid[nr][nc] ? t : grid[nr][nc];
            hpush(nt * K + nr * n + nc);
        }
    }
    return -1;
}`,
        cpp: `int swimInWater(vector<vector<int>>& grid) {
    int n = grid.size();
    priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> pq;
    vector<vector<bool>> seen(n, vector<bool>(n, false));
    pq.push({grid[0][0], 0, 0});
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!pq.empty()) {
        auto [t, r, c] = pq.top(); pq.pop();
        if (seen[r][c]) continue;
        seen[r][c] = true;
        if (r == n - 1 && c == n - 1) return t;
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) continue;
            pq.push({max(t, grid[nr][nc]), nr, nc});
        }
    }
    return -1;
}`,
        java: `int swimInWater(int[][] grid) {
    int n = grid.length;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    boolean[][] seen = new boolean[n][n];
    pq.add(new int[]{grid[0][0], 0, 0});
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        int t = cur[0], r = cur[1], c = cur[2];
        if (seen[r][c]) continue;
        seen[r][c] = true;
        if (r == n - 1 && c == n - 1) return t;
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) continue;
            pq.add(new int[]{Math.max(t, grid[nr][nc]), nr, nc});
        }
    }
    return -1;
}`,
        javascript: `function swimInWater(grid) {
  const n = grid.length;
  // 最小堆,元素 [時間, r, c]
  const h = [];
  const push = (x) => {
    h.push(x);
    for (let i = h.length - 1, p; i && h[i][0] < h[(p = (i - 1) >> 1)][0]; i = p) [h[i], h[p]] = [h[p], h[i]];
  };
  const pop = () => {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ; ) {
        let s = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < h.length && h[l][0] < h[s][0]) s = l;
        if (r < h.length && h[r][0] < h[s][0]) s = r;
        if (s === i) break;
        [h[i], h[s]] = [h[s], h[i]];
        i = s;
      }
    }
    return top;
  };
  const seen = Array.from({ length: n }, () => new Array(n).fill(false));
  push([grid[0][0], 0, 0]);
  while (h.length) {
    const [t, r, c] = pop();
    if (seen[r][c]) continue;
    seen[r][c] = true;
    if (r === n - 1 && c === n - 1) return t;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
      if (nr >= 0 && nc >= 0 && nr < n && nc < n && !seen[nr][nc]) push([Math.max(t, grid[nr][nc]), nr, nc]);
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: [
    '把代價加總(普通 Dijkstra):這題要的是沿途最大值',
    '忘了起點本身的高度:t 至少是 grid[0][0]',
    '二分的下界從 0 開始也可以,但 `can` 要先檢查起點能不能站',
  ],
  followUp: [{ q: '還有什麼解法?', a: '並查集:把格子依高度由小到大加入,每加一格就和已加入的鄰居合併;(0,0) 和 (n−1,n−1) 第一次連通時的高度就是答案。' }],
  check: {
    kind: 'fn',
    fn: 'swimInWater',
    cases: [
      { args: [[[0, 2], [1, 3]]], out: 3 },
      { args: [G], out: 16 },
      { args: [[[0]]], out: 0 },
      { args: [[[3, 2], [0, 1]]], out: 3 },
      { args: [[[0, 1, 2], [7, 8, 3], [6, 5, 4]]], out: 4 },
    ],
  },
}
