import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 95. Unique Binary Search Trees II

function recFig(): FigStep[] {
  return [
    { note: '[96](#/q/96) 是「數有幾棵」,這題要「全部建出來」。gen(l, r) = 用 l..r 能建出的所有 BST:選每個 i 當根,左邊是 gen(l, i−1) 的每一棵、右邊是 gen(i+1, r) 的每一棵', views: [arr([1, 2, 3], { label: 'n = 3:根可以是 1、2、3' })] },
    { note: '根 1:右子樹用 {2, 3} → 有 2 種;根 2:左 {1}、右 {3} → 1 種;根 3:左子樹用 {1, 2} → 2 種', views: [tree([1, null, 2, null, 3]), tree([1, null, 3, 2]), tree([2, 1, 3])] },
    { note: '共 5 棵。l > r 時回傳 [None](一棵空樹),這樣只有一邊的情況也能正確配對', views: [tree([3, 1, null, null, 2]), tree([3, 2, null, 1])] },
  ]
}

function memoFig(): FigStep[] {
  return [
    { note: '同一個範圍 (l, r) 會被重複問很多次,例如 gen(2, 3) 在根 = 1 時用到,n 更大時還會再用到', views: [arr(['gen(1,3)', '→ gen(2,3)', '→ gen(3,3)…'], { label: '重複的子問題' })] },
    { note: '用 (l, r) 當鍵記憶化。不同的大樹可以**共用**同一棵子樹物件(題目只讀不改)', views: [arr([1, 1, 2, 5, 14, 42], { label: 'n = 0..5 的棵數(卡塔蘭數)' })] },
  ]
}

const CHECK = {
  python: `

def countBSTs(n):                             # 測試用:檢查每棵都是 1..n 的 BST、而且互不相同
    trees = generateTrees(n)
    def inorder(t):
        return inorder(t.left) + [t.val] + inorder(t.right) if t else []
    def shape(t):
        return '(' + shape(t.left) + str(t.val) + shape(t.right) + ')' if t else '.'
    ok = all(inorder(t) == list(range(1, n + 1)) for t in trees)
    return len({shape(t) for t in trees}) if ok else -1`,
  c: `

static void inorderTo(struct TreeNode *t, int *a, int *k) {
    if (!t) return;
    inorderTo(t->left, a, k); a[(*k)++] = t->val; inorderTo(t->right, a, k);
}
static void shapeTo(struct TreeNode *t, char *s, int *k) {
    if (!t) { s[(*k)++] = '.'; return; }
    s[(*k)++] = '('; shapeTo(t->left, s, k);
    *k += sprintf(s + *k, "%d", t->val);
    shapeTo(t->right, s, k); s[(*k)++] = ')';
}
static int cmpS(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }

int countBSTs(int n) {
    int cnt;
    struct TreeNode **ts = generateTrees(n, &cnt);
    char **shapes = malloc(cnt * sizeof(char *));
    for (int i = 0; i < cnt; i++) {
        int a[10], k = 0;
        inorderTo(ts[i], a, &k);
        if (k != n) return -1;
        for (int j = 0; j < n; j++) if (a[j] != j + 1) return -1;
        shapes[i] = malloc(128);
        k = 0;
        shapeTo(ts[i], shapes[i], &k);
        shapes[i][k] = '\\0';
    }
    qsort(shapes, cnt, sizeof(char *), cmpS);
    int distinct = 0;
    for (int i = 0; i < cnt; i++) if (i == 0 || strcmp(shapes[i], shapes[i - 1])) distinct++;
    return distinct;
}`,
  cpp: `

void inorderTo(TreeNode *t, vector<int> &a) { if (!t) return; inorderTo(t->left, a); a.push_back(t->val); inorderTo(t->right, a); }
string shape(TreeNode *t) { return t ? "(" + shape(t->left) + to_string(t->val) + shape(t->right) + ")" : "."; }

int countBSTs(int n) {
    auto ts = generateTrees(n);
    set<string> shapes;
    for (auto t : ts) {
        vector<int> a;
        inorderTo(t, a);
        for (int j = 0; j < n; j++) if ((int)a.size() != n || a[j] != j + 1) return -1;
        shapes.insert(shape(t));
    }
    return shapes.size();
}`,
  java: `

private void inorderTo(TreeNode t, List<Integer> a) { if (t == null) return; inorderTo(t.left, a); a.add(t.val); inorderTo(t.right, a); }
private String shape(TreeNode t) { return t == null ? "." : "(" + shape(t.left) + t.val + shape(t.right) + ")"; }

int countBSTs(int n) {
    Set<String> shapes = new HashSet<>();
    for (TreeNode t : generateTrees(n)) {
        List<Integer> a = new ArrayList<>();
        inorderTo(t, a);
        if (a.size() != n) return -1;
        for (int j = 0; j < n; j++) if (a.get(j) != j + 1) return -1;
        shapes.add(shape(t));
    }
    return shapes.size();
}`,
  javascript: `

function countBSTs(n) {
  const inorder = (t) => (t ? [...inorder(t.left), t.val, ...inorder(t.right)] : []);
  const shape = (t) => (t ? '(' + shape(t.left) + t.val + shape(t.right) + ')' : '.');
  const ts = generateTrees(n);
  if (!ts.every((t) => inorder(t).join() === Array.from({ length: n }, (_, i) => i + 1).join())) return -1;
  return new Set(ts.map(shape)).size;
}`,
}

export const q0095: Solution = {
  id: 95,
  plain: '用 1 到 n 這 n 個數字組出所有「長得不一樣」的二元搜尋樹,一棵一棵列出來(不是只數有幾棵)。',
  statement: '給整數 `n`,回傳所有由 1..n 組成、結構不同的**二元搜尋樹**(順序不限)。(這裡用 `countBSTs(n)` 檢查每棵的中序都是 1..n、而且彼此不同,回傳棵數。)',
  examples: [
    { input: 'n = 3', output: '[[1,null,2,null,3],[1,null,3,2],[2,1,3],[3,1,null,null,2],[3,2,null,1]]' },
    { input: 'n = 1', output: '[[1]]' },
  ],
  constraints: ['1 ≤ n ≤ 8 → 最多 1430 棵'],
  insight: ['選 i 當根,左邊用 l..i−1、右邊用 i+1..r', '左邊的所有可能 × 右邊的所有可能,兩兩組合', '空範圍回傳「一棵空樹」[None],組合時才不會漏掉只有一邊的情況'],
  approaches: [
    {
      name: '遞迴生成',
      idea: '`gen(l, r)`:`l > r` → [None];否則對每個 i:`for L in gen(l, i−1)`、`for R in gen(i+1, r)`:`TreeNode(i, L, R)`。',
      steps: ['`gen(l, r)`:`l > r` → 回傳 `[None]`', '`for i in l..r`:左邊清單 × 右邊清單,每對建一個新根 i', '回傳 `gen(1, n)`'],
      figure: { title: 'n = 3', steps: recFig() },
      complexity: { time: 'O(n · Cₙ)', space: 'O(n · Cₙ)', why: 'Cₙ 是卡塔蘭數(n = 8 時 1430),每棵樹 n 個節點。' },
      verdict: '最推薦,和 [894](#/q/894) 同一個「根 × 左右所有可能」的套路。',
      code: {
        python: `def generateTrees(n):
    def gen(l, r):
        if l > r:
            return [None]                     # 一棵空樹(不是沒有樹)
        res = []
        for i in range(l, r + 1):
            for L in gen(l, i - 1):
                for R in gen(i + 1, r):
                    res.append(TreeNode(i, L, R))
        return res
    return gen(1, n)${CHECK.python}`,
        c: `static struct TreeNode **gen(int l, int r, int *size) {
    if (l > r) {
        struct TreeNode **one = malloc(sizeof *one);
        one[0] = NULL;
        *size = 1;
        return one;
    }
    struct TreeNode **res = NULL;
    int c = 0, cap = 0;
    for (int i = l; i <= r; i++) {
        int ln, rn;
        struct TreeNode **L = gen(l, i - 1, &ln), **R = gen(i + 1, r, &rn);
        for (int a = 0; a < ln; a++)
            for (int b = 0; b < rn; b++) {
                if (c == cap) res = realloc(res, (cap = cap * 2 + 4) * sizeof *res);
                struct TreeNode *t = malloc(sizeof *t);
                t->val = i; t->left = L[a]; t->right = R[b];
                res[c++] = t;
            }
    }
    *size = c;
    return res;
}

struct TreeNode **generateTrees(int n, int *returnSize) { return gen(1, n, returnSize); }${CHECK.c}`,
        cpp: `vector<TreeNode*> gen(int l, int r) {
    if (l > r) return {nullptr};
    vector<TreeNode*> res;
    for (int i = l; i <= r; i++)
        for (TreeNode *L : gen(l, i - 1))
            for (TreeNode *R : gen(i + 1, r)) res.push_back(new TreeNode(i, L, R));
    return res;
}

vector<TreeNode*> generateTrees(int n) { return gen(1, n); }${CHECK.cpp}`,
        java: `List<TreeNode> generateTrees(int n) { return gen(1, n); }

private List<TreeNode> gen(int l, int r) {
    List<TreeNode> res = new ArrayList<>();
    if (l > r) { res.add(null); return res; }
    for (int i = l; i <= r; i++)
        for (TreeNode L : gen(l, i - 1))
            for (TreeNode R : gen(i + 1, r)) res.add(new TreeNode(i, L, R));
    return res;
}${CHECK.java}`,
        javascript: `function generateTrees(n) {
  const gen = (l, r) => {
    if (l > r) return [null];
    const res = [];
    for (let i = l; i <= r; i++) for (const L of gen(l, i - 1)) for (const R of gen(i + 1, r)) res.push(new TreeNode(i, L, R));
    return res;
  };
  return gen(1, n);
}${CHECK.javascript}`,
      },
    },
    {
      name: '遞迴 + 記憶化(共用子樹)',
      idea: '同上,但把 `gen(l, r)` 的結果用 (l, r) 記起來;不同的大樹共用同一批子樹物件。',
      steps: ['`memo[(l, r)]` 有就直接回傳', '否則照方法一組合,存進 memo', '回傳 `gen(1, n)`'],
      figure: { title: 'n = 3', steps: memoFig() },
      complexity: { time: 'O(n · Cₙ)', space: 'O(n · Cₙ)', why: '輸出本身就這麼大;記憶化省下重複的子樹生成。' },
      verdict: '少建很多重複的子樹。代價是不同的答案共用節點,如果之後會修改其中一棵就要先複製。',
      code: {
        python: `def generateTrees(n):
    memo = {}

    def gen(l, r):
        if l > r:
            return [None]
        if (l, r) in memo:
            return memo[(l, r)]
        res = [TreeNode(i, L, R)
               for i in range(l, r + 1)
               for L in gen(l, i - 1)
               for R in gen(i + 1, r)]
        memo[(l, r)] = res
        return res

    return gen(1, n)${CHECK.python}`,
        c: `static struct TreeNode **memo_[10][10];
static int cnt_[10][10];

static struct TreeNode **gen(int l, int r, int *size) {
    if (l > r) {
        static struct TreeNode *none[1] = {NULL};
        *size = 1;
        return none;
    }
    if (memo_[l][r]) { *size = cnt_[l][r]; return memo_[l][r]; }
    struct TreeNode **res = NULL;
    int c = 0, cap = 0;
    for (int i = l; i <= r; i++) {
        int ln, rn;
        struct TreeNode **L = gen(l, i - 1, &ln), **R = gen(i + 1, r, &rn);
        for (int a = 0; a < ln; a++)
            for (int b = 0; b < rn; b++) {
                if (c == cap) res = realloc(res, (cap = cap * 2 + 4) * sizeof *res);
                struct TreeNode *t = malloc(sizeof *t);
                t->val = i; t->left = L[a]; t->right = R[b];
                res[c++] = t;
            }
    }
    memo_[l][r] = res; cnt_[l][r] = c;
    *size = c;
    return res;
}

struct TreeNode **generateTrees(int n, int *returnSize) {
    memset(memo_, 0, sizeof memo_);
    return gen(1, n, returnSize);
}${CHECK.c}`,
        cpp: `map<pair<int, int>, vector<TreeNode*>> memo;

vector<TreeNode*> gen(int l, int r) {
    if (l > r) return {nullptr};
    auto it = memo.find({l, r});
    if (it != memo.end()) return it->second;
    vector<TreeNode*> res;
    for (int i = l; i <= r; i++)
        for (TreeNode *L : gen(l, i - 1))
            for (TreeNode *R : gen(i + 1, r)) res.push_back(new TreeNode(i, L, R));
    return memo[{l, r}] = res;
}

vector<TreeNode*> generateTrees(int n) {
    memo.clear();
    return gen(1, n);
}${CHECK.cpp}`,
        java: `private Map<Integer, List<TreeNode>> memo;

List<TreeNode> generateTrees(int n) {
    memo = new HashMap<>();
    return gen(1, n);
}

private List<TreeNode> gen(int l, int r) {
    List<TreeNode> res = new ArrayList<>();
    if (l > r) { res.add(null); return res; }
    int key = l * 16 + r;
    if (memo.containsKey(key)) return memo.get(key);
    for (int i = l; i <= r; i++)
        for (TreeNode L : gen(l, i - 1))
            for (TreeNode R : gen(i + 1, r)) res.add(new TreeNode(i, L, R));
    memo.put(key, res);
    return res;
}${CHECK.java}`,
        javascript: `function generateTrees(n) {
  const memo = new Map();
  const gen = (l, r) => {
    if (l > r) return [null];
    const key = l * 16 + r;
    if (memo.has(key)) return memo.get(key);
    const res = [];
    for (let i = l; i <= r; i++) for (const L of gen(l, i - 1)) for (const R of gen(i + 1, r)) res.push(new TreeNode(i, L, R));
    memo.set(key, res);
    return res;
  };
  return gen(1, n);
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['空範圍回傳 []:左右任一邊是空的時,乘積會變成 0 棵,樹就全部漏掉了', '共用子樹之後又修改其中一棵:其他棵會一起被改'],
  check: {
    kind: 'fn',
    fn: 'countBSTs',
    cases: [
      { args: [1], out: 1 },
      { args: [3], out: 5 },
      { args: [4], out: 14 },
      { args: [8], out: 1430 },
    ],
  },
}
