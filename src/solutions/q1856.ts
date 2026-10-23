import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1856. Maximum Subarray Min-Product

const A = [2, 3, 3, 1, 2]

function stackFig(): FigStep[] {
  const n = A.length
  const left = Array(n).fill(-1)
  const right = Array(n).fill(n)
  const st: number[] = []
  for (let i = 0; i < n; i++) {
    while (st.length && A[st[st.length - 1]] >= A[i]) right[st.pop()!] = i
    left[i] = st.length ? st[st.length - 1] : -1
    st.push(i)
  }
  const pre = [0]
  for (const x of A) pre.push(pre[pre.length - 1] + x)
  const vals = A.map((x, i) => x * (pre[right[i]] - pre[left[i] + 1]))
  const best = vals.indexOf(Math.max(...vals))
  return [
    { note: '換個角度:枚舉「誰是最小值」。若 nums[i] 是子陣列的最小值,子陣列要盡量長(和越大越好,而且元素都是正數)→ 往左、往右延伸到第一個比它小的數為止', views: [arr(A, { label: 'nums' })] },
    { note: '用單調堆疊一次算出每個 i 的「左邊第一個更小」和「右邊第一個更小」。範圍內的和用前綴和 O(1) 算', views: [arr(left.map((v) => v), { label: '左邊第一個更小的位置(−1 = 沒有)' }), arr(right, { label: `右邊第一個更小的位置(${n} = 沒有)` })] },
    { note: `每個 i:nums[i] × 範圍和 = [${vals}]。最大是 i = ${best}:${A[best]} × (${A.slice(left[best] + 1, right[best]).join(' + ')}) = ${vals[best]}`, views: [arr(A, { label: 'nums', highlight: [best], range: [left[best] + 1, right[best] - 1] }), arr(vals, { label: 'min-product', done: [best] })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:固定起點 i,往右延伸 j,一路維護最小值和總和,乘起來取最大', views: [arr(A, { label: 'i = 1', range: [1, 2] })] },
    { note: 'i = 1、j = 2:min 3 × 和 6 = 18,就是答案。全部 O(n²) 個子陣列都試一遍', views: [arr(A, { label: '[3,3]', range: [1, 2], done: [1, 2] })] },
  ]
}

export const q1856: Solution = {
  id: 1856,
  plain: '一段連續數字的「分數」= 裡面最小的數 × 這段的總和。在一排正數裡挑一段,讓分數最大。答案很大,要對 10⁹+7 取餘數(但要先比出真正的最大值才取)。',
  statement: '陣列的 **min-product** = 最小值 × 總和。給正整數陣列 `nums`,回傳所有非空子陣列中最大的 min-product,對 `10⁹ + 7` 取餘數(比較時要用取餘數**前**的值)。',
  examples: [
    { input: 'nums = [1,2,3,2]', output: '14', note: '[2,3,2]:2 × 7' },
    { input: 'nums = [2,3,3,1,2]', output: '18', note: '[3,3]:3 × 6' },
    { input: 'nums = [3,1,5,6,4,2]', output: '60', note: '[5,6,4]:4 × 15' },
  ],
  constraints: ['n ≤ 10⁵,值 ≤ 10⁷ → n² 個子陣列太多', '題目保證取餘數前的最大值放得進 64 位元有號整數(JavaScript 要用 BigInt)'],
  insight: ['子陣列太多(n²),改成枚舉**哪個數當最小值**', '固定最小值 nums[i] 後,子陣列越長越好(全是正數):延伸到左右第一個比它小的數', '「左右第一個更小」→ [[p:monotonic-stack]];區間和 → 前綴和', '和 [84. Largest Rectangle in Histogram](#/q/84) 是同一個結構:高度 × 寬度 換成 最小值 × 總和'],
  approaches: [
    {
      name: '單調堆疊 + 前綴和',
      idea: '對每個 i 求 `left[i]`、`right[i]`(左右第一個更小的位置),答案 = `max(nums[i] × (pre[right] − pre[left+1]))`。',
      steps: ['前綴和 pre', '單調遞增堆疊:彈出時,被彈的 j 的右邊界就是 i;堆疊頂是 i 的左邊界', '每個 i:`nums[i] * (pre[right[i]] − pre[left[i] + 1])`,取最大', '最後才 `% (10⁹ + 7)`'],
      figure: { title: `nums = [${A}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個元素進出堆疊各一次。' },
      verdict: '最推薦。「以每個元素為最小值能延伸多遠」是單調堆疊的招牌用法。',
      code: {
        python: `def maxSumMinProduct(nums):
    n = len(nums)
    pre = [0] * (n + 1)
    for i, x in enumerate(nums):
        pre[i + 1] = pre[i] + x
    left, right = [-1] * n, [n] * n
    st = []                                   # 單調遞增堆疊(存索引)
    for i, x in enumerate(nums):
        while st and nums[st[-1]] >= x:
            right[st.pop()] = i               # 被彈出的,右邊第一個更小(或相等)的就是 i
        left[i] = st[-1] if st else -1
        st.append(i)
    best = max(nums[i] * (pre[right[i]] - pre[left[i] + 1]) for i in range(n))
    return best % (10**9 + 7)                 # 先比大小,最後才取餘數`,
        c: `int maxSumMinProduct(int *nums, int numsSize) {
    int n = numsSize, top = 0;
    long long *pre = calloc(n + 1, sizeof(long long));
    int *left = malloc(n * sizeof(int)), *right = malloc(n * sizeof(int)), *st = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    for (int i = 0; i < n; i++) {
        right[i] = n;
        while (top && nums[st[top - 1]] >= nums[i]) right[st[--top]] = i;
        left[i] = top ? st[top - 1] : -1;
        st[top++] = i;
    }
    long long best = 0;
    for (int i = 0; i < n; i++) {
        long long v = (long long)nums[i] * (pre[right[i]] - pre[left[i] + 1]);
        if (v > best) best = v;
    }
    free(pre); free(left); free(right); free(st);
    return (int)(best % 1000000007);
}`,
        cpp: `int maxSumMinProduct(vector<int>& nums) {
    int n = nums.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    vector<int> left(n, -1), right(n, n), st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[st.back()] >= nums[i]) { right[st.back()] = i; st.pop_back(); }
        left[i] = st.empty() ? -1 : st.back();
        st.push_back(i);
    }
    long long best = 0;
    for (int i = 0; i < n; i++) best = max(best, (long long)nums[i] * (pre[right[i]] - pre[left[i] + 1]));
    return best % 1000000007;
}`,
        java: `int maxSumMinProduct(int[] nums) {
    int n = nums.length;
    long[] pre = new long[n + 1];
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
    int[] left = new int[n], right = new int[n];
    Arrays.fill(right, n);
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        while (!st.isEmpty() && nums[st.peek()] >= nums[i]) right[st.pop()] = i;
        left[i] = st.isEmpty() ? -1 : st.peek();
        st.push(i);
    }
    long best = 0;
    for (int i = 0; i < n; i++) best = Math.max(best, (long) nums[i] * (pre[right[i]] - pre[left[i] + 1]));
    return (int) (best % 1_000_000_007);
}`,
        javascript: `function maxSumMinProduct(nums) {
  const n = nums.length, pre = [0n];
  for (const x of nums) pre.push(pre[pre.length - 1] + BigInt(x));
  const left = new Array(n).fill(-1), right = new Array(n).fill(n), st = [];
  for (let i = 0; i < n; i++) {
    while (st.length && nums[st[st.length - 1]] >= nums[i]) right[st.pop()] = i;
    left[i] = st.length ? st[st.length - 1] : -1;
    st.push(i);
  }
  let best = 0n;
  for (let i = 0; i < n; i++) {
    const v = BigInt(nums[i]) * (pre[right[i]] - pre[left[i] + 1]);   // 超過 2⁵³,用 BigInt
    if (v > best) best = v;
  }
  return Number(best % 1000000007n);
}`,
      },
    },
    {
      name: '暴力枚舉子陣列',
      idea: '固定起點 i,往右延伸 j,維護 `mn` 和 `s`,`best = max(best, mn × s)`。',
      steps: ['`for i`:`mn = ∞`、`s = 0`', '`for j in i..n−1`:`mn = min(mn, nums[j])`、`s += nums[j]`', '`best = max(best, mn * s)`', '最後取餘數'],
      figure: { title: `nums = [${A}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n = 10⁵ 時 5·10⁹,太慢。' },
      verdict: '拿來驗證單調堆疊版的結果。',
      code: {
        python: `def maxSumMinProduct(nums):
    best = 0
    for i in range(len(nums)):
        mn, s = float('inf'), 0
        for j in range(i, len(nums)):
            mn = min(mn, nums[j])
            s += nums[j]
            best = max(best, mn * s)
    return best % (10**9 + 7)`,
        c: `int maxSumMinProduct(int *nums, int numsSize) {
    long long best = 0;
    for (int i = 0; i < numsSize; i++) {
        long long mn = LLONG_MAX, s = 0;
        for (int j = i; j < numsSize; j++) {
            if (nums[j] < mn) mn = nums[j];
            s += nums[j];
            if (mn * s > best) best = mn * s;
        }
    }
    return (int)(best % 1000000007);
}`,
        cpp: `int maxSumMinProduct(vector<int>& nums) {
    long long best = 0;
    for (size_t i = 0; i < nums.size(); i++) {
        long long mn = LLONG_MAX, s = 0;
        for (size_t j = i; j < nums.size(); j++) {
            mn = min(mn, (long long)nums[j]);
            s += nums[j];
            best = max(best, mn * s);
        }
    }
    return best % 1000000007;
}`,
        java: `int maxSumMinProduct(int[] nums) {
    long best = 0;
    for (int i = 0; i < nums.length; i++) {
        long mn = Long.MAX_VALUE, s = 0;
        for (int j = i; j < nums.length; j++) {
            mn = Math.min(mn, nums[j]);
            s += nums[j];
            best = Math.max(best, mn * s);
        }
    }
    return (int) (best % 1_000_000_007);
}`,
        javascript: `function maxSumMinProduct(nums) {
  let best = 0n;
  for (let i = 0; i < nums.length; i++) {
    let mn = Infinity, s = 0n;
    for (let j = i; j < nums.length; j++) {
      mn = Math.min(mn, nums[j]);
      s += BigInt(nums[j]);
      const v = BigInt(mn) * s;
      if (v > best) best = v;
    }
  }
  return Number(best % 1000000007n);
}`,
      },
    },
  ],
  pitfalls: ['先取餘數再比大小:取餘數後的大小關係不對', '乘積超過 32 位元(JavaScript 超過 2⁵³ 也會失準,要用 BigInt)', '堆疊的比較用 `>` 還是 `>=`:相等時兩邊只要一邊包含就好,不影響答案'],
  check: {
    kind: 'fn',
    fn: 'maxSumMinProduct',
    cases: [
      { args: [[1, 2, 3, 2]], out: 14 },
      { args: [A], out: 18 },
      { args: [[3, 1, 5, 6, 4, 2]], out: 60 },
      { args: [[10000000, 10000000, 10000000]], out: 997900007 },
      { args: [[7]], out: 49 },
    ],
  },
}
