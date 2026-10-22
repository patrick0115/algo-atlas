import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 155. Min Stack

type Op = ['push', number] | ['pop'] | ['getMin'] | ['top']
const OPS: Op[] = [['push', 5], ['push', 3], ['push', 7], ['push', 3], ['getMin'], ['pop'], ['getMin'], ['pop'], ['pop'], ['getMin']]
const opText = (o: Op) => (o[0] === 'push' ? `push(${o[1]})` : `${o[0]}()`)

function pairFig(): FigStep[] {
  const st: [number, number][] = []
  const views = (hl = false) => [
    arr(st.map((p) => p[0]), { label: '值', highlight: hl && st.length ? [st.length - 1] : [] }),
    arr(st.map((p) => p[1]), { label: '到這一層為止的最小值', highlight: hl && st.length ? [st.length - 1] : [] }),
  ]
  const out: FigStep[] = [{ note: '每一層除了存值,也存「從底部到這一層的最小值」。pop 掉上面的層,下面那層記的最小值依然正確', views: views() }]
  for (const o of OPS) {
    if (o[0] === 'push') {
      const m = st.length ? Math.min(o[1], st[st.length - 1][1]) : o[1]
      st.push([o[1], m])
      out.push({ note: `${opText(o)}:這層的最小值 = min(${o[1]}, 下面那層的 ${st.length > 1 ? st[st.length - 2][1] : '(無)'}) = ${m}`, views: views(true) })
    } else if (o[0] === 'pop') {
      const p = st.pop()!
      out.push({ note: `${opText(o)}:拿掉 (${p[0]}, ${p[1]}),下面那層記的最小值不受影響`, views: views(true) })
    } else {
      out.push({ note: `${opText(o)}:直接看頂端記的最小值 → ${st[st.length - 1][1]}`, views: views(true) })
    }
  }
  return out
}

function auxFig(): FigStep[] {
  const st: number[] = []
  const mins: number[] = []
  const views = () => [arr(st, { label: '主堆疊', highlight: st.length ? [st.length - 1] : [] }), arr(mins, { label: '最小值堆疊(只在出現「新低或平手」時 push)', highlight: mins.length ? [mins.length - 1] : [] })]
  const out: FigStep[] = [{ note: '只有新的值 ≤ 目前最小值時,才放進最小值堆疊。省下「最小值一直沒變」的那些層', views: views() }]
  for (const o of OPS) {
    if (o[0] === 'push') {
      const x = o[1]
      st.push(x)
      const add = !mins.length || x <= mins[mins.length - 1]
      if (add) mins.push(x)
      out.push({ note: `${opText(o)}:${add ? `${x} ≤ 目前最小值,也 push 到最小值堆疊` : `${x} 比目前最小值 ${mins[mins.length - 1]} 大,最小值堆疊不動`}`, views: views() })
    } else if (o[0] === 'pop') {
      const x = st.pop()!
      const rm = x === mins[mins.length - 1]
      if (rm) mins.pop()
      out.push({ note: `${opText(o)}:彈出 ${x}${rm ? ',它就是目前最小值 → 最小值堆疊也要彈出' : ',不是目前最小值,最小值堆疊不動'}`, views: views() })
    } else {
      out.push({ note: `${opText(o)}:最小值堆疊的頂端 → ${mins[mins.length - 1]}`, views: views() })
    }
  }
  out.push({ note: '注意 push(3) 兩次時,兩個 3 都要進最小值堆疊(用 ≤ 而不是 <),不然第一次 pop 掉 3 之後就找不到另一個 3 了', views: views() })
  return out
}

function diffFig(): FigStep[] {
  const st: number[] = []
  let min = 0
  const views = () => [arr(st, { label: '堆疊存的是「值 − 當時的最小值」', highlight: st.length ? [st.length - 1] : [] }), arr(st.length ? [min] : [], { label: 'min(一個變數)' })]
  const out: FigStep[] = [{ note: '只用一個堆疊和一個變數 min:存「值 − 存入前的最小值」。差值是負的,代表這個值刷新了最小值', views: views() }]
  for (const o of OPS) {
    if (o[0] === 'push') {
      const x = o[1]
      if (!st.length) {
        st.push(0)
        min = x
        out.push({ note: `${opText(o)}:第一個元素,存 0,min = ${x}`, views: views() })
      } else {
        const d = x - min
        st.push(d)
        const old = min
        if (d < 0) min = x
        out.push({ note: `${opText(o)}:存 ${x} − ${old} = ${d}${d < 0 ? `,負的 → 刷新 min = ${x}` : ''}`, views: views() })
      }
    } else if (o[0] === 'pop') {
      const d = st.pop()!
      const old = min
      if (d < 0) min = min - d
      out.push({ note: `${opText(o)}:彈出差值 ${d}${d < 0 ? `,負的 → 被彈出的就是當時的最小值 ${old},還原上一個 min = ${old} − (${d}) = ${min}` : `,被彈出的值是 ${min} + ${d} = ${min + d}`}`, views: views() })
    } else if (o[0] === 'getMin') {
      out.push({ note: `${opText(o)}:直接回傳 min = ${min}`, views: views() })
    }
  }
  return out
}

export const q0155: Solution = {
  id: 155,
  statement: '設計一個堆疊,除了 `push`、`pop`、`top` 以外,還要能用 **O(1)** 時間回答 `getMin`(目前堆疊裡的最小值)。保證 `pop`、`top`、`getMin` 呼叫時堆疊不是空的。',
  examples: [
    {
      input: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()',
      output: '-3, 0, -2',
      note: 'pop 掉 -3 之後,最小值要「回到」-2',
    },
  ],
  constraints: [
    '值的範圍是 `-2³¹ ~ 2³¹−1` → 用差值法時差可能超過 int,要用 64 位元',
    '最多 3·10⁴ 次操作,**每個操作都要 O(1)**',
  ],
  insight: [
    '只用一個變數記最小值不夠:pop 掉最小值後,不知道「第二小」是誰,重掃一次是 O(n)',
    '關鍵:堆疊只會從頂端變動,所以**每一層下面的東西永遠不變**。那就在每一層記下「從底部到這一層的最小值」,pop 之後下一層記的答案還是對的',
    '省空間的版本:最小值只有在「新低」出現時才會變,所以另一個堆疊只記這些新低就好',
  ],
  approaches: [
    {
      name: '每層存 (值, 當下最小值)',
      idea: 'push `x` 時一起存 `min(x, 下一層的最小值)`。`getMin` 看頂端那層記的最小值。',
      steps: ['`push(x)`:`m = x` 如果空,否則 `min(x, 頂端.min)`;push `(x, m)`', '`pop()`:pop 一層', '`top()`:頂端的值', '`getMin()`:頂端的最小值'],
      figure: { title: OPS.map(opText).join('、'), steps: pairFig() },
      complexity: { time: '全部 O(1)', space: 'O(n)', why: '每個操作只碰頂端;每層多存一個數,共 2n 個。' },
      verdict: '最直覺、最不容易錯,標準答案。面試先寫這個。',
      code: {
        python: `class MinStack:
    def __init__(self):
        self.st = []                      # 每層是 (值, 到這層為止的最小值)

    def push(self, val):
        m = val if not self.st else min(val, self.st[-1][1])
        self.st.append((val, m))

    def pop(self):
        self.st.pop()

    def top(self):
        return self.st[-1][0]

    def getMin(self):
        return self.st[-1][1]`,
        c: `typedef struct {
    int *val, *mn;      // mn[i] = val[0..i] 的最小值
    int size, cap;
} MinStack;

MinStack *minStackCreate() {
    MinStack *s = malloc(sizeof(MinStack));
    s->cap = 16; s->size = 0;
    s->val = malloc(s->cap * sizeof(int));
    s->mn = malloc(s->cap * sizeof(int));
    return s;
}

void minStackPush(MinStack *s, int val) {
    if (s->size == s->cap) {
        s->cap *= 2;
        s->val = realloc(s->val, s->cap * sizeof(int));
        s->mn = realloc(s->mn, s->cap * sizeof(int));
    }
    int m = s->size && s->mn[s->size - 1] < val ? s->mn[s->size - 1] : val;
    s->val[s->size] = val;
    s->mn[s->size++] = m;
}

void minStackPop(MinStack *s) { s->size--; }
int minStackTop(MinStack *s) { return s->val[s->size - 1]; }
int minStackGetMin(MinStack *s) { return s->mn[s->size - 1]; }

void minStackFree(MinStack *s) {
    free(s->val); free(s->mn); free(s);
}`,
        cpp: `class MinStack {
    vector<pair<int, int>> st;              // (值, 到這層為止的最小值)
public:
    MinStack() {}

    void push(int val) {
        st.push_back({val, st.empty() ? val : min(val, st.back().second)});
    }

    void pop() { st.pop_back(); }
    int top() { return st.back().first; }
    int getMin() { return st.back().second; }
};`,
        java: `class MinStack {
    private final Deque<int[]> st = new ArrayDeque<>();   // {值, 到這層為止的最小值}

    public MinStack() {}

    public void push(int val) {
        st.push(new int[]{val, st.isEmpty() ? val : Math.min(val, st.peek()[1])});
    }

    public void pop() { st.pop(); }
    public int top() { return st.peek()[0]; }
    public int getMin() { return st.peek()[1]; }
}`,
        javascript: `class MinStack {
  constructor() {
    this.st = [];                         // [值, 到這層為止的最小值]
  }

  push(val) {
    const m = this.st.length ? Math.min(val, this.st[this.st.length - 1][1]) : val;
    this.st.push([val, m]);
  }

  pop() {
    this.st.pop();
  }

  top() {
    return this.st[this.st.length - 1][0];
  }

  getMin() {
    return this.st[this.st.length - 1][1];
  }
}`,
      },
    },
    {
      name: '輔助最小值堆疊(只存新低)',
      idea: '主堆疊照常存值;另一個堆疊只在 `x ≤ 目前最小值` 時 push。pop 的值剛好等於最小值堆疊頂端時,兩邊一起 pop。',
      steps: ['`push(x)`:主堆疊 push;`mins` 空或 `x ≤ mins.top` → `mins` 也 push', '`pop()`:主堆疊 pop 出 `x`;`x == mins.top` → `mins` 也 pop', '`getMin()`:`mins.top`'],
      figure: { title: OPS.map(opText).join('、'), steps: auxFig() },
      complexity: { time: '全部 O(1)', space: 'O(n)', why: '最壞(一直遞減)兩個堆疊都存 n 個;一般情況最小值堆疊小很多。' },
      verdict: '平均比方法一省空間。條件一定要用 `≤`:重複的最小值每一個都要記,不然 pop 掉其中一個就以為最小值沒了。',
      code: {
        python: `class MinStack:
    def __init__(self):
        self.st = []
        self.mins = []                    # 只放「新低或平手」的值

    def push(self, val):
        self.st.append(val)
        if not self.mins or val <= self.mins[-1]:
            self.mins.append(val)

    def pop(self):
        if self.st.pop() == self.mins[-1]:
            self.mins.pop()

    def top(self):
        return self.st[-1]

    def getMin(self):
        return self.mins[-1]`,
        c: `typedef struct {
    int *st, *mins;
    int n, m, cap;
} MinStack;

MinStack *minStackCreate() {
    MinStack *s = malloc(sizeof(MinStack));
    s->cap = 16; s->n = s->m = 0;
    s->st = malloc(s->cap * sizeof(int));
    s->mins = malloc(s->cap * sizeof(int));
    return s;
}

void minStackPush(MinStack *s, int val) {
    if (s->n == s->cap) {
        s->cap *= 2;
        s->st = realloc(s->st, s->cap * sizeof(int));
        s->mins = realloc(s->mins, s->cap * sizeof(int));
    }
    s->st[s->n++] = val;
    if (s->m == 0 || val <= s->mins[s->m - 1]) s->mins[s->m++] = val;
}

void minStackPop(MinStack *s) {
    if (s->st[--s->n] == s->mins[s->m - 1]) s->m--;
}

int minStackTop(MinStack *s) { return s->st[s->n - 1]; }
int minStackGetMin(MinStack *s) { return s->mins[s->m - 1]; }

void minStackFree(MinStack *s) {
    free(s->st); free(s->mins); free(s);
}`,
        cpp: `class MinStack {
    stack<int> st, mins;                    // mins 只放「新低或平手」的值
public:
    MinStack() {}

    void push(int val) {
        st.push(val);
        if (mins.empty() || val <= mins.top()) mins.push(val);
    }

    void pop() {
        if (st.top() == mins.top()) mins.pop();
        st.pop();
    }

    int top() { return st.top(); }
    int getMin() { return mins.top(); }
};`,
        java: `class MinStack {
    private final Deque<Integer> st = new ArrayDeque<>(), mins = new ArrayDeque<>();

    public MinStack() {}

    public void push(int val) {
        st.push(val);
        if (mins.isEmpty() || val <= mins.peek()) mins.push(val);
    }

    public void pop() {
        // Integer 物件要用 equals 比較,== 比的是參考
        if (st.pop().equals(mins.peek())) mins.pop();
    }

    public int top() { return st.peek(); }
    public int getMin() { return mins.peek(); }
}`,
        javascript: `class MinStack {
  constructor() {
    this.st = [];
    this.mins = [];                       // 只放「新低或平手」的值
  }

  push(val) {
    this.st.push(val);
    if (!this.mins.length || val <= this.mins[this.mins.length - 1]) this.mins.push(val);
  }

  pop() {
    if (this.st.pop() === this.mins[this.mins.length - 1]) this.mins.pop();
  }

  top() {
    return this.st[this.st.length - 1];
  }

  getMin() {
    return this.mins[this.mins.length - 1];
  }
}`,
      },
    },
    {
      name: '一個堆疊 + 存差值',
      idea: '只用一個變數 `min`。push `x` 時存 `x − min`(存之前的 min):差是負的就代表 `x` 是新的最小值。pop 到負的差值時,用它把上一個 `min` 還原回來。',
      steps: ['空的時候 push `x`:存 0,`min = x`', '否則存 `d = x − min`;`d < 0` → `min = x`', '`pop()`:彈出 `d`;`d < 0` → `min = min − d`(還原)', '`top()`:頂端 `d < 0` → 值就是 `min`;否則是 `min + d`'],
      figure: { title: OPS.map(opText).join('、'), steps: diffFig() },
      complexity: { time: '全部 O(1)', space: 'O(n)', why: '只有一個堆疊加一個變數。差值可能超出 int(例如 2³¹−1 − (−2³¹)),要用 64 位元整數存。' },
      verdict: '面試加分題,展示「用編碼把額外資訊藏進原本的資料」。實務上方法一、二更好讀;這招的重點是理解 `min − d` 為什麼能還原。',
      code: {
        python: `class MinStack:
    def __init__(self):
        self.st = []                      # 存「值 − 存入前的最小值」
        self.min = 0

    def push(self, val):
        if not self.st:
            self.st.append(0)
            self.min = val
        else:
            d = val - self.min
            self.st.append(d)
            if d < 0:
                self.min = val            # 新的最小值

    def pop(self):
        d = self.st.pop()
        if d < 0:
            self.min -= d                 # 被彈出的是最小值,還原上一個最小值

    def top(self):
        d = self.st[-1]
        return self.min if d < 0 else self.min + d

    def getMin(self):
        return self.min`,
        c: `typedef struct {
    long long *st;      // 存「值 − 存入前的最小值」,可能超出 int
    long long mn;
    int n, cap;
} MinStack;

MinStack *minStackCreate() {
    MinStack *s = malloc(sizeof(MinStack));
    s->cap = 16; s->n = 0; s->mn = 0;
    s->st = malloc(s->cap * sizeof(long long));
    return s;
}

void minStackPush(MinStack *s, int val) {
    if (s->n == s->cap) s->st = realloc(s->st, (s->cap *= 2) * sizeof(long long));
    if (s->n == 0) {
        s->st[s->n++] = 0;
        s->mn = val;
    } else {
        long long d = (long long)val - s->mn;
        s->st[s->n++] = d;
        if (d < 0) s->mn = val;
    }
}

void minStackPop(MinStack *s) {
    long long d = s->st[--s->n];
    if (d < 0) s->mn -= d;
}

int minStackTop(MinStack *s) {
    long long d = s->st[s->n - 1];
    return (int)(d < 0 ? s->mn : s->mn + d);
}

int minStackGetMin(MinStack *s) { return (int)s->mn; }

void minStackFree(MinStack *s) {
    free(s->st); free(s);
}`,
        cpp: `class MinStack {
    stack<long long> st;                    // 存「值 − 存入前的最小值」
    long long mn = 0;
public:
    MinStack() {}

    void push(int val) {
        if (st.empty()) { st.push(0); mn = val; return; }
        long long d = (long long)val - mn;
        st.push(d);
        if (d < 0) mn = val;
    }

    void pop() {
        long long d = st.top(); st.pop();
        if (d < 0) mn -= d;
    }

    int top() { return (int)(st.top() < 0 ? mn : mn + st.top()); }
    int getMin() { return (int)mn; }
};`,
        java: `class MinStack {
    private final Deque<Long> st = new ArrayDeque<>();   // 存「值 − 存入前的最小值」
    private long min;

    public MinStack() {}

    public void push(int val) {
        if (st.isEmpty()) { st.push(0L); min = val; return; }
        long d = (long) val - min;
        st.push(d);
        if (d < 0) min = val;
    }

    public void pop() {
        long d = st.pop();
        if (d < 0) min -= d;
    }

    public int top() {
        long d = st.peek();
        return (int) (d < 0 ? min : min + d);
    }

    public int getMin() { return (int) min; }
}`,
        javascript: `class MinStack {
  constructor() {
    this.st = [];                         // 存「值 − 存入前的最小值」
    this.min = 0;
  }

  push(val) {
    if (!this.st.length) {
      this.st.push(0);
      this.min = val;
      return;
    }
    const d = val - this.min;
    this.st.push(d);
    if (d < 0) this.min = val;
  }

  pop() {
    const d = this.st.pop();
    if (d < 0) this.min -= d;
  }

  top() {
    const d = this.st[this.st.length - 1];
    return d < 0 ? this.min : this.min + d;
  }

  getMin() {
    return this.min;
  }
}`,
      },
    },
  ],
  pitfalls: [
    '只用一個變數記最小值:pop 掉最小值後要重新掃一遍才知道新的最小值,`getMin` 就不是 O(1)',
    '輔助堆疊用 `<` 而不是 `≤`:push(3)、push(3)、pop() 之後最小值應該還是 3',
    'Java 的 `Integer` 用 `==` 比較,超過 -128~127 的快取範圍會比到參考,要用 `equals` 或先轉成 `int`',
    '差值法用 int 存會溢位:`push(-2³¹)` 之後 `push(2³¹−1)`,差是 2³²−1',
  ],
  followUp: [
    { q: '如果還要 O(1) 的 getMax?', a: '同樣的做法再多存一份「到這層為止的最大值」。' },
    { q: '佇列版本(Min Queue)呢?', a: '用兩個 Min Stack 組成佇列(push 進一個、pop 從另一個,空了才倒過去),每個操作平攤 O(1)。或用[[p:monotonic-queue]]維護最小值。' },
  ],
  check: {
    kind: 'class',
    cls: 'MinStack',
    cases: [
      {
        ops: ['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'],
        args: [[], [-2], [0], [-3], [], [], [], []],
        out: [null, null, null, null, -3, null, 0, -2],
      },
      {
        ops: ['MinStack', ...OPS.map((o) => o[0])],
        args: [[], ...OPS.map((o) => (o[0] === 'push' ? [o[1]] : []))],
        out: [null, null, null, null, null, 3, null, 3, null, null, 5],
      },
      {
        ops: ['MinStack', 'push', 'push', 'getMin', 'top', 'pop', 'getMin', 'top'],
        args: [[], [-2147483648], [2147483647], [], [], [], [], []],
        out: [null, null, null, -2147483648, 2147483647, null, -2147483648, -2147483648],
      },
    ],
  },
}
