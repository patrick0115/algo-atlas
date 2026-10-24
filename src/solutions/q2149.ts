import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [3, 1, -2, -5, 2, -4]

export const q2149: Solution = {
  id: 2149,
  plain: '把正數、負數交錯排，第一個放正數；同號數字原本的先後順序不能改。',
  statement: '給正負數各占一半、沒有 0 的陣列 nums，回傳正負交錯、從正數開始，且各自保留原相對順序的新陣列。',
  examples: [{ input: 'nums = [3,1,-2,-5,2,-4]', output: '[3,-2,1,-5,2,-4]' }],
  constraints: ['2 ≤ nums.length ≤ 2×10⁵；正數與負數數量相同。'],
  insight: ['答案的偶數位置全是正數，奇數位置全是負數。', '各自從左到右取出，就能保持原相對順序。'],
  approaches: [
    {
      name: '兩個寫入指標',
      idea: '正數從答案索引 0 開始填，負數從索引 1 開始填，各自每次跳兩格。',
      steps: ['建立與 nums 同長度的答案陣列', '正數指標設為 0，負數指標設為 1', '逐個讀 nums，按正負填到對應指標', '該指標加 2'],
      figure: { title: 'nums = [3,1,-2,-5,2,-4]', steps: [
        { note: '讀 3、1，依原順序填入偶數位置 0、2。', views: [arr([3, '·', 1, '·', '·', '·'], { label: '答案', highlight: [0, 2] })] },
        { note: '讀 −2、−5，依原順序填入奇數位置 1、3。', views: [arr([3, -2, 1, -5, '·', '·'], { label: '答案', highlight: [1, 3] })] },
        { note: '讀到 2，填入下一個偶數位置 4。', views: [arr([3, -2, 1, -5, 2, '·'], { label: '答案', highlight: [4] })] },
        { note: '最後 −4 放在位置 5，正負交錯且各自順序不變。', views: [arr([3, -2, 1, -5, 2, -4], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '掃描一次，建立一個答案陣列。' },
      verdict: '最簡單也最有效率。',
      code: {
        python: `def rearrangeArray(nums):
    answer = [0] * len(nums)
    positive = 0
    negative = 1
    for value in nums:
        if value > 0:
            answer[positive] = value  # 正數填偶數位
            positive += 2
        else:
            answer[negative] = value  # 負數填奇數位
            negative += 2
    return answer`,
        c: `int *rearrangeArray(int *nums, int numsSize, int *returnSize) {
    int *answer = malloc(numsSize * sizeof(int));
    int positive = 0;
    int negative = 1;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > 0) {
            answer[positive] = nums[i];
            positive += 2;
        } else {
            answer[negative] = nums[i];
            negative += 2;
        }
    }
    *returnSize = numsSize;
    return answer;
}`,
        cpp: `vector<int> rearrangeArray(vector<int>& nums) {
    vector<int> answer(nums.size());
    int positive = 0;
    int negative = 1;
    for (int value : nums) {
        if (value > 0) {
            answer[positive] = value;
            positive += 2;
        } else {
            answer[negative] = value;
            negative += 2;
        }
    }
    return answer;
}`,
        java: `int[] rearrangeArray(int[] nums) {
    int[] answer = new int[nums.length];
    int positive = 0;
    int negative = 1;
    for (int value : nums) {
        if (value > 0) {
            answer[positive] = value;
            positive += 2;
        } else {
            answer[negative] = value;
            negative += 2;
        }
    }
    return answer;
}`,
        javascript: `function rearrangeArray(nums) {
  const answer = new Array(nums.length);
  let positive = 0;
  let negative = 1;
  for (const value of nums) {
    if (value > 0) {
      answer[positive] = value;
      positive += 2;
    } else {
      answer[negative] = value;
      negative += 2;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '先分兩組再交錯',
      idea: '把正負數分別放進兩個清單，最後輪流取出。',
      steps: ['掃描 nums，正數加入 positives，負數加入 negatives', '建立答案清單', '對每個索引 i，依序加入 positives[i]、negatives[i]', '回傳答案'],
      figure: { title: 'nums = [3,1,-2,-5,2,-4]', steps: [
        { note: '掃描後，正數清單是 [3,1,2]。', views: [arr([3, 1, 2], { label: '正數' })] },
        { note: '負數清單是 [−2,−5,−4]；兩組都保留了原順序。', views: [arr([-2, -5, -4], { label: '負數' })] },
        { note: '各取第一、第二個，先形成 [3,−2,1,−5]。', views: [arr([3, -2, 1, -5], { label: '已交錯', highlight: [0, 1, 2, 3] })] },
        { note: '再取第三個 2、−4，答案完成。', views: [arr([3, -2, 1, -5, 2, -4], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '分組與結果都需要線性空間。' },
      verdict: '步驟清楚，適合先理解保序交錯。',
      code: {
        python: `def rearrangeArray(nums):
    positives = []
    negatives = []
    for value in nums:
        if value > 0:
            positives.append(value)
        else:
            negatives.append(value)
    answer = []
    for i in range(len(positives)):
        answer.append(positives[i])  # 每輪正數先放
        answer.append(negatives[i])
    return answer`,
        c: `int *rearrangeArray(int *nums, int numsSize, int *returnSize) {
    int half = numsSize / 2;
    int *positives = malloc(half * sizeof(int));
    int *negatives = malloc(half * sizeof(int));
    int *answer = malloc(numsSize * sizeof(int));
    int p = 0;
    int q = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] > 0) {
            positives[p++] = nums[i];
        } else {
            negatives[q++] = nums[i];
        }
    }
    for (int i = 0; i < half; i++) {
        answer[2 * i] = positives[i];
        answer[2 * i + 1] = negatives[i];
    }
    free(positives);
    free(negatives);
    *returnSize = numsSize;
    return answer;
}`,
        cpp: `vector<int> rearrangeArray(vector<int>& nums) {
    vector<int> positives;
    vector<int> negatives;
    for (int value : nums) {
        if (value > 0) {
            positives.push_back(value);
        } else {
            negatives.push_back(value);
        }
    }
    vector<int> answer;
    for (int i = 0; i < (int)positives.size(); i++) {
        answer.push_back(positives[i]);
        answer.push_back(negatives[i]);
    }
    return answer;
}`,
        java: `int[] rearrangeArray(int[] nums) {
    List<Integer> positives = new ArrayList<>();
    List<Integer> negatives = new ArrayList<>();
    for (int value : nums) {
        if (value > 0) {
            positives.add(value);
        } else {
            negatives.add(value);
        }
    }
    int[] answer = new int[nums.length];
    for (int i = 0; i < positives.size(); i++) {
        answer[2 * i] = positives.get(i);
        answer[2 * i + 1] = negatives.get(i);
    }
    return answer;
}`,
        javascript: `function rearrangeArray(nums) {
  const positives = [];
  const negatives = [];
  for (const value of nums) {
    if (value > 0) {
      positives.push(value);
    } else {
      negatives.push(value);
    }
  }
  const answer = [];
  for (let i = 0; i < positives.length; i++) {
    answer.push(positives[i]);
    answer.push(negatives[i]);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['不能排序正負數，否則會破壞相同符號的原順序。', '題目保證正負數一樣多，且 0 不會出現。'],
  check: { kind: 'fn', fn: 'rearrangeArray', cases: [
    { args: [A], out: [3, -2, 1, -5, 2, -4] },
    { args: [[-1, 1]], out: [1, -1] },
    { args: [[1, 2, -1, -2]], out: [1, -1, 2, -2] },
  ] },
}
