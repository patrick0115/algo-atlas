import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

const A = [0, 1, 0, 1, 1]

function bruteFig(): FigStep[] {
  return [
    { note: '從索引 0 開始向右延伸；[0,1] 裡 0 和 1 各一個，長度 2。', views: [arr(A, { label: 'nums', highlight: [0, 1] })] },
    { note: '再延伸成 [0,1,0,1]，兩種值各兩個，最佳長度變成 4。', views: [arr(A, { label: 'nums', highlight: [0, 1, 2, 3] })] },
    { note: '延伸到最後一個 1 時，0 有 2 個、1 有 3 個，不能算；再試其他起點。', views: [arr(A, { label: 'nums', highlight: [0, 1, 2, 3, 4] })] },
    { note: '其他起點也沒有比 4 更長的平衡區間，回傳 4。', views: [arr([4], { label: '最長長度', done: [0] })] },
  ]
}

function prefixFig(): FigStep[] {
  return [
    { note: '把 0 看成 −1、1 看成 +1；累計和初始為 0，第一次出現位置記為 −1。', views: [kv([[0, -1]], '累計和 → 最早位置')] },
    { note: '讀 0 得 −1，記位置 0；讀 1 回到 0。相同累計和之間的總和是 0，長度 1−(−1)=2。', views: [kv([[0, -1], [-1, 0]], '累計和 → 最早位置'), arr(A, { label: 'nums', highlight: [0, 1] })] },
    { note: '再讀 0、1，累計和再次回到 0；最早位置仍是 −1，所以區間 [0..3] 長 4。', views: [arr(A, { label: '平衡區間', highlight: [0, 1, 2, 3] })] },
    { note: '最後讀 1 得累計和 1，第一次出現就記位置 4；答案維持 4。', views: [kv([[0, -1], [-1, 0], [1, 4]], '最早位置'), arr([4], { label: '答案', done: [0] })] },
  ]
}

export const q0525: Solution = {
  id: 525,
  plain: '找最長的連續區間，讓其中 0 的個數和 1 的個數一樣多。',
  statement: '給只含 0、1 的陣列 nums，回傳 0 與 1 數量相同的最長連續子陣列長度。',
  examples: [{ input: 'nums = [0,1]', output: '2' }, { input: 'nums = [0,1,0]', output: '2' }, { input: 'nums = [0,1,0,1,1]', output: '4' }],
  constraints: ['`1 ≤ nums.length ≤ 10⁵`', '每個元素是 0 或 1。'],
  insight: ['把 0 當成 −1、1 當成 +1；平衡區間的總和就是 0。', '兩個位置的 [[p:prefix-sum]] 相同，表示中間那段總和為 0。為取得最長長度，每種累計和只記最早位置。'],
  approaches: [
    {
      name: '列舉每段並計數',
      idea: '固定左端，右端逐格擴張，分別累計 0、1 的個數。',
      steps: ['對每個左端清空兩種計數。', '向右延伸，更新對應的個數。', '個數相等時更新最大長度。'],
      figure: { title: 'nums = [0,1,0,1,1]', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '共有 O(n²) 個連續區間，只需兩個計數器。' },
      verdict: '好理解，但長陣列會超時。',
      code: {
        python: `def findMaxLength(nums):
    answer = 0
    for left in range(len(nums)):
        zeros = ones = 0
        for right in range(left, len(nums)):
            if nums[right] == 0:
                zeros += 1
            else:
                ones += 1
            if zeros == ones:
                answer = max(answer, right - left + 1)
    return answer`,
        c: `int findMaxLength(int *nums, int numsSize) {
    int answer = 0;
    for (int left = 0; left < numsSize; left++) {
        int zeros = 0;
        int ones = 0;
        for (int right = left; right < numsSize; right++) {
            if (nums[right] == 0) {
                zeros++;
            } else {
                ones++;
            }
            if (zeros == ones && right - left + 1 > answer) {
                answer = right - left + 1;
            }
        }
    }
    return answer;
}`,
        cpp: `int findMaxLength(vector<int>& nums) {
    int answer = 0;
    for (int left = 0; left < (int)nums.size(); left++) {
        int zeros = 0;
        int ones = 0;
        for (int right = left; right < (int)nums.size(); right++) {
            if (nums[right] == 0) {
                zeros++;
            } else {
                ones++;
            }
            if (zeros == ones) {
                answer = max(answer, right - left + 1);
            }
        }
    }
    return answer;
}`,
        java: `int findMaxLength(int[] nums) {
    int answer = 0;
    for (int left = 0; left < nums.length; left++) {
        int zeros = 0;
        int ones = 0;
        for (int right = left; right < nums.length; right++) {
            if (nums[right] == 0) {
                zeros++;
            } else {
                ones++;
            }
            if (zeros == ones) {
                answer = Math.max(answer, right - left + 1);
            }
        }
    }
    return answer;
}`,
        javascript: `function findMaxLength(nums) {
  let answer = 0;
  for (let left = 0; left < nums.length; left++) {
    let zeros = 0;
    let ones = 0;
    for (let right = left; right < nums.length; right++) {
      if (nums[right] === 0) {
        zeros++;
      } else {
        ones++;
      }
      if (zeros === ones) {
        answer = Math.max(answer, right - left + 1);
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '累計和與最早位置',
      idea: '遇 0 扣 1、遇 1 加 1；若累計和之前出現過，兩次之間就是平衡區間。',
      steps: ['記 `first[0]=−1`，累計和為 0。', '逐格更新累計和。', '首次出現的和記下位置；再次出現就用目前位置減最早位置更新答案。'],
      figure: { title: 'nums = [0,1,0,1,1]', steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每格只處理一次，最多記下 2n+1 種累計和。' },
      verdict: '關鍵是保留最早位置，不要被後續相同的累計和覆蓋。',
      code: {
        python: `def findMaxLength(nums):
    first = {0: -1}  # 空前綴在索引 -1
    balance = 0
    answer = 0
    for i, value in enumerate(nums):
        balance += 1 if value == 1 else -1
        if balance in first:
            answer = max(answer, i - first[balance])
        else:
            first[balance] = i  # 只記最早出現位置
    return answer`,
        c: `int findMaxLength(int *nums, int numsSize) {
    int n = numsSize;
    int *first = malloc((2 * n + 1) * sizeof(int));
    for (int i = 0; i <= 2 * n; i++) {
        first[i] = -2;
    }
    int offset = n;
    first[offset] = -1;
    int balance = 0;
    int answer = 0;
    for (int i = 0; i < n; i++) {
        balance += nums[i] == 1 ? 1 : -1;
        int key = balance + offset;
        if (first[key] != -2) {
            if (i - first[key] > answer) {
                answer = i - first[key];
            }
        } else {
            first[key] = i;
        }
    }
    free(first);
    return answer;
}`,
        cpp: `int findMaxLength(vector<int>& nums) {
    unordered_map<int, int> first{{0, -1}};
    int balance = 0;
    int answer = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        balance += nums[i] == 1 ? 1 : -1;
        if (first.count(balance)) {
            answer = max(answer, i - first[balance]);
        } else {
            first[balance] = i;
        }
    }
    return answer;
}`,
        java: `int findMaxLength(int[] nums) {
    Map<Integer, Integer> first = new HashMap<>();
    first.put(0, -1);
    int balance = 0;
    int answer = 0;
    for (int i = 0; i < nums.length; i++) {
        balance += nums[i] == 1 ? 1 : -1;
        if (first.containsKey(balance)) {
            answer = Math.max(answer, i - first.get(balance));
        } else {
            first.put(balance, i);
        }
    }
    return answer;
}`,
        javascript: `function findMaxLength(nums) {
  const first = new Map([[0, -1]]);
  let balance = 0;
  let answer = 0;
  for (let i = 0; i < nums.length; i++) {
    balance += nums[i] === 1 ? 1 : -1;
    if (first.has(balance)) {
      answer = Math.max(answer, i - first.get(balance));
    } else {
      first.set(balance, i);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['先放 `first[0]=−1`，才能找到從索引 0 開始的平衡區間。', '累計和重複時不要更新最早位置，否則會錯過更長區間。'],
  check: { kind: 'fn', fn: 'findMaxLength', cases: [{ args: [[0, 1]], out: 2 }, { args: [[0, 1, 0]], out: 2 }, { args: [A], out: 4 }, { args: [[0, 0, 0]], out: 0 }] },
}
