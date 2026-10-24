import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 743. Network Delay Time

const TIMES = [
  [1, 2, 4],
  [1, 3, 1],
  [3, 2, 2],
  [2, 4, 1],
  [3, 4, 5],
  [4, 5, 3],
]
const N = 5
const K = 1
const POS = { 1: { x: 0, y: 1 }, 2: { x: 1.6, y: 0 }, 3: { x: 1.6, y: 2 }, 4: { x: 3.2, y: 1 }, 5: { x: 4.8, y: 1 } }
const fmt = (d: number) => (d === Infinity ? '∞' : String(d))

function dijkstraFig(): FigStep[] {
  const dist = Array(N + 1).fill(Infinity)
  dist[K] = 0
  const done = new Set<number>()
  const out: FigStep[] = [{ note: `從節點 ${K} 發出訊號,邊上的數字是傳過去要花的時間。dist = 目前知道的最短到達時間。Dijkstra:每次挑「還沒確定、而且 dist 最小」的節點,它的 dist 就不會再變小了 → 確定它,再用它去更新鄰居`, views: [graphView(N, TIMES, { base: 1, directed: true, pos: POS, subs: Object.fromEntries(dist.slice(1).map((d, i) => [i + 1, fmt(d)])) })] }]
  for (;;) {
    let u = -1
    for (let i = 1; i <= N; i++) if (!done.has(i) && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i
    if (u < 0) break
    done.add(u)
    const upd: string[] = []
    TIMES.forEach(([a, b, w]) => {
      if (a === u && dist[u] + w < dist[b]) {
        upd.push(`${b}:${fmt(dist[b])}→${dist[u] + w}`)
        dist[b] = dist[u] + w
      }
    })
    out.push({
      note: `沒確定的節點裡 ${u} 最近(${dist[u]})→ 確定它。從 ${u} 出發更新鄰居${upd.length ? `:${upd.join('、')}` : ',沒有變得更短的'}`,
      views: [graphView(N, TIMES, { base: 1, directed: true, pos: POS, cls: { ...Object.fromEntries([...done].map((x) => [x, 'done'])), [u]: 'hl' }, subs: Object.fromEntries(dist.slice(1).map((d, i) => [i + 1, fmt(d)])), edgeCls: Object.fromEntries(TIMES.flatMap(([a], k) => (a === u ? [[k, 'hl']] : []))) })],
    })
  }
  const mx = Math.max(...dist.slice(1))
  out.push({ note: mx === Infinity ? '有節點收不到 → −1' : `所有節點都確定了,最晚收到的是 ${mx} → 答案 ${mx}`, views: [arr(dist.slice(1).map(fmt), { label: '節點 1 ~ 5 的最短時間' })] })
  return out
}

function bellmanFig(): FigStep[] {
  const dist = Array(N + 1).fill(Infinity)
  dist[K] = 0
  const out: FigStep[] = [{ note: 'Bellman-Ford:不挑順序,每一輪把**所有邊**都試著鬆弛一次(用 u 的距離 + 邊長更新 v)。最短路最多經過 n − 1 條邊,所以 n − 1 輪一定夠', views: [arr(dist.slice(1).map(fmt), { label: 'dist(節點 1 ~ 5)' })] }]
  for (let round = 1; round < N; round++) {
    let changed = false
    for (const [u, v, w] of TIMES)
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        changed = true
      }
    out.push({ note: `第 ${round} 輪:每條邊都試一次${changed ? '' : ',什麼都沒變 → 可以提早結束'}`, views: [arr(dist.slice(1).map(fmt), { label: 'dist' })] })
    if (!changed) break
  }
  return out
}

export const q0743: Solution = {
  id: 743,
  plain: '一個網路有 n 台電腦,線路是單向的,每條線傳訊息要花不同的時間。從某一台發出訊號,問最少要多久**所有**電腦都收到;有電腦永遠收不到就回傳 −1。答案就是「離起點最遠的那台」的最短到達時間。',
  statement: '有 n 個節點(1 ~ n),`times[i] = [u, v, w]` 表示訊號從 u 傳到 v 要 w 時間(有向)。從節點 k 發出訊號,回傳所有節點都收到的最短時間;做不到回傳 -1。',
  examples: [
    { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2' },
    { input: 'times = [[1,2,1]], n = 2, k = 2', output: '-1', note: '從 2 沒辦法到 1' },
  ],
  constraints: ['`n ≤ 100`,邊數 ≤ 6000,權重 `0 ≤ w ≤ 100`(非負)'],
  insight: [
    '每個節點收到的時間 = 從 k 到它的**最短路徑**長度;所有節點都收到 = 最遠的那個最短距離',
    '權重都是非負 → **Dijkstra**:每次確定一個「目前最近」的節點,它的距離不可能再被別的路縮短(繞路只會更長)',
    '用最小堆挑最近的節點:O(E log V)',
    'Bellman-Ford 也行:每輪鬆弛所有邊,最多 n − 1 輪;比較慢,但能處理負權重',
  ],
  approaches: [
    {
      name: 'Bellman-Ford',
      idea: '`dist[k] = 0`,其他 ∞。重複 n − 1 輪:對每條邊 u → v,`dist[v] = min(dist[v], dist[u] + w)`。',
      steps: ['`dist = [∞] * (n + 1)`,`dist[k] = 0`', '`n − 1` 輪:每條邊都鬆弛一次(這一輪沒有改變就提早結束)', '`max(dist[1..n])` 是 ∞ → −1,否則回傳它'],
      figure: { title: `times = ${JSON.stringify(TIMES)}, n = ${N}, k = ${K}`, steps: bellmanFig() },
      complexity: { time: 'O(V · E)', space: 'O(V)', why: '最多 V − 1 輪,每輪 E 條邊。' },
      verdict: '程式最短,也能處理負權重(這題用不到)。',
      code: {
        python: `def networkDelayTime(times, n, k):
    INF = float('inf')
    dist = [INF] * (n + 1)
    dist[k] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in times:
            if dist[u] + w < dist[v]:     # 鬆弛:經過 u 到 v 比較快
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    ans = max(dist[1:])
    return -1 if ans == INF else ans`,
        c: `int networkDelayTime(int **times, int timesSize, int *timesColSize, int n, int k) {
    int dist[101];
    for (int i = 1; i <= n; i++) dist[i] = INT_MAX;
    dist[k] = 0;
    for (int r = 1; r < n; r++) {
        bool changed = false;
        for (int i = 0; i < timesSize; i++) {
            int u = times[i][0], v = times[i][1], w = times[i][2];
            if (dist[u] != INT_MAX && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
        }
        if (!changed) break;
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INT_MAX) return -1;
        if (dist[i] > ans) ans = dist[i];
    }
    return ans;
}`,
        cpp: `int networkDelayTime(vector<vector<int>>& times, int n, int k) {
    vector<int> dist(n + 1, INT_MAX);
    dist[k] = 0;
    for (int r = 1; r < n; r++) {
        bool changed = false;
        for (auto& t : times)
            if (dist[t[0]] != INT_MAX && dist[t[0]] + t[2] < dist[t[1]]) { dist[t[1]] = dist[t[0]] + t[2]; changed = true; }
        if (!changed) break;
    }
    int ans = *max_element(dist.begin() + 1, dist.end());
    return ans == INT_MAX ? -1 : ans;
}`,
        java: `int networkDelayTime(int[][] times, int n, int k) {
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;
    for (int r = 1; r < n; r++) {
        boolean changed = false;
        for (int[] t : times)
            if (dist[t[0]] != Integer.MAX_VALUE && dist[t[0]] + t[2] < dist[t[1]]) { dist[t[1]] = dist[t[0]] + t[2]; changed = true; }
        if (!changed) break;
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == Integer.MAX_VALUE) return -1;
        ans = Math.max(ans, dist[i]);
    }
    return ans;
}`,
        javascript: `function networkDelayTime(times, n, k) {
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  for (let r = 1; r < n; r++) {
    let changed = false;
    for (const [u, v, w] of times)
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    if (!changed) break;
  }
  const ans = Math.max(...dist.slice(1));
  return ans === Infinity ? -1 : ans;
}`,
      },
    },
    {
      name: 'Dijkstra + 最小堆',
      idea: '最小堆放 `(距離, 節點)`。每次拿出距離最小的:已經確定過就跳過;否則確定它,用它更新所有鄰居,變短的放進堆。',
      steps: ['建鄰接串列;`heap = [(0, k)]`', '拿出 `(d, u)`:u 已確定 → 跳過', '確定 u(`dist[u] = d`);對每個 `(v, w)`:`d + w` 更短就 push', '全部確定 → 回傳最大的 dist;有沒確定的 → −1'],
      figure: { title: `times = ${JSON.stringify(TIMES)}, n = ${N}, k = ${K}(節點下方是目前的最短時間)`, steps: dijkstraFig() },
      complexity: { time: 'O(E log V)', space: 'O(V + E)', why: '每條邊最多讓堆多一個元素,每次堆操作 O(log E) = O(log V)。C / JavaScript 版利用 n ≤ 100 改用 O(V²) 線性挑選、不用堆,時間 O(V² + E)。' },
      verdict: '標準解,[[p:dijkstra]]的模板。權重非負才能用:有負邊的話,「確定了就不會變」的保證會失效。',
      code: {
        python: `import heapq

def networkDelayTime(times, n, k):
    adj = [[] for _ in range(n + 1)]
    for u, v, w in times:
        adj[u].append((v, w))
    dist = {}
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in dist:
            continue                      # 已經確定過(堆裡的舊資料)
        dist[u] = d                       # 第一次拿出來 = 最短距離
        for v, w in adj[u]:
            if v not in dist:
                heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1`,
        c: `// n ≤ 100:用 O(V²) 的 Dijkstra(每次線性找最近的),不需要堆
int networkDelayTime(int **times, int timesSize, int *timesColSize, int n, int k) {
    int w[101][101], dist[101];
    bool done[101] = {false};
    for (int i = 1; i <= n; i++) { dist[i] = INT_MAX; for (int j = 1; j <= n; j++) w[i][j] = -1; }
    for (int i = 0; i < timesSize; i++) w[times[i][0]][times[i][1]] = times[i][2];
    dist[k] = 0;
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int i = 1; i <= n; i++) if (!done[i] && dist[i] != INT_MAX && (u < 0 || dist[i] < dist[u])) u = i;
        if (u < 0) break;
        done[u] = true;
        for (int v = 1; v <= n; v++)
            if (w[u][v] >= 0 && dist[u] + w[u][v] < dist[v]) dist[v] = dist[u] + w[u][v];
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INT_MAX) return -1;
        if (dist[i] > ans) ans = dist[i];
    }
    return ans;
}`,
        cpp: `int networkDelayTime(vector<vector<int>>& times, int n, int k) {
    vector<vector<pair<int, int>>> adj(n + 1);
    for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
    vector<int> dist(n + 1, INT_MAX);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;   // (距離, 節點)
    pq.push({0, k});
    dist[k] = 0;
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;            // 舊資料
        for (auto [v, w] : adj[u])
            if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
    }
    int ans = *max_element(dist.begin() + 1, dist.end());
    return ans == INT_MAX ? -1 : ans;
}`,
        java: `int networkDelayTime(int[][] times, int n, int k) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
    for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);   // {距離, 節點}
    pq.offer(new int[]{0, k});
    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;
        for (int[] e : adj.get(u))
            if (d + e[1] < dist[e[0]]) { dist[e[0]] = d + e[1]; pq.offer(new int[]{dist[e[0]], e[0]}); }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == Integer.MAX_VALUE) return -1;
        ans = Math.max(ans, dist[i]);
    }
    return ans;
}`,
        javascript: `function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) adj[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  const done = new Array(n + 1).fill(false);
  dist[k] = 0;
  // n ≤ 100:每次線性挑最近的未確定節點(O(V²) 版 Dijkstra)
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let i = 1; i <= n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break;
    done[u] = true;
    for (const [v, w] of adj[u]) dist[v] = Math.min(dist[v], dist[u] + w);
  }
  const ans = Math.max(...dist.slice(1));
  return ans === Infinity ? -1 : ans;
}`,
      },
    },
  ],
  pitfalls: [
    '答案是**最大**的最短距離(最晚收到的那個),不是總和',
    'dist 用 INT_MAX 時,`dist[u] + w` 會溢位:先檢查 `dist[u]` 是不是無限大',
    'Dijkstra 從堆拿出已經確定過的節點要跳過(堆裡會留著舊的、比較大的距離)',
    '節點從 1 開始編號,取 max 時不要算到 `dist[0]`',
  ],
  followUp: [{ q: '最多只能經過 k 站?', a: '[787. Cheapest Flights Within K Stops](#/q/787):限制邊數時 Dijkstra 的「確定就不變」不成立,改用 k + 1 輪的 Bellman-Ford。' }],
  check: {
    kind: 'fn',
    fn: 'networkDelayTime',
    cases: [
      { args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], out: 2 },
      { args: [[[1, 2, 1]], 2, 1], out: 1 },
      { args: [[[1, 2, 1]], 2, 2], out: -1 },
      { args: [TIMES, N, K], out: 7 },
      { args: [[[1, 2, 1], [2, 3, 2], [1, 3, 4]], 3, 1], out: 3 },
    ],
  },
}
