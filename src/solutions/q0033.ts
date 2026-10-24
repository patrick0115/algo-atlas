import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 33. Search in Rotated Sorted Array

const A = [15, 18, 22, 3, 6, 9, 11, 13]
const T = 6

function pivotFig(): FigStep[] {
  let lo = 0
  let hi = A.length - 1
  const out: FigStep[] = [{ note: '第一步:像 153 題一樣,用二分找到最小值的位置(旋轉點),把陣列切成兩段各自有序', views: [arr(A, { label: 'nums', mode: 'bars' })] }]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const right = A[mid] > A[hi]
    out.push({ note: `nums[mid] = ${A[mid]} ${right ? '>' : '<'} nums[hi] = ${A[hi]} → ${right ? 'lo = mid + 1' : 'hi = mid'}`, views: [arr(A, { label: 'nums', mode: 'bars', range: [lo, hi], compare: [mid, hi] })] })
    if (right) lo = mid + 1
    else hi = mid
  }
  const p = lo
  const inRight = T >= A[p] && T <= A[A.length - 1]
  const [a, b] = inRight ? [p, A.length - 1] : [0, p - 1]
  out.push({ note: `旋轉點在 ${p}(值 ${A[p]})。target = ${T} ${inRight ? `介於 ${A[p]} 和 ${A[A.length - 1]} 之間 → 在右段` : '→ 在左段'} [${a}, ${b}]`, views: [arr(A, { label: 'nums', mode: 'bars', highlight: [p], range: [a, b] })] })
  lo = a
  hi = b
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (A[mid] === T) {
      out.push({ note: `第二步:在 [${a}, ${b}] 普通二分,nums[${mid}] = ${A[mid]} = target → 回傳 ${mid}`, views: [arr(A, { label: 'nums', mode: 'bars', highlight: [mid], range: [lo, hi] })] })
      return out
    }
    out.push({ note: `第二步:nums[${mid}] = ${A[mid]} ${A[mid] < T ? '太小,往右' : '太大,往左'}`, views: [arr(A, { label: 'nums', mode: 'bars', compare: [mid], range: [lo, hi] })] })
    if (A[mid] < T) lo = mid + 1
    else hi = mid - 1
  }
  return out
}

function oneFig(): FigStep[] {
  let lo = 0
  let hi = A.length - 1
  const view = (mid?: number, opt: Parameters<typeof arr>[1] = {}) =>
    arr(A, {
      label: 'nums',
      mode: 'bars',
      range: [lo, hi],
      dim: [...range(0, lo - 1), ...range(hi + 1, A.length - 1)],
      pointers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi, color: 'b' }, ...(mid !== undefined ? [{ name: 'mid', index: mid, color: 'c' as const }] : [])],
      ...opt,
    })
  const out: FigStep[] = [{ note: '一次二分:切成 [lo, mid] 和 [mid, hi] 兩半,**一定有一半是有序的**。先判斷哪半有序,再看 target 在不在那半的範圍裡', views: [view()] }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (A[mid] === T) {
      out.push({ note: `nums[mid] = ${A[mid]} = target → 回傳 ${mid}`, views: [view(mid, { highlight: [mid] })] })
      return out
    }
    if (A[lo] <= A[mid]) {
      const inside = A[lo] <= T && T < A[mid]
      out.push({ note: `nums[lo] = ${A[lo]} ≤ nums[mid] = ${A[mid]} → **左半 [${lo}, ${mid}] 有序**。target ${T} ${inside ? `在 [${A[lo]}, ${A[mid]}) 裡 → 往左,hi = mid − 1` : `不在 [${A[lo]}, ${A[mid]}) 裡 → 往右,lo = mid + 1`}`, views: [view(mid, { compare: range(lo, mid) })] })
      if (inside) hi = mid - 1
      else lo = mid + 1
    } else {
      const inside = A[mid] < T && T <= A[hi]
      out.push({ note: `nums[lo] = ${A[lo]} > nums[mid] = ${A[mid]} → 斷崖在左半,所以**右半 [${mid}, ${hi}] 有序**。target ${T} ${inside ? `在 (${A[mid]}, ${A[hi]}] 裡 → 往右,lo = mid + 1` : `不在 (${A[mid]}, ${A[hi]}] 裡 → 往左,hi = mid − 1`}`, views: [view(mid, { compare: range(mid, hi) })] })
      if (inside) lo = mid + 1
      else hi = mid - 1
    }
  }
  out.push({ note: '區間變空 → −1', views: [arr(A, { label: 'nums', mode: 'bars' })] })
  return out
}

export const q0033: Solution = {
  id: 33,
  plain: '在一條被「轉過一圈」的排序數字裡找某個數,例如在 4 5 6 7 0 1 2 裡找 0。雖然整條不是排好的,但切成兩半時,一定有一半是排好的。',
  statement:
    '一個由小到大排好、**沒有重複**的陣列,在某個位置被旋轉過(例如 `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`)。給旋轉後的陣列和 `target`,回傳 `target` 的索引,不在就回傳 `-1`。要 O(log n)。',
  examples: [
    { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
    { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
    { input: 'nums = [1], target = 0', output: '-1' },
  ],
  constraints: ['`1 ≤ n ≤ 5000`,值不重複', '要求 **O(log n)**'],
  insight: [
    '整個陣列不是有序的,不能直接二分。但它是**兩段有序**',
    '方法二:先用 [153](#/q/153) 的方法找到旋轉點,就知道兩段的範圍,再判斷 target 在哪一段、在那段裡二分 —— 兩次二分',
    '方法三:一次二分也行。從 mid 切開,左右兩半**至少有一半是完整有序的**(斷崖只有一個,只能在其中一半)。對有序的那半,用頭尾值就能判斷 target 在不在裡面',
  ],
  approaches: [
    {
      name: '線性掃描',
      idea: '從頭找到尾。',
      steps: ['`nums[i] == target` → 回傳 `i`', '走完 → `-1`'],
      figure: { title: `nums = [${A.join(',')}], target = ${T}`, steps: [{ note: '一個一個看,沒有用到「兩段有序」', views: [arr(A, { label: 'nums', mode: 'bars' })] }, { note: `看到第 4 格 = ${T} → 回傳 4`, views: [arr(A, { label: 'nums', mode: 'bars', highlight: [4], dim: range(0, 3) })] }] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞看完整個陣列。' },
      verdict: '不符合題目要求的 O(log n),只當 baseline。',
      code: {
        python: `def search(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1`,
        c: `int search(int *nums, int numsSize, int target) {
    for (int i = 0; i < numsSize; i++)
        if (nums[i] == target) return i;
    return -1;
}`,
        cpp: `int search(vector<int>& nums, int target) {
    auto it = find(nums.begin(), nums.end(), target);
    return it == nums.end() ? -1 : int(it - nums.begin());
}`,
        java: `int search(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++)
        if (nums[i] == target) return i;
    return -1;
}`,
        javascript: `function search(nums, target) {
  return nums.indexOf(target);
}`,
      },
    },
    {
      name: '先找旋轉點,再在一段裡二分',
      idea: '用「和右端比較」的二分找最小值的位置 `p`。`target` 介於 `nums[p]` 和 `nums[n−1]` 之間就在右段 `[p, n−1]`,否則在左段 `[0, p−1]`,在那段裡普通二分。',
      steps: ['二分找 `p`(最小值位置,同 153)', '`nums[p] ≤ target ≤ nums[n−1]` → 搜 `[p, n−1]`,否則搜 `[0, p−1]`', '在選定的區間做一般二分'],
      figure: { title: `nums = [${A.join(',')}], target = ${T}`, steps: pivotFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '兩次二分,各 O(log n)。' },
      verdict: '把問題拆成兩個會的子問題(153 + 704),比較不容易寫錯。面試時講得清楚也很加分。',
      code: {
        python: `def search(nums, target):
    n = len(nums)
    lo, hi = 0, n - 1
    while lo < hi:                        # 找最小值的位置(旋轉點)
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    p = lo
    if nums[p] <= target <= nums[n - 1]:
        lo, hi = p, n - 1                 # 在右段
    else:
        lo, hi = 0, p - 1                 # 在左段
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
        c: `int search(int *nums, int numsSize, int target) {
    int lo = 0, hi = numsSize - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    int p = lo;
    if (target >= nums[p] && target <= nums[numsSize - 1]) { lo = p; hi = numsSize - 1; }
    else { lo = 0; hi = p - 1; }
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
        cpp: `int search(vector<int>& nums, int target) {
    int n = nums.size(), lo = 0, hi = n - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    int p = lo;
    auto b = nums.begin(), e = nums.end();
    // 選定那一段之後,用 lower_bound 二分
    auto first = (target >= nums[p] && target <= nums[n - 1]) ? b + p : b;
    auto last = (target >= nums[p] && target <= nums[n - 1]) ? e : b + p;
    auto it = lower_bound(first, last, target);
    return it != last && *it == target ? int(it - b) : -1;
}`,
        java: `int search(int[] nums, int target) {
    int n = nums.length, lo = 0, hi = n - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    int p = lo;
    if (target >= nums[p] && target <= nums[n - 1]) { lo = p; hi = n - 1; }
    else { lo = 0; hi = p - 1; }
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
        javascript: `function search(nums, target) {
  const n = nums.length;
  let lo = 0, hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  const p = lo;
  if (target >= nums[p] && target <= nums[n - 1]) [lo, hi] = [p, n - 1];
  else [lo, hi] = [0, p - 1];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
      },
    },
    {
      name: '一次二分:判斷哪半邊有序',
      idea: '每次看 `mid`:`nums[lo] ≤ nums[mid]` 代表左半有序,否則右半有序。target 落在有序那半的範圍內就往那半走,否則往另一半。',
      steps: ['`nums[mid] == target` → 回傳', '`nums[lo] ≤ nums[mid]`(左半有序):`nums[lo] ≤ target < nums[mid]` → `hi = mid − 1`,否則 `lo = mid + 1`', '否則(右半有序):`nums[mid] < target ≤ nums[hi]` → `lo = mid + 1`,否則 `hi = mid − 1`'],
      figure: { title: `nums = [${A.join(',')}], target = ${T}`, steps: oneFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '一次二分,每步排除一半。' },
      verdict: '最常見的標準解,程式最短。重點是「只對有序的那半下判斷」:有序的那半可以用頭尾值確定 target 在不在,另一半不行。',
      code: {
        python: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:         # 左半 [lo, mid] 有序
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                             # 右半 [mid, hi] 有序
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
        c: `int search(int *nums, int numsSize, int target) {
    int lo = 0, hi = numsSize - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {          // 左半有序
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                              // 右半有序
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
        cpp: `int search(vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
        java: `int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
        javascript: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {          // 左半有序
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                              // 右半有序
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: [
    '`nums[lo] <= nums[mid]` 寫成 `<`:`lo == mid` 時(區間剩兩個),左半只有一個數也算有序,用 `<` 會判斷錯邊',
    '範圍判斷的開閉:左半有序時是 `nums[lo] ≤ target < nums[mid]`(mid 已經比過了),寫成 `≤ nums[mid]` 不會錯但多比一次',
    '對「沒有序的那半」下判斷:那半裡有斷崖,頭尾值不能代表範圍',
    '方法二找旋轉點後忘了處理「沒有旋轉」(p = 0):左段是空的 `[0, -1]`,程式要能正常處理空區間',
  ],
  followUp: [
    { q: '如果有重複的數?', a: '81. Search in Rotated Sorted Array II:`nums[lo] == nums[mid] == nums[hi]` 時分不出哪邊有序,只能 `lo++`、`hi--`,最壞 O(n)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'search',
    cases: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], out: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], out: -1 },
      { args: [[1], 0], out: -1 },
      { args: [[1], 1], out: 0 },
      { args: [A, T], out: 4 },
      { args: [A, 18], out: 1 },
      { args: [[3, 1], 1], out: 1 },
      { args: [[1, 3], 3], out: 1 },
      { args: [[5, 1, 3], 5], out: 0 },
    ],
  },
}
