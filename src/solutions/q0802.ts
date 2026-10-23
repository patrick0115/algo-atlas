import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 802. Find Eventual Safe States

const G = [[1, 2], [2, 3], [5], [0], [5], [], []]
const EDGES = G.flatMap((nb, u) => nb.map((v) => [u, v]))
const POS = { 0: { x: 0, y: 0 }, 1: { x: 1.5, y: 0 }, 2: { x: 3, y: 0 }, 3: { x: 0.75, y: 1.3 }, 4: { x: 4.5, y: 1.3 }, 5: { x: 4.5, y: 0 }, 6: { x: 6, y: 0 } }

function topoFig(): FigStep[] {
  return [
    { note: '「安全點」= 從它出發,不管怎麼走最後都會停在終點(沒有出邊的點)。換句話說,走不到任何環', views: [graphView(7, EDGES, { directed: true, pos: POS })] },
    { note: '終點 5、6 一定安全。反過來想:一個點的**所有**出邊都指向安全點時,它也安全 → 在反向圖上做拓撲排序(從出度 0 開始剝)', views: [graphView(7, EDGES, { directed: true, pos: POS, cls: { 5: 'done', 6: 'done' } })] },
    { note: '5 安全 → 2、4 的出邊都到 5 → 2、4 安全。0、1、3 繞成環(0 → 1 → 3 → 0),出度永遠歸不了零 → 不安全', views: [graphView(7, EDGES, { directed: true, pos: POS, cls: { 2: 'done', 4: 'done', 5: 'done', 6: 'done', 0: 'dim', 1: 'dim', 3: 'dim' } }), arr([2, 4, 5, 6], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

function dfsFig(): FigStep[] {
  return [
    { note: 'DFS 三色標記:白 = 沒看過、灰 = 遞迴中、黑 = 確定安全。DFS 時遇到灰色 → 有環,這條路上的點都不安全', views: [graphView(7, EDGES, { directed: true, pos: POS })] },
    { note: '0 → 1 → 2 → 5(黑)→ 2 黑;1 → 3 → 0(灰!)→ 有環 → 0、1、3 留在灰色(不安全)', views: [graphView(7, EDGES, { directed: true, pos: POS, cls: { 2: 'done', 5: 'done', 0: 'hl', 1: 'hl', 3: 'hl' } })] },
  ]
}

export const q0802: Solution = {
  id: 802,
  plain: '一張有向圖。如果從某個點出發,不管怎麼沿箭頭走,最後一定會停在「沒有出路的點」,就叫它安全點。把所有安全點由小到大列出來。',
  statement: '有向圖 n 個點,`graph[i]` 是點 i 的出邊鄰居。沒有出邊的點是**終點**;若從某點出發的**每一條**路徑最終都抵達終點(或其他安全點),該點為**安全點**。回傳所有安全點,依升冪排列。',
  examples: [
    { input: 'graph = [[1,2],[2,3],[5],[0],[5],[],[]]', output: '[2,4,5,6]' },
    { input: 'graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]', output: '[4]' },
  ],
  constraints: ['n ≤ 10⁴,邊數 ≤ 4·10⁴'],
  insight: ['不安全 ⇔ 能走到環', '反向圖 + [[p:topological-sort]]:出度 0 的點先確定安全,往回剝', '或 DFS 三色標記找環'],
  approaches: [
    {
      name: '反向圖拓撲排序',
      idea: '建反向邊並記錄每個點的出度;出度 0 入佇列;彈出 v 時,反向鄰居 u 的出度 −1,歸零就入佇列;最後出度為 0 的點就是答案。',
      steps: ['`rev[v].append(u)`、`out[u] = len(graph[u])`', '出度 0 的點入佇列', '彈出 v:每個 `u in rev[v]`:`out[u] -= 1`,歸零入佇列', '回傳 `[i for i if out[i] == 0]`'],
      figure: { title: 'graph = [[1,2],[2,3],[5],[0],[5],[],[]]', steps: topoFig() },
      complexity: { time: 'O(V + E)', space: 'O(V + E)', why: '每條邊處理一次。' },
      verdict: '最推薦,「從結果往回推」的拓撲排序;不用擔心遞迴深度。',
      code: {
        python: `from collections import deque

def eventualSafeNodes(graph):
    n = len(graph)
    rev = [[] for _ in range(n)]
    out = [len(nb) for nb in graph]
    for u, nb in enumerate(graph):
        for v in nb:
            rev[v].append(u)                  # 反向邊
    q = deque(i for i in range(n) if out[i] == 0)
    while q:
        v = q.popleft()
        for u in rev[v]:
            out[u] -= 1                       # u 又有一條出邊確定安全
            if out[u] == 0:
                q.append(u)
    return [i for i in range(n) if out[i] == 0]`,
        c: `int *eventualSafeNodes(int **graph, int graphSize, int *graphColSize, int *returnSize) {
    int n = graphSize, m = 0;
    for (int i = 0; i < n; i++) m += graphColSize[i];
    int *head = malloc(n * sizeof(int)), *nxt = malloc((m + 1) * sizeof(int)), *to = malloc((m + 1) * sizeof(int));
    int *out = malloc(n * sizeof(int)), *q = malloc(n * sizeof(int)), k = 0, h = 0, t = 0;
    for (int i = 0; i < n; i++) head[i] = -1;
    for (int u = 0; u < n; u++) {
        out[u] = graphColSize[u];
        for (int j = 0; j < graphColSize[u]; j++) { int v = graph[u][j]; to[k] = u; nxt[k] = head[v]; head[v] = k++; }
    }
    for (int i = 0; i < n; i++) if (!out[i]) q[t++] = i;
    while (h < t) {
        int v = q[h++];
        for (int e = head[v]; e != -1; e = nxt[e]) if (--out[to[e]] == 0) q[t++] = to[e];
    }
    int *res = malloc(n * sizeof(int)), cnt = 0;
    for (int i = 0; i < n; i++) if (!out[i]) res[cnt++] = i;
    free(head); free(nxt); free(to); free(out); free(q);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<vector<int>> rev(n);
    vector<int> out(n), res;
    for (int u = 0; u < n; u++) {
        out[u] = graph[u].size();
        for (int v : graph[u]) rev[v].push_back(u);
    }
    queue<int> q;
    for (int i = 0; i < n; i++) if (!out[i]) q.push(i);
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        for (int u : rev[v]) if (--out[u] == 0) q.push(u);
    }
    for (int i = 0; i < n; i++) if (!out[i]) res.push_back(i);
    return res;
}`,
        java: `List<Integer> eventualSafeNodes(int[][] graph) {
    int n = graph.length;
    List<List<Integer>> rev = new ArrayList<>();
    for (int i = 0; i < n; i++) rev.add(new ArrayList<>());
    int[] out = new int[n];
    for (int u = 0; u < n; u++) {
        out[u] = graph[u].length;
        for (int v : graph[u]) rev.get(v).add(u);
    }
    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (out[i] == 0) q.offer(i);
    while (!q.isEmpty()) {
        int v = q.poll();
        for (int u : rev.get(v)) if (--out[u] == 0) q.offer(u);
    }
    List<Integer> res = new ArrayList<>();
    for (int i = 0; i < n; i++) if (out[i] == 0) res.add(i);
    return res;
}`,
        javascript: `function eventualSafeNodes(graph) {
  const n = graph.length, rev = Array.from({ length: n }, () => []), out = graph.map((nb) => nb.length);
  graph.forEach((nb, u) => nb.forEach((v) => rev[v].push(u)));
  const q = [];
  for (let i = 0; i < n; i++) if (!out[i]) q.push(i);
  for (let h = 0; h < q.length; h++) for (const u of rev[q[h]]) if (--out[u] === 0) q.push(u);
  return out.flatMap((d, i) => (d === 0 ? [i] : []));
}`,
      },
    },
    {
      name: 'DFS 三色標記',
      idea: '`color`:0 白、1 灰(遞迴中 / 不安全)、2 黑(安全);`safe(u)`:灰 → False、黑 → True;標灰後所有鄰居都安全才標黑。',
      steps: ['`safe(u)`:`color[u] > 0` → 回傳 `color[u] == 2`', '`color[u] = 1`', '任一鄰居 `not safe(v)` → 回傳 False(u 留在灰色)', '`color[u] = 2`,回傳 True;答案是所有 safe 的點'],
      figure: { title: 'graph = [[1,2],[2,3],[5],[0],[5],[],[]]', steps: dfsFig() },
      complexity: { time: 'O(V + E)', space: 'O(V)', why: '每個點只會被完整處理一次。' },
      verdict: '灰色「卡住不清除」是關鍵:能走到環的點永遠留在灰色,之後查到直接判不安全。',
      code: {
        python: `import sys

def eventualSafeNodes(graph):
    sys.setrecursionlimit(1 << 20)
    n = len(graph)
    color = [0] * n                           # 0 白、1 灰、2 黑

    def safe(u):
        if color[u]:
            return color[u] == 2
        color[u] = 1
        for v in graph[u]:
            if not safe(v):
                return False                  # 留在灰色:能走到環
        color[u] = 2
        return True

    return [i for i in range(n) if safe(i)]`,
        c: `static int **G, *GC, *color;

static bool safe(int u) {
    if (color[u]) return color[u] == 2;
    color[u] = 1;
    for (int j = 0; j < GC[u]; j++) if (!safe(G[u][j])) return false;
    color[u] = 2;
    return true;
}

int *eventualSafeNodes(int **graph, int graphSize, int *graphColSize, int *returnSize) {
    G = graph; GC = graphColSize;
    color = calloc(graphSize, sizeof(int));
    int *res = malloc(graphSize * sizeof(int)), cnt = 0;
    for (int i = 0; i < graphSize; i++) if (safe(i)) res[cnt++] = i;
    free(color);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> color(n, 0), res;
    function<bool(int)> safe = [&](int u) {
        if (color[u]) return color[u] == 2;
        color[u] = 1;
        for (int v : graph[u]) if (!safe(v)) return false;
        color[u] = 2;
        return true;
    };
    for (int i = 0; i < n; i++) if (safe(i)) res.push_back(i);
    return res;
}`,
        java: `int[] color;

boolean safe(int[][] g, int u) {
    if (color[u] != 0) return color[u] == 2;
    color[u] = 1;
    for (int v : g[u]) if (!safe(g, v)) return false;
    color[u] = 2;
    return true;
}

List<Integer> eventualSafeNodes(int[][] graph) {
    color = new int[graph.length];
    List<Integer> res = new ArrayList<>();
    for (int i = 0; i < graph.length; i++) if (safe(graph, i)) res.add(i);
    return res;
}`,
        javascript: `function eventualSafeNodes(graph) {
  const n = graph.length, color = new Array(n).fill(0);
  const safe = (u) => {
    if (color[u]) return color[u] === 2;
    color[u] = 1;
    for (const v of graph[u]) if (!safe(v)) return false;
    color[u] = 2;
    return true;
  };
  const res = [];
  for (let i = 0; i < n; i++) if (safe(i)) res.push(i);
  return res;
}`,
      },
    },
  ],
  pitfalls: ['以為「在環上」的點才不安全:能走到環的點也不安全', 'DFS 結束後把灰色清回白色:會重複搜尋,而且結果錯誤', '答案沒有排序(拓撲排序版要最後再依編號掃一次)'],
  check: {
    kind: 'fn',
    fn: 'eventualSafeNodes',
    cases: [
      { args: [G], out: [2, 4, 5, 6] },
      { args: [[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]], out: [4] },
      { args: [[[], [0, 2], [3], [1]]], out: [0] },
    ],
  },
}
