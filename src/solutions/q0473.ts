import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 473. Matchsticks to Square

const M = [1, 1, 2, 2, 2]

function btFig(): FigStep[] {
  return [
    { note: `火柴總長 ${M.reduce((a, b) => a + b, 0)},正方形每邊要 2。先檢查:總和要能被 4 整除,而且最長的那根不能超過邊長`, views: [arr(M, { label: 'matchsticks' })] },
    { note: '由長到短排序(長的先放,失敗得早),每根火柴依序嘗試放進 4 條邊之一,放了不能超過邊長', views: [arr([2, 2, 2, 1, 1], { label: '排序後' }), arr([0, 0, 0, 0], { label: '4 條邊目前長度' })] },
    { note: '2 → 邊 0;2 → 邊 1;2 → 邊 2;1 → 邊 3;1 → 邊 3。四邊都是 2 → 做得到', views: [arr([2, 2, 2, 2], { label: '4 條邊', done: [0, 1, 2, 3] })] },
    { note: '剪枝:如果某條邊目前長度和前面試過的邊一樣(例如都是 0),放進去的結果一模一樣 → 跳過。這讓搜尋快很多', views: [arr([2, 0, 0, 0], { label: '邊 1、2、3 都是 0:只試一條', highlight: [1], dim: [2, 3] })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: '狀態壓縮 DP:mask 表示「哪些火柴已經用掉」,`dp[mask]` = 用掉這些之後,目前這條邊已經放了多長(放不出來是 −1)', views: [arr(M, { label: 'matchsticks' })] },
    { note: '轉移:從 dp[mask] 加一根沒用過的火柴 i,只要 `dp[mask] + m[i] ≤ 邊長` 就可以,新長度 `(dp[mask] + m[i]) % 邊長`(滿了就從 0 開始下一條邊)', views: [arr(['00000', '00001', '00011', '…', '11111'], { label: 'mask', done: [4] })] },
    { note: '最後看 `dp[全選] == 0`:全部用完而且剛好填滿最後一條邊', views: [arr([0], { label: 'dp[11111]', done: [0] })] },
  ]
}

export const q0473: Solution = {
  id: 473,
  plain: '有一堆長短不一的火柴,每根都要用、不能折斷。能不能剛好拼成一個正方形?',
  statement: '給整數陣列 `matchsticks`,`matchsticks[i]` 是第 i 根火柴的長度。必須用上**所有**火柴、不能折斷,判斷能否拼成一個正方形。',
  examples: [
    { input: 'matchsticks = [1,1,2,2,2]', output: 'true' },
    { input: 'matchsticks = [3,3,3,3,4]', output: 'false' },
  ],
  constraints: ['1 ≤ n ≤ 15,長度 ≤ 10⁸'],
  insight: ['= 把陣列分成 4 個和相等的組([698](#/q/698) 的 k = 4)', '每根火柴試著放進 4 條邊之一 → [[p:backtracking]]', '剪枝:由大到小排序、和前一條邊同長就跳過', 'n ≤ 15 也能用 [[p:bitmask-dp]]'],
  approaches: [
    {
      name: '回溯放進 4 條邊',
      idea: '`side = total / 4`;由大到小排序;`dfs(i)`:第 i 根試放進每條邊(不超過 side,且和前面同長的邊跳過)。',
      steps: ['`total % 4 != 0` 或最大值 > side → False', '由大到小排序,`sides = [0] * 4`', '`dfs(i)`:`i == n` → True', '`for j in 0..3`:`sides[j] + m[i] <= side` 且 sides[j] 沒在前面出現過 → 放、遞迴、撤回'],
      figure: { title: `matchsticks = [${M}]`, steps: btFig() },
      complexity: { time: 'O(4ⁿ)(剪枝後實際快很多)', space: 'O(n)', why: '每根火柴最多 4 種放法;遞迴深度 n。' },
      verdict: '最推薦,剪枝好寫;排序 + 跳過同長邊是關鍵,沒剪枝會超時。',
      code: {
        python: `def makesquare(matchsticks):
    total = sum(matchsticks)
    if total % 4:
        return False
    side = total // 4
    m = sorted(matchsticks, reverse=True)     # 長的先放,失敗得早
    if m[0] > side:
        return False
    sides = [0] * 4

    def dfs(i):
        if i == len(m):
            return True
        for j in range(4):
            if sides[j] + m[i] > side or sides[j] in sides[:j]:
                continue                      # 放不下,或和前面某條邊一樣長
            sides[j] += m[i]
            if dfs(i + 1):
                return True
            sides[j] -= m[i]
        return False

    return dfs(0)`,
        c: `static int *M, N, side, sides[4];

static int cmpDesc(const void *a, const void *b) { return *(int *)b - *(int *)a; }

static bool dfs(int i) {
    if (i == N) return true;
    for (int j = 0; j < 4; j++) {
        if (sides[j] + M[i] > side) continue;
        bool dup = false;
        for (int t = 0; t < j; t++) if (sides[t] == sides[j]) dup = true;
        if (dup) continue;
        sides[j] += M[i];
        if (dfs(i + 1)) return true;
        sides[j] -= M[i];
    }
    return false;
}

bool makesquare(int *matchsticks, int matchsticksSize) {
    long long total = 0;
    for (int i = 0; i < matchsticksSize; i++) total += matchsticks[i];
    if (total % 4) return false;
    side = total / 4;
    qsort(matchsticks, matchsticksSize, sizeof(int), cmpDesc);
    if (matchsticks[0] > side) return false;
    M = matchsticks; N = matchsticksSize;
    memset(sides, 0, sizeof(sides));
    return dfs(0);
}`,
        cpp: `bool makesquare(vector<int>& matchsticks) {
    long long total = accumulate(matchsticks.begin(), matchsticks.end(), 0LL);
    if (total % 4) return false;
    int side = total / 4, n = matchsticks.size();
    sort(matchsticks.rbegin(), matchsticks.rend());
    if (matchsticks[0] > side) return false;
    int sides[4] = {0};
    function<bool(int)> dfs = [&](int i) {
        if (i == n) return true;
        for (int j = 0; j < 4; j++) {
            if (sides[j] + matchsticks[i] > side) continue;
            if (find(sides, sides + j, sides[j]) != sides + j) continue;
            sides[j] += matchsticks[i];
            if (dfs(i + 1)) return true;
            sides[j] -= matchsticks[i];
        }
        return false;
    };
    return dfs(0);
}`,
        java: `int[] sides = new int[4];
int side;

boolean makesquare(int[] matchsticks) {
    long total = 0;
    for (int x : matchsticks) total += x;
    if (total % 4 != 0) return false;
    side = (int) (total / 4);
    Arrays.sort(matchsticks);
    for (int i = 0, j = matchsticks.length - 1; i < j; i++, j--) { int t = matchsticks[i]; matchsticks[i] = matchsticks[j]; matchsticks[j] = t; }
    if (matchsticks[0] > side) return false;
    Arrays.fill(sides, 0);
    return dfs(matchsticks, 0);
}

boolean dfs(int[] m, int i) {
    if (i == m.length) return true;
    for (int j = 0; j < 4; j++) {
        if (sides[j] + m[i] > side) continue;
        boolean dup = false;
        for (int t = 0; t < j; t++) if (sides[t] == sides[j]) dup = true;
        if (dup) continue;
        sides[j] += m[i];
        if (dfs(m, i + 1)) return true;
        sides[j] -= m[i];
    }
    return false;
}`,
        javascript: `function makesquare(matchsticks) {
  const total = matchsticks.reduce((a, b) => a + b, 0);
  if (total % 4) return false;
  const side = total / 4, m = [...matchsticks].sort((a, b) => b - a);
  if (m[0] > side) return false;
  const sides = [0, 0, 0, 0];
  const dfs = (i) => {
    if (i === m.length) return true;
    for (let j = 0; j < 4; j++) {
      if (sides[j] + m[i] > side || sides.slice(0, j).includes(sides[j])) continue;
      sides[j] += m[i];
      if (dfs(i + 1)) return true;
      sides[j] -= m[i];
    }
    return false;
  };
  return dfs(0);
}`,
      },
    },
    {
      name: '狀態壓縮 DP',
      idea: '`dp[mask]` = 用掉 mask 這些火柴後,目前這條邊的長度(−1 表示不可達);轉移加一根沒用的火柴,不能超過 side。',
      steps: ['`dp = [-1] * 2ⁿ`、`dp[0] = 0`', '`for mask`:`dp[mask] < 0` 跳過', '`for i not in mask`:`dp[mask] + m[i] <= side` → `dp[mask | 1<<i] = (dp[mask] + m[i]) % side`', '回傳 `dp[2ⁿ − 1] == 0`'],
      figure: { title: `matchsticks = [${M}]`, steps: dpFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(2ⁿ)', why: '2¹⁵ 個狀態,每個試 n 根。' },
      verdict: '複雜度穩定、不怕壞的測資;但記憶體比回溯大。',
      code: {
        python: `def makesquare(matchsticks):
    total, n = sum(matchsticks), len(matchsticks)
    if total % 4:
        return False
    side = total // 4
    dp = [-1] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] < 0:
            continue
        for i in range(n):
            if mask >> i & 1:
                continue
            nxt = dp[mask] + matchsticks[i]
            if nxt <= side:
                dp[mask | 1 << i] = nxt % side   # 滿一條邊就歸零
    return dp[-1] == 0`,
        c: `bool makesquare(int *matchsticks, int matchsticksSize) {
    int n = matchsticksSize;
    long long total = 0;
    for (int i = 0; i < n; i++) total += matchsticks[i];
    if (total % 4) return false;
    int side = total / 4, full = 1 << n;
    int *dp = malloc(full * sizeof(int));
    for (int i = 0; i < full; i++) dp[i] = -1;
    dp[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (dp[mask] < 0) continue;
        for (int i = 0; i < n; i++) {
            if (mask >> i & 1) continue;
            long long nxt = (long long)dp[mask] + matchsticks[i];
            if (nxt <= side) dp[mask | 1 << i] = nxt % side;
        }
    }
    bool ok = dp[full - 1] == 0;
    free(dp);
    return ok;
}`,
        cpp: `bool makesquare(vector<int>& matchsticks) {
    int n = matchsticks.size();
    long long total = accumulate(matchsticks.begin(), matchsticks.end(), 0LL);
    if (total % 4) return false;
    int side = total / 4;
    vector<int> dp(1 << n, -1);
    dp[0] = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] < 0) continue;
        for (int i = 0; i < n; i++) {
            if (mask >> i & 1) continue;
            long long nxt = (long long)dp[mask] + matchsticks[i];
            if (nxt <= side) dp[mask | 1 << i] = nxt % side;
        }
    }
    return dp[(1 << n) - 1] == 0;
}`,
        java: `boolean makesquare(int[] matchsticks) {
    int n = matchsticks.length;
    long total = 0;
    for (int x : matchsticks) total += x;
    if (total % 4 != 0) return false;
    int side = (int) (total / 4);
    int[] dp = new int[1 << n];
    Arrays.fill(dp, -1);
    dp[0] = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] < 0) continue;
        for (int i = 0; i < n; i++) {
            if ((mask >> i & 1) == 1) continue;
            long nxt = (long) dp[mask] + matchsticks[i];
            if (nxt <= side) dp[mask | 1 << i] = (int) (nxt % side);
        }
    }
    return dp[(1 << n) - 1] == 0;
}`,
        javascript: `function makesquare(matchsticks) {
  const n = matchsticks.length, total = matchsticks.reduce((a, b) => a + b, 0);
  if (total % 4) return false;
  const side = total / 4, dp = new Array(1 << n).fill(-1);
  dp[0] = 0;
  for (let mask = 0; mask < 1 << n; mask++) {
    if (dp[mask] < 0) continue;
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) continue;
      const nxt = dp[mask] + matchsticks[i];
      if (nxt <= side) dp[mask | (1 << i)] = nxt % side;
    }
  }
  return dp[(1 << n) - 1] === 0;
}`,
      },
    },
  ],
  pitfalls: ['沒先檢查總和 % 4:白白搜尋一整輪', '沒排序也沒跳過同長的邊:最壞 4¹⁵ ≈ 10⁹ 會超時', '總和用 int:15 × 10⁸ 會溢位'],
  check: {
    kind: 'fn',
    fn: 'makesquare',
    cases: [
      { args: [M], out: true },
      { args: [[3, 3, 3, 3, 4]], out: false },
      { args: [[5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3]], out: true },
      { args: [[1, 1, 1, 1]], out: true },
      { args: [[1, 2, 3]], out: false },
    ],
  },
}
