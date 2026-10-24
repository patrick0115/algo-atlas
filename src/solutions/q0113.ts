import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]

function dfsFig(): FigStep[] {
  return [
    { note: '從根 5 出發，目標還差 22−5=17；沿左子樹到 4，再到 11，路徑目前 [5,4,11]。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'hl' } })] },
    { note: '先走到葉子 7：總和 5+4+11+7=27，不等於 22；回溯移除 7，改走葉子 2。', views: [tree(T, { cls: { 7: 'dim', 8: 'hl' } })] },
    { note: '5+4+11+2=22，複製路徑 [5,4,11,2] 存入答案，再回溯。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'done', 8: 'done' } })] },
    { note: '右邊找到另一條 [5,8,4,5]，也是 22；葉子 1 則不符合。', views: [tree(T, { cls: { 0: 'done', 2: 'done', 6: 'done', 11: 'done', 12: 'dim' } })] },
  ]
}

function bfsFig(): FigStep[] {
  return [
    { note: '佇列從根 5 開始；每個狀態記目前節點、累計和、父狀態位置。', views: [tree(T, { cls: { 0: 'hl' } })] },
    { note: '取出 5，放入左邊 4（和 9）與右邊 8（和 13）；接著按層往下展開。', views: [tree(T, { cls: { 0: 'done', 1: 'hl', 2: 'hl' } })] },
    { note: '到葉子 2 時累計和為 22，沿父狀態往回找得到 2←11←4←5，再反轉成一條完整路徑。', views: [tree(T, { cls: { 0: 'done', 1: 'done', 3: 'done', 8: 'hl' } })] },
    { note: '到右側葉子 5 時也得到 22，回溯父狀態組成 [5,8,4,5]；其他葉子不加入。', views: [tree(T, { cls: { 0: 'done', 2: 'done', 6: 'done', 11: 'hl' } })] },
  ]
}

const CHECK = {
  python: `

def pathSumCheck(root, targetSum):
    mod = 1_000_000_007
    paths = pathSum(root, targetSum)
    total = len(paths) * 7919
    for path in paths:
        value = 1
        for x in path:
            value = (value * 1009 + x + 1000) % mod
        total = (total + value) % mod
    return total`,
  c: `

int pathSumCheck(struct TreeNode *root, int targetSum) {
    int count = 0;
    int *sizes = NULL;
    int **paths = pathSum(root, targetSum, &count, &sizes);
    const long long mod = 1000000007;
    long long total = (long long)count * 7919 % mod;
    for (int i = 0; i < count; i++) {
        long long value = 1;
        for (int j = 0; j < sizes[i]; j++) {
            value = (value * 1009 + paths[i][j] + 1000) % mod;
        }
        total = (total + value) % mod;
        free(paths[i]);
    }
    free(paths);
    free(sizes);
    return (int)total;
}`,
  cpp: `

int pathSumCheck(TreeNode* root, int targetSum) {
    const long long mod = 1000000007;
    auto paths = pathSum(root, targetSum);
    long long total = (long long)paths.size() * 7919 % mod;
    for (const auto& path : paths) {
        long long value = 1;
        for (int x : path) {
            value = (value * 1009 + x + 1000) % mod;
        }
        total = (total + value) % mod;
    }
    return (int)total;
}`,
  java: `

int pathSumCheck(TreeNode root, int targetSum) {
    final long mod = 1000000007;
    List<List<Integer>> paths = pathSum(root, targetSum);
    long total = (long)paths.size() * 7919 % mod;
    for (List<Integer> path : paths) {
        long value = 1;
        for (int x : path) {
            value = (value * 1009 + x + 1000) % mod;
        }
        total = (total + value) % mod;
    }
    return (int)total;
}`,
  javascript: `

function pathSumCheck(root, targetSum) {
  const mod = 1000000007;
  const paths = pathSum(root, targetSum);
  let total = paths.length * 7919 % mod;
  for (const path of paths) {
    let value = 1;
    for (const x of path) {
      value = (value * 1009 + x + 1000) % mod;
    }
    total = (total + value) % mod;
  }
  return total;
}`,
}

export const q0113: Solution = {
  id: 113,
  plain: '在二元樹裡找所有「從根一路走到葉子」且節點值加總等於目標的路徑。',
  statement: '給二元樹 root 與 targetSum，回傳所有根到葉子、節點值總和等於 targetSum 的路徑。葉子是沒有左右孩子的節點。路徑順序不限。',
  examples: [{ input: 'root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22', output: '[[5,4,11,2],[5,8,4,5]]' }, { input: 'root = [1,2,3], targetSum = 5', output: '[]' }, { input: 'root = [1,2], targetSum = 0', output: '[]' }],
  constraints: ['`0 ≤ 節點數 ≤ 5000`', '`−1000 ≤ Node.val ≤ 1000`', '`−1000 ≤ targetSum ≤ 1000`'],
  insight: ['[[p:tree-dfs]] 走到葉子時才判斷；中途和等於目標仍不能提前收錄。', '可用 DFS 路徑回溯，或 BFS 為每個狀態記父節點，遇到合格葉子再重建路徑。'],
  approaches: [
    {
      name: '深度優先與路徑回溯',
      idea: '沿路記住節點值與剩餘目標；到合格葉子時複製目前路徑，離開節點時移除最後一項。',
      steps: ['走到節點時，把值加入 path，從剩餘目標扣除。', '若是葉子且剩餘目標為 0，複製 path 到答案。', '遞迴左右孩子後，把目前值從 path 移除。'],
      figure: { title: 'targetSum = 22', steps: dfsFig() },
      complexity: { time: 'O(n + 輸出總長度)', space: 'O(h + 輸出總長度)', why: '每個節點訪問一次；每條合格路徑都需複製。' },
      verdict: '最貼近路徑問題的寫法；複製答案時不能直接存可變 path。',
      code: {
        python: `import sys

def pathSum(root, targetSum):
    sys.setrecursionlimit(10000)
    answer = []
    path = []

    def dfs(node, remaining):
        if not node:
            return
        path.append(node.val)
        remaining -= node.val
        if not node.left and not node.right and remaining == 0:
            answer.append(path[:])  # 複製目前完整路徑
        dfs(node.left, remaining)
        dfs(node.right, remaining)
        path.pop()  # 回到父節點前恢復路徑

    dfs(root, targetSum)
    return answer${CHECK.python}`,
        c: `void dfs113(struct TreeNode *node, long long remaining, int *path, int depth, int **answer, int *sizes, int *count) {
    if (!node) {
        return;
    }
    path[depth] = node->val;
    remaining -= node->val;
    if (!node->left && !node->right && remaining == 0) {
        answer[*count] = malloc((depth + 1) * sizeof(int));
        memcpy(answer[*count], path, (depth + 1) * sizeof(int));
        sizes[*count] = depth + 1;
        (*count)++;
    }
    dfs113(node->left, remaining, path, depth + 1, answer, sizes, count);
    dfs113(node->right, remaining, path, depth + 1, answer, sizes, count);
}

int **pathSum(struct TreeNode *root, int targetSum, int *returnSize, int **returnColumnSizes) {
    int **answer = malloc(5000 * sizeof(int *));
    *returnColumnSizes = malloc(5000 * sizeof(int));
    int *path = malloc(5000 * sizeof(int));
    *returnSize = 0;
    dfs113(root, targetSum, path, 0, answer, *returnColumnSizes, returnSize);
    free(path);
    return answer;
}${CHECK.c}`,
        cpp: `vector<vector<int>> pathSum(TreeNode* root, int targetSum) {
    vector<vector<int>> answer;
    vector<int> path;
    function<void(TreeNode*, long long)> dfs = [&](TreeNode* node, long long remaining) {
        if (!node) {
            return;
        }
        path.push_back(node->val);
        remaining -= node->val;
        if (!node->left && !node->right && remaining == 0) {
            answer.push_back(path);
        }
        dfs(node->left, remaining);
        dfs(node->right, remaining);
        path.pop_back();
    };
    dfs(root, targetSum);
    return answer;
}${CHECK.cpp}`,
        java: `List<List<Integer>> pathSum(TreeNode root, int targetSum) {
    List<List<Integer>> answer = new ArrayList<>();
    List<Integer> path = new ArrayList<>();
    dfs113(root, targetSum, path, answer);
    return answer;
}

void dfs113(TreeNode node, long remaining, List<Integer> path, List<List<Integer>> answer) {
    if (node == null) {
        return;
    }
    path.add(node.val);
    remaining -= node.val;
    if (node.left == null && node.right == null && remaining == 0) {
        answer.add(new ArrayList<>(path));
    }
    dfs113(node.left, remaining, path, answer);
    dfs113(node.right, remaining, path, answer);
    path.remove(path.size() - 1);
}${CHECK.java}`,
        javascript: `function pathSum(root, targetSum) {
  const answer = [];
  const path = [];
  function dfs(node, remaining) {
    if (!node) {
      return;
    }
    path.push(node.val);
    remaining -= node.val;
    if (!node.left && !node.right && remaining === 0) {
      answer.push([...path]);
    }
    dfs(node.left, remaining);
    dfs(node.right, remaining);
    path.pop();
  }
  dfs(root, targetSum);
  return answer;
}${CHECK.javascript}`,
      },
    },
    {
      name: '廣度優先與父狀態回溯',
      idea: 'BFS 狀態記節點、路徑總和、父狀態索引；找到合格葉子才沿父索引組出路徑。',
      steps: ['根節點入佇列，父索引為 −1。', '取出狀態，將左右孩子與新的累計和、父索引入隊。', '遇到合格葉子，沿父索引回溯並反轉成根到葉子的路徑。'],
      figure: { title: 'targetSum = 22', steps: bfsFig() },
      complexity: { time: 'O(n + 輸出總長度)', space: 'O(n + 輸出總長度)', why: '每個節點一個狀態；重建合格路徑的成本等於輸出長度。' },
      verdict: '不用遞迴，也不必在每次入隊時複製整條路徑。',
      code: {
        python: `def pathSum(root, targetSum):
    if not root:
        return []
    states = [(root, root.val, -1)]
    answer = []
    head = 0
    while head < len(states):
        node, total, parent = states[head]
        if not node.left and not node.right and total == targetSum:
            path = []
            index = head
            while index != -1:
                path.append(states[index][0].val)
                index = states[index][2]
            answer.append(path[::-1])  # 父鏈是由葉往根
        for child in (node.left, node.right):
            if child:
                states.append((child, total + child.val, head))
        head += 1
    return answer${CHECK.python}`,
        c: `int **pathSum(struct TreeNode *root, int targetSum, int *returnSize, int **returnColumnSizes) {
    int **answer = malloc(5000 * sizeof(int *));
    *returnColumnSizes = malloc(5000 * sizeof(int));
    *returnSize = 0;
    if (!root) {
        return answer;
    }
    struct TreeNode **nodes = malloc(5000 * sizeof(struct TreeNode *));
    long long *totals = malloc(5000 * sizeof(long long));
    int *parents = malloc(5000 * sizeof(int));
    int size = 1;
    nodes[0] = root;
    totals[0] = root->val;
    parents[0] = -1;
    for (int head = 0; head < size; head++) {
        struct TreeNode *node = nodes[head];
        if (!node->left && !node->right && totals[head] == targetSum) {
            int length = 0;
            for (int at = head; at != -1; at = parents[at]) {
                length++;
            }
            int *path = malloc(length * sizeof(int));
            for (int at = head, j = length - 1; at != -1; at = parents[at], j--) {
                path[j] = nodes[at]->val;
            }
            answer[*returnSize] = path;
            (*returnColumnSizes)[*returnSize] = length;
            (*returnSize)++;
        }
        if (node->left) {
            nodes[size] = node->left;
            totals[size] = totals[head] + node->left->val;
            parents[size++] = head;
        }
        if (node->right) {
            nodes[size] = node->right;
            totals[size] = totals[head] + node->right->val;
            parents[size++] = head;
        }
    }
    free(nodes);
    free(totals);
    free(parents);
    return answer;
}${CHECK.c}`,
        cpp: `vector<vector<int>> pathSum(TreeNode* root, int targetSum) {
    if (!root) {
        return {};
    }
    struct State {
        TreeNode* node;
        long long total;
        int parent;
    };
    vector<State> states{{root, root->val, -1}};
    vector<vector<int>> answer;
    for (int head = 0; head < (int)states.size(); head++) {
        State state = states[head];
        if (!state.node->left && !state.node->right && state.total == targetSum) {
            vector<int> path;
            for (int at = head; at != -1; at = states[at].parent) {
                path.push_back(states[at].node->val);
            }
            reverse(path.begin(), path.end());
            answer.push_back(path);
        }
        if (state.node->left) {
            states.push_back({state.node->left, state.total + state.node->left->val, head});
        }
        if (state.node->right) {
            states.push_back({state.node->right, state.total + state.node->right->val, head});
        }
    }
    return answer;
}${CHECK.cpp}`,
        java: `List<List<Integer>> pathSum(TreeNode root, int targetSum) {
    List<List<Integer>> answer = new ArrayList<>();
    if (root == null) {
        return answer;
    }
    List<TreeNode> nodes = new ArrayList<>();
    List<Long> totals = new ArrayList<>();
    List<Integer> parents = new ArrayList<>();
    nodes.add(root);
    totals.add((long)root.val);
    parents.add(-1);
    for (int head = 0; head < nodes.size(); head++) {
        TreeNode node = nodes.get(head);
        long total = totals.get(head);
        if (node.left == null && node.right == null && total == targetSum) {
            List<Integer> path = new ArrayList<>();
            for (int at = head; at != -1; at = parents.get(at)) {
                path.add(nodes.get(at).val);
            }
            Collections.reverse(path);
            answer.add(path);
        }
        if (node.left != null) {
            nodes.add(node.left);
            totals.add(total + node.left.val);
            parents.add(head);
        }
        if (node.right != null) {
            nodes.add(node.right);
            totals.add(total + node.right.val);
            parents.add(head);
        }
    }
    return answer;
}${CHECK.java}`,
        javascript: `function pathSum(root, targetSum) {
  if (!root) {
    return [];
  }
  const states = [{ node: root, total: root.val, parent: -1 }];
  const answer = [];
  for (let head = 0; head < states.length; head++) {
    const state = states[head];
    const node = state.node;
    if (!node.left && !node.right && state.total === targetSum) {
      const path = [];
      for (let at = head; at !== -1; at = states[at].parent) {
        path.push(states[at].node.val);
      }
      answer.push(path.reverse());
    }
    if (node.left) {
      states.push({ node: node.left, total: state.total + node.left.val, parent: head });
    }
    if (node.right) {
      states.push({ node: node.right, total: state.total + node.right.val, parent: head });
    }
  }
  return answer;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['只有走到葉子才能收錄路徑；在中間節點達到目標還不算。', 'DFS 保存答案時要複製 path，否則後續回溯會把先前答案改掉。'],
  check: { kind: 'fn', fn: 'pathSumCheck', argKinds: ['tree', null], cases: [{ args: [T, 22], out: 788141391 }, { args: [[1, 2, 3], 3], out: 2037011 }, { args: [[1, 2], 0], out: 0 }] },
}
