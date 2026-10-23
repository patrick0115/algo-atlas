import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1822. Sign of the Product of an Array
const A = [-1, -2, -3, -4, 3, 2, 1]
const signFig: FigStep[] = [
  { note: '只問乘積的正負,不用真的相乘。從正號 +1 開始,每遇到一個負數就翻轉一次。', views: [arr(A, { label: 'nums' }), arr([1, -1, 1, -1, 1], { label: '起點與四次翻轉', done: [4] })] },
  { note: '若遇到 0,不管其他數字是什麼,乘積都變成 0,可以直接回傳。', views: [arr([1, 5, 0, 2, -3], { label: '含 0 的例子', highlight: [2] }), arr([0], { label: '答案', done: [0] })] },
]
const parityFig: FigStep[] = [
  { note: '也可以只數負數個數:偶數個負數互相抵消成正號,奇數個留下負號。', views: [arr(A, { label: 'nums', compare: [0, 1, 2, 3] }), arr([4], { label: '負數個數', done: [0] })] },
  { note: '四個負數是偶數個,又沒有 0,所以答案是 +1。', views: [arr([1], { label: '答案', done: [0] })] },
]

export const q1822: Solution = {
  id: 1822,
  plain: '一串數字全部相乘,但只需回答結果是正數、負數還是零。數字可能很大,只要看有沒有 0 和負數有幾個就夠了。',
  statement: '給整數陣列 nums,若所有元素的乘積為正回傳 1,為負回傳 -1,為 0 回傳 0。',
  examples: [
    { input: 'nums = [-1,-2,-3,-4,3,2,1]', output: '1' },
    { input: 'nums = [1,5,0,2,-3]', output: '0' },
    { input: 'nums = [-1,1,-1,1,-1]', output: '-1' },
  ],
  constraints: ['至少有 1 個數;陣列可很長', '不用計算真正的乘積,避免整數溢位'],
  insight: ['乘積含 0 就是 0。', '每個負數只會改變一次正負號;兩個負數讓符號變回正。', '因此只需掃一次陣列,保存目前符號或負數個數。'],
  approaches: [
    {
      name: '逐個翻轉符號',
      idea: '初始符號為 1;遇 0 立即回傳 0,遇負數把符號乘 -1。',
      steps: ['sign = 1', '遍歷每個 x', 'x = 0 就回傳 0;x < 0 就翻轉 sign', '回傳 sign'],
      figure: { title: '符號如何變化', steps: signFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只需一個符號變數。' },
      verdict: '最直接,也不會把大數真的乘起來。',
      code: {
        python: `def arraySign(nums):
    sign = 1
    for x in nums:
        if x == 0:
            return 0
        if x < 0:
            sign = -sign
    return sign`,
        c: `int arraySign(int *nums, int numsSize) {
    int sign = 1;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] == 0) return 0;
        if (nums[i] < 0) sign = -sign;
    }
    return sign;
}`,
        cpp: `int arraySign(vector<int>& nums) {
    int sign = 1;
    for (int x : nums) {
        if (x == 0) return 0;
        if (x < 0) sign = -sign;
    }
    return sign;
}`,
        java: `int arraySign(int[] nums) {
    int sign = 1;
    for (int x : nums) {
        if (x == 0) return 0;
        if (x < 0) sign = -sign;
    }
    return sign;
}`,
        javascript: `function arraySign(nums) {
  let sign = 1;
  for (const x of nums) {
    if (x === 0) return 0;
    if (x < 0) sign = -sign;
  }
  return sign;
}`,
      },
    },
    {
      name: '計算負數奇偶',
      idea: '若沒有 0,負數個數為偶數時乘積為正,奇數時為負。',
      steps: ['neg = 0', '遍歷 nums:遇 0 回傳 0,遇負數 neg 加 1', 'neg 為偶數回傳 1,否則回傳 -1'],
      figure: { title: '負數成對抵消', steps: parityFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只保存負數計數。' },
      verdict: '便於解釋乘積符號與奇偶性的關係。',
      code: {
        python: `def arraySign(nums):
    neg = 0
    for x in nums:
        if x == 0:
            return 0
        if x < 0:
            neg += 1
    return 1 if neg % 2 == 0 else -1`,
        c: `int arraySign(int *nums, int numsSize) {
    int neg = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] == 0) return 0;
        if (nums[i] < 0) neg++;
    }
    return neg % 2 ? -1 : 1;
}`,
        cpp: `int arraySign(vector<int>& nums) {
    int neg = 0;
    for (int x : nums) {
        if (x == 0) return 0;
        if (x < 0) neg++;
    }
    return neg % 2 ? -1 : 1;
}`,
        java: `int arraySign(int[] nums) {
    int neg = 0;
    for (int x : nums) {
        if (x == 0) return 0;
        if (x < 0) neg++;
    }
    return neg % 2 == 0 ? 1 : -1;
}`,
        javascript: `function arraySign(nums) {
  let neg = 0;
  for (const x of nums) {
    if (x === 0) return 0;
    if (x < 0) neg++;
  }
  return neg % 2 === 0 ? 1 : -1;
}`,
      },
    },
  ],
  pitfalls: ['直接計算乘積可能溢位,即使答案只需 -1、0、1。', '只要有任何 0,就必須回傳 0。'],
  check: { kind: 'fn', fn: 'arraySign', cases: [
    { args: [A], out: 1 }, { args: [[1, 5, 0, 2, -3]], out: 0 },
    { args: [[-1, 1, -1, 1, -1]], out: -1 }, { args: [[1]], out: 1 },
  ] },
}
