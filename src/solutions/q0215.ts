import { arr, range, treeLayout } from '../engine/helpers'
import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'

// 215. Kth Largest Element in an Array

const A = [3, 2, 1, 5, 6, 4]
const K = 2

function sortFig(): FigStep[] {
  const s = [...A].sort((a, b) => b - a)
  return [
    { note: '最直接:由大到小排序,第 k 個就是答案', views: [arr(A, { label: 'nums' })] },
    { note: `排序後第 ${K} 個是 ${s[K - 1]}`, views: [arr(s, { label: '由大到小', highlight: [K - 1] })] },
  ]
}

function heapView(h: number[]): GraphViewData {
  const { nodes, edges } = treeLayout(h)
  return { kind: 'graph', label: `min-heap(最多 ${K} 個,堆頂 = 目前第 ${K} 大)`, nodes: nodes.map((n, i) => ({ ...n, cls: i === 0 ? 'hl' : undefined })), edges }
}

function heapFig(): FigStep[] {
  const h: number[] = []
  const out: FigStep[] = [{ note: `只保留最大的 ${K} 個,放在最小堆裡;堆頂就是第 ${K} 大(同 703 題)`, views: [heapView([])] }]
  A.forEach((x, i) => {
    h.push(x)
    h.sort((a, b) => a - b)
    const over = h.length > K
    if (over) h.shift()
    out.push({ note: `放入 ${x}${over ? `,超過 ${K} 個 → 踢掉最小的` : ''}`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), heapView([...h])] })
  })
  out.push({ note: `走完了,堆頂 ${h[0]} 就是答案`, views: [heapView([...h])] })
  return out
}

function quickFig(): FigStep[] {
  const a = [...A]
  const target = a.length - K // 由小到大排好後,答案在這個位置
  const out: FigStep[] = [{ note: `第 ${K} 大 = 由小到大排好後的第 ${target} 格。不用整個排好:partition 一次,基準就會落在「它排好後該在的位置」。剛好是 ${target} 就完成,否則只處理有答案的那一半`, views: [arr(a, { label: 'nums', highlight: [target] })] }]
  let lo = 0
  let hi = a.length - 1
  while (lo <= hi) {
    const pv = a[hi]
    let w = lo
    for (let i = lo; i < hi; i++) if (a[i] < pv) { [a[w], a[i]] = [a[i], a[w]]; w++ }
    ;[a[w], a[hi]] = [a[hi], a[w]]
    out.push({ note: `在 [${lo}, ${hi}] 以 ${pv} 當基準:比它小的放左邊,它落在位置 ${w}。${w === target ? `剛好是 ${target} → 答案 ${a[w]}` : w < target ? `${w} < ${target} → 答案在右半` : `${w} > ${target} → 答案在左半`}`, views: [arr(a, { label: 'nums', range: [lo, hi], highlight: [w], compare: w === target ? [] : [target] })] })
    if (w === target) break
    if (w < target) lo = w + 1
    else hi = w - 1
  }
  return out
}

export const q0215: Solution = {
  id: 215,
  plain: '在一堆數字裡,找出「第 k 大」的那個(重複的數字也算位置)。像考試成績找第 2 名的分數。',
  statement: '給整數陣列 `nums` 和 `k`,回傳陣列中第 `k` 大的元素(是排序後的第 k 大,不是第 k 個「不同」的值)。能不能不排序?',
  examples: [
    { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
    { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4', note: '由大到小是 6,5,5,4… 重複的 5 算兩個' },
  ],
  constraints: ['`1 ≤ k ≤ n ≤ 10⁵`', '題目希望你不要直接排序'],
  insight: [
    '排序取第 k 個:O(n log n),最簡單',
    '只需要「前 k 大」:大小 k 的最小堆,O(n log k)([703](#/q/703) 的同一招)',
    '連前 k 大的順序都不需要,只要第 k 大那一個:**快速選擇**。快速排序的 partition 會把基準放到它最終的位置;如果那個位置剛好是答案就停,否則只往有答案的一邊繼續 —— 平均 O(n)',
  ],
  approaches: [
    {
      name: '排序',
      idea: '排序後取第 k 大(由小到大的第 n − k 個)。',
      steps: ['`nums.sort()`', '回傳 `nums[n − k]`'],
      figure: { title: `nums = [${A.join(',')}], k = ${K}`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(log n) ~ O(n)', why: '排序。' },
      verdict: '一行搞定,實務上通常就這樣寫。',
      code: {
        python: `def findKthLargest(nums, k):
    return sorted(nums)[-k]`,
        c: `static int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int findKthLargest(int *nums, int numsSize, int k) {
    qsort(nums, numsSize, sizeof(int), cmpInt);
    return nums[numsSize - k];
}`,
        cpp: `int findKthLargest(vector<int>& nums, int k) {
    sort(nums.begin(), nums.end());
    return nums[nums.size() - k];
}`,
        java: `int findKthLargest(int[] nums, int k) {
    Arrays.sort(nums);
    return nums[nums.length - k];
}`,
        javascript: `function findKthLargest(nums, k) {
  return [...nums].sort((a, b) => a - b)[nums.length - k];
}`,
      },
    },
    {
      name: '大小為 k 的最小堆',
      idea: '每個數放進最小堆,超過 k 個就踢掉最小的。最後堆頂就是第 k 大。',
      steps: ['對每個 `x`:`push(x)`', '大小 > k → `pop()`', '回傳堆頂'],
      figure: { title: `nums = [${A.join(',')}], k = ${K}`, steps: heapFig() },
      complexity: { time: 'O(n log k)', space: 'O(k)', why: '每個數進出堆一次,堆最多 k + 1 個。' },
      verdict: 'k 比 n 小很多時比排序快;資料是串流也能用。',
      code: {
        python: `import heapq

def findKthLargest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)              # 踢掉最小的
    return h[0]`,
        c: `static int h[100001], hs;

static void up(int i) {
    while (i > 0 && h[(i - 1) / 2] > h[i]) { int p = (i - 1) / 2, t = h[p]; h[p] = h[i]; h[i] = t; i = p; }
}
static void down(int i) {
    for (;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < hs && h[l] < h[m]) m = l;
        if (r < hs && h[r] < h[m]) m = r;
        if (m == i) return;
        int t = h[m]; h[m] = h[i]; h[i] = t; i = m;
    }
}

int findKthLargest(int *nums, int numsSize, int k) {
    hs = 0;
    for (int i = 0; i < numsSize; i++) {
        h[hs] = nums[i]; up(hs++);
        if (hs > k) { h[0] = h[--hs]; down(0); }
    }
    return h[0];
}`,
        cpp: `int findKthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> pq;   // 最小堆
    for (int x : nums) {
        pq.push(x);
        if ((int)pq.size() > k) pq.pop();
    }
    return pq.top();
}`,
        java: `int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> pq = new PriorityQueue<>();
    for (int x : nums) {
        pq.offer(x);
        if (pq.size() > k) pq.poll();
    }
    return pq.peek();
}`,
        javascript: `function findKthLargest(nums, k) {
  const h = [];                         // 手寫最小堆
  for (const x of nums) {
    h.push(x);
    for (let i = h.length - 1; i > 0 && h[(i - 1) >> 1] > h[i]; i = (i - 1) >> 1)
      [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
    if (h.length > k) {
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
  }
  return h[0];
}`,
      },
    },
    {
      name: '快速選擇(三向切分,隨機基準)',
      idea: '隨機選一個基準 p,把數分成「比 p 大」「等於 p」「比 p 小」三堆。第 k 大落在哪一堆,就只往那一堆找。',
      steps: ['隨機選基準 `p`', '`big = [> p]`、`eq = [== p]`、`small = [< p]`', '`k ≤ len(big)` → 在 big 裡找第 k 大', '`k ≤ len(big) + len(eq)` → 答案就是 `p`', '否則在 small 裡找第 `k − len(big) − len(eq)` 大'],
      figure: { title: `nums = [${A.join(',')}], k = ${K}(圖示用的是原地 partition)`, steps: quickFig() },
      complexity: { time: '平均 O(n),最壞 O(n²)', space: 'O(n)', why: '每一輪平均只留下一半:n + n/2 + n/4 + … ≈ 2n。隨機基準讓最壞情況幾乎不會發生;三向切分讓大量重複值時也不會退化。' },
      verdict: '理論最佳的平均解。很多重複值時(例如全部一樣)原地兩向 partition 會退化成 O(n²),三向切分可以避免;C++ 可以直接用 `nth_element`。',
      code: {
        python: `import random

def findKthLargest(nums, k):
    while True:
        p = random.choice(nums)
        big = [x for x in nums if x > p]
        eq = [x for x in nums if x == p]
        if k <= len(big):
            nums = big                    # 答案在比 p 大的那堆
        elif k <= len(big) + len(eq):
            return p
        else:
            k -= len(big) + len(eq)
            nums = [x for x in nums if x < p]`,
        c: `int findKthLargest(int *nums, int numsSize, int k) {
    // 原地三向切分:[lo, lt) > p、[lt, gt] == p、(gt, hi] < p
    int lo = 0, hi = numsSize - 1;
    for (;;) {
        int p = nums[lo + rand() % (hi - lo + 1)];
        int lt = lo, i = lo, gt = hi;
        while (i <= gt) {
            if (nums[i] > p) { int t = nums[lt]; nums[lt++] = nums[i]; nums[i++] = t; }
            else if (nums[i] < p) { int t = nums[gt]; nums[gt--] = nums[i]; nums[i] = t; }
            else i++;
        }
        int big = lt - lo, eq = gt - lt + 1;
        if (k <= big) hi = lt - 1;
        else if (k <= big + eq) return p;
        else { k -= big + eq; lo = gt + 1; }
    }
}`,
        cpp: `int findKthLargest(vector<int>& nums, int k) {
    // nth_element:讓第 k 大的數放到它排好後該在的位置(平均 O(n))
    nth_element(nums.begin(), nums.begin() + k - 1, nums.end(), greater<int>());
    return nums[k - 1];
}`,
        java: `int findKthLargest(int[] nums, int k) {
    Random rnd = new Random();
    int lo = 0, hi = nums.length - 1;
    for (;;) {
        int p = nums[lo + rnd.nextInt(hi - lo + 1)];
        int lt = lo, i = lo, gt = hi;                 // [lo, lt) > p、[lt, gt] == p、(gt, hi] < p
        while (i <= gt) {
            if (nums[i] > p) swap(nums, lt++, i++);
            else if (nums[i] < p) swap(nums, i, gt--);
            else i++;
        }
        int big = lt - lo, eq = gt - lt + 1;
        if (k <= big) hi = lt - 1;
        else if (k <= big + eq) return p;
        else { k -= big + eq; lo = gt + 1; }
    }
}

private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }`,
        javascript: `function findKthLargest(nums, k) {
  let a = nums;
  for (;;) {
    const p = a[Math.floor(Math.random() * a.length)];
    const big = a.filter((x) => x > p);
    const eq = a.filter((x) => x === p).length;
    if (k <= big.length) a = big;
    else if (k <= big.length + eq) return p;
    else {
      k -= big.length + eq;
      a = a.filter((x) => x < p);
    }
  }
}`,
      },
    },
  ],
  pitfalls: [
    '第 k 大是「排序後的第 k 個」,重複的值要算進去:`[5,5,4]` 的第 2 大是 5,不是 4',
    '排序後取 `nums[k − 1]`:那是第 k **小**',
    'Quickselect 每次都用最右邊當基準:已經排好或全部相同的輸入會退化成 O(n²),LeetCode 有專門卡這個的測資',
  ],
  followUp: [{ q: '最壞情況也要 O(n)?', a: 'Median of Medians(BFPRT):保證基準夠好,最壞 O(n),但常數很大,實務上很少用。' }],
  check: {
    kind: 'fn',
    fn: 'findKthLargest',
    cases: [
      { args: [A, K], out: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], out: 4 },
      { args: [[1], 1], out: 1 },
      { args: [[2, 2, 2, 2], 3], out: 2 },
      { args: [[-1, -1, 0], 3], out: -1 },
      { args: [[7, 6, 5, 4, 3, 2, 1], 7], out: 1 },
    ],
  },
}
