import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 207. Course Schedule

const N = 6
// [a, b]:要修 a 之前得先修 b → 邊 b → a
const PRE = [
  [1, 0],
  [2, 0],
  [3, 1],
  [3, 2],
  [4, 3],
  [5, 4],
]
const EDGES = PRE.map(([a, b]) => [b, a])
const POS = { 0: { x: 0, y: 1 }, 1: { x: 1.3, y: 0 }, 2: { x: 1.3, y: 2 }, 3: { x: 2.6, y: 1 }, 4: { x: 3.9, y: 1 }, 5: { x: 5.2, y: 1 } }

function kahnFig(edges: number[][]): FigStep[] {
  const indeg = Array(N).fill(0)
  const adj: number[][] = Array.from({ length: N }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    indeg[v]++
  }
  const subs = () => Object.fromEntries(indeg.map((d, i) => [i, `入度 ${d}`]))
  const cls: Record<number, string> = {}
  const q: number[] = []
  indeg.forEach((d, i) => d === 0 && q.push(i))
  const out: FigStep[] = [{ note: '每門課是一個節點,「先修 b 才能修 a」是一條 b → a 的箭頭。入度 = 還有幾門先修課沒修完。入度 0 的課現在就能修,放進佇列', views: [graphView(N, edges, { directed: true, pos: POS, subs: subs(), cls: Object.fromEntries(q.map((x) => [x, 'queued'])) }), arr(q, { label: '佇列(可以修的課)' })] }]
  let done = 0
  while (q.length) {
    const u = q.shift()!
    done++
    cls[u] = 'done'
    const freed: number[] = []
    for (const v of adj[u]) if (--indeg[v] === 0) (q.push(v), freed.push(v))
    out.push({ note: `修課程 ${u}(已修 ${done} 門)。它指向的課入度 −1${freed.length ? `,${freed.join('、')} 的入度變成 0 → 可以修了,放進佇列` : ''}`, views: [graphView(N, edges, { directed: true, pos: POS, subs: subs(), cls: { ...cls, [u]: 'hl', ...Object.fromEntries(q.map((x) => [x, 'queued'])) } }), arr(q, { label: '佇列' })] })
  }
  out.push({ note: done === N ? `${N} 門課全部修完 → 沒有循環,可以修完 → true` : `只修了 ${done} 門,剩下的課互相卡住(有循環)→ false`, views: [graphView(N, edges, { directed: true, pos: POS, cls })] })
  return out
}

function dfsFig(): FigStep[] {
  const adj: number[][] = Array.from({ length: N }, () => [])
  for (const [u, v] of EDGES) adj[u].push(v)
  const state = Array(N).fill(0) // 0 沒走過、1 走訪中(在目前的路徑上)、2 走完了
  const cls = () => Object.fromEntries(state.map((s, i) => [i, s === 1 ? 'hl' : s === 2 ? 'done' : '']))
  const out: FigStep[] = [{ note: '另一種判斷循環的方法:DFS 時給節點三種狀態 —— 沒走過(外框)、走訪中(實心,正在目前這條路上)、走完(變淡,完全走完、確定沒問題)。走到一個「走訪中」的節點 = 繞回自己的路上 = 有循環', views: [graphView(N, EDGES, { directed: true, pos: POS })] }]
  const dfs = (u: number): boolean => {
    state[u] = 1
    out.push({ note: `進入 ${u},標成「走訪中」`, views: [graphView(N, EDGES, { directed: true, pos: POS, cls: cls() })] })
    for (const v of adj[u]) {
      if (state[v] === 1) return false
      if (state[v] === 0 && !dfs(v)) return false
    }
    state[u] = 2
    out.push({ note: `${u} 能到的課都檢查完了,沒有繞回來 → 標成「走完」`, views: [graphView(N, EDGES, { directed: true, pos: POS, cls: cls() })] })
    return true
  }
  for (let i = 0; i < N; i++) if (state[i] === 0) dfs(i)
  out.push({ note: '所有節點都走完,沒遇到「走訪中」的節點 → 沒有循環 → true', views: [graphView(N, EDGES, { directed: true, pos: POS, cls: cls() })] })
  return out
}

export const q0207: Solution = {
  id: 207,
  plain: '有幾門課,有些課要先修過別的課才能修。問有沒有辦法把所有課都修完。唯一會失敗的情況是「互相卡住」:A 要先修 B、B 又要先修 A(繞成一圈)。',
  statement: '共有 `numCourses` 門課(0 ~ n−1),`prerequisites[i] = [a, b]` 表示修 a 之前必須先修 b。判斷能不能修完所有課。',
  examples: [
    { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' },
    { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', note: '互相是對方的先修課' },
  ],
  constraints: ['`n ≤ 2000`,先修關係最多 5000 條'],
  insight: [
    '把課當節點、「先修 b 才能修 a」當成 b → a 的有向邊。能修完 ⇔ 這張**有向圖沒有環**',
    '拓撲排序(Kahn):不斷拿出「入度 0」(沒有未修先修課)的課來修,修完就把它指向的課入度 −1。最後修得完全部 ⇔ 沒有環',
    'DFS 判環:走訪時標記「正在目前路徑上」的節點,又走到它 → 有環',
  ],
  approaches: [
    {
      name: '拓撲排序(Kahn,BFS + 入度)',
      idea: '算每門課的入度。入度 0 的放進佇列;拿出一門課就「修掉」它,它指向的課入度 −1,變成 0 就放進佇列。最後修過的數量 == n 就是 true。',
      steps: ['建鄰接串列、算入度', '入度 0 的課放進佇列', '拿出 u,`count += 1`;對 u 的每個 v:`indeg[v] −= 1`,變 0 就放進佇列', '回傳 `count == n`'],
      figure: { title: `numCourses = ${N}, prerequisites = ${JSON.stringify(PRE)}`, steps: kahnFig(EDGES) },
      complexity: { time: 'O(V + E)', space: 'O(V + E)', why: '每門課進出佇列一次,每條邊減一次入度。' },
      verdict: '標準解,[[p:topological-sort]]的入門題。順便得到修課順序([210](#/q/210))。',
      code: {
        python: `from collections import deque

def canFinish(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]
    indeg = [0] * numCourses
    for a, b in prerequisites:
        adj[b].append(a)                  # 修完 b 才能修 a:b -> a
        indeg[a] += 1
    q = deque(i for i in range(numCourses) if indeg[i] == 0)
    done = 0
    while q:
        u = q.popleft()
        done += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:             # 先修課都修完了
                q.append(v)
    return done == numCourses`,
        c: `bool canFinish(int numCourses, int **prerequisites, int prerequisitesSize, int *prerequisitesColSize) {
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
    free(adj); free(cnt); free(indeg); free(deg); free(q);
    return tail == n;                         // 進過佇列的就是修得到的課
}`,
        cpp: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> indeg(numCourses, 0);
    for (auto& p : prerequisites) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) if (!indeg[i]) q.push(i);
    int done = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        done++;
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    return done == numCourses;
}`,
        java: `boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    int[] indeg = new int[numCourses];
    for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);
    int done = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        done++;
        for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return done == numCourses;
}`,
        javascript: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (--indeg[v] === 0) q.push(v);
  return q.length === numCourses;
}`,
      },
    },
    {
      name: 'DFS 三色判環',
      idea: '`state`:0 沒走過、1 走訪中(在目前的遞迴路徑上)、2 走完了。DFS 時遇到 state 1 的鄰居 → 有環;節點的所有鄰居都檢查完才標成 2。',
      steps: ['`state = [0] * n`', '`dfs(u)`:`state[u] = 1`;每個鄰居 v:`state[v] == 1` → 有環;`state[v] == 0` 就遞迴', '`state[u] = 2`', '每個 state 0 的節點都 dfs 一次'],
      figure: { title: `numCourses = ${N}, prerequisites = ${JSON.stringify(PRE)}`, steps: dfsFig() },
      complexity: { time: 'O(V + E)', space: 'O(V + E)', why: '每個節點、每條邊各處理一次;遞迴深度最壞 V。' },
      verdict: '有向圖判環的通用寫法。只用 visited 兩種狀態是錯的:走到一個「已經完全走完」的節點不代表有環,一定要分出「正在路徑上」。',
      code: {
        python: `import sys

def canFinish(numCourses, prerequisites):
    sys.setrecursionlimit(10000)
    adj = [[] for _ in range(numCourses)]
    for a, b in prerequisites:
        adj[b].append(a)
    state = [0] * numCourses              # 0 沒走過、1 在目前路徑上、2 走完了

    def has_cycle(u):
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1:
                return True               # 繞回目前的路徑 → 有環
            if state[v] == 0 and has_cycle(v):
                return True
        state[u] = 2
        return False

    return not any(state[i] == 0 and has_cycle(i) for i in range(numCourses))`,
        c: `static int **Adj, *Cnt, *State;

static bool hasCycle(int u) {
    State[u] = 1;
    for (int k = 0; k < Cnt[u]; k++) {
        int v = Adj[u][k];
        if (State[v] == 1) return true;
        if (State[v] == 0 && hasCycle(v)) return true;
    }
    State[u] = 2;
    return false;
}

bool canFinish(int numCourses, int **prerequisites, int prerequisitesSize, int *prerequisitesColSize) {
    int n = numCourses, *deg = calloc(n, sizeof(int));
    for (int i = 0; i < prerequisitesSize; i++) deg[prerequisites[i][1]]++;
    Adj = malloc(n * sizeof(int *)); Cnt = calloc(n, sizeof(int)); State = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) Adj[i] = malloc((deg[i] ? deg[i] : 1) * sizeof(int));
    for (int i = 0; i < prerequisitesSize; i++) { int b = prerequisites[i][1]; Adj[b][Cnt[b]++] = prerequisites[i][0]; }
    bool ok = true;
    for (int i = 0; i < n && ok; i++) if (State[i] == 0 && hasCycle(i)) ok = false;
    for (int i = 0; i < n; i++) free(Adj[i]);
    free(Adj); free(Cnt); free(State); free(deg);
    return ok;
}`,
        cpp: `bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    for (auto& p : prerequisites) adj[p[1]].push_back(p[0]);
    vector<int> state(numCourses, 0);
    function<bool(int)> hasCycle = [&](int u) {
        state[u] = 1;
        for (int v : adj[u]) {
            if (state[v] == 1) return true;
            if (state[v] == 0 && hasCycle(v)) return true;
        }
        state[u] = 2;
        return false;
    };
    for (int i = 0; i < numCourses; i++) if (state[i] == 0 && hasCycle(i)) return false;
    return true;
}`,
        java: `private List<List<Integer>> adj;
private int[] state;

boolean canFinish(int numCourses, int[][] prerequisites) {
    adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);
    state = new int[numCourses];
    for (int i = 0; i < numCourses; i++) if (state[i] == 0 && hasCycle(i)) return false;
    return true;
}

private boolean hasCycle(int u) {
    state[u] = 1;
    for (int v : adj.get(u)) {
        if (state[v] == 1) return true;
        if (state[v] == 0 && hasCycle(v)) return true;
    }
    state[u] = 2;
    return false;
}`,
        javascript: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) adj[b].push(a);
  const state = new Array(numCourses).fill(0);
  const hasCycle = (u) => {
    state[u] = 1;
    for (const v of adj[u]) {
      if (state[v] === 1) return true;
      if (state[v] === 0 && hasCycle(v)) return true;
    }
    state[u] = 2;
    return false;
  };
  for (let i = 0; i < numCourses; i++) if (state[i] === 0 && hasCycle(i)) return false;
  return true;
}`,
      },
    },
  ],
  pitfalls: [
    '邊的方向弄反:`[a, b]` 是「先修 b 才能修 a」,邊是 **b → a**(反過來建也能判環,但 210 要輸出順序時會錯)',
    'DFS 只用一個 visited:兩條路線匯流到同一個節點(菱形)不是環,只有「走回目前路徑上的節點」才是',
    '課程之間可能完全沒關係(不連通),每個節點都要當起點檢查一次',
  ],
  followUp: [{ q: '要輸出一個可行的修課順序?', a: '[210. Course Schedule II](#/q/210):Kahn 拿出來的順序就是答案。' }],
  check: {
    kind: 'fn',
    fn: 'canFinish',
    cases: [
      { args: [2, [[1, 0]]], out: true },
      { args: [2, [[1, 0], [0, 1]]], out: false },
      { args: [N, PRE], out: true },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], out: false },
      { args: [3, []], out: true },
      { args: [4, [[1, 0], [2, 1], [3, 2], [1, 3]]], out: false },
    ],
  },
}
