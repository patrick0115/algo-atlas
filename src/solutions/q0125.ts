import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 125. Valid Palindrome

const S = 'Ab, c?bA'
const isAlnum = (c: string) => /[a-z0-9]/i.test(c)

function cleanFig(): FigStep[] {
  const chars = [...S].map((c) => (c === ' ' ? '␣' : c))
  const clean = [...S].filter(isAlnum).map((c) => c.toLowerCase())
  const rev = [...clean].reverse()
  return [
    { note: '原字串有大小寫、空白(␣)和標點', views: [arr(chars, { label: 's' })] },
    { note: '第一步:只留下英文字母和數字,全部轉成小寫', views: [arr(chars, { label: 's', dim: [...S].flatMap((c, i) => (isAlnum(c) ? [] : [i])) }), arr(clean, { label: 'clean' })] },
    { note: '第二步:做一份反轉的副本', views: [arr(clean, { label: 'clean' }), arr(rev, { label: 'clean 反轉' })] },
    { note: clean.join('') === rev.join('') ? '兩者完全相同 → 是迴文,回傳 true' : '不相同 → 不是迴文', views: [arr(clean, { label: 'clean', done: range(0, clean.length - 1) }), arr(rev, { label: 'clean 反轉', done: range(0, rev.length - 1) })] },
  ]
}

function twoPtrFig(): FigStep[] {
  const chars = [...S].map((c) => (c === ' ' ? '␣' : c))
  const out: FigStep[] = [{ note: '左右各放一個指針,往中間夾。不用複製字串', views: [arr(chars, { label: 's', pointers: [{ name: 'L', index: 0 }, { name: 'R', index: S.length - 1, color: 'b' }] })] }]
  let l = 0
  let r = S.length - 1
  const done: number[] = []
  const view = (opt: Parameters<typeof arr>[1] = {}) => arr(chars, { label: 's', done: [...done], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }], ...opt })
  while (l < r) {
    if (!isAlnum(S[l])) {
      out.push({ note: `s[L] = "${chars[l]}" 不是字母數字 → L 往右跳過`, views: [view({ dim: [l] })] })
      l++
      continue
    }
    if (!isAlnum(S[r])) {
      out.push({ note: `s[R] = "${chars[r]}" 不是字母數字 → R 往左跳過`, views: [view({ dim: [r] })] })
      r--
      continue
    }
    const same = S[l].toLowerCase() === S[r].toLowerCase()
    out.push({ note: `比較 "${S[l]}" 和 "${S[r]}"(忽略大小寫)${same ? ' → 相同,兩邊都往內走' : ' → 不同,回傳 false'}`, views: [view({ compare: [l, r] })] })
    if (!same) return out
    done.push(l, r)
    l++
    r--
  }
  out.push({ note: 'L 和 R 相遇,所有該比的都相同 → 回傳 true', views: [view()] })
  return out
}

export const q0125: Solution = {
  id: 125,
  plain: '只看英文字母和數字、不分大小寫,檢查一句話是不是**正著念和倒著念一樣**(迴文),像「A man, a plan, a canal: Panama」。',
  statement: '給一個字串 `s`,只看**英文字母和數字**、並且**不分大小寫**,判斷它正著讀和反著讀是否一樣(迴文)。',
  examples: [
    { input: 's = "A man, a plan, a canal: Panama"', output: 'true', note: '整理後是 "amanaplanacanalpanama"' },
    { input: 's = "race a car"', output: 'false', note: '整理後是 "raceacar",反過來是 "racaecar"' },
    { input: 's = " "', output: 'true', note: '整理後是空字串,空字串算迴文' },
  ],
  constraints: [
    '`1 ≤ s.length ≤ 2·10⁵` → O(n) 解法;O(n²) 會太慢',
    '`s` 只包含可列印的 ASCII 字元 → 用語言內建的「是不是字母數字」判斷即可',
  ],
  insight: [
    '迴文的定義:第 `i` 個字元和倒數第 `i` 個字元相同',
    '最直覺:先把字串整理乾淨(只留字母數字、轉小寫),再和它的反轉比較 → 需要 O(n) 的額外空間',
    '不想複製字串的話,直接在原字串上放**左右兩個指針**往中間夾,遇到不是字母數字的就跳過 → O(1) 空間',
  ],
  approaches: [
    {
      name: '整理後和反轉比較',
      idea: '先過濾出字母數字並轉小寫,得到乾淨的字串 `t`,`t == reverse(t)` 就是迴文。',
      steps: ['`t = 只保留 s 裡的字母數字,轉小寫`', '`return t == t 反轉`'],
      figure: { title: 's = "Ab, c?bA"', steps: cleanFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '過濾、反轉、比較各走一次。要存整理後的字串和它的反轉。' },
      verdict: '最好寫,一兩行就完成,實際面試先寫這個也可以。被問「能不能 O(1) 空間」時換雙指針。',
      code: {
        python: `def isPalindrome(s):
    t = [c.lower() for c in s if c.isalnum()]
    return t == t[::-1]`,
        c: `bool isPalindrome(char *s) {
    int n = strlen(s), m = 0;
    char *t = malloc(n + 1);
    for (int i = 0; i < n; i++)
        if (isalnum((unsigned char)s[i])) t[m++] = tolower((unsigned char)s[i]);
    bool ok = true;
    for (int i = 0; i < m / 2; i++)          // 和反轉比較 = 第 i 個和倒數第 i 個比
        if (t[i] != t[m - 1 - i]) { ok = false; break; }
    free(t);
    return ok;
}`,
        cpp: `bool isPalindrome(string s) {
    string t;
    for (char c : s)
        if (isalnum((unsigned char)c)) t += tolower((unsigned char)c);
    return t == string(t.rbegin(), t.rend());
}`,
        java: `boolean isPalindrome(String s) {
    StringBuilder t = new StringBuilder();
    for (char c : s.toCharArray())
        if (Character.isLetterOrDigit(c)) t.append(Character.toLowerCase(c));
    String a = t.toString();
    return a.equals(t.reverse().toString());
}`,
        javascript: `function isPalindrome(s) {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return t === [...t].reverse().join('');
}`,
      },
    },
    {
      name: '左右雙指針',
      idea: '`L` 從頭、`R` 從尾往中間走。遇到不是字母數字的就跳過,兩邊都是字母數字時比較(忽略大小寫),不同就不是迴文。',
      steps: ['`L = 0`、`R = n − 1`', '`while L < R`:`s[L]` 不是字母數字 → `L++`;`s[R]` 不是 → `R--`', '兩邊都是:轉小寫比較,不同 → `false`', '相同 → `L++`、`R--`', '迴圈結束 → `true`'],
      figure: { title: 's = "Ab, c?bA"', steps: twoPtrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩個指針合起來最多走 n 步,只用了兩個整數。' },
      verdict: '標準解,[[p:two-pointers]]「左右夾擠」的入門題。680. Valid Palindrome II(可以刪一個字元)也是同一個骨架。',
      code: {
        python: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if not s[l].isalnum():
            l += 1
        elif not s[r].isalnum():
            r -= 1
        else:
            if s[l].lower() != s[r].lower():
                return False
            l += 1
            r -= 1
    return True`,
        c: `bool isPalindrome(char *s) {
    int l = 0, r = (int)strlen(s) - 1;
    while (l < r) {
        if (!isalnum((unsigned char)s[l])) l++;
        else if (!isalnum((unsigned char)s[r])) r--;
        else {
            if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;
            l++; r--;
        }
    }
    return true;
}`,
        cpp: `bool isPalindrome(string s) {
    int l = 0, r = (int)s.size() - 1;
    while (l < r) {
        if (!isalnum((unsigned char)s[l])) l++;
        else if (!isalnum((unsigned char)s[r])) r--;
        else {
            if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;
            l++; r--;
        }
    }
    return true;
}`,
        java: `boolean isPalindrome(String s) {
    int l = 0, r = s.length() - 1;
    while (l < r) {
        char a = s.charAt(l), b = s.charAt(r);
        if (!Character.isLetterOrDigit(a)) l++;
        else if (!Character.isLetterOrDigit(b)) r--;
        else {
            if (Character.toLowerCase(a) != Character.toLowerCase(b)) return false;
            l++; r--;
        }
    }
    return true;
}`,
        javascript: `function isPalindrome(s) {
  const ok = (c) => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (!ok(s[l])) l++;
    else if (!ok(s[r])) r--;
    else {
      if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
      l++;
      r--;
    }
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: [
    '忘了**數字**也要算:`"0P"` 的答案是 false(0 和 p 不同),只看字母的話會變成 true',
    '跳過非字母數字時用 `while` 要記得也檢查 `L < R`,不然可能越界;上面的寫法每次只動一步就沒有這個問題',
    'C / C++ 的 `isalnum`、`tolower` 參數要轉成 `unsigned char`,遇到負的 `char` 是未定義行為',
    '空字串或全是標點時答案是 true',
  ],
  followUp: [
    { q: '如果最多可以刪掉一個字元?', a: '680. Valid Palindrome II:雙指針遇到第一個不同時,分別試「跳過左邊」或「跳過右邊」,剩下的部分是不是迴文。' },
    { q: '找最長的迴文子字串?', a: '5. Longest Palindromic Substring:改成「從中心往外擴」的雙指針,每個中心試一次。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isPalindrome',
    cases: [
      { args: ['A man, a plan, a canal: Panama'], out: true },
      { args: ['race a car'], out: false },
      { args: [' '], out: true },
      { args: ['0P'], out: false },
      { args: ['Ab, c?bA'], out: true },
      { args: ['.,'], out: true },
    ],
  },
}
