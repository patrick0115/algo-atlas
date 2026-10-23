import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 460. LFU Cache

function bucketFig(): FigStep[] {
  return [
    { note: '容量 2。三張表:key → (value, 次數);次數 f → 這個次數的 key(依「最近使用」排好的有序集合);minf = 目前最小的次數', views: [kv([], 'key → (value, freq)'), kv([], 'freq → keys(舊 → 新)')] },
    { note: 'put(1,1)、put(2,2):兩個都是次數 1。get(1) → 1,key 1 的次數變 2,從 freq 1 的桶移到 freq 2 的桶', views: [kv([[1, '(1, f=2)'], [2, '(2, f=1)']], 'key → (value, freq)', [1]), kv([[1, '[2]'], [2, '[1]']], 'freq → keys', [2])] },
    { note: 'put(3,3):滿了,要淘汰。minf = 1 → freq 1 的桶裡**最舊**的是 key 2 → 淘汰 2;新的 key 3 次數 1,minf 重設為 1', views: [kv([[1, '(1, f=2)'], [3, '(3, f=1)']], 'key → (value, freq)', [3]), kv([[1, '[3]'], [2, '[1]']], 'freq → keys', [1])] },
    { note: '每個操作都只碰一兩個桶:O(1)。「次數最少」用 minf 直接找到,「同次數裡最久沒用」用有序集合的最前面', views: [arr(['get → 次數 +1、換桶', 'put 新 key → 可能淘汰 minf 桶最舊的'], { label: '重點' })] },
  ]
}

function scanFig(): FigStep[] {
  return [
    { note: '簡單版:每個 key 記 (value, 次數, 最後使用時間)。get / put 時更新次數和時間', views: [kv([[1, '(v=1, f=2, t=3)'], [2, '(v=2, f=1, t=2)']], 'key → (value, freq, time)')] },
    { note: '要淘汰時,掃過所有 key,找 (次數, 時間) 最小的那個 → key 2。每次淘汰 O(capacity)', views: [kv([[1, '(v=1, f=2, t=3)'], [2, '(v=2, f=1, t=2) ← 淘汰']], 'key → (value, freq, time)', [2])] },
  ]
}

export const q0460: Solution = {
  id: 460,
  plain: '做一個容量有限的「快取」。滿了要騰出空間時,淘汰**被使用次數最少**的那個;如果好幾個次數一樣少,淘汰其中**最久沒被用過**的。get 和 put 都算一次使用。',
  statement: '設計 `LFUCache(capacity)`:`get(key)` 存在回傳值(否則 −1);`put(key, value)` 更新或插入,容量已滿時先淘汰**使用頻率最低**的 key,頻率相同則淘汰**最久未使用**的。get / put 都會讓該 key 的使用次數 +1。兩個操作平均 O(1)。',
  examples: [
    { input: '["LFUCache","put","put","get","put","get","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[3],[4,4],[1],[3],[4]]', output: '[null,null,null,1,null,-1,3,null,-1,3,4]' },
  ],
  constraints: ['capacity ≤ 10⁴,最多 2·10⁵ 次呼叫'],
  insight: ['[146. LRU Cache](#/q/146) 的升級:先比次數,次數一樣再比時間', '把 key 依次數分桶,每個桶內照最近使用排序(像一個小 LRU)', '記住 minf:要淘汰時直接到 minf 的桶拿最舊的', 'get 讓次數 +1:從 f 桶移到 f+1 桶;若 f 桶空了且 f == minf,minf += 1'],
  approaches: [
    {
      name: '次數分桶 + 有序集合(O(1))',
      idea: '`vals[key]`、`freq[key]`、`buckets[f]`(有序,舊在前)、`minf`。',
      steps: ['touch(key):從 `buckets[f]` 移除、放進 `buckets[f+1]` 的尾端;f 桶空了而且 `minf == f` → `minf += 1`', 'get:不存在 → −1;否則 touch、回傳值', 'put:已存在 → 更新值、touch', '不存在:滿了 → 淘汰 `buckets[minf]` 最前面的;新 key 放進 `buckets[1]`、`minf = 1`'],
      figure: { title: 'capacity = 2', steps: bucketFig() },
      complexity: { time: 'get / put 都是 O(1)', space: 'O(capacity)', why: '每次只移動一個 key、改一兩個桶。' },
      verdict: '最推薦(題目要求)。每個桶就是一個 LRU:Python 用 OrderedDict,Java 用 LinkedHashSet,C 自己寫雙向串列。',
      code: {
        python: `from collections import OrderedDict, defaultdict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.vals, self.freq = {}, {}
        self.buckets = defaultdict(OrderedDict)   # 次數 → 有序的 key(舊在前)
        self.minf = 0

    def _touch(self, key):
        f = self.freq[key]
        del self.buckets[f][key]
        if not self.buckets[f]:
            del self.buckets[f]
            if self.minf == f:
                self.minf += 1                # 最少次數的桶空了
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = None       # 放到新桶的尾端(最新)

    def get(self, key):
        if key not in self.vals:
            return -1
        self._touch(key)
        return self.vals[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.vals:
            self.vals[key] = value
            self._touch(key)
            return
        if len(self.vals) == self.cap:
            old, _ = self.buckets[self.minf].popitem(last=False)   # 次數最少裡最舊的
            if not self.buckets[self.minf]:
                del self.buckets[self.minf]
            del self.vals[old], self.freq[old]
        self.vals[key], self.freq[key] = value, 1
        self.buckets[1][key] = None
        self.minf = 1`,
        c: `// 節點池 + 每個次數一條雙向串列(頭 = 最舊);key → 節點 用 uthash
#define MAXF 200005
typedef struct { int key, val, f, prev, next; } Node;
typedef struct { int key, idx; UT_hash_handle hh; } Entry;
typedef struct {
    int cap, size, minf, used;
    Node *pool;
    int head[MAXF], tail[MAXF];
    Entry *map;
} LFUCache;

static void unlink_(LFUCache *o, int i) {
    Node *n = &o->pool[i];
    if (n->prev >= 0) o->pool[n->prev].next = n->next; else o->head[n->f] = n->next;
    if (n->next >= 0) o->pool[n->next].prev = n->prev; else o->tail[n->f] = n->prev;
}

static void append_(LFUCache *o, int i) {         // 接到次數 f 那條的尾端(最新)
    Node *n = &o->pool[i];
    n->prev = o->tail[n->f]; n->next = -1;
    if (n->prev >= 0) o->pool[n->prev].next = i; else o->head[n->f] = i;
    o->tail[n->f] = i;
}

static void touch(LFUCache *o, int i) {
    unlink_(o, i);
    if (o->head[o->pool[i].f] < 0 && o->minf == o->pool[i].f) o->minf++;
    o->pool[i].f++;
    append_(o, i);
}

LFUCache *lFUCacheCreate(int capacity) {
    LFUCache *o = calloc(1, sizeof(LFUCache));
    o->cap = capacity;
    o->pool = malloc((capacity + 1) * sizeof(Node));
    for (int f = 0; f < MAXF; f++) o->head[f] = o->tail[f] = -1;
    return o;
}

int lFUCacheGet(LFUCache *o, int key) {
    Entry *e;
    HASH_FIND_INT(o->map, &key, e);
    if (!e) return -1;
    touch(o, e->idx);
    return o->pool[e->idx].val;
}

void lFUCachePut(LFUCache *o, int key, int value) {
    if (o->cap == 0) return;
    Entry *e;
    HASH_FIND_INT(o->map, &key, e);
    if (e) { o->pool[e->idx].val = value; touch(o, e->idx); return; }
    int idx;
    if (o->size == o->cap) {                       // 淘汰 minf 那條最前面的
        idx = o->head[o->minf];
        unlink_(o, idx);
        Entry *old;
        HASH_FIND_INT(o->map, &o->pool[idx].key, old);
        HASH_DEL(o->map, old); free(old);
    } else { idx = o->used++; o->size++; }
    o->pool[idx] = (Node){key, value, 1, -1, -1};
    append_(o, idx);
    e = malloc(sizeof(Entry)); e->key = key; e->idx = idx;
    HASH_ADD_INT(o->map, key, e);
    o->minf = 1;
}

void lFUCacheFree(LFUCache *o) {
    Entry *e, *t;
    HASH_ITER(hh, o->map, e, t) { HASH_DEL(o->map, e); free(e); }
    free(o->pool); free(o);
}`,
        cpp: `class LFUCache {
    int cap, minf = 0;
    unordered_map<int, pair<int, int>> kv;           // key → (value, freq)
    unordered_map<int, list<int>> buckets;           // freq → keys(舊在前)
    unordered_map<int, list<int>::iterator> pos;     // key → 在桶裡的位置

    void touch(int key) {
        int f = kv[key].second;
        buckets[f].erase(pos[key]);
        if (buckets[f].empty()) { buckets.erase(f); if (minf == f) minf++; }
        kv[key].second = f + 1;
        buckets[f + 1].push_back(key);
        pos[key] = prev(buckets[f + 1].end());
    }
public:
    LFUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        if (!kv.count(key)) return -1;
        touch(key);
        return kv[key].first;
    }

    void put(int key, int value) {
        if (cap == 0) return;
        if (kv.count(key)) { kv[key].first = value; touch(key); return; }
        if ((int)kv.size() == cap) {
            int old = buckets[minf].front();
            buckets[minf].pop_front();
            if (buckets[minf].empty()) buckets.erase(minf);
            kv.erase(old); pos.erase(old);
        }
        kv[key] = {value, 1};
        buckets[1].push_back(key);
        pos[key] = prev(buckets[1].end());
        minf = 1;
    }
};`,
        java: `class LFUCache {
    private final int cap;
    private int minf = 0;
    private final Map<Integer, Integer> vals = new HashMap<>(), freq = new HashMap<>();
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();

    public LFUCache(int capacity) { cap = capacity; }

    private void touch(int key) {
        int f = freq.get(key);
        buckets.get(f).remove(key);
        if (buckets.get(f).isEmpty()) { buckets.remove(f); if (minf == f) minf++; }
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }

    public int get(int key) {
        if (!vals.containsKey(key)) return -1;
        touch(key);
        return vals.get(key);
    }

    public void put(int key, int value) {
        if (cap == 0) return;
        if (vals.containsKey(key)) { vals.put(key, value); touch(key); return; }
        if (vals.size() == cap) {
            int old = buckets.get(minf).iterator().next();   // LinkedHashSet 依插入順序:第一個最舊
            buckets.get(minf).remove(old);
            if (buckets.get(minf).isEmpty()) buckets.remove(minf);
            vals.remove(old); freq.remove(old);
        }
        vals.put(key, value);
        freq.put(key, 1);
        buckets.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minf = 1;
    }
}`,
        javascript: `class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.vals = new Map();
    this.freq = new Map();
    this.buckets = new Map(); // freq → Set(依插入順序,舊在前)
    this.minf = 0;
  }

  touch(key) {
    const f = this.freq.get(key);
    const b = this.buckets.get(f);
    b.delete(key);
    if (b.size === 0) {
      this.buckets.delete(f);
      if (this.minf === f) this.minf++;
    }
    this.freq.set(key, f + 1);
    if (!this.buckets.has(f + 1)) this.buckets.set(f + 1, new Set());
    this.buckets.get(f + 1).add(key);
  }

  get(key) {
    if (!this.vals.has(key)) return -1;
    this.touch(key);
    return this.vals.get(key);
  }

  put(key, value) {
    if (this.cap === 0) return;
    if (this.vals.has(key)) {
      this.vals.set(key, value);
      this.touch(key);
      return;
    }
    if (this.vals.size === this.cap) {
      const b = this.buckets.get(this.minf);
      const old = b.values().next().value;
      b.delete(old);
      if (b.size === 0) this.buckets.delete(this.minf);
      this.vals.delete(old);
      this.freq.delete(old);
    }
    this.vals.set(key, value);
    this.freq.set(key, 1);
    if (!this.buckets.has(1)) this.buckets.set(1, new Set());
    this.buckets.get(1).add(key);
    this.minf = 1;
  }
}`,
      },
    },
    {
      name: '次數 + 時間戳,淘汰時掃描',
      idea: '每個 key 存 `(value, freq, lastUsed)`;要淘汰時掃過全部,找 `(freq, lastUsed)` 最小的。',
      steps: ['每次 get / put:`time += 1`,更新該 key 的 freq 和 lastUsed', 'put 新 key 且滿了:掃全部找 (freq, lastUsed) 最小的刪掉', '再插入新 key(freq = 1)'],
      figure: { title: 'capacity = 2', steps: scanFig() },
      complexity: { time: 'get O(1),put 最壞 O(capacity)', space: 'O(capacity)', why: '淘汰時要掃描。' },
      verdict: '規則最直白,先寫這個確認對規則的理解;不符合 O(1) 的要求。',
      code: {
        python: `class LFUCache:
    def __init__(self, capacity):
        self.cap, self.time = capacity, 0
        self.d = {}                           # key → [value, freq, lastUsed]

    def get(self, key):
        if key not in self.d:
            return -1
        self.time += 1
        e = self.d[key]
        e[1] += 1
        e[2] = self.time
        return e[0]

    def put(self, key, value):
        if self.cap == 0:
            return
        self.time += 1
        if key in self.d:
            e = self.d[key]
            e[0] = value
            e[1] += 1
            e[2] = self.time
            return
        if len(self.d) == self.cap:
            old = min(self.d, key=lambda k: (self.d[k][1], self.d[k][2]))   # 次數最少、最久沒用
            del self.d[old]
        self.d[key] = [value, 1, self.time]`,
        c: `typedef struct { int key, val, f, t, used; } Slot;
typedef struct { Slot *s; int cap, time; } LFUCache;

LFUCache *lFUCacheCreate(int capacity) {
    LFUCache *o = malloc(sizeof(LFUCache));
    o->s = calloc(capacity + 1, sizeof(Slot));
    o->cap = capacity; o->time = 0;
    return o;
}

static int findKey(LFUCache *o, int key) {
    for (int i = 0; i < o->cap; i++) if (o->s[i].used && o->s[i].key == key) return i;
    return -1;
}

int lFUCacheGet(LFUCache *o, int key) {
    int i = findKey(o, key);
    if (i < 0) return -1;
    o->s[i].f++; o->s[i].t = ++o->time;
    return o->s[i].val;
}

void lFUCachePut(LFUCache *o, int key, int value) {
    if (o->cap == 0) return;
    int i = findKey(o, key);
    if (i >= 0) { o->s[i].val = value; o->s[i].f++; o->s[i].t = ++o->time; return; }
    int slot = -1;
    for (int j = 0; j < o->cap; j++) if (!o->s[j].used) { slot = j; break; }
    if (slot < 0) {                                   // 滿了:找次數最少、最久沒用的
        slot = 0;
        for (int j = 1; j < o->cap; j++)
            if (o->s[j].f < o->s[slot].f || (o->s[j].f == o->s[slot].f && o->s[j].t < o->s[slot].t)) slot = j;
    }
    o->s[slot] = (Slot){key, value, 1, ++o->time, 1};
}

void lFUCacheFree(LFUCache *o) { free(o->s); free(o); }`,
        cpp: `class LFUCache {
    int cap, time = 0;
    unordered_map<int, array<int, 3>> d;             // key → (value, freq, lastUsed)
public:
    LFUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = d.find(key);
        if (it == d.end()) return -1;
        it->second[1]++; it->second[2] = ++time;
        return it->second[0];
    }

    void put(int key, int value) {
        if (cap == 0) return;
        auto it = d.find(key);
        if (it != d.end()) { it->second = {value, it->second[1] + 1, ++time}; return; }
        if ((int)d.size() == cap) {
            auto old = d.begin();
            for (auto j = d.begin(); j != d.end(); ++j)
                if (make_pair(j->second[1], j->second[2]) < make_pair(old->second[1], old->second[2])) old = j;
            d.erase(old);
        }
        d[key] = {value, 1, ++time};
    }
};`,
        java: `class LFUCache {
    private final int cap;
    private int time = 0;
    private final Map<Integer, int[]> d = new HashMap<>();   // key → {value, freq, lastUsed}

    public LFUCache(int capacity) { cap = capacity; }

    public int get(int key) {
        int[] e = d.get(key);
        if (e == null) return -1;
        e[1]++; e[2] = ++time;
        return e[0];
    }

    public void put(int key, int value) {
        if (cap == 0) return;
        int[] e = d.get(key);
        if (e != null) { e[0] = value; e[1]++; e[2] = ++time; return; }
        if (d.size() == cap) {
            int old = -1;
            int[] best = null;
            for (Map.Entry<Integer, int[]> x : d.entrySet()) {
                int[] v = x.getValue();
                if (best == null || v[1] < best[1] || (v[1] == best[1] && v[2] < best[2])) { best = v; old = x.getKey(); }
            }
            d.remove(old);
        }
        d.put(key, new int[]{value, 1, ++time});
    }
}`,
        javascript: `class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.time = 0;
    this.d = new Map(); // key → [value, freq, lastUsed]
  }

  get(key) {
    const e = this.d.get(key);
    if (!e) return -1;
    e[1]++;
    e[2] = ++this.time;
    return e[0];
  }

  put(key, value) {
    if (this.cap === 0) return;
    const e = this.d.get(key);
    if (e) {
      e[0] = value;
      e[1]++;
      e[2] = ++this.time;
      return;
    }
    if (this.d.size === this.cap) {
      let old = null, best = null;
      for (const [k, v] of this.d)
        if (!best || v[1] < best[1] || (v[1] === best[1] && v[2] < best[2])) {
          best = v;
          old = k;
        }
      this.d.delete(old);
    }
    this.d.set(key, [value, 1, ++this.time]);
  }
}`,
      },
    },
  ],
  pitfalls: ['put 已存在的 key 也要讓次數 +1(它也算一次使用)', '新插入的 key 之後 minf 一定是 1', 'capacity = 0 時 put 什麼都不做', '淘汰時同次數要選「最久沒用」,不是「最早插入」'],
  check: {
    kind: 'class',
    cls: 'LFUCache',
    cases: [
      { ops: ['LFUCache', 'put', 'put', 'get', 'put', 'get', 'get', 'put', 'get', 'get', 'get'], args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]], out: [null, null, null, 1, null, -1, 3, null, -1, 3, 4] },
      { ops: ['LFUCache', 'put', 'get'], args: [[0], [0, 0], [0]], out: [null, null, -1] },
      { ops: ['LFUCache', 'put', 'put', 'put', 'put', 'get', 'get', 'get', 'get'], args: [[3], [2, 2], [1, 1], [2, 20], [4, 4], [2], [1], [4], [3]], out: [null, null, null, null, null, 20, 1, 4, -1] },
    ],
  },
}
