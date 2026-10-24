import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q0342: Solution = {
  id: 342,
  plain: '判斷一個整數是不是 1、4、16、64……這樣的 4 的整數次方。',
  statement: '給整數 n，若存在非負整數 k，使 n = 4^k，回傳 true。',
  examples: [{ input: 'n = 16', output: 'true' }, { input: 'n = 5', output: 'false' }, { input: 'n = 1', output: 'true' }],
  constraints: ['n 在 32 位有號整數範圍內。'],
  insight: ['4 的冪可以反覆整除 4，最後恰好到 1。', '也可以先判斷是 2 的冪，再檢查唯一的 1 是否位於偶數位。'],
  approaches: [
    {
      name: '反覆除以 4',
      idea: '每次確定可被 4 整除再縮小，最後看是否停在 1。',
      steps: ['若 n ≤ 0，立即回傳 false', '只要 n 能整除 4，就除以 4', '結束後檢查 n == 1'],
      figure: { title: 'n = 16', steps: [
        { note: '16 為正，且 16 ÷ 4 = 4，進入下一輪。', views: [arr([16, 4], { label: '前 / 後', highlight: [1] })] },
        { note: '4 仍可整除 4，得到 1。', views: [arr([4, 1], { label: '前 / 後', highlight: [1] })] },
        { note: '1 無法再被 4 整除，迴圈停止。', views: [arr([1], { label: '停止值' })] },
        { note: '停在 1，代表原數就是 4²，回傳 true。', views: [arr([16, 4, 1], { label: '除法路徑', done: [2] })] },
      ] },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每輪把數縮為四分之一。' },
      verdict: '判斷過程直接對應定義。',
      code: {
        python: `def isPowerOfFour(n):
    if n <= 0:
        return False
    while n % 4 == 0:
        n //= 4  # 去掉一個 4 因子
    return n == 1`,
        c: `bool isPowerOfFour(int n) {
    if (n <= 0) {
        return false;
    }
    while (n % 4 == 0) {
        n /= 4;
    }
    return n == 1;
}`,
        cpp: `bool isPowerOfFour(int n) {
    if (n <= 0) {
        return false;
    }
    while (n % 4 == 0) {
        n /= 4;
    }
    return n == 1;
}`,
        java: `boolean isPowerOfFour(int n) {
    if (n <= 0) {
        return false;
    }
    while (n % 4 == 0) {
        n /= 4;
    }
    return n == 1;
}`,
        javascript: `function isPowerOfFour(n) {
  if (n <= 0) {
    return false;
  }
  while (n % 4 === 0) {
    n /= 4;
  }
  return n === 1;
}`,
      },
    },
    {
      name: '位元遮罩',
      idea: '4 的冪只有一個 1 位元，且這個位元只可能在第 0、2、4……位。',
      steps: ['先檢查 n > 0', '用 n & (n−1) == 0 確認只有一個 1', '用遮罩 0x55555555 確認 1 落在偶數位'],
      figure: { title: 'n = 16，二進位 10000', steps: [
        { note: '16 的二進位只有第 4 位是 1。', views: [arr([1, 0, 0, 0, 0], { label: '10000', highlight: [0] })] },
        { note: '16 & 15 = 0，證明 1 位元只有一個。', views: [arr([16, 15, 0], { label: 'n / n−1 / AND' })] },
        { note: '遮罩的第 0、2、4……位為 1；第 4 位通過。', views: [arr([1, 0, 1, 0, 1], { label: '遮罩末五位', highlight: [0] })] },
        { note: '兩個條件都成立，所以 16 是 4 的冪。', views: [arr([16], { label: '答案：true', done: [0] })] },
      ] },
      complexity: { time: 'O(1)', space: 'O(1)', why: '固定次數的 32 位元運算。' },
      verdict: '適合練習 2 的冪與位元位置。',
      code: {
        python: `def isPowerOfFour(n):
    return n > 0 and (n & (n - 1)) == 0 and (n & 0x55555555) != 0  # 只留偶數位`,
        c: `bool isPowerOfFour(int n) {
    if (n <= 0) {
        return false;
    }
    return (n & (n - 1)) == 0 && (n & 0x55555555) != 0;
}`,
        cpp: `bool isPowerOfFour(int n) {
    if (n <= 0) {
        return false;
    }
    return (n & (n - 1)) == 0 && (n & 0x55555555) != 0;
}`,
        java: `boolean isPowerOfFour(int n) {
    if (n <= 0) {
        return false;
    }
    return (n & (n - 1)) == 0 && (n & 0x55555555) != 0;
}`,
        javascript: `function isPowerOfFour(n) {
  if (n <= 0) {
    return false;
  }
  return (n & (n - 1)) === 0 && (n & 0x55555555) !== 0;
}`,
      },
    },
  ],
  pitfalls: ['0 與負數都不是 4 的冪。', '只檢查 2 的冪不夠，2、8、32 也會通過。'],
  check: { kind: 'fn', fn: 'isPowerOfFour', cases: [
    { args: [16], out: true },
    { args: [5], out: false },
    { args: [1], out: true },
    { args: [0], out: false },
    { args: [8], out: false },
  ] },
}
