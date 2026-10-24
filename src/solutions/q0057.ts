import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { intervalsView } from './fig'

// 57. Insert Interval

const IV = [
  [1, 2],
  [3, 5],
  [6, 7],
  [8, 10],
  [12, 16],
]
const NEW = [4, 8]

function threeFig(): FigStep[] {
  const all = [...IV, NEW]
  const lbl = [...IV.map(([a, b]) => `[${a},${b}]`), `新[${NEW}]`]
  const res: number[][] = []
  const cls: Record<number, 'done' | 'hl' | 'cmp' | 'dim'> = { [IV.length]: 'hl' }
  const out: FigStep[] = [{ note: '原本的區間已經排好、互不重疊。新區間(最下面那列)把它們分成三種:完全在它左邊的、和它重疊的、完全在它右邊的', views: [intervalsView(all, { rowLabels: lbl, cls: { ...cls } })] }]
  let [s, e] = NEW
  let i = 0
  while (i < IV.length && IV[i][1] < s) {
    res.push(IV[i])
    cls[i] = 'done'
    out.push({ note: `[${IV[i]}] 的結束 ${IV[i][1]} < 新區間的開始 ${s} → 完全在左邊,原封不動放進答案`, views: [intervalsView(all, { rowLabels: lbl, cls: { ...cls } }), arr(res.map((r) => `[${r}]`), { label: '答案' })] })
    i++
  }
  while (i < IV.length && IV[i][0] <= e) {
    const prevE = e
    s = Math.min(s, IV[i][0])
    e = Math.max(e, IV[i][1])
    cls[i] = 'cmp'
    out.push({ note: `[${IV[i]}] 和新區間重疊(開始 ${IV[i][0]} ≤ ${prevE}) → 合併,新區間變成 [${s},${e}]`, views: [intervalsView(all, { rowLabels: lbl, cls: { ...cls } }), arr(res.map((r) => `[${r}]`), { label: '答案' })] })
    i++
  }
  res.push([s, e])
  out.push({ note: `重疊的都吃進來了,放入合併後的 [${s},${e}]`, views: [arr(res.map((r) => `[${r}]`), { label: '答案', highlight: [res.length - 1] })] })
  while (i < IV.length) {
    res.push(IV[i])
    cls[i] = 'done'
    i++
  }
  out.push({ note: '剩下的都在右邊,原封不動接上', views: [intervalsView(res, { label: '結果', cls: Object.fromEntries(res.map((_, k) => [k, 'done'])) })] })
  return out
}

export const q0057: Solution = {
  id: 57,
  plain: '行事曆上已經有一些排好、互不重疊的時段,現在要再加一個新的時段進去。和它重疊的舊時段要合併成一段,其他的保持不變。',
  statement: '`intervals` 是依開始時間排好、互不重疊的區間。把 `newInterval` 插進去,必要時合併重疊的區間,回傳結果(仍然排好、不重疊)。',
  examples: [
    { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]' },
    { input: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', output: '[[1,2],[3,10],[12,16]]' },
  ],
  constraints: ['`0 ≤ n ≤ 10⁴`,原本的區間**已排序且不重疊**', '可能是空陣列'],
  insight: [
    '最省事:把新區間丟進去,直接用 [56. Merge Intervals](#/q/56) 的做法 → O(n log n)',
    '但原本已經排好了,不用重新排序。新區間會把舊區間分成三段:**結束在它開始之前的**(左邊)、**和它重疊的**、**開始在它結束之後的**(右邊)',
    '左右兩段原封不動;中間那段全部和新區間合併成一個 → 一次掃描 O(n)',
  ],
  approaches: [
    {
      name: '加進去再合併(套用 56 題)',
      idea: '把 newInterval 加進陣列,排序,再做一次區間合併。',
      steps: ['`intervals.append(newInterval)`', '依開始排序', '照 56 題合併'],
      figure: { title: `intervals = ${JSON.stringify(IV)}, newInterval = [${NEW}]`, steps: [threeFig()[0], { note: '全部丟在一起、依開始排序,再照 56 題由左到右合併。結果和下面的方法一樣,但多做了一次排序', views: threeFig().at(-1)!.views }] },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 O(n log n)。' },
      verdict: '能過,寫法最少。但沒有利用「原本已排序」,多花了一個 log。',
      code: {
        python: `def insert(intervals, newInterval):
    res = []
    for s, e in sorted(intervals + [newInterval]):
        if res and s <= res[-1][1]:
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res`,
        c: `static int byStart(const void *a, const void *b) {
    int x = (*(int **)a)[0], y = (*(int **)b)[0];
    return (x > y) - (x < y);
}

int **insert(int **intervals, int intervalsSize, int *intervalsColSize, int *newInterval, int newIntervalSize,
             int *returnSize, int **returnColumnSizes) {
    int n = intervalsSize + 1;
    int **all = malloc(n * sizeof(int *));
    for (int i = 0; i < intervalsSize; i++) all[i] = intervals[i];
    all[intervalsSize] = newInterval;
    qsort(all, n, sizeof(int *), byStart);
    int **res = malloc(n * sizeof(int *)), cnt = 0;
    for (int i = 0; i < n; i++) {
        if (cnt && all[i][0] <= res[cnt - 1][1]) {
            if (all[i][1] > res[cnt - 1][1]) res[cnt - 1][1] = all[i][1];
        } else {
            res[cnt] = malloc(2 * sizeof(int));
            res[cnt][0] = all[i][0]; res[cnt][1] = all[i][1];
            cnt++;
        }
    }
    free(all);
    *returnSize = cnt;
    *returnColumnSizes = malloc(n * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = 2;
    return res;
}`,
        cpp: `vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
    vector<vector<int>> all = intervals, res;
    all.push_back(newInterval);
    sort(all.begin(), all.end());
    for (auto& iv : all) {
        if (!res.empty() && iv[0] <= res.back()[1]) res.back()[1] = max(res.back()[1], iv[1]);
        else res.push_back(iv);
    }
    return res;
}`,
        java: `int[][] insert(int[][] intervals, int[] newInterval) {
    int[][] all = Arrays.copyOf(intervals, intervals.length + 1);
    all[intervals.length] = newInterval;
    Arrays.sort(all, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> res = new ArrayList<>();
    for (int[] iv : all) {
        if (!res.isEmpty() && iv[0] <= res.get(res.size() - 1)[1])
            res.get(res.size() - 1)[1] = Math.max(res.get(res.size() - 1)[1], iv[1]);
        else res.add(new int[]{iv[0], iv[1]});
    }
    return res.toArray(new int[0][]);
}`,
        javascript: `function insert(intervals, newInterval) {
  const all = [...intervals, newInterval].sort((a, b) => a[0] - b[0]);
  const res = [];
  for (const [a, b] of all) {
    if (res.length && a <= res[res.length - 1][1]) res[res.length - 1][1] = Math.max(res[res.length - 1][1], b);
    else res.push([a, b]);
  }
  return res;
}`,
      },
    },
    {
      name: '一次掃描:左邊、重疊、右邊',
      idea: '① 結束 < 新開始的,直接放進答案;② 開始 ≤ 新結束的(重疊),和新區間合併;③ 放入合併後的新區間;④ 剩下的直接放進答案。',
      steps: ['`i = 0`', '`while intervals[i].end < new.start`:放進答案', '`while intervals[i].start <= new.end`:`new = [min(開始), max(結束)]`', '放入 new', '剩下的全部放入'],
      figure: { title: `intervals = ${JSON.stringify(IV)}, newInterval = [${NEW}]`, steps: threeFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個區間看一次;答案最多 n + 1 個。' },
      verdict: '標準解。利用「已排序」把問題拆成三段,是[[p:interval-scheduling]]常見的寫法。',
      code: {
        python: `def insert(intervals, newInterval):
    res, i, n = [], 0, len(intervals)
    s, e = newInterval
    while i < n and intervals[i][1] < s:  # ① 完全在左邊
        res.append(intervals[i])
        i += 1
    while i < n and intervals[i][0] <= e: # ② 重疊 → 合併
        s = min(s, intervals[i][0])
        e = max(e, intervals[i][1])
        i += 1
    res.append([s, e])                    # ③
    res.extend(intervals[i:])             # ④ 完全在右邊
    return res`,
        c: `int **insert(int **intervals, int intervalsSize, int *intervalsColSize, int *newInterval, int newIntervalSize,
             int *returnSize, int **returnColumnSizes) {
    int **res = malloc((intervalsSize + 1) * sizeof(int *)), cnt = 0, i = 0;
    int s = newInterval[0], e = newInterval[1];
    #define PUSH(a, b) do { res[cnt] = malloc(2 * sizeof(int)); res[cnt][0] = (a); res[cnt][1] = (b); cnt++; } while (0)
    while (i < intervalsSize && intervals[i][1] < s) { PUSH(intervals[i][0], intervals[i][1]); i++; }
    while (i < intervalsSize && intervals[i][0] <= e) {
        if (intervals[i][0] < s) s = intervals[i][0];
        if (intervals[i][1] > e) e = intervals[i][1];
        i++;
    }
    PUSH(s, e);
    while (i < intervalsSize) { PUSH(intervals[i][0], intervals[i][1]); i++; }
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int k = 0; k < cnt; k++) (*returnColumnSizes)[k] = 2;
    return res;
}`,
        cpp: `vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
    vector<vector<int>> res;
    int i = 0, n = intervals.size(), s = newInterval[0], e = newInterval[1];
    while (i < n && intervals[i][1] < s) res.push_back(intervals[i++]);
    while (i < n && intervals[i][0] <= e) {
        s = min(s, intervals[i][0]);
        e = max(e, intervals[i][1]);
        i++;
    }
    res.push_back({s, e});
    while (i < n) res.push_back(intervals[i++]);
    return res;
}`,
        java: `int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> res = new ArrayList<>();
    int i = 0, n = intervals.length, s = newInterval[0], e = newInterval[1];
    while (i < n && intervals[i][1] < s) res.add(intervals[i++]);
    while (i < n && intervals[i][0] <= e) {
        s = Math.min(s, intervals[i][0]);
        e = Math.max(e, intervals[i][1]);
        i++;
    }
    res.add(new int[]{s, e});
    while (i < n) res.add(intervals[i++]);
    return res.toArray(new int[0][]);
}`,
        javascript: `function insert(intervals, newInterval) {
  const res = [], n = intervals.length;
  let i = 0, [s, e] = newInterval;
  while (i < n && intervals[i][1] < s) res.push(intervals[i++]);
  while (i < n && intervals[i][0] <= e) {
    s = Math.min(s, intervals[i][0]);
    e = Math.max(e, intervals[i][1]);
    i++;
  }
  res.push([s, e]);
  while (i < n) res.push(intervals[i++]);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '判斷「在左邊」用 `end < new.start`(嚴格小於):`end == new.start` 是端點相接,要合併',
    '原本是空陣列:直接回傳 `[newInterval]`,一次掃描的寫法自然處理掉了',
    '合併時忘了也要更新開始(取 min):新區間可能從某個舊區間的中間開始',
  ],
  followUp: [{ q: '要一直插入、一直查詢?', a: '用平衡樹(Java TreeMap、C++ map)存區間,插入時只找左右相鄰的合併,O(log n)。' }],
  check: {
    kind: 'fn',
    fn: 'insert',
    cases: [
      { args: [[[1, 3], [6, 9]], [2, 5]], out: [[1, 5], [6, 9]] },
      { args: [IV, NEW], out: [[1, 2], [3, 10], [12, 16]] },
      { args: [[], [5, 7]], out: [[5, 7]] },
      { args: [[[1, 5]], [2, 3]], out: [[1, 5]] },
      { args: [[[1, 5]], [6, 8]], out: [[1, 5], [6, 8]] },
      { args: [[[3, 5]], [1, 2]], out: [[1, 2], [3, 5]] },
    ],
  },
}
