import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 81. Search in Rotated Sorted Array II

const A = [2, 5, 6, 0, 0, 1, 2]
const T = 0
const DUP = [1, 0, 1, 1, 1]

function bsFig(): FigStep[] {
  let lo = 0
  let hi = A.length - 1
  const out: FigStep[] = [{ note: '旋轉過的排序陣列:從中間切開,至少有一半是排好序的([33](#/q/33) 的想法)。看那一半有沒有包含 target,決定往哪邊找', views: [arr(A, { label: 'nums' })] }]
  while (lo <= hi) {
    const m = (lo + hi) >> 1
    if (A[m] === T) {
      out.push({ note: `nums[${m}] = ${T},找到了 → true`, views: [arr(A, { label: 'nums', range: [lo, hi], done: [m] })] })
      break
    }
    let note: string
    if (A[lo] === A[m] && A[m] === A[hi]) {
      note = `nums[lo] = nums[m] = nums[hi] = ${A[m]}:分不出哪半有序,只能兩端各縮一格`
      out.push({ note, views: [arr(A, { label: 'nums', range: [lo, hi], highlight: [m], dim: [lo, hi] })] })
      lo++
      hi--
    } else if (A[lo] <= A[m]) {
      const inLeft = A[lo] <= T && T < A[m]
      note = `左半 [${lo}..${m}] 有序(${A[lo]} ≤ ${A[m]}),target ${inLeft ? '在' : '不在'}裡面 → ${inLeft ? '往左' : '往右'}`
      out.push({ note, views: [arr(A, { label: 'nums', range: [lo, hi], highlight: [m] })] })
      if (inLeft) hi = m - 1
      else lo = m + 1
    } else {
      const inRight = A[m] < T && T <= A[hi]
      note = `右半 [${m}..${hi}] 有序(${A[m]} ≤ ${A[hi]}),target ${inRight ? '在' : '不在'}裡面 → ${inRight ? '往右' : '往左'}`
      out.push({ note, views: [arr(A, { label: 'nums', range: [lo, hi], highlight: [m] })] })
      if (inRight) lo = m + 1
      else hi = m - 1
    }
  }
  out.push({ note: `有重複時的麻煩例子 [${DUP}]:lo、m、hi 都是 1,根本看不出 0 藏在哪一半 → 只能 lo++、hi−−。全部一樣的時候會退化成 O(n)`, views: [arr(DUP, { label: 'nums', highlight: [0, 2, 4] })] })
  return out
}

function linFig(): FigStep[] {
  return [
    { note: '直接從頭找到尾:有重複時,二分最壞也是 O(n),線性掃描反而最單純', views: [arr(A, { label: 'nums', dim: [0, 1, 2] })] },
    { note: '找到 nums[3] = 0 → true', views: [arr(A, { label: 'nums', done: [3] })] },
  ]
}

export const q0081: Solution = {
  id: 81,
  plain: '一排排好序的數字(可能有重複)被「轉了一下」,例如 [0,0,1,2,2,5,6] 變成 [2,5,6,0,0,1,2]。判斷 target 在不在裡面。',
  statement: '給一個非遞減排序、但在某個未知位置被旋轉過的陣列 `nums`(**可能有重複值**),以及 `target`。若 target 在 nums 中回傳 true,否則 false。盡量減少操作步驟。',
  examples: [
    { input: 'nums = [2,5,6,0,0,1,2], target = 0', output: 'true' },
    { input: 'nums = [2,5,6,0,0,1,2], target = 3', output: 'false' },
  ],
  constraints: ['n ≤ 5000', 'Follow-up:重複值會怎麼影響時間複雜度?'],
  insight: ['沒有重複時([33](#/q/33)):切一半,至少一半有序,看 target 在不在有序那半', '有重複時多一種情況:`nums[lo] == nums[m] == nums[hi]`,分不出哪半有序', '這時只能把兩端各縮一格(它們都不是 target),最壞退化成 O(n)'],
  approaches: [
    {
      name: '二分搜尋 + 處理重複',
      idea: '和 33 題一樣判斷哪半有序;三個值相等時 `lo += 1`、`hi −= 1`。',
      steps: ['`while lo <= hi`:`m = (lo + hi) // 2`;等於 target → true', '`nums[lo] == nums[m] == nums[hi]` → `lo += 1`、`hi -= 1`', '`nums[lo] <= nums[m]`(左半有序)→ target 在 `[nums[lo], nums[m])` 就往左,否則往右', '否則右半有序 → target 在 `(nums[m], nums[hi]]` 就往右,否則往左'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: bsFig() },
      complexity: { time: '平均 O(log n),最壞 O(n)', space: 'O(1)', why: '全部相同時每輪只能縮兩格。' },
      verdict: '最推薦。Follow-up 的答案:重複值讓「判斷哪半有序」可能失敗,最壞時間從 O(log n) 變成 O(n)。',
      code: {
        python: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        m = (lo + hi) // 2
        if nums[m] == target:
            return True
        if nums[lo] == nums[m] == nums[hi]:
            lo += 1                           # 分不出哪半有序,兩端各縮一格
            hi -= 1
        elif nums[lo] <= nums[m]:             # 左半有序
            if nums[lo] <= target < nums[m]:
                hi = m - 1
            else:
                lo = m + 1
        else:                                 # 右半有序
            if nums[m] < target <= nums[hi]:
                lo = m + 1
            else:
                hi = m - 1
    return False`,
        c: `bool search(int *nums, int numsSize, int target) {
    int lo = 0, hi = numsSize - 1;
    while (lo <= hi) {
        int m = (lo + hi) / 2;
        if (nums[m] == target) return true;
        if (nums[lo] == nums[m] && nums[m] == nums[hi]) { lo++; hi--; }
        else if (nums[lo] <= nums[m]) {
            if (nums[lo] <= target && target < nums[m]) hi = m - 1;
            else lo = m + 1;
        } else {
            if (nums[m] < target && target <= nums[hi]) lo = m + 1;
            else hi = m - 1;
        }
    }
    return false;
}`,
        cpp: `bool search(vector<int>& nums, int target) {
    int lo = 0, hi = nums.size() - 1;
    while (lo <= hi) {
        int m = (lo + hi) / 2;
        if (nums[m] == target) return true;
        if (nums[lo] == nums[m] && nums[m] == nums[hi]) { lo++; hi--; }
        else if (nums[lo] <= nums[m]) {
            if (nums[lo] <= target && target < nums[m]) hi = m - 1;
            else lo = m + 1;
        } else {
            if (nums[m] < target && target <= nums[hi]) lo = m + 1;
            else hi = m - 1;
        }
    }
    return false;
}`,
        java: `boolean search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int m = (lo + hi) / 2;
        if (nums[m] == target) return true;
        if (nums[lo] == nums[m] && nums[m] == nums[hi]) { lo++; hi--; }
        else if (nums[lo] <= nums[m]) {
            if (nums[lo] <= target && target < nums[m]) hi = m - 1;
            else lo = m + 1;
        } else {
            if (nums[m] < target && target <= nums[hi]) lo = m + 1;
            else hi = m - 1;
        }
    }
    return false;
}`,
        javascript: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (nums[m] === target) return true;
    if (nums[lo] === nums[m] && nums[m] === nums[hi]) {
      lo++;
      hi--;
    } else if (nums[lo] <= nums[m]) {
      if (nums[lo] <= target && target < nums[m]) hi = m - 1;
      else lo = m + 1;
    } else {
      if (nums[m] < target && target <= nums[hi]) lo = m + 1;
      else hi = m - 1;
    }
  }
  return false;
}`,
      },
    },
    {
      name: '線性掃描',
      idea: '逐一比較。',
      steps: ['`return target in nums`'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: linFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞看完整個陣列。' },
      verdict: '最壞情況和二分版一樣是 O(n)。面試時要能說明為什麼重複值讓二分最壞無法比 O(n) 更好。',
      code: {
        python: `def search(nums, target):
    return target in nums`,
        c: `bool search(int *nums, int numsSize, int target) {
    for (int i = 0; i < numsSize; i++) if (nums[i] == target) return true;
    return false;
}`,
        cpp: `bool search(vector<int>& nums, int target) {
    return find(nums.begin(), nums.end(), target) != nums.end();
}`,
        java: `boolean search(int[] nums, int target) {
    for (int x : nums) if (x == target) return true;
    return false;
}`,
        javascript: `function search(nums, target) {
  return nums.includes(target);
}`,
      },
    },
  ],
  pitfalls: ['直接套 33 題的程式:遇到 [1,0,1,1,1] 這種 nums[lo] == nums[m] 的情況會判斷錯哪半有序', '縮兩端前沒先檢查 nums[m] == target'],
  check: {
    kind: 'fn',
    fn: 'search',
    cases: [
      { args: [A, T], out: true },
      { args: [A, 3], out: false },
      { args: [DUP, 0], out: true },
      { args: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 13], out: true },
      { args: [[1], 0], out: false },
      { args: [[3, 1], 1], out: true },
    ],
  },
}
