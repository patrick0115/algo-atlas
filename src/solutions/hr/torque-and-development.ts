import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const ROADS = [[1, 2], [3, 1], [2, 3], [4, 5]]

function componentFig(): FigStep[] {
  const graph = Array.from({ length: 7 }, () => [] as number[])
  for (const [a, b] of ROADS) { graph[a].push(b); graph[b].push(a) }
  const seen = Array(7).fill(false), out: FigStep[] = []
  let cost = 0
  for (let start = 1; start <= 6; start++) {
    if (seen[start]) continue
    const stack = [start]
    seen[start] = true
    let size = 0
    while (stack.length) {
      const u = stack.pop()!
      size++
      for (const v of graph[u]) if (!seen[v]) { seen[v] = true; stack.push(v) }
      out.push({ note: `巡到城市 ${u}；此群已找到 ${size} 城，待巡 ${stack.join(', ') || '無'}。`, views: [arr([1, 2, 3, 4, 5, 6], { label: '城市', highlight: [u - 1], done: seen.flatMap((x, i) => x && i > 0 ? [i - 1] : []) }), arr(stack, { label: 'DFS 堆疊' }), kv([['已完成成本', cost], ['目前群大小', size]], '狀態')] })
    }
    cost += 3 + (size - 1) * 2
    out.push({ note: `這群 ${size} 城：一座圖書館 3，加 ${size - 1} 條道路各 2；總成本累計 ${cost}。`, views: [kv([['群大小', size], ['累計成本', cost]], '結算')] })
  }
  return out
}

function unionFig(): FigStep[] {
  const parent = [0, 1, 2, 3, 4, 5, 6], size = [0, 1, 1, 1, 1, 1, 1], out: FigStep[] = []
  const root = (x: number): number => { while (parent[x] !== x) x = parent[x]; return x }
  for (const [a, b] of ROADS) {
    const x = root(a), y = root(b)
    if (x !== y) { parent[y] = x; size[x] += size[y] }
    out.push({ note: `處理可修道路 ${a}–${b}；${x === y ? '已在同一群，不再合併' : `合併後群大小 ${size[x]}`}。`, views: [arr(parent.slice(1), { label: '每城的代表', highlight: [a - 1, b - 1] }), arr(size.slice(1), { label: '代表群大小' })] })
  }
  let answer = 0
  for (let i = 1; i <= 6; i++) if (root(i) === i) {
    answer += 3 + (size[i] - 1) * 2
    out.push({ note: `代表 ${i} 管 ${size[i]} 城，付 3 + ${size[i] - 1}×2；目前共 ${answer}。`, views: [kv([['代表', i], ['群大小', size[i]], ['累計費用', answer]], '結算')] })
  }
  return out
}

export const hrTorqueAndDevelopment: HrSolution = {
  slug: 'torque-and-development',
  plain: '幾座城市可以修路互通；每個互通圈至少要有一間圖書館，決定建館與修路的最省錢方式。',
  statement: '有 n 座城市，建一間圖書館花 c_lib，修復一條給定城市對之間的道路花 c_road。每座城市都必須能沿修好的路走到某間圖書館。回傳最低總花費；沒有列出的道路不能新建。',
  examples: [
    { input: 'n = 6, c_lib = 3, c_road = 2, cities = [[1,2],[3,1],[2,3],[4,5]]', output: '15', note: '三個可連通群大小為 3、2、1，花費分別 7、5、3。' },
    { input: 'n = 3, c_lib = 2, c_road = 5, cities = [[1,2],[2,3]]', output: '6', note: '道路比建館貴，三城各建一館。' },
  ],
  constraints: [
    '城市與道路數都可能很大 → 不宜列舉每種修路方案。',
    '只能使用給定的城市對 → 不同連通分量無法互相服務。',
    '費用乘城市數可能超過 32 位 → 累計與回傳用 64 位整數。',
  ],
  insight: [
    '每城各建一館總是可行，成本為 n×c_lib；若道路不便宜，這就是答案。',
    '當修路較便宜，對一個大小 s 的連通群，建 1 館並修 s−1 條道路就能涵蓋全群。多修一條成環的路沒有好處。',
    '因此只需找每群大小，再加 `c_lib + (s−1)c_road`。可用 [[p:graph-traversal]] 或 [[p:union-find]] 找群。',
  ],
  approaches: [
    {
      name: '鄰接表與 DFS',
      idea: '走訪每個可連通城市群，依群大小計算一館加生成樹道路的費用。',
      steps: ['若建館費用不高於修路，直接每城建館。', '否則把給定道路建成無向鄰接表。', '從每個未訪城市啟動 DFS，統計該群大小。', '每群加上一館及大小減一條道路的費用。'],
      figure: { title: '六城、建館 3、修路 2', steps: componentFig() },
      complexity: { time: 'O(n+m)', space: 'O(n+m)', why: '每座城市與道路都只巡視常數次，鄰接表保存道路。' },
      verdict: '走訪過程容易理解，且能直接看出每個連通群。',
      code: {
        python: `def roadsAndLibraries(n, c_lib, c_road, cities):
    if c_lib <= c_road:
        return n * c_lib
    graph = [[] for _ in range(n + 1)]
    for a, b in cities:
        graph[a].append(b)
        graph[b].append(a)
    seen = [False] * (n + 1)
    answer = 0
    for start in range(1, n + 1):
        if seen[start]:
            continue
        seen[start] = True
        stack = [start]
        size = 0
        while stack:
            u = stack.pop()
            size += 1
            for v in graph[u]:
                if not seen[v]:
                    seen[v] = True
                    stack.append(v)
        answer += c_lib + (size - 1) * c_road  # 一館及生成樹道路
    return answer`,
        c: `long long roadsAndLibraries(int n, int c_lib, int c_road, int cities_rows, int cities_columns, int** cities) {
    if (c_lib <= c_road) return (long long)n * c_lib;
    int* head = malloc((n + 1) * sizeof(int));
    int* to = malloc((2 * cities_rows + 1) * sizeof(int));
    int* next = malloc((2 * cities_rows + 1) * sizeof(int));
    char* seen = calloc(n + 1, 1);
    int* stack = malloc((n + 1) * sizeof(int));
    for (int i = 1; i <= n; i++) head[i] = -1;
    int edge = 0;
    for (int i = 0; i < cities_rows; i++) {
        int a = cities[i][0], b = cities[i][1];
        to[edge] = b; next[edge] = head[a]; head[a] = edge++;
        to[edge] = a; next[edge] = head[b]; head[b] = edge++;
    }
    long long answer = 0;
    for (int start = 1; start <= n; start++) {
        if (seen[start]) continue;
        int top = 0, size = 0;
        stack[top++] = start; seen[start] = 1;
        while (top) {
            int u = stack[--top]; size++;
            for (int e = head[u]; e != -1; e = next[e]) {
                int v = to[e];
                if (!seen[v]) { seen[v] = 1; stack[top++] = v; }
            }
        }
        answer += c_lib + (long long)(size - 1) * c_road;
    }
    free(head); free(to); free(next); free(seen); free(stack);
    return answer;
}`,
        cpp: `long long roadsAndLibraries(int n, int c_lib, int c_road, vector<vector<int>> cities) {
    if (c_lib <= c_road) return 1LL * n * c_lib;
    vector<vector<int>> graph(n + 1);
    for (auto road : cities) { graph[road[0]].push_back(road[1]); graph[road[1]].push_back(road[0]); }
    vector<bool> seen(n + 1);
    long long answer = 0;
    for (int start = 1; start <= n; start++) {
        if (seen[start]) continue;
        vector<int> stack = {start}; seen[start] = true;
        int size = 0;
        while (!stack.empty()) {
            int u = stack.back(); stack.pop_back(); size++;
            for (int v : graph[u]) if (!seen[v]) { seen[v] = true; stack.push_back(v); }
        }
        answer += c_lib + 1LL * (size - 1) * c_road;
    }
    return answer;
}`,
        java: `public static long roadsAndLibraries(int n, int c_lib, int c_road, List<List<Integer>> cities) {
    if (c_lib <= c_road) return (long)n * c_lib;
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
    for (List<Integer> road : cities) { graph.get(road.get(0)).add(road.get(1)); graph.get(road.get(1)).add(road.get(0)); }
    boolean[] seen = new boolean[n + 1];
    long answer = 0;
    for (int start = 1; start <= n; start++) {
        if (seen[start]) continue;
        Deque<Integer> stack = new ArrayDeque<>(); stack.push(start); seen[start] = true;
        int size = 0;
        while (!stack.isEmpty()) {
            int u = stack.pop(); size++;
            for (int v : graph.get(u)) if (!seen[v]) { seen[v] = true; stack.push(v); }
        }
        answer += c_lib + (long)(size - 1) * c_road;
    }
    return answer;
}`,
        javascript: `function roadsAndLibraries(n, c_lib, c_road, cities) {
    if (c_lib <= c_road) return n * c_lib;
    const graph = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of cities) { graph[a].push(b); graph[b].push(a); }
    const seen = Array(n + 1).fill(false);
    let answer = 0;
    for (let start = 1; start <= n; start++) {
        if (seen[start]) continue;
        const stack = [start]; seen[start] = true;
        let size = 0;
        while (stack.length) {
            const u = stack.pop(); size++;
            for (const v of graph[u]) if (!seen[v]) { seen[v] = true; stack.push(v); }
        }
        answer += c_lib + (size - 1) * c_road;
    }
    return answer;
}`,
      },
    },
    {
      name: '並查集',
      idea: '以道路合併同群城市，根節點保留群大小後計算成本。',
      steps: ['若建館不比修路貴，回傳 n×c_lib。', '每城初始化為自己的代表，大小為 1。', '每筆道路找兩端代表，不同就合併並加總群大小。', '只對代表節點計算一館加 s−1 條路。'],
      figure: { title: '六城、建館 3、修路 2', steps: unionFig() },
      complexity: { time: 'O((n+m)α(n))', space: 'O(n)', why: '查根及合併攤銷近常數時間；只保存代表與群大小。' },
      verdict: '只需線性大小的輔助陣列，不必存所有鄰居。',
      code: {
        python: `def roadsAndLibraries(n, c_lib, c_road, cities):
    if c_lib <= c_road:
        return n * c_lib
    parent = list(range(n + 1))
    size = [1] * (n + 1)
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in cities:
        a, b = find(a), find(b)
        if a != b:
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]  # 維護連通群大小
    answer = 0
    for i in range(1, n + 1):
        if find(i) == i:
            answer += c_lib + (size[i] - 1) * c_road
    return answer`,
        c: `long long roadsAndLibraries(int n, int c_lib, int c_road, int cities_rows, int cities_columns, int** cities) {
    if (c_lib <= c_road) return (long long)n * c_lib;
    int* parent = malloc((n + 1) * sizeof(int));
    int* size = malloc((n + 1) * sizeof(int));
    for (int i = 1; i <= n; i++) { parent[i] = i; size[i] = 1; }
    for (int i = 0; i < cities_rows; i++) {
        int a = cities[i][0], b = cities[i][1];
        while (parent[a] != a) { parent[a] = parent[parent[a]]; a = parent[a]; }
        while (parent[b] != b) { parent[b] = parent[parent[b]]; b = parent[b]; }
        if (a == b) continue;
        if (size[a] < size[b]) { int temp = a; a = b; b = temp; }
        parent[b] = a; size[a] += size[b];
    }
    long long answer = 0;
    for (int i = 1; i <= n; i++) if (parent[i] == i) answer += c_lib + (long long)(size[i] - 1) * c_road;
    free(parent); free(size);
    return answer;
}`,
        cpp: `long long roadsAndLibraries(int n, int c_lib, int c_road, vector<vector<int>> cities) {
    if (c_lib <= c_road) return 1LL * n * c_lib;
    vector<int> parent(n + 1), size(n + 1, 1);
    iota(parent.begin(), parent.end(), 0);
    auto find = [&](int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    for (auto road : cities) {
        int a = find(road[0]), b = find(road[1]);
        if (a == b) continue;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a; size[a] += size[b];
    }
    long long answer = 0;
    for (int i = 1; i <= n; i++) if (find(i) == i) answer += c_lib + 1LL * (size[i] - 1) * c_road;
    return answer;
}`,
        java: `public static long roadsAndLibraries(int n, int c_lib, int c_road, List<List<Integer>> cities) {
    if (c_lib <= c_road) return (long)n * c_lib;
    int[] parent = new int[n + 1], size = new int[n + 1];
    for (int i = 1; i <= n; i++) { parent[i] = i; size[i] = 1; }
    for (List<Integer> road : cities) {
        int a = road.get(0), b = road.get(1);
        while (parent[a] != a) { parent[a] = parent[parent[a]]; a = parent[a]; }
        while (parent[b] != b) { parent[b] = parent[parent[b]]; b = parent[b]; }
        if (a == b) continue;
        if (size[a] < size[b]) { int temp = a; a = b; b = temp; }
        parent[b] = a; size[a] += size[b];
    }
    long answer = 0;
    for (int i = 1; i <= n; i++) if (parent[i] == i) answer += c_lib + (long)(size[i] - 1) * c_road;
    return answer;
}`,
        javascript: `function roadsAndLibraries(n, c_lib, c_road, cities) {
    if (c_lib <= c_road) return n * c_lib;
    const parent = Array.from({ length: n + 1 }, (_, i) => i);
    const size = Array(n + 1).fill(1);
    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    for (const [u, v] of cities) {
        let a = find(u), b = find(v);
        if (a === b) continue;
        if (size[a] < size[b]) [a, b] = [b, a];
        parent[b] = a; size[a] += size[b];
    }
    let answer = 0;
    for (let i = 1; i <= n; i++) if (find(i) === i) answer += c_lib + (size[i] - 1) * c_road;
    return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '若道路費用不低於圖書館，修路完全沒有必要。',
    '有環的群只需 s−1 條路；不能把群裡所有給定道路都算進成本。',
    '孤立城市也是大小 1 的群，需要自己的圖書館。',
  ],
  check: {
    kind: 'fn', fn: 'roadsAndLibraries',
    cases: [
      { args: [6, 3, 2, [[1, 2], [3, 1], [2, 3], [4, 5]]], out: 15 },
      { args: [3, 2, 5, [[1, 2], [2, 3]]], out: 6 },
      { args: [1, 7, 1, []], out: 7 },
      { args: [4, 5, 1, []], out: 20 },
      { args: [4, 5, 1, [[1, 2], [2, 3], [3, 4]]], out: 8 },
      { args: [3, 2, 2, [[1, 2]]], out: 6 },
    ],
  },
}
