import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 103. Binary Tree Zigzag Level Order Traversal

const T = [3, 9, 20, null, null, 15, 7]

function bfsFig(): FigStep[] {
  return [
    { note: '「之」字形:第 1 層左 → 右、第 2 層右 → 左、第 3 層又左 → 右……先照一般的層序走訪([102](#/q/102))收集每一層', views: [tree(T)] },
    { note: '第 1 層 [3];第 2 層照順序是 [9, 20],這層要反過來 → [20, 9]', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } }), arr([20, 9], { label: '第 2 層(反轉)' })] },
    { note: '第 3 層 [15, 7] 不用反轉。答案 [[3], [20, 9], [15, 7]]', views: [tree(T, { cls: { 5: 'done', 6: 'done' } })] },
  ]
}

function dequeFig(): FigStep[] {
  return [
    { note: '不想事後反轉:每層準備一個雙端佇列。左 → 右的層從尾巴加入;右 → 左的層從**頭**加入', views: [arr(['加在頭', '20', '9'], { label: '第 2 層:先遇到 9、再遇到 20' })] },
    { note: '9 先放進去,20 再放到頭前面 → [20, 9]。走訪順序都是一般的左到右,只有「放的位置」不同', views: [arr([20, 9], { label: '第 2 層', done: [0, 1] })] },
  ]
}

export const q0103: Solution = {
  id: 103,
  plain: '一層一層讀一棵樹,但方向要來回交替:第一層從左讀到右,第二層從右讀到左,第三層又從左到右……像蛇一樣蜿蜒。',
  statement: '給二元樹的根 `root`,回傳節點值的**之字形層序走訪**(第一層由左到右,下一層由右到左,依此交替)。',
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[20,9],[15,7]]' },
    { input: 'root = [1]', output: '[[1]]' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['節點數 ≤ 2000'],
  insight: ['就是 [102](#/q/102) 的層序走訪,只是奇數層(0 起算的第 1、3…層)要反過來', '可以收集完再反轉,或用雙端佇列在加入時決定放頭還是放尾'],
  approaches: [
    {
      name: '層序走訪 + 奇數層反轉',
      idea: 'BFS 一層一層收集;第 d 層若 d 是奇數就反轉再放進答案。',
      steps: ['`q = [root]`、`d = 0`', '每層:取出整層的值成 `row`', '`d` 是奇數 → `row.reverse()`', '加入答案,`d += 1`'],
      figure: { title: `root = [${T}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每個節點進出佇列一次;反轉的總成本也是 O(n)。' },
      verdict: '最推薦,在熟悉的層序走訪上加一行。',
      code: {
        python: `from collections import deque

def zigzagLevelOrder(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        row = []
        for _ in range(len(q)):
            n = q.popleft()
            row.append(n.val)
            if n.left:
                q.append(n.left)
            if n.right:
                q.append(n.right)
        if len(res) % 2 == 1:
            row.reverse()                     # 奇數層:右到左
        res.append(row)
    return res`,
        c: `int **zigzagLevelOrder(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    int **res = malloc(2005 * sizeof(int *));
    *returnColumnSizes = malloc(2005 * sizeof(int));
    *returnSize = 0;
    if (!root) return res;
    struct TreeNode *q[2005];
    int h = 0, t = 0;
    q[t++] = root;
    while (h < t) {
        int end = t, k = 0, d = *returnSize;
        int *row = malloc((end - h) * sizeof(int));
        for (; h < end; h++) {
            row[k++] = q[h]->val;
            if (q[h]->left) q[t++] = q[h]->left;
            if (q[h]->right) q[t++] = q[h]->right;
        }
        if (d % 2) for (int i = 0, j = k - 1; i < j; i++, j--) { int x = row[i]; row[i] = row[j]; row[j] = x; }
        res[d] = row;
        (*returnColumnSizes)[(*returnSize)++] = k;
    }
    return res;
}`,
        cpp: `vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        vector<int> row;
        for (int k = q.size(); k > 0; k--) {
            TreeNode *n = q.front(); q.pop();
            row.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        if (res.size() % 2) reverse(row.begin(), row.end());
        res.push_back(row);
    }
    return res;
}`,
        java: `List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Deque<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        List<Integer> row = new ArrayList<>();
        for (int k = q.size(); k > 0; k--) {
            TreeNode n = q.poll();
            row.add(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        if (res.size() % 2 == 1) Collections.reverse(row);
        res.add(row);
    }
    return res;
}`,
        javascript: `function zigzagLevelOrder(root) {
  if (!root) return [];
  const res = [];
  let level = [root];
  while (level.length) {
    const row = level.map((n) => n.val), next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    if (res.length % 2) row.reverse();
    res.push(row);
    level = next;
  }
  return res;
}`,
      },
    },
    {
      name: '雙端佇列:依方向決定放頭或放尾',
      idea: '走訪順序照舊(左到右),但每層的結果用雙端佇列收集:偶數層 append,奇數層 appendleft。',
      steps: ['每層建一個空的 `row`(deque)', '取出節點 n:偶數層 `row.append(n.val)`;奇數層 `row.appendleft(n.val)`', '孩子照常左、右入隊', '`list(row)` 放進答案'],
      figure: { title: `root = [${T}]`, steps: dequeFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: '兩端插入都是 O(1)。' },
      verdict: '一步到位,不用事後反轉。',
      code: {
        python: `from collections import deque

def zigzagLevelOrder(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        row = deque()
        for _ in range(len(q)):
            n = q.popleft()
            if len(res) % 2 == 0:
                row.append(n.val)
            else:
                row.appendleft(n.val)         # 奇數層:放到前面,自然就反過來了
            if n.left:
                q.append(n.left)
            if n.right:
                q.append(n.right)
        res.append(list(row))
    return res`,
        c: `int **zigzagLevelOrder(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    int **res = malloc(2005 * sizeof(int *));
    *returnColumnSizes = malloc(2005 * sizeof(int));
    *returnSize = 0;
    if (!root) return res;
    struct TreeNode *q[2005];
    int h = 0, t = 0;
    q[t++] = root;
    while (h < t) {
        int end = t, cnt = end - h, d = *returnSize;
        int *row = malloc(cnt * sizeof(int));
        for (int k = 0; h < end; h++, k++) {
            row[d % 2 ? cnt - 1 - k : k] = q[h]->val;   // 奇數層從後面往前填
            if (q[h]->left) q[t++] = q[h]->left;
            if (q[h]->right) q[t++] = q[h]->right;
        }
        res[d] = row;
        (*returnColumnSizes)[(*returnSize)++] = cnt;
    }
    return res;
}`,
        cpp: `vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        deque<int> row;
        bool rev = res.size() % 2;
        for (int k = q.size(); k > 0; k--) {
            TreeNode *n = q.front(); q.pop();
            if (rev) row.push_front(n->val); else row.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        res.emplace_back(row.begin(), row.end());
    }
    return res;
}`,
        java: `List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Deque<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        LinkedList<Integer> row = new LinkedList<>();
        boolean rev = res.size() % 2 == 1;
        for (int k = q.size(); k > 0; k--) {
            TreeNode n = q.poll();
            if (rev) row.addFirst(n.val); else row.addLast(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        res.add(row);
    }
    return res;
}`,
        javascript: `function zigzagLevelOrder(root) {
  if (!root) return [];
  const res = [];
  let level = [root];
  while (level.length) {
    const rev = res.length % 2 === 1, row = new Array(level.length), next = [];
    level.forEach((n, k) => {
      row[rev ? level.length - 1 - k : k] = n.val;
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    });
    res.push(row);
    level = next;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['反過來的時候把「孩子入隊的順序」也反過來:會讓下一層亂掉。走訪順序固定,只改輸出順序', '空樹要回傳 []'],
  check: {
    kind: 'fn',
    fn: 'zigzagLevelOrder',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: [[3], [20, 9], [15, 7]] },
      { args: [[1]], out: [[1]] },
      { args: [[]], out: [] },
      { args: [[1, 2, 3, 4, null, null, 5]], out: [[1], [3, 2], [4, 5]] },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9]], out: [[1], [3, 2], [4, 5, 6, 7], [9, 8]] },
    ],
  },
}
