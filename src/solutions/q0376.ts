import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 7, 4, 9, 2, 5]
const dpFig: FigStep[] = [
  { note: 'up[i] 是以 i 結尾且最後一步上升的最長長度；down[i] 則是最後一步下降。每格至少可單獨成長度 1。', views: [arr(A, { label: 'nums' }), arr([1, 1, 1, 1, 1, 1], { label: '初始 up / down' })] },
  { note: '7 大於先前的 1，所以 up[1] = down[0] + 1 = 2，得到 [1,7]。', views: [arr(A, { label: 'nums', done: [0], highlight: [1] }), arr([1, 2], { label: 'up[0..1]' })] },
  { note: '4 小於先前的 7，因此 down[2] = up[1] + 1 = 3，得到 [1,7,4]。', views: [arr(A, { label: 'nums', done: [0, 1], highlight: [2] }), arr([1, 1, 3], { label: 'down[0..2]' })] },
  { note: '後面 9、2、5 交替上升下降，長度依序變 4、5、6；答案為 6。', views: [arr(A, { label: '最長擺動子序列', done: [0, 1, 2, 3, 4, 5] }), arr([6], { label: '答案', done: [0] })] },
]
const greedyFig: FigStep[] = [
  { note: '只關心相鄰差的正負是否翻轉；第一個 1 先構成長度 1。', views: [arr(A, { label: 'nums', highlight: [0] })] },
  { note: '1→7 是上升，選入 7，長度變 2。', views: [arr(A, { label: 'nums', done: [0, 1] }), arr([2], { label: '長度' })] },
  { note: '7→4 是下降，方向翻轉，選入 4，長度變 3。', views: [arr(A, { label: 'nums', done: [0, 1, 2] }), arr([3], { label: '長度' })] },
  { note: '4→9 上升、9→2 下降、2→5 上升，三次翻轉使答案到 6。', views: [arr(A, { label: 'nums', done: [0, 1, 2, 3, 4, 5] }), arr([6], { label: '答案', done: [0] })] },
]

export const q0376: Solution = {
  id: 376,
  plain: '從陣列挑出最長的一段子序列，讓相鄰差一正一負地交替。',
  statement: '可從 nums 刪掉任意元素但保留相對順序。若留下的相鄰差嚴格正、負交替，稱為擺動序列；回傳最長長度。',
  examples: [
    { input: 'nums = [1,7,4,9,2,5]', output: '6' },
    { input: 'nums = [1,17,5,10,13,15,10,5,16,8]', output: '7' },
    { input: 'nums = [1,2,3,4,5,6,7,8,9]', output: '2' },
  ],
  constraints: ['1 ≤ nums.length ≤ 1000', '0 ≤ nums[i] ≤ 1000'],
  insight: ['相等的兩個數差為 0，不能構成上升或下降。', 'DP 可記錄最後一步上升或下降的最長子序列。', '貪心只保留每段單調走勢的轉折點；在同一上升段中，留下更高的終點不吃虧。'],
  approaches: [
    {
      name: '比較所有先前位置的 DP',
      idea: 'up[i]、down[i] 分別記錄以 i 結尾且最後一步上升、下降的最長長度。',
      steps: ['每個位置的 up、down 初始化為 1', '對每個 i 掃所有 j<i', 'nums[i]>nums[j] 時更新 up[i]；小於時更新 down[i]', '回傳所有狀態的最大值'],
      figure: { title: 'nums = [1,7,4,9,2,5]', steps: dpFig },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個 i 比較所有先前位置 j。' },
      verdict: '容易從「子序列」的定義推導，適合先理解 [[p:dp-1d]] 狀態。',
      code: {
        python: `def wiggleMaxLength(nums):
    n = len(nums)
    up, down = [1] * n, [1] * n
    for i in range(n):
        for j in range(i):
            if nums[i] > nums[j]:
                up[i] = max(up[i], down[j] + 1)  # 下降後接上升
            elif nums[i] < nums[j]:
                down[i] = max(down[i], up[j] + 1)
    return max(max(up), max(down))`,
        c: `int wiggleMaxLength(int *nums, int numsSize) {
    int *up = malloc(numsSize * sizeof(int));
    int *down = malloc(numsSize * sizeof(int));
    int ans = 1;
    for (int i = 0; i < numsSize; i++) {
        up[i] = 1;
        down[i] = 1;
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j] && down[j] + 1 > up[i]) {
                up[i] = down[j] + 1;
            } else if (nums[i] < nums[j] && up[j] + 1 > down[i]) {
                down[i] = up[j] + 1;
            }
        }
        if (up[i] > ans) {
            ans = up[i];
        }
        if (down[i] > ans) {
            ans = down[i];
        }
    }
    free(up);
    free(down);
    return ans;
}`,
        cpp: `int wiggleMaxLength(vector<int>& nums) {
    int n = nums.size();
    vector<int> up(n, 1);
    vector<int> down(n, 1);
    int ans = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                up[i] = max(up[i], down[j] + 1);
            } else if (nums[i] < nums[j]) {
                down[i] = max(down[i], up[j] + 1);
            }
        }
        ans = max(ans, max(up[i], down[i]));
    }
    return ans;
}`,
        java: `int wiggleMaxLength(int[] nums) {
    int n = nums.length;
    int[] up = new int[n];
    int[] down = new int[n];
    int ans = 1;
    Arrays.fill(up, 1);
    Arrays.fill(down, 1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                up[i] = Math.max(up[i], down[j] + 1);
            } else if (nums[i] < nums[j]) {
                down[i] = Math.max(down[i], up[j] + 1);
            }
        }
        ans = Math.max(ans, Math.max(up[i], down[i]));
    }
    return ans;
}`,
        javascript: `function wiggleMaxLength(nums) {
  const n = nums.length;
  const up = Array(n).fill(1);
  const down = Array(n).fill(1);
  let ans = 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        up[i] = Math.max(up[i], down[j] + 1);
      } else if (nums[i] < nums[j]) {
        down[i] = Math.max(down[i], up[j] + 1);
      }
    }
    ans = Math.max(ans, up[i], down[i]);
  }
  return ans;
}`,
      },
    },
    {
      name: '貪心保留轉折',
      idea: '若相鄰差與上一個非零差方向不同，就發現新的轉折，答案加 1。',
      steps: ['答案初始化為 1，上一個差記為 0', '依序計算 nums[i]−nums[i−1]', '由非正轉正或非負轉負時，答案加 1', '更新上一個差並回傳答案'],
      figure: { title: 'nums = [1,7,4,9,2,5]', steps: greedyFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只掃一遍，保留上一次差值。' },
      verdict: '推薦實際使用；同方向的中間點可省去，對應 [[p:greedy]]。',
      code: {
        python: `def wiggleMaxLength(nums):
    ans, previous = 1, 0
    for i in range(1, len(nums)):
        diff = nums[i] - nums[i - 1]
        if (diff > 0 and previous <= 0) or (diff < 0 and previous >= 0):
            ans += 1                      # 新的上升或下降轉折
            previous = diff
    return ans`,
        c: `int wiggleMaxLength(int *nums, int numsSize) {
    int ans = 1;
    int previous = 0;
    for (int i = 1; i < numsSize; i++) {
        int diff = nums[i] - nums[i - 1];
        if ((diff > 0 && previous <= 0) || (diff < 0 && previous >= 0)) {
            ans++;
            previous = diff;
        }
    }
    return ans;
}`,
        cpp: `int wiggleMaxLength(vector<int>& nums) {
    int ans = 1;
    int previous = 0;
    for (int i = 1; i < (int)nums.size(); i++) {
        int diff = nums[i] - nums[i - 1];
        if ((diff > 0 && previous <= 0) || (diff < 0 && previous >= 0)) {
            ans++;
            previous = diff;
        }
    }
    return ans;
}`,
        java: `int wiggleMaxLength(int[] nums) {
    int ans = 1;
    int previous = 0;
    for (int i = 1; i < nums.length; i++) {
        int diff = nums[i] - nums[i - 1];
        if ((diff > 0 && previous <= 0) || (diff < 0 && previous >= 0)) {
            ans++;
            previous = diff;
        }
    }
    return ans;
}`,
        javascript: `function wiggleMaxLength(nums) {
  let ans = 1;
  let previous = 0;
  for (let i = 1; i < nums.length; i++) {
    const diff = nums[i] - nums[i - 1];
    if ((diff > 0 && previous <= 0) || (diff < 0 && previous >= 0)) {
      ans++;
      previous = diff;
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['差值 0 不是正也不是負，不能增加長度。', '子序列可以跳過元素，不能只算連續擺動片段。', '全相等陣列的答案是 1。'],
  check: { kind: 'fn', fn: 'wiggleMaxLength', cases: [
    { args: [A], out: 6 },
    { args: [[1, 17, 5, 10, 13, 15, 10, 5, 16, 8]], out: 7 },
    { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9]], out: 2 },
    { args: [[4, 4, 4]], out: 1 },
    { args: [[1]], out: 1 },
  ] },
}
