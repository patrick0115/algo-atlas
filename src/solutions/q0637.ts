import { tree } from './fig'
import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const T = [3, 9, 20, null, null, 15, 7]
const bfsFig: FigStep[] = [
  { note: '從根節點開始，佇列本層只有 3；平均為 3。', views: [tree(T, { cls: { 0: 'hl' } }), arr([3], { label: '第 0 層' })] },
  { note: '取出 3 後把孩子 9、20 放進佇列；下一層有 2 個節點。', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } }), arr([9, 20], { label: '第 1 層' })] },
  { note: '第 1 層總和 29，除以 2 得 14.5；再把 20 的孩子 15、7 放入佇列。', views: [tree(T, { cls: { 1: 'done', 2: 'done', 5: 'hl', 6: 'hl' } }), arr([3, 14.5], { label: '已算平均' })] },
  { note: '最後一層總和 22，除以 2 得 11；答案按層為 [3,14.5,11]。', views: [tree(T, { cls: { 5: 'done', 6: 'done' } }), arr([3, 14.5, 11], { label: '答案', done: [0, 1, 2] })] },
]
const dfsFig: FigStep[] = [
  { note: 'DFS 走到 3，把深度 0 的總和與節點數記成 (3,1)。', views: [tree(T, { cls: { 0: 'hl' } }), arr([3], { label: '各深度總和' })] },
  { note: '走左子節點 9：深度 1 目前為 (9,1)。', views: [tree(T, { cls: { 1: 'hl' } }), arr([3, 9], { label: '各深度總和' })] },
  { note: '再走右子節點 20，深度 1 變成 (29,2)；它的孩子使深度 2 變成 (22,2)。', views: [tree(T, { cls: { 2: 'done', 5: 'hl', 6: 'hl' } }), arr([3, 29, 22], { label: '各深度總和' })] },
  { note: '依深度用總和除以節點數，得到 3、14.5、11。', views: [arr([3, 14.5, 11], { label: '答案', done: [0, 1, 2] })] },
]

export const q0637: Solution = {
  id: 637,
  plain: '計算二元樹每一層節點數值的平均，從根節點那層開始列出。',
  statement: '給定非空二元樹 root，回傳陣列：第 d 個元素是深度 d 所有節點值的平均。',
  examples: [
    { input: 'root = [3,9,20,null,null,15,7]', output: '[3,14.5,11]' },
    { input: 'root = [3,9,20,15,7]', output: '[3,14.5,11]' },
  ],
  constraints: ['1 ≤ 節點數 ≤ 10⁴', '−2³¹ ≤ 節點值 ≤ 2³¹−1', '浮點數誤差在 10⁻⁵ 以內可接受'],
  insight: ['每層的平均等於該層總和除以節點數。', 'BFS 天然按層處理；每次先記錄當前佇列長度。', 'DFS 也可按深度累加總和與節點數。'],
  approaches: [
    {
      name: '廣度優先搜尋，逐層計算',
      idea: '佇列中每次有固定數量的本層節點；只處理這些節點並把孩子留給下一輪。',
      steps: ['根節點入佇列', '記住目前佇列長度 size', '取出恰好 size 個節點，加總並加入其孩子', '記錄 sum / size，直到佇列清空'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: bfsFig },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每節點進出佇列一次；w 為最大層寬。' },
      verdict: '與「每一層」的題意最貼合，是 [[p:tree-bfs]] 的典型題。',
      code: {
        python: `from collections import deque

def averageOfLevels(root):
    queue = deque([root])
    answer = []
    while queue:
        size = len(queue)                # 固定本層節點數
        total = 0
        for _ in range(size):
            node = queue.popleft()
            total += node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        answer.append(total / size)      # 本層平均
    return answer`,
        c: `double *averageOfLevels(struct TreeNode *root, int *returnSize) {
    struct TreeNode **queue = malloc(10000 * sizeof(struct TreeNode *));
    double *answer = malloc(10000 * sizeof(double));
    int front = 0;
    int back = 0;
    *returnSize = 0;
    queue[back++] = root;
    while (front < back) {
        int size = back - front;
        double total = 0;
        for (int i = 0; i < size; i++) {
            struct TreeNode *node = queue[front++];
            total += node->val;
            if (node->left) {
                queue[back++] = node->left;
            }
            if (node->right) {
                queue[back++] = node->right;
            }
        }
        answer[(*returnSize)++] = total / size;
    }
    free(queue);
    return answer;
}`,
        cpp: `vector<double> averageOfLevels(TreeNode* root) {
    queue<TreeNode*> pending;
    pending.push(root);
    vector<double> answer;
    while (!pending.empty()) {
        int size = pending.size();
        double total = 0;
        for (int i = 0; i < size; i++) {
            TreeNode* node = pending.front();
            pending.pop();
            total += node->val;
            if (node->left) {
                pending.push(node->left);
            }
            if (node->right) {
                pending.push(node->right);
            }
        }
        answer.push_back(total / size);
    }
    return answer;
}`,
        java: `List<Double> averageOfLevels(TreeNode root) {
    Queue<TreeNode> queue = new ArrayDeque<>();
    queue.add(root);
    List<Double> answer = new ArrayList<>();
    while (!queue.isEmpty()) {
        int size = queue.size();
        double total = 0;
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.remove();
            total += node.val;
            if (node.left != null) {
                queue.add(node.left);
            }
            if (node.right != null) {
                queue.add(node.right);
            }
        }
        answer.add(total / size);
    }
    return answer;
}`,
        javascript: `function averageOfLevels(root) {
  const queue = [root];
  const answer = [];
  let front = 0;
  while (front < queue.length) {
    const size = queue.length - front;
    let total = 0;
    for (let i = 0; i < size; i++) {
      const node = queue[front++];
      total += node.val;
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
    answer.push(total / size);
  }
  return answer;
}`,
      },
    },
    {
      name: '深度優先搜尋，按深度彙總',
      idea: '遞迴走訪每節點，將值加到該深度的總和，並增加該深度的節點數。',
      steps: ['建立 sums、counts 兩個陣列', 'DFS(node, depth)：若是新深度，新增零格', '累加 node.val、增加數量，再走左右孩子', '每個深度計算 sums[d] / counts[d]'],
      figure: { title: 'root = [3,9,20,null,null,15,7]', steps: dfsFig },
      complexity: { time: 'O(n)', space: 'O(h)', why: '遞迴堆疊與每層記錄最多樹高 h。' },
      verdict: '適合延伸到其他 [[p:tree-dfs]] 的「按深度統計」題。',
      code: {
        python: `def averageOfLevels(root):
    sums, counts = [], []

    def dfs(node, depth):
        if not node:
            return
        if depth == len(sums):
            sums.append(0)
            counts.append(0)
        sums[depth] += node.val          # 累加這一層
        counts[depth] += 1
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 0)
    return [s / c for s, c in zip(sums, counts)]`,
        c: `static void collect(struct TreeNode *node, int depth, double *sums, int *counts, int *levels) {
    if (!node) {
        return;
    }
    if (depth + 1 > *levels) {
        *levels = depth + 1;
    }
    sums[depth] += node->val;
    counts[depth]++;
    collect(node->left, depth + 1, sums, counts, levels);
    collect(node->right, depth + 1, sums, counts, levels);
}

double *averageOfLevels(struct TreeNode *root, int *returnSize) {
    double *sums = calloc(10000, sizeof(double));
    int *counts = calloc(10000, sizeof(int));
    double *answer = malloc(10000 * sizeof(double));
    *returnSize = 0;
    collect(root, 0, sums, counts, returnSize);
    for (int i = 0; i < *returnSize; i++) {
        answer[i] = sums[i] / counts[i];
    }
    free(sums);
    free(counts);
    return answer;
}`,
        cpp: `vector<double> averageOfLevels(TreeNode* root) {
    vector<double> sums;
    vector<int> counts;
    function<void(TreeNode*, int)> dfs = [&](TreeNode* node, int depth) {
        if (!node) {
            return;
        }
        if (depth == (int)sums.size()) {
            sums.push_back(0);
            counts.push_back(0);
        }
        sums[depth] += node->val;
        counts[depth]++;
        dfs(node->left, depth + 1);
        dfs(node->right, depth + 1);
    };
    dfs(root, 0);
    for (int d = 0; d < (int)sums.size(); d++) {
        sums[d] /= counts[d];
    }
    return sums;
}`,
        java: `List<Double> sums = new ArrayList<>();
List<Integer> counts = new ArrayList<>();

List<Double> averageOfLevels(TreeNode root) {
    sums.clear();
    counts.clear();
    collect(root, 0);
    List<Double> answer = new ArrayList<>();
    for (int d = 0; d < sums.size(); d++) {
        answer.add(sums.get(d) / counts.get(d));
    }
    return answer;
}

void collect(TreeNode node, int depth) {
    if (node == null) {
        return;
    }
    if (depth == sums.size()) {
        sums.add(0.0);
        counts.add(0);
    }
    sums.set(depth, sums.get(depth) + node.val);
    counts.set(depth, counts.get(depth) + 1);
    collect(node.left, depth + 1);
    collect(node.right, depth + 1);
}`,
        javascript: `function averageOfLevels(root) {
  const sums = [];
  const counts = [];
  function dfs(node, depth) {
    if (!node) {
      return;
    }
    if (depth === sums.length) {
      sums.push(0);
      counts.push(0);
    }
    sums[depth] += node.val;
    counts[depth]++;
    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  }
  dfs(root, 0);
  return sums.map((sum, depth) => sum / counts[depth]);
}`,
      },
    },
  ],
  pitfalls: ['平均數可能有小數，不能使用整數除法。', '節點值可能接近 32 位元界限；加總時使用足夠大的型別。', 'BFS 必須先固定本層 size，才不會把下一層的孩子算進來。'],
  check: { kind: 'fn', fn: 'averageOfLevels', argKinds: ['tree'], compare: 'close', cases: [
    { args: [T], out: [3, 14.5, 11] },
    { args: [[3, 9, 20, 15, 7]], out: [3, 14.5, 11] },
    { args: [[5]], out: [5] },
    { args: [[1, 2, 3]], out: [1, 2.5] },
  ] },
}
