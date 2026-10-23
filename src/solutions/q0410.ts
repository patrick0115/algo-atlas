import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 410. Split Array Largest Sum

const A = [7, 2, 5, 10, 8]
const K = 2

function pieces(cap: number): number {
  let cnt = 1
  let cur = 0
  for (const x of A) {
    if (cur + x > cap) {
      cnt++
      cur = 0
    }
    cur += x
  }
  return cnt
}

function bsFig(): FigStep[] {
  let lo = Math.max(...A)
  let hi = A.reduce((a, b) => a + b, 0)
  const out: FigStep[] = [{ note: `換個問法:「每段總和不超過 c」時最少要切幾段?c 越大段數越少 → 二分搜尋最小的 c 使段數 ≤ ${K}。範圍 [${lo}, ${hi}]`, views: [arr(A, { label: 'nums' })] }]
  while (lo < hi) {
    const m = (lo + hi) >> 1
    const p = pieces(m)
    out.push({ note: `c = ${m}:貪心切,放不下就開新的一段 → ${p} 段 ${p <= K ? `≤ ${K},可以,hi = ${m}` : `> ${K},c 太小,lo = ${m + 1}`}`, views: [arr([lo, m, hi], { label: 'lo / c / hi', highlight: [1] })] })
    if (p <= K) hi = m
    else lo = m + 1
  }
  out.push({ note: `答案 ${lo}:[7,2,5] 與 [10,8],最大的一段是 18`, views: [arr(A, { label: '切法', range: [0, 2], done: [3, 4] })] })
  return out
}

function dpFig(): FigStep[] {
  return [
    { note: 'DP:`dp[j][i]` = 前 i 個數切成 j 段時「最大段和」的最小值。枚舉最後一段的起點 p:`dp[j][i] = min(max(dp[j−1][p], sum(p..i−1)))`', views: [arr(A, { label: 'nums' })] },
    { note: 'dp[1][i] 就是前綴和;dp[2][5] = min(max(7, 25), max(9, 23), max(14, 18), max(24, 8)) = 18', views: [arr([7, 9, 14, 24, 32], { label: 'dp[1][1..5]' }), arr([18], { label: 'dp[2][5]', done: [0] })] },
  ]
}

export const q0410: Solution = {
  id: 410,
  plain: '把一排數字切成 k 段連續的小段,每段各自加總。要怎麼切,才能讓「最大的那段總和」盡量小?',
  statement: '給整數陣列 `nums` 和整數 k,把 nums 切成 k 個非空的連續子陣列,使這些子陣列各自總和中的**最大值最小**。回傳這個最小的最大值。',
  examples: [
    { input: 'nums = [7,2,5,10,8], k = 2', output: '18', note: '[7,2,5] 和 [10,8]' },
    { input: 'nums = [1,2,3,4,5], k = 2', output: '9', note: '[1,2,3] 和 [4,5]' },
  ],
  constraints: ['n ≤ 1000,nums[i] ≤ 10⁶,k ≤ min(50, n)'],
  insight: ['「最小化最大值」→ 先猜答案 c,再問「做得到嗎」', '每段上限 c 時,貪心地能塞就塞,得到最少段數', '段數 ≤ k 就做得到(段數少可以再拆開,不會變大)→ 二分 c', '和 [1011](#/q/1011) 完全同一題,只是換了包裝'],
  approaches: [
    {
      name: '二分搜尋答案 + 貪心',
      idea: '`lo = max(nums)`、`hi = sum(nums)`;貪心算出上限 m 時的最少段數,`≤ k` → `hi = m`,否則 `lo = m + 1`。',
      steps: ['`pieces(c)`:累加,超過 c 就開新段,回傳段數', '`lo, hi = max, sum`', '`while lo < hi`:`m = (lo + hi) // 2`;`pieces(m) <= k` → `hi = m`,否則 `lo = m + 1`', '回傳 lo'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: bsFig() },
      complexity: { time: 'O(n log(sum))', space: 'O(1)', why: '二分 log(sum) 次,每次掃一遍。' },
      verdict: '最推薦,[[p:binary-search-answer]]的經典代表:「最小化最大值」幾乎都這樣做。',
      code: {
        python: `def splitArray(nums, k):
    def pieces(cap):                          # 每段 ≤ cap 時最少幾段
        cnt, cur = 1, 0
        for x in nums:
            if cur + x > cap:
                cnt += 1                      # 塞不下,開新的一段
                cur = 0
            cur += x
        return cnt

    lo, hi = max(nums), sum(nums)
    while lo < hi:
        m = (lo + hi) // 2
        if pieces(m) <= k:
            hi = m
        else:
            lo = m + 1
    return lo`,
        c: `static int pieces(int *a, int n, long long cap) {
    int cnt = 1;
    long long cur = 0;
    for (int i = 0; i < n; i++) {
        if (cur + a[i] > cap) { cnt++; cur = 0; }
        cur += a[i];
    }
    return cnt;
}

int splitArray(int *nums, int numsSize, int k) {
    long long lo = 0, hi = 0;
    for (int i = 0; i < numsSize; i++) { if (nums[i] > lo) lo = nums[i]; hi += nums[i]; }
    while (lo < hi) {
        long long m = lo + (hi - lo) / 2;
        if (pieces(nums, numsSize, m) <= k) hi = m;
        else lo = m + 1;
    }
    return (int)lo;
}`,
        cpp: `int splitArray(vector<int>& nums, int k) {
    auto pieces = [&](long long cap) {
        int cnt = 1;
        long long cur = 0;
        for (int x : nums) {
            if (cur + x > cap) { cnt++; cur = 0; }
            cur += x;
        }
        return cnt;
    };
    long long lo = *max_element(nums.begin(), nums.end()), hi = accumulate(nums.begin(), nums.end(), 0LL);
    while (lo < hi) {
        long long m = lo + (hi - lo) / 2;
        if (pieces(m) <= k) hi = m;
        else lo = m + 1;
    }
    return lo;
}`,
        java: `int splitArray(int[] nums, int k) {
    long lo = 0, hi = 0;
    for (int x : nums) { lo = Math.max(lo, x); hi += x; }
    while (lo < hi) {
        long m = lo + (hi - lo) / 2, cur = 0;
        int cnt = 1;
        for (int x : nums) {
            if (cur + x > m) { cnt++; cur = 0; }
            cur += x;
        }
        if (cnt <= k) hi = m;
        else lo = m + 1;
    }
    return (int) lo;
}`,
        javascript: `function splitArray(nums, k) {
  const pieces = (cap) => {
    let cnt = 1, cur = 0;
    for (const x of nums) {
      if (cur + x > cap) {
        cnt++;
        cur = 0;
      }
      cur += x;
    }
    return cnt;
  };
  let lo = Math.max(...nums), hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const m = Math.floor((lo + hi) / 2);
    if (pieces(m) <= k) hi = m;
    else lo = m + 1;
  }
  return lo;
}`,
      },
    },
    {
      name: '區間 DP',
      idea: '`dp[j][i]` = 前 i 個數切成 j 段的最小最大段和;`dp[j][i] = min over p of max(dp[j−1][p], pre[i] − pre[p])`。',
      steps: ['前綴和 pre', '`dp[0][0] = 0`,其餘 ∞', '`for j in 1..k`、`for i in j..n`、`for p in j−1..i−1`:取 `max(dp[j−1][p], pre[i] − pre[p])` 的最小', '回傳 `dp[k][n]`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: dpFig() },
      complexity: { time: 'O(k · n²)', space: 'O(k · n)', why: '三層迴圈;n ≤ 1000、k ≤ 50 時約 5·10⁷。' },
      verdict: '不需要「單調性」的洞察,直接把切法列舉出來;面試先講這個再優化成二分也很好。',
      code: {
        python: `def splitArray(nums, k):
    n = len(nums)
    pre = [0] * (n + 1)
    for i, x in enumerate(nums):
        pre[i + 1] = pre[i] + x
    INF = float('inf')
    dp = [[INF] * (n + 1) for _ in range(k + 1)]
    dp[0][0] = 0
    for j in range(1, k + 1):
        for i in range(j, n + 1):
            for p in range(j - 1, i):         # 最後一段是 nums[p..i-1]
                dp[j][i] = min(dp[j][i], max(dp[j - 1][p], pre[i] - pre[p]))
    return dp[k][n]`,
        c: `int splitArray(int *nums, int numsSize, int k) {
    int n = numsSize;
    long long *pre = calloc(n + 1, sizeof(long long));
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    long long *dp = malloc((size_t)(k + 1) * (n + 1) * sizeof(long long));
    for (int i = 0; i < (k + 1) * (n + 1); i++) dp[i] = LLONG_MAX;
    dp[0] = 0;
    for (int j = 1; j <= k; j++)
        for (int i = j; i <= n; i++)
            for (int p = j - 1; p < i; p++) {
                long long prev = dp[(j - 1) * (n + 1) + p];
                if (prev == LLONG_MAX) continue;
                long long v = prev > pre[i] - pre[p] ? prev : pre[i] - pre[p];
                if (v < dp[j * (n + 1) + i]) dp[j * (n + 1) + i] = v;
            }
    int ans = (int)dp[k * (n + 1) + n];
    free(pre); free(dp);
    return ans;
}`,
        cpp: `int splitArray(vector<int>& nums, int k) {
    int n = nums.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    vector<vector<long long>> dp(k + 1, vector<long long>(n + 1, LLONG_MAX));
    dp[0][0] = 0;
    for (int j = 1; j <= k; j++)
        for (int i = j; i <= n; i++)
            for (int p = j - 1; p < i; p++)
                if (dp[j - 1][p] != LLONG_MAX)
                    dp[j][i] = min(dp[j][i], max(dp[j - 1][p], pre[i] - pre[p]));
    return dp[k][n];
}`,
        java: `int splitArray(int[] nums, int k) {
    int n = nums.length;
    long[] pre = new long[n + 1];
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    long[][] dp = new long[k + 1][n + 1];
    for (long[] row : dp) Arrays.fill(row, Long.MAX_VALUE);
    dp[0][0] = 0;
    for (int j = 1; j <= k; j++)
        for (int i = j; i <= n; i++)
            for (int p = j - 1; p < i; p++)
                if (dp[j - 1][p] != Long.MAX_VALUE)
                    dp[j][i] = Math.min(dp[j][i], Math.max(dp[j - 1][p], pre[i] - pre[p]));
    return (int) dp[k][n];
}`,
        javascript: `function splitArray(nums, k) {
  const n = nums.length, pre = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
  const dp = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity));
  dp[0][0] = 0;
  for (let j = 1; j <= k; j++)
    for (let i = j; i <= n; i++)
      for (let p = j - 1; p < i; p++)
        dp[j][i] = Math.min(dp[j][i], Math.max(dp[j - 1][p], pre[i] - pre[p]));
  return dp[k][n];
}`,
      },
    },
  ],
  pitfalls: ['以為段數必須「剛好」k:貪心得到 < k 段也算可行,多出的段數可以從任一段拆出來', '下界寫成 0 或 1:比最大元素還小時,那個元素自己就放不下', '總和可到 10⁹,C/Java 要小心 int 溢位'],
  check: {
    kind: 'fn',
    fn: 'splitArray',
    cases: [
      { args: [A, K], out: 18 },
      { args: [[1, 2, 3, 4, 5], 2], out: 9 },
      { args: [[1, 4, 4], 3], out: 4 },
      { args: [[10], 1], out: 10 },
    ],
  },
}
