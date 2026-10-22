import { circleLayout } from '../engine/helpers'
import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 133. Clone Graph

const ADJ = [
  [2, 4],
  [1, 3],
  [2, 4],
  [1, 3],
]

function graph(cls: Record<number, string>, label: string, prime = false): GraphViewData {
  const pos = circleLayout(ADJ.length, 1.3)
  return {
    kind: 'graph',
    label,
    nodes: ADJ.map((_, i) => ({ id: i + 1, label: prime ? `${i + 1}′` : i + 1, x: pos[i].x, y: pos[i].y, cls: cls[i + 1] })),
    edges: ADJ.flatMap((nb, i) => nb.filter((v) => v > i + 1).map((v) => ({ from: i + 1, to: v }))),
  }
}

function dfsFig(bfs: boolean): FigStep[] {
  const made = new Map<number, string>()
  const out: FigStep[] = [{ note: '深複製一張圖:每個節點都要做一個新的,新節點的鄰居也要指到「新的」節點。關鍵是 map(舊節點 → 新節點):① 知道誰已經複製過,遇到環不會無限繞;② 接鄰居時能找到對應的新節點', views: [graph({}, '原本的圖'), kv([], 'map(舊 → 新)')] }]
  const todo = [1]
  made.set(1, "1′")
  out.push({ note: `從節點 1 開始:做出 1′,記進 map`, views: [graph({ 1: 'hl' }, '原本的圖'), kv([...made].map(([k, v]) => [k, v]), 'map(舊 → 新)', [1])] })
  while (todo.length) {
    const u = bfs ? todo.shift()! : todo.pop()!
    for (const v of ADJ[u - 1]) {
      const fresh = !made.has(v)
      if (fresh) {
        made.set(v, `${v}′`)
        todo.push(v)
      }
      out.push({ note: `處理 ${u} 的鄰居 ${v}:${fresh ? `還沒複製過 → 做出 ${v}′ 並記進 map,之後也要處理它的鄰居` : `map 裡已經有 ${v}′ 了 → 直接用,不要再做一個`};把 ${v}′ 加進 ${u}′ 的鄰居`, views: [graph({ ...Object.fromEntries([...made.keys()].map((k) => [k, 'done'])), [u]: 'hl', [v]: 'visited' }, '原本的圖'), kv([...made].map(([k, val]) => [k, val]), 'map(舊 → 新)', [v])] })
    }
  }
  out.push({ note: '每個節點都複製好、鄰居也接好了。回傳 map[節點 1] = 1′', views: [graph(Object.fromEntries(ADJ.map((_, i) => [i + 1, 'done'])), '複製出來的新圖', true)] })
  return out
}

export const q0133: Solution = {
  id: 133,
  plain: '把一張「互相連來連去」的關係圖完整複製一份:每個點都要新做一個,新點之間的連線要和原本一模一樣。難處是圖裡有圈圈,要記住「誰已經複製過」,不然會繞不完。',
  statement: '給一個**連通無向圖**中某個節點的參考(節點有 `val` 和 `neighbors` 清單),回傳整張圖的**深複製**。測資以鄰接串列表示:第 i 個(從 1 開始)是節點 i 的鄰居,傳進來的是節點 1。',
  examples: [
    { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]', note: '四個節點圍成一個環' },
    { input: 'adjList = [[]]', output: '[[]]', note: '只有一個節點,沒有鄰居' },
    { input: 'adjList = []', output: '[]', note: '空圖' },
  ],
  constraints: ['節點數 `0 ~ 100`,值是 1..n 且不重複', '圖是連通的、沒有重複邊、沒有自環'],
  insight: [
    '和 [138. Copy List with Random Pointer](#/q/138) 一樣的核心:**舊節點 → 新節點的 map**',
    '圖可能有環(1 → 2 → 1),直接遞迴複製會無限繞圈。map 同時當作 visited:複製過的就直接拿 map 裡的',
    '走訪方式 DFS 或 BFS 都可以:走到每個節點時,把它每個鄰居的「新版本」接到它的新版本上',
  ],
  approaches: [
    {
      name: 'DFS + 舊 → 新 map',
      idea: '`clone(node)`:map 裡有就直接回傳;否則做一個新節點、**先**放進 map,再對每個鄰居 `clone(鄰居)`,接到新節點的 neighbors。',
      steps: ['node 是 null → null', '`node in map` → 回傳 `map[node]`', '`copy = Node(node.val)`;`map[node] = copy`(先放!)', '`for nb in node.neighbors`:`copy.neighbors.append(clone(nb))`', '回傳 copy'],
      figure: { title: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', steps: dfsFig(false) },
      complexity: { time: 'O(V + E)', space: 'O(V)', why: '每個節點複製一次,每條邊處理兩次(兩個方向);map 和遞迴各 O(V)。' },
      verdict: '標準解,程式最短。一定要在遞迴鄰居**之前**把新節點放進 map,不然遇到環時會再做一個。',
      code: {
        python: `def cloneGraph(node):
    old_to_new = {}

    def clone(n):
        if n in old_to_new:
            return old_to_new[n]          # 複製過了(也防止在環裡繞圈)
        copy = Node(n.val)
        old_to_new[n] = copy              # 先放進 map,再處理鄰居
        for nb in n.neighbors:
            copy.neighbors.append(clone(nb))
        return copy

    return clone(node) if node else None`,
        c: `// 值是 1..100 且不重複,用陣列當 map:made[val] = 新節點
static struct Node *made[101];

static struct Node *clone(struct Node *n) {
    if (made[n->val]) return made[n->val];
    struct Node *c = malloc(sizeof(struct Node));
    c->val = n->val;
    c->numNeighbors = n->numNeighbors;
    c->neighbors = malloc((n->numNeighbors ? n->numNeighbors : 1) * sizeof(struct Node *));
    made[n->val] = c;                         // 先記下來,再處理鄰居
    for (int i = 0; i < n->numNeighbors; i++) c->neighbors[i] = clone(n->neighbors[i]);
    return c;
}

struct Node *cloneGraph(struct Node *s) {
    if (!s) return NULL;
    memset(made, 0, sizeof(made));
    return clone(s);
}`,
        cpp: `Node* cloneGraph(Node* node) {
    if (!node) return nullptr;
    unordered_map<Node*, Node*> m;            // 舊 -> 新
    function<Node*(Node*)> clone = [&](Node* n) -> Node* {
        auto it = m.find(n);
        if (it != m.end()) return it->second;
        Node* c = new Node(n->val);
        m[n] = c;
        for (Node* nb : n->neighbors) c->neighbors.push_back(clone(nb));
        return c;
    };
    return clone(node);
}`,
        java: `private final Map<Node, Node> m = new HashMap<>();   // 舊 -> 新

Node cloneGraph(Node node) {
    if (node == null) return null;
    Node c = m.get(node);
    if (c != null) return c;
    c = new Node(node.val);
    m.put(node, c);
    for (Node nb : node.neighbors) c.neighbors.add(cloneGraph(nb));
    return c;
}`,
        javascript: `function cloneGraph(node) {
  const m = new Map();                  // 舊 -> 新
  const clone = (n) => {
    if (m.has(n)) return m.get(n);
    const c = new Node(n.val);
    m.set(n, c);
    for (const nb of n.neighbors) c.neighbors.push(clone(nb));
    return c;
  };
  return node ? clone(node) : null;
}`,
      },
    },
    {
      name: 'BFS + 舊 → 新 map',
      idea: '佇列放「已經複製、但鄰居還沒接好」的舊節點。拿出一個 u:對每個鄰居 v,沒複製過就做一個並放進佇列;把 `map[v]` 接到 `map[u]` 的 neighbors。',
      steps: ['`map[start] = Node(start.val)`,`queue = [start]`', '拿出 `u`:`for v in u.neighbors`', '`v` 不在 map → 做新節點、放進 map 和佇列', '`map[u].neighbors.append(map[v])`', '回傳 `map[start]`'],
      figure: { title: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', steps: dfsFig(true) },
      complexity: { time: 'O(V + E)', space: 'O(V)', why: '同上,不用遞迴。' },
      verdict: '圖很深(例如一條很長的鍊)時不會遞迴爆掉。',
      code: {
        python: `from collections import deque

def cloneGraph(node):
    if not node:
        return None
    old_to_new = {node: Node(node.val)}
    q = deque([node])
    while q:
        u = q.popleft()
        for v in u.neighbors:
            if v not in old_to_new:
                old_to_new[v] = Node(v.val)
                q.append(v)
            old_to_new[u].neighbors.append(old_to_new[v])
    return old_to_new[node]`,
        c: `static struct Node *newNode(struct Node *n) {
    struct Node *c = malloc(sizeof(struct Node));
    c->val = n->val;
    c->numNeighbors = 0;
    c->neighbors = malloc((n->numNeighbors ? n->numNeighbors : 1) * sizeof(struct Node *));
    return c;
}

struct Node *cloneGraph(struct Node *s) {
    if (!s) return NULL;
    struct Node *made[101] = {0}, *q[101];    // made[val] = 新節點
    int head = 0, tail = 0;
    made[s->val] = newNode(s);
    q[tail++] = s;
    while (head < tail) {
        struct Node *u = q[head++];
        for (int i = 0; i < u->numNeighbors; i++) {
            struct Node *v = u->neighbors[i];
            if (!made[v->val]) { made[v->val] = newNode(v); q[tail++] = v; }
            struct Node *cu = made[u->val];
            cu->neighbors[cu->numNeighbors++] = made[v->val];
        }
    }
    return made[s->val];
}`,
        cpp: `Node* cloneGraph(Node* node) {
    if (!node) return nullptr;
    unordered_map<Node*, Node*> m{{node, new Node(node->val)}};
    queue<Node*> q;
    q.push(node);
    while (!q.empty()) {
        Node* u = q.front(); q.pop();
        for (Node* v : u->neighbors) {
            if (!m.count(v)) { m[v] = new Node(v->val); q.push(v); }
            m[u]->neighbors.push_back(m[v]);
        }
    }
    return m[node];
}`,
        java: `Node cloneGraph(Node node) {
    if (node == null) return null;
    Map<Node, Node> m = new HashMap<>();
    m.put(node, new Node(node.val));
    Deque<Node> q = new ArrayDeque<>();
    q.offer(node);
    while (!q.isEmpty()) {
        Node u = q.poll();
        for (Node v : u.neighbors) {
            if (!m.containsKey(v)) { m.put(v, new Node(v.val)); q.offer(v); }
            m.get(u).neighbors.add(m.get(v));
        }
    }
    return m.get(node);
}`,
        javascript: `function cloneGraph(node) {
  if (!node) return null;
  const m = new Map([[node, new Node(node.val)]]);
  const q = [node];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (const v of u.neighbors) {
      if (!m.has(v)) {
        m.set(v, new Node(v.val));
        q.push(v);
      }
      m.get(u).neighbors.push(m.get(v));
    }
  }
  return m.get(node);
}`,
      },
    },
  ],
  pitfalls: [
    '遞迴鄰居之後才把新節點放進 map:1 → 2 → 1 時,回到 1 發現 map 裡沒有,又做一個 1′,無限遞迴',
    '新節點的鄰居接成**舊**節點:看起來結構對,但不是深複製(測試會檢查)',
    '空圖要回傳 null',
  ],
  followUp: [{ q: '有向圖、或圖不連通?', a: '有向圖同樣做法。不連通時要對每個節點都試著當起點(題目通常會給所有節點的清單)。' }],
  check: {
    kind: 'fn',
    fn: 'cloneGraph',
    argKinds: ['graph'],
    ret: 'graph',
    cases: [
      { args: [ADJ], out: ADJ },
      { args: [[[]]], out: [[]] },
      { args: [[]], out: [] },
      { args: [[[2], [1]]], out: [[2], [1]] },
      { args: [[[2, 3], [1, 3], [1, 2]]], out: [[2, 3], [1, 3], [1, 2]] },
    ],
  },
}
