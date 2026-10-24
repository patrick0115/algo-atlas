import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 213. House Robber II

const A = [2, 3, 2, 5, 1, 4]

function line(nums: number[]): { dp: number[]; best: number } {
  let a = 0
  let b = 0
  const dp: number[] = []
  for (const x of nums) {
    ;[a, b] = [b, Math.max(b, a + x)]
    dp.push(b)
  }
  return { dp, best: b }
}

function twoFig(): FigStep[] {
  const n = A.length
  const L = line(A.slice(0, n - 1))
  const R = line(A.slice(1))
  return [
    { note: '房子圍成一圈:第一間和最後一間變成「鄰居」,不能同時偷。其他地方和 198 一模一樣', views: [arr(A, { label: 'nums(頭尾相鄰)', compare: [0, n - 1] })] },
    { note: `情況一:不偷最後一間 → 只看 [0, ${n - 2}],這就是一般的 198 題。最多 ${L.best}`, views: [arr(A, { label: 'nums', range: [0, n - 2], dim: [n - 1] }), arr(L.dp, { label: 'dp(情況一)', done: [L.dp.length - 1] })] },
    { note: `情況二:不偷第一間 → 只看 [1, ${n - 1}]。最多 ${R.best}`, views: [arr(A, { label: 'nums', range: [1, n - 1], dim: [0] }), arr(R.dp, { label: 'dp(情況二)', done: [R.dp.length - 1] })] },
    { note: `頭和尾一定至少有一間不偷,所以答案一定落在這兩種情況之一:max(${L.best}, ${R.best}) = ${Math.max(L.best, R.best)}`, views: [arr([L.best, R.best], { label: '兩種情況', highlight: [L.best >= R.best ? 0 : 1] })] },
  ]
}

function stateFig(): FigStep[] {
  return [
    { note: '另一種寫法:同一次掃描裡,同時跑兩組 DP —— 一組「可用第一間、不碰最後一間」、一組「不碰第一間」。最後一間只能接在「不碰第一間」那組後面', views: [arr(A, { label: 'nums', highlight: [0] })] },
    { note: '兩組各自滾動 (prev2, prev1);走到最後一間時,「不碰最後一間」那組不能偷它。結果和方法一相同', views: [arr(A, { label: 'nums', range: [0, A.length - 1], compare: [A.length - 1] }), arr(range(1, A.length - 1).map((i) => A[i]), { label: '中間的房子兩組都能自由選' })] },
  ]
}

export const q0213: Solution = {
  id: 213,
  plain: '和打家劫舍一樣不能偷相鄰的房子,但這次房子**圍成一圈**:第一間和最後一間也是鄰居。訣竅:頭尾一定至少有一間不能偷,所以分成「不偷最後一間」和「不偷第一間」兩種情況,各算一次取最大。',
  statement: '房子排成一個圓圈,`nums[i]` 是第 i 間的金額,不能偷相鄰的兩間(第 0 間和第 n−1 間也相鄰)。回傳最多能偷到的金額。',
  examples: [
    { input: 'nums = [2,3,2]', output: '3', note: '不能同時偷 0 和 2' },
    { input: 'nums = [1,2,3,1]', output: '4' },
    { input: 'nums = [1,2,3]', output: '3' },
  ],
  constraints: ['`1 ≤ n ≤ 100`', '只有一間時,它沒有鄰居,直接偷'],
  insight: [
    '環狀的麻煩只在頭尾:第 0 間和第 n−1 間不能同時偷',
    '拆情況:① 不偷第 n−1 間 → 剩下 `nums[0..n−2]` 是一排,就是 [198](#/q/198);② 不偷第 0 間 → 剩下 `nums[1..n−1]` 是一排',
    '任何合法的偷法一定屬於其中一種(頭尾至少有一間沒偷),所以答案 = 兩者取 max',
    '只有一間時要特別處理(兩種情況都會變成空的)',
  ],
  approaches: [
    {
      name: '拆成兩條直線,各跑一次 198',
      idea: '`rob_line(nums[:-1])` 和 `rob_line(nums[1:])` 取最大;n == 1 直接回傳 nums[0]。',
      steps: ['`n == 1` → `nums[0]`', '`a = rob_line(nums[0 .. n−2])`', '`b = rob_line(nums[1 .. n−1])`', '回傳 `max(a, b)`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: twoFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩次線性掃描,用兩個變數的版本。' },
      verdict: '標準解。「環狀 → 拆成兩條線」是處理環狀問題的常用技巧。',
      code: {
        python: `def rob(nums):
    def line(houses):                     # 198 題的兩個變數版
        prev2 = prev1 = 0
        for x in houses:
            prev2, prev1 = prev1, max(prev1, prev2 + x)
        return prev1

    if len(nums) == 1:
        return nums[0]
    return max(line(nums[:-1]),           # 不偷最後一間
               line(nums[1:]))            # 不偷第一間`,
        c: `static int line(int *a, int lo, int hi) {
    int prev2 = 0, prev1 = 0;
    for (int i = lo; i <= hi; i++) {
        int cur = prev1 > prev2 + a[i] ? prev1 : prev2 + a[i];
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

int rob(int *nums, int numsSize) {
    if (numsSize == 1) return nums[0];
    int a = line(nums, 0, numsSize - 2), b = line(nums, 1, numsSize - 1);
    return a > b ? a : b;
}`,
        cpp: `int rob(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return nums[0];
    auto line = [&](int lo, int hi) {
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
            int cur = max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    };
    return max(line(0, n - 2), line(1, n - 1));
}`,
        java: `int rob(int[] nums) {
    int n = nums.length;
    if (n == 1) return nums[0];
    return Math.max(line(nums, 0, n - 2), line(nums, 1, n - 1));
}

private int line(int[] a, int lo, int hi) {
    int prev2 = 0, prev1 = 0;
    for (int i = lo; i <= hi; i++) {
        int cur = Math.max(prev1, prev2 + a[i]);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
        javascript: `function rob(nums) {
  const line = (lo, hi) => {
    let prev2 = 0, prev1 = 0;
    for (let i = lo; i <= hi; i++) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + nums[i])];
    return prev1;
  };
  const n = nums.length;
  if (n === 1) return nums[0];
  return Math.max(line(0, n - 2), line(1, n - 1));
}`,
      },
    },
    {
      name: '一次掃描,同時跑兩組 DP',
      idea: '組 A:可以用第 0 間、但不能用最後一間(等於 nums[0..n−2]);組 B:不用第 0 間。兩組各自用 (prev2, prev1) 滾動,最後 A 不能用最後一間。',
      steps: ['A:`(prev2, prev1) = (0, nums[0])`,從第 1 間跑到第 n−2 間', 'B:`(0, 0)`,從第 1 間跑到第 n−1 間', '回傳 `max(A, B)`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: stateFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '同上。' },
      verdict: '和方法一完全等價,只是把「第一間偷不偷」當成狀態。這種「把限制變成額外狀態」的想法在狀態機 DP 很常用。',
      code: {
        python: `def rob(nums):
    n = len(nums)
    if n == 1:
        return nums[0]
    a2, a1 = 0, nums[0]                   # A:不碰最後一間
    b2, b1 = 0, 0                         # B:沒偷第 0 間
    for i in range(1, n):
        if i < n - 1:                     # A 不能偷最後一間
            a2, a1 = a1, max(a1, a2 + nums[i])
        b2, b1 = b1, max(b1, b2 + nums[i])
    return max(a1, b1)`,
        c: `int rob(int *nums, int numsSize) {
    int n = numsSize;
    if (n == 1) return nums[0];
    int a2 = 0, a1 = nums[0], b2 = 0, b1 = 0;
    for (int i = 1; i < n; i++) {
        if (i < n - 1) { int c = a1 > a2 + nums[i] ? a1 : a2 + nums[i]; a2 = a1; a1 = c; }
        int d = b1 > b2 + nums[i] ? b1 : b2 + nums[i];
        b2 = b1; b1 = d;
    }
    return a1 > b1 ? a1 : b1;
}`,
        cpp: `int rob(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return nums[0];
    int a2 = 0, a1 = nums[0], b2 = 0, b1 = 0;
    for (int i = 1; i < n; i++) {
        if (i < n - 1) { int c = max(a1, a2 + nums[i]); a2 = a1; a1 = c; }
        int d = max(b1, b2 + nums[i]);
        b2 = b1; b1 = d;
    }
    return max(a1, b1);
}`,
        java: `int rob(int[] nums) {
    int n = nums.length;
    if (n == 1) return nums[0];
    int a2 = 0, a1 = nums[0], b2 = 0, b1 = 0;
    for (int i = 1; i < n; i++) {
        if (i < n - 1) { int c = Math.max(a1, a2 + nums[i]); a2 = a1; a1 = c; }
        int d = Math.max(b1, b2 + nums[i]);
        b2 = b1; b1 = d;
    }
    return Math.max(a1, b1);
}`,
        javascript: `function rob(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];
  let a2 = 0, a1 = nums[0], b2 = 0, b1 = 0;
  for (let i = 1; i < n; i++) {
    if (i < n - 1) [a2, a1] = [a1, Math.max(a1, a2 + nums[i])];
    [b2, b1] = [b1, Math.max(b1, b2 + nums[i])];
  }
  return Math.max(a1, b1);
}`,
      },
    },
  ],
  pitfalls: [
    '只有一間房子:`nums[:-1]` 和 `nums[1:]` 都是空的,答案會變成 0,要先特判',
    '以為要分三種情況(都不偷、偷頭、偷尾):「不偷尾」已經包含「頭尾都不偷」,兩種就夠',
  ],
  followUp: [{ q: '同樣「環狀拆成兩條線」的題?', a: '環狀陣列的另一招是把陣列複製一份接在後面,例如 503. Next Greater Element II;918. Maximum Sum Circular Subarray 則用「總和 − 最小子陣列和」處理跨頭尾的情況。' }],
  check: {
    kind: 'fn',
    fn: 'rob',
    cases: [
      { args: [[2, 3, 2]], out: 3 },
      { args: [[1, 2, 3, 1]], out: 4 },
      { args: [[1, 2, 3]], out: 3 },
      { args: [[7]], out: 7 },
      { args: [A], out: 12 },
      { args: [[200, 3, 140, 20, 10]], out: 340 },
    ],
  },
}
