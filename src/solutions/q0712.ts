import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

function tableFig(): FigStep[] {
  return [
    { note: '以 dp[i][j] 表示把前 i 個 s1 與前 j 個 s2 變相同的最小刪除 ASCII 總和。', views: [arr([0, 115, 216, 313], { label: 's1 = sea 對空字串的成本' })] },
    { note: '空字串對 eat 的成本依序是 0、101、198、314；只能把 eat 的字元逐個刪掉。', views: [arr([0, 101, 198, 314], { label: '空字串對 s2 = eat 的成本' })] },
    { note: '比較 sea 與 ea：末尾 a 相同，可沿用比較 se 與 e 的成本 115，也就是只刪掉 s。', views: [arr([115], { label: 'dp[3][2]', done: [0] })] },
    { note: '再比較 sea 與 eat：a 與 t 不同，刪 a 或刪 t 擇較小；115 + 116 = 231。', views: [arr([231], { label: 'dp[3][3] 答案', done: [0] })] },
  ]
}

function rollingFig(): FigStep[] {
  return [
    { note: '每一列只會用到上一列與目前列的左一格，所以可用一維陣列。', views: [arr([0, 101, 198, 314], { label: '空字串這一列' })] },
    { note: '處理 s 後，與空字串的成本為 115；對 e、ea、eat 逐格更新。', views: [arr([115, 216, 313, 429], { label: '讀完 s' })] },
    { note: '處理 e 後，e 與 e 可直接配對；與 eat 比較時還需刪 a、t，這一列變成 216、115、212、328。', views: [arr([216, 115, 212, 328], { label: '讀完 se' })] },
    { note: '處理 a 後，配對 ea 中的 a，最後一格為 231；此時整個一維陣列代表 sea 的結果。', views: [arr([313, 212, 115, 231], { label: '讀完 sea', done: [3] })] },
  ]
}

export const q0712: Solution = {
  id: 712,
  plain: '兩個字串各自刪掉一些字元，直到剩下的字串一樣；每刪一個字元付出它的 ASCII 值，求最低總花費。',
  statement: '給 s1、s2，可從任一字串刪字元。刪除字元的成本是其 ASCII 值；回傳使兩字串相同的最小成本。',
  examples: [
    { input: 's1 = "sea", s2 = "eat"', output: '231', note: '刪 s（115）及 t（116）。' },
    { input: 's1 = "delete", s2 = "leet"', output: '403' },
  ],
  constraints: ['兩字串長度各為 1 到 1000，只含小寫英文字母。'],
  insight: ['看最後一個字元：若相同，就保留兩者；若不同，至少要刪掉其中一個。', '這個選擇只依賴更短前綴的答案，適合用 [[p:lcs]] 類型的動態規劃。'],
  approaches: [
    {
      name: '二維動態規劃',
      idea: 'dp[i][j] 記錄 s1 前 i 字元與 s2 前 j 字元的最低成本。',
      steps: ['空字串的邊界成本等於另一字串前綴的 ASCII 總和。', '末尾相同時沿用 dp[i−1][j−1]。', '末尾不同時比較刪 s1[i−1] 與刪 s2[j−1] 的成本。'],
      figure: { title: 's1 = sea，s2 = eat', steps: tableFig() },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每對前綴計算一格，完整保留表格。' },
      verdict: '狀態最直觀，適合先學會轉移式。',
      code: {
        python: `def minimumDeleteSum(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        dp[i][0] = dp[i - 1][0] + ord(s1[i - 1])
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j - 1] + ord(s2[j - 1])
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]  # 相同字元都留下
            else:
                delete_first = dp[i - 1][j] + ord(s1[i - 1])
                delete_second = dp[i][j - 1] + ord(s2[j - 1])
                dp[i][j] = min(delete_first, delete_second)
    return dp[m][n]`,
        c: `int minimumDeleteSum(char *s1, char *s2) {
    int m = strlen(s1), n = strlen(s2);
    int *dp = calloc((m + 1) * (n + 1), sizeof(int));
    for (int i = 1; i <= m; i++) {
        dp[i * (n + 1)] = dp[(i - 1) * (n + 1)] + s1[i - 1];
    }
    for (int j = 1; j <= n; j++) {
        dp[j] = dp[j - 1] + s2[j - 1];
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            int index = i * (n + 1) + j;
            if (s1[i - 1] == s2[j - 1]) {
                dp[index] = dp[(i - 1) * (n + 1) + j - 1];
            } else {
                int first = dp[(i - 1) * (n + 1) + j] + s1[i - 1];
                int second = dp[index - 1] + s2[j - 1];
                dp[index] = first < second ? first : second;
            }
        }
    }
    int answer = dp[m * (n + 1) + n];
    free(dp);
    return answer;
}`,
        cpp: `int minimumDeleteSum(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        dp[i][0] = dp[i - 1][0] + s1[i - 1];
    }
    for (int j = 1; j <= n; j++) {
        dp[0][j] = dp[0][j - 1] + s2[j - 1];
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i - 1] == s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = min(dp[i - 1][j] + s1[i - 1], dp[i][j - 1] + s2[j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
        java: `int minimumDeleteSum(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        dp[i][0] = dp[i - 1][0] + s1.charAt(i - 1);
    }
    for (int j = 1; j <= n; j++) {
        dp[0][j] = dp[0][j - 1] + s2.charAt(j - 1);
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                int first = dp[i - 1][j] + s1.charAt(i - 1);
                int second = dp[i][j - 1] + s2.charAt(j - 1);
                dp[i][j] = Math.min(first, second);
            }
        }
    }
    return dp[m][n];
}`,
        javascript: `function minimumDeleteSum(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    dp[i][0] = dp[i - 1][0] + s1.charCodeAt(i - 1);
  }
  for (let j = 1; j <= n; j++) {
    dp[0][j] = dp[0][j - 1] + s2.charCodeAt(j - 1);
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const first = dp[i - 1][j] + s1.charCodeAt(i - 1);
        const second = dp[i][j - 1] + s2.charCodeAt(j - 1);
        dp[i][j] = Math.min(first, second);
      }
    }
  }
  return dp[m][n];
}`,
      },
    },
    {
      name: '一維動態規劃',
      idea: '計算新的一列時，只保留上一列；另外保存被覆蓋前的左上角。',
      steps: ['一維 dp 先填入空 s1 對 s2 各前綴的成本。', '開始每列時更新 dp[0]，並將更新前的值存為左上角。', '由左到右更新各格；覆蓋前先暫存原 dp[j] 供下一格使用。'],
      figure: { title: '逐列更新 sea 對 eat', steps: rollingFig() },
      complexity: { time: 'O(mn)', space: 'O(n)', why: '每格仍算一次，但只儲存 s2 長度的一列。' },
      verdict: '在理解二維表格後，能節省大量記憶體。',
      code: {
        python: `def minimumDeleteSum(s1, s2):
    dp = [0] * (len(s2) + 1)
    for j in range(1, len(s2) + 1):
        dp[j] = dp[j - 1] + ord(s2[j - 1])
    for first in s1:
        diagonal = dp[0]             # 覆蓋前的左上角
        dp[0] += ord(first)
        for j, second in enumerate(s2, 1):
            above = dp[j]            # 留給下一格當左上角
            if first == second:
                dp[j] = diagonal
            else:
                dp[j] = min(above + ord(first), dp[j - 1] + ord(second))
            diagonal = above
    return dp[-1]`,
        c: `int minimumDeleteSum(char *s1, char *s2) {
    int m = strlen(s1), n = strlen(s2);
    int *dp = calloc(n + 1, sizeof(int));
    for (int j = 1; j <= n; j++) {
        dp[j] = dp[j - 1] + s2[j - 1];
    }
    for (int i = 1; i <= m; i++) {
        int diagonal = dp[0];
        dp[0] += s1[i - 1];
        for (int j = 1; j <= n; j++) {
            int above = dp[j];
            if (s1[i - 1] == s2[j - 1]) {
                dp[j] = diagonal;
            } else {
                int first = above + s1[i - 1];
                int second = dp[j - 1] + s2[j - 1];
                dp[j] = first < second ? first : second;
            }
            diagonal = above;
        }
    }
    int answer = dp[n];
    free(dp);
    return answer;
}`,
        cpp: `int minimumDeleteSum(string s1, string s2) {
    vector<int> dp(s2.size() + 1, 0);
    for (int j = 1; j <= (int)s2.size(); j++) {
        dp[j] = dp[j - 1] + s2[j - 1];
    }
    for (char first : s1) {
        int diagonal = dp[0];
        dp[0] += first;
        for (int j = 1; j <= (int)s2.size(); j++) {
            int above = dp[j];
            if (first == s2[j - 1]) {
                dp[j] = diagonal;
            } else {
                dp[j] = min(above + first, dp[j - 1] + s2[j - 1]);
            }
            diagonal = above;
        }
    }
    return dp.back();
}`,
        java: `int minimumDeleteSum(String s1, String s2) {
    int[] dp = new int[s2.length() + 1];
    for (int j = 1; j <= s2.length(); j++) {
        dp[j] = dp[j - 1] + s2.charAt(j - 1);
    }
    for (int i = 1; i <= s1.length(); i++) {
        int first = s1.charAt(i - 1);
        int diagonal = dp[0];
        dp[0] += first;
        for (int j = 1; j <= s2.length(); j++) {
            int above = dp[j];
            int second = s2.charAt(j - 1);
            if (first == second) {
                dp[j] = diagonal;
            } else {
                dp[j] = Math.min(above + first, dp[j - 1] + second);
            }
            diagonal = above;
        }
    }
    return dp[s2.length()];
}`,
        javascript: `function minimumDeleteSum(s1, s2) {
  const dp = new Array(s2.length + 1).fill(0);
  for (let j = 1; j <= s2.length; j++) {
    dp[j] = dp[j - 1] + s2.charCodeAt(j - 1);
  }
  for (const first of s1) {
    let diagonal = dp[0];
    const firstCode = first.charCodeAt(0);
    dp[0] += firstCode;
    for (let j = 1; j <= s2.length; j++) {
      const above = dp[j];
      const secondCode = s2.charCodeAt(j - 1);
      if (firstCode === secondCode) {
        dp[j] = diagonal;
      } else {
        dp[j] = Math.min(above + firstCode, dp[j - 1] + secondCode);
      }
      diagonal = above;
    }
  }
  return dp[s2.length];
}`,
      },
    },
  ],
  pitfalls: ['配對相同末尾字元時無須刪它們。', 'ASCII 成本是字元碼，不是刪掉的字元數。', '一維版本更新時要先保存被覆蓋的上一列值。'],
  check: {
    kind: 'fn',
    fn: 'minimumDeleteSum',
    cases: [
      { args: ['sea', 'eat'], out: 231 },
      { args: ['delete', 'leet'], out: 403 },
      { args: ['a', 'a'], out: 0 },
      { args: ['a', 'b'], out: 195 },
    ],
  },
}
