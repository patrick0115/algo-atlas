import { tree } from './fig'
import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const T = [3, 9, 20, null, null, 15, 7]
const bfsFig: FigStep[] = [
  { note: '佇列先放根 3；這一輪只有它，所以第一層是 [3]。', views: [tree(T, { cls: { 0: 'hl' } }), arr([3], { label: '第 0 層' })] },
  { note: '根的孩子 9、20 進佇列；下一輪正好有兩個節點，第二層是 [9,20]。', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } }), arr([9, 20], { label: '第 1 層' })] },
  { note: '20 的孩子 15、7 在下一輪，第三層是 [15,7]。同一層保持由左至右。', views: [tree(T, { cls: { 5: 'hl', 6: 'hl' } }), arr([15, 7], { label: '第 2 層' })] },
  { note: '收集完後把層的順序倒過來，答案是 [[15,7],[9,20],[3]]。', views: [arr(['15,7', '9,20', '3'], { label: '由下往上', done: [0, 1, 2] })] },
]
const dfsFig: FigStep[] = [
  { note: 'DFS 從根 3、深度 0 出發，把 3 放到第 0 層。', views: [tree(T, { cls: { 0: 'hl' } }), arr([3], { label: '深度 0' })] },
  { note: '先走左孩子 9，深度 1；再回來走右孩子 20，也放入深度 1，所以順序是 [9,20]。', views: [tree(T, { cls: { 1: 'done', 2: 'hl' } }), arr([9, 20], { label: '深度 1' })] },
  { note: '走到 20 的左右孩子，深度 2 得到 [15,7]。', views: [tree(T, { cls: { 5: 'done', 6: 'hl' } }), arr([15, 7], { label: '深度 2' })] },
  { note: '最後反轉層清單，最深的 [15,7] 先回傳。', views: [arr(['15,7', '9,20', '3'], { label: '答案', done: [0, 1, 2] })] },
]

export const q0107: Solution = {
  id: 107,
  plain: '把二元樹每一層的人排成一列，最後從最底層往上列出。',
  statement: '給二元樹根節點，回傳各層節點值。每層由左至右排列，層與層則由下往上排列。',
  examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[15,7],[9,20],[3]]' }, { input: 'root = [1]', output: '[[1]]' }, { input: 'root = []', output: '[]' }],
  constraints: ['節點數可能是 0；空樹回傳空陣列。', '同一層必須保留由左到右的順序。'],
  insight: ['先依 [[p:tree-bfs]] 正常收集每一層，再反轉層的順序即可。', '也能用 [[p:tree-dfs]]，把深度相同的節點放同一組；仍須先左後右。'],
  approaches: [
    {
      name: 'BFS 逐層收集', idea: '佇列每輪處理目前層的固定數量，全部收完後反轉結果。',
      steps: ['根節點入隊。', '每輪先記下佇列長度，只取這麼多節點作為一層。', '按左、右順序加入孩子。', '反轉各層的先後順序。'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: bfsFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點入隊出隊一次；佇列與結果都需儲存節點。' },
      verdict: '最貼近「逐層」題意，推薦。',
      code: {
        python: `from collections import deque

def levelOrderBottom(root):
    if not root:
        return []
    queue = deque([root])
    levels = []
    while queue:
        level = []
        for _ in range(len(queue)):  # 只處理這一層原有的節點
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels[::-1]  # 只反轉層，不反轉層內`,
        c: `int **levelOrderBottom(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    *returnSize = 0;
    int **result = malloc(2001 * sizeof(int *));
    *returnColumnSizes = malloc(2001 * sizeof(int));
    if (root == NULL) {
        return result;
    }
    struct TreeNode **queue = malloc(2001 * sizeof(struct TreeNode *));
    int front = 0;
    int back = 0;
    queue[back++] = root;
    while (front < back) {
        int count = back - front;
        int level = (*returnSize)++;
        result[level] = malloc(count * sizeof(int));
        (*returnColumnSizes)[level] = count;
        for (int i = 0; i < count; i++) {
            struct TreeNode *node = queue[front++];
            result[level][i] = node->val;
            if (node->left != NULL) {
                queue[back++] = node->left;
            }
            if (node->right != NULL) {
                queue[back++] = node->right;
            }
        }
    }
    for (int i = 0, j = *returnSize - 1; i < j; i++, j--) {
        int *row = result[i];
        result[i] = result[j];
        result[j] = row;
        int count = (*returnColumnSizes)[i];
        (*returnColumnSizes)[i] = (*returnColumnSizes)[j];
        (*returnColumnSizes)[j] = count;
    }
    free(queue);
    return result;
}`,
        cpp: `vector<vector<int>> levelOrderBottom(TreeNode* root) {
    vector<vector<int>> result;
    if (!root) {
        return result;
    }
    queue<TreeNode*> nodes;
    nodes.push(root);
    while (!nodes.empty()) {
        int count = nodes.size();
        vector<int> level;
        for (int i = 0; i < count; i++) {
            TreeNode* node = nodes.front();
            nodes.pop();
            level.push_back(node->val);
            if (node->left) {
                nodes.push(node->left);
            }
            if (node->right) {
                nodes.push(node->right);
            }
        }
        result.push_back(level);
    }
    reverse(result.begin(), result.end());
    return result;
}`,
        java: `List<List<Integer>> levelOrderBottom(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) {
        return result;
    }
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int count = queue.size();
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) {
                queue.offer(node.left);
            }
            if (node.right != null) {
                queue.offer(node.right);
            }
        }
        result.add(level);
    }
    Collections.reverse(result);
    return result;
}`,
        javascript: `function levelOrderBottom(root) {
  if (!root) {
    return [];
  }
  const queue = [root];
  const result = [];
  let front = 0;
  while (front < queue.length) {
    const count = queue.length - front;
    const level = [];
    for (let i = 0; i < count; i++) {
      const node = queue[front++];
      level.push(node.val);
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
    result.push(level);
  }
  return result.reverse();
}`,
      },
    },
    {
      name: 'DFS 記錄深度', idea: '遞迴時把節點放入對應深度的清單，最後反轉層清單。',
      steps: ['遞迴帶入深度 d。', '第一次到深度 d 就建立新的一層。', '放入節點值，先走左子樹再走右子樹。', '反轉層的排列。'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: dfsFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點處理一次；結果與最壞遞迴堆疊都可達 n。' },
      verdict: '需要順便利用深度做其他處理時很方便。',
      code: {
        python: `def levelOrderBottom(root):
    levels = []

    def dfs(node, depth):
        if not node:
            return
        if depth == len(levels):
            levels.append([])  # 首次到達這個深度
        levels[depth].append(node.val)
        dfs(node.left, depth + 1)  # 先左後右
        dfs(node.right, depth + 1)

    dfs(root, 0)
    return levels[::-1]`,
        c: `static int **rows107;
static int *sizes107;
static int depths107;

static void collect107(struct TreeNode *node, int depth) {
    if (node == NULL) {
        return;
    }
    if (depth == depths107) {
        rows107[depth] = malloc(2001 * sizeof(int));
        sizes107[depth] = 0;
        depths107++;
    }
    rows107[depth][sizes107[depth]++] = node->val;
    collect107(node->left, depth + 1);
    collect107(node->right, depth + 1);
}

int **levelOrderBottom(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    rows107 = malloc(2001 * sizeof(int *));
    sizes107 = malloc(2001 * sizeof(int));
    depths107 = 0;
    collect107(root, 0);
    for (int i = 0, j = depths107 - 1; i < j; i++, j--) {
        int *row = rows107[i];
        rows107[i] = rows107[j];
        rows107[j] = row;
        int count = sizes107[i];
        sizes107[i] = sizes107[j];
        sizes107[j] = count;
    }
    *returnSize = depths107;
    *returnColumnSizes = sizes107;
    return rows107;
}`,
        cpp: `vector<vector<int>> levelOrderBottom(TreeNode* root) {
    vector<vector<int>> levels;
    function<void(TreeNode*, int)> dfs = [&](TreeNode* node, int depth) {
        if (!node) {
            return;
        }
        if (depth == (int) levels.size()) {
            levels.push_back({});
        }
        levels[depth].push_back(node->val);
        dfs(node->left, depth + 1);
        dfs(node->right, depth + 1);
    };
    dfs(root, 0);
    reverse(levels.begin(), levels.end());
    return levels;
}`,
        java: `void collect(TreeNode node, int depth, List<List<Integer>> levels) {
    if (node == null) {
        return;
    }
    if (depth == levels.size()) {
        levels.add(new ArrayList<>());
    }
    levels.get(depth).add(node.val);
    collect(node.left, depth + 1, levels);
    collect(node.right, depth + 1, levels);
}

List<List<Integer>> levelOrderBottom(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    collect(root, 0, levels);
    Collections.reverse(levels);
    return levels;
}`,
        javascript: `function levelOrderBottom(root) {
  const levels = [];
  function dfs(node, depth) {
    if (!node) {
      return;
    }
    if (depth === levels.length) {
      levels.push([]);
    }
    levels[depth].push(node.val);
    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  }
  dfs(root, 0);
  return levels.reverse();
}`,
      },
    },
  ],
  pitfalls: ['只反轉層的順序，不要反轉每層內的左右順序。', '空樹應回傳空陣列。'],
  check: { kind: 'fn', fn: 'levelOrderBottom', argKinds: ['tree'], cases: [
    { args: [T], out: [[15, 7], [9, 20], [3]] },
    { args: [[1]], out: [[1]] },
    { args: [[]], out: [] },
  ] },
}
