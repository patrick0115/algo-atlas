import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 1721. Swapping Nodes in a Linked List

const L = [1, 2, 3, 4, 5]
const K = 2

function arrFig(): FigStep[] {
  const a = [...L]
  const n = a.length
  ;[a[K - 1], a[n - K]] = [a[n - K], a[K - 1]]
  return [
    { note: `先把值抄進陣列。正數第 ${K} 個是索引 ${K - 1},倒數第 ${K} 個是索引 n − ${K} = ${n - K}`, views: [arr(L, { label: '值', highlight: [K - 1, n - K] })] },
    { note: `兩個值交換,再依序寫回串列 → [${a}]`, views: [arr(a, { label: '交換後', highlight: [K - 1, n - K] }), chain(a, { cls: { [K - 1]: 'hl', [n - K]: 'hl' } })] },
  ]
}

function ptrFig(): FigStep[] {
  const n = L.length
  const a = [...L]
  ;[a[K - 1], a[n - K]] = [a[n - K], a[K - 1]]
  return [
    { note: `先走 ${K - 1} 步,first 停在正數第 ${K} 個(值 ${L[K - 1]})`, views: [chain(L, { cls: { [K - 1]: 'hl' }, subs: { [K - 1]: 'first' } })] },
    { note: `second 從頭出發,和「從 first 出發的指標」一起走;那個指標走到最後一個節點時,second 正好在倒數第 ${K} 個(兩者距離固定是 ${K} − 1 = ${K - 1})`, views: [chain(L, { cls: { [K - 1]: 'hl', [n - K]: 'cur', [n - 1]: 'dim' }, subs: { [K - 1]: 'first', [n - K]: 'second', [n - 1]: 'p' } })] },
    { note: `交換 first 和 second 的值(題目允許交換值)→ [${a}]`, views: [chain(a, { cls: { [K - 1]: 'done', [n - K]: 'done' } })] },
  ]
}

export const q1721: Solution = {
  id: 1721,
  plain: '一排手牽手的人(只能從頭往後數),把「從前面數第 k 個」和「從後面數第 k 個」兩個人手上的號碼牌互換。',
  statement: '給串列 `head` 和整數 `k`,交換**正數第 k 個**與**倒數第 k 個**節點的值(1 起算),回傳串列的頭。',
  examples: [
    { input: 'head = [1,2,3,4,5], k = 2', output: '[1,4,3,2,5]' },
    { input: 'head = [7,9,6,6,7,8,3,0,9,5], k = 5', output: '[7,9,6,6,8,7,3,0,9,5]' },
  ],
  constraints: ['1 ≤ k ≤ n ≤ 10⁵'],
  insight: ['正數第 k 個:從頭走 k−1 步', '倒數第 k 個 = 正數第 n−k+1 個;不想先數長度的話,用「固定距離的雙指標」([19](#/q/19) 的同一招)', '只交換值就好,不用動指標'],
  approaches: [
    {
      name: '抄進陣列',
      idea: '值抄到陣列,交換 `a[k−1]` 和 `a[n−k]`,再寫回串列。',
      steps: ['走一遍把值放進 a', '交換 `a[k − 1]`、`a[n − k]`', '再走一遍把值寫回'],
      figure: { title: `head = [${L}],k = ${K}`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個陣列。' },
      verdict: '最好寫,但多用了 O(n) 空間。',
      code: {
        python: `def swapNodes(head, k):
    a, p = [], head
    while p:
        a.append(p.val)
        p = p.next
    n = len(a)
    a[k - 1], a[n - k] = a[n - k], a[k - 1]
    p = head
    for v in a:                               # 寫回串列
        p.val = v
        p = p.next
    return head`,
        c: `struct ListNode *swapNodes(struct ListNode *head, int k) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    int *a = malloc(n * sizeof(int)), i = 0;
    for (struct ListNode *p = head; p; p = p->next) a[i++] = p->val;
    int t = a[k - 1]; a[k - 1] = a[n - k]; a[n - k] = t;
    i = 0;
    for (struct ListNode *p = head; p; p = p->next) p->val = a[i++];
    free(a);
    return head;
}`,
        cpp: `ListNode* swapNodes(ListNode* head, int k) {
    vector<int> a;
    for (ListNode *p = head; p; p = p->next) a.push_back(p->val);
    int n = a.size();
    swap(a[k - 1], a[n - k]);
    int i = 0;
    for (ListNode *p = head; p; p = p->next) p->val = a[i++];
    return head;
}`,
        java: `ListNode swapNodes(ListNode head, int k) {
    List<Integer> a = new ArrayList<>();
    for (ListNode p = head; p != null; p = p.next) a.add(p.val);
    int n = a.size();
    Collections.swap(a, k - 1, n - k);
    int i = 0;
    for (ListNode p = head; p != null; p = p.next) p.val = a.get(i++);
    return head;
}`,
        javascript: `function swapNodes(head, k) {
  const a = [];
  for (let p = head; p; p = p.next) a.push(p.val);
  const n = a.length;
  [a[k - 1], a[n - k]] = [a[n - k], a[k - 1]];
  let i = 0;
  for (let p = head; p; p = p.next) p.val = a[i++];
  return head;
}`,
      },
    },
    {
      name: '固定距離的雙指標',
      idea: '`first` 走 k−1 步;`p = first`、`second = head`,兩個一起走到 p 是最後一個節點,second 就是倒數第 k 個。交換兩者的值。',
      steps: ['`first = head`,走 k − 1 步', '`p = first`、`second = head`', '`while p.next`:`p = p.next`、`second = second.next`', '交換 `first.val`、`second.val`'],
      figure: { title: `head = [${L}],k = ${K}`, steps: ptrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次走訪,只用三個指標。' },
      verdict: '最推薦。「倒數第 k 個」的標準作法:兩個指標保持固定距離一起走。',
      code: {
        python: `def swapNodes(head, k):
    first = head
    for _ in range(k - 1):
        first = first.next                    # 正數第 k 個
    p, second = first, head
    while p.next:                             # p 到尾巴時,second 落後 p 剛好 k−1 個
        p, second = p.next, second.next
    first.val, second.val = second.val, first.val
    return head`,
        c: `struct ListNode *swapNodes(struct ListNode *head, int k) {
    struct ListNode *first = head;
    for (int i = 1; i < k; i++) first = first->next;
    struct ListNode *p = first, *second = head;
    while (p->next) { p = p->next; second = second->next; }
    int t = first->val; first->val = second->val; second->val = t;
    return head;
}`,
        cpp: `ListNode* swapNodes(ListNode* head, int k) {
    ListNode *first = head;
    for (int i = 1; i < k; i++) first = first->next;
    ListNode *p = first, *second = head;
    while (p->next) { p = p->next; second = second->next; }
    swap(first->val, second->val);
    return head;
}`,
        java: `ListNode swapNodes(ListNode head, int k) {
    ListNode first = head;
    for (int i = 1; i < k; i++) first = first.next;
    ListNode p = first, second = head;
    while (p.next != null) { p = p.next; second = second.next; }
    int t = first.val; first.val = second.val; second.val = t;
    return head;
}`,
        javascript: `function swapNodes(head, k) {
  let first = head;
  for (let i = 1; i < k; i++) first = first.next;
  let p = first, second = head;
  while (p.next) {
    p = p.next;
    second = second.next;
  }
  [first.val, second.val] = [second.val, first.val];
  return head;
}`,
      },
    },
  ],
  pitfalls: ['倒數第 k 個算成索引 n − k − 1(差一):倒數第 1 個是索引 n − 1', '正數和倒數是同一個節點(n 是奇數、k 在正中間)時,交換也不會出錯'],
  check: {
    kind: 'fn',
    fn: 'swapNodes',
    argKinds: ['list', null],
    ret: 'list',
    cases: [
      { args: [L, K], out: [1, 4, 3, 2, 5] },
      { args: [[7, 9, 6, 6, 7, 8, 3, 0, 9, 5], 5], out: [7, 9, 6, 6, 8, 7, 3, 0, 9, 5] },
      { args: [[1], 1], out: [1] },
      { args: [[1, 2], 1], out: [2, 1] },
      { args: [[1, 2, 3], 2], out: [1, 2, 3] },
    ],
  },
}
