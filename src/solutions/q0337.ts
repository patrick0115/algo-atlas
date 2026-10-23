import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 337. House Robber III

const T = [3, 4, 5, 1, 3, null, 1]

function pairFig(): FigStep[] {
  return [
    { note: '房子排成一棵樹,不能同時偷相連的兩間(父子)。每個節點回傳兩個數:(偷我, 不偷我)時,這棵子樹最多能拿多少', views: [tree(T)] },
    { note: '葉子:偷 = 自己的錢,不偷 = 0。節點 4(孩子 1、3):偷 4 → 4 + 0 + 0 = 4;不偷 4 → max(1,0) + max(3,0) = 4', views: [tree(T, { subs: { 3: '(1, 0)', 4: '(3, 0)', 6: '(1, 0)', 1: '(4, 4)', 2: '(5, 1)' } })] },
    { note: '根 3:偷 → 3 + 「不偷 4」(4)+「不偷 5」(1)= 8;不偷 → max(4, 4) + max(5, 1) = 9。答案 max(8, 9) = 9', views: [tree(T, { subs: { 0: '(8, 9)' }, cls: { 1: 'done', 2: 'done' } })] },
  ]
}

function memoFig(): FigStep[] {
  return [
    { note: '直覺的遞迴:rob(node) = max(偷 node + rob(孫子們), rob(左) + rob(右))。孫子會被重複計算很多次', views: [tree(T, { cls: { 0: 'hl', 3: 'cur', 4: 'cur', 6: 'cur' } })] },
    { note: '用 Hash 表記住每個節點的 rob 結果(記憶化),每個節點只算一次 → O(n)', views: [tree(T, { cls: { 1: 'done', 2: 'done', 3: 'done', 4: 'done', 6: 'done' } })] },
  ]
}

export const q0337: Solution = {
  id: 337,
  plain: '小偷這次面對的房子排成一棵樹(只有一個入口:樹根)。如果偷了某間,和它直接相連的房子(父親或孩子)就不能偷,否則會觸發警報。最多能偷多少錢?',
  statement: '給二元樹的根 `root`,每個節點的值是房子裡的錢。不能同時偷**直接相連**的兩個節點,回傳不觸發警報時能偷到的最大金額。',
  examples: [
    { input: 'root = [3,2,3,null,3,null,1]', output: '7', note: '3 + 3 + 1' },
    { input: 'root = [3,4,5,1,3,null,1]', output: '9', note: '4 + 5' },
  ],
  constraints: ['節點數 ≤ 10⁴'],
  insight: ['[198. House Robber](#/q/198) 搬到樹上:每個節點也是「偷 / 不偷」兩種選擇', '偷 u → 孩子都不能偷;不偷 u → 孩子可偷可不偷(各自取大的)', '後序:每個節點回傳 (偷我, 不偷我) 兩個值,父節點用它們算自己的'],
  approaches: [
    {
      name: '樹形 DP:每個節點回傳 (偷, 不偷)',
      idea: '`dfs(u)` 回傳 `(rob, skip)`:`rob = u.val + L.skip + R.skip`、`skip = max(L) + max(R)`。',
      steps: ['空 → (0, 0)', '`L = dfs(left)`、`R = dfs(right)`', '`rob = val + L[1] + R[1]`;`skip = max(L) + max(R)`', '答案 `max(dfs(root))`'],
      figure: { title: `root = [${T}]`, steps: pairFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點算一次;遞迴深度 = 樹高。' },
      verdict: '最推薦。「每個節點回傳多個狀態」是樹形 DP 的核心技巧,不需要額外的表。',
      code: {
        python: `def rob(root):
    def dfs(u):
        if not u:
            return 0, 0
        l, r = dfs(u.left), dfs(u.right)
        take = u.val + l[1] + r[1]            # 偷 u:孩子都不能偷
        skip = max(l) + max(r)                # 不偷 u:孩子各自選最好的
        return take, skip
    return max(dfs(root))`,
        c: `// 回傳兩個值:用陣列 out[0] = 偷、out[1] = 不偷
static void dfs(struct TreeNode *u, int out[2]) {
    if (!u) { out[0] = out[1] = 0; return; }
    int l[2], r[2];
    dfs(u->left, l); dfs(u->right, r);
    out[0] = u->val + l[1] + r[1];
    out[1] = (l[0] > l[1] ? l[0] : l[1]) + (r[0] > r[1] ? r[0] : r[1]);
}

int rob(struct TreeNode *root) {
    int res[2];
    dfs(root, res);
    return res[0] > res[1] ? res[0] : res[1];
}`,
        cpp: `pair<int, int> dfs(TreeNode *u) {
    if (!u) return {0, 0};
    auto [lt, ls] = dfs(u->left);
    auto [rt, rs] = dfs(u->right);
    return {u->val + ls + rs, max(lt, ls) + max(rt, rs)};
}

int rob(TreeNode* root) {
    auto [t, s] = dfs(root);
    return max(t, s);
}`,
        java: `int rob(TreeNode root) {
    int[] r = dfs(root);
    return Math.max(r[0], r[1]);
}

private int[] dfs(TreeNode u) {
    if (u == null) return new int[]{0, 0};
    int[] l = dfs(u.left), r = dfs(u.right);
    return new int[]{u.val + l[1] + r[1], Math.max(l[0], l[1]) + Math.max(r[0], r[1])};
}`,
        javascript: `function rob(root) {
  const dfs = (u) => {
    if (!u) return [0, 0];
    const l = dfs(u.left), r = dfs(u.right);
    return [u.val + l[1] + r[1], Math.max(...l) + Math.max(...r)];
  };
  return Math.max(...dfs(root));
}`,
      },
    },
    {
      name: '遞迴 + 記憶化(偷 / 跳過孫子)',
      idea: '`f(u) = max(u.val + f(孫子們), f(左) + f(右))`,用 Hash 表記住每個節點的結果。',
      steps: ['`memo = {}`', '`f(u)`:空 → 0;算過 → 回傳', '`take = u.val + f(u.left.left) + f(u.left.right) + f(u.right.left) + f(u.right.right)`', '`skip = f(u.left) + f(u.right)`;記下 `max(take, skip)`'],
      figure: { title: `root = [${T}]`, steps: memoFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點只算一次;memo 存 n 個結果。' },
      verdict: '最貼近 198 題的思路(偷這間就跳過下一層),但需要額外的 memo 表。',
      code: {
        python: `def rob(root):
    memo = {}

    def f(u):
        if not u:
            return 0
        if u in memo:
            return memo[u]
        take = u.val
        if u.left:
            take += f(u.left.left) + f(u.left.right)
        if u.right:
            take += f(u.right.left) + f(u.right.right)
        memo[u] = max(take, f(u.left) + f(u.right))
        return memo[u]

    return f(root)`,
        c: `// 以節點指標為鍵的記憶化(uthash)
typedef struct { struct TreeNode *key; int val; UT_hash_handle hh; } Memo;
static Memo *memo_;

static int f(struct TreeNode *u) {
    if (!u) return 0;
    Memo *m;
    HASH_FIND_PTR(memo_, &u, m);
    if (m) return m->val;
    int take = u->val;
    if (u->left) take += f(u->left->left) + f(u->left->right);
    if (u->right) take += f(u->right->left) + f(u->right->right);
    int skip = f(u->left) + f(u->right), best = take > skip ? take : skip;
    m = malloc(sizeof(Memo)); m->key = u; m->val = best;
    HASH_ADD_PTR(memo_, key, m);
    return best;
}

int rob(struct TreeNode *root) {
    memo_ = NULL;
    int ans = f(root);
    Memo *m, *t;
    HASH_ITER(hh, memo_, m, t) { HASH_DEL(memo_, m); free(m); }
    return ans;
}`,
        cpp: `unordered_map<TreeNode*, int> memo;

int f(TreeNode *u) {
    if (!u) return 0;
    auto it = memo.find(u);
    if (it != memo.end()) return it->second;
    int take = u->val;
    if (u->left) take += f(u->left->left) + f(u->left->right);
    if (u->right) take += f(u->right->left) + f(u->right->right);
    return memo[u] = max(take, f(u->left) + f(u->right));
}

int rob(TreeNode* root) {
    memo.clear();
    return f(root);
}`,
        java: `private final Map<TreeNode, Integer> memo = new HashMap<>();

int rob(TreeNode root) {
    memo.clear();
    return f(root);
}

private int f(TreeNode u) {
    if (u == null) return 0;
    Integer m = memo.get(u);
    if (m != null) return m;
    int take = u.val;
    if (u.left != null) take += f(u.left.left) + f(u.left.right);
    if (u.right != null) take += f(u.right.left) + f(u.right.right);
    int best = Math.max(take, f(u.left) + f(u.right));
    memo.put(u, best);
    return best;
}`,
        javascript: `function rob(root) {
  const memo = new Map();
  const f = (u) => {
    if (!u) return 0;
    if (memo.has(u)) return memo.get(u);
    let take = u.val;
    if (u.left) take += f(u.left.left) + f(u.left.right);
    if (u.right) take += f(u.right.left) + f(u.right.right);
    const best = Math.max(take, f(u.left) + f(u.right));
    memo.set(u, best);
    return best;
  };
  return f(root);
}`,
      },
    },
  ],
  pitfalls: ['以為「隔一層偷」就是最佳:可能連續兩層都不偷才最好(例如中間那層的錢都很少)', '不記憶化的「偷孫子」遞迴:同一個節點會被算很多次,指數時間'],
  check: {
    kind: 'fn',
    fn: 'rob',
    argKinds: ['tree'],
    cases: [
      { args: [[3, 2, 3, null, 3, null, 1]], out: 7 },
      { args: [T], out: 9 },
      { args: [[0]], out: 0 },
      { args: [[4, 1, null, 2, null, 3]], out: 7 },
      { args: [[2, 1, 3, null, 4]], out: 7 },
    ],
  },
}
