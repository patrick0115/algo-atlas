import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 110. Balanced Binary Tree

const T = [1, 2, 2, 3, null, null, 3, 4, null, null, 4]

function topDownFig(): FigStep[] {
  const root = buildTree(T)
  const h = (n: FNode | null): number => (n ? 1 + Math.max(h(n.left), h(n.right)) : 0)
  const out: FigStep[] = [{ note: '「平衡」:**每一個**節點的左右子樹高度差都 ≤ 1。由上往下:每個節點都算一次左右高度來檢查', views: [tree(T)] }]
  const go = (n: FNode | null): boolean => {
    if (!n) return true
    const l = h(n.left)
    const r = h(n.right)
    const ok = Math.abs(l - r) <= 1
    out.push({ note: `節點 ${n.val}:左高 ${l}、右高 ${r},差 ${Math.abs(l - r)} ${ok ? '≤ 1 ✓,再檢查它的左右子樹' : '> 1 → 不平衡'}`, views: [tree(T, { cls: { [n.i]: ok ? 'hl' : 'visited' } })] })
    return ok && go(n.left) && go(n.right)
  }
  go(root)
  return out
}

function bottomUpFig(): FigStep[] {
  const root = buildTree(T)
  const ht: Record<number, number | string> = {}
  const out: FigStep[] = [{ note: '由下往上:dfs 回傳高度,如果發現不平衡就回傳 −1,一路往上傳,不用再算別的', views: [tree(T)] }]
  const go = (n: FNode | null): number => {
    if (!n) return 0
    const l = go(n.left)
    if (l === -1) return -1
    const r = go(n.right)
    if (r === -1) return -1
    if (Math.abs(l - r) > 1) {
      ht[n.i] = '−1'
      out.push({ note: `節點 ${n.val}:左高 ${l}、右高 ${r},差 ${Math.abs(l - r)} > 1 → 回傳 −1(不平衡),上面的節點看到 −1 就直接往上傳`, views: [tree(T, { subs: { ...ht }, cls: { [n.i]: 'visited' } })] })
      return -1
    }
    ht[n.i] = 1 + Math.max(l, r)
    out.push({ note: `節點 ${n.val}:左高 ${l}、右高 ${r},差 ≤ 1 ✓,回傳高度 ${ht[n.i]}`, views: [tree(T, { subs: { ...ht }, cls: { [n.i]: 'hl' } })] })
    return ht[n.i] as number
  }
  const r = go(root)
  out.push({ note: r === -1 ? '根拿到 −1 → 不平衡,回傳 false' : '平衡', views: [tree(T, { subs: ht })] })
  return out
}

export const q0110: Solution = {
  id: 110,
  plain: '檢查一棵樹「左右兩邊的高度有沒有差太多」:**每一個節點**的左邊和右邊,高度最多只能差 1。像蓋房子,每一層的左右兩側不能一邊高一邊矮太多。',
  statement: '判斷一棵二元樹是不是**高度平衡**:樹中**每個**節點的左右子樹高度差都不超過 1。',
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: 'true' },
    { input: 'root = [1,2,2,3,3,null,null,4,4]', output: 'false', note: '根的左邊高 3、右邊高 1' },
    { input: 'root = []', output: 'true' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 5000` → 由上往下重算高度最壞 O(n²) = 2500 萬,能過但浪費'],
  insight: [
    '條件是「**每個**節點」都平衡,只檢查根不夠(根的左右高度一樣,但某個子樹內部可能歪掉)',
    '由上往下:每個節點都去算左右高度 → 同一棵子樹的高度會被重算很多次',
    '由下往上:和 [104](#/q/104) 一樣用後序算高度,算的時候順便檢查。發現不平衡就回傳一個「特殊值」(−1)一路往上傳,不用再算',
  ],
  approaches: [
    {
      name: '由上往下:每個節點都算高度',
      idea: '`balanced(n)` = `|height(左) − height(右)| ≤ 1` 且 `balanced(左)` 且 `balanced(右)`。',
      steps: ['空樹 → true', '算 `height(n.left)`、`height(n.right)`,差 > 1 → false', '遞迴檢查左右子樹'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: topDownFig() },
      complexity: { time: 'O(n²)', space: 'O(h)', why: '每個節點都會算一次它子樹的高度;樹是一條鍊時總共 O(n²)。平衡的樹是 O(n log n)。' },
      verdict: '直接照定義寫,好懂。但高度被重複計算。',
      code: {
        python: `def isBalanced(root):
    def height(n):
        return 1 + max(height(n.left), height(n.right)) if n else 0

    if not root:
        return True
    if abs(height(root.left) - height(root.right)) > 1:
        return False
    return isBalanced(root.left) and isBalanced(root.right)`,
        c: `static int height(struct TreeNode *n) {
    if (!n) return 0;
    int l = height(n->left), r = height(n->right);
    return 1 + (l > r ? l : r);
}

bool isBalanced(struct TreeNode *root) {
    if (!root) return true;
    if (abs(height(root->left) - height(root->right)) > 1) return false;
    return isBalanced(root->left) && isBalanced(root->right);
}`,
        cpp: `int height(TreeNode* n) {
    return n ? 1 + max(height(n->left), height(n->right)) : 0;
}

bool isBalanced(TreeNode* root) {
    if (!root) return true;
    if (abs(height(root->left) - height(root->right)) > 1) return false;
    return isBalanced(root->left) && isBalanced(root->right);
}`,
        java: `boolean isBalanced(TreeNode root) {
    if (root == null) return true;
    if (Math.abs(height(root.left) - height(root.right)) > 1) return false;
    return isBalanced(root.left) && isBalanced(root.right);
}

private int height(TreeNode n) {
    return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right));
}`,
        javascript: `function isBalanced(root) {
  const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
  if (!root) return true;
  if (Math.abs(height(root.left) - height(root.right)) > 1) return false;
  return isBalanced(root.left) && isBalanced(root.right);
}`,
      },
    },
    {
      name: '由下往上:回傳高度,不平衡就回傳 −1',
      idea: '`dfs(n)` 回傳 n 的高度;如果 n 或它底下任何地方不平衡,回傳 −1。看到孩子回傳 −1 就直接往上傳。',
      steps: ['`dfs(n)`:空 → 0', '`l = dfs(左)`,是 −1 → 回傳 −1', '`r = dfs(右)`,是 −1 → 回傳 −1', '`|l − r| > 1` → 回傳 −1', '回傳 `1 + max(l, r)`;答案是 `dfs(root) != −1`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: bottomUpFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點只算一次。' },
      verdict: '標準解。用一個「不可能的值」(高度不會是負的)同時傳遞兩種資訊(高度、是否失敗),是很常見的技巧。',
      code: {
        python: `def isBalanced(root):
    def dfs(n):                           # 回傳高度;不平衡回傳 -1
        if not n:
            return 0
        l = dfs(n.left)
        if l == -1:
            return -1
        r = dfs(n.right)
        if r == -1 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)

    return dfs(root) != -1`,
        c: `static int dfs(struct TreeNode *n) {
    if (!n) return 0;
    int l = dfs(n->left);
    if (l == -1) return -1;
    int r = dfs(n->right);
    if (r == -1 || abs(l - r) > 1) return -1;
    return 1 + (l > r ? l : r);
}

bool isBalanced(struct TreeNode *root) {
    return dfs(root) != -1;
}`,
        cpp: `int dfs(TreeNode* n) {
    if (!n) return 0;
    int l = dfs(n->left);
    if (l == -1) return -1;
    int r = dfs(n->right);
    if (r == -1 || abs(l - r) > 1) return -1;
    return 1 + max(l, r);
}

bool isBalanced(TreeNode* root) {
    return dfs(root) != -1;
}`,
        java: `boolean isBalanced(TreeNode root) {
    return dfs(root) != -1;
}

private int dfs(TreeNode n) {
    if (n == null) return 0;
    int l = dfs(n.left);
    if (l == -1) return -1;
    int r = dfs(n.right);
    if (r == -1 || Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
}`,
        javascript: `function isBalanced(root) {
  const dfs = (n) => {
    if (!n) return 0;
    const l = dfs(n.left);
    if (l === -1) return -1;
    const r = dfs(n.right);
    if (r === -1 || Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  };
  return dfs(root) !== -1;
}`,
      },
    },
  ],
  pitfalls: [
    '只檢查根的左右高度:圖示裡這棵樹根的左右高度都是 3,但下面的節點不平衡',
    '把「平衡」想成「完全二元樹」或「所有葉子同一層」:只要求每個節點左右差 ≤ 1',
    '由下往上版忘了把 −1 往上傳:孩子不平衡時,父節點還拿 −1 去算高度,結果會錯',
  ],
  followUp: [
    { q: '怎麼把一棵不平衡的 BST 變平衡?', a: '1382. Balance a Binary Search Tree:中序遍歷得到排好的陣列,再每次取中間當根遞迴建樹(108 題)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isBalanced',
    argKinds: ['tree'],
    cases: [
      { args: [[3, 9, 20, null, null, 15, 7]], out: true },
      { args: [[1, 2, 2, 3, 3, null, null, 4, 4]], out: false },
      { args: [[]], out: true },
      { args: [T], out: false },
      { args: [[1, 2, 3, 4]], out: true },
      { args: [[1, null, 2, null, 3]], out: false },
    ],
  },
}
