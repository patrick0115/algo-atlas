import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1389. Create Target Array in the Given Order

export const q1389: Solution = {
  id: 1389,
  plain: '按順序把 `nums` 的每個數塞進結果陣列的指定位置,塞進去時後面的數往右讓一格,就像插隊。',
  statement: '給 `nums` 和同長度的 `index`。依序 `i = 0,1,2,...`,把 `nums[i]` 插入 `target` 的第 `index[i]` 個位置(原本在那位置和後面的都往右移一格)。回傳最後的 `target`。',
  examples: [
    { input: 'nums = [0,1,2,3,4], index = [0,1,2,2,1]', output: '[0,4,1,3,2]' },
    { input: 'nums = [1,2,3,4,0], index = [0,1,2,3,0]', output: '[0,1,2,3,4]' },
  ],
  constraints: ['1 ≤ nums.length, index.length ≤ 100', '0 ≤ index[i] ≤ i:插入位置一定落在目前長度範圍內,不會留空洞'],
  insight: [
    '就是照順序做「插隊」:在 index[i] 插入,後面整段往右挪',
    '`index[i] ≤ i` 保證每次插入位置都合法,target 不會有破洞',
    '語言內建的 `splice` / `insert` 直接表達這件事;想看清楚機制就自己挪',
  ],
  approaches: [
    {
      name: 'splice 依序插入',
      idea: '照順序呼叫 `target.splice(index[i], 0, nums[i])`,插入後面自動往右移,寫起來最短。',
      steps: [
        '`target = []`',
        '`for i in 0..n-1`:`target.splice(index[i], 0, nums[i])`',
        '回傳 `target`',
      ],
      figure: {
        title: 'nums = [0,1,2,3,4], index = [0,1,2,2,1]',
        steps: [
          {
            note: 'i=0:在位置 0 插入 0 → [0]',
            line: 4,
            views: [arr([0], { label: 'target', highlight: [0] })],
          },
          {
            note: 'i=1:在位置 1 插入 1 → [0,1];i=2:在位置 2 插入 2 → [0,1,2]',
            line: 4,
            views: [arr([0, 1, 2], { label: 'target', highlight: [2] })],
          },
          {
            note: 'i=3:在位置 2 插入 3,原本的 2 往右讓一格 → [0,1,3,2]',
            line: 4,
            views: [arr([0, 1, 3, 2], { label: 'target', highlight: [2], compare: [3] })],
          },
          {
            note: 'i=4:在位置 1 插入 4,後面整段往右 → [0,4,1,3,2]',
            line: 4,
            views: [arr([0, 4, 1, 3, 2], { label: 'target', highlight: [1], compare: [2, 3, 4] })],
          },
        ],
      },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每次 splice 最壞要搬動 O(n) 個元素,共 n 次。' },
      verdict: '最短最直覺的 [[p:simulation]];本質是一次次的 [[p:insertion-sort]] 插入。',
      code: {
        python: `def createTargetArray(nums, index):
    target = []
    for i in range(len(nums)):
        target.insert(index[i], nums[i])
    return target`,
        c: `int* createTargetArray(int* nums, int numsSize, int* index, int indexSize, int* returnSize) {
    int* target = malloc(numsSize * sizeof(int));
    int len = 0;
    for (int i = 0; i < numsSize; i++) {
        for (int k = len; k > index[i]; k--) target[k] = target[k - 1];
        target[index[i]] = nums[i];
        len++;
    }
    *returnSize = len;
    return target;
}`,
        cpp: `vector<int> createTargetArray(vector<int>& nums, vector<int>& index) {
    vector<int> target;
    for (int i = 0; i < (int)nums.size(); i++)
        target.insert(target.begin() + index[i], nums[i]);
    return target;
}`,
        java: `int[] createTargetArray(int[] nums, int[] index) {
    List<Integer> target = new ArrayList<>();
    for (int i = 0; i < nums.length; i++)
        target.add(index[i], nums[i]);
    int[] res = new int[target.size()];
    for (int i = 0; i < res.length; i++) res[i] = target.get(i);
    return res;
}`,
        javascript: `function createTargetArray(nums, index) {
  const target = [];
  for (let i = 0; i < nums.length; i++) {
    target.splice(index[i], 0, nums[i]);
  }
  return target;
}`,
      },
    },
    {
      name: '固定陣列手動挪位',
      idea: '先開好長度 n 的陣列;每放一個就自己把 `index[i]` 起的元素往右搬一格,再把 `nums[i]` 寫進去,看清楚「後面讓位」是怎麼發生的。',
      steps: [
        '`target = [None] * n`',
        '`for i`:`for k from i down to index[i]+1`:`target[k] = target[k-1]`(往右搬)',
        '`target[index[i]] = nums[i]`',
        '回傳 `target`',
      ],
      figure: {
        title: 'nums = [0,1,2,3,4], index = [0,1,2,2,1]',
        steps: [
          {
            note: '前三步 index 都等於 i,不用搬,直接填 → [0,1,2]',
            line: 7,
            views: [arr([0, 1, 2], { label: 'target', done: [0, 1, 2] })],
          },
          {
            note: 'i=3,index 2:先把第 2 格的 2 搬到第 3 格,再把 3 寫進第 2 格 → [0,1,3,2]',
            line: 6,
            views: [arr([0, 1, 3, 2], { label: 'target', highlight: [2], compare: [3] })],
          },
          {
            note: 'i=4,index 1:第 2~4 格整段往右搬一格,再把 4 寫進第 1 格 → [0,4,1,3,2]',
            line: 7,
            views: [arr([0, 4, 1, 3, 2], { label: 'target', highlight: [1], compare: [2, 3, 4] })],
          },
        ],
      },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每次插入最壞搬動 O(n) 格,共 n 次;和 splice 同階,只是手動。' },
      verdict: '想不靠內建函式、看清「往右挪」機制時用這個 [[p:simulation]] 寫法。',
      code: {
        python: `def createTargetArray(nums, index):
    n = len(nums)
    target = [0] * n
    for i in range(n):
        for k in range(i, index[i], -1):
            target[k] = target[k - 1]
        target[index[i]] = nums[i]
    return target`,
        c: `int* createTargetArray(int* nums, int numsSize, int* index, int indexSize, int* returnSize) {
    int* target = malloc(numsSize * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int k = i; k > index[i]; k--) target[k] = target[k - 1];
        target[index[i]] = nums[i];
    }
    *returnSize = numsSize;
    return target;
}`,
        cpp: `vector<int> createTargetArray(vector<int>& nums, vector<int>& index) {
    int n = nums.size();
    vector<int> target(n);
    for (int i = 0; i < n; i++) {
        for (int k = i; k > index[i]; k--) target[k] = target[k - 1];
        target[index[i]] = nums[i];
    }
    return target;
}`,
        java: `int[] createTargetArray(int[] nums, int[] index) {
    int n = nums.length;
    int[] target = new int[n];
    for (int i = 0; i < n; i++) {
        for (int k = i; k > index[i]; k--) target[k] = target[k - 1];
        target[index[i]] = nums[i];
    }
    return target;
}`,
        javascript: `function createTargetArray(nums, index) {
  const n = nums.length;
  const target = new Array(n);
  for (let i = 0; i < n; i++) {
    for (let k = i; k > index[i]; k--) target[k] = target[k - 1];
    target[index[i]] = nums[i];
  }
  return target;
}`,
      },
    },
  ],
  pitfalls: [
    '插入會改變後面元素的位置,一定要「依序」處理,不能跳著做',
    '手動挪位要從右往左搬(`k` 由大到小),從左往右會把值覆蓋掉',
  ],
  check: {
    kind: 'fn',
    fn: 'createTargetArray',
    cases: [
      { args: [[0, 1, 2, 3, 4], [0, 1, 2, 2, 1]], out: [0, 4, 1, 3, 2] },
      { args: [[1, 2, 3, 4, 0], [0, 1, 2, 3, 0]], out: [0, 1, 2, 3, 4] },
      { args: [[1], [0]], out: [1] },
    ],
  },
}
