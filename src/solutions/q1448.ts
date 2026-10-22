import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 1448. Count Good Nodes in Binary Tree

const T = [3, 1, 4, 3, null, 1, 5]

function dfsFig(): FigStep[] {
  const root = buildTree(T)
  const cls: Record<number, string> = {}
  const subs: Record<number, string> = {}
  let cnt = 0
  const out: FigStep[] = [{ note: '好節點:從根走到它的路上,沒有任何節點比它大。往下走的時候,把「路上目前的最大值」一起帶下去,只要和它比就知道', views: [tree(T)] }]
  const go = (n: FNode | null, mx: number) => {
    if (!n) return
    const good = n.val >= mx
    if (good) cnt++
    cls[n.i] = good ? 'done' : 'dim'
    subs[n.i] = `max=${mx}`
    out.push({ note: `節點 ${n.val},路上最大值 ${mx}:${good ? `${n.val} ≥ ${mx} → 好節點(共 ${cnt} 個)` : `${n.val} < ${mx} → 不是`}。往下傳 max(${mx}, ${n.val}) = ${Math.max(mx, n.val)}`, views: [tree(T, { cls: { ...cls, [n.i]: good ? 'hl' : 'visited' }, subs: { ...subs } })] })
    go(n.left, Math.max(mx, n.val))
    go(n.right, Math.max(mx, n.val))
  }
  go(root, -Infinity)
  out.push({ note: `答案 = ${cnt}(綠色的節點)`, views: [tree(T, { cls, subs })] })
  return out
}

function bfsFig(): FigStep[] {
  const root = buildTree(T)!
  const q: [FNode, number][] = [[root, root.val]]
  const cls: Record<number, string> = {}
  let cnt = 0
  const out: FigStep[] = [{ note: '用 BFS 也行:佇列裡放 (節點, 到它為止的路徑最大值)', views: [tree(T)] }]
  while (q.length) {
    const [n, mx] = q.shift()!
    const good = n.val >= mx
    if (good) cnt++
    cls[n.i] = good ? 'done' : 'dim'
    const m = Math.max(mx, n.val)
    for (const c of [n.left, n.right]) if (c) q.push([c, m])
    out.push({ note: `拿出 (${n.val}, ${mx}):${good ? '好節點' : '不是'},孩子帶著 ${m} 放進佇列`, views: [tree(T, { cls: { ...cls, [n.i]: 'hl' } }), arr(q.map(([x, v]) => `${x.val}/${v}`), { label: '佇列(節點/路徑最大值)' })] })
  }
  out.push({ note: `答案 = ${cnt}`, views: [tree(T, { cls })] })
  return out
}

export const q1448: Solution = {
  id: 1448,
  plain: '從樹根往下走,如果走到某個節點時,**一路上沒有遇過比它大的數**,它就是「好節點」。數一數有幾個。像爬山:一路上沒看過比現在更高的點,這裡就是目前最高峰。',
  statement: '二元樹中,如果從根到節點 X 的路徑上沒有任何值**大於** X,X 就是「好節點」。回傳好節點的數量(根一定是好節點)。',
  examples: [
    { input: 'root = [3,1,4,3,null,1,5]', output: '4', note: '3(根)、4、5、左下的 3' },
    { input: 'root = [3,3,null,4,2]', output: '3', note: '相等也算好節點' },
    { input: 'root = [1]', output: '1' },
  ],
  constraints: ['`1 ≤ 節點數 ≤ 10⁵`,值在 `[-10⁴, 10⁴]`'],
  insight: [
    '判斷 X 好不好,只需要知道「根到 X 路上的最大值」—— 這是一個**從上往下傳**的資訊',
    '和 [104](#/q/104)、[543](#/q/543) 從下往上傳(後序)不同,這題是前序:父節點把「目前最大值」傳給孩子',
    '每個節點:`val ≥ 路上最大值` 就是好節點,然後把 `max(路上最大值, val)` 傳下去',
  ],
  approaches: [
    {
      name: 'DFS:往下傳路徑最大值',
      idea: '`dfs(node, mx)`:`mx` 是根到父節點路上的最大值。`node.val ≥ mx` 就算一個,再用 `max(mx, node.val)` 遞迴左右孩子。',
      steps: ['`dfs(n, mx)`:空 → 0', '`good = 1 if n.val >= mx else 0`', '`mx = max(mx, n.val)`', '回傳 `good + dfs(左, mx) + dfs(右, mx)`;從 `dfs(root, root.val)` 開始'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}](節點下方是路上的最大值)`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次;遞迴深度是樹高。' },
      verdict: '標準解。「往下傳狀態」的前序 DFS 模板,[98. Validate BST](#/p/bst) 往下傳上下界也是同一招。',
      code: {
        python: `def goodNodes(root):
    def dfs(n, mx):                       # mx = 根到父節點路上的最大值
        if not n:
            return 0
        good = 1 if n.val >= mx else 0
        mx = max(mx, n.val)
        return good + dfs(n.left, mx) + dfs(n.right, mx)

    return dfs(root, root.val)`,
        c: `static int dfs(struct TreeNode *n, int mx) {
    if (!n) return 0;
    int good = n->val >= mx;
    if (n->val > mx) mx = n->val;
    return good + dfs(n->left, mx) + dfs(n->right, mx);
}

int goodNodes(struct TreeNode *root) {
    return dfs(root, root->val);
}`,
        cpp: `int dfs(TreeNode* n, int mx) {
    if (!n) return 0;
    int good = n->val >= mx;
    mx = max(mx, n->val);
    return good + dfs(n->left, mx) + dfs(n->right, mx);
}

int goodNodes(TreeNode* root) {
    return dfs(root, root->val);
}`,
        java: `int goodNodes(TreeNode root) {
    return dfs(root, root.val);
}

private int dfs(TreeNode n, int mx) {
    if (n == null) return 0;
    int good = n.val >= mx ? 1 : 0;
    mx = Math.max(mx, n.val);
    return good + dfs(n.left, mx) + dfs(n.right, mx);
}`,
        javascript: `function goodNodes(root) {
  const dfs = (n, mx) => {
    if (!n) return 0;
    const good = n.val >= mx ? 1 : 0;
    mx = Math.max(mx, n.val);
    return good + dfs(n.left, mx) + dfs(n.right, mx);
  };
  return dfs(root, root.val);
}`,
      },
    },
    {
      name: 'BFS:佇列帶著路徑最大值',
      idea: '佇列每一項是 `(節點, 到它為止的路徑最大值)`。拿出來時判斷好不好,孩子帶著新的最大值放進去。',
      steps: ['`q = [(root, root.val)]`、`cnt = 0`', '拿出 `(n, mx)`:`n.val >= mx` → `cnt++`', '`m = max(mx, n.val)`,把 `(孩子, m)` 放進佇列'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每個節點一次;佇列最多一層的寬度。' },
      verdict: 'n 到 10⁵、樹可能很歪,遞迴在某些語言(Python 預設 1000 層)會爆;BFS 或手動堆疊比較保險。',
      code: {
        python: `from collections import deque

def goodNodes(root):
    q, cnt = deque([(root, root.val)]), 0
    while q:
        n, mx = q.popleft()
        if n.val >= mx:
            cnt += 1
        m = max(mx, n.val)
        if n.left:
            q.append((n.left, m))
        if n.right:
            q.append((n.right, m))
    return cnt`,
        c: `int goodNodes(struct TreeNode *root) {
    struct TreeNode **q = malloc(100001 * sizeof(*q));
    int *mx = malloc(100001 * sizeof(int)), head = 0, tail = 0, cnt = 0;
    q[tail] = root; mx[tail++] = root->val;
    while (head < tail) {
        struct TreeNode *n = q[head];
        int m = mx[head++];
        if (n->val >= m) cnt++;
        if (n->val > m) m = n->val;
        if (n->left) { q[tail] = n->left; mx[tail++] = m; }
        if (n->right) { q[tail] = n->right; mx[tail++] = m; }
    }
    free(q); free(mx);
    return cnt;
}`,
        cpp: `int goodNodes(TreeNode* root) {
    queue<pair<TreeNode*, int>> q;
    q.push({root, root->val});
    int cnt = 0;
    while (!q.empty()) {
        auto [n, mx] = q.front(); q.pop();
        if (n->val >= mx) cnt++;
        int m = max(mx, n->val);
        if (n->left) q.push({n->left, m});
        if (n->right) q.push({n->right, m});
    }
    return cnt;
}`,
        java: `int goodNodes(TreeNode root) {
    Deque<Object[]> q = new ArrayDeque<>();
    q.offer(new Object[]{root, root.val});
    int cnt = 0;
    while (!q.isEmpty()) {
        Object[] top = q.poll();
        TreeNode n = (TreeNode) top[0];
        int mx = (int) top[1];
        if (n.val >= mx) cnt++;
        int m = Math.max(mx, n.val);
        if (n.left != null) q.offer(new Object[]{n.left, m});
        if (n.right != null) q.offer(new Object[]{n.right, m});
    }
    return cnt;
}`,
        javascript: `function goodNodes(root) {
  const q = [[root, root.val]];
  let cnt = 0;
  for (let h = 0; h < q.length; h++) {
    const [n, mx] = q[h];
    if (n.val >= mx) cnt++;
    const m = Math.max(mx, n.val);
    if (n.left) q.push([n.left, m]);
    if (n.right) q.push([n.right, m]);
  }
  return cnt;
}`,
      },
    },
  ],
  pitfalls: [
    '用 `>` 而不是 `>=`:和路上最大值**相等**也算好節點',
    '把「路上最大值」存在全域變數裡,回到上一層時忘了還原 —— 用參數往下傳,每條路徑各自獨立,不會互相干擾',
    '初始的 mx 用 0:值可能是負的(`-10⁴`),要用根的值或負無限大',
  ],
  followUp: [
    { q: '同樣「往下傳狀態」的題目?', a: '98. Validate Binary Search Tree(往下傳上下界)、112. Path Sum(往下傳剩下的目標和)、129. Sum Root to Leaf Numbers(往下傳目前組成的數字)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'goodNodes',
    argKinds: ['tree'],
    cases: [
      { args: [[3, 1, 4, 3, null, 1, 5]], out: 4 },
      { args: [[3, 3, null, 4, 2]], out: 3 },
      { args: [[1]], out: 1 },
      { args: [[-1, -2, -3]], out: 1 },
      { args: [[2, null, 4, 10, 8, null, null, 4]], out: 4 },
    ],
  },
}
