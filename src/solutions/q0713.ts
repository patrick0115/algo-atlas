import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 713. Subarray Product Less Than K
const A = [10, 5, 2, 6]

export const q0713: Solution = {
  id: 713,
  plain: '數出乘積小於 k 的連續片段有幾段。所有數都是正數，因此加入新數只會讓乘積變大。',
  statement: '給正整數陣列 nums 和整數 k，回傳乘積嚴格小於 k 的非空連續子陣列數量。',
  examples: [{ input: 'nums = [10,5,2,6], k = 100', output: '8' }, { input: 'nums = [1,2,3], k = 0', output: '0' }],
  constraints: ['1 ≤ nums.length ≤ 3×10⁴；nums[i] ≥ 1。'],
  insight: ['正數乘積隨右界延伸不會下降，因此可用 [[p:sliding-window]]。', '固定右端點，若最長合法視窗從 left 開始，則以該右端結尾的合法片段共有 right−left+1 個。', 'k ≤ 1 時任何正數乘積都不可能小於 k。'],
  approaches: [
    {
      name: '乘積滑動視窗',
      idea: '維持乘積小於 k 的視窗；右端新增一個數後，必要時從左縮小。',
      steps: ['k ≤ 1 直接回傳 0。', '右端逐個乘入；乘積太大就除掉左端並右移。', '每次加上 right−left+1。'],
      figure: { title: 'nums = [10,5,2,6], k = 100', steps: [
        { note: '視窗 [10] 的乘積 10 < 100；右端 0 新增 1 段。', views: [arr(A, { label: '視窗', highlight: [0] })] },
        { note: '加入 5 得 [10,5]，乘積 50；以 5 結尾的 [5]、[10,5] 共 2 段。', views: [arr(A, { label: '視窗', highlight: [0, 1] })] },
        { note: '加入 2 後乘積 100 不合法；去掉左端 10，變成 [5,2]，新增 2 段。', views: [arr(A, { label: '縮小視窗', dim: [0], highlight: [1, 2] })] },
        { note: '加入 6 得 [5,2,6]，乘積 60，新增 3 段。總數 1+2+2+3=8。', views: [arr(A, { label: '最後視窗', highlight: [1, 2, 3] }), arr([8], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '左右指標各最多走 n 次。' },
      verdict: '本題標準解；關鍵在「固定右端」的計數。',
      code: {
        python: `def numSubarrayProductLessThanK(nums, k):
    if k <= 1:
        return 0
    left = 0
    product = 1
    answer = 0
    for right, value in enumerate(nums):
        product *= value
        while product >= k:
            product //= nums[left]        # 移走視窗左端
            left += 1
        answer += right - left + 1       # 以 right 結尾的合法段數
    return answer`,
        c: `int numSubarrayProductLessThanK(int *nums, int numsSize, int k) {
    if (k <= 1) {
        return 0;
    }
    int left = 0;
    long long product = 1;
    int answer = 0;
    for (int right = 0; right < numsSize; right++) {
        product *= nums[right];
        while (product >= k) {
            product /= nums[left];
            left++;
        }
        answer += right - left + 1;
    }
    return answer;
}`,
        cpp: `int numSubarrayProductLessThanK(vector<int>& nums, int k) {
    if (k <= 1) {
        return 0;
    }
    int left = 0;
    long long product = 1;
    int answer = 0;
    for (int right = 0; right < (int)nums.size(); right++) {
        product *= nums[right];
        while (product >= k) {
            product /= nums[left];
            left++;
        }
        answer += right - left + 1;
    }
    return answer;
}`,
        java: `int numSubarrayProductLessThanK(int[] nums, int k) {
    if (k <= 1) {
        return 0;
    }
    int left = 0;
    long product = 1;
    int answer = 0;
    for (int right = 0; right < nums.length; right++) {
        product *= nums[right];
        while (product >= k) {
            product /= nums[left];
            left++;
        }
        answer += right - left + 1;
    }
    return answer;
}`,
        javascript: `function numSubarrayProductLessThanK(nums, k) {
  if (k <= 1) {
    return 0;
  }
  let left = 0;
  let product = 1;
  let answer = 0;
  for (let right = 0; right < nums.length; right++) {
    product *= nums[right];
    while (product >= k) {
      product /= nums[left];
      left++;
    }
    answer += right - left + 1;
  }
  return answer;
}`,
      },
    },
    {
      name: '固定起點逐步相乘',
      idea: '從每個起點往右延伸；乘積一旦達到 k，後面只會更大，可以停止。',
      steps: ['每個 left 從乘積 1 開始。', '依序乘入 nums[right]。', '小於 k 就計數；否則停止這個 left。'],
      figure: { title: 'nums = [10,5,2,6], k = 100', steps: [
        { note: '從 10 開始，[10] 與 [10,5] 合法。', views: [arr(A, { label: '左端 0', highlight: [0, 1] })] },
        { note: '再乘 2 得 100，不小於 100；此起點不必再往右。', views: [arr(A, { label: '停止延伸', highlight: [0, 1, 2] })] },
        { note: '從 5 開始，[5]、[5,2]、[5,2,6] 都合法。', views: [arr(A, { label: '左端 1', highlight: [1, 2, 3] })] },
        { note: '再處理起點 2 與 6，總數為 8。', views: [arr([8], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個起點最多延伸到末端。' },
      verdict: '方便當作小範例的核對方法；最大測資較慢。',
      code: {
        python: `def numSubarrayProductLessThanK(nums, k):
    answer = 0
    for left in range(len(nums)):
        product = 1
        for right in range(left, len(nums)):
            product *= nums[right]
            if product >= k:
                break                    # 正數再乘只會更大
            answer += 1
    return answer`,
        c: `int numSubarrayProductLessThanK(int *nums, int numsSize, int k) {
    int answer = 0;
    for (int left = 0; left < numsSize; left++) {
        long long product = 1;
        for (int right = left; right < numsSize; right++) {
            product *= nums[right];
            if (product >= k) {
                break;
            }
            answer++;
        }
    }
    return answer;
}`,
        cpp: `int numSubarrayProductLessThanK(vector<int>& nums, int k) {
    int answer = 0;
    for (int left = 0; left < (int)nums.size(); left++) {
        long long product = 1;
        for (int right = left; right < (int)nums.size(); right++) {
            product *= nums[right];
            if (product >= k) {
                break;
            }
            answer++;
        }
    }
    return answer;
}`,
        java: `int numSubarrayProductLessThanK(int[] nums, int k) {
    int answer = 0;
    for (int left = 0; left < nums.length; left++) {
        long product = 1;
        for (int right = left; right < nums.length; right++) {
            product *= nums[right];
            if (product >= k) {
                break;
            }
            answer++;
        }
    }
    return answer;
}`,
        javascript: `function numSubarrayProductLessThanK(nums, k) {
  let answer = 0;
  for (let left = 0; left < nums.length; left++) {
    let product = 1;
    for (let right = left; right < nums.length; right++) {
      product *= nums[right];
      if (product >= k) {
        break;
      }
      answer++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['要嚴格小於 k；乘積等於 k 也不合法。', '正數條件使視窗成立；若允許 0 或負數，推理要重做。', 'k ≤ 1 需直接回傳 0。'],
  check: { kind: 'fn', fn: 'numSubarrayProductLessThanK', cases: [
    { args: [A, 100], out: 8 }, { args: [[1, 2, 3], 0], out: 0 }, { args: [[1, 1, 1], 2], out: 6 }, { args: [[10], 10], out: 0 },
  ] },
}
