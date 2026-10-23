import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 290. Word Pattern

const P = 'abba'
const W = 'dog cat cat dog'
const BAD = 'dog dog dog dog'

function mapFig(): FigStep[] {
  const words = W.split(' ')
  const pw = new Map<string, string>()
  const wp = new Map<string, string>()
  const out: FigStep[] = [{ note: '先把 s 用空白切成單字。單字數和 pattern 長度不同 → 直接 false', views: [arr(P.split(''), { label: 'pattern' }), arr(words, { label: '單字' })] }]
  words.forEach((w, i) => {
    const c = P[i]
    const isNew = !pw.has(c)
    pw.set(c, w)
    wp.set(w, c)
    out.push({ note: isNew ? `${c} 第一次出現 → 記 ${c}→${w}、${w}→${c}` : `${c} 之前對應 ${w},這次也是 ✓`, views: [arr(P.split(''), { label: 'pattern', highlight: [i] }), arr(words, { label: '單字', highlight: [i] }), kv([...pw.entries()], '字母 → 單字', [c]), kv([...wp.entries()], '單字 → 字母', [w])] })
  })
  out.push({ note: `反例 pattern = "${P}"、s = "${BAD}":a→dog 後,b 想對應 dog,但 dog 已經是 a 的了 → false`, views: [arr(P.split(''), { label: 'pattern', highlight: [1] }), arr(BAD.split(' '), { label: '單字', highlight: [1] }), kv([['dog', 'a']], '單字 → 字母', ['dog'])] })
  return out
}

function idxFig(): FigStep[] {
  const words = W.split(' ')
  const enc = <T,>(xs: T[]) => xs.map((x) => xs.indexOf(x))
  return [
    { note: '和 [205](#/q/205) 一樣的另一招:把每個元素換成「它第一次出現的位置」', views: [arr(P.split(''), { label: 'pattern' }), arr(enc(P.split('')), { label: '第一次出現的位置' })] },
    { note: `單字也這樣換:[${enc(words)}],和 pattern 的 [${enc(P.split(''))}] 相同 → true`, views: [arr(words, { label: '單字' }), arr(enc(words), { label: '第一次出現的位置', done: [0, 1, 2, 3] })] },
  ]
}

export const q0290: Solution = {
  id: 290,
  plain: '一句話要符合一個「節奏」:pattern = "abba" 代表「第 1、4 個字一樣,第 2、3 個字一樣,而且這兩組不同」。"dog cat cat dog" 符合,"dog dog dog dog" 不符合(a 和 b 不能是同一個字)。',
  statement: '給 `pattern`(小寫字母)和以空白分隔的字串 `s`,判斷 s 是否**遵循** pattern:pattern 的每個字母與 s 的每個單字之間存在**一對一**對應。',
  examples: [
    { input: 'pattern = "abba", s = "dog cat cat dog"', output: 'true' },
    { input: 'pattern = "abba", s = "dog cat cat fish"', output: 'false' },
    { input: 'pattern = "aaaa", s = "dog cat cat dog"', output: 'false' },
  ],
  constraints: ['pattern 長度 ≤ 300', 's 長度 ≤ 3000,單字之間恰好一個空白'],
  insight: ['就是 [205. Isomorphic Strings](#/q/205),只是右邊的「字」變成「單字」', '先比數量:單字數 ≠ pattern 長度一定不行', '一對一 → 兩張表,兩個方向都要檢查'],
  approaches: [
    {
      name: '兩張對照表',
      idea: '`pw[字母] = 單字`、`wp[單字] = 字母`;任何一邊衝突就 false。',
      steps: ['`words = s.split()`;長度不同 → false', '對每個 i:`c = pattern[i]`、`w = words[i]`', '`pw` 裡 c 對應別的單字,或 `wp` 裡 w 對應別的字母 → false', '記下兩邊的對應'],
      figure: { title: `pattern = "${P}",s = "${W}"`, steps: mapFig() },
      complexity: { time: 'O(n + m)', space: 'O(m)', why: 'n = pattern 長度,m = s 長度;切字與查表都是線性。' },
      verdict: '最推薦。和 205 寫法完全一樣,只多了「切單字」這一步。',
      code: {
        python: `def wordPattern(pattern, s):
    words = s.split()
    if len(words) != len(pattern):
        return False
    pw, wp = {}, {}
    for c, w in zip(pattern, words):
        if pw.get(c, w) != w or wp.get(w, c) != c:
            return False
        pw[c], wp[w] = w, c
    return True`,
        c: `bool wordPattern(char *pattern, char *s) {
    char *pw[26] = {0};                     // 字母 → 單字(指向 s 裡的位置)
    int n = strlen(pattern), len[26] = {0};
    char *p = s;
    for (int i = 0; i < n; i++) {
        if (!*p) return false;              // 單字不夠
        char *w = p;
        while (*p && *p != ' ') p++;
        int L = p - w;
        if (*p) p++;
        int c = pattern[i] - 'a';
        if (pw[c]) {
            if (len[c] != L || strncmp(pw[c], w, L)) return false;
        } else {
            for (int k = 0; k < 26; k++)    // 單字 → 字母:這個單字不能已經屬於別的字母
                if (pw[k] && len[k] == L && !strncmp(pw[k], w, L)) return false;
            pw[c] = w; len[c] = L;
        }
    }
    return *p == 0;                          // 單字不能有剩
}`,
        cpp: `bool wordPattern(string pattern, string s) {
    istringstream in(s);
    vector<string> words;
    for (string w; in >> w;) words.push_back(w);
    if (words.size() != pattern.size()) return false;
    unordered_map<char, string> pw;
    unordered_map<string, char> wp;
    for (size_t i = 0; i < words.size(); i++) {
        char c = pattern[i];
        const string &w = words[i];
        if ((pw.count(c) && pw[c] != w) || (wp.count(w) && wp[w] != c)) return false;
        pw[c] = w; wp[w] = c;
    }
    return true;
}`,
        java: `boolean wordPattern(String pattern, String s) {
    String[] words = s.split(" ");
    if (words.length != pattern.length()) return false;
    Map<Character, String> pw = new HashMap<>();
    Map<String, Character> wp = new HashMap<>();
    for (int i = 0; i < words.length; i++) {
        char c = pattern.charAt(i);
        String w = words[i];
        if ((pw.containsKey(c) && !pw.get(c).equals(w)) || (wp.containsKey(w) && wp.get(w) != c)) return false;
        pw.put(c, w); wp.put(w, c);
    }
    return true;
}`,
        javascript: `function wordPattern(pattern, s) {
  const words = s.split(' ');
  if (words.length !== pattern.length) return false;
  const pw = new Map(), wp = new Map();
  for (let i = 0; i < words.length; i++) {
    const c = pattern[i], w = words[i];
    if ((pw.has(c) && pw.get(c) !== w) || (wp.has(w) && wp.get(w) !== c)) return false;
    pw.set(c, w);
    wp.set(w, c);
  }
  return true;
}`,
      },
    },
    {
      name: '比較「第一次出現的位置」',
      idea: '`pattern[i]` 與 `words[i]` 上次出現的位置要一樣。',
      steps: ['長度不同 → false', '兩張表記「上次出現在哪」', '每個 i:兩邊上次出現的位置不同 → false;否則都更新成 i'],
      figure: { title: `pattern = "${P}",s = "${W}"`, steps: idxFig() },
      complexity: { time: 'O(n + m)', space: 'O(m)', why: '同上。' },
      verdict: '一條判斷就涵蓋兩個方向。',
      code: {
        python: `def wordPattern(pattern, s):
    words = s.split()
    if len(words) != len(pattern):
        return False
    lp, lw = {}, {}
    for i, (c, w) in enumerate(zip(pattern, words)):
        if lp.get(c, -1) != lw.get(w, -1):
            return False
        lp[c] = lw[w] = i
    return True`,
        c: `bool wordPattern(char *pattern, char *s) {
    int n = strlen(pattern);
    char *w[300];
    int len[300], m = 0;
    for (char *p = s; *p;) {                  // 切出每個單字的起點與長度
        if (m == n) return false;
        w[m] = p;
        while (*p && *p != ' ') p++;
        len[m] = p - w[m]; m++;
        if (*p) p++;
    }
    if (m != n) return false;
    for (int i = 0; i < n; i++) {
        int lastP = -1, lastW = -1;            // 往前找上一次出現的位置(n ≤ 300,O(n²) 夠快)
        for (int j = i - 1; j >= 0 && lastP < 0; j--) if (pattern[j] == pattern[i]) lastP = j;
        for (int j = i - 1; j >= 0 && lastW < 0; j--) if (len[j] == len[i] && !strncmp(w[j], w[i], len[i])) lastW = j;
        if (lastP != lastW) return false;
    }
    return true;
}`,
        cpp: `bool wordPattern(string pattern, string s) {
    istringstream in(s);
    vector<string> words;
    for (string w; in >> w;) words.push_back(w);
    if (words.size() != pattern.size()) return false;
    unordered_map<char, int> lp;
    unordered_map<string, int> lw;
    for (int i = 0; i < (int)words.size(); i++) {
        int a = lp.count(pattern[i]) ? lp[pattern[i]] : -1;
        int b = lw.count(words[i]) ? lw[words[i]] : -1;
        if (a != b) return false;
        lp[pattern[i]] = lw[words[i]] = i;
    }
    return true;
}`,
        java: `boolean wordPattern(String pattern, String s) {
    String[] words = s.split(" ");
    if (words.length != pattern.length()) return false;
    Map<Character, Integer> lp = new HashMap<>();
    Map<String, Integer> lw = new HashMap<>();
    for (int i = 0; i < words.length; i++) {
        if (!lp.getOrDefault(pattern.charAt(i), -1).equals(lw.getOrDefault(words[i], -1))) return false;
        lp.put(pattern.charAt(i), i);
        lw.put(words[i], i);
    }
    return true;
}`,
        javascript: `function wordPattern(pattern, s) {
  const words = s.split(' ');
  if (words.length !== pattern.length) return false;
  const lp = new Map(), lw = new Map();
  for (let i = 0; i < words.length; i++) {
    if ((lp.get(pattern[i]) ?? -1) !== (lw.get(words[i]) ?? -1)) return false;
    lp.set(pattern[i], i);
    lw.set(words[i], i);
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['忘了先比長度:"aaa" 對 "dog dog dog dog" 會誤判', 'Java 的 Integer 用 `==` 比較超過 127 會出錯,要用 equals', '只檢查字母 → 單字一個方向'],
  check: {
    kind: 'fn',
    fn: 'wordPattern',
    cases: [
      { args: [P, W], out: true },
      { args: [P, 'dog cat cat fish'], out: false },
      { args: ['aaaa', W], out: false },
      { args: [P, BAD], out: false },
      { args: ['aaa', 'dog dog dog dog'], out: false },
      { args: ['abc', 'x y z'], out: true },
    ],
  },
}
