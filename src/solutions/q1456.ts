import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1456. Maximum Number of Vowels in a Substring of Given Length

const S = 'abciiidef'
const K = 3
const isV = (c: string) => 'aeiou'.includes(c)

function winFig(): FigStep[] {
  let cnt = [...S.slice(0, K)].filter(isV).length
  let best = cnt
  const out: FigStep[] = [{ note: `長度固定 ${K} 的視窗。先數前 ${K} 個字有幾個母音:${cnt}`, views: [arr(S.split(''), { label: 's', range: [0, K - 1], highlight: [...S.slice(0, K)].map((c, i) => (isV(c) ? i : -1)).filter((i) => i >= 0) })] }]
  for (let i = K; i < S.length; i++) {
    cnt += (isV(S[i]) ? 1 : 0) - (isV(S[i - K]) ? 1 : 0)
    best = Math.max(best, cnt)
    out.push({ note: `進來 "${S[i]}"${isV(S[i]) ? '(母音 +1)' : ''}、出去 "${S[i - K]}"${isV(S[i - K]) ? '(母音 −1)' : ''} → ${cnt} 個,最多 ${best}`, views: [arr(S.split(''), { label: 's', range: [i - K + 1, i], highlight: Array.from({ length: K }, (_, t) => i - K + 1 + t).filter((t) => isV(S[t])), dim: [i - K] })] })
  }
  return out
}

function preFig(): FigStep[] {
  const pre = [0]
  for (const c of S) pre.push(pre[pre.length - 1] + (isV(c) ? 1 : 0))
  return [
    { note: '前綴和:pre[i] = 前 i 個字裡的母音數;視窗 [i, i+k) 的母音數 = pre[i+k] − pre[i]', views: [arr(S.split(''), { label: 's' }), arr(pre, { label: 'pre' })] },
    { note: `最大是 pre[6] − pre[3] = ${pre[6]} − ${pre[3]} = ${pre[6] - pre[3]}("iii")`, views: [arr(pre, { label: 'pre', highlight: [3, 6] })] },
  ]
}

export const q1456: Solution = {
  id: 1456,
  plain: '在一串字裡,找一段長度剛好 k 的連續子字串,讓裡面的母音(a、e、i、o、u)越多越好。最多有幾個?',
  statement: '給字串 `s` 和整數 `k`,回傳 s 中所有長度為 k 的子字串裡,**母音字母**數量的最大值。',
  examples: [
    { input: 's = "abciiidef", k = 3', output: '3', note: '"iii"' },
    { input: 's = "aeiou", k = 2', output: '2' },
    { input: 's = "leetcode", k = 3', output: '2' },
  ],
  constraints: ['n ≤ 10⁵,只有小寫字母'],
  insight: ['長度固定的視窗,往右滑一格只改變兩個字:進來的和出去的', '維護「視窗裡的母音數」,O(1) 更新'],
  approaches: [
    {
      name: '固定長度滑動視窗',
      idea: '`cnt` = 視窗內母音數;每滑一格 `cnt += isV(s[i]) − isV(s[i − k])`,取最大。',
      steps: ['`cnt` = 前 k 個字的母音數,`best = cnt`', '`for i in k..n−1`:`cnt += isV(s[i]) − isV(s[i − k])`', '`best = max(best, cnt)`;`best == k` 時可以提早結束'],
      figure: { title: `s = "${S}",k = ${K}`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個字元進出視窗各一次。' },
      verdict: '最推薦,[[p:sliding-window]]固定長度版本。',
      code: {
        python: `def maxVowels(s, k):
    V = set('aeiou')
    cnt = sum(c in V for c in s[:k])
    best = cnt
    for i in range(k, len(s)):
        cnt += (s[i] in V) - (s[i - k] in V)  # 進來一個、出去一個
        best = max(best, cnt)
    return best`,
        c: `static bool isV(char c) { return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u'; }

int maxVowels(char *s, int k) {
    int cnt = 0, best = 0;
    for (int i = 0; s[i]; i++) {
        cnt += isV(s[i]);
        if (i >= k) cnt -= isV(s[i - k]);
        if (cnt > best) best = cnt;
    }
    return best;
}`,
        cpp: `int maxVowels(string s, int k) {
    auto isV = [](char c) { return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u'; };
    int cnt = 0, best = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        cnt += isV(s[i]);
        if (i >= k) cnt -= isV(s[i - k]);
        best = max(best, cnt);
    }
    return best;
}`,
        java: `int maxVowels(String s, int k) {
    int cnt = 0, best = 0;
    for (int i = 0; i < s.length(); i++) {
        if ("aeiou".indexOf(s.charAt(i)) >= 0) cnt++;
        if (i >= k && "aeiou".indexOf(s.charAt(i - k)) >= 0) cnt--;
        best = Math.max(best, cnt);
    }
    return best;
}`,
        javascript: `function maxVowels(s, k) {
  const isV = (c) => 'aeiou'.includes(c);
  let cnt = 0, best = 0;
  for (let i = 0; i < s.length; i++) {
    if (isV(s[i])) cnt++;
    if (i >= k && isV(s[i - k])) cnt--;
    best = Math.max(best, cnt);
  }
  return best;
}`,
      },
    },
    {
      name: '母音的前綴和',
      idea: '`pre[i]` = 前 i 個字的母音數;答案 = `max(pre[i + k] − pre[i])`。',
      steps: ['算 pre', '`for i in 0..n−k`:`best = max(best, pre[i + k] − pre[i])`'],
      figure: { title: `s = "${S}",k = ${K}`, steps: preFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個前綴和陣列。' },
      verdict: '和視窗等價,多花空間。查詢多種 k 時才划算。',
      code: {
        python: `def maxVowels(s, k):
    pre = [0]
    for c in s:
        pre.append(pre[-1] + (c in 'aeiou'))
    return max(pre[i + k] - pre[i] for i in range(len(s) - k + 1))`,
        c: `int maxVowels(char *s, int k) {
    int n = strlen(s), best = 0;
    int *pre = calloc(n + 1, sizeof(int));
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + (strchr("aeiou", s[i]) != NULL);
    for (int i = 0; i + k <= n; i++) if (pre[i + k] - pre[i] > best) best = pre[i + k] - pre[i];
    free(pre);
    return best;
}`,
        cpp: `int maxVowels(string s, int k) {
    int n = s.size(), best = 0;
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + (string("aeiou").find(s[i]) != string::npos);
    for (int i = 0; i + k <= n; i++) best = max(best, pre[i + k] - pre[i]);
    return best;
}`,
        java: `int maxVowels(String s, int k) {
    int n = s.length(), best = 0;
    int[] pre = new int[n + 1];
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + ("aeiou".indexOf(s.charAt(i)) >= 0 ? 1 : 0);
    for (int i = 0; i + k <= n; i++) best = Math.max(best, pre[i + k] - pre[i]);
    return best;
}`,
        javascript: `function maxVowels(s, k) {
  const pre = [0];
  for (const c of s) pre.push(pre[pre.length - 1] + ('aeiou'.includes(c) ? 1 : 0));
  let best = 0;
  for (let i = 0; i + k <= s.length; i++) best = Math.max(best, pre[i + k] - pre[i]);
  return best;
}`,
      },
    },
  ],
  pitfalls: ['C 的 `strchr("aeiou", c)` 對 `\\0` 也會回傳非 NULL(找到結尾),只用在確定是字母的地方', '每個視窗重新數 k 個字:O(n·k)'],
  check: {
    kind: 'fn',
    fn: 'maxVowels',
    cases: [
      { args: [S, K], out: 3 },
      { args: ['aeiou', 2], out: 2 },
      { args: ['leetcode', 3], out: 2 },
      { args: ['rhythms', 4], out: 0 },
      { args: ['tryhard', 4], out: 1 },
    ],
  },
}
