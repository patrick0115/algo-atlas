import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1968. Array With Elements Not Equal to Average of Neighbors

const A = [1, 2, 3, 4, 5]

function sortFig(): FigStep[] {
  return [
    { note: '要讓每個中間元素都不等於左右鄰居的平均。平均只會發生在「左 < 中 < 右」或「左 > 中 > 右」時 → 只要排成**一高一低交錯**就保證不會', views: [arr(A, { label: 'nums' })] },
    { note: '排序後切成小的一半、大的一半,交錯放:小、大、小、大…', views: [arr([1, 2, 3], { label: '小的一半' }), arr([4, 5], { label: '大的一半' })] },
    { note: '1, 4, 2, 5, 3:每個大的兩邊都比它小,每個小的兩邊都比它大 → 不可能是平均', views: [arr([1, 4, 2, 5, 3], { label: '結果', mode: 'bars', done: [0, 1, 2, 3, 4] })] },
  ]
}

function swapFig(): FigStep[] {
  return [
    { note: '不排序:一次掃描做成「波浪」。奇數位置要比左右大:如果 nums[i] 沒有比兩邊大,就和較大的鄰居交換', views: [arr(A, { label: 'nums', mode: 'bars' })] },
    { note: '更簡單的版本:對每個 i,若 nums[i−1] < nums[i] < nums[i+1](或反過來),就交換 nums[i] 和 nums[i+1]。交換只會破壞右邊,往右掃下去會修好', views: [arr([1, 3, 2, 5, 4], { label: '結果', mode: 'bars', done: [0, 1, 2, 3, 4] })] },
  ]
}

const CHECK = {
  python: `

def avgCheck(nums):                           # 測試用:合法回傳 1
    t = rearrangeArray(list(nums))
    if sorted(t) != sorted(nums):
        return 0
    return int(all(2 * t[i] != t[i - 1] + t[i + 1] for i in range(1, len(t) - 1)))`,
  c: `

static int cmpInt(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int avgCheck(int *nums, int numsSize) {
    int *a = malloc(numsSize * sizeof(int)), *b = malloc(numsSize * sizeof(int));
    memcpy(a, nums, numsSize * sizeof(int));
    int rs;
    int *t = rearrangeArray(a, numsSize, &rs);
    memcpy(b, t, numsSize * sizeof(int));
    for (int i = 1; i + 1 < rs; i++) if (2 * t[i] == t[i - 1] + t[i + 1]) return 0;
    qsort(b, numsSize, sizeof(int), cmpInt);
    qsort(nums, numsSize, sizeof(int), cmpInt);
    return rs == numsSize && memcmp(b, nums, numsSize * sizeof(int)) == 0;
}`,
  cpp: `

int avgCheck(vector<int> nums) {
    vector<int> a = nums;
    vector<int> t = rearrangeArray(a);
    for (size_t i = 1; i + 1 < t.size(); i++) if (2 * t[i] == t[i - 1] + t[i + 1]) return 0;
    vector<int> x = t, y = nums;
    sort(x.begin(), x.end()); sort(y.begin(), y.end());
    return x == y;
}`,
  java: `

int avgCheck(int[] nums) {
    int[] t = rearrangeArray(nums.clone());
    for (int i = 1; i + 1 < t.length; i++) if (2 * t[i] == t[i - 1] + t[i + 1]) return 0;
    int[] x = t.clone(), y = nums.clone();
    Arrays.sort(x); Arrays.sort(y);
    return Arrays.equals(x, y) ? 1 : 0;
}`,
  javascript: `

function avgCheck(nums) {
  const t = rearrangeArray([...nums]);
  for (let i = 1; i + 1 < t.length; i++) if (2 * t[i] === t[i - 1] + t[i + 1]) return 0;
  const x = [...t].sort((a, b) => a - b), y = [...nums].sort((a, b) => a - b);
  return x.length === y.length && x.every((v, i) => v === y[i]) ? 1 : 0;
}`,
}

export const q1968: Solution = {
  id: 1968,
  plain: '把一串互不相同的數字重新排列,讓中間的每個數都「不是」它左右兩個鄰居的平均值。給出任一種排法即可。',
  statement: '給**互不相同**整數組成的陣列 `nums`,重新排列使得對每個 `1 ≤ i < n − 1`,`(nums[i−1] + nums[i+1]) / 2 ≠ nums[i]`。回傳任一合法排列。(答案不唯一,這裡用 `avgCheck(nums)` 檢查:合法回傳 1。)',
  examples: [
    { input: 'nums = [1,2,3,4,5]', output: '[1,2,4,5,3]', note: '任何合法答案都可以' },
    { input: 'nums = [6,2,0,9,7]', output: '[9,7,6,2,0]' },
  ],
  constraints: ['3 ≤ n ≤ 10⁵,元素互不相同'],
  insight: ['中間值等於平均 ⇒ 它一定介於兩鄰居之間', '排成波浪(高低交錯),每個元素都比兩個鄰居都大或都小 → [[p:greedy]]', '和 Wiggle Sort(擺動排序)同一個想法'],
  approaches: [
    {
      name: '排序後交錯放',
      idea: '排序;偶數位置依序放小的一半,奇數位置依序放大的一半。',
      steps: ['`nums.sort()`', '`half = (n + 1) // 2`', '`res[0::2] = nums[:half]`、`res[1::2] = nums[half:]`'],
      figure: { title: `nums = [${A}]`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 + 一個結果陣列。' },
      verdict: '最推薦,正確性一眼就看得出來。',
      code: {
        python: `def rearrangeArray(nums):
    nums.sort()
    half = (len(nums) + 1) // 2
    res = [0] * len(nums)
    res[0::2] = nums[:half]                   # 小的放偶數位置
    res[1::2] = nums[half:]                   # 大的放奇數位置
    return res${CHECK.python}`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int *rearrangeArray(int *nums, int numsSize, int *returnSize) {
    qsort(nums, numsSize, sizeof(int), cmp);
    int *res = malloc(numsSize * sizeof(int)), half = (numsSize + 1) / 2;
    for (int i = 0; i < numsSize; i++) res[i] = i % 2 == 0 ? nums[i / 2] : nums[half + i / 2];
    *returnSize = numsSize;
    return res;
}${CHECK.c}`,
        cpp: `vector<int> rearrangeArray(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size(), half = (n + 1) / 2;
    vector<int> res(n);
    for (int i = 0; i < n; i++) res[i] = i % 2 == 0 ? nums[i / 2] : nums[half + i / 2];
    return res;
}${CHECK.cpp}`,
        java: `int[] rearrangeArray(int[] nums) {
    Arrays.sort(nums);
    int n = nums.length, half = (n + 1) / 2;
    int[] res = new int[n];
    for (int i = 0; i < n; i++) res[i] = i % 2 == 0 ? nums[i / 2] : nums[half + i / 2];
    return res;
}${CHECK.java}`,
        javascript: `function rearrangeArray(nums) {
  nums.sort((a, b) => a - b);
  const n = nums.length, half = Math.ceil(n / 2), res = new Array(n);
  for (let i = 0; i < n; i++) res[i] = i % 2 === 0 ? nums[i / 2] : nums[half + (i - 1) / 2];
  return res;
}${CHECK.javascript}`,
      },
    },
    {
      name: '一次掃描修正單調的三連',
      idea: '`for i in 1..n−2`:若 `nums[i−1] < nums[i] < nums[i+1]` 或 `>` 方向,交換 `nums[i]` 和 `nums[i+1]`。',
      steps: ['`for i in range(1, n − 1)`', '三個數單調遞增或遞減 → `swap(nums[i], nums[i+1])`', '回傳 nums'],
      figure: { title: `nums = [${A}]`, steps: swapFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '原地一次掃描。' },
      verdict: '不排序、原地完成;交換後 i 變成兩邊的極值,而 i + 1 的問題留給下一輪處理。',
      code: {
        python: `def rearrangeArray(nums):
    for i in range(1, len(nums) - 1):
        a, b, c = nums[i - 1], nums[i], nums[i + 1]
        if a < b < c or a > b > c:
            nums[i], nums[i + 1] = c, b       # 把中間換成極值
    return nums${CHECK.python}`,
        c: `int *rearrangeArray(int *nums, int numsSize, int *returnSize) {
    for (int i = 1; i + 1 < numsSize; i++) {
        int a = nums[i - 1], b = nums[i], c = nums[i + 1];
        if ((a < b && b < c) || (a > b && b > c)) { nums[i] = c; nums[i + 1] = b; }
    }
    *returnSize = numsSize;
    return nums;
}${CHECK.c}`,
        cpp: `vector<int> rearrangeArray(vector<int>& nums) {
    for (int i = 1; i + 1 < (int)nums.size(); i++) {
        int a = nums[i - 1], b = nums[i], c = nums[i + 1];
        if ((a < b && b < c) || (a > b && b > c)) swap(nums[i], nums[i + 1]);
    }
    return nums;
}${CHECK.cpp}`,
        java: `int[] rearrangeArray(int[] nums) {
    for (int i = 1; i + 1 < nums.length; i++) {
        int a = nums[i - 1], b = nums[i], c = nums[i + 1];
        if ((a < b && b < c) || (a > b && b > c)) { nums[i] = c; nums[i + 1] = b; }
    }
    return nums;
}${CHECK.java}`,
        javascript: `function rearrangeArray(nums) {
  for (let i = 1; i + 1 < nums.length; i++) {
    const a = nums[i - 1], b = nums[i], c = nums[i + 1];
    if ((a < b && b < c) || (a > b && b > c)) [nums[i], nums[i + 1]] = [c, b];
  }
  return nums;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['用 `(a + c) / 2` 整數除法比較:奇數和會被截斷,誤判成相等;改成 `2b != a + c`', '交錯放時把大的放偶數位置、但 n 是奇數:大的一半會不夠放'],
  check: {
    kind: 'fn',
    fn: 'avgCheck',
    cases: [
      { args: [A], out: 1 },
      { args: [[6, 2, 0, 9, 7]], out: 1 },
      { args: [[1, 2, 3]], out: 1 },
      { args: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], out: 1 },
    ],
  },
}
