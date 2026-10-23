import { graphView } from './fig'
import type { FigStep, Solution } from './types'

// 1443. Minimum Time to Collect All Apples in a Tree

const N = 7
const E = [[0, 1], [0, 2], [1, 4], [1, 5], [2, 3], [2, 6]]
const APPLE = [false, false, true, false, true, true, false]
const POS = { 0: { x: 2, y: 0 }, 1: { x: 1, y: 1 }, 2: { x: 3, y: 1 }, 4: { x: 0.5, y: 2 }, 5: { x: 1.5, y: 2 }, 3: { x: 2.5, y: 2 }, 6: { x: 3.5, y: 2 } }
const appleCls = Object.fromEntries(APPLE.map((a, i) => [i, a ? 'hl' : '']).filter(([, c]) => c))

function dfsFig(): FigStep[] {
  return [
    { note: '從 0 出發把所有蘋果(實心的節點)撿完再回到 0。每條要走的邊一定是「去一次、回一次」→ 花 2 秒', views: [graphView(N, E, { pos: POS, cls: appleCls })] },
    { note: '一條邊 (父 → 子) 需要走 ⇔ 子樹裡有蘋果。後序 DFS:先算孩子,孩子的子樹有蘋果(或孩子本身有)就加上 2 + 孩子回報的時間', views: [graphView(N, E, { pos: POS, cls: { ...appleCls, 3: 'dim', 6: 'dim' }, edgeCls: { 0: 'hl', 1: 'hl', 2: 'hl', 3: 'hl' } })] },
    { note: '要走的邊:0–1、1–4、1–5、0–2 共 4 條 → 8 秒。2–3、2–6 的子樹沒有蘋果,不用走', views: [graphView(N, E, { pos: POS, cls: appleCls, edgeCls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'dim', 5: 'dim' } })] },
  ]
}

function upFig(): FigStep[] {
  return [
    { note: '另一種:先求每個節點的父節點(BFS 從 0 出發)。然後從每個有蘋果的節點往上走到 0,把經過的邊標記起來', views: [graphView(N, E, { pos: POS, cls: appleCls })] },
    { note: '已經標過的邊遇到就停(上面一定也標過了)。被標記的邊數 × 2 就是答案', views: [graphView(N, E, { pos: POS, cls: appleCls, edgeCls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } })] },
  ]
}

export const q1443: Solution = {
  id: 1443,
  plain: '一棵樹上有些節點掛著蘋果。從節點 0 出發,走遍需要的路把蘋果全部撿起來,最後回到 0。每走一條邊花 1 秒,最少要幾秒?',
  statement: '給 n 個節點的無向樹(`edges`)和布林陣列 `hasApple`。從節點 0 出發,收集所有蘋果後回到 0,每條邊走一次花 1 秒。回傳最少時間。',
  examples: [
    { input: 'n = 7, edges = [[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]], hasApple = [false,false,true,false,true,true,false]', output: '8' },
    { input: '同一棵樹,hasApple = [false,false,true,false,false,true,false]', output: '6' },
    { input: '同一棵樹,hasApple 全是 false', output: '0' },
  ],
  constraints: ['n ≤ 10⁵'],
  insight: ['要回到起點 → 每條需要走的邊剛好走兩次(去、回)', '邊 (父, 子) 需要走 ⇔ 子樹裡有蘋果', '後序 DFS:孩子回報「我的子樹要花多少時間」,有蘋果才把 2 + 那段時間加上去'],
  approaches: [
    {
      name: '後序 DFS',
      idea: '`dfs(u, p)` 回傳收集 u 子樹裡所有蘋果、回到 u 的時間;對孩子 v:`t = dfs(v, u)`,若 `t > 0 or hasApple[v]` 就 `total += t + 2`。',
      steps: ['建鄰接串列', '`dfs(u, p)`:`total = 0`', '對每個鄰居 v ≠ p:`t = dfs(v, u)`;`t > 0 or hasApple[v]` → `total += t + 2`', '回傳 total;答案 `dfs(0, −1)`'],
      figure: { title: `hasApple = [${APPLE.map((a) => (a ? 'T' : 'F'))}]`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點、每條邊各一次。' },
      verdict: '最推薦。「子樹需不需要進去」由子樹自己回報,這是樹形 DP 的基本形式。',
      code: {
        python: `import sys

def minTime(n, edges, hasApple):
    sys.setrecursionlimit(300000)
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)

    def dfs(u, p):
        total = 0
        for v in g[u]:
            if v == p:
                continue
            t = dfs(v, u)
            if t > 0 or hasApple[v]:
                total += t + 2                # 進去 v、再出來
        return total

    return dfs(0, -1)`,
        c: `// 迭代版 DFS 順序 + 倒著累加,避免長鏈造成遞迴過深
int minTime(int n, int **edges, int edgesSize, int *edgesColSize, bool *hasApple, int hasAppleSize) {
    int *deg = calloc(n, sizeof(int)), *start = calloc(n + 1, sizeof(int)), *fill = calloc(n, sizeof(int));
    int *adj = malloc(2 * edgesSize * sizeof(int) + 4);
    for (int i = 0; i < edgesSize; i++) { deg[edges[i][0]]++; deg[edges[i][1]]++; }
    for (int i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0], b = edges[i][1];
        adj[start[a] + fill[a]++] = b; adj[start[b] + fill[b]++] = a;
    }
    int *order = malloc(n * sizeof(int)), *par = malloc(n * sizeof(int)), *st = malloc(n * sizeof(int)), *t = calloc(n, sizeof(int));
    int top = 0, k = 0;
    st[top++] = 0; par[0] = -1;
    while (top) {
        int u = st[--top];
        order[k++] = u;
        for (int e = start[u]; e < start[u + 1]; e++) if (adj[e] != par[u]) { par[adj[e]] = u; st[top++] = adj[e]; }
    }
    for (int i = n - 1; i > 0; i--) {             // 孩子先處理;order[0] 是根
        int v = order[i];
        if (t[v] > 0 || hasApple[v]) t[par[v]] += t[v] + 2;
    }
    int ans = t[0];
    free(deg); free(start); free(fill); free(adj); free(order); free(par); free(st); free(t);
    return ans;
}`,
        cpp: `int minTime(int n, vector<vector<int>>& edges, vector<bool>& hasApple) {
    vector<vector<int>> g(n);
    for (auto &e : edges) { g[e[0]].push_back(e[1]); g[e[1]].push_back(e[0]); }
    function<int(int, int)> dfs = [&](int u, int p) {
        int total = 0;
        for (int v : g[u]) {
            if (v == p) continue;
            int t = dfs(v, u);
            if (t > 0 || hasApple[v]) total += t + 2;
        }
        return total;
    };
    return dfs(0, -1);
}`,
        java: `private List<List<Integer>> g;
private List<Boolean> apple;

int minTime(int n, int[][] edges, List<Boolean> hasApple) {
    g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }
    apple = hasApple;
    return dfs(0, -1);
}

private int dfs(int u, int p) {
    int total = 0;
    for (int v : g.get(u)) {
        if (v == p) continue;
        int t = dfs(v, u);
        if (t > 0 || apple.get(v)) total += t + 2;
    }
    return total;
}`,
        javascript: `function minTime(n, edges, hasApple) {
  const g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    g[a].push(b);
    g[b].push(a);
  }
  const dfs = (u, p) => {
    let total = 0;
    for (const v of g[u]) {
      if (v === p) continue;
      const t = dfs(v, u);
      if (t > 0 || hasApple[v]) total += t + 2;
    }
    return total;
  };
  return dfs(0, -1);
}`,
      },
    },
    {
      name: '找父節點,從蘋果往上標記',
      idea: 'BFS 求 parent;每個有蘋果的節點沿 parent 往上走,把邊標記(遇到已標記就停)。答案 = 標記的邊數 × 2。',
      steps: ['BFS 從 0 求 `parent`', '`for v in 有蘋果的節點`:`while v != 0 and not used[v]`:`used[v] = True`、`cnt += 1`、`v = parent[v]`', '回傳 `cnt * 2`'],
      figure: { title: `hasApple = [${APPLE.map((a) => (a ? 'T' : 'F'))}]`, steps: upFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每條邊最多被標一次。' },
      verdict: '直接回答「哪些邊要走」,不用遞迴。',
      code: {
        python: `from collections import deque

def minTime(n, edges, hasApple):
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)
    parent = [-1] * n
    seen = [False] * n
    seen[0] = True
    q = deque([0])
    while q:
        u = q.popleft()
        for v in g[u]:
            if not seen[v]:
                seen[v] = True
                parent[v] = u
                q.append(v)
    used = [False] * n                        # used[v]:邊 (parent[v], v) 要走
    cnt = 0
    for v in range(n):
        if hasApple[v]:
            while v != 0 and not used[v]:     # 往上標記,遇到標過的就停
                used[v] = True
                cnt += 1
                v = parent[v]
    return cnt * 2`,
        c: `int minTime(int n, int **edges, int edgesSize, int *edgesColSize, bool *hasApple, int hasAppleSize) {
    int *deg = calloc(n, sizeof(int)), *start = calloc(n + 1, sizeof(int)), *fill = calloc(n, sizeof(int));
    int *adj = malloc(2 * edgesSize * sizeof(int) + 4);
    for (int i = 0; i < edgesSize; i++) { deg[edges[i][0]]++; deg[edges[i][1]]++; }
    for (int i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0], b = edges[i][1];
        adj[start[a] + fill[a]++] = b; adj[start[b] + fill[b]++] = a;
    }
    int *par = malloc(n * sizeof(int)), *q = malloc(n * sizeof(int)), h = 0, t = 0, cnt = 0;
    char *seen = calloc(n, 1), *used = calloc(n, 1);
    seen[0] = 1; par[0] = -1; q[t++] = 0;
    while (h < t) {
        int u = q[h++];
        for (int e = start[u]; e < start[u + 1]; e++)
            if (!seen[adj[e]]) { seen[adj[e]] = 1; par[adj[e]] = u; q[t++] = adj[e]; }
    }
    for (int v = 0; v < n; v++)
        if (hasApple[v])
            for (int x = v; x != 0 && !used[x]; x = par[x]) { used[x] = 1; cnt++; }
    free(deg); free(start); free(fill); free(adj); free(par); free(q); free(seen); free(used);
    return cnt * 2;
}`,
        cpp: `int minTime(int n, vector<vector<int>>& edges, vector<bool>& hasApple) {
    vector<vector<int>> g(n);
    for (auto &e : edges) { g[e[0]].push_back(e[1]); g[e[1]].push_back(e[0]); }
    vector<int> par(n, -1);
    vector<bool> seen(n), used(n);
    queue<int> q;
    q.push(0); seen[0] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u]) if (!seen[v]) { seen[v] = true; par[v] = u; q.push(v); }
    }
    int cnt = 0;
    for (int v = 0; v < n; v++)
        if (hasApple[v])
            for (int x = v; x != 0 && !used[x]; x = par[x]) { used[x] = true; cnt++; }
    return cnt * 2;
}`,
        java: `int minTime(int n, int[][] edges, List<Boolean> hasApple) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }
    int[] par = new int[n];
    boolean[] seen = new boolean[n], used = new boolean[n];
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(0); seen[0] = true; par[0] = -1;
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : g.get(u)) if (!seen[v]) { seen[v] = true; par[v] = u; q.offer(v); }
    }
    int cnt = 0;
    for (int v = 0; v < n; v++)
        if (hasApple.get(v))
            for (int x = v; x != 0 && !used[x]; x = par[x]) { used[x] = true; cnt++; }
    return cnt * 2;
}`,
        javascript: `function minTime(n, edges, hasApple) {
  const g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    g[a].push(b);
    g[b].push(a);
  }
  const par = new Array(n).fill(-1), seen = new Array(n).fill(false), used = new Array(n).fill(false);
  const q = [0];
  seen[0] = true;
  for (let h = 0; h < q.length; h++)
    for (const v of g[q[h]])
      if (!seen[v]) {
        seen[v] = true;
        par[v] = q[h];
        q.push(v);
      }
  let cnt = 0;
  for (let v = 0; v < n; v++)
    if (hasApple[v])
      for (let x = v; x !== 0 && !used[x]; x = par[x]) {
        used[x] = true;
        cnt++;
      }
  return cnt * 2;
}`,
      },
    },
  ],
  pitfalls: ['邊不一定是「父在前、子在後」:要當無向邊處理,用 parent 避免走回頭路', '根節點 0 有蘋果不需要額外的時間', '把「孩子有蘋果」和「孩子的子樹有蘋果」混為一談:兩者都要讓那條邊被走'],
  check: {
    kind: 'fn',
    fn: 'minTime',
    cases: [
      { args: [N, E, APPLE], out: 8 },
      { args: [N, E, [false, false, true, false, false, true, false]], out: 6 },
      { args: [N, E, [false, false, false, false, false, false, false]], out: 0 },
      { args: [4, [[0, 2], [0, 3], [1, 2]], [false, true, false, false]], out: 4 },
    ],
  },
}
