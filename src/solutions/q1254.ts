import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1254. Number of Closed Islands

const G = [
  [1, 1, 1, 1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0],
]

const cellsOf = (v: number): Cell[] => G.flatMap((row, r) => row.flatMap((x, c) => (x === v ? [[r, c] as Cell] : [])))
const border = cellsOf(0).filter(([r, c]) => r === 0 || c === 0 || r === G.length - 1 || c === G[0].length - 1)

function view(label: string, extra: Record<string, Cell[]> = {}): GridViewData {
  return { kind: 'grid', label, cells: G.map((row) => row.map((v) => (v ? '' : 0))), marks: { land: cellsOf(0), water: cellsOf(1), ...extra } }
}

function dfsFig(): FigStep[] {
  const closed1: Cell[] = [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 3], [3, 1], [3, 2], [3, 3], [3, 4]]
  return [
    { note: '注意這題 **0 是陸地、1 是水**。「封閉島」= 四周完全被水包圍的島,也就是碰不到網格邊界的島', views: [view('grid(0 = 陸地)')] },
    { note: '對每座島 DFS,回傳「有沒有碰到邊界」。四個方向都要走完(不能短路),整座島才會被標記', views: [view('碰到邊界的陸地', { dim: border })] },
    { note: '中間那座島完全被水包圍 → 封閉;右邊那幾格碰到邊界 → 不算。另外 (3,6) 單獨一格也被水包圍 → 封閉。答案 2', views: [view('封閉島', { done: [...closed1, [3, 6]], dim: border }), arr([2], { label: '答案', done: [0] })] },
  ]
}

function floodFig(): FigStep[] {
  return [
    { note: '兩階段:① 從邊界上的陸地出發,把連到的陸地全部填成水(這些島不可能封閉)', views: [view('先填掉邊界的島', { dim: border })] },
    { note: '② 剩下的每座島都碰不到邊界 → 直接數島嶼數([200](#/q/200))', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}

export const q1254: Solution = {
  id: 1254,
  plain: '一張方格地圖,這題 0 是陸地、1 是水。如果一座島的上下左右邊緣全部被水包圍(也就是碰不到地圖邊界),就叫「封閉島」。數有幾座封閉島。',
  statement: '給二維網格,`0` 為陸地、`1` 為水。島是四方向相連的 0;**封閉島**是完全被 1 包圍(上下左右)的島。回傳封閉島的數量。',
  examples: [
    { input: 'grid = [[1,1,1,1,1,1,1,0],[1,0,0,0,0,1,1,0],[1,0,1,0,1,1,1,0],[1,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,0]]', output: '2' },
    { input: 'grid = [[0,0,1,0,0],[0,1,0,1,0],[0,1,1,1,0]]', output: '1' },
  ],
  constraints: ['rows, cols ≤ 100'],
  insight: ['封閉 ⇔ 島上沒有任何一格在網格邊界', '和 [1020](#/q/1020) 幾乎一樣,只是數「島數」而不是「格數」,而且 0/1 意義相反', '先淹掉邊界的島,剩下的都是封閉島'],
  approaches: [
    {
      name: 'DFS 回傳是否封閉',
      idea: '`dfs(r, c)`:出界 → False;水或已拜訪 → True;標記後四個方向都遞迴,全部 True 才 True。',
      steps: ['`dfs(r, c)`:出界 → False', '`grid[r][c] == 1` → True', '`grid[r][c] = 1`(標記),`ok = True`', '四個方向:`ok = dfs(...) and ok`', '對每個 0 呼叫,回傳 True 就計數'],
      figure: { title: 'grid(5 × 8)', steps: dfsFig() },
      complexity: { time: 'O(R · C)', space: 'O(R · C)', why: '每格拜訪一次;遞迴深度最壞 R · C。' },
      verdict: '最推薦,一次 DFS 同時標記和判斷;記得不能短路。',
      code: {
        python: `import sys

def closedIsland(grid):
    sys.setrecursionlimit(1 << 20)
    R, C = len(grid), len(grid[0])

    def dfs(r, c):
        if not (0 <= r < R and 0 <= c < C):
            return False                      # 走出邊界 → 不封閉
        if grid[r][c] == 1:
            return True
        grid[r][c] = 1                        # 標記拜訪過
        ok = True
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            ok = dfs(nr, nc) and ok           # 先遞迴,整座島都要走完
        return ok

    return sum(dfs(r, c) for r in range(R) for c in range(C) if grid[r][c] == 0)`,
        c: `static int **G, R, C;

static bool dfs(int r, int c) {
    if (r < 0 || c < 0 || r >= R || c >= C) return false;
    if (G[r][c] == 1) return true;
    G[r][c] = 1;
    bool ok = true;
    ok = dfs(r + 1, c) && ok;
    ok = dfs(r - 1, c) && ok;
    ok = dfs(r, c + 1) && ok;
    ok = dfs(r, c - 1) && ok;
    return ok;
}

int closedIsland(int **grid, int gridSize, int *gridColSize) {
    G = grid; R = gridSize; C = gridColSize[0];
    int cnt = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (G[r][c] == 0 && dfs(r, c)) cnt++;
    return cnt;
}`,
        cpp: `int closedIsland(vector<vector<int>>& grid) {
    int R = grid.size(), C = grid[0].size(), cnt = 0;
    function<bool(int, int)> dfs = [&](int r, int c) {
        if (r < 0 || c < 0 || r >= R || c >= C) return false;
        if (grid[r][c] == 1) return true;
        grid[r][c] = 1;
        bool ok = true;
        ok = dfs(r + 1, c) && ok;
        ok = dfs(r - 1, c) && ok;
        ok = dfs(r, c + 1) && ok;
        ok = dfs(r, c - 1) && ok;
        return ok;
    };
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 0 && dfs(r, c)) cnt++;
    return cnt;
}`,
        java: `int closedIsland(int[][] grid) {
    int cnt = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++)
            if (grid[r][c] == 0 && dfs(grid, r, c)) cnt++;
    return cnt;
}

boolean dfs(int[][] g, int r, int c) {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length) return false;
    if (g[r][c] == 1) return true;
    g[r][c] = 1;
    boolean ok = true;
    ok = dfs(g, r + 1, c) && ok;
    ok = dfs(g, r - 1, c) && ok;
    ok = dfs(g, r, c + 1) && ok;
    ok = dfs(g, r, c - 1) && ok;
    return ok;
}`,
        javascript: `function closedIsland(grid) {
  const R = grid.length, C = grid[0].length;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= R || c >= C) return false;
    if (grid[r][c] === 1) return true;
    grid[r][c] = 1;
    let ok = true;
    ok = dfs(r + 1, c) && ok;
    ok = dfs(r - 1, c) && ok;
    ok = dfs(r, c + 1) && ok;
    ok = dfs(r, c - 1) && ok;
    return ok;
  };
  let cnt = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === 0 && dfs(r, c)) cnt++;
  return cnt;
}`,
      },
    },
    {
      name: '先淹邊界,再數島',
      idea: '① 從四條邊上的 0 開始把連通的 0 填成 1;② 數剩下的島數。',
      steps: ['`fill(r, c)`:把連通的 0 都改成 1(用堆疊)', '① 邊界上的 0 → fill', '② 剩下的每個 0:`cnt += 1`、fill'],
      figure: { title: 'grid(5 × 8)', steps: floodFig() },
      complexity: { time: 'O(R · C)', space: 'O(R · C)', why: '每格最多填一次。' },
      verdict: '把問題拆成兩個最基本的淹島操作,不必想 DFS 的回傳值怎麼合併。',
      code: {
        python: `def closedIsland(grid):
    R, C = len(grid), len(grid[0])

    def fill(r, c):
        st = [(r, c)]
        grid[r][c] = 1
        while st:
            x, y = st.pop()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < R and 0 <= ny < C and grid[nx][ny] == 0:
                    grid[nx][ny] = 1
                    st.append((nx, ny))

    for r in range(R):
        for c in range(C):
            if grid[r][c] == 0 and (r in (0, R - 1) or c in (0, C - 1)):
                fill(r, c)                    # 碰得到邊界的島先填掉
    cnt = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 0:
                cnt += 1
                fill(r, c)
    return cnt`,
        c: `static int *sr, *sc;

static void fill(int **g, int R, int C, int r, int c) {
    int top = 0, dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    g[r][c] = 1; sr[top] = r; sc[top++] = c;
    while (top) {
        int x = sr[--top], y = sc[top];
        for (int k = 0; k < 4; k++) {
            int nx = x + dr[k], ny = y + dc[k];
            if (nx >= 0 && ny >= 0 && nx < R && ny < C && g[nx][ny] == 0) { g[nx][ny] = 1; sr[top] = nx; sc[top++] = ny; }
        }
    }
}

int closedIsland(int **grid, int gridSize, int *gridColSize) {
    int R = gridSize, C = gridColSize[0], cnt = 0;
    sr = malloc(R * C * sizeof(int)); sc = malloc(R * C * sizeof(int));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 0 && (r == 0 || r == R - 1 || c == 0 || c == C - 1)) fill(grid, R, C, r, c);
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 0) { cnt++; fill(grid, R, C, r, c); }
    free(sr); free(sc);
    return cnt;
}`,
        cpp: `int closedIsland(vector<vector<int>>& grid) {
    int R = grid.size(), C = grid[0].size(), cnt = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    auto fill = [&](int r, int c) {
        vector<pair<int, int>> st{{r, c}};
        grid[r][c] = 1;
        while (!st.empty()) {
            auto [x, y] = st.back();
            st.pop_back();
            for (int k = 0; k < 4; k++) {
                int nx = x + dr[k], ny = y + dc[k];
                if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid[nx][ny] == 0) { grid[nx][ny] = 1; st.push_back({nx, ny}); }
            }
        }
    };
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 0 && (r == 0 || r == R - 1 || c == 0 || c == C - 1)) fill(r, c);
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 0) { cnt++; fill(r, c); }
    return cnt;
}`,
        java: `int closedIsland(int[][] grid) {
    int R = grid.length, C = grid[0].length, cnt = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 0 && (r == 0 || r == R - 1 || c == 0 || c == C - 1)) fill(grid, r, c);
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid[r][c] == 0) { cnt++; fill(grid, r, c); }
    return cnt;
}

void fill(int[][] g, int r, int c) {
    int R = g.length, C = g[0].length;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    Deque<int[]> st = new ArrayDeque<>();
    st.push(new int[]{r, c});
    g[r][c] = 1;
    while (!st.isEmpty()) {
        int[] p = st.pop();
        for (int k = 0; k < 4; k++) {
            int nx = p[0] + dr[k], ny = p[1] + dc[k];
            if (nx >= 0 && ny >= 0 && nx < R && ny < C && g[nx][ny] == 0) { g[nx][ny] = 1; st.push(new int[]{nx, ny}); }
        }
    }
}`,
        javascript: `function closedIsland(grid) {
  const R = grid.length, C = grid[0].length;
  const fill = (r, c) => {
    const st = [[r, c]];
    grid[r][c] = 1;
    while (st.length) {
      const [x, y] = st.pop();
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])
        if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid[nx][ny] === 0) {
          grid[nx][ny] = 1;
          st.push([nx, ny]);
        }
    }
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === 0 && (r === 0 || r === R - 1 || c === 0 || c === C - 1)) fill(r, c);
  let cnt = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === 0) {
        cnt++;
        fill(r, c);
      }
  return cnt;
}`,
      },
    },
  ],
  pitfalls: ['把 0、1 的意義搞反:這題 0 才是陸地', 'DFS 用 `ok and dfs(...)` 短路:島沒走完,剩下的格子會被當成新的島'],
  check: {
    kind: 'fn',
    fn: 'closedIsland',
    cases: [
      { args: [G], out: 2 },
      { args: [[[0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [0, 1, 1, 1, 0]]], out: 1 },
      { args: [[[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1], [1, 0, 1, 0, 1, 0, 1], [1, 0, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1]]], out: 2 },
      { args: [[[0]]], out: 0 },
    ],
  },
}
