import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [-10, -10, 1, 3, 2]

export const q0628: Solution = {
  id: 628,
  plain: '從數列挑三個數相乘，找最大的乘積；兩個大負數也可能變成大正數。',
  statement: '給至少三個整數的陣列 nums，從不同索引選三個，回傳最大的乘積。',
  examples: [{ input: 'nums = [1,2,3]', output: '6' }, { input: 'nums = [-10,-10,1,3,2]', output: '300' }],
  constraints: ['3 ≤ nums.length ≤ 10⁴；每個數介於 −1000 與 1000。'],
  insight: ['最大乘積只可能是三個最大值相乘，或兩個最小值與最大值相乘。', '前者涵蓋全正或全負，後者涵蓋兩個大負數翻正。'],
  approaches: [
    {
      name: '排序後比較兩種組合',
      idea: '排序後，直接拿頭兩個及尾三個計算兩個候選值。',
      steps: ['由小到大排序', '算尾三個數的乘積', '算頭兩個數與最大數的乘積', '回傳兩者較大值'],
      figure: { title: 'nums = [-10,-10,1,3,2]', steps: [
        { note: '排序得到 −10、−10、1、2、3。', views: [arr([-10, -10, 1, 2, 3], { label: '排序後' })] },
        { note: '選三個最大值 1×2×3，只得到 6。', views: [arr([-10, -10, 1, 2, 3], { label: '尾三個', highlight: [2, 3, 4] })] },
        { note: '選兩個最小負數與最大值，−10×−10×3 得 300。', views: [arr([-10, -10, 1, 2, 3], { label: '頭兩個與尾一個', highlight: [0, 1, 4] })] },
        { note: '比較 6 和 300，答案為 300。', views: [arr([6, 300], { label: '候選乘積', done: [1] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '時間由排序主導；額外空間視排序實作而定。' },
      verdict: '最直接，特別適合初學者理解負數的影響。',
      code: {
        python: `def maximumProduct(nums):
    nums.sort()
    largest = nums[-1] * nums[-2] * nums[-3]
    two_negatives = nums[0] * nums[1] * nums[-1]  # 負負得正
    return max(largest, two_negatives)`,
        c: `static int compare628(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int maximumProduct(int *nums, int numsSize) {
    qsort(nums, numsSize, sizeof(int), compare628);
    int largest = nums[numsSize - 1] * nums[numsSize - 2] * nums[numsSize - 3];
    int twoNegatives = nums[0] * nums[1] * nums[numsSize - 1];
    return largest > twoNegatives ? largest : twoNegatives;
}`,
        cpp: `int maximumProduct(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    int largest = nums[n - 1] * nums[n - 2] * nums[n - 3];
    int twoNegatives = nums[0] * nums[1] * nums[n - 1];
    return max(largest, twoNegatives);
}`,
        java: `int maximumProduct(int[] nums) {
    Arrays.sort(nums);
    int n = nums.length;
    int largest = nums[n - 1] * nums[n - 2] * nums[n - 3];
    int twoNegatives = nums[0] * nums[1] * nums[n - 1];
    return Math.max(largest, twoNegatives);
}`,
        javascript: `function maximumProduct(nums) {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  const largest = nums[n - 1] * nums[n - 2] * nums[n - 3];
  const twoNegatives = nums[0] * nums[1] * nums[n - 1];
  return Math.max(largest, twoNegatives);
}`,
      },
    },
    {
      name: '一次掃描保留五個極值',
      idea: '只追蹤最小兩個與最大三個，無須排序整個陣列。',
      steps: ['將兩個最小值設為正無限大，三個最大值設為負無限大', '掃描每個數，依序更新最小兩個', '同時依序更新最大三個', '比較兩種乘積'],
      figure: { title: 'nums = [-10,-10,1,3,2]', steps: [
        { note: '讀到兩個 −10 後，最小兩個都是 −10。', views: [arr(A, { label: 'nums', highlight: [0, 1] }), arr([-10, -10], { label: '最小兩個' })] },
        { note: '接著讀 1、3、2，最大三個逐步變成 3、2、1。', views: [arr(A, { label: 'nums', highlight: [2, 3, 4] }), arr([3, 2, 1], { label: '最大三個' })] },
        { note: '最大三個相乘為 6。', views: [arr([3, 2, 1, 6], { label: '候選一' })] },
        { note: '兩個最小值乘最大值為 300，較大。', views: [arr([-10, -10, 3, 300], { label: '候選二', done: [3] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個數只更新固定五個位置。' },
      verdict: '資料很多時可避免排序。',
      code: {
        python: `def maximumProduct(nums):
    low1 = low2 = float('inf')
    high1 = high2 = high3 = float('-inf')
    for x in nums:
        if x <= low1:
            low1, low2 = x, low1
        elif x < low2:
            low2 = x
        if x >= high1:
            high1, high2, high3 = x, high1, high2
        elif x >= high2:
            high2, high3 = x, high2
        elif x > high3:
            high3 = x
    return max(high1 * high2 * high3, low1 * low2 * high1)  # 比較兩種極值組合`,
        c: `int maximumProduct(int *nums, int numsSize) {
    int low1 = INT_MAX;
    int low2 = INT_MAX;
    int high1 = INT_MIN;
    int high2 = INT_MIN;
    int high3 = INT_MIN;
    for (int i = 0; i < numsSize; i++) {
        int x = nums[i];
        if (x <= low1) {
            low2 = low1;
            low1 = x;
        } else if (x < low2) {
            low2 = x;
        }
        if (x >= high1) {
            high3 = high2;
            high2 = high1;
            high1 = x;
        } else if (x >= high2) {
            high3 = high2;
            high2 = x;
        } else if (x > high3) {
            high3 = x;
        }
    }
    int a = high1 * high2 * high3;
    int b = low1 * low2 * high1;
    return a > b ? a : b;
}`,
        cpp: `int maximumProduct(vector<int>& nums) {
    int low1 = INT_MAX, low2 = INT_MAX;
    int high1 = INT_MIN, high2 = INT_MIN, high3 = INT_MIN;
    for (int x : nums) {
        if (x <= low1) {
            low2 = low1;
            low1 = x;
        } else if (x < low2) {
            low2 = x;
        }
        if (x >= high1) {
            high3 = high2;
            high2 = high1;
            high1 = x;
        } else if (x >= high2) {
            high3 = high2;
            high2 = x;
        } else if (x > high3) {
            high3 = x;
        }
    }
    return max(high1 * high2 * high3, low1 * low2 * high1);
}`,
        java: `int maximumProduct(int[] nums) {
    int low1 = Integer.MAX_VALUE, low2 = Integer.MAX_VALUE;
    int high1 = Integer.MIN_VALUE, high2 = Integer.MIN_VALUE, high3 = Integer.MIN_VALUE;
    for (int x : nums) {
        if (x <= low1) {
            low2 = low1;
            low1 = x;
        } else if (x < low2) {
            low2 = x;
        }
        if (x >= high1) {
            high3 = high2;
            high2 = high1;
            high1 = x;
        } else if (x >= high2) {
            high3 = high2;
            high2 = x;
        } else if (x > high3) {
            high3 = x;
        }
    }
    return Math.max(high1 * high2 * high3, low1 * low2 * high1);
}`,
        javascript: `function maximumProduct(nums) {
  let low1 = Infinity, low2 = Infinity;
  let high1 = -Infinity, high2 = -Infinity, high3 = -Infinity;
  for (const x of nums) {
    if (x <= low1) {
      low2 = low1;
      low1 = x;
    } else if (x < low2) {
      low2 = x;
    }
    if (x >= high1) {
      high3 = high2;
      high2 = high1;
      high1 = x;
    } else if (x >= high2) {
      high3 = high2;
      high2 = x;
    } else if (x > high3) {
      high3 = x;
    }
  }
  return Math.max(high1 * high2 * high3, low1 * low2 * high1);
}`,
      },
    },
  ],
  pitfalls: ['兩個絕對值大的負數相乘可能打敗三個最大值。', 'JavaScript 排序一定要傳數值比較函式，否則會按字串順序排。'],
  check: { kind: 'fn', fn: 'maximumProduct', cases: [
    { args: [[1, 2, 3]], out: 6 },
    { args: [A], out: 300 },
    { args: [[-4, -3, -2, -1]], out: -6 },
  ] },
}
