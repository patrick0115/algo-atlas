import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 785. Is Graph Bipartite?

const G = [[1, 3], [0, 2], [1, 3], [0, 2]]
const BAD = [[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]
const edgesOf = (g: number[][]) => g.flatMap((nb, u) => nb.filter((v) => u < v).map((v) => [u, v]))
const POS = { 0: { x: 0, y: 0 }, 1: { x: 2, y: 0 }, 2: { x: 2, y: 2 }, 3: { x: 0, y: 2 } }

function bfsFig(): FigStep[] {
  return [
    { note: '二分圖 = 能把點塗成兩種顏色,使每條邊的兩端顏色不同。從任一點開始塗色 A,它的鄰居一定要是 B,鄰居的鄰居是 A…', views: [graphView(4, edgesOf(G), { pos: POS })] },
    { note: '0 塗 A(實心)→ 1、3 塗 B(外框)→ 2 是 1 的鄰居,塗 A。檢查每條邊:兩端都不同色 ✓', views: [graphView(4, edgesOf(G), { pos: POS, cls: { 0: 'done', 2: 'done', 1: 'hl', 3: 'hl' } })] },
    { note: '反例:加上 0–2 這條邊,出現三角形 0–1–2。0 是 A、1 是 B、2 是 A,但 0 和 2 相鄰又同色 → 不是二分圖。(奇數長度的環一定塗不了)', views: [graphView(4, edgesOf(BAD), { pos: POS, cls: { 0: 'done', 2: 'done', 1: 'hl', 3: 'hl' }, edgeCls: { 1: 'hl' } })] },
    { note: '圖可能不連通 → 每個還沒塗色的點都要當起點再跑一次', views: [arr(['true', 'false'], { label: '兩個例子的答案', done: [0] })] },
  ]
}

function ufFig(): FigStep[] {
  return [
    { note: '併查集版:同一個點的所有鄰居,一定要在同一組(都和它不同色)。把 u 的鄰居全部合併', views: [graphView(4, edgesOf(G), { pos: POS })] },
    { note: '如果 u 自己和某個鄰居被合併到同一組 → 矛盾,不是二分圖', views: [arr(['{0,2}', '{1,3}'], { label: '兩組', done: [0, 1] })] },
  ]
}

export const q0785: Solution = {
  id: 785,
  plain: '一張無向圖,能不能把所有點分成兩隊,讓每條邊都連接不同隊的兩個點(同隊的點之間沒有邊)?',
  statement: '給 n 個節點的無向圖,`graph[u]` 是 u 的鄰居列表(無自環、無重邊,圖可能不連通)。判斷這張圖是否為**二分圖**。',
  examples: [
    { input: 'graph = [[1,2,3],[0,2],[0,1,3],[0,2]]', output: 'false' },
    { input: 'graph = [[1,3],[0,2],[1,3],[0,2]]', output: 'true', note: '{0,2} 和 {1,3}' },
  ],
  constraints: ['n ≤ 100'],
  insight: ['二分圖 ⇔ 可以雙色著色 ⇔ 沒有奇數長度的環', '[[p:graph-traversal]] 著色:鄰居塗相反色,遇到同色就失敗', '圖不一定連通,每個連通塊都要檢查'],
  approaches: [
    {
      name: 'BFS 雙色著色',
      idea: '`color[u] = -1` 代表未塗;每個未塗的點開始 BFS,鄰居塗 `1 − color[u]`;鄰居已塗而且同色 → False。',
      steps: ['`color = [-1] * n`', '`for s`:未塗 → `color[s] = 0`,BFS', '彈出 u:每個 v:未塗 → 塗相反色、入佇列;同色 → False', '全部通過 → True'],
      figure: { title: 'graph = [[1,3],[0,2],[1,3],[0,2]]', steps: bfsFig() },
      complexity: { time: 'O(V + E)', space: 'O(V)', why: '每個點、每條邊處理一次。' },
      verdict: '最推薦,二分圖判定的標準作法;DFS 也一樣。',
      code: {
        python: `from collections import deque

def isBipartite(graph):
    n = len(graph)
    color = [-1] * n
    for s in range(n):
        if color[s] != -1:
            continue
        color[s] = 0                          # 新的連通塊
        q = deque([s])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]   # 鄰居塗相反色
                    q.append(v)
                elif color[v] == color[u]:
                    return False              # 相鄰卻同色
    return True`,
        c: `bool isBipartite(int **graph, int graphSize, int *graphColSize) {
    int n = graphSize, color[100], q[100];
    for (int i = 0; i < n; i++) color[i] = -1;
    for (int s = 0; s < n; s++) {
        if (color[s] != -1) continue;
        int h = 0, t = 0;
        color[s] = 0; q[t++] = s;
        while (h < t) {
            int u = q[h++];
            for (int k = 0; k < graphColSize[u]; k++) {
                int v = graph[u][k];
                if (color[v] == -1) { color[v] = 1 - color[u]; q[t++] = v; }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
        cpp: `bool isBipartite(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> color(n, -1);
    for (int s = 0; s < n; s++) {
        if (color[s] != -1) continue;
        queue<int> q;
        q.push(s);
        color[s] = 0;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : graph[u]) {
                if (color[v] == -1) { color[v] = 1 - color[u]; q.push(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
        java: `boolean isBipartite(int[][] graph) {
    int n = graph.length;
    int[] color = new int[n];
    Arrays.fill(color, -1);
    for (int s = 0; s < n; s++) {
        if (color[s] != -1) continue;
        Deque<Integer> q = new ArrayDeque<>();
        q.offer(s);
        color[s] = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : graph[u]) {
                if (color[v] == -1) { color[v] = 1 - color[u]; q.offer(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
        javascript: `function isBipartite(graph) {
  const n = graph.length, color = new Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    if (color[s] !== -1) continue;
    color[s] = 0;
    const q = [s];
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      for (const v of graph[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u];
          q.push(v);
        } else if (color[v] === color[u]) return false;
      }
    }
  }
  return true;
}`,
      },
    },
    {
      name: '併查集',
      idea: '對每個 u,把它所有鄰居合併成一組;若 `find(u) == find(鄰居)` → False。',
      steps: ['`parent = list(range(n))`', '`for u`:`for v in graph[u]`', '`find(u) == find(v)` → False', '`union(graph[u][0], v)`'],
      figure: { title: 'graph = [[1,3],[0,2],[1,3],[0,2]]', steps: ufFig() },
      complexity: { time: 'O((V + E) · α(V))', space: 'O(V)', why: '每條邊一次 find / union。' },
      verdict: '換個角度:「u 的鄰居們」一定同色 → 合併它們,再檢查 u 不跟它們同組。',
      code: {
        python: `def isBipartite(graph):
    parent = list(range(len(graph)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, nb in enumerate(graph):
        for v in nb:
            if find(u) == find(v):
                return False                  # u 和鄰居被迫同組
            parent[find(nb[0])] = find(v)     # 鄰居們都同一組
    return True`,
        c: `static int par[100];

static int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

bool isBipartite(int **graph, int graphSize, int *graphColSize) {
    for (int i = 0; i < graphSize; i++) par[i] = i;
    for (int u = 0; u < graphSize; u++)
        for (int k = 0; k < graphColSize[u]; k++) {
            int v = graph[u][k];
            if (find(u) == find(v)) return false;
            par[find(graph[u][0])] = find(v);
        }
    return true;
}`,
        cpp: `bool isBipartite(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> par(n);
    iota(par.begin(), par.end(), 0);
    function<int(int)> find = [&](int x) { return par[x] == x ? x : par[x] = find(par[x]); };
    for (int u = 0; u < n; u++)
        for (int v : graph[u]) {
            if (find(u) == find(v)) return false;
            par[find(graph[u][0])] = find(v);
        }
    return true;
}`,
        java: `int[] par;

int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

boolean isBipartite(int[][] graph) {
    int n = graph.length;
    par = new int[n];
    for (int i = 0; i < n; i++) par[i] = i;
    for (int u = 0; u < n; u++)
        for (int v : graph[u]) {
            if (find(u) == find(v)) return false;
            par[find(graph[u][0])] = find(v);
        }
    return true;
}`,
        javascript: `function isBipartite(graph) {
  const par = graph.map((_, i) => i);
  const find = (x) => {
    while (par[x] !== x) {
      par[x] = par[par[x]];
      x = par[x];
    }
    return x;
  };
  for (let u = 0; u < graph.length; u++)
    for (const v of graph[u]) {
      if (find(u) === find(v)) return false;
      par[find(graph[u][0])] = find(v);
    }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['只從節點 0 開始:圖不連通時其他連通塊沒被檢查', '孤立點(沒有鄰居)也要能正確處理'],
  check: {
    kind: 'fn',
    fn: 'isBipartite',
    cases: [
      { args: [BAD], out: false },
      { args: [G], out: true },
      { args: [[[], [2], [1]]], out: true },
      { args: [[[1, 4], [0, 2], [1, 3], [2, 4], [3, 0]]], out: false },
      { args: [[[1], [0], [3], [2]]], out: true },
    ],
  },
}
