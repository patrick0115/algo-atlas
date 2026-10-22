import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 684. Redundant Connection

const E = [
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 4],
  [1, 5],
]
const N = 5

function ufFig(): FigStep[] {
  const parent = Array.from({ length: N + 1 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const edgeCls: Record<number, string> = {}
  const out: FigStep[] = [{ note: '一棵 n 個節點的樹剛好有 n − 1 條邊,這張圖多了一條,所以剛好有一個環。依序加邊,用並查集記「誰和誰已經連通」:一條邊的兩端**早就連通了**,它就是多出來的那條', views: [graphView(N, [], { base: 1 }), arr(parent.slice(1), { label: 'parent(1 ~ 5)' })] }]
  E.forEach(([a, b], k) => {
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) {
      edgeCls[k] = 'hl'
      out.push({ note: `加入 ${a}–${b}:${a} 和 ${b} 已經在同一組(根都是 ${ra})→ 這條邊會形成環,就是答案 [${a}, ${b}]`, views: [graphView(N, E.slice(0, k + 1), { base: 1, edgeCls, cls: { [a]: 'hl', [b]: 'hl' } }), arr(parent.slice(1), { label: 'parent' })] })
      return
    }
    parent[ra] = rb
    edgeCls[k] = 'done'
    out.push({ note: `加入 ${a}–${b}:兩邊原本不連通(根 ${ra}、${rb})→ 合併`, views: [graphView(N, E.slice(0, k + 1), { base: 1, edgeCls }), arr(parent.slice(1), { label: 'parent' })] })
  })
  return out
}

function dfsFig(): FigStep[] {
  return [
    { note: '不用並查集的做法:每加一條邊 u–v 之前,先 DFS 看看「不靠這條邊,u 已經能走到 v 了嗎?」能的話這條邊就是多餘的', views: [graphView(N, E.slice(0, 3), { base: 1 })] },
    { note: '加 1–4 之前:從 1 出發,1 → 2 → 3 → 4 走得到 → 1–4 是多餘的。每條邊都 DFS 一次,O(n²)', views: [graphView(N, E.slice(0, 4), { base: 1, edgeCls: { 3: 'hl' }, cls: { 1: 'hl', 2: 'visited', 3: 'visited', 4: 'hl' } })] },
  ]
}

export const q0684: Solution = {
  id: 684,
  plain: '一張本來是「樹」(沒有圈圈)的圖,被多加了一條線,於是出現一個圈。找出那條多餘的線;如果有好幾條都可以拿掉,回傳最後出現的那條。',
  statement: '一棵有 n 個節點(1 ~ n)的樹,多加了一條邊。`edges` 是現在所有的邊。回傳一條可以刪掉、讓圖變回 n 個節點的樹的邊;有多個答案時回傳 edges 中**最後出現**的那條。',
  examples: [
    { input: 'edges = [[1,2],[1,3],[2,3]]', output: '[2,3]' },
    { input: 'edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]', output: '[1,4]' },
  ],
  constraints: ['`3 ≤ n ≤ 1000`,`edges.length == n`'],
  insight: [
    '樹有 n − 1 條邊、沒有環;多一條邊就剛好多一個環。環上的任何一條邊都可以刪,題目要最後出現的那條',
    '照順序把邊一條一條加進來:第一條「兩端已經連通」的邊,就是讓環閉合的那條 —— 而且它一定是環上最後出現的',
    '判斷「兩點是否已經連通」又要邊加邊問 → **並查集**最適合:find 看是不是同一組,union 合併',
  ],
  approaches: [
    {
      name: '每加一條邊前先 DFS 檢查連通',
      idea: '維護目前的鄰接串列。加邊 u–v 之前,DFS 看 u 能不能已經走到 v;能的話回傳這條邊,否則把它加進圖。',
      steps: ['`adj = {}`', '對每條邊 `[u, v]`:`u` 和 `v` 都已經在圖裡,而且 `dfs(u)` 走得到 `v` → 回傳 `[u, v]`', '否則把 u–v 加進 adj'],
      figure: { title: `edges = ${JSON.stringify(E)}`, steps: dfsFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每條邊做一次 O(n) 的 DFS。' },
      verdict: 'n ≤ 1000 能過。好懂,但每次都重新走一遍圖。',
      code: {
        python: `def findRedundantConnection(edges):
    adj = {}

    def connected(u, v, seen):
        if u == v:
            return True
        seen.add(u)
        return any(w not in seen and connected(w, v, seen) for w in adj.get(u, []))

    for u, v in edges:
        if u in adj and v in adj and connected(u, v, set()):
            return [u, v]
        adj.setdefault(u, []).append(v)
        adj.setdefault(v, []).append(u)
    return []`,
        c: `static int adj[1001][1001], deg[1001];
static bool seen[1001];

static bool connected(int u, int v) {
    if (u == v) return true;
    seen[u] = true;
    for (int k = 0; k < deg[u]; k++)
        if (!seen[adj[u][k]] && connected(adj[u][k], v)) return true;
    return false;
}

int *findRedundantConnection(int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    memset(deg, 0, sizeof(deg));
    int *res = malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < edgesSize; i++) {
        int u = edges[i][0], v = edges[i][1];
        memset(seen, 0, sizeof(seen));
        if (deg[u] && deg[v] && connected(u, v)) { res[0] = u; res[1] = v; return res; }
        adj[u][deg[u]++] = v;
        adj[v][deg[v]++] = u;
    }
    *returnSize = 0;
    return res;
}`,
        cpp: `vector<int> findRedundantConnection(vector<vector<int>>& edges) {
    int n = edges.size();
    vector<vector<int>> adj(n + 1);
    vector<bool> seen;
    function<bool(int, int)> connected = [&](int u, int v) {
        if (u == v) return true;
        seen[u] = true;
        for (int w : adj[u]) if (!seen[w] && connected(w, v)) return true;
        return false;
    };
    for (auto& e : edges) {
        seen.assign(n + 1, false);
        if (!adj[e[0]].empty() && !adj[e[1]].empty() && connected(e[0], e[1])) return e;
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    return {};
}`,
        java: `private List<List<Integer>> adj;
private boolean[] seen;

int[] findRedundantConnection(int[][] edges) {
    int n = edges.length;
    adj = new ArrayList<>();
    for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        seen = new boolean[n + 1];
        if (!adj.get(e[0]).isEmpty() && !adj.get(e[1]).isEmpty() && connected(e[0], e[1])) return e;
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);
    }
    return new int[0];
}

private boolean connected(int u, int v) {
    if (u == v) return true;
    seen[u] = true;
    for (int w : adj.get(u)) if (!seen[w] && connected(w, v)) return true;
    return false;
}`,
        javascript: `function findRedundantConnection(edges) {
  const adj = new Map();
  const connected = (u, v, seen) => {
    if (u === v) return true;
    seen.add(u);
    for (const w of adj.get(u) ?? []) if (!seen.has(w) && connected(w, v, seen)) return true;
    return false;
  };
  for (const [u, v] of edges) {
    if (adj.has(u) && adj.has(v) && connected(u, v, new Set())) return [u, v];
    if (!adj.has(u)) adj.set(u, []);
    if (!adj.has(v)) adj.set(v, []);
    adj.get(u).push(v);
    adj.get(v).push(u);
  }
  return [];
}`,
      },
    },
    {
      name: '並查集',
      idea: '照順序加邊:`find(u) == find(v)` → 兩端早就連通,這條邊造成環,回傳它;否則 `union(u, v)`。',
      steps: ['`parent[i] = i`', '對每條邊 `[u, v]`:`find(u) == find(v)` → 回傳 `[u, v]`', '否則 `parent[find(u)] = find(v)`'],
      figure: { title: `edges = ${JSON.stringify(E)}`, steps: ufFig() },
      complexity: { time: 'O(n · α(n))', space: 'O(n)', why: '每條邊一次 find + union,路徑壓縮後幾乎是常數。' },
      verdict: '標準解,[[p:union-find]]的代表題:「動態加邊、問連不連通」。',
      code: {
        python: `def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]                 # 兩端早就連通 → 這條造成環
        parent[ru] = rv
    return []`,
        c: `static int P[1001];
static int find(int x) { while (P[x] != x) { P[x] = P[P[x]]; x = P[x]; } return x; }

int *findRedundantConnection(int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    for (int i = 0; i <= edgesSize; i++) P[i] = i;
    int *res = malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < edgesSize; i++) {
        int a = find(edges[i][0]), b = find(edges[i][1]);
        if (a == b) { res[0] = edges[i][0]; res[1] = edges[i][1]; return res; }
        P[a] = b;
    }
    *returnSize = 0;
    return res;
}`,
        cpp: `vector<int> findRedundantConnection(vector<vector<int>>& edges) {
    vector<int> parent(edges.size() + 1);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); };
    for (auto& e : edges) {
        int a = find(e[0]), b = find(e[1]);
        if (a == b) return e;
        parent[a] = b;
    }
    return {};
}`,
        java: `private int[] parent;
private int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

int[] findRedundantConnection(int[][] edges) {
    parent = new int[edges.length + 1];
    for (int i = 0; i < parent.length; i++) parent[i] = i;
    for (int[] e : edges) {
        int a = find(e[0]), b = find(e[1]);
        if (a == b) return e;
        parent[a] = b;
    }
    return new int[0];
}`,
        javascript: `function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  for (const [u, v] of edges) {
    const a = find(u), b = find(v);
    if (a === b) return [u, v];
    parent[a] = b;
  }
  return [];
}`,
      },
    },
  ],
  pitfalls: [
    '先把所有邊都加進圖再找環:能找到環,但還要另外判斷環上哪條邊最後出現;照順序加、第一條造成環的就是答案',
    '節點從 1 開始編號,parent 陣列要開 n + 1',
    '並查集沒有路徑壓縮:最壞會退化成一條鍊,find 變成 O(n)',
  ],
  followUp: [{ q: '如果是有向圖?', a: '685. Redundant Connection II:要另外處理「某個節點有兩個父節點」的情況,比較複雜。' }],
  check: {
    kind: 'fn',
    fn: 'findRedundantConnection',
    cases: [
      { args: [[[1, 2], [1, 3], [2, 3]]], out: [2, 3] },
      { args: [E], out: [1, 4] },
      { args: [[[3, 4], [1, 2], [2, 4], [3, 5], [2, 5]]], out: [2, 5] },
      { args: [[[1, 2], [2, 3], [3, 1]]], out: [3, 1] },
    ],
  },
}
