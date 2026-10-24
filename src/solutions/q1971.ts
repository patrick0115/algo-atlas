import { arr } from '../engine/helpers'
import type { Solution } from './types'

const E = [[0, 1], [1, 2], [2, 0]]

export const q1971: Solution = {
  id: 1971,
  plain: '城市由雙向道路連起來。問從起點出發，能不能走到終點。',
  statement: '給 n 個編號 0 到 n−1 的節點、雙向邊 edges，以及 source、destination。若存在一條路徑，回傳 true。',
  examples: [{ input: 'n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2', output: 'true' }, { input: 'n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5', output: 'false' }],
  constraints: ['1 ≤ n ≤ 2×10⁵；邊是雙向的。'],
  insight: ['只在同一個連通區域內，起點才能到達終點。', '可以直接走訪 [[p:graph-traversal]]，也能用 [[p:union-find]] 合併道路兩端。'],
  approaches: [
    {
      name: '廣度優先搜尋',
      idea: '從 source 開始，把每個相鄰且未造訪的節點加入佇列。',
      steps: ['建立雙向鄰接表', '將 source 放進佇列並標記', '取出節點，若是 destination 就回傳 true', '將未造訪鄰居入列；佇列清空則回傳 false'],
      figure: { title: '0—1—2—0；從 0 到 2', steps: [
        { note: '三條邊形成一個環；從 0 開始探索。', views: [arr([0], { label: '佇列', highlight: [0] })] },
        { note: '取出 0，找到鄰居 1、2；兩者都先標記，避免環造成重複入列。', views: [arr([1, 2], { label: '佇列', highlight: [0, 1] })] },
        { note: '先取出 1；它通往 0、2，但兩者已經看過，無須再排隊。', views: [arr([2], { label: '佇列', highlight: [0] })] },
        { note: '取出 2，正是目的地，答案為 true。', views: [arr([2], { label: '已抵達', done: [0] })] },
      ] },
      complexity: { time: 'O(n + m)', space: 'O(n + m)', why: '每個節點與每條邊最多處理固定次數。' },
      verdict: '最直觀，還能延伸成最短步數問題。',
      code: {
        python: `from collections import deque

def validPath(n, edges, source, destination):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)  # 雙向道路
    seen = [False] * n
    seen[source] = True
    queue = deque([source])
    while queue:
        node = queue.popleft()
        if node == destination:
            return True
        for next_node in adj[node]:
            if not seen[next_node]:
                seen[next_node] = True  # 入列時就標記
                queue.append(next_node)
    return False`,
        c: `bool validPath(int n, int **edges, int edgesSize, int *edgesColSize, int source, int destination) {
    int *head = malloc(n * sizeof(int));
    int *to = malloc(2 * edgesSize * sizeof(int));
    int *next = malloc(2 * edgesSize * sizeof(int));
    int *queue = malloc(n * sizeof(int));
    bool *seen = calloc(n, sizeof(bool));
    for (int i = 0; i < n; i++) {
        head[i] = -1;
    }
    int count = 0;
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0];
        int b = edges[i][1];
        to[count] = b;
        next[count] = head[a];
        head[a] = count++;
        to[count] = a;
        next[count] = head[b];
        head[b] = count++;
    }
    int front = 0;
    int back = 0;
    queue[back++] = source;
    seen[source] = true;
    bool found = false;
    while (front < back) {
        int node = queue[front++];
        if (node == destination) {
            found = true;
            break;
        }
        for (int edge = head[node]; edge != -1; edge = next[edge]) {
            int neighbor = to[edge];
            if (!seen[neighbor]) {
                seen[neighbor] = true;
                queue[back++] = neighbor;
            }
        }
    }
    free(head);
    free(to);
    free(next);
    free(queue);
    free(seen);
    return found;
}`,
        cpp: `bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {
    vector<vector<int>> adj(n);
    for (const auto& edge : edges) {
        adj[edge[0]].push_back(edge[1]);
        adj[edge[1]].push_back(edge[0]);
    }
    vector<bool> seen(n, false);
    queue<int> pending;
    pending.push(source);
    seen[source] = true;
    while (!pending.empty()) {
        int node = pending.front();
        pending.pop();
        if (node == destination) {
            return true;
        }
        for (int neighbor : adj[node]) {
            if (!seen[neighbor]) {
                seen[neighbor] = true;
                pending.push(neighbor);
            }
        }
    }
    return false;
}`,
        java: `boolean validPath(int n, int[][] edges, int source, int destination) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        adj.add(new ArrayList<>());
    }
    for (int[] edge : edges) {
        adj.get(edge[0]).add(edge[1]);
        adj.get(edge[1]).add(edge[0]);
    }
    boolean[] seen = new boolean[n];
    Queue<Integer> pending = new ArrayDeque<>();
    pending.add(source);
    seen[source] = true;
    while (!pending.isEmpty()) {
        int node = pending.remove();
        if (node == destination) {
            return true;
        }
        for (int neighbor : adj.get(node)) {
            if (!seen[neighbor]) {
                seen[neighbor] = true;
                pending.add(neighbor);
            }
        }
    }
    return false;
}`,
        javascript: `function validPath(n, edges, source, destination) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Array(n).fill(false);
  const queue = [source];
  seen[source] = true;
  for (let front = 0; front < queue.length; front++) {
    const node = queue[front];
    if (node === destination) {
      return true;
    }
    for (const neighbor of adj[node]) {
      if (!seen[neighbor]) {
        seen[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }
  return false;
}`,
      },
    },
    {
      name: '並查集',
      idea: '每條邊都把兩端的集合合併，最後比較起點與終點的代表。',
      steps: ['每個節點起初是自己的代表', '對每條邊 union(a,b)', 'find 時一路追父節點，並壓縮路徑', '比較 find(source) 與 find(destination)'],
      figure: { title: '邊 [[0,1],[1,2],[2,0]]', steps: [
        { note: '一開始 0、1、2 各自成組。', views: [arr([0, 1, 2], { label: '各節點代表' })] },
        { note: '處理 0—1，兩點合成一組。', views: [arr([0, 0, 2], { label: '各節點代表', done: [0, 1] })] },
        { note: '處理 1—2，現在三個點同組；2—0 不再改變分組。', views: [arr([0, 0, 0], { label: '各節點代表', done: [0, 1, 2] })] },
        { note: '0 與 2 的代表相同，因此存在路徑。', views: [arr([0, 0], { label: '起點 / 終點代表', done: [0, 1] })] },
      ] },
      complexity: { time: 'O((n + m) α(n))', space: 'O(n)', why: '路徑壓縮與按大小合併使每次操作接近常數時間。' },
      verdict: '多次查詢連通性時很方便。',
      code: {
        python: `def validPath(n, edges, source, destination):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # 壓縮尋根路徑
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
    return find(source) == find(destination)`,
        c: `static int find1971(int *parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

bool validPath(int n, int **edges, int edgesSize, int *edgesColSize, int source, int destination) {
    int *parent = malloc(n * sizeof(int));
    int *size = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        parent[i] = i;
        size[i] = 1;
    }
    for (int i = 0; i < edgesSize; i++) {
        int a = find1971(parent, edges[i][0]);
        int b = find1971(parent, edges[i][1]);
        if (a != b) {
            if (size[a] < size[b]) {
                int temp = a;
                a = b;
                b = temp;
            }
            parent[b] = a;
            size[a] += size[b];
        }
    }
    bool found = find1971(parent, source) == find1971(parent, destination);
    free(parent);
    free(size);
    return found;
}`,
        cpp: `bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {
    vector<int> parent(n);
    vector<int> size(n, 1);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    for (const auto& edge : edges) {
        int a = find(edge[0]);
        int b = find(edge[1]);
        if (a != b) {
            if (size[a] < size[b]) {
                swap(a, b);
            }
            parent[b] = a;
            size[a] += size[b];
        }
    }
    return find(source) == find(destination);
}`,
        java: `boolean validPath(int n, int[][] edges, int source, int destination) {
    int[] parent = new int[n];
    int[] size = new int[n];
    for (int i = 0; i < n; i++) {
        parent[i] = i;
        size[i] = 1;
    }
    for (int[] edge : edges) {
        int a = find1971(parent, edge[0]);
        int b = find1971(parent, edge[1]);
        if (a != b) {
            if (size[a] < size[b]) {
                int temp = a;
                a = b;
                b = temp;
            }
            parent[b] = a;
            size[a] += size[b];
        }
    }
    return find1971(parent, source) == find1971(parent, destination);
}

int find1971(int[] parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}`,
        javascript: `function validPath(n, edges, source, destination) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  for (const [u, v] of edges) {
    let a = find(u);
    let b = find(v);
    if (a !== b) {
      if (size[a] < size[b]) {
        [a, b] = [b, a];
      }
      parent[b] = a;
      size[a] += size[b];
    }
  }
  return find(source) === find(destination);
}`,
      },
    },
  ],
  pitfalls: ['道路為雙向，鄰接表要同時加入 a→b 和 b→a。', 'source 等於 destination 時，即使沒有邊也應回傳 true。'],
  check: { kind: 'fn', fn: 'validPath', cases: [
    { args: [3, E, 0, 2], out: true },
    { args: [6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], out: false },
    { args: [1, [], 0, 0], out: true },
  ] },
}
