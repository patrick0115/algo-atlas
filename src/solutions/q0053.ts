import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 53. Maximum Subarray

const A = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

function bruteFig(): FigStep[] {
  const out: FigStep[] = [{ note: '暴力:固定起點 i,往右延伸 j,一邊加一邊更新最大值', views: [arr(A, { label: 'nums', mode: 'bars' })] }]
  let best = -Infinity
  for (let i = 0; i < A.length; i++) {
    let s = 0
    for (let j = i; j < A.length; j++) {
      s += A[j]
      if (s > best) {
        best = s
        out.push({ note: `[${i}, ${j}] 的和 = ${s},目前最大`, views: [arr(A, { label: 'nums', mode: 'bars', range: [i, j] })] })
      }
    }
  }
  return out
}

function kadaneFig(): FigStep[] {
  let cur = 0
  let best = -Infinity
  let start = 0
  let bs = 0
  let be = 0
  const curs: (number | string)[] = A.map(() => '')
  const out: FigStep[] = [{ note: 'Kadane:cur = 「以目前這格結尾」的最大子陣列和。走到 x 時只有兩種選擇:接在前面那段後面(cur + x),或從自己重新開始(x)。前面那段是負的就不如丟掉', views: [arr(A, { label: 'nums', mode: 'bars' })] }]
  A.forEach((x, i) => {
    const prev = cur
    const restart = cur + x < x
    if (restart) start = i
    cur = Math.max(cur + x, x)
    curs[i] = cur
    if (cur > best) {
      best = cur
      bs = start
      be = i
    }
    out.push({ note: `nums[${i}] = ${x}:${restart ? `前面累積的 ${prev} 是負的,接上去只會更小 → 從這格重新開始` : `接在前面那段(${prev})後面`},cur = ${cur}。最大 ${best}`, views: [arr(A, { label: 'nums', mode: 'bars', range: [start, i], highlight: [i] }), arr(curs, { label: 'cur(以這格結尾的最大和)', highlight: [i] })] })
  })
  out.push({ note: `答案 ${best},是 [${bs}, ${be}] 這一段`, views: [arr(A, { label: 'nums', mode: 'bars', range: [bs, be] })] })
  return out
}

function dcFig(): FigStep[] {
  const mid = Math.floor((A.length - 1) / 2)
  let s = 0
  let bestL = -Infinity
  let li = mid
  for (let i = mid; i >= 0; i--) {
    s += A[i]
    if (s > bestL) (bestL = s), (li = i)
  }
  s = 0
  let bestR = -Infinity
  let ri = mid + 1
  for (let j = mid + 1; j < A.length; j++) {
    s += A[j]
    if (s > bestR) (bestR = s), (ri = j)
  }
  return [
    { note: `分治:從中間切開(mid = ${mid})。最大子陣列要嘛完全在左半、要嘛完全在右半、要嘛**跨過中間**`, views: [arr(A, { label: 'nums', mode: 'bars', compare: [mid, mid + 1] })] },
    { note: `跨過中間的:從 mid 往左延伸取最大(${bestL},到 ${li}),從 mid+1 往右延伸取最大(${bestR},到 ${ri}),相加 = ${bestL + bestR}`, views: [arr(A, { label: 'nums', mode: 'bars', range: [li, ri] })] },
    { note: '左半、右半各自遞迴求答案,三者取最大。T(n) = 2T(n/2) + O(n) → O(n log n)', views: [arr(A, { label: 'nums', mode: 'bars', dim: range(mid + 1, A.length - 1) }), arr(A, { label: 'nums', mode: 'bars', dim: range(0, mid) })] },
  ]
}

export const q0053: Solution = {
  id: 53,
  plain: '在一串有正有負的數字裡,找一段**連續**的數字,讓它們的總和最大。像看股票每天的漲跌,找出哪一段連續的日子累積漲最多。',
  statement: '給整數陣列 `nums`,找出和最大的**連續**子陣列(至少一個元素),回傳它的和。',
  examples: [
    { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', note: '[4,-1,2,1]' },
    { input: 'nums = [1]', output: '1' },
    { input: 'nums = [-3,-1,-2]', output: '-1', note: '全是負的,挑最大的那一個' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁵` → O(n²) 是 50 億,太慢', '可能全部都是負數'],
  insight: [
    '暴力:所有 (i, j) 都算和 → O(n²)',
    'DP 的角度:定義 `cur[i]` = **以第 i 格結尾**的最大子陣列和。它只有兩種可能:接在 `cur[i−1]` 後面,或從 `nums[i]` 自己重新開始 → `cur[i] = max(cur[i−1] + nums[i], nums[i])`',
    '白話:前面累積的和如果是負的,接上去只會拖累,不如丟掉重來 —— 這就是 **Kadane 演算法**',
    '答案是所有 `cur[i]` 裡的最大值;只需要前一格,所以 O(1) 空間',
  ],
  approaches: [
    {
      name: '暴力:每個起點往右延伸',
      idea: '固定 i,j 從 i 往右,累加 `s += nums[j]`,每一步更新最大值。',
      steps: ['`best = −∞`', '`for i`:`s = 0`;`for j in i..n−1`:`s += nums[j]`、`best = max(best, s)`'],
      figure: { title: `nums = [${A.join(',')}](只畫出刷新最大值的那幾步)`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n(n+1)/2 個子陣列,累加讓每個 O(1)。' },
      verdict: 'n = 10⁵ 會超時。',
      code: {
        python: `def maxSubArray(nums):
    best = float('-inf')
    for i in range(len(nums)):
        s = 0
        for j in range(i, len(nums)):
            s += nums[j]
            best = max(best, s)
    return best`,
        c: `int maxSubArray(int *nums, int numsSize) {
    int best = INT_MIN;
    for (int i = 0; i < numsSize; i++) {
        int s = 0;
        for (int j = i; j < numsSize; j++) { s += nums[j]; if (s > best) best = s; }
    }
    return best;
}`,
        cpp: `int maxSubArray(vector<int>& nums) {
    int best = INT_MIN, n = nums.size();
    for (int i = 0; i < n; i++) {
        int s = 0;
        for (int j = i; j < n; j++) { s += nums[j]; best = max(best, s); }
    }
    return best;
}`,
        java: `int maxSubArray(int[] nums) {
    int best = Integer.MIN_VALUE;
    for (int i = 0; i < nums.length; i++) {
        int s = 0;
        for (int j = i; j < nums.length; j++) { s += nums[j]; best = Math.max(best, s); }
    }
    return best;
}`,
        javascript: `function maxSubArray(nums) {
  let best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let s = 0;
    for (let j = i; j < nums.length; j++) {
      s += nums[j];
      best = Math.max(best, s);
    }
  }
  return best;
}`,
      },
    },
    {
      name: 'Kadane(一維 DP)',
      idea: '`cur = max(cur + x, x)`:以這格結尾的最大和。`best = max(best, cur)`。',
      steps: ['`cur = 0`、`best = −∞`', '每個 `x`:`cur = max(cur + x, x)`', '`best = max(best, cur)`', '回傳 best'],
      figure: { title: `nums = [${A.join(',')}]`, steps: kadaneFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走一遍,兩個變數。' },
      verdict: '標準解,[[p:dp-1d]] / [[p:greedy]] 的經典。「以 i 結尾」是子陣列 DP 最常用的狀態定義(152、918、1186 都是)。',
      code: {
        python: `def maxSubArray(nums):
    cur, best = 0, float('-inf')
    for x in nums:
        cur = max(cur + x, x)             # 接在前面後面,或從自己重新開始
        best = max(best, cur)
    return best`,
        c: `int maxSubArray(int *nums, int numsSize) {
    int cur = 0, best = INT_MIN;
    for (int i = 0; i < numsSize; i++) {
        cur = cur + nums[i] > nums[i] ? cur + nums[i] : nums[i];
        if (cur > best) best = cur;
    }
    return best;
}`,
        cpp: `int maxSubArray(vector<int>& nums) {
    int cur = 0, best = INT_MIN;
    for (int x : nums) {
        cur = max(cur + x, x);
        best = max(best, cur);
    }
    return best;
}`,
        java: `int maxSubArray(int[] nums) {
    int cur = 0, best = Integer.MIN_VALUE;
    for (int x : nums) {
        cur = Math.max(cur + x, x);
        best = Math.max(best, cur);
    }
    return best;
}`,
        javascript: `function maxSubArray(nums) {
  let cur = 0, best = -Infinity;
  for (const x of nums) {
    cur = Math.max(cur + x, x);
    best = Math.max(best, cur);
  }
  return best;
}`,
      },
    },
    {
      name: '分治',
      idea: '`solve(lo, hi)`:從中間切開,答案是 max(左半的答案, 右半的答案, 跨過中間的最大和)。跨中間 = 從 mid 往左延伸的最大和 + 從 mid+1 往右延伸的最大和。',
      steps: ['`lo == hi` → `nums[lo]`', '`mid = (lo + hi) / 2`', '左延伸:從 mid 往左累加取最大;右延伸:從 mid+1 往右累加取最大', '回傳 `max(solve(lo, mid), solve(mid+1, hi), 左 + 右)`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: dcFig() },
      complexity: { time: 'O(n log n)', space: 'O(log n)', why: '每層 O(n) 算跨中間的,共 log n 層。' },
      verdict: '題目 follow-up 要的「分治解」。比 Kadane 慢,但這個想法(線段樹存「區間最大子陣列和」)能支援「中間的值會改、要一直查詢」的進階題。',
      code: {
        python: `def maxSubArray(nums):
    def solve(lo, hi):
        if lo == hi:
            return nums[lo]
        mid = (lo + hi) // 2
        s, left = 0, float('-inf')
        for i in range(mid, lo - 1, -1):  # 從中間往左延伸
            s += nums[i]
            left = max(left, s)
        s, right = 0, float('-inf')
        for j in range(mid + 1, hi + 1):  # 從中間往右延伸
            s += nums[j]
            right = max(right, s)
        return max(solve(lo, mid), solve(mid + 1, hi), left + right)

    return solve(0, len(nums) - 1)`,
        c: `static int *A_;

static int solve(int lo, int hi) {
    if (lo == hi) return A_[lo];
    int mid = lo + (hi - lo) / 2, s = 0, left = INT_MIN, right = INT_MIN;
    for (int i = mid; i >= lo; i--) { s += A_[i]; if (s > left) left = s; }
    s = 0;
    for (int j = mid + 1; j <= hi; j++) { s += A_[j]; if (s > right) right = s; }
    int a = solve(lo, mid), b = solve(mid + 1, hi), c = left + right;
    return a > b ? (a > c ? a : c) : (b > c ? b : c);
}

int maxSubArray(int *nums, int numsSize) {
    A_ = nums;
    return solve(0, numsSize - 1);
}`,
        cpp: `int maxSubArray(vector<int>& nums) {
    function<int(int, int)> solve = [&](int lo, int hi) -> int {
        if (lo == hi) return nums[lo];
        int mid = lo + (hi - lo) / 2, s = 0, left = INT_MIN, right = INT_MIN;
        for (int i = mid; i >= lo; i--) { s += nums[i]; left = max(left, s); }
        s = 0;
        for (int j = mid + 1; j <= hi; j++) { s += nums[j]; right = max(right, s); }
        return max({solve(lo, mid), solve(mid + 1, hi), left + right});
    };
    return solve(0, (int)nums.size() - 1);
}`,
        java: `int maxSubArray(int[] nums) {
    return solve(nums, 0, nums.length - 1);
}

private int solve(int[] a, int lo, int hi) {
    if (lo == hi) return a[lo];
    int mid = lo + (hi - lo) / 2, s = 0, left = Integer.MIN_VALUE, right = Integer.MIN_VALUE;
    for (int i = mid; i >= lo; i--) { s += a[i]; left = Math.max(left, s); }
    s = 0;
    for (int j = mid + 1; j <= hi; j++) { s += a[j]; right = Math.max(right, s); }
    return Math.max(Math.max(solve(a, lo, mid), solve(a, mid + 1, hi)), left + right);
}`,
        javascript: `function maxSubArray(nums) {
  const solve = (lo, hi) => {
    if (lo === hi) return nums[lo];
    const mid = (lo + hi) >> 1;
    let s = 0, left = -Infinity, right = -Infinity;
    for (let i = mid; i >= lo; i--) left = Math.max(left, (s += nums[i]));
    s = 0;
    for (let j = mid + 1; j <= hi; j++) right = Math.max(right, (s += nums[j]));
    return Math.max(solve(lo, mid), solve(mid + 1, hi), left + right);
  };
  return solve(0, nums.length - 1);
}`,
      },
    },
  ],
  pitfalls: [
    'best 初始值設 0:全是負數時答案會錯成 0(至少要選一個元素)',
    'Kadane 寫成「cur < 0 就歸零」再加:要先決定 `cur = max(cur + x, x)` 再更新 best,順序寫錯會漏掉全負的情況',
    '子陣列要**連續**,不能跳著挑(跳著挑就是把所有正數加起來)',
  ],
  followUp: [
    { q: '陣列是環狀的?', a: '918. Maximum Sum Circular Subarray:答案是 max(一般的最大和, 總和 − 最小子陣列和),全負時取前者。' },
    { q: '改成乘積?', a: '[152. Maximum Product Subarray](#/q/152):負負得正,要同時記最大和最小。' },
  ],
  check: {
    kind: 'fn',
    fn: 'maxSubArray',
    cases: [
      { args: [A], out: 6 },
      { args: [[1]], out: 1 },
      { args: [[5, 4, -1, 7, 8]], out: 23 },
      { args: [[-3, -1, -2]], out: -1 },
      { args: [[-2, -1]], out: -1 },
    ],
  },
}
