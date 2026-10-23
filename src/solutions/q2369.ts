import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2369. Check if There is a Valid Partition For The Array

const A = [4, 4, 4, 5, 6]

function dpFig(): FigStep[] {
  const n = A.length
  const dp = Array(n + 1).fill(false)
  dp[0] = true
  for (let i = 2; i <= n; i++) {
    const a = A[i - 1]
    const b = A[i - 2]
    if (a === b && dp[i - 2]) dp[i] = true
    if (i >= 3) {
      const c = A[i - 3]
      if (dp[i - 3] && ((a === b && b === c) || (a === b + 1 && b === c + 1))) dp[i] = true
    }
  }
  return [
    { note: '把陣列切成連續的小段,每段必須是:① 兩個相同、② 三個相同、③ 三個連續遞增(如 3,4,5)。能不能整個切完?', views: [arr(A, { label: 'nums' })] },
    { note: '`dp[i]` = 前 i 個能不能切完。最後一段長 2 或 3:`dp[i] = (dp[i−2] 且最後兩個合法) 或 (dp[i−3] 且最後三個合法)`', views: [arr(dp.map((v) => (v ? 'T' : 'F')), { label: 'dp[0..n]', done: dp.map((v, i) => (v ? i : -1)).filter((i) => i >= 0) })] },
    { note: '[4,4] + [4,5,6] → 合法。dp[5] = true', views: [arr(A, { label: '切法', highlight: [0, 1], done: [2, 3, 4] })] },
  ]
}

function rollFig(): FigStep[] {
  return [
    { note: 'dp[i] 只看 dp[i−2]、dp[i−3] → 用三個變數滾動即可,空間 O(1)', views: [arr(['dp[i−3]', 'dp[i−2]', 'dp[i−1]'], { label: '只保留最近三個' })] },
    { note: '每一步算出新的 dp,再把三個變數往前移一格', views: [arr(['T'], { label: '答案', done: [0] })] },
  ]
}

export const q2369: Solution = {
  id: 2369,
  plain: '把陣列切成好幾段連續的小段,每段要符合:兩個一樣的數、三個一樣的數、或三個連續遞增 1 的數。能不能剛好切完?',
  statement: '給整數陣列 `nums`,將其分割成一或多個連續子陣列,每個子陣列必須滿足以下之一:恰好 2 個相等元素;恰好 3 個相等元素;恰好 3 個連續遞增元素(差為 1)。若存在至少一種合法分割,回傳 true。',
  examples: [
    { input: 'nums = [4,4,4,5,6]', output: 'true', note: '[4,4] 和 [4,5,6]' },
    { input: 'nums = [1,1,1,2]', output: 'false' },
  ],
  constraints: ['2 ≤ n ≤ 10⁵'],
  insight: ['每段長度只會是 2 或 3 → 只看最後一段', '[[p:dp-1d]]:`dp[i]` 依賴 `dp[i−2]`、`dp[i−3]`', '和 [91](#/q/91) 解碼方法同樣的結構'],
  approaches: [
    {
      name: '一維 DP',
      idea: '`dp[0] = True`;`dp[i] = (dp[i−2] and 兩個相等) or (dp[i−3] and (三個相等 or 三個連續))`。',
      steps: ['`dp = [False] * (n + 1)`、`dp[0] = True`', '`for i in 2..n`:檢查最後兩個', '`i >= 3`:檢查最後三個', '回傳 `dp[n]`'],
      figure: { title: `nums = [${A}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個位置 O(1)。' },
      verdict: '最推薦,看「最後一段」是 DP 最常用的拆法。',
      code: {
        python: `def validPartition(nums):
    n = len(nums)
    dp = [False] * (n + 1)
    dp[0] = True                              # 空的前綴可以切完
    for i in range(2, n + 1):
        a, b = nums[i - 1], nums[i - 2]
        if dp[i - 2] and a == b:
            dp[i] = True                      # 最後一段 [x, x]
        if i >= 3 and dp[i - 3]:
            c = nums[i - 3]
            if (a == b == c) or (c + 1 == b and b + 1 == a):
                dp[i] = True                  # 最後一段長 3
    return dp[n]`,
        c: `bool validPartition(int *nums, int numsSize) {
    int n = numsSize;
    bool *dp = calloc(n + 1, sizeof(bool));
    dp[0] = true;
    for (int i = 2; i <= n; i++) {
        int a = nums[i - 1], b = nums[i - 2];
        if (dp[i - 2] && a == b) dp[i] = true;
        if (i >= 3 && dp[i - 3]) {
            int c = nums[i - 3];
            if ((a == b && b == c) || (c + 1 == b && b + 1 == a)) dp[i] = true;
        }
    }
    bool ans = dp[n];
    free(dp);
    return ans;
}`,
        cpp: `bool validPartition(vector<int>& nums) {
    int n = nums.size();
    vector<bool> dp(n + 1, false);
    dp[0] = true;
    for (int i = 2; i <= n; i++) {
        int a = nums[i - 1], b = nums[i - 2];
        if (dp[i - 2] && a == b) dp[i] = true;
        if (i >= 3 && dp[i - 3]) {
            int c = nums[i - 3];
            if ((a == b && b == c) || (c + 1 == b && b + 1 == a)) dp[i] = true;
        }
    }
    return dp[n];
}`,
        java: `boolean validPartition(int[] nums) {
    int n = nums.length;
    boolean[] dp = new boolean[n + 1];
    dp[0] = true;
    for (int i = 2; i <= n; i++) {
        int a = nums[i - 1], b = nums[i - 2];
        if (dp[i - 2] && a == b) dp[i] = true;
        if (i >= 3 && dp[i - 3]) {
            int c = nums[i - 3];
            if ((a == b && b == c) || (c + 1 == b && b + 1 == a)) dp[i] = true;
        }
    }
    return dp[n];
}`,
        javascript: `function validPartition(nums) {
  const n = nums.length, dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 2; i <= n; i++) {
    const a = nums[i - 1], b = nums[i - 2];
    if (dp[i - 2] && a === b) dp[i] = true;
    if (i >= 3 && dp[i - 3]) {
      const c = nums[i - 3];
      if ((a === b && b === c) || (c + 1 === b && b + 1 === a)) dp[i] = true;
    }
  }
  return dp[n];
}`,
      },
    },
    {
      name: '滾動變數',
      idea: '只保留 `d3 = dp[i−3]`、`d2 = dp[i−2]`、`d1 = dp[i−1]`;算出 cur 後往前移。',
      steps: ['`d3, d2, d1 = False, True, False`(對應 dp[−1]、dp[0]、dp[1])', '`for i in 2..n`:用 d2、d3 算 cur', '`d3, d2, d1 = d2, d1, cur`', '回傳 d1'],
      figure: { title: `nums = [${A}]`, steps: rollFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '三個布林變數。' },
      verdict: '和費氏數列一樣的空間壓縮。',
      code: {
        python: `def validPartition(nums):
    d3, d2, d1 = False, True, False           # dp[i-3], dp[i-2], dp[i-1](從 i = 2 開始)
    for i in range(2, len(nums) + 1):
        a, b = nums[i - 1], nums[i - 2]
        cur = d2 and a == b
        if i >= 3 and d3:
            c = nums[i - 3]
            cur = cur or a == b == c or (c + 1 == b and b + 1 == a)
        d3, d2, d1 = d2, d1, cur
    return d1`,
        c: `bool validPartition(int *nums, int numsSize) {
    bool d3 = false, d2 = true, d1 = false;
    for (int i = 2; i <= numsSize; i++) {
        int a = nums[i - 1], b = nums[i - 2];
        bool cur = d2 && a == b;
        if (i >= 3 && d3) {
            int c = nums[i - 3];
            cur = cur || (a == b && b == c) || (c + 1 == b && b + 1 == a);
        }
        d3 = d2; d2 = d1; d1 = cur;
    }
    return d1;
}`,
        cpp: `bool validPartition(vector<int>& nums) {
    bool d3 = false, d2 = true, d1 = false;
    for (int i = 2; i <= (int)nums.size(); i++) {
        int a = nums[i - 1], b = nums[i - 2];
        bool cur = d2 && a == b;
        if (i >= 3 && d3) {
            int c = nums[i - 3];
            cur = cur || (a == b && b == c) || (c + 1 == b && b + 1 == a);
        }
        d3 = d2; d2 = d1; d1 = cur;
    }
    return d1;
}`,
        java: `boolean validPartition(int[] nums) {
    boolean d3 = false, d2 = true, d1 = false;
    for (int i = 2; i <= nums.length; i++) {
        int a = nums[i - 1], b = nums[i - 2];
        boolean cur = d2 && a == b;
        if (i >= 3 && d3) {
            int c = nums[i - 3];
            cur = cur || (a == b && b == c) || (c + 1 == b && b + 1 == a);
        }
        d3 = d2; d2 = d1; d1 = cur;
    }
    return d1;
}`,
        javascript: `function validPartition(nums) {
  let d3 = false, d2 = true, d1 = false;
  for (let i = 2; i <= nums.length; i++) {
    const a = nums[i - 1], b = nums[i - 2];
    let cur = d2 && a === b;
    if (i >= 3 && d3) {
      const c = nums[i - 3];
      cur = cur || (a === b && b === c) || (c + 1 === b && b + 1 === a);
    }
    [d3, d2, d1] = [d2, d1, cur];
  }
  return d1;
}`,
      },
    },
  ],
  pitfalls: ['連續遞增寫成「遞增」:差必須剛好是 1', '貪心優先切 2 個:例如 [4,4,4,5,6] 若先切 [4,4] 再切 [4,5,6] 可以,但其他例子會失敗'],
  check: {
    kind: 'fn',
    fn: 'validPartition',
    cases: [
      { args: [A], out: true },
      { args: [[1, 1, 1, 2]], out: false },
      { args: [[1, 2, 3]], out: true },
      { args: [[1, 1]], out: true },
      { args: [[993335, 993336, 993337, 993338, 993339, 993340, 993341]], out: false },
    ],
  },
}
