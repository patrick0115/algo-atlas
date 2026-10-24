import type { Solution } from './types'
import { chain } from './fig'

// 328. Odd Even Linked List
const V = [1,2,3,4,5]
const fig = [
  { note: '奇偶指的是位置（第 1、3、5 個），不是節點的數值。先分成奇位 1→3→5 與偶位 2→4。', views: [chain(V, { label: '原串列', cls: { 0: 'hl', 2: 'hl', 4: 'hl' } }), chain([1,3,5], { label: '奇位' }), chain([2,4], { label: '偶位' })] },
  { note: '先把 odd 指向第 1 個節點 1，even 指向第 2 個節點 2，並保存偶數鏈的頭 2。', views: [chain(V, { label: '起始指標', cls: { 0: 'hl', 1: 'visited' } })] },
  { note: '第一次改接後，奇數鏈已有 1→3，偶數鏈已有 2→4；兩條鏈各自保留原有次序。', views: [chain([1,3], { label: 'odd 鏈', cls: { 1: 'hl' } }), chain([2,4], { label: 'even 鏈', cls: { 1: 'hl' } })] },
  { note: '第二次改接後，奇數鏈變成 1→3→5，偶數鏈是 2→4（4 的 next 變成空）；even 走到空，迴圈結束。', views: [chain([1,3,5], { label: 'odd 鏈', cls: { 2: 'hl' } }), chain([2,4], { label: 'even 鏈' })] },
  { note: '把奇位尾巴接到偶位頭，得到 1→3→5→2→4。', views: [chain([1,3,5,2,4], { label: '結果', tail: true, cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done' } })] },
]
const collectFig = [
  { note: '掃到位置 1、2 時，先把節點 1 放入 odd 陣列、節點 2 放入 even 陣列。', views: [chain(V, { label: '掃描前兩個節點', cls: { 0: 'done', 1: 'done' } })] },
  { note: '繼續掃描位置 3 到 5，odd 收到 [1,3,5]，even 收到 [2,4]，兩組內部順序沒有改變。', views: [chain([1,3,5], { label: 'odd' }), chain([2,4], { label: 'even' })] },
  { note: '依 odd 再 even 的順序改接 next，並把最後一個節點的 next 設成空值。', views: [chain([1,3,5,2,4], { label: '改接後', tail: true, cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done' } })] },
]

export const q0328: Solution = {
  id: 328,
  plain: '把鏈結串列依原本位置分成奇數位與偶數位，奇數位排前面、偶數位排後面，各組維持原順序。',
  statement: '原地重排 head：所有第 1、3、5… 個節點先出現，接著是第 2、4、6… 個節點，回傳 head。',
  examples: [{ input: 'head = [1,2,3,4,5]', output: '[1,3,5,2,4]' }, { input: 'head = [2,1,3,5,6,4,7]', output: '[2,3,6,7,1,5,4]' }],
  constraints: ['0 ≤ 節點數 ≤ 10⁴。', '進階要求 O(1) 額外空間。'],
  insight: ['要保留兩組相對順序，可先用兩個陣列收集節點。', '更省空間：維持 odd 和 even 兩條鏈的尾巴，交替改 next；最後把 odd 接到原 even 頭。', '與 [143](#/q/143) 一樣，改指標前要保留必要的下一個節點。'],
  approaches: [
    { name: '收集奇偶節點', idea: '走訪時把節點物件依位置放進兩個陣列，再依序重新串接。', steps: ['交替把節點放入 odd / even 陣列。奇偶依原本的位置決定，因此必須照原順序走訪節點。', '串接 odd 後再串接 even。分組時保留每組的先後順序，才符合題目要求。', '最後一個節點的 next 設成 null。'], figure: { title: 'head = [1,2,3,4,5]', steps: collectFig }, complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點保存一次。' }, verdict: '簡單但需要額外陣列。', code: {
      python: `def oddEvenList(head):
    odd, even = ([], [])
    n = head
    i = 1
    while n:  # 依原本位置把節點分到奇位與偶位。
        (odd if i % 2 else even).append(n)
        n = n.next
        i += 1
    a = odd + even
    for i, n in enumerate(a):  # 把奇位串列接在前面，再接上偶位串列。
        n.next = a[i + 1] if i + 1 < len(a) else None
    return a[0] if a else None`,
      c: `struct ListNode *oddEvenList(struct ListNode *head) {
    int cap = 16, n = 0;
    struct ListNode **odd = malloc(cap * sizeof(*odd)), **even = malloc(cap * sizeof(*even));
    int o = 0, e = 0;
    for (struct ListNode *p = head; p; p = p->next) {
        if (n == cap) {
            cap *= 2;
            odd = realloc(odd, cap * sizeof(*odd));
            even = realloc(even, cap * sizeof(*even));
        }
        if (n++ % 2 == 0)
            odd[o++] = p;
        else
            even[e++] = p;
    }
    struct ListNode *ans = head, *prev = NULL;
    for (int i = 0; i < o; i++) {
        if (prev)
            prev->next = odd[i];
        prev = odd[i];
    }
    for (int i = 0; i < e; i++) {
        if (prev)
            prev->next = even[i];
        prev = even[i];
    }
    if (prev)
        prev->next = NULL;
    free(odd);
    free(even);
    return ans;
}`,
      cpp: `ListNode *oddEvenList(ListNode *head) {
    vector<ListNode*> a, b;
    for (auto p = head; p; p = p->next)
        ((a.size() + b.size()) % 2 ? b : a).push_back(p);
    a.insert(a.end(), b.begin(), b.end());
    for (int i = 0; i < (int)a.size(); i++)
        a[i]->next = i + 1 < (int)a.size() ? a[i + 1] : nullptr;
    return head;
}`,
      java: `ListNode oddEvenList(ListNode head) {
    List<ListNode> a = new ArrayList<>(), b = new ArrayList<>();
    int i = 0;
    for (ListNode p = head; p != null; p = p.next) {
        (i++ % 2 == 0 ? a : b).add(p);
    }
    a.addAll(b);
    for (i = 0; i < a.size(); i++)
        a.get(i).next = i + 1 < a.size() ? a.get(i + 1) : null;
    return head;
}`,
      javascript: `function oddEvenList(head) {
    const a = [], b = [];
    let i = 0;
    for (let p = head; p; p = p.next)
        (i++ % 2 ? b : a).push(p);
    const all = a.concat(b);
    all.forEach((n, j) => n.next = all[j + 1] ?? null);
    return head;
}`,
    } },
    { name: '兩條鏈原地交錯拆分', idea: 'odd、even 各跳過一個節點，最後把奇位尾巴接到偶位頭。', steps: ['若 head 空，直接回傳。奇偶依原本的位置決定，因此必須照原順序走訪節點。', 'odd=head、even=head.next，保存 evenHead。分組時保留每組的先後順序，才符合題目要求。', '當 even 與 even.next 存在：odd.next = even.next、odd 前進；even.next = odd.next、even 前進。', 'odd.next=evenHead。最後把奇數鏈尾端接到偶數鏈頭端，得到完整串列。'], figure: { title: 'head = [1,2,3,4,5]', steps: fig }, complexity: { time: 'O(n)', space: 'O(1)', why: '僅使用固定數量指針。' }, verdict: '符合進階要求；奇偶是索引，不是值。', code: {
      python: `def oddEvenList(head):
    if not head:  # 空串列可直接回傳。
        return head
    odd = head
    even = head.next
    evenHead = even
    while even and even.next:  # 依原本位置把節點分到奇位與偶位。
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = evenHead
    return head`,
      c: `struct ListNode *oddEvenList(struct ListNode *head) {
    if (!head)
        return head;
    struct ListNode *odd = head, *even = head->next, *evenHead = even;
    while (even && even->next) {
        odd->next = even->next;
        odd = odd->next;
        even->next = odd->next;
        even = even->next;
    }
    odd->next = evenHead;
    return head;
}`,
      cpp: `ListNode *oddEvenList(ListNode *head) {
    if (!head)
        return head;
    auto odd = head, even = head->next, evenHead = even;
    while (even && even->next) {
        odd->next = even->next;
        odd = odd->next;
        even->next = odd->next;
        even = even->next;
    }
    odd->next = evenHead;
    return head;
}`,
      java: `ListNode oddEvenList(ListNode head) {
    if (head == null)
        return head;
    ListNode odd = head, even = head.next, evenHead = even;
    while (even != null && even.next != null) {
        odd.next = even.next;
        odd = odd.next;
        even.next = odd.next;
        even = even.next;
    }
    odd.next = evenHead;
    return head;
}`,
      javascript: `function oddEvenList(head) {
    if (!head)
        return head;
    let odd = head, even = head.next;
    const evenHead = even;
    while (even && even.next) {
        odd.next = even.next;
        odd = odd.next;
        even.next = odd.next;
        even = even.next;
    }
    odd.next = evenHead;
    return head;
}`,
    } },
  ],
  pitfalls: ['依節點位置分組，不能用 val 的奇偶性。', '要保存 evenHead，否則最後找不到偶位鏈。', '尾端 next 要正確結束，避免形成環。'],
  check: { kind: 'fn', fn: 'oddEvenList', argKinds: ['list'], ret: 'list', cases: [{ args: [V], out: [1,3,5,2,4] }, { args: [[2,1,3,5,6,4,7]], out: [2,3,6,7,1,5,4] }, { args: [[]], out: [] }] },
}
