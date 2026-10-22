import { arr, range } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 973. K Closest Points to Origin

const PTS: [number, number][] = [
  [3, 3],
  [5, -1],
  [-2, 4],
  [1, 1],
  [-1, -2],
]
const K = 2
const d2 = ([x, y]: [number, number]) => x * x + y * y

function plane(hl: number[] = [], dim: number[] = []): GridViewData {
  const R = 5
  const cells: string[][] = range(0, 2 * R).map((r) => range(0, 2 * R).map((c) => (r === R && c === R ? 'O' : '')))
  const marks: Record<string, [number, number][]> = { hl: [], dim: [], path: [] }
  PTS.forEach((p, i) => {
    const r = R - p[1]
    const c = p[0] + R
    cells[r][c] = `${i}`
    ;(hl.includes(i) ? marks.hl : dim.includes(i) ? marks.dim : marks.path).push([r, c])
  })
  return { kind: 'grid', label: '平面(O 是原點,格子裡是點的編號)', cells, marks }
}

function sortFig(): FigStep[] {
  const order = PTS.map((_, i) => i).sort((a, b) => d2(PTS[a]) - d2(PTS[b]))
  return [
    { note: '距離原點的遠近只要比「x² + y²」就好,不用開根號(開根號不會改變大小順序)', views: [plane(), arr(PTS.map((p) => `(${p[0]},${p[1]})`), { label: '點' }), arr(PTS.map(d2), { label: 'x² + y²' })] },
    { note: '依 x² + y² 由小到大排序', views: [arr(order.map((i) => `(${PTS[i][0]},${PTS[i][1]})`), { label: '排序後' }), arr(order.map((i) => d2(PTS[i])), { label: 'x² + y²' })] },
    { note: `取前 k = ${K} 個`, views: [plane(order.slice(0, K), order.slice(K)), arr(order.map((i) => `(${PTS[i][0]},${PTS[i][1]})`), { label: '排序後', done: range(0, K - 1), dim: range(K, PTS.length - 1) })] },
  ]
}

function heapFig(): FigStep[] {
  const h: number[] = [] // 存點的編號,依距離的最大堆(簡化成排序陣列表示)
  const out: FigStep[] = [{ note: `只留下目前最近的 ${K} 個,放在**最大堆**(依距離)裡。堆頂是這 ${K} 個裡最遠的;新來的點比它近,就把它換掉`, views: [plane()] }]
  PTS.forEach((p, i) => {
    h.push(i)
    h.sort((a, b) => d2(PTS[b]) - d2(PTS[a]))
    let note = `放入點 ${i} (${p[0]},${p[1]}),距離² = ${d2(p)}`
    if (h.length > K) {
      const far = h.shift()!
      note += `;超過 ${K} 個 → 踢掉最遠的點 ${far}(距離² ${d2(PTS[far])})`
    }
    out.push({ note, views: [plane(h, range(0, i).filter((j) => !h.includes(j))), arr(h.map((j) => `點${j}:${d2(PTS[j])}`), { label: `最大堆(最多 ${K} 個,左邊是堆頂)`, highlight: [0] })] })
  })
  return out
}

function quickFig(): FigStep[] {
  const a = PTS.map((_, i) => i)
  const out: FigStep[] = [{ note: `不需要前 ${K} 個彼此排好,只要「最近的 ${K} 個在前面」。用快速排序的 partition:選一個基準,比它近的放左邊、遠的放右邊`, views: [arr(a.map((i) => d2(PTS[i])), { label: '每個點的距離²' })] }]
  let lo = 0
  let hi = a.length - 1
  while (lo < hi) {
    const pv = d2(PTS[a[hi]])
    let w = lo
    for (let i = lo; i < hi; i++) if (d2(PTS[a[i]]) < pv) { [a[w], a[i]] = [a[i], a[w]]; w++ }
    ;[a[w], a[hi]] = [a[hi], a[w]]
    out.push({ note: `在 [${lo}, ${hi}] 選最右邊的距離² ${pv} 當基準,partition 之後它在位置 ${w}${w === K - 1 || w === K ? '' : w < K - 1 ? `,左邊不夠 ${K} 個 → 只要處理右半` : `,左邊太多 → 只要處理左半`}`, views: [arr(a.map((i) => d2(PTS[i])), { label: '距離²', range: [lo, hi], highlight: [w], done: range(0, Math.min(w, K) - 1).filter((j) => j < lo) })] })
    if (w === K || w === K - 1) break
    if (w < K) lo = w + 1
    else hi = w - 1
  }
  out.push({ note: `前 ${K} 個就是答案(彼此不一定排好)`, views: [arr(a.map((i) => d2(PTS[i])), { label: '距離²', done: range(0, K - 1) }), plane(a.slice(0, K), a.slice(K))] })
  return out
}

export const q0973: Solution = {
  id: 973,
  plain: '平面上有很多點,找出離原點 (0, 0) 最近的 k 個。比遠近時只要比 x² + y² 就好,不用真的開根號。',
  statement: '給一些平面上的點 `points[i] = [x, y]` 和整數 `k`,回傳離原點最近的 `k` 個點(歐幾里得距離),順序不限。保證答案唯一。',
  examples: [
    { input: 'points = [[1,3],[-2,2]], k = 1', output: '[[-2,2]]', note: '距離² 分別是 10 和 8' },
    { input: 'points = [[3,3],[5,-1],[-2,4]], k = 2', output: '[[3,3],[-2,4]]' },
  ],
  constraints: ['`1 ≤ k ≤ n ≤ 10⁴`', '座標在 `[-10⁴, 10⁴]` → x² + y² 最多 2·10⁸,int 放得下'],
  insight: [
    '比較距離不用開根號:`√a < √b ⇔ a < b`,直接比 `x² + y²`,而且不會有浮點誤差',
    '最直接:依距離排序取前 k 個 → O(n log n)',
    '只要前 k 個,不用全部排 → 大小 k 的**最大堆**(踢掉最遠的)→ O(n log k)',
    '連前 k 個之間的順序都不用 → 快速選擇(Quickselect),平均 O(n)',
  ],
  approaches: [
    {
      name: '依距離排序',
      idea: '用 `x² + y²` 當排序依據,排完取前 k 個。',
      steps: ['`points.sort(key = x² + y²)`', '回傳前 k 個'],
      figure: { title: `points = ${JSON.stringify(PTS)}, k = ${K}`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(log n) ~ O(n)', why: '排序。' },
      verdict: '一行搞定,面試先講這個沒問題。',
      code: {
        python: `def kClosest(points, k):
    return sorted(points, key=lambda p: p[0] * p[0] + p[1] * p[1])[:k]`,
        c: `static int cmpDist(const void *a, const void *b) {
    int *p = *(int **)a, *q = *(int **)b;
    int dp = p[0] * p[0] + p[1] * p[1], dq = q[0] * q[0] + q[1] * q[1];
    return (dp > dq) - (dp < dq);
}

int **kClosest(int **points, int pointsSize, int *pointsColSize, int k, int *returnSize, int **returnColumnSizes) {
    qsort(points, pointsSize, sizeof(int *), cmpDist);
    int **res = malloc(k * sizeof(int *));
    *returnColumnSizes = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) {
        res[i] = malloc(2 * sizeof(int));
        res[i][0] = points[i][0]; res[i][1] = points[i][1];
        (*returnColumnSizes)[i] = 2;
    }
    *returnSize = k;
    return res;
}`,
        cpp: `vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
    sort(points.begin(), points.end(), [](auto& a, auto& b) {
        return a[0] * a[0] + a[1] * a[1] < b[0] * b[0] + b[1] * b[1];
    });
    return vector<vector<int>>(points.begin(), points.begin() + k);
}`,
        java: `int[][] kClosest(int[][] points, int k) {
    Arrays.sort(points, (a, b) -> Integer.compare(a[0] * a[0] + a[1] * a[1], b[0] * b[0] + b[1] * b[1]));
    return Arrays.copyOf(points, k);
}`,
        javascript: `function kClosest(points, k) {
  const d = (p) => p[0] * p[0] + p[1] * p[1];
  return [...points].sort((a, b) => d(a) - d(b)).slice(0, k);
}`,
      },
    },
    {
      name: '大小為 k 的最大堆',
      idea: '依距離建最大堆,只保留 k 個:每加入一個點,超過 k 個就把最遠的(堆頂)踢掉。',
      steps: ['對每個點:放進堆(依距離,最大的在頂)', '大小 > k → pop', '最後堆裡的 k 個就是答案'],
      figure: { title: `points = ${JSON.stringify(PTS)}, k = ${K}`, steps: heapFig() },
      complexity: { time: 'O(n log k)', space: 'O(k)', why: '每個點進出堆一次,堆大小 k。' },
      verdict: '「前 k 小 → 大小 k 的最大堆」(和 [703](#/q/703) 的「前 k 大 → 最小堆」相反)。資料是串流也能用。',
      code: {
        python: `import heapq

def kClosest(points, k):
    h = []                                # 存 (-距離², x, y):heapq 是最小堆,取負數變最大堆
    for x, y in points:
        heapq.heappush(h, (-(x * x + y * y), x, y))
        if len(h) > k:
            heapq.heappop(h)              # 踢掉最遠的
    return [[x, y] for _, x, y in h]`,
        c: `static int **H, hs;
static int dist(int *p) { return p[0] * p[0] + p[1] * p[1]; }
static void sw(int i, int j) { int *t = H[i]; H[i] = H[j]; H[j] = t; }
static void push(int *p) {
    int i = hs++;
    H[i] = p;
    while (i > 0 && dist(H[(i - 1) / 2]) < dist(H[i])) { sw(i, (i - 1) / 2); i = (i - 1) / 2; }
}
static void pop(void) {
    H[0] = H[--hs];
    for (int i = 0;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < hs && dist(H[l]) > dist(H[m])) m = l;
        if (r < hs && dist(H[r]) > dist(H[m])) m = r;
        if (m == i) break;
        sw(i, m); i = m;
    }
}

int **kClosest(int **points, int pointsSize, int *pointsColSize, int k, int *returnSize, int **returnColumnSizes) {
    H = malloc((k + 1) * sizeof(int *));
    hs = 0;
    for (int i = 0; i < pointsSize; i++) {
        push(points[i]);
        if (hs > k) pop();
    }
    *returnColumnSizes = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) (*returnColumnSizes)[i] = 2;
    *returnSize = k;
    return H;
}`,
        cpp: `vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
    auto d = [](const vector<int>& p) { return p[0] * p[0] + p[1] * p[1]; };
    auto cmp = [&](const vector<int>& a, const vector<int>& b) { return d(a) < d(b); };
    priority_queue<vector<int>, vector<vector<int>>, decltype(cmp)> pq(cmp);   // 最遠的在頂
    for (auto& p : points) {
        pq.push(p);
        if ((int)pq.size() > k) pq.pop();
    }
    vector<vector<int>> res;
    while (!pq.empty()) { res.push_back(pq.top()); pq.pop(); }
    return res;
}`,
        java: `int[][] kClosest(int[][] points, int k) {
    PriorityQueue<int[]> pq = new PriorityQueue<>(
        (a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1]));   // 最遠的在頂
    for (int[] p : points) {
        pq.offer(p);
        if (pq.size() > k) pq.poll();
    }
    return pq.toArray(new int[0][]);
}`,
        javascript: `function kClosest(points, k) {
  const d = (p) => p[0] * p[0] + p[1] * p[1];
  const h = [];                         // 手寫最大堆(依距離)
  const up = (i) => {
    for (; i > 0 && d(h[(i - 1) >> 1]) < d(h[i]); i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
  };
  const down = (i) => {
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < h.length && d(h[l]) > d(h[m])) m = l;
      if (r < h.length && d(h[r]) > d(h[m])) m = r;
      if (m === i) return;
      [h[i], h[m]] = [h[m], h[i]];
      i = m;
    }
  };
  for (const p of points) {
    h.push(p);
    up(h.length - 1);
    if (h.length > k) {
      h[0] = h.pop();
      down(0);
    }
  }
  return h;
}`,
      },
    },
    {
      name: '快速選擇(Quickselect)',
      idea: '用快速排序的 partition 把「比基準近的」放左邊。基準最後落在位置 p:p 剛好等於 k(或 k−1)就完成;p 太小就只處理右半,太大只處理左半。',
      steps: ['`lo = 0`、`hi = n − 1`', 'partition `[lo, hi]`,基準落在 `p`', '`p == k − 1` → 前 k 個就是答案', '`p < k − 1` → `lo = p + 1`;否則 `hi = p − 1`'],
      figure: { title: `points = ${JSON.stringify(PTS)}, k = ${K}`, steps: quickFig() },
      complexity: { time: '平均 O(n),最壞 O(n²)', space: 'O(1)', why: '每次只遞迴一半,平均 n + n/2 + n/4 + … = 2n。基準選得很差時最壞 O(n²),用隨機基準可以避免。' },
      verdict: '最快的做法,也是 [[p:quick-sort]] partition 的經典應用(215 題是它的本尊)。會改動原陣列。',
      code: {
        python: `import random

def kClosest(points, k):
    d = lambda p: p[0] * p[0] + p[1] * p[1]
    lo, hi = 0, len(points) - 1
    while lo < hi:
        r = random.randint(lo, hi)        # 隨機基準,避免最壞情況
        points[r], points[hi] = points[hi], points[r]
        pv, w = d(points[hi]), lo
        for i in range(lo, hi):
            if d(points[i]) < pv:
                points[w], points[i] = points[i], points[w]
                w += 1
        points[w], points[hi] = points[hi], points[w]
        if w == k - 1:
            break
        if w < k - 1:
            lo = w + 1
        else:
            hi = w - 1
    return points[:k]`,
        c: `static int dist(int *p) { return p[0] * p[0] + p[1] * p[1]; }

int **kClosest(int **points, int pointsSize, int *pointsColSize, int k, int *returnSize, int **returnColumnSizes) {
    int lo = 0, hi = pointsSize - 1;
    while (lo < hi) {
        int r = lo + rand() % (hi - lo + 1);
        int *t = points[r]; points[r] = points[hi]; points[hi] = t;
        int pv = dist(points[hi]), w = lo;
        for (int i = lo; i < hi; i++)
            if (dist(points[i]) < pv) { t = points[w]; points[w] = points[i]; points[i] = t; w++; }
        t = points[w]; points[w] = points[hi]; points[hi] = t;
        if (w == k - 1) break;
        if (w < k - 1) lo = w + 1;
        else hi = w - 1;
    }
    *returnColumnSizes = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) (*returnColumnSizes)[i] = 2;
    *returnSize = k;
    return points;
}`,
        cpp: `vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
    auto d = [](const vector<int>& p) { return p[0] * p[0] + p[1] * p[1]; };
    // nth_element 就是快速選擇:保證前 k 個都 <= 第 k 個
    nth_element(points.begin(), points.begin() + k - 1, points.end(),
                [&](auto& a, auto& b) { return d(a) < d(b); });
    return vector<vector<int>>(points.begin(), points.begin() + k);
}`,
        java: `int[][] kClosest(int[][] points, int k) {
    Random rnd = new Random();
    int lo = 0, hi = points.length - 1;
    while (lo < hi) {
        swap(points, lo + rnd.nextInt(hi - lo + 1), hi);
        int pv = d(points[hi]), w = lo;
        for (int i = lo; i < hi; i++) if (d(points[i]) < pv) swap(points, w++, i);
        swap(points, w, hi);
        if (w == k - 1) break;
        if (w < k - 1) lo = w + 1;
        else hi = w - 1;
    }
    return Arrays.copyOf(points, k);
}

private int d(int[] p) { return p[0] * p[0] + p[1] * p[1]; }
private void swap(int[][] a, int i, int j) { int[] t = a[i]; a[i] = a[j]; a[j] = t; }`,
        javascript: `function kClosest(points, k) {
  const a = [...points];
  const d = (p) => p[0] * p[0] + p[1] * p[1];
  let lo = 0, hi = a.length - 1;
  while (lo < hi) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    [a[r], a[hi]] = [a[hi], a[r]];
    const pv = d(a[hi]);
    let w = lo;
    for (let i = lo; i < hi; i++) if (d(a[i]) < pv) { [a[w], a[i]] = [a[i], a[w]]; w++; }
    [a[w], a[hi]] = [a[hi], a[w]];
    if (w === k - 1) break;
    if (w < k - 1) lo = w + 1;
    else hi = w - 1;
  }
  return a.slice(0, k);
}`,
      },
    },
  ],
  pitfalls: [
    '用 `sqrt` 算距離:多一層浮點運算還可能有誤差,比平方和就好',
    '前 k **小**要用**最大**堆:堆頂是目前最遠的,新的點比它近才換掉',
    'Quickselect 每次都選最右邊當基準,遇到已經排好的資料會退化成 O(n²),要隨機選',
  ],
  followUp: [{ q: '同樣的三種做法?', a: '[215. Kth Largest Element](#/q/215)(排序 / 最小堆 / Quickselect)、[347. Top K Frequent](#/q/347)。' }],
  check: {
    kind: 'fn',
    fn: 'kClosest',
    compare: 'sorted',
    cases: [
      { args: [[[1, 3], [-2, 2]], 1], out: [[-2, 2]] },
      { args: [[[3, 3], [5, -1], [-2, 4]], 2], out: [[3, 3], [-2, 4]] },
      { args: [PTS, K], out: [[1, 1], [-1, -2]] },
      { args: [[[0, 1], [1, 0]], 2], out: [[0, 1], [1, 0]] },
      { args: [[[2, 2], [1, 1], [3, 3], [-4, 0], [0, -1]], 3], out: [[2, 2], [1, 1], [0, -1]] },
    ],
  },
}
