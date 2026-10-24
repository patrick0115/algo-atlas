import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 231. Power of Two
export const q0231: Solution = {
  id: 231,
  plain: '判斷一個整數能不能寫成 2 一直乘自己的結果，例如 1、2、4、8。',
  statement: '給整數 n，若存在非負整數 x，使 n = 2^x，回傳 true；否則回傳 false。',
  examples: [{ input: 'n = 1', output: 'true' }, { input: 'n = 16', output: 'true' }, { input: 'n = 3', output: 'false' }],
  constraints: ['−2³¹ ≤ n ≤ 2³¹−1；非正數都不是 2 的冪。'],
  insight: ['2 的冪在二進位裡只有一個 1，例如 8 = 1000₂。', '正數 n 與 n−1 做 AND，會清掉最右側的 1；結果為 0 就表示原本只有一個 1。', '也能不碰位元運算，反覆除以 2。'],
  approaches: [
    {
      name: '位元清除最低位的 1',
      idea: '正數的二進位只有一個 1，才會滿足 n & (n−1) = 0。',
      steps: ['先排除 n ≤ 0。', '計算 n & (n−1)。', '結果是 0 就回傳 true。'],
      figure: { title: 'n = 8（二進位 1000）', steps: [
        { note: '8 的二進位是 1000，只有最高位是 1。', views: [arr([1, 0, 0, 0], { label: 'n = 8', highlight: [0] })] },
        { note: 'n−1 = 7 是 0111；從原本的 1 往後都翻轉了。', views: [arr([0, 1, 1, 1], { label: 'n−1 = 7' })] },
        { note: '逐位 AND 得 0000，表示唯一的 1 被清掉。', views: [arr([0, 0, 0, 0], { label: 'AND 結果', done: [0, 1, 2, 3] })] },
        { note: '如果 n = 10（1010），清掉最低位後仍有 1，因此不是 2 的冪。', views: [arr([1, 0, 0, 0], { label: '10 & 9 = 8', highlight: [0] })] },
      ] },
      complexity: { time: 'O(1)', space: 'O(1)', why: '固定字長整數只做一次 AND。' },
      verdict: '最短也最快；記得先排除 0。',
      code: {
        python: `def isPowerOfTwo(n):
    if n <= 0:
        return False
    return (n & (n - 1)) == 0             # 清除唯一的 1 後應為 0`,
        c: `bool isPowerOfTwo(int n) {
    if (n <= 0) {
        return false;
    }
    return (n & (n - 1)) == 0;
}`,
        cpp: `bool isPowerOfTwo(int n) {
    if (n <= 0) {
        return false;
    }
    return (n & (n - 1)) == 0;
}`,
        java: `boolean isPowerOfTwo(int n) {
    if (n <= 0) {
        return false;
    }
    return (n & (n - 1)) == 0;
}`,
        javascript: `function isPowerOfTwo(n) {
  if (n <= 0) {
    return false;
  }
  return (n & (n - 1)) === 0;
}`,
      },
    },
    {
      name: '反覆除以二',
      idea: '只要還能整除 2，就除下去；若最後恰好是 1，原數就是 2 的冪。',
      steps: ['n ≤ 0 時回傳 false。', 'n 為偶數時反覆除以 2。', '最後檢查是否等於 1。'],
      figure: { title: 'n = 16', steps: [
        { note: '16 是偶數，除以 2 得到 8。', views: [arr([16, 8], { label: '第一次', highlight: [1] })] },
        { note: '8 再除以 2 得到 4。', views: [arr([16, 8, 4], { label: '第二次', highlight: [2] })] },
        { note: '4 除以 2 得到 2。', views: [arr([16, 8, 4, 2], { label: '第三次', highlight: [3] })] },
        { note: '2 除以 2 得到 1；過程沒有遇到其他奇數，所以答案是 true。', views: [arr([16, 8, 4, 2, 1], { label: '結果', done: [4] })] },
      ] },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每一步把 n 減半。' },
      verdict: '不用懂位元運算也能寫出來。',
      code: {
        python: `def isPowerOfTwo(n):
    if n <= 0:
        return False
    while n % 2 == 0:
        n //= 2                           # 每次去掉一個因數 2
    return n == 1`,
        c: `bool isPowerOfTwo(int n) {
    if (n <= 0) {
        return false;
    }
    while (n % 2 == 0) {
        n /= 2;
    }
    return n == 1;
}`,
        cpp: `bool isPowerOfTwo(int n) {
    if (n <= 0) {
        return false;
    }
    while (n % 2 == 0) {
        n /= 2;
    }
    return n == 1;
}`,
        java: `boolean isPowerOfTwo(int n) {
    if (n <= 0) {
        return false;
    }
    while (n % 2 == 0) {
        n /= 2;
    }
    return n == 1;
}`,
        javascript: `function isPowerOfTwo(n) {
  if (n <= 0) {
    return false;
  }
  while (n % 2 === 0) {
    n /= 2;
  }
  return n === 1;
}`,
      },
    },
  ],
  pitfalls: ['0 & (0−1) 也是 0，必須先排除非正數。', 'JavaScript 位元運算會轉成有號 32 位；本題數值範圍正好適用。'],
  check: { kind: 'fn', fn: 'isPowerOfTwo', cases: [
    { args: [1], out: true }, { args: [16], out: true }, { args: [3], out: false }, { args: [0], out: false }, { args: [-2147483648], out: false },
  ] },
}
