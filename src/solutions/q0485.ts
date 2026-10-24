import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [1, 1, 0, 1, 1, 1]

export const q0485: Solution = {
  id: 485,
  plain: '在只有 0 和 1 的陣列裡，找最長的一整段連續 1。',
  statement: '給二元陣列 nums，回傳最長連續 1 的個數。',
  examples: [{ input: 'nums = [1,1,0,1,1,1]', output: '3' }, { input: 'nums = [1,0,1,1,0,1]', output: '2' }],
  constraints: ['`1 ≤ nums.length ≤ 10⁵`，元素只會是 0 或 1。'],
  insight: ['0 會把連續的 1 截斷。', '可以在每段結束時計算長度，也可以每讀一個 1 就更新目前長度。', '一次掃描足夠，屬於 [[p:simulation]]。'],
  approaches: [
    {
      name: '記錄每段起點',
      idea: '遇到 1 記下段落起點；遇到 0 或陣列結尾時計算該段長度。',
      steps: ['start 初始為 −1', '遇到 1 且尚無段落就設 start', '遇到 0 時用 `i−start` 更新答案並清空 start', '結尾若仍在 1 的段落，再計算一次'],
      figure: { title: 'nums = [1,1,0,1,1,1]', steps: [
        { note: '索引 0 遇到 1，第一段從 0 開始。', views: [arr(A, { highlight: [0] }), arr([0], { label: 'start' })] },
        { note: '索引 2 是 0，第一段 [1,1] 長度 2，記下最佳值。', views: [arr(A, { done: [0, 1], highlight: [2] }), arr([2], { label: '最佳' })] },
        { note: '索引 3 又遇到 1，第二段從 3 開始。', views: [arr(A, { highlight: [3] }), arr([3], { label: 'start' })] },
        { note: '陣列結尾仍是 1，第二段長度 6−3=3，更新答案。', views: [arr(A, { done: [3, 4, 5] }), arr([3], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素只看一次。' },
      verdict: '清楚標示每段邊界；要記得處理尾端。',
      code: {
        python: `def findMaxConsecutiveOnes(nums):
    start = -1
    best = 0
    for i, value in enumerate(nums):
        if value == 1 and start == -1:
            start = i
        if value == 0 and start != -1:
            best = max(best, i - start)  # 這一段到 0 前結束
            start = -1
    if start != -1:
        best = max(best, len(nums) - start)
    return best`,
        c: `int findMaxConsecutiveOnes(int *nums, int numsSize) {
    int start = -1, best = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] == 1 && start == -1) start = i;
        if (nums[i] == 0 && start != -1) {
            if (i - start > best) best = i - start;
            start = -1;
        }
    }
    if (start != -1 && numsSize - start > best) best = numsSize - start;
    return best;
}`,
        cpp: `int findMaxConsecutiveOnes(vector<int>& nums) {
    int start = -1, best = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == 1 && start == -1) start = i;
        if (nums[i] == 0 && start != -1) {
            best = max(best, i - start);
            start = -1;
        }
    }
    if (start != -1) best = max(best, (int)nums.size() - start);
    return best;
}`,
        java: `int findMaxConsecutiveOnes(int[] nums) {
    int start = -1, best = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == 1 && start == -1) start = i;
        if (nums[i] == 0 && start != -1) {
            best = Math.max(best, i - start);
            start = -1;
        }
    }
    if (start != -1) best = Math.max(best, nums.length - start);
    return best;
}`,
        javascript: `function findMaxConsecutiveOnes(nums) {
  let start = -1, best = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === 1 && start === -1) start = i;
    if (nums[i] === 0 && start !== -1) {
      best = Math.max(best, i - start);
      start = -1;
    }
  }
  if (start !== -1) best = Math.max(best, nums.length - start);
  return best;
}`,
      },
    },
    {
      name: '目前長度即時更新',
      idea: '看到 1 就增加目前長度並更新最佳；看到 0 就歸零。',
      steps: ['cur、best 初始為 0', '讀到 1：cur 加 1，best 取較大', '讀到 0：cur 歸零'],
      figure: { title: 'nums = [1,1,0,1,1,1]', steps: [
        { note: '前兩個 1 使目前長度依序成 1、2，最佳是 2。', views: [arr(A, { done: [0, 1] }), arr([2, 2], { label: 'cur / best' })] },
        { note: '讀到 0，連續片段中斷，cur 清為 0；best 保留 2。', views: [arr(A, { highlight: [2] }), arr([0, 2], { label: 'cur / best' })] },
        { note: '後面兩個 1 使 cur 再成 1、2。', views: [arr(A, { done: [3, 4] }), arr([2, 2], { label: 'cur / best' })] },
        { note: '最後一個 1 使 cur、best 都成 3；直接回傳。', views: [arr(A, { done: [3, 4, 5] }), arr([3, 3], { label: 'cur / best', done: [1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描，只存兩個計數。' },
      verdict: '推薦；更新答案的時機很單純。',
      code: {
        python: `def findMaxConsecutiveOnes(nums):
    cur = best = 0
    for value in nums:
        if value == 1:
            cur += 1  # 延長目前這段 1
            best = max(best, cur)
        else:
            cur = 0
    return best`,
        c: `int findMaxConsecutiveOnes(int *nums, int numsSize) {
    int cur = 0, best = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] == 1) {
            cur++;
            if (cur > best) best = cur;
        } else {
            cur = 0;
        }
    }
    return best;
}`,
        cpp: `int findMaxConsecutiveOnes(vector<int>& nums) {
    int cur = 0, best = 0;
    for (int value : nums) {
        if (value == 1) {
            cur++;
            best = max(best, cur);
        } else {
            cur = 0;
        }
    }
    return best;
}`,
        java: `int findMaxConsecutiveOnes(int[] nums) {
    int cur = 0, best = 0;
    for (int value : nums) {
        if (value == 1) {
            cur++;
            best = Math.max(best, cur);
        } else {
            cur = 0;
        }
    }
    return best;
}`,
        javascript: `function findMaxConsecutiveOnes(nums) {
  let cur = 0, best = 0;
  for (const value of nums) {
    if (value === 1) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['起點法要處理「陣列以 1 結尾」的最後一段。'],
  check: { kind: 'fn', fn: 'findMaxConsecutiveOnes', cases: [
    { args: [A], out: 3 },
    { args: [[1, 0, 1, 1, 0, 1]], out: 2 },
    { args: [[0, 0]], out: 0 },
  ] },
}
