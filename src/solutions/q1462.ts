import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1462. Course Schedule IV

const N = 4
const PRE = [[0, 1], [1, 2], [2, 3]]
const POS = { 0: { x: 0, y: 0 }, 1: { x: 1.5, y: 0 }, 2: { x: 3, y: 0 }, 3: { x: 4.5, y: 0 } }

function reachGrid(m: boolean[][], label: string, hl: [number, number][] = []): GridViewData {
  return { kind: 'grid', label, cells: m.map((row) => row.map((v) => (v ? 'T' : ''))), marks: { done: m.flatMap((row, i) => row.flatMap((v, j) => (v ? [[i, j] as [number, number]] : []))), hl } }
}

function floydFig(): FigStep[] {
  const m = Array.from({ length: N }, () => Array(N).fill(false))
  for (const [a, b] of PRE) m[a][b] = true
  const out: FigStep[] = [
    { note: '「a 是 b 的先修」包含間接的:0 → 1 → 2 → 3,所以 0 也是 3 的先修。先把直接的邊填進可達表 reach[a][b]', views: [graphView(N, PRE, { directed: true, pos: POS }), reachGrid(m.map((r) => [...r]), 'reach(列 = a,欄 = b)')] },
  ]
  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (m[i][k] && m[k][j]) m[i][j] = true
    out.push({ note: `Floyd–Warshall:允許經過 ${k} 當中繼點 → 若 i 到得了 ${k}、${k} 到得了 j,則 i 到得了 j`, views: [reachGrid(m.map((r) => [...r]), `中繼點 0..${k}`)] })
  }
  out.push({ note: '之後每個查詢 [u, v] 直接查表 reach[u][v],O(1)', views: [arr(['[0,3] → true', '[3,0] → false'], { label: '查詢' })] })
  return out
}

function topoFig(): FigStep[] {
  return [
    { note: '拓撲排序版:每門課維護「它的所有先修課」集合。依拓撲順序處理 u → v 時,v 的集合 ∪= u 的集合 ∪ {u}', views: [graphView(N, PRE, { directed: true, pos: POS, subs: { 0: '{}', 1: '{0}', 2: '{0,1}', 3: '{0,1,2}' } })] },
    { note: '集合用位元遮罩(n ≤ 100 可以用 bitset / 大整數),合併就是一次 OR', views: [arr(['0000', '0001', '0011', '0111'], { label: '各課的先修遮罩' })] },
  ]
}

export const q1462: Solution = {
  id: 1462,
  plain: '有幾門課和一些「要先修 A 才能修 B」的規則(先修關係會傳遞)。回答一串問題:「A 是不是 B 的先修課?」',
  statement: '共有 `numCourses` 門課,`prerequisites[i] = [a, b]` 表示必須先修 a 才能修 b(先修關係**可傳遞**)。對每個查詢 `[u, v]`,回答 u 是否為 v 的(直接或間接)先修課。保證沒有環。',
  examples: [
    { input: 'numCourses = 2, prerequisites = [[1,0]], queries = [[0,1],[1,0]]', output: '[false,true]' },
    { input: 'numCourses = 3, prerequisites = [[1,2],[1,0],[2,0]], queries = [[1,0],[1,2]]', output: '[true,true]' },
  ],
  constraints: ['n ≤ 100,queries ≤ 10⁴'],
  insight: ['= 有向圖上的「可達性」查詢', 'n ≤ 100 → 先算出全部 n² 對的可達表,之後每個查詢 O(1)', 'Floyd–Warshall O(n³) 或拓撲排序 + 集合合併'],
  approaches: [
    {
      name: 'Floyd–Warshall 可達表',
      idea: '`reach[a][b] = True`(直接邊);`for k, i, j`:`reach[i][j] |= reach[i][k] and reach[k][j]`;查表回答。',
      steps: ['`reach = n × n` 的 False', '每條先修 `reach[a][b] = True`', '三層迴圈 k(中繼)、i、j', '查詢 `reach[u][v]`'],
      figure: { title: 'prerequisites = [[0,1],[1,2],[2,3]]', steps: floydFig() },
      complexity: { time: 'O(n³ + Q)', space: 'O(n²)', why: 'n = 100 時 10⁶ 次運算。' },
      verdict: '最推薦,寫法最短;k 必須放最外層。',
      code: {
        python: `def checkIfPrerequisite(numCourses, prerequisites, queries):
    n = numCourses
    reach = [[False] * n for _ in range(n)]
    for a, b in prerequisites:
        reach[a][b] = True
    for k in range(n):                        # 中繼點一定放最外層
        for i in range(n):
            if reach[i][k]:
                for j in range(n):
                    if reach[k][j]:
                        reach[i][j] = True
    return [reach[u][v] for u, v in queries]`,
        c: `bool *checkIfPrerequisite(int numCourses, int **prerequisites, int prerequisitesSize, int *prerequisitesColSize,
                          int **queries, int queriesSize, int *queriesColSize, int *returnSize) {
    int n = numCourses;
    bool reach[100][100] = {{false}};
    for (int i = 0; i < prerequisitesSize; i++) reach[prerequisites[i][0]][prerequisites[i][1]] = true;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            if (reach[i][k])
                for (int j = 0; j < n; j++)
                    if (reach[k][j]) reach[i][j] = true;
    bool *res = malloc(queriesSize * sizeof(bool));
    for (int i = 0; i < queriesSize; i++) res[i] = reach[queries[i][0]][queries[i][1]];
    *returnSize = queriesSize;
    return res;
}`,
        cpp: `vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
    int n = numCourses;
    vector<vector<bool>> reach(n, vector<bool>(n, false));
    for (auto &p : prerequisites) reach[p[0]][p[1]] = true;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            if (reach[i][k])
                for (int j = 0; j < n; j++)
                    if (reach[k][j]) reach[i][j] = true;
    vector<bool> res;
    for (auto &q : queries) res.push_back(reach[q[0]][q[1]]);
    return res;
}`,
        java: `List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries) {
    int n = numCourses;
    boolean[][] reach = new boolean[n][n];
    for (int[] p : prerequisites) reach[p[0]][p[1]] = true;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            if (reach[i][k])
                for (int j = 0; j < n; j++)
                    if (reach[k][j]) reach[i][j] = true;
    List<Boolean> res = new ArrayList<>();
    for (int[] q : queries) res.add(reach[q[0]][q[1]]);
    return res;
}`,
        javascript: `function checkIfPrerequisite(numCourses, prerequisites, queries) {
  const n = numCourses, reach = Array.from({ length: n }, () => new Array(n).fill(false));
  for (const [a, b] of prerequisites) reach[a][b] = true;
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      if (reach[i][k]) for (let j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
  return queries.map(([u, v]) => reach[u][v]);
}`,
      },
    },
    {
      name: '拓撲排序 + 先修集合',
      idea: 'Kahn 演算法依拓撲順序處理;邊 u → v 時 `pre[v] |= pre[u] | {u}`。查詢 `u in pre[v]`。',
      steps: ['建圖、算入度', '入度 0 的放進佇列', '彈出 u:每個 v:`pre[v] |= pre[u] | (1 << u)`;入度減到 0 就入佇列', '查詢 `pre[v] >> u & 1`'],
      figure: { title: 'prerequisites = [[0,1],[1,2],[2,3]]', steps: topoFig() },
      complexity: { time: 'O(n · E / w + Q)', space: 'O(n²)', why: '每條邊做一次集合合併;用位元時 w 是字長。' },
      verdict: '圖很稀疏時比 n³ 快;也是 [[p:topological-sort]] 傳遞資訊的典型用法。',
      code: {
        python: `from collections import deque

def checkIfPrerequisite(numCourses, prerequisites, queries):
    n = numCourses
    g = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in prerequisites:
        g[a].append(b)
        indeg[b] += 1
    pre = [0] * n                             # pre[v]:v 的所有先修(位元遮罩)
    q = deque(i for i in range(n) if indeg[i] == 0)
    while q:
        u = q.popleft()
        for v in g[u]:
            pre[v] |= pre[u] | 1 << u         # u 的先修也是 v 的先修
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return [bool(pre[v] >> u & 1) for u, v in queries]`,
        c: `bool *checkIfPrerequisite(int numCourses, int **prerequisites, int prerequisitesSize, int *prerequisitesColSize,
                          int **queries, int queriesSize, int *queriesColSize, int *returnSize) {
    int n = numCourses, indeg[100] = {0}, q[100], h = 0, t = 0;
    static bool adj[100][100], pre[100][100];
    memset(adj, 0, sizeof adj); memset(pre, 0, sizeof pre);
    for (int i = 0; i < prerequisitesSize; i++) {
        int a = prerequisites[i][0], b = prerequisites[i][1];
        if (!adj[a][b]) { adj[a][b] = true; indeg[b]++; }
    }
    for (int i = 0; i < n; i++) if (!indeg[i]) q[t++] = i;
    while (h < t) {
        int u = q[h++];
        for (int v = 0; v < n; v++) {
            if (!adj[u][v]) continue;
            pre[v][u] = true;
            for (int k = 0; k < n; k++) if (pre[u][k]) pre[v][k] = true;
            if (--indeg[v] == 0) q[t++] = v;
        }
    }
    bool *res = malloc(queriesSize * sizeof(bool));
    for (int i = 0; i < queriesSize; i++) res[i] = pre[queries[i][1]][queries[i][0]];
    *returnSize = queriesSize;
    return res;
}`,
        cpp: `vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
    int n = numCourses;
    vector<vector<int>> g(n);
    vector<int> indeg(n, 0);
    for (auto &p : prerequisites) { g[p[0]].push_back(p[1]); indeg[p[1]]++; }
    vector<bitset<100>> pre(n);
    queue<int> q;
    for (int i = 0; i < n; i++) if (!indeg[i]) q.push(i);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            pre[v] |= pre[u];
            pre[v][u] = 1;
            if (--indeg[v] == 0) q.push(v);
        }
    }
    vector<bool> res;
    for (auto &qq : queries) res.push_back(pre[qq[1]][qq[0]]);
    return res;
}`,
        java: `List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries) {
    int n = numCourses;
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] p : prerequisites) { g.get(p[0]).add(p[1]); indeg[p[1]]++; }
    BitSet[] pre = new BitSet[n];
    for (int i = 0; i < n; i++) pre[i] = new BitSet(n);
    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : g.get(u)) {
            pre[v].or(pre[u]);
            pre[v].set(u);
            if (--indeg[v] == 0) q.offer(v);
        }
    }
    List<Boolean> res = new ArrayList<>();
    for (int[] qq : queries) res.add(pre[qq[1]].get(qq[0]));
    return res;
}`,
        javascript: `function checkIfPrerequisite(numCourses, prerequisites, queries) {
  const n = numCourses, g = Array.from({ length: n }, () => []), indeg = new Array(n).fill(0);
  for (const [a, b] of prerequisites) {
    g[a].push(b);
    indeg[b]++;
  }
  const pre = Array.from({ length: n }, () => new Set()), q = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (const v of g[u]) {
      for (const k of pre[u]) pre[v].add(k);
      pre[v].add(u);
      if (--indeg[v] === 0) q.push(v);
    }
  }
  return queries.map(([u, v]) => pre[v].has(u));
}`,
      },
    },
  ],
  pitfalls: ['只看直接的先修邊:題目說先修關係會傳遞', 'Floyd 把 k 放在內層:結果會漏掉某些間接路徑', '每個查詢各跑一次 BFS:10⁴ 個查詢 × O(n + E) 也能過,但可達表更快'],
  check: {
    kind: 'fn',
    fn: 'checkIfPrerequisite',
    cases: [
      { args: [2, [[1, 0]], [[0, 1], [1, 0]]], out: [false, true] },
      { args: [2, [], [[1, 0], [0, 1]]], out: [false, false] },
      { args: [3, [[1, 2], [1, 0], [2, 0]], [[1, 0], [1, 2]]], out: [true, true] },
      { args: [N, PRE, [[0, 3], [3, 0], [1, 3], [2, 1]]], out: [true, false, true, false] },
    ],
  },
}
