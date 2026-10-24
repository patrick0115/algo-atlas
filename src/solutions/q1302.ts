import { tree } from './fig'
import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const T = [1, 2, 3, 4, 5, null, 6, 7, null, null, null, null, 8]
const bfsFig: FigStep[] = [
  { note: '第 0 層只有根 1，這層總和是 1；先記作暫時答案。', views: [tree(T, { cls: { 0: 'hl' } }), arr([1], { label: '目前層總和' })] },
  { note: '第 1 層有 2、3，總和 5；它比第 0 層更深，直接覆蓋答案。', views: [tree(T, { cls: { 1: 'hl', 2: 'hl' } }), arr([5], { label: '目前層總和' })] },
  { note: '第 2 層有 4、5、6，總和 15，仍覆蓋答案。', views: [tree(T, { cls: { 3: 'hl', 4: 'hl', 6: 'hl' } }), arr([15], { label: '目前層總和' })] },
  { note: '最深的第 3 層有 7、8，總和 15；佇列空了，回傳這層的 15。', views: [tree(T, { cls: { 7: 'hl', 12: 'hl' } }), arr([15], { label: '答案', done: [0] })] },
]
const dfsFig: FigStep[] = [
  { note: '從根 1 深度 0 出發；目前已知最深層是 0，總和 1。', views: [tree(T, { cls: { 0: 'hl' } }), arr([0, 1], { label: '深度 / 總和' })] },
  { note: 'DFS 先往左走到 4，再到 7；7 位於新最深的深度 3，所以清空舊總和，改成 7。', views: [tree(T, { cls: { 7: 'hl' } }), arr([3, 7], { label: '最深深度 / 總和' })] },
  { note: '右邊的 8 也在深度 3，與目前最深層相同，加入總和成 15。', views: [tree(T, { cls: { 12: 'hl' } }), arr([3, 15], { label: '最深深度 / 總和' })] },
  { note: '其他節點都較淺，走完樹後答案仍是 15。', views: [arr([15], { label: '答案', done: [0] })] },
]

export const q1302: Solution = {
  id: 1302,
  plain: '把二元樹最底層的節點值加起來；較上層的值都不算。',
  statement: '給二元樹根節點，回傳深度最大的所有節點值之和。根的深度為 0。',
  examples: [{ input: 'root = [1,2,3,4,5,null,6,7,null,null,null,null,8]', output: '15' }, { input: 'root = [6,7,8,2,7,1,3,9,null,1,4,null,null,null,5]', output: '19' }],
  constraints: ['至少一個節點；樹可能很歪。', '最深層不一定只有一個葉節點。'],
  insight: ['[[p:tree-bfs]] 每輪正好處理一層，最後一輪的總和就是答案。', '用 [[p:tree-dfs]] 也行：遇到更深層就重設總和，遇到同樣深度就相加。'],
  approaches: [
    {
      name: 'BFS 一層一層算', idea: '每層計算新的總和並覆蓋舊答案；最後留下的就是最深層。',
      steps: ['根節點入隊。', '每輪只取目前層的固定數量。', '計算該層總和並加入孩子。', '佇列空後回傳最後一層總和。'],
      figure: { title: 'root = [1,2,3,4,5,null,6,7,null,null,null,null,8]', steps: bfsFig },
      complexity: { time: 'O(n)', space: 'O(w)', why: '每節點進出佇列一次；w 是最寬的一層。' },
      verdict: '推薦解法，題意就是逐層處理。',
      code: {
        python: `from collections import deque

def deepestLeavesSum(root):
    queue = deque([root])
    answer = 0
    while queue:
        answer = 0  # 新的一層覆蓋較淺層的總和
        for _ in range(len(queue)):
            node = queue.popleft()
            answer += node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return answer`,
        c: `int deepestLeavesSum(struct TreeNode *root) {
    struct TreeNode **queue = malloc(10001 * sizeof(struct TreeNode *));
    int front = 0;
    int back = 0;
    queue[back++] = root;
    int answer = 0;
    while (front < back) {
        int count = back - front;
        answer = 0;
        for (int i = 0; i < count; i++) {
            struct TreeNode *node = queue[front++];
            answer += node->val;
            if (node->left != NULL) {
                queue[back++] = node->left;
            }
            if (node->right != NULL) {
                queue[back++] = node->right;
            }
        }
    }
    free(queue);
    return answer;
}`,
        cpp: `int deepestLeavesSum(TreeNode* root) {
    queue<TreeNode*> nodes;
    nodes.push(root);
    int answer = 0;
    while (!nodes.empty()) {
        int count = nodes.size();
        answer = 0;
        for (int i = 0; i < count; i++) {
            TreeNode* node = nodes.front();
            nodes.pop();
            answer += node->val;
            if (node->left) {
                nodes.push(node->left);
            }
            if (node->right) {
                nodes.push(node->right);
            }
        }
    }
    return answer;
}`,
        java: `int deepestLeavesSum(TreeNode root) {
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    int answer = 0;
    while (!queue.isEmpty()) {
        int count = queue.size();
        answer = 0;
        for (int i = 0; i < count; i++) {
            TreeNode node = queue.poll();
            answer += node.val;
            if (node.left != null) {
                queue.offer(node.left);
            }
            if (node.right != null) {
                queue.offer(node.right);
            }
        }
    }
    return answer;
}`,
        javascript: `function deepestLeavesSum(root) {
  const queue = [root];
  let front = 0;
  let answer = 0;
  while (front < queue.length) {
    const count = queue.length - front;
    answer = 0;
    for (let i = 0; i < count; i++) {
      const node = queue[front++];
      answer += node.val;
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: 'DFS 維護最深深度', idea: '遇到更深節點便重設答案；同深度便累加。',
      steps: ['記錄目前最深深度及總和。', '遞迴到更深節點時，深度與總和一起更新。', '遞迴到同深度節點時，把值加入總和。'],
      figure: { title: 'root = [1,2,3,4,5,null,6,7,null,null,null,null,8]', steps: dfsFig },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每節點走一次；遞迴深度為樹高。' },
      verdict: '適合已經用 DFS 處理樹深度的情況。',
      code: {
        python: `def deepestLeavesSum(root):
    deepest = -1
    answer = 0

    def dfs(node, depth):
        nonlocal deepest, answer
        if not node:
            return
        if depth > deepest:
            deepest = depth
            answer = node.val  # 新的最深層，舊層總和作廢
        elif depth == deepest:
            answer += node.val
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 0)
    return answer`,
        c: `static void dfs1302(struct TreeNode *node, int depth, int *deepest, int *answer) {
    if (node == NULL) {
        return;
    }
    if (depth > *deepest) {
        *deepest = depth;
        *answer = node->val;
    } else if (depth == *deepest) {
        *answer += node->val;
    }
    dfs1302(node->left, depth + 1, deepest, answer);
    dfs1302(node->right, depth + 1, deepest, answer);
}

int deepestLeavesSum(struct TreeNode *root) {
    int deepest = -1;
    int answer = 0;
    dfs1302(root, 0, &deepest, &answer);
    return answer;
}`,
        cpp: `int deepestLeavesSum(TreeNode* root) {
    int deepest = -1;
    int answer = 0;
    function<void(TreeNode*, int)> dfs = [&](TreeNode* node, int depth) {
        if (!node) {
            return;
        }
        if (depth > deepest) {
            deepest = depth;
            answer = node->val;
        } else if (depth == deepest) {
            answer += node->val;
        }
        dfs(node->left, depth + 1);
        dfs(node->right, depth + 1);
    };
    dfs(root, 0);
    return answer;
}`,
        java: `int deepest = -1;
int answer = 0;

void dfs(TreeNode node, int depth) {
    if (node == null) {
        return;
    }
    if (depth > deepest) {
        deepest = depth;
        answer = node.val;
    } else if (depth == deepest) {
        answer += node.val;
    }
    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
}

int deepestLeavesSum(TreeNode root) {
    deepest = -1;
    answer = 0;
    dfs(root, 0);
    return answer;
}`,
        javascript: `function deepestLeavesSum(root) {
  let deepest = -1;
  let answer = 0;
  function dfs(node, depth) {
    if (!node) {
      return;
    }
    if (depth > deepest) {
      deepest = depth;
      answer = node.val;
    } else if (depth === deepest) {
      answer += node.val;
    }
    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  }
  dfs(root, 0);
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['不是只加葉節點；必須只看整棵樹最大深度的節點。', 'BFS 每輪要重設總和，否則會把較淺層也算進去。'],
  check: { kind: 'fn', fn: 'deepestLeavesSum', argKinds: ['tree'], cases: [
    { args: [T], out: 15 },
    { args: [[1]], out: 1 },
    { args: [[1, 2, 3, 4]], out: 4 },
  ] },
}
