import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q1342: Solution = {
  id: 1342,
  plain: '把一個數變成 0：偶數除以 2，奇數減 1；數一數總共做幾步。',
  statement: '給非負整數 num。重複執行：偶數除以 2，奇數減 1，直到變成 0。回傳操作次數。',
  examples: [{ input: 'num = 14', output: '6' }, { input: 'num = 8', output: '4' }, { input: 'num = 0', output: '0' }],
  constraints: ['0 ≤ num ≤ 10⁶。'],
  insight: ['題目的規則已經決定每一步，照做即可。', '從二進位看，每個 1 都要減一次，每個非最後位都要右移一次。'],
  approaches: [
    {
      name: '照規則模擬',
      idea: '在 num 大於 0 時反覆依奇偶更新，並累計步數。',
      steps: ['令 steps = 0', '若 num 是偶數，除以 2', '若 num 是奇數，減 1', '每輪增加 steps，直到 num = 0'],
      figure: { title: 'num = 14', steps: [
        { note: '14 是偶數，除以 2 得 7，走 1 步。', views: [arr([14, 7], { label: '前 / 後', highlight: [1] })] },
        { note: '7 是奇數，減 1 得 6；6 再除以 2 得 3，累計 3 步。', views: [arr([7, 6, 3], { label: '接下來', highlight: [2] })] },
        { note: '3 減 1 得 2，2 除以 2 得 1，累計 5 步。', views: [arr([3, 2, 1], { label: '接下來', highlight: [2] })] },
        { note: '1 再減 1 得 0，共 6 步。', views: [arr([1, 0, 6], { label: '最後 / 步數', done: [2] })] },
      ] },
      complexity: { time: 'O(log num)', space: 'O(1)', why: '每至多兩步就把數值至少減半。' },
      verdict: '題意最直接的實作。',
      code: {
        python: `def numberOfSteps(num):
    steps = 0
    while num > 0:
        if num % 2 == 0:
            num //= 2  # 偶數折半
        else:
            num -= 1  # 奇數先變偶數
        steps += 1
    return steps`,
        c: `int numberOfSteps(int num) {
    int steps = 0;
    while (num > 0) {
        if (num % 2 == 0) {
            num /= 2;
        } else {
            num--;
        }
        steps++;
    }
    return steps;
}`,
        cpp: `int numberOfSteps(int num) {
    int steps = 0;
    while (num > 0) {
        if (num % 2 == 0) {
            num /= 2;
        } else {
            num--;
        }
        steps++;
    }
    return steps;
}`,
        java: `int numberOfSteps(int num) {
    int steps = 0;
    while (num > 0) {
        if (num % 2 == 0) {
            num /= 2;
        } else {
            num--;
        }
        steps++;
    }
    return steps;
}`,
        javascript: `function numberOfSteps(num) {
  let steps = 0;
  while (num > 0) {
    if (num % 2 === 0) {
      num /= 2;
    } else {
      num--;
    }
    steps++;
  }
  return steps;
}`,
      },
    },
    {
      name: '數二進位的 1',
      idea: '非零數的答案是二進位 1 的個數，加上位數減 1。',
      steps: ['num = 0 時直接回傳 0', '逐位檢查 num & 1，累計 1 的數量', '每次右移並累計位數', '回傳 1 的數量 + 位數 − 1'],
      figure: { title: '14 的二進位是 1110', steps: [
        { note: '1110 有四個二進位位數。', views: [arr([1, 1, 1, 0], { label: '二進位' })] },
        { note: '其中有三個 1，代表要做三次減 1。', views: [arr([1, 1, 1, 0], { label: '需要減一', highlight: [0, 1, 2] })] },
        { note: '從四位移到一位，再移到 0 前，需三次除以 2。', views: [arr([14, 7, 3, 1], { label: '每次右移' })] },
        { note: '減一 3 次，加上折半 3 次，共 6 步。', views: [arr([3, 3, 6], { label: '減一 / 折半 / 總數', done: [2] })] },
      ] },
      complexity: { time: 'O(log num)', space: 'O(1)', why: '逐位右移，每位處理一次。' },
      verdict: '適合練習位元表示與操作次數的關係。',
      code: {
        python: `def numberOfSteps(num):
    if num == 0:
        return 0
    ones = 0
    bits = 0
    while num:
        ones += num & 1  # 這一位若為 1，就需減一次
        bits += 1
        num >>= 1
    return ones + bits - 1`,
        c: `int numberOfSteps(int num) {
    if (num == 0) {
        return 0;
    }
    int ones = 0;
    int bits = 0;
    while (num > 0) {
        ones += num & 1;
        bits++;
        num >>= 1;
    }
    return ones + bits - 1;
}`,
        cpp: `int numberOfSteps(int num) {
    if (num == 0) {
        return 0;
    }
    int ones = 0;
    int bits = 0;
    while (num > 0) {
        ones += num & 1;
        bits++;
        num >>= 1;
    }
    return ones + bits - 1;
}`,
        java: `int numberOfSteps(int num) {
    if (num == 0) {
        return 0;
    }
    int ones = 0;
    int bits = 0;
    while (num > 0) {
        ones += num & 1;
        bits++;
        num >>= 1;
    }
    return ones + bits - 1;
}`,
        javascript: `function numberOfSteps(num) {
  if (num === 0) {
    return 0;
  }
  let ones = 0;
  let bits = 0;
  while (num > 0) {
    ones += num & 1;
    bits++;
    num >>= 1;
  }
  return ones + bits - 1;
}`,
      },
    },
  ],
  pitfalls: ['num = 0 的答案是 0，位元公式要特判。', '位數減 1，因為最高位的 1 只需減掉，無須再折半。'],
  check: { kind: 'fn', fn: 'numberOfSteps', cases: [
    { args: [14], out: 6 },
    { args: [8], out: 4 },
    { args: [0], out: 0 },
    { args: [1], out: 1 },
  ] },
}
