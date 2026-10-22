import { arr, treeLayout } from '../engine/helpers'
import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'

// 703. Kth Largest Element in a Stream

const K = 3
const INIT = [4, 5, 8, 2]
const ADDS = [3, 5, 10, 9, 4]

function sortedFig(): FigStep[] {
  const a = [...INIT].sort((x, y) => x - y)
  const out: FigStep[] = [{ note: `把所有數由小到大排好。第 ${K} 大 = 倒數第 ${K} 個`, views: [arr(a, { label: '排好的所有數', highlight: [a.length - K] })] }]
  for (const v of ADDS) {
    let i = 0
    while (i < a.length && a[i] < v) i++
    a.splice(i, 0, v)
    out.push({ note: `add(${v}):用二分找到插入位置 ${i},插進去(要把後面的往後搬)。第 ${K} 大是 ${a[a.length - K]}`, views: [arr(a, { label: '排好的所有數', compare: [i], highlight: [a.length - K] })] })
  }
  return out
}

function heapView(h: number[]): GraphViewData {
  const { nodes, edges } = treeLayout(h)
  return { kind: 'graph', label: `min-heap(最多 ${K} 個,堆頂就是第 ${K} 大)`, nodes: nodes.map((n, i) => ({ ...n, cls: i === 0 ? 'hl' : undefined })), edges }
}

function heapFig(): FigStep[] {
  const h: number[] = []
  const push = (v: number) => {
    h.push(v)
    for (let i = h.length - 1; i > 0 && h[(i - 1) >> 1] > h[i]; i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]]
  }
  const pop = () => {
    h[0] = h[h.length - 1]
    h.pop()
    for (let i = 0; ; ) {
      const l = 2 * i + 1
      const r = l + 1
      let m = i
      if (l < h.length && h[l] < h[m]) m = l
      if (r < h.length && h[r] < h[m]) m = r
      if (m === i) break
      ;[h[i], h[m]] = [h[m], h[i]]
      i = m
    }
  }
  const out: FigStep[] = [{ note: `只留下「目前最大的 ${K} 個」,放在**最小堆**裡。這 ${K} 個裡最小的(堆頂)就是第 ${K} 大。比它還小的數永遠不可能變成第 ${K} 大,可以丟掉`, views: [heapView([])] }]
  for (const v of INIT) {
    push(v)
    if (h.length > K) pop()
    out.push({ note: `初始化放入 ${v}${h.length === K && INIT.indexOf(v) >= K ? `,超過 ${K} 個 → 丟掉堆頂(最小的)` : ''}`, views: [heapView([...h])] })
  }
  for (const v of ADDS) {
    push(v)
    const over = h.length > K
    if (over) pop()
    out.push({ note: `add(${v}):放進去${over ? `,超過 ${K} 個 → 丟掉最小的` : ''}。回傳堆頂 ${h[0]}`, views: [heapView([...h])] })
  }
  return out
}

export const q0703: Solution = {
  id: 703,
  plain: '數字會一個一個不斷進來,每進來一個,就要立刻說出「到目前為止第 k 大的數」。訣竅:只要記住最大的 k 個,其中最小的那個就是答案。像只保留前 3 名的排行榜,第 3 名就是門檻。',
  statement: '設計 `KthLargest(k, nums)`:用初始陣列 nums 建立;`add(val)` 加入一個數,並回傳目前所有數裡**第 k 大**的數。',
  examples: [{ input: 'KthLargest(3, [4,5,8,2])、add(3)、add(5)、add(10)、add(9)、add(4)', output: '4、5、5、8、8' }],
  constraints: ['`1 ≤ k ≤ 10⁴`,最多 10⁴ 次 add', '保證每次 add 之後至少有 k 個數'],
  insight: [
    '第 k 大只和「最大的 k 個數」有關:比第 k 大還小的數,以後也不可能變成第 k 大(數只會越來越多)',
    '所以只要維護「目前最大的 k 個」,而答案就是這 k 個裡的**最小值** → 用大小為 k 的**最小堆**',
    '新數進來:放進堆;超過 k 個就把最小的踢掉。堆頂就是答案',
  ],
  approaches: [
    {
      name: '維持排序好的陣列',
      idea: '所有數存在排好的陣列裡,add 時用二分找位置插入,答案是倒數第 k 個。',
      steps: ['初始化:排序', '`add(val)`:二分找插入位置、插入', '回傳 `a[len − k]`'],
      figure: { title: `k = ${K}, nums = [${INIT.join(',')}],add ${ADDS.join('、')}`, steps: sortedFig() },
      complexity: { time: 'add O(n)', space: 'O(n)', why: '二分 O(log n),但插入要把後面的元素往後搬,O(n)。所有數都存著。' },
      verdict: '能過,但存了太多不需要的數,插入也慢。',
      code: {
        python: `from bisect import insort

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.a = sorted(nums)

    def add(self, val):
        insort(self.a, val)               # 二分插入,保持排序
        return self.a[-self.k]`,
        c: `typedef struct { int *a, n, cap, k; } KthLargest;

static void insertSorted(KthLargest *o, int v) {
    if (o->n == o->cap) o->a = realloc(o->a, (o->cap *= 2) * sizeof(int));
    int lo = 0, hi = o->n;
    while (lo < hi) { int mid = (lo + hi) / 2; if (o->a[mid] < v) lo = mid + 1; else hi = mid; }
    memmove(o->a + lo + 1, o->a + lo, (o->n - lo) * sizeof(int));
    o->a[lo] = v;
    o->n++;
}

KthLargest *kthLargestCreate(int k, int *nums, int numsSize) {
    KthLargest *o = malloc(sizeof(KthLargest));
    o->k = k; o->n = 0; o->cap = numsSize + 16;
    o->a = malloc(o->cap * sizeof(int));
    for (int i = 0; i < numsSize; i++) insertSorted(o, nums[i]);
    return o;
}

int kthLargestAdd(KthLargest *o, int val) {
    insertSorted(o, val);
    return o->a[o->n - o->k];
}

void kthLargestFree(KthLargest *o) {
    free(o->a); free(o);
}`,
        cpp: `class KthLargest {
    int k;
    vector<int> a;
public:
    KthLargest(int k, vector<int>& nums) : k(k), a(nums) { sort(a.begin(), a.end()); }

    int add(int val) {
        a.insert(lower_bound(a.begin(), a.end(), val), val);
        return a[a.size() - k];
    }
};`,
        java: `class KthLargest {
    private final int k;
    private final List<Integer> a = new ArrayList<>();

    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int x : nums) a.add(x);
        Collections.sort(a);
    }

    public int add(int val) {
        int i = Collections.binarySearch(a, val);
        if (i < 0) i = -i - 1;
        a.add(i, val);
        return a.get(a.size() - k);
    }
}`,
        javascript: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.a = [...nums].sort((x, y) => x - y);
  }

  add(val) {
    let lo = 0, hi = this.a.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.a[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    this.a.splice(lo, 0, val);
    return this.a[this.a.length - this.k];
  }
}`,
      },
    },
    {
      name: '大小為 k 的最小堆',
      idea: '堆裡只放目前最大的 k 個。add:放進去,超過 k 個就 pop 掉最小的;回傳堆頂。',
      steps: ['初始化:每個數都 `push`,超過 k 個就 `pop`', '`add(val)`:`push(val)`,大小 > k → `pop()`', '回傳堆頂'],
      figure: { title: `k = ${K}, nums = [${INIT.join(',')}],add ${ADDS.join('、')}`, steps: heapFig() },
      complexity: { time: 'add O(log k)', space: 'O(k)', why: '堆的大小固定是 k(多一個馬上 pop),每次操作 O(log k)。' },
      verdict: '標準解,「找第 k 大 → 大小 k 的最小堆」這個對應一定要記住。資料是串流、無法全部存下時也能用。',
      code: {
        python: `import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.h = []
        for x in nums:
            self.add(x)

    def add(self, val):
        heapq.heappush(self.h, val)
        if len(self.h) > self.k:
            heapq.heappop(self.h)         # 踢掉比第 k 大還小的
        return self.h[0]`,
        c: `typedef struct { int *h, n, k; } KthLargest;

static void up(int *h, int i) {
    while (i > 0 && h[(i - 1) / 2] > h[i]) { int p = (i - 1) / 2, t = h[p]; h[p] = h[i]; h[i] = t; i = p; }
}
static void down(int *h, int n, int i) {
    for (;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < n && h[l] < h[m]) m = l;
        if (r < n && h[r] < h[m]) m = r;
        if (m == i) return;
        int t = h[m]; h[m] = h[i]; h[i] = t; i = m;
    }
}

int kthLargestAdd(KthLargest *o, int val) {
    o->h[o->n] = val;
    up(o->h, o->n++);
    if (o->n > o->k) { o->h[0] = o->h[--o->n]; down(o->h, o->n, 0); }
    return o->h[0];
}

KthLargest *kthLargestCreate(int k, int *nums, int numsSize) {
    KthLargest *o = malloc(sizeof(KthLargest));
    o->k = k; o->n = 0;
    o->h = malloc((k + 2) * sizeof(int));
    for (int i = 0; i < numsSize; i++) kthLargestAdd(o, nums[i]);
    return o;
}

void kthLargestFree(KthLargest *o) {
    free(o->h); free(o);
}`,
        cpp: `class KthLargest {
    int k;
    priority_queue<int, vector<int>, greater<int>> h;   // 最小堆
public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int x : nums) add(x);
    }

    int add(int val) {
        h.push(val);
        if ((int)h.size() > k) h.pop();
        return h.top();
    }
};`,
        java: `class KthLargest {
    private final int k;
    private final PriorityQueue<Integer> h = new PriorityQueue<>();   // 預設是最小堆

    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int x : nums) add(x);
    }

    public int add(int val) {
        h.offer(val);
        if (h.size() > k) h.poll();
        return h.peek();
    }
}`,
        javascript: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.h = [];                          // 手寫最小堆
    for (const x of nums) this.add(x);
  }

  add(val) {
    const h = this.h;
    h.push(val);
    for (let i = h.length - 1; i > 0 && h[(i - 1) >> 1] > h[i]; i = (i - 1) >> 1)
      [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
    if (h.length > this.k) {
      h[0] = h.pop();
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < h.length && h[l] < h[m]) m = l;
        if (r < h.length && h[r] < h[m]) m = r;
        if (m === i) break;
        [h[i], h[m]] = [h[m], h[i]];
        i = m;
      }
    }
    return h[0];
  }
}`,
      },
    },
  ],
  pitfalls: [
    '用**最大堆**:要拿第 k 大就得 pop k − 1 次再放回去,每次 add 變成 O(k log n)',
    '初始化時 nums 可能少於 k 個(題目保證第一次 add 之後就夠),不能在建構子裡就假設堆有 k 個',
    'JavaScript 手寫堆時 `h[0] = h.pop()`:堆只剩一個元素時 pop 出來又放回 h[0],結果不變,邏輯仍正確',
  ],
  followUp: [{ q: '如果要的是「目前的中位數」?', a: '295. Find Median from Data Stream:兩個堆(左半最大堆、右半最小堆),見[[p:two-heaps]]。' }],
  check: {
    kind: 'class',
    cls: 'KthLargest',
    cases: [
      { ops: ['KthLargest', ...ADDS.map(() => 'add')], args: [[K, INIT], ...ADDS.map((v) => [v])], out: [null, 4, 5, 5, 8, 8] },
      { ops: ['KthLargest', 'add', 'add', 'add'], args: [[1, []], [-3], [-2], [-4]], out: [null, -3, -2, -2] },
      { ops: ['KthLargest', 'add', 'add'], args: [[2, [0]], [-1], [1]], out: [null, -1, 0] },
    ],
  },
}
