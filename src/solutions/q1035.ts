import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1035. Uncrossed Lines
const A = [1, 4, 2], B = [1, 2, 4]
function tableFig(): FigStep[] {
  const dp = Array.from({ length: A.length + 1 }, () => Array(B.length + 1).fill(0) as number[])
  for (let i = 1; i <= A.length; i++)
    for (let j = 1; j <= B.length; j++)
      dp[i][j] = A[i - 1] === B[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
  const view: GridViewData = { kind: 'grid', label: 'dp:兩個前綴最多能連幾條線', cells: dp, rowLabels: ['空', ...A.map(String)], colLabels: ['空', ...B.map(String)], marks: { done: [[3, 3]] } }
  return [
    { note: '相同數字才能連線;線不能交叉,所以連上的順序必須在兩列中都相同。', views: [arr(A, { label: 'nums1' }), arr(B, { label: 'nums2' })] },
    { note: '問題等價於找兩個陣列的最長共同子序列。相同就接一條;不同就捨棄其中一列的最後一個數。', views: [view] },
    { note: '例如連 1 和 2,或連 1 和 4,都能得到 2 條。', views: [arr([2], { label: '答案', done: [0] })] },
  ]
}
const rollFig: FigStep[] = [
  { note: '只需上一列:dp[j] 更新前是上方,dp[j−1] 更新後是左方,另外保存左上角的舊值。', views: [arr([0, 1, 1, 1], { label: '處理 1 後' }), arr([0, 1, 1, 2], { label: '處理 4 後' })] },
  { note: '處理 2 後 dp = [0,1,2,2],答案仍是 2。', views: [arr([0, 1, 2, 2], { label: '最後一列', done: [3] })] },
]

export const q1035: Solution = {
  id: 1035,
  plain: '上下兩排數字,相同數字可以牽一條線,但線不能互相交叉。最多能牽幾條?其實是在找兩排中順序相同的一串共同數字。',
  statement: '給兩個整數陣列 nums1、nums2,相同值可配成一條連線,每個位置至多使用一次,線不能交叉。求最多可連線數。',
  examples: [
    { input: 'nums1 = [1,4,2], nums2 = [1,2,4]', output: '2' },
    { input: 'nums1 = [2,5,1,2,5], nums2 = [10,5,2,1,5,2]', output: '3' },
  ],
  constraints: ['兩個陣列長度都不超過 500'],
  insight: ['不交叉表示選出的配對在兩邊順序一致,因此等價於 [[p:lcs]]。', '以兩邊的前綴長度 i、j 當狀態。', '尾端相同就從左上角加 1;不同就比較上方與左方。'],
  approaches: [
    {
      name: '二維最長共同子序列 DP',
      idea: 'dp[i][j] 是 nums1 前 i 個與 nums2 前 j 個最多能連的線數。',
      steps: ['建立 (m+1) × (n+1) 的 0 表', '尾端相同:dp[i][j] = dp[i−1][j−1] + 1', '不同:dp[i][j] = max(dp[i−1][j],dp[i][j−1])', '回傳 dp[m][n]'],
      figure: { title: 'nums1 = [1,4,2], nums2 = [1,2,4]', steps: tableFig() },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每個前綴配對只處理一次。' },
      verdict: '最容易理解和畫表,與 [1143](#/q/1143) 完全同型。',
      code: {
        python: `def maxUncrossedLines(nums1, nums2):
    m, n = len(nums1), len(nums2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if nums1[i - 1] == nums2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
        c: `int maxUncrossedLines(int *nums1, int nums1Size, int *nums2, int nums2Size) {
    int m = nums1Size, n = nums2Size, C = n + 1;
    int *dp = calloc((m + 1) * C, sizeof(int));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            int idx = i * C + j;
            if (nums1[i - 1] == nums2[j - 1]) dp[idx] = dp[(i - 1) * C + j - 1] + 1;
            else {
                int a = dp[(i - 1) * C + j], b = dp[i * C + j - 1];
                dp[idx] = a > b ? a : b;
            }
        }
    int ans = dp[m * C + n];
    free(dp);
    return ans;
}`,
        cpp: `int maxUncrossedLines(vector<int>& nums1, vector<int>& nums2) {
    int m = nums1.size(), n = nums2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = nums1[i - 1] == nums2[j - 1]
                ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}`,
        java: `int maxUncrossedLines(int[] nums1, int[] nums2) {
    int m = nums1.length, n = nums2.length;
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = nums1[i - 1] == nums2[j - 1]
                ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}`,
        javascript: `function maxUncrossedLines(nums1, nums2) {
  const m = nums1.length, n = nums2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = nums1[i - 1] === nums2[j - 1]
        ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}`,
      },
    },
    {
      name: '一維滾動陣列',
      idea: '一列一列算,保留左上角舊值,用一維 dp 覆蓋上一列。',
      steps: ['dp 初始化為 n+1 個 0', '每個 nums1 的值開始時設 diag = 0', '掃描 nums2:先保存 dp[j] 舊值,更新後把舊值交給 diag', '回傳 dp[n]'],
      figure: { title: '只保存一列', steps: rollFig },
      complexity: { time: 'O(mn)', space: 'O(n)', why: '只保存 nums2 對應的一列。' },
      verdict: '空間較省;左上角需要額外保存,否則更新後會遺失。',
      code: {
        python: `def maxUncrossedLines(nums1, nums2):
    n = len(nums2)
    dp = [0] * (n + 1)
    for x in nums1:
        diag = 0
        for j in range(1, n + 1):
            old = dp[j]
            dp[j] = diag + 1 if x == nums2[j - 1] else max(dp[j], dp[j - 1])
            diag = old
    return dp[n]`,
        c: `int maxUncrossedLines(int *nums1, int nums1Size, int *nums2, int nums2Size) {
    int n = nums2Size, *dp = calloc(n + 1, sizeof(int));
    for (int i = 0; i < nums1Size; i++) {
        int diag = 0;
        for (int j = 1; j <= n; j++) {
            int old = dp[j];
            if (nums1[i] == nums2[j - 1]) dp[j] = diag + 1;
            else if (dp[j - 1] > dp[j]) dp[j] = dp[j - 1];
            diag = old;
        }
    }
    int ans = dp[n];
    free(dp);
    return ans;
}`,
        cpp: `int maxUncrossedLines(vector<int>& nums1, vector<int>& nums2) {
    int n = nums2.size();
    vector<int> dp(n + 1);
    for (int x : nums1) {
        int diag = 0;
        for (int j = 1; j <= n; j++) {
            int old = dp[j];
            dp[j] = x == nums2[j - 1] ? diag + 1 : max(dp[j], dp[j - 1]);
            diag = old;
        }
    }
    return dp[n];
}`,
        java: `int maxUncrossedLines(int[] nums1, int[] nums2) {
    int n = nums2.length;
    int[] dp = new int[n + 1];
    for (int x : nums1) {
        int diag = 0;
        for (int j = 1; j <= n; j++) {
            int old = dp[j];
            dp[j] = x == nums2[j - 1] ? diag + 1 : Math.max(dp[j], dp[j - 1]);
            diag = old;
        }
    }
    return dp[n];
}`,
        javascript: `function maxUncrossedLines(nums1, nums2) {
  const n = nums2.length, dp = Array(n + 1).fill(0);
  for (const x of nums1) {
    let diag = 0;
    for (let j = 1; j <= n; j++) {
      const old = dp[j];
      dp[j] = x === nums2[j - 1] ? diag + 1 : Math.max(dp[j], dp[j - 1]);
      diag = old;
    }
  }
  return dp[n];
}`,
      },
    },
  ],
  pitfalls: ['數值相同仍要維持兩列中的相對順序,不能只數共同元素。', '一維版本的 diag 是更新前的左上角,不能用更新後的 dp[j−1] 代替。'],
  check: { kind: 'fn', fn: 'maxUncrossedLines', cases: [
    { args: [A, B], out: 2 },
    { args: [[2, 5, 1, 2, 5], [10, 5, 2, 1, 5, 2]], out: 3 },
    { args: [[1, 1, 1], [1, 1]], out: 2 },
    { args: [[1, 2], [3, 4]], out: 0 },
  ] },
}
