import { graphView } from './fig'
import type { FigStep, Solution } from './types'

// 1376. Time Needed to Inform All Employees

const N = 7
const HEAD = 6
const MGR = [1, 2, 3, 4, 5, 6, -1]
const T = [0, 6, 5, 4, 3, 2, 1]
const EDGES = MGR.map((m, i) => [m, i]).filter(([m]) => m >= 0)
const POS = Object.fromEntries(Array.from({ length: N }, (_, i) => [i, { x: (6 - i) * 1.1, y: 0 }]))

function dfsFig(): FigStep[] {
  return [
    { note: `主管通知下屬要花 informTime 分鐘,下屬收到後再通知自己的下屬……每一條「從老闆到某個員工」的路徑,時間是沿途主管的 informTime 加總。答案 = 最長的那條`, views: [graphView(N, EDGES, { pos: POS, directed: true, subs: Object.fromEntries(T.map((t, i) => [i, `${t} 分`])), cls: { [HEAD]: 'hl' } })] },
    { note: '從老闆 6 開始 DFS:到達員工 u 的時間 = 到達他主管的時間 + 主管的 informTime', views: [graphView(N, EDGES, { pos: POS, directed: true, subs: { 6: 't=0', 5: 't=1', 4: 't=3', 3: 't=6' }, cls: { 6: 'done', 5: 'done', 4: 'done', 3: 'cur' } })] },
    { note: '一路到員工 0:1 + 2 + 3 + 4 + 5 + 6 = 21 分鐘,這是最晚收到的人', views: [graphView(N, EDGES, { pos: POS, directed: true, subs: { 0: 't=21' }, cls: { 0: 'done' } })] },
  ]
}

function upFig(): FigStep[] {
  return [
    { note: '不建樹也可以:對每個員工,沿著 manager 往上爬到老闆,把路上主管的 informTime 加起來', views: [graphView(N, EDGES, { pos: POS, directed: true, cls: { 0: 'hl' } })] },
    { note: '用記憶化:算過的員工直接拿結果(time[u] = time[manager[u]] + informTime[manager[u]]),每個人只算一次', views: [graphView(N, EDGES, { pos: POS, directed: true, cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

export const q1376: Solution = {
  id: 1376,
  plain: '公司裡每個人都有一位主管(老闆除外),形成一棵樹。老闆有個緊急消息要通知所有人:每位主管要花一段時間通知完所有直屬下屬,下屬收到後再往下傳。全部的人都收到消息,總共要多久?',
  statement: '有 n 位員工,`manager[i]` 是 i 的直屬主管(老闆 `headID` 的是 −1),`informTime[i]` 是 i 通知所有直屬下屬需要的時間。回傳所有員工都收到消息所需的時間。',
  examples: [
    { input: 'n = 1, headID = 0, manager = [-1], informTime = [0]', output: '0' },
    { input: 'n = 6, headID = 2, manager = [2,2,-1,2,2,2], informTime = [0,0,1,0,0,0]', output: '1' },
    { input: 'n = 7, headID = 6, manager = [1,2,3,4,5,6,-1], informTime = [0,6,5,4,3,2,1]', output: '21' },
  ],
  constraints: ['n ≤ 10⁵', '保證是一棵樹'],
  insight: ['同一層的下屬是**同時**收到的,所以答案是「根到葉」所有路徑中最長的那條', '路徑長度 = 沿途主管的 informTime 加總', '建出「主管 → 下屬」的樹做 DFS;或從每個員工往上爬並記憶化'],
  approaches: [
    {
      name: '建樹 + DFS',
      idea: '`children[manager[i]].append(i)`;`dfs(u)` = `informTime[u] + max(dfs(v) for v in children[u])`。',
      steps: ['建 `children`', '`dfs(u)`:沒有下屬 → 0(葉子的 informTime 是 0)', '否則 `informTime[u] + max(dfs(v))`', '回傳 `dfs(headID)`'],
      figure: { title: `headID = ${HEAD}`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個員工一次;長鏈時遞迴深度 n(要調高上限或改用迭代)。' },
      verdict: '最推薦,樹上求「最長路徑(帶權)」的標準寫法。',
      code: {
        python: `import sys

def numOfMinutes(n, headID, manager, informTime):
    sys.setrecursionlimit(300000)
    children = [[] for _ in range(n)]
    for i, m in enumerate(manager):
        if m >= 0:
            children[m].append(i)

    def dfs(u):
        best = 0
        for v in children[u]:
            best = max(best, dfs(v))
        return informTime[u] + best if children[u] else 0

    return dfs(headID)`,
        c: `// 迭代 BFS:到達時間 = 主管的到達時間 + 主管的 informTime
int numOfMinutes(int n, int headID, int *manager, int managerSize, int *informTime, int informTimeSize) {
    int *cnt = calloc(n + 1, sizeof(int)), *start = calloc(n + 1, sizeof(int)), *kids = malloc(n * sizeof(int)), *fill = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) if (manager[i] >= 0) cnt[manager[i]]++;
    for (int i = 0; i < n; i++) start[i + 1] = start[i] + cnt[i];
    for (int i = 0; i < n; i++) if (manager[i] >= 0) kids[start[manager[i]] + fill[manager[i]]++] = i;
    int *q = malloc(n * sizeof(int)), *t = calloc(n, sizeof(int)), h = 0, tl = 0, best = 0;
    q[tl++] = headID;
    while (h < tl) {
        int u = q[h++];
        if (t[u] > best) best = t[u];
        for (int e = start[u]; e < start[u + 1]; e++) { t[kids[e]] = t[u] + informTime[u]; q[tl++] = kids[e]; }
    }
    free(cnt); free(start); free(kids); free(fill); free(q); free(t);
    return best;
}`,
        cpp: `int numOfMinutes(int n, int headID, vector<int>& manager, vector<int>& informTime) {
    vector<vector<int>> children(n);
    for (int i = 0; i < n; i++) if (manager[i] >= 0) children[manager[i]].push_back(i);
    function<int(int)> dfs = [&](int u) {
        int best = 0;
        for (int v : children[u]) best = max(best, dfs(v));
        return children[u].empty() ? 0 : informTime[u] + best;
    };
    return dfs(headID);
}`,
        java: `private List<List<Integer>> children;
private int[] informTime;

int numOfMinutes(int n, int headID, int[] manager, int[] informTime) {
    this.informTime = informTime;
    children = new ArrayList<>();
    for (int i = 0; i < n; i++) children.add(new ArrayList<>());
    for (int i = 0; i < n; i++) if (manager[i] >= 0) children.get(manager[i]).add(i);
    return dfs(headID);
}

private int dfs(int u) {
    int best = 0;
    for (int v : children.get(u)) best = Math.max(best, dfs(v));
    return children.get(u).isEmpty() ? 0 : informTime[u] + best;
}`,
        javascript: `function numOfMinutes(n, headID, manager, informTime) {
  const children = Array.from({ length: n }, () => []);
  manager.forEach((m, i) => m >= 0 && children[m].push(i));
  const dfs = (u) => {
    let best = 0;
    for (const v of children[u]) best = Math.max(best, dfs(v));
    return children[u].length ? informTime[u] + best : 0;
  };
  return dfs(headID);
}`,
      },
    },
    {
      name: '往上爬 + 記憶化',
      idea: '`time[u]` = u 收到消息的時間 = `time[manager[u]] + informTime[manager[u]]`;記憶化後每個人只算一次。答案 = max(time)。',
      steps: ['`time = [-1] * n`、`time[head] = 0`', '`get(u)`:算過就回傳;否則 `time[u] = get(manager[u]) + informTime[manager[u]]`', '回傳 `max(get(u) for u in range(n))`'],
      figure: { title: `headID = ${HEAD}`, steps: upFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個人的 time 只算一次。' },
      verdict: '不用建樹,直接用 manager 陣列往上爬;記憶化避免重複走同一段路。',
      code: {
        python: `def numOfMinutes(n, headID, manager, informTime):
    time = [-1] * n
    time[headID] = 0
    for u in range(n):
        path = []
        while time[u] < 0:                    # 往上爬到第一個已知的人
            path.append(u)
            u = manager[u]
        for v in reversed(path):              # 再往下把時間填回來
            time[v] = time[manager[v]] + informTime[manager[v]]
    return max(time)`,
        c: `int numOfMinutes(int n, int headID, int *manager, int managerSize, int *informTime, int informTimeSize) {
    int *time = malloc(n * sizeof(int)), *path = malloc(n * sizeof(int)), best = 0;
    for (int i = 0; i < n; i++) time[i] = -1;
    time[headID] = 0;
    for (int u = 0; u < n; u++) {
        int k = 0, x = u;
        while (time[x] < 0) { path[k++] = x; x = manager[x]; }
        while (k--) { int v = path[k]; time[v] = time[manager[v]] + informTime[manager[v]]; }
        if (time[u] > best) best = time[u];
    }
    free(time); free(path);
    return best;
}`,
        cpp: `int numOfMinutes(int n, int headID, vector<int>& manager, vector<int>& informTime) {
    vector<int> time(n, -1), path;
    time[headID] = 0;
    int best = 0;
    for (int u = 0; u < n; u++) {
        path.clear();
        for (int x = u; time[x] < 0; x = manager[x]) path.push_back(x);
        for (int k = path.size() - 1; k >= 0; k--) { int v = path[k]; time[v] = time[manager[v]] + informTime[manager[v]]; }
        best = max(best, time[u]);
    }
    return best;
}`,
        java: `int numOfMinutes(int n, int headID, int[] manager, int[] informTime) {
    int[] time = new int[n], path = new int[n];
    Arrays.fill(time, -1);
    time[headID] = 0;
    int best = 0;
    for (int u = 0; u < n; u++) {
        int k = 0;
        for (int x = u; time[x] < 0; x = manager[x]) path[k++] = x;
        while (k-- > 0) { int v = path[k]; time[v] = time[manager[v]] + informTime[manager[v]]; }
        best = Math.max(best, time[u]);
    }
    return best;
}`,
        javascript: `function numOfMinutes(n, headID, manager, informTime) {
  const time = new Array(n).fill(-1);
  time[headID] = 0;
  let best = 0;
  for (let u = 0; u < n; u++) {
    const path = [];
    for (let x = u; time[x] < 0; x = manager[x]) path.push(x);
    for (let k = path.length - 1; k >= 0; k--) {
      const v = path[k];
      time[v] = time[manager[v]] + informTime[manager[v]];
    }
    best = Math.max(best, time[u]);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['把所有人的 informTime 加起來:同一層是同時通知的,要取最長的一條路徑', '每個員工都從頭往上爬而不記憶化:長鏈時 O(n²)'],
  check: {
    kind: 'fn',
    fn: 'numOfMinutes',
    cases: [
      { args: [1, 0, [-1], [0]], out: 0 },
      { args: [6, 2, [2, 2, -1, 2, 2, 2], [0, 0, 1, 0, 0, 0]], out: 1 },
      { args: [N, HEAD, MGR, T], out: 21 },
      { args: [4, 2, [3, 3, -1, 2], [0, 0, 162, 914]], out: 1076 },
    ],
  },
}
