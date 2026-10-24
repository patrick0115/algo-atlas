import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 0, 1, 0, 1]
const bruteFig: FigStep[] = [
  { note: '固定起點 0，往右加到索引 2 時和為 2：子陣列 [1,0,1] 命中。', views: [arr(A, { label: 'nums', highlight: [0, 1, 2] })] },
  { note: '同一起點再延伸一個 0，和仍為 2：[1,0,1,0] 也命中。', views: [arr(A, { label: 'nums', highlight: [0, 1, 2, 3] })] },
  { note: '改起點 1，可找到 [0,1,0,1]；起點 2 又找到 [1,0,1]。', views: [arr(A, { label: 'nums', highlight: [1, 2, 3, 4] })] },
  { note: '最後起點 3 的 [0,1] 和只有 1；總共 4 段。', views: [arr([4], { label: '答案', done: [0] })] },
]
const prefixFig: FigStep[] = [
  { note: '先放入前綴和 0 一次，表示空前綴。讀第一個 1 後，前綴和為 1，還找不到 1−2。', views: [arr(A, { label: 'nums', highlight: [0] }), arr([0, 1], { label: '已見前綴和' })] },
  { note: '讀 0 後前綴和仍為 1，於是和 1 已出現兩次。', views: [arr(A, { label: 'nums', done: [0, 1] }), arr([0, 1, 1], { label: '已見前綴和' })] },
  { note: '讀第二個 1，前綴和為 2；找 2−2=0，命中一次。讀下一個 0，前綴和仍 2，再命中一次。', views: [arr(A, { label: 'nums', done: [0, 1], highlight: [2, 3] }), arr([0, 1, 1, 2, 2], { label: '前綴和' })] },
  { note: '讀最後的 1，前綴和為 3；找 3−2=1，先前出現兩次，所以再加 2，答案 4。', views: [arr(A, { label: 'nums', highlight: [4] }), arr([4], { label: '答案', done: [0] })] },
]

export const q0930: Solution = {
  id: 930,
  plain: '在只含 0、1 的陣列中，數一數有多少段連續區間，裡面的數字加起來剛好是 goal。',
  statement: '給二元陣列 nums 與整數 goal，回傳總和恰為 goal 的非空連續子陣列數量。',
  examples: [{ input: 'nums = [1,0,1,0,1], goal = 2', output: '4' }, { input: 'nums = [0,0,0,0,0], goal = 0', output: '15' }],
  constraints: ['nums 長度至多 30000；元素只能是 0 或 1。', 'goal 可能是 0；此時零組成的區間也要全部計入。'],
  insight: ['固定左端點向右累加，能完整枚舉答案，但會重複計算。', '若前綴和目前是 S，要讓中間區間和為 goal，先前必須有前綴和 S−goal。', '用 [[p:prefix-sum]] 與 [[p:hash-map]] 記錄各種前綴和的次數。'],
  approaches: [
    {
      name: '枚舉每個起點', idea: '固定左端點，向右累加；每次總和等於 goal 就加一。',
      steps: ['對每個左端點，把 sum 設為 0。', '右端點逐步右移並累加。', 'sum 等於 goal 時增加答案。'],
      figure: { title: 'nums = [1,0,1,0,1], goal = 2', steps: bruteFig },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個起點都可能掃到陣列尾端。' },
      verdict: '適合先理解子陣列的計數方式；大資料會慢。',
      code: {
        python: `def numSubarraysWithSum(nums, goal):
    answer = 0
    for left in range(len(nums)):
        total = 0
        for right in range(left, len(nums)):
            total += nums[right]
            if total == goal:
                answer += 1  # 這段連續區間符合目標
    return answer`,
        c: `int numSubarraysWithSum(int *nums, int numsSize, int goal) {
    int answer = 0;
    for (int left = 0; left < numsSize; left++) {
        int total = 0;
        for (int right = left; right < numsSize; right++) {
            total += nums[right];
            if (total == goal) {
                answer++;
            }
        }
    }
    return answer;
}`,
        cpp: `int numSubarraysWithSum(vector<int>& nums, int goal) {
    int answer = 0;
    for (int left = 0; left < (int) nums.size(); left++) {
        int total = 0;
        for (int right = left; right < (int) nums.size(); right++) {
            total += nums[right];
            if (total == goal) {
                answer++;
            }
        }
    }
    return answer;
}`,
        java: `int numSubarraysWithSum(int[] nums, int goal) {
    int answer = 0;
    for (int left = 0; left < nums.length; left++) {
        int total = 0;
        for (int right = left; right < nums.length; right++) {
            total += nums[right];
            if (total == goal) {
                answer++;
            }
        }
    }
    return answer;
}`,
        javascript: `function numSubarraysWithSum(nums, goal) {
  let answer = 0;
  for (let left = 0; left < nums.length; left++) {
    let total = 0;
    for (let right = left; right < nums.length; right++) {
      total += nums[right];
      if (total === goal) {
        answer++;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '前綴和計數', idea: '把已看過的前綴和次數存起來；目前和是 S，就查 S−goal 的次數。',
      steps: ['計數表先放前綴和 0 一次。', '逐個累加得到目前前綴和 S。', '答案加上先前 S−goal 的出現次數，再記錄 S。'],
      figure: { title: 'nums = [1,0,1,0,1], goal = 2', steps: prefixFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個元素只處理一次；不同前綴和最多 n+1 種。' },
      verdict: '推薦解法。先查再存，避免把空區間算進去。',
      code: {
        python: `from collections import defaultdict

def numSubarraysWithSum(nums, goal):
    counts = defaultdict(int)
    counts[0] = 1  # 空前綴也能作為區間左界
    total = 0
    answer = 0
    for value in nums:
        total += value
        answer += counts[total - goal]  # 找能相減得到 goal 的舊前綴
        counts[total] += 1
    return answer`,
        c: `int numSubarraysWithSum(int *nums, int numsSize, int goal) {
    int *counts = calloc(numsSize + 1, sizeof(int));
    counts[0] = 1;
    int total = 0;
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        total += nums[i];
        if (total >= goal) {
            answer += counts[total - goal];
        }
        counts[total]++;
    }
    free(counts);
    return answer;
}`,
        cpp: `int numSubarraysWithSum(vector<int>& nums, int goal) {
    vector<int> counts(nums.size() + 1);
    counts[0] = 1;
    int total = 0;
    int answer = 0;
    for (int value : nums) {
        total += value;
        if (total >= goal) {
            answer += counts[total - goal];
        }
        counts[total]++;
    }
    return answer;
}`,
        java: `int numSubarraysWithSum(int[] nums, int goal) {
    int[] counts = new int[nums.length + 1];
    counts[0] = 1;
    int total = 0;
    int answer = 0;
    for (int value : nums) {
        total += value;
        if (total >= goal) {
            answer += counts[total - goal];
        }
        counts[total]++;
    }
    return answer;
}`,
        javascript: `function numSubarraysWithSum(nums, goal) {
  const counts = new Array(nums.length + 1).fill(0);
  counts[0] = 1;
  let total = 0;
  let answer = 0;
  for (const value of nums) {
    total += value;
    if (total >= goal) {
      answer += counts[total - goal];
    }
    counts[total]++;
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['前綴和 0 初始次數必須是 1，才能數到從索引 0 開始的區間。', '先查再存，否則 goal=0 時會多算空區間。'],
  check: { kind: 'fn', fn: 'numSubarraysWithSum', cases: [
    { args: [[1, 0, 1, 0, 1], 2], out: 4 },
    { args: [[0, 0, 0, 0, 0], 0], out: 15 },
    { args: [[1], 0], out: 0 },
    { args: [[], 0], out: 0 },
  ] },
}
