import { chain } from './fig'
import type { FigStep, Solution } from './types'

const V = [4, 5, 1, 9]
const copyFig: FigStep[] = [
  { note: '只拿到值為 5 的節點，拿不到它的前一個節點 4；因此無法直接讓 4.next 跳過 5。', views: [chain(V, { label: '只拿到 5', cls: { 1: 'hl' } })] },
  { note: '5 的下一個節點是 1；把 1 的值複製到目前節點，表面上原本的 5 就消失了。', views: [chain([4, 1, 1, 9], { label: '複製下一個值', cls: { 1: 'hl', 2: 'dim' } })] },
  { note: '再把目前節點的 next 指向 1.next，也就是 9，跳過原本值為 1 的節點。', views: [chain([4, 1, 9], { label: '跳過下一個節點', cls: { 1: 'hl' } })] },
  { note: '結果為 [4,1,9]；節點身分仍是原本的 5，但它的值已變成 1。', views: [chain([4, 1, 9], { label: '完成' })] },
]
const shiftFig: FigStep[] = [
  { note: '從給定節點 5 起，逐一把後一個節點的值往前複製。', views: [chain(V, { label: '原串列', cls: { 1: 'hl' } })] },
  { note: '先把 1 複製到 5 的位置；再把 9 複製到原本 1 的位置。', views: [chain([4, 1, 9, 9], { label: '向前搬值', cls: { 1: 'done', 2: 'done', 3: 'dim' } })] },
  { note: '現在最後兩節點值都是 9，讓倒數第二個 next 指向空，移除尾端。', views: [chain([4, 1, 9], { label: '移除尾端' })] },
  { note: '最後結果同樣是 [4,1,9]，但這種做法會一路搬動後綴的值。', views: [chain([4, 1, 9], { label: '完成' })] },
]
const WRAP = {
  python: `

class CheckNode:
    def __init__(self, val):
        self.val = val
        self.next = None

def deleteNodeCheck(values, at):
    nodes = [CheckNode(x) for x in values]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    deleteNode(nodes[at])
    out = []
    cur = nodes[0]
    while cur:
        out.append(cur.val)
        cur = cur.next
    return out`,
  c: `

int *deleteNodeCheck(int *values, int valuesSize, int at, int *returnSize) {
    struct ListNode **nodes = malloc(valuesSize * sizeof(struct ListNode *));
    for (int i = 0; i < valuesSize; i++) {
        nodes[i] = malloc(sizeof(struct ListNode));
        nodes[i]->val = values[i];
        nodes[i]->next = NULL;
        if (i > 0) {
            nodes[i - 1]->next = nodes[i];
        }
    }
    deleteNode(nodes[at]);
    int *out = malloc(valuesSize * sizeof(int));
    *returnSize = 0;
    for (struct ListNode *cur = nodes[0]; cur; cur = cur->next) {
        out[(*returnSize)++] = cur->val;
    }
    free(nodes);
    return out;
}`,
  cpp: `

vector<int> deleteNodeCheck(vector<int> values, int at) {
    vector<ListNode*> nodes;
    for (int x : values) {
        nodes.push_back(new ListNode(x));
    }
    for (int i = 1; i < (int)nodes.size(); i++) {
        nodes[i - 1]->next = nodes[i];
    }
    deleteNode(nodes[at]);
    vector<int> out;
    for (ListNode* cur = nodes[0]; cur; cur = cur->next) {
        out.push_back(cur->val);
    }
    return out;
}`,
  java: `

int[] deleteNodeCheck(int[] values, int at) {
    ListNode[] nodes = new ListNode[values.length];
    for (int i = 0; i < values.length; i++) {
        nodes[i] = new ListNode(values[i]);
        if (i > 0) {
            nodes[i - 1].next = nodes[i];
        }
    }
    deleteNode(nodes[at]);
    int[] out = new int[values.length - 1];
    ListNode cur = nodes[0];
    for (int i = 0; i < out.length; i++) {
        out[i] = cur.val;
        cur = cur.next;
    }
    return out;
}`,
  javascript: `

function deleteNodeCheck(values, at) {
  const nodes = values.map((val) => ({ val, next: null }));
  for (let i = 1; i < nodes.length; i++) {
    nodes[i - 1].next = nodes[i];
  }
  deleteNode(nodes[at]);
  const out = [];
  for (let cur = nodes[0]; cur; cur = cur.next) {
    out.push(cur.val);
  }
  return out;
}`,
}

export const q0237: Solution = {
  id: 237,
  plain: '只能拿到要刪除的節點，拿不到頭節點；如何讓它從串列消失？',
  statement: '給定單向鏈結串列中的非尾端節點 node，直接修改串列，讓 node 原本的值不再出現在原位置；不提供 head。',
  examples: [
    { input: 'head = [4,5,1,9], node = 值為 5 的節點', output: '[4,1,9]' },
    { input: 'head = [4,5,1,9], node = 值為 1 的節點', output: '[4,5,9]' },
  ],
  constraints: ['2 ≤ 節點數 ≤ 1000', 'node 不是尾節點', '節點值互不相同'],
  insight: ['一般刪節點要修改前驅的 next，但題目拿不到前驅。', '已知 node 非尾端，可以利用下一個節點：複製其值，再跳過它。', '更慢的做法是一路把後面節點的值往前搬。'],
  approaches: [
    {
      name: '複製下一個值並跳過下一個節點',
      idea: '把 node.next.val 複製到 node.val，再令 node.next = node.next.next。',
      steps: ['讀取下一個節點 next', '把 next.val 複製到 node.val', '把 node.next 改為 next.next', '原本 node 的值因此消失'],
      figure: { title: 'head = [4,5,1,9]，node 指向 5', steps: copyFig },
      complexity: { time: 'O(1)', space: 'O(1)', why: '只改兩個欄位。' },
      verdict: '這題的關鍵技巧，屬於 [[p:linked-list]] 的特殊刪除。',
      code: {
        python: `def deleteNode(node):
    node.val = node.next.val            # 讓目前節點冒充下一個
    node.next = node.next.next          # 再跳過下一個節點${WRAP.python}`,
        c: `void deleteNode(struct ListNode *node) {
    node->val = node->next->val;
    node->next = node->next->next;
}${WRAP.c}`,
        cpp: `void deleteNode(ListNode* node) {
    node->val = node->next->val;
    node->next = node->next->next;
}${WRAP.cpp}`,
        java: `void deleteNode(ListNode node) {
    node.val = node.next.val;
    node.next = node.next.next;
}${WRAP.java}`,
        javascript: `function deleteNode(node) {
  node.val = node.next.val;
  node.next = node.next.next;
}${WRAP.javascript}`,
      },
    },
    {
      name: '逐節點向前搬值',
      idea: '把每個後繼的值往前移一格，最後斷開尾節點。',
      steps: ['從 node 開始', '若下一個節點不是尾端，複製下一個值並前進', '到倒數第二節點時複製尾端值', '令倒數第二節點的 next 為空'],
      figure: { title: 'head = [4,5,1,9]，node 指向 5', steps: shiftFig },
      complexity: { time: 'O(後綴長度)', space: 'O(1)', why: '逐一搬動 node 後方的值。' },
      verdict: '也正確，但修改更多節點；能幫助看出常數時間解法省下了哪些搬動。',
      code: {
        python: `def deleteNode(node):
    while node.next.next:
        node.val = node.next.val        # 後繼值往前搬
        node = node.next
    node.val = node.next.val
    node.next = None                    # 刪掉尾端${WRAP.python}`,
        c: `void deleteNode(struct ListNode *node) {
    while (node->next->next) {
        node->val = node->next->val;
        node = node->next;
    }
    node->val = node->next->val;
    node->next = NULL;
}${WRAP.c}`,
        cpp: `void deleteNode(ListNode* node) {
    while (node->next->next) {
        node->val = node->next->val;
        node = node->next;
    }
    node->val = node->next->val;
    node->next = nullptr;
}${WRAP.cpp}`,
        java: `void deleteNode(ListNode node) {
    while (node.next.next != null) {
        node.val = node.next.val;
        node = node.next;
    }
    node.val = node.next.val;
    node.next = null;
}${WRAP.java}`,
        javascript: `function deleteNode(node) {
  while (node.next.next) {
    node.val = node.next.val;
    node = node.next;
  }
  node.val = node.next.val;
  node.next = null;
}${WRAP.javascript}`,
      },
    },
  ],
  pitfalls: ['這個技巧要求 node 不是尾節點。', '刪掉的是指定位置原本的值；指定節點物件仍留在串列中。', '檢查函式從頭重建串列，確認原地修改後的完整順序。'],
  check: { kind: 'fn', fn: 'deleteNodeCheck', cases: [
    { args: [V, 1], out: [4, 1, 9] },
    { args: [V, 2], out: [4, 5, 9] },
    { args: [[1, 2], 0], out: [2] },
  ] },
}
