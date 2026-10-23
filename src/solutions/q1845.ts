import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1845. Seat Reservation Manager

function heapFig(): FigStep[] {
  return [
    { note: '座位 1..n。reserve 要拿「編號最小的空位」→ 最小堆積。一開始把 1..n 全放進去(已經排好就是合法的堆積)', views: [arr([1, 2, 3, 4, 5], { label: '最小堆積(空位)' })] },
    { note: 'reserve() → 1、reserve() → 2。unreserve(2):2 又變空位,放回堆積', views: [arr([2, 3, 4, 5], { label: '最小堆積', highlight: [0] })] },
    { note: 'reserve() → 2(最小的空位)。每次 O(log n)', views: [arr([3, 4, 5], { label: '最小堆積' })] },
  ]
}

function lazyFig(): FigStep[] {
  return [
    { note: '省空間的版本:用一個指標 next 表示「從 next 開始的座位都還沒被訂過」,堆積只放「被退回」的座位', views: [arr(['next = 1'], { label: '指標' }), arr([], { label: '退回的座位(最小堆積)' })] },
    { note: 'reserve:堆積不空就拿堆頂(退回的一定比 next 小),否則拿 next 再加 1。一開始不用放 n 個數進去', views: [arr(['next = 3'], { label: '指標' }), arr([2], { label: '退回的座位', highlight: [0] })] },
  ]
}

export const q1845: Solution = {
  id: 1845,
  plain: '管理一排編號 1 到 n 的座位:訂位時一律給「編號最小的空位」,有人退訂就把那個座位還回去。',
  statement: '設計 `SeatManager(n)`:座位 1..n 一開始都是空的;`reserve()` 預訂編號最小的空位並回傳其編號;`unreserve(seatNumber)` 取消該座位的預訂。',
  examples: [
    { input: '["SeatManager","reserve","reserve","unreserve","reserve","reserve","reserve","reserve","unreserve"]\n[[5],[],[],[2],[],[],[],[],[5]]', output: '[null,1,2,null,2,3,4,5,null]' },
  ],
  constraints: ['n ≤ 10⁵,最多 10⁵ 次呼叫', '呼叫保證合法(reserve 時一定有空位)'],
  insight: ['「隨時拿最小的」→ 最小堆積', '一開始 n 個座位全空:可以全部放進堆積,或用一個指標表示「後面都還沒用過」', '指標版:只有被退回的座位才需要進堆積'],
  approaches: [
    {
      name: '最小堆積放全部空位',
      idea: '建構時堆積 = [1..n];reserve 彈出堆頂;unreserve 推回去。',
      steps: ['建構:`h = list(range(1, n + 1))`(遞增陣列本身就是合法的最小堆積)', 'reserve:`heappop(h)`', 'unreserve(s):`heappush(h, s)`'],
      figure: { title: 'n = 5', steps: heapFig() },
      complexity: { time: '建構 O(n),每次操作 O(log n)', space: 'O(n)', why: '堆積放 n 個數。' },
      verdict: '最直接,[[p:heap]]的入門設計題。',
      code: {
        python: `import heapq

class SeatManager:
    def __init__(self, n):
        self.h = list(range(1, n + 1))        # 遞增的陣列就是合法的最小堆積

    def reserve(self):
        return heapq.heappop(self.h)

    def unreserve(self, seatNumber):
        heapq.heappush(self.h, seatNumber)`,
        c: `typedef struct { int *h, n; } SeatManager;

static void up(int *h, int i) { while (i && h[(i - 1) / 2] > h[i]) { int t = h[i]; h[i] = h[(i - 1) / 2]; h[(i - 1) / 2] = t; i = (i - 1) / 2; } }
static void down(int *h, int n, int i) {
    for (;;) {
        int s = i, l = 2 * i + 1, r = l + 1;
        if (l < n && h[l] < h[s]) s = l;
        if (r < n && h[r] < h[s]) s = r;
        if (s == i) return;
        int t = h[i]; h[i] = h[s]; h[s] = t;
        i = s;
    }
}

SeatManager *seatManagerCreate(int n) {
    SeatManager *o = malloc(sizeof(SeatManager));
    o->h = malloc((n + 1) * sizeof(int));
    for (int i = 0; i < n; i++) o->h[i] = i + 1;
    o->n = n;
    return o;
}

int seatManagerReserve(SeatManager *o) {
    int x = o->h[0];
    o->h[0] = o->h[--o->n];
    down(o->h, o->n, 0);
    return x;
}

void seatManagerUnreserve(SeatManager *o, int seatNumber) {
    o->h[o->n] = seatNumber;
    up(o->h, o->n++);
}

void seatManagerFree(SeatManager *o) { free(o->h); free(o); }`,
        cpp: `class SeatManager {
    priority_queue<int, vector<int>, greater<int>> pq;
public:
    SeatManager(int n) { for (int i = 1; i <= n; i++) pq.push(i); }
    int reserve() { int x = pq.top(); pq.pop(); return x; }
    void unreserve(int seatNumber) { pq.push(seatNumber); }
};`,
        java: `class SeatManager {
    private final PriorityQueue<Integer> pq = new PriorityQueue<>();

    public SeatManager(int n) { for (int i = 1; i <= n; i++) pq.offer(i); }
    public int reserve() { return pq.poll(); }
    public void unreserve(int seatNumber) { pq.offer(seatNumber); }
}`,
        javascript: `class SeatManager {
  constructor(n) {
    this.h = Array.from({ length: n }, (_, i) => i + 1);
  }

  reserve() {
    const h = this.h, top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ; ) {
        let s = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < h.length && h[l] < h[s]) s = l;
        if (r < h.length && h[r] < h[s]) s = r;
        if (s === i) break;
        [h[i], h[s]] = [h[s], h[i]];
        i = s;
      }
    }
    return top;
  }

  unreserve(seatNumber) {
    const h = this.h;
    h.push(seatNumber);
    for (let i = h.length - 1; i && h[(i - 1) >> 1] > h[i]; i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
  }
}`,
      },
    },
    {
      name: '指標 + 只放退回的座位',
      idea: '`next` = 下一個從沒被訂過的座位;堆積只放退回的。reserve:堆積不空就彈出,否則回傳 next 並加 1。',
      steps: ['建構:`next = 1`、`h = []`', 'reserve:`h` 不空 → `heappop(h)`;否則 `next += 1`,回傳原本的 next', 'unreserve(s):`heappush(h, s)`'],
      figure: { title: 'n = 5', steps: lazyFig() },
      complexity: { time: '建構 O(1),每次操作 O(log k)', space: 'O(k)', why: 'k = 同時被退回的座位數。' },
      verdict: '建構不用花 O(n);退回的座位一定比 next 小,所以先看堆積是對的。',
      code: {
        python: `import heapq

class SeatManager:
    def __init__(self, n):
        self.next, self.h = 1, []

    def reserve(self):
        if self.h:
            return heapq.heappop(self.h)      # 退回的座位一定比 next 小
        self.next += 1
        return self.next - 1

    def unreserve(self, seatNumber):
        heapq.heappush(self.h, seatNumber)`,
        c: `typedef struct { int *h, n, next; } SeatManager;

static void up(int *h, int i) { while (i && h[(i - 1) / 2] > h[i]) { int t = h[i]; h[i] = h[(i - 1) / 2]; h[(i - 1) / 2] = t; i = (i - 1) / 2; } }
static void down(int *h, int n, int i) {
    for (;;) {
        int s = i, l = 2 * i + 1, r = l + 1;
        if (l < n && h[l] < h[s]) s = l;
        if (r < n && h[r] < h[s]) s = r;
        if (s == i) return;
        int t = h[i]; h[i] = h[s]; h[s] = t;
        i = s;
    }
}

SeatManager *seatManagerCreate(int n) {
    SeatManager *o = malloc(sizeof(SeatManager));
    o->h = malloc((n + 1) * sizeof(int));
    o->n = 0; o->next = 1;
    return o;
}

int seatManagerReserve(SeatManager *o) {
    if (o->n == 0) return o->next++;
    int x = o->h[0];
    o->h[0] = o->h[--o->n];
    down(o->h, o->n, 0);
    return x;
}

void seatManagerUnreserve(SeatManager *o, int seatNumber) {
    o->h[o->n] = seatNumber;
    up(o->h, o->n++);
}

void seatManagerFree(SeatManager *o) { free(o->h); free(o); }`,
        cpp: `class SeatManager {
    priority_queue<int, vector<int>, greater<int>> back;
    int next = 1;
public:
    SeatManager(int n) {}
    int reserve() {
        if (back.empty()) return next++;
        int x = back.top(); back.pop();
        return x;
    }
    void unreserve(int seatNumber) { back.push(seatNumber); }
};`,
        java: `class SeatManager {
    private final PriorityQueue<Integer> back = new PriorityQueue<>();
    private int next = 1;

    public SeatManager(int n) {}
    public int reserve() { return back.isEmpty() ? next++ : back.poll(); }
    public void unreserve(int seatNumber) { back.offer(seatNumber); }
}`,
        javascript: `class SeatManager {
  constructor(n) {
    this.next = 1;
    this.h = [];
  }

  reserve() {
    const h = this.h;
    if (!h.length) return this.next++;
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ; ) {
        let s = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < h.length && h[l] < h[s]) s = l;
        if (r < h.length && h[r] < h[s]) s = r;
        if (s === i) break;
        [h[i], h[s]] = [h[s], h[i]];
        i = s;
      }
    }
    return top;
  }

  unreserve(seatNumber) {
    const h = this.h;
    h.push(seatNumber);
    for (let i = h.length - 1; i && h[(i - 1) >> 1] > h[i]; i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
  }
}`,
      },
    },
  ],
  pitfalls: ['用陣列每次掃描找最小的空位:每次 O(n)', '指標版先看 next 再看堆積:退回的座位比 next 小,會拿錯'],
  check: {
    kind: 'class',
    cls: 'SeatManager',
    cases: [
      { ops: ['SeatManager', 'reserve', 'reserve', 'unreserve', 'reserve', 'reserve', 'reserve', 'reserve', 'unreserve'], args: [[5], [], [], [2], [], [], [], [], [5]], out: [null, 1, 2, null, 2, 3, 4, 5, null] },
      { ops: ['SeatManager', 'reserve', 'reserve', 'reserve', 'unreserve', 'unreserve', 'reserve', 'reserve'], args: [[3], [], [], [], [3], [1], [], []], out: [null, 1, 2, 3, null, null, 1, 3] },
    ],
  },
}
