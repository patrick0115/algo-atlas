import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'

// 332. Reconstruct Itinerary

const TK = [
  ['JFK', 'KUL'],
  ['JFK', 'NRT'],
  ['NRT', 'JFK'],
]

const POS: Record<string, [number, number]> = { JFK: [0, 0], KUL: [2, -0.8], NRT: [2, 0.8] }

function g(used: number[], cur: string): GraphViewData {
  return {
    kind: 'graph',
    label: '機票 = 有向邊',
    nodes: Object.entries(POS).map(([id, [x, y]]) => ({ id, label: id, x, y, cls: id === cur ? 'hl' : undefined })),
    edges: TK.map(([a, b], i) => ({ from: a, to: b, directed: true, cls: used.includes(i) ? 'done' : undefined })),
  }
}

function hierFig(): FigStep[] {
  return [
    { note: '每張機票都要用一次 → 要找一條走過「每條邊剛好一次」的路(歐拉路徑)。從 JFK 出發,每次選字典序最小的目的地', views: [g([], 'JFK'), kv([['JFK', 'KUL, NRT'], ['NRT', 'JFK']], '鄰接表(排序後)')] },
    { note: '貪心先走 KUL(字典序比較小)→ 但 KUL 沒有出去的票了,卡住!這時還有兩張票沒用', views: [g([0], 'KUL'), arr([], { label: '答案(倒著加)' })] },
    { note: 'Hierholzer 的關鍵:**卡住的點一定是終點** → 把 KUL 放進答案(倒著放),退回 JFK 繼續', views: [g([0], 'JFK'), arr(['KUL'], { label: '答案(倒著加)' })] },
    { note: 'JFK → NRT → JFK,再也沒有票:依序把 JFK、NRT、JFK 放進答案', views: [g([0, 1, 2], 'JFK'), arr(['KUL', 'JFK', 'NRT', 'JFK'], { label: '答案(倒著加)' })] },
    { note: '倒過來就是答案:JFK → NRT → JFK → KUL。它用掉了所有票,而且在所有可行路線裡字典序最小', views: [arr(['JFK', 'NRT', 'JFK', 'KUL'], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

function btFig(): FigStep[] {
  return [
    { note: '回溯:從 JFK 開始,目的地照字典序一個一個試。用掉一張票就從鄰接表拿掉,走不完就放回去', views: [g([0], 'KUL'), arr(['JFK', 'KUL'], { label: '路線' })] },
    { note: 'JFK → KUL 之後沒有票,但還剩 2 張 → 失敗,把 KUL 這張票放回去,改試 NRT。第一個用完所有票的路線就是答案', views: [g([1, 2, 0], 'KUL'), arr(['JFK', 'NRT', 'JFK', 'KUL'], { label: '路線', done: [0, 1, 2, 3] })] },
  ]
}

export const q0332: Solution = {
  id: 332,
  plain: '你有一疊機票(出發地 → 目的地),從 JFK 出發,要**每張機票都剛好用一次**。如果有好幾種走法,選字母順序最小的那條路線。',
  statement: '`tickets[i] = [from, to]`。所有機票屬於一個從 "JFK" 出發的旅客,請重建行程,每張機票剛好使用一次。有多種合法行程時,回傳字典序最小的(把行程看成一個字串陣列比較)。保證至少存在一種合法行程。',
  examples: [
    { input: 'tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]', output: '["JFK","MUC","LHR","SFO","SJC"]' },
    { input: 'tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]', output: '["JFK","ATL","JFK","SFO","ATL","SFO"]' },
  ],
  constraints: ['機票數 ≤ 300'],
  insight: [
    '機場 = 點,機票 = 有向邊;每條邊用一次 → **歐拉路徑**',
    '單純貪心(每次走字典序最小的)會卡住:可能走進一個死胡同,但還有票沒用',
    '**Hierholzer 演算法**:DFS 走到沒有出邊的點時,才把這個點加到答案(後序)。卡住的點一定是路線的終點,最後把答案反轉',
    '每個點的出邊排序後由小到大取,就能保證字典序最小',
  ],
  approaches: [
    {
      name: '回溯(依字典序試)',
      idea: '鄰接表排序。DFS 從 JFK 開始,依序試每個還沒用過的目的地;路線長度到 `票數 + 1` 就是答案。',
      steps: ['`adj[from]` 排序', '`dfs(airport)`:`len(route) == n + 1` → True', '依序拿出一張票(標記用過),遞迴;失敗就放回'],
      figure: { title: 'tickets = [["JFK","KUL"],["JFK","NRT"],["NRT","JFK"]]', steps: btFig() },
      complexity: { time: '最壞指數級', space: 'O(E)', why: '最壞要試很多錯的分支;實際測資通常很快。' },
      verdict: '直覺,能過 LeetCode;但最壞情況沒有保證。',
      code: {
        python: `from collections import defaultdict

def findItinerary(tickets):
    adj = defaultdict(list)
    for a, b in sorted(tickets):
        adj[a].append(b)                      # 已依目的地排序
    route = ['JFK']

    def dfs(a):
        if len(route) == len(tickets) + 1:
            return True
        for i, b in enumerate(adj[a]):
            if b is None:
                continue                      # 這張票用過了
            adj[a][i] = None
            route.append(b)
            if dfs(b):
                return True
            route.pop()
            adj[a][i] = b                     # 放回去
        return False

    dfs('JFK')
    return route`,
        c: `// 機場代碼都是 3 個大寫字母;把票依 (from, to) 排序,用 used[] 標記
static char ***T;
static int NT, *USED;
static char **ROUTE;
static int RN;

static int cmpTicket(const void *a, const void *b) {
    char **x = *(char ***)a, **y = *(char ***)b;
    int c = strcmp(x[0], y[0]);
    return c ? c : strcmp(x[1], y[1]);
}

static bool dfs(char *a) {
    if (RN == NT + 1) return true;
    for (int i = 0; i < NT; i++) {
        if (USED[i] || strcmp(T[i][0], a)) continue;
        USED[i] = 1;
        ROUTE[RN++] = T[i][1];
        if (dfs(T[i][1])) return true;
        RN--;
        USED[i] = 0;
    }
    return false;
}

char **findItinerary(char ***tickets, int ticketsSize, int *ticketsColSize, int *returnSize) {
    qsort(tickets, ticketsSize, sizeof(char **), cmpTicket);
    T = tickets; NT = ticketsSize;
    USED = calloc(NT, sizeof(int));
    ROUTE = malloc((NT + 1) * sizeof(char *));
    RN = 0;
    ROUTE[RN++] = "JFK";
    dfs("JFK");
    free(USED);
    *returnSize = RN;
    return ROUTE;
}`,
        cpp: `vector<string> findItinerary(vector<vector<string>>& tickets) {
    map<string, vector<string>> adj;
    sort(tickets.begin(), tickets.end());
    for (auto& t : tickets) adj[t[0]].push_back(t[1]);
    map<string, vector<bool>> used;
    for (auto& [a, v] : adj) used[a].assign(v.size(), false);
    vector<string> route{"JFK"};
    int n = tickets.size();
    function<bool(const string&)> dfs = [&](const string& a) -> bool {
        if ((int)route.size() == n + 1) return true;
        auto& v = adj[a];
        for (int i = 0; i < (int)v.size(); i++) {
            if (used[a][i]) continue;
            used[a][i] = true;
            route.push_back(v[i]);
            if (dfs(v[i])) return true;
            route.pop_back();
            used[a][i] = false;
        }
        return false;
    };
    dfs("JFK");
    return route;
}`,
        java: `private Map<String, List<String>> adj;
private Map<String, boolean[]> used;
private List<String> route;
private int n;

List<String> findItinerary(List<List<String>> tickets) {
    adj = new HashMap<>();
    for (List<String> t : tickets) adj.computeIfAbsent(t.get(0), k -> new ArrayList<>()).add(t.get(1));
    used = new HashMap<>();
    for (var e : adj.entrySet()) { Collections.sort(e.getValue()); used.put(e.getKey(), new boolean[e.getValue().size()]); }
    n = tickets.size();
    route = new ArrayList<>(List.of("JFK"));
    dfs("JFK");
    return route;
}

private boolean dfs(String a) {
    if (route.size() == n + 1) return true;
    List<String> v = adj.getOrDefault(a, List.of());
    for (int i = 0; i < v.size(); i++) {
        if (used.get(a)[i]) continue;
        used.get(a)[i] = true;
        route.add(v.get(i));
        if (dfs(v.get(i))) return true;
        route.remove(route.size() - 1);
        used.get(a)[i] = false;
    }
    return false;
}`,
        javascript: `function findItinerary(tickets) {
  const adj = new Map();
  for (const [a, b] of [...tickets].sort()) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);
  }
  const route = ['JFK'];
  const dfs = (a) => {
    if (route.length === tickets.length + 1) return true;
    const v = adj.get(a) ?? [];
    for (let i = 0; i < v.length; i++) {
      const b = v[i];
      if (b === null) continue;
      v[i] = null;
      route.push(b);
      if (dfs(b)) return true;
      route.pop();
      v[i] = b;
    }
    return false;
  };
  dfs('JFK');
  return route;
}`,
      },
    },
    {
      name: 'Hierholzer(後序 DFS)',
      idea: '每個點的目的地排序(用堆疊時倒序,方便從尾端拿最小的)。`dfs(a)`:當 a 還有票,拿出最小的 b 並 `dfs(b)`;沒票了才把 a 加到答案。最後反轉答案。',
      steps: ['`adj[a]` 依字典序**倒序**排,`pop()` 就是最小的', '`dfs(a)`:`while adj[a]`:`dfs(adj[a].pop())`', '迴圈結束(a 卡住了)→ `route.append(a)`', '回傳 `route[::-1]`'],
      figure: { title: 'tickets = [["JFK","KUL"],["JFK","NRT"],["NRT","JFK"]]', steps: hierFig() },
      complexity: { time: 'O(E log E)', space: 'O(E)', why: '排序 O(E log E);每條邊只走一次。' },
      verdict: '最推薦,歐拉路徑的標準演算法。「卡住才加入答案」讓死胡同自動排到最後。',
      code: {
        python: `from collections import defaultdict

def findItinerary(tickets):
    adj = defaultdict(list)
    for a, b in sorted(tickets, reverse=True):
        adj[a].append(b)                      # 倒序:pop() 拿到字典序最小的
    route = []

    def dfs(a):
        while adj[a]:
            dfs(adj[a].pop())                 # 用掉這張票
        route.append(a)                       # a 沒有票了:它是目前路線的終點

    dfs('JFK')
    return route[::-1]`,
        c: `static char ***T;
static int NT, *USED;
static char **ROUTE;
static int RN;

static int cmpTicket(const void *a, const void *b) {
    char **x = *(char ***)a, **y = *(char ***)b;
    int c = strcmp(x[0], y[0]);
    return c ? c : strcmp(x[1], y[1]);
}

static void dfs(char *a) {
    for (int i = 0; i < NT; i++)               // 每次從頭找 a 的第一張(最小的)未用票
        if (!USED[i] && strcmp(T[i][0], a) == 0) {
            USED[i] = 1;
            dfs(T[i][1]);
            i = -1;                            // 回來後重新從頭找
        }
    ROUTE[RN++] = a;
}

char **findItinerary(char ***tickets, int ticketsSize, int *ticketsColSize, int *returnSize) {
    qsort(tickets, ticketsSize, sizeof(char **), cmpTicket);
    T = tickets; NT = ticketsSize;
    USED = calloc(NT, sizeof(int));
    ROUTE = malloc((NT + 1) * sizeof(char *));
    RN = 0;
    dfs("JFK");
    for (int i = 0, j = RN - 1; i < j; i++, j--) { char *t = ROUTE[i]; ROUTE[i] = ROUTE[j]; ROUTE[j] = t; }
    free(USED);
    *returnSize = RN;
    return ROUTE;
}`,
        cpp: `vector<string> findItinerary(vector<vector<string>>& tickets) {
    unordered_map<string, multiset<string>> adj;     // multiset 自動排序
    for (auto& t : tickets) adj[t[0]].insert(t[1]);
    vector<string> route;
    function<void(const string&)> dfs = [&](const string& a) {
        auto& s = adj[a];
        while (!s.empty()) {
            string b = *s.begin();
            s.erase(s.begin());
            dfs(b);
        }
        route.push_back(a);
    };
    dfs("JFK");
    reverse(route.begin(), route.end());
    return route;
}`,
        java: `private Map<String, PriorityQueue<String>> adj;
private LinkedList<String> route;

List<String> findItinerary(List<List<String>> tickets) {
    adj = new HashMap<>();
    for (List<String> t : tickets) adj.computeIfAbsent(t.get(0), k -> new PriorityQueue<>()).add(t.get(1));
    route = new LinkedList<>();
    dfs("JFK");
    return route;
}

private void dfs(String a) {
    PriorityQueue<String> pq = adj.get(a);
    while (pq != null && !pq.isEmpty()) dfs(pq.poll());
    route.addFirst(a);                        // 加在最前面,省掉最後的反轉
}`,
        javascript: `function findItinerary(tickets) {
  const adj = new Map();
  for (const [a, b] of [...tickets].sort().reverse()) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);                       // 倒序放:pop() 是最小的
  }
  const route = [];
  const dfs = (a) => {
    const v = adj.get(a) ?? [];
    while (v.length) dfs(v.pop());
    route.push(a);
  };
  dfs('JFK');
  return route.reverse();
}`,
      },
    },
  ],
  pitfalls: [
    '單純貪心(走字典序最小的、不回頭):會走進死胡同,還有票沒用完',
    'Hierholzer 時「先加答案再遞迴」(前序):死胡同的點會出現在中間,答案錯',
    '同一段航線有多張票(重複的 [a, b]):不能用集合存目的地',
  ],
  check: {
    kind: 'fn',
    fn: 'findItinerary',
    cases: [
      { args: [[['MUC', 'LHR'], ['JFK', 'MUC'], ['SFO', 'SJC'], ['LHR', 'SFO']]], out: ['JFK', 'MUC', 'LHR', 'SFO', 'SJC'] },
      { args: [[['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']]], out: ['JFK', 'ATL', 'JFK', 'SFO', 'ATL', 'SFO'] },
      { args: [TK], out: ['JFK', 'NRT', 'JFK', 'KUL'] },
      { args: [[['JFK', 'AAA'], ['AAA', 'JFK'], ['JFK', 'BBB'], ['JFK', 'CCC'], ['CCC', 'JFK']]], out: ['JFK', 'AAA', 'JFK', 'CCC', 'JFK', 'BBB'] },
      { args: [[['EZE', 'AXA'], ['TIA', 'ANU'], ['ANU', 'JFK'], ['JFK', 'ANU'], ['ANU', 'EZE'], ['TIA', 'ANU'], ['AXA', 'TIA'], ['TIA', 'JFK'], ['ANU', 'TIA'], ['JFK', 'TIA']]], out: ['JFK', 'ANU', 'EZE', 'AXA', 'TIA', 'ANU', 'JFK', 'TIA', 'ANU', 'TIA', 'JFK'] },
    ],
  },
}
