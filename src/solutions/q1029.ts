import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1029. Two City Scheduling

const C = [[10, 20], [30, 200], [400, 50], [30, 20]]

function sortFig(): FigStep[] {
  const diff = C.map(([a, b]) => a - b)
  return [
    { note: '2n 個人,一半飛 A、一半飛 B。先假設**全部飛 B**,再挑 n 個人「改飛 A」;改飛 A 的成本變化是 a − b', views: [arr(C.map(([a, b]) => `${a}/${b}`), { label: 'A 費用 / B 費用' }), arr(diff, { label: 'a − b' })] },
    { note: '要讓總成本最小 → 挑 a − b 最小的 n 個人改飛 A。依 a − b 排序:−170、−10、10、350', views: [arr([-170, -10, 10, 350], { label: '排序後的 a − b', highlight: [0, 1] })] },
    { note: '前一半飛 A:30 + 10;後一半飛 B:20 + 50。總和 110', views: [arr(['30(A)', '10(A)', '20(B)', '50(B)'], { label: '安排', done: [0, 1, 2, 3] }), arr([110], { label: '答案', done: [0] })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: 'DP:`dp[i][j]` = 前 i 個人裡有 j 個飛 A 的最小成本。第 i 個人要嘛飛 A(j − 1 → j),要嘛飛 B(j 不變,但 B 的人數 i − j 不能超過 n)', views: [arr(C.map(([a, b]) => `${a}/${b}`), { label: 'A / B' })] },
    { note: '答案 `dp[2n][n]`。O(n²),比排序慢,但當題目改成「A 至少 / 至多 k 人」之類的限制時很好擴充', views: [arr([110], { label: 'dp[4][2]', done: [0] })] },
  ]
}

export const q1029: Solution = {
  id: 1029,
  plain: '公司要讓 2n 個人去面試,一半去 A 城、一半去 B 城。每個人飛 A、飛 B 的機票價格不同。怎麼分配總花費最少?',
  statement: '`costs[i] = [aCost, bCost]` 是第 i 人飛往 A、B 的費用。共 2n 人,必須**恰好 n 人**飛往每個城市。回傳最小總費用。',
  examples: [
    { input: 'costs = [[10,20],[30,200],[400,50],[30,20]]', output: '110', note: '第 1、2 人飛 A,第 3、4 人飛 B' },
    { input: 'costs = [[259,770],[448,54],[926,667],[184,139],[840,118],[577,469]]', output: '1859' },
  ],
  constraints: ['2n ≤ 100'],
  insight: ['先全部飛 B,總成本固定;每讓一個人改飛 A,成本變化是 a − b', '要挑 n 個人改飛 A → 挑 a − b 最小的 n 個', '[[p:greedy]]:按 a − b 排序,前一半 A、後一半 B'],
  approaches: [
    {
      name: '依 a − b 排序',
      idea: '`costs.sort(key = a − b)`;前 n 個加 a,後 n 個加 b。',
      steps: ['依 `a − b` 由小到大排序', '前 n 人飛 A,加 a', '後 n 人飛 B,加 b'],
      figure: { title: 'costs = [[10,20],[30,200],[400,50],[30,20]]', steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '排序。' },
      verdict: '最推薦。換個角度看「代價差」是很多分配題的關鍵。',
      code: {
        python: `def twoCitySchedCost(costs):
    costs.sort(key=lambda c: c[0] - c[1])     # 越想去 A 的排越前面
    n = len(costs) // 2
    return sum(c[0] for c in costs[:n]) + sum(c[1] for c in costs[n:])`,
        c: `static int cmp(const void *x, const void *y) {
    int *a = *(int **)x, *b = *(int **)y;
    return (a[0] - a[1]) - (b[0] - b[1]);
}

int twoCitySchedCost(int **costs, int costsSize, int *costsColSize) {
    qsort(costs, costsSize, sizeof(int *), cmp);
    int n = costsSize / 2, total = 0;
    for (int i = 0; i < costsSize; i++) total += i < n ? costs[i][0] : costs[i][1];
    return total;
}`,
        cpp: `int twoCitySchedCost(vector<vector<int>>& costs) {
    sort(costs.begin(), costs.end(), [](auto &a, auto &b) { return a[0] - a[1] < b[0] - b[1]; });
    int n = costs.size() / 2, total = 0;
    for (int i = 0; i < 2 * n; i++) total += i < n ? costs[i][0] : costs[i][1];
    return total;
}`,
        java: `int twoCitySchedCost(int[][] costs) {
    Arrays.sort(costs, (a, b) -> (a[0] - a[1]) - (b[0] - b[1]));
    int n = costs.length / 2, total = 0;
    for (int i = 0; i < 2 * n; i++) total += i < n ? costs[i][0] : costs[i][1];
    return total;
}`,
        javascript: `function twoCitySchedCost(costs) {
  costs.sort((a, b) => a[0] - a[1] - (b[0] - b[1]));
  const n = costs.length / 2;
  let total = 0;
  for (let i = 0; i < 2 * n; i++) total += i < n ? costs[i][0] : costs[i][1];
  return total;
}`,
      },
    },
    {
      name: 'DP:前 i 人中 j 人飛 A',
      idea: '`dp[i][j]` = 前 i 人、其中 j 人飛 A 的最小成本;`dp[i][j] = min(dp[i−1][j−1] + a, dp[i−1][j] + b)`。',
      steps: ['`dp[0][0] = 0`,其餘 ∞', '`for i in 1..2n`、`for j in 0..min(i, n)`', '飛 A:`dp[i−1][j−1] + a`;飛 B(`i − j ≤ n`):`dp[i−1][j] + b`', '回傳 `dp[2n][n]`'],
      figure: { title: 'costs = [[10,20],[30,200],[400,50],[30,20]]', steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '2n × (n + 1) 個狀態。' },
      verdict: '不需要想出排序的證明;限制條件變複雜時更通用。',
      code: {
        python: `def twoCitySchedCost(costs):
    m = len(costs)
    n = m // 2
    INF = float('inf')
    dp = [[INF] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = 0
    for i in range(1, m + 1):
        a, b = costs[i - 1]
        for j in range(0, min(i, n) + 1):
            if j > 0:
                dp[i][j] = dp[i - 1][j - 1] + a       # 第 i 人飛 A
            if i - j <= n:
                dp[i][j] = min(dp[i][j], dp[i - 1][j] + b)   # 飛 B
    return dp[m][n]`,
        c: `int twoCitySchedCost(int **costs, int costsSize, int *costsColSize) {
    int m = costsSize, n = m / 2;
    int dp[101][51];
    for (int i = 0; i <= m; i++) for (int j = 0; j <= n; j++) dp[i][j] = INT_MAX / 2;
    dp[0][0] = 0;
    for (int i = 1; i <= m; i++) {
        int a = costs[i - 1][0], b = costs[i - 1][1];
        for (int j = 0; j <= n && j <= i; j++) {
            if (j > 0 && dp[i - 1][j - 1] + a < dp[i][j]) dp[i][j] = dp[i - 1][j - 1] + a;
            if (i - j <= n && dp[i - 1][j] + b < dp[i][j]) dp[i][j] = dp[i - 1][j] + b;
        }
    }
    return dp[m][n];
}`,
        cpp: `int twoCitySchedCost(vector<vector<int>>& costs) {
    int m = costs.size(), n = m / 2;
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, INT_MAX / 2));
    dp[0][0] = 0;
    for (int i = 1; i <= m; i++) {
        int a = costs[i - 1][0], b = costs[i - 1][1];
        for (int j = 0; j <= min(i, n); j++) {
            if (j > 0) dp[i][j] = min(dp[i][j], dp[i - 1][j - 1] + a);
            if (i - j <= n) dp[i][j] = min(dp[i][j], dp[i - 1][j] + b);
        }
    }
    return dp[m][n];
}`,
        java: `int twoCitySchedCost(int[][] costs) {
    int m = costs.length, n = m / 2;
    int[][] dp = new int[m + 1][n + 1];
    for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2);
    dp[0][0] = 0;
    for (int i = 1; i <= m; i++) {
        int a = costs[i - 1][0], b = costs[i - 1][1];
        for (int j = 0; j <= Math.min(i, n); j++) {
            if (j > 0) dp[i][j] = Math.min(dp[i][j], dp[i - 1][j - 1] + a);
            if (i - j <= n) dp[i][j] = Math.min(dp[i][j], dp[i - 1][j] + b);
        }
    }
    return dp[m][n];
}`,
        javascript: `function twoCitySchedCost(costs) {
  const m = costs.length, n = m / 2;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(Infinity));
  dp[0][0] = 0;
  for (let i = 1; i <= m; i++) {
    const [a, b] = costs[i - 1];
    for (let j = 0; j <= Math.min(i, n); j++) {
      if (j > 0) dp[i][j] = Math.min(dp[i][j], dp[i - 1][j - 1] + a);
      if (i - j <= n) dp[i][j] = Math.min(dp[i][j], dp[i - 1][j] + b);
    }
  }
  return dp[m][n];
}`,
      },
    },
  ],
  pitfalls: ['每個人各自挑便宜的城市:兩邊人數可能不平均', '依 a 或 b 單獨排序:要看的是「差價」'],
  check: {
    kind: 'fn',
    fn: 'twoCitySchedCost',
    cases: [
      { args: [C], out: 110 },
      { args: [[[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]]], out: 1859 },
      { args: [[[515, 563], [451, 713], [537, 709], [343, 819], [855, 779], [457, 60], [650, 359], [631, 42]]], out: 3086 },
      { args: [[[1, 2], [3, 4]]], out: 5 },
    ],
  },
}
