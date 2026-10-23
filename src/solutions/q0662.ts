import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 662. Maximum Width of Binary Tree

const T = [1, 3, 2, 5, 3, null, 9]

function bfsFig(): FigStep[] {
  return [
    { note: '寬度 = 同一層最左和最右的非空節點之間「有幾個位置」(中間的空位也算)。替每個節點編號:根是 0,i 的左孩子 2i + 1、右孩子 2i + 2(像完整二元樹的陣列索引)', views: [tree(T, { subs: { 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 6: '6' } })] },
    { note: '第 3 層:最左是 5(編號 3)、最右是 9(編號 6)→ 寬度 6 − 3 + 1 = 4', views: [tree(T, { cls: { 3: 'hl', 6: 'hl', 4: 'cur' }, subs: { 3: '3', 6: '6' } })] },
    { note: '樹很深又很歪的時候,編號會指數成長(2^3000)而溢位。每一層先把編號減掉這層最左邊的編號(讓最左邊從 0 開始),寬度不變,數字也不會爆', views: [tree(T, { subs: { 3: '0', 4: '1', 6: '3' } })] },
  ]
}

function dfsFig(): FigStep[] {
  return [
    { note: 'DFS 版:先左後右,記錄每一層「第一個碰到的編號」(一定是最左邊的)', views: [tree(T, { cls: { 0: 'path', 1: 'path', 3: 'hl' }, subs: { 3: 'first[2] = 3' } })] },
    { note: '之後碰到同一層的節點 i,寬度 = i − first[depth] + 1,取最大。編號用 64 位元無號整數,溢位會繞回,但「相減」的結果還是對的(真正的寬度保證在 32 位元內)', views: [tree(T, { cls: { 6: 'done' }, subs: { 6: '6 − 3 + 1 = 4' } })] },
  ]
}

export const q0662: Solution = {
  id: 662,
  plain: '樹的某一層「有多寬」:從這層最左邊的節點量到最右邊的節點,中間缺的空位也要算進去(就像把樹畫成完整的金字塔時,這層佔了幾格)。求最寬的那一層。',
  statement: '給二元樹的根 `root`,回傳樹的**最大寬度**:某一層的寬度定義為該層最左與最右非空節點之間的長度,中間的 null 也計入(就像完整二元樹的排法)。答案保證在 32 位元有號整數範圍內。',
  examples: [
    { input: 'root = [1,3,2,5,3,null,9]', output: '4' },
    { input: 'root = [1,3,2,5,null,null,9,6,null,7]', output: '7' },
    { input: 'root = [1,3,2,5]', output: '2' },
  ],
  constraints: ['節點數 ≤ 3000', '深度可達 3000 → 直接用完整二元樹的編號會溢位'],
  insight: ['替節點編上「完整二元樹」的位置編號:左孩子 2i+1、右孩子 2i+2', '某層的寬度 = 最右編號 − 最左編號 + 1', '編號會隨深度指數成長 → 每層把編號減掉該層最左邊的,或用無號整數讓相減自然繞回'],
  approaches: [
    {
      name: 'BFS + 每層正規化編號',
      idea: '佇列放 `(node, idx)`;每層開始時 `base = 該層第一個的 idx`,孩子編號用 `idx − base` 去算。',
      steps: ['`q = [(root, 0)]`', '每層:`base = q[0].idx`;寬度 = `q[-1].idx − base + 1`', '取出每個 (n, i):`i -= base`;孩子 `(left, 2i + 1)`、`(right, 2i + 2)`', '回傳最大寬度'],
      figure: { title: `root = [${T}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(w)', why: 'w = 最寬那層的節點數。' },
      verdict: '最推薦。正規化讓編號永遠不超過 2 × 該層寬度,不需要大數。',
      code: {
        python: `from collections import deque

def widthOfBinaryTree(root):
    q, best = deque([(root, 0)]), 0
    while q:
        base = q[0][1]                        # 這層最左邊的編號
        best = max(best, q[-1][1] - base + 1)
        for _ in range(len(q)):
            n, i = q.popleft()
            i -= base                         # 正規化:最左邊從 0 開始,避免數字爆炸
            if n.left:
                q.append((n.left, 2 * i + 1))
            if n.right:
                q.append((n.right, 2 * i + 2))
    return best`,
        c: `int widthOfBinaryTree(struct TreeNode *root) {
    struct TreeNode **q = malloc(3005 * sizeof *q);
    unsigned long long *id = malloc(3005 * sizeof *id);
    int h = 0, t = 0;
    unsigned long long best = 0;
    q[t] = root; id[t++] = 0;
    while (h < t) {
        int end = t;
        unsigned long long base = id[h];
        if (id[end - 1] - base + 1 > best) best = id[end - 1] - base + 1;
        for (; h < end; h++) {
            unsigned long long i = id[h] - base;
            if (q[h]->left) { q[t] = q[h]->left; id[t++] = 2 * i + 1; }
            if (q[h]->right) { q[t] = q[h]->right; id[t++] = 2 * i + 2; }
        }
    }
    free(q); free(id);
    return (int)best;
}`,
        cpp: `int widthOfBinaryTree(TreeNode* root) {
    queue<pair<TreeNode*, unsigned long long>> q;
    q.push({root, 0});
    unsigned long long best = 0;
    while (!q.empty()) {
        unsigned long long base = q.front().second, last = q.back().second;
        best = max(best, last - base + 1);
        for (int k = q.size(); k > 0; k--) {
            auto [n, i] = q.front(); q.pop();
            i -= base;
            if (n->left) q.push({n->left, 2 * i + 1});
            if (n->right) q.push({n->right, 2 * i + 2});
        }
    }
    return best;
}`,
        java: `int widthOfBinaryTree(TreeNode root) {
    Deque<Object[]> q = new ArrayDeque<>();
    q.offer(new Object[]{root, 0L});
    long best = 0;
    while (!q.isEmpty()) {
        long base = (long) q.peekFirst()[1], last = (long) q.peekLast()[1];
        best = Math.max(best, last - base + 1);
        for (int k = q.size(); k > 0; k--) {
            Object[] p = q.poll();
            TreeNode n = (TreeNode) p[0];
            long i = (long) p[1] - base;
            if (n.left != null) q.offer(new Object[]{n.left, 2 * i + 1});
            if (n.right != null) q.offer(new Object[]{n.right, 2 * i + 2});
        }
    }
    return (int) best;
}`,
        javascript: `function widthOfBinaryTree(root) {
  let q = [[root, 0]], best = 0;
  while (q.length) {
    const base = q[0][1];
    best = Math.max(best, q[q.length - 1][1] - base + 1);
    const next = [];
    for (const [n, idx] of q) {
      const i = idx - base;
      if (n.left) next.push([n.left, 2 * i + 1]);
      if (n.right) next.push([n.right, 2 * i + 2]);
    }
    q = next;
  }
  return best;
}`,
      },
    },
    {
      name: 'DFS + 每層第一個編號',
      idea: '先左後右的 DFS;`first[d]` 記第一次到達深度 d 的編號;每個節點 `width = idx − first[d] + 1`。編號用 64 位元無號整數(溢位繞回不影響相減)。',
      steps: ['`dfs(node, d, idx)`:空就返回', '`d == len(first)` → `first.append(idx)`', '`best = max(best, idx − first[d] + 1)`', '`dfs(left, d + 1, 2idx + 1)`、`dfs(right, d + 1, 2idx + 2)`'],
      figure: { title: `root = [${T}]`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '遞迴深度 = 樹高;first 陣列長度 = 樹高。' },
      verdict: '不需要佇列;靠「無號整數相減在模 2⁶⁴ 下仍正確」處理溢位,是個有用的小技巧。',
      code: {
        python: `import sys

def widthOfBinaryTree(root):
    sys.setrecursionlimit(10000)
    MASK = (1 << 64) - 1                      # 模擬 64 位元無號整數
    first, best = [], 0

    def dfs(n, d, idx):
        nonlocal best
        if not n:
            return
        if d == len(first):
            first.append(idx)                 # 這層第一個(最左邊)
        best = max(best, ((idx - first[d]) & MASK) + 1)
        dfs(n.left, d + 1, (2 * idx + 1) & MASK)
        dfs(n.right, d + 1, (2 * idx + 2) & MASK)

    dfs(root, 0, 0)
    return best`,
        c: `static unsigned long long first_[3005];
static int depth_;
static unsigned long long best_;

static void dfs(struct TreeNode *n, int d, unsigned long long idx) {
    if (!n) return;
    if (d == depth_) first_[depth_++] = idx;
    if (idx - first_[d] + 1 > best_) best_ = idx - first_[d] + 1;   // 無號整數相減:溢位也對
    dfs(n->left, d + 1, 2 * idx + 1);
    dfs(n->right, d + 1, 2 * idx + 2);
}

int widthOfBinaryTree(struct TreeNode *root) {
    depth_ = 0; best_ = 0;
    dfs(root, 0, 0);
    return (int)best_;
}`,
        cpp: `vector<unsigned long long> first;
unsigned long long best;

void dfs(TreeNode *n, int d, unsigned long long idx) {
    if (!n) return;
    if (d == (int)first.size()) first.push_back(idx);
    best = max(best, idx - first[d] + 1);
    dfs(n->left, d + 1, 2 * idx + 1);
    dfs(n->right, d + 1, 2 * idx + 2);
}

int widthOfBinaryTree(TreeNode* root) {
    first.clear(); best = 0;
    dfs(root, 0, 0);
    return best;
}`,
        java: `private List<Long> first;
private long best;

int widthOfBinaryTree(TreeNode root) {
    first = new ArrayList<>();
    best = 0;
    dfs(root, 0, 0L);
    return (int) best;
}

private void dfs(TreeNode n, int d, long idx) {   // long 溢位也會繞回,相減結果正確
    if (n == null) return;
    if (d == first.size()) first.add(idx);
    best = Math.max(best, idx - first.get(d) + 1);
    dfs(n.left, d + 1, 2 * idx + 1);
    dfs(n.right, d + 1, 2 * idx + 2);
}`,
        javascript: `function widthOfBinaryTree(root) {
  const first = [];
  let best = 0n;
  const dfs = (n, d, idx) => {
    if (!n) return;
    if (d === first.length) first.push(idx);
    const w = BigInt.asUintN(64, idx - first[d]) + 1n;   // 模擬 64 位元無號整數
    if (w > best) best = w;
    dfs(n.left, d + 1, BigInt.asUintN(64, 2n * idx + 1n));
    dfs(n.right, d + 1, BigInt.asUintN(64, 2n * idx + 2n));
  };
  dfs(root, 0, 0n);
  return Number(best);
}`,
      },
    },
  ],
  pitfalls: ['只數每層的節點數:中間的空位也要算', '直接用 2i + 1 的編號不正規化:深度 3000 的歪斜樹會溢位(甚至 64 位元也不夠)', 'JavaScript 的數字超過 2⁵³ 就失準,要嘛每層正規化,要嘛用 BigInt'],
  check: {
    kind: 'fn',
    fn: 'widthOfBinaryTree',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: 4 },
      { args: [[1, 3, 2, 5, null, null, 9, 6, null, 7]], out: 7 },
      { args: [[1, 3, 2, 5]], out: 2 },
      { args: [[1]], out: 1 },
      { args: [[1, 1, 1, 1, null, null, 1, 1, null, null, 1]], out: 8 },
    ],
  },
}
