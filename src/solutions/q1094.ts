import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1094. Car Pooling
const TRIPS = [[2, 1, 5], [3, 3, 7]]
const diffFig: FigStep[] = [
  { note: '一趟 [人數,上車站,下車站] 在上車站增加人數,在下車站減少人數。乘客到站就下車。', views: [arr(['2 人:1→5', '3 人:3→7'], { label: 'trips' })] },
  { note: '在站 3 時車上有 2+3=5 人,若車容量只有 4 就超載。', views: [arr([0, 2, 2, 5, 5, 3, 3, 0], { label: '各站出發時車上人數', highlight: [3, 4] }), arr([4], { label: '容量' })] },
]
const eventFig: FigStep[] = [
  { note: '也能把每次上下車變成事件:站 1 +2、站 3 +3、站 5 −2、站 7 −3。', views: [arr(['1:+2', '3:+3', '5:−2', '7:−3'], { label: '事件' })] },
  { note: '按站排序,同站先處理下車再處理上車;掃描車上人數,超過容量就失敗。', views: [arr([2, 5, 3, 0], { label: '事件後人數', highlight: [1] })] },
]

export const q1094: Solution = {
  id: 1094,
  plain: '車沿著固定方向行駛,每一趟有人在某站上車、某站下車。沿路任何時候車上人數都不能超過容量。',
  statement: '給多趟行程 trips,每筆是 [乘客數,上車位置,下車位置],以及車容量 capacity。車只往位置增加的方向走,問能否完成所有接送。',
  examples: [
    { input: 'trips = [[2,1,5],[3,3,7]], capacity = 4', output: 'false' },
    { input: 'trips = [[2,1,5],[3,3,7]], capacity = 5', output: 'true' },
  ],
  constraints: ['位置不超過 1000', '到下車位置時乘客已下車,不再佔座位'],
  insight: ['每趟行程讓一整段位置的車上人數增加。', '差分陣列可在上車位置 +p、下車位置 −p,最後一次前綴和還原各站人數。', '若位置範圍變大,也能只排序上下車事件。'],
  approaches: [
    {
      name: '差分陣列',
      idea: '只在上車站與下車站記錄人數變化,掃一遍前綴和得到當前車上人數。',
      steps: ['建立位置範圍的 diff 零陣列', '每趟 [p,from,to]:diff[from] += p,diff[to] -= p', '由小到大掃位置並累加 diff', '只要人數 > capacity 就回傳 false,否則 true'],
      figure: { title: '兩趟行程的車上人數', steps: diffFig },
      complexity: { time: 'O(T+U)', space: 'O(U)', why: 'T 為行程數,U 為最大位置範圍,此題 U ≤ 1000。' },
      verdict: '位置範圍小時最簡單。',
      code: {
        python: `def carPooling(trips, capacity):
    diff = [0] * 1002
    for passengers, start, end in trips:
        diff[start] += passengers
        diff[end] -= passengers
    onboard = 0
    for change in diff:
        onboard += change
        if onboard > capacity:
            return False
    return True`,
        c: `bool carPooling(int **trips, int tripsSize, int *tripsColSize, int capacity) {
    int diff[1002] = {0};
    for (int i = 0; i < tripsSize; i++) {
        diff[trips[i][1]] += trips[i][0];
        diff[trips[i][2]] -= trips[i][0];
    }
    int onboard = 0;
    for (int i = 0; i < 1002; i++) {
        onboard += diff[i];
        if (onboard > capacity) return false;
    }
    return true;
}`,
        cpp: `bool carPooling(vector<vector<int>>& trips, int capacity) {
    vector<int> diff(1002);
    for (auto& t : trips) { diff[t[1]] += t[0]; diff[t[2]] -= t[0]; }
    int onboard = 0;
    for (int change : diff) {
        onboard += change;
        if (onboard > capacity) return false;
    }
    return true;
}`,
        java: `boolean carPooling(int[][] trips, int capacity) {
    int[] diff = new int[1002];
    for (int[] t : trips) { diff[t[1]] += t[0]; diff[t[2]] -= t[0]; }
    int onboard = 0;
    for (int change : diff) {
        onboard += change;
        if (onboard > capacity) return false;
    }
    return true;
}`,
        javascript: `function carPooling(trips, capacity) {
  const diff = Array(1002).fill(0);
  for (const [p, start, end] of trips) { diff[start] += p; diff[end] -= p; }
  let onboard = 0;
  for (const change of diff) {
    onboard += change;
    if (onboard > capacity) return false;
  }
  return true;
}`,
      },
    },
    {
      name: '排序上下車事件',
      idea: '把上車與下車視為位置上的人數變化,按位置處理;同站先下車。',
      steps: ['每趟新增 (from,+p) 和 (to,−p) 兩個事件', '按位置升序,同位置依變化量升序排序', '依序累加車上人數並檢查 capacity'],
      figure: { title: '只掃有人上下車的站', steps: eventFig },
      complexity: { time: 'O(T log T)', space: 'O(T)', why: '至多 2T 個事件需要排序。' },
      verdict: '位置很大或稀疏時較通用。',
      code: {
        python: `def carPooling(trips, capacity):
    events = []
    for p, start, end in trips:
        events.append((start, p))
        events.append((end, -p))
    events.sort()
    onboard = 0
    for _, change in events:
        onboard += change
        if onboard > capacity:
            return False
    return True`,
        c: `struct Event1094 { int position, change; };
static int cmp1094(const void *a, const void *b) {
    const struct Event1094 *x = a, *y = b;
    if (x->position != y->position) return (x->position > y->position) - (x->position < y->position);
    return (x->change > y->change) - (x->change < y->change);
}
bool carPooling(int **trips, int tripsSize, int *tripsColSize, int capacity) {
    int n = 2 * tripsSize;
    struct Event1094 *events = malloc(n * sizeof(struct Event1094));
    for (int i = 0; i < tripsSize; i++) {
        events[2 * i] = (struct Event1094){trips[i][1], trips[i][0]};
        events[2 * i + 1] = (struct Event1094){trips[i][2], -trips[i][0]};
    }
    qsort(events, n, sizeof(struct Event1094), cmp1094);
    int onboard = 0;
    for (int i = 0; i < n; i++) {
        onboard += events[i].change;
        if (onboard > capacity) { free(events); return false; }
    }
    free(events);
    return true;
}`,
        cpp: `bool carPooling(vector<vector<int>>& trips, int capacity) {
    vector<pair<int,int>> events;
    for (auto& t : trips) {
        events.push_back({t[1], t[0]});
        events.push_back({t[2], -t[0]});
    }
    sort(events.begin(), events.end());
    int onboard = 0;
    for (auto [position, change] : events) {
        onboard += change;
        if (onboard > capacity) return false;
    }
    return true;
}`,
        java: `boolean carPooling(int[][] trips, int capacity) {
    int[][] events = new int[trips.length * 2][2];
    for (int i = 0; i < trips.length; i++) {
        events[2 * i] = new int[]{trips[i][1], trips[i][0]};
        events[2 * i + 1] = new int[]{trips[i][2], -trips[i][0]};
    }
    Arrays.sort(events, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
    int onboard = 0;
    for (int[] event : events) {
        onboard += event[1];
        if (onboard > capacity) return false;
    }
    return true;
}`,
        javascript: `function carPooling(trips, capacity) {
  const events = [];
  for (const [p, start, end] of trips) { events.push([start, p], [end, -p]); }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let onboard = 0;
  for (const [, change] of events) {
    onboard += change;
    if (onboard > capacity) return false;
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['下車位置不再佔座位,差分需在 end 減去乘客數。', '同站有上下車時,事件法要先處理下車。', '只看每趟個別乘客數不夠,重疊行程會累積。'],
  check: { kind: 'fn', fn: 'carPooling', cases: [
    { args: [TRIPS, 4], out: false }, { args: [TRIPS, 5], out: true },
    { args: [[[2, 1, 5], [3, 5, 7]], 3], out: true },
    { args: [[[3, 2, 7], [3, 7, 9]], 3], out: true },
  ] },
}
