import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const diceFig: FigStep[] = [
  { note: '以 2 顆、每顆 3 面、目標 4 為例。0 顆骰子只有總和 0 一種方法。', views: [arr([1, 0, 0, 0, 0], { label: 'dp[0][總和 0..4]', done: [0] })] },
  { note: '投第 1 顆，總和 1、2、3 各有一種方法。', views: [arr([0, 1, 1, 1, 0], { label: 'dp[1][總和 0..4]', done: [1, 2, 3] })] },
  { note: '投第 2 顆，想湊出 4：最後一顆是 1、2、3 時，先前總和分別要 3、2、1。', views: [arr([1, 2, 3], { label: '最後一顆點數' }), arr([3, 2, 1], { label: '先前需要的總和' })] },
  { note: '三種前一狀態各有 1 種方法，因此 dp[2][4] = 3。', views: [arr([0, 0, 1, 2, 3], { label: 'dp[2][總和 0..4]', done: [4] })] },
]
const windowFig: FigStep[] = [
  { note: '同樣從上一列 [0,1,1,1,0] 出發；新列的每格是上一列連續 k 格的和。', views: [arr([0, 1, 1, 1, 0], { label: '上一列' })] },
  { note: '總和 2 時，視窗包含上一列的總和 1、0：值為 1。', views: [arr([0, 1, 1, 1, 0], { label: '上一列', highlight: [0, 1] }), arr([1], { label: '新列總和 2' })] },
  { note: '視窗往右滑一格，加入總和 2，得到新列總和 3 的值 2。', views: [arr([0, 1, 1, 1, 0], { label: '上一列', highlight: [0, 1, 2] }), arr([2], { label: '新列總和 3' })] },
  { note: '再右移，移出總和 0、加入總和 3，得到總和 4 的值 3。', views: [arr([0, 1, 1, 1, 0], { label: '上一列', highlight: [1, 2, 3] }), arr([3], { label: '答案', done: [0] })] },
]

export const q1155: Solution = {
  id: 1155,
  plain: '投 n 顆 k 面骰子，點數總和剛好是 target 的方法有幾種？',
  statement: '每顆骰子的點數為 1 到 k。回傳投 n 顆骰子、總和等於 target 的有序結果數，對 1,000,000,007 取餘數。',
  examples: [
    { input: 'n = 1, k = 6, target = 3', output: '1' },
    { input: 'n = 2, k = 6, target = 7', output: '6' },
    { input: 'n = 30, k = 30, target = 500', output: '222616187' },
  ],
  constraints: ['1 ≤ n,k ≤ 30', '1 ≤ target ≤ 1000'],
  insight: ['令 dp[d][s] 表示投 d 顆骰子、總和 s 的方法數。', '最後一顆若是面值 f，先前必須湊出 s−f。', '固定 s 時，這些前一狀態是連續 k 格，可用滑動總和加速。'],
  approaches: [
    {
      name: '逐顆骰子的動態規劃',
      idea: '從 dp[0][0]=1 出發；每投一顆，遍歷點數 1..k，把上一列的方法數轉移到新列。',
      steps: ['初始化 dp[0][0]=1', '依序處理每顆骰子 d', '對每個總和 s，累加 dp[d−1][s−f]，其中 1≤f≤k', '每步取模，回傳 dp[n][target]'],
      figure: { title: 'n = 2, k = 3, target = 4', steps: diceFig },
      complexity: { time: 'O(n·target·k)', space: 'O(target)', why: '只保留上一顆骰子的結果。' },
      verdict: '最適合先學會狀態轉移的 [[p:dp-general]] 解法。',
      code: {
        python: `def numRollsToTarget(n, k, target):
    mod = 1_000_000_007
    dp = [0] * (target + 1)
    dp[0] = 1                       # 0 顆骰子湊 0
    for _ in range(n):
        nxt = [0] * (target + 1)
        for s in range(target + 1):
            for face in range(1, min(k, s) + 1):
                nxt[s] = (nxt[s] + dp[s - face]) % mod
        dp = nxt                    # 只保留上一列
    return dp[target]`,
        c: `int numRollsToTarget(int n, int k, int target) {
    const int mod = 1000000007;
    int *dp = calloc(target + 1, sizeof(int));
    dp[0] = 1;
    for (int die = 0; die < n; die++) {
        int *next = calloc(target + 1, sizeof(int));
        for (int sum = 0; sum <= target; sum++) {
            for (int face = 1; face <= k && face <= sum; face++) {
                next[sum] = (next[sum] + dp[sum - face]) % mod;
            }
        }
        free(dp);
        dp = next;
    }
    int ans = dp[target];
    free(dp);
    return ans;
}`,
        cpp: `int numRollsToTarget(int n, int k, int target) {
    const int mod = 1000000007;
    vector<int> dp(target + 1);
    dp[0] = 1;
    for (int die = 0; die < n; die++) {
        vector<int> next(target + 1);
        for (int sum = 0; sum <= target; sum++) {
            for (int face = 1; face <= k && face <= sum; face++) {
                next[sum] = (next[sum] + dp[sum - face]) % mod;
            }
        }
        dp = move(next);
    }
    return dp[target];
}`,
        java: `int numRollsToTarget(int n, int k, int target) {
    final int mod = 1000000007;
    int[] dp = new int[target + 1];
    dp[0] = 1;
    for (int die = 0; die < n; die++) {
        int[] next = new int[target + 1];
        for (int sum = 0; sum <= target; sum++) {
            for (int face = 1; face <= k && face <= sum; face++) {
                next[sum] = (next[sum] + dp[sum - face]) % mod;
            }
        }
        dp = next;
    }
    return dp[target];
}`,
        javascript: `function numRollsToTarget(n, k, target) {
  const mod = 1000000007;
  let dp = Array(target + 1).fill(0);
  dp[0] = 1;
  for (let die = 0; die < n; die++) {
    const next = Array(target + 1).fill(0);
    for (let sum = 0; sum <= target; sum++) {
      for (let face = 1; face <= k && face <= sum; face++) {
        next[sum] = (next[sum] + dp[sum - face]) % mod;
      }
    }
    dp = next;
  }
  return dp[target];
}`,
      },
    },
    {
      name: '滑動總和優化轉移',
      idea: '新列的 dp[s] 是上一列 dp[s−1] 到 dp[s−k] 的連續區間和；右移視窗時一進一出。',
      steps: ['上一列仍從 dp[0]=1 開始', '每顆骰子建立空的新列與 window=0', '依總和 s 遞增：加入 dp[s−1]，移出 dp[s−k−1]', '把 window 記為新列的 dp[s]'],
      figure: { title: 'n = 2, k = 3, target = 4', steps: windowFig },
      complexity: { time: 'O(n·target)', space: 'O(target)', why: '每格只做常數次加減。' },
      verdict: '當 k 較大時更快，展示 [[p:sliding-window]] 如何優化 DP 轉移。',
      code: {
        python: `def numRollsToTarget(n, k, target):
    mod = 1_000_000_007
    dp = [0] * (target + 1)
    dp[0] = 1
    for _ in range(n):
        nxt = [0] * (target + 1)
        window = 0
        for s in range(1, target + 1):
            window += dp[s - 1]          # 新進視窗
            if s - k - 1 >= 0:
                window -= dp[s - k - 1]  # 離開視窗
            nxt[s] = window % mod
        dp = nxt
    return dp[target]`,
        c: `int numRollsToTarget(int n, int k, int target) {
    const int mod = 1000000007;
    int *dp = calloc(target + 1, sizeof(int));
    dp[0] = 1;
    for (int die = 0; die < n; die++) {
        int *next = calloc(target + 1, sizeof(int));
        long long window = 0;
        for (int sum = 1; sum <= target; sum++) {
            window += dp[sum - 1];
            if (sum - k - 1 >= 0) {
                window -= dp[sum - k - 1];
            }
            window = (window % mod + mod) % mod;
            next[sum] = (int)window;
        }
        free(dp);
        dp = next;
    }
    int ans = dp[target];
    free(dp);
    return ans;
}`,
        cpp: `int numRollsToTarget(int n, int k, int target) {
    const int mod = 1000000007;
    vector<int> dp(target + 1);
    dp[0] = 1;
    for (int die = 0; die < n; die++) {
        vector<int> next(target + 1);
        long long window = 0;
        for (int sum = 1; sum <= target; sum++) {
            window += dp[sum - 1];
            if (sum - k - 1 >= 0) {
                window -= dp[sum - k - 1];
            }
            window = (window % mod + mod) % mod;
            next[sum] = window;
        }
        dp = move(next);
    }
    return dp[target];
}`,
        java: `int numRollsToTarget(int n, int k, int target) {
    final int mod = 1000000007;
    int[] dp = new int[target + 1];
    dp[0] = 1;
    for (int die = 0; die < n; die++) {
        int[] next = new int[target + 1];
        long window = 0;
        for (int sum = 1; sum <= target; sum++) {
            window += dp[sum - 1];
            if (sum - k - 1 >= 0) {
                window -= dp[sum - k - 1];
            }
            window = (window % mod + mod) % mod;
            next[sum] = (int) window;
        }
        dp = next;
    }
    return dp[target];
}`,
        javascript: `function numRollsToTarget(n, k, target) {
  const mod = 1000000007;
  let dp = Array(target + 1).fill(0);
  dp[0] = 1;
  for (let die = 0; die < n; die++) {
    const next = Array(target + 1).fill(0);
    let window = 0;
    for (let sum = 1; sum <= target; sum++) {
      window += dp[sum - 1];
      if (sum - k - 1 >= 0) {
        window -= dp[sum - k - 1];
      }
      window = ((window % mod) + mod) % mod;
      next[sum] = window;
    }
    dp = next;
  }
  return dp[target];
}`,
      },
    },
  ],
  pitfalls: ['dp[0]=1 代表「沒有骰子、總和 0」的一種空選擇。', '每顆骰子都必須使用，不能在同一列原地更新而混用新舊結果。', '滑動視窗做模數減法後可能為負，必須調回非負。'],
  check: { kind: 'fn', fn: 'numRollsToTarget', cases: [
    { args: [1, 6, 3], out: 1 },
    { args: [2, 6, 7], out: 6 },
    { args: [2, 3, 4], out: 3 },
    { args: [2, 3, 7], out: 0 },
    { args: [30, 30, 500], out: 222616187 },
  ] },
}
