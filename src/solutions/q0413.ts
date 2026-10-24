import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 413. Arithmetic Slices
const A = [1, 2, 3, 4]

function dpFig(): FigStep[] {
  return [
    { note: '長度至少 3 才算等差子陣列；先看相鄰差是否持續相同。', views: [arr(A, { label: 'nums' }), arr([1, 1, 1], { label: '相鄰差' })] },
    { note: '以 3 結尾，[1,2,3] 是第一段，當前新增數量 cur = 1。', views: [arr(A, { label: 'nums', done: [0, 1, 2], dim: [3] }), arr([1], { label: 'cur' })] },
    { note: '以 4 結尾，原本的 [1,2,3] 可以延長成 [1,2,3,4]，還有新三元組 [2,3,4]；cur = 2。', views: [arr(A, { label: 'nums', highlight: [3] }), arr([2], { label: 'cur' })] },
    { note: '把每個右端點新增的數量相加：1 + 2 = 3。', views: [arr([1, 2, 3], { label: '右端在 2 / 右端在 3 / 總數', done: [2] })] },
  ]
}

function runFig(): FigStep[] {
  return [
    { note: '連續相等的相鄰差形成一個等差長段；這裡差值 1 連續出現三次。', views: [arr(A, { label: 'nums' }), arr([1, 1, 1], { label: '差值' })] },
    { note: '長度 3 時有 1 個合法子陣列：[1,2,3]。', views: [arr(A, { label: '長段', done: [0, 1, 2], dim: [3] })] },
    { note: '長度 4 時又多 2 個：[2,3,4] 與 [1,2,3,4]。', views: [arr(A, { label: '長段', done: [0, 1, 2, 3] })] },
    { note: '長度 L 的長段共有 `(L−1)(L−2)/2` 個；L = 4 時是 3。遇到差值改變就結算並開新段。', views: [arr([4, 3], { label: '長度 / 貢獻', done: [1] })] },
  ]
}

export const q0413: Solution = {
  id: 413,
  plain: '數一數陣列中有多少段長度至少 3 的連續等差數列。',
  statement: '給定整數陣列 `nums`。若連續子陣列至少有三個元素，而且每一對相鄰元素的差都一樣，它就是等差切片；回傳總數。',
  examples: [{ input: 'nums = [1,2,3,4]', output: '3' }, { input: 'nums = [1]', output: '0' }],
  constraints: ['1 ≤ nums.length ≤ 5000', '−1000 ≤ nums[i] ≤ 1000'],
  insight: ['固定右端點：若最後三個數維持相同差，先前以左鄰格結尾的等差切片都可延長，並多出最後三格。', '若差值改變，以目前位置結尾的等差切片數歸零。', '也能找出所有最大的等差長段，按長度直接計數。'],
  approaches: [
    {
      name: '一維動態規劃',
      idea: '`cur` 表示以目前元素結尾的等差切片數；差值相同就 `cur += 1`，否則歸零。',
      steps: ['設 `cur=0`、`ans=0`', '從索引 2 開始比較最後兩個差', '相同則 `cur++`，不同則 `cur=0`', '每格將 cur 加入 ans'],
      figure: { title: 'nums = [1,2,3,4]', steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素只檢查一次，保留兩個計數。' },
      verdict: '最直觀的 [[p:dp-1d]] 寫法；`cur` 的意思明確，較不容易重複計數。',
      code: {
        python: `def numberOfArithmeticSlices(nums):
    cur = ans = 0
    for i in range(2, len(nums)):
        if nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]:
            cur += 1                    # 舊切片延長，再加新三元組
        else:
            cur = 0                     # 差值斷掉，重新開始
        ans += cur
    return ans`,
        c: `int numberOfArithmeticSlices(int *nums, int numsSize) {
    int cur = 0;
    int ans = 0;
    for (int i = 2; i < numsSize; i++) {
        if (nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]) {
            cur++;
        } else {
            cur = 0;
        }
        ans += cur;
    }
    return ans;
}`,
        cpp: `int numberOfArithmeticSlices(vector<int>& nums) {
    int cur = 0;
    int ans = 0;
    for (int i = 2; i < (int)nums.size(); i++) {
        if (nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]) {
            cur++;
        } else {
            cur = 0;
        }
        ans += cur;
    }
    return ans;
}`,
        java: `int numberOfArithmeticSlices(int[] nums) {
    int cur = 0;
    int ans = 0;
    for (int i = 2; i < nums.length; i++) {
        if (nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]) {
            cur++;
        } else {
            cur = 0;
        }
        ans += cur;
    }
    return ans;
}`,
        javascript: `function numberOfArithmeticSlices(nums) {
  let cur = 0;
  let ans = 0;
  for (let i = 2; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] === nums[i - 1] - nums[i - 2]) {
      cur++;
    } else {
      cur = 0;
    }
    ans += cur;
  }
  return ans;
}`,
      },
    },
    {
      name: '按等差長段結算',
      idea: '若一段長度為 L，包含的長度至少 3 的連續子陣列有 `(L−1)(L−2)/2` 個。',
      steps: ['若陣列少於三格，回傳 0', '從頭維持同一差值的長段長度', '差值改變時結算舊段的貢獻，並從前兩格重新起段', '掃完後再結算最後一段'],
      figure: { title: 'nums = [1,2,3,4]', steps: runFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '逐格擴大或結算長段。' },
      verdict: '適合想理解計數公式的人；實作時要記得最後一段也需結算。',
      code: {
        python: `def numberOfArithmeticSlices(nums):
    if len(nums) < 3:
        return 0
    length, ans = 2, 0
    for i in range(2, len(nums)):
        if nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]:
            length += 1                 # 等差長段延長
        else:
            ans += (length - 1) * (length - 2) // 2
            length = 2                  # 用最後兩格開新段
    ans += (length - 1) * (length - 2) // 2
    return ans`,
        c: `int numberOfArithmeticSlices(int *nums, int numsSize) {
    if (numsSize < 3) {
        return 0;
    }
    int length = 2;
    int ans = 0;
    for (int i = 2; i < numsSize; i++) {
        if (nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]) {
            length++;
        } else {
            ans += (length - 1) * (length - 2) / 2;
            length = 2;
        }
    }
    ans += (length - 1) * (length - 2) / 2;
    return ans;
}`,
        cpp: `int numberOfArithmeticSlices(vector<int>& nums) {
    if (nums.size() < 3) {
        return 0;
    }
    int length = 2;
    int ans = 0;
    for (int i = 2; i < (int)nums.size(); i++) {
        if (nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]) {
            length++;
        } else {
            ans += (length - 1) * (length - 2) / 2;
            length = 2;
        }
    }
    return ans + (length - 1) * (length - 2) / 2;
}`,
        java: `int numberOfArithmeticSlices(int[] nums) {
    if (nums.length < 3) {
        return 0;
    }
    int length = 2;
    int ans = 0;
    for (int i = 2; i < nums.length; i++) {
        if (nums[i] - nums[i - 1] == nums[i - 1] - nums[i - 2]) {
            length++;
        } else {
            ans += (length - 1) * (length - 2) / 2;
            length = 2;
        }
    }
    return ans + (length - 1) * (length - 2) / 2;
}`,
        javascript: `function numberOfArithmeticSlices(nums) {
  if (nums.length < 3) {
    return 0;
  }
  let length = 2;
  let ans = 0;
  for (let i = 2; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] === nums[i - 1] - nums[i - 2]) {
      length++;
    } else {
      ans += (length - 1) * (length - 2) / 2;
      length = 2;
    }
  }
  return ans + (length - 1) * (length - 2) / 2;
}`,
      },
    },
  ],
  pitfalls: ['子陣列必須連續；任意挑幾個元素組成的等差子序列不算。', '只有兩個元素不能構成等差切片。', '長段法遇差值改變時，新段仍包含前一格和目前格。'],
  check: { kind: 'fn', fn: 'numberOfArithmeticSlices', cases: [
    { args: [A], out: 3 }, { args: [[1]], out: 0 }, { args: [[1, 2]], out: 0 },
    { args: [[1, 2, 3, 8, 9, 10]], out: 2 }, { args: [[7, 7, 7, 7, 7]], out: 6 },
  ] },
}
