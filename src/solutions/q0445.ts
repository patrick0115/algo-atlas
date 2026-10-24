import { chain } from './fig'
import type { Solution } from './types'

// 445. Add Two Numbers II
const A = [7, 2, 4, 3]
const B = [5, 6, 4]
const F = [
  { note: '鏈結串列高位在前：7→2→4→3 與 5→6→4。加法卻要從尾端個位數開始。', views: [chain(A, { label: 'l1', tail: true }), chain(B, { label: 'l2', tail: true })] },
  { note: '把兩條串列依序推入堆疊，彈出時先取得尾端的 3 與 4。', views: [chain([7, 2, 4, 3], { label: '堆疊 1' }), chain([5, 6, 4], { label: '堆疊 2' })] },
  { note: '3+4=7；接著 4+6=10，寫 0、進位 1；再算 2+5+1=8。', views: [chain([8, 0, 7], { label: '目前結果', cls: { 0: 'hl' } })] },
  { note: '最後彈出 7，加進位得 7；由頭部插入新節點，結果 7→8→0→7。', views: [chain([7, 8, 0, 7], { label: '答案', cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' }, tail: true })] },
]
const G = [
  { note: '先反轉兩條鏈，讓個位數站在前面：3→4→2→7 與 4→6→5。', views: [chain([3, 4, 2, 7], { label: '反轉 l1' }), chain([4, 6, 5], { label: '反轉 l2' })] },
  { note: '3+4=7，結果尾端接上 7。', views: [chain([7], { label: '反向結果', tail: true })] },
  { note: '4+6=10，接上 0 並進位 1；2+5+1=8。', views: [chain([7, 0, 8], { label: '反向結果', cls: { 2: 'hl' }, tail: true })] },
  { note: '7+進位=7，得到反向結果 7→0→8→7；反轉後是 7→8→0→7。', views: [chain([7, 8, 0, 7], { label: '答案', cls: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' }, tail: true })] },
]

export const q0445: Solution = {
  id: 445,
  plain: '兩個數字用鏈結串列表示，最高位在最前面；把它們相加並回傳同樣格式的串列。',
  statement: '`l1` 與 `l2` 的每個節點是一位數，高位在頭、低位在尾。求兩數之和，回傳高位在頭的新鏈結串列；輸入沒有前導零。',
  examples: [{ input: 'l1 = [7,2,4,3], l2 = [5,6,4]', output: '[7,8,0,7]' }, { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[8,0,7]' }],
  constraints: ['每條串列最多 100 個節點；最高位在前，不能直接從頭相加。'],
  insight: ['直式加法從尾端個位數開始；[[p:stack]] 能把先讀到的高位壓住，後讀到的低位先取出。', '若容許修改輸入，也能反轉鏈結串列後做一般加法。'],
  approaches: [
    {
      name: '兩個堆疊從低位取數',
      idea: '先把數位放入堆疊，從尾端彈出相加；新節點每次插到答案頭部。',
      steps: ['走過兩條串列，把數位分別放進堆疊。', '彈出兩個堆疊頂端與進位相加。', '餘數建新節點接到答案前面，更新進位。', '堆疊空且沒有進位時停止。'],
      figure: { title: 'l1 = 7→2→4→3, l2 = 5→6→4', steps: F },
      complexity: { time: 'O(m+n)', space: 'O(m+n)', why: '每個節點只進出堆疊一次，結果也有線性長度。' },
      verdict: '不修改輸入串列，是本題最常用寫法。',
      code: {
        python: `def addTwoNumbers(l1, l2):
    a, b = [], []
    while l1:
        a.append(l1.val)
        l1 = l1.next
    while l2:
        b.append(l2.val)
        l2 = l2.next
    carry = 0
    head = None
    while a or b or carry:
        total = carry + (a.pop() if a else 0) + (b.pop() if b else 0)  # 從個位數開始
        carry, digit = divmod(total, 10)
        head = ListNode(digit, head)  # 新數位插到最前面
    return head`,
        c: `struct ListNode *addTwoNumbers(struct ListNode *l1, struct ListNode *l2) {
    int a[101], b[101], na = 0, nb = 0;
    for (struct ListNode *p = l1; p; p = p->next) a[na++] = p->val;
    for (struct ListNode *p = l2; p; p = p->next) b[nb++] = p->val;
    int carry = 0;
    struct ListNode *head = NULL;
    while (na || nb || carry) {
        int total = carry;
        if (na) total += a[--na];
        if (nb) total += b[--nb];
        carry = total / 10;
        struct ListNode *node = malloc(sizeof(struct ListNode));
        node->val = total % 10;
        node->next = head;
        head = node;
    }
    return head;
}`,
        cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    vector<int> a, b;
    for (ListNode* p = l1; p; p = p->next) a.push_back(p->val);
    for (ListNode* p = l2; p; p = p->next) b.push_back(p->val);
    int carry = 0;
    ListNode* head = nullptr;
    while (!a.empty() || !b.empty() || carry) {
        int total = carry;
        if (!a.empty()) {
            total += a.back();
            a.pop_back();
        }
        if (!b.empty()) {
            total += b.back();
            b.pop_back();
        }
        carry = total / 10;
        head = new ListNode(total % 10, head);
    }
    return head;
}`,
        java: `ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    Deque<Integer> a = new ArrayDeque<>(), b = new ArrayDeque<>();
    for (ListNode p = l1; p != null; p = p.next) a.push(p.val);
    for (ListNode p = l2; p != null; p = p.next) b.push(p.val);
    int carry = 0;
    ListNode head = null;
    while (!a.isEmpty() || !b.isEmpty() || carry != 0) {
        int total = carry;
        if (!a.isEmpty()) total += a.pop();
        if (!b.isEmpty()) total += b.pop();
        carry = total / 10;
        ListNode node = new ListNode(total % 10);
        node.next = head;
        head = node;
    }
    return head;
}`,
        javascript: `function addTwoNumbers(l1, l2) {
  const a = [], b = [];
  for (let p = l1; p; p = p.next) a.push(p.val);
  for (let p = l2; p; p = p.next) b.push(p.val);
  let carry = 0, head = null;
  while (a.length || b.length || carry) {
    const total = carry + (a.pop() || 0) + (b.pop() || 0);
    carry = Math.floor(total / 10);
    head = new ListNode(total % 10, head);
  }
  return head;
}`,
      },
    },
    {
      name: '反轉後做一般直式加法',
      idea: '反轉輸入讓低位在前，相加時把結果接在尾端；最後再反轉答案。',
      steps: ['反轉 l1、l2。', '從新頭部起逐位相加並處理進位。', '結果低位在前，再反轉成高位在前。'],
      figure: { title: 'l1 = 7→2→4→3, l2 = 5→6→4', steps: G },
      complexity: { time: 'O(m+n)', space: 'O(1) 額外空間', why: '反轉指標只用常數暫存；輸出節點不算額外空間。' },
      verdict: '省輔助空間，但會改動輸入串列；實務上若需保留輸入，選堆疊版。',
      code: {
        python: `def addTwoNumbers(l1, l2):
    def reverse(head):
        previous = None
        while head:
            following = head.next
            head.next = previous       # 指標反向
            previous, head = head, following
        return previous

    a, b = reverse(l1), reverse(l2)
    dummy = ListNode()
    tail = dummy
    carry = 0
    while a or b or carry:
        total = carry
        if a:
            total += a.val
            a = a.next
        if b:
            total += b.val
            b = b.next
        carry, digit = divmod(total, 10)
        tail.next = ListNode(digit)
        tail = tail.next
    return reverse(dummy.next)`,
        c: `static struct ListNode *reverse445(struct ListNode *head) {
    struct ListNode *previous = NULL;
    while (head) {
        struct ListNode *following = head->next;
        head->next = previous;
        previous = head;
        head = following;
    }
    return previous;
}

struct ListNode *addTwoNumbers(struct ListNode *l1, struct ListNode *l2) {
    struct ListNode *a = reverse445(l1), *b = reverse445(l2);
    struct ListNode dummy = {0, NULL}, *tail = &dummy;
    int carry = 0;
    while (a || b || carry) {
        int total = carry;
        if (a) {
            total += a->val;
            a = a->next;
        }
        if (b) {
            total += b->val;
            b = b->next;
        }
        carry = total / 10;
        tail->next = malloc(sizeof(struct ListNode));
        tail = tail->next;
        tail->val = total % 10;
        tail->next = NULL;
    }
    return reverse445(dummy.next);
}`,
        cpp: `ListNode* reverse445(ListNode* head) {
    ListNode* previous = nullptr;
    while (head) {
        ListNode* following = head->next;
        head->next = previous;
        previous = head;
        head = following;
    }
    return previous;
}

ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode* a = reverse445(l1);
    ListNode* b = reverse445(l2);
    ListNode dummy;
    ListNode* tail = &dummy;
    int carry = 0;
    while (a || b || carry) {
        int total = carry;
        if (a) {
            total += a->val;
            a = a->next;
        }
        if (b) {
            total += b->val;
            b = b->next;
        }
        carry = total / 10;
        tail->next = new ListNode(total % 10);
        tail = tail->next;
    }
    return reverse445(dummy.next);
}`,
        java: `ListNode reverse445(ListNode head) {
    ListNode previous = null;
    while (head != null) {
        ListNode following = head.next;
        head.next = previous;
        previous = head;
        head = following;
    }
    return previous;
}

ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode a = reverse445(l1), b = reverse445(l2);
    ListNode dummy = new ListNode();
    ListNode tail = dummy;
    int carry = 0;
    while (a != null || b != null || carry != 0) {
        int total = carry;
        if (a != null) {
            total += a.val;
            a = a.next;
        }
        if (b != null) {
            total += b.val;
            b = b.next;
        }
        carry = total / 10;
        tail.next = new ListNode(total % 10);
        tail = tail.next;
    }
    return reverse445(dummy.next);
}`,
        javascript: `function addTwoNumbers(l1, l2) {
  function reverse(head) {
    let previous = null;
    while (head) {
      const following = head.next;
      head.next = previous;
      previous = head;
      head = following;
    }
    return previous;
  }
  let a = reverse(l1), b = reverse(l2), carry = 0;
  const dummy = new ListNode();
  let tail = dummy;
  while (a || b || carry) {
    let total = carry;
    if (a) {
      total += a.val;
      a = a.next;
    }
    if (b) {
      total += b.val;
      b = b.next;
    }
    carry = Math.floor(total / 10);
    tail.next = new ListNode(total % 10);
    tail = tail.next;
  }
  return reverse(dummy.next);
}`,
      },
    },
  ],
  pitfalls: ['最高位在前，不可從頭直接逐位加。', '最後可能還有進位，例如 9+9=18，需要新增一位。'],
  check: { kind: 'fn', fn: 'addTwoNumbers', argKinds: ['list', 'list'], ret: 'list', cases: [
    { args: [A, B], out: [7, 8, 0, 7] }, { args: [[2, 4, 3], [5, 6, 4]], out: [8, 0, 7] },
    { args: [[9, 9], [1]], out: [1, 0, 0] }, { args: [[0], [0]], out: [0] },
  ] },
}
