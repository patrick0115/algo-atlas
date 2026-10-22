import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 198. House Robber

const A = [2, 7, 9, 3, 1, 5]

function dpFig(): FigStep[] {
  const n = A.length
  const dp: (number | string)[] = Array(n).fill('?')
  const take: boolean[] = Array(n).fill(false)
  const out: FigStep[] = [{ note: 'dp[i] = 只看前 i+1 間房子(0..i)最多能偷多少。到第 i 間只有兩種選擇:不偷它(拿 dp[i−1]),或偷它(nums[i] + dp[i−2],因為隔壁 i−1 不能偷)', views: [arr(A, { label: 'nums(每間房子的錢)' }), arr(dp, { label: 'dp' })] }]
  for (let i = 0; i < n; i++) {
    const skip = i >= 1 ? (dp[i - 1] as number) : 0
    const rob = A[i] + (i >= 2 ? (dp[i - 2] as number) : 0)
    dp[i] = Math.max(skip, rob)
    take[i] = rob >= skip
    out.push({ note: `第 ${i} 間:不偷 → ${skip};偷 → ${A[i]} + ${i >= 2 ? dp[i - 2] : 0} = ${rob} → dp[${i}] = ${dp[i]}${take[i] ? '(偷比較好)' : '(不偷比較好)'}`, views: [arr(A, { label: 'nums', highlight: [i], compare: i >= 2 ? [i - 2] : [] }), arr(dp, { label: 'dp', highlight: [i], done: range(0, i - 1) })] })
  }
  const picked: number[] = []
  for (let i = n - 1; i >= 0; ) {
    if (take[i]) {
      picked.push(i)
      i -= 2
    } else i--
  }
  out.push({ note: `答案 dp[${n - 1}] = ${dp[n - 1]}。從後往回看哪些是「偷」:第 ${picked.reverse().join('、')} 間`, views: [arr(A, { label: 'nums', done: picked })] })
  return out
}

function memoFig(): FigStep[] {
  return [
    { note: 'f(i) = 從第 i 間往後最多能偷多少 = max(偷 i:nums[i] + f(i+2), 不偷 i:f(i+1))。沒有記憶化的話,f(i+2) 會在兩條分支裡都被算到', views: [arr(A, { label: 'nums' })] },
    { note: '加上 memo 之後每個 f(i) 只算一次,O(n)', views: [arr(A.map((_, i) => `f(${i})`), { label: '只有這 n 個子問題' })] },
  ]
}

export const q0198: Solution = {
  id: 198,
  plain: '一條街上有一排房子,每間有一些錢。小偷不能偷**相鄰**的兩間(會觸發警報),問最多能偷多少錢。到每一間都只有兩個選擇:偷(那前一間就不能偷)或不偷。',
  statement: '`nums[i]` 是第 i 間房子的金額,不能同時偷相鄰的兩間。回傳今晚最多能偷到的金額。',
  examples: [
    { input: 'nums = [1,2,3,1]', output: '4', note: '偷 0 和 2:1 + 3' },
    { input: 'nums = [2,7,9,3,1]', output: '12', note: '偷 0、2、4:2 + 9 + 1' },
  ],
  constraints: ['`1 ≤ n ≤ 100`,每間 `0 ~ 400`'],
  insight: [
    '貪心(每次挑最多的)不對:`[2,7,9,3,1]` 挑 9 之後 7 和 3 都不能偷,但最佳解也正好是 2+9+1;換成 `[2,1,1,2]` 貪心就錯了',
    '看第 i 間:**偷它** → 第 i−1 間不能偷,最好的就是 `nums[i] + dp[i−2]`;**不偷它** → 就是 `dp[i−1]`',
    '`dp[i] = max(dp[i−1], dp[i−2] + nums[i])`,只看前兩格 → 兩個變數就夠',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i)` = 從第 i 間到最後最多能偷多少:`max(nums[i] + f(i+2), f(i+1))`,i 超出範圍是 0。',
      steps: ['`f(i)`:`i >= n` → 0', '`memo[i] = max(nums[i] + f(i + 2), f(i + 1))`', '回傳 `f(0)`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: memoFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個 f(i) 算一次。' },
      verdict: '把「偷或不偷」的選擇直接寫成遞迴,最容易想。',
      code: {
        python: `from functools import lru_cache

def rob(nums):
    @lru_cache(maxsize=None)
    def f(i):
        if i >= len(nums):
            return 0
        return max(nums[i] + f(i + 2), f(i + 1))   # 偷 i(跳過 i+1)或不偷 i
    return f(0)`,
        c: `static int memo[101], *Nums, Nn;

static int f(int i) {
    if (i >= Nn) return 0;
    if (memo[i] >= 0) return memo[i];
    int a = Nums[i] + f(i + 2), b = f(i + 1);
    return memo[i] = a > b ? a : b;
}

int rob(int *nums, int numsSize) {
    Nums = nums; Nn = numsSize;
    for (int i = 0; i < numsSize; i++) memo[i] = -1;
    return f(0);
}`,
        cpp: `int rob(vector<int>& nums) {
    int n = nums.size();
    vector<int> memo(n, -1);
    function<int(int)> f = [&](int i) -> int {
        if (i >= n) return 0;
        if (memo[i] >= 0) return memo[i];
        return memo[i] = max(nums[i] + f(i + 2), f(i + 1));
    };
    return f(0);
}`,
        java: `private int[] memo, nums;

int rob(int[] nums) {
    this.nums = nums;
    memo = new int[nums.length];
    Arrays.fill(memo, -1);
    return f(0);
}

private int f(int i) {
    if (i >= nums.length) return 0;
    if (memo[i] >= 0) return memo[i];
    return memo[i] = Math.max(nums[i] + f(i + 2), f(i + 1));
}`,
        javascript: `function rob(nums) {
  const memo = new Array(nums.length).fill(-1);
  const f = (i) => {
    if (i >= nums.length) return 0;
    if (memo[i] >= 0) return memo[i];
    return (memo[i] = Math.max(nums[i] + f(i + 2), f(i + 1)));
  };
  return f(0);
}`,
      },
    },
    {
      name: '由前往後填表',
      idea: '`dp[i] = max(dp[i−1], dp[i−2] + nums[i])`,`dp[0] = nums[0]`,`dp[1] = max(nums[0], nums[1])`。',
      steps: ['`dp[0] = nums[0]`', '`dp[1] = max(nums[0], nums[1])`', '`dp[i] = max(dp[i−1], dp[i−2] + nums[i])`', '回傳 `dp[n−1]`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '填 n 格。' },
      verdict: '[[p:dp-1d]]的代表題。記住 dp 表,還能倒推出偷了哪幾間。',
      code: {
        python: `def rob(nums):
    n = len(nums)
    if n == 1:
        return nums[0]
    dp = [0] * n
    dp[0], dp[1] = nums[0], max(nums[0], nums[1])
    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])   # 不偷 / 偷第 i 間
    return dp[-1]`,
        c: `int rob(int *nums, int numsSize) {
    if (numsSize == 1) return nums[0];
    int dp[100];
    dp[0] = nums[0];
    dp[1] = nums[0] > nums[1] ? nums[0] : nums[1];
    for (int i = 2; i < numsSize; i++) {
        int a = dp[i - 1], b = dp[i - 2] + nums[i];
        dp[i] = a > b ? a : b;
    }
    return dp[numsSize - 1];
}`,
        cpp: `int rob(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return nums[0];
    vector<int> dp(n);
    dp[0] = nums[0];
    dp[1] = max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);
    return dp[n - 1];
}`,
        java: `int rob(int[] nums) {
    int n = nums.length;
    if (n == 1) return nums[0];
    int[] dp = new int[n];
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    return dp[n - 1];
}`,
        javascript: `function rob(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];
  const dp = [nums[0], Math.max(nums[0], nums[1])];
  for (let i = 2; i < n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  return dp[n - 1];
}`,
      },
    },
    {
      name: '兩個變數',
      idea: '`prev2` = dp[i−2]、`prev1` = dp[i−1]。每間房子:`cur = max(prev1, prev2 + x)`,再往前滾。',
      steps: ['`prev2 = prev1 = 0`', '每個 `x`:`prev2, prev1 = prev1, max(prev1, prev2 + x)`', '回傳 `prev1`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩個變數。' },
      verdict: '最佳解,而且不用特別處理 n = 1。[213](#/q/213)(環狀)會直接呼叫這個函式兩次。',
      code: {
        python: `def rob(nums):
    prev2 = prev1 = 0                     # dp[i-2], dp[i-1]
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1`,
        c: `int rob(int *nums, int numsSize) {
    int prev2 = 0, prev1 = 0;
    for (int i = 0; i < numsSize; i++) {
        int cur = prev1 > prev2 + nums[i] ? prev1 : prev2 + nums[i];
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
        cpp: `int rob(vector<int>& nums) {
    int prev2 = 0, prev1 = 0;
    for (int x : nums) {
        int cur = max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
        java: `int rob(int[] nums) {
    int prev2 = 0, prev1 = 0;
    for (int x : nums) {
        int cur = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
        javascript: `function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];
  return prev1;
}`,
      },
    },
  ],
  pitfalls: [
    '以為「偷奇數間或偶數間」二選一:`[2,1,1,2]` 最好是偷第 0 和第 3 間,不是奇偶',
    'dp[1] 寫成 nums[1]:只看前兩間時,應該挑比較大的那間',
    'n = 1 時填表版要特別處理(dp[1] 不存在)',
  ],
  followUp: [
    { q: '房子圍成一圈?', a: '[213. House Robber II](#/q/213):第一間和最後一間不能同時偷 → 分別去掉頭或尾,各跑一次這題。' },
    { q: '房子排成一棵樹?', a: '337. House Robber III:樹上的 DP,每個節點回傳(偷自己、不偷自己)兩個值。' },
  ],
  check: {
    kind: 'fn',
    fn: 'rob',
    cases: [
      { args: [[1, 2, 3, 1]], out: 4 },
      { args: [[2, 7, 9, 3, 1]], out: 12 },
      { args: [[5]], out: 5 },
      { args: [[2, 1, 1, 2]], out: 4 },
      { args: [A], out: 16 },
    ],
  },
}
