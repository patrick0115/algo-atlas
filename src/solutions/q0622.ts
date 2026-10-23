import { arr } from '../engine/helpers'
import { chain } from './fig'
import type { FigStep, Solution } from './types'

// 622. Design Circular Queue

function ringFig(): FigStep[] {
  return [
    { note: '容量 k = 3。用長度 3 的陣列,head = 隊首的位置,count = 目前有幾個。隊尾的位置 = (head + count − 1) % k', views: [arr(['', '', ''], { label: '陣列', pointers: [{ name: 'head', index: 0 }] })] },
    { note: 'enQueue 1、2、3:依序放在 (head + count) % k → 滿了。再 enQueue 4 → count == k,回傳 false', views: [arr([1, 2, 3], { label: '陣列(滿)', pointers: [{ name: 'head', index: 0 }] })] },
    { note: 'deQueue:head 往前一格 (head + 1) % k、count − 1。舊的 1 不用清掉,之後會被覆蓋', views: [arr([1, 2, 3], { label: '陣列', dim: [0], pointers: [{ name: 'head', index: 1 }] })] },
    { note: 'enQueue 4:放在 (1 + 2) % 3 = 0 → **繞回開頭**。這就是「環狀」:陣列頭尾相接,空間重複使用', views: [arr([4, 2, 3], { label: '陣列', highlight: [0], pointers: [{ name: 'head', index: 1 }] })] },
  ]
}

function listFig(): FigStep[] {
  return [
    { note: '也可以用單向串列:head 指隊首、tail 指隊尾,另外記 count 和容量', views: [chain([2, 3], { subs: { 0: 'head', 1: 'tail' } })] },
    { note: 'enQueue 在 tail 後面接一個新節點;deQueue 把 head 往後移。不會「繞回」,但每次都要配置新節點', views: [chain([2, 3, 4], { subs: { 0: 'head', 2: 'tail' }, cls: { 2: 'hl' } })] },
  ]
}

export const q0622: Solution = {
  id: 622,
  plain: '做一個「固定大小」的排隊系統:從後面加入、從前面離開,滿了就不能再加。特別的是,用完的空間要能重複使用 —— 隊伍的尾巴可以繞回陣列的開頭。',
  statement: '設計 `MyCircularQueue(k)`:`enQueue(value)` 成功回傳 true;`deQueue()` 成功回傳 true;`Front()` / `Rear()` 回傳隊首 / 隊尾,空的時候回傳 −1;`isEmpty()`、`isFull()`。',
  examples: [
    { input: '["MyCircularQueue","enQueue","enQueue","enQueue","enQueue","Rear","isFull","deQueue","enQueue","Rear"]\n[[3],[1],[2],[3],[4],[],[],[],[4],[]]', output: '[null,true,true,true,false,3,true,true,true,4]' },
  ],
  constraints: ['k ≤ 1000,最多 3000 次呼叫'],
  insight: ['一般陣列當佇列:前面離開的位置就浪費了', '環狀:索引用 % k 繞回來,前面空出來的位置可以重用', '只要記 head 和 count,隊尾 = (head + count − 1) % k;滿 / 空都用 count 判斷,不會搞混'],
  approaches: [
    {
      name: '環狀陣列(head + count)',
      idea: 'enQueue 放在 `(head + count) % k`;deQueue `head = (head + 1) % k`;count 記數量。',
      steps: ['`q = [0] * k`、`head = count = 0`', 'enQueue:滿了 → false;否則 `q[(head + count) % k] = v`、`count += 1`', 'deQueue:空 → false;否則 `head = (head + 1) % k`、`count -= 1`', 'Front:`q[head]`;Rear:`q[(head + count − 1) % k]`'],
      figure: { title: 'k = 3', steps: ringFig() },
      complexity: { time: '每個操作 O(1)', space: 'O(k)', why: '固定大小的陣列。' },
      verdict: '最推薦。用 count 而不是只用兩個指標,就不用為「空 / 滿時兩個指標都相等」傷腦筋。',
      code: {
        python: `class MyCircularQueue:
    def __init__(self, k):
        self.q, self.k = [0] * k, k
        self.head = self.count = 0

    def enQueue(self, value):
        if self.count == self.k:
            return False
        self.q[(self.head + self.count) % self.k] = value   # 繞回開頭
        self.count += 1
        return True

    def deQueue(self):
        if self.count == 0:
            return False
        self.head = (self.head + 1) % self.k
        self.count -= 1
        return True

    def Front(self):
        return -1 if self.count == 0 else self.q[self.head]

    def Rear(self):
        return -1 if self.count == 0 else self.q[(self.head + self.count - 1) % self.k]

    def isEmpty(self):
        return self.count == 0

    def isFull(self):
        return self.count == self.k`,
        c: `typedef struct { int *q, k, head, count; } MyCircularQueue;

MyCircularQueue *myCircularQueueCreate(int k) {
    MyCircularQueue *o = malloc(sizeof(MyCircularQueue));
    o->q = malloc(k * sizeof(int)); o->k = k; o->head = o->count = 0;
    return o;
}

bool myCircularQueueEnQueue(MyCircularQueue *o, int value) {
    if (o->count == o->k) return false;
    o->q[(o->head + o->count++) % o->k] = value;
    return true;
}

bool myCircularQueueDeQueue(MyCircularQueue *o) {
    if (o->count == 0) return false;
    o->head = (o->head + 1) % o->k;
    o->count--;
    return true;
}

int myCircularQueueFront(MyCircularQueue *o) { return o->count ? o->q[o->head] : -1; }
int myCircularQueueRear(MyCircularQueue *o) { return o->count ? o->q[(o->head + o->count - 1) % o->k] : -1; }
bool myCircularQueueIsEmpty(MyCircularQueue *o) { return o->count == 0; }
bool myCircularQueueIsFull(MyCircularQueue *o) { return o->count == o->k; }
void myCircularQueueFree(MyCircularQueue *o) { free(o->q); free(o); }`,
        cpp: `class MyCircularQueue {
    vector<int> q;
    int head = 0, count = 0;
public:
    MyCircularQueue(int k) : q(k) {}

    bool enQueue(int value) {
        if (isFull()) return false;
        q[(head + count++) % q.size()] = value;
        return true;
    }

    bool deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % q.size();
        count--;
        return true;
    }

    int Front() { return isEmpty() ? -1 : q[head]; }
    int Rear() { return isEmpty() ? -1 : q[(head + count - 1) % q.size()]; }
    bool isEmpty() { return count == 0; }
    bool isFull() { return count == (int)q.size(); }
};`,
        java: `class MyCircularQueue {
    private final int[] q;
    private int head = 0, count = 0;

    public MyCircularQueue(int k) { q = new int[k]; }

    public boolean enQueue(int value) {
        if (isFull()) return false;
        q[(head + count++) % q.length] = value;
        return true;
    }

    public boolean deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % q.length;
        count--;
        return true;
    }

    public int Front() { return isEmpty() ? -1 : q[head]; }
    public int Rear() { return isEmpty() ? -1 : q[(head + count - 1) % q.length]; }
    public boolean isEmpty() { return count == 0; }
    public boolean isFull() { return count == q.length; }
}`,
        javascript: `class MyCircularQueue {
  constructor(k) {
    this.q = new Array(k);
    this.head = 0;
    this.count = 0;
  }

  enQueue(value) {
    if (this.isFull()) return false;
    this.q[(this.head + this.count++) % this.q.length] = value;
    return true;
  }

  deQueue() {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.q.length;
    this.count--;
    return true;
  }

  Front() {
    return this.isEmpty() ? -1 : this.q[this.head];
  }

  Rear() {
    return this.isEmpty() ? -1 : this.q[(this.head + this.count - 1) % this.q.length];
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.q.length;
  }
}`,
      },
    },
    {
      name: '單向串列',
      idea: '`head`、`tail` 兩個指標,加上 `count`、`cap`;enQueue 接在 tail 後面,deQueue 移動 head。',
      steps: ['enQueue:滿了 → false;新節點接在 tail 後面(空的時候 head = tail = 新節點)', 'deQueue:空 → false;`head = head.next`', 'Front:`head.val`;Rear:`tail.val`'],
      figure: { title: 'k = 3', steps: listFig() },
      complexity: { time: '每個操作 O(1)', space: 'O(k)', why: '最多 k 個節點。' },
      verdict: '比較好想,但每次都要建立節點、記憶體不連續;環狀陣列通常更快。',
      code: {
        python: `class Node:
    def __init__(self, val):
        self.val, self.next = val, None

class MyCircularQueue:
    def __init__(self, k):
        self.cap, self.count = k, 0
        self.head = self.tail = None

    def enQueue(self, value):
        if self.count == self.cap:
            return False
        node = Node(value)
        if self.count == 0:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node
        self.count += 1
        return True

    def deQueue(self):
        if self.count == 0:
            return False
        self.head = self.head.next
        self.count -= 1
        return True

    def Front(self):
        return -1 if self.count == 0 else self.head.val

    def Rear(self):
        return -1 if self.count == 0 else self.tail.val

    def isEmpty(self):
        return self.count == 0

    def isFull(self):
        return self.count == self.cap`,
        c: `typedef struct QNode { int val; struct QNode *next; } QNode;
typedef struct { QNode *head, *tail; int count, cap; } MyCircularQueue;

MyCircularQueue *myCircularQueueCreate(int k) {
    MyCircularQueue *o = calloc(1, sizeof(MyCircularQueue));
    o->cap = k;
    return o;
}

bool myCircularQueueEnQueue(MyCircularQueue *o, int value) {
    if (o->count == o->cap) return false;
    QNode *n = malloc(sizeof(QNode));
    n->val = value; n->next = NULL;
    if (o->count == 0) o->head = o->tail = n;
    else { o->tail->next = n; o->tail = n; }
    o->count++;
    return true;
}

bool myCircularQueueDeQueue(MyCircularQueue *o) {
    if (o->count == 0) return false;
    QNode *d = o->head;
    o->head = d->next;
    free(d);
    o->count--;
    return true;
}

int myCircularQueueFront(MyCircularQueue *o) { return o->count ? o->head->val : -1; }
int myCircularQueueRear(MyCircularQueue *o) { return o->count ? o->tail->val : -1; }
bool myCircularQueueIsEmpty(MyCircularQueue *o) { return o->count == 0; }
bool myCircularQueueIsFull(MyCircularQueue *o) { return o->count == o->cap; }
void myCircularQueueFree(MyCircularQueue *o) {
    while (o->count) myCircularQueueDeQueue(o);
    free(o);
}`,
        cpp: `class MyCircularQueue {
    struct Node { int val; Node *next; };
    Node *head = nullptr, *tail = nullptr;
    int count = 0, cap;
public:
    MyCircularQueue(int k) : cap(k) {}

    bool enQueue(int value) {
        if (count == cap) return false;
        Node *n = new Node{value, nullptr};
        if (count == 0) head = tail = n;
        else { tail->next = n; tail = n; }
        count++;
        return true;
    }

    bool deQueue() {
        if (count == 0) return false;
        Node *d = head;
        head = head->next;
        delete d;
        count--;
        return true;
    }

    int Front() { return count ? head->val : -1; }
    int Rear() { return count ? tail->val : -1; }
    bool isEmpty() { return count == 0; }
    bool isFull() { return count == cap; }
};`,
        java: `class MyCircularQueue {
    private static class Node { int val; Node next; Node(int v) { val = v; } }
    private Node head, tail;
    private int count = 0;
    private final int cap;

    public MyCircularQueue(int k) { cap = k; }

    public boolean enQueue(int value) {
        if (count == cap) return false;
        Node n = new Node(value);
        if (count == 0) head = tail = n;
        else { tail.next = n; tail = n; }
        count++;
        return true;
    }

    public boolean deQueue() {
        if (count == 0) return false;
        head = head.next;
        count--;
        return true;
    }

    public int Front() { return count == 0 ? -1 : head.val; }
    public int Rear() { return count == 0 ? -1 : tail.val; }
    public boolean isEmpty() { return count == 0; }
    public boolean isFull() { return count == cap; }
}`,
        javascript: `class MyCircularQueue {
  constructor(k) {
    this.cap = k;
    this.count = 0;
    this.head = this.tail = null;
  }

  enQueue(value) {
    if (this.count === this.cap) return false;
    const n = { val: value, next: null };
    if (this.count === 0) this.head = this.tail = n;
    else {
      this.tail.next = n;
      this.tail = n;
    }
    this.count++;
    return true;
  }

  deQueue() {
    if (this.count === 0) return false;
    this.head = this.head.next;
    this.count--;
    return true;
  }

  Front() {
    return this.count === 0 ? -1 : this.head.val;
  }

  Rear() {
    return this.count === 0 ? -1 : this.tail.val;
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.cap;
  }
}`,
      },
    },
  ],
  pitfalls: ['只用 head、tail 兩個指標:空和滿的時候兩者可能相等,要多留一格或另外記數量', 'Rear 的位置算成 `(head + count) % k`:那是「下一個要放的位置」,要再減 1'],
  check: {
    kind: 'class',
    cls: 'MyCircularQueue',
    cases: [
      { ops: ['MyCircularQueue', 'enQueue', 'enQueue', 'enQueue', 'enQueue', 'Rear', 'isFull', 'deQueue', 'enQueue', 'Rear'], args: [[3], [1], [2], [3], [4], [], [], [], [4], []], out: [null, true, true, true, false, 3, true, true, true, 4] },
      { ops: ['MyCircularQueue', 'Front', 'Rear', 'isEmpty', 'deQueue', 'enQueue', 'Front', 'Rear', 'deQueue', 'isEmpty'], args: [[1], [], [], [], [], [7], [], [], [], []], out: [null, -1, -1, true, false, true, 7, 7, true, true] },
    ],
  },
}
