import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

const T = [3, 9, 20, null, null, 15, 7]

export const q0111: Solution = {
  id: 111,
  plain: '找從樹根走到最近一片葉子要經過幾個節點。',
  statement: '給二元樹 root，回傳最小深度。深度按節點數計；空樹為 0，葉子為 1。',
  examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '2' }, { input: 'root = [2,null,3,null,4]', output: '3' }],
  constraints: ['節點數最多 10⁵；單邊孩子的節點不是葉子。'],
  insight: ['最小深度只在葉子處成立。', '遞迴可以比較左右子樹；遇到單邊孩子時不能把空邊的 0 當成最短路徑。', '逐層走的 [[p:tree-bfs]] 遇到第一片葉子即可停止。'],
  approaches: [
    {
      name: '遞迴計算深度',
      idea: '有兩個孩子時取較小深度；只有一個孩子時必須沿著它走。',
      steps: ['空樹回傳 0', '葉子回傳 1', '只有單邊孩子就走非空邊', '兩邊都有孩子時回傳 `1 + min(左,右)`'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: [
        { note: '根 3 不是葉子，必須看左右孩子。', views: [tree(T, { cls: { 0: 'hl' } })] },
        { note: '左孩子 9 沒有孩子，是葉子，深度為 1。', views: [tree(T, { cls: { 1: 'hl' }, subs: { 1: 1 } })] },
        { note: '右孩子 20 的兩個孩子 15、7 都是葉子，所以 20 的深度是 2。', views: [tree(T, { cls: { 2: 'hl' }, subs: { 5: 1, 6: 1, 2: 2 } })] },
        { note: '根選較短的左邊：1 + min(1,2) = 2。', views: [tree(T, { cls: { 0: 'done', 1: 'done' }, subs: { 0: 2 } }), arr([2], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '最壞走遍整棵樹，遞迴深度為樹高。' },
      verdict: '寫法簡單，但單邊孩子要特別處理。',
      code: {
        python: `def minDepth(root):
    if not root:
        return 0
    if not root.left:
        return 1 + minDepth(root.right)  # 空的左邊不能當捷徑
    if not root.right:
        return 1 + minDepth(root.left)
    return 1 + min(minDepth(root.left), minDepth(root.right))`,
        c: `int minDepth(struct TreeNode *root) {
    if (!root) return 0;
    if (!root->left) return 1 + minDepth(root->right);
    if (!root->right) return 1 + minDepth(root->left);
    int left = minDepth(root->left);
    int right = minDepth(root->right);
    return 1 + (left < right ? left : right);
}`,
        cpp: `int minDepth(TreeNode* root) {
    if (!root) return 0;
    if (!root->left) return 1 + minDepth(root->right);
    if (!root->right) return 1 + minDepth(root->left);
    return 1 + min(minDepth(root->left), minDepth(root->right));
}`,
        java: `int minDepth(TreeNode root) {
    if (root == null) return 0;
    if (root.left == null) return 1 + minDepth(root.right);
    if (root.right == null) return 1 + minDepth(root.left);
    return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}`,
        javascript: `function minDepth(root) {
  if (!root) return 0;
  if (!root.left) return 1 + minDepth(root.right);
  if (!root.right) return 1 + minDepth(root.left);
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}`,
      },
    },
    {
      name: '廣度優先，找到第一片葉子',
      idea: '逐層探索；第一個葉子必然是距離根最近的。',
      steps: ['根以深度 1 入列', '每次取出節點與深度', '遇葉子直接回傳，否則把非空孩子以深度加 1 入列'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: [
        { note: '佇列先放根 3，深度 1。', views: [tree(T, { cls: { 0: 'hl' } }), arr(['3:1'], { label: '佇列' })] },
        { note: '3 不是葉子，把 9、20 以深度 2 入列。', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } }), arr(['9:2', '20:2'], { label: '佇列' })] },
        { note: '先取出 9；它沒有孩子，是第一片遇到的葉子。', views: [tree(T, { cls: { 1: 'done' } }), arr(['9:2'], { label: '第一片葉子', done: [0] })] },
        { note: '回傳它的深度 2，較深的 15、7 無需探索。', views: [tree(T, { cls: { 5: 'dim', 6: 'dim' } }), arr([2], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(w)', why: '最壞每個節點入列一次，w 是最大一層的寬度。' },
      verdict: '通常能提早停止，尤其最近葉子很淺時。',
      code: {
        python: `from collections import deque

def minDepth(root):
    if not root:
        return 0
    q = deque([(root, 1)])
    while q:
        node, depth = q.popleft()
        if not node.left and not node.right:
            return depth  # 第一片葉子就是最近的
        if node.left:
            q.append((node.left, depth + 1))
        if node.right:
            q.append((node.right, depth + 1))`,
        c: `int minDepth(struct TreeNode *root) {
    if (!root) return 0;
    struct TreeNode **q = malloc(100001 * sizeof(struct TreeNode *));
    int *depth = malloc(100001 * sizeof(int));
    int head = 0, tail = 0, ans = 0;
    q[tail] = root;
    depth[tail++] = 1;
    while (head < tail) {
        struct TreeNode *node = q[head];
        int d = depth[head++];
        if (!node->left && !node->right) {
            ans = d;
            break;
        }
        if (node->left) {
            q[tail] = node->left;
            depth[tail++] = d + 1;
        }
        if (node->right) {
            q[tail] = node->right;
            depth[tail++] = d + 1;
        }
    }
    free(q);
    free(depth);
    return ans;
}`,
        cpp: `int minDepth(TreeNode* root) {
    if (!root) return 0;
    queue<pair<TreeNode*, int>> q;
    q.push({root, 1});
    while (!q.empty()) {
        auto [node, depth] = q.front();
        q.pop();
        if (!node->left && !node->right) return depth;
        if (node->left) q.push({node->left, depth + 1});
        if (node->right) q.push({node->right, depth + 1});
    }
    return 0;
}`,
        java: `int minDepth(TreeNode root) {
    if (root == null) return 0;
    Queue<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    int depth = 1;
    while (!q.isEmpty()) {
        int size = q.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = q.poll();
            if (node.left == null && node.right == null) return depth;
            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        depth++;
    }
    return 0;
}`,
        javascript: `function minDepth(root) {
  if (!root) return 0;
  const q = [[root, 1]];
  for (let head = 0; head < q.length; head++) {
    const [node, depth] = q[head];
    if (!node.left && !node.right) return depth;
    if (node.left) q.push([node.left, depth + 1]);
    if (node.right) q.push([node.right, depth + 1]);
  }
}`,
      },
    },
  ],
  pitfalls: ['`1 + min(左深度,右深度)` 在只有一邊孩子時會錯選空邊的 0。'],
  check: { kind: 'fn', fn: 'minDepth', argKinds: ['tree'], cases: [
    { args: [T], out: 2 },
    { args: [[2, null, 3, null, 4]], out: 3 },
    { args: [[]], out: 0 },
  ] },
}
