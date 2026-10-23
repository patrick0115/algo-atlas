import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 705. Design HashSet

function bucketFig(): FigStep[] {
  return [
    { note: '雜湊集合的核心:用 key % 桶數 決定放在哪個「桶」,每個桶是一條小串列(處理撞在同一個桶的情況)。這裡用 7 個桶示範', views: [arr(['[]', '[]', '[]', '[]', '[]', '[]', '[]'], { label: '桶 0..6' })] },
    { note: 'add(1)、add(8)、add(15):1 % 7 = 1、8 % 7 = 1、15 % 7 = 1 → 全部撞在桶 1,串成一條', views: [arr(['[]', '[1, 8, 15]', '[]', '[]', '[]', '[]', '[]'], { label: '桶 0..6', highlight: [1] })] },
    { note: 'contains(8):算出桶 1,只在這一條裡找 → 找到。remove(8):從這條串列刪掉。桶數夠多、key 分散時,每條都很短 → 平均 O(1)', views: [arr(['[]', '[1, 15]', '[]', '[]', '[]', '[]', '[]'], { label: '桶 0..6', highlight: [1] })] },
  ]
}

function bitFig(): FigStep[] {
  return [
    { note: 'key 的範圍只有 0 ~ 10⁶,可以直接開一個長度 10⁶ + 1 的布林陣列:present[key] = 有沒有在集合裡', views: [arr(['F', 'T', 'F', 'F', '…', 'T(8)'], { label: 'present' })] },
    { note: '三個操作都是一次陣列存取,O(1)。代價是不管存幾個都要 10⁶ 格的空間(用位元陣列可以壓到約 125KB)', views: [arr(['add → 設 T', 'remove → 設 F', 'contains → 讀'], { label: '操作' })] },
  ]
}

export const q0705: Solution = {
  id: 705,
  plain: '不用任何內建的 Set,自己做一個「集合」:可以加入一個數、刪掉一個數、問某個數在不在裡面。',
  statement: '不使用內建雜湊表,設計 `MyHashSet`:`add(key)` 加入、`remove(key)` 刪除(不存在就不做事)、`contains(key)` 回傳是否存在。',
  examples: [
    { input: '["MyHashSet","add","add","contains","contains","add","contains","remove","contains"]\n[[],[1],[2],[1],[3],[2],[2],[2],[2]]', output: '[null,null,null,true,false,null,true,null,false]' },
  ],
  constraints: ['0 ≤ key ≤ 10⁶', '最多 10⁴ 次呼叫'],
  insight: ['雜湊表 = 「用一個函數把 key 變成陣列索引」+ 「處理碰撞」', '最常見的碰撞處理:每個桶一條串列(分離鏈結法)', 'key 範圍小時也可以直接用 key 當索引(直接定址)'],
  approaches: [
    {
      name: '分離鏈結法(桶 + 串列)',
      idea: '`buckets[key % M]` 是一個串列;add 時不在才加,remove 時刪掉,contains 在那條串列裡找。',
      steps: ['`M` = 一個質數(例如 769)', 'add:`b = buckets[key % M]`,key 不在 b 裡就加入', 'remove:在 b 裡就刪掉', 'contains:回傳 key 是否在 b 裡'],
      figure: { title: '7 個桶的示範', steps: bucketFig() },
      complexity: { time: '平均 O(n / M)', space: 'O(M + n)', why: '每條串列平均長度 n / M;M 取得夠大就接近 O(1)。' },
      verdict: '最推薦,這才是真正的雜湊表在做的事。桶數用質數能讓 key 分散得比較平均。',
      code: {
        python: `class MyHashSet:
    M = 769                                   # 桶數,用質數讓分布平均

    def __init__(self):
        self.buckets = [[] for _ in range(self.M)]

    def add(self, key):
        b = self.buckets[key % self.M]
        if key not in b:
            b.append(key)

    def remove(self, key):
        b = self.buckets[key % self.M]
        if key in b:
            b.remove(key)

    def contains(self, key):
        return key in self.buckets[key % self.M]`,
        c: `#define M 769
typedef struct Node { int key; struct Node *next; } Node;
typedef struct { Node *b[M]; } MyHashSet;

MyHashSet *myHashSetCreate() { return calloc(1, sizeof(MyHashSet)); }

bool myHashSetContains(MyHashSet *o, int key) {
    for (Node *p = o->b[key % M]; p; p = p->next) if (p->key == key) return true;
    return false;
}

void myHashSetAdd(MyHashSet *o, int key) {
    if (myHashSetContains(o, key)) return;
    Node *n = malloc(sizeof(Node));
    n->key = key; n->next = o->b[key % M];   // 插在串列開頭
    o->b[key % M] = n;
}

void myHashSetRemove(MyHashSet *o, int key) {
    for (Node **pp = &o->b[key % M]; *pp; pp = &(*pp)->next)
        if ((*pp)->key == key) { Node *d = *pp; *pp = d->next; free(d); return; }
}

void myHashSetFree(MyHashSet *o) {
    for (int i = 0; i < M; i++) for (Node *p = o->b[i], *q; p; p = q) { q = p->next; free(p); }
    free(o);
}`,
        cpp: `class MyHashSet {
    static const int M = 769;
    vector<list<int>> b;
public:
    MyHashSet() : b(M) {}

    void add(int key) { if (!contains(key)) b[key % M].push_back(key); }
    void remove(int key) { b[key % M].remove(key); }

    bool contains(int key) {
        for (int k : b[key % M]) if (k == key) return true;
        return false;
    }
};`,
        java: `class MyHashSet {
    private static final int M = 769;
    private final List<LinkedList<Integer>> b = new ArrayList<>();

    public MyHashSet() { for (int i = 0; i < M; i++) b.add(new LinkedList<>()); }

    public void add(int key) { if (!contains(key)) b.get(key % M).add(key); }
    public void remove(int key) { b.get(key % M).remove(Integer.valueOf(key)); }   // 刪「值」不是刪「索引」
    public boolean contains(int key) { return b.get(key % M).contains(key); }
}`,
        javascript: `class MyHashSet {
  constructor() {
    this.M = 769;
    this.b = Array.from({ length: this.M }, () => []);
  }

  add(key) {
    const b = this.b[key % this.M];
    if (!b.includes(key)) b.push(key);
  }

  remove(key) {
    const b = this.b[key % this.M], i = b.indexOf(key);
    if (i >= 0) b.splice(i, 1);
  }

  contains(key) {
    return this.b[key % this.M].includes(key);
  }
}`,
      },
    },
    {
      name: '直接定址(布林陣列)',
      idea: '`present = [False] * (10⁶ + 1)`,三個操作直接讀寫 `present[key]`。',
      steps: ['add:`present[key] = True`', 'remove:`present[key] = False`', 'contains:`return present[key]`'],
      figure: { title: 'key ∈ [0, 10⁶]', steps: bitFig() },
      complexity: { time: 'O(1)', space: 'O(值域)', why: '固定 10⁶ + 1 格。' },
      verdict: '最快最簡單,但只在 key 範圍小時能用;key 是任意整數或字串時就只能用雜湊。',
      code: {
        python: `class MyHashSet:
    def __init__(self):
        self.present = [False] * (10**6 + 1)

    def add(self, key):
        self.present[key] = True

    def remove(self, key):
        self.present[key] = False

    def contains(self, key):
        return self.present[key]`,
        c: `typedef struct { unsigned char bits[(1000001 + 7) / 8]; } MyHashSet;   // 每個 key 一個位元

MyHashSet *myHashSetCreate() { return calloc(1, sizeof(MyHashSet)); }
void myHashSetAdd(MyHashSet *o, int key) { o->bits[key >> 3] |= 1 << (key & 7); }
void myHashSetRemove(MyHashSet *o, int key) { o->bits[key >> 3] &= ~(1 << (key & 7)); }
bool myHashSetContains(MyHashSet *o, int key) { return o->bits[key >> 3] >> (key & 7) & 1; }
void myHashSetFree(MyHashSet *o) { free(o); }`,
        cpp: `class MyHashSet {
    bitset<1000001> present;
public:
    MyHashSet() {}
    void add(int key) { present.set(key); }
    void remove(int key) { present.reset(key); }
    bool contains(int key) { return present.test(key); }
};`,
        java: `class MyHashSet {
    private final boolean[] present = new boolean[1000001];

    public MyHashSet() {}
    public void add(int key) { present[key] = true; }
    public void remove(int key) { present[key] = false; }
    public boolean contains(int key) { return present[key]; }
}`,
        javascript: `class MyHashSet {
  constructor() {
    this.present = new Uint8Array(1000001);
  }
  add(key) {
    this.present[key] = 1;
  }
  remove(key) {
    this.present[key] = 0;
  }
  contains(key) {
    return this.present[key] === 1;
  }
}`,
      },
    },
  ],
  pitfalls: ['add 時沒檢查是否已存在:同一個 key 被存兩份,remove 只刪掉一份就還「在」', 'Java 的 `list.remove(key)` 會被當成「刪索引」,要用 `Integer.valueOf(key)`'],
  check: {
    kind: 'class',
    cls: 'MyHashSet',
    cases: [
      { ops: ['MyHashSet', 'add', 'add', 'contains', 'contains', 'add', 'contains', 'remove', 'contains'], args: [[], [1], [2], [1], [3], [2], [2], [2], [2]], out: [null, null, null, true, false, null, true, null, false] },
      { ops: ['MyHashSet', 'add', 'add', 'add', 'remove', 'contains', 'contains', 'remove', 'contains'], args: [[], [1], [770], [1000000], [770], [1], [770], [5], [1000000]], out: [null, null, null, null, null, true, false, null, true] },
    ],
  },
}
