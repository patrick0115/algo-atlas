import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1964. Find the Longest Valid Obstacle Course at Each Position

const A = [3, 1, 5, 6, 4, 2]

function tailFig(): FigStep[] {
  const tails: number[] = []
  const ans: number[] = []
  const out: FigStep[] = [{ note: '對每個位置 i,要「以 i 結尾的最長**非遞減**子序列」長度。用 [300](#/q/300) 的 tails 技巧:tails[L] = 長度 L+1 的非遞減子序列,最小可能的結尾值', views: [arr(A, { label: 'obstacles' }), arr([], { label: 'tails' })] }]
  A.forEach((x, i) => {
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const m = (lo + hi) >> 1
      if (tails[m] <= x) lo = m + 1
      else hi = m
    }
    const replaced = lo < tails.length
    tails[lo] = x
    ans.push(lo + 1)
    out.push({ note: `${x}:找第一個 **> ${x}** 的位置(非遞減,所以相等的可以接在後面)→ ${lo}。${replaced ? `把 tails[${lo}] 換成 ${x}` : '接在最後'};以它結尾最長 ${lo + 1}`, views: [arr(A, { label: 'obstacles', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), arr([...tails], { label: 'tails', highlight: [lo] }), arr([...ans], { label: '答案', highlight: [i] })] })
  })
  return out
}

function dpFig(): FigStep[] {
  return [
    { note: 'O(n²) 的 DP:dp[i] = 1 + max(dp[j]),j < i 且 obstacles[j] ≤ obstacles[i]', views: [arr(A, { label: 'obstacles', highlight: [4], compare: [0, 1] }), arr([1, 1, 2, 3, 2, 2], { label: 'dp' })] },
    { note: 'i = 4(值 4):前面 ≤ 4 的有 3(dp 1)、1(dp 1)→ dp[4] = 2。n = 10⁵ 時 O(n²) 太慢', views: [arr([1, 1, 2, 3, 2, 2], { label: 'dp', done: [4] })] },
  ]
}

export const q1964: Solution = {
  id: 1964,
  plain: '一排障礙物有高有低。對每一個位置,問:如果一定要以這個障礙物當終點,從前面挑一些(順序不變)組成「越來越高或一樣高」的路線,最長能挑幾個?',
  statement: '給 `obstacles`,對每個 i 回傳以 obstacles[i] **結尾**、由 obstacles[0..i] 中選出(保持順序)的最長**非遞減**子序列長度。',
  examples: [
    { input: 'obstacles = [1,2,3,2]', output: '[1,2,3,3]' },
    { input: 'obstacles = [2,2,1]', output: '[1,2,1]' },
    { input: 'obstacles = [3,1,5,6,4,2]', output: '[1,1,2,3,2,2]' },
  ],
  constraints: ['n ≤ 10⁵ → O(n²) 太慢'],
  insight: ['就是[[p:lis]](最長遞增子序列)的變形:①「非遞減」②每個位置都要答案', 'tails 技巧:tails[L] = 長度 L+1 的子序列最小的結尾', '非遞減 → 二分找第一個 **> x** 的位置(bisect_right),相等的可以接在後面', '那個位置 + 1 就是以 x 結尾的最長長度'],
  approaches: [
    {
      name: 'tails + 二分搜尋(bisect_right)',
      idea: '每個 x:`p = 第一個 tails[p] > x 的位置`;`tails[p] = x`;答案 `p + 1`。',
      steps: ['`tails = []`', '`for x`:`p = bisect_right(tails, x)`', '`p == len(tails)` → append;否則 `tails[p] = x`', '`ans.append(p + 1)`'],
      figure: { title: `obstacles = [${A}]`, steps: tailFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每個元素一次二分。' },
      verdict: '最推薦。和 300 題唯一的差別是 bisect_left 換成 bisect_right(嚴格遞增 vs 非遞減)。',
      code: {
        python: `from bisect import bisect_right

def longestObstacleCourseAtEachPosition(obstacles):
    tails, ans = [], []
    for x in obstacles:
        p = bisect_right(tails, x)            # 第一個 > x 的位置:相等的可以接在後面
        if p == len(tails):
            tails.append(x)
        else:
            tails[p] = x                      # 同長度的結尾換成更小的
        ans.append(p + 1)
    return ans`,
        c: `int *longestObstacleCourseAtEachPosition(int *obstacles, int obstaclesSize, int *returnSize) {
    int *tails = malloc(obstaclesSize * sizeof(int)), *ans = malloc(obstaclesSize * sizeof(int)), len = 0;
    for (int i = 0; i < obstaclesSize; i++) {
        int x = obstacles[i], lo = 0, hi = len;
        while (lo < hi) {
            int m = (lo + hi) / 2;
            if (tails[m] <= x) lo = m + 1;
            else hi = m;
        }
        tails[lo] = x;
        if (lo == len) len++;
        ans[i] = lo + 1;
    }
    free(tails);
    *returnSize = obstaclesSize;
    return ans;
}`,
        cpp: `vector<int> longestObstacleCourseAtEachPosition(vector<int>& obstacles) {
    vector<int> tails, ans;
    for (int x : obstacles) {
        auto it = upper_bound(tails.begin(), tails.end(), x);
        ans.push_back(it - tails.begin() + 1);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return ans;
}`,
        java: `int[] longestObstacleCourseAtEachPosition(int[] obstacles) {
    int n = obstacles.length, len = 0;
    int[] tails = new int[n], ans = new int[n];
    for (int i = 0; i < n; i++) {
        int x = obstacles[i], lo = 0, hi = len;
        while (lo < hi) {
            int m = (lo + hi) >>> 1;
            if (tails[m] <= x) lo = m + 1;
            else hi = m;
        }
        tails[lo] = x;
        if (lo == len) len++;
        ans[i] = lo + 1;
    }
    return ans;
}`,
        javascript: `function longestObstacleCourseAtEachPosition(obstacles) {
  const tails = [], ans = [];
  for (const x of obstacles) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (tails[m] <= x) lo = m + 1;
      else hi = m;
    }
    tails[lo] = x;
    ans.push(lo + 1);
  }
  return ans;
}`,
      },
    },
    {
      name: 'O(n²) DP',
      idea: '`dp[i] = 1 + max(dp[j] for j < i if obstacles[j] <= obstacles[i])`。',
      steps: ['`dp = [1] * n`', '`for i`:`for j < i`:`obstacles[j] <= obstacles[i]` → `dp[i] = max(dp[i], dp[j] + 1)`', '回傳 dp'],
      figure: { title: `obstacles = [${A}]`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個 i 看前面所有 j。' },
      verdict: '最直接的 LIS DP,用來驗證;n 大時太慢。',
      code: {
        python: `def longestObstacleCourseAtEachPosition(obstacles):
    n = len(obstacles)
    dp = [1] * n
    for i in range(n):
        for j in range(i):
            if obstacles[j] <= obstacles[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return dp`,
        c: `int *longestObstacleCourseAtEachPosition(int *obstacles, int obstaclesSize, int *returnSize) {
    int *dp = malloc(obstaclesSize * sizeof(int));
    for (int i = 0; i < obstaclesSize; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (obstacles[j] <= obstacles[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
    }
    *returnSize = obstaclesSize;
    return dp;
}`,
        cpp: `vector<int> longestObstacleCourseAtEachPosition(vector<int>& obstacles) {
    int n = obstacles.size();
    vector<int> dp(n, 1);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++)
            if (obstacles[j] <= obstacles[i]) dp[i] = max(dp[i], dp[j] + 1);
    return dp;
}`,
        java: `int[] longestObstacleCourseAtEachPosition(int[] obstacles) {
    int n = obstacles.length;
    int[] dp = new int[n];
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (obstacles[j] <= obstacles[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    return dp;
}`,
        javascript: `function longestObstacleCourseAtEachPosition(obstacles) {
  const n = obstacles.length, dp = new Array(n).fill(1);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < i; j++) if (obstacles[j] <= obstacles[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
  return dp;
}`,
      },
    },
  ],
  pitfalls: ['用 bisect_left(第一個 ≥ x):那是「嚴格遞增」,[2,2] 會得到 [1,1] 而不是 [1,2]', '答案是「以 i 結尾」的長度,不是到 i 為止的全域最長'],
  check: {
    kind: 'fn',
    fn: 'longestObstacleCourseAtEachPosition',
    cases: [
      { args: [[1, 2, 3, 2]], out: [1, 2, 3, 3] },
      { args: [[2, 2, 1]], out: [1, 2, 1] },
      { args: [A], out: [1, 1, 2, 3, 2, 2] },
      { args: [[5]], out: [1] },
      { args: [[5, 1, 5, 5, 1, 3, 4, 5, 1, 4]], out: [1, 1, 2, 3, 2, 3, 4, 5, 3, 5] },
    ],
  },
}
