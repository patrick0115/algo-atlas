import { arr, range, treeLayout } from '../engine/helpers'
import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 347. Top K Frequent Elements

const A = [4, 1, 1, 2, 2, 2, 3, 1, 4]
const K = 2

function counts(): Map<number, number> {
  const m = new Map<number, number>()
  for (const x of A) m.set(x, (m.get(x) ?? 0) + 1)
  return m
}

function countSteps(): FigStep[] {
  const m = new Map<number, number>()
  const out: FigStep[] = []
  A.forEach((x, i) => {
    m.set(x, (m.get(x) ?? 0) + 1)
    if (i === 0 || i === A.length - 1 || i === 4)
      out.push({ note: i === A.length - 1 ? '第一步:用 Hash Map 數完每個數出現幾次' : `計數中… nums[${i}] = ${x},次數 +1`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), kv(m, 'count(數 → 次數)', [x])] })
  })
  return out
}

function sortFig(): FigStep[] {
  const m = counts()
  const keys = [...m.keys()]
  const sorted = [...keys].sort((a, b) => m.get(b)! - m.get(a)!)
  return [
    ...countSteps(),
    { note: '把所有「不同的數」列出來', views: [arr(keys, { label: '不同的數' }), arr(keys.map((x) => m.get(x)!), { label: '次數' })] },
    { note: '依次數由大到小排序', views: [arr(sorted, { label: '依次數排序後' }), arr(sorted.map((x) => m.get(x)!), { label: '次數' })] },
    { note: `取前 k = ${K} 個:[${sorted.slice(0, K).join(', ')}]`, views: [arr(sorted, { label: '依次數排序後', done: range(0, K - 1), dim: range(K, sorted.length - 1) }), arr(sorted.map((x) => m.get(x)!), { label: '次數', done: range(0, K - 1), dim: range(K, sorted.length - 1) })] },
  ]
}

function heapView(h: [number, number][], label: string): GraphViewData {
  const { nodes, edges } = treeLayout(h.map((p) => p[1]))
  return { kind: 'graph', label, nodes: nodes.map((n, i) => ({ ...n, sub: `×${h[i][0]}`, cls: i === 0 ? 'hl' : undefined })), edges }
}

function heapFig(): FigStep[] {
  const m = counts()
  const h: [number, number][] = [] // [次數, 數],依次數的 min-heap
  const up = () => {
    let i = h.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (h[p][0] <= h[i][0]) break
      ;[h[p], h[i]] = [h[i], h[p]]
      i = p
    }
  }
  const down = () => {
    let i = 0
    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let s = i
      if (l < h.length && h[l][0] < h[s][0]) s = l
      if (r < h.length && h[r][0] < h[s][0]) s = r
      if (s === i) break
      ;[h[s], h[i]] = [h[i], h[s]]
      i = s
    }
  }
  const out: FigStep[] = [...countSteps()]
  out.push({ note: `準備一個「最小堆」,最多只放 k = ${K} 個。堆頂(黑色)永遠是目前留下來的裡面次數最少的`, views: [kv(m, 'count'), heapView(h, 'min-heap(節點下方是次數)')] })
  for (const [x, c] of m) {
    h.push([c, x])
    up()
    if (h.length > K) {
      out.push({ note: `放入 ${x}(×${c}),堆裡有 ${h.length} 個,超過 k 了`, views: [kv(m, 'count', [x]), heapView(h, 'min-heap(節點下方是次數)')] })
      const top = h[0]
      h[0] = h[h.length - 1]
      h.pop()
      down()
      out.push({ note: `踢掉堆頂 ${top[1]}(×${top[0]}):它是次數最少的,不可能是前 k 名`, views: [kv(m, 'count', [x]), heapView(h, 'min-heap(節點下方是次數)')] })
    } else {
      out.push({ note: `放入 ${x}(×${c}),堆裡還不到 k 個,直接放`, views: [kv(m, 'count', [x]), heapView(h, 'min-heap(節點下方是次數)')] })
    }
  }
  out.push({ note: `全部處理完,堆裡剩下的 [${h.map((p) => p[1]).join(', ')}] 就是答案`, views: [heapView(h, 'min-heap(節點下方是次數)')] })
  return out
}

function bucketFig(): FigStep[] {
  const m = counts()
  const buckets: number[][] = Array.from({ length: A.length + 1 }, () => [])
  const view = (opt: Parameters<typeof arr>[1] = {}) => arr(buckets.map((b) => (b.length ? b.join(',') : '·')), { label: 'bucket[次數] = 出現這麼多次的數', ...opt })
  const out: FigStep[] = [...countSteps()]
  out.push({ note: `次數最多就是 n = ${A.length},所以開 n+1 個桶,桶的索引 = 次數`, views: [kv(m, 'count'), view()] })
  for (const [x, c] of m) {
    buckets[c].push(x)
    out.push({ note: `${x} 出現 ${c} 次 → 放進 bucket[${c}]`, views: [kv(m, 'count', [x]), view({ highlight: [c] })] })
  }
  const res: number[] = []
  for (let f = A.length; f >= 1 && res.length < K; f--) {
    if (!buckets[f].length) continue
    res.push(...buckets[f])
    out.push({ note: `從最大的次數往回走:bucket[${f}] 有 [${buckets[f].join(', ')}],收進答案 → [${res.join(', ')}]${res.length >= K ? `,湊滿 k = ${K} 個,結束` : ''}`, views: [view({ highlight: [f], dim: range(f + 1, A.length) })] })
  }
  return out
}

export const q0347: Solution = {
  id: 347,
  plain: '找出出現次數最多的前 k 個數字。像統計班上最多人喜歡的前 3 種水果。',
  statement: '給一個整數陣列 `nums` 和整數 `k`,回傳**出現次數最多**的前 `k` 個數(順序不限)。題目保證答案唯一。',
  examples: [
    { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]', note: '1 出現 3 次、2 出現 2 次' },
    { input: 'nums = [1], k = 1', output: '[1]' },
  ],
  constraints: [
    '`1 ≤ nums.length ≤ 10⁵` → O(n log n) 可以過;題目的 follow-up 要求**比 O(n log n) 更好**',
    '`-10⁴ ≤ nums[i] ≤ 10⁴` → 值域只有約 2 萬,C 可以直接開陣列計數',
    '`k` 介於 1 和「不同數字的個數」之間,答案保證唯一 → 不用處理次數同分的取捨',
  ],
  insight: [
    '拆成兩件事:① **數次數**(Hash Map,O(n))② **從次數裡挑前 k 大**',
    '② 最直接是全部排序 → O(m log m),m 是不同數字的個數',
    '只要前 k 名,不需要全部排好 → 用大小 k 的 [[p:heap]]:O(m log k)',
    '再觀察:**次數最多就是 n**,範圍很小 → 可以用「次數」當索引分桶(桶排序),O(n) 完成',
  ],
  approaches: [
    {
      name: '計數 + 依次數排序',
      idea: '用 Hash Map 數次數,把不同的數依次數由大到小排序,取前 k 個。',
      steps: ['`count = {}`,數每個數出現幾次', '把 `count` 的 key 依 `count[x]` 由大到小排序', '回傳前 `k` 個'],
      figure: { title: 'nums = [4,1,1,2,2,2,3,1,4], k = 2', steps: sortFig() },
      complexity: { time: 'O(n + m log m)', space: 'O(m)', why: '數次數 O(n);m 個不同的數排序 O(m log m)。最壞 m = n,也就是 O(n log n)。' },
      verdict: '最好寫,大多數情況夠快。但不符合 follow-up「優於 O(n log n)」。',
      code: {
        python: `def topKFrequent(nums, k):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    keys = sorted(count, key=lambda x: count[x], reverse=True)
    return keys[:k]`,
        c: `// 值域只有 -10^4 ~ 10^4,直接開陣列計數,不用 Hash Map
#define OFF 10000
static int cnt[2 * OFF + 1];

int cmpByCount(const void *a, const void *b) {
    return cnt[*(const int *)b + OFF] - cnt[*(const int *)a + OFF];   // 次數大的在前
}

int *topKFrequent(int *nums, int numsSize, int k, int *returnSize) {
    memset(cnt, 0, sizeof(cnt));
    int *keys = malloc(numsSize * sizeof(int)), m = 0;
    for (int i = 0; i < numsSize; i++)
        if (cnt[nums[i] + OFF]++ == 0) keys[m++] = nums[i];   // 第一次出現才記
    qsort(keys, m, sizeof(int), cmpByCount);
    *returnSize = k;
    return keys;   // 前 k 個就是答案
}`,
        cpp: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> count;
    for (int x : nums) count[x]++;
    vector<pair<int, int>> v(count.begin(), count.end());   // (數, 次數)
    sort(v.begin(), v.end(), [](auto& a, auto& b) { return a.second > b.second; });
    vector<int> res;
    for (int i = 0; i < k; i++) res.push_back(v[i].first);
    return res;
}`,
        java: `int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int x : nums) count.merge(x, 1, Integer::sum);
    List<Integer> keys = new ArrayList<>(count.keySet());
    keys.sort((a, b) -> count.get(b) - count.get(a));
    int[] res = new int[k];
    for (int i = 0; i < k; i++) res[i] = keys.get(i);
    return res;
}`,
        javascript: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  return [...count.keys()]
    .sort((a, b) => count.get(b) - count.get(a))
    .slice(0, k);
}`,
      },
    },
    {
      name: '計數 + 大小為 k 的最小堆',
      idea: '維持一個最多 k 個元素的**最小堆**(依次數)。超過 k 個就踢掉堆頂 —— 它是目前次數最少的,不可能進前 k 名。',
      steps: ['數次數', '對每個不同的數 `x`:把 `(count[x], x)` 放進最小堆', '堆的大小超過 `k` → 彈出堆頂', '最後堆裡剩下的 k 個就是答案'],
      figure: { title: 'nums = [4,1,1,2,2,2,3,1,4], k = 2', steps: heapFig() },
      complexity: { time: 'O(n + m log k)', space: 'O(m + k)', why: '每個不同的數進出堆一次,堆最多 k+1 個,一次操作 O(log k)。k 遠小於 m 時比全排序快。' },
      verdict: '「前 k 大 / 前 k 小」的萬用解法,資料是串流(一直進來、不能全部存)時也能用。注意要用**最小**堆找前 k **大**。',
      code: {
        python: `import heapq

def topKFrequent(nums, k):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    heap = []                              # (次數, 數),heapq 是最小堆
    for x, c in count.items():
        heapq.heappush(heap, (c, x))
        if len(heap) > k:
            heapq.heappop(heap)            # 踢掉次數最少的
    return [x for c, x in heap]
# 內建版:return heapq.nlargest(k, count, key=count.get)`,
        c: `#define OFF 10000
static int cnt[2 * OFF + 1];

// 最小堆,存的是「數」,依 cnt 比較
static int heap[2 * OFF + 2], hsz;
static int less(int a, int b) { return cnt[a + OFF] < cnt[b + OFF]; }
static void swap(int i, int j) { int t = heap[i]; heap[i] = heap[j]; heap[j] = t; }

static void push(int x) {
    int i = hsz++;
    heap[i] = x;
    while (i > 0 && less(heap[i], heap[(i - 1) / 2])) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }
}

static void pop(void) {
    heap[0] = heap[--hsz];
    for (int i = 0;;) {
        int l = 2 * i + 1, r = l + 1, s = i;
        if (l < hsz && less(heap[l], heap[s])) s = l;
        if (r < hsz && less(heap[r], heap[s])) s = r;
        if (s == i) break;
        swap(i, s); i = s;
    }
}

int *topKFrequent(int *nums, int numsSize, int k, int *returnSize) {
    memset(cnt, 0, sizeof(cnt));
    hsz = 0;
    for (int i = 0; i < numsSize; i++) cnt[nums[i] + OFF]++;
    for (int v = 0; v <= 2 * OFF; v++) {
        if (!cnt[v]) continue;
        push(v - OFF);
        if (hsz > k) pop();
    }
    int *res = malloc(k * sizeof(int));
    memcpy(res, heap, k * sizeof(int));
    *returnSize = k;
    return res;
}`,
        cpp: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> count;
    for (int x : nums) count[x]++;
    // (次數, 數) 的最小堆:greater<> 讓最小的在頂端
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;
    for (auto& [x, c] : count) {
        heap.push({c, x});
        if ((int)heap.size() > k) heap.pop();
    }
    vector<int> res;
    while (!heap.empty()) { res.push_back(heap.top().second); heap.pop(); }
    return res;
}`,
        java: `int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int x : nums) count.merge(x, 1, Integer::sum);
    // 依次數的最小堆
    PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> count.get(a) - count.get(b));
    for (int x : count.keySet()) {
        heap.offer(x);
        if (heap.size() > k) heap.poll();
    }
    int[] res = new int[k];
    for (int i = 0; i < k; i++) res[i] = heap.poll();
    return res;
}`,
        javascript: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  // JavaScript 沒有內建的堆,自己寫一個最小堆,依次數比較
  const heap = [];
  const c = (i) => count.get(heap[i]);
  const swap = (i, j) => ([heap[i], heap[j]] = [heap[j], heap[i]]);
  const push = (x) => {
    heap.push(x);
    for (let i = heap.length - 1; i > 0 && c(i) < c((i - 1) >> 1); i = (i - 1) >> 1) swap(i, (i - 1) >> 1);
  };
  const pop = () => {
    heap[0] = heap[heap.length - 1];
    heap.pop();
    for (let i = 0; ; ) {
      const l = 2 * i + 1, r = l + 1;
      let s = i;
      if (l < heap.length && c(l) < c(s)) s = l;
      if (r < heap.length && c(r) < c(s)) s = r;
      if (s === i) break;
      swap(i, s);
      i = s;
    }
  };
  for (const x of count.keys()) {
    push(x);
    if (heap.length > k) pop();
  }
  return heap;
}`,
      },
    },
    {
      name: '計數 + 桶排序(依次數分桶)',
      idea: '次數一定介於 1 到 n,開 n+1 個桶,`bucket[c]` 放「出現 c 次的數」。從最大的桶往回收,湊滿 k 個就停。',
      steps: ['數次數', '`bucket = n+1 個空清單`', '對每個不同的數 `x`:`bucket[count[x]].append(x)`', '`c` 從 n 往下走,把 `bucket[c]` 收進答案,湊滿 `k` 個就停'],
      figure: { title: 'nums = [4,1,1,2,2,2,3,1,4], k = 2', steps: bucketFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '數次數 O(n)、分桶 O(m)、往回走最多 n 個桶。沒有任何比較排序,所以是線性的。' },
      verdict: '符合 follow-up 的最佳解。關鍵觀察是「次數的範圍只有 1~n」—— 值的範圍很小時,就能用值當索引取代排序(這就是[[p:counting-sort]]的想法)。',
      code: {
        python: `def topKFrequent(nums, k):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    bucket = [[] for _ in range(len(nums) + 1)]   # bucket[c] = 出現 c 次的數
    for x, c in count.items():
        bucket[c].append(x)
    res = []
    for c in range(len(nums), 0, -1):
        for x in bucket[c]:
            res.append(x)
            if len(res) == k:
                return res
    return res`,
        c: `#define OFF 10000
static int cnt[2 * OFF + 1];

int *topKFrequent(int *nums, int numsSize, int k, int *returnSize) {
    memset(cnt, 0, sizeof(cnt));
    for (int i = 0; i < numsSize; i++) cnt[nums[i] + OFF]++;
    // 桶用「計數排序」的方式擺:先數每個次數有幾個數,再算起點
    int *start = calloc(numsSize + 2, sizeof(int));
    for (int v = 0; v <= 2 * OFF; v++) if (cnt[v]) start[cnt[v]]++;
    for (int c = numsSize, acc = 0; c >= 1; c--) { int t = start[c]; start[c] = acc; acc += t; }
    int *order = malloc(numsSize * sizeof(int));   // 依次數由大到小排好的數
    for (int v = 0; v <= 2 * OFF; v++) if (cnt[v]) order[start[cnt[v]]++] = v - OFF;
    free(start);
    *returnSize = k;
    return order;   // 前 k 個就是答案
}`,
        cpp: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> count;
    for (int x : nums) count[x]++;
    int n = nums.size();
    vector<vector<int>> bucket(n + 1);       // bucket[c] = 出現 c 次的數
    for (auto& [x, c] : count) bucket[c].push_back(x);
    vector<int> res;
    for (int c = n; c >= 1 && (int)res.size() < k; c--)
        for (int x : bucket[c]) {
            res.push_back(x);
            if ((int)res.size() == k) break;
        }
    return res;
}`,
        java: `int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int x : nums) count.merge(x, 1, Integer::sum);
    int n = nums.length;
    List<Integer>[] bucket = new List[n + 1];   // bucket[c] = 出現 c 次的數
    for (int i = 0; i <= n; i++) bucket[i] = new ArrayList<>();
    for (var e : count.entrySet()) bucket[e.getValue()].add(e.getKey());
    int[] res = new int[k];
    int idx = 0;
    for (int c = n; c >= 1 && idx < k; c--)
        for (int x : bucket[c]) {
            res[idx++] = x;
            if (idx == k) break;
        }
    return res;
}`,
        javascript: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  const bucket = Array.from({ length: nums.length + 1 }, () => []);   // bucket[c] = 出現 c 次的數
  for (const [x, c] of count) bucket[c].push(x);
  const res = [];
  for (let c = nums.length; c >= 1 && res.length < k; c--)
    for (const x of bucket[c]) {
      res.push(x);
      if (res.length === k) break;
    }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '找前 k **大**要用**最小**堆:堆頂是留下來的裡面最弱的,新來的比它強才換掉它。用最大堆的話要把全部 m 個都放進去再彈 k 次,變成 O(m log m)',
    '桶的數量是 `n + 1`(次數最多是 n),不是不同數字的個數',
    'Python 的 `heapq` 只有最小堆;要最大堆的話把次數取負號',
    'Java 比較器寫 `count.get(a) - count.get(b)` 這題安全(次數 ≤ 10⁵),但一般情況建議用 `Integer.compare` 避免溢位',
  ],
  followUp: [
    { q: '平均 O(n) 的另一種做法?', a: 'Quickselect:用[[p:quick-sort]]的 partition 只處理一邊,平均 O(m)、最壞 O(m²)。215. Kth Largest Element 是它的經典題。' },
    { q: '如果資料是串流、一直有新的數進來?', a: '桶排序要知道 n,不適用;用大小 k 的最小堆最穩(搭配 Hash Map 更新次數)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'topKFrequent',
    compare: 'sorted',
    cases: [
      { args: [[1, 1, 1, 2, 2, 3], 2], out: [1, 2] },
      { args: [[1], 1], out: [1] },
      { args: [[4, 1, 1, 2, 2, 2, 3, 1, 4], 2], out: [1, 2] },
      { args: [[-1, -1, 5, 5, 5, 7], 1], out: [5] },
      { args: [[3, 0, 1, 0], 1], out: [0] },
      { args: [[5, 3, 1, 1, 1, 3, 73, 1], 2], out: [1, 3] },
    ],
  },
}
