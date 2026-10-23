import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 380. Insert Delete GetRandom O(1)

function mainFig(): FigStep[] {
  const a: number[] = []
  const pos = new Map<number, number>()
  const snap = (note: string, hlA: number[] = [], hlK: number[] = []): FigStep => ({ note, views: [arr([...a], { label: 'vals(陣列)', highlight: hlA }), kv([...pos.entries()], '值 → 在陣列的哪一格', hlK)] })
  const out: FigStep[] = [snap('兩樣東西配合:陣列 vals 負責「隨機抽一個」(抽索引就好),Hash 表 pos 負責「某個值在不在、在第幾格」')]
  for (const v of [10, 20, 30, 40]) {
    pos.set(v, a.length)
    a.push(v)
  }
  out.push(snap('insert 10、20、30、40:各自接到陣列尾巴,pos 記下它們的位置。都是 O(1)', [0, 1, 2, 3]))
  out.push(snap('remove 20:陣列中間刪除要搬動後面所有元素(O(n))。訣竅:把**最後一個**(40)搬到 20 的位置,再砍掉尾巴', [1, 3], [20, 40]))
  const i = pos.get(20)!
  const last = a[a.length - 1]
  a[i] = last
  pos.set(last, i)
  a.pop()
  pos.delete(20)
  out.push(snap(`40 搬到第 ${i} 格,pos[40] 改成 ${i},刪掉 pos[20]。整個過程只碰兩格 → O(1)`, [i], [40]))
  out.push(snap(`getRandom:隨機抽一個索引 0..${a.length - 1},回傳 vals[那格]。每個值機率都是 1/${a.length}`, [0, 1, 2]))
  return out
}

function setFig(): FigStep[] {
  return [
    { note: '只用 Hash 集合:insert、remove 都是 O(1)', views: [arr([10, 30, 40], { label: '集合(順序不固定)' })] },
    { note: 'getRandom 時集合沒辦法「拿第 k 個」,只能先倒成陣列再抽 → 這一步變 O(n)', views: [arr([10, 30, 40], { label: '轉成陣列', highlight: [1] })] },
  ]
}

export const q0380: Solution = {
  id: 380,
  plain: '做一個「抽籤箱」:可以放進一張籤、拿掉一張指定的籤、隨機抽一張看(不拿出來)。三件事都要很快,而且抽籤要公平,每張被抽到的機率一樣。',
  statement: '設計類別 `RandomizedSet`:`insert(val)` 不存在才加入並回傳 true;`remove(val)` 存在才刪除並回傳 true;`getRandom()` 以**相同機率**回傳目前其中一個元素(呼叫時保證非空)。三個操作平均都要 **O(1)**。',
  examples: [
    { input: '["RandomizedSet","insert","remove","insert","getRandom","remove","insert","getRandom"]\n[[],[1],[2],[2],[],[1],[2],[]]', output: '[null,true,false,true,1 或 2,true,false,2]' },
  ],
  constraints: ['值在 32 位元整數範圍', '最多 2·10⁵ 次呼叫 → 每次都要 O(1)'],
  insight: ['「在不在」要 O(1) → Hash 表', '「隨機抽一個」要 O(1) → 陣列(抽索引)', '兩個一起用,難點在**陣列刪中間要 O(1)**:把最後一個搬過來補洞,再刪尾巴'],
  approaches: [
    {
      name: '陣列 + Hash 表(值 → 索引)',
      idea: '`vals` 存值,`pos[val]` 存它在 vals 的索引。刪除時用尾巴補洞。',
      steps: ['insert:已存在 → false;否則 `pos[val] = len(vals)`、`vals.append(val)`', 'remove:不存在 → false;`i = pos[val]`、`last = vals[-1]`', '`vals[i] = last`、`pos[last] = i`;`vals.pop()`、刪掉 `pos[val]`', 'getRandom:`vals[random(0, len−1)]`'],
      figure: { title: '依序 insert 10 20 30 40、remove 20、getRandom', steps: mainFig() },
      complexity: { time: '每個操作平均 O(1)', space: 'O(n)', why: '每次只碰陣列尾巴和一兩個 Hash 項目。' },
      verdict: '標準答案。「用最後一個補洞」這招在很多需要 O(1) 刪除的設計題都會用到。',
      code: {
        python: `import random

class RandomizedSet:
    def __init__(self):
        self.vals = []                        # 拿來隨機抽
        self.pos = {}                         # 值 → 它在 vals 的索引

    def insert(self, val):
        if val in self.pos:
            return False
        self.pos[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val):
        if val not in self.pos:
            return False
        i, last = self.pos[val], self.vals[-1]
        self.vals[i] = last                   # 用最後一個補洞
        self.pos[last] = i
        self.vals.pop()
        del self.pos[val]
        return True

    def getRandom(self):
        return random.choice(self.vals)`,
        c: `// C 沒有 Hash 表:自己寫一個開放定址(線性探測)的表,存「值 → 索引」
#define CAP (1 << 19)
typedef struct {
    int key[CAP], idx[CAP];
    char st[CAP];                 // 0 空、1 使用中、2 刪除過(墓碑)
    int vals[200005], n;
} RandomizedSet;

static unsigned slot(int k) { return ((unsigned)k * 2654435761u) & (CAP - 1); }

// 回傳 k 所在的格子;找不到回傳 -1
static int find(RandomizedSet *s, int k) {
    for (unsigned h = slot(k); s->st[h]; h = (h + 1) & (CAP - 1))
        if (s->st[h] == 1 && s->key[h] == k) return h;
    return -1;
}

RandomizedSet *randomizedSetCreate() { return calloc(1, sizeof(RandomizedSet)); }

bool randomizedSetInsert(RandomizedSet *s, int val) {
    if (find(s, val) >= 0) return false;
    unsigned h = slot(val);
    while (s->st[h] == 1) h = (h + 1) & (CAP - 1);
    s->st[h] = 1; s->key[h] = val; s->idx[h] = s->n;
    s->vals[s->n++] = val;
    return true;
}

bool randomizedSetRemove(RandomizedSet *s, int val) {
    int h = find(s, val);
    if (h < 0) return false;
    int i = s->idx[h], last = s->vals[--s->n];
    s->vals[i] = last;                       // 用最後一個補洞
    s->idx[find(s, last)] = i;
    s->st[h] = 2;
    return true;
}

int randomizedSetGetRandom(RandomizedSet *s) { return s->vals[rand() % s->n]; }

void randomizedSetFree(RandomizedSet *s) { free(s); }`,
        cpp: `class RandomizedSet {
    vector<int> vals;
    unordered_map<int, int> pos;
public:
    RandomizedSet() {}

    bool insert(int val) {
        if (pos.count(val)) return false;
        pos[val] = vals.size();
        vals.push_back(val);
        return true;
    }

    bool remove(int val) {
        auto it = pos.find(val);
        if (it == pos.end()) return false;
        int i = it->second, last = vals.back();
        vals[i] = last;
        pos[last] = i;
        vals.pop_back();
        pos.erase(val);
        return true;
    }

    int getRandom() { return vals[rand() % vals.size()]; }
};`,
        java: `class RandomizedSet {
    private final List<Integer> vals = new ArrayList<>();
    private final Map<Integer, Integer> pos = new HashMap<>();
    private final Random rnd = new Random();

    public RandomizedSet() {}

    public boolean insert(int val) {
        if (pos.containsKey(val)) return false;
        pos.put(val, vals.size());
        vals.add(val);
        return true;
    }

    public boolean remove(int val) {
        Integer i = pos.remove(val);
        if (i == null) return false;
        int last = vals.remove(vals.size() - 1);
        if (i < vals.size()) {          // 刪的不是最後一個,才需要補洞
            vals.set(i, last);
            pos.put(last, i);
        }
        return true;
    }

    public int getRandom() { return vals.get(rnd.nextInt(vals.size())); }
}`,
        javascript: `class RandomizedSet {
  constructor() {
    this.vals = [];
    this.pos = new Map();
  }

  insert(val) {
    if (this.pos.has(val)) return false;
    this.pos.set(val, this.vals.length);
    this.vals.push(val);
    return true;
  }

  remove(val) {
    if (!this.pos.has(val)) return false;
    const i = this.pos.get(val), last = this.vals[this.vals.length - 1];
    this.vals[i] = last;
    this.pos.set(last, i);
    this.vals.pop();
    this.pos.delete(val);
    return true;
  }

  getRandom() {
    return this.vals[Math.floor(Math.random() * this.vals.length)];
  }
}`,
      },
    },
    {
      name: '只用 Hash 集合(getRandom 是 O(n))',
      idea: 'insert / remove 直接用集合;getRandom 時把集合轉成陣列再抽。',
      steps: ['insert / remove:集合的 add / discard,依結果回傳 true / false', 'getRandom:`random.choice(list(s))`'],
      figure: { title: '集合版', steps: setFig() },
      complexity: { time: 'insert / remove O(1),getRandom O(n)', space: 'O(n)', why: '轉成陣列要走過所有元素。' },
      verdict: '能過小測資,但不符合題目要求的「三個都 O(1)」。拿來對照,才看得出為什麼需要陣列。',
      code: {
        python: `import random

class RandomizedSet:
    def __init__(self):
        self.s = set()

    def insert(self, val):
        if val in self.s:
            return False
        self.s.add(val)
        return True

    def remove(self, val):
        if val not in self.s:
            return False
        self.s.remove(val)
        return True

    def getRandom(self):
        return random.choice(list(self.s))    # O(n):集合不能用索引拿元素`,
        c: `// 只有 Hash 表(開放定址):getRandom 隨機挑格子,挑到「使用中」為止,
// 表很空時要試很多次,最壞情況沒有保證
#define CAP (1 << 19)
typedef struct {
    int key[CAP];
    char st[CAP];                 // 0 空、1 使用中、2 墓碑
    int n;
} RandomizedSet;

static unsigned slot(int k) { return ((unsigned)k * 2654435761u) & (CAP - 1); }

static int find(RandomizedSet *s, int k) {
    for (unsigned h = slot(k); s->st[h]; h = (h + 1) & (CAP - 1))
        if (s->st[h] == 1 && s->key[h] == k) return h;
    return -1;
}

RandomizedSet *randomizedSetCreate() { return calloc(1, sizeof(RandomizedSet)); }

bool randomizedSetInsert(RandomizedSet *s, int val) {
    if (find(s, val) >= 0) return false;
    unsigned h = slot(val);
    while (s->st[h] == 1) h = (h + 1) & (CAP - 1);
    s->st[h] = 1; s->key[h] = val; s->n++;
    return true;
}

bool randomizedSetRemove(RandomizedSet *s, int val) {
    int h = find(s, val);
    if (h < 0) return false;
    s->st[h] = 2; s->n--;
    return true;
}

int randomizedSetGetRandom(RandomizedSet *s) {
    for (;;) {
        unsigned h = ((unsigned)rand() * 32768u + rand()) & (CAP - 1);
        if (s->st[h] == 1) return s->key[h];
    }
}

void randomizedSetFree(RandomizedSet *s) { free(s); }`,
        cpp: `class RandomizedSet {
    unordered_set<int> s;
public:
    RandomizedSet() {}
    bool insert(int val) { return s.insert(val).second; }
    bool remove(int val) { return s.erase(val) > 0; }
    int getRandom() {
        auto it = s.begin();
        advance(it, rand() % s.size());     // O(n):只能一步一步走過去
        return *it;
    }
};`,
        java: `class RandomizedSet {
    private final Set<Integer> s = new HashSet<>();
    private final Random rnd = new Random();

    public RandomizedSet() {}
    public boolean insert(int val) { return s.add(val); }
    public boolean remove(int val) { return s.remove(val); }

    public int getRandom() {
        int k = rnd.nextInt(s.size());
        for (int x : s) if (k-- == 0) return x;   // O(n)
        return -1;
    }
}`,
        javascript: `class RandomizedSet {
  constructor() {
    this.s = new Set();
  }

  insert(val) {
    if (this.s.has(val)) return false;
    this.s.add(val);
    return true;
  }

  remove(val) {
    return this.s.delete(val);
  }

  getRandom() {
    const a = [...this.s];                 // O(n)
    return a[Math.floor(Math.random() * a.length)];
  }
}`,
      },
    },
  ],
  pitfalls: ['remove 時先刪 `pos[val]` 再設 `pos[last] = i`:刪的剛好是最後一個時(val == last),會把它又加回表裡。要先設再刪', '用陣列的 remove(value) / splice:那是 O(n)', '忘了檢查重複 insert 或刪除不存在的值'],
  check: {
    kind: 'class',
    cls: 'RandomizedSet',
    cases: [
      { ops: ['RandomizedSet', 'insert', 'remove', 'insert', 'remove', 'insert', 'getRandom'], args: [[], [1], [2], [2], [1], [2], []], out: [null, true, false, true, true, false, 2] },
      { ops: ['RandomizedSet', 'insert', 'insert', 'insert', 'remove', 'remove', 'remove', 'insert', 'getRandom'], args: [[], [-5], [7], [-5], [-5], [7], [7], [9], []], out: [null, true, true, false, true, true, false, true, 9] },
    ],
  },
}
