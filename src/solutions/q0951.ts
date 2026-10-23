import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 951. Flip Equivalent Binary Trees

const A = [1, 2, 3, 4, 5, 6, null, null, null, 7, 8]
const B = [1, 3, 2, null, 6, 4, 5, null, null, null, null, 8, 7]

function recFig(): FigStep[] {
  return [
    { note: '「翻轉」= 把某個節點的左右子樹對調。兩棵樹經過任意次翻轉能變一樣,就叫翻轉等價', views: [tree(A, { label: 'root1' }), tree(B, { label: 'root2' })] },
    { note: '比較兩個節點:值要一樣,而且兩種情況之一成立 —— 不翻:左對左、右對右;翻:左對右、右對左', views: [tree(A, { label: 'root1', cls: { 1: 'hl', 2: 'cur' } }), tree(B, { label: 'root2', cls: { 1: 'cur', 2: 'hl' } })] },
    { note: '根 1:root1 的左(2)和 root2 的右(2)比、右(3)和左(3)比 → 要翻。一路遞迴下去都成立 → true', views: [tree(A, { label: 'root1', cls: { 0: 'done', 1: 'done', 2: 'done' } }), tree(B, { label: 'root2', cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

function canonFig(): FigStep[] {
  return [
    { note: '另一種:把兩棵樹都「標準化」—— 每個節點都讓值比較小的孩子放左邊(空的當成最大)。翻轉等價的兩棵樹,標準化之後會完全一樣', views: [tree(A, { label: 'root1' })] },
    { note: '標準化後用 [100. Same Tree](#/q/100) 的方法比較。值互不相同,所以「誰放左邊」是確定的', views: [tree(A, { label: '標準化後', cls: { 0: 'done' } })] },
  ]
}

export const q0951: Solution = {
  id: 951,
  plain: '一棵二元樹可以任意選某些節點,把它的左右兩邊整個對調(翻轉)。給兩棵樹,問能不能透過若干次翻轉讓它們變得一模一樣?',
  statement: '定義**翻轉**為選一個節點並交換其左右子樹。若樹 X 經過若干次翻轉能變成樹 Y,稱它們翻轉等價。給 `root1`、`root2`,判斷是否翻轉等價(節點值互不相同)。',
  examples: [
    { input: 'root1 = [1,2,3,4,5,6,null,null,null,7,8], root2 = [1,3,2,null,6,4,5,null,null,null,null,8,7]', output: 'true', note: '翻轉 1、3、5' },
    { input: 'root1 = [], root2 = []', output: 'true' },
    { input: 'root1 = [], root2 = [1]', output: 'false' },
  ],
  constraints: ['節點數 ≤ 100,值互不相同'],
  insight: ['兩個節點等價:值相同,而且「不翻」或「翻」其中一種配對成立', '不翻:`(L1, L2) and (R1, R2)`;翻:`(L1, R2) and (R1, L2)`', '也可以把兩棵樹都整理成標準形狀再比較'],
  approaches: [
    {
      name: '遞迴:不翻或翻',
      idea: '`eq(a, b)`:都空 → true;一空或值不同 → false;否則 `(eq(a.l, b.l) and eq(a.r, b.r)) or (eq(a.l, b.r) and eq(a.r, b.l))`。',
      steps: ['兩個都空 → true', '只有一個空,或值不同 → false', '回傳「不翻」或「翻」任一成立'],
      figure: { title: 'root1、root2', steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '值互不相同,每對節點只有一種配法會成功,最壞仍是線性。' },
      verdict: '最推薦,[100. Same Tree](#/q/100) 多一個「交叉比較」的分支。',
      code: {
        python: `def flipEquiv(root1, root2):
    if not root1 and not root2:
        return True
    if not root1 or not root2 or root1.val != root2.val:
        return False
    return (flipEquiv(root1.left, root2.left) and flipEquiv(root1.right, root2.right)) or \\
           (flipEquiv(root1.left, root2.right) and flipEquiv(root1.right, root2.left))   # 不翻 or 翻`,
        c: `bool flipEquiv(struct TreeNode *a, struct TreeNode *b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return (flipEquiv(a->left, b->left) && flipEquiv(a->right, b->right)) ||
           (flipEquiv(a->left, b->right) && flipEquiv(a->right, b->left));
}`,
        cpp: `bool flipEquiv(TreeNode* a, TreeNode* b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return (flipEquiv(a->left, b->left) && flipEquiv(a->right, b->right)) ||
           (flipEquiv(a->left, b->right) && flipEquiv(a->right, b->left));
}`,
        java: `boolean flipEquiv(TreeNode a, TreeNode b) {
    if (a == null && b == null) return true;
    if (a == null || b == null || a.val != b.val) return false;
    return (flipEquiv(a.left, b.left) && flipEquiv(a.right, b.right)) ||
           (flipEquiv(a.left, b.right) && flipEquiv(a.right, b.left));
}`,
        javascript: `function flipEquiv(a, b) {
  if (!a && !b) return true;
  if (!a || !b || a.val !== b.val) return false;
  return (flipEquiv(a.left, b.left) && flipEquiv(a.right, b.right)) || (flipEquiv(a.left, b.right) && flipEquiv(a.right, b.left));
}`,
      },
    },
    {
      name: '標準化後比較',
      idea: '把每個節點的孩子排成「左孩子值 ≤ 右孩子值」(空視為無限大),兩棵樹都整理後直接比是否相同。',
      steps: ['`canon(node)`:遞迴整理左右子樹', '左邊的值 > 右邊的值(空當作 ∞)→ 交換左右', '`same(canon(root1), canon(root2))`'],
      figure: { title: 'root1、root2', steps: canonFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '整理一次、比較一次。' },
      verdict: '把「等價」轉成「相同」;值互不相同時標準形是唯一的。會修改輸入的樹。',
      code: {
        python: `def flipEquiv(root1, root2):
    INF = float('inf')
    def canon(n):
        if not n:
            return
        canon(n.left)
        canon(n.right)
        lv = n.left.val if n.left else INF
        rv = n.right.val if n.right else INF
        if lv > rv:
            n.left, n.right = n.right, n.left # 小的放左邊
    def same(a, b):
        if not a or not b:
            return a is b
        return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)
    canon(root1)
    canon(root2)
    return same(root1, root2)`,
        c: `static void canon(struct TreeNode *n) {
    if (!n) return;
    canon(n->left); canon(n->right);
    long long lv = n->left ? n->left->val : LLONG_MAX, rv = n->right ? n->right->val : LLONG_MAX;
    if (lv > rv) { struct TreeNode *t = n->left; n->left = n->right; n->right = t; }
}

static bool same(struct TreeNode *a, struct TreeNode *b) {
    if (!a || !b) return a == b;
    return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
}

bool flipEquiv(struct TreeNode *root1, struct TreeNode *root2) {
    canon(root1); canon(root2);
    return same(root1, root2);
}`,
        cpp: `void canon(TreeNode *n) {
    if (!n) return;
    canon(n->left); canon(n->right);
    long long lv = n->left ? n->left->val : LLONG_MAX, rv = n->right ? n->right->val : LLONG_MAX;
    if (lv > rv) swap(n->left, n->right);
}

bool same(TreeNode *a, TreeNode *b) {
    if (!a || !b) return a == b;
    return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
}

bool flipEquiv(TreeNode* root1, TreeNode* root2) {
    canon(root1); canon(root2);
    return same(root1, root2);
}`,
        java: `boolean flipEquiv(TreeNode root1, TreeNode root2) {
    canon(root1); canon(root2);
    return same(root1, root2);
}

private void canon(TreeNode n) {
    if (n == null) return;
    canon(n.left); canon(n.right);
    long lv = n.left != null ? n.left.val : Long.MAX_VALUE, rv = n.right != null ? n.right.val : Long.MAX_VALUE;
    if (lv > rv) { TreeNode t = n.left; n.left = n.right; n.right = t; }
}

private boolean same(TreeNode a, TreeNode b) {
    if (a == null || b == null) return a == b;
    return a.val == b.val && same(a.left, b.left) && same(a.right, b.right);
}`,
        javascript: `function flipEquiv(root1, root2) {
  const canon = (n) => {
    if (!n) return;
    canon(n.left);
    canon(n.right);
    const lv = n.left ? n.left.val : Infinity, rv = n.right ? n.right.val : Infinity;
    if (lv > rv) [n.left, n.right] = [n.right, n.left];
  };
  const same = (a, b) => (!a || !b ? a === b : a.val === b.val && same(a.left, b.left) && same(a.right, b.right));
  canon(root1);
  canon(root2);
  return same(root1, root2);
}`,
      },
    },
  ],
  pitfalls: ['只檢查「翻」或只檢查「不翻」:兩種都要試', '標準化時沒處理空孩子:空要當成最大,才會被放到右邊'],
  check: {
    kind: 'fn',
    fn: 'flipEquiv',
    argKinds: ['tree', 'tree'],
    cases: [
      { args: [A, B], out: true },
      { args: [[], []], out: true },
      { args: [[], [1]], out: false },
      { args: [[0, null, 1], []], out: false },
      { args: [[0, null, 1], [0, 1]], out: true },
      { args: [[1, 2, 3], [1, 2, null, 3]], out: false },
    ],
  },
}
