import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 147. Insertion Sort List
const A = [4, 2, 1, 3]
const insertFig: FigStep[] = [
  { note: '維持一段已排序的串列。先有 [4],讀到 2 時找到第一個比 2 大的位置,把節點插在 4 前。', views: [arr([4], { label: '已排序' }), arr([2, 4], { label: '插入 2 後' })] },
  { note: '再把 1 插到最前、3 插在 2 與 4 中間,完成 [1,2,3,4]。', views: [arr([1, 2, 4], { label: '插入 1 後' }), arr([1, 2, 3, 4], { label: '插入 3 後', done: [0, 1, 2, 3] })] },
]
const arrayFig: FigStep[] = [
  { note: '若只要求結果,也能先收集所有節點的值,用語言的排序函式排序後再寫回節點。', views: [arr(A, { label: '原串列的值' }), arr([1, 2, 3, 4], { label: '排序後的值' })] },
  { note: '這種方法改寫每個節點的值;若題目要求保留節點值不動,應改用節點插入法。', views: [arr([1, 2, 3, 4], { label: '回傳串列', done: [0, 1, 2, 3] })] },
]

export const q0147: Solution = {
  id: 147,
  plain: '把單向串列當成一排待整理的卡片:每拿到下一個節點,就把它插入前面已排好序的正確位置。',
  statement: '給單向串列 head,使用插入排序的想法把節點依值由小到大排好,回傳新表頭。',
  examples: [{ input: 'head = [4,2,1,3]', output: '[1,2,3,4]' }, { input: 'head = [-1,5,3,4,0]', output: '[-1,0,3,4,5]' }],
  constraints: ['節點數最多 5000'],
  insight: ['單向串列不能直接向左移動,可用虛擬表頭找到插入位置。', '維持已排序尾端 lastSorted;若新節點比尾端大,直接延長已排序段。', '否則從虛擬表頭往後找第一個更大的節點,重新接上指標。'],
  approaches: [
    {
      name: '原地移動節點',
      idea: '維持前綴已排序,每次把下一個節點移到正確位置;只改 next 指標。',
      steps: ['建立指向 head 的虛擬表頭,令 lastSorted = head', '令 current = lastSorted.next', '若 current 不小於 lastSorted,直接推進 lastSorted', '否則從虛擬表頭找插入位置,先摘下 current 再插入'],
      figure: { title: 'head = [4,2,1,3]', steps: insertFig },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個節點最壞需從表頭走過整段已排序串列。' },
      verdict: '符合真正的串列插入排序,保留每個節點本身的值。',
      code: {
        python: `def insertionSortList(head):
    dummy = ListNode(0, head)
    last = head
    while last and last.next:
        current = last.next
        if last.val <= current.val:
            last = current
            continue
        prev = dummy
        while prev.next.val <= current.val:
            prev = prev.next
        last.next = current.next
        current.next = prev.next
        prev.next = current
    return dummy.next`,
        c: `struct ListNode *insertionSortList(struct ListNode *head) {
    struct ListNode dummy = {0, head};
    struct ListNode *last = head;
    while (last && last->next) {
        struct ListNode *current = last->next;
        if (last->val <= current->val) { last = current; continue; }
        struct ListNode *prev = &dummy;
        while (prev->next->val <= current->val) prev = prev->next;
        last->next = current->next;
        current->next = prev->next;
        prev->next = current;
    }
    return dummy.next;
}`,
        cpp: `ListNode* insertionSortList(ListNode* head) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode* last = head;
    while (last && last->next) {
        ListNode* current = last->next;
        if (last->val <= current->val) { last = current; continue; }
        ListNode* prev = &dummy;
        while (prev->next->val <= current->val) prev = prev->next;
        last->next = current->next;
        current->next = prev->next;
        prev->next = current;
    }
    return dummy.next;
}`,
        java: `ListNode insertionSortList(ListNode head) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode last = head;
    while (last != null && last.next != null) {
        ListNode current = last.next;
        if (last.val <= current.val) { last = current; continue; }
        ListNode prev = dummy;
        while (prev.next.val <= current.val) prev = prev.next;
        last.next = current.next;
        current.next = prev.next;
        prev.next = current;
    }
    return dummy.next;
}`,
        javascript: `function insertionSortList(head) {
  const dummy = new ListNode(0, head);
  let last = head;
  while (last && last.next) {
    const current = last.next;
    if (last.val <= current.val) { last = current; continue; }
    let prev = dummy;
    while (prev.next.val <= current.val) prev = prev.next;
    last.next = current.next;
    current.next = prev.next;
    prev.next = current;
  }
  return dummy.next;
}`,
      },
    },
    {
      name: '收集數值後排序',
      idea: '把所有節點值放入陣列排序,再依序寫回原串列。',
      steps: ['走訪串列,收集每個節點的值', '排序數值陣列', '再次走訪串列,依序寫回排序後的值', '回傳原表頭'],
      figure: { title: '先排序數值再寫回', steps: arrayFig },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '陣列排序的成本主導時間,另需儲存全部數值。' },
      verdict: '若只要求排序後的值,這樣更快;但它改寫節點的值,不是節點插入排序。',
      code: {
        python: `def insertionSortList(head):
    values = []
    node = head
    while node:
        values.append(node.val)
        node = node.next
    values.sort()
    node = head
    for value in values:
        node.val = value
        node = node.next
    return head`,
        c: `static int cmp147(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
struct ListNode *insertionSortList(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    int *values = malloc(n * sizeof(int));
    int i = 0;
    for (struct ListNode *p = head; p; p = p->next) values[i++] = p->val;
    qsort(values, n, sizeof(int), cmp147);
    i = 0;
    for (struct ListNode *p = head; p; p = p->next) p->val = values[i++];
    free(values);
    return head;
}`,
        cpp: `ListNode* insertionSortList(ListNode* head) {
    vector<int> values;
    for (ListNode* p = head; p; p = p->next) values.push_back(p->val);
    sort(values.begin(), values.end());
    int i = 0;
    for (ListNode* p = head; p; p = p->next) p->val = values[i++];
    return head;
}`,
        java: `ListNode insertionSortList(ListNode head) {
    List<Integer> values = new ArrayList<>();
    for (ListNode p = head; p != null; p = p.next) values.add(p.val);
    Collections.sort(values);
    int i = 0;
    for (ListNode p = head; p != null; p = p.next) p.val = values.get(i++);
    return head;
}`,
        javascript: `function insertionSortList(head) {
  const values = [];
  for (let p = head; p; p = p.next) values.push(p.val);
  values.sort((a, b) => a - b);
  let i = 0;
  for (let p = head; p; p = p.next) p.val = values[i++];
  return head;
}`,
      },
    },
  ],
  pitfalls: ['移動節點前先用 last.next 接上 current.next,避免串列斷掉。', '插入位置要從虛擬表頭開始找,因為新節點可能成為新表頭。', '若考題明確要求插入排序或不改節點值,不要只排序值陣列。'],
  check: { kind: 'fn', fn: 'insertionSortList', argKinds: ['list'], ret: 'list', cases: [
    { args: [A], out: [1, 2, 3, 4] },
    { args: [[-1, 5, 3, 4, 0]], out: [-1, 0, 3, 4, 5] },
    { args: [[]], out: [] }, { args: [[1]], out: [1] },
  ] },
}
