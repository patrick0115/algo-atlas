import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1498. Number of Subsequences That Satisfy the Given Sum Condition

const A = [3, 5, 6, 7]
const T = 9

function twoPtrFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  let l = 0
  let r = s.length - 1
  let ans = 0
  const out: FigStep[] = [{ note: `子序列只看「最小 + 最大 ≤ ${T}」,跟順序無關 → 可以先排序。固定最小值 s[l],找最大能配的 s[r]`, views: [arr(s, { label: '排序後', pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] }]
  while (l <= r) {
    if (s[l] + s[r] > T) {
      out.push({ note: `${s[l]} + ${s[r]} = ${s[l] + s[r]} > ${T}:最小值 ${s[l]} 配 ${s[r]} 太大,R 往左`, views: [arr(s, { label: '排序後', dim: [r], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
      r--
    } else {
      const add = 2 ** (r - l)
      ans += add
      out.push({ note: `${s[l]} + ${s[r]} = ${s[l] + s[r]} ≤ ${T}:以 s[${l}] 為最小值,一定要選 s[${l}],中間 ${r - l} 個(索引 ${l + 1}..${r})每個都可選可不選 → 2^${r - l} = ${add} 種。累計 ${ans},L 往右`, views: [arr(s, { label: '排序後', highlight: [l], compare: Array.from({ length: r - l }, (_, k) => l + 1 + k), pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
      l++
    }
  }
  out.push({ note: `答案 ${ans}(實際題目要對 10⁹+7 取餘數)`, views: [arr(s, { label: '排序後', done: s.map((_, i) => i) })] })
  return out
}

function bsFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  return [
    { note: '另一種寫法:對每個最小值 s[i],二分搜尋最後一個 ≤ target − s[i] 的位置 j', views: [arr(s, { label: '排序後', highlight: [0], compare: [1, 2] })] },
    { note: `s[0] = 3 → 找 ≤ 6 的最後一個 → j = 2,貢獻 2^(2−0) = 4。s[1] = 5 → 找 ≤ 4 的 → 沒有(j < i),停止。總共 4`, views: [arr(s, { label: '排序後', done: [0, 1, 2], dim: [3] })] },
  ]
}

export const q1498: Solution = {
  id: 1498,
  plain: '從一堆數字裡挑一些出來(至少挑一個),只要「挑出來的最小值 + 最大值」不超過 target 就算數。問有幾種挑法。答案很大,要對 10⁹+7 取餘數。',
  statement: '給整數陣列 `nums` 和 `target`,回傳**非空子序列**中「最小元素 + 最大元素 ≤ target」的個數,對 `10⁹ + 7` 取餘數。',
  examples: [
    { input: 'nums = [3,5,6,7], target = 9', output: '4', note: '[3]、[3,5]、[3,5,6]、[3,6]' },
    { input: 'nums = [3,3,6,8], target = 10', output: '6' },
    { input: 'nums = [2,3,3,4,6,7], target = 12', output: '61' },
  ],
  constraints: ['n ≤ 10⁵', '值 ≤ 10⁶,target ≤ 10⁶'],
  insight: [
    '子序列的條件只跟最小、最大值有關,跟原本的順序無關 → **排序**',
    '固定最小值 s[l],能當最大值的範圍是 l..r(r 是最後一個 s[l] + s[r] ≤ target 的位置)',
    '這時 s[l] 必選,l+1..r 每個都可選可不選 → `2^(r−l)` 種',
    '2 的次方要先預處理(對 10⁹+7 取餘數),不能直接算 2^r',
  ],
  approaches: [
    {
      name: '排序 + 左右雙指標',
      idea: '`s[l] + s[r] > target` → `r -= 1`;否則 `ans += 2^(r−l)`、`l += 1`。',
      steps: ['排序;預先算 `pow2[i] = 2^i mod M`', '`l, r = 0, n − 1`', '`while l <= r`:太大 → `r -= 1`;否則 `ans += pow2[r − l]`、`l += 1`', '回傳 `ans mod M`'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: twoPtrFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序加上 pow2 表;雙指標 O(n)。' },
      verdict: '最推薦。l 往右時最小值變大,能配的最大值只會變小,所以 r 只往左 → 雙指標。',
      code: {
        python: `def numSubseq(nums, target):
    MOD = 10**9 + 7
    nums.sort()
    n = len(nums)
    pow2 = [1] * n
    for i in range(1, n):
        pow2[i] = pow2[i - 1] * 2 % MOD
    l, r, ans = 0, n - 1, 0
    while l <= r:
        if nums[l] + nums[r] > target:
            r -= 1                            # 最大值太大,換小一點的
        else:
            ans = (ans + pow2[r - l]) % MOD   # nums[l] 必選,l+1..r 隨意
            l += 1
    return ans`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int numSubseq(int *nums, int numsSize, int target) {
    const int MOD = 1000000007;
    qsort(nums, numsSize, sizeof(int), cmp);
    int *pow2 = malloc(numsSize * sizeof(int));
    pow2[0] = 1;
    for (int i = 1; i < numsSize; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
    int l = 0, r = numsSize - 1, ans = 0;
    while (l <= r) {
        if (nums[l] + nums[r] > target) r--;
        else { ans = (ans + pow2[r - l]) % MOD; l++; }
    }
    free(pow2);
    return ans;
}`,
        cpp: `int numSubseq(vector<int>& nums, int target) {
    const int MOD = 1e9 + 7;
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<int> pow2(n, 1);
    for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
    int l = 0, r = n - 1, ans = 0;
    while (l <= r) {
        if (nums[l] + nums[r] > target) r--;
        else { ans = (ans + pow2[r - l]) % MOD; l++; }
    }
    return ans;
}`,
        java: `int numSubseq(int[] nums, int target) {
    final int MOD = 1_000_000_007;
    Arrays.sort(nums);
    int n = nums.length;
    int[] pow2 = new int[n];
    pow2[0] = 1;
    for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
    int l = 0, r = n - 1, ans = 0;
    while (l <= r) {
        if (nums[l] + nums[r] > target) r--;
        else { ans = (ans + pow2[r - l]) % MOD; l++; }
    }
    return ans;
}`,
        javascript: `function numSubseq(nums, target) {
  const MOD = 1e9 + 7, n = nums.length;
  nums.sort((a, b) => a - b);
  const pow2 = new Array(n).fill(1);
  for (let i = 1; i < n; i++) pow2[i] = (pow2[i - 1] * 2) % MOD;
  let l = 0, r = n - 1, ans = 0;
  while (l <= r) {
    if (nums[l] + nums[r] > target) r--;
    else {
      ans = (ans + pow2[r - l]) % MOD;
      l++;
    }
  }
  return ans;
}`,
      },
    },
    {
      name: '排序 + 每個最小值二分',
      idea: '對每個 i,二分找最後一個 `s[j] ≤ target − s[i]`;`j ≥ i` 時 `ans += 2^(j−i)`。',
      steps: ['排序、預處理 pow2', '`for i`:二分找 j', '`j < i` → 後面的 i 只會更大,直接停', '否則 `ans += pow2[j − i]`'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: bsFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每個 i 一次二分。' },
      verdict: '想法一樣,用二分取代「r 只往左」的觀察。雙指標更簡潔。',
      code: {
        python: `from bisect import bisect_right

def numSubseq(nums, target):
    MOD = 10**9 + 7
    nums.sort()
    n = len(nums)
    pow2 = [1] * n
    for i in range(1, n):
        pow2[i] = pow2[i - 1] * 2 % MOD
    ans = 0
    for i in range(n):
        j = bisect_right(nums, target - nums[i]) - 1   # 最後一個能當最大值的位置
        if j < i:
            break
        ans = (ans + pow2[j - i]) % MOD
    return ans`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int numSubseq(int *nums, int numsSize, int target) {
    const int MOD = 1000000007;
    qsort(nums, numsSize, sizeof(int), cmp);
    int *pow2 = malloc(numsSize * sizeof(int));
    pow2[0] = 1;
    for (int i = 1; i < numsSize; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
    int ans = 0;
    for (int i = 0; i < numsSize; i++) {
        int lo = 0, hi = numsSize;               // 第一個 > target - nums[i] 的位置
        while (lo < hi) {
            int m = (lo + hi) / 2;
            if (nums[m] <= target - nums[i]) lo = m + 1; else hi = m;
        }
        int j = lo - 1;
        if (j < i) break;
        ans = (ans + pow2[j - i]) % MOD;
    }
    free(pow2);
    return ans;
}`,
        cpp: `int numSubseq(vector<int>& nums, int target) {
    const int MOD = 1e9 + 7;
    sort(nums.begin(), nums.end());
    int n = nums.size(), ans = 0;
    vector<int> pow2(n, 1);
    for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
    for (int i = 0; i < n; i++) {
        int j = upper_bound(nums.begin(), nums.end(), target - nums[i]) - nums.begin() - 1;
        if (j < i) break;
        ans = (ans + pow2[j - i]) % MOD;
    }
    return ans;
}`,
        java: `int numSubseq(int[] nums, int target) {
    final int MOD = 1_000_000_007;
    Arrays.sort(nums);
    int n = nums.length, ans = 0;
    int[] pow2 = new int[n];
    pow2[0] = 1;
    for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
    for (int i = 0; i < n; i++) {
        int lo = 0, hi = n;
        while (lo < hi) {
            int m = (lo + hi) >>> 1;
            if (nums[m] <= target - nums[i]) lo = m + 1; else hi = m;
        }
        int j = lo - 1;
        if (j < i) break;
        ans = (ans + pow2[j - i]) % MOD;
    }
    return ans;
}`,
        javascript: `function numSubseq(nums, target) {
  const MOD = 1e9 + 7, n = nums.length;
  nums.sort((a, b) => a - b);
  const pow2 = new Array(n).fill(1);
  for (let i = 1; i < n; i++) pow2[i] = (pow2[i - 1] * 2) % MOD;
  let ans = 0;
  for (let i = 0; i < n; i++) {
    let lo = 0, hi = n;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (nums[m] <= target - nums[i]) lo = m + 1;
      else hi = m;
    }
    const j = lo - 1;
    if (j < i) break;
    ans = (ans + pow2[j - i]) % MOD;
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['直接算 `2 ** (r − l)` 再取餘數:C/Java 會溢位;要預處理 pow2 表並邊乘邊取餘數', '條件是 `l <= r`(只選一個元素時最小 = 最大 = 自己,也要算)', '忘了排序就用雙指標'],
  check: {
    kind: 'fn',
    fn: 'numSubseq',
    cases: [
      { args: [A, T], out: 4 },
      { args: [[3, 3, 6, 8], 10], out: 6 },
      { args: [[2, 3, 3, 4, 6, 7], 12], out: 61 },
      { args: [[5], 4], out: 0 },
      { args: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 2], out: 511620082 },
    ],
  },
}
