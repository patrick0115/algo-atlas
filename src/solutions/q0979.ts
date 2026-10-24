import { tree } from './fig'
import type { Solution } from './types'

// 979. Distribute Coins in Binary Tree
const T = [0, 3, 0]

export const q0979: Solution = {
  id: 979,
  plain: '樹上的硬幣只能沿父子之間搬運。讓每個節點剛好有一枚硬幣，求最少需要搬幾次。',
  statement: '二元樹總共有 n 個節點與 n 枚硬幣。每次操作可沿一條父子邊搬一枚硬幣。求每個節點恰好持有一枚硬幣的最少操作次數。',
  examples: [
    { input: 'root = [3,0,0]', output: '2' },
    { input: 'root = [0,3,0]', output: '3' },
    { input: 'root = [1,0,2]', output: '2' },
  ],
  constraints: ['節點數 n 介於 1 到 100；總硬幣數恰好也是 n。'],
  insight: ['任一子樹若有 s 個節點、c 枚硬幣，就必須跨過它與父節點的邊搬運 |c−s| 次。', '後序遍歷可讓每個子樹把「多出或缺少幾枚」往父節點回報。'],
  approaches: [
    {
      name: '對每條邊重算子樹盈虧',
      idea: '每條父子邊的必要搬運數，就是孩子整棵子樹的硬幣數減節點數的絕對值。',
      steps: ['對每個非根節點，重新遍歷它的子樹。', '算出硬幣總數減節點數的差額。', '把每個差額的絕對值相加。'],
      figure: { title: 'root = [0,3,0]', steps: [
        { note: '左子樹只有節點 3，自己要留 1 枚，多出 2 枚。', views: [tree(T, { cls: { 1: 'hl' }, subs: { 1: '+2' } })] },
        { note: '跨左邊的邊必須搬 2 次，這兩枚會進到根。', views: [tree(T, { cls: { 1: 'done', 0: 'hl' }, edgeCls: { 1: 'hl' } })] },
        { note: '右子樹只有節點 0，缺少 1 枚；跨右邊的邊必須再搬 1 次。', views: [tree(T, { cls: { 2: 'hl' }, subs: { 2: '−1' }, edgeCls: { 2: 'hl' } })] },
        { note: '兩條邊各需 2、1 次，最少操作總數 3。', views: [tree(T, { subs: { 1: '+2', 2: '−1' }, edgeCls: { 1: 'done', 2: 'done' } })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(h)', why: '每個節點都重新計算子樹，歪斜樹會反覆掃描同一批節點。' },
      verdict: '公式清楚，但重算很多次。',
      code: {
        python: `def distributeCoins(root):
    def balance(node):
        if not node:
            return 0
        return node.val - 1 + balance(node.left) + balance(node.right)

    def visit(node):
        if not node:
            return 0
        left = abs(balance(node.left)) if node.left else 0
        right = abs(balance(node.right)) if node.right else 0
        return left + right + visit(node.left) + visit(node.right)  # 每條邊算一次

    return visit(root)`,
        c: `static int balance(struct TreeNode *node) {
    if (!node) {
        return 0;
    }
    return node->val - 1 + balance(node->left) + balance(node->right);
}

int distributeCoins(struct TreeNode *root) {
    if (!root) {
        return 0;
    }
    int left = root->left ? abs(balance(root->left)) : 0;
    int right = root->right ? abs(balance(root->right)) : 0;
    return left + right + distributeCoins(root->left) + distributeCoins(root->right);
}`,
        cpp: `int balance(TreeNode* node) {
    if (!node) {
        return 0;
    }
    return node->val - 1 + balance(node->left) + balance(node->right);
}

int distributeCoins(TreeNode* root) {
    if (!root) {
        return 0;
    }
    int left = root->left ? abs(balance(root->left)) : 0;
    int right = root->right ? abs(balance(root->right)) : 0;
    return left + right + distributeCoins(root->left) + distributeCoins(root->right);
}`,
        java: `int distributeCoins(TreeNode root) {
    if (root == null) {
        return 0;
    }
    int left = root.left == null ? 0 : Math.abs(balance(root.left));
    int right = root.right == null ? 0 : Math.abs(balance(root.right));
    return left + right + distributeCoins(root.left) + distributeCoins(root.right);
}

private int balance(TreeNode node) {
    if (node == null) {
        return 0;
    }
    return node.val - 1 + balance(node.left) + balance(node.right);
}`,
        javascript: `function distributeCoins(root) {
  function balance(node) {
    if (!node) {
      return 0;
    }
    return node.val - 1 + balance(node.left) + balance(node.right);
  }
  if (!root) {
    return 0;
  }
  const left = root.left ? Math.abs(balance(root.left)) : 0;
  const right = root.right ? Math.abs(balance(root.right)) : 0;
  return left + right + distributeCoins(root.left) + distributeCoins(root.right);
}`,
      },
    },
    {
      name: '一次後序遍歷回報盈虧',
      idea: '孩子回傳正數表示多幣、負數表示缺幣；把兩邊跨邊的搬運數直接累加。',
      steps: ['空節點回傳 0。', '先取得左右孩子的盈虧 left、right。', '答案增加 |left| + |right|。', '目前節點回傳 node.val−1+left+right。'],
      figure: { title: 'root = [0,3,0]', steps: [
        { note: '先往下到左葉 3：自己留 1 枚，可往上送 2 枚，回傳 +2。', views: [tree(T, { cls: { 1: 'hl' }, subs: { 1: '+2' } })] },
        { note: '右葉 0 缺 1 枚，回傳 −1；它要從根拿一枚。', views: [tree(T, { cls: { 1: 'done', 2: 'hl' }, subs: { 1: '+2', 2: '−1' } })] },
        { note: '根把兩條邊的搬運量 |+2|+|−1| = 3 加入答案。', views: [tree(T, { cls: { 0: 'hl' }, subs: { 1: '+2', 2: '−1' }, edgeCls: { 1: 'hl', 2: 'hl' } })] },
        { note: '根自身是 0 枚，收到左邊 2、送右邊 1 後剛好剩 1；總盈虧為 0。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 2: 'done' }, subs: { 0: '0', 1: '+2', 2: '−1' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點只計算一次；遞迴深度為樹高。' },
      verdict: '標準解，和 [543](#/q/543) 一樣在後序遍歷時同時回傳局部資訊與更新答案。',
      code: {
        python: `def distributeCoins(root):
    moves = 0

    def dfs(node):
        nonlocal moves
        if not node:
            return 0
        left = dfs(node.left)
        right = dfs(node.right)
        moves += abs(left) + abs(right)  # 每條孩子邊都得搬這麼多枚
        return node.val - 1 + left + right

    dfs(root)
    return moves`,
        c: `static int dfs(struct TreeNode *node, int *moves) {
    if (!node) {
        return 0;
    }
    int left = dfs(node->left, moves);
    int right = dfs(node->right, moves);
    *moves += abs(left) + abs(right);
    return node->val - 1 + left + right;
}

int distributeCoins(struct TreeNode *root) {
    int moves = 0;
    dfs(root, &moves);
    return moves;
}`,
        cpp: `int distributeCoins(TreeNode* root) {
    int moves = 0;
    auto dfs = [&](auto&& self, TreeNode* node) -> int {
        if (!node) {
            return 0;
        }
        int left = self(self, node->left);
        int right = self(self, node->right);
        moves += abs(left) + abs(right);
        return node->val - 1 + left + right;
    };
    dfs(dfs, root);
    return moves;
}`,
        java: `int distributeCoins(TreeNode root) {
    int[] moves = new int[1];
    dfs(root, moves);
    return moves[0];
}

private int dfs(TreeNode node, int[] moves) {
    if (node == null) {
        return 0;
    }
    int left = dfs(node.left, moves);
    int right = dfs(node.right, moves);
    moves[0] += Math.abs(left) + Math.abs(right);
    return node.val - 1 + left + right;
}`,
        javascript: `function distributeCoins(root) {
  let moves = 0;
  function dfs(node) {
    if (!node) {
      return 0;
    }
    const left = dfs(node.left);
    const right = dfs(node.right);
    moves += Math.abs(left) + Math.abs(right);
    return node.val - 1 + left + right;
  }
  dfs(root);
  return moves;
}`,
      },
    },
  ],
  pitfalls: ['盈虧可以是負數；答案累加的是跨邊搬運次數，所以必須取絕對值。', '總硬幣數等於節點數，根最後的盈虧必為 0；不需要把根的回傳值再加入答案。'],
  check: { kind: 'fn', fn: 'distributeCoins', argKinds: ['tree'], cases: [
    { args: [[3, 0, 0]], out: 2 },
    { args: [T], out: 3 },
    { args: [[1, 0, 2]], out: 2 },
    { args: [[1]], out: 0 },
  ] },
}
