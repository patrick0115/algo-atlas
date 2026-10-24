import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 132. Palindrome Partitioning II
const S = 'aab'

export const q0132: Solution = {
  id: 132,
  plain: '把字串切成幾段，讓每段都左右對稱；求最少需要切幾刀。',
  statement: '給字串 s，將它分割成全為回文的連續子字串，回傳所需的最少切割次數。',
  examples: [
    { input: 's = "aab"', output: '1', note: '切成 "aa" | "b"。' },
    { input: 's = "a"', output: '0' },
    { input: 's = "ab"', output: '1' },
  ],
  constraints: ['1 ≤ s.length ≤ 2000；字元為小寫英文字母。'],
  insight: ['若 s[j..i] 是回文，前綴 s[0..i] 的最後一段可以選它，切數由前面的最佳解加一。', '可先預算所有回文區間，或從每個中心向外擴展，遇到回文就更新前綴答案。'],
  approaches: [
    {
      name: '回文區間表加前綴 DP',
      idea: 'pal[l][r] 記是否回文；cut[i] 記前 i 個字元所需的最少切數。',
      steps: ['由短到長填 pal；兩端相同且內部為回文才成立。', '設 cut[0] = −1，讓整段回文時加一得到 0。', '對每個結尾 i，試所有起點 j；若 s[j..i−1] 回文，更新 cut[i] = min(cut[i], cut[j]+1)。'],
      figure: { title: 's = aab', steps: [
        { note: '單字元 a、a、b 都是回文；連續的 "aa" 也是回文。', views: [arr(S.split(''), { highlight: [0, 1] })] },
        { note: '空前綴的 cut[0] = −1。第一個 a 作為整段，cut[1] = 0。', views: [arr([-1, 0], { label: 'cut[0..1]', done: [0, 1] })] },
        { note: '前兩個字元 "aa" 整段回文，因此 cut[2] = cut[0]+1 = 0。', views: [arr([-1, 0, 0], { label: 'cut[0..2]', highlight: [2] })] },
        { note: '最後 b 單獨成段，cut[3] = cut[2]+1 = 1；切成 aa | b。', views: [arr([-1, 0, 0, 1], { label: 'cut[0..3]', done: [3] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '回文表和前綴 DP 都枚舉 O(n²) 個區間。' },
      verdict: '轉移式清晰，適合先理解「最後一段」的決策。',
      code: {
        python: `def minCut(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for right in range(n):
        for left in range(right, -1, -1):
            pal[left][right] = s[left] == s[right] and (right - left < 2 or pal[left + 1][right - 1])
    cut = list(range(-1, n))
    for end in range(1, n + 1):
        for start in range(end):
            if pal[start][end - 1]:
                cut[end] = min(cut[end], cut[start] + 1)  # 最後一段是回文
    return cut[n]`,
        c: `int minCut(char *s) {
    int n = strlen(s);
    bool *pal = calloc(n * n, sizeof(bool));
    int *cut = malloc((n + 1) * sizeof(int));
    for (int right = 0; right < n; right++) {
        for (int left = right; left >= 0; left--) {
            pal[left * n + right] = s[left] == s[right] && (right - left < 2 || pal[(left + 1) * n + right - 1]);
        }
    }
    cut[0] = -1;
    for (int end = 1; end <= n; end++) {
        cut[end] = end - 1;
        for (int start = 0; start < end; start++) {
            if (pal[start * n + end - 1] && cut[start] + 1 < cut[end]) {
                cut[end] = cut[start] + 1;
            }
        }
    }
    int answer = cut[n];
    free(pal);
    free(cut);
    return answer;
}`,
        cpp: `int minCut(string s) {
    int n = s.size();
    vector<vector<bool>> pal(n, vector<bool>(n, false));
    for (int right = 0; right < n; right++) {
        for (int left = right; left >= 0; left--) {
            pal[left][right] = s[left] == s[right] && (right - left < 2 || pal[left + 1][right - 1]);
        }
    }
    vector<int> cut(n + 1);
    cut[0] = -1;
    for (int end = 1; end <= n; end++) {
        cut[end] = end - 1;
        for (int start = 0; start < end; start++) {
            if (pal[start][end - 1]) {
                cut[end] = min(cut[end], cut[start] + 1);
            }
        }
    }
    return cut[n];
}`,
        java: `int minCut(String s) {
    int n = s.length();
    boolean[][] pal = new boolean[n][n];
    for (int right = 0; right < n; right++) {
        for (int left = right; left >= 0; left--) {
            pal[left][right] = s.charAt(left) == s.charAt(right) && (right - left < 2 || pal[left + 1][right - 1]);
        }
    }
    int[] cut = new int[n + 1];
    cut[0] = -1;
    for (int end = 1; end <= n; end++) {
        cut[end] = end - 1;
        for (int start = 0; start < end; start++) {
            if (pal[start][end - 1]) {
                cut[end] = Math.min(cut[end], cut[start] + 1);
            }
        }
    }
    return cut[n];
}`,
        javascript: `function minCut(s) {
  const n = s.length;
  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let right = 0; right < n; right++) {
    for (let left = right; left >= 0; left--) {
      pal[left][right] = s[left] === s[right] && (right - left < 2 || pal[left + 1][right - 1]);
    }
  }
  const cut = new Array(n + 1);
  cut[0] = -1;
  for (let end = 1; end <= n; end++) {
    cut[end] = end - 1;
    for (let start = 0; start < end; start++) {
      if (pal[start][end - 1]) {
        cut[end] = Math.min(cut[end], cut[start] + 1);
      }
    }
  }
  return cut[n];
}`,
      },
    },
    {
      name: '從回文中心向外擴展',
      idea: '每擴出一個回文 s[left..right]，立即用它更新前綴 cut[right+1]，不必保存整張回文表。',
      steps: ['初始化 cut[i] = i−1。', '依序選每個字元作奇數長度中心，及每兩字元間作偶數長度中心。', '兩端字元相同就往外擴，並更新 cut[right+1]。', '回傳 cut[n]。'],
      figure: { title: 's = aab', steps: [
        { note: '初始把每個字元分開：cut = [−1,0,1,2]。', views: [arr([-1, 0, 1, 2], { label: 'cut 初值' })] },
        { note: '以第一個 a 為中心只得到 "a"，cut[1] 維持 0。', views: [arr(S.split(''), { highlight: [0] })] },
        { note: '以兩個 a 之間為中心擴展，得到 "aa"；cut[2] 更新為 cut[0]+1 = 0。', views: [arr(S.split(''), { highlight: [0, 1] }), arr([-1, 0, 0, 2], { label: 'cut' })] },
        { note: '以 b 為中心得到 "b"；cut[3] 更新為 cut[2]+1 = 1。', views: [arr(S.split(''), { done: [0, 1], highlight: [2] }), arr([-1, 0, 0, 1], { label: 'cut' })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個中心最多向外擴展 O(n)，只存前綴最佳切數。' },
      verdict: '同樣是平方時間，但把回文判定與切數更新合在一起。',
      code: {
        python: `def minCut(s):
    n = len(s)
    cut = [i - 1 for i in range(n + 1)]
    for center in range(n):
        for left, right in ((center, center), (center, center + 1)):
            while left >= 0 and right < n and s[left] == s[right]:
                cut[right + 1] = min(cut[right + 1], cut[left] + 1)  # 整段是回文
                left -= 1
                right += 1
    return cut[n]`,
        c: `int minCut(char *s) {
    int n = strlen(s);
    int *cut = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) {
        cut[i] = i - 1;
    }
    for (int center = 0; center < n; center++) {
        for (int parity = 0; parity < 2; parity++) {
            int left = center;
            int right = center + parity;
            while (left >= 0 && right < n && s[left] == s[right]) {
                int value = cut[left] + 1;
                if (value < cut[right + 1]) {
                    cut[right + 1] = value;
                }
                left--;
                right++;
            }
        }
    }
    int answer = cut[n];
    free(cut);
    return answer;
}`,
        cpp: `int minCut(string s) {
    int n = s.size();
    vector<int> cut(n + 1);
    for (int i = 0; i <= n; i++) {
        cut[i] = i - 1;
    }
    for (int center = 0; center < n; center++) {
        for (int parity = 0; parity < 2; parity++) {
            int left = center;
            int right = center + parity;
            while (left >= 0 && right < n && s[left] == s[right]) {
                cut[right + 1] = min(cut[right + 1], cut[left] + 1);
                left--;
                right++;
            }
        }
    }
    return cut[n];
}`,
        java: `int minCut(String s) {
    int n = s.length();
    int[] cut = new int[n + 1];
    for (int i = 0; i <= n; i++) {
        cut[i] = i - 1;
    }
    for (int center = 0; center < n; center++) {
        for (int parity = 0; parity < 2; parity++) {
            int left = center;
            int right = center + parity;
            while (left >= 0 && right < n && s.charAt(left) == s.charAt(right)) {
                cut[right + 1] = Math.min(cut[right + 1], cut[left] + 1);
                left--;
                right++;
            }
        }
    }
    return cut[n];
}`,
        javascript: `function minCut(s) {
  const n = s.length;
  const cut = Array.from({ length: n + 1 }, (_, i) => i - 1);
  for (let center = 0; center < n; center++) {
    for (let parity = 0; parity < 2; parity++) {
      let left = center;
      let right = center + parity;
      while (left >= 0 && right < n && s[left] === s[right]) {
        cut[right + 1] = Math.min(cut[right + 1], cut[left] + 1);
        left--;
        right++;
      }
    }
  }
  return cut[n];
}`,
      },
    },
  ],
  pitfalls: ['若整個前綴是回文，切數應為 0；cut[0] 設成 −1 才能統一套用加一公式。', '回文區間表要先算短區間，才能查內部 s[l+1..r−1]。'],
  check: { kind: 'fn', fn: 'minCut', cases: [
    { args: [S], out: 1 },
    { args: ['a'], out: 0 },
    { args: ['ab'], out: 1 },
    { args: ['aabaa'], out: 0 },
  ] },
}
