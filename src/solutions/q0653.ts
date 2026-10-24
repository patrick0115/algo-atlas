import { tree } from './fig'
import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 653. Two Sum IV - Input is a BST
const T = [5, 3, 6, 2, 4, null, 7]

export const q0653: Solution = {
  id: 653,
  plain: '在搜尋樹裡找兩個不同節點，看看它們的值能不能湊出目標 k。',
  statement: '給二元搜尋樹 root 與整數 k，若存在兩個不同節點的值相加等於 k，回傳 true。',
  examples: [{ input: 'root = [5,3,6,2,4,null,7], k = 9', output: 'true' }, { input: 'root = [5,3,6,2,4,null,7], k = 28', output: 'false' }],
  constraints: ['1 ≤ 節點數 ≤ 10⁴；節點值可為負。'],
  insight: ['與 [1](#/q/1) 一樣，走訪時記已見值，查 k−value 即可。', '搜尋樹中序走訪會得到排序陣列，之後可用 [[p:two-pointers]]。'],
  approaches: [
    {
      name: 'DFS 加已見值集合',
      idea: '每看一個節點，先檢查集合中是否已有它的互補數。',
      steps: ['建立空集合。', 'DFS 每個節點；若 k−val 已在集合，立即回傳 true。', '否則加入 val，繼續左右子樹。'],
      figure: { title: 'root = [5,3,6,2,4,null,7], k = 9', steps: [
        { note: '先到根 5，需要另一個值 4；集合還空，記下 5。', views: [tree(T, { cls: { 0: 'hl' } }), arr([5], { label: '已見值' })] },
        { note: '到左子 3，需要 6；集合沒有，加入 3。', views: [tree(T, { cls: { 1: 'hl' } }), arr([5, 3], { label: '已見值' })] },
        { note: '走到 2，需要 7；仍未見到，加入 2。', views: [tree(T, { cls: { 3: 'hl' } }), arr([5, 3, 2], { label: '已見值' })] },
        { note: '接著到 4，需要 5，集合中已有 5；找到兩個不同節點。', views: [tree(T, { cls: { 0: 'done', 4: 'done' } }), arr([5, 4], { label: '5 + 4 = 9', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每節點走訪一次；集合最多存 n 個值。' },
      verdict: '不依賴 BST 特性，也適用一般二元樹。',
      code: {
        python: `def findTarget(root, k):
    seen = set()
    def visit(node):
        if not node:
            return False
        if k - node.val in seen:
            return True                  # 互補數來自先前的不同節點
        seen.add(node.val)
        return visit(node.left) or visit(node.right)
    return visit(root)`,
        c: `typedef struct Entry653 {
    int value;
    UT_hash_handle hh;
} Entry653;

static bool visit653(struct TreeNode *node, int k, Entry653 **seen) {
    if (!node) {
        return false;
    }
    int wanted = k - node->val;
    Entry653 *found = NULL;
    HASH_FIND_INT(*seen, &wanted, found);
    if (found) {
        return true;
    }
    Entry653 *entry = malloc(sizeof(Entry653));
    entry->value = node->val;
    HASH_ADD_INT(*seen, value, entry);
    return visit653(node->left, k, seen) || visit653(node->right, k, seen);
}

bool findTarget(struct TreeNode *root, int k) {
    Entry653 *seen = NULL;
    bool answer = visit653(root, k, &seen);
    Entry653 *entry, *temp;
    HASH_ITER(hh, seen, entry, temp) {
        HASH_DEL(seen, entry);
        free(entry);
    }
    return answer;
}`,
        cpp: `bool findTarget(TreeNode *root, int k) {
    unordered_set<int> seen;
    function<bool(TreeNode *)> visit = [&](TreeNode *node) {
        if (!node) {
            return false;
        }
        if (seen.count(k - node->val)) {
            return true;
        }
        seen.insert(node->val);
        return visit(node->left) || visit(node->right);
    };
    return visit(root);
}`,
        java: `boolean findTarget(TreeNode root, int k) {
    Set<Integer> seen = new HashSet<>();
    return visit653(root, k, seen);
}

boolean visit653(TreeNode node, int k, Set<Integer> seen) {
    if (node == null) {
        return false;
    }
    if (seen.contains(k - node.val)) {
        return true;
    }
    seen.add(node.val);
    return visit653(node.left, k, seen) || visit653(node.right, k, seen);
}`,
        javascript: `function findTarget(root, k) {
  const seen = new Set();
  function visit(node) {
    if (!node) {
      return false;
    }
    if (seen.has(k - node.val)) {
      return true;
    }
    seen.add(node.val);
    return visit(node.left) || visit(node.right);
  }
  return visit(root);
}`,
      },
    },
    {
      name: '中序排序加雙指標',
      idea: '中序走訪 BST 得遞增陣列，再從兩端往中間找目標和。',
      steps: ['中序走訪收集所有值。', '兩指標分別指向最小與最大值。', '總和太小就左指標右移；太大就右指標左移。'],
      figure: { title: 'root = [5,3,6,2,4,null,7], k = 11', steps: [
        { note: '中序走訪得到 [2,3,4,5,6,7]。', views: [tree(T), arr([2, 3, 4, 5, 6, 7], { label: '中序值' })] },
        { note: '兩端 2+7=9，小於 11，左指標右移。', views: [arr([2, 3, 4, 5, 6, 7], { label: '2 + 7', highlight: [0, 5] })] },
        { note: '3+7=10 仍偏小，再把左指標移到 4。', views: [arr([2, 3, 4, 5, 6, 7], { label: '3 + 7', highlight: [1, 5] })] },
        { note: '4+7=11，找到兩個不同節點，回傳 true。', views: [arr([2, 3, 4, 5, 6, 7], { label: '4 + 7', done: [2, 5] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '中序走訪與雙指標各 O(n)，陣列存 n 個值。' },
      verdict: '能利用 BST 的排序特性，適合練中序遍歷。',
      code: {
        python: `def findTarget(root, k):
    values = []
    def inorder(node):
        if not node:
            return
        inorder(node.left)
        values.append(node.val)          # BST 中序值遞增
        inorder(node.right)
    inorder(root)
    left, right = 0, len(values) - 1
    while left < right:
        total = values[left] + values[right]
        if total == k:
            return True
        if total < k:
            left += 1
        else:
            right -= 1
    return False`,
        c: `static void inorder653(struct TreeNode *node, int *values, int *size) {
    if (!node) {
        return;
    }
    inorder653(node->left, values, size);
    values[(*size)++] = node->val;
    inorder653(node->right, values, size);
}

bool findTarget(struct TreeNode *root, int k) {
    int *values = malloc(10001 * sizeof(int));
    int size = 0;
    inorder653(root, values, &size);
    int left = 0;
    int right = size - 1;
    bool found = false;
    while (left < right) {
        long long total = (long long)values[left] + values[right];
        if (total == k) {
            found = true;
            break;
        }
        if (total < k) {
            left++;
        } else {
            right--;
        }
    }
    free(values);
    return found;
}`,
        cpp: `bool findTarget(TreeNode *root, int k) {
    vector<int> values;
    function<void(TreeNode *)> inorder = [&](TreeNode *node) {
        if (!node) {
            return;
        }
        inorder(node->left);
        values.push_back(node->val);
        inorder(node->right);
    };
    inorder(root);
    int left = 0;
    int right = (int)values.size() - 1;
    while (left < right) {
        long long total = (long long)values[left] + values[right];
        if (total == k) {
            return true;
        }
        if (total < k) {
            left++;
        } else {
            right--;
        }
    }
    return false;
}`,
        java: `boolean findTarget(TreeNode root, int k) {
    List<Integer> values = new ArrayList<>();
    inorder653(root, values);
    int left = 0;
    int right = values.size() - 1;
    while (left < right) {
        long total = (long)values.get(left) + values.get(right);
        if (total == k) {
            return true;
        }
        if (total < k) {
            left++;
        } else {
            right--;
        }
    }
    return false;
}

void inorder653(TreeNode node, List<Integer> values) {
    if (node == null) {
        return;
    }
    inorder653(node.left, values);
    values.add(node.val);
    inorder653(node.right, values);
}`,
        javascript: `function findTarget(root, k) {
  const values = [];
  function inorder(node) {
    if (!node) {
      return;
    }
    inorder(node.left);
    values.push(node.val);
    inorder(node.right);
  }
  inorder(root);
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    const total = values[left] + values[right];
    if (total === k) {
      return true;
    }
    if (total < k) {
      left++;
    } else {
      right--;
    }
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['同一個節點不能用兩次，所以雙指標必須 left < right。', '樹值可能為負；不要假設只含正數。'],
  check: { kind: 'fn', fn: 'findTarget', argKinds: ['tree', null], cases: [
    { args: [T, 9], out: true }, { args: [T, 28], out: false }, { args: [[2, 1, 3], 4], out: true }, { args: [[1], 2], out: false },
  ] },
}
