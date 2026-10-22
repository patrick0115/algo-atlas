import { arr } from '../engine/helpers'
import { buildTree, tree, type FNode } from './fig'
import type { FigStep, Solution } from './types'

// 124. Binary Tree Maximum Path Sum

const T = [-10, 9, 20, null, null, 15, 7]

function dfsFig(): FigStep[] {
  const root = buildTree(T)
  const gain: Record<number, number> = {}
  let best = -Infinity
  const out: FigStep[] = [
    {
      note: '路徑可以從任何節點開始、在任何節點結束,但不能分岔。換個角度:每條路徑都有一個「最高點」,路徑從最高點往左下延伸一段、往右下延伸一段',
      views: [tree(T, { label: '樹' })],
    },
  ]
  const cls: Record<number, string> = {}
  const dfs = (n: FNode | null): number => {
    if (!n) return 0
    const l = Math.max(dfs(n.left), 0)
    const r = Math.max(dfs(n.right), 0)
    const through = n.val + l + r
    const better = through > best
    best = Math.max(best, through)
    gain[n.i] = n.val + Math.max(l, r)
    cls[n.i] = 'done'
    out.push({
      note: `節點 ${n.val}:左邊最多貢獻 ${l}、右邊最多貢獻 ${r}(負的就不要,當 0)。以它為最高點的路徑 = ${n.val} + ${l} + ${r} = ${through}${better ? ' → 目前最大' : ''}。往上回傳「只能選一邊」的 ${n.val} + max(${l}, ${r}) = ${gain[n.i]}`,
      views: [tree(T, { label: 'subs = 回傳給父節點的值', cls: { ...cls, [n.i]: 'hl' }, subs: { ...gain } }), arr([best], { label: '目前最大路徑和' })],
    })
    return gain[n.i]
  }
  dfs(root)
  out.push({ note: `答案 ${best}:15 → 20 → 7`, views: [tree(T, { cls: { 2: 'done', 5: 'done', 6: 'done' } }), arr([best], { label: '答案', done: [0] })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:把每個節點當作最高點,另外各算一次「往左下最多能拿多少」「往右下最多能拿多少」', views: [tree(T, { cls: { 0: 'hl' } })] },
    { note: '「往下最多能拿多少」每次都重新算整棵子樹 → 同一個子樹被算很多次,O(n²)。用後序遍歷一次算好就是 O(n)', views: [tree(T, { cls: { 2: 'hl', 5: 'dim', 6: 'dim' } })] },
  ]
}

export const q0124: Solution = {
  id: 124,
  plain: '在一棵樹上找一條「路徑」(沿著邊走,不能回頭、不能分岔),讓路上所有節點的值加起來最大。節點可能是負數,路徑不一定要經過根。',
  statement: '二元樹中的**路徑**是一串相鄰節點的序列,每個節點最多出現一次,至少包含一個節點,不一定經過根。給二元樹的 `root`,回傳所有路徑中最大的節點值總和。',
  examples: [
    { input: 'root = [1,2,3]', output: '6', note: '2 → 1 → 3' },
    { input: 'root = [-10,9,20,null,null,15,7]', output: '42', note: '15 → 20 → 7' },
  ],
  constraints: ['節點數 ≤ 3·10⁴,值在 −1000..1000'],
  insight: [
    '每條路徑都有唯一的「最高點」(離根最近的節點)。路徑 = 最高點 + 左邊往下的一段 + 右邊往下的一段',
    '定義 `gain(n)` = 從 n 出發**往下**走(只能選一邊)最多能拿多少。後序遍歷就能算',
    '以 n 為最高點的最佳路徑 = `n.val + max(gain(左), 0) + max(gain(右), 0)`(負的就不要接)',
    '關鍵區別:**更新答案**時可以左右都拿;**回傳給父節點**時只能選一邊(否則路徑會分岔)',
  ],
  approaches: [
    {
      name: '暴力:每個節點分別算往下的最大值',
      idea: '對每個節點 n,呼叫 `down(n.left)`、`down(n.right)`(各自遞迴算到底),再組合。',
      steps: ['`down(n)` = `n.val + max(0, down(n.left), down(n.right))`', '遍歷每個節點 n:`best = max(best, n.val + max(0, down(L)) + max(0, down(R)))`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null')}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(h)', why: '每個節點都要重新算一次子樹;斜的樹會到 n²。' },
      verdict: '正確但重複計算。用來理解「最高點 + 兩段往下」的拆法。',
      code: {
        python: `def maxPathSum(root):
    def down(n):                              # 從 n 往下(只走一邊)的最大和
        if not n:
            return 0
        return n.val + max(0, down(n.left), down(n.right))

    best = float('-inf')
    stack = [root]
    while stack:                              # 每個節點都當一次最高點
        n = stack.pop()
        best = max(best, n.val + max(0, down(n.left)) + max(0, down(n.right)))
        stack += [c for c in (n.left, n.right) if c]
    return best`,
        c: `static int down(struct TreeNode *n) {
    if (!n) return 0;
    int l = down(n->left), r = down(n->right), m = l > r ? l : r;
    return n->val + (m > 0 ? m : 0);
}

static void visit(struct TreeNode *n, int *best) {
    if (!n) return;
    int l = down(n->left), r = down(n->right);
    int s = n->val + (l > 0 ? l : 0) + (r > 0 ? r : 0);
    if (s > *best) *best = s;
    visit(n->left, best);
    visit(n->right, best);
}

int maxPathSum(struct TreeNode *root) {
    int best = INT_MIN;
    visit(root, &best);
    return best;
}`,
        cpp: `int down(TreeNode* n) {
    if (!n) return 0;
    return n->val + max({0, down(n->left), down(n->right)});
}

int maxPathSum(TreeNode* root) {
    int best = INT_MIN;
    function<void(TreeNode*)> visit = [&](TreeNode* n) {
        if (!n) return;
        best = max(best, n->val + max(0, down(n->left)) + max(0, down(n->right)));
        visit(n->left);
        visit(n->right);
    };
    visit(root);
    return best;
}`,
        java: `private int best;

int maxPathSum(TreeNode root) {
    best = Integer.MIN_VALUE;
    visit(root);
    return best;
}

private int down(TreeNode n) {
    if (n == null) return 0;
    return n.val + Math.max(0, Math.max(down(n.left), down(n.right)));
}

private void visit(TreeNode n) {
    if (n == null) return;
    best = Math.max(best, n.val + Math.max(0, down(n.left)) + Math.max(0, down(n.right)));
    visit(n.left);
    visit(n.right);
}`,
        javascript: `function maxPathSum(root) {
  const down = (n) => (n ? n.val + Math.max(0, down(n.left), down(n.right)) : 0);
  let best = -Infinity;
  const visit = (n) => {
    if (!n) return;
    best = Math.max(best, n.val + Math.max(0, down(n.left)) + Math.max(0, down(n.right)));
    visit(n.left);
    visit(n.right);
  };
  visit(root);
  return best;
}`,
      },
    },
    {
      name: '後序 DFS:一次算 gain 並更新答案',
      idea: '`gain(n)`:先算 `l = max(gain(左), 0)`、`r = max(gain(右), 0)`;用 `n.val + l + r` 更新答案;回傳 `n.val + max(l, r)`。',
      steps: ['`best = −∞`', '`gain(None) = 0`', '`l, r` 取 max(…, 0)', '`best = max(best, n.val + l + r)`;回傳 `n.val + max(l, r)`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null')}]`, steps: dfsFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點拜訪一次;遞迴深度是樹高。' },
      verdict: '最推薦,[[p:tree-dfs]]「回傳值 ≠ 答案」的經典題。和 [543. Diameter of Binary Tree](#/q/543) 是同一個模板。',
      code: {
        python: `def maxPathSum(root):
    best = float('-inf')

    def gain(n):
        nonlocal best
        if not n:
            return 0
        l = max(gain(n.left), 0)              # 負的就不接
        r = max(gain(n.right), 0)
        best = max(best, n.val + l + r)       # 以 n 為最高點:左右都可以拿
        return n.val + max(l, r)              # 往上只能選一邊

    gain(root)
    return best`,
        c: `static int best;

static int gain(struct TreeNode *n) {
    if (!n) return 0;
    int l = gain(n->left), r = gain(n->right);
    if (l < 0) l = 0;
    if (r < 0) r = 0;
    if (n->val + l + r > best) best = n->val + l + r;
    return n->val + (l > r ? l : r);
}

int maxPathSum(struct TreeNode *root) {
    best = INT_MIN;
    gain(root);
    return best;
}`,
        cpp: `int maxPathSum(TreeNode* root) {
    int best = INT_MIN;
    function<int(TreeNode*)> gain = [&](TreeNode* n) -> int {
        if (!n) return 0;
        int l = max(gain(n->left), 0), r = max(gain(n->right), 0);
        best = max(best, n->val + l + r);
        return n->val + max(l, r);
    };
    gain(root);
    return best;
}`,
        java: `private int best;

int maxPathSum(TreeNode root) {
    best = Integer.MIN_VALUE;
    gain(root);
    return best;
}

private int gain(TreeNode n) {
    if (n == null) return 0;
    int l = Math.max(gain(n.left), 0), r = Math.max(gain(n.right), 0);
    best = Math.max(best, n.val + l + r);
    return n.val + Math.max(l, r);
}`,
        javascript: `function maxPathSum(root) {
  let best = -Infinity;
  const gain = (n) => {
    if (!n) return 0;
    const l = Math.max(gain(n.left), 0), r = Math.max(gain(n.right), 0);
    best = Math.max(best, n.val + l + r);
    return n.val + Math.max(l, r);
  };
  gain(root);
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '回傳 `n.val + l + r`:往上接的時候路徑會分岔,不是合法路徑',
    'best 初始為 0:全部是負數時答案應該是最大的那個負數(例如 [−3] → −3)',
    '沒把負的 gain 截成 0:接上一段負的只會更小',
  ],
  check: {
    kind: 'fn',
    fn: 'maxPathSum',
    argKinds: ['tree'],
    cases: [
      { args: [[1, 2, 3]], out: 6 },
      { args: [T], out: 42 },
      { args: [[-3]], out: -3 },
      { args: [[2, -1]], out: 2 },
      { args: [[-2, -1, -3]], out: -1 },
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], out: 48 },
    ],
  },
}
