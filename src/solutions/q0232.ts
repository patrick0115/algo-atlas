import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

function costlyFig(): FigStep[] {
  return [
    { note: '主堆疊頂端（右邊）必須是最早入隊的 1，才能直接 pop、peek。push 1 後主堆疊是 [1]。', views: [arr([1], { label: '主堆疊：右邊是頂端' })] },
    { note: '要 push 2，先把主堆疊的 1 搬到暫存堆疊。', views: [arr([], { label: '主堆疊' }), arr([1], { label: '暫存堆疊' })] },
    { note: '主堆疊放 2，再把暫存的 1 搬回，主堆疊變 [2,1]，頂端仍是 1。', views: [arr([2, 1], { label: '主堆疊', highlight: [1] })] },
    { note: 'push 3 後變 [3,2,1]；pop 直接取出頂端 1，peek 接著看到 2。', views: [arr([3, 2], { label: 'pop 之後', highlight: [1] })] },
  ]
}

function lazyFig(): FigStep[] {
  return [
    { note: 'push 1、2、3 時只放入 in 堆疊，內容 [1,2,3]，頂端是 3。', views: [arr([1, 2, 3], { label: 'in：右邊是頂端' }), arr([], { label: 'out' })] },
    { note: '第一次 peek 或 pop 發現 out 為空，就把 in 全部逐個搬到 out，順序反轉成 [3,2,1]。', views: [arr([], { label: 'in' }), arr([3, 2, 1], { label: 'out：右邊是頂端', highlight: [2] })] },
    { note: 'pop 從 out 取出 1；即使之後 push 4，也先留在 in，不要插到 out 的 2、3 前面。', views: [arr([4], { label: 'in' }), arr([3, 2], { label: 'out', highlight: [1] })] },
    { note: '等 out 被拿空才再次搬 in。每個元素最多進出兩個堆疊各一次。', views: [arr([4], { label: '下一批待搬' }), arr([], { label: 'out 已空' })] },
  ]
}

export const q0232: Solution = {
  id: 232,
  plain: '用兩個只能從尾端取出的堆疊，模擬先進先出的佇列。',
  statement: '實作 MyQueue：`push(x)` 從隊尾加入、`pop()` 取出隊首、`peek()` 查看隊首、`empty()` 判斷是否為空；底層只使用堆疊操作。',
  examples: [{ input: '["MyQueue","push","push","peek","pop","empty"]\n[[],[1],[2],[],[],[]]', output: '[null,null,null,1,1,false]' }],
  constraints: ['最多 100 次操作。', 'pop、peek 時保證佇列非空。'],
  insight: ['堆疊後進先出，佇列先進先出；搬到另一個堆疊一次就會反轉順序。', '可以每次 push 都搬，或等到真的要取隊首且 out 空了才搬；後者有攤銷 O(1) 成本。'],
  approaches: [
    {
      name: 'push 時維持隊首在堆疊頂',
      idea: '每次加入新值，先搬空主堆疊，放新值，再把舊值搬回；主堆疊頂端永遠是最早元素。',
      steps: ['push 時把主堆疊全部搬到暫存。', '新值放進主堆疊，再把暫存搬回。', 'pop、peek 直接用主堆疊頂端。'],
      figure: { title: 'push 1、2、3 後 pop', steps: costlyFig() },
      complexity: { time: 'push O(n)，pop/peek/empty O(1)', space: 'O(n)', why: 'push 要搬動現有 n 個值兩次。' },
      verdict: '容易確認順序，但連續 push 的成本高。',
      code: {
        python: `class MyQueue:
    def __init__(self):
        self.main = []
        self.temp = []

    def push(self, x):
        while self.main:
            self.temp.append(self.main.pop())
        self.main.append(x)
        while self.temp:
            self.main.append(self.temp.pop())  # 舊隊首重新回到頂端

    def pop(self):
        return self.main.pop()

    def peek(self):
        return self.main[-1]

    def empty(self):
        return not self.main`,
        c: `typedef struct {
    int main[128];
    int temp[128];
    int mainSize;
    int tempSize;
} MyQueue;

MyQueue *myQueueCreate() {
    return calloc(1, sizeof(MyQueue));
}

void myQueuePush(MyQueue *q, int x) {
    while (q->mainSize) {
        q->temp[q->tempSize++] = q->main[--q->mainSize];
    }
    q->main[q->mainSize++] = x;
    while (q->tempSize) {
        q->main[q->mainSize++] = q->temp[--q->tempSize];
    }
}

int myQueuePop(MyQueue *q) {
    return q->main[--q->mainSize];
}

int myQueuePeek(MyQueue *q) {
    return q->main[q->mainSize - 1];
}

bool myQueueEmpty(MyQueue *q) {
    return q->mainSize == 0;
}

void myQueueFree(MyQueue *q) {
    free(q);
}`,
        cpp: `class MyQueue {
    stack<int> mainStack;
    stack<int> temp;
public:
    MyQueue() {}

    void push(int x) {
        while (!mainStack.empty()) {
            temp.push(mainStack.top());
            mainStack.pop();
        }
        mainStack.push(x);
        while (!temp.empty()) {
            mainStack.push(temp.top());
            temp.pop();
        }
    }

    int pop() {
        int value = mainStack.top();
        mainStack.pop();
        return value;
    }

    int peek() {
        return mainStack.top();
    }

    bool empty() {
        return mainStack.empty();
    }
};`,
        java: `class MyQueue {
    private final Deque<Integer> main = new ArrayDeque<>();
    private final Deque<Integer> temp = new ArrayDeque<>();

    public MyQueue() {}

    public void push(int x) {
        while (!main.isEmpty()) {
            temp.push(main.pop());
        }
        main.push(x);
        while (!temp.isEmpty()) {
            main.push(temp.pop());
        }
    }

    public int pop() {
        return main.pop();
    }

    public int peek() {
        return main.peek();
    }

    public boolean empty() {
        return main.isEmpty();
    }
}`, 
        javascript: `class MyQueue {
  constructor() {
    this.main = [];
    this.temp = [];
  }

  push(x) {
    while (this.main.length) {
      this.temp.push(this.main.pop());
    }
    this.main.push(x);
    while (this.temp.length) {
      this.main.push(this.temp.pop());
    }
  }

  pop() {
    return this.main.pop();
  }

  peek() {
    return this.main[this.main.length - 1];
  }

  empty() {
    return this.main.length === 0;
  }
}`,
      },
    },
    {
      name: '兩堆疊延後搬移',
      idea: 'push 只放進 in；pop/peek 優先從 out 取，只有 out 空時才把 in 全部搬過來。',
      steps: ['push：放進 in。', 'pop/peek：若 out 空，把 in 全部搬到 out。', 'pop 從 out 取頂；peek 看 out 頂。', 'empty 檢查兩個堆疊是否都空。'],
      figure: { title: 'push 1、2、3 後 pop', steps: lazyFig() },
      complexity: { time: '每個操作攤銷 O(1)', space: 'O(n)', why: '每個值最多進出 in、out 各一次。' },
      verdict: '標準解法；不要在 out 還有舊值時搬入新值。',
      code: {
        python: `class MyQueue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def push(self, x):
        self.in_stack.append(x)

    def move(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())  # 只在必要時反轉

    def pop(self):
        self.move()
        return self.out_stack.pop()

    def peek(self):
        self.move()
        return self.out_stack[-1]

    def empty(self):
        return not self.in_stack and not self.out_stack`,
        c: `typedef struct {
    int in[128];
    int out[128];
    int inSize;
    int outSize;
} MyQueue;

MyQueue *myQueueCreate() {
    return calloc(1, sizeof(MyQueue));
}

void myQueuePush(MyQueue *q, int x) {
    q->in[q->inSize++] = x;
}

void move232(MyQueue *q) {
    if (q->outSize == 0) {
        while (q->inSize) {
            q->out[q->outSize++] = q->in[--q->inSize];
        }
    }
}

int myQueuePop(MyQueue *q) {
    move232(q);
    return q->out[--q->outSize];
}

int myQueuePeek(MyQueue *q) {
    move232(q);
    return q->out[q->outSize - 1];
}

bool myQueueEmpty(MyQueue *q) {
    return q->inSize == 0 && q->outSize == 0;
}

void myQueueFree(MyQueue *q) {
    free(q);
}`,
        cpp: `class MyQueue {
    stack<int> in;
    stack<int> out;

    void move() {
        if (out.empty()) {
            while (!in.empty()) {
                out.push(in.top());
                in.pop();
            }
        }
    }
public:
    MyQueue() {}

    void push(int x) {
        in.push(x);
    }

    int pop() {
        move();
        int value = out.top();
        out.pop();
        return value;
    }

    int peek() {
        move();
        return out.top();
    }

    bool empty() {
        return in.empty() && out.empty();
    }
};`,
        java: `class MyQueue {
    private final Deque<Integer> in = new ArrayDeque<>();
    private final Deque<Integer> out = new ArrayDeque<>();

    public MyQueue() {}

    private void move() {
        if (out.isEmpty()) {
            while (!in.isEmpty()) {
                out.push(in.pop());
            }
        }
    }

    public void push(int x) {
        in.push(x);
    }

    public int pop() {
        move();
        return out.pop();
    }

    public int peek() {
        move();
        return out.peek();
    }

    public boolean empty() {
        return in.isEmpty() && out.isEmpty();
    }
}`, 
        javascript: `class MyQueue {
  constructor() {
    this.in = [];
    this.out = [];
  }

  move() {
    if (this.out.length === 0) {
      while (this.in.length) {
        this.out.push(this.in.pop());
      }
    }
  }

  push(x) {
    this.in.push(x);
  }

  pop() {
    this.move();
    return this.out.pop();
  }

  peek() {
    this.move();
    return this.out[this.out.length - 1];
  }

  empty() {
    return this.in.length === 0 && this.out.length === 0;
  }
}`,
      },
    },
  ],
  pitfalls: ['延後搬移版只在 out 為空時搬，否則新值會跑到舊值前面。', 'empty 必須同時檢查 in 和 out。'],
  check: { kind: 'class', cls: 'MyQueue', cases: [{ ops: ['MyQueue', 'push', 'push', 'peek', 'pop', 'empty'], args: [[], [1], [2], [], [], []], out: [null, null, null, 1, 1, false] }, { ops: ['MyQueue', 'push', 'push', 'pop', 'push', 'peek', 'pop', 'pop', 'empty'], args: [[], [1], [2], [], [3], [], [], [], []], out: [null, null, null, 1, null, 2, 2, 3, true] }] },
}
