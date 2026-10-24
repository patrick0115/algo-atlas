import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

const T = [1, 2, 3, null, 5]

export const q0257: Solution = {
  id: 257,
  plain: '從樹根走到每片葉子，把沿途的數字串成路線，例如 1→2→5。',
  statement: '給二元樹 root，回傳所有從根到葉子的路徑字串。葉子必須沒有左右孩子。',
  examples: [{ input: 'root = [1,2,3,null,5]', output: '["1->2->5","1->3"]' }, { input: 'root = [1]', output: '["1"]' }],
  constraints: ['節點數最多 100，節點值可以是負數。'],
  insight: ['每條路徑都從根開始，走到葉子才完整。', '遇到非葉子時，將目前路徑交給左右孩子；這就是 [[p:tree-dfs]]。'],
  approaches: [
    {
      name: '遞迴深度優先',
      idea: '遞迴參數帶著目前字串，到葉子時才放進答案。',
      steps: ['從根開始，路徑為根的數值', '往孩子走時附加 `->孩子值`', '抵達葉子就記錄字串'],
      figure: { title: 'root = [1,2,3,null,5]', steps: [
        { note: '從根 1 出發；目前只有 1，還不是葉子。', views: [tree(T, { cls: { 0: 'hl' } }), arr(['1'], { label: '目前路徑' })] },
        { note: '先往左走到 2，路徑延長為 1→2；2 還有孩子。', views: [tree(T, { cls: { 0: 'done', 1: 'hl' } }), arr(['1', '2'], { label: '目前路徑' })] },
        { note: '到 5 時沒有孩子，記下完整路徑 1→2→5。', views: [tree(T, { cls: { 4: 'hl' } }), arr(['1->2->5'], { label: '答案', done: [0] })] },
        { note: '回到根，再走右邊的葉子 3；記下 1→3。', views: [tree(T, { cls: { 2: 'hl' } }), arr(['1->2->5', '1->3'], { label: '答案', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(nh)', space: 'O(nh)', why: '每條路徑複製長度至多 h 的字串；答案也要存這些字串。' },
      verdict: '短小直觀，適合初次解題。',
      code: {
        python: `def binaryTreePaths(root):
    ans = []

    def dfs(node, path):
        if not node.left and not node.right:
            ans.append(path)  # 只有葉子才算完整路徑
            return
        if node.left:
            dfs(node.left, path + '->' + str(node.left.val))
        if node.right:
            dfs(node.right, path + '->' + str(node.right.val))

    if root:
        dfs(root, str(root.val))
    return ans`,
        c: `static void pathsDfs(struct TreeNode *node, char *path, char **ans, int *count) {
    if (!node->left && !node->right) {
        ans[*count] = malloc(strlen(path) + 1);
        strcpy(ans[*count], path);
        (*count)++;
        return;
    }
    if (node->left) {
        char next[2048];
        snprintf(next, sizeof(next), "%s->%d", path, node->left->val);
        pathsDfs(node->left, next, ans, count);
    }
    if (node->right) {
        char next[2048];
        snprintf(next, sizeof(next), "%s->%d", path, node->right->val);
        pathsDfs(node->right, next, ans, count);
    }
}

char **binaryTreePaths(struct TreeNode *root, int *returnSize) {
    char **ans = malloc(101 * sizeof(char *));
    *returnSize = 0;
    if (root) {
        char path[2048];
        snprintf(path, sizeof(path), "%d", root->val);
        pathsDfs(root, path, ans, returnSize);
    }
    return ans;
}`,
        cpp: `vector<string> binaryTreePaths(TreeNode* root) {
    vector<string> ans;
    function<void(TreeNode*, string)> dfs = [&](TreeNode* node, string path) {
        if (!node->left && !node->right) {
            ans.push_back(path);
            return;
        }
        if (node->left) {
            dfs(node->left, path + "->" + to_string(node->left->val));
        }
        if (node->right) {
            dfs(node->right, path + "->" + to_string(node->right->val));
        }
    };
    if (root) dfs(root, to_string(root->val));
    return ans;
}`,
        java: `List<String> binaryTreePaths(TreeNode root) {
    List<String> ans = new ArrayList<>();
    if (root != null) pathsDfs(root, Integer.toString(root.val), ans);
    return ans;
}

void pathsDfs(TreeNode node, String path, List<String> ans) {
    if (node.left == null && node.right == null) {
        ans.add(path);
        return;
    }
    if (node.left != null) {
        pathsDfs(node.left, path + "->" + node.left.val, ans);
    }
    if (node.right != null) {
        pathsDfs(node.right, path + "->" + node.right.val, ans);
    }
}`,
        javascript: `function binaryTreePaths(root) {
  const ans = [];
  function dfs(node, path) {
    if (!node.left && !node.right) {
      ans.push(path);
      return;
    }
    if (node.left) dfs(node.left, path + '->' + node.left.val);
    if (node.right) dfs(node.right, path + '->' + node.right.val);
  }
  if (root) dfs(root, String(root.val));
  return ans;
}`,
      },
    },
    {
      name: '堆疊逐條探索',
      idea: '堆疊同時保存節點與走到該節點的路徑。',
      steps: ['把根與字串放入堆疊', '取出一組，若是葉子則記錄', '否則將右孩子、左孩子及各自路徑推入'],
      figure: { title: 'root = [1,2,3,null,5]', steps: [
        { note: '堆疊先放 `(1,"1")`。', views: [tree(T, { cls: { 0: 'hl' } }), arr(['1'], { label: '堆疊' })] },
        { note: '取出 1，先推右孩子 3，再推左孩子 2；下次會先處理 2。', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } }), arr(['1->3', '1->2'], { label: '堆疊' })] },
        { note: '2 的孩子 5 入棧；取出 5 後記錄第一條路徑。', views: [tree(T, { cls: { 4: 'hl' } }), arr(['1->2->5'], { label: '答案', done: [0] })] },
        { note: '再取出 3，它也是葉子；答案有兩條路徑。', views: [tree(T, { cls: { 2: 'hl' } }), arr(['1->2->5', '1->3'], { label: '答案', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(nh)', space: 'O(nh)', why: '每次推入都複製路徑，堆疊與答案都可能保存多條路徑。' },
      verdict: '可避免遞迴；推入右邊再推左邊，才能保持由左到右的輸出。',
      code: {
        python: `def binaryTreePaths(root):
    if not root:
        return []
    ans = []
    stack = [(root, str(root.val))]
    while stack:
        node, path = stack.pop()
        if not node.left and not node.right:
            ans.append(path)  # 葉子才輸出
        if node.right:
            stack.append((node.right, path + '->' + str(node.right.val)))
        if node.left:
            stack.append((node.left, path + '->' + str(node.left.val)))
    return ans`,
        c: `char **binaryTreePaths(struct TreeNode *root, int *returnSize) {
    char **ans = malloc(101 * sizeof(char *));
    struct TreeNode *nodes[101];
    char *paths[101];
    int top = 0;
    *returnSize = 0;
    if (!root) return ans;
    char start[32];
    snprintf(start, sizeof(start), "%d", root->val);
    nodes[top] = root;
    paths[top] = malloc(strlen(start) + 1);
    strcpy(paths[top], start);
    top++;
    while (top) {
        top--;
        struct TreeNode *node = nodes[top];
        char *path = paths[top];
        if (!node->left && !node->right) {
            ans[(*returnSize)++] = path;
            continue;
        }
        struct TreeNode *kids[2] = {node->right, node->left};
        for (int i = 0; i < 2; i++) {
            if (!kids[i]) continue;
            char buf[2048];
            snprintf(buf, sizeof(buf), "%s->%d", path, kids[i]->val);
            nodes[top] = kids[i];
            paths[top] = malloc(strlen(buf) + 1);
            strcpy(paths[top], buf);
            top++;
        }
        free(path);
    }
    return ans;
}`,
        cpp: `vector<string> binaryTreePaths(TreeNode* root) {
    vector<string> ans;
    if (!root) return ans;
    vector<pair<TreeNode*, string>> stack{{root, to_string(root->val)}};
    while (!stack.empty()) {
        auto [node, path] = stack.back();
        stack.pop_back();
        if (!node->left && !node->right) ans.push_back(path);
        if (node->right) stack.push_back({node->right, path + "->" + to_string(node->right->val)});
        if (node->left) stack.push_back({node->left, path + "->" + to_string(node->left->val)});
    }
    return ans;
}`,
        java: `List<String> binaryTreePaths(TreeNode root) {
    List<String> ans = new ArrayList<>();
    if (root == null) return ans;
    Deque<TreeNode> nodes = new ArrayDeque<>();
    Deque<String> paths = new ArrayDeque<>();
    nodes.push(root);
    paths.push(Integer.toString(root.val));
    while (!nodes.isEmpty()) {
        TreeNode node = nodes.pop();
        String path = paths.pop();
        if (node.left == null && node.right == null) ans.add(path);
        if (node.right != null) {
            nodes.push(node.right);
            paths.push(path + "->" + node.right.val);
        }
        if (node.left != null) {
            nodes.push(node.left);
            paths.push(path + "->" + node.left.val);
        }
    }
    return ans;
}`,
        javascript: `function binaryTreePaths(root) {
  if (!root) return [];
  const ans = [];
  const stack = [[root, String(root.val)]];
  while (stack.length) {
    const [node, path] = stack.pop();
    if (!node.left && !node.right) ans.push(path);
    if (node.right) stack.push([node.right, path + '->' + node.right.val]);
    if (node.left) stack.push([node.left, path + '->' + node.left.val]);
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['只有左右孩子都不存在才是葉子；單孩子節點不能提前輸出。', '迭代版若先推左孩子，堆疊會先處理右子樹，輸出順序就相反。'],
  check: { kind: 'fn', fn: 'binaryTreePaths', argKinds: ['tree'], cases: [
    { args: [T], out: ['1->2->5', '1->3'] },
    { args: [[1]], out: ['1'] },
    { args: [[]], out: [] },
  ] },
}
