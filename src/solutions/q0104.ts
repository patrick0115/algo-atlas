import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 104. Maximum Depth of Binary Tree

const T = [3, 9, 20, null, null, 15, 7, null, null, 8]

function dfsFig(): FigStep[] {
  const root = buildTree(T)
  const depth: Record<number, number> = {}
  const out: FigStep[] = [{ note: '一棵樹的深度 = 1(自己這層)+ 左右子樹裡比較深的那個。空樹深度是 0。從下往上算(後序遍歷)', views: [tree(T)] }]
  const go = (n: FNode | null): number => {
    if (!n) return 0
    const l = go(n.left)
    const r = go(n.right)
    depth[n.i] = 1 + Math.max(l, r)
    out.push({ note: `節點 ${n.val}:左子樹深 ${l}、右子樹深 ${r} → 1 + max(${l}, ${r}) = ${depth[n.i]}`, views: [tree(T, { cls: { ...Object.fromEntries(Object.keys(depth).map((k) => [k, 'done'])), [n.i]: 'hl' }, subs: { ...depth } })] })
    return depth[n.i]
  }
  const ans = go(root)
  out.push({ note: `根的值就是答案:${ans}`, views: [tree(T, { subs: depth, cls: { 0: 'hl' } })] })
  return out
}

function bfsFig(): FigStep[] {
  const root = buildTree(T)!
  let level = [root]
  let d = 0
  const seen: Record<number, string> = {}
  const out: FigStep[] = [{ note: '另一種想法:一層一層往下走(BFS),數總共有幾層', views: [tree(T)] }]
  while (level.length) {
    d++
    level.forEach((n) => (seen[n.i] = `第${d}層`))
    out.push({ note: `第 ${d} 層有 [${level.map((n) => n.val).join(', ')}],把它們的孩子當成下一層`, views: [tree(T, { cls: Object.fromEntries(level.map((n) => [n.i, 'hl'])), subs: { ...seen } }), arr(level.map((n) => n.val), { label: '目前這一層' })] })
    level = level.flatMap((n) => [n.left, n.right].filter((x): x is FNode => !!x))
  }
  out.push({ note: `下一層是空的,總共 ${d} 層`, views: [tree(T, { subs: seen })] })
  return out
}

export const q0104: Solution = {
  id: 104,
  plain: '算一棵樹有幾層:從最上面的根,走到最深的那片葉子,路上經過幾個節點。像算家族樹最多傳了幾代。',
  statement: '給二元樹的根 `root`,回傳它的**最大深度**:從根到最遠葉子的路徑上,節點的個數。',
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
    { input: 'root = [1,null,2]', output: '2' },
    { input: 'root = []', output: '0' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 10⁴` → 樹很歪時深度可能到 10⁴,遞迴要注意深度', '空樹深度是 0'],
  insight: [
    '整棵樹的深度 = 1 + max(左子樹深度, 右子樹深度) —— 大問題拆成兩個一樣的小問題 → 遞迴',
    '「先算完左右,再算自己」:這是**後序遍歷**,資訊從葉子往根傳',
    '另一個角度:深度就是「有幾層」,用 BFS 一層一層走,數層數',
  ],
  approaches: [
    {
      name: '遞迴(DFS,後序)',
      idea: '`depth(node) = 1 + max(depth(node.left), depth(node.right))`,空節點是 0。',
      steps: ['`root` 是 null → 0', '`l = maxDepth(root.left)`、`r = maxDepth(root.right)`', '回傳 `1 + max(l, r)`'],
      figure: { title: 'root = [3,9,20,null,null,15,7,null,null,8](節點下方是它的深度)', steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點算一次;遞迴深度是樹高 h。' },
      verdict: '標準解,一行就寫完。這種「回傳子樹資訊給父節點」的後序遞迴,是 543、110、124 這些題的基礎。',
      code: {
        python: `def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
        c: `int maxDepth(struct TreeNode *root) {
    if (!root) return 0;
    int l = maxDepth(root->left), r = maxDepth(root->right);
    return 1 + (l > r ? l : r);
}`,
        cpp: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`,
        java: `int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
        javascript: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
      },
    },
    {
      name: 'BFS 數層數',
      idea: '用佇列一層一層走。每處理完一整層,層數 +1。',
      steps: ['空樹 → 0', '`q = [root]`、`depth = 0`', '`while q`:`depth += 1`;把這一層的節點全部拿出來,孩子放進佇列', '回傳 `depth`'],
      figure: { title: 'root = [3,9,20,null,null,15,7,null,null,8]', steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: 'w 是最寬那層的節點數。' },
      verdict: '不用遞迴,樹很深也不會堆疊溢位。「每層開始時記下佇列長度」是[[p:tree-bfs]]層序遍歷的固定寫法。',
      code: {
        python: `from collections import deque

def maxDepth(root):
    if not root:
        return 0
    q, depth = deque([root]), 0
    while q:
        depth += 1
        for _ in range(len(q)):           # 只處理「這一層」的節點
            node = q.popleft()
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
    return depth`,
        c: `int maxDepth(struct TreeNode *root) {
    if (!root) return 0;
    struct TreeNode **q = malloc(10001 * sizeof(*q));
    int head = 0, tail = 0, depth = 0;
    q[tail++] = root;
    while (head < tail) {
        depth++;
        int end = tail;                       // 這一層到 end 為止
        while (head < end) {
            struct TreeNode *n = q[head++];
            if (n->left) q[tail++] = n->left;
            if (n->right) q[tail++] = n->right;
        }
    }
    free(q);
    return depth;
}`,
        cpp: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    queue<TreeNode*> q;
    q.push(root);
    int depth = 0;
    while (!q.empty()) {
        depth++;
        for (int k = q.size(); k > 0; k--) {
            TreeNode* n = q.front(); q.pop();
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
    }
    return depth;
}`,
        java: `int maxDepth(TreeNode root) {
    if (root == null) return 0;
    Deque<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    int depth = 0;
    while (!q.isEmpty()) {
        depth++;
        for (int k = q.size(); k > 0; k--) {
            TreeNode n = q.poll();
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
    }
    return depth;
}`,
        javascript: `function maxDepth(root) {
  if (!root) return 0;
  let level = [root], depth = 0;
  while (level.length) {
    depth++;
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return depth;
}`,
      },
    },
    {
      name: '迭代 DFS(堆疊存 [節點, 深度])',
      idea: '堆疊裡同時記住「這個節點在第幾層」。每 pop 出一個就更新最大深度。',
      steps: ['`stack = [(root, 1)]`、`best = 0`', 'pop 出 `(node, d)`:`best = max(best, d)`', '孩子以 `(child, d + 1)` push 進去'],
      figure: { title: 'root = [3,9,20,null,null,15,7,null,null,8]', steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;堆疊最多 O(h) 層。' },
      verdict: '「往下傳資訊」(深度從父節點傳給孩子)的寫法,和方法一「往上傳」相反。1448. Count Good Nodes 就是往下傳路徑上的最大值。',
      code: {
        python: `def maxDepth(root):
    stack = [(root, 1)] if root else []
    best = 0
    while stack:
        node, d = stack.pop()
        best = max(best, d)
        if node.left:
            stack.append((node.left, d + 1))
        if node.right:
            stack.append((node.right, d + 1))
    return best`,
        c: `int maxDepth(struct TreeNode *root) {
    if (!root) return 0;
    struct TreeNode **st = malloc(10001 * sizeof(*st));
    int *dep = malloc(10001 * sizeof(int)), top = 0, best = 0;
    st[top] = root; dep[top++] = 1;
    while (top) {
        top--;
        struct TreeNode *n = st[top];
        int d = dep[top];
        if (d > best) best = d;
        if (n->left) { st[top] = n->left; dep[top++] = d + 1; }
        if (n->right) { st[top] = n->right; dep[top++] = d + 1; }
    }
    free(st); free(dep);
    return best;
}`,
        cpp: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    stack<pair<TreeNode*, int>> st;
    st.push({root, 1});
    int best = 0;
    while (!st.empty()) {
        auto [n, d] = st.top(); st.pop();
        best = max(best, d);
        if (n->left) st.push({n->left, d + 1});
        if (n->right) st.push({n->right, d + 1});
    }
    return best;
}`,
        java: `int maxDepth(TreeNode root) {
    if (root == null) return 0;
    Deque<Object[]> st = new ArrayDeque<>();
    st.push(new Object[]{root, 1});
    int best = 0;
    while (!st.isEmpty()) {
        Object[] top = st.pop();
        TreeNode n = (TreeNode) top[0];
        int d = (int) top[1];
        best = Math.max(best, d);
        if (n.left != null) st.push(new Object[]{n.left, d + 1});
        if (n.right != null) st.push(new Object[]{n.right, d + 1});
    }
    return best;
}`,
        javascript: `function maxDepth(root) {
  const st = root ? [[root, 1]] : [];
  let best = 0;
  while (st.length) {
    const [n, d] = st.pop();
    best = Math.max(best, d);
    if (n.left) st.push([n.left, d + 1]);
    if (n.right) st.push([n.right, d + 1]);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '空樹的深度是 0,不是 1',
    '深度算「節點數」不是「邊數」:只有根的樹深度是 1',
    'BFS 沒有「一次處理完一整層」:每拿一個節點就 +1 的話,算出來的是節點數',
  ],
  followUp: [
    { q: '最小深度(根到最近葉子)?', a: '111. Minimum Depth:遞迴時要小心「只有一邊有孩子」的節點不是葉子,不能取 min(0, ...);用 BFS 遇到第一片葉子就停最直觀。' },
  ],
  check: {
    kind: 'fn',
    fn: 'maxDepth',
    argKinds: ['tree'],
    cases: [
      { args: [[3, 9, 20, null, null, 15, 7]], out: 3 },
      { args: [[1, null, 2]], out: 2 },
      { args: [[]], out: 0 },
      { args: [T], out: 4 },
      { args: [[1, 2, null, 3, null, 4]], out: 4 },
    ],
  },
}
