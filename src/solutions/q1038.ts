import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [2, 1, 3]

function reverseFig(): FigStep[] {
  return [
    { note: '搜尋樹 [2,1,3] 的值由大到小是 3、2、1。先從最右側的 3 開始。', views: [tree(T, { cls: { 2: 'hl' } }), arr([0], { label: '累計和' })] },
    { note: '讀到 3：累計和變 3，把節點 3 更新為 3。', views: [tree([2, 1, 3], { cls: { 2: 'done' } }), arr([3], { label: '累計和' })] },
    { note: '接著讀 2：累計和 3 + 2 = 5，將根節點改成 5。', views: [tree([5, 1, 3], { cls: { 0: 'done', 2: 'done' } }), arr([5], { label: '累計和' })] },
    { note: '最後讀 1：累計和 5 + 1 = 6；結果樹是 [5,6,3]。', views: [tree([5, 6, 3], { cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

function collectFig(): FigStep[] {
  return [
    { note: '先中序走訪，收集遞增的值 [1,2,3]。', views: [tree(T), arr([1, 2, 3], { label: '中序值' })] },
    { note: '從右向左計算後綴總和：3、2 + 3 = 5、1 + 5 = 6。', views: [arr([6, 5, 3], { label: '每個值的新值', done: [0, 1, 2] })] },
    { note: '再按中序順序，把節點 1、2、3 分別改成 6、5、3。', views: [tree([5, 6, 3], { cls: { 1: 'hl', 0: 'hl', 2: 'hl' } })] },
    { note: '回傳修改後的根；原有樹形不變。', views: [tree([5, 6, 3], { cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

export const q1038: Solution = {
  id: 1038,
  plain: '把搜尋樹每個節點的值，改成「原本所有大於或等於它的節點值」之和。',
  statement: '給一棵節點值互不相同的二元搜尋樹，將每個節點改成原樹中所有值不小於它的節點值總和，回傳根節點。',
  examples: [
    { input: 'root = [2,1,3]', output: '[5,6,3]' },
    { input: 'root = [4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]', output: '[30,36,21,36,35,26,15,null,null,null,33,null,null,null,8]' },
  ],
  constraints: ['節點數 1 到 100；值互不相同且介於 0 到 100。'],
  insight: ['搜尋樹的中序走訪由小到大；反過來走就由大到小。', '由大到小累加時，已走過的所有值剛好都是目前節點應包含的更大值。'],
  approaches: [
    {
      name: '反向中序，一次更新',
      idea: '依右、根、左的順序走，維持已走過的值總和。',
      steps: ['累計和初始為 0。', '先遞迴右子樹，接著將目前原值加入累計和。', '用累計和覆蓋目前節點，再走左子樹。'],
      figure: { title: 'root = [2,1,3]', steps: reverseFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點走一次，遞迴深度為樹高。' },
      verdict: '最省空間的做法。',
      code: {
        python: `def bstToGst(root):
    total = 0
    def walk(node):
        nonlocal total
        if not node:
            return
        walk(node.right)          # 先處理更大的值
        total += node.val
        node.val = total          # 此時總和就是新值
        walk(node.left)
    walk(root)
    return root

def bstCheck(root):
    root = bstToGst(root)
    result = []
    def inorder(node):
        if node:
            inorder(node.left)
            result.append(node.val)
            inorder(node.right)
    inorder(root)
    return result`,
        c: `static void greaterWalk(struct TreeNode *node, int *total) {
    if (node == NULL) {
        return;
    }
    greaterWalk(node->right, total);
    *total += node->val;
    node->val = *total;
    greaterWalk(node->left, total);
}

struct TreeNode *bstToGst(struct TreeNode *root) {
    int total = 0;
    greaterWalk(root, &total);
    return root;
}

static void collectInorder(struct TreeNode *node, int *values, int *size) {
    if (node == NULL) {
        return;
    }
    collectInorder(node->left, values, size);
    values[(*size)++] = node->val;
    collectInorder(node->right, values, size);
}

int *bstCheck(struct TreeNode *root, int *returnSize) {
    int *values = malloc(100 * sizeof(int));
    *returnSize = 0;
    collectInorder(bstToGst(root), values, returnSize);
    return values;
}`,
        cpp: `void greaterWalk(TreeNode *node, int& total) {
    if (node == nullptr) {
        return;
    }
    greaterWalk(node->right, total);
    total += node->val;
    node->val = total;
    greaterWalk(node->left, total);
}

TreeNode *bstToGst(TreeNode *root) {
    int total = 0;
    greaterWalk(root, total);
    return root;
}

void collectInorder(TreeNode *node, vector<int>& values) {
    if (node == nullptr) {
        return;
    }
    collectInorder(node->left, values);
    values.push_back(node->val);
    collectInorder(node->right, values);
}

vector<int> bstCheck(TreeNode *root) {
    vector<int> values;
    collectInorder(bstToGst(root), values);
    return values;
}`,
        java: `int total;

void greaterWalk(TreeNode node) {
    if (node == null) {
        return;
    }
    greaterWalk(node.right);
    total += node.val;
    node.val = total;
    greaterWalk(node.left);
}

TreeNode bstToGst(TreeNode root) {
    total = 0;
    greaterWalk(root);
    return root;
}

void collectInorder(TreeNode node, List<Integer> values) {
    if (node == null) {
        return;
    }
    collectInorder(node.left, values);
    values.add(node.val);
    collectInorder(node.right, values);
}

int[] bstCheck(TreeNode root) {
    List<Integer> values = new ArrayList<>();
    collectInorder(bstToGst(root), values);
    return values.stream().mapToInt(Integer::intValue).toArray();
}`,
        javascript: `function bstToGst(root) {
  let total = 0;
  function walk(node) {
    if (node === null) {
      return;
    }
    walk(node.right);
    total += node.val;
    node.val = total;
    walk(node.left);
  }
  walk(root);
  return root;
}

function bstCheck(root) {
  const result = [];
  function inorder(node) {
    if (node !== null) {
      inorder(node.left);
      result.push(node.val);
      inorder(node.right);
    }
  }
  inorder(bstToGst(root));
  return result;
}`,
      },
    },
    {
      name: '先收集再填回',
      idea: '先取得排序值，算出每個位置的後綴和，再依中序順序寫回。',
      steps: ['中序收集所有節點與原值。', '從陣列尾端往前計算累計和。', '把各位置的後綴和寫回對應節點。'],
      figure: { title: '[1,2,3] 的後綴總和', steps: collectFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '走訪及後綴加總各一次，另存 n 個節點。' },
      verdict: '可把「大於等於自己的數」看成排序陣列的後綴。',
      code: {
        python: `def bstToGst(root):
    nodes = []
    def collect(node):
        if not node:
            return
        collect(node.left)
        nodes.append(node)       # 中序就是遞增順序
        collect(node.right)
    collect(root)
    total = 0
    for node in reversed(nodes):
        total += node.val
        node.val = total         # 由大到小寫入後綴和
    return root

def bstCheck(root):
    root = bstToGst(root)
    result = []
    def inorder(node):
        if node:
            inorder(node.left)
            result.append(node.val)
            inorder(node.right)
    inorder(root)
    return result`,
        c: `static void collectNodes(struct TreeNode *node, struct TreeNode **nodes, int *size) {
    if (node == NULL) {
        return;
    }
    collectNodes(node->left, nodes, size);
    nodes[(*size)++] = node;
    collectNodes(node->right, nodes, size);
}

struct TreeNode *bstToGst(struct TreeNode *root) {
    struct TreeNode *nodes[100];
    int size = 0;
    collectNodes(root, nodes, &size);
    int total = 0;
    for (int i = size - 1; i >= 0; i--) {
        total += nodes[i]->val;
        nodes[i]->val = total;
    }
    return root;
}

static void collectInorder(struct TreeNode *node, int *values, int *size) {
    if (node == NULL) {
        return;
    }
    collectInorder(node->left, values, size);
    values[(*size)++] = node->val;
    collectInorder(node->right, values, size);
}

int *bstCheck(struct TreeNode *root, int *returnSize) {
    int *values = malloc(100 * sizeof(int));
    *returnSize = 0;
    collectInorder(bstToGst(root), values, returnSize);
    return values;
}`,
        cpp: `void collectNodes(TreeNode *node, vector<TreeNode*>& nodes) {
    if (node == nullptr) {
        return;
    }
    collectNodes(node->left, nodes);
    nodes.push_back(node);
    collectNodes(node->right, nodes);
}

TreeNode *bstToGst(TreeNode *root) {
    vector<TreeNode*> nodes;
    collectNodes(root, nodes);
    int total = 0;
    for (int i = (int)nodes.size() - 1; i >= 0; i--) {
        total += nodes[i]->val;
        nodes[i]->val = total;
    }
    return root;
}

void collectInorder(TreeNode *node, vector<int>& values) {
    if (node == nullptr) {
        return;
    }
    collectInorder(node->left, values);
    values.push_back(node->val);
    collectInorder(node->right, values);
}

vector<int> bstCheck(TreeNode *root) {
    vector<int> values;
    collectInorder(bstToGst(root), values);
    return values;
}`,
        java: `void collectNodes(TreeNode node, List<TreeNode> nodes) {
    if (node == null) {
        return;
    }
    collectNodes(node.left, nodes);
    nodes.add(node);
    collectNodes(node.right, nodes);
}

TreeNode bstToGst(TreeNode root) {
    List<TreeNode> nodes = new ArrayList<>();
    collectNodes(root, nodes);
    int total = 0;
    for (int i = nodes.size() - 1; i >= 0; i--) {
        total += nodes.get(i).val;
        nodes.get(i).val = total;
    }
    return root;
}

void collectInorder(TreeNode node, List<Integer> values) {
    if (node == null) {
        return;
    }
    collectInorder(node.left, values);
    values.add(node.val);
    collectInorder(node.right, values);
}

int[] bstCheck(TreeNode root) {
    List<Integer> values = new ArrayList<>();
    collectInorder(bstToGst(root), values);
    return values.stream().mapToInt(Integer::intValue).toArray();
}`,
        javascript: `function bstToGst(root) {
  const nodes = [];
  function collect(node) {
    if (node === null) {
      return;
    }
    collect(node.left);
    nodes.push(node);
    collect(node.right);
  }
  collect(root);
  let total = 0;
  for (let i = nodes.length - 1; i >= 0; i--) {
    total += nodes[i].val;
    nodes[i].val = total;
  }
  return root;
}

function bstCheck(root) {
  const result = [];
  function inorder(node) {
    if (node !== null) {
      inorder(node.left);
      result.push(node.val);
      inorder(node.right);
    }
  }
  inorder(bstToGst(root));
  return result;
}`,
      },
    },
  ],
  pitfalls: ['更新節點之前先把原值加進累計和。', '回傳的是原樹的根；包裝函式只為測試而擷取中序結果。'],
  check: {
    kind: 'fn',
    fn: 'bstCheck',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: [6, 5, 3] },
      { args: [[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]], out: [36, 36, 35, 33, 30, 26, 21, 15, 8] },
      { args: [[0]], out: [0] },
    ],
  },
}
