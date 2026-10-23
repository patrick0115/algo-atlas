import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 953. Verifying an Alien Dictionary

const W = ['word', 'world', 'row']
const ORDER = 'worldabcefghijkmnpqstuvxyz'

function cmpFig(): FigStep[] {
  const rank = (c: string) => ORDER.indexOf(c)
  const out: FigStep[] = [{ note: '外星字母表的順序:先把每個字母換成它在 order 裡的名次(w = 0、o = 1、r = 2、l = 3、d = 4…)。之後比字母就是比名次', views: [arr(ORDER.slice(0, 8).split(''), { label: 'order 前 8 個(名次 0..7)' })] }]
  for (let k = 0; k + 1 < W.length; k++) {
    const a = W[k]
    const b = W[k + 1]
    let i = 0
    while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++
    if (i === Math.min(a.length, b.length)) {
      out.push({ note: `"${a}" vs "${b}":前面都一樣,${a.length <= b.length ? '短的在前 → 順序對' : '長的在前 → 順序錯'}`, views: [arr(a.split(''), { label: a, done: Array.from({ length: i }, (_, t) => t) }), arr(b.split(''), { label: b, done: Array.from({ length: i }, (_, t) => t) })] })
    } else {
      const ok = rank(a[i]) < rank(b[i])
      out.push({ note: `"${a}" vs "${b}":第 ${i} 個字第一次不同,"${a[i]}"(名次 ${rank(a[i])})vs "${b[i]}"(名次 ${rank(b[i])})→ ${ok ? '前面的比較小,順序對' : '前面的比較大,順序錯 → false'}`, views: [arr(a.split(''), { label: a, highlight: [i], done: Array.from({ length: i }, (_, t) => t) }), arr(b.split(''), { label: b, highlight: [i], done: Array.from({ length: i }, (_, t) => t) })] })
      if (!ok) return out
    }
  }
  out.push({ note: '每一對相鄰的都對 → 整個清單有序 → true', views: [arr(W, { label: 'words', done: W.map((_, i) => i) })] })
  return out
}

function transFig(): FigStep[] {
  const tr = (w: string) => w.split('').map((c) => String.fromCharCode(97 + ORDER.indexOf(c))).join('')
  return [
    { note: '另一種想法:把每個單字「翻譯」成一般字母(名次 0 → a、1 → b…)。翻譯後用一般的字典序比較就行', views: [arr(W, { label: '原本' }), arr(W.map(tr), { label: '翻譯後' })] },
    { note: `翻譯後 [${W.map(tr).join(', ')}] 已經是由小到大 → true`, views: [arr(W.map(tr), { label: '翻譯後', done: [0, 1, 2] })] },
  ]
}

export const q0953: Solution = {
  id: 953,
  plain: '外星人也用 a 到 z 這 26 個字母,但字母的排列順序不一樣(order 告訴你)。給一串外星單字,檢查它們是不是照外星字典的順序排好的。',
  statement: '給外星語的字母順序 `order`(26 個小寫字母的排列)和單字陣列 `words`,判斷 words 是否依外星字典序**非遞減**排列。',
  examples: [
    { input: 'words = ["hello","leetcode"], order = "hlabcdefgijkmnopqrstuvwxyz"', output: 'true' },
    { input: 'words = ["word","world","row"], order = "worldabcefghijkmnpqstuvxyz"', output: 'false', note: '"world" 的 l 排在 "word" 的 d 之前' },
    { input: 'words = ["apple","app"], order = "abcdefghijklmnopqrstuvwxyz"', output: 'false', note: '前綴相同時短的要在前' },
  ],
  constraints: ['最多 100 個單字,每個長度 ≤ 20'],
  insight: ['整個清單有序 ⇔ 每一對**相鄰**的都有序', '比兩個單字:找第一個不同的字母,比它們在 order 裡的名次', '都一樣的話,短的(前綴)要在前面'],
  approaches: [
    {
      name: '名次表 + 比較相鄰的單字',
      idea: '`rank[c]` = c 在 order 的位置;逐對比較,第一個不同的字母決定順序。',
      steps: ['`rank[order[i]] = i`', '每一對相鄰的 (a, b):找第一個 `a[i] != b[i]`', '找到 → `rank[a[i]] > rank[b[i]]` 就 false', '沒找到 → `len(a) > len(b)` 就 false', '都通過 → true'],
      figure: { title: `words = [${W.join(', ')}]`, steps: cmpFig() },
      complexity: { time: 'O(總字元數)', space: 'O(26)', why: '每個字元最多被比較兩次。' },
      verdict: '最推薦。「自訂順序」就用名次表把字母換成數字。',
      code: {
        python: `def isAlienSorted(words, order):
    rank = {c: i for i, c in enumerate(order)}
    for a, b in zip(words, words[1:]):        # 每一對相鄰的
        for x, y in zip(a, b):
            if x != y:
                if rank[x] > rank[y]:
                    return False
                break                         # 第一個不同的字母就決定了
        else:
            if len(a) > len(b):               # 前綴都一樣:長的不能在前
                return False
    return True`,
        c: `bool isAlienSorted(char **words, int wordsSize, char *order) {
    int rank[26];
    for (int i = 0; i < 26; i++) rank[order[i] - 'a'] = i;
    for (int k = 0; k + 1 < wordsSize; k++) {
        char *a = words[k], *b = words[k + 1];
        int i = 0;
        while (a[i] && b[i] && a[i] == b[i]) i++;
        if (a[i] && b[i]) { if (rank[a[i] - 'a'] > rank[b[i] - 'a']) return false; }
        else if (a[i]) return false;          // b 是 a 的前綴
    }
    return true;
}`,
        cpp: `bool isAlienSorted(vector<string>& words, string order) {
    int rank[26];
    for (int i = 0; i < 26; i++) rank[order[i] - 'a'] = i;
    for (size_t k = 0; k + 1 < words.size(); k++) {
        const string &a = words[k], &b = words[k + 1];
        size_t i = 0;
        while (i < a.size() && i < b.size() && a[i] == b[i]) i++;
        if (i < a.size() && i < b.size()) { if (rank[a[i] - 'a'] > rank[b[i] - 'a']) return false; }
        else if (a.size() > b.size()) return false;
    }
    return true;
}`,
        java: `boolean isAlienSorted(String[] words, String order) {
    int[] rank = new int[26];
    for (int i = 0; i < 26; i++) rank[order.charAt(i) - 'a'] = i;
    for (int k = 0; k + 1 < words.length; k++) {
        String a = words[k], b = words[k + 1];
        int i = 0;
        while (i < a.length() && i < b.length() && a.charAt(i) == b.charAt(i)) i++;
        if (i < a.length() && i < b.length()) { if (rank[a.charAt(i) - 'a'] > rank[b.charAt(i) - 'a']) return false; }
        else if (a.length() > b.length()) return false;
    }
    return true;
}`,
        javascript: `function isAlienSorted(words, order) {
  const rank = {};
  [...order].forEach((c, i) => (rank[c] = i));
  for (let k = 0; k + 1 < words.length; k++) {
    const a = words[k], b = words[k + 1];
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (i < a.length && i < b.length) {
      if (rank[a[i]] > rank[b[i]]) return false;
    } else if (a.length > b.length) return false;
  }
  return true;
}`,
      },
    },
    {
      name: '翻譯成一般字母再比較',
      idea: '把每個單字的字母換成 `chr(97 + rank[c])`,然後檢查翻譯後的清單是否依一般字典序排列。',
      steps: ['`rank` 同上', '`t = ["".join(chr(97 + rank[c]) for c in w) for w in words]`', '檢查 `t[i] <= t[i+1]` 對每個 i 都成立'],
      figure: { title: `words = [${W.join(', ')}]`, steps: transFig() },
      complexity: { time: 'O(總字元數)', space: 'O(總字元數)', why: '多存一份翻譯後的單字。' },
      verdict: '把「自訂順序」轉成「內建順序」,直接用語言的字串比較,前綴的情況也自動處理好了。',
      code: {
        python: `def isAlienSorted(words, order):
    rank = {c: i for i, c in enumerate(order)}
    t = [''.join(chr(97 + rank[c]) for c in w) for w in words]   # 翻成一般字母
    return all(t[i] <= t[i + 1] for i in range(len(t) - 1))`,
        c: `bool isAlienSorted(char **words, int wordsSize, char *order) {
    char map[26];
    for (int i = 0; i < 26; i++) map[order[i] - 'a'] = 'a' + i;
    char prev[32] = "", cur[32];
    for (int k = 0; k < wordsSize; k++) {
        int i = 0;
        for (; words[k][i]; i++) cur[i] = map[words[k][i] - 'a'];
        cur[i] = '\\0';
        if (k && strcmp(prev, cur) > 0) return false;
        strcpy(prev, cur);
    }
    return true;
}`,
        cpp: `bool isAlienSorted(vector<string>& words, string order) {
    char mp[26];
    for (int i = 0; i < 26; i++) mp[order[i] - 'a'] = 'a' + i;
    vector<string> t;
    for (auto w : words) {
        for (char &c : w) c = mp[c - 'a'];
        t.push_back(w);
    }
    return is_sorted(t.begin(), t.end());
}`,
        java: `boolean isAlienSorted(String[] words, String order) {
    char[] map = new char[26];
    for (int i = 0; i < 26; i++) map[order.charAt(i) - 'a'] = (char) ('a' + i);
    String prev = "";
    for (String w : words) {
        char[] c = w.toCharArray();
        for (int i = 0; i < c.length; i++) c[i] = map[c[i] - 'a'];
        String cur = new String(c);
        if (prev.compareTo(cur) > 0) return false;
        prev = cur;
    }
    return true;
}`,
        javascript: `function isAlienSorted(words, order) {
  const rank = {};
  [...order].forEach((c, i) => (rank[c] = i));
  const t = words.map((w) => [...w].map((c) => String.fromCharCode(97 + rank[c])).join(''));
  for (let i = 0; i + 1 < t.length; i++) if (t[i] > t[i + 1]) return false;
  return true;
}`,
      },
    },
  ],
  pitfalls: ['前綴的情況:"apple" 在 "app" 前面是錯的,只比字母會漏掉', '比完第一個不同的字母就要停,不能繼續往後比'],
  check: {
    kind: 'fn',
    fn: 'isAlienSorted',
    cases: [
      { args: [['hello', 'leetcode'], 'hlabcdefgijkmnopqrstuvwxyz'], out: true },
      { args: [W, ORDER], out: false },
      { args: [['apple', 'app'], 'abcdefghijklmnopqrstuvwxyz'], out: false },
      { args: [['app', 'apple'], 'abcdefghijklmnopqrstuvwxyz'], out: true },
      { args: [['z'], 'abcdefghijklmnopqrstuvwxyz'], out: true },
    ],
  },
}
