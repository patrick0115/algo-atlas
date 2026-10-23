import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

// 108. Convert Sorted Array to Binary Search Tree

const A = [-10, -3, 0, 5, 9]

function recFig(): FigStep[] {
  return [
    { note: '要「高度平衡」:左右子樹高度差 ≤ 1。取正中間的數當根,左半邊、右半邊的數量就差不多,兩邊各自再遞迴', views: [arr(A, { label: 'nums', highlight: [2] })] },
    { note: '根 0;左半 [−10, −3] 的中間(取左中位數)是 −10,右半 [5, 9] 的中間是 5', views: [arr(A, { label: 'nums', highlight: [0, 3], done: [2] })] },
    { note: '再往下:−3 接在 −10 的右邊、9 接在 5 的右邊。中序走訪剛好還原成原本的排序陣列', views: [tree([0, -10, 5, null, -3, null, 9])] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '迭代版:堆疊放「(節點, 這個節點負責的範圍 l..r)」。先建根(中間值),再把左右兩半的工作放進堆疊', views: [arr(A, { label: 'nums', range: [0, 4], highlight: [2] })] },
    { note: '每次取出一份工作:範圍的中間建成節點、接到父親的左或右,剩下兩半再放回堆疊。建出來的樹和遞迴版一樣', views: [tree([0, -10, 5, null, -3, null, 9])] },
  ]
}

export const q0108: Solution = {
  id: 108,
  plain: '把一排由小到大排好的數字,變成一棵「左右兩邊差不多高」的二元搜尋樹(左邊都比自己小、右邊都比自己大)。',
  statement: '給**升序**排列的整數陣列 `nums`,把它轉成一棵**高度平衡**的二元搜尋樹(每個節點的左右子樹高度差 ≤ 1)。答案不唯一。',
  examples: [
    { input: 'nums = [-10,-3,0,5,9]', output: '[0,-3,9,-10,null,5] 或 [0,-10,5,null,-3,null,9]' },
    { input: 'nums = [1,3]', output: '[3,1] 或 [1,null,3]' },
  ],
  constraints: ['n ≤ 10⁴,已排序、值互不相同'],
  insight: ['BST 的中序就是排序後的陣列 → 反過來,任何一個位置都可以當根,左邊是左子樹、右邊是右子樹', '要平衡 → 每次取**中間**當根,左右兩邊大小最多差 1', '這裡統一取左中位數 `(l + r) // 2`,答案才固定'],
  approaches: [
    {
      name: '遞迴:取中間當根',
      idea: '`build(l, r)`:`m = (l + r) // 2`,`TreeNode(nums[m], build(l, m−1), build(m+1, r))`。',
      steps: ['`build(l, r)`:`l > r` → None', '`m = (l + r) // 2`', '回傳 `TreeNode(nums[m], build(l, m − 1), build(m + 1, r))`'],
      figure: { title: `nums = [${A}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(log n)', why: '每個數建一個節點;遞迴深度 = 樹高 = log n。' },
      verdict: '最推薦,[[p:bst]]的基本建構。',
      code: {
        python: `def sortedArrayToBST(nums):
    def build(l, r):
        if l > r:
            return None
        m = (l + r) // 2                      # 中間當根,兩邊大小最多差 1
        return TreeNode(nums[m], build(l, m - 1), build(m + 1, r))
    return build(0, len(nums) - 1)`,
        c: `static struct TreeNode *build(int *a, int l, int r) {
    if (l > r) return NULL;
    int m = (l + r) / 2;
    struct TreeNode *t = malloc(sizeof *t);
    t->val = a[m];
    t->left = build(a, l, m - 1);
    t->right = build(a, m + 1, r);
    return t;
}

struct TreeNode *sortedArrayToBST(int *nums, int numsSize) { return build(nums, 0, numsSize - 1); }`,
        cpp: `TreeNode* build(vector<int> &a, int l, int r) {
    if (l > r) return nullptr;
    int m = (l + r) / 2;
    return new TreeNode(a[m], build(a, l, m - 1), build(a, m + 1, r));
}

TreeNode* sortedArrayToBST(vector<int>& nums) { return build(nums, 0, nums.size() - 1); }`,
        java: `TreeNode sortedArrayToBST(int[] nums) { return build(nums, 0, nums.length - 1); }

private TreeNode build(int[] a, int l, int r) {
    if (l > r) return null;
    int m = (l + r) / 2;
    return new TreeNode(a[m], build(a, l, m - 1), build(a, m + 1, r));
}`,
        javascript: `function sortedArrayToBST(nums) {
  const build = (l, r) => {
    if (l > r) return null;
    const m = (l + r) >> 1;
    return new TreeNode(nums[m], build(l, m - 1), build(m + 1, r));
  };
  return build(0, nums.length - 1);
}`,
      },
    },
    {
      name: '迭代:堆疊放待處理的範圍',
      idea: '先建根;堆疊放 `(父節點, 是左還是右, l, r)`,取出時建中間的節點、接上父親,再把兩半放回去。',
      steps: ['空陣列 → None', '根 = 中間;push (根, 左, l, m−1)、(根, 右, m+1, r)', '取出 (p, side, l, r):`l > r` 跳過;建 `nums[(l+r)//2]` 接到 p 的 side', '再 push 這個新節點的兩半'],
      figure: { title: `nums = [${A}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(log n)', why: '堆疊最多同時存 O(log n) 份(先處理的那邊會一路縮小)。' },
      verdict: '把遞迴的參數放進堆疊;建出的樹和遞迴版完全相同。',
      code: {
        python: `def sortedArrayToBST(nums):
    if not nums:
        return None
    def mid(l, r):
        return (l + r) // 2
    m = mid(0, len(nums) - 1)
    root = TreeNode(nums[m])
    st = [(root, 'L', 0, m - 1), (root, 'R', m + 1, len(nums) - 1)]
    while st:
        p, side, l, r = st.pop()
        if l > r:
            continue
        k = mid(l, r)
        node = TreeNode(nums[k])
        if side == 'L':
            p.left = node
        else:
            p.right = node
        st.append((node, 'L', l, k - 1))
        st.append((node, 'R', k + 1, r))
    return root`,
        c: `struct TreeNode *sortedArrayToBST(int *nums, int numsSize) {
    if (numsSize == 0) return NULL;
    struct { struct TreeNode *p; int side, l, r; } st[64];
    int top = 0, m = (numsSize - 1) / 2;
    struct TreeNode *root = calloc(1, sizeof *root);
    root->val = nums[m];
    st[top].p = root; st[top].side = 0; st[top].l = 0; st[top++].r = m - 1;
    st[top].p = root; st[top].side = 1; st[top].l = m + 1; st[top++].r = numsSize - 1;
    while (top) {
        top--;
        struct TreeNode *p = st[top].p;
        int side = st[top].side, l = st[top].l, r = st[top].r;
        if (l > r) continue;
        int k = (l + r) / 2;
        struct TreeNode *node = calloc(1, sizeof *node);
        node->val = nums[k];
        if (side == 0) p->left = node; else p->right = node;
        st[top].p = node; st[top].side = 0; st[top].l = l; st[top++].r = k - 1;
        st[top].p = node; st[top].side = 1; st[top].l = k + 1; st[top++].r = r;
    }
    return root;
}`,
        cpp: `TreeNode* sortedArrayToBST(vector<int>& nums) {
    if (nums.empty()) return nullptr;
    int m = (nums.size() - 1) / 2;
    TreeNode *root = new TreeNode(nums[m]);
    vector<tuple<TreeNode*, int, int, int>> st{{root, 0, 0, m - 1}, {root, 1, m + 1, (int)nums.size() - 1}};
    while (!st.empty()) {
        auto [p, side, l, r] = st.back(); st.pop_back();
        if (l > r) continue;
        int k = (l + r) / 2;
        TreeNode *node = new TreeNode(nums[k]);
        (side == 0 ? p->left : p->right) = node;
        st.push_back({node, 0, l, k - 1});
        st.push_back({node, 1, k + 1, r});
    }
    return root;
}`,
        java: `TreeNode sortedArrayToBST(int[] nums) {
    if (nums.length == 0) return null;
    int m = (nums.length - 1) / 2;
    TreeNode root = new TreeNode(nums[m]);
    Deque<Object[]> st = new ArrayDeque<>();
    st.push(new Object[]{root, 0, 0, m - 1});
    st.push(new Object[]{root, 1, m + 1, nums.length - 1});
    while (!st.isEmpty()) {
        Object[] e = st.pop();
        TreeNode p = (TreeNode) e[0];
        int side = (int) e[1], l = (int) e[2], r = (int) e[3];
        if (l > r) continue;
        int k = (l + r) / 2;
        TreeNode node = new TreeNode(nums[k]);
        if (side == 0) p.left = node; else p.right = node;
        st.push(new Object[]{node, 0, l, k - 1});
        st.push(new Object[]{node, 1, k + 1, r});
    }
    return root;
}`,
        javascript: `function sortedArrayToBST(nums) {
  if (!nums.length) return null;
  const m = (nums.length - 1) >> 1;
  const root = new TreeNode(nums[m]);
  const st = [[root, 0, 0, m - 1], [root, 1, m + 1, nums.length - 1]];
  while (st.length) {
    const [p, side, l, r] = st.pop();
    if (l > r) continue;
    const k = (l + r) >> 1;
    const node = new TreeNode(nums[k]);
    if (side === 0) p.left = node;
    else p.right = node;
    st.push([node, 0, l, k - 1], [node, 1, k + 1, r]);
  }
  return root;
}`,
      },
    },
  ],
  pitfalls: ['從頭依序插入 BST:已排序的資料會變成一條鏈,完全不平衡', '偶數長度時左中位數、右中位數都對,但同一份程式要一致(測資只接受其中一種時要注意)'],
  check: {
    kind: 'fn',
    fn: 'sortedArrayToBST',
    ret: 'tree',
    cases: [
      { args: [A], out: [0, -10, 5, null, -3, null, 9] },
      { args: [[1, 3]], out: [1, null, 3] },
      { args: [[1]], out: [1] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], out: [4, 2, 6, 1, 3, 5, 7] },
    ],
  },
}
