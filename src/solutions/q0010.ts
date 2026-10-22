import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 10. Regular Expression Matching

const S = 'aab'
const P = 'c*a*b'

function table(dp: string[][], hl: Cell[] = [], cmp: Cell[] = []): GridViewData {
  return { kind: 'grid', label: 'dp[i][j]:s 前 i 個字能不能被 p 前 j 個字配對(✓ / ·)', cells: dp.map((r) => [...r]), rowLabels: ['""', ...S], colLabels: ['""', ...P], marks: { hl, cmp, done: dp.flatMap((r, i) => r.flatMap((v, j) => (v === '✓' ? [[i, j] as Cell] : []))) } }
}

function dpFig(): FigStep[] {
  const m = S.length
  const n = P.length
  const dp: string[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''))
  const T = (i: number, j: number) => dp[i][j] === '✓'
  const match = (i: number, j: number) => P[j - 1] === '.' || P[j - 1] === S[i - 1]
  dp[0][0] = '✓'
  for (let i = 1; i <= m; i++) dp[i][0] = '·'
  const out: FigStep[] = [{ note: '`x*` 代表「x 出現 0 次或更多次」。dp[0][0] = ✓(兩個都是空的);第 0 行其他是 ·(空的樣式配不到非空字串)', views: [table(dp, [[0, 0]])] }]
  for (let i = 0; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      let ok = false
      let why = ''
      let cmp: Cell[] = []
      if (P[j - 1] === '*') {
        if (T(i, j - 2)) {
          ok = true
          why = `"${P[j - 2]}*" 用 0 次 → 看 dp[${i}][${j - 2}]`
          cmp = [[i, j - 2]]
        } else if (i > 0 && match(i, j - 1) && T(i - 1, j)) {
          ok = true
          why = `"${P[j - 2]}*" 再多吃一個 "${S[i - 1]}" → 看 dp[${i - 1}][${j}]`
          cmp = [[i - 1, j]]
        } else why = `"${P[j - 2]}*" 用 0 次或多吃一個都不行`
      } else if (i > 0 && match(i, j) && T(i - 1, j - 1)) {
        ok = true
        why = `"${S[i - 1]}" 和 "${P[j - 1]}" 配對 → 看左上 dp[${i - 1}][${j - 1}]`
        cmp = [[i - 1, j - 1]]
      } else why = i === 0 ? 's 是空的,一般字元配不到' : `"${S[i - 1]}" 和 "${P[j - 1]}" 配不上,或前面沒配好`
      dp[i][j] = ok ? '✓' : '·'
      if (ok || P[j - 1] === '*') out.push({ note: `dp[${i}][${j}]:${why} → ${dp[i][j]}`, views: [table(dp, [[i, j]], cmp)] })
    }
  out.push({ note: `dp[${m}][${n}] = ${dp[m][n]}:"c*" 用 0 次、"a*" 用 2 次、最後 b 配 b`, views: [table(dp, [[m, n]])] })
  return out
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴:看 p 的下一個字元後面是不是 *。不是 → 第一個字要配對,然後兩邊都往後一格', views: [arr(S.split(''), { label: 's', highlight: [0] }), arr(P.split(''), { label: 'p', highlight: [0, 1] })] },
    { note: '是 x* → 兩種選擇:跳過整個 x*(用 0 次),或第一個字配 x 之後 s 往後、p 不動(再用一次)', views: [arr(['f(i, j+2)', 'or', 'match && f(i+1, j)'], { label: 'x* 的兩個分支' })] },
  ]
}

export const q0010: Solution = {
  id: 10,
  plain: '實作簡化版的「正規表達式」比對:`.` 可以代表任何一個字,`x*` 代表「x 出現 0 次或很多次」。問整個字串 s 能不能被樣式 p **完整**配對。',
  statement: '給字串 `s` 與樣式 `p`,實作支援 `.`(配對任意單一字元)和 `*`(前一個元素出現零次或多次)的正規表達式比對。比對必須涵蓋**整個** s。',
  examples: [
    { input: 's = "aa", p = "a"', output: 'false' },
    { input: 's = "aa", p = "a*"', output: 'true' },
    { input: 's = "ab", p = ".*"', output: 'true', note: '".*" 是「任意字元任意次」' },
  ],
  constraints: ['s、p 長度 ≤ 20', '保證每個 * 前面都有一個合法的字元'],
  insight: [
    '麻煩的是 `x*`:它可以吃掉 0 個、1 個、很多個 x,要試所有可能 → 遞迴 / DP',
    '把 `x*` 當成一個整體:**用 0 次**(跳過 p 的這兩個字元),或**多吃一個**(s 前進一格,p 不動,前提是這個字配得上 x)',
    '`dp[i][j]` = s 前 i 個字能不能被 p 前 j 個字配對。和 [72](#/q/72)、[1143](#/q/1143) 一樣是兩個字串的表格',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i, j)`:s[i:] 能不能被 p[j:] 配對。`first = i < len(s) and p[j] in (s[i], ".")`。p[j+1] 是 * → `f(i, j+2) or (first and f(i+1, j))`;否則 `first and f(i+1, j+1)`。',
      steps: ['`j == len(p)` → 回傳 `i == len(s)`', '`first` = 第一個字配得上', '下一個是 * → 用 0 次 / 多吃一個', '否則 → 第一個配上且 `f(i+1, j+1)`'],
      figure: { title: `s = "${S}",p = "${P}"`, steps: recFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '狀態 (i, j) 共 (m+1)(n+1) 個,每個 O(1)。' },
      verdict: '最好理解,從「第一個字」開始想,程式短。',
      code: {
        python: `from functools import lru_cache

def isMatch(s, p):
    @lru_cache(maxsize=None)
    def f(i, j):
        if j == len(p):
            return i == len(s)
        first = i < len(s) and p[j] in (s[i], '.')
        if j + 1 < len(p) and p[j + 1] == '*':
            return f(i, j + 2) or (first and f(i + 1, j))   # x* 用 0 次,或多吃一個
        return first and f(i + 1, j + 1)

    return f(0, 0)`,
        c: `static signed char memo[21][21];
static char *S_, *P_;
static int M_, N_;

static bool f(int i, int j) {
    if (j == N_) return i == M_;
    if (memo[i][j] >= 0) return memo[i][j];
    bool first = i < M_ && (P_[j] == S_[i] || P_[j] == '.');
    bool r;
    if (j + 1 < N_ && P_[j + 1] == '*') r = f(i, j + 2) || (first && f(i + 1, j));
    else r = first && f(i + 1, j + 1);
    memo[i][j] = r;
    return r;
}

bool isMatch(char *s, char *p) {
    S_ = s; P_ = p; M_ = strlen(s); N_ = strlen(p);
    memset(memo, -1, sizeof(memo));
    return f(0, 0);
}`,
        cpp: `bool isMatch(string s, string p) {
    int m = s.size(), n = p.size();
    vector<vector<int>> memo(m + 1, vector<int>(n + 1, -1));
    function<bool(int, int)> f = [&](int i, int j) -> bool {
        if (j == n) return i == m;
        if (memo[i][j] >= 0) return memo[i][j];
        bool first = i < m && (p[j] == s[i] || p[j] == '.');
        bool r;
        if (j + 1 < n && p[j + 1] == '*') r = f(i, j + 2) || (first && f(i + 1, j));
        else r = first && f(i + 1, j + 1);
        return memo[i][j] = r;
    };
    return f(0, 0);
}`,
        java: `private int[][] memo;
private String s, p;

boolean isMatch(String s, String p) {
    this.s = s; this.p = p;
    memo = new int[s.length() + 1][p.length() + 1];
    for (int[] row : memo) Arrays.fill(row, -1);
    return f(0, 0);
}

private boolean f(int i, int j) {
    if (j == p.length()) return i == s.length();
    if (memo[i][j] >= 0) return memo[i][j] == 1;
    boolean first = i < s.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
    boolean r;
    if (j + 1 < p.length() && p.charAt(j + 1) == '*') r = f(i, j + 2) || (first && f(i + 1, j));
    else r = first && f(i + 1, j + 1);
    memo[i][j] = r ? 1 : 0;
    return r;
}`,
        javascript: `function isMatch(s, p) {
  const m = s.length, n = p.length;
  const memo = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(-1));
  const f = (i, j) => {
    if (j === n) return i === m;
    if (memo[i][j] >= 0) return memo[i][j] === 1;
    const first = i < m && (p[j] === s[i] || p[j] === '.');
    const r = j + 1 < n && p[j + 1] === '*' ? f(i, j + 2) || (first && f(i + 1, j)) : first && f(i + 1, j + 1);
    memo[i][j] = r ? 1 : 0;
    return r;
  };
  return f(0, 0);
}`,
      },
    },
    {
      name: '二維 DP 表',
      idea: '`p[j−1]` 是 *:`dp[i][j] = dp[i][j−2] or (match(i, j−1) and dp[i−1][j])`;否則 `dp[i][j] = match(i, j) and dp[i−1][j−1]`。',
      steps: ['`dp[0][0] = True`;i 從 0 開始(空的 s 也可能被 "a*b*" 配對)', '`p[j−1] == "*"`:用 0 次看 `dp[i][j−2]`;多吃一個看 `dp[i−1][j]`(要 `s[i−1]` 配得上 `p[j−2]`)', '一般字元或 `.`:看左上 `dp[i−1][j−1]`', '回傳 `dp[m][n]`'],
      figure: { title: `s = "${S}",p = "${P}"`, steps: dpFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '表格 (m+1)(n+1) 格,每格 O(1)。' },
      verdict: '標準解,[[p:lcs]]家族裡最難的一題。關鍵是把 `x*` 當作一個單位,並且 i 要從 0 開始填。',
      code: {
        python: `def isMatch(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    match = lambda i, j: i > 0 and p[j - 1] in (s[i - 1], '.')   # s 第 i 個字配不配得上 p 第 j 個字
    for i in range(m + 1):                    # i 從 0:空字串也可能被 "a*" 配對
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i][j - 2] or (match(i, j - 1) and dp[i - 1][j])
            else:
                dp[i][j] = match(i, j) and dp[i - 1][j - 1]
    return dp[m][n]`,
        c: `bool isMatch(char *s, char *p) {
    int m = strlen(s), n = strlen(p);
    bool dp[21][21] = {{false}};
    dp[0][0] = true;
    for (int i = 0; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (p[j - 1] == '*') {
                bool m1 = i > 0 && (p[j - 2] == s[i - 1] || p[j - 2] == '.');
                dp[i][j] = dp[i][j - 2] || (m1 && dp[i - 1][j]);
            } else {
                bool m1 = i > 0 && (p[j - 1] == s[i - 1] || p[j - 1] == '.');
                dp[i][j] = m1 && dp[i - 1][j - 1];
            }
        }
    return dp[m][n];
}`,
        cpp: `bool isMatch(string s, string p) {
    int m = s.size(), n = p.size();
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;
    auto match = [&](int i, int j) { return i > 0 && (p[j - 1] == s[i - 1] || p[j - 1] == '.'); };
    for (int i = 0; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = p[j - 1] == '*' ? dp[i][j - 2] || (match(i, j - 1) && dp[i - 1][j]) : match(i, j) && dp[i - 1][j - 1];
    return dp[m][n];
}`,
        java: `boolean isMatch(String s, String p) {
    int m = s.length(), n = p.length();
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    for (int i = 0; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (p.charAt(j - 1) == '*') {
                boolean m1 = i > 0 && (p.charAt(j - 2) == s.charAt(i - 1) || p.charAt(j - 2) == '.');
                dp[i][j] = dp[i][j - 2] || (m1 && dp[i - 1][j]);
            } else {
                boolean m1 = i > 0 && (p.charAt(j - 1) == s.charAt(i - 1) || p.charAt(j - 1) == '.');
                dp[i][j] = m1 && dp[i - 1][j - 1];
            }
        }
    return dp[m][n];
}`,
        javascript: `function isMatch(s, p) {
  const m = s.length, n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  const match = (i, j) => i > 0 && (p[j - 1] === s[i - 1] || p[j - 1] === '.');
  for (let i = 0; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = p[j - 1] === '*' ? dp[i][j - 2] || (match(i, j - 1) && dp[i - 1][j]) : match(i, j) && dp[i - 1][j - 1];
  return dp[m][n];
}`,
      },
    },
  ],
  pitfalls: [
    '把 `*` 當成獨立的字元處理:它一定要和前一個字元綁在一起看',
    'DP 時 i 從 1 開始:會漏掉「空字串被 `a*b*` 配對」的情況',
    '只做部分配對:題目要整個 s 都被配對(`j == len(p)` 時要求 `i == len(s)`)',
  ],
  followUp: [{ q: '萬用字元 `?` 和 `*`(任意字串)?', a: '44. Wildcard Matching:`*` 自己就能配任意長度,`dp[i][j] = dp[i][j−1] or dp[i−1][j]`。' }],
  check: {
    kind: 'fn',
    fn: 'isMatch',
    cases: [
      { args: ['aa', 'a'], out: false },
      { args: ['aa', 'a*'], out: true },
      { args: ['ab', '.*'], out: true },
      { args: [S, P], out: true },
      { args: ['mississippi', 'mis*is*p*.'], out: false },
      { args: ['', 'a*b*'], out: true },
      { args: ['ab', '.*c'], out: false },
      { args: ['aaa', 'ab*a*c*a'], out: true },
    ],
  },
}
