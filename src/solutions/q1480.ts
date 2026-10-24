import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 2, 3, 4]

function directFig(): FigStep[] {
  return [
    { note: '答案[0] 是 nums[0]，所以是 1。', views: [arr(A, { label: 'nums', highlight: [0] }), arr([1], { label: '答案' })] },
    { note: '答案[1] 從開頭重新加 1+2=3。', views: [arr(A, { label: 'nums', highlight: [0, 1] }), arr([1, 3], { label: '答案' })] },
    { note: '答案[2] 再從頭加 1+2+3=6；前面的加法被重做了。', views: [arr(A, { label: 'nums', highlight: [0, 1, 2] }), arr([1, 3, 6], { label: '答案' })] },
    { note: '最後 1+2+3+4=10，得到 [1,3,6,10]。', views: [arr([1, 3, 6, 10], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

function prefixFig(): FigStep[] {
  return [
    { note: '先讓累計和 total=0。讀到 1 時，total=1，寫答案[0]=1。', views: [arr(A, { label: 'nums', highlight: [0] }), arr([1], { label: '答案' })] },
    { note: '讀到 2，只需把它加到舊 total：1+2=3。', views: [arr(A, { label: 'nums', highlight: [1], done: [0] }), arr([1, 3], { label: '答案' })] },
    { note: '讀到 3，total=3+3=6；不必重加 1、2。', views: [arr(A, { label: 'nums', highlight: [2], done: [0, 1] }), arr([1, 3, 6], { label: '答案' })] },
    { note: '讀到 4，total=6+4=10，完成 [1,3,6,10]。', views: [arr([1, 3, 6, 10], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

export const q1480: Solution = {
  id: 1480,
  plain: '把每個位置換成「從開頭加到這裡」的總和。',
  statement: '給陣列 nums，回傳 runningSum，其中 runningSum[i] = nums[0] + … + nums[i]。',
  examples: [{ input: 'nums = [1,2,3,4]', output: '[1,3,6,10]' }, { input: 'nums = [1,1,1,1,1]', output: '[1,2,3,4,5]' }, { input: 'nums = [3,1,2,10,1]', output: '[3,4,6,16,17]' }],
  constraints: ['`1 ≤ nums.length ≤ 1000`', '`−10⁶ ≤ nums[i] ≤ 10⁶`'],
  insight: ['每個位置都重算前面所有數可以得到答案，但做了重複工作。', '[[p:prefix-sum]] 的關鍵是 `answer[i] = answer[i−1] + nums[i]`。'],
  approaches: [
    {
      name: '每個位置從頭加總',
      idea: '固定終點 i，重新把 nums[0..i] 相加。',
      steps: ['建立空答案。', '對每個 i，從 0 加到 i。', '把結果放入答案。'],
      figure: { title: 'nums = [1,2,3,4]', steps: directFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '第 i 格做 i+1 次加法；答案有 n 格。' },
      verdict: '直觀但重複計算；適合先弄懂題意。',
      code: {
        python: `def runningSum(nums):
    answer = []
    for i in range(len(nums)):
        total = 0
        for j in range(i + 1):
            total += nums[j]  # 每格都從頭算
        answer.append(total)
    return answer`,
        c: `int *runningSum(int *nums, int numsSize, int *returnSize) {
    int *answer = malloc(numsSize * sizeof(int));
    *returnSize = numsSize;
    for (int i = 0; i < numsSize; i++) {
        int total = 0;
        for (int j = 0; j <= i; j++) {
            total += nums[j];
        }
        answer[i] = total;
    }
    return answer;
}`,
        cpp: `vector<int> runningSum(vector<int>& nums) {
    vector<int> answer;
    for (int i = 0; i < (int)nums.size(); i++) {
        int total = 0;
        for (int j = 0; j <= i; j++) {
            total += nums[j];
        }
        answer.push_back(total);
    }
    return answer;
}`,
        java: `int[] runningSum(int[] nums) {
    int[] answer = new int[nums.length];
    for (int i = 0; i < nums.length; i++) {
        int total = 0;
        for (int j = 0; j <= i; j++) {
            total += nums[j];
        }
        answer[i] = total;
    }
    return answer;
}`,
        javascript: `function runningSum(nums) {
  const answer = [];
  for (let i = 0; i < nums.length; i++) {
    let total = 0;
    for (let j = 0; j <= i; j++) {
      total += nums[j];
    }
    answer.push(total);
  }
  return answer;
}`,
      },
    },
    {
      name: '一次掃描累計',
      idea: '保留到上一格的總和，只加目前新遇到的數。',
      steps: ['令 total=0。', '逐一讀 nums[i]，更新 total+=nums[i]。', '把 total 放到答案[i]。'],
      figure: { title: 'nums = [1,2,3,4]', steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數只加一次；答案有 n 格。' },
      verdict: '寫法簡單，避免所有重複加法。',
      code: {
        python: `def runningSum(nums):
    answer = []
    total = 0
    for value in nums:
        total += value  # 延用前一格的總和
        answer.append(total)
    return answer`,
        c: `int *runningSum(int *nums, int numsSize, int *returnSize) {
    int *answer = malloc(numsSize * sizeof(int));
    int total = 0;
    *returnSize = numsSize;
    for (int i = 0; i < numsSize; i++) {
        total += nums[i];
        answer[i] = total;
    }
    return answer;
}`,
        cpp: `vector<int> runningSum(vector<int>& nums) {
    vector<int> answer;
    int total = 0;
    for (int value : nums) {
        total += value;
        answer.push_back(total);
    }
    return answer;
}`,
        java: `int[] runningSum(int[] nums) {
    int[] answer = new int[nums.length];
    int total = 0;
    for (int i = 0; i < nums.length; i++) {
        total += nums[i];
        answer[i] = total;
    }
    return answer;
}`,
        javascript: `function runningSum(nums) {
  const answer = [];
  let total = 0;
  for (const value of nums) {
    total += value;
    answer.push(total);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['第一格就是 nums[0]，不要額外塞一個 0 到回傳陣列。', '累加時要使用原始 nums[i]，別把上一輪加過的值再重複加。'],
  check: { kind: 'fn', fn: 'runningSum', cases: [{ args: [A], out: [1, 3, 6, 10] }, { args: [[1, 1, 1, 1, 1]], out: [1, 2, 3, 4, 5] }, { args: [[3, 1, 2, 10, 1]], out: [3, 4, 6, 16, 17] }] },
}
