import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1929. Concatenation of Array
const A = [1, 2, 1]
const loopFig: FigStep[] = [
  { note: '把原陣列接在自己後面。對每個索引 i,在答案的 i 和 i+n 都放 nums[i]。', views: [arr(A, { label: 'nums' }), arr([1, 2, 1, 1, 2, 1], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
  { note: 'i=0 把 1 寫到位置 0 與 3;i=1 把 2 寫到位置 1 與 4,依此完成兩份。', views: [arr([0, 3, 1, 4, 2, 5], { label: '成對寫入的位置' })] },
]
const copyFig: FigStep[] = [
  { note: '另一種寫法先複製第一份,再把原陣列整份接到尾端。', views: [arr(A, { label: '第一份' }), arr(A, { label: '第二份' })] },
  { note: '兩份順序完全一樣,長度變成 2n。', views: [arr([1, 2, 1, 1, 2, 1], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
]

export const q1929: Solution = {
  id: 1929,
  plain: '把一份陣列再複製一份接到後面。例如 [1,2,1] 變成 [1,2,1,1,2,1]。',
  statement: '給長度 n 的整數陣列 nums,建立長度 2n 的陣列 ans,其中前 n 個與後 n 個都等於 nums。',
  examples: [{ input: 'nums = [1,2,1]', output: '[1,2,1,1,2,1]' }, { input: 'nums = [1,3,2,1]', output: '[1,3,2,1,1,3,2,1]' }],
  constraints: ['nums 非空', '答案長度是原長度的兩倍'],
  insight: ['位置 i 的值會同時出現在答案的 i 與 i+n。', '直接建立輸出,不需要任何搜尋或排序。'],
  approaches: [
    {
      name: '逐索引寫兩次',
      idea: '遍歷原陣列,把每個值放進輸出陣列的兩個對應位置。',
      steps: ['建立長度 2n 的 ans', '對每個 i,令 ans[i] = nums[i]', '同時令 ans[i+n] = nums[i]', '回傳 ans'],
      figure: { title: 'nums = [1,2,1]', steps: loopFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '必須產生長度 2n 的結果。' },
      verdict: '索引關係最明確,各語言都能直接寫。',
      code: {
        python: `def getConcatenation(nums):
    n = len(nums)
    ans = [0] * (2 * n)
    for i, x in enumerate(nums):
        ans[i] = x
        ans[i + n] = x
    return ans`,
        c: `int *getConcatenation(int *nums, int numsSize, int *returnSize) {
    int *ans = malloc(2 * numsSize * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        ans[i] = nums[i];
        ans[i + numsSize] = nums[i];
    }
    *returnSize = 2 * numsSize;
    return ans;
}`,
        cpp: `vector<int> getConcatenation(vector<int>& nums) {
    int n = nums.size();
    vector<int> ans(2 * n);
    for (int i = 0; i < n; i++) ans[i] = ans[i + n] = nums[i];
    return ans;
}`,
        java: `int[] getConcatenation(int[] nums) {
    int n = nums.length;
    int[] ans = new int[2 * n];
    for (int i = 0; i < n; i++) ans[i] = ans[i + n] = nums[i];
    return ans;
}`,
        javascript: `function getConcatenation(nums) {
  const n = nums.length, ans = Array(2 * n);
  for (let i = 0; i < n; i++) ans[i] = ans[i + n] = nums[i];
  return ans;
}`,
      },
    },
    {
      name: '整份複製兩次',
      idea: '直接把 nums 複製成前後兩段;可使用語言內建的串接或區塊複製。',
      steps: ['複製 nums 成答案前半', '把 nums 再接到答案後半', '回傳答案'],
      figure: { title: '把原陣列接在自己後面', steps: copyFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩份資料都要寫進新陣列。' },
      verdict: '短而清楚;底層仍需複製 2n 個值。',
      code: {
        python: `def getConcatenation(nums):
    return nums + nums`,
        c: `int *getConcatenation(int *nums, int numsSize, int *returnSize) {
    int *ans = malloc(2 * numsSize * sizeof(int));
    memcpy(ans, nums, numsSize * sizeof(int));
    memcpy(ans + numsSize, nums, numsSize * sizeof(int));
    *returnSize = 2 * numsSize;
    return ans;
}`,
        cpp: `vector<int> getConcatenation(vector<int>& nums) {
    vector<int> ans = nums;
    ans.insert(ans.end(), nums.begin(), nums.end());
    return ans;
}`,
        java: `int[] getConcatenation(int[] nums) {
    int n = nums.length;
    int[] ans = new int[2 * n];
    System.arraycopy(nums, 0, ans, 0, n);
    System.arraycopy(nums, 0, ans, n, n);
    return ans;
}`,
        javascript: `function getConcatenation(nums) {
  return nums.concat(nums);
}`,
      },
    },
  ],
  pitfalls: ['後半段的起點是索引 n,不是 n+1。', '若直接修改原陣列,要確認呼叫端是否允許;此處回傳新陣列最單純。'],
  check: { kind: 'fn', fn: 'getConcatenation', cases: [
    { args: [A], out: [1, 2, 1, 1, 2, 1] },
    { args: [[1, 3, 2, 1]], out: [1, 3, 2, 1, 1, 3, 2, 1] },
    { args: [[7]], out: [7, 7] },
  ] },
}
