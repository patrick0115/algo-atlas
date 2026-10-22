import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, treeOf, type FNode } from './fig'

// 226. Invert Binary Tree

const T = [4, 2, 7, 1, 3, 6, 9]

function recurFig(): FigStep[] {
  const root = buildTree(T)
  const out: FigStep[] = [{ note: '翻轉 = 照鏡子:每個節點的左右孩子對調。對每個節點都做一次「交換左右」就好', views: [treeOf(root, { label: '原本的樹' })] }]
  const go = (n: FNode | null) => {
    if (!n) return
    ;[n.left, n.right] = [n.right, n.left]
    out.push({ note: `節點 ${n.val}:交換它的左右孩子${n.left || n.right ? `(現在左邊是 ${n.left?.val ?? '空'}、右邊是 ${n.right?.val ?? '空'})` : '(都是空的,換了也一樣)'},再往下遞迴`, views: [treeOf(root, { cls: { [n.i]: 'hl' } })] })
    go(n.left)
    go(n.right)
  }
  go(root)
  out.push({ note: '每個節點都換過了,整棵樹左右翻轉完成', views: [treeOf(root, { label: '翻轉後' })] })
  return out
}

function bfsFig(): FigStep[] {
  const root = buildTree(T)
  const q: FNode[] = [root!]
  const out: FigStep[] = [{ note: '不用遞迴:用佇列一層一層走(BFS)。從佇列拿出一個節點,交換它的左右,再把它的孩子放進佇列', views: [treeOf(root), arr(q.map((n) => n.val), { label: '佇列' })] }]
  while (q.length) {
    const n = q.shift()!
    ;[n.left, n.right] = [n.right, n.left]
    if (n.left) q.push(n.left)
    if (n.right) q.push(n.right)
    out.push({ note: `拿出 ${n.val},交換左右,孩子放進佇列`, views: [treeOf(root, { cls: { [n.i]: 'hl' } }), arr(q.map((x) => x.val), { label: '佇列' })] })
  }
  return out
}

export const q0226: Solution = {
  id: 226,
  plain: '把一棵樹「照鏡子」:每個節點的左邊孩子和右邊孩子互換位置,整棵樹就左右顛倒了。',
  statement: '給二元樹的根 `root`,把整棵樹左右翻轉(鏡像),回傳根。',
  examples: [
    { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
    { input: 'root = [2,1,3]', output: '[2,3,1]' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 100` → 可能是空樹', '樹的高度最多 100,遞迴沒問題'],
  insight: [
    '鏡像 = 每個節點的左右子樹對調。只要**每個節點都被換一次**,順序不重要',
    '樹的題目第一個想到遞迴:「翻轉整棵樹」= 交換左右 + 翻轉左子樹 + 翻轉右子樹',
    '也可以用佇列(BFS)或堆疊(DFS)走過每個節點,邊走邊換',
  ],
  approaches: [
    {
      name: '遞迴(DFS)',
      idea: '對每個節點:交換它的左右孩子,再分別遞迴處理左右子樹。空節點直接回傳。',
      steps: ['`root` 是 null → 回傳 null', '交換 `root.left`、`root.right`', '遞迴翻轉 `root.left` 和 `root.right`', '回傳 `root`'],
      figure: { title: 'root = [4,2,7,1,3,6,9]', steps: recurFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點處理一次;遞迴深度是樹高 h(平衡時 log n,最壞 n)。' },
      verdict: '標準解,三行就寫完。樹的遞迴模板:處理自己 + 遞迴左右,是[[p:tree-dfs]]最基本的形式。',
      code: {
        python: `def invertTree(root):
    if not root:
        return None
    root.left, root.right = root.right, root.left   # 交換
    invertTree(root.left)
    invertTree(root.right)
    return root`,
        c: `struct TreeNode *invertTree(struct TreeNode *root) {
    if (!root) return NULL;
    struct TreeNode *t = root->left;
    root->left = root->right;
    root->right = t;
    invertTree(root->left);
    invertTree(root->right);
    return root;
}`,
        cpp: `TreeNode* invertTree(TreeNode* root) {
    if (!root) return nullptr;
    swap(root->left, root->right);
    invertTree(root->left);
    invertTree(root->right);
    return root;
}`,
        java: `TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    TreeNode t = root.left;
    root.left = root.right;
    root.right = t;
    invertTree(root.left);
    invertTree(root.right);
    return root;
}`,
        javascript: `function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}`,
      },
    },
    {
      name: '迭代(BFS,用佇列)',
      idea: '佇列裡放待處理的節點。每拿出一個就交換它的左右孩子,再把不是空的孩子放進佇列。',
      steps: ['空樹 → null', '`queue = [root]`', '拿出 `node`,交換左右', '左右孩子不是空的就放進佇列', '佇列空了就完成'],
      figure: { title: 'root = [4,2,7,1,3,6,9]', steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: 'w 是樹最寬那一層的節點數,佇列最多同時放這麼多。' },
      verdict: '不怕遞迴太深(樹很歪的時候)。BFS 的佇列寫法在[[p:tree-bfs]]的層序遍歷會一直用到。',
      code: {
        python: `from collections import deque

def invertTree(root):
    if not root:
        return None
    q = deque([root])
    while q:
        node = q.popleft()
        node.left, node.right = node.right, node.left
        if node.left:
            q.append(node.left)
        if node.right:
            q.append(node.right)
    return root`,
        c: `struct TreeNode *invertTree(struct TreeNode *root) {
    if (!root) return NULL;
    struct TreeNode *q[128];      // 最多 100 個節點
    int head = 0, tail = 0;
    q[tail++] = root;
    while (head < tail) {
        struct TreeNode *n = q[head++];
        struct TreeNode *t = n->left;
        n->left = n->right;
        n->right = t;
        if (n->left) q[tail++] = n->left;
        if (n->right) q[tail++] = n->right;
    }
    return root;
}`,
        cpp: `TreeNode* invertTree(TreeNode* root) {
    if (!root) return nullptr;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        swap(n->left, n->right);
        if (n->left) q.push(n->left);
        if (n->right) q.push(n->right);
    }
    return root;
}`,
        java: `TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    Deque<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        TreeNode n = q.poll();
        TreeNode t = n.left;
        n.left = n.right;
        n.right = t;
        if (n.left != null) q.offer(n.left);
        if (n.right != null) q.offer(n.right);
    }
    return root;
}`,
        javascript: `function invertTree(root) {
  if (!root) return null;
  const q = [root];
  for (let h = 0; h < q.length; h++) {
    const n = q[h];
    [n.left, n.right] = [n.right, n.left];
    if (n.left) q.push(n.left);
    if (n.right) q.push(n.right);
  }
  return root;
}`,
      },
    },
    {
      name: '迭代(DFS,用堆疊)',
      idea: '和 BFS 一樣,只是把佇列換成堆疊:後放進去的先處理,走訪順序變成「一路往下」。',
      steps: ['`stack = [root]`', 'pop 出 `node`,交換左右', '把不是空的孩子 push 進去', '堆疊空了就完成'],
      figure: { title: 'root = [4,2,7,1,3,6,9]', steps: recurFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;堆疊最多放 O(h) 層的節點(加上兄弟)。' },
      verdict: '把遞迴手動改成堆疊的標準手法。面試官問「不用遞迴可以嗎」時的答案之一。',
      code: {
        python: `def invertTree(root):
    stack = [root] if root else []
    while stack:
        node = stack.pop()
        node.left, node.right = node.right, node.left
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return root`,
        c: `struct TreeNode *invertTree(struct TreeNode *root) {
    struct TreeNode *st[128];
    int top = 0;
    if (root) st[top++] = root;
    while (top) {
        struct TreeNode *n = st[--top];
        struct TreeNode *t = n->left;
        n->left = n->right;
        n->right = t;
        if (n->left) st[top++] = n->left;
        if (n->right) st[top++] = n->right;
    }
    return root;
}`,
        cpp: `TreeNode* invertTree(TreeNode* root) {
    stack<TreeNode*> st;
    if (root) st.push(root);
    while (!st.empty()) {
        TreeNode* n = st.top(); st.pop();
        swap(n->left, n->right);
        if (n->left) st.push(n->left);
        if (n->right) st.push(n->right);
    }
    return root;
}`,
        java: `TreeNode invertTree(TreeNode root) {
    Deque<TreeNode> st = new ArrayDeque<>();
    if (root != null) st.push(root);
    while (!st.isEmpty()) {
        TreeNode n = st.pop();
        TreeNode t = n.left;
        n.left = n.right;
        n.right = t;
        if (n.left != null) st.push(n.left);
        if (n.right != null) st.push(n.right);
    }
    return root;
}`,
        javascript: `function invertTree(root) {
  const st = root ? [root] : [];
  while (st.length) {
    const n = st.pop();
    [n.left, n.right] = [n.right, n.left];
    if (n.left) st.push(n.left);
    if (n.right) st.push(n.right);
  }
  return root;
}`,
      },
    },
  ],
  pitfalls: [
    '交換時沒用暫存變數:`root.left = root.right; root.right = root.left` 會讓兩邊都變成原本的右子樹(Python 的 `a, b = b, a` 沒有這個問題)',
    '先遞迴再交換也可以,但「交換完再遞迴 left」和「遞迴 left 再交換」走到的子樹不一樣,混著寫容易出錯 —— 挑一種固定寫法',
    '空樹要回傳 null',
  ],
  followUp: [
    { q: '判斷一棵樹是不是自己的鏡像?', a: '101. Symmetric Tree:同時遞迴「左子樹的左」和「右子樹的右」、「左的右」和「右的左」。' },
  ],
  check: {
    kind: 'fn',
    fn: 'invertTree',
    argKinds: ['tree'],
    ret: 'tree',
    cases: [
      { args: [T], out: [4, 7, 2, 9, 6, 3, 1] },
      { args: [[2, 1, 3]], out: [2, 3, 1] },
      { args: [[]], out: [] },
      { args: [[1, 2]], out: [1, null, 2] },
      { args: [[1, null, 2, 3]], out: [1, 2, null, null, 3] },
    ],
  },
}
