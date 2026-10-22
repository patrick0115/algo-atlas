import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 200. Number of Islands

const G = ['11000', '11010', '00100', '00011'].map((r) => r.split(''))
const R = G.length
const C = G[0].length
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

function view(island: number[][], hl: Cell[] = [], label = 'grid(1 = 陸地,格子裡的數字 = 屬於第幾座島)'): GridViewData {
  return {
    kind: 'grid',
    label,
    cells: G.map((row, r) => row.map((v, c) => (island[r][c] ? island[r][c] : v === '1' ? '1' : ''))),
    marks: {
      land: G.flatMap((row, r) => row.flatMap((v, c) => (v === '1' && !island[r][c] ? [[r, c] as Cell] : []))),
      done: island.flatMap((row, r) => row.flatMap((v, c) => (v ? [[r, c] as Cell] : []))),
      water: G.flatMap((row, r) => row.flatMap((v, c) => (v === '0' ? [[r, c] as Cell] : []))),
      hl,
    },
  }
}

function floodFig(bfs: boolean): FigStep[] {
  const island = G.map((r) => r.map(() => 0))
  let cnt = 0
  const out: FigStep[] = [{ note: '一格一格掃。遇到一塊**還沒被淹掉**的陸地 → 發現一座新島,島數 +1,然後把這座島相連的所有陸地都「淹掉」(標記成這座島),之後就不會重複數到', views: [view(island)] }]
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (G[r][c] !== '1' || island[r][c]) continue
      cnt++
      const order: Cell[] = []
      const todo: Cell[] = [[r, c]]
      island[r][c] = cnt
      while (todo.length) {
        const [x, y] = bfs ? todo.shift()! : todo.pop()!
        order.push([x, y])
        for (const [dx, dy] of DIRS) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < R && ny < C && G[nx][ny] === '1' && !island[nx][ny]) {
            island[nx][ny] = cnt
            todo.push([nx, ny])
          }
        }
      }
      out.push({ note: `(${r},${c}) 是新的陸地 → 第 ${cnt} 座島。用${bfs ? ' BFS(佇列,一圈一圈往外)' : ' DFS(一路走到底)'} 把相連的 ${order.length} 格都標成 ${cnt}`, views: [view(island, order)] })
    }
  out.push({ note: `掃完了,共 ${cnt} 座島`, views: [view(island)] })
  return out
}

function ufFig(): FigStep[] {
  const id = (r: number, c: number) => r * C + c
  const parent = Array.from({ length: R * C }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  let cnt = G.flat().filter((v) => v === '1').length
  const out: FigStep[] = [{ note: `並查集:一開始每塊陸地自己就是一座島(共 ${cnt} 座)。掃到相鄰的兩塊陸地就把它們合併,每成功合併一次,島數 −1`, views: [view(G.map((r) => r.map(() => 0)), [], 'grid'), arr([cnt], { label: '目前島數' })] }]
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (G[r][c] !== '1') continue
      for (const [dr, dc] of [[1, 0], [0, 1]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= R || nc >= C || G[nr][nc] !== '1') continue
        const a = find(id(r, c))
        const b = find(id(nr, nc))
        if (a !== b) {
          parent[a] = b
          cnt--
          out.push({ note: `(${r},${c}) 和 (${nr},${nc}) 相鄰而且還不在同一組 → 合併,島數 ${cnt}`, views: [view(G.map((row) => row.map(() => 0)), [[r, c], [nr, nc]], 'grid'), arr([cnt], { label: '目前島數' })] })
        }
      }
    }
  out.push({ note: `答案 ${cnt}`, views: [arr([cnt], { label: '島數', done: [0] })] })
  return out
}

export const q0200: Solution = {
  id: 200,
  plain: '地圖上 1 是陸地、0 是水。上下左右連在一起的陸地算同一座島,數一數總共有幾座島。訣竅:找到一塊陸地就把整座島「淹掉」(標記),之後就不會重複數。',
  statement: '給一個由 `"1"`(陸地)和 `"0"`(水)組成的網格,回傳**島嶼**的數量。島嶼由水平或垂直相鄰的陸地組成,網格外面都是水。',
  examples: [
    { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
    { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: '1' },
  ],
  constraints: ['`m, n ≤ 300` → 9 萬格,每格看常數次就好', '格子裡是**字元** `"1"`,不是數字 1'],
  insight: [
    '這是在網格上「數連通塊」。網格可以想成一張圖:每格是節點,上下左右相鄰的陸地之間有邊',
    '掃過每一格,遇到「還沒被處理過的陸地」就代表一座新島 → 用 DFS 或 BFS 把整座島走完、標記起來',
    '標記方式:直接把 "1" 改成 "0"(或另外開 visited)。每格最多被走一次,所以是 O(m·n)',
    '並查集也能做:每塊陸地一開始自成一座島,相鄰的就合併,成功合併一次島數 −1',
  ],
  approaches: [
    {
      name: 'DFS 淹沒整座島',
      idea: '雙層迴圈掃每一格;遇到 "1" 就島數 +1,並遞迴把它和所有相連的 "1" 改成 "0"。',
      steps: ['`count = 0`', '每一格 `(r, c)`:是 "1" → `count += 1`、`dfs(r, c)`', '`dfs`:超出邊界或不是 "1" → 返回;否則改成 "0",往四個方向 dfs', '回傳 count'],
      figure: { title: 'grid(4 × 5)', steps: floodFig(false) },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格最多被淹一次;最壞(整片陸地)遞迴深度是 m·n。' },
      verdict: '標準解,[[p:graph-traversal]]在網格上最常見的形式。695、463、1254 都是同一個骨架。',
      code: {
        python: `def numIslands(grid):
    m, n = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or c < 0 or r >= m or c >= n or grid[r][c] != '1':
            return
        grid[r][c] = '0'                  # 淹掉:之後不會再數到
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)

    count = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count`,
        c: `static char **G;
static int M, N;

static void dfs(int r, int c) {
    if (r < 0 || c < 0 || r >= M || c >= N || G[r][c] != '1') return;
    G[r][c] = '0';
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
}

int numIslands(char **grid, int gridSize, int *gridColSize) {
    G = grid; M = gridSize; N = gridColSize[0];
    int count = 0;
    for (int r = 0; r < M; r++)
        for (int c = 0; c < N; c++)
            if (grid[r][c] == '1') { count++; dfs(r, c); }
    return count;
}`,
        cpp: `int numIslands(vector<vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size(), count = 0;
    function<void(int, int)> dfs = [&](int r, int c) {
        if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (grid[r][c] == '1') { count++; dfs(r, c); }
    return count;
}`,
        java: `int numIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++)
            if (grid[r][c] == '1') { count++; dfs(grid, r, c); }
    return count;
}

private void dfs(char[][] g, int r, int c) {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
    g[r][c] = '0';
    dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);
}`,
        javascript: `function numIslands(grid) {
  const m = grid.length, n = grid[0].length;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
  return count;
}`,
      },
    },
    {
      name: 'BFS 淹沒整座島(用佇列)',
      idea: '同樣的想法,但用佇列一圈一圈往外淹。放進佇列的當下就標記,避免同一格被放進去兩次。',
      steps: ['遇到 "1":`count += 1`,改成 "0" 並放進佇列', '`while` 佇列不空:拿出一格,四個方向是 "1" 的就改成 "0" 並放進佇列'],
      figure: { title: 'grid(4 × 5)', steps: floodFig(true) },
      complexity: { time: 'O(m · n)', space: 'O(min(m, n))', why: '每格一次;佇列最多大約是島的「一圈」那麼寬。' },
      verdict: '不怕遞迴太深(整張圖都是陸地時,DFS 在 Python 可能超過遞迴上限)。',
      code: {
        python: `from collections import deque

def numIslands(grid):
    m, n = len(grid), len(grid[0])
    count = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] != '1':
                continue
            count += 1
            grid[r][c] = '0'              # 放進佇列時就標記
            q = deque([(r, c)])
            while q:
                x, y = q.popleft()
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == '1':
                        grid[nx][ny] = '0'
                        q.append((nx, ny))
    return count`,
        c: `int numIslands(char **grid, int gridSize, int *gridColSize) {
    int m = gridSize, n = gridColSize[0], count = 0;
    int *q = malloc(m * n * sizeof(int));
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1') continue;
            count++;
            grid[r][c] = '0';
            int head = 0, tail = 0;
            q[tail++] = r * n + c;
            while (head < tail) {
                int x = q[head] / n, y = q[head] % n;
                head++;
                for (int k = 0; k < 4; k++) {
                    int nx = x + dr[k], ny = y + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny] == '1') {
                        grid[nx][ny] = '0';
                        q[tail++] = nx * n + ny;
                    }
                }
            }
        }
    free(q);
    return count;
}`,
        cpp: `int numIslands(vector<vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size(), count = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1') continue;
            count++;
            grid[r][c] = '0';
            queue<pair<int, int>> q;
            q.push({r, c});
            while (!q.empty()) {
                auto [x, y] = q.front(); q.pop();
                for (int k = 0; k < 4; k++) {
                    int nx = x + dr[k], ny = y + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny] == '1') {
                        grid[nx][ny] = '0';
                        q.push({nx, ny});
                    }
                }
            }
        }
    return count;
}`,
        java: `int numIslands(char[][] grid) {
    int m = grid.length, n = grid[0].length, count = 0;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1') continue;
            count++;
            grid[r][c] = '0';
            Deque<int[]> q = new ArrayDeque<>();
            q.offer(new int[]{r, c});
            while (!q.isEmpty()) {
                int[] p = q.poll();
                for (int k = 0; k < 4; k++) {
                    int nx = p[0] + dr[k], ny = p[1] + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny] == '1') {
                        grid[nx][ny] = '0';
                        q.offer(new int[]{nx, ny});
                    }
                }
            }
        }
    return count;
}`,
        javascript: `function numIslands(grid) {
  const m = grid.length, n = grid[0].length;
  let count = 0;
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== '1') continue;
      count++;
      grid[r][c] = '0';
      const q = [[r, c]];
      for (let h = 0; h < q.length; h++) {
        const [x, y] = q[h];
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])
          if (nx >= 0 && ny >= 0 && nx < m && ny < n && grid[nx][ny] === '1') {
            grid[nx][ny] = '0';
            q.push([nx, ny]);
          }
      }
    }
  return count;
}`,
      },
    },
    {
      name: '並查集(Union-Find)',
      idea: '每塊陸地一開始是獨立的一組,`count` = 陸地數。掃每一格,和右邊、下面的陸地 union;union 成功(原本不同組)就 `count −= 1`。',
      steps: ['`parent[i] = i`,`count = 陸地格數`', '每塊陸地:右邊、下面也是陸地 → `union`', '`find` 用路徑壓縮;兩個根不同才合併並 `count −= 1`', '回傳 count'],
      figure: { title: 'grid(4 × 5)', steps: ufFig() },
      complexity: { time: 'O(m · n · α)', space: 'O(m · n)', why: 'α 是反阿克曼函數,實際上當成常數。parent 陣列 m·n 格。' },
      verdict: '這題用 DFS 比較直接,但並查集能處理「陸地一塊一塊加進來,每次問島數」的變形(305. Number of Islands II),是[[p:union-find]]的好入門。',
      code: {
        python: `def numIslands(grid):
    m, n = len(grid), len(grid[0])
    parent = list(range(m * n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # 路徑壓縮(隔代)
            x = parent[x]
        return x

    count = sum(row.count('1') for row in grid)
    for r in range(m):
        for c in range(n):
            if grid[r][c] != '1':
                continue
            for nr, nc in ((r + 1, c), (r, c + 1)):   # 只看右、下,避免重複
                if nr < m and nc < n and grid[nr][nc] == '1':
                    a, b = find(r * n + c), find(nr * n + nc)
                    if a != b:
                        parent[a] = b
                        count -= 1        # 兩座島合成一座
    return count`,
        c: `static int *P;
static int find(int x) {
    while (P[x] != x) { P[x] = P[P[x]]; x = P[x]; }
    return x;
}

int numIslands(char **grid, int gridSize, int *gridColSize) {
    int m = gridSize, n = gridColSize[0], count = 0;
    P = malloc(m * n * sizeof(int));
    for (int i = 0; i < m * n; i++) P[i] = i;
    for (int r = 0; r < m; r++) for (int c = 0; c < n; c++) if (grid[r][c] == '1') count++;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1') continue;
            if (r + 1 < m && grid[r + 1][c] == '1') {
                int a = find(r * n + c), b = find((r + 1) * n + c);
                if (a != b) { P[a] = b; count--; }
            }
            if (c + 1 < n && grid[r][c + 1] == '1') {
                int a = find(r * n + c), b = find(r * n + c + 1);
                if (a != b) { P[a] = b; count--; }
            }
        }
    free(P);
    return count;
}`,
        cpp: `int numIslands(vector<vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size(), count = 0;
    vector<int> parent(m * n);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); };
    for (auto& row : grid) for (char ch : row) if (ch == '1') count++;
    auto unite = [&](int a, int b) {
        a = find(a); b = find(b);
        if (a != b) { parent[a] = b; count--; }
    };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1') continue;
            if (r + 1 < m && grid[r + 1][c] == '1') unite(r * n + c, (r + 1) * n + c);
            if (c + 1 < n && grid[r][c + 1] == '1') unite(r * n + c, r * n + c + 1);
        }
    return count;
}`,
        java: `private int[] parent;

private int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}

int numIslands(char[][] grid) {
    int m = grid.length, n = grid[0].length, count = 0;
    parent = new int[m * n];
    for (int i = 0; i < m * n; i++) parent[i] = i;
    for (char[] row : grid) for (char ch : row) if (ch == '1') count++;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != '1') continue;
            int[][] nbs = {{r + 1, c}, {r, c + 1}};
            for (int[] nb : nbs) {
                if (nb[0] >= m || nb[1] >= n || grid[nb[0]][nb[1]] != '1') continue;
                int a = find(r * n + c), b = find(nb[0] * n + nb[1]);
                if (a != b) { parent[a] = b; count--; }
            }
        }
    return count;
}`,
        javascript: `function numIslands(grid) {
  const m = grid.length, n = grid[0].length;
  const parent = Array.from({ length: m * n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  let count = 0;
  for (const row of grid) for (const ch of row) if (ch === '1') count++;
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== '1') continue;
      for (const [nr, nc] of [[r + 1, c], [r, c + 1]]) {
        if (nr >= m || nc >= n || grid[nr][nc] !== '1') continue;
        const a = find(r * n + c), b = find(nr * n + nc);
        if (a !== b) {
          parent[a] = b;
          count--;
        }
      }
    }
  return count;
}`,
      },
    },
  ],
  pitfalls: [
    '格子是字元 `"1"`,寫成 `== 1`(數字)會永遠不成立',
    'BFS 在「拿出來時」才標記:同一格會被不同鄰居放進佇列很多次,浪費甚至超時,要在**放進去時**就標記',
    '斜對角不算相連,只有上下左右',
    '題目允許修改 grid;如果不行,就另外開 visited',
  ],
  followUp: [
    { q: '求最大的那座島有多大?', a: '[695. Max Area of Island](#/q/695):DFS 回傳這座島的格數,取最大。' },
    { q: '陸地一塊一塊加進來,每次都要回答島數?', a: '305. Number of Islands II:並查集,每加一格就和四周的陸地合併。' },
  ],
  check: {
    kind: 'fn',
    fn: 'numIslands',
    cases: [
      { args: [G], out: 4 },
      { args: [['111', '010', '111'].map((r) => r.split(''))], out: 1 },
      { args: [['11110', '11010', '11000', '00000'].map((r) => r.split(''))], out: 1 },
      { args: [[['0']]], out: 0 },
      { args: [[['1', '0', '1', '0', '1']]], out: 3 },
    ],
  },
}
