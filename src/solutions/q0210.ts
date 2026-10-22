import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 210. Course Schedule II

const N = 5
const PRE = [
  [1, 0],
  [2, 1],
  [3, 1],
  [3, 2],
  [4, 3],
]
const EDGES = PRE.map(([a, b]) => [b, a])
const POS = { 0: { x: 0, y: 1 }, 1: { x: 1.3, y: 1 }, 2: { x: 2.6, y: 0 }, 3: { x: 3.9, y: 1 }, 4: { x: 5.2, y: 1 } }

function kahnFig(): FigStep[] {
  const indeg = Array(N).fill(0)
  const adj: number[][] = Array.from({ length: N }, () => [])
  for (const [u, v] of EDGES) {
    adj[u].push(v)
    indeg[v]++
  }
  const order: number[] = []
  const q: number[] = []
  indeg.forEach((d, i) => d === 0 && q.push(i))
  const cls = (): Record<number, string> => ({ ...Object.fromEntries(order.map((x) => [x, 'done'])), ...Object.fromEntries(q.map((x) => [x, 'queued'])) })
  const subs = () => Object.fromEntries(indeg.map((d, i) => [i, `入度 ${d}`]))
  const out: FigStep[] = [{ note: '和 207 一樣的 Kahn 演算法:**從佇列拿出來的順序**就是一個合法的修課順序(每門課被拿出來時,它的先修課都已經在前面了)', views: [graphView(N, EDGES, { directed: true, pos: POS, cls: cls(), subs: subs() }), arr(q, { label: '佇列' }), arr(order, { label: '修課順序' })] }]
  while (q.length) {
    const u = q.shift()!
    order.push(u)
    for (const v of adj[u]) if (--indeg[v] === 0) q.push(v)
    out.push({ note: `修 ${u},放到順序的最後;它指向的課入度 −1`, views: [graphView(N, EDGES, { directed: true, pos: POS, cls: { ...cls(), [u]: 'hl' }, subs: subs() }), arr(q, { label: '佇列' }), arr(order, { label: '修課順序' })] })
  }
  out.push({ note: order.length === N ? `順序 [${order.join(', ')}]` : '修不完(有環)→ 回傳空陣列', views: [arr(order, { label: '答案', done: order.map((_, i) => i) })] })
  return out
}

function dfsFig(): FigStep[] {
  const adj: number[][] = Array.from({ length: N }, () => [])
  for (const [u, v] of EDGES) adj[u].push(v)
  const state = Array(N).fill(0)
  const post: number[] = []
  const out: FigStep[] = [{ note: 'DFS 版:一門課「完成」(它後面能到的課都處理完)時把它記下來 —— 這叫後序。後序是「越後面的課越早完成」,**反過來**就是修課順序', views: [graphView(N, EDGES, { directed: true, pos: POS })] }]
  const dfs = (u: number) => {
    state[u] = 1
    for (const v of adj[u]) if (state[v] === 0) dfs(v)
    state[u] = 2
    post.push(u)
    out.push({ note: `${u} 後面的課都處理完了 → 記進後序`, views: [graphView(N, EDGES, { directed: true, pos: POS, cls: Object.fromEntries(post.map((x) => [x, 'done'])) }), arr(post, { label: '後序(完成的先後)' })] })
  }
  for (let i = 0; i < N; i++) if (!state[i]) dfs(i)
  out.push({ note: `後序反過來 → [${[...post].reverse().join(', ')}]`, views: [arr([...post].reverse(), { label: '修課順序', done: post.map((_, i) => i) })] })
  return out
}

export const q0210: Solution = {
  id: 210,
  plain: '和 207 一樣有先修課的限制,這次要排出一個**能把所有課修完的順序**;做不到就回傳空的。像排課表:先排沒有先修課的,修完它們,解鎖的課再排進去。',
  statement: '共 `numCourses` 門課,`prerequisites[i] = [a, b]` 表示修 a 前要先修 b。回傳任一個能修完所有課的順序;不可能就回傳空陣列。',
  examples: [
    { input: 'numCourses = 2, prerequisites = [[1,0]]', output: '[0,1]' },
    { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,2,1,3] 或 [0,1,2,3]' },
    { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: '[]' },
  ],
  constraints: ['`n ≤ 2000`', '答案可能不唯一,回傳任一個都可以'],
  insight: [
    '這就是**拓撲排序**本身:把有向圖的節點排成一列,讓每條邊都從前面指向後面',
    'Kahn:每次挑一個入度 0 的節點放到最後,再把它的出邊刪掉 —— 拿出來的順序就是答案',
    'DFS:節點「完成」時(所有能到的節點都處理完)記下來,得到的是**反過來的**拓撲順序',
    '兩種做法都能順便偵測環:Kahn 拿不完、DFS 遇到「走訪中」的節點',
  ],
  approaches: [
    {
      name: 'Kahn(BFS + 入度)',
      idea: '入度 0 的放進佇列;拿出來就放進答案,把它指向的課入度 −1。最後答案長度 == n 就回傳,否則有環回傳 `[]`。',
      steps: ['建圖、算入度', '入度 0 的放進佇列', '拿出 u,`order.append(u)`;鄰居入度 −1,變 0 就放進佇列', '`len(order) == n` → order,否則 `[]`'],
      figure: { title: `numCourses = ${N}, prerequisites = ${JSON.stringify(PRE)}`, steps: kahnFig() },
      complexity: { time: 'O(V + E)', space: 'O(V + E)', why: '每個節點、每條邊各處理一次。' },
      verdict: '標準解,[[p:topological-sort]]的模板。',
      code: {
        python: `from collections import deque

def findOrder(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]
    indeg = [0] * numCourses
    for a, b in prerequisites:
        adj[b].append(a)
        indeg[a] += 1
    q = deque(i for i in range(numCourses) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)                   # 拿出來的順序就是修課順序
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == numCourses else []`,
        c: `int *findOrder(int numCourses, int **prerequisites, int prerequisitesSize, int *prerequisitesColSize, int *returnSize) {
    int n = numCourses, *indeg = calloc(n, sizeof(int)), *deg = calloc(n, sizeof(int));
    for (int i = 0; i < prerequisitesSize; i++) { deg[prerequisites[i][1]]++; indeg[prerequisites[i][0]]++; }
    int **adj = malloc(n * sizeof(int *)), *cnt = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) adj[i] = malloc((deg[i] ? deg[i] : 1) * sizeof(int));
    for (int i = 0; i < prerequisitesSize; i++) { int b = prerequisites[i][1]; adj[b][cnt[b]++] = prerequisites[i][0]; }
    int *q = malloc(n * sizeof(int)), head = 0, tail = 0;
    for (int i = 0; i < n; i++) if (!indeg[i]) q[tail++] = i;
    while (head < tail) {
        int u = q[head++];
        for (int k = 0; k < cnt[u]; k++) if (--indeg[adj[u][k]] == 0) q[tail++] = adj[u][k];
    }
    for (int i = 0; i < n; i++) free(adj[i]);
    free(adj); free(cnt); free(indeg); free(deg);
    *returnSize = tail == n ? n : 0;          // 佇列本身就是答案
    return q;
}`,
        cpp: `vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> indeg(numCourses, 0), order;
    for (auto& p : prerequisites) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) if (!indeg[i]) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    return (int)order.size() == numCourses ? order : vector<int>{};
}`,
        java: `int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    int[] indeg = new int[numCourses], order = new int[numCourses];
    for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);
    int k = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        order[k++] = u;
        for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return k == numCourses ? order : new int[0];
}`,
        javascript: `function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (--indeg[v] === 0) q.push(v);
  return q.length === numCourses ? q : [];
}`,
      },
    },
    {
      name: 'DFS 後序反轉',
      idea: '三色 DFS(同 207)。一個節點標成「走完」時,把它放進 post;遇到「走訪中」的節點代表有環。最後把 post 反過來就是答案。',
      steps: ['`dfs(u)`:`state[u] = 1`;鄰居 `state == 1` → 有環;`== 0` → 遞迴', '`state[u] = 2`,`post.append(u)`', '對所有未走過的節點 dfs', '有環 → `[]`;否則 `post[::-1]`'],
      figure: { title: `numCourses = ${N}, prerequisites = ${JSON.stringify(PRE)}`, steps: dfsFig() },
      complexity: { time: 'O(V + E)', space: 'O(V + E)', why: '每個節點、每條邊一次。' },
      verdict: '一個節點完成時,它後面依賴它的課都已經先完成了(在 post 的前面),所以要反過來。',
      code: {
        python: `import sys

def findOrder(numCourses, prerequisites):
    sys.setrecursionlimit(10000)
    adj = [[] for _ in range(numCourses)]
    for a, b in prerequisites:
        adj[b].append(a)
    state = [0] * numCourses
    post = []

    def dfs(u):
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1 or (state[v] == 0 and not dfs(v)):
                return False              # 有環
        state[u] = 2
        post.append(u)                    # u 後面的課都完成了
        return True

    for i in range(numCourses):
        if state[i] == 0 and not dfs(i):
            return []
    return post[::-1]`,
        c: `static int **Adj, *Cnt, *State, *Post, PostN;

static bool dfs(int u) {
    State[u] = 1;
    for (int k = 0; k < Cnt[u]; k++) {
        int v = Adj[u][k];
        if (State[v] == 1) return false;
        if (State[v] == 0 && !dfs(v)) return false;
    }
    State[u] = 2;
    Post[PostN++] = u;
    return true;
}

int *findOrder(int numCourses, int **prerequisites, int prerequisitesSize, int *prerequisitesColSize, int *returnSize) {
    int n = numCourses, *deg = calloc(n, sizeof(int));
    for (int i = 0; i < prerequisitesSize; i++) deg[prerequisites[i][1]]++;
    Adj = malloc(n * sizeof(int *)); Cnt = calloc(n, sizeof(int)); State = calloc(n, sizeof(int));
    Post = malloc(n * sizeof(int)); PostN = 0;
    for (int i = 0; i < n; i++) Adj[i] = malloc((deg[i] ? deg[i] : 1) * sizeof(int));
    for (int i = 0; i < prerequisitesSize; i++) { int b = prerequisites[i][1]; Adj[b][Cnt[b]++] = prerequisites[i][0]; }
    bool ok = true;
    for (int i = 0; i < n && ok; i++) if (State[i] == 0 && !dfs(i)) ok = false;
    int *res = malloc(n * sizeof(int));
    for (int i = 0; i < PostN; i++) res[i] = Post[PostN - 1 - i];
    *returnSize = ok ? n : 0;
    return res;
}`,
        cpp: `vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    for (auto& p : prerequisites) adj[p[1]].push_back(p[0]);
    vector<int> state(numCourses, 0), post;
    function<bool(int)> dfs = [&](int u) {
        state[u] = 1;
        for (int v : adj[u]) {
            if (state[v] == 1) return false;
            if (state[v] == 0 && !dfs(v)) return false;
        }
        state[u] = 2;
        post.push_back(u);
        return true;
    };
    for (int i = 0; i < numCourses; i++) if (state[i] == 0 && !dfs(i)) return {};
    reverse(post.begin(), post.end());
    return post;
}`,
        java: `private List<List<Integer>> adj;
private int[] state;
private List<Integer> post;

int[] findOrder(int numCourses, int[][] prerequisites) {
    adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);
    state = new int[numCourses];
    post = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) if (state[i] == 0 && !dfs(i)) return new int[0];
    int[] res = new int[numCourses];
    for (int i = 0; i < numCourses; i++) res[i] = post.get(numCourses - 1 - i);
    return res;
}

private boolean dfs(int u) {
    state[u] = 1;
    for (int v : adj.get(u)) {
        if (state[v] == 1) return false;
        if (state[v] == 0 && !dfs(v)) return false;
    }
    state[u] = 2;
    post.add(u);
    return true;
}`,
        javascript: `function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) adj[b].push(a);
  const state = new Array(numCourses).fill(0), post = [];
  const dfs = (u) => {
    state[u] = 1;
    for (const v of adj[u]) {
      if (state[v] === 1) return false;
      if (state[v] === 0 && !dfs(v)) return false;
    }
    state[u] = 2;
    post.push(u);
    return true;
  };
  for (let i = 0; i < numCourses; i++) if (state[i] === 0 && !dfs(i)) return [];
  return post.reverse();
}`,
      },
    },
  ],
  pitfalls: [
    'DFS 後序忘了反轉:得到的是「最後修的在最前面」',
    '有環時要回傳**空陣列**,不是回傳到一半的順序',
    '沒有任何先修課的課(孤立節點)也要放進答案',
  ],
  followUp: [{ q: '要「字典序最小」的順序?', a: '把 Kahn 的佇列換成最小堆,每次拿編號最小的入度 0 節點。' }],
  check: {
    kind: 'fn',
    fn: 'findOrder',
    cases: [
      { args: [2, [[1, 0]]], out: [0, 1] },
      { args: [2, [[1, 0], [0, 1]]], out: [] },
      { args: [N, PRE], out: [0, 1, 2, 3, 4] },
      { args: [1, []], out: [0] },
      { args: [3, [[0, 1], [1, 2]]], out: [2, 1, 0] },
    ],
  },
}
