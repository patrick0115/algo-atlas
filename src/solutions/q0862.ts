import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [2, -1, 2]
const monoFig: FigStep[] = [
  { note: '建立前綴和 P=[0,2,1,3]；子陣列 [i,j) 的和是 P[j]−P[i]。', views: [arr(A, { label: 'nums' }), arr([0, 2, 1, 3], { label: 'P' })] },
  { note: '處理 P[1]=2 時，佇列有索引 0、1；兩個前綴和由小到大。', views: [arr([0, 2, 1, 3], { label: 'P', done: [0, 1] }), arr([0, 1], { label: '候選起點索引' })] },
  { note: '處理 P[2]=1，比尾端 P[1]=2 小；索引 1 被淘汰，因為索引 2 更晚且前綴和更小。', views: [arr([0, 2, 1, 3], { label: 'P', dim: [1], highlight: [2] }), arr([0, 2], { label: '候選起點索引' })] },
  { note: 'P[3]=3，與最前面的 P[0]=0 相差 3，得到長度 3，彈出索引 0；答案為 3。', views: [arr([0, 2, 1, 3], { label: 'P', compare: [0], highlight: [3] }), arr([3], { label: '最短長度', done: [0] })] },
]
const bruteFig: FigStep[] = [
  { note: '從起點 0 枚舉右端，逐步累加，不可因暫時不達標就停下來，因為有負數。', views: [arr(A, { label: 'nums', highlight: [0] })] },
  { note: '區間 [2] 的和為 2，小於 k=3；延長到 [2,-1] 後和變 1。', views: [arr(A, { label: 'nums', done: [0, 1] }), arr([2, 1], { label: '連續的和' })] },
  { note: '延長到 [2,-1,2] 後總和為 3，記錄長度 3。', views: [arr(A, { label: 'nums', done: [0, 1, 2] }), arr([3], { label: '目前最短長度' })] },
  { note: '從起點 1 與 2 再枚舉，都無法得到更短的達標區間，回傳 3。', views: [arr([3], { label: '答案', done: [0] })] },
]

export const q0862: Solution = {
  id: 862,
  plain: '陣列含負數，要找總和至少 k 的最短非空連續區間。',
  statement: '給定整數陣列 nums 與 k。回傳總和至少 k 的最短非空子陣列長度；若不存在，回傳 −1。',
  examples: [
    { input: 'nums = [1], k = 1', output: '1' },
    { input: 'nums = [1,2], k = 4', output: '-1' },
    { input: 'nums = [2,-1,2], k = 3', output: '3' },
  ],
  constraints: ['1 ≤ nums.length ≤ 10⁵', '−10⁵ ≤ nums[i] ≤ 10⁵', '1 ≤ k ≤ 10⁹'],
  insight: ['有負數時，視窗總和不會隨右端增加而單調上升，普通滑動視窗不可靠。', '前綴和把區間和轉為兩個前綴的差。', '維持前綴和遞增的候選起點：新前綴若更小且更晚，舊的大前綴永遠不會更好。'],
  approaches: [
    {
      name: '前綴和與單調佇列',
      idea: '佇列保存前綴和遞增的索引。每讀新前綴，先從頭取出已達 k 的起點，再從尾淘汰較大的前綴和。',
      steps: ['建立 P[0]=0 與所有前綴和', '掃每個右端 j；若 P[j]−P[佇列頭]≥k，更新答案並彈出頭', '當佇列尾的前綴和 ≥ P[j]，彈出尾', '把 j 放入佇列；若答案仍無限大回傳 −1'],
      figure: { title: 'nums = [2,-1,2], k = 3', steps: monoFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引最多進、出佇列各一次。' },
      verdict: '可通過大資料的 [[p:monotonic-queue]] 解法。',
      code: {
        python: `from collections import deque

def shortestSubarray(nums, k):
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)   # 前綴和可含負數
    candidates = deque()
    answer = len(nums) + 1
    for right, value in enumerate(prefix):
        while candidates and value - prefix[candidates[0]] >= k:
            answer = min(answer, right - candidates.popleft())
        while candidates and prefix[candidates[-1]] >= value:
            candidates.pop()            # 較晚且較小的起點更好
        candidates.append(right)
    return answer if answer <= len(nums) else -1`,
        c: `int shortestSubarray(int *nums, int numsSize, int k) {
    int n = numsSize;
    long long *prefix = malloc((n + 1) * sizeof(long long));
    int *deque = malloc((n + 1) * sizeof(int));
    prefix[0] = 0;
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    int front = 0;
    int back = 0;
    int answer = n + 1;
    for (int right = 0; right <= n; right++) {
        while (front < back && prefix[right] - prefix[deque[front]] >= k) {
            int length = right - deque[front++];
            if (length < answer) {
                answer = length;
            }
        }
        while (front < back && prefix[deque[back - 1]] >= prefix[right]) {
            back--;
        }
        deque[back++] = right;
    }
    free(prefix);
    free(deque);
    return answer <= n ? answer : -1;
}`,
        cpp: `int shortestSubarray(vector<int>& nums, int k) {
    int n = nums.size();
    vector<long long> prefix(n + 1);
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    deque<int> candidates;
    int answer = n + 1;
    for (int right = 0; right <= n; right++) {
        while (!candidates.empty() && prefix[right] - prefix[candidates.front()] >= k) {
            answer = min(answer, right - candidates.front());
            candidates.pop_front();
        }
        while (!candidates.empty() && prefix[candidates.back()] >= prefix[right]) {
            candidates.pop_back();
        }
        candidates.push_back(right);
    }
    return answer <= n ? answer : -1;
}`,
        java: `int shortestSubarray(int[] nums, int k) {
    int n = nums.length;
    long[] prefix = new long[n + 1];
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    int[] deque = new int[n + 1];
    int front = 0;
    int back = 0;
    int answer = n + 1;
    for (int right = 0; right <= n; right++) {
        while (front < back && prefix[right] - prefix[deque[front]] >= k) {
            answer = Math.min(answer, right - deque[front++]);
        }
        while (front < back && prefix[deque[back - 1]] >= prefix[right]) {
            back--;
        }
        deque[back++] = right;
    }
    return answer <= n ? answer : -1;
}`,
        javascript: `function shortestSubarray(nums, k) {
  const n = nums.length;
  const prefix = Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  const deque = [];
  let front = 0;
  let answer = n + 1;
  for (let right = 0; right <= n; right++) {
    while (front < deque.length && prefix[right] - prefix[deque[front]] >= k) {
      answer = Math.min(answer, right - deque[front++]);
    }
    while (front < deque.length && prefix[deque[deque.length - 1]] >= prefix[right]) {
      deque.pop();
    }
    deque.push(right);
  }
  return answer <= n ? answer : -1;
}`,
      },
    },
    {
      name: '枚舉所有起點與終點',
      idea: '固定左端，逐步往右加總；每次達到 k 就嘗試縮短答案。',
      steps: ['ans 先設為 n+1', '對每個起點 left，將總和歸零', '右端逐格前進並累加，達標時更新長度', '若仍無答案回傳 −1'],
      figure: { title: 'nums = [2,-1,2], k = 3', steps: bruteFig },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '枚舉所有連續區間。' },
      verdict: '概念基準，資料量大時會超時；用來理解負數為何使一般視窗失效。',
      code: {
        python: `def shortestSubarray(nums, k):
    answer = len(nums) + 1
    for left in range(len(nums)):
        total = 0
        for right in range(left, len(nums)):
            total += nums[right]         # 負數可讓總和下降
            if total >= k:
                answer = min(answer, right - left + 1)
    return answer if answer <= len(nums) else -1`,
        c: `int shortestSubarray(int *nums, int numsSize, int k) {
    int answer = numsSize + 1;
    for (int left = 0; left < numsSize; left++) {
        long long total = 0;
        for (int right = left; right < numsSize; right++) {
            total += nums[right];
            if (total >= k && right - left + 1 < answer) {
                answer = right - left + 1;
            }
        }
    }
    return answer <= numsSize ? answer : -1;
}`,
        cpp: `int shortestSubarray(vector<int>& nums, int k) {
    int answer = nums.size() + 1;
    for (int left = 0; left < (int)nums.size(); left++) {
        long long total = 0;
        for (int right = left; right < (int)nums.size(); right++) {
            total += nums[right];
            if (total >= k) {
                answer = min(answer, right - left + 1);
            }
        }
    }
    return answer <= (int)nums.size() ? answer : -1;
}`,
        java: `int shortestSubarray(int[] nums, int k) {
    int answer = nums.length + 1;
    for (int left = 0; left < nums.length; left++) {
        long total = 0;
        for (int right = left; right < nums.length; right++) {
            total += nums[right];
            if (total >= k) {
                answer = Math.min(answer, right - left + 1);
            }
        }
    }
    return answer <= nums.length ? answer : -1;
}`,
        javascript: `function shortestSubarray(nums, k) {
  let answer = nums.length + 1;
  for (let left = 0; left < nums.length; left++) {
    let total = 0;
    for (let right = left; right < nums.length; right++) {
      total += nums[right];
      if (total >= k) {
        answer = Math.min(answer, right - left + 1);
      }
    }
  }
  return answer <= nums.length ? answer : -1;
}`,
      },
    },
  ],
  pitfalls: ['負數讓普通滑動視窗不再保證正確。', '前綴和可能超過 32 位元整數範圍，C、C++、Java 要使用長整數。', '答案是非空子陣列，長度不能為 0。'],
  check: { kind: 'fn', fn: 'shortestSubarray', cases: [
    { args: [[1], 1], out: 1 },
    { args: [[1, 2], 4], out: -1 },
    { args: [A, 3], out: 3 },
    { args: [[84, -37, 32, 40, 95], 167], out: 3 },
    { args: [[-1, -2], 1], out: -1 },
  ] },
}
