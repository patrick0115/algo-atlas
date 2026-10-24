import { graphView, kv } from './fig'
import type { FigStep, Solution } from './types'

// 2421. Number of Good Paths

const VALS = [1, 3, 2, 1, 3]
const E = [[0, 1], [0, 2], [2, 3], [2, 4]]
const POS = { 0: { x: 1.5, y: 0 }, 1: { x: 0.5, y: 1 }, 2: { x: 2.5, y: 1 }, 3: { x: 2, y: 2 }, 4: { x: 3, y: 2 } }
const subs = Object.fromEntries(VALS.map((v, i) => [i, `值 ${v}`]))

function dsuFig(): FigStep[] {
  return [
    { note: '好路徑:兩端的值一樣,而且路上所有節點都 ≤ 這個值(單一節點也算)。想法:由小到大「打開」節點,只用值 ≤ v 的節點拼出連通塊', views: [graphView(5, E, { pos: POS, subs })] },
    { note: '值 1:打開節點 0、3。邊 0–2、2–3 的另一端值 2 > 1,還不能連。每個連通塊裡值 1 的節點各 1 個 → 只有單點路徑', views: [graphView(5, E, { pos: POS, subs, cls: { 0: 'hl', 3: 'hl' } })] },
    { note: '值 2:打開節點 2,連上 0 和 3(它們的值 ≤ 2)。這塊裡值 2 的只有 2 自己', views: [graphView(5, E, { pos: POS, subs, cls: { 0: 'done', 2: 'hl', 3: 'done' }, edgeCls: { 1: 'hl', 2: 'hl' } })] },
    { note: '值 3:打開 1、4,連上去後整棵都同一塊。這塊裡值 3 的有 2 個(1、4)→ 它們之間有 C(2,2) = 1 條好路徑。總數 = 5(單點)+ 1 = 6', views: [graphView(5, E, { pos: POS, subs, cls: { 1: 'hl', 4: 'hl', 0: 'done', 2: 'done', 3: 'done' }, edgeCls: { 0: 'hl', 3: 'hl' } }), kv([['值 3 的節點', '1、4 同一塊 → 1 對']], '計數')] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:從每個節點 s 出發 DFS,只往「值 ≤ vals[s]」的節點走;走到值剛好等於 vals[s] 且編號比 s 大的節點,就是一條好路徑', views: [graphView(5, E, { pos: POS, subs, cls: { 1: 'hl' } })] },
    { note: '從 1 出發(值 3):可以走遍整棵樹,遇到 4(值 3)→ 1 條。每個起點 O(n),總共 O(n²)', views: [graphView(5, E, { pos: POS, subs, cls: { 1: 'hl', 4: 'done' } })] },
  ]
}

export const q2421: Solution = {
  id: 2421,
  plain: '一棵樹上每個節點有一個數字。一條「好路徑」是:兩端的數字一樣,而且路徑上的每個節點數字都不超過兩端的數字。單一節點自己也算一條。總共有幾條好路徑?',
  statement: '給一棵 n 個節點的樹(`edges`)和節點值 `vals`。**好路徑**:起點與終點值相同,且路徑上所有節點的值 ≤ 起點的值。不同的路徑(視為無向,(a,b) 與 (b,a) 相同)要分別計算,單一節點也是好路徑。回傳好路徑的數量。',
  examples: [
    { input: 'vals = [1,3,2,1,3], edges = [[0,1],[0,2],[2,3],[2,4]]', output: '6', note: '5 個單點 + 節點 1 → 0 → 2 → 4 那條(值 3,1,2,3)' },
    { input: 'vals = [1,1,2,2,3], edges = [[0,1],[1,2],[2,3],[2,4]]', output: '7' },
    { input: 'vals = [1], edges = []', output: '1' },
  ],
  constraints: ['n ≤ 3·10⁴', '值 ≤ 10⁵'],
  insight: ['路徑上的最大值就是兩端的值 → 從「最大值」的角度思考', '由小到大處理值 v:只用值 ≤ v 的節點時,同一個連通塊裡值剛好 v 的節點,兩兩之間都是好路徑', '「依序加入節點、合併連通塊」→ 併查集;每塊記住「值等於目前最大值的節點有幾個」'],
  approaches: [
    {
      name: '依值排序 + 併查集',
      idea: '節點依值由小到大處理;處理節點 u 時,把鄰居中值 ≤ vals[u] 的合併進來。合併時若兩塊的最大值相同,答案加上 `cnt[a] × cnt[b]`。',
      steps: ['每塊記 `(最大值, 最大值出現次數)`,初始每個節點自己一塊 (vals[u], 1)', '節點依值排序;對每個 u、每個鄰居 v 且 `vals[v] <= vals[u]`:合併兩塊', '合併時兩塊最大值相同 → `ans += cnt[a] * cnt[b]`、`cnt` 相加;不同 → 保留比較大的那邊', '答案再加上 n(單點路徑)'],
      figure: { title: `vals = [${VALS}]`, steps: dsuFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 + 併查集(近乎常數)。' },
      verdict: '最推薦。[[p:union-find]]的經典「依門檻由小到大加入」技巧(和 [778](#/q/778) 同一招)。',
      code: {
        python: `def numberOfGoodPaths(vals, edges):
    n = len(vals)
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)
    parent = list(range(n))
    mx = vals[:]                              # 每塊的最大值
    cnt = [1] * n                             # 最大值在這塊出現幾次

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    ans = n                                   # 單點路徑
    for u in sorted(range(n), key=lambda i: vals[i]):
        for v in g[u]:
            if vals[v] > vals[u]:
                continue                      # 還沒「打開」
            a, b = find(u), find(v)
            if a == b:
                continue
            if mx[a] == mx[b]:
                ans += cnt[a] * cnt[b]        # 兩塊裡最大值的節點兩兩配對
                cnt[a] += cnt[b]
            elif mx[a] < mx[b]:
                mx[a], cnt[a] = mx[b], cnt[b]
            parent[b] = a
    return ans`,
        c: `static int *par_;
static int find(int x) { while (par_[x] != x) { par_[x] = par_[par_[x]]; x = par_[x]; } return x; }
static int *vals_;
static int cmpv(const void *a, const void *b) { return vals_[*(int *)a] - vals_[*(int *)b]; }

int numberOfGoodPaths(int *vals, int valsSize, int **edges, int edgesSize, int *edgesColSize) {
    int n = valsSize;
    int *deg = calloc(n + 1, sizeof(int)), *start = calloc(n + 1, sizeof(int)), *fill = calloc(n, sizeof(int));
    int *adj = malloc(2 * edgesSize * sizeof(int) + 4);
    for (int i = 0; i < edgesSize; i++) { deg[edges[i][0]]++; deg[edges[i][1]]++; }
    for (int i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0], b = edges[i][1];
        adj[start[a] + fill[a]++] = b; adj[start[b] + fill[b]++] = a;
    }
    par_ = malloc(n * sizeof(int));
    int *mx = malloc(n * sizeof(int)), *cnt = malloc(n * sizeof(int)), *order = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) { par_[i] = i; mx[i] = vals[i]; cnt[i] = 1; order[i] = i; }
    vals_ = vals;
    qsort(order, n, sizeof(int), cmpv);
    int ans = n;
    for (int k = 0; k < n; k++) {
        int u = order[k];
        for (int e = start[u]; e < start[u + 1]; e++) {
            int v = adj[e];
            if (vals[v] > vals[u]) continue;
            int a = find(u), b = find(v);
            if (a == b) continue;
            if (mx[a] == mx[b]) { ans += cnt[a] * cnt[b]; cnt[a] += cnt[b]; }
            else if (mx[a] < mx[b]) { mx[a] = mx[b]; cnt[a] = cnt[b]; }
            par_[b] = a;
        }
    }
    free(deg); free(start); free(fill); free(adj); free(par_); free(mx); free(cnt); free(order);
    return ans;
}`,
        cpp: `int numberOfGoodPaths(vector<int>& vals, vector<vector<int>>& edges) {
    int n = vals.size();
    vector<vector<int>> g(n);
    for (auto &e : edges) { g[e[0]].push_back(e[1]); g[e[1]].push_back(e[0]); }
    vector<int> parent(n), mx(vals), cnt(n, 1), order(n);
    iota(parent.begin(), parent.end(), 0);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return vals[a] < vals[b]; });
    function<int(int)> find = [&](int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); };
    int ans = n;
    for (int u : order)
        for (int v : g[u]) {
            if (vals[v] > vals[u]) continue;
            int a = find(u), b = find(v);
            if (a == b) continue;
            if (mx[a] == mx[b]) { ans += cnt[a] * cnt[b]; cnt[a] += cnt[b]; }
            else if (mx[a] < mx[b]) { mx[a] = mx[b]; cnt[a] = cnt[b]; }
            parent[b] = a;
        }
    return ans;
}`,
        java: `private int[] parent;

int numberOfGoodPaths(int[] vals, int[][] edges) {
    int n = vals.length;
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }
    parent = new int[n];
    int[] mx = vals.clone(), cnt = new int[n];
    Integer[] order = new Integer[n];
    for (int i = 0; i < n; i++) { parent[i] = i; cnt[i] = 1; order[i] = i; }
    Arrays.sort(order, (a, b) -> vals[a] - vals[b]);
    int ans = n;
    for (int u : order)
        for (int v : g.get(u)) {
            if (vals[v] > vals[u]) continue;
            int a = find(u), b = find(v);
            if (a == b) continue;
            if (mx[a] == mx[b]) { ans += cnt[a] * cnt[b]; cnt[a] += cnt[b]; }
            else if (mx[a] < mx[b]) { mx[a] = mx[b]; cnt[a] = cnt[b]; }
            parent[b] = a;
        }
    return ans;
}

private int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}`,
        javascript: `function numberOfGoodPaths(vals, edges) {
  const n = vals.length, g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    g[a].push(b);
    g[b].push(a);
  }
  const parent = [...Array(n).keys()], mx = [...vals], cnt = new Array(n).fill(1);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  let ans = n;
  for (const u of [...Array(n).keys()].sort((a, b) => vals[a] - vals[b]))
    for (const v of g[u]) {
      if (vals[v] > vals[u]) continue;
      const a = find(u), b = find(v);
      if (a === b) continue;
      if (mx[a] === mx[b]) {
        ans += cnt[a] * cnt[b];
        cnt[a] += cnt[b];
      } else if (mx[a] < mx[b]) {
        mx[a] = mx[b];
        cnt[a] = cnt[b];
      }
      parent[b] = a;
    }
  return ans;
}`,
      },
    },
    {
      name: '每個起點做受限 DFS',
      idea: '對每個 s,DFS 只走值 ≤ vals[s] 的節點;遇到值等於 vals[s] 且編號 > s 的節點就計數。',
      steps: ['`ans = n`', '`for s`:DFS / BFS 從 s 出發,只進入 `vals[v] <= vals[s]` 的 v', '遇到 `vals[v] == vals[s] and v > s` → `ans += 1`', '回傳 ans'],
      figure: { title: `vals = [${VALS}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個起點最壞走遍整棵樹。' },
      verdict: '定義翻譯成程式碼,用來驗證併查集版;n = 3·10⁴ 時太慢。',
      code: {
        python: `def numberOfGoodPaths(vals, edges):
    n = len(vals)
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)
    ans = n
    for s in range(n):
        st, seen = [s], {s}
        while st:
            u = st.pop()
            for v in g[u]:
                if v not in seen and vals[v] <= vals[s]:
                    seen.add(v)
                    if vals[v] == vals[s] and v > s:
                        ans += 1              # 每一對只在較小的起點算一次
                    st.append(v)
    return ans`,
        c: `int numberOfGoodPaths(int *vals, int valsSize, int **edges, int edgesSize, int *edgesColSize) {
    int n = valsSize;
    int *deg = calloc(n + 1, sizeof(int)), *start = calloc(n + 1, sizeof(int)), *fill = calloc(n, sizeof(int));
    int *adj = malloc(2 * edgesSize * sizeof(int) + 4), *st = malloc(n * sizeof(int));
    char *seen = malloc(n);
    for (int i = 0; i < edgesSize; i++) { deg[edges[i][0]]++; deg[edges[i][1]]++; }
    for (int i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0], b = edges[i][1];
        adj[start[a] + fill[a]++] = b; adj[start[b] + fill[b]++] = a;
    }
    int ans = n;
    for (int s = 0; s < n; s++) {
        memset(seen, 0, n);
        int top = 0;
        st[top++] = s; seen[s] = 1;
        while (top) {
            int u = st[--top];
            for (int e = start[u]; e < start[u + 1]; e++) {
                int v = adj[e];
                if (seen[v] || vals[v] > vals[s]) continue;
                seen[v] = 1;
                if (vals[v] == vals[s] && v > s) ans++;
                st[top++] = v;
            }
        }
    }
    free(deg); free(start); free(fill); free(adj); free(st); free(seen);
    return ans;
}`,
        cpp: `int numberOfGoodPaths(vector<int>& vals, vector<vector<int>>& edges) {
    int n = vals.size(), ans = n;
    vector<vector<int>> g(n);
    for (auto &e : edges) { g[e[0]].push_back(e[1]); g[e[1]].push_back(e[0]); }
    for (int s = 0; s < n; s++) {
        vector<bool> seen(n);
        vector<int> st{s};
        seen[s] = true;
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : g[u]) {
                if (seen[v] || vals[v] > vals[s]) continue;
                seen[v] = true;
                if (vals[v] == vals[s] && v > s) ans++;
                st.push_back(v);
            }
        }
    }
    return ans;
}`,
        java: `int numberOfGoodPaths(int[] vals, int[][] edges) {
    int n = vals.length, ans = n;
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }
    for (int s = 0; s < n; s++) {
        boolean[] seen = new boolean[n];
        Deque<Integer> st = new ArrayDeque<>();
        st.push(s); seen[s] = true;
        while (!st.isEmpty()) {
            int u = st.pop();
            for (int v : g.get(u)) {
                if (seen[v] || vals[v] > vals[s]) continue;
                seen[v] = true;
                if (vals[v] == vals[s] && v > s) ans++;
                st.push(v);
            }
        }
    }
    return ans;
}`,
        javascript: `function numberOfGoodPaths(vals, edges) {
  const n = vals.length, g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    g[a].push(b);
    g[b].push(a);
  }
  let ans = n;
  for (let s = 0; s < n; s++) {
    const seen = new Array(n).fill(false), st = [s];
    seen[s] = true;
    while (st.length) {
      const u = st.pop();
      for (const v of g[u]) {
        if (seen[v] || vals[v] > vals[s]) continue;
        seen[v] = true;
        if (vals[v] === vals[s] && v > s) ans++;
        st.push(v);
      }
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['合併時兩塊最大值不同,把小的那塊的計數加進來:那些節點不是最大值,不能算', '忘了加上 n 條單點路徑'],
  check: {
    kind: 'fn',
    fn: 'numberOfGoodPaths',
    cases: [
      { args: [VALS, E], out: 6 },
      { args: [[1, 1, 2, 2, 3], [[0, 1], [1, 2], [2, 3], [2, 4]]], out: 7 },
      { args: [[1], []], out: 1 },
      { args: [[2, 2, 2, 2], [[0, 1], [1, 2], [2, 3]]], out: 10 },
      { args: [[2, 5, 5, 1, 5, 2, 3, 5, 1, 5], [[0, 1], [2, 1], [3, 2], [3, 4], [3, 5], [5, 6], [1, 7], [8, 4], [9, 7]]], out: 20 },
    ],
  },
}
