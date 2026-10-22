import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 239. Sliding Window Maximum

const A = [1, 3, -1, -3, 5, 3, 6, 7]
const K = 3

function dequeFig(): FigStep[] {
  const dq: number[] = []
  const res: number[] = []
  const out: FigStep[] = [{ note: '雙端佇列裡放**索引**,對應的值由前往後**遞減**。最前面永遠是目前視窗的最大值', views: [arr(A, { label: 'nums' }), arr([], { label: '佇列(值)' }), arr([], { label: '答案' })] }]
  A.forEach((x, i) => {
    const popped: number[] = []
    while (dq.length && A[dq[dq.length - 1]] <= x) popped.push(A[dq.pop()!])
    dq.push(i)
    let expired: number | null = null
    if (dq[0] <= i - K) expired = A[dq.shift()!]
    if (i >= K - 1) res.push(A[dq[0]])
    const msg = [
      popped.length ? `${popped.join('、')} 比 ${x} 小(或一樣),它們之後永遠不可能是最大值 → 從後面丟掉` : `${x} 放到後面`,
      expired !== null ? `前面的 ${expired} 已經離開視窗 → 從前面丟掉` : '',
      i >= K - 1 ? `視窗 [${i - K + 1}..${i}] 的最大值 = 佇列最前面 ${A[dq[0]]}` : '視窗還沒滿',
    ].filter(Boolean)
    out.push({ note: msg.join(';'), views: [arr(A, { label: 'nums', highlight: range(Math.max(0, i - K + 1), i), dim: range(0, i - K) }), arr(dq.map((j) => A[j]), { label: '佇列(值)', highlight: [0] }), arr([...res], { label: '答案' })] })
  })
  return out
}

function heapFig(): FigStep[] {
  return [
    { note: '最大堆:把 (值, 索引) 放進堆。堆頂就是目前看過的最大值', views: [arr(A, { label: 'nums', highlight: [0, 1, 2] }), arr([3, 1, -1], { label: '堆(大的在前)', highlight: [0] })] },
    { note: '視窗往右移時,不急著刪除離開的元素;只在**堆頂**已經不在視窗裡時才把它彈掉(延遲刪除)', views: [arr(A, { label: 'nums', highlight: [3, 4, 5], dim: [0, 1, 2] }), arr([5, 3, 3, 1, -1, -3], { label: '堆', highlight: [0] })] },
  ]
}

export const q0239: Solution = {
  id: 239,
  plain: '一個長度固定為 k 的「視窗」從陣列左邊滑到右邊,每次往右移一格。每個位置都要回報視窗裡的最大值。',
  statement: '給整數陣列 `nums` 和視窗大小 `k`,視窗從最左邊滑到最右邊,每次移動一格。回傳每個視窗中的最大值。',
  examples: [{ input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' }, { input: 'nums = [1], k = 1', output: '[1]' }],
  constraints: ['`n ≤ 10⁵`,`k ≤ n` → O(n·k) 最壞 10¹⁰,太慢'],
  insight: [
    '暴力:每個視窗都掃 k 個 → O(n·k)',
    '觀察:如果 x 在 y 的**右邊**而且 x ≥ y,那 y 以後永遠不會是最大值(x 比它大,而且比它晚離開視窗)',
    '所以只要保留「可能成為最大值」的候選人:由前往後**遞減**。新元素進來時,把後面比它小的全部踢掉',
    '最前面的就是最大值;它離開視窗時從前面移除 → **單調雙端佇列**,每個元素進出各一次,O(n)',
  ],
  approaches: [
    {
      name: '最大堆 + 延遲刪除',
      idea: '堆裡放 `(−值, 索引)`。每到一個位置先放進去,然後把堆頂中「索引已經在視窗外」的彈掉,堆頂就是答案。',
      steps: ['`push((−nums[i], i))`', '`while heap[0][1] <= i − k`:pop', '`i >= k − 1` → 答案加入 `−heap[0][0]`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: heapFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每個元素進出堆一次;堆裡可能留著還沒刪的舊元素,最多 n 個。' },
      verdict: '容易想到,能過。比單調佇列多一個 log。',
      code: {
        python: `import heapq

def maxSlidingWindow(nums, k):
    heap, res = [], []
    for i, x in enumerate(nums):
        heapq.heappush(heap, (-x, i))
        while heap[0][1] <= i - k:            # 堆頂已經不在視窗裡
            heapq.heappop(heap)
        if i >= k - 1:
            res.append(-heap[0][0])
    return res`,
        c: `// 自己寫最大堆,存索引,比較 nums 的值
static int *NUMS, *H, hn;

static bool above(int a, int b) { return NUMS[a] > NUMS[b]; }

static void hpush(int x) {
    int i = hn++;
    H[i] = x;
    while (i && above(H[i], H[(i - 1) / 2])) { int p = (i - 1) / 2, t = H[p]; H[p] = H[i]; H[i] = t; i = p; }
}

static void hpop(void) {
    H[0] = H[--hn];
    for (int i = 0;;) {
        int s = i, l = 2 * i + 1, r = l + 1;
        if (l < hn && above(H[l], H[s])) s = l;
        if (r < hn && above(H[r], H[s])) s = r;
        if (s == i) break;
        int t = H[s]; H[s] = H[i]; H[i] = t; i = s;
    }
}

int *maxSlidingWindow(int *nums, int numsSize, int k, int *returnSize) {
    NUMS = nums; H = malloc(numsSize * sizeof(int)); hn = 0;
    int *res = malloc(numsSize * sizeof(int)), cnt = 0;
    for (int i = 0; i < numsSize; i++) {
        hpush(i);
        while (H[0] <= i - k) hpop();
        if (i >= k - 1) res[cnt++] = nums[H[0]];
    }
    free(H);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    priority_queue<pair<int, int>> pq;
    vector<int> res;
    for (int i = 0; i < (int)nums.size(); i++) {
        pq.push({nums[i], i});
        while (pq.top().second <= i - k) pq.pop();
        if (i >= k - 1) res.push_back(pq.top().first);
    }
    return res;
}`,
        java: `int[] maxSlidingWindow(int[] nums, int k) {
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] - a[0]);
    int[] res = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        pq.add(new int[]{nums[i], i});
        while (pq.peek()[1] <= i - k) pq.poll();
        if (i >= k - 1) res[i - k + 1] = pq.peek()[0];
    }
    return res;
}`,
        javascript: `function maxSlidingWindow(nums, k) {
  // 最大堆,存索引
  const h = [], less = (a, b) => nums[a] > nums[b];
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
  const res = [];
  for (let i = 0; i < nums.length; i++) {
    push(i);
    while (h[0] <= i - k) pop();
    if (i >= k - 1) res.push(nums[h[0]]);
  }
  return res;
}`,
      },
    },
    {
      name: '單調遞減雙端佇列',
      idea: '佇列存索引,值遞減。新元素 x:從後面踢掉所有 ≤ x 的;放進後面;前面的索引 ≤ i − k 就從前面移除;最前面就是答案。',
      steps: ['`while dq and nums[dq[-1]] <= x`:`dq.pop()`', '`dq.append(i)`', '`if dq[0] <= i − k`:`dq.popleft()`', '`i >= k − 1` → 答案加入 `nums[dq[0]]`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: dequeFig() },
      complexity: { time: 'O(n)', space: 'O(k)', why: '每個索引進出佇列各一次;佇列最多 k 個。' },
      verdict: '最推薦,[[p:monotonic-queue]]的模板題。佇列放索引(不是值),才能判斷是否已經離開視窗。',
      code: {
        python: `from collections import deque

def maxSlidingWindow(nums, k):
    dq, res = deque(), []                     # 存索引,對應的值遞減
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:       # 比 x 小的永遠不會再是最大值
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:                    # 最前面的已經離開視窗
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res`,
        c: `int *maxSlidingWindow(int *nums, int numsSize, int k, int *returnSize) {
    int *dq = malloc(numsSize * sizeof(int)), head = 0, tail = 0;
    int *res = malloc(numsSize * sizeof(int)), cnt = 0;
    for (int i = 0; i < numsSize; i++) {
        while (tail > head && nums[dq[tail - 1]] <= nums[i]) tail--;
        dq[tail++] = i;
        if (dq[head] <= i - k) head++;
        if (i >= k - 1) res[cnt++] = nums[dq[head]];
    }
    free(dq);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> res;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    return res;
}`,
        java: `int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>();
    int[] res = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
        dq.addLast(i);
        if (dq.peekFirst() <= i - k) dq.pollFirst();
        if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];
    }
    return res;
}`,
        javascript: `function maxSlidingWindow(nums, k) {
  const dq = [], res = [];
  let head = 0;                               // 用索引當佇列頭,避免 shift() 的 O(n)
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) res.push(nums[dq[head]]);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '佇列存值而不是索引:無法判斷最前面的元素是否已經離開視窗(值可能重複)',
    '先移除過期元素再加入新元素也可以,但順序要一致,別漏掉 `dq[0] <= i − k` 的檢查',
    'JavaScript 用 `shift()`:每次 O(n),整體退化成 O(n·k)',
  ],
  followUp: [{ q: '同一個工具還能解什麼?', a: '1438(最大最小差 ≤ limit 的最長子陣列,兩個單調佇列)、862(和至少為 K 的最短子陣列,前綴和 + 單調佇列)。' }],
  check: {
    kind: 'fn',
    fn: 'maxSlidingWindow',
    cases: [
      { args: [A, K], out: [3, 3, 5, 5, 6, 7] },
      { args: [[1], 1], out: [1] },
      { args: [[1, -1], 1], out: [1, -1] },
      { args: [[9, 8, 7, 6, 5], 2], out: [9, 8, 7, 6] },
      { args: [[4, 4, 4, 1], 2], out: [4, 4, 4] },
      { args: [[1, 3, 1, 2, 0, 5], 3], out: [3, 3, 2, 5] },
    ],
  },
}
