import type { GraphViewData } from '../types'
import { tree } from './fig'
import type { Solution } from './types'

// 117. Populating Next Right Pointers in Each Node II
const T = [1, 2, 3, 4, 5, null, 7]
const L = [1, 2, 3, 4, 5, -101, 7]

function view(links: [number, number][], focus: number[] = []): GraphViewData {
  const base = tree(T, { cls: Object.fromEntries(focus.map((i) => [i, 'hl'])) })
  return {
    ...base,
    label: '樹枝是原有孩子；箭頭是 next',
    edges: [...base.edges, ...links.map(([from, to]) => ({ from, to, directed: true, cls: 'hl' }))],
  }
}

// 包裝函式用 -101 表示空位（在節點值範圍外），依 LeetCode 層序格式建樹，沿 next 驗證每層。
const NODE = {
  python: `class Node:
    def __init__(self, val=0, left=None, right=None, next=None):
        self.val = val
        self.left = left
        self.right = right
        self.next = next

`,
  c: `struct Node {
    int val;
    struct Node *left;
    struct Node *right;
    struct Node *next;
};

`,
  cpp: `class Node {
public:
    int val;
    Node *left;
    Node *right;
    Node *next;
    Node(int value) : val(value), left(nullptr), right(nullptr), next(nullptr) {}
};

`,
  java: `class Node {
    int val;
    Node left;
    Node right;
    Node next;
    Node(int value) { val = value; }
}

`,
  javascript: `class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.next = null;
  }
}

`,
}

const CHECK = {
  python: `

def connectLevels(level):
    if not level:
        return []
    root = Node(level[0])
    queue = [root]
    at = 1
    for parent in queue:
        if at < len(level) and level[at] != -101:
            parent.left = Node(level[at])
            queue.append(parent.left)
        at += 1
        if at < len(level) and level[at] != -101:
            parent.right = Node(level[at])
            queue.append(parent.right)
        at += 1
        if at >= len(level):
            break
    connect(root)
    result = []
    head = root
    while head:
        row = []
        next_head = None
        node = head
        while node:
            row.append(node.val)
            if not next_head:
                next_head = node.left or node.right
            node = node.next
        result.append(row)
        head = next_head
    return result`,
  c: `

int **connectLevels(int *level, int levelSize, int *returnSize, int **returnColumnSizes) {
    *returnSize = 0;
    int **result = malloc((levelSize + 1) * sizeof(int *));
    *returnColumnSizes = malloc((levelSize + 1) * sizeof(int));
    if (levelSize == 0) {
        return result;
    }
    struct Node *nodes = calloc(levelSize, sizeof(struct Node));
    struct Node **queue = malloc(levelSize * sizeof(struct Node *));
    for (int i = 0; i < levelSize; i++) {
        nodes[i].val = level[i];
    }
    int head = 0;
    int tail = 0;
    int at = 1;
    queue[tail++] = &nodes[0];
    while (head < tail && at < levelSize) {
        struct Node *parent = queue[head++];
        if (at < levelSize && level[at] != -101) {
            parent->left = &nodes[at];
            queue[tail++] = &nodes[at];
        }
        at++;
        if (at < levelSize && level[at] != -101) {
            parent->right = &nodes[at];
            queue[tail++] = &nodes[at];
        }
        at++;
    }
    connect(&nodes[0]);
    for (struct Node *start = &nodes[0]; start;) {
        result[*returnSize] = malloc(levelSize * sizeof(int));
        int count = 0;
        struct Node *nextHead = NULL;
        for (struct Node *node = start; node; node = node->next) {
            result[*returnSize][count++] = node->val;
            if (!nextHead) {
                nextHead = node->left ? node->left : node->right;
            }
        }
        (*returnColumnSizes)[(*returnSize)++] = count;
        start = nextHead;
    }
    free(queue);
    free(nodes);
    return result;
}`,
  cpp: `

vector<vector<int>> connectLevels(vector<int>& level) {
    vector<vector<int>> result;
    if (level.empty()) {
        return result;
    }
    vector<Node*> nodes;
    for (int value : level) {
        nodes.push_back(value == -101 ? nullptr : new Node(value));
    }
    queue<Node*> todo;
    todo.push(nodes[0]);
    int at = 1;
    while (!todo.empty() && at < (int)nodes.size()) {
        Node* parent = todo.front();
        todo.pop();
        if (at < (int)nodes.size()) {
            parent->left = nodes[at++];
            if (parent->left) {
                todo.push(parent->left);
            }
        }
        if (at < (int)nodes.size()) {
            parent->right = nodes[at++];
            if (parent->right) {
                todo.push(parent->right);
            }
        }
    }
    connect(nodes[0]);
    for (Node* start = nodes[0]; start;) {
        result.push_back({});
        Node* nextHead = nullptr;
        for (Node* node = start; node; node = node->next) {
            result.back().push_back(node->val);
            if (!nextHead) {
                nextHead = node->left ? node->left : node->right;
            }
        }
        start = nextHead;
    }
    for (Node* node : nodes) {
        delete node;
    }
    return result;
}`,
  java: `

List<List<Integer>> connectLevels(int[] level) {
    List<List<Integer>> result = new ArrayList<>();
    if (level.length == 0) {
        return result;
    }
    Node[] nodes = new Node[level.length];
    for (int i = 0; i < level.length; i++) {
        if (level[i] != -101) {
            nodes[i] = new Node(level[i]);
        }
    }
    Deque<Node> queue = new ArrayDeque<>();
    queue.add(nodes[0]);
    int at = 1;
    while (!queue.isEmpty() && at < level.length) {
        Node parent = queue.remove();
        if (at < level.length) {
            parent.left = nodes[at++];
            if (parent.left != null) {
                queue.add(parent.left);
            }
        }
        if (at < level.length) {
            parent.right = nodes[at++];
            if (parent.right != null) {
                queue.add(parent.right);
            }
        }
    }
    connect(nodes[0]);
    for (Node start = nodes[0]; start != null;) {
        List<Integer> row = new ArrayList<>();
        Node nextHead = null;
        for (Node node = start; node != null; node = node.next) {
            row.add(node.val);
            if (nextHead == null) {
                nextHead = node.left != null ? node.left : node.right;
            }
        }
        result.add(row);
        start = nextHead;
    }
    return result;
}`,
  javascript: `

function connectLevels(level) {
  if (!level.length) {
    return [];
  }
  const nodes = level.map((value) => value === -101 ? null : new Node(value));
  const queue = [nodes[0]];
  let at = 1;
  for (let head = 0; head < queue.length && at < nodes.length; head++) {
    const parent = queue[head];
    if (at < nodes.length) {
      parent.left = nodes[at++];
      if (parent.left) {
        queue.push(parent.left);
      }
    }
    if (at < nodes.length) {
      parent.right = nodes[at++];
      if (parent.right) {
        queue.push(parent.right);
      }
    }
  }
  connect(nodes[0]);
  const result = [];
  for (let start = nodes[0]; start;) {
    const row = [];
    let nextHead = null;
    for (let node = start; node; node = node.next) {
      row.push(node.val);
      if (!nextHead) {
        nextHead = node.left || node.right;
      }
    }
    result.push(row);
    start = nextHead;
  }
  return result;
}`,
}

export const q0117: Solution = {
  id: 117,
  plain: '讓二元樹的每個節點指向同層右邊的下一個節點。樹可能缺孩子，因此不能假設每個父節點都有左右孩子。',
  statement: '給一般二元樹，每個節點有額外的 next 指標。將它指向同一層右側緊鄰的節點；若已是該層最後一個，設為 null。檢查包裝以 -101 表示層序輸入的空位。',
  examples: [
    { input: 'root = [1,2,3,4,5,null,7]', output: '[1,#,2,3,#,4,5,7,#]', note: '# 表示該層結尾。' },
    { input: 'root = []', output: '[]' },
  ],
  constraints: ['節點數最多 6000；節點值介於 −100 到 100。', '題目追問能否只用 O(1) 額外空間。'],
  insight: ['BFS 可明確分層，直接連接同層相鄰節點。', '如果上一層的 next 已連好，就可沿上一層橫向走訪，串起下一層；用虛擬頭節點處理第一個孩子。'],
  approaches: [
    {
      name: 'BFS 逐層連接',
      idea: '每次取出一整層；把前一個節點的 next 指向目前節點，孩子放進下一層佇列。',
      steps: ['根入佇列。', '每層先記下佇列目前長度。', '依序取出該層節點並連接前一個的 next。', '僅將存在的左右孩子入佇列。'],
      figure: { title: 'root = [1,2,3,4,5,null,7]', steps: [
        { note: '第一層只有根 1，它的 next 保持 null。', views: [view([], [0])] },
        { note: '第二層依序取出 2、3，連接 2 → 3。', views: [view([[1, 2]], [1, 2])] },
        { note: '第三層有 4、5、7；先連接 4 → 5。', views: [view([[1, 2], [3, 4]], [3, 4])] },
        { note: '再連接 5 → 7，跨過缺少的左孩子；7.next 為 null。', views: [view([[1, 2], [3, 4], [4, 6]], [4, 6])] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點進出佇列一次，最寬一層可能有 O(n) 個節點。' },
      verdict: '直觀且對不完整的二元樹也有效。',
      code: {
        python: `${NODE.python}from collections import deque

def connect(root):
    if not root:
        return root
    queue = deque([root])
    while queue:
        previous = None
        for _ in range(len(queue)):
            node = queue.popleft()
            if previous:
                previous.next = node  # 同層前一個接到目前節點
            previous = node
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return root${CHECK.python}`,
        c: `${NODE.c}struct Node *connect(struct Node *root) {
    if (!root) {
        return root;
    }
    struct Node **queue = malloc(6000 * sizeof(struct Node *));
    int head = 0;
    int tail = 0;
    queue[tail++] = root;
    while (head < tail) {
        int end = tail;
        struct Node *previous = NULL;
        while (head < end) {
            struct Node *node = queue[head++];
            if (previous) {
                previous->next = node;
            }
            previous = node;
            if (node->left) {
                queue[tail++] = node->left;
            }
            if (node->right) {
                queue[tail++] = node->right;
            }
        }
    }
    free(queue);
    return root;
}${CHECK.c}`,
        cpp: `${NODE.cpp}Node* connect(Node* root) {
    if (!root) {
        return root;
    }
    queue<Node*> todo;
    todo.push(root);
    while (!todo.empty()) {
        Node* previous = nullptr;
        int count = todo.size();
        for (int i = 0; i < count; i++) {
            Node* node = todo.front();
            todo.pop();
            if (previous) {
                previous->next = node;
            }
            previous = node;
            if (node->left) {
                todo.push(node->left);
            }
            if (node->right) {
                todo.push(node->right);
            }
        }
    }
    return root;
}${CHECK.cpp}`,
        java: `${NODE.java}Node connect(Node root) {
    if (root == null) {
        return root;
    }
    Deque<Node> queue = new ArrayDeque<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        Node previous = null;
        int count = queue.size();
        for (int i = 0; i < count; i++) {
            Node node = queue.remove();
            if (previous != null) {
                previous.next = node;
            }
            previous = node;
            if (node.left != null) {
                queue.add(node.left);
            }
            if (node.right != null) {
                queue.add(node.right);
            }
        }
    }
    return root;
}${CHECK.java}`,
        javascript: `${NODE.javascript}function connect(root) {
  if (!root) {
    return root;
  }
  const queue = [root];
  for (let head = 0; head < queue.length;) {
    const end = queue.length;
    let previous = null;
    while (head < end) {
      const node = queue[head++];
      if (previous) {
        previous.next = node;
      }
      previous = node;
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
  }
  return root;
}${CHECK.javascript}`,
      },
    },
    {
      name: '沿已連好的上一層，原地建立下一層',
      idea: '用虛擬頭與尾指標串接下一層所有實際存在的孩子，再移到下一層的第一個節點。',
      steps: ['從根所在層開始。', '對目前層建立 dummy 與 tail。', '沿目前層的 next 前進，把各節點存在的左、右孩子接到 tail 後面。', '移到 dummy.next，重複直到沒有下一層。'],
      figure: { title: 'root = [1,2,3,4,5,null,7]', steps: [
        { note: '從第一層的 1 看孩子；虛擬頭依序串起 2 → 3。', views: [view([[1, 2]], [1, 2])] },
        { note: '沿已連好的 2 → 3 走；2 提供孩子 4、5，先串起 4 → 5。', views: [view([[1, 2], [3, 4]], [3, 4])] },
        { note: '3 沒有左孩子，只把右孩子 7 接到尾端，成為 5 → 7。', views: [view([[1, 2], [3, 4], [4, 6]], [4, 6])] },
        { note: '下一層從 4 開始；4、5、7 都沒有孩子，結束。', views: [view([[1, 2], [3, 4], [4, 6]], [3, 4, 6])] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用虛擬頭和幾個指標；各節點沿 next 被掃過一次。' },
      verdict: '滿足常數額外空間追問；比 [116](#/q/116) 多處理缺少左右孩子的情況。',
      code: {
        python: `${NODE.python}def connect(root):
    level = root
    while level:
        dummy = Node(0)
        tail = dummy
        node = level
        while node:
            for child in (node.left, node.right):
                if child:
                    tail.next = child  # 下一層依遇到的順序串起來
                    tail = child
            node = node.next
        level = dummy.next
    return root${CHECK.python}`,
        c: `${NODE.c}struct Node *connect(struct Node *root) {
    struct Node *level = root;
    while (level) {
        struct Node dummy = {0};
        struct Node *tail = &dummy;
        for (struct Node *node = level; node; node = node->next) {
            if (node->left) {
                tail->next = node->left;
                tail = tail->next;
            }
            if (node->right) {
                tail->next = node->right;
                tail = tail->next;
            }
        }
        level = dummy.next;
    }
    return root;
}${CHECK.c}`,
        cpp: `${NODE.cpp}Node* connect(Node* root) {
    Node* level = root;
    while (level) {
        Node dummy(0);
        Node* tail = &dummy;
        for (Node* node = level; node; node = node->next) {
            if (node->left) {
                tail->next = node->left;
                tail = tail->next;
            }
            if (node->right) {
                tail->next = node->right;
                tail = tail->next;
            }
        }
        level = dummy.next;
    }
    return root;
}${CHECK.cpp}`,
        java: `${NODE.java}Node connect(Node root) {
    Node level = root;
    while (level != null) {
        Node dummy = new Node(0);
        Node tail = dummy;
        for (Node node = level; node != null; node = node.next) {
            if (node.left != null) {
                tail.next = node.left;
                tail = tail.next;
            }
            if (node.right != null) {
                tail.next = node.right;
                tail = tail.next;
            }
        }
        level = dummy.next;
    }
    return root;
}${CHECK.java}`,
        javascript: `${NODE.javascript}function connect(root) {
  let level = root;
  while (level) {
    const dummy = new Node(0);
    let tail = dummy;
    for (let node = level; node; node = node.next) {
      if (node.left) {
        tail.next = node.left;
        tail = tail.next;
      }
      if (node.right) {
        tail.next = node.right;
        tail = tail.next;
      }
    }
    level = dummy.next;
  }
  return root;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['不能套用完美二元樹的 cur.right.next = cur.next.left；一般樹可能缺少其中一個孩子。', '每層最後一個孩子的 next 應為 null；LeetCode 初始 next 為 null，虛擬頭串接不需額外補尾。', '檢查包裝的 -101 僅表示缺少節點，不是樹節點的值。'],
  check: { kind: 'fn', fn: 'connectLevels', cases: [
    { args: [L], out: [[1], [2, 3], [4, 5, 7]] },
    { args: [[]], out: [] },
    { args: [[5]], out: [[5]] },
    { args: [[1, -101, 2, 3]], out: [[1], [2], [3]] },
  ] },
}
