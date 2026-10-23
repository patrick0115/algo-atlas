import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1020. Number of Enclaves

const G = [
  [0, 0, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
]

const cellsOf = (v: number): Cell[] => G.flatMap((row, r) => row.flatMap((x, c) => (x === v ? [[r, c] as Cell] : [])))

function view(label: string, extra: Record<string, Cell[]> = {}): GridViewData {
  return { kind: 'grid', label, cells: G.map((row) => row.map((v) => (v ? 1 : ''))), marks: { land: cellsOf(1), water: cellsOf(0), ...extra } }
}

function borderFig(): FigStep[] {
  return [
    { note: '「飛地」= 走不到網格邊界的陸地格。反過來想:先找出所有**走得到邊界**的陸地,剩下的就是飛地', views: [view('grid')] },
    { note: '從邊界上的每塊陸地出發做 BFS/DFS,把連得到的陸地都標記掉。這裡 (1,0) 在邊界上', views: [view('從邊界出發', { dim: [[1, 0]] })] },
    { note: '剩下沒被標記的陸地 (1,2)、(2,1)、(2,2) 走不出去 → 3 格', views: [view('飛地', { done: [[1, 2], [2, 1], [2, 2]], dim: [[1, 0]] }), arr([3], { label: '答案', done: [0] })] },
  ]
}

function islandFig(): FigStep[] {
  return [
    { note: '另一種:對每座島做 DFS,同時算面積、記錄有沒有碰到邊界', views: [view('grid')] },
    { note: '島 {(1,0)} 碰到邊界 → 不算;島 {(1,2),(2,1),(2,2)} 沒碰到 → 面積 3 加進答案', views: [view('逐島檢查', { done: [[1, 2], [2, 1], [2, 2]], dim: [[1, 0]] })] },
  ]
}

export const q1020: Solution = {
  id: 1020,
  plain: '一張方格地圖,1 是陸地、0 是海。每次可以往上下左右的陸地走一步,走出地圖邊界就算離開。有幾塊陸地格子怎麼走都離不開地圖?',
  statement: '給 `m × n` 的 0/1 矩陣 `grid`(0 = 海、1 = 陸地)。一次移動是走到四方向相鄰的陸地格,或從邊界走出網格。回傳**無法**經由任意次移動走出網格的陸地格數量。',
  examples: [
    { input: 'grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]', output: '3' },
    { input: 'grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]', output: '0', note: '所有陸地都連到邊界' },
  ],
  constraints: ['m, n ≤ 500'],
  insight: ['正難則反:從邊界往內淹,比從每格往外找容易', '和 [130](#/q/130)(被圍繞的區域)、[417](#/q/417) 同一套「從邊界出發」的[[p:graph-traversal]]', '淹完剩下的陸地格數就是答案'],
  approaches: [
    {
      name: '從邊界淹掉可逃的陸地',
      idea: '對所有邊界上的陸地做 BFS,把連到的陸地改成 0;最後數剩下的 1。',
      steps: ['把四條邊上的陸地格放進佇列並改成 0', 'BFS:鄰居是陸地就改成 0、入佇列', '回傳剩下 1 的個數'],
      figure: { title: 'grid(4 × 4)', steps: borderFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格最多進佇列一次。' },
      verdict: '最推薦,多源 BFS 一次處理所有邊界。',
      code: {
        python: `from collections import deque

def numEnclaves(grid):
    R, C = len(grid), len(grid[0])
    q = deque()
    for r in range(R):
        for c in range(C):
            if grid[r][c] and (r in (0, R - 1) or c in (0, C - 1)):
                grid[r][c] = 0                # 邊界上的陸地:可以逃
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc]:
                grid[nr][nc] = 0              # 連到可逃的陸地,也能逃
                q.append((nr, nc))
    return sum(map(sum, grid))`,
        c: `int numEnclaves(int **grid, int gridSize, int *gridColSize) {
    int R = gridSize, C = gridColSize[0], h = 0, t = 0, cnt = 0;
    int *qr = malloc(R * C * sizeof(int)), *qc = malloc(R * C * sizeof(int));
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] && (r == 0 || r == R - 1 || c == 0 || c == C - 1)) { grid[r][c] = 0; qr[t] = r; qc[t++] = c; }
    while (h < t) {
        int r = qr[h], c = qc[h++];
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nc >= 0 && nr < R && nc < C && grid[nr][nc]) { grid[nr][nc] = 0; qr[t] = nr; qc[t++] = nc; }
        }
    }
    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) cnt += grid[r][c];
    free(qr); free(qc);
    return cnt;
}`,
        cpp: `int numEnclaves(vector<vector<int>>& grid) {
    int R = grid.size(), C = grid[0].size(), cnt = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    queue<pair<int, int>> q;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] && (r == 0 || r == R - 1 || c == 0 || c == C - 1)) { grid[r][c] = 0; q.push({r, c}); }
    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nc >= 0 && nr < R && nc < C && grid[nr][nc]) { grid[nr][nc] = 0; q.push({nr, nc}); }
        }
    }
    for (auto &row : grid) for (int v : row) cnt += v;
    return cnt;
}`,
        java: `int numEnclaves(int[][] grid) {
    int R = grid.length, C = grid[0].length, cnt = 0;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    Deque<int[]> q = new ArrayDeque<>();
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 1 && (r == 0 || r == R - 1 || c == 0 || c == C - 1)) { grid[r][c] = 0; q.offer(new int[]{r, c}); }
    while (!q.isEmpty()) {
        int[] p = q.poll();
        for (int k = 0; k < 4; k++) {
            int nr = p[0] + dr[k], nc = p[1] + dc[k];
            if (nr >= 0 && nc >= 0 && nr < R && nc < C && grid[nr][nc] == 1) { grid[nr][nc] = 0; q.offer(new int[]{nr, nc}); }
        }
    }
    for (int[] row : grid) for (int v : row) cnt += v;
    return cnt;
}`,
        javascript: `function numEnclaves(grid) {
  const R = grid.length, C = grid[0].length, q = [];
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] && (r === 0 || r === R - 1 || c === 0 || c === C - 1)) {
        grid[r][c] = 0;
        q.push([r, c]);
      }
  for (let h = 0; h < q.length; h++) {
    const [r, c] = q[h];
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
      if (nr >= 0 && nc >= 0 && nr < R && nc < C && grid[nr][nc]) {
        grid[nr][nc] = 0;
        q.push([nr, nc]);
      }
  }
  return grid.reduce((s, row) => s + row.reduce((a, b) => a + b, 0), 0);
}`,
      },
    },
    {
      name: '逐島 DFS:面積 + 是否碰邊界',
      idea: '對每座島 DFS,累計面積並記錄是否碰到邊界;沒碰到就把面積加進答案。',
      steps: ['`for` 每個未拜訪的陸地:`area = 0`、`touch = False`', 'DFS(用堆疊):每格 `area += 1`;在邊界上 → `touch = True`', '`not touch` → `ans += area`'],
      figure: { title: 'grid(4 × 4)', steps: islandFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格拜訪一次。' },
      verdict: '一般「數島 + 算面積」的寫法稍微改一下;適合想不到反向思考時用。',
      code: {
        python: `def numEnclaves(grid):
    R, C = len(grid), len(grid[0])
    ans = 0
    for r in range(R):
        for c in range(C):
            if not grid[r][c]:
                continue
            area, touch, st = 0, False, [(r, c)]
            grid[r][c] = 0
            while st:
                x, y = st.pop()
                area += 1
                if x in (0, R - 1) or y in (0, C - 1):
                    touch = True              # 這座島碰得到邊界
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < R and 0 <= ny < C and grid[nx][ny]:
                        grid[nx][ny] = 0
                        st.append((nx, ny))
            if not touch:
                ans += area
    return ans`,
        c: `int numEnclaves(int **grid, int gridSize, int *gridColSize) {
    int R = gridSize, C = gridColSize[0], ans = 0;
    int *sr = malloc(R * C * sizeof(int)), *sc = malloc(R * C * sizeof(int));
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (!grid[r][c]) continue;
            int top = 0, area = 0;
            bool touch = false;
            grid[r][c] = 0; sr[top] = r; sc[top++] = c;
            while (top) {
                int x = sr[--top], y = sc[top];
                area++;
                if (x == 0 || x == R - 1 || y == 0 || y == C - 1) touch = true;
                for (int k = 0; k < 4; k++) {
                    int nx = x + dr[k], ny = y + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid[nx][ny]) { grid[nx][ny] = 0; sr[top] = nx; sc[top++] = ny; }
                }
            }
            if (!touch) ans += area;
        }
    free(sr); free(sc);
    return ans;
}`,
        cpp: `int numEnclaves(vector<vector<int>>& grid) {
    int R = grid.size(), C = grid[0].size(), ans = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (!grid[r][c]) continue;
            int area = 0;
            bool touch = false;
            vector<pair<int, int>> st{{r, c}};
            grid[r][c] = 0;
            while (!st.empty()) {
                auto [x, y] = st.back();
                st.pop_back();
                area++;
                if (x == 0 || x == R - 1 || y == 0 || y == C - 1) touch = true;
                for (int k = 0; k < 4; k++) {
                    int nx = x + dr[k], ny = y + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid[nx][ny]) { grid[nx][ny] = 0; st.push_back({nx, ny}); }
                }
            }
            if (!touch) ans += area;
        }
    return ans;
}`,
        java: `int numEnclaves(int[][] grid) {
    int R = grid.length, C = grid[0].length, ans = 0;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 0) continue;
            int area = 0;
            boolean touch = false;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[]{r, c});
            grid[r][c] = 0;
            while (!st.isEmpty()) {
                int[] p = st.pop();
                area++;
                if (p[0] == 0 || p[0] == R - 1 || p[1] == 0 || p[1] == C - 1) touch = true;
                for (int k = 0; k < 4; k++) {
                    int nx = p[0] + dr[k], ny = p[1] + dc[k];
                    if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid[nx][ny] == 1) { grid[nx][ny] = 0; st.push(new int[]{nx, ny}); }
                }
            }
            if (!touch) ans += area;
        }
    return ans;
}`,
        javascript: `function numEnclaves(grid) {
  const R = grid.length, C = grid[0].length;
  let ans = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (!grid[r][c]) continue;
      let area = 0, touch = false;
      const st = [[r, c]];
      grid[r][c] = 0;
      while (st.length) {
        const [x, y] = st.pop();
        area++;
        if (x === 0 || x === R - 1 || y === 0 || y === C - 1) touch = true;
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])
          if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid[nx][ny]) {
            grid[nx][ny] = 0;
            st.push([nx, ny]);
          }
      }
      if (!touch) ans += area;
    }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['逐島 DFS 時碰到邊界就提早 return:島的其他格沒被標記,之後會被當成另一座島', '只從四個角落出發:整條邊上的陸地都要當起點'],
  check: {
    kind: 'fn',
    fn: 'numEnclaves',
    cases: [
      { args: [G], out: 3 },
      { args: [[[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]], out: 0 },
      { args: [[[1]]], out: 0 },
      { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], out: 1 },
    ],
  },
}
