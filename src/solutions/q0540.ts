import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 540. Single Element in a Sorted Array

const A = [1, 1, 2, 3, 3, 4, 4, 8, 8]

function bsFig(): FigStep[] {
  let lo = 0
  let hi = A.length - 1
  const out: FigStep[] = [{ note: '在落單的那個數**左邊**,每一對都從偶數索引開始(0-1、2-3…);落單的數之後,配對就錯開一格,變成從奇數索引開始。所以看「偶數索引 m 和 m+1 是不是一對」就知道答案在左還右', views: [arr(A, { label: 'nums' })] }]
  while (lo < hi) {
    let m = (lo + hi) >> 1
    if (m % 2 === 1) m--
    const pair = A[m] === A[m + 1]
    out.push({ note: `m = ${m}(調成偶數):nums[${m}] = ${A[m]}、nums[${m + 1}] = ${A[m + 1]} ${pair ? `是一對 → 左邊都正常,答案在右邊,lo = ${m + 2}` : `不是一對 → 錯開已經發生,答案在 m 或左邊,hi = ${m}`}`, views: [arr(A, { label: 'nums', range: [lo, hi], highlight: [m, m + 1] })] })
    if (pair) lo = m + 2
    else hi = m
  }
  out.push({ note: `lo = hi = ${lo} → 落單的是 ${A[lo]}`, views: [arr(A, { label: 'nums', done: [lo] })] })
  return out
}

function xorFig(): FigStep[] {
  let x = 0
  const steps = A.map((v) => (x ^= v))
  return [
    { note: '不管排序:把全部 XOR 起來,成對的互相抵消(a ^ a = 0),只剩落單的', views: [arr(A, { label: 'nums' }), arr(steps, { label: '累積 XOR' })] },
    { note: `結果 ${x}。O(n),沒有用到「已排序」,不符合題目的 O(log n)`, views: [arr([x], { label: '答案', done: [0] })] },
  ]
}

export const q0540: Solution = {
  id: 540,
  plain: '一排排好序的數字,每個數都剛好出現兩次,只有一個數只出現一次。用 O(log n) 的時間找出那個落單的。',
  statement: '給**已排序**的陣列 `nums`,除了一個元素只出現一次,其他都恰好出現兩次。找出只出現一次的元素,要求 O(log n) 時間、O(1) 空間。',
  examples: [
    { input: 'nums = [1,1,2,3,3,4,4,8,8]', output: '2' },
    { input: 'nums = [3,3,7,7,10,11,11]', output: '10' },
  ],
  constraints: ['n ≤ 10⁵,n 是奇數', '要求 O(log n)'],
  insight: ['落單的數左邊:每一對的第一個在**偶數**索引', '落單的數右邊:配對錯開,第一個變成在奇數索引', '所以檢查偶數索引 m 和 m+1 是否相等,就知道錯開發生了沒 → 二分'],
  approaches: [
    {
      name: '二分搜尋(看配對有沒有錯開)',
      idea: 'm 調成偶數;`nums[m] == nums[m+1]` → 答案在右邊(`lo = m + 2`),否則在左邊含 m(`hi = m`)。',
      steps: ['`lo, hi = 0, n − 1`', '`m = (lo + hi) // 2`;m 是奇數就減 1', '`nums[m] == nums[m + 1]` → `lo = m + 2`;否則 `hi = m`', '回傳 `nums[lo]`'],
      figure: { title: `nums = [${A}]`, steps: bsFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次範圍砍半。' },
      verdict: '最推薦。[[p:binary-search]]不一定要比大小,只要能判斷「答案在哪一半」就行。',
      code: {
        python: `def singleNonDuplicate(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        m = (lo + hi) // 2
        if m % 2 == 1:
            m -= 1                            # 讓 m 指向一對的開頭(偶數索引)
        if nums[m] == nums[m + 1]:
            lo = m + 2                        # 到 m+1 為止配對都正常
        else:
            hi = m                            # 錯開了:答案在 m 或更左
    return nums[lo]`,
        c: `int singleNonDuplicate(int *nums, int numsSize) {
    int lo = 0, hi = numsSize - 1;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (m % 2) m--;
        if (nums[m] == nums[m + 1]) lo = m + 2;
        else hi = m;
    }
    return nums[lo];
}`,
        cpp: `int singleNonDuplicate(vector<int>& nums) {
    int lo = 0, hi = nums.size() - 1;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (m % 2) m--;
        if (nums[m] == nums[m + 1]) lo = m + 2;
        else hi = m;
    }
    return nums[lo];
}`,
        java: `int singleNonDuplicate(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (m % 2 == 1) m--;
        if (nums[m] == nums[m + 1]) lo = m + 2;
        else hi = m;
    }
    return nums[lo];
}`,
        javascript: `function singleNonDuplicate(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    let m = (lo + hi) >> 1;
    if (m % 2) m--;
    if (nums[m] === nums[m + 1]) lo = m + 2;
    else hi = m;
  }
  return nums[lo];
}`,
      },
    },
    {
      name: '全部 XOR',
      idea: '`x = 0`;`x ^= 每個數`;成對的抵消,剩下落單的。',
      steps: ['`x = 0`', '`for v in nums`:`x ^= v`', '回傳 x'],
      figure: { title: `nums = [${A}]`, steps: xorFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '掃一遍。' },
      verdict: '[136](#/q/136) 的解法,完全不需要排序;但這題要求 O(log n)。',
      code: {
        python: `def singleNonDuplicate(nums):
    x = 0
    for v in nums:
        x ^= v                                # 成對的會抵消
    return x`,
        c: `int singleNonDuplicate(int *nums, int numsSize) {
    int x = 0;
    for (int i = 0; i < numsSize; i++) x ^= nums[i];
    return x;
}`,
        cpp: `int singleNonDuplicate(vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}`,
        java: `int singleNonDuplicate(int[] nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}`,
        javascript: `function singleNonDuplicate(nums) {
  return nums.reduce((x, v) => x ^ v, 0);
}`,
      },
    },
  ],
  pitfalls: ['m 不調成偶數:比較 nums[m] 和 nums[m+1] 的意義會跟著奇偶改變', '`lo = m + 1`:會落到一對的中間,下一輪判斷就亂了;要跳過整對 `m + 2`'],
  check: {
    kind: 'fn',
    fn: 'singleNonDuplicate',
    cases: [
      { args: [A], out: 2 },
      { args: [[3, 3, 7, 7, 10, 11, 11]], out: 10 },
      { args: [[1]], out: 1 },
      { args: [[1, 1, 2]], out: 2 },
      { args: [[0, 1, 1]], out: 0 },
    ],
  },
}
