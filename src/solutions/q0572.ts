import type { FigStep, Solution } from './types'
import { buildTree, tree, type FNode } from './fig'

// 572. Subtree of Another Tree

const R = [3, 4, 5, 1, 2, null, 6]
const S = [4, 1, 2]

const same = (a: FNode | null, b: FNode | null): boolean => (!a && !b) || (!!a && !!b && a.val === b.val && same(a.left, b.left) && same(a.right, b.right))

function eachFig(): FigStep[] {
  const root = buildTree(R)
  const sub = buildTree(S)
  const out: FigStep[] = [{ note: 'subRoot 是 root 的子樹 ⇔ root 裡有某個節點,「從它往下的整棵樹」和 subRoot 一模一樣。所以對 root 的每個節點都做一次 [100. Same Tree]', views: [tree(R, { label: 'root' }), tree(S, { label: 'subRoot' })] }]
  const stack: (FNode | null)[] = [root]
  while (stack.length) {
    const n = stack.pop()
    if (!n) continue
    const ok = same(n, sub)
    const sizeOf = (x: FNode | null): number[] => (x ? [x.i, ...sizeOf(x.left), ...sizeOf(x.right)] : [])
    out.push({ note: `從節點 ${n.val} 開始和 subRoot 比 → ${ok ? '一模一樣!回傳 true' : n.val !== sub!.val ? '根的值就不同' : '值一樣但下面不同'}`, views: [tree(R, { label: 'root', cls: Object.fromEntries(sizeOf(n).map((i) => [i, ok ? 'done' : 'hl'])) }), tree(S, { label: 'subRoot' })] })
    if (ok) return out
    stack.push(n.right, n.left)
  }
  return out
}

function serialFig(): FigStep[] {
  const ser = (n: FNode | null): string => (n ? `^${n.val},${ser(n.left)},${ser(n.right)}` : '#')
  const a = ser(buildTree(R))
  const b = ser(buildTree(S))
  const at = a.indexOf(b)
  return [
    { note: '另一種想法:把兩棵樹都「序列化」成字串(前序遍歷,空節點寫 #,每個值前面加 ^ 當分隔),子樹就會變成**子字串**', views: [tree(R, { label: 'root' }), tree(S, { label: 'subRoot' })] },
    { note: `root → "${a}"`, views: [tree(R, { label: 'root' })] },
    { note: `subRoot → "${b}"`, views: [tree(S, { label: 'subRoot' })] },
    { note: at >= 0 ? `"${b}" 出現在 root 的字串第 ${at} 個字元 → true。用 KMP 找子字串可以做到 O(m + n)` : '找不到 → false', views: [tree(R, { label: 'root', cls: { 1: 'done', 3: 'done', 4: 'done' } })] },
  ]
}

export const q0572: Solution = {
  id: 572,
  plain: '判斷一棵小樹,是不是「整個」長在大樹的某個地方:在大樹裡找一個節點,從它往下剪下來的那一整枝,要和小樹一模一樣(包含最下面的葉子)。',
  statement: '給兩棵二元樹 `root` 和 `subRoot`,判斷 `root` 裡是否有某個節點,以它為根的子樹(它和它**所有**的後代)和 `subRoot` 結構相同、值也相同。',
  examples: [
    { input: 'root = [3,4,5,1,2], subRoot = [4,1,2]', output: 'true' },
    { input: 'root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]', output: 'false', note: 'root 的 2 底下多了一個 0,不算' },
  ],
  constraints: ['root 最多 2000 個節點、subRoot 最多 1000 個 → O(m·n) 是 200 萬,沒問題'],
  insight: [
    '「從某個節點開始一模一樣」= 對那個節點呼叫 [100. Same Tree](#/q/100)',
    '所以最直接:走過 root 的每個節點,每個都試一次 Same Tree → O(m·n)',
    '更快的做法:把樹序列化成字串(空節點也要寫出來),子樹問題就變成**子字串**問題,可以用 KMP 做到線性',
  ],
  approaches: [
    {
      name: '每個節點試一次 Same Tree',
      idea: '`isSubtree(root, sub)` = `same(root, sub)` 或 `isSubtree(root.left, sub)` 或 `isSubtree(root.right, sub)`。',
      steps: ['`root` 是 null → false(subRoot 至少有一個節點)', '`same(root, subRoot)` → true', '否則遞迴問左右子樹'],
      figure: { title: `root = [${R.map((v) => v ?? 'null').join(',')}], subRoot = [${S.join(',')}]`, steps: eachFig() },
      complexity: { time: 'O(m · n)', space: 'O(h)', why: 'm 個節點,每個最多比對 n 個節點。實際上大多數節點第一個值就不同,很快結束。' },
      verdict: '標準解,把學過的 Same Tree 直接拿來用。',
      code: {
        python: `def isSubtree(root, subRoot):
    def same(a, b):
        if not a and not b:
            return True
        if not a or not b or a.val != b.val:
            return False
        return same(a.left, b.left) and same(a.right, b.right)

    if not root:
        return False
    if same(root, subRoot):
        return True
    return isSubtree(root.left, subRoot) or isSubtree(root.right, subRoot)`,
        c: `static bool same(struct TreeNode *a, struct TreeNode *b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return same(a->left, b->left) && same(a->right, b->right);
}

bool isSubtree(struct TreeNode *root, struct TreeNode *subRoot) {
    if (!root) return false;
    if (same(root, subRoot)) return true;
    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
}`,
        cpp: `bool same(TreeNode* a, TreeNode* b) {
    if (!a && !b) return true;
    if (!a || !b || a->val != b->val) return false;
    return same(a->left, b->left) && same(a->right, b->right);
}

bool isSubtree(TreeNode* root, TreeNode* subRoot) {
    if (!root) return false;
    if (same(root, subRoot)) return true;
    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
}`,
        java: `boolean isSubtree(TreeNode root, TreeNode subRoot) {
    if (root == null) return false;
    if (same(root, subRoot)) return true;
    return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

private boolean same(TreeNode a, TreeNode b) {
    if (a == null && b == null) return true;
    if (a == null || b == null || a.val != b.val) return false;
    return same(a.left, b.left) && same(a.right, b.right);
}`,
        javascript: `function isSubtree(root, subRoot) {
  const same = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return same(a.left, b.left) && same(a.right, b.right);
  };
  if (!root) return false;
  if (same(root, subRoot)) return true;
  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}`,
      },
    },
    {
      name: '序列化成字串,找子字串',
      idea: '用前序遍歷把樹寫成字串,空節點寫 `#`,每個值前面加分隔符號 `^`。subRoot 是子樹 ⇔ 它的字串是 root 字串的子字串。',
      steps: ['`ser(n)`:空 → `"#"`;否則 `"^" + val + "," + ser(左) + "," + ser(右)`', '回傳 `ser(subRoot) in ser(root)`'],
      figure: { title: `root = [${R.map((v) => v ?? 'null').join(',')}], subRoot = [${S.join(',')}]`, steps: serialFig() },
      complexity: { time: 'O(m + n) ~ O(m · n)', space: 'O(m + n)', why: '序列化是線性的;子字串搜尋用 KMP 是 O(m + n),一般語言內建的 `in` / `find` 最壞是 O(m · n)。' },
      verdict: '把樹的問題轉成字串問題的漂亮技巧。分隔符號很重要:沒有 `^` 的話,值 `2` 會在 `12` 裡被找到。',
      code: {
        python: `def isSubtree(root, subRoot):
    def ser(n):
        if not n:
            return '#'
        return f'^{n.val},{ser(n.left)},{ser(n.right)}'

    return ser(subRoot) in ser(root)`,
        c: `static void ser(struct TreeNode *n, char *buf, int *len) {
    if (!n) { buf[(*len)++] = '#'; return; }
    *len += sprintf(buf + *len, "^%d,", n->val);
    ser(n->left, buf, len);
    buf[(*len)++] = ',';
    ser(n->right, buf, len);
}

bool isSubtree(struct TreeNode *root, struct TreeNode *subRoot) {
    char *a = malloc(40000), *b = malloc(20000);   // 每個節點最多約 10 個字元
    int la = 0, lb = 0;
    ser(root, a, &la); a[la] = '\\0';
    ser(subRoot, b, &lb); b[lb] = '\\0';
    bool ok = strstr(a, b) != NULL;
    free(a); free(b);
    return ok;
}`,
        cpp: `string ser(TreeNode* n) {
    if (!n) return "#";
    return "^" + to_string(n->val) + "," + ser(n->left) + "," + ser(n->right);
}

bool isSubtree(TreeNode* root, TreeNode* subRoot) {
    return ser(root).find(ser(subRoot)) != string::npos;
}`,
        java: `boolean isSubtree(TreeNode root, TreeNode subRoot) {
    return ser(root).contains(ser(subRoot));
}

private String ser(TreeNode n) {
    if (n == null) return "#";
    return "^" + n.val + "," + ser(n.left) + "," + ser(n.right);
}`,
        javascript: `function isSubtree(root, subRoot) {
  const ser = (n) => (n ? \`^\${n.val},\${ser(n.left)},\${ser(n.right)}\` : '#');
  return ser(root).includes(ser(subRoot));
}`,
      },
    },
  ],
  pitfalls: [
    '只比較「根的值相等」就以為找到了:值一樣但下面的結構可能不同,要比完整棵',
    '把「子樹」想成「部分結構」:題目要求**所有後代**都一樣,root 的那個節點下面不能多出東西',
    '序列化沒有寫空節點:`[1,2]` 和 `[1,null,2]` 會變成同一個字串',
    '序列化沒有值的分隔符號:`subRoot = [2]` 會在 `root = [12]` 的字串裡被找到',
  ],
  followUp: [
    { q: '想要真正的 O(m + n)?', a: '序列化後用 KMP(見[[p:kmp]]),或用樹的雜湊(每個子樹算一個雜湊值,比較雜湊)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isSubtree',
    argKinds: ['tree', 'tree'],
    cases: [
      { args: [[3, 4, 5, 1, 2], [4, 1, 2]], out: true },
      { args: [[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]], out: false },
      { args: [R, S], out: true },
      { args: [[12], [2]], out: false },
      { args: [[1, 1], [1]], out: true },
      { args: [[1, 2, 3], [1, 2]], out: false },
    ],
  },
}
