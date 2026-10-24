import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 583. Delete Operation for Two Strings
const A = 'sea', B = 'eat'
const lcsFig = [
  { note: '兩字只能刪除；留下的文字必須是兩者的共同子序列。', views: [arr(A.split(''), { label: 'sea' }), arr(B.split(''), { label: 'eat' })] },
  { note: '共同的 e 可以保留，sea 的 s 必須刪掉。', views: [arr(A.split(''), { label: 'sea', dim: [0], highlight: [1] })] },
  { note: '接著共同的 a 也可保留；eat 的 t 必須刪掉。', views: [arr(B.split(''), { label: 'eat', done: [0, 1], dim: [2] })] },
  { note: '最長共同子序列 ea 長 2；總共刪 (3−2)+(3−2)=2 個。', views: [arr(['e', 'a'], { label: '保留下來', done: [0, 1] })] },
]
const delFig = [
  { note: '空字串變成 sea，只能刪 sea 的 3 個字；空字串變成 eat 同理。', views: [arr([0, 1, 2, 3], { label: '第一列或第一欄' })] },
  { note: 's 與 e 不同：刪 s 或刪 e，取較少操作的方向。', views: [arr([2], { label: 'dp[1][1]', highlight: [0] })] },
  { note: '遇到相同的 e、a 時不用刪它們，沿用左上角的成本。', views: [arr(['e', 'a'], { label: '共同保留', done: [0, 1] })] },
  { note: '最後 dp[3][3] = 2，分別刪掉 s 與 t。', views: [arr([2], { label: '最少刪除', done: [0] })] },
]

export const q0583: Solution = {
  id: 583,
  plain: '兩個單字只能刪字母，想讓它們變成一樣，問最少要刪幾個。',
  statement: '給 `word1`、`word2`，一次操作從任一字串刪除一個字元。求讓兩字相同所需的最少刪除次數。',
  examples: [{ input: 'word1 = "sea", word2 = "eat"', output: '2' }, { input: 'word1 = "leetcode", word2 = "etco"', output: '4' }],
  constraints: ['兩字長度各最多 500；可用 O(mn) DP。'],
  insight: ['要留下的文字是共同子序列；留得越長，刪得越少，這是 [[p:lcs]]。', '也能直接令狀態表示兩個前綴變相同所需的最少刪除。'],
  approaches: [
    {
      name: '最長共同子序列',
      idea: '求 LCS 長度 L，再從兩個字串各刪掉不屬於 LCS 的字元。',
      steps: ['建立 (m+1)×(n+1) 的 LCS 表。', '字元相同就取左上角加一；否則取上或左的較大值。', '回傳 `m+n−2L`。'],
      figure: { title: 'word1 = "sea", word2 = "eat"', steps: lcsFig },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每對字元只計算一次。' },
      verdict: '與 [1143](#/q/1143) 觀念直接相連。',
      code: {
        python: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # 共同保留
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return m + n - 2 * dp[m][n]`,
        c: `int minDistance(char *word1, char *word2) {
    int m = strlen(word1), n = strlen(word2);
    int **dp = malloc((m + 1) * sizeof(int *));
    for (int i = 0; i <= m; i++) dp[i] = calloc(n + 1, sizeof(int));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
        }
    }
    int answer = m + n - 2 * dp[m][n];
    for (int i = 0; i <= m; i++) free(dp[i]);
    free(dp);
    return answer;
}`,
        cpp: `int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return m + n - 2 * dp[m][n];
}`,
        java: `int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return m + n - 2 * dp[m][n];
}`,
        javascript: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return m + n - 2 * dp[m][n];
}`,
      },
    },
    {
      name: '直接計算刪除成本',
      idea: '`dp[i][j]` 是 word1 前 i 字和 word2 前 j 字變相同的最少刪除數。',
      steps: ['空前綴與另一字的成本就是另一字長度。', '末字相同時沿用左上。', '末字不同時刪其中一邊，成本為 `1+min(上,左)`。'],
      figure: { title: 'word1 = "sea", word2 = "eat"', steps: delFig },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每個前綴配對計算一次。' },
      verdict: '直接求題目要求的數值，不必額外套公式。',
      code: {
        python: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]  # 相同字元保留
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
        c: `int minDistance(char *word1, char *word2) {
    int m = strlen(word1), n = strlen(word2);
    int **dp = malloc((m + 1) * sizeof(int *));
    for (int i = 0; i <= m; i++) {
        dp[i] = calloc(n + 1, sizeof(int));
        dp[i][0] = i;
    }
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + (dp[i - 1][j] < dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1]);
        }
    }
    int answer = dp[m][n];
    for (int i = 0; i <= m; i++) free(dp[i]);
    free(dp);
    return answer;
}`,
        cpp: `int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}`,
        java: `int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}`,
        javascript: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
      },
    },
  ],
  pitfalls: ['只能刪除，不能替換；字元不同時不能用左上角加一。', '兩個字串都可以刪，所以 LCS 公式要減兩倍。'],
  check: { kind: 'fn', fn: 'minDistance', cases: [
    { args: [A, B], out: 2 }, { args: ['leetcode', 'etco'], out: 4 },
    { args: ['', 'abc'], out: 3 }, { args: ['abc', 'abc'], out: 0 },
  ] },
}
