import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 673. Number of Longest Increasing Subsequence
const A = [1, 3, 5, 4, 7]
const dpFig: FigStep[] = [
  { note: '以每個位置結尾,同時記錄「最長長度」和「達到這個長度的方案數」。只能接在較小的數後面。', views: [arr(A, { label: 'nums' }), arr([1, 2, 3, 3, 4], { label: 'len' }), arr([1, 1, 1, 1, 2], { label: 'count', done: [4] })] },
  { note: '7 可以接在 5 或 4 後面,兩條長度都是 4,所以方案數是 1 + 1 = 2。', views: [arr([1, 3, 5, 7], { label: '第一條' }), arr([1, 3, 4, 7], { label: '第二條' })] },
]
const bitFig: FigStep[] = [
  { note: '把數值排序後編成名次。對當前 x,只查所有小於 x 的名次,取得最佳的 (長度,方案數)。', views: [arr([1, 3, 4, 5, 7], { label: '排序後的不同數值' })] },
  { note: '樹狀陣列保存每段數值範圍的最佳配對:長度較大就取代,長度相同就把方案數相加。', views: [arr([4, 2], { label: '全域最佳:長度、方案數', done: [1] })] },
]

export const q0673: Solution = {
  id: 673,
  plain: '在數列裡可以跳著挑數,但順序不能改,而且每個下一個數都要更大。這題不只問最長能挑幾個,還問最長的挑法有幾種。',
  statement: '給整數陣列 nums,回傳最長嚴格遞增子序列的個數。不同位置形成的子序列算不同方案。',
  examples: [{ input: 'nums = [1,3,5,4,7]', output: '2' }, { input: 'nums = [2,2,2,2,2]', output: '5' }],
  constraints: ['1 ≤ nums.length ≤ 2000', '答案保證在 32 位元整數範圍內'],
  insight: ['延伸自 [300](#/q/300):只保存長度不夠,還要保存達到該長度的方法數。', '若新的前驅產生更長序列,重設計數;若長度相同,把計數相加。', '數值相等不可互接,樹狀陣列查詢時只取嚴格小於當前值的範圍。'],
  approaches: [
    {
      name: '雙陣列動態規劃',
      idea: 'len[i] 是以 nums[i] 結尾的最長長度,count[i] 是達成該長度的方案數。',
      steps: ['所有 len 和 count 初始化為 1', '對每個 i,檢查前面所有 nums[j] < nums[i] 的 j', '若 len[j]+1 更長就取代 len[i] 和 count[i];一樣長就累加 count[j]', '找最大長度,加總所有該長度的 count'],
      figure: { title: 'nums = [1,3,5,4,7]', steps: dpFig },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個位置檢查所有更早的位置。' },
      verdict: '推薦;資料量 2000 時平方複雜度可行,狀態意義也最清楚。',
      code: {
        python: `def findNumberOfLIS(nums):
    n = len(nums)
    length, count = [1] * n, [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] >= nums[i]:
                continue
            if length[j] + 1 > length[i]:
                length[i], count[i] = length[j] + 1, count[j]
            elif length[j] + 1 == length[i]:
                count[i] += count[j]
    best = max(length)
    return sum(count[i] for i in range(n) if length[i] == best)`,
        c: `int findNumberOfLIS(int *nums, int numsSize) {
    int n = numsSize, *len = malloc(n * sizeof(int));
    long long *count = malloc(n * sizeof(long long));
    int best = 1;
    for (int i = 0; i < n; i++) {
        len[i] = 1; count[i] = 1;
        for (int j = 0; j < i; j++) if (nums[j] < nums[i]) {
            if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; count[i] = count[j]; }
            else if (len[j] + 1 == len[i]) count[i] += count[j];
        }
        if (len[i] > best) best = len[i];
    }
    long long ans = 0;
    for (int i = 0; i < n; i++) if (len[i] == best) ans += count[i];
    free(len); free(count);
    return (int)ans;
}`,
        cpp: `int findNumberOfLIS(vector<int>& nums) {
    int n = nums.size(), best = 1;
    vector<int> len(n, 1);
    vector<long long> count(n, 1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) if (nums[j] < nums[i]) {
            if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; count[i] = count[j]; }
            else if (len[j] + 1 == len[i]) count[i] += count[j];
        }
        best = max(best, len[i]);
    }
    long long ans = 0;
    for (int i = 0; i < n; i++) if (len[i] == best) ans += count[i];
    return (int)ans;
}`,
        java: `int findNumberOfLIS(int[] nums) {
    int n = nums.length, best = 1;
    int[] len = new int[n];
    long[] count = new long[n];
    Arrays.fill(len, 1); Arrays.fill(count, 1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) if (nums[j] < nums[i]) {
            if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; count[i] = count[j]; }
            else if (len[j] + 1 == len[i]) count[i] += count[j];
        }
        best = Math.max(best, len[i]);
    }
    long ans = 0;
    for (int i = 0; i < n; i++) if (len[i] == best) ans += count[i];
    return (int)ans;
}`,
        javascript: `function findNumberOfLIS(nums) {
  const n = nums.length, len = Array(n).fill(1), count = Array(n).fill(1);
  let best = 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) {
      if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; count[i] = count[j]; }
      else if (len[j] + 1 === len[i]) count[i] += count[j];
    }
    best = Math.max(best, len[i]);
  }
  return count.reduce((sum, ways, i) => sum + (len[i] === best ? ways : 0), 0);
}`,
      },
    },
    {
      name: '座標壓縮加樹狀陣列',
      idea: '每次查「比目前數值小」的所有序列中最佳 (長度,方案數),再把目前序列的結果寫回。',
      steps: ['把不同數值排序並編成 1 起算的名次', '查詢名次 rank−1 的前綴最佳配對', '若沒有前驅,新配對是 (1,1);否則是 (最佳長度+1,最佳方案數)', '更新 rank;全部處理完查詢整棵樹'],
      figure: { title: '數值前綴最佳配對', steps: bitFig },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序後,每個位置做一次前綴查詢與單點更新。' },
      verdict: '適合需要更快時間時;實作比平方 DP 複雜。',
      code: {
        python: `def findNumberOfLIS(nums):
    values = sorted(set(nums))
    rank = {v: i + 1 for i, v in enumerate(values)}
    bit = [(0, 0)] * (len(values) + 1)
    def merge(a, b):
        if a[0] != b[0]:
            return a if a[0] > b[0] else b
        return (a[0], a[1] + b[1])
    def query(i):
        ans = (0, 0)
        while i:
            ans = merge(ans, bit[i])
            i -= i & -i
        return ans
    def update(i, value):
        while i < len(bit):
            bit[i] = merge(bit[i], value)
            i += i & -i
    for x in nums:
        i = rank[x]
        length, ways = query(i - 1)
        update(i, (length + 1, ways if length else 1))
    return query(len(values))[1]`,
        c: `static int cmp673(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
int findNumberOfLIS(int *nums, int numsSize) {
    int n = numsSize, *vals = malloc(n * sizeof(int));
    memcpy(vals, nums, n * sizeof(int));
    qsort(vals, n, sizeof(int), cmp673);
    int k = 0;
    for (int i = 0; i < n; i++) if (!k || vals[i] != vals[k - 1]) vals[k++] = vals[i];
    int *len = calloc(k + 1, sizeof(int));
    long long *ways = calloc(k + 1, sizeof(long long));
    for (int t = 0; t < n; t++) {
        int lo = 0, hi = k;
        while (lo < hi) { int mid = (lo + hi) / 2; if (vals[mid] < nums[t]) lo = mid + 1; else hi = mid; }
        int rank = lo + 1, best = 0;
        long long count = 0;
        for (int i = rank - 1; i > 0; i -= i & -i) {
            if (len[i] > best) { best = len[i]; count = ways[i]; }
            else if (len[i] == best) count += ways[i];
        }
        int nextLen = best + 1; long long nextWays = best ? count : 1;
        for (int i = rank; i <= k; i += i & -i) {
            if (nextLen > len[i]) { len[i] = nextLen; ways[i] = nextWays; }
            else if (nextLen == len[i]) ways[i] += nextWays;
        }
    }
    int best = 0; long long ans = 0;
    for (int i = k; i > 0; i -= i & -i) {
        if (len[i] > best) { best = len[i]; ans = ways[i]; }
        else if (len[i] == best) ans += ways[i];
    }
    free(vals); free(len); free(ways);
    return (int)ans;
}`,
        cpp: `int findNumberOfLIS(vector<int>& nums) {
    vector<int> vals = nums;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    using Pair = pair<int, long long>;
    vector<Pair> bit(vals.size() + 1, {0, 0});
    auto merge = [](Pair a, Pair b) -> Pair {
        if (a.first != b.first) return a.first > b.first ? a : b;
        return {a.first, a.second + b.second};
    };
    auto query = [&](int i) {
        Pair ans = {0, 0};
        for (; i > 0; i -= i & -i) ans = merge(ans, bit[i]);
        return ans;
    };
    for (int x : nums) {
        int rank = lower_bound(vals.begin(), vals.end(), x) - vals.begin() + 1;
        auto [len, ways] = query(rank - 1);
        Pair cur = {len + 1, len ? ways : 1};
        for (int i = rank; i < (int)bit.size(); i += i & -i) bit[i] = merge(bit[i], cur);
    }
    return (int)query(vals.size()).second;
}`,
        java: `int findNumberOfLIS(int[] nums) {
    int[] vals = nums.clone();
    Arrays.sort(vals);
    int k = 0;
    for (int x : vals) if (k == 0 || x != vals[k - 1]) vals[k++] = x;
    int[] length = new int[k + 1];
    long[] ways = new long[k + 1];
    for (int x : nums) {
        int lo = 0, hi = k;
        while (lo < hi) { int mid = (lo + hi) / 2; if (vals[mid] < x) lo = mid + 1; else hi = mid; }
        int rank = lo + 1, best = 0;
        long count = 0;
        for (int i = rank - 1; i > 0; i -= i & -i) {
            if (length[i] > best) { best = length[i]; count = ways[i]; }
            else if (length[i] == best) count += ways[i];
        }
        int nextLen = best + 1;
        long nextWays = best == 0 ? 1 : count;
        for (int i = rank; i <= k; i += i & -i) {
            if (nextLen > length[i]) { length[i] = nextLen; ways[i] = nextWays; }
            else if (nextLen == length[i]) ways[i] += nextWays;
        }
    }
    int best = 0; long ans = 0;
    for (int i = k; i > 0; i -= i & -i) {
        if (length[i] > best) { best = length[i]; ans = ways[i]; }
        else if (length[i] == best) ans += ways[i];
    }
    return (int)ans;
}`,
        javascript: `function findNumberOfLIS(nums) {
  const vals = [...new Set(nums)].sort((a, b) => a - b);
  const bit = Array.from({ length: vals.length + 1 }, () => [0, 0]);
  const merge = (a, b) => a[0] !== b[0] ? (a[0] > b[0] ? a : b) : [a[0], a[1] + b[1]];
  const query = i => {
    let ans = [0, 0];
    for (; i > 0; i -= i & -i) ans = merge(ans, bit[i]);
    return ans;
  };
  for (const x of nums) {
    let lo = 0, hi = vals.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (vals[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    const rank = lo + 1, [len, ways] = query(rank - 1);
    const cur = [len + 1, len ? ways : 1];
    for (let i = rank; i < bit.length; i += i & -i) bit[i] = merge(bit[i], cur);
  }
  return query(vals.length)[1];
}`,
      },
    },
  ],
  pitfalls: ['嚴格遞增要求前驅數值更小,相等不能接在一起。', '碰到更長路徑時應重設方案數;只有一樣長時才累加。', '答案可能來自多個結尾位置,要把全域最大長度的方案數加總。'],
  check: { kind: 'fn', fn: 'findNumberOfLIS', cases: [
    { args: [A], out: 2 }, { args: [[2, 2, 2, 2, 2]], out: 5 },
    { args: [[1]], out: 1 }, { args: [[1, 2, 4, 3, 5, 4, 7, 2]], out: 3 },
  ] },
}
