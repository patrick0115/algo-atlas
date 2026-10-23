import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 162. Find Peak Element

const A = [1, 2, 1, 3, 5, 6, 4]

function bsFig(): FigStep[] {
  let lo = 0
  let hi = A.length - 1
  const out: FigStep[] = [{ note: '想像在爬山:兩端外面都是 −∞(深谷)。站在 m,看右邊鄰居:如果右邊比較高,往右走**一定**會遇到山頂(最差也會到最右邊,它比外面的 −∞ 高)', views: [arr(A, { label: 'nums', mode: 'bars' })] }]
  while (lo < hi) {
    const m = (lo + hi) >> 1
    const up = A[m] < A[m + 1]
    out.push({ note: `m = ${m}:nums[${m}] = ${A[m]} ${up ? `< 右邊 ${A[m + 1]} → 在上坡,山頂在右邊,lo = ${m + 1}` : `> 右邊 ${A[m + 1]} → 在下坡,m 或左邊有山頂,hi = ${m}`}`, views: [arr(A, { label: 'nums', mode: 'bars', range: [lo, hi], highlight: [m], compare: [m + 1] })] })
    if (up) lo = m + 1
    else hi = m
  }
  out.push({ note: `lo = hi = ${lo}:nums[${lo}] = ${A[lo]} 比兩邊都大,是一個山頂(答案不唯一,1 也可以)`, views: [arr(A, { label: 'nums', mode: 'bars', done: [lo] })] })
  return out
}

function linFig(): FigStep[] {
  return [
    { note: '線性:從左往右,找第一個「比右邊大」的位置。它左邊一路都是上坡,所以它比左邊也大 → 一定是山頂', views: [arr(A, { label: 'nums', mode: 'bars', highlight: [1] })] },
    { note: '找到 nums[1] = 2 > 1 → 回傳 1。都沒找到就是最後一個。O(n)', views: [arr(A, { label: 'nums', mode: 'bars', done: [1] })] },
  ]
}

export const q0162: Solution = {
  id: 162,
  plain: '一排數字裡找一個「山頂」:它比左右兩邊的鄰居都大(陣列外面當作無限低)。有好幾個山頂的話,回傳任何一個都可以。要用 O(log n)。',
  statement: '給陣列 `nums`(相鄰元素不相等),找出任一個**峰值**的索引:`nums[i]` 嚴格大於相鄰元素。視 `nums[−1] = nums[n] = −∞`。必須 O(log n)。',
  examples: [
    { input: 'nums = [1,2,3,1]', output: '2' },
    { input: 'nums = [1,2,1,3,5,6,4]', output: '5', note: '1 也是正確答案' },
  ],
  constraints: ['n ≤ 1000', '相鄰元素不相等', '必須 O(log n)'],
  insight: ['陣列沒排序,但還是能二分:看 m 和 m+1 的大小關係判斷「上坡還是下坡」', '上坡(nums[m] < nums[m+1])→ 右邊一定有山頂;下坡 → m 或左邊一定有山頂', '因為兩端外面是 −∞,往高的那邊走永遠不會走空'],
  approaches: [
    {
      name: '二分搜尋(往上坡走)',
      idea: '`nums[m] < nums[m+1]` → `lo = m + 1`;否則 `hi = m`。最後 lo 就是一個山頂。',
      steps: ['`lo, hi = 0, n − 1`', '`m = (lo + hi) // 2`', '`nums[m] < nums[m + 1]` → `lo = m + 1`;否則 `hi = m`', '回傳 lo'],
      figure: { title: `nums = [${A}]`, steps: bsFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次範圍砍半。' },
      verdict: '最推薦。[[p:binary-search]]的關鍵不是「有序」,而是「能判斷答案在哪一半」。',
      code: {
        python: `def findPeakElement(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        m = (lo + hi) // 2
        if nums[m] < nums[m + 1]:
            lo = m + 1                        # 上坡:右邊一定有山頂
        else:
            hi = m                            # 下坡:m 或左邊有山頂
    return lo`,
        c: `int findPeakElement(int *nums, int numsSize) {
    int lo = 0, hi = numsSize - 1;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (nums[m] < nums[m + 1]) lo = m + 1;
        else hi = m;
    }
    return lo;
}`,
        cpp: `int findPeakElement(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (nums[m] < nums[m + 1]) lo = m + 1;
        else hi = m;
    }
    return lo;
}`,
        java: `int findPeakElement(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (nums[m] < nums[m + 1]) lo = m + 1;
        else hi = m;
    }
    return lo;
}`,
        javascript: `function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (nums[m] < nums[m + 1]) lo = m + 1;
    else hi = m;
  }
  return lo;
}`,
      },
    },
    {
      name: '線性掃描',
      idea: '找第一個 `nums[i] > nums[i+1]` 的 i;沒有就回傳 n − 1。',
      steps: ['`for i in 0..n−2`:`nums[i] > nums[i + 1]` → 回傳 i', '回傳 `n − 1`'],
      figure: { title: `nums = [${A}]`, steps: linFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞看完整個陣列。' },
      verdict: '簡單正確,但不符合 O(log n)。它的正確性和二分版是同一個道理(上坡走到第一次下坡)。',
      code: {
        python: `def findPeakElement(nums):
    for i in range(len(nums) - 1):
        if nums[i] > nums[i + 1]:
            return i                          # 左邊一路上坡,這裡第一次下坡
    return len(nums) - 1`,
        c: `int findPeakElement(int *nums, int numsSize) {
    for (int i = 0; i + 1 < numsSize; i++) if (nums[i] > nums[i + 1]) return i;
    return numsSize - 1;
}`,
        cpp: `int findPeakElement(vector<int>& nums) {
    for (int i = 0; i + 1 < (int)nums.size(); i++) if (nums[i] > nums[i + 1]) return i;
    return nums.size() - 1;
}`,
        java: `int findPeakElement(int[] nums) {
    for (int i = 0; i + 1 < nums.length; i++) if (nums[i] > nums[i + 1]) return i;
    return nums.length - 1;
}`,
        javascript: `function findPeakElement(nums) {
  for (let i = 0; i + 1 < nums.length; i++) if (nums[i] > nums[i + 1]) return i;
  return nums.length - 1;
}`,
      },
    },
  ],
  pitfalls: ['用 `while lo <= hi` 配 `hi = m`:會無限迴圈', '比較 nums[m] 和 nums[m − 1]:m = 0 時越界;比 m + 1 在 lo < hi 時一定安全'],
  check: {
    kind: 'fn',
    fn: 'findPeakElement',
    cases: [
      { args: [[1, 2, 3, 1]], out: 2 },
      { args: [[1]], out: 0 },
      { args: [[3, 2, 1]], out: 0 },
      { args: [[1, 2, 3]], out: 2 },
      { args: [[2, 1]], out: 0 },
    ],
  },
}
