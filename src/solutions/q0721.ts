import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 721. Accounts Merge

const ACC = [
  ['John', 'johnsmith@mail.com', 'john_newyork@mail.com'],
  ['John', 'johnsmith@mail.com', 'john00@mail.com'],
  ['Mary', 'mary@mail.com'],
  ['John', 'johnnybravo@mail.com'],
]

function ufFig(): FigStep[] {
  return [
    { note: '同一個人可能開了好幾個帳號;只要兩個帳號有**任何一個共同的 email**,就是同一個人(而且會傳遞)。名字相同不代表同一人', views: [arr(ACC.map((a) => a[0] + ': ' + a.slice(1).join(', ')), { label: 'accounts' })] },
    { note: '併查集:每個 email 記住「第一次出現在哪個帳號」。之後別的帳號又出現同一個 email → 把兩個帳號合併', views: [graphView(4, [[0, 1]], { subs: { 0: 'John', 1: 'John', 2: 'Mary', 3: 'John' }, cls: { 0: 'done', 1: 'done' } })] },
    { note: '帳號 0、1 共用 johnsmith → 合併。帳號 3 雖然也叫 John,但沒有共同 email → 獨立', views: [arr(['John: john00, john_newyork, johnsmith', 'Mary: mary', 'John: johnnybravo'], { label: '合併結果(email 排序)', done: [0, 1, 2] })] },
  ]
}

function dfsFig(): FigStep[] {
  return [
    { note: '圖的觀點:每個 email 是一個點,同一個帳號裡的 email 互相連起來(連到第一個就夠了)', views: [graphView(5, [[0, 1], [0, 2]], { subs: { 0: 'johnsmith', 1: 'john_newyork', 2: 'john00', 3: 'mary', 4: 'johnnybravo' } })] },
    { note: '每個連通塊就是一個人:DFS 收集塊裡所有 email,排序後前面接上名字', views: [graphView(5, [[0, 1], [0, 2]], { subs: { 0: 'johnsmith', 1: 'john_newyork', 2: 'john00', 3: 'mary', 4: 'johnnybravo' }, cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

export const q0721: Solution = {
  id: 721,
  plain: '有一串帳號,每個帳號是「名字 + 幾個 email」。只要兩個帳號有共同的 email,就是同一個人,要合併。輸出合併後的每個人:名字加上他所有的 email(排序)。',
  statement: '`accounts[i] = [name, email1, email2, ...]`。若兩個帳號有共同的 email,則屬於同一人(可傳遞)。同名不一定同一人。合併後回傳每個人的帳號:第一個元素為名字,其後為**排序過**的所有 email。帳號的順序不限。',
  examples: [
    { input: 'accounts = [["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]', output: '[["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]' },
  ],
  constraints: ['帳號 ≤ 1000,每個帳號 ≤ 10 個 email'],
  insight: ['「有共同 email 就合併、而且會傳遞」→ 連通塊問題', '[[p:union-find]] 合併帳號,或把 email 當點做 [[p:graph-traversal]]', '最後每組 email 要排序'],
  approaches: [
    {
      name: '併查集(合併帳號)',
      idea: '`owner[email]` 記第一次出現的帳號;再遇到就 union 兩個帳號。最後依根把 email 分組、排序、加上名字。',
      steps: ['`parent = list(range(n))`', '`for i, acc`:每個 email:沒見過 → `owner[email] = i`;見過 → `union(i, owner[email])`', '`groups[find(owner[email])].add(email)`', '每組:`[accounts[root][0]] + sorted(emails)`'],
      figure: { title: 'accounts(4 個)', steps: ufFig() },
      complexity: { time: 'O(N · α + N log N)', space: 'O(N)', why: 'N 是 email 總數;排序是主要成本。' },
      verdict: '最推薦,併查集處理「會傳遞的相等關係」最自然。',
      code: {
        python: `def accountsMerge(accounts):
    parent = list(range(len(accounts)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    owner = {}
    for i, acc in enumerate(accounts):
        for email in acc[1:]:
            if email in owner:
                parent[find(i)] = find(owner[email])   # 共用 email → 同一人
            else:
                owner[email] = i
    groups = {}
    for email, i in owner.items():
        groups.setdefault(find(i), []).append(email)
    return [[accounts[r][0]] + sorted(es) for r, es in groups.items()]`,
        c: `typedef struct { char *email; int acc; } Pair;
static int *par;

static int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

static int cmpPair(const void *a, const void *b) { return strcmp(((Pair *)a)->email, ((Pair *)b)->email); }

char ***accountsMerge(char ***accounts, int accountsSize, int *accountsColSize, int *returnSize, int **returnColumnSizes) {
    int n = accountsSize, m = 0;
    for (int i = 0; i < n; i++) m += accountsColSize[i] - 1;
    Pair *p = malloc((m + 1) * sizeof(Pair));
    int k = 0;
    for (int i = 0; i < n; i++)
        for (int j = 1; j < accountsColSize[i]; j++) p[k++] = (Pair){accounts[i][j], i};
    qsort(p, m, sizeof(Pair), cmpPair);       // 相同 email 會排在一起
    par = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) par[i] = i;
    for (int i = 1; i < m; i++)
        if (!strcmp(p[i].email, p[i - 1].email)) par[find(p[i].acc)] = find(p[i - 1].acc);
    char ***res = malloc(n * sizeof(char **));
    int *cols = calloc(n, sizeof(int)), *rowOf = malloc(n * sizeof(int)), cnt = 0;
    for (int i = 0; i < n; i++) rowOf[i] = -1;
    for (int i = 0; i < m; i++) {
        int r = find(p[i].acc);
        if (rowOf[r] < 0) {
            rowOf[r] = cnt;
            res[cnt] = malloc((m + 1) * sizeof(char *));
            res[cnt][0] = accounts[r][0];
            cols[cnt++] = 1;
        }
        int row = rowOf[r];
        if (cols[row] > 1 && !strcmp(res[row][cols[row] - 1], p[i].email)) continue;   // 去重
        res[row][cols[row]++] = p[i].email;
    }
    free(p); free(par); free(rowOf);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
    int n = accounts.size();
    vector<int> par(n);
    iota(par.begin(), par.end(), 0);
    function<int(int)> find = [&](int x) { return par[x] == x ? x : par[x] = find(par[x]); };
    unordered_map<string, int> owner;
    for (int i = 0; i < n; i++)
        for (int j = 1; j < (int)accounts[i].size(); j++) {
            auto &e = accounts[i][j];
            if (owner.count(e)) par[find(i)] = find(owner[e]);
            else owner[e] = i;
        }
    map<int, vector<string>> groups;
    for (auto &[e, i] : owner) groups[find(i)].push_back(e);
    vector<vector<string>> res;
    for (auto &[r, es] : groups) {
        sort(es.begin(), es.end());
        vector<string> row{accounts[r][0]};
        row.insert(row.end(), es.begin(), es.end());
        res.push_back(row);
    }
    return res;
}`,
        java: `int[] par;

int find(int x) {
    while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
    return x;
}

List<List<String>> accountsMerge(List<List<String>> accounts) {
    int n = accounts.size();
    par = new int[n];
    for (int i = 0; i < n; i++) par[i] = i;
    Map<String, Integer> owner = new HashMap<>();
    for (int i = 0; i < n; i++)
        for (int j = 1; j < accounts.get(i).size(); j++) {
            String e = accounts.get(i).get(j);
            if (owner.containsKey(e)) par[find(i)] = find(owner.get(e));
            else owner.put(e, i);
        }
    Map<Integer, List<String>> groups = new HashMap<>();
    for (var en : owner.entrySet()) groups.computeIfAbsent(find(en.getValue()), k -> new ArrayList<>()).add(en.getKey());
    List<List<String>> res = new ArrayList<>();
    for (var en : groups.entrySet()) {
        List<String> es = en.getValue();
        Collections.sort(es);
        List<String> row = new ArrayList<>();
        row.add(accounts.get(en.getKey()).get(0));
        row.addAll(es);
        res.add(row);
    }
    return res;
}`,
        javascript: `function accountsMerge(accounts) {
  const par = accounts.map((_, i) => i);
  const find = (x) => {
    while (par[x] !== x) {
      par[x] = par[par[x]];
      x = par[x];
    }
    return x;
  };
  const owner = new Map();
  accounts.forEach((acc, i) => {
    for (const e of acc.slice(1)) {
      if (owner.has(e)) par[find(i)] = find(owner.get(e));
      else owner.set(e, i);
    }
  });
  const groups = new Map();
  for (const [e, i] of owner) {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(e);
  }
  return [...groups].map(([r, es]) => [accounts[r][0], ...es.sort()]);
}`,
      },
    },
    {
      name: 'Email 圖 + DFS',
      idea: '每個帳號把第一個 email 和其他 email 連邊;對每個沒拜訪過的 email DFS 收集連通塊,排序後加上名字。',
      steps: ['`g[first].append(e)`、`g[e].append(first)`;`name[e] = 帳號名`', '`for e in name`:沒拜訪 → DFS 收集', '排序後輸出 `[name[e]] + 塊`'],
      figure: { title: 'accounts(4 個)', steps: dfsFig() },
      complexity: { time: 'O(N log N)', space: 'O(N)', why: '建圖 O(N),DFS O(N),排序 O(N log N)。' },
      verdict: '把 email 當點,概念更直接;每個帳號只需要連成「星狀」就足以保證連通。',
      code: {
        python: `from collections import defaultdict

def accountsMerge(accounts):
    g, name = defaultdict(list), {}
    for acc in accounts:
        first = acc[1]
        for e in acc[1:]:
            g[first].append(e)                # 同帳號的 email 連到第一個
            g[e].append(first)
            name[e] = acc[0]
    seen, res = set(), []
    for e in name:
        if e in seen:
            continue
        seen.add(e)
        st, comp = [e], []
        while st:
            u = st.pop()
            comp.append(u)
            for v in g[u]:
                if v not in seen:
                    seen.add(v)
                    st.append(v)
        res.append([name[e]] + sorted(comp))
    return res`,
        c: `static char **uniq;
static int nu;

static int cmpStr(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }

static int idOf(char *s) {
    char **p = bsearch(&s, uniq, nu, sizeof(char *), cmpStr);
    return p - uniq;
}

char ***accountsMerge(char ***accounts, int accountsSize, int *accountsColSize, int *returnSize, int **returnColumnSizes) {
    int n = accountsSize, m = 0;
    for (int i = 0; i < n; i++) m += accountsColSize[i] - 1;
    uniq = malloc((m + 1) * sizeof(char *));
    int k = 0;
    for (int i = 0; i < n; i++) for (int j = 1; j < accountsColSize[i]; j++) uniq[k++] = accounts[i][j];
    qsort(uniq, m, sizeof(char *), cmpStr);
    nu = 0;
    for (int i = 0; i < m; i++) if (!nu || strcmp(uniq[nu - 1], uniq[i])) uniq[nu++] = uniq[i];
    // 鄰接串列:每個帳號的 email 連到該帳號第一個 email
    int *head = malloc(nu * sizeof(int)), *nxt = malloc(2 * m * sizeof(int) + 1), *to = malloc(2 * m * sizeof(int) + 1), e = 0;
    char **nameOf = malloc(nu * sizeof(char *));
    for (int i = 0; i < nu; i++) head[i] = -1;
    for (int i = 0; i < n; i++) {
        int f = idOf(accounts[i][1]);
        for (int j = 1; j < accountsColSize[i]; j++) {
            int x = idOf(accounts[i][j]);
            nameOf[x] = accounts[i][0];
            to[e] = x; nxt[e] = head[f]; head[f] = e++;
            to[e] = f; nxt[e] = head[x]; head[x] = e++;
        }
    }
    bool *seen = calloc(nu, sizeof(bool));
    int *st = malloc(nu * sizeof(int)), *comp = malloc(nu * sizeof(int)), cnt = 0;
    char ***res = malloc(nu * sizeof(char **));
    int *cols = malloc(nu * sizeof(int));
    for (int s = 0; s < nu; s++) {
        if (seen[s]) continue;
        int top = 0, c = 0;
        seen[s] = true; st[top++] = s;
        while (top) {
            int u = st[--top];
            comp[c++] = u;
            for (int q = head[u]; q != -1; q = nxt[q]) if (!seen[to[q]]) { seen[to[q]] = true; st[top++] = to[q]; }
        }
        for (int a = 1; a < c; a++) for (int b = a; b > 0 && comp[b - 1] > comp[b]; b--) { int t = comp[b]; comp[b] = comp[b - 1]; comp[b - 1] = t; }
        res[cnt] = malloc((c + 1) * sizeof(char *));
        res[cnt][0] = nameOf[s];
        for (int a = 0; a < c; a++) res[cnt][a + 1] = uniq[comp[a]];   // id 順序就是字典序
        cols[cnt++] = c + 1;
    }
    free(head); free(nxt); free(to); free(seen); free(st); free(comp);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
    unordered_map<string, vector<string>> g;
    unordered_map<string, string> name;
    for (auto &acc : accounts)
        for (int j = 1; j < (int)acc.size(); j++) {
            g[acc[1]].push_back(acc[j]);
            g[acc[j]].push_back(acc[1]);
            name[acc[j]] = acc[0];
        }
    unordered_set<string> seen;
    vector<vector<string>> res;
    for (auto &[e, nm] : name) {
        if (seen.count(e)) continue;
        seen.insert(e);
        vector<string> st{e}, comp;
        while (!st.empty()) {
            string u = st.back();
            st.pop_back();
            comp.push_back(u);
            for (auto &v : g[u]) if (!seen.count(v)) { seen.insert(v); st.push_back(v); }
        }
        sort(comp.begin(), comp.end());
        comp.insert(comp.begin(), nm);
        res.push_back(comp);
    }
    return res;
}`,
        java: `List<List<String>> accountsMerge(List<List<String>> accounts) {
    Map<String, List<String>> g = new HashMap<>();
    Map<String, String> name = new HashMap<>();
    for (List<String> acc : accounts)
        for (int j = 1; j < acc.size(); j++) {
            String f = acc.get(1), e = acc.get(j);
            g.computeIfAbsent(f, k -> new ArrayList<>()).add(e);
            g.computeIfAbsent(e, k -> new ArrayList<>()).add(f);
            name.put(e, acc.get(0));
        }
    Set<String> seen = new HashSet<>();
    List<List<String>> res = new ArrayList<>();
    for (String e : name.keySet()) {
        if (!seen.add(e)) continue;
        Deque<String> st = new ArrayDeque<>(List.of(e));
        List<String> comp = new ArrayList<>();
        while (!st.isEmpty()) {
            String u = st.pop();
            comp.add(u);
            for (String v : g.get(u)) if (seen.add(v)) st.push(v);
        }
        Collections.sort(comp);
        comp.add(0, name.get(e));
        res.add(comp);
    }
    return res;
}`,
        javascript: `function accountsMerge(accounts) {
  const g = new Map(), name = new Map();
  const add = (a, b) => {
    if (!g.has(a)) g.set(a, []);
    g.get(a).push(b);
  };
  for (const acc of accounts)
    for (const e of acc.slice(1)) {
      add(acc[1], e);
      add(e, acc[1]);
      name.set(e, acc[0]);
    }
  const seen = new Set(), res = [];
  for (const e of name.keys()) {
    if (seen.has(e)) continue;
    seen.add(e);
    const st = [e], comp = [];
    while (st.length) {
      const u = st.pop();
      comp.push(u);
      for (const v of g.get(u)) if (!seen.has(v)) {
        seen.add(v);
        st.push(v);
      }
    }
    res.push([name.get(e), ...comp.sort()]);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['用名字合併:同名不同人', '合併只看相鄰兩個帳號:合併關係會傳遞(A–B、B–C ⇒ A–C)', '同一個 email 在合併後重複出現'],
  check: {
    kind: 'fn',
    fn: 'accountsMerge',
    compare: 'sorted',
    cases: [
      { args: [ACC], out: [['John', 'john00@mail.com', 'john_newyork@mail.com', 'johnsmith@mail.com'], ['John', 'johnnybravo@mail.com'], ['Mary', 'mary@mail.com']] },
      {
        args: [[['Gabe', 'Gabe0@m.co', 'Gabe3@m.co', 'Gabe1@m.co'], ['Kevin', 'Kevin3@m.co', 'Kevin5@m.co', 'Kevin0@m.co'], ['Ethan', 'Ethan5@m.co', 'Ethan4@m.co', 'Ethan0@m.co'], ['Hanzo', 'Hanzo3@m.co', 'Hanzo1@m.co', 'Hanzo0@m.co'], ['Fern', 'Fern5@m.co', 'Fern1@m.co', 'Fern0@m.co']]],
        out: [['Ethan', 'Ethan0@m.co', 'Ethan4@m.co', 'Ethan5@m.co'], ['Fern', 'Fern0@m.co', 'Fern1@m.co', 'Fern5@m.co'], ['Gabe', 'Gabe0@m.co', 'Gabe1@m.co', 'Gabe3@m.co'], ['Hanzo', 'Hanzo0@m.co', 'Hanzo1@m.co', 'Hanzo3@m.co'], ['Kevin', 'Kevin0@m.co', 'Kevin3@m.co', 'Kevin5@m.co']],
      },
      { args: [[['A', 'a@x', 'b@x'], ['A', 'c@x'], ['A', 'b@x', 'c@x'], ['B', 'd@x']]], out: [['A', 'a@x', 'b@x', 'c@x'], ['B', 'd@x']] },
    ],
  },
}
