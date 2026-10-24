import { arr } from '../engine/helpers'
import { chain, tree } from './fig'
import type { Solution } from './types'

// 109. Convert Sorted List to Binary Search Tree
const V = [-10, -3, 0, 5, 9]

const CHECK = {
  python: `\n\ndef treeCheck(head):
    values = []
    node = head
    while node:
        values.append(node.val)
        node = node.next
    root = sortedListToBST(head)
    ordered = []
    def height(node):
        if not node:
            return 0
        left = height(node.left)
        ordered.append(node.val)
        right = height(node.right)
        if left < 0 or right < 0 or abs(left - right) > 1:
            return -1
        return max(left, right) + 1
    return int(height(root) >= 0 and ordered == values)`,
  c: `\n\nstatic int check109(struct TreeNode *node, struct ListNode **cursor) {
    if (!node) {
        return 0;
    }
    int left = check109(node->left, cursor);
    if (!*cursor || (*cursor)->val != node->val) {
        return -1;
    }
    *cursor = (*cursor)->next;
    int right = check109(node->right, cursor);
    if (left < 0 || right < 0 || abs(left - right) > 1) {
        return -1;
    }
    return (left > right ? left : right) + 1;
}

int treeCheck(struct ListNode *head) {
    struct TreeNode *root = sortedListToBST(head);
    struct ListNode *cursor = head;
    return check109(root, &cursor) >= 0 && cursor == NULL;
}`,
  cpp: `\n\nint check109(TreeNode *node, ListNode *&cursor) {
    if (!node) {
        return 0;
    }
    int left = check109(node->left, cursor);
    if (!cursor || cursor->val != node->val) {
        return -1;
    }
    cursor = cursor->next;
    int right = check109(node->right, cursor);
    if (left < 0 || right < 0 || abs(left - right) > 1) {
        return -1;
    }
    return max(left, right) + 1;
}

int treeCheck(ListNode *head) {
    TreeNode *root = sortedListToBST(head);
    ListNode *cursor = head;
    return check109(root, cursor) >= 0 && cursor == nullptr;
}`,
  java: `\n\nint check109(TreeNode node, ListNode[] cursor) {
    if (node == null) {
        return 0;
    }
    int left = check109(node.left, cursor);
    if (cursor[0] == null || cursor[0].val != node.val) {
        return -1;
    }
    cursor[0] = cursor[0].next;
    int right = check109(node.right, cursor);
    if (left < 0 || right < 0 || Math.abs(left - right) > 1) {
        return -1;
    }
    return Math.max(left, right) + 1;
}

int treeCheck(ListNode head) {
    TreeNode root = sortedListToBST(head);
    ListNode[] cursor = {head};
    return check109(root, cursor) >= 0 && cursor[0] == null ? 1 : 0;
}`,
  javascript: `\n\nfunction treeCheck(head) {
  const root = sortedListToBST(head);
  let cursor = head;
  function height(node) {
    if (!node) {
      return 0;
    }
    const left = height(node.left);
    if (!cursor || cursor.val !== node.val) {
      return -1;
    }
    cursor = cursor.next;
    const right = height(node.right);
    if (left < 0 || right < 0 || Math.abs(left - right) > 1) {
      return -1;
    }
    return Math.max(left, right) + 1;
  }
  return height(root) >= 0 && cursor === null ? 1 : 0;
}`,
}

export const q0109: Solution = {
  id: 109,
  plain: '把已排序的鏈結串列改造成一棵左右高度接近的搜尋樹；中間值當根。',
  statement: '給遞增排列的單向鏈結串列 head，回傳高度平衡的二元搜尋樹。每個節點左右子樹的高度差不超過 1；答案不唯一。',
  examples: [{ input: 'head = [-10,-3,0,5,9]', output: '[0,-3,9,-10,null,5]', note: '任一平衡且中序值相同的樹都可。' }, { input: 'head = []', output: '[]' }],
  constraints: ['0 ≤ 節點數 ≤ 2×10⁴；輸入已排序。'],
  insight: ['搜尋樹的中序遍歷應還原原本的排序串列。', '每次選中點當根，左右節點數接近，樹便平衡。', '可先複製成陣列，或沿著 [[p:linked-list]] 的順序以中序方式建樹。'],
  approaches: [
    {
      name: '轉陣列後取中點',
      idea: '先把值放入陣列，以索引取得每個區間的中點建樹。',
      steps: ['走訪串列並收集值。', '取區間中點建根。', '遞迴建左右半段。'],
      figure: { title: 'head = [-10,-3,0,5,9]', steps: [
        { note: '沿串列讀到 [-10,-3,0,5,9]，之後能直接用索引取值。', views: [chain(V), arr(V, { label: '值陣列' })] },
        { note: '中間的 0 作為整棵樹的根。', views: [tree([0], { cls: { 0: 'hl' } })] },
        { note: '左半 [-10,-3] 和右半 [5,9] 各取中點建子樹。', views: [tree([0, -10, 5], { cls: { 1: 'hl', 2: 'hl' } })] },
        { note: '放入其餘值，得到中序順序不變且平衡的樹。', views: [tree([0, -10, 5, null, -3, null, 9], { cls: { 0: 'done' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '收集 n 個值，建樹時每個值處理一次。' },
      verdict: '最易寫，也最容易檢查中序順序。',
      code: {
        python: `def sortedListToBST(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    def build(left, right):
        if left > right:
            return None
        mid = (left + right) // 2          # 中點當根
        node = TreeNode(values[mid])
        node.left = build(left, mid - 1)
        node.right = build(mid + 1, right)
        return node
    return build(0, len(values) - 1)${CHECK.python}`,
        c: `static struct TreeNode *build109(int *values, int left, int right) {
    if (left > right) {
        return NULL;
    }
    int mid = left + (right - left) / 2;
    struct TreeNode *node = calloc(1, sizeof(struct TreeNode));
    node->val = values[mid];
    node->left = build109(values, left, mid - 1);
    node->right = build109(values, mid + 1, right);
    return node;
}

struct TreeNode *sortedListToBST(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) {
        n++;
    }
    int *values = malloc((n + 1) * sizeof(int));
    int i = 0;
    for (struct ListNode *p = head; p; p = p->next) {
        values[i++] = p->val;
    }
    struct TreeNode *root = build109(values, 0, n - 1);
    free(values);
    return root;
}${CHECK.c}`,
        cpp: `TreeNode *sortedListToBST(ListNode *head) {
    vector<int> values;
    for (ListNode *p = head; p; p = p->next) {
        values.push_back(p->val);
    }
    function<TreeNode *(int, int)> build = [&](int left, int right) -> TreeNode * {
        if (left > right) {
            return nullptr;
        }
        int mid = left + (right - left) / 2;
        TreeNode *node = new TreeNode(values[mid]);
        node->left = build(left, mid - 1);
        node->right = build(mid + 1, right);
        return node;
    };
    return build(0, (int)values.size() - 1);
}${CHECK.cpp}`,
        java: `TreeNode sortedListToBST(ListNode head) {
    List<Integer> values = new ArrayList<>();
    for (ListNode p = head; p != null; p = p.next) {
        values.add(p.val);
    }
    return build109(values, 0, values.size() - 1);
}

TreeNode build109(List<Integer> values, int left, int right) {
    if (left > right) {
        return null;
    }
    int mid = left + (right - left) / 2;
    TreeNode node = new TreeNode(values.get(mid));
    node.left = build109(values, left, mid - 1);
    node.right = build109(values, mid + 1, right);
    return node;
}${CHECK.java}`,
        javascript: `function sortedListToBST(head) {
  const values = [];
  for (let p = head; p; p = p.next) {
    values.push(p.val);
  }
  function build(left, right) {
    if (left > right) {
      return null;
    }
    const mid = Math.floor((left + right) / 2);
    const node = new TreeNode(values[mid]);
    node.left = build(left, mid - 1);
    node.right = build(mid + 1, right);
    return node;
  }
  return build(0, values.length - 1);
}${CHECK.javascript}`,
      },
    },
    {
      name: '照中序順序讀串列',
      idea: '先算長度；遞迴建左子樹後，串列游標正好走到根，再建右子樹。',
      steps: ['走訪串列算節點數。', '依區間大小先建左半。', '用目前串列節點當根並將游標前進，再建右半。'],
      figure: { title: 'head = [-10,-3,0,5,9]', steps: [
        { note: '先算出 5 個節點；中序建樹會依串列順序消耗值。', views: [chain(V, { subs: { 0: '游標' } })] },
        { note: '先建根的左半；游標讀到 −10，讓它當左子樹的根。', views: [tree([-10], { cls: { 0: 'hl' } }), chain(V, { cls: { 0: 'done' } })] },
        { note: '接著讀 −3，成為 −10 的右孩子；再讀 0，建立整棵樹的根。', views: [tree([0, -10, null, null, -3], { cls: { 0: 'hl' } })] },
        { note: '最後消耗 5、9 建右半；每個串列節點只讀一次。', views: [tree([0, -10, 5, null, -3, null, 9], { cls: { 0: 'done' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(log n)', why: '串列只走兩遍，遞迴深度為平衡樹高度。' },
      verdict: '節省陣列空間；需要理解中序遍歷的「左、根、右」時機。',
      code: {
        python: `def sortedListToBST(head):
    size = 0
    node = head
    while node:
        size += 1
        node = node.next
    cursor = head
    def build(left, right):
        nonlocal cursor
        if left > right:
            return None
        mid = (left + right) // 2
        left_tree = build(left, mid - 1)
        root = TreeNode(cursor.val)         # 中序輪到根
        cursor = cursor.next
        root.left = left_tree
        root.right = build(mid + 1, right)
        return root
    return build(0, size - 1)${CHECK.python}`,
        c: `static struct TreeNode *build109(int left, int right, struct ListNode **cursor) {
    if (left > right) {
        return NULL;
    }
    int mid = left + (right - left) / 2;
    struct TreeNode *leftTree = build109(left, mid - 1, cursor);
    struct TreeNode *node = calloc(1, sizeof(struct TreeNode));
    node->val = (*cursor)->val;
    *cursor = (*cursor)->next;
    node->left = leftTree;
    node->right = build109(mid + 1, right, cursor);
    return node;
}

struct TreeNode *sortedListToBST(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) {
        n++;
    }
    return build109(0, n - 1, &head);
}${CHECK.c}`,
        cpp: `TreeNode *sortedListToBST(ListNode *head) {
    int n = 0;
    for (ListNode *p = head; p; p = p->next) {
        n++;
    }
    ListNode *cursor = head;
    function<TreeNode *(int, int)> build = [&](int left, int right) -> TreeNode * {
        if (left > right) {
            return nullptr;
        }
        int mid = left + (right - left) / 2;
        TreeNode *leftTree = build(left, mid - 1);
        TreeNode *node = new TreeNode(cursor->val);
        cursor = cursor->next;
        node->left = leftTree;
        node->right = build(mid + 1, right);
        return node;
    };
    return build(0, n - 1);
}${CHECK.cpp}`,
        java: `TreeNode sortedListToBST(ListNode head) {
    int n = 0;
    for (ListNode p = head; p != null; p = p.next) {
        n++;
    }
    ListNode[] cursor = {head};
    return build109(0, n - 1, cursor);
}

TreeNode build109(int left, int right, ListNode[] cursor) {
    if (left > right) {
        return null;
    }
    int mid = left + (right - left) / 2;
    TreeNode leftTree = build109(left, mid - 1, cursor);
    TreeNode node = new TreeNode(cursor[0].val);
    cursor[0] = cursor[0].next;
    node.left = leftTree;
    node.right = build109(mid + 1, right, cursor);
    return node;
}${CHECK.java}`,
        javascript: `function sortedListToBST(head) {
  let size = 0;
  for (let p = head; p; p = p.next) {
    size++;
  }
  let cursor = head;
  function build(left, right) {
    if (left > right) {
      return null;
    }
    const mid = Math.floor((left + right) / 2);
    const leftTree = build(left, mid - 1);
    const node = new TreeNode(cursor.val);
    cursor = cursor.next;
    node.left = leftTree;
    node.right = build(mid + 1, right);
    return node;
  }
  return build(0, size - 1);
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['樹的形狀不唯一；測試驗證中序值和平衡性。', '中序建樹必須先建左子樹，才讀取游標當根。'],
  check: { kind: 'fn', fn: 'treeCheck', argKinds: ['list'], cases: [
    { args: [V], out: 1 }, { args: [[]], out: 1 }, { args: [[1]], out: 1 }, { args: [[1, 2, 3, 4, 5, 6]], out: 1 },
  ] },
}
