import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 516. Longest Palindromic Subsequence
const S = 'bbbab'
function intervalFig(): FigStep[] {
  const n = S.length
  const dp = Array.from({ length: n }, () => Array(n).fill(0) as number[])
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1
    for (let j = i + 1; j < n; j++)
      dp[i][j] = S[i] === S[j] ? 2 + (j === i + 1 ? 0 : dp[i + 1][j - 1]) : Math.max(dp[i + 1][j], dp[i][j - 1])
  }
  const view: GridViewData = { kind: 'grid', label: 'dp[i][j]:區間內最長回文子序列', cells: dp.map((row, i) => row.map((v, j) => (j < i ? '' : v))), rowLabels: [...S], colLabels: [...S], marks: { done: [[0, n - 1]] } }
  return [
    { note: '子序列可以跳過字元,只需保持原順序。bbbab 可挑 bbbb,長度 4。', views: [arr([...S], { label: 's' }), arr([...('bbbb')], { label: '挑出的回文' })] },
    { note: '看區間兩端:相同時兩端一起選,加上內部答案;不同時捨棄左端或右端,取較長者。', views: [view] },
  ]
}
const lcsFig: FigStep[] = [
  { note: '把字串反轉,求原字串和反轉字串的最長共同子序列,長度就等於最長回文子序列。', views: [arr([...S], { label: '原字串' }), arr([...S].reverse(), { label: '反轉字串' })] },
  { note: 'bbbab 和 babbb 的 LCS 長度是 4,例如 bbbb。', views: [arr([4], { label: '答案', done: [0] })] },
]

export const q0516: Solution = {
  id: 516,
  plain: '從字串中跳著挑字元,讓挑出的字從前往後和從後往前讀都一樣。問最長能挑幾個,例如 bbbab 可以挑 bbbb。',
  statement: '給字串 s,求其最長回文子序列長度。子序列可刪掉一些字元但不能改變剩餘字元的順序。',
  examples: [{ input: 's = "bbbab"', output: '4' }, { input: 's = "cbbd"', output: '2' }],
  constraints: ['字串長度 ≤ 1000'],
  insight: ['與回文子字串不同,這裡允許跳過字元。', '區間 dp[i][j] 表示 s[i..j] 裡可挑出的最長回文子序列。', '若兩端相同可同時選,否則至少捨棄其中一端。'],
  approaches: [
    {
      name: '區間動態規劃',
      idea: '從短區間往長區間算;兩端相同取內部加 2,不同取去掉一端後的較大值。',
      steps: ['所有 dp[i][i] = 1', 'i 從右往左,j 從 i+1 往右', '相同:dp[i][j] = dp[i+1][j−1]+2;不同:取 dp[i+1][j]、dp[i][j−1] 最大', '回傳 dp[0][n−1]'],
      figure: { title: 's = "bbbab"', steps: intervalFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每個區間計算一次。' },
      verdict: '直接描述回文的兩端選擇,也是區間 DP 的標準練習。',
      code: {
        python: `def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = 2 + (dp[i + 1][j - 1] if j > i + 1 else 0)
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
        c: `int longestPalindromeSubseq(char *s) {
    int n = strlen(s), *dp = calloc(n * n, sizeof(int));
    for (int i = n - 1; i >= 0; i--) {
        dp[i * n + i] = 1;
        for (int j = i + 1; j < n; j++)
            if (s[i] == s[j]) dp[i * n + j] = 2 + (j > i + 1 ? dp[(i + 1) * n + j - 1] : 0);
            else {
                int a = dp[(i + 1) * n + j], b = dp[i * n + j - 1];
                dp[i * n + j] = a > b ? a : b;
            }
    }
    int ans = dp[n - 1];
    free(dp);
    return ans;
}`,
        cpp: `int longestPalindromeSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n));
    for (int i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (int j = i + 1; j < n; j++)
            dp[i][j] = s[i] == s[j] ? 2 + (j > i + 1 ? dp[i + 1][j - 1] : 0)
                                     : max(dp[i + 1][j], dp[i][j - 1]);
    }
    return dp[0][n - 1];
}`,
        java: `int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (int j = i + 1; j < n; j++)
            dp[i][j] = s.charAt(i) == s.charAt(j)
                ? 2 + (j > i + 1 ? dp[i + 1][j - 1] : 0)
                : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
    return dp[0][n - 1];
}`,
        javascript: `function longestPalindromeSubseq(s) {
  const n = s.length, dp = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++)
      dp[i][j] = s[i] === s[j] ? 2 + (j > i + 1 ? dp[i + 1][j - 1] : 0)
                               : Math.max(dp[i + 1][j], dp[i][j - 1]);
  }
  return dp[0][n - 1];
}`,
      },
    },
    {
      name: '與反轉字串求 LCS',
      idea: '最長回文子序列的長度等於 s 與 reverse(s) 的最長共同子序列長度。',
      steps: ['產生反轉字串 r', '用一維 LCS 表,逐一處理 s 的字元', '相同從左上加 1,不同取上與左的最大值', '回傳 dp[n]'],
      figure: { title: '原字串與反轉字串', steps: lcsFig },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'LCS 的上一列可以用一維表覆蓋。' },
      verdict: '可沿用 [[p:lcs]] 模板;如果只求長度,記憶體比二維區間表少。',
      code: {
        python: `def longestPalindromeSubseq(s):
    r = s[::-1]
    n = len(s)
    dp = [0] * (n + 1)
    for a in s:
        diag = 0
        for j in range(1, n + 1):
            old = dp[j]
            dp[j] = diag + 1 if a == r[j - 1] else max(dp[j], dp[j - 1])
            diag = old
    return dp[n]`,
        c: `int longestPalindromeSubseq(char *s) {
    int n = strlen(s), *dp = calloc(n + 1, sizeof(int));
    for (int i = 0; i < n; i++) {
        int diag = 0;
        for (int j = 1; j <= n; j++) {
            int old = dp[j];
            if (s[i] == s[n - j]) dp[j] = diag + 1;
            else if (dp[j - 1] > dp[j]) dp[j] = dp[j - 1];
            diag = old;
        }
    }
    int ans = dp[n];
    free(dp);
    return ans;
}`,
        cpp: `int longestPalindromeSubseq(string s) {
    string r = s;
    reverse(r.begin(), r.end());
    int n = s.size();
    vector<int> dp(n + 1);
    for (char a : s) {
        int diag = 0;
        for (int j = 1; j <= n; j++) {
            int old = dp[j];
            dp[j] = a == r[j - 1] ? diag + 1 : max(dp[j], dp[j - 1]);
            diag = old;
        }
    }
    return dp[n];
}`,
        java: `int longestPalindromeSubseq(String s) {
    String r = new StringBuilder(s).reverse().toString();
    int n = s.length();
    int[] dp = new int[n + 1];
    for (int i = 0; i < n; i++) {
        int diag = 0;
        for (int j = 1; j <= n; j++) {
            int old = dp[j];
            dp[j] = s.charAt(i) == r.charAt(j - 1) ? diag + 1 : Math.max(dp[j], dp[j - 1]);
            diag = old;
        }
    }
    return dp[n];
}`,
        javascript: `function longestPalindromeSubseq(s) {
  const r = [...s].reverse().join(''), n = s.length, dp = Array(n + 1).fill(0);
  for (const a of s) {
    let diag = 0;
    for (let j = 1; j <= n; j++) {
      const old = dp[j];
      dp[j] = a === r[j - 1] ? diag + 1 : Math.max(dp[j], dp[j - 1]);
      diag = old;
    }
  }
  return dp[n];
}`,
      },
    },
  ],
  pitfalls: ['子序列能跳過字元,子字串則必須連續。', '區間 DP 的 i 要由右往左算,因為會用到 i+1。', '兩端相鄰時內部是空區間,其長度是 0。'],
  check: { kind: 'fn', fn: 'longestPalindromeSubseq', cases: [
    { args: [S], out: 4 }, { args: ['cbbd'], out: 2 },
    { args: ['a'], out: 1 }, { args: ['abcde'], out: 1 },
  ] },
}
