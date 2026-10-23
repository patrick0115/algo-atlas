import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1857. Largest Color Value in a Directed Graph

const COLORS = 'abaca'
const E = [[0, 1], [0, 2], [2, 3], [3, 4]]
const POS = { 0: { x: 0, y: 0 }, 1: { x: 0, y: 1.5 }, 2: { x: 1.5, y: 0 }, 3: { x: 3, y: 0 }, 4: { x: 4.5, y: 0 } }
const subs = Object.fromEntries(COLORS.split('').map((c, i) => [i, c]))

function topoFig(): FigStep[] {
  return [
    { note: '每個點有一個顏色(小寫字母)。一條路徑的「顏色值」= 出現最多次的那個顏色的次數。求所有路徑中最大的顏色值;有環就回傳 −1', views: [graphView(5, E, { directed: true, pos: POS, subs })] },
    { note: 'DP:`dp[v][c]` = 走到 v 為止的路徑中,顏色 c 最多出現幾次。按拓撲順序處理,u → v 時 `dp[v][c] = max(dp[v][c], dp[u][c])`,再把 v 自己的顏色 +1', views: [arr(['dp[0][a] = 1', 'dp[2][a] = 2', 'dp[3][a] = 2', 'dp[4][a] = 3'], { label: '顏色 a 的計數' })] },
    { note: '路徑 0 → 2 → 3 → 4 的顏色是 a, a, c, a → a 出現 3 次。拓撲排序沒處理完所有點(還有入度沒歸零)→ 有環 → −1', views: [graphView(5, E, { directed: true, pos: POS, subs, cls: { 0: 'done', 2: 'done', 3: 'done', 4: 'done' } }), arr([3], { label: '答案', done: [0] })] },
  ]
}

function dfsFig(): FigStep[] {
  return [
    { note: 'DFS 版:`dfs(u)` 回傳「從 u 出發的路徑」中每個顏色的最大次數(長度 26 的陣列),記憶化', views: [graphView(5, E, { directed: true, pos: POS, subs })] },
    { note: '三色標記偵測環:正在遞迴中(灰)的點又被走到 → 有環。結果 = max over 子節點,再加上 u 自己的顏色', views: [arr([3], { label: '答案', done: [0] })] },
  ]
}

export const q1857: Solution = {
  id: 1857,
  plain: '一張有方向的圖,每個點塗了一種顏色(用小寫字母表示)。在圖上找一條路徑,數路上出現最多次的那種顏色有幾個,要讓這個數字最大。如果圖裡有環就回傳 −1。',
  statement: '有向圖 n 個點,`colors[i]` 是點 i 的顏色(小寫字母),`edges[j] = [a, b]` 為 a → b。路徑的**顏色值**是路徑上出現次數最多的顏色的出現次數。回傳所有路徑中最大的顏色值;若圖中有環則回傳 −1。',
  examples: [
    { input: 'colors = "abaca", edges = [[0,1],[0,2],[2,3],[3,4]]', output: '3', note: '0 → 2 → 3 → 4' },
    { input: 'colors = "a", edges = [[0,0]]', output: '-1', note: '自環' },
  ],
  constraints: ['n, 邊數 ≤ 10⁵'],
  insight: ['有向無環圖上的 DP → 按[[p:topological-sort]]的順序轉移', '每個點記 26 種顏色各自的最大次數', 'Kahn 演算法處理完的點數 < n ⇔ 有環'],
  approaches: [
    {
      name: '拓撲排序 + 26 色 DP',
      idea: 'Kahn:入度 0 的點入佇列;彈出 u 時 `dp[u][color(u)] += 1`,更新答案,再把 dp[u] 推給每個 v(取 max)。',
      steps: ['算入度、建鄰接表;`dp = n × 26` 的 0', '入度 0 入佇列;`seen = 0`', '彈出 u:`seen += 1`、`dp[u][col[u]] += 1`、`ans = max(ans, dp[u][col[u]])`', '每個 v:`dp[v][c] = max(dp[v][c], dp[u][c])`;入度歸零入佇列', '`seen < n` → −1,否則 ans'],
      figure: { title: `colors = "${COLORS}"`, steps: topoFig() },
      complexity: { time: 'O(26 · (n + E))', space: 'O(26 · n)', why: '每條邊轉移 26 個顏色。' },
      verdict: '最推薦,拓撲序 DP 的經典;一次同時完成「判環」和「求最大值」。',
      code: {
        python: `from collections import deque

def largestPathValue(colors, edges):
    n = len(colors)
    g = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        g[a].append(b)
        indeg[b] += 1
    dp = [[0] * 26 for _ in range(n)]         # dp[v][c]:到 v 的路徑中顏色 c 最多幾個
    q = deque(i for i in range(n) if indeg[i] == 0)
    seen = ans = 0
    while q:
        u = q.popleft()
        seen += 1
        c = ord(colors[u]) - 97
        dp[u][c] += 1
        ans = max(ans, dp[u][c])
        for v in g[u]:
            for k in range(26):
                if dp[u][k] > dp[v][k]:
                    dp[v][k] = dp[u][k]       # 把 u 的紀錄往下傳
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return ans if seen == n else -1           # 有點沒處理到 → 有環`,
        c: `int largestPathValue(char *colors, int **edges, int edgesSize, int *edgesColSize) {
    int n = strlen(colors), m = edgesSize;
    int *head = malloc(n * sizeof(int)), *nxt = malloc(m * sizeof(int)), *to = malloc(m * sizeof(int));
    int *indeg = calloc(n, sizeof(int)), *q = malloc(n * sizeof(int)), (*dp)[26] = calloc(n, sizeof *dp);
    for (int i = 0; i < n; i++) head[i] = -1;
    for (int i = 0; i < m; i++) { int a = edges[i][0], b = edges[i][1]; to[i] = b; nxt[i] = head[a]; head[a] = i; indeg[b]++; }
    int h = 0, t = 0, ans = 0;
    for (int i = 0; i < n; i++) if (!indeg[i]) q[t++] = i;
    while (h < t) {
        int u = q[h++], c = colors[u] - 'a';
        if (++dp[u][c] > ans) ans = dp[u][c];
        for (int e = head[u]; e != -1; e = nxt[e]) {
            int v = to[e];
            for (int k = 0; k < 26; k++) if (dp[u][k] > dp[v][k]) dp[v][k] = dp[u][k];
            if (--indeg[v] == 0) q[t++] = v;
        }
    }
    int seen = t;
    free(head); free(nxt); free(to); free(indeg); free(q); free(dp);
    return seen == n ? ans : -1;
}`,
        cpp: `int largestPathValue(string colors, vector<vector<int>>& edges) {
    int n = colors.size();
    vector<vector<int>> g(n);
    vector<int> indeg(n, 0);
    for (auto &e : edges) { g[e[0]].push_back(e[1]); indeg[e[1]]++; }
    vector<array<int, 26>> dp(n);
    for (auto &d : dp) d.fill(0);
    queue<int> q;
    for (int i = 0; i < n; i++) if (!indeg[i]) q.push(i);
    int seen = 0, ans = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        seen++;
        int c = colors[u] - 'a';
        ans = max(ans, ++dp[u][c]);
        for (int v : g[u]) {
            for (int k = 0; k < 26; k++) dp[v][k] = max(dp[v][k], dp[u][k]);
            if (--indeg[v] == 0) q.push(v);
        }
    }
    return seen == n ? ans : -1;
}`,
        java: `int largestPathValue(String colors, int[][] edges) {
    int n = colors.length();
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] e : edges) { g.get(e[0]).add(e[1]); indeg[e[1]]++; }
    int[][] dp = new int[n][26];
    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
    int seen = 0, ans = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        seen++;
        int c = colors.charAt(u) - 'a';
        ans = Math.max(ans, ++dp[u][c]);
        for (int v : g.get(u)) {
            for (int k = 0; k < 26; k++) dp[v][k] = Math.max(dp[v][k], dp[u][k]);
            if (--indeg[v] == 0) q.offer(v);
        }
    }
    return seen == n ? ans : -1;
}`,
        javascript: `function largestPathValue(colors, edges) {
  const n = colors.length, g = Array.from({ length: n }, () => []), indeg = new Array(n).fill(0);
  for (const [a, b] of edges) {
    g[a].push(b);
    indeg[b]++;
  }
  const dp = Array.from({ length: n }, () => new Array(26).fill(0)), q = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);
  let ans = 0;
  for (let h = 0; h < q.length; h++) {
    const u = q[h], c = colors.charCodeAt(u) - 97;
    ans = Math.max(ans, ++dp[u][c]);
    for (const v of g[u]) {
      for (let k = 0; k < 26; k++) if (dp[u][k] > dp[v][k]) dp[v][k] = dp[u][k];
      if (--indeg[v] === 0) q.push(v);
    }
  }
  return q.length === n ? ans : -1;
}`,
      },
    },
    {
      name: 'DFS 記憶化 + 三色判環',
      idea: '`dfs(u)` 回傳從 u 出發的路徑中各顏色的最大次數;state 0 / 1 / 2 = 未訪 / 遞迴中 / 完成,遇到遞迴中的點就有環。',
      steps: ['`state[u] = 1`(遞迴中)', '對每個 v:`state[v] == 1` → 有環;否則取 `dfs(v)`,逐色取 max', '自己的顏色 +1,`state[u] = 2`,存結果', '每個點都呼叫一次,答案取所有點 dp 的最大值'],
      figure: { title: `colors = "${COLORS}"`, steps: dfsFig() },
      complexity: { time: 'O(26 · (n + E))', space: 'O(26 · n)', why: '每個點計算一次;遞迴深度最壞 n。' },
      verdict: '從「起點」往後看的寫法;判環用三色標記(和 [207](#/q/207) 同一招)。',
      code: {
        python: `import sys

def largestPathValue(colors, edges):
    sys.setrecursionlimit(1 << 20)
    n = len(colors)
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b)
    state, memo = [0] * n, [None] * n         # 0 未訪、1 遞迴中、2 完成

    def dfs(u):
        if state[u] == 1:
            return None                       # 繞回遞迴中的點 → 有環
        if state[u] == 2:
            return memo[u]
        state[u] = 1
        best = [0] * 26
        for v in g[u]:
            r = dfs(v)
            if r is None:
                return None
            for k in range(26):
                best[k] = max(best[k], r[k])
        best[ord(colors[u]) - 97] += 1
        state[u], memo[u] = 2, best
        return best

    ans = 0
    for u in range(n):
        r = dfs(u)
        if r is None:
            return -1
        ans = max(ans, max(r))
    return ans`,
        c: `static int *head, *nxt, *to, *state, (*memo)[26];
static char *col;

static bool dfs(int u) {
    if (state[u] == 1) return false;
    if (state[u] == 2) return true;
    state[u] = 1;
    for (int e = head[u]; e != -1; e = nxt[e]) {
        int v = to[e];
        if (!dfs(v)) return false;
        for (int k = 0; k < 26; k++) if (memo[v][k] > memo[u][k]) memo[u][k] = memo[v][k];
    }
    memo[u][col[u] - 'a']++;
    state[u] = 2;
    return true;
}

int largestPathValue(char *colors, int **edges, int edgesSize, int *edgesColSize) {
    int n = strlen(colors), m = edgesSize, ans = 0;
    col = colors;
    head = malloc(n * sizeof(int)); nxt = malloc(m * sizeof(int)); to = malloc(m * sizeof(int));
    state = calloc(n, sizeof(int)); memo = calloc(n, sizeof *memo);
    for (int i = 0; i < n; i++) head[i] = -1;
    for (int i = 0; i < m; i++) { to[i] = edges[i][1]; nxt[i] = head[edges[i][0]]; head[edges[i][0]] = i; }
    for (int u = 0; u < n && ans >= 0; u++) {
        if (!dfs(u)) { ans = -1; break; }
        for (int k = 0; k < 26; k++) if (memo[u][k] > ans) ans = memo[u][k];
    }
    free(head); free(nxt); free(to); free(state); free(memo);
    return ans;
}`,
        cpp: `int largestPathValue(string colors, vector<vector<int>>& edges) {
    int n = colors.size(), ans = 0;
    vector<vector<int>> g(n);
    for (auto &e : edges) g[e[0]].push_back(e[1]);
    vector<int> state(n, 0);
    vector<array<int, 26>> memo(n);
    for (auto &m : memo) m.fill(0);
    function<bool(int)> dfs = [&](int u) {
        if (state[u] == 1) return false;
        if (state[u] == 2) return true;
        state[u] = 1;
        for (int v : g[u]) {
            if (!dfs(v)) return false;
            for (int k = 0; k < 26; k++) memo[u][k] = max(memo[u][k], memo[v][k]);
        }
        memo[u][colors[u] - 'a']++;
        state[u] = 2;
        return true;
    };
    for (int u = 0; u < n; u++) {
        if (!dfs(u)) return -1;
        ans = max(ans, *max_element(memo[u].begin(), memo[u].end()));
    }
    return ans;
}`,
        java: `List<List<Integer>> g;
int[] state;
int[][] memo;
String col;

boolean dfs(int u) {
    if (state[u] == 1) return false;
    if (state[u] == 2) return true;
    state[u] = 1;
    for (int v : g.get(u)) {
        if (!dfs(v)) return false;
        for (int k = 0; k < 26; k++) memo[u][k] = Math.max(memo[u][k], memo[v][k]);
    }
    memo[u][col.charAt(u) - 'a']++;
    state[u] = 2;
    return true;
}

int largestPathValue(String colors, int[][] edges) {
    int n = colors.length(), ans = 0;
    col = colors;
    g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) g.get(e[0]).add(e[1]);
    state = new int[n];
    memo = new int[n][26];
    for (int u = 0; u < n; u++) {
        if (!dfs(u)) return -1;
        for (int k = 0; k < 26; k++) ans = Math.max(ans, memo[u][k]);
    }
    return ans;
}`,
        javascript: `function largestPathValue(colors, edges) {
  const n = colors.length, g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) g[a].push(b);
  const state = new Array(n).fill(0), memo = Array.from({ length: n }, () => new Array(26).fill(0));
  const dfs = (u) => {
    if (state[u] === 1) return false;
    if (state[u] === 2) return true;
    state[u] = 1;
    for (const v of g[u]) {
      if (!dfs(v)) return false;
      for (let k = 0; k < 26; k++) if (memo[v][k] > memo[u][k]) memo[u][k] = memo[v][k];
    }
    memo[u][colors.charCodeAt(u) - 97]++;
    state[u] = 2;
    return true;
  };
  let ans = 0;
  for (let u = 0; u < n; u++) {
    if (!dfs(u)) return -1;
    ans = Math.max(ans, ...memo[u]);
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['只記「路徑上最多的顏色」一個數:不同顏色要分開記,否則轉移會錯', '忘了判環,或判環時把「已完成」的點當成環', '自環 [0,0] 也是環'],
  check: {
    kind: 'fn',
    fn: 'largestPathValue',
    cases: [
      { args: [COLORS, E], out: 3 },
      { args: ['a', [[0, 0]]], out: -1 },
      { args: ['hhqhuqhqff', [[0, 1], [0, 2], [2, 3], [3, 4], [3, 5], [5, 6], [2, 7], [6, 7], [7, 8], [3, 8], [5, 8], [8, 9], [3, 9], [6, 9]]], out: 3 },
      { args: ['abc', []], out: 1 },
    ],
  },
}
