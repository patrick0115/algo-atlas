import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1930. Unique Length-3 Palindromic Subsequences

const S = 'aabca'

function firstLastFig(): FigStep[] {
  const out: FigStep[] = [{ note: '長度 3 的回文長得像 x?x:頭尾同一個字,中間任意。對每個字母 x,找它**第一次**和**最後一次**出現的位置 —— 夾得越寬,中間能選的字越多', views: [arr(S.split(''), { label: 's' })] }]
  let total = 0
  for (const c of [...new Set(S)].sort()) {
    const f = S.indexOf(c)
    const l = S.lastIndexOf(c)
    const mid = l - f > 1 ? [...new Set(S.slice(f + 1, l))] : []
    total += mid.length
    out.push({ note: l - f > 1 ? `x = "${c}":第一次在 ${f}、最後在 ${l},中間有 ${mid.length} 種不同的字 {${mid.join(', ')}} → ${mid.map((m) => c + m + c).join('、')}` : `x = "${c}":只出現 ${f === l ? '一次' : '在相鄰位置'},夾不出中間 → 0 個`, views: [arr(S.split(''), { label: 's', highlight: [f, l], range: [f + 1, l - 1] })] })
  }
  out.push({ note: `總共 ${total} 個不同的回文`, views: [arr(['aaa', 'aba', 'aca'], { label: '答案', done: [0, 1, 2] })] })
  return out
}

function midFig(): FigStep[] {
  return [
    { note: '換個角度:枚舉**中間**的位置 j。左邊出現過的字母集合 L、右邊剩下的字母計數 R。x 同時在 L 和 R 裡,就能組成 x s[j] x', views: [arr(S.split(''), { label: 's', highlight: [2], range: [0, 1] }), arr(['L = {a}', 'R = {c:1, a:1}'], { label: '中間 j = 2(b)' })] },
    { note: '用一個 26×26 的表記下「(中間字, 頭尾字)」出現過,自動去重。j = 2:a 在兩邊都有 → 記下 (b, a) = "aba"', views: [arr(['aba'], { label: '新找到', done: [0] })] },
  ]
}

export const q1930: Solution = {
  id: 1930,
  plain: '從字串裡跳著挑 3 個字(順序不變),挑出來要是「正念反念都一樣」的回文,像 "aba"。問有幾種**不同的**回文(一樣的字串只算一次)。',
  statement: '給字串 `s`,回傳 s 中長度為 3 的**不同**回文子序列個數(相同字串只算一次)。',
  examples: [
    { input: 's = "aabca"', output: '3', note: '"aba"、"aaa"、"aca"' },
    { input: 's = "adc"', output: '0' },
    { input: 's = "bbcbaba"', output: '4', note: '"bbb"、"bcb"、"bab"、"aba"' },
  ],
  constraints: ['n ≤ 10⁵,只有小寫字母 → 26 是常數'],
  insight: ['長度 3 的回文 = x ? x,只由 (頭尾字 x, 中間字 y) 決定 → 最多 26 × 26 種', '對每個 x,取它第一次、最後一次出現的位置,中間出現過幾種不同的字,就有幾個以 x 為頭尾的回文', '用最外側的一對最好:任何內側的一對能組出的,外側都能組出'],
  approaches: [
    {
      name: '每個字母的最左與最右',
      idea: '對每個字母 c:`f = first[c]`、`l = last[c]`,答案加上 `s[f+1 .. l−1]` 裡不同字元的個數。',
      steps: ['記下每個字母第一次、最後一次出現的位置', '對 26 個字母:`l − f ≥ 2` 時,數 `s[f+1:l]` 裡有幾種字', '加總'],
      figure: { title: `s = "${S}"`, steps: firstLastFig() },
      complexity: { time: 'O(26 · n)', space: 'O(26)', why: '每個字母最多掃一次中間那段。' },
      verdict: '最推薦,想法最直接。「不同的」→ 用集合數中間有幾種字。',
      code: {
        python: `def countPalindromicSubsequence(s):
    ans = 0
    for c in set(s):
        f, l = s.find(c), s.rfind(c)          # 最外側的一對 c
        if l - f > 1:
            ans += len(set(s[f + 1:l]))       # 中間有幾種不同的字
    return ans`,
        c: `int countPalindromicSubsequence(char *s) {
    int n = strlen(s), first[26], last[26], ans = 0;
    for (int c = 0; c < 26; c++) first[c] = -1;
    for (int i = 0; i < n; i++) {
        int c = s[i] - 'a';
        if (first[c] < 0) first[c] = i;
        last[c] = i;
    }
    for (int c = 0; c < 26; c++) {
        if (first[c] < 0 || last[c] - first[c] < 2) continue;
        bool seen[26] = {0};
        for (int i = first[c] + 1; i < last[c]; i++) {
            if (!seen[s[i] - 'a']) { seen[s[i] - 'a'] = 1; ans++; }
        }
    }
    return ans;
}`,
        cpp: `int countPalindromicSubsequence(string s) {
    vector<int> first(26, -1), last(26, -1);
    for (int i = 0; i < (int)s.size(); i++) {
        int c = s[i] - 'a';
        if (first[c] < 0) first[c] = i;
        last[c] = i;
    }
    int ans = 0;
    for (int c = 0; c < 26; c++) {
        if (first[c] < 0 || last[c] - first[c] < 2) continue;
        ans += unordered_set<char>(s.begin() + first[c] + 1, s.begin() + last[c]).size();
    }
    return ans;
}`,
        java: `int countPalindromicSubsequence(String s) {
    int[] first = new int[26], last = new int[26];
    Arrays.fill(first, -1);
    for (int i = 0; i < s.length(); i++) {
        int c = s.charAt(i) - 'a';
        if (first[c] < 0) first[c] = i;
        last[c] = i;
    }
    int ans = 0;
    for (int c = 0; c < 26; c++) {
        if (first[c] < 0 || last[c] - first[c] < 2) continue;
        boolean[] seen = new boolean[26];
        for (int i = first[c] + 1; i < last[c]; i++)
            if (!seen[s.charAt(i) - 'a']) { seen[s.charAt(i) - 'a'] = true; ans++; }
    }
    return ans;
}`,
        javascript: `function countPalindromicSubsequence(s) {
  let ans = 0;
  for (const c of new Set(s)) {
    const f = s.indexOf(c), l = s.lastIndexOf(c);
    if (l - f > 1) ans += new Set(s.slice(f + 1, l)).size;
  }
  return ans;
}`,
      },
    },
    {
      name: '枚舉中間 + 左右字母表',
      idea: '中間位置 j 從左到右:左邊出現過的字母 `left`,右邊剩下的計數 `right`;對每個 x 同時在兩邊的,把 (s[j], x) 標記起來。最後數標記數。',
      steps: ['`right[c]` = 全部字母計數;`left` = 空', '`for j`:先 `right[s[j]] -= 1`', '對 26 個 x:`left[x] and right[x] > 0` → `seen[s[j]][x] = True`', '`left[s[j]] = True`;答案 = seen 裡 True 的個數'],
      figure: { title: `s = "${S}"`, steps: midFig() },
      complexity: { time: 'O(26 · n)', space: 'O(26²)', why: '每個中間位置檢查 26 個字母。' },
      verdict: '一趟掃描就完成,也是「枚舉中間、維護左右兩邊資訊」這種技巧的好練習。',
      code: {
        python: `def countPalindromicSubsequence(s):
    right = [0] * 26
    for c in s:
        right[ord(c) - 97] += 1
    left = [False] * 26
    seen = set()
    for c in s:
        m = ord(c) - 97
        right[m] -= 1                         # 自己不算在右邊
        for x in range(26):
            if left[x] and right[x]:
                seen.add((m, x))              # 回文 x-c-x
        left[m] = True
    return len(seen)`,
        c: `int countPalindromicSubsequence(char *s) {
    int right[26] = {0};
    bool left[26] = {0}, seen[26][26] = {{0}};
    for (char *p = s; *p; p++) right[*p - 'a']++;
    int ans = 0;
    for (char *p = s; *p; p++) {
        int m = *p - 'a';
        right[m]--;
        for (int x = 0; x < 26; x++)
            if (left[x] && right[x] && !seen[m][x]) { seen[m][x] = 1; ans++; }
        left[m] = 1;
    }
    return ans;
}`,
        cpp: `int countPalindromicSubsequence(string s) {
    int right[26] = {0}, ans = 0;
    bool left[26] = {0}, seen[26][26] = {{0}};
    for (char c : s) right[c - 'a']++;
    for (char c : s) {
        int m = c - 'a';
        right[m]--;
        for (int x = 0; x < 26; x++)
            if (left[x] && right[x] && !seen[m][x]) { seen[m][x] = true; ans++; }
        left[m] = true;
    }
    return ans;
}`,
        java: `int countPalindromicSubsequence(String s) {
    int[] right = new int[26];
    boolean[] left = new boolean[26];
    boolean[][] seen = new boolean[26][26];
    for (char c : s.toCharArray()) right[c - 'a']++;
    int ans = 0;
    for (char c : s.toCharArray()) {
        int m = c - 'a';
        right[m]--;
        for (int x = 0; x < 26; x++)
            if (left[x] && right[x] > 0 && !seen[m][x]) { seen[m][x] = true; ans++; }
        left[m] = true;
    }
    return ans;
}`,
        javascript: `function countPalindromicSubsequence(s) {
  const right = new Array(26).fill(0), left = new Array(26).fill(false);
  const seen = new Set();
  for (const c of s) right[c.charCodeAt(0) - 97]++;
  for (const c of s) {
    const m = c.charCodeAt(0) - 97;
    right[m]--;
    for (let x = 0; x < 26; x++) if (left[x] && right[x]) seen.add(m * 26 + x);
    left[m] = true;
  }
  return seen.size;
}`,
      },
    },
  ],
  pitfalls: ['數的是**不同的字串**,不是子序列的挑法數:"aaaa" 的答案是 1(只有 "aaa")', '中間那段數「出現過幾種字」,不是「有幾個字」'],
  check: {
    kind: 'fn',
    fn: 'countPalindromicSubsequence',
    cases: [
      { args: [S], out: 3 },
      { args: ['adc'], out: 0 },
      { args: ['bbcbaba'], out: 4 },
      { args: ['aaaa'], out: 1 },
      { args: ['abcba'], out: 3 },
    ],
  },
}
