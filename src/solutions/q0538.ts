import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 538. Convert BST to Greater Tree

const T = [4, 1, 6, 0, 2, 5, 7]
const RES = [22, 25, 13, 25, 24, 18, 7]

function revFig(): FigStep[] {
  return [
    { note: '每個節點要變成「自己 + 所有比自己大的值」。BST 的**反向中序**(右 → 自己 → 左)會由大到小走,一路累加就對了', views: [tree(T)] },
    { note: '先到最大的 7:累加 7 → 7。再到 6:7 + 6 = 13。再到 5:13 + 5 = 18', views: [tree(T, { subs: { 6: '7', 2: '13', 5: '18' }, cls: { 6: 'done', 2: 'done', 5: 'done' } })] },
    { note: '接著 4:18 + 4 = 22;2:24;1:25;0:25 + 0 = 25。反向中序的順序是 7、6、5、4、2、1、0', views: [tree(RES)] },
  ]
}

function morrisFig(): FigStep[] {
  return [
    { note: '迭代版:用堆疊做反向中序 —— 一路往**右**push,pop 出來時累加,再轉去左子樹', views: [tree(T, { cls: { 0: 'cur', 2: 'cur', 6: 'hl' } })] },
    { note: '和一般中序完全對稱,只是左右互換', views: [tree(RES, { cls: { 0: 'done' } })] },
  ]
}

export const q0538: Solution = {
  id: 538,
  plain: '把二元搜尋樹的每個節點,改成「自己加上所有比自己大的數」的總和。',
  statement: '給 BST 的根 `root`,把每個節點的值改成「原本的值 + 樹中所有比它大的值」,回傳修改後的樹。(和 1038 題相同)',
  examples: [
    { input: 'root = [4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]', output: '[30,36,21,36,35,26,15,null,null,null,33,null,null,null,8]' },
    { input: 'root = [0,null,1]', output: '[1,null,1]' },
  ],
  constraints: ['節點數 ≤ 10⁴', '值互不相同'],
  insight: ['「比自己大的」在 BST 裡就是中序排在自己後面的', '反過來走中序(右 → 自己 → 左)就是由大到小', '一路維護累加和 s,每到一個節點就 `s += val`、`val = s`'],
  approaches: [
    {
      name: '反向中序遞迴 + 累加',
      idea: '`go(n)`:`go(n.right)`;`s += n.val`、`n.val = s`;`go(n.left)`。',
      steps: ['`s = 0`', '`go(n)`:空就返回', '`go(n.right)`;`s += n.val`;`n.val = s`;`go(n.left)`', '回傳 root'],
      figure: { title: `root = [${T}]`, steps: revFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度 = 樹高。' },
      verdict: '最推薦。「中序 = 排序」的反向用法。',
      code: {
        python: `def convertBST(root):
    s = 0

    def go(n):
        nonlocal s
        if not n:
            return
        go(n.right)                           # 先走比較大的
        s += n.val
        n.val = s
        go(n.left)

    go(root)
    return root`,
        c: `static int s_;

static void go(struct TreeNode *n) {
    if (!n) return;
    go(n->right);
    s_ += n->val;
    n->val = s_;
    go(n->left);
}

struct TreeNode *convertBST(struct TreeNode *root) {
    s_ = 0;
    go(root);
    return root;
}`,
        cpp: `int s = 0;

void go(TreeNode *n) {
    if (!n) return;
    go(n->right);
    s += n->val;
    n->val = s;
    go(n->left);
}

TreeNode* convertBST(TreeNode* root) {
    s = 0;
    go(root);
    return root;
}`,
        java: `private int s;

TreeNode convertBST(TreeNode root) {
    s = 0;
    go(root);
    return root;
}

private void go(TreeNode n) {
    if (n == null) return;
    go(n.right);
    s += n.val;
    n.val = s;
    go(n.left);
}`,
        javascript: `function convertBST(root) {
  let s = 0;
  const go = (n) => {
    if (!n) return;
    go(n.right);
    s += n.val;
    n.val = s;
    go(n.left);
  };
  go(root);
  return root;
}`,
      },
    },
    {
      name: '反向中序迭代(堆疊)',
      idea: '和迭代中序對稱:一路往右 push,pop 時累加並改值,再轉去左子樹。',
      steps: ['`cur = root`、`s = 0`', '`while cur or st`:一路往右 push', '`cur = pop()`;`s += cur.val`、`cur.val = s`', '`cur = cur.left`'],
      figure: { title: `root = [${T}]`, steps: morrisFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '堆疊最多一條路徑。' },
      verdict: '不用遞迴,適合很深的樹。',
      code: {
        python: `def convertBST(root):
    st, cur, s = [], root, 0
    while cur or st:
        while cur:
            st.append(cur)
            cur = cur.right                   # 一路往右(大的那邊)
        cur = st.pop()
        s += cur.val
        cur.val = s
        cur = cur.left
    return root`,
        c: `struct TreeNode *convertBST(struct TreeNode *root) {
    struct TreeNode **st = malloc(10005 * sizeof *st), *cur = root;
    int top = 0, s = 0;
    while (cur || top) {
        while (cur) { st[top++] = cur; cur = cur->right; }
        cur = st[--top];
        s += cur->val;
        cur->val = s;
        cur = cur->left;
    }
    free(st);
    return root;
}`,
        cpp: `TreeNode* convertBST(TreeNode* root) {
    stack<TreeNode*> st;
    TreeNode *cur = root;
    int s = 0;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->right; }
        cur = st.top(); st.pop();
        s += cur->val;
        cur->val = s;
        cur = cur->left;
    }
    return root;
}`,
        java: `TreeNode convertBST(TreeNode root) {
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode cur = root;
    int s = 0;
    while (cur != null || !st.isEmpty()) {
        while (cur != null) { st.push(cur); cur = cur.right; }
        cur = st.pop();
        s += cur.val;
        cur.val = s;
        cur = cur.left;
    }
    return root;
}`,
        javascript: `function convertBST(root) {
  const st = [];
  let cur = root, s = 0;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.right;
    }
    cur = st.pop();
    s += cur.val;
    cur.val = s;
    cur = cur.left;
  }
  return root;
}`,
      },
    },
  ],
  pitfalls: ['用正向中序:會變成「自己 + 比自己小的」', '每個節點都另外去加總比它大的值:O(n²)'],
  check: {
    kind: 'fn',
    fn: 'convertBST',
    argKinds: ['tree'],
    ret: 'tree',
    cases: [
      { args: [[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]], out: [30, 36, 21, 36, 35, 26, 15, null, null, null, 33, null, null, null, 8] },
      { args: [[0, null, 1]], out: [1, null, 1] },
      { args: [T], out: RES },
      { args: [[]], out: [] },
    ],
  },
}
