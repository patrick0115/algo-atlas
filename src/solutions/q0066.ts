import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 66. Plus One

const D = [1, 9, 9]

function carryFig(): FigStep[] {
  const d = [...D]
  const out: FigStep[] = [{ note: '就像直式加法:從最右邊(個位)開始加 1', views: [arr(d, { label: 'digits' })] }]
  for (let i = d.length - 1; i >= 0; i--) {
    if (d[i] < 9) {
      d[i]++
      out.push({ note: `第 ${i} 位是 ${d[i] - 1} < 9 → 直接變 ${d[i]},不用再進位,結束`, views: [arr([...d], { label: 'digits', highlight: [i], done: range(i + 1, d.length - 1) })] })
      return out
    }
    d[i] = 0
    out.push({ note: `第 ${i} 位是 9 → 變成 0,進位 1 給左邊`, views: [arr([...d], { label: 'digits', highlight: [i] })] })
  }
  out.push({ note: '每一位都是 9:答案是 1 後面接一串 0', views: [arr([1, ...d], { label: 'digits', highlight: [0] })] })
  return out
}

function allNineFig(): FigStep[] {
  return [
    { note: '999 + 1:每一位都會變 0,一路進位到最左邊', views: [arr([9, 9, 9], { label: 'digits' })] },
    { note: '迴圈跑完還沒 return → 在最前面補一個 1', views: [arr([1, 0, 0, 0], { label: '答案', highlight: [0] })] },
  ]
}

export const q0066: Solution = {
  id: 66,
  plain: '一個很大的數字,每一位分開存在陣列裡(例如 [1,2,3] 代表 123)。把它加 1,再用同樣的方式回傳。重點是處理「9 進位」。',
  statement: '`digits` 是一個非負整數的各位數字,最高位在最前面,沒有前導 0。回傳這個數加 1 之後的各位數字陣列。',
  examples: [
    { input: 'digits = [1,2,3]', output: '[1,2,4]' },
    { input: 'digits = [4,3,2,1]', output: '[4,3,2,2]' },
    { input: 'digits = [9]', output: '[1,0]' },
  ],
  constraints: ['長度 ≤ 100 → 不能先轉成整數(會超過 64 位元)'],
  insight: [
    '加 1 只會影響「最右邊一串連續的 9」:它們全部變 0,再往左一位 +1',
    '從右往左:遇到不是 9 的就 +1 並**立刻回傳**;是 9 就設成 0 繼續',
    '迴圈跑完都沒回傳 → 全部都是 9 → 答案是 `[1, 0, 0, …]`,長度多 1',
  ],
  approaches: [
    {
      name: '從右往左,遇到非 9 就結束',
      idea: '`for i from n−1 to 0`:`digits[i] < 9` → `+1` 後回傳;否則設 0。跑完 → `[1] + digits`。',
      steps: ['從最後一位往前', '`< 9`:加 1,回傳', '`== 9`:設成 0,繼續往左', '全部是 9:在最前面插入 1'],
      figure: { title: `digits = [${D}]`, steps: carryFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最多掃一次;只有全部是 9 時要新開一個長度 n+1 的陣列。' },
      verdict: '最推薦:提早結束讓平均情況是 O(1)。',
      code: {
        python: `def plusOne(digits):
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits             # 沒有進位了,直接結束
        digits[i] = 0                 # 9 + 1 = 10:這位變 0,進位給左邊
    return [1] + digits               # 全部都是 9`,
        c: `int *plusOne(int *digits, int digitsSize, int *returnSize) {
    for (int i = digitsSize - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            int *res = malloc(digitsSize * sizeof(int));
            memcpy(res, digits, digitsSize * sizeof(int));
            res[i]++;
            *returnSize = digitsSize;
            return res;
        }
        digits[i] = 0;
    }
    int *res = calloc(digitsSize + 1, sizeof(int));
    res[0] = 1;
    *returnSize = digitsSize + 1;
    return res;
}`,
        cpp: `vector<int> plusOne(vector<int>& digits) {
    for (int i = digits.size() - 1; i >= 0; i--) {
        if (digits[i] < 9) { digits[i]++; return digits; }
        digits[i] = 0;
    }
    digits.insert(digits.begin(), 1);
    return digits;
}`,
        java: `int[] plusOne(int[] digits) {
    for (int i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) { digits[i]++; return digits; }
        digits[i] = 0;
    }
    int[] res = new int[digits.length + 1];
    res[0] = 1;
    return res;
}`,
        javascript: `function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) { digits[i]++; return digits; }
    digits[i] = 0;
  }
  return [1, ...digits];
}`,
      },
    },
    {
      name: '通用的進位加法',
      idea: '把「加 1」當成一般的直式加法:`carry = 1`,每一位 `sum = d + carry`、`d = sum % 10`、`carry = sum // 10`。最後 carry 還有就補在前面。',
      steps: ['`carry = 1`', '從右往左:`s = digits[i] + carry`、`digits[i] = s % 10`、`carry = s // 10`', '`carry` 是 1 → 前面補 1'],
      figure: { title: '全部都是 9 的情況', steps: allNineFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一定掃完整個陣列(不提早結束)。' },
      verdict: '比較囉嗦,但這個寫法可以直接推廣到「加任意數」、[2. Add Two Numbers](#/q/2)、415 Add Strings。',
      code: {
        python: `def plusOne(digits):
    carry = 1
    for i in range(len(digits) - 1, -1, -1):
        s = digits[i] + carry
        digits[i] = s % 10
        carry = s // 10
    return [1] + digits if carry else digits`,
        c: `int *plusOne(int *digits, int digitsSize, int *returnSize) {
    int *res = malloc((digitsSize + 1) * sizeof(int)), carry = 1;
    for (int i = digitsSize - 1; i >= 0; i--) {
        int s = digits[i] + carry;
        res[i + 1] = s % 10;
        carry = s / 10;
    }
    res[0] = carry;
    if (carry) { *returnSize = digitsSize + 1; return res; }
    *returnSize = digitsSize;
    return res + 1;    // 沒進位就跳過第 0 格(LeetCode 不會 free,所以可以這樣回傳)
}`,
        cpp: `vector<int> plusOne(vector<int>& digits) {
    int carry = 1;
    for (int i = digits.size() - 1; i >= 0; i--) {
        int s = digits[i] + carry;
        digits[i] = s % 10;
        carry = s / 10;
    }
    if (carry) digits.insert(digits.begin(), carry);
    return digits;
}`,
        java: `int[] plusOne(int[] digits) {
    int carry = 1;
    for (int i = digits.length - 1; i >= 0; i--) {
        int s = digits[i] + carry;
        digits[i] = s % 10;
        carry = s / 10;
    }
    if (carry == 0) return digits;
    int[] res = new int[digits.length + 1];
    res[0] = carry;
    System.arraycopy(digits, 0, res, 1, digits.length);
    return res;
}`,
        javascript: `function plusOne(digits) {
  let carry = 1;
  for (let i = digits.length - 1; i >= 0; i--) {
    const s = digits[i] + carry;
    digits[i] = s % 10;
    carry = Math.floor(s / 10);
  }
  return carry ? [carry, ...digits] : digits;
}`,
      },
    },
  ],
  pitfalls: [
    '先轉成整數再加 1:長度 100 的數字遠超過 64 位元',
    '全部是 9 時忘了長度要多 1',
    '遇到非 9 加完沒有馬上停:會繼續往左把其他位也改掉',
  ],
  followUp: [{ q: '同類型?', a: '67 Add Binary、415 Add Strings、[2. Add Two Numbers](#/q/2):都是「從低位往高位、帶著 carry」。' }],
  check: {
    kind: 'fn',
    fn: 'plusOne',
    cases: [
      { args: [[1, 2, 3]], out: [1, 2, 4] },
      { args: [[4, 3, 2, 1]], out: [4, 3, 2, 2] },
      { args: [[9]], out: [1, 0] },
      { args: [D], out: [2, 0, 0] },
      { args: [[9, 9, 9]], out: [1, 0, 0, 0] },
      { args: [[0]], out: [1] },
    ],
  },
}
