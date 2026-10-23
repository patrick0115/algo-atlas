import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 895. Maximum Frequency Stack

const PUSH = [5, 7, 5, 7, 4, 5]

function groupFig(): FigStep[] {
  return [
    { note: `依序 push ${PUSH.join('、')}。兩張表:freq[x] = x 目前出現幾次;group[f] = 「第 f 次出現時被 push 的值」組成的堆疊`, views: [kv([[5, 3], [7, 2], [4, 1]], 'freq'), arr([5, 7, 4], { label: 'group[1]' }), arr([5, 7], { label: 'group[2]' }), arr([5], { label: 'group[3]' })] },
    { note: '同一個值會同時待在好幾層(5 在第 1、2、3 層都有),這樣它的「舊身分」不會丟失。maxf = 3', views: [arr([5], { label: 'group[3](最高層)', highlight: [0] })] },
    { note: 'pop:從最高層 group[maxf] 的頂端拿 → 5;freq[5] 變 2;第 3 層空了 → maxf = 2', views: [kv([[5, 2], [7, 2], [4, 1]], 'freq', [5]), arr([5, 7], { label: 'group[2](現在最高)' })] },
    { note: '再 pop:group[2] 頂端是 7(同頻率時最近 push 的先出,堆疊剛好就是這個順序)→ 7。每個操作都是 O(1)', views: [arr([5], { label: 'group[2]' }), kv([[5, 2], [7, 1], [4, 1]], 'freq', [7])] },
  ]
}

function heapFig(): FigStep[] {
  return [
    { note: '另一種:每次 push 時把 (頻率, 時間戳, 值) 放進最大堆積;頻率高的優先,一樣高時時間戳大的(比較新)優先', views: [arr(['(3,5,5)', '(2,3,7)', '(2,2,5)', '(1,4,4)', '(1,1,7)', '(1,0,5)'], { label: '堆積(依優先順序)' })] },
    { note: 'pop 時取堆積頂 (3,5,5) → 5,freq[5] 減 1。舊的 (2,2,5) 還在堆積裡,代表「第 2 次出現的 5」,之後會在正確的時機被拿出來。push / pop 是 O(log n)', views: [arr(['(2,3,7)', '(2,2,5)', '(1,4,4)', '(1,1,7)', '(1,0,5)'], { label: '堆積', highlight: [0] })] },
  ]
}

export const q0895: Solution = {
  id: 895,
  plain: '一種特別的堆疊:pop 時不是拿最後放的,而是拿「出現次數最多」的那個值;如果有好幾個值次數一樣多,就拿其中最近放進去的。',
  statement: '設計類別 `FreqStack`:`push(val)` 推入整數;`pop()` 移除並回傳**出現頻率最高**的元素,若有多個並列,回傳最接近堆疊頂(最近推入)的那個。',
  examples: [
    { input: '["FreqStack","push","push","push","push","push","push","pop","pop","pop","pop"]\n[[],[5],[7],[5],[7],[4],[5],[],[],[],[]]', output: '[null,null,null,null,null,null,null,5,7,5,4]' },
  ],
  constraints: ['最多 2·10⁴ 次呼叫', 'pop 時保證非空'],
  insight: ['要同時知道「頻率」和「同頻率裡誰最新」', '觀察:一個值第 f 次被 push 時,把它放到「第 f 層」的堆疊;pop 時從最高層拿', '這樣同一層裡越晚 push 的越上面,剛好符合「同頻率取最近的」', '最高層空了,maxf 就減 1(下一層一定有東西)'],
  approaches: [
    {
      name: '頻率表 + 每個頻率一個堆疊',
      idea: '`freq[x]`、`group[f]`(堆疊)、`maxf`。push:`f = ++freq[x]`,`group[f].push(x)`;pop:從 `group[maxf]` pop。',
      steps: ['push(x):`f = freq[x] + 1`、`freq[x] = f`;`maxf = max(maxf, f)`;`group[f].append(x)`', 'pop:`x = group[maxf].pop()`;`freq[x] -= 1`', '`group[maxf]` 空了 → `maxf -= 1`;回傳 x'],
      figure: { title: `push ${PUSH.join(', ')} 後 pop`, steps: groupFig() },
      complexity: { time: 'push / pop 都是 O(1)', space: 'O(n)', why: '每次 push 只放進一層;pop 只看最高層。' },
      verdict: '最推薦,漂亮的 O(1) 設計。關鍵是「同一個值可以同時在好幾層」。',
      code: {
        python: `class FreqStack:
    def __init__(self):
        self.freq = {}
        self.group = {}                       # 頻率 f → 堆疊(第 f 次出現時 push 的值)
        self.maxf = 0

    def push(self, val):
        f = self.freq.get(val, 0) + 1
        self.freq[val] = f
        self.maxf = max(self.maxf, f)
        self.group.setdefault(f, []).append(val)

    def pop(self):
        x = self.group[self.maxf].pop()       # 最高頻率裡最新的
        self.freq[x] -= 1
        if not self.group[self.maxf]:
            self.maxf -= 1                    # 下一層一定有東西
        return x`,
        c: `typedef struct { int key, f; UT_hash_handle hh; } Freq;
typedef struct { int *a, n, cap; } Stk;
typedef struct { Freq *freq; Stk g[20005]; int maxf; } FreqStack;

FreqStack *freqStackCreate() { return calloc(1, sizeof(FreqStack)); }

void freqStackPush(FreqStack *o, int val) {
    Freq *e;
    HASH_FIND_INT(o->freq, &val, e);
    if (!e) { e = calloc(1, sizeof(Freq)); e->key = val; HASH_ADD_INT(o->freq, key, e); }
    int f = ++e->f;
    if (f > o->maxf) o->maxf = f;
    Stk *s = &o->g[f];
    if (s->n == s->cap) s->a = realloc(s->a, (s->cap = s->cap * 2 + 4) * sizeof(int));
    s->a[s->n++] = val;
}

int freqStackPop(FreqStack *o) {
    Stk *s = &o->g[o->maxf];
    int x = s->a[--s->n];
    Freq *e;
    HASH_FIND_INT(o->freq, &x, e);
    e->f--;
    if (s->n == 0) o->maxf--;
    return x;
}

void freqStackFree(FreqStack *o) {
    Freq *e, *t;
    HASH_ITER(hh, o->freq, e, t) { HASH_DEL(o->freq, e); free(e); }
    for (int i = 0; i < 20005; i++) free(o->g[i].a);
    free(o);
}`,
        cpp: `class FreqStack {
    unordered_map<int, int> freq;
    unordered_map<int, vector<int>> group;
    int maxf = 0;
public:
    FreqStack() {}

    void push(int val) {
        int f = ++freq[val];
        maxf = max(maxf, f);
        group[f].push_back(val);
    }

    int pop() {
        int x = group[maxf].back();
        group[maxf].pop_back();
        freq[x]--;
        if (group[maxf].empty()) maxf--;
        return x;
    }
};`,
        java: `class FreqStack {
    private final Map<Integer, Integer> freq = new HashMap<>();
    private final Map<Integer, Deque<Integer>> group = new HashMap<>();
    private int maxf = 0;

    public FreqStack() {}

    public void push(int val) {
        int f = freq.merge(val, 1, Integer::sum);
        maxf = Math.max(maxf, f);
        group.computeIfAbsent(f, k -> new ArrayDeque<>()).push(val);
    }

    public int pop() {
        int x = group.get(maxf).pop();
        freq.merge(x, -1, Integer::sum);
        if (group.get(maxf).isEmpty()) maxf--;
        return x;
    }
}`,
        javascript: `class FreqStack {
  constructor() {
    this.freq = new Map();
    this.group = new Map();
    this.maxf = 0;
  }

  push(val) {
    const f = (this.freq.get(val) ?? 0) + 1;
    this.freq.set(val, f);
    this.maxf = Math.max(this.maxf, f);
    if (!this.group.has(f)) this.group.set(f, []);
    this.group.get(f).push(val);
  }

  pop() {
    const g = this.group.get(this.maxf);
    const x = g.pop();
    this.freq.set(x, this.freq.get(x) - 1);
    if (!g.length) this.maxf--;
    return x;
  }
}`,
      },
    },
    {
      name: '最大堆積 (頻率, 時間戳)',
      idea: 'push 時放 `(freq[x], 時間, x)` 進最大堆積;pop 取頂端,`freq[x] −= 1`。',
      steps: ['push:`freq[x] += 1`;`heappush((−freq[x], −time, x))`、`time += 1`', 'pop:`_, _, x = heappop()`;`freq[x] -= 1`;回傳 x'],
      figure: { title: `push ${PUSH.join(', ')} 後 pop`, steps: heapFig() },
      complexity: { time: 'push / pop 都是 O(log n)', space: 'O(n)', why: '堆積操作。' },
      verdict: '直接把「頻率優先、時間次之」寫成排序規則,不用想分層的技巧;只是慢一點。',
      code: {
        python: `import heapq

class FreqStack:
    def __init__(self):
        self.freq, self.heap, self.time = {}, [], 0

    def push(self, val):
        self.freq[val] = self.freq.get(val, 0) + 1
        # Python 是最小堆積,存負數:頻率高、時間晚的先出來
        heapq.heappush(self.heap, (-self.freq[val], -self.time, val))
        self.time += 1

    def pop(self):
        _, _, x = heapq.heappop(self.heap)
        self.freq[x] -= 1
        return x`,
        c: `typedef struct { int f, t, v; } Item;
typedef struct { int key, f; UT_hash_handle hh; } Freq;
typedef struct { Item *h; int n, cap, time; Freq *freq; } FreqStack;

static bool better(Item a, Item b) { return a.f != b.f ? a.f > b.f : a.t > b.t; }

FreqStack *freqStackCreate() { return calloc(1, sizeof(FreqStack)); }

void freqStackPush(FreqStack *o, int val) {
    Freq *e;
    HASH_FIND_INT(o->freq, &val, e);
    if (!e) { e = calloc(1, sizeof(Freq)); e->key = val; HASH_ADD_INT(o->freq, key, e); }
    e->f++;
    if (o->n == o->cap) o->h = realloc(o->h, (o->cap = o->cap * 2 + 8) * sizeof(Item));
    int i = o->n++;
    o->h[i] = (Item){e->f, o->time++, val};
    while (i && better(o->h[i], o->h[(i - 1) / 2])) {        // 往上浮
        Item t = o->h[i]; o->h[i] = o->h[(i - 1) / 2]; o->h[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
}

int freqStackPop(FreqStack *o) {
    int x = o->h[0].v;
    o->h[0] = o->h[--o->n];
    for (int i = 0;;) {                                    // 往下沉
        int b = i, l = 2 * i + 1, r = l + 1;
        if (l < o->n && better(o->h[l], o->h[b])) b = l;
        if (r < o->n && better(o->h[r], o->h[b])) b = r;
        if (b == i) break;
        Item t = o->h[i]; o->h[i] = o->h[b]; o->h[b] = t;
        i = b;
    }
    Freq *e;
    HASH_FIND_INT(o->freq, &x, e);
    e->f--;
    return x;
}

void freqStackFree(FreqStack *o) {
    Freq *e, *t;
    HASH_ITER(hh, o->freq, e, t) { HASH_DEL(o->freq, e); free(e); }
    free(o->h); free(o);
}`,
        cpp: `class FreqStack {
    unordered_map<int, int> freq;
    priority_queue<tuple<int, int, int>> pq;   // (頻率, 時間, 值),預設是最大堆積
    int time = 0;
public:
    FreqStack() {}

    void push(int val) { pq.emplace(++freq[val], time++, val); }

    int pop() {
        auto [f, t, x] = pq.top();
        pq.pop();
        freq[x]--;
        return x;
    }
};`,
        java: `class FreqStack {
    private final Map<Integer, Integer> freq = new HashMap<>();
    private final PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] != b[0] ? b[0] - a[0] : b[1] - a[1]);
    private int time = 0;

    public FreqStack() {}

    public void push(int val) {
        int f = freq.merge(val, 1, Integer::sum);
        pq.offer(new int[]{f, time++, val});
    }

    public int pop() {
        int x = pq.poll()[2];
        freq.merge(x, -1, Integer::sum);
        return x;
    }
}`,
        javascript: `class FreqStack {
  constructor() {
    this.freq = new Map();
    this.h = []; // 最大堆積,元素 [頻率, 時間, 值]
    this.time = 0;
  }

  better(a, b) {
    return a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1];
  }

  push(val) {
    const f = (this.freq.get(val) ?? 0) + 1;
    this.freq.set(val, f);
    const h = this.h;
    h.push([f, this.time++, val]);
    for (let i = h.length - 1; i && this.better(h[i], h[(i - 1) >> 1]); i = (i - 1) >> 1)
      [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
  }

  pop() {
    const h = this.h, top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ; ) {
        let b = i;
        const l = 2 * i + 1, r = l + 1;
        if (l < h.length && this.better(h[l], h[b])) b = l;
        if (r < h.length && this.better(h[r], h[b])) b = r;
        if (b === i) break;
        [h[i], h[b]] = [h[b], h[i]];
        i = b;
      }
    }
    this.freq.set(top[2], this.freq.get(top[2]) - 1);
    return top[2];
  }
}`,
      },
    },
  ],
  pitfalls: ['只記「每個值的頻率」再去找最大:每次 pop 要掃全部,O(n)', '同一個值只放在一層、pop 後再搬到下一層:會弄亂同頻率之間的先後順序'],
  check: {
    kind: 'class',
    cls: 'FreqStack',
    cases: [
      { ops: ['FreqStack', 'push', 'push', 'push', 'push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'], args: [[], [5], [7], [5], [7], [4], [5], [], [], [], []], out: [null, null, null, null, null, null, null, 5, 7, 5, 4] },
      { ops: ['FreqStack', 'push', 'push', 'pop', 'push', 'pop', 'pop'], args: [[], [1], [2], [], [1], [], []], out: [null, null, null, 2, null, 1, 1] },
    ],
  },
}
