import { tree } from './fig'
import type { Solution } from './types'

// 404. Sum of Left Leaves
const T = [3, 9, 20, null, null, 15, 7]

export const q0404: Solution = {
  id: 404,
  plain: '把樹上「位在父節點左邊，而且自己沒有孩子」的節點值加起來。左孩子不一定是左葉子。',
  statement: '給二元樹根節點，回傳所有左葉節點的值之和。葉節點必須同時沒有左、右孩子。',
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '24', note: '左葉為 9 與 15。' },
    { input: 'root = [1]', output: '0' },
  ],
  constraints: ['節點數最多 1000；節點值介於 -1000 到 1000。'],
  insight: ['只看節點本身無法判斷它是左孩子還是右孩子，需要父節點傳遞方向。', '也可以在父節點處直接檢查左孩子是不是葉子。'],
  approaches: [
    {
      name: '遞迴傳下「是否左孩子」',
      idea: '拜訪節點時攜帶方向，若它是左孩子且沒有孩子，就回傳它的值。',
      steps: ['空節點回傳 0。', '左葉回傳自身值；其他葉回傳 0。', '非葉節點遞迴左右孩子，左邊傳 true、右邊傳 false，結果相加。'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: [
        { note: '根 3 沒有父節點，不可能是左葉；往左右孩子走。', views: [tree(T, { cls: { 0: 'hl' } })] },
        { note: '9 是 3 的左孩子，而且沒有孩子，貢獻 9。', views: [tree(T, { cls: { 1: 'hl' }, subs: { 1: '+9' } })] },
        { note: '20 雖是 3 的右孩子，還有自己的孩子，所以繼續往下找。', views: [tree(T, { cls: { 1: 'done', 2: 'hl' } })] },
        { note: '15 是 20 的左葉，貢獻 15；7 是右葉，貢獻 0。', views: [tree(T, { cls: { 1: 'done', 5: 'hl', 6: 'dim' }, subs: { 1: '+9', 5: '+15' } })] },
        { note: '把兩個左葉的貢獻相加，9 + 15 = 24。', views: [tree(T, { cls: { 1: 'done', 5: 'done', 6: 'dim' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點拜訪一次；遞迴深度是樹高。' },
      verdict: '把「左」的資訊明確傳給孩子，容易避免誤把右葉算進來。',
      code: {
        python: `def sumOfLeftLeaves(root):
    def dfs(node, is_left):
        if not node:
            return 0
        if not node.left and not node.right:
            return node.val if is_left else 0  # 葉子還要檢查方向
        return dfs(node.left, True) + dfs(node.right, False)

    return dfs(root, False)`,
        c: `static int dfs(struct TreeNode *node, bool isLeft) {
    if (!node) {
        return 0;
    }
    if (!node->left && !node->right) {
        return isLeft ? node->val : 0;
    }
    return dfs(node->left, true) + dfs(node->right, false);
}

int sumOfLeftLeaves(struct TreeNode *root) {
    return dfs(root, false);
}`,
        cpp: `int sumOfLeftLeaves(TreeNode* root) {
    auto dfs = [&](auto&& self, TreeNode* node, bool isLeft) -> int {
        if (!node) {
            return 0;
        }
        if (!node->left && !node->right) {
            return isLeft ? node->val : 0;
        }
        return self(self, node->left, true) + self(self, node->right, false);
    };
    return dfs(dfs, root, false);
}`,
        java: `int sumOfLeftLeaves(TreeNode root) {
    return dfs(root, false);
}

private int dfs(TreeNode node, boolean isLeft) {
    if (node == null) {
        return 0;
    }
    if (node.left == null && node.right == null) {
        return isLeft ? node.val : 0;
    }
    return dfs(node.left, true) + dfs(node.right, false);
}`,
        javascript: `function sumOfLeftLeaves(root) {
  function dfs(node, isLeft) {
    if (!node) {
      return 0;
    }
    if (!node.left && !node.right) {
      return isLeft ? node.val : 0;
    }
    return dfs(node.left, true) + dfs(node.right, false);
  }
  return dfs(root, false);
}`,
      },
    },
    {
      name: '迭代走訪，從父節點檢查',
      idea: '每次拿出父節點，若它的左孩子是葉子就直接加總；其餘孩子繼續入堆疊。',
      steps: ['根節點入堆疊。', '彈出節點，檢查其左孩子是否沒有孩子；若是，加入答案。', '有左右孩子就各自入堆疊，直到堆疊清空。'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: [
        { note: '從根 3 看左孩子 9；9 是葉，立即把 9 加入答案。', views: [tree(T, { cls: { 0: 'hl', 1: 'done' } })] },
        { note: '右孩子 20 不是葉，放入堆疊，接著處理它。', views: [tree(T, { cls: { 1: 'done', 2: 'hl' } })] },
        { note: '20 的左孩子 15 是葉，再加 15，答案成為 24。', views: [tree(T, { cls: { 1: 'done', 2: 'hl', 5: 'done' } })] },
        { note: '右孩子 7 雖然也是葉，但方向不對；答案維持 24。', views: [tree(T, { cls: { 1: 'done', 5: 'done', 6: 'dim' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點最多進堆疊一次；最壞堆疊大小與樹高同階。' },
      verdict: '不使用遞迴；從父節點檢查左孩子也很直觀。',
      code: {
        python: `def sumOfLeftLeaves(root):
    stack = [root] if root else []
    answer = 0
    while stack:
        node = stack.pop()
        left = node.left
        if left:
            if not left.left and not left.right:
                answer += left.val  # 只收父節點的左葉
            else:
                stack.append(left)
        if node.right:
            stack.append(node.right)
    return answer`,
        c: `int sumOfLeftLeaves(struct TreeNode *root) {
    if (!root) {
        return 0;
    }
    struct TreeNode **stack = malloc(1000 * sizeof(*stack));
    int top = 0;
    int answer = 0;
    stack[top++] = root;
    while (top > 0) {
        struct TreeNode *node = stack[--top];
        struct TreeNode *left = node->left;
        if (left) {
            if (!left->left && !left->right) {
                answer += left->val;
            } else {
                stack[top++] = left;
            }
        }
        if (node->right) {
            stack[top++] = node->right;
        }
    }
    free(stack);
    return answer;
}`,
        cpp: `int sumOfLeftLeaves(TreeNode* root) {
    if (!root) {
        return 0;
    }
    vector<TreeNode*> stack{root};
    int answer = 0;
    while (!stack.empty()) {
        TreeNode* node = stack.back();
        stack.pop_back();
        if (node->left) {
            TreeNode* left = node->left;
            if (!left->left && !left->right) {
                answer += left->val;
            } else {
                stack.push_back(left);
            }
        }
        if (node->right) {
            stack.push_back(node->right);
        }
    }
    return answer;
}`,
        java: `int sumOfLeftLeaves(TreeNode root) {
    if (root == null) {
        return 0;
    }
    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    int answer = 0;
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        if (node.left != null) {
            TreeNode left = node.left;
            if (left.left == null && left.right == null) {
                answer += left.val;
            } else {
                stack.push(left);
            }
        }
        if (node.right != null) {
            stack.push(node.right);
        }
    }
    return answer;
}`,
        javascript: `function sumOfLeftLeaves(root) {
  const stack = root ? [root] : [];
  let answer = 0;
  while (stack.length) {
    const node = stack.pop();
    const left = node.left;
    if (left) {
      if (!left.left && !left.right) {
        answer += left.val;
      } else {
        stack.push(left);
      }
    }
    if (node.right) {
      stack.push(node.right);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['只有左孩子還不夠，它必須同時沒有左右孩子。', '單獨的根節點不是任何節點的左孩子，答案是 0。'],
  check: { kind: 'fn', fn: 'sumOfLeftLeaves', argKinds: ['tree'], cases: [
    { args: [T], out: 24 },
    { args: [[1]], out: 0 },
    { args: [[1, 2, 3, 4, null, 5]], out: 9 },
  ] },
}
