import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 1396. Design Underground System

function mapFig(): FigStep[] {
  return [
    { note: '兩張表:① 進站中的乘客:id → (進站站名, 時間);② 每條路線的統計:(起站, 終站) → (總時間, 趟數)', views: [kv([], '進站中:id → (站, 時間)'), kv([], '路線 → (總時間, 趟數)')] },
    { note: 'checkIn(45, "Leyton", 3)、checkIn(32, "Paradise", 8):記進第一張表', views: [kv([[45, 'Leyton, 3'], [32, 'Paradise, 8']], '進站中:id → (站, 時間)', [45, 32]), kv([], '路線 → (總時間, 趟數)')] },
    { note: 'checkOut(45, "Waterloo", 15):查出 45 從 Leyton 第 3 分鐘進站 → 這趟 12 分鐘,加進「Leyton→Waterloo」的統計,並把 45 從第一張表刪掉', views: [kv([[32, 'Paradise, 8']], '進站中:id → (站, 時間)'), kv([['Leyton→Waterloo', '12, 1']], '路線 → (總時間, 趟數)', ['Leyton→Waterloo'])] },
    { note: 'getAverageTime("Leyton", "Waterloo") = 總時間 ÷ 趟數。每次查詢都是 O(1),不用重新掃過所有紀錄', views: [kv([['Leyton→Waterloo', '12 ÷ 1 = 12']], '平均')] },
  ]
}

function listFig(): FigStep[] {
  return [
    { note: '偷懶的版本:checkOut 時把每一趟 (起站, 終站, 時間) 都存進一個清單', views: [kv([[0, 'Leyton→Waterloo 12'], [1, 'Paradise→Cambridge 14'], [2, 'Leyton→Waterloo 10']], '所有行程')] },
    { note: 'getAverageTime 時掃過整個清單,挑出符合的加總再平均 → 每次查詢 O(行程數)', views: [kv([[0, 'Leyton→Waterloo 12'], [2, 'Leyton→Waterloo 10']], '符合的行程', [0, 2])] },
  ]
}

export const q1396: Solution = {
  id: 1396,
  plain: '設計捷運的刷卡系統:乘客在某站刷卡進站、在另一站刷卡出站。系統要能回答「從 A 站到 B 站平均要花多久」(只算從 A 進、從 B 出的那些行程)。',
  statement: '設計類別 `UndergroundSystem`:`checkIn(id, stationName, t)` 乘客 id 在時間 t 從某站進站;`checkOut(id, stationName, t)` 乘客在時間 t 從某站出站;`getAverageTime(startStation, endStation)` 回傳所有「從 start 進、從 end 出」行程的平均時間。保證查詢時至少有一趟。',
  examples: [
    { input: 'checkIn(45,"Leyton",3), checkIn(32,"Paradise",8), checkOut(45,"Waterloo",15), checkOut(32,"Cambridge",22), getAverageTime("Paradise","Cambridge")', output: '14.0' },
  ],
  constraints: ['最多 2·10⁴ 次呼叫', '同一個乘客同時只會在一趟行程中'],
  insight: ['進站和出站分兩次呼叫 → 先把進站資訊暫存起來(id → 站名、時間)', '出站時算出這趟的時間,累加到「路線」的統計', '平均只需要「總時間」和「趟數」,不用存每一趟'],
  approaches: [
    {
      name: '兩張 Hash 表(進站中 + 路線統計)',
      idea: '`inside[id] = (站, t)`;checkOut 時 `stats[(起, 終)] += (t − t0, 1)`;查詢回傳 `總時間 / 趟數`。',
      steps: ['checkIn:`inside[id] = (station, t)`', 'checkOut:取出 `(s0, t0) = inside.pop(id)`,`stats[(s0, station)]` 的總時間 += `t − t0`、趟數 += 1', 'getAverageTime:`total / count`'],
      figure: { title: '範例操作', steps: mapFig() },
      complexity: { time: '每個操作 O(1)(不算字串長度)', space: 'O(乘客數 + 路線數)', why: '每次只讀寫一兩個表項。' },
      verdict: '最推薦。設計題的常見套路:把查詢要的答案在更新時就累計好。',
      code: {
        python: `class UndergroundSystem:
    def __init__(self):
        self.inside = {}                      # id → (進站站名, 時間)
        self.stats = {}                       # (起站, 終站) → [總時間, 趟數]

    def checkIn(self, id, stationName, t):
        self.inside[id] = (stationName, t)

    def checkOut(self, id, stationName, t):
        s0, t0 = self.inside.pop(id)
        st = self.stats.setdefault((s0, stationName), [0, 0])
        st[0] += t - t0
        st[1] += 1

    def getAverageTime(self, startStation, endStation):
        total, cnt = self.stats[(startStation, endStation)]
        return total / cnt`,
        c: `typedef struct { int id; char st[16]; int t; UT_hash_handle hh; } In;
typedef struct { char key[40]; long long total; int cnt; UT_hash_handle hh; } Route;
typedef struct { In *in; Route *routes; } UndergroundSystem;

UndergroundSystem *undergroundSystemCreate() { return calloc(1, sizeof(UndergroundSystem)); }

void undergroundSystemCheckIn(UndergroundSystem *o, int id, char *stationName, int t) {
    In *e = malloc(sizeof(In));
    e->id = id; strcpy(e->st, stationName); e->t = t;
    HASH_ADD_INT(o->in, id, e);
}

void undergroundSystemCheckOut(UndergroundSystem *o, int id, char *stationName, int t) {
    In *e;
    HASH_FIND_INT(o->in, &id, e);
    char key[40];
    sprintf(key, "%s->%s", e->st, stationName);   // 路線當字串鍵
    Route *r;
    HASH_FIND_STR(o->routes, key, r);
    if (!r) { r = calloc(1, sizeof(Route)); strcpy(r->key, key); HASH_ADD_STR(o->routes, key, r); }
    r->total += t - e->t;
    r->cnt++;
    HASH_DEL(o->in, e);
    free(e);
}

double undergroundSystemGetAverageTime(UndergroundSystem *o, char *startStation, char *endStation) {
    char key[40];
    sprintf(key, "%s->%s", startStation, endStation);
    Route *r;
    HASH_FIND_STR(o->routes, key, r);
    return (double)r->total / r->cnt;
}

void undergroundSystemFree(UndergroundSystem *o) {
    In *a, *ta; Route *b, *tb;
    HASH_ITER(hh, o->in, a, ta) { HASH_DEL(o->in, a); free(a); }
    HASH_ITER(hh, o->routes, b, tb) { HASH_DEL(o->routes, b); free(b); }
    free(o);
}`,
        cpp: `class UndergroundSystem {
    unordered_map<int, pair<string, int>> inside;
    unordered_map<string, pair<long long, int>> stats;
public:
    UndergroundSystem() {}

    void checkIn(int id, string stationName, int t) { inside[id] = {stationName, t}; }

    void checkOut(int id, string stationName, int t) {
        auto [s0, t0] = inside[id];
        inside.erase(id);
        auto &st = stats[s0 + "->" + stationName];
        st.first += t - t0;
        st.second++;
    }

    double getAverageTime(string startStation, string endStation) {
        auto &st = stats[startStation + "->" + endStation];
        return (double)st.first / st.second;
    }
};`,
        java: `class UndergroundSystem {
    private final Map<Integer, Object[]> inside = new HashMap<>();
    private final Map<String, long[]> stats = new HashMap<>();

    public UndergroundSystem() {}

    public void checkIn(int id, String stationName, int t) {
        inside.put(id, new Object[]{stationName, t});
    }

    public void checkOut(int id, String stationName, int t) {
        Object[] in = inside.remove(id);
        long[] st = stats.computeIfAbsent(in[0] + "->" + stationName, k -> new long[2]);
        st[0] += t - (int) in[1];
        st[1]++;
    }

    public double getAverageTime(String startStation, String endStation) {
        long[] st = stats.get(startStation + "->" + endStation);
        return (double) st[0] / st[1];
    }
}`,
        javascript: `class UndergroundSystem {
  constructor() {
    this.inside = new Map();
    this.stats = new Map();
  }

  checkIn(id, stationName, t) {
    this.inside.set(id, [stationName, t]);
  }

  checkOut(id, stationName, t) {
    const [s0, t0] = this.inside.get(id);
    this.inside.delete(id);
    const key = s0 + '->' + stationName;
    const st = this.stats.get(key) ?? [0, 0];
    st[0] += t - t0;
    st[1]++;
    this.stats.set(key, st);
  }

  getAverageTime(startStation, endStation) {
    const [total, cnt] = this.stats.get(startStation + '->' + endStation);
    return total / cnt;
  }
}`,
      },
    },
    {
      name: '存下每一趟,查詢時再算',
      idea: 'checkOut 時把 (起站, 終站, 時間) 放進清單;getAverageTime 掃整個清單取符合的平均。',
      steps: ['checkIn:同上', 'checkOut:`trips.append((s0, station, t − t0))`', 'getAverageTime:掃 trips,符合的加總、計數,回傳平均'],
      figure: { title: '範例操作', steps: listFig() },
      complexity: { time: '查詢 O(行程數)', space: 'O(行程數)', why: '每趟都存;查詢要全部掃一遍。' },
      verdict: '能過但查詢慢。對照第一種就能看出「先累計好」的價值。',
      code: {
        python: `class UndergroundSystem:
    def __init__(self):
        self.inside = {}
        self.trips = []                       # 每一趟 (起站, 終站, 時間)

    def checkIn(self, id, stationName, t):
        self.inside[id] = (stationName, t)

    def checkOut(self, id, stationName, t):
        s0, t0 = self.inside.pop(id)
        self.trips.append((s0, stationName, t - t0))

    def getAverageTime(self, startStation, endStation):
        ts = [d for a, b, d in self.trips if a == startStation and b == endStation]
        return sum(ts) / len(ts)`,
        c: `typedef struct { int id; char st[16]; int t; UT_hash_handle hh; } In;
typedef struct { char a[16], b[16]; int d; } Trip;
typedef struct { In *in; Trip *trips; int n, cap; } UndergroundSystem;

UndergroundSystem *undergroundSystemCreate() {
    UndergroundSystem *o = calloc(1, sizeof(UndergroundSystem));
    o->cap = 16;
    o->trips = malloc(o->cap * sizeof(Trip));
    return o;
}

void undergroundSystemCheckIn(UndergroundSystem *o, int id, char *stationName, int t) {
    In *e = malloc(sizeof(In));
    e->id = id; strcpy(e->st, stationName); e->t = t;
    HASH_ADD_INT(o->in, id, e);
}

void undergroundSystemCheckOut(UndergroundSystem *o, int id, char *stationName, int t) {
    In *e;
    HASH_FIND_INT(o->in, &id, e);
    if (o->n == o->cap) o->trips = realloc(o->trips, (o->cap *= 2) * sizeof(Trip));
    Trip *tr = &o->trips[o->n++];
    strcpy(tr->a, e->st); strcpy(tr->b, stationName); tr->d = t - e->t;
    HASH_DEL(o->in, e);
    free(e);
}

double undergroundSystemGetAverageTime(UndergroundSystem *o, char *startStation, char *endStation) {
    long long total = 0;
    int cnt = 0;
    for (int i = 0; i < o->n; i++)
        if (!strcmp(o->trips[i].a, startStation) && !strcmp(o->trips[i].b, endStation)) { total += o->trips[i].d; cnt++; }
    return (double)total / cnt;
}

void undergroundSystemFree(UndergroundSystem *o) {
    In *a, *ta;
    HASH_ITER(hh, o->in, a, ta) { HASH_DEL(o->in, a); free(a); }
    free(o->trips); free(o);
}`,
        cpp: `class UndergroundSystem {
    unordered_map<int, pair<string, int>> inside;
    vector<tuple<string, string, int>> trips;
public:
    UndergroundSystem() {}

    void checkIn(int id, string stationName, int t) { inside[id] = {stationName, t}; }

    void checkOut(int id, string stationName, int t) {
        auto [s0, t0] = inside[id];
        inside.erase(id);
        trips.emplace_back(s0, stationName, t - t0);
    }

    double getAverageTime(string startStation, string endStation) {
        long long total = 0;
        int cnt = 0;
        for (auto &[a, b, d] : trips)
            if (a == startStation && b == endStation) { total += d; cnt++; }
        return (double)total / cnt;
    }
};`,
        java: `class UndergroundSystem {
    private final Map<Integer, Object[]> inside = new HashMap<>();
    private final List<Object[]> trips = new ArrayList<>();

    public UndergroundSystem() {}

    public void checkIn(int id, String stationName, int t) {
        inside.put(id, new Object[]{stationName, t});
    }

    public void checkOut(int id, String stationName, int t) {
        Object[] in = inside.remove(id);
        trips.add(new Object[]{in[0], stationName, t - (int) in[1]});
    }

    public double getAverageTime(String startStation, String endStation) {
        long total = 0;
        int cnt = 0;
        for (Object[] tr : trips)
            if (tr[0].equals(startStation) && tr[1].equals(endStation)) { total += (int) tr[2]; cnt++; }
        return (double) total / cnt;
    }
}`,
        javascript: `class UndergroundSystem {
  constructor() {
    this.inside = new Map();
    this.trips = [];
  }

  checkIn(id, stationName, t) {
    this.inside.set(id, [stationName, t]);
  }

  checkOut(id, stationName, t) {
    const [s0, t0] = this.inside.get(id);
    this.inside.delete(id);
    this.trips.push([s0, stationName, t - t0]);
  }

  getAverageTime(startStation, endStation) {
    let total = 0, cnt = 0;
    for (const [a, b, d] of this.trips)
      if (a === startStation && b === endStation) {
        total += d;
        cnt++;
      }
    return total / cnt;
  }
}`,
      },
    },
  ],
  pitfalls: ['路線 A→B 和 B→A 是不同的路線,鍵要分方向', '整數除法:平均要用浮點數(C/C++/Java 先轉 double)'],
  check: {
    kind: 'class',
    cls: 'UndergroundSystem',
    compare: 'close',
    cases: [
      {
        ops: ['UndergroundSystem', 'checkIn', 'checkIn', 'checkIn', 'checkOut', 'checkOut', 'checkOut', 'getAverageTime', 'getAverageTime', 'checkIn', 'getAverageTime', 'checkOut', 'getAverageTime'],
        args: [[], [45, 'Leyton', 3], [32, 'Paradise', 8], [27, 'Leyton', 10], [45, 'Waterloo', 15], [27, 'Waterloo', 20], [32, 'Cambridge', 22], ['Paradise', 'Cambridge'], ['Leyton', 'Waterloo'], [10, 'Leyton', 24], ['Leyton', 'Waterloo'], [10, 'Waterloo', 38], ['Leyton', 'Waterloo']],
        out: [null, null, null, null, null, null, null, 14.0, 11.0, null, 11.0, null, 12.0],
      },
      {
        ops: ['UndergroundSystem', 'checkIn', 'checkOut', 'getAverageTime', 'checkIn', 'checkOut', 'getAverageTime'],
        args: [[], [10, 'A', 1], [10, 'B', 6], ['A', 'B'], [5, 'B', 7], [5, 'A', 9], ['B', 'A']],
        out: [null, null, null, 5.0, null, null, 2.0],
      },
    ],
  },
}
