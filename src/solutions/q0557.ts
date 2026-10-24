import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 557. Reverse Words in a String III
const S = "Let's take LeetCode contest"
const F = [
  { note: '空白分出四個單字；單字順序維持原樣。', views: [arr(['Let\'s', 'take', 'LeetCode', 'contest'], { label: '單字' })] },
  { note: '第一個單字 Let\'s 反轉成 s\'teL。', views: [arr(["s'teL", 'take', 'LeetCode', 'contest'], { label: '處理第一個', done: [0] })] },
  { note: '接著反轉 take 與 LeetCode，變成 ekat、edoCteeL。', views: [arr(["s'teL", 'ekat', 'edoCteeL', 'contest'], { label: '前三個完成', done: [0, 1, 2] })] },
  { note: '最後反轉 contest 成 tsetnoc，再以單一空白接回去。', views: [arr(["s'teL", 'ekat', 'edoCteeL', 'tsetnoc'], { label: '全部完成', done: [0, 1, 2, 3] })] },
]
const G = [
  { note: '雙指標先框住第一個單字 Let\'s 的左右端。', views: [arr(S.split(''), { label: 's', highlight: [0, 4] })] },
  { note: '交換兩端 L 與 s，指標往內移；再交換 e 與撇號。', views: [arr("s'teL take LeetCode contest".split(''), { label: '第一字反轉中', highlight: [1, 3] })] },
  { note: '遇到空白就跳過，對下一個單字 take 重做。', views: [arr("s'teL ekat LeetCode contest".split(''), { label: '第二字完成', done: [6, 7, 8, 9] })] },
  { note: '每個單字各自反轉，最後單字順序不變。', views: [arr("s'teL ekat edoCteeL tsetnoc".split(''), { label: '結果' })] },
]

export const q0557: Solution = {
  id: 557,
  plain: '一句話裡每個單字的字母順序各自顛倒，但單字之間的順序保持不變。',
  statement: '給由空白隔開的字串 `s`，反轉每個單字內的字元；空白與單字順序保留。',
  examples: [{ input: 's = "Let\'s take LeetCode contest"', output: '"s\'teL ekat edoCteeL tsetnoc"' }, { input: 's = "Mr Ding"', output: '"rM gniD"' }],
  constraints: ['1 ≤ 字串長度 ≤ 5×10⁴；單字之間恰有一個空白。'],
  insight: ['問題是「每個單字內反轉」，不是反轉整句。', '可先切詞，也可用 [[p:two-pointers]] 在字元陣列中原地交換。'],
  approaches: [
    {
      name: '切詞後逐字反轉',
      idea: '以空白切成單字，把每個單字反轉，再用空白接回。',
      steps: ['依空白切詞。', '反轉每個詞。', '依原順序用空白接回。'],
      figure: { title: 's = "Let\'s take LeetCode contest"', steps: F },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元處理一次，產生新字串。' },
      verdict: '最短且最清楚，適合先掌握題意。',
      code: {
        python: `def reverseWords(s):
    words = s.split(' ')
    reversed_words = [word[::-1] for word in words]  # 各字獨立反轉
    return ' '.join(reversed_words)`,
        c: `char *reverseWords(char *s) {
    int n = strlen(s);
    char *result = malloc(n + 1);
    memcpy(result, s, n + 1);
    int start = 0;
    for (int i = 0; i <= n; i++) {
        if (i < n && result[i] != ' ') continue;
        int left = start, right = i - 1;
        while (left < right) {
            char tmp = result[left];
            result[left++] = result[right];
            result[right--] = tmp;
        }
        start = i + 1;
    }
    return result;
}`,
        cpp: `string reverseWords(string s) {
    int start = 0;
    for (int i = 0; i <= (int)s.size(); i++) {
        if (i < (int)s.size() && s[i] != ' ') continue;
        reverse(s.begin() + start, s.begin() + i);
        start = i + 1;
    }
    return s;
}`,
        java: `String reverseWords(String s) {
    String[] words = s.split(" ");
    StringBuilder result = new StringBuilder();
    for (int i = 0; i < words.length; i++) {
        if (i > 0) result.append(' ');
        result.append(new StringBuilder(words[i]).reverse());
    }
    return result.toString();
}`,
        javascript: `function reverseWords(s) {
  return s.split(' ').map((word) => [...word].reverse().join('')).join(' ');
}`,
      },
    },
    {
      name: '雙指標逐段交換',
      idea: '找出每個單字的左右邊界，交換兩端字元直到指標相遇。',
      steps: ['把字串變成可修改的字元陣列。', '找到單字起點與下一個空白。', '在該區間用左右指標交換；繼續下一個單字。'],
      figure: { title: '逐段雙指標反轉', steps: G },
      complexity: { time: 'O(n)', space: 'O(n)', why: '字串在這些語言中不可原地修改，所以先建立字元陣列。' },
      verdict: '適合練習分段雙指標；C 可直接操作可修改字元陣列。',
      code: {
        python: `def reverseWords(s):
    chars = list(s)
    start = 0
    for end in range(len(chars) + 1):
        if end < len(chars) and chars[end] != ' ':
            continue
        left, right = start, end - 1
        while left < right:
            chars[left], chars[right] = chars[right], chars[left]  # 只交換一個單字內
            left += 1
            right -= 1
        start = end + 1
    return ''.join(chars)`,
        c: `char *reverseWords(char *s) {
    int n = strlen(s);
    int start = 0;
    for (int i = 0; i <= n; i++) {
        if (i < n && s[i] != ' ') continue;
        int left = start, right = i - 1;
        while (left < right) {
            char tmp = s[left];
            s[left++] = s[right];
            s[right--] = tmp;
        }
        start = i + 1;
    }
    return s;
}`,
        cpp: `string reverseWords(string s) {
    int start = 0;
    for (int i = 0; i <= (int)s.size(); i++) {
        if (i < (int)s.size() && s[i] != ' ') continue;
        int left = start, right = i - 1;
        while (left < right) swap(s[left++], s[right--]);
        start = i + 1;
    }
    return s;
}`,
        java: `String reverseWords(String s) {
    char[] chars = s.toCharArray();
    int start = 0;
    for (int end = 0; end <= chars.length; end++) {
        if (end < chars.length && chars[end] != ' ') continue;
        int left = start, right = end - 1;
        while (left < right) {
            char tmp = chars[left];
            chars[left++] = chars[right];
            chars[right--] = tmp;
        }
        start = end + 1;
    }
    return new String(chars);
}`,
        javascript: `function reverseWords(s) {
  const chars = [...s];
  let start = 0;
  for (let end = 0; end <= chars.length; end++) {
    if (end < chars.length && chars[end] !== ' ') continue;
    let left = start, right = end - 1;
    while (left < right) {
      [chars[left], chars[right]] = [chars[right], chars[left]];
      left++;
      right--;
    }
    start = end + 1;
  }
  return chars.join('');
}`,
      },
    },
  ],
  pitfalls: ['不要反轉單字的先後順序。', '最後一個單字後面沒有空白，掃描邊界要走到字串長度。'],
  check: { kind: 'fn', fn: 'reverseWords', cases: [
    { args: [S], out: "s'teL ekat edoCteeL tsetnoc" }, { args: ['Mr Ding'], out: 'rM gniD' }, { args: ['a'], out: 'a' },
  ] },
}
