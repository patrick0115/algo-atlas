import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 783. Minimum Distance Between BST Nodes

const T = [4, 2, 6, 1, 3]

function inFig(): FigStep[] {
  return [
    { note: 'BST 的中序走訪是由小到大排好的。最接近的兩個數一定在排序後「相鄰」,所以中序時只要和**前一個**比', views: [tree(T)] },
    { note: '中序:1、2、3、4、6。相鄰差:1、1、1、2 → 最小 1', views: [arr([1, 2, 3, 4, 6], { label: '中序' }), arr([1, 1, 1, 2], { label: '相鄰差', done: [0] })] },
  ]
}

function sortFig(): FigStep[] {
  return [
    { note: '不利用 BST 的性質:隨便走訪收集所有值,再排序', views: [arr([4, 2, 6, 1, 3], { label: '前序收集' })] },
    { note: '排序後看相鄰差 → 1。多了排序的 O(n log n)', views: [arr([1, 2, 3, 4, 6], { label: '排序後', done: [0, 1] })] },
  ]
}

export const q0783: Solution = {
  id: 783,
  plain: '一棵二元搜尋樹裡,任挑兩個不同的節點,它們的值最少差多少?',
  statement: '給二元搜尋樹的根 `root`,回傳任兩個不同節點值之差的**最小值**。(和 530 題相同)',
  examples: [
    { input: 'root = [4,2,6,1,3]', output: '1' },
    { input: 'root = [1,0,48,null,null,12,49]', output: '1' },
  ],
  constraints: ['節點數 2 ~ 100'],
  insight: ['一堆數字裡最小的差,一定出現在排序後相鄰的兩個', 'BST 的中序走訪本身就是排序 → 一邊走一邊和前一個比就好'],
  approaches: [
    {
      name: '中序走訪 + 前一個值',
      idea: '中序走訪時記住 `prev`,每個節點 `best = min(best, val − prev)`。',
      steps: ['`prev = None`、`best = ∞`', '中序走訪每個節點:`prev` 存在 → `best = min(best, val − prev)`', '`prev = val`', '回傳 best'],
      figure: { title: `root = [${T}]`, steps: inFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '中序走訪一次;遞迴 / 堆疊深度 = 樹高。' },
      verdict: '最推薦,[[p:bst]]「中序 = 排序」的直接應用。',
      code: {
        python: `def minDiffInBST(root):
    prev, best = None, float('inf')

    def inorder(n):
        nonlocal prev, best
        if not n:
            return
        inorder(n.left)
        if prev is not None:
            best = min(best, n.val - prev)    # 和中序的前一個(比自己小一點的)比
        prev = n.val
        inorder(n.right)

    inorder(root)
    return best`,
        c: `static int prev_, best_, has_;

static void inorder(struct TreeNode *n) {
    if (!n) return;
    inorder(n->left);
    if (has_ && n->val - prev_ < best_) best_ = n->val - prev_;
    prev_ = n->val; has_ = 1;
    inorder(n->right);
}

int minDiffInBST(struct TreeNode *root) {
    has_ = 0; best_ = INT_MAX;
    inorder(root);
    return best_;
}`,
        cpp: `int minDiffInBST(TreeNode* root) {
    int best = INT_MAX, prev = -1;
    bool has = false;
    stack<TreeNode*> st;
    for (TreeNode *cur = root; cur || !st.empty();) {
        while (cur) { st.push(cur); cur = cur->left; }
        cur = st.top(); st.pop();
        if (has) best = min(best, cur->val - prev);
        prev = cur->val; has = true;
        cur = cur->right;
    }
    return best;
}`,
        java: `private Integer prev;
private int best;

int minDiffInBST(TreeNode root) {
    prev = null;
    best = Integer.MAX_VALUE;
    inorder(root);
    return best;
}

private void inorder(TreeNode n) {
    if (n == null) return;
    inorder(n.left);
    if (prev != null) best = Math.min(best, n.val - prev);
    prev = n.val;
    inorder(n.right);
}`,
        javascript: `function minDiffInBST(root) {
  let prev = null, best = Infinity;
  const inorder = (n) => {
    if (!n) return;
    inorder(n.left);
    if (prev !== null) best = Math.min(best, n.val - prev);
    prev = n.val;
    inorder(n.right);
  };
  inorder(root);
  return best;
}`,
      },
    },
    {
      name: '收集所有值 + 排序',
      idea: '任意走訪收集值,排序後取相鄰差的最小值。',
      steps: ['DFS 收集所有值', '排序', '回傳 `min(b − a)`,a、b 相鄰'],
      figure: { title: `root = [${T}]`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序的成本。' },
      verdict: '對任何二元樹都成立;用來對照「BST 中序免排序」的好處。',
      code: {
        python: `def minDiffInBST(root):
    vals, st = [], [root]
    while st:
        n = st.pop()
        if n:
            vals.append(n.val)
            st.append(n.left)
            st.append(n.right)
    vals.sort()
    return min(b - a for a, b in zip(vals, vals[1:]))`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }
static void collect(struct TreeNode *n, int *v, int *k) {
    if (!n) return;
    v[(*k)++] = n->val;
    collect(n->left, v, k);
    collect(n->right, v, k);
}

int minDiffInBST(struct TreeNode *root) {
    int v[128], k = 0, best = INT_MAX;
    collect(root, v, &k);
    qsort(v, k, sizeof(int), cmp);
    for (int i = 1; i < k; i++) if (v[i] - v[i - 1] < best) best = v[i] - v[i - 1];
    return best;
}`,
        cpp: `void collect(TreeNode *n, vector<int> &v) {
    if (!n) return;
    v.push_back(n->val);
    collect(n->left, v);
    collect(n->right, v);
}

int minDiffInBST(TreeNode* root) {
    vector<int> v;
    collect(root, v);
    sort(v.begin(), v.end());
    int best = INT_MAX;
    for (size_t i = 1; i < v.size(); i++) best = min(best, v[i] - v[i - 1]);
    return best;
}`,
        java: `int minDiffInBST(TreeNode root) {
    List<Integer> v = new ArrayList<>();
    collect(root, v);
    Collections.sort(v);
    int best = Integer.MAX_VALUE;
    for (int i = 1; i < v.size(); i++) best = Math.min(best, v.get(i) - v.get(i - 1));
    return best;
}

private void collect(TreeNode n, List<Integer> v) {
    if (n == null) return;
    v.add(n.val);
    collect(n.left, v);
    collect(n.right, v);
}`,
        javascript: `function minDiffInBST(root) {
  const v = [];
  const collect = (n) => {
    if (!n) return;
    v.push(n.val);
    collect(n.left);
    collect(n.right);
  };
  collect(root);
  v.sort((a, b) => a - b);
  let best = Infinity;
  for (let i = 1; i < v.length; i++) best = Math.min(best, v[i] - v[i - 1]);
  return best;
}`,
      },
    },
  ],
  pitfalls: ['只比較父子之間的差:最接近的兩個數不一定是父子(例 1 的 3 和 4 差 1,但 3 是 4 的孫子)', 'prev 用 0 或 −1 當初始值:值可能是 0,要用「還沒有前一個」的旗標'],
  check: {
    kind: 'fn',
    fn: 'minDiffInBST',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: 1 },
      { args: [[1, 0, 48, null, null, 12, 49]], out: 1 },
      { args: [[90, 69, null, 49, 89, null, 52]], out: 1 },
      { args: [[10, 5, 20]], out: 5 },
    ],
  },
}
