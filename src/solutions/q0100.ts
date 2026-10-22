import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 100. Same Tree

const P = [1, 2, 3, 4]
const Q = [1, 2, 3, null, 4]

function recurFig(): FigStep[] {
  const a = buildTree(P)
  const b = buildTree(Q)
  const okP: Record<number, string> = {}
  const okQ: Record<number, string> = {}
  const out: FigStep[] = [{ note: '兩棵樹一樣 ⇔ 根的值一樣,而且左子樹一樣、右子樹一樣。同時往下走,兩邊一對一比較', views: [tree(P, { label: 'p' }), tree(Q, { label: 'q' })] }]
  const go = (x: FNode | null, y: FNode | null): boolean => {
    if (!x && !y) return true
    if (!x || !y) {
      out.push({ note: `一邊有節點(${(x ?? y)!.val})、另一邊是空的 → 不一樣`, views: [tree(P, { label: 'p', cls: { ...okP, ...(x ? { [x.i]: 'hl' } : {}) } }), tree(Q, { label: 'q', cls: { ...okQ, ...(y ? { [y.i]: 'hl' } : {}) } })] })
      return false
    }
    if (x.val !== y.val) {
      out.push({ note: `值不同:${x.val} ≠ ${y.val} → 不一樣`, views: [tree(P, { label: 'p', cls: { ...okP, [x.i]: 'hl' } }), tree(Q, { label: 'q', cls: { ...okQ, [y.i]: 'hl' } })] })
      return false
    }
    okP[x.i] = 'done'
    okQ[y.i] = 'done'
    out.push({ note: `${x.val} = ${y.val} ✓,接著比左子樹、再比右子樹`, views: [tree(P, { label: 'p', cls: { ...okP, [x.i]: 'hl' } }), tree(Q, { label: 'q', cls: { ...okQ, [y.i]: 'hl' } })] })
    return go(x.left, y.left) && go(x.right, y.right)
  }
  go(a, b)
  return out
}

function bfsFig(): FigStep[] {
  const a = buildTree(P)
  const b = buildTree(Q)
  const q: [FNode | null, FNode | null][] = [[a, b]]
  const out: FigStep[] = [{ note: '不用遞迴:佇列裡放「要比較的一對節點」', views: [tree(P, { label: 'p' }), tree(Q, { label: 'q' })] }]
  while (q.length) {
    const [x, y] = q.shift()!
    if (!x && !y) continue
    const same = !!x && !!y && x.val === y.val
    out.push({ note: `拿出一對:${x?.val ?? '空'} 和 ${y?.val ?? '空'} → ${same ? '一樣,把它們的(左,左)、(右,右)放進佇列' : '不一樣 → false'}`, views: [tree(P, { label: 'p', cls: x ? { [x.i]: 'hl' } : {} }), tree(Q, { label: 'q', cls: y ? { [y.i]: 'hl' } : {} }), arr(q.map(([u, v]) => `${u?.val ?? '∅'}/${v?.val ?? '∅'}`), { label: '佇列(p/q)' })] })
    if (!same) break
    q.push([x!.left, y!.left], [x!.right, y!.right])
  }
  return out
}

export const q0100: Solution = {
  id: 100,
  plain: '判斷兩棵樹是不是「一模一樣」:形狀要一樣,每個位置上的數字也要一樣。像比對兩份族譜:同一個位置的人名都要相同,誰有幾個孩子也要相同。',
  statement: '給兩棵二元樹的根 `p`、`q`,判斷它們是否**相同**:結構完全一樣,而且對應節點的值都相等。',
  examples: [
    { input: 'p = [1,2,3], q = [1,2,3]', output: 'true' },
    { input: 'p = [1,2], q = [1,null,2]', output: 'false', note: '一個 2 在左邊、一個在右邊' },
    { input: 'p = [1,2,1], q = [1,1,2]', output: 'false' },
  ],
  constraints: ['兩棵樹各 `0 ~ 100` 個節點 → 可能是空樹'],
  insight: [
    '「兩棵樹相同」= 根相同 + 左子樹相同 + 右子樹相同 → 同時遞迴兩棵樹',
    '終止條件要想清楚:兩個都空 → 相同;只有一個空 → 不同;都不空 → 比值,再往下',
    '這個「同時走兩棵樹」的寫法,是 101(對稱樹)、572(子樹)的基礎',
  ],
  approaches: [
    {
      name: '遞迴同時走兩棵樹',
      idea: '`same(p, q)`:都空 → true;一個空 → false;值不同 → false;否則回傳 `same(左, 左) and same(右, 右)`。',
      steps: ['`p` 和 `q` 都是 null → `true`', '其中一個是 null → `false`', '`p.val != q.val` → `false`', '回傳 `same(p.left, q.left) and same(p.right, q.right)`'],
      figure: { title: `p = [${P.join(',')}], q = [${Q.map((v) => v ?? 'null').join(',')}]`, steps: recurFig() },
      complexity: { time: 'O(min(m, n))', space: 'O(min(h₁, h₂))', why: '最多比到其中一棵走完(或提早發現不同);遞迴深度是較矮那棵的高度。' },
      verdict: '標準解,三種終止條件的順序是重點。',
      code: {
        python: `def isSameTree(p, q):
    if not p and not q:
        return True
    if not p or not q:                    # 只有一邊是空的
        return False
    if p.val != q.val:
        return False
    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)`,
        c: `bool isSameTree(struct TreeNode *p, struct TreeNode *q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    if (p->val != q->val) return false;
    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
}`,
        cpp: `bool isSameTree(TreeNode* p, TreeNode* q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    if (p->val != q->val) return false;
    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
}`,
        java: `boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null) return false;
    if (p.val != q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
        javascript: `function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
      },
    },
    {
      name: '迭代:佇列裡放成對的節點',
      idea: '佇列每一項是「要比較的一對節點」。拿出來比,一樣就把(左,左)、(右,右)放進去。',
      steps: ['`queue = [(p, q)]`', '拿出 `(a, b)`:都空 → 跳過;一個空或值不同 → `false`', '放入 `(a.left, b.left)`、`(a.right, b.right)`', '佇列空了 → `true`'],
      figure: { title: `p = [${P.join(',')}], q = [${Q.map((v) => v ?? 'null').join(',')}]`, steps: bfsFig() },
      complexity: { time: 'O(min(m, n))', space: 'O(min(m, n))', why: '每對節點比一次;佇列最多放一層的節點對。' },
      verdict: '不用遞迴的寫法,邏輯和遞迴版一模一樣,只是把「遞迴呼叫」換成「放進佇列」。',
      code: {
        python: `from collections import deque

def isSameTree(p, q):
    dq = deque([(p, q)])
    while dq:
        a, b = dq.popleft()
        if not a and not b:
            continue
        if not a or not b or a.val != b.val:
            return False
        dq.append((a.left, b.left))
        dq.append((a.right, b.right))
    return True`,
        c: `bool isSameTree(struct TreeNode *p, struct TreeNode *q) {
    struct TreeNode *qa[256], *qb[256];   // 每棵最多 100 個節點,加上空孩子最多 202 對
    int head = 0, tail = 0;
    qa[tail] = p; qb[tail++] = q;
    while (head < tail) {
        struct TreeNode *a = qa[head], *b = qb[head++];
        if (!a && !b) continue;
        if (!a || !b || a->val != b->val) return false;
        qa[tail] = a->left; qb[tail++] = b->left;
        qa[tail] = a->right; qb[tail++] = b->right;
    }
    return true;
}`,
        cpp: `bool isSameTree(TreeNode* p, TreeNode* q) {
    queue<pair<TreeNode*, TreeNode*>> dq;
    dq.push({p, q});
    while (!dq.empty()) {
        auto [a, b] = dq.front(); dq.pop();
        if (!a && !b) continue;
        if (!a || !b || a->val != b->val) return false;
        dq.push({a->left, b->left});
        dq.push({a->right, b->right});
    }
    return true;
}`,
        java: `boolean isSameTree(TreeNode p, TreeNode q) {
    Deque<TreeNode[]> dq = new ArrayDeque<>();   // ArrayDeque 不能放 null,所以包成陣列
    dq.offer(new TreeNode[]{p, q});
    while (!dq.isEmpty()) {
        TreeNode[] pair = dq.poll();
        TreeNode a = pair[0], b = pair[1];
        if (a == null && b == null) continue;
        if (a == null || b == null || a.val != b.val) return false;
        dq.offer(new TreeNode[]{a.left, b.left});
        dq.offer(new TreeNode[]{a.right, b.right});
    }
    return true;
}`,
        javascript: `function isSameTree(p, q) {
  const dq = [[p, q]];
  for (let h = 0; h < dq.length; h++) {
    const [a, b] = dq[h];
    if (!a && !b) continue;
    if (!a || !b || a.val !== b.val) return false;
    dq.push([a.left, b.left], [a.right, b.right]);
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: [
    '先比 `p.val != q.val` 再檢查空:其中一個是 null 時會出錯',
    '只比較遍歷結果(例如中序遍歷的陣列):`[1,2]` 和 `[2,null,1]` 形狀不同,中序卻都是 `[2,1]`。要連空節點一起記下來才能這樣比',
    'Java 的 `ArrayDeque` 不能放 null,要放成對陣列或改用 `LinkedList`',
  ],
  followUp: [
    { q: '判斷一棵樹是否左右對稱?', a: '101. Symmetric Tree:改成比較 `(左.左, 右.右)` 和 `(左.右, 右.左)`。' },
    { q: '判斷 q 是不是 p 的子樹?', a: '[572. Subtree of Another Tree](#/q/572):對 p 的每個節點都呼叫一次這題的函式。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isSameTree',
    argKinds: ['tree', 'tree'],
    cases: [
      { args: [[1, 2, 3], [1, 2, 3]], out: true },
      { args: [[1, 2], [1, null, 2]], out: false },
      { args: [[1, 2, 1], [1, 1, 2]], out: false },
      { args: [[], []], out: true },
      { args: [[1], []], out: false },
      { args: [P, Q], out: false },
    ],
  },
}
