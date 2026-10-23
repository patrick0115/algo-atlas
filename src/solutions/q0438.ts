import { arr } from '../engine/helpers'
import { count26 } from './fig'
import type { FigStep, Solution } from './types'

// 438. Find All Anagrams in a String

const S = 'cbaebabacd'
const P = 'abc'

function cntOf(w: string): number[] {
  const c = Array(26).fill(0)
  for (const ch of w) c[ch.charCodeAt(0) - 97]++
  return c
}

function winFig(): FigStep[] {
  const m = P.length
  const need = cntOf(P)
  const out: FigStep[] = [{ note: `p 的字母異位詞 = 長度 ${m}、每個字母出現次數都和 p 一樣。用長度 ${m} 的視窗滑過 s,維護視窗裡 26 個字母的計數`, views: [count26(need, `p = "${P}" 的計數`)] }]
  const res: number[] = []
  for (let i = 0; i + m <= S.length; i++) {
    const w = S.slice(i, i + m)
    const ok = cntOf(w).every((v, k) => v === need[k])
    if (ok) res.push(i)
    if (i === 0 || i === 1 || i === 6) out.push({ note: `視窗 [${i}, ${i + m - 1}] = "${w}":計數${ok ? '和 p 一樣 → 記下 ' + i : '不一樣'}`, views: [arr(S.split(''), { label: 's', range: [i, i + m - 1] }), count26(cntOf(w), '視窗的計數')] })
  }
  out.push({ note: `答案 [${res}]`, views: [arr(S.split(''), { label: 's', done: res.flatMap((i) => [i, i + 1, i + 2]) })] })
  return out
}

function diffFig(): FigStep[] {
  return [
    { note: '每次都比對 26 格還是 O(26)。改成維護 diff = 「計數不同的字母有幾個」:視窗進一個、出一個,只會影響兩個字母,順便更新 diff', views: [arr(['diff = 0'], { label: '視窗 "cba"', done: [0] })] },
    { note: 'diff == 0 就是異位詞。每一步都是 O(1),總共 O(n)', views: [arr(['diff = 2'], { label: '視窗 "bae"' })] },
  ]
}

export const q0438: Solution = {
  id: 438,
  plain: '在一長串字裡,找出所有「把 p 的字母打亂重排」剛好出現的位置。例如 p = "abc",那 "cba"、"bac" 都算,回傳它們的起點。',
  statement: '給字串 `s` 和 `p`,回傳 s 中所有 p 的**字母異位詞**子字串的起始索引(順序不限)。',
  examples: [
    { input: 's = "cbaebabacd", p = "abc"', output: '[0,6]' },
    { input: 's = "abab", p = "ab"', output: '[0,1,2]' },
  ],
  constraints: ['長度 ≤ 3·10⁴,只有小寫字母'],
  insight: ['異位詞 ⇔ 長度一樣、每個字母的計數一樣', '視窗長度固定是 len(p) → [[p:sliding-window]]', '和 [567. Permutation in String](#/q/567) 幾乎一樣,只是要找出**所有**位置'],
  approaches: [
    {
      name: '固定長度視窗 + 26 格計數',
      idea: '`need` = p 的計數,`win` = 視窗計數;每滑一格更新兩格,`win == need` 就記下起點。',
      steps: ['`need`、`win` 各 26 格', '`for i in range(len(s))`:`win[s[i]] += 1`;`i >= m` → `win[s[i − m]] -= 1`', '`win == need` → 記下 `i − m + 1`'],
      figure: { title: `s = "${S}",p = "${P}"`, steps: winFig() },
      complexity: { time: 'O(26 · n)', space: 'O(26)', why: '每一步比較 26 格。' },
      verdict: '最好寫,26 是常數,實際上很快。',
      code: {
        python: `def findAnagrams(s, p):
    m = len(p)
    need, win = [0] * 26, [0] * 26
    for c in p:
        need[ord(c) - 97] += 1
    res = []
    for i, c in enumerate(s):
        win[ord(c) - 97] += 1                 # 右邊進一個
        if i >= m:
            win[ord(s[i - m]) - 97] -= 1      # 左邊出一個
        if win == need:
            res.append(i - m + 1)
    return res`,
        c: `int *findAnagrams(char *s, char *p, int *returnSize) {
    int n = strlen(s), m = strlen(p), need[26] = {0}, win[26] = {0};
    for (int i = 0; i < m; i++) need[p[i] - 'a']++;
    int *res = malloc((n + 1) * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < n; i++) {
        win[s[i] - 'a']++;
        if (i >= m) win[s[i - m] - 'a']--;
        if (i >= m - 1 && !memcmp(win, need, sizeof win)) res[(*returnSize)++] = i - m + 1;
    }
    return res;
}`,
        cpp: `vector<int> findAnagrams(string s, string p) {
    int n = s.size(), m = p.size();
    array<int, 26> need{}, win{};
    for (char c : p) need[c - 'a']++;
    vector<int> res;
    for (int i = 0; i < n; i++) {
        win[s[i] - 'a']++;
        if (i >= m) win[s[i - m] - 'a']--;
        if (i >= m - 1 && win == need) res.push_back(i - m + 1);
    }
    return res;
}`,
        java: `List<Integer> findAnagrams(String s, String p) {
    int n = s.length(), m = p.length();
    int[] need = new int[26], win = new int[26];
    for (char c : p.toCharArray()) need[c - 'a']++;
    List<Integer> res = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        win[s.charAt(i) - 'a']++;
        if (i >= m) win[s.charAt(i - m) - 'a']--;
        if (i >= m - 1 && Arrays.equals(win, need)) res.add(i - m + 1);
    }
    return res;
}`,
        javascript: `function findAnagrams(s, p) {
  const m = p.length, need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const c of p) need[c.charCodeAt(0) - 97]++;
  const res = [];
  for (let i = 0; i < s.length; i++) {
    win[s.charCodeAt(i) - 97]++;
    if (i >= m) win[s.charCodeAt(i - m) - 97]--;
    if (i >= m - 1 && win.every((v, k) => v === need[k])) res.push(i - m + 1);
  }
  return res;
}`,
      },
    },
    {
      name: '視窗 + 「不同的字母數」',
      idea: '`diff` = win 和 need 不同的字母個數;進出各更新一個字母,順便調整 diff。`diff == 0` 就記下。',
      steps: ['`cnt[c]` = need − win(一開始 = need),`diff` = cnt 非 0 的字母數', '進來 c:`cnt[c]` 從 0 變非 0 → diff + 1;從非 0 變 0 → diff − 1', '出去的字母同理(方向相反)', '`diff == 0` → 記下起點'],
      figure: { title: `s = "${S}",p = "${P}"`, steps: diffFig() },
      complexity: { time: 'O(n)', space: 'O(26)', why: '每一步 O(1)。' },
      verdict: '把 O(26) 的比較變成 O(1);字母表很大(例如 Unicode)時很重要。',
      code: {
        python: `def findAnagrams(s, p):
    m = len(p)
    cnt = [0] * 26                            # need − win
    for c in p:
        cnt[ord(c) - 97] += 1
    diff = sum(1 for v in cnt if v)
    res = []

    def bump(ch, d):                          # cnt[ch] += d,並維護 diff
        nonlocal diff
        k = ord(ch) - 97
        if cnt[k] == 0:
            diff += 1
        cnt[k] += d
        if cnt[k] == 0:
            diff -= 1

    for i, c in enumerate(s):
        bump(c, -1)                           # 進視窗:need − win 減 1
        if i >= m:
            bump(s[i - m], 1)                 # 出視窗
        if i >= m - 1 and diff == 0:
            res.append(i - m + 1)
    return res`,
        c: `int *findAnagrams(char *s, char *p, int *returnSize) {
    int n = strlen(s), m = strlen(p), cnt[26] = {0}, diff = 0;
    for (int i = 0; i < m; i++) cnt[p[i] - 'a']++;
    for (int k = 0; k < 26; k++) if (cnt[k]) diff++;
    int *res = malloc((n + 1) * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < n; i++) {
        int k = s[i] - 'a';
        if (cnt[k] == 0) diff++;
        if (--cnt[k] == 0) diff--;
        if (i >= m) {
            k = s[i - m] - 'a';
            if (cnt[k] == 0) diff++;
            if (++cnt[k] == 0) diff--;
        }
        if (i >= m - 1 && diff == 0) res[(*returnSize)++] = i - m + 1;
    }
    return res;
}`,
        cpp: `vector<int> findAnagrams(string s, string p) {
    int n = s.size(), m = p.size(), cnt[26] = {0}, diff = 0;
    for (char c : p) cnt[c - 'a']++;
    for (int v : cnt) if (v) diff++;
    auto bump = [&](char c, int d) {
        int &x = cnt[c - 'a'];
        if (x == 0) diff++;
        x += d;
        if (x == 0) diff--;
    };
    vector<int> res;
    for (int i = 0; i < n; i++) {
        bump(s[i], -1);
        if (i >= m) bump(s[i - m], 1);
        if (i >= m - 1 && diff == 0) res.push_back(i - m + 1);
    }
    return res;
}`,
        java: `List<Integer> findAnagrams(String s, String p) {
    int n = s.length(), m = p.length(), diff = 0;
    int[] cnt = new int[26];
    for (char c : p.toCharArray()) cnt[c - 'a']++;
    for (int v : cnt) if (v != 0) diff++;
    List<Integer> res = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        int k = s.charAt(i) - 'a';
        if (cnt[k] == 0) diff++;
        if (--cnt[k] == 0) diff--;
        if (i >= m) {
            k = s.charAt(i - m) - 'a';
            if (cnt[k] == 0) diff++;
            if (++cnt[k] == 0) diff--;
        }
        if (i >= m - 1 && diff == 0) res.add(i - m + 1);
    }
    return res;
}`,
        javascript: `function findAnagrams(s, p) {
  const m = p.length, cnt = new Array(26).fill(0);
  for (const c of p) cnt[c.charCodeAt(0) - 97]++;
  let diff = cnt.filter((v) => v).length;
  const bump = (c, d) => {
    const k = c.charCodeAt(0) - 97;
    if (cnt[k] === 0) diff++;
    cnt[k] += d;
    if (cnt[k] === 0) diff--;
  };
  const res = [];
  for (let i = 0; i < s.length; i++) {
    bump(s[i], -1);
    if (i >= m) bump(s[i - m], 1);
    if (i >= m - 1 && diff === 0) res.push(i - m + 1);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['每個視窗都排序再比較:O(n · m log m)', 'p 比 s 長時直接回傳空陣列(視窗根本放不下)'],
  check: {
    kind: 'fn',
    fn: 'findAnagrams',
    cases: [
      { args: [S, P], out: [0, 6] },
      { args: ['abab', 'ab'], out: [0, 1, 2] },
      { args: ['a', 'ab'], out: [] },
      { args: ['aaaa', 'aa'], out: [0, 1, 2] },
    ],
  },
}
