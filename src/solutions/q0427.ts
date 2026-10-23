import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 427. Construct Quad Tree

const G = [
  [1, 1, 0, 0],
  [1, 1, 0, 0],
  [1, 1, 1, 0],
  [1, 1, 0, 1],
]

function gv(label: string, marks: Record<string, [number, number][]> = {}): GridViewData {
  return { kind: 'grid', label, cells: G.map((r) => [...r]), marks }
}

function box(r0: number, c0: number, n: number): [number, number][] {
  const out: [number, number][] = []
  for (let r = r0; r < r0 + n; r++) for (let c = c0; c < c0 + n; c++) out.push([r, c])
  return out
}

function topFig(): FigStep[] {
  return [
    { note: '四分樹:如果整塊的值都一樣,就是一個葉子(isLeaf = true、val = 那個值);否則切成四等份(左上、右上、左下、右下),各自再做一次', views: [gv('4 × 4 的格子')] },
    { note: '整塊有 0 也有 1 → 切四塊。左上 2×2 全是 1 → 葉子(1);右上全是 0 → 葉子(0);左下全是 1 → 葉子(1)', views: [gv('實心 = 全是 1 的葉子,外框 = 全是 0 的葉子,右下還沒決定', { hl: [...box(0, 0, 2), ...box(2, 0, 2)], cmp: box(0, 2, 2) })] },
    { note: '右下 [[1,0],[0,1]] 不一樣 → 再切成四個 1×1,每個都是葉子', views: [gv('右下再切', { hl: box(2, 2, 2) })] },
    { note: '直接檢查「整塊是否一樣」要看 n² 格,每一層都要看 → O(n² log n)', views: [gv('結果:根(非葉)→ 4 個孩子,右下那個再有 4 個葉子', { done: box(0, 0, 4) })] },
  ]
}

function bottomFig(): FigStep[] {
  return [
    { note: '由下往上:先把四個孩子都建好,再看「四個孩子是不是都是葉子、而且值一樣」→ 是的話就合併成一個葉子', views: [gv('左上的四個 1×1 都是 1 → 合併成一個葉子', { done: box(0, 0, 2) })] },
    { note: '這樣每格只看一次,不用重複檢查整塊 → O(n²)', views: [gv('右下四個值不同 → 保留成非葉節點', { hl: box(2, 2, 2) })] },
  ]
}

const ENCODE = {
  python: `

def quadEncode(grid):                         # 測試用:前序編碼,葉子 = 10 + val,非葉 = 1
    out = []
    def walk(n):
        if n.isLeaf:
            out.append(10 + int(n.val))
            return
        out.append(1)
        for c in (n.topLeft, n.topRight, n.bottomLeft, n.bottomRight):
            walk(c)
    walk(construct(grid))
    return out`,
  c: `

static void walkQ(struct Node *n, int *out, int *k) {
    if (n->isLeaf) { out[(*k)++] = 10 + n->val; return; }
    out[(*k)++] = 1;
    walkQ(n->topLeft, out, k); walkQ(n->topRight, out, k);
    walkQ(n->bottomLeft, out, k); walkQ(n->bottomRight, out, k);
}

int *quadEncode(int **grid, int gridSize, int *gridColSize, int *returnSize) {
    int *out = malloc(4 * gridSize * gridSize * sizeof(int) + 8);
    *returnSize = 0;
    walkQ(construct(grid, gridSize, gridColSize), out, returnSize);
    return out;
}`,
  cpp: `

void walkQ(Node *n, vector<int> &out) {
    if (n->isLeaf) { out.push_back(10 + n->val); return; }
    out.push_back(1);
    walkQ(n->topLeft, out); walkQ(n->topRight, out);
    walkQ(n->bottomLeft, out); walkQ(n->bottomRight, out);
}

vector<int> quadEncode(vector<vector<int>>& grid) {
    vector<int> out;
    walkQ(construct(grid), out);
    return out;
}`,
  java: `

private void walkQ(Node n, List<Integer> out) {
    if (n.isLeaf) { out.add(10 + (n.val ? 1 : 0)); return; }
    out.add(1);
    walkQ(n.topLeft, out); walkQ(n.topRight, out);
    walkQ(n.bottomLeft, out); walkQ(n.bottomRight, out);
}

List<Integer> quadEncode(int[][] grid) {
    List<Integer> out = new ArrayList<>();
    walkQ(construct(grid), out);
    return out;
}`,
  javascript: `

function quadEncode(grid) {
  const out = [];
  const walk = (n) => {
    if (n.isLeaf) return void out.push(10 + (n.val ? 1 : 0));
    out.push(1);
    [n.topLeft, n.topRight, n.bottomLeft, n.bottomRight].forEach(walk);
  };
  walk(construct(grid));
  return out;
}`,
}

const NODE = {
  python: `class Node:
    def __init__(self, val, isLeaf, topLeft=None, topRight=None, bottomLeft=None, bottomRight=None):
        self.val, self.isLeaf = val, isLeaf
        self.topLeft, self.topRight = topLeft, topRight
        self.bottomLeft, self.bottomRight = bottomLeft, bottomRight

`,
  c: `struct Node {
    bool val, isLeaf;
    struct Node *topLeft, *topRight, *bottomLeft, *bottomRight;
};

static struct Node *mk(bool val, bool leaf, struct Node *a, struct Node *b, struct Node *c, struct Node *d) {
    struct Node *n = malloc(sizeof *n);
    n->val = val; n->isLeaf = leaf;
    n->topLeft = a; n->topRight = b; n->bottomLeft = c; n->bottomRight = d;
    return n;
}

`,
  cpp: `class Node {
public:
    bool val, isLeaf;
    Node *topLeft, *topRight, *bottomLeft, *bottomRight;
    Node(bool v, bool l, Node *a = nullptr, Node *b = nullptr, Node *c = nullptr, Node *d = nullptr)
        : val(v), isLeaf(l), topLeft(a), topRight(b), bottomLeft(c), bottomRight(d) {}
};

`,
  java: `class Node {
    boolean val, isLeaf;
    Node topLeft, topRight, bottomLeft, bottomRight;
    Node(boolean v, boolean l, Node a, Node b, Node c, Node d) { val = v; isLeaf = l; topLeft = a; topRight = b; bottomLeft = c; bottomRight = d; }
}

`,
  javascript: `class Node {
  constructor(val, isLeaf, topLeft = null, topRight = null, bottomLeft = null, bottomRight = null) {
    Object.assign(this, { val, isLeaf, topLeft, topRight, bottomLeft, bottomRight });
  }
}

`,
}

export const q0427: Solution = {
  id: 427,
  plain: '把一張只有 0 和 1 的正方形格子壓縮成「四分樹」:如果一整塊顏色都一樣,就用一個節點代表;不一樣就切成四等份,每份再各自處理。',
  statement: '給 n × n 的 0/1 矩陣 `grid`(n 是 2 的次方),建立代表它的**四分樹**:每個節點有 `val`、`isLeaf` 和四個孩子(左上、右上、左下、右下)。整塊值相同時為葉子,否則切成四個子區塊遞迴。(這裡用 `quadEncode(grid)` 把樹轉成前序編碼:葉子 = 10 + val、非葉 = 1。)',
  examples: [
    { input: 'grid = [[0,1],[1,0]]', output: '[[0,1],[1,0],[1,1],[1,1],[1,0]]', note: '根不是葉子,四個孩子都是葉子' },
    { input: 'grid = [[1,1],[1,1]]', output: '[[1,1]]' },
  ],
  constraints: ['n = 2ˣ,0 ≤ x ≤ 6'],
  insight: ['典型的分治:整塊一樣 → 葉子;否則切四塊各自遞迴', '由上往下:每一層都要檢查整塊是否一樣,O(n² log n)', '由下往上:先建好四個孩子,四個都是同值葉子就合併 → O(n²)'],
  approaches: [
    {
      name: '由上往下:先檢查整塊再切',
      idea: '`build(r, c, n)`:區塊全部一樣 → 葉子;否則四個象限各自 `build(…, n/2)`。',
      steps: ['檢查 `grid[r..r+n)[c..c+n)` 是否全部等於 `grid[r][c]`', '是 → `Node(val, True)`', '否 → `h = n // 2`;四個孩子 `build(r, c, h)`、`build(r, c+h, h)`、`build(r+h, c, h)`、`build(r+h, c+h, h)`'],
      figure: { title: '4 × 4 的格子', steps: topFig() },
      complexity: { time: 'O(n² log n)', space: 'O(log n)', why: '每一層所有區塊加起來檢查 n² 格,共 log n 層。' },
      verdict: '最直觀,直接照定義寫。',
      code: {
        python: `${NODE.python}def construct(grid):
    def build(r, c, n):
        v = grid[r][c]
        if all(grid[i][j] == v for i in range(r, r + n) for j in range(c, c + n)):
            return Node(v == 1, True)         # 整塊一樣:葉子
        h = n // 2
        return Node(True, False, build(r, c, h), build(r, c + h, h),
                    build(r + h, c, h), build(r + h, c + h, h))
    return build(0, 0, len(grid))${ENCODE.python}`,
        c: `${NODE.c}static int **G_;

static struct Node *build(int r, int c, int n) {
    bool same = true;
    for (int i = r; i < r + n && same; i++)
        for (int j = c; j < c + n; j++) if (G_[i][j] != G_[r][c]) { same = false; break; }
    if (same) return mk(G_[r][c], true, NULL, NULL, NULL, NULL);
    int h = n / 2;
    return mk(true, false, build(r, c, h), build(r, c + h, h), build(r + h, c, h), build(r + h, c + h, h));
}

struct Node *construct(int **grid, int gridSize, int *gridColSize) {
    G_ = grid;
    return build(0, 0, gridSize);
}${ENCODE.c}`,
        cpp: `${NODE.cpp}Node* build(vector<vector<int>> &g, int r, int c, int n) {
    for (int i = r; i < r + n; i++)
        for (int j = c; j < c + n; j++)
            if (g[i][j] != g[r][c]) {
                int h = n / 2;
                return new Node(true, false, build(g, r, c, h), build(g, r, c + h, h), build(g, r + h, c, h), build(g, r + h, c + h, h));
            }
    return new Node(g[r][c] == 1, true);
}

Node* construct(vector<vector<int>>& grid) { return build(grid, 0, 0, grid.size()); }${ENCODE.cpp}`,
        java: `${NODE.java}Node construct(int[][] grid) { return build(grid, 0, 0, grid.length); }

private Node build(int[][] g, int r, int c, int n) {
    for (int i = r; i < r + n; i++)
        for (int j = c; j < c + n; j++)
            if (g[i][j] != g[r][c]) {
                int h = n / 2;
                return new Node(true, false, build(g, r, c, h), build(g, r, c + h, h), build(g, r + h, c, h), build(g, r + h, c + h, h));
            }
    return new Node(g[r][c] == 1, true, null, null, null, null);
}${ENCODE.java}`,
        javascript: `${NODE.javascript}function construct(grid) {
  const build = (r, c, n) => {
    for (let i = r; i < r + n; i++)
      for (let j = c; j < c + n; j++)
        if (grid[i][j] !== grid[r][c]) {
          const h = n >> 1;
          return new Node(true, false, build(r, c, h), build(r, c + h, h), build(r + h, c, h), build(r + h, c + h, h));
        }
    return new Node(grid[r][c] === 1, true);
  };
  return build(0, 0, grid.length);
}${ENCODE.javascript}`,
      },
    },
    {
      name: '由下往上:先建孩子再合併',
      idea: '`build(r, c, n)`:n == 1 → 葉子;否則先建四個孩子,四個都是葉子且值相同 → 合併成一個葉子。',
      steps: ['n == 1 → `Node(grid[r][c], True)`', '建四個孩子 a、b、c、d', '四個都是葉子而且 val 一樣 → 回傳 `Node(a.val, True)`', '否則回傳 `Node(True, False, a, b, c, d)`'],
      figure: { title: '4 × 4 的格子', steps: bottomFig() },
      complexity: { time: 'O(n²)', space: 'O(log n)', why: '每格只在 n = 1 那層被讀一次;每個節點合併判斷 O(1)。' },
      verdict: '最推薦(最快)。分治時「子問題的答案已經包含需要的資訊」,就不必再回頭檢查。',
      code: {
        python: `${NODE.python}def construct(grid):
    def build(r, c, n):
        if n == 1:
            return Node(grid[r][c] == 1, True)
        h = n // 2
        kids = [build(r, c, h), build(r, c + h, h), build(r + h, c, h), build(r + h, c + h, h)]
        if all(k.isLeaf for k in kids) and len({k.val for k in kids}) == 1:
            return Node(kids[0].val, True)    # 四個同值葉子:合併
        return Node(True, False, *kids)
    return build(0, 0, len(grid))${ENCODE.python}`,
        c: `${NODE.c}static int **G_;

static struct Node *build(int r, int c, int n) {
    if (n == 1) return mk(G_[r][c], true, NULL, NULL, NULL, NULL);
    int h = n / 2;
    struct Node *a = build(r, c, h), *b = build(r, c + h, h), *x = build(r + h, c, h), *d = build(r + h, c + h, h);
    if (a->isLeaf && b->isLeaf && x->isLeaf && d->isLeaf && a->val == b->val && b->val == x->val && x->val == d->val) {
        bool v = a->val;
        free(a); free(b); free(x); free(d);
        return mk(v, true, NULL, NULL, NULL, NULL);
    }
    return mk(true, false, a, b, x, d);
}

struct Node *construct(int **grid, int gridSize, int *gridColSize) {
    G_ = grid;
    return build(0, 0, gridSize);
}${ENCODE.c}`,
        cpp: `${NODE.cpp}Node* build(vector<vector<int>> &g, int r, int c, int n) {
    if (n == 1) return new Node(g[r][c] == 1, true);
    int h = n / 2;
    Node *a = build(g, r, c, h), *b = build(g, r, c + h, h), *x = build(g, r + h, c, h), *d = build(g, r + h, c + h, h);
    if (a->isLeaf && b->isLeaf && x->isLeaf && d->isLeaf && a->val == b->val && b->val == x->val && x->val == d->val)
        return new Node(a->val, true);
    return new Node(true, false, a, b, x, d);
}

Node* construct(vector<vector<int>>& grid) { return build(grid, 0, 0, grid.size()); }${ENCODE.cpp}`,
        java: `${NODE.java}Node construct(int[][] grid) { return build(grid, 0, 0, grid.length); }

private Node build(int[][] g, int r, int c, int n) {
    if (n == 1) return new Node(g[r][c] == 1, true, null, null, null, null);
    int h = n / 2;
    Node a = build(g, r, c, h), b = build(g, r, c + h, h), x = build(g, r + h, c, h), d = build(g, r + h, c + h, h);
    if (a.isLeaf && b.isLeaf && x.isLeaf && d.isLeaf && a.val == b.val && b.val == x.val && x.val == d.val)
        return new Node(a.val, true, null, null, null, null);
    return new Node(true, false, a, b, x, d);
}${ENCODE.java}`,
        javascript: `${NODE.javascript}function construct(grid) {
  const build = (r, c, n) => {
    if (n === 1) return new Node(grid[r][c] === 1, true);
    const h = n >> 1;
    const k = [build(r, c, h), build(r, c + h, h), build(r + h, c, h), build(r + h, c + h, h)];
    if (k.every((x) => x.isLeaf && x.val === k[0].val)) return new Node(k[0].val, true);
    return new Node(true, false, ...k);
  };
  return build(0, 0, grid.length);
}${ENCODE.javascript}`,
      },
    },
  ],
  pitfalls: ['四個孩子的順序固定是:左上、右上、左下、右下', '合併時只檢查值相同、沒檢查四個都是葉子:非葉節點的 val 沒有意義'],
  check: {
    kind: 'fn',
    fn: 'quadEncode',
    cases: [
      { args: [[[0, 1], [1, 0]]], out: [1, 10, 11, 11, 10] },
      { args: [[[1, 1], [1, 1]]], out: [11] },
      { args: [G], out: [1, 11, 10, 11, 1, 11, 10, 10, 11] },
      { args: [[[0]]], out: [10] },
    ],
  },
}
