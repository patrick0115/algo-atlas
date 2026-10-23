import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 724. Find Pivot Index

const A = [1, 7, 3, 6, 5, 6]

function prefixFig(): FigStep[] {
  const total = A.reduce((a, b) => a + b, 0)
  let left = 0
  const out: FigStep[] = [{ note: `先算總和 = ${total}。走到位置 i 時,左邊的和 left 已經知道,右邊的和 = 總和 − left − nums[i],不用再加一遍`, views: [arr(A, { label: 'nums' })] }]
  for (let i = 0; i < A.length; i++) {
    const right = total - left - A[i]
    const hit = left === right
    out.push({ note: `i = ${i}:左邊 ${left},右邊 ${total} − ${left} − ${A[i]} = ${right} → ${hit ? '相等!答案 ' + i : '不相等'}`, views: [arr(A, { label: 'nums', highlight: [i], range: [0, i - 1], done: hit ? [i] : [] })] })
    if (hit) break
    left += A[i]
  }
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:每個位置 i 都把左邊、右邊各加一遍再比較', views: [arr(A, { label: 'i = 1', highlight: [1], compare: [0, 2, 3, 4, 5] })] },
    { note: 'i = 3:左邊 1+7+3 = 11,右邊 5+6 = 11 → 答案 3。每個位置 O(n),總共 O(n²)', views: [arr(A, { label: 'i = 3', highlight: [3], done: [0, 1, 2, 4, 5] })] },
  ]
}

export const q0724: Solution = {
  id: 724,
  plain: '找一個「支點」位置:它左邊所有數加起來,剛好等於它右邊所有數加起來(支點自己不算)。像蹺蹺板找平衡點。有好幾個就回傳最左邊的,沒有就回傳 −1。',
  statement: '給整數陣列 `nums`,回傳最左邊的**樞紐索引**:該位置左側所有元素的和等於右側所有元素的和(邊界時一側視為 0)。不存在則回傳 −1。',
  examples: [
    { input: 'nums = [1,7,3,6,5,6]', output: '3', note: '1+7+3 = 11 = 5+6' },
    { input: 'nums = [1,2,3]', output: '-1' },
    { input: 'nums = [2,1,-1]', output: '0', note: '左邊沒東西 = 0,右邊 1+(−1) = 0' },
  ],
  constraints: ['n ≤ 10⁴', '值可以是負數 → 不能用「和只會變大」的雙指標'],
  insight: ['右邊的和 = 總和 − 左邊的和 − nums[i]', '所以先算總和,再掃一遍維護左邊的和就好', '這就是[[p:prefix-sum]],只是用一個變數取代整個陣列'],
  approaches: [
    {
      name: '總和 + 左邊累加',
      idea: '`total = sum(nums)`;掃過去時 `left == total − left − nums[i]` 就回傳 i。',
      steps: ['`total = sum(nums)`、`left = 0`', '`for i`:`left == total − left − nums[i]` → 回傳 i', '`left += nums[i]`', '回傳 −1'],
      figure: { title: `nums = [${A}]`, steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩次掃描(一次算總和),只用兩個變數。' },
      verdict: '最推薦。檢查要在 `left += nums[i]` **之前**,因為 nums[i] 自己不屬於左邊。',
      code: {
        python: `def pivotIndex(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:          # 右邊 = 總和 − 左邊 − 自己
            return i
        left += x
    return -1`,
        c: `int pivotIndex(int *nums, int numsSize) {
    int total = 0, left = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    for (int i = 0; i < numsSize; i++) {
        if (left == total - left - nums[i]) return i;
        left += nums[i];
    }
    return -1;
}`,
        cpp: `int pivotIndex(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0), left = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (left == total - left - nums[i]) return i;
        left += nums[i];
    }
    return -1;
}`,
        java: `int pivotIndex(int[] nums) {
    int total = 0, left = 0;
    for (int x : nums) total += x;
    for (int i = 0; i < nums.length; i++) {
        if (left == total - left - nums[i]) return i;
        left += nums[i];
    }
    return -1;
}`,
        javascript: `function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}`,
      },
    },
    {
      name: '暴力:每個位置左右各加一遍',
      idea: '對每個 i,`sum(nums[:i]) == sum(nums[i+1:])` 就回傳。',
      steps: ['`for i`:算左邊和、右邊和', '相等就回傳 i', '都不相等回傳 −1'],
      figure: { title: `nums = [${A}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個位置重新加 n 個數。' },
      verdict: 'n = 10⁴ 時約 10⁸ 次加法,勉強。用來對照「重複計算」被前綴和省掉了多少。',
      code: {
        python: `def pivotIndex(nums):
    for i in range(len(nums)):
        if sum(nums[:i]) == sum(nums[i + 1:]):
            return i
    return -1`,
        c: `int pivotIndex(int *nums, int numsSize) {
    for (int i = 0; i < numsSize; i++) {
        int l = 0, r = 0;
        for (int j = 0; j < i; j++) l += nums[j];
        for (int j = i + 1; j < numsSize; j++) r += nums[j];
        if (l == r) return i;
    }
    return -1;
}`,
        cpp: `int pivotIndex(vector<int>& nums) {
    for (int i = 0; i < (int)nums.size(); i++) {
        int l = accumulate(nums.begin(), nums.begin() + i, 0);
        int r = accumulate(nums.begin() + i + 1, nums.end(), 0);
        if (l == r) return i;
    }
    return -1;
}`,
        java: `int pivotIndex(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        int l = 0, r = 0;
        for (int j = 0; j < i; j++) l += nums[j];
        for (int j = i + 1; j < nums.length; j++) r += nums[j];
        if (l == r) return i;
    }
    return -1;
}`,
        javascript: `function pivotIndex(nums) {
  for (let i = 0; i < nums.length; i++) {
    let l = 0, r = 0;
    for (let j = 0; j < i; j++) l += nums[j];
    for (let j = i + 1; j < nums.length; j++) r += nums[j];
    if (l === r) return i;
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['先 `left += nums[i]` 再比較:把自己算進左邊了', '以為邊界不能當答案:i = 0 時左邊和是 0,也可能成立'],
  check: {
    kind: 'fn',
    fn: 'pivotIndex',
    cases: [
      { args: [A], out: 3 },
      { args: [[1, 2, 3]], out: -1 },
      { args: [[2, 1, -1]], out: 0 },
      { args: [[-1, -1, 0, 1, 1, 0]], out: 5 },
      { args: [[0]], out: 0 },
    ],
  },
}
