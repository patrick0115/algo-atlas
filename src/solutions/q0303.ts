import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 303. Range Sum Query - Immutable

const A = [-2, 0, 3, -5, 2, -1]

function bruteFig(): FigStep[] {
  return [
    { note: '最直接:每次查詢 sumRange(l, r) 就把 nums[l..r] 加一遍', views: [arr(A, { label: 'nums', range: [0, 2] })] },
    { note: 'sumRange(2, 5) = 3 + (−5) + 2 + (−1) = −1。每次查詢 O(n);查詢 10⁴ 次、n = 10⁴ 時要 10⁸ 次加法', views: [arr(A, { label: 'nums', range: [2, 5], highlight: [2, 3, 4, 5] })] },
  ]
}

function prefixFig(): FigStep[] {
  const pre = [0]
  for (const x of A) pre.push(pre[pre.length - 1] + x)
  return [
    { note: '建構時先算前綴和:pre[i] = nums[0] + … + nums[i−1](pre[0] = 0,多一格是為了不用處理 l = 0 的特例)', views: [arr(A, { label: 'nums' }), arr(pre, { label: 'pre(長度 n+1)' })] },
    { note: `sumRange(2, 5) = pre[6] − pre[2] = ${pre[6]} − ${pre[2]} = ${pre[6] - pre[2]}:「前 6 個的和」減掉「前 2 個的和」,剩下的就是 2..5`, views: [arr(pre, { label: 'pre', highlight: [6], compare: [2] }), arr(A, { label: 'nums', range: [2, 5] })] },
    { note: `sumRange(0, 2) = pre[3] − pre[0] = ${pre[3]} − 0 = ${pre[3]}。每次查詢只要一次減法`, views: [arr(pre, { label: 'pre', highlight: [3], compare: [0] })] },
  ]
}

export const q0303: Solution = {
  id: 303,
  plain: '一排數字固定不變,會被問很多次「第 l 個到第 r 個加起來是多少」。怎麼讓每次都秒答?先把「從頭加到每個位置」的累計記下來,任何一段的和都是兩個累計相減。',
  statement: '設計類別 `NumArray`:建構子接收整數陣列 `nums`(之後不會修改);`sumRange(left, right)` 回傳 `nums[left..right]`(含兩端)的總和。',
  examples: [
    { input: '["NumArray","sumRange","sumRange","sumRange"]\n[[[-2,0,3,-5,2,-1]],[0,2],[2,5],[0,5]]', output: '[null,1,-1,-3]' },
  ],
  constraints: ['n ≤ 10⁴', 'sumRange 最多呼叫 10⁴ 次'],
  insight: ['陣列不會變、查詢很多次 → 先花 O(n) 預處理,讓每次查詢 O(1)', '前綴和 `pre[i]` = 前 i 個的總和;區間和 = `pre[r+1] − pre[l]`', '`pre` 多開一格(pre[0] = 0),l = 0 時就不用特判'],
  approaches: [
    {
      name: '每次查詢直接加',
      idea: '存下 nums;`sumRange` 用迴圈加 `nums[l..r]`。',
      steps: ['建構子存 nums', '`sumRange(l, r)`:`return sum(nums[l : r + 1])`'],
      figure: { title: `nums = [${A}]`, steps: bruteFig() },
      complexity: { time: '建構 O(1),查詢 O(n)', space: 'O(1)', why: '沒有預處理。' },
      verdict: '查詢少的時候可以,題目的重點是讓查詢變快。',
      code: {
        python: `class NumArray:
    def __init__(self, nums):
        self.nums = nums

    def sumRange(self, left, right):
        return sum(self.nums[left:right + 1])`,
        c: `typedef struct {
    int *a;
    int n;
} NumArray;

NumArray *numArrayCreate(int *nums, int numsSize) {
    NumArray *o = malloc(sizeof(NumArray));
    o->a = malloc(numsSize * sizeof(int));
    memcpy(o->a, nums, numsSize * sizeof(int));
    o->n = numsSize;
    return o;
}

int numArraySumRange(NumArray *o, int left, int right) {
    int s = 0;
    for (int i = left; i <= right; i++) s += o->a[i];
    return s;
}

void numArrayFree(NumArray *o) { free(o->a); free(o); }`,
        cpp: `class NumArray {
    vector<int> a;
public:
    NumArray(vector<int>& nums) : a(nums) {}
    int sumRange(int left, int right) {
        return accumulate(a.begin() + left, a.begin() + right + 1, 0);
    }
};`,
        java: `class NumArray {
    private final int[] a;

    public NumArray(int[] nums) { a = nums.clone(); }

    public int sumRange(int left, int right) {
        int s = 0;
        for (int i = left; i <= right; i++) s += a[i];
        return s;
    }
}`,
        javascript: `class NumArray {
  constructor(nums) {
    this.a = [...nums];
  }

  sumRange(left, right) {
    let s = 0;
    for (let i = left; i <= right; i++) s += this.a[i];
    return s;
  }
}`,
      },
    },
    {
      name: '前綴和',
      idea: '`pre[i+1] = pre[i] + nums[i]`;`sumRange(l, r) = pre[r+1] − pre[l]`。',
      steps: ['`pre = [0] * (n + 1)`', '`pre[i + 1] = pre[i] + nums[i]`', '`sumRange(l, r)`:`return pre[r + 1] − pre[l]`'],
      figure: { title: `nums = [${A}]`, steps: prefixFig() },
      complexity: { time: '建構 O(n),查詢 O(1)', space: 'O(n)', why: '多一個長度 n+1 的前綴和陣列。' },
      verdict: '最推薦,[[p:prefix-sum]]的入門題。陣列會被修改時要改用樹狀陣列或線段樹(307 題)。',
      code: {
        python: `class NumArray:
    def __init__(self, nums):
        self.pre = [0]
        for x in nums:
            self.pre.append(self.pre[-1] + x)   # pre[i] = 前 i 個的和

    def sumRange(self, left, right):
        return self.pre[right + 1] - self.pre[left]`,
        c: `typedef struct {
    int *pre;
} NumArray;

NumArray *numArrayCreate(int *nums, int numsSize) {
    NumArray *o = malloc(sizeof(NumArray));
    o->pre = malloc((numsSize + 1) * sizeof(int));
    o->pre[0] = 0;
    for (int i = 0; i < numsSize; i++) o->pre[i + 1] = o->pre[i] + nums[i];
    return o;
}

int numArraySumRange(NumArray *o, int left, int right) { return o->pre[right + 1] - o->pre[left]; }

void numArrayFree(NumArray *o) { free(o->pre); free(o); }`,
        cpp: `class NumArray {
    vector<int> pre;
public:
    NumArray(vector<int>& nums) : pre(nums.size() + 1, 0) {
        for (size_t i = 0; i < nums.size(); i++) pre[i + 1] = pre[i] + nums[i];
    }
    int sumRange(int left, int right) { return pre[right + 1] - pre[left]; }
};`,
        java: `class NumArray {
    private final int[] pre;

    public NumArray(int[] nums) {
        pre = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) pre[i + 1] = pre[i] + nums[i];
    }

    public int sumRange(int left, int right) { return pre[right + 1] - pre[left]; }
}`,
        javascript: `class NumArray {
  constructor(nums) {
    this.pre = [0];
    for (const x of nums) this.pre.push(this.pre[this.pre.length - 1] + x);
  }

  sumRange(left, right) {
    return this.pre[right + 1] - this.pre[left];
  }
}`,
      },
    },
  ],
  pitfalls: ['`pre[r] − pre[l]`(差一):要的是 `pre[r + 1] − pre[l]`', 'pre 不多開一格,l = 0 時要寫 `pre[l − 1]` 的特例'],
  check: {
    kind: 'class',
    cls: 'NumArray',
    cases: [
      { ops: ['NumArray', 'sumRange', 'sumRange', 'sumRange'], args: [[A], [0, 2], [2, 5], [0, 5]], out: [null, 1, -1, -3] },
      { ops: ['NumArray', 'sumRange', 'sumRange'], args: [[[7]], [0, 0], [0, 0]], out: [null, 7, 7] },
    ],
  },
}
