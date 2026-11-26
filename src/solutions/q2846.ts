import { graphView, kv } from './fig'
import type { FigStep, Solution } from './types'

// 2846. Minimum Edge Weight Equilibrium Queries in a Tree

const N = 7
const EDGES = [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 2], [5, 6, 2]]
// 鏈狀樹:0-1-2-3-4-5-6,前三條權重 1,後三條權重 2

/** 把鏈狀樹排成一直線,方便看路徑 */
const linePos = Object.fromEntries(Array.from({ length: N }, (_, i) => [i, { x: i * 1.3, y: 0 }]))

function liftFig(): FigStep[] {
  return [
    {
      note: '先把樹從節點 0 當根做一次走訪,記下每個節點的深度 depth、以及「根到這個節點」每種權重各出現幾次 cnt[v][w]。',
      line: 10,
      views: [graphView(N, EDGES, { base: 0, pos: linePos, label: '從 0 當根;邊上數字是權重', subs: Object.fromEntries(Array.from({ length: N }, (_, i) => [i, `深 ${i}`])) })],
    },
    {
      note: 'query [2,6]:先求最近共同祖先 LCA(2,6)。這條鏈上 2 是 6 的祖先,所以 LCA = 2。路徑邊數 = depth[2] + depth[6] − 2·depth[2] = 2 + 6 − 4 = 4。',
      line: 24,
      views: [graphView(N, EDGES, { base: 0, pos: linePos, label: '路徑 2→6(綠),LCA = 2', cls: { 2: 'done', 3: 'hl', 4: 'hl', 5: 'hl', 6: 'hl' }, edgeCls: { 2: 'hl', 3: 'hl', 4: 'hl', 5: 'hl' } })],
    },
    {
      note: '路徑上每種權重的次數 = cnt[2][w] + cnt[6][w] − 2·cnt[LCA][w]。權重 1 有 1 條、權重 2 有 3 條 → 最多的是權重 2(3 條)。',
      line: 27,
      views: [kv([['路徑邊數', 4], ['權重 1 的條數', 1], ['權重 2 的條數', 3], ['最多的一種', '權重 2 ×3']], 'query [2,6]')],
    },
    {
      note: '答案 = 路徑邊數 − 最多那種權重的次數 = 4 − 3 = 1。把其他 1 條邊改成權重 2 就全相等了。',
      line: 28,
      views: [kv([['4 − 3', 1]], 'query [2,6] 答案')],
    },
  ]
}

function naiveFig(): FigStep[] {
  return [
    {
      note: '同樣先走一次,記 depth、par(父節點)、cnt。差別只在 LCA 怎麼求。',
      line: 10,
      views: [graphView(N, EDGES, { base: 0, pos: linePos, label: '鏈狀樹', subs: Object.fromEntries(Array.from({ length: N }, (_, i) => [i, `深 ${i}`])) })],
    },
    {
      note: 'query [0,6] 求 LCA:先把較深的那個往上提到和另一個同深度;這裡 0 已經是根,6 一路往上提到 0 → LCA = 0。',
      line: 20,
      views: [graphView(N, EDGES, { base: 0, pos: linePos, label: '深的往上跳到同深度', cls: { 0: 'done', 6: 'hl' } })],
    },
    {
      note: '兩個一起往上跳到相同節點就是 LCA。路徑邊數 = 6,權重 1 有 3 條、權重 2 有 3 條,最多 3 條 → 答案 = 6 − 3 = 3。',
      line: 23,
      views: [kv([['路徑邊數', 6], ['權重 1', 3], ['權重 2', 3], ['6 − 3', 3]], 'query [0,6] 答案')],
    },
  ]
}

export const q2846: Solution = {
  id: 2846,
  plain: '一棵樹,每條邊有個 1~26 的權重。每個詢問給兩個節點 a、b:你想把 a 到 b 這條路徑上所有邊的權重都改成同一個值,問最少改幾條邊。訣竅:路徑上已經出現最多次的那種權重留著不動,其餘全改 → 改的數量 = 路徑邊數 − 最多那種權重的次數。',
  statement: '`n` 個節點的樹,`edges[i] = [u, v, w]`(權重 `1 ≤ w ≤ 26`)。對每個詢問 `[a, b]`,回傳把 a→b 路徑上所有邊權改成同一值所需的最少修改數。',
  examples: [
    { input: 'n=7, edges=鏈 0-1-2-3-4-5-6(前三 w=1,後三 w=2), queries=[[0,3],[3,6],[2,6],[0,6]]', output: '[0,0,1,3]' },
    { input: 'n=4, edges=[[0,1,6],[1,2,1],[1,3,2]], queries=[[0,1],[1,2],[0,3],[3,3]]', output: '[0,0,1,0]', note: '[0,1] 只有一條邊,本來就相等 → 0;[0,3] 路徑權重 6、2 各一條 → 2−1=1' },
  ],
  constraints: ['`1 ≤ n ≤ 1e4`', '權重只有 1~26 這 26 種 → 可以對每個節點開長度 27 的計數陣列', '`a == b` 時路徑沒有邊,答案 0', 'n 可能到 1e4,遞迴太深 JS 會爆堆疊 → 用迭代的 BFS 建樹'],
  insight: [
    '把路徑上每種權重數一數:留下出現最多次的那種,其餘都改成它 → 最少修改數 = 路徑邊數 − 眾數出現次數',
    '「路徑上某權重出現幾次」可以用前綴思想:`cnt[v][w]` = 根到 v 的路徑上權重 w 的次數。路徑 a→b 的次數 = `cnt[a][w] + cnt[b][w] − 2·cnt[lca][w]`',
    '「路徑邊數」= `depth[a] + depth[b] − 2·depth[lca]`',
    '所以每個詢問的核心是求[[p:lca]](最近共同祖先),再對 26 種權重各算一次取最大',
  ],
  approaches: [
    {
      name: '倍增 LCA + 前綴權重計數',
      idea: '一次[[p:tree-dfs]]記下 depth、倍增祖先表 `up[k][v]`、以及根到各點的權重計數 `cnt[v][w]`。每個詢問用倍增法求[[p:lca]],再用前綴相減算出路徑上每種權重的次數。',
      steps: ['BFS/DFS 從節點 0 建 `depth`、`up[0][v]=父`、`cnt[v]`(複製父節點的計數再把這條邊的權重 +1)', '倍增:`up[k][v] = up[k−1][up[k−1][v]]`', '求 LCA:先把深的往上提到同深,再兩個一起用倍增往上跳', '路徑邊數 = `depth[a]+depth[b]−2·depth[lca]`', '對每種權重 w:次數 = `cnt[a][w]+cnt[b][w]−2·cnt[lca][w]`,取最大;答案 = 邊數 − 最大'],
      figure: { title: '鏈狀樹範例', steps: liftFig() },
      complexity: { time: 'O((n + q)·(log n + 26))', space: 'O(n·(log n + 26))', why: '建倍增表 O(n log n);每個詢問求 LCA O(log n),再掃 26 種權重。' },
      verdict: '最通用的解。詢問數多、樹深時,倍增 LCA 的 O(log n) 比樸素法穩定得多。',
      code: {
        javascript: `function minOperationsQueries(n, edges, queries) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
  const LOG = Math.max(1, Math.ceil(Math.log2(n)));
  const up = Array.from({ length: LOG }, () => new Array(n).fill(-1));
  const depth = new Array(n).fill(0);
  const cnt = Array.from({ length: n }, () => new Array(27).fill(0));
  const order = [0], seen = new Array(n).fill(false);
  seen[0] = true;
  for (let h = 0; h < order.length; h++) {              // 迭代 BFS 建樹,避免遞迴爆堆疊
    const u = order[h];
    for (const [v, w] of adj[u]) {
      if (seen[v]) continue;
      seen[v] = true;
      depth[v] = depth[u] + 1;
      for (let c = 1; c <= 26; c++) cnt[v][c] = cnt[u][c];
      cnt[v][w]++;                                       // 根到 v:這條邊權重 +1
      up[0][v] = u;
      order.push(v);
    }
  }
  for (let k = 1; k < LOG; k++)
    for (let v = 0; v < n; v++)
      up[k][v] = up[k - 1][v] === -1 ? -1 : up[k - 1][up[k - 1][v]];
  const lca = (a, b) => {
    if (depth[a] < depth[b]) [a, b] = [b, a];
    let d = depth[a] - depth[b];
    for (let k = 0; k < LOG; k++) if ((d >> k) & 1) a = up[k][a]; // 深的提到同深
    if (a === b) return a;
    for (let k = LOG - 1; k >= 0; k--) if (up[k][a] !== up[k][b]) { a = up[k][a]; b = up[k][b]; }
    return up[0][a];
  };
  return queries.map(([a, b]) => {
    const l = lca(a, b);
    const edgeCount = depth[a] + depth[b] - 2 * depth[l];
    let mx = 0;
    for (let w = 1; w <= 26; w++)
      mx = Math.max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
    return edgeCount - mx;
  });
}`,
        python: `import math
def minOperationsQueries(n, edges, queries):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w)); adj[v].append((u, w))
    LOG = max(1, math.ceil(math.log2(n)) if n > 1 else 1)
    up = [[-1] * n for _ in range(LOG)]
    depth = [0] * n
    cnt = [[0] * 27 for _ in range(n)]
    order = [0]; seen = [False] * n; seen[0] = True
    h = 0
    while h < len(order):                                # 迭代 BFS 建樹
        u = order[h]; h += 1
        for v, w in adj[u]:
            if seen[v]:
                continue
            seen[v] = True
            depth[v] = depth[u] + 1
            cnt[v] = cnt[u][:]
            cnt[v][w] += 1
            up[0][v] = u
            order.append(v)
    for k in range(1, LOG):
        for v in range(n):
            up[k][v] = -1 if up[k - 1][v] == -1 else up[k - 1][up[k - 1][v]]
    def lca(a, b):
        if depth[a] < depth[b]:
            a, b = b, a
        d = depth[a] - depth[b]
        for k in range(LOG):
            if (d >> k) & 1:
                a = up[k][a]
        if a == b:
            return a
        for k in range(LOG - 1, -1, -1):
            if up[k][a] != up[k][b]:
                a, b = up[k][a], up[k][b]
        return up[0][a]
    res = []
    for a, b in queries:
        l = lca(a, b)
        edge_count = depth[a] + depth[b] - 2 * depth[l]
        mx = 0
        for w in range(1, 27):
            mx = max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w])
        res.append(edge_count - mx)
    return res`,
        c: `int *minOperationsQueries(int n, int **edges, int edgesSize, int *edgesColSize,
                          int **queries, int queriesSize, int *queriesColSize, int *returnSize) {
    int *head = malloc(n * sizeof(int));
    int *nxt = malloc(2 * edgesSize * sizeof(int));
    int *to = malloc(2 * edgesSize * sizeof(int));
    int *wt = malloc(2 * edgesSize * sizeof(int));
    for (int i = 0; i < n; i++) head[i] = -1;
    int ec = 0;
    for (int i = 0; i < edgesSize; i++) {
        int u = edges[i][0], v = edges[i][1], w = edges[i][2];
        to[ec] = v; wt[ec] = w; nxt[ec] = head[u]; head[u] = ec++;
        to[ec] = u; wt[ec] = w; nxt[ec] = head[v]; head[v] = ec++;
    }
    int LOG = 1;
    while ((1 << LOG) < n) LOG++;
    int **up = malloc(LOG * sizeof(int *));
    for (int k = 0; k < LOG; k++) { up[k] = malloc(n * sizeof(int)); for (int v = 0; v < n; v++) up[k][v] = -1; }
    int *depth = calloc(n, sizeof(int));
    int (*cnt)[27] = calloc(n, sizeof(*cnt));
    int *order = malloc(n * sizeof(int)), *seen = calloc(n, sizeof(int));
    int os = 0; order[os++] = 0; seen[0] = 1;
    for (int h = 0; h < os; h++) {
        int u = order[h];
        for (int e = head[u]; e != -1; e = nxt[e]) {
            int v = to[e], w = wt[e];
            if (seen[v]) continue;
            seen[v] = 1; depth[v] = depth[u] + 1;
            for (int c = 1; c <= 26; c++) cnt[v][c] = cnt[u][c];
            cnt[v][w]++; up[0][v] = u; order[os++] = v;
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int v = 0; v < n; v++)
            up[k][v] = up[k - 1][v] == -1 ? -1 : up[k - 1][up[k - 1][v]];
    int *res = malloc(queriesSize * sizeof(int));
    for (int q = 0; q < queriesSize; q++) {
        int a = queries[q][0], b = queries[q][1];
        int x = a, y = b;
        if (depth[x] < depth[y]) { int t = x; x = y; y = t; }
        int d = depth[x] - depth[y];
        for (int k = 0; k < LOG; k++) if ((d >> k) & 1) x = up[k][x];
        int l;
        if (x == y) l = x;
        else {
            for (int k = LOG - 1; k >= 0; k--) if (up[k][x] != up[k][y]) { x = up[k][x]; y = up[k][y]; }
            l = up[0][x];
        }
        int edgeCount = depth[a] + depth[b] - 2 * depth[l], mx = 0;
        for (int w = 1; w <= 26; w++) {
            int c = cnt[a][w] + cnt[b][w] - 2 * cnt[l][w];
            if (c > mx) mx = c;
        }
        res[q] = edgeCount - mx;
    }
    *returnSize = queriesSize;
    free(head); free(nxt); free(to); free(wt);
    for (int k = 0; k < LOG; k++) free(up[k]);
    free(up); free(depth); free(cnt); free(order); free(seen);
    return res;
}`,
        cpp: `vector<int> minOperationsQueries(int n, vector<vector<int>>& edges, vector<vector<int>>& queries) {
    vector<vector<pair<int,int>>> adj(n);
    for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
    int LOG = 1;
    while ((1 << LOG) < n) LOG++;
    vector<vector<int>> up(LOG, vector<int>(n, -1));
    vector<int> depth(n, 0);
    vector<array<int,27>> cnt(n);
    for (auto& c : cnt) c.fill(0);
    vector<int> order = {0}, seen(n, 0);
    seen[0] = 1;
    for (int h = 0; h < (int)order.size(); h++) {
        int u = order[h];
        for (auto& [v, w] : adj[u]) {
            if (seen[v]) continue;
            seen[v] = 1; depth[v] = depth[u] + 1;
            cnt[v] = cnt[u]; cnt[v][w]++;
            up[0][v] = u; order.push_back(v);
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int v = 0; v < n; v++)
            up[k][v] = up[k-1][v] == -1 ? -1 : up[k-1][up[k-1][v]];
    auto lca = [&](int a, int b) {
        if (depth[a] < depth[b]) swap(a, b);
        int d = depth[a] - depth[b];
        for (int k = 0; k < LOG; k++) if ((d >> k) & 1) a = up[k][a];
        if (a == b) return a;
        for (int k = LOG - 1; k >= 0; k--) if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    };
    vector<int> res;
    for (auto& q : queries) {
        int a = q[0], b = q[1], l = lca(a, b);
        int edgeCount = depth[a] + depth[b] - 2 * depth[l], mx = 0;
        for (int w = 1; w <= 26; w++)
            mx = max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
        res.push_back(edgeCount - mx);
    }
    return res;
}`,
        java: `int[] minOperationsQueries(int n, int[][] edges, int[][] queries) {
    List<int[]>[] adj = new List[n];
    for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();
    for (int[] e : edges) { adj[e[0]].add(new int[]{e[1], e[2]}); adj[e[1]].add(new int[]{e[0], e[2]}); }
    int LOG = 1;
    while ((1 << LOG) < n) LOG++;
    int[][] up = new int[LOG][n];
    for (int[] row : up) Arrays.fill(row, -1);
    int[] depth = new int[n];
    int[][] cnt = new int[n][27];
    int[] order = new int[n];
    boolean[] seen = new boolean[n];
    int os = 0; order[os++] = 0; seen[0] = true;
    for (int h = 0; h < os; h++) {
        int u = order[h];
        for (int[] e : adj[u]) {
            int v = e[0], w = e[1];
            if (seen[v]) continue;
            seen[v] = true; depth[v] = depth[u] + 1;
            cnt[v] = cnt[u].clone(); cnt[v][w]++;
            up[0][v] = u; order[os++] = v;
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int v = 0; v < n; v++)
            up[k][v] = up[k-1][v] == -1 ? -1 : up[k-1][up[k-1][v]];
    int[] res = new int[queries.length];
    for (int q = 0; q < queries.length; q++) {
        int a = queries[q][0], b = queries[q][1], x = a, y = b;
        if (depth[x] < depth[y]) { int t = x; x = y; y = t; }
        int d = depth[x] - depth[y];
        for (int k = 0; k < LOG; k++) if (((d >> k) & 1) == 1) x = up[k][x];
        int l;
        if (x == y) l = x;
        else {
            for (int k = LOG - 1; k >= 0; k--) if (up[k][x] != up[k][y]) { x = up[k][x]; y = up[k][y]; }
            l = up[0][x];
        }
        int edgeCount = depth[a] + depth[b] - 2 * depth[l], mx = 0;
        for (int w = 1; w <= 26; w++)
            mx = Math.max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
        res[q] = edgeCount - mx;
    }
    return res;
}`,
      },
    },
    {
      name: '樸素 LCA(深度對齊往上跳)',
      idea: '同樣先算前綴計數 `cnt` 與 `par`、`depth`。[[p:lca]]改用最單純的做法:先把深的節點往上提到和另一個同深度,再兩個一起一步步往上走,直到相遇。',
      steps: ['BFS 從 0 建 `depth`、`par`(父節點)、`cnt`', '求 LCA:先把較深的往上提到同深度', '兩個一起往上跳,直到變成同一個節點', '路徑邊數與每種權重次數的算法與方法一相同', '答案 = 邊數 − 眾數次數'],
      figure: { title: '鏈狀樹範例', steps: naiveFig() },
      complexity: { time: 'O(n + q·(h + 26))', space: 'O(26·n)', why: '不建倍增表;每個詢問求 LCA 最壞走 O(h) 步,h 是樹高。' },
      verdict: '程式更短、好懂,在 n 和詢問數都不大(本題 n ≤ 1e4)時完全夠用。樹退化成一條長鏈且詢問很多時,才需要方法一的倍增。',
      code: {
        javascript: `function minOperationsQueries(n, edges, queries) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
  const depth = new Array(n).fill(0);
  const par = new Array(n).fill(-1);
  const cnt = Array.from({ length: n }, () => new Array(27).fill(0));
  const order = [0], seen = new Array(n).fill(false);
  seen[0] = true;
  for (let h = 0; h < order.length; h++) {              // 迭代 BFS 建樹
    const u = order[h];
    for (const [v, w] of adj[u]) {
      if (seen[v]) continue;
      seen[v] = true;
      depth[v] = depth[u] + 1;
      par[v] = u;
      for (let c = 1; c <= 26; c++) cnt[v][c] = cnt[u][c];
      cnt[v][w]++;
      order.push(v);
    }
  }
  const lca = (a, b) => {
    while (depth[a] > depth[b]) a = par[a];              // 深的先往上提
    while (depth[b] > depth[a]) b = par[b];
    while (a !== b) { a = par[a]; b = par[b]; }          // 一起往上跳到相遇
    return a;
  };
  return queries.map(([a, b]) => {
    const l = lca(a, b);
    const edgeCount = depth[a] + depth[b] - 2 * depth[l];
    let mx = 0;
    for (let w = 1; w <= 26; w++)
      mx = Math.max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
    return edgeCount - mx;
  });
}`,
        python: `def minOperationsQueries(n, edges, queries):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w)); adj[v].append((u, w))
    depth = [0] * n
    par = [-1] * n
    cnt = [[0] * 27 for _ in range(n)]
    order = [0]; seen = [False] * n; seen[0] = True
    h = 0
    while h < len(order):
        u = order[h]; h += 1
        for v, w in adj[u]:
            if seen[v]:
                continue
            seen[v] = True
            depth[v] = depth[u] + 1
            par[v] = u
            cnt[v] = cnt[u][:]
            cnt[v][w] += 1
            order.append(v)
    def lca(a, b):
        while depth[a] > depth[b]:
            a = par[a]
        while depth[b] > depth[a]:
            b = par[b]
        while a != b:
            a = par[a]; b = par[b]
        return a
    res = []
    for a, b in queries:
        l = lca(a, b)
        edge_count = depth[a] + depth[b] - 2 * depth[l]
        mx = 0
        for w in range(1, 27):
            mx = max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w])
        res.append(edge_count - mx)
    return res`,
        c: `int *minOperationsQueries(int n, int **edges, int edgesSize, int *edgesColSize,
                          int **queries, int queriesSize, int *queriesColSize, int *returnSize) {
    int *head = malloc(n * sizeof(int));
    int *nxt = malloc(2 * edgesSize * sizeof(int));
    int *to = malloc(2 * edgesSize * sizeof(int));
    int *wt = malloc(2 * edgesSize * sizeof(int));
    for (int i = 0; i < n; i++) head[i] = -1;
    int ec = 0;
    for (int i = 0; i < edgesSize; i++) {
        int u = edges[i][0], v = edges[i][1], w = edges[i][2];
        to[ec] = v; wt[ec] = w; nxt[ec] = head[u]; head[u] = ec++;
        to[ec] = u; wt[ec] = w; nxt[ec] = head[v]; head[v] = ec++;
    }
    int *depth = calloc(n, sizeof(int)), *par = malloc(n * sizeof(int));
    int (*cnt)[27] = calloc(n, sizeof(*cnt));
    int *order = malloc(n * sizeof(int)), *seen = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) par[i] = -1;
    int os = 0; order[os++] = 0; seen[0] = 1;
    for (int h = 0; h < os; h++) {
        int u = order[h];
        for (int e = head[u]; e != -1; e = nxt[e]) {
            int v = to[e], w = wt[e];
            if (seen[v]) continue;
            seen[v] = 1; depth[v] = depth[u] + 1; par[v] = u;
            for (int c = 1; c <= 26; c++) cnt[v][c] = cnt[u][c];
            cnt[v][w]++; order[os++] = v;
        }
    }
    int *res = malloc(queriesSize * sizeof(int));
    for (int q = 0; q < queriesSize; q++) {
        int a = queries[q][0], b = queries[q][1], x = a, y = b;
        while (depth[x] > depth[y]) x = par[x];
        while (depth[y] > depth[x]) y = par[y];
        while (x != y) { x = par[x]; y = par[y]; }
        int l = x, edgeCount = depth[a] + depth[b] - 2 * depth[l], mx = 0;
        for (int w = 1; w <= 26; w++) {
            int c = cnt[a][w] + cnt[b][w] - 2 * cnt[l][w];
            if (c > mx) mx = c;
        }
        res[q] = edgeCount - mx;
    }
    *returnSize = queriesSize;
    free(head); free(nxt); free(to); free(wt);
    free(depth); free(par); free(cnt); free(order); free(seen);
    return res;
}`,
        cpp: `vector<int> minOperationsQueries(int n, vector<vector<int>>& edges, vector<vector<int>>& queries) {
    vector<vector<pair<int,int>>> adj(n);
    for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
    vector<int> depth(n, 0), par(n, -1);
    vector<array<int,27>> cnt(n);
    for (auto& c : cnt) c.fill(0);
    vector<int> order = {0}, seen(n, 0);
    seen[0] = 1;
    for (int h = 0; h < (int)order.size(); h++) {
        int u = order[h];
        for (auto& [v, w] : adj[u]) {
            if (seen[v]) continue;
            seen[v] = 1; depth[v] = depth[u] + 1; par[v] = u;
            cnt[v] = cnt[u]; cnt[v][w]++;
            order.push_back(v);
        }
    }
    auto lca = [&](int a, int b) {
        while (depth[a] > depth[b]) a = par[a];
        while (depth[b] > depth[a]) b = par[b];
        while (a != b) { a = par[a]; b = par[b]; }
        return a;
    };
    vector<int> res;
    for (auto& q : queries) {
        int a = q[0], b = q[1], l = lca(a, b);
        int edgeCount = depth[a] + depth[b] - 2 * depth[l], mx = 0;
        for (int w = 1; w <= 26; w++)
            mx = max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
        res.push_back(edgeCount - mx);
    }
    return res;
}`,
        java: `int[] minOperationsQueries(int n, int[][] edges, int[][] queries) {
    List<int[]>[] adj = new List[n];
    for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();
    for (int[] e : edges) { adj[e[0]].add(new int[]{e[1], e[2]}); adj[e[1]].add(new int[]{e[0], e[2]}); }
    int[] depth = new int[n], par = new int[n];
    Arrays.fill(par, -1);
    int[][] cnt = new int[n][27];
    int[] order = new int[n];
    boolean[] seen = new boolean[n];
    int os = 0; order[os++] = 0; seen[0] = true;
    for (int h = 0; h < os; h++) {
        int u = order[h];
        for (int[] e : adj[u]) {
            int v = e[0], w = e[1];
            if (seen[v]) continue;
            seen[v] = true; depth[v] = depth[u] + 1; par[v] = u;
            cnt[v] = cnt[u].clone(); cnt[v][w]++;
            order[os++] = v;
        }
    }
    int[] res = new int[queries.length];
    for (int q = 0; q < queries.length; q++) {
        int a = queries[q][0], b = queries[q][1], x = a, y = b;
        while (depth[x] > depth[y]) x = par[x];
        while (depth[y] > depth[x]) y = par[y];
        while (x != y) { x = par[x]; y = par[y]; }
        int l = x, edgeCount = depth[a] + depth[b] - 2 * depth[l], mx = 0;
        for (int w = 1; w <= 26; w++)
            mx = Math.max(mx, cnt[a][w] + cnt[b][w] - 2 * cnt[l][w]);
        res[q] = edgeCount - mx;
    }
    return res;
}`,
      },
    },
  ],
  pitfalls: [
    '權重只有 1~26,計數陣列開長度 27(索引 0 不用)就夠;別開到 1e4 浪費記憶體',
    'n 可達 1e4,用遞迴 DFS 建樹在退化成長鏈時會爆堆疊 → 改用迭代 BFS',
    '`a == b` 時路徑沒有邊,邊數 0、眾數 0,答案 0,公式自然成立不必特判',
    '路徑權重次數用 `cnt[a]+cnt[b]−2·cnt[lca]`,係數是 2(lca 以上的部分在 a、b 各算了一次要全扣掉)',
  ],
  check: {
    kind: 'fn',
    fn: 'minOperationsQueries',
    cases: [
      { args: [7, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 2], [5, 6, 2]], [[0, 3], [3, 6], [2, 6], [0, 6]]], out: [0, 0, 1, 3] },
      { args: [4, [[0, 1, 6], [1, 2, 1], [1, 3, 2]], [[0, 1], [1, 2], [0, 3], [3, 3]]], out: [0, 0, 1, 0] },
      { args: [3, [[0, 1, 5], [1, 2, 5]], [[0, 2], [1, 2]]], out: [0, 0] },
    ],
  },
}
