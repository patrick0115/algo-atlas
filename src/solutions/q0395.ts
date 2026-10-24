import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 395. Longest Substring with At Least K Repeating Characters
const S = 'aaabb'
const F1 = [
  { note: '整段 aaabb 中，a 有 3 個、b 有 2 個；k=3，所以 b 不可能出現在合格子字串裡。', views: [arr(S.split(''), { label: 's', dim: [3, 4] })] },
  { note: '以 b 為切點，前面留下 aaa，後面沒有其他片段。', views: [arr('aaa'.split(''), { label: '候選片段', highlight: [0, 1, 2] })] },
  { note: 'aaa 的 a 出現 3 次，符合至少 k 次。', views: [arr([3], { label: 'a 的次數', done: [0] })] },
  { note: '最長長度是 3。', views: [arr([3], { label: '答案', done: [0] })] },
]
const F2 = [
  { note: '先限定窗口內恰有 1 種字母；讀入 a、a、a，a 的次數逐步達到 3。', views: [arr('aaa'.split(''), { label: '窗口', highlight: [0, 1, 2] })] },
  { note: '再讀入 b，種類變 2，超過目標；左端逐步右移，直到只剩 b。', views: [arr('aaab'.split(''), { label: '暫時超標', dim: [0, 1, 2], highlight: [3] })] },
  { note: '窗口 aaa 曾有 1 種字母，且這種字母至少出現 3 次，記錄長度 3。', views: [arr([3], { label: '最佳長度', done: [0] })] },
  { note: '再試 2 種字母；整段 aaabb 中 b 只有 2 次，不合格。答案仍是 3。', views: [arr(S.split(''), { label: 's', dim: [3, 4], done: [0, 1, 2] })] },
]

export const q0395: Solution = {
  id: 395,
  plain: '找一段最長的連續文字，使其中每種出現過的字母都至少出現 k 次。',
  statement: '給小寫英文字串 `s` 和 `k`，求最長子字串長度，要求該子字串內每種字元的出現次數都不少於 k。',
  examples: [{ input: 's = "aaabb", k = 3', output: '3' }, { input: 's = "ababbc", k = 2', output: '5' }],
  constraints: ['1 ≤ |s| ≤ 10⁴；字母只有 26 種。'],
  insight: ['某段內出現不到 k 次的字母，絕不可能屬於該段的合格答案，可把它當切點。', '另一種做法是枚舉窗口中「不同字母種類數」，再用 [[p:sliding-window]]。'],
  approaches: [
    {
      name: '低頻字母切開後遞迴',
      idea: '在目前片段中出現少於 k 次的字母，把片段切開，分別求解。',
      steps: ['計算當前片段每個字母的頻率。', '若每種字母都至少 k 次，整段就是答案。', '找低頻字母，按它分割；遞迴取最長結果。'],
      figure: { title: 's = "aaabb", k = 3', steps: F1 },
      complexity: { time: 'O(26n)', space: 'O(n)', why: '每層至少排除一種字母，最多 26 層；遞迴與切片佔空間。' },
      verdict: '切點理由清楚；對字母表較小的題目很合適。',
      code: {
        python: `def longestSubstring(s, k):
    def solve(text):
        if len(text) < k:
            return 0
        count = [0] * 26
        for ch in text:
            count[ord(ch) - 97] += 1
        for ch in text:
            if count[ord(ch) - 97] < k:
                return max(solve(part) for part in text.split(ch))  # 低頻字母不能在答案中
        return len(text)
    return solve(s)`,
        c: `static int solve395(char *s, int left, int right, int k) {
    if (right - left < k) return 0;
    int count[26] = {0};
    for (int i = left; i < right; i++) count[s[i] - 'a']++;
    for (int i = left; i < right; i++) {
        if (count[s[i] - 'a'] >= k) continue;
        int best = 0;
        int start = left;
        for (int j = left; j <= right; j++) {
            if (j < right && count[s[j] - 'a'] >= k) continue;
            int value = solve395(s, start, j, k);
            if (value > best) best = value;
            start = j + 1;
        }
        return best;
    }
    return right - left;
}

int longestSubstring(char *s, int k) {
    return solve395(s, 0, strlen(s), k);
}`,
        cpp: `int longestSubstring(string s, int k) {
    if ((int)s.size() < k) return 0;
    vector<int> count(26);
    for (char ch : s) count[ch - 'a']++;
    for (char ch : s) {
        if (count[ch - 'a'] >= k) continue;
        int best = 0, start = 0;
        for (int i = 0; i <= (int)s.size(); i++) {
            if (i < (int)s.size() && count[s[i] - 'a'] >= k) continue;
            best = max(best, longestSubstring(s.substr(start, i - start), k));
            start = i + 1;
        }
        return best;
    }
    return s.size();
}`,
        java: `int longestSubstring(String s, int k) {
    if (s.length() < k) return 0;
    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) count[s.charAt(i) - 'a']++;
    for (int i = 0; i < s.length(); i++) {
        if (count[s.charAt(i) - 'a'] >= k) continue;
        int best = 0, start = 0;
        for (int j = 0; j <= s.length(); j++) {
            if (j < s.length() && count[s.charAt(j) - 'a'] >= k) continue;
            best = Math.max(best, longestSubstring(s.substring(start, j), k));
            start = j + 1;
        }
        return best;
    }
    return s.length();
}`,
        javascript: `function longestSubstring(s, k) {
  if (s.length < k) return 0;
  const count = new Array(26).fill(0);
  for (const ch of s) count[ch.charCodeAt(0) - 97]++;
  for (const ch of s) {
    if (count[ch.charCodeAt(0) - 97] >= k) continue;
    let best = 0;
    for (const part of s.split(ch)) best = Math.max(best, longestSubstring(part, k));
    return best;
  }
  return s.length;
}`,
      },
    },
    {
      name: '枚舉字母種類的滑動窗口',
      idea: '固定窗口裡最多幾種不同字母，當所有字母次數都達 k 時更新答案。',
      steps: ['目標種類數從 1 到 26。', '右端加入字母；種類超標就移動左端。', '若窗口內每種字母都達 k，更新最大長度。'],
      figure: { title: 's = "aaabb", k = 3', steps: F2 },
      complexity: { time: 'O(26n)', space: 'O(26)', why: '每個種類數下，左右指標各走 n 次。' },
      verdict: '非遞迴，適合練習固定字母表的窗口計數。',
      code: {
        python: `def longestSubstring(s, k):
    answer = 0
    for target in range(1, 27):
        count = [0] * 26
        left = kinds = valid = 0
        for right, ch in enumerate(s):
            x = ord(ch) - 97
            if count[x] == 0:
                kinds += 1
            count[x] += 1
            if count[x] == k:
                valid += 1              # 這種字母達到門檻
            while kinds > target:
                y = ord(s[left]) - 97
                if count[y] == k:
                    valid -= 1
                count[y] -= 1
                if count[y] == 0:
                    kinds -= 1
                left += 1
            if kinds == target and valid == target:
                answer = max(answer, right - left + 1)
    return answer`,
        c: `int longestSubstring(char *s, int k) {
    int n = strlen(s), answer = 0;
    for (int target = 1; target <= 26; target++) {
        int count[26] = {0};
        int left = 0, kinds = 0, valid = 0;
        for (int right = 0; right < n; right++) {
            int x = s[right] - 'a';
            if (count[x] == 0) kinds++;
            count[x]++;
            if (count[x] == k) valid++;
            while (kinds > target) {
                int y = s[left++] - 'a';
                if (count[y] == k) valid--;
                count[y]--;
                if (count[y] == 0) kinds--;
            }
            if (kinds == target && valid == target && right - left + 1 > answer) answer = right - left + 1;
        }
    }
    return answer;
}`,
        cpp: `int longestSubstring(string s, int k) {
    int answer = 0;
    for (int target = 1; target <= 26; target++) {
        vector<int> count(26);
        int left = 0, kinds = 0, valid = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            int x = s[right] - 'a';
            if (count[x]++ == 0) kinds++;
            if (count[x] == k) valid++;
            while (kinds > target) {
                int y = s[left++] - 'a';
                if (count[y] == k) valid--;
                if (--count[y] == 0) kinds--;
            }
            if (kinds == target && valid == target) answer = max(answer, right - left + 1);
        }
    }
    return answer;
}`,
        java: `int longestSubstring(String s, int k) {
    int answer = 0;
    for (int target = 1; target <= 26; target++) {
        int[] count = new int[26];
        int left = 0, kinds = 0, valid = 0;
        for (int right = 0; right < s.length(); right++) {
            int x = s.charAt(right) - 'a';
            if (count[x]++ == 0) kinds++;
            if (count[x] == k) valid++;
            while (kinds > target) {
                int y = s.charAt(left++) - 'a';
                if (count[y] == k) valid--;
                if (--count[y] == 0) kinds--;
            }
            if (kinds == target && valid == target) answer = Math.max(answer, right - left + 1);
        }
    }
    return answer;
}`,
        javascript: `function longestSubstring(s, k) {
  let answer = 0;
  for (let target = 1; target <= 26; target++) {
    const count = new Array(26).fill(0);
    let left = 0, kinds = 0, valid = 0;
    for (let right = 0; right < s.length; right++) {
      const x = s.charCodeAt(right) - 97;
      if (count[x]++ === 0) kinds++;
      if (count[x] === k) valid++;
      while (kinds > target) {
        const y = s.charCodeAt(left++) - 97;
        if (count[y] === k) valid--;
        if (--count[y] === 0) kinds--;
      }
      if (kinds === target && valid === target) answer = Math.max(answer, right - left + 1);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['只看整段字母頻率不夠；答案可以是某個較短片段。', '窗口中某字母次數從 k 降為 k−1 時，合格種類數要減一。'],
  check: { kind: 'fn', fn: 'longestSubstring', cases: [
    { args: [S, 3], out: 3 }, { args: ['ababbc', 2], out: 5 },
    { args: ['abc', 1], out: 3 }, { args: ['abc', 2], out: 0 },
  ] },
}
