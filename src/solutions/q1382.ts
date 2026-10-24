import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

const T = [1, null, 2, null, 3, null, 4]

const CHECK = {
  python: `

def balanceCheck(root):
    def inorder(node):
        return inorder(node.left) + [node.val] + inorder(node.right) if node else []

    before = inorder(root)
    result = balanceBST(root)
    def height(node):
        if not node:
            return 0
        left, right = height(node.left), height(node.right)
        if left < 0 or right < 0 or abs(left - right) > 1:
            return -1
        return max(left, right) + 1
    return int(inorder(result) == before and height(result) >= 0)`,
  c: `

static void inorderCheck1382(struct TreeNode *node, int *values, int *count) {
    if (!node) {
        return;
    }
    inorderCheck1382(node->left, values, count);
    values[(*count)++] = node->val;
    inorderCheck1382(node->right, values, count);
}

static int heightCheck1382(struct TreeNode *node) {
    if (!node) {
        return 0;
    }
    int left = heightCheck1382(node->left);
    int right = heightCheck1382(node->right);
    if (left < 0 || right < 0 || abs(left - right) > 1) {
        return -1;
    }
    return (left > right ? left : right) + 1;
}

int balanceCheck(struct TreeNode *root) {
    int before[10000];
    int after[10000];
    int firstCount = 0;
    int secondCount = 0;
    inorderCheck1382(root, before, &firstCount);
    struct TreeNode *result = balanceBST(root);
    inorderCheck1382(result, after, &secondCount);
    return firstCount == secondCount && memcmp(before, after, firstCount * sizeof(int)) == 0 && heightCheck1382(result) >= 0;
}`,
  cpp: `

int balanceCheck(TreeNode* root) {
    function<void(TreeNode*, vector<int>&)> inorder = [&](TreeNode* node, vector<int>& values) {
        if (!node) {
            return;
        }
        inorder(node->left, values);
        values.push_back(node->val);
        inorder(node->right, values);
    };
    vector<int> before, after;
    inorder(root, before);
    TreeNode* result = balanceBST(root);
    inorder(result, after);
    function<int(TreeNode*)> height = [&](TreeNode* node) {
        if (!node) {
            return 0;
        }
        int left = height(node->left);
        int right = height(node->right);
        if (left < 0 || right < 0 || abs(left - right) > 1) {
            return -1;
        }
        return max(left, right) + 1;
    };
    return before == after && height(result) >= 0;
}`,
  java: `

void inorderCheck1382(TreeNode node, List<Integer> values) {
    if (node == null) {
        return;
    }
    inorderCheck1382(node.left, values);
    values.add(node.val);
    inorderCheck1382(node.right, values);
}

int heightCheck1382(TreeNode node) {
    if (node == null) {
        return 0;
    }
    int left = heightCheck1382(node.left);
    int right = heightCheck1382(node.right);
    if (left < 0 || right < 0 || Math.abs(left - right) > 1) {
        return -1;
    }
    return Math.max(left, right) + 1;
}

int balanceCheck(TreeNode root) {
    List<Integer> before = new ArrayList<>();
    List<Integer> after = new ArrayList<>();
    inorderCheck1382(root, before);
    TreeNode result = balanceBST(root);
    inorderCheck1382(result, after);
    return before.equals(after) && heightCheck1382(result) >= 0 ? 1 : 0;
}`,
  javascript: `

function balanceCheck(root) {
  function inorder(node, values) {
    if (!node) {
      return;
    }
    inorder(node.left, values);
    values.push(node.val);
    inorder(node.right, values);
  }
  function height(node) {
    if (!node) {
      return 0;
    }
    const left = height(node.left);
    const right = height(node.right);
    if (left < 0 || right < 0 || Math.abs(left - right) > 1) {
      return -1;
    }
    return Math.max(left, right) + 1;
  }
  const before = [];
  const after = [];
  inorder(root, before);
  const result = balanceBST(root);
  inorder(result, after);
  return JSON.stringify(before) === JSON.stringify(after) && height(result) >= 0 ? 1 : 0;
}`,
}

export const q1382: Solution = {
  id: 1382,
  plain: '把偏向一側的二元搜尋樹整理成左右高度接近的樹，同時保留原本所有節點值。',
  statement: '給二元搜尋樹 root，回傳任一高度平衡的二元搜尋樹，且包含相同數值。每個節點的左右子樹高度差最多 1。測試以 balanceCheck 檢查。',
  examples: [{ input: 'root = [1,null,2,null,3,null,4]', output: '[3,2,4,1]' }],
  constraints: ['節點數最多 10⁴；節點值互不相同。'],
  insight: ['二元搜尋樹的中序走訪會得到遞增數列。', '每次選中間元素當根，左右兩半遞迴建樹，高度自然接近；這是 [[p:bst]] 的典型應用。'],
  approaches: [
    {
      name: '中序取值，建立新樹',
      idea: '先收集遞增數值，再從中點遞迴建平衡樹。',
      steps: ['中序走訪，得到遞增 values', '選中點當目前子樹根', '左半段建左子樹，右半段建右子樹', '遞迴到空區間為止'],
      figure: { title: 'root = [1,null,2,null,3,null,4]', steps: [
        { note: '原樹一路向右延伸，高度為 4。', views: [tree(T, { cls: { 0: 'hl', 2: 'hl', 4: 'hl', 6: 'hl' } })] },
        { note: '中序走訪得到遞增序列 [1,2,3,4]。', views: [arr([1, 2, 3, 4], { label: '中序結果' })] },
        { note: '選中點 3 當根；左半段 [1,2] 與右半段 [4] 分開建。', views: [arr([1, 2, 3, 4], { label: '切分', highlight: [2] })] },
        { note: '新樹可為 [3,2,4,1]，每個節點左右高度差最多 1。', views: [tree([3, 2, 4, 1], { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '中序陣列與新節點各存 n 個元素。' },
      verdict: '容易理解，也不會改動原樹節點。',
      code: {
        python: `def balanceBST(root):
    values = []
    stack = []
    node = root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        values.append(node.val)  # BST 中序為遞增
        node = node.right

    def build(left, right):
        if left > right:
            return None
        middle = (left + right + 1) // 2
        node = TreeNode(values[middle])
        node.left = build(left, middle - 1)
        node.right = build(middle + 1, right)
        return node

    return build(0, len(values) - 1)${CHECK.python}`,
        c: `static void collect1382(struct TreeNode *node, int *values, int *count) {
    if (!node) {
        return;
    }
    collect1382(node->left, values, count);
    values[(*count)++] = node->val;
    collect1382(node->right, values, count);
}

static struct TreeNode *build1382(int *values, int left, int right) {
    if (left > right) {
        return NULL;
    }
    int middle = (left + right + 1) / 2;
    struct TreeNode *node = malloc(sizeof(struct TreeNode));
    node->val = values[middle];
    node->left = build1382(values, left, middle - 1);
    node->right = build1382(values, middle + 1, right);
    return node;
}

struct TreeNode *balanceBST(struct TreeNode *root) {
    int values[10000];
    int count = 0;
    collect1382(root, values, &count);
    return build1382(values, 0, count - 1);
}${CHECK.c}`,
        cpp: `TreeNode* balanceBST(TreeNode* root) {
    vector<int> values;
    stack<TreeNode*> pending;
    TreeNode* node = root;
    while (node || !pending.empty()) {
        while (node) {
            pending.push(node);
            node = node->left;
        }
        node = pending.top();
        pending.pop();
        values.push_back(node->val);
        node = node->right;
    }
    function<TreeNode*(int, int)> build = [&](int left, int right) -> TreeNode* {
        if (left > right) {
            return nullptr;
        }
        int middle = (left + right + 1) / 2;
        TreeNode* made = new TreeNode(values[middle]);
        made->left = build(left, middle - 1);
        made->right = build(middle + 1, right);
        return made;
    };
    return build(0, values.size() - 1);
}${CHECK.cpp}`,
        java: `TreeNode balanceBST(TreeNode root) {
    List<Integer> values = new ArrayList<>();
    Deque<TreeNode> pending = new ArrayDeque<>();
    TreeNode node = root;
    while (node != null || !pending.isEmpty()) {
        while (node != null) {
            pending.push(node);
            node = node.left;
        }
        node = pending.pop();
        values.add(node.val);
        node = node.right;
    }
    return build1382(values, 0, values.size() - 1);
}

TreeNode build1382(List<Integer> values, int left, int right) {
    if (left > right) {
        return null;
    }
    int middle = (left + right + 1) / 2;
    TreeNode node = new TreeNode(values.get(middle));
    node.left = build1382(values, left, middle - 1);
    node.right = build1382(values, middle + 1, right);
    return node;
}${CHECK.java}`,
        javascript: `function balanceBST(root) {
  const values = [];
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    values.push(node.val);
    node = node.right;
  }
  function build(left, right) {
    if (left > right) {
      return null;
    }
    const middle = Math.floor((left + right + 1) / 2);
    const made = new TreeNode(values[middle]);
    made.left = build(left, middle - 1);
    made.right = build(middle + 1, right);
    return made;
  }
  return build(0, values.length - 1);
}${CHECK.javascript}`,
      },
    },
    {
      name: '中序收集後重接原節點',
      idea: '中序收集節點本身，從中點開始重新連接左右指標，省下新節點。',
      steps: ['中序走訪，按大小收集節點參照', '以中點節點作為目前根', '將左半段重接為左子樹，右半段重接為右子樹', '回傳新根'],
      figure: { title: '重用節點 1→2→3→4', steps: [
        { note: '先按中序收集原來四個節點，順序為 1、2、3、4。', views: [arr([1, 2, 3, 4], { label: '節點參照' })] },
        { note: '選中點的原節點 3 當新根。', views: [arr([1, 2, 3, 4], { label: '節點參照', highlight: [2] })] },
        { note: '左半選 2 作左孩子、1 作 2 的左孩子；右半是 4。', views: [tree([3, 2, 4, 1], { cls: { 0: 'hl' } })] },
        { note: '重接完成，仍是相同四個節點，且樹已平衡。', views: [tree([3, 2, 4, 1], { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '節點參照陣列需要 n 格，但不建立新樹節點。' },
      verdict: '當希望重用既有節點時合適；須先收集完畢再改指標。',
      code: {
        python: `def balanceBST(root):
    nodes = []
    stack = []
    node = root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        nodes.append(node)  # 收集原節點參照
        node = node.right

    def build(left, right):
        if left > right:
            return None
        middle = (left + right + 1) // 2
        node = nodes[middle]
        node.left = build(left, middle - 1)
        node.right = build(middle + 1, right)
        return node

    return build(0, len(nodes) - 1)${CHECK.python}`,
        c: `static void collectNodes1382(struct TreeNode *node, struct TreeNode **nodes, int *count) {
    if (!node) {
        return;
    }
    collectNodes1382(node->left, nodes, count);
    nodes[(*count)++] = node;
    collectNodes1382(node->right, nodes, count);
}

static struct TreeNode *rebuild1382(struct TreeNode **nodes, int left, int right) {
    if (left > right) {
        return NULL;
    }
    int middle = (left + right + 1) / 2;
    struct TreeNode *node = nodes[middle];
    node->left = rebuild1382(nodes, left, middle - 1);
    node->right = rebuild1382(nodes, middle + 1, right);
    return node;
}

struct TreeNode *balanceBST(struct TreeNode *root) {
    struct TreeNode *nodes[10000];
    int count = 0;
    collectNodes1382(root, nodes, &count);
    return rebuild1382(nodes, 0, count - 1);
}${CHECK.c}`,
        cpp: `TreeNode* balanceBST(TreeNode* root) {
    vector<TreeNode*> nodes;
    stack<TreeNode*> pending;
    TreeNode* node = root;
    while (node || !pending.empty()) {
        while (node) {
            pending.push(node);
            node = node->left;
        }
        node = pending.top();
        pending.pop();
        nodes.push_back(node);
        node = node->right;
    }
    function<TreeNode*(int, int)> build = [&](int left, int right) -> TreeNode* {
        if (left > right) {
            return nullptr;
        }
        int middle = (left + right + 1) / 2;
        TreeNode* made = nodes[middle];
        made->left = build(left, middle - 1);
        made->right = build(middle + 1, right);
        return made;
    };
    return build(0, nodes.size() - 1);
}${CHECK.cpp}`,
        java: `TreeNode balanceBST(TreeNode root) {
    List<TreeNode> nodes = new ArrayList<>();
    Deque<TreeNode> pending = new ArrayDeque<>();
    TreeNode node = root;
    while (node != null || !pending.isEmpty()) {
        while (node != null) {
            pending.push(node);
            node = node.left;
        }
        node = pending.pop();
        nodes.add(node);
        node = node.right;
    }
    return rebuild1382(nodes, 0, nodes.size() - 1);
}

TreeNode rebuild1382(List<TreeNode> nodes, int left, int right) {
    if (left > right) {
        return null;
    }
    int middle = (left + right + 1) / 2;
    TreeNode node = nodes.get(middle);
    node.left = rebuild1382(nodes, left, middle - 1);
    node.right = rebuild1382(nodes, middle + 1, right);
    return node;
}${CHECK.java}`,
        javascript: `function balanceBST(root) {
  const nodes = [];
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    nodes.push(node);
    node = node.right;
  }
  function build(left, right) {
    if (left > right) {
      return null;
    }
    const middle = Math.floor((left + right + 1) / 2);
    const made = nodes[middle];
    made.left = build(left, middle - 1);
    made.right = build(middle + 1, right);
    return made;
  }
  return build(0, nodes.length - 1);
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['輸出樹的形狀不唯一，應檢查中序數值與高度平衡，不能只比層序陣列。', '重用節點時要先完整收集中序節點，再開始修改左右指標。'],
  check: { kind: 'fn', fn: 'balanceCheck', argKinds: ['tree'], cases: [
    { args: [T], out: 1 },
    { args: [[2, 1, 3]], out: 1 },
    { args: [[1]], out: 1 },
  ] },
}
