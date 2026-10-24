import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [1, 2, 1, 3, 2, 5]

export const q0260: Solution = {
  id: 260,
  plain: '陣列裡大多數數字都出現兩次，只有兩個數字各出現一次；找出這兩個。',
  statement: '給整數陣列 nums，恰有兩個元素只出現一次，其餘各出現兩次。回傳這兩個單獨的元素，順序不限。',
  examples: [{ input: 'nums = [1,2,1,3,2,5]', output: '[3,5]' }, { input: 'nums = [-1,0]', output: '[-1,0]' }],
  constraints: ['可用排序驗證；進階要求 O(n) 時間、O(1) 額外空間。'],
  insight: ['排序後成對的數緊挨在一起，容易找出落單者。', '相同數 XOR 後為 0；整體 XOR 剩下兩個答案的 XOR。', '取其中一個為 1 的位元，把答案分進不同組，兩組各自 XOR 就找到了；這是 [[p:bit-manipulation]]。'],
  approaches: [
    {
      name: '排序後成對檢查',
      idea: '排序讓相同的數相鄰；從左到右跳過完整配對。',
      steps: ['排序 nums', '若當前與下一個相同，索引前進 2', '否則記錄此數並前進 1'],
      figure: { title: 'nums = [1,2,1,3,2,5]', steps: [
        { note: '排序後成 [1,1,2,2,3,5]，相同數聚在一起。', views: [arr([1, 1, 2, 2, 3, 5], { label: '排序後' })] },
        { note: '前兩個 1 配成一對，直接跳過。', views: [arr([1, 1, 2, 2, 3, 5], { done: [0, 1] })] },
        { note: '兩個 2 也配成一對，跳過。', views: [arr([1, 1, 2, 2, 3, 5], { done: [0, 1, 2, 3] })] },
        { note: '3 與 5 都沒有同值鄰居，答案為 [3,5]。', views: [arr([1, 1, 2, 2, 3, 5], { highlight: [4, 5] }), arr([3, 5], { label: '答案', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(1) 或依排序實作', why: '先排序，再掃一遍。' },
      verdict: '直觀，但會改變輸入順序且不符合進階線性時間要求。',
      code: {
        python: `def singleNumber(nums):
    nums.sort()
    out = []
    i = 0
    while i < len(nums):
        if i + 1 < len(nums) and nums[i] == nums[i + 1]:
            i += 2  # 一對一起跳過
        else:
            out.append(nums[i])
            i += 1
    return out`,
        c: `static int cmpSingle(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int *singleNumber(int *nums, int numsSize, int *returnSize) {
    qsort(nums, numsSize, sizeof(int), cmpSingle);
    int *out = malloc(2 * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < numsSize;) {
        if (i + 1 < numsSize && nums[i] == nums[i + 1]) {
            i += 2;
        } else {
            out[(*returnSize)++] = nums[i++];
        }
    }
    return out;
}`,
        cpp: `vector<int> singleNumber(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<int> out;
    for (int i = 0; i < (int)nums.size();) {
        if (i + 1 < (int)nums.size() && nums[i] == nums[i + 1]) {
            i += 2;
        } else {
            out.push_back(nums[i++]);
        }
    }
    return out;
}`,
        java: `int[] singleNumber(int[] nums) {
    Arrays.sort(nums);
    int[] out = new int[2];
    int count = 0;
    for (int i = 0; i < nums.length;) {
        if (i + 1 < nums.length && nums[i] == nums[i + 1]) {
            i += 2;
        } else {
            out[count++] = nums[i++];
        }
    }
    return out;
}`,
        javascript: `function singleNumber(nums) {
  nums.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length;) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      i += 2;
    } else {
      out.push(nums[i++]);
    }
  }
  return out;
}`,
      },
    },
    {
      name: 'XOR 位元分組',
      idea: '兩個答案的 XOR 至少有一個 1 位；用它把兩個答案拆到不同組。',
      steps: ['XOR 所有元素得 x，即兩個答案的 XOR', '取 `bit = x & -x`，找出兩答案不同的一位', '按該位是否為 1 分組，各組 XOR'],
      figure: { title: 'nums = [1,2,1,3,2,5]', steps: [
        { note: '兩個 1 和兩個 2 各自 XOR 成 0；所有數 XOR 後剩 3 XOR 5 = 6（二進位 110）。', views: [arr(A, { dim: [0, 1, 2, 4], highlight: [3, 5] }), arr(['110'], { label: 'x' })] },
        { note: '取最低的 1 位，bit=2（二進位 010）；3 有這位，5 沒有。', views: [arr(['011', '101', '010'], { label: '3 / 5 / bit', highlight: [2] })] },
        { note: 'bit 為 1 的組是 [2,3,2]，兩個 2 抵消，留下 3。', views: [arr([2, 3, 2], { label: '第一組', done: [1] })] },
        { note: '另一組 [1,1,5] 抵消後留下 5，得到兩個答案。', views: [arr([1, 1, 5], { label: '第二組', done: [2] }), arr([3, 5], { label: '答案' })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩次線性掃描，只有少數整數變數。' },
      verdict: '符合進階要求；成對數永遠進同一組，因此仍能抵消。',
      code: {
        python: `def singleNumber(nums):
    xor = 0
    for value in nums:
        xor ^= value
    bit = xor & -xor  # 兩個答案不同的最低位
    a = b = 0
    for value in nums:
        if value & bit:
            a ^= value
        else:
            b ^= value
    return [a, b]`,
        c: `int *singleNumber(int *nums, int numsSize, int *returnSize) {
    unsigned int xor = 0;
    for (int i = 0; i < numsSize; i++) xor ^= (unsigned int)nums[i];
    unsigned int bit = xor & (~xor + 1u);
    int a = 0, b = 0;
    for (int i = 0; i < numsSize; i++) {
        if ((unsigned int)nums[i] & bit) a ^= nums[i];
        else b ^= nums[i];
    }
    int *out = malloc(2 * sizeof(int));
    out[0] = a;
    out[1] = b;
    *returnSize = 2;
    return out;
}`,
        cpp: `vector<int> singleNumber(vector<int>& nums) {
    unsigned int xorValue = 0;
    for (int value : nums) xorValue ^= (unsigned int)value;
    unsigned int bit = xorValue & (~xorValue + 1u);
    int a = 0, b = 0;
    for (int value : nums) {
        if ((unsigned int)value & bit) a ^= value;
        else b ^= value;
    }
    return {a, b};
}`,
        java: `int[] singleNumber(int[] nums) {
    int xor = 0;
    for (int value : nums) xor ^= value;
    int bit = xor & -xor;
    int a = 0, b = 0;
    for (int value : nums) {
        if ((value & bit) != 0) a ^= value;
        else b ^= value;
    }
    return new int[]{a, b};
}`,
        javascript: `function singleNumber(nums) {
  let xor = 0;
  for (const value of nums) xor ^= value;
  const bit = xor & -xor;
  let a = 0, b = 0;
  for (const value of nums) {
    if (value & bit) a ^= value;
    else b ^= value;
  }
  return [a, b];
}`,
      },
    },
  ],
  pitfalls: ['整體 XOR 只得到兩個答案的 XOR，還需挑一個不同位分組。', 'C/C++ 取最低位時先轉 unsigned，避免有號最小值取負溢位。'],
  check: { kind: 'fn', fn: 'singleNumber', compare: 'sorted', cases: [
    { args: [A], out: [3, 5] },
    { args: [[-1, 0]], out: [-1, 0] },
    { args: [[0, 1, 0, -2147483648]], out: [1, -2147483648] },
  ] },
}
