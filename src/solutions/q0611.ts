import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [2, 2, 3, 4]

export const q0611: Solution = {
  id: 611,
  plain: '從一堆木棒選三根，數一數能圍成三角形的選法。',
  statement: '給非負整數陣列 nums，每個數是一根棒子的長度。選三個不同索引，只要兩短邊之和大於長邊，就算一個三角形。回傳選法數量。',
  examples: [{ input: 'nums = [2,2,3,4]', output: '3' }, { input: 'nums = [4,2,3,4]', output: '4' }],
  constraints: ['1 ≤ nums.length ≤ 1000；棒長可能為 0。'],
  insight: ['排序後，只須檢查較短兩邊的和是否大於最長邊。', '固定最長邊後，可用 [[p:two-pointers]] 一次數出多個合格組合。'],
  approaches: [
    {
      name: '排序與雙指標',
      idea: '固定最大邊 k，從兩端夾較短邊；若和夠大，left 到 right−1 都能配 right。',
      steps: ['將 nums 由小到大排序', '從右到左固定最大邊 k', '設 left = 0、right = k−1', '若兩邊和大於 nums[k]，加入 right−left 並左移 right；否則右移 left'],
      figure: { title: 'nums = [2,2,3,4]', steps: [
        { note: '排序後仍是 [2,2,3,4]，先固定 4 為最大邊。', views: [arr(A, { label: '排序後', highlight: [3] })] },
        { note: '2 + 3 > 4，所以兩個 2 都可搭配 3、4，一次加入 2。', views: [arr(A, { label: 'left / right / k', highlight: [0, 2, 3] }), arr([2], { label: '累計' })] },
        { note: '右指標移到另一個 2；2 + 2 不大於 4，不能形成三角形。', views: [arr(A, { label: '目前比較', highlight: [0, 1, 3] }), arr([2], { label: '累計' })] },
        { note: '改固定 3：2 + 2 > 3，加入 1；總共 3 組。', views: [arr(A, { label: '目前比較', highlight: [0, 1, 2] }), arr([3], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '排序後，每個最大邊只掃一趟其左側。' },
      verdict: '一次計入整批組合，是此題最有效率的常見做法。',
      code: {
        python: `def triangleNumber(nums):
    nums.sort()
    ans = 0
    for k in range(len(nums) - 1, 1, -1):
        left, right = 0, k - 1
        while left < right:
            if nums[left] + nums[right] > nums[k]:
                ans += right - left  # 其間所有左端都成立
                right -= 1
            else:
                left += 1
    return ans`,
        c: `static int compare611(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int triangleNumber(int *nums, int numsSize) {
    qsort(nums, numsSize, sizeof(int), compare611);
    int ans = 0;
    for (int k = numsSize - 1; k >= 2; k--) {
        int left = 0;
        int right = k - 1;
        while (left < right) {
            if (nums[left] + nums[right] > nums[k]) {
                ans += right - left;
                right--;
            } else {
                left++;
            }
        }
    }
    return ans;
}`,
        cpp: `int triangleNumber(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int ans = 0;
    for (int k = (int)nums.size() - 1; k >= 2; k--) {
        int left = 0;
        int right = k - 1;
        while (left < right) {
            if (nums[left] + nums[right] > nums[k]) {
                ans += right - left;
                right--;
            } else {
                left++;
            }
        }
    }
    return ans;
}`,
        java: `int triangleNumber(int[] nums) {
    Arrays.sort(nums);
    int ans = 0;
    for (int k = nums.length - 1; k >= 2; k--) {
        int left = 0;
        int right = k - 1;
        while (left < right) {
            if (nums[left] + nums[right] > nums[k]) {
                ans += right - left;
                right--;
            } else {
                left++;
            }
        }
    }
    return ans;
}`,
        javascript: `function triangleNumber(nums) {
  nums.sort((a, b) => a - b);
  let ans = 0;
  for (let k = nums.length - 1; k >= 2; k--) {
    let left = 0;
    let right = k - 1;
    while (left < right) {
      if (nums[left] + nums[right] > nums[k]) {
        ans += right - left;
        right--;
      } else {
        left++;
      }
    }
  }
  return ans;
}`,
      },
    },
    {
      name: '排序與二分搜尋',
      idea: '固定兩條短邊後，二分找到第一個太長的第三邊。',
      steps: ['排序', '列舉 i < j，並跳過長度 0 的短邊', '在 j+1 到結尾二分第一個大於 nums[i]+nums[j]−1 的位置', '將合格的第三邊數量累加'],
      figure: { title: 'nums = [2,2,3,4]', steps: [
        { note: '固定前兩根 2、2，第三邊只可選 3，因為 4 不小於 2+2。', views: [arr(A, { label: '2 + 2', highlight: [0, 1, 2], dim: [3] })] },
        { note: '固定第一根 2 與 3，第三邊 4 小於 5，可以計入。', views: [arr(A, { label: '2 + 3', highlight: [0, 2, 3] })] },
        { note: '第二根 2 與 3 同樣能搭配 4；相同長度但索引不同。', views: [arr(A, { label: '另一組 2 + 3', highlight: [1, 2, 3] })] },
        { note: '三組都已找齊。', views: [arr([1, 1, 1], { label: '三次計數', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(n² log n)', space: 'O(1)', why: '每一對短邊都做一次二分搜尋。' },
      verdict: '方便練習「第一個不合格位置」的二分邊界。',
      code: {
        python: `from bisect import bisect_left

def triangleNumber(nums):
    nums.sort()
    ans = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            end = bisect_left(nums, nums[i] + nums[j], j + 1)
            ans += end - j - 1  # j 後面、end 前面都合格
    return ans`,
        c: `static int compare611(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int triangleNumber(int *nums, int numsSize) {
    qsort(nums, numsSize, sizeof(int), compare611);
    int ans = 0;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            int left = j + 1;
            int right = numsSize;
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (nums[mid] < nums[i] + nums[j]) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }
            ans += left - j - 1;
        }
    }
    return ans;
}`,
        cpp: `int triangleNumber(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int ans = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int j = i + 1; j < (int)nums.size(); j++) {
            auto end = lower_bound(nums.begin() + j + 1, nums.end(), nums[i] + nums[j]);
            ans += (int)(end - nums.begin()) - j - 1;
        }
    }
    return ans;
}`,
        java: `int triangleNumber(int[] nums) {
    Arrays.sort(nums);
    int ans = 0;
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            int left = j + 1;
            int right = nums.length;
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (nums[mid] < nums[i] + nums[j]) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }
            ans += left - j - 1;
        }
    }
    return ans;
}`,
        javascript: `function triangleNumber(nums) {
  nums.sort((a, b) => a - b);
  let ans = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      let left = j + 1;
      let right = nums.length;
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] < nums[i] + nums[j]) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      ans += left - j - 1;
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['必須嚴格大於，兩短邊和等於長邊只是一直線。', '相同棒長但索引不同，仍是不同選法。'],
  check: { kind: 'fn', fn: 'triangleNumber', cases: [
    { args: [[2, 2, 3, 4]], out: 3 },
    { args: [[4, 2, 3, 4]], out: 4 },
    { args: [[0, 1, 1, 1]], out: 1 },
    { args: [[1, 2]], out: 0 },
  ] },
}
