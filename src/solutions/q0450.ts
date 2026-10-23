import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 450. Delete Node in a BST

const T = [5, 3, 6, 2, 4, null, 7]
const KEY = 3

function recFig(): FigStep[] {
  return [
    { note: `刪除 ${KEY}:先照 BST 的規則找到它(比 5 小 → 往左)`, views: [tree(T, { cls: { 0: 'path', 1: 'hl' } })] },
    { note: '找到之後分三種情況:① 沒有孩子 → 直接刪;② 只有一個孩子 → 用那個孩子頂替;③ 兩個孩子都有 → 用「右子樹裡最小的」(後繼者)頂替', views: [tree(T, { cls: { 1: 'hl', 4: 'cur' }, subs: { 4: '後繼者' } })] },
    { note: '3 有兩個孩子:右子樹最小的是 4 → 把 3 的值換成 4,再到右子樹裡把原本的 4 刪掉(它最多只有右孩子,屬於情況 ① 或 ②)', views: [tree([5, 4, 6, 2, null, null, 7], { cls: { 1: 'done' } })] },
  ]
}

function iterFig(): FigStep[] {
  return [
    { note: '迭代版:用 parent 指標找到要刪的節點,然後處理成「最多一個孩子」的情況', views: [tree(T, { cls: { 1: 'hl' } })] },
    { note: '兩個孩子:找右子樹最小的節點 s(記住它的父親),把值搬過來,改成刪除 s。s 沒有左孩子,用它的右孩子頂替即可', views: [tree([5, 4, 6, 2, null, null, 7], { cls: { 1: 'done' } })] },
  ]
}

export const q0450: Solution = {
  id: 450,
  plain: '從二元搜尋樹裡刪掉某個值的節點,刪完之後還要是二元搜尋樹。難的是被刪的節點有兩個孩子的時候,要找誰來補它的位置。',
  statement: '給 BST 的根 `root` 和 `key`,刪除值為 key 的節點(若存在),回傳可能更新後的根。答案不唯一;這裡採用「兩個孩子時,用右子樹的最小值(後繼者)取代」的作法。',
  examples: [
    { input: 'root = [5,3,6,2,4,null,7], key = 3', output: '[5,4,6,2,null,null,7]' },
    { input: 'root = [5,3,6,2,4,null,7], key = 0', output: '[5,3,6,2,4,null,7]', note: '找不到就不變' },
    { input: 'root = [], key = 0', output: '[]' },
  ],
  constraints: ['節點數 ≤ 10⁴', 'Follow-up:O(h) 時間'],
  insight: ['先找到節點(比大小往下走)', '沒孩子 / 一個孩子:直接拿孩子頂替', '兩個孩子:後繼者(右子樹最左邊)比左子樹全部大、比右子樹其他全部小 → 拿它的值來頂替,再去右子樹刪掉它'],
  approaches: [
    {
      name: '遞迴 + 後繼者取代',
      idea: '`delete(n, key)` 回傳刪除後的子樹根;找到時依孩子數處理,兩個孩子就把後繼者的值搬上來,再遞迴刪掉後繼者。',
      steps: ['空 → None;`key < val` → `left = delete(left, key)`;`key > val` → `right = delete(right, key)`', '找到:沒有左 → 回傳 right;沒有右 → 回傳 left', '都有:`s = right` 一路往左;`n.val = s.val`;`n.right = delete(n.right, s.val)`', '回傳 n'],
      figure: { title: `root = [${T}],key = ${KEY}`, steps: recFig() },
      complexity: { time: 'O(h)', space: 'O(h)', why: '找節點 + 找後繼者都沿著一條路徑。' },
      verdict: '最推薦,[[p:bst]]刪除的標準寫法(和 [701](#/q/701) 一樣用「回傳新子樹根」)。',
      code: {
        python: `def deleteNode(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = deleteNode(root.left, key)
    elif key > root.val:
        root.right = deleteNode(root.right, key)
    else:
        if not root.left:
            return root.right                 # 0 或 1 個孩子:孩子頂替
        if not root.right:
            return root.left
        s = root.right
        while s.left:
            s = s.left                        # 後繼者:右子樹最小的
        root.val = s.val
        root.right = deleteNode(root.right, s.val)
    return root`,
        c: `struct TreeNode *deleteNode(struct TreeNode *root, int key) {
    if (!root) return NULL;
    if (key < root->val) root->left = deleteNode(root->left, key);
    else if (key > root->val) root->right = deleteNode(root->right, key);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        struct TreeNode *s = root->right;
        while (s->left) s = s->left;
        root->val = s->val;
        root->right = deleteNode(root->right, s->val);
    }
    return root;
}`,
        cpp: `TreeNode* deleteNode(TreeNode* root, int key) {
    if (!root) return nullptr;
    if (key < root->val) root->left = deleteNode(root->left, key);
    else if (key > root->val) root->right = deleteNode(root->right, key);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        TreeNode *s = root->right;
        while (s->left) s = s->left;
        root->val = s->val;
        root->right = deleteNode(root->right, s->val);
    }
    return root;
}`,
        java: `TreeNode deleteNode(TreeNode root, int key) {
    if (root == null) return null;
    if (key < root.val) root.left = deleteNode(root.left, key);
    else if (key > root.val) root.right = deleteNode(root.right, key);
    else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        TreeNode s = root.right;
        while (s.left != null) s = s.left;
        root.val = s.val;
        root.right = deleteNode(root.right, s.val);
    }
    return root;
}`,
        javascript: `function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let s = root.right;
    while (s.left) s = s.left;
    root.val = s.val;
    root.right = deleteNode(root.right, s.val);
  }
  return root;
}`,
      },
    },
    {
      name: '迭代 + 父節點指標',
      idea: '找到節點和它的父親;兩個孩子時先把後繼者的值搬上來,改成刪除後繼者;最後用「唯一的孩子」頂替被刪的節點。',
      steps: ['`p = None`、`cur = root`:找 key,同時記父親', '找不到 → 回傳 root', '兩個孩子:找後繼者 s 和它的父親 sp;`cur.val = s.val`;改成刪除 s(`p, cur = sp, s`)', '`child = cur.left or cur.right`;`p` 是空 → 回傳 child;否則把 p 指向 cur 的那邊改成 child'],
      figure: { title: `root = [${T}],key = ${KEY}`, steps: iterFig() },
      complexity: { time: 'O(h)', space: 'O(1)', why: '沒有遞迴。' },
      verdict: '空間 O(1),但要小心處理「刪的是根」和「後繼者就是右孩子」這兩個邊界。',
      code: {
        python: `def deleteNode(root, key):
    p, cur = None, root
    while cur and cur.val != key:
        p, cur = cur, (cur.left if key < cur.val else cur.right)
    if not cur:
        return root                           # 找不到
    if cur.left and cur.right:
        sp, s = cur, cur.right
        while s.left:
            sp, s = s, s.left
        cur.val = s.val                       # 後繼者的值搬上來
        p, cur = sp, s                        # 改成刪除後繼者(它沒有左孩子)
    child = cur.left or cur.right
    if not p:
        return child                          # 刪的是根
    if p.left is cur:
        p.left = child
    else:
        p.right = child
    return root`,
        c: `struct TreeNode *deleteNode(struct TreeNode *root, int key) {
    struct TreeNode *p = NULL, *cur = root;
    while (cur && cur->val != key) { p = cur; cur = key < cur->val ? cur->left : cur->right; }
    if (!cur) return root;
    if (cur->left && cur->right) {
        struct TreeNode *sp = cur, *s = cur->right;
        while (s->left) { sp = s; s = s->left; }
        cur->val = s->val;
        p = sp; cur = s;
    }
    struct TreeNode *child = cur->left ? cur->left : cur->right;
    if (!p) return child;
    if (p->left == cur) p->left = child;
    else p->right = child;
    return root;
}`,
        cpp: `TreeNode* deleteNode(TreeNode* root, int key) {
    TreeNode *p = nullptr, *cur = root;
    while (cur && cur->val != key) { p = cur; cur = key < cur->val ? cur->left : cur->right; }
    if (!cur) return root;
    if (cur->left && cur->right) {
        TreeNode *sp = cur, *s = cur->right;
        while (s->left) { sp = s; s = s->left; }
        cur->val = s->val;
        p = sp; cur = s;
    }
    TreeNode *child = cur->left ? cur->left : cur->right;
    if (!p) return child;
    (p->left == cur ? p->left : p->right) = child;
    return root;
}`,
        java: `TreeNode deleteNode(TreeNode root, int key) {
    TreeNode p = null, cur = root;
    while (cur != null && cur.val != key) { p = cur; cur = key < cur.val ? cur.left : cur.right; }
    if (cur == null) return root;
    if (cur.left != null && cur.right != null) {
        TreeNode sp = cur, s = cur.right;
        while (s.left != null) { sp = s; s = s.left; }
        cur.val = s.val;
        p = sp; cur = s;
    }
    TreeNode child = cur.left != null ? cur.left : cur.right;
    if (p == null) return child;
    if (p.left == cur) p.left = child;
    else p.right = child;
    return root;
}`,
        javascript: `function deleteNode(root, key) {
  let p = null, cur = root;
  while (cur && cur.val !== key) {
    p = cur;
    cur = key < cur.val ? cur.left : cur.right;
  }
  if (!cur) return root;
  if (cur.left && cur.right) {
    let sp = cur, s = cur.right;
    while (s.left) {
      sp = s;
      s = s.left;
    }
    cur.val = s.val;
    p = sp;
    cur = s;
  }
  const child = cur.left || cur.right;
  if (!p) return child;
  if (p.left === cur) p.left = child;
  else p.right = child;
  return root;
}`,
      },
    },
  ],
  pitfalls: ['兩個孩子時直接把左子樹接到右子樹:合法但會讓樹變得很高', '迭代版後繼者剛好就是 cur.right 時,要改的是 sp.right 不是 sp.left(用「p.left 是不是 cur」來判斷)', '刪的是根時要回傳新的根'],
  check: {
    kind: 'fn',
    fn: 'deleteNode',
    argKinds: ['tree', null],
    ret: 'tree',
    cases: [
      { args: [T, KEY], out: [5, 4, 6, 2, null, null, 7] },
      { args: [T, 0], out: T },
      { args: [[], 0], out: [] },
      { args: [T, 5], out: [6, 3, 7, 2, 4] },
      { args: [[1], 1], out: [] },
      { args: [[2, 1], 2], out: [1] },
    ],
  },
}
