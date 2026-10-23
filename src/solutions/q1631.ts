import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1631. Path With Minimum Effort

const H = [
  [1, 2, 2],
  [3, 8, 2],
  [5, 3, 5],
]

function view(label: string, path: [number, number][] = []): GridViewData {
  return { kind: 'grid', label, cells: H.map((row) => row.map(String)), marks: { done: path } }
}

function dijkstraFig(): FigStep[] {
  return [
    { note: '從左上走到右下(上下左右)。一條路的「體力消耗」= 路上相鄰兩格高度差的**最大值**。求最小的消耗', views: [view('heights')] },
    { note: '這是「最小化路徑上的最大邊」:Dijkstra 一樣適用,只是把 `dist + w` 換成 `max(dist, w)`。從 (0,0) 出發,effort[0][0] = 0', views: [view('heights', [[0, 0]])] },
    { note: '堆中永遠先處理 effort 最小的格子。路徑 1 → 3 → 5 → 3 → 5:高度差 2、2、2、2 → 最大是 2', views: [view('最佳路徑', [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]])] },
    { note: '另一條 1 → 2 → 2 → 2 → 5 的最大差是 3,比較差。答案 2', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}

function bsFig(): FigStep[] {
  return [
    { note: '二分答案:猜一個上限 k,問「只走高度差 ≤ k 的邊,能不能從起點到終點?」→ 用 BFS 檢查', views: [view('heights')] },
    { note: 'k 越大越容易到 → 單調 → 在 [0, 10⁶] 二分找最小可行的 k。k = 1 到不了、k = 2 到得了 → 答案 2', views: [arr([0, 1, 2, 3], { label: '嘗試的 k', dim: [0, 1], done: [2] })] },
  ]
}

export const q1631: Solution = {
  id: 1631,
  plain: '一張地形圖,每格有高度。從左上角走到右下角(上下左右走),每走一步的辛苦程度是兩格的高度差,整趟路的辛苦程度取「最大的那一步」。怎麼走最輕鬆?',
  statement: '給 `rows × columns` 的 `heights`,從 `(0, 0)` 走到 `(rows−1, columns−1)`,可上下左右移動。路徑的**體力消耗**是路徑上相鄰格子高度差絕對值的最大值。回傳最小的體力消耗。',
  examples: [
    { input: 'heights = [[1,2,2],[3,8,2],[5,3,5]]', output: '2' },
    { input: 'heights = [[1,2,3],[3,8,4],[5,3,5]]', output: '1' },
    { input: 'heights = [[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]]', output: '0' },
  ],
  constraints: ['rows, columns ≤ 100,高度 ≤ 10⁶'],
  insight: ['「路徑上的最大邊」最小化 → minimax 路徑', '[[p:dijkstra]]:把累加改成取 max,貪心仍然成立', '或 [[p:binary-search-answer]] + BFS 判斷可達'],
  approaches: [
    {
      name: 'Dijkstra(取 max)',
      idea: '`effort[r][c]` = 到這格的最小消耗;堆中取最小的,往四鄰更新 `max(effort, |Δh|)`。',
      steps: ['`effort = ∞`、`effort[0][0] = 0`、堆放 (0, 0, 0)', '彈出 (e, r, c):是終點 → e;過時跳過', '四鄰:`ne = max(e, |h[r][c] − h[nr][nc]|)`', '`ne < effort[nr][nc]` → 更新、推入'],
      figure: { title: 'heights(3 × 3)', steps: dijkstraFig() },
      complexity: { time: 'O(RC log(RC))', space: 'O(RC)', why: '每格最多推入 4 次。' },
      verdict: '最推薦;Dijkstra 適用於任何「沿路徑單調不減」的代價(加法、取 max 都行)。',
      code: {
        python: `import heapq

def minimumEffortPath(heights):
    R, C = len(heights), len(heights[0])
    effort = [[float('inf')] * C for _ in range(R)]
    effort[0][0] = 0
    pq = [(0, 0, 0)]
    while pq:
        e, r, c = heapq.heappop(pq)
        if (r, c) == (R - 1, C - 1):
            return e
        if e > effort[r][c]:
            continue
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C:
                ne = max(e, abs(heights[r][c] - heights[nr][nc]))   # 路徑代價取最大
                if ne < effort[nr][nc]:
                    effort[nr][nc] = ne
                    heapq.heappush(pq, (ne, nr, nc))
    return 0`,
        c: `typedef struct { int e, r, c; } Item;
static Item *hp;
static int hs;

static void hpush(Item x) {
    int i = hs++;
    hp[i] = x;
    while (i && hp[(i - 1) / 2].e > hp[i].e) { Item t = hp[i]; hp[i] = hp[(i - 1) / 2]; hp[(i - 1) / 2] = t; i = (i - 1) / 2; }
}

static Item hpop(void) {
    Item top = hp[0];
    hp[0] = hp[--hs];
    for (int i = 0;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < hs && hp[l].e < hp[m].e) m = l;
        if (r < hs && hp[r].e < hp[m].e) m = r;
        if (m == i) break;
        Item t = hp[i]; hp[i] = hp[m]; hp[m] = t; i = m;
    }
    return top;
}

int minimumEffortPath(int **heights, int heightsSize, int *heightsColSize) {
    int R = heightsSize, C = heightsColSize[0], ans = 0;
    int *eff = malloc(R * C * sizeof(int)), dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int i = 0; i < R * C; i++) eff[i] = INT_MAX;
    hp = malloc((4 * R * C + 1) * sizeof(Item)); hs = 0;
    eff[0] = 0;
    hpush((Item){0, 0, 0});
    while (hs) {
        Item x = hpop();
        if (x.r == R - 1 && x.c == C - 1) { ans = x.e; break; }
        if (x.e > eff[x.r * C + x.c]) continue;
        for (int k = 0; k < 4; k++) {
            int nr = x.r + dr[k], nc = x.c + dc[k];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
            int d = abs(heights[x.r][x.c] - heights[nr][nc]), ne = d > x.e ? d : x.e;
            if (ne < eff[nr * C + nc]) { eff[nr * C + nc] = ne; hpush((Item){ne, nr, nc}); }
        }
    }
    free(eff); free(hp);
    return ans;
}`,
        cpp: `int minimumEffortPath(vector<vector<int>>& heights) {
    int R = heights.size(), C = heights[0].size();
    vector<vector<int>> eff(R, vector<int>(C, INT_MAX));
    priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> pq;
    eff[0][0] = 0;
    pq.push({0, 0, 0});
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!pq.empty()) {
        auto [e, r, c] = pq.top();
        pq.pop();
        if (r == R - 1 && c == C - 1) return e;
        if (e > eff[r][c]) continue;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
            int ne = max(e, abs(heights[r][c] - heights[nr][nc]));
            if (ne < eff[nr][nc]) { eff[nr][nc] = ne; pq.push({ne, nr, nc}); }
        }
    }
    return 0;
}`,
        java: `int minimumEffortPath(int[][] heights) {
    int R = heights.length, C = heights[0].length;
    int[][] eff = new int[R][C];
    for (int[] row : eff) Arrays.fill(row, Integer.MAX_VALUE);
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    eff[0][0] = 0;
    pq.offer(new int[]{0, 0, 0});
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    while (!pq.isEmpty()) {
        int[] x = pq.poll();
        int e = x[0], r = x[1], c = x[2];
        if (r == R - 1 && c == C - 1) return e;
        if (e > eff[r][c]) continue;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
            int ne = Math.max(e, Math.abs(heights[r][c] - heights[nr][nc]));
            if (ne < eff[nr][nc]) { eff[nr][nc] = ne; pq.offer(new int[]{ne, nr, nc}); }
        }
    }
    return 0;
}`,
        javascript: `function minimumEffortPath(heights) {
  const R = heights.length, C = heights[0].length;
  const eff = Array.from({ length: R }, () => new Array(C).fill(Infinity));
  // 簡單的最小堆:元素是 [effort, r, c]
  const heap = [[0, 0, 0]];
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
  eff[0][0] = 0;
  while (heap.length) {
    const [e, r, c] = pop();
    if (r === R - 1 && c === C - 1) return e;
    if (e > eff[r][c]) continue;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      const ne = Math.max(e, Math.abs(heights[r][c] - heights[nr][nc]));
      if (ne < eff[nr][nc]) {
        eff[nr][nc] = ne;
        push([ne, nr, nc]);
      }
    }
  }
  return 0;
}`,
      },
    },
    {
      name: '二分答案 + BFS',
      idea: '`ok(k)`:只走高度差 ≤ k 的邊,BFS 看能否到終點;在 [0, 10⁶] 二分最小的可行 k。',
      steps: ['`ok(k)`:從 (0, 0) BFS,只走 `|Δh| ≤ k` 的邊', '`lo, hi = 0, 10⁶`', '`ok(mid)` → `hi = mid`,否則 `lo = mid + 1`', '回傳 lo'],
      figure: { title: 'heights(3 × 3)', steps: bsFig() },
      complexity: { time: 'O(RC log(10⁶))', space: 'O(RC)', why: '約 20 次 BFS。' },
      verdict: '不需要堆;「最小化最大值」的另一個常用武器。',
      code: {
        python: `from collections import deque

def minimumEffortPath(heights):
    R, C = len(heights), len(heights[0])

    def ok(k):                                # 高度差 ≤ k 能不能到終點
        seen = [[False] * C for _ in range(R)]
        seen[0][0] = True
        q = deque([(0, 0)])
        while q:
            r, c = q.popleft()
            if (r, c) == (R - 1, C - 1):
                return True
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < R and 0 <= nc < C and not seen[nr][nc] and abs(heights[r][c] - heights[nr][nc]) <= k:
                    seen[nr][nc] = True
                    q.append((nr, nc))
        return False

    lo, hi = 0, 10 ** 6
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        c: `static int **Hh, R, C, *qr, *qc;
static bool *seen;

static bool ok(int k) {
    memset(seen, 0, R * C * sizeof(bool));
    int h = 0, t = 0, dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    seen[0] = true; qr[t] = 0; qc[t++] = 0;
    while (h < t) {
        int r = qr[h], c = qc[h++];
        if (r == R - 1 && c == C - 1) return true;
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr * C + nc]) continue;
            if (abs(Hh[r][c] - Hh[nr][nc]) > k) continue;
            seen[nr * C + nc] = true; qr[t] = nr; qc[t++] = nc;
        }
    }
    return false;
}

int minimumEffortPath(int **heights, int heightsSize, int *heightsColSize) {
    Hh = heights; R = heightsSize; C = heightsColSize[0];
    qr = malloc(R * C * sizeof(int)); qc = malloc(R * C * sizeof(int)); seen = malloc(R * C * sizeof(bool));
    int lo = 0, hi = 1000000;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (ok(mid)) hi = mid;
        else lo = mid + 1;
    }
    free(qr); free(qc); free(seen);
    return lo;
}`,
        cpp: `int minimumEffortPath(vector<vector<int>>& heights) {
    int R = heights.size(), C = heights[0].size();
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    auto ok = [&](int k) {
        vector<vector<bool>> seen(R, vector<bool>(C, false));
        queue<pair<int, int>> q;
        q.push({0, 0});
        seen[0][0] = true;
        while (!q.empty()) {
            auto [r, c] = q.front();
            q.pop();
            if (r == R - 1 && c == C - 1) return true;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) continue;
                if (abs(heights[r][c] - heights[nr][nc]) > k) continue;
                seen[nr][nc] = true;
                q.push({nr, nc});
            }
        }
        return false;
    };
    int lo = 0, hi = 1000000;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (ok(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        java: `int minimumEffortPath(int[][] heights) {
    int lo = 0, hi = 1000000;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (ok(heights, mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

boolean ok(int[][] h, int k) {
    int R = h.length, C = h[0].length;
    boolean[][] seen = new boolean[R][C];
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    Deque<int[]> q = new ArrayDeque<>();
    q.offer(new int[]{0, 0});
    seen[0][0] = true;
    while (!q.isEmpty()) {
        int[] p = q.poll();
        if (p[0] == R - 1 && p[1] == C - 1) return true;
        for (int d = 0; d < 4; d++) {
            int nr = p[0] + dr[d], nc = p[1] + dc[d];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) continue;
            if (Math.abs(h[p[0]][p[1]] - h[nr][nc]) > k) continue;
            seen[nr][nc] = true;
            q.offer(new int[]{nr, nc});
        }
    }
    return false;
}`,
        javascript: `function minimumEffortPath(heights) {
  const R = heights.length, C = heights[0].length;
  const ok = (k) => {
    const seen = Array.from({ length: R }, () => new Array(C).fill(false)), q = [[0, 0]];
    seen[0][0] = true;
    for (let h = 0; h < q.length; h++) {
      const [r, c] = q[h];
      if (r === R - 1 && c === C - 1) return true;
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) continue;
        if (Math.abs(heights[r][c] - heights[nr][nc]) > k) continue;
        seen[nr][nc] = true;
        q.push([nr, nc]);
      }
    }
    return false;
  };
  let lo = 0, hi = 1e6;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      },
    },
  ],
  pitfalls: ['把高度差加總:題目是取最大值', '用一般 BFS(最少步數):步數最少不代表消耗最小', '只往右、往下走:可能需要繞路'],
  check: {
    kind: 'fn',
    fn: 'minimumEffortPath',
    cases: [
      { args: [H], out: 2 },
      { args: [[[1, 2, 3], [3, 8, 4], [5, 3, 5]]], out: 1 },
      { args: [[[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]], out: 0 },
      { args: [[[5]]], out: 0 },
    ],
  },
}
