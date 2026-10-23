import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1406. Stone Game III

const V = [1, 2, 3, 7]

function dpFig(): FigStep[] {
  const n = V.length
  const dp = Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let best = -Infinity
    let take = 0
    for (let k = 0; k < 3 && i + k < n; k++) {
      take += V[i + k]
      best = Math.max(best, take - dp[i + k + 1])
    }
    dp[i] = best
  }
  return [
    { note: '一排石頭,每回合從**最前面**拿 1、2 或 3 個。`dp[i]` = 剩下 values[i..] 時,輪到的人最多能比對手多拿多少分', views: [arr(V, { label: 'values' })] },
    { note: '拿 k 個:得到這 k 個的和,之後對手領先 dp[i+k] → 淨賺 `sum − dp[i+k]`,三種取最大。由後往前算', views: [arr(dp, { label: 'dp[0..n]' })] },
    { note: `dp[0] = ${dp[0]} < 0 → Bob 贏。Alice 不管拿 1、2、3 個,Bob 都能拿到 7`, views: [arr(['Bob'], { label: '答案', done: [0] })] },
  ]
}

function memoFig(): FigStep[] {
  return [
    { note: '由上往下:`f(i)` 直接照定義遞迴,並記憶化。dp[i] 只依賴後三格,也可以只留 4 個變數', views: [arr(['f(i) = max(sum(i..i+k−1) − f(i+k)), k = 1..3'], { label: '遞迴式' })] },
    { note: 'f(0) > 0 → Alice;< 0 → Bob;= 0 → Tie', views: [arr(['Alice', 'Bob', 'Tie'], { label: '三種結果' })] },
  ]
}

export const q1406: Solution = {
  id: 1406,
  plain: 'Alice 和 Bob 輪流從一排石頭的最前面拿 1 到 3 個,拿到的石頭上的數字加進自己的分數(可能是負數)。兩人都很聰明,誰會贏?',
  statement: '石頭排成一列,`stoneValue[i]` 為分數(可為負)。Alice 先手,每回合從**剩下的最前面**取 1、2 或 3 個石頭。全部取完後分數高者勝。兩人都採最佳策略,回傳 `"Alice"`、`"Bob"` 或 `"Tie"`。',
  examples: [
    { input: 'values = [1,2,3,7]', output: '"Bob"' },
    { input: 'values = [1,2,3,-9]', output: '"Alice"', note: 'Alice 拿前三個,Bob 被迫拿 −9' },
    { input: 'values = [1,2,3,6]', output: '"Tie"' },
  ],
  constraints: ['n ≤ 5·10⁴,−1000 ≤ 值 ≤ 1000'],
  insight: ['兩人博弈的「分差 DP」:`dp[i]` = 輪到的人的領先分數', '`dp[i] = max over k of (前 k 個的和 − dp[i + k])`', '看 dp[0] 的正負決定勝負'],
  approaches: [
    {
      name: '由後往前分差 DP',
      idea: '`dp[n] = 0`;`dp[i] = max(take_k − dp[i + k])`,k = 1..3。',
      steps: ['`dp = [0] * (n + 1)`', '`for i in n−1..0`:累加 take,`best = max(best, take − dp[i+k+1])`', '`dp[i] = best`', '看 `dp[0]` 的正負'],
      figure: { title: `values = [${V}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個位置試 3 種。' },
      verdict: '最推薦,和 [877](#/q/877) 同樣的分差技巧,只是改成一維。',
      code: {
        python: `def stoneGameIII(stoneValue):
    n = len(stoneValue)
    dp = [0] * (n + 1)                        # dp[i]:輪到的人在 [i:] 最多領先幾分
    for i in range(n - 1, -1, -1):
        best, take = float('-inf'), 0
        for k in range(3):
            if i + k >= n:
                break
            take += stoneValue[i + k]
            best = max(best, take - dp[i + k + 1])   # 我拿 k+1 個,扣掉對手的領先
        dp[i] = best
    return 'Alice' if dp[0] > 0 else 'Bob' if dp[0] < 0 else 'Tie'`,
        c: `char *stoneGameIII(int *stoneValue, int stoneValueSize) {
    int n = stoneValueSize, *dp = calloc(n + 1, sizeof(int));
    for (int i = n - 1; i >= 0; i--) {
        int best = INT_MIN, take = 0;
        for (int k = 0; k < 3 && i + k < n; k++) {
            take += stoneValue[i + k];
            if (take - dp[i + k + 1] > best) best = take - dp[i + k + 1];
        }
        dp[i] = best;
    }
    int d = dp[0];
    free(dp);
    return d > 0 ? "Alice" : d < 0 ? "Bob" : "Tie";
}`,
        cpp: `string stoneGameIII(vector<int>& stoneValue) {
    int n = stoneValue.size();
    vector<int> dp(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) {
        int best = INT_MIN, take = 0;
        for (int k = 0; k < 3 && i + k < n; k++) {
            take += stoneValue[i + k];
            best = max(best, take - dp[i + k + 1]);
        }
        dp[i] = best;
    }
    return dp[0] > 0 ? "Alice" : dp[0] < 0 ? "Bob" : "Tie";
}`,
        java: `String stoneGameIII(int[] stoneValue) {
    int n = stoneValue.length;
    int[] dp = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        int best = Integer.MIN_VALUE, take = 0;
        for (int k = 0; k < 3 && i + k < n; k++) {
            take += stoneValue[i + k];
            best = Math.max(best, take - dp[i + k + 1]);
        }
        dp[i] = best;
    }
    return dp[0] > 0 ? "Alice" : dp[0] < 0 ? "Bob" : "Tie";
}`,
        javascript: `function stoneGameIII(stoneValue) {
  const n = stoneValue.length, dp = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let best = -Infinity, take = 0;
    for (let k = 0; k < 3 && i + k < n; k++) {
      take += stoneValue[i + k];
      best = Math.max(best, take - dp[i + k + 1]);
    }
    dp[i] = best;
  }
  return dp[0] > 0 ? 'Alice' : dp[0] < 0 ? 'Bob' : 'Tie';
}`,
      },
    },
    {
      name: '滾動陣列(4 個變數)',
      idea: 'dp[i] 只用到 dp[i+1..i+3] → 長度 4 的循環陣列 `dp[i % 4]`。',
      steps: ['`dp = [0] * 4`', '`for i in n−1..0`:用 `dp[(i+k+1) % 4]` 計算', '存到 `dp[i % 4]`', '看 `dp[0]`'],
      figure: { title: `values = [${V}]`, steps: memoFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只存 4 格。' },
      verdict: '空間壓縮的標準技巧:「只依賴最近幾格」就用取餘的循環陣列。',
      code: {
        python: `def stoneGameIII(stoneValue):
    n = len(stoneValue)
    dp = [0] * 4                              # dp[i % 4]
    for i in range(n - 1, -1, -1):
        best, take = float('-inf'), 0
        for k in range(min(3, n - i)):
            take += stoneValue[i + k]
            best = max(best, take - dp[(i + k + 1) % 4])
        dp[i % 4] = best
    return 'Alice' if dp[0] > 0 else 'Bob' if dp[0] < 0 else 'Tie'`,
        c: `char *stoneGameIII(int *stoneValue, int stoneValueSize) {
    int n = stoneValueSize, dp[4] = {0};
    for (int i = n - 1; i >= 0; i--) {
        int best = INT_MIN, take = 0;
        for (int k = 0; k < 3 && i + k < n; k++) {
            take += stoneValue[i + k];
            if (take - dp[(i + k + 1) % 4] > best) best = take - dp[(i + k + 1) % 4];
        }
        dp[i % 4] = best;
    }
    return dp[0] > 0 ? "Alice" : dp[0] < 0 ? "Bob" : "Tie";
}`,
        cpp: `string stoneGameIII(vector<int>& stoneValue) {
    int n = stoneValue.size(), dp[4] = {0};
    for (int i = n - 1; i >= 0; i--) {
        int best = INT_MIN, take = 0;
        for (int k = 0; k < 3 && i + k < n; k++) {
            take += stoneValue[i + k];
            best = max(best, take - dp[(i + k + 1) % 4]);
        }
        dp[i % 4] = best;
    }
    return dp[0] > 0 ? "Alice" : dp[0] < 0 ? "Bob" : "Tie";
}`,
        java: `String stoneGameIII(int[] stoneValue) {
    int n = stoneValue.length;
    int[] dp = new int[4];
    for (int i = n - 1; i >= 0; i--) {
        int best = Integer.MIN_VALUE, take = 0;
        for (int k = 0; k < 3 && i + k < n; k++) {
            take += stoneValue[i + k];
            best = Math.max(best, take - dp[(i + k + 1) % 4]);
        }
        dp[i % 4] = best;
    }
    return dp[0] > 0 ? "Alice" : dp[0] < 0 ? "Bob" : "Tie";
}`,
        javascript: `function stoneGameIII(stoneValue) {
  const n = stoneValue.length, dp = [0, 0, 0, 0];
  for (let i = n - 1; i >= 0; i--) {
    let best = -Infinity, take = 0;
    for (let k = 0; k < 3 && i + k < n; k++) {
      take += stoneValue[i + k];
      best = Math.max(best, take - dp[(i + k + 1) % 4]);
    }
    dp[i % 4] = best;
  }
  return dp[0] > 0 ? 'Alice' : dp[0] < 0 ? 'Bob' : 'Tie';
}`,
      },
    },
  ],
  pitfalls: ['以為拿越多越好:有負數時少拿反而更好', '`best` 初始值設成 0:可能所有選擇都是負的,要用 −∞', '用「自己的總分」當 DP 狀態:還要另外記對手,不如直接用分差'],
  check: {
    kind: 'fn',
    fn: 'stoneGameIII',
    cases: [
      { args: [V], out: 'Bob' },
      { args: [[1, 2, 3, -9]], out: 'Alice' },
      { args: [[1, 2, 3, 6]], out: 'Tie' },
      { args: [[-1, -2, -3]], out: 'Tie' },
      { args: [[-2]], out: 'Bob' },
    ],
  },
}
