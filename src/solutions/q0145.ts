import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 145. Binary Tree Postorder Traversal

const T = [4, 2, 6, 1, 3, 5, 7]

function recFig(): FigStep[] {
  // 層序索引 0:4 1:2 2:6 3:1 4:3 5:5 6:7;後序 = 1 3 2 5 7 6 4
  const order = [3, 4, 1, 5, 6, 2, 0]
  const out: FigStep[] = [{ note: '後序 = 左子樹 → 右子樹 → 自己。一個節點要等兩個孩子都處理完才輪到它,所以根一定是最後一個', views: [tree(T)] }]
  ;[0, 2, 5, 6].forEach((k) => {
    const idx = order[k]
    out.push({ note: `記下 ${T[idx]}${k === 2 ? '(左右孩子 1、3 都記完了)' : k === 6 ? '(根最後)' : ''}`, views: [tree(T, { cls: { ...Object.fromEntries(order.slice(0, k).map((i) => [i, 'done'])), [idx]: 'hl' } }), arr(order.slice(0, k + 1).map((i) => T[i]), { label: '結果' })] })
  })
  return out
}

function revFig(): FigStep[] {
  return [
    { note: '小技巧:前序是「自己 → 左 → 右」。把它改成「自己 → **右** → 左」(堆疊先 push 左再 push 右),得到 4 6 7 5 2 3 1', views: [tree(T), arr([4, 6, 7, 5, 2, 3, 1], { label: '自己 → 右 → 左' })] },
    { note: '把這個結果整個反轉 → 1 3 2 5 7 6 4,剛好就是「左 → 右 → 自己」的後序', views: [arr([1, 3, 2, 5, 7, 6, 4], { label: '反轉後 = 後序', done: [0, 1, 2, 3, 4, 5, 6] })] },
  ]
}

function oneStackFig(): FigStep[] {
  return [
    { note: '真正的單堆疊後序:像中序一樣一路往左 push。看堆疊頂的節點:如果它有右孩子而且右孩子還沒處理過,先去右子樹', views: [tree(T, { cls: { 0: 'cur', 1: 'cur', 3: 'hl' } }), arr([4, 2, 1], { label: '堆疊' })] },
    { note: '右孩子不存在、或剛剛才處理完(用 prev 記住上一個記下的節點)→ 現在輪到它:pop、記下、prev = 它', views: [tree(T, { cls: { 3: 'done', 4: 'done', 1: 'hl' } }), arr([4], { label: '堆疊' }), arr([1, 3, 2], { label: '結果' })] },
  ]
}

export const q0145: Solution = {
  id: 145,
  plain: '依「左邊整棵 → 右邊整棵 → 自己」的順序走訪二元樹。也就是說一個節點要等它的孩子們都看完才看它,像是「先處理完下屬,最後才處理主管」。',
  statement: '給二元樹的根 `root`,回傳節點值的**後序走訪**(左 → 右 → 根)。Follow-up:用迭代完成。',
  examples: [
    { input: 'root = [1,null,2,3]', output: '[3,2,1]' },
    { input: 'root = []', output: '[]' },
    { input: 'root = [4,2,6,1,3,5,7]', output: '[1,3,2,5,7,6,4]' },
  ],
  constraints: ['節點數 ≤ 100'],
  insight: ['遞迴:把「記下自己」放在兩個遞迴呼叫之後', '迭代的難處:節點第一次出現時還不能記,要等右子樹也處理完', '取巧:「根 → 右 → 左」的前序反轉過來就是後序'],
  approaches: [
    {
      name: '遞迴',
      idea: '`dfs(左)`、`dfs(右)`、記下自己。',
      steps: ['`dfs(node)`:空就返回', '`dfs(node.left)`、`dfs(node.right)`', '`res.append(node.val)`'],
      figure: { title: `root = [${T}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度 = 樹高。' },
      verdict: '最直觀。很多樹的題目(高度、直徑、刪除子樹)都是後序:要先知道孩子的結果才能算自己。',
      code: {
        python: `def postorderTraversal(root):
    res = []
    def dfs(node):
        if not node:
            return
        dfs(node.left)
        dfs(node.right)
        res.append(node.val)                  # 兩個孩子都處理完才記自己
    dfs(root)
    return res`,
        c: `static void dfs(struct TreeNode *n, int *res, int *k) {
    if (!n) return;
    dfs(n->left, res, k);
    dfs(n->right, res, k);
    res[(*k)++] = n->val;
}

int *postorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    dfs(root, res, returnSize);
    return res;
}`,
        cpp: `void dfs(TreeNode *n, vector<int> &res) {
    if (!n) return;
    dfs(n->left, res);
    dfs(n->right, res);
    res.push_back(n->val);
}

vector<int> postorderTraversal(TreeNode* root) {
    vector<int> res;
    dfs(root, res);
    return res;
}`,
        java: `List<Integer> postorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    dfs(root, res);
    return res;
}

private void dfs(TreeNode n, List<Integer> res) {
    if (n == null) return;
    dfs(n.left, res);
    dfs(n.right, res);
    res.add(n.val);
}`,
        javascript: `function postorderTraversal(root) {
  const res = [];
  const dfs = (n) => {
    if (!n) return;
    dfs(n.left);
    dfs(n.right);
    res.push(n.val);
  };
  dfs(root);
  return res;
}`,
      },
    },
    {
      name: '「根 → 右 → 左」再反轉',
      idea: '堆疊做前序,但先 push 左孩子再 push 右孩子(右邊先出來),得到「根右左」,最後反轉。',
      steps: ['`st = [root]`', 'pop 一個節點,記下;先 push 左孩子、再 push 右孩子', '堆疊空了之後把結果反轉'],
      figure: { title: `root = [${T}]`, steps: revFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '結果要反轉;堆疊最多存 O(n) 個。' },
      verdict: '最好寫的迭代版。不過它不是「真正依後序拜訪」,只是結果的順序對;如果每拜訪一個節點就要做事(例如釋放記憶體),要用方法三。',
      code: {
        python: `def postorderTraversal(root):
    if not root:
        return []
    res, st = [], [root]
    while st:
        node = st.pop()
        res.append(node.val)                  # 根 → 右 → 左
        if node.left:
            st.append(node.left)
        if node.right:
            st.append(node.right)             # 後放的先出來
    return res[::-1]                          # 反轉 → 左 → 右 → 根`,
        c: `int *postorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    if (!root) return res;
    struct TreeNode *st[100];
    int top = 0;
    st[top++] = root;
    while (top) {
        struct TreeNode *n = st[--top];
        res[(*returnSize)++] = n->val;
        if (n->left) st[top++] = n->left;
        if (n->right) st[top++] = n->right;
    }
    for (int i = 0, j = *returnSize - 1; i < j; i++, j--) { int t = res[i]; res[i] = res[j]; res[j] = t; }
    return res;
}`,
        cpp: `vector<int> postorderTraversal(TreeNode* root) {
    vector<int> res;
    if (!root) return res;
    stack<TreeNode *> st;
    st.push(root);
    while (!st.empty()) {
        TreeNode *n = st.top(); st.pop();
        res.push_back(n->val);
        if (n->left) st.push(n->left);
        if (n->right) st.push(n->right);
    }
    reverse(res.begin(), res.end());
    return res;
}`,
        java: `List<Integer> postorderTraversal(TreeNode root) {
    LinkedList<Integer> res = new LinkedList<>();
    if (root == null) return res;
    Deque<TreeNode> st = new ArrayDeque<>();
    st.push(root);
    while (!st.isEmpty()) {
        TreeNode n = st.pop();
        res.addFirst(n.val);                  // 插在最前面 = 最後反轉
        if (n.left != null) st.push(n.left);
        if (n.right != null) st.push(n.right);
    }
    return res;
}`,
        javascript: `function postorderTraversal(root) {
  if (!root) return [];
  const res = [], st = [root];
  while (st.length) {
    const n = st.pop();
    res.push(n.val);
    if (n.left) st.push(n.left);
    if (n.right) st.push(n.right);
  }
  return res.reverse();
}`,
      },
    },
    {
      name: '單一堆疊 + prev 指標',
      idea: '像中序一樣一路往左 push;看堆疊頂:有右孩子且還沒處理 → 轉去右邊;否則 pop、記下、`prev = node`。',
      steps: ['`cur = root`、`prev = None`', '`while cur or st`:一路往左 push', '`top = st[-1]`;`top.right and top.right is not prev` → `cur = top.right`', '否則 pop、記下、`prev = top`(cur 保持 None)'],
      figure: { title: `root = [${T}]`, steps: oneStackFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '堆疊最多一條路徑。' },
      verdict: '真正依後序拜訪每個節點的迭代寫法。prev 的作用是分辨「剛從左邊回來」還是「剛從右邊回來」。',
      code: {
        python: `def postorderTraversal(root):
    res, st = [], []
    cur, prev = root, None
    while cur or st:
        while cur:
            st.append(cur)
            cur = cur.left
        top = st[-1]
        if top.right and top.right is not prev:
            cur = top.right                   # 右子樹還沒處理,先去右邊
        else:
            st.pop()
            res.append(top.val)               # 左右都處理完了
            prev = top
    return res`,
        c: `int *postorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    struct TreeNode *st[100], *cur = root, *prev = NULL;
    int top = 0;
    while (cur || top) {
        while (cur) { st[top++] = cur; cur = cur->left; }
        struct TreeNode *t = st[top - 1];
        if (t->right && t->right != prev) cur = t->right;
        else { top--; res[(*returnSize)++] = t->val; prev = t; }
    }
    return res;
}`,
        cpp: `vector<int> postorderTraversal(TreeNode* root) {
    vector<int> res;
    stack<TreeNode *> st;
    TreeNode *cur = root, *prev = nullptr;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }
        TreeNode *t = st.top();
        if (t->right && t->right != prev) cur = t->right;
        else { st.pop(); res.push_back(t->val); prev = t; }
    }
    return res;
}`,
        java: `List<Integer> postorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode cur = root, prev = null;
    while (cur != null || !st.isEmpty()) {
        while (cur != null) { st.push(cur); cur = cur.left; }
        TreeNode t = st.peek();
        if (t.right != null && t.right != prev) cur = t.right;
        else { st.pop(); res.add(t.val); prev = t; }
    }
    return res;
}`,
        javascript: `function postorderTraversal(root) {
  const res = [], st = [];
  let cur = root, prev = null;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.left;
    }
    const t = st[st.length - 1];
    if (t.right && t.right !== prev) cur = t.right;
    else {
      st.pop();
      res.push(t.val);
      prev = t;
    }
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['「根右左再反轉」的堆疊順序寫成先 push 右再 push 左:會得到「根左右」反轉,錯', '單堆疊版沒有 prev:從右子樹回來時會再走一次右子樹,無限迴圈'],
  check: {
    kind: 'fn',
    fn: 'postorderTraversal',
    argKinds: ['tree'],
    cases: [
      { args: [[1, null, 2, 3]], out: [3, 2, 1] },
      { args: [[]], out: [] },
      { args: [[1]], out: [1] },
      { args: [T], out: [1, 3, 2, 5, 7, 6, 4] },
      { args: [[1, 2, 3, 4, 5, null, 8, null, null, 6, 7, 9]], out: [4, 6, 7, 5, 2, 9, 8, 3, 1] },
    ],
  },
}
