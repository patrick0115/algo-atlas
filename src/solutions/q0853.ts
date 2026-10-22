import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 853. Car Fleet

const TARGET = 12
const POS = [10, 8, 0, 5, 3]
const SPD = [2, 4, 1, 1, 3]

const cars = () =>
  POS.map((p, i) => ({ p, s: SPD[i], t: (TARGET - p) / SPD[i] }))
    .sort((a, b) => b.p - a.p)
const fmt = (t: number) => (Number.isInteger(t) ? String(t) : t.toFixed(2))

function stackFig(): FigStep[] {
  const cs = cars()
  const st: number[] = []
  const out: FigStep[] = [
    { note: `每台車「自己一路開到終點」要花的時間 = (終點 − 位置) / 速度。後面的車追不過前面的車,追上了就併成同一個車隊、用前車的速度`, views: [arr(POS, { label: '位置' }), arr(SPD, { label: '速度' })] },
    { note: '依位置**由近終點到遠**排序,算出每台的時間', views: [arr(cs.map((c) => c.p), { label: '位置(近 → 遠)' }), arr(cs.map((c) => fmt(c.t)), { label: '到終點的時間' })] },
  ]
  cs.forEach((c, i) => {
    const catches = st.length > 0 && c.t <= st[st.length - 1]
    if (!catches) st.push(c.t)
    out.push({
      note: catches
        ? `位置 ${c.p} 的車要 ${fmt(c.t)},不比前面車隊的 ${fmt(st[st.length - 1])} 多 → 會在終點前追上,併入那個車隊(堆疊不動)`
        : `位置 ${c.p} 的車要 ${fmt(c.t)},${st.length > 1 ? `比前面車隊的 ${fmt(st[st.length - 2])} 慢` : '前面沒有車隊'} → 追不上,自己成為新的車隊`,
      views: [arr(cs.map((x) => fmt(x.t)), { label: '到終點的時間(近 → 遠)', highlight: [i] }), arr(st.map(fmt), { label: '堆疊(每個車隊的時間)' })],
    })
  })
  out.push({ note: `堆疊裡有 ${st.length} 個 → ${st.length} 個車隊`, views: [arr(st.map(fmt), { label: '車隊' })] })
  return out
}

export const q0853: Solution = {
  id: 853,
  plain: '一條單線道上有很多車往同一個終點開,車子不能超車:後面的車追上前面的車,就只能跟在後面,變成一個「車隊」一起開。問最後總共有幾個車隊抵達終點。',
  statement:
    '單線道上有 n 台車往 `target` 開,第 i 台在 `position[i]`、速度 `speed[i]`。車不能超車,追上前車就併成一個**車隊**(以較慢的速度一起走);剛好在終點追上也算同一隊。回傳抵達終點的車隊數。',
  examples: [
    { input: 'target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]', output: '3', note: '10 和 8 一隊;0 自己;5 和 3 一隊' },
    { input: 'target = 10, position = [3], speed = [3]', output: '1' },
    { input: 'target = 100, position = [0,2,4], speed = [4,2,1]', output: '1' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁵`,位置都不同', '位置 < target ≤ 10⁶'],
  insight: [
    '關鍵:只要比較「每台車單獨開到終點要多久」。後車時間 ≤ 前車(的車隊)時間 → 一定會在終點前追上,併入',
    '從**最靠近終點**的車開始看:它前面沒人,一定是一個車隊的領頭',
    '往後看:時間比目前最前面那個車隊**長**的,追不上,自己成為新車隊;否則併入',
    '用堆疊記每個車隊的時間(會是遞增的,單調堆疊),最後堆疊大小就是答案;其實只要記「最後一個車隊的時間」就夠',
  ],
  approaches: [
    {
      name: '排序 + 單調堆疊',
      idea: '依位置由大到小排序,算每台車的抵達時間。時間比堆疊頂端大 → push(新車隊);否則併入(不動)。',
      steps: ['算 `time = (target − pos) / speed`', '依位置由大到小排序', '對每台車:`stack` 空或 `time > stack.top` → push', '回傳 `len(stack)`'],
      figure: { title: `target = ${TARGET}, position = [${POS.join(',')}], speed = [${SPD.join(',')}]`, steps: stackFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 O(n log n);堆疊最多 n 個。' },
      verdict: 'NeetCode 的標準解,把「車隊」具體放在堆疊裡,好理解。',
      code: {
        python: `def carFleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)   # 離終點近的先
    st = []                               # 每個車隊抵達終點的時間
    for p, s in cars:
        t = (target - p) / s
        if not st or t > st[-1]:          # 比前面的車隊慢 → 追不上
            st.append(t)
    return len(st)`,
        c: `typedef struct { int p, s; } Car;

static int byPosDesc(const void *a, const void *b) {
    return ((const Car *)b)->p - ((const Car *)a)->p;
}

int carFleet(int target, int *position, int positionSize, int *speed, int speedSize) {
    Car *c = malloc(positionSize * sizeof(Car));
    for (int i = 0; i < positionSize; i++) { c[i].p = position[i]; c[i].s = speed[i]; }
    qsort(c, positionSize, sizeof(Car), byPosDesc);
    double *st = malloc(positionSize * sizeof(double));
    int top = 0;
    for (int i = 0; i < positionSize; i++) {
        double t = (double)(target - c[i].p) / c[i].s;
        if (top == 0 || t > st[top - 1]) st[top++] = t;
    }
    free(c); free(st);
    return top;
}`,
        cpp: `int carFleet(int target, vector<int>& position, vector<int>& speed) {
    int n = position.size();
    vector<pair<int, int>> cars;
    for (int i = 0; i < n; i++) cars.push_back({position[i], speed[i]});
    sort(cars.rbegin(), cars.rend());     // 位置由大到小
    vector<double> st;
    for (auto& [p, s] : cars) {
        double t = double(target - p) / s;
        if (st.empty() || t > st.back()) st.push_back(t);
    }
    return st.size();
}`,
        java: `int carFleet(int target, int[] position, int[] speed) {
    int n = position.length;
    Integer[] idx = new Integer[n];
    for (int i = 0; i < n; i++) idx[i] = i;
    Arrays.sort(idx, (a, b) -> position[b] - position[a]);
    Deque<Double> st = new ArrayDeque<>();
    for (int i : idx) {
        double t = (double) (target - position[i]) / speed[i];
        if (st.isEmpty() || t > st.peek()) st.push(t);
    }
    return st.size();
}`,
        javascript: `function carFleet(target, position, speed) {
  const cars = position.map((p, i) => [p, speed[i]]).sort((a, b) => b[0] - a[0]);
  const st = [];
  for (const [p, s] of cars) {
    const t = (target - p) / s;
    if (!st.length || t > st[st.length - 1]) st.push(t);
  }
  return st.length;
}`,
      },
    },
    {
      name: '排序 + 只記最後一個車隊的時間',
      idea: '堆疊裡其實只會用到頂端。用一個變數 `slowest` 記「目前最後一個車隊的時間」,遇到更慢的車就車隊數 +1、更新 slowest。',
      steps: ['依位置由大到小排序', '`fleets = 0`、`slowest = 0`', '每台車 `t > slowest` → `fleets++`、`slowest = t`', '回傳 `fleets`'],
      figure: { title: `target = ${TARGET}, position = [${POS.join(',')}], speed = [${SPD.join(',')}]`, steps: stackFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序本身需要 O(n) 存配對;計算過程只用兩個變數。' },
      verdict: '最精簡。看出「堆疊只用到頂端」就能把它換成一個變數,是常見的優化思路。',
      code: {
        python: `def carFleet(target, position, speed):
    fleets, slowest = 0, 0.0
    for p, s in sorted(zip(position, speed), reverse=True):
        t = (target - p) / s
        if t > slowest:                   # 追不上前面的車隊,自成一隊
            fleets += 1
            slowest = t
    return fleets`,
        c: `typedef struct { int p, s; } Car;

static int byPosDesc(const void *a, const void *b) {
    return ((const Car *)b)->p - ((const Car *)a)->p;
}

int carFleet(int target, int *position, int positionSize, int *speed, int speedSize) {
    Car *c = malloc(positionSize * sizeof(Car));
    for (int i = 0; i < positionSize; i++) { c[i].p = position[i]; c[i].s = speed[i]; }
    qsort(c, positionSize, sizeof(Car), byPosDesc);
    int fleets = 0;
    double slowest = 0;
    for (int i = 0; i < positionSize; i++) {
        double t = (double)(target - c[i].p) / c[i].s;
        if (t > slowest) { fleets++; slowest = t; }
    }
    free(c);
    return fleets;
}`,
        cpp: `int carFleet(int target, vector<int>& position, vector<int>& speed) {
    int n = position.size();
    vector<pair<int, int>> cars;
    for (int i = 0; i < n; i++) cars.push_back({position[i], speed[i]});
    sort(cars.rbegin(), cars.rend());
    int fleets = 0;
    double slowest = 0;
    for (auto& [p, s] : cars) {
        double t = double(target - p) / s;
        if (t > slowest) { fleets++; slowest = t; }
    }
    return fleets;
}`,
        java: `int carFleet(int target, int[] position, int[] speed) {
    int n = position.length;
    Integer[] idx = new Integer[n];
    for (int i = 0; i < n; i++) idx[i] = i;
    Arrays.sort(idx, (a, b) -> position[b] - position[a]);
    int fleets = 0;
    double slowest = 0;
    for (int i : idx) {
        double t = (double) (target - position[i]) / speed[i];
        if (t > slowest) { fleets++; slowest = t; }
    }
    return fleets;
}`,
        javascript: `function carFleet(target, position, speed) {
  const cars = position.map((p, i) => [p, speed[i]]).sort((a, b) => b[0] - a[0]);
  let fleets = 0, slowest = 0;
  for (const [p, s] of cars) {
    const t = (target - p) / s;
    if (t > slowest) {
      fleets++;
      slowest = t;
    }
  }
  return fleets;
}`,
      },
    },
    {
      name: '用位置當索引,不用排序',
      idea: '位置都小於 target(≤ 10⁶),開一個長度 target 的陣列,`time[位置] = 抵達時間`。從 target − 1 往 0 走一遍,就是「由近到遠」的順序。',
      steps: ['`time = [0] * target`', '`time[position[i]] = (target − position[i]) / speed[i]`', '位置從大到小走:有車且時間 > slowest → 車隊 +1'],
      figure: { title: `target = ${TARGET}, position = [${POS.join(',')}], speed = [${SPD.join(',')}]`, steps: stackFig().slice(0, 2) },
      complexity: { time: 'O(n + target)', space: 'O(target)', why: '走一遍位置範圍。target 最多 10⁶,和 n log n 差不多。' },
      verdict: '值域小時可以用「值當索引」取代排序(計數排序的想法)。target 很大時就不適用。',
      code: {
        python: `def carFleet(target, position, speed):
    time = [0.0] * target
    for p, s in zip(position, speed):
        time[p] = (target - p) / s
    fleets, slowest = 0, 0.0
    for p in range(target - 1, -1, -1):   # 由近終點到遠
        if time[p] > slowest:
            fleets += 1
            slowest = time[p]
    return fleets`,
        c: `int carFleet(int target, int *position, int positionSize, int *speed, int speedSize) {
    double *time = calloc(target, sizeof(double));
    for (int i = 0; i < positionSize; i++) time[position[i]] = (double)(target - position[i]) / speed[i];
    int fleets = 0;
    double slowest = 0;
    for (int p = target - 1; p >= 0; p--)
        if (time[p] > slowest) { fleets++; slowest = time[p]; }
    free(time);
    return fleets;
}`,
        cpp: `int carFleet(int target, vector<int>& position, vector<int>& speed) {
    vector<double> time(target, 0);
    for (size_t i = 0; i < position.size(); i++) time[position[i]] = double(target - position[i]) / speed[i];
    int fleets = 0;
    double slowest = 0;
    for (int p = target - 1; p >= 0; p--)
        if (time[p] > slowest) { fleets++; slowest = time[p]; }
    return fleets;
}`,
        java: `int carFleet(int target, int[] position, int[] speed) {
    double[] time = new double[target];
    for (int i = 0; i < position.length; i++) time[position[i]] = (double) (target - position[i]) / speed[i];
    int fleets = 0;
    double slowest = 0;
    for (int p = target - 1; p >= 0; p--)
        if (time[p] > slowest) { fleets++; slowest = time[p]; }
    return fleets;
}`,
        javascript: `function carFleet(target, position, speed) {
  const time = new Float64Array(target);
  position.forEach((p, i) => (time[p] = (target - p) / speed[i]));
  let fleets = 0, slowest = 0;
  for (let p = target - 1; p >= 0; p--)
    if (time[p] > slowest) {
      fleets++;
      slowest = time[p];
    }
  return fleets;
}`,
      },
    },
  ],
  pitfalls: [
    '從離終點**遠**的車開始處理:後面的車會不會追上,取決於前面的車,必須先處理前面的',
    '時間用整數除法:`(12 − 0) / 1 = 12`、`(12 − 3) / 3 = 3`,但很多情況會是小數,要用浮點數',
    '判斷「追上」要用 `≤`(時間相等 = 剛好在終點追上,題目算同一隊),所以新車隊的條件是 `>`',
  ],
  followUp: [{ q: '要知道每台車是在什麼時間點被追上?', a: '1776. Car Fleet II:從後往前用單調堆疊,算兩車的相遇時間,比較複雜。' }],
  check: {
    kind: 'fn',
    fn: 'carFleet',
    cases: [
      { args: [TARGET, POS, SPD], out: 3 },
      { args: [10, [3], [3]], out: 1 },
      { args: [100, [0, 2, 4], [4, 2, 1]], out: 1 },
      { args: [10, [6, 8], [3, 2]], out: 2 },
      { args: [10, [0, 4, 2], [2, 1, 3]], out: 1 },
    ],
  },
}
