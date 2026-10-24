import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { chain, kv } from './fig'

// 146. LRU Cache

type Op = ['put', number, number] | ['get', number]
const CAP = 2
const OPS: Op[] = [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]]
const opText = (o: Op) => (o[0] === 'put' ? `put(${o[1]}, ${o[2]})` : `get(${o[1]})`)

/** 模擬 LRU,order 從「最舊」到「最新」 */
function simulate(onStep: (o: Op, order: [number, number][], note: string, hl: number) => void) {
  let order: [number, number][] = []
  for (const o of OPS) {
    const k = o[1]
    const at = order.findIndex((p) => p[0] === k)
    if (o[0] === 'get') {
      if (at < 0) {
        onStep(o, order, `${opText(o)}:沒有這個 key → 回傳 −1`, -1)
        continue
      }
      const p = order[at]
      order = [...order.slice(0, at), ...order.slice(at + 1), p]
      onStep(o, order, `${opText(o)}:找到,值是 ${p[1]}。它剛被用過 → 搬到「最新」那一端`, order.length - 1)
    } else {
      let note = ''
      if (at >= 0) {
        order = [...order.slice(0, at), ...order.slice(at + 1), [k, o[2]]]
        note = `${opText(o)}:key 已存在 → 更新值,並搬到最新`
      } else {
        if (order.length === CAP) {
          note = `${opText(o)}:滿了(容量 ${CAP}),先踢掉最久沒用的 key ${order[0][0]},再放進新的`
          order = order.slice(1)
        } else note = `${opText(o)}:還有空位,放在最新那一端`
        order = [...order, [k, o[2]]]
      }
      onStep(o, order, note, order.length - 1)
    }
  }
}

function listFig(): FigStep[] {
  const out: FigStep[] = [{ note: `容量 ${CAP}。用一個清單照「使用時間」排好:左邊最久沒用、右邊最近用過。每次 get / put 都要在清單裡**找**那個 key → O(n)`, views: [arr([], { label: '清單(左舊 → 右新)' })] }]
  simulate((_, order, note, hl) => out.push({ note, views: [arr(order.map(([k, v]) => `${k}:${v}`), { label: '清單(左舊 → 右新)', highlight: hl >= 0 ? [hl] : [] })] }))
  return out
}

function dllFig(): FigStep[] {
  const view = (order: [number, number][], hl: number) => {
    const labels = ['H', ...order.map(([k, v]) => `${k}:${v}`), 'T']
    const edges: [number, number, string?][] = []
    for (let i = 0; i + 1 < labels.length; i++) edges.push([i, i + 1], [i + 1, i, 'dim'])
    return [
      chain(labels, { label: '雙向鏈結串列(H、T 是假的頭尾;H 旁邊最舊,T 旁邊最新)', edges, cls: { 0: 'dim', [labels.length - 1]: 'dim', ...(hl >= 0 ? { [hl + 1]: 'hl' } : {}) } }),
      kv(order.map(([k]) => [k, `→ 節點 ${k}`]), 'map(key → 串列裡的節點)', hl >= 0 ? [order[hl][0]] : []),
    ]
  }
  const out: FigStep[] = [{ note: 'Hash Map 負責「O(1) 找到節點」,雙向鏈結串列負責「O(1) 把節點拿出來、插到尾巴、從頭刪掉」。兩個合起來,每個操作都是 O(1)', views: view([], -1) }]
  simulate((_, order, note, hl) => out.push({ note, views: view(order, hl) }))
  return out
}

export const q0146: Solution = {
  id: 146,
  plain:
    '做一個容量有限的「最近使用」快取。滿了還要放新東西時,就把**最久沒被用過**的那個丟掉。像書桌只放得下 2 本書:要拿新書上桌時,把最久沒翻的那本收回書櫃。',
  statement:
    '設計 `LRUCache(capacity)`:`get(key)` 有這個 key 就回傳值,沒有回傳 `-1`;`put(key, value)` 新增或更新。超過容量時,刪掉**最久沒被使用**(get 或 put 都算使用)的 key。`get` 和 `put` 都要平均 **O(1)**。',
  examples: [
    {
      input: 'LRUCache(2)、put(1,1)、put(2,2)、get(1)、put(3,3)、get(2)、put(4,4)、get(1)、get(3)、get(4)',
      output: '1、-1、-1、3、4',
      note: 'get(1) 讓 1 變成最近用過,所以 put(3) 時踢掉的是 2',
    },
  ],
  constraints: ['`1 ≤ capacity ≤ 3000`,最多 2·10⁵ 次呼叫 → 每次 O(n) 會到 6·10⁸,太慢', '**get、put 都要 O(1)**'],
  insight: [
    '需要兩種能力:① 用 key 很快找到值 → Hash Map;② 記住「誰最久沒用」,而且每次使用都能把它移到「最新」→ 一條依使用時間排序的隊伍',
    '用陣列排隊:移到最新要先從中間刪掉,O(n)',
    '用**雙向鏈結串列**排隊:只要手上有那個節點,拿出來、接到尾巴都是 O(1)(改幾個指標就好)。Hash Map 的 value 存「節點」,就能 O(1) 拿到節點',
    '加一個假的頭 head 和假的尾 tail,就不用處理「串列是空的」「刪的是第一個」這些特例',
  ],
  approaches: [
    {
      name: '清單照使用時間排序(O(n))',
      idea: '一個清單從舊到新排好 `(key, value)`。每次 get / put 都在清單裡線性找 key,找到就移到最後;滿了就刪第一個。',
      steps: ['`get`:線性找 key;找到就搬到最後並回傳值,否則 `-1`', '`put`:找到就更新並搬到最後', '沒找到:滿了先刪第一個,再加到最後'],
      figure: { title: `容量 ${CAP}:${OPS.map(opText).join('、')}`, steps: listFig() },
      complexity: { time: 'get / put O(n)', space: 'O(capacity)', why: '每次都要在清單裡找、從中間刪除。' },
      verdict: '最好懂,能確認「什麼時候要搬、要踢誰」的邏輯。但不符合 O(1) 要求,大量操作時會超時。',
      code: {
        python: `class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.items = []                   # [(key, value)],左邊最舊、右邊最新

    def _find(self, key):
        for i, (k, _) in enumerate(self.items):
            if k == key:
                return i
        return -1

    def get(self, key):
        i = self._find(key)
        if i < 0:
            return -1
        k, v = self.items.pop(i)
        self.items.append((k, v))         # 用過 -> 搬到最新
        return v

    def put(self, key, value):
        i = self._find(key)
        if i >= 0:
            self.items.pop(i)
        elif len(self.items) == self.cap:
            self.items.pop(0)             # 踢掉最舊的
        self.items.append((key, value))`,
        c: `typedef struct {
    int *keys, *vals;   // 左邊最舊、右邊最新
    int n, cap;
} LRUCache;

LRUCache *lRUCacheCreate(int capacity) {
    LRUCache *c = malloc(sizeof(LRUCache));
    c->keys = malloc(capacity * sizeof(int));
    c->vals = malloc(capacity * sizeof(int));
    c->n = 0; c->cap = capacity;
    return c;
}

// 把第 i 個搬到最後
static void moveToEnd(LRUCache *c, int i) {
    int k = c->keys[i], v = c->vals[i];
    for (int j = i; j + 1 < c->n; j++) { c->keys[j] = c->keys[j + 1]; c->vals[j] = c->vals[j + 1]; }
    c->keys[c->n - 1] = k; c->vals[c->n - 1] = v;
}

int lRUCacheGet(LRUCache *c, int key) {
    for (int i = 0; i < c->n; i++)
        if (c->keys[i] == key) { moveToEnd(c, i); return c->vals[c->n - 1]; }
    return -1;
}

void lRUCachePut(LRUCache *c, int key, int value) {
    for (int i = 0; i < c->n; i++)
        if (c->keys[i] == key) { moveToEnd(c, i); c->vals[c->n - 1] = value; return; }
    if (c->n == c->cap) moveToEnd(c, 0);      // 最舊的搬到最後,直接被覆蓋
    else c->n++;
    c->keys[c->n - 1] = key; c->vals[c->n - 1] = value;
}

void lRUCacheFree(LRUCache *c) {
    free(c->keys); free(c->vals); free(c);
}`,
        cpp: `class LRUCache {
    int cap;
    vector<pair<int, int>> items;           // 左邊最舊、右邊最新
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        for (size_t i = 0; i < items.size(); i++)
            if (items[i].first == key) {
                auto p = items[i];
                items.erase(items.begin() + i);
                items.push_back(p);
                return p.second;
            }
        return -1;
    }

    void put(int key, int value) {
        for (size_t i = 0; i < items.size(); i++)
            if (items[i].first == key) { items.erase(items.begin() + i); break; }
        if ((int)items.size() == cap) items.erase(items.begin());
        items.push_back({key, value});
    }
};`,
        java: `class LRUCache {
    private final int cap;
    private final List<int[]> items = new ArrayList<>();   // 左邊最舊、右邊最新

    public LRUCache(int capacity) { cap = capacity; }

    private int find(int key) {
        for (int i = 0; i < items.size(); i++) if (items.get(i)[0] == key) return i;
        return -1;
    }

    public int get(int key) {
        int i = find(key);
        if (i < 0) return -1;
        int[] p = items.remove(i);
        items.add(p);
        return p[1];
    }

    public void put(int key, int value) {
        int i = find(key);
        if (i >= 0) items.remove(i);
        else if (items.size() == cap) items.remove(0);
        items.add(new int[]{key, value});
    }
}`,
        javascript: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.items = [];                      // [key, value],左邊最舊、右邊最新
  }

  get(key) {
    const i = this.items.findIndex((p) => p[0] === key);
    if (i < 0) return -1;
    const [p] = this.items.splice(i, 1);
    this.items.push(p);
    return p[1];
  }

  put(key, value) {
    const i = this.items.findIndex((p) => p[0] === key);
    if (i >= 0) this.items.splice(i, 1);
    else if (this.items.length === this.cap) this.items.shift();
    this.items.push([key, value]);
  }
}`,
      },
    },
    {
      name: 'Hash Map + 雙向鏈結串列(O(1))',
      idea: '串列從 head 到 tail 依使用時間排(head 旁邊最舊)。map 存 `key → 節點`。用到一個節點:把它從原位置拆下來,接到 tail 前面。滿了:刪掉 head 後面那個。',
      steps: ['`remove(node)`:`node.prev.next = node.next`、`node.next.prev = node.prev`', '`addToEnd(node)`:插在 `tail` 前面', '`get`:不在 map → `-1`;在 → `remove` + `addToEnd`,回傳值', '`put`:已存在 → 更新值、搬到最後;否則新節點 `addToEnd`,超過容量就刪掉 `head.next`(也從 map 刪掉)'],
      figure: { title: `容量 ${CAP}:${OPS.map(opText).join('、')}`, steps: dllFig() },
      complexity: { time: 'get / put O(1)', space: 'O(capacity)', why: 'Hash Map 找節點 O(1);雙向串列拆下、插入、刪頭都只改固定幾個指標。' },
      verdict: '面試的標準答案,一定要能自己寫出來。重點:① 節點要存 key(踢掉時才知道要從 map 刪哪個);② 用假的頭尾節點省掉所有邊界判斷。',
      code: {
        python: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                     # key -> 節點
        self.head, self.tail = Node(), Node()   # 假的頭尾
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):              # 從串列拆下來
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_to_end(self, node):          # 插在 tail 前面 = 最新
        node.prev, node.next = self.tail.prev, self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_to_end(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            node = self.map[key]
            node.val = value
            self._remove(node)
            self._add_to_end(node)
            return
        node = Node(key, value)
        self.map[key] = node
        self._add_to_end(node)
        if len(self.map) > self.cap:
            oldest = self.head.next       # head 旁邊是最舊的
            self._remove(oldest)
            del self.map[oldest.key]      # 節點要存 key,這裡才刪得掉`,
        c: `// key 的範圍是 0 ~ 10^4,用陣列當 map:where[key] = 節點
typedef struct Node { int key, val; struct Node *prev, *next; } Node;
typedef struct {
    int cap, size;
    Node head, tail;            // 假的頭尾
    Node *where[10001];
} LRUCache;

static void removeNode(Node *n) { n->prev->next = n->next; n->next->prev = n->prev; }
static void addToEnd(LRUCache *c, Node *n) {
    n->prev = c->tail.prev; n->next = &c->tail;
    c->tail.prev->next = n; c->tail.prev = n;
}

LRUCache *lRUCacheCreate(int capacity) {
    LRUCache *c = calloc(1, sizeof(LRUCache));
    c->cap = capacity;
    c->head.next = &c->tail; c->tail.prev = &c->head;
    return c;
}

int lRUCacheGet(LRUCache *c, int key) {
    Node *n = c->where[key];
    if (!n) return -1;
    removeNode(n); addToEnd(c, n);
    return n->val;
}

void lRUCachePut(LRUCache *c, int key, int value) {
    Node *n = c->where[key];
    if (n) { n->val = value; removeNode(n); addToEnd(c, n); return; }
    n = malloc(sizeof(Node));
    n->key = key; n->val = value;
    c->where[key] = n;
    addToEnd(c, n);
    if (++c->size > c->cap) {
        Node *old = c->head.next;
        removeNode(old);
        c->where[old->key] = NULL;
        free(old);
        c->size--;
    }
}

void lRUCacheFree(LRUCache *c) {
    for (Node *n = c->head.next, *nx; n != &c->tail; n = nx) { nx = n->next; free(n); }
    free(c);
}`,
        cpp: `class LRUCache {
    struct Node { int key, val; Node *prev = nullptr, *next = nullptr; };
    int cap;
    unordered_map<int, Node*> m;            // key -> 節點
    Node head, tail;                        // 假的頭尾

    void remove(Node* n) { n->prev->next = n->next; n->next->prev = n->prev; }
    void addToEnd(Node* n) {
        n->prev = tail.prev; n->next = &tail;
        tail.prev->next = n; tail.prev = n;
    }
public:
    LRUCache(int capacity) : cap(capacity) { head.next = &tail; tail.prev = &head; }

    int get(int key) {
        auto it = m.find(key);
        if (it == m.end()) return -1;
        remove(it->second); addToEnd(it->second);
        return it->second->val;
    }

    void put(int key, int value) {
        auto it = m.find(key);
        if (it != m.end()) {
            it->second->val = value;
            remove(it->second); addToEnd(it->second);
            return;
        }
        Node* n = new Node{key, value};
        m[key] = n;
        addToEnd(n);
        if ((int)m.size() > cap) {
            Node* old = head.next;
            remove(old);
            m.erase(old->key);
            delete old;
        }
    }
};`,
        java: `class LRUCache {
    private static class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();   // key -> 節點
    private final Node head = new Node(0, 0), tail = new Node(0, 0);   // 假的頭尾

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addToEnd(Node n) {
        n.prev = tail.prev; n.next = tail;
        tail.prev.next = n; tail.prev = n;
    }

    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        remove(n); addToEnd(n);
        return n.val;
    }

    public void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) { n.val = value; remove(n); addToEnd(n); return; }
        n = new Node(key, value);
        map.put(key, n);
        addToEnd(n);
        if (map.size() > cap) {
            Node old = head.next;
            remove(old);
            map.remove(old.key);
        }
    }
}`,
        javascript: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();                 // key -> 節點
    this.head = { prev: null, next: null };   // 假的頭尾
    this.tail = { prev: this.head, next: null };
    this.head.next = this.tail;
  }

  remove(n) {
    n.prev.next = n.next;
    n.next.prev = n.prev;
  }

  addToEnd(n) {
    n.prev = this.tail.prev;
    n.next = this.tail;
    this.tail.prev.next = n;
    this.tail.prev = n;
  }

  get(key) {
    const n = this.map.get(key);
    if (!n) return -1;
    this.remove(n);
    this.addToEnd(n);
    return n.val;
  }

  put(key, value) {
    let n = this.map.get(key);
    if (n) {
      n.val = value;
      this.remove(n);
      this.addToEnd(n);
      return;
    }
    n = { key, val: value, prev: null, next: null };
    this.map.set(key, n);
    this.addToEnd(n);
    if (this.map.size > this.cap) {
      const old = this.head.next;
      this.remove(old);
      this.map.delete(old.key);
    }
  }
}`,
      },
    },
    {
      name: '用語言內建的「有順序的 Map」',
      idea: '有些語言的 Map 會記住插入順序:Python 的 `OrderedDict`、Java 的 `LinkedHashMap`、JavaScript 的 `Map`。「搬到最新」= 刪掉再重新放進去;「最舊的」= 第一個 key。它們內部其實就是方法二的 Hash + 雙向串列。',
      steps: ['`get`:不在 → `-1`;在 → 移到最後(`move_to_end` / 刪掉再放回)', '`put`:放進去並移到最後', '超過容量 → 刪掉第一個 key'],
      figure: { title: `容量 ${CAP}:${OPS.map(opText).join('、')}`, steps: dllFig() },
      complexity: { time: 'get / put O(1)', space: 'O(capacity)', why: '這些內建結構的插入、刪除、取第一個都是 O(1)。' },
      verdict: '實務上最簡單。但面試官通常會說「不要用內建的」,要你寫出方法二 —— 這個方法比較適合當作「我知道內建的原理」的補充。C 的 uthash 剛好也有插入順序,C++ 則用 `list` + `unordered_map` 拼出來。',
      code: {
        python: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.d = OrderedDict()            # 記得插入順序:前面最舊

    def get(self, key):
        if key not in self.d:
            return -1
        self.d.move_to_end(key)           # 搬到最新
        return self.d[key]

    def put(self, key, value):
        self.d[key] = value
        self.d.move_to_end(key)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)    # 刪掉最舊的`,
        c: `// uthash 會記住插入順序:先刪掉再加回去 = 搬到最新;第一個 = 最舊
typedef struct { int key, val; UT_hash_handle hh; } Item;
typedef struct { int cap; Item *m; } LRUCache;

LRUCache *lRUCacheCreate(int capacity) {
    LRUCache *c = malloc(sizeof(LRUCache));
    c->cap = capacity; c->m = NULL;
    return c;
}

int lRUCacheGet(LRUCache *c, int key) {
    Item *it;
    HASH_FIND_INT(c->m, &key, it);
    if (!it) return -1;
    HASH_DEL(c->m, it);
    HASH_ADD_INT(c->m, key, it);          // 重新加到最後
    return it->val;
}

void lRUCachePut(LRUCache *c, int key, int value) {
    Item *it;
    HASH_FIND_INT(c->m, &key, it);
    if (it) HASH_DEL(c->m, it);
    else it = malloc(sizeof(Item));
    it->key = key; it->val = value;
    HASH_ADD_INT(c->m, key, it);
    if ((int)HASH_COUNT(c->m) > c->cap) {
        Item *old = c->m;                 // 第一個就是最舊的
        HASH_DEL(c->m, old);
        free(old);
    }
}

void lRUCacheFree(LRUCache *c) {
    Item *it, *tmp;
    HASH_ITER(hh, c->m, it, tmp) { HASH_DEL(c->m, it); free(it); }
    free(c);
}`,
        cpp: `class LRUCache {
    int cap;
    list<pair<int, int>> items;             // 前面最舊;std::list 是雙向鏈結串列
    unordered_map<int, list<pair<int, int>>::iterator> m;
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = m.find(key);
        if (it == m.end()) return -1;
        items.splice(items.end(), items, it->second);   // O(1) 搬到最後
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = m.find(key);
        if (it != m.end()) {
            it->second->second = value;
            items.splice(items.end(), items, it->second);
            return;
        }
        items.push_back({key, value});
        m[key] = prev(items.end());
        if ((int)m.size() > cap) {
            m.erase(items.front().first);
            items.pop_front();
        }
    }
};`,
        java: `class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);     // true = 依「存取順序」排,get 也會搬到最後
        cap = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > cap;              // 超過容量就自動刪最舊的
    }
}`,
        javascript: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.m = new Map();                   // JavaScript 的 Map 會記住插入順序
  }

  get(key) {
    if (!this.m.has(key)) return -1;
    const v = this.m.get(key);
    this.m.delete(key);
    this.m.set(key, v);                   // 刪掉再放回 = 搬到最新
    return v;
  }

  put(key, value) {
    this.m.delete(key);
    this.m.set(key, value);
    if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value);   // 第一個 = 最舊
  }
}`,
      },
    },
  ],
  pitfalls: [
    '`get` 也算「使用」:忘了在 get 時把節點搬到最新,會踢錯 key',
    '`put` 一個已經存在的 key:要更新值**並且**搬到最新,而且不能讓大小 +1',
    '節點沒有存 key:要踢掉最舊的節點時,不知道要從 map 刪哪個 key',
    '先踢再放 vs 先放再踢:先放再檢查「超過容量」比較不容易出錯(更新既有 key 時不會誤踢)',
  ],
  followUp: [
    { q: '如果要踢的是「使用次數最少」的?', a: '460. LFU Cache:每個使用次數一條雙向串列,再記目前最小的次數,也能做到 O(1)。' },
    { q: '多執行緒同時存取?', a: '最簡單是整個快取加一把鎖;進階做法是分段(sharding),每段各自一把鎖。' },
  ],
  check: {
    kind: 'class',
    cls: 'LRUCache',
    cases: [
      {
        ops: ['LRUCache', ...OPS.map((o) => o[0])],
        args: [[CAP], ...OPS.map((o) => o.slice(1) as number[])],
        out: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      {
        ops: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'get'],
        args: [[2], [2, 1], [1, 1], [2], [4, 1], [1], [2]],
        out: [null, null, null, 1, null, -1, 1],
      },
      {
        ops: ['LRUCache', 'put', 'put', 'put', 'get', 'put', 'get'],
        args: [[1], [1, 1], [1, 5], [2, 2], [1], [3, 3], [2]],
        out: [null, null, null, null, -1, null, -1],
      },
    ],
  },
}
