import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 295. Find Median from Data Stream

const STREAM = [5, 15, 1, 3, 8]

function heapFig(): FigStep[] {
  const lo: number[] = [] // 左半(最大堆)
  const hi: number[] = [] // 右半(最小堆)
  const out: FigStep[] = [{ note: '把資料切成兩半:**左半**用最大堆(隨時拿得到左半最大的)、**右半**用最小堆(隨時拿得到右半最小的)。保持左半個數 = 右半,或多一個', views: [arr([], { label: '左半(最大堆)' }), arr([], { label: '右半(最小堆)' })] }]
  for (const x of STREAM) {
    lo.push(x)
    lo.sort((a, b) => b - a)
    const moved = lo.shift()!
    hi.push(moved)
    hi.sort((a, b) => a - b)
    let back: number | null = null
    if (hi.length > lo.length) {
      back = hi.shift()!
      lo.push(back)
      lo.sort((a, b) => b - a)
    }
    const med = lo.length > hi.length ? lo[0] : (lo[0] + hi[0]) / 2
    out.push({
      note: `加入 ${x}:先放進左半,把左半最大的 ${moved} 移到右半${back !== null ? `;右半比較多,把右半最小的 ${back} 移回左半` : ''}。中位數 = ${lo.length > hi.length ? `左半最大 ${lo[0]}` : `(${lo[0]} + ${hi[0]}) / 2 = ${med}`}`,
      views: [arr([...lo], { label: '左半(最大堆)', highlight: [0] }), arr([...hi], { label: '右半(最小堆)', highlight: lo.length > hi.length ? [] : [0] })],
    })
  }
  return out
}

function sortFig(): FigStep[] {
  return [
    { note: '最直接:維護一個排好序的陣列。新數字用二分搜尋找位置插進去,中位數就是正中間', views: [arr([1, 5, 15], { label: '排序陣列' })] },
    { note: '加入 3:二分找到位置 1 插入,後面的元素要整個往後搬 → 插入是 O(n)', views: [arr([1, 3, 5, 15], { label: '排序陣列', highlight: [1], compare: [1, 2] })] },
  ]
}

export const q0295: Solution = {
  id: 295,
  plain: '數字一個一個進來,隨時可能有人問:「到目前為止所有數字的中位數是多少?」要讓「加入」和「查詢」都很快。',
  statement: '設計 `MedianFinder`:`addNum(num)` 加入一個整數;`findMedian()` 回傳目前所有數字的中位數(個數為偶數時是中間兩個的平均)。',
  examples: [
    {
      input: '["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]\n[[],[1],[2],[],[3],[]]',
      output: '[null,null,null,1.5,null,2.0]',
    },
  ],
  constraints: ['呼叫次數 ≤ 5·10⁴', 'Follow-up:如果所有數都在 0..100 之間?'],
  insight: [
    '中位數只跟「中間那一兩個數」有關,不需要整個排好序',
    '把資料分成**小的一半**和**大的一半**:小的一半要能快速拿到最大值 → 最大堆;大的一半要能快速拿到最小值 → 最小堆',
    '每次加入後調整兩邊的個數,讓左邊 = 右邊或多一個。中位數就是左邊的頂端(奇數)或兩個頂端的平均(偶數)',
  ],
  approaches: [
    {
      name: '排序陣列 + 二分插入',
      idea: '`addNum` 用二分找插入位置(`bisect.insort`);`findMedian` 直接看中間。',
      steps: ['addNum:`insort(data, num)`', 'findMedian:n 奇數 → `data[n//2]`;偶數 → 中間兩個平均'],
      figure: { title: '依序加入 5、15、1、3', steps: sortFig() },
      complexity: { time: 'addNum O(n),findMedian O(1)', space: 'O(n)', why: '二分是 O(log n),但插入要搬動後面的元素。' },
      verdict: '好寫,資料量不大時其實很快(搬動是連續記憶體)。',
      code: {
        python: `from bisect import insort

class MedianFinder:
    def __init__(self):
        self.data = []

    def addNum(self, num):
        insort(self.data, num)                # 二分找位置插入

    def findMedian(self):
        d, n = self.data, len(self.data)
        return float(d[n // 2]) if n % 2 else (d[n // 2 - 1] + d[n // 2]) / 2`,
        c: `typedef struct { int *a; int n, cap; } MedianFinder;

MedianFinder *medianFinderCreate(void) {
    MedianFinder *mf = malloc(sizeof(MedianFinder));
    mf->cap = 16; mf->n = 0;
    mf->a = malloc(mf->cap * sizeof(int));
    return mf;
}

void medianFinderAddNum(MedianFinder *mf, int num) {
    if (mf->n == mf->cap) { mf->cap *= 2; mf->a = realloc(mf->a, mf->cap * sizeof(int)); }
    int lo = 0, hi = mf->n;
    while (lo < hi) { int mid = (lo + hi) / 2; if (mf->a[mid] < num) lo = mid + 1; else hi = mid; }
    memmove(mf->a + lo + 1, mf->a + lo, (mf->n - lo) * sizeof(int));
    mf->a[lo] = num;
    mf->n++;
}

double medianFinderFindMedian(MedianFinder *mf) {
    int n = mf->n;
    return n % 2 ? mf->a[n / 2] : (mf->a[n / 2 - 1] + (double)mf->a[n / 2]) / 2;
}

void medianFinderFree(MedianFinder *mf) { free(mf->a); free(mf); }`,
        cpp: `class MedianFinder {
    vector<int> a;
public:
    void addNum(int num) { a.insert(lower_bound(a.begin(), a.end(), num), num); }
    double findMedian() {
        int n = a.size();
        return n % 2 ? a[n / 2] : (a[n / 2 - 1] + (double)a[n / 2]) / 2;
    }
};`,
        java: `class MedianFinder {
    private final List<Integer> a = new ArrayList<>();

    public void addNum(int num) {
        int lo = 0, hi = a.size();
        while (lo < hi) { int mid = (lo + hi) >>> 1; if (a.get(mid) < num) lo = mid + 1; else hi = mid; }
        a.add(lo, num);
    }

    public double findMedian() {
        int n = a.size();
        return n % 2 == 1 ? a.get(n / 2) : (a.get(n / 2 - 1) + (double) a.get(n / 2)) / 2;
    }
}`,
        javascript: `class MedianFinder {
  constructor() { this.a = []; }
  addNum(num) {
    let lo = 0, hi = this.a.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.a[mid] < num) lo = mid + 1; else hi = mid; }
    this.a.splice(lo, 0, num);
  }
  findMedian() {
    const a = this.a, n = a.length;
    return n % 2 ? a[n >> 1] : (a[n / 2 - 1] + a[n / 2]) / 2;
  }
}`,
      },
    },
    {
      name: '兩個堆(左最大堆、右最小堆)',
      idea: '`addNum`:先放進左邊(最大堆),把左邊最大的移到右邊;右邊比較多就把右邊最小的移回左邊。`findMedian`:看兩個堆頂。',
      steps: ['addNum:`push(lo, num)`;`push(hi, pop(lo))`', '`len(hi) > len(lo)` → `push(lo, pop(hi))`', 'findMedian:左邊多一個 → `lo` 頂端;一樣多 → 兩個頂端的平均'],
      figure: { title: `依序加入 ${STREAM.join('、')}`, steps: heapFig() },
      complexity: { time: 'addNum O(log n),findMedian O(1)', space: 'O(n)', why: '每次加入最多做三次堆操作。' },
      verdict: '標準解,[[p:two-heaps]]的代表題。「先放左邊再丟一個去右邊」保證左邊全部 ≤ 右邊,不用另外比大小。',
      code: {
        python: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []                          # 左半:最大堆(存負數)
        self.hi = []                          # 右半:最小堆

    def addNum(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))   # 左邊最大的丟到右邊
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))  # 保持左邊 ≥ 右邊

    def findMedian(self):
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (-self.lo[0] + self.hi[0]) / 2`,
        c: `// 兩個二元堆:sign = 1 是最小堆,sign = -1 是最大堆(比較時乘上 sign)
typedef struct { int *a; int n, cap, sign; } Heap;

static void hpush(Heap *h, int x) {
    if (h->n == h->cap) { h->cap *= 2; h->a = realloc(h->a, h->cap * sizeof(int)); }
    int i = h->n++;
    h->a[i] = x;
    while (i && h->sign * h->a[(i - 1) / 2] > h->sign * h->a[i]) {
        int p = (i - 1) / 2, t = h->a[p]; h->a[p] = h->a[i]; h->a[i] = t; i = p;
    }
}

static int hpop(Heap *h) {
    int top = h->a[0], i = 0;
    h->a[0] = h->a[--h->n];
    while (1) {
        int s = i, l = 2 * i + 1, r = l + 1;
        if (l < h->n && h->sign * h->a[l] < h->sign * h->a[s]) s = l;
        if (r < h->n && h->sign * h->a[r] < h->sign * h->a[s]) s = r;
        if (s == i) break;
        int t = h->a[s]; h->a[s] = h->a[i]; h->a[i] = t; i = s;
    }
    return top;
}

typedef struct { Heap lo, hi; } MedianFinder;

MedianFinder *medianFinderCreate(void) {
    MedianFinder *mf = malloc(sizeof(MedianFinder));
    mf->lo = (Heap){malloc(16 * sizeof(int)), 0, 16, -1};
    mf->hi = (Heap){malloc(16 * sizeof(int)), 0, 16, 1};
    return mf;
}

void medianFinderAddNum(MedianFinder *mf, int num) {
    hpush(&mf->lo, num);
    hpush(&mf->hi, hpop(&mf->lo));
    if (mf->hi.n > mf->lo.n) hpush(&mf->lo, hpop(&mf->hi));
}

double medianFinderFindMedian(MedianFinder *mf) {
    if (mf->lo.n > mf->hi.n) return mf->lo.a[0];
    return (mf->lo.a[0] + (double)mf->hi.a[0]) / 2;
}

void medianFinderFree(MedianFinder *mf) { free(mf->lo.a); free(mf->hi.a); free(mf); }`,
        cpp: `class MedianFinder {
    priority_queue<int> lo;                                 // 最大堆
    priority_queue<int, vector<int>, greater<int>> hi;      // 最小堆
public:
    void addNum(int num) {
        lo.push(num);
        hi.push(lo.top()); lo.pop();
        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }
    }
    double findMedian() {
        if (lo.size() > hi.size()) return lo.top();
        return (lo.top() + (double)hi.top()) / 2;
    }
};`,
        java: `class MedianFinder {
    private final PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> hi = new PriorityQueue<>();

    public void addNum(int num) {
        lo.add(num);
        hi.add(lo.poll());
        if (hi.size() > lo.size()) lo.add(hi.poll());
    }

    public double findMedian() {
        if (lo.size() > hi.size()) return lo.peek();
        return (lo.peek() + (double) hi.peek()) / 2;
    }
}`,
        javascript: `class Heap {
  constructor(less) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  top() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    for (let i = a.length - 1, p; i && this.less(a[i], a[(p = (i - 1) >> 1)]); i = p) [a[i], a[p]] = [a[p], a[i]];
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) {
        let s = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < a.length && this.less(a[l], a[s])) s = l;
        if (r < a.length && this.less(a[r], a[s])) s = r;
        if (s === i) break;
        [a[i], a[s]] = [a[s], a[i]];
        i = s;
      }
    }
    return top;
  }
}

class MedianFinder {
  constructor() {
    this.lo = new Heap((x, y) => x > y);      // 最大堆
    this.hi = new Heap((x, y) => x < y);      // 最小堆
  }
  addNum(num) {
    this.lo.push(num);
    this.hi.push(this.lo.pop());
    if (this.hi.size > this.lo.size) this.lo.push(this.hi.pop());
  }
  findMedian() {
    if (this.lo.size > this.hi.size) return this.lo.top();
    return (this.lo.top() + this.hi.top()) / 2;
  }
}`,
      },
    },
  ],
  pitfalls: [
    '直接放進比較少的那一邊:不能保證左邊全部 ≤ 右邊(例如先 5 再 1,1 被放到右邊)',
    '偶數時整數除法:Java/C 要轉成 double 再除',
    'Python 只有最小堆:左半要存負數,取出時記得再加負號',
  ],
  followUp: [
    { q: '所有數都在 0..100?', a: '用長度 101 的計數陣列,findMedian 從左邊累加到一半 → O(100)。' },
    { q: '99% 的數在 0..100?', a: '計數陣列 + 兩個計數器記錄「小於 0」「大於 100」的個數;中位數幾乎一定落在計數陣列裡。' },
  ],
  check: {
    kind: 'class',
    cls: 'MedianFinder',
    compare: 'close',
    cases: [
      { ops: ['MedianFinder', 'addNum', 'addNum', 'findMedian', 'addNum', 'findMedian'], args: [[], [1], [2], [], [3], []], out: [null, null, null, 1.5, null, 2.0] },
      {
        ops: ['MedianFinder', ...STREAM.flatMap(() => ['addNum', 'findMedian'])],
        args: [[], ...STREAM.flatMap((x) => [[x], []])],
        out: [null, null, 5.0, null, 10.0, null, 5.0, null, 4.0, null, 5.0],
      },
      { ops: ['MedianFinder', 'addNum', 'findMedian', 'addNum', 'findMedian'], args: [[], [-1], [], [-2], []], out: [null, null, -1.0, null, -1.5] },
    ],
  },
}
