import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

function bruteFig(): FigStep[] {
  return [
    { note: '只能在最前面加字元，所以先找 s 最長的「回文前綴」。', views: [arr([...'abcd'], { label: 's' })] },
    { note: '檢查 abcd：從兩端比較，a 與 d 不同，因此整段不是回文。', views: [arr([...'abcd'], { label: '長度 4', compare: [0, 3] })] },
    { note: '再檢查 abc、ab，也不是回文；只剩第一個 a 是回文前綴。', views: [arr([...'abcd'], { label: '最長回文前綴', done: [0], dim: [1, 2, 3] })] },
    { note: '未涵蓋的尾段是 bcd，反過來是 dcb，放到前面得到 dcbabcd。', views: [arr([...'dcbabcd'], { label: '答案', done: [0, 1, 2] })] },
  ]
}

function kmpFig(): FigStep[] {
  return [
    { note: '把 s、分隔符、反轉後的 s 接起來：abcd#dcba。', views: [arr([...'abcd#dcba'], { label: '合併字串' })] },
    { note: '計算 KMP 前綴長度。讀完 abcd 時，最長相同前後綴仍是 0。', views: [arr([0, 0, 0, 0], { label: '目前前綴長度' })] },
    { note: '讀到最後的 a 時，長度變成 1；這就是 s 的最長回文前綴長度。', views: [arr([...'abcd#dcba'], { label: '最後匹配', done: [0, 8] }), arr([1], { label: '回文前綴長度' })] },
    { note: '把剩下的 bcd 反轉為 dcb 並接到前面，答案是 dcbabcd。', views: [arr([...'dcbabcd'], { label: '答案', done: [0, 1, 2] })] },
  ]
}

export const q0214: Solution = {
  id: 214,
  plain: '只准在字串前面補字母，把它變成回文；要補得越少越好。',
  statement: '給字串 s，可在開頭加入任意字元。回傳加入字元數最少時得到的回文字串。',
  examples: [
    { input: 's = "aacecaaa"', output: '"aaacecaaa"' },
    { input: 's = "abcd"', output: '"dcbabcd"' },
  ],
  constraints: ['0 ≤ s.length ≤ 5 × 10⁴；s 只含小寫英文字母。'],
  insight: ['原字串開頭能直接保留的部分必須自己就是回文。', '找出最長回文前綴後，將剩下的尾段反轉並補在前面即可。'],
  approaches: [
    {
      name: '由長到短檢查前綴',
      idea: '先試整個字串，再逐步縮短，找到第一個回文前綴。',
      steps: ['從 s.length 開始逐一嘗試前綴長度。', '用左右指標檢查該前綴是否為回文。', '找到後，把剩餘尾段反轉並接在 s 前面。'],
      figure: { title: 's = abcd', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多測試 n 個前綴，每次比較 O(n) 個字元；答案需要 O(n) 空間。' },
      verdict: '最容易理解；大輸入需換成線性搜尋。',
      code: {
        python: `def shortestPalindrome(s):
    for length in range(len(s), -1, -1):
        left, right = 0, length - 1
        while left < right and s[left] == s[right]:
            left += 1
            right -= 1
        if left >= right:
            suffix = s[length:]       # 前綴已是回文，只補剩餘尾段
            return suffix[::-1] + s
    return s`,
        c: `char *shortestPalindrome(char *s) {
    int n = strlen(s);
    int length = n;
    for (; length >= 0; length--) {
        int left = 0, right = length - 1;
        while (left < right && s[left] == s[right]) {
            left++;
            right--;
        }
        if (left >= right) {
            break;
        }
    }
    int extra = n - length;
    char *answer = malloc(n + extra + 1);
    for (int i = 0; i < extra; i++) {
        answer[i] = s[n - 1 - i];
    }
    memcpy(answer + extra, s, n);
    answer[n + extra] = '\\0';
    return answer;
}`,
        cpp: `string shortestPalindrome(string s) {
    for (int length = (int)s.size(); length >= 0; length--) {
        int left = 0, right = length - 1;
        while (left < right && s[left] == s[right]) {
            left++;
            right--;
        }
        if (left >= right) {
            string suffix = s.substr(length);
            reverse(suffix.begin(), suffix.end());
            return suffix + s;
        }
    }
    return s;
}`,
        java: `String shortestPalindrome(String s) {
    for (int length = s.length(); length >= 0; length--) {
        int left = 0, right = length - 1;
        while (left < right && s.charAt(left) == s.charAt(right)) {
            left++;
            right--;
        }
        if (left >= right) {
            String suffix = s.substring(length);
            return new StringBuilder(suffix).reverse().toString() + s;
        }
    }
    return s;
}`,
        javascript: `function shortestPalindrome(s) {
  for (let length = s.length; length >= 0; length--) {
    let left = 0;
    let right = length - 1;
    while (left < right && s[left] === s[right]) {
      left++;
      right--;
    }
    if (left >= right) {
      const suffix = s.slice(length);
      return [...suffix].reverse().join('') + s;
    }
  }
  return s;
}`,
      },
    },
    {
      name: 'KMP 前綴函數',
      idea: '在 s + 分隔符 + reverse(s) 上計算前綴函數；最後的值就是最長回文前綴長度。',
      steps: ['令 combined = s + # + reverse(s)。', '由左到右計算 KMP 前綴函數，遇到不合時依先前長度回退。', '最後一格的前綴長度就是可保留的回文前綴；反轉剩餘尾段補到前面。'],
      figure: { title: 'abcd#dcba 的前綴函數', steps: kmpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '前綴函數每個位置只前進與回退有限次，另存合併字串與長度陣列。' },
      verdict: '長字串的正式解；前綴函數是 [[p:kmp]] 的核心。',
      code: {
        python: `def shortestPalindrome(s):
    reversed_s = s[::-1]
    combined = s + '#' + reversed_s
    prefix = [0] * len(combined)
    for i in range(1, len(combined)):
        matched = prefix[i - 1]
        while matched > 0 and combined[i] != combined[matched]:
            matched = prefix[matched - 1]  # 回到較短的候選前綴
        if combined[i] == combined[matched]:
            matched += 1
        prefix[i] = matched
    length = prefix[-1] if prefix else 0
    return reversed_s[:len(s) - length] + s`,
        c: `char *shortestPalindrome(char *s) {
    int n = strlen(s);
    int size = 2 * n + 1;
    char *combined = malloc(size + 1);
    for (int i = 0; i < n; i++) {
        combined[i] = s[i];
        combined[n + 1 + i] = s[n - 1 - i];
    }
    combined[n] = '#';
    combined[size] = '\\0';
    int *prefix = calloc(size, sizeof(int));
    for (int i = 1; i < size; i++) {
        int matched = prefix[i - 1];
        while (matched > 0 && combined[i] != combined[matched]) {
            matched = prefix[matched - 1];
        }
        if (combined[i] == combined[matched]) {
            matched++;
        }
        prefix[i] = matched;
    }
    int extra = n - prefix[size - 1];
    char *answer = malloc(n + extra + 1);
    for (int i = 0; i < extra; i++) {
        answer[i] = s[n - 1 - i];
    }
    memcpy(answer + extra, s, n);
    answer[n + extra] = '\\0';
    free(prefix);
    free(combined);
    return answer;
}`,
        cpp: `string shortestPalindrome(string s) {
    string reversed = s;
    reverse(reversed.begin(), reversed.end());
    string combined = s + "#" + reversed;
    vector<int> prefix(combined.size(), 0);
    for (int i = 1; i < (int)combined.size(); i++) {
        int matched = prefix[i - 1];
        while (matched > 0 && combined[i] != combined[matched]) {
            matched = prefix[matched - 1];
        }
        if (combined[i] == combined[matched]) {
            matched++;
        }
        prefix[i] = matched;
    }
    int extra = s.size() - prefix.back();
    return reversed.substr(0, extra) + s;
}`,
        java: `String shortestPalindrome(String s) {
    String reversed = new StringBuilder(s).reverse().toString();
    String combined = s + "#" + reversed;
    int[] prefix = new int[combined.length()];
    for (int i = 1; i < combined.length(); i++) {
        int matched = prefix[i - 1];
        while (matched > 0 && combined.charAt(i) != combined.charAt(matched)) {
            matched = prefix[matched - 1];
        }
        if (combined.charAt(i) == combined.charAt(matched)) {
            matched++;
        }
        prefix[i] = matched;
    }
    int extra = s.length() - prefix[combined.length() - 1];
    return reversed.substring(0, extra) + s;
}`,
        javascript: `function shortestPalindrome(s) {
  const reversed = [...s].reverse().join('');
  const combined = s + '#' + reversed;
  const prefix = new Array(combined.length).fill(0);
  for (let i = 1; i < combined.length; i++) {
    let matched = prefix[i - 1];
    while (matched > 0 && combined[i] !== combined[matched]) {
      matched = prefix[matched - 1];
    }
    if (combined[i] === combined[matched]) {
      matched++;
    }
    prefix[i] = matched;
  }
  const extra = s.length - prefix[combined.length - 1];
  return reversed.slice(0, extra) + s;
}`,
      },
    },
  ],
  pitfalls: ['要找的是回文前綴，不是任意位置的最長回文。', '分隔符不能出現在 s 中；此題 s 只含小寫字母，可安全使用 #。', '空字串的 KMP 程式也要能處理。'],
  check: {
    kind: 'fn',
    fn: 'shortestPalindrome',
    cases: [
      { args: ['aacecaaa'], out: 'aaacecaaa' },
      { args: ['abcd'], out: 'dcbabcd' },
      { args: [''], out: '' },
      { args: ['aba'], out: 'aba' },
    ],
  },
}
