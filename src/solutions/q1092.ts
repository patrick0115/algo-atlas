import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1092. Shortest Common Supersequence
const F = [
  { note: 'str1 = abac、str2 = cab；共同子序列 ab 可以只寫一次。', views: [arr('abac'.split(''), { label: 'str1' }), arr('cab'.split(''), { label: 'str2' })] },
  { note: '先保留 str2 開頭的 c，接著兩字共同的 a、b 不必重複寫。', views: [arr('cab'.split(''), { label: '已拼出的前段', done: [0, 1, 2] })] },
  { note: 'str1 還剩 a、c，把它們接在後面。', views: [arr('cabac'.split(''), { label: '超序列', highlight: [3, 4] })] },
  { note: 'cabac 同時包含 abac 與 cab 作為子序列，長度 5 是最短。', views: [arr('cabac'.split(''), { label: '一個最短答案', done: [0, 1, 2, 3, 4] })] },
]
const G = [
  { note: 'dp[i][j] 表示兩個前綴的最短共同超序列長度；其中一字空白時，長度就是另一字長。', views: [arr([0, 1, 2, 3, 4], { label: '空字串與 abac' })] },
  { note: '字元相同時只寫一次，從左上角長度加 1。', views: [arr(['a', 'b'], { label: '可共用的字元', highlight: [0, 1] })] },
  { note: '字元不同時選上方或左方較短的前綴，再補一個字元。', views: [arr([4, 5], { label: '兩個候選長度', highlight: [0] })] },
  { note: '倒著沿 dp 表重建，得到長度 5 的 cabac。', views: [arr('cabac'.split(''), { label: '結果', done: [0, 1, 2, 3, 4] })] },
]
const CHECK = {
  python: `

def scsCheck(a, b):
    out = shortestCommonSupersequence(a, b)
    def contains(source, target):
        it = iter(source)
        return all(any(ch == need for ch in it) for need in target)
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(dp[i - 1][j], dp[i][j - 1])
    return int(contains(out, a) and contains(out, b) and len(out) == m + n - dp[m][n])`,
  c: `

static bool contains1092(const char *out, const char *target) {
    for (int i = 0; target[i]; i++) {
        while (*out && *out != target[i]) out++;
        if (!*out) return false;
        out++;
    }
    return true;
}

int scsCheck(char *a, char *b) {
    char *out = shortestCommonSupersequence(a, b);
    int m = strlen(a), n = strlen(b);
    int **dp = malloc((m + 1) * sizeof(int *));
    for (int i = 0; i <= m; i++) dp[i] = calloc(n + 1, sizeof(int));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
        }
    }
    int valid = contains1092(out, a) && contains1092(out, b) && (int)strlen(out) == m + n - dp[m][n];
    for (int i = 0; i <= m; i++) free(dp[i]);
    free(dp);
    free(out);
    return valid;
}`,
  cpp: `

int scsCheck(string a, string b) {
    string out = shortestCommonSupersequence(a, b);
    auto contains = [&](const string& target) {
        int j = 0;
        for (char ch : out) if (j < (int)target.size() && ch == target[j]) j++;
        return j == (int)target.size();
    };
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return contains(a) && contains(b) && (int)out.size() == m + n - dp[m][n];
}`,
  java: `

boolean contains1092(String out, String target) {
    int j = 0;
    for (int i = 0; i < out.length() && j < target.length(); i++) {
        if (out.charAt(i) == target.charAt(j)) j++;
    }
    return j == target.length();
}

int scsCheck(String a, String b) {
    String out = shortestCommonSupersequence(a, b);
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return contains1092(out, a) && contains1092(out, b) && out.length() == m + n - dp[m][n] ? 1 : 0;
}`,
  javascript: `

function scsCheck(a, b) {
  const out = shortestCommonSupersequence(a, b);
  const contains = (target) => {
    let j = 0;
    for (const ch of out) if (ch === target[j]) j++;
    return j === target.length;
  };
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return +(contains(a) && contains(b) && out.length === a.length + b.length - dp[a.length][b.length]);
}`,
}

export const q1092: Solution = {
  id: 1092,
  plain: '把兩個字串合併成最短的一條，使兩者都能依原順序在新字串裡找到；共同的字可共用。',
  statement: '求 `str1` 與 `str2` 的一個最短共同超序列；兩個原字串都必須是結果的子序列。若有多個答案，回傳任一個。',
  examples: [{ input: 'str1 = "abac", str2 = "cab"', output: '"cabac"' }, { input: 'str1 = "aaaaaaaa", str2 = "aaaaaaaa"', output: '"aaaaaaaa"' }],
  constraints: ['兩字長度各最多 1000；可用 O(mn) 表。'],
  insight: ['共同部分只需寫一次；[[p:lcs]] 越長，合併後越短。', '也可直接算最短共同超序列的前綴長度，再倒推字元。'],
  approaches: [
    {
      name: 'LCS 表加雙指標重建',
      idea: '由 LCS 表找兩字能共用的字；其餘字各自加入結果。',
      steps: ['計算兩字所有前綴的 LCS 長度。', '從右下角倒走：相同字元只加一次。', '字元不同時沿 LCS 較大的方向走，加入被略過的字。', '反轉倒著收集的字元。'],
      figure: { title: 'str1 = "abac", str2 = "cab"', steps: F },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '建立完整 LCS 表供重建使用。' },
      verdict: '和 [1143](#/q/1143) 的 LCS 表直接連結。',
      code: {
        python: `def shortestCommonSupersequence(str1, str2):
    m, n = len(str1), len(str2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j - 1] + 1 if str1[i - 1] == str2[j - 1] else max(dp[i - 1][j], dp[i][j - 1])
    i, j, out = m, n, []
    while i and j:
        if str1[i - 1] == str2[j - 1]:
            out.append(str1[i - 1])  # 共同字元只放一次
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            out.append(str1[i - 1])
            i -= 1
        else:
            out.append(str2[j - 1])
            j -= 1
    out.extend(reversed(str1[:i]))
    out.extend(reversed(str2[:j]))
    return ''.join(reversed(out))${CHECK.python}`,
        c: `char *shortestCommonSupersequence(char *str1, char *str2) {
    int m = strlen(str1), n = strlen(str2);
    int **dp = malloc((m + 1) * sizeof(int *));
    for (int i = 0; i <= m; i++) dp[i] = calloc(n + 1, sizeof(int));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (str1[i - 1] == str2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
        }
    }
    char *out = malloc(m + n + 1);
    int i = m, j = n, size = 0;
    while (i && j) {
        if (str1[i - 1] == str2[j - 1]) {
            out[size++] = str1[--i];
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) out[size++] = str1[--i];
        else out[size++] = str2[--j];
    }
    while (i) out[size++] = str1[--i];
    while (j) out[size++] = str2[--j];
    for (int a = 0, b = size - 1; a < b; a++, b--) {
        char tmp = out[a];
        out[a] = out[b];
        out[b] = tmp;
    }
    out[size] = '\\0';
    for (int r = 0; r <= m; r++) free(dp[r]);
    free(dp);
    return out;
}${CHECK.c}`,
        cpp: `string shortestCommonSupersequence(string str1, string str2) {
    int m = str1.size(), n = str2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = str1[i - 1] == str2[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    int i = m, j = n;
    string out;
    while (i && j) {
        if (str1[i - 1] == str2[j - 1]) {
            out += str1[--i];
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) out += str1[--i];
        else out += str2[--j];
    }
    while (i) out += str1[--i];
    while (j) out += str2[--j];
    reverse(out.begin(), out.end());
    return out;
}${CHECK.cpp}`,
        java: `String shortestCommonSupersequence(String str1, String str2) {
    int m = str1.length(), n = str2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = str1.charAt(i - 1) == str2.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    int i = m, j = n;
    StringBuilder out = new StringBuilder();
    while (i > 0 && j > 0) {
        if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
            out.append(str1.charAt(--i));
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) out.append(str1.charAt(--i));
        else out.append(str2.charAt(--j));
    }
    while (i > 0) out.append(str1.charAt(--i));
    while (j > 0) out.append(str2.charAt(--j));
    return out.reverse().toString();
}${CHECK.java}`,
        javascript: `function shortestCommonSupersequence(str1, str2) {
  const m = str1.length, n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = str1[i - 1] === str2[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  let i = m, j = n;
  const out = [];
  while (i && j) {
    if (str1[i - 1] === str2[j - 1]) {
      out.push(str1[--i]);
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) out.push(str1[--i]);
    else out.push(str2[--j]);
  }
  while (i) out.push(str1[--i]);
  while (j) out.push(str2[--j]);
  return out.reverse().join('');
}${CHECK.javascript}`,
      },
    },
    {
      name: '直接求最短長度並倒推',
      idea: '`dp[i][j]` 直接記兩個前綴的最短共同超序列長度。',
      steps: ['空前綴邊界是另一字的長度。', '字元相同：左上加 1。', '字元不同：上或左的較小值加 1。', '從右下倒推拼出一個最短答案。'],
      figure: { title: 'str1 = "abac", str2 = "cab"', steps: G },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '保存每個前綴配對的最短長度。' },
      verdict: '狀態直接等於題目要最小化的長度。',
      code: {
        python: `def shortestCommonSupersequence(str1, str2):
    m, n = len(str1), len(str2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = 1 + (dp[i - 1][j - 1] if str1[i - 1] == str2[j - 1] else min(dp[i - 1][j], dp[i][j - 1]))
    i, j, out = m, n, []
    while i and j:
        if str1[i - 1] == str2[j - 1]:
            out.append(str1[i - 1])  # 共用一個字元
            i -= 1
            j -= 1
        elif dp[i - 1][j] <= dp[i][j - 1]:
            out.append(str1[i - 1])
            i -= 1
        else:
            out.append(str2[j - 1])
            j -= 1
    out.extend(reversed(str1[:i]))
    out.extend(reversed(str2[:j]))
    return ''.join(reversed(out))${CHECK.python}`,
        c: `char *shortestCommonSupersequence(char *str1, char *str2) {
    int m = strlen(str1), n = strlen(str2);
    int **dp = malloc((m + 1) * sizeof(int *));
    for (int i = 0; i <= m; i++) {
        dp[i] = calloc(n + 1, sizeof(int));
        dp[i][0] = i;
    }
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (str1[i - 1] == str2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = 1 + (dp[i - 1][j] < dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1]);
        }
    }
    char *out = malloc(m + n + 1);
    int i = m, j = n, size = 0;
    while (i && j) {
        if (str1[i - 1] == str2[j - 1]) {
            out[size++] = str1[--i];
            j--;
        } else if (dp[i - 1][j] <= dp[i][j - 1]) out[size++] = str1[--i];
        else out[size++] = str2[--j];
    }
    while (i) out[size++] = str1[--i];
    while (j) out[size++] = str2[--j];
    for (int a = 0, b = size - 1; a < b; a++, b--) {
        char tmp = out[a];
        out[a] = out[b];
        out[b] = tmp;
    }
    out[size] = '\\0';
    for (int r = 0; r <= m; r++) free(dp[r]);
    free(dp);
    return out;
}${CHECK.c}`,
        cpp: `string shortestCommonSupersequence(string str1, string str2) {
    int m = str1.size(), n = str2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = 1 + (str1[i - 1] == str2[j - 1] ? dp[i - 1][j - 1] : min(dp[i - 1][j], dp[i][j - 1]));
        }
    }
    int i = m, j = n;
    string out;
    while (i && j) {
        if (str1[i - 1] == str2[j - 1]) {
            out += str1[--i];
            j--;
        } else if (dp[i - 1][j] <= dp[i][j - 1]) out += str1[--i];
        else out += str2[--j];
    }
    while (i) out += str1[--i];
    while (j) out += str2[--j];
    reverse(out.begin(), out.end());
    return out;
}${CHECK.cpp}`,
        java: `String shortestCommonSupersequence(String str1, String str2) {
    int m = str1.length(), n = str2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = 1 + (str1.charAt(i - 1) == str2.charAt(j - 1) ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j], dp[i][j - 1]));
        }
    }
    int i = m, j = n;
    StringBuilder out = new StringBuilder();
    while (i > 0 && j > 0) {
        if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
            out.append(str1.charAt(--i));
            j--;
        } else if (dp[i - 1][j] <= dp[i][j - 1]) out.append(str1.charAt(--i));
        else out.append(str2.charAt(--j));
    }
    while (i > 0) out.append(str1.charAt(--i));
    while (j > 0) out.append(str2.charAt(--j));
    return out.reverse().toString();
}${CHECK.java}`,
        javascript: `function shortestCommonSupersequence(str1, str2) {
  const m = str1.length, n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = 1 + (str1[i - 1] === str2[j - 1] ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j], dp[i][j - 1]));
    }
  }
  let i = m, j = n;
  const out = [];
  while (i && j) {
    if (str1[i - 1] === str2[j - 1]) {
      out.push(str1[--i]);
      j--;
    } else if (dp[i - 1][j] <= dp[i][j - 1]) out.push(str1[--i]);
    else out.push(str2[--j]);
  }
  while (i) out.push(str1[--i]);
  while (j) out.push(str2[--j]);
  return out.reverse().join('');
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['答案不唯一，不能只比對某一個固定字串。', '重建時一字用完後，另一字剩餘部分要全部補入。'],
  check: { kind: 'fn', fn: 'scsCheck', cases: [
    { args: ['abac', 'cab'], out: 1 }, { args: ['aaaaaaaa', 'aaaaaaaa'], out: 1 },
    { args: ['abc', 'def'], out: 1 }, { args: ['a', 'aa'], out: 1 },
  ] },
}
