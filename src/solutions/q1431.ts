import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const CANDIES = [2, 3, 5, 1, 3]

function maxFig(): FigStep[] {
  return [
    { note: '先看每個孩子的糖果數，原本最多的是第三位的 5 顆。', views: [arr(CANDIES, { label: '糖果數', done: [2] })] },
    { note: '第一位拿到額外 3 顆後變成 5，追平最高值，因此答案是 true。', views: [arr([5, 3, 5, 1, 3], { label: '只假設第一位獲得糖果', highlight: [0], compare: [2] })] },
    { note: '第二位得到 3 顆後是 6，大於 5，因此也是 true。', views: [arr([2, 6, 5, 1, 3], { label: '只假設第二位獲得糖果', highlight: [1], compare: [2] })] },
    { note: '依序檢查完五位，只有第四位的 1 + 3 = 4 不足 5。', views: [arr(['真', '真', '真', '假', '真'], { label: '答案', done: [0, 1, 2, 3, 4] })] },
  ]
}

function thresholdFig(): FigStep[] {
  return [
    { note: '原本最高是 5，額外有 3 顆；每位孩子原有至少 2 顆就能追平。', views: [arr([5, 3, 2], { label: '最高 / 額外 / 門檻', done: [2] })] },
    { note: '前兩位分別有 2、3 顆，都達到門檻，填入 true。', views: [arr(CANDIES, { label: '糖果數', done: [0, 1] })] },
    { note: '第三位 5 顆合格；第四位 1 顆不足門檻，填 false。', views: [arr(CANDIES, { label: '糖果數', done: [2], dim: [3] })] },
    { note: '最後一位 3 顆也合格，得到完整布林陣列。', views: [arr(['真', '真', '真', '假', '真'], { label: '答案', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q1431: Solution = {
  id: 1431,
  plain: '想像額外的糖果會輪流單獨送給每個孩子；判斷每人收到後能否成為糖果最多的人之一。',
  statement: '給 candies 和 extraCandies。對每個索引 i，假設只把 extraCandies 顆糖果給孩子 i，回傳他是否能擁有不少於任何其他孩子的糖果數。',
  examples: [
    { input: 'candies = [2,3,5,1,3], extraCandies = 3', output: '[true,true,true,false,true]' },
    { input: 'candies = [4,2,1,1,2], extraCandies = 1', output: '[true,false,false,false,false]' },
  ],
  constraints: ['孩子數 2 到 100，糖果數與額外糖果數皆為正整數。'],
  insight: ['每個孩子是假設單獨拿到額外糖果，不能把前一位假設的增加量留下來。', '只要和原本全體的最大值比較即可；追平也算最多。'],
  approaches: [
    {
      name: '先找最大值',
      idea: '先掃出目前最多的糖果數，然後依序檢查 candies[i] + extraCandies 是否達標。',
      steps: ['掃描 candies 找到最大值。', '對每位孩子計算他拿到額外糖果後的數量。', '若數量大於或等於最大值，就填 true。'],
      figure: { title: 'candies = [2,3,5,1,3]，extra = 3', steps: maxFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '掃兩次陣列；回傳陣列需要 n 個位置。' },
      verdict: '寫法最貼近題意。',
      code: {
        python: `def kidsWithCandies(candies, extraCandies):
    maximum = max(candies)                 # 原本最多的數量
    result = []
    for count in candies:
        result.append(count + extraCandies >= maximum)  # 追平也算
    return result`,
        c: `bool *kidsWithCandies(int *candies, int candiesSize, int extraCandies, int *returnSize) {
    int maximum = 0;
    for (int i = 0; i < candiesSize; i++) {
        if (candies[i] > maximum) {
            maximum = candies[i];
        }
    }
    bool *result = malloc(candiesSize * sizeof(bool));
    for (int i = 0; i < candiesSize; i++) {
        result[i] = candies[i] + extraCandies >= maximum;
    }
    *returnSize = candiesSize;
    return result;
}`,
        cpp: `vector<bool> kidsWithCandies(vector<int>& candies, int extraCandies) {
    int maximum = *max_element(candies.begin(), candies.end());
    vector<bool> result;
    for (int count : candies) {
        result.push_back(count + extraCandies >= maximum);
    }
    return result;
}`,
        java: `List<Boolean> kidsWithCandies(int[] candies, int extraCandies) {
    int maximum = 0;
    for (int count : candies) {
        maximum = Math.max(maximum, count);
    }
    List<Boolean> result = new ArrayList<>();
    for (int count : candies) {
        result.add(count + extraCandies >= maximum);
    }
    return result;
}`,
        javascript: `function kidsWithCandies(candies, extraCandies) {
  let maximum = 0;
  for (const count of candies) {
    maximum = Math.max(maximum, count);
  }
  const result = [];
  for (const count of candies) {
    result.push(count + extraCandies >= maximum);
  }
  return result;
}`,
      },
    },
    {
      name: '轉成門檻',
      idea: '將條件移項：原有糖果數至少是 maximum − extraCandies 就合格。',
      steps: ['找出目前的最大糖果數。', '計算門檻 maximum − extraCandies。', '逐一判斷每人的原有數量是否達到門檻。'],
      figure: { title: '同一範例，門檻 = 5 − 3 = 2', steps: thresholdFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '與前一法相同，只把比較式改寫。' },
      verdict: '適合需要重複查詢多位孩子時理解「至少要有多少顆」。',
      code: {
        python: `def kidsWithCandies(candies, extraCandies):
    threshold = max(candies) - extraCandies  # 先把額外糖果移到右邊
    result = []
    for count in candies:
        result.append(count >= threshold)
    return result`,
        c: `bool *kidsWithCandies(int *candies, int candiesSize, int extraCandies, int *returnSize) {
    int maximum = 0;
    for (int i = 0; i < candiesSize; i++) {
        if (candies[i] > maximum) {
            maximum = candies[i];
        }
    }
    int threshold = maximum - extraCandies;
    bool *result = malloc(candiesSize * sizeof(bool));
    for (int i = 0; i < candiesSize; i++) {
        result[i] = candies[i] >= threshold;
    }
    *returnSize = candiesSize;
    return result;
}`,
        cpp: `vector<bool> kidsWithCandies(vector<int>& candies, int extraCandies) {
    int threshold = *max_element(candies.begin(), candies.end()) - extraCandies;
    vector<bool> result;
    for (int count : candies) {
        result.push_back(count >= threshold);
    }
    return result;
}`,
        java: `List<Boolean> kidsWithCandies(int[] candies, int extraCandies) {
    int maximum = 0;
    for (int count : candies) {
        maximum = Math.max(maximum, count);
    }
    int threshold = maximum - extraCandies;
    List<Boolean> result = new ArrayList<>();
    for (int count : candies) {
        result.add(count >= threshold);
    }
    return result;
}`,
        javascript: `function kidsWithCandies(candies, extraCandies) {
  let maximum = 0;
  for (const count of candies) {
    maximum = Math.max(maximum, count);
  }
  const threshold = maximum - extraCandies;
  const result = [];
  for (const count of candies) {
    result.push(count >= threshold);
  }
  return result;
}`,
      },
    },
  ],
  pitfalls: ['用大於或等於比較；與別人並列第一也要回傳 true。', '每位孩子的測試彼此獨立，不修改原陣列。'],
  check: {
    kind: 'fn',
    fn: 'kidsWithCandies',
    cases: [
      { args: [[2, 3, 5, 1, 3], 3], out: [true, true, true, false, true] },
      { args: [[4, 2, 1, 1, 2], 1], out: [true, false, false, false, false] },
      { args: [[12, 1, 12], 10], out: [true, false, true] },
    ],
  },
}
