import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 416. Partition Equal Subset Sum

const A = [1, 5, 11, 5]

function dpFig(): FigStep[] {
  const total = A.reduce((a, b) => a + b, 0)
  const T = total / 2
  const dp = Array(T + 1).fill(false)
  dp[0] = true
  const show = () => dp.map((v) => (v ? '✓' : '·'))
  const out: FigStep[] = [{ note: `分成兩堆總和相等 ⇔ 能不能挑出一些數,總和剛好是 總和 / 2 = ${total} / 2 = ${T}。dp[s] = 「目前看過的數裡,能不能挑出和為 s 的」,dp[0] = ✓`, views: [arr(A, { label: 'nums' }), arr(show(), { label: `dp[0..${T}]` })] }]
  A.forEach((x, i) => {
    const newly: number[] = []
    for (let s = T; s >= x; s--)
      if (!dp[s] && dp[s - x]) {
        dp[s] = true
        newly.push(s)
      }
    out.push({ note: `加入 ${x}:s 從大到小,dp[s] |= dp[s − ${x}]。${newly.length ? `新能湊出的:${newly.sort((a, b) => a - b).join('、')}` : '沒有新的'}(由大到小是為了每個數只用一次)`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), arr(show(), { label: 'dp', highlight: newly })] })
  })
  out.push({ note: `dp[${T}] = ${dp[T] ? '✓ → true(例如 1 + 5 + 5 = 11)' : '· → false'}`, views: [arr(show(), { label: 'dp', done: dp[T] ? [T] : [] })] })
  return out
}

function setFig(): FigStep[] {
  let sums = new Set([0])
  const out: FigStep[] = [{ note: '另一種寫法:用一個集合記住「目前能湊出哪些和」。每加入一個數 x,就把舊的每個和都再加上 x', views: [arr([...sums], { label: '能湊出的和' })] }]
  for (const x of A) {
    sums = new Set([...sums, ...[...sums].map((s) => s + x)])
    out.push({ note: `加入 ${x}`, views: [arr([...sums].sort((a, b) => a - b), { label: '能湊出的和' })] })
  }
  return out
}

export const q0416: Solution = {
  id: 416,
  plain: '一堆正整數,能不能分成**兩堆、總和一樣**?等於問:能不能從裡面挑出一些數,剛好湊到「全部總和的一半」。這是經典的 0/1 背包:每個數只能選或不選。',
  statement: '給一個只含正整數的陣列 `nums`,判斷能不能把它分成兩個子集,使兩個子集的元素和相等。',
  examples: [
    { input: 'nums = [1,5,11,5]', output: 'true', note: '[1,5,5] 和 [11]' },
    { input: 'nums = [1,2,3,5]', output: 'false', note: '總和 11 是奇數' },
  ],
  constraints: ['`n ≤ 200`,每個數 ≤ 100 → 總和 ≤ 20000,一半 ≤ 10000'],
  insight: [
    '兩堆相等 → 每堆都是總和的一半。總和是奇數 → 一定不行',
    '問題變成:「能不能挑出一些數,和剛好是 target = 總和 / 2」—— 每個數選或不選,這是 **0/1 背包**',
    '`dp[s]` = 能不能湊出 s。加入數 x 後:`dp[s] = dp[s] or dp[s − x]`',
    '一維寫法的關鍵:s 要**由大到小**更新,才不會在同一輪把 x 用兩次',
  ],
  approaches: [
    {
      name: '0/1 背包 DP(一維、s 由大到小)',
      idea: '`target = sum / 2`;`dp[0] = True`。每個數 x:`for s in target..x`(遞減):`dp[s] |= dp[s − x]`。',
      steps: ['總和是奇數 → false', '`dp = [True] + [False] * target`', '對每個 x:s 從 target 往下到 x:`dp[s] = dp[s] or dp[s − x]`', '回傳 `dp[target]`'],
      figure: { title: `nums = [${A}]`, steps: dpFig() },
      complexity: { time: 'O(n · target)', space: 'O(target)', why: 'n 個數 × target 個和,最多 200 × 10000 = 2·10⁶。' },
      verdict: '標準解,[[p:knapsack]]「0/1 背包、可行性」的模板。和 518 的差別就在內層方向:0/1 由大到小、完全背包由小到大。',
      code: {
        python: `def canPartition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [True] + [False] * target        # dp[s]:能不能湊出 s
    for x in nums:
        for s in range(target, x - 1, -1):    # 由大到小:每個數只用一次
            dp[s] = dp[s] or dp[s - x]
    return dp[target]`,
        c: `bool canPartition(int *nums, int numsSize) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (total % 2) return false;
    int target = total / 2;
    bool *dp = calloc(target + 1, sizeof(bool));
    dp[0] = true;
    for (int i = 0; i < numsSize; i++)
        for (int s = target; s >= nums[i]; s--) dp[s] = dp[s] || dp[s - nums[i]];
    bool ok = dp[target];
    free(dp);
    return ok;
}`,
        cpp: `bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2) return false;
    int target = total / 2;
    vector<bool> dp(target + 1, false);
    dp[0] = true;
    for (int x : nums)
        for (int s = target; s >= x; s--) dp[s] = dp[s] || dp[s - x];
    return dp[target];
}`,
        java: `boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int x : nums)
        for (int s = target; s >= x; s--) dp[s] = dp[s] || dp[s - x];
    return dp[target];
}`,
        javascript: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const x of nums) for (let s = target; s >= x; s--) dp[s] = dp[s] || dp[s - x];
  return dp[target];
}`,
      },
    },
    {
      name: '可湊出的和的集合(或 bitset)',
      idea: '集合 `sums` = 目前能湊出的所有和。每個數 x:`sums |= {s + x for s in sums}`。最後看 target 在不在。用位元可以一次平移整個集合(`bits |= bits << x`)。',
      steps: ['`sums = {0}`', '每個 x:`sums = sums ∪ {s + x}`(只留 ≤ target 的)', '`target in sums`'],
      figure: { title: `nums = [${A}]`, steps: setFig() },
      complexity: { time: 'O(n · target)', space: 'O(target)', why: '集合最多 target + 1 個值。bitset 版本常數小很多(一次處理 64 個和)。' },
      verdict: '和 DP 是同一件事,只是換個資料結構。Python 用大整數當 bitset 寫起來只要一行,而且很快。',
      code: {
        python: `def canPartition(nums):
    total = sum(nums)
    if total % 2:
        return False
    bits = 1                              # 第 s 個 bit = 能不能湊出 s
    for x in nums:
        bits |= bits << x                 # 每個能湊出的和都再加上 x
    return ((bits >> (total // 2)) & 1) == 1`,
        c: `bool canPartition(int *nums, int numsSize) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (total % 2) return false;
    int target = total / 2;
    // 用 64 位元的字組當 bitset
    int words = target / 64 + 1;
    unsigned long long *b = calloc(words, sizeof(unsigned long long));
    b[0] = 1;
    for (int i = 0; i < numsSize; i++) {
        int x = nums[i], ws = x / 64, bs = x % 64;
        for (int w = words - 1; w >= 0; w--) {   // b |= b << x,由高往低避免覆蓋
            unsigned long long v = 0;
            if (w - ws >= 0) v |= b[w - ws] << bs;
            if (bs && w - ws - 1 >= 0) v |= b[w - ws - 1] >> (64 - bs);
            b[w] |= v;
        }
    }
    bool ok = (b[target / 64] >> (target % 64)) & 1;
    free(b);
    return ok;
}`,
        cpp: `bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2) return false;
    bitset<10001> bits;                       // target 最多 10000
    bits[0] = 1;
    for (int x : nums) bits |= bits << x;
    return bits[total / 2];
}`,
        java: `boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 != 0) return false;
    int target = total / 2;
    BitSet bits = new BitSet(target + 1);
    bits.set(0);
    for (int x : nums) {
        BitSet shifted = new BitSet(target + 1);
        for (int s = bits.nextSetBit(0); s >= 0 && s + x <= target; s = bits.nextSetBit(s + 1)) shifted.set(s + x);
        bits.or(shifted);
    }
    return bits.get(target);
}`,
        javascript: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  let sums = new Set([0]);
  for (const x of nums) {
    const next = new Set(sums);
    for (const s of sums) if (s + x <= target) next.add(s + x);
    sums = next;
  }
  return sums.has(target);
}`,
      },
    },
  ],
  pitfalls: [
    '一維 DP 的內層由小到大:同一個數會被用很多次(`[1, 3]` 的 target 是 2,由小到大時 1 會被用兩次湊出 2,誤判成 true),變成完全背包',
    '沒先檢查總和的奇偶',
    '想用貪心(由大到小,每次放進目前較小的那堆):不一定成功,例如 `[3,3,2,2,2]`(會變成 7 對 5,但 3+3 / 2+2+2 可行)',
  ],
  followUp: [{ q: '要分成 k 堆?', a: '698. Partition to K Equal Sum Subsets:k 變大後要用回溯 + 剪枝,或狀態壓縮 DP。' }],
  check: {
    kind: 'fn',
    fn: 'canPartition',
    cases: [
      { args: [A], out: true },
      { args: [[1, 2, 3, 5]], out: false },
      { args: [[3, 3, 2, 2, 2]], out: true },
      { args: [[1, 3]], out: false },
      { args: [[1, 2, 5]], out: false },
      { args: [[2, 2, 1, 1]], out: true },
    ],
  },
}
