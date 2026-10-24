import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1512. Number of Good Pairs
const A = [1, 2, 3, 1, 1, 3]

export const q1512: Solution = {
  id: 1512,
  plain: '找出陣列裡值相同的兩個位置。每一對只算一次，前面的位置必須小於後面的位置。',
  statement: '給整數陣列 nums，計算滿足 i < j 且 nums[i] = nums[j] 的索引對數量。',
  examples: [
    { input: 'nums = [1,2,3,1,1,3]', output: '4', note: '值 1 組成三對，值 3 組成一對。' },
    { input: 'nums = [1,1,1,1]', output: '6' },
    { input: 'nums = [1,2,3]', output: '0' },
  ],
  constraints: ['1 ≤ nums.length ≤ 100；1 ≤ nums[i] ≤ 100。'],
  insight: ['固定右端 j，之前每個相同的數都能和它組成一對。', '用計數表記住已看過的值，就不必再掃描整個前綴。'],
  approaches: [
    {
      name: '逐對比較',
      idea: '讓 i、j 跑過所有 i < j 的組合，值相同就加一。',
      steps: ['答案從 0 開始。', '外層固定 i，內層只看 i 後面的 j。', '若 nums[i] 與 nums[j] 相同，答案加一。'],
      figure: { title: 'nums = [1,2,3,1,1,3]', steps: [
        { note: '先固定索引 0 的 1；後面兩個 1 在索引 3、4，各形成一對，累計 2。', views: [arr(A, { highlight: [0], compare: [3, 4] })] },
        { note: '索引 1 的 2 在右邊找不到相同值，答案仍為 2。', views: [arr(A, { highlight: [1], dim: [0] })] },
        { note: '索引 2 的 3 與索引 5 的 3 配成一對，累計 3。', views: [arr(A, { highlight: [2], compare: [5] })] },
        { note: '索引 3 的 1 再與索引 4 的 1 配對，最後得到 4。', views: [arr(A, { highlight: [3], compare: [4], done: [0, 2, 5] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '兩層迴圈檢查所有位置對。' },
      verdict: '適合先確認題意；資料量變大時會做許多無用比較。',
      code: {
        python: `def numIdenticalPairs(nums):
    answer = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                answer += 1  # 同值且 i < j，找到一對
    return answer`,
        c: `int numIdenticalPairs(int *nums, int numsSize) {
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] == nums[j]) {
                answer++;
            }
        }
    }
    return answer;
}`,
        cpp: `int numIdenticalPairs(vector<int>& nums) {
    int answer = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int j = i + 1; j < (int)nums.size(); j++) {
            if (nums[i] == nums[j]) {
                answer++;
            }
        }
    }
    return answer;
}`,
        java: `int numIdenticalPairs(int[] nums) {
    int answer = 0;
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) {
                answer++;
            }
        }
    }
    return answer;
}`,
        javascript: `function numIdenticalPairs(nums) {
  let answer = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) {
        answer++;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '邊走邊計數',
      idea: '讀到 x 時，前面出現過幾個 x，就立刻新增幾對。',
      steps: ['建立全零的計數表。', '每讀到 x，先把 count[x] 加到答案。', '再把 count[x] 加一，讓後面的 x 可以和它配對。'],
      figure: { title: 'nums = [1,2,3,1,1,3]', steps: [
        { note: '第一個 1 前面沒有 1，新增 0 對；記下 count[1] = 1。', views: [arr(A, { highlight: [0], dim: [1, 2, 3, 4, 5] })] },
        { note: '2、3 也是第一次出現，都沒有新配對；已看過 1、2、3。', views: [arr(A, { done: [0, 1, 2], dim: [3, 4, 5] })] },
        { note: '索引 3 的 1 遇到前面一個 1，新增 1 對；count[1] 變 2。', views: [arr(A, { done: [0, 1, 2], highlight: [3] })] },
        { note: '索引 4 的 1 遇到前面兩個 1，一次新增 2 對；累計 3。', views: [arr(A, { done: [0, 1, 2, 3], highlight: [4] })] },
        { note: '最後的 3 遇到前面一個 3，再新增 1 對，答案是 4。', views: [arr(A, { done: [0, 1, 2, 3, 4], highlight: [5] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '值只在 1 到 100，計數表固定 101 格。' },
      verdict: '每個數只處理一次；一般值域可改用雜湊表，參考 [[p:hash-map]]。',
      code: {
        python: `def numIdenticalPairs(nums):
    count = [0] * 101
    answer = 0
    for x in nums:
        answer += count[x]  # 前面每個 x 都能與目前的 x 配對
        count[x] += 1
    return answer`,
        c: `int numIdenticalPairs(int *nums, int numsSize) {
    int count[101] = {0};
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        int x = nums[i];
        answer += count[x];
        count[x]++;
    }
    return answer;
}`,
        cpp: `int numIdenticalPairs(vector<int>& nums) {
    vector<int> count(101, 0);
    int answer = 0;
    for (int x : nums) {
        answer += count[x];
        count[x]++;
    }
    return answer;
}`,
        java: `int numIdenticalPairs(int[] nums) {
    int[] count = new int[101];
    int answer = 0;
    for (int x : nums) {
        answer += count[x];
        count[x]++;
    }
    return answer;
}`,
        javascript: `function numIdenticalPairs(nums) {
  const count = new Array(101).fill(0);
  let answer = 0;
  for (const x of nums) {
    answer += count[x];
    count[x]++;
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['先增加 count[x] 才加進答案，會把當前元素與自己算成一對。', '每對只算一次；雙層迴圈要從 j = i + 1 開始。'],
  check: { kind: 'fn', fn: 'numIdenticalPairs', cases: [
    { args: [A], out: 4 },
    { args: [[1, 1, 1, 1]], out: 6 },
    { args: [[1, 2, 3]], out: 0 },
    { args: [[100, 100]], out: 1 },
  ] },
}
