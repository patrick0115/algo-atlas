import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 268. Missing Number

const A = [3, 0, 1]

function sumFig(): FigStep[] {
  const n = A.length
  const total = (n * (n + 1)) / 2
  const s = A.reduce((a, b) => a + b, 0)
  return [
    { note: `0..${n} 全部都在的話,總和是 0 + 1 + … + ${n} = ${n}·${n + 1}/2 = ${total}`, views: [arr(range(0, n), { label: `完整的 0..${n}` })] },
    { note: `陣列的總和是 ${A.join(' + ')} = ${s}。少掉的就是 ${total} − ${s} = ${total - s}`, views: [arr(A, { label: 'nums' }), arr(range(0, n), { label: `0..${n}`, highlight: [total - s] })] },
  ]
}

function xorFig(): FigStep[] {
  const n = A.length
  let x = n
  const out: FigStep[] = [{ note: `把 0..${n} 和陣列裡的數**全部** XOR 起來:出現兩次的互相抵消(a ^ a = 0),只剩缺的那個。x 從 n = ${n} 開始`, views: [arr(A, { label: 'nums' }), arr([x], { label: 'x' })] }]
  A.forEach((v, i) => {
    const before = x
    x ^= i ^ v
    out.push({ note: `x ^= ${i}(索引)^ ${v}(值):${before} → ${x}`, views: [arr(A, { label: 'nums', highlight: [i] }), arr([x], { label: 'x', highlight: [0] })] })
  })
  out.push({ note: `答案 ${x}`, views: [arr([x], { label: 'x', done: [0] })] })
  return out
}

export const q0268: Solution = {
  id: 268,
  plain: '陣列裡本來應該有 0 到 n 共 n + 1 個數,但只放了 n 個(每個數都不重複),少了哪一個?',
  statement: '給一個包含 `[0, n]` 中 n 個**不同**數字的陣列 `nums`,找出範圍內唯一沒出現的那個數。',
  examples: [
    { input: 'nums = [3,0,1]', output: '2' },
    { input: 'nums = [0,1]', output: '2' },
    { input: 'nums = [9,6,4,2,3,5,7,0,1]', output: '8' },
  ],
  constraints: ['`n ≤ 10⁴`', 'Follow-up:O(1) 額外空間、O(n) 時間'],
  insight: [
    '集合 / 排序都可以,但要額外空間或 O(n log n)',
    '**數學**:0..n 的總和是 `n(n+1)/2`,減掉陣列的總和就是缺的數',
    '**XOR**:把 0..n 和陣列全部 XOR,成對的抵消,剩下缺的那個([136. Single Number](#/q/136) 的同一招)',
  ],
  approaches: [
    {
      name: '總和相減',
      idea: '`n·(n+1)/2 − sum(nums)`。',
      steps: ['`n = len(nums)`', '回傳 `n·(n+1)//2 − sum(nums)`'],
      figure: { title: `nums = [${A}]`, steps: sumFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '加一次總和。' },
      verdict: '最好想。n ≤ 10⁴ 時總和約 5·10⁷,int 不會溢位;n 更大時改用 XOR 或邊加邊減。',
      code: {
        python: `def missingNumber(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)       # 應有的總和 − 實際的總和`,
        c: `int missingNumber(int *nums, int numsSize) {
    int n = numsSize, s = n * (n + 1) / 2;
    for (int i = 0; i < n; i++) s -= nums[i];
    return s;
}`,
        cpp: `int missingNumber(vector<int>& nums) {
    int n = nums.size(), s = n * (n + 1) / 2;
    for (int x : nums) s -= x;
    return s;
}`,
        java: `int missingNumber(int[] nums) {
    int n = nums.length, s = n * (n + 1) / 2;
    for (int x : nums) s -= x;
    return s;
}`,
        javascript: `function missingNumber(nums) {
  const n = nums.length;
  return (n * (n + 1)) / 2 - nums.reduce((a, b) => a + b, 0);
}`,
      },
    },
    {
      name: 'XOR 索引和值',
      idea: '`x = n`;`x ^= i ^ nums[i]`(i 從 0 到 n−1)。索引 0..n−1 加上一開始的 n,剛好是完整的 0..n。',
      steps: ['`x = n`', '`for i`:`x ^= i ^ nums[i]`', '回傳 x'],
      figure: { title: `nums = [${A}]`, steps: xorFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '完全不會溢位,[[p:bit-manipulation]]的經典應用。',
      code: {
        python: `def missingNumber(nums):
    x = len(nums)
    for i, v in enumerate(nums):
        x ^= i ^ v                            # 索引和值都 XOR 進去,成對的抵消
    return x`,
        c: `int missingNumber(int *nums, int numsSize) {
    int x = numsSize;
    for (int i = 0; i < numsSize; i++) x ^= i ^ nums[i];
    return x;
}`,
        cpp: `int missingNumber(vector<int>& nums) {
    int x = nums.size();
    for (int i = 0; i < (int)nums.size(); i++) x ^= i ^ nums[i];
    return x;
}`,
        java: `int missingNumber(int[] nums) {
    int x = nums.length;
    for (int i = 0; i < nums.length; i++) x ^= i ^ nums[i];
    return x;
}`,
        javascript: `function missingNumber(nums) {
  let x = nums.length;
  nums.forEach((v, i) => (x ^= i ^ v));
  return x;
}`,
      },
    },
  ],
  pitfalls: ['XOR 版本忘了一開始放 n:索引只有 0..n−1,缺 n 的情況會答錯', '總和用 `(n + 1) · n / 2` 時 n 很大會溢位'],
  followUp: [{ q: '陣列可以修改、要找「缺少的最小正整數」?', a: '41. First Missing Positive:把每個數放到它該在的位置(nums[i] 放到索引 nums[i]−1),O(n) 時間 O(1) 空間。' }],
  check: {
    kind: 'fn',
    fn: 'missingNumber',
    cases: [
      { args: [A], out: 2 },
      { args: [[0, 1]], out: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], out: 8 },
      { args: [[1]], out: 0 },
      { args: [[0]], out: 1 },
    ],
  },
}
