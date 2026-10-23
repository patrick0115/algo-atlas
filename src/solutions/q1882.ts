import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1882. Process Tasks Using Servers

const SV = [3, 3, 2]
const TK = [1, 2, 3, 2, 1, 2]

function heapFig(): FigStep[] {
  return [
    { note: '第 j 秒任務 j 進入佇列。有空的伺服器就分給「權重最小、同權重索引最小」的那台。兩個堆積:free(權重, 索引)、busy(空出來的時間, 權重, 索引)', views: [arr(SV.map((w, i) => `#${i} w=${w}`), { label: 'servers' }), arr(TK, { label: 'tasks(處理時間)' })] },
    { note: '時間 0:任務 0 → 伺服器 2(權重 2 最小),它在時間 1 空出來。時間 1:先把 busy 裡「時間 ≤ 1」的放回 free → 任務 1 又給伺服器 2', views: [arr([2, 2], { label: '前兩個任務分到的伺服器' })] },
    { note: '如果某一刻 free 是空的:時間直接跳到 busy 裡最早空出來的那台(任務排隊等著)。最後答案 [2, 2, 0, 2, 1, 2]', views: [arr([2, 2, 0, 2, 1, 2], { label: 'ans', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

function scanFig(): FigStep[] {
  return [
    { note: '簡單版:記每台伺服器「什麼時候空」。處理任務 j 時,時間 t = max(j, 任務 j−1 開始的時間);在 t 之前已經空的伺服器裡挑權重最小的', views: [arr(['free@0', 'free@0', 'free@0'], { label: '每台空出來的時間' })] },
    { note: '如果都在忙,就把 t 推到最早空出來的時刻再挑。每個任務掃一遍伺服器 → O(n · m)', views: [arr([2, 2, 0, 2, 1, 2], { label: 'ans' })] },
  ]
}

export const q1882: Solution = {
  id: 1882,
  plain: '一堆伺服器(各有權重)要處理一連串任務。第 j 秒任務 j 進來排隊;只要有空的伺服器,就把排在最前面的任務交給「權重最小(一樣就挑編號小)」的那台。每個任務分給哪台伺服器?',
  statement: '`servers[i]` 是伺服器 i 的權重,`tasks[j]` 是任務 j 的處理時間;任務 j 在第 j 秒加入佇列。只要有空閒伺服器且佇列非空,就把佇列最前面的任務分給權重最小、權重相同時索引最小的空閒伺服器;該伺服器在 t + tasks[j] 秒再次空閒。回傳每個任務分到的伺服器索引。',
  examples: [
    { input: 'servers = [3,3,2], tasks = [1,2,3,2,1,2]', output: '[2,2,0,2,1,2]' },
    { input: 'servers = [5,1,4,3,2], tasks = [2,1,2,4,5,2,1]', output: '[1,4,1,4,1,3,2]' },
  ],
  constraints: ['n, m ≤ 2·10⁵', '時間可能累積到 2·10⁵ × 2·10⁵ → 用 64 位元'],
  insight: ['空閒的伺服器要快速拿到 (權重, 索引) 最小的 → 最小堆積', '忙碌的伺服器要知道誰最早空出來 → 另一個最小堆積,依空閒時間排', '時間 = max(任務進來的時間, 有伺服器空出來的時間)'],
  approaches: [
    {
      name: '雙堆積模擬',
      idea: '`free` 依 (權重, 索引);`busy` 依 (空出來的時間, 權重, 索引)。處理任務 j:先把 busy 中時間 ≤ j 的移回 free;free 空就把時間跳到 busy 最早的那台。',
      steps: ['`free = [(w, i)]`、`busy = []`、`time = 0`', '`for j`:`time = max(time, j)`', '把 busy 中 `空閒時間 ≤ time` 的移回 free;free 空 → `time = busy[0].time`,再移一次', '從 free 取出 (w, i):`ans[j] = i`,推入 busy `(time + tasks[j], w, i)`'],
      figure: { title: `servers = [${SV}],tasks = [${TK}]`, steps: heapFig() },
      complexity: { time: 'O((n + m) log m)', space: 'O(m)', why: '每次分配都是幾次堆積操作。' },
      verdict: '最推薦,「兩個堆積在空閒 / 忙碌之間搬來搬去」是排程模擬的經典結構。',
      code: {
        python: `import heapq

def assignTasks(servers, tasks):
    free = [(w, i) for i, w in enumerate(servers)]
    heapq.heapify(free)
    busy, ans, time = [], [], 0
    for j, t in enumerate(tasks):
        time = max(time, j)
        if not free:
            time = max(time, busy[0][0])      # 都在忙:等最早空出來的那台
        while busy and busy[0][0] <= time:
            _, w, i = heapq.heappop(busy)
            heapq.heappush(free, (w, i))
        w, i = heapq.heappop(free)
        ans.append(i)
        heapq.heappush(busy, (time + t, w, i))
    return ans`,
        c: `// 兩個堆積都用「比較函式」寫成通用的最小堆積:元素是伺服器索引
static long long *at_;   // 每台伺服器空出來的時間
static int *w_;
static bool lessFree(int a, int b) { return w_[a] != w_[b] ? w_[a] < w_[b] : a < b; }
static bool lessBusy(int a, int b) { return at_[a] != at_[b] ? at_[a] < at_[b] : lessFree(a, b); }

static void push(int *h, int *n, int v, bool (*lt)(int, int)) {
    int i = (*n)++;
    h[i] = v;
    while (i && lt(h[i], h[(i - 1) / 2])) { int t = h[i]; h[i] = h[(i - 1) / 2]; h[(i - 1) / 2] = t; i = (i - 1) / 2; }
}
static int pop(int *h, int *n, bool (*lt)(int, int)) {
    int top = h[0];
    h[0] = h[--(*n)];
    for (int i = 0;;) {
        int m = i, l = 2 * i + 1, r = l + 1;
        if (l < *n && lt(h[l], h[m])) m = l;
        if (r < *n && lt(h[r], h[m])) m = r;
        if (m == i) break;
        int t = h[i]; h[i] = h[m]; h[m] = t;
        i = m;
    }
    return top;
}

int *assignTasks(int *servers, int serversSize, int *tasks, int tasksSize, int *returnSize) {
    int m = serversSize, *fr = malloc(m * sizeof(int)), *bz = malloc(m * sizeof(int)), fn = 0, bn = 0;
    at_ = calloc(m, sizeof(long long)); w_ = servers;
    for (int i = 0; i < m; i++) push(fr, &fn, i, lessFree);
    int *ans = malloc(tasksSize * sizeof(int));
    long long time = 0;
    for (int j = 0; j < tasksSize; j++) {
        if (time < j) time = j;
        if (fn == 0 && at_[bz[0]] > time) time = at_[bz[0]];
        while (bn && at_[bz[0]] <= time) push(fr, &fn, pop(bz, &bn, lessBusy), lessFree);
        int i = pop(fr, &fn, lessFree);
        ans[j] = i;
        at_[i] = time + tasks[j];
        push(bz, &bn, i, lessBusy);
    }
    free(fr); free(bz); free(at_);
    *returnSize = tasksSize;
    return ans;
}`,
        cpp: `vector<int> assignTasks(vector<int>& servers, vector<int>& tasks) {
    using T = tuple<long long, int, int>;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> fr;
    priority_queue<T, vector<T>, greater<>> bz;
    for (int i = 0; i < (int)servers.size(); i++) fr.push({servers[i], i});
    vector<int> ans;
    long long time = 0;
    for (int j = 0; j < (int)tasks.size(); j++) {
        time = max(time, (long long)j);
        if (fr.empty()) time = max(time, get<0>(bz.top()));
        while (!bz.empty() && get<0>(bz.top()) <= time) {
            auto [t, w, i] = bz.top(); bz.pop();
            fr.push({w, i});
        }
        auto [w, i] = fr.top(); fr.pop();
        ans.push_back(i);
        bz.push({time + tasks[j], w, i});
    }
    return ans;
}`,
        java: `int[] assignTasks(int[] servers, int[] tasks) {
    PriorityQueue<int[]> fr = new PriorityQueue<>((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    PriorityQueue<long[]> bz = new PriorityQueue<>((a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : a[1] != b[1] ? Long.compare(a[1], b[1]) : Long.compare(a[2], b[2]));
    for (int i = 0; i < servers.length; i++) fr.offer(new int[]{servers[i], i});
    int[] ans = new int[tasks.length];
    long time = 0;
    for (int j = 0; j < tasks.length; j++) {
        time = Math.max(time, j);
        if (fr.isEmpty()) time = Math.max(time, bz.peek()[0]);
        while (!bz.isEmpty() && bz.peek()[0] <= time) {
            long[] b = bz.poll();
            fr.offer(new int[]{(int) b[1], (int) b[2]});
        }
        int[] f = fr.poll();
        ans[j] = f[1];
        bz.offer(new long[]{time + tasks[j], f[0], f[1]});
    }
    return ans;
}`,
        javascript: `function assignTasks(servers, tasks) {
  // 通用最小堆積
  const heap = (less) => {
    const h = [];
    return {
      size: () => h.length,
      top: () => h[0],
      push(v) {
        h.push(v);
        for (let i = h.length - 1; i && less(h[i], h[(i - 1) >> 1]); i = (i - 1) >> 1) [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
      },
      pop() {
        const top = h[0], last = h.pop();
        if (h.length) {
          h[0] = last;
          for (let i = 0; ; ) {
            let m = i;
            const l = 2 * i + 1, r = l + 1;
            if (l < h.length && less(h[l], h[m])) m = l;
            if (r < h.length && less(h[r], h[m])) m = r;
            if (m === i) break;
            [h[i], h[m]] = [h[m], h[i]];
            i = m;
          }
        }
        return top;
      },
    };
  };
  const cmp = (a, b) => {
    for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) return a[k] < b[k];
    return false;
  };
  const fr = heap(cmp), bz = heap(cmp);
  servers.forEach((w, i) => fr.push([w, i]));
  const ans = [];
  let time = 0;
  tasks.forEach((t, j) => {
    time = Math.max(time, j);
    if (!fr.size()) time = Math.max(time, bz.top()[0]);
    while (bz.size() && bz.top()[0] <= time) {
      const [, w, i] = bz.pop();
      fr.push([w, i]);
    }
    const [w, i] = fr.pop();
    ans.push(i);
    bz.push([time + t, w, i]);
  });
  return ans;
}`,
      },
    },
    {
      name: '記每台的空閒時間,逐一掃描',
      idea: '`freeAt[i]` = 伺服器 i 空出來的時間;每個任務的開始時間 `t = max(j, 上一個任務的開始時間)`,若沒有 `freeAt ≤ t` 的伺服器就把 t 推到最小的 freeAt;再挑空閒中 (權重, 索引) 最小的。',
      steps: ['`freeAt = [0] * m`、`t = 0`', '`for j`:`t = max(t, j)`;沒有 `freeAt[i] ≤ t` → `t = min(freeAt)`', '掃描挑 `freeAt[i] ≤ t` 中 (servers[i], i) 最小的', '`freeAt[i] = t + tasks[j]`'],
      figure: { title: `servers = [${SV}],tasks = [${TK}]`, steps: scanFig() },
      complexity: { time: 'O(n · m)', space: 'O(m)', why: '每個任務掃一遍伺服器。' },
      verdict: '規則最直白,用來驗證雙堆積版。題目上限下會超時。',
      code: {
        python: `def assignTasks(servers, tasks):
    m = len(servers)
    free_at, ans, t = [0] * m, [], 0
    for j, d in enumerate(tasks):
        t = max(t, j)
        if all(f > t for f in free_at):
            t = min(free_at)                  # 都在忙:等第一台空出來
        best = -1
        for i in range(m):
            if free_at[i] <= t and (best < 0 or (servers[i], i) < (servers[best], best)):
                best = i
        ans.append(best)
        free_at[best] = t + d
    return ans`,
        c: `int *assignTasks(int *servers, int serversSize, int *tasks, int tasksSize, int *returnSize) {
    int m = serversSize, *ans = malloc(tasksSize * sizeof(int));
    long long *freeAt = calloc(m, sizeof(long long)), t = 0;
    for (int j = 0; j < tasksSize; j++) {
        if (t < j) t = j;
        long long mn = LLONG_MAX;
        for (int i = 0; i < m; i++) if (freeAt[i] < mn) mn = freeAt[i];
        if (mn > t) t = mn;
        int best = -1;
        for (int i = 0; i < m; i++)
            if (freeAt[i] <= t && (best < 0 || servers[i] < servers[best])) best = i;   // 同權重時先遇到的索引較小
        ans[j] = best;
        freeAt[best] = t + tasks[j];
    }
    free(freeAt);
    *returnSize = tasksSize;
    return ans;
}`,
        cpp: `vector<int> assignTasks(vector<int>& servers, vector<int>& tasks) {
    int m = servers.size();
    vector<long long> freeAt(m, 0);
    vector<int> ans;
    long long t = 0;
    for (int j = 0; j < (int)tasks.size(); j++) {
        t = max(t, (long long)j);
        t = max(t, *min_element(freeAt.begin(), freeAt.end()));
        int best = -1;
        for (int i = 0; i < m; i++) if (freeAt[i] <= t && (best < 0 || servers[i] < servers[best])) best = i;
        ans.push_back(best);
        freeAt[best] = t + tasks[j];
    }
    return ans;
}`,
        java: `int[] assignTasks(int[] servers, int[] tasks) {
    int m = servers.length;
    long[] freeAt = new long[m];
    int[] ans = new int[tasks.length];
    long t = 0;
    for (int j = 0; j < tasks.length; j++) {
        t = Math.max(t, j);
        long mn = Long.MAX_VALUE;
        for (long f : freeAt) mn = Math.min(mn, f);
        t = Math.max(t, mn);
        int best = -1;
        for (int i = 0; i < m; i++) if (freeAt[i] <= t && (best < 0 || servers[i] < servers[best])) best = i;
        ans[j] = best;
        freeAt[best] = t + tasks[j];
    }
    return ans;
}`,
        javascript: `function assignTasks(servers, tasks) {
  const m = servers.length, freeAt = new Array(m).fill(0), ans = [];
  let t = 0;
  tasks.forEach((d, j) => {
    t = Math.max(t, j, Math.min(...freeAt));
    let best = -1;
    for (let i = 0; i < m; i++) if (freeAt[i] <= t && (best < 0 || servers[i] < servers[best])) best = i;
    ans.push(best);
    freeAt[best] = t + d;
  });
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['只在任務進來的時間點釋放伺服器:都在忙時要讓時間跳到「最早空出來」的時刻', '從 busy 移回 free 時只移一台:同一時刻可能有好幾台空出來', '時間用 int 會溢位'],
  check: {
    kind: 'fn',
    fn: 'assignTasks',
    cases: [
      { args: [SV, TK], out: [2, 2, 0, 2, 1, 2] },
      { args: [[5, 1, 4, 3, 2], [2, 1, 2, 4, 5, 2, 1]], out: [1, 4, 1, 4, 1, 3, 2] },
      { args: [[10], [3, 1, 2]], out: [0, 0, 0] },
    ],
  },
}
