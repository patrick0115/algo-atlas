import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1984. Minimum Difference Between Highest and Lowest of K Scores

const A = [9, 4, 1, 7]
const K = 2

function winFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const out: FigStep[] = [{ note: `要挑 ${K} 個分數,讓最高和最低差最少。先排序:挑出來的 ${K} 個在排序後**連續**最好(中間有空隙的話,把空隙裡的換進來只會讓差更小)`, views: [arr(s, { label: '排序後' })] }]
  let best = Infinity
  for (let i = 0; i + K <= s.length; i++) {
    const d = s[i + K - 1] - s[i]
    best = Math.min(best, d)
    out.push({ note: `視窗 [${i}, ${i + K - 1}]:${s[i + K - 1]} − ${s[i]} = ${d},目前最小 ${best}`, views: [arr(s, { label: '排序後', range: [i, i + K - 1], highlight: [i, i + K - 1] })] })
  }
  return out
}

function countFig(): FigStep[] {
  return [
    { note: '分數 ≤ 10⁵:可以用計數排序代替比較排序。cnt[v] = 分數 v 出現幾次,再依序展開', views: [arr([0, 1, 0, 0, 1, 0, 0, 1, 0, 1], { label: 'cnt[0..9]' })] },
    { note: '展開成 [1, 4, 7, 9],接下來和方法一一樣滑動視窗。O(n + V)', views: [arr([1, 4, 7, 9], { label: '展開後' })] },
  ]
}

export const q1984: Solution = {
  id: 1984,
  plain: '從一班同學的分數裡挑 k 個人,讓這 k 個人「最高分減最低分」的差距盡量小。',
  statement: '給整數陣列 `nums`(第 i 位學生的分數)和整數 `k`,選出 k 個分數,使其中最大值與最小值的差**最小**,回傳這個最小差。',
  examples: [
    { input: 'nums = [90], k = 1', output: '0' },
    { input: 'nums = [9,4,1,7], k = 2', output: '2', note: '挑 9 和 7' },
  ],
  constraints: ['k ≤ n ≤ 1000', '分數 ≤ 10⁵'],
  insight: ['只關心最大和最小 → 排序後,最好的 k 個一定是連續的一段', '所以用長度 k 的視窗滑過排序後的陣列,差 = 右端 − 左端,取最小'],
  approaches: [
    {
      name: '排序 + 固定長度視窗',
      idea: '排序後 `min(nums[i + k − 1] − nums[i])`。',
      steps: ['排序', '`for i in 0..n−k`:`best = min(best, nums[i + k − 1] − nums[i])`', '回傳 best'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: winFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '排序的成本;視窗 O(n)。' },
      verdict: '最推薦,[[p:sliding-window]]的固定長度版本,排序後一行搞定。',
      code: {
        python: `def minimumDifference(nums, k):
    nums.sort()
    return min(nums[i + k - 1] - nums[i] for i in range(len(nums) - k + 1))`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int minimumDifference(int *nums, int numsSize, int k) {
    qsort(nums, numsSize, sizeof(int), cmp);
    int best = INT_MAX;
    for (int i = 0; i + k <= numsSize; i++)
        if (nums[i + k - 1] - nums[i] < best) best = nums[i + k - 1] - nums[i];
    return best;
}`,
        cpp: `int minimumDifference(vector<int>& nums, int k) {
    sort(nums.begin(), nums.end());
    int best = INT_MAX;
    for (int i = 0; i + k <= (int)nums.size(); i++) best = min(best, nums[i + k - 1] - nums[i]);
    return best;
}`,
        java: `int minimumDifference(int[] nums, int k) {
    Arrays.sort(nums);
    int best = Integer.MAX_VALUE;
    for (int i = 0; i + k <= nums.length; i++) best = Math.min(best, nums[i + k - 1] - nums[i]);
    return best;
}`,
        javascript: `function minimumDifference(nums, k) {
  nums.sort((a, b) => a - b);
  let best = Infinity;
  for (let i = 0; i + k <= nums.length; i++) best = Math.min(best, nums[i + k - 1] - nums[i]);
  return best;
}`,
      },
    },
    {
      name: '計數排序 + 視窗',
      idea: '分數範圍小,用 `cnt[v]` 計數排序,再滑視窗。',
      steps: ['`cnt[v] += 1`', '依 v 由小到大展開', '同樣的視窗計算'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: countFig() },
      complexity: { time: 'O(n + V)', space: 'O(V)', why: 'V = 10⁵ 是分數範圍。' },
      verdict: 'n 很大、值域很小時可以把排序降到線性;這題 n 只有 1000,差別不大。',
      code: {
        python: `def minimumDifference(nums, k):
    cnt = [0] * (max(nums) + 1)
    for v in nums:
        cnt[v] += 1
    s = [v for v in range(len(cnt)) for _ in range(cnt[v])]   # 計數排序
    return min(s[i + k - 1] - s[i] for i in range(len(s) - k + 1))`,
        c: `int minimumDifference(int *nums, int numsSize, int k) {
    int mx = 0;
    for (int i = 0; i < numsSize; i++) if (nums[i] > mx) mx = nums[i];
    int *cnt = calloc(mx + 1, sizeof(int)), p = 0;
    for (int i = 0; i < numsSize; i++) cnt[nums[i]]++;
    for (int v = 0; v <= mx; v++) while (cnt[v]--) nums[p++] = v;
    free(cnt);
    int best = INT_MAX;
    for (int i = 0; i + k <= numsSize; i++)
        if (nums[i + k - 1] - nums[i] < best) best = nums[i + k - 1] - nums[i];
    return best;
}`,
        cpp: `int minimumDifference(vector<int>& nums, int k) {
    int mx = *max_element(nums.begin(), nums.end()), p = 0;
    vector<int> cnt(mx + 1);
    for (int v : nums) cnt[v]++;
    for (int v = 0; v <= mx; v++) while (cnt[v]--) nums[p++] = v;
    int best = INT_MAX;
    for (int i = 0; i + k <= (int)nums.size(); i++) best = min(best, nums[i + k - 1] - nums[i]);
    return best;
}`,
        java: `int minimumDifference(int[] nums, int k) {
    int mx = 0, p = 0;
    for (int v : nums) mx = Math.max(mx, v);
    int[] cnt = new int[mx + 1];
    for (int v : nums) cnt[v]++;
    for (int v = 0; v <= mx; v++) while (cnt[v]-- > 0) nums[p++] = v;
    int best = Integer.MAX_VALUE;
    for (int i = 0; i + k <= nums.length; i++) best = Math.min(best, nums[i + k - 1] - nums[i]);
    return best;
}`,
        javascript: `function minimumDifference(nums, k) {
  const mx = Math.max(...nums), cnt = new Array(mx + 1).fill(0);
  for (const v of nums) cnt[v]++;
  let p = 0;
  for (let v = 0; v <= mx; v++) while (cnt[v]-- > 0) nums[p++] = v;
  let best = Infinity;
  for (let i = 0; i + k <= nums.length; i++) best = Math.min(best, nums[i + k - 1] - nums[i]);
  return best;
}`,
      },
    },
  ],
  pitfalls: ['沒排序就滑視窗:原陣列的相鄰元素沒有意義', '視窗右端寫成 `i + k`:差一,會越界'],
  check: {
    kind: 'fn',
    fn: 'minimumDifference',
    cases: [
      { args: [[90], 1], out: 0 },
      { args: [A, K], out: 2 },
      { args: [[87063, 61094, 44530, 21297, 95857, 93551, 9918], 6], out: 74560 },
      { args: [[1, 1, 1], 3], out: 0 },
    ],
  },
}
