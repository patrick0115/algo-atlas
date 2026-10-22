import { arr } from '../engine/helpers'
import { intervalsView } from './fig'
import type { FigStep, Solution } from './types'

// 1851. Minimum Interval to Include Each Query

const IV = [
  [1, 4],
  [2, 4],
  [3, 6],
  [4, 4],
]
const QS = [2, 3, 4, 5]

function heapFig(): FigStep[] {
  const iv = [...IV].sort((a, b) => a[0] - b[0])
  const qs = QS.map((q, i) => [q, i]).sort((a, b) => a[0] - b[0])
  const heap: [number, number][] = []
  const ans: (number | string)[] = QS.map(() => '?')
  let k = 0
  const out: FigStep[] = [
    { note: '把區間依左端排序、查詢也由小到大處理。查詢 q 時:左端 ≤ q 的區間都「可能」包含它 → 放進最小堆(依長度排序)', views: [intervalsView(iv), arr(QS, { label: 'queries' })] },
  ]
  for (const [q, qi] of qs) {
    const added: number[] = []
    while (k < iv.length && iv[k][0] <= q) {
      heap.push([iv[k][1] - iv[k][0] + 1, iv[k][1]])
      added.push(k)
      k++
    }
    heap.sort((a, b) => a[0] - b[0])
    const removed: string[] = []
    while (heap.length && heap[0][1] < q) removed.push(`[長 ${heap[0][0]},右端 ${heap.shift()![1]}]`)
    ans[qi] = heap.length ? heap[0][0] : -1
    out.push({
      note: `查詢 ${q}:${added.length ? `加入左端 ≤ ${q} 的區間 ${added.map((i) => `[${iv[i]}]`).join('、')};` : ''}${removed.length ? `丟掉右端 < ${q} 的 ${removed.join('、')}(它們包不住 ${q},之後更大的查詢也包不住);` : ''}堆頂最短的長度 = ${ans[qi]}`,
      views: [intervalsView(iv, { cls: Object.fromEntries(iv.map((_, i) => [i, i >= k ? 'dim' : heap.some((h) => h[1] === iv[i][1] && h[0] === iv[i][1] - iv[i][0] + 1) ? 'hl' : 'dim'])) }), arr(heap.map((h) => `長${h[0]}`), { label: '最小堆(依長度)', highlight: heap.length ? [0] : [] }), arr([...ans], { label: '答案', highlight: [qi] })],
    })
  }
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:每個查詢都檢查所有區間,找出包含它的、最短的那個', views: [intervalsView(IV, { cls: { 0: 'hl', 1: 'hl' } }), arr(QS, { label: 'queries', highlight: [0] })] },
    { note: '查詢 2 被 [1,4](長 4)和 [2,4](長 3)包含 → 3。n 和 q 都 10⁵ 時是 10¹⁰,太慢', views: [intervalsView(IV, { cls: { 1: 'done' } }), arr([3], { label: '答案[0]' })] },
  ]
}

export const q1851: Solution = {
  id: 1851,
  plain: '有一堆區間,和一堆查詢的數字。對每個查詢,找出「包含這個數字」的區間中**最短**的那個,回報它的長度;找不到就回報 −1。',
  statement: '`intervals[i] = [left, right]`,長度是 `right − left + 1`。對每個 `queries[j]`,回傳包含它(`left ≤ q ≤ right`)的最短區間長度;沒有則回傳 −1。',
  examples: [
    { input: 'intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]', output: '[3,3,1,4]' },
    { input: 'intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]', output: '[2,-1,4,6]' },
  ],
  constraints: ['區間數、查詢數都 ≤ 10⁵ → 要 O((n + q) log)'],
  insight: [
    '查詢的順序不重要(最後放回原位置就好)→ 把查詢**排序**,由小到大處理',
    '區間依左端排序。處理查詢 q 時,把所有左端 ≤ q 的區間加入候選(之後更大的查詢也適用)',
    '候選裡右端 < q 的包不住 q,也包不住之後更大的查詢 → 可以永久丟掉',
    '在剩下的候選中要「最短的」→ 用依長度排序的**最小堆**;過期的只在堆頂時才丟(延遲刪除)',
  ],
  approaches: [
    {
      name: '暴力:每個查詢掃所有區間',
      idea: '對每個 q,`min(r − l + 1 for l, r in intervals if l <= q <= r)`。',
      steps: ['`for q in queries`', '掃所有區間,包含 q 的取最短', '沒有就 −1'],
      figure: { title: `intervals = ${JSON.stringify(IV)}`, steps: bruteFig() },
      complexity: { time: 'O(n · q)', space: 'O(1)', why: '每個查詢掃一次全部區間。' },
      verdict: '正確但太慢;用來確認題意。',
      code: {
        python: `def minInterval(intervals, queries):
    res = []
    for q in queries:
        best = -1
        for l, r in intervals:
            if l <= q <= r and (best == -1 or r - l + 1 < best):
                best = r - l + 1
        res.append(best)
    return res`,
        c: `int *minInterval(int **intervals, int intervalsSize, int *intervalsColSize, int *queries, int queriesSize, int *returnSize) {
    int *res = malloc(queriesSize * sizeof(int));
    for (int j = 0; j < queriesSize; j++) {
        int q = queries[j], best = -1;
        for (int i = 0; i < intervalsSize; i++) {
            int l = intervals[i][0], r = intervals[i][1];
            if (l <= q && q <= r && (best == -1 || r - l + 1 < best)) best = r - l + 1;
        }
        res[j] = best;
    }
    *returnSize = queriesSize;
    return res;
}`,
        cpp: `vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
    vector<int> res;
    for (int q : queries) {
        int best = -1;
        for (auto& iv : intervals)
            if (iv[0] <= q && q <= iv[1] && (best == -1 || iv[1] - iv[0] + 1 < best)) best = iv[1] - iv[0] + 1;
        res.push_back(best);
    }
    return res;
}`,
        java: `int[] minInterval(int[][] intervals, int[] queries) {
    int[] res = new int[queries.length];
    for (int j = 0; j < queries.length; j++) {
        int q = queries[j], best = -1;
        for (int[] iv : intervals)
            if (iv[0] <= q && q <= iv[1] && (best == -1 || iv[1] - iv[0] + 1 < best)) best = iv[1] - iv[0] + 1;
        res[j] = best;
    }
    return res;
}`,
        javascript: `function minInterval(intervals, queries) {
  return queries.map((q) => {
    let best = -1;
    for (const [l, r] of intervals)
      if (l <= q && q <= r && (best === -1 || r - l + 1 < best)) best = r - l + 1;
    return best;
  });
}`,
      },
    },
    {
      name: '排序 + 最小堆(離線處理查詢)',
      idea: '區間依左端排序;查詢帶著原索引由小到大處理。每個 q:把左端 ≤ q 的區間以 `(長度, 右端)` 放進最小堆;彈掉右端 < q 的堆頂;堆頂的長度就是答案。',
      steps: ['`intervals.sort()`;`order = sorted(range(len(queries)), key=queries)`', '每個 q:`while i < n and intervals[i][0] <= q`:push `(r − l + 1, r)`', '`while heap and heap[0][1] < q`:pop', '`ans[原索引] = heap[0][0] if heap else −1`'],
      figure: { title: `intervals = ${JSON.stringify(IV)},queries = [${QS}]`, steps: heapFig() },
      complexity: { time: 'O(n log n + q log q)', space: 'O(n + q)', why: '兩次排序;每個區間進出堆各一次。' },
      verdict: '標準解,[[p:heap]] + 「離線排序查詢」的技巧。查詢可以排序是關鍵 —— 這樣候選區間只進不退。',
      code: {
        python: `import heapq

def minInterval(intervals, queries):
    intervals.sort()
    ans = [-1] * len(queries)
    heap, i = [], 0
    for j in sorted(range(len(queries)), key=lambda j: queries[j]):
        q = queries[j]
        while i < len(intervals) and intervals[i][0] <= q:   # 左端 ≤ q:成為候選
            l, r = intervals[i]
            heapq.heappush(heap, (r - l + 1, r))
            i += 1
        while heap and heap[0][1] < q:        # 右端 < q:包不住,以後也包不住
            heapq.heappop(heap)
        if heap:
            ans[j] = heap[0][0]
    return ans`,
        c: `static int **IVS;
static int *QV;
static int cmpIv(const void *a, const void *b) { return (*(int **)a)[0] - (*(int **)b)[0]; }
static int cmpQ(const void *a, const void *b) { return QV[*(int *)a] - QV[*(int *)b]; }

// 最小堆:元素是 (長度, 右端)
static long long *H;
static int hn;
static void hpush(long long x) {
    int i = hn++;
    H[i] = x;
    while (i && H[(i - 1) / 2] > H[i]) { long long t = H[i]; H[i] = H[(i - 1) / 2]; H[(i - 1) / 2] = t; i = (i - 1) / 2; }
}
static void hpop(void) {
    H[0] = H[--hn];
    for (int i = 0;;) {
        int s = i, l = 2 * i + 1, r = l + 1;
        if (l < hn && H[l] < H[s]) s = l;
        if (r < hn && H[r] < H[s]) s = r;
        if (s == i) break;
        long long t = H[s]; H[s] = H[i]; H[i] = t; i = s;
    }
}

int *minInterval(int **intervals, int intervalsSize, int *intervalsColSize, int *queries, int queriesSize, int *returnSize) {
    qsort(intervals, intervalsSize, sizeof(int *), cmpIv);
    QV = queries;
    int *order = malloc(queriesSize * sizeof(int)), *ans = malloc(queriesSize * sizeof(int));
    for (int j = 0; j < queriesSize; j++) order[j] = j;
    qsort(order, queriesSize, sizeof(int), cmpQ);
    H = malloc((intervalsSize + 1) * sizeof(long long)); hn = 0;
    int i = 0;
    for (int t = 0; t < queriesSize; t++) {
        int j = order[t], q = queries[j];
        while (i < intervalsSize && intervals[i][0] <= q) {
            long long len = intervals[i][1] - intervals[i][0] + 1;
            hpush(len << 32 | (unsigned)intervals[i][1]);    // 長度放高位,同時記住右端
            i++;
        }
        while (hn && (int)(H[0] & 0xffffffff) < q) hpop();
        ans[j] = hn ? (int)(H[0] >> 32) : -1;
    }
    free(order); free(H);
    *returnSize = queriesSize;
    return ans;
}`,
        cpp: `vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
    sort(intervals.begin(), intervals.end());
    vector<int> order(queries.size()), ans(queries.size(), -1);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return queries[a] < queries[b]; });
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;   // (長度, 右端)
    int i = 0;
    for (int j : order) {
        int q = queries[j];
        while (i < (int)intervals.size() && intervals[i][0] <= q) {
            pq.push({intervals[i][1] - intervals[i][0] + 1, intervals[i][1]});
            i++;
        }
        while (!pq.empty() && pq.top().second < q) pq.pop();
        if (!pq.empty()) ans[j] = pq.top().first;
    }
    return ans;
}`,
        java: `int[] minInterval(int[][] intervals, int[] queries) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    Integer[] order = new Integer[queries.length];
    for (int j = 0; j < queries.length; j++) order[j] = j;
    Arrays.sort(order, (a, b) -> queries[a] - queries[b]);
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);   // {長度, 右端}
    int[] ans = new int[queries.length];
    int i = 0;
    for (int j : order) {
        int q = queries[j];
        while (i < intervals.length && intervals[i][0] <= q) {
            pq.add(new int[]{intervals[i][1] - intervals[i][0] + 1, intervals[i][1]});
            i++;
        }
        while (!pq.isEmpty() && pq.peek()[1] < q) pq.poll();
        ans[j] = pq.isEmpty() ? -1 : pq.peek()[0];
    }
    return ans;
}`,
        javascript: `function minInterval(intervals, queries) {
  intervals.sort((a, b) => a[0] - b[0]);
  const order = queries.map((_, j) => j).sort((a, b) => queries[a] - queries[b]);
  // 最小堆,元素 [長度, 右端]
  const h = [];
  const less = (a, b) => a[0] < b[0];
  const push = (x) => {
    h.push(x);
    for (let i = h.length - 1, p; i && less(h[i], h[(p = (i - 1) >> 1)]); i = p) [h[i], h[p]] = [h[p], h[i]];
  };
  const pop = () => {
    const last = h.pop();
    if (!h.length) return;
    h[0] = last;
    for (let i = 0; ; ) {
      let s = i;
      const l = 2 * i + 1, r = l + 1;
      if (l < h.length && less(h[l], h[s])) s = l;
      if (r < h.length && less(h[r], h[s])) s = r;
      if (s === i) break;
      [h[i], h[s]] = [h[s], h[i]];
      i = s;
    }
  };
  const ans = new Array(queries.length).fill(-1);
  let i = 0;
  for (const j of order) {
    const q = queries[j];
    while (i < intervals.length && intervals[i][0] <= q) {
      push([intervals[i][1] - intervals[i][0] + 1, intervals[i][1]]);
      i++;
    }
    while (h.length && h[0][1] < q) pop();
    if (h.length) ans[j] = h[0][0];
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '排序查詢後直接依排序後的順序回傳:答案要放回**原本的位置**',
    '每個查詢都重新建堆:失去「候選只進不退」的好處',
    '堆依右端排序:要找的是最短的,應該依長度',
  ],
  check: {
    kind: 'fn',
    fn: 'minInterval',
    cases: [
      { args: [IV, QS], out: [3, 3, 1, 4] },
      { args: [[[2, 3], [2, 5], [1, 8], [20, 25]], [2, 19, 5, 22]], out: [2, -1, 4, 6] },
      { args: [[[1, 1]], [1, 2]], out: [1, -1] },
      { args: [[[5, 10], [1, 100]], [50, 7, 7]], out: [100, 6, 6] },
    ],
  },
}
