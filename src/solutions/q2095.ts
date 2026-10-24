import { chain } from './fig'
import type { FigStep, Solution } from './types'

const V = [1, 3, 4, 7, 1, 2, 6]
const lengthFig: FigStep[] = [
  { note: '先走完整條串列，長度是 7；中間索引為 floor(7/2)=3。', views: [chain(V, { label: '原串列' })] },
  { note: '第二次從頭走到索引 2 的節點 4，它是中間節點 7 的前一個。', views: [chain(V, { label: '找前一個節點', cls: { 2: 'hl', 3: 'dim' } })] },
  { note: '讓 4.next 指向 7.next，也就是後面的 1，跳過 7。', views: [chain([1, 3, 4, 1, 2, 6], { label: '重新接邊', cls: { 2: 'hl', 3: 'hl' } })] },
  { note: '回傳原本頭節點，得到 [1,3,4,1,2,6]。若長度為 1，刪除後回傳空。', views: [chain([1, 3, 4, 1, 2, 6], { label: '結果' })] },
]
const fastFig: FigStep[] = [
  { note: 'slow、fast 從頭出發；prev 記住 slow 的前一個節點。', views: [chain(V, { label: '起點', cls: { 0: 'hl' } })] },
  { note: '每回合 slow 走一步，fast 走兩步；第一回合 slow 到 3、fast 到 4。', views: [chain(V, { label: '第一回合', cls: { 1: 'hl', 2: 'cur' } })] },
  { note: '再走兩回合，fast 到尾端 6，slow 到中間的 7，prev 是 4。', views: [chain(V, { label: '第三回合', cls: { 2: 'done', 3: 'hl', 6: 'cur' } })] },
  { note: 'fast 不能再走兩步，令 prev.next = slow.next，刪掉中間節點。', views: [chain([1, 3, 4, 1, 2, 6], { label: '結果' })] },
]

export const q2095: Solution = {
  id: 2095,
  plain: '刪掉單向鏈結串列的中間節點，再回傳頭節點。',
  statement: '長度為 n 的串列，中間節點索引為 floor(n/2)（從 0 開始）；若有兩個中央節點，刪後面那個。',
  examples: [
    { input: 'head = [1,3,4,7,1,2,6]', output: '[1,3,4,1,2,6]' },
    { input: 'head = [1,2,3,4]', output: '[1,2,4]' },
    { input: 'head = [2,1]', output: '[2]' },
  ],
  constraints: ['1 ≤ 節點數 ≤ 10⁵', '1 ≤ Node.val ≤ 10⁵'],
  insight: ['刪除單向串列節點時，需要找到它的前一個節點。', '先數長度可直接定位 floor(n/2)。', '快慢指標能在一趟掃描中找到中間節點。'],
  approaches: [
    {
      name: '先算長度，再找前驅',
      idea: '第一趟數節點，第二趟走到中間節點的前一個，再跳過中間節點。',
      steps: ['若只有一節點，回傳空', '走一趟計算 n', '再走到索引 floor(n/2)−1', '把 prev.next 改為 prev.next.next'],
      figure: { title: 'head = [1,3,4,7,1,2,6]', steps: lengthFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最多走兩趟串列。' },
      verdict: '定位方式清楚，適合初學 [[p:linked-list]]。',
      code: {
        python: `def deleteMiddle(head):
    if not head.next:
        return None                     # 唯一節點被刪光
    size = 0
    cur = head
    while cur:
        size += 1
        cur = cur.next
    prev = head
    for _ in range(size // 2 - 1):
        prev = prev.next               # 走到中間節點的前一個
    prev.next = prev.next.next
    return head`,
        c: `struct ListNode *deleteMiddle(struct ListNode *head) {
    if (!head->next) {
        return NULL;
    }
    int size = 0;
    struct ListNode *cur = head;
    while (cur) {
        size++;
        cur = cur->next;
    }
    struct ListNode *prev = head;
    for (int i = 0; i < size / 2 - 1; i++) {
        prev = prev->next;
    }
    prev->next = prev->next->next;
    return head;
}`,
        cpp: `ListNode* deleteMiddle(ListNode* head) {
    if (!head->next) {
        return nullptr;
    }
    int size = 0;
    for (ListNode* cur = head; cur; cur = cur->next) {
        size++;
    }
    ListNode* prev = head;
    for (int i = 0; i < size / 2 - 1; i++) {
        prev = prev->next;
    }
    prev->next = prev->next->next;
    return head;
}`,
        java: `ListNode deleteMiddle(ListNode head) {
    if (head.next == null) {
        return null;
    }
    int size = 0;
    for (ListNode cur = head; cur != null; cur = cur.next) {
        size++;
    }
    ListNode prev = head;
    for (int i = 0; i < size / 2 - 1; i++) {
        prev = prev.next;
    }
    prev.next = prev.next.next;
    return head;
}`,
        javascript: `function deleteMiddle(head) {
  if (!head.next) {
    return null;
  }
  let size = 0;
  for (let cur = head; cur; cur = cur.next) {
    size++;
  }
  let prev = head;
  for (let i = 0; i < Math.floor(size / 2) - 1; i++) {
    prev = prev.next;
  }
  prev.next = prev.next.next;
  return head;
}`,
      },
    },
    {
      name: '快慢指標一趟定位',
      idea: 'slow 一步、fast 兩步，fast 到尾端時 slow 正在中間；prev 留在 slow 前面。',
      steps: ['若只有一節點，回傳空', '設 slow=fast=head、prev=null', 'fast 每次兩步，slow 每次一步，先把 prev 設為 slow', '迴圈結束後令 prev.next=slow.next'],
      figure: { title: 'head = [1,3,4,7,1,2,6]', steps: fastFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只需一次走訪與三個指標。' },
      verdict: '經典 [[p:fast-slow]]；偶數長度會自然停在後面的中央節點。',
      code: {
        python: `def deleteMiddle(head):
    if not head.next:
        return None
    slow = fast = head
    prev = None
    while fast and fast.next:
        prev = slow                    # 留住中間節點的前驅
        slow = slow.next
        fast = fast.next.next
    prev.next = slow.next              # 跳過 slow
    return head`,
        c: `struct ListNode *deleteMiddle(struct ListNode *head) {
    if (!head->next) {
        return NULL;
    }
    struct ListNode *slow = head;
    struct ListNode *fast = head;
    struct ListNode *prev = NULL;
    while (fast && fast->next) {
        prev = slow;
        slow = slow->next;
        fast = fast->next->next;
    }
    prev->next = slow->next;
    return head;
}`,
        cpp: `ListNode* deleteMiddle(ListNode* head) {
    if (!head->next) {
        return nullptr;
    }
    ListNode* slow = head;
    ListNode* fast = head;
    ListNode* prev = nullptr;
    while (fast && fast->next) {
        prev = slow;
        slow = slow->next;
        fast = fast->next->next;
    }
    prev->next = slow->next;
    return head;
}`,
        java: `ListNode deleteMiddle(ListNode head) {
    if (head.next == null) {
        return null;
    }
    ListNode slow = head;
    ListNode fast = head;
    ListNode prev = null;
    while (fast != null && fast.next != null) {
        prev = slow;
        slow = slow.next;
        fast = fast.next.next;
    }
    prev.next = slow.next;
    return head;
}`,
        javascript: `function deleteMiddle(head) {
  if (!head.next) {
    return null;
  }
  let slow = head;
  let fast = head;
  let prev = null;
  while (fast && fast.next) {
    prev = slow;
    slow = slow.next;
    fast = fast.next.next;
  }
  prev.next = slow.next;
  return head;
}`,
      },
    },
  ],
  pitfalls: ['長度為 1 時刪完應回傳空。', '偶數長度時要刪較後面的中央節點。', '單向串列必須保留前驅才能改接 next。'],
  check: { kind: 'fn', fn: 'deleteMiddle', argKinds: ['list'], ret: 'list', cases: [
    { args: [V], out: [1, 3, 4, 1, 2, 6] },
    { args: [[1, 2, 3, 4]], out: [1, 2, 4] },
    { args: [[2, 1]], out: [2] },
    { args: [[1]], out: [] },
  ] },
}
