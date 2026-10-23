import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1129. Shortest Path with Alternating Colors

const N = 3
const RED = [[0, 1]]
const BLUE = [[1, 2]]
const POS = { 0: { x: 0, y: 0 }, 1: { x: 2, y: 0 }, 2: { x: 4, y: 0 } }

function bfsFig(): FigStep[] {
  const edges = [...RED.map(([u, v]) => [u, v]), ...BLUE.map(([u, v]) => [u, v])]
  return [
    { note: '有紅邊(實線)和藍邊(外框標記),路徑上的顏色必須**紅藍交替**。求從 0 到每個點的最短交替路徑長度', views: [graphView(N, edges, { directed: true, pos: POS, edgeCls: { 1: 'hl' } })] },
    { note: '關鍵:同一個點「最後走紅邊到達」和「最後走藍邊到達」是兩種不同狀態(下一步能走的顏色不同)。BFS 的狀態 = (點, 上一條邊的顏色)', views: [arr(['(0, 起點)', '(1, 紅)', '(2, 藍)'], { label: 'BFS 狀態' })] },
    { note: '0 →紅→ 1(距離 1)→藍→ 2(距離 2)。如果 1 → 2 只有紅邊,就走不到 2(不能連續兩條紅)', views: [graphView(N, edges, { directed: true, pos: POS, cls: { 0: 'done', 1: 'done', 2: 'done' }, edgeCls: { 0: 'done', 1: 'hl' } }), arr([0, 1, 2], { label: '答案', done: [0, 1, 2] })] },
  ]
}

function relaxFig(): FigStep[] {
  return [
    { note: '另一種:`d[c][v]` = 最後一條邊是顏色 c 時到 v 的最短距離。反覆「鬆弛」:紅邊 u → v 可以接在「最後是藍」的 u 後面', views: [arr(['d[紅][v] = min(d[紅][v], d[藍][u] + 1)', 'd[藍][v] = min(d[藍][v], d[紅][u] + 1)'], { label: '轉移' })] },
    { note: '最短交替路徑最多 2n − 1 步(每個狀態只經過一次),重複鬆弛 2n 輪就一定收斂(Bellman–Ford 的想法)', views: [arr([0, 1, 2], { label: '答案', done: [0, 1, 2] })] },
  ]
}

export const q1129: Solution = {
  id: 1129,
  plain: '一張有向圖,每條邊不是紅色就是藍色。從點 0 出發,走的路必須紅藍交替。到每個點最少要走幾步?到不了的寫 −1。',
  statement: '有向圖 n 個點,`redEdges[i] = [a, b]` 為紅色邊、`blueEdges[j] = [u, v]` 為藍色邊(可能有自環與重邊)。回傳陣列 answer,`answer[x]` 是從 0 到 x 且**邊的顏色交替**的最短路徑長度;不存在則為 −1。',
  examples: [
    { input: 'n = 3, redEdges = [[0,1],[1,2]], blueEdges = []', output: '[0,1,-1]' },
    { input: 'n = 3, redEdges = [[0,1]], blueEdges = [[2,1]]', output: '[0,1,-1]' },
    { input: 'n = 3, redEdges = [[0,1]], blueEdges = [[1,2]]', output: '[0,1,2]' },
  ],
  constraints: ['n ≤ 100,邊數 ≤ 400'],
  insight: ['無權最短路徑 → BFS', '狀態要多記「上一條邊的顏色」:(點, 顏色) 共 2n 個狀態', '答案取兩種顏色到達距離的較小值'],
  approaches: [
    {
      name: 'BFS,狀態 = (點, 上一個顏色)',
      idea: '起點以兩種顏色各入佇列一次;從 (u, c) 只能走顏色 1 − c 的邊。每個點第一次被任何顏色走到時,就記下答案。',
      steps: ['`g[0]` 紅邊、`g[1]` 藍邊', '`q = [(0, 紅, 0), (0, 藍, 0)]`,`seen` 記 (點, 顏色)', '彈出 (u, c, d):`ans[u]` 還沒填就填 d', '走 `g[1 − c][u]` 的邊,(v, 1 − c) 沒看過就入佇列'],
      figure: { title: 'red = [[0,1]],blue = [[1,2]]', steps: bfsFig() },
      complexity: { time: 'O(n + E)', space: 'O(n + E)', why: '2n 個狀態,每條邊最多走兩次。' },
      verdict: '最推薦,「狀態擴充」是 BFS 很重要的技巧。',
      code: {
        python: `from collections import deque

def shortestAlternatingPaths(n, redEdges, blueEdges):
    g = [[[] for _ in range(n)] for _ in range(2)]   # g[0] 紅、g[1] 藍
    for a, b in redEdges:
        g[0][a].append(b)
    for a, b in blueEdges:
        g[1][a].append(b)
    ans = [-1] * n
    seen = {(0, 0), (0, 1)}
    q = deque([(0, 0, 0), (0, 1, 0)])         # (點, 上一條邊的顏色, 距離)
    while q:
        u, c, d = q.popleft()
        if ans[u] == -1:
            ans[u] = d                        # BFS 第一次走到就是最短
        for v in g[1 - c][u]:                 # 下一條只能走另一種顏色
            if (v, 1 - c) not in seen:
                seen.add((v, 1 - c))
                q.append((v, 1 - c, d + 1))
    return ans`,
        c: `int *shortestAlternatingPaths(int n, int **redEdges, int redEdgesSize, int *redEdgesColSize,
                              int **blueEdges, int blueEdgesSize, int *blueEdgesColSize, int *returnSize) {
    static bool adj[2][100][100], seen[100][2];
    memset(adj, 0, sizeof adj); memset(seen, 0, sizeof seen);
    for (int i = 0; i < redEdgesSize; i++) adj[0][redEdges[i][0]][redEdges[i][1]] = true;
    for (int i = 0; i < blueEdgesSize; i++) adj[1][blueEdges[i][0]][blueEdges[i][1]] = true;
    int *ans = malloc(n * sizeof(int)), qu[200], qc[200], qd[200], h = 0, t = 0;
    for (int i = 0; i < n; i++) ans[i] = -1;
    for (int c = 0; c < 2; c++) { seen[0][c] = true; qu[t] = 0; qc[t] = c; qd[t++] = 0; }
    while (h < t) {
        int u = qu[h], c = qc[h], d = qd[h++];
        if (ans[u] == -1) ans[u] = d;
        for (int v = 0; v < n; v++)
            if (adj[1 - c][u][v] && !seen[v][1 - c]) { seen[v][1 - c] = true; qu[t] = v; qc[t] = 1 - c; qd[t++] = d + 1; }
    }
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> shortestAlternatingPaths(int n, vector<vector<int>>& redEdges, vector<vector<int>>& blueEdges) {
    vector<vector<int>> g[2] = {vector<vector<int>>(n), vector<vector<int>>(n)};
    for (auto &e : redEdges) g[0][e[0]].push_back(e[1]);
    for (auto &e : blueEdges) g[1][e[0]].push_back(e[1]);
    vector<int> ans(n, -1);
    vector<array<bool, 2>> seen(n, {false, false});
    queue<array<int, 3>> q;
    for (int c = 0; c < 2; c++) { seen[0][c] = true; q.push({0, c, 0}); }
    while (!q.empty()) {
        auto [u, c, d] = q.front();
        q.pop();
        if (ans[u] == -1) ans[u] = d;
        for (int v : g[1 - c][u])
            if (!seen[v][1 - c]) { seen[v][1 - c] = true; q.push({v, 1 - c, d + 1}); }
    }
    return ans;
}`,
        java: `int[] shortestAlternatingPaths(int n, int[][] redEdges, int[][] blueEdges) {
    List<List<List<Integer>>> g = new ArrayList<>();
    for (int c = 0; c < 2; c++) {
        g.add(new ArrayList<>());
        for (int i = 0; i < n; i++) g.get(c).add(new ArrayList<>());
    }
    for (int[] e : redEdges) g.get(0).get(e[0]).add(e[1]);
    for (int[] e : blueEdges) g.get(1).get(e[0]).add(e[1]);
    int[] ans = new int[n];
    Arrays.fill(ans, -1);
    boolean[][] seen = new boolean[n][2];
    Deque<int[]> q = new ArrayDeque<>();
    for (int c = 0; c < 2; c++) { seen[0][c] = true; q.offer(new int[]{0, c, 0}); }
    while (!q.isEmpty()) {
        int[] p = q.poll();
        int u = p[0], c = p[1], d = p[2];
        if (ans[u] == -1) ans[u] = d;
        for (int v : g.get(1 - c).get(u))
            if (!seen[v][1 - c]) { seen[v][1 - c] = true; q.offer(new int[]{v, 1 - c, d + 1}); }
    }
    return ans;
}`,
        javascript: `function shortestAlternatingPaths(n, redEdges, blueEdges) {
  const g = [0, 1].map(() => Array.from({ length: n }, () => []));
  for (const [a, b] of redEdges) g[0][a].push(b);
  for (const [a, b] of blueEdges) g[1][a].push(b);
  const ans = new Array(n).fill(-1), seen = Array.from({ length: n }, () => [false, false]);
  const q = [[0, 0, 0], [0, 1, 0]];
  seen[0][0] = seen[0][1] = true;
  for (let h = 0; h < q.length; h++) {
    const [u, c, d] = q[h];
    if (ans[u] === -1) ans[u] = d;
    for (const v of g[1 - c][u])
      if (!seen[v][1 - c]) {
        seen[v][1 - c] = true;
        q.push([v, 1 - c, d + 1]);
      }
  }
  return ans;
}`,
      },
    },
    {
      name: '反覆鬆弛(Bellman–Ford 式)',
      idea: '`d[0][v]`、`d[1][v]` 為最後是紅 / 藍到 v 的距離;重複 2n 輪:紅邊用 `d[1][u] + 1` 更新 `d[0][v]`,藍邊用 `d[0][u] + 1` 更新 `d[1][v]`。',
      steps: ['`d[0][0] = d[1][0] = 0`,其餘 ∞', '重複 2n 輪(或直到沒有更新)', '紅邊 (u, v):`d[0][v] = min(d[0][v], d[1][u] + 1)`;藍邊對稱', '`ans[v] = min(d[0][v], d[1][v])`,∞ → −1'],
      figure: { title: 'red = [[0,1]],blue = [[1,2]]', steps: relaxFig() },
      complexity: { time: 'O(n · E)', space: 'O(n)', why: '最多 2n 輪,每輪掃全部邊。' },
      verdict: '比 BFS 慢,但把「顏色交替」寫成很直觀的兩條轉移式。',
      code: {
        python: `def shortestAlternatingPaths(n, redEdges, blueEdges):
    INF = float('inf')
    d = [[INF] * n, [INF] * n]                # d[0]:最後是紅;d[1]:最後是藍
    d[0][0] = d[1][0] = 0
    for _ in range(2 * n):
        changed = False
        for u, v in redEdges:
            if d[1][u] + 1 < d[0][v]:
                d[0][v] = d[1][u] + 1         # 紅邊接在藍色結尾後面
                changed = True
        for u, v in blueEdges:
            if d[0][u] + 1 < d[1][v]:
                d[1][v] = d[0][u] + 1
                changed = True
        if not changed:
            break
    return [-1 if min(a, b) == INF else min(a, b) for a, b in zip(d[0], d[1])]`,
        c: `int *shortestAlternatingPaths(int n, int **redEdges, int redEdgesSize, int *redEdgesColSize,
                              int **blueEdges, int blueEdgesSize, int *blueEdgesColSize, int *returnSize) {
    const int INF = 1 << 29;
    int d[2][100];
    for (int i = 0; i < n; i++) d[0][i] = d[1][i] = INF;
    d[0][0] = d[1][0] = 0;
    for (int it = 0; it < 2 * n; it++) {
        bool changed = false;
        for (int i = 0; i < redEdgesSize; i++) {
            int u = redEdges[i][0], v = redEdges[i][1];
            if (d[1][u] + 1 < d[0][v]) { d[0][v] = d[1][u] + 1; changed = true; }
        }
        for (int i = 0; i < blueEdgesSize; i++) {
            int u = blueEdges[i][0], v = blueEdges[i][1];
            if (d[0][u] + 1 < d[1][v]) { d[1][v] = d[0][u] + 1; changed = true; }
        }
        if (!changed) break;
    }
    int *ans = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        int m = d[0][i] < d[1][i] ? d[0][i] : d[1][i];
        ans[i] = m >= INF ? -1 : m;
    }
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> shortestAlternatingPaths(int n, vector<vector<int>>& redEdges, vector<vector<int>>& blueEdges) {
    const int INF = 1 << 29;
    vector<vector<int>> d(2, vector<int>(n, INF));
    d[0][0] = d[1][0] = 0;
    for (int it = 0; it < 2 * n; it++) {
        bool changed = false;
        for (auto &e : redEdges) if (d[1][e[0]] + 1 < d[0][e[1]]) { d[0][e[1]] = d[1][e[0]] + 1; changed = true; }
        for (auto &e : blueEdges) if (d[0][e[0]] + 1 < d[1][e[1]]) { d[1][e[1]] = d[0][e[0]] + 1; changed = true; }
        if (!changed) break;
    }
    vector<int> ans(n);
    for (int i = 0; i < n; i++) {
        int m = min(d[0][i], d[1][i]);
        ans[i] = m >= INF ? -1 : m;
    }
    return ans;
}`,
        java: `int[] shortestAlternatingPaths(int n, int[][] redEdges, int[][] blueEdges) {
    final int INF = 1 << 29;
    int[][] d = new int[2][n];
    for (int[] row : d) Arrays.fill(row, INF);
    d[0][0] = d[1][0] = 0;
    for (int it = 0; it < 2 * n; it++) {
        boolean changed = false;
        for (int[] e : redEdges) if (d[1][e[0]] + 1 < d[0][e[1]]) { d[0][e[1]] = d[1][e[0]] + 1; changed = true; }
        for (int[] e : blueEdges) if (d[0][e[0]] + 1 < d[1][e[1]]) { d[1][e[1]] = d[0][e[0]] + 1; changed = true; }
        if (!changed) break;
    }
    int[] ans = new int[n];
    for (int i = 0; i < n; i++) {
        int m = Math.min(d[0][i], d[1][i]);
        ans[i] = m >= INF ? -1 : m;
    }
    return ans;
}`,
        javascript: `function shortestAlternatingPaths(n, redEdges, blueEdges) {
  const d = [new Array(n).fill(Infinity), new Array(n).fill(Infinity)];
  d[0][0] = d[1][0] = 0;
  for (let it = 0; it < 2 * n; it++) {
    let changed = false;
    for (const [u, v] of redEdges)
      if (d[1][u] + 1 < d[0][v]) {
        d[0][v] = d[1][u] + 1;
        changed = true;
      }
    for (const [u, v] of blueEdges)
      if (d[0][u] + 1 < d[1][v]) {
        d[1][v] = d[0][u] + 1;
        changed = true;
      }
    if (!changed) break;
  }
  return d[0].map((a, i) => {
    const m = Math.min(a, d[1][i]);
    return m === Infinity ? -1 : m;
  });
}`,
      },
    },
  ],
  pitfalls: ['visited 只記點不記顏色:用紅邊到過的點,之後用藍邊到達時會被錯誤跳過', '起點只用一種顏色入佇列:第一步走藍邊的路徑就漏掉了'],
  check: {
    kind: 'fn',
    fn: 'shortestAlternatingPaths',
    cases: [
      { args: [3, [[0, 1], [1, 2]], []], out: [0, 1, -1] },
      { args: [3, [[0, 1]], [[2, 1]]], out: [0, 1, -1] },
      { args: [N, RED, BLUE], out: [0, 1, 2] },
      { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [[1, 2], [2, 3], [3, 1]]], out: [0, 1, 2, 3, 7] },
    ],
  },
}
