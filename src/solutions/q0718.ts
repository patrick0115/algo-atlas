import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [1, 2, 3, 2, 1]
const B = [3, 2, 1, 4, 7]

export const q0718: Solution = {
  id: 718,
  plain: '找兩個陣列中最長的「連續且完全相同」片段，回傳片段長度。',
  statement: '給 nums1、nums2，找同時出現在兩者中的最長連續子陣列，回傳其長度。',
  examples: [{ input: 'nums1 = [1,2,3,2,1], nums2 = [3,2,1,4,7]', output: '3', note: '共同片段 [3,2,1]。' }, { input: 'nums1 = [0,0,0], nums2 = [0,0]', output: '2' }],
  constraints: ['兩陣列長度各最多 1000；O(mn) 可接受。'],
  insight: ['連續片段一旦遇到不同數字就斷掉，不能沿用較早的最佳長度。', '`dp[i][j]` 表示以 nums1[i−1]、nums2[j−1] 結尾的共同片段長度。', '相等就接在左上角後面，不等就歸零；這是 [[p:dp-general]]。'],
  approaches: [
    {
      name: '二維動態規劃',
      idea: '用表格記錄每對結尾形成的共同連續長度。',
      steps: ['建立 `(m+1)×(n+1)` 的零表', '相等時 `dp[i][j]=dp[i−1][j−1]+1`', '不相等時保持 0，隨時更新最大值'],
      figure: { title: 'nums1=[1,2,3,2,1], nums2=[3,2,1,4,7]', steps: [
        { note: '前兩個結尾尚未接出長片段；遇到相同的 1 時長度為 1。', views: [arr(A, { label: 'nums1', highlight: [0] }), arr(B, { label: 'nums2', highlight: [2] }), arr([1], { label: '最大長度' })] },
        { note: 'nums1 的 3 與 nums2 的 3 相同，另開一段，長度 1。', views: [arr(A, { label: 'nums1', highlight: [2] }), arr(B, { label: 'nums2', highlight: [0] }), arr([1], { label: '最大長度' })] },
        { note: '下一對都是 2，接上前面的 3，長度成 2。', views: [arr(A, { label: 'nums1', highlight: [2, 3] }), arr(B, { label: 'nums2', highlight: [0, 1] }), arr([2], { label: '最大長度' })] },
        { note: '再下一對都是 1，連成 [3,2,1]，答案為 3。', views: [arr(A, { label: 'nums1', done: [2, 3, 4] }), arr(B, { label: 'nums2', done: [0, 1, 2] }), arr([3], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每個格子只計算一次。' },
      verdict: '表格的每個數值有明確意思，最適合先學會轉移式。',
      code: {
        python: `def findLength(nums1, nums2):
    m, n = len(nums1), len(nums2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    best = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if nums1[i - 1] == nums2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # 接上共同片段
                best = max(best, dp[i][j])
    return best`,
        c: `int findLength(int *nums1, int nums1Size, int *nums2, int nums2Size) {
    int m = nums1Size, n = nums2Size;
    int *dp = calloc((m + 1) * (n + 1), sizeof(int));
    int best = 0;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (nums1[i - 1] == nums2[j - 1]) {
                int k = i * (n + 1) + j;
                dp[k] = dp[(i - 1) * (n + 1) + j - 1] + 1;
                if (dp[k] > best) best = dp[k];
            }
        }
    }
    free(dp);
    return best;
}`,
        cpp: `int findLength(vector<int>& nums1, vector<int>& nums2) {
    int m = nums1.size(), n = nums2.size(), best = 0;
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (nums1[i - 1] == nums2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                best = max(best, dp[i][j]);
            }
        }
    }
    return best;
}`,
        java: `int findLength(int[] nums1, int[] nums2) {
    int m = nums1.length, n = nums2.length, best = 0;
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (nums1[i - 1] == nums2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                best = Math.max(best, dp[i][j]);
            }
        }
    }
    return best;
}`,
        javascript: `function findLength(nums1, nums2) {
  const m = nums1.length, n = nums2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let best = 0;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (nums1[i - 1] === nums2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        best = Math.max(best, dp[i][j]);
      }
    }
  }
  return best;
}`,
      },
    },
    {
      name: '一維表格倒序更新',
      idea: '每列只用上一列左上角的值，j 倒著走便可原地更新。',
      steps: ['建立長度 `n+1` 的零陣列', '每列從 `j=n` 倒著走到 1', '相等就 `dp[j]=dp[j−1]+1`，否則設為 0'],
      figure: { title: 'nums1=[1,2,3,2,1], nums2=[3,2,1,4,7]', steps: [
        { note: '處理 nums1 的第一個 1，對上 nums2 的第三格，dp[3] 成 1。', views: [arr([0, 0, 0, 1, 0, 0], { label: 'dp', highlight: [3] })] },
        { note: '處理 3 時，對上 nums2 第一格，dp[1] 成 1。', views: [arr([0, 1, 0, 0, 0, 0], { label: 'dp', highlight: [1] })] },
        { note: '處理下一個 2，dp[2] 讀到上一列的 dp[1]，成 2。', views: [arr([0, 0, 2, 0, 0, 0], { label: 'dp', highlight: [2] })] },
        { note: '最後的 1 接在 2 後面，dp[3] 成 3。倒序讓舊 dp[2] 尚未被覆蓋。', views: [arr([0, 0, 0, 3, 0, 0], { label: 'dp', done: [3] })] },
      ] },
      complexity: { time: 'O(mn)', space: 'O(n)', why: '只保留一列。' },
      verdict: '同樣的轉移式，省下整張表的記憶體。',
      code: {
        python: `def findLength(nums1, nums2):
    dp = [0] * (len(nums2) + 1)
    best = 0
    for a in nums1:
        for j in range(len(nums2), 0, -1):  # 倒序，保住上一列的左上角
            dp[j] = dp[j - 1] + 1 if a == nums2[j - 1] else 0
            best = max(best, dp[j])
    return best`,
        c: `int findLength(int *nums1, int nums1Size, int *nums2, int nums2Size) {
    int *dp = calloc(nums2Size + 1, sizeof(int));
    int best = 0;
    for (int i = 0; i < nums1Size; i++) {
        for (int j = nums2Size; j >= 1; j--) {
            dp[j] = nums1[i] == nums2[j - 1] ? dp[j - 1] + 1 : 0;
            if (dp[j] > best) best = dp[j];
        }
    }
    free(dp);
    return best;
}`,
        cpp: `int findLength(vector<int>& nums1, vector<int>& nums2) {
    vector<int> dp(nums2.size() + 1);
    int best = 0;
    for (int a : nums1) {
        for (int j = nums2.size(); j >= 1; j--) {
            dp[j] = a == nums2[j - 1] ? dp[j - 1] + 1 : 0;
            best = max(best, dp[j]);
        }
    }
    return best;
}`,
        java: `int findLength(int[] nums1, int[] nums2) {
    int[] dp = new int[nums2.length + 1];
    int best = 0;
    for (int a : nums1) {
        for (int j = nums2.length; j >= 1; j--) {
            dp[j] = a == nums2[j - 1] ? dp[j - 1] + 1 : 0;
            best = Math.max(best, dp[j]);
        }
    }
    return best;
}`,
        javascript: `function findLength(nums1, nums2) {
  const dp = new Array(nums2.length + 1).fill(0);
  let best = 0;
  for (const a of nums1) {
    for (let j = nums2.length; j >= 1; j--) {
      dp[j] = a === nums2[j - 1] ? dp[j - 1] + 1 : 0;
      best = Math.max(best, dp[j]);
    }
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['不同時要設為 0；取左、上最大值會變成「子序列」，不再要求連續。', '一維版若 j 正序，會讀到本列剛更新的值，錯把同一列接成片段。'],
  check: { kind: 'fn', fn: 'findLength', cases: [
    { args: [A, B], out: 3 },
    { args: [[0, 0, 0], [0, 0]], out: 2 },
    { args: [[1, 2], [3, 4]], out: 0 },
  ] },
}
