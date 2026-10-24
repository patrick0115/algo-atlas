import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1466. Reorder Routes to Make All Paths Lead to the City Zero

const N = 6
const E = [[0, 1], [1, 3], [2, 3], [4, 0], [4, 5]]
const POS = { 0: { x: 2, y: 0 }, 1: { x: 1, y: 1 }, 3: { x: 0, y: 2 }, 2: { x: 0, y: 3 }, 4: { x: 3, y: 1 }, 5: { x: 4, y: 2 } }

function dfsFig(): FigStep[] {
  return [
    { note: '樹狀的單行道路網,要讓每個城市都能開到城市 0。從 0 出發往外走:每條路應該是「指向 0 的方向」,也就是從外面指回來', views: [graphView(N, E, { directed: true, pos: POS })] },
    { note: '把每條路存成雙向,但記住原本的方向。從 0 DFS 時,如果走的方向**和原本的路方向相同**(從靠近 0 的一端指向遠端),這條路就要反轉', views: [graphView(N, E, { directed: true, pos: POS, edgeCls: { 0: 'hl', 1: 'hl', 4: 'hl' } })] },
    { note: '0→1、1→3、4→5 是背對 0 的,要反轉;2→3、4→0 已經朝向 0。答案 3', views: [graphView(N, E, { directed: true, pos: POS, edgeCls: { 0: 'hl', 1: 'hl', 2: 'done', 3: 'done', 4: 'hl' } }), arr([3], { label: '答案', done: [0] })] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: 'BFS 版:把原本的有向邊放進集合。從 0 一層一層往外,每走一條 u → v,檢查 (u, v) 是否是原本的邊', views: [graphView(N, E, { directed: true, pos: POS, cls: { 0: 'done' } })] },
    { note: '(u, v) 在集合裡 → 路的方向是離開 0,需要反轉;不在 → 原本是 v → u,已經正確', views: [graphView(N, E, { directed: true, pos: POS, cls: { 0: 'done', 1: 'done', 4: 'done' } })] },
  ]
}

export const q1466: Solution = {
  id: 1466,
  plain: 'n 個城市用 n − 1 條單行道連成一棵樹。現在要讓每個城市都能開車到城市 0,最少要把幾條路的方向反過來?',
  statement: 'n 個城市(0..n−1)與 n − 1 條**有向**道路 `connections[i] = [a, b]`(a → b),忽略方向時構成一棵樹。重新調整部分道路的方向,使每個城市都能到達城市 0。回傳最少需要改變方向的道路數。',
  examples: [
    { input: 'n = 6, connections = [[0,1],[1,3],[2,3],[4,0],[4,5]]', output: '3' },
    { input: 'n = 5, connections = [[1,0],[1,2],[3,2],[3,4]]', output: '2' },
    { input: 'n = 3, connections = [[1,0],[2,0]]', output: '0' },
  ],
  constraints: ['n ≤ 5·10⁴'],
  insight: ['樹 → 從 0 出發,每條邊恰好走一次', '從 0 往外走時,和原本方向相同的邊是「背對 0」的,要反轉', '鄰接表存雙向邊,附帶「是不是原方向」的標記'],
  approaches: [
    {
      name: 'DFS + 方向標記',
      idea: '對每條 a → b 存 `(b, 1)` 到 a、`(a, 0)` 到 b;從 0 DFS,走到沒看過的鄰居時加上它的標記。',
      steps: ['`g[a].append((b, 1))`、`g[b].append((a, 0))`', '從 0 DFS(用堆疊)', '每條 `(v, cost)`:v 沒看過 → `ans += cost`、走過去', '回傳 ans'],
      figure: { title: `n = ${N}`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '樹有 n − 1 條邊,每條走一次。' },
      verdict: '最推薦,把「方向」編進邊的權重(0 / 1),一次遍歷就加總完。',
      code: {
        python: `def minReorder(n, connections):
    g = [[] for _ in range(n)]
    for a, b in connections:
        g[a].append((b, 1))                   # 原方向:從 a 往外,要反轉
        g[b].append((a, 0))                   # 反方向:本來就朝向 b
    seen, st, ans = [False] * n, [0], 0
    seen[0] = True
    while st:
        u = st.pop()
        for v, cost in g[u]:
            if not seen[v]:
                seen[v] = True
                ans += cost
                st.append(v)
    return ans`,
        c: `int minReorder(int n, int **connections, int connectionsSize, int *connectionsColSize) {
    int m = 2 * connectionsSize, *head = malloc(n * sizeof(int)), *nxt = malloc(m * sizeof(int));
    int *to = malloc(m * sizeof(int)), *cost = malloc(m * sizeof(int)), k = 0;
    for (int i = 0; i < n; i++) head[i] = -1;
    for (int i = 0; i < connectionsSize; i++) {
        int a = connections[i][0], b = connections[i][1];
        to[k] = b; cost[k] = 1; nxt[k] = head[a]; head[a] = k++;
        to[k] = a; cost[k] = 0; nxt[k] = head[b]; head[b] = k++;
    }
    bool *seen = calloc(n, sizeof(bool));
    int *st = malloc(n * sizeof(int)), top = 0, ans = 0;
    st[top++] = 0; seen[0] = true;
    while (top) {
        int u = st[--top];
        for (int e = head[u]; e != -1; e = nxt[e])
            if (!seen[to[e]]) { seen[to[e]] = true; ans += cost[e]; st[top++] = to[e]; }
    }
    free(head); free(nxt); free(to); free(cost); free(seen); free(st);
    return ans;
}`,
        cpp: `int minReorder(int n, vector<vector<int>>& connections) {
    vector<vector<pair<int, int>>> g(n);
    for (auto &c : connections) {
        g[c[0]].push_back({c[1], 1});
        g[c[1]].push_back({c[0], 0});
    }
    vector<bool> seen(n, false);
    vector<int> st{0};
    seen[0] = true;
    int ans = 0;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        for (auto [v, cost] : g[u])
            if (!seen[v]) { seen[v] = true; ans += cost; st.push_back(v); }
    }
    return ans;
}`,
        java: `int minReorder(int n, int[][] connections) {
    List<List<int[]>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] c : connections) {
        g.get(c[0]).add(new int[]{c[1], 1});
        g.get(c[1]).add(new int[]{c[0], 0});
    }
    boolean[] seen = new boolean[n];
    Deque<Integer> st = new ArrayDeque<>();
    st.push(0);
    seen[0] = true;
    int ans = 0;
    while (!st.isEmpty()) {
        int u = st.pop();
        for (int[] e : g.get(u))
            if (!seen[e[0]]) { seen[e[0]] = true; ans += e[1]; st.push(e[0]); }
    }
    return ans;
}`,
        javascript: `function minReorder(n, connections) {
  const g = Array.from({ length: n }, () => []);
  for (const [a, b] of connections) {
    g[a].push([b, 1]);
    g[b].push([a, 0]);
  }
  const seen = new Array(n).fill(false), st = [0];
  seen[0] = true;
  let ans = 0;
  while (st.length) {
    const u = st.pop();
    for (const [v, cost] of g[u])
      if (!seen[v]) {
        seen[v] = true;
        ans += cost;
        st.push(v);
      }
  }
  return ans;
}`,
      },
    },
    {
      name: 'BFS + 原邊集合',
      idea: '原本的邊放進集合;建無向鄰接表從 0 BFS,每走 u → v,`(u, v)` 在集合裡就 `ans += 1`。',
      steps: ['`orig = {(a, b)}`;無向鄰接表', '從 0 BFS', '走 u → v(v 沒看過):`(u, v) in orig` → `ans += 1`'],
      figure: { title: `n = ${N}`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '集合查詢平均 O(1)。C 用排序 + 二分搜尋代替集合,為 O(n log n)。' },
      verdict: '比較貼近直覺的「檢查這條路原本朝哪邊」,只是多一個集合。',
      code: {
        python: `from collections import deque

def minReorder(n, connections):
    orig = {(a, b) for a, b in connections}
    g = [[] for _ in range(n)]
    for a, b in connections:
        g[a].append(b)
        g[b].append(a)
    seen, q, ans = {0}, deque([0]), 0
    while q:
        u = q.popleft()
        for v in g[u]:
            if v not in seen:
                seen.add(v)
                if (u, v) in orig:
                    ans += 1                  # 這條路背對 0
                q.append(v)
    return ans`,
        c: `// C 沒有內建集合:把 (a, b) 編成 a * n + b 排序後二分搜尋
static int cmpLL(const void *x, const void *y) {
    long long a = *(long long *)x, b = *(long long *)y;
    return a < b ? -1 : a > b;
}

int minReorder(int n, int **connections, int connectionsSize, int *connectionsColSize) {
    int m = connectionsSize;
    long long *key = malloc(m * sizeof(long long));
    int *deg = calloc(n + 1, sizeof(int)), *adj = malloc(2 * m * sizeof(int)), *fill;
    for (int i = 0; i < m; i++) {
        key[i] = (long long)connections[i][0] * n + connections[i][1];
        deg[connections[i][0] + 1]++; deg[connections[i][1] + 1]++;
    }
    qsort(key, m, sizeof(long long), cmpLL);
    for (int i = 0; i < n; i++) deg[i + 1] += deg[i];
    fill = malloc(n * sizeof(int));
    memcpy(fill, deg, n * sizeof(int));
    for (int i = 0; i < m; i++) {
        int a = connections[i][0], b = connections[i][1];
        adj[fill[a]++] = b; adj[fill[b]++] = a;
    }
    bool *seen = calloc(n, sizeof(bool));
    int *q = malloc(n * sizeof(int)), h = 0, t = 0, ans = 0;
    q[t++] = 0; seen[0] = true;
    while (h < t) {
        int u = q[h++];
        for (int e = deg[u]; e < deg[u + 1]; e++) {
            int v = adj[e];
            if (seen[v]) continue;
            seen[v] = true;
            long long k = (long long)u * n + v;
            if (bsearch(&k, key, m, sizeof(long long), cmpLL)) ans++;
            q[t++] = v;
        }
    }
    free(key); free(deg); free(adj); free(fill); free(seen); free(q);
    return ans;
}`,
        cpp: `int minReorder(int n, vector<vector<int>>& connections) {
    unordered_set<long long> orig;
    vector<vector<int>> g(n);
    for (auto &c : connections) {
        orig.insert((long long)c[0] * n + c[1]);
        g[c[0]].push_back(c[1]);
        g[c[1]].push_back(c[0]);
    }
    vector<bool> seen(n, false);
    queue<int> q;
    q.push(0);
    seen[0] = true;
    int ans = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (seen[v]) continue;
            seen[v] = true;
            if (orig.count((long long)u * n + v)) ans++;
            q.push(v);
        }
    }
    return ans;
}`,
        java: `int minReorder(int n, int[][] connections) {
    Set<Long> orig = new HashSet<>();
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] c : connections) {
        orig.add((long) c[0] * n + c[1]);
        g.get(c[0]).add(c[1]);
        g.get(c[1]).add(c[0]);
    }
    boolean[] seen = new boolean[n];
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(0);
    seen[0] = true;
    int ans = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : g.get(u)) {
            if (seen[v]) continue;
            seen[v] = true;
            if (orig.contains((long) u * n + v)) ans++;
            q.offer(v);
        }
    }
    return ans;
}`,
        javascript: `function minReorder(n, connections) {
  const orig = new Set(connections.map(([a, b]) => a * n + b));
  const g = Array.from({ length: n }, () => []);
  for (const [a, b] of connections) {
    g[a].push(b);
    g[b].push(a);
  }
  const seen = new Array(n).fill(false), q = [0];
  seen[0] = true;
  let ans = 0;
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (const v of g[u]) {
      if (seen[v]) continue;
      seen[v] = true;
      if (orig.has(u * n + v)) ans++;
      q.push(v);
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['只用原本的有向邊建圖:從 0 出發會走不到那些「朝向 0」的路另一端', '搞反要數的方向:要數的是從 0 往外走時「順向」的邊'],
  check: {
    kind: 'fn',
    fn: 'minReorder',
    cases: [
      { args: [N, E], out: 3 },
      { args: [5, [[1, 0], [1, 2], [3, 2], [3, 4]]], out: 2 },
      { args: [3, [[1, 0], [2, 0]]], out: 0 },
      { args: [2, [[0, 1]]], out: 1 },
    ],
  },
}
