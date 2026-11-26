import { kv, tree } from './fig'
import type { FigStep, Solution } from './types'

// 1373. Maximum Sum BST in Binary Tree

// 範例樹(層序,null 表示空):答案 20 來自右邊 [3,2,5,null,null,4,6] 這棵合法 BST
const T: (number | null)[] = [1, 4, 3, 2, 4, 2, 5, null, null, null, null, null, null, 4, 6]

function postFig(): FigStep[] {
  return [
    {
      note: '後序走訪:先算左右子樹,再回頭判斷自己。每個節點回傳四件事:(是不是 BST、子樹最小值、子樹最大值、子樹和)。',
      line: 3,
      views: [tree(T, { label: '整棵樹', cls: { 0: 'hl' } })],
    },
    {
      note: '左子樹以 4 為根:它的左右孩子 2、4 都小於等於 4 不符 BST 規則(4 的右孩子也是 4,不滿足嚴格遞增)→ 這棵不是 BST,不能選。',
      line: 7,
      views: [tree(T, { label: '左子樹(根 4)不是 BST', cls: { 1: 'dim', 3: 'dim', 4: 'dim' } })],
    },
    {
      note: '右子樹以 3 為根:左孩子 2 < 3 < 右孩子 5,且 5 的孩子 4、6 滿足 4 < 5 < 6 → 整棵是合法 BST。和 = 3 + 2 + 5 + 4 + 6 = 20。',
      line: 9,
      views: [tree(T, { label: '右子樹(根 3)是 BST,和 = 20', cls: { 2: 'done', 5: 'done', 6: 'done', 13: 'done', 14: 'done' } }), kv([['是 BST', '是'], ['min', 2], ['max', 6], ['和', 20]], '回傳的四元組')],
    },
    {
      note: '回到根 1:左子樹不是 BST → 根 1 這整棵也不是 BST。全程見過的最大合法 BST 和就是 20。',
      line: 13,
      views: [tree(T, { label: '答案 = 20', cls: { 0: 'dim', 2: 'done', 5: 'done', 6: 'done', 13: 'done', 14: 'done' } })],
    },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力法:對每個節點,當它是子樹的根,獨立檢查「這整棵子樹是不是 BST」並順便求和。', line: 15, views: [tree(T, { label: '逐一當根檢查', cls: { 0: 'hl' } })] },
    { note: '檢查以某節點為根的子樹時,帶著允許的值範圍 (lo, hi) 往下遞迴:左子樹上限收緊成根值,右子樹下限收緊成根值,超出範圍就不是 BST。', line: 2, views: [tree(T, { label: '檢查根 3 的子樹:範圍逐層收緊', cls: { 2: 'hl', 5: 'hl', 6: 'hl', 13: 'hl', 14: 'hl' } })] },
    { note: '以 3 為根的子樹通過檢查,和 = 20,更新答案。其他節點當根時若不是 BST 就跳過。最後答案 = 20。', line: 11, views: [tree(T, { label: '答案 = 20', cls: { 2: 'done', 5: 'done', 6: 'done', 13: 'done', 14: 'done' } })] },
  ]
}

export const q1373: Solution = {
  id: 1373,
  plain: '在一棵二元樹裡,找出「本身是合法二元搜尋樹(BST)」的子樹中,節點總和最大的那一棵,回傳它的和。可以不選(答案至少是 0)。就像在一片樹林裡挑一叢排列最整齊的樹枝,挑出總價值最高的那叢。',
  statement: '給二元樹的根 `root`。在所有「本身是合法 BST」的子樹中,找節點和最大的,回傳那個和。若沒有正和的子樹,回傳 0(空子樹的和算 0)。',
  examples: [
    { input: 'root = [1,4,3,2,4,2,5,null,null,null,null,null,null,4,6]', output: '20', note: '右邊 [3,2,5,null,null,4,6] 是 BST,和 = 20' },
    { input: 'root = [4,3,null,1,2]', output: '2', note: '只有 [2] 這個單節點是能選到的最大正和 BST' },
    { input: 'root = [-4,-2,-5]', output: '0', note: '全是負的,不如不選,空集合和 0' },
    { input: 'root = [2,1,3]', output: '6', note: '整棵就是 BST,和 = 6' },
  ],
  constraints: ['節點數 `1 ≤ n ≤ 4e4`', '節點值 `−4e4 ≤ val ≤ 4e4`', '答案初始為 0(允許一棵都不選)', '合法 BST:左子樹全部嚴格小於根、右子樹全部嚴格大於根,且左右也都是 BST'],
  insight: [
    '判斷「以某節點為根是不是 BST」需要知道:左右子樹各自是不是 BST、以及它們的值域範圍',
    '一次後序走訪,讓每個節點回傳 (是否 BST, 子樹最小值, 子樹最大值, 子樹和) 這組資訊,父節點就能 O(1) 合併判斷',
    '合法條件:左右都是 BST,且 `左子樹最大值 < 根值 < 右子樹最小值`',
    '空子樹回傳 (是 BST, +∞, −∞, 0):這樣跟任何根值比較都自動成立,是處理邊界的漂亮技巧',
  ],
  approaches: [
    {
      name: '後序回傳四元組',
      idea: '一次[[p:tree-dfs]]後序走訪。每個節點回傳 (是否[[p:bst]]、子樹 min、子樹 max、子樹和);左右都是 BST 且 `左max < 根 < 右min` 才合法,合法時用它的和更新答案。',
      steps: ['空節點回傳 `(true, +∞, −∞, 0)`', '遞迴拿左、右子樹的四元組', '若左右都是 BST 且 `左max < 根值 < 右min`:算 `和 = 左和 + 右和 + 根值`,更新答案,回傳 `(true, min(左min,根), max(右max,根), 和)`', '否則回傳 `(false, …)`', '答案初始 0,最後回傳'],
      figure: { title: '範例樹,答案 20', steps: postFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點只走一次;遞迴堆疊深度是樹高 h。' },
      verdict: '標準最優解。「後序回傳一組聚合資訊、父節點 O(1) 合併」是樹型 DP 的核心套路,值得熟練。',
      code: {
        javascript: `function maxSumBST(root) {
  let ans = 0;
  function dfs(node) {
    if (!node) return [true, Infinity, -Infinity, 0]; // 空:min=+∞, max=-∞, 和=0
    const [lb, lmin, lmax, lsum] = dfs(node.left);
    const [rb, rmin, rmax, rsum] = dfs(node.right);
    if (lb && rb && lmax < node.val && node.val < rmin) {
      const sum = lsum + rsum + node.val;            // 合法 BST
      ans = Math.max(ans, sum);
      return [true, Math.min(lmin, node.val), Math.max(rmax, node.val), sum];
    }
    return [false, 0, 0, 0];                          // 不是 BST
  }
  dfs(root);
  return ans;
}`,
        python: `def maxSumBST(root):
    ans = 0
    INF = float('inf')
    def dfs(node):
        nonlocal ans
        if not node:
            return (True, INF, -INF, 0)               # 空:min=+∞, max=-∞, 和=0
        lb, lmin, lmax, lsum = dfs(node.left)
        rb, rmin, rmax, rsum = dfs(node.right)
        if lb and rb and lmax < node.val < rmin:
            s = lsum + rsum + node.val                # 合法 BST
            ans = max(ans, s)
            return (True, min(lmin, node.val), max(rmax, node.val), s)
        return (False, 0, 0, 0)                       # 不是 BST
    dfs(root)
    return ans`,
        c: `struct Info { int isBst; long long mn, mx, sum; };
static int ans;
static struct Info dfs(struct TreeNode *node) {
    if (!node) return (struct Info){1, 1000000000LL, -1000000000LL, 0};
    struct Info l = dfs(node->left), r = dfs(node->right);
    if (l.isBst && r.isBst && l.mx < node->val && node->val < r.mn) {
        long long s = l.sum + r.sum + node->val;
        if (s > ans) ans = (int)s;
        long long mn = l.mn < node->val ? l.mn : node->val;
        long long mx = r.mx > node->val ? r.mx : node->val;
        return (struct Info){1, mn, mx, s};
    }
    return (struct Info){0, 0, 0, 0};
}
int maxSumBST(struct TreeNode *root) {
    ans = 0;
    dfs(root);
    return ans;
}`,
        cpp: `class Solution {
    int ans = 0;
    // {是否BST, min, max, 和}
    array<long long, 4> dfs(TreeNode* node) {
        if (!node) return {1, LLONG_MAX, LLONG_MIN, 0};
        auto l = dfs(node->left), r = dfs(node->right);
        if (l[0] && r[0] && l[2] < node->val && node->val < r[1]) {
            long long sum = l[3] + r[3] + node->val;
            ans = max(ans, (int)sum);
            return {1, min(l[1], (long long)node->val), max(r[2], (long long)node->val), sum};
        }
        return {0, 0, 0, 0};
    }
public:
    int maxSumBST(TreeNode* root) {
        dfs(root);
        return ans;
    }
};`,
        java: `class Solution {
    int ans = 0;
    // {是否BST(1/0), min, max, 和}
    long[] dfs(TreeNode node) {
        if (node == null) return new long[]{1, Long.MAX_VALUE, Long.MIN_VALUE, 0};
        long[] l = dfs(node.left), r = dfs(node.right);
        if (l[0] == 1 && r[0] == 1 && l[2] < node.val && node.val < r[1]) {
            long sum = l[3] + r[3] + node.val;
            ans = Math.max(ans, (int) sum);
            return new long[]{1, Math.min(l[1], node.val), Math.max(r[2], node.val), sum};
        }
        return new long[]{0, 0, 0, 0};
    }
    public int maxSumBST(TreeNode root) {
        dfs(root);
        return ans;
    }
}`,
      },
    },
    {
      name: '暴力逐點檢查',
      idea: '對每個節點,把它當子樹的根,獨立[[p:tree-dfs]]檢查「這整棵子樹是不是[[p:bst]]」並求和;是就更新答案。',
      steps: ['`check(node, lo, hi)`:在 (lo, hi) 範圍內遞迴,超出範圍回傳「不是 BST」,否則回傳子樹和', '`walk(node)`:對每個節點呼叫 `check(node, −∞, +∞)`', '檢查通過就用和更新答案', '走遍所有節點', '回傳答案(初始 0)'],
      figure: { title: '範例樹,答案 20', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(h)', why: '每個節點都可能把它的子樹整個再檢查一遍,最壞 O(n²)。' },
      verdict: '最直覺、最好想,但會重複檢查子樹。小樹可過,面試時講完它再優化成後序法更有層次。',
      code: {
        javascript: `function maxSumBST(root) {
  let ans = 0;
  function check(node, lo, hi) {        // 在 (lo, hi) 內是 BST 就回傳和,否則回 null
    if (!node) return 0;
    if (node.val <= lo || node.val >= hi) return null;
    const l = check(node.left, lo, node.val);
    if (l === null) return null;
    const r = check(node.right, node.val, hi);
    if (r === null) return null;
    return l + r + node.val;
  }
  function walk(node) {
    if (!node) return;
    const s = check(node, -Infinity, Infinity);
    if (s !== null) ans = Math.max(ans, s);
    walk(node.left);
    walk(node.right);
  }
  walk(root);
  return ans;
}`,
        python: `def maxSumBST(root):
    ans = 0
    def check(node, lo, hi):              # 在 (lo, hi) 內是 BST 就回傳和,否則 None
        if not node:
            return 0
        if node.val <= lo or node.val >= hi:
            return None
        l = check(node.left, lo, node.val)
        if l is None:
            return None
        r = check(node.right, node.val, hi)
        if r is None:
            return None
        return l + r + node.val
    def walk(node):
        nonlocal ans
        if not node:
            return
        s = check(node, float('-inf'), float('inf'))
        if s is not None:
            ans = max(ans, s)
        walk(node.left)
        walk(node.right)
    walk(root)
    return ans`,
        c: `static const long long NONE = -9000000000000000000LL;
static long long check(struct TreeNode *node, long long lo, long long hi) {
    if (!node) return 0;
    if (node->val <= lo || node->val >= hi) return NONE;
    long long l = check(node->left, lo, node->val);
    if (l == NONE) return NONE;
    long long r = check(node->right, node->val, hi);
    if (r == NONE) return NONE;
    return l + r + node->val;
}
static int ans;
static void walk(struct TreeNode *node) {
    if (!node) return;
    long long s = check(node, -2000000000LL, 2000000000LL);
    if (s != NONE && s > ans) ans = (int)s;
    walk(node->left);
    walk(node->right);
}
int maxSumBST(struct TreeNode *root) {
    ans = 0;
    walk(root);
    return ans;
}`,
        cpp: `class Solution {
    static constexpr long long NONE = LLONG_MIN;
    int ans = 0;
    long long check(TreeNode* node, long long lo, long long hi) {
        if (!node) return 0;
        if (node->val <= lo || node->val >= hi) return NONE;
        long long l = check(node->left, lo, node->val);
        if (l == NONE) return NONE;
        long long r = check(node->right, node->val, hi);
        if (r == NONE) return NONE;
        return l + r + node->val;
    }
    void walk(TreeNode* node) {
        if (!node) return;
        long long s = check(node, LLONG_MIN, LLONG_MAX);
        if (s != NONE) ans = max(ans, (int)s);
        walk(node->left);
        walk(node->right);
    }
public:
    int maxSumBST(TreeNode* root) {
        walk(root);
        return ans;
    }
};`,
        java: `class Solution {
    static final long NONE = Long.MIN_VALUE;
    int ans = 0;
    long check(TreeNode node, long lo, long hi) {
        if (node == null) return 0;
        if (node.val <= lo || node.val >= hi) return NONE;
        long l = check(node.left, lo, node.val);
        if (l == NONE) return NONE;
        long r = check(node.right, node.val, hi);
        if (r == NONE) return NONE;
        return l + r + node.val;
    }
    void walk(TreeNode node) {
        if (node == null) return;
        long s = check(node, Long.MIN_VALUE, Long.MAX_VALUE);
        if (s != NONE) ans = Math.max(ans, (int) s);
        walk(node.left);
        walk(node.right);
    }
    public int maxSumBST(TreeNode root) {
        walk(root);
        return ans;
    }
}`,
      },
    },
  ],
  pitfalls: [
    '答案允許為 0(不選任何子樹);不要初始化成 −∞,全負的樹會錯',
    'BST 要「嚴格」:左子樹所有值 < 根、右子樹所有值 > 根,用 `<`/`>` 不是 `<=`/`>=`',
    '判斷 BST 不能只看「根比左孩子大、比右孩子小」;要整棵子樹都在範圍內 → 用 min/max 或 (lo, hi) 範圍傳遞',
    '空子樹回傳的 min/max 要用極端值(+∞/−∞),否則和父節點比較會出錯',
  ],
  followUp: [
    { q: '只要判斷「整棵樹是不是 BST」?', a: '[98. Validate Binary Search Tree](#/q/98):同樣用 (lo, hi) 範圍往下傳,或中序走訪檢查遞增。' },
  ],
  check: {
    kind: 'fn',
    fn: 'maxSumBST',
    argKinds: ['tree'],
    cases: [
      { args: [[1, 4, 3, 2, 4, 2, 5, null, null, null, null, null, null, 4, 6]], out: 20 },
      { args: [[4, 3, null, 1, 2]], out: 2 },
      { args: [[-4, -2, -5]], out: 0 },
      { args: [[2, 1, 3]], out: 6 },
      { args: [[5, 4, 8, 3, null, 6, 3]], out: 7 },
    ],
  },
}
