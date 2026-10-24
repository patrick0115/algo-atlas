import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [8, 2, 4, 7]

function bruteFig(): FigStep[] {
  return [
    { note: '從索引 0 開始，單獨的 [8] 合法，長度先記為 1。', views: [arr(A, { label: 'nums', highlight: [0] }), arr([1], { label: '最長長度' })] },
    { note: '擴大成 [8,2]，最大值 8 與最小值 2 相差 6，大於 limit = 4，因此這段不合格。', views: [arr(A, { label: 'nums', highlight: [0, 1] }), arr([6], { label: '最大差' })] },
    { note: '改從索引 1 開始，[2,4] 的差是 2，合法且長度變成 2。', views: [arr(A, { label: 'nums', highlight: [1, 2] }), arr([2], { label: '最長長度', done: [0] })] },
    { note: '[2,4,7] 的差為 5，不合法；[4,7] 的差為 3，仍只長 2，所以答案是 2。', views: [arr(A, { label: 'nums', done: [2, 3] }), arr([2], { label: '答案', done: [0] })] },
  ]
}

function dequeFig(): FigStep[] {
  return [
    { note: '右端讀到 8：最大佇列與最小佇列都存索引 0，視窗是 [8]。', views: [arr(A, { label: '視窗', highlight: [0] }), arr([8], { label: '最大候選' }), arr([8], { label: '最小候選' })] },
    { note: '加入 2 後最大候選為 [8,2]、最小候選只剩 [2]；差 6 超標，把左端 8 移走。', views: [arr(A, { label: '加入 2', dim: [0], highlight: [1] }), arr([2], { label: '最大候選' }), arr([2], { label: '最小候選' })] },
    { note: '加入 4 得到視窗 [2,4]，最大 4、最小 2，差 2 合法，最長長度變成 2。', views: [arr(A, { label: '視窗', done: [1, 2] }), arr([4, 2], { label: '最大候選' }), arr([2, 4], { label: '最小候選' })] },
    { note: '加入 7 後差 7 − 2 = 5 超標，移走 2；剩下 [4,7] 的差是 3，答案仍為 2。', views: [arr(A, { label: '視窗', dim: [0, 1], done: [2, 3] }), arr([2], { label: '答案', done: [0] })] },
  ]
}

export const q1438: Solution = {
  id: 1438,
  plain: '找一段最長的連續數字，讓這段裡最大的數與最小的數相差不超過指定門檻。',
  statement: '給整數陣列 nums 與 limit，求最長連續子陣列長度，條件是子陣列最大值減最小值不大於 limit。',
  examples: [
    { input: 'nums = [8,2,4,7], limit = 4', output: '2' },
    { input: 'nums = [10,1,2,4,7,2], limit = 5', output: '4' },
  ],
  constraints: ['1 ≤ nums.length ≤ 10⁵；數值與 limit 非負。'],
  insight: ['固定左端後，往右擴張時可更新目前最大與最小；這給出容易理解的平方時間解法。', '若要線性時間，可用兩個單調佇列維護滑動視窗的最大、最小值。'],
  approaches: [
    {
      name: '枚舉左端並向右擴張',
      idea: '每次選一個起點，沿途更新這段的最大值與最小值。',
      steps: ['每個 left 都重新設定最大與最小。', '逐步增加 right 並更新兩者。', '若差值合格，更新最長長度。'],
      figure: { title: 'nums = [8,2,4,7]，limit = 4', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '共有 O(n²) 段，但每段只需固定數量的變數。' },
      verdict: '便於理解與驗證；長達 10⁵ 的輸入需要更快方法。',
      code: {
        python: `def longestSubarray(nums, limit):
    answer = 0
    for left in range(len(nums)):
        smallest = largest = nums[left]
        for right in range(left, len(nums)):
            smallest = min(smallest, nums[right])  # 擴張時更新極值
            largest = max(largest, nums[right])
            if largest - smallest <= limit:
                answer = max(answer, right - left + 1)
    return answer`,
        c: `int longestSubarray(int *nums, int numsSize, int limit) {
    int answer = 0;
    for (int left = 0; left < numsSize; left++) {
        int smallest = nums[left], largest = nums[left];
        for (int right = left; right < numsSize; right++) {
            if (nums[right] < smallest) {
                smallest = nums[right];
            }
            if (nums[right] > largest) {
                largest = nums[right];
            }
            if (largest - smallest <= limit && right - left + 1 > answer) {
                answer = right - left + 1;
            }
        }
    }
    return answer;
}`,
        cpp: `int longestSubarray(vector<int>& nums, int limit) {
    int answer = 0;
    for (int left = 0; left < (int)nums.size(); left++) {
        int smallest = nums[left], largest = nums[left];
        for (int right = left; right < (int)nums.size(); right++) {
            smallest = min(smallest, nums[right]);
            largest = max(largest, nums[right]);
            if (largest - smallest <= limit) {
                answer = max(answer, right - left + 1);
            }
        }
    }
    return answer;
}`,
        java: `int longestSubarray(int[] nums, int limit) {
    int answer = 0;
    for (int left = 0; left < nums.length; left++) {
        int smallest = nums[left], largest = nums[left];
        for (int right = left; right < nums.length; right++) {
            smallest = Math.min(smallest, nums[right]);
            largest = Math.max(largest, nums[right]);
            if (largest - smallest <= limit) {
                answer = Math.max(answer, right - left + 1);
            }
        }
    }
    return answer;
}`,
        javascript: `function longestSubarray(nums, limit) {
  let answer = 0;
  for (let left = 0; left < nums.length; left++) {
    let smallest = nums[left];
    let largest = nums[left];
    for (let right = left; right < nums.length; right++) {
      smallest = Math.min(smallest, nums[right]);
      largest = Math.max(largest, nums[right]);
      if (largest - smallest <= limit) {
        answer = Math.max(answer, right - left + 1);
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '滑動視窗與兩個單調佇列',
      idea: '最大佇列由大到小、最小佇列由小到大；隊首就是視窗的兩個極值。',
      steps: ['右端加入新值，從兩個佇列尾端移除被它淘汰的候選。', '若最大與最小相差超過 limit，就移動左端並丟棄離開視窗的隊首。', '每次視窗重新合法時更新長度。'],
      figure: { title: '用單調佇列維護 [8,2,4,7]', steps: dequeFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引在每個佇列最多進出一次。' },
      verdict: '適合大輸入；與 [[p:monotonic-queue]]、滑動視窗結合。',
      code: {
        python: `from collections import deque

def longestSubarray(nums, limit):
    maximum = deque()
    minimum = deque()
    left = answer = 0
    for right, value in enumerate(nums):
        while maximum and nums[maximum[-1]] < value:
            maximum.pop()             # 較小值不再可能是最大候選
        while minimum and nums[minimum[-1]] > value:
            minimum.pop()             # 較大值不再可能是最小候選
        maximum.append(right)
        minimum.append(right)
        while nums[maximum[0]] - nums[minimum[0]] > limit:
            if maximum[0] == left:
                maximum.popleft()
            if minimum[0] == left:
                minimum.popleft()
            left += 1                 # 縮到視窗重新合法
        answer = max(answer, right - left + 1)
    return answer`,
        c: `int longestSubarray(int *nums, int numsSize, int limit) {
    int *maximum = malloc(numsSize * sizeof(int));
    int *minimum = malloc(numsSize * sizeof(int));
    int maxFront = 0, maxBack = 0, minFront = 0, minBack = 0;
    int left = 0, answer = 0;
    for (int right = 0; right < numsSize; right++) {
        while (maxBack > maxFront && nums[maximum[maxBack - 1]] < nums[right]) {
            maxBack--;
        }
        while (minBack > minFront && nums[minimum[minBack - 1]] > nums[right]) {
            minBack--;
        }
        maximum[maxBack++] = right;
        minimum[minBack++] = right;
        while (nums[maximum[maxFront]] - nums[minimum[minFront]] > limit) {
            if (maximum[maxFront] == left) {
                maxFront++;
            }
            if (minimum[minFront] == left) {
                minFront++;
            }
            left++;
        }
        if (right - left + 1 > answer) {
            answer = right - left + 1;
        }
    }
    free(maximum);
    free(minimum);
    return answer;
}`,
        cpp: `int longestSubarray(vector<int>& nums, int limit) {
    deque<int> maximum, minimum;
    int left = 0, answer = 0;
    for (int right = 0; right < (int)nums.size(); right++) {
        while (!maximum.empty() && nums[maximum.back()] < nums[right]) {
            maximum.pop_back();
        }
        while (!minimum.empty() && nums[minimum.back()] > nums[right]) {
            minimum.pop_back();
        }
        maximum.push_back(right);
        minimum.push_back(right);
        while (nums[maximum.front()] - nums[minimum.front()] > limit) {
            if (maximum.front() == left) {
                maximum.pop_front();
            }
            if (minimum.front() == left) {
                minimum.pop_front();
            }
            left++;
        }
        answer = max(answer, right - left + 1);
    }
    return answer;
}`,
        java: `int longestSubarray(int[] nums, int limit) {
    Deque<Integer> maximum = new ArrayDeque<>();
    Deque<Integer> minimum = new ArrayDeque<>();
    int left = 0, answer = 0;
    for (int right = 0; right < nums.length; right++) {
        while (!maximum.isEmpty() && nums[maximum.peekLast()] < nums[right]) {
            maximum.pollLast();
        }
        while (!minimum.isEmpty() && nums[minimum.peekLast()] > nums[right]) {
            minimum.pollLast();
        }
        maximum.offerLast(right);
        minimum.offerLast(right);
        while (nums[maximum.peekFirst()] - nums[minimum.peekFirst()] > limit) {
            if (maximum.peekFirst() == left) {
                maximum.pollFirst();
            }
            if (minimum.peekFirst() == left) {
                minimum.pollFirst();
            }
            left++;
        }
        answer = Math.max(answer, right - left + 1);
    }
    return answer;
}`,
        javascript: `function longestSubarray(nums, limit) {
  const maximum = [];
  const minimum = [];
  let maxFront = 0;
  let minFront = 0;
  let left = 0;
  let answer = 0;
  for (let right = 0; right < nums.length; right++) {
    while (maximum.length > maxFront && nums[maximum[maximum.length - 1]] < nums[right]) {
      maximum.pop();
    }
    while (minimum.length > minFront && nums[minimum[minimum.length - 1]] > nums[right]) {
      minimum.pop();
    }
    maximum.push(right);
    minimum.push(right);
    while (nums[maximum[maxFront]] - nums[minimum[minFront]] > limit) {
      if (maximum[maxFront] === left) {
        maxFront++;
      }
      if (minimum[minFront] === left) {
        minFront++;
      }
      left++;
    }
    answer = Math.max(answer, right - left + 1);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['單調佇列要存索引，才能判斷隊首是否已離開視窗。', '最大值減最小值「等於」limit 時仍合法。'],
  check: {
    kind: 'fn',
    fn: 'longestSubarray',
    cases: [
      { args: [A, 4], out: 2 },
      { args: [[10, 1, 2, 4, 7, 2], 5], out: 4 },
      { args: [[4, 4, 4], 0], out: 3 },
    ],
  },
}
