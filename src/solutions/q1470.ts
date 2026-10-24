import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1470. Shuffle the Array
const A = [2, 5, 1, 3, 4, 7], N = 3
const outputFig: FigStep[] = [
  { note: '前 n 個是 x1,x2,x3,後 n 個是 y1,y2,y3。答案要 x1,y1,x2,y2,x3,y3 交錯排列。', views: [arr(A, { label: '原陣列' }), arr([2, 3, 5, 4, 1, 7], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
  { note: '第 i 對數字直接放到答案的 2i 與 2i+1。', views: [arr([2, 3], { label: '第 0 對' }), arr([5, 4], { label: '第 1 對' }), arr([1, 7], { label: '第 2 對' })] },
]
const packedFig: FigStep[] = [
  { note: '若要求 O(1) 額外空間,可利用每個值不超過 1000:低 10 位放 x,高 10 位暫存對應的 y。', views: [arr([2, 5, 1], { label: '低 10 位:x' }), arr([3, 4, 7], { label: '高 10 位:y' })] },
  { note: '由後往前解出每一對,寫回原陣列的 2i、2i+1,避免覆蓋還沒讀的資料。', views: [arr([2, 3, 5, 4, 1, 7], { label: '原地排列後', done: [0, 1, 2, 3, 4, 5] })] },
]

export const q1470: Solution = {
  id: 1470,
  plain: '一個陣列先放了所有 x,再放所有 y;現在要像洗牌一樣交錯成 x1,y1,x2,y2……。',
  statement: '給長度 2n 的陣列 nums = [x1,…,xn,y1,…,yn],回傳 [x1,y1,x2,y2,…,xn,yn]。',
  examples: [{ input: 'nums = [2,5,1,3,4,7], n = 3', output: '[2,3,5,4,1,7]' }, { input: 'nums = [1,2,3,4,4,3,2,1], n = 4', output: '[1,4,2,3,3,2,4,1]' }],
  constraints: ['nums 長度恰好為 2n', '每個數值在 1..1000;可用於原地位元打包'],
  insight: ['第 i 個 x 放在結果索引 2i,第 i 個 y 放在 2i+1。', '若使用新陣列,一次遍歷就能完成。', '進階原地法利用值小於 2¹⁰,可在一個整數同時暫存一對值。'],
  approaches: [
    {
      name: '新陣列交錯寫入',
      idea: '一次取 nums[i] 和 nums[n+i],放到答案相鄰的兩個位置。',
      steps: ['建立長度 2n 的答案陣列', '對 i = 0..n−1,令 ans[2i] = nums[i]', '令 ans[2i+1] = nums[n+i]', '回傳答案'],
      figure: { title: '前後兩半交錯', steps: outputFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每一對讀寫一次;輸出陣列需 2n 格。' },
      verdict: '最清楚,不依賴數值範圍。',
      code: {
        python: `def shuffle(nums, n):
    ans = [0] * (2 * n)
    for i in range(n):
        ans[2 * i] = nums[i]
        ans[2 * i + 1] = nums[n + i]
    return ans`,
        c: `int *shuffle(int *nums, int numsSize, int n, int *returnSize) {
    int *ans = malloc(numsSize * sizeof(int));
    for (int i = 0; i < n; i++) {
        ans[2 * i] = nums[i];
        ans[2 * i + 1] = nums[n + i];
    }
    *returnSize = numsSize;
    return ans;
}`,
        cpp: `vector<int> shuffle(vector<int>& nums, int n) {
    vector<int> ans(2 * n);
    for (int i = 0; i < n; i++) {
        ans[2 * i] = nums[i];
        ans[2 * i + 1] = nums[n + i];
    }
    return ans;
}`,
        java: `int[] shuffle(int[] nums, int n) {
    int[] ans = new int[2 * n];
    for (int i = 0; i < n; i++) {
        ans[2 * i] = nums[i];
        ans[2 * i + 1] = nums[n + i];
    }
    return ans;
}`,
        javascript: `function shuffle(nums, n) {
  const ans = Array(2 * n);
  for (let i = 0; i < n; i++) {
    ans[2 * i] = nums[i];
    ans[2 * i + 1] = nums[n + i];
  }
  return ans;
}`,
      },
    },
    {
      name: '位元打包原地重排',
      idea: '將對應的 y 暫存在 x 的高位,再由後往前拆出兩個值並覆蓋原陣列。',
      steps: ['對 i = 0..n−1,做 nums[i] |= nums[n+i] << 10', '從 i = n−1 下降到 0', 'nums[2i+1] = nums[i] >> 10', 'nums[2i] = nums[i] & 1023'],
      figure: { title: '利用 10 位保存一個數', steps: packedFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '直接改輸入陣列,只用常數個變數。C 版必須回傳新配置的陣列,所以先複製一份。' },
      verdict: '進階技巧,必須知道數值上限;一般寫法仍以新陣列較清楚。',
      code: {
        python: `def shuffle(nums, n):
    for i in range(n):
        nums[i] |= nums[n + i] << 10
    for i in range(n - 1, -1, -1):
        nums[2 * i + 1] = nums[i] >> 10
        nums[2 * i] = nums[i] & 1023
    return nums`,
        c: `int *shuffle(int *nums, int numsSize, int n, int *returnSize) {
    int *ans = malloc(numsSize * sizeof(int));
    memcpy(ans, nums, numsSize * sizeof(int));
    for (int i = 0; i < n; i++) ans[i] |= ans[n + i] << 10;
    for (int i = n - 1; i >= 0; i--) {
        ans[2 * i + 1] = ans[i] >> 10;
        ans[2 * i] = ans[i] & 1023;
    }
    *returnSize = numsSize;
    return ans;
}`,
        cpp: `vector<int> shuffle(vector<int>& nums, int n) {
    for (int i = 0; i < n; i++) nums[i] |= nums[n + i] << 10;
    for (int i = n - 1; i >= 0; i--) {
        nums[2 * i + 1] = nums[i] >> 10;
        nums[2 * i] = nums[i] & 1023;
    }
    return nums;
}`,
        java: `int[] shuffle(int[] nums, int n) {
    for (int i = 0; i < n; i++) nums[i] |= nums[n + i] << 10;
    for (int i = n - 1; i >= 0; i--) {
        nums[2 * i + 1] = nums[i] >> 10;
        nums[2 * i] = nums[i] & 1023;
    }
    return nums;
}`,
        javascript: `function shuffle(nums, n) {
  for (let i = 0; i < n; i++) nums[i] |= nums[n + i] << 10;
  for (let i = n - 1; i >= 0; i--) {
    nums[2 * i + 1] = nums[i] >> 10;
    nums[2 * i] = nums[i] & 1023;
  }
  return nums;
}`,
      },
    },
  ],
  pitfalls: ['第二半的第 i 個值在 nums[n+i],不是 nums[i+1]。', '位元打包只有在數值小於 1024 時安全。', '原地解包要從後往前,避免覆蓋尚未解出的資料。'],
  check: { kind: 'fn', fn: 'shuffle', cases: [
    { args: [A, N], out: [2, 3, 5, 4, 1, 7] },
    { args: [[1, 2, 3, 4, 4, 3, 2, 1], 4], out: [1, 4, 2, 3, 3, 2, 4, 1] },
    { args: [[1, 1], 1], out: [1, 1] },
  ] },
}
