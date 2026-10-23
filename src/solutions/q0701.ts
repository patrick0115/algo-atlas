import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 701. Insert into a Binary Search Tree

const T = [4, 2, 7, 1, 3]
const V = 5

function walkFig(): FigStep[] {
  return [
    { note: `插入 ${V}:從根開始比大小,比節點小就往左、比節點大就往右,一直走到空位`, views: [tree(T, { cls: { 0: 'hl' }, subs: { 0: `${V} > 4 → 右` } })] },
    { note: `到 7:${V} < 7 → 往左,7 的左邊是空的`, views: [tree(T, { cls: { 0: 'path', 2: 'hl' }, subs: { 2: `${V} < 7 → 左` } })] },
    { note: `把 ${V} 放在那個空位。新節點一定是葉子,原本的結構完全不動`, views: [tree([4, 2, 7, 1, 3, 5], { cls: { 5: 'done' } })] },
  ]
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴寫法:insert(node, v) 回傳「插入後這棵子樹的根」。node 是空的 → 回傳新節點', views: [tree(T, { cls: { 2: 'hl' } })] },
    { note: '否則依大小遞迴到左或右,並把回傳值接回去:`node.left = insert(node.left, v)`。只有空位那層會真的產生新節點', views: [tree([4, 2, 7, 1, 3, 5], { cls: { 5: 'done' } })] },
  ]
}

export const q0701: Solution = {
  id: 701,
  plain: '在一棵二元搜尋樹(左邊都比較小、右邊都比較大)裡加入一個新的數字,加完之後還要是二元搜尋樹。',
  statement: '給 BST 的根 `root` 和要插入的值 `val`(保證原樹中不存在),回傳插入後的 BST 的根。有多種合法答案時,回傳任一種(這裡採用「插在葉子」的標準作法)。',
  examples: [
    { input: 'root = [4,2,7,1,3], val = 5', output: '[4,2,7,1,3,5]' },
    { input: 'root = [40,20,60,10,30,50,70], val = 25', output: '[40,20,60,10,30,50,70,null,null,25]' },
    { input: 'root = [], val = 5', output: '[5]' },
  ],
  constraints: ['節點數 ≤ 10⁴'],
  insight: ['和搜尋一樣比大小往下走,走到空位就放進去', '新節點永遠是葉子,不需要動到其他節點', '空樹時直接回傳新節點'],
  approaches: [
    {
      name: '迭代:往下找空位',
      idea: '`cur = root`;比大小往左或右,遇到空位就接上新節點。',
      steps: ['空樹 → 回傳 `TreeNode(val)`', '`cur = root`', '`val < cur.val`:左邊空 → 接上並結束,否則往左;右邊同理', '回傳 root'],
      figure: { title: `root = [${T}],val = ${V}`, steps: walkFig() },
      complexity: { time: 'O(h)', space: 'O(1)', why: '沿著一條路徑往下。' },
      verdict: '最推薦,[[p:bst]]插入的基本操作。',
      code: {
        python: `def insertIntoBST(root, val):
    node = TreeNode(val)
    if not root:
        return node
    cur = root
    while True:
        if val < cur.val:
            if not cur.left:
                cur.left = node               # 找到空位
                break
            cur = cur.left
        else:
            if not cur.right:
                cur.right = node
                break
            cur = cur.right
    return root`,
        c: `struct TreeNode *insertIntoBST(struct TreeNode *root, int val) {
    struct TreeNode *node = calloc(1, sizeof *node);
    node->val = val;
    if (!root) return node;
    for (struct TreeNode *cur = root;;) {
        struct TreeNode **next = val < cur->val ? &cur->left : &cur->right;
        if (!*next) { *next = node; break; }
        cur = *next;
    }
    return root;
}`,
        cpp: `TreeNode* insertIntoBST(TreeNode* root, int val) {
    TreeNode *node = new TreeNode(val);
    if (!root) return node;
    for (TreeNode *cur = root;;) {
        TreeNode *&next = val < cur->val ? cur->left : cur->right;
        if (!next) { next = node; break; }
        cur = next;
    }
    return root;
}`,
        java: `TreeNode insertIntoBST(TreeNode root, int val) {
    TreeNode node = new TreeNode(val);
    if (root == null) return node;
    TreeNode cur = root;
    while (true) {
        if (val < cur.val) {
            if (cur.left == null) { cur.left = node; break; }
            cur = cur.left;
        } else {
            if (cur.right == null) { cur.right = node; break; }
            cur = cur.right;
        }
    }
    return root;
}`,
        javascript: `function insertIntoBST(root, val) {
  const node = new TreeNode(val);
  if (!root) return node;
  for (let cur = root; ; ) {
    if (val < cur.val) {
      if (!cur.left) {
        cur.left = node;
        break;
      }
      cur = cur.left;
    } else {
      if (!cur.right) {
        cur.right = node;
        break;
      }
      cur = cur.right;
    }
  }
  return root;
}`,
      },
    },
    {
      name: '遞迴',
      idea: '`insert(node, v)`:空 → 新節點;否則 `node.left = insert(node.left, v)` 或 `node.right = insert(node.right, v)`,回傳 node。',
      steps: ['`not root` → 回傳 `TreeNode(val)`', '`val < root.val` → `root.left = insertIntoBST(root.left, val)`', '否則 `root.right = insertIntoBST(root.right, val)`', '回傳 root'],
      figure: { title: `root = [${T}],val = ${V}`, steps: recFig() },
      complexity: { time: 'O(h)', space: 'O(h)', why: '遞迴深度 = 樹高。' },
      verdict: '最短。「回傳新的子樹根再接回去」的寫法,在刪除([450](#/q/450))時也會用到。',
      code: {
        python: `def insertIntoBST(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insertIntoBST(root.left, val)
    else:
        root.right = insertIntoBST(root.right, val)
    return root`,
        c: `struct TreeNode *insertIntoBST(struct TreeNode *root, int val) {
    if (!root) {
        struct TreeNode *n = calloc(1, sizeof *n);
        n->val = val;
        return n;
    }
    if (val < root->val) root->left = insertIntoBST(root->left, val);
    else root->right = insertIntoBST(root->right, val);
    return root;
}`,
        cpp: `TreeNode* insertIntoBST(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val) root->left = insertIntoBST(root->left, val);
    else root->right = insertIntoBST(root->right, val);
    return root;
}`,
        java: `TreeNode insertIntoBST(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    if (val < root.val) root.left = insertIntoBST(root.left, val);
    else root.right = insertIntoBST(root.right, val);
    return root;
}`,
        javascript: `function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}`,
      },
    },
  ],
  pitfalls: ['空樹時沒有特判,直接存取 root.val', '把新值插在中間、重排整棵樹:不需要,插在葉子就合法'],
  check: {
    kind: 'fn',
    fn: 'insertIntoBST',
    argKinds: ['tree', null],
    ret: 'tree',
    cases: [
      { args: [T, V], out: [4, 2, 7, 1, 3, 5] },
      { args: [[40, 20, 60, 10, 30, 50, 70], 25], out: [40, 20, 60, 10, 30, 50, 70, null, null, 25] },
      { args: [[], 5], out: [5] },
      { args: [[4, 2, 7, 1, 3], 0], out: [4, 2, 7, 1, 3, null, null, 0] },
    ],
  },
}
