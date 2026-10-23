import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 918. Maximum Sum Circular Subarray

const A = [5, -3, 5]

function kadaneFig(): FigStep[] {
  return [
    { note: '環狀陣列:子陣列可以「繞過」結尾接回開頭。分兩種情況:① 不繞(一般的最大子陣列,Kadane);② 繞過去', views: [arr(A, { label: 'nums' })] },
    { note: '② 繞過去的子陣列 = 整個陣列拿掉「中間一段」。要讓它最大 → 拿掉的那段要**最小** → 總和 − 最小子陣列和', views: [arr(A, { label: 'nums', dim: [1], done: [0, 2] })] },
    { note: '總和 7,最小子陣列 −3 → 繞過去 = 10;不繞的最大 = 5。答案 max(5, 10) = 10。例外:全部是負數時「拿掉整段」會得到空陣列,要直接回傳不繞的答案', views: [arr([10], { label: '答案', done: [0] })] },
  ]
}

function dequeFig(): FigStep[] {
  return [
    { note: '另一種:把陣列接兩次,前綴和 P。長度 ≤ n 的子陣列 (i, j] 的和 = P[j] − P[i],其中 j − n ≤ i < j', views: [arr([5, -3, 5, 5, -3, 5], { label: '接兩次' }), arr([0, 5, 2, 7, 12, 9, 14], { label: 'P' })] },
    { note: '對每個 j 要在視窗 [j − n, j) 裡找最小的 P[i] → 單調遞增佇列([239](#/q/239) 的套路)。答案 = max(P[j] − 最小 P[i])', views: [arr([0, 5, 2, 7, 12, 9, 14], { label: 'P', highlight: [4], compare: [2] })] },
  ]
}

export const q0918: Solution = {
  id: 918,
  plain: '一排數字頭尾相連成一個圈。在圈上取一段連續的數字(不能重複用同一個),總和最大是多少?',
  statement: '給**環狀**整數陣列 `nums`(結尾的下一個是開頭),回傳非空子陣列的最大可能總和。子陣列中每個元素最多出現一次。',
  examples: [
    { input: 'nums = [1,-2,3,-2]', output: '3' },
    { input: 'nums = [5,-3,5]', output: '10', note: '5 + 5(繞過結尾)' },
    { input: 'nums = [-3,-2,-3]', output: '-2' },
  ],
  constraints: ['n ≤ 3·10⁴'],
  insight: ['不繞:[53](#/q/53) 的 Kadane', '繞:剩下沒選的是中間連續的一段 → 總和 − 最小子陣列和', '全部是負數時,「最小子陣列」就是整個陣列,繞的情況會變成空陣列 → 只看不繞的答案'],
  approaches: [
    {
      name: 'Kadane 求最大和最小',
      idea: '一次掃描同時算最大子陣列和 mx、最小子陣列和 mn、總和 total;答案 `max(mx, total − mn)`(mx < 0 時直接回傳 mx)。',
      steps: ['`cur_max = cur_min = 0`、`mx = −∞`、`mn = +∞`', '每個 x:`cur_max = max(x, cur_max + x)`、`cur_min = min(x, cur_min + x)`', '更新 mx、mn、total', '`mx < 0` → 回傳 mx;否則回傳 `max(mx, total − mn)`'],
      figure: { title: `nums = [${A}]`, steps: kadaneFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最推薦。「繞過去的最大」= 「總和 − 中間的最小」,這個轉換是這題的核心。',
      code: {
        python: `def maxSubarraySumCircular(nums):
    total, cur_max, cur_min = 0, 0, 0
    mx, mn = float('-inf'), float('inf')
    for x in nums:
        cur_max = max(x, cur_max + x)         # Kadane:最大子陣列
        cur_min = min(x, cur_min + x)         # 反過來:最小子陣列
        mx, mn = max(mx, cur_max), min(mn, cur_min)
        total += x
    if mx < 0:
        return mx                             # 全是負數:不能「拿掉整段」
    return max(mx, total - mn)`,
        c: `int maxSubarraySumCircular(int *nums, int numsSize) {
    int total = 0, curMax = 0, curMin = 0, mx = INT_MIN, mn = INT_MAX;
    for (int i = 0; i < numsSize; i++) {
        int x = nums[i];
        curMax = curMax + x > x ? curMax + x : x;
        curMin = curMin + x < x ? curMin + x : x;
        if (curMax > mx) mx = curMax;
        if (curMin < mn) mn = curMin;
        total += x;
    }
    if (mx < 0) return mx;
    return mx > total - mn ? mx : total - mn;
}`,
        cpp: `int maxSubarraySumCircular(vector<int>& nums) {
    int total = 0, curMax = 0, curMin = 0, mx = INT_MIN, mn = INT_MAX;
    for (int x : nums) {
        curMax = max(x, curMax + x);
        curMin = min(x, curMin + x);
        mx = max(mx, curMax);
        mn = min(mn, curMin);
        total += x;
    }
    return mx < 0 ? mx : max(mx, total - mn);
}`,
        java: `int maxSubarraySumCircular(int[] nums) {
    int total = 0, curMax = 0, curMin = 0, mx = Integer.MIN_VALUE, mn = Integer.MAX_VALUE;
    for (int x : nums) {
        curMax = Math.max(x, curMax + x);
        curMin = Math.min(x, curMin + x);
        mx = Math.max(mx, curMax);
        mn = Math.min(mn, curMin);
        total += x;
    }
    return mx < 0 ? mx : Math.max(mx, total - mn);
}`,
        javascript: `function maxSubarraySumCircular(nums) {
  let total = 0, curMax = 0, curMin = 0, mx = -Infinity, mn = Infinity;
  for (const x of nums) {
    curMax = Math.max(x, curMax + x);
    curMin = Math.min(x, curMin + x);
    mx = Math.max(mx, curMax);
    mn = Math.min(mn, curMin);
    total += x;
  }
  return mx < 0 ? mx : Math.max(mx, total - mn);
}`,
      },
    },
    {
      name: '接兩次 + 前綴和 + 單調佇列',
      idea: '前綴和 P(長度 2n + 1);對每個 j,在 `[j − n, j)` 裡找最小的 P[i],答案取 `P[j] − P[i]` 的最大值。用單調遞增佇列維護視窗最小值。',
      steps: ['`P[0] = 0`,`P[t] = P[t−1] + nums[(t−1) % n]`(t = 1..2n)', '佇列存索引,P 值遞增', '`for j in 1..2n`:彈掉 `< j − n` 的隊首;`ans = max(ans, P[j] − P[隊首])`', '把 j 從隊尾放進去(先彈掉 P 值 ≥ P[j] 的)'],
      figure: { title: `nums = [${A}]`, steps: dequeFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引進出佇列一次。' },
      verdict: '把「環狀」變成「長度受限的子陣列」的通用作法:接兩次 + [[p:monotonic-queue]]。',
      code: {
        python: `from collections import deque

def maxSubarraySumCircular(nums):
    n = len(nums)
    P = [0] * (2 * n + 1)
    for t in range(1, 2 * n + 1):
        P[t] = P[t - 1] + nums[(t - 1) % n]   # 接兩次的前綴和
    q, ans = deque([0]), float('-inf')
    for j in range(1, 2 * n + 1):
        while q[0] < j - n:
            q.popleft()                       # 子陣列長度不能超過 n
        ans = max(ans, P[j] - P[q[0]])
        while q and P[q[-1]] >= P[j]:
            q.pop()
        q.append(j)
    return ans`,
        c: `int maxSubarraySumCircular(int *nums, int numsSize) {
    int n = numsSize, *P = malloc((2 * n + 1) * sizeof(int)), *q = malloc((2 * n + 1) * sizeof(int));
    P[0] = 0;
    for (int t = 1; t <= 2 * n; t++) P[t] = P[t - 1] + nums[(t - 1) % n];
    int h = 0, tl = 0, ans = INT_MIN;
    q[tl++] = 0;
    for (int j = 1; j <= 2 * n; j++) {
        while (q[h] < j - n) h++;
        if (P[j] - P[q[h]] > ans) ans = P[j] - P[q[h]];
        while (tl > h && P[q[tl - 1]] >= P[j]) tl--;
        q[tl++] = j;
    }
    free(P); free(q);
    return ans;
}`,
        cpp: `int maxSubarraySumCircular(vector<int>& nums) {
    int n = nums.size();
    vector<int> P(2 * n + 1, 0);
    for (int t = 1; t <= 2 * n; t++) P[t] = P[t - 1] + nums[(t - 1) % n];
    deque<int> q{0};
    int ans = INT_MIN;
    for (int j = 1; j <= 2 * n; j++) {
        while (q.front() < j - n) q.pop_front();
        ans = max(ans, P[j] - P[q.front()]);
        while (!q.empty() && P[q.back()] >= P[j]) q.pop_back();
        q.push_back(j);
    }
    return ans;
}`,
        java: `int maxSubarraySumCircular(int[] nums) {
    int n = nums.length;
    int[] P = new int[2 * n + 1];
    for (int t = 1; t <= 2 * n; t++) P[t] = P[t - 1] + nums[(t - 1) % n];
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(0);
    int ans = Integer.MIN_VALUE;
    for (int j = 1; j <= 2 * n; j++) {
        while (q.peekFirst() < j - n) q.pollFirst();
        ans = Math.max(ans, P[j] - P[q.peekFirst()]);
        while (!q.isEmpty() && P[q.peekLast()] >= P[j]) q.pollLast();
        q.offerLast(j);
    }
    return ans;
}`,
        javascript: `function maxSubarraySumCircular(nums) {
  const n = nums.length, P = new Array(2 * n + 1).fill(0);
  for (let t = 1; t <= 2 * n; t++) P[t] = P[t - 1] + nums[(t - 1) % n];
  const q = [0];
  let h = 0, ans = -Infinity;
  for (let j = 1; j <= 2 * n; j++) {
    while (q[h] < j - n) h++;
    ans = Math.max(ans, P[j] - P[q[h]]);
    while (q.length > h && P[q[q.length - 1]] >= P[j]) q.pop();
    q.push(j);
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['全部是負數時回傳 total − mn = 0:那代表「空子陣列」,題目要求非空', '接兩次的作法沒限制長度 ≤ n:同一個元素會被用兩次'],
  check: {
    kind: 'fn',
    fn: 'maxSubarraySumCircular',
    cases: [
      { args: [[1, -2, 3, -2]], out: 3 },
      { args: [A], out: 10 },
      { args: [[-3, -2, -3]], out: -2 },
      { args: [[3, -1, 2, -1]], out: 4 },
      { args: [[-2]], out: -2 },
    ],
  },
}
