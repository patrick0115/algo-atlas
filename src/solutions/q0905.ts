import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 905. Sort Array By Parity
const A = [3, 1, 2, 4]

// 答案不唯一：包裝函式同時檢查奇偶分界與原始元素是否完整保留。
const CHECK = {
  python: `

def parityCheck(nums):
    result = sortArrayByParity(nums[:])
    split = sum(x % 2 == 0 for x in result)
    return sorted(result) == sorted(nums) and all(x % 2 == 0 for x in result[:split]) and all(x % 2 == 1 for x in result[split:])`,
  c: `

bool parityCheck(int *nums, int numsSize) {
    int *copy = malloc(numsSize * sizeof(int));
    memcpy(copy, nums, numsSize * sizeof(int));
    int outSize = 0;
    int *result = sortArrayByParity(copy, numsSize, &outSize);
    int count[5001] = {0};
    bool good = outSize == numsSize;
    bool oddSeen = false;
    for (int i = 0; i < numsSize; i++) {
        count[nums[i]]++;
    }
    for (int i = 0; i < outSize; i++) {
        count[result[i]]--;
        if (result[i] % 2) {
            oddSeen = true;
        } else if (oddSeen) {
            good = false;
        }
    }
    for (int i = 0; i <= 5000; i++) {
        if (count[i] != 0) {
            good = false;
        }
    }
    if (result != copy) {
        free(result);
    }
    free(copy);
    return good;
}`,
  cpp: `

bool parityCheck(vector<int> nums) {
    vector<int> result = sortArrayByParity(nums);
    bool oddSeen = false;
    for (int x : result) {
        if (x % 2) {
            oddSeen = true;
        } else if (oddSeen) {
            return false;
        }
    }
    sort(nums.begin(), nums.end());
    sort(result.begin(), result.end());
    return nums == result;
}`,
  java: `

boolean parityCheck(int[] nums) {
    int[] result = sortArrayByParity(nums.clone());
    boolean oddSeen = false;
    for (int x : result) {
        if (x % 2 != 0) {
            oddSeen = true;
        } else if (oddSeen) {
            return false;
        }
    }
    int[] original = nums.clone();
    Arrays.sort(original);
    Arrays.sort(result);
    return Arrays.equals(original, result);
}`,
  javascript: `

function parityCheck(nums) {
  const result = sortArrayByParity([...nums]);
  let oddSeen = false;
  for (const x of result) {
    if (x % 2 !== 0) {
      oddSeen = true;
    } else if (oddSeen) {
      return false;
    }
  }
  const ordered = (values) => [...values].sort((a, b) => a - b);
  return JSON.stringify(ordered(nums)) === JSON.stringify(ordered(result));
}`,
}

export const q0905: Solution = {
  id: 905,
  plain: '把偶數搬到前面、奇數搬到後面；同一類別內的順序沒有限制。',
  statement: '給整數陣列 nums，回傳任一個重排結果，使全部偶數都位於全部奇數之前。',
  examples: [
    { input: 'nums = [3,1,2,4]', output: '[2,4,3,1]', note: '[4,2,1,3] 等排列也正確。' },
    { input: 'nums = [0]', output: '[0]' },
  ],
  constraints: ['1 ≤ nums.length ≤ 5000；0 ≤ nums[i] ≤ 5000。'],
  insight: ['只需按奇偶分組，不必依數值大小排序。', '可以另建結果陣列，也可以從兩端找放錯類別的數並交換。'],
  approaches: [
    {
      name: '分兩趟收集',
      idea: '先收集偶數，再收集奇數；各類別保留原本的先後順序。',
      steps: ['建立空結果。', '第一趟逐一加入偶數。', '第二趟逐一加入奇數。', '回傳結果。'],
      figure: { title: 'nums = [3,1,2,4]', steps: [
        { note: '第一趟略過 3、1，因為它們是奇數。', views: [arr(A, { dim: [0, 1], highlight: [2] })] },
        { note: '依序收集 2、4，結果暫時是 [2,4]。', views: [arr([2, 4], { label: '已收集偶數', done: [0, 1] })] },
        { note: '第二趟回到開頭，依序讀到奇數 3、1。', views: [arr(A, { highlight: [0, 1], done: [2, 3] })] },
        { note: '把 3、1 接在後面，得到 [2,4,3,1]。', views: [arr([2, 4, 3, 1], { label: '結果', done: [0, 1, 2, 3] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '掃兩趟，結果陣列長度為 n。' },
      verdict: '容易閱讀，且輸出對同類別保持穩定。',
      code: {
        python: `def sortArrayByParity(nums):
    result = []
    for x in nums:
        if x % 2 == 0:
            result.append(x)  # 偶數先進結果
    for x in nums:
        if x % 2 == 1:
            result.append(x)
    return result${CHECK.python}`,
        c: `int *sortArrayByParity(int *nums, int numsSize, int *returnSize) {
    int *result = malloc(numsSize * sizeof(int));
    int at = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] % 2 == 0) {
            result[at++] = nums[i];
        }
    }
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] % 2 != 0) {
            result[at++] = nums[i];
        }
    }
    *returnSize = numsSize;
    return result;
}${CHECK.c}`,
        cpp: `vector<int> sortArrayByParity(vector<int>& nums) {
    vector<int> result;
    for (int x : nums) {
        if (x % 2 == 0) {
            result.push_back(x);
        }
    }
    for (int x : nums) {
        if (x % 2 != 0) {
            result.push_back(x);
        }
    }
    return result;
}${CHECK.cpp}`,
        java: `int[] sortArrayByParity(int[] nums) {
    int[] result = new int[nums.length];
    int at = 0;
    for (int x : nums) {
        if (x % 2 == 0) {
            result[at++] = x;
        }
    }
    for (int x : nums) {
        if (x % 2 != 0) {
            result[at++] = x;
        }
    }
    return result;
}${CHECK.java}`,
        javascript: `function sortArrayByParity(nums) {
  const result = [];
  for (const x of nums) {
    if (x % 2 === 0) {
      result.push(x);
    }
  }
  for (const x of nums) {
    if (x % 2 !== 0) {
      result.push(x);
    }
  }
  return result;
}${CHECK.javascript}`,
      },
    },
    {
      name: '兩端指標原地交換',
      idea: '左指標找奇數、右指標找偶數，交換這兩個放錯位置的值。',
      steps: ['left 指向開頭，right 指向結尾。', 'left 略過偶數；right 略過奇數。', '若還沒交會，交換兩處並讓指標往中間移。', '交會後回傳陣列。'],
      figure: { title: 'nums = [3,1,2,4]', steps: [
        { note: '左邊 3 是奇數，右邊 4 是偶數；兩者都放錯側。', views: [arr(A, { highlight: [0], compare: [3] })] },
        { note: '交換後得到 [4,1,2,3]，兩端已正確。', views: [arr([4, 1, 2, 3], { done: [0, 3] })] },
        { note: '內側 1 與 2 仍放錯，交換它們。', views: [arr([4, 1, 2, 3], { done: [0, 3], highlight: [1], compare: [2] })] },
        { note: '得到 [4,2,1,3]；偶數都在奇數前，指標交會。', views: [arr([4, 2, 1, 3], { done: [0, 1, 2, 3] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩端指標各只走過陣列一次，直接修改輸入。' },
      verdict: '省額外空間；類別內順序可能改變，題目允許。',
      code: {
        python: `def sortArrayByParity(nums):
    left, right = 0, len(nums) - 1
    while left < right:
        while left < right and nums[left] % 2 == 0:
            left += 1
        while left < right and nums[right] % 2 == 1:
            right -= 1
        if left < right:
            nums[left], nums[right] = nums[right], nums[left]  # 兩端歸位
            left += 1
            right -= 1
    return nums${CHECK.python}`,
        c: `int *sortArrayByParity(int *nums, int numsSize, int *returnSize) {
    int left = 0;
    int right = numsSize - 1;
    while (left < right) {
        while (left < right && nums[left] % 2 == 0) {
            left++;
        }
        while (left < right && nums[right] % 2 != 0) {
            right--;
        }
        if (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
    }
    *returnSize = numsSize;
    return nums;
}${CHECK.c}`,
        cpp: `vector<int> sortArrayByParity(vector<int>& nums) {
    int left = 0;
    int right = (int)nums.size() - 1;
    while (left < right) {
        while (left < right && nums[left] % 2 == 0) {
            left++;
        }
        while (left < right && nums[right] % 2 != 0) {
            right--;
        }
        if (left < right) {
            swap(nums[left], nums[right]);
            left++;
            right--;
        }
    }
    return nums;
}${CHECK.cpp}`,
        java: `int[] sortArrayByParity(int[] nums) {
    int left = 0;
    int right = nums.length - 1;
    while (left < right) {
        while (left < right && nums[left] % 2 == 0) {
            left++;
        }
        while (left < right && nums[right] % 2 != 0) {
            right--;
        }
        if (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
    }
    return nums;
}${CHECK.java}`,
        javascript: `function sortArrayByParity(nums) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    while (left < right && nums[left] % 2 === 0) {
      left++;
    }
    while (left < right && nums[right] % 2 !== 0) {
      right--;
    }
    if (left < right) {
      [nums[left], nums[right]] = [nums[right], nums[left]];
      left++;
      right--;
    }
  }
  return nums;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['不要求依數值大小排序，只要求偶數都在奇數前。', '答案不唯一，驗證時必須檢查元素沒有遺失且奇偶分界正確。'],
  check: { kind: 'fn', fn: 'parityCheck', cases: [
    { args: [A], out: true },
    { args: [[0]], out: true },
    { args: [[2, 4, 6, 1, 3]], out: true },
    { args: [[1, 3, 5]], out: true },
  ] },
}
