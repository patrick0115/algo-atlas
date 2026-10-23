import type { GraphViewData } from '../types'
import type { FigStep, Solution } from './types'

// 116. Populating Next Right Pointers in Each Node

const T = [1, 2, 3, 4, 5, 6, 7]

/** 完美二元樹 + 同層 next 箭頭(到 upto 層為止已連好) */
function view(upto: number, hl: number[] = []): GraphViewData {
  const nodes: GraphViewData['nodes'] = []
  const edges: GraphViewData['edges'] = []
  T.forEach((v, i) => {
    const d = Math.floor(Math.log2(i + 1))
    const k = i + 1 - 2 ** d
    const w = 2 ** (2 - d)
    nodes.push({ id: i, label: v, x: (k * w + w / 2) * 1.1, y: d * 1.2, cls: hl.includes(i) ? 'hl' : undefined })
    if (i > 0) edges.push({ from: Math.floor((i - 1) / 2), to: i, cls: 'dim' })
  })
  for (let d = 0; d <= upto; d++) {
    const s = 2 ** d - 1
    for (let i = s; i < 2 * s + 1 - 1; i++) edges.push({ from: i, to: i + 1, directed: true, cls: 'hl' })
  }
  return { kind: 'graph', label: '灰線 = 原本的左右孩子,箭頭 = next', nodes, edges }
}

function bfsFig(): FigStep[] {
  return [
    { note: '每個節點的 next 要指向同一層右邊的節點(最右邊的指向 null)。最直接:BFS 一層一層走,同一層裡把前一個的 next 指向後一個', views: [view(-1, [0])] },
    { note: '第 2 層:2 → 3', views: [view(1, [1, 2])] },
    { note: '第 3 層:4 → 5 → 6 → 7。用佇列,空間 O(n)', views: [view(2, [3, 4, 5, 6])] },
  ]
}

function o1Fig(): FigStep[] {
  return [
    { note: 'O(1) 空間:用「上一層已經連好的 next」當作走訪下一層的路。站在某層的節點 cur:cur.left.next = cur.right(同一個父親)', views: [view(0, [1, 2])] },
    { note: '跨父親的那一條:cur.right.next = cur.next.left(5 → 6:5 的父親是 2,2.next 是 3,3 的左孩子是 6)', views: [view(1, [4, 5])] },
    { note: '沿著 cur = cur.next 把這層走完,下一層就連好了;再從最左邊往下一層', views: [view(2)] },
  ]
}

const NODE = {
  python: `class Node:
    def __init__(self, val=0, left=None, right=None, next=None):
        self.val, self.left, self.right, self.next = val, left, right, next

`,
  c: `struct Node { int val; struct Node *left, *right, *next; };

`,
  cpp: `class Node {
public:
    int val;
    Node *left = nullptr, *right = nullptr, *next = nullptr;
    Node(int v) : val(v) {}
};

`,
  java: `class Node {
    int val;
    Node left, right, next;
    Node(int v) { val = v; }
}

`,
  javascript: `class Node {
  constructor(val, left = null, right = null, next = null) {
    Object.assign(this, { val, left, right, next });
  }
}

`,
}

const WRAP = {
  python: `

def connectLevels(level):                     # 測試用:建完美二元樹、連 next、再沿著 next 讀出每一層
    if not level:
        return []
    nodes = [Node(v) for v in level]
    for i in range(len(nodes)):
        if 2 * i + 2 < len(nodes):
            nodes[i].left, nodes[i].right = nodes[2 * i + 1], nodes[2 * i + 2]
    head, res = connect(nodes[0]), []
    while head:
        row, p = [], head
        while p:
            row.append(p.val)
            p = p.next
        res.append(row)
        head = head.left
    return res`,
  c: `

int **connectLevels(int *level, int n, int *returnSize, int **returnColumnSizes) {
    *returnSize = 0;
    int **res = malloc(32 * sizeof(int *));
    *returnColumnSizes = malloc(32 * sizeof(int));
    if (n == 0) return res;
    struct Node *nodes = calloc(n, sizeof(struct Node));
    for (int i = 0; i < n; i++) {
        nodes[i].val = level[i];
        if (2 * i + 2 < n) { nodes[i].left = &nodes[2 * i + 1]; nodes[i].right = &nodes[2 * i + 2]; }
    }
    for (struct Node *head = connect(&nodes[0]); head; head = head->left) {
        int c = 0;
        res[*returnSize] = malloc(n * sizeof(int));
        for (struct Node *p = head; p; p = p->next) res[*returnSize][c++] = p->val;
        (*returnColumnSizes)[(*returnSize)++] = c;
    }
    return res;
}`,
  cpp: `

vector<vector<int>> connectLevels(vector<int>& level) {
    vector<vector<int>> res;
    if (level.empty()) return res;
    vector<Node*> nodes;
    for (int v : level) nodes.push_back(new Node(v));
    for (size_t i = 0; 2 * i + 2 < nodes.size(); i++) { nodes[i]->left = nodes[2 * i + 1]; nodes[i]->right = nodes[2 * i + 2]; }
    for (Node *head = connect(nodes[0]); head; head = head->left) {
        res.emplace_back();
        for (Node *p = head; p; p = p->next) res.back().push_back(p->val);
    }
    return res;
}`,
  java: `

List<List<Integer>> connectLevels(int[] level) {
    List<List<Integer>> res = new ArrayList<>();
    if (level.length == 0) return res;
    Node[] nodes = new Node[level.length];
    for (int i = 0; i < level.length; i++) nodes[i] = new Node(level[i]);
    for (int i = 0; 2 * i + 2 < nodes.length; i++) { nodes[i].left = nodes[2 * i + 1]; nodes[i].right = nodes[2 * i + 2]; }
    for (Node head = connect(nodes[0]); head != null; head = head.left) {
        List<Integer> row = new ArrayList<>();
        for (Node p = head; p != null; p = p.next) row.add(p.val);
        res.add(row);
    }
    return res;
}`,
  javascript: `

function connectLevels(level) {
  if (!level.length) return [];
  const nodes = level.map((v) => new Node(v));
  nodes.forEach((x, i) => {
    if (2 * i + 2 < nodes.length) {
      x.left = nodes[2 * i + 1];
      x.right = nodes[2 * i + 2];
    }
  });
  const res = [];
  for (let head = connect(nodes[0]); head; head = head.left) {
    const row = [];
    for (let p = head; p; p = p.next) row.push(p.val);
    res.push(row);
  }
  return res;
}`,
}

export const q0116: Solution = {
  id: 116,
  plain: '一棵「完美」二元樹(每層都是滿的),每個節點多了一個 next 指標。把每個節點的 next 指向它同一層右邊的鄰居;每層最右邊的指向空。',
  statement: '給一棵**完美二元樹**(所有葉子同深度、每個父節點都有兩個孩子),填入每個節點的 `next` 指標,使其指向同層右側的下一個節點;沒有則為 null。Follow-up:只用常數額外空間。(這裡用 `connectLevels(level)` 建樹、連好後沿著 next 讀出每一層。)',
  examples: [
    { input: 'root = [1,2,3,4,5,6,7]', output: '[1,#,2,3,#,4,5,6,7,#]', note: '# 代表一層的結尾' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['節點數 ≤ 2¹² − 1', 'Follow-up:O(1) 額外空間(遞迴的堆疊不算)'],
  insight: ['「同一層右邊」→ BFS 一層一層連', '完美二元樹:同一個父親的兩個孩子 `left.next = right`;不同父親的 `right.next = parent.next.left`', '上一層連好之後,就能沿著 next 橫著走過整層 → 不需要佇列'],
  approaches: [
    {
      name: 'BFS 一層一層連',
      idea: '佇列每次處理一整層,同層前一個的 next 指向後一個。',
      steps: ['`q = [root]`', '每層:取出該層的 k 個節點,依序讓前一個的 next 指向後一個', '孩子放進佇列'],
      figure: { title: `root = [${T}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '佇列最多存一層(最後一層約 n / 2 個)。' },
      verdict: '最直觀,而且對任意二元樹([117](#/q/117))都適用。',
      code: {
        python: `${NODE.python}from collections import deque

def connect(root):
    if not root:
        return root
    q = deque([root])
    while q:
        prev = None
        for _ in range(len(q)):               # 一整層
            n = q.popleft()
            if prev:
                prev.next = n
            prev = n
            if n.left:
                q.append(n.left)
                q.append(n.right)
    return root${WRAP.python}`,
        c: `${NODE.c}struct Node *connect(struct Node *root) {
    if (!root) return root;
    struct Node *q[4096];
    int h = 0, t = 0;
    q[t++] = root;
    while (h < t) {
        int end = t;
        for (struct Node *prev = NULL; h < end; h++) {
            struct Node *n = q[h];
            if (prev) prev->next = n;
            prev = n;
            if (n->left) { q[t++] = n->left; q[t++] = n->right; }
        }
    }
    return root;
}${WRAP.c}`,
        cpp: `${NODE.cpp}Node* connect(Node* root) {
    if (!root) return root;
    queue<Node*> q;
    q.push(root);
    while (!q.empty()) {
        Node *prev = nullptr;
        for (int k = q.size(); k > 0; k--) {
            Node *n = q.front(); q.pop();
            if (prev) prev->next = n;
            prev = n;
            if (n->left) { q.push(n->left); q.push(n->right); }
        }
    }
    return root;
}${WRAP.cpp}`,
        java: `${NODE.java}Node connect(Node root) {
    if (root == null) return root;
    Deque<Node> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        Node prev = null;
        for (int k = q.size(); k > 0; k--) {
            Node n = q.poll();
            if (prev != null) prev.next = n;
            prev = n;
            if (n.left != null) { q.offer(n.left); q.offer(n.right); }
        }
    }
    return root;
}${WRAP.java}`,
        javascript: `${NODE.javascript}function connect(root) {
  if (!root) return root;
  let level = [root];
  while (level.length) {
    const next = [];
    level.forEach((n, i) => {
      n.next = level[i + 1] ?? null;
      if (n.left) next.push(n.left, n.right);
    });
    level = next;
  }
  return root;
}${WRAP.javascript}`,
      },
    },
    {
      name: '用上一層的 next 走下一層(O(1) 空間)',
      idea: '`leftmost` 從根開始;沿著這層的 next 走:`cur.left.next = cur.right`、`cur.right.next = cur.next.left`(若 cur.next 存在)。然後 `leftmost = leftmost.left`。',
      steps: ['`leftmost = root`', '`while leftmost.left`:`cur = leftmost`', '`while cur`:`cur.left.next = cur.right`;`cur.next` 存在 → `cur.right.next = cur.next.left`;`cur = cur.next`', '`leftmost = leftmost.left`'],
      figure: { title: `root = [${T}]`, steps: o1Fig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用兩個指標;上一層的 next 取代了佇列。' },
      verdict: '最推薦(Follow-up 的答案)。利用「完美」的性質:每個節點都有兩個孩子,跨父親的連結一定是 `cur.next.left`。',
      code: {
        python: `${NODE.python}def connect(root):
    leftmost = root
    while leftmost and leftmost.left:
        cur = leftmost
        while cur:                            # 沿著這層的 next 走,連好下一層
            cur.left.next = cur.right
            if cur.next:
                cur.right.next = cur.next.left
            cur = cur.next
        leftmost = leftmost.left
    return root${WRAP.python}`,
        c: `${NODE.c}struct Node *connect(struct Node *root) {
    for (struct Node *lm = root; lm && lm->left; lm = lm->left)
        for (struct Node *cur = lm; cur; cur = cur->next) {
            cur->left->next = cur->right;
            if (cur->next) cur->right->next = cur->next->left;
        }
    return root;
}${WRAP.c}`,
        cpp: `${NODE.cpp}Node* connect(Node* root) {
    for (Node *lm = root; lm && lm->left; lm = lm->left)
        for (Node *cur = lm; cur; cur = cur->next) {
            cur->left->next = cur->right;
            if (cur->next) cur->right->next = cur->next->left;
        }
    return root;
}${WRAP.cpp}`,
        java: `${NODE.java}Node connect(Node root) {
    for (Node lm = root; lm != null && lm.left != null; lm = lm.left)
        for (Node cur = lm; cur != null; cur = cur.next) {
            cur.left.next = cur.right;
            if (cur.next != null) cur.right.next = cur.next.left;
        }
    return root;
}${WRAP.java}`,
        javascript: `${NODE.javascript}function connect(root) {
  for (let lm = root; lm && lm.left; lm = lm.left)
    for (let cur = lm; cur; cur = cur.next) {
      cur.left.next = cur.right;
      if (cur.next) cur.right.next = cur.next.left;
    }
  return root;
}${WRAP.javascript}`,
      },
    },
  ],
  pitfalls: ['只連「同一個父親」的兩個孩子:5 → 6 這種跨父親的連結會漏掉', 'O(1) 版直接拿到一般二元樹([117](#/q/117))用:孩子可能缺,要改寫'],
  check: {
    kind: 'fn',
    fn: 'connectLevels',
    cases: [
      { args: [T], out: [[1], [2, 3], [4, 5, 6, 7]] },
      { args: [[]], out: [] },
      { args: [[5]], out: [[5]] },
      { args: [[1, 2, 3]], out: [[1], [2, 3]] },
    ],
  },
}
