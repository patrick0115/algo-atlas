import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 129. Sum Root to Leaf Numbers

const T = [4, 9, 0, 5, 1]

function dfsFig(): FigStep[] {
  return [
    { note: '每條根到葉的路徑代表一個數字:4 → 9 → 5 是 495。往下走一步,數字就變成「原本 × 10 + 新的位數」', views: [tree(T, { subs: { 0: '4' } })] },
    { note: '4 → 9:4×10 + 9 = 49;再到 5:495(葉子,加進答案);到 1:491(葉子)', views: [tree(T, { cls: { 3: 'done', 4: 'done' }, subs: { 1: '49', 3: '495', 4: '491' } })] },
    { note: '4 → 0:40(葉子)。總和 495 + 491 + 40 = 1026', views: [tree(T, { cls: { 2: 'done', 3: 'done', 4: 'done' }, subs: { 2: '40', 3: '495', 4: '491' } })] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: '迭代版:佇列放 (節點, 到這裡的數字)。取出時是葉子就加進總和,否則把孩子和「數字 × 10 + 孩子的值」放進去', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' }, subs: { 1: '49', 2: '40' } })] },
    { note: '一層一層展開,葉子的數字全部加起來 → 1026', views: [tree(T, { cls: { 2: 'done', 3: 'done', 4: 'done' } })] },
  ]
}

export const q0129: Solution = {
  id: 129,
  plain: '樹上每個節點都是一個數字(0 ~ 9)。從樹根走到每一片葉子,把經過的數字依序串起來就是一個整數(例如 1 → 2 → 3 是 123)。把所有這樣的整數加起來。',
  statement: '給二元樹的根 `root`,每個節點值為 0 ~ 9。每條**根到葉**的路徑代表一個數字,回傳所有路徑數字的總和(保證在 32 位元範圍內)。',
  examples: [
    { input: 'root = [1,2,3]', output: '25', note: '12 + 13' },
    { input: 'root = [4,9,0,5,1]', output: '1026', note: '495 + 491 + 40' },
  ],
  constraints: ['節點數 ≤ 1000', '樹的深度 ≤ 10'],
  insight: ['往下走時,目前的數字 = 父節點的數字 × 10 + 自己的值(和讀數字的方式一樣)', '到葉子時把數字加進答案', '和 [112. Path Sum](#/q/112) 同樣的「往下傳一個值」模板'],
  approaches: [
    {
      name: 'DFS 往下傳目前的數字',
      idea: '`dfs(node, cur)`:`cur = cur * 10 + val`;葉子回傳 cur;否則回傳左右子樹結果的和。',
      steps: ['空 → 0', '`cur = cur * 10 + node.val`', '葉子 → 回傳 cur', '回傳 `dfs(left, cur) + dfs(right, cur)`'],
      figure: { title: `root = [${T}]`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度 = 樹高。' },
      verdict: '最推薦,[[p:tree-dfs]]「往下傳狀態」最典型的例子。',
      code: {
        python: `def sumNumbers(root):
    def dfs(node, cur):
        if not node:
            return 0
        cur = cur * 10 + node.val             # 接上這一位
        if not node.left and not node.right:
            return cur                        # 葉子:一個完整的數字
        return dfs(node.left, cur) + dfs(node.right, cur)
    return dfs(root, 0)`,
        c: `static int dfs(struct TreeNode *n, int cur) {
    if (!n) return 0;
    cur = cur * 10 + n->val;
    if (!n->left && !n->right) return cur;
    return dfs(n->left, cur) + dfs(n->right, cur);
}

int sumNumbers(struct TreeNode *root) { return dfs(root, 0); }`,
        cpp: `int dfs(TreeNode *n, int cur) {
    if (!n) return 0;
    cur = cur * 10 + n->val;
    if (!n->left && !n->right) return cur;
    return dfs(n->left, cur) + dfs(n->right, cur);
}

int sumNumbers(TreeNode* root) { return dfs(root, 0); }`,
        java: `int sumNumbers(TreeNode root) { return dfs(root, 0); }

private int dfs(TreeNode n, int cur) {
    if (n == null) return 0;
    cur = cur * 10 + n.val;
    if (n.left == null && n.right == null) return cur;
    return dfs(n.left, cur) + dfs(n.right, cur);
}`,
        javascript: `function sumNumbers(root) {
  const dfs = (n, cur) => {
    if (!n) return 0;
    cur = cur * 10 + n.val;
    if (!n.left && !n.right) return cur;
    return dfs(n.left, cur) + dfs(n.right, cur);
  };
  return dfs(root, 0);
}`,
      },
    },
    {
      name: 'BFS 帶著數字',
      idea: '佇列放 `(node, num)`;葉子就 `total += num`,否則孩子入隊時帶上 `num * 10 + child.val`。',
      steps: ['`q = [(root, root.val)]`、`total = 0`', '取出 (n, num):葉子 → `total += num`', '否則孩子入隊 `(c, num * 10 + c.val)`', '回傳 total'],
      figure: { title: `root = [${T}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: 'w = 最寬那層。' },
      verdict: '迭代寫法,沒有遞迴深度的顧慮。',
      code: {
        python: `from collections import deque

def sumNumbers(root):
    q, total = deque([(root, root.val)]), 0
    while q:
        n, num = q.popleft()
        if not n.left and not n.right:
            total += num
        for c in (n.left, n.right):
            if c:
                q.append((c, num * 10 + c.val))
    return total`,
        c: `int sumNumbers(struct TreeNode *root) {
    struct TreeNode *q[1005];
    int num[1005], h = 0, t = 0, total = 0;
    q[t] = root; num[t++] = root->val;
    while (h < t) {
        struct TreeNode *n = q[h];
        int v = num[h++];
        if (!n->left && !n->right) total += v;
        if (n->left) { q[t] = n->left; num[t++] = v * 10 + n->left->val; }
        if (n->right) { q[t] = n->right; num[t++] = v * 10 + n->right->val; }
    }
    return total;
}`,
        cpp: `int sumNumbers(TreeNode* root) {
    queue<pair<TreeNode*, int>> q;
    q.push({root, root->val});
    int total = 0;
    while (!q.empty()) {
        auto [n, v] = q.front(); q.pop();
        if (!n->left && !n->right) total += v;
        if (n->left) q.push({n->left, v * 10 + n->left->val});
        if (n->right) q.push({n->right, v * 10 + n->right->val});
    }
    return total;
}`,
        java: `int sumNumbers(TreeNode root) {
    Deque<Object[]> q = new ArrayDeque<>();
    q.offer(new Object[]{root, root.val});
    int total = 0;
    while (!q.isEmpty()) {
        Object[] p = q.poll();
        TreeNode n = (TreeNode) p[0];
        int v = (int) p[1];
        if (n.left == null && n.right == null) total += v;
        if (n.left != null) q.offer(new Object[]{n.left, v * 10 + n.left.val});
        if (n.right != null) q.offer(new Object[]{n.right, v * 10 + n.right.val});
    }
    return total;
}`,
        javascript: `function sumNumbers(root) {
  const q = [[root, root.val]];
  let total = 0;
  for (let h = 0; h < q.length; h++) {
    const [n, v] = q[h];
    if (!n.left && !n.right) total += v;
    if (n.left) q.push([n.left, v * 10 + n.left.val]);
    if (n.right) q.push([n.right, v * 10 + n.right.val]);
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: ['只有一個孩子的節點不是葉子,不能在那裡把數字加進答案', '在 null 時回傳 cur:葉子會被算兩次(左右兩個 null 各一次),只有一個孩子的節點也會把半截數字加進答案'],
  check: {
    kind: 'fn',
    fn: 'sumNumbers',
    argKinds: ['tree'],
    cases: [
      { args: [[1, 2, 3]], out: 25 },
      { args: [T], out: 1026 },
      { args: [[0]], out: 0 },
      { args: [[1, 0]], out: 10 },
      { args: [[9, null, 9, 9]], out: 999 },
    ],
  },
}
