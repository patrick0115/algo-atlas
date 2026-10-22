import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { count26, idx, kv } from './fig'

// 242. Valid Anagram

const S = 'anagram'
const T = 'nagaram'

function sortFig(): FigStep[] {
  const s = [...S]
  const t = [...T]
  const ss = [...s].sort()
  const ts = [...t].sort()
  const out: FigStep[] = [
    { note: '先比長度:都是 7,可能是異位詞。長度不同的話直接回傳 false', views: [arr(s, { label: 's' }), arr(t, { label: 't' })] },
    { note: '兩個字串各自排序。異位詞「用的字母一模一樣」,排序後一定長得一樣', views: [arr(ss, { label: 'sorted(s)' }), arr(ts, { label: 'sorted(t)' })] },
  ]
  for (let i = 0; i < ss.length; i += 3) {
    const seg = range(i, Math.min(i + 2, ss.length - 1))
    out.push({
      note: `逐格比對第 ${seg[0]}~${seg.at(-1)} 格:${seg.map((k) => ss[k]).join('')} = ${seg.map((k) => ts[k]).join('')}`,
      views: [arr(ss, { label: 'sorted(s)', compare: seg, done: range(0, i - 1) }), arr(ts, { label: 'sorted(t)', compare: seg, done: range(0, i - 1) })],
    })
  }
  out.push({ note: '每一格都相同 → 回傳 true', views: [arr(ss, { label: 'sorted(s)', done: range(0, 6) }), arr(ts, { label: 'sorted(t)', done: range(0, 6) })] })
  return out
}

function countFig(): FigStep[] {
  const cnt = Array(26).fill(0)
  const out: FigStep[] = [{ note: '準備 26 格的計數陣列,一格對應一個字母,全部是 0', views: [arr([...S], { label: 's' }), arr([...T], { label: 't' }), count26(cnt, 'count')] }]
  for (let i = 0; i < S.length; i++) {
    cnt[idx(S[i])]++
    cnt[idx(T[i])]--
    out.push({
      note: `第 ${i} 格:s 的 ${S[i]} 讓 count[${S[i]}] +1,t 的 ${T[i]} 讓 count[${T[i]}] −1`,
      views: [arr([...S], { label: 's', highlight: [i], dim: range(0, i - 1) }), arr([...T], { label: 't', highlight: [i], dim: range(0, i - 1) }), count26(cnt, 'count', [idx(S[i]), idx(T[i])])],
    })
  }
  out.push({ note: '走完了,26 格全部是 0:s 多出來的字母剛好被 t 抵銷 → true', views: [count26(cnt, 'count')] })
  return out
}

function mapFig(): FigStep[] {
  const m = new Map<string, number>()
  const view = (hl: string[] = []) => kv([...m].sort(), 'count(只記出現過的字元)', hl)
  const out: FigStep[] = [{ note: '準備一個空的 Hash Map:key 是字元,value 是 s 比 t 多出現幾次', views: [view()] }]
  for (let i = 0; i < S.length; i++) {
    m.set(S[i], (m.get(S[i]) ?? 0) + 1)
    out.push({ note: `走 s:${S[i]} 次數 +1`, views: [arr([...S], { label: 's', highlight: [i], dim: range(0, i - 1) }), view([S[i]])] })
  }
  for (let i = 0; i < T.length; i++) {
    m.set(T[i], (m.get(T[i]) ?? 0) - 1)
    out.push({ note: `走 t:${T[i]} 次數 −1${m.get(T[i])! < 0 ? ',變成負的 → 可以直接回傳 false' : ''}`, views: [arr([...T], { label: 't', highlight: [i], dim: range(0, i - 1) }), view([T[i]])] })
  }
  out.push({ note: '全部歸零 → true。和 26 格陣列一樣的想法,只是 key 可以是任何字元(中文、emoji 都行)', views: [view()] })
  return out
}

export const q0242: Solution = {
  id: 242,
  statement:
    '給兩個字串 `s` 和 `t`,判斷 `t` 是不是 `s` 的**字母異位詞**(anagram):把 `s` 的字母重新排列就能得到 `t`,每個字母用的次數都一樣。',
  examples: [
    { input: 's = "anagram", t = "nagaram"', output: 'true', note: '兩邊都是 3 個 a、1 個 g、1 個 m、1 個 n、1 個 r' },
    { input: 's = "rat", t = "car"', output: 'false', note: 's 有 t,t 卻有 c' },
  ],
  constraints: [
    '`1 ≤ s.length, t.length ≤ 5·10⁴` → n 到 5 萬,O(n log n) 和 O(n) 都很輕鬆,O(n²) 會到 25 億次,太慢',
    '只有**小寫英文字母** → 字元種類固定 26 種,可以用長度 26 的陣列取代 Hash Map',
  ],
  insight: [
    '「重新排列」代表**順序不重要,只有次數重要**。兩個字串是異位詞 ⇔ 每個字母出現的次數都相同',
    '要「讓順序不重要」有兩條路:**排序**(把兩邊都排成標準樣子再比),或**計數**(直接數每個字母出現幾次)',
    '長度不同一定不是,先擋掉可以省事,也讓計數法最後只要檢查「全為 0」',
  ],
  approaches: [
    {
      name: '排序後比較',
      idea: '異位詞排序後會變成**同一個字串**。把兩邊都排序,相等就是異位詞。',
      steps: ['長度不同 → `false`', '`s`、`t` 各自排序', '逐字比較(或直接比字串是否相等)'],
      figure: { title: 's = "anagram", t = "nagaram"', steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序是 O(n log n);多數語言的字串不可變,要複製成陣列才能排,所以多 O(n) 空間(C 可以原地排,但會改到輸入)。' },
      verdict: '最好寫、最不容易錯,面試時可以先講這個當 baseline。缺點是比計數法慢一個 log。',
      code: {
        python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    return sorted(s) == sorted(t)`,
        c: `int cmpChar(const void *a, const void *b) {
    return *(const char *)a - *(const char *)b;
}

bool isAnagram(char *s, char *t) {
    int n = strlen(s), m = strlen(t);
    if (n != m) return false;
    qsort(s, n, sizeof(char), cmpChar);   // 原地排序,會改到輸入
    qsort(t, m, sizeof(char), cmpChar);
    return strcmp(s, t) == 0;
}`,
        cpp: `bool isAnagram(string s, string t) {
    if (s.size() != t.size()) return false;
    sort(s.begin(), s.end());   // s、t 是傳值進來的副本,排了不影響呼叫端
    sort(t.begin(), t.end());
    return s == t;
}`,
        java: `boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    char[] a = s.toCharArray(), b = t.toCharArray();
    Arrays.sort(a);
    Arrays.sort(b);
    return Arrays.equals(a, b);
}`,
        javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const norm = (x) => [...x].sort().join('');
  return norm(s) === norm(t);
}`,
      },
    },
    {
      name: '26 格計數陣列',
      idea: '只有 26 種字母,開一個長度 26 的陣列:看到 `s` 的字母 +1、看到 `t` 的字母 −1,最後全部是 0 就是異位詞。',
      steps: ['長度不同 → `false`', '`count = [0] * 26`', '同一個迴圈走 `i`:`count[s[i]]++`、`count[t[i]]--`', '任何一格不是 0 → `false`,否則 `true`'],
      figure: { title: 's = "anagram", t = "nagaram"(灰色 = 0)', steps: countFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走一次字串 O(n),最後檢查 26 格是常數。陣列大小固定 26,和 n 無關,所以是 O(1) 空間。' },
      verdict: '這題的標準解。字母種類固定又少的題目(只有小寫、只有數字)都可以用這招換掉 Hash Map,更快也更省。',
      code: {
        python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - ord('a')] += 1
        count[ord(b) - ord('a')] -= 1
    return all(c == 0 for c in count)`,
        c: `bool isAnagram(char *s, char *t) {
    int n = strlen(s);
    if (n != (int)strlen(t)) return false;
    int count[26] = {0};
    for (int i = 0; i < n; i++) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }
    for (int c = 0; c < 26; c++)
        if (count[c] != 0) return false;
    return true;
}`,
        cpp: `bool isAnagram(string s, string t) {
    if (s.size() != t.size()) return false;
    int count[26] = {0};
    for (size_t i = 0; i < s.size(); i++) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }
    for (int c : count)
        if (c != 0) return false;
    return true;
}`,
        java: `boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }
    for (int c : count)
        if (c != 0) return false;
    return true;
}`,
        javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every((c) => c === 0);
}`,
      },
    },
    {
      name: 'Hash Map 計數(任何字元都適用)',
      idea: '和 26 格陣列同一個想法,但用 Hash Map 當計數器:key 可以是任何字元,題目換成 Unicode 也不用改。',
      steps: ['長度不同 → `false`', '走 `s`:`count[c] += 1`', '走 `t`:`count[c] -= 1`,一變成負的就代表 `t` 多了這個字元 → `false`', '走完沒出事 → `true`(長度相同,不可能有正的剩下)'],
      figure: { title: 's = "anagram", t = "nagaram"', steps: mapFig() },
      complexity: { time: 'O(n)', space: 'O(k)', why: 'k 是不同字元的種類數。只有小寫時 k ≤ 26;Unicode 時最多和 n 一樣。Hash 操作平均 O(1),但常數比陣列大。' },
      verdict: '面試官追問「如果輸入含 Unicode 怎麼辦」時的答案。只有小寫字母的話,陣列版更快。',
      code: {
        python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True
# 一行版:from collections import Counter; return Counter(s) == Counter(t)`,
        c: `// C 沒有內建 Hash Map,這裡用 uthash(LeetCode 環境內建)
typedef struct { int ch, cnt; UT_hash_handle hh; } Item;

bool isAnagram(char *s, char *t) {
    int n = strlen(s);
    if (n != (int)strlen(t)) return false;
    Item *count = NULL, *it, *tmp;
    bool ok = true;
    for (int i = 0; i < n; i++) {
        int c = (unsigned char)s[i];
        HASH_FIND_INT(count, &c, it);
        if (!it) {
            it = malloc(sizeof(Item));
            it->ch = c; it->cnt = 0;
            HASH_ADD_INT(count, ch, it);
        }
        it->cnt++;
    }
    for (int i = 0; i < n && ok; i++) {
        int c = (unsigned char)t[i];
        HASH_FIND_INT(count, &c, it);
        if (!it || --it->cnt < 0) ok = false;
    }
    HASH_ITER(hh, count, it, tmp) { HASH_DEL(count, it); free(it); }
    return ok;
}`,
        cpp: `bool isAnagram(string s, string t) {
    if (s.size() != t.size()) return false;
    unordered_map<char, int> count;
    for (char c : s) count[c]++;
    for (char c : t)
        if (--count[c] < 0) return false;
    return true;
}`,
        java: `boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    Map<Character, Integer> count = new HashMap<>();
    for (char c : s.toCharArray())
        count.merge(c, 1, Integer::sum);
    for (char c : t.toCharArray()) {
        int left = count.getOrDefault(c, 0) - 1;
        if (left < 0) return false;
        count.put(c, left);
    }
    return true;
}`,
        javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const c of s) count.set(c, (count.get(c) ?? 0) + 1);
  for (const c of t) {
    const left = (count.get(c) ?? 0) - 1;
    if (left < 0) return false;
    count.set(c, left);
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: [
    '忘了先比長度:`s = "a", t = "ab"`,只檢查「t 的字母 s 都有」會誤判成 true',
    '計數法只用一個方向(只 +1 不 −1)再拿兩個陣列比,能過但多一份空間;一加一減最後看全 0 更簡潔',
    'C 的 `qsort` 會原地改掉輸入字串;JavaScript 的 `sort()` 預設依 UTF-16 排序,對一般字母沒問題',
  ],
  followUp: [
    {
      q: '如果輸入含有 Unicode 字元(中文、emoji)?',
      a: '改用 Hash Map 計數(方法三)。JavaScript 要用 `for...of` 走字串才會以「字元」為單位,`s[i]` 會把 emoji 拆成兩半。',
    },
    { q: '這題的計數法和哪些題目同一招?', a: '[49. Group Anagrams](#/q/49) 把 26 格計數當成分組的 key;[438. Find All Anagrams](#/p/sliding-window) 把計數陣列放進滑動視窗。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isAnagram',
    cases: [
      { args: ['anagram', 'nagaram'], out: true },
      { args: ['rat', 'car'], out: false },
      { args: ['a', 'ab'], out: false },
      { args: ['ab', 'ba'], out: true },
      { args: ['aacc', 'ccac'], out: false },
    ],
  },
}
