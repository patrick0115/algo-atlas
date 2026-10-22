import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 417. Pacific Atlantic Water Flow

const H = [
  [1, 2, 2, 3, 5],
  [3, 2, 3, 4, 4],
  [2, 4, 5, 3, 1],
  [6, 7, 1, 4, 5],
  [5, 1, 1, 2, 4],
]
const M = H.length
const N = H[0].length

function view(pac: boolean[][], atl: boolean[][], hl: Cell[] = [], label = '高度(左上邊界 = 太平洋,右下邊界 = 大西洋)'): GridViewData {
  const both: Cell[] = []
  const p: Cell[] = []
  const a: Cell[] = []
  for (let r = 0; r < M; r++)
    for (let c = 0; c < N; c++) {
      if (pac[r][c] && atl[r][c]) both.push([r, c])
      else if (pac[r][c]) p.push([r, c])
      else if (atl[r][c]) a.push([r, c])
    }
  return { kind: 'grid', label, cells: H.map((r) => [...r]), marks: { path: p, dep: a, done: both, hl } }
}

function reverseFig(): FigStep[] {
  const none = () => H.map((r) => r.map(() => false))
  const pac = none()
  const atl = none()
  const out: FigStep[] = [{ note: '反過來想:不是「從每格往外流」,而是「從海往內爬」。水往低處流 → 反過來就是從海邊往**一樣高或更高**的格子走。灰底 = 太平洋爬得到、虛線框 = 大西洋爬得到、綠色 = 兩邊都到得了', views: [view(pac, atl)] }]
  const bfs = (seen: boolean[][], starts: Cell[], name: string) => {
    const q: Cell[] = []
    for (const [r, c] of starts) if (!seen[r][c]) (seen[r][c] = true), q.push([r, c])
    out.push({ note: `${name}:先把緊貼${name}的邊界格子放進佇列`, views: [view(pac, atl, starts)] })
    for (let h = 0; h < q.length; h++) {
      const [r, c] = q[h]
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= M || nc >= N || seen[nr][nc] || H[nr][nc] < H[r][c]) continue
        seen[nr][nc] = true
        q.push([nr, nc])
      }
    }
    out.push({ note: `${name}:從邊界往高處爬,共爬到 ${q.length} 格`, views: [view(pac, atl)] })
  }
  bfs(pac, [...Array.from({ length: N }, (_, c) => [0, c] as Cell), ...Array.from({ length: M }, (_, r) => [r, 0] as Cell)], '太平洋')
  bfs(atl, [...Array.from({ length: N }, (_, c) => [M - 1, c] as Cell), ...Array.from({ length: M }, (_, r) => [r, N - 1] as Cell)], '大西洋')
  out.push({ note: '兩邊都爬得到的格子(綠色)就是答案:從那裡下雨,水能流到兩個大洋', views: [view(pac, atl)] })
  return out
}

function bruteFig(): FigStep[] {
  const none = () => H.map((r) => r.map(() => false))
  const r0 = 2
  const c0 = 2
  const seen = none()
  const q: Cell[] = [[r0, c0]]
  seen[r0][c0] = true
  let toP = false
  let toA = false
  for (let h = 0; h < q.length; h++) {
    const [r, c] = q[h]
    if (r === 0 || c === 0) toP = true
    if (r === M - 1 || c === N - 1) toA = true
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= M || nc >= N || seen[nr][nc] || H[nr][nc] > H[r][c]) continue
      seen[nr][nc] = true
      q.push([nr, nc])
    }
  }
  return [
    { note: '最直接:對每一格都模擬一次「水往低處(或一樣高)流」,看能不能碰到兩個大洋的邊界', views: [view(none(), none(), [[r0, c0]])] },
    { note: `例如從 (${r0},${c0}) 高度 ${H[r0][c0]} 出發,水能流到灰底這些格子 → ${toP ? '碰得到太平洋' : '碰不到太平洋'}、${toA ? '碰得到大西洋' : '碰不到大西洋'}。每格都要這樣做一次,很多格子被重複走`, views: [view(seen, none(), [[r0, c0]])] },
  ]
}

export const q0417: Solution = {
  id: 417,
  plain: '一座島的每一格有不同高度,左邊和上邊是太平洋,右邊和下邊是大西洋。雨水只會往**一樣高或更低**的相鄰格子流。找出哪些格子下雨後,水能同時流到兩個大洋。',
  statement:
    '`heights` 是 m×n 的高度網格。太平洋接觸上邊界和左邊界,大西洋接觸下邊界和右邊界。水可以從一格流到高度**不高於**它的相鄰格(上下左右),邊界格可以直接流進相鄰的大洋。回傳所有能同時流到兩個大洋的格子座標。',
  examples: [{ input: 'heights = 5×5 的範例', output: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]' }],
  constraints: ['`m, n ≤ 200` → 每格各做一次 BFS 是 (m·n)² = 16 億,太慢'],
  insight: [
    '正著做:每一格都模擬水往外流,看碰不碰得到兩個大洋 → 每格一次 BFS,O((m·n)²)',
    '反過來:能流到太平洋的格子 = 從太平洋邊界「往上爬」(走到**一樣高或更高**的格子)爬得到的格子',
    '所以只要做兩次 BFS / DFS:一次從太平洋的邊界往內爬、一次從大西洋的邊界往內爬。兩次都到得了的格子就是答案 → O(m·n)',
    '「從終點反過來找」在很多題都好用:130(從邊界找不會被包圍的)、994(多個起點同時出發)',
  ],
  approaches: [
    {
      name: '每格模擬水往外流',
      idea: '對每一格做一次 BFS,只往「不比目前高」的鄰居走;途中碰到上 / 左邊界 → 能到太平洋,碰到下 / 右邊界 → 能到大西洋。',
      steps: ['對每一格 `(r, c)`:BFS', '只走到 `heights[nr][nc] <= heights[x][y]` 的鄰居', '記錄有沒有碰到兩個大洋的邊界', '兩個都碰到 → 放進答案'],
      figure: { title: 'heights(5 × 5)', steps: bruteFig() },
      complexity: { time: 'O((m · n)²)', space: 'O(m · n)', why: '每格一次 BFS,每次 BFS 最多走遍整張圖。' },
      verdict: '直覺但太慢。用來對照「反過來做」為什麼快。',
      code: {
        python: `from collections import deque

def pacificAtlantic(heights):
    m, n = len(heights), len(heights[0])
    res = []
    for r0 in range(m):
        for c0 in range(n):
            seen = {(r0, c0)}
            q = deque([(r0, c0)])
            pac = atl = False
            while q:
                r, c = q.popleft()
                pac |= r == 0 or c == 0
                atl |= r == m - 1 or c == n - 1
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < m and 0 <= nc < n and (nr, nc) not in seen and heights[nr][nc] <= heights[r][c]:
                        seen.add((nr, nc))
                        q.append((nr, nc))
            if pac and atl:
                res.append([r0, c0])
    return res`,
        c: `int **pacificAtlantic(int **heights, int heightsSize, int *heightsColSize, int *returnSize, int **returnColumnSizes) {
    int m = heightsSize, n = heightsColSize[0];
    int **res = malloc(m * n * sizeof(int *)), cnt = 0;
    int *q = malloc(m * n * sizeof(int));
    bool *seen = malloc(m * n);
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r0 = 0; r0 < m; r0++)
        for (int c0 = 0; c0 < n; c0++) {
            memset(seen, 0, m * n);
            int head = 0, tail = 0;
            bool pac = false, atl = false;
            q[tail++] = r0 * n + c0;
            seen[r0 * n + c0] = true;
            while (head < tail) {
                int r = q[head] / n, c = q[head] % n;
                head++;
                if (r == 0 || c == 0) pac = true;
                if (r == m - 1 || c == n - 1) atl = true;
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr * n + nc] || heights[nr][nc] > heights[r][c]) continue;
                    seen[nr * n + nc] = true;
                    q[tail++] = nr * n + nc;
                }
            }
            if (pac && atl) { res[cnt] = malloc(2 * sizeof(int)); res[cnt][0] = r0; res[cnt][1] = c0; cnt++; }
        }
    free(q); free(seen);
    *returnSize = cnt;
    *returnColumnSizes = malloc((cnt ? cnt : 1) * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = 2;
    return res;
}`,
        cpp: `vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
    int m = heights.size(), n = heights[0].size();
    vector<vector<int>> res;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r0 = 0; r0 < m; r0++)
        for (int c0 = 0; c0 < n; c0++) {
            vector<vector<bool>> seen(m, vector<bool>(n, false));
            queue<pair<int, int>> q;
            q.push({r0, c0});
            seen[r0][c0] = true;
            bool pac = false, atl = false;
            while (!q.empty()) {
                auto [r, c] = q.front(); q.pop();
                if (r == 0 || c == 0) pac = true;
                if (r == m - 1 || c == n - 1) atl = true;
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc] || heights[nr][nc] > heights[r][c]) continue;
                    seen[nr][nc] = true;
                    q.push({nr, nc});
                }
            }
            if (pac && atl) res.push_back({r0, c0});
        }
    return res;
}`,
        java: `List<List<Integer>> pacificAtlantic(int[][] heights) {
    int m = heights.length, n = heights[0].length;
    List<List<Integer>> res = new ArrayList<>();
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    for (int r0 = 0; r0 < m; r0++)
        for (int c0 = 0; c0 < n; c0++) {
            boolean[][] seen = new boolean[m][n];
            Deque<int[]> q = new ArrayDeque<>();
            q.offer(new int[]{r0, c0});
            seen[r0][c0] = true;
            boolean pac = false, atl = false;
            while (!q.isEmpty()) {
                int[] p = q.poll();
                if (p[0] == 0 || p[1] == 0) pac = true;
                if (p[0] == m - 1 || p[1] == n - 1) atl = true;
                for (int k = 0; k < 4; k++) {
                    int nr = p[0] + dr[k], nc = p[1] + dc[k];
                    if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc] || heights[nr][nc] > heights[p[0]][p[1]]) continue;
                    seen[nr][nc] = true;
                    q.offer(new int[]{nr, nc});
                }
            }
            if (pac && atl) res.add(List.of(r0, c0));
        }
    return res;
}`,
        javascript: `function pacificAtlantic(heights) {
  const m = heights.length, n = heights[0].length, res = [];
  for (let r0 = 0; r0 < m; r0++)
    for (let c0 = 0; c0 < n; c0++) {
      const seen = new Set([r0 * n + c0]);
      const q = [[r0, c0]];
      let pac = false, atl = false;
      for (let h = 0; h < q.length; h++) {
        const [r, c] = q[h];
        if (r === 0 || c === 0) pac = true;
        if (r === m - 1 || c === n - 1) atl = true;
        for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
          if (nr >= 0 && nc >= 0 && nr < m && nc < n && !seen.has(nr * n + nc) && heights[nr][nc] <= heights[r][c]) {
            seen.add(nr * n + nc);
            q.push([nr, nc]);
          }
      }
      if (pac && atl) res.push([r0, c0]);
    }
  return res;
}`,
      },
    },
    {
      name: '從兩個大洋的邊界反向往高處爬',
      idea: '`pac` = 從太平洋邊界(上、左)出發,只走到「一樣高或更高」的鄰居,能走到的格子。`atl` 同理(下、右)。答案是兩者的交集。',
      steps: ['`pac`、`atl` 兩個 visited', '上邊界和左邊界的格子當起點,BFS / DFS 往 `heights[nr][nc] >= heights[r][c]` 的鄰居走,標進 pac', '下邊界和右邊界同理,標進 atl', '收集兩邊都標到的格子'],
      figure: { title: 'heights(5 × 5)', steps: reverseFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格在兩次搜尋中各最多被走一次。' },
      verdict: '標準解。「反向搜尋 + 多個起點一起出發」是[[p:graph-traversal]]的重要技巧。',
      code: {
        python: `def pacificAtlantic(heights):
    m, n = len(heights), len(heights[0])

    def climb(starts):                    # 從起點往一樣高或更高的地方爬
        seen = set(starts)
        stack = list(starts)
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if (0 <= nr < m and 0 <= nc < n and (nr, nc) not in seen
                        and heights[nr][nc] >= heights[r][c]):
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        return seen

    pac = climb([(0, c) for c in range(n)] + [(r, 0) for r in range(m)])
    atl = climb([(m - 1, c) for c in range(n)] + [(r, n - 1) for r in range(m)])
    return [list(p) for p in pac & atl]`,
        c: `static int **Hh, M_, N_;

static void climb(bool *seen, int r, int c) {
    if (seen[r * N_ + c]) return;
    seen[r * N_ + c] = true;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int k = 0; k < 4; k++) {
        int nr = r + dr[k], nc = c + dc[k];
        if (nr >= 0 && nc >= 0 && nr < M_ && nc < N_ && Hh[nr][nc] >= Hh[r][c]) climb(seen, nr, nc);
    }
}

int **pacificAtlantic(int **heights, int heightsSize, int *heightsColSize, int *returnSize, int **returnColumnSizes) {
    Hh = heights; M_ = heightsSize; N_ = heightsColSize[0];
    bool *pac = calloc(M_ * N_, 1), *atl = calloc(M_ * N_, 1);
    for (int c = 0; c < N_; c++) { climb(pac, 0, c); climb(atl, M_ - 1, c); }
    for (int r = 0; r < M_; r++) { climb(pac, r, 0); climb(atl, r, N_ - 1); }
    int **res = malloc(M_ * N_ * sizeof(int *)), cnt = 0;
    for (int r = 0; r < M_; r++)
        for (int c = 0; c < N_; c++)
            if (pac[r * N_ + c] && atl[r * N_ + c]) {
                res[cnt] = malloc(2 * sizeof(int));
                res[cnt][0] = r; res[cnt][1] = c;
                cnt++;
            }
    free(pac); free(atl);
    *returnSize = cnt;
    *returnColumnSizes = malloc((cnt ? cnt : 1) * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = 2;
    return res;
}`,
        cpp: `vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
    int m = heights.size(), n = heights[0].size();
    vector<vector<bool>> pac(m, vector<bool>(n, false)), atl = pac;
    function<void(vector<vector<bool>>&, int, int)> climb = [&](vector<vector<bool>>& seen, int r, int c) {
        if (seen[r][c]) return;
        seen[r][c] = true;
        int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nc >= 0 && nr < m && nc < n && heights[nr][nc] >= heights[r][c]) climb(seen, nr, nc);
        }
    };
    for (int c = 0; c < n; c++) { climb(pac, 0, c); climb(atl, m - 1, c); }
    for (int r = 0; r < m; r++) { climb(pac, r, 0); climb(atl, r, n - 1); }
    vector<vector<int>> res;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (pac[r][c] && atl[r][c]) res.push_back({r, c});
    return res;
}`,
        java: `List<List<Integer>> pacificAtlantic(int[][] heights) {
    int m = heights.length, n = heights[0].length;
    boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];
    for (int c = 0; c < n; c++) { climb(heights, pac, 0, c); climb(heights, atl, m - 1, c); }
    for (int r = 0; r < m; r++) { climb(heights, pac, r, 0); climb(heights, atl, r, n - 1); }
    List<List<Integer>> res = new ArrayList<>();
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (pac[r][c] && atl[r][c]) res.add(List.of(r, c));
    return res;
}

private void climb(int[][] h, boolean[][] seen, int r, int c) {
    if (seen[r][c]) return;
    seen[r][c] = true;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] d : dirs) {
        int nr = r + d[0], nc = c + d[1];
        if (nr >= 0 && nc >= 0 && nr < h.length && nc < h[0].length && h[nr][nc] >= h[r][c]) climb(h, seen, nr, nc);
    }
}`,
        javascript: `function pacificAtlantic(heights) {
  const m = heights.length, n = heights[0].length;
  const climb = (starts) => {
    const seen = Array.from({ length: m }, () => new Array(n).fill(false));
    const st = [];
    for (const [r, c] of starts) if (!seen[r][c]) { seen[r][c] = true; st.push([r, c]); }
    while (st.length) {
      const [r, c] = st.pop();
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
        if (nr >= 0 && nc >= 0 && nr < m && nc < n && !seen[nr][nc] && heights[nr][nc] >= heights[r][c]) {
          seen[nr][nc] = true;
          st.push([nr, nc]);
        }
    }
    return seen;
  };
  const top = [], bottom = [];
  for (let c = 0; c < n; c++) { top.push([0, c]); bottom.push([m - 1, c]); }
  for (let r = 0; r < m; r++) { top.push([r, 0]); bottom.push([r, n - 1]); }
  const pac = climb(top), atl = climb(bottom), res = [];
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (pac[r][c] && atl[r][c]) res.push([r, c]);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '反向搜尋的方向弄反:從海往內爬要走到**更高或一樣高**的格子(`>=`),不是更低',
    '水可以流到「一樣高」的格子,條件要包含等號',
    '左下角和右上角同時碰到兩個大洋的邊界,起點兩邊都要放',
  ],
  followUp: [{ q: '同樣「從邊界反著找」的題?', a: '[130. Surrounded Regions](#/q/130):從邊界的 O 開始標記不會被包圍的區域。' }],
  check: {
    kind: 'fn',
    fn: 'pacificAtlantic',
    compare: 'sorted',
    cases: [
      { args: [H], out: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]] },
      { args: [[[1]]], out: [[0, 0]] },
      { args: [[[1, 2], [4, 3]]], out: [[0, 1], [1, 0], [1, 1]] },
      { args: [[[3, 3, 3], [3, 1, 3], [0, 2, 4]]], out: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]] },
    ],
  },
}
