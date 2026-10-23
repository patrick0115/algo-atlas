import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 148. Sort List

const L = [4, 2, 1, 3]

function topFig(): FigStep[] {
  return [
    { note: '合併排序:① 快慢指標找中點,把串列切成兩半', views: [chain([4, 2], { label: '左半' }), chain([1, 3], { label: '右半' })] },
    { note: '② 兩半各自遞迴排序(一路切到只剩一個節點,一個節點本身就是排好的)', views: [chain([2, 4], { label: '左半排好' }), chain([1, 3], { label: '右半排好' })] },
    { note: '③ 合併兩條排好的串列([21](#/q/21)):每次接上比較小的頭', views: [chain([1, 2, 3, 4], { tail: true, cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } })] },
  ]
}

function bottomFig(): FigStep[] {
  return [
    { note: '由下往上:不用遞迴。第一輪把相鄰的「長度 1」兩兩合併', views: [chain([2, 4, 1, 3], { cls: { 0: 'hl', 1: 'hl', 2: 'cur', 3: 'cur' } })] },
    { note: '第二輪合併相鄰的「長度 2」,第三輪「長度 4」…… 長度每輪加倍,直到 ≥ n。每輪都是從頭切出兩段、合併、接到結果尾巴', views: [chain([1, 2, 3, 4], { cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' } })] },
  ]
}

export const q0148: Solution = {
  id: 148,
  plain: '把一條串列由小到大排序。要做到 O(n log n) 的時間。',
  statement: '給串列的頭 `head`,回傳**升序排序**後的串列。Follow-up:O(n log n) 時間、O(1) 額外空間。',
  examples: [
    { input: 'head = [4,2,1,3]', output: '[1,2,3,4]' },
    { input: 'head = [-1,5,3,4,0]', output: '[-1,0,3,4,5]' },
    { input: 'head = []', output: '[]' },
  ],
  constraints: ['節點數 ≤ 5·10⁴'],
  insight: ['串列不能隨機存取 → 快速排序、堆積排序都不好用', '合併排序很適合串列:切一半(快慢指標)、合併(只要改指標,不用額外陣列)', '遞迴版有 O(log n) 的呼叫堆疊;要 O(1) 空間就改成由下往上的迭代版'],
  approaches: [
    {
      name: '由上往下的合併排序(遞迴)',
      idea: '`sort(head)`:找中點切開、兩半遞迴排序、合併。',
      steps: ['0 或 1 個節點 → 直接回傳', '快慢指標找中點:`slow` 停在左半的最後一個,`mid = slow.next`、`slow.next = None`', '`left = sort(head)`、`right = sort(mid)`', '回傳 `merge(left, right)`'],
      figure: { title: `head = [${L}]`, steps: topFig() },
      complexity: { time: 'O(n log n)', space: 'O(log n)', why: 'log n 層,每層合併 O(n);遞迴深度 log n。' },
      verdict: '最推薦(好寫好懂)。注意找中點時 fast 從 head.next 開始,slow 才會停在左半的結尾。',
      code: {
        python: `def sortList(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next              # fast 先走一步:slow 停在左半結尾
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    mid, slow.next = slow.next, None          # 切成兩半
    left, right = sortList(head), sortList(mid)
    d = tail = ListNode()
    while left and right:                     # 合併兩條排好的串列
        if left.val <= right.val:
            tail.next, left = left, left.next
        else:
            tail.next, right = right, right.next
        tail = tail.next
    tail.next = left or right
    return d.next`,
        c: `static struct ListNode *mergeL(struct ListNode *a, struct ListNode *b) {
    struct ListNode d = {0, NULL}, *t = &d;
    while (a && b) {
        if (a->val <= b->val) { t->next = a; a = a->next; }
        else { t->next = b; b = b->next; }
        t = t->next;
    }
    t->next = a ? a : b;
    return d.next;
}

struct ListNode *sortList(struct ListNode *head) {
    if (!head || !head->next) return head;
    struct ListNode *slow = head, *fast = head->next;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    struct ListNode *mid = slow->next;
    slow->next = NULL;
    return mergeL(sortList(head), sortList(mid));
}`,
        cpp: `ListNode* mergeL(ListNode *a, ListNode *b) {
    ListNode d, *t = &d;
    while (a && b) {
        if (a->val <= b->val) { t->next = a; a = a->next; }
        else { t->next = b; b = b->next; }
        t = t->next;
    }
    t->next = a ? a : b;
    return d.next;
}

ListNode* sortList(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode *slow = head, *fast = head->next;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    ListNode *mid = slow->next;
    slow->next = nullptr;
    return mergeL(sortList(head), sortList(mid));
}`,
        java: `ListNode sortList(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode slow = head, fast = head.next;
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
    ListNode mid = slow.next;
    slow.next = null;
    return mergeL(sortList(head), sortList(mid));
}

private ListNode mergeL(ListNode a, ListNode b) {
    ListNode d = new ListNode(), t = d;
    while (a != null && b != null) {
        if (a.val <= b.val) { t.next = a; a = a.next; }
        else { t.next = b; b = b.next; }
        t = t.next;
    }
    t.next = a != null ? a : b;
    return d.next;
}`,
        javascript: `function sortList(head) {
  if (!head || !head.next) return head;
  let slow = head, fast = head.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const mid = slow.next;
  slow.next = null;
  let a = sortList(head), b = sortList(mid);
  const d = new ListNode();
  let t = d;
  while (a && b) {
    if (a.val <= b.val) {
      t.next = a;
      a = a.next;
    } else {
      t.next = b;
      b = b.next;
    }
    t = t.next;
  }
  t.next = a || b;
  return d.next;
}`,
      },
    },
    {
      name: '由下往上的合併排序(迭代)',
      idea: '`size = 1, 2, 4, …`:每輪從頭切出兩段長度 size 的串列、合併、接到結果尾巴。',
      steps: ['數出 n;`d.next = head`', '`for size = 1; size < n; size *= 2`:`prev = d`、`cur = d.next`', '切出 `left`(size 個)、`right`(size 個),`cur` 移到剩下的開頭', '`prev.next = merge(left, right)`,prev 走到合併後的尾巴'],
      figure: { title: `head = [${L}]`, steps: bottomFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '沒有遞迴,只用幾個指標。' },
      verdict: 'Follow-up 的答案。切段(split)的細節比較多,要小心處理不足 size 的尾段。',
      code: {
        python: `def sortList(head):
    def split(h, size):                       # 從 h 切下 size 個,回傳剩下的開頭
        for _ in range(size - 1):
            if not h:
                return None
            h = h.next
        if not h:
            return None
        rest, h.next = h.next, None
        return rest

    def merge(a, b, tail):                    # 合併後接在 tail 後面,回傳新的尾巴
        while a and b:
            if a.val <= b.val:
                tail.next, a = a, a.next
            else:
                tail.next, b = b, b.next
            tail = tail.next
        tail.next = a or b
        while tail.next:
            tail = tail.next
        return tail

    n, p = 0, head
    while p:
        n += 1
        p = p.next
    d = ListNode(0, head)
    size = 1
    while size < n:
        prev, cur = d, d.next
        while cur:
            left = cur
            right = split(left, size)
            cur = split(right, size)
            prev = merge(left, right, prev)
        size *= 2
    return d.next`,
        c: `static struct ListNode *splitL(struct ListNode *h, int size) {
    for (int i = 1; h && i < size; i++) h = h->next;
    if (!h) return NULL;
    struct ListNode *rest = h->next;
    h->next = NULL;
    return rest;
}

static struct ListNode *mergeTo(struct ListNode *a, struct ListNode *b, struct ListNode *tail) {
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    while (tail->next) tail = tail->next;
    return tail;
}

struct ListNode *sortList(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    struct ListNode d = {0, head};
    for (int size = 1; size < n; size *= 2) {
        struct ListNode *prev = &d, *cur = d.next;
        while (cur) {
            struct ListNode *left = cur, *right = splitL(left, size);
            cur = splitL(right, size);
            prev = mergeTo(left, right, prev);
        }
    }
    return d.next;
}`,
        cpp: `ListNode* splitL(ListNode *h, int size) {
    for (int i = 1; h && i < size; i++) h = h->next;
    if (!h) return nullptr;
    ListNode *rest = h->next;
    h->next = nullptr;
    return rest;
}

ListNode* mergeTo(ListNode *a, ListNode *b, ListNode *tail) {
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    while (tail->next) tail = tail->next;
    return tail;
}

ListNode* sortList(ListNode* head) {
    int n = 0;
    for (ListNode *p = head; p; p = p->next) n++;
    ListNode d(0, head);
    for (int size = 1; size < n; size *= 2) {
        ListNode *prev = &d, *cur = d.next;
        while (cur) {
            ListNode *left = cur, *right = splitL(left, size);
            cur = splitL(right, size);
            prev = mergeTo(left, right, prev);
        }
    }
    return d.next;
}`,
        java: `ListNode sortList(ListNode head) {
    int n = 0;
    for (ListNode p = head; p != null; p = p.next) n++;
    ListNode d = new ListNode(0, head);
    for (int size = 1; size < n; size *= 2) {
        ListNode prev = d, cur = d.next;
        while (cur != null) {
            ListNode left = cur, right = splitL(left, size);
            cur = splitL(right, size);
            prev = mergeTo(left, right, prev);
        }
    }
    return d.next;
}

private ListNode splitL(ListNode h, int size) {
    for (int i = 1; h != null && i < size; i++) h = h.next;
    if (h == null) return null;
    ListNode rest = h.next;
    h.next = null;
    return rest;
}

private ListNode mergeTo(ListNode a, ListNode b, ListNode tail) {
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = a != null ? a : b;
    while (tail.next != null) tail = tail.next;
    return tail;
}`,
        javascript: `function sortList(head) {
  const split = (h, size) => {
    for (let i = 1; h && i < size; i++) h = h.next;
    if (!h) return null;
    const rest = h.next;
    h.next = null;
    return rest;
  };
  const mergeTo = (a, b, tail) => {
    while (a && b) {
      if (a.val <= b.val) {
        tail.next = a;
        a = a.next;
      } else {
        tail.next = b;
        b = b.next;
      }
      tail = tail.next;
    }
    tail.next = a || b;
    while (tail.next) tail = tail.next;
    return tail;
  };
  let n = 0;
  for (let p = head; p; p = p.next) n++;
  const d = new ListNode(0, head);
  for (let size = 1; size < n; size *= 2) {
    let prev = d, cur = d.next;
    while (cur) {
      const left = cur, right = split(left, size);
      cur = split(right, size);
      prev = mergeTo(left, right, prev);
    }
  }
  return d.next;
}`,
      },
    },
  ],
  pitfalls: ['找中點時 fast 從 head 開始:兩個節點時 slow 會停在第二個,切不開,無限遞迴', '切開後忘了把左半的結尾 next 設成 null', '用陣列排序再寫回:能過但不是題目想考的'],
  check: {
    kind: 'fn',
    fn: 'sortList',
    argKinds: ['list'],
    ret: 'list',
    cases: [
      { args: [L], out: [1, 2, 3, 4] },
      { args: [[-1, 5, 3, 4, 0]], out: [-1, 0, 3, 4, 5] },
      { args: [[]], out: [] },
      { args: [[3, 3, 1, 2, 1]], out: [1, 1, 2, 3, 3] },
      { args: [[5, 4, 3, 2, 1, 0, -1]], out: [-1, 0, 1, 2, 3, 4, 5] },
    ],
  },
}
