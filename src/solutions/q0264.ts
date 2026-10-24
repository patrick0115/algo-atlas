import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q0264: Solution = {
  id: 264,
  plain: '只含質因數 2、3、5 的正整數叫醜數；找第 n 個，第一個是 1。',
  statement: '醜數的質因數只可能是 2、3、5。回傳依數值遞增排列的第 n 個醜數。',
  examples: [{ input: 'n = 10', output: '12' }, { input: 'n = 1', output: '1' }],
  constraints: ['`1 ≤ n ≤ 1690`，第 1690 個仍可用 32 位元有號整數表示。'],
  insight: ['從 1 出發，每個醜數乘 2、3、5 都能產生新醜數。', '下一個答案是所有「已知醜數乘 2、3、5 且大於目前值」的最小值。', '三個指標分別指向乘 2、3、5 的下一個候選，可把重複掃描降為一次前進；這是 [[p:dp-1d]]。'],
  approaches: [
    {
      name: '每次重掃所有已知醜數',
      idea: '列出已知醜數的三倍、兩倍、五倍候選，找最小且大於前一個的值。',
      steps: ['序列從 1 開始', '對每個已知醜數產生乘 2、3、5 的候選', '挑大於末尾的最小候選', '重複直到序列有 n 個'],
      figure: { title: 'n=10', steps: [
        { note: '先有 1；它產生候選 2、3、5，最小的 2 成為第二個。', views: [arr([1, 2], { label: '已知醜數', done: [0, 1] }), arr([2, 3, 5], { label: '候選', highlight: [0] })] },
        { note: '重掃 1、2；大於 2 的最小候選為 3。', views: [arr([1, 2, 3], { label: '已知醜數', done: [2] })] },
        { note: '從 2×2 得到 4；接著 1×5 得 5，2×3 或 3×2 都得 6，但只加入一次。', views: [arr([1, 2, 3, 4, 5, 6], { label: '已知醜數', done: [5] })] },
        { note: '繼續選出 8、9、10、12；第 10 個是 12。', views: [arr([1, 2, 3, 4, 5, 6, 8, 9, 10, 12], { label: '序列', done: [9] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '第 i 次會重新查看前 i 個醜數。' },
      verdict: '正確但會重複計算許多候選；可由此推導三指標。',
      code: {
        python: `def nthUglyNumber(n):
    ugly = [1]
    while len(ugly) < n:
        last = ugly[-1]
        next_value = float('inf')
        for value in ugly:
            for factor in (2, 3, 5):
                candidate = value * factor
                if last < candidate < next_value:
                    next_value = candidate  # 只選嚴格更大的最小候選
        ugly.append(next_value)
    return ugly[-1]`,
        c: `int nthUglyNumber(int n) {
    int *ugly = malloc(n * sizeof(int));
    ugly[0] = 1;
    int factors[3] = {2, 3, 5};
    for (int i = 1; i < n; i++) {
        long long next = LLONG_MAX;
        for (int j = 0; j < i; j++) {
            for (int t = 0; t < 3; t++) {
                long long v = (long long)ugly[j] * factors[t];
                if (v > ugly[i - 1] && v < next) next = v;
            }
        }
        ugly[i] = (int)next;
    }
    int ans = ugly[n - 1];
    free(ugly);
    return ans;
}`,
        cpp: `int nthUglyNumber(int n) {
    vector<int> ugly{1};
    while ((int)ugly.size() < n) {
        long long next = LLONG_MAX;
        for (int value : ugly) {
            for (int factor : {2, 3, 5}) {
                long long candidate = (long long)value * factor;
                if (candidate > ugly.back()) next = min(next, candidate);
            }
        }
        ugly.push_back(next);
    }
    return ugly.back();
}`,
        java: `int nthUglyNumber(int n) {
    int[] ugly = new int[n];
    int[] factors = {2, 3, 5};
    ugly[0] = 1;
    for (int i = 1; i < n; i++) {
        long next = Long.MAX_VALUE;
        for (int j = 0; j < i; j++) {
            for (int factor : factors) {
                long candidate = (long) ugly[j] * factor;
                if (candidate > ugly[i - 1]) next = Math.min(next, candidate);
            }
        }
        ugly[i] = (int) next;
    }
    return ugly[n - 1];
}`,
        javascript: `function nthUglyNumber(n) {
  const ugly = [1];
  while (ugly.length < n) {
    let next = Infinity;
    for (const value of ugly) {
      for (const factor of [2, 3, 5]) {
        const candidate = value * factor;
        if (candidate > ugly[ugly.length - 1]) next = Math.min(next, candidate);
      }
    }
    ugly.push(next);
  }
  return ugly[ugly.length - 1];
}`,
      },
    },
    {
      name: '三指標依序產生',
      idea: '指標 i2、i3、i5 各指出下一個乘 2、3、5 的候選來源。',
      steps: ['ugly[0]=1，三個指標都指向 0', '下一個值取 `min(ugly[i2]×2, ugly[i3]×3, ugly[i5]×5)`', '所有產生該值的指標都往前一步', '重複至第 n 個'],
      figure: { title: 'n=10', steps: [
        { note: '從 1 出發，三個候選是 2、3、5；選 2 並移動 i2。', views: [arr([1, 2], { label: 'ugly', done: [1] }), arr([2, 3, 5], { label: '候選', highlight: [0] })] },
        { note: '候選變 4、3、5；選 3 並移動 i3。', views: [arr([1, 2, 3], { label: 'ugly', done: [2] }), arr([4, 3, 5], { label: '候選', highlight: [1] })] },
        { note: '之後選 4、5、6；6 同時由 3×2、2×3 產生，兩個指標都要移動，才不會重複加入。', views: [arr([1, 2, 3, 4, 5, 6], { label: 'ugly', done: [5] }), arr([6, 6, 10], { label: '曾有候選', highlight: [0, 1] })] },
        { note: '繼續產生 8、9、10、12，答案為第 10 個 12。', views: [arr([1, 2, 3, 4, 5, 6, 8, 9, 10, 12], { label: 'ugly', done: [9] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每次新增一個數，三個指標都只往前走。' },
      verdict: '推薦；相等的候選要同時推進所有對應指標。',
      code: {
        python: `def nthUglyNumber(n):
    ugly = [1] * n
    i2 = i3 = i5 = 0
    for i in range(1, n):
        value = min(ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5)
        ugly[i] = value
        if value == ugly[i2] * 2:
            i2 += 1  # 相同候選的指標都要前進
        if value == ugly[i3] * 3:
            i3 += 1
        if value == ugly[i5] * 5:
            i5 += 1
    return ugly[-1]`,
        c: `int nthUglyNumber(int n) {
    int *ugly = malloc(n * sizeof(int));
    ugly[0] = 1;
    int i2 = 0, i3 = 0, i5 = 0;
    for (int i = 1; i < n; i++) {
        long long a = (long long)ugly[i2] * 2;
        long long b = (long long)ugly[i3] * 3;
        long long c = (long long)ugly[i5] * 5;
        long long value = a < b ? a : b;
        if (c < value) value = c;
        ugly[i] = (int)value;
        if (value == a) i2++;
        if (value == b) i3++;
        if (value == c) i5++;
    }
    int ans = ugly[n - 1];
    free(ugly);
    return ans;
}`,
        cpp: `int nthUglyNumber(int n) {
    vector<int> ugly(n);
    ugly[0] = 1;
    int i2 = 0, i3 = 0, i5 = 0;
    for (int i = 1; i < n; i++) {
        long long a = 2LL * ugly[i2], b = 3LL * ugly[i3], c = 5LL * ugly[i5];
        long long value = min({a, b, c});
        ugly[i] = value;
        if (value == a) i2++;
        if (value == b) i3++;
        if (value == c) i5++;
    }
    return ugly[n - 1];
}`,
        java: `int nthUglyNumber(int n) {
    int[] ugly = new int[n];
    ugly[0] = 1;
    int i2 = 0, i3 = 0, i5 = 0;
    for (int i = 1; i < n; i++) {
        long a = 2L * ugly[i2], b = 3L * ugly[i3], c = 5L * ugly[i5];
        long value = Math.min(a, Math.min(b, c));
        ugly[i] = (int) value;
        if (value == a) i2++;
        if (value == b) i3++;
        if (value == c) i5++;
    }
    return ugly[n - 1];
}`,
        javascript: `function nthUglyNumber(n) {
  const ugly = new Array(n).fill(1);
  let i2 = 0, i3 = 0, i5 = 0;
  for (let i = 1; i < n; i++) {
    const a = ugly[i2] * 2, b = ugly[i3] * 3, c = ugly[i5] * 5;
    const value = Math.min(a, b, c);
    ugly[i] = value;
    if (value === a) i2++;
    if (value === b) i3++;
    if (value === c) i5++;
  }
  return ugly[n - 1];
}`,
      },
    },
  ],
  pitfalls: ['6 可由 2×3 和 3×2 產生；若只移動一個指標，下一輪會重複出現 6。', '中間乘積在固定寬度語言用較寬整數型別計算。'],
  check: { kind: 'fn', fn: 'nthUglyNumber', cases: [
    { args: [10], out: 12 },
    { args: [1], out: 1 },
    { args: [15], out: 24 },
  ] },
}
