import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 144. Binary Tree Preorder Traversal

const T = [4, 2, 6, 1, 3, 5, 7]

function recFig(): FigStep[] {
  // 層序索引 0:4 1:2 2:6 3:1 4:3 5:5 6:7;前序 = 4 2 1 3 6 5 7
  const order = [0, 1, 3, 4, 2, 5, 6]
  const out: FigStep[] = [{ note: '前序 = 自己 → 左子樹 → 右子樹。一走到節點就先記下它,再往下', views: [tree(T)] }]
  ;[0, 1, 3, 4, 6].forEach((k) => {
    const idx = order[k]
    out.push({ note: `記下 ${T[idx]}${k === 0 ? '(根一定第一個)' : k === 4 ? '(左子樹全部走完,才輪到右子樹)' : ''}`, views: [tree(T, { cls: { ...Object.fromEntries(order.slice(0, k).map((i) => [i, 'done'])), [idx]: 'hl' } }), arr(order.slice(0, k + 1).map((i) => T[i]), { label: '結果' })] })
  })
  return out
}

function stackFig(): FigStep[] {
  return [
    { note: '迭代:堆疊一開始放根。每次 pop 一個,記下它,然後**先 push 右孩子、再 push 左孩子**(堆疊後進先出,左孩子會先被處理)', views: [tree(T, { cls: { 0: 'hl' } }), arr([6, 2], { label: '堆疊(右邊是頂)' }), arr([4], { label: '結果' })] },
    { note: 'pop 2 記下,push 3、1;pop 1 記下(沒有孩子);pop 3 記下;pop 6…', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'done', 4: 'hl' } }), arr([6], { label: '堆疊' }), arr([4, 2, 1, 3], { label: '結果' })] },
  ]
}

function morrisFig(): FigStep[] {
  return [
    { note: 'Morris 前序:和中序版幾乎一樣(用左子樹最右節點的空右指標搭回程線),差別只在**搭線的那一刻**就記下 cur', views: [tree(T, { cls: { 0: 'hl', 4: 'cur' }, subs: { 4: '3.right → 4' } }), arr([4], { label: '結果' })] },
    { note: '沿著回程線回到 cur 時只拆線、不記(已經記過了),然後往右。O(1) 額外空間', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'done', 4: 'done', 2: 'hl' } }), arr([4, 2, 1, 3, 6], { label: '結果' })] },
  ]
}

export const q0144: Solution = {
  id: 144,
  plain: '依「自己 → 左邊整棵 → 右邊整棵」的順序走訪二元樹。一走到某個節點就先記下它,像是看族譜時先寫下爺爺,再寫左邊這一支、再寫右邊那一支。',
  statement: '給二元樹的根 `root`,回傳節點值的**前序走訪**(根 → 左 → 右)。Follow-up:用迭代完成。',
  examples: [
    { input: 'root = [1,null,2,3]', output: '[1,2,3]' },
    { input: 'root = []', output: '[]' },
    { input: 'root = [4,2,6,1,3,5,7]', output: '[4,2,1,3,6,5,7]' },
  ],
  constraints: ['節點數 ≤ 100'],
  insight: ['遞迴:記下自己,再遞迴左、右', '迭代最簡單的一種:pop 就記下,先 push 右再 push 左', '三種走訪([94](#/q/94) 中序、[145](#/q/145) 後序)只差在什麼時候「記下自己」'],
  approaches: [
    {
      name: '遞迴',
      idea: '記下自己,`dfs(左)`、`dfs(右)`。',
      steps: ['`dfs(node)`:空就返回', '`res.append(node.val)`', '`dfs(node.left)`、`dfs(node.right)`'],
      figure: { title: `root = [${T}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度 = 樹高。' },
      verdict: '最直觀。複製一棵樹、序列化([297](#/q/297))都是前序:先處理自己才知道要建什麼。',
      code: {
        python: `def preorderTraversal(root):
    res = []
    def dfs(node):
        if not node:
            return
        res.append(node.val)                  # 一到就記
        dfs(node.left)
        dfs(node.right)
    dfs(root)
    return res`,
        c: `static void dfs(struct TreeNode *n, int *res, int *k) {
    if (!n) return;
    res[(*k)++] = n->val;
    dfs(n->left, res, k);
    dfs(n->right, res, k);
}

int *preorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    dfs(root, res, returnSize);
    return res;
}`,
        cpp: `void dfs(TreeNode *n, vector<int> &res) {
    if (!n) return;
    res.push_back(n->val);
    dfs(n->left, res);
    dfs(n->right, res);
}

vector<int> preorderTraversal(TreeNode* root) {
    vector<int> res;
    dfs(root, res);
    return res;
}`,
        java: `List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    dfs(root, res);
    return res;
}

private void dfs(TreeNode n, List<Integer> res) {
    if (n == null) return;
    res.add(n.val);
    dfs(n.left, res);
    dfs(n.right, res);
}`,
        javascript: `function preorderTraversal(root) {
  const res = [];
  const dfs = (n) => {
    if (!n) return;
    res.push(n.val);
    dfs(n.left);
    dfs(n.right);
  };
  dfs(root);
  return res;
}`,
      },
    },
    {
      name: '迭代 + 堆疊',
      idea: '`st = [root]`;pop、記下、先 push 右再 push 左。',
      steps: ['空樹回傳 []', '`st = [root]`', '`while st`:`node = st.pop()`、記下', '`node.right` → push;`node.left` → push(後放的先出來)'],
      figure: { title: `root = [${T}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '堆疊最多約 h 個節點(每層最多留一個右孩子)。' },
      verdict: '最推薦(Follow-up 的答案),三種迭代走訪裡最短的一種。',
      code: {
        python: `def preorderTraversal(root):
    if not root:
        return []
    res, st = [], [root]
    while st:
        node = st.pop()
        res.append(node.val)
        if node.right:
            st.append(node.right)             # 右先放,才會後處理
        if node.left:
            st.append(node.left)
    return res`,
        c: `int *preorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    if (!root) return res;
    struct TreeNode *st[100];
    int top = 0;
    st[top++] = root;
    while (top) {
        struct TreeNode *n = st[--top];
        res[(*returnSize)++] = n->val;
        if (n->right) st[top++] = n->right;
        if (n->left) st[top++] = n->left;
    }
    return res;
}`,
        cpp: `vector<int> preorderTraversal(TreeNode* root) {
    vector<int> res;
    if (!root) return res;
    stack<TreeNode *> st;
    st.push(root);
    while (!st.empty()) {
        TreeNode *n = st.top(); st.pop();
        res.push_back(n->val);
        if (n->right) st.push(n->right);
        if (n->left) st.push(n->left);
    }
    return res;
}`,
        java: `List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    if (root == null) return res;
    Deque<TreeNode> st = new ArrayDeque<>();
    st.push(root);
    while (!st.isEmpty()) {
        TreeNode n = st.pop();
        res.add(n.val);
        if (n.right != null) st.push(n.right);
        if (n.left != null) st.push(n.left);
    }
    return res;
}`,
        javascript: `function preorderTraversal(root) {
  if (!root) return [];
  const res = [], st = [root];
  while (st.length) {
    const n = st.pop();
    res.push(n.val);
    if (n.right) st.push(n.right);
    if (n.left) st.push(n.left);
  }
  return res;
}`,
      },
    },
    {
      name: 'Morris 走訪',
      idea: '和 Morris 中序一樣搭回程線,但在「搭線」時記下 cur;回來拆線時不記。',
      steps: ['`cur.left` 為空 → 記下、往右', '否則找左子樹最右節點 pre', '`pre.right` 為空 → 記下 cur、搭線、往左', '`pre.right == cur` → 拆線、往右'],
      figure: { title: `root = [${T}]`, steps: morrisFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每條邊最多走兩次。' },
      verdict: '要求 O(1) 空間時用。和中序版只差一行的位置。',
      code: {
        python: `def preorderTraversal(root):
    res, cur = [], root
    while cur:
        if not cur.left:
            res.append(cur.val)
            cur = cur.right
            continue
        pre = cur.left
        while pre.right and pre.right is not cur:
            pre = pre.right
        if not pre.right:
            res.append(cur.val)               # 第一次到 cur:記下(和中序唯一的差別)
            pre.right = cur
            cur = cur.left
        else:
            pre.right = None                  # 第二次到:拆線
            cur = cur.right
    return res`,
        c: `int *preorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    struct TreeNode *cur = root;
    while (cur) {
        if (!cur->left) { res[(*returnSize)++] = cur->val; cur = cur->right; continue; }
        struct TreeNode *pre = cur->left;
        while (pre->right && pre->right != cur) pre = pre->right;
        if (!pre->right) { res[(*returnSize)++] = cur->val; pre->right = cur; cur = cur->left; }
        else { pre->right = NULL; cur = cur->right; }
    }
    return res;
}`,
        cpp: `vector<int> preorderTraversal(TreeNode* root) {
    vector<int> res;
    TreeNode *cur = root;
    while (cur) {
        if (!cur->left) { res.push_back(cur->val); cur = cur->right; continue; }
        TreeNode *pre = cur->left;
        while (pre->right && pre->right != cur) pre = pre->right;
        if (!pre->right) { res.push_back(cur->val); pre->right = cur; cur = cur->left; }
        else { pre->right = nullptr; cur = cur->right; }
    }
    return res;
}`,
        java: `List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    TreeNode cur = root;
    while (cur != null) {
        if (cur.left == null) { res.add(cur.val); cur = cur.right; continue; }
        TreeNode pre = cur.left;
        while (pre.right != null && pre.right != cur) pre = pre.right;
        if (pre.right == null) { res.add(cur.val); pre.right = cur; cur = cur.left; }
        else { pre.right = null; cur = cur.right; }
    }
    return res;
}`,
        javascript: `function preorderTraversal(root) {
  const res = [];
  let cur = root;
  while (cur) {
    if (!cur.left) {
      res.push(cur.val);
      cur = cur.right;
      continue;
    }
    let pre = cur.left;
    while (pre.right && pre.right !== cur) pre = pre.right;
    if (!pre.right) {
      res.push(cur.val);
      pre.right = cur;
      cur = cur.left;
    } else {
      pre.right = null;
      cur = cur.right;
    }
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['迭代版先 push 左再 push 右:會變成「根 → 右 → 左」', '空樹時直接 push root(null)'],
  check: {
    kind: 'fn',
    fn: 'preorderTraversal',
    argKinds: ['tree'],
    cases: [
      { args: [[1, null, 2, 3]], out: [1, 2, 3] },
      { args: [[]], out: [] },
      { args: [[1]], out: [1] },
      { args: [T], out: [4, 2, 1, 3, 6, 5, 7] },
      { args: [[1, 2, 3, 4, 5, null, 8, null, null, 6, 7, 9]], out: [1, 2, 4, 5, 6, 7, 3, 8, 9] },
    ],
  },
}
