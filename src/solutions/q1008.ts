import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

const P = [8, 5, 1, 7, 10, 12]
const CHECK = {
  python: `
def bstCheck(preorder):
    root = bstFromPreorder(preorder)
    actual = []

    def walk(node, low, high):
        if not node:
            return True
        if not low < node.val < high:
            return False
        actual.append(node.val)
        return walk(node.left, low, node.val) and walk(node.right, node.val, high)

    return 1 if walk(root, float('-inf'), float('inf')) and actual == preorder else 0`,
  c: `
static int checkBst(struct TreeNode *node, long long low, long long high, int *preorder, int n, int *at) {
    if (!node) return 1;
    if (node->val <= low || node->val >= high || *at >= n || node->val != preorder[*at]) return 0;
    (*at)++;
    if (!checkBst(node->left, low, node->val, preorder, n, at)) return 0;
    return checkBst(node->right, node->val, high, preorder, n, at);
}

int bstCheck(int *preorder, int preorderSize) {
    struct TreeNode *root = bstFromPreorder(preorder, preorderSize);
    int at = 0;
    return checkBst(root, LLONG_MIN, LLONG_MAX, preorder, preorderSize, &at) && at == preorderSize;
}`,
  cpp: `
int bstCheck(vector<int> preorder) {
    TreeNode* root = bstFromPreorder(preorder);
    int at = 0;
    function<bool(TreeNode*, long long, long long)> walk = [&](TreeNode* node, long long low, long long high) {
        if (!node) return true;
        if (node->val <= low || node->val >= high || at >= (int)preorder.size() || node->val != preorder[at]) return false;
        at++;
        return walk(node->left, low, node->val) && walk(node->right, node->val, high);
    };
    return walk(root, LLONG_MIN, LLONG_MAX) && at == (int)preorder.size() ? 1 : 0;
}`,
  java: `
int bstCheck(int[] preorder) {
    TreeNode root = bstFromPreorder(preorder);
    int[] at = {0};
    boolean valid = checkBst(root, Long.MIN_VALUE, Long.MAX_VALUE, preorder, at);
    return valid && at[0] == preorder.length ? 1 : 0;
}

boolean checkBst(TreeNode node, long low, long high, int[] preorder, int[] at) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high || at[0] >= preorder.length || node.val != preorder[at[0]]) return false;
    at[0]++;
    return checkBst(node.left, low, node.val, preorder, at) && checkBst(node.right, node.val, high, preorder, at);
}`,
  javascript: `
function bstCheck(preorder) {
  const root = bstFromPreorder(preorder);
  let at = 0;
  function walk(node, low, high) {
    if (!node) return true;
    if (node.val <= low || node.val >= high || at >= preorder.length || node.val !== preorder[at]) return false;
    at++;
    return walk(node.left, low, node.val) && walk(node.right, node.val, high);
  }
  return walk(root, -Infinity, Infinity) && at === preorder.length ? 1 : 0;
}`,
}

export const q1008: Solution = {
  id: 1008,
  plain: '已知一棵二元搜尋樹從根、左、右讀出的數字，還原這棵樹。',
  statement: '給互異值組成的 BST 前序遍歷 preorder，建立並回傳原本的二元搜尋樹。',
  examples: [{ input: 'preorder = [8,5,1,7,10,12]', output: '[8,5,10,1,7,null,12]' }, { input: 'preorder = [1,3]', output: '[1,null,3]' }],
  constraints: ['節點數最多 100，所有值互異。'],
  insight: ['BST 中比節點小的值在左邊，較大的值在右邊；可以依序插入。', '前序遍歷的第一個值就是根。遞迴時用上下界限定子樹，下一個值只有在界內才能被該子樹拿走。', '這結合 [[p:tree-dfs]] 與 [[p:bst]]。'],
  approaches: [
    {
      name: '依前序順序逐一插入',
      idea: '前序的每個值都按 BST 大小規則插入已有的樹。',
      steps: ['第一個值建立根', '每個後續值從根比較，小往左、大往右', '走到空位置就建立節點'],
      figure: { title: 'preorder = [8,5,1,7,10,12]', steps: [
        { note: '8 是第一個值，先建立根。', views: [tree([8], { cls: { 0: 'hl' } }), arr(P, { highlight: [0] })] },
        { note: '5 小於 8，放左邊；1 小於 8 又小於 5，放到 5 左邊。', views: [tree([8, 5, null, 1], { cls: { 3: 'hl' } }), arr(P, { done: [0, 1, 2] })] },
        { note: '7 小於 8、大於 5，放在 5 的右邊。', views: [tree([8, 5, null, 1, 7], { cls: { 4: 'hl' } }), arr(P, { done: [0, 1, 2, 3] })] },
        { note: '10 放 8 右邊；12 再放 10 右邊，完成還原。', views: [tree([8, 5, 10, 1, 7, null, 12], { cls: { 6: 'hl' } }), arr(P, { done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(nh)，最壞 O(n²)', space: 'O(h)', why: '每次插入最多走樹高 h；偏斜樹會退化。' },
      verdict: '容易理解，也能用來驗證還原結果。',
      code: {
        python: `def bstFromPreorder(preorder):
    root = TreeNode(preorder[0])
    for value in preorder[1:]:
        node = root
        while True:
            if value < node.val:
                if not node.left:
                    node.left = TreeNode(value)  # 找到應插入的空位
                    break
                node = node.left
            else:
                if not node.right:
                    node.right = TreeNode(value)
                    break
                node = node.right
    return root${CHECK.python}`,
        c: `struct TreeNode *bstFromPreorder(int *preorder, int preorderSize) {
    struct TreeNode *root = malloc(sizeof(struct TreeNode));
    root->val = preorder[0];
    root->left = root->right = NULL;
    for (int i = 1; i < preorderSize; i++) {
        struct TreeNode *node = root;
        for (;;) {
            struct TreeNode **next = preorder[i] < node->val ? &node->left : &node->right;
            if (!*next) {
                *next = malloc(sizeof(struct TreeNode));
                (*next)->val = preorder[i];
                (*next)->left = (*next)->right = NULL;
                break;
            }
            node = *next;
        }
    }
    return root;
}${CHECK.c}`,
        cpp: `TreeNode* bstFromPreorder(vector<int>& preorder) {
    TreeNode* root = new TreeNode(preorder[0]);
    for (int i = 1; i < (int)preorder.size(); i++) {
        TreeNode* node = root;
        for (;;) {
            if (preorder[i] < node->val) {
                if (!node->left) {
                    node->left = new TreeNode(preorder[i]);
                    break;
                }
                node = node->left;
            } else {
                if (!node->right) {
                    node->right = new TreeNode(preorder[i]);
                    break;
                }
                node = node->right;
            }
        }
    }
    return root;
}${CHECK.cpp}`,
        java: `TreeNode bstFromPreorder(int[] preorder) {
    TreeNode root = new TreeNode(preorder[0]);
    for (int i = 1; i < preorder.length; i++) {
        TreeNode node = root;
        for (;;) {
            if (preorder[i] < node.val) {
                if (node.left == null) {
                    node.left = new TreeNode(preorder[i]);
                    break;
                }
                node = node.left;
            } else {
                if (node.right == null) {
                    node.right = new TreeNode(preorder[i]);
                    break;
                }
                node = node.right;
            }
        }
    }
    return root;
}${CHECK.java}`,
        javascript: `function bstFromPreorder(preorder) {
  const root = new TreeNode(preorder[0]);
  for (const value of preorder.slice(1)) {
    let node = root;
    for (;;) {
      if (value < node.val) {
        if (!node.left) {
          node.left = new TreeNode(value);
          break;
        }
        node = node.left;
      } else {
        if (!node.right) {
          node.right = new TreeNode(value);
          break;
        }
        node = node.right;
      }
    }
  }
  return root;
}${CHECK.javascript}`,
      },
    },
    {
      name: '上下界一次建樹',
      idea: '每棵子樹只接受落在自身開區間內的下一個前序值。',
      steps: ['索引 i 指向下一個尚未使用的值', '超出 `(low,high)` 就回傳空，且不移動 i', '合格就建立節點並移動 i', '先用 `(low,值)` 建左子樹，再用 `(值,high)` 建右子樹'],
      figure: { title: 'preorder = [8,5,1,7,10,12]', steps: [
        { note: '取 8 當根；左子樹只能接收小於 8 的值。', views: [tree([8], { cls: { 0: 'hl' } }), arr(P, { highlight: [0] })] },
        { note: '取 5，再取 1；下一個 7 不在 1 的左、右界內，所以回到上一層。', views: [tree([8, 5, null, 1], { cls: { 3: 'hl' } }), arr(P, { highlight: [3] })] },
        { note: '7 落在 (5,8)，成為 5 的右孩子。', views: [tree([8, 5, null, 1, 7], { cls: { 4: 'hl' } }), arr(P, { done: [0, 1, 2, 3] })] },
        { note: '10 超過左子樹上界 8，回到根的右邊；再接 12。', views: [tree([8, 5, 10, 1, 7, null, 12], { cls: { 2: 'done', 6: 'done' } }), arr(P, { done: [0, 1, 2, 3, 4, 5] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個前序值只被取走一次，額外空間是遞迴深度。' },
      verdict: '推薦；前序順序與 BST 範圍限制一起保證唯一建樹。',
      code: {
        python: `def bstFromPreorder(preorder):
    i = 0

    def build(low, high):
        nonlocal i
        if i == len(preorder) or not low < preorder[i] < high:
            return None  # 不屬於這棵子樹，留給祖先
        value = preorder[i]
        i += 1
        node = TreeNode(value)
        node.left = build(low, value)
        node.right = build(value, high)
        return node

    return build(float('-inf'), float('inf'))${CHECK.python}`,
        c: `static struct TreeNode *buildBst(int *a, int n, int *i, long long low, long long high) {
    if (*i == n || a[*i] <= low || a[*i] >= high) return NULL;
    int value = a[(*i)++];
    struct TreeNode *node = malloc(sizeof(struct TreeNode));
    node->val = value;
    node->left = buildBst(a, n, i, low, value);
    node->right = buildBst(a, n, i, value, high);
    return node;
}

struct TreeNode *bstFromPreorder(int *preorder, int preorderSize) {
    int i = 0;
    return buildBst(preorder, preorderSize, &i, LLONG_MIN, LLONG_MAX);
}${CHECK.c}`,
        cpp: `TreeNode* bstFromPreorder(vector<int>& preorder) {
    int i = 0;
    function<TreeNode*(long long, long long)> build = [&](long long low, long long high) -> TreeNode* {
        if (i == (int)preorder.size() || preorder[i] <= low || preorder[i] >= high) return nullptr;
        int value = preorder[i++];
        TreeNode* node = new TreeNode(value);
        node->left = build(low, value);
        node->right = build(value, high);
        return node;
    };
    return build(LLONG_MIN, LLONG_MAX);
}${CHECK.cpp}`,
        java: `int nextIndex;

TreeNode bstFromPreorder(int[] preorder) {
    nextIndex = 0;
    return buildBst(preorder, Long.MIN_VALUE, Long.MAX_VALUE);
}

TreeNode buildBst(int[] a, long low, long high) {
    if (nextIndex == a.length || a[nextIndex] <= low || a[nextIndex] >= high) return null;
    int value = a[nextIndex++];
    TreeNode node = new TreeNode(value);
    node.left = buildBst(a, low, value);
    node.right = buildBst(a, value, high);
    return node;
}${CHECK.java}`,
        javascript: `function bstFromPreorder(preorder) {
  let i = 0;
  function build(low, high) {
    if (i === preorder.length || preorder[i] <= low || preorder[i] >= high) return null;
    const value = preorder[i++];
    const node = new TreeNode(value);
    node.left = build(low, value);
    node.right = build(value, high);
    return node;
  }
  return build(-Infinity, Infinity);
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['上下界不合格時，不能提前移動索引；該值可能屬於上層的右子樹。', '節點值可能接近整數邊界；上下界用更寬型別。'],
  check: { kind: 'fn', fn: 'bstCheck', cases: [
    { args: [P], out: 1 },
    { args: [[1, 3]], out: 1 },
    { args: [[4]], out: 1 },
  ] },
}
