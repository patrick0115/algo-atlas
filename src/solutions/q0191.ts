import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 191. Number of 1 Bits

const N = 44

const bin = (x: number, w = 6) => x.toString(2).padStart(w, '0').split('')

function shiftFig(): FigStep[] {
  let x = N
  let c = 0
  const out: FigStep[] = [{ note: `${N} 的二進位是 ${N.toString(2)}。一位一位看:x & 1 是最後一位,看完就 x >> 1 把它丟掉`, views: [arr(bin(x), { label: 'x' }), arr([c], { label: 'count' })] }]
  while (x) {
    const b = x & 1
    c += b
    out.push({ note: `最後一位是 ${b}${b ? ' → count + 1' : ''};右移`, views: [arr(bin(x), { label: 'x', highlight: [5] }), arr([c], { label: 'count' })] })
    x >>= 1
  }
  out.push({ note: `x 變成 0 → 共 ${c} 個 1`, views: [arr([c], { label: 'count', done: [0] })] })
  return out
}

function kernFig(): FigStep[] {
  let x = N
  let c = 0
  const out: FigStep[] = [{ note: 'x & (x − 1) 會把**最右邊的 1** 變成 0(x − 1 會讓最右邊的 1 變 0、它右邊的 0 全變 1,& 起來就只少了那個 1)。做幾次才變 0,就有幾個 1', views: [arr(bin(x), { label: 'x' })] }]
  while (x) {
    const y = x & (x - 1)
    const pos = 5 - Math.log2(x ^ y)
    c++
    out.push({ note: `${x.toString(2).padStart(6, '0')} & ${(x - 1).toString(2).padStart(6, '0')} = ${y.toString(2).padStart(6, '0')}:拿掉一個 1,count = ${c}`, views: [arr(bin(x), { label: 'x', highlight: [pos] }), arr(bin(y), { label: 'x & (x − 1)', dim: range(0, 5).filter((i) => bin(y)[i] === '0') })] })
    x = y
  }
  out.push({ note: `只跑了 ${c} 輪(1 的個數),不是 32 輪`, views: [arr([c], { label: 'count', done: [0] })] })
  return out
}

export const q0191: Solution = {
  id: 191,
  plain: '把一個正整數寫成二進位(只有 0 和 1),數一數裡面有幾個 1。例如 11 是 1011,有 3 個 1。',
  statement: '給正整數 `n`,回傳它的二進位表示中 1 的個數(也叫 Hamming weight)。',
  examples: [
    { input: 'n = 11', output: '3', note: '1011' },
    { input: 'n = 128', output: '1', note: '10000000' },
    { input: 'n = 2147483645', output: '30' },
  ],
  constraints: ['`1 ≤ n ≤ 2³¹ − 1`'],
  insight: [
    '`n & 1` 是最後一個位元;`n >> 1` 把最後一位丟掉 → 逐位檢查,最多 32 次',
    '更快的技巧:`n & (n − 1)` 會把最右邊的 1 清掉。重複到 n 變 0,次數就是 1 的個數',
    '這個 `n & (n − 1)` 技巧在 [338. Counting Bits](#/q/338)、判斷 2 的冪次也會用到',
  ],
  approaches: [
    {
      name: '逐位檢查',
      idea: '`while n`:`count += n & 1`,`n >>= 1`。',
      steps: ['`count = 0`', '`while n`:`count += n & 1`、`n >>= 1`', '回傳 count'],
      figure: { title: `n = ${N}`, steps: shiftFig() },
      complexity: { time: 'O(位元數) = O(32)', space: 'O(1)', why: '每次丟掉一位。' },
      verdict: '最直覺。如果 n 是負數(無號題型),C/Java 要用無號右移(`>>>`)才不會無限迴圈。',
      code: {
        python: `def hammingWeight(n):
    count = 0
    while n:
        count += n & 1                        # 最後一位是不是 1
        n >>= 1                               # 丟掉最後一位
    return count`,
        c: `int hammingWeight(int n) {
    unsigned int x = n;
    int count = 0;
    while (x) { count += x & 1; x >>= 1; }
    return count;
}`,
        cpp: `int hammingWeight(int n) {
    unsigned int x = n;
    int count = 0;
    while (x) { count += x & 1; x >>= 1; }
    return count;
}`,
        java: `int hammingWeight(int n) {
    int count = 0;
    while (n != 0) { count += n & 1; n >>>= 1; }   // >>> 是無號右移
    return count;
}`,
        javascript: `function hammingWeight(n) {
  let count = 0;
  while (n) { count += n & 1; n >>>= 1; }
  return count;
}`,
      },
    },
    {
      name: 'n & (n − 1) 清掉最右邊的 1',
      idea: '每次 `n &= n − 1` 恰好少一個 1,做到 0 為止。',
      steps: ['`count = 0`', '`while n`:`n &= n − 1`、`count += 1`', '回傳 count'],
      figure: { title: `n = ${N}`, steps: kernFig() },
      complexity: { time: 'O(1 的個數)', space: 'O(1)', why: '迴圈次數等於 1 的個數,最多 32。' },
      verdict: '最推薦(Brian Kernighan 演算法),[[p:bit-manipulation]]的必備技巧。內建也可以:Python `n.bit_count()`、C++ `__builtin_popcount`、Java `Integer.bitCount`。',
      code: {
        python: `def hammingWeight(n):
    count = 0
    while n:
        n &= n - 1                            # 清掉最右邊的 1
        count += 1
    return count`,
        c: `int hammingWeight(int n) {
    unsigned int x = n;
    int count = 0;
    while (x) { x &= x - 1; count++; }
    return count;
}`,
        cpp: `int hammingWeight(int n) {
    unsigned int x = n;
    int count = 0;
    while (x) { x &= x - 1; count++; }
    return count;
}`,
        java: `int hammingWeight(int n) {
    int count = 0;
    while (n != 0) { n &= n - 1; count++; }
    return count;
}`,
        javascript: `function hammingWeight(n) {
  let count = 0;
  while (n) { n &= n - 1; count++; }
  return count;
}`,
      },
    },
  ],
  pitfalls: ['Java 對負數用 `>>`:補的是 1,永遠不會變 0', '`count += n & 1` 寫成 `count += n % 2 == 1`:可以,但負數時 `%` 的結果可能是 −1'],
  followUp: [{ q: '這個函式會被呼叫很多次?', a: '查表:預先算好 0..255 的答案,把 32 位元切成 4 個位元組各查一次。' }],
  check: {
    kind: 'fn',
    fn: 'hammingWeight',
    cases: [
      { args: [11], out: 3 },
      { args: [128], out: 1 },
      { args: [2147483645], out: 30 },
      { args: [N], out: 3 },
      { args: [1], out: 1 },
      { args: [2147483647], out: 31 },
    ],
  },
}
