import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

const A = [2, 2, 3, 2]

function bitFig(): FigStep[] {
  return [
    { note: '看低位元即可理解例子：2 的二進位是 10，3 是 11；三個 2 在每個位元上的 1 都貢獻 3 的倍數。', views: [kv([[2, '10'], [3, '11']], '二進位')] },
    { note: '第 0 位只有 3 有 1，總數 1；1 mod 3 = 1，答案第 0 位是 1。', views: [arr(A, { label: '第 0 位', highlight: [2] })] },
    { note: '第 1 位四個數都是 1，總數 4；4 mod 3 = 1，答案第 1 位也是 1。', views: [arr([1, 4], { label: '各位元的 1 個數' })] },
    { note: '兩位組回 11₂=3。實作時看完整 32 位，負數也能還原。', views: [arr([3], { label: '答案', done: [0] })] },
  ]
}

function stateFig(): FigStep[] {
  return [
    { note: 'ones 記某位目前出現 1 次，twos 記出現 2 次；初始都是 0。讀第一個 2 後 ones=2、twos=0。', views: [kv([['ones', 2], ['twos', 0]], '讀第一個 2')] },
    { note: '讀第二個 2：該位從「1 次」進到「2 次」，ones=0、twos=2。', views: [kv([['ones', 0], ['twos', 2]], '讀第二個 2')] },
    { note: '讀 3：第 1 位進到第 3 次而清零；第 0 位首次出現，ones=1、twos=0。', views: [kv([['ones', 1], ['twos', 0]], '讀 3')] },
    { note: '讀最後一個 2：第 1 位又首次出現，ones=3。最後 ones 就是只出現一次的 3。', views: [kv([['ones', 3], ['twos', 0]], '答案')] },
  ]
}

export const q0137: Solution = {
  id: 137,
  plain: '陣列裡只有一個數出現一次，其餘數都出現三次；找出那個獨特的數。',
  statement: '給非空整數陣列 nums，恰有一個元素出現一次，其餘每個元素恰出現三次。回傳只出現一次的元素。',
  examples: [{ input: 'nums = [2,2,3,2]', output: '3' }, { input: 'nums = [0,1,0,1,0,1,99]', output: '99' }],
  constraints: ['`1 ≤ nums.length ≤ 3 × 10⁴`', '值在 32 位有號整數範圍內。'],
  insight: ['每個位元分開看：成三組出現的數會讓該位元的 1 的總數增加 3 的倍數；對 3 取餘只剩獨特數。', '也可用 ones、twos 兩個位元集合記錄每一位出現次數 mod 3 的狀態。'],
  approaches: [
    {
      name: '逐位元統計後取模',
      idea: '對 32 個位元各自統計 1 的個數，取 mod 3 後組成答案。',
      steps: ['對 bit=0..31 計算該位的 1 個數。', '若個數 mod 3 為 1，就把該位加進答案。', '把 32 位結果還原成有號整數。'],
      figure: { title: 'nums = [2,2,3,2]', steps: bitFig() },
      complexity: { time: 'O(32n)', space: 'O(1)', why: '固定 32 個位元，各掃一次陣列。' },
      verdict: '最容易證明；負數需要正確處理符號位。',
      code: {
        python: `def singleNumber(nums):
    answer = 0
    for bit in range(32):
        count = sum((x >> bit) & 1 for x in nums)
        if count % 3:
            answer |= 1 << bit  # 三次出現者在此位被抵消
    if answer >= 1 << 31:
        answer -= 1 << 32  # 還原 32 位有號數
    return answer`,
        c: `int singleNumber(int *nums, int numsSize) {
    uint32_t answer = 0;
    for (int bit = 0; bit < 32; bit++) {
        int count = 0;
        for (int i = 0; i < numsSize; i++) {
            count += ((uint32_t)nums[i] >> bit) & 1u;
        }
        if (count % 3) {
            answer |= 1u << bit;
        }
    }
    return (int32_t)answer;
}`,
        cpp: `int singleNumber(vector<int>& nums) {
    uint32_t answer = 0;
    for (int bit = 0; bit < 32; bit++) {
        int count = 0;
        for (int x : nums) {
            count += (static_cast<uint32_t>(x) >> bit) & 1u;
        }
        if (count % 3) {
            answer |= 1u << bit;
        }
    }
    return static_cast<int32_t>(answer);
}`,
        java: `int singleNumber(int[] nums) {
    int answer = 0;
    for (int bit = 0; bit < 32; bit++) {
        int count = 0;
        for (int x : nums) {
            count += (x >>> bit) & 1;
        }
        if (count % 3 != 0) {
            answer |= 1 << bit;
        }
    }
    return answer;
}`,
        javascript: `function singleNumber(nums) {
  let answer = 0;
  for (let bit = 0; bit < 32; bit++) {
    let count = 0;
    for (const x of nums) {
      count += (x >>> bit) & 1;
    }
    if (count % 3 !== 0) {
      answer |= 1 << bit;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '兩個位元狀態計數器',
      idea: 'ones、twos 對每個位元表示出現 1 次、2 次；第 3 次到來時兩者清零。',
      steps: ['ones=twos=0。', '逐個 x 更新 `ones=(ones xor x) and not twos`。', '再更新 `twos=(twos xor x) and not ones`。', '掃完 ones 就是獨特數。'],
      figure: { title: 'nums = [2,2,3,2]', steps: stateFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個數只做固定幾次位元運算。' },
      verdict: '省去 32 次掃描；更新順序不可顛倒。',
      code: {
        python: `def singleNumber(nums):
    ones = twos = 0
    for x in nums:
        ones = (ones ^ x) & ~twos  # 剛出現一次的位元
        twos = (twos ^ x) & ~ones  # 剛出現兩次的位元
    return ones`,
        c: `int singleNumber(int *nums, int numsSize) {
    int ones = 0;
    int twos = 0;
    for (int i = 0; i < numsSize; i++) {
        ones = (ones ^ nums[i]) & ~twos;
        twos = (twos ^ nums[i]) & ~ones;
    }
    return ones;
}`,
        cpp: `int singleNumber(vector<int>& nums) {
    int ones = 0;
    int twos = 0;
    for (int x : nums) {
        ones = (ones ^ x) & ~twos;
        twos = (twos ^ x) & ~ones;
    }
    return ones;
}`,
        java: `int singleNumber(int[] nums) {
    int ones = 0;
    int twos = 0;
    for (int x : nums) {
        ones = (ones ^ x) & ~twos;
        twos = (twos ^ x) & ~ones;
    }
    return ones;
}`,
        javascript: `function singleNumber(nums) {
  let ones = 0;
  let twos = 0;
  for (const x of nums) {
    ones = (ones ^ x) & ~twos;
    twos = (twos ^ x) & ~ones;
  }
  return ones;
}`,
      },
    },
  ],
  pitfalls: ['一般 XOR 只能消掉出現兩次的數，無法直接消掉三次。', 'Python 位元統計須把第 31 位還原成負數；JavaScript 位元運算本身就是 32 位有號數。'],
  check: { kind: 'fn', fn: 'singleNumber', cases: [{ args: [A], out: 3 }, { args: [[0, 1, 0, 1, 0, 1, 99]], out: 99 }, { args: [[-2, -2, -2, -7]], out: -7 }, { args: [[-2147483648, 1, 1, 1]], out: -2147483648 }] },
}
