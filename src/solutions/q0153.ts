import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 153. Find Minimum in Rotated Sorted Array

const A = [11, 13, 15, 17, 19, 2, 5, 7]

function linearFig(): FigStep[] {
  const out: FigStep[] = [{ note: '旋轉過的有序陣列:前半段和後半段各自遞增,中間有一個「斷崖」。最小值就在斷崖之後', views: [arr(A, { label: 'nums', mode: 'bars' })] }]
  for (let i = 1; i < A.length; i++) {
    if (A[i] < A[i - 1]) {
      out.push({ note: `nums[${i}] = ${A[i]} < nums[${i - 1}] = ${A[i - 1]},往下掉了 → 這就是最小值`, views: [arr(A, { label: 'nums', mode: 'bars', highlight: [i], compare: [i - 1] })] })
      return out
    }
    out.push({ note: `nums[${i}] = ${A[i]} ≥ nums[${i - 1}],還在往上`, views: [arr(A, { label: 'nums', mode: 'bars', compare: [i - 1, i] })] })
  }
  return out
}

function bsFig(): FigStep[] {
  let lo = 0
  let hi = A.length - 1
  const view = (mid?: number) =>
    arr(A, {
      label: 'nums',
      mode: 'bars',
      range: [lo, hi],
      dim: [...range(0, lo - 1), ...range(hi + 1, A.length - 1)],
      compare: mid !== undefined ? [mid, hi] : [],
      pointers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi, color: 'b' }, ...(mid !== undefined ? [{ name: 'mid', index: mid, color: 'c' as const }] : [])],
    })
  const out: FigStep[] = [{ note: '最小值一定在 [lo, hi] 裡。每次拿 nums[mid] 和**最右邊** nums[hi] 比,就知道斷崖在哪一邊', views: [view()] }]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const right = A[mid] > A[hi]
    out.push({
      note: right
        ? `nums[mid] = ${A[mid]} > nums[hi] = ${A[hi]}:mid 還在「左邊那段高的」,斷崖在 mid 右邊 → lo = mid + 1`
        : `nums[mid] = ${A[mid]} < nums[hi] = ${A[hi]}:mid 到 hi 是遞增的一段,最小值在 mid 或它左邊 → hi = mid(mid 本身可能就是答案)`,
      views: [view(mid)],
    })
    if (right) lo = mid + 1
    else hi = mid
  }
  out.push({ note: `lo == hi = ${lo},nums[${lo}] = ${A[lo]} 就是最小值`, views: [arr(A, { label: 'nums', mode: 'bars', highlight: [lo] })] })
  return out
}

export const q0153: Solution = {
  id: 153,
  plain: '一條排好的數字被「轉了一圈」,例如 1 2 3 4 5 變成 4 5 1 2 3。要很快找出最小的那個數 —— 它就在「突然往下掉」的地方。',
  statement:
    '一個**由小到大排好、沒有重複**的陣列,被「旋轉」了若干次(把最後一個搬到最前面算一次),例如 `[0,1,2,4,5,6,7]` 可能變成 `[4,5,6,7,0,1,2]`。給旋轉後的陣列,用 **O(log n)** 找出最小值。',
  examples: [
    { input: 'nums = [3,4,5,1,2]', output: '1' },
    { input: 'nums = [4,5,6,7,0,1,2]', output: '0' },
    { input: 'nums = [11,13,15,17]', output: '11', note: '旋轉了 4 次 = 沒有旋轉' },
  ],
  constraints: ['`1 ≤ n ≤ 5000`,值不重複', '要求 **O(log n)** → 二分搜尋;線性找能過但不符合要求'],
  insight: [
    '旋轉後的陣列是兩段遞增:左段的每個數都比右段的每個數大。最小值是**右段的第一個**',
    '二分的關鍵是「看 mid 就知道往哪邊」。和最右邊的 `nums[hi]` 比:',
    '`nums[mid] > nums[hi]` → mid 在左段(高的那段),最小值在 mid **右邊**',
    '`nums[mid] < nums[hi]` → mid 到 hi 是同一段遞增,最小值在 mid 或它**左邊**,而且 mid 可能就是答案',
  ],
  approaches: [
    {
      name: '線性找斷崖',
      idea: '走一遍,找到第一個比前一個小的數;找不到就是沒旋轉,回傳第一個。',
      steps: ['`i` 從 1 到 n−1:`nums[i] < nums[i−1]` → 回傳 `nums[i]`', '走完 → 回傳 `nums[0]`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: linearFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞要看完整個陣列。' },
      verdict: '最直覺但不符合 O(log n) 要求。用來確認「最小值在斷崖後」這個觀察。',
      code: {
        python: `def findMin(nums):
    for i in range(1, len(nums)):
        if nums[i] < nums[i - 1]:
            return nums[i]
    return nums[0]`,
        c: `int findMin(int *nums, int numsSize) {
    for (int i = 1; i < numsSize; i++)
        if (nums[i] < nums[i - 1]) return nums[i];
    return nums[0];
}`,
        cpp: `int findMin(vector<int>& nums) {
    for (size_t i = 1; i < nums.size(); i++)
        if (nums[i] < nums[i - 1]) return nums[i];
    return nums[0];
}`,
        java: `int findMin(int[] nums) {
    for (int i = 1; i < nums.length; i++)
        if (nums[i] < nums[i - 1]) return nums[i];
    return nums[0];
}`,
        javascript: `function findMin(nums) {
  for (let i = 1; i < nums.length; i++)
    if (nums[i] < nums[i - 1]) return nums[i];
  return nums[0];
}`,
      },
    },
    {
      name: '二分搜尋:和右端比較',
      idea: '維持「最小值在 `[lo, hi]` 裡」。`nums[mid] > nums[hi]` → `lo = mid + 1`;否則 `hi = mid`。`lo == hi` 時就是答案。',
      steps: ['`lo = 0`、`hi = n − 1`', '`while lo < hi`:`mid = (lo + hi) / 2`', '`nums[mid] > nums[hi]` → `lo = mid + 1`', '否則 → `hi = mid`', '回傳 `nums[lo]`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: bsFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次區間縮一半。' },
      verdict: '標準解。為什麼和**右端**比、不和左端比?和左端比的話,`nums[mid] > nums[lo]` 在「沒旋轉」和「mid 在左段」兩種情況都成立,分不出來;和右端比沒有這個問題。',
      code: {
        python: `def findMin(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1                  # mid 在左段,最小值在右邊
        else:
            hi = mid                      # mid 到 hi 遞增,mid 可能就是最小值
    return nums[lo]`,
        c: `int findMin(int *nums, int numsSize) {
    int lo = 0, hi = numsSize - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo];
}`,
        cpp: `int findMin(vector<int>& nums) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo];
}`,
        java: `int findMin(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo];
}`,
        javascript: `function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}`,
      },
    },
  ],
  pitfalls: [
    '`else` 分支寫成 `hi = mid − 1`:mid 本身可能就是最小值(例如 `[3,1,2]` 的 mid 指到 1),會被丟掉',
    '迴圈條件用 `lo <= hi` 配 `hi = mid` 會無窮迴圈(lo == hi 時 mid 不動)',
    '和 `nums[lo]` 比較:沒旋轉的陣列 `[1,2,3]` 會被判斷成「最小值在右邊」',
  ],
  followUp: [
    { q: '如果有重複的數?', a: '154. Find Minimum II:`nums[mid] == nums[hi]` 時分不出哪邊,只能 `hi -= 1` 縮一格,最壞退化成 O(n)。' },
    { q: '在旋轉陣列裡找 target?', a: '[33. Search in Rotated Sorted Array](#/q/33):先判斷哪半邊是有序的,再看 target 在不在那半邊。' },
  ],
  check: {
    kind: 'fn',
    fn: 'findMin',
    cases: [
      { args: [[3, 4, 5, 1, 2]], out: 1 },
      { args: [[4, 5, 6, 7, 0, 1, 2]], out: 0 },
      { args: [[11, 13, 15, 17]], out: 11 },
      { args: [[1]], out: 1 },
      { args: [[2, 1]], out: 1 },
      { args: [A], out: 2 },
      { args: [[5, 1, 2, 3, 4]], out: 1 },
    ],
  },
}
