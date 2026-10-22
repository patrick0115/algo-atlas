import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 787. Cheapest Flights Within K Stops

const N = 4
const FL = [
  [0, 1, 100],
  [1, 2, 100],
  [2, 0, 100],
  [1, 3, 600],
  [2, 3, 200],
]
const SRC = 0
const DST = 3
const K = 1
const POS = { 0: { x: 0, y: 1 }, 1: { x: 1.6, y: 0 }, 2: { x: 1.6, y: 2 }, 3: { x: 3.2, y: 1 } }
const fmt = (d: number) => (d === Infinity ? '∞' : String(d))

function bfFig(): FigStep[] {
  let dist = Array(N).fill(Infinity)
  dist[SRC] = 0
  const rows: string[][] = [dist.map(fmt)]
  const table = (hl: number): GridViewData => ({ kind: 'grid', label: '第 i 列 = 最多搭 i 段航班時,到每個城市的最低價', cells: rows.map((r) => [...r]), rowLabels: rows.map((_, i) => `${i} 段`), colLabels: Array.from({ length: N }, (_, i) => `城市${i}`), marks: { hl: hl >= 0 ? [[hl, DST]] : [] } })
  const out: FigStep[] = [{ note: `最多轉 k = ${K} 次 = 最多搭 k + 1 = ${K + 1} 段航班。Bellman-Ford 的第 i 輪剛好代表「最多用 i 條邊」,所以只跑 ${K + 1} 輪`, views: [graphView(N, FL, { directed: true, pos: POS }), table(-1)] }]
  for (let r = 1; r <= K + 1; r++) {
    const next = [...dist]
    const upd: string[] = []
    for (const [u, v, w] of FL)
      if (dist[u] + w < next[v]) {
        next[v] = dist[u] + w
        upd.push(`${v}:${dist[u]}+${w}=${next[v]}`)
      }
    dist = next
    rows.push(dist.map(fmt))
    out.push({ note: `第 ${r} 輪(最多 ${r} 段):每條航班都用「上一輪」的價格去更新 → ${upd.join('、') || '沒有變化'}`, views: [graphView(N, FL, { directed: true, pos: POS, subs: Object.fromEntries(dist.map((d, i) => [i, fmt(d)])) }), table(r)] })
  }
  out.push({ note: `答案 = 最多 ${K + 1} 段時到城市 ${DST} 的價格 ${fmt(dist[DST])}。注意 0→1→2→3 只要 400,但要搭 3 段,超過限制`, views: [table(K + 1)] })
  return out
}

function bfsFig(): FigStep[] {
  const best = Array(N).fill(Infinity)
  best[SRC] = 0
  let level: [number, number][] = [[SRC, 0]]
  const out: FigStep[] = [{ note: '也可以用 BFS 一層一層走:第 i 層 = 搭 i 段航班能到的城市和花費。只有比之前更便宜才繼續往下擴展', views: [graphView(N, FL, { directed: true, pos: POS }), arr(level.map(([c, p]) => `${c}:${p}`), { label: '這一層(城市:花費)' })] }]
  for (let stops = 0; stops <= K && level.length; stops++) {
    const next: [number, number][] = []
    for (const [u, cost] of level)
      for (const [a, b, w] of FL)
        if (a === u && cost + w < best[b]) {
          best[b] = cost + w
          next.push([b, cost + w])
        }
    level = next
    out.push({ note: `搭第 ${stops + 1} 段:${next.map(([c, p]) => `到 ${c} 花 ${p}`).join('、') || '沒有更便宜的'}`, views: [graphView(N, FL, { directed: true, pos: POS, subs: Object.fromEntries(best.map((d, i) => [i, fmt(d)])) }), arr(level.map(([c, p]) => `${c}:${p}`), { label: '這一層' })] })
  }
  return out
}

export const q0787: Solution = {
  id: 787,
  plain: '有很多城市和航班,每班飛機有票價。從出發城市飛到目的地,**最多只能轉機 k 次**,問最便宜要多少錢;到不了就回傳 −1。難處是:最便宜的路線可能轉太多次,不能用。',
  statement: '`flights[i] = [from, to, price]`。從 `src` 到 `dst`,最多經過 `k` 個中轉站(也就是最多搭 k + 1 段航班),回傳最低總票價;沒有這種路線回傳 -1。',
  examples: [
    { input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1', output: '700', note: '0→1→3;0→1→2→3 只要 400 但轉了 2 次' },
    { input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1', output: '200' },
    { input: '同上, k = 0', output: '500' },
  ],
  constraints: ['`n ≤ 100`,`k < n`,票價都是正的'],
  insight: [
    '沒有轉機限制的話,就是 Dijkstra 最短路。但有了「最多 k 站」,一條比較貴、但轉機少的路可能才是答案,Dijkstra「最便宜的先確定」就不成立了',
    'Bellman-Ford 的第 i 輪剛好代表「最多用 i 條邊的最短路」→ 跑 **k + 1 輪**就是答案',
    '關鍵細節:每一輪都要用**上一輪的副本**更新,不然同一輪裡可能連續走好幾條邊,超過限制',
    'BFS 的角度:第 i 層 = 搭 i 段。只往下展開「比之前更便宜」的狀態',
  ],
  approaches: [
    {
      name: 'Bellman-Ford(k + 1 輪,每輪用上一輪的副本)',
      idea: '`dist[src] = 0`。做 k + 1 輪:`next = dist 的副本`,對每條航班 u → v:`next[v] = min(next[v], dist[u] + w)`(右邊用的是上一輪的 dist),再 `dist = next`。',
      steps: ['`dist = [∞] * n`、`dist[src] = 0`', '重複 k + 1 次:`tmp = dist.copy()`', '每條航班:`dist[u] + w < tmp[v]` → `tmp[v] = dist[u] + w`', '`dist = tmp`', '回傳 `dist[dst]`(∞ → −1)'],
      figure: { title: `src = ${SRC}, dst = ${DST}, k = ${K}`, steps: bfFig() },
      complexity: { time: 'O(k · E)', space: 'O(n)', why: 'k + 1 輪,每輪看一次所有航班。' },
      verdict: '標準解,最簡潔。「每輪用副本」是這題的靈魂,也展示了 Bellman-Ford 的「第 i 輪 = 最多 i 條邊」這個性質([[p:dp-general]]的觀點)。',
      code: {
        python: `def findCheapestPrice(n, flights, src, dst, k):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for _ in range(k + 1):                # 最多搭 k + 1 段
        tmp = dist[:]                     # 用上一輪的值更新,避免同一輪連飛好幾段
        for u, v, w in flights:
            if dist[u] + w < tmp[v]:
                tmp[v] = dist[u] + w
        dist = tmp
    return dist[dst] if dist[dst] < INF else -1`,
        c: `int findCheapestPrice(int n, int **flights, int flightsSize, int *flightsColSize, int src, int dst, int k) {
    int dist[100], tmp[100];
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[src] = 0;
    for (int r = 0; r <= k; r++) {
        memcpy(tmp, dist, n * sizeof(int));
        for (int i = 0; i < flightsSize; i++) {
            int u = flights[i][0], v = flights[i][1], w = flights[i][2];
            if (dist[u] != INT_MAX && dist[u] + w < tmp[v]) tmp[v] = dist[u] + w;
        }
        memcpy(dist, tmp, n * sizeof(int));
    }
    return dist[dst] == INT_MAX ? -1 : dist[dst];
}`,
        cpp: `int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
    vector<int> dist(n, INT_MAX);
    dist[src] = 0;
    for (int r = 0; r <= k; r++) {
        vector<int> tmp = dist;
        for (auto& f : flights)
            if (dist[f[0]] != INT_MAX && dist[f[0]] + f[2] < tmp[f[1]]) tmp[f[1]] = dist[f[0]] + f[2];
        dist = tmp;
    }
    return dist[dst] == INT_MAX ? -1 : dist[dst];
}`,
        java: `int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    for (int r = 0; r <= k; r++) {
        int[] tmp = dist.clone();
        for (int[] f : flights)
            if (dist[f[0]] != Integer.MAX_VALUE && dist[f[0]] + f[2] < tmp[f[1]]) tmp[f[1]] = dist[f[0]] + f[2];
        dist = tmp;
    }
    return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
}`,
        javascript: `function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let r = 0; r <= k; r++) {
    const tmp = [...dist];
    for (const [u, v, w] of flights) if (dist[u] + w < tmp[v]) tmp[v] = dist[u] + w;
    dist = tmp;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}`,
      },
    },
    {
      name: 'BFS 分層(層數 = 搭了幾段)',
      idea: '佇列放 `(城市, 花費)`,一層代表多搭一段。`best[v]` 記到 v 的最低價,只有更便宜才放進下一層。最多展開 k + 1 層。',
      steps: ['`best[src] = 0`,`q = [(src, 0)]`', '重複 k + 1 次(佇列不空):處理這一層的每個 `(u, cost)`', '每條 u → v:`cost + w < best[v]` → 更新並放進下一層', '回傳 `best[dst]`'],
      figure: { title: `src = ${SRC}, dst = ${DST}, k = ${K}`, steps: bfsFig() },
      complexity: { time: 'O(k · E)', space: 'O(n + E)', why: '每層最多把每條邊用一次。' },
      verdict: '和 Bellman-Ford 等價,但只從「這一層有更新的城市」往外走,通常比較快。',
      code: {
        python: `from collections import deque

def findCheapestPrice(n, flights, src, dst, k):
    adj = [[] for _ in range(n)]
    for u, v, w in flights:
        adj[u].append((v, w))
    best = [float('inf')] * n
    best[src] = 0
    q = deque([(src, 0)])
    for _ in range(k + 1):
        for _ in range(len(q)):           # 這一層 = 再搭一段
            u, cost = q.popleft()
            for v, w in adj[u]:
                if cost + w < best[v]:
                    best[v] = cost + w
                    q.append((v, cost + w))
    return best[dst] if best[dst] < float('inf') else -1`,
        c: `int findCheapestPrice(int n, int **flights, int flightsSize, int *flightsColSize, int src, int dst, int k) {
    int best[100], qc[10000], qp[10000], nc[10000], np[10000], qn = 0;
    for (int i = 0; i < n; i++) best[i] = INT_MAX;
    best[src] = 0;
    qc[qn] = src; qp[qn++] = 0;
    for (int r = 0; r <= k && qn; r++) {
        int m = 0;
        for (int i = 0; i < qn; i++)
            for (int e = 0; e < flightsSize; e++) {
                if (flights[e][0] != qc[i]) continue;
                int v = flights[e][1], c = qp[i] + flights[e][2];
                if (c < best[v]) { best[v] = c; nc[m] = v; np[m++] = c; }
            }
        memcpy(qc, nc, m * sizeof(int));
        memcpy(qp, np, m * sizeof(int));
        qn = m;
    }
    return best[dst] == INT_MAX ? -1 : best[dst];
}`,
        cpp: `int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
    vector<vector<pair<int, int>>> adj(n);
    for (auto& f : flights) adj[f[0]].push_back({f[1], f[2]});
    vector<int> best(n, INT_MAX);
    best[src] = 0;
    queue<pair<int, int>> q;
    q.push({src, 0});
    for (int r = 0; r <= k && !q.empty(); r++)
        for (int s = q.size(); s > 0; s--) {
            auto [u, cost] = q.front(); q.pop();
            for (auto [v, w] : adj[u])
                if (cost + w < best[v]) { best[v] = cost + w; q.push({v, cost + w}); }
        }
    return best[dst] == INT_MAX ? -1 : best[dst];
}`,
        java: `int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] f : flights) adj.get(f[0]).add(new int[]{f[1], f[2]});
    int[] best = new int[n];
    Arrays.fill(best, Integer.MAX_VALUE);
    best[src] = 0;
    Deque<int[]> q = new ArrayDeque<>();
    q.offer(new int[]{src, 0});
    for (int r = 0; r <= k && !q.isEmpty(); r++)
        for (int s = q.size(); s > 0; s--) {
            int[] cur = q.poll();
            for (int[] e : adj.get(cur[0]))
                if (cur[1] + e[1] < best[e[0]]) { best[e[0]] = cur[1] + e[1]; q.offer(new int[]{e[0], best[e[0]]}); }
        }
    return best[dst] == Integer.MAX_VALUE ? -1 : best[dst];
}`,
        javascript: `function findCheapestPrice(n, flights, src, dst, k) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of flights) adj[u].push([v, w]);
  const best = new Array(n).fill(Infinity);
  best[src] = 0;
  let level = [[src, 0]];
  for (let r = 0; r <= k && level.length; r++) {
    const next = [];
    for (const [u, cost] of level)
      for (const [v, w] of adj[u])
        if (cost + w < best[v]) {
          best[v] = cost + w;
          next.push([v, cost + w]);
        }
    level = next;
  }
  return best[dst] === Infinity ? -1 : best[dst];
}`,
      },
    },
  ],
  pitfalls: [
    'Bellman-Ford 同一輪直接在 dist 上更新:一輪裡可能連續飛 0→1→2→3,等於偷用了更多段',
    '跑 k 輪而不是 k + 1 輪:k 是**中轉站**數,航班數是 k + 1',
    '直接用 Dijkstra(只記最便宜):會先確定「便宜但轉太多次」的路,把「貴一點但轉得少」的路擋掉',
  ],
  followUp: [{ q: '一定要用 Dijkstra?', a: '可以,但狀態要變成 (城市, 已搭段數),同一個城市不同段數要分開記,不能只留最便宜的。' }],
  check: {
    kind: 'fn',
    fn: 'findCheapestPrice',
    cases: [
      { args: [N, FL, SRC, DST, K], out: 700 },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], out: 200 },
      { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], out: 500 },
      { args: [3, [[0, 1, 100]], 0, 2, 1], out: -1 },
      { args: [4, [[0, 1, 1], [0, 2, 5], [1, 2, 1], [2, 3, 1]], 0, 3, 1], out: 6 },
    ],
  },
}
