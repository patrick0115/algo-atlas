import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { Solution } from './types'

// 987. Vertical Order Traversal of a Binary Tree
const T = [1, 2, 3, 4, 6, 5, 7]

export const q0987: Solution = {
  id: 987,
  plain: '從左到右看樹的垂直欄位。每欄先列較高的節點；若同欄又同高度，數值小的先列。',
  statement: '根座標為 (列 0, 欄 0)，左孩子往下一列、左一欄，右孩子往下一列、右一欄。回傳由左欄到右欄的垂直走訪；同欄按列升序、同座標按節點值升序。',
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '[[9],[3,15],[20],[7]]' },
    { input: 'root = [1,2,3,4,6,5,7]', output: '[[4],[2],[1,5,6],[3],[7]]', note: '5 和 6 同座標，5 必須在前。' },
  ],
  constraints: ['節點數介於 1 到 1000；節點值介於 0 到 1000。'],
  insight: ['給每個節點標上 (欄、列、值)，排序鍵依序是欄、列、值。', '一般 BFS 只保證列順序；同座標的節點仍需依值排序。'],
  approaches: [
    {
      name: 'BFS 收集座標後排序',
      idea: '層序走訪時記錄每個節點的欄、列、值，最後依三個鍵排序並分欄。',
      steps: ['將根與 (欄 0, 列 0) 放入佇列。', '彈出節點並記錄三元組；左孩子欄減一，右孩子欄加一，列都加一。', '按欄、列、值排序。', '連續同欄的值收進同一個輸出陣列。'],
      figure: { title: 'root = [1,2,3,4,6,5,7]', steps: [
        { note: '根 1 在欄 0、列 0；左孩子 2 在欄 −1，右孩子 3 在欄 +1。', views: [tree(T, { cls: { 0: 'done', 1: 'hl', 2: 'hl' }, subs: { 0: '(0,0)', 1: '(−1,1)', 2: '(1,1)' } })] },
        { note: '下一層：4 在欄 −2，6 與 5 都在欄 0、列 2，7 在欄 +2。', views: [tree(T, { cls: { 3: 'hl', 4: 'hl', 5: 'hl', 6: 'hl' }, subs: { 3: '(−2,2)', 4: '(0,2)', 5: '(0,2)', 6: '(2,2)' } })] },
        { note: '按欄、列、值排序；同座標的 5 比 6 小，所以 5 先於 6。', views: [arr([4, 2, 1, 5, 6, 3, 7], { label: '排序後的節點值', highlight: [3, 4] })] },
        { note: '把相同欄放一起，得到 [4]、[2]、[1,5,6]、[3]、[7]。', views: [arr([-2, -1, 0, 0, 0, 1, 2], { label: '對應欄位', done: [0, 1, 2, 3, 4, 5, 6] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '收集 n 筆資料後排序。' },
      verdict: '排序鍵直接對應題目的三層規則，最不易漏掉同座標比值。',
      code: {
        python: `from collections import deque

def verticalTraversal(root):
    items = []
    queue = deque([(root, 0, 0)])
    while queue:
        node, row, col = queue.popleft()
        items.append((col, row, node.val))  # 排序鍵：欄、列、值
        if node.left:
            queue.append((node.left, row + 1, col - 1))
        if node.right:
            queue.append((node.right, row + 1, col + 1))
    items.sort()
    result = []
    last_col = None
    for col, row, value in items:
        if col != last_col:
            result.append([])
            last_col = col
        result[-1].append(value)
    return result`,
        c: `typedef struct { struct TreeNode *node; int row, col; } Entry;
typedef struct { int col, row, val; } Item;

static int compareItem(const void *a, const void *b) {
    const Item *x = a;
    const Item *y = b;
    if (x->col != y->col) {
        return (x->col > y->col) - (x->col < y->col);
    }
    if (x->row != y->row) {
        return (x->row > y->row) - (x->row < y->row);
    }
    return (x->val > y->val) - (x->val < y->val);
}

int **verticalTraversal(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    Entry queue[1000];
    Item items[1000];
    int head = 0;
    int tail = 0;
    queue[tail++] = (Entry){root, 0, 0};
    while (head < tail) {
        Entry cur = queue[head++];
        items[head - 1] = (Item){cur.col, cur.row, cur.node->val};
        if (cur.node->left) {
            queue[tail++] = (Entry){cur.node->left, cur.row + 1, cur.col - 1};
        }
        if (cur.node->right) {
            queue[tail++] = (Entry){cur.node->right, cur.row + 1, cur.col + 1};
        }
    }
    qsort(items, tail, sizeof(Item), compareItem);
    int **result = malloc(tail * sizeof(int *));
    *returnColumnSizes = calloc(tail, sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < tail; i++) {
        if (i == 0 || items[i].col != items[i - 1].col) {
            result[*returnSize] = malloc(tail * sizeof(int));
            (*returnSize)++;
        }
        int group = *returnSize - 1;
        result[group][(*returnColumnSizes)[group]++] = items[i].val;
    }
    return result;
}`,
        cpp: `vector<vector<int>> verticalTraversal(TreeNode* root) {
    vector<tuple<int, int, int>> items;
    queue<tuple<TreeNode*, int, int>> todo;
    todo.push({root, 0, 0});
    while (!todo.empty()) {
        auto [node, row, col] = todo.front();
        todo.pop();
        items.push_back({col, row, node->val});
        if (node->left) {
            todo.push({node->left, row + 1, col - 1});
        }
        if (node->right) {
            todo.push({node->right, row + 1, col + 1});
        }
    }
    sort(items.begin(), items.end());
    vector<vector<int>> result;
    int lastCol = INT_MIN;
    for (auto [col, row, value] : items) {
        if (col != lastCol) {
            result.push_back({});
            lastCol = col;
        }
        result.back().push_back(value);
    }
    return result;
}`,
        java: `List<List<Integer>> verticalTraversal(TreeNode root) {
    List<int[]> items = new ArrayList<>();
    Deque<Object[]> queue = new ArrayDeque<>();
    queue.add(new Object[]{root, 0, 0});
    while (!queue.isEmpty()) {
        Object[] entry = queue.remove();
        TreeNode node = (TreeNode) entry[0];
        int row = (int) entry[1];
        int col = (int) entry[2];
        items.add(new int[]{col, row, node.val});
        if (node.left != null) {
            queue.add(new Object[]{node.left, row + 1, col - 1});
        }
        if (node.right != null) {
            queue.add(new Object[]{node.right, row + 1, col + 1});
        }
    }
    items.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : a[1] != b[1] ? Integer.compare(a[1], b[1]) : Integer.compare(a[2], b[2]));
    List<List<Integer>> result = new ArrayList<>();
    int lastCol = Integer.MIN_VALUE;
    for (int[] item : items) {
        if (item[0] != lastCol) {
            result.add(new ArrayList<>());
            lastCol = item[0];
        }
        result.get(result.size() - 1).add(item[2]);
    }
    return result;
}`,
        javascript: `function verticalTraversal(root) {
  const items = [];
  const queue = [[root, 0, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [node, row, col] = queue[head];
    items.push([col, row, node.val]);
    if (node.left) {
      queue.push([node.left, row + 1, col - 1]);
    }
    if (node.right) {
      queue.push([node.right, row + 1, col + 1]);
    }
  }
  items.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const result = [];
  let lastCol = null;
  for (const [col, row, value] of items) {
    if (col !== lastCol) {
      result.push([]);
      lastCol = col;
    }
    result[result.length - 1].push(value);
  }
  return result;
}`,
      },
    },
    {
      name: 'DFS 分欄收集，再排序欄內資料',
      idea: '遞迴時把 (列、值) 放進對應欄；最後由最左欄到最右欄，逐欄按列和值排序。',
      steps: ['DFS(root,0,0)，走左孩子欄減一、走右孩子欄加一。', '以欄作鍵收集每個節點的 (列、值)。', '欄鍵由小到大排序，每欄資料按 (列、值) 排序。', '輸出每欄的值。'],
      figure: { title: 'root = [1,2,3,4,6,5,7]', steps: [
        { note: 'DFS 左半部收集欄 −2 的 4、欄 −1 的 2、欄 0 的 6。', views: [tree(T, { cls: { 1: 'done', 3: 'done', 4: 'done' } })] },
        { note: '走右半部後，欄 0 還加入 5；它和 6 都在列 2。', views: [tree(T, { cls: { 5: 'hl', 4: 'hl' }, subs: { 4: '(0,2)', 5: '(0,2)' } })] },
        { note: '欄 0 收到 (0,1)、(2,6)、(2,5)；按列和值排序成 1、5、6。', views: [arr([1, 5, 6], { label: '欄 0 排序後', done: [0, 1, 2] })] },
        { note: '欄 −2 到 +2 依序輸出：[4]、[2]、[1,5,6]、[3]、[7]。', views: [arr([-2, -1, 0, 0, 0, 1, 2], { label: '輸出欄位', done: [0, 1, 2, 3, 4, 5, 6] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: 'DFS 走 n 個節點；各欄合計排序至多 n log n。' },
      verdict: '分欄概念直觀，但每欄仍要按列與值排序。',
      code: {
        python: `from collections import defaultdict

def verticalTraversal(root):
    columns = defaultdict(list)

    def dfs(node, row, col):
        if not node:
            return
        columns[col].append((row, node.val))  # 每欄保存列和值
        dfs(node.left, row + 1, col - 1)
        dfs(node.right, row + 1, col + 1)

    dfs(root, 0, 0)
    return [[value for row, value in sorted(columns[col])] for col in sorted(columns)]`,
        c: `typedef struct { int col, row, val; } Item;

static void collect(struct TreeNode *node, int row, int col, Item *items, int *count) {
    if (!node) {
        return;
    }
    items[(*count)++] = (Item){col, row, node->val};
    collect(node->left, row + 1, col - 1, items, count);
    collect(node->right, row + 1, col + 1, items, count);
}

static int compareItem(const void *a, const void *b) {
    const Item *x = a;
    const Item *y = b;
    if (x->col != y->col) {
        return (x->col > y->col) - (x->col < y->col);
    }
    if (x->row != y->row) {
        return (x->row > y->row) - (x->row < y->row);
    }
    return (x->val > y->val) - (x->val < y->val);
}

int **verticalTraversal(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    Item items[1000];
    int count = 0;
    collect(root, 0, 0, items, &count);
    qsort(items, count, sizeof(Item), compareItem);
    int **result = malloc(count * sizeof(int *));
    *returnColumnSizes = calloc(count, sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < count; i++) {
        if (i == 0 || items[i].col != items[i - 1].col) {
            result[*returnSize] = malloc(count * sizeof(int));
            (*returnSize)++;
        }
        int group = *returnSize - 1;
        result[group][(*returnColumnSizes)[group]++] = items[i].val;
    }
    return result;
}`,
        cpp: `vector<vector<int>> verticalTraversal(TreeNode* root) {
    map<int, vector<pair<int, int>>> columns;
    auto dfs = [&](auto&& self, TreeNode* node, int row, int col) -> void {
        if (!node) {
            return;
        }
        columns[col].push_back({row, node->val});
        self(self, node->left, row + 1, col - 1);
        self(self, node->right, row + 1, col + 1);
    };
    dfs(dfs, root, 0, 0);
    vector<vector<int>> result;
    for (auto& [col, entries] : columns) {
        sort(entries.begin(), entries.end());
        result.push_back({});
        for (auto [row, value] : entries) {
            result.back().push_back(value);
        }
    }
    return result;
}`,
        java: `List<List<Integer>> verticalTraversal(TreeNode root) {
    Map<Integer, List<int[]>> columns = new TreeMap<>();
    collect(root, 0, 0, columns);
    List<List<Integer>> result = new ArrayList<>();
    for (List<int[]> entries : columns.values()) {
        entries.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
        List<Integer> values = new ArrayList<>();
        for (int[] entry : entries) {
            values.add(entry[1]);
        }
        result.add(values);
    }
    return result;
}

private void collect(TreeNode node, int row, int col, Map<Integer, List<int[]>> columns) {
    if (node == null) {
        return;
    }
    columns.computeIfAbsent(col, key -> new ArrayList<>()).add(new int[]{row, node.val});
    collect(node.left, row + 1, col - 1, columns);
    collect(node.right, row + 1, col + 1, columns);
}`,
        javascript: `function verticalTraversal(root) {
  const columns = new Map();
  function dfs(node, row, col) {
    if (!node) {
      return;
    }
    if (!columns.has(col)) {
      columns.set(col, []);
    }
    columns.get(col).push([row, node.val]);
    dfs(node.left, row + 1, col - 1);
    dfs(node.right, row + 1, col + 1);
  }
  dfs(root, 0, 0);
  const result = [];
  for (const col of [...columns.keys()].sort((a, b) => a - b)) {
    const entries = columns.get(col).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    result.push(entries.map((entry) => entry[1]));
  }
  return result;
}`,
      },
    },
  ],
  pitfalls: ['同欄同列必須按數值排序；單靠 BFS 的入佇列順序會把 6 排在 5 前面。', '輸出順序先比欄，再比列，最後才比值。'],
  check: { kind: 'fn', fn: 'verticalTraversal', argKinds: ['tree'], cases: [
    { args: [[3, 9, 20, null, null, 15, 7]], out: [[9], [3, 15], [20], [7]] },
    { args: [T], out: [[4], [2], [1, 5, 6], [3], [7]] },
    { args: [[1]], out: [[1]] },
  ] },
}
