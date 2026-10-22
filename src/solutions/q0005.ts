import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 5. Longest Palindromic Substring

const S = 'cbabad'

function centerFig(): FigStep[] {
  const s = S.split('')
  const n = s.length
  let best = [0, 0]
  const out: FigStep[] = [{ note: '從每個中心往外擴張,看能擴多遠。中心可以是一個字(奇數長度)或兩個字中間(偶數長度)', views: [arr(s, { label: 's' })] }]
  for (let c = 0; c < 2 * n - 1; c++) {
    let l = Math.floor(c / 2)
    let r = l + (c % 2)
    while (l >= 0 && r < n && s[l] === s[r]) {
      l--
      r++
    }
    const lo = l + 1
    const hi = r - 1
    const len = hi - lo + 1
    const better = len > best[1] - best[0] + 1
    if (better) best = [lo, hi]
    if (len <= 0 && c % 2 === 1) continue
    out.push({
      note: `中心${c % 2 === 0 ? ` "${s[c / 2]}"(第 ${c / 2} 個)` : `在第 ${(c - 1) / 2}、${(c + 1) / 2} 個中間`}:擴到 "${S.slice(lo, hi + 1)}",長度 ${len}${better ? ' → 目前最長' : ''}`,
      views: [arr(s, { label: 's', highlight: range(lo, hi), done: better ? [] : range(best[0], best[1]).filter((i) => i < lo || i > hi) })],
    })
  }
  out.push({ note: `最長回文 "${S.slice(best[0], best[1] + 1)}"(這個例子 "aba" 也一樣長,回傳任一個都對)`, views: [arr(s, { label: 's', done: range(best[0], best[1]) })] })
  return out
}

function dpFig(): FigStep[] {
  return [
    { note: 'dp[i][j] = s[i..j] 是不是回文。長度 1 都是;長度 2 看兩個字是否相同', views: [arr(S.split(''), { label: 's' })] },
    { note: '更長的:s[i] == s[j] 且 dp[i+1][j−1]。例如 "bab"(1..3):兩端都是 b,中間 "a" 是回文 → ✓', views: [arr(S.split(''), { label: 's', highlight: [1, 3], compare: [2] })] },
    { note: '填表時記下最長的 ✓ → 答案。表的畫法和 [647](#/q/647) 一樣', views: [arr(S.split(''), { label: 's', done: [1, 2, 3] })] },
  ]
}

export const q0005: Solution = {
  id: 5,
  plain: '在一個字串裡,找出「最長的回文片段」(連續的,正著讀和反著讀一樣)。例如 "babad" 裡最長的是 "bab"(或 "aba")。',
  statement: '給字串 `s`,回傳其中**最長的回文子字串**。答案不唯一時回傳任一個。',
  examples: [
    { input: 's = "babad"', output: '"bab"', note: '"aba" 也對' },
    { input: 's = "cbbd"', output: '"bb"' },
  ],
  constraints: ['`n ≤ 1000` → O(n²) 可以'],
  insight: [
    '和 [647. Palindromic Substrings](#/q/647) 是同一個工具:**中心擴展**,只是從「數有幾個」變成「記最長的」',
    '每個中心往外擴到不能再擴,得到以它為中心的最長回文;所有中心取最長',
    '奇數長度和偶數長度要分開處理(中心 `(i, i)` 和 `(i, i+1)`)',
  ],
  approaches: [
    {
      name: '中心擴展',
      idea: '寫一個 `expand(l, r)`:兩邊相同就往外擴,回傳最後的範圍。對每個 i 試 `expand(i, i)` 和 `expand(i, i+1)`,留最長的。',
      steps: ['`expand(l, r)`:`while s[l] == s[r]`:`l−−, r++`;回傳 `(l+1, r−1)`', '每個 i:奇數 `expand(i, i)`、偶數 `expand(i, i+1)`', '比較長度,記住最長的起點和終點'],
      figure: { title: `s = "${S}"`, steps: centerFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '2n − 1 個中心,每個最多擴 O(n)。' },
      verdict: '最推薦:程式短、空間 O(1),實務上也很快(大部分中心很快就停)。',
      code: {
        python: `def longestPalindrome(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return l + 1, r - 1               # 最後一次成功的範圍

    lo, hi = 0, 0
    for i in range(len(s)):
        for a, b in (expand(i, i), expand(i, i + 1)):   # 奇數、偶數長度
            if b - a > hi - lo:
                lo, hi = a, b
    return s[lo:hi + 1]`,
        c: `char *longestPalindrome(char *s) {
    int n = strlen(s), lo = 0, hi = 0;
    for (int i = 0; i < n; i++)
        for (int k = 0; k < 2; k++) {
            int l = i, r = i + k;
            while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
            if (r - l - 2 > hi - lo) { lo = l + 1; hi = r - 1; }
        }
    char *res = malloc(hi - lo + 2);
    memcpy(res, s + lo, hi - lo + 1);
    res[hi - lo + 1] = '\\0';
    return res;
}`,
        cpp: `string longestPalindrome(string s) {
    int n = s.size(), lo = 0, hi = 0;
    for (int i = 0; i < n; i++)
        for (int k = 0; k < 2; k++) {
            int l = i, r = i + k;
            while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
            if (r - l - 2 > hi - lo) { lo = l + 1; hi = r - 1; }
        }
    return s.substr(lo, hi - lo + 1);
}`,
        java: `String longestPalindrome(String s) {
    int n = s.length(), lo = 0, hi = 0;
    for (int i = 0; i < n; i++)
        for (int k = 0; k < 2; k++) {
            int l = i, r = i + k;
            while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) { l--; r++; }
            if (r - l - 2 > hi - lo) { lo = l + 1; hi = r - 1; }
        }
    return s.substring(lo, hi + 1);
}`,
        javascript: `function longestPalindrome(s) {
  const n = s.length;
  let lo = 0, hi = 0;
  for (let i = 0; i < n; i++)
    for (let k = 0; k < 2; k++) {
      let l = i, r = i + k;
      while (l >= 0 && r < n && s[l] === s[r]) { l--; r++; }
      if (r - l - 2 > hi - lo) { lo = l + 1; hi = r - 1; }
    }
  return s.slice(lo, hi + 1);
}`,
      },
    },
    {
      name: '區間 DP 表',
      idea: '`dp[i][j] = s[i] == s[j] and (j − i < 2 or dp[i+1][j−1])`,填表時記下最長的 True。',
      steps: ['i 由大到小、j 由 i 到 n−1', '照公式填', '`dp[i][j]` 為真且 `j − i` 比目前最長大 → 更新答案'],
      figure: { title: `s = "${S}"`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: 'n² 格,每格 O(1)。' },
      verdict: '時間一樣但多用 O(n²) 空間,適合用來理解「區間 DP」的填表順序。',
      code: {
        python: `def longestPalindrome(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    lo, hi = 0, 0
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or dp[i + 1][j - 1]):
                dp[i][j] = True
                if j - i > hi - lo:
                    lo, hi = i, j
    return s[lo:hi + 1]`,
        c: `char *longestPalindrome(char *s) {
    int n = strlen(s), lo = 0, hi = 0;
    static bool dp[1000][1000];
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) {
            dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);
            if (dp[i][j] && j - i > hi - lo) { lo = i; hi = j; }
        }
    char *res = malloc(hi - lo + 2);
    memcpy(res, s + lo, hi - lo + 1);
    res[hi - lo + 1] = '\\0';
    return res;
}`,
        cpp: `string longestPalindrome(string s) {
    int n = s.size(), lo = 0, hi = 0;
    vector<vector<bool>> dp(n, vector<bool>(n, false));
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) {
            dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);
            if (dp[i][j] && j - i > hi - lo) { lo = i; hi = j; }
        }
    return s.substr(lo, hi - lo + 1);
}`,
        java: `String longestPalindrome(String s) {
    int n = s.length(), lo = 0, hi = 0;
    boolean[][] dp = new boolean[n][n];
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) {
            dp[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || dp[i + 1][j - 1]);
            if (dp[i][j] && j - i > hi - lo) { lo = i; hi = j; }
        }
    return s.substring(lo, hi + 1);
}`,
        javascript: `function longestPalindrome(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  let lo = 0, hi = 0;
  for (let i = n - 1; i >= 0; i--)
    for (let j = i; j < n; j++) {
      dp[i][j] = s[i] === s[j] && (j - i < 2 || dp[i + 1][j - 1]);
      if (dp[i][j] && j - i > hi - lo) { lo = i; hi = j; }
    }
  return s.slice(lo, hi + 1);
}`,
      },
    },
  ],
  pitfalls: [
    '只處理奇數長度的中心:"cbbd" 會回傳 "c" 而不是 "bb"',
    '擴張結束時 l、r 已經多走一步:真正的範圍是 `l + 1 .. r − 1`',
    '想用「s 和反轉後的 s 求最長公共子字串」:會誤判 "abacdfgdcaba" 這種不在對稱位置的情況',
  ],
  followUp: [{ q: '要最長回文**子序列**(可以跳著選)?', a: '516:區間 DP,`s[i] == s[j]` → `dp[i+1][j−1] + 2`,否則 `max(dp[i+1][j], dp[i][j−1])`。' }],
  check: {
    kind: 'fn',
    fn: 'longestPalindrome',
    cases: [
      { args: ['cbbd'], out: 'bb' },
      { args: ['a'], out: 'a' },
      { args: ['racecarx'], out: 'racecar' },
      { args: ['abacdfgdcaba'], out: 'aba' },
      { args: ['forgeeksskeegfor'], out: 'geeksskeeg' },
    ],
  },
}
