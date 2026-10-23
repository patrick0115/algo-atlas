import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1547. Minimum Cost to Cut a Stick
const N = 7, CUTS = [1, 3, 4, 5]
function tableFig(): FigStep[] {
  const p = [0, ...CUTS, N]
  const m = p.length
  const dp = Array.from({ length: m }, () => Array(m).fill(0) as number[])
  for (let gap = 2; gap < m; gap++)
    for (let i = 0; i + gap < m; i++) {
      const j = i + gap
      dp[i][j] = Math.min(...Array.from({ length: gap - 1 }, (_, t) => dp[i][i + t + 1] + dp[i + t + 1][j] + p[j] - p[i]))
    }
  const view: GridViewData = { kind: 'grid', label: 'dp[i][j]:端點間最小切割成本', cells: dp.map((row, i) => row.map((v, j) => (j <= i ? '' : v))), rowLabels: p.map(String), colLabels: p.map(String), marks: { done: [[0, m - 1]] } }
  return [
    { note: '先把兩端 0、7 加進切點並排序。一次切割的成本是當前整段的長度,所以順序會影響總價。', views: [arr(p, { label: '切點含兩端' })] },
    { note: 'dp[i][j] 是完成端點 p[i]、p[j] 之間所有切割的最小成本。枚舉第一刀 k:左右子段成本 + 目前段長。', views: [view] },
    { note: '最便宜的總成本是 16。', views: [arr([16], { label: '答案', done: [0] })] },
  ]
}
const memoFig: FigStep[] = [
  { note: '從整根木棍開始,試每個尚未切的點當第一刀,再分別解左段與右段。', views: [arr([0, 1, 3, 4, 5, 7], { label: '排序後位置' })] },
  { note: '相同端點的子段會重複出現,用 (i,j) 備忘錄避免重算。', views: [arr([16], { label: '最小成本', done: [0] })] },
]

export const q1547: Solution = {
  id: 1547,
  plain: '一根木棍要在指定位置切開,每切一刀要付「當下那段木棍的長度」。先切哪裡會影響費用,想找最便宜的切割順序。',
  statement: '長度 n 的木棍要在 cuts 的每個位置各切一次;切一段長度 L 的木棍需付 L。可自由安排順序,求最低總費用。',
  examples: [{ input: 'n = 7, cuts = [1,3,4,5]', output: '16' }, { input: 'n = 9, cuts = [5,6,1,4,2]', output: '22' }],
  constraints: ['木棍長度最多 10⁶,切點最多 100 個', '切點互不相同且位於木棍內部'],
  insight: ['先把切點排序並加入 0、n,才能按區間討論。', '對某段選第一刀後,左右兩側的切割互不影響。', '枚舉第一刀 k:dp[i][j] = p[j]−p[i] + min(dp[i][k]+dp[k][j])。'],
  approaches: [
    {
      name: '由短到長的區間 DP',
      idea: 'dp[i][j] 記錄兩個切點之間完成所有切割的最小費用;子段先算完再算大段。',
      steps: ['排序 p = [0,...cuts,n]', '相鄰端點中間沒有切點,成本為 0', '依端點間距 gap 由小到大枚舉區間', '對每個內部 k,取 dp[i][k]+dp[k][j]+p[j]−p[i] 的最小值'],
      figure: { title: 'n = 7,cuts = [1,3,4,5]', steps: tableFig() },
      complexity: { time: 'O(c³)', space: 'O(c²)', why: 'c 為切點數;每個區間嘗試所有可能的第一刀。' },
      verdict: '標準區間 DP,不會有遞迴堆疊問題。',
      code: {
        python: `def minCost(n, cuts):
    p = [0] + sorted(cuts) + [n]
    m = len(p)
    dp = [[0] * m for _ in range(m)]
    for gap in range(2, m):
        for i in range(m - gap):
            j = i + gap
            dp[i][j] = p[j] - p[i] + min(dp[i][k] + dp[k][j] for k in range(i + 1, j))
    return dp[0][m - 1]`,
        c: `static int cmp1547(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
int minCost(int n, int *cuts, int cutsSize) {
    int m = cutsSize + 2, *p = malloc(m * sizeof(int));
    p[0] = 0; p[m - 1] = n;
    memcpy(p + 1, cuts, cutsSize * sizeof(int));
    qsort(p + 1, cutsSize, sizeof(int), cmp1547);
    int *dp = calloc(m * m, sizeof(int));
    for (int gap = 2; gap < m; gap++)
        for (int i = 0; i + gap < m; i++) {
            int j = i + gap, best = INT_MAX;
            for (int k = i + 1; k < j; k++) {
                int v = dp[i * m + k] + dp[k * m + j];
                if (v < best) best = v;
            }
            dp[i * m + j] = p[j] - p[i] + best;
        }
    int ans = dp[m - 1];
    free(p); free(dp);
    return ans;
}`,
        cpp: `int minCost(int n, vector<int>& cuts) {
    vector<int> p = cuts;
    p.push_back(0); p.push_back(n);
    sort(p.begin(), p.end());
    int m = p.size();
    vector<vector<int>> dp(m, vector<int>(m));
    for (int gap = 2; gap < m; gap++)
        for (int i = 0; i + gap < m; i++) {
            int j = i + gap, best = INT_MAX;
            for (int k = i + 1; k < j; k++) best = min(best, dp[i][k] + dp[k][j]);
            dp[i][j] = p[j] - p[i] + best;
        }
    return dp[0][m - 1];
}`,
        java: `int minCost(int n, int[] cuts) {
    int m = cuts.length + 2;
    int[] p = new int[m];
    p[m - 1] = n;
    System.arraycopy(cuts, 0, p, 1, cuts.length);
    Arrays.sort(p);
    int[][] dp = new int[m][m];
    for (int gap = 2; gap < m; gap++)
        for (int i = 0; i + gap < m; i++) {
            int j = i + gap, best = Integer.MAX_VALUE;
            for (int k = i + 1; k < j; k++) best = Math.min(best, dp[i][k] + dp[k][j]);
            dp[i][j] = p[j] - p[i] + best;
        }
    return dp[0][m - 1];
}`,
        javascript: `function minCost(n, cuts) {
  const p = [0, ...cuts, n].sort((a, b) => a - b), m = p.length;
  const dp = Array.from({ length: m }, () => Array(m).fill(0));
  for (let gap = 2; gap < m; gap++)
    for (let i = 0; i + gap < m; i++) {
      const j = i + gap;
      let best = Infinity;
      for (let k = i + 1; k < j; k++) best = Math.min(best, dp[i][k] + dp[k][j]);
      dp[i][j] = p[j] - p[i] + best;
    }
  return dp[0][m - 1];
}`,
      },
    },
    {
      name: '記憶化分治',
      idea: '遞迴嘗試區間的第一刀,把每個端點對的最小費用存下來。',
      steps: ['排序並加入 0、n', '相鄰端點的 dfs(i,j) = 0', '對 i < k < j,取段長 + dfs(i,k) + dfs(k,j) 的最小值', '回傳 dfs(0,m−1)'],
      figure: { title: '從整根木棍往下拆', steps: memoFig },
      complexity: { time: 'O(c³)', space: 'O(c²)', why: '每個端點對只算一次,但會嘗試所有內部切點。' },
      verdict: '更貼近「先切一刀再解左右」的思考過程。',
      code: {
        python: `from functools import lru_cache

def minCost(n, cuts):
    p = [0] + sorted(cuts) + [n]
    @lru_cache(None)
    def dfs(i, j):
        if j == i + 1:
            return 0
        return p[j] - p[i] + min(dfs(i, k) + dfs(k, j) for k in range(i + 1, j))
    return dfs(0, len(p) - 1)`,
        c: `static int cmp1547(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
static int dfs1547(int i, int j, int *p, int m, int *memo) {
    if (j == i + 1) return 0;
    int idx = i * m + j;
    if (memo[idx] >= 0) return memo[idx];
    int best = INT_MAX;
    for (int k = i + 1; k < j; k++) {
        int v = dfs1547(i, k, p, m, memo) + dfs1547(k, j, p, m, memo);
        if (v < best) best = v;
    }
    return memo[idx] = p[j] - p[i] + best;
}
int minCost(int n, int *cuts, int cutsSize) {
    int m = cutsSize + 2, *p = malloc(m * sizeof(int));
    p[0] = 0; p[m - 1] = n;
    memcpy(p + 1, cuts, cutsSize * sizeof(int));
    qsort(p + 1, cutsSize, sizeof(int), cmp1547);
    int *memo = malloc(m * m * sizeof(int));
    for (int i = 0; i < m * m; i++) memo[i] = -1;
    int ans = dfs1547(0, m - 1, p, m, memo);
    free(p); free(memo);
    return ans;
}`,
        cpp: `int minCost(int n, vector<int>& cuts) {
    vector<int> p = cuts;
    p.push_back(0); p.push_back(n);
    sort(p.begin(), p.end());
    int m = p.size();
    vector<vector<int>> memo(m, vector<int>(m, -1));
    function<int(int,int)> dfs = [&](int i, int j) -> int {
        if (j == i + 1) return 0;
        int& ans = memo[i][j];
        if (ans >= 0) return ans;
        ans = INT_MAX;
        for (int k = i + 1; k < j; k++)
            ans = min(ans, p[j] - p[i] + dfs(i, k) + dfs(k, j));
        return ans;
    };
    return dfs(0, m - 1);
}`,
        java: `int dfs(int i, int j, int[] p, int[][] memo) {
    if (j == i + 1) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    int best = Integer.MAX_VALUE;
    for (int k = i + 1; k < j; k++)
        best = Math.min(best, p[j] - p[i] + dfs(i, k, p, memo) + dfs(k, j, p, memo));
    return memo[i][j] = best;
}
int minCost(int n, int[] cuts) {
    int m = cuts.length + 2;
    int[] p = new int[m];
    p[m - 1] = n;
    System.arraycopy(cuts, 0, p, 1, cuts.length);
    Arrays.sort(p);
    int[][] memo = new int[m][m];
    for (int[] row : memo) Arrays.fill(row, -1);
    return dfs(0, m - 1, p, memo);
}`,
        javascript: `function minCost(n, cuts) {
  const p = [0, ...cuts, n].sort((a, b) => a - b), m = p.length;
  const memo = Array.from({ length: m }, () => Array(m).fill(-1));
  const dfs = (i, j) => {
    if (j === i + 1) return 0;
    if (memo[i][j] >= 0) return memo[i][j];
    let best = Infinity;
    for (let k = i + 1; k < j; k++)
      best = Math.min(best, p[j] - p[i] + dfs(i, k) + dfs(k, j));
    return memo[i][j] = best;
  };
  return dfs(0, m - 1);
}`,
      },
    },
  ],
  pitfalls: ['切割成本是切當下整段木棍的長度,不是切點的數值。', '必須先排序切點並加入兩端,區間才有明確長度。', '區間 DP 要先算較短的區間,再算較長的。'],
  check: { kind: 'fn', fn: 'minCost', cases: [
    { args: [N, CUTS], out: 16 }, { args: [9, [5, 6, 1, 4, 2]], out: 22 },
    { args: [3, [1]], out: 3 }, { args: [10, [2, 4, 7]], out: 20 },
  ] },
}
