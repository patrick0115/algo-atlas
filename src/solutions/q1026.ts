import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]

const bruteFig: FigStep[] = [
  { note: '從祖先 8 出發，逐一看子孫。走到 1 時差距是 |8−1|=7。', views: [tree(T, { cls: { 0: 'hl', 3: 'hl' } })] },
  { note: '改以祖先 3 出發，它與子孫 1 的差距是 2，與 7 的差距是 4，都沒超過 7。', views: [tree(T, { cls: { 1: 'hl', 3: 'hl', 10: 'hl' } })] },
  { note: '祖先 14 與子孫 13 差 1。每個祖先都必須再走一次自己的子樹。', views: [tree(T, { cls: { 6: 'hl', 11: 'hl' } })] },
  { note: '掃完所有祖先，最大差距是 7。', views: [tree(T, { cls: { 0: 'hl', 3: 'hl' } })] },
]

const pathFig: FigStep[] = [
  { note: '從根 8 開始，路徑最小值與最大值都先設為 8。', views: [tree(T, { cls: { 0: 'hl' }, subs: { 0: '8..8' } })] },
  { note: '走到 3，再走到 1；路徑範圍變成 1..8，差距 7。這對應祖先 8 與子孫 1。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'hl' }, subs: { 3: '1..8' } })] },
  { note: '另一條路 8→3→6→7 的範圍是 3..8，差距只有 5。各條路只需帶著目前的極值往下。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 4: 'done', 10: 'hl' }, subs: { 10: '3..8' } })] },
  { note: '右邊走到 13 的範圍是 8..14，差距 6；最大仍為 7。', views: [tree(T, { cls: { 0: 'done', 2: 'done', 6: 'done', 11: 'hl' }, subs: { 11: '8..14' } })] },
]

export const q1026: Solution = {
  id: 1026,
  plain: '在樹上找一對「上面的祖先」與「下面的子孫」，讓兩個值差得最多。',
  statement: '給一棵二元樹。選一個祖先節點和它的子孫節點，回傳兩個值的絕對差最大值。',
  examples: [
    { input: 'root = [8,3,10,1,6,null,14,null,null,4,7,13]', output: '7', note: '祖先 8 與子孫 1。' },
    { input: 'root = [1,null,2,null,0,3]', output: '3' },
  ],
  constraints: ['節點數至少 2；節點值為非負整數。', '樹可能很歪，遞迴深度最壞是節點數。'],
  insight: ['暴力法對每個祖先掃自己的全部子孫，會重複走訪。', '從根走到目前節點的路徑上，差距最大的祖先只可能是路徑最小值或最大值。', '因此沿 [[p:tree-dfs]] 往下傳兩個極值即可。'],
  approaches: [
    {
      name: '每個祖先掃子樹',
      idea: '固定祖先，再遍歷其下所有子孫，更新最大絕對差。',
      steps: ['走訪每個節點作為祖先。', '遍歷該祖先的整棵子樹，計算差距。', '保留所有差距的最大值。'],
      figure: { title: 'root = [8,3,10,1,6,null,14,null,null,4,7,13]', steps: bruteFig },
      complexity: { time: 'O(n²)', space: 'O(h)', why: '歪斜的樹裡，各祖先子樹長度加總為 1+2+…+n。' },
      verdict: '概念容易驗證，但重複掃子樹。',
      code: {
        python: `def maxAncestorDiff(root):
    answer = 0

    def scan(ancestor, node):
        nonlocal answer
        if not node:
            return
        answer = max(answer, abs(ancestor - node.val))  # 固定祖先，檢查一位子孫
        scan(ancestor, node.left)
        scan(ancestor, node.right)

    def visit(node):
        if not node:
            return
        scan(node.val, node.left)
        scan(node.val, node.right)
        visit(node.left)
        visit(node.right)

    visit(root)
    return answer`,
        c: `static void scanDesc(struct TreeNode *node, int ancestor, int *answer) {
    if (node == NULL) {
        return;
    }
    int diff = abs(ancestor - node->val);
    if (diff > *answer) {
        *answer = diff;
    }
    scanDesc(node->left, ancestor, answer);
    scanDesc(node->right, ancestor, answer);
}

static void visitAncestor(struct TreeNode *node, int *answer) {
    if (node == NULL) {
        return;
    }
    scanDesc(node->left, node->val, answer);
    scanDesc(node->right, node->val, answer);
    visitAncestor(node->left, answer);
    visitAncestor(node->right, answer);
}

int maxAncestorDiff(struct TreeNode *root) {
    int answer = 0;
    visitAncestor(root, &answer);
    return answer;
}`,
        cpp: `int maxAncestorDiff(TreeNode* root) {
    int answer = 0;
    function<void(TreeNode*, int)> scan = [&](TreeNode* node, int ancestor) {
        if (!node) {
            return;
        }
        answer = max(answer, abs(ancestor - node->val));
        scan(node->left, ancestor);
        scan(node->right, ancestor);
    };
    function<void(TreeNode*)> visit = [&](TreeNode* node) {
        if (!node) {
            return;
        }
        scan(node->left, node->val);
        scan(node->right, node->val);
        visit(node->left);
        visit(node->right);
    };
    visit(root);
    return answer;
}`,
        java: `int answer = 0;

void scanDesc(TreeNode node, int ancestor) {
    if (node == null) {
        return;
    }
    answer = Math.max(answer, Math.abs(ancestor - node.val));
    scanDesc(node.left, ancestor);
    scanDesc(node.right, ancestor);
}

void visitAncestor(TreeNode node) {
    if (node == null) {
        return;
    }
    scanDesc(node.left, node.val);
    scanDesc(node.right, node.val);
    visitAncestor(node.left);
    visitAncestor(node.right);
}

int maxAncestorDiff(TreeNode root) {
    answer = 0;
    visitAncestor(root);
    return answer;
}`,
        javascript: `function maxAncestorDiff(root) {
  let answer = 0;
  function scan(node, ancestor) {
    if (!node) {
      return;
    }
    answer = Math.max(answer, Math.abs(ancestor - node.val));
    scan(node.left, ancestor);
    scan(node.right, ancestor);
  }
  function visit(node) {
    if (!node) {
      return;
    }
    scan(node.left, node.val);
    scan(node.right, node.val);
    visit(node.left);
    visit(node.right);
  }
  visit(root);
  return answer;
}`,
      },
    },
    {
      name: '沿路帶最小與最大值',
      idea: '從根到節點的路徑上，只需記住最小與最大值；兩者差距就是這條路徑的最大候選。',
      steps: ['根節點的 lo、hi 都是根值。', '走到子節點時更新 lo、hi。', '每個節點用 hi−lo 更新答案。'],
      figure: { title: 'root = [8,3,10,1,6,null,14,null,null,4,7,13]', steps: pathFig },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點走一次；遞迴堆疊深度為樹高。' },
      verdict: '推薦解法。最小、最大值都來自目前節點的祖先路徑。',
      code: {
        python: `def maxAncestorDiff(root):
    def dfs(node, low, high):
        if not node:
            return high - low  # 這條路徑的最大差距
        low = min(low, node.val)
        high = max(high, node.val)  # 把目前節點納入路徑極值
        return max(dfs(node.left, low, high), dfs(node.right, low, high))

    if not root:
        return 0
    return dfs(root, root.val, root.val)`,
        c: `static int pathDiff(struct TreeNode *node, int low, int high) {
    if (node == NULL) {
        return high - low;
    }
    if (node->val < low) {
        low = node->val;
    }
    if (node->val > high) {
        high = node->val;
    }
    int left = pathDiff(node->left, low, high);
    int right = pathDiff(node->right, low, high);
    return left > right ? left : right;
}

int maxAncestorDiff(struct TreeNode *root) {
    if (root == NULL) {
        return 0;
    }
    return pathDiff(root, root->val, root->val);
}`,
        cpp: `int maxAncestorDiff(TreeNode* root) {
    if (!root) {
        return 0;
    }
    function<int(TreeNode*, int, int)> dfs = [&](TreeNode* node, int low, int high) {
        if (!node) {
            return high - low;
        }
        low = min(low, node->val);
        high = max(high, node->val);
        return max(dfs(node->left, low, high), dfs(node->right, low, high));
    };
    return dfs(root, root->val, root->val);
}`,
        java: `int pathDiff(TreeNode node, int low, int high) {
    if (node == null) {
        return high - low;
    }
    low = Math.min(low, node.val);
    high = Math.max(high, node.val);
    return Math.max(pathDiff(node.left, low, high), pathDiff(node.right, low, high));
}

int maxAncestorDiff(TreeNode root) {
    if (root == null) {
        return 0;
    }
    return pathDiff(root, root.val, root.val);
}`,
        javascript: `function maxAncestorDiff(root) {
  if (!root) {
    return 0;
  }
  function dfs(node, low, high) {
    if (!node) {
      return high - low;
    }
    low = Math.min(low, node.val);
    high = Math.max(high, node.val);
    return Math.max(dfs(node.left, low, high), dfs(node.right, low, high));
  }
  return dfs(root, root.val, root.val);
}`,
      },
    },
  ],
  pitfalls: ['只能選同一條祖先到子孫的路徑；不同分支的極值不能直接相減。', '比較的是節點值差距，不是路徑長度。'],
  check: { kind: 'fn', fn: 'maxAncestorDiff', argKinds: ['tree'], cases: [
    { args: [T], out: 7 },
    { args: [[1, null, 2, null, 0, 3]], out: 3 },
    { args: [[5, 5]], out: 0 },
  ] },
}
