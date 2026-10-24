import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1905. Count Sub Islands

const G1 = [
  [1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1],
]
const G2 = [
  [1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1],
  [0, 1, 0, 0, 0],
  [1, 0, 1, 1, 0],
  [0, 1, 0, 1, 0],
]

const cellsOf = (g: number[][], v: number): Cell[] => g.flatMap((row, r) => row.flatMap((x, c) => (x === v ? [[r, c] as Cell] : [])))

function view(label: string, g: number[][], extra: Record<string, Cell[]> = {}): GridViewData {
  return { kind: 'grid', label, cells: g.map((row) => row.map((v) => (v ? 1 : ''))), marks: { land: cellsOf(g, 1), water: cellsOf(g, 0), ...extra } }
}

function dfsFig(): FigStep[] {
  const bad: Cell[] = cellsOf(G2, 1).filter(([r, c]) => !G1[r][c])
  return [
    { note: 'grid2 的某座島是「子島」⇔ 它的**每一格**在 grid1 也是陸地', views: [view('grid1', G1), view('grid2', G2)] },
    { note: '對 grid2 每座島做 DFS,走遍整座島;途中只要有一格在 grid1 是水,這座島就不合格。注意:就算發現不合格也要走完,把整座島標記掉', views: [view('grid2(框起來 = grid1 在這裡是水)', G2, { hl: bad })] },
    { note: 'grid2 共 5 座島:最上面那座、(3,0)、(4,1) 合格;(2,1) 那座和 (3,2)-(3,3)-(4,3) 那座都有格子在 grid1 是水((2,1);(3,2)、(3,3))→ 不合格。答案 3', views: [arr([3], { label: '答案', done: [0] })] },
  ]
}

function sinkFig(): FigStep[] {
  return [
    { note: '兩階段:① 先找出 grid2 是陸地、grid1 是水的格子,從這些格子開始把整座島「淹掉」(改成 0)', views: [view('grid2', G2, { hl: cellsOf(G2, 1).filter(([r, c]) => !G1[r][c]) })] },
    { note: '② 剩下的 grid2 每座島都一定是子島 → 一般的數島嶼([200](#/q/200))', views: [arr([3], { label: '答案', done: [0] })] },
  ]
}

export const q1905: Solution = {
  id: 1905,
  plain: '有兩張一樣大的地圖(1 是陸地、0 是水)。如果第二張地圖上的某座島,每一格在第一張地圖上也都是陸地,它就叫「子島」。數第二張地圖有幾座子島。',
  statement: '給兩個 `m × n` 的 0/1 矩陣 `grid1`、`grid2`。島嶼是四方向相連的 1。若 grid2 中某座島的**所有格子**在 grid1 中都是陸地,則稱為子島。回傳 grid2 中子島的數量。',
  examples: [
    { input: 'grid1 = [[1,1,1,0,0],[0,1,1,1,1],[0,0,0,0,0],[1,0,0,0,0],[1,1,0,1,1]]\ngrid2 = [[1,1,1,0,0],[0,0,1,1,1],[0,1,0,0,0],[1,0,1,1,0],[0,1,0,1,0]]', output: '3' },
    { input: 'grid1 = [[1,0,1,0,1],[1,1,1,1,1],[0,0,0,0,0],[1,1,1,1,1],[1,0,1,0,1]]\ngrid2 = [[0,0,0,0,0],[1,1,1,1,1],[0,1,0,1,0],[0,1,0,1,0],[1,0,0,0,1]]', output: '2' },
  ],
  constraints: ['m, n ≤ 500'],
  insight: ['在 grid2 上做[[p:graph-traversal]]找島', '途中檢查 grid1 對應格是不是陸地', '發現不合格也要把整座島走完,不然剩下的格子會被當成另一座島'],
  approaches: [
    {
      name: 'DFS 走島 + 同時檢查',
      idea: '對 grid2 每個未拜訪的陸地做 DFS,回傳「這座島是否全部落在 grid1 的陸地上」;是就計數。',
      steps: ['`dfs(r, c)`:出界或水 → True', '把格子改成 0(標記拜訪)', '`ok = grid1[r][c] == 1`', '四個方向都要遞迴(不能短路):`ok &= dfs(...)`', '回傳 ok'],
      figure: { title: 'grid1 / grid2(5 × 5)', steps: dfsFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格最多拜訪一次;遞迴深度最壞 m · n。' },
      verdict: '最推薦;記得四個方向都要走完再合併結果,用 `and` 短路會漏標記。',
      code: {
        python: `import sys

def countSubIslands(grid1, grid2):
    sys.setrecursionlimit(1 << 20)
    R, C = len(grid2), len(grid2[0])

    def dfs(r, c):
        if not (0 <= r < R and 0 <= c < C) or not grid2[r][c]:
            return True
        grid2[r][c] = 0                       # 標記拜訪過
        ok = grid1[r][c] == 1
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            ok = dfs(nr, nc) and ok           # 先遞迴再合併:整座島都要走完
        return ok

    return sum(dfs(r, c) for r in range(R) for c in range(C) if grid2[r][c])`,
        c: `static int **g1, **g2, R, C;

static bool dfs(int r, int c) {
    if (r < 0 || c < 0 || r >= R || c >= C || !g2[r][c]) return true;
    g2[r][c] = 0;
    bool ok = g1[r][c] == 1;
    ok = dfs(r + 1, c) && ok;
    ok = dfs(r - 1, c) && ok;
    ok = dfs(r, c + 1) && ok;
    ok = dfs(r, c - 1) && ok;
    return ok;
}

int countSubIslands(int **grid1, int grid1Size, int *grid1ColSize, int **grid2, int grid2Size, int *grid2ColSize) {
    g1 = grid1; g2 = grid2; R = grid2Size; C = grid2ColSize[0];
    int cnt = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (g2[r][c] && dfs(r, c)) cnt++;
    return cnt;
}`,
        cpp: `int countSubIslands(vector<vector<int>>& grid1, vector<vector<int>>& grid2) {
    int R = grid2.size(), C = grid2[0].size(), cnt = 0;
    function<bool(int, int)> dfs = [&](int r, int c) {
        if (r < 0 || c < 0 || r >= R || c >= C || !grid2[r][c]) return true;
        grid2[r][c] = 0;
        bool ok = grid1[r][c] == 1;
        ok = dfs(r + 1, c) && ok;
        ok = dfs(r - 1, c) && ok;
        ok = dfs(r, c + 1) && ok;
        ok = dfs(r, c - 1) && ok;
        return ok;
    };
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid2[r][c] && dfs(r, c)) cnt++;
    return cnt;
}`,
        java: `int countSubIslands(int[][] grid1, int[][] grid2) {
    int cnt = 0;
    for (int r = 0; r < grid2.length; r++)
        for (int c = 0; c < grid2[0].length; c++)
            if (grid2[r][c] == 1 && dfs(grid1, grid2, r, c)) cnt++;
    return cnt;
}

boolean dfs(int[][] g1, int[][] g2, int r, int c) {
    if (r < 0 || c < 0 || r >= g2.length || c >= g2[0].length || g2[r][c] == 0) return true;
    g2[r][c] = 0;
    boolean ok = g1[r][c] == 1;
    ok = dfs(g1, g2, r + 1, c) && ok;
    ok = dfs(g1, g2, r - 1, c) && ok;
    ok = dfs(g1, g2, r, c + 1) && ok;
    ok = dfs(g1, g2, r, c - 1) && ok;
    return ok;
}`,
        javascript: `function countSubIslands(grid1, grid2) {
  const R = grid2.length, C = grid2[0].length;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= R || c >= C || !grid2[r][c]) return true;
    grid2[r][c] = 0;
    let ok = grid1[r][c] === 1;
    ok = dfs(r + 1, c) && ok;
    ok = dfs(r - 1, c) && ok;
    ok = dfs(r, c + 1) && ok;
    ok = dfs(r, c - 1) && ok;
    return ok;
  };
  let cnt = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid2[r][c] && dfs(r, c)) cnt++;
  return cnt;
}`,
      },
    },
    {
      name: '先淹掉不合格的島,再數島(BFS)',
      idea: '① 從所有「grid2 = 1 且 grid1 = 0」的格子 BFS 把整座島改成 0;② 對剩下的 grid2 數島嶼。',
      steps: ['`sink(r, c)`:BFS 把連通的 1 都改成 0', '① `grid2[r][c] and not grid1[r][c]` → sink', '② 剩下每個 1:`cnt += 1`、sink'],
      figure: { title: 'grid1 / grid2(5 × 5)', steps: sinkFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格最多進佇列一次。' },
      verdict: '把「判斷」和「計數」拆開,每一步都是最基本的淹島操作;BFS 也避開遞迴深度問題。',
      code: {
        python: `from collections import deque

def countSubIslands(grid1, grid2):
    R, C = len(grid2), len(grid2[0])

    def sink(r, c):
        q = deque([(r, c)])
        grid2[r][c] = 0
        while q:
            x, y = q.popleft()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < R and 0 <= ny < C and grid2[nx][ny]:
                    grid2[nx][ny] = 0
                    q.append((nx, ny))

    for r in range(R):
        for c in range(C):
            if grid2[r][c] and not grid1[r][c]:
                sink(r, c)                    # 這座島不合格,整座淹掉
    cnt = 0
    for r in range(R):
        for c in range(C):
            if grid2[r][c]:
                cnt += 1
                sink(r, c)
    return cnt`,
        c: `static int *qr, *qc;

static void sink(int **g, int R, int C, int r, int c) {
    int h = 0, t = 0, dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    g[r][c] = 0; qr[t] = r; qc[t++] = c;
    while (h < t) {
        int x = qr[h], y = qc[h++];
        for (int k = 0; k < 4; k++) {
            int nx = x + dr[k], ny = y + dc[k];
            if (nx >= 0 && ny >= 0 && nx < R && ny < C && g[nx][ny]) { g[nx][ny] = 0; qr[t] = nx; qc[t++] = ny; }
        }
    }
}

int countSubIslands(int **grid1, int grid1Size, int *grid1ColSize, int **grid2, int grid2Size, int *grid2ColSize) {
    int R = grid2Size, C = grid2ColSize[0], cnt = 0;
    qr = malloc(R * C * sizeof(int)); qc = malloc(R * C * sizeof(int));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid2[r][c] && !grid1[r][c]) sink(grid2, R, C, r, c);
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid2[r][c]) { cnt++; sink(grid2, R, C, r, c); }
    free(qr); free(qc);
    return cnt;
}`,
        cpp: `int countSubIslands(vector<vector<int>>& grid1, vector<vector<int>>& grid2) {
    int R = grid2.size(), C = grid2[0].size(), cnt = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    auto sink = [&](int r, int c) {
        queue<pair<int, int>> q;
        q.push({r, c});
        grid2[r][c] = 0;
        while (!q.empty()) {
            auto [x, y] = q.front();
            q.pop();
            for (int k = 0; k < 4; k++) {
                int nx = x + dr[k], ny = y + dc[k];
                if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid2[nx][ny]) { grid2[nx][ny] = 0; q.push({nx, ny}); }
            }
        }
    };
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid2[r][c] && !grid1[r][c]) sink(r, c);
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid2[r][c]) { cnt++; sink(r, c); }
    return cnt;
}`,
        java: `int countSubIslands(int[][] grid1, int[][] grid2) {
    int R = grid2.length, C = grid2[0].length, cnt = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid2[r][c] == 1 && grid1[r][c] == 0) sink(grid2, r, c);
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (grid2[r][c] == 1) { cnt++; sink(grid2, r, c); }
    return cnt;
}

void sink(int[][] g, int r, int c) {
    int R = g.length, C = g[0].length;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    Deque<int[]> q = new ArrayDeque<>();
    q.offer(new int[]{r, c});
    g[r][c] = 0;
    while (!q.isEmpty()) {
        int[] p = q.poll();
        for (int k = 0; k < 4; k++) {
            int nx = p[0] + dr[k], ny = p[1] + dc[k];
            if (nx >= 0 && ny >= 0 && nx < R && ny < C && g[nx][ny] == 1) { g[nx][ny] = 0; q.offer(new int[]{nx, ny}); }
        }
    }
}`,
        javascript: `function countSubIslands(grid1, grid2) {
  const R = grid2.length, C = grid2[0].length;
  const sink = (r, c) => {
    const q = [[r, c]];
    grid2[r][c] = 0;
    for (let h = 0; h < q.length; h++) {
      const [x, y] = q[h];
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])
        if (nx >= 0 && ny >= 0 && nx < R && ny < C && grid2[nx][ny]) {
          grid2[nx][ny] = 0;
          q.push([nx, ny]);
        }
    }
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid2[r][c] && !grid1[r][c]) sink(r, c);
  let cnt = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid2[r][c]) {
        cnt++;
        sink(r, c);
      }
  return cnt;
}`,
      },
    },
  ],
  pitfalls: ['`ok = ok and dfs(...)`:ok 變 False 後就不再遞迴,島的其他格沒被標記,之後會被重複計數', '只檢查島的起點在 grid1 是不是陸地'],
  check: {
    kind: 'fn',
    fn: 'countSubIslands',
    cases: [
      { args: [G1, G2], out: 3 },
      { args: [[[1, 0, 1, 0, 1], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [1, 0, 1, 0, 1]], [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1]]], out: 2 },
      { args: [[[1]], [[1]]], out: 1 },
      { args: [[[0]], [[1]]], out: 0 },
    ],
  },
}
