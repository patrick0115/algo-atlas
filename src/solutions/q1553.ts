import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1553. Minimum Number of Days to Eat N Oranges

const N = 10

function memoFig(): FigStep[] {
  return [
    { note: '每天三選一:吃 1 個;n 是偶數就可以吃一半;n 是 3 的倍數就可以吃掉 2/3(剩 n/3)。n 到 2·10⁹,一個一個吃絕對太慢', views: [arr([N], { label: 'n' })] },
    { note: '關鍵:「吃 1 個」只是為了湊成 2 或 3 的倍數。所以只考慮:先吃 n % 2 個再減半,或先吃 n % 3 個再變 1/3', views: [arr(['f(n) = min(n%2 + 1 + f(n/2), n%3 + 1 + f(n/3))'], { label: '遞迴式' })] },
    { note: 'f(10) = min(0 + 1 + f(5), 1 + 1 + f(3))。f(5) = min(1 + 1 + f(2), 2 + 1 + f(1)) = 3;f(3) = 2 → f(10) = 4', views: [arr([10, 9, 3, 1, 0], { label: '10 → 9(吃 1)→ 3 → 1 → 0', done: [4] })] },
    { note: '每次都除以 2 或 3,不同的 n 只有 O(log² n) 個 → 記憶化非常快', views: [arr([4], { label: '答案', done: [0] })] },
  ]
}

function dijkFig(): FigStep[] {
  return [
    { note: '圖的觀點:點是「剩幾個」,邊 n → n/2 的代價是 n%2 + 1,n → n/3 的代價是 n%3 + 1。要從 n 走到 0 的最短路', views: [arr(['10 →(1)→ 5', '10 →(2)→ 3', '3 →(1)→ 1', '1 →(1)→ 0'], { label: '部分邊' })] },
    { note: '邊權不同 → 用 Dijkstra。1 → 0 的代價是 1(吃掉最後一個)', views: [arr([4], { label: '答案', done: [0] })] },
  ]
}

export const q1553: Solution = {
  id: 1553,
  plain: '有 n 個橘子。每天可以選一種吃法:吃 1 個;如果剩下的是偶數,吃掉一半;如果是 3 的倍數,吃掉三分之二。最少幾天吃完?',
  statement: '廚房有 n 個橘子,每天可以選擇:吃 1 個;若 n 可被 2 整除,吃 n/2 個;若 n 可被 3 整除,吃 2·(n/3) 個。每天只能選一種。回傳吃完所有橘子的最少天數。',
  examples: [
    { input: 'n = 10', output: '4', note: '10 → 9 → 3 → 1 → 0' },
    { input: 'n = 6', output: '3', note: '6 → 3 → 1 → 0' },
  ],
  constraints: ['1 ≤ n ≤ 2·10⁹'],
  insight: ['n 很大,不能對每個數做 DP', '只會在「為了整除而吃 1 個」時吃單個 → 每一步直接跳到 n/2 或 n/3', '記憶化後狀態只有 O(log² n) 個([[p:dp-general]])'],
  approaches: [
    {
      name: '記憶化遞迴',
      idea: '`f(n) = min(n % 2 + 1 + f(n // 2), n % 3 + 1 + f(n // 3))`;`f(0) = 0`、`f(1) = 1`。',
      steps: ['`f(n)`:`n <= 1` → n', '先吃 n % 2 個再吃一半 → `n % 2 + 1 + f(n // 2)`', '先吃 n % 3 個再吃 2/3 → `n % 3 + 1 + f(n // 3)`', '取 min,記憶化'],
      figure: { title: `n = ${N}`, steps: memoFig() },
      complexity: { time: 'O(log² n)', space: 'O(log² n)', why: '可達的 n 都是 n / (2ᵃ 3ᵇ),約 log₂n × log₃n 個。' },
      verdict: '最推薦;把「吃 1 個」併入跳躍,是這題能過的關鍵。',
      code: {
        python: `from functools import lru_cache

def minDays(n):
    @lru_cache(None)
    def f(n):
        if n <= 1:
            return n
        return min(n % 2 + 1 + f(n // 2),     # 先吃到偶數,再吃一半
                   n % 3 + 1 + f(n // 3))     # 先吃到 3 的倍數,再吃 2/3
    return f(n)`,
        c: `// 簡單的雜湊表記錄 f(n)
#define HSZ 4096
static long long hk[HSZ];
static int hv[HSZ];
static bool hu[HSZ];

static int f(long long n) {
    if (n <= 1) return (int)n;
    unsigned h = (unsigned)(n * 2654435761u) % HSZ;
    while (hu[h] && hk[h] != n) h = (h + 1) % HSZ;
    if (hu[h]) return hv[h];
    int a = n % 2 + 1 + f(n / 2), b = n % 3 + 1 + f(n / 3), r = a < b ? a : b;
    h = (unsigned)(n * 2654435761u) % HSZ;
    while (hu[h]) h = (h + 1) % HSZ;
    hu[h] = true; hk[h] = n; hv[h] = r;
    return r;
}

int minDays(int n) {
    memset(hu, 0, sizeof hu);
    return f(n);
}`,
        cpp: `int minDays(int n) {
    unordered_map<int, int> memo;
    function<int(int)> f = [&](int n) {
        if (n <= 1) return n;
        auto it = memo.find(n);
        if (it != memo.end()) return it->second;
        return memo[n] = min(n % 2 + 1 + f(n / 2), n % 3 + 1 + f(n / 3));
    };
    return f(n);
}`,
        java: `Map<Integer, Integer> memo = new HashMap<>();

int minDays(int n) {
    if (n <= 1) return n;
    Integer c = memo.get(n);
    if (c != null) return c;
    int r = Math.min(n % 2 + 1 + minDays(n / 2), n % 3 + 1 + minDays(n / 3));
    memo.put(n, r);
    return r;
}`,
        javascript: `function minDays(n) {
  const memo = new Map();
  const f = (n) => {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    const r = Math.min((n % 2) + 1 + f(Math.floor(n / 2)), (n % 3) + 1 + f(Math.floor(n / 3)));
    memo.set(n, r);
    return r;
  };
  return f(n);
}`,
      },
    },
    {
      name: 'Dijkstra(帶權最短路)',
      idea: '點是剩餘數量;邊 `n → n/2` 代價 `n%2 + 1`、`n → n/3` 代價 `n%3 + 1`、`1 → 0` 代價 1。從 n 跑 Dijkstra 到 0。',
      steps: ['堆放 (0, n),`dist = {n: 0}`', '彈出 (d, x):`x == 0` → d', '`x == 1` → 推 (d + 1, 0)', '否則推 (d + x%2 + 1, x/2)、(d + x%3 + 1, x/3)'],
      figure: { title: `n = ${N}`, steps: dijkFig() },
      complexity: { time: 'O(S log S)', space: 'O(S)', why: 'S = O(log² n) 個狀態。' },
      verdict: '把 DP 看成最短路;邊權不一樣時,Dijkstra 是 BFS 的推廣。',
      code: {
        python: `import heapq

def minDays(n):
    dist = {n: 0}
    pq = [(0, n)]
    while pq:
        d, x = heapq.heappop(pq)
        if x == 0:
            return d
        if d > dist.get(x, float('inf')):
            continue
        nxt = [(1, 0)] if x == 1 else [(x % 2 + 1, x // 2), (x % 3 + 1, x // 3)]
        for w, y in nxt:
            if d + w < dist.get(y, float('inf')):
                dist[y] = d + w
                heapq.heappush(pq, (d + w, y))
    return -1`,
        c: `typedef struct { int d; long long x; } It;
static It hp_[1 << 14];
static int hs_;

static void hpush(It v) {
    int i = hs_++;
    hp_[i] = v;
    while (i && hp_[(i - 1) / 2].d > hp_[i].d) { It t = hp_[i]; hp_[i] = hp_[(i - 1) / 2]; hp_[(i - 1) / 2] = t; i = (i - 1) / 2; }
}

static It hpop(void) {
    It top = hp_[0];
    hp_[0] = hp_[--hs_];
    for (int i = 0;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < hs_ && hp_[l].d < hp_[m].d) m = l;
        if (r < hs_ && hp_[r].d < hp_[m].d) m = r;
        if (m == i) break;
        It t = hp_[i]; hp_[i] = hp_[m]; hp_[m] = t; i = m;
    }
    return top;
}

int minDays(int n) {
    // 狀態很少,用線性搜尋的陣列記錄最短距離
    static long long keys[1 << 12];
    static int best[1 << 12];
    int nk = 0;
    hs_ = 0;
    hpush((It){0, n});
    while (hs_) {
        It c = hpop();
        if (c.x == 0) return c.d;
        int k = 0;
        while (k < nk && keys[k] != c.x) k++;
        if (k < nk && best[k] <= c.d) continue;   // 已經用更短的距離處理過
        if (k == nk) { keys[nk] = c.x; nk++; }
        best[k] = c.d;
        if (c.x == 1) hpush((It){c.d + 1, 0});
        else {
            hpush((It){c.d + (int)(c.x % 2) + 1, c.x / 2});
            hpush((It){c.d + (int)(c.x % 3) + 1, c.x / 3});
        }
    }
    return -1;
}`,
        cpp: `int minDays(int n) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    unordered_map<int, int> dist;
    pq.push({0, n});
    dist[n] = 0;
    while (!pq.empty()) {
        auto [d, x] = pq.top();
        pq.pop();
        if (x == 0) return d;
        if (d > dist[x]) continue;
        vector<pair<int, int>> nxt;
        if (x == 1) nxt = {{1, 0}};
        else nxt = {{x % 2 + 1, x / 2}, {x % 3 + 1, x / 3}};
        for (auto [w, y] : nxt)
            if (!dist.count(y) || d + w < dist[y]) { dist[y] = d + w; pq.push({d + w, y}); }
    }
    return -1;
}`,
        java: `int minDays(int n) {
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    Map<Integer, Integer> dist = new HashMap<>();
    pq.offer(new int[]{0, n});
    dist.put(n, 0);
    while (!pq.isEmpty()) {
        int[] c = pq.poll();
        int d = c[0], x = c[1];
        if (x == 0) return d;
        if (d > dist.get(x)) continue;
        int[][] nxt = x == 1 ? new int[][]{{1, 0}} : new int[][]{{x % 2 + 1, x / 2}, {x % 3 + 1, x / 3}};
        for (int[] e : nxt) {
            int w = e[0], y = e[1];
            if (d + w < dist.getOrDefault(y, Integer.MAX_VALUE)) { dist.put(y, d + w); pq.offer(new int[]{d + w, y}); }
        }
    }
    return -1;
}`,
        javascript: `function minDays(n) {
  // 狀態很少:用「排序後取最小」代替堆
  const dist = new Map([[n, 0]]);
  let frontier = [[0, n]];
  while (frontier.length) {
    frontier.sort((a, b) => a[0] - b[0]);
    const [d, x] = frontier.shift();
    if (x === 0) return d;
    if (d > dist.get(x)) continue;
    const nxt = x === 1 ? [[1, 0]] : [[(x % 2) + 1, Math.floor(x / 2)], [(x % 3) + 1, Math.floor(x / 3)]];
    for (const [w, y] of nxt)
      if (!dist.has(y) || d + w < dist.get(y)) {
        dist.set(y, d + w);
        frontier.push([d + w, y]);
      }
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['對 1..n 做一維 DP:n 到 2·10⁹,時間和記憶體都不夠', '把「吃 1 個」當成獨立的一步做 BFS:狀態數一樣是 O(n)', 'f(1) 寫成 0:最後一個橘子也要花一天'],
  check: {
    kind: 'fn',
    fn: 'minDays',
    cases: [
      { args: [N], out: 4 },
      { args: [6], out: 3 },
      { args: [1], out: 1 },
      { args: [56], out: 6 },
      { args: [2000000000], out: 32 },
    ],
  },
}
