import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 230. Kth Smallest Element in a BST

const T = [5, 3, 6, 2, 4, null, null, 1]
const K = 3

function sortFig(): FigStep[] {
  const vals: number[] = []
  const walk = (n: FNode | null) => {
    if (!n) return
    vals.push(n.val)
    walk(n.left)
    walk(n.right)
  }
  walk(buildTree(T))
  const s = [...vals].sort((a, b) => a - b)
  return [
    { note: '最直接:把所有值收集起來、排序,取第 k 個。沒有用到 BST 的性質', views: [tree(T), arr(vals, { label: '收集到的值(前序)' })] },
    { note: `排序後第 ${K} 小的是 ${s[K - 1]}`, views: [arr(s, { label: '排序後', highlight: [K - 1] })] },
  ]
}

function inorderFig(): FigStep[] {
  const root = buildTree(T)
  const order: number[] = []
  const cls: Record<number, string> = {}
  const out: FigStep[] = [{ note: 'BST:左子樹 < 根 < 右子樹。所以**中序遍歷(左 → 根 → 右)會由小到大**走過所有值。走到第 k 個就停', views: [tree(T)] }]
  const st: FNode[] = []
  let cur = root
  let cnt = 0
  while (cur || st.length) {
    while (cur) {
      st.push(cur)
      cur = cur.left
    }
    const n = st.pop()!
    cnt++
    order.push(n.val)
    cls[n.i] = 'done'
    out.push({ note: `中序第 ${cnt} 個:${n.val}${cnt === K ? ` → 這就是第 ${K} 小,停!` : ''}`, views: [tree(T, { cls: { ...cls, [n.i]: 'hl' } }), arr(order, { label: '中序走過的順序(由小到大)', highlight: [cnt - 1] }), arr(st.map((x) => x.val), { label: '堆疊(還沒處理的祖先)' })] })
    if (cnt === K) return out
    cur = n.right
  }
  return out
}

export const q0230: Solution = {
  id: 230,
  plain: '在一棵「左邊都比較小、右邊都比較大」的樹(二元搜尋樹)裡,找第 k 小的數。訣竅:照「左、中、右」的順序走,剛好就是由小到大,數到第 k 個就是答案。',
  statement: '給一棵**二元搜尋樹**(BST)的根和整數 `k`,回傳樹中第 `k` 小的值(k 從 1 開始)。',
  examples: [
    { input: 'root = [3,1,4,null,2], k = 1', output: '1' },
    { input: 'root = [5,3,6,2,4,null,null,1], k = 3', output: '3' },
  ],
  constraints: ['`1 ≤ k ≤ n ≤ 10⁴`', 'Follow-up:如果樹會一直被插入、刪除,又要常常問第 k 小,怎麼辦?'],
  insight: [
    'BST 的性質:每個節點的左子樹都比它小、右子樹都比它大',
    '所以**中序遍歷(左 → 根 → 右)**拿到的值剛好是由小到大排好的',
    '第 k 小 = 中序遍歷的第 k 個。只要數到 k 就可以停,不用走完整棵樹',
  ],
  approaches: [
    {
      name: '全部收集再排序',
      idea: '隨便用一種遍歷把所有值收集起來,排序後取第 k 個。',
      steps: ['走過整棵樹,收集所有值', '排序', '回傳第 `k − 1` 個'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}], k = ${K}`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '收集 O(n),排序 O(n log n)。' },
      verdict: '沒有用到 BST 的性質,對任何二元樹都成立,但浪費。',
      code: {
        python: `def kthSmallest(root, k):
    vals = []
    stack = [root]
    while stack:
        n = stack.pop()
        if n:
            vals.append(n.val)
            stack += [n.left, n.right]
    return sorted(vals)[k - 1]`,
        c: `static int vals[10001], cnt;

static void collect(struct TreeNode *n) {
    if (!n) return;
    vals[cnt++] = n->val;
    collect(n->left);
    collect(n->right);
}

static int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int kthSmallest(struct TreeNode *root, int k) {
    cnt = 0;
    collect(root);
    qsort(vals, cnt, sizeof(int), cmpInt);
    return vals[k - 1];
}`,
        cpp: `int kthSmallest(TreeNode* root, int k) {
    vector<int> vals;
    function<void(TreeNode*)> collect = [&](TreeNode* n) {
        if (!n) return;
        vals.push_back(n->val);
        collect(n->left);
        collect(n->right);
    };
    collect(root);
    sort(vals.begin(), vals.end());
    return vals[k - 1];
}`,
        java: `int kthSmallest(TreeNode root, int k) {
    List<Integer> vals = new ArrayList<>();
    Deque<TreeNode> st = new ArrayDeque<>();
    st.push(root);
    while (!st.isEmpty()) {
        TreeNode n = st.pop();
        vals.add(n.val);
        if (n.left != null) st.push(n.left);
        if (n.right != null) st.push(n.right);
    }
    Collections.sort(vals);
    return vals.get(k - 1);
}`,
        javascript: `function kthSmallest(root, k) {
  const vals = [];
  const st = [root];
  while (st.length) {
    const n = st.pop();
    if (!n) continue;
    vals.push(n.val);
    st.push(n.left, n.right);
  }
  return vals.sort((a, b) => a - b)[k - 1];
}`,
      },
    },
    {
      name: '中序遍歷,數到第 k 個就停',
      idea: '用堆疊做迭代的中序遍歷:一路往左推進堆疊,彈出一個就是下一個最小的,數到 k 就回傳。',
      steps: ['`cur = root`、`st = []`', '`while cur or st`:一路往左,把節點 push 進堆疊', '彈出 `n`,`k -= 1`;`k == 0` → 回傳 `n.val`', '`cur = n.right`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}], k = ${K}`, steps: inorderFig() },
      complexity: { time: 'O(h + k)', space: 'O(h)', why: '先往左走到底(h 步),之後每彈出一個就前進一個,總共 h + k 步。堆疊最多存一條路徑。' },
      verdict: '標準解,而且可以提早停。迭代中序遍歷的寫法(一路往左 → 彈出 → 轉向右邊)值得背熟,BST 迭代器(173)就是它。',
      code: {
        python: `def kthSmallest(root, k):
    st, cur = [], root
    while cur or st:
        while cur:                        # 一路往左
            st.append(cur)
            cur = cur.left
        n = st.pop()                      # 目前還沒走過的最小值
        k -= 1
        if k == 0:
            return n.val
        cur = n.right
    return -1`,
        c: `int kthSmallest(struct TreeNode *root, int k) {
    struct TreeNode *st[10001], *cur = root;
    int top = 0;
    while (cur || top) {
        while (cur) { st[top++] = cur; cur = cur->left; }
        struct TreeNode *n = st[--top];
        if (--k == 0) return n->val;
        cur = n->right;
    }
    return -1;
}`,
        cpp: `int kthSmallest(TreeNode* root, int k) {
    stack<TreeNode*> st;
    TreeNode* cur = root;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }
        TreeNode* n = st.top(); st.pop();
        if (--k == 0) return n->val;
        cur = n->right;
    }
    return -1;
}`,
        java: `int kthSmallest(TreeNode root, int k) {
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode cur = root;
    while (cur != null || !st.isEmpty()) {
        while (cur != null) { st.push(cur); cur = cur.left; }
        TreeNode n = st.pop();
        if (--k == 0) return n.val;
        cur = n.right;
    }
    return -1;
}`,
        javascript: `function kthSmallest(root, k) {
  const st = [];
  let cur = root;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.left;
    }
    const n = st.pop();
    if (--k === 0) return n.val;
    cur = n.right;
  }
  return -1;
}`,
      },
    },
    {
      name: '遞迴中序 + 計數器',
      idea: '遞迴版的中序遍歷,用一個計數器數「走過第幾個」,數到 k 時記下答案並停止。',
      steps: ['`dfs(n)`:空或已經找到 → 結束', '`dfs(n.left)`', '計數 +1,等於 k → 記下 `n.val`', '`dfs(n.right)`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}], k = ${K}`, steps: inorderFig() },
      complexity: { time: 'O(h + k)', space: 'O(h)', why: '找到之後就不再往下走。' },
      verdict: '最好寫;要用外部變數記「數到第幾個」和「答案」。',
      code: {
        python: `def kthSmallest(root, k):
    ans = None

    def dfs(n):
        nonlocal k, ans
        if not n or ans is not None:
            return
        dfs(n.left)
        k -= 1
        if k == 0:
            ans = n.val
            return
        dfs(n.right)

    dfs(root)
    return ans`,
        c: `static int cntLeft, ans;

static void dfs(struct TreeNode *n) {
    if (!n || cntLeft <= 0) return;
    dfs(n->left);
    if (--cntLeft == 0) { ans = n->val; return; }
    dfs(n->right);
}

int kthSmallest(struct TreeNode *root, int k) {
    cntLeft = k;
    dfs(root);
    return ans;
}`,
        cpp: `int kthSmallest(TreeNode* root, int k) {
    int ans = -1;
    function<void(TreeNode*)> dfs = [&](TreeNode* n) {
        if (!n || k <= 0) return;
        dfs(n->left);
        if (--k == 0) { ans = n->val; return; }
        dfs(n->right);
    };
    dfs(root);
    return ans;
}`,
        java: `private int left, ans;

int kthSmallest(TreeNode root, int k) {
    left = k;
    dfs(root);
    return ans;
}

private void dfs(TreeNode n) {
    if (n == null || left <= 0) return;
    dfs(n.left);
    if (--left == 0) { ans = n.val; return; }
    dfs(n.right);
}`,
        javascript: `function kthSmallest(root, k) {
  let ans = -1;
  const dfs = (n) => {
    if (!n || k <= 0) return;
    dfs(n.left);
    if (--k === 0) {
      ans = n.val;
      return;
    }
    dfs(n.right);
  };
  dfs(root);
  return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '用前序或後序:只有**中序**在 BST 上才是由小到大',
    'k 是從 1 開始數的,第 1 小是最小值',
    '遞迴版找到之後沒有停:還會繼續往右走,浪費時間(答案不會錯,但沒有提早結束)',
  ],
  followUp: [
    { q: '樹常常變動、又常常問第 k 小?', a: '在每個節點多存「子樹大小」。查第 k 小時:左子樹大小 ≥ k 往左、剛好 k−1 就是自己、否則往右找 k − 左大小 − 1。查詢 O(h)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'kthSmallest',
    argKinds: ['tree'],
    cases: [
      { args: [[3, 1, 4, null, 2], 1], out: 1 },
      { args: [T, K], out: 3 },
      { args: [T, 6], out: 6 },
      { args: [[1], 1], out: 1 },
      { args: [[2, 1, 3], 2], out: 2 },
    ],
  },
}
