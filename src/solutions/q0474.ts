import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 474. Ones and Zeroes
const WORDS = ['10', '0001', '111001', '1', '0']

function tableFig(): FigStep[] {
  const dp = Array.from({ length: 6 }, () => Array(4).fill(0) as number[])
  for (const s of WORDS) {
    const zeros = [...s].filter((c) => c === '0').length
    const ones = s.length - zeros
    for (let z = 5; z >= zeros; z--)
      for (let o = 3; o >= ones; o--)
        dp[z][o] = Math.max(dp[z][o], dp[z - zeros][o - ones] + 1)
  }
  const view: GridViewData = { kind: 'grid', label: 'dp[可用 0][可用 1]', cells: dp, rowLabels: ['0', '1', '2', '3', '4', '5'], colLabels: ['0', '1', '2', '3'], marks: { done: [[5, 3]] } }
  return [
    { note: '每個字串像一個物品,消耗一定數量的 0 和 1,價值都是 1。要挑最多字串。', views: [arr(WORDS, { label: '字串' }), arr([5, 3], { label: '0 / 1 配額' })] },
    { note: 'dp[z][o] 是配額為 z 個 0、o 個 1 時最多可挑幾個。選一個字串就從剩餘配額的答案加 1。', views: [view] },
    { note: '每個字串只能選一次,兩個配額都由大到小更新。答案為 4。', views: [arr(['10', '0001', '1', '0'], { label: '一種最佳選法' }), arr([4], { label: '答案', done: [0] })] },
  ]
}

const memoFig: FigStep[] = [
  { note: '從第 i 個字串開始,狀態是剩餘 0、1 配額。每個字串做「不選」或「可選時選」兩個決定。', views: [arr(WORDS, { label: '依序決定' })] },
  { note: '同一個 (i, z, o) 只算一次,回傳兩個選項中較大的個數。', views: [arr([4], { label: '答案', done: [0] })] },
]

export const q0474: Solution = {
  id: 474,
  plain: '有一堆只含 0 和 1 的字串,背包分別只能裝 m 個 0、n 個 1。每拿一個字串就耗掉它含的 0 和 1,想拿最多個。',
  statement: '給二進位字串陣列 strs,以及 0 的上限 m、1 的上限 n,求最多能選幾個字串,使選到的字元總數都不超過各自上限。',
  examples: [
    { input: 'strs = ["10","0001","111001","1","0"], m = 5, n = 3', output: '4' },
    { input: 'strs = ["10","0","1"], m = 1, n = 1', output: '2' },
  ],
  constraints: ['strs 最多 600 個,m、n 最多 100', '每個字串只含 0 和 1,且只能選一次'],
  insight: ['每個字串有兩種成本:0 的個數和 1 的個數;價值固定為 1。', '這是兩個容量的 [[p:knapsack]]。', '原地更新時 z 和 o 都要倒著走,避免同一個字串重複選。'],
  approaches: [
    {
      name: '二維 0/1 背包',
      idea: 'dp[z][o] 記錄在兩種配額內最多可選幾個字串;每個字串最多加入一次。',
      steps: ['建立 (m+1) × (n+1) 的零表', '對每個字串計算 zeros、ones', 'z 從 m 下降到 zeros,o 從 n 下降到 ones', '更新 dp[z][o] = max(原值,dp[z−zeros][o−ones]+1)'],
      figure: { title: 'm = 5,n = 3', steps: tableFig() },
      complexity: { time: 'O(L · m · n + 字串總長)', space: 'O(m · n)', why: 'L 個字串,每個字串掃描容量表一次。' },
      verdict: '推薦,與一般 0/1 背包相同,只是容量有兩個維度。',
      code: {
        python: `def findMaxForm(strs, m, n):
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for s in strs:
        zeros = s.count('0')
        ones = len(s) - zeros
        for z in range(m, zeros - 1, -1):
            for o in range(n, ones - 1, -1):
                dp[z][o] = max(dp[z][o], dp[z - zeros][o - ones] + 1)
    return dp[m][n]`,
        c: `int findMaxForm(char **strs, int strsSize, int m, int n) {
    int C = n + 1;
    int *dp = calloc((m + 1) * C, sizeof(int));
    for (int i = 0; i < strsSize; i++) {
        int zeros = 0, ones = 0;
        for (char *p = strs[i]; *p; p++) if (*p == '0') zeros++; else ones++;
        for (int z = m; z >= zeros; z--)
            for (int o = n; o >= ones; o--) {
                int v = dp[(z - zeros) * C + o - ones] + 1;
                if (v > dp[z * C + o]) dp[z * C + o] = v;
            }
    }
    int ans = dp[m * C + n];
    free(dp);
    return ans;
}`,
        cpp: `int findMaxForm(vector<string>& strs, int m, int n) {
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (const string& s : strs) {
        int zeros = count(s.begin(), s.end(), '0'), ones = s.size() - zeros;
        for (int z = m; z >= zeros; z--)
            for (int o = n; o >= ones; o--)
                dp[z][o] = max(dp[z][o], dp[z - zeros][o - ones] + 1);
    }
    return dp[m][n];
}`,
        java: `int findMaxForm(String[] strs, int m, int n) {
    int[][] dp = new int[m + 1][n + 1];
    for (String s : strs) {
        int zeros = 0;
        for (char ch : s.toCharArray()) if (ch == '0') zeros++;
        int ones = s.length() - zeros;
        for (int z = m; z >= zeros; z--)
            for (int o = n; o >= ones; o--)
                dp[z][o] = Math.max(dp[z][o], dp[z - zeros][o - ones] + 1);
    }
    return dp[m][n];
}`,
        javascript: `function findMaxForm(strs, m, n) {
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (const s of strs) {
    const zeros = [...s].filter(ch => ch === '0').length, ones = s.length - zeros;
    for (let z = m; z >= zeros; z--)
      for (let o = n; o >= ones; o--)
        dp[z][o] = Math.max(dp[z][o], dp[z - zeros][o - ones] + 1);
  }
  return dp[m][n];
}`,
      },
    },
    {
      name: '記憶化選或不選',
      idea: '以 (i,z,o) 表示考慮第 i 個以後的字串、剩餘兩種配額,比較拿與不拿。',
      steps: ['預先算每個字串的 0、1 個數', '不選:解 (i+1,z,o)', '配額夠才可選:1 + 解 (i+1,z−zeros,o−ones)', '把結果存進備忘錄'],
      figure: { title: '逐個字串決定', steps: memoFig },
      complexity: { time: 'O(L · m · n + 字串總長)', space: 'O(L · m · n)', why: '最多 L × (m+1) × (n+1) 種狀態,含遞迴堆疊。' },
      verdict: '決策直覺,但狀態量與記憶體都比滾動表大。',
      code: {
        python: `from functools import lru_cache

def findMaxForm(strs, m, n):
    counts = [(s.count('0'), s.count('1')) for s in strs]
    @lru_cache(None)
    def dfs(i, z, o):
        if i == len(strs):
            return 0
        best = dfs(i + 1, z, o)
        a, b = counts[i]
        if a <= z and b <= o:
            best = max(best, 1 + dfs(i + 1, z - a, o - b))
        return best
    return dfs(0, m, n)`,
        c: `static int dfs474(int i, int z, int o, int L, int m, int n, int *zeros, int *ones, int *memo) {
    if (i == L) return 0;
    int idx = (i * (m + 1) + z) * (n + 1) + o;
    if (memo[idx] >= 0) return memo[idx];
    int best = dfs474(i + 1, z, o, L, m, n, zeros, ones, memo);
    if (zeros[i] <= z && ones[i] <= o) {
        int take = 1 + dfs474(i + 1, z - zeros[i], o - ones[i], L, m, n, zeros, ones, memo);
        if (take > best) best = take;
    }
    return memo[idx] = best;
}
int findMaxForm(char **strs, int strsSize, int m, int n) {
    int *zeros = calloc(strsSize, sizeof(int)), *ones = calloc(strsSize, sizeof(int));
    for (int i = 0; i < strsSize; i++)
        for (char *p = strs[i]; *p; p++) if (*p == '0') zeros[i]++; else ones[i]++;
    int size = strsSize * (m + 1) * (n + 1);
    int *memo = malloc(size * sizeof(int));
    for (int i = 0; i < size; i++) memo[i] = -1;
    int ans = dfs474(0, m, n, strsSize, m, n, zeros, ones, memo);
    free(zeros); free(ones); free(memo);
    return ans;
}`,
        cpp: `int findMaxForm(vector<string>& strs, int m, int n) {
    int L = strs.size();
    vector<pair<int,int>> counts;
    for (auto& s : strs) {
        int z = count(s.begin(), s.end(), '0');
        counts.push_back({z, (int)s.size() - z});
    }
    vector<vector<vector<int>>> memo(L, vector<vector<int>>(m + 1, vector<int>(n + 1, -1)));
    function<int(int,int,int)> dfs = [&](int i, int z, int o) -> int {
        if (i == L) return 0;
        int& v = memo[i][z][o];
        if (v >= 0) return v;
        v = dfs(i + 1, z, o);
        auto [a, b] = counts[i];
        if (a <= z && b <= o) v = max(v, 1 + dfs(i + 1, z - a, o - b));
        return v;
    };
    return dfs(0, m, n);
}`,
        java: `int dfs(int i, int z, int o, int[][] counts, int[][][] memo) {
    if (i == counts.length) return 0;
    if (memo[i][z][o] >= 0) return memo[i][z][o];
    int best = dfs(i + 1, z, o, counts, memo);
    int a = counts[i][0], b = counts[i][1];
    if (a <= z && b <= o) best = Math.max(best, 1 + dfs(i + 1, z - a, o - b, counts, memo));
    return memo[i][z][o] = best;
}
int findMaxForm(String[] strs, int m, int n) {
    int L = strs.length;
    int[][] counts = new int[L][2];
    for (int i = 0; i < L; i++)
        for (char ch : strs[i].toCharArray()) counts[i][ch == '0' ? 0 : 1]++;
    int[][][] memo = new int[L][m + 1][n + 1];
    for (int[][] layer : memo) for (int[] row : layer) Arrays.fill(row, -1);
    return dfs(0, m, n, counts, memo);
}`,
        javascript: `function findMaxForm(strs, m, n) {
  const counts = strs.map(s => [[...s].filter(ch => ch === '0').length, [...s].filter(ch => ch === '1').length]);
  const memo = new Map();
  const dfs = (i, z, o) => {
    if (i === strs.length) return 0;
    const key = i + ',' + z + ',' + o;
    if (memo.has(key)) return memo.get(key);
    let best = dfs(i + 1, z, o);
    const [a, b] = counts[i];
    if (a <= z && b <= o) best = Math.max(best, 1 + dfs(i + 1, z - a, o - b));
    memo.set(key, best);
    return best;
  };
  return dfs(0, m, n);
}`,
      },
    },
  ],
  pitfalls: ['兩個容量都要倒序更新,否則同一個字串可能被選多次。', '字串 111001 有 4 個 1、2 個 0;如果 1 的配額只有 3 就不能選。'],
  check: { kind: 'fn', fn: 'findMaxForm', cases: [
    { args: [WORDS, 5, 3], out: 4 }, { args: [['10', '0', '1'], 1, 1], out: 2 },
    { args: [['0', '0', '1'], 2, 0], out: 2 }, { args: [['10'], 0, 0], out: 0 },
  ] },
}
