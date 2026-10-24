import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

function bfsFig(): FigStep[] {
  return [
    { note: '星形圖有 0 連到 1、2、3。可從任何點出發，因此一開始把四個「所在點、已訪問集合」都放入佇列。', views: [arr(['0:{0}', '1:{1}', '2:{2}', '3:{3}'], { label: '距離 0 的狀態' })] },
    { note: '從葉子 2 走到中心 0，狀態變成「0:{0,2}」，走了 1 條邊。', views: [arr(['2', '0'], { label: '目前路線', done: [0, 1] })] },
    { note: '再走到葉子 1，集合變成 {0,1,2}，距離 2。', views: [arr(['2', '0', '1'], { label: '目前路線', done: [0, 1, 2] })] },
    { note: '回中心再到 3，集合變成 {0,1,2,3}；首次涵蓋全部節點的距離是 4。', views: [arr(['2', '0', '1', '0', '3'], { label: '最短路線', done: [0, 1, 2, 3, 4] })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: '先算任意兩點最短距離。星形圖的葉子到中心距離 1，任兩片葉子距離 2。', views: [arr([1, 2, 2], { label: '從節點 1 到 0、2、3 的距離' })] },
    { note: '子集合 DP 可從任何單點開始；例如從葉子 2 到中心 0，代價 1。', views: [arr(['{2}:0', '{0,2}:1'], { label: '集合與成本' })] },
    { note: '再加入葉子 1，代價變成 2；路線可視為 2 → 0 → 1。', views: [arr(['{0,1,2}:2'], { label: '集合與成本' })] },
    { note: '最後從葉子 1 到葉子 3 的最短路經中心 0，增加 2；總代價 4。', views: [arr(['2', '0', '1', '0', '3'], { label: '總路線', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q0847: Solution = {
  id: 847,
  plain: '從圖上任意一點出發，走最少的邊，讓每個節點至少踩到一次；允許重訪。',
  statement: '給連通無向圖的鄰接串列 graph。可選任意起點，也可重訪節點或邊；回傳走訪所有節點所需的最少邊數。',
  examples: [
    { input: 'graph = [[1,2,3],[0],[0],[0]]', output: '4' },
    { input: 'graph = [[1],[0,2,4],[1,3,4],[2],[1,2]]', output: '4' },
  ],
  constraints: ['節點數 1 到 12，圖連通且無自環。'],
  insight: ['只記住目前節點不夠；兩條路線到同一點，已訪問的其他點可能不同。', '用位元遮罩表示已訪問集合；狀態是（目前節點、遮罩）。'],
  approaches: [
    {
      name: '多起點位元狀態 BFS',
      idea: '把每個節點都當作起點，對（節點、已訪問集合）做 BFS。',
      steps: ['每個節點各建立一個只含自己的初始遮罩，全部入列。', '取出狀態後沿相鄰邊走，將下一點加入遮罩。', '首次遇到全 1 的遮罩時，BFS 距離就是答案。'],
      figure: { title: 'graph = [[1,2,3],[0],[0],[0]]', steps: bfsFig() },
      complexity: { time: 'O((n + E) 2ⁿ)', space: 'O(n 2ⁿ)', why: '最多 n × 2ⁿ 個狀態，每個狀態探索相鄰邊。' },
      verdict: '最直接的位元狀態 BFS 思路。',
      code: {
        python: `from collections import deque

def shortestPathLength(graph):
    n = len(graph)
    target = (1 << n) - 1
    queue = deque()
    seen = set()
    for node in range(n):
        state = (node, 1 << node)
        queue.append((node, 1 << node, 0))  # 任意點都能起步
        seen.add(state)
    while queue:
        node, mask, distance = queue.popleft()
        if mask == target:
            return distance
        for neighbor in graph[node]:
            next_mask = mask | (1 << neighbor)
            state = (neighbor, next_mask)
            if state not in seen:
                seen.add(state)
                queue.append((neighbor, next_mask, distance + 1))
    return -1`,
        c: `int shortestPathLength(int **graph, int graphSize, int *graphColSize) {
    int n = graphSize, states = n * (1 << n);
    bool *seen = calloc(states, sizeof(bool));
    int *queue = malloc(states * sizeof(int));
    int front = 0, back = 0;
    for (int node = 0; node < n; node++) {
        int state = (1 << node) * n + node;
        seen[state] = true;
        queue[back++] = state;
    }
    int distance = 0, target = (1 << n) - 1;
    while (front < back) {
        int layerEnd = back;
        while (front < layerEnd) {
            int state = queue[front++];
            int node = state % n, mask = state / n;
            if (mask == target) {
                free(seen);
                free(queue);
                return distance;
            }
            for (int i = 0; i < graphColSize[node]; i++) {
                int neighbor = graph[node][i];
                int nextMask = mask | (1 << neighbor);
                int nextState = nextMask * n + neighbor;
                if (!seen[nextState]) {
                    seen[nextState] = true;
                    queue[back++] = nextState;
                }
            }
        }
        distance++;
    }
    free(seen);
    free(queue);
    return -1;
}`,
        cpp: `int shortestPathLength(vector<vector<int>>& graph) {
    int n = graph.size(), target = (1 << n) - 1;
    queue<tuple<int, int, int>> pending;
    vector<vector<bool>> seen(1 << n, vector<bool>(n, false));
    for (int node = 0; node < n; node++) {
        int mask = 1 << node;
        seen[mask][node] = true;
        pending.push({node, mask, 0});
    }
    while (!pending.empty()) {
        auto [node, mask, distance] = pending.front();
        pending.pop();
        if (mask == target) {
            return distance;
        }
        for (int neighbor : graph[node]) {
            int nextMask = mask | (1 << neighbor);
            if (!seen[nextMask][neighbor]) {
                seen[nextMask][neighbor] = true;
                pending.push({neighbor, nextMask, distance + 1});
            }
        }
    }
    return -1;
}`,
        java: `int shortestPathLength(int[][] graph) {
    int n = graph.length, target = (1 << n) - 1;
    boolean[][] seen = new boolean[1 << n][n];
    Queue<int[]> queue = new ArrayDeque<>();
    for (int node = 0; node < n; node++) {
        int mask = 1 << node;
        seen[mask][node] = true;
        queue.offer(new int[]{node, mask, 0});
    }
    while (!queue.isEmpty()) {
        int[] state = queue.poll();
        int node = state[0], mask = state[1], distance = state[2];
        if (mask == target) {
            return distance;
        }
        for (int neighbor : graph[node]) {
            int nextMask = mask | (1 << neighbor);
            if (!seen[nextMask][neighbor]) {
                seen[nextMask][neighbor] = true;
                queue.offer(new int[]{neighbor, nextMask, distance + 1});
            }
        }
    }
    return -1;
}`,
        javascript: `function shortestPathLength(graph) {
  const n = graph.length;
  const target = (1 << n) - 1;
  const seen = Array.from({ length: 1 << n }, () => new Array(n).fill(false));
  const queue = [];
  for (let node = 0; node < n; node++) {
    const mask = 1 << node;
    seen[mask][node] = true;
    queue.push([node, mask, 0]);
  }
  for (let front = 0; front < queue.length; front++) {
    const [node, mask, distance] = queue[front];
    if (mask === target) {
      return distance;
    }
    for (const neighbor of graph[node]) {
      const nextMask = mask | (1 << neighbor);
      if (!seen[nextMask][neighbor]) {
        seen[nextMask][neighbor] = true;
        queue.push([neighbor, nextMask, distance + 1]);
      }
    }
  }
  return -1;
}`,
      },
    },
    {
      name: '全點對距離加子集合 DP',
      idea: '先求任兩點的最短距離，再依序把未訪問節點加入集合。',
      steps: ['用 Floyd–Warshall 求出任意節點間距離。', 'dp[mask][u] 表示已列入 mask 且停在 u 的最低距離；每個單點狀態從 0 開始。', '選一個未列入的 v，利用 dist[u][v] 更新更大的集合。'],
      figure: { title: '星形圖的集合 DP', steps: dpFig() },
      complexity: { time: 'O(n³ + 2ⁿn²)', space: 'O(n² + n2ⁿ)', why: '全點對最短路 O(n³)，每個集合嘗試點對轉移。' },
      verdict: '展示 [[p:bitmask-dp]] 與圖上最短路如何結合。',
      code: {
        python: `def shortestPathLength(graph):
    n = len(graph)
    inf = 10**9
    dist = [[inf] * n for _ in range(n)]
    for u in range(n):
        dist[u][u] = 0
        for v in graph[u]:
            dist[u][v] = 1
    for middle in range(n):
        for u in range(n):
            for v in range(n):
                dist[u][v] = min(dist[u][v], dist[u][middle] + dist[middle][v])
    dp = [[inf] * n for _ in range(1 << n)]
    for node in range(n):
        dp[1 << node][node] = 0       # 任意節點都可當起點
    for mask in range(1 << n):
        for u in range(n):
            if dp[mask][u] == inf:
                continue
            for v in range(n):
                if not mask & (1 << v):
                    next_mask = mask | (1 << v)
                    dp[next_mask][v] = min(dp[next_mask][v], dp[mask][u] + dist[u][v])
    return min(dp[-1])`,
        c: `int shortestPathLength(int **graph, int graphSize, int *graphColSize) {
    int n = graphSize, count = 1 << n, inf = 100000000;
    int *dist = malloc(n * n * sizeof(int));
    int *dp = malloc(count * n * sizeof(int));
    for (int u = 0; u < n; u++) {
        for (int v = 0; v < n; v++) {
            dist[u * n + v] = u == v ? 0 : inf;
        }
        for (int j = 0; j < graphColSize[u]; j++) {
            dist[u * n + graph[u][j]] = 1;
        }
    }
    for (int middle = 0; middle < n; middle++) {
        for (int u = 0; u < n; u++) {
            for (int v = 0; v < n; v++) {
                int candidate = dist[u * n + middle] + dist[middle * n + v];
                if (candidate < dist[u * n + v]) {
                    dist[u * n + v] = candidate;
                }
            }
        }
    }
    for (int i = 0; i < count * n; i++) {
        dp[i] = inf;
    }
    for (int u = 0; u < n; u++) {
        dp[(1 << u) * n + u] = 0;
    }
    for (int mask = 0; mask < count; mask++) {
        for (int u = 0; u < n; u++) {
            if (dp[mask * n + u] == inf) {
                continue;
            }
            for (int v = 0; v < n; v++) {
                if ((mask & (1 << v)) == 0) {
                    int index = (mask | (1 << v)) * n + v;
                    int candidate = dp[mask * n + u] + dist[u * n + v];
                    if (candidate < dp[index]) {
                        dp[index] = candidate;
                    }
                }
            }
        }
    }
    int answer = inf;
    for (int u = 0; u < n; u++) {
        if (dp[(count - 1) * n + u] < answer) {
            answer = dp[(count - 1) * n + u];
        }
    }
    free(dist);
    free(dp);
    return answer;
}`,
        cpp: `int shortestPathLength(vector<vector<int>>& graph) {
    int n = graph.size(), count = 1 << n, inf = 100000000;
    vector<vector<int>> dist(n, vector<int>(n, inf));
    for (int u = 0; u < n; u++) {
        dist[u][u] = 0;
        for (int v : graph[u]) {
            dist[u][v] = 1;
        }
    }
    for (int middle = 0; middle < n; middle++) {
        for (int u = 0; u < n; u++) {
            for (int v = 0; v < n; v++) {
                dist[u][v] = min(dist[u][v], dist[u][middle] + dist[middle][v]);
            }
        }
    }
    vector<vector<int>> dp(count, vector<int>(n, inf));
    for (int u = 0; u < n; u++) {
        dp[1 << u][u] = 0;
    }
    for (int mask = 0; mask < count; mask++) {
        for (int u = 0; u < n; u++) {
            if (dp[mask][u] == inf) {
                continue;
            }
            for (int v = 0; v < n; v++) {
                if ((mask & (1 << v)) == 0) {
                    int nextMask = mask | (1 << v);
                    dp[nextMask][v] = min(dp[nextMask][v], dp[mask][u] + dist[u][v]);
                }
            }
        }
    }
    return *min_element(dp.back().begin(), dp.back().end());
}`,
        java: `int shortestPathLength(int[][] graph) {
    int n = graph.length, count = 1 << n, inf = 100000000;
    int[][] dist = new int[n][n];
    for (int u = 0; u < n; u++) {
        Arrays.fill(dist[u], inf);
        dist[u][u] = 0;
        for (int v : graph[u]) {
            dist[u][v] = 1;
        }
    }
    for (int middle = 0; middle < n; middle++) {
        for (int u = 0; u < n; u++) {
            for (int v = 0; v < n; v++) {
                dist[u][v] = Math.min(dist[u][v], dist[u][middle] + dist[middle][v]);
            }
        }
    }
    int[][] dp = new int[count][n];
    for (int[] row : dp) {
        Arrays.fill(row, inf);
    }
    for (int u = 0; u < n; u++) {
        dp[1 << u][u] = 0;
    }
    for (int mask = 0; mask < count; mask++) {
        for (int u = 0; u < n; u++) {
            if (dp[mask][u] == inf) {
                continue;
            }
            for (int v = 0; v < n; v++) {
                if ((mask & (1 << v)) == 0) {
                    int nextMask = mask | (1 << v);
                    dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + dist[u][v]);
                }
            }
        }
    }
    int answer = inf;
    for (int value : dp[count - 1]) {
        answer = Math.min(answer, value);
    }
    return answer;
}`,
        javascript: `function shortestPathLength(graph) {
  const n = graph.length;
  const count = 1 << n;
  const inf = 100000000;
  const dist = Array.from({ length: n }, () => new Array(n).fill(inf));
  for (let u = 0; u < n; u++) {
    dist[u][u] = 0;
    for (const v of graph[u]) {
      dist[u][v] = 1;
    }
  }
  for (let middle = 0; middle < n; middle++) {
    for (let u = 0; u < n; u++) {
      for (let v = 0; v < n; v++) {
        dist[u][v] = Math.min(dist[u][v], dist[u][middle] + dist[middle][v]);
      }
    }
  }
  const dp = Array.from({ length: count }, () => new Array(n).fill(inf));
  for (let u = 0; u < n; u++) {
    dp[1 << u][u] = 0;
  }
  for (let mask = 0; mask < count; mask++) {
    for (let u = 0; u < n; u++) {
      if (dp[mask][u] === inf) {
        continue;
      }
      for (let v = 0; v < n; v++) {
        if ((mask & (1 << v)) === 0) {
          const nextMask = mask | (1 << v);
          dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + dist[u][v]);
        }
      }
    }
  }
  return Math.min(...dp[count - 1]);
}`,
      },
    },
  ],
  pitfalls: ['同一節點搭配不同的已訪問遮罩，必須視為不同狀態。', '起點可任選，因此 BFS 要一次放入所有單點狀態。'],
  check: {
    kind: 'fn',
    fn: 'shortestPathLength',
    cases: [
      { args: [[[1, 2, 3], [0], [0], [0]]], out: 4 },
      { args: [[[1], [0, 2, 4], [1, 3, 4], [2], [1, 2]]], out: 4 },
      { args: [[[]]], out: 0 },
    ],
  },
}
