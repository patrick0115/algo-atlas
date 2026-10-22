import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { treeOf, type FNode } from './fig'

// 105. Construct Binary Tree from Preorder and Inorder Traversal

const PRE = [3, 9, 20, 15, 7]
const IN = [9, 3, 15, 20, 7]

function buildFig(withMap: boolean): FigStep[] {
  let root: FNode | null = null
  let id = 0
  const out: FigStep[] = [
    {
      note: '前序 = 根、左子樹、右子樹;中序 = 左子樹、根、右子樹。所以**前序的第一個一定是根**;在中序裡找到根,左邊就是左子樹、右邊就是右子樹',
      views: [arr(PRE, { label: 'preorder' }), arr(IN, { label: 'inorder' })],
    },
  ]
  let p = 0
  // attach:先把新節點掛到父節點上,圖示才畫得出「目前建好的部分」
  const go = (lo: number, hi: number, attach: (n: FNode) => void) => {
    if (lo > hi) return
    const v = PRE[p++]
    const k = IN.indexOf(v)
    const node: FNode = { i: id++, val: v, left: null, right: null }
    attach(node)
    out.push({
      note: `前序下一個是 ${v} → 它是這棵子樹的根。${withMap ? '查 map' : '在中序裡找'}:${v} 在中序的第 ${k} 格 → ${k > lo ? `左子樹是中序 [${lo}, ${k - 1}](${k - lo} 個)` : '左邊沒有東西,左子樹是空的'}、${hi > k ? `右子樹是 [${k + 1}, ${hi}](${hi - k} 個)` : '右邊沒有東西,右子樹是空的'}`,
      views: [
        arr(PRE, { label: 'preorder', highlight: [p - 1], dim: range(0, p - 2) }),
        arr(IN, { label: 'inorder', range: [lo, hi], highlight: [k], compare: [...range(lo, k - 1)], dim: [...range(0, lo - 1), ...range(hi + 1, IN.length - 1)] }),
        treeOf(root, { label: '目前建好的樹', cls: { [node.i]: 'hl' } }),
      ],
    })
    go(lo, k - 1, (c) => (node.left = c))
    go(k + 1, hi, (c) => (node.right = c))
  }
  go(0, IN.length - 1, (n) => (root = n))
  const r = root
  out.push({ note: '前序用完,整棵樹建好了', views: [treeOf(r, { label: '結果' })] })
  return out
}

export const q0105: Solution = {
  id: 105,
  plain: '給你一棵樹的兩種「走訪紀錄」,請把原本的樹蓋回來。前序紀錄告訴你「誰是根」(第一個就是),中序紀錄告訴你「誰在根的左邊、誰在右邊」。兩個資訊合起來,就能一層一層拼回去。',
  statement: '給同一棵二元樹的前序遍歷 `preorder` 和中序遍歷 `inorder`(值都不重複),把這棵樹建出來並回傳根。',
  examples: [
    { input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', output: '[3,9,20,null,null,15,7]' },
    { input: 'preorder = [-1], inorder = [-1]', output: '[-1]' },
  ],
  constraints: ['`1 ≤ n ≤ 3000` → 每次在中序裡線性找根是 O(n²) = 900 萬,能過;用 map 是 O(n)', '**值不重複** → 才能用值去中序裡找位置'],
  insight: [
    '前序遍歷的順序是「根 → 左 → 右」,所以 `preorder[0]` 是整棵樹的根',
    '中序遍歷是「左 → 根 → 右」,在中序裡找到根的位置 k:k 左邊全部是左子樹,右邊全部是右子樹,而且知道左子樹有幾個節點',
    '左右子樹又是同樣的問題(各自的前序 + 中序)→ 遞迴',
    '前序的順序剛好是「先建根、再建左子樹、再建右子樹」,所以可以用一個指標從頭往後取,不用切陣列',
  ],
  approaches: [
    {
      name: '遞迴 + 每次在中序裡找根',
      idea: '`build(lo, hi)`:建出中序範圍 `[lo, hi]` 的子樹。根是前序的下一個值,在中序裡找到它的位置 k,先建 `[lo, k−1]` 當左子樹,再建 `[k+1, hi]` 當右子樹。',
      steps: ['`p = 0`(前序的指標)', '`build(lo, hi)`:`lo > hi` → null', '`v = preorder[p++]`,在 `inorder[lo..hi]` 裡找到 `k`', '`node.left = build(lo, k − 1)`、`node.right = build(k + 1, hi)`'],
      figure: { title: `preorder = [${PRE.join(',')}], inorder = [${IN.join(',')}]`, steps: buildFig(false) },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個節點在中序裡線性找一次,最壞 O(n);遞迴深度最壞 n。' },
      verdict: '先把「切法」想清楚。找根的那一步可以用 map 加速。',
      code: {
        python: `def buildTree(preorder, inorder):
    p = 0

    def build(lo, hi):                    # 建出 inorder[lo..hi] 這段的子樹
        nonlocal p
        if lo > hi:
            return None
        v = preorder[p]
        p += 1
        k = inorder.index(v, lo, hi + 1)  # 根在中序裡的位置
        node = TreeNode(v)
        node.left = build(lo, k - 1)      # 前序是 根、左、右,所以先建左
        node.right = build(k + 1, hi)
        return node

    return build(0, len(inorder) - 1)`,
        c: `static int p;

static struct TreeNode *build(int *pre, int *in, int lo, int hi) {
    if (lo > hi) return NULL;
    int v = pre[p++], k = lo;
    while (in[k] != v) k++;
    struct TreeNode *n = malloc(sizeof(struct TreeNode));
    n->val = v;
    n->left = build(pre, in, lo, k - 1);
    n->right = build(pre, in, k + 1, hi);
    return n;
}

struct TreeNode *buildTree(int *preorder, int preorderSize, int *inorder, int inorderSize) {
    p = 0;
    return build(preorder, inorder, 0, inorderSize - 1);
}`,
        cpp: `TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
    int p = 0;
    function<TreeNode*(int, int)> build = [&](int lo, int hi) -> TreeNode* {
        if (lo > hi) return nullptr;
        int v = preorder[p++];
        int k = find(inorder.begin() + lo, inorder.begin() + hi + 1, v) - inorder.begin();
        TreeNode* n = new TreeNode(v);
        n->left = build(lo, k - 1);
        n->right = build(k + 1, hi);
        return n;
    };
    return build(0, (int)inorder.size() - 1);
}`,
        java: `private int p;

TreeNode buildTree(int[] preorder, int[] inorder) {
    p = 0;
    return build(preorder, inorder, 0, inorder.length - 1);
}

private TreeNode build(int[] pre, int[] in, int lo, int hi) {
    if (lo > hi) return null;
    int v = pre[p++], k = lo;
    while (in[k] != v) k++;
    TreeNode n = new TreeNode(v);
    n.left = build(pre, in, lo, k - 1);
    n.right = build(pre, in, k + 1, hi);
    return n;
}`,
        javascript: `function buildTree(preorder, inorder) {
  let p = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const v = preorder[p++];
    const k = inorder.indexOf(v, lo);
    const n = new TreeNode(v);
    n.left = build(lo, k - 1);
    n.right = build(k + 1, hi);
    return n;
  };
  return build(0, inorder.length - 1);
}`,
      },
    },
    {
      name: '遞迴 + Hash Map 記中序位置',
      idea: '和方法一一樣,只是先用 map 記下「每個值在中序的位置」,找根變成 O(1)。',
      steps: ['`pos = {值: 中序位置}`', '其他和方法一相同,`k = pos[v]`'],
      figure: { title: `preorder = [${PRE.join(',')}], inorder = [${IN.join(',')}]`, steps: buildFig(true) },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點建一次、查 map 一次;map 和遞迴各 O(n)。' },
      verdict: '標準解。值不重複才能用 map;有重複值的話這題根本沒有唯一解。',
      code: {
        python: `def buildTree(preorder, inorder):
    pos = {v: i for i, v in enumerate(inorder)}
    p = 0

    def build(lo, hi):
        nonlocal p
        if lo > hi:
            return None
        v = preorder[p]
        p += 1
        k = pos[v]                        # O(1) 找到根在中序的位置
        node = TreeNode(v)
        node.left = build(lo, k - 1)
        node.right = build(k + 1, hi)
        return node

    return build(0, len(inorder) - 1)`,
        c: `// 值在 -3000 ~ 3000,用陣列當 map
static int p, pos[6001];

static struct TreeNode *build(int *pre, int lo, int hi) {
    if (lo > hi) return NULL;
    int v = pre[p++], k = pos[v + 3000];
    struct TreeNode *n = malloc(sizeof(struct TreeNode));
    n->val = v;
    n->left = build(pre, lo, k - 1);
    n->right = build(pre, k + 1, hi);
    return n;
}

struct TreeNode *buildTree(int *preorder, int preorderSize, int *inorder, int inorderSize) {
    for (int i = 0; i < inorderSize; i++) pos[inorder[i] + 3000] = i;
    p = 0;
    return build(preorder, 0, inorderSize - 1);
}`,
        cpp: `TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
    unordered_map<int, int> pos;
    for (int i = 0; i < (int)inorder.size(); i++) pos[inorder[i]] = i;
    int p = 0;
    function<TreeNode*(int, int)> build = [&](int lo, int hi) -> TreeNode* {
        if (lo > hi) return nullptr;
        int v = preorder[p++], k = pos[v];
        TreeNode* n = new TreeNode(v);
        n->left = build(lo, k - 1);
        n->right = build(k + 1, hi);
        return n;
    };
    return build(0, (int)inorder.size() - 1);
}`,
        java: `private int p;
private Map<Integer, Integer> pos;

TreeNode buildTree(int[] preorder, int[] inorder) {
    pos = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) pos.put(inorder[i], i);
    p = 0;
    return build(preorder, 0, inorder.length - 1);
}

private TreeNode build(int[] pre, int lo, int hi) {
    if (lo > hi) return null;
    int v = pre[p++], k = pos.get(v);
    TreeNode n = new TreeNode(v);
    n.left = build(pre, lo, k - 1);
    n.right = build(pre, k + 1, hi);
    return n;
}`,
        javascript: `function buildTree(preorder, inorder) {
  const pos = new Map(inorder.map((v, i) => [v, i]));
  let p = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const v = preorder[p++], k = pos.get(v);
    const n = new TreeNode(v);
    n.left = build(lo, k - 1);
    n.right = build(k + 1, hi);
    return n;
  };
  return build(0, inorder.length - 1);
}`,
      },
    },
  ],
  pitfalls: [
    '先建右子樹再建左子樹:前序的順序是「根、左、右」,指標 p 要先給左子樹用',
    '每次遞迴都切新的陣列(Python 的 `preorder[1:k+1]`):能過但每層都複製,變成 O(n²) 時間和空間',
    '中序的範圍用錯:左子樹是 `[lo, k − 1]`,右子樹是 `[k + 1, hi]`,根本身(k)兩邊都不包含',
  ],
  followUp: [
    { q: '改成中序 + 後序?', a: '106:後序是「左、右、根」,根是**最後一個**;指標從尾巴往前取,而且要**先建右子樹**。' },
    { q: '只有前序 + 後序?', a: '889:不一定唯一(只有一個孩子時分不出是左還是右),題目會允許回傳任一種。' },
  ],
  check: {
    kind: 'fn',
    fn: 'buildTree',
    ret: 'tree',
    cases: [
      { args: [PRE, IN], out: [3, 9, 20, null, null, 15, 7] },
      { args: [[-1], [-1]], out: [-1] },
      { args: [[1, 2], [2, 1]], out: [1, 2] },
      { args: [[1, 2], [1, 2]], out: [1, null, 2] },
      { args: [[1, 2, 4, 5, 3, 6], [4, 2, 5, 1, 6, 3]], out: [1, 2, 3, 4, 5, 6] },
    ],
  },
}
