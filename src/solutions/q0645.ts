import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 2, 2, 4]

function countFig(): FigStep[] {
  return [
    { note: '數字本應恰好包含 1 到 4。先準備四個計數，開始時全是 0。', views: [arr(A, { label: 'nums' }), arr([0, 0, 0, 0], { label: '1 到 4 的次數' })] },
    { note: '讀到 1、2、2 後，2 的次數變為 2，因此 2 是重複數字。', views: [arr([1, 2, 0, 0], { label: '1 到 4 的次數', done: [1] })] },
    { note: '讀完 4，計數成為 1、2、0、1；3 的次數是 0，所以遺失的是 3。', views: [arr([1, 2, 0, 1], { label: '1 到 4 的次數', done: [1], highlight: [2] })] },
    { note: '依題目要求，答案順序是「重複、遺失」，所以回傳 [2,3]。', views: [arr([2, 3], { label: '答案', done: [0, 1] })] },
  ]
}

function markFig(): FigStep[] {
  return [
    { note: '值 x 應對應索引 x − 1；用該位置的正負號記錄是否看過 x。', views: [arr(A, { label: '原陣列' })] },
    { note: '讀到 1，就把索引 0 的值變負；第一次讀到 2，把索引 1 變負。', views: [arr([-1, -2, 2, 4], { label: '標記後', done: [0, 1] })] },
    { note: '再次讀到 2 時，索引 1 已經是負數，可知 2 重複。讀到 4 時再標記索引 3。', views: [arr([-1, -2, 2, -4], { label: '標記後', highlight: [1], done: [3] })] },
    { note: '最後索引 2 仍為正，表示 3 沒有出現，答案是 [2,3]。', views: [arr([-1, -2, 2, -4], { label: '未標記位置', highlight: [2] }), arr([2, 3], { label: '答案' })] },
  ]
}

export const q0645: Solution = {
  id: 645,
  plain: '原本應有 1 到 n 各一個數字，卻有一個數字寫了兩次、另一個完全漏掉；找出這兩個數字。',
  statement: '給長度為 n 的 nums，內容本應是 1 到 n 的排列，但一個數字重複、另一個缺席。回傳 [重複數字, 遺失數字]。',
  examples: [
    { input: 'nums = [1,2,2,4]', output: '[2,3]' },
    { input: 'nums = [1,1]', output: '[1,2]' },
  ],
  constraints: ['2 ≤ n ≤ 10⁴；恰好有一個重複與一個遺失的數字。'],
  insight: ['因為值的範圍就是 1 到 n，可以直接用值當計數索引。', '若允許暫時改動 nums，也可以把原陣列當成是否出現的記號表。'],
  approaches: [
    {
      name: '計數陣列',
      idea: '每個值出現幾次一目了然：次數 2 是重複值，次數 0 是缺少值。',
      steps: ['建立長度 n + 1 的零陣列。', '掃過 nums，將 count[x] 加一。', '掃 1 到 n，找出計數為 2 與 0 的數字。'],
      figure: { title: 'nums = [1,2,2,4]', steps: countFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩次線性掃描和一個計數陣列。' },
      verdict: '不改動輸入，初學者最容易檢查。',
      code: {
        python: `def findErrorNums(nums):
    counts = [0] * (len(nums) + 1)
    for value in nums:
        counts[value] += 1             # 值就是計數索引
    duplicate = missing = 0
    for value in range(1, len(nums) + 1):
        if counts[value] == 2:
            duplicate = value
        elif counts[value] == 0:
            missing = value
    return [duplicate, missing]`,
        c: `int *findErrorNums(int *nums, int numsSize, int *returnSize) {
    int *counts = calloc(numsSize + 1, sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        counts[nums[i]]++;
    }
    int *answer = malloc(2 * sizeof(int));
    for (int value = 1; value <= numsSize; value++) {
        if (counts[value] == 2) {
            answer[0] = value;
        } else if (counts[value] == 0) {
            answer[1] = value;
        }
    }
    free(counts);
    *returnSize = 2;
    return answer;
}`,
        cpp: `vector<int> findErrorNums(vector<int>& nums) {
    vector<int> counts(nums.size() + 1, 0);
    for (int value : nums) {
        counts[value]++;
    }
    vector<int> answer(2);
    for (int value = 1; value <= (int)nums.size(); value++) {
        if (counts[value] == 2) {
            answer[0] = value;
        } else if (counts[value] == 0) {
            answer[1] = value;
        }
    }
    return answer;
}`,
        java: `int[] findErrorNums(int[] nums) {
    int[] counts = new int[nums.length + 1];
    for (int value : nums) {
        counts[value]++;
    }
    int[] answer = new int[2];
    for (int value = 1; value <= nums.length; value++) {
        if (counts[value] == 2) {
            answer[0] = value;
        } else if (counts[value] == 0) {
            answer[1] = value;
        }
    }
    return answer;
}`,
        javascript: `function findErrorNums(nums) {
  const counts = new Array(nums.length + 1).fill(0);
  for (const value of nums) {
    counts[value]++;
  }
  const answer = [0, 0];
  for (let value = 1; value <= nums.length; value++) {
    if (counts[value] === 2) {
      answer[0] = value;
    } else if (counts[value] === 0) {
      answer[1] = value;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '原陣列正負標記',
      idea: '值 x 對應索引 x − 1；首次看到時把該位置變負，再看到負值表示重複。',
      steps: ['逐個讀取絕對值 x。', '若 nums[x − 1] 已為負，就找到重複值；否則取負來標記。', '最後仍為正的位置 i 表示缺少 i + 1。'],
      figure: { title: '用正負號標記 [1,2,2,4]', steps: markFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '使用輸入陣列儲存標記，只另存固定數量變數。' },
      verdict: '額外空間少，但會修改輸入；需要保留輸入時應使用計數法。',
      code: {
        python: `def findErrorNums(nums):
    duplicate = 0
    for number in nums:
        value = abs(number)             # 已標記的元素也要還原原值
        index = value - 1
        if nums[index] < 0:
            duplicate = value          # 第二次看見同一個值
        else:
            nums[index] = -nums[index]
    missing = 0
    for index, number in enumerate(nums):
        if number > 0:
            missing = index + 1
    return [duplicate, missing]`,
        c: `int *findErrorNums(int *nums, int numsSize, int *returnSize) {
    int duplicate = 0;
    for (int i = 0; i < numsSize; i++) {
        int value = abs(nums[i]);
        int index = value - 1;
        if (nums[index] < 0) {
            duplicate = value;
        } else {
            nums[index] = -nums[index];
        }
    }
    int *answer = malloc(2 * sizeof(int));
    answer[0] = duplicate;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > 0) {
            answer[1] = i + 1;
        }
    }
    *returnSize = 2;
    return answer;
}`,
        cpp: `vector<int> findErrorNums(vector<int>& nums) {
    int duplicate = 0;
    for (int number : nums) {
        int value = abs(number);
        int index = value - 1;
        if (nums[index] < 0) {
            duplicate = value;
        } else {
            nums[index] = -nums[index];
        }
    }
    int missing = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] > 0) {
            missing = i + 1;
        }
    }
    return {duplicate, missing};
}`,
        java: `int[] findErrorNums(int[] nums) {
    int duplicate = 0;
    for (int number : nums) {
        int value = Math.abs(number);
        int index = value - 1;
        if (nums[index] < 0) {
            duplicate = value;
        } else {
            nums[index] = -nums[index];
        }
    }
    int missing = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] > 0) {
            missing = i + 1;
        }
    }
    return new int[]{duplicate, missing};
}`,
        javascript: `function findErrorNums(nums) {
  let duplicate = 0;
  for (const number of nums) {
    const value = Math.abs(number);
    const index = value - 1;
    if (nums[index] < 0) {
      duplicate = value;
    } else {
      nums[index] = -nums[index];
    }
  }
  let missing = 0;
  for (let index = 0; index < nums.length; index++) {
    if (nums[index] > 0) {
      missing = index + 1;
    }
  }
  return [duplicate, missing];
}`,
      },
    },
  ],
  pitfalls: ['答案順序固定是 [重複, 遺失]。', '正負標記法要先對讀到的值取絕對值；它會改動輸入。'],
  check: {
    kind: 'fn',
    fn: 'findErrorNums',
    cases: [
      { args: [[1, 2, 2, 4]], out: [2, 3] },
      { args: [[1, 1]], out: [1, 2] },
      { args: [[2, 2]], out: [2, 1] },
    ],
  },
}
