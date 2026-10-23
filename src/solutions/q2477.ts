import { graphView } from './fig'
import type { FigStep, Solution } from './types'

// 2477. Minimum Fuel Cost to Report to the Capital

const N = 7
const E = [[3, 1], [3, 2], [1, 0], [0, 4], [0, 5], [4, 6]]
const SEATS = 2
const POS = { 0: { x: 2, y: 0 }, 1: { x: 0.5, y: 1 }, 4: { x: 2, y: 1 }, 5: { x: 3.5, y: 1 }, 3: { x: 0.5, y: 2 }, 6: { x: 2, y: 2 }, 2: { x: 0.5, y: 3 } }

function dfsFig(): FigStep[] {
  return [
    { note: `每個城市有一位代表要到首都 0 開會,每台車 ${SEATS} 個座位,代表可以中途換車、共乘。每走一條路花 1 公升油,問最少要多少油`, views: [graphView(N, E, { pos: POS, cls: { 0: 'hl' } })] },
    { note: '關鍵:看每一條邊「子樹 → 父節點」。子樹裡有 s 個代表要經過這條邊,最少需要 ⌈s / seats⌉ 台車,每台花 1 公升', views: [graphView(N, E, { pos: POS, cls: { 3: 'cur', 1: 'cur', 2: 'cur' }, edgeCls: { 2: 'hl' } })] },
    { note: '後序 DFS 算出每個子樹的人數 s(標在節點下方)。例如 1 的子樹 {1, 3, 2} 有 3 位代表,都要經過邊 1–0 → 至少 ⌈3/2⌉ = 2 台車 = 2 公升', views: [graphView(N, E, { pos: POS, subs: { 1: 's=3', 3: 's=2', 2: 's=1', 4: 's=2', 6: 's=1', 5: 's=1' } })] },
    { note: '邊 2–3:1 → 1 公升;3–1:2 → 1;1–0:3 → 2;6–4:1 → 1;4–0:2 → 1;5–0:1 → 1。總共 7', views: [graphView(N, E, { pos: POS, cls: { 0: 'done' } })] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: '不用遞迴:從葉子往首都「剝洋蔥」(拓撲排序)。葉子的代表數 = 1,處理完就把人數加到它唯一的鄰居上', views: [graphView(N, E, { pos: POS, cls: { 2: 'hl', 5: 'hl', 6: 'hl' } })] },
    { note: '每剝掉一個節點 u(人數 s),就花 ⌈s / seats⌉ 公升走到鄰居。度數降到 1 的節點變成新的葉子(首都 0 不剝)', views: [graphView(N, E, { pos: POS, cls: { 2: 'dim', 5: 'dim', 6: 'dim', 3: 'hl', 4: 'hl' } })] },
  ]
}

export const q2477: Solution = {
  id: 2477,
  plain: '一個國家的城市連成一棵樹,首都是 0。每個城市派一位代表開車去首都開會,每台車 seats 個座位,代表們可以在路上的城市換車、一起坐。每開過一條路花 1 公升油,最少總共要多少油?',
  statement: '給一棵 n 個節點的樹(`roads` 為邊)、每台車的座位數 `seats`。每個城市(除了 0)各有一位代表要到城市 0,代表可以在途中換搭別人的車。每台車走一條路消耗 1 公升油,回傳最少油量。',
  examples: [
    { input: 'roads = [[0,1],[0,2],[0,3]], seats = 5', output: '3' },
    { input: 'roads = [[3,1],[3,2],[1,0],[0,4],[0,5],[4,6]], seats = 2', output: '7' },
    { input: 'roads = [], seats = 1', output: '0' },
  ],
  constraints: ['n ≤ 10⁵', '答案可能超過 int(用 64 位元)'],
  insight: ['大家都往首都走,而且越靠近首都越能合併 → 每條邊的成本只跟「經過它的人數」有關', '經過邊 (子 → 父) 的人數 = 子樹大小 s,至少 ⌈s / seats⌉ 台車', '後序 DFS 算子樹大小,邊加邊累積答案'],
  approaches: [
    {
      name: '後序 DFS 算子樹大小',
      idea: '`dfs(u, parent)` 回傳 u 的子樹人數 s;對每個非根節點,`ans += ceil(s / seats)`。',
      steps: ['建鄰接串列', '`dfs(u, p)`:`s = 1`;對每個鄰居 v ≠ p:`s += dfs(v, u)`', '`u != 0` → `ans += (s + seats − 1) // seats`', '回傳 s;答案是 `ans`'],
      figure: { title: `seats = ${SEATS}`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點、每條邊一次;遞迴深度最多 n。' },
      verdict: '最推薦。「每條邊貢獻多少」的思考方式,把複雜的換車過程變成簡單的子樹大小。',
      code: {
        python: `import sys

def minimumFuelCost(roads, seats):
    sys.setrecursionlimit(300000)
    n = len(roads) + 1
    g = [[] for _ in range(n)]
    for a, b in roads:
        g[a].append(b)
        g[b].append(a)
    ans = 0

    def dfs(u, p):
        nonlocal ans
        s = 1                                 # 自己這位代表
        for v in g[u]:
            if v != p:
                s += dfs(v, u)
        if u != 0:
            ans += (s + seats - 1) // seats   # s 個人經過 u → p 這條邊
        return s

    dfs(0, -1)
    return ans`,
        c: `// 用迭代 DFS 避免深樹的遞迴爆堆疊:先求出 DFS 順序,再倒著累加子樹大小
long long minimumFuelCost(int **roads, int roadsSize, int *roadsColSize, int seats) {
    int n = roadsSize + 1;
    int *deg = calloc(n + 1, sizeof(int)), *start = calloc(n + 1, sizeof(int)), *adj = malloc(2 * roadsSize * sizeof(int) + 4);
    for (int i = 0; i < roadsSize; i++) { deg[roads[i][0]]++; deg[roads[i][1]]++; }
    for (int i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
    int *fill = calloc(n, sizeof(int));
    for (int i = 0; i < roadsSize; i++) {
        int a = roads[i][0], b = roads[i][1];
        adj[start[a] + fill[a]++] = b; adj[start[b] + fill[b]++] = a;
    }
    int *order = malloc(n * sizeof(int)), *par = malloc(n * sizeof(int)), *st = malloc(n * sizeof(int));
    long long *sz = malloc(n * sizeof(long long));
    int top = 0, k = 0;
    st[top++] = 0; par[0] = -1;
    while (top) {
        int u = st[--top];
        order[k++] = u;
        for (int e = start[u]; e < start[u + 1]; e++)
            if (adj[e] != par[u]) { par[adj[e]] = u; st[top++] = adj[e]; }
    }
    long long ans = 0;
    for (int i = n - 1; i >= 0; i--) {          // 倒著:孩子一定比父親先處理
        int u = order[i];
        sz[u] = 1;
        for (int e = start[u]; e < start[u + 1]; e++) if (adj[e] != par[u]) sz[u] += sz[adj[e]];
        if (u != 0) ans += (sz[u] + seats - 1) / seats;
    }
    free(deg); free(start); free(adj); free(fill); free(order); free(par); free(st); free(sz);
    return ans;
}`,
        cpp: `long long minimumFuelCost(vector<vector<int>>& roads, int seats) {
    int n = roads.size() + 1;
    vector<vector<int>> g(n);
    for (auto &r : roads) { g[r[0]].push_back(r[1]); g[r[1]].push_back(r[0]); }
    long long ans = 0;
    function<long long(int, int)> dfs = [&](int u, int p) -> long long {
        long long s = 1;
        for (int v : g[u]) if (v != p) s += dfs(v, u);
        if (u != 0) ans += (s + seats - 1) / seats;
        return s;
    };
    dfs(0, -1);
    return ans;
}`,
        java: `private List<List<Integer>> g;
private long ans;
private int seats;

long minimumFuelCost(int[][] roads, int seats) {
    int n = roads.length + 1;
    this.seats = seats;
    g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] r : roads) { g.get(r[0]).add(r[1]); g.get(r[1]).add(r[0]); }
    ans = 0;
    dfs(0, -1);
    return ans;
}

private long dfs(int u, int p) {
    long s = 1;
    for (int v : g.get(u)) if (v != p) s += dfs(v, u);
    if (u != 0) ans += (s + seats - 1) / seats;
    return s;
}`,
        javascript: `function minimumFuelCost(roads, seats) {
  const n = roads.length + 1, g = Array.from({ length: n }, () => []);
  for (const [a, b] of roads) {
    g[a].push(b);
    g[b].push(a);
  }
  let ans = 0;
  const dfs = (u, p) => {
    let s = 1;
    for (const v of g[u]) if (v !== p) s += dfs(v, u);
    if (u !== 0) ans += Math.ceil(s / seats);
    return s;
  };
  dfs(0, -1);
  return ans;
}`,
      },
    },
    {
      name: '從葉子往首都剝(拓撲順序)',
      idea: '度數為 1 的非首都節點入隊(葉子);取出 u:`ans += ceil(people[u] / seats)`,把 people[u] 加到它還沒被剝掉的鄰居,鄰居度數降到 1 就入隊。',
      steps: ['`people = [1] * n`;算度數', '度數 1 且不是 0 的節點入隊', '取出 u:`ans += ceil(people[u] / seats)`;唯一還在的鄰居 v:`people[v] += people[u]`、`deg[v] -= 1`', '`deg[v] == 1 and v != 0` → 入隊'],
      figure: { title: `seats = ${SEATS}`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點出隊一次。' },
      verdict: '完全不用遞迴,n = 10⁵ 的長鏈也不怕;邏輯就是「人從外往內匯集」。',
      code: {
        python: `from collections import deque

def minimumFuelCost(roads, seats):
    n = len(roads) + 1
    g = [[] for _ in range(n)]
    for a, b in roads:
        g[a].append(b)
        g[b].append(a)
    deg = [len(x) for x in g]
    people = [1] * n
    removed = [False] * n
    q = deque(u for u in range(1, n) if deg[u] == 1)
    ans = 0
    while q:
        u = q.popleft()
        removed[u] = True
        ans += (people[u] + seats - 1) // seats   # u 這群人往內走一條邊
        for v in g[u]:
            if not removed[v]:
                people[v] += people[u]
                deg[v] -= 1
                if deg[v] == 1 and v != 0:
                    q.append(v)
    return ans`,
        c: `long long minimumFuelCost(int **roads, int roadsSize, int *roadsColSize, int seats) {
    int n = roadsSize + 1;
    int *deg = calloc(n, sizeof(int)), *start = calloc(n + 1, sizeof(int)), *fill = calloc(n, sizeof(int));
    int *adj = malloc(2 * roadsSize * sizeof(int) + 4), *q = malloc(n * sizeof(int));
    char *removed = calloc(n, 1);
    long long *people = malloc(n * sizeof(long long)), ans = 0;
    for (int i = 0; i < roadsSize; i++) { deg[roads[i][0]]++; deg[roads[i][1]]++; }
    for (int i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
    for (int i = 0; i < roadsSize; i++) {
        int a = roads[i][0], b = roads[i][1];
        adj[start[a] + fill[a]++] = b; adj[start[b] + fill[b]++] = a;
    }
    int h = 0, t = 0;
    for (int u = 0; u < n; u++) { people[u] = 1; if (u && deg[u] == 1) q[t++] = u; }
    while (h < t) {
        int u = q[h++];
        removed[u] = 1;
        ans += (people[u] + seats - 1) / seats;
        for (int e = start[u]; e < start[u + 1]; e++) {
            int v = adj[e];
            if (removed[v]) continue;
            people[v] += people[u];
            if (--deg[v] == 1 && v != 0) q[t++] = v;
        }
    }
    free(deg); free(start); free(fill); free(adj); free(q); free(removed); free(people);
    return ans;
}`,
        cpp: `long long minimumFuelCost(vector<vector<int>>& roads, int seats) {
    int n = roads.size() + 1;
    vector<vector<int>> g(n);
    for (auto &r : roads) { g[r[0]].push_back(r[1]); g[r[1]].push_back(r[0]); }
    vector<int> deg(n);
    vector<long long> people(n, 1);
    vector<bool> removed(n);
    queue<int> q;
    for (int u = 0; u < n; u++) { deg[u] = g[u].size(); if (u && deg[u] == 1) q.push(u); }
    long long ans = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        removed[u] = true;
        ans += (people[u] + seats - 1) / seats;
        for (int v : g[u]) {
            if (removed[v]) continue;
            people[v] += people[u];
            if (--deg[v] == 1 && v != 0) q.push(v);
        }
    }
    return ans;
}`,
        java: `long minimumFuelCost(int[][] roads, int seats) {
    int n = roads.length + 1;
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] r : roads) { g.get(r[0]).add(r[1]); g.get(r[1]).add(r[0]); }
    int[] deg = new int[n];
    long[] people = new long[n];
    boolean[] removed = new boolean[n];
    Deque<Integer> q = new ArrayDeque<>();
    for (int u = 0; u < n; u++) { deg[u] = g.get(u).size(); people[u] = 1; if (u != 0 && deg[u] == 1) q.offer(u); }
    long ans = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        removed[u] = true;
        ans += (people[u] + seats - 1) / seats;
        for (int v : g.get(u)) {
            if (removed[v]) continue;
            people[v] += people[u];
            if (--deg[v] == 1 && v != 0) q.offer(v);
        }
    }
    return ans;
}`,
        javascript: `function minimumFuelCost(roads, seats) {
  const n = roads.length + 1, g = Array.from({ length: n }, () => []);
  for (const [a, b] of roads) {
    g[a].push(b);
    g[b].push(a);
  }
  const deg = g.map((x) => x.length), people = new Array(n).fill(1), removed = new Array(n).fill(false);
  const q = [];
  for (let u = 1; u < n; u++) if (deg[u] === 1) q.push(u);
  let ans = 0;
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    removed[u] = true;
    ans += Math.ceil(people[u] / seats);
    for (const v of g[u]) {
      if (removed[v]) continue;
      people[v] += people[u];
      if (--deg[v] === 1 && v !== 0) q.push(v);
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['試圖模擬「誰坐誰的車」:不需要,只要每條邊上的人數', '首都自己不用再往上走,不要把它算進去', '答案用 int:最多約 10⁵ 條邊 × 10⁵ 台車,要用 64 位元'],
  check: {
    kind: 'fn',
    fn: 'minimumFuelCost',
    cases: [
      { args: [[[0, 1], [0, 2], [0, 3]], 5], out: 3 },
      { args: [E, SEATS], out: 7 },
      { args: [[], 1], out: 0 },
      { args: [[[0, 1], [1, 2], [2, 3]], 1], out: 6 },
    ],
  },
}
