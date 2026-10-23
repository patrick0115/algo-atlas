import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 283. Move Zeroes

const A = [0, 1, 0, 3, 12]

function copyFig(): FigStep[] {
  const nz = A.filter((x) => x !== 0)
  const res = [...nz, ...Array(A.length - nz.length).fill(0)]
  return [
    { note: '先把非 0 的數依序抄到前面:寫入位置 w 從 0 開始,每抄一個 w + 1', views: [arr(A, { label: 'nums', highlight: A.map((x, i) => (x ? i : -1)).filter((i) => i >= 0) }), arr([...nz, ...Array(A.length - nz.length).fill('')], { label: '前面放非 0', done: nz.map((_, i) => i) })] },
    { note: `非 0 的有 ${nz.length} 個,剩下的位置全部補 0`, views: [arr(res, { label: '結果', highlight: res.map((_, i) => (i >= nz.length ? i : -1)).filter((i) => i >= 0) })] },
  ]
}

function swapFig(): FigStep[] {
  const a = [...A]
  let w = 0
  const out: FigStep[] = [{ note: 'w = 下一個非 0 數該放的位置。i 往右掃,遇到非 0 就和 w 交換,w + 1。w 左邊永遠是「已經排好的非 0」,w 到 i 之間全是 0', views: [arr([...a], { label: 'nums', pointers: [{ name: 'w', index: 0 }, { name: 'i', index: 0, color: 'b' }] })] }]
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== 0) {
      ;[a[w], a[i]] = [a[i], a[w]]
      out.push({ note: `nums[${i}] = ${a[w]} 不是 0 → 和 nums[${w}] 交換,w 變 ${w + 1}`, views: [arr([...a], { label: 'nums', highlight: [w, i], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
      w++
    } else {
      out.push({ note: `nums[${i}] 是 0 → 跳過,w 停在 ${w}`, views: [arr([...a], { label: 'nums', dim: [i], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
    }
  }
  return out
}

export const q0283: Solution = {
  id: 283,
  plain: '一排數字裡夾雜著 0,把所有 0 都推到最後面,其他數字的先後順序不能變。就像排隊時把「沒來的空位」都移到隊伍尾巴,有來的人照原本順序往前補。',
  statement: '給整數陣列 `nums`,**原地**把所有 0 移到結尾,非 0 元素保持原本的相對順序。',
  examples: [
    { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' },
    { input: 'nums = [0]', output: '[0]' },
  ],
  constraints: ['n ≤ 10⁴', '原地修改;Follow-up:盡量減少寫入次數'],
  insight: ['非 0 的要「依序往前靠」→ 一個寫入指標 w 記下一個該放的位置', '掃過去遇到非 0 就放到 w', '可以先全部抄完再補 0,或用交換一次完成'],
  approaches: [
    {
      name: '先抄非 0,再補 0',
      idea: '`w = 0`;非 0 的 `nums[w] = x`、`w += 1`;最後 `nums[w:]` 全部設成 0。',
      steps: ['`w = 0`', '`for x in nums`:`x != 0` → `nums[w] = x`、`w += 1`', '`for k in w..n−1`:`nums[k] = 0`'],
      figure: { title: `nums = [${A}]`, steps: copyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '掃兩次,沒有額外陣列。' },
      verdict: '最好想。缺點是 0 很少時,後面補 0 那段仍要寫一遍。',
      code: {
        python: `def moveZeroes(nums):
    w = 0
    for x in nums:
        if x != 0:
            nums[w] = x                       # 非 0 依序往前靠
            w += 1
    for k in range(w, len(nums)):
        nums[k] = 0`,
        c: `void moveZeroes(int *nums, int numsSize) {
    int w = 0;
    for (int i = 0; i < numsSize; i++)
        if (nums[i] != 0) nums[w++] = nums[i];
    while (w < numsSize) nums[w++] = 0;
}`,
        cpp: `void moveZeroes(vector<int>& nums) {
    int w = 0;
    for (int x : nums) if (x != 0) nums[w++] = x;
    while (w < (int)nums.size()) nums[w++] = 0;
}`,
        java: `void moveZeroes(int[] nums) {
    int w = 0;
    for (int x : nums) if (x != 0) nums[w++] = x;
    while (w < nums.length) nums[w++] = 0;
}`,
        javascript: `function moveZeroes(nums) {
  let w = 0;
  for (const x of nums) if (x !== 0) nums[w++] = x;
  while (w < nums.length) nums[w++] = 0;
}`,
      },
    },
    {
      name: '快慢指標交換',
      idea: '`i` 往右掃,`nums[i] != 0` 就和 `nums[w]` 交換、`w += 1`。0 會被一路換到後面。',
      steps: ['`w = 0`', '`for i in 0..n−1`:`nums[i] != 0` → 交換 `nums[w]`、`nums[i]`,`w += 1`'],
      figure: { title: `nums = [${A}]`, steps: swapFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最推薦,一趟完成。[[p:two-pointers]]的「快慢指標」:快的找東西,慢的指著該放的位置。',
      code: {
        python: `def moveZeroes(nums):
    w = 0                                     # 下一個非 0 該放的位置
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[w], nums[i] = nums[i], nums[w]
            w += 1`,
        c: `void moveZeroes(int *nums, int numsSize) {
    for (int i = 0, w = 0; i < numsSize; i++)
        if (nums[i] != 0) {
            int t = nums[w]; nums[w] = nums[i]; nums[i] = t;
            w++;
        }
}`,
        cpp: `void moveZeroes(vector<int>& nums) {
    for (int i = 0, w = 0; i < (int)nums.size(); i++)
        if (nums[i] != 0) swap(nums[w++], nums[i]);
}`,
        java: `void moveZeroes(int[] nums) {
    for (int i = 0, w = 0; i < nums.length; i++)
        if (nums[i] != 0) {
            int t = nums[w]; nums[w] = nums[i]; nums[i] = t;
            w++;
        }
}`,
        javascript: `function moveZeroes(nums) {
  for (let i = 0, w = 0; i < nums.length; i++)
    if (nums[i] !== 0) {
      [nums[w], nums[i]] = [nums[i], nums[w]];
      w++;
    }
}`,
      },
    },
  ],
  pitfalls: ['開一個新陣列再 return:題目要求原地修改,而且沒有回傳值', '用「刪掉 0 再 append 0」:陣列中間刪除是 O(n),總共 O(n²)'],
  check: {
    kind: 'fn',
    fn: 'moveZeroes',
    inplace: 0,
    cases: [
      { args: [A], out: [1, 3, 12, 0, 0] },
      { args: [[0]], out: [0] },
      { args: [[1, 2]], out: [1, 2] },
      { args: [[0, 0, 1]], out: [1, 0, 0] },
      { args: [[4, 0, -2, 0, 5]], out: [4, -2, 5, 0, 0] },
    ],
  },
}
