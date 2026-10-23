import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1579. Remove Max Number of Edges to Keep Graph Fully Traversable

const N = 4
const E = [[3, 1, 2], [3, 2, 3], [1, 1, 3], [1, 2, 4], [1, 1, 2], [2, 3, 4]]
const POS = { 1: { x: 0, y: 0 }, 2: { x: 2, y: 0 }, 3: { x: 1, y: 1.5 }, 4: { x: 3, y: 1.5 } }
const view = (label: string, edgeCls: Record<number, string> = {}) =>
  graphView(N, E.map(([t, u, v]) => [u, v, t === 3 ? 3 : t === 1 ? 1 : 2]), { base: 1, pos: POS, label, edgeCls })

function ufFig(): FigStep[] {
  return [
    { note: '邊有三種:1 只有 Alice 能走、2 只有 Bob 能走、3 兩人都能走(邊上的數字)。要刪最多邊,同時讓兩人都能走遍全圖', views: [view('graph(邊上數字 = 類型)')] },
    { note: '貪心:類型 3 一條抵兩條用,**優先保留**。用併查集依序加入類型 3 的邊,會形成環的(兩端已連通)就是多餘的', views: [view('先加類型 3', { 0: 'done', 1: 'done' })] },
    { note: '接著 Alice 的併查集(從類型 3 的結果複製)加入類型 1;Bob 的加入類型 2。1–3 這條多餘(1、3 已經連通),1–2 也多餘', views: [view('再加類型 1 / 2', { 0: 'done', 1: 'done', 3: 'done', 5: 'done', 2: 'dim', 4: 'dim' })] },
    { note: '保留 4 條、刪掉 2 條。最後兩個併查集都必須只剩一個連通塊,否則回傳 −1', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}

function countFig(): FigStep[] {
  return [
    { note: '公式版:只用類型 3 的邊時有 c 個連通塊 → 類型 3 最多保留 n − c 條(每塊一棵生成樹)', views: [arr([2], { label: 'c(只看類型 3:{1,2,3}、{4})' })] },
    { note: '把這 c 塊再連起來,Alice、Bob 各需要 c − 1 條自己的邊。必要的邊數 = (n − c) + 2(c − 1),答案 = 總邊數 − 必要邊數;Alice 或 Bob 的圖不連通 → −1', views: [arr([6, 2, 1, 1, 2], { label: '總邊數 / n − c / Alice 要 c−1 / Bob 要 c−1 / 答案', done: [4] })] },
  ]
}

export const q1579: Solution = {
  id: 1579,
  plain: 'Alice 和 Bob 共用一張無向圖。有些邊只有 Alice 能走、有些只有 Bob 能走、有些兩人都能走。最多能刪掉幾條邊,還讓兩人各自都能走到所有的點?做不到回傳 −1。',
  statement: 'n 個點、`edges[i] = [type, u, v]`:type 1 僅 Alice 可走、type 2 僅 Bob 可走、type 3 兩者皆可。回傳可刪除的**最多**邊數,使得刪除後 Alice 與 Bob 都能從任一點走到所有點;若原圖就做不到則回傳 −1。',
  examples: [
    { input: 'n = 4, edges = [[3,1,2],[3,2,3],[1,1,3],[1,2,4],[1,1,2],[2,3,4]]', output: '2' },
    { input: 'n = 4, edges = [[3,1,2],[3,2,3],[1,1,4],[2,1,4]]', output: '0' },
    { input: 'n = 4, edges = [[3,2,3],[1,1,2],[2,3,4]]', output: '-1' },
  ],
  constraints: ['n ≤ 10⁵,邊數 ≤ 10⁵'],
  insight: ['保留的邊越少越好 → 兩人各自需要一棵生成樹(最小生成樹的想法)', '類型 3 同時服務兩個人 → 優先使用([[p:greedy]])', '[[p:union-find]]:加邊時兩端已連通就是多餘的'],
  approaches: [
    {
      name: '兩個併查集,先加類型 3',
      idea: 'Alice、Bob 各一個併查集;先把類型 3 加進兩邊(有用就計數),再分別加類型 1、類型 2;答案 = 總邊數 − 用到的邊數。',
      steps: ['`ua`、`ub` 兩個併查集,`used = 0`', '類型 3:`ua.union` 成功(或 ub)→ `used += 1`(兩邊都要合併)', '類型 1 只加到 ua、類型 2 只加到 ub,成功就 `used += 1`', '兩邊都只剩 1 個連通塊 → `len(edges) − used`,否則 −1'],
      figure: { title: `n = ${N}`, steps: ufFig() },
      complexity: { time: 'O(E · α(n))', space: 'O(n)', why: '每條邊最多兩次 union。' },
      verdict: '最推薦,Kruskal 式的貪心;「共用的資源先用」是關鍵。',
      code: {
        python: `def maxNumEdgesToRemove(n, edges):
    def make():
        return list(range(n + 1))

    def find(p, x):
        while p[x] != x:
            p[x] = p[p[x]]
            x = p[x]
        return x

    def union(p, a, b):
        ra, rb = find(p, a), find(p, b)
        if ra == rb:
            return False                      # 已經連通,這條邊多餘
        p[ra] = rb
        return True

    pa, pb, used = make(), make(), 0
    for t, u, v in edges:
        if t == 3:
            a, b = union(pa, u, v), union(pb, u, v)
            used += a or b                    # 兩人共用的邊優先保留
    for t, u, v in edges:
        if t == 1:
            used += union(pa, u, v)
        elif t == 2:
            used += union(pb, u, v)
    roots_a = {find(pa, i) for i in range(1, n + 1)}
    roots_b = {find(pb, i) for i in range(1, n + 1)}
    if len(roots_a) > 1 or len(roots_b) > 1:
        return -1
    return len(edges) - used`,
        c: `static int find(int *p, int x) {
    while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; }
    return x;
}

static bool unite(int *p, int a, int b) {
    int ra = find(p, a), rb = find(p, b);
    if (ra == rb) return false;
    p[ra] = rb;
    return true;
}

int maxNumEdgesToRemove(int n, int **edges, int edgesSize, int *edgesColSize) {
    int *pa = malloc((n + 1) * sizeof(int)), *pb = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) pa[i] = pb[i] = i;
    int used = 0, ca = n, cb = n;
    for (int i = 0; i < edgesSize; i++) {
        if (edges[i][0] != 3) continue;
        bool a = unite(pa, edges[i][1], edges[i][2]), b = unite(pb, edges[i][1], edges[i][2]);
        ca -= a; cb -= b;
        if (a || b) used++;
    }
    for (int i = 0; i < edgesSize; i++) {
        int t = edges[i][0], u = edges[i][1], v = edges[i][2];
        if (t == 1 && unite(pa, u, v)) { used++; ca--; }
        if (t == 2 && unite(pb, u, v)) { used++; cb--; }
    }
    free(pa); free(pb);
    return ca == 1 && cb == 1 ? edgesSize - used : -1;
}`,
        cpp: `int maxNumEdgesToRemove(int n, vector<vector<int>>& edges) {
    vector<int> pa(n + 1), pb(n + 1);
    iota(pa.begin(), pa.end(), 0);
    iota(pb.begin(), pb.end(), 0);
    function<int(vector<int> &, int)> find = [&](vector<int> &p, int x) { return p[x] == x ? x : p[x] = find(p, p[x]); };
    auto unite = [&](vector<int> &p, int a, int b) {
        int ra = find(p, a), rb = find(p, b);
        if (ra == rb) return false;
        p[ra] = rb;
        return true;
    };
    int used = 0, ca = n, cb = n;
    for (auto &e : edges) {
        if (e[0] != 3) continue;
        bool a = unite(pa, e[1], e[2]), b = unite(pb, e[1], e[2]);
        ca -= a; cb -= b;
        if (a || b) used++;
    }
    for (auto &e : edges) {
        if (e[0] == 1 && unite(pa, e[1], e[2])) { used++; ca--; }
        if (e[0] == 2 && unite(pb, e[1], e[2])) { used++; cb--; }
    }
    return ca == 1 && cb == 1 ? (int)edges.size() - used : -1;
}`,
        java: `int find(int[] p, int x) {
    while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; }
    return x;
}

boolean unite(int[] p, int a, int b) {
    int ra = find(p, a), rb = find(p, b);
    if (ra == rb) return false;
    p[ra] = rb;
    return true;
}

int maxNumEdgesToRemove(int n, int[][] edges) {
    int[] pa = new int[n + 1], pb = new int[n + 1];
    for (int i = 0; i <= n; i++) pa[i] = pb[i] = i;
    int used = 0, ca = n, cb = n;
    for (int[] e : edges) {
        if (e[0] != 3) continue;
        boolean a = unite(pa, e[1], e[2]), b = unite(pb, e[1], e[2]);
        if (a) ca--;
        if (b) cb--;
        if (a || b) used++;
    }
    for (int[] e : edges) {
        if (e[0] == 1 && unite(pa, e[1], e[2])) { used++; ca--; }
        if (e[0] == 2 && unite(pb, e[1], e[2])) { used++; cb--; }
    }
    return ca == 1 && cb == 1 ? edges.length - used : -1;
}`,
        javascript: `function maxNumEdgesToRemove(n, edges) {
  const make = () => Array.from({ length: n + 1 }, (_, i) => i);
  const find = (p, x) => {
    while (p[x] !== x) {
      p[x] = p[p[x]];
      x = p[x];
    }
    return x;
  };
  const unite = (p, a, b) => {
    const ra = find(p, a), rb = find(p, b);
    if (ra === rb) return false;
    p[ra] = rb;
    return true;
  };
  const pa = make(), pb = make();
  let used = 0, ca = n, cb = n;
  for (const [t, u, v] of edges) {
    if (t !== 3) continue;
    const a = unite(pa, u, v), b = unite(pb, u, v);
    if (a) ca--;
    if (b) cb--;
    if (a || b) used++;
  }
  for (const [t, u, v] of edges) {
    if (t === 1 && unite(pa, u, v)) {
      used++;
      ca--;
    }
    if (t === 2 && unite(pb, u, v)) {
      used++;
      cb--;
    }
  }
  return ca === 1 && cb === 1 ? edges.length - used : -1;
}`,
      },
    },
    {
      name: '數連通塊的公式',
      idea: '用 BFS 數三張圖的連通塊:只含類型 3 的 c、Alice 的(1 + 3)、Bob 的(2 + 3)。後兩者不連通 → −1;否則答案 = `E − (n − c) − 2(c − 1)`。',
      steps: ['`comps(types)`:只用指定類型的邊,BFS 數連通塊', 'Alice 或 Bob 的圖連通塊 > 1 → −1', '`c = comps({3})`', '回傳 `E − (n − c) − 2 × (c − 1)`'],
      figure: { title: `n = ${N}`, steps: countFig() },
      complexity: { time: 'O(n + E)', space: 'O(n + E)', why: '三次 BFS。' },
      verdict: '把貪心的結果直接寫成公式:類型 3 用滿,剩下的缺口兩人各補。',
      code: {
        python: `from collections import deque

def maxNumEdgesToRemove(n, edges):
    def comps(types):
        g = [[] for _ in range(n + 1)]
        for t, u, v in edges:
            if t in types:
                g[u].append(v)
                g[v].append(u)
        seen, cnt = [False] * (n + 1), 0
        for s in range(1, n + 1):
            if seen[s]:
                continue
            cnt += 1
            seen[s] = True
            q = deque([s])
            while q:
                u = q.popleft()
                for v in g[u]:
                    if not seen[v]:
                        seen[v] = True
                        q.append(v)
        return cnt

    if comps({1, 3}) > 1 or comps({2, 3}) > 1:
        return -1
    c = comps({3})                            # 只靠共用邊時的連通塊數
    return len(edges) - (n - c) - 2 * (c - 1)`,
        c: `static int comps(int n, int **edges, int m, int mask) {
    int *head = malloc((n + 1) * sizeof(int)), *nxt = malloc(2 * m * sizeof(int)), *to = malloc(2 * m * sizeof(int)), k = 0;
    for (int i = 0; i <= n; i++) head[i] = -1;
    for (int i = 0; i < m; i++) {
        if (!(mask >> edges[i][0] & 1)) continue;
        int u = edges[i][1], v = edges[i][2];
        to[k] = v; nxt[k] = head[u]; head[u] = k++;
        to[k] = u; nxt[k] = head[v]; head[v] = k++;
    }
    bool *seen = calloc(n + 1, sizeof(bool));
    int *q = malloc((n + 1) * sizeof(int)), cnt = 0;
    for (int s = 1; s <= n; s++) {
        if (seen[s]) continue;
        cnt++;
        int h = 0, t = 0;
        seen[s] = true; q[t++] = s;
        while (h < t) {
            int u = q[h++];
            for (int e = head[u]; e != -1; e = nxt[e])
                if (!seen[to[e]]) { seen[to[e]] = true; q[t++] = to[e]; }
        }
    }
    free(head); free(nxt); free(to); free(seen); free(q);
    return cnt;
}

int maxNumEdgesToRemove(int n, int **edges, int edgesSize, int *edgesColSize) {
    // mask 的第 t 位代表要不要用類型 t 的邊
    if (comps(n, edges, edgesSize, (1 << 1) | (1 << 3)) > 1 || comps(n, edges, edgesSize, (1 << 2) | (1 << 3)) > 1) return -1;
    int c = comps(n, edges, edgesSize, 1 << 3);
    return edgesSize - (n - c) - 2 * (c - 1);
}`,
        cpp: `int maxNumEdgesToRemove(int n, vector<vector<int>>& edges) {
    auto comps = [&](int mask) {
        vector<vector<int>> g(n + 1);
        for (auto &e : edges)
            if (mask >> e[0] & 1) { g[e[1]].push_back(e[2]); g[e[2]].push_back(e[1]); }
        vector<bool> seen(n + 1, false);
        int cnt = 0;
        for (int s = 1; s <= n; s++) {
            if (seen[s]) continue;
            cnt++;
            queue<int> q;
            q.push(s);
            seen[s] = true;
            while (!q.empty()) {
                int u = q.front();
                q.pop();
                for (int v : g[u]) if (!seen[v]) { seen[v] = true; q.push(v); }
            }
        }
        return cnt;
    };
    if (comps(0b1010) > 1 || comps(0b1100) > 1) return -1;
    int c = comps(0b1000);
    return (int)edges.size() - (n - c) - 2 * (c - 1);
}`,
        java: `int comps(int n, int[][] edges, int mask) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
    for (int[] e : edges)
        if ((mask >> e[0] & 1) == 1) { g.get(e[1]).add(e[2]); g.get(e[2]).add(e[1]); }
    boolean[] seen = new boolean[n + 1];
    int cnt = 0;
    for (int s = 1; s <= n; s++) {
        if (seen[s]) continue;
        cnt++;
        Deque<Integer> q = new ArrayDeque<>();
        q.offer(s);
        seen[s] = true;
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) if (!seen[v]) { seen[v] = true; q.offer(v); }
        }
    }
    return cnt;
}

int maxNumEdgesToRemove(int n, int[][] edges) {
    if (comps(n, edges, 0b1010) > 1 || comps(n, edges, 0b1100) > 1) return -1;
    int c = comps(n, edges, 0b1000);
    return edges.length - (n - c) - 2 * (c - 1);
}`,
        javascript: `function maxNumEdgesToRemove(n, edges) {
  const comps = (types) => {
    const g = Array.from({ length: n + 1 }, () => []);
    for (const [t, u, v] of edges)
      if (types.includes(t)) {
        g[u].push(v);
        g[v].push(u);
      }
    const seen = new Array(n + 1).fill(false);
    let cnt = 0;
    for (let s = 1; s <= n; s++) {
      if (seen[s]) continue;
      cnt++;
      seen[s] = true;
      const q = [s];
      for (let h = 0; h < q.length; h++) for (const v of g[q[h]]) if (!seen[v]) {
        seen[v] = true;
        q.push(v);
      }
    }
    return cnt;
  };
  if (comps([1, 3]) > 1 || comps([2, 3]) > 1) return -1;
  const c = comps([3]);
  return edges.length - (n - c) - 2 * (c - 1);
}`,
      },
    },
  ],
  pitfalls: ['先加類型 1 / 2 再加類型 3:會把能共用的機會浪費掉', '類型 3 的邊只合併到其中一個併查集', '最後沒檢查兩個人的圖是否都連通'],
  check: {
    kind: 'fn',
    fn: 'maxNumEdgesToRemove',
    cases: [
      { args: [N, E], out: 2 },
      { args: [4, [[3, 1, 2], [3, 2, 3], [1, 1, 4], [2, 1, 4]]], out: 0 },
      { args: [4, [[3, 2, 3], [1, 1, 2], [2, 3, 4]]], out: -1 },
      { args: [2, [[1, 1, 2], [2, 1, 2], [3, 1, 2]]], out: 2 },
    ],
  },
}
