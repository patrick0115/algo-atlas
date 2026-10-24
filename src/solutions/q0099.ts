import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [3, 1, 4, null, null, 2]

function sortFig(): FigStep[] {
  return [
    { note: 'BST 的中序順序應該由小到大；目前走訪得到 [1,3,2,4]，可看出 3 與 2 放錯位置。', views: [tree(T, { cls: { 0: 'hl', 5: 'hl' } })] },
    { note: '把走訪的節點依序存起來，再把它們的值排序成 [1,2,3,4]。', views: [tree(T), arr([1, 2, 3, 4], { label: '排序後的中序值' })] },
    { note: '按中序順序把排序後的值寫回原節點；只改值，不改樹的連結。', views: [tree([2, 1, 4, null, null, 3], { cls: { 0: 'hl', 5: 'hl' } })] },
    { note: '結果中序為 [1,2,3,4]，恢復 BST。', views: [tree([2, 1, 4, null, null, 3], { cls: { 0: 'done', 1: 'done', 2: 'done', 5: 'done' } })] },
  ]
}

function inversionFig(): FigStep[] {
  return [
    { note: '中序走訪先到 1，再到 3；目前 1<3，仍符合 BST。', views: [tree(T, { cls: { 1: 'done', 0: 'hl' } })] },
    { note: '下一個值 2 小於前一個 3，出現逆序。第一次逆序先記前一個節點 3，並記目前節點 2。', views: [tree(T, { cls: { 0: 'hl', 5: 'hl' } })] },
    { note: '最後走到 4 沒有第二次逆序；要交換的就是記下的 3 與 2。若有第二次逆序，第二個錯誤節點應改記那次的目前節點。', views: [tree(T, { cls: { 0: 'hl', 5: 'hl', 2: 'done' } })] },
    { note: '交換兩個節點的值，得到 [2,1,4,null,null,3]。', views: [tree([2, 1, 4, null, null, 3], { cls: { 0: 'done', 1: 'done', 2: 'done', 5: 'done' } })] },
  ]
}

export const q0099: Solution = {
  id: 99,
  plain: '二元搜尋樹裡有兩個節點的值被交換了；找出它們，交換回來，讓中序順序重新遞增。',
  statement: '給 BST 的根 root，其中恰有兩個節點的值被交換。請原地恢復這棵樹，不能改變樹的結構。',
  examples: [{ input: 'root = [1,3,null,null,2]', output: '[3,1,null,null,2]' }, { input: 'root = [3,1,4,null,null,2]', output: '[2,1,4,null,null,3]' }],
  constraints: ['`2 ≤ 節點數 ≤ 1000`', '節點值互不相同。'],
  insight: ['BST 中序走訪應嚴格遞增；兩個錯誤值會造成一或兩個相鄰逆序。', '排序所有值再寫回簡單；只記第一次逆序的前節點與最後一次逆序的目前節點，便可只交換兩個值。'],
  approaches: [
    {
      name: '中序收集、排序後寫回',
      idea: '把節點按中序存起來，排序其值，再按順序覆寫原節點值。',
      steps: ['中序走訪，保存節點。', '取出所有值並排序。', '依中序順序把排序值寫回。'],
      figure: { title: 'root = [3,1,4,null,null,2]', steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 n 個值並保存 n 個節點。' },
      verdict: '思路直接，但需要保存整棵樹的節點。',
      code: {
        python: `def recoverTree(root):
    nodes = []

    def inorder(node):
        if not node:
            return
        inorder(node.left)
        nodes.append(node)
        inorder(node.right)

    inorder(root)
    values = sorted(node.val for node in nodes)
    for node, value in zip(nodes, values):
        node.val = value  # 原地修正節點值`,
        c: `void collect99(struct TreeNode *node, struct TreeNode **nodes, int *size) {
    if (!node) {
        return;
    }
    collect99(node->left, nodes, size);
    nodes[(*size)++] = node;
    collect99(node->right, nodes, size);
}

int compare99(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

void recoverTree(struct TreeNode *root) {
    struct TreeNode *nodes[1000];
    int size = 0;
    collect99(root, nodes, &size);
    int *values = malloc(size * sizeof(int));
    for (int i = 0; i < size; i++) {
        values[i] = nodes[i]->val;
    }
    qsort(values, size, sizeof(int), compare99);
    for (int i = 0; i < size; i++) {
        nodes[i]->val = values[i];
    }
    free(values);
}`,
        cpp: `void recoverTree(TreeNode* root) {
    vector<TreeNode*> nodes;
    function<void(TreeNode*)> inorder = [&](TreeNode* node) {
        if (!node) {
            return;
        }
        inorder(node->left);
        nodes.push_back(node);
        inorder(node->right);
    };
    inorder(root);
    vector<int> values;
    for (TreeNode* node : nodes) {
        values.push_back(node->val);
    }
    sort(values.begin(), values.end());
    for (int i = 0; i < (int)nodes.size(); i++) {
        nodes[i]->val = values[i];
    }
}`,
        java: `void recoverTree(TreeNode root) {
    List<TreeNode> nodes = new ArrayList<>();
    collect99(root, nodes);
    List<Integer> values = new ArrayList<>();
    for (TreeNode node : nodes) {
        values.add(node.val);
    }
    Collections.sort(values);
    for (int i = 0; i < nodes.size(); i++) {
        nodes.get(i).val = values.get(i);
    }
}

void collect99(TreeNode node, List<TreeNode> nodes) {
    if (node == null) {
        return;
    }
    collect99(node.left, nodes);
    nodes.add(node);
    collect99(node.right, nodes);
}`,
        javascript: `function recoverTree(root) {
  const nodes = [];
  function inorder(node) {
    if (!node) {
      return;
    }
    inorder(node.left);
    nodes.push(node);
    inorder(node.right);
  }
  inorder(root);
  const values = nodes.map(node => node.val).sort((a, b) => a - b);
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].val = values[i];
  }
}`,
      },
    },
    {
      name: '中序逆序定位兩個節點',
      idea: '中序過程比較前一節點與目前節點；首次逆序記前節點，每次逆序記目前節點，最後交換兩值。',
      steps: ['中序走訪，保存 prev。', '若 prev.val>node.val，首次設 first=prev；每次設 second=node。', '走完後交換 first.val、second.val。'],
      figure: { title: 'root = [3,1,4,null,null,2]', steps: inversionFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '一次中序走訪；額外空間是高度 h 的遞迴堆疊。' },
      verdict: '不必排序或存所有節點；相鄰與不相鄰交換都能處理。',
      code: {
        python: `def recoverTree(root):
    first = second = previous = None

    def inorder(node):
        nonlocal first, second, previous
        if not node:
            return
        inorder(node.left)
        if previous and previous.val > node.val:
            if first is None:
                first = previous  # 第一次逆序的前節點
            second = node  # 最後一次逆序的目前節點
        previous = node
        inorder(node.right)

    inorder(root)
    first.val, second.val = second.val, first.val`,
        c: `void visit99(struct TreeNode *node, struct TreeNode **previous, struct TreeNode **first, struct TreeNode **second) {
    if (!node) {
        return;
    }
    visit99(node->left, previous, first, second);
    if (*previous && (*previous)->val > node->val) {
        if (!*first) {
            *first = *previous;
        }
        *second = node;
    }
    *previous = node;
    visit99(node->right, previous, first, second);
}

void recoverTree(struct TreeNode *root) {
    struct TreeNode *previous = NULL;
    struct TreeNode *first = NULL;
    struct TreeNode *second = NULL;
    visit99(root, &previous, &first, &second);
    int value = first->val;
    first->val = second->val;
    second->val = value;
}`,
        cpp: `void recoverTree(TreeNode* root) {
    TreeNode* previous = nullptr;
    TreeNode* first = nullptr;
    TreeNode* second = nullptr;
    function<void(TreeNode*)> inorder = [&](TreeNode* node) {
        if (!node) {
            return;
        }
        inorder(node->left);
        if (previous && previous->val > node->val) {
            if (!first) {
                first = previous;
            }
            second = node;
        }
        previous = node;
        inorder(node->right);
    };
    inorder(root);
    swap(first->val, second->val);
}`,
        java: `TreeNode previous99;
TreeNode first99;
TreeNode second99;

void recoverTree(TreeNode root) {
    previous99 = null;
    first99 = null;
    second99 = null;
    visit99(root);
    int value = first99.val;
    first99.val = second99.val;
    second99.val = value;
}

void visit99(TreeNode node) {
    if (node == null) {
        return;
    }
    visit99(node.left);
    if (previous99 != null && previous99.val > node.val) {
        if (first99 == null) {
            first99 = previous99;
        }
        second99 = node;
    }
    previous99 = node;
    visit99(node.right);
}`,
        javascript: `function recoverTree(root) {
  let previous = null;
  let first = null;
  let second = null;
  function inorder(node) {
    if (!node) {
      return;
    }
    inorder(node.left);
    if (previous && previous.val > node.val) {
      if (!first) {
        first = previous;
      }
      second = node;
    }
    previous = node;
    inorder(node.right);
  }
  inorder(root);
  [first.val, second.val] = [second.val, first.val];
}`,
      },
    },
  ],
  pitfalls: ['只交換兩個節點的值，不要重新接樹的左右孩子。', '兩個錯誤值若在中序相鄰，只會有一次逆序；仍要正確記下兩個節點。'],
  check: { kind: 'fn', fn: 'recoverTree', argKinds: ['tree'], inplace: 0, cases: [{ args: [T], out: [2, 1, 4, null, null, 3] }, { args: [[1, 3, null, null, 2]], out: [3, 1, null, null, 2] }] },
}
