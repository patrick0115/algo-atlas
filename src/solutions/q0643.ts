import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [1, 12, -5, -6, 50, 3]

export const q0643: Solution = {
  id: 643,
  plain: '從一排數字中選連續 k 個，找出平均值最高的那一段。',
  statement: '給整數陣列 nums 和 k，回傳所有長度剛好為 k 的連續子陣列中，最大的平均值。',
  examples: [
    { input: 'nums = [1,12,-5,-6,50,3], k = 4', output: '12.75' },
    { input: 'nums = [5], k = 1', output: '5' },
  ],
  constraints: ['1 ≤ k ≤ nums.length ≤ 10⁵；數值可為負。'],
  insight: ['每段長度相同，平均值最大等同總和最大。', '相鄰視窗只差最左與最新兩個數，可用 [[p:sliding-window]] 省去重算。'],
  approaches: [
    {
      name: '固定長度滑動視窗',
      idea: '先算前 k 個的總和；每往右一步，減去離開的數，再加上進來的數。',
      steps: ['加總前 k 個數作為第一個視窗', '從索引 k 開始，更新 sum += nums[i] - nums[i-k]', '記錄出現過的最大總和', '最後除以 k'],
      figure: { title: 'nums = [1,12,-5,-6,50,3], k = 4', steps: [
        { note: '前四個數合計 2，先把它當作目前最佳。', views: [arr(A, { label: 'nums', highlight: [0, 1, 2, 3] }), arr([2], { label: '視窗總和' })] },
        { note: '視窗右移：1 離開、50 進來，總和變 51。', views: [arr(A, { label: 'nums', dim: [0], highlight: [1, 2, 3, 4] }), arr([51], { label: '最佳總和' })] },
        { note: '再右移：12 離開、3 進來，總和變 42，沒有超過 51。', views: [arr(A, { label: 'nums', dim: [0, 1], highlight: [2, 3, 4, 5] }), arr([51, 42], { label: '最佳 / 目前' })] },
        { note: '最大的總和是 51；四個數的平均為 51 ÷ 4 = 12.75。', views: [arr([12.75], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個數最多進出視窗各一次。' },
      verdict: '最適合固定長度視窗，只需幾個變數。',
      code: {
        python: `def findMaxAverage(nums, k):
    window = sum(nums[:k])  # 先建立第一個完整視窗
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]  # 一進一出
        best = max(best, window)
    return best / k`,
        c: `double findMaxAverage(int *nums, int numsSize, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) {
        window += nums[i];
    }
    int best = window;
    for (int i = k; i < numsSize; i++) {
        window += nums[i] - nums[i - k];
        if (window > best) {
            best = window;
        }
    }
    return (double)best / k;
}`,
        cpp: `double findMaxAverage(vector<int>& nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) {
        window += nums[i];
    }
    int best = window;
    for (int i = k; i < (int)nums.size(); i++) {
        window += nums[i] - nums[i - k];
        best = max(best, window);
    }
    return (double)best / k;
}`,
        java: `double findMaxAverage(int[] nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) {
        window += nums[i];
    }
    int best = window;
    for (int i = k; i < nums.length; i++) {
        window += nums[i] - nums[i - k];
        best = Math.max(best, window);
    }
    return (double)best / k;
}`,
        javascript: `function findMaxAverage(nums, k) {
  let window = 0;
  for (let i = 0; i < k; i++) {
    window += nums[i];
  }
  let best = window;
  for (let i = k; i < nums.length; i++) {
    window += nums[i] - nums[i - k];
    best = Math.max(best, window);
  }
  return best / k;
}`,
      },
    },
    {
      name: '前綴和',
      idea: '先存每個前綴的總和，再用兩個前綴相減取得任一段長度 k 的總和。',
      steps: ['建立 prefix[0] = 0', '逐個累加得到 prefix[i+1]', '每段總和是 prefix[i+k] - prefix[i]', '選最大值並除以 k'],
      figure: { title: '前綴和：nums = [1,12,-5,-6,50,3]', steps: [
        { note: '先從左到右累加；第一個 0 代表空前綴。', views: [arr([0, 1, 13, 8, 2, 52, 55], { label: 'prefix' })] },
        { note: '索引 0 到 3 的總和為 prefix[4] − prefix[0] = 2。', views: [arr([0, 1, 13, 8, 2, 52, 55], { label: 'prefix', highlight: [0, 4] })] },
        { note: '索引 1 到 4 的總和為 prefix[5] − prefix[1] = 51，更新最佳。', views: [arr([0, 1, 13, 8, 2, 52, 55], { label: 'prefix', highlight: [1, 5] })] },
        { note: '最後一段為 55 − 13 = 42；最大仍是 51，平均 12.75。', views: [arr([2, 51, 42], { label: '三段總和', done: [1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '要保存 n+1 個前綴和。' },
      verdict: '適合延伸到多次詢問不同區間的總和。',
      code: {
        python: `def findMaxAverage(nums, k):
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)  # 累加到目前位置
    best = max(prefix[i + k] - prefix[i] for i in range(len(nums) - k + 1))
    return best / k`,
        c: `double findMaxAverage(int *nums, int numsSize, int k) {
    int *prefix = malloc((numsSize + 1) * sizeof(int));
    prefix[0] = 0;
    for (int i = 0; i < numsSize; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    int best = prefix[k];
    for (int i = 1; i + k <= numsSize; i++) {
        int sum = prefix[i + k] - prefix[i];
        if (sum > best) {
            best = sum;
        }
    }
    free(prefix);
    return (double)best / k;
}`,
        cpp: `double findMaxAverage(vector<int>& nums, int k) {
    vector<int> prefix(nums.size() + 1, 0);
    for (int i = 0; i < (int)nums.size(); i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    int best = prefix[k];
    for (int i = 1; i + k <= (int)nums.size(); i++) {
        best = max(best, prefix[i + k] - prefix[i]);
    }
    return (double)best / k;
}`,
        java: `double findMaxAverage(int[] nums, int k) {
    int[] prefix = new int[nums.length + 1];
    for (int i = 0; i < nums.length; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    int best = prefix[k];
    for (int i = 1; i + k <= nums.length; i++) {
        best = Math.max(best, prefix[i + k] - prefix[i]);
    }
    return (double)best / k;
}`,
        javascript: `function findMaxAverage(nums, k) {
  const prefix = [0];
  for (const x of nums) {
    prefix.push(prefix[prefix.length - 1] + x);
  }
  let best = prefix[k];
  for (let i = 1; i + k <= nums.length; i++) {
    best = Math.max(best, prefix[i + k] - prefix[i]);
  }
  return best / k;
}`,
      },
    },
  ],
  pitfalls: ['必須先形成完整的 k 個數，才開始比較平均。', '數值可能全為負，最佳值不可預設為 0。'],
  check: { kind: 'fn', fn: 'findMaxAverage', compare: 'close', cases: [
    { args: [A, 4], out: 12.75 },
    { args: [[5], 1], out: 5 },
    { args: [[-1, -12, -5], 2], out: -6.5 },
  ] },
}
