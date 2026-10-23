import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1911. Maximum Alternating Subsequence Sum

const A = [4, 2, 5, 3]

function stateFig(): FigStep[] {
  let even = 0
  let odd = 0
  const ev: number[] = []
  const od: number[] = []
  for (const x of A) {
    const ne = Math.max(even, odd + x)
    const no = Math.max(odd, even - x)
    even = ne
    odd = no
    ev.push(even)
    od.push(odd)
  }
  return [
    { note: '挑一個子序列,交錯和 = 第 0 個 − 第 1 個 + 第 2 個 − …。記兩個狀態:`even` = 目前子序列最後一個是**加號**時的最大和;`odd` = 最後一個是**減號**時的最大和', views: [arr(A, { label: 'nums' })] },
    { note: '每個 x:`even = max(even, odd + x)`(把 x 當加號接上)、`odd = max(odd, even − x)`(把 x 當減號接上)', views: [arr(ev, { label: 'even(結尾是加)' }), arr(od, { label: 'odd(結尾是減)' })] },
    { note: `答案 even = ${ev[ev.length - 1]}:選 [4, 2, 5] → 4 − 2 + 5 = 7`, views: [arr(A, { label: '選法', done: [0, 1, 2], dim: [3] }), arr([ev[ev.length - 1]], { label: '答案', done: [0] })] },
  ]
}

function greedyFig(): FigStep[] {
  return [
    { note: '貪心觀察:把陣列畫成折線圖,答案 = 第一個數 + 之後所有「上坡」的高度總和', views: [arr(A, { label: 'nums', mode: 'bars' })] },
    { note: '4 + (5 − 2) = 7。每段上坡都可以「在谷底減、在山頂加」吃下來', views: [arr(A, { label: 'nums', mode: 'bars', highlight: [1, 2] }), arr([7], { label: '答案', done: [0] })] },
  ]
}

export const q1911: Solution = {
  id: 1911,
  plain: '從陣列裡挑一些數(保持原本順序),算「第 1 個 − 第 2 個 + 第 3 個 − 第 4 個…」。怎麼挑讓這個交錯和最大?',
  statement: '陣列的**交錯和**定義為偶數索引元素和減去奇數索引元素和。給 `nums`,回傳其任意子序列(重新編號索引)的最大交錯和。',
  examples: [
    { input: 'nums = [4,2,5,3]', output: '7', note: '[4,2,5] → 4 − 2 + 5' },
    { input: 'nums = [5,6,7,8]', output: '8', note: '只選 [8]' },
    { input: 'nums = [6,2,1,2,4,5]', output: '10', note: '[6,1,5] → 6 − 1 + 5' },
  ],
  constraints: ['n ≤ 10⁵,nums[i] ≤ 10⁵ → 答案要 64 位元'],
  insight: ['每個數有三種命運:不選、當加號、當減號', '[[p:state-machine-dp]]:記「最後一個是加號」與「最後一個是減號」兩個狀態', '等價於 [122](#/q/122) 買賣股票:第一個數 + 所有上坡'],
  approaches: [
    {
      name: '狀態機 DP',
      idea: '`even` = 結尾是加號的最大和、`odd` = 結尾是減號的最大和;`even = max(even, odd + x)`、`odd = max(odd, even − x)`。',
      steps: ['`even = odd = 0`', '每個 x:同時更新兩個狀態(用舊值)', '`even, odd = max(even, odd + x), max(odd, even − x)`', '回傳 even'],
      figure: { title: `nums = [${A}]`, steps: stateFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描、兩個變數。' },
      verdict: '最推薦,狀態機 DP 的教科書範例。',
      code: {
        python: `def maxAlternatingSum(nums):
    even = odd = 0                            # 結尾是 + / 結尾是 −
    for x in nums:
        even, odd = max(even, odd + x), max(odd, even - x)
    return even`,
        c: `long long maxAlternatingSum(int *nums, int numsSize) {
    long long even = 0, odd = 0;
    for (int i = 0; i < numsSize; i++) {
        long long ne = odd + nums[i] > even ? odd + nums[i] : even;
        long long no = even - nums[i] > odd ? even - nums[i] : odd;
        even = ne; odd = no;
    }
    return even;
}`,
        cpp: `long long maxAlternatingSum(vector<int>& nums) {
    long long even = 0, odd = 0;
    for (int x : nums) {
        long long ne = max(even, odd + x), no = max(odd, even - x);
        even = ne; odd = no;
    }
    return even;
}`,
        java: `long maxAlternatingSum(int[] nums) {
    long even = 0, odd = 0;
    for (int x : nums) {
        long ne = Math.max(even, odd + x), no = Math.max(odd, even - x);
        even = ne; odd = no;
    }
    return even;
}`,
        javascript: `function maxAlternatingSum(nums) {
  let even = 0, odd = 0;
  for (const x of nums) [even, odd] = [Math.max(even, odd + x), Math.max(odd, even - x)];
  return even;
}`,
      },
    },
    {
      name: '貪心:累加上坡',
      idea: '`ans = nums[0] + Σ max(0, nums[i] − nums[i−1])`。',
      steps: ['`ans = nums[0]`', '`for i in 1..n−1`:`nums[i] > nums[i−1]` → `ans += nums[i] − nums[i−1]`', '回傳 ans'],
      figure: { title: `nums = [${A}]`, steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '一旦看出和 [122](#/q/122) 是同一題,一行就解決。',
      code: {
        python: `def maxAlternatingSum(nums):
    ans = nums[0]
    for a, b in zip(nums, nums[1:]):
        if b > a:
            ans += b - a                      # 每段上坡:谷底減、山頂加
    return ans`,
        c: `long long maxAlternatingSum(int *nums, int numsSize) {
    long long ans = nums[0];
    for (int i = 1; i < numsSize; i++) if (nums[i] > nums[i - 1]) ans += nums[i] - nums[i - 1];
    return ans;
}`,
        cpp: `long long maxAlternatingSum(vector<int>& nums) {
    long long ans = nums[0];
    for (size_t i = 1; i < nums.size(); i++) if (nums[i] > nums[i - 1]) ans += nums[i] - nums[i - 1];
    return ans;
}`,
        java: `long maxAlternatingSum(int[] nums) {
    long ans = nums[0];
    for (int i = 1; i < nums.length; i++) if (nums[i] > nums[i - 1]) ans += nums[i] - nums[i - 1];
    return ans;
}`,
        javascript: `function maxAlternatingSum(nums) {
  let ans = nums[0];
  for (let i = 1; i < nums.length; i++) if (nums[i] > nums[i - 1]) ans += nums[i] - nums[i - 1];
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['更新 even 後用「新的 even」算 odd:兩個狀態要同時用舊值更新', '以為要選偶數個或奇數個:長度不限,通常以加號結尾最好'],
  check: {
    kind: 'fn',
    fn: 'maxAlternatingSum',
    cases: [
      { args: [A], out: 7 },
      { args: [[5, 6, 7, 8]], out: 8 },
      { args: [[6, 2, 1, 2, 4, 5]], out: 10 },
      { args: [[1]], out: 1 },
    ],
  },
}
