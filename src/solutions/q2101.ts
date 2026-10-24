import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 2101. Detonate the Maximum Bombs

const B = [[1, 2, 3], [2, 3, 1], [3, 4, 2], [4, 5, 3], [5, 6, 4]]

function edgesOf(): number[][] {
  const e: number[][] = []
  B.forEach(([x1, y1, r1], i) =>
    B.forEach(([x2, y2], j) => {
      if (i !== j && (x1 - x2) ** 2 + (y1 - y2) ** 2 <= r1 * r1) e.push([i, j])
    }),
  )
  return e
}

function bfsFig(): FigStep[] {
  const E = edgesOf()
  const pos = Object.fromEntries(B.map(([x, y], i) => [i, { x: x * 0.9, y: -y * 0.6 }]))
  return [
    { note: '炸彈 i 會引爆 j ⇔ j 的中心在 i 的爆炸範圍內:(xi − xj)² + (yi − yj)² ≤ ri²。注意這是**單向**的:半徑大的炸得到半徑小的,反過來不一定', views: [graphView(B.length, E, { directed: true, pos })] },
    { note: '建好有向圖後,「引爆 i 最多連帶炸幾顆」= 從 i 出發 BFS 能走到幾個點', views: [graphView(B.length, E, { directed: true, pos, cls: { 0: 'hl' } })] },
    { note: '對每顆炸彈都跑一次,取最大值。n ≤ 100,n 次 BFS × O(n²) 邊 = O(n³) 夠快', views: [arr([5], { label: '答案', done: [0] })] },
  ]
}

function closureFig(): FigStep[] {
  return [
    { note: '另一種:用可達矩陣 reach[i][j],先填直接的邊,再用 Floyd–Warshall 做傳遞閉包', views: [arr(['reach[i][j] |= reach[i][k] && reach[k][j]'], { label: '轉移' })] },
    { note: '答案 = 每一列 true 的個數(含自己)的最大值', views: [arr([5], { label: '答案', done: [0] })] },
  ]
}

export const q2101: Solution = {
  id: 2101,
  plain: '平面上有一些炸彈,每顆有位置和爆炸半徑。一顆炸彈爆炸時,範圍內的其他炸彈也會被引爆(連鎖反應)。只能親手引爆一顆,最多能炸掉幾顆?',
  statement: '`bombs[i] = [x, y, r]` 是第 i 顆炸彈的座標與爆炸半徑。引爆一顆炸彈時,範圍內(含邊界)的炸彈也會被引爆,並繼續連鎖。只能手動引爆一顆,回傳最多能引爆的炸彈數。',
  examples: [
    { input: 'bombs = [[2,1,3],[6,1,4]]', output: '2' },
    { input: 'bombs = [[1,1,5],[10,10,5]]', output: '1' },
    { input: 'bombs = [[1,2,3],[2,3,1],[3,4,2],[4,5,3],[5,6,4]]', output: '5' },
  ],
  constraints: ['n ≤ 100,座標與半徑 ≤ 10⁵'],
  insight: ['「i 炸得到 j」是單向關係 → 有向圖', '從每顆炸彈出發做 [[p:graph-traversal]],數走得到的點', '距離平方可能到 2·10¹⁰,要用 64 位元'],
  approaches: [
    {
      name: '建有向圖 + 每點 BFS',
      idea: '`i → j` 若 `dx² + dy² ≤ ri²`;對每個 i BFS 計數,取最大。',
      steps: ['雙層迴圈建鄰接表(距離平方用 64 位元)', '`for s`:BFS 數走到的點數', '回傳最大值'],
      figure: { title: 'bombs = [[1,2,3],[2,3,1],[3,4,2],[4,5,3],[5,6,4]]', steps: bfsFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '建圖 O(n²);n 次 BFS,每次 O(n + E) = O(n²)。' },
      verdict: '最推薦,直接把幾何條件轉成圖。',
      code: {
        python: `from collections import deque

def maximumDetonation(bombs):
    n = len(bombs)
    g = [[] for _ in range(n)]
    for i, (x1, y1, r1) in enumerate(bombs):
        for j, (x2, y2, _) in enumerate(bombs):
            if i != j and (x1 - x2) ** 2 + (y1 - y2) ** 2 <= r1 * r1:
                g[i].append(j)                # i 炸得到 j(單向)
    best = 0
    for s in range(n):
        seen, q = {s}, deque([s])
        while q:
            u = q.popleft()
            for v in g[u]:
                if v not in seen:
                    seen.add(v)
                    q.append(v)
        best = max(best, len(seen))
    return best`,
        c: `int maximumDetonation(int **bombs, int bombsSize, int *bombsColSize) {
    int n = bombsSize, best = 0;
    static bool adj[100][100];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            long long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1], r = bombs[i][2];
            adj[i][j] = i != j && dx * dx + dy * dy <= r * r;
        }
    for (int s = 0; s < n; s++) {
        bool seen[100] = {false};
        int q[100], h = 0, t = 0;
        seen[s] = true; q[t++] = s;
        while (h < t) {
            int u = q[h++];
            for (int v = 0; v < n; v++) if (adj[u][v] && !seen[v]) { seen[v] = true; q[t++] = v; }
        }
        if (t > best) best = t;
    }
    return best;
}`,
        cpp: `int maximumDetonation(vector<vector<int>>& bombs) {
    int n = bombs.size(), best = 0;
    vector<vector<int>> g(n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            long long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1], r = bombs[i][2];
            if (i != j && dx * dx + dy * dy <= r * r) g[i].push_back(j);
        }
    for (int s = 0; s < n; s++) {
        vector<bool> seen(n, false);
        queue<int> q;
        q.push(s);
        seen[s] = true;
        int cnt = 1;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : g[u]) if (!seen[v]) { seen[v] = true; cnt++; q.push(v); }
        }
        best = max(best, cnt);
    }
    return best;
}`,
        java: `int maximumDetonation(int[][] bombs) {
    int n = bombs.length, best = 0;
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        g.add(new ArrayList<>());
        for (int j = 0; j < n; j++) {
            long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1], r = bombs[i][2];
            if (i != j && dx * dx + dy * dy <= r * r) g.get(i).add(j);
        }
    }
    for (int s = 0; s < n; s++) {
        boolean[] seen = new boolean[n];
        Deque<Integer> q = new ArrayDeque<>();
        q.offer(s);
        seen[s] = true;
        int cnt = 1;
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) if (!seen[v]) { seen[v] = true; cnt++; q.offer(v); }
        }
        best = Math.max(best, cnt);
    }
    return best;
}`,
        javascript: `function maximumDetonation(bombs) {
  const n = bombs.length, g = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1], r = bombs[i][2];
      if (i !== j && dx * dx + dy * dy <= r * r) g[i].push(j);
    }
  let best = 0;
  for (let s = 0; s < n; s++) {
    const seen = new Array(n).fill(false), q = [s];
    seen[s] = true;
    for (let h = 0; h < q.length; h++) for (const v of g[q[h]]) if (!seen[v]) {
      seen[v] = true;
      q.push(v);
    }
    best = Math.max(best, q.length);
  }
  return best;
}`,
      },
    },
    {
      name: '傳遞閉包(Floyd–Warshall)',
      idea: '`reach[i][j]` 先填直接引爆關係與自己;`for k, i, j`:`reach[i][j] |= reach[i][k] and reach[k][j]`;答案是每列 true 數的最大值。',
      steps: ['`reach[i][i] = True`;直接邊填 True', '三層迴圈做閉包', '回傳 `max(sum(row))`'],
      figure: { title: 'bombs = [[1,2,3],[2,3,1],[3,4,2],[4,5,3],[5,6,4]]', steps: closureFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '三層迴圈。' },
      verdict: '一次算出所有點對的可達性,程式很短。',
      code: {
        python: `def maximumDetonation(bombs):
    n = len(bombs)
    reach = [[False] * n for _ in range(n)]
    for i, (x1, y1, r1) in enumerate(bombs):
        for j, (x2, y2, _) in enumerate(bombs):
            reach[i][j] = i == j or (x1 - x2) ** 2 + (y1 - y2) ** 2 <= r1 * r1
    for k in range(n):
        for i in range(n):
            if reach[i][k]:
                for j in range(n):
                    if reach[k][j]:
                        reach[i][j] = True    # i 炸 k,k 炸 j → i 間接炸 j
    return max(sum(row) for row in reach)`,
        c: `int maximumDetonation(int **bombs, int bombsSize, int *bombsColSize) {
    int n = bombsSize, best = 0;
    static bool reach[100][100];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            long long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1], r = bombs[i][2];
            reach[i][j] = i == j || dx * dx + dy * dy <= r * r;
        }
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            if (reach[i][k])
                for (int j = 0; j < n; j++)
                    if (reach[k][j]) reach[i][j] = true;
    for (int i = 0; i < n; i++) {
        int c = 0;
        for (int j = 0; j < n; j++) c += reach[i][j];
        if (c > best) best = c;
    }
    return best;
}`,
        cpp: `int maximumDetonation(vector<vector<int>>& bombs) {
    int n = bombs.size(), best = 0;
    vector<vector<bool>> reach(n, vector<bool>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            long long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1], r = bombs[i][2];
            reach[i][j] = i == j || dx * dx + dy * dy <= r * r;
        }
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            if (reach[i][k])
                for (int j = 0; j < n; j++)
                    if (reach[k][j]) reach[i][j] = true;
    for (int i = 0; i < n; i++) best = max(best, (int)count(reach[i].begin(), reach[i].end(), true));
    return best;
}`,
        java: `int maximumDetonation(int[][] bombs) {
    int n = bombs.length, best = 0;
    boolean[][] reach = new boolean[n][n];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            long dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1], r = bombs[i][2];
            reach[i][j] = i == j || dx * dx + dy * dy <= r * r;
        }
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            if (reach[i][k])
                for (int j = 0; j < n; j++)
                    if (reach[k][j]) reach[i][j] = true;
    for (boolean[] row : reach) {
        int c = 0;
        for (boolean b : row) if (b) c++;
        best = Math.max(best, c);
    }
    return best;
}`,
        javascript: `function maximumDetonation(bombs) {
  const n = bombs.length;
  const reach = bombs.map(([x1, y1, r1], i) => bombs.map(([x2, y2], j) => i === j || (x1 - x2) ** 2 + (y1 - y2) ** 2 <= r1 * r1));
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      if (reach[i][k]) for (let j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
  return Math.max(...reach.map((row) => row.filter(Boolean).length));
}`,
      },
    },
  ],
  pitfalls: ['當成無向圖或用併查集:引爆關係是單向的', '距離用 int 平方:距離平方 dx² + dy² 可到 2·10¹⁰,用 int 會溢位', '用浮點數開根號比較:精度問題'],
  check: {
    kind: 'fn',
    fn: 'maximumDetonation',
    cases: [
      { args: [[[2, 1, 3], [6, 1, 4]]], out: 2 },
      { args: [[[1, 1, 5], [10, 10, 5]]], out: 1 },
      { args: [B], out: 5 },
      { args: [[[1, 1, 100000], [100000, 100000, 1]]], out: 1 },
    ],
  },
}
