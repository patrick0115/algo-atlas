import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 88. Merge Sorted Array

const N1 = [1, 2, 3, 0, 0, 0]
const M = 3
const N2 = [2, 5, 6]
const N = 3

function backFig(): FigStep[] {
  const a = [...N1]
  let i = M - 1
  let j = N - 1
  const out: FigStep[] = [{ note: 'nums1 後面有 n 個空位。從**後面**往前填:每次把兩邊最大的那個放到 nums1 的最後一個空位。從後面填不會蓋到還沒處理的數', views: [arr(a, { label: 'nums1', pointers: [{ name: 'i', index: i }, { name: 'k', index: M + N - 1, color: 'b' }] }), arr(N2, { label: 'nums2', pointers: [{ name: 'j', index: j, color: 'c' }] })] }]
  for (let k = M + N - 1; j >= 0; k--) {
    let note: string
    if (i >= 0 && a[i] > N2[j]) {
      note = `nums1[${i}] = ${a[i]} > nums2[${j}] = ${N2[j]} → 放 ${a[i]} 到位置 ${k}`
      a[k] = a[i--]
    } else {
      note = `nums2[${j}] = ${N2[j]} ≥ ${i >= 0 ? `nums1[${i}] = ${a[i]}` : '(nums1 已經用完)'} → 放 ${N2[j]} 到位置 ${k}`
      a[k] = N2[j--]
    }
    out.push({ note, views: [arr([...a], { label: 'nums1', highlight: [k], done: Array.from({ length: M + N - 1 - k }, (_, t) => M + N - 1 - t) }), arr(N2, { label: 'nums2', dim: Array.from({ length: N - 1 - j }, (_, t) => N - 1 - t) })] })
  }
  out.push({ note: 'nums2 用完就結束(nums1 剩下的本來就在正確位置)', views: [arr(a, { label: 'nums1', done: a.map((_, t) => t) })] })
  return out
}

function sortFig(): FigStep[] {
  return [
    { note: '偷懶版:把 nums2 抄進 nums1 後面的空位', views: [arr([1, 2, 3, 2, 5, 6], { label: 'nums1', highlight: [3, 4, 5] })] },
    { note: '整個排序。O((m+n) log(m+n)),沒有用到「兩邊都已排序」', views: [arr([1, 2, 2, 3, 5, 6], { label: '排序後', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

export const q0088: Solution = {
  id: 88,
  plain: '兩排排好序的數字,要合併成一排(也排好序),而且結果要放在第一排裡。第一排的後面預留了足夠的空位。',
  statement: '給兩個非遞減排序的陣列 `nums1`(長度 m + n,前 m 個是有效元素,後 n 個是 0)和 `nums2`(長度 n),把 nums2 合併進 nums1,使 nums1 成為一個排序好的陣列。**原地**修改,不回傳。',
  examples: [
    { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]' },
    { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', output: '[1]' },
    { input: 'nums1 = [0], m = 0, nums2 = [1], n = 1', output: '[1]' },
  ],
  constraints: ['m + n ≤ 200', 'Follow-up:O(m + n)'],
  insight: ['從前面合併會蓋到 nums1 還沒處理的數', '空位在後面 → **從後面往前填**,每次放兩邊最大的', 'nums2 用完就可以停;nums1 剩下的已經在正確位置'],
  approaches: [
    {
      name: '三指標從後往前',
      idea: '`i = m − 1`、`j = n − 1`、`k = m + n − 1`;比較 nums1[i] 和 nums2[j],大的放到 nums1[k]。',
      steps: ['`i, j, k = m − 1, n − 1, m + n − 1`', '`while j >= 0`:', '`i >= 0 and nums1[i] > nums2[j]` → `nums1[k] = nums1[i]`、`i -= 1`', '否則 `nums1[k] = nums2[j]`、`j -= 1`;`k -= 1`'],
      figure: { title: `nums1 = [${N1}],nums2 = [${N2}]`, steps: backFig() },
      complexity: { time: 'O(m + n)', space: 'O(1)', why: '每個元素放一次。' },
      verdict: '最推薦(Follow-up 的答案)。「從後面填」讓原地合併變得不需要額外空間。',
      code: {
        python: `def merge(nums1, m, nums2, n):
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:                             # nums2 用完就結束
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1`,
        c: `void merge(int *nums1, int nums1Size, int m, int *nums2, int nums2Size, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
        else nums1[k--] = nums2[j--];
    }
}`,
        cpp: `void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
        else nums1[k--] = nums2[j--];
    }
}`,
        java: `void merge(int[] nums1, int m, int[] nums2, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
        else nums1[k--] = nums2[j--];
    }
}`,
        javascript: `function merge(nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
    else nums1[k--] = nums2[j--];
  }
}`,
      },
    },
    {
      name: '抄過去再排序',
      idea: '`nums1[m:] = nums2`,然後排序。',
      steps: ['把 nums2 放進 nums1 的後 n 格', '`nums1.sort()`'],
      figure: { title: `nums1 = [${N1}],nums2 = [${N2}]`, steps: sortFig() },
      complexity: { time: 'O((m + n) log(m + n))', space: 'O(1) ~ O(m + n)', why: '排序的成本。' },
      verdict: '一行寫完,但浪費了「已經排好」的資訊。',
      code: {
        python: `def merge(nums1, m, nums2, n):
    nums1[m:] = nums2
    nums1.sort()`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

void merge(int *nums1, int nums1Size, int m, int *nums2, int nums2Size, int n) {
    for (int j = 0; j < n; j++) nums1[m + j] = nums2[j];
    qsort(nums1, m + n, sizeof(int), cmp);
}`,
        cpp: `void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    copy(nums2.begin(), nums2.end(), nums1.begin() + m);
    sort(nums1.begin(), nums1.end());
}`,
        java: `void merge(int[] nums1, int m, int[] nums2, int n) {
    System.arraycopy(nums2, 0, nums1, m, n);
    Arrays.sort(nums1);
}`,
        javascript: `function merge(nums1, m, nums2, n) {
  for (let j = 0; j < n; j++) nums1[m + j] = nums2[j];
  nums1.sort((a, b) => a - b);
}`,
      },
    },
  ],
  pitfalls: ['從前面開始合併:會蓋掉 nums1 還沒比較的數', '迴圈條件寫成 `i >= 0 and j >= 0`:nums1 先用完時,nums2 剩下的會沒放進去', 'JavaScript 的 sort 沒給比較函式會依字串排序'],
  check: {
    kind: 'fn',
    fn: 'merge',
    inplace: 0,
    cases: [
      { args: [N1, M, N2, N], out: [1, 2, 2, 3, 5, 6] },
      { args: [[1], 1, [], 0], out: [1] },
      { args: [[0], 0, [1], 1], out: [1] },
      { args: [[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3], out: [1, 2, 3, 4, 5, 6] },
      { args: [[-1, 0, 0, 0], 1, [-3, -2, 5], 3], out: [-3, -2, -1, 5] },
    ],
  },
}
