import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 97. Interleaving String

const S1 = 'aab'
const S2 = 'dbc'
const S3 = 'adabcb'

function table(dp: string[][], hl: Cell[] = [], cmp: Cell[] = []): GridViewData {
  return { kind: 'grid', label: 'dp[i][j]:s1 前 i 個 + s2 前 j 個,能不能交錯成 s3 前 i+j 個(✓ / ·)', cells: dp.map((r) => [...r]), rowLabels: ['""', ...S1], colLabels: ['""', ...S2], marks: { hl, cmp, done: dp.flatMap((r, i) => r.flatMap((v, j) => (v === '✓' ? [[i, j] as Cell] : []))) } }
}

function dpFig(): FigStep[] {
  const m = S1.length
  const n = S2.length
  const dp: string[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''))
  const out: FigStep[] = [{ note: `s3 的第 i+j 個字,一定是 s1 的第 i 個或 s2 的第 j 個(交錯時兩邊各自保持順序)。dp[0][0] = ✓`, views: [table(dp)] }]
  for (let i = 0; i <= m; i++)
    for (let j = 0; j <= n; j++) {
      if (i === 0 && j === 0) {
        dp[0][0] = '✓'
        continue
      }
      const c = S3[i + j - 1]
      const fromUp = i > 0 && dp[i - 1][j] === '✓' && S1[i - 1] === c
      const fromLeft = j > 0 && dp[i][j - 1] === '✓' && S2[j - 1] === c
      dp[i][j] = fromUp || fromLeft ? '✓' : '·'
      out.push({ note: `dp[${i}][${j}]:s3 的第 ${i + j} 個字是 "${c}"。${fromUp ? `從上面來(s1 的 "${S1[i - 1]}")✓` : fromLeft ? `從左邊來(s2 的 "${S2[j - 1]}")✓` : '上面或左邊都接不上 ·'}`, views: [table(dp, [[i, j]], [...(i > 0 ? [[i - 1, j] as Cell] : []), ...(j > 0 ? [[i, j - 1] as Cell] : [])])] })
    }
  out.push({ note: `dp[${m}][${n}] = ${dp[m][n]}`, views: [table(dp, [[m, n]])] })
  return out
}

export const q0097: Solution = {
  id: 97,
  plain: '把兩個字串像洗牌一樣「交錯」混在一起(各自的字母順序不能變),能不能剛好得到第三個字串?例如 "aab" 和 "dbc" 可以交錯成 "adabcb"。',
  statement: '給 `s1`、`s2`、`s3`,判斷 s3 能不能由 s1 和 s2 **交錯**組成:把 s1、s2 各自切成若干段,再輪流接起來;兩邊字元的相對順序都不能變。',
  examples: [
    { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: 'true' },
    { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"', output: 'false' },
    { input: 's1 = "", s2 = "", s3 = ""', output: 'true' },
  ],
  constraints: ['s1、s2 長度 ≤ 100,s3 ≤ 200', '長度不符(`len(s1) + len(s2) != len(s3)`)直接 false'],
  insight: [
    '貪心(能用 s1 就用 s1)不對:兩邊下一個字一樣時,選錯邊會走不下去',
    '狀態:用了 s1 的前 i 個、s2 的前 j 個,剛好拼出 s3 的前 i + j 個 → `dp[i][j]`',
    's3 的第 i+j 個字(`s3[i+j−1]`)只可能來自 s1 的第 i 個(從 `dp[i−1][j]` 來)或 s2 的第 j 個(從 `dp[i][j−1]` 來)',
    '和 [1143](#/q/1143)、[72](#/q/72) 一樣的二維表,只是格子裡放 true / false',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i, j)`:s1[i:] 和 s2[j:] 能不能拼出 s3[i+j:]。下一個字和 s1[i] 一樣就試 `f(i+1, j)`,和 s2[j] 一樣就試 `f(i, j+1)`。',
      steps: ['長度不符 → false', '`i == m and j == n` → true', '`s1[i] == s3[i+j]` 且 `f(i+1, j)` → true', '`s2[j] == s3[i+j]` 且 `f(i, j+1)` → true;記憶化'],
      figure: { title: `s1 = "${S1}", s2 = "${S2}", s3 = "${S3}"`, steps: dpFig().slice(0, 5) },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '狀態 (i, j) 共 (m+1)(n+1) 種。沒有記憶化會是指數級。' },
      verdict: '最自然的想法:每一步決定「下一個字從哪邊拿」。',
      code: {
        python: `from functools import lru_cache

def isInterleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False

    @lru_cache(maxsize=None)
    def f(i, j):
        if i == m and j == n:
            return True
        k = i + j
        if i < m and s1[i] == s3[k] and f(i + 1, j):
            return True                   # 下一個字從 s1 拿
        if j < n and s2[j] == s3[k] and f(i, j + 1):
            return True                   # 下一個字從 s2 拿
        return False

    return f(0, 0)`,
        c: `static signed char memo[101][101];
static char *A_, *B_, *C_;
static int M_, N_;

static bool f(int i, int j) {
    if (i == M_ && j == N_) return true;
    if (memo[i][j] >= 0) return memo[i][j];
    int k = i + j;
    bool r = (i < M_ && A_[i] == C_[k] && f(i + 1, j)) || (j < N_ && B_[j] == C_[k] && f(i, j + 1));
    memo[i][j] = r;
    return r;
}

bool isInterleave(char *s1, char *s2, char *s3) {
    A_ = s1; B_ = s2; C_ = s3; M_ = strlen(s1); N_ = strlen(s2);
    if (M_ + N_ != (int)strlen(s3)) return false;
    memset(memo, -1, sizeof(memo));
    return f(0, 0);
}`,
        cpp: `bool isInterleave(string s1, string s2, string s3) {
    int m = s1.size(), n = s2.size();
    if (m + n != (int)s3.size()) return false;
    vector<vector<int>> memo(m + 1, vector<int>(n + 1, -1));
    function<bool(int, int)> f = [&](int i, int j) -> bool {
        if (i == m && j == n) return true;
        if (memo[i][j] >= 0) return memo[i][j];
        int k = i + j;
        bool r = (i < m && s1[i] == s3[k] && f(i + 1, j)) || (j < n && s2[j] == s3[k] && f(i, j + 1));
        return memo[i][j] = r;
    };
    return f(0, 0);
}`,
        java: `private int[][] memo;
private String a, b, c;

boolean isInterleave(String s1, String s2, String s3) {
    a = s1; b = s2; c = s3;
    if (a.length() + b.length() != c.length()) return false;
    memo = new int[a.length() + 1][b.length() + 1];
    for (int[] row : memo) Arrays.fill(row, -1);
    return f(0, 0);
}

private boolean f(int i, int j) {
    if (i == a.length() && j == b.length()) return true;
    if (memo[i][j] >= 0) return memo[i][j] == 1;
    int k = i + j;
    boolean r = (i < a.length() && a.charAt(i) == c.charAt(k) && f(i + 1, j))
             || (j < b.length() && b.charAt(j) == c.charAt(k) && f(i, j + 1));
    memo[i][j] = r ? 1 : 0;
    return r;
}`,
        javascript: `function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;
  const memo = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(-1));
  const f = (i, j) => {
    if (i === m && j === n) return true;
    if (memo[i][j] >= 0) return memo[i][j] === 1;
    const k = i + j;
    const r = (i < m && s1[i] === s3[k] && f(i + 1, j)) || (j < n && s2[j] === s3[k] && f(i, j + 1));
    memo[i][j] = r ? 1 : 0;
    return r;
  };
  return f(0, 0);
}`,
      },
    },
    {
      name: '二維 DP 表',
      idea: '`dp[i][j] = (dp[i−1][j] and s1[i−1] == s3[i+j−1]) or (dp[i][j−1] and s2[j−1] == s3[i+j−1])`,`dp[0][0] = True`。',
      steps: ['長度不符 → false', '`dp[0][0] = True`', '`for i in 0..m`、`for j in 0..n`:照公式從上、左轉移', '回傳 `dp[m][n]`'],
      figure: { title: `s1 = "${S1}", s2 = "${S2}", s3 = "${S3}"`, steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '填整張表;只依賴上和左,可以壓成一列 O(n)。' },
      verdict: '標準解,[[p:lcs]] / [[p:dp-grid]]。表格上的一條「從左上走到右下、只往右或往下」的 ✓ 路徑,就是一種交錯方式。',
      code: {
        python: `def isInterleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for i in range(m + 1):
        for j in range(n + 1):
            if i > 0 and dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]:
                dp[i][j] = True           # 最後一個字來自 s1
            if j > 0 and dp[i][j - 1] and s2[j - 1] == s3[i + j - 1]:
                dp[i][j] = True           # 最後一個字來自 s2
    return dp[m][n]`,
        c: `bool isInterleave(char *s1, char *s2, char *s3) {
    int m = strlen(s1), n = strlen(s2);
    if (m + n != (int)strlen(s3)) return false;
    bool dp[101][101] = {{false}};
    dp[0][0] = true;
    for (int i = 0; i <= m; i++)
        for (int j = 0; j <= n; j++) {
            if (i > 0 && dp[i - 1][j] && s1[i - 1] == s3[i + j - 1]) dp[i][j] = true;
            if (j > 0 && dp[i][j - 1] && s2[j - 1] == s3[i + j - 1]) dp[i][j] = true;
        }
    return dp[m][n];
}`,
        cpp: `bool isInterleave(string s1, string s2, string s3) {
    int m = s1.size(), n = s2.size();
    if (m + n != (int)s3.size()) return false;
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;
    for (int i = 0; i <= m; i++)
        for (int j = 0; j <= n; j++) {
            if (i > 0 && dp[i - 1][j] && s1[i - 1] == s3[i + j - 1]) dp[i][j] = true;
            if (j > 0 && dp[i][j - 1] && s2[j - 1] == s3[i + j - 1]) dp[i][j] = true;
        }
    return dp[m][n];
}`,
        java: `boolean isInterleave(String s1, String s2, String s3) {
    int m = s1.length(), n = s2.length();
    if (m + n != s3.length()) return false;
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    for (int i = 0; i <= m; i++)
        for (int j = 0; j <= n; j++) {
            if (i > 0 && dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(i + j - 1)) dp[i][j] = true;
            if (j > 0 && dp[i][j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1)) dp[i][j] = true;
        }
    return dp[m][n];
}`,
        javascript: `function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let i = 0; i <= m; i++)
    for (let j = 0; j <= n; j++) {
      if (i > 0 && dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) dp[i][j] = true;
      if (j > 0 && dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]) dp[i][j] = true;
    }
  return dp[m][n];
}`,
      },
    },
  ],
  pitfalls: [
    '用雙指針貪心:s1、s2 下一個字相同時,選錯邊就會失敗,必須兩邊都試(這就是 DP 的原因)',
    '忘了先檢查長度:`s1 + s2` 比 s3 長或短時直接 false,否則 dp[m][n] 的意義不對',
    'dp[0][j] 和 dp[i][0] 也要照規則算(只能從一邊來),不是全部 true',
  ],
  followUp: [{ q: 'Follow-up:只用 O(len(s2)) 的額外空間?', a: '只依賴上和左,用一列陣列滾動:`row[j] = (row[j] and s1[i−1] == c) or (row[j−1] and s2[j−1] == c)`。' }],
  check: {
    kind: 'fn',
    fn: 'isInterleave',
    cases: [
      { args: ['aabcc', 'dbbca', 'aadbbcbcac'], out: true },
      { args: ['aabcc', 'dbbca', 'aadbbbaccc'], out: false },
      { args: ['', '', ''], out: true },
      { args: [S1, S2, S3], out: true },
      { args: ['a', '', 'ab'], out: false },
      { args: ['ab', 'ab', 'abab'], out: true },
    ],
  },
}
