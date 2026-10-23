import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 173. Binary Search Tree Iterator

const T = [7, 3, 15, null, null, 9, 20]

function stackFig(): FigStep[] {
  return [
    { note: '迭代器要能「一次吐一個」中序的下一個值。用 [94](#/q/94) 迭代中序的堆疊:建構時從根一路往左 push', views: [tree(T, { cls: { 0: 'cur', 1: 'hl' } }), arr([7, 3], { label: '堆疊(右邊是頂)' })] },
    { note: 'next():pop 出頂端 3(目前最小)回傳;如果它有右子樹,就從右孩子一路往左 push。3 沒有右子樹', views: [tree(T, { cls: { 1: 'done', 0: 'hl' } }), arr([7], { label: '堆疊' })] },
    { note: 'next() → 7,然後從 15 一路往左 push:15、9。hasNext() = 堆疊不空', views: [tree(T, { cls: { 1: 'done', 0: 'done', 2: 'cur', 5: 'hl' } }), arr([15, 9], { label: '堆疊' })] },
    { note: '每個節點 push、pop 各一次 → next() 平均 O(1),堆疊最多 O(h)', views: [arr([3, 7, 9, 15, 20], { label: '依序吐出', done: [0, 1, 2, 3, 4] })] },
  ]
}

function arrFig(): FigStep[] {
  return [
    { note: '簡單版:建構時把整棵樹中序走訪存成陣列,用一個指標 i', views: [arr([3, 7, 9, 15, 20], { label: '中序陣列', pointers: [{ name: 'i', index: 0 }] })] },
    { note: 'next() 回傳 a[i] 再 i + 1;hasNext() 是 i < n。每次都 O(1),但要 O(n) 空間', views: [arr([3, 7, 9, 15, 20], { label: '中序陣列', done: [0, 1], pointers: [{ name: 'i', index: 2 }] })] },
  ]
}

const WRAP = {
  python: `

def bstIterate(root):                         # 測試用:一直呼叫 next 直到 hasNext 為 False
    it, out = BSTIterator(root), []
    while it.hasNext():
        out.append(it.next())
    return out`,
  c: `

int *bstIterate(struct TreeNode *root, int *returnSize) {
    BSTIterator *it = bSTIteratorCreate(root);
    int *out = malloc(100005 * sizeof(int));
    *returnSize = 0;
    while (bSTIteratorHasNext(it)) out[(*returnSize)++] = bSTIteratorNext(it);
    bSTIteratorFree(it);
    return out;
}`,
  cpp: `

vector<int> bstIterate(TreeNode* root) {
    BSTIterator it(root);
    vector<int> out;
    while (it.hasNext()) out.push_back(it.next());
    return out;
}`,
  java: `

List<Integer> bstIterate(TreeNode root) {
    BSTIterator it = new BSTIterator(root);
    List<Integer> out = new ArrayList<>();
    while (it.hasNext()) out.add(it.next());
    return out;
}`,
  javascript: `

function bstIterate(root) {
  const it = new BSTIterator(root), out = [];
  while (it.hasNext()) out.push(it.next());
  return out;
}`,
}

export const q0173: Solution = {
  id: 173,
  plain: '做一個「BST 迭代器」:每呼叫一次 next(),就依序回傳樹裡下一個(由小到大)的數字;hasNext() 回答後面還有沒有。不能一開始就把整棵樹讀完放著(Follow-up)。',
  statement: '設計 `BSTIterator(root)`:`next()` 回傳中序走訪的下一個數;`hasNext()` 回傳是否還有下一個。Follow-up:`next()`、`hasNext()` 平均 O(1) 時間、O(h) 空間。(這裡用 `bstIterate(root)` 一直呼叫 next 直到結束,比對吐出的順序。)',
  examples: [
    { input: '["BSTIterator","next","next","hasNext","next","hasNext","next","hasNext","next","hasNext"]\n[[[7,3,15,null,null,9,20]],[],[],[],[],[],[],[],[],[]]', output: '[null,3,7,true,9,true,15,true,20,false]' },
  ],
  constraints: ['節點數 ≤ 10⁵', 'Follow-up:O(h) 空間'],
  insight: ['BST 由小到大 = 中序走訪', '把迭代版中序([94](#/q/94))「暫停」在每次輸出的地方:堆疊就是暫停時的狀態', 'next():pop 一個,再把它右子樹的「左邊一路」push 進去'],
  approaches: [
    {
      name: '受控的中序堆疊(O(h) 空間)',
      idea: '建構時 `pushLeft(root)`;next():`n = pop()`、`pushLeft(n.right)`、回傳 n.val;hasNext():堆疊不空。',
      steps: ['`pushLeft(x)`:`while x`:push x、`x = x.left`', '建構:`pushLeft(root)`', 'next:`n = st.pop()`;`pushLeft(n.right)`;回傳 `n.val`', 'hasNext:`len(st) > 0`'],
      figure: { title: `root = [${T}]`, steps: stackFig() },
      complexity: { time: 'next 平均 O(1)、hasNext O(1)', space: 'O(h)', why: '每個節點 push / pop 各一次,分攤到 n 次 next;堆疊最多一條路徑。' },
      verdict: '最推薦(Follow-up 的答案)。迭代器 = 把走訪的過程切成一段一段。',
      code: {
        python: `class BSTIterator:
    def __init__(self, root):
        self.st = []
        self._push_left(root)

    def _push_left(self, x):                  # 一路往左,沿途都還沒輸出
        while x:
            self.st.append(x)
            x = x.left

    def next(self):
        n = self.st.pop()                     # 目前最小的
        self._push_left(n.right)              # 它的右子樹接著輸出
        return n.val

    def hasNext(self):
        return bool(self.st)${WRAP.python}`,
        c: `typedef struct { struct TreeNode **st; int top; } BSTIterator;

static void pushLeft(BSTIterator *o, struct TreeNode *x) {
    for (; x; x = x->left) o->st[o->top++] = x;
}

BSTIterator *bSTIteratorCreate(struct TreeNode *root) {
    BSTIterator *o = malloc(sizeof(BSTIterator));
    o->st = malloc(100005 * sizeof(struct TreeNode *));
    o->top = 0;
    pushLeft(o, root);
    return o;
}

int bSTIteratorNext(BSTIterator *o) {
    struct TreeNode *n = o->st[--o->top];
    pushLeft(o, n->right);
    return n->val;
}

bool bSTIteratorHasNext(BSTIterator *o) { return o->top > 0; }

void bSTIteratorFree(BSTIterator *o) { free(o->st); free(o); }${WRAP.c}`,
        cpp: `class BSTIterator {
    stack<TreeNode*> st;
    void pushLeft(TreeNode *x) { for (; x; x = x->left) st.push(x); }
public:
    BSTIterator(TreeNode* root) { pushLeft(root); }

    int next() {
        TreeNode *n = st.top(); st.pop();
        pushLeft(n->right);
        return n->val;
    }

    bool hasNext() { return !st.empty(); }
};${WRAP.cpp}`,
        java: `class BSTIterator {
    private final Deque<TreeNode> st = new ArrayDeque<>();

    public BSTIterator(TreeNode root) { pushLeft(root); }

    private void pushLeft(TreeNode x) { for (; x != null; x = x.left) st.push(x); }

    public int next() {
        TreeNode n = st.pop();
        pushLeft(n.right);
        return n.val;
    }

    public boolean hasNext() { return !st.isEmpty(); }
}${WRAP.java}`,
        javascript: `class BSTIterator {
  constructor(root) {
    this.st = [];
    this.pushLeft(root);
  }

  pushLeft(x) {
    for (; x; x = x.left) this.st.push(x);
  }

  next() {
    const n = this.st.pop();
    this.pushLeft(n.right);
    return n.val;
  }

  hasNext() {
    return this.st.length > 0;
  }
}${WRAP.javascript}`,
      },
    },
    {
      name: '先把中序存成陣列',
      idea: '建構時中序走訪整棵樹存進陣列,next / hasNext 只移動索引。',
      steps: ['建構:中序走訪 → `a`、`i = 0`', 'next:`i += 1`,回傳 `a[i − 1]`', 'hasNext:`i < len(a)`'],
      figure: { title: `root = [${T}]`, steps: arrFig() },
      complexity: { time: '建構 O(n),next / hasNext O(1)', space: 'O(n)', why: '存下整個中序。' },
      verdict: '最簡單,但不符合 O(h) 空間;如果樹在迭代途中可能改變,也會拿到舊資料。',
      code: {
        python: `class BSTIterator:
    def __init__(self, root):
        self.a, self.i = [], 0
        def inorder(n):
            if n:
                inorder(n.left)
                self.a.append(n.val)
                inorder(n.right)
        inorder(root)

    def next(self):
        self.i += 1
        return self.a[self.i - 1]

    def hasNext(self):
        return self.i < len(self.a)${WRAP.python}`,
        c: `typedef struct { int *a, n, i; } BSTIterator;

static void inorder(struct TreeNode *t, int *a, int *n) {
    if (!t) return;
    inorder(t->left, a, n);
    a[(*n)++] = t->val;
    inorder(t->right, a, n);
}

BSTIterator *bSTIteratorCreate(struct TreeNode *root) {
    BSTIterator *o = malloc(sizeof(BSTIterator));
    o->a = malloc(100005 * sizeof(int));
    o->n = o->i = 0;
    inorder(root, o->a, &o->n);
    return o;
}

int bSTIteratorNext(BSTIterator *o) { return o->a[o->i++]; }
bool bSTIteratorHasNext(BSTIterator *o) { return o->i < o->n; }
void bSTIteratorFree(BSTIterator *o) { free(o->a); free(o); }${WRAP.c}`,
        cpp: `class BSTIterator {
    vector<int> a;
    size_t i = 0;
    void inorder(TreeNode *t) { if (!t) return; inorder(t->left); a.push_back(t->val); inorder(t->right); }
public:
    BSTIterator(TreeNode* root) { inorder(root); }
    int next() { return a[i++]; }
    bool hasNext() { return i < a.size(); }
};${WRAP.cpp}`,
        java: `class BSTIterator {
    private final List<Integer> a = new ArrayList<>();
    private int i = 0;

    public BSTIterator(TreeNode root) { inorder(root); }

    private void inorder(TreeNode t) {
        if (t == null) return;
        inorder(t.left); a.add(t.val); inorder(t.right);
    }

    public int next() { return a.get(i++); }
    public boolean hasNext() { return i < a.size(); }
}${WRAP.java}`,
        javascript: `class BSTIterator {
  constructor(root) {
    this.a = [];
    this.i = 0;
    const inorder = (t) => {
      if (!t) return;
      inorder(t.left);
      this.a.push(t.val);
      inorder(t.right);
    };
    inorder(root);
  }

  next() {
    return this.a[this.i++];
  }

  hasNext() {
    return this.i < this.a.length;
  }
}${WRAP.javascript}`,
      },
    },
  ],
  pitfalls: ['next() 之後忘了處理右子樹:右邊的節點永遠不會被吐出來', '以為 next() 每次都是 O(1):某次可能 push 很多個,但平均下來是 O(1)'],
  check: {
    kind: 'fn',
    fn: 'bstIterate',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: [3, 7, 9, 15, 20] },
      { args: [[1]], out: [1] },
      { args: [[3, 1, 4, null, 2]], out: [1, 2, 3, 4] },
      { args: [[5, 4, null, 3, null, 2, null, 1]], out: [1, 2, 3, 4, 5] },
    ],
  },
}
