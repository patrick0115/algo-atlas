import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 72. Edit Distance

const W1 = 'horse'
const W2 = 'ros'

function table(dp: (number | string)[][], hl: Cell[] = [], cmp: Cell[] = [], path: Cell[] = []): GridViewData {
  return {
    kind: 'grid',
    label: `dp[i][j] = 把 word1 的前 i 個字變成 word2 的前 j 個字,最少幾步(列:word1、行:word2)`,
    cells: dp.map((r) => [...r]),
    rowLabels: ['""', ...W1],
    colLabels: ['""', ...W2],
    marks: { hl, cmp, path },
  }
}

function dpFig(): FigStep[] {
  const m = W1.length
  const n = W2.length
  const dp: (number | string)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  const out: FigStep[] = [{ note: '第 0 行:把前 i 個字變成空字串 → 刪 i 次;第 0 列:空字串變成前 j 個字 → 插入 j 次', views: [table(dp)] }]
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      if (W1[i - 1] === W2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
        out.push({ note: `"${W1[i - 1]}" == "${W2[j - 1]}":最後一個字一樣,不用動 → 等於左上 ${dp[i][j]}`, views: [table(dp, [[i, j]], [[i - 1, j - 1]])] })
      } else {
        const rep = dp[i - 1][j - 1] as number
        const del = dp[i - 1][j] as number
        const ins = dp[i][j - 1] as number
        dp[i][j] = 1 + Math.min(rep, del, ins)
        out.push({ note: `"${W1[i - 1]}" ≠ "${W2[j - 1]}":取代(左上 ${rep})、刪除 "${W1[i - 1]}"(上 ${del})、插入 "${W2[j - 1]}"(左 ${ins}),挑最小 + 1 = ${dp[i][j]}`, views: [table(dp, [[i, j]], [[i - 1, j - 1], [i - 1, j], [i, j - 1]])] })
      }
    }
  out.push({ note: `右下角 dp[${m}][${n}] = ${dp[m][n]}:horse → rorse(取代)→ rose(刪除)→ ros(刪除)`, views: [table(dp, [[m, n]])] })
  return out
}

export const q0072: Solution = {
  id: 72,
  plain: '把一個單字改成另一個單字,每一步只能做三種操作之一:插入一個字、刪除一個字、把一個字換成另一個字。最少要幾步?這叫「編輯距離」,拼字檢查就是用它找最接近的單字。',
  statement: '給兩個字串 `word1`、`word2`,回傳把 word1 轉換成 word2 的最少操作次數。可用的操作:插入一個字元、刪除一個字元、取代一個字元。',
  examples: [
    { input: 'word1 = "horse", word2 = "ros"', output: '3' },
    { input: 'word1 = "intention", word2 = "execution"', output: '5' },
  ],
  constraints: ['兩個字串長度都 ≤ 500 → O(m·n) = 25 萬'],
  insight: [
    '只看兩個字串的**最後一個字**:一樣的話不用動,問題變成兩邊都去掉最後一個字',
    '不一樣的話,最後一步只有三種可能:① 把 word1 的最後一個字**換成** word2 的(→ 兩邊都去掉);② **刪掉** word1 的最後一個字(→ word1 去掉);③ 在 word1 後面**插入** word2 的最後一個字(→ word2 去掉)',
    '`dp[i][j]` = word1 前 i 個 → word2 前 j 個的最少步數。不同時 `= 1 + min(左上, 上, 左)`;相同時 `= 左上`',
    '邊界:一邊是空字串時,只能一直插入或一直刪除',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i, j)` = word1[i:] 變成 word2[j:] 的最少步數。字元相同 → `f(i+1, j+1)`;否則 `1 + min(f(i+1, j+1) 取代, f(i+1, j) 刪除, f(i, j+1) 插入)`。',
      steps: ['`i == m` → 剩下的 word2 全部插入:`n − j`', '`j == n` → 剩下的 word1 全部刪除:`m − i`', '相同 → `f(i+1, j+1)`', '不同 → `1 + min(三種)`;記憶化'],
      figure: { title: `word1 = "${W1}", word2 = "${W2}"`, steps: dpFig().slice(0, 3) },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '(i, j) 共 m·n 種狀態,每個 O(1)。' },
      verdict: '直接照「三種操作」寫成遞迴,最容易想通;再改成由下往上的表就是方法二。',
      code: {
        python: `from functools import lru_cache

def minDistance(word1, word2):
    m, n = len(word1), len(word2)

    @lru_cache(maxsize=None)
    def f(i, j):
        if i == m:
            return n - j                  # 剩下的全部插入
        if j == n:
            return m - i                  # 剩下的全部刪除
        if word1[i] == word2[j]:
            return f(i + 1, j + 1)
        return 1 + min(f(i + 1, j + 1),   # 取代
                       f(i + 1, j),       # 刪除 word1[i]
                       f(i, j + 1))       # 插入 word2[j]

    return f(0, 0)`,
        c: `static int memo[501][501], M_, N_;
static char *A_, *B_;

static int f(int i, int j) {
    if (i == M_) return N_ - j;
    if (j == N_) return M_ - i;
    if (memo[i][j] >= 0) return memo[i][j];
    int r;
    if (A_[i] == B_[j]) r = f(i + 1, j + 1);
    else {
        int a = f(i + 1, j + 1), b = f(i + 1, j), c = f(i, j + 1);
        r = 1 + (a < b ? (a < c ? a : c) : (b < c ? b : c));
    }
    return memo[i][j] = r;
}

int minDistance(char *word1, char *word2) {
    A_ = word1; B_ = word2; M_ = strlen(word1); N_ = strlen(word2);
    memset(memo, -1, sizeof(memo));
    return f(0, 0);
}`,
        cpp: `int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> memo(m + 1, vector<int>(n + 1, -1));
    function<int(int, int)> f = [&](int i, int j) -> int {
        if (i == m) return n - j;
        if (j == n) return m - i;
        if (memo[i][j] >= 0) return memo[i][j];
        if (word1[i] == word2[j]) return memo[i][j] = f(i + 1, j + 1);
        return memo[i][j] = 1 + min({f(i + 1, j + 1), f(i + 1, j), f(i, j + 1)});
    };
    return f(0, 0);
}`,
        java: `private int[][] memo;
private String a, b;

int minDistance(String word1, String word2) {
    a = word1; b = word2;
    memo = new int[a.length() + 1][b.length() + 1];
    for (int[] row : memo) Arrays.fill(row, -1);
    return f(0, 0);
}

private int f(int i, int j) {
    if (i == a.length()) return b.length() - j;
    if (j == b.length()) return a.length() - i;
    if (memo[i][j] >= 0) return memo[i][j];
    if (a.charAt(i) == b.charAt(j)) return memo[i][j] = f(i + 1, j + 1);
    return memo[i][j] = 1 + Math.min(f(i + 1, j + 1), Math.min(f(i + 1, j), f(i, j + 1)));
}`,
        javascript: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const memo = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(-1));
  const f = (i, j) => {
    if (i === m) return n - j;
    if (j === n) return m - i;
    if (memo[i][j] >= 0) return memo[i][j];
    if (word1[i] === word2[j]) return (memo[i][j] = f(i + 1, j + 1));
    return (memo[i][j] = 1 + Math.min(f(i + 1, j + 1), f(i + 1, j), f(i, j + 1)));
  };
  return f(0, 0);
}`,
      },
    },
    {
      name: '二維 DP 表(由前往後)',
      idea: '`dp[i][0] = i`、`dp[0][j] = j`。`word1[i−1] == word2[j−1]` → `dp[i][j] = dp[i−1][j−1]`;否則 `1 + min(dp[i−1][j−1], dp[i−1][j], dp[i][j−1])`。',
      steps: ['初始化第 0 行和第 0 列', '`for i in 1..m`、`for j in 1..n`:照上面的規則填', '回傳 `dp[m][n]`'],
      figure: { title: `word1 = "${W1}", word2 = "${W2}"`, steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '填 (m+1)(n+1) 格。只依賴上一列和同列左邊,可以壓成 O(n)。' },
      verdict: '標準解,[[p:lcs]]家族(兩個字串的 DP)最經典的一題。表格的三個方向分別對應三種操作,一定要能畫出來解釋。',
      code: {
        python: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                      # 刪掉 i 個
    for j in range(n + 1):
        dp[0][j] = j                      # 插入 j 個
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1],   # 取代
                                   dp[i - 1][j],       # 刪除
                                   dp[i][j - 1])       # 插入
    return dp[m][n]`,
        c: `int minDistance(char *word1, char *word2) {
    int m = strlen(word1), n = strlen(word2);
    static int dp[501][501];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else {
                int a = dp[i - 1][j - 1], b = dp[i - 1][j], c = dp[i][j - 1];
                dp[i][j] = 1 + (a < b ? (a < c ? a : c) : (b < c ? b : c));
            }
        }
    return dp[m][n];
}`,
        cpp: `int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = word1[i - 1] == word2[j - 1] ? dp[i - 1][j - 1]
                     : 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
    return dp[m][n];
}`,
        java: `int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = word1.charAt(i - 1) == word2.charAt(j - 1) ? dp[i - 1][j - 1]
                     : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
    return dp[m][n];
}`,
        javascript: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = word1[i - 1] === word2[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}`,
      },
    },
  ],
  pitfalls: [
    '字元相同時還 +1:相同就不用任何操作,直接等於左上',
    '邊界沒初始化:dp[i][0] = i(全部刪掉)、dp[0][j] = j(全部插入)',
    'dp 的索引:dp[i][j] 看的是 `word1[i−1]` 和 `word2[j−1]`(前 i 個字的最後一個)',
  ],
  followUp: [
    { q: '只能刪除?', a: '583. Delete Operation for Two Strings:答案 = m + n − 2·LCS(1143 題)。' },
    { q: '只要判斷距離是不是 1?', a: '161. One Edit Distance:不用 DP,雙指針逐字比,遇到第一個不同就分三種情況檢查剩下的部分。' },
  ],
  check: {
    kind: 'fn',
    fn: 'minDistance',
    cases: [
      { args: [W1, W2], out: 3 },
      { args: ['intention', 'execution'], out: 5 },
      { args: ['', 'abc'], out: 3 },
      { args: ['abc', 'abc'], out: 0 },
      { args: ['abc', ''], out: 3 },
      { args: ['kitten', 'sitting'], out: 3 },
    ],
  },
}
