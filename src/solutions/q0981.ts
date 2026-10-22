import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 981. Time Based Key-Value Store

const SETS: [string, string, number][] = [
  ['foo', 'bar', 1],
  ['foo', 'baz', 4],
  ['foo', 'qux', 7],
  ['foo', 'zap', 10],
]
const Q = 8

function linearFig(): FigStep[] {
  const ts = SETS.map((s) => s[2])
  const vs = SETS.map((s) => s[1])
  const out: FigStep[] = [
    { note: 'set 只是把 (時間, 值) 接在這個 key 的清單後面。題目保證同一個 key 的 set 時間嚴格遞增,所以清單天生就是依時間排好的', views: [kv([['foo', `${SETS.length} 筆`]], 'store'), arr(ts, { label: 'store["foo"] 的時間' }), arr(vs, { label: '對應的值' })] },
  ]
  for (let i = ts.length - 1; i >= 0; i--) {
    const ok = ts[i] <= Q
    out.push({ note: `get("foo", ${Q}):從最後一筆往前找,時間 ${ts[i]} ${ok ? `≤ ${Q} → 回傳 "${vs[i]}"` : `> ${Q},太新了,繼續往前`}`, views: [arr(ts, { label: '時間', highlight: ok ? [i] : [], compare: ok ? [] : [i] }), arr(vs, { label: '值', highlight: ok ? [i] : [] })] })
    if (ok) break
  }
  return out
}

function bsFig(): FigStep[] {
  const ts = SETS.map((s) => s[2])
  const vs = SETS.map((s) => s[1])
  let lo = 0
  let hi = ts.length - 1
  let ans = -1
  const out: FigStep[] = [{ note: `get("foo", ${Q}):要找「最後一個時間 ≤ ${Q}」的那筆。時間是遞增的 → 二分搜尋`, views: [arr(ts, { label: '時間', range: [lo, hi] }), arr(vs, { label: '值' })] }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const ok = ts[mid] <= Q
    out.push({
      note: `mid = ${mid},時間 ${ts[mid]} ${ok ? `≤ ${Q}:是一個候選答案(記下 "${vs[mid]}"),但右邊可能有更新的 → lo = mid + 1` : `> ${Q}:太新,答案在左邊 → hi = mid − 1`}`,
      views: [arr(ts, { label: '時間', range: [lo, hi], compare: [mid], pointers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi, color: 'b' }, { name: 'mid', index: mid, color: 'c' }] }), arr(vs, { label: '值', highlight: ok ? [mid] : [] })],
    })
    if (ok) {
      ans = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  out.push({ note: `區間變空,最後記下的候選是時間 ${ts[ans]} 的 "${vs[ans]}" → 回傳它`, views: [arr(ts, { label: '時間', highlight: [ans] }), arr(vs, { label: '值', highlight: [ans] })] })
  return out
}

export const q0981: Solution = {
  id: 981,
  statement:
    '設計一個「有時間的」key-value 儲存:`set(key, value, timestamp)` 記下某個時間點的值;`get(key, timestamp)` 回傳這個 key 在**時間 ≤ timestamp** 的那些紀錄裡,**最新**的那個值;沒有就回傳空字串 `""`。',
  examples: [
    {
      input: 'set("foo","bar",1)、get("foo",1)、get("foo",3)、set("foo","bar2",4)、get("foo",4)、get("foo",5)',
      output: '"bar"、"bar"、"bar2"、"bar2"',
      note: 'get("foo",3) 時只有時間 1 的紀錄 ≤ 3',
    },
  ],
  constraints: [
    '**同一個 key 的 set,timestamp 嚴格遞增** → 每個 key 的紀錄天生就排好了,不用自己排序',
    '最多 2·10⁵ 次呼叫 → get 每次線性掃描,最壞是 O(n²) = 4·10¹⁰,太慢',
  ],
  insight: [
    '先用 Hash Map 依 key 分開:`store[key]` = 這個 key 的 `(時間, 值)` 清單',
    '`get` 要找的是「最後一個時間 ≤ t」—— 在有序清單裡找邊界,就是[[p:binary-search]]',
    '因為 set 的時間保證遞增,只要 append 到尾巴,清單就一直保持有序',
  ],
  approaches: [
    {
      name: 'Hash Map + 從尾巴線性往前找',
      idea: '`store[key]` 存時間遞增的 `(時間, 值)` 清單。`get` 從最後一筆往前找第一個時間 ≤ t 的。',
      steps: ['`set`:`store[key].append((t, value))`', '`get`:從 `store[key]` 尾巴往前,第一個時間 ≤ t 的值就是答案', '找不到 → `""`'],
      figure: { title: `set 時間 1、4、7、10,get("foo", ${Q})`, steps: linearFig() },
      complexity: { time: 'set O(1),get O(k)', space: 'O(n)', why: 'k 是那個 key 的紀錄數。查詢的時間通常比較新的話很快,但最壞要看完整個清單。' },
      verdict: '能寫對但最壞會超時。用來確認資料結構該怎麼存。',
      code: {
        python: `class TimeMap:
    def __init__(self):
        self.store = {}                   # key -> [(時間, 值), ...],時間遞增

    def set(self, key, value, timestamp):
        self.store.setdefault(key, []).append((timestamp, value))

    def get(self, key, timestamp):
        for t, v in reversed(self.store.get(key, [])):
            if t <= timestamp:
                return v
        return ""`,
        c: `// key 用 uthash 存;每個 key 一個動態陣列,存 (時間, 值)
typedef struct { int t; char *v; } Rec;
typedef struct {
    char *key;
    Rec *recs;
    int n, cap;
    UT_hash_handle hh;
} Entry;
typedef struct { Entry *map; } TimeMap;

TimeMap *timeMapCreate() {
    TimeMap *o = malloc(sizeof(TimeMap));
    o->map = NULL;
    return o;
}

void timeMapSet(TimeMap *o, char *key, char *value, int timestamp) {
    Entry *e;
    HASH_FIND_STR(o->map, key, e);
    if (!e) {
        e = calloc(1, sizeof(Entry));
        e->key = strdup(key);
        HASH_ADD_KEYPTR(hh, o->map, e->key, strlen(e->key), e);
    }
    if (e->n == e->cap) e->recs = realloc(e->recs, (e->cap = e->cap ? e->cap * 2 : 4) * sizeof(Rec));
    e->recs[e->n].t = timestamp;
    e->recs[e->n++].v = strdup(value);
}

char *timeMapGet(TimeMap *o, char *key, int timestamp) {
    Entry *e;
    HASH_FIND_STR(o->map, key, e);
    if (e)
        for (int i = e->n - 1; i >= 0; i--)
            if (e->recs[i].t <= timestamp) return e->recs[i].v;
    return "";
}

void timeMapFree(TimeMap *o) {
    Entry *e, *tmp;
    HASH_ITER(hh, o->map, e, tmp) {
        HASH_DEL(o->map, e);
        for (int i = 0; i < e->n; i++) free(e->recs[i].v);
        free(e->recs); free(e->key); free(e);
    }
    free(o);
}`,
        cpp: `class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;   // key -> (時間, 值),時間遞增
public:
    TimeMap() {}

    void set(string key, string value, int timestamp) {
        store[key].push_back({timestamp, value});
    }

    string get(string key, int timestamp) {
        auto it = store.find(key);
        if (it == store.end()) return "";
        auto& v = it->second;
        for (int i = (int)v.size() - 1; i >= 0; i--)
            if (v[i].first <= timestamp) return v[i].second;
        return "";
    }
};`,
        java: `class TimeMap {
    private final Map<String, List<Object[]>> store = new HashMap<>();   // key -> {時間, 值}

    public TimeMap() {}

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new ArrayList<>()).add(new Object[]{timestamp, value});
    }

    public String get(String key, int timestamp) {
        List<Object[]> v = store.getOrDefault(key, List.of());
        for (int i = v.size() - 1; i >= 0; i--)
            if ((int) v.get(i)[0] <= timestamp) return (String) v.get(i)[1];
        return "";
    }
}`,
        javascript: `class TimeMap {
  constructor() {
    this.store = new Map();               // key -> [[時間, 值], ...],時間遞增
  }

  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }

  get(key, timestamp) {
    const v = this.store.get(key) ?? [];
    for (let i = v.length - 1; i >= 0; i--)
      if (v[i][0] <= timestamp) return v[i][1];
    return '';
  }
}`,
      },
    },
    {
      name: 'Hash Map + 二分搜尋',
      idea: '同樣的存法,`get` 改成在時間清單上二分,找「最後一個時間 ≤ t」。',
      steps: ['`set`:append `(t, value)`', '`get`:`lo = 0`、`hi = k − 1`、`ans = ""`', '`time[mid] ≤ t` → `ans = value[mid]`、`lo = mid + 1`(往右找更新的)', '`time[mid] > t` → `hi = mid − 1`', '回傳 `ans`'],
      figure: { title: `set 時間 1、4、7、10,get("foo", ${Q})`, steps: bsFig() },
      complexity: { time: 'set O(1),get O(log k)', space: 'O(n)', why: '查詢在 k 筆紀錄上二分。' },
      verdict: '標準解。「找最後一個 ≤ t」的二分模板:符合條件時記下答案並往右,不符合就往左。等價於 `bisect_right(times, t) − 1`。',
      code: {
        python: `from bisect import bisect_right

class TimeMap:
    def __init__(self):
        self.times = {}                   # key -> [時間, ...]
        self.vals = {}                    # key -> [值, ...]

    def set(self, key, value, timestamp):
        self.times.setdefault(key, []).append(timestamp)
        self.vals.setdefault(key, []).append(value)

    def get(self, key, timestamp):
        ts = self.times.get(key, [])
        i = bisect_right(ts, timestamp) - 1   # 最後一個 <= timestamp
        return self.vals[key][i] if i >= 0 else ""`,
        c: `typedef struct { int t; char *v; } Rec;
typedef struct {
    char *key;
    Rec *recs;
    int n, cap;
    UT_hash_handle hh;
} Entry;
typedef struct { Entry *map; } TimeMap;

TimeMap *timeMapCreate() {
    TimeMap *o = malloc(sizeof(TimeMap));
    o->map = NULL;
    return o;
}

void timeMapSet(TimeMap *o, char *key, char *value, int timestamp) {
    Entry *e;
    HASH_FIND_STR(o->map, key, e);
    if (!e) {
        e = calloc(1, sizeof(Entry));
        e->key = strdup(key);
        HASH_ADD_KEYPTR(hh, o->map, e->key, strlen(e->key), e);
    }
    if (e->n == e->cap) e->recs = realloc(e->recs, (e->cap = e->cap ? e->cap * 2 : 4) * sizeof(Rec));
    e->recs[e->n].t = timestamp;
    e->recs[e->n++].v = strdup(value);
}

char *timeMapGet(TimeMap *o, char *key, int timestamp) {
    Entry *e;
    HASH_FIND_STR(o->map, key, e);
    if (!e) return "";
    int lo = 0, hi = e->n - 1, ans = -1;
    while (lo <= hi) {                    // 最後一個 t <= timestamp
        int mid = lo + (hi - lo) / 2;
        if (e->recs[mid].t <= timestamp) { ans = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    return ans >= 0 ? e->recs[ans].v : "";
}

void timeMapFree(TimeMap *o) {
    Entry *e, *tmp;
    HASH_ITER(hh, o->map, e, tmp) {
        HASH_DEL(o->map, e);
        for (int i = 0; i < e->n; i++) free(e->recs[i].v);
        free(e->recs); free(e->key); free(e);
    }
    free(o);
}`,
        cpp: `class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;
public:
    TimeMap() {}

    void set(string key, string value, int timestamp) {
        store[key].push_back({timestamp, value});
    }

    string get(string key, int timestamp) {
        auto it = store.find(key);
        if (it == store.end()) return "";
        auto& v = it->second;
        // 第一個時間 > timestamp 的位置,前一個就是答案
        auto p = upper_bound(v.begin(), v.end(), timestamp,
                             [](int t, const pair<int, string>& r) { return t < r.first; });
        return p == v.begin() ? "" : prev(p)->second;
    }
};`,
        java: `class TimeMap {
    // TreeMap 是平衡二元搜尋樹,floorEntry 就是「最後一個 <= t」
    private final Map<String, TreeMap<Integer, String>> store = new HashMap<>();

    public TimeMap() {}

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value);
    }

    public String get(String key, int timestamp) {
        TreeMap<Integer, String> m = store.get(key);
        if (m == null) return "";
        Map.Entry<Integer, String> e = m.floorEntry(timestamp);
        return e == null ? "" : e.getValue();
    }
}`,
        javascript: `class TimeMap {
  constructor() {
    this.store = new Map();               // key -> [[時間, 值], ...]
  }

  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }

  get(key, timestamp) {
    const v = this.store.get(key) ?? [];
    let lo = 0, hi = v.length - 1, ans = '';
    while (lo <= hi) {                    // 最後一個時間 <= timestamp
      const mid = (lo + hi) >> 1;
      if (v[mid][0] <= timestamp) {
        ans = v[mid][1];
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return ans;
  }
}`,
      },
    },
  ],
  pitfalls: [
    '找成「第一個 ≥ t」:題目要的是**不晚於** t 的最新值,是「最後一個 ≤ t」',
    '二分找到符合的就直接回傳:右邊可能還有更新、但也 ≤ t 的紀錄,要記下來繼續往右',
    'key 不存在時要回傳 `""`,不能噴錯(Python 的 `self.store[key]` 會 KeyError)',
    '時間比這個 key 的第一筆還早時也要回傳 `""`,`bisect_right − 1` 會得到 −1,要擋掉',
  ],
  followUp: [
    { q: '如果 set 的時間不保證遞增?', a: '就不能直接 append。改用有序結構:Java 的 `TreeMap`(方法二的 Java 版)、C++ 的 `map`,插入和查詢都是 O(log k)。' },
  ],
  check: {
    kind: 'class',
    cls: 'TimeMap',
    cases: [
      {
        ops: ['TimeMap', 'set', 'get', 'get', 'set', 'get', 'get'],
        args: [[], ['foo', 'bar', 1], ['foo', 1], ['foo', 3], ['foo', 'bar2', 4], ['foo', 4], ['foo', 5]],
        out: [null, null, 'bar', 'bar', null, 'bar2', 'bar2'],
      },
      {
        ops: ['TimeMap', ...SETS.map(() => 'set'), 'get', 'get', 'get', 'get', 'get'],
        args: [[], ...SETS.map((s) => [...s]), ['foo', Q], ['foo', 0], ['foo', 10], ['foo', 100], ['bar', 5]],
        out: [null, ...SETS.map(() => null), 'qux', '', 'zap', 'zap', ''],
      },
      {
        ops: ['TimeMap', 'set', 'set', 'get', 'get', 'get'],
        args: [[], ['love', 'high', 10], ['love', 'low', 20], ['love', 5], ['love', 10], ['love', 15]],
        out: [null, null, null, '', 'high', 'high'],
      },
    ],
  },
}
