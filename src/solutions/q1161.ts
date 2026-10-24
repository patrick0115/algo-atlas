import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

const T = [1, 7, 0, 7, -8, null, null]

export const q1161: Solution = {
  id: 1161,
  plain: '把樹每一層的節點值加起來，找總和最大的層；若平手，選較靠近根的層。',
  statement: '給非空二元樹 root，根為第 1 層。回傳節點值總和最大的最小層號。',
  examples: [{ input: 'root = [1,7,0,7,-8,null,null]', output: '2' }, { input: 'root = [989,null,10250,98693,-89388,null,null]', output: '2' }],
  constraints: ['節點數最多 10⁴，節點值可為負。'],
  insight: ['逐層 [[p:tree-bfs]] 能直接算每一層的和。', '也可以深度優先走訪，將同深度節點加到同一格。'],
  approaches: [
    {
      name: '廣度優先逐層加總',
      idea: '每輪固定處理目前佇列中的一整層，計算層和。',
      steps: ['根入列，level = 1', '記下本層佇列大小，只取出這麼多節點', '把節點值相加並加入孩子', '若層和嚴格大於最佳值，更新答案'],
      figure: { title: 'root = [1,7,0,7,-8,null,null]', steps: [
        { note: '第 1 層只有根 1，層和為 1。', views: [tree(T, { cls: { 0: 'hl' } }), arr([1], { label: '目前最佳層和' })] },
        { note: '第 2 層為 7 和 0，層和 7，大於 1。', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } }), arr([7], { label: '目前最佳層和' })] },
        { note: '第 3 層為 7 和 −8，層和 −1，沒有超過 7。', views: [tree(T, { cls: { 3: 'hl', 4: 'hl' } }), arr([-1, 7], { label: '本層 / 最佳' })] },
        { note: '最大層和在第 2 層，回傳 2。', views: [arr([2], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每個節點入列一次，佇列最多保留一層。' },
      verdict: '題目按層比較，層序搜尋最自然。',
      code: {
        python: `from collections import deque

def maxLevelSum(root):
    queue = deque([root])
    best_sum = float('-inf')
    best_level = 1
    level = 1
    while queue:
        total = 0
        for _ in range(len(queue)):
            node = queue.popleft()
            total += node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        if total > best_sum:  # 平手保留較早的層
            best_sum = total
            best_level = level
        level += 1
    return best_level`,
        c: `int maxLevelSum(struct TreeNode *root) {
    struct TreeNode **queue = malloc(10001 * sizeof(struct TreeNode *));
    int front = 0;
    int back = 0;
    int level = 1;
    int bestLevel = 1;
    int bestSum = INT_MIN;
    queue[back++] = root;
    while (front < back) {
        int end = back;
        int total = 0;
        while (front < end) {
            struct TreeNode *node = queue[front++];
            total += node->val;
            if (node->left) {
                queue[back++] = node->left;
            }
            if (node->right) {
                queue[back++] = node->right;
            }
        }
        if (total > bestSum) {
            bestSum = total;
            bestLevel = level;
        }
        level++;
    }
    free(queue);
    return bestLevel;
}`,
        cpp: `int maxLevelSum(TreeNode* root) {
    queue<TreeNode*> pending;
    pending.push(root);
    int level = 1;
    int bestLevel = 1;
    int bestSum = INT_MIN;
    while (!pending.empty()) {
        int count = pending.size();
        int total = 0;
        for (int i = 0; i < count; i++) {
            TreeNode* node = pending.front();
            pending.pop();
            total += node->val;
            if (node->left) {
                pending.push(node->left);
            }
            if (node->right) {
                pending.push(node->right);
            }
        }
        if (total > bestSum) {
            bestSum = total;
            bestLevel = level;
        }
        level++;
    }
    return bestLevel;
}`,
        java: `int maxLevelSum(TreeNode root) {
    Queue<TreeNode> pending = new ArrayDeque<>();
    pending.add(root);
    int level = 1;
    int bestLevel = 1;
    int bestSum = Integer.MIN_VALUE;
    while (!pending.isEmpty()) {
        int count = pending.size();
        int total = 0;
        for (int i = 0; i < count; i++) {
            TreeNode node = pending.remove();
            total += node.val;
            if (node.left != null) {
                pending.add(node.left);
            }
            if (node.right != null) {
                pending.add(node.right);
            }
        }
        if (total > bestSum) {
            bestSum = total;
            bestLevel = level;
        }
        level++;
    }
    return bestLevel;
}`,
        javascript: `function maxLevelSum(root) {
  const queue = [root];
  let front = 0;
  let level = 1;
  let bestLevel = 1;
  let bestSum = -Infinity;
  while (front < queue.length) {
    const end = queue.length;
    let total = 0;
    while (front < end) {
      const node = queue[front++];
      total += node.val;
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
    if (total > bestSum) {
      bestSum = total;
      bestLevel = level;
    }
    level++;
  }
  return bestLevel;
}`,
      },
    },
    {
      name: '深度優先累加各層',
      idea: '遞迴時帶著層號，把每個節點加到對應的層和。',
      steps: ['準備動態增長的 sums 陣列', '走到節點時，若該層首次出現就新增 0', '將節點值加到 sums[level−1]，再走左右子樹', '從前往後找最大值的最小索引'],
      figure: { title: 'root = [1,7,0,7,-8,null,null]', steps: [
        { note: '拜訪根 1，層和暫為 [1]。', views: [tree(T, { cls: { 0: 'hl' } }), arr([1], { label: '層和' })] },
        { note: '沿左側走到 7、7，層和變 [1,7,7]。', views: [tree(T, { cls: { 1: 'hl', 3: 'hl' } }), arr([1, 7, 7], { label: '層和' })] },
        { note: '拜訪 −8 與右子樹的 0，層和變 [1,7,−1]。', views: [tree(T, { cls: { 4: 'hl', 2: 'hl' } }), arr([1, 7, -1], { label: '層和' })] },
        { note: '最大值 7 位於第二格，因此層號是 2。', views: [arr([1, 7, -1], { label: '完成的層和', done: [1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h + L)', why: '遞迴堆疊最多樹高 h，還要存 L 個層和。' },
      verdict: '當已有 DFS 框架時容易加入。',
      code: {
        python: `def maxLevelSum(root):
    sums = []

    def dfs(node, level):
        if not node:
            return
        if level == len(sums):
            sums.append(0)
        sums[level] += node.val  # 同一深度累加到同一格
        dfs(node.left, level + 1)
        dfs(node.right, level + 1)

    dfs(root, 0)
    return sums.index(max(sums)) + 1`,
        c: `static void dfs1161(struct TreeNode *node, int level, int *sums, int *levels) {
    if (!node) {
        return;
    }
    if (level >= *levels) {
        sums[level] = 0;
        *levels = level + 1;
    }
    sums[level] += node->val;
    dfs1161(node->left, level + 1, sums, levels);
    dfs1161(node->right, level + 1, sums, levels);
}

int maxLevelSum(struct TreeNode *root) {
    int *sums = calloc(10001, sizeof(int));
    int levels = 0;
    dfs1161(root, 0, sums, &levels);
    int best = 0;
    for (int i = 1; i < levels; i++) {
        if (sums[i] > sums[best]) {
            best = i;
        }
    }
    free(sums);
    return best + 1;
}`,
        cpp: `int maxLevelSum(TreeNode* root) {
    vector<int> sums;
    function<void(TreeNode*, int)> dfs = [&](TreeNode* node, int level) {
        if (!node) {
            return;
        }
        if (level == (int)sums.size()) {
            sums.push_back(0);
        }
        sums[level] += node->val;
        dfs(node->left, level + 1);
        dfs(node->right, level + 1);
    };
    dfs(root, 0);
    return max_element(sums.begin(), sums.end()) - sums.begin() + 1;
}`,
        java: `int maxLevelSum(TreeNode root) {
    List<Integer> sums = new ArrayList<>();
    dfs1161(root, 0, sums);
    int best = 0;
    for (int i = 1; i < sums.size(); i++) {
        if (sums.get(i) > sums.get(best)) {
            best = i;
        }
    }
    return best + 1;
}

void dfs1161(TreeNode node, int level, List<Integer> sums) {
    if (node == null) {
        return;
    }
    if (level == sums.size()) {
        sums.add(0);
    }
    sums.set(level, sums.get(level) + node.val);
    dfs1161(node.left, level + 1, sums);
    dfs1161(node.right, level + 1, sums);
}`,
        javascript: `function maxLevelSum(root) {
  const sums = [];
  function dfs(node, level) {
    if (!node) {
      return;
    }
    if (level === sums.length) {
      sums.push(0);
    }
    sums[level] += node.val;
    dfs(node.left, level + 1);
    dfs(node.right, level + 1);
  }
  dfs(root, 0);
  let best = 0;
  for (let i = 1; i < sums.length; i++) {
    if (sums[i] > sums[best]) {
      best = i;
    }
  }
  return best + 1;
}`,
      },
    },
  ],
  pitfalls: ['節點值可為負，最佳層和要從負無限大開始。', '平手要較小層號，所以只有嚴格變大才更新。'],
  check: { kind: 'fn', fn: 'maxLevelSum', argKinds: ['tree'], cases: [
    { args: [T], out: 2 },
    { args: [[-100, -200, -300]], out: 1 },
    { args: [[1, 1, null, 0, 1]], out: 1 },
  ] },
}
