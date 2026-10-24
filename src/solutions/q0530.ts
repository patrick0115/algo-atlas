import { arr } from '../engine/helpers'
import { tree } from './fig'
import type { FigStep, Solution } from './types'

const T = [4, 2, 6, 1, 3]

function inorderFig(): FigStep[] {
  return [
    { note: '二元搜尋樹的中序順序是遞增的：這棵樹會讀出 1、2、3、4、6。', views: [tree(T), arr([1, 2, 3, 4, 6], { label: '中序順序' })] },
    { note: '讀到 1 時還沒有前一個值；讀到 2 時，差距 2 − 1 = 1。', views: [arr([1, 2, 3, 4, 6], { label: '中序順序', compare: [0], highlight: [1] }), arr([1], { label: '最小差' })] },
    { note: '接下來 3 − 2 = 1、4 − 3 = 1，都沒有改善答案。', views: [arr([1, 2, 3, 4, 6], { label: '中序順序', done: [0, 1, 2, 3] }), arr([1], { label: '最小差' })] },
    { note: '最後 6 − 4 = 2，較大；最小差仍是 1。', views: [arr([1, 2, 3, 4, 6], { label: '中序順序', done: [0, 1, 2, 3, 4] }), arr([1], { label: '答案', done: [0] })] },
  ]
}

function sortFig(): FigStep[] {
  return [
    { note: '若不利用搜尋樹性質，也能先走遍整棵樹，收集 [4,2,1,3,6]。', views: [tree(T), arr([4, 2, 1, 3, 6], { label: '收集值' })] },
    { note: '排序後得到 [1,2,3,4,6]。最近的兩個值一定會相鄰。', views: [arr([1, 2, 3, 4, 6], { label: '排序後' })] },
    { note: '相鄰差依序是 1、1、1、2；前三對都得到最小差 1。', views: [arr([1, 1, 1, 2], { label: '相鄰差', done: [0, 1, 2] })] },
    { note: '因此回傳 1。', views: [arr([1], { label: '答案', done: [0] })] },
  ]
}

export const q0530: Solution = {
  id: 530,
  plain: '在二元搜尋樹裡，找任意兩個節點值最接近時的差距。',
  statement: '給一棵二元搜尋樹，回傳任意兩個不同節點的值之間的最小絕對差。',
  examples: [
    { input: 'root = [4,2,6,1,3]', output: '1' },
    { input: 'root = [1,0,48,null,null,12,49]', output: '1' },
  ],
  constraints: ['節點數至少 2，最多 10⁴；節點值在 0 到 10⁵。'],
  insight: ['將值排序後，最小差一定落在相鄰兩數之間。', '二元搜尋樹的中序走訪本來就是遞增順序，因此不用另外排序。'],
  approaches: [
    {
      name: '中序走訪，邊走邊比',
      idea: '維護上一個走訪值；每到一個節點，只需比較它與上一個值。',
      steps: ['先遞迴走左子樹。', '若有上一個值，用目前值減去它並更新最小差。', '記下目前值，再走右子樹。'],
      figure: { title: 'root = [4,2,6,1,3]', steps: inorderFig() },
      complexity: { time: 'O(n)', space: 'O(h)', why: '每個節點走一次，遞迴堆疊深度是樹高 h。' },
      verdict: '利用搜尋樹的順序，時間與額外空間都較好。',
      code: {
        python: `def getMinimumDifference(root):
    previous = None
    answer = float('inf')

    def walk(node):
        nonlocal previous, answer
        if not node:
            return
        walk(node.left)
        if previous is not None:
            answer = min(answer, node.val - previous)  # 只比相鄰值
        previous = node.val
        walk(node.right)

    walk(root)
    return answer`,
        c: `static void minDiffWalk(struct TreeNode *node, int *previous, bool *hasPrevious, int *answer) {
    if (node == NULL) {
        return;
    }
    minDiffWalk(node->left, previous, hasPrevious, answer);
    if (*hasPrevious && node->val - *previous < *answer) {
        *answer = node->val - *previous;
    }
    *previous = node->val;
    *hasPrevious = true;
    minDiffWalk(node->right, previous, hasPrevious, answer);
}

int getMinimumDifference(struct TreeNode *root) {
    int previous = 0, answer = INT_MAX;
    bool hasPrevious = false;
    minDiffWalk(root, &previous, &hasPrevious, &answer);
    return answer;
}`,
        cpp: `int getMinimumDifference(TreeNode *root) {
    int previous = 0, answer = INT_MAX;
    bool hasPrevious = false;
    function<void(TreeNode*)> walk = [&](TreeNode *node) {
        if (node == nullptr) {
            return;
        }
        walk(node->left);
        if (hasPrevious) {
            answer = min(answer, node->val - previous);
        }
        previous = node->val;
        hasPrevious = true;
        walk(node->right);
    };
    walk(root);
    return answer;
}`,
        java: `int previous;
int answer;
boolean hasPrevious;

void walk(TreeNode node) {
    if (node == null) {
        return;
    }
    walk(node.left);
    if (hasPrevious) {
        answer = Math.min(answer, node.val - previous);
    }
    previous = node.val;
    hasPrevious = true;
    walk(node.right);
}

int getMinimumDifference(TreeNode root) {
    answer = Integer.MAX_VALUE;
    hasPrevious = false;
    walk(root);
    return answer;
}`,
        javascript: `function getMinimumDifference(root) {
  let previous = null;
  let answer = Infinity;
  function walk(node) {
    if (node === null) {
      return;
    }
    walk(node.left);
    if (previous !== null) {
      answer = Math.min(answer, node.val - previous);
    }
    previous = node.val;
    walk(node.right);
  }
  walk(root);
  return answer;
}`,
      },
    },
    {
      name: '收集、排序後比較',
      idea: '把所有值收集成陣列，排序後逐一比較相鄰元素。',
      steps: ['走遍樹並收集節點值。', '將值由小到大排序。', '掃描排序後的相鄰差，回傳最小者。'],
      figure: { title: '收集 [4,2,1,3,6] 再排序', steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序花 O(n log n)，儲存全部 n 個值。' },
      verdict: '不依賴搜尋樹性質，普通二元樹也適用。',
      code: {
        python: `def getMinimumDifference(root):
    values = []

    def collect(node):
        if not node:
            return
        values.append(node.val)  # 收集全部節點值
        collect(node.left)
        collect(node.right)

    collect(root)
    values.sort()
    answer = float('inf')
    for i in range(1, len(values)):
        answer = min(answer, values[i] - values[i - 1])
    return answer`,
        c: `static void collectValues(struct TreeNode *node, int *values, int *size) {
    if (node == NULL) {
        return;
    }
    values[(*size)++] = node->val;
    collectValues(node->left, values, size);
    collectValues(node->right, values, size);
}

static int compareInts(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int getMinimumDifference(struct TreeNode *root) {
    int *values = malloc(10000 * sizeof(int));
    int size = 0;
    collectValues(root, values, &size);
    qsort(values, size, sizeof(int), compareInts);
    int answer = INT_MAX;
    for (int i = 1; i < size; i++) {
        int difference = values[i] - values[i - 1];
        if (difference < answer) {
            answer = difference;
        }
    }
    free(values);
    return answer;
}`,
        cpp: `void collectValues(TreeNode *node, vector<int>& values) {
    if (node == nullptr) {
        return;
    }
    values.push_back(node->val);
    collectValues(node->left, values);
    collectValues(node->right, values);
}

int getMinimumDifference(TreeNode *root) {
    vector<int> values;
    collectValues(root, values);
    sort(values.begin(), values.end());
    int answer = INT_MAX;
    for (int i = 1; i < (int)values.size(); i++) {
        answer = min(answer, values[i] - values[i - 1]);
    }
    return answer;
}`,
        java: `void collectValues(TreeNode node, List<Integer> values) {
    if (node == null) {
        return;
    }
    values.add(node.val);
    collectValues(node.left, values);
    collectValues(node.right, values);
}

int getMinimumDifference(TreeNode root) {
    List<Integer> values = new ArrayList<>();
    collectValues(root, values);
    Collections.sort(values);
    int answer = Integer.MAX_VALUE;
    for (int i = 1; i < values.size(); i++) {
        answer = Math.min(answer, values.get(i) - values.get(i - 1));
    }
    return answer;
}`,
        javascript: `function getMinimumDifference(root) {
  const values = [];
  function collect(node) {
    if (node === null) {
      return;
    }
    values.push(node.val);
    collect(node.left);
    collect(node.right);
  }
  collect(root);
  values.sort((a, b) => a - b);
  let answer = Infinity;
  for (let i = 1; i < values.length; i++) {
    answer = Math.min(answer, values[i] - values[i - 1]);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['比較的是任意兩個節點值，並非父子節點值。', '使用中序法時，上一次讀到的值必須跨越遞迴呼叫保留。'],
  check: {
    kind: 'fn',
    fn: 'getMinimumDifference',
    argKinds: ['tree'],
    cases: [
      { args: [T], out: 1 },
      { args: [[1, 0, 48, null, null, 12, 49]], out: 1 },
      { args: [[5, 3, 10]], out: 2 },
    ],
  },
}
