import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 977. Squares of a Sorted Array

const A = [-4, -1, 0, 3, 10]

function sortFig(): FigStep[] {
  const sq = A.map((x) => x * x)
  return [
    { note: '每個數平方:負數平方後會變大,所以原本的順序被打亂了', views: [arr(A, { label: 'nums' }), arr(sq, { label: '平方' })] },
    { note: '再排序一次就好', views: [arr([...sq].sort((a, b) => a - b), { label: '排序後', done: [0, 1, 2, 3, 4] })] },
  ]
}

function twoPtrFig(): FigStep[] {
  const n = A.length
  const res: (number | string)[] = Array(n).fill('')
  let l = 0
  let r = n - 1
  const out: FigStep[] = [{ note: '平方最大的一定在**兩端**(最負的或最正的)。左右各一個指標,每次把兩端平方比較大的那個,從結果的**最後面**往前填', views: [arr(A, { label: 'nums', pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] }), arr(res, { label: '結果' })] }]
  for (let k = n - 1; k >= 0; k--) {
    const a = A[l] * A[l]
    const b = A[r] * A[r]
    const pick = a > b ? l : r
    res[k] = Math.max(a, b)
    out.push({ note: `${A[l]}² = ${a} vs ${A[r]}² = ${b} → ${res[k]} 比較大,填到結果[${k}],${pick === l ? 'L 往右' : 'R 往左'}`, views: [arr(A, { label: 'nums', highlight: [pick], compare: [l, r], dim: [...Array.from({ length: l }, (_, i) => i), ...Array.from({ length: n - 1 - r }, (_, i) => n - 1 - i)], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] }), arr([...res], { label: '結果', highlight: [k] })] })
    if (pick === l) l++
    else r--
  }
  return out
}

export const q0977: Solution = {
  id: 977,
  plain: '一排已經由小到大排好的數(有負有正),每個都平方之後,再由小到大排好。麻煩的是負數:−4 很小,平方後 16 卻很大。',
  statement: '給**非遞減排序**的整數陣列 `nums`,回傳每個數平方後組成的陣列,同樣要非遞減排序。Follow-up:O(n)。',
  examples: [
    { input: 'nums = [-4,-1,0,3,10]', output: '[0,1,9,16,100]' },
    { input: 'nums = [-7,-3,2,3,11]', output: '[4,9,9,49,121]' },
  ],
  constraints: ['n ≤ 10⁴', '值在 −10⁴ ~ 10⁴', 'Follow-up:O(n) 時間'],
  insight: ['直接平方再排序:O(n log n),最簡單', '想要 O(n):平方後的大小 = 離 0 的距離。最大的一定在兩端', '所以從兩端往中間夾,大的先填到結果的尾巴'],
  approaches: [
    {
      name: '平方後排序',
      idea: '每個數平方,再排序。',
      steps: ['`sq = [x * x for x in nums]`', '排序後回傳'],
      figure: { title: `nums = [${A}]`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序的成本。' },
      verdict: '一行搞定,但沒有用到「原本已經排序」這個條件。',
      code: {
        python: `def sortedSquares(nums):
    return sorted(x * x for x in nums)`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int *sortedSquares(int *nums, int numsSize, int *returnSize) {
    int *res = malloc(numsSize * sizeof(int));
    for (int i = 0; i < numsSize; i++) res[i] = nums[i] * nums[i];
    qsort(res, numsSize, sizeof(int), cmp);       // 值都 ≥ 0 且 ≤ 10⁸,相減不會溢位
    *returnSize = numsSize;
    return res;
}`,
        cpp: `vector<int> sortedSquares(vector<int>& nums) {
    vector<int> res;
    for (int x : nums) res.push_back(x * x);
    sort(res.begin(), res.end());
    return res;
}`,
        java: `int[] sortedSquares(int[] nums) {
    int[] res = new int[nums.length];
    for (int i = 0; i < nums.length; i++) res[i] = nums[i] * nums[i];
    Arrays.sort(res);
    return res;
}`,
        javascript: `function sortedSquares(nums) {
  return nums.map((x) => x * x).sort((a, b) => a - b);
}`,
      },
    },
    {
      name: '左右雙指標,從大的填起',
      idea: '`l = 0`、`r = n − 1`、`k = n − 1`;比較 `nums[l]²` 和 `nums[r]²`,大的放到 `res[k]`,對應指標內移,`k −= 1`。',
      steps: ['`res = [0] * n`、`l, r = 0, n − 1`', '`for k in n−1..0`:', '`nums[l]² > nums[r]²` → `res[k] = nums[l]²`、`l += 1`;否則 `res[k] = nums[r]²`、`r -= 1`'],
      figure: { title: `nums = [${A}]`, steps: twoPtrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數只看一次;結果陣列本身要 n 格。' },
      verdict: '最推薦(Follow-up 的答案)。和[合併兩個排序陣列](#/q/88)同一個想法:兩段各自有序,從大的那端開始填。',
      code: {
        python: `def sortedSquares(nums):
    n = len(nums)
    res = [0] * n
    l, r = 0, n - 1
    for k in range(n - 1, -1, -1):            # 從最後一格往前填
        if nums[l] * nums[l] > nums[r] * nums[r]:
            res[k] = nums[l] * nums[l]
            l += 1
        else:
            res[k] = nums[r] * nums[r]
            r -= 1
    return res`,
        c: `int *sortedSquares(int *nums, int numsSize, int *returnSize) {
    int *res = malloc(numsSize * sizeof(int));
    for (int l = 0, r = numsSize - 1, k = numsSize - 1; k >= 0; k--) {
        int a = nums[l] * nums[l], b = nums[r] * nums[r];
        if (a > b) { res[k] = a; l++; }
        else { res[k] = b; r--; }
    }
    *returnSize = numsSize;
    return res;
}`,
        cpp: `vector<int> sortedSquares(vector<int>& nums) {
    int n = nums.size();
    vector<int> res(n);
    for (int l = 0, r = n - 1, k = n - 1; k >= 0; k--) {
        int a = nums[l] * nums[l], b = nums[r] * nums[r];
        if (a > b) { res[k] = a; l++; }
        else { res[k] = b; r--; }
    }
    return res;
}`,
        java: `int[] sortedSquares(int[] nums) {
    int n = nums.length;
    int[] res = new int[n];
    for (int l = 0, r = n - 1, k = n - 1; k >= 0; k--) {
        int a = nums[l] * nums[l], b = nums[r] * nums[r];
        if (a > b) { res[k] = a; l++; }
        else { res[k] = b; r--; }
    }
    return res;
}`,
        javascript: `function sortedSquares(nums) {
  const n = nums.length, res = new Array(n);
  for (let l = 0, r = n - 1, k = n - 1; k >= 0; k--) {
    const a = nums[l] * nums[l], b = nums[r] * nums[r];
    if (a > b) {
      res[k] = a;
      l++;
    } else {
      res[k] = b;
      r--;
    }
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['雙指標從小的開始填:最小的平方在中間(最靠近 0 的地方),不在兩端,沒辦法直接找到', '只看 nums[l] < nums[r] 比大小:要比的是平方(或絕對值)'],
  check: {
    kind: 'fn',
    fn: 'sortedSquares',
    cases: [
      { args: [A], out: [0, 1, 9, 16, 100] },
      { args: [[-7, -3, 2, 3, 11]], out: [4, 9, 9, 49, 121] },
      { args: [[-5]], out: [25] },
      { args: [[-3, -2, -1]], out: [1, 4, 9] },
      { args: [[1, 2, 3]], out: [1, 4, 9] },
    ],
  },
}
