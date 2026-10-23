import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 35. Search Insert Position

const A = [1, 3, 5, 6, 8, 10]
const T = 7

function bsFig(): FigStep[] {
  let lo = 0
  let hi = A.length
  const out: FigStep[] = [{ note: `要找「第一個 ≥ ${T} 的位置」:找到就是它的索引,找不到時這個位置剛好是插入點。搜尋範圍 [lo, hi) = [0, ${A.length})(hi 可以是 n,代表插在最後)`, views: [arr(A, { label: 'nums', range: [lo, hi - 1] })] }]
  while (lo < hi) {
    const m = (lo + hi) >> 1
    const go = A[m] < T
    out.push({ note: `m = ${m}:nums[${m}] = ${A[m]} ${go ? `< ${T} → 答案在右邊,lo = ${m + 1}` : `≥ ${T} → m 可能是答案,hi = ${m}`}`, views: [arr(A, { label: 'nums', range: [lo, hi - 1], highlight: [m], dim: go ? Array.from({ length: m - lo + 1 }, (_, k) => lo + k) : [] })] })
    if (go) lo = m + 1
    else hi = m
  }
  out.push({ note: `lo = hi = ${lo}:第一個 ≥ ${T} 的是 nums[${lo}] = ${A[lo]} → ${T} 要插在索引 ${lo}`, views: [arr(A, { label: 'nums', pointers: [{ name: '插入點', index: lo }] })] })
  return out
}

function linFig(): FigStep[] {
  return [
    { note: `從左往右找第一個 ≥ ${T} 的:1、3、5、6 都比較小`, views: [arr(A, { label: 'nums', dim: [0, 1, 2, 3] })] },
    { note: '找到 8 ≥ 7,索引 4。都比較小的話答案是 n。O(n),沒有用到「已排序」', views: [arr(A, { label: 'nums', highlight: [4] })] },
  ]
}

export const q0035: Solution = {
  id: 35,
  plain: '一排排好的數字(沒有重複),找 target 在哪;如果沒有,就告訴我它「應該插在哪」才能保持排序。',
  statement: '給**已排序**、元素互不相同的陣列 `nums` 和 `target`。若 target 存在回傳它的索引,否則回傳它按順序插入時的位置。必須 O(log n)。',
  examples: [
    { input: 'nums = [1,3,5,6], target = 5', output: '2' },
    { input: 'nums = [1,3,5,6], target = 2', output: '1' },
    { input: 'nums = [1,3,5,6], target = 7', output: '4' },
  ],
  constraints: ['n ≤ 10⁴', '必須 O(log n) → 二分搜尋'],
  insight: ['「存在就回傳位置、不存在就回傳插入點」其實是同一件事:**第一個 ≥ target 的位置**(lower bound)', '用左閉右開 [lo, hi) 的二分,最後 lo 就是答案', '和 [704](#/q/704) 只差在「找不到時回傳什麼」'],
  approaches: [
    {
      name: '二分搜尋 lower bound',
      idea: '`lo = 0`、`hi = n`;`nums[m] < target` → `lo = m + 1`,否則 `hi = m`。回傳 lo。',
      steps: ['`lo, hi = 0, len(nums)`', '`while lo < hi`:`m = (lo + hi) // 2`', '`nums[m] < target` → `lo = m + 1`;否則 `hi = m`', '回傳 lo'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: bsFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次範圍砍半。' },
      verdict: '最推薦。lower bound 是[[p:binary-search]]最常用的變形,很多語言有內建(bisect_left、lower_bound)。',
      code: {
        python: `def searchInsert(nums, target):
    lo, hi = 0, len(nums)                     # [lo, hi):hi = n 代表插在最後
    while lo < hi:
        m = (lo + hi) // 2
        if nums[m] < target:
            lo = m + 1                        # m 太小,答案在右邊
        else:
            hi = m                            # m 可能就是答案
    return lo`,
        c: `int searchInsert(int *nums, int numsSize, int target) {
    int lo = 0, hi = numsSize;
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        if (nums[m] < target) lo = m + 1;
        else hi = m;
    }
    return lo;
}`,
        cpp: `int searchInsert(vector<int>& nums, int target) {
    return lower_bound(nums.begin(), nums.end(), target) - nums.begin();
}`,
        java: `int searchInsert(int[] nums, int target) {
    int lo = 0, hi = nums.length;
    while (lo < hi) {
        int m = (lo + hi) >>> 1;
        if (nums[m] < target) lo = m + 1;
        else hi = m;
    }
    return lo;
}`,
        javascript: `function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (nums[m] < target) lo = m + 1;
    else hi = m;
  }
  return lo;
}`,
      },
    },
    {
      name: '線性掃描',
      idea: '回傳第一個 `nums[i] >= target` 的 i;都沒有就回傳 n。',
      steps: ['`for i, x in enumerate(nums)`:`x >= target` → 回傳 i', '回傳 `len(nums)`'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: linFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞看完整個陣列。' },
      verdict: '不符合 O(log n) 的要求,拿來確認「第一個 ≥ target」這個定義是對的。',
      code: {
        python: `def searchInsert(nums, target):
    for i, x in enumerate(nums):
        if x >= target:
            return i
    return len(nums)`,
        c: `int searchInsert(int *nums, int numsSize, int target) {
    for (int i = 0; i < numsSize; i++) if (nums[i] >= target) return i;
    return numsSize;
}`,
        cpp: `int searchInsert(vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) if (nums[i] >= target) return i;
    return nums.size();
}`,
        java: `int searchInsert(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) if (nums[i] >= target) return i;
    return nums.length;
}`,
        javascript: `function searchInsert(nums, target) {
  for (let i = 0; i < nums.length; i++) if (nums[i] >= target) return i;
  return nums.length;
}`,
      },
    },
  ],
  pitfalls: ['用 `hi = n − 1` 的閉區間寫法:target 比所有數都大時要另外處理', '找到相等就回傳、找不到回傳 −1:這題找不到時要回傳插入點'],
  check: {
    kind: 'fn',
    fn: 'searchInsert',
    cases: [
      { args: [[1, 3, 5, 6], 5], out: 2 },
      { args: [[1, 3, 5, 6], 2], out: 1 },
      { args: [[1, 3, 5, 6], 7], out: 4 },
      { args: [[1, 3, 5, 6], 0], out: 0 },
      { args: [A, T], out: 4 },
      { args: [[1], 1], out: 0 },
    ],
  },
}
