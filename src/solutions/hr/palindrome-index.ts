import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = 'aaab'

function trialFig(): FigStep[] {
  const out: FigStep[] = []
  for (let removed = 0; removed < SAMPLE.length; removed++) {
    const kept = SAMPLE.split('').filter((_, i) => i !== removed)
    let ok = true
    for (let l = 0, r = kept.length - 1; l < r; l++, r--) {
      if (kept[l] !== kept[r]) ok = false
      out.push({ note: `刪掉位置 ${removed} 的 ${SAMPLE[removed]}，比較剩下第 ${l} 與 ${r} 字：${kept[l]} ${kept[l] === kept[r] ? '等於' : '不等於'} ${kept[r]}，${ok ? '目前仍可行' : '這個候選失敗'}。`, views: [arr(SAMPLE.split(''), { label: '原字串', highlight: [removed] }), arr(kept, { label: '刪後字串', highlight: [l, r] })] })
      if (!ok) break
    }
    if (ok) break
  }
  return out
}

function pointerFig(): FigStep[] {
  const out: FigStep[] = [{ note: '左右指標先站在首尾，尚未刪任何字；只在第一次不相等處考慮刪除。', views: [arr(SAMPLE.split(''), { label: '原字串', highlight: [0, SAMPLE.length - 1] })] }]
  let l = 0, r = SAMPLE.length - 1
  while (l < r) {
    const same = SAMPLE[l] === SAMPLE[r]
    const left = SAMPLE.slice(l + 1, r + 1)
    const right = SAMPLE.slice(l, r)
    out.push({ note: `左右位置 ${l}/${r} 是 ${SAMPLE[l]}/${SAMPLE[r]}；${same ? '相同，兩端向內縮' : `不同，試刪左端得到 ${left}、刪右端得到 ${right}；只有刪右端可行，所以回傳 ${r}`}。`, views: [arr(SAMPLE.split(''), { label: '左右指標', highlight: [l, r] }), arr([left, right], { label: '兩種刪法' })] })
    if (!same) {
      out.push({ note: `試刪左端索引 ${l}，得到 ${left}；首尾不相同，因此不可行。`, views: [arr(SAMPLE.split(''), { label: '刪左側', highlight: [l] }), arr(left.split(''), { label: '刪後內容', highlight: [0, left.length - 1] })] })
      out.push({ note: `試刪右端索引 ${r}，得到 ${right}；左右對稱，答案為 ${r}。`, views: [arr(SAMPLE.split(''), { label: '刪右側', highlight: [r] }), arr(right.split(''), { label: '刪後內容' })] })
      break
    }
    l++; r--
  }
  return out
}

export const hrPalindromeIndex: HrSolution = {
  slug: 'palindrome-index',
  plain: '像檢查一條左右對稱的項鍊，最多拿掉一顆珠子，找出該拿掉哪一顆。',
  statement: '給一個小寫字串，若刪掉恰好一個字元能使剩下的字串左右對稱，回傳可刪的原字串索引；已有對稱或無法只刪一次修好，都回傳 -1。若有多個可行索引，任選一個。',
  examples: [
    { input: 's = "aaab"', output: '3', note: '刪掉末尾 b，剩下 aaa。' },
    { input: 's = "baa"', output: '0', note: '刪掉開頭 b，剩下 aa。' },
    { input: 's = "aaa"', output: '-1', note: '本來就對稱，不需要刪字。' },
  ],
  constraints: [
    '字串長度至少 1 → 長度 1 本來就對稱，答案為 -1。',
    '長度最多 10^5 → 每個位置都重建字串的 O(n²) 只適合作為直覺解。',
    '字元皆為小寫英文字母 → 相等比較即可，不需要正規化。',
  ],
  insight: [
    '最直接可逐一刪字後檢查對稱，這正好建立正確性基準。',
    '從兩端同時比較，第一組不相等之前，沒有理由刪那些已配對的字。',
    '第一組衝突只可能刪左端或右端；各檢查剩餘區間一次，得到 [[p:two-pointers]] 的 O(n) 解，和 [680](#/q/680) 類似。',
  ],
  approaches: [
    {
      name: '逐一刪字再檢查',
      idea: '先檢查原字串，之後每個索引都試著刪掉並驗證。',
      steps: ['建立回文檢查函式，讓左右指標向中間走。', '若原字串已是回文，立即回傳 -1。', '對每個索引建立刪後字串，檢查是否回文。', '第一個可行索引就是答案；全部失敗回傳 -1。'],
      figure: { title: 'aaab：逐一刪字', steps: trialFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多 n 個刪除候選，每次建字串與檢查要 O(n)；暫存刪後字串。' },
      verdict: '好理解，適合先確認規則；長字串會慢。',
      code: {
        python: `def palindromeIndex(s):
    def good(t):
        return t == t[::-1]
    if good(s):
        return -1
    for i in range(len(s)):
        candidate = s[:i] + s[i + 1:]
        if good(candidate):  # 嘗試刪掉第 i 個字
            return i
    return -1`,
        c: `int palindromeIndex(char* s) {
    int n = strlen(s), original = 1;
    for (int l = 0, r = n - 1; l < r; l++, r--) {
        if (s[l] != s[r]) original = 0;
    }
    if (original) return -1;
    for (int skip = 0; skip < n; skip++) {
        int l = 0, r = n - 1, good = 1;
        while (l < r) {
            if (l == skip) l++;
            if (r == skip) r--;
            if (l < r && s[l++] != s[r--]) {
                good = 0;
                break;
            }
        }
        if (good) return skip;
    }
    return -1;
}`,
        cpp: `int palindromeIndex(string s) {
    string reverseS = s;
    reverse(reverseS.begin(), reverseS.end());
    if (s == reverseS) return -1;
    for (int i = 0; i < (int)s.size(); i++) {
        string t = s.substr(0, i) + s.substr(i + 1);
        string u = t;
        reverse(u.begin(), u.end());
        if (t == u) return i;
    }
    return -1;
}`,
        java: `public static int palindromeIndex(String s) {
    if (s.equals(new StringBuilder(s).reverse().toString())) return -1;
    for (int i = 0; i < s.length(); i++) {
        String t = s.substring(0, i) + s.substring(i + 1);
        if (t.equals(new StringBuilder(t).reverse().toString())) return i;
    }
    return -1;
}`,
        javascript: `function palindromeIndex(s) {
  const good = t => t === [...t].reverse().join('');
  if (good(s)) return -1;
  for (let i = 0; i < s.length; i++) {
    const t = s.slice(0, i) + s.slice(i + 1);
    if (good(t)) return i;
  }
  return -1;
}`,
      },
    },
    {
      name: '衝突時檢查兩側',
      idea: '只在第一組不相等的兩端，試兩種可能的刪法。',
      steps: ['從 l=0、r=n-1 開始，比較 s[l] 與 s[r]。', '相等就往內縮，直到兩指標相遇或出現衝突。', '若無衝突，原字串已是回文，回傳 -1。', '若有衝突，檢查略過 l 的區間；可行就回傳 l，否則檢查略過 r；都失敗回傳 -1。'],
      figure: { title: 'aaab：衝突位置', steps: pointerFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '主掃描和兩次區間檢查各最多看 n 個字；不建立新字串。' },
      verdict: '最佳解；關鍵是只需考慮首個衝突的兩端。',
      code: {
        python: `def palindromeIndex(s):
    def good(l, r):
        while l < r:
            if s[l] != s[r]:
                return False
            l += 1
            r -= 1
        return True
    l, r = 0, len(s) - 1
    while l < r and s[l] == s[r]:
        l += 1
        r -= 1
    if l >= r:
        return -1
    if good(l + 1, r):  # 試刪左端
        return l
    return r if good(l, r - 1) else -1`,
        c: `static int palindromeRange(char* s, int l, int r) {
    while (l < r) {
        if (s[l++] != s[r--]) return 0;
    }
    return 1;
}
int palindromeIndex(char* s) {
    int l = 0, r = strlen(s) - 1;
    while (l < r && s[l] == s[r]) {
        l++;
        r--;
    }
    if (l >= r) return -1;
    if (palindromeRange(s, l + 1, r)) return l;
    return palindromeRange(s, l, r - 1) ? r : -1;
}`,
        cpp: `int palindromeIndex(string s) {
    auto good = [&](int l, int r) {
        while (l < r) {
            if (s[l++] != s[r--]) return false;
        }
        return true;
    };
    int l = 0, r = (int)s.size() - 1;
    while (l < r && s[l] == s[r]) {
        l++;
        r--;
    }
    if (l >= r) return -1;
    if (good(l + 1, r)) return l;
    return good(l, r - 1) ? r : -1;
}`,
        java: `public static int palindromeIndex(String s) {
    int l = 0, r = s.length() - 1;
    while (l < r && s.charAt(l) == s.charAt(r)) {
        l++;
        r--;
    }
    if (l >= r) return -1;
    if (palindromeRange(s, l + 1, r)) return l;
    return palindromeRange(s, l, r - 1) ? r : -1;
}
private static boolean palindromeRange(String s, int l, int r) {
    while (l < r) {
        if (s.charAt(l++) != s.charAt(r--)) return false;
    }
    return true;
}`,
        javascript: `function palindromeIndex(s) {
  const good = (l, r) => {
    while (l < r) {
      if (s[l++] !== s[r--]) return false;
    }
    return true;
  };
  let l = 0, r = s.length - 1;
  while (l < r && s[l] === s[r]) {
    l++;
    r--;
  }
  if (l >= r) return -1;
  if (good(l + 1, r)) return l;
  return good(l, r - 1) ? r : -1;
}`,
      },
    },
  ],
  pitfalls: [
    '原字串已經對稱時答案必須是 -1，即使刪一個字仍可能對稱。',
    '刪除索引是原字串的索引，不是刪後字串的位置。',
    '首個衝突可能刪左，也可能刪右；不能只試其中一邊。',
  ],
  check: {
    kind: 'fn',
    fn: 'palindromeIndex',
    cases: [
      { args: ['aaab'], out: 3 },
      { args: ['baa'], out: 0 },
      { args: ['aaa'], out: -1 },
      { args: ['a'], out: -1 },
      { args: ['ab'], out: 0 },
      { args: ['abc'], out: -1 },
      { args: ['abca'], out: 1 },
    ],
  },
}
