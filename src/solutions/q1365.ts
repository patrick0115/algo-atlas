import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1365. How Many Numbers Are Smaller Than the Current Number
const A = [8, 1, 2, 2, 3]
const F = [
  { note: '對 8 看其餘數字：1、2、2、3 全都更小，第一格答案是 4。', views: [arr(A, { label: 'nums', highlight: [0], done: [1, 2, 3, 4] })] },
  { note: '對 1 沒有更小的數字，第二格答案是 0。', views: [arr(A, { label: 'nums', highlight: [1] })] },
  { note: '對第一個 2，只有 1 更小；另一個 2 相等，不能計入。', views: [arr(A, { label: 'nums', highlight: [2], done: [1], dim: [3] })] },
  { note: '逐格做完，得到 [4,0,1,1,3]。', views: [arr([4, 0, 1, 1, 3], { label: '答案', done: [0, 1, 2, 3, 4] })] },
]
const G = [
  { note: '先計數：1 一個、2 兩個、3 一個、8 一個。', views: [arr([1, 2, 1, 1], { label: '值 1、2、3、8 的次數' })] },
  { note: '前綴累加得到「嚴格更小」的個數：對值 2 是 1，對值 3 是 3。', views: [arr([0, 1, 3, 4], { label: '值 1、2、3、8 的較小數量' })] },
  { note: '原陣列的 8 查得 4，1 查得 0。', views: [arr([4, 0], { label: '前兩格', done: [0, 1] })] },
  { note: '兩個 2 都查得 1，3 查得 3；答案 [4,0,1,1,3]。', views: [arr([4, 0, 1, 1, 3], { label: '答案', done: [0, 1, 2, 3, 4] })] },
]

export const q1365: Solution = {
  id: 1365,
  plain: '對每個數，數出陣列裡有幾個數嚴格比它小。',
  statement: '給整數陣列 `nums`，回傳等長陣列；第 i 格是所有 j≠i 且 `nums[j] < nums[i]` 的個數。',
  examples: [{ input: 'nums = [8,1,2,2,3]', output: '[4,0,1,1,3]' }, { input: 'nums = [6,5,4,8]', output: '[2,1,0,3]' }],
  constraints: ['2 ≤ n ≤ 500；數值介於 0 到 100。'],
  insight: ['最直接是每格與所有數比較。', '數值範圍只有 101 種，可用 [[p:counting-sort]] 的計數與前綴累加。'],
  approaches: [
    {
      name: '兩層迴圈逐一比較',
      idea: '對每個數掃完整陣列，遇到更小的就加一。',
      steps: ['建立等長的答案陣列。', '每個 i 逐一檢查所有 j。', '若 `nums[j] < nums[i]`，答案 i 加一。'],
      figure: { title: 'nums = [8,1,2,2,3]', steps: F },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個元素都與 n 個數比較。' },
      verdict: 'n 最多 500 時可用，容易驗證計數含義。',
      code: {
        python: `def smallerNumbersThanCurrent(nums):
    answer = []
    for value in nums:
        count = 0
        for other in nums:
            if other < value:
                count += 1            # 相等不算較小
        answer.append(count)
    return answer`,
        c: `int *smallerNumbersThanCurrent(int *nums, int numsSize, int *returnSize) {
    int *answer = calloc(numsSize, sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = 0; j < numsSize; j++) {
            if (nums[j] < nums[i]) answer[i]++;
        }
    }
    *returnSize = numsSize;
    return answer;
}`,
        cpp: `vector<int> smallerNumbersThanCurrent(vector<int>& nums) {
    vector<int> answer(nums.size());
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int value : nums) {
            if (value < nums[i]) answer[i]++;
        }
    }
    return answer;
}`,
        java: `int[] smallerNumbersThanCurrent(int[] nums) {
    int[] answer = new int[nums.length];
    for (int i = 0; i < nums.length; i++) {
        for (int value : nums) {
            if (value < nums[i]) answer[i]++;
        }
    }
    return answer;
}`,
        javascript: `function smallerNumbersThanCurrent(nums) {
  const answer = new Array(nums.length).fill(0);
  for (let i = 0; i < nums.length; i++) {
    for (const value of nums) {
      if (value < nums[i]) answer[i]++;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '計數陣列與前綴和',
      idea: '`count[v]` 記值 v 出現幾次；累計 v 以下的數量供 v+1 查詢。',
      steps: ['統計 0 到 100 每個值的次數。', '由小到大做累計。', '對每個值 v，讀取 v 前一格的累計數量。'],
      figure: { title: 'nums = [8,1,2,2,3]', steps: G },
      complexity: { time: 'O(n + 101)', space: 'O(n + 101)', why: '一次掃陣列、一次掃固定值域。' },
      verdict: '用題目給的小值域換掉兩層比較。',
      code: {
        python: `def smallerNumbersThanCurrent(nums):
    count = [0] * 101
    for value in nums:
        count[value] += 1
    smaller = [0] * 101
    seen = 0
    for value in range(101):
        smaller[value] = seen         # 先記錄嚴格更小的數量
        seen += count[value]
    return [smaller[value] for value in nums]`,
        c: `int *smallerNumbersThanCurrent(int *nums, int numsSize, int *returnSize) {
    int count[101] = {0}, smaller[101];
    for (int i = 0; i < numsSize; i++) count[nums[i]]++;
    int seen = 0;
    for (int value = 0; value <= 100; value++) {
        smaller[value] = seen;
        seen += count[value];
    }
    int *answer = malloc(numsSize * sizeof(int));
    for (int i = 0; i < numsSize; i++) answer[i] = smaller[nums[i]];
    *returnSize = numsSize;
    return answer;
}`,
        cpp: `vector<int> smallerNumbersThanCurrent(vector<int>& nums) {
    vector<int> count(101), smaller(101), answer;
    for (int value : nums) count[value]++;
    int seen = 0;
    for (int value = 0; value <= 100; value++) {
        smaller[value] = seen;
        seen += count[value];
    }
    for (int value : nums) answer.push_back(smaller[value]);
    return answer;
}`,
        java: `int[] smallerNumbersThanCurrent(int[] nums) {
    int[] count = new int[101], smaller = new int[101], answer = new int[nums.length];
    for (int value : nums) count[value]++;
    int seen = 0;
    for (int value = 0; value <= 100; value++) {
        smaller[value] = seen;
        seen += count[value];
    }
    for (int i = 0; i < nums.length; i++) answer[i] = smaller[nums[i]];
    return answer;
}`,
        javascript: `function smallerNumbersThanCurrent(nums) {
  const count = new Array(101).fill(0);
  const smaller = new Array(101).fill(0);
  for (const value of nums) count[value]++;
  let seen = 0;
  for (let value = 0; value <= 100; value++) {
    smaller[value] = seen;
    seen += count[value];
  }
  return nums.map((value) => smaller[value]);
}`,
      },
    },
  ],
  pitfalls: ['相等不能算較小，例如兩個 2 的答案都只能算 1。', '若先把 count[v] 加到累計再記錄，會把相等也算進去。'],
  check: { kind: 'fn', fn: 'smallerNumbersThanCurrent', cases: [
    { args: [A], out: [4, 0, 1, 1, 3] }, { args: [[6, 5, 4, 8]], out: [2, 1, 0, 3] },
    { args: [[7, 7, 7]], out: [0, 0, 0] },
  ] },
}
