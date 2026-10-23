import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1514. Path with Maximum Probability

const E = [[0, 1], [1, 2], [0, 2]]
const P = [0.5, 0.5, 0.2]
const POS = { 0: { x: 0, y: 1 }, 1: { x: 1.5, y: 0 }, 2: { x: 3, y: 1 } }
const wEdges = E.map(([u, v], i) => [u, v, P[i]])

function dijkstraFig(): FigStep[] {
  return [
    { note: '每條邊有「成功機率」,路徑的機率 = 邊的機率**相乘**。求 start 到 end 的最大機率', views: [graphView(3, wEdges, { pos: POS, cls: { 0: 'hl', 2: 'hl' } })] },
    { note: '機率都在 [0, 1],越乘越小 → 和「距離越加越大」同樣有單調性,可以用 Dijkstra,只是改成**最大堆**、相乘', views: [arr(['prob[0] = 1'], { label: '起點' })] },
    { note: '彈出 0(1.0):更新 1 → 0.5、2 → 0.2。彈出 1(0.5):2 → max(0.2, 0.5 × 0.5) = 0.25', views: [graphView(3, wEdges, { pos: POS, cls: { 0: 'done', 1: 'done', 2: 'done' }, edgeCls: { 0: 'hl', 1: 'hl' } })] },
    { note: '彈出 2 = 終點 → 0.25。走 0 → 1 → 2 比直接 0 → 2 好', views: [arr([0.25], { label: '答案', done: [0] })] },
  ]
}

function bfFig(): FigStep[] {
  return [
    { note: 'Bellman–Ford 版:反覆掃描所有邊(無向,兩個方向都試),`prob[v] = max(prob[v], prob[u] × p)`', views: [arr([1, 0, 0], { label: 'prob 初始' })] },
    { note: '最多 n − 1 輪就會穩定;某一輪沒有任何更新就可以提早結束', views: [arr([1, 0.5, 0.25], { label: 'prob 最後', done: [2] })] },
  ]
}

export const q1514: Solution = {
  id: 1514,
  plain: '一張無向圖,每條路有一個「成功走過去的機率」。從起點走到終點,整條路的成功機率是每段機率相乘。最大能有多少?走不到就是 0。',
  statement: '無向圖 n 個點,`edges[i] = [a, b]` 的成功機率為 `succProb[i]`。回傳從 `start` 到 `end` 成功機率最大的路徑的機率;若無路徑回傳 0。答案誤差在 1e−5 內即可。',
  examples: [
    { input: 'n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start = 0, end = 2', output: '0.25' },
    { input: 'n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.3], start = 0, end = 2', output: '0.3' },
    { input: 'n = 3, edges = [[0,1]], succProb = [0.5], start = 0, end = 2', output: '0' },
  ],
  constraints: ['n ≤ 10⁴,邊數 ≤ 2·10⁴'],
  insight: ['相乘的機率 ≤ 1,只會越乘越小 → 「越早確定的越好」成立 → [[p:dijkstra]]', '最大堆(或存負值的最小堆)', '取 log 也可以:最大化乘積 = 最小化 −log 的和'],
  approaches: [
    {
      name: 'Dijkstra(最大堆)',
      idea: '`prob[start] = 1`;堆中取機率最大的 u,鬆弛 `prob[v] = max(prob[v], prob[u] × p)`;彈出 end 就回傳。',
      steps: ['建無向鄰接表 `(v, p)`', '`prob = [0] * n`、`prob[start] = 1`;堆放 `(-1, start)`', '彈出 (−pr, u):`u == end` → pr;過時就跳過', '每個 (v, p):`pr × p > prob[v]` → 更新、推入'],
      figure: { title: 'succProb = [0.5, 0.5, 0.2]', steps: dijkstraFig() },
      complexity: { time: 'O(E log V)', space: 'O(V + E)', why: '每條邊最多推入一次。' },
      verdict: '最推薦,Dijkstra 的變形:「加法 + 最小」換成「乘法 + 最大」。',
      code: {
        python: `import heapq

def maxProbability(n, edges, succProb, start_node, end_node):
    g = [[] for _ in range(n)]
    for (a, b), p in zip(edges, succProb):
        g[a].append((b, p))
        g[b].append((a, p))
    prob = [0.0] * n
    prob[start_node] = 1.0
    pq = [(-1.0, start_node)]                 # Python 只有最小堆:存負值
    while pq:
        neg, u = heapq.heappop(pq)
        pr = -neg
        if u == end_node:
            return pr
        if pr < prob[u]:
            continue                          # 過時的紀錄
        for v, p in g[u]:
            if pr * p > prob[v]:
                prob[v] = pr * p
                heapq.heappush(pq, (-prob[v], v))
    return 0.0`,
        c: `typedef struct { double p; int u; } Item;
static Item *hp;
static int hs;

static void hpush(Item x) {
    int i = hs++;
    hp[i] = x;
    while (i && hp[(i - 1) / 2].p < hp[i].p) { Item t = hp[i]; hp[i] = hp[(i - 1) / 2]; hp[(i - 1) / 2] = t; i = (i - 1) / 2; }
}

static Item hpop(void) {
    Item top = hp[0];
    hp[0] = hp[--hs];
    for (int i = 0;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < hs && hp[l].p > hp[m].p) m = l;
        if (r < hs && hp[r].p > hp[m].p) m = r;
        if (m == i) break;
        Item t = hp[i]; hp[i] = hp[m]; hp[m] = t; i = m;
    }
    return top;
}

double maxProbability(int n, int **edges, int edgesSize, int *edgesColSize, double *succProb, int succProbSize, int start_node, int end_node) {
    int m = 2 * edgesSize, *head = malloc(n * sizeof(int)), *nxt = malloc(m * sizeof(int)), *to = malloc(m * sizeof(int)), k = 0;
    double *w = malloc(m * sizeof(double)), *prob = calloc(n, sizeof(double)), ans = 0;
    for (int i = 0; i < n; i++) head[i] = -1;
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0], b = edges[i][1];
        to[k] = b; w[k] = succProb[i]; nxt[k] = head[a]; head[a] = k++;
        to[k] = a; w[k] = succProb[i]; nxt[k] = head[b]; head[b] = k++;
    }
    hp = malloc((m + 1) * sizeof(Item)); hs = 0;
    prob[start_node] = 1.0;
    hpush((Item){1.0, start_node});
    while (hs) {
        Item x = hpop();
        if (x.u == end_node) { ans = x.p; break; }
        if (x.p < prob[x.u]) continue;
        for (int e = head[x.u]; e != -1; e = nxt[e])
            if (x.p * w[e] > prob[to[e]]) { prob[to[e]] = x.p * w[e]; hpush((Item){prob[to[e]], to[e]}); }
    }
    free(head); free(nxt); free(to); free(w); free(prob); free(hp);
    return ans;
}`,
        cpp: `double maxProbability(int n, vector<vector<int>>& edges, vector<double>& succProb, int start_node, int end_node) {
    vector<vector<pair<int, double>>> g(n);
    for (int i = 0; i < (int)edges.size(); i++) {
        g[edges[i][0]].push_back({edges[i][1], succProb[i]});
        g[edges[i][1]].push_back({edges[i][0], succProb[i]});
    }
    vector<double> prob(n, 0.0);
    priority_queue<pair<double, int>> pq;
    prob[start_node] = 1.0;
    pq.push({1.0, start_node});
    while (!pq.empty()) {
        auto [pr, u] = pq.top();
        pq.pop();
        if (u == end_node) return pr;
        if (pr < prob[u]) continue;
        for (auto [v, p] : g[u])
            if (pr * p > prob[v]) { prob[v] = pr * p; pq.push({prob[v], v}); }
    }
    return 0.0;
}`,
        java: `double maxProbability(int n, int[][] edges, double[] succProb, int start_node, int end_node) {
    List<List<double[]>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int i = 0; i < edges.length; i++) {
        g.get(edges[i][0]).add(new double[]{edges[i][1], succProb[i]});
        g.get(edges[i][1]).add(new double[]{edges[i][0], succProb[i]});
    }
    double[] prob = new double[n];
    prob[start_node] = 1.0;
    PriorityQueue<double[]> pq = new PriorityQueue<>((a, b) -> Double.compare(b[0], a[0]));
    pq.offer(new double[]{1.0, start_node});
    while (!pq.isEmpty()) {
        double[] x = pq.poll();
        int u = (int) x[1];
        if (u == end_node) return x[0];
        if (x[0] < prob[u]) continue;
        for (double[] e : g.get(u)) {
            int v = (int) e[0];
            if (x[0] * e[1] > prob[v]) { prob[v] = x[0] * e[1]; pq.offer(new double[]{prob[v], v}); }
        }
    }
    return 0.0;
}`,
        javascript: `function maxProbability(n, edges, succProb, start_node, end_node) {
  const g = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], i) => {
    g[a].push([b, succProb[i]]);
    g[b].push([a, succProb[i]]);
  });
  const prob = new Array(n).fill(0);
  prob[start_node] = 1;
  // 簡單的最大堆:元素是 [機率, 點]
  const heap = [[1, start_node]];
  const push = (x) => {
    heap.push(x);
    for (let i = heap.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (heap[p][0] >= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] > heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] > heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [pr, u] = pop();
    if (u === end_node) return pr;
    if (pr < prob[u]) continue;
    for (const [v, p] of g[u])
      if (pr * p > prob[v]) {
        prob[v] = pr * p;
        push([prob[v], v]);
      }
  }
  return 0;
}`,
      },
    },
    {
      name: 'Bellman–Ford',
      idea: '`prob[start] = 1`;最多 n − 1 輪,每輪對每條邊兩個方向做 `prob[v] = max(prob[v], prob[u] × p)`;沒有更新就提早結束。',
      steps: ['`prob = [0] * n`、`prob[start] = 1`', '重複 n − 1 輪:每條邊 (a, b, p) 兩個方向鬆弛', '這輪沒更新 → break', '回傳 `prob[end]`'],
      figure: { title: 'succProb = [0.5, 0.5, 0.2]', steps: bfFig() },
      complexity: { time: 'O(V · E)', space: 'O(V)', why: '最多 V − 1 輪,每輪掃全部邊;實務上常常很快就收斂。' },
      verdict: '不需要堆,寫法最短;最壞情況比 Dijkstra 慢。',
      code: {
        python: `def maxProbability(n, edges, succProb, start_node, end_node):
    prob = [0.0] * n
    prob[start_node] = 1.0
    for _ in range(n - 1):
        changed = False
        for (a, b), p in zip(edges, succProb):
            if prob[a] * p > prob[b]:
                prob[b] = prob[a] * p
                changed = True
            if prob[b] * p > prob[a]:         # 無向邊:兩個方向都試
                prob[a] = prob[b] * p
                changed = True
        if not changed:
            break
    return prob[end_node]`,
        c: `double maxProbability(int n, int **edges, int edgesSize, int *edgesColSize, double *succProb, int succProbSize, int start_node, int end_node) {
    double *prob = calloc(n, sizeof(double));
    prob[start_node] = 1.0;
    for (int it = 0; it < n - 1; it++) {
        bool changed = false;
        for (int i = 0; i < edgesSize; i++) {
            int a = edges[i][0], b = edges[i][1];
            double p = succProb[i];
            if (prob[a] * p > prob[b]) { prob[b] = prob[a] * p; changed = true; }
            if (prob[b] * p > prob[a]) { prob[a] = prob[b] * p; changed = true; }
        }
        if (!changed) break;
    }
    double ans = prob[end_node];
    free(prob);
    return ans;
}`,
        cpp: `double maxProbability(int n, vector<vector<int>>& edges, vector<double>& succProb, int start_node, int end_node) {
    vector<double> prob(n, 0.0);
    prob[start_node] = 1.0;
    for (int it = 0; it < n - 1; it++) {
        bool changed = false;
        for (int i = 0; i < (int)edges.size(); i++) {
            int a = edges[i][0], b = edges[i][1];
            double p = succProb[i];
            if (prob[a] * p > prob[b]) { prob[b] = prob[a] * p; changed = true; }
            if (prob[b] * p > prob[a]) { prob[a] = prob[b] * p; changed = true; }
        }
        if (!changed) break;
    }
    return prob[end_node];
}`,
        java: `double maxProbability(int n, int[][] edges, double[] succProb, int start_node, int end_node) {
    double[] prob = new double[n];
    prob[start_node] = 1.0;
    for (int it = 0; it < n - 1; it++) {
        boolean changed = false;
        for (int i = 0; i < edges.length; i++) {
            int a = edges[i][0], b = edges[i][1];
            double p = succProb[i];
            if (prob[a] * p > prob[b]) { prob[b] = prob[a] * p; changed = true; }
            if (prob[b] * p > prob[a]) { prob[a] = prob[b] * p; changed = true; }
        }
        if (!changed) break;
    }
    return prob[end_node];
}`,
        javascript: `function maxProbability(n, edges, succProb, start_node, end_node) {
  const prob = new Array(n).fill(0);
  prob[start_node] = 1;
  for (let it = 0; it < n - 1; it++) {
    let changed = false;
    edges.forEach(([a, b], i) => {
      const p = succProb[i];
      if (prob[a] * p > prob[b]) {
        prob[b] = prob[a] * p;
        changed = true;
      }
      if (prob[b] * p > prob[a]) {
        prob[a] = prob[b] * p;
        changed = true;
      }
    });
    if (!changed) break;
  }
  return prob[end_node];
}`,
      },
    },
  ],
  pitfalls: ['用最小堆沒取負值:會先處理機率最小的點,結果錯誤', '只建單向邊:題目是無向圖', '當成 BFS 找最少邊數:邊數少不代表機率大'],
  check: {
    kind: 'fn',
    fn: 'maxProbability',
    compare: 'close',
    cases: [
      { args: [3, E, P, 0, 2], out: 0.25 },
      { args: [3, E, [0.5, 0.5, 0.3], 0, 2], out: 0.3 },
      { args: [3, [[0, 1]], [0.5], 0, 2], out: 0 },
      { args: [5, [[1, 4], [2, 4], [0, 4], [0, 3], [0, 2], [2, 3]], [0.37, 0.17, 0.93, 0.23, 0.39, 0.04], 3, 4], out: 0.2139 },
    ],
  },
}
