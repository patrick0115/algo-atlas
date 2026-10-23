import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 707. Design Linked List

function singleFig(): FigStep[] {
  return [
    { note: '用一個假頭 d 加上 size。所有操作都化成「找到第 index 個的**前一個**節點 prev」,假頭讓 index = 0 也有前一個', views: [chain(['d'], { cls: { 0: 'dim' } })] },
    { note: 'addAtHead(1) = addAtIndex(0, 1);addAtTail(3) = addAtIndex(size, 3);addAtIndex(1, 2):prev 走 1 步(到 1),把 2 插在 prev 後面', views: [chain(['d', 1, 2, 3], { cls: { 0: 'dim', 1: 'cur', 2: 'hl' }, subs: { 1: 'prev' } })] },
    { note: 'get(1):從 d.next 走 1 步 → 2。deleteAtIndex(1):prev 走到 1,`prev.next = prev.next.next` 跳過 2', views: [chain(['d', 1, 3], { cls: { 0: 'dim', 1: 'cur' }, subs: { 1: 'prev' } })] },
    { note: 'index 不合法(< 0 或超過 size)時:get 回傳 −1、add / delete 什麼都不做', views: [chain([1, 3], { tail: true })] },
  ]
}

function doubleFig(): FigStep[] {
  return [
    { note: '雙向串列:頭尾各一個假節點,每個節點有 prev 和 next。找第 index 個時,看它離頭近還是離尾近,從近的那端走', views: [chain(['H', 1, 2, 3, 'T'], { cls: { 0: 'dim', 4: 'dim' }, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 3, 'dim'], [3, 2, 'dim'], [2, 1, 'dim'], [1, 0, 'dim']] })] },
    { note: '插入 / 刪除時要同時改前後兩邊的指標;好處是 addAtTail、靠近尾巴的操作都很快', views: [chain(['H', 1, 3, 'T'], { cls: { 0: 'dim', 3: 'dim' } })] },
  ]
}

export const q0707: Solution = {
  id: 707,
  plain: '自己動手做一條「鏈結串列」:可以取第 i 個值、在頭 / 尾 / 第 i 個位置插入、刪掉第 i 個。不能用語言內建的串列。',
  statement: '設計 `MyLinkedList`(0 起算的索引):`get(index)` 回傳第 index 個節點的值(無效回傳 −1);`addAtHead(val)`、`addAtTail(val)`;`addAtIndex(index, val)` 插在第 index 個之前(index == 長度時接在尾巴,> 長度則不插入);`deleteAtIndex(index)` 刪除第 index 個(有效時)。',
  examples: [
    { input: '["MyLinkedList","addAtHead","addAtTail","addAtIndex","get","deleteAtIndex","get"]\n[[],[1],[3],[1,2],[1],[1],[1]]', output: '[null,null,null,null,2,null,3]' },
  ],
  constraints: ['最多 2000 次呼叫', '0 ≤ index, val ≤ 1000'],
  insight: ['所有操作都是「找到第 index 個的前一個」再改指標', '假頭讓 index = 0 不用特判', 'addAtHead / addAtTail 都是 addAtIndex 的特例'],
  approaches: [
    {
      name: '單向串列 + 假頭 + size',
      idea: '`addAtIndex(i, v)`:i > size 不做;prev 從假頭走 i 步,插在 prev 後面。get / delete 同理。',
      steps: ['`d = Node(0)`、`size = 0`', 'get(i):無效 → −1;從 `d.next` 走 i 步', 'addAtIndex(i, v):`i > size` → return;prev 從 d 走 i 步;`prev.next = Node(v, prev.next)`;`size += 1`', 'deleteAtIndex(i):無效 → return;prev 走 i 步;`prev.next = prev.next.next`;`size -= 1`'],
      figure: { title: '範例操作', steps: singleFig() },
      complexity: { time: 'get / add / delete 都是 O(index)', space: 'O(n)', why: '要從頭走到位置。' },
      verdict: '最推薦,把五個操作收斂成「找 prev + 改一條指標」。',
      code: {
        python: `class Node:
    def __init__(self, val=0, nxt=None):
        self.val, self.next = val, nxt

class MyLinkedList:
    def __init__(self):
        self.d = Node()                       # 假頭
        self.size = 0

    def _prev(self, index):                   # 第 index 個的前一個
        p = self.d
        for _ in range(index):
            p = p.next
        return p

    def get(self, index):
        if index < 0 or index >= self.size:
            return -1
        return self._prev(index).next.val

    def addAtHead(self, val):
        self.addAtIndex(0, val)

    def addAtTail(self, val):
        self.addAtIndex(self.size, val)

    def addAtIndex(self, index, val):
        if index > self.size:
            return
        p = self._prev(max(index, 0))
        p.next = Node(val, p.next)
        self.size += 1

    def deleteAtIndex(self, index):
        if index < 0 or index >= self.size:
            return
        p = self._prev(index)
        p.next = p.next.next
        self.size -= 1`,
        c: `typedef struct LNode { int val; struct LNode *next; } LNode;
typedef struct { LNode d; int size; } MyLinkedList;

MyLinkedList *myLinkedListCreate() { return calloc(1, sizeof(MyLinkedList)); }

static LNode *prevOf(MyLinkedList *o, int index) {
    LNode *p = &o->d;
    while (index--) p = p->next;
    return p;
}

int myLinkedListGet(MyLinkedList *o, int index) {
    if (index < 0 || index >= o->size) return -1;
    return prevOf(o, index)->next->val;
}

void myLinkedListAddAtIndex(MyLinkedList *o, int index, int val) {
    if (index > o->size) return;
    if (index < 0) index = 0;
    LNode *p = prevOf(o, index), *n = malloc(sizeof(LNode));
    n->val = val; n->next = p->next; p->next = n;
    o->size++;
}

void myLinkedListAddAtHead(MyLinkedList *o, int val) { myLinkedListAddAtIndex(o, 0, val); }
void myLinkedListAddAtTail(MyLinkedList *o, int val) { myLinkedListAddAtIndex(o, o->size, val); }

void myLinkedListDeleteAtIndex(MyLinkedList *o, int index) {
    if (index < 0 || index >= o->size) return;
    LNode *p = prevOf(o, index), *x = p->next;
    p->next = x->next;
    free(x);
    o->size--;
}

void myLinkedListFree(MyLinkedList *o) {
    for (LNode *p = o->d.next, *q; p; p = q) { q = p->next; free(p); }
    free(o);
}`,
        cpp: `class MyLinkedList {
    struct Node { int val; Node *next; };
    Node d{0, nullptr};
    int size = 0;
    Node *prevOf(int index) { Node *p = &d; while (index--) p = p->next; return p; }
public:
    MyLinkedList() {}

    int get(int index) {
        if (index < 0 || index >= size) return -1;
        return prevOf(index)->next->val;
    }

    void addAtHead(int val) { addAtIndex(0, val); }
    void addAtTail(int val) { addAtIndex(size, val); }

    void addAtIndex(int index, int val) {
        if (index > size) return;
        Node *p = prevOf(max(index, 0));
        p->next = new Node{val, p->next};
        size++;
    }

    void deleteAtIndex(int index) {
        if (index < 0 || index >= size) return;
        Node *p = prevOf(index), *x = p->next;
        p->next = x->next;
        delete x;
        size--;
    }
};`,
        java: `class MyLinkedList {
    private static class Node { int val; Node next; Node(int v, Node n) { val = v; next = n; } }
    private final Node d = new Node(0, null);
    private int size = 0;

    public MyLinkedList() {}

    private Node prevOf(int index) {
        Node p = d;
        while (index-- > 0) p = p.next;
        return p;
    }

    public int get(int index) {
        if (index < 0 || index >= size) return -1;
        return prevOf(index).next.val;
    }

    public void addAtHead(int val) { addAtIndex(0, val); }
    public void addAtTail(int val) { addAtIndex(size, val); }

    public void addAtIndex(int index, int val) {
        if (index > size) return;
        Node p = prevOf(Math.max(index, 0));
        p.next = new Node(val, p.next);
        size++;
    }

    public void deleteAtIndex(int index) {
        if (index < 0 || index >= size) return;
        Node p = prevOf(index);
        p.next = p.next.next;
        size--;
    }
}`,
        javascript: `class MyLinkedList {
  constructor() {
    this.d = { val: 0, next: null };
    this.size = 0;
  }

  prevOf(index) {
    let p = this.d;
    while (index-- > 0) p = p.next;
    return p;
  }

  get(index) {
    if (index < 0 || index >= this.size) return -1;
    return this.prevOf(index).next.val;
  }

  addAtHead(val) {
    this.addAtIndex(0, val);
  }

  addAtTail(val) {
    this.addAtIndex(this.size, val);
  }

  addAtIndex(index, val) {
    if (index > this.size) return;
    const p = this.prevOf(Math.max(index, 0));
    p.next = { val, next: p.next };
    this.size++;
  }

  deleteAtIndex(index) {
    if (index < 0 || index >= this.size) return;
    const p = this.prevOf(index);
    p.next = p.next.next;
    this.size--;
  }
}`,
      },
    },
    {
      name: '雙向串列 + 頭尾假節點',
      idea: '每個節點有 prev / next;找第 index 個時從比較近的一端走。插入、刪除要同時改兩個方向的指標。',
      steps: ['`H`、`T` 兩個假節點互相連起來,`size = 0`', '`node(i)`:`i < size / 2` 從 H 往後走 i + 1 步,否則從 T 往前走 size − i 步', '插在第 i 個之前:`succ = node(i)`(i == size 時是 T),`pred = succ.prev`,接在兩者之間', '刪除:`x = node(i)`,`x.prev.next = x.next`、`x.next.prev = x.prev`'],
      figure: { title: '範例操作', steps: doubleFig() },
      complexity: { time: 'O(min(index, n − index))', space: 'O(n)', why: '從近的一端走。' },
      verdict: '比較接近語言內建 LinkedList 的實作;操作尾端的速度明顯比單向快,但每次要多改一倍的指標。',
      code: {
        python: `class Node:
    def __init__(self, val=0):
        self.val, self.prev, self.next = val, None, None

class MyLinkedList:
    def __init__(self):
        self.H, self.T = Node(), Node()       # 頭尾假節點
        self.H.next, self.T.prev = self.T, self.H
        self.size = 0

    def _node(self, i):                       # 第 i 個節點(i == size 時回傳 T)
        if i < self.size // 2:
            p = self.H.next
            for _ in range(i):
                p = p.next
        else:
            p = self.T
            for _ in range(self.size - i):
                p = p.prev
        return p

    def get(self, index):
        if index < 0 or index >= self.size:
            return -1
        return self._node(index).val

    def addAtHead(self, val):
        self.addAtIndex(0, val)

    def addAtTail(self, val):
        self.addAtIndex(self.size, val)

    def addAtIndex(self, index, val):
        if index > self.size:
            return
        succ = self._node(max(index, 0))
        pred, x = succ.prev, Node(val)
        x.prev, x.next = pred, succ
        pred.next = succ.prev = x
        self.size += 1

    def deleteAtIndex(self, index):
        if index < 0 or index >= self.size:
            return
        x = self._node(index)
        x.prev.next, x.next.prev = x.next, x.prev
        self.size -= 1`,
        c: `typedef struct DNode { int val; struct DNode *prev, *next; } DNode;
typedef struct { DNode H, T; int size; } MyLinkedList;

MyLinkedList *myLinkedListCreate() {
    MyLinkedList *o = calloc(1, sizeof(MyLinkedList));
    o->H.next = &o->T; o->T.prev = &o->H;
    return o;
}

static DNode *nodeAt(MyLinkedList *o, int i) {
    DNode *p;
    if (i < o->size / 2) { p = o->H.next; while (i--) p = p->next; }
    else { p = &o->T; for (int t = o->size - i; t > 0; t--) p = p->prev; }
    return p;
}

int myLinkedListGet(MyLinkedList *o, int index) {
    if (index < 0 || index >= o->size) return -1;
    return nodeAt(o, index)->val;
}

void myLinkedListAddAtIndex(MyLinkedList *o, int index, int val) {
    if (index > o->size) return;
    if (index < 0) index = 0;
    DNode *succ = nodeAt(o, index), *pred = succ->prev, *x = malloc(sizeof(DNode));
    x->val = val; x->prev = pred; x->next = succ;
    pred->next = x; succ->prev = x;
    o->size++;
}

void myLinkedListAddAtHead(MyLinkedList *o, int val) { myLinkedListAddAtIndex(o, 0, val); }
void myLinkedListAddAtTail(MyLinkedList *o, int val) { myLinkedListAddAtIndex(o, o->size, val); }

void myLinkedListDeleteAtIndex(MyLinkedList *o, int index) {
    if (index < 0 || index >= o->size) return;
    DNode *x = nodeAt(o, index);
    x->prev->next = x->next; x->next->prev = x->prev;
    free(x);
    o->size--;
}

void myLinkedListFree(MyLinkedList *o) {
    for (DNode *p = o->H.next, *q; p != &o->T; p = q) { q = p->next; free(p); }
    free(o);
}`,
        cpp: `class MyLinkedList {
    struct Node { int val; Node *prev = nullptr, *next = nullptr; };
    Node H, T;
    int size = 0;
    Node *nodeAt(int i) {
        Node *p;
        if (i < size / 2) { p = H.next; while (i--) p = p->next; }
        else { p = &T; for (int t = size - i; t > 0; t--) p = p->prev; }
        return p;
    }
public:
    MyLinkedList() { H.next = &T; T.prev = &H; }

    int get(int index) {
        if (index < 0 || index >= size) return -1;
        return nodeAt(index)->val;
    }

    void addAtHead(int val) { addAtIndex(0, val); }
    void addAtTail(int val) { addAtIndex(size, val); }

    void addAtIndex(int index, int val) {
        if (index > size) return;
        Node *succ = nodeAt(max(index, 0)), *pred = succ->prev;
        Node *x = new Node{val, pred, succ};
        pred->next = x; succ->prev = x;
        size++;
    }

    void deleteAtIndex(int index) {
        if (index < 0 || index >= size) return;
        Node *x = nodeAt(index);
        x->prev->next = x->next; x->next->prev = x->prev;
        delete x;
        size--;
    }
};`,
        java: `class MyLinkedList {
    private static class Node { int val; Node prev, next; Node(int v) { val = v; } }
    private final Node H = new Node(0), T = new Node(0);
    private int size = 0;

    public MyLinkedList() { H.next = T; T.prev = H; }

    private Node nodeAt(int i) {
        Node p;
        if (i < size / 2) { p = H.next; while (i-- > 0) p = p.next; }
        else { p = T; for (int t = size - i; t > 0; t--) p = p.prev; }
        return p;
    }

    public int get(int index) {
        if (index < 0 || index >= size) return -1;
        return nodeAt(index).val;
    }

    public void addAtHead(int val) { addAtIndex(0, val); }
    public void addAtTail(int val) { addAtIndex(size, val); }

    public void addAtIndex(int index, int val) {
        if (index > size) return;
        Node succ = nodeAt(Math.max(index, 0)), pred = succ.prev, x = new Node(val);
        x.prev = pred; x.next = succ;
        pred.next = x; succ.prev = x;
        size++;
    }

    public void deleteAtIndex(int index) {
        if (index < 0 || index >= size) return;
        Node x = nodeAt(index);
        x.prev.next = x.next; x.next.prev = x.prev;
        size--;
    }
}`,
        javascript: `class MyLinkedList {
  constructor() {
    this.H = { val: 0, prev: null, next: null };
    this.T = { val: 0, prev: null, next: null };
    this.H.next = this.T;
    this.T.prev = this.H;
    this.size = 0;
  }

  nodeAt(i) {
    let p;
    if (i < this.size >> 1) {
      p = this.H.next;
      while (i-- > 0) p = p.next;
    } else {
      p = this.T;
      for (let t = this.size - i; t > 0; t--) p = p.prev;
    }
    return p;
  }

  get(index) {
    if (index < 0 || index >= this.size) return -1;
    return this.nodeAt(index).val;
  }

  addAtHead(val) {
    this.addAtIndex(0, val);
  }

  addAtTail(val) {
    this.addAtIndex(this.size, val);
  }

  addAtIndex(index, val) {
    if (index > this.size) return;
    const succ = this.nodeAt(Math.max(index, 0)), pred = succ.prev;
    const x = { val, prev: pred, next: succ };
    pred.next = x;
    succ.prev = x;
    this.size++;
  }

  deleteAtIndex(index) {
    if (index < 0 || index >= this.size) return;
    const x = this.nodeAt(index);
    x.prev.next = x.next;
    x.next.prev = x.prev;
    this.size--;
  }
}`,
      },
    },
  ],
  pitfalls: ['addAtIndex 的 index == size 是合法的(接在尾巴),> size 才不合法', 'deleteAtIndex 的 index == size 不合法', '沒維護 size,每次都要重新數'],
  check: {
    kind: 'class',
    cls: 'MyLinkedList',
    cases: [
      { ops: ['MyLinkedList', 'addAtHead', 'addAtTail', 'addAtIndex', 'get', 'deleteAtIndex', 'get'], args: [[], [1], [3], [1, 2], [1], [1], [1]], out: [null, null, null, null, 2, null, 3] },
      {
        ops: ['MyLinkedList', 'addAtIndex', 'addAtIndex', 'get', 'addAtTail', 'addAtIndex', 'deleteAtIndex', 'deleteAtIndex', 'get', 'get', 'addAtHead', 'get'],
        args: [[], [1, 9], [0, 10], [0], [20], [2, 15], [3], [5], [2], [3], [7], [0]],
        out: [null, null, null, 10, null, null, null, null, 15, -1, null, 7],
      },
    ],
  },
}
