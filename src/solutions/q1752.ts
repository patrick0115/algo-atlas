import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [3, 4, 5, 1, 2]
const dropFig: FigStep[] = [
  { note: '非遞減陣列經旋轉後，沿著環走一圈最多只會出現一次下降。', views: [arr(A, { label: 'nums' })] },
  { note: '3≤4、4≤5 都沒有下降；5>1 是第一個下降處。', views: [arr(A, { label: 'nums', done: [0, 1], compare: [2, 3] }), arr([1], { label: '下降次數' })] },
  { note: '1≤2 沒下降；環的最後一對是 2 與 3，也沒有下降。', views: [arr(A, { label: 'nums', compare: [0, 4] }), arr([1], { label: '下降次數' })] },
  { note: '整圈只有一處下降，從 1 開始讀就是 [1,2,3,4,5]，回傳 true。', views: [arr([1, 2, 3, 4, 5], { label: '還原排序後', done: [0, 1, 2, 3, 4] })] },
]
const tryFig: FigStep[] = [
  { note: '直接嘗試每個起點；若從某起點開始讀一圈是非遞減的，就可視為排序陣列的旋轉。', views: [arr(A, { label: 'nums' })] },
  { note: '從索引 0 開始是 [3,4,5,1,2]，5>1，失敗。', views: [arr(A, { label: '起點 0', compare: [2, 3] })] },
  { note: '從索引 1 或 2 開始仍會跨過 5>1；這些起點都失敗。', views: [arr([4, 5, 1, 2, 3], { label: '起點 1', compare: [1, 2] })] },
  { note: '從索引 3 開始讀成 [1,2,3,4,5]，每一對都非遞減，回傳 true。', views: [arr([1, 2, 3, 4, 5], { label: '起點 3', done: [0, 1, 2, 3, 4] })] },
]

export const q1752: Solution = {
  id: 1752,
  plain: '判斷陣列能否由一個非遞減陣列旋轉得到。',
  statement: '給定 nums，原本的陣列允許重複值，先按非遞減排序，再把前面一段搬到尾端。若 nums 可由某次旋轉得到，回傳 true。',
  examples: [
    { input: 'nums = [3,4,5,1,2]', output: 'true' },
    { input: 'nums = [2,1,3,4]', output: 'false' },
    { input: 'nums = [1,2,3]', output: 'true' },
  ],
  constraints: ['1 ≤ nums.length ≤ 100', '1 ≤ nums[i] ≤ 100'],
  insight: ['排序後旋轉最多形成一個下降處，也可能完全沒有下降。', '最後一格與第一格也相鄰，這一對必須計入。', '允許相等，所以只把嚴格大於算作下降。'],
  approaches: [
    {
      name: '計算環上的下降次數',
      idea: '數出 nums[i] > nums[(i+1)%n] 的位置；若最多一個，就能找到非遞減起點。',
      steps: ['令 drops=0', '比較每個位置與下一個位置，最後一格和第一格也比', '嚴格下降時 drops 加 1', '回傳 drops≤1'],
      figure: { title: 'nums = [3,4,5,1,2]', steps: dropFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '沿陣列看一圈即可。' },
      verdict: '最簡潔的 [[p:simulation]] 解法。',
      code: {
        python: `def check(nums):
    if not nums:
        return True
    drops = 0
    for i in range(len(nums)):
        if nums[i] > nums[(i + 1) % len(nums)]:
            drops += 1                  # 包含最後到第一格
    return drops <= 1`,
        c: `bool check(int *nums, int numsSize) {
    if (numsSize == 0) {
        return true;
    }
    int drops = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > nums[(i + 1) % numsSize]) {
            drops++;
        }
    }
    return drops <= 1;
}`,
        cpp: `bool check(vector<int>& nums) {
    if (nums.empty()) {
        return true;
    }
    int drops = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] > nums[(i + 1) % nums.size()]) {
            drops++;
        }
    }
    return drops <= 1;
}`,
        java: `boolean check(int[] nums) {
    if (nums.length == 0) {
        return true;
    }
    int drops = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] > nums[(i + 1) % nums.length]) {
            drops++;
        }
    }
    return drops <= 1;
}`,
        javascript: `function check(nums) {
  if (nums.length === 0) {
    return true;
  }
  let drops = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > nums[(i + 1) % nums.length]) {
      drops++;
    }
  }
  return drops <= 1;
}`,
      },
    },
    {
      name: '逐一嘗試旋轉起點',
      idea: '把每個索引當作非遞減序列的開頭，沿環檢查整列是否排序。',
      steps: ['枚舉每個起點 start', '按 start、start+1… 的環狀順序讀完整列', '若所有相鄰對都非遞減，立即回傳 true', '所有起點均失敗才回傳 false'],
      figure: { title: 'nums = [3,4,5,1,2]', steps: tryFig },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最多 n 個起點，每個起點檢查 n 格。' },
      verdict: '直接模擬定義，適合對照線性做法為何只需數下降。',
      code: {
        python: `def check(nums):
    n = len(nums)
    for start in range(n):
        valid = True
        for step in range(1, n):
            left = nums[(start + step - 1) % n]
            right = nums[(start + step) % n]
            if left > right:
                valid = False           # 此起點無法形成排序
                break
        if valid:
            return True
    return n == 0`,
        c: `bool check(int *nums, int numsSize) {
    for (int start = 0; start < numsSize; start++) {
        bool valid = true;
        for (int step = 1; step < numsSize; step++) {
            int left = nums[(start + step - 1) % numsSize];
            int right = nums[(start + step) % numsSize];
            if (left > right) {
                valid = false;
                break;
            }
        }
        if (valid) {
            return true;
        }
    }
    return numsSize == 0;
}`,
        cpp: `bool check(vector<int>& nums) {
    int n = nums.size();
    for (int start = 0; start < n; start++) {
        bool valid = true;
        for (int step = 1; step < n; step++) {
            if (nums[(start + step - 1) % n] > nums[(start + step) % n]) {
                valid = false;
                break;
            }
        }
        if (valid) {
            return true;
        }
    }
    return n == 0;
}`,
        java: `boolean check(int[] nums) {
    int n = nums.length;
    for (int start = 0; start < n; start++) {
        boolean valid = true;
        for (int step = 1; step < n; step++) {
            if (nums[(start + step - 1) % n] > nums[(start + step) % n]) {
                valid = false;
                break;
            }
        }
        if (valid) {
            return true;
        }
    }
    return n == 0;
}`,
        javascript: `function check(nums) {
  const n = nums.length;
  for (let start = 0; start < n; start++) {
    let valid = true;
    for (let step = 1; step < n; step++) {
      if (nums[(start + step - 1) % n] > nums[(start + step) % n]) {
        valid = false;
        break;
      }
    }
    if (valid) {
      return true;
    }
  }
  return n === 0;
}`,
      },
    },
  ],
  pitfalls: ['最後一格到第一格也要比較。', '相等元素合法，不能當下降。', '完全已排序的陣列也是旋轉 0 次。'],
  check: { kind: 'fn', fn: 'check', cases: [
    { args: [A], out: true },
    { args: [[2, 1, 3, 4]], out: false },
    { args: [[1, 2, 3]], out: true },
    { args: [[1, 1, 1]], out: true },
    { args: [[]], out: true },
  ] },
}
