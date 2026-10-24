import type { Solution } from './types'
import { tree, chain } from './fig'

// 114. Flatten Binary Tree to Linked List
const T = [1, 2, 5, 3, 4, null, 6]
const steps = [
  { note: '前序走訪先收集 1，再走左子樹收集 2、3、4，最後走右子樹收集 5、6。', views: [tree(T, { cls: { 0: 'visited', 1: 'hl', 3: 'visited', 4: 'visited' } })] },
  { note: '原樹的前序順序是 1、2、3、4、5、6。展開後必須沿 right 依此走，所有 left 都是 null。', views: [tree(T, { cls: { 0: 'hl', 1: 'visited', 3: 'visited', 4: 'visited', 2: 'visited', 6: 'visited' } })] },
  { note: '若先把 1.right 改接 2，就會失去原本的右子樹 5。先保存右子樹，再改指標。', views: [tree(T, { cls: { 1: 'hl', 2: 'dim' } })] },
  { note: '依序把 1.right 接 2、2.right 接 3，並把它們的 left 清空；剩餘節點照相同方式接上。', views: [chain([1,2,3,4,5,6], { label: '逐節點接 right', cls: { 0: 'visited', 1: 'visited', 2: 'hl' } })] },
  { note: '最後每個節點只剩 right 鏈。', views: [chain([1,2,3,4,5,6], { label: 'right 鏈', tail: true, cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done' } })] },
]

export const q0114: Solution = {
  id: 114,
  plain: '把二元樹攤平成一條向右走的鏈，順序就是先根、再左、最後右。',
  statement: '原地將樹改成前序遍歷的單鏈：每個節點 left 為 null，right 指向下一個節點。',
  examples: [{ input: 'root = [1,2,5,3,4,null,6]', output: '[1,null,2,null,3,null,4,null,5,null,6]' }, { input: 'root = []', output: '[]' }],
  constraints: ['0 ≤ 節點數 ≤ 2000。', '要求修改原節點，不應建立替代的新樹。'],
  insight: ['前序順序先左後右；改寫指標前須保住原本的右子樹。', '先收集節點可直接串起來；倒序後序遍歷則可以邊走邊接到前一個節點。', '反向接鏈時：先右、再左、最後根，恰好能得到前序的 right 鏈。'],
  approaches: [
    { name: '前序收集節點', idea: '保存前序走訪的節點陣列，再逐一改接 right。', steps: ['前序 DFS 把節點放進陣列。先確定節點的前序順序，避免改接指標時遺失原本子樹。', '逐個設定 left = null、right = 下一個節點。每次接鏈時同步清空 left，結果才會是一條只沿 right 的鏈。', '末節點 right = null。收尾時確認末節點指向空值，整條鏈才不會意外形成環。'], figure: { title: 'root = [1,2,5,3,4,null,6]', steps }, complexity: { time: 'O(n)', space: 'O(n)', why: '保存 n 個節點與遞迴堆疊。' }, verdict: '最好理解，但需額外陣列。', code: {
      python: `def flatten(root):
    nodes = []

    def dfs(n):
        if not n:  # 空節點沒有指標需要修改。
            return
        nodes.append(n)
        dfs(n.left)
        dfs(n.right)
    dfs(root)
    for i, n in enumerate(nodes):  # 依前序陣列把每個節點接到下一個節點。
        n.left = None
        n.right = nodes[i + 1] if i + 1 < len(nodes) else None`,
      c: `static int count(struct TreeNode *n) {
    return n ? 1 + count(n->left) + count(n->right) : 0;
}
static void collect(struct TreeNode *n, struct TreeNode **a, int *k) {
    if (!n)
        return;
    a[(*k)++] = n;
    collect(n->left, a, k);
    collect(n->right, a, k);
}
void flatten(struct TreeNode *root) {
    int n = count(root), k = 0;
    if (!n)
        return;
    struct TreeNode **a = malloc(n * sizeof(*a));
    collect(root, a, &k);
    for (int i = 0; i < n; i++) {
        a[i]->left = NULL;
        a[i]->right = i + 1 < n ? a[i + 1] : NULL;
    }
    free(a);
}`,
      cpp: `void flatten(TreeNode *root) {
    vector<TreeNode*> a;
    function<void(TreeNode*)> dfs = [&](TreeNode *n) {
        if (!n)
            return;
        a.push_back(n);
        dfs(n->left);
        dfs(n->right);
    };
    dfs(root);
    for (int i = 0; i < (int)a.size(); i++) {
        a[i]->left = nullptr;
        a[i]->right = i + 1 < (int)a.size() ? a[i + 1] : nullptr;
    }
}`,
      java: `void flatten(TreeNode root) {
    List<TreeNode> a = new ArrayList<>();
    collect(root, a);
    for (int i = 0; i < a.size(); i++) {
        TreeNode n = a.get(i);
        n.left = null;
        n.right = i + 1 < a.size() ? a.get(i + 1) : null;
    }
}
void collect(TreeNode n, List<TreeNode> a) {
    if (n == null)
        return;
    a.add(n);
    collect(n.left, a);
    collect(n.right, a);
}`,
      javascript: `function flatten(root) {
    const a = [];
    function dfs(n) {
        if (!n)
            return;
        a.push(n);
        dfs(n.left);
        dfs(n.right);
    }
    dfs(root);
    a.forEach((n, i) => {
        n.left = null; n.right = a[i + 1] ?? null;
    });
}`,
    } },
    { name: '反向後序原地接鏈', idea: '依右、左、根的順序走，把當前節點的 right 指向已處理的前一個節點。', steps: ['令 prev = null。先確定節點的前序順序，避免改接指標時遺失原本子樹。', '遞迴先處理右子樹，再處理左子樹。每次接鏈時同步清空 left，結果才會是一條只沿 right 的鏈。', '令 node.right = prev、node.left = null，再更新 prev = node。收尾時確認末節點指向空值，整條鏈才不會意外形成環。'], figure: { title: 'root = [1,2,5,3,4,null,6]', steps: [{ note: '依 右 → 左 → 根 的順序走，prev 從 null 開始。', views: [tree(T)] },{ note: '先走到 6，然後 5.right = 6；接著處理 4、3、2，最後 1.right = 2。', views: [tree(T, { cls: { 6: 'done', 2: 'visited', 0: 'hl' } })] }, steps[2]] }, complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次，遞迴堆疊長度為樹高。' }, verdict: '只用遞迴堆疊；必須先右後左。', code: {
      python: `def flatten(root):
    prev = None

    def dfs(n):
        nonlocal prev
        if not n:  # 空節點沒有指標需要修改。
            return
        dfs(n.right)
        dfs(n.left)
        n.right, n.left = (prev, None)  # 已處理的鏈接在右邊，左指標清空。
        prev = n
    dfs(root)`,
      c: `static void dfs(struct TreeNode *n, struct TreeNode **prev) {
    if (!n)
        return;
    dfs(n->right, prev);
    dfs(n->left, prev);
    n->right = *prev;
    n->left = NULL;
    *prev = n;
}
void flatten(struct TreeNode *root) {
    struct TreeNode *prev = NULL;
    dfs(root, &prev);
}`,
      cpp: `void flatten(TreeNode *root) {
    TreeNode *prev = nullptr;
    function<void(TreeNode*)> dfs = [&](TreeNode *n) {
        if (!n)
            return;
        dfs(n->right);
        dfs(n->left);
        n->right = prev;
        n->left = nullptr;
        prev = n;
    };
    dfs(root);
}`,
      java: `TreeNode prev;
void flatten(TreeNode root) {
    prev = null;
    dfs(root);
}
void dfs(TreeNode n) {
    if (n == null)
        return;
    dfs(n.right);
    dfs(n.left);
    n.right = prev;
    n.left = null;
    prev = n;
}`,
      javascript: `function flatten(root) {
    let prev = null;
    function dfs(n) {
        if (!n)
            return;
        dfs(n.right);
        dfs(n.left);
        n.right = prev;
        n.left = null;
        prev = n;
    }
    dfs(root);
}`,
    } },
  ],
  pitfalls: ['先覆蓋 right 會弄丟原右子樹。', '每個 left 都要設成 null。', '最後一個節點的 right 必須為 null，不能形成環。'],
  check: { kind: 'fn', fn: 'flatten', argKinds: ['tree'], inplace: 0, cases: [{ args: [T], out: [1,null,2,null,3,null,4,null,5,null,6] }, { args: [[0]], out: [0] }] },
}
