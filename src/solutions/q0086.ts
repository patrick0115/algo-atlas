import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 86. Partition List

const L = [1, 4, 3, 2, 5, 2]
const X = 3

function twoListFig(): FigStep[] {
  const small: number[] = []
  const big: number[] = []
  const out: FigStep[] = [{ note: `準備兩條空串列(各有一個假頭 dummy):small 收 < ${X} 的,big 收 ≥ ${X} 的。原串列從頭走一遍,每個節點接到其中一條的尾巴`, views: [chain(L), chain(['d'], { label: 'small' }), chain(['d'], { label: 'big' })] }]
  L.forEach((v, i) => {
    ;(v < X ? small : big).push(v)
    if (i === 0 || i === 1 || i === L.length - 1) out.push({ note: `${v} ${v < X ? '<' : '≥'} ${X} → 接到 ${v < X ? 'small' : 'big'} 尾巴`, views: [chain(L, { cls: { [i]: 'hl', ...Object.fromEntries(Array.from({ length: i }, (_, k) => [k, 'dim'])) } }), chain(['d', ...small], { label: 'small', cls: v < X ? { [small.length]: 'hl' } : {} }), chain(['d', ...big], { label: 'big', cls: v >= X ? { [big.length]: 'hl' } : {} })] })
  })
  out.push({ note: `把 small 的尾巴接到 big 的第一個真節點,big 的尾巴指向 null → [${[...small, ...big]}]。每一邊內部的順序都沒變`, views: [chain([...small, ...big], { tail: true, cls: Object.fromEntries(small.map((_, k) => [k, 'done'])) })] })
  return out
}

function arrFig(): FigStep[] {
  const small = L.filter((v) => v < X)
  const big = L.filter((v) => v >= X)
  return [
    { note: `把值抄進陣列,先挑出 < ${X} 的,再挑出 ≥ ${X} 的(都照原本順序)`, views: [arr(L, { label: '原本', highlight: L.map((v, i) => (v < X ? i : -1)).filter((i) => i >= 0) }), arr([...small, ...big], { label: '重排後' })] },
    { note: '再依序寫回串列的節點值', views: [chain([...small, ...big])] },
  ]
}

export const q0086: Solution = {
  id: 86,
  plain: '一排人手牽手,要把「比 x 矮的」都移到前面、「不比 x 矮的」放到後面,而且兩群人各自原本的前後順序都不能亂。',
  statement: '給串列 `head` 和值 `x`,重排串列使所有 **小於 x** 的節點都在 **大於等於 x** 的節點之前,兩部分各自保持原本的相對順序。',
  examples: [
    { input: 'head = [1,4,3,2,5,2], x = 3', output: '[1,2,2,4,3,5]' },
    { input: 'head = [2,1], x = 2', output: '[1,2]' },
  ],
  constraints: ['節點數 ≤ 200'],
  insight: ['要「穩定」(各自順序不變)→ 不能用交換', '開兩條新串列分別收集,最後接起來', '用假頭(dummy)就不用處理「第一個節點」的特例'],
  approaches: [
    {
      name: '兩條串列 + 假頭',
      idea: '`small`、`big` 兩個假頭;走過原串列依值接到其中一條,最後 `small 尾 → big.next`、`big 尾 → null`。',
      steps: ['`sd = ListNode()`、`bd = ListNode()`,尾巴 `s = sd`、`b = bd`', '走過每個節點:`< x` 接到 s 後面,否則接到 b 後面', '`b.next = None`(切斷舊連結)', '`s.next = bd.next`,回傳 `sd.next`'],
      figure: { title: `head = [${L}],x = ${X}`, steps: twoListFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只是重新接指標,沒有新節點(假頭是常數)。' },
      verdict: '最推薦。假頭 + 尾指標是串列題最常用的組合,[21](#/q/21)、[2](#/q/2) 都是這樣寫。',
      code: {
        python: `def partition(head, x):
    sd, bd = ListNode(), ListNode()           # 兩個假頭
    s, b = sd, bd
    while head:
        if head.val < x:
            s.next = head; s = head
        else:
            b.next = head; b = head
        head = head.next
    b.next = None                             # big 的尾巴可能還連著舊的節點,一定要切斷
    s.next = bd.next
    return sd.next`,
        c: `struct ListNode *partition(struct ListNode *head, int x) {
    struct ListNode sd = {0}, bd = {0}, *s = &sd, *b = &bd;
    for (; head; head = head->next) {
        if (head->val < x) { s->next = head; s = head; }
        else { b->next = head; b = head; }
    }
    b->next = NULL;
    s->next = bd.next;
    return sd.next;
}`,
        cpp: `ListNode* partition(ListNode* head, int x) {
    ListNode sd, bd, *s = &sd, *b = &bd;
    for (; head; head = head->next) {
        if (head->val < x) s = s->next = head;
        else b = b->next = head;
    }
    b->next = nullptr;
    s->next = bd.next;
    return sd.next;
}`,
        java: `ListNode partition(ListNode head, int x) {
    ListNode sd = new ListNode(), bd = new ListNode(), s = sd, b = bd;
    for (; head != null; head = head.next) {
        if (head.val < x) s = s.next = head;
        else b = b.next = head;
    }
    b.next = null;
    s.next = bd.next;
    return sd.next;
}`,
        javascript: `function partition(head, x) {
  const sd = new ListNode(), bd = new ListNode();
  let s = sd, b = bd;
  for (; head; head = head.next) {
    if (head.val < x) s = s.next = head;
    else b = b.next = head;
  }
  b.next = null;
  s.next = bd.next;
  return sd.next;
}`,
      },
    },
    {
      name: '抄值重排再寫回',
      idea: '值抄進陣列,穩定地分成兩群再寫回原本的節點。',
      steps: ['走一遍收集值', '`vals = [v < x 的] + [v ≥ x 的]`', '再走一遍依序寫回'],
      figure: { title: `head = [${L}],x = ${X}`, steps: arrFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個陣列。' },
      verdict: '不用動指標,不容易出錯,但用了 O(n) 空間,也沒有練到串列的操作。',
      code: {
        python: `def partition(head, x):
    vals, p = [], head
    while p:
        vals.append(p.val)
        p = p.next
    vals = [v for v in vals if v < x] + [v for v in vals if v >= x]
    p = head
    for v in vals:
        p.val = v
        p = p.next
    return head`,
        c: `struct ListNode *partition(struct ListNode *head, int x) {
    int n = 0, k = 0;
    for (struct ListNode *p = head; p; p = p->next) n++;
    int *a = malloc((n + 1) * sizeof(int));
    for (struct ListNode *p = head; p; p = p->next) if (p->val < x) a[k++] = p->val;
    for (struct ListNode *p = head; p; p = p->next) if (p->val >= x) a[k++] = p->val;
    k = 0;
    for (struct ListNode *p = head; p; p = p->next) p->val = a[k++];
    free(a);
    return head;
}`,
        cpp: `ListNode* partition(ListNode* head, int x) {
    vector<int> a;
    for (ListNode *p = head; p; p = p->next) if (p->val < x) a.push_back(p->val);
    for (ListNode *p = head; p; p = p->next) if (p->val >= x) a.push_back(p->val);
    int k = 0;
    for (ListNode *p = head; p; p = p->next) p->val = a[k++];
    return head;
}`,
        java: `ListNode partition(ListNode head, int x) {
    List<Integer> a = new ArrayList<>();
    for (ListNode p = head; p != null; p = p.next) if (p.val < x) a.add(p.val);
    for (ListNode p = head; p != null; p = p.next) if (p.val >= x) a.add(p.val);
    int k = 0;
    for (ListNode p = head; p != null; p = p.next) p.val = a.get(k++);
    return head;
}`,
        javascript: `function partition(head, x) {
  const a = [];
  for (let p = head; p; p = p.next) if (p.val < x) a.push(p.val);
  for (let p = head; p; p = p.next) if (p.val >= x) a.push(p.val);
  let k = 0;
  for (let p = head; p; p = p.next) p.val = a[k++];
  return head;
}`,
      },
    },
  ],
  pitfalls: ['忘了 `b.next = None`:big 的最後一個節點還指著原串列的某個節點,會形成環', '用交換法(像快速排序的 partition):會打亂各自的順序'],
  check: {
    kind: 'fn',
    fn: 'partition',
    argKinds: ['list', null],
    ret: 'list',
    cases: [
      { args: [L, X], out: [1, 2, 2, 4, 3, 5] },
      { args: [[2, 1], 2], out: [1, 2] },
      { args: [[], 0], out: [] },
      { args: [[5, 6, 7], 3], out: [5, 6, 7] },
      { args: [[3, 1, 2], 4], out: [3, 1, 2] },
    ],
  },
}
