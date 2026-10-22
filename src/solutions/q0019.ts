import type { FigStep, Solution } from './types'
import { chain } from './fig'

// 19. Remove Nth Node From End of List

const V = [1, 2, 3, 4, 5]
const N = 2

function twoPassFig(): FigStep[] {
  const len = V.length
  const k = len - N
  return [
    { note: `第一遍:數長度 = ${len}`, views: [chain(V, { tail: true, subs: Object.fromEntries(V.map((_, i) => [i, `#${i + 1}`])) })] },
    { note: `倒數第 ${N} 個 = 正數第 ${len} − ${N} + 1 = ${k + 1} 個。要刪它,得先走到它的**前一個**(第 ${k} 個)`, views: [chain(V, { tail: true, cls: { [k]: 'hl', [k - 1]: 'visited' }, subs: { [k - 1]: '前一個', [k]: '要刪的' } })] },
    { note: `第二遍:走到第 ${k} 個,讓它的 next 跳過要刪的節點`, views: [chain(V, { edges: [...V.slice(1).map((_, i) => [i, i + 1] as [number, number, string?]).filter(([a]) => a !== k - 1 && a !== k), [k - 1, k + 1, 'hl'], [V.length - 1, -1]], cls: { [k]: 'dim' } })] },
    { note: '完成', views: [chain(V.filter((_, i) => i !== k), { tail: true })] },
  ]
}

function onePassFig(): FigStep[] {
  const vals: (number | string)[] = ['D', ...V]
  const n = vals.length
  let fast = 0
  let slow = 0
  const draw = (note: string, extra: Record<number, string> = {}): FigStep => {
    const subs: Record<number, string> = {}
    subs[slow] = 'slow'
    subs[fast] = subs[fast] ? 'slow,fast' : 'fast'
    if (fast === n) subs[-1] = 'fast'
    return { note, views: [chain(vals, { tail: true, subs, cls: { 0: 'dim', [slow]: 'visited', ...(fast < n ? { [fast]: 'hl' } : {}), ...extra } })] }
  }
  const out: FigStep[] = [draw('前面加一個假的頭 D(dummy),刪第一個節點時才不用特別處理。slow、fast 都從 D 出發')]
  for (let i = 0; i < N + 1; i++) {
    fast++
    out.push(draw(`fast 先走 n + 1 = ${N + 1} 步(第 ${i + 1} 步)`))
  }
  out.push(draw(`現在 fast 和 slow 之間隔了 ${N} 個節點。接下來兩個一起走,fast 走到 null 時,slow 正好在要刪的節點的**前一個**`))
  while (fast < n) {
    fast++
    slow++
    out.push(draw(`一起走一步:slow = ${vals[slow]},fast = ${fast < n ? vals[fast] : 'null'}`))
  }
  out.push(draw(`fast 到 null 了。slow(${vals[slow]})的下一個 ${vals[slow + 1]} 就是倒數第 ${N} 個 → slow.next = slow.next.next`, { [slow + 1]: 'dim' }))
  out.push({ note: '回傳 dummy.next', views: [chain(V.filter((_, i) => i !== V.length - N), { tail: true })] })
  return out
}

export const q0019: Solution = {
  id: 19,
  plain: '從一條鏈子上,拿掉「從後面數來第 n 個」節點。難的是鏈子只能從頭往後走,不知道後面還有多長。訣竅:讓一個人先走 n 步,兩人再一起走,先走的人到終點時,後面那個人剛好在目標旁邊。',
  statement: '給鏈結串列的頭 `head`,刪除**倒數第 `n` 個**節點,回傳新的頭。保證 `n` 不超過串列長度。',
  examples: [
    { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]', note: '倒數第 2 個是 4' },
    { input: 'head = [1], n = 1', output: '[]' },
    { input: 'head = [1,2], n = 2', output: '[2]', note: '刪掉的是頭' },
  ],
  constraints: ['`1 ≤ 節點數 ≤ 30`、`1 ≤ n ≤ 節點數`', 'Follow-up:能不能只走**一遍**?'],
  insight: [
    '刪除節點 = 讓它的**前一個**節點的 next 跳過它。所以真正要找的是「倒數第 n+1 個」',
    '最直接:先走一遍數出長度 L,倒數第 n 個就是正數第 L − n + 1 個,再走一遍去刪 —— 兩遍',
    '一遍的做法:兩個指針保持固定距離。fast 先走 n+1 步,然後兩個一起走,fast 到 null 時 slow 剛好在要刪節點的前一個',
    '要刪的可能是頭本身(n = 長度)→ 前面加一個 dummy 節點,就不用特別判斷',
  ],
  approaches: [
    {
      name: '兩遍:先數長度再走過去',
      idea: '第一遍數長度 `L`;第二遍從 dummy 走 `L − n` 步,停在要刪節點的前一個,把它的 next 跳過去。',
      steps: ['`L = 串列長度`', '`dummy.next = head`,`cur = dummy`', '`cur` 往前走 `L − n` 步', '`cur.next = cur.next.next`,回傳 `dummy.next`'],
      figure: { title: `head = [${V.join(',')}], n = ${N}`, steps: twoPassFig() },
      complexity: { time: 'O(L)', space: 'O(1)', why: '走兩遍串列。' },
      verdict: '直觀好寫,只是要走兩遍。題目 L ≤ 30,兩種寫法實際上一樣快。',
      code: {
        python: `def removeNthFromEnd(head, n):
    length, p = 0, head
    while p:
        length += 1
        p = p.next
    dummy = ListNode(0, head)
    cur = dummy
    for _ in range(length - n):           # 停在要刪的節點的前一個
        cur = cur.next
    cur.next = cur.next.next
    return dummy.next`,
        c: `struct ListNode *removeNthFromEnd(struct ListNode *head, int n) {
    int len = 0;
    for (struct ListNode *p = head; p; p = p->next) len++;
    struct ListNode dummy = {0, head}, *cur = &dummy;
    for (int i = 0; i < len - n; i++) cur = cur->next;
    struct ListNode *del = cur->next;
    cur->next = del->next;
    free(del);
    return dummy.next;
}`,
        cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    int len = 0;
    for (ListNode* p = head; p; p = p->next) len++;
    ListNode dummy(0, head), *cur = &dummy;
    for (int i = 0; i < len - n; i++) cur = cur->next;
    cur->next = cur->next->next;
    return dummy.next;
}`,
        java: `ListNode removeNthFromEnd(ListNode head, int n) {
    int len = 0;
    for (ListNode p = head; p != null; p = p.next) len++;
    ListNode dummy = new ListNode(0, head), cur = dummy;
    for (int i = 0; i < len - n; i++) cur = cur.next;
    cur.next = cur.next.next;
    return dummy.next;
}`,
        javascript: `function removeNthFromEnd(head, n) {
  let len = 0;
  for (let p = head; p; p = p.next) len++;
  const dummy = new ListNode(0, head);
  let cur = dummy;
  for (let i = 0; i < len - n; i++) cur = cur.next;
  cur.next = cur.next.next;
  return dummy.next;
}`,
      },
    },
    {
      name: '一遍:快慢指針保持 n 的距離',
      idea: '`fast` 從 dummy 先走 `n + 1` 步,然後 `slow`、`fast` 一起走,直到 `fast` 是 null。這時 `slow` 在要刪節點的前一個。',
      steps: ['`dummy.next = head`,`slow = fast = dummy`', '`fast` 先走 `n + 1` 步', '`while fast`:兩個都走一步', '`slow.next = slow.next.next`,回傳 `dummy.next`'],
      figure: { title: `head = [${V.join(',')}], n = ${N}`, steps: onePassFig() },
      complexity: { time: 'O(L)', space: 'O(1)', why: 'fast 走完整條串列一次,slow 跟在後面。' },
      verdict: '標準解,[[p:fast-slow]]的「固定間距」用法。一定要記得用 dummy,否則刪頭節點(n = 長度)時 slow 沒有「前一個」可以停。',
      code: {
        python: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):                # fast 先走 n+1 步
        fast = fast.next
    while fast:                           # 一起走到 fast 掉出去
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next            # slow 在要刪的前一個
    return dummy.next`,
        c: `struct ListNode *removeNthFromEnd(struct ListNode *head, int n) {
    struct ListNode dummy = {0, head}, *slow = &dummy, *fast = &dummy;
    for (int i = 0; i <= n; i++) fast = fast->next;
    while (fast) { slow = slow->next; fast = fast->next; }
    struct ListNode *del = slow->next;
    slow->next = del->next;
    free(del);
    return dummy.next;
}`,
        cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0, head), *slow = &dummy, *fast = &dummy;
    for (int i = 0; i <= n; i++) fast = fast->next;
    while (fast) { slow = slow->next; fast = fast->next; }
    slow->next = slow->next->next;
    return dummy.next;
}`,
        java: `ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head), slow = dummy, fast = dummy;
    for (int i = 0; i <= n; i++) fast = fast.next;
    while (fast != null) { slow = slow.next; fast = fast.next; }
    slow.next = slow.next.next;
    return dummy.next;
}`,
        javascript: `function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let slow = dummy, fast = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) {
    slow = slow.next;
    fast = fast.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}`,
      },
    },
  ],
  pitfalls: [
    '沒有 dummy:`[1,2], n = 2` 要刪的是頭,找不到「前一個」,得另外寫 `if` 處理',
    'fast 先走 `n` 步而不是 `n + 1` 步:slow 會停在要刪的節點本身,而不是它的前一個',
    '回傳 `head` 而不是 `dummy.next`:刪掉的剛好是頭時,`head` 已經不在串列裡了',
  ],
  followUp: [
    { q: '找倒數第 k 個節點(不刪)?', a: '同樣的固定間距:fast 先走 k 步,兩個一起走,fast 到 null 時 slow 就是答案。' },
  ],
  check: {
    kind: 'fn',
    fn: 'removeNthFromEnd',
    argKinds: ['list'],
    ret: 'list',
    cases: [
      { args: [[1, 2, 3, 4, 5], 2], out: [1, 2, 3, 5] },
      { args: [[1], 1], out: [] },
      { args: [[1, 2], 1], out: [1] },
      { args: [[1, 2], 2], out: [2] },
      { args: [[1, 2, 3], 3], out: [2, 3] },
    ],
  },
}
