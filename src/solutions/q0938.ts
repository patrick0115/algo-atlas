import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

const T = [10, 5, 15, 3, 7, null, 18]

export const q0938: Solution = {
  id: 938,
  plain: '在二元搜尋樹裡，把落在指定範圍內的節點數值加起來。',
  statement: '給二元搜尋樹 root 和邊界 low、high，回傳所有 `low ≤ 值 ≤ high` 的節點值總和。',
  examples: [{ input: 'root = [10,5,15,3,7,null,18], low = 7, high = 15', output: '32' }, { input: 'root = [10,5,15,3,7,13,18,1,null,6], low = 6, high = 10', output: '23' }],
  constraints: ['節點數最多 2×10⁴；範圍兩端也要包含。'],
  insight: ['普通遍歷可以逐一判斷所有節點。', '二元搜尋樹左小右大；若目前值小於 low，整棵左子樹都太小，可以跳過。', '這是 [[p:bst]] 的剪枝。'],
  approaches: [
    {
      name: '完整遍歷',
      idea: '每個節點都走到，只把範圍內的值加入總和。',
      steps: ['空節點回傳 0', '目前值落在範圍內就加上', '遞迴加總左右子樹'],
      figure: { title: '範圍 [7,15]', steps: [
        { note: '走到根 10，它在範圍內，總和先是 10。', views: [tree(T, { cls: { 0: 'hl' } }), arr([10], { label: '總和' })] },
        { note: '左邊 5、3 太小，不加；7 合格，總和成 17。', views: [tree(T, { cls: { 1: 'dim', 3: 'dim', 4: 'hl' } }), arr([17], { label: '總和' })] },
        { note: '右邊 15 合格，總和成 32。', views: [tree(T, { cls: { 2: 'hl' } }), arr([32], { label: '總和' })] },
        { note: '18 太大，不加；最後答案仍是 32。', views: [tree(T, { cls: { 6: 'dim' } }), arr([32], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '走過所有節點，遞迴深度為樹高。' },
      verdict: '適用於任何二元樹，也容易核對答案。',
      code: {
        python: `def rangeSumBST(root, low, high):
    if not root:
        return 0
    own = root.val if low <= root.val <= high else 0  # 只加範圍內的值
    return own + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high)`,
        c: `int rangeSumBST(struct TreeNode *root, int low, int high) {
    if (!root) return 0;
    int own = root->val >= low && root->val <= high ? root->val : 0;
    int left = rangeSumBST(root->left, low, high);
    int right = rangeSumBST(root->right, low, high);
    return own + left + right;
}`,
        cpp: `int rangeSumBST(TreeNode* root, int low, int high) {
    if (!root) return 0;
    int own = low <= root->val && root->val <= high ? root->val : 0;
    return own + rangeSumBST(root->left, low, high) + rangeSumBST(root->right, low, high);
}`,
        java: `int rangeSumBST(TreeNode root, int low, int high) {
    if (root == null) return 0;
    int own = low <= root.val && root.val <= high ? root.val : 0;
    int left = rangeSumBST(root.left, low, high);
    int right = rangeSumBST(root.right, low, high);
    return own + left + right;
}`,
        javascript: `function rangeSumBST(root, low, high) {
  if (!root) return 0;
  const own = low <= root.val && root.val <= high ? root.val : 0;
  return own + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}`,
      },
    },
    {
      name: '利用搜尋樹剪枝',
      idea: '目前值太小就只走右邊，太大就只走左邊。',
      steps: ['`值 < low`：左邊全太小，只算右邊', '`值 > high`：右邊全太大，只算左邊', '否則加目前值並走兩邊'],
      figure: { title: '範圍 [7,15]', steps: [
        { note: '根 10 合格，加 10，左右兩邊仍可能有合格值。', views: [tree(T, { cls: { 0: 'hl' } }), arr([10], { label: '總和' })] },
        { note: '5 小於 7，它左邊的 3 更小；整個左分支不用走。', views: [tree(T, { cls: { 1: 'hl', 3: 'dim' } }), arr([10], { label: '總和' })] },
        { note: '走 5 的右孩子 7，加上後是 17。', views: [tree(T, { cls: { 4: 'hl' } }), arr([17], { label: '總和' })] },
        { note: '15 合格，加成 32；18 在右邊且太大，不走。', views: [tree(T, { cls: { 2: 'hl', 6: 'dim' } }), arr([32], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)，通常更少', space: 'O(h)', why: '最壞仍走全部，但可略過整個不可能合格的子樹。' },
      verdict: '推薦；充分利用題目給的搜尋樹性質。',
      code: {
        python: `def rangeSumBST(root, low, high):
    if not root:
        return 0
    if root.val < low:
        return rangeSumBST(root.right, low, high)  # 左子樹全太小
    if root.val > high:
        return rangeSumBST(root.left, low, high)   # 右子樹全太大
    return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high)`,
        c: `int rangeSumBST(struct TreeNode *root, int low, int high) {
    if (!root) return 0;
    if (root->val < low) return rangeSumBST(root->right, low, high);
    if (root->val > high) return rangeSumBST(root->left, low, high);
    return root->val + rangeSumBST(root->left, low, high) + rangeSumBST(root->right, low, high);
}`,
        cpp: `int rangeSumBST(TreeNode* root, int low, int high) {
    if (!root) return 0;
    if (root->val < low) return rangeSumBST(root->right, low, high);
    if (root->val > high) return rangeSumBST(root->left, low, high);
    return root->val + rangeSumBST(root->left, low, high) + rangeSumBST(root->right, low, high);
}`,
        java: `int rangeSumBST(TreeNode root, int low, int high) {
    if (root == null) return 0;
    if (root.val < low) return rangeSumBST(root.right, low, high);
    if (root.val > high) return rangeSumBST(root.left, low, high);
    return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}`,
        javascript: `function rangeSumBST(root, low, high) {
  if (!root) return 0;
  if (root.val < low) return rangeSumBST(root.right, low, high);
  if (root.val > high) return rangeSumBST(root.left, low, high);
  return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}`,
      },
    },
  ],
  pitfalls: ['範圍是閉區間；值剛好等於 low 或 high 時必須加入。', '剪枝只適用於二元搜尋樹，普通二元樹不能跳過整棵子樹。'],
  check: { kind: 'fn', fn: 'rangeSumBST', argKinds: ['tree', null, null], cases: [
    { args: [T, 7, 15], out: 32 },
    { args: [[10, 5, 15, 3, 7, 13, 18, 1, null, 6], 6, 10], out: 23 },
    { args: [[1], 1, 1], out: 1 },
  ] },
}
