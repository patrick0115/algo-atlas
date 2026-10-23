import type { GraphViewData } from '../types'
import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 160. Intersection of Two Linked Lists

const LA = [4, 1, 8, 4, 5]
const LB = [5, 6, 1, 8, 4, 5]
const SA = 2
const SB = 3

/** 兩條串列共用尾巴:A 的前 SA 個在上排,B 的前 SB 個在下排,共同部分在中間 */
function yView(cls: Record<string, string> = {}, subs: Record<string, string> = {}): GraphViewData {
  const nodes: GraphViewData['nodes'] = []
  const edges: GraphViewData['edges'] = []
  const tail = LA.slice(SA)
  LA.slice(0, SA).forEach((v, i) => nodes.push({ id: `a${i}`, label: v, x: (SB - SA + i) * 1.2, y: 0, cls: cls[`a${i}`], sub: subs[`a${i}`] }))
  LB.slice(0, SB).forEach((v, i) => nodes.push({ id: `b${i}`, label: v, x: i * 1.2, y: 2, cls: cls[`b${i}`], sub: subs[`b${i}`] }))
  tail.forEach((v, i) => nodes.push({ id: `c${i}`, label: v, x: (SB + i) * 1.2, y: 1, cls: cls[`c${i}`], sub: subs[`c${i}`] }))
  for (let i = 0; i + 1 < SA; i++) edges.push({ from: `a${i}`, to: `a${i + 1}`, directed: true })
  for (let i = 0; i + 1 < SB; i++) edges.push({ from: `b${i}`, to: `b${i + 1}`, directed: true })
  edges.push({ from: `a${SA - 1}`, to: 'c0', directed: true }, { from: `b${SB - 1}`, to: 'c0', directed: true })
  for (let i = 0; i + 1 < tail.length; i++) edges.push({ from: `c${i}`, to: `c${i + 1}`, directed: true })
  return { kind: 'graph', label: '上排 = A 獨有,下排 = B 獨有,中間 = 共用的部分', nodes, edges }
}

function twoPtrFig(): FigStep[] {
  return [
    { note: `A 長 ${LA.length}、B 長 ${LB.length}。兩條在值 8 那個**節點**交會(注意是同一個節點,不是值一樣而已)`, views: [yView({ c0: 'hl' })] },
    { note: 'pa 從 A 出發、pb 從 B 出發,每次各走一步;走到尾巴(null)就**跳到另一條的開頭**繼續走', views: [yView({ a0: 'cur', b0: 'cur' }, { a0: 'pa', b0: 'pb' })] },
    { note: `為什麼會相遇?pa 走過 A 獨有(${SA})+ 共用(${LA.length - SA})+ B 獨有(${SB}),pb 走過 B 獨有 + 共用 + A 獨有,兩人走的總長一樣,所以會在交會點同時抵達`, views: [yView({ c0: 'done' }, { c0: 'pa = pb' })] },
    { note: '如果沒有交會,兩人會在同一時間一起走到 null(都走了 m + n 步)→ 回傳 null', views: [arr(['pa: A → B → null', 'pb: B → A → null'], { label: '沒交會時' })] },
  ]
}

function setFig(): FigStep[] {
  return [
    { note: '直觀作法:先走過 A,把每個**節點**(不是值)放進集合', views: [yView({ a0: 'visited', a1: 'visited', c0: 'visited', c1: 'visited', c2: 'visited' })] },
    { note: '再走 B,第一個已經在集合裡的節點就是交會點 → 值 8 的節點。O(m + n) 時間,O(m) 空間', views: [yView({ b0: 'dim', b1: 'dim', b2: 'dim', c0: 'hl' })] },
  ]
}

const BUILD_PY = `

def intersect(a, b, skipA, skipB):            # 測試用:建出共用尾巴的兩條串列
    def build(vals, tail=None):
        for v in reversed(vals):
            tail = ListNode(v, tail)
        return tail
    tail = build(a[skipA:])
    ha = build(a[:skipA], tail)
    hb = build(b[:skipB], tail) if tail else build(b)
    node = getIntersectionNode(ha, hb)
    return node.val if node else -1`

export const q0160: Solution = {
  id: 160,
  plain: '兩條鏈子(串列)在某個地方「合併」成同一條,像 Y 字形。找出它們合併的那個節點;如果從頭到尾都沒有合併,回傳 null。',
  statement: '給兩條單向串列的頭 `headA`、`headB`,回傳兩者**相交的起始節點**;不相交則回傳 null。串列不含環,而且函式結束後不能改變串列結構。(這裡用 `intersect(listA, listB, skipA, skipB)` 建出共用尾巴的兩條串列,回傳交會節點的值,沒有則回傳 −1。)',
  examples: [
    { input: 'listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3', output: '交會於值 8 的節點' },
    { input: 'listA = [2,6,4], listB = [1,5], skipA = 3, skipB = 2', output: 'null' },
  ],
  constraints: ['節點數 ≤ 3·10⁴', 'Follow-up:O(m + n) 時間、O(1) 空間'],
  insight: ['交會 = 同一個節點(記憶體位址相同),不是值相同', '最直接:把 A 的節點放進集合,再走 B 找第一個在集合裡的', '妙招:兩個指標走完自己那條就換到另一條,總路程一樣長,一定同時到達交會點(或同時到 null)'],
  approaches: [
    {
      name: '雙指標互換起點',
      idea: '`pa`、`pb` 各走一步;走到 null 就換到另一條的開頭;`pa == pb` 時停下。',
      steps: ['`pa, pb = headA, headB`', '`while pa is not pb`:', '`pa = pa.next if pa else headB`;`pb = pb.next if pb else headA`', '回傳 pa(可能是 null)'],
      figure: { title: `listA = [${LA}],listB = [${LB}]`, steps: twoPtrFig() },
      complexity: { time: 'O(m + n)', space: 'O(1)', why: '每個指標最多走 m + n 步。' },
      verdict: '最推薦(Follow-up 的答案)。「把兩條接起來走」抹平了長度差,寫起來只有幾行。',
      code: {
        python: `def getIntersectionNode(headA, headB):
    pa, pb = headA, headB
    while pa is not pb:
        pa = pa.next if pa else headB         # 走完 A 換走 B
        pb = pb.next if pb else headA         # 走完 B 換走 A
    return pa                                 # 交會點,或兩人一起走到 None${BUILD_PY}`,
        c: `struct ListNode *getIntersectionNode(struct ListNode *headA, struct ListNode *headB) {
    struct ListNode *pa = headA, *pb = headB;
    while (pa != pb) {
        pa = pa ? pa->next : headB;
        pb = pb ? pb->next : headA;
    }
    return pa;
}

// 測試用:建出共用尾巴的兩條串列
static struct ListNode *build(int *v, int n, struct ListNode *tail) {
    struct ListNode *h = tail;
    for (int i = n - 1; i >= 0; i--) { struct ListNode *x = malloc(sizeof *x); x->val = v[i]; x->next = h; h = x; }
    return h;
}

int intersect(int *a, int aSize, int *b, int bSize, int skipA, int skipB) {
    struct ListNode *tail = skipA < aSize ? build(a + skipA, aSize - skipA, NULL) : NULL;
    struct ListNode *ha = build(a, skipA, tail);
    struct ListNode *hb = tail ? build(b, skipB, tail) : build(b, bSize, NULL);
    struct ListNode *x = getIntersectionNode(ha, hb);
    return x ? x->val : -1;
}`,
        cpp: `ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
    ListNode *pa = headA, *pb = headB;
    while (pa != pb) {
        pa = pa ? pa->next : headB;
        pb = pb ? pb->next : headA;
    }
    return pa;
}

static ListNode *build(const vector<int> &v, int from, int to, ListNode *tail) {
    for (int i = to - 1; i >= from; i--) tail = new ListNode(v[i], tail);
    return tail;
}

int intersect(vector<int>& a, vector<int>& b, int skipA, int skipB) {
    ListNode *tail = build(a, skipA, a.size(), nullptr);
    ListNode *ha = build(a, 0, skipA, tail);
    ListNode *hb = tail ? build(b, 0, skipB, tail) : build(b, 0, b.size(), nullptr);
    ListNode *x = getIntersectionNode(ha, hb);
    return x ? x->val : -1;
}`,
        java: `ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    ListNode pa = headA, pb = headB;
    while (pa != pb) {
        pa = pa != null ? pa.next : headB;
        pb = pb != null ? pb.next : headA;
    }
    return pa;
}

private ListNode build(int[] v, int from, int to, ListNode tail) {
    for (int i = to - 1; i >= from; i--) tail = new ListNode(v[i], tail);
    return tail;
}

int intersect(int[] a, int[] b, int skipA, int skipB) {
    ListNode tail = build(a, skipA, a.length, null);
    ListNode ha = build(a, 0, skipA, tail);
    ListNode hb = tail != null ? build(b, 0, skipB, tail) : build(b, 0, b.length, null);
    ListNode x = getIntersectionNode(ha, hb);
    return x != null ? x.val : -1;
}`,
        javascript: `function getIntersectionNode(headA, headB) {
  let pa = headA, pb = headB;
  while (pa !== pb) {
    pa = pa ? pa.next : headB;
    pb = pb ? pb.next : headA;
  }
  return pa;
}

function intersect(a, b, skipA, skipB) {
  const build = (v, from, to, tail) => {
    for (let i = to - 1; i >= from; i--) tail = new ListNode(v[i], tail);
    return tail;
  };
  const tail = build(a, skipA, a.length, null);
  const ha = build(a, 0, skipA, tail);
  const hb = tail ? build(b, 0, skipB, tail) : build(b, 0, b.length, null);
  const x = getIntersectionNode(ha, hb);
  return x ? x.val : -1;
}`,
      },
    },
    {
      name: '節點集合',
      idea: '把 A 的每個節點放進集合;走 B,第一個在集合裡的就是答案。',
      steps: ['`seen = set()`;走 A,把節點加入', '走 B:節點在 seen 裡 → 回傳它', '走完 → null'],
      figure: { title: `listA = [${LA}],listB = [${LB}]`, steps: setFig() },
      complexity: { time: 'O(m + n)', space: 'O(m)', why: '集合存 A 的所有節點。' },
      verdict: '最直觀。集合裡存的是節點本身(參考),比較的是「是不是同一個」。',
      code: {
        python: `def getIntersectionNode(headA, headB):
    seen = set()
    while headA:
        seen.add(headA)                       # 存節點本身,不是值
        headA = headA.next
    while headB:
        if headB in seen:
            return headB
        headB = headB.next
    return None${BUILD_PY}`,
        c: `// C 沒有指標集合:先量長度,讓長的那條先走差距步,再一起走(另一種 O(1) 空間的作法)
struct ListNode *getIntersectionNode(struct ListNode *headA, struct ListNode *headB) {
    int la = 0, lb = 0;
    for (struct ListNode *p = headA; p; p = p->next) la++;
    for (struct ListNode *p = headB; p; p = p->next) lb++;
    while (la > lb) { headA = headA->next; la--; }
    while (lb > la) { headB = headB->next; lb--; }
    while (headA != headB) { headA = headA->next; headB = headB->next; }
    return headA;
}

static struct ListNode *build(int *v, int n, struct ListNode *tail) {
    struct ListNode *h = tail;
    for (int i = n - 1; i >= 0; i--) { struct ListNode *x = malloc(sizeof *x); x->val = v[i]; x->next = h; h = x; }
    return h;
}

int intersect(int *a, int aSize, int *b, int bSize, int skipA, int skipB) {
    struct ListNode *tail = skipA < aSize ? build(a + skipA, aSize - skipA, NULL) : NULL;
    struct ListNode *ha = build(a, skipA, tail);
    struct ListNode *hb = tail ? build(b, skipB, tail) : build(b, bSize, NULL);
    struct ListNode *x = getIntersectionNode(ha, hb);
    return x ? x->val : -1;
}`,
        cpp: `ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
    unordered_set<ListNode *> seen;
    for (; headA; headA = headA->next) seen.insert(headA);
    for (; headB; headB = headB->next) if (seen.count(headB)) return headB;
    return nullptr;
}

static ListNode *build(const vector<int> &v, int from, int to, ListNode *tail) {
    for (int i = to - 1; i >= from; i--) tail = new ListNode(v[i], tail);
    return tail;
}

int intersect(vector<int>& a, vector<int>& b, int skipA, int skipB) {
    ListNode *tail = build(a, skipA, a.size(), nullptr);
    ListNode *ha = build(a, 0, skipA, tail);
    ListNode *hb = tail ? build(b, 0, skipB, tail) : build(b, 0, b.size(), nullptr);
    ListNode *x = getIntersectionNode(ha, hb);
    return x ? x->val : -1;
}`,
        java: `ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    Set<ListNode> seen = new HashSet<>();
    for (; headA != null; headA = headA.next) seen.add(headA);
    for (; headB != null; headB = headB.next) if (seen.contains(headB)) return headB;
    return null;
}

private ListNode build(int[] v, int from, int to, ListNode tail) {
    for (int i = to - 1; i >= from; i--) tail = new ListNode(v[i], tail);
    return tail;
}

int intersect(int[] a, int[] b, int skipA, int skipB) {
    ListNode tail = build(a, skipA, a.length, null);
    ListNode ha = build(a, 0, skipA, tail);
    ListNode hb = tail != null ? build(b, 0, skipB, tail) : build(b, 0, b.length, null);
    ListNode x = getIntersectionNode(ha, hb);
    return x != null ? x.val : -1;
}`,
        javascript: `function getIntersectionNode(headA, headB) {
  const seen = new Set();
  for (; headA; headA = headA.next) seen.add(headA);
  for (; headB; headB = headB.next) if (seen.has(headB)) return headB;
  return null;
}

function intersect(a, b, skipA, skipB) {
  const build = (v, from, to, tail) => {
    for (let i = to - 1; i >= from; i--) tail = new ListNode(v[i], tail);
    return tail;
  };
  const tail = build(a, skipA, a.length, null);
  const ha = build(a, 0, skipA, tail);
  const hb = tail ? build(b, 0, skipB, tail) : build(b, 0, b.length, null);
  const x = getIntersectionNode(ha, hb);
  return x ? x.val : -1;
}`,
      },
    },
  ],
  pitfalls: ['比較值而不是節點:兩條串列可能有一樣的值卻不是同一個節點(例 1 的 1 就是)', '雙指標版判斷「走到 null」時要換條,不是走到最後一個節點就換:否則不相交時會無限迴圈'],
  check: {
    kind: 'fn',
    fn: 'intersect',
    cases: [
      { args: [LA, LB, SA, SB], out: 8 },
      { args: [[1, 9, 1, 2, 4], [3, 2, 4], 3, 1], out: 2 },
      { args: [[2, 6, 4], [1, 5], 3, 2], out: -1 },
      { args: [[7], [7], 0, 0], out: 7 },
    ],
  },
}
