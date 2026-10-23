import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2466. Count Ways To Build Good Strings

const LOW = 2
const HIGH = 3
const ZERO = 1
const ONE = 2

function dpFig(): FigStep[] {
  const dp = Array(HIGH + 1).fill(0)
  dp[0] = 1
  for (let i = 1; i <= HIGH; i++) dp[i] = (i >= ZERO ? dp[i - ZERO] : 0) + (i >= ONE ? dp[i - ONE] : 0)
  return [
    { note: `從空字串開始,每一步可以接上 ${ZERO} 個 "0" 或 ${ONE} 個 "1"。長度在 [${LOW}, ${HIGH}] 的字串算「好字串」,問有幾種`, views: [arr(['+ "0"', '+ "11"'], { label: '每一步的選擇' })] },
    { note: '`dp[i]` = 長度剛好 i 的組法數。最後一步接的是 "0"…(zero 個)或 "1"…(one 個):`dp[i] = dp[i − zero] + dp[i − one]`', views: [arr(dp, { label: 'dp[0..high]', highlight: [LOW, HIGH] })] },
    { note: `答案 = dp[${LOW}] + … + dp[${HIGH}] = ${dp.slice(LOW).reduce((a, b) => a + b, 0)}:"00"、"11"、"000"、"011"、"110"`, views: [arr(['00', '11', '000', '011', '110'], { label: '好字串', done: [0, 1, 2, 3, 4] })] },
  ]
}

function memoFig(): FigStep[] {
  return [
    { note: '由上而下的寫法:`f(len)` = 目前長度 len,之後還能產生幾個好字串。len 在範圍內就 +1,再往兩個方向遞迴', views: [arr(['f(0) = f(1) + f(2)'], { label: '遞迴式' })] },
    { note: 'len > high 就停止。記憶化後每個長度只算一次', views: [arr([5], { label: '答案', done: [0] })] },
  ]
}

export const q2466: Solution = {
  id: 2466,
  plain: '從空字串開始,每一步可以在後面接上「zero 個 0」或「one 個 1」。長度在 low 到 high 之間的字串叫「好字串」。總共能做出幾種不同的好字串?答案取餘 10⁹ + 7。',
  statement: '給整數 `low`、`high`、`zero`、`one`。從空字串出發,每步選擇附加 zero 個 `"0"` 或 one 個 `"1"`。長度介於 [low, high] 的字串為好字串。回傳不同好字串的數量,對 10⁹ + 7 取餘。',
  examples: [
    { input: 'low = 3, high = 3, zero = 1, one = 1', output: '8', note: '所有長度 3 的 0/1 字串' },
    { input: 'low = 2, high = 3, zero = 1, one = 2', output: '5', note: '"00"、"11"、"000"、"110"、"011"' },
  ],
  constraints: ['1 ≤ low ≤ high ≤ 10⁵'],
  insight: ['不同的操作序列產生不同的字串 → 數「操作序列」就好', '和 [70](#/q/70) 爬樓梯完全同構:每次走 zero 或 one 步', '[[p:dp-1d]]:`dp[i] = dp[i − zero] + dp[i − one]`'],
  approaches: [
    {
      name: '由下往上 DP',
      idea: '`dp[0] = 1`;`dp[i] = dp[i − zero] + dp[i − one]`(索引 ≥ 0 才加);答案是 `Σ dp[low..high]`。',
      steps: ['`dp = [0] * (high + 1)`、`dp[0] = 1`', '`for i in 1..high`:兩種最後一步相加,取餘', '`sum(dp[low:high + 1]) % MOD`'],
      figure: { title: `low = ${LOW},high = ${HIGH},zero = ${ZERO},one = ${ONE}`, steps: dpFig() },
      complexity: { time: 'O(high)', space: 'O(high)', why: '每個長度 O(1)。' },
      verdict: '最推薦,就是換了包裝的爬樓梯。',
      code: {
        python: `def countGoodStrings(low, high, zero, one):
    MOD = 10 ** 9 + 7
    dp = [0] * (high + 1)
    dp[0] = 1                                 # 空字串
    for i in range(1, high + 1):
        if i >= zero:
            dp[i] += dp[i - zero]             # 最後接的是 zero 個 0
        if i >= one:
            dp[i] += dp[i - one]              # 最後接的是 one 個 1
        dp[i] %= MOD
    return sum(dp[low:high + 1]) % MOD`,
        c: `int countGoodStrings(int low, int high, int zero, int one) {
    const int MOD = 1000000007;
    int *dp = calloc(high + 1, sizeof(int));
    dp[0] = 1;
    long long ans = 0;
    for (int i = 1; i <= high; i++) {
        long long v = 0;
        if (i >= zero) v += dp[i - zero];
        if (i >= one) v += dp[i - one];
        dp[i] = v % MOD;
        if (i >= low) ans = (ans + dp[i]) % MOD;
    }
    free(dp);
    return (int)ans;
}`,
        cpp: `int countGoodStrings(int low, int high, int zero, int one) {
    const int MOD = 1e9 + 7;
    vector<long long> dp(high + 1, 0);
    dp[0] = 1;
    long long ans = 0;
    for (int i = 1; i <= high; i++) {
        if (i >= zero) dp[i] += dp[i - zero];
        if (i >= one) dp[i] += dp[i - one];
        dp[i] %= MOD;
        if (i >= low) ans = (ans + dp[i]) % MOD;
    }
    return ans;
}`,
        java: `int countGoodStrings(int low, int high, int zero, int one) {
    final int MOD = 1_000_000_007;
    long[] dp = new long[high + 1];
    dp[0] = 1;
    long ans = 0;
    for (int i = 1; i <= high; i++) {
        if (i >= zero) dp[i] += dp[i - zero];
        if (i >= one) dp[i] += dp[i - one];
        dp[i] %= MOD;
        if (i >= low) ans = (ans + dp[i]) % MOD;
    }
    return (int) ans;
}`,
        javascript: `function countGoodStrings(low, high, zero, one) {
  const MOD = 1e9 + 7, dp = new Array(high + 1).fill(0);
  dp[0] = 1;
  let ans = 0;
  for (let i = 1; i <= high; i++) {
    if (i >= zero) dp[i] += dp[i - zero];
    if (i >= one) dp[i] += dp[i - one];
    dp[i] %= MOD;
    if (i >= low) ans = (ans + dp[i]) % MOD;
  }
  return ans;
}`,
      },
    },
    {
      name: '記憶化遞迴(由上往下)',
      idea: '`f(len)`:len > high → 0;否則 `(1 if len ≥ low) + f(len + zero) + f(len + one)`;記憶化。',
      steps: ['`f(len)`:`len > high` → 0', '`res = 1 if len >= low else 0`', '`res += f(len + zero) + f(len + one)`', '回傳 `f(0)`'],
      figure: { title: `low = ${LOW},high = ${HIGH},zero = ${ZERO},one = ${ONE}`, steps: memoFig() },
      complexity: { time: 'O(high)', space: 'O(high)', why: '每個長度算一次;遞迴深度最多 high / min(zero, one)。' },
      verdict: '比較貼近題目「一步一步加上去」的描述;high 很大時遞迴深度要注意。',
      code: {
        python: `import sys
from functools import lru_cache

def countGoodStrings(low, high, zero, one):
    sys.setrecursionlimit(1 << 20)
    MOD = 10 ** 9 + 7

    @lru_cache(None)
    def f(length):                            # 從這個長度出發還能產生幾個好字串
        if length > high:
            return 0
        res = 1 if length >= low else 0
        return (res + f(length + zero) + f(length + one)) % MOD

    for i in range(high, -1, -1):             # 由大到小先填,避免遞迴太深
        f(i)
    return f(0)`,
        c: `static int *memo, LOW, HIGH, ZERO, ONE;

static int f(int len) {
    if (len > HIGH) return 0;
    if (memo[len] >= 0) return memo[len];
    long long r = (len >= LOW) + (long long)f(len + ZERO) + f(len + ONE);
    return memo[len] = r % 1000000007;
}

int countGoodStrings(int low, int high, int zero, int one) {
    LOW = low; HIGH = high; ZERO = zero; ONE = one;
    memo = malloc((high + 1) * sizeof(int));
    for (int i = 0; i <= high; i++) memo[i] = -1;
    // 由大到小先填,避免遞迴太深
    for (int i = high; i >= 0; i--) f(i);
    int ans = f(0);
    free(memo);
    return ans;
}`,
        cpp: `int countGoodStrings(int low, int high, int zero, int one) {
    const int MOD = 1e9 + 7;
    vector<int> memo(high + 1, -1);
    function<int(int)> f = [&](int len) -> int {
        if (len > high) return 0;
        if (memo[len] >= 0) return memo[len];
        long long r = (len >= low) + (long long)f(len + zero) + f(len + one);
        return memo[len] = r % MOD;
    };
    for (int i = high; i >= 0; i--) f(i);     // 由大到小先填,避免遞迴太深
    return f(0);
}`,
        java: `int[] memo;
int LOW, HIGH, ZERO, ONE;

int f(int len) {
    if (len > HIGH) return 0;
    if (memo[len] >= 0) return memo[len];
    long r = (len >= LOW ? 1 : 0) + (long) f(len + ZERO) + f(len + ONE);
    return memo[len] = (int) (r % 1_000_000_007);
}

int countGoodStrings(int low, int high, int zero, int one) {
    LOW = low; HIGH = high; ZERO = zero; ONE = one;
    memo = new int[high + 1];
    Arrays.fill(memo, -1);
    for (int i = high; i >= 0; i--) f(i);     // 由大到小先填,避免遞迴太深
    return f(0);
}`,
        javascript: `function countGoodStrings(low, high, zero, one) {
  const MOD = 1e9 + 7, memo = new Array(high + 1).fill(-1);
  const f = (len) => {
    if (len > high) return 0;
    if (memo[len] >= 0) return memo[len];
    return (memo[len] = ((len >= low ? 1 : 0) + f(len + zero) + f(len + one)) % MOD);
  };
  for (let i = high; i >= 0; i--) f(i);
  return f(0);
}`,
      },
    },
  ],
  pitfalls: ['只算 dp[high]:長度在 [low, high] 的都要加', '加總後才取餘:中間值可能溢位(C / Java)', 'zero == one 時兩種操作得到不同字串("00" vs "11"),要分別算'],
  check: {
    kind: 'fn',
    fn: 'countGoodStrings',
    cases: [
      { args: [3, 3, 1, 1], out: 8 },
      { args: [LOW, HIGH, ZERO, ONE], out: 5 },
      { args: [200, 200, 10, 1], out: 764262396 },
      { args: [1, 100000, 1, 1], out: 215447031 },
    ],
  },
}
