import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 767. Reorganize String

const S = 'aaabbc'

function evenFig(): FigStep[] {
  return [
    { note: '相鄰的字不能一樣。先檢查做不做得到:出現最多的字母不能超過 ⌈n/2⌉(否則一定有兩個擠在一起)。這裡 a 出現 3 次 ≤ ⌈6/2⌉ = 3 ✓', views: [arr(S.split(''), { label: 's' })] },
    { note: '把字母依出現次數由多到少排,依序填進**偶數位置** 0、2、4…,填滿後再接著填奇數位置 1、3、5…', views: [arr(['a', '', 'a', '', 'a', ''], { label: '先填 a 到偶數位置', highlight: [0, 2, 4] })] },
    { note: '接著 b、b、c 填進奇數位置 1、3、5 → "ababac"。同一種字母一定被隔開(最多的那個佔滿偶數位,其他的不會連續落在相鄰的格子)', views: [arr('ababac'.split(''), { label: '結果', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

function heapFig(): FigStep[] {
  return [
    { note: '堆積版:每次拿出剩最多的字母放上去;剛放過的那個先「暫停一輪」,下一輪再放回堆積,這樣就不會連續', views: [arr(['a:3', 'b:2', 'c:1'], { label: '最大堆積' })] },
    { note: 'a → b → a → b → a → c(每一步都避開上一個字母)。如果某一步堆積空了,但還有被暫停的字母沒放完,就是做不到', views: [arr('ababac'.split(''), { label: '結果', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

const CHECK = {
  python: `

def reorgCheck(s):                            # 測試用:合法回傳長度,回傳 "" 時回傳 0,不合法回傳 -1
    t = reorganizeString(s)
    if t == '':
        return 0
    if sorted(t) != sorted(s) or any(t[i] == t[i + 1] for i in range(len(t) - 1)):
        return -1
    return len(t)`,
  c: `

int reorgCheck(char *s) {
    char *t = reorganizeString(s);
    int n = strlen(t);
    if (n == 0) return 0;
    int c1[26] = {0}, c2[26] = {0};
    for (int i = 0; s[i]; i++) c1[s[i] - 'a']++;
    for (int i = 0; i < n; i++) { c2[t[i] - 'a']++; if (i && t[i] == t[i - 1]) return -1; }
    return memcmp(c1, c2, sizeof c1) ? -1 : n;
}`,
  cpp: `

int reorgCheck(string s) {
    string t = reorganizeString(s);
    if (t.empty()) return 0;
    string a = s, b = t;
    sort(a.begin(), a.end()); sort(b.begin(), b.end());
    if (a != b) return -1;
    for (size_t i = 1; i < t.size(); i++) if (t[i] == t[i - 1]) return -1;
    return t.size();
}`,
  java: `

int reorgCheck(String s) {
    String t = reorganizeString(s);
    if (t.isEmpty()) return 0;
    char[] a = s.toCharArray(), b = t.toCharArray();
    Arrays.sort(a); Arrays.sort(b);
    if (!Arrays.equals(a, b)) return -1;
    for (int i = 1; i < t.length(); i++) if (t.charAt(i) == t.charAt(i - 1)) return -1;
    return t.length();
}`,
  javascript: `

function reorgCheck(s) {
  const t = reorganizeString(s);
  if (t === '') return 0;
  if ([...s].sort().join('') !== [...t].sort().join('')) return -1;
  for (let i = 1; i < t.length; i++) if (t[i] === t[i - 1]) return -1;
  return t.length;
}`,
}

export const q0767: Solution = {
  id: 767,
  plain: '把一個字串的字母重新排列,讓任兩個相鄰的字母都不一樣。做得到就回傳一種排法(答案不唯一),做不到就回傳空字串。',
  statement: '給字串 `s`,重新排列其字元使任意相鄰字元不相同,回傳任一種可行結果;若不可能則回傳 `""`。(答案不唯一,這裡用 `reorgCheck(s)` 檢查:合法回傳長度,回傳 "" 時為 0。)',
  examples: [
    { input: 's = "aab"', output: '"aba"' },
    { input: 's = "aaab"', output: '""' },
  ],
  constraints: ['長度 ≤ 500,只有小寫字母'],
  insight: ['做得到 ⇔ 最多的字母出現次數 ≤ ⌈n / 2⌉', '把最多的字母先放進偶數位置,其他字母接著填,一定會被隔開', '或用堆積:每次放剩最多的,但不能和上一個相同'],
  approaches: [
    {
      name: '先填偶數位、再填奇數位',
      idea: '依次數排序字母,最多的先填 0、2、4…,滿了換 1、3、5…。',
      steps: ['數每個字母;最多的 > ⌈n/2⌉ → ""', '字母依次數由多到少排', '`i = 0`;每個字母的每一份:`res[i] = ch`、`i += 2`;`i >= n` 時 `i = 1`', '回傳 res'],
      figure: { title: `s = "${S}"`, steps: evenFig() },
      complexity: { time: 'O(n + 26 log 26)', space: 'O(n)', why: '計數 + 依序填寫。' },
      verdict: '最推薦,O(n) 而且不用堆積。關鍵是「最多的那個一定要先放」,它才能佔滿偶數位。',
      code: {
        python: `from collections import Counter

def reorganizeString(s):
    n = len(s)
    cnt = Counter(s)
    if max(cnt.values()) > (n + 1) // 2:
        return ''                             # 最多的那個一定會擠在一起
    res = [''] * n
    i = 0
    for ch, k in sorted(cnt.items(), key=lambda x: -x[1]):   # 最多的先放
        for _ in range(k):
            if i >= n:
                i = 1                         # 偶數位填滿,換奇數位
            res[i] = ch
            i += 2
    return ''.join(res)${CHECK.python}`,
        c: `char *reorganizeString(char *s) {
    int n = strlen(s), cnt[26] = {0}, order[26];
    for (int i = 0; i < n; i++) cnt[s[i] - 'a']++;
    for (int c = 0; c < 26; c++) order[c] = c;
    for (int i = 0; i < 26; i++)
        for (int j = i + 1; j < 26; j++)
            if (cnt[order[j]] > cnt[order[i]]) { int t = order[i]; order[i] = order[j]; order[j] = t; }
    char *res = calloc(n + 1, 1);
    if (cnt[order[0]] > (n + 1) / 2) return res;
    int i = 0;
    for (int k = 0; k < 26; k++)
        for (int t = 0; t < cnt[order[k]]; t++) {
            if (i >= n) i = 1;
            res[i] = 'a' + order[k];
            i += 2;
        }
    return res;
}${CHECK.c}`,
        cpp: `string reorganizeString(string s) {
    int n = s.size();
    vector<int> cnt(26, 0), order(26);
    for (char c : s) cnt[c - 'a']++;
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return cnt[a] > cnt[b]; });
    if (cnt[order[0]] > (n + 1) / 2) return "";
    string res(n, ' ');
    int i = 0;
    for (int c : order)
        for (int t = 0; t < cnt[c]; t++) {
            if (i >= n) i = 1;
            res[i] = 'a' + c;
            i += 2;
        }
    return res;
}${CHECK.cpp}`,
        java: `String reorganizeString(String s) {
    int n = s.length();
    int[] cnt = new int[26];
    for (char c : s.toCharArray()) cnt[c - 'a']++;
    Integer[] order = new Integer[26];
    for (int c = 0; c < 26; c++) order[c] = c;
    Arrays.sort(order, (a, b) -> cnt[b] - cnt[a]);
    if (cnt[order[0]] > (n + 1) / 2) return "";
    char[] res = new char[n];
    int i = 0;
    for (int c : order)
        for (int t = 0; t < cnt[c]; t++) {
            if (i >= n) i = 1;
            res[i] = (char) ('a' + c);
            i += 2;
        }
    return new String(res);
}${CHECK.java}`,
        javascript: `function reorganizeString(s) {
  const n = s.length, cnt = new Array(26).fill(0);
  for (const c of s) cnt[c.charCodeAt(0) - 97]++;
  const order = [...Array(26).keys()].sort((a, b) => cnt[b] - cnt[a]);
  if (cnt[order[0]] > (n + 1) >> 1) return '';
  const res = new Array(n);
  let i = 0;
  for (const c of order)
    for (let t = 0; t < cnt[c]; t++) {
      if (i >= n) i = 1;
      res[i] = String.fromCharCode(97 + c);
      i += 2;
    }
  return res.join('');
}${CHECK.javascript}`,
      },
    },
    {
      name: '最大堆積 + 暫停上一個字母',
      idea: '每次從堆積拿剩最多的放上去;剛放過的先保留在一旁,下一輪再推回堆積。',
      steps: ['最大堆積放 (次數, 字母)', '`prev = None`;每一輪:堆積空 → 結束', '彈出 (k, ch) 放上去;把 prev(如果還有剩)推回堆積;`prev = (k − 1, ch)`', '結果長度 < n → 回傳 ""'],
      figure: { title: `s = "${S}"`, steps: heapFig() },
      complexity: { time: 'O(n log 26)', space: 'O(26)', why: '每放一個字做一次堆積操作。' },
      verdict: '更通用:可以推廣到「相同字母至少相隔 k 個」([358](#/q/358))。',
      code: {
        python: `import heapq
from collections import Counter

def reorganizeString(s):
    h = [(-k, ch) for ch, k in Counter(s).items()]
    heapq.heapify(h)
    res, prev = [], None
    while h:
        k, ch = heapq.heappop(h)              # 剩最多、而且不是上一個的
        res.append(ch)
        if prev and prev[0] < 0:
            heapq.heappush(h, prev)           # 上一個字母暫停一輪後放回來
        prev = (k + 1, ch)                    # k 是負數,+1 表示用掉一個
    return ''.join(res) if len(res) == len(s) else ''${CHECK.python}`,
        c: `char *reorganizeString(char *s) {
    int n = strlen(s), cnt[26] = {0}, prev = -1, len = 0;
    for (int i = 0; i < n; i++) cnt[s[i] - 'a']++;
    char *res = calloc(n + 1, 1);
    for (;;) {
        int best = -1;                         // 26 種字母,直接掃一遍代替堆積
        for (int c = 0; c < 26; c++)
            if (c != prev && cnt[c] > 0 && (best < 0 || cnt[c] > cnt[best])) best = c;
        if (best < 0) break;
        res[len++] = 'a' + best;
        cnt[best]--;
        prev = best;
    }
    if (len < n) res[0] = '\\0';
    return res;
}${CHECK.c}`,
        cpp: `string reorganizeString(string s) {
    unordered_map<char, int> cnt;
    for (char c : s) cnt[c]++;
    priority_queue<pair<int, char>> pq;
    for (auto &[c, k] : cnt) pq.push({k, c});
    string res;
    pair<int, char> prev{0, 0};
    while (!pq.empty()) {
        auto [k, c] = pq.top(); pq.pop();
        res += c;
        if (prev.first > 0) pq.push(prev);
        prev = {k - 1, c};
    }
    return res.size() == s.size() ? res : "";
}${CHECK.cpp}`,
        java: `String reorganizeString(String s) {
    int[] cnt = new int[26];
    for (char c : s.toCharArray()) cnt[c - 'a']++;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] != a[0] ? b[0] - a[0] : a[1] - b[1]);
    for (int c = 0; c < 26; c++) if (cnt[c] > 0) pq.offer(new int[]{cnt[c], c});
    StringBuilder res = new StringBuilder();
    int[] prev = null;
    while (!pq.isEmpty()) {
        int[] e = pq.poll();
        res.append((char) ('a' + e[1]));
        if (prev != null && prev[0] > 0) pq.offer(prev);
        prev = new int[]{e[0] - 1, e[1]};
    }
    return res.length() == s.length() ? res.toString() : "";
}${CHECK.java}`,
        javascript: `function reorganizeString(s) {
  const cnt = new Array(26).fill(0);
  for (const c of s) cnt[c.charCodeAt(0) - 97]++;
  let res = '', prev = -1;
  for (;;) {
    let best = -1;
    for (let c = 0; c < 26; c++) if (c !== prev && cnt[c] > 0 && (best < 0 || cnt[c] > cnt[best])) best = c;
    if (best < 0) break;
    res += String.fromCharCode(97 + best);
    cnt[best]--;
    prev = best;
  }
  return res.length === s.length ? res : '';
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['填偶數位時沒有先放最多的字母:"aabbb" 先放 a 的話,b 會在奇數位和偶數位交界處撞在一起', '判斷條件寫成 > n/2(下取整):n 是奇數時 ⌈n/2⌉ 個是可以的(例如 "aba")'],
  check: {
    kind: 'fn',
    fn: 'reorgCheck',
    cases: [
      { args: ['aab'], out: 3 },
      { args: ['aaab'], out: 0 },
      { args: [S], out: 6 },
      { args: ['a'], out: 1 },
      { args: ['aabbb'], out: 5 },
      { args: ['vvvlo'], out: 5 },
    ],
  },
}
