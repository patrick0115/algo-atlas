import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 680. Valid Palindrome II

const S = 'abdcba'

function ptrFig(): FigStep[] {
  const a = S.split('')
  const out: FigStep[] = [{ note: '回文 = 頭尾對稱。左右指標往中間比,一樣就繼續', views: [arr(a, { label: 's', pointers: [{ name: 'L', index: 0 }, { name: 'R', index: a.length - 1, color: 'b' }] })] }]
  let l = 0
  let r = a.length - 1
  while (l < r && a[l] === a[r]) {
    out.push({ note: `s[${l}] = s[${r}] = "${a[l]}",一樣 → 往內`, views: [arr(a, { label: 's', done: [l, r], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
    l++
    r--
  }
  out.push({ note: `s[${l}] = "${a[l]}" ≠ s[${r}] = "${a[r]}":第一次不同。只能刪一個字,而且一定要刪這兩個的其中一個(刪別的,這兩個還是對不上)`, views: [arr(a, { label: 's', highlight: [l, r], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
  const sub1 = S.slice(l + 1, r + 1)
  const sub2 = S.slice(l, r)
  const isPal = (x: string) => x === [...x].reverse().join('')
  out.push({ note: `試兩種:刪左邊 → 檢查 "${sub1}" 是不是回文:${isPal(sub1) ? '是' : '不是'};刪右邊 → 檢查 "${sub2}":${isPal(sub2) ? '是' : '不是'}。有一個是就 true`, views: [arr(a, { label: '刪左邊的', dim: [l], range: [l + 1, r] }), arr(a, { label: '刪右邊的', dim: [r], range: [l, r - 1] })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:先看本身是不是回文;不是的話,一個一個試著刪掉第 i 個字,再檢查剩下的', views: [arr(S.split(''), { label: '刪掉第 0 個', dim: [0] })] },
    { note: `刪掉第 3 個("c")→ "abdba" 是回文 → true。每次檢查 O(n),共 n 次 → O(n²),n = 10⁵ 會太慢`, views: [arr(S.split(''), { label: '刪掉第 3 個', dim: [3], done: [0, 1, 2, 4, 5] })] },
  ]
}

export const q0680: Solution = {
  id: 680,
  plain: '一串字最多可以擦掉一個字,擦完之後能不能變成「從前面念和從後面念都一樣」的回文?例如 "abca" 擦掉 c 變 "aba",可以。',
  statement: '給字串 `s`,判斷**最多刪除一個字元**後能否成為回文。',
  examples: [
    { input: 's = "aba"', output: 'true' },
    { input: 's = "abca"', output: 'true', note: '刪掉 c' },
    { input: 's = "abc"', output: 'false' },
  ],
  constraints: ['長度 ≤ 10⁵ → O(n²) 太慢', '只有小寫字母'],
  insight: ['左右指標往中間比,一樣就繼續', '第一次對不上時,一定要刪這兩個字的其中一個', '刪完剩下的中間那段必須**完全**是回文(不能再刪了)→ 兩種都檢查一次'],
  approaches: [
    {
      name: '雙指標 + 一次機會',
      idea: '找到第一個 `s[l] != s[r]`,回傳 `isPal(l+1, r) or isPal(l, r−1)`。',
      steps: ['`l, r = 0, n − 1`', '`while l < r`:`s[l] == s[r]` → 往內;否則回傳 `isPal(l + 1, r) or isPal(l, r − 1)`', '走完都沒有不同 → true'],
      figure: { title: `s = "${S}"`, steps: ptrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '外層走一次,不同時最多再各檢查一次剩下的區間。' },
      verdict: '最推薦。[125. Valid Palindrome](#/q/125) 的延伸:多一次「刪左或刪右」的分岔。',
      code: {
        python: `def validPalindrome(s):
    def is_pal(l, r):
        while l < r:
            if s[l] != s[r]:
                return False
            l += 1
            r -= 1
        return True

    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return is_pal(l + 1, r) or is_pal(l, r - 1)   # 刪左邊或刪右邊
        l += 1
        r -= 1
    return True`,
        c: `static bool isPal(char *s, int l, int r) {
    for (; l < r; l++, r--) if (s[l] != s[r]) return false;
    return true;
}

bool validPalindrome(char *s) {
    for (int l = 0, r = strlen(s) - 1; l < r; l++, r--)
        if (s[l] != s[r]) return isPal(s, l + 1, r) || isPal(s, l, r - 1);
    return true;
}`,
        cpp: `bool isPal(const string &s, int l, int r) {
    for (; l < r; l++, r--) if (s[l] != s[r]) return false;
    return true;
}

bool validPalindrome(string s) {
    for (int l = 0, r = (int)s.size() - 1; l < r; l++, r--)
        if (s[l] != s[r]) return isPal(s, l + 1, r) || isPal(s, l, r - 1);
    return true;
}`,
        java: `boolean validPalindrome(String s) {
    for (int l = 0, r = s.length() - 1; l < r; l++, r--)
        if (s.charAt(l) != s.charAt(r)) return isPal(s, l + 1, r) || isPal(s, l, r - 1);
    return true;
}

private boolean isPal(String s, int l, int r) {
    for (; l < r; l++, r--) if (s.charAt(l) != s.charAt(r)) return false;
    return true;
}`,
        javascript: `function validPalindrome(s) {
  const isPal = (l, r) => {
    for (; l < r; l++, r--) if (s[l] !== s[r]) return false;
    return true;
  };
  for (let l = 0, r = s.length - 1; l < r; l++, r--)
    if (s[l] !== s[r]) return isPal(l + 1, r) || isPal(l, r - 1);
  return true;
}`,
      },
    },
    {
      name: '暴力:每個位置都試刪',
      idea: '本身是回文就 true;否則對每個 i,檢查刪掉 s[i] 後是不是回文。',
      steps: ['`s` 本身是回文 → true', '`for i in 0..n−1`:`t = s[:i] + s[i+1:]`,是回文 → true', '都不是 → false'],
      figure: { title: `s = "${S}"`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'n 個刪法,每個檢查 O(n);還要建新字串。' },
      verdict: '只適合確認想法。它沒有用到「第一個對不上的位置」這個資訊,所以白試了很多不可能的刪法。',
      code: {
        python: `def validPalindrome(s):
    if s == s[::-1]:
        return True
    for i in range(len(s)):
        t = s[:i] + s[i + 1:]
        if t == t[::-1]:
            return True
    return False`,
        c: `// 刪掉第 skip 個字後是不是回文(skip = -1 表示不刪)
static bool palSkip(char *s, int n, int skip) {
    int l = 0, r = n - 1;
    while (l < r) {
        if (l == skip) { l++; continue; }
        if (r == skip) { r--; continue; }
        if (s[l++] != s[r--]) return false;
    }
    return true;
}

bool validPalindrome(char *s) {
    int n = strlen(s);
    for (int i = -1; i < n; i++)
        if (palSkip(s, n, i)) return true;
    return false;
}`,
        cpp: `bool validPalindrome(string s) {
    auto pal = [](const string &t) { return equal(t.begin(), t.begin() + t.size() / 2, t.rbegin()); };
    if (pal(s)) return true;
    for (size_t i = 0; i < s.size(); i++)
        if (pal(s.substr(0, i) + s.substr(i + 1))) return true;
    return false;
}`,
        java: `boolean validPalindrome(String s) {
    if (new StringBuilder(s).reverse().toString().equals(s)) return true;
    for (int i = 0; i < s.length(); i++) {
        String t = s.substring(0, i) + s.substring(i + 1);
        if (new StringBuilder(t).reverse().toString().equals(t)) return true;
    }
    return false;
}`,
        javascript: `function validPalindrome(s) {
  const pal = (t) => t === [...t].reverse().join('');
  if (pal(s)) return true;
  for (let i = 0; i < s.length; i++) if (pal(s.slice(0, i) + s.slice(i + 1))) return true;
  return false;
}`,
      },
    },
  ],
  pitfalls: ['只試刪左邊:"abccbxa" 要刪右邊的 x 才行;只試刪右邊:"axbccba" 要刪左邊的 x', '刪完一個後又繼續用「可以再刪」的邏輯:只有一次機會,剩下的要完全是回文'],
  check: {
    kind: 'fn',
    fn: 'validPalindrome',
    cases: [
      { args: ['aba'], out: true },
      { args: ['abca'], out: true },
      { args: ['abc'], out: false },
      { args: [S], out: true },
      { args: ['cupuufuc'], out: false },
      { args: ['ebcbbececabbacecbbcbe'], out: true },
      { args: ['abccbxa'], out: true },
      { args: ['abcdea'], out: false },
      { args: ['axbccba'], out: true },
    ],
  },
}
