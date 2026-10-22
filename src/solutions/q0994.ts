import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 994. Rotting Oranges

const G = [
  [2, 1, 1, 0],
  [1, 1, 0, 1],
  [0, 1, 1, 1],
]

function view(g: number[][], hl: Cell[] = [], label = '0 空格、1 新鮮、2 爛掉'): GridViewData {
  return {
    kind: 'grid',
    label,
    cells: g.map((r) => r.map((v) => (v === 0 ? '' : v === 1 ? '🍊' : '🤢'))),
    marks: {
      water: g.flatMap((r, i) => r.flatMap((v, j) => (v === 0 ? [[i, j] as Cell] : []))),
      cmp: g.flatMap((r, i) => r.flatMap((v, j) => (v === 2 ? [[i, j] as Cell] : []))),
      hl,
    },
  }
}

function bfsFig(): FigStep[] {
  const g = G.map((r) => [...r])
  let q: Cell[] = []
  let fresh = 0
  g.forEach((r, i) => r.forEach((v, j) => (v === 2 ? q.push([i, j]) : v === 1 && fresh++)))
  const out: FigStep[] = [{ note: `多源 BFS:**所有**一開始就爛掉的橘子同時當起點放進佇列。每過一分鐘,佇列裡的每一顆都讓四周的新鮮橘子爛掉 —— BFS 的一層就是一分鐘。新鮮的有 ${fresh} 顆`, views: [view(g, q)] }]
  let minutes = 0
  while (q.length && fresh) {
    const next: Cell[] = []
    for (const [r, c] of q)
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nc >= 0 && nr < g.length && nc < g[0].length && g[nr][nc] === 1) {
          g[nr][nc] = 2
          fresh--
          next.push([nr, nc])
        }
      }
    minutes++
    q = next
    out.push({ note: `第 ${minutes} 分鐘:${next.length} 顆被傳染(黑色),剩 ${fresh} 顆新鮮`, views: [view(g, next)] })
  }
  out.push({ note: fresh ? `還有 ${fresh} 顆新鮮的被空格隔開,永遠爛不掉 → −1` : `全部爛掉了,總共 ${minutes} 分鐘`, views: [view(g)] })
  return out
}

function simFig(): FigStep[] {
  const g = G.map((r) => [...r])
  const out: FigStep[] = [{ note: '直接模擬:每一分鐘掃一遍整個網格,找出「這一分鐘會被傳染」的新鮮橘子,再一起改成爛的', views: [view(g)] }]
  for (let t = 1; ; t++) {
    const hit: Cell[] = []
    g.forEach((r, i) =>
      r.forEach((v, j) => {
        if (v === 1 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => g[i + dr]?.[j + dc] === 2)) hit.push([i, j])
      }),
    )
    if (!hit.length) break
    hit.forEach(([i, j]) => (g[i][j] = 2))
    out.push({ note: `第 ${t} 分鐘:掃完整張圖,找到 ${hit.length} 顆鄰居是爛的 → 一起變爛`, views: [view(g, hit)] })
  }
  return out
}

export const q0994: Solution = {
  id: 994,
  plain: '一箱橘子裡有些已經爛了,每過一分鐘,爛橘子會讓上下左右的新鮮橘子也爛掉。問最少幾分鐘後全部都爛掉;如果有橘子永遠不會被傳染到,就回傳 −1。',
  statement: '網格中 0 = 空格、1 = 新鮮橘子、2 = 爛橘子。每分鐘,爛橘子四周(上下左右)的新鮮橘子都會變爛。回傳直到沒有新鮮橘子為止的最少分鐘數;不可能就回傳 -1。',
  examples: [
    { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
    { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1', note: '左下角的橘子被空格隔開' },
    { input: 'grid = [[0,2]]', output: '0', note: '本來就沒有新鮮的' },
  ],
  constraints: ['`m, n ≤ 10`'],
  insight: [
    '傳染是一圈一圈往外擴散的 → **BFS**,而且第 k 層就是第 k 分鐘被傳染的橘子',
    '一開始可能有很多顆爛橘子,它們**同時**開始傳染 → 把所有爛橘子一起放進佇列當第 0 層(多源 BFS)',
    '記住新鮮橘子的數量,每傳染一顆就 −1;BFS 結束還有新鮮的 → −1',
  ],
  approaches: [
    {
      name: '每分鐘掃一次整個網格',
      idea: '每一分鐘:找出所有「鄰居有爛橘子」的新鮮橘子,一起改成爛的(要一起改,才不會同一分鐘連鎖傳染)。沒有新的被傳染就停。',
      steps: ['重複:掃整個網格,收集鄰居是 2 的 1', '沒有 → 停止;有 → 全部改成 2,分鐘 +1', '最後還有 1 → −1,否則回傳分鐘數'],
      figure: { title: `grid = ${JSON.stringify(G)}`, steps: simFig() },
      complexity: { time: 'O((m · n)²)', space: 'O(m · n)', why: '最多 m·n 分鐘,每分鐘掃整張圖。這題 m, n ≤ 10 其實也能過。' },
      verdict: '好懂,但每分鐘都重掃整張圖很浪費:大部分格子跟這一分鐘無關。',
      code: {
        python: `def orangesRotting(grid):
    m, n = len(grid), len(grid[0])
    minutes = 0
    while True:
        hit = [(r, c) for r in range(m) for c in range(n) if grid[r][c] == 1 and any(
            0 <= r + dr < m and 0 <= c + dc < n and grid[r + dr][c + dc] == 2
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        if not hit:
            break
        for r, c in hit:                  # 一起改,避免同一分鐘連鎖傳染
            grid[r][c] = 2
        minutes += 1
    return -1 if any(1 in row for row in grid) else minutes`,
        c: `int orangesRotting(int **grid, int gridSize, int *gridColSize) {
    int m = gridSize, n = gridColSize[0], minutes = 0;
    int *hit = malloc(m * n * sizeof(int));
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (;;) {
        int k = 0;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] != 1) continue;
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] == 2) { hit[k++] = r * n + c; break; }
                }
            }
        if (!k) break;
        for (int i = 0; i < k; i++) grid[hit[i] / n][hit[i] % n] = 2;
        minutes++;
    }
    free(hit);
    for (int r = 0; r < m; r++) for (int c = 0; c < n; c++) if (grid[r][c] == 1) return -1;
    return minutes;
}`,
        cpp: `int orangesRotting(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size(), minutes = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (;;) {
        vector<pair<int, int>> hit;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] != 1) continue;
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] == 2) { hit.push_back({r, c}); break; }
                }
            }
        if (hit.empty()) break;
        for (auto [r, c] : hit) grid[r][c] = 2;
        minutes++;
    }
    for (auto& row : grid) for (int v : row) if (v == 1) return -1;
    return minutes;
}`,
        java: `int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length, minutes = 0;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    for (;;) {
        List<int[]> hit = new ArrayList<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] != 1) continue;
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] == 2) { hit.add(new int[]{r, c}); break; }
                }
            }
        if (hit.isEmpty()) break;
        for (int[] p : hit) grid[p[0]][p[1]] = 2;
        minutes++;
    }
    for (int[] row : grid) for (int v : row) if (v == 1) return -1;
    return minutes;
}`,
        javascript: `function orangesRotting(grid) {
  const m = grid.length, n = grid[0].length;
  let minutes = 0;
  for (;;) {
    const hit = [];
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++)
        if (grid[r][c] === 1 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => grid[r + dr]?.[c + dc] === 2))
          hit.push([r, c]);
    if (!hit.length) break;
    for (const [r, c] of hit) grid[r][c] = 2;
    minutes++;
  }
  return grid.some((row) => row.includes(1)) ? -1 : minutes;
}`,
      },
    },
    {
      name: '多源 BFS',
      idea: '把所有爛橘子一起放進佇列(第 0 分鐘),數好新鮮的有幾顆。每處理完一層,分鐘 +1;傳染一顆就 fresh − 1。',
      steps: ['所有 2 放進佇列;數 1 的個數 `fresh`', '`while 佇列不空 and fresh > 0`:處理這一層的每一顆', '四周是 1 的改成 2、`fresh −= 1`、放進下一層', '這一層處理完 `minutes += 1`', '回傳 `minutes if fresh == 0 else −1`'],
      figure: { title: `grid = ${JSON.stringify(G)}`, steps: bfsFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每顆橘子最多進佇列一次。' },
      verdict: '標準解,[[p:graph-traversal]]的「多源 BFS」。286(到最近的門)、542(到最近的 0)、1162 都是同一招:所有起點一起放進佇列。',
      code: {
        python: `from collections import deque

def orangesRotting(grid):
    m, n = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 2:
                q.append((r, c))          # 所有爛橘子一起當起點
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):           # 一層 = 一分鐘
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`,
        c: `int orangesRotting(int **grid, int gridSize, int *gridColSize) {
    int m = gridSize, n = gridColSize[0], fresh = 0, head = 0, tail = 0, minutes = 0;
    int *q = malloc(m * n * sizeof(int));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 2) q[tail++] = r * n + c;
            else if (grid[r][c] == 1) fresh++;
        }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (head < tail && fresh) {
        int end = tail;
        while (head < end) {
            int r = q[head] / n, c = q[head] % n;
            head++;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    q[tail++] = nr * n + nc;
                }
            }
        }
        minutes++;
    }
    free(q);
    return fresh ? -1 : minutes;
}`,
        cpp: `int orangesRotting(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size(), fresh = 0, minutes = 0;
    queue<pair<int, int>> q;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 2) q.push({r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!q.empty() && fresh) {
        for (int k = q.size(); k > 0; k--) {
            auto [r, c] = q.front(); q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    q.push({nr, nc});
                }
            }
        }
        minutes++;
    }
    return fresh ? -1 : minutes;
}`,
        java: `int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length, fresh = 0, minutes = 0;
    Deque<int[]> q = new ArrayDeque<>();
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 2) q.offer(new int[]{r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    while (!q.isEmpty() && fresh > 0) {
        for (int k = q.size(); k > 0; k--) {
            int[] p = q.poll();
            for (int d = 0; d < 4; d++) {
                int nr = p[0] + dr[d], nc = p[1] + dc[d];
                if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    q.offer(new int[]{nr, nc});
                }
            }
        }
        minutes++;
    }
    return fresh > 0 ? -1 : minutes;
}`,
        javascript: `function orangesRotting(grid) {
  const m = grid.length, n = grid[0].length;
  let q = [], fresh = 0, minutes = 0;
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 2) q.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  while (q.length && fresh) {
    const next = [];
    for (const [r, c] of q)
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
        if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          next.push([nr, nc]);
        }
    q = next;
    minutes++;
  }
  return fresh ? -1 : minutes;
}`,
      },
    },
  ],
  pitfalls: [
    '每顆爛橘子各自做一次 BFS:會算成「最慢的那條擴散」以外的錯誤時間,要所有起點**同時**出發',
    '迴圈條件只寫 `while q`:最後一層沒有再傳染任何人,但分鐘數還是被 +1 了。加上 `and fresh` 或最後減 1',
    '一開始就沒有新鮮橘子:答案是 0,不是 −1',
    '模擬法在同一分鐘內邊掃邊改:剛變爛的橘子會在同一分鐘繼續傳染,時間會算少',
  ],
  followUp: [{ q: '同樣的多源 BFS?', a: '542. 01 Matrix(每格到最近的 0 的距離)、286. Walls and Gates、1162. As Far from Land as Possible。' }],
  check: {
    kind: 'fn',
    fn: 'orangesRotting',
    cases: [
      { args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], out: 4 },
      { args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], out: -1 },
      { args: [[[0, 2]]], out: 0 },
      { args: [G], out: 6 },
      { args: [[[2, 1, 1], [1, 1, 1], [1, 1, 2]]], out: 2 },
      { args: [[[0]]], out: 0 },
    ],
  },
}
