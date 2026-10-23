import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1834. Single-Threaded CPU

const TASKS = [[1, 2], [2, 4], [3, 2], [4, 1]]

function heapFig(): FigStep[] {
  return [
    { note: 'CPU 一次只能做一個任務。閒下來時,從「已經進來」的任務裡挑**處理時間最短**的(一樣短就挑索引小的)。任務先依進來的時間排序', views: [arr(TASKS.map(([e, p], i) => `#${i}:進 ${e} 做 ${p}`), { label: 'tasks' })] },
    { note: '時間 1:只有 #0 進來 → 做 #0,做完是 3。時間 3 時 #1(進 2)、#2(進 3)都在等,放進最小堆積(依處理時間)', views: [arr(['(2,#2)', '(4,#1)'], { label: '等待中的任務(堆積)', highlight: [0] })] },
    { note: '挑處理時間最短的 #2 → 做到 5;這時 #3 也進來了 → 堆積 {(1,#3), (4,#1)},挑 #3 → 6,最後 #1。順序 [0, 2, 3, 1]', views: [arr([0, 2, 3, 1], { label: '執行順序', done: [0, 1, 2, 3] })] },
    { note: '堆積空了、下一個任務還沒到時,時間要直接**跳到**下一個任務進來的時刻', views: [arr(['time = max(time, 下一個的 enqueueTime)'], { label: '空閒時' })] },
  ]
}

function scanFig(): FigStep[] {
  return [
    { note: '不用堆積:每次 CPU 空閒時,掃過所有還沒做的任務,挑「已經進來」裡處理時間最短的', views: [arr(TASKS.map(([e, p], i) => `#${i}:(${e},${p})`), { label: 'tasks', dim: [0] })] },
    { note: '每次挑選 O(n),總共 O(n²)。邏輯一樣,只是「找最小」從堆積換成線性掃描', views: [arr([0, 2, 3, 1], { label: '執行順序' })] },
  ]
}

export const q1834: Solution = {
  id: 1834,
  plain: '一台單核心 CPU 處理一連串任務,每個任務有「什麼時候可以開始」和「要做多久」。CPU 每次閒下來,就從已經在排隊的任務中挑最快做完的(一樣快就挑編號小的)。回傳 CPU 處理任務的順序。',
  statement: '`tasks[i] = [enqueueTime, processingTime]`。CPU 空閒且有可執行的任務時,選**處理時間最短**的(同時則選索引最小的)開始執行,執行中不能中斷;沒有可執行任務時保持空閒。回傳執行任務的索引順序。',
  examples: [
    { input: 'tasks = [[1,2],[2,4],[3,2],[4,1]]', output: '[0,2,3,1]' },
    { input: 'tasks = [[7,10],[7,12],[7,5],[7,4],[7,2]]', output: '[4,3,2,0,1]' },
  ],
  constraints: ['n ≤ 10⁵', '時間 ≤ 10⁹ → 時間累加要用 64 位元'],
  insight: ['這是事件模擬:時間往前推,任務依序「進入」等待區', '等待區要快速拿出 (處理時間, 索引) 最小的 → 最小堆積', '等待區空了就把時間直接跳到下一個任務的進入時間'],
  approaches: [
    {
      name: '依進入時間排序 + 最小堆積',
      idea: '任務索引依 enqueueTime 排序;`time` 前進時把已進入的任務推進堆積 (處理時間, 索引);每次彈出一個執行。',
      steps: ['`order` = 依 enqueueTime 排序的索引;`i = 0`、`time = 0`', '`while 還有任務`:堆積空 → `time = max(time, 下一個的 enqueueTime)`', '把所有 `enqueueTime <= time` 的推進堆積', '彈出 (p, idx):記下 idx、`time += p`'],
      figure: { title: `tasks = ${JSON.stringify(TASKS)}`, steps: heapFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 + 每個任務進出堆積各一次。' },
      verdict: '最推薦,[[p:heap]]做事件模擬的經典題。',
      code: {
        python: `import heapq

def getOrder(tasks):
    order = sorted(range(len(tasks)), key=lambda i: tasks[i][0])
    res, h, i, time = [], [], 0, 0
    while len(res) < len(tasks):
        if not h and time < tasks[order[i]][0]:
            time = tasks[order[i]][0]         # 空閒:直接跳到下一個任務進來
        while i < len(order) and tasks[order[i]][0] <= time:
            j = order[i]
            heapq.heappush(h, (tasks[j][1], j))   # (處理時間, 索引)
            i += 1
        p, j = heapq.heappop(h)
        res.append(j)
        time += p
    return res`,
        c: `static int **T_;
static int cmpE(const void *a, const void *b) {
    int x = *(int *)a, y = *(int *)b;
    return T_[x][0] != T_[y][0] ? (T_[x][0] > T_[y][0]) - (T_[x][0] < T_[y][0]) : x - y;
}
static bool lessP(int a, int b) { return T_[a][1] != T_[b][1] ? T_[a][1] < T_[b][1] : a < b; }

int *getOrder(int **tasks, int tasksSize, int *tasksColSize, int *returnSize) {
    int n = tasksSize, *order = malloc(n * sizeof(int)), *h = malloc(n * sizeof(int)), *res = malloc(n * sizeof(int));
    int hn = 0, i = 0, k = 0;
    long long time = 0;
    T_ = tasks;
    for (int t = 0; t < n; t++) order[t] = t;
    qsort(order, n, sizeof(int), cmpE);
    while (k < n) {
        if (hn == 0 && time < tasks[order[i]][0]) time = tasks[order[i]][0];
        while (i < n && tasks[order[i]][0] <= time) {
            h[hn] = order[i++];
            for (int c = hn++; c && lessP(h[c], h[(c - 1) / 2]); c = (c - 1) / 2) { int x = h[c]; h[c] = h[(c - 1) / 2]; h[(c - 1) / 2] = x; }
        }
        int j = h[0];
        h[0] = h[--hn];
        for (int c = 0;;) {
            int m = c, l = 2 * c + 1, r = l + 1;
            if (l < hn && lessP(h[l], h[m])) m = l;
            if (r < hn && lessP(h[r], h[m])) m = r;
            if (m == c) break;
            int x = h[c]; h[c] = h[m]; h[m] = x;
            c = m;
        }
        res[k++] = j;
        time += tasks[j][1];
    }
    free(order); free(h);
    *returnSize = n;
    return res;
}`,
        cpp: `vector<int> getOrder(vector<vector<int>>& tasks) {
    int n = tasks.size();
    vector<int> order(n), res;
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return tasks[a][0] < tasks[b][0]; });
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    long long time = 0;
    int i = 0;
    while ((int)res.size() < n) {
        if (pq.empty() && time < tasks[order[i]][0]) time = tasks[order[i]][0];
        while (i < n && tasks[order[i]][0] <= time) { pq.push({tasks[order[i]][1], order[i]}); i++; }
        auto [p, j] = pq.top(); pq.pop();
        res.push_back(j);
        time += p;
    }
    return res;
}`,
        java: `int[] getOrder(int[][] tasks) {
    int n = tasks.length;
    Integer[] order = new Integer[n];
    for (int i = 0; i < n; i++) order[i] = i;
    Arrays.sort(order, (a, b) -> tasks[a][0] - tasks[b][0]);
    PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> tasks[a][1] != tasks[b][1] ? tasks[a][1] - tasks[b][1] : a - b);
    int[] res = new int[n];
    long time = 0;
    int i = 0, k = 0;
    while (k < n) {
        if (pq.isEmpty() && time < tasks[order[i]][0]) time = tasks[order[i]][0];
        while (i < n && tasks[order[i]][0] <= time) pq.offer(order[i++]);
        int j = pq.poll();
        res[k++] = j;
        time += tasks[j][1];
    }
    return res;
}`,
        javascript: `function getOrder(tasks) {
  const n = tasks.length, order = [...Array(n).keys()].sort((a, b) => tasks[a][0] - tasks[b][0]);
  const less = (a, b) => (tasks[a][1] !== tasks[b][1] ? tasks[a][1] < tasks[b][1] : a < b);
  const h = [], res = [];
  const push = (v) => {
    h.push(v);
    for (let c = h.length - 1; c && less(h[c], h[(c - 1) >> 1]); c = (c - 1) >> 1) [h[c], h[(c - 1) >> 1]] = [h[(c - 1) >> 1], h[c]];
  };
  const pop = () => {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let c = 0; ; ) {
        let m = c;
        const l = 2 * c + 1, r = l + 1;
        if (l < h.length && less(h[l], h[m])) m = l;
        if (r < h.length && less(h[r], h[m])) m = r;
        if (m === c) break;
        [h[c], h[m]] = [h[m], h[c]];
        c = m;
      }
    }
    return top;
  };
  let time = 0, i = 0;
  while (res.length < n) {
    if (!h.length && time < tasks[order[i]][0]) time = tasks[order[i]][0];
    while (i < n && tasks[order[i]][0] <= time) push(order[i++]);
    const j = pop();
    res.push(j);
    time += tasks[j][1];
  }
  return res;
}`,
      },
    },
    {
      name: '每次線性掃描挑任務',
      idea: '同樣的模擬,但每次 CPU 空閒時掃過所有未完成的任務,挑已進入且 (處理時間, 索引) 最小的;沒有已進入的就把時間跳到最早的進入時間。',
      steps: ['`done = [False] * n`、`time = 0`', '重複 n 次:掃描找已進入(enqueue ≤ time)且未完成中最小的', '找不到 → `time = 最早還沒完成任務的 enqueue`,重新找', '執行它:記下、`time += p`'],
      figure: { title: `tasks = ${JSON.stringify(TASKS)}`, steps: scanFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每次挑選掃描 n 個。' },
      verdict: '最好懂的模擬;n = 10⁵ 時太慢,用來對照堆積的作用。',
      code: {
        python: `def getOrder(tasks):
    n = len(tasks)
    done, res, time = [False] * n, [], 0
    for _ in range(n):
        best = -1
        for j in range(n):
            if not done[j] and tasks[j][0] <= time and (best < 0 or (tasks[j][1], j) < (tasks[best][1], best)):
                best = j
        if best < 0:                          # 沒有任務在等:跳到最早進來的那個
            time = min(tasks[j][0] for j in range(n) if not done[j])
            for j in range(n):
                if not done[j] and tasks[j][0] <= time and (best < 0 or (tasks[j][1], j) < (tasks[best][1], best)):
                    best = j
        done[best] = True
        res.append(best)
        time += tasks[best][1]
    return res`,
        c: `int *getOrder(int **tasks, int tasksSize, int *tasksColSize, int *returnSize) {
    int n = tasksSize, *res = malloc(n * sizeof(int));
    char *done = calloc(n, 1);
    long long time = 0;
    for (int k = 0; k < n; k++) {
        int best = -1;
        for (int pass = 0; pass < 2 && best < 0; pass++) {
            if (pass == 1) {                  // 沒有在等的:跳到最早進來的
                long long mn = LLONG_MAX;
                for (int j = 0; j < n; j++) if (!done[j] && tasks[j][0] < mn) mn = tasks[j][0];
                time = mn;
            }
            for (int j = 0; j < n; j++)
                if (!done[j] && tasks[j][0] <= time &&
                    (best < 0 || tasks[j][1] < tasks[best][1] || (tasks[j][1] == tasks[best][1] && j < best))) best = j;
        }
        done[best] = 1;
        res[k] = best;
        time += tasks[best][1];
    }
    free(done);
    *returnSize = n;
    return res;
}`,
        cpp: `vector<int> getOrder(vector<vector<int>>& tasks) {
    int n = tasks.size();
    vector<bool> done(n);
    vector<int> res;
    long long time = 0;
    for (int k = 0; k < n; k++) {
        int best = -1;
        for (int pass = 0; pass < 2 && best < 0; pass++) {
            if (pass == 1) {
                long long mn = LLONG_MAX;
                for (int j = 0; j < n; j++) if (!done[j]) mn = min(mn, (long long)tasks[j][0]);
                time = mn;
            }
            for (int j = 0; j < n; j++)
                if (!done[j] && tasks[j][0] <= time && (best < 0 || tasks[j][1] < tasks[best][1])) best = j;
        }
        done[best] = true;
        res.push_back(best);
        time += tasks[best][1];
    }
    return res;
}`,
        java: `int[] getOrder(int[][] tasks) {
    int n = tasks.length;
    boolean[] done = new boolean[n];
    int[] res = new int[n];
    long time = 0;
    for (int k = 0; k < n; k++) {
        int best = -1;
        for (int pass = 0; pass < 2 && best < 0; pass++) {
            if (pass == 1) {
                long mn = Long.MAX_VALUE;
                for (int j = 0; j < n; j++) if (!done[j]) mn = Math.min(mn, tasks[j][0]);
                time = mn;
            }
            for (int j = 0; j < n; j++)
                if (!done[j] && tasks[j][0] <= time && (best < 0 || tasks[j][1] < tasks[best][1])) best = j;
        }
        done[best] = true;
        res[k] = best;
        time += tasks[best][1];
    }
    return res;
}`,
        javascript: `function getOrder(tasks) {
  const n = tasks.length, done = new Array(n).fill(false), res = [];
  let time = 0;
  for (let k = 0; k < n; k++) {
    let best = -1;
    for (let pass = 0; pass < 2 && best < 0; pass++) {
      if (pass === 1) time = Math.min(...tasks.filter((_, j) => !done[j]).map((t) => t[0]));
      for (let j = 0; j < n; j++) if (!done[j] && tasks[j][0] <= time && (best < 0 || tasks[j][1] < tasks[best][1])) best = j;
    }
    done[best] = true;
    res.push(best);
    time += tasks[best][1];
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['空閒時沒有把時間跳到下一個任務:會卡住(堆積是空的卻要彈出)', '時間用 int:10⁵ 個任務各 10⁹ 會溢位', '同樣處理時間要選索引小的:堆積的比較要包含索引'],
  check: {
    kind: 'fn',
    fn: 'getOrder',
    cases: [
      { args: [TASKS], out: [0, 2, 3, 1] },
      { args: [[[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]]], out: [4, 3, 2, 0, 1] },
      { args: [[[5, 2], [1, 3]]], out: [1, 0] },
      { args: [[[1, 1], [10, 1], [3, 5]]], out: [0, 2, 1] },
    ],
  },
}
