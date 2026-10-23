import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 80. Remove Duplicates from Sorted Array II

const A = [0, 0, 1, 1, 1, 1, 2, 3, 3]

function ptrFig(): FigStep[] {
  const a = [...A]
  let w = 2
  const out: FigStep[] = [{ note: '每個數最多留 2 個。前 2 個一定留,w 從 2 開始。判斷 nums[i] 能不能留:和 nums[w − 2] 比 —— 如果一樣,代表已經留了兩個同樣的,不能再留', views: [arr([...a], { label: 'nums', done: [0, 1], pointers: [{ name: 'w', index: 2 }] })] }]
  for (let i = 2; i < a.length; i++) {
    if (a[i] !== a[w - 2]) {
      a[w] = a[i]
      out.push({ note: `nums[${i}] = ${a[i]} ≠ nums[w−2] = nums[${w - 2}] = ${a[w - 2]} → 可以留,寫到 nums[${w}]`, views: [arr([...a], { label: 'nums', highlight: [w], compare: [w - 2], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
      w++
    } else {
      out.push({ note: `nums[${i}] = ${a[i]} 和 nums[${w - 2}] 一樣 → 前面已經有兩個 ${a[i]} 了,跳過`, views: [arr([...a], { label: 'nums', dim: [i], compare: [w - 2], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
    }
  }
  out.push({ note: `回傳 k = ${w}:[${a.slice(0, w)}]`, views: [arr(a, { label: 'nums', done: Array.from({ length: w }, (_, k) => k), dim: Array.from({ length: a.length - w }, (_, k) => w + k) })] })
  return out
}

function cntFig(): FigStep[] {
  return [
    { note: '另一種想法:記住「目前這個數已經連續出現幾次」。和前一個一樣就 cnt + 1,不一樣就重設為 1', views: [arr(A, { label: 'nums' }), arr([1, 2, 1, 2, 3, 4, 1, 1, 2], { label: '連續第幾次', dim: [4, 5] })] },
    { note: 'cnt ≤ 2 的才寫進去 → 留下 [0,0,1,1,2,3,3],共 7 個', views: [arr([0, 0, 1, 1, 2, 3, 3], { label: '結果', done: [0, 1, 2, 3, 4, 5, 6] })] },
  ]
}

export const q0080: Solution = {
  id: 80,
  plain: '和 [26](#/q/26) 很像:一排排好的數字,每種數字**最多留兩個**,多的丟掉,留下的擠到前面,告訴我留下了幾個。',
  statement: '給**非遞減排序**的陣列 `nums`,**原地**刪除重複元素,使每個值最多出現**兩次**,保持相對順序。回傳新長度 k,nums 的前 k 個元素為結果。O(1) 額外空間。',
  examples: [
    { input: 'nums = [1,1,1,2,2,3]', output: '5,前 5 個 = [1,1,2,2,3]' },
    { input: 'nums = [0,0,1,1,1,1,2,3,3]', output: '7,前 7 個 = [0,0,1,1,2,3,3]' },
  ],
  constraints: ['n ≤ 3·10⁴', '已排序'],
  insight: ['快慢指標,w 指下一個要寫的位置', '能不能留 nums[i]?看已保留的倒數第 2 個 `nums[w − 2]`:一樣就代表已經有兩個了', '把 2 換成 k 就是「每個值最多留 k 個」的通用模板'],
  approaches: [
    {
      name: '和 nums[w − 2] 比較',
      idea: '`w = 2`;`nums[i] != nums[w − 2]` → `nums[w] = nums[i]`、`w += 1`。',
      steps: ['n ≤ 2 → 回傳 n', '`w = 2`', '`for i in 2..n−1`:`nums[i] != nums[w − 2]` → 寫入、`w += 1`', '回傳 w'],
      figure: { title: `nums = [${A}]`, steps: ptrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最推薦。比的是「已保留的」`nums[w−2]` 而不是原陣列的 `nums[i−2]`(那格可能已經被覆蓋了)。',
      code: {
        python: `def removeDuplicates(nums):
    w = 0
    for x in nums:
        if w < 2 or x != nums[w - 2]:         # 已保留的倒數第二個和 x 不同 → 還能留
            nums[w] = x
            w += 1
    return w`,
        c: `int removeDuplicates(int *nums, int numsSize) {
    int w = 0;
    for (int i = 0; i < numsSize; i++)
        if (w < 2 || nums[i] != nums[w - 2]) nums[w++] = nums[i];
    return w;
}`,
        cpp: `int removeDuplicates(vector<int>& nums) {
    int w = 0;
    for (int x : nums) if (w < 2 || x != nums[w - 2]) nums[w++] = x;
    return w;
}`,
        java: `int removeDuplicates(int[] nums) {
    int w = 0;
    for (int x : nums) if (w < 2 || x != nums[w - 2]) nums[w++] = x;
    return w;
}`,
        javascript: `function removeDuplicates(nums) {
  let w = 0;
  for (const x of nums) if (w < 2 || x !== nums[w - 2]) nums[w++] = x;
  return w;
}`,
      },
    },
    {
      name: '記連續出現次數',
      idea: '`cnt` = 目前這個值連續出現第幾次;`cnt ≤ 2` 才寫入。',
      steps: ['`w = 0`、`cnt = 0`', '每個 i:和前一個一樣 → `cnt += 1`,否則 `cnt = 1`', '`cnt ≤ 2` → `nums[w] = nums[i]`、`w += 1`'],
      figure: { title: `nums = [${A}]`, steps: cntFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '比較直白,但要多維護一個計數器,而且要和**原本的**前一個比(先存起來),不能和已被覆蓋的比。',
      code: {
        python: `def removeDuplicates(nums):
    w, cnt, prev = 0, 0, None
    for x in nums:
        cnt = cnt + 1 if x == prev else 1     # 和原本的前一個比
        prev = x
        if cnt <= 2:
            nums[w] = x
            w += 1
    return w`,
        c: `int removeDuplicates(int *nums, int numsSize) {
    int w = 0, cnt = 0;
    for (int i = 0; i < numsSize; i++) {
        int x = nums[i];
        cnt = (i > 0 && x == nums[i - 1]) ? cnt + 1 : 1;   // nums[i-1] 還沒被覆蓋:w ≤ i
        if (cnt <= 2) nums[w++] = x;
    }
    return w;
}`,
        cpp: `int removeDuplicates(vector<int>& nums) {
    int w = 0, cnt = 0, prev = INT_MIN;
    bool first = true;
    for (int x : nums) {
        cnt = (!first && x == prev) ? cnt + 1 : 1;
        prev = x; first = false;
        if (cnt <= 2) nums[w++] = x;
    }
    return w;
}`,
        java: `int removeDuplicates(int[] nums) {
    int w = 0, cnt = 0;
    Integer prev = null;
    for (int x : nums) {
        cnt = (prev != null && x == prev) ? cnt + 1 : 1;
        prev = x;
        if (cnt <= 2) nums[w++] = x;
    }
    return w;
}`,
        javascript: `function removeDuplicates(nums) {
  let w = 0, cnt = 0, prev;
  for (const x of nums) {
    cnt = x === prev ? cnt + 1 : 1;
    prev = x;
    if (cnt <= 2) nums[w++] = x;
  }
  return w;
}`,
      },
    },
  ],
  pitfalls: ['和 `nums[i − 2]` 比:那一格可能已經被前面的寫入覆蓋,要比已保留的 `nums[w − 2]`', '計數法和「已覆蓋的前一格」比,會數錯'],
  check: {
    kind: 'fn',
    fn: 'removeDuplicates',
    cases: [
      { args: [[1, 1, 1, 2, 2, 3]], out: 5 },
      { args: [A], out: 7 },
      { args: [[1]], out: 1 },
      { args: [[2, 2, 2, 2]], out: 2 },
      { args: [[1, 1, 2, 2, 2, 3, 3, 3, 3]], out: 6 },
    ],
  },
}
