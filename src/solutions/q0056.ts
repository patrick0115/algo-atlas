import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { intervalsView } from './fig'

// 56. Merge Intervals

const IV = [
  [8, 10],
  [1, 3],
  [2, 6],
  [15, 18],
  [17, 20],
  [9, 12],
]

function sortFig(): FigStep[] {
  const s = [...IV].sort((a, b) => a[0] - b[0])
  const res: number[][] = []
  const cls: Record<number, 'done' | 'hl' | 'cmp'> = {}
  const out: FigStep[] = [
    { note: '亂序的區間很難判斷誰和誰重疊', views: [intervalsView(IV, { label: '原本的區間' })] },
    { note: '依**開始時間**排序後,會和「目前合併中的區間」重疊的,一定緊接在它後面', views: [intervalsView(s, { label: '依開始排序' })] },
  ]
  s.forEach(([a, b], i) => {
    const last = res[res.length - 1]
    if (last && a <= last[1]) {
      const old = [...last]
      last[1] = Math.max(last[1], b)
      cls[i] = 'cmp'
      out.push({ note: `[${a},${b}] 的開始 ${a} ≤ 目前區間 [${old}] 的結束 ${old[1]} → 重疊,合併成 [${last}]`, views: [intervalsView(s, { cls: { ...cls, [i]: 'hl' } }), arr(res.map((r) => `[${r}]`), { label: '合併結果', highlight: [res.length - 1] })] })
    } else {
      res.push([a, b])
      cls[i] = 'done'
      out.push({ note: last ? `[${a},${b}] 的開始 ${a} > 目前區間的結束 ${last[1]} → 不重疊,開一個新的區間` : `第一個區間 [${a},${b}] 直接放進結果`, views: [intervalsView(s, { cls: { ...cls, [i]: 'hl' } }), arr(res.map((r) => `[${r}]`), { label: '合併結果', highlight: [res.length - 1] })] })
    }
  })
  out.push({ note: `合併完成:${res.map((r) => `[${r}]`).join('、')}`, views: [intervalsView(res, { label: '結果', cls: Object.fromEntries(res.map((_, i) => [i, 'done'])) })] })
  return out
}

function sweepFig(): FigStep[] {
  const ev: [number, number][] = []
  for (const [a, b] of IV) ev.push([a, 1], [b, -1])
  ev.sort((x, y) => x[0] - y[0] || y[1] - x[1])
  let cur = 0
  const out: FigStep[] = [{ note: '掃描線:把每個區間拆成「開始 +1」和「結束 −1」兩個事件,依位置排序(同一個位置先處理開始,端點相接才會合在一起)。目前的計數 > 0 就代表在某個區間裡面', views: [arr(ev.map(([x, d]) => `${x}${d > 0 ? '開' : '關'}`), { label: '事件' })] }]
  let start = 0
  const res: string[] = []
  ev.forEach(([x, d], i) => {
    if (cur === 0 && d > 0) start = x
    cur += d
    let note = `${x} ${d > 0 ? '開始' : '結束'} → 計數 ${cur}`
    if (cur === 0) {
      res.push(`[${start},${x}]`)
      note += `,計數回到 0 → 一個合併後的區間 [${start},${x}] 結束`
    }
    out.push({ note, views: [arr(ev.map(([p, q]) => `${p}${q > 0 ? '開' : '關'}`), { label: '事件', highlight: [i] }), arr(res, { label: '合併結果' })] })
  })
  return out
}

export const q0056: Solution = {
  id: 56,
  plain: '把一堆時間區段裡**有重疊的合併成一段**。像整理行事曆:9-11 點和 10-12 點的會議合起來就是 9-12 點被佔用。',
  statement: '給一組區間 `intervals[i] = [start, end]`,把所有重疊的區間合併,回傳合併後不重疊的區間(順序不限)。端點相接(例如 [1,4] 和 [4,5])也算重疊。',
  examples: [
    { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
    { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁴`', '區間沒有排好序'],
  insight: [
    '亂序時,任何兩個區間都可能重疊,要兩兩比較 → O(n²)',
    '**依開始時間排序**後,事情變簡單:和「目前合併中的區間」重疊的,只可能是緊接在後面的那些。下一個的開始 ≤ 目前的結束 → 重疊,延伸結束;否則目前這段就結束了',
    '另一個角度:掃描線。區間開始 +1、結束 −1,計數從 0 變正是新區段的開始,回到 0 是結束',
  ],
  approaches: [
    {
      name: '排序 + 一次合併',
      idea: '依 start 排序。結果的最後一個區間是 `last`:新區間的 start ≤ last.end → `last.end = max(last.end, end)`;否則把新區間加進結果。',
      steps: ['依 start 排序', '對每個區間 `[s, e]`:結果是空的或 `s > 最後一個的 end` → 加進結果', '否則 → 最後一個的 `end = max(end, e)`', '回傳結果'],
      figure: { title: `intervals = ${JSON.stringify(IV)}`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 O(n log n),合併一次掃描;結果最多 n 個區間。' },
      verdict: '標準解,[[p:interval-scheduling]] 的基本功。57(插入區間)、986(兩組區間的交集)都在這上面變化。',
      code: {
        python: `def merge(intervals):
    intervals = sorted(intervals, key=lambda x: x[0])
    res = []
    for s, e in intervals:
        if res and s <= res[-1][1]:       # 和最後一段重疊 → 延伸
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res`,
        c: `static int byStart(const void *a, const void *b) {
    int x = (*(int **)a)[0], y = (*(int **)b)[0];
    return (x > y) - (x < y);
}

int **merge(int **intervals, int intervalsSize, int *intervalsColSize, int *returnSize, int **returnColumnSizes) {
    qsort(intervals, intervalsSize, sizeof(int *), byStart);
    int **res = malloc(intervalsSize * sizeof(int *)), cnt = 0;
    for (int i = 0; i < intervalsSize; i++) {
        int s = intervals[i][0], e = intervals[i][1];
        if (cnt && s <= res[cnt - 1][1]) {
            if (e > res[cnt - 1][1]) res[cnt - 1][1] = e;
        } else {
            res[cnt] = malloc(2 * sizeof(int));
            res[cnt][0] = s; res[cnt][1] = e;
            cnt++;
        }
    }
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = 2;
    return res;
}`,
        cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> res;
    for (auto& iv : intervals) {
        if (!res.empty() && iv[0] <= res.back()[1]) res.back()[1] = max(res.back()[1], iv[1]);
        else res.push_back(iv);
    }
    return res;
}`,
        java: `int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> res = new ArrayList<>();
    for (int[] iv : intervals) {
        if (!res.isEmpty() && iv[0] <= res.get(res.size() - 1)[1]) {
            int[] last = res.get(res.size() - 1);
            last[1] = Math.max(last[1], iv[1]);
        } else res.add(new int[]{iv[0], iv[1]});
    }
    return res.toArray(new int[0][]);
}`,
        javascript: `function merge(intervals) {
  const s = [...intervals].sort((a, b) => a[0] - b[0]);
  const res = [];
  for (const [a, b] of s) {
    if (res.length && a <= res[res.length - 1][1]) res[res.length - 1][1] = Math.max(res[res.length - 1][1], b);
    else res.push([a, b]);
  }
  return res;
}`,
      },
    },
    {
      name: '掃描線(事件計數)',
      idea: '每個區間變成兩個事件:(start, +1)、(end, −1)。依位置排序,同位置先處理 +1(端點相接才會合併)。計數從 0 變成正的時記下開始,回到 0 時輸出一段。',
      steps: ['事件:`(s, +1)`、`(e, −1)`', '排序:位置小的先;位置相同時 +1 先', '`cur == 0` 且遇到 +1 → `start = 位置`', '`cur += d`;`cur` 回到 0 → 輸出 `[start, 位置]`'],
      figure: { title: `intervals = ${JSON.stringify(IV)}`, steps: sweepFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '2n 個事件排序。' },
      verdict: '比方法一多繞一點,但掃描線能處理更多變形:「同時最多幾個會議」(253)、「每個點被幾個區間覆蓋」都是同一招。',
      code: {
        python: `def merge(intervals):
    ev = []
    for s, e in intervals:
        ev.append((s, -1))                # 用 -1 表示「開始」,排序時同位置會排在結束前面
        ev.append((e, 1))
    ev.sort()
    res, cur, start = [], 0, 0
    for x, kind in ev:
        if kind == -1:
            if cur == 0:
                start = x
            cur += 1
        else:
            cur -= 1
            if cur == 0:
                res.append([start, x])
    return res`,
        c: `static int byEvent(const void *a, const void *b) {
    const int *x = a, *y = b;
    if (x[0] != y[0]) return (x[0] > y[0]) - (x[0] < y[0]);
    return y[1] - x[1];                   // 同位置:開始(+1)排前面
}

int **merge(int **intervals, int intervalsSize, int *intervalsColSize, int *returnSize, int **returnColumnSizes) {
    int m = 2 * intervalsSize;
    int (*ev)[2] = malloc(m * sizeof(*ev));
    for (int i = 0; i < intervalsSize; i++) {
        ev[2 * i][0] = intervals[i][0]; ev[2 * i][1] = 1;
        ev[2 * i + 1][0] = intervals[i][1]; ev[2 * i + 1][1] = -1;
    }
    qsort(ev, m, sizeof(*ev), byEvent);
    int **res = malloc(intervalsSize * sizeof(int *)), cnt = 0, cur = 0, start = 0;
    for (int i = 0; i < m; i++) {
        if (ev[i][1] > 0 && cur == 0) start = ev[i][0];
        cur += ev[i][1];
        if (cur == 0) {
            res[cnt] = malloc(2 * sizeof(int));
            res[cnt][0] = start; res[cnt][1] = ev[i][0];
            cnt++;
        }
    }
    free(ev);
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = 2;
    return res;
}`,
        cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    vector<pair<int, int>> ev;
    for (auto& iv : intervals) { ev.push_back({iv[0], -1}); ev.push_back({iv[1], 1}); }
    sort(ev.begin(), ev.end());           // 同位置:-1(開始)排前面
    vector<vector<int>> res;
    int cur = 0, start = 0;
    for (auto [x, k] : ev) {
        if (k == -1) { if (cur == 0) start = x; cur++; }
        else if (--cur == 0) res.push_back({start, x});
    }
    return res;
}`,
        java: `int[][] merge(int[][] intervals) {
    int[][] ev = new int[intervals.length * 2][];
    for (int i = 0; i < intervals.length; i++) {
        ev[2 * i] = new int[]{intervals[i][0], -1};
        ev[2 * i + 1] = new int[]{intervals[i][1], 1};
    }
    Arrays.sort(ev, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
    List<int[]> res = new ArrayList<>();
    int cur = 0, start = 0;
    for (int[] e : ev) {
        if (e[1] == -1) { if (cur == 0) start = e[0]; cur++; }
        else if (--cur == 0) res.add(new int[]{start, e[0]});
    }
    return res.toArray(new int[0][]);
}`,
        javascript: `function merge(intervals) {
  const ev = [];
  for (const [a, b] of intervals) ev.push([a, -1], [b, 1]);
  ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const res = [];
  let cur = 0, start = 0;
  for (const [x, k] of ev) {
    if (k === -1) {
      if (cur === 0) start = x;
      cur++;
    } else if (--cur === 0) res.push([start, x]);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '沒有先排序:`[[2,3],[1,4]]` 會被合併成 [2,4],開始時間 1 不見了;`[[1,2],[3,4],[2,3]]` 會得到 [[1,2],[3,4]],漏掉合併',
    '合併時直接用新區間的 end:被大區間包住的小區間(`[1,10]` 後面接 `[2,3]`)會把 end 縮短,要取 max',
    '端點相接算重疊:條件是 `s <= last.end`,不是 `<`',
    '掃描線同一個位置要先處理「開始」,不然 [1,4]、[4,5] 會被切成兩段',
  ],
  followUp: [{ q: '把一個新區間插進已經排好、不重疊的區間裡?', a: '[57. Insert Interval](#/q/57):分三段處理 —— 完全在左邊的、和新區間重疊的(合併)、完全在右邊的,O(n)。' }],
  check: {
    kind: 'fn',
    fn: 'merge',
    compare: 'sorted',
    cases: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], out: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], out: [[1, 5]] },
      { args: [IV], out: [[1, 6], [8, 12], [15, 20]] },
      { args: [[[1, 10], [2, 3]]], out: [[1, 10]] },
      { args: [[[5, 5]]], out: [[5, 5]] },
      { args: [[[2, 3], [1, 4]]], out: [[1, 4]] },
    ],
  },
}
