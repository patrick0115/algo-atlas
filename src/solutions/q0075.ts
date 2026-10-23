import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 75. Sort Colors

const A = [2, 0, 2, 1, 1, 0]

function flagFig(): FigStep[] {
  const a = [...A]
  let lo = 0
  let i = 0
  let hi = a.length - 1
  const out: FigStep[] = [{ note: '荷蘭國旗演算法:三個指標把陣列分成四區 —— [0, lo) 都是 0、[lo, i) 都是 1、(hi, 末端] 都是 2、[i, hi] 還沒看', views: [arr([...a], { label: 'nums', pointers: [{ name: 'lo', index: lo }, { name: 'i', index: i, color: 'b' }, { name: 'hi', index: hi, color: 'c' }] })] }]
  while (i <= hi) {
    let note: string
    if (a[i] === 0) {
      ;[a[lo], a[i]] = [a[i], a[lo]]
      note = `nums[i] = 0 → 和 lo 交換,lo、i 都前進`
      lo++
      i++
    } else if (a[i] === 2) {
      ;[a[hi], a[i]] = [a[i], a[hi]]
      note = `nums[i] = 2 → 和 hi 交換,hi 後退(i 不動:換過來的還沒看過)`
      hi--
    } else {
      note = 'nums[i] = 1 → 留在原地,i 前進'
      i++
    }
    out.push({ note, views: [arr([...a], { label: 'nums', done: Array.from({ length: lo }, (_, k) => k), pointers: [{ name: 'lo', index: Math.min(lo, a.length - 1) }, { name: 'i', index: Math.min(i, a.length - 1), color: 'b' }, { name: 'hi', index: Math.max(hi, 0), color: 'c' }] })] })
  }
  return out
}

function cntFig(): FigStep[] {
  return [
    { note: '兩趟作法:第一趟數 0、1、2 各有幾個', views: [arr(A, { label: 'nums' }), arr([2, 2, 2], { label: '0 / 1 / 2 的個數' })] },
    { note: '第二趟依序寫回:先寫 2 個 0、再 2 個 1、再 2 個 2', views: [arr([0, 0, 1, 1, 2, 2], { label: '結果', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

export const q0075: Solution = {
  id: 75,
  plain: '一排只有 0、1、2 三種數字(代表紅、白、藍三種顏色),原地把它們排成「全部的 0、再全部的 1、再全部的 2」。不能用內建的排序。',
  statement: '給只含 0、1、2 的陣列 `nums`,**原地**排序使相同顏色相鄰,且依 0、1、2 的順序排列。不使用函式庫的排序。Follow-up:只掃一趟、O(1) 額外空間。',
  examples: [
    { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' },
    { input: 'nums = [2,0,1]', output: '[0,1,2]' },
  ],
  constraints: ['n ≤ 300'],
  insight: ['只有三種值 → 數完個數再寫回(計數排序),兩趟', '一趟:三個指標,0 丟到左邊、2 丟到右邊、1 留在中間', '和 2 交換時 i 不能前進:換過來的數還沒檢查過'],
  approaches: [
    {
      name: '荷蘭國旗(三指標,一趟)',
      idea: '`lo`、`i`、`hi`;0 → 和 lo 交換、兩個都前進;2 → 和 hi 交換、hi 後退;1 → i 前進。',
      steps: ['`lo = i = 0`、`hi = n − 1`', '`while i <= hi`:', '`nums[i] == 0` → 交換 lo、i,`lo += 1`、`i += 1`', '`nums[i] == 2` → 交換 hi、i,`hi -= 1`;否則 `i += 1`'],
      figure: { title: `nums = [${A}]`, steps: flagFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每一步 i 前進或 hi 後退,總共 n 步。' },
      verdict: '最推薦(Follow-up 的答案)。[[p:two-pointers]]的三分區技巧,快速排序的三路切分也是同一招。',
      code: {
        python: `def sortColors(nums):
    lo, i, hi = 0, 0, len(nums) - 1
    while i <= hi:
        if nums[i] == 0:
            nums[lo], nums[i] = nums[i], nums[lo]
            lo += 1
            i += 1
        elif nums[i] == 2:
            nums[hi], nums[i] = nums[i], nums[hi]
            hi -= 1                           # i 不動:換過來的數還沒看
        else:
            i += 1`,
        c: `void sortColors(int *nums, int numsSize) {
    int lo = 0, i = 0, hi = numsSize - 1;
    while (i <= hi) {
        if (nums[i] == 0) { int t = nums[lo]; nums[lo++] = nums[i]; nums[i++] = t; }
        else if (nums[i] == 2) { int t = nums[hi]; nums[hi--] = nums[i]; nums[i] = t; }
        else i++;
    }
}`,
        cpp: `void sortColors(vector<int>& nums) {
    int lo = 0, i = 0, hi = nums.size() - 1;
    while (i <= hi) {
        if (nums[i] == 0) swap(nums[lo++], nums[i++]);
        else if (nums[i] == 2) swap(nums[hi--], nums[i]);
        else i++;
    }
}`,
        java: `void sortColors(int[] nums) {
    int lo = 0, i = 0, hi = nums.length - 1;
    while (i <= hi) {
        if (nums[i] == 0) { int t = nums[lo]; nums[lo++] = nums[i]; nums[i++] = t; }
        else if (nums[i] == 2) { int t = nums[hi]; nums[hi--] = nums[i]; nums[i] = t; }
        else i++;
    }
}`,
        javascript: `function sortColors(nums) {
  let lo = 0, i = 0, hi = nums.length - 1;
  while (i <= hi) {
    if (nums[i] === 0) {
      [nums[lo], nums[i]] = [nums[i], nums[lo]];
      lo++;
      i++;
    } else if (nums[i] === 2) {
      [nums[hi], nums[i]] = [nums[i], nums[hi]];
      hi--;
    } else i++;
  }
}`,
      },
    },
    {
      name: '計數後寫回(兩趟)',
      idea: '數出 0、1、2 的個數,再依序覆寫陣列。',
      steps: ['`cnt = [0, 0, 0]`;掃一遍計數', '`k = 0`;`for v in 0..2`:寫 `cnt[v]` 個 v'],
      figure: { title: `nums = [${A}]`, steps: cntFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩趟掃描,只用 3 個計數器。' },
      verdict: '最好懂,只是要掃兩趟。值的種類少時,計數排序都比比較排序快。',
      code: {
        python: `def sortColors(nums):
    cnt = [0, 0, 0]
    for x in nums:
        cnt[x] += 1
    k = 0
    for v in range(3):
        for _ in range(cnt[v]):
            nums[k] = v
            k += 1`,
        c: `void sortColors(int *nums, int numsSize) {
    int cnt[3] = {0}, k = 0;
    for (int i = 0; i < numsSize; i++) cnt[nums[i]]++;
    for (int v = 0; v < 3; v++) while (cnt[v]--) nums[k++] = v;
}`,
        cpp: `void sortColors(vector<int>& nums) {
    int cnt[3] = {0}, k = 0;
    for (int x : nums) cnt[x]++;
    for (int v = 0; v < 3; v++) while (cnt[v]--) nums[k++] = v;
}`,
        java: `void sortColors(int[] nums) {
    int[] cnt = new int[3];
    for (int x : nums) cnt[x]++;
    int k = 0;
    for (int v = 0; v < 3; v++) while (cnt[v]-- > 0) nums[k++] = v;
}`,
        javascript: `function sortColors(nums) {
  const cnt = [0, 0, 0];
  for (const x of nums) cnt[x]++;
  let k = 0;
  for (let v = 0; v < 3; v++) while (cnt[v]-- > 0) nums[k++] = v;
}`,
      },
    },
  ],
  pitfalls: ['和 hi 交換之後 i 也前進:換過來的可能是 0,沒有被處理到', '迴圈條件寫 `i < hi`:最後一格會漏掉'],
  check: {
    kind: 'fn',
    fn: 'sortColors',
    inplace: 0,
    cases: [
      { args: [A], out: [0, 0, 1, 1, 2, 2] },
      { args: [[2, 0, 1]], out: [0, 1, 2] },
      { args: [[0]], out: [0] },
      { args: [[2, 2, 0, 0]], out: [0, 0, 2, 2] },
      { args: [[1, 2, 0, 1, 2, 0, 1]], out: [0, 0, 1, 1, 1, 2, 2] },
    ],
  },
}
