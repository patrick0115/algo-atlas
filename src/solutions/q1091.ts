import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1091. Shortest Path in Binary Matrix

const G = [
  [0, 0, 0],
  [1, 1, 0],
  [1, 1, 0],
]

const cellsOf = (v: number): Cell[] => G.flatMap((row, r) => row.flatMap((x, c) => (x === v ? [[r, c] as Cell] : [])))

function view(label: string, cells: (string | number)[][], extra: Record<string, Cell[]> = {}): GridViewData {
  return { kind: 'grid', label, cells, marks: { wall: cellsOf(1), ...extra } }
}

function bfsFig(): FigStep[] {
  return [
    { note: '從左上走到右下,只能走 0 的格子,可以走 **8 個方向**(含斜角)。路徑長度 = 經過的格子數(包含起點和終點)', views: [view('grid(深色 = 1 不能走)', G.map((row) => row.map(() => '')))] },
    { note: '無權圖最短路徑 → BFS。起點距離 1,往 8 個方向擴散', views: [view('距離', [[1, 2, ''], ['', '', ''], ['', '', '']], { hl: [[0, 1]] })] },
    { note: '(0,1) → (0,2) 或斜走到 (1,2) 都是 3;(1,2) 再走到 (2,2) 是 4', views: [view('距離', [[1, 2, 3], ['', '', 3], ['', '', 4]], { done: [[0, 0], [0, 1], [1, 2], [2, 2]] }), arr([4], { label: '答案', done: [0] })] },
    { note: '起點或終點是 1 → 直接 −1', views: [arr([-1], { label: '特例' })] },
  ]
}

function astarFig(): FigStep[] {
  return [
    { note: 'A* 搜尋:優先展開「已走距離 g + 估計剩餘距離 h」最小的格子。8 方向時 h = max(|Δr|, |Δc|)(切比雪夫距離),它不會高估,所以結果仍是最短', views: [view('h = 到終點的切比雪夫距離', [[2, 2, 2], [2, 1, 1], [2, 1, 0]])] },
    { note: '朝著終點的方向優先擴展,通常比 BFS 少看很多格;最壞情況仍是 O(n² log n)', views: [arr([4], { label: '答案', done: [0] })] },
  ]
}

export const q1091: Solution = {
  id: 1091,
  plain: '一個方格迷宮,0 可以走、1 是牆。從左上角走到右下角,每步可以往 8 個方向(包含斜的)走一格。最短要經過幾格?走不到回傳 −1。',
  statement: '給 `n × n` 的 0/1 矩陣 `grid`,回傳從 `(0, 0)` 到 `(n−1, n−1)` 的最短**暢通路徑**長度(路徑上的格子都是 0,相鄰格可八方向相連;長度為經過的格子數)。若不存在回傳 −1。',
  examples: [
    { input: 'grid = [[0,1],[1,0]]', output: '2' },
    { input: 'grid = [[0,0,0],[1,1,0],[1,1,0]]', output: '4' },
    { input: 'grid = [[1,0,0],[1,1,0],[1,1,0]]', output: '-1' },
  ],
  constraints: ['n ≤ 100'],
  insight: ['每步代價相同 → [[p:graph-traversal]] 的 BFS 求最短路徑', '8 個方向:dr、dc 各取 −1、0、1(扣掉 0, 0)', '長度算格子數,起點本身就是 1'],
  approaches: [
    {
      name: 'BFS(8 方向)',
      idea: '起點入佇列、距離 1;每次彈出往 8 個方向擴,到終點回傳距離。',
      steps: ['起點或終點是 1 → −1', '`q = [(0, 0, 1)]`,把起點標記成走過', '彈出 (r, c, d):是終點 → d', '8 個鄰居:在界內、是 0 → 標記、入佇列 (d + 1)'],
      figure: { title: 'grid(3 × 3)', steps: bfsFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每格入佇列一次,每次看 8 個鄰居。' },
      verdict: '最推薦,BFS 最短路徑的標準題;入佇列時就標記,避免同一格被重複加入。',
      code: {
        python: `from collections import deque

def shortestPathBinaryMatrix(grid):
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1
    q = deque([(0, 0, 1)])
    grid[0][0] = 1                            # 走過就改成 1,當作 visited
    while q:
        r, c, d = q.popleft()
        if r == n - 1 and c == n - 1:
            return d
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and not grid[nr][nc]:
                    grid[nr][nc] = 1
                    q.append((nr, nc, d + 1))
    return -1`,
        c: `int shortestPathBinaryMatrix(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize;
    if (grid[0][0] || grid[n - 1][n - 1]) return -1;
    int *qr = malloc(n * n * sizeof(int)), *qc = malloc(n * n * sizeof(int)), *qd = malloc(n * n * sizeof(int));
    int h = 0, t = 0, ans = -1;
    qr[t] = 0; qc[t] = 0; qd[t++] = 1; grid[0][0] = 1;
    while (h < t) {
        int r = qr[h], c = qc[h], d = qd[h++];
        if (r == n - 1 && c == n - 1) { ans = d; break; }
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && !grid[nr][nc]) {
                    grid[nr][nc] = 1; qr[t] = nr; qc[t] = nc; qd[t++] = d + 1;
                }
            }
    }
    free(qr); free(qc); free(qd);
    return ans;
}`,
        cpp: `int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
    int n = grid.size();
    if (grid[0][0] || grid[n - 1][n - 1]) return -1;
    queue<array<int, 3>> q;
    q.push({0, 0, 1});
    grid[0][0] = 1;
    while (!q.empty()) {
        auto [r, c, d] = q.front();
        q.pop();
        if (r == n - 1 && c == n - 1) return d;
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && !grid[nr][nc]) { grid[nr][nc] = 1; q.push({nr, nc, d + 1}); }
            }
    }
    return -1;
}`,
        java: `int shortestPathBinaryMatrix(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    Deque<int[]> q = new ArrayDeque<>();
    q.offer(new int[]{0, 0, 1});
    grid[0][0] = 1;
    while (!q.isEmpty()) {
        int[] p = q.poll();
        if (p[0] == n - 1 && p[1] == n - 1) return p[2];
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = p[0] + dr, nc = p[1] + dc;
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && grid[nr][nc] == 0) { grid[nr][nc] = 1; q.offer(new int[]{nr, nc, p[2] + 1}); }
            }
    }
    return -1;
}`,
        javascript: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] || grid[n - 1][n - 1]) return -1;
  const q = [[0, 0, 1]];
  grid[0][0] = 1;
  for (let h = 0; h < q.length; h++) {
    const [r, c, d] = q[h];
    if (r === n - 1 && c === n - 1) return d;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < n && nc < n && !grid[nr][nc]) {
          grid[nr][nc] = 1;
          q.push([nr, nc, d + 1]);
        }
      }
  }
  return -1;
}`,
      },
    },
    {
      name: 'A* 搜尋',
      idea: '最小堆依 `g + h` 排序,h 為到終點的切比雪夫距離;每格記錄目前最佳 g,彈出時若已過時就跳過。',
      steps: ['`best[0][0] = 1`,堆裡放 `(1 + h(0,0), 1, 0, 0)`', '彈出 (f, g, r, c):`g > best[r][c]` 跳過;是終點 → g', '8 個鄰居:可走且 `g + 1 < best` → 更新並推入 `(g + 1 + h, g + 1, nr, nc)`', '堆空 → −1'],
      figure: { title: 'grid(3 × 3)', steps: astarFig() },
      complexity: { time: 'O(n² log n)', space: 'O(n²)', why: '最壞每格進堆常數次;實際上通常只看一小部分。' },
      verdict: '有「方向感」的最短路徑搜尋;h 不高估時保證最短,是 BFS / Dijkstra 的延伸。',
      code: {
        python: `import heapq

def shortestPathBinaryMatrix(grid):
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1
    h = lambda r, c: max(n - 1 - r, n - 1 - c)  # 切比雪夫距離,不會高估
    best = [[float('inf')] * n for _ in range(n)]
    best[0][0] = 1
    pq = [(1 + h(0, 0), 1, 0, 0)]
    while pq:
        _, g, r, c = heapq.heappop(pq)
        if g > best[r][c]:
            continue                          # 過時的紀錄
        if r == n - 1 and c == n - 1:
            return g
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and not grid[nr][nc] and g + 1 < best[nr][nc]:
                    best[nr][nc] = g + 1
                    heapq.heappush(pq, (g + 1 + h(nr, nc), g + 1, nr, nc))
    return -1`,
        c: `typedef struct { int f, g, r, c; } Node;
static Node *heap;
static int hsz;

static void push(Node x) {
    int i = hsz++;
    heap[i] = x;
    while (i && heap[(i - 1) / 2].f > heap[i].f) { Node t = heap[i]; heap[i] = heap[(i - 1) / 2]; heap[(i - 1) / 2] = t; i = (i - 1) / 2; }
}

static Node pop(void) {
    Node top = heap[0];
    heap[0] = heap[--hsz];
    for (int i = 0;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < hsz && heap[l].f < heap[m].f) m = l;
        if (r < hsz && heap[r].f < heap[m].f) m = r;
        if (m == i) break;
        Node t = heap[i]; heap[i] = heap[m]; heap[m] = t; i = m;
    }
    return top;
}

int shortestPathBinaryMatrix(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize, ans = -1;
    if (grid[0][0] || grid[n - 1][n - 1]) return -1;
    int *best = malloc(n * n * sizeof(int));
    for (int i = 0; i < n * n; i++) best[i] = INT_MAX;
    heap = malloc(8 * n * n * sizeof(Node) + sizeof(Node));
    hsz = 0;
    best[0] = 1;
    push((Node){1 + n - 1, 1, 0, 0});
    while (hsz) {
        Node x = pop();
        if (x.g > best[x.r * n + x.c]) continue;
        if (x.r == n - 1 && x.c == n - 1) { ans = x.g; break; }
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = x.r + dr, nc = x.c + dc;
                if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] || x.g + 1 >= best[nr * n + nc]) continue;
                best[nr * n + nc] = x.g + 1;
                int hr = n - 1 - nr, hc = n - 1 - nc;
                push((Node){x.g + 1 + (hr > hc ? hr : hc), x.g + 1, nr, nc});
            }
    }
    free(best); free(heap);
    return ans;
}`,
        cpp: `int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
    int n = grid.size();
    if (grid[0][0] || grid[n - 1][n - 1]) return -1;
    auto h = [&](int r, int c) { return max(n - 1 - r, n - 1 - c); };
    vector<vector<int>> best(n, vector<int>(n, INT_MAX));
    priority_queue<array<int, 4>, vector<array<int, 4>>, greater<>> pq;
    best[0][0] = 1;
    pq.push({1 + h(0, 0), 1, 0, 0});
    while (!pq.empty()) {
        auto [f, g, r, c] = pq.top();
        pq.pop();
        if (g > best[r][c]) continue;
        if (r == n - 1 && c == n - 1) return g;
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] || g + 1 >= best[nr][nc]) continue;
                best[nr][nc] = g + 1;
                pq.push({g + 1 + h(nr, nc), g + 1, nr, nc});
            }
    }
    return -1;
}`,
        java: `int shortestPathBinaryMatrix(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    int[][] best = new int[n][n];
    for (int[] row : best) Arrays.fill(row, Integer.MAX_VALUE);
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    best[0][0] = 1;
    pq.offer(new int[]{n, 1, 0, 0});
    while (!pq.isEmpty()) {
        int[] x = pq.poll();
        int g = x[1], r = x[2], c = x[3];
        if (g > best[r][c]) continue;
        if (r == n - 1 && c == n - 1) return g;
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] == 1 || g + 1 >= best[nr][nc]) continue;
                best[nr][nc] = g + 1;
                pq.offer(new int[]{g + 1 + Math.max(n - 1 - nr, n - 1 - nc), g + 1, nr, nc});
            }
    }
    return -1;
}`,
        javascript: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] || grid[n - 1][n - 1]) return -1;
  const h = (r, c) => Math.max(n - 1 - r, n - 1 - c);
  const best = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  // 簡單的二元堆:元素是 [f, g, r, c]
  const heap = [];
  const push = (x) => {
    heap.push(x);
    for (let i = heap.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  best[0][0] = 1;
  push([1 + h(0, 0), 1, 0, 0]);
  while (heap.length) {
    const [, g, r, c] = pop();
    if (g > best[r][c]) continue;
    if (r === n - 1 && c === n - 1) return g;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] || g + 1 >= best[nr][nc]) continue;
        best[nr][nc] = g + 1;
        push([g + 1 + h(nr, nc), g + 1, nr, nc]);
      }
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['只走 4 個方向:題目允許斜走', '長度從 0 開始算:起點本身算 1 格', '彈出時才標記 visited:同一格會被加入佇列很多次'],
  check: {
    kind: 'fn',
    fn: 'shortestPathBinaryMatrix',
    cases: [
      { args: [[[0, 1], [1, 0]]], out: 2 },
      { args: [G], out: 4 },
      { args: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], out: -1 },
      { args: [[[0]]], out: 1 },
      { args: [[[0, 0, 0], [1, 1, 0], [1, 1, 1]]], out: -1 },
      { args: [[[0, 1, 1, 0, 0, 0], [0, 1, 0, 1, 1, 0], [0, 1, 1, 0, 1, 0], [0, 0, 0, 1, 1, 0], [1, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 0]]], out: 14 },
    ],
  },
}
