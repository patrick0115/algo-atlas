import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 513. Find Bottom Left Tree Value

const T = [1, 2, 3, 4, null, 5, 6, null, null, 7]

function bfsFig(): FigStep[] {
  return [
    { note: '要找「最深一層、最左邊」的節點。BFS 一層一層走;小技巧:每層**由右往左**放進佇列,這樣最後一個被拿出來的節點就是答案', views: [tree(T, { cls: { 0: 'hl' } })] },
    { note: '順序:1 → 3 → 2 → 6 → 5 → 4 → 7。最後一個是 7', views: [tree(T, { cls: { 0: 'done', 2: 'done', 1: 'done', 6: 'done', 5: 'done', 3: 'done', 9: 'hl' } })] },
  ]
}

function dfsFig(): FigStep[] {
  return [
    { note: 'DFS 版:先走左邊再走右邊,記錄「目前看過最深的深度」。第一次到達更深的一層時,遇到的一定是那一層最左邊的節點', views: [tree(T, { cls: { 0: 'path', 1: 'path', 3: 'hl' }, subs: { 3: '深度 2' } })] },
    { note: '走到 7(深度 3)時第一次到達深度 3 → 記下 7。之後同一層的節點都不會更新', views: [tree(T, { cls: { 0: 'path', 2: 'path', 5: 'path', 9: 'done' }, subs: { 9: '深度 3' } })] },
  ]
}

export const q0513: Solution = {
  id: 513,
  plain: '找出一棵樹「最下面那一層」最左邊的節點的值。',
  statement: '給二元樹的根 `root`,回傳**最後一層**最左邊節點的值。',
  examples: [
    { input: 'root = [2,1,3]', output: '1' },
    { input: 'root = [1,2,3,4,null,5,6,null,null,7]', output: '7' },
  ],
  constraints: ['節點數 1 ~ 10⁴'],
  insight: ['「一層一層」→ BFS,最後一層的第一個就是答案', '每層由右往左放,最後一個拿出來的就是最下層最左邊 → 不用另外記層', 'DFS:先左後右,第一次抵達新的深度時的節點就是那層最左邊'],
  approaches: [
    {
      name: 'BFS(由右往左)',
      idea: '佇列每次先放右孩子再放左孩子;走完時最後一個節點就是答案。',
      steps: ['`q = [root]`', '`while q`:`node = q.popleft()`', '先 `q.append(node.right)` 再 `q.append(node.left)`(有的話)', '回傳最後一個 node 的值'],
      figure: { title: `root = [${T}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: 'w = 最寬那層的節點數。' },
      verdict: '最推薦,[[p:tree-bfs]]的小變形:改放入順序就省掉了「分層」的處理。',
      code: {
        python: `from collections import deque

def findBottomLeftValue(root):
    q = deque([root])
    while q:
        node = q.popleft()
        if node.right:
            q.append(node.right)              # 右邊先放
        if node.left:
            q.append(node.left)               # 左邊後放 → 同一層裡左邊最後被拿出來
    return node.val`,
        c: `int findBottomLeftValue(struct TreeNode *root) {
    struct TreeNode **q = malloc(10005 * sizeof(struct TreeNode *)), *node = root;
    int h = 0, t = 0;
    q[t++] = root;
    while (h < t) {
        node = q[h++];
        if (node->right) q[t++] = node->right;
        if (node->left) q[t++] = node->left;
    }
    free(q);
    return node->val;
}`,
        cpp: `int findBottomLeftValue(TreeNode* root) {
    queue<TreeNode*> q;
    q.push(root);
    TreeNode *node = root;
    while (!q.empty()) {
        node = q.front(); q.pop();
        if (node->right) q.push(node->right);
        if (node->left) q.push(node->left);
    }
    return node->val;
}`,
        java: `int findBottomLeftValue(TreeNode root) {
    Deque<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    TreeNode node = root;
    while (!q.isEmpty()) {
        node = q.poll();
        if (node.right != null) q.offer(node.right);
        if (node.left != null) q.offer(node.left);
    }
    return node.val;
}`,
        javascript: `function findBottomLeftValue(root) {
  const q = [root];
  let node = root;
  for (let h = 0; h < q.length; h++) {
    node = q[h];
    if (node.right) q.push(node.right);
    if (node.left) q.push(node.left);
  }
  return node.val;
}`,
      },
    },
    {
      name: 'DFS 記最大深度',
      idea: '先左後右的 DFS;`depth > best` 時更新答案為目前節點(第一次到達這個深度的一定是最左邊)。',
      steps: ['`best = −1`、`ans = root.val`', '`dfs(node, d)`:`d > best` → `best = d`、`ans = node.val`', '`dfs(left, d + 1)`,再 `dfs(right, d + 1)`', '回傳 ans'],
      figure: { title: `root = [${T}]`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '遞迴深度 = 樹高。' },
      verdict: '空間只跟樹高有關;關鍵是「嚴格大於」才更新,以及先左後右。',
      code: {
        python: `def findBottomLeftValue(root):
    best, ans = -1, root.val

    def dfs(node, d):
        nonlocal best, ans
        if not node:
            return
        if d > best:                          # 第一次到這個深度:一定是最左邊的
            best, ans = d, node.val
        dfs(node.left, d + 1)                 # 先左
        dfs(node.right, d + 1)

    dfs(root, 0)
    return ans`,
        c: `static int best_, ans_;

static void dfs(struct TreeNode *n, int d) {
    if (!n) return;
    if (d > best_) { best_ = d; ans_ = n->val; }
    dfs(n->left, d + 1);
    dfs(n->right, d + 1);
}

int findBottomLeftValue(struct TreeNode *root) {
    best_ = -1;
    dfs(root, 0);
    return ans_;
}`,
        cpp: `int best = -1, ans = 0;

void dfs(TreeNode *n, int d) {
    if (!n) return;
    if (d > best) { best = d; ans = n->val; }
    dfs(n->left, d + 1);
    dfs(n->right, d + 1);
}

int findBottomLeftValue(TreeNode* root) {
    best = -1;
    dfs(root, 0);
    return ans;
}`,
        java: `private int best, ans;

int findBottomLeftValue(TreeNode root) {
    best = -1;
    dfs(root, 0);
    return ans;
}

private void dfs(TreeNode n, int d) {
    if (n == null) return;
    if (d > best) { best = d; ans = n.val; }
    dfs(n.left, d + 1);
    dfs(n.right, d + 1);
}`,
        javascript: `function findBottomLeftValue(root) {
  let best = -1, ans = root.val;
  const dfs = (n, d) => {
    if (!n) return;
    if (d > best) {
      best = d;
      ans = n.val;
    }
    dfs(n.left, d + 1);
    dfs(n.right, d + 1);
  };
  dfs(root, 0);
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['以為答案一定是「左子樹的最深處」:最深那層可能只在右子樹(例:[1,2,3,null,null,4])', 'DFS 用 `>=` 更新:會被同層右邊的節點蓋掉'],
  check: {
    kind: 'fn',
    fn: 'findBottomLeftValue',
    argKinds: ['tree'],
    cases: [
      { args: [[2, 1, 3]], out: 1 },
      { args: [T], out: 7 },
      { args: [[1]], out: 1 },
      { args: [[1, 2, 3, null, null, 4]], out: 4 },
      { args: [[0, null, -1]], out: -1 },
    ],
  },
}
