import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 101. Symmetric Tree

const T = [1, 2, 2, 3, 4, 4, 3]

function recFig(): FigStep[] {
  return [
    { note: '對稱 = 左子樹和右子樹互為鏡像。比較兩棵樹是不是鏡像:根的值一樣,而且「左的左」對「右的右」、「左的右」對「右的左」', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } })] },
    { note: '外側:3(左的左)和 3(右的右)一樣 ✓', views: [tree(T, { cls: { 3: 'hl', 6: 'hl' } })] },
    { note: '內側:4(左的右)和 4(右的左)一樣 ✓ → 對稱', views: [tree(T, { cls: { 4: 'hl', 5: 'hl', 3: 'done', 6: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

function queueFig(): FigStep[] {
  return [
    { note: '迭代版:佇列每次放一對「應該互為鏡像的節點」,一開始是 (左孩子, 右孩子)', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } })] },
    { note: '取出 (a, b):都空 → 跳過;一個空或值不同 → false;否則放入 (a.left, b.right)、(a.right, b.left)', views: [tree(T, { cls: { 3: 'cur', 6: 'cur', 4: 'hl', 5: 'hl' } })] },
  ]
}

export const q0101: Solution = {
  id: 101,
  plain: '一棵二元樹,從正中間畫一條直線,左右兩邊是不是像照鏡子一樣對稱?',
  statement: '給二元樹的根 `root`,判斷它是否**軸對稱**(左右互為鏡像)。Follow-up:遞迴與迭代都寫一次。',
  examples: [
    { input: 'root = [1,2,2,3,4,4,3]', output: 'true' },
    { input: 'root = [1,2,2,null,3,null,3]', output: 'false' },
  ],
  constraints: ['節點數 ≤ 1000'],
  insight: ['對稱 ⇔ 左子樹和右子樹互為鏡像', '兩棵樹 a、b 互為鏡像:值相同,且 `a.left` 和 `b.right` 是鏡像、`a.right` 和 `b.left` 是鏡像', '和 [100. Same Tree](#/q/100) 幾乎一樣,只是左右交叉比較'],
  approaches: [
    {
      name: '遞迴比較鏡像',
      idea: '`mirror(a, b)`:都空 → true;一個空或值不同 → false;否則 `mirror(a.left, b.right) and mirror(a.right, b.left)`。',
      steps: ['`mirror(a, b)`:都空 → true', '只有一個空或 `a.val != b.val` → false', '回傳 `mirror(a.left, b.right) and mirror(a.right, b.left)`', '答案 `mirror(root.left, root.right)`'],
      figure: { title: `root = [${T}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點比較一次;遞迴深度 = 樹高。' },
      verdict: '最推薦,外側對外側、內側對內側。',
      code: {
        python: `def isSymmetric(root):
    def mirror(a, b):
        if not a and not b:
            return True
        if not a or not b or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)   # 外側、內側
    return mirror(root.left, root.right) if root else True`,
        c: `static bool mirror(struct TreeNode *a, struct TreeNode *b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return mirror(a->left, b->right) && mirror(a->right, b->left);
}

bool isSymmetric(struct TreeNode *root) { return !root || mirror(root->left, root->right); }`,
        cpp: `bool mirror(TreeNode *a, TreeNode *b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return mirror(a->left, b->right) && mirror(a->right, b->left);
}

bool isSymmetric(TreeNode* root) { return !root || mirror(root->left, root->right); }`,
        java: `boolean isSymmetric(TreeNode root) { return root == null || mirror(root.left, root.right); }

private boolean mirror(TreeNode a, TreeNode b) {
    if (a == null && b == null) return true;
    if (a == null || b == null || a.val != b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
}`,
        javascript: `function isSymmetric(root) {
  const mirror = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return !root || mirror(root.left, root.right);
}`,
      },
    },
    {
      name: '佇列(成對比較)',
      idea: '佇列放應該互為鏡像的一對節點;每次取出比較,再放入外側一對、內側一對。',
      steps: ['`q = [(root.left, root.right)]`', '取出 (a, b):都空 → continue;一個空或值不同 → false', '放入 `(a.left, b.right)`、`(a.right, b.left)`', '佇列空了 → true'],
      figure: { title: `root = [${T}]`, steps: queueFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '佇列最多放一層的節點對。' },
      verdict: 'Follow-up 的迭代版,邏輯和遞迴完全對應。',
      code: {
        python: `from collections import deque

def isSymmetric(root):
    if not root:
        return True
    q = deque([(root.left, root.right)])
    while q:
        a, b = q.popleft()
        if not a and not b:
            continue
        if not a or not b or a.val != b.val:
            return False
        q.append((a.left, b.right))           # 外側
        q.append((a.right, b.left))           # 內側
    return True`,
        c: `bool isSymmetric(struct TreeNode *root) {
    if (!root) return true;
    struct TreeNode *q[4096];   // 每個節點最多放進佇列一次,加上空孩子約 2n + 2
    int h = 0, t = 0;
    q[t++] = root->left; q[t++] = root->right;
    while (h < t) {
        struct TreeNode *a = q[h++], *b = q[h++];
        if (!a && !b) continue;
        if (!a || !b || a->val != b->val) return false;
        q[t++] = a->left; q[t++] = b->right;
        q[t++] = a->right; q[t++] = b->left;
    }
    return true;
}`,
        cpp: `bool isSymmetric(TreeNode* root) {
    if (!root) return true;
    queue<TreeNode*> q;
    q.push(root->left); q.push(root->right);
    while (!q.empty()) {
        TreeNode *a = q.front(); q.pop();
        TreeNode *b = q.front(); q.pop();
        if (!a && !b) continue;
        if (!a || !b || a->val != b->val) return false;
        q.push(a->left); q.push(b->right);
        q.push(a->right); q.push(b->left);
    }
    return true;
}`,
        java: `boolean isSymmetric(TreeNode root) {
    if (root == null) return true;
    Deque<TreeNode[]> q = new ArrayDeque<>();
    q.offer(new TreeNode[]{root.left, root.right});
    while (!q.isEmpty()) {
        TreeNode[] p = q.poll();
        TreeNode a = p[0], b = p[1];
        if (a == null && b == null) continue;
        if (a == null || b == null || a.val != b.val) return false;
        q.offer(new TreeNode[]{a.left, b.right});
        q.offer(new TreeNode[]{a.right, b.left});
    }
    return true;
}`,
        javascript: `function isSymmetric(root) {
  if (!root) return true;
  const q = [[root.left, root.right]];
  for (let h = 0; h < q.length; h++) {
    const [a, b] = q[h];
    if (!a && !b) continue;
    if (!a || !b || a.val !== b.val) return false;
    q.push([a.left, b.right], [a.right, b.left]);
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['只比較「左子樹的中序」和「右子樹的中序反轉」:形狀不同但走訪順序相同時會誤判', '比較成 `a.left` 對 `b.left`:那是「相同」不是「鏡像」'],
  check: {
    kind: 'fn',
    fn: 'isSymmetric',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: true },
      { args: [[1, 2, 2, null, 3, null, 3]], out: false },
      { args: [[1]], out: true },
      { args: [[1, 2, 3]], out: false },
      { args: [[1, 2, 2, 2, null, 2]], out: false },
    ],
  },
}
