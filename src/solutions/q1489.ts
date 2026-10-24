import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1489. Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree

const N = 5
const E = [[0, 1, 1], [1, 2, 1], [2, 3, 2], [0, 3, 2], [0, 4, 3], [3, 4, 3], [1, 4, 6]]
const POS = { 0: { x: 0, y: 0 }, 1: { x: 2, y: 0 }, 2: { x: 2, y: 2 }, 3: { x: 0, y: 2 }, 4: { x: -1.5, y: 1 } }

function bruteFig(): FigStep[] {
  return [
    { note: '最小生成樹(MST)可能不只一棵。**關鍵邊**:拿掉它,MST 權重會變大(或圖不連通);**偽關鍵邊**:不是關鍵,但出現在某一棵 MST 裡', views: [graphView(N, E, { pos: POS })] },
    { note: '先用 Kruskal 算出 MST 權重 base = 1 + 1 + 2 + 3 = 7', views: [graphView(N, E, { pos: POS, edgeCls: { 0: 'done', 1: 'done', 2: 'done', 4: 'done' } })] },
    { note: '對每條邊 e:① 不准用 e 跑 Kruskal,權重 > base → 關鍵;② 否則強制先放 e 再跑,權重仍 = base → 偽關鍵', views: [arr(['邊 0:拿掉後 MST = 8 → 關鍵', '邊 1:拿掉後 = 8 → 關鍵', '邊 2、3、4、5:可替換 → 偽關鍵', '邊 6:強制放入後 > 7 → 都不是'], { label: '逐邊檢查' })] },
    { note: '答案 [[0, 1], [2, 3, 4, 5]]', views: [arr(['[0, 1]', '[2, 3, 4, 5]'], { label: '關鍵 / 偽關鍵', done: [0, 1] })] },
  ]
}

function bridgeFig(): FigStep[] {
  return [
    { note: '更快的作法:依權重分組處理。處理某一組權重 w 時,把前面(更輕)的邊合併後的連通塊縮成一個點', views: [graphView(N, E, { pos: POS, edgeCls: { 0: 'done', 1: 'done' } })] },
    { note: '這組裡連接「同一塊」的邊一定用不到;其餘的邊在縮點後的圖上:是**橋** → 關鍵(非它不可),不是橋 → 偽關鍵(有替代)', views: [arr(['權重 2:{0,1,2} 與 {3} 之間有邊 2、3 → 不是橋 → 偽關鍵', '權重 3:{0,1,2,3} 與 {4} 之間有邊 4、5 → 偽關鍵'], { label: '分組判斷' })] },
  ]
}

export const q1489: Solution = {
  id: 1489,
  plain: '一張帶權重的連通無向圖,最小生成樹可能有好幾種。找出「每棵最小生成樹都一定要用」的邊(關鍵邊),以及「有些最小生成樹會用、但不是非用不可」的邊(偽關鍵邊)。',
  statement: '給 n 個點的帶權無向連通圖,`edges[i] = [a, b, weight]`。**關鍵邊**:刪除後 MST 權重變大的邊;**偽關鍵邊**:可以出現在某棵 MST 中、但不是關鍵邊的邊。回傳 `[關鍵邊索引列表, 偽關鍵邊索引列表]`(各自遞增排列)。',
  examples: [
    { input: 'n = 5, edges = [[0,1,1],[1,2,1],[2,3,2],[0,3,2],[0,4,3],[3,4,3],[1,4,6]]', output: '[[0,1],[2,3,4,5]]' },
    { input: 'n = 4, edges = [[0,1,1],[1,2,1],[2,3,1],[0,3,1]]', output: '[[],[0,1,2,3]]', note: '四條邊任選三條都是 MST' },
  ],
  constraints: ['n ≤ 100,邊數 ≤ 200'],
  insight: ['[[p:mst]]:Kruskal + [[p:union-find]]', '關鍵 ⇔ 拿掉它 MST 變重;偽關鍵 ⇔ 強制加入它 MST 不變重', '規模小,對每條邊各跑兩次 Kruskal 就夠'],
  approaches: [
    {
      name: '每條邊跑兩次 Kruskal',
      idea: '`mst(skip, force)`:先放 force 邊,再依權重 Kruskal(跳過 skip);不連通回傳 ∞。對每條 e:`mst(skip=e) > base` → 關鍵;否則 `mst(force=e) == base` → 偽關鍵。',
      steps: ['邊依權重排序(保留原索引)', '`base = mst()`', '`mst(skip=e) > base` → 關鍵', '否則 `mst(force=e) == base` → 偽關鍵'],
      figure: { title: `n = ${N}`, steps: bruteFig() },
      complexity: { time: 'O(E² · α(n))', space: 'O(n + E)', why: '每條邊兩次 Kruskal,每次 O(E · α)。' },
      verdict: '最推薦,直接照定義做;E ≤ 200 時完全夠快。',
      code: {
        python: `def findCriticalAndPseudoCriticalEdges(n, edges):
    order = sorted(range(len(edges)), key=lambda i: edges[i][2])

    def mst(skip=-1, force=-1):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        total, cnt = 0, 0
        if force >= 0:
            a, b, w = edges[force]
            parent[find(a)] = find(b)         # 強制先放這條
            total, cnt = w, 1
        for i in order:
            if i == skip or i == force:
                continue
            a, b, w = edges[i]
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
                total += w
                cnt += 1
        return total if cnt == n - 1 else float('inf')

    base = mst()
    critical, pseudo = [], []
    for i in range(len(edges)):
        if mst(skip=i) > base:
            critical.append(i)                # 少了它就變貴(或不連通)
        elif mst(force=i) == base:
            pseudo.append(i)                  # 放了它也還是最小
    return [critical, pseudo]`,
        c: `static int *par, N, M, **Ed, *ord;

static int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

static int cmpW(const void *a, const void *b) { return Ed[*(int *)a][2] - Ed[*(int *)b][2]; }

static int mst(int skip, int force) {
    for (int i = 0; i < N; i++) par[i] = i;
    int total = 0, cnt = 0;
    if (force >= 0) { par[find(Ed[force][0])] = find(Ed[force][1]); total = Ed[force][2]; cnt = 1; }
    for (int k = 0; k < M; k++) {
        int i = ord[k];
        if (i == skip || i == force) continue;
        int ra = find(Ed[i][0]), rb = find(Ed[i][1]);
        if (ra != rb) { par[ra] = rb; total += Ed[i][2]; cnt++; }
    }
    return cnt == N - 1 ? total : INT_MAX;
}

int **findCriticalAndPseudoCriticalEdges(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize, int **returnColumnSizes) {
    N = n; M = edgesSize; Ed = edges;
    par = malloc(n * sizeof(int)); ord = malloc(M * sizeof(int));
    for (int i = 0; i < M; i++) ord[i] = i;
    qsort(ord, M, sizeof(int), cmpW);
    int base = mst(-1, -1);
    int **res = malloc(2 * sizeof(int *));
    res[0] = malloc((M + 1) * sizeof(int)); res[1] = malloc((M + 1) * sizeof(int));
    int *cols = calloc(2, sizeof(int));
    for (int i = 0; i < M; i++) {
        if (mst(i, -1) > base) res[0][cols[0]++] = i;
        else if (mst(-1, i) == base) res[1][cols[1]++] = i;
    }
    free(par); free(ord);
    *returnSize = 2;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> findCriticalAndPseudoCriticalEdges(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<int> order(m);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return edges[a][2] < edges[b][2]; });
    auto mst = [&](int skip, int force) {
        vector<int> par(n);
        iota(par.begin(), par.end(), 0);
        function<int(int)> find = [&](int x) { return par[x] == x ? x : par[x] = find(par[x]); };
        int total = 0, cnt = 0;
        if (force >= 0) { par[find(edges[force][0])] = find(edges[force][1]); total = edges[force][2]; cnt = 1; }
        for (int i : order) {
            if (i == skip || i == force) continue;
            int ra = find(edges[i][0]), rb = find(edges[i][1]);
            if (ra != rb) { par[ra] = rb; total += edges[i][2]; cnt++; }
        }
        return cnt == n - 1 ? total : INT_MAX;
    };
    int base = mst(-1, -1);
    vector<vector<int>> res(2);
    for (int i = 0; i < m; i++) {
        if (mst(i, -1) > base) res[0].push_back(i);
        else if (mst(-1, i) == base) res[1].push_back(i);
    }
    return res;
}`,
        java: `int[] par;

int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

int mst(int n, int[][] edges, Integer[] order, int skip, int force) {
    par = new int[n];
    for (int i = 0; i < n; i++) par[i] = i;
    int total = 0, cnt = 0;
    if (force >= 0) { par[find(edges[force][0])] = find(edges[force][1]); total = edges[force][2]; cnt = 1; }
    for (int i : order) {
        if (i == skip || i == force) continue;
        int ra = find(edges[i][0]), rb = find(edges[i][1]);
        if (ra != rb) { par[ra] = rb; total += edges[i][2]; cnt++; }
    }
    return cnt == n - 1 ? total : Integer.MAX_VALUE;
}

List<List<Integer>> findCriticalAndPseudoCriticalEdges(int n, int[][] edges) {
    int m = edges.length;
    Integer[] order = new Integer[m];
    for (int i = 0; i < m; i++) order[i] = i;
    Arrays.sort(order, (a, b) -> edges[a][2] - edges[b][2]);
    int base = mst(n, edges, order, -1, -1);
    List<Integer> critical = new ArrayList<>(), pseudo = new ArrayList<>();
    for (int i = 0; i < m; i++) {
        if (mst(n, edges, order, i, -1) > base) critical.add(i);
        else if (mst(n, edges, order, -1, i) == base) pseudo.add(i);
    }
    return List.of(critical, pseudo);
}`,
        javascript: `function findCriticalAndPseudoCriticalEdges(n, edges) {
  const m = edges.length, order = [...edges.keys()].sort((a, b) => edges[a][2] - edges[b][2]);
  const mst = (skip, force) => {
    const par = Array.from({ length: n }, (_, i) => i);
    const find = (x) => {
      while (par[x] !== x) {
        par[x] = par[par[x]];
        x = par[x];
      }
      return x;
    };
    let total = 0, cnt = 0;
    if (force >= 0) {
      par[find(edges[force][0])] = find(edges[force][1]);
      total = edges[force][2];
      cnt = 1;
    }
    for (const i of order) {
      if (i === skip || i === force) continue;
      const ra = find(edges[i][0]), rb = find(edges[i][1]);
      if (ra !== rb) {
        par[ra] = rb;
        total += edges[i][2];
        cnt++;
      }
    }
    return cnt === n - 1 ? total : Infinity;
  };
  const base = mst(-1, -1), critical = [], pseudo = [];
  for (let i = 0; i < m; i++) {
    if (mst(i, -1) > base) critical.push(i);
    else if (mst(-1, i) === base) pseudo.push(i);
  }
  return [critical, pseudo];
}`,
      },
    },
    {
      name: '依權重分組 + 找橋',
      idea: '邊依權重分組;處理一組時,用併查集把較輕邊已連起來的點縮成塊。組內連接不同塊的邊,在「塊的多重圖」上是橋 → 關鍵,否則 → 偽關鍵。處理完再把整組合併。',
      steps: ['依權重排序並分組', '組內每條邊:`a, b = find(u), find(v)`;相同 → 不在任何 MST', '其餘邊在塊圖上跑 Tarjan 找橋(用邊編號處理重邊)', '橋 → 關鍵、非橋 → 偽關鍵;最後 union 整組'],
      figure: { title: `n = ${N}`, steps: bridgeFig() },
      complexity: { time: 'O(E log E + E · α(n))', space: 'O(n + E)', why: '排序之後每條邊只在自己那組處理一次。' },
      verdict: '進階解:看懂「同權重的邊何時可以互相替換」,並把它轉成找橋(1192. Critical Connections in a Network)。',
      code: {
        python: `import sys

def findCriticalAndPseudoCriticalEdges(n, edges):
    sys.setrecursionlimit(10000)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    order = sorted(range(len(edges)), key=lambda i: edges[i][2])
    critical, pseudo = [], []
    i = 0
    while i < len(order):
        j = i
        while j < len(order) and edges[order[j]][2] == edges[order[i]][2]:
            j += 1
        group = order[i:j]
        adj = {}
        for e in group:                       # 塊之間的多重圖
            a, b = find(edges[e][0]), find(edges[e][1])
            if a != b:
                adj.setdefault(a, []).append((b, e))
                adj.setdefault(b, []).append((a, e))
        disc, low, timer = {}, {}, [0]
        bridges = set()

        def dfs(u, pe):
            timer[0] += 1
            disc[u] = low[u] = timer[0]
            for v, e in adj[u]:
                if e == pe:
                    continue
                if v not in disc:
                    dfs(v, e)
                    low[u] = min(low[u], low[v])
                    if low[v] > disc[u]:
                        bridges.add(e)        # 這條邊是唯一的連接 → 關鍵
                else:
                    low[u] = min(low[u], disc[v])

        for u in adj:
            if u not in disc:
                dfs(u, -1)
        for e in group:
            if find(edges[e][0]) != find(edges[e][1]):
                (critical if e in bridges else pseudo).append(e)
        for e in group:
            parent[find(edges[e][0])] = find(edges[e][1])
        i = j
    return [sorted(critical), sorted(pseudo)]`,
        c: `static int *par, **Ed, *ord, *disc, *low, timer_;
static int head[100], nxt[400], to_[400], eid[400], ne;
static bool *isBridge;

static int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

static int cmpW(const void *a, const void *b) { return Ed[*(int *)a][2] - Ed[*(int *)b][2]; }

static void dfs(int u, int pe) {
    disc[u] = low[u] = ++timer_;
    for (int k = head[u]; k != -1; k = nxt[k]) {
        int v = to_[k], e = eid[k];
        if (e == pe) continue;
        if (!disc[v]) {
            dfs(v, e);
            if (low[v] < low[u]) low[u] = low[v];
            if (low[v] > disc[u]) isBridge[e] = true;
        } else if (disc[v] < low[u]) low[u] = disc[v];
    }
}

int **findCriticalAndPseudoCriticalEdges(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize, int **returnColumnSizes) {
    int m = edgesSize;
    Ed = edges;
    par = malloc(n * sizeof(int)); ord = malloc(m * sizeof(int));
    disc = calloc(n, sizeof(int)); low = malloc(n * sizeof(int)); isBridge = calloc(m, sizeof(bool));
    for (int i = 0; i < n; i++) par[i] = i;
    for (int i = 0; i < m; i++) ord[i] = i;
    qsort(ord, m, sizeof(int), cmpW);
    char *kind = calloc(m, 1);                // 1 = 關鍵、2 = 偽關鍵
    for (int i = 0; i < m;) {
        int j = i;
        while (j < m && Ed[ord[j]][2] == Ed[ord[i]][2]) j++;
        ne = 0;
        for (int k = i; k < j; k++) { int e = ord[k]; head[find(Ed[e][0])] = head[find(Ed[e][1])] = -1; }
        for (int k = i; k < j; k++) {
            int e = ord[k], a = find(Ed[e][0]), b = find(Ed[e][1]);
            if (a == b) continue;
            to_[ne] = b; eid[ne] = e; nxt[ne] = head[a]; head[a] = ne++;
            to_[ne] = a; eid[ne] = e; nxt[ne] = head[b]; head[b] = ne++;
        }
        for (int k = i; k < j; k++) { int e = ord[k]; disc[find(Ed[e][0])] = disc[find(Ed[e][1])] = 0; }
        timer_ = 0;
        for (int k = i; k < j; k++) {
            int e = ord[k], a = find(Ed[e][0]), b = find(Ed[e][1]);
            if (a != b && !disc[a]) dfs(a, -1);
        }
        for (int k = i; k < j; k++) {
            int e = ord[k];
            if (find(Ed[e][0]) != find(Ed[e][1])) kind[e] = isBridge[e] ? 1 : 2;
        }
        for (int k = i; k < j; k++) { int e = ord[k]; par[find(Ed[e][0])] = find(Ed[e][1]); }
        i = j;
    }
    int **res = malloc(2 * sizeof(int *));
    res[0] = malloc((m + 1) * sizeof(int)); res[1] = malloc((m + 1) * sizeof(int));
    int *cols = calloc(2, sizeof(int));
    for (int e = 0; e < m; e++) if (kind[e]) { int t = kind[e] - 1; res[t][cols[t]++] = e; }
    free(par); free(ord); free(disc); free(low); free(isBridge); free(kind);
    *returnSize = 2;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> findCriticalAndPseudoCriticalEdges(int n, vector<vector<int>>& edges) {
    int m = edges.size();
    vector<int> par(n), order(m), kind(m, 0);
    iota(par.begin(), par.end(), 0);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return edges[a][2] < edges[b][2]; });
    function<int(int)> find = [&](int x) { return par[x] == x ? x : par[x] = find(par[x]); };
    for (int i = 0; i < m;) {
        int j = i;
        while (j < m && edges[order[j]][2] == edges[order[i]][2]) j++;
        map<int, vector<pair<int, int>>> adj;
        for (int k = i; k < j; k++) {
            int e = order[k], a = find(edges[e][0]), b = find(edges[e][1]);
            if (a == b) continue;
            adj[a].push_back({b, e});
            adj[b].push_back({a, e});
        }
        map<int, int> disc, low;
        set<int> bridges;
        int timer = 0;
        function<void(int, int)> dfs = [&](int u, int pe) {
            disc[u] = low[u] = ++timer;
            for (auto [v, e] : adj[u]) {
                if (e == pe) continue;
                if (!disc.count(v)) {
                    dfs(v, e);
                    low[u] = min(low[u], low[v]);
                    if (low[v] > disc[u]) bridges.insert(e);
                } else low[u] = min(low[u], disc[v]);
            }
        };
        for (auto &[u, _] : adj) if (!disc.count(u)) dfs(u, -1);
        for (int k = i; k < j; k++) {
            int e = order[k];
            if (find(edges[e][0]) != find(edges[e][1])) kind[e] = bridges.count(e) ? 1 : 2;
        }
        for (int k = i; k < j; k++) { int e = order[k]; par[find(edges[e][0])] = find(edges[e][1]); }
        i = j;
    }
    vector<vector<int>> res(2);
    for (int e = 0; e < m; e++) if (kind[e]) res[kind[e] - 1].push_back(e);
    return res;
}`,
        java: `int[] par, disc, low;
int timer;
Map<Integer, List<int[]>> adj;
Set<Integer> bridges;

int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

void dfs(int u, int pe) {
    disc[u] = low[u] = ++timer;
    for (int[] ve : adj.get(u)) {
        int v = ve[0], e = ve[1];
        if (e == pe) continue;
        if (disc[v] == 0) {
            dfs(v, e);
            low[u] = Math.min(low[u], low[v]);
            if (low[v] > disc[u]) bridges.add(e);
        } else low[u] = Math.min(low[u], disc[v]);
    }
}

List<List<Integer>> findCriticalAndPseudoCriticalEdges(int n, int[][] edges) {
    int m = edges.length;
    par = new int[n];
    for (int i = 0; i < n; i++) par[i] = i;
    Integer[] order = new Integer[m];
    for (int i = 0; i < m; i++) order[i] = i;
    Arrays.sort(order, (a, b) -> edges[a][2] - edges[b][2]);
    int[] kind = new int[m];
    disc = new int[n];
    low = new int[n];
    for (int i = 0; i < m;) {
        int j = i;
        while (j < m && edges[order[j]][2] == edges[order[i]][2]) j++;
        adj = new HashMap<>();
        for (int k = i; k < j; k++) {
            int e = order[k], a = find(edges[e][0]), b = find(edges[e][1]);
            if (a == b) continue;
            adj.computeIfAbsent(a, z -> new ArrayList<>()).add(new int[]{b, e});
            adj.computeIfAbsent(b, z -> new ArrayList<>()).add(new int[]{a, e});
        }
        for (int u : adj.keySet()) disc[u] = 0;
        bridges = new HashSet<>();
        timer = 0;
        for (int u : adj.keySet()) if (disc[u] == 0) dfs(u, -1);
        for (int k = i; k < j; k++) {
            int e = order[k];
            if (find(edges[e][0]) != find(edges[e][1])) kind[e] = bridges.contains(e) ? 1 : 2;
        }
        for (int k = i; k < j; k++) { int e = order[k]; par[find(edges[e][0])] = find(edges[e][1]); }
        i = j;
    }
    List<Integer> critical = new ArrayList<>(), pseudo = new ArrayList<>();
    for (int e = 0; e < m; e++) {
        if (kind[e] == 1) critical.add(e);
        else if (kind[e] == 2) pseudo.add(e);
    }
    return List.of(critical, pseudo);
}`,
        javascript: `function findCriticalAndPseudoCriticalEdges(n, edges) {
  const m = edges.length, par = Array.from({ length: n }, (_, i) => i), kind = new Array(m).fill(0);
  const find = (x) => {
    while (par[x] !== x) {
      par[x] = par[par[x]];
      x = par[x];
    }
    return x;
  };
  const order = [...edges.keys()].sort((a, b) => edges[a][2] - edges[b][2]);
  for (let i = 0; i < m; ) {
    let j = i;
    while (j < m && edges[order[j]][2] === edges[order[i]][2]) j++;
    const adj = new Map();
    const add = (a, b, e) => {
      if (!adj.has(a)) adj.set(a, []);
      adj.get(a).push([b, e]);
    };
    for (let k = i; k < j; k++) {
      const e = order[k], a = find(edges[e][0]), b = find(edges[e][1]);
      if (a === b) continue;
      add(a, b, e);
      add(b, a, e);
    }
    const disc = new Map(), low = new Map(), bridges = new Set();
    let timer = 0;
    const dfs = (u, pe) => {
      disc.set(u, ++timer);
      low.set(u, timer);
      for (const [v, e] of adj.get(u)) {
        if (e === pe) continue;
        if (!disc.has(v)) {
          dfs(v, e);
          low.set(u, Math.min(low.get(u), low.get(v)));
          if (low.get(v) > disc.get(u)) bridges.add(e);
        } else low.set(u, Math.min(low.get(u), disc.get(v)));
      }
    };
    for (const u of adj.keys()) if (!disc.has(u)) dfs(u, -1);
    for (let k = i; k < j; k++) {
      const e = order[k];
      if (find(edges[e][0]) !== find(edges[e][1])) kind[e] = bridges.has(e) ? 1 : 2;
    }
    for (let k = i; k < j; k++) {
      const e = order[k];
      par[find(edges[e][0])] = find(edges[e][1]);
    }
    i = j;
  }
  const critical = [], pseudo = [];
  kind.forEach((t, e) => {
    if (t === 1) critical.push(e);
    else if (t === 2) pseudo.push(e);
  });
  return [critical, pseudo];
}`,
      },
    },
  ],
  pitfalls: ['只算一棵 MST 就判斷:同權重的邊可以互換,一棵 MST 看不出哪條「非用不可」', '偽關鍵判斷前沒先排除關鍵邊:關鍵邊強制加入也會等於 base', '「拿掉後不連通」也要算成關鍵'],
  check: {
    kind: 'fn',
    fn: 'findCriticalAndPseudoCriticalEdges',
    cases: [
      { args: [N, E], out: [[0, 1], [2, 3, 4, 5]] },
      { args: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 1]]], out: [[], [0, 1, 2, 3]] },
      { args: [3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]], out: [[0, 1], []] },
      { args: [4, [[0, 1, 1], [0, 1, 1], [1, 2, 2], [2, 3, 3]]], out: [[2, 3], [0, 1]] },
    ],
  },
}
