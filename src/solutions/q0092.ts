import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 92. Reverse Linked List II

const L = [1, 2, 3, 4, 5]
const LEFT = 2
const RIGHT = 4

function insertFig(): FigStep[] {
  return [
    { note: `只反轉第 ${LEFT} 到第 ${RIGHT} 個。先加假頭,prev 走到第 ${LEFT} 個的前一個(值 1),cur = 第 ${LEFT} 個(值 2)`, views: [chain(['d', ...L], { cls: { 1: 'cur', 2: 'hl' }, subs: { 1: 'prev', 2: 'cur' } })] },
    { note: '「頭插法」:每次把 cur 後面那個節點(3)拔出來,插到 prev 的後面。1 → 3 → 2 → 4 → 5', views: [chain(['d', 1, 3, 2, 4, 5], { cls: { 1: 'cur', 2: 'hl', 3: 'hl' }, subs: { 1: 'prev', 3: 'cur' } })] },
    { note: '再把 cur 後面的 4 拔出來插到 prev 後面:1 → 4 → 3 → 2 → 5。總共做 right − left = 2 次', views: [chain(['d', 1, 4, 3, 2, 5], { cls: { 2: 'hl', 3: 'hl', 4: 'hl' } })] },
    { note: '回傳 d.next → [1, 4, 3, 2, 5]。cur(值 2)一直沒動,它最後變成反轉段的尾巴', views: [chain([1, 4, 3, 2, 5], { tail: true, cls: { 1: 'done', 2: 'done', 3: 'done' } })] },
  ]
}

function arrFig(): FigStep[] {
  return [
    { note: '簡單的作法:把值抄進陣列,反轉索引 left−1..right−1 這一段', views: [arr(L, { label: '值', range: [LEFT - 1, RIGHT - 1] })] },
    { note: '再依序寫回節點。O(n) 額外空間,而且是改值不是改節點(有些面試會要求不能改值)', views: [arr([1, 4, 3, 2, 5], { label: '反轉後', highlight: [1, 2, 3] })] },
  ]
}

export const q0092: Solution = {
  id: 92,
  plain: '一條串列,只把「第 left 個到第 right 個」這一段反過來,其他部分不動。例如 [1,2,3,4,5] 反轉第 2 到 4 個 → [1,4,3,2,5]。',
  statement: '給串列的頭 `head` 和兩個整數 `left ≤ right`,反轉從位置 left 到位置 right 的節點(1 起算),回傳反轉後的串列。Follow-up:一次走訪完成。',
  examples: [
    { input: 'head = [1,2,3,4,5], left = 2, right = 4', output: '[1,4,3,2,5]' },
    { input: 'head = [5], left = 1, right = 1', output: '[5]' },
  ],
  constraints: ['節點數 ≤ 500', '1 ≤ left ≤ right ≤ n'],
  insight: ['left 可能是 1(反轉從頭開始)→ 假頭', '找到反轉段的前一個節點 prev,和段裡的第一個 cur', '頭插法:把 cur 後面的節點一個一個拔出來插到 prev 後面,做 right − left 次'],
  approaches: [
    {
      name: '假頭 + 頭插法(一次走訪)',
      idea: 'prev 走 left − 1 步,`cur = prev.next`;重複 right − left 次:`nxt = cur.next`,把 nxt 拔出來插到 prev 後面。',
      steps: ['`d = ListNode(0, head)`;prev 走到第 left − 1 個', '`cur = prev.next`', '重複 right − left 次:`nxt = cur.next`;`cur.next = nxt.next`;`nxt.next = prev.next`;`prev.next = nxt`', '回傳 `d.next`'],
      figure: { title: `head = [${L}],left = ${LEFT},right = ${RIGHT}`, steps: insertFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走到 left 再做 right − left 次插入。' },
      verdict: '最推薦(Follow-up 的答案)。頭插法比「切出來、反轉、接回去」少處理很多邊界。',
      code: {
        python: `def reverseBetween(head, left, right):
    d = ListNode(0, head)
    prev = d
    for _ in range(left - 1):
        prev = prev.next                      # 反轉段的前一個
    cur = prev.next                           # 反轉段的第一個(最後會變成尾巴)
    for _ in range(right - left):
        nxt = cur.next
        cur.next = nxt.next                   # 把 nxt 拔出來
        nxt.next = prev.next                  # 插到 prev 後面
        prev.next = nxt
    return d.next`,
        c: `struct ListNode *reverseBetween(struct ListNode *head, int left, int right) {
    struct ListNode d = {0, head}, *prev = &d;
    for (int i = 1; i < left; i++) prev = prev->next;
    struct ListNode *cur = prev->next;
    for (int i = 0; i < right - left; i++) {
        struct ListNode *nxt = cur->next;
        cur->next = nxt->next;
        nxt->next = prev->next;
        prev->next = nxt;
    }
    return d.next;
}`,
        cpp: `ListNode* reverseBetween(ListNode* head, int left, int right) {
    ListNode d(0, head), *prev = &d;
    for (int i = 1; i < left; i++) prev = prev->next;
    ListNode *cur = prev->next;
    for (int i = 0; i < right - left; i++) {
        ListNode *nxt = cur->next;
        cur->next = nxt->next;
        nxt->next = prev->next;
        prev->next = nxt;
    }
    return d.next;
}`,
        java: `ListNode reverseBetween(ListNode head, int left, int right) {
    ListNode d = new ListNode(0, head), prev = d;
    for (int i = 1; i < left; i++) prev = prev.next;
    ListNode cur = prev.next;
    for (int i = 0; i < right - left; i++) {
        ListNode nxt = cur.next;
        cur.next = nxt.next;
        nxt.next = prev.next;
        prev.next = nxt;
    }
    return d.next;
}`,
        javascript: `function reverseBetween(head, left, right) {
  const d = new ListNode(0, head);
  let prev = d;
  for (let i = 1; i < left; i++) prev = prev.next;
  const cur = prev.next;
  for (let i = 0; i < right - left; i++) {
    const nxt = cur.next;
    cur.next = nxt.next;
    nxt.next = prev.next;
    prev.next = nxt;
  }
  return d.next;
}`,
      },
    },
    {
      name: '抄值、反轉陣列段、寫回',
      idea: '值放進陣列,反轉 `[left−1, right−1]`,再寫回節點。',
      steps: ['走一遍收集值', '`vals[left−1 : right] = reversed(...)`', '再走一遍寫回'],
      figure: { title: `head = [${L}],left = ${LEFT},right = ${RIGHT}`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個陣列。' },
      verdict: '不容易出錯,但修改的是值而不是節點,也多用了空間。',
      code: {
        python: `def reverseBetween(head, left, right):
    vals, p = [], head
    while p:
        vals.append(p.val)
        p = p.next
    vals[left - 1:right] = vals[left - 1:right][::-1]
    p = head
    for v in vals:
        p.val = v
        p = p.next
    return head`,
        c: `struct ListNode *reverseBetween(struct ListNode *head, int left, int right) {
    int v[500], n = 0;
    for (struct ListNode *p = head; p; p = p->next) v[n++] = p->val;
    for (int i = left - 1, j = right - 1; i < j; i++, j--) { int t = v[i]; v[i] = v[j]; v[j] = t; }
    n = 0;
    for (struct ListNode *p = head; p; p = p->next) p->val = v[n++];
    return head;
}`,
        cpp: `ListNode* reverseBetween(ListNode* head, int left, int right) {
    vector<int> v;
    for (ListNode *p = head; p; p = p->next) v.push_back(p->val);
    reverse(v.begin() + left - 1, v.begin() + right);
    int i = 0;
    for (ListNode *p = head; p; p = p->next) p->val = v[i++];
    return head;
}`,
        java: `ListNode reverseBetween(ListNode head, int left, int right) {
    List<Integer> v = new ArrayList<>();
    for (ListNode p = head; p != null; p = p.next) v.add(p.val);
    Collections.reverse(v.subList(left - 1, right));
    int i = 0;
    for (ListNode p = head; p != null; p = p.next) p.val = v.get(i++);
    return head;
}`,
        javascript: `function reverseBetween(head, left, right) {
  const v = [];
  for (let p = head; p; p = p.next) v.push(p.val);
  const mid = v.slice(left - 1, right).reverse();
  v.splice(left - 1, mid.length, ...mid);
  let i = 0;
  for (let p = head; p; p = p.next) p.val = v[i++];
  return head;
}`,
      },
    },
  ],
  pitfalls: ['沒有假頭:left = 1 時找不到「前一個」,頭會改變', '頭插法的四行順序寫錯會斷鏈;先存 nxt,再一條一條改'],
  check: {
    kind: 'fn',
    fn: 'reverseBetween',
    argKinds: ['list', null, null],
    ret: 'list',
    cases: [
      { args: [L, LEFT, RIGHT], out: [1, 4, 3, 2, 5] },
      { args: [[5], 1, 1], out: [5] },
      { args: [[3, 5], 1, 2], out: [5, 3] },
      { args: [[1, 2, 3, 4, 5], 1, 5], out: [5, 4, 3, 2, 1] },
      { args: [[1, 2, 3], 3, 3], out: [1, 2, 3] },
    ],
  },
}
