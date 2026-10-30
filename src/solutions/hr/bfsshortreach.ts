import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const EDGES = [[1, 2], [1, 3], [3, 4], [4, 5]]

function repeatedFig(): FigStep[] {
  const graph = Array.from({ length: 6 }, () => [] as number[])
  for (const [a, b] of EDGES) { graph[a].push(b); graph[b].push(a) }
  const out: FigStep[] = []
  for (let target = 2; target <= 5; target++) {
    const dist = Array(6).fill(-1), queue = [1]
    dist[1] = 0
    for (let head = 0; head < queue.length && dist[target] < 0; head++) {
      const u = queue[head]
      for (const v of graph[u]) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.push(v) }
      out.push({ note: `為目標 ${target} 重跑 BFS：取出 ${u}，此刻距離表 ${dist.slice(1).join('/')}；${dist[target] < 0 ? '尚未抵達' : `找到距離 ${dist[target]}`}。`, views: [arr(queue.slice(head + 1), { label: '待處理佇列' }), arr(dist.slice(1), { label: '城市 1 到 5 距離', highlight: [target - 1] }), kv([['本次目標', target], ['目前節點', u]], '狀態')] })
    }
  }
  return out
}

function onceFig(): FigStep[] {
  const graph = Array.from({ length: 6 }, () => [] as number[])
  for (const [a, b] of EDGES) { graph[a].push(b); graph[b].push(a) }
  const dist = Array(6).fill(-1), queue = [1], out: FigStep[] = []
  dist[1] = 0
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]
    for (const v of graph[u]) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.push(v) }
    out.push({ note: `取出 ${u}，距離 ${dist[u]}；將未訪鄰居設成 ${dist[u] + 6} 並入隊。現在待處理 ${queue.slice(head + 1).join(', ') || '無'}。`, views: [arr(dist.slice(1), { label: '城市 1 到 5 距離', highlight: [u - 1] }), arr(queue.slice(head + 1), { label: '佇列' }), kv([['已處理', head + 1], ['目前距離', dist[u]]], 'BFS 狀態')] })
  }
  return out
}

export const hrBfsshortreach: HrSolution = {
  slug: 'bfsshortreach',
  plain: '從一座城市出發，每走一條路固定花 6 單位；像水波一層層擴散，求到其他城市的最短距離。',
  statement: '輸入 n 個編號 1 到 n 的節點、m 條無向邊與起點 s。每條邊距離都是 6。回傳除 s 外，按節點編號排列的最短距離；到不了的節點填 −1。',
  examples: [
    { input: 'n = 4, m = 2, edges = [[1,2],[1,3]], s = 1', output: '[6, 6, -1]', note: '2 和 3 各走一條邊；4 不可到達。' },
    { input: 'n = 5, m = 4, edges = [[1,2],[1,3],[3,4],[4,5]], s = 1', output: '[6, 6, 12, 18]', note: '節點 5 需沿 1→3→4→5 走三條邊。' },
  ],
  constraints: [
    '所有邊權重同為 6 → 不需 Dijkstra，BFS 的首次到達就是最短路。',
    '圖可能不連通 → 未到達節點須保留 −1。',
    '答案要排除起點並按編號輸出 → 不能直接回傳 BFS 的訪問順序。',
  ],
  insight: [
    '最直覺是對每個目標各跑一次搜尋，但同一批路線會重複走。',
    '所有邊同長，從起點一次 BFS 就能依步數由少到多發現所有可達節點。',
    '首次發現鄰居時記下「目前距離 + 6」，並立即標記，避免重複排隊；這是 [[p:graph-traversal]] 的最短路用法。',
  ],
  approaches: [
    {
      name: '對每個終點重跑 BFS',
      idea: '每次只找一個目標的最短距離。',
      steps: ['建立無向鄰接表。', '對每個非起點節點，新建距離陣列與佇列。', '從 s 開始 BFS，找到該目標或佇列清空為止。', '按節點編號收集距離。'],
      figure: { title: '五節點範例，從 1 出發', steps: repeatedFig() },
      complexity: { time: 'O(n(n+m))', space: 'O(n+m)', why: '最多 n−1 個目標，每次可能走完整張圖；鄰接表與佇列占線性空間。' },
      verdict: '能得到正確答案，但重複搜尋浪費時間；n = 1000、邊很多時一筆查詢可能檢查上億次邊而超時，正式提交用下面的單次 BFS。',
      code: {
        python: `def bfs(n, m, edges, s):
    graph = [[] for _ in range(n + 1)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    answer = []
    for target in range(1, n + 1):
        if target == s:
            continue
        dist = [-1] * (n + 1)
        dist[s] = 0
        queue = [s]
        head = 0
        while head < len(queue) and dist[target] < 0:
            u = queue[head]
            head += 1
            for v in graph[u]:
                if dist[v] == -1:
                    dist[v] = dist[u] + 6  # 第一次抵達是最短距離
                    queue.append(v)
        answer.append(dist[target])
    return answer`,
        c: `int* bfs(int n, int m, int edges_rows, int edges_columns, int** edges, int s, int* result_count) {
    int* head = malloc((n + 1) * sizeof(int));
    int* to = malloc((2 * edges_rows + 1) * sizeof(int));
    int* next = malloc((2 * edges_rows + 1) * sizeof(int));
    int* answer = malloc((n - 1) * sizeof(int));
    int* dist = malloc((n + 1) * sizeof(int));
    int* queue = malloc((n + 1) * sizeof(int));
    for (int i = 1; i <= n; i++) head[i] = -1;
    int edge = 0;
    for (int i = 0; i < edges_rows; i++) {
        int a = edges[i][0], b = edges[i][1];
        to[edge] = b; next[edge] = head[a]; head[a] = edge++;
        to[edge] = a; next[edge] = head[b]; head[b] = edge++;
    }
    *result_count = n - 1;
    int out = 0;
    for (int target = 1; target <= n; target++) {
        if (target == s) continue;
        for (int i = 1; i <= n; i++) dist[i] = -1;
        int front = 0, tail = 0; queue[tail++] = s; dist[s] = 0;
        while (front < tail && dist[target] < 0) {
            int u = queue[front++];
            for (int e = head[u]; e != -1; e = next[e]) {
                int v = to[e];
                if (dist[v] < 0) { dist[v] = dist[u] + 6; queue[tail++] = v; }
            }
        }
        answer[out++] = dist[target];
    }
    free(head); free(to); free(next); free(dist); free(queue);
    return answer;
}`,
        cpp: `vector<int> bfs(int n, int m, vector<vector<int>> edges, int s) {
    vector<vector<int>> graph(n + 1);
    for (auto edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
    vector<int> answer;
    for (int target = 1; target <= n; target++) {
        if (target == s) continue;
        vector<int> dist(n + 1, -1), queue = {s}; dist[s] = 0;
        for (int head = 0; head < (int)queue.size() && dist[target] < 0; head++) {
            int u = queue[head];
            for (int v : graph[u]) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.push_back(v); }
        }
        answer.push_back(dist[target]);
    }
    return answer;
}`,
        java: `public static List<Integer> bfs(int n, int m, List<List<Integer>> edges, int s) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
    for (List<Integer> edge : edges) { graph.get(edge.get(0)).add(edge.get(1)); graph.get(edge.get(1)).add(edge.get(0)); }
    List<Integer> answer = new ArrayList<>();
    for (int target = 1; target <= n; target++) {
        if (target == s) continue;
        int[] dist = new int[n + 1]; Arrays.fill(dist, -1); dist[s] = 0;
        List<Integer> queue = new ArrayList<>(); queue.add(s);
        for (int head = 0; head < queue.size() && dist[target] < 0; head++) {
            int u = queue.get(head);
            for (int v : graph.get(u)) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.add(v); }
        }
        answer.add(dist[target]);
    }
    return answer;
}`,
        javascript: `function bfs(n, m, edges, s) {
    const graph = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
    const answer = [];
    for (let target = 1; target <= n; target++) {
        if (target === s) continue;
        const dist = Array(n + 1).fill(-1), queue = [s]; dist[s] = 0;
        for (let head = 0; head < queue.length && dist[target] < 0; head++) {
            const u = queue[head];
            for (const v of graph[u]) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.push(v); }
        }
        answer.push(dist[target]);
    }
    return answer;
}`,
      },
    },
    {
      name: '單次 BFS',
      idea: '一趟層序搜尋就計算所有可達節點的最短距離。',
      steps: ['建立雙向鄰接表，距離全設 −1。', '設起點距離為 0，放入佇列。', '依序取出節點；每遇到未到過的鄰居，設距離加 6 並入隊。', '按編號輸出距離，跳過起點。'],
      figure: { title: '五節點範例，從 1 出發', steps: onceFig() },
      complexity: { time: 'O(n+m)', space: 'O(n+m)', why: '每節點至多入隊一次，每條無向邊最多查看兩次。' },
      verdict: '符合等權邊最短路的需求，也省去重複搜尋。',
      code: {
        python: `def bfs(n, m, edges, s):
    graph = [[] for _ in range(n + 1)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    dist = [-1] * (n + 1)
    dist[s] = 0
    queue = [s]
    head = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        for v in graph[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 6  # 第一次到達就是最短距離
                queue.append(v)
    return [dist[i] for i in range(1, n + 1) if i != s]`,
        c: `int* bfs(int n, int m, int edges_rows, int edges_columns, int** edges, int s, int* result_count) {
    int* head = malloc((n + 1) * sizeof(int));
    int* to = malloc((2 * edges_rows + 1) * sizeof(int));
    int* next = malloc((2 * edges_rows + 1) * sizeof(int));
    int* dist = malloc((n + 1) * sizeof(int));
    int* queue = malloc((n + 1) * sizeof(int));
    int* answer = malloc((n - 1) * sizeof(int));
    for (int i = 1; i <= n; i++) { head[i] = -1; dist[i] = -1; }
    int edge = 0;
    for (int i = 0; i < edges_rows; i++) {
        int a = edges[i][0], b = edges[i][1];
        to[edge] = b; next[edge] = head[a]; head[a] = edge++;
        to[edge] = a; next[edge] = head[b]; head[b] = edge++;
    }
    int front = 0, tail = 0; queue[tail++] = s; dist[s] = 0;
    while (front < tail) {
        int u = queue[front++];
        for (int e = head[u]; e != -1; e = next[e]) {
            int v = to[e];
            if (dist[v] < 0) { dist[v] = dist[u] + 6; queue[tail++] = v; }
        }
    }
    *result_count = n - 1;
    for (int i = 1, j = 0; i <= n; i++) if (i != s) answer[j++] = dist[i];
    free(head); free(to); free(next); free(dist); free(queue);
    return answer;
}`,
        cpp: `vector<int> bfs(int n, int m, vector<vector<int>> edges, int s) {
    vector<vector<int>> graph(n + 1);
    for (auto edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
    vector<int> dist(n + 1, -1), queue = {s}; dist[s] = 0;
    for (int head = 0; head < (int)queue.size(); head++) {
        int u = queue[head];
        for (int v : graph[u]) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.push_back(v); }
    }
    vector<int> answer;
    for (int i = 1; i <= n; i++) if (i != s) answer.push_back(dist[i]);
    return answer;
}`,
        java: `public static List<Integer> bfs(int n, int m, List<List<Integer>> edges, int s) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
    for (List<Integer> edge : edges) { graph.get(edge.get(0)).add(edge.get(1)); graph.get(edge.get(1)).add(edge.get(0)); }
    int[] dist = new int[n + 1]; Arrays.fill(dist, -1); dist[s] = 0;
    List<Integer> queue = new ArrayList<>(); queue.add(s);
    for (int head = 0; head < queue.size(); head++) {
        int u = queue.get(head);
        for (int v : graph.get(u)) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.add(v); }
    }
    List<Integer> answer = new ArrayList<>();
    for (int i = 1; i <= n; i++) if (i != s) answer.add(dist[i]);
    return answer;
}`,
        javascript: `function bfs(n, m, edges, s) {
    const graph = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
    const dist = Array(n + 1).fill(-1), queue = [s];
    dist[s] = 0;
    for (let head = 0; head < queue.length; head++) {
        const u = queue[head];
        for (const v of graph[u]) if (dist[v] < 0) { dist[v] = dist[u] + 6; queue.push(v); }
    }
    const answer = [];
    for (let i = 1; i <= n; i++) if (i !== s) answer.push(dist[i]);
    return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '輸出不能包含起點自己的距離 0。',
    '邊是無向的，建表時兩端都要加入。',
    '不可到達者保持 −1；不要以 0 表示未訪，否則會與起點混淆。',
  ],
  check: {
    kind: 'fn', fn: 'bfs',
    cases: [
      { args: [4, 2, [[1, 2], [1, 3]], 1], out: [6, 6, -1] },
      { args: [5, 4, EDGES, 1], out: [6, 6, 12, 18] },
      { args: [2, 0, [], 1], out: [-1] },
      { args: [2, 1, [[1, 2]], 2], out: [6] },
      { args: [3, 2, [[1, 2], [2, 3]], 1], out: [6, 12] },
      { args: [4, 3, [[1, 2], [2, 3], [3, 4]], 4], out: [18, 12, 6] },
    ],
  },
}
