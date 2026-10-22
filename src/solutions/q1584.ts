import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1584. Min Cost to Connect All Points

const P = [
  [0, 0],
  [2, 2],
  [3, 10],
  [5, 2],
  [7, 0],
]
const N = P.length
const D = (i: number, j: number) => Math.abs(P[i][0] - P[j][0]) + Math.abs(P[i][1] - P[j][1])
const POS = Object.fromEntries(P.map(([x, y], i) => [i, { x: x * 0.55, y: (10 - y) * 0.35 }]))

function primFig(): FigStep[] {
  const inT = Array(N).fill(false)
  const dist = Array(N).fill(Infinity)
  const from = Array(N).fill(-1)
  dist[0] = 0
  const tree: number[][] = []
  let total = 0
  const subs = () => Object.fromEntries(dist.map((d, i) => [i, inT[i] ? '✓' : d === Infinity ? '∞' : `距離 ${d}`]))
  const out: FigStep[] = [{ note: '兩點的距離是 |x1−x2| + |y1−y2|(曼哈頓距離)。Prim:從任一點開始長一棵樹,每次把「離這棵樹最近」的點接進來。dist[i] = 點 i 到樹的最近距離', views: [graphView(N, [], { pos: POS, subs: subs() })] }]
  for (let it = 0; it < N; it++) {
    let u = -1
    for (let i = 0; i < N; i++) if (!inT[i] && (u < 0 || dist[i] < dist[u])) u = i
    inT[u] = true
    total += dist[u]
    if (from[u] >= 0) tree.push([from[u], u, dist[u]])
    for (let v = 0; v < N; v++)
      if (!inT[v] && D(u, v) < dist[v]) {
        dist[v] = D(u, v)
        from[v] = u
      }
    out.push({ note: it === 0 ? `從點 0 開始。更新其他點到樹的距離` : `樹外最近的是點 ${u}(距離 ${tree[tree.length - 1][2]})→ 接進來,總花費 ${total}。再用它更新其他點的距離`, views: [graphView(N, tree, { pos: POS, subs: subs(), cls: { ...Object.fromEntries(inT.flatMap((b, i) => (b ? [[i, 'done']] : []))), [u]: 'hl' }, edgeCls: { [tree.length - 1]: 'hl' } })] })
  }
  out.push({ note: `所有點都接上了,總花費 ${total}`, views: [graphView(N, tree, { pos: POS, cls: Object.fromEntries(P.map((_, i) => [i, 'done'])) })] })
  return out
}

function kruskalFig(): FigStep[] {
  const edges: number[][] = []
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) edges.push([i, j, D(i, j)])
  edges.sort((a, b) => a[2] - b[2])
  const parent = Array.from({ length: N }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const tree: number[][] = []
  let total = 0
  const out: FigStep[] = [{ note: `Kruskal:列出所有點對的距離(共 ${edges.length} 條邊),由短到長看。兩端還不連通就接上(用並查集判斷),已經連通就跳過(會形成環)`, views: [arr(edges.map(([a, b, w]) => `${a}-${b}:${w}`), { label: '所有邊(由短到長)' })] }]
  for (let k = 0; k < edges.length && tree.length < N - 1; k++) {
    const [a, b, w] = edges[k]
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) {
      out.push({ note: `${a}-${b}(${w}):兩點已經連通 → 跳過`, views: [graphView(N, [...tree, [a, b, w]], { pos: POS, edgeCls: { [tree.length]: 'dim' } }), arr(edges.map(([x, y, z]) => `${x}-${y}:${z}`), { label: '所有邊', compare: [k] })] })
      continue
    }
    parent[ra] = rb
    tree.push([a, b, w])
    total += w
    out.push({ note: `${a}-${b}(${w}):還不連通 → 接上,總花費 ${total}`, views: [graphView(N, tree, { pos: POS, edgeCls: { [tree.length - 1]: 'hl' } }), arr(edges.map(([x, y, z]) => `${x}-${y}:${z}`), { label: '所有邊', highlight: [k] })] })
  }
  out.push({ note: `接了 n − 1 = ${N - 1} 條邊就完成,總花費 ${total}`, views: [graphView(N, tree, { pos: POS })] })
  return out
}

export const q1584: Solution = {
  id: 1584,
  plain: '平面上有一些點,要用線把它們**全部連起來**(任兩點之間都能透過線走到),每條線的費用是兩點的曼哈頓距離。最少要花多少錢?這就是「最小生成樹」。',
  statement: '`points[i] = [x, y]`。連接兩點的費用是曼哈頓距離 `|x1 − x2| + |y1 − y2|`。回傳讓所有點都連通的最小總費用(任兩點之間恰好一條路徑)。',
  examples: [
    { input: 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]', output: '20' },
    { input: 'points = [[3,12],[-2,5],[-4,1]]', output: '18' },
  ],
  constraints: ['`1 ≤ n ≤ 1000` → 任兩點都能連,共 n(n−1)/2 ≈ 50 萬條邊(完全圖)'],
  insight: [
    '把所有點連通、總花費最小 → **最小生成樹(MST)**:n 個點、n − 1 條邊、沒有環',
    'Kruskal:所有邊由短到長,能接(不形成環)就接,用並查集判斷 → O(E log E),這題 E ≈ 50 萬',
    'Prim:從一點開始長樹,每次接「離樹最近的點」。完全圖時用陣列版 O(n²) 最快,不需要真的列出所有邊',
    '兩個做法都基於同一個事實:「跨越任一切分的最短邊,一定在某棵 MST 裡」',
  ],
  approaches: [
    {
      name: 'Kruskal + 並查集',
      idea: '列出所有點對的邊並排序。由短到長:兩端不同組 → 接上、合併、加總;接滿 n − 1 條就停。',
      steps: ['產生所有 `(距離, i, j)`,排序', '並查集初始化', '依序看每條邊:`find(i) != find(j)` → union、`total += 距離`', '接了 n − 1 條就結束'],
      figure: { title: `points = ${JSON.stringify(P)}`, steps: kruskalFig() },
      complexity: { time: 'O(n² log n)', space: 'O(n²)', why: '邊數 n²/2,排序 O(n² log n²) = O(n² log n),要把所有邊存下來。' },
      verdict: 'MST 最直觀的演算法,邊數少的圖(稀疏圖)首選。這題是完全圖,邊太多,比 Prim 慢。',
      code: {
        python: `def minCostConnectPoints(points):
    n = len(points)
    edges = sorted(
        (abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j)
        for i in range(n) for j in range(i + 1, n))
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = used = 0
    for w, i, j in edges:
        a, b = find(i), find(j)
        if a != b:                        # 不會形成環 → 接上
            parent[a] = b
            total += w
            used += 1
            if used == n - 1:
                break
    return total`,
        c: `typedef struct { int w, a, b; } Edge;
static int byW(const void *x, const void *y) { return ((const Edge *)x)->w - ((const Edge *)y)->w; }
static int *P;
static int find(int x) { while (P[x] != x) { P[x] = P[P[x]]; x = P[x]; } return x; }

int minCostConnectPoints(int **points, int pointsSize, int *pointsColSize) {
    int n = pointsSize, m = 0;
    Edge *e = malloc((long long)n * (n - 1) / 2 * sizeof(Edge) + sizeof(Edge));
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            e[m++] = (Edge){abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j};
    qsort(e, m, sizeof(Edge), byW);
    P = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) P[i] = i;
    int total = 0, used = 0;
    for (int k = 0; k < m && used < n - 1; k++) {
        int a = find(e[k].a), b = find(e[k].b);
        if (a != b) { P[a] = b; total += e[k].w; used++; }
    }
    free(e); free(P);
    return total;
}`,
        cpp: `int minCostConnectPoints(vector<vector<int>>& points) {
    int n = points.size();
    vector<array<int, 3>> e;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            e.push_back({abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j});
    sort(e.begin(), e.end());
    vector<int> parent(n);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); };
    int total = 0, used = 0;
    for (auto& [w, i, j] : e) {
        int a = find(i), b = find(j);
        if (a != b) { parent[a] = b; total += w; if (++used == n - 1) break; }
    }
    return total;
}`,
        java: `private int[] parent;
private int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

int minCostConnectPoints(int[][] points) {
    int n = points.length;
    List<int[]> e = new ArrayList<>();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            e.add(new int[]{Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), i, j});
    e.sort((a, b) -> a[0] - b[0]);
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0, used = 0;
    for (int[] x : e) {
        int a = find(x[1]), b = find(x[2]);
        if (a != b) { parent[a] = b; total += x[0]; if (++used == n - 1) break; }
    }
    return total;
}`,
        javascript: `function minCostConnectPoints(points) {
  const n = points.length, e = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      e.push([Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), i, j]);
  e.sort((a, b) => a[0] - b[0]);
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  let total = 0, used = 0;
  for (const [w, i, j] of e) {
    if (used === n - 1) break;
    const a = find(i), b = find(j);
    if (a !== b) {
      parent[a] = b;
      total += w;
      used++;
    }
  }
  return total;
}`,
      },
    },
    {
      name: 'Prim(陣列版,O(n²))',
      idea: '`dist[i]` = 點 i 到目前這棵樹的最近距離。每次挑樹外 dist 最小的點加進樹,總和加上它的 dist,再用它更新其他點的 dist。',
      steps: ['`dist = [∞] * n`,`dist[0] = 0`', '重複 n 次:挑 `inTree` 為 False 且 dist 最小的 u', '`inTree[u] = True`、`total += dist[u]`', '對每個樹外的 v:`dist[v] = min(dist[v], d(u, v))`'],
      figure: { title: `points = ${JSON.stringify(P)}`, steps: primFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'n 輪,每輪 O(n) 挑最小 + O(n) 更新。不用把 n² 條邊存起來。' },
      verdict: '完全圖(邊數 ≈ n²)的最佳解。[[p:mst]]兩大演算法:稀疏圖用 Kruskal,稠密圖用陣列版 Prim。',
      code: {
        python: `def minCostConnectPoints(points):
    n = len(points)
    in_tree = [False] * n
    dist = [float('inf')] * n             # 到目前這棵樹的最近距離
    dist[0] = 0
    total = 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_tree[i]), key=lambda i: dist[i])
        in_tree[u] = True
        total += dist[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                dist[v] = min(dist[v], d)
    return total`,
        c: `int minCostConnectPoints(int **points, int pointsSize, int *pointsColSize) {
    int n = pointsSize, total = 0;
    int *dist = malloc(n * sizeof(int));
    bool *in = calloc(n, sizeof(bool));
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[0] = 0;
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int i = 0; i < n; i++) if (!in[i] && (u < 0 || dist[i] < dist[u])) u = i;
        in[u] = true;
        total += dist[u];
        for (int v = 0; v < n; v++) {
            if (in[v]) continue;
            int d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
            if (d < dist[v]) dist[v] = d;
        }
    }
    free(dist); free(in);
    return total;
}`,
        cpp: `int minCostConnectPoints(vector<vector<int>>& points) {
    int n = points.size(), total = 0;
    vector<int> dist(n, INT_MAX);
    vector<bool> in(n, false);
    dist[0] = 0;
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int i = 0; i < n; i++) if (!in[i] && (u < 0 || dist[i] < dist[u])) u = i;
        in[u] = true;
        total += dist[u];
        for (int v = 0; v < n; v++)
            if (!in[v]) dist[v] = min(dist[v], abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]));
    }
    return total;
}`,
        java: `int minCostConnectPoints(int[][] points) {
    int n = points.length, total = 0;
    int[] dist = new int[n];
    boolean[] in = new boolean[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[0] = 0;
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int i = 0; i < n; i++) if (!in[i] && (u < 0 || dist[i] < dist[u])) u = i;
        in[u] = true;
        total += dist[u];
        for (int v = 0; v < n; v++)
            if (!in[v]) dist[v] = Math.min(dist[v], Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]));
    }
    return total;
}`,
        javascript: `function minCostConnectPoints(points) {
  const n = points.length;
  const dist = new Array(n).fill(Infinity), inT = new Array(n).fill(false);
  dist[0] = 0;
  let total = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!inT[i] && (u < 0 || dist[i] < dist[u])) u = i;
    inT[u] = true;
    total += dist[u];
    for (let v = 0; v < n; v++)
      if (!inT[v]) dist[v] = Math.min(dist[v], Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]));
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: [
    '把題目當成最短路(Dijkstra):最短路是「從起點到每個點」最短,MST 是「整體連起來」總和最小,答案不同',
    'Kruskal 沒有判斷環就全部接上:會多接,總和變大',
    '只有一個點時答案是 0',
  ],
  followUp: [{ q: '如果有些邊已經連好了(免費)?', a: '把那些邊先 union,再跑 Kruskal(1135、1168 類型)。' }],
  check: {
    kind: 'fn',
    fn: 'minCostConnectPoints',
    cases: [
      { args: [P], out: 20 },
      { args: [[[3, 12], [-2, 5], [-4, 1]]], out: 18 },
      { args: [[[0, 0]]], out: 0 },
      { args: [[[0, 0], [1, 1], [1, 0], [-1, 1]]], out: 4 },
    ],
  },
}
