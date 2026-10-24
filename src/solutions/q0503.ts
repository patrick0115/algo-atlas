import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 2, 1]

function bruteFig(): FigStep[] {
  return [
    { note: '從索引 0 的 1 往右看，立刻遇到 2，比 1 大，所以答案[0]=2。', views: [arr(A, { label: 'nums', highlight: [0], compare: [1] })] },
    { note: '索引 1 是 2；繞過結尾回到開頭，1、1 都不比 2 大，答案[1]=-1。', views: [arr(A, { label: '繞一圈', highlight: [1], dim: [0, 2] })] },
    { note: '索引 2 的 1 往右繞回索引 0 的 1，仍不夠大。', views: [arr(A, { label: 'nums', highlight: [2], compare: [0] })] },
    { note: '再走到索引 1 的 2，比 1 大，答案[2]=2；最後得到 [2,-1,2]。', views: [arr([2, -1, 2], { label: '答案', done: [0, 1, 2] })] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '答案先填 -1；堆疊存「還沒找到下一個更大值」的索引。第一輪放入索引 0，值是 1。', views: [arr(A, { label: 'nums', highlight: [0] }), arr([0], { label: '待解索引' })] },
    { note: '看到 2，比堆疊頂端索引 0 的 1 大，寫答案[0]=2，再把索引 1 放進堆疊。', views: [arr([2, -1, -1], { label: '答案', done: [0] }), arr([1], { label: '待解索引' })] },
    { note: '索引 2 的 1 不比 2 大，放入堆疊。第一輪結束時還欠索引 1、2。', views: [arr(A, { label: 'nums', highlight: [2] }), arr([1, 2], { label: '待解索引' })] },
    { note: '第二輪繞回開頭，看到索引 1 的 2 時，補出答案[2]=2；索引 1 的 2 沒有更大值，保持 -1。', views: [arr([2, -1, 2], { label: '答案', done: [0, 1, 2] })] },
  ]
}

export const q0503: Solution = {
  id: 503,
  plain: '每個數都往右找第一個比自己大的數；走到尾巴還可以從開頭接著找。',
  statement: '給循環陣列 nums，對每個位置回傳往右走時第一個嚴格更大的值；繞完整圈仍找不到就填 −1。',
  examples: [{ input: 'nums = [1,2,1]', output: '[2,-1,2]' }, { input: 'nums = [1,2,3,4,3]', output: '[2,3,4,-1,4]' }],
  constraints: ['`1 ≤ nums.length ≤ 10⁴`', '`−10⁹ ≤ nums[i] ≤ 10⁹`'],
  insight: ['取模 `j % n` 可把索引繞回開頭；每個位置最多往前看 n−1 個位置。', '用 [[p:monotonic-stack]] 記尚未找到更大值的索引；新數一出現，就能一次回答所有比它小的堆疊頂端。'],
  approaches: [
    {
      name: '每個位置向右找一圈',
      idea: '從 i+1 到 i+n−1 逐一檢查，第一個大於 nums[i] 的值就是答案。',
      steps: ['把答案全部設為 −1。', '每個 i 向右最多試 n−1 次，用 % n 回到開頭。', '遇到嚴格較大值就記下並停止。'],
      figure: { title: 'nums = [1,2,1]', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個位置最多看 n−1 個位置；答案陣列佔 n 格。' },
      verdict: '容易直接驗證「循環」的意思，長陣列時會太慢。',
      code: {
        python: `def nextGreaterElements(nums):
    n = len(nums)
    answer = [-1] * n
    for i in range(n):
        for step in range(1, n):
            j = (i + step) % n  # 繞到尾端就回開頭
            if nums[j] > nums[i]:
                answer[i] = nums[j]
                break
    return answer`,
        c: `int *nextGreaterElements(int *nums, int numsSize, int *returnSize) {
    int n = numsSize;
    int *answer = malloc(n * sizeof(int));
    *returnSize = n;
    for (int i = 0; i < n; i++) {
        answer[i] = -1;
        for (int step = 1; step < n; step++) {
            int j = (i + step) % n;
            if (nums[j] > nums[i]) {
                answer[i] = nums[j];
                break;
            }
        }
    }
    return answer;
}`,
        cpp: `vector<int> nextGreaterElements(vector<int>& nums) {
    int n = nums.size();
    vector<int> answer(n, -1);
    for (int i = 0; i < n; i++) {
        for (int step = 1; step < n; step++) {
            int j = (i + step) % n;
            if (nums[j] > nums[i]) {
                answer[i] = nums[j];
                break;
            }
        }
    }
    return answer;
}`,
        java: `int[] nextGreaterElements(int[] nums) {
    int n = nums.length;
    int[] answer = new int[n];
    Arrays.fill(answer, -1);
    for (int i = 0; i < n; i++) {
        for (int step = 1; step < n; step++) {
            int j = (i + step) % n;
            if (nums[j] > nums[i]) {
                answer[i] = nums[j];
                break;
            }
        }
    }
    return answer;
}`,
        javascript: `function nextGreaterElements(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    for (let step = 1; step < n; step++) {
      const j = (i + step) % n;
      if (nums[j] > nums[i]) {
        answer[i] = nums[j];
        break;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '兩圈掃描與單調堆疊',
      idea: '第一圈把待解索引入堆疊；第二圈只用來補上繞回開頭才出現的更大值。',
      steps: ['答案填 −1，堆疊為空。', '掃描 i=0..2n−1，取 `x=nums[i%n]`。', '只要 x 比堆疊頂端對應值大，就彈出並寫答案。', '只在第一圈把 i 放入堆疊，避免重複索引。'],
      figure: { title: 'nums = [1,2,1]', steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引只入堆疊和出堆疊各一次。' },
      verdict: '同時處理「下一個更大」和繞圈，適合較大的輸入。',
      code: {
        python: `def nextGreaterElements(nums):
    n = len(nums)
    answer = [-1] * n
    stack = []
    for i in range(2 * n):
        x = nums[i % n]  # 第二圈模擬繞回開頭
        while stack and nums[stack[-1]] < x:
            answer[stack.pop()] = x
        if i < n:
            stack.append(i)  # 每個索引只入堆疊一次
    return answer`,
        c: `int *nextGreaterElements(int *nums, int numsSize, int *returnSize) {
    int n = numsSize;
    int *answer = malloc(n * sizeof(int));
    int *stack = malloc(n * sizeof(int));
    int top = 0;
    *returnSize = n;
    for (int i = 0; i < n; i++) {
        answer[i] = -1;
    }
    for (int i = 0; i < 2 * n; i++) {
        int x = nums[i % n];
        while (top > 0 && nums[stack[top - 1]] < x) {
            answer[stack[--top]] = x;
        }
        if (i < n) {
            stack[top++] = i;
        }
    }
    free(stack);
    return answer;
}`,
        cpp: `vector<int> nextGreaterElements(vector<int>& nums) {
    int n = nums.size();
    vector<int> answer(n, -1);
    vector<int> stack;
    for (int i = 0; i < 2 * n; i++) {
        int x = nums[i % n];
        while (!stack.empty() && nums[stack.back()] < x) {
            answer[stack.back()] = x;
            stack.pop_back();
        }
        if (i < n) {
            stack.push_back(i);
        }
    }
    return answer;
}`,
        java: `int[] nextGreaterElements(int[] nums) {
    int n = nums.length;
    int[] answer = new int[n];
    int[] stack = new int[n];
    int top = 0;
    Arrays.fill(answer, -1);
    for (int i = 0; i < 2 * n; i++) {
        int x = nums[i % n];
        while (top > 0 && nums[stack[top - 1]] < x) {
            answer[stack[--top]] = x;
        }
        if (i < n) {
            stack[top++] = i;
        }
    }
    return answer;
}`,
        javascript: `function nextGreaterElements(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(-1);
  const stack = [];
  for (let i = 0; i < 2 * n; i++) {
    const x = nums[i % n];
    while (stack.length && nums[stack[stack.length - 1]] < x) {
      answer[stack.pop()] = x;
    }
    if (i < n) {
      stack.push(i);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['「更大」必須嚴格大於；相等不能彈出堆疊。', '第二圈不要再次入堆疊，不然同一索引會被重複處理。'],
  check: { kind: 'fn', fn: 'nextGreaterElements', cases: [{ args: [A], out: [2, -1, 2] }, { args: [[1, 2, 3, 4, 3]], out: [2, 3, 4, -1, 4] }, { args: [[5]], out: [-1] }, { args: [[2, 2]], out: [-1, -1] }] },
}
