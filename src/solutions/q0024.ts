import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 24. Swap Nodes in Pairs

const L = [1, 2, 3, 4]

function iterFig(): FigStep[] {
  return [
    { note: '兩兩一組交換「節點」(不是只換值)。加一個假頭 d,prev 指著「這一組的前一個節點」', views: [chain(['d', ...L], { cls: { 0: 'cur' }, subs: { 0: 'prev', 1: 'a', 2: 'b' } })] },
    { note: '這一組 a = 1、b = 2:改三條指標 —— prev.next = b、a.next = b.next(3)、b.next = a', views: [chain(['d', 2, 1, 3, 4], { cls: { 1: 'hl', 2: 'hl' } })] },
    { note: 'prev 移到 a(現在在這組的後面),處理下一組 3、4 → d → 2 → 1 → 4 → 3', views: [chain(['d', 2, 1, 4, 3], { cls: { 2: 'cur', 3: 'hl', 4: 'hl' }, subs: { 2: 'prev' } })] },
    { note: '剩不到兩個就停。回傳 d.next', views: [chain([2, 1, 4, 3], { tail: true })] },
  ]
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴:swap(head) = 前兩個交換,再接上 swap(第三個以後)', views: [chain(L, { cls: { 0: 'hl', 1: 'hl' } }), chain([4, 3], { label: 'swap([3, 4]) 的結果' })] },
    { note: 'second = head.next;head.next = swap(second.next);second.next = head;回傳 second', views: [chain([2, 1, 4, 3], { cls: { 0: 'done', 1: 'done' } })] },
  ]
}

export const q0024: Solution = {
  id: 24,
  plain: '把串列裡的節點兩個兩個一組對調:第 1、2 個交換,第 3、4 個交換……最後剩一個就不動。只能改指標,不能改節點裡的值。',
  statement: '給串列的頭 `head`,兩兩交換相鄰的節點並回傳新的頭。必須交換**節點本身**,不能只修改節點的值。',
  examples: [
    { input: 'head = [1,2,3,4]', output: '[2,1,4,3]' },
    { input: 'head = []', output: '[]' },
    { input: 'head = [1,2,3]', output: '[2,1,3]' },
  ],
  constraints: ['節點數 ≤ 100'],
  insight: ['每組要改三條指標:前一個 → b、a → b 的下一個、b → a', '開頭那組沒有「前一個」→ 假頭', '也可以遞迴:交換前兩個,剩下的交給遞迴'],
  approaches: [
    {
      name: '假頭 + 迭代',
      idea: '`prev = d`;`while prev.next and prev.next.next`:a、b 交換,prev 移到 a。',
      steps: ['`d = ListNode(0, head)`、`prev = d`', '`a = prev.next`、`b = a.next`', '`prev.next = b`、`a.next = b.next`、`b.next = a`', '`prev = a`;回傳 `d.next`'],
      figure: { title: `head = [${L}]`, steps: iterFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每組常數次操作。' },
      verdict: '最推薦。三條指標的改法要記熟,[25. Reverse Nodes in k-Group](#/q/25) 是它的一般化。',
      code: {
        python: `def swapPairs(head):
    d = ListNode(0, head)
    prev = d
    while prev.next and prev.next.next:
        a, b = prev.next, prev.next.next
        prev.next = b                         # 前一個接到 b
        a.next = b.next                       # a 接到下一組
        b.next = a                            # b 指回 a
        prev = a                              # a 現在是這組的尾巴
    return d.next`,
        c: `struct ListNode *swapPairs(struct ListNode *head) {
    struct ListNode d = {0, head}, *prev = &d;
    while (prev->next && prev->next->next) {
        struct ListNode *a = prev->next, *b = a->next;
        prev->next = b;
        a->next = b->next;
        b->next = a;
        prev = a;
    }
    return d.next;
}`,
        cpp: `ListNode* swapPairs(ListNode* head) {
    ListNode d(0, head), *prev = &d;
    while (prev->next && prev->next->next) {
        ListNode *a = prev->next, *b = a->next;
        prev->next = b;
        a->next = b->next;
        b->next = a;
        prev = a;
    }
    return d.next;
}`,
        java: `ListNode swapPairs(ListNode head) {
    ListNode d = new ListNode(0, head), prev = d;
    while (prev.next != null && prev.next.next != null) {
        ListNode a = prev.next, b = a.next;
        prev.next = b;
        a.next = b.next;
        b.next = a;
        prev = a;
    }
    return d.next;
}`,
        javascript: `function swapPairs(head) {
  const d = new ListNode(0, head);
  let prev = d;
  while (prev.next && prev.next.next) {
    const a = prev.next, b = a.next;
    prev.next = b;
    a.next = b.next;
    b.next = a;
    prev = a;
  }
  return d.next;
}`,
      },
    },
    {
      name: '遞迴',
      idea: '`second = head.next`;`head.next = swapPairs(second.next)`;`second.next = head`;回傳 second。',
      steps: ['不到兩個節點 → 回傳 head', '`second = head.next`', '`head.next = swapPairs(second.next)`、`second.next = head`', '回傳 second'],
      figure: { title: `head = [${L}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '遞迴深度 n / 2。' },
      verdict: '三行就寫完,把「後面的交給遞迴」的思維練熟。',
      code: {
        python: `def swapPairs(head):
    if not head or not head.next:
        return head
    second = head.next
    head.next = swapPairs(second.next)        # 第三個以後先處理好
    second.next = head
    return second`,
        c: `struct ListNode *swapPairs(struct ListNode *head) {
    if (!head || !head->next) return head;
    struct ListNode *second = head->next;
    head->next = swapPairs(second->next);
    second->next = head;
    return second;
}`,
        cpp: `ListNode* swapPairs(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode *second = head->next;
    head->next = swapPairs(second->next);
    second->next = head;
    return second;
}`,
        java: `ListNode swapPairs(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode second = head.next;
    head.next = swapPairs(second.next);
    second.next = head;
    return second;
}`,
        javascript: `function swapPairs(head) {
  if (!head || !head.next) return head;
  const second = head.next;
  head.next = swapPairs(second.next);
  second.next = head;
  return second;
}`,
      },
    },
  ],
  pitfalls: ['改指標的順序錯了:先 `b.next = a` 再 `a.next = b.next` 就把 a 接回自己,形成環', '交換後 prev 移到 b:應該移到 a(交換後 a 在後面)'],
  check: {
    kind: 'fn',
    fn: 'swapPairs',
    argKinds: ['list'],
    ret: 'list',
    cases: [
      { args: [L], out: [2, 1, 4, 3] },
      { args: [[]], out: [] },
      { args: [[1]], out: [1] },
      { args: [[1, 2, 3]], out: [2, 1, 3] },
      { args: [[1, 2, 3, 4, 5, 6]], out: [2, 1, 4, 3, 6, 5] },
    ],
  },
}
