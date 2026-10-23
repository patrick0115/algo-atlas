import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 225. Implement Stack using Queues

function oneQFig(): FigStep[] {
  return [
    { note: '佇列是「先進先出」,堆疊要「後進先出」。只用一個佇列的訣竅:每次 push 新元素後,把它**前面的元素全部轉到後面**,新元素就跑到最前面了', views: [arr([1, 2], { label: '佇列(左邊是隊首)' })] },
    { note: 'push 3:先放到隊尾 → [1, 2, 3]', views: [arr([1, 2, 3], { label: '佇列', highlight: [2] })] },
    { note: '再把前面 2 個依序「出隊、再入隊」:1 → 尾、2 → 尾 → [3, 1, 2]。現在隊首就是最後 push 的 3', views: [arr([3, 1, 2], { label: '佇列', highlight: [0] })] },
    { note: 'pop / top 直接看隊首:pop → 3,剩 [1, 2];top → 1……push 是 O(n),pop、top 是 O(1)', views: [arr([1, 2], { label: '佇列(pop 3 之後)', highlight: [0] })] },
  ]
}

function twoQFig(): FigStep[] {
  return [
    { note: '兩個佇列的版本:push 時直接放進 q1 的尾巴(O(1))', views: [arr([1, 2, 3], { label: 'q1' }), arr([], { label: 'q2' })] },
    { note: 'pop 時把 q1 前面 n−1 個搬到 q2,q1 只剩最後放進去的那個 → 取出它,再把 q1、q2 互換。pop 是 O(n)', views: [arr([3], { label: 'q1', highlight: [0] }), arr([1, 2], { label: 'q2' })] },
  ]
}

export const q0225: Solution = {
  id: 225,
  plain: '只能用「排隊」的方式(從後面加入、從前面離開)存資料,要怎麼模擬出「疊盤子」(最後放的最先拿)的行為?',
  statement: '只用佇列的標準操作(push 到尾、從頭 pop、peek 頭、size、empty),實作後進先出的堆疊 `MyStack`:`push(x)`、`pop()`、`top()`、`empty()`。',
  examples: [
    { input: '["MyStack","push","push","top","pop","empty"]\n[[],[1],[2],[],[],[]]', output: '[null,null,null,2,2,false]' },
  ],
  constraints: ['最多 100 次呼叫,pop / top 時保證非空', 'Follow-up:只用一個佇列'],
  insight: ['佇列的出口在前面,堆疊的出口要是「最新的」', '讓最新的元素待在佇列的最前面:push 後把它前面的全部轉到後面', '或者 push 很快、pop 時再把前面的搬走'],
  approaches: [
    {
      name: '一個佇列:push 時轉一圈',
      idea: 'push x 後,把前面 `size − 1` 個依序出隊再入隊,x 就到了隊首。',
      steps: ['push:`q.append(x)`;重複 `len(q) − 1` 次 `q.append(q.popleft())`', 'pop:`q.popleft()`', 'top:`q[0]`', 'empty:`len(q) == 0`'],
      figure: { title: 'push 1、2、3 之後 pop', steps: oneQFig() },
      complexity: { time: 'push O(n),其他 O(1)', space: 'O(n)', why: '每次 push 要轉 n − 1 個。' },
      verdict: '最推薦(Follow-up 的答案):只用一個佇列,邏輯集中在 push。',
      code: {
        python: `from collections import deque

class MyStack:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())   # 前面的轉到後面,x 變成隊首

    def pop(self):
        return self.q.popleft()

    def top(self):
        return self.q[0]

    def empty(self):
        return not self.q`,
        c: `// 用環狀陣列實作佇列
typedef struct {
    int a[128], head, size;
} MyStack;

static void enq(MyStack *s, int x) { s->a[(s->head + s->size++) % 128] = x; }
static int deq(MyStack *s) { int x = s->a[s->head]; s->head = (s->head + 1) % 128; s->size--; return x; }

MyStack *myStackCreate() { return calloc(1, sizeof(MyStack)); }

void myStackPush(MyStack *s, int x) {
    enq(s, x);
    for (int i = 0; i < s->size - 1; i++) enq(s, deq(s));
}

int myStackPop(MyStack *s) { return deq(s); }
int myStackTop(MyStack *s) { return s->a[s->head]; }
bool myStackEmpty(MyStack *s) { return s->size == 0; }
void myStackFree(MyStack *s) { free(s); }`,
        cpp: `class MyStack {
    queue<int> q;
public:
    MyStack() {}

    void push(int x) {
        q.push(x);
        for (size_t i = 0; i + 1 < q.size(); i++) { q.push(q.front()); q.pop(); }
    }

    int pop() { int x = q.front(); q.pop(); return x; }
    int top() { return q.front(); }
    bool empty() { return q.empty(); }
};`,
        java: `class MyStack {
    private final Queue<Integer> q = new ArrayDeque<>();

    public MyStack() {}

    public void push(int x) {
        q.offer(x);
        for (int i = 0; i < q.size() - 1; i++) q.offer(q.poll());
    }

    public int pop() { return q.poll(); }
    public int top() { return q.peek(); }
    public boolean empty() { return q.isEmpty(); }
}`,
        javascript: `class MyStack {
  constructor() {
    this.q = [];
  }

  push(x) {
    this.q.push(x);
    for (let i = 0; i < this.q.length - 1; i++) this.q.push(this.q.shift());
  }

  pop() {
    return this.q.shift();
  }

  top() {
    return this.q[0];
  }

  empty() {
    return this.q.length === 0;
  }
}`,
      },
    },
    {
      name: '兩個佇列:pop 時搬移',
      idea: 'push 直接放進 q1;pop 時把 q1 前 n−1 個搬到 q2,取出最後一個,兩個佇列互換。',
      steps: ['push:`q1.append(x)`', 'pop:前 n−1 個搬到 q2;取出 q1 剩下的那個;`q1, q2 = q2, q1`', 'top:同 pop,但取出的值要再放回去', 'empty:`q1` 是否為空'],
      figure: { title: 'push 1、2、3 之後 pop', steps: twoQFig() },
      complexity: { time: 'push O(1),pop / top O(n)', space: 'O(n)', why: '每次 pop 搬 n − 1 個。' },
      verdict: '把成本放在 pop。push 很多、pop 很少的時候比較划算。',
      code: {
        python: `from collections import deque

class MyStack:
    def __init__(self):
        self.q1, self.q2 = deque(), deque()

    def push(self, x):
        self.q1.append(x)

    def pop(self):
        while len(self.q1) > 1:
            self.q2.append(self.q1.popleft())  # 搬到只剩最後一個
        x = self.q1.popleft()
        self.q1, self.q2 = self.q2, self.q1
        return x

    def top(self):
        x = self.pop()
        self.q1.append(x)                     # 看完再放回去
        return x

    def empty(self):
        return not self.q1`,
        c: `typedef struct { int a[128], head, size; } Q;
static void enq(Q *q, int x) { q->a[(q->head + q->size++) % 128] = x; }
static int deq(Q *q) { int x = q->a[q->head]; q->head = (q->head + 1) % 128; q->size--; return x; }

typedef struct { Q q[2]; int cur; } MyStack;

MyStack *myStackCreate() { return calloc(1, sizeof(MyStack)); }

void myStackPush(MyStack *s, int x) { enq(&s->q[s->cur], x); }

int myStackPop(MyStack *s) {
    Q *a = &s->q[s->cur], *b = &s->q[1 - s->cur];
    while (a->size > 1) enq(b, deq(a));
    int x = deq(a);
    s->cur = 1 - s->cur;                    // 兩個佇列互換角色
    return x;
}

int myStackTop(MyStack *s) {
    int x = myStackPop(s);
    enq(&s->q[s->cur], x);
    return x;
}

bool myStackEmpty(MyStack *s) { return s->q[s->cur].size == 0; }
void myStackFree(MyStack *s) { free(s); }`,
        cpp: `class MyStack {
    queue<int> q1, q2;
public:
    MyStack() {}

    void push(int x) { q1.push(x); }

    int pop() {
        while (q1.size() > 1) { q2.push(q1.front()); q1.pop(); }
        int x = q1.front(); q1.pop();
        swap(q1, q2);
        return x;
    }

    int top() { int x = pop(); q1.push(x); return x; }
    bool empty() { return q1.empty(); }
};`,
        java: `class MyStack {
    private Queue<Integer> q1 = new ArrayDeque<>(), q2 = new ArrayDeque<>();

    public MyStack() {}

    public void push(int x) { q1.offer(x); }

    public int pop() {
        while (q1.size() > 1) q2.offer(q1.poll());
        int x = q1.poll();
        Queue<Integer> t = q1; q1 = q2; q2 = t;
        return x;
    }

    public int top() { int x = pop(); q1.offer(x); return x; }
    public boolean empty() { return q1.isEmpty(); }
}`,
        javascript: `class MyStack {
  constructor() {
    this.q1 = [];
    this.q2 = [];
  }

  push(x) {
    this.q1.push(x);
  }

  pop() {
    while (this.q1.length > 1) this.q2.push(this.q1.shift());
    const x = this.q1.shift();
    [this.q1, this.q2] = [this.q2, this.q1];
    return x;
  }

  top() {
    const x = this.pop();
    this.q1.push(x);
    return x;
  }

  empty() {
    return this.q1.length === 0;
  }
}`,
      },
    },
  ],
  pitfalls: ['一個佇列版轉了 size 次(而不是 size − 1 次):新元素又被轉回尾巴', '用語言內建的 list.pop() 從尾巴拿:那就不是佇列操作了'],
  check: {
    kind: 'class',
    cls: 'MyStack',
    cases: [
      { ops: ['MyStack', 'push', 'push', 'top', 'pop', 'empty'], args: [[], [1], [2], [], [], []], out: [null, null, null, 2, 2, false] },
      { ops: ['MyStack', 'push', 'push', 'push', 'pop', 'top', 'push', 'pop', 'pop', 'pop', 'empty'], args: [[], [1], [2], [3], [], [], [4], [], [], [], []], out: [null, null, null, null, 3, 2, null, 4, 2, 1, true] },
    ],
  },
}
