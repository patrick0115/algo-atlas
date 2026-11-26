import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1051. Height Checker

export const q1051: Solution = {
  id: 1051,
  plain: '同學排隊照身高從矮到高站好,老師想知道有幾個人站錯位置。把正確排法排出來,一個一個對,位置和現在不一樣的就算一個。',
  statement: '給一個陣列 `heights`,它應該要由矮到高(非遞減)排好。把它和「排好後的樣子」逐格比對,回傳有幾個位置的值不一樣。',
  examples: [
    { input: 'heights = [1,1,4,2,1,3]', output: '3', note: '排好是 `[1,1,1,2,3,4]`,第 2、4、5 格對不上' },
    { input: 'heights = [5,1,2,3,4]', output: '5' },
    { input: 'heights = [1,2,3,4,5]', output: '0', note: '本來就排好了' },
  ],
  constraints: ['1 ≤ heights.length ≤ 100', '1 ≤ heights[i] ≤ 100:值域很小,可以用計數排序'],
  insight: [
    '答案就是「原陣列」和「排序後的陣列」逐格比,有幾格不同',
    '身高只到 100,用 [[p:counting-sort]] 就能 O(n) 排好,不必 O(n log n)',
    '只是「數不同」,不用真的動原陣列',
  ],
  approaches: [
    {
      name: '計數排序',
      idea: '先數每個身高出現幾次,再從小到大「倒」出期望順序,倒出來的同時就跟原陣列對位比較。',
      steps: [
        '`count = [0] * 101`,掃一遍 `count[h] += 1`',
        '`idx = 0`,`for h in 1..100`:把 h 倒出 `count[h]` 次',
        '每倒一個,如果 `heights[idx] != h` 就 `ans += 1`,然後 `idx += 1`',
        '回傳 `ans`',
      ],
      figure: {
        title: 'heights = [1,1,4,2,1,3]',
        steps: [
          {
            note: '先數每個身高出現幾次:1 出現 3 次、2 一次、3 一次、4 一次',
            line: 3,
            views: [arr([1, 1, 4, 2, 1, 3], { label: '原陣列' })],
          },
          {
            note: '從 1 到 100 依序倒出來,排成期望順序 `[1,1,1,2,3,4]`',
            line: 6,
            views: [
              arr([1, 1, 4, 2, 1, 3], { label: '原陣列' }),
              arr([1, 1, 1, 2, 3, 4], { label: '期望順序' }),
            ],
          },
          {
            note: '逐格比對:第 2、4、5 格對不上(外框),共 3 格,答案 = 3',
            line: 7,
            views: [
              arr([1, 1, 4, 2, 1, 3], { label: '原陣列', compare: [2, 4, 5] }),
              arr([1, 1, 1, 2, 3, 4], { label: '期望順序', done: [0, 1, 3] }),
            ],
          },
        ],
      },
      complexity: { time: 'O(n + k)', space: 'O(k)', why: 'k = 100 是值域;掃一次計數、再倒一次比對。' },
      verdict: '值域小的時候最快,不用比較排序。',
      code: {
        python: `def heightChecker(heights):
    count = [0] * 101
    for h in heights:
        count[h] += 1
    idx, ans = 0, 0
    for h in range(1, 101):
        while count[h] > 0:
            count[h] -= 1
            if heights[idx] != h:
                ans += 1
            idx += 1
    return ans`,
        c: `int heightChecker(int* heights, int heightsSize) {
    int count[101] = {0};
    for (int i = 0; i < heightsSize; i++) count[heights[i]]++;
    int idx = 0, ans = 0;
    for (int h = 1; h <= 100; h++) {
        while (count[h]-- > 0) {
            if (heights[idx] != h) ans++;
            idx++;
        }
    }
    return ans;
}`,
        cpp: `int heightChecker(vector<int>& heights) {
    int count[101] = {0};
    for (int h : heights) count[h]++;
    int idx = 0, ans = 0;
    for (int h = 1; h <= 100; h++) {
        while (count[h]-- > 0) {
            if (heights[idx] != h) ans++;
            idx++;
        }
    }
    return ans;
}`,
        java: `int heightChecker(int[] heights) {
    int[] count = new int[101];
    for (int h : heights) count[h]++;
    int idx = 0, ans = 0;
    for (int h = 1; h <= 100; h++) {
        while (count[h]-- > 0) {
            if (heights[idx] != h) ans++;
            idx++;
        }
    }
    return ans;
}`,
        javascript: `function heightChecker(heights) {
  const count = new Array(101).fill(0);
  for (const h of heights) count[h]++;
  let idx = 0, ans = 0;
  for (let h = 1; h <= 100; h++) {
    while (count[h]-- > 0) {
      if (heights[idx] !== h) ans++;
      idx++;
    }
  }
  return ans;
}`,
      },
    },
    {
      name: '直接排序比對',
      idea: '複製一份排好序,再和原陣列逐格比,數有幾格不一樣。',
      steps: [
        '`expected = sorted(heights)`',
        '`ans = 0`,`for i`:`if heights[i] != expected[i]`:`ans += 1`',
        '回傳 `ans`',
      ],
      figure: {
        title: 'heights = [1,1,4,2,1,3]',
        steps: [
          {
            note: '複製一份排序:`[1,1,1,2,3,4]`',
            line: 2,
            views: [
              arr([1, 1, 4, 2, 1, 3], { label: '原陣列' }),
              arr([1, 1, 1, 2, 3, 4], { label: 'expected(排好)' }),
            ],
          },
          {
            note: '逐格比對,外框的三格不同,答案 = 3',
            line: 5,
            views: [
              arr([1, 1, 4, 2, 1, 3], { label: '原陣列', compare: [2, 4, 5] }),
              arr([1, 1, 1, 2, 3, 4], { label: 'expected', done: [0, 1, 3] }),
            ],
          },
        ],
      },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '比較排序加一份複製。' },
      verdict: '最直覺好寫;值域不小時用這個。',
      code: {
        python: `def heightChecker(heights):
    expected = sorted(heights)
    ans = 0
    for i in range(len(heights)):
        if heights[i] != expected[i]:
            ans += 1
    return ans`,
        c: `int cmp(const void* a, const void* b) { return *(int*)a - *(int*)b; }

int heightChecker(int* heights, int heightsSize) {
    int* expected = malloc(heightsSize * sizeof(int));
    for (int i = 0; i < heightsSize; i++) expected[i] = heights[i];
    qsort(expected, heightsSize, sizeof(int), cmp);
    int ans = 0;
    for (int i = 0; i < heightsSize; i++)
        if (heights[i] != expected[i]) ans++;
    free(expected);
    return ans;
}`,
        cpp: `int heightChecker(vector<int>& heights) {
    vector<int> expected(heights);
    sort(expected.begin(), expected.end());
    int ans = 0;
    for (int i = 0; i < (int)heights.size(); i++)
        if (heights[i] != expected[i]) ans++;
    return ans;
}`,
        java: `int heightChecker(int[] heights) {
    int[] expected = heights.clone();
    Arrays.sort(expected);
    int ans = 0;
    for (int i = 0; i < heights.length; i++)
        if (heights[i] != expected[i]) ans++;
    return ans;
}`,
        javascript: `function heightChecker(heights) {
  const expected = [...heights].sort((a, b) => a - b);
  let ans = 0;
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] !== expected[i]) ans++;
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    'JS 的 `sort` 預設按字典序,數字一定要給 `(a, b) => a - b`',
    '要比的是「位置」不是「值的集合」,排好後逐格對',
  ],
  check: {
    kind: 'fn',
    fn: 'heightChecker',
    cases: [
      { args: [[1, 1, 4, 2, 1, 3]], out: 3 },
      { args: [[5, 1, 2, 3, 4]], out: 5 },
      { args: [[1, 2, 3, 4, 5]], out: 0 },
    ],
  },
}
