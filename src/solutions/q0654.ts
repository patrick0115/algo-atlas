import { tree } from './fig'
import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [3, 2, 1, 6, 0, 5]
const T = [6, 3, 5, null, 2, 0, null, null, 1]
const recFig: FigStep[] = [
  { note: '整段 [3,2,1,6,0,5] 的最大值是 6，因此 6 成為根節點；左、右兩段分別遞迴。', views: [arr(A, { label: 'nums', highlight: [3] }), tree([6], { cls: { 0: 'hl' } })] },
  { note: '左段 [3,2,1] 最大為 3，成為左孩子；3 左邊沒有值，右邊仍有 [2,1]。', views: [tree([6, 3], { cls: { 1: 'hl' } }), arr([3, 2, 1], { label: '左段' })] },
  { note: '左段的右側依序選出 2、1；右段 [0,5] 選出 5，並把 0 放在 5 左邊。', views: [tree(T, { cls: { 4: 'hl', 5: 'hl', 8: 'hl' } })] },
  { note: '每個子段都選最大值為根，最後得到完整的最大二元樹。', views: [tree(T, { label: '完成', cls: { 0: 'done', 1: 'done', 2: 'done', 4: 'done', 5: 'done', 8: 'done' } })] },
]
const stackFig: FigStep[] = [
  { note: '逐一讀 3、2、1，它們遞減，因此依序入棧；目前是 3 的右邊接 2、2 的右邊接 1。', views: [tree([3, null, 2, null, 1]), arr([3, 2, 1], { label: '棧底到棧頂' })] },
  { note: '讀到 6，它比棧頂 1、2、3 都大，逐一彈出；最後彈出的 3 變成 6 的左孩子。', views: [tree([6, 3, null, null, 2, null, 1]), arr([6], { label: '棧' })] },
  { note: '讀到 0，將 0 接為 6 的右孩子；讀到 5 時彈出 0，讓 0 成為 5 的左孩子。', views: [tree(T, { cls: { 2: 'hl', 5: 'hl' } }), arr([6, 5], { label: '棧底到棧頂' })] },
  { note: '棧底是全域最大值 6，也就是完成後的根。', views: [tree(T, { label: '完成', cls: { 0: 'done' } })] },
]
const WRAP = {
  python: `

def maximumTreeCheck(nums):
    root = constructMaximumBinaryTree(nums)
    out = []
    def walk(node):
        if node is None:
            out.append(-1)
            return
        out.append(node.val)
        walk(node.left)
        walk(node.right)
    walk(root)
    return out`,
  c: `

static void encode(struct TreeNode *node, int *out, int *size) {
    if (!node) {
        out[(*size)++] = -1;
        return;
    }
    out[(*size)++] = node->val;
    encode(node->left, out, size);
    encode(node->right, out, size);
}

int *maximumTreeCheck(int *nums, int numsSize, int *returnSize) {
    struct TreeNode *root = constructMaximumBinaryTree(nums, numsSize);
    int *out = malloc((2 * numsSize + 1) * sizeof(int));
    *returnSize = 0;
    encode(root, out, returnSize);
    return out;
}`,
  cpp: `

void encode(TreeNode* node, vector<int>& out) {
    if (!node) {
        out.push_back(-1);
        return;
    }
    out.push_back(node->val);
    encode(node->left, out);
    encode(node->right, out);
}

vector<int> maximumTreeCheck(vector<int> nums) {
    TreeNode* root = constructMaximumBinaryTree(nums);
    vector<int> out;
    encode(root, out);
    return out;
}`,
  java: `

void encode(TreeNode node, List<Integer> out) {
    if (node == null) {
        out.add(-1);
        return;
    }
    out.add(node.val);
    encode(node.left, out);
    encode(node.right, out);
}

int[] maximumTreeCheck(int[] nums) {
    TreeNode root = constructMaximumBinaryTree(nums);
    List<Integer> out = new ArrayList<>();
    encode(root, out);
    int[] answer = new int[out.size()];
    for (int i = 0; i < out.size(); i++) {
        answer[i] = out.get(i);
    }
    return answer;
}`,
  javascript: `

function maximumTreeCheck(nums) {
  const root = constructMaximumBinaryTree(nums);
  const out = [];
  function walk(node) {
    if (!node) {
      out.push(-1);
      return;
    }
    out.push(node.val);
    walk(node.left);
    walk(node.right);
  }
  walk(root);
  return out;
}`,
}

export const q0654: Solution = {
  id: 654,
  plain: '每次選當前陣列的最大值當根，左、右兩側各建成子樹。',
  statement: '給定互不相同的整數陣列 nums。最大值為樹根；最大值左邊的子陣列遞迴建左子樹，右邊的子陣列遞迴建右子樹；回傳根節點。',
  examples: [
    { input: 'nums = [3,2,1,6,0,5]', output: '[6,3,5,null,2,0,null,null,1]' },
    { input: 'nums = [3,2,1]', output: '[3,null,2,null,1]' },
  ],
  constraints: ['1 ≤ nums.length ≤ 1000', '0 ≤ nums[i] ≤ 1000', '所有 nums[i] 互不相同'],
  insight: ['根由整段最大值決定；左、右子樹又是同一個問題。', '直接遞迴很易懂，但遞減序列會導致 O(n²)。', '單調棧能讓每個數只入棧、出棧一次。'],
  approaches: [
    {
      name: '遞迴尋找每段最大值',
      idea: '在區間 [left,right) 找最大值，建立根，再遞迴處理它兩側。',
      steps: ['空區間回傳空節點', '找區間中的最大值索引 m', '建立值為 nums[m] 的節點', '左右遞迴建樹並接到根'],
      figure: { title: 'nums = [3,2,1,6,0,5]', steps: recFig },
      complexity: { time: '最壞 O(n²)', space: 'O(n)', why: '遞減輸入每層都掃近乎整段，遞迴深度可達 n。' },
      verdict: '忠實依題意建構，適合先掌握 [[p:tree-dfs]] 的分治。',
      code: {
        python: `def constructMaximumBinaryTree(nums):
    def build(left, right):
        if left == right:
            return None
        mid = max(range(left, right), key=lambda i: nums[i])  # 找根
        root = TreeNode(nums[mid])
        root.left = build(left, mid)      # 最大值左側
        root.right = build(mid + 1, right)
        return root
    return build(0, len(nums))${WRAP.python}`,
        c: `static struct TreeNode *build(int *nums, int left, int right) {
    if (left == right) {
        return NULL;
    }
    int mid = left;
    for (int i = left + 1; i < right; i++) {
        if (nums[i] > nums[mid]) {
            mid = i;
        }
    }
    struct TreeNode *root = malloc(sizeof(struct TreeNode));
    root->val = nums[mid];
    root->left = build(nums, left, mid);
    root->right = build(nums, mid + 1, right);
    return root;
}

struct TreeNode *constructMaximumBinaryTree(int *nums, int numsSize) {
    return build(nums, 0, numsSize);
}${WRAP.c}`,
        cpp: `TreeNode* build(vector<int>& nums, int left, int right) {
    if (left == right) {
        return nullptr;
    }
    int mid = left;
    for (int i = left + 1; i < right; i++) {
        if (nums[i] > nums[mid]) {
            mid = i;
        }
    }
    TreeNode* root = new TreeNode(nums[mid]);
    root->left = build(nums, left, mid);
    root->right = build(nums, mid + 1, right);
    return root;
}

TreeNode* constructMaximumBinaryTree(vector<int>& nums) {
    return build(nums, 0, nums.size());
}${WRAP.cpp}`,
        java: `TreeNode constructMaximumBinaryTree(int[] nums) {
    return build(nums, 0, nums.length);
}

TreeNode build(int[] nums, int left, int right) {
    if (left == right) {
        return null;
    }
    int mid = left;
    for (int i = left + 1; i < right; i++) {
        if (nums[i] > nums[mid]) {
            mid = i;
        }
    }
    TreeNode root = new TreeNode(nums[mid]);
    root.left = build(nums, left, mid);
    root.right = build(nums, mid + 1, right);
    return root;
}${WRAP.java}`,
        javascript: `function constructMaximumBinaryTree(nums) {
  function build(left, right) {
    if (left === right) {
      return null;
    }
    let mid = left;
    for (let i = left + 1; i < right; i++) {
      if (nums[i] > nums[mid]) {
        mid = i;
      }
    }
    return {
      val: nums[mid],
      left: build(left, mid),
      right: build(mid + 1, right),
    };
  }
  return build(0, nums.length);
}${WRAP.javascript}`,
      },
    },
    {
      name: '遞減單調棧',
      idea: '棧中節點值遞減。新值較大時，彈出的最後節點成為新節點的左孩子；棧頂若仍在，讓它的右孩子指向新節點。',
      steps: ['從左到右讀每個值並建立節點', '彈出所有比新值小的棧頂，最後彈出的節點成為新節點左孩子', '若棧非空，讓棧頂的右孩子指向新節點', '新節點入棧；掃完棧底是整棵樹根'],
      figure: { title: 'nums = [3,2,1,6,0,5]', steps: stackFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點至多入棧與出棧各一次。' },
      verdict: '較高效，屬於 [[p:monotonic-stack]] 建樹技巧。',
      code: {
        python: `def constructMaximumBinaryTree(nums):
    stack = []
    for value in nums:
        node = TreeNode(value)
        while stack and stack[-1].val < value:
            node.left = stack.pop()      # 最後彈出的最大
        if stack:
            stack[-1].right = node       # 新節點位於棧頂右側
        stack.append(node)
    return stack[0]${WRAP.python}`,
        c: `struct TreeNode *constructMaximumBinaryTree(int *nums, int numsSize) {
    struct TreeNode **stack = malloc(numsSize * sizeof(struct TreeNode *));
    int top = 0;
    for (int i = 0; i < numsSize; i++) {
        struct TreeNode *node = malloc(sizeof(struct TreeNode));
        node->val = nums[i];
        node->left = NULL;
        node->right = NULL;
        while (top > 0 && stack[top - 1]->val < nums[i]) {
            node->left = stack[--top];
        }
        if (top > 0) {
            stack[top - 1]->right = node;
        }
        stack[top++] = node;
    }
    struct TreeNode *root = stack[0];
    free(stack);
    return root;
}${WRAP.c}`,
        cpp: `TreeNode* constructMaximumBinaryTree(vector<int>& nums) {
    vector<TreeNode*> stack;
    for (int value : nums) {
        TreeNode* node = new TreeNode(value);
        while (!stack.empty() && stack.back()->val < value) {
            node->left = stack.back();
            stack.pop_back();
        }
        if (!stack.empty()) {
            stack.back()->right = node;
        }
        stack.push_back(node);
    }
    return stack.front();
}${WRAP.cpp}`,
        java: `TreeNode constructMaximumBinaryTree(int[] nums) {
    Deque<TreeNode> stack = new ArrayDeque<>();
    for (int value : nums) {
        TreeNode node = new TreeNode(value);
        while (!stack.isEmpty() && stack.peekLast().val < value) {
            node.left = stack.removeLast();
        }
        if (!stack.isEmpty()) {
            stack.peekLast().right = node;
        }
        stack.addLast(node);
    }
    return stack.peekFirst();
}${WRAP.java}`,
        javascript: `function constructMaximumBinaryTree(nums) {
  const stack = [];
  for (const value of nums) {
    const node = { val: value, left: null, right: null };
    while (stack.length && stack[stack.length - 1].val < value) {
      node.left = stack.pop();
    }
    if (stack.length) {
      stack[stack.length - 1].right = node;
    }
    stack.push(node);
  }
  return stack[0];
}${WRAP.javascript}`,
      },
    },
  ],
  pitfalls: ['左右子樹由最大值在原陣列的左右位置決定，不能排序後建樹。', '單調棧彈出的最後節點才是新節點的直接左孩子。', '檢查函式以含空節點標記的前序序列比較，避免只比節點值而漏掉樹形。'],
  check: { kind: 'fn', fn: 'maximumTreeCheck', cases: [
    { args: [A], out: [6, 3, -1, 2, -1, 1, -1, -1, 5, 0, -1, -1, -1] },
    { args: [[3, 2, 1]], out: [3, -1, 2, -1, 1, -1, -1] },
    { args: [[1]], out: [1, -1, -1] },
  ] },
}
