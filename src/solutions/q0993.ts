import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

const T = [1, 2, 3, null, 4, null, 5]

export const q0993: Solution = {
  id: 993,
  plain: '兩個樹節點若在同一層、但父節點不同，就是堂兄弟；判斷 x 和 y 是否符合。',
  statement: '給二元樹 root 與兩個不同節點值 x、y。若兩節點深度相同且父節點不同，回傳 true。根深度為 0。',
  examples: [{ input: 'root = [1,2,3,null,4,null,5], x = 4, y = 5', output: 'true' }, { input: 'root = [1,2,3,4], x = 2, y = 3', output: 'false' }],
  constraints: ['節點數最多 100；每個節點值互不相同。'],
  insight: ['要比較兩個欄位：深度與父節點。', '可用 [[p:tree-dfs]] 收集欄位，或用層序搜尋直接比較同一層。'],
  approaches: [
    {
      name: '深度優先記錄父節點與深度',
      idea: '走訪樹時，找到 x、y 就分別記下它的父節點與深度。',
      steps: ['從根以深度 0 出發', '遞迴左右孩子，傳入目前節點作為父節點', '遇到 x 或 y 時記錄父值與深度', '比較深度相等且父值不同'],
      figure: { title: 'root = [1,2,3,null,4,null,5]', steps: [
        { note: '根 1 位於第 0 層。', views: [tree(T, { cls: { 0: 'hl' } })] },
        { note: '走左邊：2 在第 1 層，4 在第 2 層；記下 4 的父節點是 2。', views: [tree(T, { cls: { 1: 'done', 4: 'hl' } }), arr([2, 2], { label: '4 的父值 / 深度' })] },
        { note: '走右邊：3 在第 1 層，5 在第 2 層；記下 5 的父節點是 3。', views: [tree(T, { cls: { 2: 'done', 6: 'hl' } }), arr([3, 2], { label: '5 的父值 / 深度' })] },
        { note: '兩者深度同為 2，父節點 2 和 3 不同，答案為 true。', views: [arr([2, 2, 3, 2], { label: 'x 父/深度、y 父/深度', done: [1, 3] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點走一次，遞迴深度最多為樹高。' },
      verdict: '條件清楚，也方便延伸到查詢多個節點。',
      code: {
        python: `def isCousins(root, x, y):
    found = {}

    def dfs(node, parent, depth):
        if not node:
            return
        if node.val == x or node.val == y:
            found[node.val] = (parent, depth)  # 同時記父節點與層數
        dfs(node.left, node, depth + 1)
        dfs(node.right, node, depth + 1)

    dfs(root, None, 0)
    return found[x][1] == found[y][1] and found[x][0] != found[y][0]`,
        c: `static void dfs993(struct TreeNode *node, struct TreeNode *parent, int depth, int x, int y, struct TreeNode **parents, int *depths) {
    if (!node) {
        return;
    }
    if (node->val == x) {
        parents[0] = parent;
        depths[0] = depth;
    }
    if (node->val == y) {
        parents[1] = parent;
        depths[1] = depth;
    }
    dfs993(node->left, node, depth + 1, x, y, parents, depths);
    dfs993(node->right, node, depth + 1, x, y, parents, depths);
}

bool isCousins(struct TreeNode *root, int x, int y) {
    struct TreeNode *parents[2] = {NULL, NULL};
    int depths[2] = {-1, -1};
    dfs993(root, NULL, 0, x, y, parents, depths);
    return depths[0] == depths[1] && parents[0] != parents[1];
}`,
        cpp: `bool isCousins(TreeNode* root, int x, int y) {
    pair<TreeNode*, int> first{nullptr, -1};
    pair<TreeNode*, int> second{nullptr, -1};
    function<void(TreeNode*, TreeNode*, int)> dfs = [&](TreeNode* node, TreeNode* parent, int depth) {
        if (!node) {
            return;
        }
        if (node->val == x) {
            first = {parent, depth};
        }
        if (node->val == y) {
            second = {parent, depth};
        }
        dfs(node->left, node, depth + 1);
        dfs(node->right, node, depth + 1);
    };
    dfs(root, nullptr, 0);
    return first.second == second.second && first.first != second.first;
}`,
        java: `boolean isCousins(TreeNode root, int x, int y) {
    int[] depths = {-1, -1};
    TreeNode[] parents = new TreeNode[2];
    dfs993(root, null, 0, x, y, depths, parents);
    return depths[0] == depths[1] && parents[0] != parents[1];
}

void dfs993(TreeNode node, TreeNode parent, int depth, int x, int y, int[] depths, TreeNode[] parents) {
    if (node == null) {
        return;
    }
    if (node.val == x) {
        depths[0] = depth;
        parents[0] = parent;
    }
    if (node.val == y) {
        depths[1] = depth;
        parents[1] = parent;
    }
    dfs993(node.left, node, depth + 1, x, y, depths, parents);
    dfs993(node.right, node, depth + 1, x, y, depths, parents);
}`,
        javascript: `function isCousins(root, x, y) {
  const found = new Map();
  function dfs(node, parent, depth) {
    if (!node) {
      return;
    }
    if (node.val === x || node.val === y) {
      found.set(node.val, [parent, depth]);
    }
    dfs(node.left, node, depth + 1);
    dfs(node.right, node, depth + 1);
  }
  dfs(root, null, 0);
  const a = found.get(x);
  const b = found.get(y);
  return a[1] === b[1] && a[0] !== b[0];
}`,
      },
    },
    {
      name: '逐層廣度優先搜尋',
      idea: '一層一層檢查；同一層同時找到 x、y，且不屬於同一父節點時才成立。',
      steps: ['根入列', '每輪只處理當前層的節點', '檢查是否有父節點的兩個孩子剛好是 x、y', '本層記錄是否看到 x、y；兩者都見到則 true，只見一個則 false'],
      figure: { title: 'root = [1,2,3,null,4,null,5]', steps: [
        { note: '第 0 層只有根 1，沒有目標。', views: [tree(T, { cls: { 0: 'hl' } })] },
        { note: '第 1 層有 2、3，仍沒有目標；把它們的孩子排入下一層。', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } })] },
        { note: '第 2 層看到 4、5；它們分別來自父節點 2、3。', views: [tree(T, { cls: { 4: 'hl', 6: 'hl' } }), arr([4, 5], { label: '本層' })] },
        { note: '同層找到兩者且不是親兄弟，回傳 true。', views: [arr([4, 5], { label: '堂兄弟', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每個節點至多入列一次，佇列最多放一層的節點。' },
      verdict: '「同一層」的判斷很直觀。',
      code: {
        python: `from collections import deque

def isCousins(root, x, y):
    queue = deque([root])
    while queue:
        seen_x = seen_y = False
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.val == x:
                seen_x = True
            if node.val == y:
                seen_y = True
            if node.left and node.right and {node.left.val, node.right.val} == {x, y}:
                return False  # 同父節點是兄弟，不是堂兄弟
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        if seen_x or seen_y:
            return seen_x and seen_y
    return False`,
        c: `bool isCousins(struct TreeNode *root, int x, int y) {
    struct TreeNode **queue = malloc(101 * sizeof(struct TreeNode *));
    int front = 0;
    int back = 0;
    queue[back++] = root;
    while (front < back) {
        int end = back;
        bool seenX = false;
        bool seenY = false;
        while (front < end) {
            struct TreeNode *node = queue[front++];
            seenX |= node->val == x;
            seenY |= node->val == y;
            if (node->left && node->right) {
                bool siblings = (node->left->val == x && node->right->val == y) || (node->left->val == y && node->right->val == x);
                if (siblings) {
                    free(queue);
                    return false;
                }
            }
            if (node->left) {
                queue[back++] = node->left;
            }
            if (node->right) {
                queue[back++] = node->right;
            }
        }
        if (seenX || seenY) {
            free(queue);
            return seenX && seenY;
        }
    }
    free(queue);
    return false;
}`,
        cpp: `bool isCousins(TreeNode* root, int x, int y) {
    queue<TreeNode*> pending;
    pending.push(root);
    while (!pending.empty()) {
        int count = pending.size();
        bool seenX = false;
        bool seenY = false;
        for (int i = 0; i < count; i++) {
            TreeNode* node = pending.front();
            pending.pop();
            seenX |= node->val == x;
            seenY |= node->val == y;
            if (node->left && node->right) {
                bool siblings = (node->left->val == x && node->right->val == y) || (node->left->val == y && node->right->val == x);
                if (siblings) {
                    return false;
                }
            }
            if (node->left) {
                pending.push(node->left);
            }
            if (node->right) {
                pending.push(node->right);
            }
        }
        if (seenX || seenY) {
            return seenX && seenY;
        }
    }
    return false;
}`,
        java: `boolean isCousins(TreeNode root, int x, int y) {
    Queue<TreeNode> pending = new ArrayDeque<>();
    pending.add(root);
    while (!pending.isEmpty()) {
        int count = pending.size();
        boolean seenX = false;
        boolean seenY = false;
        for (int i = 0; i < count; i++) {
            TreeNode node = pending.remove();
            seenX |= node.val == x;
            seenY |= node.val == y;
            if (node.left != null && node.right != null) {
                boolean siblings = (node.left.val == x && node.right.val == y) || (node.left.val == y && node.right.val == x);
                if (siblings) {
                    return false;
                }
            }
            if (node.left != null) {
                pending.add(node.left);
            }
            if (node.right != null) {
                pending.add(node.right);
            }
        }
        if (seenX || seenY) {
            return seenX && seenY;
        }
    }
    return false;
}`,
        javascript: `function isCousins(root, x, y) {
  const queue = [root];
  for (let front = 0; front < queue.length;) {
    const end = queue.length;
    let seenX = false;
    let seenY = false;
    while (front < end) {
      const node = queue[front++];
      seenX ||= node.val === x;
      seenY ||= node.val === y;
      if (node.left && node.right) {
        const siblings = node.left.val === x && node.right.val === y || node.left.val === y && node.right.val === x;
        if (siblings) {
          return false;
        }
      }
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
    if (seenX || seenY) {
      return seenX && seenY;
    }
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['同層的親兄弟不算堂兄弟。', 'tree() 的層序輸入須保留必要的 null，否則孩子會接到錯誤父節點。'],
  check: { kind: 'fn', fn: 'isCousins', argKinds: ['tree', null, null], cases: [
    { args: [T, 4, 5], out: true },
    { args: [[1, 2, 3, 4], 2, 3], out: false },
    { args: [[1, 2, 3, 4, 5], 4, 5], out: false },
  ] },
}
