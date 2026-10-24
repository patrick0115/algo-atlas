import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const edges = [[1, 2], [1, 3], [2, 4]]
const colorFig: FigStep[] = [
  { note: '先把 1 放到實心組；與 1 不合的 2、3 必須放外框組。', views: [arr([1, 2, 3, 4], { label: '人', done: [0], highlight: [1, 2] })] },
  { note: '從 2 看見 4；4 要與 2 相反，所以也放實心組。', views: [arr([1, 2, 3, 4], { label: '人', done: [0, 3], highlight: [1, 2] })] },
  { note: '檢查所有不合關係：1–2、1–3、2–4 都跨組。', views: [arr(['1-2', '1-3', '2-4'], { label: '跨組關係', done: [0, 1, 2] })] },
  { note: '沒有衝突，可以分組。若某個人遇到已染成同組的鄰居，就立即失敗。', views: [arr([1], { label: '可以分組', done: [0] })] },
]
const unionFig: FigStep[] = [
  { note: '1 討厭 2 和 3，所以把 2、3 併入同一組；1 必須在另一組。', views: [arr([2, 3], { label: '1 的敵人', done: [0, 1] })] },
  { note: '2 討厭 1 和 4，所以把 1、4 併在同一組。', views: [arr([1, 4], { label: '2 的敵人', done: [0, 1] })] },
  { note: '目前兩組是 {1,4} 與 {2,3}；每條不合邊都跨組。', views: [arr(['1,4', '2,3'], { label: '兩組', done: [0, 1] })] },
  { note: '逐人檢查自己是否與任一敵人被併在一起；沒有，所以回傳 true。', views: [arr([1], { label: '可以分組', done: [0] })] },
]

export const q0886: Solution = {
  id: 886,
  plain: '有些人彼此不合；要把所有人分到兩隊，讓每對不合的人分開。',
  statement: '給 1 到 n 號的人與 dislikes 關係。判斷能否分成兩組，使每對不合的人都落在不同組。',
  examples: [{ input: 'n = 4, dislikes = [[1,2],[1,3],[2,4]]', output: 'true' }, { input: 'n = 3, dislikes = [[1,2],[1,3],[2,3]]', output: 'false' }],
  constraints: ['n 最多 2000；不合關係最多 10000 對。', '圖可能不連通，每個尚未分組的人都要重新開始檢查。'],
  insight: ['把人當節點、不合關係當邊，這題就是圖的二分染色。', '一條邊兩端必須顏色相反；奇數環會產生矛盾。', '另一角度是 [[p:union-find]]：同一人的所有敵人必須在同一組。'],
  approaches: [
    {
      name: '圖的二分染色', idea: '從每個未染色節點開始 DFS，相鄰節點染反色；衝突即失敗。',
      steps: ['建立雙向鄰接表。', '未染色的起點染 1，逐邊將鄰居染成相反顏色。', '已染色鄰居若顏色相同，回傳 false。'],
      figure: { title: 'n = 4，dislikes = [[1,2],[1,3],[2,4]]', steps: colorFig },
      complexity: { time: 'O(n+e)', space: 'O(n+e)', why: '每個人與每條不合關係都處理有限次；C 範例用矩陣，時間與空間為 O(n²)。' },
      verdict: '推薦解法，直觀對應兩組要求。',
      code: {
        python: `def possibleBipartition(n, dislikes):
    graph = [[] for _ in range(n + 1)]
    for a, b in dislikes:
        graph[a].append(b)
        graph[b].append(a)
    color = [0] * (n + 1)
    for start in range(1, n + 1):
        if color[start]:
            continue
        color[start] = 1
        stack = [start]
        while stack:
            person = stack.pop()
            for neighbor in graph[person]:
                if color[neighbor] == color[person]:
                    return False  # 不合的人卻被分在同組
                if color[neighbor] == 0:
                    color[neighbor] = -color[person]
                    stack.append(neighbor)
    return True`,
        c: `bool possibleBipartition(int n, int **dislikes, int dislikesSize, int *dislikesColSize) {
    unsigned char *edge = calloc((n + 1) * (n + 1), 1);
    int *color = calloc(n + 1, sizeof(int));
    int *queue = malloc((n + 1) * sizeof(int));
    for (int i = 0; i < dislikesSize; i++) {
        int a = dislikes[i][0];
        int b = dislikes[i][1];
        edge[a * (n + 1) + b] = 1;
        edge[b * (n + 1) + a] = 1;
    }
    bool ok = true;
    for (int start = 1; start <= n && ok; start++) {
        if (color[start] != 0) {
            continue;
        }
        int front = 0;
        int back = 0;
        color[start] = 1;
        queue[back++] = start;
        while (front < back && ok) {
            int person = queue[front++];
            for (int other = 1; other <= n; other++) {
                if (!edge[person * (n + 1) + other]) {
                    continue;
                }
                if (color[other] == color[person]) {
                    ok = false;
                    break;
                }
                if (color[other] == 0) {
                    color[other] = -color[person];
                    queue[back++] = other;
                }
            }
        }
    }
    free(edge);
    free(color);
    free(queue);
    return ok;
}`,
        cpp: `bool possibleBipartition(int n, vector<vector<int>>& dislikes) {
    vector<vector<int>> graph(n + 1);
    for (const auto& pair : dislikes) {
        graph[pair[0]].push_back(pair[1]);
        graph[pair[1]].push_back(pair[0]);
    }
    vector<int> color(n + 1);
    for (int start = 1; start <= n; start++) {
        if (color[start]) {
            continue;
        }
        queue<int> nodes;
        nodes.push(start);
        color[start] = 1;
        while (!nodes.empty()) {
            int person = nodes.front();
            nodes.pop();
            for (int other : graph[person]) {
                if (color[other] == color[person]) {
                    return false;
                }
                if (!color[other]) {
                    color[other] = -color[person];
                    nodes.push(other);
                }
            }
        }
    }
    return true;
}`,
        java: `boolean possibleBipartition(int n, int[][] dislikes) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] pair : dislikes) {
        graph.get(pair[0]).add(pair[1]);
        graph.get(pair[1]).add(pair[0]);
    }
    int[] color = new int[n + 1];
    for (int start = 1; start <= n; start++) {
        if (color[start] != 0) {
            continue;
        }
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(start);
        color[start] = 1;
        while (!queue.isEmpty()) {
            int person = queue.poll();
            for (int other : graph.get(person)) {
                if (color[other] == color[person]) {
                    return false;
                }
                if (color[other] == 0) {
                    color[other] = -color[person];
                    queue.offer(other);
                }
            }
        }
    }
    return true;
}`,
        javascript: `function possibleBipartition(n, dislikes) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of dislikes) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const color = new Array(n + 1).fill(0);
  for (let start = 1; start <= n; start++) {
    if (color[start]) {
      continue;
    }
    color[start] = 1;
    const queue = [start];
    for (let front = 0; front < queue.length; front++) {
      const person = queue[front];
      for (const other of graph[person]) {
        if (color[other] === color[person]) {
          return false;
        }
        if (!color[other]) {
          color[other] = -color[person];
          queue.push(other);
        }
      }
    }
  }
  return true;
}`,
      },
    },
    {
      name: '把同一人的敵人併為一組', idea: '每個人的所有敵人必須同組；若自己和敵人同組，就不可能二分。',
      steps: ['建立每個人的敵人清單。', '逐人檢查自己是否已與敵人同組。', '把這個人的所有敵人併在一起。'],
      figure: { title: 'n = 4，dislikes = [[1,2],[1,3],[2,4]]', steps: unionFig },
      complexity: { time: 'O((n+e) α(n))', space: 'O(n+e)', why: '每條邊加入清單，並查集合併成本接近常數；C 的鄰接矩陣改為 O(n²)。' },
      verdict: '把「敵人的敵人可同組」轉成合併操作。',
      code: {
        python: `def possibleBipartition(n, dislikes):
    graph = [[] for _ in range(n + 1)]
    for a, b in dislikes:
        graph[a].append(b)
        graph[b].append(a)
    parent = list(range(n + 1))

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    for person in range(1, n + 1):
        for other in graph[person]:
            if find(person) == find(other):
                return False  # 自己與敵人不能同組
            parent[find(other)] = find(graph[person][0])
    return True`,
        c: `static int findGroup(int *parent, int x) {
    if (parent[x] != x) {
        parent[x] = findGroup(parent, parent[x]);
    }
    return parent[x];
}

bool possibleBipartition(int n, int **dislikes, int dislikesSize, int *dislikesColSize) {
    unsigned char *edge = calloc((n + 1) * (n + 1), 1);
    int *parent = malloc((n + 1) * sizeof(int));
    for (int i = 0; i <= n; i++) {
        parent[i] = i;
    }
    for (int i = 0; i < dislikesSize; i++) {
        int a = dislikes[i][0];
        int b = dislikes[i][1];
        edge[a * (n + 1) + b] = 1;
        edge[b * (n + 1) + a] = 1;
    }
    bool ok = true;
    for (int person = 1; person <= n && ok; person++) {
        int first = 0;
        for (int other = 1; other <= n; other++) {
            if (!edge[person * (n + 1) + other]) {
                continue;
            }
            if (findGroup(parent, person) == findGroup(parent, other)) {
                ok = false;
                break;
            }
            if (first == 0) {
                first = other;
            } else {
                parent[findGroup(parent, other)] = findGroup(parent, first);
            }
        }
    }
    free(edge);
    free(parent);
    return ok;
}`,
        cpp: `bool possibleBipartition(int n, vector<vector<int>>& dislikes) {
    vector<vector<int>> graph(n + 1);
    for (const auto& pair : dislikes) {
        graph[pair[0]].push_back(pair[1]);
        graph[pair[1]].push_back(pair[0]);
    }
    vector<int> parent(n + 1);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    };
    for (int person = 1; person <= n; person++) {
        for (int other : graph[person]) {
            if (find(person) == find(other)) {
                return false;
            }
            parent[find(other)] = find(graph[person][0]);
        }
    }
    return true;
}`,
        java: `int find(int[] parent, int x) {
    if (parent[x] != x) {
        parent[x] = find(parent, parent[x]);
    }
    return parent[x];
}

boolean possibleBipartition(int n, int[][] dislikes) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] pair : dislikes) {
        graph.get(pair[0]).add(pair[1]);
        graph.get(pair[1]).add(pair[0]);
    }
    int[] parent = new int[n + 1];
    for (int i = 0; i <= n; i++) {
        parent[i] = i;
    }
    for (int person = 1; person <= n; person++) {
        for (int other : graph.get(person)) {
            if (find(parent, person) == find(parent, other)) {
                return false;
            }
            parent[find(parent, other)] = find(parent, graph.get(person).get(0));
        }
    }
    return true;
}`,
        javascript: `function possibleBipartition(n, dislikes) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of dislikes) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  function find(x) {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]);
    }
    return parent[x];
  }
  for (let person = 1; person <= n; person++) {
    for (const other of graph[person]) {
      if (find(person) === find(other)) {
        return false;
      }
      parent[find(other)] = find(graph[person][0]);
    }
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['圖可能不連通，不能只從 1 號開始。', '並查集要先檢查自己與敵人是否同組，再合併敵人。'],
  check: { kind: 'fn', fn: 'possibleBipartition', cases: [
    { args: [4, edges], out: true },
    { args: [3, [[1, 2], [1, 3], [2, 3]]], out: false },
    { args: [5, []], out: true },
  ] },
}
