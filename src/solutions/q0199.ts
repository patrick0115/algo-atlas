import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 199. Binary Tree Right Side View

const T = [1, 2, 3, null, 5, null, 4, 7]

function bfsFig(): FigStep[] {
  let level = [buildTree(T)!]
  const res: number[] = []
  const seen: Record<number, string> = {}
  const out: FigStep[] = [{ note: '站在樹的右邊看,每一層只看得到**最右邊**那個節點。所以就是層序遍歷,每層取最後一個', views: [tree(T)] }]
  while (level.length) {
    const last = level[level.length - 1]
    res.push(last.val)
    level.forEach((n) => (seen[n.i] = 'dim'))
    seen[last.i] = 'done'
    out.push({ note: `這一層是 [${level.map((n) => n.val).join(', ')}],最右邊的是 ${last.val} → 收進答案 [${res.join(', ')}]`, views: [tree(T, { cls: { ...seen, [last.i]: 'hl' } }), arr(res, { label: '答案' })] })
    level = level.flatMap((n) => [n.left, n.right].filter((x): x is FNode => !!x))
  }
  out.push({ note: '注意 7:它在左子樹,但那一層右邊沒有別的節點擋住,所以看得到', views: [tree(T, { cls: seen })] })
  return out
}

function dfsFig(): FigStep[] {
  const res: number[] = []
  const out: FigStep[] = [{ note: 'DFS 的做法:**先走右邊**。每一層第一次到達的節點,就是從右邊看到的那個', views: [tree(T)] }]
  const go = (n: FNode | null, d: number) => {
    if (!n) return
    const first = res.length === d
    if (first) res.push(n.val)
    out.push({ note: `節點 ${n.val} 在第 ${d} 層。${first ? `這一層第一次到 → 收進答案 [${res.join(', ')}]` : `第 ${d} 層已經有人了(${res[d]}),被擋住`}`, views: [tree(T, { cls: { [n.i]: first ? 'hl' : 'dim' } }), arr(res, { label: '答案' })] })
    go(n.right, d + 1)
    go(n.left, d + 1)
  }
  go(buildTree(T), 0)
  return out
}

export const q0199: Solution = {
  id: 199,
  plain: '想像你站在樹的右邊往左看,每一層只會看到最右邊的那個節點(後面的都被擋住了)。由上到下,把看得到的節點列出來。',
  statement: '給二元樹的根,想像你站在它的右側,由上到下回傳你看得到的節點值(也就是每一層最右邊的節點)。',
  examples: [
    { input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]' },
    { input: 'root = [1,2,3,4]', output: '[1,3,4]', note: '4 在左子樹,但第 3 層只有它' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 100`'],
  insight: [
    '「右視圖」不是「一直往右走」:右子樹比較矮時,更深的層可能只有左子樹的節點看得到',
    '所以要的是**每一層的最後一個節點** → 層序遍歷([102](#/q/102)),每層取最後一個',
    'DFS 也行:先走右再走左,每層**第一次**到達的就是最右邊的',
  ],
  approaches: [
    {
      name: 'BFS:每層取最後一個',
      idea: '照 102 的層序遍歷,每一層處理到最後一個節點時,把它放進答案。',
      steps: ['空樹 → `[]`', '`q = [root]`', '每一層:記下 `size`,拿出 size 個,第 size 個(最後一個)放進答案', '孩子放進佇列'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每個節點一次;佇列最多一層。' },
      verdict: '最直觀,直接套 BFS 模板改一行。',
      code: {
        python: `from collections import deque

def rightSideView(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        size = len(q)
        for i in range(size):
            node = q.popleft()
            if i == size - 1:             # 這一層的最後一個
                res.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
    return res`,
        c: `int *rightSideView(struct TreeNode *root, int *returnSize) {
    int *res = malloc(101 * sizeof(int));
    *returnSize = 0;
    if (!root) return res;
    struct TreeNode *q[128];
    int head = 0, tail = 0;
    q[tail++] = root;
    while (head < tail) {
        int size = tail - head;
        for (int i = 0; i < size; i++) {
            struct TreeNode *n = q[head++];
            if (i == size - 1) res[(*returnSize)++] = n->val;
            if (n->left) q[tail++] = n->left;
            if (n->right) q[tail++] = n->right;
        }
    }
    return res;
}`,
        cpp: `vector<int> rightSideView(TreeNode* root) {
    vector<int> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int size = q.size();
        for (int i = 0; i < size; i++) {
            TreeNode* n = q.front(); q.pop();
            if (i == size - 1) res.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
    }
    return res;
}`,
        java: `List<Integer> rightSideView(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    if (root == null) return res;
    Deque<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        int size = q.size();
        for (int i = 0; i < size; i++) {
            TreeNode n = q.poll();
            if (i == size - 1) res.add(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
    }
    return res;
}`,
        javascript: `function rightSideView(root) {
  const res = [];
  let level = root ? [root] : [];
  while (level.length) {
    res.push(level[level.length - 1].val);
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}`,
      },
    },
    {
      name: 'DFS:先右後左,每層第一個',
      idea: '前序遍歷但先走右子樹。帶著深度 d,`len(res) == d` 代表這一層還沒有人,現在這個就是最右邊的。',
      steps: ['`dfs(n, d)`:空 → 結束', '`len(res) == d` → `res.append(n.val)`', '`dfs(右, d + 1)`,再 `dfs(左, d + 1)`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度是樹高。' },
      verdict: '程式更短。「先右後左 + 每層第一個」也可以改成「先左後右」得到左視圖。',
      code: {
        python: `def rightSideView(root):
    res = []

    def dfs(n, d):
        if not n:
            return
        if len(res) == d:                 # 這一層第一次到
            res.append(n.val)
        dfs(n.right, d + 1)               # 先右
        dfs(n.left, d + 1)

    dfs(root, 0)
    return res`,
        c: `static int *res, cnt;

static void dfs(struct TreeNode *n, int d) {
    if (!n) return;
    if (cnt == d) res[cnt++] = n->val;
    dfs(n->right, d + 1);
    dfs(n->left, d + 1);
}

int *rightSideView(struct TreeNode *root, int *returnSize) {
    res = malloc(101 * sizeof(int));
    cnt = 0;
    dfs(root, 0);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> rightSideView(TreeNode* root) {
    vector<int> res;
    function<void(TreeNode*, int)> dfs = [&](TreeNode* n, int d) {
        if (!n) return;
        if ((int)res.size() == d) res.push_back(n->val);
        dfs(n->right, d + 1);
        dfs(n->left, d + 1);
    };
    dfs(root, 0);
    return res;
}`,
        java: `List<Integer> rightSideView(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    dfs(root, 0, res);
    return res;
}

private void dfs(TreeNode n, int d, List<Integer> res) {
    if (n == null) return;
    if (res.size() == d) res.add(n.val);
    dfs(n.right, d + 1, res);
    dfs(n.left, d + 1, res);
}`,
        javascript: `function rightSideView(root) {
  const res = [];
  const dfs = (n, d) => {
    if (!n) return;
    if (res.length === d) res.push(n.val);
    dfs(n.right, d + 1);
    dfs(n.left, d + 1);
  };
  dfs(root, 0);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '一直往右走(`while root: root = root.right`):右子樹比較矮時,會漏掉左子樹更深的層',
    'BFS 取最後一個要用「這一層的最後一個」,不是佇列的最後一個(佇列尾巴已經混進下一層了)',
    'DFS 先走左邊:每層第一個就變成最左邊的,得到的是左視圖',
  ],
  followUp: [{ q: '左視圖?', a: 'BFS 每層取第一個;或 DFS 先左後右。' }],
  check: {
    kind: 'fn',
    fn: 'rightSideView',
    argKinds: ['tree'],
    cases: [
      { args: [[1, 2, 3, null, 5, null, 4]], out: [1, 3, 4] },
      { args: [[1, 2, 3, 4]], out: [1, 3, 4] },
      { args: [[]], out: [] },
      { args: [T], out: [1, 3, 4, 7] },
      { args: [[1, null, 3]], out: [1, 3] },
    ],
  },
}
