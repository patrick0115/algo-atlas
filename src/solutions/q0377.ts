import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 377. Combination Sum IV
const A = [1, 2, 3]
const bottomFig: FigStep[] = [
  { note: '順序算不同:1+3、3+1 是兩種。先決定最後放哪個數。', views: [arr(A, { label: '可用數字' }), arr([1, 1, 2, 4, 7], { label: 'dp[0..4]', done: [4] })] },
  { note: 'dp[4] = dp[3] + dp[2] + dp[1] = 4 + 2 + 1 = 7。dp[0] = 1 代表空序列。', views: [arr([4, 2, 1, 7], { label: '以 1、2、3 結尾及總數', done: [3] })] },
]
const memoFig: FigStep[] = [
  { note: '也能問「剩下 x 要怎麼湊」:每次先選一個數 v,再解 x−v。重複的 x 用備忘錄保存。', views: [arr([4, 3, 2, 1, 0], { label: '遞迴餘額' })] },
  { note: '到 0 是一種完成方式;小於 0 則不是。', views: [arr([1, 1, 2, 4, 7], { label: '備忘錄結果', done: [4] })] },
]

export const q0377: Solution = {
  id: 377,
  plain: '有幾種數字可以重複選,要排成一串使總和剛好等於目標。這題看排列順序,例如 1 再 3 和 3 再 1 算兩種。',
  statement: '給互不相同的正整數陣列 nums 和 target,求由 nums 的數字組成、總和等於 target 的有序序列數量。每個數字可重複使用。',
  examples: [{ input: 'nums = [1,2,3], target = 4', output: '7' }, { input: 'nums = [9], target = 3', output: '0' }],
  constraints: ['nums 最多 200 個正整數,target ≤ 1000', '答案保證在 32 位元整數範圍內'],
  insight: ['與 [518](#/q/518) 的差別是這裡順序有意義。', '令 dp[s] 為總和 s 的有序序列數;最後一個數可以是任何 v ≤ s。', '外層依總和遞增,內層遍歷 nums,就會把不同順序分開計數。'],
  approaches: [
    {
      name: '由小到大的動態規劃',
      idea: 'dp[0] = 1;對每個總和 s,把每個可當最後一個數 v 的 dp[s−v] 加起來。',
      steps: ['建立長度 target+1 的 dp,設 dp[0] = 1', '對 s = 1..target,逐一試 nums 中的 v', '如果 v ≤ s,累加 dp[s−v]', '回傳 dp[target]'],
      figure: { title: 'nums = [1,2,3], target = 4', steps: bottomFig },
      complexity: { time: 'O(target · n)', space: 'O(target)', why: '每個總和試所有 n 種數字。' },
      verdict: '推薦;不需要遞迴,迴圈順序直接表達「順序有差」。',
      code: {
        python: `def combinationSum4(nums, target):
    dp = [0] * (target + 1)
    dp[0] = 1
    for s in range(1, target + 1):
        for v in nums:
            if v <= s:
                dp[s] += dp[s - v]
    return dp[target]`,
        c: `int combinationSum4(int *nums, int numsSize, int target) {
    unsigned long long *dp = calloc(target + 1, sizeof(unsigned long long));
    dp[0] = 1;
    for (int s = 1; s <= target; s++)
        for (int i = 0; i < numsSize; i++)
            if (nums[i] <= s) dp[s] += dp[s - nums[i]];
    int ans = (int)dp[target];
    free(dp);
    return ans;
}`,
        cpp: `int combinationSum4(vector<int>& nums, int target) {
    vector<unsigned long long> dp(target + 1);
    dp[0] = 1;
    for (int s = 1; s <= target; s++)
        for (int v : nums) if (v <= s) dp[s] += dp[s - v];
    return (int)dp[target];
}`,
        java: `int combinationSum4(int[] nums, int target) {
    long[] dp = new long[target + 1];
    dp[0] = 1;
    for (int s = 1; s <= target; s++)
        for (int v : nums) if (v <= s) dp[s] += dp[s - v];
    return (int) dp[target];
}`,
        javascript: `function combinationSum4(nums, target) {
  const dp = Array(target + 1).fill(0);
  dp[0] = 1;
  for (let s = 1; s <= target; s++)
    for (const v of nums) if (v <= s) dp[s] += dp[s - v];
  return dp[target];
}`,
      },
    },
    {
      name: '記憶化搜尋',
      idea: '從目標開始往下拆:ways(s) = 所有 ways(s−v) 之和;算過的 s 放進備忘錄。',
      steps: ['ways(0) = 1', '對每個 v ≤ s,把 ways(s−v) 加入答案', '備忘錄保存每個 s 的結果', '回傳 ways(target)'],
      figure: { title: '從 4 往下拆', steps: memoFig },
      complexity: { time: 'O(target · n)', space: 'O(target)', why: '每個剩餘總和只求一次,另有遞迴堆疊。' },
      verdict: '從「先選一個數」的直覺出發,但 Python 可能需要提高遞迴深度。',
      code: {
        python: `from functools import lru_cache
import sys

def combinationSum4(nums, target):
    sys.setrecursionlimit(max(3000, target + 100))
    @lru_cache(None)
    def ways(s):
        if s == 0:
            return 1
        return sum(ways(s - v) for v in nums if v <= s)
    return ways(target)`,
        c: `static unsigned long long ways377(int s, int *nums, int n, unsigned long long *memo, bool *done) {
    if (s == 0) return 1;
    if (done[s]) return memo[s];
    done[s] = true;
    for (int i = 0; i < n; i++)
        if (nums[i] <= s) memo[s] += ways377(s - nums[i], nums, n, memo, done);
    return memo[s];
}
int combinationSum4(int *nums, int numsSize, int target) {
    unsigned long long *memo = calloc(target + 1, sizeof(unsigned long long));
    bool *done = calloc(target + 1, sizeof(bool));
    int ans = (int)ways377(target, nums, numsSize, memo, done);
    free(memo); free(done);
    return ans;
}`,
        cpp: `int combinationSum4(vector<int>& nums, int target) {
    vector<long long> memo(target + 1, -1);
    function<long long(int)> ways = [&](int s) -> long long {
        if (s == 0) return 1;
        if (memo[s] >= 0) return memo[s];
        long long ans = 0;
        for (int v : nums) if (v <= s) ans += ways(s - v);
        return memo[s] = ans;
    };
    return (int)ways(target);
}`,
        java: `long ways(int s, int[] nums, long[] memo) {
    if (s == 0) return 1;
    if (memo[s] >= 0) return memo[s];
    long ans = 0;
    for (int v : nums) if (v <= s) ans += ways(s - v, nums, memo);
    return memo[s] = ans;
}
int combinationSum4(int[] nums, int target) {
    long[] memo = new long[target + 1];
    Arrays.fill(memo, -1);
    return (int) ways(target, nums, memo);
}`,
        javascript: `function combinationSum4(nums, target) {
  const memo = Array(target + 1).fill(-1);
  const ways = s => {
    if (s === 0) return 1;
    if (memo[s] >= 0) return memo[s];
    let ans = 0;
    for (const v of nums) if (v <= s) ans += ways(s - v);
    return memo[s] = ans;
  };
  return ways(target);
}`,
      },
    },
  ],
  pitfalls: ['外層要遍歷總和,不是先遍歷數字;先遍歷數字算的是組合。', '空序列湊成 0 是一種方式,所以 dp[0] = 1。', '數字必須為正;如果允許負數,序列數可能無限多。'],
  check: { kind: 'fn', fn: 'combinationSum4', cases: [
    { args: [[1, 2, 3], 4], out: 7 }, { args: [[9], 3], out: 0 }, { args: [[2], 0], out: 1 }, { args: [[2, 3, 5], 7], out: 5 },
  ] },
}
