import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1898. Maximum Number of Removable Characters

const S = 'abcacb'
const P = 'ab'
const REM = [3, 1, 0]

function isSub(k: number): boolean {
  const gone = new Set(REM.slice(0, k))
  let j = 0
  for (let i = 0; i < S.length && j < P.length; i++) if (!gone.has(i) && S[i] === P[j]) j++
  return j === P.length
}

function bsFig(): FigStep[] {
  const out: FigStep[] = [{ note: `k 越大刪掉越多,p 越難留下來 → 「刪前 k 個後 p 還是子序列」是**單調**的:某個 k 以前都行,之後都不行。二分搜尋這個分界(k 的範圍 0..${REM.length})`, views: [arr(S.split(''), { label: 's' }), arr(REM, { label: 'removable(依序刪掉這些位置)' })] }]
  let lo = 0
  let hi = REM.length
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1
    const ok = isSub(m)
    out.push({ note: `試 k = ${m}:刪掉位置 ${REM.slice(0, m).join('、')} 後,"${P}" ${ok ? '還是' : '已經不是'}子序列 → ${ok ? `答案至少 ${m},lo = ${m}` : `答案小於 ${m},hi = ${m - 1}`}`, views: [arr(S.split(''), { label: `s(刪前 ${m} 個)`, dim: REM.slice(0, m), highlight: ok ? [] : [] })] })
    if (ok) lo = m
    else hi = m - 1
  }
  out.push({ note: `最多可以刪 ${lo} 個`, views: [arr(S.split(''), { label: `s(刪前 ${lo} 個)`, dim: REM.slice(0, lo) })] })
  return out
}

function linFig(): FigStep[] {
  return [
    { note: '直接從 k = 1 開始一個一個試:每次都重新檢查 p 是不是子序列', views: [arr(S.split(''), { label: 'k = 1', dim: [3] })] },
    { note: 'k = 2(刪位置 3、1)剩 "accb","ab" 還挑得出來;k = 3 再刪位置 0 → 剩 "ccb",沒有 a 了 → 失敗,答案 2。每次檢查 O(n),最多試 m 次 → O(m·n)', views: [arr(S.split(''), { label: 'k = 3', dim: [3, 1, 0] })] },
  ]
}

export const q1898: Solution = {
  id: 1898,
  plain: '有一段字串 s 和一段要保住的字串 p(p 是 s 挑字挑出來的)。現在要照一張清單的順序,一個一個擦掉 s 的某些位置。最多能擦幾個,p 還是挑得出來?',
  statement: '給字串 `s`、`p`(p 是 s 的子序列)和**互不相同**的索引陣列 `removable`。選一個 k,刪除 s 中 `removable[0..k−1]` 這些位置的字元後,p 仍須是 s 的子序列。回傳最大的 k。',
  examples: [
    { input: 's = "abcacb", p = "ab", removable = [3,1,0]', output: '2' },
    { input: 's = "abcbddddd", p = "abcd", removable = [3,2,1,4,5,6]', output: '1' },
    { input: 's = "abcab", p = "abc", removable = [0,1,2,3,4]', output: '0' },
  ],
  constraints: ['p 長度 ≤ s 長度 ≤ 10⁵', 'removable 長度 ≤ s 長度'],
  insight: ['「刪前 k 個後還是子序列」對 k 是單調的:k 越大越難', '所以可以**二分搜尋答案** k,每次用 [392](#/q/392) 的雙指標檢查', '檢查時不用真的刪字:記下「第幾步被刪」,比 k 小的就跳過'],
  approaches: [
    {
      name: '二分搜尋 k + 子序列檢查',
      idea: '`lo = 0`、`hi = len(removable)`;`check(mid)` 為真就 `lo = mid`,否則 `hi = mid − 1`。',
      steps: ['`when[i]` = 位置 i 在第幾步被刪(沒被刪 = ∞)', '`check(k)`:雙指標檢查 p 是不是子序列,跳過 `when[i] < k` 的位置', '二分找最大的 k 讓 `check(k)` 為真(取上中位數,避免死迴圈)'],
      figure: { title: `s = "${S}",p = "${P}",removable = [${REM}]`, steps: bsFig() },
      complexity: { time: 'O(n log m)', space: 'O(n)', why: '每次檢查 O(n),二分 log m 次(m = removable 長度)。' },
      verdict: '最推薦。[[p:binary-search-answer]]:答案有單調性時,把「找最大的 k」變成「判斷 k 行不行」。',
      code: {
        python: `def maximumRemovals(s, p, removable):
    INF = len(removable)
    when = [INF] * len(s)                     # 位置 i 在第幾步被刪
    for step, i in enumerate(removable):
        when[i] = step

    def ok(k):                                # 刪前 k 個後 p 還是子序列嗎
        j = 0
        for i, c in enumerate(s):
            if when[i] >= k and j < len(p) and c == p[j]:
                j += 1
        return j == len(p)

    lo, hi = 0, len(removable)
    while lo < hi:
        mid = (lo + hi + 1) // 2              # 上中位數:lo = mid 時才會前進
        if ok(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo`,
        c: `static int *when_;
static bool ok(char *s, char *p, int k) {
    int j = 0;
    for (int i = 0; s[i] && p[j]; i++)
        if (when_[i] >= k && s[i] == p[j]) j++;
    return p[j] == '\\0';
}

int maximumRemovals(char *s, char *p, int *removable, int removableSize) {
    int n = strlen(s);
    when_ = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) when_[i] = removableSize;
    for (int t = 0; t < removableSize; t++) when_[removable[t]] = t;
    int lo = 0, hi = removableSize;
    while (lo < hi) {
        int mid = (lo + hi + 1) / 2;
        if (ok(s, p, mid)) lo = mid; else hi = mid - 1;
    }
    free(when_);
    return lo;
}`,
        cpp: `int maximumRemovals(string s, string p, vector<int>& removable) {
    int n = s.size(), m = removable.size();
    vector<int> when(n, m);
    for (int t = 0; t < m; t++) when[removable[t]] = t;
    auto ok = [&](int k) {
        size_t j = 0;
        for (int i = 0; i < n && j < p.size(); i++)
            if (when[i] >= k && s[i] == p[j]) j++;
        return j == p.size();
    };
    int lo = 0, hi = m;
    while (lo < hi) {
        int mid = (lo + hi + 1) / 2;
        if (ok(mid)) lo = mid; else hi = mid - 1;
    }
    return lo;
}`,
        java: `int maximumRemovals(String s, String p, int[] removable) {
    int n = s.length(), m = removable.length;
    int[] when = new int[n];
    Arrays.fill(when, m);
    for (int t = 0; t < m; t++) when[removable[t]] = t;
    int lo = 0, hi = m;
    while (lo < hi) {
        int mid = (lo + hi + 1) / 2;
        int j = 0;
        for (int i = 0; i < n && j < p.length(); i++)
            if (when[i] >= mid && s.charAt(i) == p.charAt(j)) j++;
        if (j == p.length()) lo = mid; else hi = mid - 1;
    }
    return lo;
}`,
        javascript: `function maximumRemovals(s, p, removable) {
  const n = s.length, m = removable.length;
  const when = new Array(n).fill(m);
  removable.forEach((i, t) => (when[i] = t));
  const ok = (k) => {
    let j = 0;
    for (let i = 0; i < n && j < p.length; i++) if (when[i] >= k && s[i] === p[j]) j++;
    return j === p.length;
  };
  let lo = 0, hi = m;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ok(mid)) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}`,
      },
    },
    {
      name: '從小到大逐一試 k',
      idea: 'k = 1, 2, …:每次刪掉 removable[k−1] 後檢查,第一次失敗就回傳 k − 1。',
      steps: ['`gone = [False] * n`', '`for k in 1..m`:`gone[removable[k−1]] = True`', '檢查 p 是不是子序列;不是就回傳 k − 1', '全部都行 → 回傳 m'],
      figure: { title: `s = "${S}",p = "${P}",removable = [${REM}]`, steps: linFig() },
      complexity: { time: 'O(m · n)', space: 'O(n)', why: '最多 m 次檢查,每次 O(n);n = m = 10⁵ 時 10¹⁰,太慢。' },
      verdict: '正確但太慢。和二分版對照,就能看出單調性省下了多少檢查。',
      code: {
        python: `def maximumRemovals(s, p, removable):
    gone = [False] * len(s)
    for k, idx in enumerate(removable, 1):
        gone[idx] = True
        j = 0
        for i, c in enumerate(s):
            if not gone[i] and j < len(p) and c == p[j]:
                j += 1
        if j < len(p):
            return k - 1                      # 刪第 k 個就失敗了
    return len(removable)`,
        c: `int maximumRemovals(char *s, char *p, int *removable, int removableSize) {
    int n = strlen(s);
    char *gone = calloc(n, 1);
    for (int k = 1; k <= removableSize; k++) {
        gone[removable[k - 1]] = 1;
        int j = 0;
        for (int i = 0; i < n && p[j]; i++)
            if (!gone[i] && s[i] == p[j]) j++;
        if (p[j]) { free(gone); return k - 1; }
    }
    free(gone);
    return removableSize;
}`,
        cpp: `int maximumRemovals(string s, string p, vector<int>& removable) {
    vector<bool> gone(s.size());
    for (size_t k = 1; k <= removable.size(); k++) {
        gone[removable[k - 1]] = true;
        size_t j = 0;
        for (size_t i = 0; i < s.size() && j < p.size(); i++)
            if (!gone[i] && s[i] == p[j]) j++;
        if (j < p.size()) return k - 1;
    }
    return removable.size();
}`,
        java: `int maximumRemovals(String s, String p, int[] removable) {
    boolean[] gone = new boolean[s.length()];
    for (int k = 1; k <= removable.length; k++) {
        gone[removable[k - 1]] = true;
        int j = 0;
        for (int i = 0; i < s.length() && j < p.length(); i++)
            if (!gone[i] && s.charAt(i) == p.charAt(j)) j++;
        if (j < p.length()) return k - 1;
    }
    return removable.length;
}`,
        javascript: `function maximumRemovals(s, p, removable) {
  const gone = new Array(s.length).fill(false);
  for (let k = 1; k <= removable.length; k++) {
    gone[removable[k - 1]] = true;
    let j = 0;
    for (let i = 0; i < s.length && j < p.length; i++) if (!gone[i] && s[i] === p[j]) j++;
    if (j < p.length) return k - 1;
  }
  return removable.length;
}`,
      },
    },
  ],
  pitfalls: ['二分取下中位數 `(lo + hi) // 2` 配上 `lo = mid`:lo、hi 差 1 時會無限迴圈', '每次檢查都複製一份刪過的字串:多花 O(n) 記憶體與時間,用「第幾步被刪」的表就好'],
  check: {
    kind: 'fn',
    fn: 'maximumRemovals',
    cases: [
      { args: [S, P, REM], out: 2 },
      { args: ['abcbddddd', 'abcd', [3, 2, 1, 4, 5, 6]], out: 1 },
      { args: ['abcab', 'abc', [0, 1, 2, 3, 4]], out: 0 },
      { args: ['aaaa', 'a', [0, 1, 2]], out: 3 },
    ],
  },
}
