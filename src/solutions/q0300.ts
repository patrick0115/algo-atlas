import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 300. Longest Increasing Subsequence

const A = [10, 9, 2, 5, 3, 7, 101, 18]

function dpFig(): FigStep[] {
  const dp: (number | string)[] = A.map(() => '')
  const out: FigStep[] = [{ note: 'dp[i] = 以 nums[i] **結尾**的最長遞增子序列長度。它可以接在前面任何一個「比它小」的數後面 → dp[i] = 1 + max(dp[j]),j < i 且 nums[j] < nums[i]', views: [arr(A, { label: 'nums', mode: 'bars' }), arr(dp, { label: 'dp' })] }]
  for (let i = 0; i < A.length; i++) {
    let best = 0
    let from = -1
    for (let j = 0; j < i; j++) if (A[j] < A[i] && (dp[j] as number) > best) (best = dp[j] as number), (from = j)
    dp[i] = best + 1
    const smaller = range(0, i - 1).filter((j) => A[j] < A[i])
    out.push({ note: `nums[${i}] = ${A[i]}:前面比它小的有 ${smaller.map((j) => A[j]).join('、') || '(沒有)'}${from >= 0 ? `,其中 dp 最大的是 ${A[from]}(${best})` : ''} → dp[${i}] = ${dp[i]}`, views: [arr(A, { label: 'nums', mode: 'bars', highlight: [i], compare: smaller }), arr(dp, { label: 'dp', highlight: [i], compare: from >= 0 ? [from] : [] })] })
  }
  const mx = Math.max(...(dp as number[]))
  out.push({ note: `答案 = dp 裡最大的 ${mx}(例如 2, 3, 7, 18)`, views: [arr(dp, { label: 'dp', done: dp.flatMap((v, i) => (v === mx ? [i] : [])) })] })
  return out
}

function tailsFig(): FigStep[] {
  const tails: number[] = []
  const out: FigStep[] = [{ note: 'tails[k] = 「長度 k+1 的遞增子序列」裡,**最小的結尾**是多少。結尾越小,後面越容易接上更多數。tails 一定是遞增的 → 可以二分', views: [arr(A, { label: 'nums' }), arr(tails, { label: 'tails' })] }]
  A.forEach((x, i) => {
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < x) lo = mid + 1
      else hi = mid
    }
    const append = lo === tails.length
    const old = tails[lo]
    tails[lo] = x
    out.push({ note: append ? `${x} 比 tails 裡所有數都大 → 接在最後,最長變成 ${tails.length}` : `二分找到第一個 ≥ ${x} 的位置 ${lo}(原本是 ${old})→ 換成 ${x}:長度 ${lo + 1} 的子序列有了更小的結尾`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), arr([...tails], { label: 'tails', highlight: [lo] })] })
  })
  out.push({ note: `tails 的長度 ${tails.length} 就是答案。注意 tails 本身不一定是一個真的子序列,只有長度有意義`, views: [arr(tails, { label: 'tails', done: range(0, tails.length - 1) })] })
  return out
}

export const q0300: Solution = {
  id: 300,
  plain: '在一串數字裡,挑出一些數(保持原本的前後順序,可以跳著挑),讓它們**嚴格遞增**。最長能挑幾個?例如 [10,9,2,5,3,7,101,18] 可以挑 2,3,7,18,長度 4。',
  statement: '給整數陣列 `nums`,回傳最長**嚴格遞增子序列**的長度。子序列可以跳過元素,但不能改變順序。',
  examples: [
    { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4' },
    { input: 'nums = [0,1,0,3,2,3]', output: '4' },
    { input: 'nums = [7,7,7,7]', output: '1', note: '嚴格遞增,相等不算' },
  ],
  constraints: ['`n ≤ 2500` → O(n²) 是 600 萬,能過;follow-up 要 O(n log n)'],
  insight: [
    '子序列可以跳著選,所以要決定「誰接在誰後面」。DP 狀態:`dp[i]` = 以 nums[i] **結尾**的 LIS 長度',
    '`dp[i] = 1 + max(dp[j])`,其中 `j < i` 且 `nums[j] < nums[i]` → O(n²)',
    '更快的想法(耐心排序):維護 `tails[k]` = 長度 k+1 的遞增子序列中「最小的結尾」。新的數 x:找到第一個 ≥ x 的位置換成 x;都比 x 小就接在最後',
    'tails 永遠是遞增的,所以找位置用二分搜尋 → O(n log n)',
  ],
  approaches: [
    {
      name: 'DP:以每個數結尾的最長長度',
      idea: '`dp[i] = 1 + max(dp[j] for j < i if nums[j] < nums[i])`(沒有就是 1)。答案是 dp 的最大值。',
      steps: ['`dp = [1] * n`', '`for i`:`for j < i`:`nums[j] < nums[i]` → `dp[i] = max(dp[i], dp[j] + 1)`', '回傳 `max(dp)`'],
      figure: { title: `nums = [${A}]`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個 i 看所有前面的 j。' },
      verdict: '標準的 O(n²) DP,[[p:lis]]的基本形式。「以 i 結尾」的狀態定義在序列 DP 裡很常見。',
      code: {
        python: `def lengthOfLIS(nums):
    n = len(nums)
    dp = [1] * n                          # dp[i]:以 nums[i] 結尾的 LIS 長度
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:         # 可以接在 nums[j] 後面
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
        c: `int lengthOfLIS(int *nums, int numsSize) {
    int dp[2500], best = 0;
    for (int i = 0; i < numsSize; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
        if (dp[i] > best) best = dp[i];
    }
    return best;
}`,
        cpp: `int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
    return *max_element(dp.begin(), dp.end());
}`,
        java: `int lengthOfLIS(int[] nums) {
    int n = nums.length, best = 0;
    int[] dp = new int[n];
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
        best = Math.max(best, dp[i]);
    }
    return best;
}`,
        javascript: `function lengthOfLIS(nums) {
  const n = nums.length, dp = new Array(n).fill(1);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
  return Math.max(...dp);
}`,
      },
    },
    {
      name: 'tails 陣列 + 二分搜尋',
      idea: '`tails[k]` = 長度 k+1 的遞增子序列的最小結尾。每個 x:用二分找第一個 ≥ x 的位置 p;p == len(tails) → append,否則 `tails[p] = x`。',
      steps: ['`tails = []`', '每個 x:`p = lower_bound(tails, x)`', '`p == len(tails)` → `tails.append(x)`;否則 `tails[p] = x`', '回傳 `len(tails)`'],
      figure: { title: `nums = [${A}]`, steps: tailsFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每個數一次二分 O(log n)。' },
      verdict: 'Follow-up 的最佳解。用「≥」(lower_bound)找位置對應**嚴格**遞增;如果是「非遞減」就改用「>」(upper_bound)。',
      code: {
        python: `from bisect import bisect_left

def lengthOfLIS(nums):
    tails = []                            # tails[k]:長度 k+1 的遞增子序列的最小結尾
    for x in nums:
        p = bisect_left(tails, x)         # 第一個 >= x 的位置
        if p == len(tails):
            tails.append(x)               # 比全部都大:最長的再長一格
        else:
            tails[p] = x                  # 讓長度 p+1 的結尾變得更小
    return len(tails)`,
        c: `int lengthOfLIS(int *nums, int numsSize) {
    int tails[2500], len = 0;
    for (int i = 0; i < numsSize; i++) {
        int lo = 0, hi = len;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (tails[mid] < nums[i]) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = nums[i];
        if (lo == len) len++;
    }
    return len;
}`,
        cpp: `int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}`,
        java: `int lengthOfLIS(int[] nums) {
    int[] tails = new int[nums.length];
    int len = 0;
    for (int x : nums) {
        int lo = 0, hi = len;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = x;
        if (lo == len) len++;
    }
    return len;
}`,
        javascript: `function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}`,
      },
    },
  ],
  pitfalls: [
    '回傳 `dp[n−1]`:答案是 dp 的**最大值**,LIS 不一定以最後一個數結尾',
    '把 tails 當成真正的 LIS 輸出:它只有長度是對的,內容可能是不同子序列拼起來的',
    '嚴格遞增要用 lower_bound(第一個 ≥);用 upper_bound 的話 `[7,7,7]` 會得到 3',
  ],
  followUp: [
    { q: '要輸出其中一個 LIS?', a: 'DP 版多記 `prev[i]`(接在誰後面),最後從最大的 dp 往回走。' },
    { q: '二維的版本?', a: '354. Russian Doll Envelopes:依寬度排序(寬度相同時高度遞減),再對高度做這題的 O(n log n) LIS。' },
  ],
  check: {
    kind: 'fn',
    fn: 'lengthOfLIS',
    cases: [
      { args: [A], out: 4 },
      { args: [[0, 1, 0, 3, 2, 3]], out: 4 },
      { args: [[7, 7, 7, 7]], out: 1 },
      { args: [[5]], out: 1 },
      { args: [[4, 10, 4, 3, 8, 9]], out: 3 },
      { args: [[1, 3, 6, 7, 9, 4, 10, 5, 6]], out: 6 },
    ],
  },
}
