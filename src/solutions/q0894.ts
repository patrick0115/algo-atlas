import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 894. All Possible Full Binary Trees

function recFig(): FigStep[] {
  return [
    { note: '「滿」二元樹:每個節點不是有 0 個就是有 2 個孩子 → 節點數一定是奇數。n = 1 只有一棵:單一節點', views: [tree([0], { label: 'n = 1' })] },
    { note: 'n = 5:根用掉 1 個,剩 4 個分給左右,左邊 i 個、右邊 4 − i 個(i 是奇數):(1, 3) 或 (3, 1)', views: [arr(['左 1、右 3', '左 3、右 1'], { label: '分法' })] },
    { note: '每種分法:左邊的每一棵 × 右邊的每一棵,配成一棵新樹。n = 3 只有一棵,所以 n = 5 有 1×1 + 1×1 = 2 棵', views: [tree([0, 0, 0, null, null, 0, 0], { label: '左 1、右 3' }), tree([0, 0, 0, 0, 0], { label: '左 3、右 1' })] },
    { note: '同一個 n 會被重複算很多次 → 記憶化。棵數是卡塔蘭數:n = 7 有 5 棵、n = 9 有 14 棵', views: [arr([1, 1, 2, 5, 14], { label: 'n = 1, 3, 5, 7, 9 的棵數' })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: '由下往上:dp[1] = [單一節點];dp[n] = 對所有奇數 i,dp[i] 的每一棵 × dp[n−1−i] 的每一棵', views: [arr(['dp[1]', 'dp[3]', 'dp[5]', 'dp[7]'], { label: '依序算出' })] },
    { note: '子樹可以共用(同一棵 dp[3] 的樹可以同時是很多棵大樹的左子樹);如果之後要修改樹,才需要複製', views: [arr([1, 1, 2, 5], { label: '棵數', done: [3] })] },
  ]
}

const CHECK = {
  python: `

def countFBT(n):                              # 測試用:回傳棵數,樹不合法就回傳 -1
    def size(t):
        if not t:
            return 0
        if (t.left is None) != (t.right is None):
            return -10**9                     # 不是「滿」的
        return 1 + size(t.left) + size(t.right)
    trees = allPossibleFBT(n)
    return len(trees) if all(size(t) == n for t in trees) else -1`,
  c: `

static int sizeFull(struct TreeNode *t) {
    if (!t) return 0;
    if (!t->left != !t->right) return -1000000;
    return 1 + sizeFull(t->left) + sizeFull(t->right);
}

int countFBT(int n) {
    int cnt;
    struct TreeNode **trees = allPossibleFBT(n, &cnt);
    for (int i = 0; i < cnt; i++) if (sizeFull(trees[i]) != n) return -1;
    return cnt;
}`,
  cpp: `

int sizeFull(TreeNode *t) {
    if (!t) return 0;
    if (!t->left != !t->right) return -1000000;
    return 1 + sizeFull(t->left) + sizeFull(t->right);
}

int countFBT(int n) {
    auto trees = allPossibleFBT(n);
    for (auto t : trees) if (sizeFull(t) != n) return -1;
    return trees.size();
}`,
  java: `

private int sizeFull(TreeNode t) {
    if (t == null) return 0;
    if ((t.left == null) != (t.right == null)) return -1000000;
    return 1 + sizeFull(t.left) + sizeFull(t.right);
}

int countFBT(int n) {
    List<TreeNode> trees = allPossibleFBT(n);
    for (TreeNode t : trees) if (sizeFull(t) != n) return -1;
    return trees.size();
}`,
  javascript: `

function countFBT(n) {
  const size = (t) => {
    if (!t) return 0;
    if (!t.left !== !t.right) return -1e9;
    return 1 + size(t.left) + size(t.right);
  };
  const trees = allPossibleFBT(n);
  return trees.every((t) => size(t) === n) ? trees.length : -1;
}`,
}

export const q0894: Solution = {
  id: 894,
  plain: '「滿二元樹」是每個節點要嘛沒有孩子、要嘛剛好兩個孩子的樹。列出所有剛好 n 個節點的滿二元樹(節點的值都是 0)。',
  statement: '給整數 `n`,回傳所有含 n 個節點的**滿二元樹**(每個節點有 0 或 2 個孩子),節點值皆為 0。順序不限。(這裡用 `countFBT(n)` 檢查回傳的每一棵都是 n 個節點的滿二元樹,並回傳棵數。)',
  examples: [
    { input: 'n = 7', output: '5 棵', note: '[[0,0,0,null,null,0,0,null,null,0,0], …]' },
    { input: 'n = 3', output: '[[0,0,0]]' },
  ],
  constraints: ['1 ≤ n ≤ 20', 'n 是偶數時沒有任何滿二元樹'],
  insight: ['滿二元樹的節點數一定是奇數', '根用掉 1 個,左子樹 i 個、右子樹 n − 1 − i 個,i 是奇數', '左右各自的所有可能兩兩配對 → 遞迴 + 記憶化([95](#/q/95) 同一個套路)'],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`build(n)`:n == 1 → [單一節點];否則對每個奇數 i,`build(i)` × `build(n − 1 − i)` 兩兩配對當左右子樹。',
      steps: ['n 是偶數 → []', '`build(1) = [TreeNode(0)]`', '`for i in 1, 3, …, n−2`:`for L in build(i)`、`for R in build(n − 1 − i)`:加入 `TreeNode(0, L, R)`', '記憶化 n 的結果'],
      figure: { title: 'n = 5', steps: recFig() },
      complexity: { time: 'O(棵數 × n)', space: 'O(棵數 × n)', why: '棵數是卡塔蘭數 C((n−1)/2),n = 19 時約 4862 棵。' },
      verdict: '最推薦。「所有可能的結構」→ 列舉根的分法,左右子問題的答案做笛卡兒積。',
      code: {
        python: `from functools import lru_cache

def allPossibleFBT(n):
    @lru_cache(maxsize=None)
    def build(k):
        if k % 2 == 0:
            return []
        if k == 1:
            return [TreeNode(0)]
        res = []
        for i in range(1, k - 1, 2):          # 左子樹 i 個,右子樹 k−1−i 個
            for L in build(i):
                for R in build(k - 1 - i):
                    res.append(TreeNode(0, L, R))   # 子樹共用,沒有複製
        return res
    return build(n)${CHECK.python}`,
        c: `static struct TreeNode **memo_[21];
static int cnt_[21];

static struct TreeNode **build(int k, int *size) {
    if (memo_[k]) { *size = cnt_[k]; return memo_[k]; }
    struct TreeNode **res = NULL;
    int c = 0, cap = 0;
    if (k == 1) {
        res = malloc(sizeof *res);
        res[0] = calloc(1, sizeof(struct TreeNode));
        c = 1;
    } else if (k % 2 == 1) {
        for (int i = 1; i < k - 1; i += 2) {
            int ln, rn;
            struct TreeNode **L = build(i, &ln), **R = build(k - 1 - i, &rn);
            for (int a = 0; a < ln; a++)
                for (int b = 0; b < rn; b++) {
                    if (c == cap) res = realloc(res, (cap = cap * 2 + 4) * sizeof *res);
                    struct TreeNode *t = calloc(1, sizeof(struct TreeNode));
                    t->left = L[a]; t->right = R[b];
                    res[c++] = t;
                }
        }
    }
    memo_[k] = res ? res : malloc(sizeof *res);
    cnt_[k] = c;
    *size = c;
    return memo_[k];
}

struct TreeNode **allPossibleFBT(int n, int *returnSize) { return build(n, returnSize); }${CHECK.c}`,
        cpp: `unordered_map<int, vector<TreeNode*>> memo;

vector<TreeNode*> allPossibleFBT(int n) {
    if (memo.count(n)) return memo[n];
    vector<TreeNode*> res;
    if (n == 1) res.push_back(new TreeNode(0));
    else if (n % 2 == 1)
        for (int i = 1; i < n - 1; i += 2)
            for (TreeNode *L : allPossibleFBT(i))
                for (TreeNode *R : allPossibleFBT(n - 1 - i))
                    res.push_back(new TreeNode(0, L, R));
    return memo[n] = res;
}${CHECK.cpp}`,
        java: `private final Map<Integer, List<TreeNode>> memo = new HashMap<>();

List<TreeNode> allPossibleFBT(int n) {
    if (memo.containsKey(n)) return memo.get(n);
    List<TreeNode> res = new ArrayList<>();
    if (n == 1) res.add(new TreeNode(0));
    else if (n % 2 == 1)
        for (int i = 1; i < n - 1; i += 2)
            for (TreeNode L : allPossibleFBT(i))
                for (TreeNode R : allPossibleFBT(n - 1 - i))
                    res.add(new TreeNode(0, L, R));
    memo.put(n, res);
    return res;
}${CHECK.java}`,
        javascript: `function allPossibleFBT(n) {
  const memo = new Map();
  const build = (k) => {
    if (memo.has(k)) return memo.get(k);
    const res = [];
    if (k === 1) res.push(new TreeNode(0));
    else if (k % 2 === 1)
      for (let i = 1; i < k - 1; i += 2)
        for (const L of build(i)) for (const R of build(k - 1 - i)) res.push(new TreeNode(0, L, R));
    memo.set(k, res);
    return res;
  };
  return build(n);
}${CHECK.javascript}`,
      },
    },
    {
      name: '由下往上 DP',
      idea: '`dp[1] = [節點]`;`dp[k]`(k = 3, 5, …, n)= 所有 `dp[i] × dp[k−1−i]` 的組合。',
      steps: ['n 是偶數 → []', '`dp[1] = [TreeNode(0)]`', '`for k in 3, 5, …, n`:`for i in 1, 3, …, k−2`:組合 dp[i] 和 dp[k−1−i]', '回傳 `dp[n]`'],
      figure: { title: 'n = 7', steps: dpFig() },
      complexity: { time: 'O(棵數 × n)', space: 'O(棵數 × n)', why: '和記憶化一樣,只是改成迴圈。' },
      verdict: '順序明確,沒有遞迴;計算過程和記憶化版一模一樣。',
      code: {
        python: `def allPossibleFBT(n):
    if n % 2 == 0:
        return []
    dp = {1: [TreeNode(0)]}
    for k in range(3, n + 1, 2):
        dp[k] = [TreeNode(0, L, R)
                 for i in range(1, k - 1, 2)
                 for L in dp[i] for R in dp[k - 1 - i]]
    return dp[n]${CHECK.python}`,
        c: `struct TreeNode **allPossibleFBT(int n, int *returnSize) {
    static struct TreeNode **dp[21];
    static int cnt[21];
    *returnSize = 0;
    if (n % 2 == 0) return malloc(sizeof(struct TreeNode *));
    dp[1] = malloc(sizeof(struct TreeNode *));
    dp[1][0] = calloc(1, sizeof(struct TreeNode));
    cnt[1] = 1;
    for (int k = 3; k <= n; k += 2) {
        int c = 0, cap = 0;
        dp[k] = NULL;
        for (int i = 1; i < k - 1; i += 2)
            for (int a = 0; a < cnt[i]; a++)
                for (int b = 0; b < cnt[k - 1 - i]; b++) {
                    if (c == cap) dp[k] = realloc(dp[k], (cap = cap * 2 + 4) * sizeof(struct TreeNode *));
                    struct TreeNode *t = calloc(1, sizeof(struct TreeNode));
                    t->left = dp[i][a]; t->right = dp[k - 1 - i][b];
                    dp[k][c++] = t;
                }
        cnt[k] = c;
    }
    *returnSize = cnt[n];
    return dp[n];
}${CHECK.c}`,
        cpp: `vector<TreeNode*> allPossibleFBT(int n) {
    if (n % 2 == 0) return {};
    vector<vector<TreeNode*>> dp(n + 1);
    dp[1] = {new TreeNode(0)};
    for (int k = 3; k <= n; k += 2)
        for (int i = 1; i < k - 1; i += 2)
            for (TreeNode *L : dp[i])
                for (TreeNode *R : dp[k - 1 - i]) dp[k].push_back(new TreeNode(0, L, R));
    return dp[n];
}${CHECK.cpp}`,
        java: `List<TreeNode> allPossibleFBT(int n) {
    if (n % 2 == 0) return new ArrayList<>();
    List<List<TreeNode>> dp = new ArrayList<>();
    for (int k = 0; k <= n; k++) dp.add(new ArrayList<>());
    dp.get(1).add(new TreeNode(0));
    for (int k = 3; k <= n; k += 2)
        for (int i = 1; i < k - 1; i += 2)
            for (TreeNode L : dp.get(i))
                for (TreeNode R : dp.get(k - 1 - i)) dp.get(k).add(new TreeNode(0, L, R));
    return dp.get(n);
}${CHECK.java}`,
        javascript: `function allPossibleFBT(n) {
  if (n % 2 === 0) return [];
  const dp = { 1: [new TreeNode(0)] };
  for (let k = 3; k <= n; k += 2) {
    dp[k] = [];
    for (let i = 1; i < k - 1; i += 2)
      for (const L of dp[i]) for (const R of dp[k - 1 - i]) dp[k].push(new TreeNode(0, L, R));
  }
  return dp[n];
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['左子樹的節點數用偶數:偶數個節點不可能是滿二元樹,白白浪費', '偶數 n 要直接回傳空清單', '子樹共用時,如果之後有人修改其中一棵,其他棵也會跟著變(題目不會修改,所以可以共用)'],
  check: {
    kind: 'fn',
    fn: 'countFBT',
    cases: [
      { args: [1], out: 1 },
      { args: [3], out: 1 },
      { args: [7], out: 5 },
      { args: [2], out: 0 },
      { args: [9], out: 14 },
      { args: [15], out: 429 },
    ],
  },
}
