import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 238. Product of Array Except Self

const A = [2, 3, 4, 5]

function bruteFig(): FigStep[] {
  const out: FigStep[] = [{ note: '對每個位置 i,把「除了自己以外」的所有數乘起來', views: [arr(A, { label: 'nums' })] }]
  const ans: (number | string)[] = A.map(() => '?')
  A.forEach((_, i) => {
    const p = A.reduce((acc, v, j) => (j === i ? acc : acc * v), 1)
    ans[i] = p
    out.push({ note: `answer[${i}] = ${A.filter((_, j) => j !== i).join(' × ')} = ${p}(走了 n − 1 個數)`, views: [arr(A, { label: 'nums', dim: [i], compare: range(0, A.length - 1).filter((j) => j !== i) }), arr(ans, { label: 'answer', highlight: [i] })] })
  })
  return out
}

function prefixFig(): FigStep[] {
  const n = A.length
  const L: (number | string)[] = Array(n).fill('?')
  const R: (number | string)[] = Array(n).fill('?')
  const out: FigStep[] = [{ note: '觀察:answer[i] = (i 左邊所有數的乘積) × (i 右邊所有數的乘積)。分別先算好', views: [arr(A, { label: 'nums' })] }]
  L[0] = 1
  out.push({ note: 'left[0] = 1:最左邊的左邊沒有數,乘積是 1(空乘積)', views: [arr(A, { label: 'nums' }), arr(L, { label: 'left[i] = nums[0..i−1] 的乘積', highlight: [0] })] })
  for (let i = 1; i < n; i++) {
    L[i] = (L[i - 1] as number) * A[i - 1]
    out.push({ note: `left[${i}] = left[${i - 1}] × nums[${i - 1}] = ${L[i - 1]} × ${A[i - 1]} = ${L[i]}`, views: [arr(A, { label: 'nums', compare: [i - 1] }), arr(L, { label: 'left[i] = nums[0..i−1] 的乘積', highlight: [i] })] })
  }
  R[n - 1] = 1
  out.push({ note: `right[${n - 1}] = 1:最右邊的右邊沒有數`, views: [arr(A, { label: 'nums' }), arr(L, { label: 'left' }), arr(R, { label: 'right[i] = nums[i+1..n−1] 的乘積', highlight: [n - 1] })] })
  for (let i = n - 2; i >= 0; i--) {
    R[i] = (R[i + 1] as number) * A[i + 1]
    out.push({ note: `right[${i}] = right[${i + 1}] × nums[${i + 1}] = ${R[i + 1]} × ${A[i + 1]} = ${R[i]}`, views: [arr(A, { label: 'nums', compare: [i + 1] }), arr(L, { label: 'left' }), arr(R, { label: 'right[i] = nums[i+1..n−1] 的乘積', highlight: [i] })] })
  }
  const ans = L.map((v, i) => (v as number) * (R[i] as number))
  out.push({ note: `answer[i] = left[i] × right[i] → [${ans.join(', ')}]`, views: [arr(L, { label: 'left' }), arr(R, { label: 'right' }), arr(ans, { label: 'answer', done: range(0, n - 1) })] })
  return out
}

function o1Fig(): FigStep[] {
  const n = A.length
  const ans: (number | string)[] = Array(n).fill('?')
  const out: FigStep[] = [{ note: '同樣的想法,但不另外開 left / right:先把左乘積直接寫進 answer,再從右往左用一個變數 suffix 乘上去', views: [arr(A, { label: 'nums' }), arr(ans, { label: 'answer' })] }]
  let prefix = 1
  for (let i = 0; i < n; i++) {
    ans[i] = prefix
    out.push({ note: `第一趟(左 → 右):answer[${i}] = prefix = ${prefix},然後 prefix ×= nums[${i}] → ${prefix * A[i]}`, views: [arr(A, { label: 'nums', highlight: [i] }), arr(ans, { label: 'answer(目前存的是左乘積)', highlight: [i] })] })
    prefix *= A[i]
  }
  let suffix = 1
  for (let i = n - 1; i >= 0; i--) {
    ans[i] = (ans[i] as number) * suffix
    out.push({ note: `第二趟(右 → 左):answer[${i}] ×= suffix(${suffix})→ ${ans[i]},然後 suffix ×= nums[${i}] → ${suffix * A[i]}`, views: [arr(A, { label: 'nums', highlight: [i] }), arr(ans, { label: 'answer', highlight: [i], done: range(i + 1, n - 1) })] })
    suffix *= A[i]
  }
  out.push({ note: `完成:[${ans.join(', ')}]。除了輸出陣列,只用了 prefix、suffix 兩個變數`, views: [arr(ans, { label: 'answer', done: range(0, n - 1) })] })
  return out
}

export const q0238: Solution = {
  id: 238,
  plain: '對每個位置,算出「除了它自己以外,其他所有數相乘」的結果,而且不准用除法。訣竅:答案 = 它左邊全部相乘 × 它右邊全部相乘。',
  statement: '給一個整數陣列 `nums`,回傳陣列 `answer`,其中 `answer[i]` 是 `nums` 裡**除了 `nums[i]` 以外**所有數的乘積。要 O(n) 時間,而且**不能用除法**。',
  examples: [
    { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', note: '24 = 2×3×4、12 = 1×3×4……' },
    { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]', note: '有 0 的時候,只有 0 那一格不是 0' },
  ],
  constraints: [
    '`2 ≤ n ≤ 10⁵` → O(n²) 是 100 億,太慢',
    '題目保證任何前綴或後綴的乘積都在 32 位元整數範圍內 → 不用擔心溢位',
    '**不能用除法** → 「全部乘起來再除以自己」不行(而且遇到 0 本來就會出問題)',
    'Follow-up:除了輸出陣列,能不能 O(1) 額外空間?',
  ],
  insight: [
    '暴力:每一格都把其他 n − 1 個數乘一遍 → O(n²)',
    '「除了自己」= **左邊全部** × **右邊全部**。左邊的乘積可以從左往右累積(前綴積),右邊的從右往左累積(後綴積),各 O(n)',
    '這就是[[p:prefix-sum]]的乘法版本:前綴「和」換成前綴「積」',
    '要省空間:輸出陣列本身不算額外空間,先把前綴積寫進去,再從右往左用一個變數乘上後綴積',
  ],
  approaches: [
    {
      name: '暴力:每格乘一遍',
      idea: '對每個 `i`,走過所有 `j ≠ i` 把它們乘起來。',
      steps: ['對每個 `i`:`p = 1`', '對每個 `j ≠ i`:`p *= nums[j]`', '`answer[i] = p`'],
      figure: { title: 'nums = [2,3,4,5]', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n 格,每格乘 n − 1 次。不算輸出陣列。' },
      verdict: 'n = 10⁵ 會超時。只當起點。',
      code: {
        python: `def productExceptSelf(nums):
    n = len(nums)
    ans = [1] * n
    for i in range(n):
        for j in range(n):
            if j != i:
                ans[i] *= nums[j]
    return ans`,
        c: `int *productExceptSelf(int *nums, int numsSize, int *returnSize) {
    int *ans = malloc(numsSize * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        ans[i] = 1;
        for (int j = 0; j < numsSize; j++)
            if (j != i) ans[i] *= nums[j];
    }
    *returnSize = numsSize;
    return ans;
}`,
        cpp: `vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> ans(n, 1);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (j != i) ans[i] *= nums[j];
    return ans;
}`,
        java: `int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] ans = new int[n];
    for (int i = 0; i < n; i++) {
        ans[i] = 1;
        for (int j = 0; j < n; j++)
            if (j != i) ans[i] *= nums[j];
    }
    return ans;
}`,
        javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const ans = new Array(n).fill(1);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (j !== i) ans[i] *= nums[j];
  return ans;
}`,
      },
    },
    {
      name: '前綴積陣列 × 後綴積陣列',
      idea: '`left[i]` = `nums[0..i−1]` 的乘積,`right[i]` = `nums[i+1..n−1]` 的乘積,`answer[i] = left[i] × right[i]`。',
      steps: ['`left[0] = 1`,`left[i] = left[i−1] × nums[i−1]`(左 → 右)', '`right[n−1] = 1`,`right[i] = right[i+1] × nums[i+1]`(右 → 左)', '`answer[i] = left[i] × right[i]`'],
      figure: { title: 'nums = [2,3,4,5]', steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '三次線性掃描。另外開了 left、right 兩個長度 n 的陣列。' },
      verdict: '最容易理解的 O(n) 解。面試時先講這個,再說「left 可以直接放在 answer 裡、right 可以用一個變數取代」。',
      code: {
        python: `def productExceptSelf(nums):
    n = len(nums)
    left, right = [1] * n, [1] * n
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]`,
        c: `int *productExceptSelf(int *nums, int numsSize, int *returnSize) {
    int n = numsSize;
    int *left = malloc(n * sizeof(int)), *right = malloc(n * sizeof(int));
    int *ans = malloc(n * sizeof(int));
    left[0] = 1;
    for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
    right[n - 1] = 1;
    for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
    for (int i = 0; i < n; i++) ans[i] = left[i] * right[i];
    free(left); free(right);
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> left(n, 1), right(n, 1), ans(n);
    for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
    for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
    for (int i = 0; i < n; i++) ans[i] = left[i] * right[i];
    return ans;
}`,
        java: `int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] left = new int[n], right = new int[n], ans = new int[n];
    left[0] = 1;
    for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
    right[n - 1] = 1;
    for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
    for (int i = 0; i < n; i++) ans[i] = left[i] * right[i];
    return ans;
}`,
        javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const left = new Array(n).fill(1), right = new Array(n).fill(1);
  for (let i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
  for (let i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
  return left.map((v, i) => v * right[i]);
}`,
      },
    },
    {
      name: '輸出陣列存前綴積 + 一個變數乘後綴積',
      idea: '第一趟把前綴積直接寫進 `answer`;第二趟從右往左,用變數 `suffix` 記右邊的乘積,邊走邊乘進 `answer[i]`。',
      steps: ['`prefix = 1`;左 → 右:`answer[i] = prefix`,`prefix *= nums[i]`', '`suffix = 1`;右 → 左:`answer[i] *= suffix`,`suffix *= nums[i]`'],
      figure: { title: 'nums = [2,3,4,5]', steps: o1Fig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩次掃描。題目規定輸出陣列不算額外空間,其他只用兩個變數。' },
      verdict: '符合 follow-up 的最佳解。注意兩趟的「先用、再乘」順序:要先把目前的 prefix / suffix 寫進去,再乘上自己,才不會把自己算進去。',
      code: {
        python: `def productExceptSelf(nums):
    n = len(nums)
    ans = [1] * n
    prefix = 1
    for i in range(n):
        ans[i] = prefix                   # 先放「左邊的乘積」
        prefix *= nums[i]                 # 再把自己乘進去,給下一格用
    suffix = 1
    for i in range(n - 1, -1, -1):
        ans[i] *= suffix                  # 乘上「右邊的乘積」
        suffix *= nums[i]
    return ans`,
        c: `int *productExceptSelf(int *nums, int numsSize, int *returnSize) {
    int *ans = malloc(numsSize * sizeof(int));
    int prefix = 1;
    for (int i = 0; i < numsSize; i++) {
        ans[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = numsSize - 1; i >= 0; i--) {
        ans[i] *= suffix;
        suffix *= nums[i];
    }
    *returnSize = numsSize;
    return ans;
}`,
        cpp: `vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> ans(n);
    int prefix = 1;
    for (int i = 0; i < n; i++) {
        ans[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) {
        ans[i] *= suffix;
        suffix *= nums[i];
    }
    return ans;
}`,
        java: `int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] ans = new int[n];
    int prefix = 1;
    for (int i = 0; i < n; i++) {
        ans[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) {
        ans[i] *= suffix;
        suffix *= nums[i];
    }
    return ans;
}`,
        javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const ans = new Array(n);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    ans[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    ans[i] *= suffix;
    suffix *= nums[i];
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '用除法「總乘積 ÷ nums[i]」:題目禁止,而且 `nums` 有 0 時會除以 0;有兩個以上的 0 時更要分情況',
    '前綴積的順序寫反(先乘自己再寫入),會變成「包含自己」的乘積',
    'JavaScript 的 `0 × 負數` 會得到 `-0`;`-0 === 0` 是 true,LeetCode 輸出時也會印成 0,不影響答案',
  ],
  followUp: [
    { q: '如果允許除法?', a: '先數 0 的個數:兩個以上 → 全部是 0;剛好一個 → 只有 0 那格是「其他數的乘積」;沒有 0 → 總乘積 ÷ nums[i]。' },
    { q: '同樣的「左邊 × 右邊」想法還出現在哪?', a: '[42. Trapping Rain Water](#/q/42):每格的水位 = min(左邊最高, 右邊最高),也是從兩個方向各掃一次。' },
  ],
  check: {
    kind: 'fn',
    fn: 'productExceptSelf',
    cases: [
      { args: [[1, 2, 3, 4]], out: [24, 12, 8, 6] },
      { args: [[-1, 1, 0, -3, 3]], out: [0, 0, 9, 0, 0] },
      { args: [[2, 3, 4, 5]], out: [60, 40, 30, 24] },
      { args: [[0, 0]], out: [0, 0] },
      { args: [[5, -2]], out: [-2, 5] },
    ],
  },
}
