import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [1, 2, 3, 4, 5, 6, 7]

function postFig(): FigStep[] {
  return [
    { note: '準備刪除 3 與 5。先往葉子走；4、6、7 都不在刪除清單，先保留。', views: [tree(T, { cls: { 4: 'dim', 2: 'dim' } }), arr([3, 5], { label: '刪除值' })] },
    { note: '走到 5：它要刪除，父節點 2 的右指標要設為空。', views: [tree([1, 2, 3, 4, null, 6, 7], { cls: { 1: 'hl' } })] },
    { note: '走到 3：它要刪除，而保留下來的孩子 6、7 各自成為新樹的根。', views: [tree([1, 2, null, 4]), tree([6]), tree([7])] },
    { note: '原根 1 沒被刪除，也放進森林；最後三棵樹的根是 1、6、7。', views: [arr([1, 6, 7], { label: '森林的根', done: [0, 1, 2] })] },
  ]
}

function rootFig(): FigStep[] {
  return [
    { note: '從根 1 開始，它不是刪除節點，而且目前是新樹的起點，因此收進森林。', views: [tree(T, { cls: { 0: 'hl' } }), arr([1], { label: '森林的根' })] },
    { note: '走到 2 時仍屬於 1 的樹；走到 5 時刪除它，並與父節點斷開。', views: [tree([1, 2, 3, 4, null, 6, 7], { cls: { 1: 'hl' } })] },
    { note: '走到 3 時也刪除它；接下來它的左右孩子都被視為「新樹起點」。', views: [tree([1, 2, null, 4]), arr([1], { label: '已有的根' })] },
    { note: '6、7 沒被刪除，且都是新樹起點，加入後根集合是 1、6、7。', views: [arr([1, 6, 7], { label: '森林的根', done: [0, 1, 2] })] },
  ]
}

export const q1110: Solution = {
  id: 1110,
  plain: '從一棵樹裡刪掉指定節點，斷開後剩下幾棵樹，就把它們全部回傳。',
  statement: '給二元樹 root 與待刪值 to_delete。刪除這些節點和相連邊後，回傳剩餘樹的所有根；森林順序不限。',
  examples: [
    { input: 'root = [1,2,3,4,5,6,7], to_delete = [3,5]', output: '[[1,2,null,4],[6],[7]]' },
    { input: 'root = [1,2,4,null,3], to_delete = [3]', output: '[[1,2,4]]' },
  ],
  constraints: ['節點數 1 到 1000；所有節點值互不相同且在 1 到 1000 之間。'],
  insight: ['刪除一個節點時，它未被刪除的孩子可能成為新樹根。', '用集合快速查詢待刪值；後序回傳可讓父節點直接接上修剪後的孩子。'],
  approaches: [
    {
      name: '後序刪除，收集斷開的孩子',
      idea: '孩子先返回修剪結果；若目前節點要刪，就把仍存在的孩子加入森林。',
      steps: ['將待刪值放進集合。', '後序遞迴，更新目前節點的左右指標。', '若目前要刪，將保留的孩子加入森林並回傳空。', '根若未刪，也加入森林。'],
      figure: { title: '刪除 3、5 後的森林', steps: postFig() },
      complexity: { time: 'O(n + d)', space: 'O(n + d)', why: '每個節點走一次，另存刪除集合、遞迴堆疊及森林根。' },
      verdict: '父節點能直接知道哪條邊需要斷開。',
      code: {
        python: `def delNodes(root, to_delete):
    removed = set(to_delete)
    forest = []

    def visit(node):
        if not node:
            return None
        node.left = visit(node.left)
        node.right = visit(node.right)
        if node.val in removed:
            if node.left:
                forest.append(node.left)    # 保留的孩子成為新根
            if node.right:
                forest.append(node.right)
            return None                     # 父節點斷開這條邊
        return node

    root = visit(root)
    if root:
        forest.append(root)
    return forest

def forestCheck(root, to_delete):
    return sorted(node.val for node in delNodes(root, to_delete))`,
        c: `static struct TreeNode *deleteVisit(struct TreeNode *node, bool *removed, struct TreeNode **forest, int *size) {
    if (node == NULL) {
        return NULL;
    }
    node->left = deleteVisit(node->left, removed, forest, size);
    node->right = deleteVisit(node->right, removed, forest, size);
    if (removed[node->val]) {
        if (node->left != NULL) {
            forest[(*size)++] = node->left;
        }
        if (node->right != NULL) {
            forest[(*size)++] = node->right;
        }
        return NULL;
    }
    return node;
}

struct TreeNode **delNodes(struct TreeNode *root, int *to_delete, int to_deleteSize, int *returnSize) {
    bool removed[1001] = {false};
    for (int i = 0; i < to_deleteSize; i++) {
        removed[to_delete[i]] = true;
    }
    struct TreeNode **forest = malloc(1000 * sizeof(struct TreeNode *));
    *returnSize = 0;
    root = deleteVisit(root, removed, forest, returnSize);
    if (root != NULL) {
        forest[(*returnSize)++] = root;
    }
    return forest;
}

static int compareRoots(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int *forestCheck(struct TreeNode *root, int *to_delete, int to_deleteSize, int *returnSize) {
    struct TreeNode **forest = delNodes(root, to_delete, to_deleteSize, returnSize);
    int *values = malloc((*returnSize + 1) * sizeof(int));
    for (int i = 0; i < *returnSize; i++) {
        values[i] = forest[i]->val;
    }
    qsort(values, *returnSize, sizeof(int), compareRoots);
    free(forest);
    return values;
}`,
        cpp: `TreeNode *deleteVisit(TreeNode *node, unordered_set<int>& removed, vector<TreeNode*>& forest) {
    if (node == nullptr) {
        return nullptr;
    }
    node->left = deleteVisit(node->left, removed, forest);
    node->right = deleteVisit(node->right, removed, forest);
    if (removed.count(node->val)) {
        if (node->left != nullptr) {
            forest.push_back(node->left);
        }
        if (node->right != nullptr) {
            forest.push_back(node->right);
        }
        return nullptr;
    }
    return node;
}

vector<TreeNode*> delNodes(TreeNode *root, vector<int>& to_delete) {
    unordered_set<int> removed(to_delete.begin(), to_delete.end());
    vector<TreeNode*> forest;
    root = deleteVisit(root, removed, forest);
    if (root != nullptr) {
        forest.push_back(root);
    }
    return forest;
}

vector<int> forestCheck(TreeNode *root, vector<int> to_delete) {
    vector<int> values;
    for (TreeNode *node : delNodes(root, to_delete)) {
        values.push_back(node->val);
    }
    sort(values.begin(), values.end());
    return values;
}`,
        java: `TreeNode deleteVisit(TreeNode node, Set<Integer> removed, List<TreeNode> forest) {
    if (node == null) {
        return null;
    }
    node.left = deleteVisit(node.left, removed, forest);
    node.right = deleteVisit(node.right, removed, forest);
    if (removed.contains(node.val)) {
        if (node.left != null) {
            forest.add(node.left);
        }
        if (node.right != null) {
            forest.add(node.right);
        }
        return null;
    }
    return node;
}

List<TreeNode> delNodes(TreeNode root, int[] to_delete) {
    Set<Integer> removed = new HashSet<>();
    for (int value : to_delete) {
        removed.add(value);
    }
    List<TreeNode> forest = new ArrayList<>();
    root = deleteVisit(root, removed, forest);
    if (root != null) {
        forest.add(root);
    }
    return forest;
}

int[] forestCheck(TreeNode root, int[] to_delete) {
    List<TreeNode> forest = delNodes(root, to_delete);
    int[] values = new int[forest.size()];
    for (int i = 0; i < forest.size(); i++) {
        values[i] = forest.get(i).val;
    }
    Arrays.sort(values);
    return values;
}`,
        javascript: `function delNodes(root, to_delete) {
  const removed = new Set(to_delete);
  const forest = [];
  function visit(node) {
    if (node === null) {
      return null;
    }
    node.left = visit(node.left);
    node.right = visit(node.right);
    if (removed.has(node.val)) {
      if (node.left !== null) {
        forest.push(node.left);
      }
      if (node.right !== null) {
        forest.push(node.right);
      }
      return null;
    }
    return node;
  }
  root = visit(root);
  if (root !== null) {
    forest.push(root);
  }
  return forest;
}

function forestCheck(root, to_delete) {
  return delNodes(root, to_delete).map((node) => node.val).sort((a, b) => a - b);
}`,
      },
    },
    {
      name: '追蹤是否為新樹起點',
      idea: '遞迴時傳入 isRoot；被刪節點的孩子都變成新樹起點。',
      steps: ['根節點以 isRoot = true 開始。', '當前節點未刪且 isRoot 為 true，就收進森林。', '遞迴孩子時，若當前要刪，孩子的 isRoot 設為 true。', '被刪節點回傳空，讓父節點斷開。'],
      figure: { title: '標記新的樹根', steps: rootFig() },
      complexity: { time: 'O(n + d)', space: 'O(n + d)', why: '每個節點只處理一次；集合和森林根另佔空間。' },
      verdict: '清楚表達「刪除節點會產生新根」的規則。',
      code: {
        python: `def delNodes(root, to_delete):
    removed = set(to_delete)
    forest = []

    def visit(node, is_root):
        if not node:
            return None
        deleted = node.val in removed
        if is_root and not deleted:
            forest.append(node)          # 新樹的根
        node.left = visit(node.left, deleted)
        node.right = visit(node.right, deleted)
        return None if deleted else node

    visit(root, True)
    return forest

def forestCheck(root, to_delete):
    return sorted(node.val for node in delNodes(root, to_delete))`,
        c: `static struct TreeNode *rootVisit(struct TreeNode *node, bool isRoot, bool *removed, struct TreeNode **forest, int *size) {
    if (node == NULL) {
        return NULL;
    }
    bool deleted = removed[node->val];
    if (isRoot && !deleted) {
        forest[(*size)++] = node;
    }
    node->left = rootVisit(node->left, deleted, removed, forest, size);
    node->right = rootVisit(node->right, deleted, removed, forest, size);
    return deleted ? NULL : node;
}

struct TreeNode **delNodes(struct TreeNode *root, int *to_delete, int to_deleteSize, int *returnSize) {
    bool removed[1001] = {false};
    for (int i = 0; i < to_deleteSize; i++) {
        removed[to_delete[i]] = true;
    }
    struct TreeNode **forest = malloc(1000 * sizeof(struct TreeNode *));
    *returnSize = 0;
    rootVisit(root, true, removed, forest, returnSize);
    return forest;
}

static int compareRoots(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int *forestCheck(struct TreeNode *root, int *to_delete, int to_deleteSize, int *returnSize) {
    struct TreeNode **forest = delNodes(root, to_delete, to_deleteSize, returnSize);
    int *values = malloc((*returnSize + 1) * sizeof(int));
    for (int i = 0; i < *returnSize; i++) {
        values[i] = forest[i]->val;
    }
    qsort(values, *returnSize, sizeof(int), compareRoots);
    free(forest);
    return values;
}`,
        cpp: `TreeNode *rootVisit(TreeNode *node, bool isRoot, unordered_set<int>& removed, vector<TreeNode*>& forest) {
    if (node == nullptr) {
        return nullptr;
    }
    bool deleted = removed.count(node->val) > 0;
    if (isRoot && !deleted) {
        forest.push_back(node);
    }
    node->left = rootVisit(node->left, deleted, removed, forest);
    node->right = rootVisit(node->right, deleted, removed, forest);
    return deleted ? nullptr : node;
}

vector<TreeNode*> delNodes(TreeNode *root, vector<int>& to_delete) {
    unordered_set<int> removed(to_delete.begin(), to_delete.end());
    vector<TreeNode*> forest;
    rootVisit(root, true, removed, forest);
    return forest;
}

vector<int> forestCheck(TreeNode *root, vector<int> to_delete) {
    vector<int> values;
    for (TreeNode *node : delNodes(root, to_delete)) {
        values.push_back(node->val);
    }
    sort(values.begin(), values.end());
    return values;
}`,
        java: `TreeNode rootVisit(TreeNode node, boolean isRoot, Set<Integer> removed, List<TreeNode> forest) {
    if (node == null) {
        return null;
    }
    boolean deleted = removed.contains(node.val);
    if (isRoot && !deleted) {
        forest.add(node);
    }
    node.left = rootVisit(node.left, deleted, removed, forest);
    node.right = rootVisit(node.right, deleted, removed, forest);
    return deleted ? null : node;
}

List<TreeNode> delNodes(TreeNode root, int[] to_delete) {
    Set<Integer> removed = new HashSet<>();
    for (int value : to_delete) {
        removed.add(value);
    }
    List<TreeNode> forest = new ArrayList<>();
    rootVisit(root, true, removed, forest);
    return forest;
}

int[] forestCheck(TreeNode root, int[] to_delete) {
    List<TreeNode> forest = delNodes(root, to_delete);
    int[] values = new int[forest.size()];
    for (int i = 0; i < forest.size(); i++) {
        values[i] = forest.get(i).val;
    }
    Arrays.sort(values);
    return values;
}`,
        javascript: `function delNodes(root, to_delete) {
  const removed = new Set(to_delete);
  const forest = [];
  function visit(node, isRoot) {
    if (node === null) {
      return null;
    }
    const deleted = removed.has(node.val);
    if (isRoot && !deleted) {
      forest.push(node);
    }
    node.left = visit(node.left, deleted);
    node.right = visit(node.right, deleted);
    return deleted ? null : node;
  }
  visit(root, true);
  return forest;
}

function forestCheck(root, to_delete) {
  return delNodes(root, to_delete).map((node) => node.val).sort((a, b) => a - b);
}`,
      },
    },
  ],
  pitfalls: ['森林的順序不限，包裝函式把根值排序後比較。', '刪除根節點時，尚未刪除的孩子也可能成為新根。'],
  check: {
    kind: 'fn',
    fn: 'forestCheck',
    argKinds: ['tree', null],
    cases: [
      { args: [T, [3, 5]], out: [1, 6, 7] },
      { args: [[1, 2, 4, null, 3], [3]], out: [1] },
      { args: [[1], [1]], out: [] },
    ],
  },
}
