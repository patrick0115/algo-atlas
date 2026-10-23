import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2002. Maximum Product of the Length of Two Palindromic Subsequences

const S = 'leetcodecom'

function pairFig(): FigStep[] {
  return [
    { note: `s 長度只有 ${S.length}(≤ 12)→ 子序列可以用位元遮罩表示:第 i 位是 1 代表挑了 s[i]。總共 2¹² = 4096 種,全部列出來`, views: [arr(S.split(''), { label: 's' })] },
    { note: '先把「挑出來是迴文」的遮罩和它的長度存起來。例如挑位置 2、3、7 → "ete",是迴文', views: [arr(S.split(''), { label: '"ete"', highlight: [2, 3, 7] })] },
    { note: '兩個子序列不能共用位置 → 兩個遮罩的 AND 必須是 0。在所有「不重疊」的迴文遮罩配對中取長度乘積最大', views: [arr(S.split(''), { label: '"ete" × "cdc"', highlight: [2, 3, 7], compare: [4, 6, 8] })] },
    { note: '"ete" 長 3、"cdc" 長 3 → 3 × 3 = 9', views: [arr([9], { label: '答案', done: [0] })] },
  ]
}

function lpsFig(): FigStep[] {
  return [
    { note: '優化:第一個子序列 A 用遮罩枚舉;第二個不用再枚舉,直接在「A 沒用到的字元」裡求**最長迴文子序列**([516](#/q/516) 的 DP)', views: [arr(S.split(''), { label: 'A = "ete"', dim: [2, 3, 7] })] },
    { note: '剩下 "l e c o d c o m" → 最長迴文子序列長 3(例如 "cdc"、"coc")→ 3 × 3 = 9', views: [arr(['l', 'e', 'c', 'o', 'd', 'c', 'o', 'm'], { label: '剩下的字元', highlight: [2, 4, 5] })] },
  ]
}

export const q2002: Solution = {
  id: 2002,
  plain: '從字串裡挑出兩個「迴文」子序列(可以跳著挑,但兩個不能用到同一個位置的字母)。兩個長度相乘,最大是多少?',
  statement: '給字串 `s`,找出兩個**不相交**的迴文子序列(不能挑同一個索引的字元),使兩者長度的乘積最大,回傳這個乘積。',
  examples: [
    { input: 's = "leetcodecom"', output: '9', note: '"ete" 和 "cdc"' },
    { input: 's = "bb"', output: '1' },
    { input: 's = "accbcaxxcxx"', output: '25', note: '"accca" 和 "xxcxx"' },
  ],
  constraints: ['2 ≤ s.length ≤ 12'],
  insight: ['n ≤ 12 → 可以枚舉全部 2ⁿ 個子序列', '[[p:bitmask-dp]]:用整數的位元表示挑了哪些位置', '兩個子序列不相交 ⇔ `maskA & maskB == 0`'],
  approaches: [
    {
      name: '枚舉迴文遮罩 + 兩兩配對',
      idea: '對每個 mask 檢查挑出來的字串是不是迴文,是的話記下長度;再枚舉兩個不相交的迴文遮罩取乘積最大。',
      steps: ['`for mask in 1..2ⁿ − 1`:組出子序列,是迴文就存 `pal[mask] = 長度`', '`for a in pal`、`for b in pal`:`a & b == 0` → 更新 `pal[a] * pal[b]`', '回傳最大值'],
      figure: { title: `s = "${S}"`, steps: pairFig() },
      complexity: { time: 'O(2ⁿ · n + P²)', space: 'O(2ⁿ)', why: 'P 是迴文遮罩個數,最多 2ⁿ;n = 12 時 P² ≤ 1.6·10⁷。' },
      verdict: '最推薦,n 這麼小時最直接;配對時可以只看 `b > a` 省一半。',
      code: {
        python: `def maxProduct(s):
    n = len(s)
    pal = {}                                  # 迴文遮罩 → 長度
    for mask in range(1, 1 << n):
        t = [s[i] for i in range(n) if mask >> i & 1]
        if t == t[::-1]:
            pal[mask] = len(t)
    items = list(pal.items())
    best = 0
    for i, (a, la) in enumerate(items):
        for b, lb in items[i + 1:]:
            if a & b == 0:                    # 沒有共用的位置
                best = max(best, la * lb)
    return best`,
        c: `int maxProduct(char *s) {
    int n = strlen(s), full = 1 << n, cnt = 0;
    int *masks = malloc(full * sizeof(int)), *lens = malloc(full * sizeof(int));
    char t[13];
    for (int m = 1; m < full; m++) {
        int len = 0;
        for (int i = 0; i < n; i++) if (m >> i & 1) t[len++] = s[i];
        bool ok = true;
        for (int i = 0, j = len - 1; i < j; i++, j--) if (t[i] != t[j]) { ok = false; break; }
        if (ok) { masks[cnt] = m; lens[cnt++] = len; }
    }
    int best = 0;
    for (int i = 0; i < cnt; i++)
        for (int j = i + 1; j < cnt; j++)
            if (!(masks[i] & masks[j]) && lens[i] * lens[j] > best) best = lens[i] * lens[j];
    free(masks); free(lens);
    return best;
}`,
        cpp: `int maxProduct(string s) {
    int n = s.size();
    vector<pair<int, int>> pal;
    for (int m = 1; m < (1 << n); m++) {
        string t;
        for (int i = 0; i < n; i++) if (m >> i & 1) t += s[i];
        if (equal(t.begin(), t.end(), t.rbegin())) pal.push_back({m, (int)t.size()});
    }
    int best = 0;
    for (size_t i = 0; i < pal.size(); i++)
        for (size_t j = i + 1; j < pal.size(); j++)
            if (!(pal[i].first & pal[j].first)) best = max(best, pal[i].second * pal[j].second);
    return best;
}`,
        java: `int maxProduct(String s) {
    int n = s.length();
    List<int[]> pal = new ArrayList<>();
    for (int m = 1; m < (1 << n); m++) {
        StringBuilder t = new StringBuilder();
        for (int i = 0; i < n; i++) if ((m >> i & 1) == 1) t.append(s.charAt(i));
        String a = t.toString();
        if (a.equals(t.reverse().toString())) pal.add(new int[]{m, a.length()});
    }
    int best = 0;
    for (int i = 0; i < pal.size(); i++)
        for (int j = i + 1; j < pal.size(); j++)
            if ((pal.get(i)[0] & pal.get(j)[0]) == 0) best = Math.max(best, pal.get(i)[1] * pal.get(j)[1]);
    return best;
}`,
        javascript: `function maxProduct(s) {
  const n = s.length, pal = [];
  for (let m = 1; m < 1 << n; m++) {
    let t = '';
    for (let i = 0; i < n; i++) if ((m >> i) & 1) t += s[i];
    if (t === [...t].reverse().join('')) pal.push([m, t.length]);
  }
  let best = 0;
  for (let i = 0; i < pal.length; i++)
    for (let j = i + 1; j < pal.length; j++)
      if ((pal[i][0] & pal[j][0]) === 0) best = Math.max(best, pal[i][1] * pal[j][1]);
  return best;
}`,
      },
    },
    {
      name: '枚舉一個 + 剩下的求最長迴文子序列',
      idea: '對每個迴文遮罩 A,把沒用到的字元拼成字串 r,用區間 DP 求 r 的最長迴文子序列 L;答案取 `len(A) × L` 的最大。',
      steps: ['`for mask`:挑出的子序列是迴文才繼續', '把 `mask` 沒挑的字元組成 r', '`lps(r)`:`dp[i][j] = dp[i+1][j−1] + 2`(兩端相同)或 `max(dp[i+1][j], dp[i][j−1])`', '更新 `len(A) × lps(r)`'],
      figure: { title: `s = "${S}"`, steps: lpsFig() },
      complexity: { time: 'O(2ⁿ · n²)', space: 'O(n²)', why: '每個遮罩做一次 O(n²) 的 DP。' },
      verdict: '把「第二個也要枚舉」換成 DP,n 變大一點時更穩。',
      code: {
        python: `def maxProduct(s):
    n = len(s)

    def lps(r):                               # 最長迴文子序列
        m = len(r)
        dp = [[0] * m for _ in range(m)]
        for i in range(m - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, m):
                dp[i][j] = dp[i + 1][j - 1] + 2 if r[i] == r[j] else max(dp[i + 1][j], dp[i][j - 1])
        return dp[0][m - 1] if m else 0

    best = 0
    for mask in range(1, 1 << n):
        a = [s[i] for i in range(n) if mask >> i & 1]
        if a != a[::-1]:
            continue
        rest = [s[i] for i in range(n) if not mask >> i & 1]
        best = max(best, len(a) * lps(rest))
    return best`,
        c: `static int lps(char *r, int m) {
    int dp[12][12] = {{0}};
    for (int i = m - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (int j = i + 1; j < m; j++)
            dp[i][j] = r[i] == r[j] ? (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0) + 2
                                    : (dp[i + 1][j] > dp[i][j - 1] ? dp[i + 1][j] : dp[i][j - 1]);
    }
    return m ? dp[0][m - 1] : 0;
}

int maxProduct(char *s) {
    int n = strlen(s), best = 0;
    char a[12], r[12];
    for (int m = 1; m < (1 << n); m++) {
        int la = 0, lr = 0;
        for (int i = 0; i < n; i++) { if (m >> i & 1) a[la++] = s[i]; else r[lr++] = s[i]; }
        bool ok = true;
        for (int i = 0, j = la - 1; i < j; i++, j--) if (a[i] != a[j]) { ok = false; break; }
        if (!ok) continue;
        int v = la * lps(r, lr);
        if (v > best) best = v;
    }
    return best;
}`,
        cpp: `int maxProduct(string s) {
    int n = s.size(), best = 0;
    auto lps = [](const string &r) {
        int m = r.size();
        if (!m) return 0;
        vector<vector<int>> dp(m, vector<int>(m, 0));
        for (int i = m - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < m; j++)
                dp[i][j] = r[i] == r[j] ? (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0) + 2 : max(dp[i + 1][j], dp[i][j - 1]);
        }
        return dp[0][m - 1];
    };
    for (int m = 1; m < (1 << n); m++) {
        string a, r;
        for (int i = 0; i < n; i++) (m >> i & 1 ? a : r) += s[i];
        if (!equal(a.begin(), a.end(), a.rbegin())) continue;
        best = max(best, (int)a.size() * lps(r));
    }
    return best;
}`,
        java: `int maxProduct(String s) {
    int n = s.length(), best = 0;
    for (int m = 1; m < (1 << n); m++) {
        StringBuilder a = new StringBuilder(), r = new StringBuilder();
        for (int i = 0; i < n; i++) (((m >> i) & 1) == 1 ? a : r).append(s.charAt(i));
        String x = a.toString();
        if (!x.equals(a.reverse().toString())) continue;
        best = Math.max(best, x.length() * lps(r.toString()));
    }
    return best;
}

int lps(String r) {
    int m = r.length();
    if (m == 0) return 0;
    int[][] dp = new int[m][m];
    for (int i = m - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (int j = i + 1; j < m; j++)
            dp[i][j] = r.charAt(i) == r.charAt(j) ? (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0) + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
    return dp[0][m - 1];
}`,
        javascript: `function maxProduct(s) {
  const n = s.length;
  const lps = (r) => {
    const m = r.length;
    if (!m) return 0;
    const dp = Array.from({ length: m }, () => new Array(m).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      dp[i][i] = 1;
      for (let j = i + 1; j < m; j++)
        dp[i][j] = r[i] === r[j] ? (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0) + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
    return dp[0][m - 1];
  };
  let best = 0;
  for (let m = 1; m < 1 << n; m++) {
    let a = '', r = '';
    for (let i = 0; i < n; i++) if ((m >> i) & 1) a += s[i];
    else r += s[i];
    if (a !== [...a].reverse().join('')) continue;
    best = Math.max(best, a.length * lps(r));
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['以為是子字串(要連續):題目是子序列,可以跳著挑', '兩個遮罩共用位置(`a & b != 0`)也拿來配對'],
  check: {
    kind: 'fn',
    fn: 'maxProduct',
    cases: [
      { args: [S], out: 9 },
      { args: ['bb'], out: 1 },
      { args: ['accbcaxxcxx'], out: 25 },
      { args: ['ab'], out: 1 },
    ],
  },
}
