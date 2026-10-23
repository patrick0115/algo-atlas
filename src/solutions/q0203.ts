import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 203. Remove Linked List Elements

const L = [6, 1, 2, 6, 3, 6]
const V = 6

function dummyFig(): FigStep[] {
  return [
    { note: `要刪掉所有值為 ${V} 的節點,而開頭的 ${V} 也要刪。在最前面加一個假頭 d,這樣「刪開頭」和「刪中間」就是同一件事`, views: [chain(['d', ...L], { cls: { 0: 'dim' } })] },
    { note: `prev 從假頭開始:看 prev.next,值是 ${V} 就跳過(prev.next = prev.next.next),否則 prev 往前走`, views: [chain(['d', ...L], { cls: { 0: 'cur', 1: 'hl' }, subs: { 0: 'prev' } })] },
    { note: '開頭的 6 被跳過,接著 1、2 保留;中間的 6 跳過;3 保留;最後的 6 跳過', views: [chain(['d', 1, 2, 3], { cls: { 0: 'dim', 1: 'done', 2: 'done', 3: 'done' }, tail: true })] },
    { note: '回傳 d.next → 1 → 2 → 3', views: [chain([1, 2, 3], { tail: true })] },
  ]
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴:先處理 head.next 之後的部分,再決定 head 要不要留', views: [chain(L, { cls: { 0: 'hl' } }), chain([1, 2, 3], { label: 'removeElements(head.next) 的結果' })] },
    { note: `head 的值是 ${V} → 不要它,直接回傳處理好的後半段;否則把它接在前面`, views: [chain([1, 2, 3], { cls: { 0: 'done', 1: 'done', 2: 'done' } })] },
  ]
}

export const q0203: Solution = {
  id: 203,
  plain: '把一條串列裡所有值等於 val 的節點都拿掉,包括開頭的那些。',
  statement: '給串列的頭 `head` 和整數 `val`,刪除所有 `Node.val == val` 的節點,回傳新的頭。',
  examples: [
    { input: 'head = [1,2,6,3,4,5,6], val = 6', output: '[1,2,3,4,5]' },
    { input: 'head = [], val = 1', output: '[]' },
    { input: 'head = [7,7,7,7], val = 7', output: '[]' },
  ],
  constraints: ['節點數 ≤ 10⁴'],
  insight: ['刪除節點 = 讓前一個節點跳過它', '開頭的節點沒有「前一個」→ 加一個假頭(dummy),統一處理', '或用遞迴:每層決定自己要不要留下'],
  approaches: [
    {
      name: '假頭 + 前一個指標',
      idea: '`d.next = head`、`prev = d`;`prev.next.val == val` 就跳過,否則 prev 前進;回傳 `d.next`。',
      steps: ['`d = ListNode(0, head)`、`prev = d`', '`while prev.next`:', '`prev.next.val == val` → `prev.next = prev.next.next`', '否則 `prev = prev.next`', '回傳 `d.next`'],
      figure: { title: `head = [${L}],val = ${V}`, steps: dummyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個節點看一次。' },
      verdict: '最推薦。假頭是串列題的萬用技巧,「頭可能被刪」時一定要想到。',
      code: {
        python: `def removeElements(head, val):
    d = ListNode(0, head)                     # 假頭:讓開頭的節點也有「前一個」
    prev = d
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next        # 跳過;prev 不動,下一個也可能要刪
        else:
            prev = prev.next
    return d.next`,
        c: `struct ListNode *removeElements(struct ListNode *head, int val) {
    struct ListNode d = {0, head}, *prev = &d;
    while (prev->next) {
        if (prev->next->val == val) {
            struct ListNode *x = prev->next;
            prev->next = x->next;
            free(x);
        } else prev = prev->next;
    }
    return d.next;
}`,
        cpp: `ListNode* removeElements(ListNode* head, int val) {
    ListNode d(0, head), *prev = &d;
    while (prev->next) {
        if (prev->next->val == val) prev->next = prev->next->next;
        else prev = prev->next;
    }
    return d.next;
}`,
        java: `ListNode removeElements(ListNode head, int val) {
    ListNode d = new ListNode(0, head), prev = d;
    while (prev.next != null) {
        if (prev.next.val == val) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return d.next;
}`,
        javascript: `function removeElements(head, val) {
  const d = new ListNode(0, head);
  let prev = d;
  while (prev.next) {
    if (prev.next.val === val) prev.next = prev.next.next;
    else prev = prev.next;
  }
  return d.next;
}`,
      },
    },
    {
      name: '遞迴',
      idea: '`head.next = removeElements(head.next, val)`;`head.val == val` 回傳 `head.next`,否則回傳 head。',
      steps: ['空串列 → 回傳 null', '`head.next = removeElements(head.next, val)`', '回傳 `head.next if head.val == val else head`'],
      figure: { title: `head = [${L}],val = ${V}`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '遞迴深度 = 串列長度。' },
      verdict: '不需要假頭,寫起來很短;n 很大時要注意堆疊深度。',
      code: {
        python: `def removeElements(head, val):
    if not head:
        return None
    head.next = removeElements(head.next, val)
    return head.next if head.val == val else head`,
        c: `struct ListNode *removeElements(struct ListNode *head, int val) {
    if (!head) return NULL;
    head->next = removeElements(head->next, val);
    return head->val == val ? head->next : head;
}`,
        cpp: `ListNode* removeElements(ListNode* head, int val) {
    if (!head) return nullptr;
    head->next = removeElements(head->next, val);
    return head->val == val ? head->next : head;
}`,
        java: `ListNode removeElements(ListNode head, int val) {
    if (head == null) return null;
    head.next = removeElements(head.next, val);
    return head.val == val ? head.next : head;
}`,
        javascript: `function removeElements(head, val) {
  if (!head) return null;
  head.next = removeElements(head.next, val);
  return head.val === val ? head.next : head;
}`,
      },
    },
  ],
  pitfalls: ['沒有假頭時,要先用 while 把開頭的 val 全部刪掉,再處理中間,容易寫錯', '刪除後 prev 也往前走:連續兩個要刪的會漏掉一個'],
  check: {
    kind: 'fn',
    fn: 'removeElements',
    argKinds: ['list', null],
    ret: 'list',
    cases: [
      { args: [[1, 2, 6, 3, 4, 5, 6], 6], out: [1, 2, 3, 4, 5] },
      { args: [[], 1], out: [] },
      { args: [[7, 7, 7, 7], 7], out: [] },
      { args: [L, V], out: [1, 2, 3] },
    ],
  },
}
