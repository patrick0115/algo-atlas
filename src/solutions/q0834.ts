import { arr } from '../engine/helpers'
import { graphView } from './fig'
import type { Solution } from './types'

// 834. Sum of Distances in Tree
const E = [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]

export const q0834: Solution = {
  id: 834,
  plain: '樹上每個節點都要當一次出發點，算它到其他所有節點的邊數總和。',
  statement: '給 n 個節點與 n−1 條邊組成的樹，回傳長度 n 的陣列，answer[i] 為節點 i 到其餘節點的距離總和。',
  examples: [
    { input: 'n = 6, edges = [[0,1],[0,2],[2,3],[2,4],[2,5]]', output: '[8,12,6,10,10,10]' },
    { input: 'n = 1, edges = []', output: '[0]' },
    { input: 'n = 2, edges = [[1,0]]', output: '[1,1]' },
  ],
  constraints: ['1 ≤ n ≤ 3×10⁴；節點編號 0 到 n−1，輸入保證是一棵樹。'],
  insight: ['每個節點各自 BFS 當然可以得到答案，但要重複走 n 次樹。', '先求 0 的答案及各子樹大小；根從父節點移向孩子時，孩子子樹內的距離各減 1，其餘節點的距離各加 1。'],
  approaches: [
    {
      name: '每個節點各做一次 BFS',
      idea: '逐一從每個節點出發，用 BFS 記錄到所有節點的距離並加總。',
      steps: ['建雙向鄰接表。', '對每個起點建立佇列與距離表。', '沿樹邊擴展，未走過的節點距離為目前距離加一。', '加總這個起點的距離。'],
      figure: { title: 'n = 6，edges = [[0,1],[0,2],[2,3],[2,4],[2,5]]', steps: [
        { note: '從 0 出發，0 的距離是 0。', views: [graphView(6, E, { cls: { 0: 'hl' } })] },
        { note: '第一層到 1、2，各距離 1。', views: [graphView(6, E, { cls: { 0: 'done', 1: 'hl', 2: 'hl' }, subs: { 0: 0, 1: 1, 2: 1 } })] },
        { note: '從 2 走到 3、4、5，各距離 2；0 的距離總和是 0+1+1+2+2+2 = 8。', views: [graphView(6, E, { subs: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 2 }, cls: { 3: 'hl', 4: 'hl', 5: 'hl' } })] },
        { note: '換 1 當起點再走一次，距離變成 [1,0,2,3,3,3]，總和 12。', views: [arr([1, 0, 2, 3, 3, 3], { label: '從 1 出發的距離', done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個起點走遍 n 個節點；鄰接表和佇列需 O(n)。' },
      verdict: '適合小樹核對答案；n 很大時需要重用前一個根的結果。',
      code: {
        python: `from collections import deque

def sumOfDistancesInTree(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    answer = []
    for start in range(n):
        dist = [-1] * n
        dist[start] = 0
        queue = deque([start])
        while queue:
            node = queue.popleft()
            for nxt in graph[node]:
                if dist[nxt] == -1:
                    dist[nxt] = dist[node] + 1  # 沿一條邊多走一步
                    queue.append(nxt)
        answer.append(sum(dist))
    return answer`,
        c: `int *sumOfDistancesInTree(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    int *head = malloc(n * sizeof(int));
    int *to = malloc(2 * edgesSize * sizeof(int));
    int *next = malloc(2 * edgesSize * sizeof(int));
    int *answer = calloc(n, sizeof(int));
    int *dist = malloc(n * sizeof(int));
    int *queue = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        head[i] = -1;
    }
    int edge = 0;
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0];
        int b = edges[i][1];
        to[edge] = b;
        next[edge] = head[a];
        head[a] = edge++;
        to[edge] = a;
        next[edge] = head[b];
        head[b] = edge++;
    }
    for (int start = 0; start < n; start++) {
        for (int i = 0; i < n; i++) {
            dist[i] = -1;
        }
        int qh = 0;
        int tail = 0;
        queue[tail++] = start;
        dist[start] = 0;
        while (qh < tail) {
            int node = queue[qh++];
            for (int e = head[node]; e != -1; e = next[e]) {
                int v = to[e];
                if (dist[v] == -1) {
                    dist[v] = dist[node] + 1;
                    queue[tail++] = v;
                }
            }
        }
        for (int i = 0; i < n; i++) {
            answer[start] += dist[i];
        }
    }
    free(head);
    free(to);
    free(next);
    free(dist);
    free(queue);
    *returnSize = n;
    return answer;
}`,
        cpp: `vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
    vector<vector<int>> graph(n);
    for (const auto& edge : edges) {
        graph[edge[0]].push_back(edge[1]);
        graph[edge[1]].push_back(edge[0]);
    }
    vector<int> answer(n, 0);
    for (int start = 0; start < n; start++) {
        vector<int> dist(n, -1);
        queue<int> todo;
        dist[start] = 0;
        todo.push(start);
        while (!todo.empty()) {
            int node = todo.front();
            todo.pop();
            for (int v : graph[node]) {
                if (dist[v] == -1) {
                    dist[v] = dist[node] + 1;
                    todo.push(v);
                }
            }
        }
        answer[start] = accumulate(dist.begin(), dist.end(), 0);
    }
    return answer;
}`,
        java: `int[] sumOfDistancesInTree(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
    }
    int[] answer = new int[n];
    for (int start = 0; start < n; start++) {
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        Deque<Integer> queue = new ArrayDeque<>();
        queue.add(start);
        dist[start] = 0;
        while (!queue.isEmpty()) {
            int node = queue.remove();
            for (int v : graph.get(node)) {
                if (dist[v] == -1) {
                    dist[v] = dist[node] + 1;
                    queue.add(v);
                }
            }
        }
        for (int d : dist) {
            answer[start] += d;
        }
    }
    return answer;
}`,
        javascript: `function sumOfDistancesInTree(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const answer = new Array(n).fill(0);
  for (let start = 0; start < n; start++) {
    const dist = new Array(n).fill(-1);
    const queue = [start];
    dist[start] = 0;
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head];
      for (const v of graph[node]) {
        if (dist[v] === -1) {
          dist[v] = dist[node] + 1;
          queue.push(v);
        }
      }
    }
    answer[start] = dist.reduce((sum, d) => sum + d, 0);
  }
  return answer;
}`,
      },
    },
    {
      name: '兩次走訪與換根公式',
      idea: '第一次算 0 的答案和每棵子樹大小；第二次由父推子：ans[child] = ans[parent] + n − 2×size[child]。',
      steps: ['從 0 走訪，記下父節點、深度與走訪順序，深度相加得 ans[0]。', '逆序處理節點，把每個孩子的 size 加到父節點。', '按原走訪順序，將父節點的答案推給孩子。', '輸出全部答案。'],
      figure: { title: 'n = 6，edges = [[0,1],[0,2],[2,3],[2,4],[2,5]]', steps: [
        { note: '以 0 為根，深度是 [0,1,1,2,2,2]，所以 ans[0] = 8。', views: [graphView(6, E, { subs: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 2 } })] },
        { note: '逆序累加子樹大小：1、3、4、5 各為 1；2 的子樹共有 4 個節點。', views: [graphView(6, E, { subs: { 0: 6, 1: 1, 2: 4, 3: 1, 4: 1, 5: 1 }, cls: { 2: 'hl' } })] },
        { note: '根移到 1，只有 1 個節點變近、其餘 5 個變遠：ans[1] = 8 + 6 − 2×1 = 12。', views: [graphView(6, E, { cls: { 0: 'done', 1: 'hl' }, subs: { 0: 8, 1: 12 } })] },
        { note: '根移到 2，有 4 個節點變近、2 個變遠：ans[2] = 8 + 6 − 2×4 = 6。', views: [graphView(6, E, { cls: { 0: 'done', 2: 'hl' }, subs: { 0: 8, 2: 6 } })] },
        { note: '再把 2 的結果推給 3、4、5，各得 10；答案 [8,12,6,10,10,10]。', views: [arr([8, 12, 6, 10, 10, 10], { label: '每個起點的距離總和', done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '建圖、後序與換根各走過樹一次。' },
      verdict: '標準解。換根時只需數出「變近」與「變遠」兩側的節點數。',
      code: {
        python: `def sumOfDistancesInTree(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    parent = [-1] * n
    depth = [0] * n
    order = [0]
    for node in order:
        for nxt in graph[node]:
            if nxt == parent[node]:
                continue
            parent[nxt] = node
            depth[nxt] = depth[node] + 1
            order.append(nxt)
    size = [1] * n
    for node in reversed(order[1:]):
        size[parent[node]] += size[node]  # 子樹節點數往上合併
    answer = [0] * n
    answer[0] = sum(depth)
    for node in order[1:]:
        answer[node] = answer[parent[node]] + n - 2 * size[node]  # 換根
    return answer`,
        c: `int *sumOfDistancesInTree(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    int *head = malloc(n * sizeof(int));
    int *to = malloc(2 * edgesSize * sizeof(int));
    int *next = malloc(2 * edgesSize * sizeof(int));
    int *parent = malloc(n * sizeof(int));
    int *depth = calloc(n, sizeof(int));
    int *order = malloc(n * sizeof(int));
    int *size = malloc(n * sizeof(int));
    int *answer = calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) {
        head[i] = -1;
        size[i] = 1;
    }
    int edge = 0;
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0];
        int b = edges[i][1];
        to[edge] = b;
        next[edge] = head[a];
        head[a] = edge++;
        to[edge] = a;
        next[edge] = head[b];
        head[b] = edge++;
    }
    parent[0] = -1;
    order[0] = 0;
    int length = 1;
    for (int i = 0; i < length; i++) {
        int node = order[i];
        answer[0] += depth[node];
        for (int e = head[node]; e != -1; e = next[e]) {
            int v = to[e];
            if (v == parent[node]) {
                continue;
            }
            parent[v] = node;
            depth[v] = depth[node] + 1;
            order[length++] = v;
        }
    }
    for (int i = n - 1; i > 0; i--) {
        int node = order[i];
        size[parent[node]] += size[node];
    }
    for (int i = 1; i < n; i++) {
        int node = order[i];
        answer[node] = answer[parent[node]] + n - 2 * size[node];
    }
    free(head);
    free(to);
    free(next);
    free(parent);
    free(depth);
    free(order);
    free(size);
    *returnSize = n;
    return answer;
}`,
        cpp: `vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
    vector<vector<int>> graph(n);
    for (const auto& edge : edges) {
        graph[edge[0]].push_back(edge[1]);
        graph[edge[1]].push_back(edge[0]);
    }
    vector<int> parent(n, -1);
    vector<int> depth(n, 0);
    vector<int> order{0};
    for (int i = 0; i < (int)order.size(); i++) {
        int node = order[i];
        for (int v : graph[node]) {
            if (v == parent[node]) {
                continue;
            }
            parent[v] = node;
            depth[v] = depth[node] + 1;
            order.push_back(v);
        }
    }
    vector<int> size(n, 1);
    for (int i = n - 1; i > 0; i--) {
        size[parent[order[i]]] += size[order[i]];
    }
    vector<int> answer(n, 0);
    answer[0] = accumulate(depth.begin(), depth.end(), 0);
    for (int i = 1; i < n; i++) {
        int node = order[i];
        answer[node] = answer[parent[node]] + n - 2 * size[node];
    }
    return answer;
}`,
        java: `int[] sumOfDistancesInTree(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
    }
    int[] parent = new int[n];
    int[] depth = new int[n];
    int[] order = new int[n];
    int length = 1;
    order[0] = 0;
    parent[0] = -1;
    for (int i = 0; i < length; i++) {
        int node = order[i];
        for (int v : graph.get(node)) {
            if (v == parent[node]) {
                continue;
            }
            parent[v] = node;
            depth[v] = depth[node] + 1;
            order[length++] = v;
        }
    }
    int[] size = new int[n];
    Arrays.fill(size, 1);
    for (int i = n - 1; i > 0; i--) {
        size[parent[order[i]]] += size[order[i]];
    }
    int[] answer = new int[n];
    for (int d : depth) {
        answer[0] += d;
    }
    for (int i = 1; i < n; i++) {
        int node = order[i];
        answer[node] = answer[parent[node]] + n - 2 * size[node];
    }
    return answer;
}`,
        javascript: `function sumOfDistancesInTree(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const parent = new Array(n).fill(-1);
  const depth = new Array(n).fill(0);
  const order = [0];
  for (let i = 0; i < order.length; i++) {
    const node = order[i];
    for (const v of graph[node]) {
      if (v === parent[node]) {
        continue;
      }
      parent[v] = node;
      depth[v] = depth[node] + 1;
      order.push(v);
    }
  }
  const size = new Array(n).fill(1);
  for (let i = n - 1; i > 0; i--) {
    size[parent[order[i]]] += size[order[i]];
  }
  const answer = new Array(n).fill(0);
  answer[0] = depth.reduce((sum, d) => sum + d, 0);
  for (let i = 1; i < n; i++) {
    const node = order[i];
    answer[node] = answer[parent[node]] + n - 2 * size[node];
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['換根公式中的 size 是孩子子樹節點數，不是孩子數。', '第一次走訪要記父節點，避免在無向邊上走回去。', 'n 可到 3×10⁴，遞迴 DFS 在部分語言可能超過呼叫堆疊，因此此處採用迭代順序。'],
  check: { kind: 'fn', fn: 'sumOfDistancesInTree', cases: [
    { args: [6, E], out: [8, 12, 6, 10, 10, 10] },
    { args: [1, []], out: [0] },
    { args: [2, [[1, 0]]], out: [1, 1] },
  ] },
}
