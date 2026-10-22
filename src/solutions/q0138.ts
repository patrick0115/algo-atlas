import type { FigStep, Solution } from './types'
import { chain, kv } from './fig'

// 138. Copy List with Random Pointer

const L: [number, number | null][] = [
  [7, null],
  [13, 0],
  [11, 4],
  [10, 2],
  [1, 0],
]
const vals = L.map((p) => p[0])
const rnd = (i: number) => (L[i][1] === null ? 'r→∅' : `r→${L[L[i][1]!][0]}`)
const subsAll = Object.fromEntries(L.map((_, i) => [i, rnd(i)]))

function mapFig(): FigStep[] {
  const made: [string, string][] = []
  const out: FigStep[] = [
    { note: '每個節點除了 next,還有一個 random 指標可以指向任何節點(或 null)。節點下方的 r→x 是它的 random', views: [chain(vals, { label: '原串列', tail: true, subs: subsAll })] },
  ]
  L.forEach(([v], i) => {
    made.push([`舊 ${v}(#${i})`, `新 ${v}′`])
    out.push({ note: `第一輪:替舊節點 ${v} 做一個值相同的新節點,記在 map 裡(舊 → 新)。先不管指標`, views: [chain(vals, { label: '原串列', tail: true, subs: subsAll, cls: { [i]: 'hl' } }), kv(made, 'map(舊節點 → 新節點)', [`舊 ${v}(#${i})`])] })
  })
  L.forEach(([v, r], i) => {
    const nx = i + 1 < L.length ? `${vals[i + 1]}′` : '∅'
    const rr = r === null ? '∅' : `${vals[r]}′`
    out.push({ note: `第二輪:新 ${v}′ 的 next = map[舊 ${v}.next] = ${nx};random = map[舊 ${v}.random] = ${rr}`, views: [chain(vals, { label: '原串列', tail: true, subs: subsAll, cls: { [i]: 'hl', ...(r !== null ? { [r]: 'visited' } : {}) } }), kv(made, 'map', [`舊 ${v}(#${i})`])] })
  })
  out.push({ note: '新串列和舊的長得一模一樣,但每個節點都是新做的。回傳 map[head]', views: [chain(vals.map((v) => `${v}′`), { label: '複製出來的新串列', tail: true, subs: subsAll })] })
  return out
}

function weaveFig(): FigStep[] {
  const woven = vals.flatMap((v) => [String(v), `${v}′`])
  const wsubs = (withCopy: boolean) => Object.fromEntries(L.flatMap((_, i) => [[2 * i, rnd(i)], ...(withCopy ? [[2 * i + 1, L[i][1] === null ? 'r→∅' : `r→${vals[L[i][1]!]}′`]] : [])]))
  return [
    { note: '不用 map 的做法:把每個新節點直接插在它的舊節點後面,讓「舊 → 新」的對應靠位置就知道', views: [chain(vals, { label: '原串列', tail: true, subs: subsAll })] },
    { note: '第一輪:每個舊節點後面插一個複製品。現在 舊.next 就是它的新節點', views: [chain(woven, { label: '交錯的串列(′ 是新節點)', tail: true, subs: wsubs(false), cls: Object.fromEntries(L.map((_, i) => [2 * i + 1, 'hl'])) })] },
    { note: '第二輪:新節點的 random = 舊.random.next(舊 random 指到的那個舊節點,它後面就是對應的新節點)', views: [chain(woven, { label: '交錯的串列', tail: true, subs: wsubs(true), cls: Object.fromEntries(L.map((_, i) => [2 * i + 1, 'hl'])) })] },
    { note: '第三輪:把交錯的串列拆回兩條:舊的接回舊的、新的接成新的', views: [chain(vals, { label: '還原的原串列', tail: true, subs: subsAll }), chain(vals.map((v) => `${v}′`), { label: '新串列', tail: true, subs: Object.fromEntries(L.map((_, i) => [i, L[i][1] === null ? 'r→∅' : `r→${vals[L[i][1]!]}′`])) })] },
  ]
}

export const q0138: Solution = {
  id: 138,
  plain:
    '把一條「每個人除了牽著下一個人,還隨手指著隊伍裡某個人」的隊伍,完整複製一份。新隊伍要全是新的人,而且「誰指著誰」的關係要一模一樣,不能指回舊隊伍的人。',
  statement:
    '每個節點有 `val`、`next`,以及一個可以指向串列中**任何節點或 null** 的 `random` 指標。請做出這個串列的**深複製**:全部都是新節點,新節點的 `next`、`random` 要指向對應的新節點,不能指到原本的節點。',
  examples: [
    { input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', output: '同樣結構的新串列', note: '每一組是 [值, random 指向第幾個節點]' },
    { input: 'head = []', output: '[]' },
  ],
  constraints: ['`0 ≤ 節點數 ≤ 1000`', 'random 可能指向自己、前面、後面或 null'],
  insight: [
    '只複製 `next` 很簡單:走一遍、一個一個做新節點。難的是 `random`:它可能指向**還沒做出來**的節點',
    '關鍵問題是「舊節點 X 對應的新節點是誰?」—— 用 Hash Map 記下 `舊 → 新` 就能查',
    '所以分兩輪:第一輪只做新節點、記對應;第二輪再用 map 把 `next` 和 `random` 接好',
    '想省掉 map 的話,可以把新節點插在舊節點正後面,讓「舊.next 就是新」代替 map',
  ],
  approaches: [
    {
      name: 'Hash Map:舊節點 → 新節點',
      idea: '第一輪替每個舊節點做一個新節點,存 `map[舊] = 新`。第二輪:`新.next = map[舊.next]`、`新.random = map[舊.random]`。',
      steps: ['`map = {null: null}`', '第一輪:對每個舊節點 `old`,`map[old] = Node(old.val)`', '第二輪:`map[old].next = map[old.next]`、`map[old].random = map[old.random]`', '回傳 `map[head]`'],
      figure: { title: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', steps: mapFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '走兩遍;map 存 n 對。' },
      verdict: '標準解,最好懂。「舊 → 新」的 map 也是 [133. Clone Graph](#/q/133)(複製圖)的核心。',
      code: {
        python: `def copyRandomList(head):
    old_to_new = {None: None}
    cur = head
    while cur:                            # 第一輪:只做新節點
        old_to_new[cur] = Node(cur.val)
        cur = cur.next
    cur = head
    while cur:                            # 第二輪:接上 next 和 random
        old_to_new[cur].next = old_to_new[cur.next]
        old_to_new[cur].random = old_to_new[cur.random]
        cur = cur.next
    return old_to_new[head]`,
        c: `// C 沒有內建 Hash Map,這裡用 uthash,key 是舊節點的位址
typedef struct { struct Node *old, *copy; UT_hash_handle hh; } Pair;

static struct Node *lookup(Pair *m, struct Node *old) {
    if (!old) return NULL;
    Pair *p;
    HASH_FIND_PTR(m, &old, p);
    return p->copy;
}

struct Node *copyRandomList(struct Node *head) {
    Pair *m = NULL, *p, *tmp;
    for (struct Node *cur = head; cur; cur = cur->next) {
        p = malloc(sizeof(Pair));
        p->old = cur;
        p->copy = malloc(sizeof(struct Node));
        p->copy->val = cur->val;
        HASH_ADD_PTR(m, old, p);
    }
    for (struct Node *cur = head; cur; cur = cur->next) {
        struct Node *c = lookup(m, cur);
        c->next = lookup(m, cur->next);
        c->random = lookup(m, cur->random);
    }
    struct Node *res = lookup(m, head);
    HASH_ITER(hh, m, p, tmp) { HASH_DEL(m, p); free(p); }
    return res;
}`,
        cpp: `Node* copyRandomList(Node* head) {
    unordered_map<Node*, Node*> m{{nullptr, nullptr}};   // 舊 -> 新
    for (Node* cur = head; cur; cur = cur->next) m[cur] = new Node(cur->val);
    for (Node* cur = head; cur; cur = cur->next) {
        m[cur]->next = m[cur->next];
        m[cur]->random = m[cur->random];
    }
    return m[head];
}`,
        java: `Node copyRandomList(Node head) {
    Map<Node, Node> m = new HashMap<>();   // 舊 -> 新
    m.put(null, null);
    for (Node cur = head; cur != null; cur = cur.next) m.put(cur, new Node(cur.val));
    for (Node cur = head; cur != null; cur = cur.next) {
        m.get(cur).next = m.get(cur.next);
        m.get(cur).random = m.get(cur.random);
    }
    return m.get(head);
}`,
        javascript: `function copyRandomList(head) {
  const m = new Map([[null, null]]);    // 舊 -> 新
  for (let cur = head; cur; cur = cur.next) m.set(cur, new Node(cur.val));
  for (let cur = head; cur; cur = cur.next) {
    m.get(cur).next = m.get(cur.next);
    m.get(cur).random = m.get(cur.random);
  }
  return m.get(head);
}`,
      },
    },
    {
      name: '交錯插入,不用額外的 map',
      idea: '① 每個舊節點後面插入它的複製品:`A → A′ → B → B′ …`。② `A′.random = A.random.next`。③ 把串列拆成舊、新兩條。',
      steps: ['第一輪:`copy = Node(cur.val)`,插在 `cur` 和 `cur.next` 中間', '第二輪:`cur.next.random = cur.random.next`(`cur.random` 是 null 就保持 null)', '第三輪:`copy = cur.next`,`cur.next = copy.next`,`copy.next = copy.next.next`', '回傳第一個新節點'],
      figure: { title: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', steps: weaveFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走三遍;除了要回傳的新節點本身,只用幾個指標。' },
      verdict: '面試加分題。用「位置關係」取代 map 是很漂亮的技巧,但三輪的指標操作容易寫錯,最後一定要把原串列還原。',
      code: {
        python: `def copyRandomList(head):
    if not head:
        return None
    cur = head
    while cur:                            # ① 每個舊節點後面插入複製品
        cur.next = Node(cur.val, cur.next)
        cur = cur.next.next
    cur = head
    while cur:                            # ② 複製品的 random = 舊.random 的複製品
        if cur.random:
            cur.next.random = cur.random.next
        cur = cur.next.next
    new_head = head.next
    cur = head
    while cur:                            # ③ 拆成兩條
        copy = cur.next
        cur.next = copy.next
        copy.next = copy.next.next if copy.next else None
        cur = cur.next
    return new_head`,
        c: `struct Node *copyRandomList(struct Node *head) {
    if (!head) return NULL;
    for (struct Node *cur = head; cur; cur = cur->next->next) {
        struct Node *c = malloc(sizeof(struct Node));
        c->val = cur->val;
        c->next = cur->next;
        c->random = NULL;
        cur->next = c;
    }
    for (struct Node *cur = head; cur; cur = cur->next->next)
        if (cur->random) cur->next->random = cur->random->next;
    struct Node *newHead = head->next;
    for (struct Node *cur = head; cur; cur = cur->next) {
        struct Node *c = cur->next;
        cur->next = c->next;
        c->next = c->next ? c->next->next : NULL;
    }
    return newHead;
}`,
        cpp: `Node* copyRandomList(Node* head) {
    if (!head) return nullptr;
    for (Node* cur = head; cur; cur = cur->next->next) {
        Node* c = new Node(cur->val);
        c->next = cur->next;
        cur->next = c;
    }
    for (Node* cur = head; cur; cur = cur->next->next)
        if (cur->random) cur->next->random = cur->random->next;
    Node* newHead = head->next;
    for (Node* cur = head; cur; cur = cur->next) {
        Node* c = cur->next;
        cur->next = c->next;
        c->next = c->next ? c->next->next : nullptr;
    }
    return newHead;
}`,
        java: `Node copyRandomList(Node head) {
    if (head == null) return null;
    for (Node cur = head; cur != null; cur = cur.next.next) {
        Node c = new Node(cur.val);
        c.next = cur.next;
        cur.next = c;
    }
    for (Node cur = head; cur != null; cur = cur.next.next)
        if (cur.random != null) cur.next.random = cur.random.next;
    Node newHead = head.next;
    for (Node cur = head; cur != null; cur = cur.next) {
        Node c = cur.next;
        cur.next = c.next;
        c.next = c.next != null ? c.next.next : null;
    }
    return newHead;
}`,
        javascript: `function copyRandomList(head) {
  if (!head) return null;
  for (let cur = head; cur; cur = cur.next.next) cur.next = new Node(cur.val, cur.next, null);
  for (let cur = head; cur; cur = cur.next.next)
    if (cur.random) cur.next.random = cur.random.next;
  const newHead = head.next;
  for (let cur = head; cur; cur = cur.next) {
    const c = cur.next;
    cur.next = c.next;
    c.next = c.next ? c.next.next : null;
  }
  return newHead;
}`,
      },
    },
  ],
  pitfalls: [
    '新節點的 random 指到**舊**節點:看起來值都對,但不是深複製(本站的測試會檢查這件事)',
    '一輪就想把 random 接好:random 可能指向後面還沒做出來的節點',
    'map 版忘了處理 `null`:`map[None]` 要是 None,不然 `old.random` 是 null 時會查不到',
    '交錯版最後沒有把原串列拆回去:題目要求不能改壞原串列',
  ],
  followUp: [
    { q: '同一招用在圖上?', a: '[133. Clone Graph](#/q/133):一樣用「舊 → 新」的 map,搭配 DFS / BFS 走過所有節點,也順便防止重複複製。' },
  ],
  check: {
    kind: 'fn',
    fn: 'copyRandomList',
    argKinds: ['randomList'],
    ret: 'randomList',
    cases: [
      { args: [L], out: L },
      { args: [[[1, 1], [2, 1]]], out: [[1, 1], [2, 1]] },
      { args: [[[3, null], [3, 0], [3, null]]], out: [[3, null], [3, 0], [3, null]] },
      { args: [[]], out: [] },
      { args: [[[5, 0]]], out: [[5, 0]] },
    ],
  },
}
