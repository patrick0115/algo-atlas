import { tree } from './fig'
import type { Solution } from './types'

// 700. Search in a Binary Search Tree
const T = [4, 2, 7, 1, 3]
const walk = [
  { note: '從根節點 4 開始；BST 的左邊較小、右邊較大。', views: [tree(T, { cls: { 0: 'hl' } })] },
  { note: '目標 2 小於 4，所以只需要走左子樹；右子樹可以整棵略過。', views: [tree(T, { cls: { 1: 'hl', 2: 'dim' } })] },
  { note: '目前節點就是 2，回傳這個節點；它下面的 1、3 也一起保留。', views: [tree(T, { cls: { 1: 'done', 3: 'done', 4: 'done', 0: 'dim', 2: 'dim' } })] },
]

const CHECK = {
  python: `

def searchBSTCheck(root, val):
    expected = root
    while expected and expected.val != val:
        expected = expected.left if val < expected.val else expected.right
    return int(searchBST(root, val) is expected)  # 必須是原樹裡的同一節點`,
  c: `

int searchBSTCheck(struct TreeNode *root, int val) {
    struct TreeNode *expected = root;
    while (expected && expected->val != val) {
        expected = val < expected->val ? expected->left : expected->right;
    }
    return searchBST(root, val) == expected;
}`,
  cpp: `

int searchBSTCheck(TreeNode* root, int val) {
    TreeNode* expected = root;
    while (expected && expected->val != val) {
        expected = val < expected->val ? expected->left : expected->right;
    }
    return searchBST(root, val) == expected;
}`,
  java: `

int searchBSTCheck(TreeNode root, int val) {
    TreeNode expected = root;
    while (expected != null && expected.val != val) {
        expected = val < expected.val ? expected.left : expected.right;
    }
    return searchBST(root, val) == expected ? 1 : 0;
}`,
  javascript: `

function searchBSTCheck(root, val) {
  let expected = root;
  while (expected && expected.val !== val) {
    expected = val < expected.val ? expected.left : expected.right;
  }
  return +(searchBST(root, val) === expected);
}`,
}

export const q0700: Solution = {
  id: 700,
  plain: '在二元搜尋樹裡找一個值，找到後交出以它為根的整棵小樹。',
  statement: '給二元搜尋樹 `root` 與整數 `val`。找到值相同的節點就回傳該節點；找不到回傳 `null`。',
  examples: [
    { input: 'root = [4,2,7,1,3], val = 2', output: '[2,1,3]' },
    { input: 'root = [4,2,7,1,3], val = 5', output: 'null' },
  ],
  constraints: ['節點數最多 5000；BST 的左子樹值較小、右子樹值較大。'],
  insight: ['利用 [[p:bst]] 的大小關係，每次只走一邊；找到時回傳原本的節點，不能另外造一個只有值的新節點。'],
  approaches: [
    {
      name: '迴圈沿一條路尋找',
      idea: '比較目前節點與目標，決定往左或往右。',
      steps: ['令 `cur = root`。', '若值相等就回傳 `cur`。', '目標較小往左，否則往右；走到空節點代表找不到。'],
      figure: { title: 'root = [4,2,7,1,3], val = 2', steps: walk },
      complexity: { time: 'O(h)', space: 'O(1)', why: '只走一條高度為 h 的路徑。' },
      verdict: '空間最省；樹偏斜時最壞要走 n 個節點。',
      code: {
        python: `def searchBST(root, val):
    cur = root
    while cur:
        if cur.val == val:
            return cur                  # 回傳原節點，保留整棵子樹
        if val < cur.val:
            cur = cur.left              # 小值只可能在左邊
        else:
            cur = cur.right
    return None${CHECK.python}`,
        c: `struct TreeNode *searchBST(struct TreeNode *root, int val) {
    while (root) {
        if (root->val == val) return root;
        if (val < root->val) root = root->left;
        else root = root->right;
    }
    return NULL;
}${CHECK.c}`,
        cpp: `TreeNode* searchBST(TreeNode* root, int val) {
    while (root) {
        if (root->val == val) return root;
        if (val < root->val) root = root->left;
        else root = root->right;
    }
    return nullptr;
}${CHECK.cpp}`,
        java: `TreeNode searchBST(TreeNode root, int val) {
    while (root != null) {
        if (root.val == val) return root;
        if (val < root.val) root = root.left;
        else root = root.right;
    }
    return null;
}${CHECK.java}`,
        javascript: `function searchBST(root, val) {
  while (root) {
    if (root.val === val) return root;
    if (val < root.val) root = root.left;
    else root = root.right;
  }
  return null;
}${CHECK.javascript}`,
      },
    },
    {
      name: '遞迴沿一條路尋找',
      idea: '把「到下一個節點繼續找」交給下一層函式。',
      steps: ['空節點回傳空。', '值相等回傳目前節點。', '依大小只遞迴左邊或右邊，並原樣回傳結果。'],
      figure: { title: 'root = [4,2,7,1,3], val = 2', steps: walk },
      complexity: { time: 'O(h)', space: 'O(h)', why: '遞迴堆疊最多有 h 層。' },
      verdict: '寫法簡短；深度很大時迴圈版較安全。',
      code: {
        python: `def searchBST(root, val):
    if not root or root.val == val:
        return root                  # 空節點或找到答案
    if val < root.val:
        return searchBST(root.left, val)
    return searchBST(root.right, val)${CHECK.python}`,
        c: `struct TreeNode *searchBST(struct TreeNode *root, int val) {
    if (!root || root->val == val) return root;
    if (val < root->val) return searchBST(root->left, val);
    return searchBST(root->right, val);
}${CHECK.c}`,
        cpp: `TreeNode* searchBST(TreeNode* root, int val) {
    if (!root || root->val == val) return root;
    if (val < root->val) return searchBST(root->left, val);
    return searchBST(root->right, val);
}${CHECK.cpp}`,
        java: `TreeNode searchBST(TreeNode root, int val) {
    if (root == null || root.val == val) return root;
    if (val < root.val) return searchBST(root.left, val);
    return searchBST(root.right, val);
}${CHECK.java}`,
        javascript: `function searchBST(root, val) {
  if (!root || root.val === val) return root;
  if (val < root.val) return searchBST(root.left, val);
  return searchBST(root.right, val);
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['回傳的是節點，不只是值；回傳原節點才能包含它的子樹。', '樹為空時要回傳空。'],
  check: {
    kind: 'fn', fn: 'searchBSTCheck', argKinds: ['tree', null],
    cases: [
      { args: [T, 2], out: 1 },
      { args: [T, 5], out: 1 },
      { args: [[1], 1], out: 1 },
    ],
  },
}
