import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 371. Sum of Two Integers

const W = 5
const bits = (x: number) => x.toString(2).padStart(W, '0').split('')

function loopFig(): FigStep[] {
  let a = 11
  let b = 5
  const out: FigStep[] = [{ note: '二進位加法拆成兩部分:**不進位的和** = a ^ b(1+0=1、1+1=0);**進位** = (a & b) << 1(兩個都是 1 的位置,往左進一位)。答案 = 不進位的和 + 進位 → 又是一個加法,重複直到沒有進位', views: [arr(bits(a), { label: `a = ${a}` }), arr(bits(b), { label: `b = ${b}` })] }]
  while (b !== 0) {
    const sum = a ^ b
    const carry = (a & b) << 1
    out.push({ note: `a ^ b = ${sum}(不進位的和),(a & b) << 1 = ${carry}(進位)→ 下一輪算 ${sum} + ${carry}`, views: [arr(bits(sum), { label: `a ^ b = ${sum}` }), arr(bits(carry), { label: `carry = ${carry}`, highlight: bits(carry).flatMap((c, i) => (c === '1' ? [i] : [])) })] })
    a = sum
    b = carry
  }
  out.push({ note: `進位變 0 → 答案 ${a}`, views: [arr(bits(a), { label: `答案 = ${a}`, done: [0, 1, 2, 3, 4] })] })
  return out
}

function columnFig(): FigStep[] {
  return [
    { note: '也可以模擬直式加法:從最低位開始,每一位看 a 的位元、b 的位元、進位三個數', views: [arr(['a 位元', 'b 位元', '進位'], { label: '每一位的輸入' })] },
    { note: '這一位的結果 = 三者 XOR;新的進位 = 至少兩個是 1(多數決)。做滿 32 位', views: [arr(['s = x ^ y ^ c', 'c = (x & y) | (c & (x ^ y))'], { label: '全加器' })] },
  ]
}

export const q0371: Solution = {
  id: 371,
  plain: '不准用 + 和 − 號,算出兩個整數的和。要用位元運算模擬電腦裡的加法電路。',
  statement: '給兩個整數 `a`、`b`,在不使用運算子 `+` 和 `−` 的情況下,回傳 a + b。',
  examples: [
    { input: 'a = 1, b = 2', output: '3' },
    { input: 'a = 2, b = 3', output: '5' },
  ],
  constraints: ['`−1000 ≤ a, b ≤ 1000`'],
  insight: [
    '一位一位看:1 + 1 = 10(這一位 0、進位 1);1 + 0 = 1;0 + 0 = 0',
    '「這一位」的規則就是 XOR,「進位」的規則就是 AND 再左移一位',
    '`a + b = (a ^ b) + ((a & b) << 1)`:右邊又是一個加法,但進位每次至少往左移一位,最多 32 輪就會變 0',
    'Python 的整數沒有位數上限,負數要自己用 `& 0xFFFFFFFF` 模擬 32 位元',
  ],
  approaches: [
    {
      name: 'XOR + 進位,迴圈到沒有進位',
      idea: '`while b`:`carry = (a & b) << 1`、`a = a ^ b`、`b = carry`。',
      steps: ['`while b != 0`', '`carry = (a & b) << 1`', '`a = a ^ b`、`b = carry`', '回傳 a'],
      figure: { title: 'a = 11, b = 5', steps: loopFig() },
      complexity: { time: 'O(32)', space: 'O(1)', why: '進位每輪至少往左一位。' },
      verdict: '最推薦。C/C++ 左移負數是未定義行為,要先轉成 unsigned 再移。',
      code: {
        python: `def getSum(a, b):
    M = 0xFFFFFFFF                            # 模擬 32 位元
    a, b = a & M, b & M
    while b:
        carry = ((a & b) << 1) & M
        a = a ^ b
        b = carry
    return a if a <= 0x7FFFFFFF else ~(a ^ M)  # 最高位是 1 → 轉回負數`,
        c: `int getSum(int a, int b) {
    unsigned int x = a, y = b;                // 用無號整數才能安全左移
    while (y) {
        unsigned int carry = (x & y) << 1;
        x ^= y;
        y = carry;
    }
    return (int)x;
}`,
        cpp: `int getSum(int a, int b) {
    unsigned int x = a, y = b;
    while (y) {
        unsigned int carry = (x & y) << 1;
        x ^= y;
        y = carry;
    }
    return (int)x;
}`,
        java: `int getSum(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;
        a ^= b;
        b = carry;
    }
    return a;
}`,
        javascript: `function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a ^= b;
    b = carry;
  }
  return a;
}`,
      },
    },
    {
      name: '逐位模擬全加器',
      idea: '對 32 個位元:`x = a >> i & 1`、`y = b >> i & 1`;`s = x ^ y ^ c`、`c = (x & y) | (c & (x ^ y))`;把 s 放到答案的第 i 位。',
      steps: ['`c = 0, res = 0`', '`for i in 0..31`:取 x、y,算 s 和新的 c', '`res |= s << i`', '轉回有號整數'],
      figure: { title: '全加器', steps: columnFig() },
      complexity: { time: 'O(32)', space: 'O(1)', why: '固定 32 位。' },
      verdict: '比較囉嗦,但完全對應硬體的「漣波進位加法器」,幫助理解第一種寫法為什麼對。',
      code: {
        python: `def getSum(a, b):
    res, c = 0, 0
    for i in range(32):
        x, y = (a >> i) & 1, (b >> i) & 1     # Python 負數右移會補 1,剛好是二補數
        s = x ^ y ^ c
        c = (x & y) | (c & (x ^ y))
        res |= s << i
    return res - (1 << 32) if res >> 31 else res`,
        c: `int getSum(int a, int b) {
    unsigned int x = a, y = b, res = 0, c = 0;
    for (int i = 0; i < 32; i++) {
        unsigned int p = (x >> i) & 1, q = (y >> i) & 1;
        unsigned int s = p ^ q ^ c;
        c = (p & q) | (c & (p ^ q));
        res |= s << i;
    }
    return (int)res;
}`,
        cpp: `int getSum(int a, int b) {
    unsigned int x = a, y = b, res = 0, c = 0;
    for (int i = 0; i < 32; i++) {
        unsigned int p = (x >> i) & 1, q = (y >> i) & 1;
        unsigned int s = p ^ q ^ c;
        c = (p & q) | (c & (p ^ q));
        res |= s << i;
    }
    return (int)res;
}`,
        java: `int getSum(int a, int b) {
    int res = 0, c = 0;
    for (int i = 0; i < 32; i++) {
        int p = (a >>> i) & 1, q = (b >>> i) & 1;
        int s = p ^ q ^ c;
        c = (p & q) | (c & (p ^ q));
        res |= s << i;
    }
    return res;
}`,
        javascript: `function getSum(a, b) {
  let res = 0, c = 0;
  for (let i = 0; i < 32; i++) {
    const p = (a >>> i) & 1, q = (b >>> i) & 1;
    const s = p ^ q ^ c;
    c = (p & q) | (c & (p ^ q));
    res |= s << i;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    'Python 直接照 C 的寫法:負數時進位會一直往左跑,無限迴圈 → 要用遮罩限制在 32 位元',
    'C 對負數做 `<<`:未定義行為,改用 unsigned',
    'Python 遮罩後忘了轉回負數:最高位是 1 時要 `~(a ^ M)`',
  ],
  check: {
    kind: 'fn',
    fn: 'getSum',
    cases: [
      { args: [1, 2], out: 3 },
      { args: [2, 3], out: 5 },
      { args: [11, 5], out: 16 },
      { args: [-1, 1], out: 0 },
      { args: [-12, -8], out: -20 },
      { args: [1000, -999], out: 1 },
    ],
  },
}
