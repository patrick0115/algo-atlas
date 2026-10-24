import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [1, 2, 3, 4, 5, 6]

function dfsFig(): FigStep[] {
  return [
    { note: '從根 1 出發，數自己 1 個，再分別數左、右子樹。', views: [tree(T, { cls: { 0: 'hl' } })] },
    { note: '左子樹有 2、4、5，共 3 個；每個節點都只看一次。', views: [tree(T, { cls: { 1: 'done', 3: 'done', 4: 'done' } })] },
    { note: '右子樹有 3、6，共 2 個；不存在的右孩子回傳 0。', views: [tree(T, { cls: { 2: 'done', 5: 'done' } })] },
    { note: '加總根 1 + 左 3 + 右 2 = 6。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done' } })] },
  ]
}

function completeFig(): FigStep[] {
  return [
    { note: '完全二元樹最後一層從左往右填。根的左子樹最左深度為 2（2→4），右子樹為 2（3→6）。', views: [tree(T, { cls: { 1: 'hl', 3: 'hl', 2: 'hl', 5: 'hl' } })] },
    { note: '兩邊高度相同，表示左子樹是滿的：左子樹 3 個節點（2、4、5）加上根，共 2²=4 個。只需遞迴數右子樹。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'done', 4: 'done' } })] },
    { note: '到節點 3：左高度 1（6），右高度 0；右子樹是滿的，加上 3 共 2⁰=1，再遞迴左邊 6。', views: [tree(T, { cls: { 2: 'hl', 5: 'hl' } })] },
    { note: '節點 6 貢獻 1；總數 4+1+1=6，無需逐一遍歷整棵樹。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done' } })] },
  ]
}

export const q0222: Solution = {
  id: 222,
  plain: '數一棵完全二元樹有幾個節點。最後一層可能沒填滿，但一定從左邊開始填。',
  statement: '給完全二元樹的根 root，回傳節點總數。完全二元樹除了最後一層都填滿，最後一層從左至右連續填入。',
  examples: [{ input: 'root = [1,2,3,4,5,6]', output: '6' }, { input: 'root = []', output: '0' }, { input: 'root = [1]', output: '1' }],
  constraints: ['`0 ≤ 節點數 ≤ 5 × 10⁴`', '輸入保證為完全二元樹。'],
  insight: ['一般樹可用遞迴逐節點數。', '完全二元樹有額外結構：若左右子樹的最左深度相同，左子樹必滿；否則右子樹必滿。滿的部分可以用 2 的次方一次計算。'],
  approaches: [
    {
      name: '逐節點遞迴計數',
      idea: '空樹是 0；非空節點數 = 1 + 左子樹數 + 右子樹數。',
      steps: ['空節點回傳 0。', '遞迴計算左子樹與右子樹。', '加上目前節點的 1。'],
      figure: { title: 'root = [1,2,3,4,5,6]', steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(log n)', why: '每個節點都訪問一次；完全二元樹高度為 log n。' },
      verdict: '最容易寫，也適用所有二元樹。',
      code: {
        python: `def countNodes(root):
    if not root:
        return 0
    left = countNodes(root.left)
    right = countNodes(root.right)
    return 1 + left + right  # 算上目前節點`,
        c: `int countNodes(struct TreeNode *root) {
    if (!root) {
        return 0;
    }
    int left = countNodes(root->left);
    int right = countNodes(root->right);
    return 1 + left + right;
}`,
        cpp: `int countNodes(TreeNode* root) {
    if (!root) {
        return 0;
    }
    int left = countNodes(root->left);
    int right = countNodes(root->right);
    return 1 + left + right;
}`,
        java: `int countNodes(TreeNode root) {
    if (root == null) {
        return 0;
    }
    int left = countNodes(root.left);
    int right = countNodes(root.right);
    return 1 + left + right;
}`,
        javascript: `function countNodes(root) {
  if (!root) {
    return 0;
  }
  const left = countNodes(root.left);
  const right = countNodes(root.right);
  return 1 + left + right;
}`,
      },
    },
    {
      name: '跳過已滿的子樹',
      idea: '量兩個子樹的最左深度；相同則左子樹必滿，否則右子樹必滿，只對不確定的那一邊遞迴。',
      steps: ['沿左孩子量 left、right 的高度。', '若高度相同，根與左子樹共 2^left 個，再數右邊。', '否則根與右子樹共 2^right 個，再數左邊。'],
      figure: { title: 'root = [1,2,3,4,5,6]', steps: completeFig() },
      complexity: { time: 'O(log² n)', space: 'O(log n)', why: '每層量高度 O(log n)，遞迴只進入一邊，共 O(log n) 層。' },
      verdict: '利用完全二元樹的保證，直接跳過整片滿子樹。',
      code: {
        python: `def countNodes(root):
    def height(node):
        h = 0
        while node:
            h += 1
            node = node.left
        return h

    if not root:
        return 0
    left = height(root.left)
    right = height(root.right)
    if left == right:
        return (1 << left) + countNodes(root.right)  # 左邊已滿
    return (1 << right) + countNodes(root.left)  # 右邊已滿`,
        c: `int leftHeight222(struct TreeNode *node) {
    int height = 0;
    while (node) {
        height++;
        node = node->left;
    }
    return height;
}

int countNodes(struct TreeNode *root) {
    if (!root) {
        return 0;
    }
    int left = leftHeight222(root->left);
    int right = leftHeight222(root->right);
    if (left == right) {
        return (1 << left) + countNodes(root->right);
    }
    return (1 << right) + countNodes(root->left);
}`,
        cpp: `int leftHeight222(TreeNode* node) {
    int height = 0;
    while (node) {
        height++;
        node = node->left;
    }
    return height;
}

int countNodes(TreeNode* root) {
    if (!root) {
        return 0;
    }
    int left = leftHeight222(root->left);
    int right = leftHeight222(root->right);
    if (left == right) {
        return (1 << left) + countNodes(root->right);
    }
    return (1 << right) + countNodes(root->left);
}`,
        java: `int leftHeight222(TreeNode node) {
    int height = 0;
    while (node != null) {
        height++;
        node = node.left;
    }
    return height;
}

int countNodes(TreeNode root) {
    if (root == null) {
        return 0;
    }
    int left = leftHeight222(root.left);
    int right = leftHeight222(root.right);
    if (left == right) {
        return (1 << left) + countNodes(root.right);
    }
    return (1 << right) + countNodes(root.left);
}`,
        javascript: `function countNodes(root) {
  function height(node) {
    let h = 0;
    while (node) {
      h++;
      node = node.left;
    }
    return h;
  }
  if (!root) {
    return 0;
  }
  const left = height(root.left);
  const right = height(root.right);
  if (left === right) {
    return 2 ** left + countNodes(root.right);
  }
  return 2 ** right + countNodes(root.left);
}`,
      },
    },
  ],
  pitfalls: ['快速法只適用保證完全的二元樹。', '高度以節點數計，空子樹為 0；滿子樹連根計入是 2^height。'],
  check: { kind: 'fn', fn: 'countNodes', argKinds: ['tree'], cases: [{ args: [T], out: 6 }, { args: [[]], out: 0 }, { args: [[1]], out: 1 }, { args: [[1, 2, 3, 4, 5, 6, 7]], out: 7 }] },
}
