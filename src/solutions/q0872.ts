import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

const A = [3, 5, 1, 6, 2, 9, 8, null, null, 7, 4]
const B = [3, 5, 1, 6, 7, 4, 2, null, null, null, null, null, null, 9, 8]

function dfsFig(): FigStep[] {
  return [
    { note: '由左到右走訪第一棵樹。6 沒有孩子，第一個葉子是 6。', views: [tree(A, { cls: { 3: 'hl' } }), arr([6], { label: '第一棵樹的葉子' })] },
    { note: '走完左子樹其餘部分，再走右子樹，第一棵樹的葉子順序成為 6、7、4、9、8。', views: [tree(A), arr([6, 7, 4, 9, 8], { label: '第一棵樹的葉子', done: [0, 1, 2, 3, 4] })] },
    { note: '同樣由左到右走訪第二棵樹，雖然內部形狀不同，葉子仍是 6、7、4、9、8。', views: [tree(B), arr([6, 7, 4, 9, 8], { label: '第二棵樹的葉子', done: [0, 1, 2, 3, 4] })] },
    { note: '逐個位置比較兩組葉子，全部相同，因此回傳 true。', views: [arr([6, 7, 4, 9, 8], { label: '樹一' }), arr([6, 7, 4, 9, 8], { label: '樹二', done: [0, 1, 2, 3, 4] })] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '把根放進堆疊。為了先讀左邊，展開節點時先壓右孩子，再壓左孩子。', views: [tree(A, { cls: { 0: 'hl' } }), arr([3], { label: '堆疊頂在右側' })] },
    { note: '彈出 3 並壓入 1、5；下一個彈出的會是左孩子 5。', views: [arr([1, 5], { label: '堆疊頂在右側', highlight: [1] })] },
    { note: '展開 5 後接著走到 6；6 沒有孩子，才將它加入葉子序列。', views: [arr([6], { label: '目前葉子', done: [0] })] },
    { note: '兩棵樹各自照此規則處理，最後都得到相同的 6、7、4、9、8。', views: [arr([6, 7, 4, 9, 8], { label: '樹一' }), arr([6, 7, 4, 9, 8], { label: '樹二', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q0872: Solution = {
  id: 872,
  plain: '只看兩棵樹最末端的葉子，依照從左到右的順序排成兩列；判斷兩列是否完全一樣。',
  statement: '給兩棵二元樹 root1、root2。把每棵樹從左到右的葉節點值依序列出；若兩個序列相同，回傳 true。葉子是左右孩子都不存在的節點。',
  examples: [
    { input: 'root1 = [3,5,1,6,2,9,8,null,null,7,4], root2 = [3,5,1,6,7,4,2,null,null,null,null,null,null,9,8]', output: 'true' },
    { input: 'root1 = [1,2,3], root2 = [1,3,2]', output: 'false' },
  ],
  constraints: ['每棵樹至多 200 個節點；節點值在 0 到 200。'],
  insight: ['樹的形狀可以不同；只比較葉子的順序與值。', '由左到右的 DFS 自然會依要求的順序遇到葉子。'],
  approaches: [
    {
      name: '遞迴收集葉子',
      idea: '先走左子樹，再走右子樹；只在沒有孩子的節點加入序列。',
      steps: ['若節點為空就返回。', '若沒有左右孩子，記下節點值。', '否則依序遞迴左、右孩子；最後比較兩個序列。'],
      figure: { title: '兩棵樹的葉子序列', steps: dfsFig() },
      complexity: { time: 'O(n + m)', space: 'O(n + m)', why: '每個節點走一次；葉子序列及遞迴堆疊最壞佔線性空間。' },
      verdict: '最容易對照「由左到右」的題意。',
      code: {
        python: `def leafSimilar(root1, root2):
    def collect(node, leaves):
        if not node:
            return
        if not node.left and not node.right:
            leaves.append(node.val)       # 只把葉子放進序列
            return
        collect(node.left, leaves)         # 先左後右，維持順序
        collect(node.right, leaves)

    first, second = [], []
    collect(root1, first)
    collect(root2, second)
    return first == second`,
        c: `static void collectLeaves(struct TreeNode *node, int *leaves, int *size) {
    if (node == NULL) {
        return;
    }
    if (node->left == NULL && node->right == NULL) {
        leaves[(*size)++] = node->val;
        return;
    }
    collectLeaves(node->left, leaves, size);
    collectLeaves(node->right, leaves, size);
}

bool leafSimilar(struct TreeNode *root1, struct TreeNode *root2) {
    int first[200], second[200];
    int n = 0, m = 0;
    collectLeaves(root1, first, &n);
    collectLeaves(root2, second, &m);
    if (n != m) {
        return false;
    }
    for (int i = 0; i < n; i++) {
        if (first[i] != second[i]) {
            return false;
        }
    }
    return true;
}`,
        cpp: `void collectLeaves(TreeNode *node, vector<int>& leaves) {
    if (node == nullptr) {
        return;
    }
    if (node->left == nullptr && node->right == nullptr) {
        leaves.push_back(node->val);
        return;
    }
    collectLeaves(node->left, leaves);
    collectLeaves(node->right, leaves);
}

bool leafSimilar(TreeNode *root1, TreeNode *root2) {
    vector<int> first, second;
    collectLeaves(root1, first);
    collectLeaves(root2, second);
    return first == second;
}`,
        java: `void collectLeaves(TreeNode node, List<Integer> leaves) {
    if (node == null) {
        return;
    }
    if (node.left == null && node.right == null) {
        leaves.add(node.val);
        return;
    }
    collectLeaves(node.left, leaves);
    collectLeaves(node.right, leaves);
}

boolean leafSimilar(TreeNode root1, TreeNode root2) {
    List<Integer> first = new ArrayList<>();
    List<Integer> second = new ArrayList<>();
    collectLeaves(root1, first);
    collectLeaves(root2, second);
    return first.equals(second);
}`,
        javascript: `function leafSimilar(root1, root2) {
  function collect(node, leaves) {
    if (node === null) {
      return;
    }
    if (node.left === null && node.right === null) {
      leaves.push(node.val);
      return;
    }
    collect(node.left, leaves);
    collect(node.right, leaves);
  }
  const first = [];
  const second = [];
  collect(root1, first);
  collect(root2, second);
  return first.length === second.length && first.every((value, i) => value === second[i]);
}`,
      },
    },
    {
      name: '堆疊走訪',
      idea: '用明確的堆疊模擬 DFS；先壓右孩子，讓左孩子先被處理。',
      steps: ['將根節點放進堆疊。', '反覆彈出節點：葉子就記錄；非葉子先壓右再壓左。', '對兩棵樹各做一次並比較序列。'],
      figure: { title: '用堆疊取得葉子', steps: stackFig() },
      complexity: { time: 'O(n + m)', space: 'O(n + m)', why: '每個節點進出堆疊一次，另存葉子序列。' },
      verdict: '不依賴呼叫堆疊，適合練習迭代 DFS。',
      code: {
        python: `def leafSimilar(root1, root2):
    def leaves(root):
        result = []
        stack = [root]
        while stack:
            node = stack.pop()
            if not node:
                continue
            if not node.left and not node.right:
                result.append(node.val)   # 只記錄葉子
            else:
                stack.append(node.right)  # 先壓右，讓左先出
                stack.append(node.left)
        return result

    return leaves(root1) == leaves(root2)`,
        c: `static int iterativeLeaves(struct TreeNode *root, int *values) {
    struct TreeNode *stack[201];
    int top = 0, size = 0;
    stack[top++] = root;
    while (top > 0) {
        struct TreeNode *node = stack[--top];
        if (node == NULL) {
            continue;
        }
        if (node->left == NULL && node->right == NULL) {
            values[size++] = node->val;
        } else {
            if (node->right != NULL) {
                stack[top++] = node->right;
            }
            if (node->left != NULL) {
                stack[top++] = node->left;
            }
        }
    }
    return size;
}

bool leafSimilar(struct TreeNode *root1, struct TreeNode *root2) {
    int first[200], second[200];
    int n = iterativeLeaves(root1, first);
    int m = iterativeLeaves(root2, second);
    if (n != m) {
        return false;
    }
    for (int i = 0; i < n; i++) {
        if (first[i] != second[i]) {
            return false;
        }
    }
    return true;
}`,
        cpp: `vector<int> iterativeLeaves(TreeNode *root) {
    vector<int> result;
    stack<TreeNode*> pending;
    pending.push(root);
    while (!pending.empty()) {
        TreeNode *node = pending.top();
        pending.pop();
        if (node == nullptr) {
            continue;
        }
        if (node->left == nullptr && node->right == nullptr) {
            result.push_back(node->val);
        } else {
            pending.push(node->right);
            pending.push(node->left);
        }
    }
    return result;
}

bool leafSimilar(TreeNode *root1, TreeNode *root2) {
    return iterativeLeaves(root1) == iterativeLeaves(root2);
}`,
        java: `List<Integer> iterativeLeaves(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        if (node.left == null && node.right == null) {
            result.add(node.val);
        } else {
            if (node.right != null) {
                stack.push(node.right);
            }
            if (node.left != null) {
                stack.push(node.left);
            }
        }
    }
    return result;
}

boolean leafSimilar(TreeNode root1, TreeNode root2) {
    return iterativeLeaves(root1).equals(iterativeLeaves(root2));
}`,
        javascript: `function leafSimilar(root1, root2) {
  function leaves(root) {
    const result = [];
    const stack = [root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node === null) {
        continue;
      }
      if (node.left === null && node.right === null) {
        result.push(node.val);
      } else {
        stack.push(node.right);
        stack.push(node.left);
      }
    }
    return result;
  }
  const first = leaves(root1);
  const second = leaves(root2);
  return first.length === second.length && first.every((value, i) => value === second[i]);
}`,
      },
    },
  ],
  pitfalls: ['葉子必須同時沒有左右孩子，只有一個孩子的節點不算。', '迭代 DFS 先壓右再壓左，彈出順序才會是先左後右。'],
  check: {
    kind: 'fn',
    fn: 'leafSimilar',
    argKinds: ['tree', 'tree'],
    cases: [
      { args: [A, B], out: true },
      { args: [[1, 2, 3], [1, 3, 2]], out: false },
      { args: [[1], [1]], out: true },
    ],
  },
}
