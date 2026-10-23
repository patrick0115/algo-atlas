import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 399. Evaluate Division

const EQ = [['a', 'b'], ['b', 'c']]
const VAL = [2.0, 3.0]
const Q = [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'a'], ['x', 'x']]
const POS = { 0: { x: 0, y: 0 }, 1: { x: 2, y: 0 }, 2: { x: 4, y: 0 } }

function dfsFig(): FigStep[] {
  const edges = [[0, 1, 2], [1, 0, 0.5], [1, 2, 3], [2, 1, 0.333]]
  return [
    { note: 'a / b = 2 可以看成一條 a → b、權重 2 的邊;反方向 b → a 權重 1/2。變數是點,等式是邊', views: [graphView(3, edges, { directed: true, pos: POS, subs: { 0: 'a', 1: 'b', 2: 'c' } })] },
    { note: '問 a / c:從 a 走到 c,把路上的權重**相乘**:a → b(×2)→ c(×3)= 6。因為 (a/b) × (b/c) = a/c', views: [graphView(3, edges, { directed: true, pos: POS, subs: { 0: 'a', 1: 'b', 2: 'c' }, edgeCls: { 0: 'hl', 2: 'hl' } })] },
    { note: 'b / a = 0.5;a / e:e 沒出現過 → −1;a / a = 1;x / x:x 沒出現過 → −1(不是 1)', views: [arr(['6', '0.5', '-1', '1', '-1'], { label: '答案', done: [0, 1, 2, 3, 4] })] },
  ]
}

function ufFig(): FigStep[] {
  return [
    { note: '帶權併查集:每個變數記錄 `weight[x] = x / root`。合併 a / b = 2 時,把 a 的根接到 b 的根,並算好權重', views: [arr(['a/root = 6', 'b/root = 3', 'c/root = 1'], { label: '合併完(root = c)' })] },
    { note: '查詢 a / c:同根 → `weight[a] / weight[c] = 6 / 1 = 6`;不同根或沒出現過 → −1', views: [arr([6], { label: 'a / c', done: [0] })] },
  ]
}

export const q0399: Solution = {
  id: 399,
  plain: '給你一些「A 除以 B 等於多少」的已知條件,回答一系列「X 除以 Y 是多少」的問題。算不出來就回答 −1。',
  statement: '`equations[i] = [A, B]`、`values[i]` 表示 `A / B = values[i]`(變數是字串)。對每個查詢 `[C, D]` 回傳 `C / D`;若無法確定(變數未出現或不連通)回傳 `-1.0`。保證不會有矛盾、沒有除以 0。',
  examples: [
    { input: 'equations = [["a","b"],["b","c"]], values = [2.0,3.0]\nqueries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]', output: '[6.0,0.5,-1.0,1.0,-1.0]' },
    { input: 'equations = [["a","b"],["b","c"],["bc","cd"]], values = [1.5,2.5,5.0]\nqueries = [["a","c"],["c","b"],["bc","cd"],["cd","bc"]]', output: '[3.75,0.4,5.0,0.2]' },
  ],
  constraints: ['equations ≤ 20,queries ≤ 20'],
  insight: ['變數 = 點,a / b = k ⇒ 邊 a → b 權重 k、b → a 權重 1/k', 'C / D = 從 C 走到 D 路上權重的乘積', '每個查詢做一次 [[p:graph-traversal]];或用帶權 [[p:union-find]]'],
  approaches: [
    {
      name: '建圖 + 每個查詢 DFS',
      idea: '建雙向帶權圖;查詢 (C, D):任一不在圖中 → −1;否則從 C DFS 找 D,沿路乘上權重。',
      steps: ['`g[a].append((b, k))`、`g[b].append((a, 1/k))`', '查詢:C 或 D 不在 g → −1', 'DFS(C, 乘積 1):到 D 回傳乘積', '走不到 → −1'],
      figure: { title: 'a / b = 2,b / c = 3', steps: dfsFig() },
      complexity: { time: 'O(Q · (V + E))', space: 'O(V + E)', why: '每個查詢最多走遍整張圖。' },
      verdict: '最推薦,題目規模很小;把除法看成圖上的路徑是關鍵。',
      code: {
        python: `from collections import defaultdict

def calcEquation(equations, values, queries):
    g = defaultdict(list)
    for (a, b), k in zip(equations, values):
        g[a].append((b, k))                   # a / b = k
        g[b].append((a, 1 / k))               # b / a = 1 / k

    def dfs(u, target, prod, seen):
        if u == target:
            return prod
        seen.add(u)
        for v, w in g[u]:
            if v not in seen:
                r = dfs(v, target, prod * w, seen)
                if r != -1.0:
                    return r
        return -1.0

    res = []
    for c, d in queries:
        if c not in g or d not in g:
            res.append(-1.0)                  # 沒出現過的變數
        else:
            res.append(dfs(c, d, 1.0, set()))
    return res`,
        c: `static char *names[40];
static int nv, eu[40], ev[40], ec;
static double ew[40];

static int idOf(char *s, bool add) {
    for (int i = 0; i < nv; i++) if (!strcmp(names[i], s)) return i;
    if (!add) return -1;
    names[nv] = s;
    return nv++;
}

static double dfs(int u, int t, double prod, bool *seen) {
    if (u == t) return prod;
    seen[u] = true;
    for (int e = 0; e < ec; e++) {
        int v = -1; double w = 0;
        if (eu[e] == u) { v = ev[e]; w = ew[e]; }
        else if (ev[e] == u) { v = eu[e]; w = 1.0 / ew[e]; }
        if (v < 0 || seen[v]) continue;
        double r = dfs(v, t, prod * w, seen);
        if (r != -1.0) return r;
    }
    return -1.0;
}

double *calcEquation(char ***equations, int equationsSize, int *equationsColSize, double *values, int valuesSize,
                     char ***queries, int queriesSize, int *queriesColSize, int *returnSize) {
    nv = ec = 0;
    for (int i = 0; i < equationsSize; i++) {
        eu[ec] = idOf(equations[i][0], true);
        ev[ec] = idOf(equations[i][1], true);
        ew[ec++] = values[i];
    }
    double *res = malloc(queriesSize * sizeof(double));
    for (int i = 0; i < queriesSize; i++) {
        int c = idOf(queries[i][0], false), d = idOf(queries[i][1], false);
        bool seen[40] = {false};
        res[i] = c < 0 || d < 0 ? -1.0 : dfs(c, d, 1.0, seen);
    }
    *returnSize = queriesSize;
    return res;
}`,
        cpp: `vector<double> calcEquation(vector<vector<string>>& equations, vector<double>& values, vector<vector<string>>& queries) {
    unordered_map<string, vector<pair<string, double>>> g;
    for (int i = 0; i < (int)equations.size(); i++) {
        auto &a = equations[i][0], &b = equations[i][1];
        g[a].push_back({b, values[i]});
        g[b].push_back({a, 1.0 / values[i]});
    }
    function<double(const string &, const string &, double, unordered_set<string> &)> dfs =
        [&](const string &u, const string &t, double prod, unordered_set<string> &seen) -> double {
        if (u == t) return prod;
        seen.insert(u);
        for (auto &[v, w] : g[u]) {
            if (seen.count(v)) continue;
            double r = dfs(v, t, prod * w, seen);
            if (r != -1.0) return r;
        }
        return -1.0;
    };
    vector<double> res;
    for (auto &q : queries) {
        if (!g.count(q[0]) || !g.count(q[1])) { res.push_back(-1.0); continue; }
        unordered_set<string> seen;
        res.push_back(dfs(q[0], q[1], 1.0, seen));
    }
    return res;
}`,
        java: `Map<String, List<Object[]>> g = new HashMap<>();

double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
    g.clear();
    for (int i = 0; i < equations.size(); i++) {
        String a = equations.get(i).get(0), b = equations.get(i).get(1);
        g.computeIfAbsent(a, k -> new ArrayList<>()).add(new Object[]{b, values[i]});
        g.computeIfAbsent(b, k -> new ArrayList<>()).add(new Object[]{a, 1.0 / values[i]});
    }
    double[] res = new double[queries.size()];
    for (int i = 0; i < queries.size(); i++) {
        String c = queries.get(i).get(0), d = queries.get(i).get(1);
        res[i] = !g.containsKey(c) || !g.containsKey(d) ? -1.0 : dfs(c, d, 1.0, new HashSet<>());
    }
    return res;
}

double dfs(String u, String t, double prod, Set<String> seen) {
    if (u.equals(t)) return prod;
    seen.add(u);
    for (Object[] e : g.get(u)) {
        String v = (String) e[0];
        if (seen.contains(v)) continue;
        double r = dfs(v, t, prod * (double) e[1], seen);
        if (r != -1.0) return r;
    }
    return -1.0;
}`,
        javascript: `function calcEquation(equations, values, queries) {
  const g = new Map();
  const add = (a, b, w) => {
    if (!g.has(a)) g.set(a, []);
    g.get(a).push([b, w]);
  };
  equations.forEach(([a, b], i) => {
    add(a, b, values[i]);
    add(b, a, 1 / values[i]);
  });
  const dfs = (u, t, prod, seen) => {
    if (u === t) return prod;
    seen.add(u);
    for (const [v, w] of g.get(u)) {
      if (seen.has(v)) continue;
      const r = dfs(v, t, prod * w, seen);
      if (r !== -1) return r;
    }
    return -1;
  };
  return queries.map(([c, d]) => (!g.has(c) || !g.has(d) ? -1 : dfs(c, d, 1, new Set())));
}`,
      },
    },
    {
      name: '帶權併查集',
      idea: '`parent[x]` 與 `weight[x] = x / parent[x]`;find 時路徑壓縮並把權重乘起來。合併 a / b = k:`ra, rb = find(a), find(b)`,`parent[ra] = rb`,`weight[ra] = k × w[b] / w[a]`。',
      steps: ['`find(x)`:遞迴找根,回程把 `weight[x] *= weight[舊 parent]`', '合併每條等式', '查詢 (c, d):沒出現過或不同根 → −1', '同根 → `weight[c] / weight[d]`'],
      figure: { title: 'a / b = 2,b / c = 3', steps: ufFig() },
      complexity: { time: 'O((E + Q) · α(V))', space: 'O(V)', why: '每次 find 攤銷幾乎是常數。' },
      verdict: '查詢很多時更快;「帶權」的路徑壓縮是併查集的進階技巧。',
      code: {
        python: `def calcEquation(equations, values, queries):
    parent, weight = {}, {}                   # weight[x] = x / parent[x]

    def find(x):
        if parent[x] != x:
            p = parent[x]
            root = find(p)
            weight[x] *= weight[p]            # 壓縮後:x / root
            parent[x] = root
        return parent[x]

    for (a, b), k in zip(equations, values):
        for v in (a, b):
            if v not in parent:
                parent[v], weight[v] = v, 1.0
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            weight[ra] = k * weight[b] / weight[a]   # ra / rb
    res = []
    for c, d in queries:
        if c not in parent or d not in parent or find(c) != find(d):
            res.append(-1.0)
        else:
            res.append(weight[c] / weight[d])
    return res`,
        c: `static char *names[40];
static int nv, par[40];
static double wt[40];

static int idOf(char *s, bool add) {
    for (int i = 0; i < nv; i++) if (!strcmp(names[i], s)) return i;
    if (!add) return -1;
    names[nv] = s; par[nv] = nv; wt[nv] = 1.0;
    return nv++;
}

static int find(int x) {
    if (par[x] != x) {
        int p = par[x], r = find(p);
        wt[x] *= wt[p];
        par[x] = r;
    }
    return par[x];
}

double *calcEquation(char ***equations, int equationsSize, int *equationsColSize, double *values, int valuesSize,
                     char ***queries, int queriesSize, int *queriesColSize, int *returnSize) {
    nv = 0;
    for (int i = 0; i < equationsSize; i++) {
        int a = idOf(equations[i][0], true), b = idOf(equations[i][1], true);
        int ra = find(a), rb = find(b);
        if (ra != rb) { par[ra] = rb; wt[ra] = values[i] * wt[b] / wt[a]; }
    }
    double *res = malloc(queriesSize * sizeof(double));
    for (int i = 0; i < queriesSize; i++) {
        int c = idOf(queries[i][0], false), d = idOf(queries[i][1], false);
        res[i] = c < 0 || d < 0 || find(c) != find(d) ? -1.0 : wt[c] / wt[d];
    }
    *returnSize = queriesSize;
    return res;
}`,
        cpp: `vector<double> calcEquation(vector<vector<string>>& equations, vector<double>& values, vector<vector<string>>& queries) {
    unordered_map<string, string> par;
    unordered_map<string, double> wt;
    function<string(const string &)> find = [&](const string &x) -> string {
        if (par[x] != x) {
            string p = par[x], r = find(p);
            wt[x] *= wt[p];
            par[x] = r;
        }
        return par[x];
    };
    for (int i = 0; i < (int)equations.size(); i++) {
        auto &a = equations[i][0], &b = equations[i][1];
        for (auto &v : {a, b}) if (!par.count(v)) { par[v] = v; wt[v] = 1.0; }
        string ra = find(a), rb = find(b);
        if (ra != rb) { par[ra] = rb; wt[ra] = values[i] * wt[b] / wt[a]; }
    }
    vector<double> res;
    for (auto &q : queries) {
        if (!par.count(q[0]) || !par.count(q[1]) || find(q[0]) != find(q[1])) res.push_back(-1.0);
        else res.push_back(wt[q[0]] / wt[q[1]]);
    }
    return res;
}`,
        java: `Map<String, String> par = new HashMap<>();
Map<String, Double> wt = new HashMap<>();

String find(String x) {
    if (!par.get(x).equals(x)) {
        String p = par.get(x), r = find(p);
        wt.put(x, wt.get(x) * wt.get(p));
        par.put(x, r);
    }
    return par.get(x);
}

double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
    par.clear(); wt.clear();
    for (int i = 0; i < equations.size(); i++) {
        String a = equations.get(i).get(0), b = equations.get(i).get(1);
        for (String v : new String[]{a, b}) if (!par.containsKey(v)) { par.put(v, v); wt.put(v, 1.0); }
        String ra = find(a), rb = find(b);
        if (!ra.equals(rb)) { par.put(ra, rb); wt.put(ra, values[i] * wt.get(b) / wt.get(a)); }
    }
    double[] res = new double[queries.size()];
    for (int i = 0; i < queries.size(); i++) {
        String c = queries.get(i).get(0), d = queries.get(i).get(1);
        res[i] = !par.containsKey(c) || !par.containsKey(d) || !find(c).equals(find(d)) ? -1.0 : wt.get(c) / wt.get(d);
    }
    return res;
}`,
        javascript: `function calcEquation(equations, values, queries) {
  const par = new Map(), wt = new Map();
  const find = (x) => {
    if (par.get(x) !== x) {
      const p = par.get(x), r = find(p);
      wt.set(x, wt.get(x) * wt.get(p));
      par.set(x, r);
    }
    return par.get(x);
  };
  equations.forEach(([a, b], i) => {
    for (const v of [a, b])
      if (!par.has(v)) {
        par.set(v, v);
        wt.set(v, 1);
      }
    const ra = find(a), rb = find(b);
    if (ra !== rb) {
      par.set(ra, rb);
      wt.set(ra, (values[i] * wt.get(b)) / wt.get(a));
    }
  });
  return queries.map(([c, d]) => (!par.has(c) || !par.has(d) || find(c) !== find(d) ? -1 : wt.get(c) / wt.get(d)));
}`,
      },
    },
  ],
  pitfalls: ['x / x 時 x 沒出現過:要回傳 −1 而不是 1', '只存單向邊:b / a 就查不到', 'DFS 沒記錄 seen:圖有環時會無限遞迴'],
  check: {
    kind: 'fn',
    fn: 'calcEquation',
    compare: 'close',
    cases: [
      { args: [EQ, VAL, Q], out: [6.0, 0.5, -1.0, 1.0, -1.0] },
      { args: [[['a', 'b'], ['b', 'c'], ['bc', 'cd']], [1.5, 2.5, 5.0], [['a', 'c'], ['c', 'b'], ['bc', 'cd'], ['cd', 'bc']]], out: [3.75, 0.4, 5.0, 0.2] },
      { args: [[['a', 'b']], [0.5], [['a', 'b'], ['b', 'a'], ['a', 'c'], ['x', 'y']]], out: [0.5, 2.0, -1.0, -1.0] },
    ],
  },
}
