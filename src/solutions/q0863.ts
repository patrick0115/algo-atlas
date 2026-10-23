import type { Solution } from './types'
import { tree } from './fig'

// 863. All Nodes Distance K in Binary Tree
const T = [3,5,1,6,2,0,8,null,null,7,4]
const F = [
  { note: '先記住每個節點的父節點，再以 5 為起點放進佇列；距離 0 的佇列只有 [5]。', views: [tree(T, { cls: { 1: 'hl' } })] },
  { note: '從 5 出發，距離 1 的節點是父節點 3、子節點 6 和 2；樹的邊可以往上也可以往下走。', views: [tree(T, { cls: { 1: 'hl', 0: 'visited', 3: 'visited', 4: 'visited' } })] },
  { note: '再走一步，距離 2 的節點是 1、7、4。不能走回上一層，否則會重複繞圈。', views: [tree(T, { cls: { 2: 'hl', 9: 'hl', 10: 'hl', 1: 'dim' } })] },
  { note: '已經完整走完兩層，所以此時佇列中的 1、7、4 就是答案；不再向第三層擴展。', views: [tree(T, { cls: { 2: 'done', 9: 'done', 10: 'done' } })] },
]
const recursiveFig = [
  { note: '遞迴往下找到 target=5；一到 5，就從它往下找距離 2 的節點。', views: [tree(T, { cls: { 0: 'visited', 1: 'hl' } })] },
  { note: '從 5 走兩條邊可到 7 與 4，因此先把這兩個值加入答案。', views: [tree(T, { cls: { 1: 'visited', 9: 'hl', 10: 'hl' } })] },
  { note: '回到父節點 3 時，3 距離目標只有一步；再往另一側走一步，找到節點 1。', views: [tree(T, { cls: { 0: 'visited', 1: 'dim', 2: 'hl' } })] },
  { note: '所有距離 2 的分支都已處理，最後收集到 7、4、1。', views: [tree(T, { cls: { 2: 'done', 9: 'done', 10: 'done' } })] },
]
const WRAP = {
  python: `\ndef distanceKCheck(root, target, k):
    return sorted(distanceK(root, target, k))  # 避免重訪已經走過的節點。`,
  c: `\nstatic int cmpInt(const void *a, const void *b) {
    int x = *(int*)a, y = *(int*)b;
    return (x > y) - (x < y);
}
int *distanceKCheck(struct TreeNode *root, struct TreeNode *target, int k, int *returnSize) {
    int *a = distanceK(root, target, k, returnSize);
    qsort(a, *returnSize, sizeof(int), cmpInt);
    return a;
}`,
  cpp: `\nvector<int> distanceKCheck(TreeNode *root, TreeNode *target, int k) {
    auto a = distanceK(root, target, k);
    sort(a.begin(), a.end());
    return a;
}`,
  java: `\nList<Integer> distanceKCheck(TreeNode root, TreeNode target, int k) {
    List<Integer> a = distanceK(root, target, k);
    Collections.sort(a);
    return a;
}`,
  javascript: `\nfunction distanceKCheck(root, target, k) {
    return distanceK(root, target, k).sort((a, b) => a - b);
}`,
}

export const q0863: Solution = {
  id: 863,
  plain: '把指定樹節點當中心，找沿樹枝走剛好 k 步能到的所有節點。',
  statement: '給二元樹 root、其中的 target 節點與整數 k，回傳距離 target 恰為 k 的所有節點值，順序不限。',
  examples: [{ input: 'root = [3,5,1,6,2,0,8,null,null,7,4], target = 5, k = 2', output: '[7,4,1]' }, { input: 'root = [1], target = 1, k = 3', output: '[]' }],
  constraints: ['1 ≤ 節點數 ≤ 500；0 ≤ k ≤ 1000。', '要走到 target 的父節點，單靠 left/right 不夠。'],
  insight: ['先知道每個節點的 parent，樹就能當無向圖，以 [[p:tree-bfs]] 一層一層搜尋。', '另一種方式：遞迴向上回報 target 距離，再在祖先另一側子樹向下收集。', 'target 是節點身分，不是「值等於某數」的搜尋條件。'],
  approaches: [
    { name: '父節點表加 BFS', idea: '先建立父節點關係，再從 target 往左、右、父三方向逐層走。', steps: ['DFS 建立每個節點的 parent。樹原本沒有往父節點的指標，因此搜尋前要準備回頭的辦法。', '佇列從 target 起始，記錄 seen。每走過一條邊就增加一層距離，並避免再走回已訪問節點。', '每層擴展 left、right、parent；走完 k 層後輸出佇列節點值。恰好走完 k 條邊的節點才加入答案，不可把較近節點也算進來。'], figure: { title: 'target = 5, k = 2', steps: F }, complexity: { time: 'O(n)', space: 'O(n)', why: '建表與 BFS 都各看每個節點最多一次。' }, verdict: '最容易把距離理解成圖的層數。', code: {
      python: `def distanceK(root, target, k):
    parent = {root: None}
    st = [root]
    while st:  # 從目標逐層擴展，或由遞迴回報與目標的距離。
        n = st.pop()
        for ch in (n.left, n.right):
            if ch:  # 避免重訪已經走過的節點。
                parent[ch] = n
                st.append(ch)
    q = [target]
    seen = {target}
    for _ in range(k):
        nxt = []
        for n in q:
            for v in (n.left, n.right, parent[n]):
                if v and v not in seen:
                    seen.add(v)
                    nxt.append(v)
        q = nxt
    return [n.val for n in q]${WRAP.python}`,
      c: `static int build(struct TreeNode *n, int p, struct TreeNode **a, int *par, int *l, int *r, int *len) {
    if (!n)
        return - 1;
    int i = (*len)++;
    a[i] = n;
    par[i] = p;
    l[i] = build(n->left, i, a, par, l, r, len);
    r[i] = build(n->right, i, a, par, l, r, len);
    return i;
}
int *distanceK(struct TreeNode *root, struct TreeNode *target, int k, int *returnSize) {
    struct TreeNode **a = malloc(501 * sizeof(*a));
    int *par = malloc(501 * sizeof(int)), *l = malloc(501 * sizeof(int)), *r = malloc(501 * sizeof(int)), n = 0;
    build(root, -1, a, par, l, r, & n);
    int t = 0;
    while (t < n && a[t] != target)
        t++;
    int *q = malloc(501 * sizeof(int)), *d = malloc(501 * sizeof(int)), *out = malloc(501 * sizeof(int)), h = 0, z = 0;
    for (int i = 0; i < n; i++)
        d[i] = -1;
    if (t < n) {
        q[z++] = t;
        d[t] = 0;
    }
    *returnSize = 0;
    while (h < z) {
        int u = q[h++];
        if (d[u] == k) {
            out[(*returnSize)++] = a[u]->val;
            continue;
        }
        int v[3] = {par[u], l[u], r[u]};
        for (int j = 0; j < 3; j++)
            if (v[j] >= 0 && d[v[j]] < 0) {
                d[v[j]] = d[u] + 1;
                q[z++] = v[j];
            }
    }
    free(a);
    free(par);
    free(l);
    free(r);
    free(q);
    free(d);
    return out;
}${WRAP.c}`,
      cpp: `vector<int> distanceK(TreeNode *root, TreeNode *target, int k) {
    unordered_map<TreeNode*, TreeNode*> par;
    function<void(TreeNode*, TreeNode*)> build = [&](TreeNode *n, TreeNode *p) {
        if (!n)
            return;
        par[n] = p;
        build(n->left, n);
        build(n->right, n);
    };
    build(root, nullptr);
    vector<TreeNode*> q {target};
    unordered_set<TreeNode*> seen {target};
    for (int d = 0; d < k; d++) {
        vector<TreeNode*> next;
        for (auto n : q)
            for (auto v : {n->left, n->right, par[n]}
)if (v && seen.insert(v).second)next.push_back(v);
        q = next;
    }
    vector<int> out;
    for (auto n : q)
        out.push_back(n->val);
    return out;
}${WRAP.cpp}`,
      java: `List<Integer> distanceK(TreeNode root, TreeNode target, int k) {
    Map<TreeNode, TreeNode> par = new HashMap<>();
    build(root, null, par);
    List<TreeNode> q = new ArrayList<>();
    q.add(target);
    Set<TreeNode> seen = new HashSet<>();
    seen.add(target);
    for (int d = 0; d < k; d++) {
        List<TreeNode> next = new ArrayList<>();
        for (TreeNode n : q)
            for (TreeNode v : new TreeNode[] {n.left, n.right, par.get(n)}
)if (v != null && seen.add(v))next.add(v);
        q = next;
    }
    List<Integer> out = new ArrayList<>();
    for (TreeNode n : q)
        out.add(n.val);
    return out;
}
void build(TreeNode n, TreeNode p, Map<TreeNode, TreeNode> par) {
    if (n == null)
        return;
    par.put(n, p);
    build(n.left, n, par);
    build(n.right, n, par);
}${WRAP.java}`,
      javascript: `function distanceK(root, target, k) {
    const par = new Map();
    function build(n, p) {
        if (!n)
            return;
        par.set(n, p);
        build(n.left, n);
        build(n.right, n);
    }
    build(root, null);
    let q = [target];
    const seen = new Set(q);
    for (let d = 0; d < k; d++) {
        const next = [];
        for (const n of q)
            for (const v of [n.left, n.right, par.get(n)])
                if (v && !seen.has(v)) {
                    seen.add(v);
                    next.push(v);
                }
        q = next;
    }
    return q.map(n => n.val);
}${WRAP.javascript}`,
    } },
    { name: '遞迴回報距離', idea: '找到 target 後向上回報距離；對祖先的另一側子樹補找剩餘步數。', steps: ['向下收集某節點深度 d 的節點。樹原本沒有往父節點的指標，因此搜尋前要準備回頭的辦法。', '遞迴找 target；找到時從 target 向下收 k 步。每走過一條邊就增加一層距離，並避免再走回已訪問節點。', '回到祖先時，若祖先距離 k 就收祖先；否則在另一側收剩餘步數。恰好走完 k 條邊的節點才加入答案，不可把較近節點也算進來。'], figure: { title: 'target = 5, k = 2', steps: recursiveFig }, complexity: { time: 'O(n)', space: 'O(h)', why: '子樹互不重複地收集；額外記憶體為遞迴堆疊，輸出不計。' }, verdict: '不建父節點表，但距離公式需要仔細處理。', code: {
      python: `def distanceK(root, target, k):
    out = []

    def down(n, d):
        if not n or d < 0:  # 避免重訪已經走過的節點。
            return
        if d == 0:
            out.append(n.val)
            return
        down(n.left, d - 1)
        down(n.right, d - 1)

    def find(n):
        if not n:
            return -1
        if n is target:
            down(n, k)
            return 0
        l = find(n.left)
        if l >= 0:
            if l + 1 == k:
                out.append(n.val)
            else:
                down(n.right, k - l - 2)
            return l + 1
        r = find(n.right)
        if r >= 0:
            if r + 1 == k:
                out.append(n.val)
            else:
                down(n.left, k - r - 2)
            return r + 1
        return -1
    find(root)
    return out${WRAP.python}`,
      c: `static void down(struct TreeNode *n, int d, int *out, int *sz) {
    if (!n || d < 0)
        return;
    if (d == 0) {
        out[(*sz)++] = n->val;
        return;
    }
    down(n->left, d - 1, out, sz);
    down(n->right, d - 1, out, sz);
}
static int find(struct TreeNode *n, struct TreeNode *target, int k, int *out, int *sz) {
    if (!n)
        return - 1;
    if (n == target) {
        down(n, k, out, sz);
        return 0;
    }
    int d = find(n->left, target, k, out, sz);
    if (d >= 0) {
        if (d + 1 == k)
            out[(*sz)++] = n->val;
        else
            down(n->right, k - d - 2, out, sz);
        return d + 1;
    }
    d = find(n->right, target, k, out, sz);
    if (d >= 0) {
        if (d + 1 == k)
            out[(*sz)++] = n->val;
        else
            down(n->left, k - d - 2, out, sz);
        return d + 1;
    }
    return - 1;
}
int *distanceK(struct TreeNode *root, struct TreeNode *target, int k, int *returnSize) {
    int *out = malloc(501 * sizeof(int));
    *returnSize = 0;
    find(root, target, k, out, returnSize);
    return out;
}${WRAP.c}`,
      cpp: `vector<int> distanceK(TreeNode *root, TreeNode *target, int k) {
    vector<int> out;
    function<void(TreeNode*, int)> down = [&](TreeNode *n, int d) {
        if (!n || d < 0)
            return;
        if (d == 0) {
            out.push_back(n->val);
            return;
        }
        down(n->left, d - 1);
        down(n->right, d - 1);
    };
    function<int(TreeNode*)> find = [&](TreeNode *n) {
        if (!n)
            return - 1;
        if (n == target) {
            down(n, k);
            return 0;
        }
        int d = find(n->left);
        if (d >= 0) {
            if (d + 1 == k)
                out.push_back(n->val);
            else
                down(n->right, k - d - 2);
            return d + 1;
        }
        d = find(n->right);
        if (d >= 0) {
            if (d + 1 == k)
                out.push_back(n->val);
            else
                down(n->left, k - d - 2);
            return d + 1;
        }
        return - 1;
    };
    find(root);
    return out;
}${WRAP.cpp}`,
      java: `List<Integer> out;
TreeNode target;
int k;
List<Integer> distanceK(TreeNode root, TreeNode target, int k) {
    out = new ArrayList<>();
    this.target = target;
    this.k = k;
    find(root);
    return out;
}
void down(TreeNode n, int d) {
    if (n == null || d < 0)
        return;
    if (d == 0) {
        out.add(n.val);
        return;
    }
    down(n.left, d - 1);
    down(n.right, d - 1);
}
int find(TreeNode n) {
    if (n == null)
        return - 1;
    if (n == target) {
        down(n, k);
        return 0;
    }
    int d = find(n.left);
    if (d >= 0) {
        if (d + 1 == k)
            out.add(n.val);
        else
            down(n.right, k - d - 2);
        return d + 1;
    }
    d = find(n.right);
    if (d >= 0) {
        if (d + 1 == k)
            out.add(n.val);
        else
            down(n.left, k - d - 2);
        return d + 1;
    }
    return - 1;
}${WRAP.java}`,
      javascript: `function distanceK(root, target, k) {
    const out = [];
    function down(n, d) {
        if (!n || d < 0)
            return;
        if (d === 0) {
            out.push(n.val);
            return;
        }
        down(n.left, d - 1);
        down(n.right, d - 1);
    }
    function find(n) {
        if (!n)
            return - 1;
        if (n === target) {
            down(n, k);
            return 0;
        }
        let d = find(n.left);
        if (d >= 0) {
            if (d + 1 === k)
                out.push(n.val);
            else
                down(n.right, k - d - 2);
            return d + 1;
        }
        d = find(n.right);
        if (d >= 0) {
            if (d + 1 === k)
                out.push(n.val);
            else
                down(n.left, k - d - 2);
            return d + 1;
        }
        return - 1;
    }
    find(root);
    return out;
}${WRAP.javascript}`,
    } },
  ],
  pitfalls: ['不能只往子節點走，答案可能在 target 的祖先或另一側。', 'BFS 要避免沿父子邊來回走。', 'k=0 時答案只有 target。', '答案順序不固定；檢查前先排序。'],
  check: { kind: 'fn', fn: 'distanceKCheck', argKinds: ['tree','nodeIn0',null], cases: [{ args: [T,5,2], out: [1,4,7] }, { args: [[1],1,0], out: [1] }, { args: [[1],1,3], out: [] }] },
}
