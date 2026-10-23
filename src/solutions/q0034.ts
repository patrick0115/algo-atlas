import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 34. Find First and Last Position of Element in Sorted Array

const A = [5, 7, 7, 8, 8, 8, 10]
const T = 8

function lb(x: number): number {
  let lo = 0
  let hi = A.length
  while (lo < hi) {
    const m = (lo + hi) >> 1
    if (A[m] < x) lo = m + 1
    else hi = m
  }
  return lo
}

function twoFig(): FigStep[] {
  const L = lb(T)
  const R = lb(T + 1) - 1
  return [
    { note: `用同一個工具做兩次:lowerBound(x) = 第一個 ≥ x 的位置([35](#/q/35) 的寫法)。第一次找 x = ${T}`, views: [arr(A, { label: 'nums', pointers: [{ name: `lb(${T})`, index: L }] })] },
    { note: `第二次找 x = ${T} + 1 = ${T + 1}:第一個 ≥ ${T + 1} 的位置是 ${R + 1},往左一格 ${R} 就是最後一個 ${T}`, views: [arr(A, { label: 'nums', pointers: [{ name: `lb(${T + 1})`, index: R + 1 }] })] },
    { note: `答案 [${L}, ${R}]。如果 lb(${T}) 超出範圍或那格不是 ${T},代表不存在 → [−1, −1]`, views: [arr(A, { label: 'nums', range: [L, R], done: Array.from({ length: R - L + 1 }, (_, k) => L + k) })] },
  ]
}

function linFig(): FigStep[] {
  return [
    { note: `從左邊找第一個 ${T}、從右邊找第一個 ${T}`, views: [arr(A, { label: 'nums', highlight: [3, 5] })] },
    { note: '最壞要看完整個陣列(例如全部都是 target),O(n),不符合題目要求', views: [arr(A, { label: 'nums', range: [3, 5] })] },
  ]
}

export const q0034: Solution = {
  id: 34,
  plain: '一排排好序的數字(可能有重複),找出某個數第一次和最後一次出現的位置。如果根本沒有,回傳 [−1, −1]。要用 O(log n)。',
  statement: '給**非遞減**排序的陣列 `nums` 和 `target`,回傳 target 的起始與結束位置 `[first, last]`;不存在則回傳 `[-1, -1]`。必須 O(log n)。',
  examples: [
    { input: 'nums = [5,7,7,8,8,10], target = 8', output: '[3,4]' },
    { input: 'nums = [5,7,7,8,8,10], target = 6', output: '[-1,-1]' },
    { input: 'nums = [], target = 0', output: '[-1,-1]' },
  ],
  constraints: ['n ≤ 10⁵', '必須 O(log n)'],
  insight: ['第一個位置 = 第一個 ≥ target 的位置', '最後一個位置 = 第一個 > target 的位置 − 1 = lowerBound(target + 1) − 1', '所以只要寫一個 lowerBound 用兩次'],
  approaches: [
    {
      name: '兩次 lower bound',
      idea: '`L = lb(target)`、`R = lb(target + 1) − 1`;`L == n or nums[L] != target` → [−1, −1]。',
      steps: ['`lb(x)`:二分找第一個 ≥ x 的位置', '`L = lb(target)`;不存在就回傳 [−1, −1]', '`R = lb(target + 1) − 1`', '回傳 [L, R]'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: twoFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '兩次二分。' },
      verdict: '最推薦。一個 lowerBound 寫熟了,first / last / 個數(R − L + 1)全部都能算。',
      code: {
        python: `def searchRange(nums, target):
    def lb(x):                                # 第一個 ≥ x 的位置
        lo, hi = 0, len(nums)
        while lo < hi:
            m = (lo + hi) // 2
            if nums[m] < x:
                lo = m + 1
            else:
                hi = m
        return lo

    L = lb(target)
    if L == len(nums) or nums[L] != target:
        return [-1, -1]
    return [L, lb(target + 1) - 1]            # 第一個 > target 的前一格`,
        c: `static int lb(int *a, int n, long long x) {
    int lo = 0, hi = n;
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        if (a[m] < x) lo = m + 1;
        else hi = m;
    }
    return lo;
}

int *searchRange(int *nums, int numsSize, int target, int *returnSize) {
    int *res = malloc(2 * sizeof(int));
    *returnSize = 2;
    int L = lb(nums, numsSize, target);
    if (L == numsSize || nums[L] != target) { res[0] = res[1] = -1; return res; }
    res[0] = L;
    res[1] = lb(nums, numsSize, (long long)target + 1) - 1;   // target + 1 可能超過 int
    return res;
}`,
        cpp: `vector<int> searchRange(vector<int>& nums, int target) {
    auto L = lower_bound(nums.begin(), nums.end(), target);
    if (L == nums.end() || *L != target) return {-1, -1};
    auto R = upper_bound(nums.begin(), nums.end(), target);   // 第一個 > target
    return {int(L - nums.begin()), int(R - nums.begin()) - 1};
}`,
        java: `int[] searchRange(int[] nums, int target) {
    int L = lb(nums, target);
    if (L == nums.length || nums[L] != target) return new int[]{-1, -1};
    return new int[]{L, lb(nums, (long) target + 1) - 1};
}

private int lb(int[] a, long x) {
    int lo = 0, hi = a.length;
    while (lo < hi) {
        int m = (lo + hi) >>> 1;
        if (a[m] < x) lo = m + 1;
        else hi = m;
    }
    return lo;
}`,
        javascript: `function searchRange(nums, target) {
  const lb = (x) => {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (nums[m] < x) lo = m + 1;
      else hi = m;
    }
    return lo;
  };
  const L = lb(target);
  if (L === nums.length || nums[L] !== target) return [-1, -1];
  return [L, lb(target + 1) - 1];
}`,
      },
    },
    {
      name: '線性掃描',
      idea: '從左找第一個等於 target 的、從右找最後一個。',
      steps: ['`L` = 從左第一個 `== target` 的索引(沒有 → [−1, −1])', '`R` = 從右第一個 `== target` 的索引', '回傳 [L, R]'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: linFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞看完整個陣列。' },
      verdict: '不符合 O(log n) 的要求。另一個常見錯誤是「二分找到一個,再往左右擴張」:全部相同時也會退化成 O(n)。',
      code: {
        python: `def searchRange(nums, target):
    L = next((i for i, x in enumerate(nums) if x == target), -1)
    if L == -1:
        return [-1, -1]
    R = next(i for i in range(len(nums) - 1, -1, -1) if nums[i] == target)
    return [L, R]`,
        c: `int *searchRange(int *nums, int numsSize, int target, int *returnSize) {
    int *res = malloc(2 * sizeof(int));
    *returnSize = 2;
    res[0] = res[1] = -1;
    for (int i = 0; i < numsSize; i++) if (nums[i] == target) { res[0] = i; break; }
    for (int i = numsSize - 1; i >= 0; i--) if (nums[i] == target) { res[1] = i; break; }
    return res;
}`,
        cpp: `vector<int> searchRange(vector<int>& nums, int target) {
    int L = -1, R = -1;
    for (int i = 0; i < (int)nums.size(); i++) if (nums[i] == target) { L = i; break; }
    for (int i = nums.size() - 1; i >= 0; i--) if (nums[i] == target) { R = i; break; }
    return {L, R};
}`,
        java: `int[] searchRange(int[] nums, int target) {
    int L = -1, R = -1;
    for (int i = 0; i < nums.length; i++) if (nums[i] == target) { L = i; break; }
    for (int i = nums.length - 1; i >= 0; i--) if (nums[i] == target) { R = i; break; }
    return new int[]{L, R};
}`,
        javascript: `function searchRange(nums, target) {
  return [nums.indexOf(target), nums.lastIndexOf(target)];
}`,
      },
    },
  ],
  pitfalls: ['二分找到一個 target 後往兩邊線性擴張:最壞 O(n)', '`target + 1` 在 C/Java 遇到 target = 2³¹ − 1 會溢位', '空陣列時 `nums[L]` 越界,要先檢查 `L == n`'],
  check: {
    kind: 'fn',
    fn: 'searchRange',
    cases: [
      { args: [[5, 7, 7, 8, 8, 10], 8], out: [3, 4] },
      { args: [[5, 7, 7, 8, 8, 10], 6], out: [-1, -1] },
      { args: [[], 0], out: [-1, -1] },
      { args: [A, T], out: [3, 5] },
      { args: [[2, 2], 2], out: [0, 1] },
      { args: [[2147483647], 2147483647], out: [0, 0] },
    ],
  },
}
