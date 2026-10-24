import { tree } from './fig'
import type { Solution } from './types'

// 968. Binary Tree Cameras
const T = [0, 0, null, 0, 0]

export const q0968: Solution = {
  id: 968,
  plain: '攝影機裝在樹的某個節點時，可以照到自己、父節點與左右孩子。用最少攝影機照到整棵樹。',
  statement: '給二元樹，每台攝影機覆蓋所在節點、直接父節點及直接左右孩子。求覆蓋全部節點所需的最少攝影機數。',
  examples: [
    { input: 'root = [0,0,null,0,0]', output: '1', note: '裝在根的左孩子即可。' },
    { input: 'root = [0,0,null,0,null,0,null,null,0]', output: '2' },
  ],
  constraints: ['1 ≤ 節點數 ≤ 1000；節點值固定為 0，沒有額外意義。'],
  insight: ['葉子通常不需要自己裝攝影機：裝在父節點可多照到兄弟與祖父。', '後序遍歷時可把節點分成「未覆蓋、自己有攝影機、已被孩子覆蓋」三種狀態。'],
  approaches: [
    {
      name: '三狀態樹形 DP',
      idea: '每個子樹分別計算根裝攝影機、根已覆蓋但沒裝、根留給父節點覆蓋的最少成本。',
      steps: ['空節點的三狀態成本為無限大、0、0。', '裝攝影機：1 加上左右孩子任意狀態的最小成本。', '已覆蓋未裝：至少一個孩子裝攝影機。', '未覆蓋：兩個孩子都要已覆蓋且沒裝；根的答案只選前兩種。'],
      figure: { title: 'root = [0,0,null,0,0]', steps: [
        { note: '最底層兩片葉各有三種成本：裝攝影機 1、靠孩子覆蓋不可能、留給父親覆蓋 0。', views: [tree(T, { cls: { 3: 'hl', 4: 'hl' }, subs: { 3: '(1,∞,0)', 4: '(1,∞,0)' } })] },
        { note: '左孩子若裝一台，就能同時照到自己、兩片葉與根。', views: [tree(T, { cls: { 1: 'hl', 3: 'done', 4: 'done' }, subs: { 1: '裝 1 台' } })] },
        { note: '根沒有右孩子，可以由左孩子的攝影機覆蓋，根自身不必裝。', views: [tree(T, { cls: { 0: 'done', 1: 'hl', 3: 'done', 4: 'done' } })] },
        { note: '根必須已覆蓋；在允許的狀態中取最小值，答案 1。', views: [tree(T, { cls: { 0: 'done', 1: 'hl', 3: 'done', 4: 'done' }, subs: { 0: '答案 1' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每節點只組合一次三種狀態，遞迴深度為樹高。' },
      verdict: '狀態完整、方便證明；但轉移式較長。',
      code: {
        python: `def minCameraCover(root):
    inf = 10 ** 9

    def dfs(node):
        if not node:
            return inf, 0, 0
        la, lb, lc = dfs(node.left)
        ra, rb, rc = dfs(node.right)
        camera = 1 + min(la, lb, lc) + min(ra, rb, rc)
        covered = min(la + min(ra, rb), ra + min(la, lb))  # 至少一邊裝攝影機
        uncovered = lb + rb
        return camera, covered, uncovered

    camera, covered, _ = dfs(root)
    return min(camera, covered)`,
        c: `typedef struct { int camera, covered, uncovered; } State;

static int least(int a, int b) {
    return a < b ? a : b;
}

static State dfs(struct TreeNode *node) {
    if (!node) {
        return (State){1000000, 0, 0};
    }
    State l = dfs(node->left);
    State r = dfs(node->right);
    State out;
    out.camera = 1 + least(l.camera, least(l.covered, l.uncovered)) + least(r.camera, least(r.covered, r.uncovered));
    out.covered = least(l.camera + least(r.camera, r.covered), r.camera + least(l.camera, l.covered));
    out.uncovered = l.covered + r.covered;
    return out;
}

int minCameraCover(struct TreeNode *root) {
    State result = dfs(root);
    return least(result.camera, result.covered);
}`,
        cpp: `int minCameraCover(TreeNode* root) {
    const int inf = 1000000;
    auto dfs = [&](auto&& self, TreeNode* node) -> array<int, 3> {
        if (!node) {
            return {inf, 0, 0};
        }
        auto l = self(self, node->left);
        auto r = self(self, node->right);
        int camera = 1 + min({l[0], l[1], l[2]}) + min({r[0], r[1], r[2]});
        int covered = min(l[0] + min(r[0], r[1]), r[0] + min(l[0], l[1]));
        int uncovered = l[1] + r[1];
        return {camera, covered, uncovered};
    };
    auto result = dfs(dfs, root);
    return min(result[0], result[1]);
}`,
        java: `int minCameraCover(TreeNode root) {
    int[] result = dfs(root);
    return Math.min(result[0], result[1]);
}

private int[] dfs(TreeNode node) {
    if (node == null) {
        return new int[]{1000000, 0, 0};
    }
    int[] left = dfs(node.left);
    int[] right = dfs(node.right);
    int camera = 1 + Math.min(left[0], Math.min(left[1], left[2])) + Math.min(right[0], Math.min(right[1], right[2]));
    int covered = Math.min(left[0] + Math.min(right[0], right[1]), right[0] + Math.min(left[0], left[1]));
    int uncovered = left[1] + right[1];
    return new int[]{camera, covered, uncovered};
}`,
        javascript: `function minCameraCover(root) {
  const inf = 1000000;
  function dfs(node) {
    if (!node) {
      return [inf, 0, 0];
    }
    const left = dfs(node.left);
    const right = dfs(node.right);
    const camera = 1 + Math.min(...left) + Math.min(...right);
    const covered = Math.min(left[0] + Math.min(right[0], right[1]), right[0] + Math.min(left[0], left[1]));
    const uncovered = left[1] + right[1];
    return [camera, covered, uncovered];
  }
  const result = dfs(root);
  return Math.min(result[0], result[1]);
}`,
      },
    },
    {
      name: '後序貪心：照顧未覆蓋的孩子',
      idea: '孩子回報未覆蓋時，就在目前節點裝攝影機；已裝攝影機的孩子能覆蓋目前節點。',
      steps: ['空節點視為已覆蓋，避免替空位置裝攝影機。', '先處理左右孩子。', '有任何孩子未覆蓋，就在目前節點裝攝影機。', '否則有孩子裝攝影機就回報已覆蓋；都沒有則回報未覆蓋。', '最後若根仍未覆蓋，再補一台。'],
      figure: { title: 'root = [0,0,null,0,0]', steps: [
        { note: '最底下兩片葉沒有孩子的攝影機照到，回報「未覆蓋」。', views: [tree(T, { cls: { 3: 'hl', 4: 'hl' } })] },
        { note: '左孩子看見未覆蓋的孩子，於自己裝一台攝影機。', views: [tree(T, { cls: { 1: 'hl', 3: 'done', 4: 'done' }, subs: { 1: '攝影機' } })] },
        { note: '根的左孩子已裝攝影機，因此根也被照到，不需再裝。', views: [tree(T, { cls: { 0: 'done', 1: 'hl', 3: 'done', 4: 'done' } })] },
        { note: '全部節點都已覆蓋，共只使用一台攝影機。', views: [tree(T, { cls: { 0: 'done', 1: 'hl', 3: 'done', 4: 'done' }, subs: { 1: '1 台' } })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點後序處理一次。' },
      verdict: '標準簡潔解；別忘了最後檢查根是否仍未被覆蓋。',
      code: {
        python: `def minCameraCover(root):
    cameras = 0

    def dfs(node):
        nonlocal cameras
        if not node:
            return 2  # 空處視為已覆蓋
        left = dfs(node.left)
        right = dfs(node.right)
        if left == 0 or right == 0:
            cameras += 1
            return 1  # 在父節點裝一台，照顧未覆蓋的孩子
        if left == 1 or right == 1:
            return 2
        return 0

    if dfs(root) == 0:
        cameras += 1
    return cameras`,
        c: `static int dfs(struct TreeNode *node, int *cameras) {
    if (!node) {
        return 2;
    }
    int left = dfs(node->left, cameras);
    int right = dfs(node->right, cameras);
    if (left == 0 || right == 0) {
        (*cameras)++;
        return 1;
    }
    if (left == 1 || right == 1) {
        return 2;
    }
    return 0;
}

int minCameraCover(struct TreeNode *root) {
    int cameras = 0;
    if (dfs(root, &cameras) == 0) {
        cameras++;
    }
    return cameras;
}`,
        cpp: `int minCameraCover(TreeNode* root) {
    int cameras = 0;
    auto dfs = [&](auto&& self, TreeNode* node) -> int {
        if (!node) {
            return 2;
        }
        int left = self(self, node->left);
        int right = self(self, node->right);
        if (left == 0 || right == 0) {
            cameras++;
            return 1;
        }
        if (left == 1 || right == 1) {
            return 2;
        }
        return 0;
    };
    if (dfs(dfs, root) == 0) {
        cameras++;
    }
    return cameras;
}`,
        java: `int minCameraCover(TreeNode root) {
    int[] cameras = new int[1];
    if (dfs(root, cameras) == 0) {
        cameras[0]++;
    }
    return cameras[0];
}

private int dfs(TreeNode node, int[] cameras) {
    if (node == null) {
        return 2;
    }
    int left = dfs(node.left, cameras);
    int right = dfs(node.right, cameras);
    if (left == 0 || right == 0) {
        cameras[0]++;
        return 1;
    }
    if (left == 1 || right == 1) {
        return 2;
    }
    return 0;
}`,
        javascript: `function minCameraCover(root) {
  let cameras = 0;
  function dfs(node) {
    if (!node) {
      return 2;
    }
    const left = dfs(node.left);
    const right = dfs(node.right);
    if (left === 0 || right === 0) {
      cameras++;
      return 1;
    }
    if (left === 1 || right === 1) {
      return 2;
    }
    return 0;
  }
  if (dfs(root) === 0) {
    cameras++;
  }
  return cameras;
}`,
      },
    },
  ],
  pitfalls: ['空節點不能被視為未覆蓋，否則會誘使父節點裝無用的攝影機。', '根沒有父節點；若最後仍未覆蓋，必須在根補一台。'],
  check: { kind: 'fn', fn: 'minCameraCover', argKinds: ['tree'], cases: [
    { args: [T], out: 1 },
    { args: [[0, 0, null, 0, null, 0, null, null, 0]], out: 2 },
    { args: [[0]], out: 1 },
    { args: [[0, 0, 0]], out: 1 },
  ] },
}
