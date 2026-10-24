import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q0650: Solution = {
  id: 650,
  plain: '畫面一開始只有一個 A；每次可以複製全部或貼上。要湊到 n 個 A，最少按幾次？',
  statement: '從字串 A 開始，操作只有「複製目前全部內容」和「貼上上次複製的內容」。求恰好得到 n 個 A 的最少操作數。',
  examples: [{ input: 'n = 3', output: '3' }, { input: 'n = 1', output: '0' }, { input: 'n = 9', output: '6' }],
  constraints: ['1 ≤ n ≤ 1000。'],
  insight: ['一次複製後連貼 p−1 次，會把數量乘上 p，成本恰好 p。', '把 n 拆成質因數，所有質因數之和就是最少操作數。'],
  approaches: [
    {
      name: '分解質因數',
      idea: '從最小因數開始除 n；每除出一個因數 d，就加 d 次操作。',
      steps: ['從 d = 2 開始試除', '只要 n 能被 d 整除，就將 d 加進答案，並把 n 除以 d', '無法整除時讓 d 加 1', 'n 降到 1 時結束'],
      figure: { title: 'n = 9', steps: [
        { note: '起點只有一個 A；9 可以先拆成 3 × 3。', views: [arr([1, 3, 9], { label: '預計數量', highlight: [0] })] },
        { note: '複製一次、貼上兩次，1 個變 3 個；花 3 步。', views: [arr([1, 3, 9], { label: '預計數量', done: [0], highlight: [1] })] },
        { note: '再複製三個 A、貼上兩次，3 個變 9 個；再花 3 步。', views: [arr([1, 3, 9], { label: '預計數量', done: [0, 1], highlight: [2] })] },
        { note: '兩個質因數 3 + 3 = 6，就是最少操作數。', views: [arr([3, 3, 6], { label: '兩段成本 / 總成本', done: [2] })] },
      ] },
      complexity: { time: 'O(√n)', space: 'O(1)', why: '試除到平方根後，剩下的數若大於 1 就是質數。' },
      verdict: '最短也最快；理解「乘上因數」後很好記。',
      code: {
        python: `def minSteps(n):
    ans = 0
    divisor = 2
    while divisor * divisor <= n:
        while n % divisor == 0:
            ans += divisor  # 一次複製，加上 divisor-1 次貼上
            n //= divisor
        divisor += 1
    if n > 1:
        ans += n
    return ans`,
        c: `int minSteps(int n) {
    int ans = 0;
    for (int divisor = 2; divisor * divisor <= n; divisor++) {
        while (n % divisor == 0) {
            ans += divisor;
            n /= divisor;
        }
    }
    if (n > 1) {
        ans += n;
    }
    return ans;
}`,
        cpp: `int minSteps(int n) {
    int ans = 0;
    for (int divisor = 2; divisor * divisor <= n; divisor++) {
        while (n % divisor == 0) {
            ans += divisor;
            n /= divisor;
        }
    }
    if (n > 1) {
        ans += n;
    }
    return ans;
}`,
        java: `int minSteps(int n) {
    int ans = 0;
    for (int divisor = 2; divisor * divisor <= n; divisor++) {
        while (n % divisor == 0) {
            ans += divisor;
            n /= divisor;
        }
    }
    if (n > 1) {
        ans += n;
    }
    return ans;
}`,
        javascript: `function minSteps(n) {
  let ans = 0;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    while (n % divisor === 0) {
      ans += divisor;
      n /= divisor;
    }
  }
  if (n > 1) {
    ans += n;
  }
  return ans;
}`,
      },
    },
    {
      name: '動態規劃',
      idea: '對每個數 i，枚舉可從哪個較小的數 j 透過複製與貼上得到。',
      steps: ['dp[1] = 0', '對 i 從 2 到 n，先設 dp[i] = i（從 1 直接做）', '枚舉 i 的因數 j', '若 j 整除 i，更新 dp[i] = min(dp[i], dp[j] + i/j)'],
      figure: { title: '計算 dp[9]', steps: [
        { note: 'dp[1] = 0：原本就有一個 A。', views: [arr([0], { label: 'dp[1]', done: [0] })] },
        { note: 'dp[3] = 3：從 1 個直接乘 3，需複製一次、貼上兩次。', views: [arr([0, 3], { label: 'dp[1], dp[3]', highlight: [1] })] },
        { note: '算 dp[9] 時，直接從 1 乘 9 要 9 步。', views: [arr([9], { label: '目前 dp[9]' })] },
        { note: '改從 3 乘 3，只要 dp[3] + 3 = 6 步。', views: [arr([3, 3, 6], { label: '舊成本 / 新增 / 答案', done: [2] })] },
      ] },
      complexity: { time: 'O(n√n)', space: 'O(n)', why: '每個狀態試除到平方根，並保留所有 dp 值。' },
      verdict: '適合練習「最後一次複製發生在何時」的狀態轉移。',
      code: {
        python: `def minSteps(n):
    dp = [0] * (n + 1)
    for value in range(2, n + 1):
        dp[value] = value
        divisor = 2
        while divisor * divisor <= value:
            if value % divisor == 0:
                dp[value] = min(dp[value], dp[divisor] + value // divisor)
                dp[value] = min(dp[value], dp[value // divisor] + divisor)  # 兩種乘法方向
            divisor += 1
    return dp[n]`,
        c: `int minSteps(int n) {
    int *dp = calloc(n + 1, sizeof(int));
    for (int value = 2; value <= n; value++) {
        dp[value] = value;
        for (int divisor = 2; divisor * divisor <= value; divisor++) {
            if (value % divisor == 0) {
                int a = dp[divisor] + value / divisor;
                int b = dp[value / divisor] + divisor;
                if (a < dp[value]) {
                    dp[value] = a;
                }
                if (b < dp[value]) {
                    dp[value] = b;
                }
            }
        }
    }
    int ans = dp[n];
    free(dp);
    return ans;
}`,
        cpp: `int minSteps(int n) {
    vector<int> dp(n + 1, 0);
    for (int value = 2; value <= n; value++) {
        dp[value] = value;
        for (int divisor = 2; divisor * divisor <= value; divisor++) {
            if (value % divisor == 0) {
                dp[value] = min(dp[value], dp[divisor] + value / divisor);
                dp[value] = min(dp[value], dp[value / divisor] + divisor);
            }
        }
    }
    return dp[n];
}`,
        java: `int minSteps(int n) {
    int[] dp = new int[n + 1];
    for (int value = 2; value <= n; value++) {
        dp[value] = value;
        for (int divisor = 2; divisor * divisor <= value; divisor++) {
            if (value % divisor == 0) {
                dp[value] = Math.min(dp[value], dp[divisor] + value / divisor);
                dp[value] = Math.min(dp[value], dp[value / divisor] + divisor);
            }
        }
    }
    return dp[n];
}`,
        javascript: `function minSteps(n) {
  const dp = new Array(n + 1).fill(0);
  for (let value = 2; value <= n; value++) {
    dp[value] = value;
    for (let divisor = 2; divisor * divisor <= value; divisor++) {
      if (value % divisor === 0) {
        dp[value] = Math.min(dp[value], dp[divisor] + value / divisor);
        dp[value] = Math.min(dp[value], dp[value / divisor] + divisor);
      }
    }
  }
  return dp[n];
}`,
      },
    },
  ],
  pitfalls: ['n = 1 不需任何操作。', '複製的是目前全部內容；不能只複製部分 A。'],
  check: { kind: 'fn', fn: 'minSteps', cases: [
    { args: [1], out: 0 },
    { args: [3], out: 3 },
    { args: [9], out: 6 },
    { args: [12], out: 7 },
  ] },
}
