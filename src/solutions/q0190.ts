import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 190. Reverse Bits

const W = 8
const X = 0b00010110

const bits = (x: number) => x.toString(2).padStart(W, '0').split('')

function loopFig(): FigStep[] {
  let n = X
  let res = 0
  const out: FigStep[] = [{ note: `用 ${W} 位元示範(實際是 32 位元)。每一輪:拿 n 的最後一位,塞到 res 的最後面(res 先左移空出位置),然後 n 右移`, views: [arr(bits(n), { label: 'n' }), arr(bits(res), { label: 'res' })] }]
  for (let i = 0; i < W; i++) {
    const b = n & 1
    res = (res << 1) | b
    n >>= 1
    if (i < 3 || i === W - 1) out.push({ note: `第 ${i + 1} 輪:最後一位是 ${b} → res = (res << 1) | ${b}`, views: [arr(bits(n), { label: 'n', dim: range(0, i) }), arr(bits(res), { label: 'res', highlight: [W - 1] })] })
  }
  out.push({ note: `跑滿 ${W} 輪(就算 n 已經變 0 也要跑滿,前面的 0 會變成後面的 0):${X.toString(2).padStart(W, '0')} → ${res.toString(2).padStart(W, '0')}`, views: [arr(bits(X), { label: '原本' }), arr(bits(res), { label: '反轉後', done: range(0, W - 1) })] })
  return out
}

function swapFig(): FigStep[] {
  const steps: [string, number][] = [['原本', X]]
  let x = X
  x = ((x >> 4) | (x << 4)) & 0xff
  steps.push(['左右 4 位交換', x])
  x = (((x & 0xcc) >> 2) | ((x & 0x33) << 2)) & 0xff
  steps.push(['每 4 位裡,左右 2 位交換', x])
  x = (((x & 0xaa) >> 1) | ((x & 0x55) << 1)) & 0xff
  steps.push(['每 2 位裡,左右 1 位交換', x])
  return steps.map(([t, v], i) => ({ note: i === 0 ? '分治:先交換左右兩半,再在每一半裡交換左右兩半……一路到單一位元。32 位元只要 5 次' : t, views: [arr(bits(v), { label: t, highlight: i === steps.length - 1 ? range(0, W - 1) : [] })] }))
}

export const q0190: Solution = {
  id: 190,
  plain: '把一個 32 位元整數的二進位「頭尾顛倒」:第 0 位換到第 31 位、第 1 位換到第 30 位……例如 …0001011 反轉後變成 1101000…。',
  statement: '把給定的 32 位元整數 `n` 的二進位位元順序反轉,回傳結果。(這裡的 n 保證是偶數,所以反轉後最高位是 0,答案仍是非負整數。)',
  examples: [
    { input: 'n = 43261596', output: '964176192', note: '00000010100101000001111010011100 → 00111001011110000010100101000000' },
    { input: 'n = 2147483644', output: '1073741822' },
  ],
  constraints: ['`0 ≤ n ≤ 2³¹ − 2`,n 是偶數'],
  insight: [
    '一位一位搬:取 n 的最後一位(`n & 1`),接到 res 的後面(`res << 1 | bit`),n 右移。**一定要做滿 32 次**',
    '為什麼要做滿?n 高位的 0 反轉後會變成 res 低位的 0,少做幾次結果就少乘了幾個 2',
    '進階:分治交換 —— 先交換左右 16 位,再交換每 16 位裡的左右 8 位……共 5 步,每步用遮罩一次處理所有位元',
  ],
  approaches: [
    {
      name: '逐位搬到另一邊',
      idea: '做 32 次:`res = (res << 1) | (n & 1)`;`n >>= 1`。',
      steps: ['`res = 0`', '`for _ in range(32)`:`res = (res << 1) | (n & 1)`、`n >>= 1`', '回傳 res'],
      figure: { title: `n = ${X.toString(2).padStart(W, '0')}(8 位元示範)`, steps: loopFig() },
      complexity: { time: 'O(32)', space: 'O(1)', why: '固定 32 輪。' },
      verdict: '最推薦,好寫不出錯。C 用 `uint32_t`、Java 用 `>>>` 處理無號的情況。',
      code: {
        python: `def reverseBits(n):
    res = 0
    for _ in range(32):                       # 一定跑滿 32 次
        res = (res << 1) | (n & 1)            # 把 n 的最後一位接到 res 後面
        n >>= 1
    return res`,
        c: `int reverseBits(int n) {
    uint32_t x = n, res = 0;
    for (int i = 0; i < 32; i++) {
        res = (res << 1) | (x & 1);
        x >>= 1;
    }
    return (int)res;
}`,
        cpp: `int reverseBits(int n) {
    uint32_t x = n, res = 0;
    for (int i = 0; i < 32; i++) {
        res = (res << 1) | (x & 1);
        x >>= 1;
    }
    return (int)res;
}`,
        java: `int reverseBits(int n) {
    int res = 0;
    for (int i = 0; i < 32; i++) {
        res = (res << 1) | (n & 1);
        n >>>= 1;                             // 無號右移
    }
    return res;
}`,
        javascript: `function reverseBits(n) {
  let res = 0;
  for (let i = 0; i < 32; i++) {
    res = ((res << 1) | (n & 1)) >>> 0;       // >>> 0 讓結果保持無號
    n >>>= 1;
  }
  return res;
}`,
      },
    },
    {
      name: '分治交換(遮罩)',
      idea: '`n = (n >> 16) | (n << 16)`,再用遮罩 `0xff00ff00`、`0xf0f0f0f0`、`0xcccccccc`、`0xaaaaaaaa` 依序交換 8、4、2、1 位。',
      steps: ['交換左右 16 位', '每 16 位裡交換左右 8 位(遮罩 0xff00ff00 / 0x00ff00ff)', '依序交換 4、2、1 位'],
      figure: { title: `n = ${X.toString(2).padStart(W, '0')}(8 位元示範)`, steps: swapFig() },
      complexity: { time: 'O(log 32) = 5 步', space: 'O(1)', why: '每步一次處理全部位元。' },
      verdict: '常數最小,常見於系統程式。面試時能講出概念即可。',
      code: {
        python: `def reverseBits(n):
    M = 0xFFFFFFFF
    n = ((n >> 16) | (n << 16)) & M
    n = ((n & 0xFF00FF00) >> 8) | ((n & 0x00FF00FF) << 8)
    n = ((n & 0xF0F0F0F0) >> 4) | ((n & 0x0F0F0F0F) << 4)
    n = ((n & 0xCCCCCCCC) >> 2) | ((n & 0x33333333) << 2)
    n = ((n & 0xAAAAAAAA) >> 1) | ((n & 0x55555555) << 1)
    return n`,
        c: `int reverseBits(int n) {
    uint32_t x = n;
    x = (x >> 16) | (x << 16);
    x = ((x & 0xFF00FF00u) >> 8) | ((x & 0x00FF00FFu) << 8);
    x = ((x & 0xF0F0F0F0u) >> 4) | ((x & 0x0F0F0F0Fu) << 4);
    x = ((x & 0xCCCCCCCCu) >> 2) | ((x & 0x33333333u) << 2);
    x = ((x & 0xAAAAAAAAu) >> 1) | ((x & 0x55555555u) << 1);
    return (int)x;
}`,
        cpp: `int reverseBits(int n) {
    uint32_t x = n;
    x = (x >> 16) | (x << 16);
    x = ((x & 0xFF00FF00u) >> 8) | ((x & 0x00FF00FFu) << 8);
    x = ((x & 0xF0F0F0F0u) >> 4) | ((x & 0x0F0F0F0Fu) << 4);
    x = ((x & 0xCCCCCCCCu) >> 2) | ((x & 0x33333333u) << 2);
    x = ((x & 0xAAAAAAAAu) >> 1) | ((x & 0x55555555u) << 1);
    return (int)x;
}`,
        java: `int reverseBits(int n) {
    n = (n >>> 16) | (n << 16);
    n = ((n & 0xFF00FF00) >>> 8) | ((n & 0x00FF00FF) << 8);
    n = ((n & 0xF0F0F0F0) >>> 4) | ((n & 0x0F0F0F0F) << 4);
    n = ((n & 0xCCCCCCCC) >>> 2) | ((n & 0x33333333) << 2);
    n = ((n & 0xAAAAAAAA) >>> 1) | ((n & 0x55555555) << 1);
    return n;
}`,
        javascript: `function reverseBits(n) {
  n = ((n >>> 16) | (n << 16)) >>> 0;
  n = (((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8)) >>> 0;
  n = (((n & 0xf0f0f0f0) >>> 4) | ((n & 0x0f0f0f0f) << 4)) >>> 0;
  n = (((n & 0xcccccccc) >>> 2) | ((n & 0x33333333) << 2)) >>> 0;
  n = (((n & 0xaaaaaaaa) >>> 1) | ((n & 0x55555555) << 1)) >>> 0;
  return n;
}`,
      },
    },
  ],
  pitfalls: [
    '`while n:` 代替固定 32 次:n 變 0 就停,高位的 0 沒有搬過去,答案少乘好幾個 2',
    'Java / JS 用 `>>`:負數時會補 1',
    'Python 的分治版本第一步沒 `& 0xFFFFFFFF`:左移會超過 32 位元',
  ],
  followUp: [{ q: '會被呼叫很多次?', a: '查表:預先算好每個位元組(0..255)反轉後的值,32 位元切成 4 塊各查一次再拼起來。' }],
  check: {
    kind: 'fn',
    fn: 'reverseBits',
    cases: [
      { args: [43261596], out: 964176192 },
      { args: [2147483644], out: 1073741822 },
      { args: [0], out: 0 },
      { args: [2], out: 1073741824 },
      { args: [X], out: 1744830464 },
    ],
  },
}
