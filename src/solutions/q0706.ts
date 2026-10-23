import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 706. Design HashMap

function chainFig(): FigStep[] {
  return [
    { note: '和 [705](#/q/705) 一樣用桶 + 串列,只是每個節點多存一個 value:(key, value)。示範用 7 個桶', views: [arr(['[]', '[]', '[]', '[]', '[]', '[]', '[]'], { label: '桶 0..6' })] },
    { note: 'put(1, 10)、put(8, 80):都落在桶 1 → [(1,10), (8,80)]。put(1, 11):在桶 1 找到 key 1 → 改值,不是新增', views: [arr(['[]', '[(1,11), (8,80)]', '[]', '[]', '[]', '[]', '[]'], { label: '桶 0..6', highlight: [1] })] },
    { note: 'get(8):去桶 1 找 key 8 → 80;get(15):桶 1 裡沒有 → −1。remove(1):從桶 1 刪掉那個節點', views: [arr(['[]', '[(8,80)]', '[]', '[]', '[]', '[]', '[]'], { label: '桶 0..6', highlight: [1] })] },
  ]
}

function directFig(): FigStep[] {
  return [
    { note: 'key 範圍 0 ~ 10⁶:直接開長度 10⁶ + 1 的陣列,val[key] = 值,沒有的放 −1', views: [arr([-1, 11, -1, '…', 80], { label: 'val[0], val[1], val[2], …, val[8]' })] },
    { note: 'put 寫入、get 讀出、remove 設回 −1,全部 O(1)', views: [arr([-1, -1, -1, '…', 80], { label: 'remove(1) 之後' })] },
  ]
}

export const q0706: Solution = {
  id: 706,
  plain: '不用內建的 Map,自己做一個「鍵值對照表」:放入(或更新)一組 key → value、用 key 查 value、刪掉某個 key。',
  statement: '不使用內建雜湊表,設計 `MyHashMap`:`put(key, value)` 插入或更新;`get(key)` 回傳對應的值,不存在回傳 −1;`remove(key)` 刪除該 key。',
  examples: [
    { input: '["MyHashMap","put","put","get","get","put","get","remove","get"]\n[[],[1,1],[2,2],[1],[3],[2,1],[2],[2],[2]]', output: '[null,null,null,1,-1,null,1,null,-1]' },
  ],
  constraints: ['0 ≤ key, value ≤ 10⁶', '最多 10⁴ 次呼叫'],
  insight: ['HashSet 的節點多一個 value 就是 HashMap', 'put 時 key 已存在要「更新」而不是再加一筆', 'key 範圍小也可以直接定址'],
  approaches: [
    {
      name: '分離鏈結法(桶 + (key, value) 串列)',
      idea: '`buckets[key % M]` 存 (key, value);put 先找有沒有這個 key,有就改值,沒有就加入。',
      steps: ['`M` 取質數', 'put:在桶裡找 key → 找到就改 value,否則加入 (key, value)', 'get:在桶裡找 key → 回傳 value,找不到 −1', 'remove:在桶裡找到就刪'],
      figure: { title: '7 個桶的示範', steps: chainFig() },
      complexity: { time: '平均 O(n / M)', space: 'O(M + n)', why: '每條串列平均 n / M 個節點。' },
      verdict: '最推薦,雜湊表的標準實作。真實的實作還會在太擠時擴充桶數(rehash)。',
      code: {
        python: `class MyHashMap:
    M = 769

    def __init__(self):
        self.buckets = [[] for _ in range(self.M)]   # 每個桶:[[key, value], ...]

    def put(self, key, value):
        b = self.buckets[key % self.M]
        for pair in b:
            if pair[0] == key:
                pair[1] = value               # 已存在:更新
                return
        b.append([key, value])

    def get(self, key):
        for k, v in self.buckets[key % self.M]:
            if k == key:
                return v
        return -1

    def remove(self, key):
        b = self.buckets[key % self.M]
        for i, (k, _) in enumerate(b):
            if k == key:
                b.pop(i)
                return`,
        c: `#define M 769
typedef struct Node { int key, val; struct Node *next; } Node;
typedef struct { Node *b[M]; } MyHashMap;

MyHashMap *myHashMapCreate() { return calloc(1, sizeof(MyHashMap)); }

void myHashMapPut(MyHashMap *o, int key, int value) {
    for (Node *p = o->b[key % M]; p; p = p->next)
        if (p->key == key) { p->val = value; return; }
    Node *n = malloc(sizeof(Node));
    n->key = key; n->val = value; n->next = o->b[key % M];
    o->b[key % M] = n;
}

int myHashMapGet(MyHashMap *o, int key) {
    for (Node *p = o->b[key % M]; p; p = p->next) if (p->key == key) return p->val;
    return -1;
}

void myHashMapRemove(MyHashMap *o, int key) {
    for (Node **pp = &o->b[key % M]; *pp; pp = &(*pp)->next)
        if ((*pp)->key == key) { Node *d = *pp; *pp = d->next; free(d); return; }
}

void myHashMapFree(MyHashMap *o) {
    for (int i = 0; i < M; i++) for (Node *p = o->b[i], *q; p; p = q) { q = p->next; free(p); }
    free(o);
}`,
        cpp: `class MyHashMap {
    static const int M = 769;
    vector<list<pair<int, int>>> b;
public:
    MyHashMap() : b(M) {}

    void put(int key, int value) {
        for (auto &[k, v] : b[key % M]) if (k == key) { v = value; return; }
        b[key % M].push_back({key, value});
    }

    int get(int key) {
        for (auto &[k, v] : b[key % M]) if (k == key) return v;
        return -1;
    }

    void remove(int key) {
        b[key % M].remove_if([&](const pair<int, int> &p) { return p.first == key; });
    }
};`,
        java: `class MyHashMap {
    private static final int M = 769;
    private final List<LinkedList<int[]>> b = new ArrayList<>();

    public MyHashMap() { for (int i = 0; i < M; i++) b.add(new LinkedList<>()); }

    public void put(int key, int value) {
        for (int[] p : b.get(key % M)) if (p[0] == key) { p[1] = value; return; }
        b.get(key % M).add(new int[]{key, value});
    }

    public int get(int key) {
        for (int[] p : b.get(key % M)) if (p[0] == key) return p[1];
        return -1;
    }

    public void remove(int key) { b.get(key % M).removeIf(p -> p[0] == key); }
}`,
        javascript: `class MyHashMap {
  constructor() {
    this.M = 769;
    this.b = Array.from({ length: this.M }, () => []);
  }

  put(key, value) {
    const b = this.b[key % this.M];
    for (const p of b)
      if (p[0] === key) {
        p[1] = value;
        return;
      }
    b.push([key, value]);
  }

  get(key) {
    for (const [k, v] of this.b[key % this.M]) if (k === key) return v;
    return -1;
  }

  remove(key) {
    const b = this.b[key % this.M], i = b.findIndex((p) => p[0] === key);
    if (i >= 0) b.splice(i, 1);
  }
}`,
      },
    },
    {
      name: '直接定址陣列',
      idea: '`val = [-1] * (10⁶ + 1)`;put 寫入、get 讀出、remove 設回 −1。',
      steps: ['put:`val[key] = value`', 'get:`return val[key]`', 'remove:`val[key] = −1`'],
      figure: { title: 'key ∈ [0, 10⁶]', steps: directFig() },
      complexity: { time: 'O(1)', space: 'O(值域)', why: '固定 10⁶ + 1 格。' },
      verdict: '題目的值域剛好允許;拿來對照雜湊表「省空間、支援任意 key」的價值。',
      code: {
        python: `class MyHashMap:
    def __init__(self):
        self.val = [-1] * (10**6 + 1)         # −1 代表沒有

    def put(self, key, value):
        self.val[key] = value

    def get(self, key):
        return self.val[key]

    def remove(self, key):
        self.val[key] = -1`,
        c: `typedef struct { int val[1000001]; } MyHashMap;

MyHashMap *myHashMapCreate() {
    MyHashMap *o = malloc(sizeof(MyHashMap));
    memset(o->val, -1, sizeof o->val);        // 每個位元組 0xFF → 每個 int 都是 -1
    return o;
}
void myHashMapPut(MyHashMap *o, int key, int value) { o->val[key] = value; }
int myHashMapGet(MyHashMap *o, int key) { return o->val[key]; }
void myHashMapRemove(MyHashMap *o, int key) { o->val[key] = -1; }
void myHashMapFree(MyHashMap *o) { free(o); }`,
        cpp: `class MyHashMap {
    vector<int> val;
public:
    MyHashMap() : val(1000001, -1) {}
    void put(int key, int value) { val[key] = value; }
    int get(int key) { return val[key]; }
    void remove(int key) { val[key] = -1; }
};`,
        java: `class MyHashMap {
    private final int[] val = new int[1000001];

    public MyHashMap() { Arrays.fill(val, -1); }
    public void put(int key, int value) { val[key] = value; }
    public int get(int key) { return val[key]; }
    public void remove(int key) { val[key] = -1; }
}`,
        javascript: `class MyHashMap {
  constructor() {
    this.val = new Int32Array(1000001).fill(-1);
  }
  put(key, value) {
    this.val[key] = value;
  }
  get(key) {
    return this.val[key];
  }
  remove(key) {
    this.val[key] = -1;
  }
}`,
      },
    },
  ],
  pitfalls: ['put 已存在的 key 時新增一筆:get 可能拿到舊值', '用 0 代表「沒有」:value 本身可能就是 0,要用 −1(題目保證 value ≥ 0)'],
  check: {
    kind: 'class',
    cls: 'MyHashMap',
    cases: [
      { ops: ['MyHashMap', 'put', 'put', 'get', 'get', 'put', 'get', 'remove', 'get'], args: [[], [1, 1], [2, 2], [1], [3], [2, 1], [2], [2], [2]], out: [null, null, null, 1, -1, null, 1, null, -1] },
      { ops: ['MyHashMap', 'put', 'put', 'put', 'get', 'remove', 'get', 'get'], args: [[], [1, 0], [770, 5], [1, 9], [1], [770], [770], [1]], out: [null, null, null, null, 9, null, -1, 9] },
    ],
  },
}
