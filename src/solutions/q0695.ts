import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 695. Max Area of Island

const G = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 1, 1],
  [0, 0, 0, 1, 0],
  [0, 1, 0, 1, 1],
]

function view(label: number[][], hl: Cell[] = []): GridViewData {
  return {
    kind: 'grid',
    label: 'grid(數字 = 屬於第幾座島)',
    cells: G.map((row, r) => row.map((v, c) => (label[r][c] ? `#${label[r][c]}` : v ? '1' : ''))),
    marks: {
      land: G.flatMap((row, r) => row.flatMap((v, c) => (v && !label[r][c] ? [[r, c] as Cell] : []))),
      done: label.flatMap((row, r) => row.flatMap((v, c) => (v ? [[r, c] as Cell] : []))),
      water: G.flatMap((row, r) => row.flatMap((v, c) => (v ? [] : [[r, c] as Cell]))),
      hl,
    },
  }
}

function dfsFig(bfs = false): FigStep[] {
  const label = G.map((r) => r.map(() => 0))
  let id = 0
  let best = 0
  const areas: number[] = []
  const out: FigStep[] = [{ note: bfs ? '和 200 題一樣掃過每一格、遇到陸地就把整座島走完。BFS 版:每從佇列拿出一格,area 就加 1,走完整座島 area 就是格數' : '和 200 題一樣掃過每一格、遇到陸地就把整座島走完。差別是 DFS 要**回傳這座島有幾格**:1(自己)+ 四個方向回傳的格數', views: [view(label)] }]
  for (let r = 0; r < G.length; r++)
    for (let c = 0; c < G[0].length; c++) {
      if (!G[r][c] || label[r][c]) continue
      id++
      const cells: Cell[] = []
      const dfs = (x: number, y: number): number => {
        if (x < 0 || y < 0 || x >= G.length || y >= G[0].length || !G[x][y] || label[x][y]) return 0
        label[x][y] = id
        cells.push([x, y])
        return 1 + dfs(x + 1, y) + dfs(x - 1, y) + dfs(x, y + 1) + dfs(x, y - 1)
      }
      const a = dfs(r, c)
      areas.push(a)
      best = Math.max(best, a)
      out.push({ note: `從 (${r},${c}) 出發的第 ${id} 座島:${a} 格。最大 ${best}`, views: [view(label, cells), arr(areas, { label: '每座島的面積' })] })
    }
  return out
}

export const q0695: Solution = {
  id: 695,
  plain: '地圖上 1 是陸地、0 是水,上下左右相連的陸地是同一座島。找出**面積最大**的那座島有幾格。',
  statement: '給一個 0 / 1 的網格(1 是陸地),島嶼由上下左右相連的 1 組成,面積是它的格數。回傳最大的島嶼面積;沒有島就回傳 0。',
  examples: [
    { input: 'grid = 8 × 13 的範例', output: '6' },
    { input: 'grid = [[0,0,0,0,0,0,0,0]]', output: '0' },
  ],
  constraints: ['`m, n ≤ 50`', '格子是**數字** 0 / 1(和 200 題的字元不同)'],
  insight: [
    '和 [200. Number of Islands](#/q/200) 幾乎一樣:每遇到一座新島就把它走完',
    '差別:200 只要「數有幾座」,這題要「每座有多大」→ DFS / BFS 走的時候順便計數',
    'DFS 寫成「回傳面積」:`area(r, c) = 1 + 四個方向的 area`,走過的格子改成 0 就不會重算',
  ],
  approaches: [
    {
      name: 'DFS 回傳面積',
      idea: '`dfs(r, c)`:超出範圍或是水 → 0;否則把這格改成 0,回傳 `1 + 四個方向的 dfs`。對每一格呼叫,取最大。',
      steps: ['`best = 0`', '每一格是 1 → `best = max(best, dfs(r, c))`', '`dfs`:不合法 → 0;`grid[r][c] = 0`;回傳 `1 + dfs(上) + dfs(下) + dfs(左) + dfs(右)`'],
      figure: { title: 'grid(4 × 5)', steps: dfsFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格最多被走一次;遞迴深度最壞 m·n。' },
      verdict: '標準解。「DFS 回傳子問題的結果」比用全域變數計數更乾淨。',
      code: {
        python: `def maxAreaOfIsland(grid):
    m, n = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] == 0:
            return 0
        grid[r][c] = 0                    # 走過就淹掉
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

    return max((dfs(r, c) for r in range(m) for c in range(n)), default=0)`,
        c: `static int **G, M, N;

static int dfs(int r, int c) {
    if (r < 0 || c < 0 || r >= M || c >= N || G[r][c] == 0) return 0;
    G[r][c] = 0;
    return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
}

int maxAreaOfIsland(int **grid, int gridSize, int *gridColSize) {
    G = grid; M = gridSize; N = gridColSize[0];
    int best = 0;
    for (int r = 0; r < M; r++)
        for (int c = 0; c < N; c++) {
            int a = dfs(r, c);
            if (a > best) best = a;
        }
    return best;
}`,
        cpp: `int maxAreaOfIsland(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size(), best = 0;
    function<int(int, int)> dfs = [&](int r, int c) -> int {
        if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] == 0) return 0;
        grid[r][c] = 0;
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
    };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) best = max(best, dfs(r, c));
    return best;
}`,
        java: `int maxAreaOfIsland(int[][] grid) {
    int best = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++) best = Math.max(best, dfs(grid, r, c));
    return best;
}

private int dfs(int[][] g, int r, int c) {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] == 0) return 0;
    g[r][c] = 0;
    return 1 + dfs(g, r + 1, c) + dfs(g, r - 1, c) + dfs(g, r, c + 1) + dfs(g, r, c - 1);
}`,
        javascript: `function maxAreaOfIsland(grid) {
  const m = grid.length, n = grid[0].length;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] === 0) return 0;
    grid[r][c] = 0;
    return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
  };
  let best = 0;
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) best = Math.max(best, dfs(r, c));
  return best;
}`,
      },
    },
    {
      name: 'BFS 計數',
      idea: '遇到陸地就開一個佇列,每拿出一格面積 +1,四周的陸地標記後放進佇列。',
      steps: ['每一格是 1:標記、放進佇列、`area = 0`', '拿出一格 `area += 1`,四周是 1 的標記並放進佇列', '`best = max(best, area)`'],
      figure: { title: 'grid(4 × 5)', steps: dfsFig(true) },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格一次;佇列最多 O(m·n)。' },
      verdict: '不用遞迴,避免整張圖都是陸地時遞迴太深。',
      code: {
        python: `from collections import deque

def maxAreaOfIsland(grid):
    m, n = len(grid), len(grid[0])
    best = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 0:
                continue
            grid[r][c] = 0
            q, area = deque([(r, c)]), 0
            while q:
                x, y = q.popleft()
                area += 1
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == 1:
                        grid[nx][ny] = 0
                        q.append((nx, ny))
            best = max(best, area)
    return best`,
        c: `int maxAreaOfIsland(int **grid, int gridSize, int *gridColSize) {
    int m = gridSize, n = gridColSize[0], best = 0;
    int *q = malloc(m * n * sizeof(int));
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (!grid[r][c]) continue;
            grid[r][c] = 0;
            int head = 0, tail = 0, area = 0;
            q[tail++] = r * n + c;
            while (head < tail) {
                int x = q[head] / n, y = q[head] % n;
                head++; area++;
                for (int k = 0; k < 4; k++) {
                    int nx = x + dr[k], ny = y + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny]) {
                        grid[nx][ny] = 0;
                        q[tail++] = nx * n + ny;
                    }
                }
            }
            if (area > best) best = area;
        }
    free(q);
    return best;
}`,
        cpp: `int maxAreaOfIsland(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size(), best = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (!grid[r][c]) continue;
            grid[r][c] = 0;
            queue<pair<int, int>> q;
            q.push({r, c});
            int area = 0;
            while (!q.empty()) {
                auto [x, y] = q.front(); q.pop();
                area++;
                for (int k = 0; k < 4; k++) {
                    int nx = x + dr[k], ny = y + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny]) {
                        grid[nx][ny] = 0;
                        q.push({nx, ny});
                    }
                }
            }
            best = max(best, area);
        }
    return best;
}`,
        java: `int maxAreaOfIsland(int[][] grid) {
    int m = grid.length, n = grid[0].length, best = 0;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 0) continue;
            grid[r][c] = 0;
            Deque<int[]> q = new ArrayDeque<>();
            q.offer(new int[]{r, c});
            int area = 0;
            while (!q.isEmpty()) {
                int[] p = q.poll();
                area++;
                for (int k = 0; k < 4; k++) {
                    int nx = p[0] + dr[k], ny = p[1] + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny] == 1) {
                        grid[nx][ny] = 0;
                        q.offer(new int[]{nx, ny});
                    }
                }
            }
            best = Math.max(best, area);
        }
    return best;
}`,
        javascript: `function maxAreaOfIsland(grid) {
  const m = grid.length, n = grid[0].length;
  let best = 0;
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (!grid[r][c]) continue;
      grid[r][c] = 0;
      const q = [[r, c]];
      for (let h = 0; h < q.length; h++) {
        const [x, y] = q[h];
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])
          if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny]) {
            grid[nx][ny] = 0;
            q.push([nx, ny]);
          }
      }
      best = Math.max(best, q.length);   // 佇列裡放過幾格,就是這座島的面積
    }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    'DFS 沒有先把格子改成 0 就往四周走:兩格會互相呼叫,無窮遞迴',
    '沒有島時要回傳 0(Python 的 `max` 對空序列會報錯,要給 `default=0`)',
    '這題的格子是數字 0 / 1,和 200 題的字元 "0" / "1" 不同',
  ],
  followUp: [{ q: '最多把一格水變陸地,最大能多大?', a: '827. Making A Large Island:先把每座島編號並記面積,再試每一格水,把它四周不同島的面積加起來 + 1。' }],
  check: {
    kind: 'fn',
    fn: 'maxAreaOfIsland',
    cases: [
      { args: [G], out: 5 },
      { args: [[[0, 0, 0, 0, 0, 0, 0, 0]]], out: 0 },
      { args: [[[1]]], out: 1 },
      {
        args: [[[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]]],
        out: 6,
      },
    ],
  },
}
