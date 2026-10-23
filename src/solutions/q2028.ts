import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2028. Find Missing Observations
const ROLLS = [1, 5, 6]
const mathFig: FigStep[] = [
  { note: '已知 3 次是 1、5、6,另有 4 次未知。若 7 次平均為 3,全部總和要 7 × 3 = 21。', views: [arr(ROLLS, { label: '已知擲骰' }), arr([21, 12, 9], { label: '目標總和 / 已知總和 / 未知總和' })] },
  { note: '未知四次必須合計 9。先每個放 floor(9/4)=2,還剩 1 分給第一個,得到 [3,2,2,2]。', views: [arr([2, 2, 2, 2], { label: '平均分配' }), arr([3, 2, 2, 2], { label: '答案', done: [0] })] },
]
const roundFig: FigStep[] = [
  { note: '也可以先讓每個未知骰子都為 1,再把還需要的點數一點一點輪流加上去。', views: [arr([1, 1, 1, 1], { label: '最低合法值' })] },
  { note: '未知總和要 9,目前是 4,還要加 5。輪流分配後得到 [3,2,2,2]。', views: [arr([3, 2, 2, 2], { label: '答案', done: [0, 1, 2, 3] })] },
]

export const q2028: Solution = {
  id: 2028,
  plain: '一串擲骰子的結果少記了幾次,但知道全部擲骰的平均點數。先算出遺失的總點數,再把它分成每次 1 到 6 點。',
  statement: '給已知的擲骰結果 rolls、所有 m+n 次擲骰的整數平均 mean,以及遺失次數 n,找出任一組 n 個 1..6 的點數使平均正確;做不到時回傳空陣列。',
  examples: [
    { input: 'rolls = [3,2,4,3], mean = 4, n = 2', output: '[6,6]' },
    { input: 'rolls = [1,5,6], mean = 3, n = 4', output: '[3,2,2,2]', note: '任何合法分配都可' },
    { input: 'rolls = [1,2,3,4], mean = 6, n = 4', output: '[]' },
  ],
  constraints: ['每顆骰子必須在 1..6 之間', 'mean 代表所有 m+n 次擲骰的算術平均'],
  insight: ['遺失總和 need = mean × (m+n) − sum(rolls)。', 'n 顆骰子的總和必須介於 n 與 6n;超出就不可能。', '若合法,每顆先分配 floor(need/n),餘數各補 1 即可。'],
  approaches: [
    {
      name: '商與餘數平均分配',
      idea: '用整除得到每顆的基本點數,把餘數一點一點分給前幾顆。',
      steps: ['need = mean × (m+n) − sum(rolls)', 'need < n 或 need > 6n → 回傳空陣列', 'base = floor(need/n),extra = need % n', '建立 n 個 base,前 extra 個再加 1'],
      figure: { title: 'rolls = [1,5,6],mean = 3,n = 4', steps: mathFig },
      complexity: { time: 'O(m+n)', space: 'O(n)', why: '加總已知結果並建立 n 個輸出。' },
      verdict: '最推薦;直接把平均數條件化成一個可檢查的總和。',
      code: {
        python: `def missingRolls(rolls, mean, n):
    need = mean * (len(rolls) + n) - sum(rolls)
    if need < n or need > 6 * n:
        return []
    base, extra = divmod(need, n)
    return [base + (1 if i < extra else 0) for i in range(n)]`,
        c: `int *missingRolls(int *rolls, int rollsSize, int mean, int n, int *returnSize) {
    int total = 0;
    for (int i = 0; i < rollsSize; i++) total += rolls[i];
    int need = mean * (rollsSize + n) - total;
    if (need < n || need > 6 * n) { *returnSize = 0; return NULL; }
    int base = need / n, extra = need % n;
    int *ans = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) ans[i] = base + (i < extra);
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> missingRolls(vector<int>& rolls, int mean, int n) {
    int need = mean * (rolls.size() + n) - accumulate(rolls.begin(), rolls.end(), 0);
    if (need < n || need > 6 * n) return {};
    vector<int> ans(n, need / n);
    for (int i = 0; i < need % n; i++) ans[i]++;
    return ans;
}`,
        java: `int[] missingRolls(int[] rolls, int mean, int n) {
    int sum = 0;
    for (int x : rolls) sum += x;
    int need = mean * (rolls.length + n) - sum;
    if (need < n || need > 6 * n) return new int[0];
    int[] ans = new int[n];
    Arrays.fill(ans, need / n);
    for (int i = 0; i < need % n; i++) ans[i]++;
    return ans;
}`,
        javascript: `function missingRolls(rolls, mean, n) {
  const need = mean * (rolls.length + n) - rolls.reduce((a, b) => a + b, 0);
  if (need < n || need > 6 * n) return [];
  const base = Math.floor(need / n), extra = need % n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}`,
      },
    },
    {
      name: '從每顆 1 點輪流補',
      idea: '先給每個遺失觀測值最低合法值 1,再把剩餘點數循環分配。',
      steps: ['計算 need 並檢查 n ≤ need ≤ 6n', 'ans = n 個 1,remaining = need−n', '按索引 0..n−1 循環,每次給一顆加 1', 'remaining 歸零後回傳 ans'],
      figure: { title: '先放最低值再加點數', steps: roundFig },
      complexity: { time: 'O(m+n)', space: 'O(n)', why: '最多再分配 5n 點,仍是線性。' },
      verdict: '便於想像骰子點數的範圍;商與餘數法寫起來更短。',
      code: {
        python: `def missingRolls(rolls, mean, n):
    need = mean * (len(rolls) + n) - sum(rolls)
    if need < n or need > 6 * n:
        return []
    ans = [1] * n
    remaining = need - n
    i = 0
    while remaining:
        ans[i] += 1
        remaining -= 1
        i = (i + 1) % n
    return ans`,
        c: `int *missingRolls(int *rolls, int rollsSize, int mean, int n, int *returnSize) {
    int sum = 0;
    for (int i = 0; i < rollsSize; i++) sum += rolls[i];
    int need = mean * (rollsSize + n) - sum;
    if (need < n || need > 6 * n) { *returnSize = 0; return NULL; }
    int *ans = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) ans[i] = 1;
    int remaining = need - n;
    for (int i = 0; remaining > 0; i = (i + 1) % n) {
        ans[i]++;
        remaining--;
    }
    *returnSize = n;
    return ans;
}`,
        cpp: `vector<int> missingRolls(vector<int>& rolls, int mean, int n) {
    int need = mean * (rolls.size() + n) - accumulate(rolls.begin(), rolls.end(), 0);
    if (need < n || need > 6 * n) return {};
    vector<int> ans(n, 1);
    int remaining = need - n;
    for (int i = 0; remaining > 0; i = (i + 1) % n) {
        ans[i]++;
        remaining--;
    }
    return ans;
}`,
        java: `int[] missingRolls(int[] rolls, int mean, int n) {
    int sum = 0;
    for (int x : rolls) sum += x;
    int need = mean * (rolls.length + n) - sum;
    if (need < n || need > 6 * n) return new int[0];
    int[] ans = new int[n];
    Arrays.fill(ans, 1);
    int remaining = need - n;
    for (int i = 0; remaining > 0; i = (i + 1) % n) {
        ans[i]++;
        remaining--;
    }
    return ans;
}`,
        javascript: `function missingRolls(rolls, mean, n) {
  const need = mean * (rolls.length + n) - rolls.reduce((a, b) => a + b, 0);
  if (need < n || need > 6 * n) return [];
  const ans = Array(n).fill(1);
  let remaining = need - n;
  for (let i = 0; remaining > 0; i = (i + 1) % n) {
    ans[i]++;
    remaining--;
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['平均數是所有 m+n 次擲骰的平均,不是只算遺失的 n 次。', '只檢查總和為正不夠;每顆都必須在 1..6。', '若 need < n 或 need > 6n,必須回傳空陣列。'],
  check: { kind: 'fn', fn: 'missingRolls', cases: [
    { args: [[3, 2, 4, 3], 4, 2], out: [6, 6] },
    { args: [ROLLS, 3, 4], out: [3, 2, 2, 2] },
    { args: [[1, 2, 3, 4], 6, 4], out: [] },
    { args: [[6], 3, 1], out: [] },
  ] },
}
