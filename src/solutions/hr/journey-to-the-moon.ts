import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const PAIRS = [[0, 1], [2, 3], [0, 4]]

function floodFig(): FigStep[] {
  const graph = Array.from({ length: 5 }, () => [] as number[])
  for (const [a, b] of PAIRS) { graph[a].push(b); graph[b].push(a) }
  const seen = Array(5).fill(false), sizes: number[] = [], out: FigStep[] = []
  for (let start = 0; start < 5; start++) {
    if (seen[start]) continue
    const stack = [start]
    seen[start] = true
    let size = 0
    while (stack.length) {
      const u = stack.pop()!
      size++
      for (const v of graph[u]) if (!seen[v]) { seen[v] = true; stack.push(v) }
      out.push({ note: `走訪太空人 ${u}；此國目前找到 ${size} 人，待探索 ${stack.join(', ') || '無'}。`, views: [arr([0, 1, 2, 3, 4], { label: '太空人', highlight: [u], done: seen.flatMap((x, i) => x ? [i] : []) }), arr(stack, { label: '待探索堆疊' }), arr([...sizes, size], { label: '已完成國家大小、目前國家大小' })] })
    }
    sizes.push(size)
  }
  return out
}

function unionFig(): FigStep[] {
  const parent = [0, 1, 2, 3, 4], size = [1, 1, 1, 1, 1], out: FigStep[] = []
  const root = (x: number): number => { while (parent[x] !== x) x = parent[x]; return x }
  for (const [a, b] of PAIRS) {
    let x = root(a), y = root(b)
    if (x !== y) { if (size[x] < size[y]) [x, y] = [y, x]; parent[y] = x; size[x] += size[y] }
    out.push({ note: `同國線索 ${a}–${b}：合併後根為 ${x}，該組大小 ${size[x]}。`, views: [arr(parent, { label: '每人的父節點', highlight: [a, b] }), arr(size, { label: '根節點的群組大小' })] })
  }
  let earlier = 0, answer = 0
  for (let i = 0; i < 5; i++) if (root(i) === i) {
    answer += earlier * size[i]
    earlier += size[i]
    out.push({ note: `加入大小 ${size[i]} 的國家，與先前 ${earlier - size[i]} 人可組 ${size[i] * (earlier - size[i])} 對；累計 ${answer}。`, views: [arr(size, { label: '各根節點大小', highlight: [i] }), kv([['先前人數', earlier], ['累計配對', answer]], '配對狀態')] })
  }
  return out
}

export const hrJourneyToTheMoon: HrSolution = {
  slug: 'journey-to-the-moon',
  plain: '太空旅行要挑兩位不同國籍的乘客；已知一些「同國」線索，先還原每個國家的團體，再數跨團體配對。',
  statement: '太空人編號 0 到 n−1。每筆 astronaut 配對表示兩人同國籍；同國關係可沿線索傳遞。求選兩位來自不同國家的無序組合數。沒有任何線索的人各自視為獨立國家。',
  examples: [
    { input: 'n = 5, astronaut = [[0,1],[2,3],[0,4]]', output: '6', note: '國家大小為 3、2，跨國組合是 3×2。' },
    { input: 'n = 4, astronaut = [[0,1]]', output: '5', note: '大小 2、1、1；跨國組合為 2+2+1。' },
  ],
  constraints: [
    'n 可很大 → 不能檢查每一對太空人是否跨國。',
    '同國關係具有傳遞性 → 每個連通分量就是一個國家。',
    '答案可能超過 32 位整數 → C/C++/Java 用 64 位計算；JavaScript 用 Number 仍可精確表示本題界內答案。',
  ],
  insight: [
    '若直接列出所有兩人組合，需 O(n²) 次判斷，且先得知道誰與誰同國。',
    '把配對當無向邊，DFS 找到的每個連通分量就是一個國家，只需記下其大小。',
    '依序納入國家，大小為 s 的新國家可和先前 total 人各配一次；累加 `total × s`，避免重複計數。[[p:union-find]] 也能求相同分組。',
  ],
  approaches: [
    {
      name: 'DFS 探索國家',
      idea: '用圖遍歷求出各國人口，再逐國統計跨國配對。',
      steps: ['為 n 人建立鄰接表，將每筆同國線索雙向加入。', '從每位尚未走訪的人開始 DFS，數出這個連通分量的人數。', '掃過各國大小，用先前總人數乘目前國家大小並累加。'],
      figure: { title: 'n = 5, 三筆同國線索', steps: floodFig() },
      complexity: { time: 'O(n+p)', space: 'O(n+p)', why: '每人及每條線索走訪常數次；鄰接表保存 p 條邊。' },
      verdict: '圖的概念直觀，適合已建立鄰接表的情況。',
      code: {
        python: `def journeyToMoon(n, astronaut):
    graph = [[] for _ in range(n)]
    for a, b in astronaut:
        graph[a].append(b)
        graph[b].append(a)
    seen = [False] * n
    earlier = answer = 0
    for start in range(n):
        if seen[start]:
            continue
        stack = [start]
        seen[start] = True
        size = 0
        while stack:
            u = stack.pop()
            size += 1
            for v in graph[u]:
                if not seen[v]:
                    seen[v] = True
                    stack.append(v)
        answer += earlier * size  # 新國家與舊國家的人配對
        earlier += size
    return answer`,
        c: `long long journeyToMoon(int n, int astronaut_rows, int astronaut_columns, int** astronaut) {
    int* head = malloc(n * sizeof(int));
    int* to = malloc((2 * astronaut_rows + 1) * sizeof(int));
    int* next = malloc((2 * astronaut_rows + 1) * sizeof(int));
    char* seen = calloc(n, 1);
    int* stack = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) head[i] = -1;
    int edge = 0;
    for (int i = 0; i < astronaut_rows; i++) {
        int a = astronaut[i][0], b = astronaut[i][1];
        to[edge] = b; next[edge] = head[a]; head[a] = edge++;
        to[edge] = a; next[edge] = head[b]; head[b] = edge++;
    }
    long long earlier = 0, answer = 0;
    for (int start = 0; start < n; start++) {
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
        answer += earlier * size;
        earlier += size;
    }
    free(head); free(to); free(next); free(seen); free(stack);
    return answer;
}`,
        cpp: `long long journeyToMoon(int n, vector<vector<int>> astronaut) {
    vector<vector<int>> graph(n);
    for (auto edge : astronaut) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
    vector<bool> seen(n);
    long long earlier = 0, answer = 0;
    for (int start = 0; start < n; start++) {
        if (seen[start]) continue;
        vector<int> stack = {start}; seen[start] = true;
        long long size = 0;
        while (!stack.empty()) {
            int u = stack.back(); stack.pop_back(); size++;
            for (int v : graph[u]) if (!seen[v]) { seen[v] = true; stack.push_back(v); }
        }
        answer += earlier * size; earlier += size;
    }
    return answer;
}`,
        java: `public static long journeyToMoon(int n, List<List<Integer>> astronaut) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    for (List<Integer> edge : astronaut) { graph.get(edge.get(0)).add(edge.get(1)); graph.get(edge.get(1)).add(edge.get(0)); }
    boolean[] seen = new boolean[n];
    long earlier = 0, answer = 0;
    for (int start = 0; start < n; start++) {
        if (seen[start]) continue;
        Deque<Integer> stack = new ArrayDeque<>(); stack.push(start); seen[start] = true;
        long size = 0;
        while (!stack.isEmpty()) {
            int u = stack.pop(); size++;
            for (int v : graph.get(u)) if (!seen[v]) { seen[v] = true; stack.push(v); }
        }
        answer += earlier * size; earlier += size;
    }
    return answer;
}`,
        javascript: `function journeyToMoon(n, astronaut) {
    const graph = Array.from({ length: n }, () => []);
    for (const [a, b] of astronaut) { graph[a].push(b); graph[b].push(a); }
    const seen = Array(n).fill(false);
    let earlier = 0, answer = 0;
    for (let start = 0; start < n; start++) {
        if (seen[start]) continue;
        const stack = [start]; seen[start] = true;
        let size = 0;
        while (stack.length) {
            const u = stack.pop(); size++;
            for (const v of graph[u]) if (!seen[v]) { seen[v] = true; stack.push(v); }
        }
        answer += earlier * size; earlier += size;
    }
    return answer;
}`,
      },
    },
    {
      name: '並查集合併國家',
      idea: '每筆線索合併兩人的國家，根節點保存國家大小。',
      steps: ['初始化每人自成一組，大小為 1。', '對每筆線索找兩人根節點；不同根才合併。', '掃描所有根，依序用先前人數乘該組大小累加配對數。'],
      figure: { title: 'n = 5, 三筆同國線索', steps: unionFig() },
      complexity: { time: 'O((n+p)α(n))', space: 'O(n)', why: '並查集的合併與查根幾乎為常數時間；只保存兩個長度 n 陣列。' },
      verdict: '不需建鄰接表，適合邊逐筆到來的情境。',
      code: {
        python: `def journeyToMoon(n, astronaut):
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in astronaut:
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]  # 合併國家人口
    earlier = answer = 0
    for i in range(n):
        if find(i) == i:
            answer += earlier * size[i]
            earlier += size[i]
    return answer`,
        c: `long long journeyToMoon(int n, int astronaut_rows, int astronaut_columns, int** astronaut) {
    int* parent = malloc(n * sizeof(int));
    int* size = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    for (int i = 0; i < astronaut_rows; i++) {
        int a = astronaut[i][0], b = astronaut[i][1];
        while (parent[a] != a) { parent[a] = parent[parent[a]]; a = parent[a]; }
        while (parent[b] != b) { parent[b] = parent[parent[b]]; b = parent[b]; }
        if (a == b) continue;
        if (size[a] < size[b]) { int temp = a; a = b; b = temp; }
        parent[b] = a; size[a] += size[b];
    }
    long long earlier = 0, answer = 0;
    for (int i = 0; i < n; i++) if (parent[i] == i) { answer += earlier * size[i]; earlier += size[i]; }
    free(parent); free(size);
    return answer;
}`,
        cpp: `long long journeyToMoon(int n, vector<vector<int>> astronaut) {
    vector<int> parent(n), size(n, 1);
    iota(parent.begin(), parent.end(), 0);
    auto find = [&](int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    for (auto edge : astronaut) {
        int a = find(edge[0]), b = find(edge[1]);
        if (a == b) continue;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a; size[a] += size[b];
    }
    long long earlier = 0, answer = 0;
    for (int i = 0; i < n; i++) if (find(i) == i) { answer += earlier * size[i]; earlier += size[i]; }
    return answer;
}`,
        java: `public static long journeyToMoon(int n, List<List<Integer>> astronaut) {
    int[] parent = new int[n], size = new int[n];
    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    for (List<Integer> edge : astronaut) {
        int a = edge.get(0), b = edge.get(1);
        while (parent[a] != a) { parent[a] = parent[parent[a]]; a = parent[a]; }
        while (parent[b] != b) { parent[b] = parent[parent[b]]; b = parent[b]; }
        if (a == b) continue;
        if (size[a] < size[b]) { int temp = a; a = b; b = temp; }
        parent[b] = a; size[a] += size[b];
    }
    long earlier = 0, answer = 0;
    for (int i = 0; i < n; i++) if (parent[i] == i) { answer += earlier * size[i]; earlier += size[i]; }
    return answer;
}`,
        javascript: `function journeyToMoon(n, astronaut) {
    const parent = Array.from({ length: n }, (_, i) => i);
    const size = Array(n).fill(1);
    function find(x) {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    for (const [u, v] of astronaut) {
        let a = find(u), b = find(v);
        if (a === b) continue;
        if (size[a] < size[b]) [a, b] = [b, a];
        parent[b] = a; size[a] += size[b];
    }
    let earlier = 0, answer = 0;
    for (let i = 0; i < n; i++) if (find(i) === i) { answer += earlier * size[i]; earlier += size[i]; }
    return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '同國線索具傳遞性，不能只把直接配對的兩人視為同國。',
    '沒有出現在配對中的人仍各是一個大小 1 的國家。',
    '兩個同國的人不能配對；依序乘先前總人數可避免重複。',
  ],
  check: {
    kind: 'fn', fn: 'journeyToMoon',
    cases: [
      { args: [5, [[0, 1], [2, 3], [0, 4]]], out: 6 },
      { args: [4, [[0, 1]]], out: 5 },
      { args: [1, []], out: 0 },
      { args: [3, []], out: 3 },
      { args: [3, [[0, 1], [1, 2]]], out: 0 },
      { args: [6, [[0, 1], [2, 3], [4, 5]]], out: 12 },
    ],
  },
}
