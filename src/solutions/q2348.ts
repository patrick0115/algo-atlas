import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2348. Number of Zero-Filled Subarrays
const A = [1, 3, 0, 0, 2, 0, 0, 4]
const streakFig: FigStep[] = [
  { note: '只看以當前位置結尾的全 0 子陣列。第一個 0 新增 1 個,連續第二個 0 新增 2 個。', views: [arr(A, { label: 'nums', done: [2, 3, 5, 6] }), arr([0, 0, 1, 2, 0, 1, 2, 0], { label: '每個位置新增的個數' })] },
  { note: '每次把目前連續 0 的長度加進答案:1 + 2 + 1 + 2 = 6。', views: [arr([6], { label: '答案', done: [0] })] },
]
const blocksFig: FigStep[] = [
  { note: '把連續的 0 當成一段。長度為 L 的一段共有 L + (L−1) + … + 1 = L(L+1)/2 個全 0 子陣列。', views: [arr([2, 2], { label: '兩段 0 的長度' })] },
  { note: '兩段長度都是 2,各貢獻 3,總共 6。', views: [arr([3, 3, 6], { label: '各段與總數', done: [2] })] },
]

export const q2348: Solution = {
  id: 2348,
  plain: '在數字陣列中,找出所有連續且每個數都是 0 的小段,問一共有幾段。兩個 0 連在一起時,單獨兩段加整段,共三種。',
  statement: '給整數陣列 nums,計算所有元素都為 0 的連續非空子陣列數量。',
  examples: [
    { input: 'nums = [1,3,0,0,2,0,0,4]', output: '6' },
    { input: 'nums = [0,0,0,2,0,0]', output: '9' },
    { input: 'nums = [2,10,2019]', output: '0' },
  ],
  constraints: ['陣列長度最多 10⁵', '答案可大於 32 位元整數,要用 64 位元計數'],
  insight: ['任何全 0 子陣列都位於某一段連續 0 中,不會跨過非 0。', '以目前 0 為結尾的新子陣列數,正好等於目前連續 0 的長度。', '長度 L 的完整 0 段可用等差數列公式 L(L+1)/2 一次計算。'],
  approaches: [
    {
      name: '逐位置累加連續長度',
      idea: '每遇到 0,連續長度加 1,並把這個長度加進答案;遇非 0 就重設。',
      steps: ['streak = 0,answer = 0', '掃過 nums:若 x = 0,streak 加 1,answer 加 streak', '若 x ≠ 0,streak 設回 0', '回傳 answer'],
      figure: { title: '每個結尾位置新增多少', steps: streakFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素只處理一次。' },
      verdict: '推薦,只需一次掃描且不必另處理最後一段。',
      code: {
        python: `def zeroFilledSubarray(nums):
    streak = answer = 0
    for x in nums:
        if x == 0:
            streak += 1
            answer += streak
        else:
            streak = 0
    return answer`,
        c: `long long zeroFilledSubarray(int *nums, int numsSize) {
    long long streak = 0, answer = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] == 0) answer += ++streak;
        else streak = 0;
    }
    return answer;
}`,
        cpp: `long long zeroFilledSubarray(vector<int>& nums) {
    long long streak = 0, answer = 0;
    for (int x : nums) {
        if (x == 0) answer += ++streak;
        else streak = 0;
    }
    return answer;
}`,
        java: `long zeroFilledSubarray(int[] nums) {
    long streak = 0, answer = 0;
    for (int x : nums) {
        if (x == 0) answer += ++streak;
        else streak = 0;
    }
    return answer;
}`,
        javascript: `function zeroFilledSubarray(nums) {
  let streak = 0, answer = 0;
  for (const x of nums) {
    if (x === 0) answer += ++streak;
    else streak = 0;
  }
  return answer;
}`,
      },
    },
    {
      name: '分段套三角形公式',
      idea: '每段連續 0 長度 L,一次加入 L(L+1)/2。',
      steps: ['掃描 nums 並累計目前 0 段長度 L', '遇非 0 時加入 L(L+1)/2,再把 L 清零', '掃描結束後別忘了結算最後一段', '回傳總數'],
      figure: { title: '把連續 0 切成段', steps: blocksFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每段只結算一次。' },
      verdict: '公式明確,也適合用來檢查第一種做法的計數。',
      code: {
        python: `def zeroFilledSubarray(nums):
    answer = length = 0
    for x in nums:
        if x == 0:
            length += 1
        else:
            answer += length * (length + 1) // 2
            length = 0
    return answer + length * (length + 1) // 2`,
        c: `long long zeroFilledSubarray(int *nums, int numsSize) {
    long long answer = 0, length = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] == 0) length++;
        else {
            answer += length * (length + 1) / 2;
            length = 0;
        }
    }
    return answer + length * (length + 1) / 2;
}`,
        cpp: `long long zeroFilledSubarray(vector<int>& nums) {
    long long answer = 0, length = 0;
    for (int x : nums) {
        if (x == 0) length++;
        else {
            answer += length * (length + 1) / 2;
            length = 0;
        }
    }
    return answer + length * (length + 1) / 2;
}`,
        java: `long zeroFilledSubarray(int[] nums) {
    long answer = 0, length = 0;
    for (int x : nums) {
        if (x == 0) length++;
        else {
            answer += length * (length + 1) / 2;
            length = 0;
        }
    }
    return answer + length * (length + 1) / 2;
}`,
        javascript: `function zeroFilledSubarray(nums) {
  let answer = 0, length = 0;
  for (const x of nums) {
    if (x === 0) length++;
    else {
      answer += length * (length + 1) / 2;
      length = 0;
    }
  }
  return answer + length * (length + 1) / 2;
}`,
      },
    },
  ],
  pitfalls: ['子陣列必須連續,非 0 會把 0 段切開。', '若陣列結尾是 0,分段公式最後仍需結算。', '全部都是 0 時答案約為 n²/2,需使用 64 位元整數。'],
  check: { kind: 'fn', fn: 'zeroFilledSubarray', cases: [
    { args: [A], out: 6 }, { args: [[0, 0, 0, 2, 0, 0]], out: 9 },
    { args: [[2, 10, 2019]], out: 0 }, { args: [[0]], out: 1 },
  ] },
}
