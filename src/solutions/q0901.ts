import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 901. Online Stock Span

const P = [100, 80, 60, 70, 60, 75, 85]

function stackFig(): FigStep[] {
  return [
    { note: '「跨度」= 今天往回數,連續幾天的價格 ≤ 今天(含今天)。堆疊存 (價格, 跨度),保持價格**嚴格遞減**', views: [arr(P, { label: '每天的價格' })] },
    { note: '100 → 1;80 → 1;60 → 1;70:彈出 60(跨度 1)併進來 → 70 的跨度 = 1 + 1 = 2', views: [arr(['(100,1)', '(80,1)', '(70,2)'], { label: '堆疊' })] },
    { note: '60 → 1;75:彈出 (60,1)、(70,2) → 1 + 1 + 2 = 4;85:彈出 (75,4)、(80,1) → 1 + 4 + 1 = 6。被彈出的天數直接「打包」進新的一天,不用再一天一天數', views: [arr(['(100,1)', '(85,6)'], { label: '堆疊' }), arr([1, 1, 1, 2, 1, 4, 6], { label: '跨度', done: [6] })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '簡單版:把所有價格存起來,每天從今天往回數,遇到比今天高的就停', views: [arr(P, { label: '價格', range: [3, 6] })] },
    { note: '85 往回數:75、60、70、60、80 都 ≤ 85,100 > 85 停 → 6。最壞每次 O(n)', views: [arr(P, { label: '價格', done: [1, 2, 3, 4, 5, 6] })] },
  ]
}

export const q0901: Solution = {
  id: 901,
  plain: '每天收到一個股價,馬上回答「今天的跨度」:從今天往回數,連續有幾天的股價都不超過今天(包含今天)。',
  statement: '設計 `StockSpanner`:`next(price)` 收到今天的股價,回傳今天的**跨度**:從今天往回(含今天)連續股價 ≤ 今天股價的最大天數。',
  examples: [
    { input: '["StockSpanner","next","next","next","next","next","next","next"]\n[[],[100],[80],[60],[70],[60],[75],[85]]', output: '[null,1,1,1,2,1,4,6]' },
  ],
  constraints: ['最多 10⁴ 次呼叫'],
  insight: ['往回找「第一個比今天高的那天」→ 單調堆疊', '比今天低(或相等)的那些天,以後也不會擋住任何人(今天已經比它們高)→ 可以彈出並把跨度加進今天', '堆疊存 (價格, 跨度),每天最多進出一次'],
  approaches: [
    {
      name: '單調堆疊存 (價格, 跨度)',
      idea: '`span = 1`;`while st and st[-1].price <= price`:`span += st.pop().span`;push (price, span)。',
      steps: ['`span = 1`', '頂端價格 ≤ 今天 → 彈出,`span += 它的跨度`', 'push `(price, span)`', '回傳 span'],
      figure: { title: `prices = [${P}]`, steps: stackFig() },
      complexity: { time: '平均 O(1)', space: 'O(n)', why: '每天最多 push、pop 各一次。' },
      verdict: '最推薦,[[p:monotonic-stack]]的線上版本:被打敗的元素把自己的「戰績」交給打敗它的人。',
      code: {
        python: `class StockSpanner:
    def __init__(self):
        self.st = []                          # (價格, 跨度),價格嚴格遞減

    def next(self, price):
        span = 1
        while self.st and self.st[-1][0] <= price:
            span += self.st.pop()[1]          # 比較低的那幾天全部併進來
        self.st.append((price, span))
        return span`,
        c: `typedef struct { int *p, *s, top; } StockSpanner;

StockSpanner *stockSpannerCreate() {
    StockSpanner *o = malloc(sizeof(StockSpanner));
    o->p = malloc(10005 * sizeof(int)); o->s = malloc(10005 * sizeof(int)); o->top = 0;
    return o;
}

int stockSpannerNext(StockSpanner *o, int price) {
    int span = 1;
    while (o->top && o->p[o->top - 1] <= price) span += o->s[--o->top];
    o->p[o->top] = price; o->s[o->top++] = span;
    return span;
}

void stockSpannerFree(StockSpanner *o) { free(o->p); free(o->s); free(o); }`,
        cpp: `class StockSpanner {
    vector<pair<int, int>> st;
public:
    StockSpanner() {}
    int next(int price) {
        int span = 1;
        while (!st.empty() && st.back().first <= price) { span += st.back().second; st.pop_back(); }
        st.push_back({price, span});
        return span;
    }
};`,
        java: `class StockSpanner {
    private final Deque<int[]> st = new ArrayDeque<>();

    public StockSpanner() {}

    public int next(int price) {
        int span = 1;
        while (!st.isEmpty() && st.peek()[0] <= price) span += st.pop()[1];
        st.push(new int[]{price, span});
        return span;
    }
}`,
        javascript: `class StockSpanner {
  constructor() {
    this.st = [];
  }

  next(price) {
    let span = 1;
    while (this.st.length && this.st[this.st.length - 1][0] <= price) span += this.st.pop()[1];
    this.st.push([price, span]);
    return span;
  }
}`,
      },
    },
    {
      name: '存全部價格,每天往回數',
      idea: '所有價格放進陣列;每天從最後往回數到第一個比今天高的。',
      steps: ['`prices.append(price)`', '`i = len − 2`;`while i >= 0 and prices[i] <= price`:`i -= 1`', '回傳 `len − 1 − i`'],
      figure: { title: `prices = [${P}]`, steps: bruteFig() },
      complexity: { time: '每次 O(n)', space: 'O(n)', why: '最壞要往回掃整個歷史(例如價格一直上漲)。' },
      verdict: '最直覺,10⁴ 次呼叫勉強能過;單調堆疊就是把「重複往回數」壓縮掉。',
      code: {
        python: `class StockSpanner:
    def __init__(self):
        self.prices = []

    def next(self, price):
        self.prices.append(price)
        i = len(self.prices) - 2
        while i >= 0 and self.prices[i] <= price:
            i -= 1                            # 一天一天往回數
        return len(self.prices) - 1 - i`,
        c: `typedef struct { int *p, n; } StockSpanner;

StockSpanner *stockSpannerCreate() {
    StockSpanner *o = malloc(sizeof(StockSpanner));
    o->p = malloc(10005 * sizeof(int)); o->n = 0;
    return o;
}

int stockSpannerNext(StockSpanner *o, int price) {
    o->p[o->n++] = price;
    int i = o->n - 2;
    while (i >= 0 && o->p[i] <= price) i--;
    return o->n - 1 - i;
}

void stockSpannerFree(StockSpanner *o) { free(o->p); free(o); }`,
        cpp: `class StockSpanner {
    vector<int> p;
public:
    StockSpanner() {}
    int next(int price) {
        p.push_back(price);
        int i = p.size() - 2;
        while (i >= 0 && p[i] <= price) i--;
        return p.size() - 1 - i;
    }
};`,
        java: `class StockSpanner {
    private final List<Integer> p = new ArrayList<>();

    public StockSpanner() {}

    public int next(int price) {
        p.add(price);
        int i = p.size() - 2;
        while (i >= 0 && p.get(i) <= price) i--;
        return p.size() - 1 - i;
    }
}`,
        javascript: `class StockSpanner {
  constructor() {
    this.p = [];
  }

  next(price) {
    this.p.push(price);
    let i = this.p.length - 2;
    while (i >= 0 && this.p[i] <= price) i--;
    return this.p.length - 1 - i;
  }
}`,
      },
    },
  ],
  pitfalls: ['比較用 `<` 而不是 `<=`:價格相等的天也要算進跨度', '只存價格不存跨度:被彈出的那幾天「代表的天數」就遺失了'],
  check: {
    kind: 'class',
    cls: 'StockSpanner',
    cases: [
      { ops: ['StockSpanner', 'next', 'next', 'next', 'next', 'next', 'next', 'next'], args: [[], ...P.map((x) => [x])], out: [null, 1, 1, 1, 2, 1, 4, 6] },
      { ops: ['StockSpanner', 'next', 'next', 'next', 'next'], args: [[], [5], [5], [5], [6]], out: [null, 1, 2, 3, 4] },
    ],
  },
}
