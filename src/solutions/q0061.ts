import { arr } from '../engine/helpers'
import { chain, loopChain } from './fig'
import type { FigStep, Solution } from './types'

// 61. Rotate List

const L = [1, 2, 3, 4, 5]
const K = 2

function ringFig(): FigStep[] {
  const n = L.length
  const k = K % n
  return [
    { note: `往右轉 ${K} 格 = 最後 ${k} 個搬到最前面。先走到尾巴、順便數長度 n = ${n},k 先對 n 取餘數(轉 n 圈等於沒轉)`, views: [chain(L, { cls: { [n - 1]: 'cur' }, subs: { [n - 1]: 'tail' } })] },
    { note: '把尾巴接回頭,變成一個環', views: [loopChain(L, 0, { cls: { [n - 1]: 'cur' } })] },
    { note: `從頭走 n − k − 1 = ${n - k - 1} 步到新的尾巴(值 ${L[n - k - 1]}),它的下一個(值 ${L[n - k]})就是新的頭;把環在這裡切斷`, views: [loopChain(L, 0, { cls: { [n - k - 1]: 'hl', [n - k]: 'done' }, subs: { [n - k - 1]: '新尾', [n - k]: '新頭' } })] },
    { note: `結果 [${[...L.slice(n - k), ...L.slice(0, n - k)]}]`, views: [chain([...L.slice(n - k), ...L.slice(0, n - k)], { tail: true })] },
  ]
}

function arrFig(): FigStep[] {
  return [
    { note: '先把節點放進陣列,新頭就是 nodes[n − k]、新尾是 nodes[n − k − 1]', views: [arr(L, { label: '節點陣列', highlight: [2, 3] })] },
    { note: '改三條指標:舊尾巴接到舊頭、新尾的 next 設成 null、回傳新頭', views: [arr([4, 5, 1, 2, 3], { label: '結果' })] },
  ]
}

export const q0061: Solution = {
  id: 61,
  plain: '把串列往右轉 k 格:最後一個節點搬到最前面,做 k 次。例如 [1,2,3,4,5] 轉 2 格 → [4,5,1,2,3]。k 可能很大。',
  statement: '給串列的頭 `head`,將串列向右旋轉 k 個位置,回傳新的頭。',
  examples: [
    { input: 'head = [1,2,3,4,5], k = 2', output: '[4,5,1,2,3]' },
    { input: 'head = [0,1,2], k = 4', output: '[2,0,1]', note: '4 % 3 = 1' },
  ],
  constraints: ['節點數 ≤ 500', 'k ≤ 2·10⁹ → 一定要先 `k %= n`'],
  insight: ['轉 n 次回到原樣 → `k %= n`', '旋轉 k 格 = 在第 n − k 個節點後面切開,後半段接到前面', '技巧:先把尾巴接回頭形成環,再在正確的位置切斷'],
  approaches: [
    {
      name: '接成環再切斷',
      idea: '走到尾巴得到 n;`tail.next = head`;從頭走 `n − k % n − 1` 步得到新尾,`新頭 = 新尾.next`,切斷。',
      steps: ['空串列或單一節點 → 直接回傳', '走到尾巴,數出 n;`tail.next = head`', '`steps = n − k % n − 1`;從 head 走 steps 步得到 newTail', '`newHead = newTail.next`、`newTail.next = None`;回傳 newHead'],
      figure: { title: `head = [${L}],k = ${K}`, steps: ringFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最多走兩遍。' },
      verdict: '最推薦。接成環之後,「在哪裡切」就是唯一要算的事。',
      code: {
        python: `def rotateRight(head, k):
    if not head or not head.next:
        return head
    n, tail = 1, head
    while tail.next:
        tail = tail.next
        n += 1
    tail.next = head                          # 接成環
    new_tail = head
    for _ in range(n - k % n - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None                      # 在這裡切斷
    return new_head`,
        c: `struct ListNode *rotateRight(struct ListNode *head, int k) {
    if (!head || !head->next) return head;
    int n = 1;
    struct ListNode *tail = head;
    while (tail->next) { tail = tail->next; n++; }
    tail->next = head;
    struct ListNode *nt = head;
    for (int i = 0; i < n - k % n - 1; i++) nt = nt->next;
    struct ListNode *nh = nt->next;
    nt->next = NULL;
    return nh;
}`,
        cpp: `ListNode* rotateRight(ListNode* head, int k) {
    if (!head || !head->next) return head;
    int n = 1;
    ListNode *tail = head;
    while (tail->next) { tail = tail->next; n++; }
    tail->next = head;
    ListNode *nt = head;
    for (int i = 0; i < n - k % n - 1; i++) nt = nt->next;
    ListNode *nh = nt->next;
    nt->next = nullptr;
    return nh;
}`,
        java: `ListNode rotateRight(ListNode head, int k) {
    if (head == null || head.next == null) return head;
    int n = 1;
    ListNode tail = head;
    while (tail.next != null) { tail = tail.next; n++; }
    tail.next = head;
    ListNode nt = head;
    for (int i = 0; i < n - k % n - 1; i++) nt = nt.next;
    ListNode nh = nt.next;
    nt.next = null;
    return nh;
}`,
        javascript: `function rotateRight(head, k) {
  if (!head || !head.next) return head;
  let n = 1, tail = head;
  while (tail.next) {
    tail = tail.next;
    n++;
  }
  tail.next = head;
  let nt = head;
  for (let i = 0; i < n - (k % n) - 1; i++) nt = nt.next;
  const nh = nt.next;
  nt.next = null;
  return nh;
}`,
      },
    },
    {
      name: '節點陣列 + 直接定位',
      idea: '節點放進陣列;`k %= n`,k == 0 直接回傳;否則 `nodes[n−1].next = nodes[0]`、`nodes[n−k−1].next = None`,回傳 `nodes[n − k]`。',
      steps: ['收集 nodes', '`k %= n`;`k == 0` → 回傳 head', '舊尾接舊頭;新尾切斷', '回傳 `nodes[n − k]`'],
      figure: { title: `head = [${L}],k = ${K}`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個節點陣列。' },
      verdict: '用索引直接找到位置,不用數步數;多用 O(n) 空間。',
      code: {
        python: `def rotateRight(head, k):
    nodes = []
    while head:
        nodes.append(head)
        head = head.next
    n = len(nodes)
    if n == 0 or k % n == 0:
        return nodes[0] if nodes else None
    k %= n
    nodes[-1].next = nodes[0]                 # 舊尾接舊頭
    nodes[n - k - 1].next = None              # 新尾切斷
    return nodes[n - k]`,
        c: `struct ListNode *rotateRight(struct ListNode *head, int k) {
    struct ListNode *nodes[500];
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) nodes[n++] = p;
    if (n == 0 || k % n == 0) return head;
    k %= n;
    nodes[n - 1]->next = nodes[0];
    nodes[n - k - 1]->next = NULL;
    return nodes[n - k];
}`,
        cpp: `ListNode* rotateRight(ListNode* head, int k) {
    vector<ListNode*> nodes;
    for (ListNode *p = head; p; p = p->next) nodes.push_back(p);
    int n = nodes.size();
    if (n == 0 || k % n == 0) return head;
    k %= n;
    nodes[n - 1]->next = nodes[0];
    nodes[n - k - 1]->next = nullptr;
    return nodes[n - k];
}`,
        java: `ListNode rotateRight(ListNode head, int k) {
    List<ListNode> nodes = new ArrayList<>();
    for (ListNode p = head; p != null; p = p.next) nodes.add(p);
    int n = nodes.size();
    if (n == 0 || k % n == 0) return head;
    k %= n;
    nodes.get(n - 1).next = nodes.get(0);
    nodes.get(n - k - 1).next = null;
    return nodes.get(n - k);
}`,
        javascript: `function rotateRight(head, k) {
  const nodes = [];
  for (let p = head; p; p = p.next) nodes.push(p);
  const n = nodes.length;
  if (n === 0 || k % n === 0) return head;
  k %= n;
  nodes[n - 1].next = nodes[0];
  nodes[n - k - 1].next = null;
  return nodes[n - k];
}`,
      },
    },
  ],
  pitfalls: ['k 很大時真的一格一格轉:2·10⁹ 次', 'k % n == 0 時接成環卻忘了切開', '空串列時 n = 0,`k % n` 會除以 0'],
  check: {
    kind: 'fn',
    fn: 'rotateRight',
    argKinds: ['list', null],
    ret: 'list',
    cases: [
      { args: [L, K], out: [4, 5, 1, 2, 3] },
      { args: [[0, 1, 2], 4], out: [2, 0, 1] },
      { args: [[], 3], out: [] },
      { args: [[1, 2], 2], out: [1, 2] },
      { args: [[1, 2, 3], 2000000000], out: [2, 3, 1] },
    ],
  },
}
