import { intervalsView } from './fig'
import type { Solution } from './types'

// 986. Interval List Intersections
const A = [[0, 2], [5, 10], [13, 23], [24, 25]]
const B = [[1, 5], [8, 12], [15, 24], [25, 26]]

export const q0986: Solution = {
  id: 986,
  plain: '兩張行程表各自按時間排序。找出一張表的區間與另一張表的區間重疊的所有部分。',
  statement: '給兩個區間列表 firstList、secondList；各列表內的閉區間已按起點排序且互不重疊。回傳兩表之間的所有交集區間。端點相同也算交集。',
  examples: [
    { input: 'firstList = [[0,2],[5,10],[13,23],[24,25]], secondList = [[1,5],[8,12],[15,24],[25,26]]', output: '[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]' },
    { input: 'firstList = [[1,3],[5,9]], secondList = []', output: '[]' },
  ],
  constraints: ['兩個列表各最多 1000 個區間；端點介於 0 到 10⁹。'],
  insight: ['兩個閉區間交集起點是較晚的起點，終點是較早的終點；起點 ≤ 終點才有交集。', '因列表已排序，較早結束的區間不可能再遇到另一列表的後續區間，可直接移動它的指標。'],
  approaches: [
    {
      name: '列舉所有區間對',
      idea: '讓第一張表的每段與第二張表的每段比較，再按交集起點排序。',
      steps: ['枚舉第一表區間 a、第二表區間 b。', '算 lo = max(兩個起點)、hi = min(兩個終點)。', '若 lo ≤ hi，把 [lo,hi] 放入答案；最後依起點排序。'],
      figure: { title: '第一表與第二表的交集', steps: [
        { note: '[0,2] 與 [1,5] 的共同部分是 [1,2]。', views: [intervalsView([[0, 2], [1, 5]], { cls: { 0: 'hl', 1: 'cmp' } })] },
        { note: '[5,10] 與 [1,5] 在端點 5 接觸，也要記 [5,5]。', views: [intervalsView([[5, 10], [1, 5]], { cls: { 0: 'hl', 1: 'cmp' } })] },
        { note: '[5,10] 與 [8,12] 還有交集 [8,10]。', views: [intervalsView([[5, 10], [8, 12]], { cls: { 0: 'hl', 1: 'cmp' } })] },
        { note: '後續比較得到 [15,23]、[24,24]、[25,25]，依起點輸出六段。', views: [intervalsView([[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]], { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done' } })] },
      ] },
      complexity: { time: 'O(ab + r log r)', space: 'O(r)', why: '比較 a×b 對區間，並排序 r 個交集。' },
      verdict: '邏輯直接，但沒有用上兩張表已排序的性質。',
      code: {
        python: `def intervalIntersection(firstList, secondList):
    result = []
    for a in firstList:
        for b in secondList:
            lo = max(a[0], b[0])
            hi = min(a[1], b[1])
            if lo <= hi:
                result.append([lo, hi])  # 閉區間共用端點也算交集
    result.sort()
    return result`,
        c: `static int compareInterval(const void *a, const void *b) {
    const int *x = *(int *const *)a;
    const int *y = *(int *const *)b;
    return (x[0] > y[0]) - (x[0] < y[0]);
}

int **intervalIntersection(int **firstList, int firstListSize, int *firstListColSize, int **secondList, int secondListSize, int *secondListColSize, int *returnSize, int **returnColumnSizes) {
    int cap = firstListSize + secondListSize;
    int **result = malloc((cap + 1) * sizeof(int *));
    *returnColumnSizes = malloc((cap + 1) * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < firstListSize; i++) {
        for (int j = 0; j < secondListSize; j++) {
            int lo = firstList[i][0] > secondList[j][0] ? firstList[i][0] : secondList[j][0];
            int hi = firstList[i][1] < secondList[j][1] ? firstList[i][1] : secondList[j][1];
            if (lo <= hi) {
                result[*returnSize] = malloc(2 * sizeof(int));
                result[*returnSize][0] = lo;
                result[*returnSize][1] = hi;
                (*returnColumnSizes)[*returnSize] = 2;
                (*returnSize)++;
            }
        }
    }
    qsort(result, *returnSize, sizeof(int *), compareInterval);
    return result;
}`,
        cpp: `vector<vector<int>> intervalIntersection(vector<vector<int>>& firstList, vector<vector<int>>& secondList) {
    vector<vector<int>> result;
    for (const auto& a : firstList) {
        for (const auto& b : secondList) {
            int lo = max(a[0], b[0]);
            int hi = min(a[1], b[1]);
            if (lo <= hi) {
                result.push_back({lo, hi});
            }
        }
    }
    sort(result.begin(), result.end());
    return result;
}`,
        java: `int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
    List<int[]> result = new ArrayList<>();
    for (int[] a : firstList) {
        for (int[] b : secondList) {
            int lo = Math.max(a[0], b[0]);
            int hi = Math.min(a[1], b[1]);
            if (lo <= hi) {
                result.add(new int[]{lo, hi});
            }
        }
    }
    result.sort((a, b) -> Integer.compare(a[0], b[0]));
    return result.toArray(new int[result.size()][]);
}`,
        javascript: `function intervalIntersection(firstList, secondList) {
  const result = [];
  for (const a of firstList) {
    for (const b of secondList) {
      const lo = Math.max(a[0], b[0]);
      const hi = Math.min(a[1], b[1]);
      if (lo <= hi) {
        result.push([lo, hi]);
      }
    }
  }
  result.sort((a, b) => a[0] - b[0]);
  return result;
}`,
      },
    },
    {
      name: '雙指標同步前進',
      idea: '比較當前兩段；哪一段先結束，就移動哪一側，因它不可能再與對方後面的區間相交。',
      steps: ['i、j 都從 0 開始。', '以 max(起點)、min(終點) 計算交集；若存在就記錄。', '若 first[i] 先結束，i 加一；否則 j 加一。', '任一列表用完就結束。'],
      figure: { title: '第一表與第二表的交集', steps: [
        { note: '[0,2] 與 [1,5] 交於 [1,2]；[0,2] 先結束，移動第一表。', views: [intervalsView([[0, 2], [1, 5]], { cls: { 0: 'hl', 1: 'cmp' } })] },
        { note: '[5,10] 與 [1,5] 交於單點 [5,5]；第二表的這段先結束。', views: [intervalsView([[5, 10], [1, 5]], { cls: { 0: 'hl', 1: 'cmp' } })] },
        { note: '[5,10] 與 [8,12] 交於 [8,10]；第一表前進。', views: [intervalsView([[5, 10], [8, 12]], { cls: { 0: 'hl', 1: 'cmp' } })] },
        { note: '[13,23] 與 [8,12] 沒重疊；[8,12] 先結束，第二表前進。', views: [intervalsView([[13, 23], [8, 12]], { cls: { 0: 'hl', 1: 'dim' } })] },
        { note: '繼續前進會依序得到 [15,23]、[24,24]、[25,25]，一共六段。', views: [intervalsView([[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]])] },
      ] },
      complexity: { time: 'O(a+b)', space: 'O(r)', why: '每步至少移動一個指標，r 是輸出區間數。' },
      verdict: '標準解；與合併兩個有序陣列的思路相同，參考 [[p:two-pointers]]。',
      code: {
        python: `def intervalIntersection(firstList, secondList):
    i = j = 0
    result = []
    while i < len(firstList) and j < len(secondList):
        a, b = firstList[i], secondList[j]
        lo = max(a[0], b[0])
        hi = min(a[1], b[1])
        if lo <= hi:
            result.append([lo, hi])  # 目前兩段的共同部分
        if a[1] < b[1]:
            i += 1
        else:
            j += 1
    return result`,
        c: `int **intervalIntersection(int **firstList, int firstListSize, int *firstListColSize, int **secondList, int secondListSize, int *secondListColSize, int *returnSize, int **returnColumnSizes) {
    int cap = firstListSize + secondListSize;
    int **result = malloc((cap + 1) * sizeof(int *));
    *returnColumnSizes = malloc((cap + 1) * sizeof(int));
    *returnSize = 0;
    int i = 0;
    int j = 0;
    while (i < firstListSize && j < secondListSize) {
        int lo = firstList[i][0] > secondList[j][0] ? firstList[i][0] : secondList[j][0];
        int hi = firstList[i][1] < secondList[j][1] ? firstList[i][1] : secondList[j][1];
        if (lo <= hi) {
            result[*returnSize] = malloc(2 * sizeof(int));
            result[*returnSize][0] = lo;
            result[*returnSize][1] = hi;
            (*returnColumnSizes)[*returnSize] = 2;
            (*returnSize)++;
        }
        if (firstList[i][1] < secondList[j][1]) {
            i++;
        } else {
            j++;
        }
    }
    return result;
}`,
        cpp: `vector<vector<int>> intervalIntersection(vector<vector<int>>& firstList, vector<vector<int>>& secondList) {
    vector<vector<int>> result;
    int i = 0;
    int j = 0;
    while (i < (int)firstList.size() && j < (int)secondList.size()) {
        int lo = max(firstList[i][0], secondList[j][0]);
        int hi = min(firstList[i][1], secondList[j][1]);
        if (lo <= hi) {
            result.push_back({lo, hi});
        }
        if (firstList[i][1] < secondList[j][1]) {
            i++;
        } else {
            j++;
        }
    }
    return result;
}`,
        java: `int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
    List<int[]> result = new ArrayList<>();
    int i = 0;
    int j = 0;
    while (i < firstList.length && j < secondList.length) {
        int lo = Math.max(firstList[i][0], secondList[j][0]);
        int hi = Math.min(firstList[i][1], secondList[j][1]);
        if (lo <= hi) {
            result.add(new int[]{lo, hi});
        }
        if (firstList[i][1] < secondList[j][1]) {
            i++;
        } else {
            j++;
        }
    }
    return result.toArray(new int[result.size()][]);
}`,
        javascript: `function intervalIntersection(firstList, secondList) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < firstList.length && j < secondList.length) {
    const lo = Math.max(firstList[i][0], secondList[j][0]);
    const hi = Math.min(firstList[i][1], secondList[j][1]);
    if (lo <= hi) {
      result.push([lo, hi]);
    }
    if (firstList[i][1] < secondList[j][1]) {
      i++;
    } else {
      j++;
    }
  }
  return result;
}`,
      },
    },
  ],
  pitfalls: ['區間含端點，lo == hi 時仍需輸出 [lo,lo]。', '每步只能淘汰較早結束的那段；移動較晚結束的指標會漏掉後續交集。'],
  check: { kind: 'fn', fn: 'intervalIntersection', cases: [
    { args: [A, B], out: [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]] },
    { args: [[[1, 3], [5, 9]], []], out: [] },
    { args: [[[1, 2]], [[2, 3]]], out: [[2, 2]] },
  ] },
}
