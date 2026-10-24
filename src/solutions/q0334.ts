import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [2, 1, 5, 0, 4, 6]

function boundsFig(): FigStep[] {
  return [
    { note: '對每個中間位置 i，要知道左邊最小值與右邊最大值；以 nums[4]=4 為例，左邊最小是 0，右邊最大是 6。', views: [arr(A, { label: 'nums', highlight: [4], compare: [3, 5] })] },
    { note: '從左掃得到左側最小值陣列：第 4 格左邊最小為 0（索引 3）。', views: [arr(['—', 2, 1, 1, 0, 0], { label: 'leftMin[i]：i 左邊最小' })] },
    { note: '從右掃得到右側最大值：第 4 格右邊最大為 6（索引 5）。', views: [arr([6, 6, 6, 6, 6, '—'], { label: 'rightMax[i]：i 右邊最大' })] },
    { note: '位置 4 滿足 0<4<6，索引 3<4<5，回傳 true。', views: [arr(A, { label: '找到 0,4,6', highlight: [3, 4, 5] })] },
  ]
}

function greedyFig(): FigStep[] {
  return [
    { note: '維持 smallest（目前最小值）與 middle（某個遞增二元組的第二值）。讀 2、1 後 smallest=1。', views: [arr(A, { label: '已讀 2,1', done: [0], highlight: [1] })] },
    { note: '讀 5 時，它大於 smallest，設 middle=5，已有候選二元組 1<5。', views: [arr(A, { label: '候選 1,5', highlight: [1, 2] })] },
    { note: '讀 0 時更新 smallest=0；讀 4 時更新 middle=4，得到更容易延伸的候選 0<4。', views: [arr(A, { label: '候選 0,4', highlight: [3, 4] })] },
    { note: '讀 6 時，6>middle=4，已找到 0<4<6，回傳 true。', views: [arr(A, { label: '三個索引依序遞增', highlight: [3, 4, 5] })] },
  ]
}

export const q0334: Solution = {
  id: 334,
  plain: '判斷陣列中能否挑出三個位置由左到右排列，數值也嚴格越來越大。',
  statement: '給 nums，判斷是否存在 i<j<k 且 nums[i]<nums[j]<nums[k]；有則回傳 true，否則 false。',
  examples: [{ input: 'nums = [1,2,3,4,5]', output: 'true' }, { input: 'nums = [5,4,3,2,1]', output: 'false' }, { input: 'nums = [2,1,5,0,4,6]', output: 'true' }],
  constraints: ['`1 ≤ nums.length ≤ 5 × 10⁵`', '`−2³¹ ≤ nums[i] ≤ 2³¹−1`'],
  insight: ['固定中間值時，只要左邊有更小的、右邊有更大的，就找到三元組。', '更省空間的 [[p:greedy]]：維護最小的第一值和最小的第二值；遇到比第二值更大的就成功。'],
  approaches: [
    {
      name: '左側最小與右側最大',
      idea: '預先為每個位置記錄它左邊的最小值、右邊的最大值，再逐格判斷能否做中間值。',
      steps: ['從左建 leftMin，記嚴格左側的最小值。', '從右建 rightMax，記嚴格右側的最大值。', '找是否有 `leftMin[i]<nums[i]<rightMax[i]`。'],
      figure: { title: 'nums = [2,1,5,0,4,6]', steps: boundsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '三次線性掃描，兩個輔助陣列。' },
      verdict: '條件一目了然，適合先建立正確性。',
      code: {
        python: `def increasingTriplet(nums):
    n = len(nums)
    left = [float('inf')] * n
    right = [float('-inf')] * n
    for i in range(1, n):
        left[i] = min(left[i - 1], nums[i - 1])  # 僅看 i 左側
    for i in range(n - 2, -1, -1):
        right[i] = max(right[i + 1], nums[i + 1])  # 僅看 i 右側
    return any(left[i] < nums[i] < right[i] for i in range(n))`,
        c: `bool increasingTriplet(int *nums, int numsSize) {
    int n = numsSize;
    if (n < 3) {
        return false;
    }
    int *left = malloc(n * sizeof(int));
    int *right = malloc(n * sizeof(int));
    left[0] = INT_MAX;
    right[n - 1] = INT_MIN;
    for (int i = 1; i < n; i++) {
        left[i] = left[i - 1] < nums[i - 1] ? left[i - 1] : nums[i - 1];
    }
    for (int i = n - 2; i >= 0; i--) {
        right[i] = right[i + 1] > nums[i + 1] ? right[i + 1] : nums[i + 1];
    }
    bool found = false;
    for (int i = 1; i + 1 < n; i++) {
        if (left[i] < nums[i] && nums[i] < right[i]) {
            found = true;
            break;
        }
    }
    free(left);
    free(right);
    return found;
}`,
        cpp: `bool increasingTriplet(vector<int>& nums) {
    int n = nums.size();
    if (n < 3) {
        return false;
    }
    vector<int> left(n, INT_MAX);
    vector<int> right(n, INT_MIN);
    for (int i = 1; i < n; i++) {
        left[i] = min(left[i - 1], nums[i - 1]);
    }
    for (int i = n - 2; i >= 0; i--) {
        right[i] = max(right[i + 1], nums[i + 1]);
    }
    for (int i = 1; i + 1 < n; i++) {
        if (left[i] < nums[i] && nums[i] < right[i]) {
            return true;
        }
    }
    return false;
}`,
        java: `boolean increasingTriplet(int[] nums) {
    int n = nums.length;
    if (n < 3) {
        return false;
    }
    int[] left = new int[n];
    int[] right = new int[n];
    left[0] = Integer.MAX_VALUE;
    right[n - 1] = Integer.MIN_VALUE;
    for (int i = 1; i < n; i++) {
        left[i] = Math.min(left[i - 1], nums[i - 1]);
    }
    for (int i = n - 2; i >= 0; i--) {
        right[i] = Math.max(right[i + 1], nums[i + 1]);
    }
    for (int i = 1; i + 1 < n; i++) {
        if (left[i] < nums[i] && nums[i] < right[i]) {
            return true;
        }
    }
    return false;
}`,
        javascript: `function increasingTriplet(nums) {
  const n = nums.length;
  const left = new Array(n).fill(Infinity);
  const right = new Array(n).fill(-Infinity);
  for (let i = 1; i < n; i++) {
    left[i] = Math.min(left[i - 1], nums[i - 1]);
  }
  for (let i = n - 2; i >= 0; i--) {
    right[i] = Math.max(right[i + 1], nums[i + 1]);
  }
  for (let i = 1; i + 1 < n; i++) {
    if (left[i] < nums[i] && nums[i] < right[i]) {
      return true;
    }
  }
  return false;
}`,
      },
    },
    {
      name: '兩個門檻的貪心掃描',
      idea: 'smallest 是最小第一值；middle 是已找到的遞增二元組裡可達到的最小第二值。',
      steps: ['smallest、middle 設為正無窮。', '若 x≤smallest，更新 smallest；否則若 x≤middle，更新 middle。', '若 x>middle，已找到三個嚴格遞增的值。'],
      figure: { title: 'nums = [2,1,5,0,4,6]', steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '掃一次，只保留兩個門檻。' },
      verdict: '最省空間；使用 ≤ 更新門檻，避免把相等值誤認為嚴格遞增。',
      code: {
        python: `def increasingTriplet(nums):
    smallest = float('inf')
    middle = float('inf')
    for x in nums:
        if x <= smallest:
            smallest = x
        elif x <= middle:
            middle = x  # 找到更容易接上第三值的二元組
        else:
            return True  # x 比第二值更大
    return False`,
        c: `bool increasingTriplet(int *nums, int numsSize) {
    long long smallest = LLONG_MAX;
    long long middle = LLONG_MAX;
    for (int i = 0; i < numsSize; i++) {
        long long x = nums[i];
        if (x <= smallest) {
            smallest = x;
        } else if (x <= middle) {
            middle = x;
        } else {
            return true;
        }
    }
    return false;
}`,
        cpp: `bool increasingTriplet(vector<int>& nums) {
    long long smallest = LLONG_MAX;
    long long middle = LLONG_MAX;
    for (int x : nums) {
        if (x <= smallest) {
            smallest = x;
        } else if (x <= middle) {
            middle = x;
        } else {
            return true;
        }
    }
    return false;
}`,
        java: `boolean increasingTriplet(int[] nums) {
    long smallest = Long.MAX_VALUE;
    long middle = Long.MAX_VALUE;
    for (int x : nums) {
        if (x <= smallest) {
            smallest = x;
        } else if (x <= middle) {
            middle = x;
        } else {
            return true;
        }
    }
    return false;
}`,
        javascript: `function increasingTriplet(nums) {
  let smallest = Infinity;
  let middle = Infinity;
  for (const x of nums) {
    if (x <= smallest) {
      smallest = x;
    } else if (x <= middle) {
      middle = x;
    } else {
      return true;
    }
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['三個值必須嚴格遞增；相等不能算。', 'smallest 更新後可能比形成 middle 時的第一值更晚，但 middle 已經對應某個較早的合法二元組，仍可保留。'],
  check: { kind: 'fn', fn: 'increasingTriplet', cases: [{ args: [[1, 2, 3, 4, 5]], out: true }, { args: [[5, 4, 3, 2, 1]], out: false }, { args: [A], out: true }, { args: [[1, 1, 1]], out: false }, { args: [[20, 100, 10, 12, 5, 13]], out: true }] },
}
