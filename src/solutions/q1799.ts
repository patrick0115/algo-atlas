import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1799. Maximize Score After N Operations

const A = [3, 4, 6, 8]

function memoFig(): FigStep[] {
  return [
    { note: `每次挑兩個數 x、y 拿掉,得分 = 第幾次 × gcd(x, y)。陣列只有 ${A.length} 個(最多 14 個)→ 用位元遮罩記「哪些已經拿掉了」`, views: [arr(A, { label: 'nums' })] },
    { note: '同一個 mask 從不同順序走到,剩下能拿的分數一樣 → 記憶化。而且已拿掉幾個就知道現在是第幾次:`op = popcount(mask) / 2 + 1`', views: [arr(['0000', '0101', '1111'], { label: 'mask 的變化(1 = 已拿掉)' })] },
    { note: '例:第 1 次拿 (3, 6) gcd 3 → 1 × 3;第 2 次拿 (4, 8) gcd 4 → 2 × 4。總分 11,是最大的', views: [arr(A, { label: '第 1 次 (3,6)、第 2 次 (4,8)', highlight: [0, 2], compare: [1, 3] }), arr([11], { label: '答案', done: [0] })] },
    { note: '小技巧:gcd 大的那對應該留到後面(乘的倍數大)。記憶化會自動試出最好的順序', views: [arr([3, 4], { label: '第 1 次 gcd 3、第 2 次 gcd 4' })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: '由下往上:`dp[mask]` = 已經拿掉 mask 這些數時的最大得分。只有 popcount 為偶數的 mask 才有意義', views: [arr(['dp[0000] = 0'], { label: '起點' })] },
    { note: '從 dp[mask] 挑兩個還沒拿的 i、j:`dp[mask | i | j] = max(…, dp[mask] + op × gcd(nums[i], nums[j]))`。先把所有 gcd 預先算好', views: [arr(['dp[0101] = 3', 'dp[1010] = 4', 'dp[1111] = 11'], { label: '幾個狀態' })] },
  ]
}

export const q1799: Solution = {
  id: 1799,
  plain: '有 2n 個數字,要做 n 次操作:每次挑兩個數拿掉,得到「第幾次 × 兩數的最大公因數」分。怎麼挑總分最高?',
  statement: '給長度 2n 的正整數陣列 `nums`。進行 n 次操作,第 i 次(從 1 開始)選兩個數 x、y,得分 `i × gcd(x, y)`,並把它們移除。回傳能得到的**最大總分**。',
  examples: [
    { input: 'nums = [1,2]', output: '1' },
    { input: 'nums = [3,4,6,8]', output: '11', note: '1 × gcd(3,6) + 2 × gcd(4,8) = 3 + 8' },
    { input: 'nums = [1,2,3,4,5,6]', output: '14', note: '1 × gcd(1,5) + 2 × gcd(2,4) + 3 × gcd(3,6)' },
  ],
  constraints: ['1 ≤ n ≤ 7(陣列最多 14 個)'],
  insight: ['14 個數 → 2¹⁴ = 16384 種「已拿掉的集合」,[[p:bitmask-dp]]', '已拿掉幾個就知道是第幾次操作,不用另外記', '預先算好每一對的 gcd'],
  approaches: [
    {
      name: '記憶化搜尋(遮罩)',
      idea: '`dfs(mask)`:全拿光回傳 0;否則 `op = popcount(mask)/2 + 1`,枚舉兩個沒拿的 i < j,取 `op × g[i][j] + dfs(mask | i | j)` 的最大。',
      steps: ['`g[i][j] = gcd(nums[i], nums[j])`', '`dfs(mask)`:`mask == full` → 0', '`op = popcount(mask) // 2 + 1`', '枚舉 i < j 都不在 mask:取最大;記憶化'],
      figure: { title: `nums = [${A}]`, steps: memoFig() },
      complexity: { time: 'O(2ᵐ · m²)', space: 'O(2ᵐ)', why: 'm = 2n ≤ 14;每個狀態枚舉 m² / 2 對。' },
      verdict: '最推薦,狀態壓縮最自然的寫法;可以再剪成「固定拿最低位的 i」減少重複。',
      code: {
        python: `from functools import lru_cache
from math import gcd

def maxScore(nums):
    m = len(nums)
    g = [[gcd(a, b) for b in nums] for a in nums]
    full = (1 << m) - 1

    @lru_cache(None)
    def dfs(mask):
        if mask == full:
            return 0
        op = bin(mask).count('1') // 2 + 1    # 這是第幾次操作
        best = 0
        for i in range(m):
            if mask >> i & 1:
                continue
            for j in range(i + 1, m):
                if not mask >> j & 1:
                    best = max(best, op * g[i][j] + dfs(mask | 1 << i | 1 << j))
        return best

    return dfs(0)`,
        c: `static int g[14][14], memo[1 << 14], M, full;

static int gcd(int a, int b) { return b ? gcd(b, a % b) : a; }

static int dfs(int mask) {
    if (mask == full) return 0;
    if (memo[mask] >= 0) return memo[mask];
    int op = __builtin_popcount(mask) / 2 + 1, best = 0;
    for (int i = 0; i < M; i++) {
        if (mask >> i & 1) continue;
        for (int j = i + 1; j < M; j++) {
            if (mask >> j & 1) continue;
            int v = op * g[i][j] + dfs(mask | 1 << i | 1 << j);
            if (v > best) best = v;
        }
    }
    return memo[mask] = best;
}

int maxScore(int *nums, int numsSize) {
    M = numsSize; full = (1 << M) - 1;
    for (int i = 0; i < M; i++) for (int j = 0; j < M; j++) g[i][j] = gcd(nums[i], nums[j]);
    for (int i = 0; i <= full; i++) memo[i] = -1;
    return dfs(0);
}`,
        cpp: `int maxScore(vector<int>& nums) {
    int m = nums.size(), full = (1 << m) - 1;
    vector<vector<int>> g(m, vector<int>(m));
    for (int i = 0; i < m; i++) for (int j = 0; j < m; j++) g[i][j] = gcd(nums[i], nums[j]);
    vector<int> memo(1 << m, -1);
    function<int(int)> dfs = [&](int mask) {
        if (mask == full) return 0;
        if (memo[mask] >= 0) return memo[mask];
        int op = __builtin_popcount(mask) / 2 + 1, best = 0;
        for (int i = 0; i < m; i++) {
            if (mask >> i & 1) continue;
            for (int j = i + 1; j < m; j++)
                if (!(mask >> j & 1)) best = max(best, op * g[i][j] + dfs(mask | 1 << i | 1 << j));
        }
        return memo[mask] = best;
    };
    return dfs(0);
}`,
        java: `int[][] g;
int[] memo;
int m, full;

int maxScore(int[] nums) {
    m = nums.length; full = (1 << m) - 1;
    g = new int[m][m];
    for (int i = 0; i < m; i++) for (int j = 0; j < m; j++) g[i][j] = gcd(nums[i], nums[j]);
    memo = new int[1 << m];
    Arrays.fill(memo, -1);
    return dfs(0);
}

int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }

int dfs(int mask) {
    if (mask == full) return 0;
    if (memo[mask] >= 0) return memo[mask];
    int op = Integer.bitCount(mask) / 2 + 1, best = 0;
    for (int i = 0; i < m; i++) {
        if ((mask >> i & 1) == 1) continue;
        for (int j = i + 1; j < m; j++)
            if ((mask >> j & 1) == 0) best = Math.max(best, op * g[i][j] + dfs(mask | 1 << i | 1 << j));
    }
    return memo[mask] = best;
}`,
        javascript: `function maxScore(nums) {
  const m = nums.length, full = (1 << m) - 1;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const g = nums.map((a) => nums.map((b) => gcd(a, b)));
  const memo = new Array(1 << m).fill(-1);
  const pop = (x) => x.toString(2).split('1').length - 1;
  const dfs = (mask) => {
    if (mask === full) return 0;
    if (memo[mask] >= 0) return memo[mask];
    const op = pop(mask) / 2 + 1;
    let best = 0;
    for (let i = 0; i < m; i++) {
      if ((mask >> i) & 1) continue;
      for (let j = i + 1; j < m; j++)
        if (!((mask >> j) & 1)) best = Math.max(best, op * g[i][j] + dfs(mask | (1 << i) | (1 << j)));
    }
    return (memo[mask] = best);
  };
  return dfs(0);
}`,
      },
    },
    {
      name: '由下往上的遮罩 DP',
      idea: '`dp[mask]` = 拿掉 mask 時的最大得分;依 mask 由小到大,從偶數 popcount 的狀態往外擴兩個位元。',
      steps: ['`dp = [-1] * 2ᵐ`、`dp[0] = 0`', '`for mask`:`dp[mask] < 0` 跳過;`op = popcount / 2 + 1`', '枚舉兩個沒拿的 i < j:更新 `dp[mask | i | j]`', '回傳 `dp[full]`'],
      figure: { title: `nums = [${A}]`, steps: dpFig() },
      complexity: { time: 'O(2ᵐ · m²)', space: 'O(2ᵐ)', why: '同上,沒有遞迴。' },
      verdict: '和記憶化等價;加上去的 mask 一定比原本大,所以由小到大掃就保證先算好。',
      code: {
        python: `from math import gcd

def maxScore(nums):
    m = len(nums)
    g = [[gcd(a, b) for b in nums] for a in nums]
    dp = [-1] * (1 << m)
    dp[0] = 0
    for mask in range(1 << m):
        if dp[mask] < 0:
            continue
        op = bin(mask).count('1') // 2 + 1
        for i in range(m):
            if mask >> i & 1:
                continue
            for j in range(i + 1, m):
                if not mask >> j & 1:
                    nxt = mask | 1 << i | 1 << j
                    dp[nxt] = max(dp[nxt], dp[mask] + op * g[i][j])
    return dp[-1]`,
        c: `static int gcd(int a, int b) { return b ? gcd(b, a % b) : a; }

int maxScore(int *nums, int numsSize) {
    int m = numsSize, full = 1 << m, g[14][14];
    for (int i = 0; i < m; i++) for (int j = 0; j < m; j++) g[i][j] = gcd(nums[i], nums[j]);
    int *dp = malloc(full * sizeof(int));
    for (int i = 0; i < full; i++) dp[i] = -1;
    dp[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (dp[mask] < 0) continue;
        int op = __builtin_popcount(mask) / 2 + 1;
        for (int i = 0; i < m; i++) {
            if (mask >> i & 1) continue;
            for (int j = i + 1; j < m; j++) {
                if (mask >> j & 1) continue;
                int nxt = mask | 1 << i | 1 << j, v = dp[mask] + op * g[i][j];
                if (v > dp[nxt]) dp[nxt] = v;
            }
        }
    }
    int ans = dp[full - 1];
    free(dp);
    return ans;
}`,
        cpp: `int maxScore(vector<int>& nums) {
    int m = nums.size();
    vector<int> dp(1 << m, -1);
    dp[0] = 0;
    for (int mask = 0; mask < (1 << m); mask++) {
        if (dp[mask] < 0) continue;
        int op = __builtin_popcount(mask) / 2 + 1;
        for (int i = 0; i < m; i++) {
            if (mask >> i & 1) continue;
            for (int j = i + 1; j < m; j++) {
                if (mask >> j & 1) continue;
                int nxt = mask | 1 << i | 1 << j;
                dp[nxt] = max(dp[nxt], dp[mask] + op * gcd(nums[i], nums[j]));
            }
        }
    }
    return dp[(1 << m) - 1];
}`,
        java: `int maxScore(int[] nums) {
    int m = nums.length;
    int[] dp = new int[1 << m];
    Arrays.fill(dp, -1);
    dp[0] = 0;
    for (int mask = 0; mask < (1 << m); mask++) {
        if (dp[mask] < 0) continue;
        int op = Integer.bitCount(mask) / 2 + 1;
        for (int i = 0; i < m; i++) {
            if ((mask >> i & 1) == 1) continue;
            for (int j = i + 1; j < m; j++) {
                if ((mask >> j & 1) == 1) continue;
                int nxt = mask | 1 << i | 1 << j;
                dp[nxt] = Math.max(dp[nxt], dp[mask] + op * gcd(nums[i], nums[j]));
            }
        }
    }
    return dp[(1 << m) - 1];
}

int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }`,
        javascript: `function maxScore(nums) {
  const m = nums.length, gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const pop = (x) => x.toString(2).split('1').length - 1;
  const dp = new Array(1 << m).fill(-1);
  dp[0] = 0;
  for (let mask = 0; mask < 1 << m; mask++) {
    if (dp[mask] < 0) continue;
    const op = pop(mask) / 2 + 1;
    for (let i = 0; i < m; i++) {
      if ((mask >> i) & 1) continue;
      for (let j = i + 1; j < m; j++) {
        if ((mask >> j) & 1) continue;
        const nxt = mask | (1 << i) | (1 << j);
        dp[nxt] = Math.max(dp[nxt], dp[mask] + op * gcd(nums[i], nums[j]));
      }
    }
  }
  return dp[(1 << m) - 1];
}`,
      },
    },
  ],
  pitfalls: ['貪心先拿 gcd 最大的:錯,大的應該留到倍數大的後面,而且配對會互相影響', '狀態裡另外記「第幾次」:多餘,popcount 就能算出來', '暴力枚舉所有配對順序:14! 太大'],
  check: {
    kind: 'fn',
    fn: 'maxScore',
    cases: [
      { args: [[1, 2]], out: 1 },
      { args: [A], out: 11 },
      { args: [[1, 2, 3, 4, 5, 6]], out: 14 },
      { args: [[773274, 313112, 131789, 222437, 918065, 49745, 321270, 74163, 900218, 80160, 325440, 961730]], out: 3032 },
    ],
  },
}
