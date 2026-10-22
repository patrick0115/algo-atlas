import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 102. Binary Tree Level Order Traversal

const T = [3, 9, 20, 4, null, 15, 7]

function bfsFig(): FigStep[] {
  const root = buildTree(T)!
  const q: FNode[] = [root]
  const res: number[][] = []
  const done: Record<number, string> = {}
  const out: FigStep[] = [{ note: '用佇列(先進先出)一層一層走。關鍵:每一層開始前,先記下「佇列裡現在有幾個」—— 剛好就是這一層的節點數', views: [tree(T), arr(q.map((n) => n.val), { label: '佇列' })] }]
  while (q.length) {
    const size = q.length
    const level: number[] = []
    out.push({ note: `新的一層開始,佇列裡有 ${size} 個 → 這一層就是它們 [${q.map((n) => n.val).join(', ')}]`, views: [tree(T, { cls: { ...done, ...Object.fromEntries(q.map((n) => [n.i, 'hl'])) } }), arr(q.map((n) => n.val), { label: '佇列', highlight: q.map((_, i) => i) })] })
    for (let k = 0; k < size; k++) {
      const n = q.shift()!
      level.push(n.val)
      done[n.i] = 'done'
      if (n.left) q.push(n.left)
      if (n.right) q.push(n.right)
    }
    res.push(level)
    out.push({ note: `拿出這 ${size} 個,收進答案 [${level.join(', ')}],它們的孩子排到佇列後面`, views: [tree(T, { cls: { ...done } }), arr(q.map((n) => n.val), { label: '佇列(下一層)' }), arr(res.map((l) => `[${l.join(',')}]`), { label: '答案' })] })
  }
  return out
}

function dfsFig(): FigStep[] {
  const root = buildTree(T)
  const res: number[][] = []
  const out: FigStep[] = [{ note: '也可以用 DFS:遞迴時帶著「現在第幾層」,把節點放進 res[depth]。前序(先左後右)保證同一層由左到右', views: [tree(T)] }]
  const go = (n: FNode | null, d: number) => {
    if (!n) return
    if (res.length === d) res.push([])
    res[d].push(n.val)
    out.push({ note: `節點 ${n.val} 在第 ${d} 層 → 放進 res[${d}]`, views: [tree(T, { cls: { [n.i]: 'hl' }, subs: { [n.i]: `第${d}層` } }), arr(res.map((l) => `[${l.join(',')}]`), { label: 'res' })] })
    go(n.left, d + 1)
    go(n.right, d + 1)
  }
  go(root, 0)
  return out
}

export const q0102: Solution = {
  id: 102,
  plain: '把樹「一層一層」由上往下、每層由左往右讀出來,每一層放成一組。像學校朝會排隊:第一排的人先報數,報完換第二排。',
  statement: '給二元樹的根,回傳它的**層序遍歷**:一層一個陣列,每層由左到右。',
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
    { input: 'root = [1]', output: '[[1]]' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 2000`'],
  insight: [
    '「一層一層」= **廣度優先搜尋(BFS)**:先處理離根近的,再處理遠的。工具是佇列(先進先出)',
    '難點是「這一層到哪裡結束」:每一層開始時,佇列裡剛好全是這一層的節點,先記下 `size = len(queue)`,只拿 size 個出來',
    'DFS 也能做:遞迴時帶著深度,把節點放進第 depth 組。只要先走左再走右,每組的順序就對',
  ],
  approaches: [
    {
      name: 'BFS:每層開始時記下佇列長度',
      idea: '佇列裡放待處理的節點。每一輪先記下 `size`,拿出 size 個(就是這一層),收成一組,孩子放進佇列給下一輪。',
      steps: ['空樹 → `[]`', '`q = [root]`', '`while q`:`size = len(q)`,拿出 size 個節點收成 `level`', '每個節點的左右孩子放進 `q`', '`res.append(level)`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每個節點進出佇列一次;佇列最多放一層(w 是最寬那層的節點數,最多約 n/2)。' },
      verdict: '標準解,[[p:tree-bfs]]的模板。199(右視圖)、637(每層平均)、103(鋸齒)、515(每層最大)都是改這個模板的一兩行。',
      code: {
        python: `from collections import deque

def levelOrder(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):           # 只拿「這一層」的節點
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        res.append(level)
    return res`,
        c: `int **levelOrder(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    int **res = malloc(2001 * sizeof(int *));
    *returnColumnSizes = malloc(2001 * sizeof(int));
    *returnSize = 0;
    if (!root) return res;
    struct TreeNode **q = malloc(2001 * sizeof(*q));
    int head = 0, tail = 0;
    q[tail++] = root;
    while (head < tail) {
        int size = tail - head, k = *returnSize;
        res[k] = malloc(size * sizeof(int));
        (*returnColumnSizes)[k] = size;
        for (int i = 0; i < size; i++) {
            struct TreeNode *n = q[head++];
            res[k][i] = n->val;
            if (n->left) q[tail++] = n->left;
            if (n->right) q[tail++] = n->right;
        }
        (*returnSize)++;
    }
    free(q);
    return res;
}`,
        cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        vector<int> level;
        for (int k = q.size(); k > 0; k--) {
            TreeNode* n = q.front(); q.pop();
            level.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        res.push_back(level);
    }
    return res;
}`,
        java: `List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Deque<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        for (int k = q.size(); k > 0; k--) {
            TreeNode n = q.poll();
            level.add(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        res.add(level);
    }
    return res;
}`,
        javascript: `function levelOrder(root) {
  const res = [];
  let level = root ? [root] : [];
  while (level.length) {
    res.push(level.map((n) => n.val));
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}`,
      },
    },
    {
      name: 'DFS 帶著深度',
      idea: '`dfs(node, depth)`:把 `node.val` 放進 `res[depth]`(那一組還不存在就先開一組),再遞迴左、右,深度 +1。',
      steps: ['`res = []`', '`dfs(n, d)`:空 → 結束', '`len(res) == d` → 開新的一組', '`res[d].append(n.val)`,`dfs(左, d + 1)`、`dfs(右, d + 1)`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度是樹高。' },
      verdict: '不是真的「按層走」,但結果一樣。適合已經在寫 DFS、順便要分層資訊的情況。',
      code: {
        python: `def levelOrder(root):
    res = []

    def dfs(n, d):
        if not n:
            return
        if len(res) == d:
            res.append([])                # 第一次到這一層
        res[d].append(n.val)
        dfs(n.left, d + 1)                # 先左後右,同一層才會由左到右
        dfs(n.right, d + 1)

    dfs(root, 0)
    return res`,
        c: `static int **res, *cols, depth;

static void dfs(struct TreeNode *n, int d) {
    if (!n) return;
    if (d == depth) { res[d] = malloc(2001 * sizeof(int)); cols[d] = 0; depth++; }
    res[d][cols[d]++] = n->val;
    dfs(n->left, d + 1);
    dfs(n->right, d + 1);
}

int **levelOrder(struct TreeNode *root, int *returnSize, int **returnColumnSizes) {
    res = malloc(2001 * sizeof(int *));
    cols = malloc(2001 * sizeof(int));
    depth = 0;
    dfs(root, 0);
    *returnSize = depth;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    function<void(TreeNode*, int)> dfs = [&](TreeNode* n, int d) {
        if (!n) return;
        if ((int)res.size() == d) res.push_back({});
        res[d].push_back(n->val);
        dfs(n->left, d + 1);
        dfs(n->right, d + 1);
    };
    dfs(root, 0);
    return res;
}`,
        java: `List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    dfs(root, 0, res);
    return res;
}

private void dfs(TreeNode n, int d, List<List<Integer>> res) {
    if (n == null) return;
    if (res.size() == d) res.add(new ArrayList<>());
    res.get(d).add(n.val);
    dfs(n.left, d + 1, res);
    dfs(n.right, d + 1, res);
}`,
        javascript: `function levelOrder(root) {
  const res = [];
  const dfs = (n, d) => {
    if (!n) return;
    if (res.length === d) res.push([]);
    res[d].push(n.val);
    dfs(n.left, d + 1);
    dfs(n.right, d + 1);
  };
  dfs(root, 0);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '迴圈裡直接寫 `for _ in range(len(q))` 沒問題(range 只算一次);但 C++ / Java 寫 `for (int i = 0; i < q.size(); i++)` 會因為邊拿邊放,size 一直變 —— 要先存起來',
    'Python 用 list 的 `pop(0)` 當佇列是 O(n),節點多時會變慢,要用 `deque`',
    '空樹要回傳 `[]`,不是 `[[]]`',
  ],
  followUp: [
    { q: '鋸齒狀(一層左到右、下一層右到左)?', a: '103. Zigzag Level Order:同樣的 BFS,奇數層把 level 反轉再放進答案。' },
    { q: '只要每層最右邊那個?', a: '[199. Right Side View](#/q/199):每層只取最後一個。' },
  ],
  check: {
    kind: 'fn',
    fn: 'levelOrder',
    argKinds: ['tree'],
    cases: [
      { args: [[3, 9, 20, null, null, 15, 7]], out: [[3], [9, 20], [15, 7]] },
      { args: [[1]], out: [[1]] },
      { args: [[]], out: [] },
      { args: [T], out: [[3], [9, 20], [4, 15, 7]] },
      { args: [[1, 2, null, 3, null, 4]], out: [[1], [2], [3], [4]] },
    ],
  },
}
