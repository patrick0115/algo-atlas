import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2439. Minimize Maximum of Array

const A = [3, 7, 1, 6]

function prefixFig(): FigStep[] {
  let pre = 0
  let ans = 0
  const out: FigStep[] = [{ note: '操作只能把數字「往左搬」一格(右邊減 1、左邊加 1)。所以前 i+1 個的總和永遠不會變小 —— 右邊可以搬進來,但左邊的搬不出去', views: [arr(A, { label: 'nums' })] }]
  A.forEach((x, i) => {
    pre += x
    const need = Math.ceil(pre / (i + 1))
    ans = Math.max(ans, need)
    out.push({ note: `前 ${i + 1} 個總和 ${pre},最平均也要有一個 ≥ ⌈${pre}/${i + 1}⌉ = ${need}。目前答案 max = ${ans}`, views: [arr(A, { label: 'nums', range: [0, i], highlight: [i] })] })
  })
  out.push({ note: `答案 ${ans}:每一段前綴的「平均值上取整」取最大。而且一定做得到 —— 把多的一路往左攤平就好(例:[3,7,1,6] → [5,5,4,4])`, views: [arr([5, 5, 4, 4], { label: '攤平後', done: [0, 1, 2, 3] })] })
  return out
}

function bsFig(): FigStep[] {
  return [
    { note: '二分搜尋答案 x:「能不能讓每個數都 ≤ x」?從右往左檢查,超過 x 的部分搬到左邊那格(carry)', views: [arr(A, { label: '試 x = 4' }), arr([2, 3, 0, 2], { label: '從右往左:每格多出來的,往左帶' })] },
    { note: 'x = 4:6 多 2 → 帶給 1 變 3(沒超過);7 多 3 → 帶給 3 變 6 > 4 → 第 0 格搬不出去,失敗。x = 5:最後第 0 格是 5 ≤ 5,成功 → 答案 5', views: [arr([5, 5, 4, 4], { label: 'x = 5 成功', done: [0, 1, 2, 3] })] },
  ]
}

export const q2439: Solution = {
  id: 2439,
  plain: '一排數字,每次可以從某個位置拿 1 給它左邊的鄰居(第 0 個不能再往左給)。可以做任意多次,目標是讓最大的那個數盡量小。最小能到多少?',
  statement: '給非負整數陣列 `nums`。一次操作:選 `1 ≤ i < n` 且 `nums[i] > 0`,令 `nums[i] -= 1`、`nums[i−1] += 1`。可以操作任意次,回傳陣列最大值的最小可能值。',
  examples: [
    { input: 'nums = [3,7,1,6]', output: '5', note: '可以變成 [5,5,4,4]' },
    { input: 'nums = [10,1]', output: '10', note: '只能往左搬,10 降不下來' },
  ],
  constraints: ['n ≤ 10⁵,值 ≤ 10⁹ → 前綴和可達 10¹⁴,要用 64 位元'],
  insight: ['數字只能往左流 → 前 i+1 個的總和只增不減', '所以答案 ≥ 每段前綴的平均(上取整)', '而且取最大的那個平均就做得到(把多的往左攤平)→ 一次掃描', '也可以二分搜尋答案:答案越大越容易做到(單調)'],
  approaches: [
    {
      name: '前綴平均取最大',
      idea: '`ans = max over i of ⌈pre[i] / (i + 1)⌉`。',
      steps: ['`pre = ans = 0`', '`for i, x`:`pre += x`', '`ans = max(ans, (pre + i) // (i + 1))`(上取整)'],
      figure: { title: `nums = [${A}]`, steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最推薦。看出「前綴總和不會變小」這個不變量,答案就直接出來了。',
      code: {
        python: `def minimizeArrayValue(nums):
    pre = ans = 0
    for i, x in enumerate(nums):
        pre += x
        ans = max(ans, (pre + i) // (i + 1))  # ⌈pre / (i+1)⌉:前 i+1 個的平均(上取整)
    return ans`,
        c: `int minimizeArrayValue(int *nums, int numsSize) {
    long long pre = 0, ans = 0;
    for (int i = 0; i < numsSize; i++) {
        pre += nums[i];
        long long avg = (pre + i) / (i + 1);
        if (avg > ans) ans = avg;
    }
    return (int)ans;
}`,
        cpp: `int minimizeArrayValue(vector<int>& nums) {
    long long pre = 0, ans = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        pre += nums[i];
        ans = max(ans, (pre + i) / (i + 1));
    }
    return ans;
}`,
        java: `int minimizeArrayValue(int[] nums) {
    long pre = 0, ans = 0;
    for (int i = 0; i < nums.length; i++) {
        pre += nums[i];
        ans = Math.max(ans, (pre + i) / (i + 1));
    }
    return (int) ans;
}`,
        javascript: `function minimizeArrayValue(nums) {
  let pre = 0, ans = 0;
  nums.forEach((x, i) => {
    pre += x;
    ans = Math.max(ans, Math.ceil(pre / (i + 1)));
  });
  return ans;
}`,
      },
    },
    {
      name: '二分搜尋答案',
      idea: '`ok(x)`:從右往左,`carry = max(0, nums[i] + carry − x)` 往左帶;最後 `nums[0] + carry ≤ x` 就可行。',
      steps: ['`lo = 0`、`hi = max(nums)`', '`ok(x)`:`carry = 0`;`for i in n−1..1`:`carry = max(0, nums[i] + carry − x)`;回傳 `nums[0] + carry <= x`', '二分找最小的可行 x'],
      figure: { title: `nums = [${A}]`, steps: bsFig() },
      complexity: { time: 'O(n log V)', space: 'O(1)', why: 'V = 最大值,二分 log V 次,每次 O(n)。' },
      verdict: '[[p:binary-search-answer]]的通用作法:不需要看出數學性質,只要會「判斷 x 行不行」。',
      code: {
        python: `def minimizeArrayValue(nums):
    def ok(x):
        carry = 0
        for i in range(len(nums) - 1, 0, -1):
            carry = max(0, nums[i] + carry - x)   # 超過 x 的部分只能往左帶
        return nums[0] + carry <= x

    lo, hi = 0, max(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        c: `static bool ok(int *a, int n, long long x) {
    long long carry = 0;
    for (int i = n - 1; i > 0; i--) {
        carry = a[i] + carry - x;
        if (carry < 0) carry = 0;
    }
    return a[0] + carry <= x;
}

int minimizeArrayValue(int *nums, int numsSize) {
    long long lo = 0, hi = 0;
    for (int i = 0; i < numsSize; i++) if (nums[i] > hi) hi = nums[i];
    while (lo < hi) {
        long long mid = (lo + hi) / 2;
        if (ok(nums, numsSize, mid)) hi = mid; else lo = mid + 1;
    }
    return (int)lo;
}`,
        cpp: `int minimizeArrayValue(vector<int>& nums) {
    auto ok = [&](long long x) {
        long long carry = 0;
        for (int i = nums.size() - 1; i > 0; i--) carry = max(0LL, nums[i] + carry - x);
        return nums[0] + carry <= x;
    };
    long long lo = 0, hi = *max_element(nums.begin(), nums.end());
    while (lo < hi) {
        long long mid = (lo + hi) / 2;
        if (ok(mid)) hi = mid; else lo = mid + 1;
    }
    return lo;
}`,
        java: `int minimizeArrayValue(int[] nums) {
    long lo = 0, hi = 0;
    for (int x : nums) hi = Math.max(hi, x);
    while (lo < hi) {
        long mid = (lo + hi) / 2, carry = 0;
        for (int i = nums.length - 1; i > 0; i--) carry = Math.max(0, nums[i] + carry - mid);
        if (nums[0] + carry <= mid) hi = mid; else lo = mid + 1;
    }
    return (int) lo;
}`,
        javascript: `function minimizeArrayValue(nums) {
  const ok = (x) => {
    let carry = 0;
    for (let i = nums.length - 1; i > 0; i--) carry = Math.max(0, nums[i] + carry - x);
    return nums[0] + carry <= x;
  };
  let lo = 0, hi = Math.max(...nums);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      },
    },
  ],
  pitfalls: ['平均用無條件捨去:前 2 個總和 11 時至少要有一個 6,不是 5', '前綴和超過 int(10⁵ × 10⁹)', '以為可以往右搬:操作只能往左'],
  check: {
    kind: 'fn',
    fn: 'minimizeArrayValue',
    cases: [
      { args: [A], out: 5 },
      { args: [[10, 1]], out: 10 },
      { args: [[0, 0, 9]], out: 3 },
      { args: [[1000000000, 1000000000, 1000000000]], out: 1000000000 },
      { args: [[6, 9, 3, 8, 14]], out: 8 },
    ],
  },
}
