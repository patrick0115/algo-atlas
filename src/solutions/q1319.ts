import { graphView } from './fig'
import type { Solution } from './types'

// 1319. Number of Operations to Make Network Connected
const E = [[0, 1], [0, 2], [1, 2]]

export const q1319: Solution = {
  id: 1319,
  plain: '電腦間的網路線可以拔掉重接。找出最少要搬動幾條線，才能讓所有電腦連起來。',
  statement: '給 n 台電腦及現有連線 connections。每次可拆下一條線，改接任意兩台電腦。若無法把所有電腦連通，回傳 -1；否則回傳最少操作次數。',
  examples: [
    { input: 'n = 4, connections = [[0,1],[0,2],[1,2]]', output: '1' },
    { input: 'n = 6, connections = [[0,1],[0,2],[0,3],[1,2],[1,3]]', output: '2' },
    { input: 'n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]', output: '-1' },
  ],
  constraints: ['1 ≤ n ≤ 1000；連線最多 10⁵ 條；同一對電腦不會重複連線。'],
  insight: ['連通 n 台電腦至少要 n−1 條線；不夠就不可能。', '若線夠多，已有 c 個連通群，就需要 c−1 條跨群的線；群內多出的線正好可以挪用。'],
  approaches: [
    {
      name: '走訪連通群',
      idea: '用鄰接表建圖，DFS 數出有多少個互相不通的群。',
      steps: ['若線數 < n−1，回傳 -1。', '建雙向鄰接表。', '逐一從未走訪的電腦開始 DFS，每開始一次就多一個群。', '答案為群數減一。'],
      figure: { title: 'n = 4，connections = [[0,1],[0,2],[1,2]]', steps: [
        { note: '三條線剛好達到 n−1 = 3，先確定線的總數足夠。', views: [graphView(4, E)] },
        { note: '從 0 出發，沿線走到 1、2；它們是第一個連通群。', views: [graphView(4, E, { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'dim' } })] },
        { note: '3 還沒走到，單獨形成第二個群。', views: [graphView(4, E, { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'hl' } })] },
        { note: '0–1–2 形成環，多出一條可移動的線；兩群間只需接一條，答案 1。', views: [graphView(4, E, { edgeCls: { 2: 'dim' }, cls: { 3: 'hl' } })] },
      ] },
      complexity: { time: 'O(n+e)', space: 'O(n+e)', why: '建表與遍歷各自走過每條線及電腦常數次。' },
      verdict: '同時能看到每個連通群的成員，適合初學圖走訪。',
      code: {
        python: `def makeConnected(n, connections):
    if len(connections) < n - 1:
        return -1
    graph = [[] for _ in range(n)]
    for a, b in connections:
        graph[a].append(b)
        graph[b].append(a)
    seen = [False] * n
    groups = 0
    for start in range(n):
        if seen[start]:
            continue
        groups += 1  # 新起點代表一個新的連通群
        seen[start] = True
        stack = [start]
        while stack:
            node = stack.pop()
            for nxt in graph[node]:
                if not seen[nxt]:
                    seen[nxt] = True
                    stack.append(nxt)
    return groups - 1`,
        c: `int makeConnected(int n, int **connections, int connectionsSize, int *connectionsColSize) {
    if (connectionsSize < n - 1) {
        return -1;
    }
    int *head = malloc(n * sizeof(int));
    int *to = malloc(2 * connectionsSize * sizeof(int));
    int *next = malloc(2 * connectionsSize * sizeof(int));
    bool *seen = calloc(n, sizeof(bool));
    int *stack = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        head[i] = -1;
    }
    int edge = 0;
    for (int i = 0; i < connectionsSize; i++) {
        int a = connections[i][0];
        int b = connections[i][1];
        to[edge] = b;
        next[edge] = head[a];
        head[a] = edge++;
        to[edge] = a;
        next[edge] = head[b];
        head[b] = edge++;
    }
    int groups = 0;
    for (int start = 0; start < n; start++) {
        if (seen[start]) {
            continue;
        }
        groups++;
        int top = 0;
        stack[top++] = start;
        seen[start] = true;
        while (top > 0) {
            int node = stack[--top];
            for (int e = head[node]; e != -1; e = next[e]) {
                int v = to[e];
                if (!seen[v]) {
                    seen[v] = true;
                    stack[top++] = v;
                }
            }
        }
    }
    free(head);
    free(to);
    free(next);
    free(seen);
    free(stack);
    return groups - 1;
}`,
        cpp: `int makeConnected(int n, vector<vector<int>>& connections) {
    if ((int)connections.size() < n - 1) {
        return -1;
    }
    vector<vector<int>> graph(n);
    for (const auto& edge : connections) {
        graph[edge[0]].push_back(edge[1]);
        graph[edge[1]].push_back(edge[0]);
    }
    vector<bool> seen(n, false);
    int groups = 0;
    for (int start = 0; start < n; start++) {
        if (seen[start]) {
            continue;
        }
        groups++;
        vector<int> stack{start};
        seen[start] = true;
        while (!stack.empty()) {
            int node = stack.back();
            stack.pop_back();
            for (int v : graph[node]) {
                if (!seen[v]) {
                    seen[v] = true;
                    stack.push_back(v);
                }
            }
        }
    }
    return groups - 1;
}`,
        java: `int makeConnected(int n, int[][] connections) {
    if (connections.length < n - 1) {
        return -1;
    }
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] edge : connections) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
    }
    boolean[] seen = new boolean[n];
    int groups = 0;
    for (int start = 0; start < n; start++) {
        if (seen[start]) {
            continue;
        }
        groups++;
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(start);
        seen[start] = true;
        while (!stack.isEmpty()) {
            int node = stack.pop();
            for (int v : graph.get(node)) {
                if (!seen[v]) {
                    seen[v] = true;
                    stack.push(v);
                }
            }
        }
    }
    return groups - 1;
}`,
        javascript: `function makeConnected(n, connections) {
  if (connections.length < n - 1) {
    return -1;
  }
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of connections) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const seen = new Array(n).fill(false);
  let groups = 0;
  for (let start = 0; start < n; start++) {
    if (seen[start]) {
      continue;
    }
    groups++;
    const stack = [start];
    seen[start] = true;
    while (stack.length) {
      const node = stack.pop();
      for (const v of graph[node]) {
        if (!seen[v]) {
          seen[v] = true;
          stack.push(v);
        }
      }
    }
  }
  return groups - 1;
}`,
      },
    },
    {
      name: '並查集合併電腦',
      idea: '每台電腦初始自成一群；每條線嘗試合併兩群，最後剩幾群就需要幾群減一條新線。',
      steps: ['線數不足 n−1 時回傳 -1。', '初始化 parent[i] = i，群數為 n。', '對每條線尋找兩端的根；根不同才合併並把群數減一。', '回傳群數減一。'],
      figure: { title: 'n = 4，connections = [[0,1],[0,2],[1,2]]', steps: [
        { note: '一開始 0、1、2、3 各自是連通群，共 4 群。', views: [graphView(4, [], { cls: { 0: 'hl', 1: 'hl', 2: 'hl', 3: 'hl' } })] },
        { note: '讀到 0–1，合併兩群，剩 3 群。', views: [graphView(4, [[0, 1]], { cls: { 0: 'done', 1: 'done' } })] },
        { note: '讀到 0–2，再合併一群，剩 2 群。', views: [graphView(4, [[0, 1], [0, 2]], { cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
        { note: '1–2 兩端已在同一群，是可挪用的多餘線；最後兩群只需 1 次操作。', views: [graphView(4, E, { edgeCls: { 2: 'dim' }, cls: { 3: 'hl' } })] },
      ] },
      complexity: { time: 'O(e α(n))', space: 'O(n)', why: '每條線做近乎常數時間的尋根與合併。' },
      verdict: '適合大量邊的連通性題目，參考 [[p:union-find]]。',
      code: {
        python: `def makeConnected(n, connections):
    if len(connections) < n - 1:
        return -1
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])  # 路徑壓縮
        return parent[x]

    groups = n
    for a, b in connections:
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        if rank[ra] < rank[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        if rank[ra] == rank[rb]:
            rank[ra] += 1
        groups -= 1
    return groups - 1`,
        c: `static int findRoot(int *parent, int x) {
    if (parent[x] != x) {
        parent[x] = findRoot(parent, parent[x]);
    }
    return parent[x];
}

int makeConnected(int n, int **connections, int connectionsSize, int *connectionsColSize) {
    if (connectionsSize < n - 1) {
        return -1;
    }
    int *parent = malloc(n * sizeof(int));
    int *rank = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) {
        parent[i] = i;
    }
    int groups = n;
    for (int i = 0; i < connectionsSize; i++) {
        int a = findRoot(parent, connections[i][0]);
        int b = findRoot(parent, connections[i][1]);
        if (a == b) {
            continue;
        }
        if (rank[a] < rank[b]) {
            int temp = a;
            a = b;
            b = temp;
        }
        parent[b] = a;
        if (rank[a] == rank[b]) {
            rank[a]++;
        }
        groups--;
    }
    free(parent);
    free(rank);
    return groups - 1;
}`,
        cpp: `int makeConnected(int n, vector<vector<int>>& connections) {
    if ((int)connections.size() < n - 1) {
        return -1;
    }
    vector<int> parent(n);
    vector<int> rank(n, 0);
    iota(parent.begin(), parent.end(), 0);
    auto find = [&](auto&& self, int x) -> int {
        if (parent[x] != x) {
            parent[x] = self(self, parent[x]);
        }
        return parent[x];
    };
    int groups = n;
    for (const auto& edge : connections) {
        int a = find(find, edge[0]);
        int b = find(find, edge[1]);
        if (a == b) {
            continue;
        }
        if (rank[a] < rank[b]) {
            swap(a, b);
        }
        parent[b] = a;
        if (rank[a] == rank[b]) {
            rank[a]++;
        }
        groups--;
    }
    return groups - 1;
}`,
        java: `int makeConnected(int n, int[][] connections) {
    if (connections.length < n - 1) {
        return -1;
    }
    int[] parent = new int[n];
    int[] rank = new int[n];
    for (int i = 0; i < n; i++) {
        parent[i] = i;
    }
    int groups = n;
    for (int[] edge : connections) {
        int a = find(parent, edge[0]);
        int b = find(parent, edge[1]);
        if (a == b) {
            continue;
        }
        if (rank[a] < rank[b]) {
            int temp = a;
            a = b;
            b = temp;
        }
        parent[b] = a;
        if (rank[a] == rank[b]) {
            rank[a]++;
        }
        groups--;
    }
    return groups - 1;
}

private int find(int[] parent, int x) {
    if (parent[x] != x) {
        parent[x] = find(parent, parent[x]);
    }
    return parent[x];
}`,
        javascript: `function makeConnected(n, connections) {
  if (connections.length < n - 1) {
    return -1;
  }
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  function find(x) {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]);
    }
    return parent[x];
  }
  let groups = n;
  for (const [u, v] of connections) {
    let a = find(u);
    let b = find(v);
    if (a === b) {
      continue;
    }
    if (rank[a] < rank[b]) {
      [a, b] = [b, a];
    }
    parent[b] = a;
    if (rank[a] === rank[b]) {
      rank[a]++;
    }
    groups--;
  }
  return groups - 1;
}`,
      },
    },
  ],
  pitfalls: ['即使圖有很多連線，線總數少於 n−1 時仍不可能連通。', '答案是連通群數減一，並非環的數量；多餘線只用來證明資源足夠。'],
  check: { kind: 'fn', fn: 'makeConnected', cases: [
    { args: [4, E], out: 1 },
    { args: [6, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]]], out: 2 },
    { args: [6, [[0, 1], [0, 2], [0, 3], [1, 2]]], out: -1 },
    { args: [1, []], out: 0 },
  ] },
}
