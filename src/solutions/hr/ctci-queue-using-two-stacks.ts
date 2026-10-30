import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const actions: [string, number?][] = [['push', 42], ['push', 14], ['peek'], ['pop'], ['push', 28], ['peek'], ['pop'], ['peek']]

function costlyFig(): FigStep[] {
  const out: FigStep[] = [], main: number[] = [], temp: number[] = []
  for (const [op, value] of actions) {
    if (op === 'push') {
      while (main.length) temp.push(main.pop()!)
      out.push({ note: `準備加入 ${value}：先把舊值搬到暫存，讓新值能放在主堆疊底部。`, views: [arr([...main], { label: '主堆疊' }), arr([...temp], { label: '暫存堆疊' })] })
      main.push(value!)
      while (temp.length) main.push(temp.pop()!)
    } else if (op === 'pop') main.pop()
    out.push({ note: `${op}${value === undefined ? '' : ` ${value}`} 後，主堆疊 ${main.join('、') || '空'}；頂端 ${main.at(-1) ?? '空'} 是最早加入者。`, views: [arr([...main], { label: '主堆疊，右端為頂' }), arr([...temp], { label: '暫存堆疊' })] })
  }
  return out
}

function lazyFig(): FigStep[] {
  const out: FigStep[] = [], incoming: number[] = [], outgoing: number[] = []
  for (const [op, value] of actions) {
    if (op === 'push') incoming.push(value!)
    else {
      if (!outgoing.length) {
        while (incoming.length) outgoing.push(incoming.pop()!)
        out.push({ note: `要 ${op} 且 out 空，將 in 全部反轉搬入 out；最早的 ${outgoing.at(-1)} 到頂端。`, views: [arr([...incoming], { label: 'in' }), arr([...outgoing], { label: 'out，右端為隊首' })] })
      }
      if (op === 'pop') outgoing.pop()
    }
    out.push({ note: `${op}${value === undefined ? '' : ` ${value}`} 後，in=[${incoming.join(',')}]、out=[${outgoing.join(',')}]；隊首 ${outgoing.at(-1) ?? incoming[0] ?? '空'}。`, views: [arr([...incoming], { label: 'in：新到的值' }), arr([...outgoing], { label: 'out：待取的值' })] })
  }
  return out
}

export const hrCtciQueueUsingTwoStacks: HrSolution = {
  slug: 'ctci-queue-using-two-stacks',
  plain: '像兩疊盤子接力排隊：把一整疊倒到另一疊，最早放進去的盤子就翻到最上面。',
  statement: '設計 `MyQueue`，只用兩個堆疊模擬先進先出。`push(x)` 從隊尾加入，`pop()` 移除隊首，`peek()` 回傳隊首但不移除。HackerRank 查詢 1 x、2、3 分別對應這三種操作，只有查詢 3 要印出結果；原題的 pop 只移除、不輸出，這裡的程式讓 pop 順便回傳被移除的值，方便測試。',
  examples: [
    { input: '1 42；2；1 14；3；1 28；3', output: '14；14', note: '42 已移除；之後 14 一直在 28 前方。' },
    { input: 'push(1), push(2), peek(), pop(), peek()', output: '1, 1, 2', note: '查看不移除；移除 1 後才輪到 2。' },
  ],
  constraints: [
    '查詢可大量出現 → 每次加入都搬動整個佇列會太慢。',
    'pop 與 peek 時有有效隊首 → 可直接從出隊堆疊讀頂端。',
    '底層限制兩個堆疊 → 用整批反轉恢復先進先出順序。',
  ],
  insight: [
    '一個堆疊頂端是最後加入者，與佇列要的最早加入者相反。',
    '直覺是每次 push 時搬空主堆疊再放新值，舊值搬回後最早元素仍在頂端；但連續加入很昂貴。',
    '改成新值只進 in，真正需要隊首且 out 空時才整批搬到 out；每個元素只會搬一次，所以攤銷 O(1)。這是 [[p:stack]] 的順序反轉，也可參考 [232](#/q/232)。',
  ],
  approaches: [
    {
      name: '每次加入都重新排列',
      idea: '讓主堆疊頂端永遠是隊首，push 時借另一堆疊搬動舊值。',
      steps: ['建立主堆疊與暫存堆疊。', 'push 時先把主堆疊全部搬到暫存，再放入新值，最後把暫存搬回。', 'pop 直接彈出主堆疊頂端；peek 直接讀頂端。'],
      figure: { title: '依序 push 42、push 14、peek、pop、push 28', steps: costlyFig() },
      complexity: { time: 'push O(n)，pop/peek O(1)', space: 'O(n)', why: '加入時搬動所有已有元素；兩個堆疊總共保存 n 個值。' },
      verdict: '能確保隊首在頂端，但大量 push 時成本高。',
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
            self.main.append(self.temp.pop())  # 最早元素回到頂端

    def pop(self):
        return self.main.pop()

    def peek(self):
        return self.main[-1]`,
        c: `typedef struct {
    int in[100000];
    int out[100000];
    int inSize;
    int outSize;
} MyQueue;

MyQueue* myQueueCreate(void) {
    return calloc(1, sizeof(MyQueue));
}

void myQueuePush(MyQueue* q, int x) {
    while (q->inSize) q->out[q->outSize++] = q->in[--q->inSize];
    q->in[q->inSize++] = x;
    while (q->outSize) q->in[q->inSize++] = q->out[--q->outSize];
}

int myQueuePop(MyQueue* q) {
    return q->in[--q->inSize];
}

int myQueuePeek(MyQueue* q) {
    return q->in[q->inSize - 1];
}

void myQueueFree(MyQueue* q) {
    free(q);
}`,
        cpp: `class MyQueue {
    stack<int> mainStack;
    stack<int> temp;
public:
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
};`,
        java: `class MyQueue {
    private final java.util.ArrayDeque<Integer> main = new java.util.ArrayDeque<>();
    private final java.util.ArrayDeque<Integer> temp = new java.util.ArrayDeque<>();

    public void push(int x) {
        while (!main.isEmpty()) temp.push(main.pop());
        main.push(x);
        while (!temp.isEmpty()) main.push(temp.pop());
    }
    public int pop() {
        return main.pop();
    }
    public int peek() {
        return main.peek();
    }
}`, 
        javascript: `class MyQueue {
  constructor() {
    this.main = [];
    this.temp = [];
  }
  push(x) {
    while (this.main.length) this.temp.push(this.main.pop());
    this.main.push(x);
    while (this.temp.length) this.main.push(this.temp.pop());
  }
  pop() {
    return this.main.pop();
  }
  peek() {
    return this.main[this.main.length - 1];
  }
}`,
      },
    },
    {
      name: '需要隊首時才整批反轉',
      idea: '新值先留在 in；out 空了才把 in 全部搬過去，隊首留在 out 頂端。',
      steps: ['建立 in 與 out 兩個堆疊。', 'push(x) 只把 x 放進 in。', 'pop 或 peek 前若 out 為空，逐個把 in 頂端搬入 out。', 'pop 彈出 out 頂端；peek 讀 out 頂端。'],
      figure: { title: '依序 push 42、push 14、peek、pop、push 28', steps: lazyFig() },
      complexity: { time: '每項攤銷 O(1)', space: 'O(n)', why: '每個元素入 in 一次、最多搬到 out 一次、最後出 out 一次；總工作量 O(操作數)。' },
      verdict: '大量混合操作下仍有效率，是應選的實作。',
      code: {
        python: `class MyQueue:
    def __init__(self):
        self.incoming = []
        self.outgoing = []

    def push(self, x):
        self.incoming.append(x)

    def shift(self):
        if not self.outgoing:
            while self.incoming:
                self.outgoing.append(self.incoming.pop())  # 整批反轉一次

    def pop(self):
        self.shift()
        return self.outgoing.pop()

    def peek(self):
        self.shift()
        return self.outgoing[-1]`,
        c: `typedef struct {
    int in[100000];
    int out[100000];
    int inSize;
    int outSize;
} MyQueue;

MyQueue* myQueueCreate(void) {
    return calloc(1, sizeof(MyQueue));
}

void myQueuePush(MyQueue* q, int x) {
    q->in[q->inSize++] = x;
}

void myQueueShift(MyQueue* q) {
    if (q->outSize == 0) {
        while (q->inSize) q->out[q->outSize++] = q->in[--q->inSize];
    }
}

int myQueuePop(MyQueue* q) {
    myQueueShift(q);
    return q->out[--q->outSize];
}

int myQueuePeek(MyQueue* q) {
    myQueueShift(q);
    return q->out[q->outSize - 1];
}

void myQueueFree(MyQueue* q) {
    free(q);
}`,
        cpp: `class MyQueue {
    stack<int> incoming;
    stack<int> outgoing;
    void shift() {
        if (outgoing.empty()) {
            while (!incoming.empty()) {
                outgoing.push(incoming.top());
                incoming.pop();
            }
        }
    }
public:
    void push(int x) {
        incoming.push(x);
    }
    int pop() {
        shift();
        int value = outgoing.top();
        outgoing.pop();
        return value;
    }
    int peek() {
        shift();
        return outgoing.top();
    }
};`,
        java: `class MyQueue {
    private final java.util.ArrayDeque<Integer> incoming = new java.util.ArrayDeque<>();
    private final java.util.ArrayDeque<Integer> outgoing = new java.util.ArrayDeque<>();

    public void push(int x) {
        incoming.push(x);
    }
    private void shift() {
        if (outgoing.isEmpty()) {
            while (!incoming.isEmpty()) outgoing.push(incoming.pop());
        }
    }
    public int pop() {
        shift();
        return outgoing.pop();
    }
    public int peek() {
        shift();
        return outgoing.peek();
    }
}`, 
        javascript: `class MyQueue {
  constructor() {
    this.incoming = [];
    this.outgoing = [];
  }
  push(x) {
    this.incoming.push(x);
  }
  shift() {
    if (!this.outgoing.length) {
      while (this.incoming.length) this.outgoing.push(this.incoming.pop());
    }
  }
  pop() {
    this.shift();
    return this.outgoing.pop();
  }
  peek() {
    this.shift();
    return this.outgoing[this.outgoing.length - 1];
  }
}`,
      },
    },
  ],
  pitfalls: [
    'out 尚有舊元素時不能搬 in，否則較新元素會排到舊元素前。',
    'peek 只讀隊首，不能順便移除。',
    '平均 O(1) 不表示每次都 O(1)；第一次搬動一批元素時仍可能花 O(n)。',
  ],
  check: {
    kind: 'class', cls: 'MyQueue', cases: [
      { ops: ['MyQueue', 'push', 'push', 'peek', 'pop', 'peek'], args: [[], [1], [2], [], [], []], out: [null, null, null, 1, 1, 2] },
      { ops: ['MyQueue', 'push', 'peek', 'pop'], args: [[], [5], [], []], out: [null, null, 5, 5] },
      { ops: ['MyQueue', 'push', 'push', 'pop', 'pop'], args: [[], [2], [2], [], []], out: [null, null, null, 2, 2] },
      { ops: ['MyQueue', 'push', 'push', 'pop', 'push', 'peek'], args: [[], [3], [4], [], [5], []], out: [null, null, null, 3, null, 4] },
      { ops: ['MyQueue', 'push', 'push', 'push', 'peek'], args: [[], [1], [2], [3], []], out: [null, null, null, null, 1] },
      { ops: ['MyQueue', 'push', 'pop', 'push', 'peek'], args: [[], [9], [], [8], []], out: [null, null, 9, null, 8] },
    ],
  },
}
