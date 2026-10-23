import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { intervalsView } from './fig'

// 1288. Remove Covered Intervals

const IV = [[1, 4], [3, 6], [2, 8]]

function sortFig(): FigStep[] {
  const sorted = [[1, 4], [2, 8], [3, 6]]
  return [
    { note: '[a, b] 被 [c, d] 覆蓋 ⇔ c ≤ a 且 b ≤ d。要數「沒被任何區間覆蓋」的有幾個', views: [intervalsView(IV, { label: 'intervals' })] },
    { note: '按起點由小到大排序;起點相同時**終點大的排前面**(這樣長的會先出現,後面短的才會被判定為被覆蓋)', views: [intervalsView(sorted, { label: '排序後' })] },
    { note: '記錄目前看過的最大終點 maxEnd。[1,4]:4 > 0 → 保留,maxEnd = 4;[2,8]:8 > 4 → 保留,maxEnd = 8', views: [intervalsView(sorted, { label: '掃描', cls: { 0: 'done', 1: 'done' } })] },
    { note: '[3,6]:6 ≤ 8 → 被 [2,8] 覆蓋(起點又比它晚)→ 不算。答案 2', views: [intervalsView(sorted, { label: '結果', cls: { 0: 'done', 1: 'done', 2: 'dim' } }), arr([2], { label: '答案', done: [0] })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:每個區間檢查有沒有「別的區間」把它包起來', views: [intervalsView(IV, { label: '檢查 [3,6]', cls: { 1: 'hl', 2: 'cmp' } })] },
    { note: '[2,8] 包住 [3,6] → [3,6] 被覆蓋。n ≤ 1000,O(n²) 也可以過', views: [intervalsView(IV, { label: '結果', cls: { 0: 'done', 1: 'dim', 2: 'done' } })] },
  ]
}

export const q1288: Solution = {
  id: 1288,
  plain: '一堆區間,如果某個區間完全被另一個區間包住,就把它刪掉。最後剩幾個?',
  statement: '給區間陣列 `intervals`,`[a, b)` 被 `[c, d)` 覆蓋當且僅當 `c ≤ a` 且 `b ≤ d`。刪除所有被其他區間覆蓋的區間,回傳剩下的區間數量。',
  examples: [
    { input: 'intervals = [[1,4],[3,6],[2,8]]', output: '2', note: '[3,6] 被 [2,8] 覆蓋' },
    { input: 'intervals = [[1,4],[2,3]]', output: '1' },
  ],
  constraints: ['n ≤ 1000,區間互不相同'],
  insight: ['按起點排序後,被覆蓋只可能被「前面的」某個區間覆蓋', '起點相同時讓長的在前,否則短的會被誤認為沒被覆蓋', '只要記得前面最大的終點'],
  approaches: [
    {
      name: '排序 + 最大終點',
      idea: '依 (起點↑, 終點↓) 排序;`end > maxEnd` → 沒被覆蓋,計數 +1、更新 maxEnd。',
      steps: ['`intervals.sort(key=(a, −b))`', '`cnt = 0`、`maxEnd = 0`', '`for a, b`:`b > maxEnd` → `cnt += 1`、`maxEnd = b`', '回傳 cnt'],
      figure: { title: 'intervals = [[1,4],[3,6],[2,8]]', steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '排序後一次掃描。' },
      verdict: '最推薦,區間題「先排序再掃」的標準套路([[p:interval-scheduling]])。',
      code: {
        python: `def removeCoveredIntervals(intervals):
    intervals.sort(key=lambda x: (x[0], -x[1]))   # 起點相同:長的在前
    cnt, max_end = 0, 0
    for _, b in intervals:
        if b > max_end:
            cnt += 1                          # 前面沒有人能包住它
            max_end = b
    return cnt`,
        c: `static int cmp(const void *x, const void *y) {
    int *a = *(int **)x, *b = *(int **)y;
    return a[0] != b[0] ? a[0] - b[0] : b[1] - a[1];
}

int removeCoveredIntervals(int **intervals, int intervalsSize, int *intervalsColSize) {
    qsort(intervals, intervalsSize, sizeof(int *), cmp);
    int cnt = 0, maxEnd = 0;
    for (int i = 0; i < intervalsSize; i++)
        if (intervals[i][1] > maxEnd) { cnt++; maxEnd = intervals[i][1]; }
    return cnt;
}`,
        cpp: `int removeCoveredIntervals(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end(), [](auto &a, auto &b) { return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1]; });
    int cnt = 0, maxEnd = 0;
    for (auto &iv : intervals)
        if (iv[1] > maxEnd) { cnt++; maxEnd = iv[1]; }
    return cnt;
}`,
        java: `int removeCoveredIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);
    int cnt = 0, maxEnd = 0;
    for (int[] iv : intervals)
        if (iv[1] > maxEnd) { cnt++; maxEnd = iv[1]; }
    return cnt;
}`,
        javascript: `function removeCoveredIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  let cnt = 0, maxEnd = 0;
  for (const [, b] of intervals)
    if (b > maxEnd) {
      cnt++;
      maxEnd = b;
    }
  return cnt;
}`,
      },
    },
    {
      name: '兩兩比較',
      idea: '對每個區間 i,檢查是否存在 j ≠ i 使 `c ≤ a` 且 `b ≤ d`;沒有就計數。',
      steps: ['`for i`:`covered = any(j != i and c <= a and b <= d)`', '沒被覆蓋 → `cnt += 1`'],
      figure: { title: 'intervals = [[1,4],[3,6],[2,8]]', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '兩層迴圈;n ≤ 1000 可接受。' },
      verdict: '直接照定義寫,用來對照排序版的正確性。',
      code: {
        python: `def removeCoveredIntervals(intervals):
    cnt = 0
    for i, (a, b) in enumerate(intervals):
        covered = any(j != i and c <= a and b <= d for j, (c, d) in enumerate(intervals))
        if not covered:
            cnt += 1
    return cnt`,
        c: `int removeCoveredIntervals(int **intervals, int intervalsSize, int *intervalsColSize) {
    int cnt = 0;
    for (int i = 0; i < intervalsSize; i++) {
        bool covered = false;
        for (int j = 0; j < intervalsSize && !covered; j++)
            if (j != i && intervals[j][0] <= intervals[i][0] && intervals[i][1] <= intervals[j][1]) covered = true;
        if (!covered) cnt++;
    }
    return cnt;
}`,
        cpp: `int removeCoveredIntervals(vector<vector<int>>& intervals) {
    int n = intervals.size(), cnt = 0;
    for (int i = 0; i < n; i++) {
        bool covered = false;
        for (int j = 0; j < n && !covered; j++)
            if (j != i && intervals[j][0] <= intervals[i][0] && intervals[i][1] <= intervals[j][1]) covered = true;
        if (!covered) cnt++;
    }
    return cnt;
}`,
        java: `int removeCoveredIntervals(int[][] intervals) {
    int n = intervals.length, cnt = 0;
    for (int i = 0; i < n; i++) {
        boolean covered = false;
        for (int j = 0; j < n && !covered; j++)
            if (j != i && intervals[j][0] <= intervals[i][0] && intervals[i][1] <= intervals[j][1]) covered = true;
        if (!covered) cnt++;
    }
    return cnt;
}`,
        javascript: `function removeCoveredIntervals(intervals) {
  let cnt = 0;
  intervals.forEach(([a, b], i) => {
    if (!intervals.some(([c, d], j) => j !== i && c <= a && b <= d)) cnt++;
  });
  return cnt;
}`,
      },
    },
  ],
  pitfalls: ['起點相同時沒有讓長的排前面:[1,2]、[1,4] 會兩個都算進去', '比較時用 `b >= maxEnd`:終點相同、起點較晚的區間其實被覆蓋了'],
  check: {
    kind: 'fn',
    fn: 'removeCoveredIntervals',
    cases: [
      { args: [IV], out: 2 },
      { args: [[[1, 4], [2, 3]]], out: 1 },
      { args: [[[1, 2], [1, 4], [3, 4]]], out: 1 },
      { args: [[[0, 10], [5, 12]]], out: 2 },
      { args: [[[3, 10], [4, 10], [5, 11]]], out: 2 },
    ],
  },
}
