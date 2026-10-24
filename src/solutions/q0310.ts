import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

const E = [[1, 0], [1, 2], [1, 3]]

function allRootsFig(): FigStep[] {
  return [
    { note: '把每個節點輪流當根。以中心 1 為根，距離最遠的 0、2、3 都只有 1 條邊。', views: [kv([[1, '距離最遠 1'], [0, '距離最遠 2'], [2, '距離最遠 2'], [3, '距離最遠 2']], '各根高度', [1])] },
    { note: '以 0 為根，要經 0→1→2（或 3），高度是 2。', views: [arr([0, 1, 2], { label: '從 0 到 2 的路徑', done: [0, 1, 2] })] },
    { note: '以 2、3 為根時，最遠端同樣要走 2 條邊。', views: [kv([[0, 2], [1, 1], [2, 2], [3, 2]], '各根高度')] },
    { note: '最小高度是 1，只有節點 1 達成，回傳 [1]。', views: [arr([1], { label: '最小高度樹的根', done: [0] })] },
  ]
}

function peelFig(): FigStep[] {
  return [
    { note: '無向樹的葉子是度數 1 的節點；一開始 0、2、3 都是葉子，中心 1 的度數為 3。', views: [kv([[0, 1], [1, 3], [2, 1], [3, 1]], '節點 → 度數')] },
    { note: '同一輪同時移除葉子 0、2、3；它們都只連著 1。', views: [arr([0, 2, 3], { label: '本輪葉子', dim: [0, 1, 2] })] },
    { note: '剩餘節點數變成 1，停止。從兩端向內修剪，留下的就是樹的中心。', views: [kv([[1, '留下']], '剩餘節點', [1])] },
    { note: '答案 [1]。若最後剩兩個相鄰節點，兩者都是答案。', views: [arr([1], { label: '根', done: [0] })] },
  ]
}

export const q0310: Solution = {
  id: 310,
  plain: '同一棵無向樹換不同根，高度會變；找讓樹高度最低的所有根。',
  statement: '給 n 個節點（編號 0..n−1）的無向樹與 edges，回傳所有使樹高度最小的根節點，順序不限。',
  examples: [{ input: 'n = 4, edges = [[1,0],[1,2],[1,3]]', output: '[1]' }, { input: 'n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]', output: '[3,4]' }],
  constraints: ['`1 ≤ n ≤ 2 × 10⁴`', 'edges 恰有 n−1 條，並保證連通且無環。'],
  insight: ['固定一個根時，樹高度就是到最遠節點的距離。逐根 BFS 可以求出，但重複遍歷很多次。', '最優根一定在樹的中心。反覆同時移掉所有葉子，直到只剩 1 或 2 個節點，就是 [[p:topological-sort]] 式的由外向內剝層。'],
  approaches: [
    {
      name: '每個根都做 BFS',
      idea: '以每個節點為根做一次廣度優先搜尋，量到最遠節點的距離，選最小高度。',
      steps: ['建立無向鄰接表。', '對每個 root 做 BFS，記最遠距離。', '挑出高度等於最小值的所有根。'],
      figure: { title: 'n = 4, edges = [[1,0],[1,2],[1,3]]', steps: allRootsFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個根都遍歷整棵 n 節點的樹。' },
      verdict: '定義直接，但 n=20000 時會太慢。',
      code: {
        python: `from collections import deque

def findMinHeightTrees(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    heights = []
    for root in range(n):
        distance = [-1] * n
        distance[root] = 0
        queue = deque([root])
        while queue:
            node = queue.popleft()
            for near in graph[node]:
                if distance[near] == -1:
                    distance[near] = distance[node] + 1
                    queue.append(near)
        heights.append(max(distance))  # 最遠距離就是樹高
    best = min(heights)
    return [i for i in range(n) if heights[i] == best]`,
        c: `int *findMinHeightTrees(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    int *head = malloc(n * sizeof(int));
    int *to = malloc(2 * edgesSize * sizeof(int));
    int *next = malloc(2 * edgesSize * sizeof(int));
    for (int i = 0; i < n; i++) {
        head[i] = -1;
    }
    int used = 0;
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0];
        int b = edges[i][1];
        to[used] = b;
        next[used] = head[a];
        head[a] = used++;
        to[used] = a;
        next[used] = head[b];
        head[b] = used++;
    }
    int *queue = malloc(n * sizeof(int));
    int *distance = malloc(n * sizeof(int));
    int *answer = malloc(n * sizeof(int));
    int best = INT_MAX;
    *returnSize = 0;
    for (int root = 0; root < n; root++) {
        for (int i = 0; i < n; i++) {
            distance[i] = -1;
        }
        int front = 0;
        int back = 0;
        int height = 0;
        queue[back++] = root;
        distance[root] = 0;
        while (front < back) {
            int node = queue[front++];
            if (distance[node] > height) {
                height = distance[node];
            }
            for (int e = head[node]; e != -1; e = next[e]) {
                int near = to[e];
                if (distance[near] == -1) {
                    distance[near] = distance[node] + 1;
                    queue[back++] = near;
                }
            }
        }
        if (height < best) {
            best = height;
            *returnSize = 0;
        }
        if (height == best) {
            answer[(*returnSize)++] = root;
        }
    }
    free(head);
    free(to);
    free(next);
    free(queue);
    free(distance);
    return answer;
}`,
        cpp: `vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
    vector<vector<int>> graph(n);
    for (const auto& edge : edges) {
        graph[edge[0]].push_back(edge[1]);
        graph[edge[1]].push_back(edge[0]);
    }
    vector<int> answer;
    int best = INT_MAX;
    for (int root = 0; root < n; root++) {
        vector<int> distance(n, -1);
        queue<int> todo;
        todo.push(root);
        distance[root] = 0;
        int height = 0;
        while (!todo.empty()) {
            int node = todo.front();
            todo.pop();
            height = max(height, distance[node]);
            for (int near : graph[node]) {
                if (distance[near] == -1) {
                    distance[near] = distance[node] + 1;
                    todo.push(near);
                }
            }
        }
        if (height < best) {
            best = height;
            answer.clear();
        }
        if (height == best) {
            answer.push_back(root);
        }
    }
    return answer;
}`,
        java: `List<Integer> findMinHeightTrees(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
    }
    List<Integer> answer = new ArrayList<>();
    int best = Integer.MAX_VALUE;
    for (int root = 0; root < n; root++) {
        int[] distance = new int[n];
        Arrays.fill(distance, -1);
        ArrayDeque<Integer> queue = new ArrayDeque<>();
        queue.add(root);
        distance[root] = 0;
        int height = 0;
        while (!queue.isEmpty()) {
            int node = queue.remove();
            height = Math.max(height, distance[node]);
            for (int near : graph.get(node)) {
                if (distance[near] == -1) {
                    distance[near] = distance[node] + 1;
                    queue.add(near);
                }
            }
        }
        if (height < best) {
            best = height;
            answer.clear();
        }
        if (height == best) {
            answer.add(root);
        }
    }
    return answer;
}`,
        javascript: `function findMinHeightTrees(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const answer = [];
  let best = Infinity;
  for (let root = 0; root < n; root++) {
    const distance = new Array(n).fill(-1);
    const queue = [root];
    distance[root] = 0;
    let height = 0;
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head];
      height = Math.max(height, distance[node]);
      for (const near of graph[node]) {
        if (distance[near] === -1) {
          distance[near] = distance[node] + 1;
          queue.push(near);
        }
      }
    }
    if (height < best) {
      best = height;
      answer.length = 0;
    }
    if (height === best) {
      answer.push(root);
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '反覆剝去葉子',
      idea: '把所有度數為 1 的節點同時移除；最後剩下的一或兩個中心就是答案。',
      steps: ['建立無向鄰接表與度數。', '把所有葉子排入佇列。', '每輪刪去目前整層葉子，降低其鄰居度數，新葉子加入下一輪。', '剩餘節點不多於 2 時停止並回傳。'],
      figure: { title: 'n = 4, edges = [[1,0],[1,2],[1,3]]', steps: peelFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點與每條邊只處理固定次數。' },
      verdict: '由邊緣向中心收縮，線性時間求出所有最小高度根。',
      code: {
        python: `from collections import deque

def findMinHeightTrees(n, edges):
    if n == 1:
        return [0]
    graph = [[] for _ in range(n)]
    degree = [0] * n
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
        degree[a] += 1
        degree[b] += 1
    queue = deque(i for i in range(n) if degree[i] == 1)
    remaining = n
    while remaining > 2:
        size = len(queue)
        remaining -= size  # 同時移掉這一層葉子
        for _ in range(size):
            leaf = queue.popleft()
            for near in graph[leaf]:
                degree[near] -= 1
                if degree[near] == 1:
                    queue.append(near)
    return sorted(queue)`,
        c: `int compare310(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int *findMinHeightTrees(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    int *answer = malloc(n * sizeof(int));
    if (n == 1) {
        answer[0] = 0;
        *returnSize = 1;
        return answer;
    }
    int *head = malloc(n * sizeof(int));
    int *degree = calloc(n, sizeof(int));
    int *to = malloc(2 * edgesSize * sizeof(int));
    int *next = malloc(2 * edgesSize * sizeof(int));
    int *queue = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        head[i] = -1;
    }
    int used = 0;
    for (int i = 0; i < edgesSize; i++) {
        int a = edges[i][0];
        int b = edges[i][1];
        degree[a]++;
        degree[b]++;
        to[used] = b;
        next[used] = head[a];
        head[a] = used++;
        to[used] = a;
        next[used] = head[b];
        head[b] = used++;
    }
    int front = 0;
    int back = 0;
    for (int i = 0; i < n; i++) {
        if (degree[i] == 1) {
            queue[back++] = i;
        }
    }
    int remaining = n;
    while (remaining > 2) {
        int size = back - front;
        remaining -= size;
        while (size--) {
            int leaf = queue[front++];
            for (int e = head[leaf]; e != -1; e = next[e]) {
                int near = to[e];
                if (--degree[near] == 1) {
                    queue[back++] = near;
                }
            }
        }
    }
    *returnSize = back - front;
    for (int i = 0; i < *returnSize; i++) {
        answer[i] = queue[front + i];
    }
    qsort(answer, *returnSize, sizeof(int), compare310);
    free(head);
    free(degree);
    free(to);
    free(next);
    free(queue);
    return answer;
}`,
        cpp: `vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
    if (n == 1) {
        return {0};
    }
    vector<vector<int>> graph(n);
    vector<int> degree(n, 0);
    for (const auto& edge : edges) {
        graph[edge[0]].push_back(edge[1]);
        graph[edge[1]].push_back(edge[0]);
        degree[edge[0]]++;
        degree[edge[1]]++;
    }
    queue<int> leaves;
    for (int i = 0; i < n; i++) {
        if (degree[i] == 1) {
            leaves.push(i);
        }
    }
    int remaining = n;
    while (remaining > 2) {
        int size = leaves.size();
        remaining -= size;
        while (size--) {
            int leaf = leaves.front();
            leaves.pop();
            for (int near : graph[leaf]) {
                if (--degree[near] == 1) {
                    leaves.push(near);
                }
            }
        }
    }
    vector<int> answer;
    while (!leaves.empty()) {
        answer.push_back(leaves.front());
        leaves.pop();
    }
    sort(answer.begin(), answer.end());
    return answer;
}`,
        java: `List<Integer> findMinHeightTrees(int n, int[][] edges) {
    if (n == 1) {
        return Arrays.asList(0);
    }
    List<List<Integer>> graph = new ArrayList<>();
    int[] degree = new int[n];
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
        degree[edge[0]]++;
        degree[edge[1]]++;
    }
    ArrayDeque<Integer> leaves = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        if (degree[i] == 1) {
            leaves.add(i);
        }
    }
    int remaining = n;
    while (remaining > 2) {
        int size = leaves.size();
        remaining -= size;
        while (size-- > 0) {
            int leaf = leaves.remove();
            for (int near : graph.get(leaf)) {
                if (--degree[near] == 1) {
                    leaves.add(near);
                }
            }
        }
    }
    List<Integer> answer = new ArrayList<>(leaves);
    Collections.sort(answer);
    return answer;
}`,
        javascript: `function findMinHeightTrees(n, edges) {
  if (n === 1) {
    return [0];
  }
  const graph = Array.from({ length: n }, () => []);
  const degree = new Array(n).fill(0);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
    degree[a]++;
    degree[b]++;
  }
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (degree[i] === 1) {
      queue.push(i);
    }
  }
  let front = 0;
  let remaining = n;
  while (remaining > 2) {
    const size = queue.length - front;
    remaining -= size;
    for (let i = 0; i < size; i++) {
      const leaf = queue[front++];
      for (const near of graph[leaf]) {
        if (--degree[near] === 1) {
          queue.push(near);
        }
      }
    }
  }
  return queue.slice(front).sort((a, b) => a - b);
}`,
      },
    },
  ],
  pitfalls: ['n=1 時沒有邊，也沒有度數為 1 的節點；答案直接是 [0]。', '每輪必須同時移除整層葉子，不可剝到剩兩個之前就改算下一輪。'],
  check: { kind: 'fn', fn: 'findMinHeightTrees', cases: [{ args: [4, E], out: [1] }, { args: [6, [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]]], out: [3, 4] }, { args: [1, []], out: [0] }, { args: [2, [[0, 1]]], out: [0, 1] }] },
}
