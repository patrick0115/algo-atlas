import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 106. Construct Binary Tree from Inorder and Postorder Traversal

const IN = [9, 3, 15, 20, 7]
const POST = [9, 15, 7, 20, 3]
const RES = [3, 9, 20, null, null, 15, 7]

function recFig(): FigStep[] {
  return [
    { note: '後序的**最後一個**一定是根(左 → 右 → 根)。根是 3', views: [arr(POST, { label: 'postorder', highlight: [4] }), arr(IN, { label: 'inorder' })] },
    { note: '在中序裡找到 3:左邊 [9] 是左子樹、右邊 [15, 20, 7] 是右子樹。用 Hash 表記每個值在中序的位置,O(1) 找到', views: [arr(IN, { label: 'inorder', highlight: [1], range: [0, 0] }), arr(IN, { label: '右子樹的範圍', range: [2, 4] })] },
    { note: '從後序的尾巴往前拿根:3 之後是 20(右子樹的根)→ 所以要**先建右子樹、再建左子樹**', views: [arr(POST, { label: 'postorder', done: [4], highlight: [3] })] },
    { note: '遞迴到底就得到整棵樹', views: [tree(RES)] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '迭代版:從後序的尾巴往前、中序的尾巴往前。一路往右建(後序倒著看是「根 → 右 → 左」),堆疊記住還沒處理左邊的節點', views: [arr([3, 20, 7], { label: '堆疊(一路往右)' })] },
    { note: '堆疊頂等於中序目前指的值時,表示右邊走完了 → pop,下一個新節點接在最後 pop 出來那個的左邊', views: [tree(RES, { cls: { 0: 'done', 2: 'done', 6: 'done', 5: 'hl' } })] },
  ]
}

export const q0106: Solution = {
  id: 106,
  plain: '給你一棵樹的「中序」和「後序」走訪結果,把原本的樹還原回來(假設沒有重複的值)。',
  statement: '給兩個整數陣列 `inorder`(中序)和 `postorder`(後序),值都不重複,建構並回傳這棵二元樹。',
  examples: [
    { input: 'inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]', output: '[3,9,20,null,null,15,7]' },
    { input: 'inorder = [-1], postorder = [-1]', output: '[-1]' },
  ],
  constraints: ['n ≤ 3000,值互不相同'],
  insight: ['後序最後一個 = 根', '在中序裡找到根,左邊是左子樹、右邊是右子樹(同時也知道兩邊的大小)', '和 [105](#/q/105) 對稱:105 從前序開頭拿根、先建左;這題從後序結尾拿根、**先建右**'],
  approaches: [
    {
      name: '遞迴 + 中序位置的 Hash 表',
      idea: '`pos[v]` = v 在中序的索引;`build(l, r)`:從後序尾巴取根,`m = pos[根]`,先 `build(m+1, r)` 當右子樹,再 `build(l, m−1)` 當左子樹。',
      steps: ['`pos = {v: i}`;`p = n − 1`(後序指標)', '`build(l, r)`:`l > r` → None', '`root = TreeNode(post[p])`、`p -= 1`;`m = pos[root.val]`', '`root.right = build(m + 1, r)`;`root.left = build(l, m − 1)`(順序不能反)'],
      figure: { title: `inorder = [${IN}],postorder = [${POST}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點建一次;Hash 表 O(n)。' },
      verdict: '最推薦。關鍵是「後序倒著拿 = 根 → 右 → 左」,所以右子樹要先建。',
      code: {
        python: `def buildTree(inorder, postorder):
    pos = {v: i for i, v in enumerate(inorder)}
    p = len(postorder) - 1

    def build(l, r):                          # 中序的範圍 [l, r]
        nonlocal p
        if l > r:
            return None
        root = TreeNode(postorder[p])
        p -= 1
        m = pos[root.val]
        root.right = build(m + 1, r)          # 先右:後序倒著看是 根 → 右 → 左
        root.left = build(l, m - 1)
        return root

    return build(0, len(inorder) - 1)`,
        c: `// 值在 −3000 ~ 3000,用陣列當 Hash 表
static int pos_[6001], *post_, p_;

static struct TreeNode *build(int l, int r) {
    if (l > r) return NULL;
    struct TreeNode *root = malloc(sizeof *root);
    root->val = post_[p_--];
    int m = pos_[root->val + 3000];
    root->right = build(m + 1, r);
    root->left = build(l, m - 1);
    return root;
}

struct TreeNode *buildTree(int *inorder, int inorderSize, int *postorder, int postorderSize) {
    for (int i = 0; i < inorderSize; i++) pos_[inorder[i] + 3000] = i;
    post_ = postorder; p_ = postorderSize - 1;
    return build(0, inorderSize - 1);
}`,
        cpp: `unordered_map<int, int> pos;
int p;

TreeNode* build(vector<int> &post, int l, int r) {
    if (l > r) return nullptr;
    TreeNode *root = new TreeNode(post[p--]);
    int m = pos[root->val];
    root->right = build(post, m + 1, r);
    root->left = build(post, l, m - 1);
    return root;
}

TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
    pos.clear();
    for (int i = 0; i < (int)inorder.size(); i++) pos[inorder[i]] = i;
    p = postorder.size() - 1;
    return build(postorder, 0, inorder.size() - 1);
}`,
        java: `private Map<Integer, Integer> pos;
private int p;
private int[] post;

TreeNode buildTree(int[] inorder, int[] postorder) {
    pos = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) pos.put(inorder[i], i);
    post = postorder;
    p = postorder.length - 1;
    return build(0, inorder.length - 1);
}

private TreeNode build(int l, int r) {
    if (l > r) return null;
    TreeNode root = new TreeNode(post[p--]);
    int m = pos.get(root.val);
    root.right = build(m + 1, r);
    root.left = build(l, m - 1);
    return root;
}`,
        javascript: `function buildTree(inorder, postorder) {
  const pos = new Map(inorder.map((v, i) => [v, i]));
  let p = postorder.length - 1;
  const build = (l, r) => {
    if (l > r) return null;
    const root = new TreeNode(postorder[p--]);
    const m = pos.get(root.val);
    root.right = build(m + 1, r);
    root.left = build(l, m - 1);
    return root;
  };
  return build(0, inorder.length - 1);
}`,
      },
    },
    {
      name: '迭代 + 堆疊',
      idea: '後序從尾巴往前看(根、右、左的順序);新節點預設接在堆疊頂的右邊;當堆疊頂等於中序(從尾巴往前)目前的值,就一直 pop,新節點改接在最後 pop 出來的節點左邊。',
      steps: ['`root = TreeNode(post[-1])`、`st = [root]`、`i = n − 1`(中序指標)', '`for p in n−2..0`:`node = TreeNode(post[p])`', '`parent = None`;`while st and st[-1].val == inorder[i]`:`parent = st.pop()`、`i -= 1`', '`parent` 存在 → `parent.left = node`;否則 `st[-1].right = node`;push node'],
      figure: { title: `inorder = [${IN}],postorder = [${POST}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點 push、pop 各一次;不需要 Hash 表。' },
      verdict: '不用遞迴也不用 Hash 表,但不太直觀。先把遞迴版想清楚再看這個。',
      code: {
        python: `def buildTree(inorder, postorder):
    n = len(postorder)
    root = TreeNode(postorder[-1])
    st, i = [root], n - 1
    for p in range(n - 2, -1, -1):
        node = TreeNode(postorder[p])
        parent = None
        while st and st[-1].val == inorder[i]:   # 右邊走到底了,往回找要接左孩子的節點
            parent = st.pop()
            i -= 1
        if parent:
            parent.left = node
        else:
            st[-1].right = node
        st.append(node)
    return root`,
        c: `struct TreeNode *buildTree(int *inorder, int inorderSize, int *postorder, int postorderSize) {
    int n = postorderSize, top = 0, i = n - 1;
    struct TreeNode **st = malloc(n * sizeof *st);
    struct TreeNode *root = calloc(1, sizeof *root);
    root->val = postorder[n - 1];
    st[top++] = root;
    for (int p = n - 2; p >= 0; p--) {
        struct TreeNode *node = calloc(1, sizeof *node), *parent = NULL;
        node->val = postorder[p];
        while (top && st[top - 1]->val == inorder[i]) { parent = st[--top]; i--; }
        if (parent) parent->left = node;
        else st[top - 1]->right = node;
        st[top++] = node;
    }
    free(st);
    return root;
}`,
        cpp: `TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
    int n = postorder.size(), i = n - 1;
    TreeNode *root = new TreeNode(postorder[n - 1]);
    vector<TreeNode*> st{root};
    for (int p = n - 2; p >= 0; p--) {
        TreeNode *node = new TreeNode(postorder[p]), *parent = nullptr;
        while (!st.empty() && st.back()->val == inorder[i]) { parent = st.back(); st.pop_back(); i--; }
        if (parent) parent->left = node;
        else st.back()->right = node;
        st.push_back(node);
    }
    return root;
}`,
        java: `TreeNode buildTree(int[] inorder, int[] postorder) {
    int n = postorder.length, i = n - 1;
    TreeNode root = new TreeNode(postorder[n - 1]);
    Deque<TreeNode> st = new ArrayDeque<>();
    st.push(root);
    for (int p = n - 2; p >= 0; p--) {
        TreeNode node = new TreeNode(postorder[p]), parent = null;
        while (!st.isEmpty() && st.peek().val == inorder[i]) { parent = st.pop(); i--; }
        if (parent != null) parent.left = node;
        else st.peek().right = node;
        st.push(node);
    }
    return root;
}`,
        javascript: `function buildTree(inorder, postorder) {
  const n = postorder.length;
  const root = new TreeNode(postorder[n - 1]), st = [root];
  let i = n - 1;
  for (let p = n - 2; p >= 0; p--) {
    const node = new TreeNode(postorder[p]);
    let parent = null;
    while (st.length && st[st.length - 1].val === inorder[i]) {
      parent = st.pop();
      i--;
    }
    if (parent) parent.left = node;
    else st[st.length - 1].right = node;
    st.push(node);
  }
  return root;
}`,
      },
    },
  ],
  pitfalls: ['先建左子樹再建右子樹:後序倒著拿的順序是根 → 右 → 左,順序反了會建錯', '每次在中序裡線性找根:O(n²)'],
  check: {
    kind: 'fn',
    fn: 'buildTree',
    ret: 'tree',
    cases: [
      { args: [IN, POST], out: RES },
      { args: [[-1], [-1]], out: [-1] },
      { args: [[2, 1], [2, 1]], out: [1, 2] },
      { args: [[1, 2, 3, 4], [1, 2, 4, 3]], out: [3, 2, 4, 1] },
    ],
  },
}
