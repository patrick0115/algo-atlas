import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 83. Remove Duplicates from Sorted List

const L = [1, 1, 2, 3, 3]

function iterFig(): FigStep[] {
  return [
    { note: '串列已排序 → 一樣的值一定挨在一起。cur 從頭走:如果下一個節點的值和自己一樣,就把它「跳過」(cur.next = cur.next.next)', views: [chain(L, { cls: { 0: 'cur' }, subs: { 0: 'cur' } })] },
    { note: 'cur = 1,下一個也是 1 → 跳過它。cur 不動(可能還有第三個 1)', views: [chain(L, { cls: { 0: 'cur', 1: 'dim' }, subs: { 0: 'cur' }, edges: [[0, 2], [2, 3], [3, 4]] })] },
    { note: '下一個是 2,不一樣 → cur 往前走到 2;再到 3;3 的下一個也是 3 → 跳過', views: [chain([1, 2, 3, 3], { cls: { 2: 'cur', 3: 'dim' }, subs: { 2: 'cur' }, edges: [[0, 1], [1, 2]] })] },
    { note: '結果 1 → 2 → 3', views: [chain([1, 2, 3], { cls: { 0: 'done', 1: 'done', 2: 'done' }, tail: true })] },
  ]
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴:先把 head.next 之後的部分去重,再看 head 和處理好的下一個是不是一樣', views: [chain(L, { cls: { 0: 'hl' } }), chain([1, 2, 3], { label: 'deleteDuplicates(head.next) 的結果' })] },
    { note: 'head(1)和下一個(1)一樣 → 回傳下一個(丟掉 head);不一樣就把 head 接在前面', views: [chain([1, 2, 3], { cls: { 0: 'done' } })] },
  ]
}

export const q0083: Solution = {
  id: 83,
  plain: '一條排好序的串列,有些值重複出現。把重複的刪掉,讓每個值只留一個。',
  statement: '給已排序串列的頭 `head`,刪除所有重複元素使每個元素只出現一次,回傳排序後的串列。',
  examples: [
    { input: 'head = [1,1,2]', output: '[1,2]' },
    { input: 'head = [1,1,2,3,3]', output: '[1,2,3]' },
  ],
  constraints: ['節點數 ≤ 300', '已排序'],
  insight: ['已排序 → 重複的值相鄰', '只要比較 cur 和 cur.next:一樣就把 cur.next 跳過,不一樣才往前走', '和 [26](#/q/26) 是同一題的串列版'],
  approaches: [
    {
      name: '一個指標,跳過相同的',
      idea: '`cur = head`;`cur.next.val == cur.val` → `cur.next = cur.next.next`,否則 `cur = cur.next`。',
      steps: ['`cur = head`', '`while cur and cur.next`:', '值一樣 → `cur.next = cur.next.next`(cur 不動)', '值不一樣 → `cur = cur.next`', '回傳 head'],
      figure: { title: `head = [${L}]`, steps: iterFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個節點看一次。' },
      verdict: '最推薦,串列刪除節點的基本功:改 next 指標就能「跳過」節點。',
      code: {
        python: `def deleteDuplicates(head):
    cur = head
    while cur and cur.next:
        if cur.next.val == cur.val:
            cur.next = cur.next.next          # 跳過重複的;cur 不動,可能還有第三個
        else:
            cur = cur.next
    return head`,
        c: `struct ListNode *deleteDuplicates(struct ListNode *head) {
    struct ListNode *cur = head;
    while (cur && cur->next) {
        if (cur->next->val == cur->val) {
            struct ListNode *d = cur->next;
            cur->next = d->next;
            free(d);
        } else cur = cur->next;
    }
    return head;
}`,
        cpp: `ListNode* deleteDuplicates(ListNode* head) {
    ListNode *cur = head;
    while (cur && cur->next) {
        if (cur->next->val == cur->val) cur->next = cur->next->next;
        else cur = cur->next;
    }
    return head;
}`,
        java: `ListNode deleteDuplicates(ListNode head) {
    ListNode cur = head;
    while (cur != null && cur.next != null) {
        if (cur.next.val == cur.val) cur.next = cur.next.next;
        else cur = cur.next;
    }
    return head;
}`,
        javascript: `function deleteDuplicates(head) {
  let cur = head;
  while (cur && cur.next) {
    if (cur.next.val === cur.val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return head;
}`,
      },
    },
    {
      name: '遞迴',
      idea: '`head.next = deleteDuplicates(head.next)`;若 `head.val == head.next.val` 回傳 `head.next`,否則回傳 head。',
      steps: ['`head` 或 `head.next` 是空 → 回傳 head', '`head.next = deleteDuplicates(head.next)`', '`head.val == head.next.val` → 回傳 `head.next`;否則回傳 head'],
      figure: { title: `head = [${L}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '遞迴深度 = 串列長度。' },
      verdict: '寫法短,但多用 O(n) 的呼叫堆疊。',
      code: {
        python: `def deleteDuplicates(head):
    if not head or not head.next:
        return head
    head.next = deleteDuplicates(head.next)   # 後面先處理好
    return head.next if head.val == head.next.val else head`,
        c: `struct ListNode *deleteDuplicates(struct ListNode *head) {
    if (!head || !head->next) return head;
    head->next = deleteDuplicates(head->next);
    return head->val == head->next->val ? head->next : head;
}`,
        cpp: `ListNode* deleteDuplicates(ListNode* head) {
    if (!head || !head->next) return head;
    head->next = deleteDuplicates(head->next);
    return head->val == head->next->val ? head->next : head;
}`,
        java: `ListNode deleteDuplicates(ListNode head) {
    if (head == null || head.next == null) return head;
    head.next = deleteDuplicates(head.next);
    return head.val == head.next.val ? head.next : head;
}`,
        javascript: `function deleteDuplicates(head) {
  if (!head || !head.next) return head;
  head.next = deleteDuplicates(head.next);
  return head.val === head.next.val ? head.next : head;
}`,
      },
    },
  ],
  pitfalls: ['跳過之後 cur 也往前走:連續三個一樣的(1,1,1)會漏刪一個', '迴圈條件沒檢查 cur.next 是否為空'],
  check: {
    kind: 'fn',
    fn: 'deleteDuplicates',
    argKinds: ['list'],
    ret: 'list',
    cases: [
      { args: [[1, 1, 2]], out: [1, 2] },
      { args: [L], out: [1, 2, 3] },
      { args: [[]], out: [] },
      { args: [[1, 1, 1]], out: [1] },
      { args: [[-3, -1, 0]], out: [-3, -1, 0] },
    ],
  },
}
