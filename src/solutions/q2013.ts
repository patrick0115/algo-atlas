import { range } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 2013. Detect Squares

const ADDS: [number, number][] = [
  [1, 4],
  [4, 1],
  [1, 1],
  [4, 1],
  [2, 6],
  [6, 1],
  [6, 6],
]
const Q: [number, number] = [4, 4]
const MAX = 6

function counter(): Map<string, number> {
  const m = new Map<string, number>()
  for (const [x, y] of ADDS) m.set(`${x},${y}`, (m.get(`${x},${y}`) ?? 0) + 1)
  return m
}

/** 座標平面畫成網格:上面是 y 大、左邊是 x 小;格子裡寫這個點被加了幾次 */
function plane(m: Map<string, number>, marks: Record<string, [number, number][]> = {}): GridViewData {
  const toCell = ([x, y]: [number, number]): Cell => [MAX - y, x]
  const cells: (number | string)[][] = range(0, MAX).map((r) => range(0, MAX).map((x) => m.get(`${x},${MAX - r}`) ?? ''))
  const q = toCell(Q)
  if (cells[q[0]][q[1]] === '') cells[q[0]][q[1]] = '?'
  return {
    kind: 'grid',
    label: '座標平面(格子裡的數字 = 這個點加了幾次,? = 查詢點)',
    cells,
    rowLabels: range(0, MAX).map((r) => `y=${MAX - r}`),
    colLabels: range(0, MAX).map((x) => `x=${x}`),
    marks: Object.fromEntries(Object.entries(marks).map(([k, ps]) => [k, ps.map(toCell)])),
  }
}

function diagFig(): FigStep[] {
  const m = counter()
  const [qx, qy] = Q
  const out: FigStep[] = [
    { note: 'add 只做一件事:把這個點的次數 +1(同一個點可以加很多次)。下圖是加完 7 個點的樣子', views: [plane(m), kv([...m].map(([k, v]) => [`(${k})`, v]), 'cnt(點 → 次數)')] },
    { note: `count(${qx}, ${qy}):查詢點當正方形的一個角。只要決定「對角」那個點,另外兩個角就跟著確定了`, views: [plane(m, { hl: [Q] })] },
  ]
  let total = 0
  for (const [k, c] of m) {
    const [x, y] = k.split(',').map(Number)
    const ok = Math.abs(x - qx) === Math.abs(y - qy) && x !== qx
    if (!ok) {
      out.push({ note: `(${x},${y}) 當對角?|Δx| = ${Math.abs(x - qx)}、|Δy| = ${Math.abs(y - qy)}${x === qx ? ',面積是 0' : ',不相等'} → 不是正方形,跳過`, views: [plane(m, { hl: [Q], dim: [[x, y]] })] })
      continue
    }
    const a = m.get(`${x},${qy}`) ?? 0
    const b = m.get(`${qx},${y}`) ?? 0
    total += c * a * b
    out.push({
      note: `(${x},${y}) 當對角:|Δx| = |Δy| = ${Math.abs(x - qx)} ✓。另外兩角 (${x},${qy}) 有 ${a} 個、(${qx},${y}) 有 ${b} 個 → ${c} × ${a} × ${b} = ${c * a * b} 個正方形,累計 ${total}`,
      views: [plane(m, { hl: [Q], cmp: [[x, y]], dep: [[x, qy], [qx, y]] })],
    })
  }
  out.push({ note: `所有點都試過當對角,答案 = ${total}。(4,1) 加了兩次,所以同一個位置的正方形算兩個`, views: [plane(m, { hl: [Q], done: [[1, 1], [1, 4], [4, 1]] })] })
  return out
}

function colFig(): FigStep[] {
  const m = counter()
  const [qx, qy] = Q
  const ys = [...new Set(ADDS.filter(([x]) => x === qx).map(([, y]) => y))]
  const out: FigStep[] = [
    { note: `另一種列舉方式:正方形一定有一個角和查詢點**在同一條直線 x = ${qx} 上**。所以只要看 x = ${qx} 這一行有哪些點`, views: [plane(m, { hl: [Q], path: range(0, MAX).map((y) => [qx, y] as [number, number]) })] },
  ]
  let total = 0
  for (const y of ys) {
    if (y === qy) continue
    const d = y - qy
    out.push({ note: `(${qx},${y}) 在同一行,邊長 = |${y} − ${qy}| = ${Math.abs(d)}。正方形可以往左或往右長`, views: [plane(m, { hl: [Q], cmp: [[qx, y]] })] })
    for (const x of [qx + d, qx - d]) {
      if (x < 0 || x > MAX) {
        out.push({ note: `往 x = ${x}:超出範圍,跳過`, views: [plane(m, { hl: [Q], cmp: [[qx, y]] })] })
        continue
      }
      const a = m.get(`${qx},${y}`) ?? 0
      const b = m.get(`${x},${qy}`) ?? 0
      const c = m.get(`${x},${y}`) ?? 0
      total += a * b * c
      out.push({
        note: `往 x = ${x}:需要 (${x},${qy}) 有 ${b} 個、(${x},${y}) 有 ${c} 個 → ${a} × ${b} × ${c} = ${a * b * c},累計 ${total}`,
        views: [plane(m, { hl: [Q], cmp: [[qx, y]], dep: [[x, qy], [x, y]] })],
      })
    }
  }
  out.push({ note: `答案 = ${total},和枚舉對角的結果一樣,但只看了同一行的點`, views: [plane(m, { hl: [Q] })] })
  return out
}

export const q2013: Solution = {
  id: 2013,
  statement:
    '設計一個資料結構,支援兩個操作:`add(point)` 加入平面上的一個點(同一個點可以重複加,每次都算一個);`count(point)` 回傳有幾種方式,從已加入的點挑 3 個,和查詢點一起組成**邊和座標軸平行、面積大於 0 的正方形**。',
  examples: [
    {
      input: 'add [3,10]、add [11,2]、add [3,2]、count [11,10]、count [14,8]、add [11,2]、count [11,10]',
      output: '1、0、2',
      note: '第二次 count 前 [11,2] 又加了一次,同樣的正方形就有兩種挑法',
    },
  ],
  constraints: [
    '座標 `0 ≤ x, y ≤ 1000` → 可以開 1001×1001 的陣列計數,不一定要 Hash Map',
    '`add` 和 `count` 合計最多 3000 次 → 每次 `count` 做 O(點數) 或 O(1000) 都很輕鬆',
    '邊要和座標軸平行 → 正方形的四個角只有兩種 x、兩種 y,不會是斜的',
  ],
  insight: [
    '重複的點要分開算 → 存「每個點出現幾次」,配對時用**乘法**:每個角各挑一個,挑法相乘',
    '查詢點 `(qx, qy)` 是一個角。**只要再決定一個點,正方形就定了**:',
    '方法一:決定**對角** `(x, y)`,條件是 `|x − qx| == |y − qy| ≠ 0`,另外兩角是 `(x, qy)`、`(qx, y)`',
    '方法二:決定**同一行**(x 相同)的那個角 `(qx, y)`,邊長 `d = y − qy`,正方形往左或往右長,另外兩角是 `(qx ± d, qy)`、`(qx ± d, y)`',
  ],
  approaches: [
    {
      name: 'Hash Map 計數 + 枚舉對角點',
      idea: '`cnt[(x, y)]` 記每個點的次數。查詢時把每個出現過的點都試當對角,符合正方形條件就把另外兩角的次數相乘。',
      steps: ['`add`:`cnt[(x, y)] += 1`', '`count(qx, qy)`:走過 `cnt` 裡每個 `(x, y)`', '`|x − qx| != |y − qy|` 或 `x == qx`(面積 0)→ 跳過', '`ans += cnt[(x,y)] × cnt[(x,qy)] × cnt[(qx,y)]`'],
      figure: { title: '加入 7 個點後 count(4, 4)', steps: diagFig() },
      complexity: { time: 'add O(1),count O(m)', space: 'O(m)', why: 'm 是不同點的個數。count 要把每個點試一次,每次查兩個角 O(1)。' },
      verdict: '最直覺的寫法,NeetCode 的標準解。缺點是每次 count 都要看全部的點,點很多時比較慢。',
      code: {
        python: `class DetectSquares:
    def __init__(self):
        self.cnt = {}                       # (x, y) -> 次數

    def add(self, point):
        p = tuple(point)
        self.cnt[p] = self.cnt.get(p, 0) + 1

    def count(self, point):
        qx, qy = point
        res = 0
        for (x, y), c in self.cnt.items():
            if abs(x - qx) != abs(y - qy) or x == qx:
                continue                    # 不是正方形的對角,或面積為 0
            res += c * self.cnt.get((x, qy), 0) * self.cnt.get((qx, y), 0)
        return res`,
        c: `// 座標只到 1000:用 x * 1001 + y 當 key,開陣列計數;另存一份「出現過的點」清單
#define W 1001
typedef struct {
    int *cnt;           // cnt[x * W + y]
    int *keys, n, cap;  // 出現過的點(不重複)
} DetectSquares;

DetectSquares *detectSquaresCreate() {
    DetectSquares *o = malloc(sizeof(DetectSquares));
    o->cnt = calloc(W * W, sizeof(int));
    o->cap = 16; o->n = 0;
    o->keys = malloc(o->cap * sizeof(int));
    return o;
}

void detectSquaresAdd(DetectSquares *o, int *point, int pointSize) {
    int k = point[0] * W + point[1];
    if (o->cnt[k]++ == 0) {
        if (o->n == o->cap) o->keys = realloc(o->keys, (o->cap *= 2) * sizeof(int));
        o->keys[o->n++] = k;
    }
}

int detectSquaresCount(DetectSquares *o, int *point, int pointSize) {
    int qx = point[0], qy = point[1], res = 0;
    for (int i = 0; i < o->n; i++) {
        int x = o->keys[i] / W, y = o->keys[i] % W;
        if (abs(x - qx) != abs(y - qy) || x == qx) continue;
        res += o->cnt[o->keys[i]] * o->cnt[x * W + qy] * o->cnt[qx * W + y];
    }
    return res;
}

void detectSquaresFree(DetectSquares *o) {
    free(o->cnt); free(o->keys); free(o);
}`,
        cpp: `class DetectSquares {
    map<pair<int, int>, int> cnt;           // (x, y) -> 次數
public:
    DetectSquares() {}

    void add(vector<int> point) {
        cnt[{point[0], point[1]}]++;
    }

    int count(vector<int> point) {
        int qx = point[0], qy = point[1], res = 0;
        for (auto& [p, c] : cnt) {
            auto [x, y] = p;
            if (abs(x - qx) != abs(y - qy) || x == qx) continue;
            auto a = cnt.find({x, qy}), b = cnt.find({qx, y});   // 用 find,不要用 [] 以免插入新的點
            if (a != cnt.end() && b != cnt.end()) res += c * a->second * b->second;
        }
        return res;
    }
};`,
        java: `class DetectSquares {
    private final Map<Long, Integer> cnt = new HashMap<>();   // key = x * 1001 + y

    private static long key(int x, int y) { return (long) x * 1001 + y; }

    public DetectSquares() {}

    public void add(int[] point) {
        cnt.merge(key(point[0], point[1]), 1, Integer::sum);
    }

    public int count(int[] point) {
        int qx = point[0], qy = point[1], res = 0;
        for (var e : cnt.entrySet()) {
            int x = (int) (e.getKey() / 1001), y = (int) (e.getKey() % 1001);
            if (Math.abs(x - qx) != Math.abs(y - qy) || x == qx) continue;
            res += e.getValue() * cnt.getOrDefault(key(x, qy), 0) * cnt.getOrDefault(key(qx, y), 0);
        }
        return res;
    }
}`,
        javascript: `class DetectSquares {
  constructor() {
    this.cnt = new Map();                 // "x,y" -> 次數
  }

  add([x, y]) {
    const k = x + ',' + y;
    this.cnt.set(k, (this.cnt.get(k) ?? 0) + 1);
  }

  count([qx, qy]) {
    let res = 0;
    for (const [k, c] of this.cnt) {
      const [x, y] = k.split(',').map(Number);
      if (Math.abs(x - qx) !== Math.abs(y - qy) || x === qx) continue;
      res += c * (this.cnt.get(x + ',' + qy) ?? 0) * (this.cnt.get(qx + ',' + y) ?? 0);
    }
    return res;
  }
}`,
      },
    },
    {
      name: '依 x 分組 + 只看同一行',
      idea: '另外記「每條直線 x 上有哪些 y」。查詢時只看和查詢點同一行(x 相同)的點,由它決定邊長,再往左右兩邊找另外兩角。',
      steps: ['`add`:`cnt[x][y] += 1`(兩層 map,或 1001×1001 陣列)', '`count(qx, qy)`:走過 `cnt[qx]` 裡每個 `y ≠ qy`', '`d = y − qy`,對 `x2` 分別是 `qx + d`、`qx − d`', '`ans += cnt[qx][y] × cnt[x2][qy] × cnt[x2][y]`'],
      figure: { title: '加入 7 個點後 count(4, 4)', steps: colFig() },
      complexity: { time: 'add O(1),count O(k)', space: 'O(m)', why: 'k 是和查詢點同一行的不同點數,通常遠小於全部的點數 m。每個候選查 4 次 map,都是 O(1)。' },
      verdict: '點很多、分散在不同行時明顯更快。把「固定一個角」從對角換成同一行的角,是這題的優化關鍵。',
      code: {
        python: `from collections import defaultdict

class DetectSquares:
    def __init__(self):
        self.cnt = defaultdict(lambda: defaultdict(int))   # cnt[x][y] = 次數

    def add(self, point):
        x, y = point
        self.cnt[x][y] += 1

    def count(self, point):
        qx, qy = point
        if qx not in self.cnt:
            return 0
        res = 0
        for y, c in self.cnt[qx].items():
            if y == qy:
                continue
            d = y - qy
            for x in (qx + d, qx - d):
                if x in self.cnt:
                    res += c * self.cnt[x].get(qy, 0) * self.cnt[x].get(y, 0)
        return res`,
        c: `// cnt 開成 1001×1001 陣列;另外每個 x 記一串出現過的 y,count 只走這一串
#define W 1001
typedef struct {
    int cnt[W][W];
    int *ys[W], n[W], cap[W];     // ys[x] = 直線 x 上出現過的 y(不重複)
} DetectSquares;

DetectSquares *detectSquaresCreate() {
    return calloc(1, sizeof(DetectSquares));
}

void detectSquaresAdd(DetectSquares *o, int *point, int pointSize) {
    int x = point[0], y = point[1];
    if (o->cnt[x][y]++ == 0) {
        if (o->n[x] == o->cap[x]) {
            o->cap[x] = o->cap[x] ? o->cap[x] * 2 : 4;
            o->ys[x] = realloc(o->ys[x], o->cap[x] * sizeof(int));
        }
        o->ys[x][o->n[x]++] = y;
    }
}

int detectSquaresCount(DetectSquares *o, int *point, int pointSize) {
    int qx = point[0], qy = point[1], res = 0;
    for (int i = 0; i < o->n[qx]; i++) {
        int y = o->ys[qx][i], d = y - qy;
        if (d == 0) continue;
        int xs[2] = {qx + d, qx - d};
        for (int j = 0; j < 2; j++) {
            int x = xs[j];
            if (x < 0 || x >= W) continue;
            res += o->cnt[qx][y] * o->cnt[x][qy] * o->cnt[x][y];
        }
    }
    return res;
}

void detectSquaresFree(DetectSquares *o) {
    for (int x = 0; x < W; x++) free(o->ys[x]);
    free(o);
}`,
        cpp: `class DetectSquares {
    unordered_map<int, unordered_map<int, int>> cnt;   // cnt[x][y] = 次數

    int get(int x, int y) {
        auto ix = cnt.find(x);
        if (ix == cnt.end()) return 0;
        auto iy = ix->second.find(y);
        return iy == ix->second.end() ? 0 : iy->second;
    }
public:
    DetectSquares() {}

    void add(vector<int> point) {
        cnt[point[0]][point[1]]++;
    }

    int count(vector<int> point) {
        int qx = point[0], qy = point[1], res = 0;
        auto col = cnt.find(qx);
        if (col == cnt.end()) return 0;
        for (auto& [y, c] : col->second) {
            if (y == qy) continue;
            int d = y - qy;
            for (int x : {qx + d, qx - d})
                res += c * get(x, qy) * get(x, y);
        }
        return res;
    }
};`,
        java: `class DetectSquares {
    private final Map<Integer, Map<Integer, Integer>> cnt = new HashMap<>();   // cnt[x][y] = 次數

    private int get(int x, int y) {
        Map<Integer, Integer> col = cnt.get(x);
        return col == null ? 0 : col.getOrDefault(y, 0);
    }

    public DetectSquares() {}

    public void add(int[] point) {
        cnt.computeIfAbsent(point[0], k -> new HashMap<>()).merge(point[1], 1, Integer::sum);
    }

    public int count(int[] point) {
        int qx = point[0], qy = point[1], res = 0;
        Map<Integer, Integer> col = cnt.get(qx);
        if (col == null) return 0;
        for (var e : col.entrySet()) {
            int y = e.getKey(), d = y - qy;
            if (d == 0) continue;
            for (int x : new int[]{qx + d, qx - d})
                res += e.getValue() * get(x, qy) * get(x, y);
        }
        return res;
    }
}`,
        javascript: `class DetectSquares {
  constructor() {
    this.cnt = new Map();                 // x -> (y -> 次數)
  }

  get(x, y) {
    return this.cnt.get(x)?.get(y) ?? 0;
  }

  add([x, y]) {
    if (!this.cnt.has(x)) this.cnt.set(x, new Map());
    const col = this.cnt.get(x);
    col.set(y, (col.get(y) ?? 0) + 1);
  }

  count([qx, qy]) {
    const col = this.cnt.get(qx);
    if (!col) return 0;
    let res = 0;
    for (const [y, c] of col) {
      if (y === qy) continue;
      const d = y - qy;
      for (const x of [qx + d, qx - d]) res += c * this.get(x, qy) * this.get(x, y);
    }
    return res;
  }
}`,
      },
    },
  ],
  pitfalls: [
    '忘了排除**面積 0**:對角點和查詢點同一個 x(或同一個 y)時,`|Δx| = |Δy| = 0` 也會相等,要另外擋掉 `x == qx`',
    '重複的點要用**乘法**:每個角都可以從它的多個副本中挑一個,不是只算 1',
    'C++ 用 `cnt[{x, y}]` 查詢會偷偷插入一個次數 0 的點,如果正在走訪同一個 map 還會讓迭代器失效;查詢要用 `find`',
    '方法二要同時試往左(`qx − d`)和往右(`qx + d`)兩個方向,只試一邊會少算',
  ],
  followUp: [
    { q: '如果正方形可以是斜的?', a: '那就要枚舉另一個點當「相鄰角」,用向量旋轉 90° 算出另外兩角,每次 count O(m)。' },
    { q: '同類型的設計題?', a: '「計數 + 固定一個角 / 一個點去配對」也出現在 939. Minimum Area Rectangle、149. Max Points on a Line。' },
  ],
  check: {
    kind: 'class',
    cls: 'DetectSquares',
    cases: [
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'count', 'count', 'add', 'count'],
        args: [[], [[3, 10]], [[11, 2]], [[3, 2]], [[11, 10]], [[14, 8]], [[11, 2]], [[11, 10]]],
        out: [null, null, null, null, 1, 0, null, 2],
      },
      {
        ops: ['DetectSquares', ...ADDS.map(() => 'add'), 'count', 'count', 'count'],
        args: [[], ...ADDS.map((p) => [p]), [Q], [[1, 1]], [[0, 0]]],
        out: [null, ...ADDS.map(() => null), 2, 0, 0],
      },
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'count'],
        args: [[], [[5, 5]], [[5, 5]], [[5, 5]], [[5, 5]]],
        out: [null, null, null, null, 0],
      },
    ],
  },
}
