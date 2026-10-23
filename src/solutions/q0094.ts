import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 94. Binary Tree Inorder Traversal

const T = [4, 2, 6, 1, 3, 5, 7]

function recFig(): FigStep[] {
  // 層序索引:0:4 1:2 2:6 3:1 4:3 5:5 6:7;中序 = 1 2 3 4 5 6 7
  const order = [3, 1, 4, 0, 5, 2, 6]
  const out: FigStep[] = [{ note: '中序 = 左子樹 → 自己 → 右子樹。對每個節點都照這個順序,遞迴就寫完了。(這棵是 BST,中序剛好是由小到大)', views: [tree(T)] }]
  order.forEach((idx, k) => {
    if (k % 2 === 0 || k === 3) out.push({ note: `記下 ${T[idx]}${k === 0 ? '(最左下角的節點,沒有左子樹)' : k === 3 ? '(根:左子樹全部走完了才輪到它)' : ''}`, views: [tree(T, { cls: { ...Object.fromEntries(order.slice(0, k).map((i) => [i, 'done'])), [idx]: 'hl' } }), arr(order.slice(0, k + 1).map((i) => T[i]), { label: '結果' })] })
  })
  return out
}

function stackFig(): FigStep[] {
  return [
    { note: '迭代版:用堆疊模擬遞迴。一路往左走,把經過的節點 push(它們都還在等左子樹處理完)', views: [tree(T, { cls: { 0: 'cur', 1: 'cur', 3: 'hl' } }), arr([4, 2, 1], { label: '堆疊(右邊是頂)' })] },
    { note: '走到底(null)就 pop:pop 出來的節點左邊已經處理完 → 記下它,然後轉去它的右子樹,重複「一路往左」', views: [tree(T, { cls: { 3: 'done', 1: 'hl' } }), arr([4, 2], { label: '堆疊' }), arr([1], { label: '結果' })] },
    { note: '2 記下後轉到右子樹 3:往左走(3 沒有左孩子)→ pop 3 記下;再 pop 4 記下,轉去 6…', views: [tree(T, { cls: { 3: 'done', 1: 'done', 4: 'done', 0: 'hl' } }), arr([1, 2, 3, 4], { label: '結果' })] },
  ]
}

function morrisFig(): FigStep[] {
  return [
    { note: 'Morris:不用堆疊,也不用遞迴。走到有左子樹的節點 cur 時,找它左子樹裡最右邊的節點(中序的前一個),把它的右指標暫時指回 cur,當作「回來的路」', views: [tree(T, { cls: { 0: 'cur', 4: 'hl' }, subs: { 4: '3.right → 4' } })] },
    { note: '之後沿著這條暫時的線回到 cur 時,就知道左子樹已經走完:把線拆掉、記下 cur、往右走。每條邊最多走兩次,O(n) 時間 O(1) 空間', views: [tree(T, { cls: { 3: 'done', 1: 'done', 4: 'done', 0: 'hl' } })] },
  ]
}

export const q0094: Solution = {
  id: 94,
  plain: '依「左邊整棵 → 自己 → 右邊整棵」的順序走訪一棵二元樹,把每個節點的值依序記下來。這叫做中序走訪;如果是二元搜尋樹,得到的會剛好由小到大。',
  statement: '給二元樹的根 `root`,回傳節點值的**中序走訪**(左 → 根 → 右)。Follow-up:用迭代完成。',
  examples: [
    { input: 'root = [1,null,2,3]', output: '[1,3,2]' },
    { input: 'root = []', output: '[]' },
    { input: 'root = [4,2,6,1,3,5,7]', output: '[1,2,3,4,5,6,7]' },
  ],
  constraints: ['節點數 ≤ 100'],
  insight: ['遞迴:`inorder(左)`、記下自己、`inorder(右)`', '迭代:遞迴其實是系統幫你用堆疊;自己用堆疊模擬「一路往左、pop、轉右」', 'Morris 走訪:借用葉子的空右指標當回程線,O(1) 額外空間'],
  approaches: [
    {
      name: '遞迴',
      idea: '`dfs(node)`:空就返回;`dfs(左)`、記下值、`dfs(右)`。',
      steps: ['`res = []`', '`dfs(node)`:`if not node: return`', '`dfs(node.left)`、`res.append(node.val)`、`dfs(node.right)`'],
      figure: { title: `root = [${T}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度 = 樹高 h。' },
      verdict: '最直觀,[[p:tree-dfs]]三種順序只差在「記下自己」放在哪一行。',
      code: {
        python: `def inorderTraversal(root):
    res = []
    def dfs(node):
        if not node:
            return
        dfs(node.left)
        res.append(node.val)                  # 左邊走完才記自己
        dfs(node.right)
    dfs(root)
    return res`,
        c: `static void dfs(struct TreeNode *n, int *res, int *k) {
    if (!n) return;
    dfs(n->left, res, k);
    res[(*k)++] = n->val;
    dfs(n->right, res, k);
}

int *inorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    dfs(root, res, returnSize);
    return res;
}`,
        cpp: `void dfs(TreeNode *n, vector<int> &res) {
    if (!n) return;
    dfs(n->left, res);
    res.push_back(n->val);
    dfs(n->right, res);
}

vector<int> inorderTraversal(TreeNode* root) {
    vector<int> res;
    dfs(root, res);
    return res;
}`,
        java: `List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    dfs(root, res);
    return res;
}

private void dfs(TreeNode n, List<Integer> res) {
    if (n == null) return;
    dfs(n.left, res);
    res.add(n.val);
    dfs(n.right, res);
}`,
        javascript: `function inorderTraversal(root) {
  const res = [];
  const dfs = (n) => {
    if (!n) return;
    dfs(n.left);
    res.push(n.val);
    dfs(n.right);
  };
  dfs(root);
  return res;
}`,
      },
    },
    {
      name: '迭代 + 堆疊',
      idea: '`cur` 一路往左 push;到底就 pop、記下、`cur = 右孩子`。',
      steps: ['`st = []`、`cur = root`', '`while cur or st`:', '`while cur`:push cur、`cur = cur.left`', '`cur = st.pop()`;記下 `cur.val`;`cur = cur.right`'],
      figure: { title: `root = [${T}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '堆疊最多存一條從根往左的路徑。' },
      verdict: '最推薦(Follow-up 的答案)。這個「一路往左、pop、轉右」的模板在 [230](#/q/230)、[173](#/q/173) 都會用到。',
      code: {
        python: `def inorderTraversal(root):
    res, st, cur = [], [], root
    while cur or st:
        while cur:                            # 一路往左,沿途的節點都在等
            st.append(cur)
            cur = cur.left
        cur = st.pop()                        # 左邊處理完了
        res.append(cur.val)
        cur = cur.right                       # 轉去右子樹
    return res`,
        c: `int *inorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    struct TreeNode *st[100], *cur = root;
    int top = 0;
    *returnSize = 0;
    while (cur || top) {
        while (cur) { st[top++] = cur; cur = cur->left; }
        cur = st[--top];
        res[(*returnSize)++] = cur->val;
        cur = cur->right;
    }
    return res;
}`,
        cpp: `vector<int> inorderTraversal(TreeNode* root) {
    vector<int> res;
    stack<TreeNode *> st;
    TreeNode *cur = root;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }
        cur = st.top(); st.pop();
        res.push_back(cur->val);
        cur = cur->right;
    }
    return res;
}`,
        java: `List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode cur = root;
    while (cur != null || !st.isEmpty()) {
        while (cur != null) { st.push(cur); cur = cur.left; }
        cur = st.pop();
        res.add(cur.val);
        cur = cur.right;
    }
    return res;
}`,
        javascript: `function inorderTraversal(root) {
  const res = [], st = [];
  let cur = root;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.left;
    }
    cur = st.pop();
    res.push(cur.val);
    cur = cur.right;
  }
  return res;
}`,
      },
    },
    {
      name: 'Morris 走訪',
      idea: '有左子樹時,找左子樹最右節點 pre:`pre.right` 是空 → 指回 cur、往左;已指著 cur → 拆線、記下 cur、往右。沒有左子樹 → 記下、往右。',
      steps: ['`cur = root`', '`cur.left` 為空 → 記下、`cur = cur.right`', '否則找 `pre` = 左子樹最右節點(停在 `pre.right` 為空或等於 cur)', '`pre.right` 為空 → 設成 cur、`cur = cur.left`;否則拆線、記下、`cur = cur.right`'],
      figure: { title: `root = [${T}]`, steps: morrisFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每條邊最多走兩次(找 pre 時);沒有堆疊也沒有遞迴。' },
      verdict: '進階技巧:暫時改動樹、結束時還原。面試問「O(1) 空間」時才需要。',
      code: {
        python: `def inorderTraversal(root):
    res, cur = [], root
    while cur:
        if not cur.left:
            res.append(cur.val)
            cur = cur.right
            continue
        pre = cur.left
        while pre.right and pre.right is not cur:
            pre = pre.right                   # 左子樹裡最右邊 = 中序的前一個
        if not pre.right:
            pre.right = cur                   # 搭一條回來的線
            cur = cur.left
        else:
            pre.right = None                  # 回來了:拆線、記下自己
            res.append(cur.val)
            cur = cur.right
    return res`,
        c: `int *inorderTraversal(struct TreeNode *root, int *returnSize) {
    int *res = malloc(100 * sizeof(int));
    *returnSize = 0;
    struct TreeNode *cur = root;
    while (cur) {
        if (!cur->left) { res[(*returnSize)++] = cur->val; cur = cur->right; continue; }
        struct TreeNode *pre = cur->left;
        while (pre->right && pre->right != cur) pre = pre->right;
        if (!pre->right) { pre->right = cur; cur = cur->left; }
        else { pre->right = NULL; res[(*returnSize)++] = cur->val; cur = cur->right; }
    }
    return res;
}`,
        cpp: `vector<int> inorderTraversal(TreeNode* root) {
    vector<int> res;
    TreeNode *cur = root;
    while (cur) {
        if (!cur->left) { res.push_back(cur->val); cur = cur->right; continue; }
        TreeNode *pre = cur->left;
        while (pre->right && pre->right != cur) pre = pre->right;
        if (!pre->right) { pre->right = cur; cur = cur->left; }
        else { pre->right = nullptr; res.push_back(cur->val); cur = cur->right; }
    }
    return res;
}`,
        java: `List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    TreeNode cur = root;
    while (cur != null) {
        if (cur.left == null) { res.add(cur.val); cur = cur.right; continue; }
        TreeNode pre = cur.left;
        while (pre.right != null && pre.right != cur) pre = pre.right;
        if (pre.right == null) { pre.right = cur; cur = cur.left; }
        else { pre.right = null; res.add(cur.val); cur = cur.right; }
    }
    return res;
}`,
        javascript: `function inorderTraversal(root) {
  const res = [];
  let cur = root;
  while (cur) {
    if (!cur.left) {
      res.push(cur.val);
      cur = cur.right;
      continue;
    }
    let pre = cur.left;
    while (pre.right && pre.right !== cur) pre = pre.right;
    if (!pre.right) {
      pre.right = cur;
      cur = cur.left;
    } else {
      pre.right = null;
      res.push(cur.val);
      cur = cur.right;
    }
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['迭代版 pop 之後忘了轉去右子樹,會一直 pop 同一條路', 'Morris 走完沒有把暫時的線拆掉,樹的結構會被破壞(甚至出現環)'],
  check: {
    kind: 'fn',
    fn: 'inorderTraversal',
    argKinds: ['tree'],
    cases: [
      { args: [[1, null, 2, 3]], out: [1, 3, 2] },
      { args: [[]], out: [] },
      { args: [[1]], out: [1] },
      { args: [T], out: [1, 2, 3, 4, 5, 6, 7] },
      { args: [[1, 2, 3, 4, 5, null, 8, null, null, 6, 7, 9]], out: [4, 2, 6, 5, 7, 1, 3, 9, 8] },
    ],
  },
}
