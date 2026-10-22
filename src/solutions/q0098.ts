import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 98. Validate Binary Search Tree

const T = [5, 3, 8, 1, 6, 7, 9]

function boundFig(): FigStep[] {
  const root = buildTree(T)
  const subs: Record<number, string> = {}
  const cls: Record<number, string> = {}
  const out: FigStep[] = [{ note: 'BST 不只是「比爸爸小 / 大」,而是比**整條路上的所有祖先**都對。往下走時帶著「允許的範圍」(下界, 上界):往左走上界變成自己、往右走下界變成自己', views: [tree(T)] }]
  const fmt = (x: number) => (x === -Infinity ? '−∞' : x === Infinity ? '∞' : String(x))
  const go = (n: FNode | null, lo: number, hi: number): boolean => {
    if (!n) return true
    const ok = lo < n.val && n.val < hi
    subs[n.i] = `(${fmt(lo)},${fmt(hi)})`
    cls[n.i] = ok ? 'done' : 'visited'
    out.push({ note: `節點 ${n.val} 必須在 (${fmt(lo)}, ${fmt(hi)}) 之間 → ${ok ? '✓' : `✗ ${n.val} 不在範圍內 → 不是 BST`}`, views: [tree(T, { subs: { ...subs }, cls: { ...cls, [n.i]: ok ? 'hl' : 'visited' } })] })
    if (!ok) return false
    return go(n.left, lo, n.val) && go(n.right, n.val, hi)
  }
  go(root, -Infinity, Infinity)
  out.push({ note: '6 比它的爸爸 3 大(看起來沒問題),但它在 5 的左子樹裡,必須 < 5 —— 只比較父子會漏掉這種情況', views: [tree(T, { subs, cls })] })
  return out
}

function inorderFig(): FigStep[] {
  const order: number[] = []
  const walk = (n: FNode | null) => {
    if (!n) return
    walk(n.left)
    order.push(n.val)
    walk(n.right)
  }
  walk(buildTree(T))
  const bad = order.findIndex((v, i) => i > 0 && v <= order[i - 1])
  return [
    { note: '另一個角度:BST 的中序遍歷一定是**嚴格遞增**。走一遍中序,檢查每個數都比前一個大', views: [tree(T)] },
    { note: `中序結果 [${order.join(', ')}]`, views: [arr(order, { label: '中序遍歷' })] },
    { note: bad >= 0 ? `${order[bad]} ≤ 前一個 ${order[bad - 1]} → 不是遞增 → 不是 BST` : '全部遞增 → 是 BST', views: [arr(order, { label: '中序遍歷', compare: bad >= 0 ? [bad - 1, bad] : [] })] },
  ]
}

export const q0098: Solution = {
  id: 98,
  plain: '檢查一棵樹是不是「左邊全部比較小、右邊全部比較大」(二元搜尋樹)。注意是**全部**:左邊整群子孫都要比這個節點小,不是只有直接的孩子。',
  statement: '判斷二元樹是不是合法的**二元搜尋樹**(BST):每個節點的左子樹**所有**值都嚴格小於它、右子樹**所有**值都嚴格大於它,而且左右子樹本身也都是 BST。',
  examples: [
    { input: 'root = [2,1,3]', output: 'true' },
    { input: 'root = [5,1,4,null,null,3,6]', output: 'false', note: '4 在 5 的右邊卻比 5 小' },
    { input: 'root = [5,3,8,1,6,7,9]', output: 'false', note: '6 比 3 大沒錯,但它在 5 的左子樹裡' },
  ],
  constraints: ['`1 ≤ 節點數 ≤ 10⁴`', '值的範圍是整個 32 位元整數 → 初始上下界不能用 `INT_MIN` / `INT_MAX`,要用更大的範圍或 null', '「嚴格」大於 / 小於 → 有重複值就不是 BST'],
  insight: [
    '最常見的錯:只檢查「左孩子 < 自己 < 右孩子」。範例三每一對父子都符合,但 6 在 5 的左子樹裡卻比 5 大',
    '正確的條件是「比所有祖先都對」→ 往下走時帶著允許的範圍 `(lo, hi)`:往左走,`hi` 變成目前節點;往右走,`lo` 變成目前節點',
    '另一個角度:BST 的中序遍歷是嚴格遞增的,反過來也成立。所以只要檢查中序是否遞增',
  ],
  approaches: [
    {
      name: '往下傳上下界',
      idea: '`valid(n, lo, hi)`:`n.val` 必須在 `(lo, hi)` 之間;左子樹的範圍是 `(lo, n.val)`,右子樹是 `(n.val, hi)`。',
      steps: ['`valid(n, lo, hi)`:空 → true', '`not (lo < n.val < hi)` → false', '回傳 `valid(左, lo, n.val) and valid(右, n.val, hi)`', '從 `valid(root, −∞, +∞)` 開始'],
      figure: { title: `root = [${T.join(',')}](節點下方是允許的範圍)`, steps: boundFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點檢查一次;遞迴深度是樹高。' },
      verdict: '標準解,把「BST 的定義」直接寫成程式。往下傳狀態的套路(和 [1448](#/q/1448) 一樣)。',
      code: {
        python: `def isValidBST(root):
    def valid(n, lo, hi):
        if not n:
            return True
        if not (lo < n.val < hi):
            return False
        return valid(n.left, lo, n.val) and valid(n.right, n.val, hi)

    return valid(root, float('-inf'), float('inf'))`,
        c: `// 值可能是 INT_MIN / INT_MAX,上下界用 long long 才放得下「比它們更外面」
static bool valid(struct TreeNode *n, long long lo, long long hi) {
    if (!n) return true;
    if (n->val <= lo || n->val >= hi) return false;
    return valid(n->left, lo, n->val) && valid(n->right, n->val, hi);
}

bool isValidBST(struct TreeNode *root) {
    return valid(root, LLONG_MIN, LLONG_MAX);
}`,
        cpp: `bool valid(TreeNode* n, long long lo, long long hi) {
    if (!n) return true;
    if (n->val <= lo || n->val >= hi) return false;
    return valid(n->left, lo, n->val) && valid(n->right, n->val, hi);
}

bool isValidBST(TreeNode* root) {
    return valid(root, LLONG_MIN, LLONG_MAX);
}`,
        java: `boolean isValidBST(TreeNode root) {
    return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean valid(TreeNode n, long lo, long hi) {
    if (n == null) return true;
    if (n.val <= lo || n.val >= hi) return false;
    return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
}`,
        javascript: `function isValidBST(root) {
  const valid = (n, lo, hi) => {
    if (!n) return true;
    if (n.val <= lo || n.val >= hi) return false;
    return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
  };
  return valid(root, -Infinity, Infinity);
}`,
      },
    },
    {
      name: '中序遍歷必須嚴格遞增',
      idea: '迭代中序遍歷,記住上一個值 `prev`。每個值都要 `> prev`,否則不是 BST。',
      steps: ['`prev = −∞`', '中序遍歷(堆疊:一路往左 → 彈出 → 轉右)', '彈出的值 `≤ prev` → false;否則 `prev = 值`', '走完 → true'],
      figure: { title: `root = [${T.join(',')}]`, steps: inorderFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點一次,堆疊最多一條路徑。' },
      verdict: '利用「BST ⇔ 中序遞增」這個等價關係,也很常見。可以在發現第一個逆序時提早結束。',
      code: {
        python: `def isValidBST(root):
    st, cur, prev = [], root, None
    while cur or st:
        while cur:
            st.append(cur)
            cur = cur.left
        n = st.pop()
        if prev is not None and n.val <= prev:
            return False                  # 不是嚴格遞增
        prev = n.val
        cur = n.right
    return True`,
        c: `bool isValidBST(struct TreeNode *root) {
    struct TreeNode **st = malloc(10001 * sizeof(*st)), *cur = root;
    int top = 0;
    long long prev = LLONG_MIN;
    bool ok = true;
    while ((cur || top) && ok) {
        while (cur) { st[top++] = cur; cur = cur->left; }
        struct TreeNode *n = st[--top];
        if (n->val <= prev) ok = false;
        prev = n->val;
        cur = n->right;
    }
    free(st);
    return ok;
}`,
        cpp: `bool isValidBST(TreeNode* root) {
    stack<TreeNode*> st;
    TreeNode* cur = root;
    long long prev = LLONG_MIN;
    while (cur || !st.empty()) {
        while (cur) { st.push(cur); cur = cur->left; }
        TreeNode* n = st.top(); st.pop();
        if (n->val <= prev) return false;
        prev = n->val;
        cur = n->right;
    }
    return true;
}`,
        java: `boolean isValidBST(TreeNode root) {
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode cur = root;
    long prev = Long.MIN_VALUE;
    while (cur != null || !st.isEmpty()) {
        while (cur != null) { st.push(cur); cur = cur.left; }
        TreeNode n = st.pop();
        if (n.val <= prev) return false;
        prev = n.val;
        cur = n.right;
    }
    return true;
}`,
        javascript: `function isValidBST(root) {
  const st = [];
  let cur = root, prev = -Infinity;
  while (cur || st.length) {
    while (cur) {
      st.push(cur);
      cur = cur.left;
    }
    const n = st.pop();
    if (n.val <= prev) return false;
    prev = n.val;
    cur = n.right;
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: [
    '只比較父子:`[5,3,8,1,6]` 每一對父子都對,但 6 在 5 的左邊',
    '上下界用 `INT_MIN` / `INT_MAX`:節點值剛好是 `INT_MAX` 時會被誤判(`val < INT_MAX` 不成立)。用 `long`、`±∞` 或 null',
    '用 `≤` 當成合法:題目要求**嚴格**小於 / 大於,`[2,2,2]` 不是 BST',
  ],
  followUp: [
    { q: 'BST 裡有兩個節點被交換了,怎麼修?', a: '99. Recover Binary Search Tree:中序遍歷找「逆序」的位置,第一個逆序的前一個和最後一個逆序的後一個就是被交換的兩個。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isValidBST',
    argKinds: ['tree'],
    cases: [
      { args: [[2, 1, 3]], out: true },
      { args: [[5, 1, 4, null, null, 3, 6]], out: false },
      { args: [T], out: false },
      { args: [[2, 2, 2]], out: false },
      { args: [[2147483647]], out: true },
      { args: [[-2147483648, null, 2147483647]], out: true },
      { args: [[5, 3, 8, 1, 4, 7, 9]], out: true },
    ],
  },
}
