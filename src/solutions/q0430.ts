import { chain } from './fig'
import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 資料列是 [值, next 的索引, child 的索引]；-1 代表沒有。
const DATA = [[1, 1, 2], [2, -1, -1], [3, 3, -1], [4, -1, -1]]
const linked = (cls: Record<number, string> = {}) => chain([1, 2, 3, 4], {
  label: 'next 為水平箭頭；1 的 child 指向 3',
  edges: [[0, 1], [0, 2], [2, 3]],
  cls,
})
const recFig: FigStep[] = [
  { note: '主串列是 1→2，節點 1 還有 child：3→4。先記住 1 原本的下一個 2。', views: [linked({ 0: 'hl' })] },
  { note: '把 child 3 接在 1 後面，並清空 1.child；進入 3→4 找到這段的尾端 4。', views: [chain([1, 3, 4, 2], { label: '展開 child', cls: { 1: 'hl', 2: 'hl' } })] },
  { note: '把原先記住的 2 接在尾端 4 後面，同時讓 2.prev 指回 4。', views: [chain([1, 3, 4, 2], { label: '接回原本 next', cls: { 2: 'done', 3: 'hl' } })] },
  { note: '最後 next 順序為 1→3→4→2，所有 child 均為空，prev 與 next 對稱。', views: [chain([1, 3, 4, 2], { label: '完成', cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } }), arr([1, 3, 4, 2], { label: '輸出' })] },
]
const stackFig: FigStep[] = [
  { note: '把起點 1 放入堆疊。每次取出一個節點，接到扁平串列尾端。', views: [linked({ 0: 'hl' }), arr([1], { label: '堆疊' })] },
  { note: '取出 1；先推入原本的 next 2，再推入 child 3。後進先出，3 會先處理。', views: [arr([2, 3], { label: '堆疊（右端先取）', highlight: [1] }), arr([1], { label: '已接好' })] },
  { note: '取出 3，再推入它的 next 4；依序接上 3、4。', views: [arr([2, 4], { label: '堆疊（右端先取）' }), chain([1, 3, 4], { label: '已接好' })] },
  { note: '最後取出 2，接在 4 後面。每次接邊時一併設好 prev 並清掉 child。', views: [chain([1, 3, 4, 2], { label: '完成', cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } })] },
]

const C_NODE = `struct Node {
    int val;
    struct Node *prev;
    struct Node *next;
    struct Node *child;
};

`
const CPP_NODE = `class Node {
public:
    int val;
    Node *prev;
    Node *next;
    Node *child;
    Node(int value) : val(value), prev(nullptr), next(nullptr), child(nullptr) {}
};

`
const JAVA_NODE = `static class Node {
    int val;
    Node prev;
    Node next;
    Node child;
    Node(int value) {
        val = value;
    }
}

`
const WRAP = {
  python: `

class FlatNode:
    def __init__(self, value):
        self.val = value
        self.prev = None
        self.next = None
        self.child = None

def flattenCheck(data):
    if not data:
        return []
    nodes = [FlatNode(row[0]) for row in data]
    for i, (_, nxt, child) in enumerate(data):
        nodes[i].next = nodes[nxt] if nxt >= 0 else None
        nodes[i].child = nodes[child] if child >= 0 else None
        if nxt >= 0:
            nodes[nxt].prev = nodes[i]
        if child >= 0:
            nodes[child].prev = None
    cur = flatten(nodes[0])
    out = []
    prev = None
    while cur and len(out) <= len(nodes):
        if cur.prev is not prev or cur.child is not None:
            return [-999]
        out.append(cur.val)
        prev, cur = cur, cur.next
    return out if len(out) == len(nodes) else [-999]`,
  c: `

int *flattenCheck(int **data, int dataSize, int *dataColSize, int *returnSize) {
    *returnSize = 0;
    int *out = malloc((dataSize + 1) * sizeof(int));
    if (dataSize == 0) {
        return out;
    }
    struct Node **nodes = malloc(dataSize * sizeof(struct Node *));
    for (int i = 0; i < dataSize; i++) {
        nodes[i] = calloc(1, sizeof(struct Node));
        nodes[i]->val = data[i][0];
    }
    for (int i = 0; i < dataSize; i++) {
        int next = data[i][1];
        int child = data[i][2];
        if (next >= 0) {
            nodes[i]->next = nodes[next];
            nodes[next]->prev = nodes[i];
        }
        if (child >= 0) {
            nodes[i]->child = nodes[child];
        }
    }
    struct Node *cur = flatten(nodes[0]);
    struct Node *prev = NULL;
    while (cur && *returnSize <= dataSize) {
        if (cur->prev != prev || cur->child != NULL) {
            out[0] = -999;
            *returnSize = 1;
            return out;
        }
        out[(*returnSize)++] = cur->val;
        prev = cur;
        cur = cur->next;
    }
    if (*returnSize != dataSize) {
        out[0] = -999;
        *returnSize = 1;
    }
    free(nodes);
    return out;
}`,
  cpp: `

vector<int> flattenCheck(vector<vector<int>> data) {
    if (data.empty()) {
        return {};
    }
    vector<Node*> nodes;
    for (const auto& row : data) {
        nodes.push_back(new Node(row[0]));
    }
    for (int i = 0; i < (int)data.size(); i++) {
        int next = data[i][1];
        int child = data[i][2];
        if (next >= 0) {
            nodes[i]->next = nodes[next];
            nodes[next]->prev = nodes[i];
        }
        if (child >= 0) {
            nodes[i]->child = nodes[child];
        }
    }
    vector<int> out;
    Node* prev = nullptr;
    for (Node* cur = flatten(nodes[0]); cur && out.size() <= nodes.size(); cur = cur->next) {
        if (cur->prev != prev || cur->child) {
            return {-999};
        }
        out.push_back(cur->val);
        prev = cur;
    }
    return out.size() == nodes.size() ? out : vector<int>{-999};
}`,
  java: `

int[] flattenCheck(int[][] data) {
    if (data.length == 0) {
        return new int[0];
    }
    Node[] nodes = new Node[data.length];
    for (int i = 0; i < data.length; i++) {
        nodes[i] = new Node(data[i][0]);
    }
    for (int i = 0; i < data.length; i++) {
        int next = data[i][1];
        int child = data[i][2];
        if (next >= 0) {
            nodes[i].next = nodes[next];
            nodes[next].prev = nodes[i];
        }
        if (child >= 0) {
            nodes[i].child = nodes[child];
        }
    }
    List<Integer> out = new ArrayList<>();
    Node previous = null;
    Node current = flatten(nodes[0]);
    while (current != null && out.size() <= data.length) {
        if (current.prev != previous || current.child != null) {
            return new int[]{-999};
        }
        out.add(current.val);
        previous = current;
        current = current.next;
    }
    if (out.size() != data.length) {
        return new int[]{-999};
    }
    int[] answer = new int[out.size()];
    for (int i = 0; i < out.size(); i++) {
        answer[i] = out.get(i);
    }
    return answer;
}`,
  javascript: `

function flattenCheck(data) {
  if (data.length === 0) {
    return [];
  }
  const nodes = data.map(([val]) => ({ val, prev: null, next: null, child: null }));
  data.forEach(([, next, child], i) => {
    if (next >= 0) {
      nodes[i].next = nodes[next];
      nodes[next].prev = nodes[i];
    }
    if (child >= 0) {
      nodes[i].child = nodes[child];
    }
  });
  const out = [];
  let previous = null;
  let current = flatten(nodes[0]);
  while (current && out.length <= nodes.length) {
    if (current.prev !== previous || current.child !== null) {
      return [-999];
    }
    out.push(current.val);
    previous = current;
    current = current.next;
  }
  return out.length === nodes.length ? out : [-999];
}`,
}

export const q0430: Solution = {
  id: 430,
  plain: '雙向鏈結串列的某些節點還有子串列；把子串列插在該節點後面，展平成單一串列。',
  statement: '每個 Node 有 val、prev、next、child。依深度優先順序，把每條 child 鏈接進主串列，並清空所有 child；回傳展平後的頭節點。',
  examples: [
    { input: '主串列 1→2，1.child = 3→4', output: '1→3→4→2' },
    { input: 'head = null', output: 'null' },
  ],
  constraints: ['節點數最多 1000', '每個節點值介於 1 到 10⁵'],
  insight: ['插入 child 前先保存原本的 next，否則會失去後半段。', '遞迴展平 child 後，需要知道它的尾節點，才能接回原本的 next。', '堆疊法先放 next、再放 child，讓 child 優先被取出。'],
  approaches: [
    {
      name: '遞迴展平並回傳尾節點',
      idea: '遇到 child 就先接入 child 串列，遞迴找其尾端，再把原本的 next 接回。',
      steps: ['從目前節點往 next 走', '若有 child，先保存原本 next，改接 child 並清空 child', '遞迴展平 child，取得尾節點', '將尾節點與保存的 next 接回，繼續處理'],
      figure: { title: '主串列 1→2，1.child = 3→4', steps: recFig },
      complexity: { time: 'O(n)', space: 'O(d)', why: '每節點處理一次；d 為 child 巢狀深度。' },
      verdict: '連接順序清楚，適合練習 [[p:linked-list]] 指標操作。',
      code: {
        python: `def flatten(head):
    def visit(node):
        tail = None
        while node:
            following = node.next        # 先留住原本後繼
            if node.child:
                child = node.child
                child_tail = visit(child)
                node.next = child
                child.prev = node
                node.child = None
                child_tail.next = following
                if following:
                    following.prev = child_tail
                tail = child_tail
            else:
                tail = node
            node = following
        return tail

    if head:
        visit(head)
    return head${WRAP.python}`,
        c: `${C_NODE}static struct Node *visit(struct Node *node) {
    struct Node *tail = NULL;
    while (node) {
        struct Node *following = node->next;
        if (node->child) {
            struct Node *child = node->child;
            struct Node *childTail = visit(child);
            node->next = child;
            child->prev = node;
            node->child = NULL;
            childTail->next = following;
            if (following) {
                following->prev = childTail;
            }
            tail = childTail;
        } else {
            tail = node;
        }
        node = following;
    }
    return tail;
}

struct Node *flatten(struct Node *head) {
    if (head) {
        visit(head);
    }
    return head;
}${WRAP.c}`,
        cpp: `${CPP_NODE}Node* visit(Node* node) {
    Node* tail = nullptr;
    while (node) {
        Node* following = node->next;
        if (node->child) {
            Node* child = node->child;
            Node* childTail = visit(child);
            node->next = child;
            child->prev = node;
            node->child = nullptr;
            childTail->next = following;
            if (following) {
                following->prev = childTail;
            }
            tail = childTail;
        } else {
            tail = node;
        }
        node = following;
    }
    return tail;
}

Node* flatten(Node* head) {
    if (head) {
        visit(head);
    }
    return head;
}${WRAP.cpp}`,
        java: `${JAVA_NODE}Node visit(Node node) {
    Node tail = null;
    while (node != null) {
        Node following = node.next;
        if (node.child != null) {
            Node child = node.child;
            Node childTail = visit(child);
            node.next = child;
            child.prev = node;
            node.child = null;
            childTail.next = following;
            if (following != null) {
                following.prev = childTail;
            }
            tail = childTail;
        } else {
            tail = node;
        }
        node = following;
    }
    return tail;
}

Node flatten(Node head) {
    if (head != null) {
        visit(head);
    }
    return head;
}${WRAP.java}`,
        javascript: `function flatten(head) {
  function visit(node) {
    let tail = null;
    while (node) {
      const following = node.next;
      if (node.child) {
        const child = node.child;
        const childTail = visit(child);
        node.next = child;
        child.prev = node;
        node.child = null;
        childTail.next = following;
        if (following) {
          following.prev = childTail;
        }
        tail = childTail;
      } else {
        tail = node;
      }
      node = following;
    }
    return tail;
  }
  if (head) {
    visit(head);
  }
  return head;
}${WRAP.javascript}`,
      },
    },
    {
      name: '堆疊控制深度優先順序',
      idea: '取出節點時接到結果尾端；先把 next 推入堆疊，再把 child 推入，child 便優先處理。',
      steps: ['若 head 為空，直接回傳', '把 head 推入堆疊，prev 設為空', '每次彈出節點，接在 prev 後面並設定 prev', '先推 next 再推 child，清空 child；最後清空尾節點 next'],
      figure: { title: '主串列 1→2，1.child = 3→4', steps: stackFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每節點入棧與出棧各一次。' },
      verdict: '迭代版容易看清「先保存 next，再處理 child」的次序。',
      code: {
        python: `def flatten(head):
    if not head:
        return None
    stack = [head]
    previous = None
    while stack:
        node = stack.pop()
        if previous:
            previous.next = node
            node.prev = previous
        if node.next:
            stack.append(node.next)      # 晚一點處理原本 next
        if node.child:
            stack.append(node.child)     # child 先彈出
            node.child = None
        previous = node
    previous.next = None
    return head${WRAP.python}`,
        c: `${C_NODE}struct Node *flatten(struct Node *head) {
    if (!head) {
        return NULL;
    }
    struct Node *stack[1000];
    int top = 0;
    stack[top++] = head;
    struct Node *previous = NULL;
    while (top > 0) {
        struct Node *node = stack[--top];
        if (previous) {
            previous->next = node;
            node->prev = previous;
        }
        if (node->next) {
            stack[top++] = node->next;
        }
        if (node->child) {
            stack[top++] = node->child;
            node->child = NULL;
        }
        previous = node;
    }
    previous->next = NULL;
    return head;
}${WRAP.c}`,
        cpp: `${CPP_NODE}Node* flatten(Node* head) {
    if (!head) {
        return nullptr;
    }
    stack<Node*> pending;
    pending.push(head);
    Node* previous = nullptr;
    while (!pending.empty()) {
        Node* node = pending.top();
        pending.pop();
        if (previous) {
            previous->next = node;
            node->prev = previous;
        }
        if (node->next) {
            pending.push(node->next);
        }
        if (node->child) {
            pending.push(node->child);
            node->child = nullptr;
        }
        previous = node;
    }
    previous->next = nullptr;
    return head;
}${WRAP.cpp}`,
        java: `${JAVA_NODE}Node flatten(Node head) {
    if (head == null) {
        return null;
    }
    Deque<Node> stack = new ArrayDeque<>();
    stack.push(head);
    Node previous = null;
    while (!stack.isEmpty()) {
        Node node = stack.pop();
        if (previous != null) {
            previous.next = node;
            node.prev = previous;
        }
        if (node.next != null) {
            stack.push(node.next);
        }
        if (node.child != null) {
            stack.push(node.child);
            node.child = null;
        }
        previous = node;
    }
    previous.next = null;
    return head;
}${WRAP.java}`,
        javascript: `function flatten(head) {
  if (!head) {
    return null;
  }
  const stack = [head];
  let previous = null;
  while (stack.length) {
    const node = stack.pop();
    if (previous) {
      previous.next = node;
      node.prev = previous;
    }
    if (node.next) {
      stack.push(node.next);
    }
    if (node.child) {
      stack.push(node.child);
      node.child = null;
    }
    previous = node;
  }
  previous.next = null;
  return head;
}${WRAP.javascript}`,
      },
    },
  ],
  pitfalls: ['處理 child 前要先保存 next，否則原本的後半段會遺失。', '每次改接 next 時，也要同步修正目標節點的 prev。', '所有 child 最終都必須清空。'],
  check: { kind: 'fn', fn: 'flattenCheck', cases: [
    { args: [DATA], out: [1, 3, 4, 2] },
    { args: [[]], out: [] },
    { args: [[[1, 1, -1], [2, -1, -1]]], out: [1, 2] },
    { args: [[[1, 1, 2], [2, -1, -1], [3, -1, 3], [4, -1, -1]]], out: [1, 3, 4, 2] },
  ] },
}
