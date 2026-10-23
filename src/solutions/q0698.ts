import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 698. Partition to K Equal Sum Subsets
const A = [4, 3, 2, 3, 5, 2, 1], K = 4
const bucketsFig: FigStep[] = [
  { note: '總和 20,分成 4 組,每組必須是 5。先把大的數放進桶,超過 5 就不能放。', views: [arr(A, { label: 'nums' }), arr([5, 5, 5, 5], { label: '四個桶的目標' })] },
  { note: '一種分法是 [5]、[4,1]、[3,2]、[3,2]。每個數恰好用一次。', views: [arr([5], { label: '桶 1' }), arr([4, 1], { label: '桶 2' }), arr([3, 2], { label: '桶 3' }), arr([3, 2], { label: '桶 4' })] },
]
const maskFig: FigStep[] = [
  { note: '用二進位遮罩表示已使用哪些數。dp[mask] 是目前正在填的那一組已有多少,填滿 5 就回到 0。', views: [arr([0, 4, 68], { label: '遮罩值(二進位 0000000、0000100、1000100)' })] },
  { note: '若所有位置都已使用,且最後一組剛好填滿,就能分成 4 組。', views: [arr(['可分成四組'], { label: '答案', done: [0] })] },
]

export const q0698: Solution = {
  id: 698,
  plain: '把一堆數字分進 k 個盒子,每個數字只能用一次,每個盒子的總和要完全相同。問能不能分成功。',
  statement: '給正整數陣列 nums 和整數 k,判斷能否把所有元素分成 k 個非空子集合,使每組的元素總和相同。',
  examples: [
    { input: 'nums = [4,3,2,3,5,2,1], k = 4', output: 'true' },
    { input: 'nums = [1,2,3,4], k = 3', output: 'false' },
  ],
  constraints: ['nums 最多 16 個正整數', '所有元素都必須用到,每個恰好一次'],
  insight: ['總和若不能被 k 整除,直接失敗;每組目標是 total/k。', '先放大數可更早發現超出目標,空桶彼此等價可跳過重複嘗試。', 'n ≤ 16 也適合用位元遮罩記錄已使用的位置。'],
  approaches: [
    {
      name: '回溯填 k 個桶',
      idea: '由大到小把數字放進不超過目標的桶,失敗時撤回;等價的空桶只試一個。',
      steps: ['檢查總和能整除 k 且最大值 ≤ 目標', '把 nums 由大到小排序', '對目前數字試每個尚有空間的桶,放入後遞迴下一個', '若試空桶也失敗,其他空桶可直接略過'],
      figure: { title: 'nums = [4,3,2,3,5,2,1],k = 4', steps: bucketsFig },
      complexity: { time: 'O(k^n) 最壞', space: 'O(n+k)', why: '每個數字最多試 k 個桶;排序和對稱剪枝通常大幅減少分支。' },
      verdict: '直覺且能展示剪枝的效果;最壞情況仍可能很慢。',
      code: {
        python: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    nums = sorted(nums, reverse=True)
    if nums[0] > target:
        return False
    buckets = [0] * k
    def dfs(i):
        if i == len(nums):
            return True
        seen = set()
        for b in range(k):
            old = buckets[b]
            if old in seen or old + nums[i] > target:
                continue
            seen.add(old)
            buckets[b] += nums[i]
            if dfs(i + 1):
                return True
            buckets[b] = old
        return False
    return dfs(0)`,
        c: `static int cmp698(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (y > x) - (y < x);
}
static bool dfs698(int i, int n, int *a, int k, int target, int *buckets) {
    if (i == n) return true;
    for (int b = 0; b < k; b++) {
        if (buckets[b] + a[i] > target) continue;
        bool same = false;
        for (int prev = 0; prev < b; prev++) if (buckets[prev] == buckets[b]) same = true;
        if (same) continue;
        buckets[b] += a[i];
        if (dfs698(i + 1, n, a, k, target, buckets)) return true;
        buckets[b] -= a[i];
    }
    return false;
}
bool canPartitionKSubsets(int *nums, int numsSize, int k) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (total % k) return false;
    int target = total / k;
    int *a = malloc(numsSize * sizeof(int)), *buckets = calloc(k, sizeof(int));
    memcpy(a, nums, numsSize * sizeof(int));
    qsort(a, numsSize, sizeof(int), cmp698);
    bool ans = a[0] <= target && dfs698(0, numsSize, a, k, target, buckets);
    free(a); free(buckets);
    return ans;
}`,
        cpp: `bool canPartitionKSubsets(vector<int>& nums, int k) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % k) return false;
    int target = total / k;
    vector<int> a = nums, buckets(k);
    sort(a.rbegin(), a.rend());
    if (a[0] > target) return false;
    function<bool(int)> dfs = [&](int i) {
        if (i == (int)a.size()) return true;
        unordered_set<int> seen;
        for (int b = 0; b < k; b++) {
            if (buckets[b] + a[i] > target || seen.count(buckets[b])) continue;
            seen.insert(buckets[b]);
            buckets[b] += a[i];
            if (dfs(i + 1)) return true;
            buckets[b] -= a[i];
        }
        return false;
    };
    return dfs(0);
}`,
        java: `boolean dfs(int i, int[] a, int target, int[] buckets) {
    if (i == a.length) return true;
    Set<Integer> seen = new HashSet<>();
    for (int b = 0; b < buckets.length; b++) {
        if (buckets[b] + a[i] > target || !seen.add(buckets[b])) continue;
        buckets[b] += a[i];
        if (dfs(i + 1, a, target, buckets)) return true;
        buckets[b] -= a[i];
    }
    return false;
}
boolean canPartitionKSubsets(int[] nums, int k) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % k != 0) return false;
    int target = total / k;
    int[] a = nums.clone();
    Arrays.sort(a);
    for (int l = 0, r = a.length - 1; l < r; l++, r--) {
        int t = a[l]; a[l] = a[r]; a[r] = t;
    }
    return a[0] <= target && dfs(0, a, target, new int[k]);
}`,
        javascript: `function canPartitionKSubsets(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % k) return false;
  const target = total / k, a = [...nums].sort((x, y) => y - x);
  if (a[0] > target) return false;
  const buckets = Array(k).fill(0);
  const dfs = i => {
    if (i === a.length) return true;
    const seen = new Set();
    for (let b = 0; b < k; b++) {
      if (buckets[b] + a[i] > target || seen.has(buckets[b])) continue;
      seen.add(buckets[b]);
      buckets[b] += a[i];
      if (dfs(i + 1)) return true;
      buckets[b] -= a[i];
    }
    return false;
  };
  return dfs(0);
}`,
      },
    },
    {
      name: '位元遮罩動態規劃',
      idea: 'dp[mask] 記錄選了這些數後,目前這一組已填的總和;填滿目標就歸零開始下一組。',
      steps: ['同樣先檢查總和與最大值', 'dp[0] = 0,其他狀態設不可達', '從可達 mask 嘗試加入每個未選且不超過當前組目標的數', '新餘額為 (dp[mask]+nums[i]) % target;最後檢查完整 mask'],
      figure: { title: '遮罩表示用過的位置', steps: maskFig },
      complexity: { time: 'O(n·2^n)', space: 'O(2^n)', why: '至多 2^n 個選取集合,每個試 n 個元素。' },
      verdict: 'n ≤ 16 時能給出較穩定的時間上界。',
      code: {
        python: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    if max(nums) > target:
        return False
    n = len(nums)
    dp = [-1] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] < 0:
            continue
        for i, x in enumerate(nums):
            if not (mask >> i & 1) and dp[mask] + x <= target:
                dp[mask | (1 << i)] = (dp[mask] + x) % target
    return dp[-1] == 0`,
        c: `bool canPartitionKSubsets(int *nums, int numsSize, int k) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (total % k) return false;
    int target = total / k, size = 1 << numsSize;
    for (int i = 0; i < numsSize; i++) if (nums[i] > target) return false;
    int *dp = malloc(size * sizeof(int));
    for (int mask = 0; mask < size; mask++) dp[mask] = -1;
    dp[0] = 0;
    for (int mask = 0; mask < size; mask++) if (dp[mask] >= 0)
        for (int i = 0; i < numsSize; i++)
            if (!(mask & (1 << i)) && dp[mask] + nums[i] <= target)
                dp[mask | (1 << i)] = (dp[mask] + nums[i]) % target;
    bool ans = dp[size - 1] == 0;
    free(dp);
    return ans;
}`,
        cpp: `bool canPartitionKSubsets(vector<int>& nums, int k) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % k) return false;
    int target = total / k, n = nums.size();
    if (*max_element(nums.begin(), nums.end()) > target) return false;
    vector<int> dp(1 << n, -1);
    dp[0] = 0;
    for (int mask = 0; mask < (1 << n); mask++) if (dp[mask] >= 0)
        for (int i = 0; i < n; i++)
            if (!(mask & (1 << i)) && dp[mask] + nums[i] <= target)
                dp[mask | (1 << i)] = (dp[mask] + nums[i]) % target;
    return dp.back() == 0;
}`,
        java: `boolean canPartitionKSubsets(int[] nums, int k) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % k != 0) return false;
    int target = total / k, n = nums.length, size = 1 << n;
    for (int x : nums) if (x > target) return false;
    int[] dp = new int[size];
    Arrays.fill(dp, -1);
    dp[0] = 0;
    for (int mask = 0; mask < size; mask++) if (dp[mask] >= 0)
        for (int i = 0; i < n; i++)
            if ((mask & (1 << i)) == 0 && dp[mask] + nums[i] <= target)
                dp[mask | (1 << i)] = (dp[mask] + nums[i]) % target;
    return dp[size - 1] == 0;
}`,
        javascript: `function canPartitionKSubsets(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % k) return false;
  const target = total / k, n = nums.length, size = 1 << n;
  if (Math.max(...nums) > target) return false;
  const dp = Array(size).fill(-1);
  dp[0] = 0;
  for (let mask = 0; mask < size; mask++) if (dp[mask] >= 0)
    for (let i = 0; i < n; i++)
      if (!(mask & (1 << i)) && dp[mask] + nums[i] <= target)
        dp[mask | (1 << i)] = (dp[mask] + nums[i]) % target;
  return dp[size - 1] === 0;
}`,
      },
    },
  ],
  pitfalls: ['每個數都要使用一次,不能只找到 k−1 組後忽略剩餘數。', '總和可整除仍不保證可分組,還要檢查實際排列。', '回溯時相同桶總和代表等價選擇,略過可以減少大量重複搜尋。'],
  check: { kind: 'fn', fn: 'canPartitionKSubsets', cases: [
    { args: [A, K], out: true }, { args: [[1, 2, 3, 4], 3], out: false },
    { args: [[2, 2, 2, 2, 3, 4, 5], 4], out: false },
    { args: [[1, 1, 1, 1], 4], out: true },
  ] },
}
