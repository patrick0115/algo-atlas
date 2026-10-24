import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q0258: Solution = {
  id: 258,
  plain: '把一個數字的各位數相加，若還有兩位數就繼續，直到只剩一位。',
  statement: '給非負整數 num，反覆計算十進位各位數的總和，回傳最後的一位數。',
  examples: [{ input: 'num = 38', output: '2', note: '3+8=11，再算 1+1=2。' }, { input: 'num = 0', output: '0' }],
  constraints: ['0 ≤ num ≤ 2³¹−1。'],
  insight: ['直接模擬能看清楚每一輪發生什麼。', '每次把各位相加，對 9 的餘數不變；可用數根公式。'],
  approaches: [
    {
      name: '逐輪模擬',
      idea: '只要還有兩位數，就用除 10 和取餘數抽出每一位。',
      steps: ['若 num 小於 10，直接回傳', '設 total = 0', '反覆加入 num % 10，並令 num //= 10', '用 total 開始下一輪'],
      figure: { title: 'num = 38', steps: [
        { note: '38 有兩位數，需要再加總。', views: [arr([3, 8], { label: '十位 / 個位' })] },
        { note: '取個位 8，再取十位 3，得到 8+3=11。', views: [arr([8, 3, 11], { label: '取出的位數 / 總和', highlight: [2] })] },
        { note: '11 仍有兩位，再算 1+1=2。', views: [arr([1, 1, 2], { label: '下一輪', highlight: [2] })] },
        { note: '2 已是一位數，停止。', views: [arr([2], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(log num)', space: 'O(1)', why: '每輪位數縮短，額外只用幾個變數。' },
      verdict: '最容易按題意理解。',
      code: {
        python: `def addDigits(num):
    while num >= 10:
        total = 0
        while num:
            total += num % 10  # 抽出個位
            num //= 10
        num = total
    return num`,
        c: `int addDigits(int num) {
    while (num >= 10) {
        int total = 0;
        while (num > 0) {
            total += num % 10;
            num /= 10;
        }
        num = total;
    }
    return num;
}`,
        cpp: `int addDigits(int num) {
    while (num >= 10) {
        int total = 0;
        while (num > 0) {
            total += num % 10;
            num /= 10;
        }
        num = total;
    }
    return num;
}`,
        java: `int addDigits(int num) {
    while (num >= 10) {
        int total = 0;
        while (num > 0) {
            total += num % 10;
            num /= 10;
        }
        num = total;
    }
    return num;
}`,
        javascript: `function addDigits(num) {
  while (num >= 10) {
    let total = 0;
    while (num > 0) {
      total += num % 10;
      num = Math.floor(num / 10);
    }
    num = total;
  }
  return num;
}`,
      },
    },
    {
      name: '數根公式',
      idea: '非零數的結果落在 1 到 9；結果等於 1 + (num−1) % 9。',
      steps: ['先單獨處理 num = 0', '其餘數先減 1，使 9 的倍數映到 8', '取模 9，再加 1，得到 1 到 9 的答案'],
      figure: { title: 'num = 38', steps: [
        { note: '38 的各位和為 11，兩者除以 9 的餘數都是 2。', views: [arr([38, 11], { label: '原數 / 位數和' })] },
        { note: '11 的各位和是 2，餘數仍為 2。', views: [arr([11, 2], { label: '下一輪' })] },
        { note: '直接算 (38−1) % 9 = 1。', views: [arr([37, 1], { label: '先減一 / 取模' })] },
        { note: '再加 1 得 2；若原數為 9，公式會回傳 9 而非 0。', views: [arr([2], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(1)', space: 'O(1)', why: '固定次數的算術運算。' },
      verdict: '最精簡，但須記得 0 與 9 的倍數。',
      code: {
        python: `def addDigits(num):
    if num == 0:
        return 0  # 零本身就是結果
    return 1 + (num - 1) % 9`,
        c: `int addDigits(int num) {
    if (num == 0) {
        return 0;
    }
    return 1 + (num - 1) % 9;
}`,
        cpp: `int addDigits(int num) {
    if (num == 0) {
        return 0;
    }
    return 1 + (num - 1) % 9;
}`,
        java: `int addDigits(int num) {
    if (num == 0) {
        return 0;
    }
    return 1 + (num - 1) % 9;
}`,
        javascript: `function addDigits(num) {
  if (num === 0) {
    return 0;
  }
  return 1 + (num - 1) % 9;
}`,
      },
    },
  ],
  pitfalls: ['直接回傳 num % 9 會把 9、18 等數誤判為 0。', 'num = 0 要單獨處理。'],
  check: { kind: 'fn', fn: 'addDigits', cases: [
    { args: [38], out: 2 },
    { args: [0], out: 0 },
    { args: [9], out: 9 },
    { args: [999], out: 9 },
  ] },
}
