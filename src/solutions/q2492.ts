import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 2492. Minimum Score of a Path Between Two Cities

const N = 4
const RD = [[1, 2, 9], [2, 3, 6], [2, 4, 5], [1, 4, 7]]
const POS = { 1: { x: 0, y: 0 }, 2: { x: 2, y: 0 }, 3: { x: 4, y: 0 }, 4: { x: 1, y: 1.4 } }

function bfsFig(): FigStep[] {
  return [
    { note: '路徑的分數 = 路上最短的那條路。路徑可以**重複走**同一條路、同一個城市 → 只要城市 1 能到的地方,那裡的每條路都能被「繞過去」走一下', views: [graphView(N, RD, { base: 1, pos: POS })] },
    { note: '所以答案 = 「和城市 1 同一個連通塊」裡所有路的最小權重(題目保證 1 和 n 連通)。從 1 做 BFS,看過的每條邊都取 min', views: [graphView(N, RD, { base: 1, pos: POS, cls: { 1: 'done', 2: 'done', 4: 'done' }, edgeCls: { 0: 'done', 2: 'hl', 3: 'done' } })] },
    { note: '連通塊裡有 9、6、5、7 → 最小是 5:1 → 4 → 2 → 4(來回走 5 那條)也是合法路徑', views: [graphView(N, RD, { base: 1, pos: POS, cls: { 1: 'done', 2: 'done', 3: 'done', 4: 'done' }, edgeCls: { 2: 'hl' } }), arr([5], { label: '答案', done: [0] })] },
  ]
}

function ufFig(): FigStep[] {
  return [
    { note: '併查集:把每條路的兩端合併,最後所有和 1 同根的城市就是那個連通塊', views: [graphView(N, RD, { base: 1, pos: POS })] },
    { note: '再掃一次所有路:兩端(任一端)和 1 同根 → 取 min 權重', views: [arr([9, 6, 5, 7], { label: '和 1 同塊的路', done: [2] })] },
  ]
}

export const q2492: Solution = {
  id: 2492,
  plain: '有 n 個城市和一些雙向道路,每條路有一個分數。從城市 1 走到城市 n 的「路徑分數」是路上最短那條路的分數。路可以重複走,問最小可能的路徑分數。',
  statement: '`roads[i] = [a, b, distance]` 表示 a、b 之間有雙向道路。路徑的**分數**是其經過道路中 distance 的最小值。路徑可重複經過道路與城市。保證 1 到 n 之間至少有一條路徑。回傳 1 到 n 的路徑的最小可能分數。',
  examples: [
    { input: 'n = 4, roads = [[1,2,9],[2,3,6],[2,4,5],[1,4,7]]', output: '5', note: '1 → 2 → 4' },
    { input: 'n = 4, roads = [[1,2,2],[1,3,4],[3,4,7]]', output: '2', note: '1 → 2 → 1 → 3 → 4' },
  ],
  constraints: ['n ≤ 10⁵,roads ≤ 10⁵'],
  insight: ['可以重複走 → 連通塊裡任何一條路都能被納入路徑', '答案 = 1 所在連通塊的最小邊權', '[[p:graph-traversal]] 或 [[p:union-find]]'],
  approaches: [
    {
      name: 'BFS 走連通塊',
      idea: '從 1 BFS,每看到一條相鄰的邊就更新 `ans = min(ans, w)`。',
      steps: ['建鄰接表 `(鄰居, 權重)`', '`q = [1]`、`seen = {1}`、`ans = ∞`', '彈出 u:每條 `(v, w)`:`ans = min(ans, w)`;v 沒看過就入佇列', '回傳 ans'],
      figure: { title: `n = ${N}`, steps: bfsFig() },
      complexity: { time: 'O(n + E)', space: 'O(n + E)', why: '每個點、每條邊各處理常數次。' },
      verdict: '最推薦。想通「可以重複走」之後,這題就只是走一遍連通塊。',
      code: {
        python: `from collections import deque, defaultdict

def minScore(n, roads):
    g = defaultdict(list)
    for a, b, w in roads:
        g[a].append((b, w))
        g[b].append((a, w))
    seen, q, ans = {1}, deque([1]), float('inf')
    while q:
        u = q.popleft()
        for v, w in g[u]:
            ans = min(ans, w)                 # 這條路能走到 → 可以納入路徑
            if v not in seen:
                seen.add(v)
                q.append(v)
    return ans`,
        c: `int minScore(int n, int **roads, int roadsSize, int *roadsColSize) {
    int *head = malloc((n + 1) * sizeof(int)), *nxt = malloc(2 * roadsSize * sizeof(int));
    int *to = malloc(2 * roadsSize * sizeof(int)), *wt = malloc(2 * roadsSize * sizeof(int)), m = 0;
    for (int i = 0; i <= n; i++) head[i] = -1;
    for (int i = 0; i < roadsSize; i++) {
        int a = roads[i][0], b = roads[i][1], w = roads[i][2];
        to[m] = b; wt[m] = w; nxt[m] = head[a]; head[a] = m++;
        to[m] = a; wt[m] = w; nxt[m] = head[b]; head[b] = m++;
    }
    bool *seen = calloc(n + 1, sizeof(bool));
    int *q = malloc((n + 1) * sizeof(int)), h = 0, t = 0, ans = INT_MAX;
    q[t++] = 1; seen[1] = true;
    while (h < t) {
        int u = q[h++];
        for (int e = head[u]; e != -1; e = nxt[e]) {
            if (wt[e] < ans) ans = wt[e];
            if (!seen[to[e]]) { seen[to[e]] = true; q[t++] = to[e]; }
        }
    }
    free(head); free(nxt); free(to); free(wt); free(seen); free(q);
    return ans;
}`,
        cpp: `int minScore(int n, vector<vector<int>>& roads) {
    vector<vector<pair<int, int>>> g(n + 1);
    for (auto &r : roads) {
        g[r[0]].push_back({r[1], r[2]});
        g[r[1]].push_back({r[0], r[2]});
    }
    vector<bool> seen(n + 1, false);
    queue<int> q;
    q.push(1);
    seen[1] = true;
    int ans = INT_MAX;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (auto [v, w] : g[u]) {
            ans = min(ans, w);
            if (!seen[v]) { seen[v] = true; q.push(v); }
        }
    }
    return ans;
}`,
        java: `int minScore(int n, int[][] roads) {
    List<List<int[]>> g = new ArrayList<>();
    for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
    for (int[] r : roads) {
        g.get(r[0]).add(new int[]{r[1], r[2]});
        g.get(r[1]).add(new int[]{r[0], r[2]});
    }
    boolean[] seen = new boolean[n + 1];
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(1);
    seen[1] = true;
    int ans = Integer.MAX_VALUE;
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int[] e : g.get(u)) {
            ans = Math.min(ans, e[1]);
            if (!seen[e[0]]) { seen[e[0]] = true; q.offer(e[0]); }
        }
    }
    return ans;
}`,
        javascript: `function minScore(n, roads) {
  const g = Array.from({ length: n + 1 }, () => []);
  for (const [a, b, w] of roads) {
    g[a].push([b, w]);
    g[b].push([a, w]);
  }
  const seen = new Array(n + 1).fill(false), q = [1];
  seen[1] = true;
  let ans = Infinity;
  for (let h = 0; h < q.length; h++)
    for (const [v, w] of g[q[h]]) {
      ans = Math.min(ans, w);
      if (!seen[v]) {
        seen[v] = true;
        q.push(v);
      }
    }
  return ans;
}`,
      },
    },
    {
      name: '併查集',
      idea: '合併每條路的兩端;再掃所有路,`find(a) == find(1)` 的取最小權重。',
      steps: ['`parent = list(range(n + 1))`', '每條路 `union(a, b)`', '`for a, b, w`:`find(a) == find(1)` → `ans = min(ans, w)`'],
      figure: { title: `n = ${N}`, steps: ufFig() },
      complexity: { time: 'O((n + E) · α(n))', space: 'O(n)', why: '路徑壓縮後幾乎是常數。' },
      verdict: '不用建鄰接表;「同一個連通塊」的問題都可以想想併查集。',
      code: {
        python: `def minScore(n, roads):
    parent = list(range(n + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]     # 路徑壓縮
            x = parent[x]
        return x

    for a, b, _ in roads:
        parent[find(a)] = find(b)
    root = find(1)
    return min(w for a, _, w in roads if find(a) == root)`,
        c: `static int *par;

static int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

int minScore(int n, int **roads, int roadsSize, int *roadsColSize) {
    par = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) par[i] = i;
    for (int i = 0; i < roadsSize; i++) par[find(roads[i][0])] = find(roads[i][1]);
    int root = find(1), ans = INT_MAX;
    for (int i = 0; i < roadsSize; i++)
        if (find(roads[i][0]) == root && roads[i][2] < ans) ans = roads[i][2];
    free(par);
    return ans;
}`,
        cpp: `int minScore(int n, vector<vector<int>>& roads) {
    vector<int> par(n + 1);
    iota(par.begin(), par.end(), 0);
    function<int(int)> find = [&](int x) { return par[x] == x ? x : par[x] = find(par[x]); };
    for (auto &r : roads) par[find(r[0])] = find(r[1]);
    int root = find(1), ans = INT_MAX;
    for (auto &r : roads) if (find(r[0]) == root) ans = min(ans, r[2]);
    return ans;
}`,
        java: `int[] par;

int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

int minScore(int n, int[][] roads) {
    par = new int[n + 1];
    for (int i = 0; i <= n; i++) par[i] = i;
    for (int[] r : roads) par[find(r[0])] = find(r[1]);
    int root = find(1), ans = Integer.MAX_VALUE;
    for (int[] r : roads) if (find(r[0]) == root) ans = Math.min(ans, r[2]);
    return ans;
}`,
        javascript: `function minScore(n, roads) {
  const par = Array.from({ length: n + 1 }, (_, i) => i);
  const find = (x) => {
    while (par[x] !== x) {
      par[x] = par[par[x]];
      x = par[x];
    }
    return x;
  };
  for (const [a, b] of roads) par[find(a)] = find(b);
  const root = find(1);
  let ans = Infinity;
  for (const [a, , w] of roads) if (find(a) === root) ans = Math.min(ans, w);
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['當成最短路徑問題用 Dijkstra:分數是「路上的最小邊」,而且可以重複走,不是路徑長', '只看 1 和 n 直接相連的路'],
  check: {
    kind: 'fn',
    fn: 'minScore',
    cases: [
      { args: [N, RD], out: 5 },
      { args: [4, [[1, 2, 2], [1, 3, 4], [3, 4, 7]]], out: 2 },
      { args: [6, [[1, 2, 8], [2, 6, 9], [3, 4, 1], [4, 5, 2]]], out: 8 },
      { args: [2, [[1, 2, 3]]], out: 3 },
    ],
  },
}
