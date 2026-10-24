import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 120. Triangle

const T = [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]

function bottomFig(): FigStep[] {
  const dp = [...T[T.length - 1]]
  const snaps = [[...dp]]
  for (let r = T.length - 2; r >= 0; r--) {
    for (let c = 0; c <= r; c++) dp[c] = T[r][c] + Math.min(dp[c], dp[c + 1])
    snaps.push(dp.slice(0, r + 1))
  }
  return [
    { note: '從頂端往下走,每一步只能走到下一列的「正下方」或「右下方」。求路徑總和的最小值', views: T.map((row, i) => arr(row, { label: `第 ${i} 列` })) },
    { note: '由下往上:最底列的值就是「從這裡出發到底」的最小和。往上一列:`dp[c] = 自己 + min(dp[c], dp[c+1])`', views: [arr(snaps[0], { label: '底列' }), arr(snaps[1], { label: '第 2 列:6+1、5+1、7+3' })] },
    { note: '再往上:3 + min(7, 6) = 9、4 + min(6, 10) = 10;頂端 2 + min(9, 10) = 11', views: [arr(snaps[2], { label: '第 1 列' }), arr(snaps[3], { label: '頂端', done: [0] })] },
    { note: '路徑 2 → 3 → 5 → 1,總和 11。由下往上的好處:最後答案就在 dp[0],不用再取最小', views: [arr([11], { label: '答案', done: [0] })] },
  ]
}

function topFig(): FigStep[] {
  return [
    { note: '由上往下也可以:`dp[r][c] = T[r][c] + min(dp[r−1][c−1], dp[r−1][c])`,邊界只有一個來源', views: [arr([2], { label: '第 0 列' }), arr([5, 6], { label: '第 1 列' }), arr([11, 10, 13], { label: '第 2 列' }), arr([15, 11, 18, 16], { label: '第 3 列' })] },
    { note: '答案是最底列的最小值 11', views: [arr([15, 11, 18, 16], { label: '底列', done: [1] })] },
  ]
}

export const q0120: Solution = {
  id: 120,
  plain: '一個數字排成的三角形,從最上面往下走到底,每一步只能走到下一列相鄰的兩個數之一。路上數字的總和最小是多少?',
  statement: '給三角形陣列 `triangle`,找出自頂向下的最小路徑和。每一步只能移動到下一列中相鄰的位置:在第 i 列位置 j,下一步可以到第 i + 1 列的 j 或 j + 1。',
  examples: [
    { input: 'triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]', output: '11', note: '2 → 3 → 5 → 1' },
    { input: 'triangle = [[-10]]', output: '-10' },
  ],
  constraints: ['列數 ≤ 200', '進階:只用 O(n) 額外空間'],
  insight: ['每個位置只能從上一列的 c − 1 或 c 來 → [[p:dp-grid]] 的變形', '由下往上做,邊界最單純,答案直接在頂端', '一維陣列就能完成(O(n) 空間)'],
  approaches: [
    {
      name: '由下往上(一維)',
      idea: '`dp = 最底列`;往上每一列:`dp[c] = T[r][c] + min(dp[c], dp[c+1])`;回傳 `dp[0]`。',
      steps: ['`dp = triangle[-1][:]`', '`for r in n−2..0`、`for c in 0..r`', '`dp[c] = triangle[r][c] + min(dp[c], dp[c + 1])`', '回傳 `dp[0]`'],
      figure: { title: 'triangle(4 列)', steps: bottomFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個數處理一次;一維陣列。' },
      verdict: '最推薦;方向選對,邊界條件就消失了。',
      code: {
        python: `def minimumTotal(triangle):
    dp = triangle[-1][:]                      # 從底列出發
    for r in range(len(triangle) - 2, -1, -1):
        for c in range(r + 1):
            dp[c] = triangle[r][c] + min(dp[c], dp[c + 1])   # 正下方 / 右下方
    return dp[0]`,
        c: `int minimumTotal(int **triangle, int triangleSize, int *triangleColSize) {
    int n = triangleSize, *dp = malloc(n * sizeof(int));
    for (int c = 0; c < n; c++) dp[c] = triangle[n - 1][c];
    for (int r = n - 2; r >= 0; r--)
        for (int c = 0; c <= r; c++) dp[c] = triangle[r][c] + (dp[c] < dp[c + 1] ? dp[c] : dp[c + 1]);
    int ans = dp[0];
    free(dp);
    return ans;
}`,
        cpp: `int minimumTotal(vector<vector<int>>& triangle) {
    vector<int> dp = triangle.back();
    for (int r = triangle.size() - 2; r >= 0; r--)
        for (int c = 0; c <= r; c++) dp[c] = triangle[r][c] + min(dp[c], dp[c + 1]);
    return dp[0];
}`,
        java: `int minimumTotal(List<List<Integer>> triangle) {
    int n = triangle.size();
    int[] dp = new int[n];
    for (int c = 0; c < n; c++) dp[c] = triangle.get(n - 1).get(c);
    for (int r = n - 2; r >= 0; r--)
        for (int c = 0; c <= r; c++) dp[c] = triangle.get(r).get(c) + Math.min(dp[c], dp[c + 1]);
    return dp[0];
}`,
        javascript: `function minimumTotal(triangle) {
  const dp = [...triangle[triangle.length - 1]];
  for (let r = triangle.length - 2; r >= 0; r--)
    for (let c = 0; c <= r; c++) dp[c] = triangle[r][c] + Math.min(dp[c], dp[c + 1]);
  return dp[0];
}`,
      },
    },
    {
      name: '由上往下',
      idea: '`dp[r][c] = T[r][c] + min(dp[r−1][c−1], dp[r−1][c])`(超出範圍的不算);答案是最底列的最小值。',
      steps: ['`dp[0][0] = T[0][0]`', '每列:c = 0 只能從正上方;c = r 只能從左上方;中間取 min', '回傳 `min(dp[n−1])`'],
      figure: { title: 'triangle(4 列)', steps: topFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: 'Python 版保留整張表 O(n²);其他語言已壓成一維、由右往左更新,O(n)。' },
      verdict: '比較符合「往下走」的直覺,只是要多處理兩端的邊界。',
      code: {
        python: `def minimumTotal(triangle):
    n = len(triangle)
    dp = [triangle[0][:]]
    for r in range(1, n):
        row = []
        for c in range(r + 1):
            best = min(dp[r - 1][c - 1] if c > 0 else float('inf'),
                       dp[r - 1][c] if c < r else float('inf'))
            row.append(triangle[r][c] + best)
        dp.append(row)
    return min(dp[-1])`,
        c: `int minimumTotal(int **triangle, int triangleSize, int *triangleColSize) {
    int n = triangleSize, *dp = malloc(n * sizeof(int));
    dp[0] = triangle[0][0];
    for (int r = 1; r < n; r++) {
        dp[r] = dp[r - 1] + triangle[r][r];   // 最右邊只能從左上來
        for (int c = r - 1; c >= 1; c--) dp[c] = triangle[r][c] + (dp[c - 1] < dp[c] ? dp[c - 1] : dp[c]);
        dp[0] += triangle[r][0];              // 最左邊只能從正上方來
    }
    int ans = dp[0];
    for (int c = 1; c < n; c++) if (dp[c] < ans) ans = dp[c];
    free(dp);
    return ans;
}`,
        cpp: `int minimumTotal(vector<vector<int>>& triangle) {
    int n = triangle.size();
    vector<int> dp(n);
    dp[0] = triangle[0][0];
    for (int r = 1; r < n; r++) {
        dp[r] = dp[r - 1] + triangle[r][r];
        for (int c = r - 1; c >= 1; c--) dp[c] = triangle[r][c] + min(dp[c - 1], dp[c]);
        dp[0] += triangle[r][0];
    }
    return *min_element(dp.begin(), dp.end());
}`,
        java: `int minimumTotal(List<List<Integer>> triangle) {
    int n = triangle.size();
    int[] dp = new int[n];
    dp[0] = triangle.get(0).get(0);
    for (int r = 1; r < n; r++) {
        List<Integer> row = triangle.get(r);
        dp[r] = dp[r - 1] + row.get(r);
        for (int c = r - 1; c >= 1; c--) dp[c] = row.get(c) + Math.min(dp[c - 1], dp[c]);
        dp[0] += row.get(0);
    }
    int ans = dp[0];
    for (int v : dp) ans = Math.min(ans, v);
    return ans;
}`,
        javascript: `function minimumTotal(triangle) {
  const n = triangle.length, dp = new Array(n).fill(0);
  dp[0] = triangle[0][0];
  for (let r = 1; r < n; r++) {
    dp[r] = dp[r - 1] + triangle[r][r];
    for (let c = r - 1; c >= 1; c--) dp[c] = triangle[r][c] + Math.min(dp[c - 1], dp[c]);
    dp[0] += triangle[r][0];
  }
  return Math.min(...dp);
}`,
      },
    },
  ],
  pitfalls: ['貪心每次走較小的那個:2 → 3 → 5 → 1 是對的,但換個例子就會錯(局部最小 ≠ 全域最小)', '由上往下壓成一維時由左往右更新:會用到這一列剛算好的值'],
  check: {
    kind: 'fn',
    fn: 'minimumTotal',
    cases: [
      { args: [T], out: 11 },
      { args: [[[-10]]], out: -10 },
      { args: [[[-1], [2, 3], [1, -1, -3]]], out: -1 },
    ],
  },
}
