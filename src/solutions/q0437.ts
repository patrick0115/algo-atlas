import type { Solution } from './types'
import { tree } from './fig'

// 437. Path Sum III
const T = [10,5,-3,3,2,null,11,3,-2,null,1]
const fig = [
  { note: '從根節點 10 出發時，前綴和是 10；記錄 count[0]=1、count[10]=1，讓後代可查找差值。', views: [tree(T, { cls: { 0: 'hl' } })] },
  { note: '路徑只能從上往下，不必從根開始，也不必走到葉。目標 8 有三條：5→3、5→2→1、−3→11。', views: [tree(T, { cls: { 1: 'hl', 3: 'visited', 4: 'visited', 10: 'visited', 2: 'visited', 6: 'visited' } })] },
  { note: '走到 3 時，根到此處的前綴和為 18；若以前出現和 10，差 18−10=8，代表那個位置之後到目前是一條合格路徑。', views: [tree(T, { cls: { 0: 'visited', 1: 'visited', 3: 'hl' } })] },
  { note: '再走到 2→1 時，前綴和也和祖先 10 相差 8，因此又找到 5→2→1 這條路。', views: [tree(T, { cls: { 0: 'visited', 1: 'visited', 4: 'visited', 10: 'hl' } })] },
  { note: '回溯離開子樹時，要把本路徑的前綴和計數減回來，不能讓兄弟子樹串成路徑。', views: [tree(T, { cls: { 1: 'hl', 2: 'dim' } })] },
]

export const q0437: Solution = {
  id: 437,
  plain: '在樹裡數出多少條往下走的連續路徑，沿路數值加起來剛好等於目標。',
  statement: '給二元樹 root 與 targetSum，計算所有從某節點開始、沿父到子方向、總和等於 targetSum 的路徑數。',
  examples: [{ input: 'root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8', output: '3' }, { input: 'root = [1,-2,-3,1,3,-2,null,-1], targetSum = -1', output: '4' }],
  constraints: ['節點數 ≤ 1000；值可能為負，不能只靠總和過大來剪枝。', '答案是路徑數，不是節點數；單節點也可形成路徑。'],
  insight: ['最直接：把每個節點都當一次起點，往下累加。', '更快：在一條根到當前節點的路上，兩個前綴和之差就是中間路徑的和。', '用 [[p:prefix-sum]] 搭配 hash 表記錄目前祖先路徑上的前綴和次數。'],
  approaches: [
    { name: '逐節點當起點', idea: '對每個節點，向下列出所有由它出發的路徑。', steps: ['countFrom(node, remain)：當前值等於 remain 就計一條，再走左右子樹。路徑只能往下延伸，所以每次搜尋都沿父到子的方向前進。', '對樹中每個節點都呼叫 countFrom。目前總和與舊前綴和的差等於目標時，代表中間有一條合格路徑。', '加總所有起點的結果。離開子樹後恢復計數，才能避免把兩條不同分支錯接成一路。'], figure: { title: 'targetSum = 8', steps: [{ note: '先以根節點 10 為起點向下累加，沒有任何路徑剛好得到 8。', views: [tree(T, { cls: { 0: 'hl' } })] }, { note: '改以 5 為起點，5→3 與 5→2→1 的總和都等於 8，因此目前找到兩條。', views: [tree(T, { cls: { 1: 'hl', 3: 'visited', 4: 'visited', 10: 'visited' } })] }, { note: '再以 −3 為起點，−3→11 也等於 8；把三個起點的結果相加得到 3。', views: [tree(T, { cls: { 2: 'hl', 6: 'visited' } })] }] }, complexity: { time: 'O(nh)', space: 'O(h)', why: '每個起點最多探索其子樹；最壞退化成 O(n²)，平衡樹約 O(n log n)。' }, verdict: '定義最直接；重複計算很多後代。', code: {
      python: `def pathSum(root, targetSum):

    def start(n, left):
        if not n:  # 空節點不會再產生新路徑。
            return 0
        return (n.val == left) + start(n.left, left - n.val) + start(n.right, left - n.val)  # 當前值吻合就計一條，仍要繼續往下找。
    if not root:
        return 0
    return start(root, targetSum) + pathSum(root.left, targetSum) + pathSum(root.right, targetSum)`,
      c: `static int start(struct TreeNode *n, long long left) {
    if (!n)
        return 0;
    return (n->val == left) + start(n->left, left - n->val) + start(n->right, left - n->val);
}
int pathSum(struct TreeNode *root, int targetSum) {
    if (!root)
        return 0;
    return start(root, targetSum) + pathSum(root->left, targetSum) + pathSum(root->right, targetSum);
}`,
      cpp: `int start(TreeNode *n, long long left) {
    return n ? (n->val == left) + start(n->left, left - n->val) + start(n->right, left - n->val) : 0;
}
int pathSum(TreeNode *root, int targetSum) {
    return root ? start(root, targetSum) + pathSum(root->left, targetSum) + pathSum(root->right, targetSum) : 0;
}`,
      java: `int start(TreeNode n, long left) {
    return n == null ? 0 : (n.val == left ? 1 : 0) + start(n.left, left - n.val) + start(n.right, left - n.val);
}
int pathSum(TreeNode root, int targetSum) {
    return root == null ? 0 : start(root, targetSum) + pathSum(root.left, targetSum) + pathSum(root.right, targetSum);
}`,
      javascript: `function pathSum(root, targetSum) {
    function start(n, left) {
        return n ? (n.val === left ? 1 : 0) + start(n.left, left - n.val) + start(n.right, left - n.val) : 0;
    }
    return root ? start(root, targetSum) + pathSum(root.left, targetSum) + pathSum(root.right, targetSum) : 0;
}`,
    } },
    { name: '前綴和計數', idea: '目前和 sum 減去 targetSum，等於想找的舊前綴和；其出現次數就是新增路徑數。', steps: ['初始化 count[0]=1，容許路徑從根開始。路徑只能往下延伸，所以每次搜尋都沿父到子的方向前進。', 'DFS 到節點時累加 sum，增加 count[sum−targetSum] 條。目前總和與舊前綴和的差等於目標時，代表中間有一條合格路徑。', '把 sum 加入計數，走左右子樹後再減掉，回到父節點狀態。離開子樹後恢復計數，才能避免把兩條不同分支錯接成一路。'], figure: { title: 'targetSum = 8', steps: fig }, complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點一次 hash 查詢；最深路徑可有 n 種前綴和。' }, verdict: '大樹較有效率；回溯撤銷計數是關鍵。', code: {
      python: `def pathSum(root, targetSum):
    count = {0: 1}

    def dfs(n, total):
        if not n:  # 空節點不會再產生新路徑。
            return 0
        total += n.val
        ans = count.get(total - targetSum, 0)  # 差值等於目標的舊前綴和，各代表一條路徑。
        count[total] = count.get(total, 0) + 1
        ans += dfs(n.left, total) + dfs(n.right, total)
        count[total] -= 1  # 回到父節點前撤銷本分支的前綴和。
        return ans
    return dfs(root, 0)`,
      c: `static int countNodes(struct TreeNode *n) {
    return n ? 1 + countNodes(n->left) + countNodes(n->right) : 0;
}
static int slot(long long x, long long *key, bool *used, int cap) {
    int i = (int)((unsigned long long)x * 11400714819323198485ull & (cap - 1));
    while (used[i] && key[i] != x)
        i = (i + 1) & (cap - 1);
    if (!used[i]) {
        used[i] = true;
        key[i] = x;
    }
    return i;
}
static int dfs(struct TreeNode *n, long long sum, int target, long long *key, int *cnt, bool *used, int cap) {
    if (!n)
        return 0;
    sum += n->val;
    int ans = cnt[slot(sum - target, key, used, cap)];
    int at = slot(sum, key, used, cap);
    cnt[at]++;
    ans += dfs(n->left, sum, target, key, cnt, used, cap) + dfs(n->right, sum, target, key, cnt, used, cap);
    cnt[at]--;
    return ans;
}
int pathSum(struct TreeNode *root, int targetSum) {
    int cap = 1, n = countNodes(root);
    while (cap < 4 * n + 4)
        cap *= 2;
    long long *key = malloc(cap * sizeof(long long));
    int *cnt = calloc(cap, sizeof(int));
    bool *used = calloc(cap, sizeof(bool));
    cnt[slot(0, key, used, cap)] = 1;
    int ans = dfs(root, 0, targetSum, key, cnt, used, cap);
    free(key);
    free(cnt);
    free(used);
    return ans;
}`,
      cpp: `int pathSum(TreeNode *root, int targetSum) {
    unordered_map<long long, int> count{{0, 1}};   // 前綴和 0 出現 1 次:路徑可以從根開始
    function<int(TreeNode*, long long)> dfs = [&](TreeNode *n, long long sum) {
        if (!n)
            return 0;
        sum += n->val;
        int ans = count[sum - targetSum];
        count[sum]++;
        ans += dfs(n->left, sum) + dfs(n->right, sum);
        count[sum]--;                              // 回溯:離開這棵子樹
        return ans;
    };
    return dfs(root, 0);
}`,
      java: `int pathSum(TreeNode root, int targetSum) {
    Map<Long, Integer> count = new HashMap<>();
    count.put(0L, 1);
    return dfs(root, 0L, targetSum, count);
}
int dfs(TreeNode n, long sum, int target, Map<Long, Integer> count) {
    if (n == null)
        return 0;
    sum += n.val;
    int ans = count.getOrDefault(sum - target, 0);
    count.put(sum, count.getOrDefault(sum, 0) + 1);
    ans += dfs(n.left, sum, target, count) + dfs(n.right, sum, target, count);
    count.put(sum, count.get(sum) - 1);
    return ans;
}`,
      javascript: `function pathSum(root, targetSum) {
    const count = new Map([[0, 1]]);
    function dfs(n, sum) {
        if (!n)
            return 0;
        sum += n.val;
        let ans = count.get(sum - targetSum) || 0;
        count.set(sum, (count.get(sum) || 0) + 1);
        ans += dfs(n.left, sum) + dfs(n.right, sum);
        count.set(sum, count.get(sum) - 1);
        return ans;
    }
    return dfs(root, 0);
}`,
    } },
  ],
  pitfalls: ['路徑不一定從根開始，不能只求 root 到葉。', '值可能為負，總和過大不能剪枝。', '前綴和可超過 32 位整數；C++/Java 用長整數。', '回溯時要撤銷本節點的前綴和。'],
  check: { kind: 'fn', fn: 'pathSum', argKinds: ['tree',null], cases: [{ args: [T,8], out: 3 }, { args: [[1,-2,-3,1,3,-2,null,-1],-1], out: 4 }, { args: [[1],1], out: 1 }] },
}
