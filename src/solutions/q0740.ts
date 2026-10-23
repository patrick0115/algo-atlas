import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 740. Delete and Earn

const A = [2, 2, 3, 3, 3, 4]

function robFig(): FigStep[] {
  const M = Math.max(...A)
  const pts = Array(M + 1).fill(0)
  for (const x of A) pts[x] += x
  const dp = Array(M + 1).fill(0)
  dp[1] = pts[1]
  for (let v = 2; v <= M; v++) dp[v] = Math.max(dp[v - 1], dp[v - 2] + pts[v])
  return [
    { note: '拿走一個 x 得 x 分,但所有 x − 1 和 x + 1 都會被刪掉。觀察:一旦決定拿 x,就會把**所有的 x** 都拿走(反正 x±1 已經沒了)', views: [arr(A, { label: 'nums' })] },
    { note: '先把同一個值的分數加總:points[v] = v × 出現次數。題目變成:在 points 上挑數,不能挑相鄰的 v → [198](#/q/198) 打家劫舍', views: [arr(pts, { label: 'points[0..4]' })] },
    { note: '`dp[v] = max(dp[v−1], dp[v−2] + points[v])`', views: [arr(dp, { label: 'dp[0..4]', done: [M] })] },
    { note: `拿全部的 3(9 分),2 和 4 被刪 → 答案 ${dp[M]}`, views: [arr([dp[M]], { label: '答案', done: [0] })] },
  ]
}

function sortFig(): FigStep[] {
  return [
    { note: '值域很大但種類少時:只處理出現過的值(排序後去重)。相鄰兩個值若差 1 → 不能同時拿;差 ≥ 2 → 可以直接接上', views: [arr([2, 3, 4], { label: '出現過的值' })] },
    { note: '用兩個變數 take / skip 滾動,和打家劫舍一樣', views: [arr([9], { label: '答案', done: [0] })] },
  ]
}

export const q0740: Solution = {
  id: 740,
  plain: '一個數字陣列,每次可以拿走一個數 x 得到 x 分,但所有等於 x − 1 和 x + 1 的數都會被刪掉(不給分)。重複直到拿完,最多幾分?',
  statement: '給整數陣列 `nums`,每次操作選一個 `nums[i]` 刪除並獲得 nums[i] 分,同時必須刪除**所有**值等於 nums[i] − 1 與 nums[i] + 1 的元素。回傳能獲得的最大分數。',
  examples: [
    { input: 'nums = [3,4,2]', output: '6', note: '拿 4(刪掉 3),再拿 2' },
    { input: 'nums = [2,2,3,3,3,4]', output: '9', note: '拿三個 3' },
  ],
  constraints: ['n ≤ 2·10⁴,1 ≤ nums[i] ≤ 10⁴'],
  insight: ['拿了一個 x 就會想拿全部的 x → 以「值」為單位', 'points[v] = v × count(v);相鄰的值不能同時選', '= 打家劫舍([[p:dp-1d]])'],
  approaches: [
    {
      name: '轉成打家劫舍(值域陣列)',
      idea: '`points[v] = v × count(v)`;`dp[v] = max(dp[v−1], dp[v−2] + points[v])`。',
      steps: ['`points = [0] * (max + 1)`,累加每個 x', '`take, skip = 0, 0`', '`for v in 0..max`:`take, skip = skip + points[v], max(take, skip)`', '回傳 `max(take, skip)`'],
      figure: { title: `nums = [${A}]`, steps: robFig() },
      complexity: { time: 'O(n + M)', space: 'O(M)', why: 'M 是最大值(10⁴)。' },
      verdict: '最推薦;把新題目歸約到熟悉的題目是很重要的能力。',
      code: {
        python: `def deleteAndEarn(nums):
    M = max(nums)
    points = [0] * (M + 1)
    for x in nums:
        points[x] += x                        # 同一個值一起拿
    take = skip = 0                           # 打家劫舍:拿 v / 不拿 v
    for v in range(M + 1):
        take, skip = skip + points[v], max(take, skip)
    return max(take, skip)`,
        c: `int deleteAndEarn(int *nums, int numsSize) {
    int M = 0;
    for (int i = 0; i < numsSize; i++) if (nums[i] > M) M = nums[i];
    int *points = calloc(M + 1, sizeof(int));
    for (int i = 0; i < numsSize; i++) points[nums[i]] += nums[i];
    int take = 0, skip = 0;
    for (int v = 0; v <= M; v++) {
        int nt = skip + points[v], ns = take > skip ? take : skip;
        take = nt; skip = ns;
    }
    free(points);
    return take > skip ? take : skip;
}`,
        cpp: `int deleteAndEarn(vector<int>& nums) {
    int M = *max_element(nums.begin(), nums.end());
    vector<int> points(M + 1, 0);
    for (int x : nums) points[x] += x;
    int take = 0, skip = 0;
    for (int v = 0; v <= M; v++) {
        int nt = skip + points[v], ns = max(take, skip);
        take = nt; skip = ns;
    }
    return max(take, skip);
}`,
        java: `int deleteAndEarn(int[] nums) {
    int M = 0;
    for (int x : nums) M = Math.max(M, x);
    int[] points = new int[M + 1];
    for (int x : nums) points[x] += x;
    int take = 0, skip = 0;
    for (int v = 0; v <= M; v++) {
        int nt = skip + points[v], ns = Math.max(take, skip);
        take = nt; skip = ns;
    }
    return Math.max(take, skip);
}`,
        javascript: `function deleteAndEarn(nums) {
  const M = Math.max(...nums), points = new Array(M + 1).fill(0);
  for (const x of nums) points[x] += x;
  let take = 0, skip = 0;
  for (let v = 0; v <= M; v++) [take, skip] = [skip + points[v], Math.max(take, skip)];
  return Math.max(take, skip);
}`,
      },
    },
    {
      name: '排序去重 + 滾動',
      idea: '統計每個值的總分;依值排序。若和前一個值差 1 → `take = skip + pts`;否則 `take = max(take, skip) + pts`。',
      steps: ['`cnt = Counter(nums)`、`vals = sorted(cnt)`', '`take = skip = 0`、`prev = None`', '差 1:`take, skip = skip + pts, max(take, skip)`', '不相鄰:`take, skip = max(take, skip) + pts, max(take, skip)`'],
      figure: { title: `nums = [${A}]`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序不同的值。' },
      verdict: '值域很大(例如 10⁹)時改用這個版本,只看出現過的值。',
      code: {
        python: `from collections import Counter

def deleteAndEarn(nums):
    cnt = Counter(nums)
    take = skip = 0
    prev = None
    for v in sorted(cnt):
        pts = v * cnt[v]
        best = max(take, skip)
        if prev is not None and v == prev + 1:
            take, skip = skip + pts, best     # 和前一個值相鄰
        else:
            take, skip = best + pts, best     # 不相鄰,可以直接接上
        prev = v
    return max(take, skip)`,
        c: `static int cmpI(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int deleteAndEarn(int *nums, int numsSize) {
    int *a = malloc(numsSize * sizeof(int));
    memcpy(a, nums, numsSize * sizeof(int));
    qsort(a, numsSize, sizeof(int), cmpI);
    long long take = 0, skip = 0;
    int prev = -10;
    for (int i = 0; i < numsSize;) {
        int v = a[i];
        long long pts = 0;
        while (i < numsSize && a[i] == v) pts += a[i++];
        long long best = take > skip ? take : skip;
        if (v == prev + 1) { take = skip + pts; skip = best; }
        else { take = best + pts; skip = best; }
        prev = v;
    }
    free(a);
    return (int)(take > skip ? take : skip);
}`,
        cpp: `int deleteAndEarn(vector<int>& nums) {
    map<int, int> pts;
    for (int x : nums) pts[x] += x;
    int take = 0, skip = 0, prev = -10;
    for (auto [v, p] : pts) {
        int best = max(take, skip);
        if (v == prev + 1) { take = skip + p; skip = best; }
        else { take = best + p; skip = best; }
        prev = v;
    }
    return max(take, skip);
}`,
        java: `int deleteAndEarn(int[] nums) {
    TreeMap<Integer, Integer> pts = new TreeMap<>();
    for (int x : nums) pts.merge(x, x, Integer::sum);
    int take = 0, skip = 0, prev = -10;
    for (var e : pts.entrySet()) {
        int v = e.getKey(), p = e.getValue(), best = Math.max(take, skip);
        if (v == prev + 1) { take = skip + p; skip = best; }
        else { take = best + p; skip = best; }
        prev = v;
    }
    return Math.max(take, skip);
}`,
        javascript: `function deleteAndEarn(nums) {
  const pts = new Map();
  for (const x of nums) pts.set(x, (pts.get(x) ?? 0) + x);
  let take = 0, skip = 0, prev = -10;
  for (const v of [...pts.keys()].sort((a, b) => a - b)) {
    const p = pts.get(v), best = Math.max(take, skip);
    if (v === prev + 1) [take, skip] = [skip + p, best];
    else [take, skip] = [best + p, best];
    prev = v;
  }
  return Math.max(take, skip);
}`,
      },
    },
  ],
  pitfalls: ['以單一元素為單位做 DP:同值的元素應該一起考慮', '貪心先拿最大的數:可能刪掉很多中間值,反而虧'],
  check: {
    kind: 'fn',
    fn: 'deleteAndEarn',
    cases: [
      { args: [[3, 4, 2]], out: 6 },
      { args: [A], out: 9 },
      { args: [[1]], out: 1 },
      { args: [[1, 1, 1, 2, 4, 5, 5, 5, 6]], out: 18 },
    ],
  },
}
