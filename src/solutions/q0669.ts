import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 669. Trim a Binary Search Tree

const T = [3, 0, 4, null, 2, null, null, 1]
const LO = 1
const HI = 3

function recFig(): FigStep[] {
  return [
    { note: `只留下值在 [${LO}, ${HI}] 的節點,而且剩下的還要是 BST。看根 3:在範圍內,保留,左右子樹各自修剪`, views: [tree(T, { cls: { 0: 'hl' } })] },
    { note: `左孩子 0 < ${LO}:0 和它的**整個左子樹**都太小,直接丟掉;答案只可能在 0 的右子樹 → 回傳 trim(0.right)`, views: [tree(T, { cls: { 1: 'dim', 3: 'hl' } })] },
    { note: `右孩子 4 > ${HI}:4 和它的右子樹都太大 → 回傳 trim(4.left) = 空。結果 [3, 2, null, 1]`, views: [tree([3, 2, null, 1], { cls: { 0: 'done', 1: 'done', 3: 'done' } })] },
  ]
}

function iterFig(): FigStep[] {
  return [
    { note: '迭代版:① 先把根移到範圍內(根太小就往右、太大就往左)', views: [tree(T, { cls: { 0: 'hl' } })] },
    { note: '② 從根往左走:左孩子太小就換成它的右孩子(重複直到合法),再往左下;③ 右邊對稱處理。不需要遞迴', views: [tree([3, 2, null, 1], { cls: { 0: 'done' } })] },
  ]
}

export const q0669: Solution = {
  id: 669,
  plain: '修剪一棵二元搜尋樹:只留下值在 [low, high] 之間的節點,其餘的剪掉;剩下的節點相對位置要維持 BST 的樣子。',
  statement: '給 BST 的根 `root` 和邊界 `low`、`high`,修剪這棵樹使所有節點值都落在 [low, high],且保持剩餘節點的相對結構(仍是 BST)。回傳新的根(根可能改變)。',
  examples: [
    { input: 'root = [1,0,2], low = 1, high = 2', output: '[1,null,2]' },
    { input: 'root = [3,0,4,null,2,null,null,1], low = 1, high = 3', output: '[3,2,null,1]' },
  ],
  constraints: ['節點數 ≤ 10⁴'],
  insight: ['節點值 < low → 它和它的左子樹全部太小,答案在它的右子樹裡', '節點值 > high → 它和右子樹全部太大,答案在左子樹裡', '在範圍內 → 保留,左右子樹各自修剪'],
  approaches: [
    {
      name: '遞迴',
      idea: '`trim(n)`:空 → 空;`n.val < low` → `trim(n.right)`;`n.val > high` → `trim(n.left)`;否則修剪左右、回傳 n。',
      steps: ['空 → None', '`val < low` → 回傳 `trim(right)`', '`val > high` → 回傳 `trim(left)`', '否則 `left = trim(left)`、`right = trim(right)`,回傳自己'],
      figure: { title: `low = ${LO},high = ${HI}`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點最多看一次。' },
      verdict: '最推薦。BST 性質讓我們可以「整棵子樹一起丟掉」。',
      code: {
        python: `def trimBST(root, low, high):
    if not root:
        return None
    if root.val < low:
        return trimBST(root.right, low, high)  # 自己和左邊都太小
    if root.val > high:
        return trimBST(root.left, low, high)   # 自己和右邊都太大
    root.left = trimBST(root.left, low, high)
    root.right = trimBST(root.right, low, high)
    return root`,
        c: `struct TreeNode *trimBST(struct TreeNode *root, int low, int high) {
    if (!root) return NULL;
    if (root->val < low) return trimBST(root->right, low, high);
    if (root->val > high) return trimBST(root->left, low, high);
    root->left = trimBST(root->left, low, high);
    root->right = trimBST(root->right, low, high);
    return root;
}`,
        cpp: `TreeNode* trimBST(TreeNode* root, int low, int high) {
    if (!root) return nullptr;
    if (root->val < low) return trimBST(root->right, low, high);
    if (root->val > high) return trimBST(root->left, low, high);
    root->left = trimBST(root->left, low, high);
    root->right = trimBST(root->right, low, high);
    return root;
}`,
        java: `TreeNode trimBST(TreeNode root, int low, int high) {
    if (root == null) return null;
    if (root.val < low) return trimBST(root.right, low, high);
    if (root.val > high) return trimBST(root.left, low, high);
    root.left = trimBST(root.left, low, high);
    root.right = trimBST(root.right, low, high);
    return root;
}`,
        javascript: `function trimBST(root, low, high) {
  if (!root) return null;
  if (root.val < low) return trimBST(root.right, low, high);
  if (root.val > high) return trimBST(root.left, low, high);
  root.left = trimBST(root.left, low, high);
  root.right = trimBST(root.right, low, high);
  return root;
}`,
      },
    },
    {
      name: '迭代(先定根,再修左右兩側)',
      idea: '先把根移進範圍;然後沿著左側一路往下,遇到太小的左孩子就換成它的右孩子;右側對稱。',
      steps: ['`while root and not (low ≤ root.val ≤ high)`:太小往右、太大往左', '`cur = root`:`while cur`:`while cur.left and cur.left.val < low`:`cur.left = cur.left.right`;`cur = cur.left`', '`cur = root`:`while cur`:`while cur.right and cur.right.val > high`:`cur.right = cur.right.left`;`cur = cur.right`', '回傳 root'],
      figure: { title: `low = ${LO},high = ${HI}`, steps: iterFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用幾個指標。' },
      verdict: '不用遞迴。關鍵觀察:根定好之後,左側只可能有「太小」的節點,右側只可能有「太大」的。',
      code: {
        python: `def trimBST(root, low, high):
    while root and not (low <= root.val <= high):
        root = root.right if root.val < low else root.left   # 先找到合法的根
    cur = root
    while cur:                                # 左側只會有太小的
        while cur.left and cur.left.val < low:
            cur.left = cur.left.right
        cur = cur.left
    cur = root
    while cur:                                # 右側只會有太大的
        while cur.right and cur.right.val > high:
            cur.right = cur.right.left
        cur = cur.right
    return root`,
        c: `struct TreeNode *trimBST(struct TreeNode *root, int low, int high) {
    while (root && (root->val < low || root->val > high)) root = root->val < low ? root->right : root->left;
    for (struct TreeNode *cur = root; cur; cur = cur->left)
        while (cur->left && cur->left->val < low) cur->left = cur->left->right;
    for (struct TreeNode *cur = root; cur; cur = cur->right)
        while (cur->right && cur->right->val > high) cur->right = cur->right->left;
    return root;
}`,
        cpp: `TreeNode* trimBST(TreeNode* root, int low, int high) {
    while (root && (root->val < low || root->val > high)) root = root->val < low ? root->right : root->left;
    for (TreeNode *cur = root; cur; cur = cur->left)
        while (cur->left && cur->left->val < low) cur->left = cur->left->right;
    for (TreeNode *cur = root; cur; cur = cur->right)
        while (cur->right && cur->right->val > high) cur->right = cur->right->left;
    return root;
}`,
        java: `TreeNode trimBST(TreeNode root, int low, int high) {
    while (root != null && (root.val < low || root.val > high)) root = root.val < low ? root.right : root.left;
    for (TreeNode cur = root; cur != null; cur = cur.left)
        while (cur.left != null && cur.left.val < low) cur.left = cur.left.right;
    for (TreeNode cur = root; cur != null; cur = cur.right)
        while (cur.right != null && cur.right.val > high) cur.right = cur.right.left;
    return root;
}`,
        javascript: `function trimBST(root, low, high) {
  while (root && (root.val < low || root.val > high)) root = root.val < low ? root.right : root.left;
  for (let cur = root; cur; cur = cur.left) while (cur.left && cur.left.val < low) cur.left = cur.left.right;
  for (let cur = root; cur; cur = cur.right) while (cur.right && cur.right.val > high) cur.right = cur.right.left;
  return root;
}`,
      },
    },
  ],
  pitfalls: ['節點太小時把整個節點(連同右子樹)丟掉:右子樹裡可能還有合法的值', '只修剪一層:被接上來的子樹也可能還要再修'],
  check: {
    kind: 'fn',
    fn: 'trimBST',
    argKinds: ['tree', null, null],
    ret: 'tree',
    cases: [
      { args: [[1, 0, 2], 1, 2], out: [1, null, 2] },
      { args: [T, LO, HI], out: [3, 2, null, 1] },
      { args: [[1], 2, 4], out: [] },
      { args: [[5, 3, 8, 1, 4, 7, 9], 4, 7], out: [5, 4, 7] },
    ],
  },
}
