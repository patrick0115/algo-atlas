import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1143. Longest Common Subsequence

const A = 'abcde'
const B = 'ace'

function table(dp: (number | string)[][], hl: Cell[] = [], cmp: Cell[] = [], path: Cell[] = []): GridViewData {
  return { kind: 'grid', label: 'dp[i][j] = text1 前 i 個字和 text2 前 j 個字的 LCS 長度', cells: dp.map((r) => [...r]), rowLabels: ['""', ...A], colLabels: ['""', ...B], marks: { hl, cmp, path } }
}

function dpFig(): FigStep[] {
  const m = A.length
  const n = B.length
  const dp: (number | string)[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : '')))
  const out: FigStep[] = [{ note: '第 0 列、第 0 行:其中一個是空字串,LCS 是 0', views: [table(dp)] }]
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) {
        dp[i][j] = (dp[i - 1][j - 1] as number) + 1
        out.push({ note: `"${A[i - 1]}" == "${B[j - 1]}":這個字可以放進共同子序列 → 左上 + 1 = ${dp[i][j]}`, views: [table(dp, [[i, j]], [[i - 1, j - 1]])] })
      } else {
        dp[i][j] = Math.max(dp[i - 1][j] as number, dp[i][j - 1] as number)
        out.push({ note: `"${A[i - 1]}" ≠ "${B[j - 1]}":兩個字至少有一個用不到 → max(上 ${dp[i - 1][j]}, 左 ${dp[i][j - 1]}) = ${dp[i][j]}`, views: [table(dp, [[i, j]], [[i - 1, j], [i, j - 1]])] })
      }
    }
  const path: Cell[] = []
  let i = m
  let j = n
  const res: string[] = []
  while (i > 0 && j > 0) {
    if (A[i - 1] === B[j - 1]) {
      path.push([i, j])
      res.unshift(A[i - 1])
      i--
      j--
    } else if ((dp[i - 1][j] as number) >= (dp[i][j - 1] as number)) i--
    else j--
  }
  out.push({ note: `答案 dp[${m}][${n}] = ${dp[m][n]}。從右下角往回走(相同就往左上),可以還原出 LCS "${res.join('')}"`, views: [table(dp, [[m, n]], [], path)] })
  return out
}

function rowFig(): FigStep[] {
  return [
    { note: '每一格只用到「左上、上、左」三格 → 只要保留上一列(或一列加一個變數)就夠', views: [arr([0, 1, 1, 1], { label: '上一列' }), arr([0, 1, 1, '?'], { label: '這一列(由左往右填)' })] },
    { note: '用一列陣列時要另外記住「左上」(被覆蓋前的舊值),做法和 62 題的滾動陣列一樣', views: [arr([0, 1, 2, 2], { label: '滾動陣列' })] },
  ]
}

export const q1143: Solution = {
  id: 1143,
  plain: '找兩個字串「共同擁有」的最長子序列:可以從兩個字串裡各自跳著挑字,但順序要一樣,挑出來的要完全相同。例如 "abcde" 和 "ace" 的最長共同子序列是 "ace",長度 3。',
  statement: '給兩個字串 `text1`、`text2`,回傳它們最長**公共子序列**的長度;沒有就回傳 0。子序列可以刪掉某些字元,但不能改變剩下字元的順序。',
  examples: [
    { input: 'text1 = "abcde", text2 = "ace"', output: '3', note: '"ace"' },
    { input: 'text1 = "abc", text2 = "abc"', output: '3' },
    { input: 'text1 = "abc", text2 = "def"', output: '0' },
  ],
  constraints: ['兩個字串長度都 ≤ 1000 → O(m·n) = 100 萬'],
  insight: [
    '兩個字串的 DP:`dp[i][j]` = text1 前 i 個字、text2 前 j 個字的答案',
    '看最後一個字:**相同** → 一定可以把它放進 LCS:`dp[i−1][j−1] + 1`',
    '**不同** → 至少有一個字不會被用到:丟掉 text1 的最後一個(`dp[i−1][j]`)或丟掉 text2 的(`dp[i][j−1]`),取比較大的',
    '這個表格的結構和 [72. Edit Distance](#/q/72) 一模一樣,只是規則從 min 變 max',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i, j)` = text1[i:] 和 text2[j:] 的 LCS。相同 → `1 + f(i+1, j+1)`;不同 → `max(f(i+1, j), f(i, j+1))`。',
      steps: ['任一邊走完 → 0', '`text1[i] == text2[j]` → `1 + f(i + 1, j + 1)`', '否則 `max(f(i + 1, j), f(i, j + 1))`', '記憶化'],
      figure: { title: `text1 = "${A}", text2 = "${B}"`, steps: dpFig().slice(0, 4) },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '狀態 (i, j) 共 m·n 種。遞迴深度最多 m + n。' },
      verdict: '想法最直接。長度 1000 時遞迴深度 2000,Python 要調高遞迴上限。',
      code: {
        python: `import sys
from functools import lru_cache

def longestCommonSubsequence(text1, text2):
    sys.setrecursionlimit(5000)
    m, n = len(text1), len(text2)

    @lru_cache(maxsize=None)
    def f(i, j):
        if i == m or j == n:
            return 0
        if text1[i] == text2[j]:
            return 1 + f(i + 1, j + 1)
        return max(f(i + 1, j), f(i, j + 1))

    return f(0, 0)`,
        c: `static short memo[1001][1001];
static char *A_, *B_;
static int M_, N_;

static int f(int i, int j) {
    if (i == M_ || j == N_) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    int r;
    if (A_[i] == B_[j]) r = 1 + f(i + 1, j + 1);
    else { int a = f(i + 1, j), b = f(i, j + 1); r = a > b ? a : b; }
    return memo[i][j] = r;
}

int longestCommonSubsequence(char *text1, char *text2) {
    A_ = text1; B_ = text2; M_ = strlen(text1); N_ = strlen(text2);
    for (int i = 0; i < M_; i++) for (int j = 0; j < N_; j++) memo[i][j] = -1;
    return f(0, 0);
}`,
        cpp: `int longestCommonSubsequence(string text1, string text2) {
    int m = text1.size(), n = text2.size();
    vector<vector<int>> memo(m, vector<int>(n, -1));
    function<int(int, int)> f = [&](int i, int j) -> int {
        if (i == m || j == n) return 0;
        if (memo[i][j] >= 0) return memo[i][j];
        if (text1[i] == text2[j]) return memo[i][j] = 1 + f(i + 1, j + 1);
        return memo[i][j] = max(f(i + 1, j), f(i, j + 1));
    };
    return f(0, 0);
}`,
        java: `private int[][] memo;
private String a, b;

int longestCommonSubsequence(String text1, String text2) {
    a = text1; b = text2;
    memo = new int[a.length()][b.length()];
    for (int[] row : memo) Arrays.fill(row, -1);
    return f(0, 0);
}

private int f(int i, int j) {
    if (i == a.length() || j == b.length()) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    if (a.charAt(i) == b.charAt(j)) return memo[i][j] = 1 + f(i + 1, j + 1);
    return memo[i][j] = Math.max(f(i + 1, j), f(i, j + 1));
}`,
        javascript: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const memo = Array.from({ length: m }, () => new Array(n).fill(-1));
  const f = (i, j) => {
    if (i === m || j === n) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    if (text1[i] === text2[j]) return (memo[i][j] = 1 + f(i + 1, j + 1));
    return (memo[i][j] = Math.max(f(i + 1, j), f(i, j + 1)));
  };
  return f(0, 0);
}`,
      },
    },
    {
      name: '二維 DP 表',
      idea: '`dp[i][j] = dp[i−1][j−1] + 1`(最後一個字相同)或 `max(dp[i−1][j], dp[i][j−1])`(不同)。',
      steps: ['`dp` 是 (m+1) × (n+1) 的 0', '`for i in 1..m`、`for j in 1..n`:照規則填', '回傳 `dp[m][n]`'],
      figure: { title: `text1 = "${A}", text2 = "${B}"`, steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '填整張表。' },
      verdict: '標準解,[[p:lcs]]的模板。保留整張表還能倒推出 LCS 本身。',
      code: {
        python: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1   # 最後一個字放進 LCS
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
        c: `int longestCommonSubsequence(char *text1, char *text2) {
    int m = strlen(text1), n = strlen(text2);
    static short dp[1001][1001];
    for (int i = 0; i <= m; i++)
        for (int j = 0; j <= n; j++) {
            if (i == 0 || j == 0) dp[i][j] = 0;
            else if (text1[i - 1] == text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
        }
    return dp[m][n];
}`,
        cpp: `int longestCommonSubsequence(string text1, string text2) {
    int m = text1.size(), n = text2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = text1[i - 1] == text2[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}`,
        java: `int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = text1.charAt(i - 1) == text2.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}`,
        javascript: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = text1[i - 1] === text2[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}`,
      },
    },
    {
      name: '一列陣列 + 記住左上',
      idea: '只留一列 `row`。由左往右更新時,`row[j]` 在更新前是「上」,`row[j−1]` 已經是「左」;「左上」要用一個變數 `prev` 在覆蓋前存起來。',
      steps: ['`row = [0] * (n + 1)`', '每個 i:`prev = 0`(左上)', '`for j in 1..n`:`tmp = row[j]`;相同 → `row[j] = prev + 1`,否則 `row[j] = max(row[j], row[j−1])`;`prev = tmp`'],
      figure: { title: `text1 = "${A}", text2 = "${B}"`, steps: rowFig() },
      complexity: { time: 'O(m · n)', space: 'O(min(m, n))', why: '只留一列(可以讓短的字串當列)。' },
      verdict: '空間最省。「左上」會被覆蓋,一定要先存起來 —— 這是二維 DP 壓成一維時最常見的陷阱。',
      code: {
        python: `def longestCommonSubsequence(text1, text2):
    if len(text1) < len(text2):
        text1, text2 = text2, text1       # 讓 row 用比較短的那個
    n = len(text2)
    row = [0] * (n + 1)
    for c in text1:
        prev = 0                          # dp[i-1][j-1](左上)
        for j in range(1, n + 1):
            tmp = row[j]                  # 覆蓋前的 row[j] = dp[i-1][j](上)
            row[j] = prev + 1 if c == text2[j - 1] else max(row[j], row[j - 1])
            prev = tmp
    return row[n]`,
        c: `int longestCommonSubsequence(char *text1, char *text2) {
    int n = strlen(text2), row[1001] = {0};
    for (char *p = text1; *p; p++) {
        int prev = 0;
        for (int j = 1; j <= n; j++) {
            int tmp = row[j];
            row[j] = *p == text2[j - 1] ? prev + 1 : (row[j] > row[j - 1] ? row[j] : row[j - 1]);
            prev = tmp;
        }
    }
    return row[n];
}`,
        cpp: `int longestCommonSubsequence(string text1, string text2) {
    int n = text2.size();
    vector<int> row(n + 1, 0);
    for (char c : text1) {
        int prev = 0;
        for (int j = 1; j <= n; j++) {
            int tmp = row[j];
            row[j] = c == text2[j - 1] ? prev + 1 : max(row[j], row[j - 1]);
            prev = tmp;
        }
    }
    return row[n];
}`,
        java: `int longestCommonSubsequence(String text1, String text2) {
    int n = text2.length();
    int[] row = new int[n + 1];
    for (char c : text1.toCharArray()) {
        int prev = 0;
        for (int j = 1; j <= n; j++) {
            int tmp = row[j];
            row[j] = c == text2.charAt(j - 1) ? prev + 1 : Math.max(row[j], row[j - 1]);
            prev = tmp;
        }
    }
    return row[n];
}`,
        javascript: `function longestCommonSubsequence(text1, text2) {
  const n = text2.length, row = new Array(n + 1).fill(0);
  for (const c of text1) {
    let prev = 0;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      row[j] = c === text2[j - 1] ? prev + 1 : Math.max(row[j], row[j - 1]);
      prev = tmp;
    }
  }
  return row[n];
}`,
      },
    },
  ],
  pitfalls: [
    '字元相同時取 `max(上, 左, 左上 + 1)`:結果一樣,但相同時直接用左上 + 1 就保證最優',
    '和「最長公共**子字串**」(要連續)搞混:子字串在字元不同時要歸 0',
    '一列版本忘了存左上:更新 row[j−1] 之後,舊的 row[j−1] 就不見了',
  ],
  followUp: [
    { q: '要最長公共子字串(連續)?', a: '718. Maximum Length of Repeated Subarray:相同 → 左上 + 1,不同 → 0,答案是整張表的最大值。' },
    { q: '還有哪些題是同一張表?', a: '[72. Edit Distance](#/q/72)、583、712、[97. Interleaving String](#/q/97)、115 Distinct Subsequences。' },
  ],
  check: {
    kind: 'fn',
    fn: 'longestCommonSubsequence',
    cases: [
      { args: [A, B], out: 3 },
      { args: ['abc', 'abc'], out: 3 },
      { args: ['abc', 'def'], out: 0 },
      { args: ['bsbininm', 'jmjkbkjkv'], out: 1 },
      { args: ['oxcpqrsvwf', 'shmtulqrypy'], out: 2 },
    ],
  },
}
