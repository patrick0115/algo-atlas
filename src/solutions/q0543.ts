import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 543. Diameter of Binary Tree

const T = [1, 2, 3, 4, 5, null, null, 6, null, null, 7]

function bruteFig(): FigStep[] {
  const root = buildTree(T)
  const h = (n: FNode | null): number => (n ? 1 + Math.max(h(n.left), h(n.right)) : 0)
  const out: FigStep[] = [{ note: '最長路徑一定會在某個節點「轉彎」:從左邊最深處上來、經過它、再往右邊最深處下去。長度 = 左子樹高度 + 右子樹高度。對每個節點都算一次', views: [tree(T)] }]
  let best = 0
  const go = (n: FNode | null) => {
    if (!n) return
    const l = h(n.left)
    const r = h(n.right)
    best = Math.max(best, l + r)
    out.push({ note: `以 ${n.val} 為轉折點:左高 ${l} + 右高 ${r} = ${l + r}(重新從頭算高度,所以很慢)。最長 ${best}`, views: [tree(T, { cls: { [n.i]: 'hl' } })] })
    go(n.left)
    go(n.right)
  }
  go(root)
  return out
}

function oneFig(): FigStep[] {
  const root = buildTree(T)
  const ht: Record<number, number> = {}
  let best = 0
  const out: FigStep[] = [{ note: '一次後序遍歷:每個節點**回傳自己的高度**給父節點,**順便**用「左高 + 右高」更新答案。節點下方是它的高度', views: [tree(T)] }]
  const go = (n: FNode | null): number => {
    if (!n) return 0
    const l = go(n.left)
    const r = go(n.right)
    ht[n.i] = 1 + Math.max(l, r)
    const was = best
    best = Math.max(best, l + r)
    out.push({ note: `節點 ${n.val}:左高 ${l}、右高 ${r}。經過它的最長路徑 = ${l + r}${best > was ? `,刷新答案 ${best}` : `,答案仍是 ${best}`}。往上回傳高度 1 + max(${l}, ${r}) = ${ht[n.i]}`, views: [tree(T, { subs: { ...ht }, cls: { ...Object.fromEntries(Object.keys(ht).map((k) => [k, 'done'])), [n.i]: 'hl' } })] })
    return ht[n.i]
  }
  go(root)
  out.push({ note: `答案 = ${best}(路徑 6 → 4 → 2 → 5 → 7,共 ${best} 條邊)`, views: [tree(T, { subs: ht, cls: { 7: 'hl', 3: 'hl', 1: 'hl', 4: 'hl', 10: 'hl' } })] })
  return out
}

export const q0543: Solution = {
  id: 543,
  plain: '在一棵樹裡找「最遠的兩個節點」之間的距離(數經過幾條邊)。這條最長的路不一定經過根,可能整條都在某一邊。',
  statement: '給二元樹的根,回傳它的**直徑**:任意兩個節點之間最長路徑的**邊數**。這條路徑不一定經過根。',
  examples: [
    { input: 'root = [1,2,3,4,5]', output: '3', note: '4 → 2 → 1 → 3 或 5 → 2 → 1 → 3' },
    { input: 'root = [1,2]', output: '1' },
  ],
  constraints: ['`1 ≤ 節點數 ≤ 10⁴` → 對每個節點重算高度是 O(n²),樹很歪時會到 10⁸'],
  insight: [
    '任何一條路徑都有一個「最高點」(轉彎的地方)。經過節點 X 當最高點的最長路徑 = X 左子樹的高度 + X 右子樹的高度',
    '所以答案 = 所有節點的「左高 + 右高」取最大',
    '慢的做法:對每個節點重新算一次左右高度 → O(n²)',
    '快的做法:算高度本來就是後序遍歷,在算高度的**同時**順便更新答案 → 一次遍歷 O(n)。函式回傳一個東西(高度),但順便記錄另一個東西(直徑)',
  ],
  approaches: [
    {
      name: '每個節點都重算高度',
      idea: '對每個節點 X,呼叫 `height(X.left) + height(X.right)`,取最大。`height` 每次都從頭遞迴。',
      steps: ['`height(n)`:空 → 0,否則 `1 + max(height(左), height(右))`', '走過每個節點,`best = max(best, height(左) + height(右))`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(h)', why: '每個節點都算一次它子樹的高度,最壞(一條鍊)是 n + (n−1) + … = O(n²)。' },
      verdict: '想法正確,但重複算了很多次高度。',
      code: {
        python: `def diameterOfBinaryTree(root):
    def height(n):
        return 1 + max(height(n.left), height(n.right)) if n else 0

    best = 0
    stack = [root]
    while stack:
        n = stack.pop()
        if n:
            best = max(best, height(n.left) + height(n.right))
            stack += [n.left, n.right]
    return best`,
        c: `static int height(struct TreeNode *n) {
    if (!n) return 0;
    int l = height(n->left), r = height(n->right);
    return 1 + (l > r ? l : r);
}

int diameterOfBinaryTree(struct TreeNode *root) {
    if (!root) return 0;
    int here = height(root->left) + height(root->right);
    int l = diameterOfBinaryTree(root->left), r = diameterOfBinaryTree(root->right);
    int best = here > l ? here : l;
    return best > r ? best : r;
}`,
        cpp: `int height(TreeNode* n) {
    return n ? 1 + max(height(n->left), height(n->right)) : 0;
}

int diameterOfBinaryTree(TreeNode* root) {
    if (!root) return 0;
    return max({height(root->left) + height(root->right),
                diameterOfBinaryTree(root->left),
                diameterOfBinaryTree(root->right)});
}`,
        java: `int diameterOfBinaryTree(TreeNode root) {
    if (root == null) return 0;
    int here = height(root.left) + height(root.right);
    return Math.max(here, Math.max(diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right)));
}

private int height(TreeNode n) {
    return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right));
}`,
        javascript: `function diameterOfBinaryTree(root) {
  const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
  if (!root) return 0;
  return Math.max(
    height(root.left) + height(root.right),
    diameterOfBinaryTree(root.left),
    diameterOfBinaryTree(root.right),
  );
}`,
      },
    },
    {
      name: '一次後序遍歷:回傳高度、順便更新直徑',
      idea: '`dfs(n)` 回傳 n 的高度;在回傳之前,用 `左高 + 右高` 更新全域的最大值。',
      steps: ['`best = 0`', '`dfs(n)`:空 → 0', '`l = dfs(n.left)`、`r = dfs(n.right)`', '`best = max(best, l + r)`', '回傳 `1 + max(l, r)`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}]`, steps: oneFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點只算一次。' },
      verdict: '標準解。「遞迴回傳 A,順便更新答案 B」是樹題最重要的套路之一:110(平衡)、124(最大路徑和)、687(同值最長路徑)都是它。',
      code: {
        python: `def diameterOfBinaryTree(root):
    best = 0

    def dfs(n):                           # 回傳高度
        nonlocal best
        if not n:
            return 0
        l, r = dfs(n.left), dfs(n.right)
        best = max(best, l + r)           # 順便:經過 n 的最長路徑
        return 1 + max(l, r)

    dfs(root)
    return best`,
        c: `static int best;

static int dfs(struct TreeNode *n) {
    if (!n) return 0;
    int l = dfs(n->left), r = dfs(n->right);
    if (l + r > best) best = l + r;
    return 1 + (l > r ? l : r);
}

int diameterOfBinaryTree(struct TreeNode *root) {
    best = 0;
    dfs(root);
    return best;
}`,
        cpp: `int diameterOfBinaryTree(TreeNode* root) {
    int best = 0;
    function<int(TreeNode*)> dfs = [&](TreeNode* n) {
        if (!n) return 0;
        int l = dfs(n->left), r = dfs(n->right);
        best = max(best, l + r);
        return 1 + max(l, r);
    };
    dfs(root);
    return best;
}`,
        java: `private int best;

int diameterOfBinaryTree(TreeNode root) {
    best = 0;
    dfs(root);
    return best;
}

private int dfs(TreeNode n) {
    if (n == null) return 0;
    int l = dfs(n.left), r = dfs(n.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
}`,
        javascript: `function diameterOfBinaryTree(root) {
  let best = 0;
  const dfs = (n) => {
    if (!n) return 0;
    const l = dfs(n.left), r = dfs(n.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
  };
  dfs(root);
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '只算經過根的路徑:最長路徑可能整條都在左子樹裡(例如左子樹很茂密、右子樹很小)',
    '直徑算的是**邊數**:`左高 + 右高`(高度以節點數計)剛好等於邊數,不要再 +1',
    'C / Java 用全域變數記答案時,每次呼叫要記得重設成 0(LeetCode 會在同一個程式裡跑很多筆測資)',
  ],
  followUp: [
    { q: '路徑上的節點有權重,要最大和?', a: '124. Binary Tree Maximum Path Sum:同樣的套路,回傳「往下單邊的最大和」,順便用「左 + 右 + 自己」更新答案;負的貢獻要砍成 0。' },
  ],
  check: {
    kind: 'fn',
    fn: 'diameterOfBinaryTree',
    argKinds: ['tree'],
    cases: [
      { args: [[1, 2, 3, 4, 5]], out: 3 },
      { args: [[1, 2]], out: 1 },
      { args: [[1]], out: 0 },
      { args: [T], out: 4 },
      { args: [[1, 2, null, 3, 4, 5, null, null, 6]], out: 4 },
    ],
  },
}
