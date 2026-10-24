import { graphView } from './fig'
import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 797. All Paths From Source to Target
const G = [[1, 2], [3], [3], []]
const EDGES = [[0, 1], [0, 2], [1, 3], [2, 3]]

const CHECK = {
  python: `\n\ndef pathsCheck(graph):
    paths = allPathsSourceTarget(graph)
    memo = {}
    def count(node):
        if node == len(graph) - 1:
            return 1
        if node not in memo:
            memo[node] = sum(count(next_node) for next_node in graph[node])
        return memo[node]
    seen = set()
    for path in paths:
        if not path or path[0] != 0 or path[-1] != len(graph) - 1:
            return 0
        if any(b not in graph[a] for a, b in zip(path, path[1:])):
            return 0
        seen.add(tuple(path))
    return int(len(paths) == len(seen) == count(0))`,
  c: `\n\nstatic int count797(int node, int **graph, int n, int *col, int *memo) {
    if (node == n - 1) {
        return 1;
    }
    if (memo[node] >= 0) {
        return memo[node];
    }
    int total = 0;
    for (int i = 0; i < col[node]; i++) {
        total += count797(graph[node][i], graph, n, col, memo);
    }
    memo[node] = total;
    return total;
}

static int compare797(const void *a, const void *b) {
    unsigned long long x = *(const unsigned long long *)a;
    unsigned long long y = *(const unsigned long long *)b;
    return (x > y) - (x < y);
}

int pathsCheck(int **graph, int graphSize, int *graphColSize) {
    int count = 0;
    int *sizes = NULL;
    int **paths = allPathsSourceTarget(graph, graphSize, graphColSize, &count, &sizes);
    int *memo = malloc(graphSize * sizeof(int));
    for (int i = 0; i < graphSize; i++) {
        memo[i] = -1;
    }
    int valid = count == count797(0, graph, graphSize, graphColSize, memo);
    unsigned long long *codes = malloc((count + 1) * sizeof(unsigned long long));
    for (int i = 0; i < count; i++) {
        if (sizes[i] < 2 || paths[i][0] != 0 || paths[i][sizes[i] - 1] != graphSize - 1) {
            valid = 0;
        }
        codes[i] = 0;
        for (int j = 0; j < sizes[i]; j++) {
            codes[i] = codes[i] * 16 + paths[i][j] + 1;
            if (j > 0) {
                int previous = paths[i][j - 1];
                int edgeFound = 0;
                for (int e = 0; e < graphColSize[previous]; e++) {
                    if (graph[previous][e] == paths[i][j]) {
                        edgeFound = 1;
                    }
                }
                if (!edgeFound) {
                    valid = 0;
                }
            }
        }
        free(paths[i]);
    }
    qsort(codes, count, sizeof(unsigned long long), compare797);
    for (int i = 1; i < count; i++) {
        if (codes[i] == codes[i - 1]) {
            valid = 0;
        }
    }
    free(codes);
    free(memo);
    free(paths);
    free(sizes);
    return valid;
}`,
  cpp: `\n\nint pathsCheck(vector<vector<int>>& graph) {
    vector<vector<int>> paths = allPathsSourceTarget(graph);
    vector<int> memo(graph.size(), -1);
    function<int(int)> count = [&](int node) {
        if (node == (int)graph.size() - 1) {
            return 1;
        }
        if (memo[node] >= 0) {
            return memo[node];
        }
        int total = 0;
        for (int next : graph[node]) {
            total += count(next);
        }
        return memo[node] = total;
    };
    set<vector<int>> unique;
    for (const auto& path : paths) {
        if (path.empty() || path.front() != 0 || path.back() != (int)graph.size() - 1) {
            return 0;
        }
        for (int i = 1; i < (int)path.size(); i++) {
            const auto& edges = graph[path[i - 1]];
            if (find(edges.begin(), edges.end(), path[i]) == edges.end()) {
                return 0;
            }
        }
        unique.insert(path);
    }
    return (int)paths.size() == (int)unique.size() && (int)paths.size() == count(0);
}`,
  java: `\n\nint pathsCheck(int[][] graph) {
    List<List<Integer>> paths = allPathsSourceTarget(graph);
    int[] memo = new int[graph.length];
    Arrays.fill(memo, -1);
    Set<String> unique = new HashSet<>();
    for (List<Integer> path : paths) {
        if (path.isEmpty() || path.get(0) != 0 || path.get(path.size() - 1) != graph.length - 1) {
            return 0;
        }
        for (int i = 1; i < path.size(); i++) {
            int from = path.get(i - 1);
            int to = path.get(i);
            boolean found = false;
            for (int edge : graph[from]) {
                if (edge == to) {
                    found = true;
                }
            }
            if (!found) {
                return 0;
            }
        }
        unique.add(path.toString());
    }
    return paths.size() == unique.size() && paths.size() == count797(0, graph, memo) ? 1 : 0;
}

int count797(int node, int[][] graph, int[] memo) {
    if (node == graph.length - 1) {
        return 1;
    }
    if (memo[node] >= 0) {
        return memo[node];
    }
    int total = 0;
    for (int next : graph[node]) {
        total += count797(next, graph, memo);
    }
    memo[node] = total;
    return total;
}`,
  javascript: `\n\nfunction pathsCheck(graph) {
  const paths = allPathsSourceTarget(graph);
  const memo = new Map();
  function count(node) {
    if (node === graph.length - 1) {
      return 1;
    }
    if (!memo.has(node)) {
      memo.set(node, graph[node].reduce((sum, next) => sum + count(next), 0));
    }
    return memo.get(node);
  }
  const unique = new Set();
  for (const path of paths) {
    if (!path.length || path[0] !== 0 || path[path.length - 1] !== graph.length - 1) {
      return 0;
    }
    for (let i = 1; i < path.length; i++) {
      if (!graph[path[i - 1]].includes(path[i])) {
        return 0;
      }
    }
    unique.add(JSON.stringify(path));
  }
  return paths.length === unique.size && paths.length === count(0) ? 1 : 0;
}`,
}

export const q0797: Solution = {
  id: 797,
  plain: '從起點走到終點，把每一條不同路線都列出來。圖沒有環，所以往前走不會繞圈。',
  statement: 'graph[i] 列出節點 i 可前往的節點。圖是 DAG；回傳從 0 到 n−1 的所有路徑，每條路徑是經過的節點序列。',
  examples: [{ input: 'graph = [[1,2],[3],[3],[]]', output: '[[0,1,3],[0,2,3]]' }, { input: 'graph = [[1],[]]', output: '[[0,1]]' }],
  constraints: ['2 ≤ n ≤ 15；沒有環，且每個鄰居編號有效。'],
  insight: ['到終點前，路徑可以沿每一條出邊分支。', '用 [[p:backtracking]] 深入一條路，再退回分岔點；也可用 [[p:graph-traversal]] 的 BFS 維護完整路徑。'],
  approaches: [
    {
      name: 'DFS 回溯列舉路徑',
      idea: '目前路徑加入下一節點，走到底就複製答案，返回時撤銷該步。',
      steps: ['path 從 [0] 開始。', 'DFS 每個鄰居：加入、遞迴、移除。', '到 n−1 時複製目前 path 到答案。'],
      figure: { title: 'graph = [[1,2],[3],[3],[]]', steps: [
        { note: '從節點 0 出發，有兩條分支通往 1 和 2。', views: [graphView(4, EDGES, { base: 0, directed: true, cls: { 0: 'hl' } }), arr([0], { label: '目前路徑' })] },
        { note: '先選 1，路徑變成 [0,1]。', views: [graphView(4, EDGES, { base: 0, directed: true, cls: { 1: 'hl' } }), arr([0, 1], { label: '目前路徑' })] },
        { note: '由 1 到終點 3，複製 [0,1,3] 作第一個答案。', views: [graphView(4, EDGES, { base: 0, directed: true, cls: { 3: 'done' } }), arr([0, 1, 3], { label: '第一條路', done: [0, 1, 2] })] },
        { note: '退回 0，改走 2→3，複製第二條 [0,2,3]。', views: [graphView(4, EDGES, { base: 0, directed: true, cls: { 2: 'hl', 3: 'done' } }), arr([0, 2, 3], { label: '第二條路', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(所有輸出路徑的總長度)', space: 'O(n + 輸出大小)', why: '每條完整路徑都須複製；目前路徑與遞迴深度最多 n。' },
      verdict: '推薦；回溯的加入與撤銷要成對。',
      code: {
        python: `def allPathsSourceTarget(graph):
    target = len(graph) - 1
    answer = []
    path = [0]
    def dfs(node):
        if node == target:
            answer.append(path[:])       # 複製，不能保存同一個可變陣列
            return
        for neighbor in graph[node]:
            path.append(neighbor)
            dfs(neighbor)
            path.pop()                   # 回到分岔點
    dfs(0)
    return answer${CHECK.python}`,
        c: `typedef struct {
    int **paths;
    int *sizes;
    int count;
    int path[15];
    int target;
} Context797;

static void dfs797(int node, int depth, int **graph, int *graphColSize, Context797 *ctx) {
    ctx->path[depth] = node;
    if (node == ctx->target) {
        int *copy = malloc((depth + 1) * sizeof(int));
        memcpy(copy, ctx->path, (depth + 1) * sizeof(int));
        ctx->paths[ctx->count] = copy;
        ctx->sizes[ctx->count] = depth + 1;
        ctx->count++;
        return;
    }
    for (int i = 0; i < graphColSize[node]; i++) {
        dfs797(graph[node][i], depth + 1, graph, graphColSize, ctx);
    }
}

int **allPathsSourceTarget(int **graph, int graphSize, int *graphColSize, int *returnSize, int **returnColumnSizes) {
    Context797 ctx;
    ctx.paths = malloc(10000 * sizeof(int *));
    ctx.sizes = malloc(10000 * sizeof(int));
    ctx.count = 0;
    ctx.target = graphSize - 1;
    dfs797(0, 0, graph, graphColSize, &ctx);
    *returnSize = ctx.count;
    *returnColumnSizes = ctx.sizes;
    return ctx.paths;
}${CHECK.c}`,
        cpp: `vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {
    vector<vector<int>> answer;
    vector<int> path{0};
    int target = graph.size() - 1;
    function<void(int)> dfs = [&](int node) {
        if (node == target) {
            answer.push_back(path);
            return;
        }
        for (int neighbor : graph[node]) {
            path.push_back(neighbor);
            dfs(neighbor);
            path.pop_back();
        }
    };
    dfs(0);
    return answer;
}${CHECK.cpp}`,
        java: `List<List<Integer>> allPathsSourceTarget(int[][] graph) {
    List<List<Integer>> answer = new ArrayList<>();
    List<Integer> path = new ArrayList<>();
    path.add(0);
    dfs797(0, graph, path, answer);
    return answer;
}

void dfs797(int node, int[][] graph, List<Integer> path, List<List<Integer>> answer) {
    if (node == graph.length - 1) {
        answer.add(new ArrayList<>(path));
        return;
    }
    for (int neighbor : graph[node]) {
        path.add(neighbor);
        dfs797(neighbor, graph, path, answer);
        path.remove(path.size() - 1);
    }
}${CHECK.java}`,
        javascript: `function allPathsSourceTarget(graph) {
  const answer = [];
  const path = [0];
  const target = graph.length - 1;
  function dfs(node) {
    if (node === target) {
      answer.push([...path]);
      return;
    }
    for (const neighbor of graph[node]) {
      path.push(neighbor);
      dfs(neighbor);
      path.pop();
    }
  }
  dfs(0);
  return answer;
}${CHECK.javascript}`,
      },
    },
    {
      name: 'BFS 佇列保存完整路徑',
      idea: '佇列裡每筆資料是一條尚未走到底的路；取出後分別延伸到所有鄰居。',
      steps: ['佇列初始化為 [[0]]。', '取出一條路；尾端若是終點，加入答案。', '否則為每個鄰居建立新路並放回佇列。'],
      figure: { title: 'graph = [[1,2],[3],[3],[]]', steps: [
        { note: '佇列一開始只有路徑 [0]。', views: [arr(['0'], { label: '佇列中的路徑' })] },
        { note: '展開 0，產生 [0,1]、[0,2] 兩條待走路徑。', views: [arr(['0→1', '0→2'], { label: '佇列' }), graphView(4, EDGES, { base: 0, directed: true })] },
        { note: '展開 [0,1] 得 [0,1,3]；展開 [0,2] 得 [0,2,3]。', views: [arr(['0→1→3', '0→2→3'], { label: '佇列' })] },
        { note: '兩條路都到節點 3，加入答案。', views: [arr(['0→1→3', '0→2→3'], { label: '完整路徑', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(所有產生路徑的總長度)', space: 'O(佇列路徑總長度 + 輸出)', why: '每次延伸都複製目前路徑。' },
      verdict: '路徑依長度一層層長出來，但通常比 DFS 多占佇列空間。',
      code: {
        python: `from collections import deque

def allPathsSourceTarget(graph):
    queue = deque([[0]])
    answer = []
    target = len(graph) - 1
    while queue:
        path = queue.popleft()
        node = path[-1]
        if node == target:
            answer.append(path)
            continue
        for neighbor in graph[node]:
            queue.append(path + [neighbor])  # 分支各有自己的路徑
    return answer${CHECK.python}`,
        c: `typedef struct { int path[15]; int size; } State797;

int **allPathsSourceTarget(int **graph, int graphSize, int *graphColSize, int *returnSize, int **returnColumnSizes) {
    State797 *queue = malloc(32768 * sizeof(State797));
    int head = 0;
    int tail = 1;
    queue[0].path[0] = 0;
    queue[0].size = 1;
    int **answer = malloc(10000 * sizeof(int *));
    int *sizes = malloc(10000 * sizeof(int));
    int count = 0;
    while (head < tail) {
        State797 current = queue[head++];
        int node = current.path[current.size - 1];
        if (node == graphSize - 1) {
            answer[count] = malloc(current.size * sizeof(int));
            memcpy(answer[count], current.path, current.size * sizeof(int));
            sizes[count] = current.size;
            count++;
            continue;
        }
        for (int i = 0; i < graphColSize[node]; i++) {
            State797 next = current;
            next.path[next.size++] = graph[node][i];
            queue[tail++] = next;
        }
    }
    free(queue);
    *returnSize = count;
    *returnColumnSizes = sizes;
    return answer;
}${CHECK.c}`,
        cpp: `vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {
    queue<vector<int>> pending;
    pending.push({0});
    vector<vector<int>> answer;
    int target = graph.size() - 1;
    while (!pending.empty()) {
        vector<int> path = pending.front();
        pending.pop();
        int node = path.back();
        if (node == target) {
            answer.push_back(path);
            continue;
        }
        for (int neighbor : graph[node]) {
            vector<int> next = path;
            next.push_back(neighbor);
            pending.push(next);
        }
    }
    return answer;
}${CHECK.cpp}`,
        java: `List<List<Integer>> allPathsSourceTarget(int[][] graph) {
    Queue<List<Integer>> pending = new ArrayDeque<>();
    pending.add(new ArrayList<>(List.of(0)));
    List<List<Integer>> answer = new ArrayList<>();
    while (!pending.isEmpty()) {
        List<Integer> path = pending.remove();
        int node = path.get(path.size() - 1);
        if (node == graph.length - 1) {
            answer.add(path);
            continue;
        }
        for (int neighbor : graph[node]) {
            List<Integer> next = new ArrayList<>(path);
            next.add(neighbor);
            pending.add(next);
        }
    }
    return answer;
}${CHECK.java}`,
        javascript: `function allPathsSourceTarget(graph) {
  const queue = [[0]];
  const answer = [];
  for (let head = 0; head < queue.length; head++) {
    const path = queue[head];
    const node = path[path.length - 1];
    if (node === graph.length - 1) {
      answer.push(path);
      continue;
    }
    for (const neighbor of graph[node]) {
      queue.push([...path, neighbor]);
    }
  }
  return answer;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['到終點要複製目前路徑，不能保存稍後仍會變動的陣列。', '回溯離開分支時一定要移除最後加入的節點。', '路徑順序不限，測試需按路徑排序。'],
  check: { kind: 'fn', fn: 'pathsCheck', cases: [
    { args: [G], out: 1 }, { args: [[[1], []]], out: 1 }, { args: [[[1, 2], [2], []]], out: 1 },
  ] },
}
