import type { FigStep, Solution } from './types'
import { intervalsView } from './fig'

// 435. Non-overlapping Intervals

const IV = [
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 3],
  [2, 5],
]

function endFig(): FigStep[] {
  const s = [...IV].sort((a, b) => a[1] - b[1])
  const cls: Record<number, 'done' | 'dim' | 'hl'> = {}
  let end = -Infinity
  let removed = 0
  const out: FigStep[] = [{ note: '要刪最少 = 留最多個互不重疊的區間。貪心:依**結束時間**排序,每次留下「最早結束」的那個 —— 它佔用的時間最少,給後面留最多空間', views: [intervalsView(s, { label: '依結束時間排序後' })] }]
  s.forEach(([a, b], i) => {
    if (a >= end) {
      cls[i] = 'done'
      const prev = end
      end = b
      out.push({ note: `[${a},${b}] 的開始 ${a} ≥ 上一個留下的結束 ${prev === -Infinity ? '(還沒有)' : prev} → 不重疊,留下。目前留到 ${b}`, views: [intervalsView(s, { cls: { ...cls, [i]: 'hl' } })] })
    } else {
      cls[i] = 'dim'
      removed++
      out.push({ note: `[${a},${b}] 的開始 ${a} < 目前的結束 ${end} → 重疊,刪掉(它結束得比較晚,留它不划算)。已刪 ${removed} 個`, views: [intervalsView(s, { cls: { ...cls } })] })
    }
  })
  out.push({ note: `留下 ${s.length - removed} 個、刪掉 ${removed} 個`, views: [intervalsView(s, { cls })] })
  return out
}

function startFig(): FigStep[] {
  const s = [...IV].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cls: Record<number, 'done' | 'dim' | 'hl'> = {}
  let keep = 0
  let removed = 0
  cls[0] = 'done'
  const out: FigStep[] = [{ note: '也可以依**開始時間**排序。遇到重疊時,兩個之中留下**比較早結束**的那個', views: [intervalsView(s, { label: '依開始時間排序後', cls: { ...cls } })] }]
  for (let i = 1; i < s.length; i++) {
    if (s[i][0] >= s[keep][1]) {
      cls[i] = 'done'
      out.push({ note: `[${s[i]}] 不和 [${s[keep]}] 重疊 → 留下`, views: [intervalsView(s, { cls: { ...cls, [i]: 'hl' } })] })
      keep = i
    } else {
      removed++
      const drop = s[i][1] < s[keep][1] ? keep : i
      cls[drop] = 'dim'
      if (drop === keep) {
        cls[i] = 'done'
        keep = i
      }
      out.push({ note: `[${s[i]}] 和目前留下的重疊 → 刪掉結束比較晚的 [${s[drop]}]。已刪 ${removed} 個`, views: [intervalsView(s, { cls: { ...cls } })] })
    }
  }
  return out
}

export const q0435: Solution = {
  id: 435,
  plain: '有一堆時間區段(像會議時間),有些互相重疊。最少要刪掉幾個,剩下的才會完全不重疊?訣竅:每次都留下**最早結束**的那個,給後面留最多空間。',
  statement: '給一些區間 `intervals[i] = [start, end]`,回傳最少要移除幾個區間,才能讓剩下的區間**互不重疊**。只有端點相接(例如 [1,2] 和 [2,3])不算重疊。',
  examples: [
    { input: 'intervals = [[1,2],[2,3],[3,4],[1,3]]', output: '1', note: '刪掉 [1,3]' },
    { input: 'intervals = [[1,2],[1,2],[1,2]]', output: '2' },
    { input: 'intervals = [[1,2],[2,3]]', output: '0' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁵` → O(n²) 的 DP 會超時,要 O(n log n)'],
  insight: [
    '「刪最少」= n − 「最多能留幾個互不重疊的區間」。這是經典的**活動選擇問題**',
    '貪心:依**結束時間**排序,能留就留。為什麼選最早結束的?它不影響後面的程度最小 —— 任何最佳解都可以把第一個區間換成「最早結束的」而不變差',
    '依開始時間排序也可以:遇到重疊時,丟掉兩者中**比較晚結束**的那個',
  ],
  approaches: [
    {
      name: '依結束時間排序,能留就留',
      idea: '排序後走一遍,記住「上一個留下的區間的結束時間」。開始 ≥ 它就留下,否則刪掉。',
      steps: ['依 end 排序', '`end = −∞`、`removed = 0`', '`start >= end` → 留下,`end = 這個的 end`', '否則 `removed += 1`'],
      figure: { title: `intervals = ${JSON.stringify(IV)}`, steps: endFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '排序;之後一次掃描。' },
      verdict: '標準解,[[p:interval-scheduling]] 的核心模板。452(最少箭數)、646(最長數對鏈)是同一題換句話說。',
      code: {
        python: `def eraseOverlapIntervals(intervals):
    intervals = sorted(intervals, key=lambda x: x[1])   # 依結束時間
    end = float('-inf')
    removed = 0
    for s, e in intervals:
        if s >= end:                      # 不重疊,留下
            end = e
        else:
            removed += 1                  # 重疊,刪掉(它結束得比較晚)
    return removed`,
        c: `static int byEnd(const void *a, const void *b) {
    int x = (*(int **)a)[1], y = (*(int **)b)[1];
    return (x > y) - (x < y);
}

int eraseOverlapIntervals(int **intervals, int intervalsSize, int *intervalsColSize) {
    qsort(intervals, intervalsSize, sizeof(int *), byEnd);
    long long end = LLONG_MIN;
    int removed = 0;
    for (int i = 0; i < intervalsSize; i++) {
        if (intervals[i][0] >= end) end = intervals[i][1];
        else removed++;
    }
    return removed;
}`,
        cpp: `int eraseOverlapIntervals(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[1] < b[1]; });
    long long end = LLONG_MIN;
    int removed = 0;
    for (auto& iv : intervals) {
        if (iv[0] >= end) end = iv[1];
        else removed++;
    }
    return removed;
}`,
        java: `int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
    long end = Long.MIN_VALUE;
    int removed = 0;
    for (int[] iv : intervals) {
        if (iv[0] >= end) end = iv[1];
        else removed++;
    }
    return removed;
}`,
        javascript: `function eraseOverlapIntervals(intervals) {
  const s = [...intervals].sort((a, b) => a[1] - b[1]);
  let end = -Infinity, removed = 0;
  for (const [a, b] of s) {
    if (a >= end) end = b;
    else removed++;
  }
  return removed;
}`,
      },
    },
    {
      name: '依開始時間排序,重疊時留下早結束的',
      idea: '排序後,記住目前留下的區間的結束 `end`。下一個開始 < end → 重疊,刪掉一個,並把 end 更新成兩者中比較小的;否則 end = 新的結束。',
      steps: ['依 start 排序', '`end = intervals[0].end`', '下一個 `start < end` → `removed += 1`、`end = min(end, 它的 end)`', '否則 `end = 它的 end`'],
      figure: { title: `intervals = ${JSON.stringify(IV)}`, steps: startFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '同上。' },
      verdict: '結果一樣。習慣「依開始排序」(像 56 題)的人可以這樣寫,只要記得重疊時保留早結束的。',
      code: {
        python: `def eraseOverlapIntervals(intervals):
    intervals = sorted(intervals)         # 依開始時間
    end = intervals[0][1]
    removed = 0
    for s, e in intervals[1:]:
        if s < end:                       # 重疊:刪掉一個,留下早結束的
            removed += 1
            end = min(end, e)
        else:
            end = e
    return removed`,
        c: `static int byStart(const void *a, const void *b) {
    int x = (*(int **)a)[0], y = (*(int **)b)[0];
    return (x > y) - (x < y);
}

int eraseOverlapIntervals(int **intervals, int intervalsSize, int *intervalsColSize) {
    qsort(intervals, intervalsSize, sizeof(int *), byStart);
    int end = intervals[0][1], removed = 0;
    for (int i = 1; i < intervalsSize; i++) {
        if (intervals[i][0] < end) { removed++; if (intervals[i][1] < end) end = intervals[i][1]; }
        else end = intervals[i][1];
    }
    return removed;
}`,
        cpp: `int eraseOverlapIntervals(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    int end = intervals[0][1], removed = 0;
    for (size_t i = 1; i < intervals.size(); i++) {
        if (intervals[i][0] < end) { removed++; end = min(end, intervals[i][1]); }
        else end = intervals[i][1];
    }
    return removed;
}`,
        java: `int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    int end = intervals[0][1], removed = 0;
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < end) { removed++; end = Math.min(end, intervals[i][1]); }
        else end = intervals[i][1];
    }
    return removed;
}`,
        javascript: `function eraseOverlapIntervals(intervals) {
  const s = [...intervals].sort((a, b) => a[0] - b[0]);
  let end = s[0][1], removed = 0;
  for (let i = 1; i < s.length; i++) {
    if (s[i][0] < end) {
      removed++;
      end = Math.min(end, s[i][1]);
    } else end = s[i][1];
  }
  return removed;
}`,
      },
    },
  ],
  pitfalls: [
    '依開始時間排序後「能留就留」(不比結束時間):`[[1,100],[2,3],[3,4]]` 會留下 [1,100] 而刪掉後面兩個,答案錯',
    '端點相接不算重疊:判斷要用 `start >= end`,不是 `>`',
    'Java 比較器寫 `a[1] − b[1]`:端點可能到 ±5·10⁴,這題不會溢位,但用 `Integer.compare` 比較安全',
  ],
  followUp: [{ q: '最少用幾支箭射爆所有氣球?', a: '452:一模一樣的貪心,差別只在「端點相接也算重疊」(一支箭可以同時射到)。' }],
  check: {
    kind: 'fn',
    fn: 'eraseOverlapIntervals',
    cases: [
      { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], out: 1 },
      { args: [[[1, 2], [1, 2], [1, 2]]], out: 2 },
      { args: [[[1, 2], [2, 3]]], out: 0 },
      { args: [IV], out: 2 },
      { args: [[[1, 100], [2, 3], [3, 4], [11, 22]]], out: 1 },
      { args: [[[-52, 31], [-73, -26], [82, 97], [-65, -11], [-62, -49], [95, 99], [58, 95], [-31, 49], [66, 98], [-63, 2], [30, 47], [-40, -26]]], out: 7 },
    ],
  },
}
