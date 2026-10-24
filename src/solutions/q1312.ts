import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1312. Minimum Insertion Steps to Make a String Palindrome
const S = 'mbadm'

export const q1312: Solution = {
  id: 1312,
  plain: '只准插入字母，讓字串左右對稱。原本兩端一樣就保留；不一樣時，必須替其中一端補上一個對稱字母。',
  statement: '給字串 s，求只透過插入字元把它變成回文所需的最少步數。',
  examples: [
    { input: 's = "zzazz"', output: '0' },
    { input: 's = "mbadm"', output: '2', note: '例如插入兩個字母得到 "mbdadbm"。' },
    { input: 's = "leetcode"', output: '5' },
  ],
  constraints: ['1 ≤ s.length ≤ 500；字元都是小寫英文字母。'],
  insight: ['若子字串兩端相同，可直接處理裡面；若不同，至少插入一個字元與其中一端配對。', '等價地，保留一條最長回文子序列，其餘 n−L 個字元各補一個對稱字元。'],
  approaches: [
    {
      name: '區間動態規劃',
      idea: 'dp[l][r] 表示 s[l..r] 變成回文的最少插入數；從短區間算到長區間。',
      steps: ['單一字元不用插入，dp[i][i] = 0。', '長度從 2 增加到 n。', '若兩端相同，dp[l][r] = dp[l+1][r−1]。', '否則 dp[l][r] = 1 + min(dp[l+1][r], dp[l][r−1])。'],
      figure: { title: 's = mbadm', steps: [
        { note: '單字元 m、b、a、d、m 本來都是回文，長度 1 的答案為 0。', views: [arr(S.split(''), { done: [0, 1, 2, 3, 4] })] },
        { note: '中間的 "bad" 兩端 b、d 不同；最少要插入 2 個字元，變成回文。', views: [arr(S.split(''), { highlight: [1, 3], compare: [2] })] },
        { note: '整段兩端都是 m，不必為 m 插入新字元，只需處理中間 "bad"。', views: [arr(S.split(''), { highlight: [0, 4], done: [1, 2, 3] })] },
        { note: '因此 dp[0][4] = dp[1][3] = 2。', views: [arr([0, 2, 2], { label: '單字元 / bad / mbadm 所需插入數', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '共有 O(n²) 個區間，每格只看已算好的較短區間。' },
      verdict: '最直接解釋「兩端配對」的決策；和 [516](#/q/516) 是同一問題的兩面。',
      code: {
        python: `def minInsertions(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for left in range(n - length + 1):
            right = left + length - 1
            if s[left] == s[right]:
                dp[left][right] = dp[left + 1][right - 1] if length > 2 else 0
            else:
                dp[left][right] = 1 + min(dp[left + 1][right], dp[left][right - 1])  # 補一端
    return dp[0][n - 1]`,
        c: `int minInsertions(char *s) {
    int n = strlen(s);
    int *dp = calloc(n * n, sizeof(int));
    for (int length = 2; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            if (s[left] == s[right]) {
                dp[left * n + right] = length == 2 ? 0 : dp[(left + 1) * n + right - 1];
            } else {
                int a = dp[(left + 1) * n + right];
                int b = dp[left * n + right - 1];
                dp[left * n + right] = 1 + (a < b ? a : b);
            }
        }
    }
    int answer = dp[n - 1];
    free(dp);
    return answer;
}`,
        cpp: `int minInsertions(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int length = 2; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            if (s[left] == s[right]) {
                dp[left][right] = length == 2 ? 0 : dp[left + 1][right - 1];
            } else {
                dp[left][right] = 1 + min(dp[left + 1][right], dp[left][right - 1]);
            }
        }
    }
    return dp[0][n - 1];
}`,
        java: `int minInsertions(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int length = 2; length <= n; length++) {
        for (int left = 0; left + length <= n; left++) {
            int right = left + length - 1;
            if (s.charAt(left) == s.charAt(right)) {
                dp[left][right] = length == 2 ? 0 : dp[left + 1][right - 1];
            } else {
                dp[left][right] = 1 + Math.min(dp[left + 1][right], dp[left][right - 1]);
            }
        }
    }
    return dp[0][n - 1];
}`,
        javascript: `function minInsertions(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= n; left++) {
      const right = left + length - 1;
      if (s[left] === s[right]) {
        dp[left][right] = length === 2 ? 0 : dp[left + 1][right - 1];
      } else {
        dp[left][right] = 1 + Math.min(dp[left + 1][right], dp[left][right - 1]);
      }
    }
  }
  return dp[0][n - 1];
}`,
      },
    },
    {
      name: '最長回文子序列',
      idea: '把 s 與反向的 s 做最長共同子序列，長度 L 就是最長回文子序列；答案為 n−L。',
      steps: ['把 s 反轉成 rev。', 'dp[i][j] 是 s 前 i 字元與 rev 前 j 字元的 LCS 長度。', '字元相同就取對角線加一；不同就取上或左的最大值。', '回傳 n−dp[n][n]。'],
      figure: { title: 's = mbadm，rev = mdabm', steps: [
        { note: '反向字串是 mdabm；尋找兩者都能按順序選出的字元。', views: [arr(S.split(''), { label: 's' }), arr('mdabm'.split(''), { label: 'rev' })] },
        { note: '兩端的 m 可保留，成為共同子序列的首尾。', views: [arr(S.split(''), { highlight: [0, 4] })] },
        { note: '中間可選 a；得到共同且回文的子序列 "mam"，長度 3。', views: [arr(S.split(''), { done: [0, 2, 4], dim: [1, 3] })] },
        { note: '其餘兩個字元 b、d 各需一個對稱字元，5−3 = 2 次插入。', views: [arr([5, 3, 2], { label: '原長 / 保留 / 插入', done: [2] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: 'LCS 表共有 (n+1)² 格。' },
      verdict: '提供另一種理解方式，與 [[p:lcs]] 相連。',
      code: {
        python: `def minInsertions(s):
    rev = s[::-1]
    n = len(s)
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, n + 1):
            if s[i - 1] == rev[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # 保留相同字元
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return n - dp[n][n]`,
        c: `int minInsertions(char *s) {
    int n = strlen(s);
    int width = n + 1;
    int *dp = calloc(width * width, sizeof(int));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (s[i - 1] == s[n - j]) {
                dp[i * width + j] = dp[(i - 1) * width + j - 1] + 1;
            } else {
                int a = dp[(i - 1) * width + j];
                int b = dp[i * width + j - 1];
                dp[i * width + j] = a > b ? a : b;
            }
        }
    }
    int answer = n - dp[n * width + n];
    free(dp);
    return answer;
}`,
        cpp: `int minInsertions(string s) {
    string rev = s;
    reverse(rev.begin(), rev.end());
    int n = s.size();
    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (s[i - 1] == rev[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return n - dp[n][n];
}`,
        java: `int minInsertions(String s) {
    String rev = new StringBuilder(s).reverse().toString();
    int n = s.length();
    int[][] dp = new int[n + 1][n + 1];
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (s.charAt(i - 1) == rev.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return n - dp[n][n];
}`,
        javascript: `function minInsertions(s) {
  const rev = [...s].reverse().join('');
  const n = s.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      if (s[i - 1] === rev[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return n - dp[n][n];
}`,
      },
    },
  ],
  pitfalls: ['區間長度為 2 且兩端相同時，內部是空區間，答案 0。', '子序列可以跳過字元；不能把最長回文子字串的長度拿來相減。'],
  check: { kind: 'fn', fn: 'minInsertions', cases: [
    { args: ['zzazz'], out: 0 },
    { args: [S], out: 2 },
    { args: ['leetcode'], out: 5 },
    { args: ['a'], out: 0 },
  ] },
}
