import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 1, 0, 1]
const prefixFig: FigStep[] = [
  { note: '先記錄每格左邊連續 1 的數量：[0,1,2,0]。索引 2 左邊有兩個 1。', views: [arr(A, { label: 'nums', highlight: [2] }), arr([0, 1, 2, 0], { label: '左側連續 1' })] },
  { note: '再記每格右邊連續 1 的數量：[1,0,1,0]。索引 2 右邊有一個 1。', views: [arr([1, 0, 1, 0], { label: '右側連續 1', highlight: [2] })] },
  { note: '刪除索引 2 的 0，左右連起來：2+1=3。', views: [arr(A, { label: '刪除索引 2', dim: [2], done: [0, 1, 3] })] },
  { note: '比較刪除每個位置的結果，最大長度為 3。即使全是 1，也必須刪除一格。', views: [arr([3], { label: '答案', done: [0] })] },
]
const windowFig: FigStep[] = [
  { note: '視窗先看 [1,1]，其中有 0 個零；若刪一格，剩長度 1。', views: [arr(A, { label: '視窗', highlight: [0, 1] })] },
  { note: '右界加入 0，視窗 [1,1,0] 含一個零；刪掉它後有 2 個連續 1。', views: [arr(A, { label: '視窗', highlight: [0, 1, 2] })] },
  { note: '右界再加入 1，整段 [1,1,0,1] 仍只含一個零。視窗長 4，刪一格剩 3。', views: [arr(A, { label: '視窗', highlight: [0, 1, 2, 3] })] },
  { note: '沒有更多元素，答案 3。若出現第二個零，就移動左界直到只剩一個零。', views: [arr([3], { label: '答案', done: [0] })] },
]

export const q1493: Solution = {
  id: 1493,
  plain: '在 0/1 陣列中必須刪掉恰好一格，想讓剩下最長的一串 1 盡可能長。',
  statement: '給只含 0 和 1 的 nums。刪除恰好一個元素後，回傳最長連續 1 子陣列長度。',
  examples: [{ input: 'nums = [1,1,0,1]', output: '3' }, { input: 'nums = [0,1,1,1,0,1,1,0,1]', output: '5' }, { input: 'nums = [1,1,1]', output: '2' }],
  constraints: ['至少一個元素。', '全是 1 也必須刪一個，因此答案是 n−1。'],
  insight: ['刪掉位置 i 後，能接起來的 1 是它左邊連續長度加右邊連續長度。', '更省空間的方法是 [[p:sliding-window]]：維持視窗內最多一個 0，再把視窗長度減一。'],
  approaches: [
    {
      name: '預先算左右連續長度', idea: '對每個可能刪的位置，加上其左邊與右邊連續 1 的個數。',
      steps: ['由左到右算每格左邊連續 1 的數量。', '由右到左算每格右邊連續 1 的數量。', '對每格取 left[i]+right[i] 的最大值。'],
      figure: { title: 'nums = [1,1,0,1]', steps: prefixFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩次掃描建左右表，再掃一次候選刪除位置。' },
      verdict: '能清楚看見刪一格如何接起左右兩段。',
      code: {
        python: `def longestSubarray(nums):
    n = len(nums)
    left = [0] * n
    right = [0] * n
    for i in range(1, n):
        if nums[i - 1] == 1:
            left[i] = left[i - 1] + 1  # i 左邊連續 1 的長度
    for i in range(n - 2, -1, -1):
        if nums[i + 1] == 1:
            right[i] = right[i + 1] + 1
    return max(left[i] + right[i] for i in range(n))`,
        c: `int longestSubarray(int *nums, int numsSize) {
    int *left = calloc(numsSize, sizeof(int));
    int *right = calloc(numsSize, sizeof(int));
    for (int i = 1; i < numsSize; i++) {
        if (nums[i - 1] == 1) {
            left[i] = left[i - 1] + 1;
        }
    }
    for (int i = numsSize - 2; i >= 0; i--) {
        if (nums[i + 1] == 1) {
            right[i] = right[i + 1] + 1;
        }
    }
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        int length = left[i] + right[i];
        if (length > answer) {
            answer = length;
        }
    }
    free(left);
    free(right);
    return answer;
}`,
        cpp: `int longestSubarray(vector<int>& nums) {
    int n = nums.size();
    vector<int> left(n);
    vector<int> right(n);
    for (int i = 1; i < n; i++) {
        if (nums[i - 1] == 1) {
            left[i] = left[i - 1] + 1;
        }
    }
    for (int i = n - 2; i >= 0; i--) {
        if (nums[i + 1] == 1) {
            right[i] = right[i + 1] + 1;
        }
    }
    int answer = 0;
    for (int i = 0; i < n; i++) {
        answer = max(answer, left[i] + right[i]);
    }
    return answer;
}`,
        java: `int longestSubarray(int[] nums) {
    int n = nums.length;
    int[] left = new int[n];
    int[] right = new int[n];
    for (int i = 1; i < n; i++) {
        if (nums[i - 1] == 1) {
            left[i] = left[i - 1] + 1;
        }
    }
    for (int i = n - 2; i >= 0; i--) {
        if (nums[i + 1] == 1) {
            right[i] = right[i + 1] + 1;
        }
    }
    int answer = 0;
    for (int i = 0; i < n; i++) {
        answer = Math.max(answer, left[i] + right[i]);
    }
    return answer;
}`,
        javascript: `function longestSubarray(nums) {
  const n = nums.length;
  const left = new Array(n).fill(0);
  const right = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    if (nums[i - 1] === 1) {
      left[i] = left[i - 1] + 1;
    }
  }
  for (let i = n - 2; i >= 0; i--) {
    if (nums[i + 1] === 1) {
      right[i] = right[i + 1] + 1;
    }
  }
  let answer = 0;
  for (let i = 0; i < n; i++) {
    answer = Math.max(answer, left[i] + right[i]);
  }
  return answer;
}`,
      },
    },
    {
      name: '最多一個零的滑動視窗', idea: '維持視窗內最多一個 0；無論刪的是 0 或 1，長度都要減一。',
      steps: ['左界從 0 開始，逐步擴大右界。', '加入 0 時增加零數；若超過一個，就收縮左界。', '用右界−左界 更新答案。'],
      figure: { title: 'nums = [1,1,0,1]', steps: windowFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '左右界都最多向右移動 n 次。' },
      verdict: '推薦解法，尤其要記住全 1 也得減一。',
      code: {
        python: `def longestSubarray(nums):
    left = 0
    zeros = 0
    answer = 0
    for right, value in enumerate(nums):
        if value == 0:
            zeros += 1
        while zeros > 1:
            if nums[left] == 0:
                zeros -= 1
            left += 1  # 移走多出的零
        answer = max(answer, right - left)  # 視窗長度必須減一
    return answer`,
        c: `int longestSubarray(int *nums, int numsSize) {
    int left = 0;
    int zeros = 0;
    int answer = 0;
    for (int right = 0; right < numsSize; right++) {
        if (nums[right] == 0) {
            zeros++;
        }
        while (zeros > 1) {
            if (nums[left] == 0) {
                zeros--;
            }
            left++;
        }
        if (right - left > answer) {
            answer = right - left;
        }
    }
    return answer;
}`,
        cpp: `int longestSubarray(vector<int>& nums) {
    int left = 0;
    int zeros = 0;
    int answer = 0;
    for (int right = 0; right < (int) nums.size(); right++) {
        if (nums[right] == 0) {
            zeros++;
        }
        while (zeros > 1) {
            if (nums[left] == 0) {
                zeros--;
            }
            left++;
        }
        answer = max(answer, right - left);
    }
    return answer;
}`,
        java: `int longestSubarray(int[] nums) {
    int left = 0;
    int zeros = 0;
    int answer = 0;
    for (int right = 0; right < nums.length; right++) {
        if (nums[right] == 0) {
            zeros++;
        }
        while (zeros > 1) {
            if (nums[left] == 0) {
                zeros--;
            }
            left++;
        }
        answer = Math.max(answer, right - left);
    }
    return answer;
}`,
        javascript: `function longestSubarray(nums) {
  let left = 0;
  let zeros = 0;
  let answer = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) {
      zeros++;
    }
    while (zeros > 1) {
      if (nums[left] === 0) {
        zeros--;
      }
      left++;
    }
    answer = Math.max(answer, right - left);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['題目要求恰好刪一格，不能把全 1 陣列的長度 n 當答案。', '只有一格 [0] 或 [1]，答案都是 0。'],
  check: { kind: 'fn', fn: 'longestSubarray', cases: [
    { args: [A], out: 3 },
    { args: [[0, 1, 1, 1, 0, 1, 1, 0, 1]], out: 5 },
    { args: [[1, 1, 1]], out: 2 },
    { args: [[0]], out: 0 },
  ] },
}
