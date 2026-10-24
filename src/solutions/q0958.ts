import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 958. Check Completeness of a Binary Tree

const T = [1, 2, 3, 4, 5, null, 7]

function bfsFig(): FigStep[] {
  return [
    { note: '完全二元樹:除了最後一層,每層都是滿的;最後一層的節點都靠左。等價說法:BFS(包含 null)時,一旦遇到 null,後面就不能再出現任何節點', views: [tree(T)] },
    { note: '層序:1、2、3、4、5,接著是 3 的左孩子 → null', views: [tree(T, { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done' } })] },
    { note: 'null 之後又出現 7 → 不是完全二元樹 → false', views: [tree(T, { cls: { 6: 'hl' } })] },
  ]
}

function idxFig(): FigStep[] {
  return [
    { note: '另一種:替節點編號,根是 1,i 的孩子是 2i、2i+1。完全二元樹的編號會剛好是 1..n 連續不中斷', views: [tree(T, { subs: { 0: '1', 1: '2', 2: '3', 3: '4', 4: '5', 6: '7' } })] },
    { note: '這裡 n = 6 但最大編號是 7(位置 6 是空的)→ 不完全。只要比較「最大編號 == 節點數」', views: [tree(T, { cls: { 6: 'hl' }, subs: { 6: '7 > 6' } })] },
  ]
}

export const q0958: Solution = {
  id: 958,
  plain: '檢查一棵二元樹是不是「完全二元樹」:除了最下面一層,每一層都要排滿;最下面一層的節點要全部擠在左邊,中間不能有空隙。',
  statement: '給二元樹的根 `root`,判斷它是否為**完全二元樹**:除最後一層外每層全滿,且最後一層的節點盡可能靠左。',
  examples: [
    { input: 'root = [1,2,3,4,5,6]', output: 'true' },
    { input: 'root = [1,2,3,4,5,null,7]', output: 'false', note: '7 的左邊有空位' },
  ],
  constraints: ['節點數 ≤ 100'],
  insight: ['層序走訪時把空孩子也放進佇列', '完全二元樹 ⇔ 第一個 null 之後全部都是 null', '或:用「堆積式編號」(i → 2i, 2i+1),完全 ⇔ 最大編號 = 節點總數'],
  approaches: [
    {
      name: 'BFS:遇到 null 之後不能再有節點',
      idea: '佇列連 null 一起放;取出 null 時標記 `seenNull`;之後若取出非 null → false。',
      steps: ['`q = [root]`、`seenNull = False`', '取出 n:是 null → `seenNull = True`', '不是 null:`seenNull` 已經是 True → false;否則把左、右孩子(可能是 null)入隊', '走完 → true'],
      figure: { title: `root = [${T}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點和空位進出佇列一次。' },
      verdict: '最推薦,把定義直接翻成「層序裡 null 之後不能有節點」。',
      code: {
        python: `from collections import deque

def isCompleteTree(root):
    q, seen_null = deque([root]), False
    while q:
        n = q.popleft()
        if not n:
            seen_null = True                  # 第一個空位
            continue
        if seen_null:
            return False                      # 空位後面又出現節點
        q.append(n.left)
        q.append(n.right)
    return True`,
        c: `bool isCompleteTree(struct TreeNode *root) {
    struct TreeNode *q[256];
    int h = 0, t = 0;
    bool seenNull = false;
    q[t++] = root;
    while (h < t) {
        struct TreeNode *n = q[h++];
        if (!n) { seenNull = true; continue; }
        if (seenNull) return false;
        q[t++] = n->left;
        q[t++] = n->right;
    }
    return true;
}`,
        cpp: `bool isCompleteTree(TreeNode* root) {
    queue<TreeNode*> q;
    q.push(root);
    bool seenNull = false;
    while (!q.empty()) {
        TreeNode *n = q.front(); q.pop();
        if (!n) { seenNull = true; continue; }
        if (seenNull) return false;
        q.push(n->left);
        q.push(n->right);
    }
    return true;
}`,
        java: `boolean isCompleteTree(TreeNode root) {
    Queue<TreeNode> q = new LinkedList<>();   // ArrayDeque 不能放 null
    q.offer(root);
    boolean seenNull = false;
    while (!q.isEmpty()) {
        TreeNode n = q.poll();
        if (n == null) { seenNull = true; continue; }
        if (seenNull) return false;
        q.offer(n.left);
        q.offer(n.right);
    }
    return true;
}`,
        javascript: `function isCompleteTree(root) {
  const q = [root];
  let seenNull = false;
  for (let h = 0; h < q.length; h++) {
    const n = q[h];
    if (!n) {
      seenNull = true;
      continue;
    }
    if (seenNull) return false;
    q.push(n.left, n.right);
  }
  return true;
}`,
      },
    },
    {
      name: '堆積式編號',
      idea: 'DFS 時根編號 1,左孩子 2i、右孩子 2i + 1;記錄節點數 n 和最大編號,完全 ⇔ `最大編號 == n`。',
      steps: ['`dfs(node, i)`:空就返回', '`n += 1`、`mx = max(mx, i)`', '`dfs(left, 2i)`、`dfs(right, 2i + 1)`', '回傳 `mx == n`'],
      figure: { title: `root = [${T}]`, steps: idxFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '遞迴深度 = 樹高;編號超過 100 就停下,不會溢位。' },
      verdict: '一行條件就判斷完。編號可能很大:一旦超過 n 就可以提早停,或用大數 / 剪枝。',
      code: {
        python: `def isCompleteTree(root):
    cnt, mx = 0, 0

    def dfs(n, i):
        nonlocal cnt, mx
        if not n:
            return
        if i > 100:                           # 編號超過節點上限:一定不完全(也防止數字變太大)
            mx = 101
            return
        cnt += 1
        mx = max(mx, i)
        dfs(n.left, 2 * i)
        dfs(n.right, 2 * i + 1)

    dfs(root, 1)
    return mx == cnt`,
        c: `static int cnt_, mx_;

static void dfs(struct TreeNode *n, int i) {
    if (!n) return;
    if (i > 100) { mx_ = 101; return; }      // 編號超過節點上限:一定不完全
    cnt_++;
    if (i > mx_) mx_ = i;
    dfs(n->left, 2 * i);
    dfs(n->right, 2 * i + 1);
}

bool isCompleteTree(struct TreeNode *root) {
    cnt_ = mx_ = 0;
    dfs(root, 1);
    return mx_ == cnt_;
}`,
        cpp: `int cnt, mx;

void dfs(TreeNode *n, int i) {
    if (!n) return;
    if (i > 100) { mx = 101; return; }
    cnt++;
    mx = max(mx, i);
    dfs(n->left, 2 * i);
    dfs(n->right, 2 * i + 1);
}

bool isCompleteTree(TreeNode* root) {
    cnt = mx = 0;
    dfs(root, 1);
    return mx == cnt;
}`,
        java: `private int cnt, mx;

boolean isCompleteTree(TreeNode root) {
    cnt = mx = 0;
    dfs(root, 1);
    return mx == cnt;
}

private void dfs(TreeNode n, int i) {
    if (n == null) return;
    if (i > 100) { mx = 101; return; }
    cnt++;
    mx = Math.max(mx, i);
    dfs(n.left, 2 * i);
    dfs(n.right, 2 * i + 1);
}`,
        javascript: `function isCompleteTree(root) {
  let cnt = 0, mx = 0;
  const dfs = (n, i) => {
    if (!n) return;
    if (i > 100) {
      mx = 101;
      return;
    }
    cnt++;
    mx = Math.max(mx, i);
    dfs(n.left, 2 * i);
    dfs(n.right, 2 * i + 1);
  };
  dfs(root, 1);
  return mx === cnt;
}`,
      },
    },
  ],
  pitfalls: ['只檢查每個節點「有右孩子就必須有左孩子」:不夠,[1,2,3,null,null,4] 這種第三層左邊空著、右邊卻有節點的情況也不完全', '編號法沒有防溢位:100 個節點排成一條鏈,編號會到 2¹⁰⁰', 'Java 的 ArrayDeque 不能放 null,BFS 要改用 LinkedList'],
  check: {
    kind: 'fn',
    fn: 'isCompleteTree',
    argKinds: ['tree'],
    cases: [
      { args: [[1, 2, 3, 4, 5, 6]], out: true },
      { args: [T], out: false },
      { args: [[1]], out: true },
      { args: [[1, 2, 3, 5, null, 7, 8]], out: false },
      { args: [[1, null, 2]], out: false },
      { args: [[1, 2, 3, null, null, 4]], out: false },
    ],
  },
}
