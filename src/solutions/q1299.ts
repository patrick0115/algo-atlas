import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1299. Replace Elements with Greatest Element on Right Side
const A = [17, 18, 5, 4, 6, 1]
const reverseFig: FigStep[] = [
  { note: '每個位置要換成它右邊所有數的最大值。從右往左走,隨時保存已看過的最大值。', views: [arr(A, { label: '原陣列' }), arr([18, 6, 6, 6, 1, -1], { label: '答案' })] },
  { note: '最後一格右邊沒有數,填 -1;往左走時,先寫右側最大值,再把原數納入最大值。', views: [arr([17, 18, 5, 4, 6, 1], { label: '原值' }), arr([18, 6, 6, 6, 1, -1], { label: '右側最大值', done: [5] })] },
]
const suffixFig: FigStep[] = [
  { note: '也能先建立 suffix[i]:從索引 i 起的最大值,多放一格 suffix[n] = -1。', views: [arr([18, 18, 6, 6, 6, 1, -1], { label: 'suffix' })] },
  { note: '位置 i 的答案直接讀 suffix[i+1],因為它剛好從右邊下一格開始。', views: [arr([18, 6, 6, 6, 1, -1], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
]

export const q1299: Solution = {
  id: 1299,
  plain: '陣列裡每個數都要改成「它右邊最大的數」。最後一個數右邊什麼都沒有,改成 -1。',
  statement: '給整數陣列 arr,把每個位置的值換成原陣列中它右邊所有元素的最大值;最後一格換成 -1,回傳結果。',
  examples: [
    { input: 'arr = [17,18,5,4,6,1]', output: '[18,6,6,6,1,-1]' },
    { input: 'arr = [400]', output: '[-1]' },
  ],
  constraints: ['陣列至少 1 個元素', '題目中的原值為正整數'],
  insight: ['答案依賴右邊,所以倒著掃比每格往右重找更快。', '從右往左維持目前見過的最大值 maxRight。', '要先把 maxRight 寫到答案,再用當前原值更新它,避免把自己算進右邊。'],
  approaches: [
    {
      name: '由右往左更新最大值',
      idea: 'maxRight 記錄原陣列中當前位置右邊的最大值,每個位置可立刻得出答案。',
      steps: ['複製 arr,maxRight = -1', '從最後一格往前:先保存原值', '把目前格設為 maxRight,再更新 maxRight = max(maxRight,原值)', '回傳修改後陣列'],
      figure: { title: 'arr = [17,18,5,4,6,1]', steps: reverseFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '掃一次;複製輸入作為輸出。若允許修改原陣列則額外空間 O(1)。' },
      verdict: '推薦,只需保存一個右側最大值。',
      code: {
        python: `def replaceElements(arr):
    ans = arr[:]
    max_right = -1
    for i in range(len(ans) - 1, -1, -1):
        old = ans[i]
        ans[i] = max_right
        max_right = max(max_right, old)
    return ans`,
        c: `int *replaceElements(int *arr, int arrSize, int *returnSize) {
    int *ans = malloc(arrSize * sizeof(int));
    int maxRight = -1;
    for (int i = arrSize - 1; i >= 0; i--) {
        ans[i] = maxRight;
        if (arr[i] > maxRight) maxRight = arr[i];
    }
    *returnSize = arrSize;
    return ans;
}`,
        cpp: `vector<int> replaceElements(vector<int>& arr) {
    vector<int> ans(arr.size());
    int maxRight = -1;
    for (int i = arr.size() - 1; i >= 0; i--) {
        ans[i] = maxRight;
        maxRight = max(maxRight, arr[i]);
    }
    return ans;
}`,
        java: `int[] replaceElements(int[] arr) {
    int[] ans = new int[arr.length];
    int maxRight = -1;
    for (int i = arr.length - 1; i >= 0; i--) {
        ans[i] = maxRight;
        maxRight = Math.max(maxRight, arr[i]);
    }
    return ans;
}`,
        javascript: `function replaceElements(arr) {
  const ans = [...arr];
  let maxRight = -1;
  for (let i = ans.length - 1; i >= 0; i--) {
    const old = ans[i];
    ans[i] = maxRight;
    maxRight = Math.max(maxRight, old);
  }
  return ans;
}`,
      },
    },
    {
      name: '後綴最大值表',
      idea: '先求每個位置起往右的最大值,再讓答案讀下一格的後綴最大值。',
      steps: ['suffix[n] = -1', 'i 從 n−1 到 0:suffix[i] = max(arr[i],suffix[i+1])', 'ans[i] = suffix[i+1]', '回傳 ans'],
      figure: { title: '後綴最大值', steps: suffixFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '後綴表與輸出陣列各掃一次。' },
      verdict: '表格較容易理解,也能延伸到很多後綴查詢題。',
      code: {
        python: `def replaceElements(arr):
    n = len(arr)
    suffix = [-1] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = max(arr[i], suffix[i + 1])
    return suffix[1:]`,
        c: `int *replaceElements(int *arr, int arrSize, int *returnSize) {
    int *suffix = malloc((arrSize + 1) * sizeof(int));
    int *ans = malloc(arrSize * sizeof(int));
    suffix[arrSize] = -1;
    for (int i = arrSize - 1; i >= 0; i--)
        suffix[i] = arr[i] > suffix[i + 1] ? arr[i] : suffix[i + 1];
    for (int i = 0; i < arrSize; i++) ans[i] = suffix[i + 1];
    free(suffix);
    *returnSize = arrSize;
    return ans;
}`,
        cpp: `vector<int> replaceElements(vector<int>& arr) {
    int n = arr.size();
    vector<int> suffix(n + 1, -1), ans(n);
    for (int i = n - 1; i >= 0; i--) suffix[i] = max(arr[i], suffix[i + 1]);
    for (int i = 0; i < n; i++) ans[i] = suffix[i + 1];
    return ans;
}`,
        java: `int[] replaceElements(int[] arr) {
    int n = arr.length;
    int[] suffix = new int[n + 1], ans = new int[n];
    suffix[n] = -1;
    for (int i = n - 1; i >= 0; i--) suffix[i] = Math.max(arr[i], suffix[i + 1]);
    for (int i = 0; i < n; i++) ans[i] = suffix[i + 1];
    return ans;
}`,
        javascript: `function replaceElements(arr) {
  const n = arr.length, suffix = Array(n + 1).fill(-1);
  for (let i = n - 1; i >= 0; i--) suffix[i] = Math.max(arr[i], suffix[i + 1]);
  return suffix.slice(1);
}`,
      },
    },
  ],
  pitfalls: ['右側最大值不包含目前的數;要先寫答案再更新最大值。', '最後一格固定是 -1。', '若每個位置都重新掃描右側,會變成 O(n²)。'],
  check: { kind: 'fn', fn: 'replaceElements', cases: [
    { args: [A], out: [18, 6, 6, 6, 1, -1] },
    { args: [[400]], out: [-1] },
    { args: [[1, 2, 3]], out: [3, 3, -1] },
  ] },
}
