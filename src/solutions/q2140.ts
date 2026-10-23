import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2140. Solving Questions With Brainpower

const Q = [[3, 2], [4, 3], [4, 4], [2, 5]]

function backFig(): FigStep[] {
  const n = Q.length
  const dp = Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) dp[i] = Math.max(dp[i + 1], Q[i][0] + dp[Math.min(n, i + Q[i][1] + 1)])
  return [
    { note: '每題 [分數, 腦力]:解第 i 題得到分數,但接下來的「腦力」題都要跳過;也可以直接跳過第 i 題。依序決定,求最高分', views: [arr(Q.map(([p, b]) => `${p}/${b}`), { label: '分數 / 要跳過幾題' })] },
    { note: '由後往前:`dp[i]` = 從第 i 題開始能拿到的最高分。跳過 → dp[i+1];解 → points + dp[i + brainpower + 1]', views: [arr(dp, { label: 'dp[0..n]' })] },
    { note: `dp[0] = ${dp[0]}:解第 0 題(3 分,跳過 1、2)再解第 3 題(2 分)`, views: [arr(Q.map(([p, b]) => `${p}/${b}`), { label: '選擇', done: [0, 3], dim: [1, 2] }), arr([dp[0]], { label: '答案', done: [0] })] },
  ]
}

function pushFig(): FigStep[] {
  return [
    { note: '由前往後的「推」式 DP:`f[i]` = 走到第 i 題前已經拿到的最高分。從 i 出發:跳過 → 推到 f[i+1];解 → 推到 f[i + b + 1]', views: [arr([0, 0, 0, 3, 5], { label: 'f[0..n]' })] },
    { note: '要先把 f[i] 和 f[i−1] 取 max(跳過也算一種到達方式),答案是 f[n]', views: [arr([5], { label: '答案', done: [0] })] },
  ]
}

export const q2140: Solution = {
  id: 2140,
  plain: '考試有一排題目,每題有分數和「腦力消耗」。做了某一題,接下來那麼多題就累到不能做;也可以跳過不做。從第一題開始依序決定,最多拿幾分?',
  statement: '`questions[i] = [points, brainpower]`。依序處理每一題:**解題**可得 points 分,但必須跳過接下來的 brainpower 題;或**跳過**這題。回傳能獲得的最高分數。',
  examples: [
    { input: 'questions = [[3,2],[4,3],[4,4],[2,5]]', output: '5', note: '解第 0 題和第 3 題' },
    { input: 'questions = [[1,1],[2,2],[3,3],[4,4],[5,5]]', output: '7', note: '解第 1 題和第 4 題' },
  ],
  constraints: ['n ≤ 10⁵,points、brainpower ≤ 10⁵ → 答案需要 64 位元'],
  insight: ['做了會影響「後面」能做什麼 → 從後往前 DP 最自然', '`dp[i] = max(dp[i+1], points + dp[i + bp + 1])`', '和 [198](#/q/198) 打家劫舍同一類「選或不選」,只是跳的距離不同'],
  approaches: [
    {
      name: '由後往前 DP',
      idea: '`dp[n] = 0`;`dp[i] = max(dp[i+1], p + dp[min(n, i + b + 1)])`。',
      steps: ['`dp = [0] * (n + 1)`', '`for i in n−1..0`', '`dp[i] = max(dp[i + 1], p + dp[min(n, i + b + 1)])`', '回傳 dp[0]'],
      figure: { title: 'questions = [[3,2],[4,3],[4,4],[2,5]]', steps: backFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每題 O(1)。' },
      verdict: '最推薦,[[p:dp-1d]] 的「選或不選」;從後往前就不用處理「被跳過」的狀態。',
      code: {
        python: `def mostPoints(questions):
    n = len(questions)
    dp = [0] * (n + 1)                        # dp[i]:從第 i 題開始的最高分
    for i in range(n - 1, -1, -1):
        p, b = questions[i]
        dp[i] = max(dp[i + 1],                # 跳過
                    p + dp[min(n, i + b + 1)])  # 解題,跳過後面 b 題
    return dp[0]`,
        c: `long long mostPoints(int **questions, int questionsSize, int *questionsColSize) {
    int n = questionsSize;
    long long *dp = calloc(n + 1, sizeof(long long));
    for (int i = n - 1; i >= 0; i--) {
        int nx = i + questions[i][1] + 1;
        long long take = questions[i][0] + dp[nx < n ? nx : n];
        dp[i] = take > dp[i + 1] ? take : dp[i + 1];
    }
    long long ans = dp[0];
    free(dp);
    return ans;
}`,
        cpp: `long long mostPoints(vector<vector<int>>& questions) {
    int n = questions.size();
    vector<long long> dp(n + 1, 0);
    for (int i = n - 1; i >= 0; i--)
        dp[i] = max(dp[i + 1], questions[i][0] + dp[min(n, i + questions[i][1] + 1)]);
    return dp[0];
}`,
        java: `long mostPoints(int[][] questions) {
    int n = questions.length;
    long[] dp = new long[n + 1];
    for (int i = n - 1; i >= 0; i--)
        dp[i] = Math.max(dp[i + 1], questions[i][0] + dp[Math.min(n, i + questions[i][1] + 1)]);
    return dp[0];
}`,
        javascript: `function mostPoints(questions) {
  const n = questions.length, dp = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const [p, b] = questions[i];
    dp[i] = Math.max(dp[i + 1], p + dp[Math.min(n, i + b + 1)]);
  }
  return dp[0];
}`,
      },
    },
    {
      name: '由前往後「推」',
      idea: '`f[i]` = 輪到第 i 題時已拿到的最高分;先 `f[i] = max(f[i], f[i−1])`,再推:`f[i + b + 1] = max(…, f[i] + p)`。',
      steps: ['`f = [0] * (n + 1)`', '`for i in 0..n−1`:`f[i] = max(f[i], f[i−1])`(i > 0)', '`j = min(n, i + b + 1)`:`f[j] = max(f[j], f[i] + p)`', '回傳 `max(f[n], f[n−1])`'],
      figure: { title: 'questions = [[3,2],[4,3],[4,4],[2,5]]', steps: pushFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每題 O(1)。' },
      verdict: '從題目敘述的方向(由前往後)思考;「推」式 DP 處理跳躍很方便。',
      code: {
        python: `def mostPoints(questions):
    n = len(questions)
    f = [0] * (n + 1)                         # f[i]:輪到第 i 題時的最高分
    for i, (p, b) in enumerate(questions):
        if i:
            f[i] = max(f[i], f[i - 1])        # 跳過第 i−1 題也能來到 i
        j = min(n, i + b + 1)
        f[j] = max(f[j], f[i] + p)            # 解第 i 題,直接跳到 j
    return max(f[n], f[n - 1])`,
        c: `long long mostPoints(int **questions, int questionsSize, int *questionsColSize) {
    int n = questionsSize;
    long long *f = calloc(n + 1, sizeof(long long));
    for (int i = 0; i < n; i++) {
        if (i && f[i - 1] > f[i]) f[i] = f[i - 1];
        int j = i + questions[i][1] + 1;
        if (j > n) j = n;
        if (f[i] + questions[i][0] > f[j]) f[j] = f[i] + questions[i][0];
    }
    long long ans = f[n] > f[n - 1] ? f[n] : f[n - 1];
    free(f);
    return ans;
}`,
        cpp: `long long mostPoints(vector<vector<int>>& questions) {
    int n = questions.size();
    vector<long long> f(n + 1, 0);
    for (int i = 0; i < n; i++) {
        if (i) f[i] = max(f[i], f[i - 1]);
        int j = min(n, i + questions[i][1] + 1);
        f[j] = max(f[j], f[i] + questions[i][0]);
    }
    return max(f[n], f[n - 1]);
}`,
        java: `long mostPoints(int[][] questions) {
    int n = questions.length;
    long[] f = new long[n + 1];
    for (int i = 0; i < n; i++) {
        if (i > 0) f[i] = Math.max(f[i], f[i - 1]);
        int j = Math.min(n, i + questions[i][1] + 1);
        f[j] = Math.max(f[j], f[i] + questions[i][0]);
    }
    return Math.max(f[n], f[n - 1]);
}`,
        javascript: `function mostPoints(questions) {
  const n = questions.length, f = new Array(n + 1).fill(0);
  questions.forEach(([p, b], i) => {
    if (i) f[i] = Math.max(f[i], f[i - 1]);
    const j = Math.min(n, i + b + 1);
    f[j] = Math.max(f[j], f[i] + p);
  });
  return Math.max(f[n], f[n - 1]);
}`,
      },
    },
  ],
  pitfalls: ['用 int 存答案:10⁵ × 10⁵ 會溢位', '`i + b + 1` 超過 n 沒有截斷', '貪心挑分數最高的題:會被腦力消耗卡住'],
  check: {
    kind: 'fn',
    fn: 'mostPoints',
    cases: [
      { args: [Q], out: 5 },
      { args: [[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]], out: 7 },
      { args: [[[100000, 0], [100000, 0], [100000, 0]]], out: 300000 },
      { args: [[[21, 5], [92, 3], [74, 2], [39, 4], [58, 2], [5, 5], [49, 4], [65, 3]]], out: 157 },
    ],
  },
}
