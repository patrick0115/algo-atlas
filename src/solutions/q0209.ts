import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 209. Minimum Size Subarray Sum

const A = [2, 3, 1, 2, 4, 3]
const T = 7

function winFig(): FigStep[] {
  let l = 0
  let s = 0
  let best = Infinity
  const out: FigStep[] = [{ note: `全是正數 → 視窗越長和越大。右端 r 一直往右擴;只要和 ≥ ${T},就記下長度,再把左端 l 往右縮,看能不能更短`, views: [arr(A, { label: 'nums' })] }]
  for (let r = 0; r < A.length; r++) {
    s += A[r]
    while (s >= T) {
      best = Math.min(best, r - l + 1)
      out.push({ note: `[${l}, ${r}] 的和 ${s} ≥ ${T} → 長度 ${r - l + 1},最短 ${best};縮左端,去掉 ${A[l]}`, views: [arr(A, { label: 'nums', range: [l, r], dim: [l], pointers: [{ name: 'l', index: l }, { name: 'r', index: r, color: 'b' }] })] })
      s -= A[l++]
    }
  }
  out.push({ note: `答案 ${best}([4, 3])`, views: [arr(A, { label: 'nums', done: [4, 5] })] })
  return out
}

function bsFig(): FigStep[] {
  const pre = [0]
  for (const x of A) pre.push(pre[pre.length - 1] + x)
  return [
    { note: '前綴和是遞增的(全是正數)。對每個起點 i,要找最小的 j 使 pre[j] − pre[i] ≥ target → 在 pre 上二分找 pre[i] + target', views: [arr(pre, { label: 'pre' })] },
    { note: `i = 4:要找 pre[j] ≥ pre[4] + 7 = ${pre[4] + 7} → j = 6,長度 2。每個起點 O(log n),總共 O(n log n)`, views: [arr(pre, { label: 'pre', highlight: [4], done: [6] })] },
  ]
}

export const q0209: Solution = {
  id: 209,
  plain: '一排正整數,找一段**最短**的連續子陣列,讓它的總和至少是 target。找不到就回傳 0。',
  statement: '給正整數陣列 `nums` 和正整數 `target`,回傳總和 ≥ target 的**最短**連續子陣列長度;不存在則回傳 0。Follow-up:O(n) 之外,再寫一個 O(n log n) 的解。',
  examples: [
    { input: 'target = 7, nums = [2,3,1,2,4,3]', output: '2', note: '[4,3]' },
    { input: 'target = 4, nums = [1,4,4]', output: '1' },
    { input: 'target = 11, nums = [1,1,1,1,1,1,1,1]', output: '0' },
  ],
  constraints: ['n ≤ 10⁵', '所有數都是正數 → 視窗加長和一定變大'],
  insight: ['全是正數:視窗右端擴張,和變大;左端收縮,和變小 → 單調 → 可變長度的[[p:sliding-window]]', '和夠了就盡量縮左端,記下最短', '或:前綴和遞增,對每個起點二分找終點'],
  approaches: [
    {
      name: '可變長度滑動視窗',
      idea: 'r 往右加;`while s >= target`:更新答案、去掉 nums[l]、l + 1。',
      steps: ['`l = s = 0`、`best = ∞`', '`for r`:`s += nums[r]`', '`while s >= target`:`best = min(best, r − l + 1)`、`s -= nums[l]`、`l += 1`', '回傳 `0 if best == ∞ else best`'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: 'l、r 各最多走 n 步。' },
      verdict: '最推薦,可變長度視窗的模板題:「擴右端直到滿足,再縮左端到不滿足」。',
      code: {
        python: `def minSubArrayLen(target, nums):
    l = s = 0
    best = float('inf')
    for r, x in enumerate(nums):
        s += x
        while s >= target:                    # 夠了:記錄,再試著縮短
            best = min(best, r - l + 1)
            s -= nums[l]
            l += 1
    return 0 if best == float('inf') else best`,
        c: `int minSubArrayLen(int target, int *nums, int numsSize) {
    int l = 0, s = 0, best = INT_MAX;
    for (int r = 0; r < numsSize; r++) {
        s += nums[r];
        while (s >= target) {
            if (r - l + 1 < best) best = r - l + 1;
            s -= nums[l++];
        }
    }
    return best == INT_MAX ? 0 : best;
}`,
        cpp: `int minSubArrayLen(int target, vector<int>& nums) {
    int l = 0, s = 0, best = INT_MAX;
    for (int r = 0; r < (int)nums.size(); r++) {
        s += nums[r];
        while (s >= target) { best = min(best, r - l + 1); s -= nums[l++]; }
    }
    return best == INT_MAX ? 0 : best;
}`,
        java: `int minSubArrayLen(int target, int[] nums) {
    int l = 0, s = 0, best = Integer.MAX_VALUE;
    for (int r = 0; r < nums.length; r++) {
        s += nums[r];
        while (s >= target) { best = Math.min(best, r - l + 1); s -= nums[l++]; }
    }
    return best == Integer.MAX_VALUE ? 0 : best;
}`,
        javascript: `function minSubArrayLen(target, nums) {
  let l = 0, s = 0, best = Infinity;
  for (let r = 0; r < nums.length; r++) {
    s += nums[r];
    while (s >= target) {
      best = Math.min(best, r - l + 1);
      s -= nums[l++];
    }
  }
  return best === Infinity ? 0 : best;
}`,
      },
    },
    {
      name: '前綴和 + 二分搜尋',
      idea: '`pre` 遞增;對每個 i,二分找第一個 `pre[j] >= pre[i] + target`,長度 `j − i`。',
      steps: ['算 pre(長度 n + 1)', '`for i in 0..n−1`:`j = lowerBound(pre, pre[i] + target)`', '`j <= n` → `best = min(best, j − i)`'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: bsFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每個起點一次二分。' },
      verdict: 'Follow-up 要求的另一種解法。注意它也依賴「全是正數」:前綴和才會遞增。',
      code: {
        python: `from bisect import bisect_left

def minSubArrayLen(target, nums):
    pre = [0]
    for x in nums:
        pre.append(pre[-1] + x)
    best = float('inf')
    for i in range(len(nums)):
        j = bisect_left(pre, pre[i] + target)  # 第一個 pre[j] ≥ pre[i] + target
        if j < len(pre):
            best = min(best, j - i)
    return 0 if best == float('inf') else best`,
        c: `int minSubArrayLen(int target, int *nums, int numsSize) {
    int n = numsSize, best = INT_MAX;
    long long *pre = calloc(n + 1, sizeof(long long));
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    for (int i = 0; i < n; i++) {
        long long want = pre[i] + target;
        int lo = i + 1, hi = n + 1;
        while (lo < hi) { int m = (lo + hi) / 2; if (pre[m] >= want) hi = m; else lo = m + 1; }
        if (lo <= n && lo - i < best) best = lo - i;
    }
    free(pre);
    return best == INT_MAX ? 0 : best;
}`,
        cpp: `int minSubArrayLen(int target, vector<int>& nums) {
    int n = nums.size(), best = INT_MAX;
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    for (int i = 0; i < n; i++) {
        int j = lower_bound(pre.begin(), pre.end(), pre[i] + target) - pre.begin();
        if (j <= n) best = min(best, j - i);
    }
    return best == INT_MAX ? 0 : best;
}`,
        java: `int minSubArrayLen(int target, int[] nums) {
    int n = nums.length, best = Integer.MAX_VALUE;
    long[] pre = new long[n + 1];
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    for (int i = 0; i < n; i++) {
        long want = pre[i] + target;
        int lo = i + 1, hi = n + 1;
        while (lo < hi) { int m = (lo + hi) >>> 1; if (pre[m] >= want) hi = m; else lo = m + 1; }
        if (lo <= n) best = Math.min(best, lo - i);
    }
    return best == Integer.MAX_VALUE ? 0 : best;
}`,
        javascript: `function minSubArrayLen(target, nums) {
  const n = nums.length, pre = [0];
  for (const x of nums) pre.push(pre[pre.length - 1] + x);
  let best = Infinity;
  for (let i = 0; i < n; i++) {
    const want = pre[i] + target;
    let lo = i + 1, hi = n + 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (pre[m] >= want) hi = m;
      else lo = m + 1;
    }
    if (lo <= n) best = Math.min(best, lo - i);
  }
  return best === Infinity ? 0 : best;
}`,
      },
    },
  ],
  pitfalls: ['用 if 而不是 while 縮左端:可能還能再縮好幾格', '找不到時回傳 ∞ 或 n:要回傳 0', '有負數時兩種方法都不成立(那是 862 題,要用單調佇列)'],
  check: {
    kind: 'fn',
    fn: 'minSubArrayLen',
    cases: [
      { args: [T, A], out: 2 },
      { args: [4, [1, 4, 4]], out: 1 },
      { args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], out: 0 },
      { args: [15, [1, 2, 3, 4, 5]], out: 5 },
      { args: [3, [1, 1]], out: 0 },
    ],
  },
}
