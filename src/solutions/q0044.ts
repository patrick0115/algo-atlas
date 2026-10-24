import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

function dpFig(): FigStep[] {
  return [
    { note: 's="adceb"、p="*a*b"。dp[i][j] 表示 s 前 i 個字元是否符合 p 前 j 個字元；空字串能被開頭的 * 匹配。', views: [arr(['', '*', 'a', '*', 'b'], { label: '模式前綴', highlight: [0, 1] })] },
    { note: '第一個 * 可匹配空字串，接著 a 對上 s 的 a，所以 dp[1][2]=真。', views: [kv([['s 前綴', 'a'], ['p 前綴', '*a'], ['匹配', '是']], '狀態')] },
    { note: '第二個 * 吞掉 d、c、e；每次可「多吞一字」或「停在原地」。', views: [kv([['s 前綴', 'adce'], ['p 前綴', '*a*'], ['匹配', '是']], '狀態')] },
    { note: '最後 b 對上 b，dp[5][4]=真，整串匹配。', views: [kv([['s', 'adceb'], ['p', '*a*b'], ['結果', 'true']], '完成')] },
  ]
}

function greedyFig(): FigStep[] {
  return [
    { note: 's="adceb"、p="*a*b"。遇第一個 *，先假設它匹配空字串，記住星號位置與目前字串位置。', views: [arr(['*', 'a', '*', 'b'], { label: 'p', highlight: [0] })] },
    { note: 'a 對上 a。下一個 * 先匹配空字串，但模式的 b 對不上字串的 d。', views: [kv([['已匹配', 'a'], ['下一個 s', 'd'], ['下一個 p', 'b']], '暫時失配')] },
    { note: '回到最近的 *，讓它多吞一字；b 仍對不上 c、e，就繼續讓 * 吞。', views: [kv([['* 吞掉', 'dce'], ['尚未匹配', 'b']], '擴大星號')] },
    { note: '最後 b 對上 b，字串和模式都走完，回傳 true。', views: [kv([['s', 'adceb'], ['p', '*a*b'], ['結果', 'true']], '完成')] },
  ]
}

export const q0044: Solution = {
  id: 44,
  plain: '用帶有萬用字元的模式比對整個字串：? 代替一個字元，* 可以代替任意長度，包含零個。',
  statement: '給字串 s 和模式 p，判斷 p 是否能匹配**整個** s。`?` 匹配任一單字元；`*` 匹配任意字元序列（可為空）。',
  examples: [{ input: 's = "aa", p = "a"', output: 'false' }, { input: 's = "aa", p = "*"', output: 'true' }, { input: 's = "adceb", p = "*a*b"', output: 'true' }, { input: 's = "acdcb", p = "a*c?b"', output: 'false' }],
  constraints: ['`0 ≤ s.length, p.length ≤ 2000`', 's 只有小寫英文字母；p 另可包含 `?`、`*`。'],
  insight: ['遇一般字元或 `?`，只需比較目前一格；困難在 `*` 可以吃 0、1、2… 個字元。', '[[p:dp-general]] 可列舉所有前綴狀態；貪心法則記住最近的 `*`，失配時讓它多吃一個字元再試。'],
  approaches: [
    {
      name: '二維動態規劃',
      idea: '`dp[i][j]` 代表 s 前 i 個字元與 p 前 j 個字元能否匹配。星號可不吃字元或多吃一字。',
      steps: ['設 `dp[0][0]=true`。', '一般字元或 ?：看左上角 `dp[i−1][j−1]`。', '*：看左邊 `dp[i][j−1]`（吃零個）或上面 `dp[i−1][j]`（多吃一個）。', '回傳右下角。'],
      figure: { title: 's = "adceb", p = "*a*b"', steps: dpFig() },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: 'm、n 分別是字串與模式長度，每格狀態只算一次。' },
      verdict: '轉移清楚，適合先建立正確性。',
      code: {
        python: `def isMatch(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 1]  # * 可以吃零字元
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i][j - 1] or dp[i - 1][j]
            elif p[j - 1] == '?' or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]`,
        c: `bool isMatch(char *s, char *p) {
    int m = strlen(s);
    int n = strlen(p);
    int width = n + 1;
    bool *dp = calloc((m + 1) * width, sizeof(bool));
    dp[0] = true;
    for (int j = 1; j <= n; j++) {
        if (p[j - 1] == '*') {
            dp[j] = dp[j - 1];
        }
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p[j - 1] == '*') {
                dp[i * width + j] = dp[i * width + j - 1] || dp[(i - 1) * width + j];
            } else if (p[j - 1] == '?' || p[j - 1] == s[i - 1]) {
                dp[i * width + j] = dp[(i - 1) * width + j - 1];
            }
        }
    }
    bool answer = dp[m * width + n];
    free(dp);
    return answer;
}`,
        cpp: `bool isMatch(string s, string p) {
    int m = s.size();
    int n = p.size();
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;
    for (int j = 1; j <= n; j++) {
        if (p[j - 1] == '*') {
            dp[0][j] = dp[0][j - 1];
        }
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p[j - 1] == '*') {
                dp[i][j] = dp[i][j - 1] || dp[i - 1][j];
            } else if (p[j - 1] == '?' || p[j - 1] == s[i - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
        java: `boolean isMatch(String s, String p) {
    int m = s.length();
    int n = p.length();
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    for (int j = 1; j <= n; j++) {
        if (p.charAt(j - 1) == '*') {
            dp[0][j] = dp[0][j - 1];
        }
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            char ch = p.charAt(j - 1);
            if (ch == '*') {
                dp[i][j] = dp[i][j - 1] || dp[i - 1][j];
            } else if (ch == '?' || ch == s.charAt(i - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
        javascript: `function isMatch(s, p) {
  const m = s.length;
  const n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 1];
    }
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 1] || dp[i - 1][j];
      } else if (p[j - 1] === '?' || p[j - 1] === s[i - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
}`,
      },
    },
    {
      name: '記住最近星號的貪心比對',
      idea: '先讓 `*` 吃零字元；失配時回到最近的星號，增加它吞掉的字元數。',
      steps: ['雙指標 i、j 掃 s、p，記最近星號位置 star 與它開始吞的 s 位置 match。', '字元相同或 ? 時兩指標都前進；遇 * 時記位置，模式先前進。', '失配但有星號時，讓星號多吞一個字元，從其後的模式重試。', '字串走完後，模式剩下的只能是 *。'],
      figure: { title: 's = "adceb", p = "*a*b"', steps: greedyFig() },
      complexity: { time: 'O(mn) 最壞', space: 'O(1)', why: '失配可能多次重試星號後的模式；只用固定數量的指標。' },
      verdict: '不建表，常見輸入很快；星號回退位置是關鍵。',
      code: {
        python: `def isMatch(s, p):
    i = j = 0
    star = -1
    match = 0
    while i < len(s):
        if j < len(p) and (p[j] == '?' or p[j] == s[i]):
            i += 1
            j += 1
        elif j < len(p) and p[j] == '*':
            star = j
            match = i
            j += 1  # 先讓 * 吃零字元
        elif star != -1:
            match += 1  # 讓最近的 * 多吞一字
            i = match
            j = star + 1
        else:
            return False
    return all(ch == '*' for ch in p[j:])`,
        c: `bool isMatch(char *s, char *p) {
    int m = strlen(s);
    int n = strlen(p);
    int i = 0;
    int j = 0;
    int star = -1;
    int match = 0;
    while (i < m) {
        if (j < n && (p[j] == '?' || p[j] == s[i])) {
            i++;
            j++;
        } else if (j < n && p[j] == '*') {
            star = j++;
            match = i;
        } else if (star != -1) {
            i = ++match;
            j = star + 1;
        } else {
            return false;
        }
    }
    while (j < n && p[j] == '*') {
        j++;
    }
    return j == n;
}`,
        cpp: `bool isMatch(string s, string p) {
    int i = 0;
    int j = 0;
    int star = -1;
    int match = 0;
    while (i < (int)s.size()) {
        if (j < (int)p.size() && (p[j] == '?' || p[j] == s[i])) {
            i++;
            j++;
        } else if (j < (int)p.size() && p[j] == '*') {
            star = j++;
            match = i;
        } else if (star != -1) {
            i = ++match;
            j = star + 1;
        } else {
            return false;
        }
    }
    while (j < (int)p.size() && p[j] == '*') {
        j++;
    }
    return j == (int)p.size();
}`,
        java: `boolean isMatch(String s, String p) {
    int i = 0;
    int j = 0;
    int star = -1;
    int match = 0;
    while (i < s.length()) {
        if (j < p.length() && (p.charAt(j) == '?' || p.charAt(j) == s.charAt(i))) {
            i++;
            j++;
        } else if (j < p.length() && p.charAt(j) == '*') {
            star = j++;
            match = i;
        } else if (star != -1) {
            i = ++match;
            j = star + 1;
        } else {
            return false;
        }
    }
    while (j < p.length() && p.charAt(j) == '*') {
        j++;
    }
    return j == p.length();
}`,
        javascript: `function isMatch(s, p) {
  let i = 0;
  let j = 0;
  let star = -1;
  let match = 0;
  while (i < s.length) {
    if (j < p.length && (p[j] === '?' || p[j] === s[i])) {
      i++;
      j++;
    } else if (j < p.length && p[j] === '*') {
      star = j++;
      match = i;
    } else if (star !== -1) {
      i = ++match;
      j = star + 1;
    } else {
      return false;
    }
  }
  while (j < p.length && p[j] === '*') {
    j++;
  }
  return j === p.length;
}`,
      },
    },
  ],
  pitfalls: ['`*` 可匹配空字串，所以空 s 也可能與一串星號匹配。', '必須匹配整個 s；只對上前綴不算成功。'],
  check: { kind: 'fn', fn: 'isMatch', cases: [{ args: ['aa', 'a'], out: false }, { args: ['aa', '*'], out: true }, { args: ['adceb', '*a*b'], out: true }, { args: ['acdcb', 'a*c?b'], out: false }, { args: ['', '***'], out: true }, { args: ['abc', 'a?c'], out: true }] },
}
