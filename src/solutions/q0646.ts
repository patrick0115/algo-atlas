import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { intervalsView } from './fig'

// 646. Maximum Length of Pair Chain

const PAIRS = [[1, 2], [7, 8], [4, 5], [2, 3]]

function greedyFig(): FigStep[] {
  const sorted = [...PAIRS].sort((a, b) => a[1] - b[1])
  return [
    { note: '數對 [a, b] 後面能接 [c, d] 的條件是 b < c。要串出最長的鏈。就像排活動:每次挑**結束最早**的,留給後面最多空間', views: [intervalsView(PAIRS, { label: 'pairs' })] },
    { note: '依右端點排序:[1,2]、[2,3]、[4,5]、[7,8]', views: [intervalsView(sorted, { label: '排序後' })] },
    { note: '[1,2] 選;[2,3] 的 2 不大於 2 → 跳過;[4,5] 4 > 2 → 選;[7,8] 7 > 5 → 選。長度 3', views: [intervalsView(sorted, { label: '結果', cls: { 0: 'done', 1: 'dim', 2: 'done', 3: 'done' } }), arr([3], { label: '答案', done: [0] })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: 'DP 版:依左端點排序,`dp[i]` = 以第 i 個數對結尾的最長鏈。`dp[i] = max(dp[j] + 1)`,條件 `pairs[j][1] < pairs[i][0]`', views: [intervalsView([[1, 2], [2, 3], [4, 5], [7, 8]], { label: '依左端點排序' })] },
    { note: 'dp = [1, 1, 2, 3] → 答案 3。這就是 [300](#/q/300) LIS 的變形', views: [arr([1, 1, 2, 3], { label: 'dp', done: [3] })] },
  ]
}

export const q0646: Solution = {
  id: 646,
  plain: '給一些數對 [a, b](a < b)。如果前一對的 b 小於後一對的 a,它們就能串在一起。最多能串成多長的鏈?(數對的順序可以自己排)',
  statement: '給 n 個數對 `pairs[i] = [left, right]`(left < right)。若 `b < c`,則 `[c, d]` 可以接在 `[a, b]` 之後形成鏈。數對可任意順序選取,回傳能形成的最長鏈的長度。',
  examples: [
    { input: 'pairs = [[1,2],[2,3],[3,4]]', output: '2', note: '[1,2] → [3,4]' },
    { input: 'pairs = [[1,2],[7,8],[4,5]]', output: '3' },
  ],
  constraints: ['n ≤ 1000'],
  insight: ['= 選最多個互不重疊的區間(端點相同也算重疊)', '[[p:interval-scheduling]]:依右端點排序,能接就接', '也可以看成 LIS([[p:lis]])'],
  approaches: [
    {
      name: '貪心:依右端點排序',
      idea: '依 right 排序;`cur = −∞`;每個數對 left > cur 就選它、`cur = right`。',
      steps: ['`pairs.sort(key=right)`', '`cur = −∞`、`cnt = 0`', '`left > cur` → `cnt += 1`、`cur = right`', '回傳 cnt'],
      figure: { title: 'pairs = [[1,2],[7,8],[4,5],[2,3]]', steps: greedyFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '排序後一次掃描。' },
      verdict: '最推薦,和 [435](#/q/435) 不重疊區間是同一個貪心。',
      code: {
        python: `def findLongestChain(pairs):
    pairs.sort(key=lambda p: p[1])            # 結束早的優先
    cur, cnt = float('-inf'), 0
    for a, b in pairs:
        if a > cur:
            cnt += 1
            cur = b
    return cnt`,
        c: `static int cmpEnd(const void *x, const void *y) { return (*(int **)x)[1] - (*(int **)y)[1]; }

int findLongestChain(int **pairs, int pairsSize, int *pairsColSize) {
    qsort(pairs, pairsSize, sizeof(int *), cmpEnd);
    long long cur = LLONG_MIN;
    int cnt = 0;
    for (int i = 0; i < pairsSize; i++)
        if (pairs[i][0] > cur) { cnt++; cur = pairs[i][1]; }
    return cnt;
}`,
        cpp: `int findLongestChain(vector<vector<int>>& pairs) {
    sort(pairs.begin(), pairs.end(), [](auto &a, auto &b) { return a[1] < b[1]; });
    long long cur = LLONG_MIN;
    int cnt = 0;
    for (auto &p : pairs)
        if (p[0] > cur) { cnt++; cur = p[1]; }
    return cnt;
}`,
        java: `int findLongestChain(int[][] pairs) {
    Arrays.sort(pairs, (a, b) -> Integer.compare(a[1], b[1]));
    long cur = Long.MIN_VALUE;
    int cnt = 0;
    for (int[] p : pairs)
        if (p[0] > cur) { cnt++; cur = p[1]; }
    return cnt;
}`,
        javascript: `function findLongestChain(pairs) {
  pairs.sort((a, b) => a[1] - b[1]);
  let cur = -Infinity, cnt = 0;
  for (const [a, b] of pairs)
    if (a > cur) {
      cnt++;
      cur = b;
    }
  return cnt;
}`,
      },
    },
    {
      name: 'DP(類 LIS)',
      idea: '依 left 排序;`dp[i] = 1 + max(dp[j])`,其中 `pairs[j][1] < pairs[i][0]`。',
      steps: ['`pairs.sort()`', '`dp = [1] * n`', '`for i`、`for j < i`:`pairs[j][1] < pairs[i][0]` → `dp[i] = max(dp[i], dp[j] + 1)`', '回傳 `max(dp)`'],
      figure: { title: 'pairs = [[1,2],[7,8],[4,5],[2,3]]', steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '雙層迴圈。' },
      verdict: '不需要想貪心的正確性證明;n ≤ 1000 可以過。',
      code: {
        python: `def findLongestChain(pairs):
    pairs.sort()
    n = len(pairs)
    dp = [1] * n                              # 以 pairs[i] 結尾的最長鏈
    for i in range(n):
        for j in range(i):
            if pairs[j][1] < pairs[i][0]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
        c: `static int cmpL(const void *x, const void *y) { return (*(int **)x)[0] - (*(int **)y)[0]; }

int findLongestChain(int **pairs, int pairsSize, int *pairsColSize) {
    qsort(pairs, pairsSize, sizeof(int *), cmpL);
    int n = pairsSize, *dp = malloc(n * sizeof(int)), best = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (pairs[j][1] < pairs[i][0] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
        if (dp[i] > best) best = dp[i];
    }
    free(dp);
    return best;
}`,
        cpp: `int findLongestChain(vector<vector<int>>& pairs) {
    sort(pairs.begin(), pairs.end());
    int n = pairs.size();
    vector<int> dp(n, 1);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++)
            if (pairs[j][1] < pairs[i][0]) dp[i] = max(dp[i], dp[j] + 1);
    return *max_element(dp.begin(), dp.end());
}`,
        java: `int findLongestChain(int[][] pairs) {
    Arrays.sort(pairs, (a, b) -> Integer.compare(a[0], b[0]));
    int n = pairs.length, best = 0;
    int[] dp = new int[n];
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (pairs[j][1] < pairs[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1);
        best = Math.max(best, dp[i]);
    }
    return best;
}`,
        javascript: `function findLongestChain(pairs) {
  pairs.sort((a, b) => a[0] - b[0]);
  const n = pairs.length, dp = new Array(n).fill(1);
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) if (pairs[j][1] < pairs[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1);
  return Math.max(...dp);
}`,
      },
    },
  ],
  pitfalls: ['依左端點貪心:一個很長的區間會擋住後面很多短區間', '條件寫成 `b <= c`:題目要求嚴格小於'],
  check: {
    kind: 'fn',
    fn: 'findLongestChain',
    cases: [
      { args: [[[1, 2], [2, 3], [3, 4]]], out: 2 },
      { args: [[[1, 2], [7, 8], [4, 5]]], out: 3 },
      { args: [PAIRS], out: 3 },
      { args: [[[-10, -8], [8, 9], [-5, 0], [6, 10], [-6, -4], [1, 7], [9, 10], [-4, 7]]], out: 4 },
    ],
  },
}
