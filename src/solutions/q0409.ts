import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 409. Longest Palindrome
const S = 'abccccdd'
const F = [
  { note: '統計字元次數：a、b 各 1 次，c 有 4 次，d 有 2 次。大小寫視為不同字元。', views: [arr([1, 1, 4, 2], { label: 'a、b、c、d 的次數' })] },
  { note: '偶數次的 cccc 和 dd 都能分配到回文的左右兩邊，共 6 個。', views: [arr([0, 0, 4, 2], { label: '配對可用數', done: [2, 3] })] },
  { note: 'a 或 b 其中一個可放在中心，只能多用 1 個。', views: [arr([1], { label: '中心', highlight: [0] })] },
  { note: '最長長度 6+1=7，例如 dccaccd。', views: [arr('dccaccd'.split(''), { label: '一個可能的回文', done: [0, 1, 2, 3, 4, 5, 6] })] },
]
const G = [
  { note: '掃到 a，還沒找到另一個 a，把它放入未配對集合。', views: [arr(['a'], { label: '未配對' })] },
  { note: '掃到 b、第一個 c，集合成為 a、b、c。', views: [arr(['a', 'b', 'c'], { label: '未配對' })] },
  { note: '第二個 c 配成一對，從集合移除 c，答案加 2。', views: [arr(['a', 'b'], { label: '未配對' }), arr([2], { label: '已配對長度' })] },
  { note: '其餘 c、d 也各配成對；最後剩 a、b，選一個作中心，得到 7。', views: [arr(['a', 'b'], { label: '未配對' }), arr([7], { label: '答案', done: [0] })] },
]

export const q0409: Solution = {
  id: 409,
  plain: '把字母重新排列成回文，問最多能用掉幾個字母。',
  statement: '給字串 `s`，可重新排列其中字元。求能組成的最長回文長度；大寫與小寫是不同字元。',
  examples: [{ input: 's = "abccccdd"', output: '7' }, { input: 's = "a"', output: '1' }, { input: 's = "Aa"', output: '1' }],
  constraints: ['字串長度最多 2000；只含英文字母，大小寫分開計。'],
  insight: ['回文左右對稱，所以每個字母的偶數個都能使用。', '奇數次的字母最多只有一種能放在正中央，這是 [[p:hash-map]] 的計數題。'],
  approaches: [
    {
      name: '計算頻率並取偶數部分',
      idea: '每種字元都取最大的偶數個；若仍有剩餘字元，中心再加一。',
      steps: ['計算每個字元的出現次數。', '把 `count−count%2` 加入答案。', '若有任何奇數次字元，再加一。'],
      figure: { title: 's = "abccccdd"', steps: F },
      complexity: { time: 'O(n)', space: 'O(1)', why: '英文字母種類數固定。' },
      verdict: '最直接，避免真的建立回文字串。',
      code: {
        python: `from collections import Counter

def longestPalindrome(s):
    counts = Counter(s)
    pairs = sum(value // 2 * 2 for value in counts.values())  # 左右成對使用
    return pairs + int(pairs < len(s))                         # 有剩字元就放中心`,
        c: `int longestPalindrome(char *s) {
    int count[128] = {0}, length = 0;
    for (int i = 0; s[i]; i++) count[(unsigned char)s[i]]++;
    for (int i = 0; i < 128; i++) length += count[i] / 2 * 2;
    return length + (length < (int)strlen(s));
}`,
        cpp: `int longestPalindrome(string s) {
    int count[128] = {0}, length = 0;
    for (char ch : s) count[(unsigned char)ch]++;
    for (int value : count) length += value / 2 * 2;
    return length + (length < (int)s.size());
}`,
        java: `int longestPalindrome(String s) {
    int[] count = new int[128];
    int length = 0;
    for (char ch : s.toCharArray()) count[ch]++;
    for (int value : count) length += value / 2 * 2;
    return length + (length < s.length() ? 1 : 0);
}`,
        javascript: `function longestPalindrome(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1);
  let length = 0;
  for (const value of count.values()) length += Math.floor(value / 2) * 2;
  return length + +(length < s.length);
}`,
      },
    },
    {
      name: '掃描時消去成對字元',
      idea: '集合保存還沒配對的字元；第二次遇見就消去一對。',
      steps: ['建立空的未配對集合。', '遇到集合內字元就移除並把答案加 2，否則加入。', '掃完若集合非空，選一個字元放中心。'],
      figure: { title: 's = "abccccdd"', steps: G },
      complexity: { time: 'O(n)', space: 'O(1)', why: '集合最多放 52 種英文字母。' },
      verdict: '邊掃邊配對，能直觀看見左右對稱的來源。',
      code: {
        python: `def longestPalindrome(s):
    odd = set()
    length = 0
    for ch in s:
        if ch in odd:
            odd.remove(ch)             # 第二個字母配成一對
            length += 2
        else:
            odd.add(ch)
    return length + int(bool(odd))      # 至多一個中心`,
        c: `int longestPalindrome(char *s) {
    bool odd[128] = {false};
    int length = 0;
    for (int i = 0; s[i]; i++) {
        unsigned char ch = s[i];
        odd[ch] = !odd[ch];
        if (!odd[ch]) length += 2;
    }
    for (int i = 0; i < 128; i++) {
        if (odd[i]) return length + 1;
    }
    return length;
}`,
        cpp: `int longestPalindrome(string s) {
    unordered_set<char> odd;
    int length = 0;
    for (char ch : s) {
        if (odd.erase(ch)) length += 2;
        else odd.insert(ch);
    }
    return length + !odd.empty();
}`,
        java: `int longestPalindrome(String s) {
    HashSet<Character> odd = new HashSet<>();
    int length = 0;
    for (char ch : s.toCharArray()) {
        if (odd.remove(ch)) length += 2;
        else odd.add(ch);
    }
    return length + (odd.isEmpty() ? 0 : 1);
}`,
        javascript: `function longestPalindrome(s) {
  const odd = new Set();
  let length = 0;
  for (const ch of s) {
    if (odd.has(ch)) {
      odd.delete(ch);
      length += 2;
    } else {
      odd.add(ch);
    }
  }
  return length + +(odd.size > 0);
}`,
      },
    },
  ],
  pitfalls: ['題目問長度，不要求輸出回文。', 'A 與 a 不可混為同一個字元。'],
  check: { kind: 'fn', fn: 'longestPalindrome', cases: [
    { args: [S], out: 7 }, { args: ['a'], out: 1 }, { args: ['Aa'], out: 1 }, { args: ['aabb'], out: 4 },
  ] },
}
