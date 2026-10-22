import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 115. Distinct Subsequences

const S = 'babgbag'
const T = 'bag'

function table(dp: (number | string)[][], hl: Cell[] = [], cmp: Cell[] = []): GridViewData {
  return { kind: 'grid', label: 'dp[i][j] = s 前 i 個字裡,有幾種方式挑出 t 前 j 個字', cells: dp.map((r) => [...r]), rowLabels: ['""', ...S], colLabels: ['""', ...T], marks: { hl, cmp } }
}

function dpFig(): FigStep[] {
  const m = S.length
  const n = T.length
  const dp: (number | string)[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (j === 0 ? 1 : i === 0 ? 0 : '')))
  const out: FigStep[] = [{ note: '第 0 行全是 1:要湊出空字串只有一種方式(什麼都不挑)。第 0 列其他是 0:s 是空的,湊不出非空的 t', views: [table(dp)] }]
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const skip = dp[i - 1][j] as number
      if (S[i - 1] === T[j - 1]) {
        const use = dp[i - 1][j - 1] as number
        dp[i][j] = skip + use
        if (i >= 4 || i === 1) out.push({ note: `s[${i - 1}] = "${S[i - 1]}" == t[${j - 1}]:可以**不用**它(上面 ${skip} 種),也可以**用它**配 t 的第 ${j} 個字(左上 ${use} 種)→ ${dp[i][j]}`, views: [table(dp, [[i, j]], [[i - 1, j], [i - 1, j - 1]])] })
      } else dp[i][j] = skip
    }
  }
  out.push({ note: `答案 dp[${m}][${n}] = ${dp[m][n]}`, views: [table(dp, [[m, n]])] })
  return out
}

function recFig(): FigStep[] {
  return [
    { note: 'f(i, j) = s[i:] 裡有幾種方式挑出 t[j:]。每看 s 的一個字,就決定「用」或「不用」', views: [arr(S.split(''), { label: 's', highlight: [0] }), arr(T.split(''), { label: 't', highlight: [0] })] },
    { note: 's[i] == t[j]:用它 → f(i+1, j+1);不用 → f(i+1, j)。兩種加起來。不相等就只能不用', views: [arr(S.split(''), { label: 's', highlight: [0], done: [5, 6] }), arr(['f(1,1)', '+', 'f(1,0)'], { label: '分支' })] },
  ]
}

export const q0115: Solution = {
  id: 115,
  plain: '在字串 s 裡「跳著挑字」(順序不變),有幾種挑法能剛好挑出字串 t?挑的位置不同就算不同。例如在 "rabbbit" 裡挑出 "rabbit" 有 3 種(三個 b 裡選兩個)。',
  statement: '給字串 `s` 和 `t`,回傳 s 的**子序列**中等於 t 的個數(位置不同視為不同)。答案保證在 32 位元整數範圍內。',
  examples: [
    { input: 's = "rabbbit", t = "rabbit"', output: '3' },
    { input: 's = "babgbag", t = "bag"', output: '5' },
  ],
  constraints: ['長度 ≤ 1000 → O(m·n) = 100 萬'],
  insight: [
    '又是兩個字串的 DP([1143](#/q/1143)、[72](#/q/72)、[97](#/q/97) 那一家)',
    '`dp[i][j]` = s 前 i 個字裡,挑出 t 前 j 個字的方法數',
    '看 s 的第 i 個字:**不用它** → `dp[i−1][j]`;如果它等於 t 的第 j 個字,還可以**用它** → 加上 `dp[i−1][j−1]`',
    '邊界:`dp[i][0] = 1`(挑出空字串只有一種方式)',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i, j)`:`j == len(t)` → 1;`i == len(s)` → 0;`f(i+1, j)`(不用 s[i])+ 相等時 `f(i+1, j+1)`(用 s[i])。',
      steps: ['t 挑完了 → 1', 's 用完了但 t 還沒 → 0', '`res = f(i + 1, j)`;`s[i] == t[j]` → `res += f(i + 1, j + 1)`', '記憶化'],
      figure: { title: `s = "${S}",t = "${T}"`, steps: recFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '狀態 (i, j) 共 m·n 個。' },
      verdict: '最直接的想法:每個字「用 / 不用」。剩下的長度不夠時(`m − i < n − j`)可以提早回傳 0。',
      code: {
        python: `from functools import lru_cache

def numDistinct(s, t):
    m, n = len(s), len(t)

    @lru_cache(maxsize=None)
    def f(i, j):
        if j == n:
            return 1                          # t 已經挑完
        if m - i < n - j:
            return 0                          # 剩下的字不夠
        res = f(i + 1, j)                     # 不用 s[i]
        if s[i] == t[j]:
            res += f(i + 1, j + 1)            # 用 s[i] 配 t[j]
        return res

    return f(0, 0)`,
        c: `static long long memo[1001][1001];
static char *S_, *T_;
static int M_, N_;

static long long f(int i, int j) {
    if (j == N_) return 1;
    if (M_ - i < N_ - j) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    long long r = f(i + 1, j);
    if (S_[i] == T_[j]) r += f(i + 1, j + 1);
    return memo[i][j] = r;
}

int numDistinct(char *s, char *t) {
    S_ = s; T_ = t; M_ = strlen(s); N_ = strlen(t);
    for (int i = 0; i <= M_; i++) for (int j = 0; j <= N_; j++) memo[i][j] = -1;
    return (int)f(0, 0);
}`,
        cpp: `int numDistinct(string s, string t) {
    int m = s.size(), n = t.size();
    vector<vector<long long>> memo(m + 1, vector<long long>(n + 1, -1));
    function<long long(int, int)> f = [&](int i, int j) -> long long {
        if (j == n) return 1;
        if (m - i < n - j) return 0;
        if (memo[i][j] >= 0) return memo[i][j];
        long long r = f(i + 1, j);
        if (s[i] == t[j]) r += f(i + 1, j + 1);
        return memo[i][j] = r;
    };
    return (int)f(0, 0);
}`,
        java: `private long[][] memo;
private String s, t;

int numDistinct(String s, String t) {
    this.s = s; this.t = t;
    memo = new long[s.length() + 1][t.length() + 1];
    for (long[] row : memo) Arrays.fill(row, -1);
    return (int) f(0, 0);
}

private long f(int i, int j) {
    if (j == t.length()) return 1;
    if (s.length() - i < t.length() - j) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    long r = f(i + 1, j);
    if (s.charAt(i) == t.charAt(j)) r += f(i + 1, j + 1);
    return memo[i][j] = r;
}`,
        javascript: `function numDistinct(s, t) {
  const m = s.length, n = t.length;
  const memo = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(-1));
  const f = (i, j) => {
    if (j === n) return 1;
    if (m - i < n - j) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    let r = f(i + 1, j);
    if (s[i] === t[j]) r += f(i + 1, j + 1);
    return (memo[i][j] = r);
  };
  return f(0, 0);
}`,
      },
    },
    {
      name: '二維 DP 表(可壓成一維)',
      idea: '`dp[i][j] = dp[i−1][j] + (s[i−1] == t[j−1] ? dp[i−1][j−1] : 0)`,`dp[i][0] = 1`。壓成一維時 j 要**由大到小**更新(和 0/1 背包一樣)。',
      steps: ['`dp = [1] + [0] * n`(一維)', '`for c in s`:`for j in n..1`(遞減):`if c == t[j−1]: dp[j] += dp[j−1]`', '回傳 `dp[n]`'],
      figure: { title: `s = "${S}",t = "${T}"`, steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(n)', why: '一維陣列,每個 s 的字掃一次 t。' },
      verdict: '最推薦,[[p:lcs]]家族的計數版。一維寫法的方向和 [416](#/q/416) 一樣:由大到小,才不會同一個字用兩次。',
      code: {
        python: `def numDistinct(s, t):
    n = len(t)
    dp = [1] + [0] * n                        # dp[j]:目前為止挑出 t[:j] 的方法數
    for c in s:
        for j in range(n, 0, -1):             # 由大到小:dp[j-1] 還是「上一列」的值
            if c == t[j - 1]:
                dp[j] += dp[j - 1]
    return dp[n]`,
        c: `int numDistinct(char *s, char *t) {
    int n = strlen(t);
    unsigned long long *dp = calloc(n + 1, sizeof(unsigned long long));
    dp[0] = 1;
    for (char *p = s; *p; p++)
        for (int j = n; j >= 1; j--)
            if (*p == t[j - 1]) dp[j] += dp[j - 1];   // 中間值可能超過 int,用 64 位元(無號才不會有溢位的未定義行為)
    int res = (int)dp[n];
    free(dp);
    return res;
}`,
        cpp: `int numDistinct(string s, string t) {
    int n = t.size();
    vector<unsigned long long> dp(n + 1, 0);
    dp[0] = 1;
    for (char c : s)
        for (int j = n; j >= 1; j--)
            if (c == t[j - 1]) dp[j] += dp[j - 1];
    return (int)dp[n];
}`,
        java: `int numDistinct(String s, String t) {
    int n = t.length();
    long[] dp = new long[n + 1];
    dp[0] = 1;
    for (char c : s.toCharArray())
        for (int j = n; j >= 1; j--)
            if (c == t.charAt(j - 1)) dp[j] += dp[j - 1];
    return (int) dp[n];
}`,
        javascript: `function numDistinct(s, t) {
  const n = t.length, dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (const c of s)
    for (let j = n; j >= 1; j--) if (c === t[j - 1]) dp[j] += dp[j - 1];
  return dp[n];
}`,
      },
    },
  ],
  pitfalls: [
    '一維寫法 j 由小到大:同一個 s 的字會被拿來配 t 的好幾個位置',
    '`dp[0]` 設成 0:t 是空字串時應該有 1 種(這是所有計數的源頭)',
    '中間的 dp 值可能超過 int(最後答案保證在範圍內):C/C++/Java 用 64 位元',
  ],
  check: {
    kind: 'fn',
    fn: 'numDistinct',
    cases: [
      { args: ['rabbbit', 'rabbit'], out: 3 },
      { args: [S, T], out: 5 },
      { args: ['abc', ''], out: 1 },
      { args: ['', 'a'], out: 0 },
      { args: ['aaa', 'aa'], out: 3 },
      { args: ['abc', 'abcd'], out: 0 },
    ],
  },
}
