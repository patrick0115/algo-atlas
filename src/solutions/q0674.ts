import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 674. Longest Continuous Increasing Subsequence

const NUMS = [1, 3, 5, 4, 7]

function scanFig(): FigStep[] {
  const out: FigStep[] = []
  let cur = 1
  let best = 1
  out.push({
    note: '從第 0 個開始,`cur = 1`、`best = 1`(自己一個就是長度 1)',
    line: 3,
    views: [arr(NUMS, { highlight: [0] })],
  })
  for (let i = 1; i < NUMS.length; i++) {
    const up = NUMS[i] > NUMS[i - 1]
    if (up) cur++
    else cur = 1
    if (cur > best) best = cur
    out.push({
      note: up
        ? `\`${NUMS[i]} > ${NUMS[i - 1]}\`:接得下去,\`cur = ${cur}\`,更新 \`best = ${best}\``
        : `\`${NUMS[i]} ≤ ${NUMS[i - 1]}\`:斷掉了,\`cur\` 重設為 1(\`best\` 仍是 ${best})`,
      line: up ? 5 : 6,
      views: [arr(NUMS, { highlight: [i], compare: [i - 1], done: up ? Array.from({ length: cur }, (_, k) => i - cur + 1 + k) : [] })],
    })
  }
  return out
}

function dpFig(): FigStep[] {
  const n = NUMS.length
  const dp = new Array(n).fill(1)
  const out: FigStep[] = []
  out.push({
    note: '`dp[i]` = 以第 i 個數結尾的連續遞增長度,全部先填 1。',
    line: 4,
    views: [arr(NUMS, { label: 'nums' }), arr([...dp], { label: 'dp', highlight: [0] })],
  })
  let best = 1
  for (let i = 1; i < n; i++) {
    if (NUMS[i] > NUMS[i - 1]) dp[i] = dp[i - 1] + 1
    if (dp[i] > best) best = dp[i]
    out.push({
      note: NUMS[i] > NUMS[i - 1]
        ? `\`${NUMS[i]} > ${NUMS[i - 1]}\`:\`dp[${i}] = dp[${i - 1}] + 1 = ${dp[i]}\`,目前最大 ${best}`
        : `\`${NUMS[i]} ≤ ${NUMS[i - 1]}\`:接不上,\`dp[${i}] = 1\``,
      line: 7,
      views: [arr(NUMS, { label: 'nums', highlight: [i], compare: [i - 1] }), arr([...dp], { label: 'dp', highlight: [i], done: dp[i] === best ? [i] : [] })],
    })
  }
  return out
}

export const q0674: Solution = {
  id: 674,
  plain: '找出一段「連著、一路變大」的最長區段有多長。像看一串樓梯,中間只要有一階沒往上,就得從那裡重新數。',
  statement: '給整數陣列 `nums`,找出最長的**連續**(索引相鄰)且**嚴格遞增**子陣列,回傳它的長度。',
  examples: [
    { input: 'nums = [1,3,5,4,7]', output: '3', note: '`[1,3,5]` 最長,長度 3;`[4,7]` 只有 2。' },
    { input: 'nums = [2,2,2,2,2]', output: '1', note: '要嚴格變大,相等不算,所以每段都只有 1。' },
  ],
  constraints: ['1 ≤ nums.length ≤ 10⁴', '陣列非空,答案至少是 1'],
  insight: ['「連續」代表一斷就重來,不像 [[p:lis]] 可以跳著挑', '只要盯著「現在這段多長」和「看過最長多長」兩個數就夠了', '前一個比不過就把當前長度歸 1,是最典型的一維遞推 [[p:dp-1d]]'],
  approaches: [
    {
      name: '一次掃描',
      idea: '用 `cur` 記現在這段的長度,比前一個大就 `cur + 1`,否則重設為 1,全程維護最大值。',
      steps: ['`best = cur = 1`', '`for i in 1..n−1`', '`nums[i] > nums[i−1]`:`cur += 1`,否則 `cur = 1`', '`best = max(best, cur)`'],
      figure: { title: `nums = [${NUMS.join(', ')}]`, steps: scanFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只掃一遍,兩個變數就夠。' },
      verdict: '最推薦,一次掃描、常數空間,[[p:two-pointers]] 的入門手感。',
      code: {
        javascript: `function findLengthOfLCIS(nums) {
  if (nums.length === 0) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) cur++;
    else cur = 1;
    if (cur > best) best = cur;
  }
  return best;
}`,
        python: `def findLengthOfLCIS(nums):
    if not nums:
        return 0
    best = cur = 1
    for i in range(1, len(nums)):
        cur = cur + 1 if nums[i] > nums[i - 1] else 1   # 斷掉就歸 1
        best = max(best, cur)
    return best`,
        c: `int findLengthOfLCIS(int *nums, int numsSize) {
    if (numsSize == 0) return 0;
    int best = 1, cur = 1;
    for (int i = 1; i < numsSize; i++) {
        cur = nums[i] > nums[i - 1] ? cur + 1 : 1;
        if (cur > best) best = cur;
    }
    return best;
}`,
        cpp: `int findLengthOfLCIS(vector<int>& nums) {
    if (nums.empty()) return 0;
    int best = 1, cur = 1;
    for (int i = 1; i < (int)nums.size(); i++) {
        cur = nums[i] > nums[i - 1] ? cur + 1 : 1;
        best = max(best, cur);
    }
    return best;
}`,
        java: `int findLengthOfLCIS(int[] nums) {
    if (nums.length == 0) return 0;
    int best = 1, cur = 1;
    for (int i = 1; i < nums.length; i++) {
        cur = nums[i] > nums[i - 1] ? cur + 1 : 1;
        best = Math.max(best, cur);
    }
    return best;
}`,
      },
    },
    {
      name: 'DP 陣列',
      idea: '`dp[i]` 是以第 i 個數結尾的連續遞增長度:`dp[i] = nums[i] > nums[i−1] ? dp[i−1] + 1 : 1`,答案取全體最大。',
      steps: ['`dp = [1] * n`', '`for i in 1..n−1`', '`nums[i] > nums[i−1]`:`dp[i] = dp[i−1] + 1`', '`答案 = max(dp)`'],
      figure: { title: `nums = [${NUMS.join(', ')}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多存一條 `dp` 陣列。' },
      verdict: '把「現在這段」寫成明確的狀態,是理解 [[p:dp-1d]] 的好起點;空間可再壓回 O(1) 就是解法一。',
      code: {
        javascript: `function findLengthOfLCIS(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  const dp = new Array(n).fill(1);
  let best = 1;
  for (let i = 1; i < n; i++) {
    if (nums[i] > nums[i - 1]) dp[i] = dp[i - 1] + 1;
    if (dp[i] > best) best = dp[i];
  }
  return best;
}`,
        python: `def findLengthOfLCIS(nums):
    n = len(nums)
    if n == 0:
        return 0
    dp = [1] * n
    for i in range(1, n):
        if nums[i] > nums[i - 1]:
            dp[i] = dp[i - 1] + 1
    return max(dp)`,
        c: `int findLengthOfLCIS(int *nums, int numsSize) {
    if (numsSize == 0) return 0;
    int best = 1, dp = 1;
    for (int i = 1; i < numsSize; i++) {
        dp = nums[i] > nums[i - 1] ? dp + 1 : 1;
        if (dp > best) best = dp;
    }
    return best;
}`,
        cpp: `int findLengthOfLCIS(vector<int>& nums) {
    int n = nums.size();
    if (n == 0) return 0;
    vector<int> dp(n, 1);
    int best = 1;
    for (int i = 1; i < n; i++) {
        if (nums[i] > nums[i - 1]) dp[i] = dp[i - 1] + 1;
        best = max(best, dp[i]);
    }
    return best;
}`,
        java: `int findLengthOfLCIS(int[] nums) {
    int n = nums.length;
    if (n == 0) return 0;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    int best = 1;
    for (int i = 1; i < n; i++) {
        if (nums[i] > nums[i - 1]) dp[i] = dp[i - 1] + 1;
        best = Math.max(best, dp[i]);
    }
    return best;
}`,
      },
    },
  ],
  pitfalls: ['「連續」不是 [[p:lis]]:一斷就要從 1 重算,不能跨過去接', '要嚴格遞增,`nums[i] == nums[i−1]` 也算斷掉', '答案最少是 1(題目保證非空),別回傳 0'],
  check: {
    kind: 'fn',
    fn: 'findLengthOfLCIS',
    cases: [
      { args: [[1, 3, 5, 4, 7]], out: 3 },
      { args: [[2, 2, 2, 2, 2]], out: 1 },
      { args: [[1]], out: 1 },
      { args: [[1, 3, 5, 7]], out: 4 },
      { args: [[5, 4, 3, 2, 1]], out: 1 },
    ],
  },
}
