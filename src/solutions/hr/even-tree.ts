import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const FROM = [2, 3, 4, 5, 6, 7, 8, 9, 10]
const TO = [1, 1, 3, 2, 1, 2, 6, 8, 8]

function cutFig(): FigStep[] {
  const out: FigStep[] = []
  let cuts = 0
  for (let skip = 0; skip < FROM.length; skip++) {
    const graph = Array.from({ length: 11 }, () => [] as number[])
    for (let i = 0; i < FROM.length; i++) if (i !== skip) { graph[FROM[i]].push(TO[i]); graph[TO[i]].push(FROM[i]) }
    const seen = Array(11).fill(false), stack = [FROM[skip]]
    seen[FROM[skip]] = true
    let size = 0
    while (stack.length) {
      const u = stack.pop()!
      size++
      for (const v of graph[u]) if (!seen[v]) { seen[v] = true; stack.push(v) }
    }
    const valid = size % 2 === 0
    if (valid) cuts++
    out.push({ note: `假設剪邊 ${FROM[skip]}–${TO[skip]}，${FROM[skip]} 側有 ${size} 節點；${valid ? '兩側皆為偶數，可剪' : '出現奇數側，不能剪'}。目前可剪邊 ${cuts} 條。`, views: [arr(FROM.map((x, i) => `${x}-${TO[i]}`), { label: '候選邊', highlight: [skip] }), arr([size, 10 - size, cuts], { label: '兩側大小、可剪數' })] })
  }
  return out
}

function subtreeFig(): FigStep[] {
  const graph = Array.from({ length: 11 }, () => [] as number[])
  for (let i = 0; i < FROM.length; i++) { graph[FROM[i]].push(TO[i]); graph[TO[i]].push(FROM[i]) }
  const parent = Array(11).fill(0), order = [1], size = Array(11).fill(1), out: FigStep[] = []
  parent[1] = -1
  for (let head = 0; head < order.length; head++) {
    const u = order[head]
    for (const v of graph[u]) if (v !== parent[u]) { parent[v] = u; order.push(v) }
  }
  let cuts = 0
  for (let i = order.length - 1; i > 0; i--) {
    const u = order[i], p = parent[u]
    if (size[u] % 2 === 0) cuts++
    size[p] += size[u]
    out.push({ note: `回到子節點 ${u}：子樹大小 ${size[u]}，${size[u] % 2 === 0 ? `可剪接到 ${p} 的邊` : '須與父節點留在一起'}；累計 ${cuts} 條。`, views: [arr(size.slice(1), { label: '節點 1–10 的子樹大小', highlight: [u - 1, p - 1] }), arr(order.slice(0, i), { label: '待回傳節點' }), arr([cuts], { label: '可剪邊數' })] })
  }
  return out
}

export const hrEvenTree: HrSolution = {
  slug: 'even-tree',
  plain: '把一棵樹的某些枝條剪開，希望每一塊留下的節點數都是偶數，求最多能剪幾刀。',
  statement: '輸入偶數個節點構成的樹，以及各邊的兩端 t_from、t_to。可移除若干邊，條件是移除後每個連通部分的節點數都為偶數。回傳最多可移除的邊數。',
  examples: [
    { input: 't_nodes = 10, t_from = [2,3,4,5,6,7,8,9,10], t_to = [1,1,3,2,1,2,6,8,8]', output: '2', note: '可剪出以 3 和 6 為根的偶數子樹。' },
    { input: 't_nodes = 2, t_from = [2], t_to = [1]', output: '0', note: '剪斷後兩塊都只有 1 個節點。' },
  ],
  constraints: [
    '節點總數為偶數 → 若切出一個偶數子樹，其餘部分也仍為偶數。',
    '輸入是樹且有 n−1 條邊 → 任意選根後，每條邊對應唯一的子樹。',
    '節點最多 100 個 → 每邊重跑搜尋也來得及；一次 DFS 求子樹大小更省時間。',
  ],
  insight: [
    '可試著刪除每條邊，數兩側大小是否都為偶數，但每次都重走樹。',
    '選一個根後，剪父子邊時，子節點那側正是該子樹；只要子樹大小為偶數就能剪。',
    '從葉往根累計子樹大小，每條邊判斷一次即可；偶數子樹即使再往內剪出偶數塊，父側的奇偶性仍不變。屬於 [[p:tree-dfs]]。',
  ],
  approaches: [
    {
      name: '逐邊假剪並計數',
      idea: '對每條邊暫時略過它，重新搜尋一側大小。',
      steps: ['對每條候選邊，建一張不含該邊的鄰接表。', '從邊的一端走訪，計算可到達節點數。', '若這側與另一側都是偶數，這條邊可剪。', '累計可剪邊數。'],
      figure: { title: '十節點範例，逐邊試剪', steps: cutFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'n−1 條邊各重新建立並走訪一次樹。C 版沒建鄰接表，每走到一個節點就掃一遍全部邊，是 O(n³)；n ≤ 100 仍很快。' },
      verdict: '概念直觀，但重複搜尋；可剪條件可藉子樹大小一次判斷。',
      code: {
        python: `def evenForest(t_nodes, t_edges, t_from, t_to):
    answer = 0
    for skip in range(t_edges):
        graph = [[] for _ in range(t_nodes + 1)]
        for i in range(t_edges):
            if i == skip:
                continue
            a, b = t_from[i], t_to[i]
            graph[a].append(b)
            graph[b].append(a)
        seen = {t_from[skip]}
        stack = [t_from[skip]]
        while stack:
            u = stack.pop()
            for v in graph[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)
        if len(seen) % 2 == 0:  # 另一側也必為偶數
            answer += 1
    return answer`,
        c: `int evenForest(int t_nodes, int t_edges, int t_from_count, int* t_from, int t_to_count, int* t_to) {
    int answer = 0;
    int* seen = malloc((t_nodes + 1) * sizeof(int));
    int* queue = malloc((t_nodes + 1) * sizeof(int));
    for (int skip = 0; skip < t_edges; skip++) {
        for (int i = 1; i <= t_nodes; i++) seen[i] = 0;
        int head = 0, tail = 0;
        queue[tail++] = t_from[skip]; seen[t_from[skip]] = 1;
        while (head < tail) {
            int u = queue[head++];
            for (int i = 0; i < t_edges; i++) {
                if (i == skip) continue;
                int v = t_from[i] == u ? t_to[i] : t_to[i] == u ? t_from[i] : 0;
                if (v && !seen[v]) { seen[v] = 1; queue[tail++] = v; }
            }
        }
        if (tail % 2 == 0) answer++;
    }
    free(seen); free(queue);
    return answer;
}`,
        cpp: `int evenForest(int t_nodes, int t_edges, vector<int> t_from, vector<int> t_to) {
    int answer = 0;
    for (int skip = 0; skip < t_edges; skip++) {
        vector<vector<int>> graph(t_nodes + 1);
        for (int i = 0; i < t_edges; i++) if (i != skip) {
            graph[t_from[i]].push_back(t_to[i]); graph[t_to[i]].push_back(t_from[i]);
        }
        vector<bool> seen(t_nodes + 1);
        vector<int> stack = {t_from[skip]}; seen[t_from[skip]] = true;
        int size = 0;
        while (!stack.empty()) {
            int u = stack.back(); stack.pop_back(); size++;
            for (int v : graph[u]) if (!seen[v]) { seen[v] = true; stack.push_back(v); }
        }
        if (size % 2 == 0) answer++;
    }
    return answer;
}`,
        java: `public static int evenForest(int t_nodes, int t_edges, List<Integer> t_from, List<Integer> t_to) {
    int answer = 0;
    for (int skip = 0; skip < t_edges; skip++) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i <= t_nodes; i++) graph.add(new ArrayList<>());
        for (int i = 0; i < t_edges; i++) if (i != skip) {
            graph.get(t_from.get(i)).add(t_to.get(i)); graph.get(t_to.get(i)).add(t_from.get(i));
        }
        boolean[] seen = new boolean[t_nodes + 1];
        Deque<Integer> stack = new ArrayDeque<>(); stack.push(t_from.get(skip)); seen[t_from.get(skip)] = true;
        int size = 0;
        while (!stack.isEmpty()) {
            int u = stack.pop(); size++;
            for (int v : graph.get(u)) if (!seen[v]) { seen[v] = true; stack.push(v); }
        }
        if (size % 2 == 0) answer++;
    }
    return answer;
}`,
        javascript: `function evenForest(t_nodes, t_edges, t_from, t_to) {
    let answer = 0;
    for (let skip = 0; skip < t_edges; skip++) {
        const graph = Array.from({ length: t_nodes + 1 }, () => []);
        for (let i = 0; i < t_edges; i++) if (i !== skip) {
            graph[t_from[i]].push(t_to[i]); graph[t_to[i]].push(t_from[i]);
        }
        const seen = Array(t_nodes + 1).fill(false), stack = [t_from[skip]];
        seen[t_from[skip]] = true;
        let size = 0;
        while (stack.length) {
            const u = stack.pop(); size++;
            for (const v of graph[u]) if (!seen[v]) { seen[v] = true; stack.push(v); }
        }
        if (size % 2 === 0) answer++;
    }
    return answer;
}`,
      },
    },
    {
      name: '一次求子樹大小',
      idea: '由葉往根累加大小，子樹為偶數的父子邊都可剪。',
      steps: ['建立無向鄰接表，選節點 1 為根。', '從根走訪，記下每個節點父親及走訪順序。', '倒序處理節點，把自身子樹大小加給父親。', '除根外每個偶數大小的子樹都貢獻一條可剪邊。'],
      figure: { title: '十節點範例，倒序回傳大小', steps: subtreeFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '樹有 n−1 條邊，正序建父節點與倒序統計各走一遍。' },
      verdict: '正式解法；迭代順序避免深樹的遞迴堆疊問題。',
      code: {
        python: `def evenForest(t_nodes, t_edges, t_from, t_to):
    graph = [[] for _ in range(t_nodes + 1)]
    for a, b in zip(t_from, t_to):
        graph[a].append(b)
        graph[b].append(a)
    parent = [0] * (t_nodes + 1)
    parent[1] = -1
    order = [1]
    for u in order:
        for v in graph[u]:
            if v != parent[u]:
                parent[v] = u
                order.append(v)
    size = [1] * (t_nodes + 1)
    answer = 0
    for u in reversed(order[1:]):
        if size[u] % 2 == 0:
            answer += 1  # 子樹為偶數，可以剪父邊
        size[parent[u]] += size[u]
    return answer`,
        c: `int evenForest(int t_nodes, int t_edges, int t_from_count, int* t_from, int t_to_count, int* t_to) {
    int* head = malloc((t_nodes + 1) * sizeof(int));
    int* to = malloc((2 * t_edges + 1) * sizeof(int));
    int* next = malloc((2 * t_edges + 1) * sizeof(int));
    int* parent = calloc(t_nodes + 1, sizeof(int));
    int* order = malloc(t_nodes * sizeof(int));
    int* size = malloc((t_nodes + 1) * sizeof(int));
    for (int i = 1; i <= t_nodes; i++) { head[i] = -1; size[i] = 1; }
    int edge = 0;
    for (int i = 0; i < t_edges; i++) {
        int a = t_from[i], b = t_to[i];
        to[edge] = b; next[edge] = head[a]; head[a] = edge++;
        to[edge] = a; next[edge] = head[b]; head[b] = edge++;
    }
    int count = 1; order[0] = 1; parent[1] = -1;
    for (int front = 0; front < count; front++) {
        int u = order[front];
        for (int e = head[u]; e != -1; e = next[e]) {
            int v = to[e];
            if (v != parent[u]) { parent[v] = u; order[count++] = v; }
        }
    }
    int answer = 0;
    for (int i = count - 1; i > 0; i--) {
        int u = order[i];
        if (size[u] % 2 == 0) answer++;
        size[parent[u]] += size[u];
    }
    free(head); free(to); free(next); free(parent); free(order); free(size);
    return answer;
}`,
        cpp: `int evenForest(int t_nodes, int t_edges, vector<int> t_from, vector<int> t_to) {
    vector<vector<int>> graph(t_nodes + 1);
    for (int i = 0; i < t_edges; i++) { graph[t_from[i]].push_back(t_to[i]); graph[t_to[i]].push_back(t_from[i]); }
    vector<int> parent(t_nodes + 1), order = {1}, size(t_nodes + 1, 1);
    parent[1] = -1;
    for (int head = 0; head < (int)order.size(); head++) {
        int u = order[head];
        for (int v : graph[u]) if (v != parent[u]) { parent[v] = u; order.push_back(v); }
    }
    int answer = 0;
    for (int i = (int)order.size() - 1; i > 0; i--) {
        int u = order[i];
        if (size[u] % 2 == 0) answer++;
        size[parent[u]] += size[u];
    }
    return answer;
}`,
        java: `public static int evenForest(int t_nodes, int t_edges, List<Integer> t_from, List<Integer> t_to) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i <= t_nodes; i++) graph.add(new ArrayList<>());
    for (int i = 0; i < t_edges; i++) { graph.get(t_from.get(i)).add(t_to.get(i)); graph.get(t_to.get(i)).add(t_from.get(i)); }
    int[] parent = new int[t_nodes + 1], size = new int[t_nodes + 1];
    Arrays.fill(size, 1); parent[1] = -1;
    List<Integer> order = new ArrayList<>(); order.add(1);
    for (int head = 0; head < order.size(); head++) {
        int u = order.get(head);
        for (int v : graph.get(u)) if (v != parent[u]) { parent[v] = u; order.add(v); }
    }
    int answer = 0;
    for (int i = order.size() - 1; i > 0; i--) {
        int u = order.get(i);
        if (size[u] % 2 == 0) answer++;
        size[parent[u]] += size[u];
    }
    return answer;
}`,
        javascript: `function evenForest(t_nodes, t_edges, t_from, t_to) {
    const graph = Array.from({ length: t_nodes + 1 }, () => []);
    for (let i = 0; i < t_edges; i++) { graph[t_from[i]].push(t_to[i]); graph[t_to[i]].push(t_from[i]); }
    const parent = Array(t_nodes + 1).fill(0), size = Array(t_nodes + 1).fill(1), order = [1];
    parent[1] = -1;
    for (let head = 0; head < order.length; head++) {
        const u = order[head];
        for (const v of graph[u]) if (v !== parent[u]) { parent[v] = u; order.push(v); }
    }
    let answer = 0;
    for (let i = order.length - 1; i > 0; i--) {
        const u = order[i];
        if (size[u] % 2 === 0) answer++;
        size[parent[u]] += size[u];
    }
    return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '根沒有父邊，不能把整棵樹為偶數也算作一次剪邊。',
    '即使子樹可剪，向父親回報原子樹大小的奇偶性仍正確。',
    '輸入邊未必按父子順序排列，先建無向圖再選根。',
  ],
  check: {
    kind: 'fn', fn: 'evenForest',
    cases: [
      { args: [10, 9, FROM, TO], out: 2 },
      { args: [2, 1, [2], [1]], out: 0 },
      { args: [4, 3, [2, 3, 4], [1, 2, 3]], out: 1 },
      { args: [4, 3, [2, 3, 4], [1, 1, 1]], out: 0 },
      { args: [6, 5, [2, 3, 4, 5, 6], [1, 2, 3, 4, 5]], out: 2 },
      { args: [6, 5, [2, 3, 4, 5, 6], [1, 1, 1, 1, 1]], out: 0 },
    ],
  },
}
