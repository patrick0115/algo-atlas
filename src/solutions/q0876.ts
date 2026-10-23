import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 876. Middle of the Linked List

const L = [1, 2, 3, 4, 5, 6]

function fsFig(): FigStep[] {
  const out: FigStep[] = []
  let s = 0
  let f = 0
  out.push({ note: '快慢指標:slow 一次走一步、fast 一次走兩步。fast 走到底的時候,slow 剛好走了一半', views: [chain(L, { cls: { 0: 'cur' }, subs: { 0: 'slow, fast' }, tail: true })] })
  while (f < L.length && f + 1 < L.length) {
    s += 1
    f += 2
    const subs: Record<number, string> = { [s]: 'slow' }
    if (f < L.length) subs[f] = s === f ? 'slow, fast' : 'fast'
    else subs[-1] = 'fast'
    out.push({ note: `slow 走到 ${L[s]},fast ${f < L.length ? `走到 ${L[f]}` : '走出去了(null)'}`, views: [chain(L, { cls: { [s]: 'cur', ...(f < L.length ? { [f]: 'hl' } : {}) }, subs, tail: true })] })
  }
  out.push({ note: `fast 停下時 slow 在 ${L[s]}。長度是偶數時有兩個中間點,這樣寫會停在第二個(題目要的)`, views: [chain(L, { cls: { [s]: 'done' } })] })
  return out
}

function arrFig(): FigStep[] {
  return [
    { note: '直觀:把節點放進陣列,中間就是索引 n // 2', views: [arr(L, { label: '節點陣列', highlight: [3] })] },
    { note: `n = ${L.length},n // 2 = 3 → 值 ${L[3]}。多用 O(n) 空間`, views: [arr(L, { label: '節點陣列', done: [3] })] },
  ]
}

export const q0876: Solution = {
  id: 876,
  plain: '找出串列正中間的節點。如果有兩個中間(長度是偶數),回傳第二個。',
  statement: '給單向串列的頭 `head`,回傳中間節點;若有兩個中間節點,回傳**第二個**。',
  examples: [
    { input: 'head = [1,2,3,4,5]', output: '[3,4,5]' },
    { input: 'head = [1,2,3,4,5,6]', output: '[4,5,6]', note: '3 和 4 都是中間,回傳第二個' },
  ],
  constraints: ['節點數 1 ~ 100'],
  insight: ['不知道長度時,可以先數一遍,再走一半', '一次走完:快指標速度是慢指標的兩倍,快的到終點時,慢的在一半', '這個技巧是很多串列題的基本零件([234](#/q/234)、[143](#/q/143)、[148](#/q/148))'],
  approaches: [
    {
      name: '快慢指標',
      idea: '`slow = fast = head`;`while fast and fast.next`:slow 走一步、fast 走兩步;回傳 slow。',
      steps: ['`slow = fast = head`', '`while fast and fast.next`:`slow = slow.next`、`fast = fast.next.next`', '回傳 slow'],
      figure: { title: `head = [${L}]`, steps: fsFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: 'fast 走過整條,slow 走一半。' },
      verdict: '最推薦,[[p:fast-slow]]的入門題。條件寫 `fast and fast.next` 會停在第二個中間點;寫 `fast.next and fast.next.next` 會停在第一個。',
      code: {
        python: `def middleNode(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next                      # 一步
        fast = fast.next.next                 # 兩步
    return slow`,
        c: `struct ListNode *middleNode(struct ListNode *head) {
    struct ListNode *slow = head, *fast = head;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    return slow;
}`,
        cpp: `ListNode* middleNode(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    return slow;
}`,
        java: `ListNode middleNode(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
    return slow;
}`,
        javascript: `function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`,
      },
    },
    {
      name: '節點放進陣列',
      idea: '收集所有節點,回傳 `nodes[n // 2]`。',
      steps: ['走一遍把節點放進陣列', '回傳 `nodes[len // 2]`'],
      figure: { title: `head = [${L}]`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個陣列。' },
      verdict: '最好懂,但多用了空間。',
      code: {
        python: `def middleNode(head):
    nodes = []
    while head:
        nodes.append(head)
        head = head.next
    return nodes[len(nodes) // 2]`,
        c: `struct ListNode *middleNode(struct ListNode *head) {
    struct ListNode *nodes[100];
    int n = 0;
    for (; head; head = head->next) nodes[n++] = head;
    return nodes[n / 2];
}`,
        cpp: `ListNode* middleNode(ListNode* head) {
    vector<ListNode*> nodes;
    for (; head; head = head->next) nodes.push_back(head);
    return nodes[nodes.size() / 2];
}`,
        java: `ListNode middleNode(ListNode head) {
    List<ListNode> nodes = new ArrayList<>();
    for (; head != null; head = head.next) nodes.add(head);
    return nodes.get(nodes.size() / 2);
}`,
        javascript: `function middleNode(head) {
  const nodes = [];
  for (; head; head = head.next) nodes.push(head);
  return nodes[nodes.length >> 1];
}`,
      },
    },
  ],
  pitfalls: ['迴圈條件只寫 `fast.next`:fast 可能是 null,會出錯', '偶數長度要回傳第二個中間點,條件寫錯會回傳第一個'],
  check: {
    kind: 'fn',
    fn: 'middleNode',
    argKinds: ['list'],
    ret: 'list',
    cases: [
      { args: [[1, 2, 3, 4, 5]], out: [3, 4, 5] },
      { args: [L], out: [4, 5, 6] },
      { args: [[1]], out: [1] },
      { args: [[1, 2]], out: [2] },
    ],
  },
}
