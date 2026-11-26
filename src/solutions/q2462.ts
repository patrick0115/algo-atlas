import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2462. Total Cost to Hire K Workers

const COSTS = [17, 12, 10, 2, 7, 2, 11, 20, 8]

// 雙最小堆:example costs = [17,12,10,2,7,2,11,20,8], k = 3, candidates = 4
function twoHeapFig(): FigStep[] {
  return [
    { note: '左堆放前 4 人(索引 0–3),右堆放後 4 人(索引 5–8),兩個指標停在中間 i = j = 4', line: 41, views: [arr(COSTS, { label: 'costs', highlight: [0, 1, 2, 3], compare: [5, 6, 7, 8] })] },
    { note: '兩堆最便宜的都是 2;同價取索引小的 → 雇左堆索引 3 的 2,總花費 = 2,再從左側補 costs[4] = 7 進左堆', line: 45, views: [arr(COSTS, { label: 'costs', done: [3], highlight: [4] })] },
    { note: '現在左堆頂 7、右堆頂 2 → 雇右堆的 2,總花費 = 4。兩指標已交會,不再補人', line: 48, views: [arr(COSTS, { label: 'costs', done: [3, 5] })] },
    { note: '剩下左堆頂 7、右堆頂 8 → 雇 7,總花費 = 11。已雇滿 k = 3 人', line: 45, views: [arr(COSTS, { label: 'costs', done: [3, 5, 4] })] },
  ]
}

// 單一最小堆:同範例
function oneHeapFig(): FigStep[] {
  return [
    { note: '一個堆同時裝前 4 與後 4,每筆存 (成本, 索引);比較先看成本、同價看索引', line: 41, views: [arr(COSTS, { label: 'costs', highlight: [0, 1, 2, 3], compare: [5, 6, 7, 8] })] },
    { note: '彈出最小 (2, 索引 3) → 它來自左段(索引 3 < 左指標)→ 從左側補一人,總花費 = 2', line: 49, views: [arr(COSTS, { label: 'costs', done: [3], highlight: [4] })] },
    { note: '再彈出 (2, 索引 5),總花費 = 4;最後彈出 (7, 索引 4),總花費 = 11', line: 46, views: [arr(COSTS, { label: 'costs', done: [3, 5, 4] })] },
  ]
}

export const q2462: Solution = {
  id: 2462,
  plain: '要雇 k 個工人。每回合只能從「隊伍最前 candidates 人」和「最後 candidates 人」裡挑最便宜的雇用(一樣便宜挑排前面的),被雇走後隊伍補位。問總共花多少錢。',
  statement: '給工資陣列 `costs`,整數 `k` 與 `candidates`。進行 k 回合,每回合從「前 candidates 人」與「後 candidates 人」組成的候選中,雇最便宜的(同價取索引小);雇走後該側往中間補一人。回傳總花費。',
  examples: [
    { input: 'costs = [17,12,10,2,7,2,11,20,8], k = 3, candidates = 4', output: '11', note: '依序雇 2(索引 3)、2(索引 5)、7(索引 4)' },
    { input: 'costs = [1,2,4,1], k = 3, candidates = 3', output: '4', note: '前後候選覆蓋整排,等於挑最小的 3 個:1 + 1 + 2' },
  ],
  constraints: [
    '`1 ≤ k ≤ costs.length`',
    '`1 ≤ candidates ≤ costs.length`,`2 * candidates` 可能 ≥ n → 前後段會重疊,要小心不重複雇同一人',
    '總花費最大約 `k × max(cost)` ≈ 10⁵ × 10⁵ = 10¹⁰ → C / C++ / Java 回傳要用 64 位元(`long long` / `long`)',
  ],
  insight: [
    '每回合只關心兩段的「最小值」→ 用最小堆((min-)[[p:heap]])隨時拿到堆頂,不必整段重排',
    '兩段各一個指標從兩端往中間走;雇走一人就從對應那側補下一個進堆',
    '關鍵是前後兩段不能重疊雇到同一人:只在「左指標 ≤ 右指標」時才補人',
  ],
  approaches: [
    {
      name: '雙最小堆 + 雙指標',
      idea: '左堆裝前段、右堆裝後段,各一個指標。每回合比兩堆頂取較小的,從那一側的指標再補一人進堆;兩指標交會後就不再補。',
      steps: [
        '左指標 i = 0、右指標 j = n − 1',
        '先把前 candidates 個丟進左堆、後 candidates 個丟進右堆(用 `i ≤ j` 防重疊)',
        '重複 k 次:比兩堆頂(右堆空或左 ≤ 右就取左,否則取右)',
        '把取到的值加進總花費',
        '若 `i ≤ j`,從被取那一側補一人進該堆',
      ],
      figure: { title: 'costs = [17,12,10,2,7,2,11,20,8], k = 3, candidates = 4', steps: twoHeapFig() },
      complexity: { time: 'O((candidates + k) log candidates)', space: 'O(candidates)', why: '兩堆大小各 ≤ candidates;共約 candidates + k 次堆操作。' },
      verdict: '最標準的 [[p:two-heaps]] 寫法,前後段各自獨立。JS 沒有內建堆,要自己實作最小堆。',
      code: {
        python: `import heapq

def totalCost(costs, k, candidates):
    n = len(costs)
    left, right = [], []
    i, j = 0, n - 1
    for _ in range(candidates):
        if i <= j:
            heapq.heappush(left, costs[i])
            i += 1
    for _ in range(candidates):
        if i <= j:
            heapq.heappush(right, costs[j])
            j -= 1
    total = 0
    for _ in range(k):
        if not right or (left and left[0] <= right[0]):
            total += heapq.heappop(left)
            if i <= j:
                heapq.heappush(left, costs[i])
                i += 1
        else:
            total += heapq.heappop(right)
            if i <= j:
                heapq.heappush(right, costs[j])
                j -= 1
    return total`,
        c: `#include <stdlib.h>

static void hpush(int *h, int *sz, int x) {
    int i = (*sz)++;
    h[i] = x;
    while (i > 0) {
        int p = (i - 1) / 2;
        if (h[p] <= h[i]) break;
        int t = h[p]; h[p] = h[i]; h[i] = t;
        i = p;
    }
}

static int hpop(int *h, int *sz) {
    int top = h[0];
    h[0] = h[--(*sz)];
    int i = 0;
    for (;;) {
        int s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < *sz && h[l] < h[s]) s = l;
        if (r < *sz && h[r] < h[s]) s = r;
        if (s == i) break;
        int t = h[s]; h[s] = h[i]; h[i] = t;
        i = s;
    }
    return top;
}

long long totalCost(int* costs, int costsSize, int k, int candidates) {
    int n = costsSize, i = 0, j = n - 1, ls = 0, rs = 0;
    int *left = malloc((n + 1) * sizeof(int)), *right = malloc((n + 1) * sizeof(int));
    for (int c = 0; c < candidates && i <= j; c++) hpush(left, &ls, costs[i++]);
    for (int c = 0; c < candidates && i <= j; c++) hpush(right, &rs, costs[j--]);
    long long total = 0;
    for (int h = 0; h < k; h++) {
        if (rs == 0 || (ls > 0 && left[0] <= right[0])) {
            total += hpop(left, &ls);
            if (i <= j) hpush(left, &ls, costs[i++]);
        } else {
            total += hpop(right, &rs);
            if (i <= j) hpush(right, &rs, costs[j--]);
        }
    }
    free(left); free(right);
    return total;
}`,
        cpp: `long long totalCost(vector<int>& costs, int k, int candidates) {
    int n = costs.size(), i = 0, j = n - 1;
    priority_queue<int, vector<int>, greater<int>> left, right;
    for (int c = 0; c < candidates && i <= j; c++) left.push(costs[i++]);
    for (int c = 0; c < candidates && i <= j; c++) right.push(costs[j--]);
    long long total = 0;
    for (int h = 0; h < k; h++) {
        if (right.empty() || (!left.empty() && left.top() <= right.top())) {
            total += left.top(); left.pop();
            if (i <= j) left.push(costs[i++]);
        } else {
            total += right.top(); right.pop();
            if (i <= j) right.push(costs[j--]);
        }
    }
    return total;
}`,
        java: `public long totalCost(int[] costs, int k, int candidates) {
    int n = costs.length, i = 0, j = n - 1;
    PriorityQueue<Integer> left = new PriorityQueue<>(), right = new PriorityQueue<>();
    for (int c = 0; c < candidates && i <= j; c++) left.add(costs[i++]);
    for (int c = 0; c < candidates && i <= j; c++) right.add(costs[j--]);
    long total = 0;
    for (int h = 0; h < k; h++) {
        if (right.isEmpty() || (!left.isEmpty() && left.peek() <= right.peek())) {
            total += left.poll();
            if (i <= j) left.add(costs[i++]);
        } else {
            total += right.poll();
            if (i <= j) right.add(costs[j--]);
        }
    }
    return total;
}`,
        javascript: `function totalCost(costs, k, candidates) {
  class MinHeap {
    constructor() { this.a = []; }
    size() { return this.a.length; }
    peek() { return this.a[0]; }
    push(x) {
      const a = this.a;
      a.push(x);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p] <= a[i]) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop() {
      const a = this.a;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          let s = i;
          const l = 2 * i + 1, r = 2 * i + 2;
          if (l < a.length && a[l] < a[s]) s = l;
          if (r < a.length && a[r] < a[s]) s = r;
          if (s === i) break;
          [a[s], a[i]] = [a[i], a[s]];
          i = s;
        }
      }
      return top;
    }
  }
  const n = costs.length;
  const left = new MinHeap(), right = new MinHeap();
  let i = 0, j = n - 1;
  for (let c = 0; c < candidates && i <= j; c++) left.push(costs[i++]);
  for (let c = 0; c < candidates && i <= j; c++) right.push(costs[j--]);
  let total = 0;
  for (let h = 0; h < k; h++) {
    if (right.size() === 0 || (left.size() > 0 && left.peek() <= right.peek())) {
      total += left.pop();
      if (i <= j) left.push(costs[i++]);
    } else {
      total += right.pop();
      if (i <= j) right.push(costs[j--]);
    }
  }
  return total;
}`,
      },
    },
    {
      name: '單一最小堆(存索引)',
      idea: '只用一個堆,每筆存 `(成本, 索引)`,先裝前 candidates 與後 candidates。每回合彈出最小的;看它的索引落在左側(< 左指標)還是右側,從對應那側補一人,靠索引判斷不會重複。',
      steps: [
        '左指標 left = 0、右指標 right = n − 1',
        'candidates 次:若 `left ≤ right` 推 `(costs[left], left)` 並 left++,再若 `left ≤ right` 推 `(costs[right], right)` 並 right--',
        '重複 k 次:彈出堆頂 `(cost, idx)`,加進總花費',
        '若 `left ≤ right`:`idx < left` 就補左側一人,否則補右側一人',
      ],
      figure: { title: 'costs = [17,12,10,2,7,2,11,20,8], k = 3, candidates = 4', steps: oneHeapFig() },
      complexity: { time: 'O((candidates + k) log candidates)', space: 'O(candidates)', why: '堆大小 ≤ 2 × candidates;操作次數同雙堆。' },
      verdict: '只維護一個 [[p:heap]],靠索引判斷補哪一側,少一個堆、程式短一些。若 `2 × candidates ≥ n`,前後段已覆蓋全部,也可直接排序取前 k 小當特例。',
      code: {
        python: `import heapq

def totalCost(costs, k, candidates):
    n = len(costs)
    heap = []
    left, right = 0, n - 1
    for _ in range(candidates):
        if left <= right:
            heapq.heappush(heap, (costs[left], left))
            left += 1
        if left <= right:
            heapq.heappush(heap, (costs[right], right))
            right -= 1
    total = 0
    for _ in range(k):
        cost, idx = heapq.heappop(heap)
        total += cost
        if left <= right:
            if idx < left:
                heapq.heappush(heap, (costs[left], left))
                left += 1
            else:
                heapq.heappush(heap, (costs[right], right))
                right -= 1
    return total`,
        c: `#include <stdlib.h>

typedef struct { int cost, idx; } Pair;

static int less(Pair a, Pair b) {
    return a.cost != b.cost ? a.cost < b.cost : a.idx < b.idx;
}

static void hpush(Pair *h, int *sz, Pair x) {
    int i = (*sz)++;
    h[i] = x;
    while (i > 0) {
        int p = (i - 1) / 2;
        if (!less(h[i], h[p])) break;
        Pair t = h[p]; h[p] = h[i]; h[i] = t;
        i = p;
    }
}

static Pair hpop(Pair *h, int *sz) {
    Pair top = h[0];
    h[0] = h[--(*sz)];
    int i = 0;
    for (;;) {
        int s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < *sz && less(h[l], h[s])) s = l;
        if (r < *sz && less(h[r], h[s])) s = r;
        if (s == i) break;
        Pair t = h[s]; h[s] = h[i]; h[i] = t;
        i = s;
    }
    return top;
}

long long totalCost(int* costs, int costsSize, int k, int candidates) {
    int n = costsSize, left = 0, right = n - 1, sz = 0;
    Pair *heap = malloc((n + 1) * sizeof(Pair));
    for (int c = 0; c < candidates; c++) {
        if (left <= right) { Pair p = {costs[left], left}; hpush(heap, &sz, p); left++; }
        if (left <= right) { Pair p = {costs[right], right}; hpush(heap, &sz, p); right--; }
    }
    long long total = 0;
    for (int h = 0; h < k; h++) {
        Pair p = hpop(heap, &sz);
        total += p.cost;
        if (left <= right) {
            if (p.idx < left) { Pair q = {costs[left], left}; hpush(heap, &sz, q); left++; }
            else { Pair q = {costs[right], right}; hpush(heap, &sz, q); right--; }
        }
    }
    free(heap);
    return total;
}`,
        cpp: `long long totalCost(vector<int>& costs, int k, int candidates) {
    int n = costs.size(), left = 0, right = n - 1;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> heap;
    for (int c = 0; c < candidates; c++) {
        if (left <= right) { heap.push({costs[left], left}); left++; }
        if (left <= right) { heap.push({costs[right], right}); right--; }
    }
    long long total = 0;
    for (int h = 0; h < k; h++) {
        auto [cost, idx] = heap.top(); heap.pop();
        total += cost;
        if (left <= right) {
            if (idx < left) { heap.push({costs[left], left}); left++; }
            else { heap.push({costs[right], right}); right--; }
        }
    }
    return total;
}`,
        java: `public long totalCost(int[] costs, int k, int candidates) {
    int n = costs.length, left = 0, right = n - 1;
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) ->
        a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    for (int c = 0; c < candidates; c++) {
        if (left <= right) heap.add(new int[]{costs[left], left++});
        if (left <= right) heap.add(new int[]{costs[right], right--});
    }
    long total = 0;
    for (int h = 0; h < k; h++) {
        int[] top = heap.poll();
        total += top[0];
        if (left <= right) {
            if (top[1] < left) heap.add(new int[]{costs[left], left++});
            else heap.add(new int[]{costs[right], right--});
        }
    }
    return total;
}`,
        javascript: `function totalCost(costs, k, candidates) {
  class MinHeap {
    constructor() { this.a = []; }
    less(x, y) { return x[0] !== y[0] ? x[0] < y[0] : x[1] < y[1]; }
    push(x) {
      const a = this.a;
      a.push(x);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (!this.less(a[i], a[p])) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop() {
      const a = this.a;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          let s = i;
          const l = 2 * i + 1, r = 2 * i + 2;
          if (l < a.length && this.less(a[l], a[s])) s = l;
          if (r < a.length && this.less(a[r], a[s])) s = r;
          if (s === i) break;
          [a[s], a[i]] = [a[i], a[s]];
          i = s;
        }
      }
      return top;
    }
  }
  const n = costs.length;
  const heap = new MinHeap();
  let left = 0, right = n - 1;
  for (let c = 0; c < candidates; c++) {
    if (left <= right) heap.push([costs[left], left++]);
    if (left <= right) heap.push([costs[right], right--]);
  }
  let total = 0;
  for (let h = 0; h < k; h++) {
    const [cost, idx] = heap.pop();
    total += cost;
    if (left <= right) {
      if (idx < left) heap.push([costs[left], left++]);
      else heap.push([costs[right], right--]);
    }
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: [
    '前後段重疊:初始化與補人都要檢查「左指標 ≤ 右指標」,否則同一人會被雇兩次',
    '同價取索引小:雙堆版比較堆頂用 `左 ≤ 右`(左段索引較小,平手讓左段優先);單堆版把索引放進比較鍵',
    '補人條件是「兩指標還沒交會」,不是「堆還沒空」—— 交會後只能把堆裡剩的雇完',
    '回傳總花費用 64 位元:k 與 cost 都可到 10⁵,相乘約 10¹⁰ 會爆 32 位元整數',
  ],
  check: {
    kind: 'fn',
    fn: 'totalCost',
    cases: [
      { args: [[17, 12, 10, 2, 7, 2, 11, 20, 8], 3, 4], out: 11 },
      { args: [[1, 2, 4, 1], 3, 3], out: 4 },
      { args: [[10, 20, 5], 1, 1], out: 5 },
      { args: [[3, 1, 2], 2, 3], out: 3 },
    ],
  },
}
