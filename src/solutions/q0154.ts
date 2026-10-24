import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [2, 2, 2, 0, 1]
const scanFig: FigStep[] = [
  { note: '先把第一個 2 當目前最小值。', views: [arr(A, { label: 'nums', highlight: [0] })] },
  { note: '接下來兩個 2 沒有變小，最小值仍是 2。', views: [arr(A, { label: 'nums', done: [0, 1], highlight: [2] })] },
  { note: '讀到 0，更新最小值為 0。', views: [arr(A, { label: 'nums', done: [0, 1, 2], highlight: [3] })] },
  { note: '最後的 1 也不會再降低答案，所以回傳 0。', views: [arr(A, { label: 'nums', done: [3], highlight: [4] }), arr([0], { label: '最小值' })] },
]
const binaryFig: FigStep[] = [
  { note: '範圍 [0,4]；中點索引 2 是 2，右端索引 4 是 1。2>1，最小值一定在右半段，左界移到 3。', views: [arr(A, { label: 'nums', compare: [2, 4], dim: [0, 1] })] },
  { note: '範圍 [3,4]；中點索引 3 是 0，右端是 1。0<1，最小值可能就是中點，右界移到 3。', views: [arr(A, { label: 'nums', compare: [3, 4], dim: [0, 1, 2] })] },
  { note: '左右界相遇於索引 3，值為 0。', views: [arr(A, { label: 'nums', highlight: [3], dim: [0, 1, 2, 4] })] },
  { note: '若中點與右端一樣，只能把右界減 1：相等值無法判斷最小值在哪邊。', views: [arr([1, 0, 1, 1, 1], { label: '重複值例子', compare: [2, 4] })] },
]

export const q0154: Solution = {
  id: 154,
  plain: '原本排好序的數列被轉了一圈，且數字可能重複；找出最小的那個數。',
  statement: '給非遞減排序後旋轉過的陣列 nums，元素可以重複。回傳最小值。',
  examples: [{ input: 'nums = [1,3,5]', output: '1' }, { input: 'nums = [2,2,2,0,1]', output: '0' }, { input: 'nums = [3,3,1,3]', output: '1' }],
  constraints: ['至少一個元素。', '重複元素會讓二分搜尋的最壞時間退化到 O(n)。'],
  insight: ['線性掃描一定能找到最小值。', '若中點比右端大，轉折點必在右邊；若更小，最小值在左半段含中點。', '相等時無法判斷方向，但丟掉一個與中點相等的右端元素不會漏掉最小值。參考 [153](#/q/153)。'],
  approaches: [
    {
      name: '線性掃描', idea: '保留目前看過的最小值，走完整個陣列。',
      steps: ['先以第一個元素作為答案。', '逐個比較，遇到更小值就更新。', '回傳答案。'],
      figure: { title: 'nums = [2,2,2,0,1]', steps: scanFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素比較一次。' },
      verdict: '穩定且簡單；不利用旋轉排序的結構。',
      code: {
        python: `def findMin(nums):
    answer = nums[0]
    for value in nums[1:]:
        answer = min(answer, value)  # 保留目前最小值
    return answer`,
        c: `int findMin(int *nums, int numsSize) {
    int answer = nums[0];
    for (int i = 1; i < numsSize; i++) {
        if (nums[i] < answer) {
            answer = nums[i];
        }
    }
    return answer;
}`,
        cpp: `int findMin(vector<int>& nums) {
    int answer = nums[0];
    for (int value : nums) {
        answer = min(answer, value);
    }
    return answer;
}`,
        java: `int findMin(int[] nums) {
    int answer = nums[0];
    for (int value : nums) {
        answer = Math.min(answer, value);
    }
    return answer;
}`,
        javascript: `function findMin(nums) {
  let answer = nums[0];
  for (const value of nums) {
    answer = Math.min(answer, value);
  }
  return answer;
}`,
      },
    },
    {
      name: '容許重複值的二分搜尋', idea: '比較中點與右端值，縮小仍可能包含最小值的範圍。',
      steps: ['設 left=0、right=n−1。', 'nums[mid]>nums[right] 時移到右半；小於時保留左半含 mid。', '相等時 right 減一。', '兩界相遇就得到最小值。'],
      figure: { title: 'nums = [2,2,2,0,1]', steps: binaryFig },
      complexity: { time: '平均 O(log n)，最壞 O(n)', space: 'O(1)', why: '可判斷方向時砍半；全是重複值時只能逐個縮右界。' },
      verdict: '推薦掌握重複值如何影響 [[p:binary-search]] 的判斷。',
      code: {
        python: `def findMin(nums):
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1  # 最小值在右半
        elif nums[mid] < nums[right]:
            right = mid  # 中點也可能是最小值
        else:
            right -= 1  # 相等時只能安全丟掉一個
    return nums[left]`,
        c: `int findMin(int *nums, int numsSize) {
    int left = 0;
    int right = numsSize - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else if (nums[mid] < nums[right]) {
            right = mid;
        } else {
            right--;
        }
    }
    return nums[left];
}`,
        cpp: `int findMin(vector<int>& nums) {
    int left = 0;
    int right = nums.size() - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else if (nums[mid] < nums[right]) {
            right = mid;
        } else {
            right--;
        }
    }
    return nums[left];
}`,
        java: `int findMin(int[] nums) {
    int left = 0;
    int right = nums.length - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else if (nums[mid] < nums[right]) {
            right = mid;
        } else {
            right--;
        }
    }
    return nums[left];
}`,
        javascript: `function findMin(nums) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > nums[right]) {
      left = mid + 1;
    } else if (nums[mid] < nums[right]) {
      right = mid;
    } else {
      right--;
    }
  }
  return nums[left];
}`,
      },
    },
  ],
  pitfalls: ['相等時不可直接把整個右半丟掉，最小值可能就在其中。', '小於右端時要保留 mid，不能設 right=mid−1。'],
  check: { kind: 'fn', fn: 'findMin', cases: [
    { args: [[1, 3, 5]], out: 1 },
    { args: [A], out: 0 },
    { args: [[3, 3, 1, 3]], out: 1 },
    { args: [[2, 2, 2]], out: 2 },
  ] },
}
