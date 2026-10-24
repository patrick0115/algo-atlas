import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 581. Shortest Unsorted Continuous Subarray
const A = [2, 6, 4, 8, 10, 9, 15]

export const q0581: Solution = {
  id: 581,
  plain: '只整理一小段陣列，就要讓整列數字從小到大排好；求這一段最短有多長。',
  statement: '找出最短的連續子陣列，單獨排序它後，整個 nums 就會遞增（可相等）。原本已排序則回傳 0。',
  examples: [{ input: 'nums = [2,6,4,8,10,9,15]', output: '5', note: '排序索引 1 到 5。' }, { input: 'nums = [1,2,3,4]', output: '0' }],
  constraints: ['1 ≤ nums.length ≤ 10⁴；數值可能為負。'],
  insight: ['排序副本能直接指出哪些位置和正確答案不同。', '若要 O(1) 空間，從左找「比先前最大值還小」的位置，從右找「比後面最小值還大」的位置。', '這是 [[p:two-pointers]] 的雙向掃描。'],
  approaches: [
    {
      name: '排序副本比較',
      idea: '整列排序作為參照；第一個和最後一個不同的位置，就是必須整理的邊界。',
      steps: ['複製並排序 nums。', '從左、右各找第一個不同位置。', '若找不到不同，回傳 0；否則回傳邊界長度。'],
      figure: { title: 'nums = [2,6,4,8,10,9,15]', steps: [
        { note: '原陣列中 6 後面有 4，可能有錯位。先保留原陣列作比較。', views: [arr(A, { label: '原陣列' })] },
        { note: '排序副本得到每個位置應有的數字。', views: [arr([2, 4, 6, 8, 9, 10, 15], { label: '排序副本' })] },
        { note: '從左比較，索引 1 首次不同：6 應該是 4。', views: [arr(A, { label: '原陣列', highlight: [1] })] },
        { note: '從右比較，索引 5 首次不同；整理索引 1..5，共 5 個元素。', views: [arr(A, { label: '待排序段', highlight: [1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序副本耗時且需額外陣列。' },
      verdict: '最直觀，適合先理解邊界的意義。',
      code: {
        python: `def findUnsortedSubarray(nums):
    ordered = sorted(nums)                 # 正確位置的參照
    left = 0
    while left < len(nums) and nums[left] == ordered[left]:
        left += 1
    if left == len(nums):
        return 0
    right = len(nums) - 1
    while nums[right] == ordered[right]:
        right -= 1
    return right - left + 1`,
        c: `static int cmp581(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int findUnsortedSubarray(int *nums, int numsSize) {
    int *ordered = malloc(numsSize * sizeof(int));
    memcpy(ordered, nums, numsSize * sizeof(int));
    qsort(ordered, numsSize, sizeof(int), cmp581);
    int left = 0;
    while (left < numsSize && nums[left] == ordered[left]) {
        left++;
    }
    int right = numsSize - 1;
    while (right >= left && nums[right] == ordered[right]) {
        right--;
    }
    free(ordered);
    return right - left + 1;
}`,
        cpp: `int findUnsortedSubarray(vector<int>& nums) {
    vector<int> ordered = nums;
    sort(ordered.begin(), ordered.end());
    int left = 0;
    while (left < (int)nums.size() && nums[left] == ordered[left]) {
        left++;
    }
    int right = (int)nums.size() - 1;
    while (right >= left && nums[right] == ordered[right]) {
        right--;
    }
    return right - left + 1;
}`,
        java: `int findUnsortedSubarray(int[] nums) {
    int[] ordered = nums.clone();
    Arrays.sort(ordered);
    int left = 0;
    while (left < nums.length && nums[left] == ordered[left]) {
        left++;
    }
    int right = nums.length - 1;
    while (right >= left && nums[right] == ordered[right]) {
        right--;
    }
    return right - left + 1;
}`,
        javascript: `function findUnsortedSubarray(nums) {
  const ordered = [...nums].sort((a, b) => a - b);
  let left = 0;
  while (left < nums.length && nums[left] === ordered[left]) {
    left++;
  }
  let right = nums.length - 1;
  while (right >= left && nums[right] === ordered[right]) {
    right--;
  }
  return right - left + 1;
}`,
      },
    },
    {
      name: '雙向掃描極值',
      idea: '往右追蹤最大值，較小的新數必在待排段內；反方向用最小值找左界。',
      steps: ['右掃時更新目前最大值；小於它的位置更新右界。', '左掃時更新目前最小值；大於它的位置更新左界。', '沒有右界代表早已排序。'],
      figure: { title: 'nums = [2,6,4,8,10,9,15]', steps: [
        { note: '先看 2、6，最大值變成 6，暫時沒有錯位。', views: [arr(A, { label: '往右掃', done: [0, 1] })] },
        { note: '4 小於先前最大值 6，因此右界先到索引 2。', views: [arr(A, { label: '往右掃', highlight: [2] })] },
        { note: '繼續到 9，它小於先前最大值 10，右界推到索引 5。', views: [arr(A, { label: '右界', highlight: [5] })] },
        { note: '從右往左記最小值 9、8、4；6 大於後面的 4，左界到索引 1。答案 5。', views: [arr(A, { label: '左右界', highlight: [1, 5] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '各掃一次，只存極值和邊界。' },
      verdict: '省空間，也避免真正排序；面試時要說清楚極值為何能擴張邊界。',
      code: {
        python: `def findUnsortedSubarray(nums):
    left, right = len(nums), -1
    greatest = float('-inf')
    for i, value in enumerate(nums):
        greatest = max(greatest, value)
        if value < greatest:
            right = i                         # 較小值必須往左搬
    smallest = float('inf')
    for i in range(len(nums) - 1, -1, -1):
        smallest = min(smallest, nums[i])
        if nums[i] > smallest:
            left = i                          # 較大值必須往右搬
    return 0 if right == -1 else right - left + 1`,
        c: `int findUnsortedSubarray(int *nums, int numsSize) {
    int left = numsSize;
    int right = -1;
    int greatest = INT_MIN;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > greatest) {
            greatest = nums[i];
        }
        if (nums[i] < greatest) {
            right = i;
        }
    }
    int smallest = INT_MAX;
    for (int i = numsSize - 1; i >= 0; i--) {
        if (nums[i] < smallest) {
            smallest = nums[i];
        }
        if (nums[i] > smallest) {
            left = i;
        }
    }
    return right == -1 ? 0 : right - left + 1;
}`,
        cpp: `int findUnsortedSubarray(vector<int>& nums) {
    int left = nums.size();
    int right = -1;
    int greatest = INT_MIN;
    for (int i = 0; i < (int)nums.size(); i++) {
        greatest = max(greatest, nums[i]);
        if (nums[i] < greatest) {
            right = i;
        }
    }
    int smallest = INT_MAX;
    for (int i = (int)nums.size() - 1; i >= 0; i--) {
        smallest = min(smallest, nums[i]);
        if (nums[i] > smallest) {
            left = i;
        }
    }
    return right == -1 ? 0 : right - left + 1;
}`,
        java: `int findUnsortedSubarray(int[] nums) {
    int left = nums.length;
    int right = -1;
    int greatest = Integer.MIN_VALUE;
    for (int i = 0; i < nums.length; i++) {
        greatest = Math.max(greatest, nums[i]);
        if (nums[i] < greatest) {
            right = i;
        }
    }
    int smallest = Integer.MAX_VALUE;
    for (int i = nums.length - 1; i >= 0; i--) {
        smallest = Math.min(smallest, nums[i]);
        if (nums[i] > smallest) {
            left = i;
        }
    }
    return right == -1 ? 0 : right - left + 1;
}`,
        javascript: `function findUnsortedSubarray(nums) {
  let left = nums.length;
  let right = -1;
  let greatest = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    greatest = Math.max(greatest, nums[i]);
    if (nums[i] < greatest) {
      right = i;
    }
  }
  let smallest = Infinity;
  for (let i = nums.length - 1; i >= 0; i--) {
    smallest = Math.min(smallest, nums[i]);
    if (nums[i] > smallest) {
      left = i;
    }
  }
  return right === -1 ? 0 : right - left + 1;
}`,
      },
    },
  ],
  pitfalls: ['相等元素不算錯位，所以比較要用嚴格小於／大於。', '已排序時不可直接算 right - left + 1。'],
  check: { kind: 'fn', fn: 'findUnsortedSubarray', cases: [
    { args: [A], out: 5 }, { args: [[1, 2, 3, 4]], out: 0 }, { args: [[1]], out: 0 }, { args: [[1, 3, 2, 2, 2]], out: 4 },
  ] },
}
