import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [1, null, 0, 0, 1]

function postFig(): FigStep[] {
  return [
    { note: '先看葉子。左下角的 0 沒有孩子，也沒有任何 1，應該刪除。', views: [tree(T, { cls: { 3: 'dim' } })] },
    { note: '右下角的 1 必須留下，因此它的父節點 0 也不能整棵刪掉。', views: [tree([1, null, 0, null, 1], { cls: { 2: 'hl', 4: 'done' } })] },
    { note: '根節點 1 保留，最後得到 [1,null,0,null,1]。', views: [tree([1, null, 0, null, 1], { cls: { 0: 'done', 2: 'done', 4: 'done' } })] },
  ]
}

function queryFig(): FigStep[] {
  return [
    { note: '先問左下 0 的子樹是否含 1：沒有，所以將整棵子樹切掉。', views: [tree(T, { cls: { 3: 'dim' } }), arr([0], { label: '是否含 1' })] },
    { note: '右下 1 的子樹含 1，所以這個孩子要保留。', views: [tree(T, { cls: { 4: 'done' } }), arr([1], { label: '是否含 1' })] },
    { note: '父節點 0 的子樹仍含 1，因此父節點也保留。', views: [tree([1, null, 0, null, 1], { cls: { 2: 'hl' } })] },
    { note: '根的子樹含 1，回傳修剪後的根。', views: [tree([1, null, 0, null, 1], { cls: { 0: 'done' } })] },
  ]
}

export const q0814: Solution = {
  id: 814,
  plain: '從樹的末端往上看：若某整棵子樹完全沒有 1，就把它剪掉。',
  statement: '給一棵只含 0、1 的二元樹，移除所有不含 1 的子樹，回傳修剪後的根。',
  examples: [
    { input: 'root = [1,null,0,0,1]', output: '[1,null,0,null,1]' },
    { input: 'root = [0]', output: '[]' },
  ],
  constraints: ['樹最多 200 個節點；節點值只能是 0 或 1。'],
  insight: ['節點為 0 不代表要刪除，它的後代可能有 1。', '先處理孩子再判斷父節點，符合 [[p:tree-dfs]] 的後序思路。'],
  approaches: [
    {
      name: '後序遞迴修剪',
      idea: '先修剪左右孩子，接著刪掉已變成 0 葉子的節點。',
      steps: ['空節點直接回傳空。', '遞迴修剪左、右子樹，接回目前節點。', '若目前是 0 且沒有孩子，就回傳空；否則保留。'],
      figure: { title: 'root = [1,null,0,0,1]', steps: postFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點只走一次，遞迴深度是樹高。' },
      verdict: '一次走訪就能完成修剪。',
      code: {
        python: `def pruneTree(root):
    if not root:
        return None
    root.left = pruneTree(root.left)      # 先處理孩子
    root.right = pruneTree(root.right)
    if root.val == 0 and not root.left and not root.right:
        return None                       # 整棵子樹沒有 1
    return root

def pruneCheck(root):
    def signature(node):
        if not node:
            return 0
        return (node.val + 2 + 3 * signature(node.left) + 5 * signature(node.right)) % 1000000007
    return signature(pruneTree(root))`,
        c: `struct TreeNode *pruneTree(struct TreeNode *root) {
    if (root == NULL) {
        return NULL;
    }
    root->left = pruneTree(root->left);
    root->right = pruneTree(root->right);
    if (root->val == 0 && root->left == NULL && root->right == NULL) {
        return NULL;
    }
    return root;
}

static int pruneSignature(struct TreeNode *node) {
    if (node == NULL) {
        return 0;
    }
    long long value = node->val + 2LL + 3LL * pruneSignature(node->left) + 5LL * pruneSignature(node->right);
    return value % 1000000007;
}

int pruneCheck(struct TreeNode *root) {
    return pruneSignature(pruneTree(root));
}`,
        cpp: `TreeNode *pruneTree(TreeNode *root) {
    if (root == nullptr) {
        return nullptr;
    }
    root->left = pruneTree(root->left);
    root->right = pruneTree(root->right);
    if (root->val == 0 && root->left == nullptr && root->right == nullptr) {
        return nullptr;
    }
    return root;
}

int pruneSignature(TreeNode *node) {
    if (node == nullptr) {
        return 0;
    }
    long long value = node->val + 2LL + 3LL * pruneSignature(node->left) + 5LL * pruneSignature(node->right);
    return value % 1000000007;
}

int pruneCheck(TreeNode *root) {
    return pruneSignature(pruneTree(root));
}`,
        java: `TreeNode pruneTree(TreeNode root) {
    if (root == null) {
        return null;
    }
    root.left = pruneTree(root.left);
    root.right = pruneTree(root.right);
    if (root.val == 0 && root.left == null && root.right == null) {
        return null;
    }
    return root;
}

int pruneSignature(TreeNode node) {
    if (node == null) {
        return 0;
    }
    long value = node.val + 2L + 3L * pruneSignature(node.left) + 5L * pruneSignature(node.right);
    return (int)(value % 1000000007);
}

int pruneCheck(TreeNode root) {
    return pruneSignature(pruneTree(root));
}`,
        javascript: `function pruneTree(root) {
  if (root === null) {
    return null;
  }
  root.left = pruneTree(root.left);
  root.right = pruneTree(root.right);
  if (root.val === 0 && root.left === null && root.right === null) {
    return null;
  }
  return root;
}

function pruneCheck(root) {
  function signature(node) {
    if (node === null) {
      return 0;
    }
    return (node.val + 2 + 3 * signature(node.left) + 5 * signature(node.right)) % 1000000007;
  }
  return signature(pruneTree(root));
}`,
      },
    },
    {
      name: '對每棵子樹查詢是否含 1',
      idea: '若一棵子樹搜尋不到 1，直接將它切掉。',
      steps: ['containsOne 遞迴查詢子樹是否有 1。', '查詢為否時回傳空。', '查詢為是時分別修剪左右孩子，再回傳目前節點。'],
      figure: { title: '逐棵查詢是否含 1', steps: queryFig() },
      complexity: { time: 'O(n²)', space: 'O(h)', why: '祖先可能重複搜尋同一棵子樹；遞迴深度是樹高。' },
      verdict: '條件好理解，但重複搜尋較多。',
      code: {
        python: `def pruneTree(root):
    def contains_one(node):
        if not node:
            return False
        return node.val == 1 or contains_one(node.left) or contains_one(node.right)

    if not contains_one(root):
        return None                       # 這棵子樹沒有 1
    root.left = pruneTree(root.left)
    root.right = pruneTree(root.right)
    return root

def pruneCheck(root):
    def signature(node):
        if not node:
            return 0
        return (node.val + 2 + 3 * signature(node.left) + 5 * signature(node.right)) % 1000000007
    return signature(pruneTree(root))`,
        c: `static bool containsOne(struct TreeNode *node) {
    if (node == NULL) {
        return false;
    }
    return node->val == 1 || containsOne(node->left) || containsOne(node->right);
}

struct TreeNode *pruneTree(struct TreeNode *root) {
    if (!containsOne(root)) {
        return NULL;
    }
    root->left = pruneTree(root->left);
    root->right = pruneTree(root->right);
    return root;
}

static int pruneSignature(struct TreeNode *node) {
    if (node == NULL) {
        return 0;
    }
    long long value = node->val + 2LL + 3LL * pruneSignature(node->left) + 5LL * pruneSignature(node->right);
    return value % 1000000007;
}

int pruneCheck(struct TreeNode *root) {
    return pruneSignature(pruneTree(root));
}`,
        cpp: `bool containsOne(TreeNode *node) {
    if (node == nullptr) {
        return false;
    }
    return node->val == 1 || containsOne(node->left) || containsOne(node->right);
}

TreeNode *pruneTree(TreeNode *root) {
    if (!containsOne(root)) {
        return nullptr;
    }
    root->left = pruneTree(root->left);
    root->right = pruneTree(root->right);
    return root;
}

int pruneSignature(TreeNode *node) {
    if (node == nullptr) {
        return 0;
    }
    long long value = node->val + 2LL + 3LL * pruneSignature(node->left) + 5LL * pruneSignature(node->right);
    return value % 1000000007;
}

int pruneCheck(TreeNode *root) {
    return pruneSignature(pruneTree(root));
}`,
        java: `boolean containsOne(TreeNode node) {
    if (node == null) {
        return false;
    }
    return node.val == 1 || containsOne(node.left) || containsOne(node.right);
}

TreeNode pruneTree(TreeNode root) {
    if (!containsOne(root)) {
        return null;
    }
    root.left = pruneTree(root.left);
    root.right = pruneTree(root.right);
    return root;
}

int pruneSignature(TreeNode node) {
    if (node == null) {
        return 0;
    }
    long value = node.val + 2L + 3L * pruneSignature(node.left) + 5L * pruneSignature(node.right);
    return (int)(value % 1000000007);
}

int pruneCheck(TreeNode root) {
    return pruneSignature(pruneTree(root));
}`,
        javascript: `function pruneTree(root) {
  function containsOne(node) {
    if (node === null) {
      return false;
    }
    return node.val === 1 || containsOne(node.left) || containsOne(node.right);
  }
  if (!containsOne(root)) {
    return null;
  }
  root.left = pruneTree(root.left);
  root.right = pruneTree(root.right);
  return root;
}

function pruneCheck(root) {
  function signature(node) {
    if (node === null) {
      return 0;
    }
    return (node.val + 2 + 3 * signature(node.left) + 5 * signature(node.right)) % 1000000007;
  }
  return signature(pruneTree(root));
}`,
      },
    },
  ],
  pitfalls: ['值為 0 的節點可能有值為 1 的後代，因此不能一看到 0 就刪。', '整棵樹可能被刪成空樹。'],
  check: {
    kind: 'fn',
    fn: 'pruneCheck',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: 88 },
      { args: [[0]], out: 0 },
      { args: [[1, 0, 1, 0, 0, 0, 1]], out: 93 },
    ],
  },
}
