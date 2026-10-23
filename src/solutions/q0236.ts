import type { FigStep, Solution } from './types'
import { tree } from './fig'

// 236. Lowest Common Ancestor of a Binary Tree
const T = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]
const title = 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4'

function ancestorFig(): FigStep[] {
  return [
    { note: '從根節點 3 開始找 p=5。往左走一步就到 5，因此第一條路是 3→5。', views: [tree(T, { cls: { 0: 'visited', 1: 'hl', 2: 'dim' } })] },
    { note: '先找從根到 5 與 4 的路。兩條路共同經過 3、5。', views: [tree(T, { cls: { 0: 'visited', 1: 'hl' } })] },
    { note: '再找 q=4：從 3 走到 5，接著經過 2 才抵達 4，所以第二條路是 3→5→2→4。', views: [tree(T, { cls: { 0: 'visited', 1: 'visited', 4: 'visited', 10: 'hl' } })] },
    { note: '走向 4 時還會經過 2，但 5 的路在此之前已結束。最後一個共同節點是 5。', views: [tree(T, { cls: { 0: 'visited', 1: 'hl', 4: 'dim', 10: 'dim' } })] },
  ]
}

function dfsFig(): FigStep[] {
  return [
    { note: '從 3 往左遞迴到 5；因為 5 就是 p，這次呼叫直接把 5 回報給根節點。', views: [tree(T, { cls: { 0: 'visited', 1: 'hl' } })] },
    { note: '後序搜尋：空節點回傳空；遇到 p 或 q 就回傳該節點。先看左右子樹有沒有找到目標。', views: [tree(T, { cls: { 1: 'hl', 10: 'visited' } })] },
    { note: '節點 5 本身就是 p，且 q=4 位於它的子樹，因此答案可以是目標節點本身。', views: [tree(T, { cls: { 1: 'hl', 10: 'visited', 4: 'visited' } })] },
    { note: '根節點 3 收到左邊回報的 5、右邊的空值，因此沿用 5 作答案；若兩邊都有目標，才會回報自己。', views: [tree(T, { cls: { 0: 'visited', 1: 'hl', 2: 'dim' } })] },
  ]
}

export const q0236: Solution = {
  id: 236,
  plain: '在家族樹裡找兩個人的最近共同長輩；一個人也可以是自己的長輩。',
  statement: '給二元樹及其中兩個不同節點 p、q，回傳同時是兩者祖先且離它們最近的節點。節點本身也算祖先。',
  examples: [
    { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' },
    { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5' },
  ],
  constraints: ['2 ≤ 節點數 ≤ 10⁵；p、q 都在樹中且不同。', '這是一般二元樹，不能用節點值大小決定往左或往右。'],
  insight: ['根到 p、q 的兩條路，最後一個共同節點就是答案。', '後序遍歷可以不用保存完整路徑：左右子樹分別回報找到的目標；兩邊都有時，當前節點就是共同祖先。', '和 [[p:tree-dfs]]、[235](#/q/235) 比較：BST 有大小順序可利用，一般樹沒有。'],
  approaches: [
    {
      name: '記下兩條根到目標的路徑',
      idea: '各找一次路徑，從根開始比較，最後一個相同節點即為答案。',
      steps: ['DFS 找 root 到 p 的路徑。先確認各目標位於哪條分支，後面才知道路徑在哪裡分開。', '同樣找 root 到 q 的路徑。沿路保存或回報節點，才能比較兩個目標的共同祖先。', '同步比較兩條路，記住最後一個相同節點。最後共同經過的節點離兩個目標最近，因此把它作為答案。'],
      figure: { title, steps: ancestorFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '兩次走樹；兩條路和遞迴堆疊長度最多為樹高 h。' },
      verdict: '容易從定義理解；需要保存路徑。',
      code: {
        python: `def lowestCommonAncestor(root, p, q):

    def path(node, target, out):
        if not node:  # 找到目標或空節點時，決定要向上回報什麼。
            return False
        out.append(node)
        if node is target or path(node.left, target, out) or path(node.right, target, out):
            return True
        out.pop()
        return False
    a, b = ([], [])
    path(root, p, a)
    path(root, q, b)
    ans = None
    for x, y in zip(a, b):  # 從根開始同步比較兩條路徑。
        if x is not y:
            break
        ans = x
    return ans`,
        c: `static bool path(struct TreeNode *n, struct TreeNode *t, struct TreeNode **a, int *len) {
    if (!n)
        return false;
    a[(*len)++] = n;
    if (n == t || path(n->left, t, a, len) || path(n->right, t, a, len))
        return true;
    --*len;
    return false;
}
int countNodes(struct TreeNode *n) {
    return n ? 1 + countNodes(n->left) + countNodes(n->right) : 0;
}
struct TreeNode *lowestCommonAncestor(struct TreeNode *root, struct TreeNode *p, struct TreeNode *q) {
    int cap = countNodes(root), na = 0, nb = 0;
    struct TreeNode **a = malloc(cap * sizeof(*a)), **b = malloc(cap * sizeof(*b));
    path(root, p, a, & na);
    path(root, q, b, & nb);
    struct TreeNode *ans = NULL;
    for (int i = 0; i < na && i < nb && a[i] == b[i]; i++)
        ans = a[i];
    free(a);
    free(b);
    return ans;
}`,
        cpp: `bool path(TreeNode *n, TreeNode *t, vector<TreeNode*>& out) {
    if (!n)
        return false;
    out.push_back(n);
    if (n == t || path(n->left, t, out) || path(n->right, t, out))
        return true;
    out.pop_back();
    return false;
}
TreeNode *lowestCommonAncestor(TreeNode *root, TreeNode *p, TreeNode *q) {
    vector<TreeNode*> a, b;
    path(root, p, a);
    path(root, q, b);
    TreeNode *ans = nullptr;
    for (int i = 0; i < (int)min(a.size(), b.size()) && a[i] == b[i]; i++)
        ans = a[i];
    return ans;
}`,
        java: `boolean path(TreeNode n, TreeNode t, List<TreeNode> out) {
    if (n == null)
        return false;
    out.add(n);
    if (n == t || path(n.left, t, out) || path(n.right, t, out))
        return true;
    out.remove(out.size() - 1);
    return false;
}
TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    List<TreeNode> a = new ArrayList<>(), b = new ArrayList<>();
    path(root, p, a);
    path(root, q, b);
    TreeNode ans = null;
    for (int i = 0; i < Math.min(a.size(), b.size()) && a.get(i) == b.get(i); i++)
        ans = a.get(i);
    return ans;
}`,
        javascript: `function lowestCommonAncestor(root, p, q) {
    function path(n, t, out) {
        if (!n)
            return false;
        out.push(n);
        if (n === t || path(n.left, t, out) || path(n.right, t, out))
            return true;
        out.pop();
        return false;
    }
    const a = [], b = [];
    path(root, p, a);
    path(root, q, b);
    let ans = null;
    for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++)
        ans = a[i];
    return ans;
}`,
      },
    },
    {
      name: '後序遍歷直接向上回報',
      idea: '子樹找到一個目標就回報它；左右都找到時回報當前節點。',
      steps: ['空節點回傳空；遇到 p 或 q 回傳自身。先確認各目標位於哪條分支，後面才知道路徑在哪裡分開。', '遞迴搜尋左右子樹。沿路保存或回報節點，才能比較兩個目標的共同祖先。', '兩邊非空回傳自身；只有一邊非空就把那一邊的結果向上傳。最後共同經過的節點離兩個目標最近，因此把它作為答案。'],
      figure: { title, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點至多訪問一次；遞迴深度為 h。' },
      verdict: '程式短、無需保存路徑；適合一般二元樹。',
      code: {
        python: `def lowestCommonAncestor(root, p, q):
    if not root or root is p or root is q:  # 空節點或目標節點可直接向上回報。
        return root
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    return root if left and right else left or right  # 兩邊各找到一個目標時，目前節點就是共同祖先。`,
        c: `struct TreeNode *lowestCommonAncestor(struct TreeNode *root, struct TreeNode *p, struct TreeNode *q) {
    if (!root || root == p || root == q)
        return root;
    struct TreeNode *l = lowestCommonAncestor(root->left, p, q);
    struct TreeNode *r = lowestCommonAncestor(root->right, p, q);
    return l && r ? root : (l ? l : r);
}`,
        cpp: `TreeNode *lowestCommonAncestor(TreeNode *root, TreeNode *p, TreeNode *q) {
    if (!root || root == p || root == q)
        return root;
    auto l = lowestCommonAncestor(root->left, p, q);
    auto r = lowestCommonAncestor(root->right, p, q);
    return l && r ? root : (l ? l : r);
}`,
        java: `TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q)
        return root;
    TreeNode l = lowestCommonAncestor(root.left, p, q);
    TreeNode r = lowestCommonAncestor(root.right, p, q);
    return l != null && r != null ? root : (l != null ? l : r);
}`,
        javascript: `function lowestCommonAncestor(root, p, q) {
    if (!root || root === p || root === q)
        return root;
    const l = lowestCommonAncestor(root.left, p, q);
    const r = lowestCommonAncestor(root.right, p, q);
    return l && r ? root : l || r;
}`,
      },
    },
  ],
  pitfalls: ['不可比較 p.val、q.val 決定方向；一般二元樹沒有 BST 順序。', 'p 是 q 的祖先時，答案就是 p。', '比較節點身分，不要只比較值。'],
  check: { kind: 'fn', fn: 'lowestCommonAncestor', argKinds: ['tree', 'nodeIn0', 'nodeIn0'], ret: 'nodeIn0', cases: [
    { args: [T, 5, 1], out: 3 }, { args: [T, 5, 4], out: 5 }, { args: [[1, 2], 1, 2], out: 1 },
  ] },
}
