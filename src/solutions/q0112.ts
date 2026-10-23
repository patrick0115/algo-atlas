import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 112. Path Sum

const T = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]
const SUM = 22

function dfsFig(): FigStep[] {
  return [
    { note: `要找一條「從根走到葉子」的路徑,節點值加起來剛好 ${SUM}。往下走的時候,把剩下要湊的數一路減掉`, views: [tree(T, { subs: { 0: `剩 ${SUM}` } })] },
    { note: '走 5 → 4 → 11:剩 22 − 5 − 4 − 11 = 2。再走到 7 → 剩 −5,是葉子但不是 0 ✗;回頭走 2 → 剩 0,而且 2 是葉子 ✓', views: [tree(T, { cls: { 0: 'path', 1: 'path', 3: 'path', 7: 'dim', 8: 'done' }, subs: { 8: '剩 0' } })] },
    { note: '找到一條就回傳 true(右邊的子樹不用再看了)', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'done', 8: 'done' } })] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: '迭代版:佇列 / 堆疊放 (節點, 到這個節點為止的總和)', views: [tree(T, { cls: { 0: 'hl' }, subs: { 0: '5' } })] },
    { note: '取出時如果是葉子而且總和 = 目標 → true;否則把孩子連同新的總和放進去', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' }, subs: { 1: '9', 2: '13' } })] },
  ]
}

export const q0112: Solution = {
  id: 112,
  plain: '從樹根一路走到某片葉子(沒有孩子的節點),把經過的數字加起來。有沒有某一條這樣的路徑,總和剛好等於 targetSum?',
  statement: '給二元樹的根 `root` 和整數 `targetSum`,若存在一條**根到葉**的路徑,路徑上所有節點值的和等於 targetSum,回傳 true。',
  examples: [
    { input: 'root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22', output: 'true', note: '5 → 4 → 11 → 2' },
    { input: 'root = [1,2,3], targetSum = 5', output: 'false' },
    { input: 'root = [], targetSum = 0', output: 'false' },
  ],
  constraints: ['節點數 ≤ 5000', '值可以是負數 → 不能在途中「超過就停」'],
  insight: ['往下走時把 target 減掉目前節點的值,問題變成「子樹裡有沒有路徑和為剩下的數」', '只有在**葉子**才能判斷成功(中途剛好湊到也不算)', '有負數,所以不能提早剪枝'],
  approaches: [
    {
      name: '遞迴 DFS(往下減)',
      idea: '`has(node, t)`:空 → false;葉子 → `node.val == t`;否則 `has(left, t − val) or has(right, t − val)`。',
      steps: ['`not root` → false', '`t -= root.val`', '葉子 → 回傳 `t == 0`', '回傳 `has(root.left, t) or has(root.right, t)`'],
      figure: { title: `targetSum = ${SUM}`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點最多看一次;遞迴深度 = 樹高。' },
      verdict: '最推薦,[[p:tree-dfs]]的入門題。注意「葉子」的判斷,不是走到 null 就算。',
      code: {
        python: `def hasPathSum(root, targetSum):
    if not root:
        return False
    t = targetSum - root.val
    if not root.left and not root.right:
        return t == 0                         # 只有葉子才算數
    return hasPathSum(root.left, t) or hasPathSum(root.right, t)`,
        c: `bool hasPathSum(struct TreeNode *root, int targetSum) {
    if (!root) return false;
    int t = targetSum - root->val;
    if (!root->left && !root->right) return t == 0;
    return hasPathSum(root->left, t) || hasPathSum(root->right, t);
}`,
        cpp: `bool hasPathSum(TreeNode* root, int targetSum) {
    if (!root) return false;
    int t = targetSum - root->val;
    if (!root->left && !root->right) return t == 0;
    return hasPathSum(root->left, t) || hasPathSum(root->right, t);
}`,
        java: `boolean hasPathSum(TreeNode root, int targetSum) {
    if (root == null) return false;
    int t = targetSum - root.val;
    if (root.left == null && root.right == null) return t == 0;
    return hasPathSum(root.left, t) || hasPathSum(root.right, t);
}`,
        javascript: `function hasPathSum(root, targetSum) {
  if (!root) return false;
  const t = targetSum - root.val;
  if (!root.left && !root.right) return t === 0;
  return hasPathSum(root.left, t) || hasPathSum(root.right, t);
}`,
      },
    },
    {
      name: '堆疊(節點, 目前總和)',
      idea: '堆疊放 `(node, sum)`;取出時是葉子且 sum == target 就成功,否則把孩子和新總和放進去。',
      steps: ['`st = [(root, root.val)]`', '取出 (n, s):葉子且 `s == target` → true', '孩子存在 → 放入 `(child, s + child.val)`', '堆疊空 → false'],
      figure: { title: `targetSum = ${SUM}`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '堆疊最多存 O(n) 個。' },
      verdict: '把遞迴的「參數」放進堆疊,就是迭代版的 DFS。',
      code: {
        python: `def hasPathSum(root, targetSum):
    if not root:
        return False
    st = [(root, root.val)]
    while st:
        node, s = st.pop()
        if not node.left and not node.right and s == targetSum:
            return True
        for c in (node.left, node.right):
            if c:
                st.append((c, s + c.val))
    return False`,
        c: `bool hasPathSum(struct TreeNode *root, int targetSum) {
    if (!root) return false;
    struct TreeNode *st[5005];
    int sum[5005], top = 0;
    st[top] = root; sum[top++] = root->val;
    while (top) {
        struct TreeNode *n = st[--top];
        int s = sum[top];
        if (!n->left && !n->right && s == targetSum) return true;
        if (n->left) { st[top] = n->left; sum[top++] = s + n->left->val; }
        if (n->right) { st[top] = n->right; sum[top++] = s + n->right->val; }
    }
    return false;
}`,
        cpp: `bool hasPathSum(TreeNode* root, int targetSum) {
    if (!root) return false;
    vector<pair<TreeNode*, int>> st{{root, root->val}};
    while (!st.empty()) {
        auto [n, s] = st.back(); st.pop_back();
        if (!n->left && !n->right && s == targetSum) return true;
        if (n->left) st.push_back({n->left, s + n->left->val});
        if (n->right) st.push_back({n->right, s + n->right->val});
    }
    return false;
}`,
        java: `boolean hasPathSum(TreeNode root, int targetSum) {
    if (root == null) return false;
    Deque<Object[]> st = new ArrayDeque<>();
    st.push(new Object[]{root, root.val});
    while (!st.isEmpty()) {
        Object[] p = st.pop();
        TreeNode n = (TreeNode) p[0];
        int s = (int) p[1];
        if (n.left == null && n.right == null && s == targetSum) return true;
        if (n.left != null) st.push(new Object[]{n.left, s + n.left.val});
        if (n.right != null) st.push(new Object[]{n.right, s + n.right.val});
    }
    return false;
}`,
        javascript: `function hasPathSum(root, targetSum) {
  if (!root) return false;
  const st = [[root, root.val]];
  while (st.length) {
    const [n, s] = st.pop();
    if (!n.left && !n.right && s === targetSum) return true;
    if (n.left) st.push([n.left, s + n.left.val]);
    if (n.right) st.push([n.right, s + n.right.val]);
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['走到 null 才判斷 `t == 0`:像 [1, 2]、target = 1 時,根的右邊是 null 會被誤判成一條路徑', '空樹且 target = 0:題目要的是 false(沒有任何路徑)'],
  check: {
    kind: 'fn',
    fn: 'hasPathSum',
    argKinds: ['tree', null],
    cases: [
      { args: [T, SUM], out: true },
      { args: [[1, 2, 3], 5], out: false },
      { args: [[], 0], out: false },
      { args: [[1, 2], 1], out: false },
      { args: [[-2, null, -3], -5], out: true },
    ],
  },
}
