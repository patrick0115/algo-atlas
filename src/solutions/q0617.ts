import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 617. Merge Two Binary Trees

const T1 = [1, 3, 2, 5]
const T2 = [2, 1, 3, null, 4, null, 7]
const RES = [3, 4, 5, 5, 4, null, 7]

function recFig(): FigStep[] {
  return [
    { note: '把兩棵樹疊在一起:同一個位置兩邊都有節點 → 值相加;只有一邊有 → 直接用那一邊', views: [tree(T1, { label: 'root1' }), tree(T2, { label: 'root2' })] },
    { note: '根:1 + 2 = 3。左孩子:3 + 1 = 4;右孩子:2 + 3 = 5', views: [tree([3, 4, 5], { cls: { 0: 'hl', 1: 'hl', 2: 'hl' } })] },
    { note: '再往下:5 只在 root1 → 直接接上;4 只在 root2 → 接上;7 只在 root2 → 接上。只有一邊有的整棵子樹直接拿來用,不用再往下遞迴', views: [tree(RES, { cls: { 3: 'done', 4: 'done', 6: 'done' } })] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: '迭代版:用佇列放「要合併的一對節點」(t1 的節點, t2 的節點),結果直接寫在 root1 上', views: [tree(T1, { cls: { 0: 'hl' }, label: 'root1(會被修改)' }), tree(T2, { cls: { 0: 'hl' }, label: 'root2' })] },
    { note: '取出一對:t1.val += t2.val。左邊:兩邊都有 → 這一對入隊;只有 t2 有 → t1.left = t2.left。右邊同理', views: [tree(RES, { cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

export const q0617: Solution = {
  id: 617,
  plain: '把兩棵二元樹「疊」在一起:重疊的位置把兩個值加起來,只有其中一棵有節點的位置就用那個節點。',
  statement: '給兩棵二元樹 `root1`、`root2`,把它們合併:若兩個節點重疊,新節點的值為兩者之和;否則用非空的那個節點。從根開始合併,回傳合併後的樹。',
  examples: [
    { input: 'root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7]', output: '[3,4,5,5,4,null,7]' },
    { input: 'root1 = [1], root2 = [1,2]', output: '[2,2]' },
  ],
  constraints: ['節點數 ≤ 2000'],
  insight: ['同一個位置的兩個節點一起往下走 → 兩棵樹同時遞迴', '任一邊是空的 → 直接回傳另一邊(整棵子樹接上)', '兩邊都有 → 值相加,左右孩子分別遞迴'],
  approaches: [
    {
      name: '同時遞迴兩棵樹',
      idea: '`merge(a, b)`:a 空回傳 b、b 空回傳 a;否則 `a.val += b.val`,左右各自 merge。',
      steps: ['`not a` → 回傳 b;`not b` → 回傳 a', '`a.val += b.val`', '`a.left = merge(a.left, b.left)`、`a.right = merge(a.right, b.right)`', '回傳 a'],
      figure: { title: 'root1、root2', steps: recFig() },
      complexity: { time: 'O(min(n₁, n₂))', space: 'O(min(h₁, h₂))', why: '只有兩邊都有的節點才需要處理;一邊空就直接接上。' },
      verdict: '最推薦,[[p:tree-dfs]]「兩棵樹一起走」的入門題,和 [100. Same Tree](#/q/100) 同一個結構。',
      code: {
        python: `def mergeTrees(root1, root2):
    if not root1:
        return root2                          # 一邊空:整棵子樹直接用另一邊
    if not root2:
        return root1
    root1.val += root2.val
    root1.left = mergeTrees(root1.left, root2.left)
    root1.right = mergeTrees(root1.right, root2.right)
    return root1`,
        c: `struct TreeNode *mergeTrees(struct TreeNode *root1, struct TreeNode *root2) {
    if (!root1) return root2;
    if (!root2) return root1;
    root1->val += root2->val;
    root1->left = mergeTrees(root1->left, root2->left);
    root1->right = mergeTrees(root1->right, root2->right);
    return root1;
}`,
        cpp: `TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
    if (!root1) return root2;
    if (!root2) return root1;
    root1->val += root2->val;
    root1->left = mergeTrees(root1->left, root2->left);
    root1->right = mergeTrees(root1->right, root2->right);
    return root1;
}`,
        java: `TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
    if (root1 == null) return root2;
    if (root2 == null) return root1;
    root1.val += root2.val;
    root1.left = mergeTrees(root1.left, root2.left);
    root1.right = mergeTrees(root1.right, root2.right);
    return root1;
}`,
        javascript: `function mergeTrees(root1, root2) {
  if (!root1) return root2;
  if (!root2) return root1;
  root1.val += root2.val;
  root1.left = mergeTrees(root1.left, root2.left);
  root1.right = mergeTrees(root1.right, root2.right);
  return root1;
}`,
      },
    },
    {
      name: '佇列(成對 BFS)',
      idea: '佇列放 (a, b);a.val += b.val;左右孩子兩邊都有就入隊,只有 b 有就接到 a 上。',
      steps: ['`root1` 空 → 回傳 root2', '`q = [(root1, root2)]`', '取出 (a, b):`b` 空就跳過;`a.val += b.val`', '左:兩邊都有 → 入隊;`a.left` 空 → `a.left = b.left`;右邊同理'],
      figure: { title: 'root1、root2', steps: bfsFig() },
      complexity: { time: 'O(min(n₁, n₂))', space: 'O(min(n₁, n₂))', why: '佇列最多存一層的節點對。' },
      verdict: '不用遞迴,避免很深的樹造成堆疊溢位。',
      code: {
        python: `from collections import deque

def mergeTrees(root1, root2):
    if not root1:
        return root2
    q = deque([(root1, root2)])
    while q:
        a, b = q.popleft()
        if not b:
            continue
        a.val += b.val
        if a.left and b.left:
            q.append((a.left, b.left))
        elif not a.left:
            a.left = b.left                   # 只有 b 有:整棵接過來
        if a.right and b.right:
            q.append((a.right, b.right))
        elif not a.right:
            a.right = b.right
    return root1`,
        c: `struct TreeNode *mergeTrees(struct TreeNode *root1, struct TreeNode *root2) {
    if (!root1) return root2;
    struct TreeNode *qa[2048], *qb[2048];
    int h = 0, t = 0;
    qa[t] = root1; qb[t++] = root2;
    while (h < t) {
        struct TreeNode *a = qa[h], *b = qb[h++];
        if (!b) continue;
        a->val += b->val;
        if (a->left && b->left) { qa[t] = a->left; qb[t++] = b->left; }
        else if (!a->left) a->left = b->left;
        if (a->right && b->right) { qa[t] = a->right; qb[t++] = b->right; }
        else if (!a->right) a->right = b->right;
    }
    return root1;
}`,
        cpp: `TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
    if (!root1) return root2;
    queue<pair<TreeNode*, TreeNode*>> q;
    q.push({root1, root2});
    while (!q.empty()) {
        auto [a, b] = q.front(); q.pop();
        if (!b) continue;
        a->val += b->val;
        if (a->left && b->left) q.push({a->left, b->left});
        else if (!a->left) a->left = b->left;
        if (a->right && b->right) q.push({a->right, b->right});
        else if (!a->right) a->right = b->right;
    }
    return root1;
}`,
        java: `TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
    if (root1 == null) return root2;
    Deque<TreeNode[]> q = new ArrayDeque<>();
    q.offer(new TreeNode[]{root1, root2});
    while (!q.isEmpty()) {
        TreeNode[] p = q.poll();
        TreeNode a = p[0], b = p[1];
        if (b == null) continue;
        a.val += b.val;
        if (a.left != null && b.left != null) q.offer(new TreeNode[]{a.left, b.left});
        else if (a.left == null) a.left = b.left;
        if (a.right != null && b.right != null) q.offer(new TreeNode[]{a.right, b.right});
        else if (a.right == null) a.right = b.right;
    }
    return root1;
}`,
        javascript: `function mergeTrees(root1, root2) {
  if (!root1) return root2;
  const q = [[root1, root2]];
  for (let h = 0; h < q.length; h++) {
    const [a, b] = q[h];
    if (!b) continue;
    a.val += b.val;
    if (a.left && b.left) q.push([a.left, b.left]);
    else if (!a.left) a.left = b.left;
    if (a.right && b.right) q.push([a.right, b.right]);
    else if (!a.right) a.right = b.right;
  }
  return root1;
}`,
      },
    },
  ],
  pitfalls: ['一邊為空時還繼續往下遞迴:要直接回傳另一邊', 'BFS 版只有 b 有孩子時忘了接到 a 上'],
  check: {
    kind: 'fn',
    fn: 'mergeTrees',
    argKinds: ['tree', 'tree'],
    ret: 'tree',
    cases: [
      { args: [T1, T2], out: RES },
      { args: [[1], [1, 2]], out: [2, 2] },
      { args: [[], [1]], out: [1] },
      { args: [[], []], out: [] },
    ],
  },
}
