import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1838. Frequency of the Most Frequent Element

const A = [1, 4, 8, 13]
const K = 5

function winFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  let l = 0
  let sum = 0
  let best = 0
  const out: FigStep[] = [{ note: `每次操作只能把某個數 +1,最多 ${K} 次。排序後,讓一段連續的數**都變成這段的最大值**最划算。視窗 [l, r] 需要的操作數 = nums[r] × 長度 − 視窗總和`, views: [arr(s, { label: '排序後', mode: 'bars' })] }]
  for (let r = 0; r < s.length; r++) {
    sum += s[r]
    const shrunk: number[] = []
    while (s[r] * (r - l + 1) - sum > K) {
      sum -= s[l]
      shrunk.push(l)
      l++
    }
    best = Math.max(best, r - l + 1)
    out.push({ note: `r = ${r}(${s[r]}):${shrunk.length ? `成本超過 ${K},縮掉 ${shrunk.map((i) => s[i]).join('、')};` : ''}視窗 [${l}, ${r}] 成本 ${s[r]}×${r - l + 1} − ${sum} = ${s[r] * (r - l + 1) - sum},長度 ${r - l + 1},最長 ${best}`, views: [arr(s, { label: '排序後', mode: 'bars', range: [l, r], highlight: [r], dim: shrunk })] })
  }
  return out
}

function bsFig(): FigStep[] {
  return [
    { note: '另一種:固定右端 r 當「目標值」,二分搜尋最左可以到哪個 l(用前綴和 O(1) 算成本)。成本隨 l 往左而增加 → 單調', views: [arr([1, 4, 8, 13], { label: '排序後', highlight: [2], range: [1, 2] })] },
    { note: 'r = 2(8):l = 1 時成本 8×2 − 12 = 4 ≤ 5 ✓;l = 0 時 8×3 − 13 = 11 > 5 ✗ → 最多 2 個。每個 r 一次二分,O(n log n)', views: [arr([1, 4, 8, 13], { label: '排序後', range: [1, 2], done: [1, 2] })] },
  ]
}

export const q1838: Solution = {
  id: 1838,
  plain: '一排數字,每次可以挑一個數加 1,最多加 k 次。目標是讓「同一個數字出現的次數」越多越好。最多能讓某個數出現幾次?',
  statement: '元素的**頻率**是它在陣列中出現的次數。每次操作可以把 nums 中任一個元素加 1,最多操作 k 次。回傳操作後最大的可能頻率。',
  examples: [
    { input: 'nums = [1,2,4], k = 5', output: '3', note: '1 加 3 次、2 加 2 次,全部變 4' },
    { input: 'nums = [1,4,8,13], k = 5', output: '2' },
    { input: 'nums = [3,9,6], k = 2', output: '1' },
  ],
  constraints: ['n ≤ 10⁵,值 ≤ 10⁵,k ≤ 10⁵', '視窗總和 × 長度可能到 10¹⁰,要用 64 位元'],
  insight: ['只能加不能減 → 目標值一定是陣列裡的某個數(把比它小的拉上來)', '排序後,要拉到 nums[r] 的,最划算的是緊鄰在它左邊的那些(差最小)', '成本 = nums[r] × 長度 − 視窗總和;成本隨視窗變長而增加 → 滑動視窗'],
  approaches: [
    {
      name: '排序 + 滑動視窗',
      idea: '`sum` = 視窗總和;`nums[r] * (r − l + 1) − sum > k` 時縮左端。',
      steps: ['排序', '`for r`:`sum += nums[r]`', '`while nums[r] * (r − l + 1) − sum > k`:`sum -= nums[l]`、`l += 1`', '`best = max(best, r − l + 1)`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: winFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '排序;視窗 O(n)。' },
      verdict: '最推薦。關鍵觀察「目標值是視窗最大值、拉的是它左邊相鄰的」想通了,就是標準的可變視窗。',
      code: {
        python: `def maxFrequency(nums, k):
    nums.sort()
    l = s = best = 0
    for r, x in enumerate(nums):
        s += x
        while x * (r - l + 1) - s > k:        # 把視窗全部拉到 x 需要的次數
            s -= nums[l]
            l += 1
        best = max(best, r - l + 1)
    return best`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int maxFrequency(int *nums, int numsSize, int k) {
    qsort(nums, numsSize, sizeof(int), cmp);
    long long s = 0;
    int l = 0, best = 0;
    for (int r = 0; r < numsSize; r++) {
        s += nums[r];
        while ((long long)nums[r] * (r - l + 1) - s > k) s -= nums[l++];
        if (r - l + 1 > best) best = r - l + 1;
    }
    return best;
}`,
        cpp: `int maxFrequency(vector<int>& nums, int k) {
    sort(nums.begin(), nums.end());
    long long s = 0;
    int l = 0, best = 0;
    for (int r = 0; r < (int)nums.size(); r++) {
        s += nums[r];
        while ((long long)nums[r] * (r - l + 1) - s > k) s -= nums[l++];
        best = max(best, r - l + 1);
    }
    return best;
}`,
        java: `int maxFrequency(int[] nums, int k) {
    Arrays.sort(nums);
    long s = 0;
    int l = 0, best = 0;
    for (int r = 0; r < nums.length; r++) {
        s += nums[r];
        while ((long) nums[r] * (r - l + 1) - s > k) s -= nums[l++];
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
        javascript: `function maxFrequency(nums, k) {
  nums.sort((a, b) => a - b);
  let l = 0, s = 0, best = 0;
  for (let r = 0; r < nums.length; r++) {
    s += nums[r];
    while (nums[r] * (r - l + 1) - s > k) s -= nums[l++];
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      },
    },
    {
      name: '排序 + 前綴和 + 二分',
      idea: '對每個 r,二分找最小的 l 使 `nums[r] * (r − l + 1) − (pre[r+1] − pre[l]) ≤ k`。',
      steps: ['排序、算前綴和', '`for r`:在 [0, r] 二分 l', '成本 ≤ k → 往左試;否則往右', '`best = max(best, r − l + 1)`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: bsFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每個 r 一次二分。' },
      verdict: '不依賴「l 只往右」的觀察,單調性用二分處理。漸進複雜度相同,常數較大。',
      code: {
        python: `def maxFrequency(nums, k):
    nums.sort()
    pre = [0]
    for x in nums:
        pre.append(pre[-1] + x)
    best = 0
    for r in range(len(nums)):
        lo, hi = 0, r
        while lo < hi:                        # 最小的 l 使成本 ≤ k
            m = (lo + hi) // 2
            if nums[r] * (r - m + 1) - (pre[r + 1] - pre[m]) <= k:
                hi = m
            else:
                lo = m + 1
        best = max(best, r - lo + 1)
    return best`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int maxFrequency(int *nums, int numsSize, int k) {
    qsort(nums, numsSize, sizeof(int), cmp);
    long long *pre = calloc(numsSize + 1, sizeof(long long));
    for (int i = 0; i < numsSize; i++) pre[i + 1] = pre[i] + nums[i];
    int best = 0;
    for (int r = 0; r < numsSize; r++) {
        int lo = 0, hi = r;
        while (lo < hi) {
            int m = (lo + hi) / 2;
            if ((long long)nums[r] * (r - m + 1) - (pre[r + 1] - pre[m]) <= k) hi = m;
            else lo = m + 1;
        }
        if (r - lo + 1 > best) best = r - lo + 1;
    }
    free(pre);
    return best;
}`,
        cpp: `int maxFrequency(vector<int>& nums, int k) {
    sort(nums.begin(), nums.end());
    int n = nums.size(), best = 0;
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    for (int r = 0; r < n; r++) {
        int lo = 0, hi = r;
        while (lo < hi) {
            int m = (lo + hi) / 2;
            if ((long long)nums[r] * (r - m + 1) - (pre[r + 1] - pre[m]) <= k) hi = m;
            else lo = m + 1;
        }
        best = max(best, r - lo + 1);
    }
    return best;
}`,
        java: `int maxFrequency(int[] nums, int k) {
    Arrays.sort(nums);
    int n = nums.length, best = 0;
    long[] pre = new long[n + 1];
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    for (int r = 0; r < n; r++) {
        int lo = 0, hi = r;
        while (lo < hi) {
            int m = (lo + hi) >>> 1;
            if ((long) nums[r] * (r - m + 1) - (pre[r + 1] - pre[m]) <= k) hi = m;
            else lo = m + 1;
        }
        best = Math.max(best, r - lo + 1);
    }
    return best;
}`,
        javascript: `function maxFrequency(nums, k) {
  nums.sort((a, b) => a - b);
  const n = nums.length, pre = [0];
  for (const x of nums) pre.push(pre[pre.length - 1] + x);
  let best = 0;
  for (let r = 0; r < n; r++) {
    let lo = 0, hi = r;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (nums[r] * (r - m + 1) - (pre[r + 1] - pre[m]) <= k) hi = m;
      else lo = m + 1;
    }
    best = Math.max(best, r - lo + 1);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['`nums[r] * 長度` 用 int:10⁵ × 10⁵ = 10¹⁰ 溢位', '沒排序:視窗裡的數就不一定都 ≤ nums[r]'],
  check: {
    kind: 'fn',
    fn: 'maxFrequency',
    cases: [
      { args: [[1, 2, 4], 5], out: 3 },
      { args: [A, K], out: 2 },
      { args: [[3, 9, 6], 2], out: 1 },
      { args: [[100000, 100000, 1], 99999], out: 3 },
      { args: [[5], 0], out: 1 },
    ],
  },
}
