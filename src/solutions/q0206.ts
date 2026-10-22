import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { chain } from './fig'

// 206. Reverse Linked List

const V = [1, 2, 3, 4]

function iterFig(): FigStep[] {
  const n = V.length
  // next[i] = 節點 i 目前指向誰(-1 = 右邊的 null,-2 = 左邊的 null)
  const next = V.map((_, i) => (i + 1 < n ? i + 1 : -1))
  const draw = (prev: number, cur: number, nxt: number | undefined, note: string): FigStep => {
    const subs: Record<number, string> = {}
    const add = (i: number, name: string) => {
      subs[i] = subs[i] ? `${subs[i]},${name}` : name
    }
    add(prev === -1 ? -2 : prev, 'prev')
    add(cur, 'cur')
    if (nxt !== undefined) add(nxt, 'next')
    return {
      note,
      views: [
        chain(V, {
          label: '串列(節點下方是指標名稱,∅ 是 null)',
          edges: next.map((t, i) => [i, t, t === -2 || (t >= 0 && t < i) ? 'done' : undefined] as [number, number, string?]),
          subs,
          cls: cur >= 0 ? { [cur]: 'hl' } : {},
        }),
      ],
    }
  }
  const out: FigStep[] = [draw(-1, 0, undefined, '三個指標:prev(已經反轉好那段的頭,一開始是 null)、cur(正在處理的節點)、next(先記住 cur 原本的下一個,不然改完箭頭就找不到了)')]
  let prev = -1
  let cur = 0
  while (cur !== -1) {
    const nxt = next[cur]
    out.push(draw(prev, cur, nxt === -1 ? -1 : nxt, `① 先記住 next = cur.next(${nxt === -1 ? 'null' : V[nxt]})`))
    next[cur] = prev === -1 ? -2 : prev
    out.push(draw(prev, cur, nxt === -1 ? -1 : nxt, `② 把 cur(${V[cur]})的箭頭改成指向 prev(${prev === -1 ? 'null' : V[prev]})`))
    prev = cur
    cur = nxt
    out.push(draw(prev, cur, undefined, `③ prev、cur 都往前一步:prev = ${V[prev]},cur = ${cur === -1 ? 'null' : V[cur]}`))
  }
  out.push({ note: `cur 走到 null,全部箭頭都反過來了。新的頭是 prev(${V[prev]})`, views: [chain([...V].reverse(), { label: '反轉後', tail: true })] })
  return out
}

function recurFig(): FigStep[] {
  const out: FigStep[] = [{ note: '遞迴的想法:先把「head 後面那一整段」反轉好,再把 head 接到那段的尾巴', views: [chain(V, { label: '原本', tail: true, cls: { 0: 'hl' } })] }]
  for (let d = 0; d < V.length; d++)
    out.push({ note: `reverse(${V[d]}):${d < V.length - 1 ? `先遞迴去反轉從 ${V[d + 1]} 開始的那段` : '只剩一個節點(下一個是 null)→ 它自己就是反轉後的頭,直接回傳'}`, views: [chain(V, { label: '遞迴往下', tail: true, cls: { [d]: 'hl' }, subs: { [d]: `第 ${d + 1} 層` } })] })
  const n = V.length
  const next = V.map((_, i) => (i + 1 < n ? i + 1 : -1))
  for (let d = n - 2; d >= 0; d--) {
    next[d + 1] = d
    next[d] = -2
    out.push({
      note: `回到 reverse(${V[d]}):後面那段已經反轉好(頭是 ${V[n - 1]})。head.next 就是那段的尾巴 ${V[d + 1]},讓它指回 head:head.next.next = head;再把 head.next 設成 null`,
      views: [chain(V, { label: '往上回傳', edges: next.map((t, i) => [i, t, t === -2 || (t >= 0 && t < i) ? 'done' : undefined] as [number, number, string?]), cls: { [d]: 'hl', [n - 1]: 'done' }, subs: { [n - 1]: '新的頭' } })],
    })
  }
  out.push({ note: '每一層都回傳同一個「新的頭」(原本的最後一個節點)', views: [arr([...V].reverse(), { label: '結果' })] })
  return out
}

export const q0206: Solution = {
  id: 206,
  plain: '把一條鏈子的方向整個倒過來:原本 1 → 2 → 3,變成 3 → 2 → 1。就像一排人原本每個人都指著前面的人,現在全部轉身改指後面的人。',
  statement: '給單向鏈結串列的頭節點 `head`,把整個串列反轉,回傳反轉後的頭節點。',
  examples: [
    { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
    { input: 'head = [1,2]', output: '[2,1]' },
    { input: 'head = []', output: '[]' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 5000` → 可能是空串列', '遞迴深度 5000 在大部分語言都還可以'],
  insight: [
    '鏈結串列的每個節點只知道「下一個是誰」(`next`)。反轉 = 把每個節點的 `next` 改成指向**前一個**',
    '難點:改掉 `cur.next` 之後就找不到原本的下一個了 → 改之前要先用一個變數存起來',
    '所以需要三個指標:`prev`(前一個)、`cur`(現在這個)、`next`(先存好的下一個)',
    '也可以遞迴:「反轉 head 後面那段」是一個更小的同樣問題,反轉完再把 head 接到尾巴',
  ],
  approaches: [
    {
      name: '迭代:三個指標',
      idea: '從頭走到尾,每走到一個節點,就把它的箭頭從「指向下一個」改成「指向上一個」。',
      steps: ['`prev = null`、`cur = head`', '`next = cur.next`(先存起來)', '`cur.next = prev`(箭頭反過來)', '`prev = cur`、`cur = next`(往前走一步)', '`cur` 是 null 時,`prev` 就是新的頭'],
      figure: { title: 'head = [1,2,3,4]', steps: iterFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個節點只改一次箭頭,只用三個指標變數。' },
      verdict: '標準解,一定要背熟。很多鏈結串列題都會用到「反轉一段」:[143. Reorder List](#/q/143)、[25. Reverse Nodes in k-Group](#/q/25)、234. Palindrome Linked List。',
      code: {
        python: `def reverseList(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next          # ① 先記住下一個
        cur.next = prev         # ② 箭頭反過來
        prev, cur = cur, nxt    # ③ 往前走一步
    return prev                 # cur 走到 None 時,prev 是新的頭`,
        c: `struct ListNode *reverseList(struct ListNode *head) {
    struct ListNode *prev = NULL, *cur = head;
    while (cur) {
        struct ListNode *next = cur->next;   // ① 先記住下一個
        cur->next = prev;                    // ② 箭頭反過來
        prev = cur;                          // ③ 往前走一步
        cur = next;
    }
    return prev;
}`,
        cpp: `ListNode* reverseList(ListNode* head) {
    ListNode *prev = nullptr, *cur = head;
    while (cur) {
        ListNode* next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}`,
        java: `ListNode reverseList(ListNode head) {
    ListNode prev = null, cur = head;
    while (cur != null) {
        ListNode next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}`,
        javascript: `function reverseList(head) {
  let prev = null, cur = head;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}`,
      },
    },
    {
      name: '遞迴',
      idea: '`reverseList(head)` = 先反轉 `head.next` 開始的那段(得到新的頭),再讓那段的尾巴(就是原本的 `head.next`)指回 `head`,最後 `head.next = null`。',
      steps: ['空的或只剩一個 → 直接回傳 `head`', '`newHead = reverseList(head.next)`', '`head.next.next = head`(原本的下一個,現在指回我)', '`head.next = null`', '回傳 `newHead`'],
      figure: { title: 'head = [1,2,3,4]', steps: recurFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個節點處理一次;遞迴深度是 n,呼叫堆疊要 O(n) 空間。' },
      verdict: '程式短,能練習「相信遞迴會把子問題做好」的思考方式。但多用 O(n) 的堆疊空間,串列很長時可能堆疊溢位,實務上用迭代版。',
      code: {
        python: `def reverseList(head):
    if head is None or head.next is None:
        return head
    new_head = reverseList(head.next)     # 後面那段先反轉好
    head.next.next = head                 # 原本的下一個,現在指回我
    head.next = None
    return new_head`,
        c: `struct ListNode *reverseList(struct ListNode *head) {
    if (!head || !head->next) return head;
    struct ListNode *newHead = reverseList(head->next);
    head->next->next = head;
    head->next = NULL;
    return newHead;
}`,
        cpp: `ListNode* reverseList(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode* newHead = reverseList(head->next);
    head->next->next = head;
    head->next = nullptr;
    return newHead;
}`,
        java: `ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}`,
        javascript: `function reverseList(head) {
  if (!head || !head.next) return head;
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}`,
      },
    },
    {
      name: '先存進陣列,再重新串起來',
      idea: '把所有節點依序放進陣列,再從陣列尾巴往回,把每個節點的 `next` 接到前一個。',
      steps: ['走一遍,把節點放進 `nodes`', '從最後一個往前:`nodes[i].next = nodes[i − 1]`', '`nodes[0].next = null`,回傳 `nodes[-1]`'],
      figure: {
        title: 'head = [1,2,3,4]',
        steps: [
          { note: '先走一遍,把每個節點的「地址」依序存進陣列', views: [chain(V, { tail: true }), arr(V.map((v) => `節點${v}`), { label: 'nodes' })] },
          { note: '從陣列尾巴往前,一個一個把 next 接到前一格的節點', views: [arr(V.map((v) => `節點${v}`).reverse(), { label: '倒過來接' })] },
          { note: '完成:4 → 3 → 2 → 1 → null', views: [chain([...V].reverse(), { tail: true })] },
        ],
      },
      complexity: { time: 'O(n)', space: 'O(n)', why: '走兩遍;陣列存 n 個節點。' },
      verdict: '最好想(不用一邊走一邊改),適合剛學鏈結串列時確認自己懂。但多用 O(n) 空間,面試官通常會要求改成方法一。',
      code: {
        python: `def reverseList(head):
    nodes = []
    while head:
        nodes.append(head)
        head = head.next
    if not nodes:
        return None
    for i in range(len(nodes) - 1, 0, -1):
        nodes[i].next = nodes[i - 1]
    nodes[0].next = None
    return nodes[-1]`,
        c: `struct ListNode *reverseList(struct ListNode *head) {
    int n = 0, cap = 16;
    struct ListNode **nodes = malloc(cap * sizeof(*nodes));
    for (; head; head = head->next) {
        if (n == cap) nodes = realloc(nodes, (cap *= 2) * sizeof(*nodes));
        nodes[n++] = head;
    }
    if (n == 0) { free(nodes); return NULL; }
    for (int i = n - 1; i > 0; i--) nodes[i]->next = nodes[i - 1];
    nodes[0]->next = NULL;
    struct ListNode *res = nodes[n - 1];
    free(nodes);
    return res;
}`,
        cpp: `ListNode* reverseList(ListNode* head) {
    vector<ListNode*> nodes;
    for (; head; head = head->next) nodes.push_back(head);
    if (nodes.empty()) return nullptr;
    for (int i = (int)nodes.size() - 1; i > 0; i--) nodes[i]->next = nodes[i - 1];
    nodes[0]->next = nullptr;
    return nodes.back();
}`,
        java: `ListNode reverseList(ListNode head) {
    List<ListNode> nodes = new ArrayList<>();
    for (; head != null; head = head.next) nodes.add(head);
    if (nodes.isEmpty()) return null;
    for (int i = nodes.size() - 1; i > 0; i--) nodes.get(i).next = nodes.get(i - 1);
    nodes.get(0).next = null;
    return nodes.get(nodes.size() - 1);
}`,
        javascript: `function reverseList(head) {
  const nodes = [];
  for (; head; head = head.next) nodes.push(head);
  if (!nodes.length) return null;
  for (let i = nodes.length - 1; i > 0; i--) nodes[i].next = nodes[i - 1];
  nodes[0].next = null;
  return nodes[nodes.length - 1];
}`,
      },
    },
  ],
  pitfalls: [
    '沒先存 `next` 就改 `cur.next`:後面整段就「斷掉」找不回來了',
    '回傳 `cur` 而不是 `prev`:迴圈結束時 `cur` 是 null',
    '遞迴版忘了 `head.next = null`:原本的頭(反轉後的尾巴)還指著第二個節點,形成環',
    '空串列 `head = null` 要能正常回傳 null',
  ],
  followUp: [
    { q: '只反轉第 left 到第 right 個?', a: '92. Reverse Linked List II:先走到 left 前一個節點,中間那段用同樣的三指標反轉,再把頭尾接回去。' },
    { q: '每 k 個一組反轉?', a: '[25. Reverse Nodes in k-Group](#/q/25):每次先確認剩下夠 k 個,再反轉這一段並接上。' },
  ],
  check: {
    kind: 'fn',
    fn: 'reverseList',
    argKinds: ['list'],
    ret: 'list',
    cases: [
      { args: [[1, 2, 3, 4, 5]], out: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], out: [2, 1] },
      { args: [[]], out: [] },
      { args: [[7]], out: [7] },
    ],
  },
}
