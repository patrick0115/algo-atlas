import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 235. Lowest Common Ancestor of a Binary Search Tree

const T = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]
const P = 3
const Q = 5

const idxOf = (v: number) => T.indexOf(v)

function bstFig(): FigStep[] {
  let n: FNode | null = buildTree(T)
  const out: FigStep[] = [{ note: `找 ${P} 和 ${Q} 的「最近共同祖先」:同時是兩者祖先、而且最深的那個節點(節點自己也算自己的祖先)。BST 的性質讓我們只要從根往下走一條路`, views: [tree(T, { cls: { [idxOf(P)]: 'visited', [idxOf(Q)]: 'visited' } })] }]
  const path: Record<number, string> = {}
  while (n) {
    path[n.i] = 'done'
    if (P < n.val && Q < n.val) {
      out.push({ note: `${P}、${Q} 都比 ${n.val} 小 → 兩個都在左子樹,共同祖先也在左邊,往左走`, views: [tree(T, { cls: { ...path, [idxOf(P)]: 'visited', [idxOf(Q)]: 'visited', [n.i]: 'hl' } })] })
      n = n.left
    } else if (P > n.val && Q > n.val) {
      out.push({ note: `${P}、${Q} 都比 ${n.val} 大 → 往右走`, views: [tree(T, { cls: { ...path, [idxOf(P)]: 'visited', [idxOf(Q)]: 'visited', [n.i]: 'hl' } })] })
      n = n.right
    } else {
      out.push({ note: `${P} 和 ${Q} 分在 ${n.val} 的兩邊(或其中一個就是 ${n.val})→ 從這裡開始分岔,${n.val} 就是最近共同祖先`, views: [tree(T, { cls: { ...path, [idxOf(P)]: 'visited', [idxOf(Q)]: 'visited', [n.i]: 'hl' } })] })
      break
    }
  }
  return out
}

function generalFig(): FigStep[] {
  const root = buildTree(T)
  const ret: Record<number, string> = {}
  const out: FigStep[] = [{ note: '不用 BST 性質的通用做法(236 題):後序遍歷,每個節點回報「我的子樹裡有沒有找到 p 或 q」', views: [tree(T)] }]
  const go = (n: FNode | null): FNode | null => {
    if (!n) return null
    if (n.val === P || n.val === Q) {
      ret[n.i] = '找到'
      out.push({ note: `節點 ${n.val} 就是要找的其中一個 → 回報自己`, views: [tree(T, { subs: { ...ret }, cls: { [n.i]: 'hl' } })] })
      return n
    }
    const l = go(n.left)
    const r = go(n.right)
    const res = l && r ? n : (l ?? r)
    ret[n.i] = res ? `回報 ${res.val}` : '沒有'
    out.push({ note: l && r ? `節點 ${n.val}:左右兩邊都找到了 → 它就是最近共同祖先` : `節點 ${n.val}:${res ? `只有一邊找到 ${res.val},往上傳` : '兩邊都沒找到,回報空'}`, views: [tree(T, { subs: { ...ret }, cls: { [n.i]: l && r ? 'done' : 'hl' } })] })
    return res
  }
  go(root)
  return out
}

export const q0235: Solution = {
  id: 235,
  plain: '在一棵二元搜尋樹裡,找兩個節點「最近的共同祖先」:從根往下走,兩個都在左邊就往左、都在右邊就往右,兩個開始分開走的那個岔路口,就是答案。像兩個人的族譜往上找,最近的那位共同長輩。',
  statement: '給一棵**二元搜尋樹**和其中兩個節點 `p`、`q`,找出它們的**最近共同祖先**(LCA):同時是 p 和 q 的祖先、而且深度最大的節點。一個節點也算是自己的祖先。',
  examples: [
    { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6' },
    { input: '同上, p = 2, q = 4', output: '2', note: '2 是 4 的祖先,也是自己的祖先' },
    { input: '同上, p = 3, q = 5', output: '4' },
  ],
  constraints: ['`2 ≤ 節點數 ≤ 10⁵`,值都不同', 'p、q 一定在樹裡'],
  insight: [
    '從根往下看:如果 p、q **都比目前節點小**,它們都在左子樹,共同祖先一定也在左子樹裡',
    '都比較大 → 都在右子樹,往右',
    '一大一小(或其中一個就是目前節點)→ 它們在這裡「分道揚鑣」,再往下就不是共同祖先了 → 目前節點就是答案',
    'BST 讓我們只走一條路(O(h));一般二元樹(236)就要用後序遍歷看左右子樹有沒有找到',
  ],
  approaches: [
    {
      name: '利用 BST:從根往下走(迭代)',
      idea: 'p、q 都小於目前節點就往左,都大於就往右,否則目前節點就是答案。',
      steps: ['`cur = root`', '`p.val < cur.val and q.val < cur.val` → `cur = cur.left`', '`p.val > cur.val and q.val > cur.val` → `cur = cur.right`', '否則回傳 `cur`'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}], p = ${P}, q = ${Q}`, steps: bstFig() },
      complexity: { time: 'O(h)', space: 'O(1)', why: '只走一條從根往下的路;平衡時 h = log n。' },
      verdict: '標準解,有用到 BST 的性質,而且不需要遞迴。',
      code: {
        python: `def lowestCommonAncestor(root, p, q):
    cur = root
    while cur:
        if p.val < cur.val and q.val < cur.val:
            cur = cur.left                # 都在左邊
        elif p.val > cur.val and q.val > cur.val:
            cur = cur.right               # 都在右邊
        else:
            return cur                    # 分岔了(或其中一個就是 cur)`,
        c: `struct TreeNode *lowestCommonAncestor(struct TreeNode *root, struct TreeNode *p, struct TreeNode *q) {
    struct TreeNode *cur = root;
    while (cur) {
        if (p->val < cur->val && q->val < cur->val) cur = cur->left;
        else if (p->val > cur->val && q->val > cur->val) cur = cur->right;
        else return cur;
    }
    return NULL;
}`,
        cpp: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    TreeNode* cur = root;
    while (cur) {
        if (p->val < cur->val && q->val < cur->val) cur = cur->left;
        else if (p->val > cur->val && q->val > cur->val) cur = cur->right;
        else return cur;
    }
    return nullptr;
}`,
        java: `TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    TreeNode cur = root;
    while (cur != null) {
        if (p.val < cur.val && q.val < cur.val) cur = cur.left;
        else if (p.val > cur.val && q.val > cur.val) cur = cur.right;
        else return cur;
    }
    return null;
}`,
        javascript: `function lowestCommonAncestor(root, p, q) {
  let cur = root;
  while (cur) {
    if (p.val < cur.val && q.val < cur.val) cur = cur.left;
    else if (p.val > cur.val && q.val > cur.val) cur = cur.right;
    else return cur;
  }
  return null;
}`,
      },
    },
    {
      name: '一般二元樹的做法(後序遍歷)',
      idea: '不靠 BST 性質:`dfs(n)` 回傳「n 的子樹裡找到的 p 或 q(或 LCA)」。n 本身是 p 或 q 就回傳 n;左右都找到 → n 是 LCA;只有一邊找到 → 把那邊的結果往上傳。',
      steps: ['`dfs(n)`:空 → null;`n` 是 p 或 q → 回傳 `n`', '`l = dfs(左)`、`r = dfs(右)`', '`l` 和 `r` 都不是 null → 回傳 `n`', '否則回傳不是 null 的那個'],
      figure: { title: `root = [${T.map((v) => v ?? 'null').join(',')}], p = ${P}, q = ${Q}`, steps: generalFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '最壞要看過每個節點;遞迴深度是樹高。' },
      verdict: '這是 236. LCA of a Binary Tree 的標準解,對 BST 也成立,但沒有用到 BST 的性質,比較慢。兩題一起學,記得「有 BST 就往下走一條路」。',
      code: {
        python: `def lowestCommonAncestor(root, p, q):
    if not root or root is p or root is q:
        return root
    l = lowestCommonAncestor(root.left, p, q)
    r = lowestCommonAncestor(root.right, p, q)
    if l and r:
        return root                       # 一邊一個,root 就是分岔點
    return l or r`,
        c: `struct TreeNode *lowestCommonAncestor(struct TreeNode *root, struct TreeNode *p, struct TreeNode *q) {
    if (!root || root == p || root == q) return root;
    struct TreeNode *l = lowestCommonAncestor(root->left, p, q);
    struct TreeNode *r = lowestCommonAncestor(root->right, p, q);
    if (l && r) return root;
    return l ? l : r;
}`,
        cpp: `TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* l = lowestCommonAncestor(root->left, p, q);
    TreeNode* r = lowestCommonAncestor(root->right, p, q);
    if (l && r) return root;
    return l ? l : r;
}`,
        java: `TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode l = lowestCommonAncestor(root.left, p, q);
    TreeNode r = lowestCommonAncestor(root.right, p, q);
    if (l != null && r != null) return root;
    return l != null ? l : r;
}`,
        javascript: `function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const l = lowestCommonAncestor(root.left, p, q);
  const r = lowestCommonAncestor(root.right, p, q);
  if (l && r) return root;
  return l || r;
}`,
      },
    },
  ],
  pitfalls: [
    '條件寫成「一個 < 另一個 >」才回傳:p 或 q 剛好等於目前節點時也要回傳(範例二的 2)',
    '比較時用節點本身(位址)而不是值:BST 版要比 `val`;一般版的 `root == p` 才是比節點',
    '不要預設 p < q:題目沒保證,兩個條件都要同時檢查',
  ],
  followUp: [
    { q: '一般二元樹(不是 BST)?', a: '236:用方法二的後序遍歷,O(n)。' },
    { q: '有 parent 指標?', a: '1650:變成「兩條串列找交點」,和 160. Intersection of Two Linked Lists 一樣的雙指針。' },
  ],
  check: {
    kind: 'fn',
    fn: 'lowestCommonAncestor',
    argKinds: ['tree', 'nodeIn0', 'nodeIn0'],
    ret: 'nodeIn0',
    cases: [
      { args: [T, 2, 8], out: 6 },
      { args: [T, 2, 4], out: 2 },
      { args: [T, P, Q], out: 4 },
      { args: [T, 7, 9], out: 8 },
      { args: [T, 0, 5], out: 2 },
      { args: [[2, 1], 2, 1], out: 2 },
    ],
  },
}
