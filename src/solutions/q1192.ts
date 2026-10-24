import { arr } from '../engine/helpers'
import { graphView } from './fig'
import type { Solution } from './types'

const E = [[0, 1], [1, 2], [2, 0], [1, 3]]
const CHECK = {
  python: `
def bridgeCheck(n, connections):
    return [sorted(edge) for edge in criticalConnections(n, connections)]`,
  c: `
int **bridgeCheck(int n, int **connections, int connectionsSize, int *connectionsColSize, int *returnSize, int **returnColumnSizes) {
    int **out = criticalConnections(n, connections, connectionsSize, connectionsColSize, returnSize, returnColumnSizes);
    for (int i = 0; i < *returnSize; i++) {
        if (out[i][0] > out[i][1]) {
            int t = out[i][0];
            out[i][0] = out[i][1];
            out[i][1] = t;
        }
    }
    return out;
}`,
  cpp: `
vector<vector<int>> bridgeCheck(int n, vector<vector<int>> connections) {
    auto out = criticalConnections(n, connections);
    for (auto &edge : out) sort(edge.begin(), edge.end());
    return out;
}`,
  java: `
List<List<Integer>> bridgeCheck(int n, List<List<Integer>> connections) {
    List<List<Integer>> out = criticalConnections(n, connections);
    for (List<Integer> edge : out) Collections.sort(edge);
    return out;
}`,
  javascript: `
function bridgeCheck(n, connections) {
  return criticalConnections(n, connections).map((edge) => [...edge].sort((a, b) => a - b));
}`,
}

export const q1192: Solution = {
  id: 1192,
  plain: '找網路中的關鍵連線：只要拿掉它，原本相通的電腦就會被拆成兩群。',
  statement: '給 n 個節點與無向連線 connections，回傳所有橋邊：移除該邊會增加連通分量數。',
  examples: [{ input: 'n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]', output: '[[1,3]]' }, { input: 'n = 2, connections = [[0,1]]', output: '[[0,1]]' }],
  constraints: ['節點數最多 10⁵；線性解法須用 DFS 發現時間與 low 值。'],
  insight: ['移除一條邊後，若兩端仍能經其他路徑相通，這條邊就不是橋。', '逐條移除並重新測連通性正確但慢。', 'DFS 中 `low[v]` 是 v 的子樹靠返祖邊能碰到的最早節點；若 `low[v] > disc[u]`，u→v 是橋。這是 [[p:graph-traversal]]。'],
  approaches: [
    {
      name: '逐條移除邊並檢查連通',
      idea: '暫時排除每條邊，重新把其他邊連起來，看這條邊的兩端是否仍相通。',
      steps: ['對每條候選邊 e 建立新的並查集', '把除了 e 以外的邊都合併', '若 e 的兩端不再相通，就記下 e'],
      figure: { title: '四個節點的連線', steps: [
        { note: '原圖有 0、1、2 的三角形，節點 3 只接在 1 上。', views: [graphView(4, E)] },
        { note: '移除 0—1 後，仍可走 0→2→1，所以不是橋。', views: [graphView(4, E, { edgeCls: { 0: 'dim' }, cls: { 0: 'hl', 1: 'hl', 2: 'done' } })] },
        { note: '移除 1—2 後，也能透過 1→0→2 相通；三角形內都不是橋。', views: [graphView(4, E, { edgeCls: { 1: 'dim' }, cls: { 0: 'done', 1: 'hl', 2: 'hl' } })] },
        { note: '移除 1—3 後，3 沒有其他路可走；這條是唯一的橋。', views: [graphView(4, E, { edgeCls: { 3: 'hl' }, cls: { 3: 'dim' } }), arr(['1—3'], { label: '橋', done: [0] })] },
      ] },
      complexity: { time: 'O(E² log V)', space: 'O(V)，不含答案', why: '對每條邊都重建一次並查集並掃描所有邊；路徑壓縮可避免一般查找反覆走很長的鏈。' },
      verdict: '適合小圖驗算，超大圖要用一次 DFS。',
      code: {
        python: `def criticalConnections(n, connections):
    ans = []

    def find(parent, x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for skip, (a, b) in enumerate(connections):
        parent = list(range(n))
        for i, (u, v) in enumerate(connections):
            if i != skip:
                parent[find(parent, u)] = find(parent, v)
        if find(parent, a) != find(parent, b):
            ans.append([a, b])  # 刪這條邊後兩端斷開
    return ans${CHECK.python}`,
        c: `static int root1192(int *parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

int **criticalConnections(int n, int **connections, int connectionsSize, int *connectionsColSize, int *returnSize, int **returnColumnSizes) {
    int **out = malloc(connectionsSize * sizeof(int *));
    *returnColumnSizes = malloc(connectionsSize * sizeof(int));
    *returnSize = 0;
    int *parent = malloc(n * sizeof(int));
    for (int skip = 0; skip < connectionsSize; skip++) {
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int i = 0; i < connectionsSize; i++) {
            if (i == skip) continue;
            int a = root1192(parent, connections[i][0]);
            int b = root1192(parent, connections[i][1]);
            parent[a] = b;
        }
        int a = connections[skip][0], b = connections[skip][1];
        if (root1192(parent, a) != root1192(parent, b)) {
            out[*returnSize] = malloc(2 * sizeof(int));
            out[*returnSize][0] = a;
            out[*returnSize][1] = b;
            (*returnColumnSizes)[(*returnSize)++] = 2;
        }
    }
    free(parent);
    return out;
}${CHECK.c}`,
        cpp: `vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
    vector<vector<int>> out;
    for (int skip = 0; skip < (int)connections.size(); skip++) {
        vector<int> parent(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };
        for (int i = 0; i < (int)connections.size(); i++) {
            if (i != skip) parent[find(connections[i][0])] = find(connections[i][1]);
        }
        int a = connections[skip][0], b = connections[skip][1];
        if (find(a) != find(b)) out.push_back({a, b});
    }
    return out;
}${CHECK.cpp}`,
        java: `List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
    List<List<Integer>> out = new ArrayList<>();
    for (int skip = 0; skip < connections.size(); skip++) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int i = 0; i < connections.size(); i++) {
            if (i == skip) continue;
            int a = find1192(parent, connections.get(i).get(0));
            int b = find1192(parent, connections.get(i).get(1));
            parent[a] = b;
        }
        int a = connections.get(skip).get(0), b = connections.get(skip).get(1);
        if (find1192(parent, a) != find1192(parent, b)) out.add(Arrays.asList(a, b));
    }
    return out;
}

int find1192(int[] parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}${CHECK.java}`,
        javascript: `function criticalConnections(n, connections) {
  const out = [];
  for (let skip = 0; skip < connections.length; skip++) {
    const parent = Array.from({ length: n }, (_, i) => i);
    function find(x) {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    }
    for (let i = 0; i < connections.length; i++) {
      if (i === skip) continue;
      const [a, b] = connections[i];
      parent[find(a)] = find(b);
    }
    const [a, b] = connections[skip];
    if (find(a) !== find(b)) out.push([a, b]);
  }
  return out;
}${CHECK.javascript}`,
      },
    },
    {
      name: 'Tarjan 發現時間與 low 值',
      idea: '一次 DFS 確認每棵子樹能否繞回父節點或更早祖先。',
      steps: ['`disc[u]` 記首次走到 u 的時間，`low[u]` 初始等於它', '走未訪孩子 v 後，更新 `low[u]=min(low[u],low[v])`', '若 `low[v]>disc[u]`，u—v 是橋', '遇已訪的非父邊，改用 `disc[v]` 降低 low[u]'],
      figure: { title: '四個節點的連線', steps: [
        { note: '從 0 開始 DFS，沿 0→1→2 走，發現時間依序為 0、1、2。', views: [graphView(4, E, { cls: { 0: 'done', 1: 'done', 2: 'hl' }, subs: { 0: 'disc 0', 1: 'disc 1', 2: 'disc 2' } })] },
        { note: '2 看到回到 0 的邊，所以 low[2]=0；從 1 走向 2 的邊有替代路線。', views: [graphView(4, E, { edgeCls: { 2: 'hl' }, subs: { 2: 'low 0', 1: 'disc 1' } })] },
        { note: '從 1 走到 3，disc[3]=3；3 沒有返祖邊，low[3]=3。', views: [graphView(4, E, { cls: { 3: 'hl' }, subs: { 1: 'disc 1', 3: 'low 3' } })] },
        { note: 'low[3]=3 > disc[1]=1，故 1—3 是橋；三角形的邊都不是。', views: [graphView(4, E, { edgeCls: { 3: 'hl' } }), arr(['1—3'], { label: '橋', done: [0] })] },
      ] },
      complexity: { time: 'O(V+E)', space: 'O(V+E)', why: '每個節點與每條邊只處理固定次數。' },
      verdict: '推薦；比較子樹 low 與父節點 disc 是判橋的關鍵。',
      code: {
        python: `import sys

def criticalConnections(n, connections):
    sys.setrecursionlimit(max(1000000, n * 2))
    graph = [[] for _ in range(n)]
    for edge_id, (a, b) in enumerate(connections):
        graph[a].append((b, edge_id))
        graph[b].append((a, edge_id))
    disc = [-1] * n
    low = [0] * n
    out = []
    time = 0

    def dfs(u, parent_edge):
        nonlocal time
        disc[u] = low[u] = time
        time += 1
        for v, edge_id in graph[u]:
            if edge_id == parent_edge:
                continue
            if disc[v] == -1:
                dfs(v, edge_id)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    out.append([u, v])  # 子樹無法繞回 u
            else:
                low[u] = min(low[u], disc[v])

    for u in range(n):
        if disc[u] == -1:
            dfs(u, -1)
    return out${CHECK.python}`,
        c: `static void dfs1192(int u, int parentEdge, int *head, int *to, int *next, int *disc, int *low, int *clock, int **out, int *count) {
    disc[u] = low[u] = (*clock)++;
    for (int e = head[u]; e != -1; e = next[e]) {
        if (e / 2 == parentEdge) continue;
        int v = to[e];
        if (disc[v] == -1) {
            dfs1192(v, e / 2, head, to, next, disc, low, clock, out, count);
            if (low[v] < low[u]) low[u] = low[v];
            if (low[v] > disc[u]) {
                out[*count] = malloc(2 * sizeof(int));
                out[*count][0] = u;
                out[*count][1] = v;
                (*count)++;
            }
        } else if (disc[v] < low[u]) {
            low[u] = disc[v];
        }
    }
}

int **criticalConnections(int n, int **connections, int connectionsSize, int *connectionsColSize, int *returnSize, int **returnColumnSizes) {
    int m = connectionsSize;
    int *head = malloc(n * sizeof(int)), *to = malloc(2 * m * sizeof(int)), *next = malloc(2 * m * sizeof(int));
    int *disc = malloc(n * sizeof(int)), *low = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) head[i] = disc[i] = -1;
    for (int i = 0; i < m; i++) {
        int a = connections[i][0], b = connections[i][1];
        to[2 * i] = b;
        next[2 * i] = head[a];
        head[a] = 2 * i;
        to[2 * i + 1] = a;
        next[2 * i + 1] = head[b];
        head[b] = 2 * i + 1;
    }
    int **out = malloc(m * sizeof(int *));
    *returnColumnSizes = malloc(m * sizeof(int));
    *returnSize = 0;
    int clock = 0;
    for (int u = 0; u < n; u++) if (disc[u] == -1) dfs1192(u, -1, head, to, next, disc, low, &clock, out, returnSize);
    for (int i = 0; i < *returnSize; i++) (*returnColumnSizes)[i] = 2;
    free(head);
    free(to);
    free(next);
    free(disc);
    free(low);
    return out;
}${CHECK.c}`,
        cpp: `vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
    vector<vector<pair<int, int>>> graph(n);
    for (int i = 0; i < (int)connections.size(); i++) {
        int a = connections[i][0], b = connections[i][1];
        graph[a].push_back({b, i});
        graph[b].push_back({a, i});
    }
    vector<int> disc(n, -1), low(n);
    vector<vector<int>> out;
    int clock = 0;
    function<void(int, int)> dfs = [&](int u, int parentEdge) {
        disc[u] = low[u] = clock++;
        for (auto [v, edgeId] : graph[u]) {
            if (edgeId == parentEdge) continue;
            if (disc[v] == -1) {
                dfs(v, edgeId);
                low[u] = min(low[u], low[v]);
                if (low[v] > disc[u]) out.push_back({u, v});
            } else {
                low[u] = min(low[u], disc[v]);
            }
        }
    };
    for (int u = 0; u < n; u++) if (disc[u] == -1) dfs(u, -1);
    return out;
}${CHECK.cpp}`,
        java: `List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
    List<int[]>[] graph = new ArrayList[n];
    for (int i = 0; i < n; i++) graph[i] = new ArrayList<>();
    for (int i = 0; i < connections.size(); i++) {
        int a = connections.get(i).get(0), b = connections.get(i).get(1);
        graph[a].add(new int[]{b, i});
        graph[b].add(new int[]{a, i});
    }
    int[] disc = new int[n], low = new int[n], clock = {0};
    Arrays.fill(disc, -1);
    List<List<Integer>> out = new ArrayList<>();
    for (int u = 0; u < n; u++) if (disc[u] == -1) dfs1192(u, -1, graph, disc, low, clock, out);
    return out;
}

void dfs1192(int u, int parentEdge, List<int[]>[] graph, int[] disc, int[] low, int[] clock, List<List<Integer>> out) {
    disc[u] = low[u] = clock[0]++;
    for (int[] edge : graph[u]) {
        int v = edge[0], edgeId = edge[1];
        if (edgeId == parentEdge) continue;
        if (disc[v] == -1) {
            dfs1192(v, edgeId, graph, disc, low, clock, out);
            low[u] = Math.min(low[u], low[v]);
            if (low[v] > disc[u]) out.add(Arrays.asList(u, v));
        } else {
            low[u] = Math.min(low[u], disc[v]);
        }
    }
}${CHECK.java}`,
        javascript: `function criticalConnections(n, connections) {
  const graph = Array.from({ length: n }, () => []);
  connections.forEach(([a, b], id) => {
    graph[a].push([b, id]);
    graph[b].push([a, id]);
  });
  const disc = new Array(n).fill(-1), low = new Array(n).fill(0), out = [];
  let clock = 0;
  function dfs(u, parentEdge) {
    disc[u] = low[u] = clock++;
    for (const [v, edgeId] of graph[u]) {
      if (edgeId === parentEdge) continue;
      if (disc[v] === -1) {
        dfs(v, edgeId);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > disc[u]) out.push([u, v]);
      } else {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }
  for (let u = 0; u < n; u++) if (disc[u] === -1) dfs(u, -1);
  return out;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['無向邊會在鄰接表出現兩次；DFS 要排除回父節點的同一條邊。', '更新返祖邊時要用 `disc[v]`，子樹邊回來才用 `low[v]`。', '輸出邊的方向和順序不影響答案，驗證前先正規化。'],
  check: { kind: 'fn', fn: 'bridgeCheck', compare: 'groups', cases: [
    { args: [4, E], out: [[1, 3]] },
    { args: [2, [[0, 1]]], out: [[0, 1]] },
    { args: [3, [[0, 1], [1, 2], [2, 0]]], out: [] },
  ] },
}
